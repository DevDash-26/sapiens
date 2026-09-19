import { Router, Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/envelope';
import { textLk } from '../sms/textLkClient';
import { Alert, User } from '../types/contract';

const router = Router();

// GET /alerts - active alerts (public, §5.7)
router.get('/', async (req: Request, res: Response) => {
  const { active = 'true', limit = '10' } = req.query as Record<string, string>;
  const db = admin.firestore();

  let query: admin.firestore.Query = db.collection('alerts');
  if (active === 'true') {
    query = query.where('status', '==', 'active');
  }

  const snap = await query.limit(parseInt(limit, 10) || 10).get();
  const alerts = snap.docs
    .map((d) => d.data() as Alert)
    .sort((a, b) => (b.publishedAt || b.createdAt).localeCompare(a.publishedAt || a.createdAt));
  sendSuccess(res, alerts);
});

// POST /alerts - creates draft alert and returns preview + confirmToken (manager+, §5.7)
router.post(
  '/',
  requireAuth,
  requireRole(['super_admin', 'admin', 'manager']),
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const body = req.body;
    const db = admin.firestore();

    if (!body.kind || !body.title || !body.body) {
      sendError(res, 'VALIDATION_ERROR', 'kind, title, and body are required.', 400);
      return;
    }

    if (body.kind === 'emergency' && !['super_admin', 'admin'].includes(user.role)) {
      sendError(res, 'FORBIDDEN', 'Only Super Admin or Admin can create emergency alerts.', 403);
      return;
    }

    const id = 'alt_' + Math.random().toString(36).substr(2, 9);
    const confirmToken = 'cf_' + Math.random().toString(36).substr(2, 12);
    const nowUtc = new Date().toISOString();

    // Calculate impact preview if affects window is set
    let eventsToFlag = 0;
    let bookingsToCancel = 0;

    if (body.affects?.startsAt && body.affects?.endsAt) {
      const { startsAt, endsAt } = body.affects;

      // Check events in window
      const eventsSnap = await db
        .collection('contents')
        .where('status', '==', 'published')
        .where('startsAt', '>=', startsAt)
        .where('startsAt', '<=', endsAt)
        .get();
      eventsToFlag = eventsSnap.size;

      // Check bookings in window
      const bookingsSnap = await db
        .collection('bookings')
        .where('status', '==', 'confirmed')
        .where('startsAt', '>=', startsAt)
        .where('startsAt', '<=', endsAt)
        .get();
      bookingsToCancel = bookingsSnap.size;
    }

    const usersSnap = await db.collection('users').get();
    const usersToNotify = usersSnap.size;
    const smsRecipients = usersSnap.docs.filter((d) => d.data().phone && d.data().smsOptIn !== false).length;

    const alertDoc: Alert = {
      id,
      kind: body.kind,
      status: 'draft',
      title: body.title,
      body: body.body,
      affects: body.affects || null,
      sendSms: body.sendSms ?? (body.kind === 'emergency'),
      updates: [],
      impact: null,
      confirmToken,
      createdBy: {
        uid: user.id,
        name: user.displayName,
        role: user.role,
      },
      confirmedBy: null,
      publishedAt: null,
      resolvedAt: null,
      lastUpdatedAt: nowUtc,
      createdAt: nowUtc,
    };

    await db.collection('alerts').doc(id).set(alertDoc);

    sendSuccess(
      res,
      {
        alert: alertDoc,
        preview: {
          eventsToFlag,
          bookingsToCancel,
          usersToNotify,
          smsRecipients,
        },
        confirmToken,
      },
      201
    );
  }
);

