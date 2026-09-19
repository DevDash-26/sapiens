import { Router, Response } from 'express';
import * as admin from 'firebase-admin';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/envelope';
import { Room, Booking } from '../types/contract';

const router = Router();
router.use(requireAuth);

// GET /rooms - list rooms (§5.7)
router.get('/', async (_req: AuthenticatedRequest, res: Response) => {
  const db = admin.firestore();
  try {
    const snap = await db.collection('rooms').where('status', '==', 'active').get();
    const rooms = snap.docs.map((d) => d.data() as Room);
    return sendSuccess(res, rooms);
  } catch (err: any) {
    console.error('Error fetching rooms:', err);
    return sendError(res, 'INTERNAL', 'Failed to fetch rooms.', 500);
  }
});

// GET /bookings - list bookings (§5.7)
router.get('/bookings', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { mine, roomId, date } = req.query as Record<string, string>;
  const db = admin.firestore();

  try {
    let query: admin.firestore.Query = db.collection('bookings');
    const isStaff = ['super_admin', 'admin', 'manager'].includes(user.role);

    if (mine === 'true' || !isStaff) {
      query = query.where('uid', '==', user.id);
    }
    if (roomId) query = query.where('roomId', '==', roomId);

    const snap = await query.orderBy('startsAt', 'asc').limit(100).get();
    let bookings = snap.docs.map((d) => d.data() as Booking);

    if (date) {
      bookings = bookings.filter((b) => b.startsAt.startsWith(date));
    }

    return sendSuccess(res, bookings);
  } catch (err: any) {
    console.error('Error fetching bookings:', err);
    return sendError(res, 'INTERNAL', 'Failed to fetch bookings.', 500);
  }
});

// POST /bookings - create booking (§5.7)
router.post('/bookings', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { roomId, startsAt, endsAt, purpose, attendees } = req.body;

  if (!roomId || !startsAt || !endsAt || !purpose) {
    return sendError(res, 'VALIDATION_ERROR', 'roomId, startsAt, endsAt, and purpose are required.', 400);
  }

  const db = admin.firestore();
  try {
    // Check room capacity and active status
    const roomDoc = await db.collection('rooms').doc(roomId).get();
    if (!roomDoc.exists) {
      return sendError(res, 'NOT_FOUND', 'Room not found.', 404);
    }
    const room = roomDoc.data() as Room;
    if (room.status !== 'active' || !room.bookable) {
      return sendError(res, 'CONFLICT', 'Room is not bookable.', 409);
    }
    if (attendees && attendees > room.capacity) {
      return sendError(res, 'VALIDATION_ERROR', `Room capacity is ${room.capacity}.`, 400);
    }

    const bookingId = `bk_${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    const newBooking: Booking = {
      id: bookingId,
      roomId: room.id,
      roomName: room.name,
      uid: user.id,
      userName: user.displayName || 'Student',
      startsAt,
      endsAt,
      purpose,
      attendees: attendees || 1,
      status: 'confirmed',
      source: 'student',
      slotIds: [`${room.id}_${startsAt}`],
      createdAt: now,
      cancelledAt: null,
      cancelReason: null,
    };

    await db.collection('bookings').doc(bookingId).set(newBooking);
    return sendSuccess(res, newBooking, 201);
  } catch (err: any) {
    console.error('Error creating booking:', err);
    return sendError(res, 'INTERNAL', 'Failed to create booking.', 500);
  }
});

// DELETE /bookings/:id - cancel booking (§5.7)
router.delete('/bookings/:id', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const bookingId = req.params.id;
  const { reason } = req.body || {};
  const db = admin.firestore();

  try {
    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingDoc = await bookingRef.get();
    if (!bookingDoc.exists) {
      return sendError(res, 'NOT_FOUND', 'Booking not found.', 404);
    }

    const booking = bookingDoc.data() as Booking;
    const isStaff = ['super_admin', 'admin', 'manager'].includes(user.role);

    if (booking.uid !== user.id && !isStaff) {
      return sendError(res, 'FORBIDDEN', 'Cannot cancel reservations created by others.', 403);
    }

    const now = new Date().toISOString();
    const updates: Partial<Booking> = {
      status: isStaff && booking.uid !== user.id ? 'cancelled_by_admin' : 'cancelled',
      cancelledAt: now,
      cancelReason: reason || 'Cancelled by user',
    };

    await bookingRef.update(updates);
    return sendSuccess(res, { id: bookingId, ...updates });
  } catch (err: any) {
    console.error('Error cancelling booking:', err);
    return sendError(res, 'INTERNAL', 'Failed to cancel booking.', 500);
  }
});

export default router;
