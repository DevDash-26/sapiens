import { Router, Response } from 'express';
import * as admin from 'firebase-admin';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/envelope';
import { Room, Booking, Alert } from '../types/contract';

const router = Router();
router.use(requireAuth);

// Helper to generate 30-min slot IDs
function generateSlotIds(roomId: string, startsAt: string, endsAt: string): { slotIds: string[]; slotTimes: string[] } {
  const slotIds: string[] = [];
  const slotTimes: string[] = [];
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  const thirtyMins = 30 * 60 * 1000;

  for (let t = start; t < end; t += thirtyMins) {
    const slotDate = new Date(t);
    const isoString = slotDate.toISOString();
    const compactIso = isoString.replace(/[-:]/g, '').split('.')[0] + 'Z';
    slotIds.push(`${roomId}_${compactIso}`);
    slotTimes.push(isoString);
  }

  return { slotIds, slotTimes };
}

// GET /rooms - list active rooms (§5.10)
router.get('/', async (_req: AuthenticatedRequest, res: Response) => {
  const db = admin.firestore();
  const snap = await db.collection('rooms').where('status', '==', 'active').get();
  const rooms = snap.docs.map((d) => d.data() as Room);
  sendSuccess(res, rooms);
});

// GET /rooms/availability - check busy windows and free slots for a date (§5.10)
router.get('/availability', async (req: AuthenticatedRequest, res: Response) => {
  const { date = new Date().toISOString().split('T')[0], roomId } = req.query as Record<string, string>;
  const db = admin.firestore();

  // Check if campus is closed by an active alert covering the date (§6.4)
  const alertsSnap = await db.collection('alerts').where('status', '==', 'active').get();
  let campusClosed = false;

  for (const aDoc of alertsSnap.docs) {
    const alert = aDoc.data() as Alert;
    if (alert.affects?.cancelBookings && alert.affects?.startsAt && alert.affects?.endsAt) {
      if (date >= alert.affects.startsAt.split('T')[0] && date <= alert.affects.endsAt.split('T')[0]) {
        campusClosed = true;
        break;
      }
    }
  }

  let roomsQuery: admin.firestore.Query = db.collection('rooms').where('status', '==', 'active');
  if (roomId) roomsQuery = roomsQuery.where('id', '==', roomId);

  const roomsSnap = await roomsQuery.get();
  const rooms = roomsSnap.docs.map((d) => d.data() as Room);

  const resultRooms: any[] = [];

  for (const room of rooms) {
    if (campusClosed) {
      resultRooms.push({
        room,
        busy: [],
        freeWindows: [],
      });
      continue;
    }

    // Query bookings for room on that date — filter date range in memory to avoid composite index
    const bookingsSnap = await db
      .collection('bookings')
      .where('roomId', '==', room.id)
      .get();

    const dayStart = `${date}T00:00:00.000Z`;
    const dayEnd = `${date}T23:59:59.999Z`;

    const busy = bookingsSnap.docs
      .map((d) => d.data() as Booking)
      .filter((b) => b.status === 'confirmed' && b.startsAt >= dayStart && b.startsAt <= dayEnd)
      .map((b) => ({
        startsAt: b.startsAt,
        endsAt: b.endsAt,
        kind: b.source,
      }));

    // Compute basic free windows based on room open/close time
    const openUtc = `${date}T${room.openTime || '08:00'}:00.000Z`;
    const closeUtc = `${date}T${room.closeTime || '22:00'}:00.000Z`;

    const freeWindows = busy.length === 0 ? [{ startsAt: openUtc, endsAt: closeUtc }] : [];

    resultRooms.push({
      room,
      busy,
      freeWindows,
    });
  }

  sendSuccess(res, {
    date,
    campusClosed,
    rooms: resultRooms,
  });
});