// POST /alerts/:id/confirm - two-step publish with booking cascade & SMS broadcast (§5.7, §6.4)
router.post(
  '/:id/confirm',
  requireAuth,
  requireRole(['super_admin', 'admin', 'manager']),
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const id = req.params.id;
    const { confirmToken } = req.body as { confirmToken: string };
    const db = admin.firestore();

    const ref = db.collection('alerts').doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      sendError(res, 'NOT_FOUND', 'Alert not found.', 404);
      return;
    }

    const alert = snap.data() as Alert;
    if (alert.status !== 'draft') {
      sendError(res, 'CONFLICT', 'Alert has already been confirmed or resolved.', 409);
      return;
    }

    if (alert.confirmToken && alert.confirmToken !== confirmToken) {
      sendError(res, 'VALIDATION_ERROR', 'Invalid confirmation token.', 400);
      return;
    }

    const nowUtc = new Date().toISOString();
    let eventsFlagged = 0;
    let bookingsCancelled = 0;

    // 1. Cascade effects for closure / schedule changes (§6.4)
    if (alert.affects) {
      const { startsAt, endsAt, cancelBookings, flagEvents } = alert.affects;

      if (cancelBookings) {
        const bookingsSnap = await db
          .collection('bookings')
          .where('status', '==', 'confirmed')
          .where('startsAt', '>=', startsAt)
          .where('startsAt', '<=', endsAt)
          .get();

        const cancelBatch = db.batch();
        for (const doc of bookingsSnap.docs) {
          const b = doc.data();
          cancelBatch.update(doc.ref, {
            status: 'cancelled_by_closure',
            cancelledAt: nowUtc,
            cancelReason: `Campus alert: ${alert.title}`,
          });

          // Remove roomSlot locks
          for (const slotId of b.slotIds || []) {
            cancelBatch.delete(db.collection('roomSlots').doc(slotId));
          }

          // Fan out inbox notification
          if (b.uid) {
            const notifRef = db.collection('notifications').doc();
            cancelBatch.set(notifRef, {
              id: notifRef.id,
              uid: b.uid,
              type: 'booking',
              title: 'Booking cancelled due to campus closure',
              body: `Your booking for ${b.roomName} on ${b.startsAt} was cancelled: ${alert.title}`,
              refType: 'booking',
              refId: doc.id,
              channels: ['inbox', 'push'],
              readAt: null,
              createdAt: nowUtc,
            });
          }
          bookingsCancelled++;
        }
        await cancelBatch.commit();
      }

      if (flagEvents) {
        const eventsSnap = await db
          .collection('contents')
          .where('status', '==', 'published')
          .where('startsAt', '>=', startsAt)
          .where('startsAt', '<=', endsAt)
          .get();

        const flagBatch = db.batch();
        for (const doc of eventsSnap.docs) {
          flagBatch.update(doc.ref, {
            'flags.affectedByAlertId': id,
            updatedAt: nowUtc,
          });
          eventsFlagged++;
        }
        await flagBatch.commit();
      }
    }

    // 2. Dispatch Text.lk SMS if enabled (§6.5)
    let smsSent = 0;
    const usersSnap = await db.collection('users').get();
    const phoneList: string[] = [];

    for (const doc of usersSnap.docs) {
      const u = doc.data() as User;
      if (u.phone) {
        if (alert.kind === 'emergency' || u.smsOptIn !== false) {
          phoneList.push(u.phone);
        }
      }
    }

    if (alert.sendSms && phoneList.length > 0) {
      const smsMessage = `UCL ALERT: ${alert.title}. Details: https://ucl-campus.netlify.app/a/${id}`;
      const smsResult = await textLk.sendSms(phoneList, smsMessage, {
        flash: alert.kind === 'emergency',
        alertId: id,
      });
      smsSent = smsResult.successfulCount;
    }

    // 3. Update alert record to active with impact stats
    const impact = {
      eventsFlagged,
      bookingsCancelled,
      usersNotified: usersSnap.size,
      smsSent,
    };

    const updatedAlert: Partial<Alert> = {
      status: 'active',
      confirmedBy: user.id,
      publishedAt: nowUtc,
      lastUpdatedAt: nowUtc,
      confirmToken: null,
      impact,
    };

    await ref.update(updatedAlert);

    // Audit log
    await db.collection('auditLogs').add({
      id: 'aud_' + Math.random().toString(36).substr(2, 9),
      actorUid: user.id,
      actorRole: user.role,
      action: 'alert.confirm',
      entity: 'alerts',
      entityId: id,
      summary: `Confirmed and published alert '${alert.title}'. Bookings cancelled: ${bookingsCancelled}, SMS: ${smsSent}`,
      ip: req.ip || null,
      at: nowUtc,
    });

    sendSuccess(res, { ...alert, ...updatedAlert });
  }
);

// POST /alerts/:id/updates - post update to alert (§5.7)
router.post(
  '/:id/updates',
  requireAuth,
  requireRole(['super_admin', 'admin', 'manager']),
  async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const id = req.params.id;
    const { text } = req.body as { text: string };
    const db = admin.firestore();

    if (!text) {
      sendError(res, 'VALIDATION_ERROR', 'Update text is required.', 400);
      return;
    }

    const ref = db.collection('alerts').doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      sendError(res, 'NOT_FOUND', 'Alert not found.', 404);
      return;
    }

    const nowUtc = new Date().toISOString();
    const updateEntry = {
      at: nowUtc,
      text,
      by: user.displayName,
    };

    await ref.update({
      updates: admin.firestore.FieldValue.arrayUnion(updateEntry),
      lastUpdatedAt: nowUtc,
    });

    const updated = (await ref.get()).data() as Alert;
    sendSuccess(res, updated);
  }
);

// POST /alerts/:id/resolve - resolve alert (§5.7)
router.post(
  '/:id/resolve',
  requireAuth,
  requireRole(['super_admin', 'admin', 'manager']),
  async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id;
    const db = admin.firestore();

    const ref = db.collection('alerts').doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      sendError(res, 'NOT_FOUND', 'Alert not found.', 404);
      return;
    }

    const nowUtc = new Date().toISOString();
    await ref.update({
      status: 'resolved',
      resolvedAt: nowUtc,
      lastUpdatedAt: nowUtc,
    });

    const updated = (await ref.get()).data() as Alert;
    sendSuccess(res, updated);
  }
);

export default router;
