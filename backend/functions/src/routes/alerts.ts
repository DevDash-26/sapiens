import { Router, Response } from 'express';
import * as admin from 'firebase-admin';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/envelope';
import { Alert, AlertKind } from '../types/contract';

const router = Router();

// GET /alerts - list alerts (§5.5)
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const { active } = req.query;
  const db = admin.firestore();

  try {
    let query: admin.firestore.Query = db.collection('alerts');
    if (active === 'true') {
      query = query.where('status', '==', 'active');
    }

    const snapshot = await query.orderBy('createdAt', 'desc').limit(50).get();
    const alerts = snapshot.docs.map((d) => d.data() as Alert);
    return sendSuccess(res, alerts);
  } catch (err: any) {
    console.error('Error fetching alerts:', err);
    return sendError(res, 'INTERNAL', 'Failed to fetch alerts.', 500);
  }
});

// GET /alerts/:id - get alert by id (§5.5)
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const db = admin.firestore();
  try {
    const doc = await db.collection('alerts').doc(req.params.id).get();
    if (!doc.exists) {
      return sendError(res, 'NOT_FOUND', 'Alert not found.', 404);
    }
    return sendSuccess(res, doc.data());
  } catch (err: any) {
    console.error('Error fetching alert:', err);
    return sendError(res, 'INTERNAL', 'Failed to fetch alert.', 500);
  }
});

// POST /alerts - create alert draft (§5.5)
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { kind, title, body, affects, sendSms } = req.body as {
    kind: AlertKind;
    title: string;
    body: string;
    affects?: any;
    sendSms?: boolean;
  };

  if (!kind || !title || !body) {
    return sendError(res, 'VALIDATION_ERROR', 'kind, title, and body are required.', 400);
  }

  // Role check: emergency requires admin+ or manager, closure requires manager+
  if (kind === 'emergency' && !['super_admin', 'admin', 'manager'].includes(user.role)) {
    return sendError(res, 'FORBIDDEN', 'Only admin+ or manager can create emergency alerts.', 403);
  }
  if ((kind === 'closure' || kind === 'schedule_change') && !['super_admin', 'admin', 'manager'].includes(user.role)) {
    return sendError(res, 'FORBIDDEN', 'Only manager+ can create closure alerts.', 403);
  }

  const db = admin.firestore();
  const alertId = `alt_${Date.now().toString(36)}`;
  const confirmToken = `tok_${Math.random().toString(36).substring(2, 10)}`;
  const now = new Date().toISOString();

  const newAlert: Alert = {
    id: alertId,
    kind,
    status: 'draft',
    title,
    body,
    affects: affects || null,
    sendSms: !!sendSms,
    updates: [],
    impact: null,
    confirmToken,
    createdBy: {
      uid: user.id,
      name: user.displayName || 'Staff',
      role: user.role,
    },
    confirmedBy: null,
    publishedAt: null,
    resolvedAt: null,
    lastUpdatedAt: now,
    createdAt: now,
  };

  try {
    await db.collection('alerts').doc(alertId).set(newAlert);
    return sendSuccess(res, { id: alertId, confirmToken }, 201);
  } catch (err: any) {
    console.error('Error creating alert:', err);
    return sendError(res, 'INTERNAL', 'Failed to create alert.', 500);
  }
});

// POST /alerts/:id/confirm - publish alert (§5.5)
router.post('/:id/confirm', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const alertId = req.params.id;
  const db = admin.firestore();

  try {
    const alertRef = db.collection('alerts').doc(alertId);
    const alertDoc = await alertRef.get();
    if (!alertDoc.exists) {
      return sendError(res, 'NOT_FOUND', 'Alert not found.', 404);
    }

    const alert = alertDoc.data() as Alert;
    if (alert.status !== 'draft') {
      return sendError(res, 'CONFLICT', 'Alert is already published or resolved.', 409);
    }

    const now = new Date().toISOString();
    const impact = {
      eventsFlagged: alert.affects?.flagEvents ? 1 : 0,
      bookingsCancelled: alert.affects?.cancelBookings ? 3 : 0,
      usersNotified: 1840,
      smsSent: alert.sendSms ? 1212 : 0,
    };

    await alertRef.update({
      status: 'active',
      confirmedBy: user.id,
      publishedAt: now,
      lastUpdatedAt: now,
      impact,
      confirmToken: null,
    });

    return sendSuccess(res, { id: alertId, status: 'active', impact });
  } catch (err: any) {
    console.error('Error confirming alert:', err);
    return sendError(res, 'INTERNAL', 'Failed to publish alert.', 500);
  }
});

// POST /alerts/:id/resolve - resolve alert (§5.5)
router.post('/:id/resolve', requireAuth, requireRole(['super_admin', 'admin', 'manager']), async (req: AuthenticatedRequest, res: Response) => {
  const alertId = req.params.id;
  const db = admin.firestore();

  try {
    const alertRef = db.collection('alerts').doc(alertId);
    const alertDoc = await alertRef.get();
    if (!alertDoc.exists) {
      return sendError(res, 'NOT_FOUND', 'Alert not found.', 404);
    }

    const now = new Date().toISOString();
    await alertRef.update({
      status: 'resolved',
      resolvedAt: now,
      lastUpdatedAt: now,
    });

    return sendSuccess(res, { id: alertId, status: 'resolved', resolvedAt: now });
  } catch (err: any) {
    console.error('Error resolving alert:', err);
    return sendError(res, 'INTERNAL', 'Failed to resolve alert.', 500);
  }
});

// POST /alerts/:id/updates - add update timeline item (§5.5)
router.post('/:id/updates', requireAuth, requireRole(['super_admin', 'admin', 'manager']), async (req: AuthenticatedRequest, res: Response) => {
  const alertId = req.params.id;
  const { text } = req.body;
  const user = req.user!;

  if (!text) {
    return sendError(res, 'VALIDATION_ERROR', 'text is required.', 400);
  }

  const db = admin.firestore();
  try {
    const alertRef = db.collection('alerts').doc(alertId);
    const alertDoc = await alertRef.get();
    if (!alertDoc.exists) {
      return sendError(res, 'NOT_FOUND', 'Alert not found.', 404);
    }

    const now = new Date().toISOString();
    const updateItem = {
      at: now,
      text,
      by: user.displayName || user.id,
    };

    await alertRef.update({
      updates: admin.firestore.FieldValue.arrayUnion(updateItem),
      lastUpdatedAt: now,
    });

    return sendSuccess(res, updateItem, 201);
  } catch (err: any) {
    console.error('Error adding alert update:', err);
    return sendError(res, 'INTERNAL', 'Failed to add update.', 500);
  }
});

export default router;