// POST /bookings - double-booking safe instant room reservation with all edge cases (§4.8, §5.10)
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  if (user.role === 'alumni') {
    sendError(res, 'FORBIDDEN', 'Alumni cannot book study rooms.', 403);
    return;
  }

  const { roomId, startsAt, endsAt, purpose, attendees = 1 } = req.body;
  if (!roomId || !startsAt || !endsAt || !purpose) {
    sendError(res, 'VALIDATION_ERROR', 'roomId, startsAt, endsAt, and purpose are required.', 400);
    return;
  }

  const now = Date.now();
  const startTime = new Date(startsAt).getTime();
  const endTime = new Date(endsAt).getTime();

  // 1. PAST_TIME / TOO_SOON check
  if (startTime < now) {
    sendError(res, 'CONFLICT', 'Booking time cannot be in the past.', 409, { reason: 'PAST_TIME' });
    return;
  }

  // 2. Duration check: endsAt > startsAt and max 3 hours (TOO_LONG)
  const durationMinutes = (endTime - startTime) / (60 * 1000);
  if (durationMinutes <= 0 || durationMinutes > 180) {
    sendError(res, 'CONFLICT', 'Booking duration must be between 30 minutes and 3 hours.', 409, { reason: 'TOO_LONG' });
    return;
  }

  // 3. TOO_FAR check: cannot book more than 14 days in advance
  if (startTime - now > 14 * 24 * 60 * 60 * 1000) {
    sendError(res, 'CONFLICT', 'Bookings can only be made up to 14 days in advance.', 409, { reason: 'TOO_FAR' });
    return;
  }

  const db = admin.firestore();

  // 4. CAMPUS_CLOSED check
  const alertsSnap = await db.collection('alerts').where('status', '==', 'active').get();
  for (const aDoc of alertsSnap.docs) {
    const alert = aDoc.data() as Alert;
    if (alert.affects?.cancelBookings && alert.affects?.startsAt && alert.affects?.endsAt) {
      const aStart = new Date(alert.affects.startsAt).getTime();
      const aEnd = new Date(alert.affects.endsAt).getTime();
      if ((startTime >= aStart && startTime <= aEnd) || (endTime >= aStart && endTime <= aEnd)) {
        sendError(res, 'CONFLICT', `Campus is closed during that time: ${alert.title}`, 409, { reason: 'CAMPUS_CLOSED' });
        return;
      }
    }
  }

  // 5. Room details & capacity check
  const roomDoc = await db.collection('rooms').doc(roomId).get();
  if (!roomDoc.exists) {
    sendError(res, 'NOT_FOUND', 'Room not found.', 404);
    return;
  }
  const room = roomDoc.data() as Room;

  if (attendees > room.capacity) {
    sendError(res, 'CONFLICT', `Attendees (${attendees}) exceeds room capacity (${room.capacity}).`, 409, { reason: 'CAPACITY_EXCEEDED' });
    return;
  }

  // 6. LIMIT_REACHED: max 2 active future bookings per student
  if (user.role === 'student') {
    const existingBookingsSnap = await db
      .collection('bookings')
      .where('uid', '==', user.id)
      .where('status', '==', 'confirmed')
      .get();
    const futureBookings = existingBookingsSnap.docs.filter(
      (d) => d.data().startsAt >= new Date().toISOString()
    );
    if (futureBookings.length >= 2) {
      sendError(res, 'CONFLICT', 'You already have 2 active future bookings (maximum limit reached).', 409, { reason: 'LIMIT_REACHED' });
      return;
    }
  }

  const { slotIds } = generateSlotIds(roomId, startsAt, endsAt);
  const bookingId = 'bk_' + Math.random().toString(36).substr(2, 8);
  const nowUtc = new Date().toISOString();

  try {
    // Transactional double-booking prevention using 30-min slot lock docs (§4.8)
    await db.runTransaction(async (transaction) => {
      for (const slotId of slotIds) {
        const slotRef = db.collection('roomSlots').doc(slotId);
        const slotDoc = await transaction.get(slotRef);
        if (slotDoc.exists) {
          throw new Error('SLOT_TAKEN');
        }
      }

      // Lock slots
      for (const slotId of slotIds) {
        const slotRef = db.collection('roomSlots').doc(slotId);
        transaction.set(slotRef, {
          id: slotId,
          roomId,
          bookingId,
          slotStartUtc: startsAt,
        });
      }

      // Create confirmed booking doc
      const bookingRef = db.collection('bookings').doc(bookingId);
      const newBooking: Booking = {
        id: bookingId,
        roomId,
        roomName: room.name,
        uid: user.id,
        userName: user.displayName,
        startsAt,
        endsAt,
        purpose,
        attendees,
        status: 'confirmed',
        source: user.role === 'student' ? 'student' : 'staff',
        slotIds,
        createdAt: nowUtc,
        cancelledAt: null,
        cancelReason: null,
      };

      transaction.set(bookingRef, newBooking);
    });

    const createdDoc = await db.collection('bookings').doc(bookingId).get();
    sendSuccess(res, createdDoc.data() as Booking, 201);
  } catch (err: any) {
    if (err.message === 'SLOT_TAKEN') {
      // Find alternative room or next slot
      const nextStart = new Date(endTime).toISOString();
      const nextEnd = new Date(endTime + (endTime - startTime)).toISOString();
      sendError(res, 'CONFLICT', 'That time slot is no longer available.', 409, {
        reason: 'SLOT_TAKEN',
        alternatives: [
          { roomId, startsAt: nextStart, endsAt: nextEnd },
        ],
      });
      return;
    }
    console.error('Booking error:', err);
    sendError(res, 'INTERNAL', 'Failed to complete room reservation.', 500);
  }
});

// GET /bookings - list my bookings (§5.10)
router.get('/my', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const db = admin.firestore();

  const snap = await db
    .collection('bookings')
    .where('uid', '==', user.id)
    .orderBy('startsAt', 'asc')
    .get();

  const bookings = snap.docs
    .map((d) => d.data() as Booking)
    .filter((b) => b.status === 'confirmed');
  sendSuccess(res, bookings);
});

// DELETE /bookings/:id - cancel booking and release slot locks (§5.10)
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const id = req.params.id;
  const db = admin.firestore();

  const ref = db.collection('bookings').doc(id);
  const doc = await ref.get();
  if (!doc.exists) {
    sendError(res, 'NOT_FOUND', 'Booking not found.', 404);
    return;
  }

  const booking = doc.data() as Booking;
  if (booking.uid !== user.id && !['super_admin', 'admin', 'manager'].includes(user.role)) {
    sendError(res, 'FORBIDDEN', 'You cannot cancel this booking.', 403);
    return;
  }

  const batch = db.batch();
  batch.update(ref, {
    status: 'cancelled',
    cancelledAt: new Date().toISOString(),
    cancelReason: req.body?.reason || 'User cancelled',
  });

  // Release slot lock docs
  for (const slotId of booking.slotIds || []) {
    batch.delete(db.collection('roomSlots').doc(slotId));
  }

  await batch.commit();
  const updatedDoc = await ref.get();
  sendSuccess(res, updatedDoc.data() as Booking);
});

export default router;
