import { Router, Response } from 'express';
import * as admin from 'firebase-admin';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';
import { sendSuccess } from '../utils/envelope';
import { isContentVisibleToUser } from '../utils/targeting';
import { Content, ContentCard, Alert } from '../types/contract';

const router = Router();
router.use(requireAuth);

function toContentCard(c: Content, userId: string): ContentCard {
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
      interested: false,
      canEdit: c.author?.uid === userId,
    },
    shareUrl: `https://ucl-campus.netlify.app/c/${c.id}`,
  };
}

// GET /feed - Unified home feed in one round trip (BR1, BR2, §5.1)
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const db = admin.firestore();
  const nowUtc = new Date().toISOString();

  // 1. Fetch active alerts (max 3, newest first)
  const alertsSnap = await db
    .collection('alerts')
    .where('status', '==', 'active')
    .orderBy('publishedAt', 'desc')
    .limit(3)
    .get();
  const alerts: Alert[] = alertsSnap.docs.map((d) => d.data() as Alert);

  // 2. Query published contents
  const contentsSnap = await db
    .collection('contents')
    .where('status', '==', 'published')
    .limit(80)
    .get();

  const allPublished = contentsSnap.docs
    .map((d) => d.data() as Content)
    .filter((c) => {
      if (c.publishAt && c.publishAt > nowUtc) return false;
      if (c.expiresAt && c.expiresAt <= nowUtc) return false;
      return true;
    });

  // Filter based on visibility
  const visible = allPublished.filter((c) => isContentVisibleToUser(c, user));

  // Partition into For You and University
  const forYou = visible
    .filter((c) => !c.audience.all && !['event', 'calendar', 'opportunity'].includes(c.type))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (b.publishAt || '').localeCompare(a.publishAt || ''))
    .slice(0, 10)
    .map((c) => toContentCard(c, user.id));

  const university = visible
    .filter((c) => c.audience.all && !['event', 'calendar', 'opportunity'].includes(c.type))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (b.publishAt || '').localeCompare(a.publishAt || ''))
    .slice(0, 10)
    .map((c) => toContentCard(c, user.id));

  // 3. Upcoming Events
  const upcomingEvents = visible
    .filter((c) => ['event', 'guest_lecture'].includes(c.type) && c.startsAt && c.startsAt >= nowUtc)
    .sort((a, b) => (a.startsAt || '').localeCompare(b.startsAt || ''))
    .slice(0, 5)
    .map((c) => toContentCard(c, user.id));

  // 4. Next Calendar items
  const nextCalendar = visible
    .filter((c) => c.type === 'calendar' && c.startsAt && c.startsAt >= nowUtc)
    .sort((a, b) => (a.startsAt || '').localeCompare(b.startsAt || ''))
    .slice(0, 5)
    .map((c) => ({
      id: c.id,
      kind: 'calendar',
      category: c.category,
      title: c.title,
      allDay: c.allDay,
      startsAt: c.startsAt,
      endsAt: c.endsAt,
      source: c.source,
      updatedAt: c.updatedAt,
    }));

  // 5. Personal snapshot for user
  const unreadNotifsSnap = await db
    .collection('notifications')
    .where('uid', '==', user.id)
    .where('readAt', '==', null)
    .limit(10)
    .get();

  const bookingsSnap = await db
    .collection('bookings')
    .where('uid', '==', user.id)
    .limit(20)
    .get();

  const upcomingBookingsCount = bookingsSnap.docs
    .map((d) => d.data())
    .filter((b: any) => b.status === 'confirmed' && b.startsAt >= nowUtc).length;

  const me = {
    unreadNotifications: unreadNotifsSnap.size,
    upcomingBookings: upcomingBookingsCount,
    societyRequestsPending: 0,
  };

  sendSuccess(res, {
    alerts,
    forYou,
    university,
    upcomingEvents,
    nextCalendar,
    me,
  });
});

export default router;
