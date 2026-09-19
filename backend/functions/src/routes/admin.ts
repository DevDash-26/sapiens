import { Router, Response } from 'express';
import * as admin from 'firebase-admin';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/envelope';
import { User, Role, AuditLog } from '../types/contract';
import { textLk } from '../sms/textLkClient';

const router = Router();
router.use(requireAuth);

// POST /admin/sms/send - manual direct SMS dispatch (§5.13, BR15)
router.post('/sms/send', requireRole(['super_admin', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  const caller = req.user!;
  const { phone, message } = req.body;

  if (!phone || !message) {
    sendError(res, 'VALIDATION_ERROR', 'phone and message are required.', 400);
    return;
  }

  try {
    const result = await textLk.sendSms([phone], message);
    const nowUtc = new Date().toISOString();

    await admin.firestore().collection('auditLogs').add({
      id: 'aud_' + Math.random().toString(36).substr(2, 9),
      actorUid: caller.id,
      actorRole: caller.role,
      action: 'sms.manual_send',
      entity: 'sms',
      entityId: phone,
      summary: `Manual SMS to ${phone} (${result.successfulCount} sent, ${result.failureCount} failed)`,
      ip: req.ip || null,
      at: nowUtc,
    });

    sendSuccess(res, {
      phone,
      message,
      successfulCount: result.successfulCount,
      failureCount: result.failureCount,
      logs: result.logs,
    });
  } catch (err: any) {
    sendError(res, 'INTERNAL', err.message || 'Failed to dispatch manual SMS.', 500);
  }
});

// GET /admin/users - list users with role and status filters (§5.13)
router.get('/users', requireRole(['super_admin', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  const { role, status, q } = req.query as Record<string, string>;
  const db = admin.firestore();

  let query: admin.firestore.Query = db.collection('users');
  if (role) query = query.where('role', '==', role);
  if (status) query = query.where('status', '==', status);

  const snap = await query.limit(50).get();
  let users = snap.docs.map((d) => d.data() as User);

  if (q) {
    const qLower = q.toLowerCase();
    users = users.filter((u) => u.displayName.toLowerCase().includes(qLower) || u.email.toLowerCase().includes(qLower));
  }

  // Redact internal tokens
  const sanitized = users.map((u) => ({ ...u, fcmTokens: [] }));
  sendSuccess(res, sanitized);
});

// POST /admin/users - create new user with temporary password & custom claims (§5.13)
router.post('/users', requireRole(['super_admin', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  const caller = req.user!;
  const { email, displayName, role = 'student', faculty, department } = req.body;

  if (!email || !displayName) {
    sendError(res, 'VALIDATION_ERROR', 'Email and displayName are required.', 400);
    return;
  }

  // Only super_admin can create admin or super_admin
  if (['admin', 'super_admin'].includes(role) && caller.role !== 'super_admin') {
    sendError(res, 'FORBIDDEN', 'Only super_admin can create administrative users.', 403);
    return;
  }

  const tempPassword = 'Temp@' + Math.random().toString(36).substr(2, 8);
  const nowUtc = new Date().toISOString();

  try {
    const userRecord = await admin.auth().createUser({
      email,
      displayName,
      password: tempPassword,
    });

    // Set custom claim
    await admin.auth().setCustomUserClaims(userRecord.uid, { role });

    const newUser: User = {
      id: userRecord.uid,
      email,
      displayName,
      role,
      status: 'active',
      faculty: faculty || null,
      programme: null,
      yearGroup: null,
      studentId: null,
      phone: null,
      smsOptIn: true,
      societyIds: [],
      department: department || null,
      alumniGradYear: null,
      fcmTokens: [],
      notifPrefs: { push: true, categories: {} },
      lastLoginAt: nowUtc,
      createdAt: nowUtc,
    };

    await admin.firestore().collection('users').doc(userRecord.uid).set(newUser);

    // Audit log
    await admin.firestore().collection('auditLogs').add({
      id: 'aud_' + Math.random().toString(36).substr(2, 9),
      actorUid: caller.id,
      actorRole: caller.role,
      action: 'user.create',
      entity: 'users',
      entityId: userRecord.uid,
      summary: `Created user ${email} with role ${role}`,
      ip: req.ip || null,
      at: nowUtc,
    });

    sendSuccess(res, { user: newUser, temporaryPassword: tempPassword }, 201);
  } catch (err: any) {
    sendError(res, 'INTERNAL', err.message || 'Failed to create user.', 500);
  }
});

// PATCH /admin/users/:uid - update role, status, societyIds (§5.13)
router.patch('/users/:targetUid', requireRole(['super_admin', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  const caller = req.user!;
  const targetUid = req.params.targetUid;
  const { role, status, societyIds } = req.body as { role?: Role; status?: any; societyIds?: string[] };

  // Cannot demote yourself
  if (caller.id === targetUid && role && role !== caller.role) {
    sendError(res, 'FORBIDDEN', 'You cannot change your own role.', 403);
    return;
  }

  // Only super_admin can assign admin or super_admin
  if (role && ['admin', 'super_admin'].includes(role) && caller.role !== 'super_admin') {
    sendError(res, 'FORBIDDEN', 'Only super_admin can promote to admin tiers.', 403);
    return;
  }

  const db = admin.firestore();
  const userRef = db.collection('users').doc(targetUid);
  const userDoc = await userRef.get();
  if (!userDoc.exists) {
    sendError(res, 'NOT_FOUND', 'User not found.', 404);
    return;
  }

  const updates: Record<string, any> = {};
  if (role) {
    updates.role = role;
    await admin.auth().setCustomUserClaims(targetUid, { role });
  }
  if (status) updates.status = status;
  if (societyIds) updates.societyIds = societyIds;

  await userRef.update(updates);

  // Audit log
  const nowUtc = new Date().toISOString();
  await db.collection('auditLogs').add({
    id: 'aud_' + Math.random().toString(36).substr(2, 9),
    actorUid: caller.id,
    actorRole: caller.role,
    action: 'user.update',
    entity: 'users',
    entityId: targetUid,
    summary: `Updated user ${targetUid} fields: ${Object.keys(updates).join(', ')}`,
    ip: req.ip || null,
    at: nowUtc,
  });

  const updated = (await userRef.get()).data() as User;
  sendSuccess(res, updated);
});

// GET /admin/audit-logs - audit log trail (§5.13)
router.get('/audit-logs', requireRole(['super_admin', 'admin']), async (_req: AuthenticatedRequest, res: Response) => {
  const db = admin.firestore();
  const snap = await db.collection('auditLogs').orderBy('at', 'desc').limit(50).get();
  const logs = snap.docs.map((d) => d.data() as AuditLog);
  sendSuccess(res, logs);
});

// GET /admin/analytics - metrics and feedback loops (§5.13)
router.get('/analytics', requireRole(['super_admin', 'admin', 'manager']), async (_req: AuthenticatedRequest, res: Response) => {
  const db = admin.firestore();

  const usersSnap = await db.collection('users').get();
  const contentsSnap = await db.collection('contents').get();
  const requestsSnap = await db.collection('requests').get();
  const bookingsSnap = await db.collection('bookings').where('status', '==', 'confirmed').get();
  const aiLogsSnap = await db.collection('aiLogs').get();

  const usersByRole: Record<string, number> = {};
  for (const doc of usersSnap.docs) {
    const r = doc.data().role || 'student';
    usersByRole[r] = (usersByRole[r] || 0) + 1;
  }

  let publishedCount = 0;
  let pendingCount = 0;
  for (const doc of contentsSnap.docs) {
    const s = doc.data().status;
    if (s === 'published') publishedCount++;
    if (s === 'pending_review') pendingCount++;
  }

  let unansweredAi = 0;
  for (const doc of aiLogsSnap.docs) {
    if (doc.data().unanswered) unansweredAi++;
  }

  const analytics = {
    users: {
      total: usersSnap.size,
      byRole: usersByRole,
    },
    contents: {
      published: publishedCount,
      pendingReview: pendingCount,
    },
    requests: {
      open: requestsSnap.docs.filter((d) => d.data().status === 'open').length,
      total: requestsSnap.size,
    },
    bookings: {
      confirmed: bookingsSnap.size,
    },
    ai: {
      totalQuestions: aiLogsSnap.size,
      unansweredCount: unansweredAi,
      unansweredRate: aiLogsSnap.size > 0 ? parseFloat((unansweredAi / aiLogsSnap.size).toFixed(2)) : 0,
    },
  };

  sendSuccess(res, analytics);
});

export default router;
