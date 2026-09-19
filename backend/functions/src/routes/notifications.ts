import { Router, Response } from 'express';
import * as admin from 'firebase-admin';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/envelope';
import { Notification } from '../types/contract';

const router = Router();
router.use(requireAuth);

// GET /notifications - returns notification inbox (§5.13)
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { unread, limit = '20' } = req.query as Record<string, string>;
  const db = admin.firestore();
  const maxLimit = Math.min(parseInt(limit, 10) || 20, 50);

  let query: admin.firestore.Query = db
    .collection('notifications')
    .where('uid', '==', user.id);

  const snapshot = await query.limit(50).get();
  let notifications = snapshot.docs.map((d) => d.data() as Notification);

  // Sort descending by createdAt
  notifications.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  if (unread === 'true') {
    notifications = notifications.filter((n) => !n.readAt);
  }

  const paged = notifications.slice(0, maxLimit);

  sendSuccess(res, paged, 200, {
    count: paged.length,
    unreadCount,
    nextCursor: paged.length === maxLimit ? paged[paged.length - 1].id : null,
  });
});

// POST /notifications/read - mark specific or all notifications as read (§5.13)
router.post('/read', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { ids, all } = req.body as { ids?: string[]; all?: boolean };
  const db = admin.firestore();
  const nowUtc = new Date().toISOString();

  if (!all && (!ids || !Array.isArray(ids) || ids.length === 0)) {
    sendError(res, 'VALIDATION_ERROR', "Either 'all: true' or a non-empty 'ids' array is required.", 400);
    return;
  }

  const batch = db.batch();
  let updatedCount = 0;

  if (all) {
    const unreadSnap = await db
      .collection('notifications')
      .where('uid', '==', user.id)
      .where('readAt', '==', null)
      .limit(50)
      .get();

    for (const doc of unreadSnap.docs) {
      batch.update(doc.ref, { readAt: nowUtc });
      updatedCount++;
    }
  } else if (ids) {
    for (const id of ids) {
      const docRef = db.collection('notifications').doc(id);
      const doc = await docRef.get();
      if (doc.exists && doc.data()?.uid === user.id) {
        batch.update(docRef, { readAt: nowUtc });
        updatedCount++;
      }
    }
  }

  await batch.commit();
  sendSuccess(res, { updatedCount, readAt: nowUtc });
});

export default router;
