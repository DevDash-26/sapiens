import { Router, Response } from 'express';
import * as admin from 'firebase-admin';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/envelope';
import { User } from '../types/contract';

const router = Router();
router.use(requireAuth);

// GET /me - returns caller profile, preferences, and permissions (§4.1, §5.0)
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  // Redact internal tokens unless admin
  const sanitized = {
    ...user,
    fcmTokens: undefined,
  };
  sendSuccess(res, sanitized);
});

// POST /me/bootstrap - creates or hydrates profile after sign up (§5.0)
router.post('/bootstrap', async (req: AuthenticatedRequest, res: Response) => {
  const token = req.token!;
  const uid = token.uid;
  const db = admin.firestore();

  const userRef = db.collection('users').doc(uid);
  const existing = await userRef.get();

  if (existing.exists) {
    sendSuccess(res, existing.data() as User);
    return;
  }

  const role = (token.role as any) || 'student';
  const newUser: User = {
    id: uid,
    email: token.email || '',
    displayName: token.name || req.body.displayName || 'Campus User',
    role,
    status: 'active',
    faculty: req.body.faculty || null,
    programme: req.body.programme || null,
    yearGroup: req.body.yearGroup || null,
    studentId: req.body.studentId || null,
    phone: req.body.phone || null,
    smsOptIn: req.body.smsOptIn ?? true,
    societyIds: [],
    department: req.body.department || null,
    alumniGradYear: req.body.alumniGradYear || null,
    fcmTokens: [],
    notifPrefs: {
      push: true,
      categories: { announcement: true, event: true, booking: true, request: true, society: true },
    },
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  await userRef.set(newUser);
  await admin.auth().setCustomUserClaims(uid, { role });

  sendSuccess(res, newUser, 201);
});

// PATCH /me - update profile, phone, SMS opt-in, or notification preferences (§5.0)
router.patch('/', async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.id;
  const allowedUpdates = ['displayName', 'phone', 'smsOptIn', 'notifPrefs'];
  const updateData: Record<string, any> = {};

  for (const field of allowedUpdates) {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  }

  if (Object.keys(updateData).length === 0) {
    sendError(res, 'VALIDATION_ERROR', 'No valid editable fields provided.', 400);
    return;
  }

  const db = admin.firestore();
  await db.collection('users').doc(uid).update(updateData);
  const updatedDoc = await db.collection('users').doc(uid).get();

  sendSuccess(res, updatedDoc.data() as User);
});

// PUT /me/fcm-token - register device for push notifications (§5.0)
router.put('/fcm-token', async (req: AuthenticatedRequest, res: Response) => {
  const { token } = req.body as { token: string };
  if (!token) {
    sendError(res, 'VALIDATION_ERROR', 'FCM token string is required.', 400);
    return;
  }

  const uid = req.user!.id;
  const db = admin.firestore();
  await db.collection('users').doc(uid).update({
    fcmTokens: admin.firestore.FieldValue.arrayUnion(token),
  });

  sendSuccess(res, { registered: true, token });
});

// DELETE /me/fcm-token - unregister device (§5.0)
router.delete('/fcm-token', async (req: AuthenticatedRequest, res: Response) => {
  const { token } = req.body as { token: string };
  if (!token) {
    sendError(res, 'VALIDATION_ERROR', 'FCM token string is required.', 400);
    return;
  }

  const uid = req.user!.id;
  const db = admin.firestore();
  await db.collection('users').doc(uid).update({
    fcmTokens: admin.firestore.FieldValue.arrayRemove(token),
  });

  sendSuccess(res, { unregistered: true, token });
});

export default router;
