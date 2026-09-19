import { Router, Response } from 'express';
import * as admin from 'firebase-admin';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/envelope';
import { User, Role, UserStatus } from '../types/contract';

const router = Router();
router.use(requireAuth);

// GET /users - list users (§5.11)
router.get('/', requireRole(['super_admin', 'admin']), async (_req: AuthenticatedRequest, res: Response) => {
  const db = admin.firestore();
  try {
    const snap = await db.collection('users').limit(100).get();
    const users = snap.docs.map((d) => d.data() as User);
    return sendSuccess(res, users);
  } catch (err: any) {
    console.error('Error fetching users:', err);
    return sendError(res, 'INTERNAL', 'Failed to fetch users.', 500);
  }
});

// PATCH /users/:uid/role - assign user role (§5.11)
router.patch('/:uid/role', requireRole(['super_admin', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  const caller = req.user!;
  const targetUid = req.params.uid;
  const { role } = req.body as { role: Role };

  if (!role) {
    return sendError(res, 'VALIDATION_ERROR', 'role is required.', 400);
  }

  // Admin cannot promote to super_admin or demote a super_admin
  if (role === 'super_admin' && caller.role !== 'super_admin') {
    return sendError(res, 'FORBIDDEN', 'Only super_admin can assign the super_admin role.', 403);
  }

  const db = admin.firestore();
  try {
    const userRef = db.collection('users').doc(targetUid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return sendError(res, 'NOT_FOUND', 'User not found.', 404);
    }

    const targetUser = userDoc.data() as User;
    if (targetUser.role === 'super_admin' && caller.role !== 'super_admin') {
      return sendError(res, 'FORBIDDEN', 'Cannot modify roles of a super_admin.', 403);
    }

    // Update custom claims in Firebase Auth
    try {
      await admin.auth().setCustomUserClaims(targetUid, { role });
    } catch (authErr) {
      console.warn('Could not set custom claim in Firebase Auth:', authErr);
    }

    // Update Firestore user document
    await userRef.update({ role });
    return sendSuccess(res, { uid: targetUid, role });
  } catch (err: any) {
    console.error('Error updating user role:', err);
    return sendError(res, 'INTERNAL', 'Failed to update user role.', 500);
  }
});

// PATCH /users/:uid/status - change user status (§5.11)
router.patch('/:uid/status', requireRole(['super_admin', 'admin']), async (req: AuthenticatedRequest, res: Response) => {
  const targetUid = req.params.uid;
  const { status } = req.body as { status: UserStatus };

  if (!status) {
    return sendError(res, 'VALIDATION_ERROR', 'status is required.', 400);
  }

  const db = admin.firestore();
  try {
    const userRef = db.collection('users').doc(targetUid);
    await userRef.update({ status });
    return sendSuccess(res, { uid: targetUid, status });
  } catch (err: any) {
    console.error('Error updating user status:', err);
    return sendError(res, 'INTERNAL', 'Failed to update user status.', 500);
  }
});

export default router;
