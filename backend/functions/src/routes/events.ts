import { Router, Response } from 'express';
import * as admin from 'firebase-admin';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/envelope';
import { isContentVisibleToUser } from '../utils/targeting';
import { Content, ContentCard, Interest } from '../types/contract';

const router = Router();
router.use(requireAuth);

function toContentCard(c: Content, userId: string, isInterested = false): ContentCard {
  return {
    id: c.id,
    type: c.type,
    category: c.category,
    title: c.title,
    summary: c.summary,
    imageUrl: c.imageUrl,
    priority: c.priority,
    pinned: c.pinned,
    startsAt: c.startsAt,
    endsAt: c.endsAt,
    allDay: c.allDay,
    venue: c.venue,
    origin: c.origin,
    societyId: c.societyId,
    interestedCount: c.interestedCount || 0,
    audience: c.audience,
    source: c.source,
    updatedAt: c.updatedAt,
    expiresAt: c.expiresAt,
    status: c.status,
    viewer: {
      interested: isInterested,
      canEdit: c.author?.uid === userId,
    },
    shareUrl: `https://ucl-campus.netlify.app/c/${c.id}`,
  };
}

// GET /events - list upcoming events and guest lectures (§5.5)
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { type } = req.query as { type?: string };
  const db = admin.firestore();
  const nowUtc = new Date().toISOString();

  const snap = await db.collection('contents').where('status', '==', 'published').get();
  const contents = snap.docs.map((d) => d.data() as Content);

  const eventItems = contents
    .filter((c) => isContentVisibleToUser(c, user))
    .filter((c) => {
      if (type) return c.type === type;
      return ['event', 'guest_lecture'].includes(c.type);
    })
    .filter((c) => c.startsAt && c.startsAt >= nowUtc)
    .sort((a, b) => (a.startsAt || '').localeCompare(b.startsAt || ''));

  const cards = eventItems.map((c) => toContentCard(c, user.id));
  sendSuccess(res, cards);
});

// PUT /events/:id/interest - idempotent interest toggle (§5.5)
router.put('/:id/interest', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const eventId = req.params.id;
  const db = admin.firestore();

  const eventRef = db.collection('contents').doc(eventId);
  const eventDoc = await eventRef.get();
  if (!eventDoc.exists) {
    sendError(res, 'NOT_FOUND', 'Event not found.', 404);
    return;
  }

  const interestDocId = `${eventId}_${user.id}`;
  const interestRef = db.collection('interests').doc(interestDocId);
  const interestDoc = await interestRef.get();

  let count = (eventDoc.data()?.interestedCount || 0);

  if (!interestDoc.exists) {
    await interestRef.set({
      id: interestDocId,
      eventId,
      uid: user.id,
      createdAt: new Date().toISOString(),
    });
    count++;
    await eventRef.update({ interestedCount: count });
  }

  sendSuccess(res, { eventId, interested: true, interestedCount: count });
});

// DELETE /events/:id/interest - remove interest (§5.5)
router.delete('/:id/interest', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const eventId = req.params.id;
  const db = admin.firestore();

  const eventRef = db.collection('contents').doc(eventId);
  const eventDoc = await eventRef.get();
  if (!eventDoc.exists) {
    sendError(res, 'NOT_FOUND', 'Event not found.', 404);
    return;
  }

  const interestDocId = `${eventId}_${user.id}`;
  const interestRef = db.collection('interests').doc(interestDocId);
  const interestDoc = await interestRef.get();

  let count = (eventDoc.data()?.interestedCount || 0);

  if (interestDoc.exists) {
    await interestRef.delete();
    count = Math.max(0, count - 1);
    await eventRef.update({ interestedCount: count });
  }

  sendSuccess(res, { eventId, interested: false, interestedCount: count });
});

// GET /events/:id/interests - attendee list for event owner / admin (§5.5)
router.get('/:id/interests', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const eventId = req.params.id;
  const db = admin.firestore();

  const eventDoc = await db.collection('contents').doc(eventId).get();
  if (!eventDoc.exists) {
    sendError(res, 'NOT_FOUND', 'Event not found.', 404);
    return;
  }

  const event = eventDoc.data() as Content;
  const canView = event.author.uid === user.id || ['super_admin', 'admin'].includes(user.role);
  if (!canView) {
    sendError(res, 'FORBIDDEN', 'Only event creator or admins can view attendees.', 403);
    return;
  }

  const interestsSnap = await db.collection('interests').where('eventId', '==', eventId).get();
  const attendees: any[] = [];

  for (const doc of interestsSnap.docs) {
    const data = doc.data() as Interest;
    const userSnap = await db.collection('users').doc(data.uid).get();
    if (userSnap.exists) {
      const u = userSnap.data()!;
      attendees.push({
        uid: u.id,
        name: u.displayName,
        faculty: u.faculty,
        yearGroup: u.yearGroup,
      });
    }
  }

  sendSuccess(res, { count: attendees.length, attendees });
});

export default router;
