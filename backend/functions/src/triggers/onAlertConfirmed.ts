import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { Alert, User } from '../types/contract';

export const onAlertConfirmed = functions
  .region('asia-south1')
  .firestore.document('alerts/{alertId}')
  .onWrite(async (change, context) => {
    const after = change.after.exists ? (change.after.data() as Alert) : null;
    const before = change.before.exists ? (change.before.data() as Alert) : null;

    if (!after) return null;

    const justActive = after.status === 'active' && (!before || before.status !== 'active');
    if (!justActive) return null;

    const db = admin.firestore();
    const nowUtc = new Date().toISOString();

    const usersSnap = await db.collection('users').get();
    const batch = db.batch();
    let count = 0;

    for (const doc of usersSnap.docs) {
      const u = doc.data() as User;
      const notifRef = db.collection('notifications').doc();
      batch.set(notifRef, {
        id: notifRef.id,
        uid: u.id,
        type: 'alert',
        title: `[ALERT] ${after.title}`,
        body: after.body,
        refType: 'alert',
        refId: context.params.alertId,
        channels: ['inbox', 'push'],
        readAt: null,
        createdAt: nowUtc,
      });
      count++;
      if (count >= 400) break;
    }

    if (count > 0) {
      await batch.commit();
      console.log(`Fanned out ${count} notifications for alert ${context.params.alertId}`);
    }

    return null;
  });
