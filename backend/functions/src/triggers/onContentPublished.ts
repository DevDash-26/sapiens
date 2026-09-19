import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { Content, User } from '../types/contract';
import { isContentVisibleToUser } from '../utils/targeting';

export const onContentPublished = functions.firestore
  .document('contents/{contentId}')
  .onWrite(async (change, context) => {
    const after = change.after.exists ? (change.after.data() as Content) : null;
    const before = change.before.exists ? (change.before.data() as Content) : null;

    if (!after) return null; // deleted

    // Only trigger when transitioning to published
    const justPublished = after.status === 'published' && (!before || before.status !== 'published');
    if (!justPublished) return null;

    // Only fan out if high priority or announcement (§6.3)
    if (after.priority !== 'high' && after.type !== 'announcement') return null;

    const db = admin.firestore();
    const nowUtc = new Date().toISOString();

    const usersSnap = await db.collection('users').get();
    const batch = db.batch();
    let count = 0;

    for (const doc of usersSnap.docs) {
      const u = doc.data() as User;
      if (isContentVisibleToUser(after, u)) {
        const notifRef = db.collection('notifications').doc();
        batch.set(notifRef, {
          id: notifRef.id,
          uid: u.id,
          type: 'announcement',
          title: after.title,
          body: after.summary,
          refType: 'content',
          refId: context.params.contentId,
          channels: ['inbox', 'push'],
          readAt: null,
          createdAt: nowUtc,
        });
        count++;
        if (count >= 400) break; // stay within single commit limit
      }
    }

    if (count > 0) {
      await batch.commit();
      console.log(`Fanned out ${count} notifications for content ${context.params.contentId}`);
    }

    return null;
  });
