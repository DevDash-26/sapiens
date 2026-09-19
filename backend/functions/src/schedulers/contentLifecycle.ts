import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

// publishScheduled - runs every 1 minute to transition scheduled content (§6.2, §7.3)
export const publishScheduled = functions
  .region('asia-south1')
  .pubsub
  .schedule('every 1 minutes')
  .onRun(async () => {
    const db = admin.firestore();
    const nowUtc = new Date().toISOString();

    const snapshot = await db
      .collection('contents')
      .where('status', '==', 'scheduled')
      .where('publishAt', '<=', nowUtc)
      .limit(50)
      .get();

    if (snapshot.empty) return null;

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        status: 'published',
        updatedAt: nowUtc,
      });
    });

    await batch.commit();
    console.log(`Published ${snapshot.size} scheduled content items.`);
    return null;
  });

// expireContent - runs every 5 minutes to expire past content (§6.2, §7.3)
export const expireContent = functions
  .region('asia-south1')
  .pubsub
  .schedule('every 5 minutes')
  .onRun(async () => {
    const db = admin.firestore();
    const nowUtc = new Date().toISOString();

    const snapshot = await db
      .collection('contents')
      .where('status', '==', 'published')
      .where('expiresAt', '<=', nowUtc)
      .limit(50)
      .get();

    if (snapshot.empty) return null;

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        status: 'expired',
        updatedAt: nowUtc,
      });
    });

    await batch.commit();
    console.log(`Expired ${snapshot.size} content items.`);
    return null;
  });

// cleanupSlots - runs daily to remove outdated roomSlots locks (§7.3)
export const cleanupSlots = functions
  .region('asia-south1')
  .pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    const db = admin.firestore();
    const yesterdayUtc = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const snapshot = await db
      .collection('roomSlots')
      .where('slotStartUtc', '<=', yesterdayUtc)
      .limit(200)
      .get();

    if (snapshot.empty) return null;

    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    console.log(`Cleaned up ${snapshot.size} outdated roomSlots.`);
    return null;
  });
