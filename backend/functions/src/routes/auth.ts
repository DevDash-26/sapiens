import { Router, Request, Response } from 'express';
import * as admin from 'firebase-admin';
import axios from 'axios';
import { sendSuccess, sendError } from '../utils/envelope';
import { config } from '../config';
import { AuthenticatedRequest, requireAuth, getFirestoreUser } from '../middleware/auth';
import { Role, User } from '../types/contract';

const router = Router();

const FIREBASE_WEB_API_KEY = process.env.WEB_API_KEY || 'AIzaSyC6GpCVef8eoO9Zbd5wihc_wKMUqeGQwo8';

/**
 * POST /auth/login
 * Dual-mode login:
 * 1. Email + Password credentials in body -> authenticates with Firebase Auth, updates lastLoginAt, returns idToken + user profile
 * 2. Bearer <idToken> in Authorization header (or x-demo-uid) -> validates session, updates lastLoginAt, returns user profile
 */
router.post('/login', async (req: AuthenticatedRequest, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  const authHeader = req.headers.authorization;
  const db = admin.firestore();
  const nowIso = new Date().toISOString();

  // Mode 1: Email + Password in request body
  if (email && password) {
    try {
      const response = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_WEB_API_KEY}`,
        { email, password, returnSecureToken: true }
      );

      const { idToken, refreshToken, expiresIn, localId } = response.data;
      const user = await getFirestoreUser(localId);

      if (!user) {
        sendError(res, 'NOT_FOUND', 'Firebase Auth account exists but user record was not found in Firestore.', 404);
        return;
      }

      if (user.status === 'suspended') {
        sendError(res, 'FORBIDDEN', 'This account has been suspended by campus administration.', 403);
        return;
      }

      await db.collection('users').doc(localId).update({ lastLoginAt: nowIso });

      sendSuccess(res, {
        idToken,
        refreshToken,
        expiresIn,
        user: {
          ...user,
          lastLoginAt: nowIso,
          fcmTokens: undefined,
        },
      });
      return;
    } catch (err: any) {
      const fbError = err.response?.data?.error?.message;
      if (fbError === 'EMAIL_NOT_FOUND' || fbError === 'INVALID_PASSWORD' || fbError === 'INVALID_LOGIN_CREDENTIALS') {
        sendError(res, 'UNAUTHENTICATED', 'Invalid email address or password.', 401);
        return;
      }
      console.error('Login error:', err.response?.data || err.message);
      sendError(res, 'INTERNAL', 'Authentication service failure.', 500);
      return;
    }
  }

  // Mode 2: Authorization: Bearer <idToken> in header (Session verification)
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const idToken = authHeader.split('Bearer ')[1].trim();
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const user = await getFirestoreUser(decodedToken.uid);

      if (!user) {
        sendError(res, 'FORBIDDEN', 'Firebase Auth UID exists but no Firestore /users document found.', 403);
        return;
      }

      if (user.status === 'suspended') {
        sendError(res, 'FORBIDDEN', 'Account has been deactivated by an admin.', 403);
        return;
      }

      await db.collection('users').doc(decodedToken.uid).update({ lastLoginAt: nowIso });

      sendSuccess(res, {
        user: {
          ...user,
          lastLoginAt: nowIso,
          fcmTokens: undefined,
        },
      });
      return;
    } catch (err: any) {
      sendError(res, 'UNAUTHENTICATED', err.message || 'Firebase ID Token is expired, malformed, or invalid.', 401);
      return;
    }
  }

  // Mode 3: Demo Mode header bypass
  if (config.demoMode && req.headers['x-demo-uid']) {
    const demoUid = req.headers['x-demo-uid'] as string;
    const user = await getFirestoreUser(demoUid);
    if (user) {
      if (user.status === 'suspended') {
        sendError(res, 'FORBIDDEN', 'Account has been deactivated by an admin.', 403);
        return;
      }
      await db.collection('users').doc(user.id).update({ lastLoginAt: nowIso });
      sendSuccess(res, {
        user: {
          ...user,
          lastLoginAt: nowIso,
          fcmTokens: undefined,
        },
      });
      return;
    }
  }

  // Missing credentials or token
  sendError(res, 'UNAUTHENTICATED', "Authorization header missing. Expected 'Bearer <token>'.", 401);
});

/**
 * POST /auth/logout
 * Revokes Firebase refresh tokens server-side and invalidates active sessions
 */
router.post('/logout', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const uid = req.user!.id;
  const { fcmToken } = req.body as { fcmToken?: string };
  const db = admin.firestore();

  try {
    // Revoke Firebase Auth refresh tokens
    await admin.auth().revokeRefreshTokens(uid);

    // Optionally remove specified push token
    if (fcmToken) {
      await db.collection('users').doc(uid).update({
        fcmTokens: admin.firestore.FieldValue.arrayRemove(fcmToken),
      });
    }

    sendSuccess(res, { message: 'Session revoked successfully.' });
  } catch (err: any) {
    console.error('Logout error:', err);
    sendError(res, 'INTERNAL', 'Failed to revoke user session.', 500);
  }
});

/**
 * POST /auth/demo-token
 * One-tap role switcher token generator for presentations
 */
router.post('/demo-token', async (req: Request, res: Response) => {
  if (!config.demoMode) {
    sendError(res, 'FORBIDDEN', 'Demo token endpoint is disabled in production.', 403);
    return;
  }

  const { role = 'student', uid } = req.body as { role?: Role; uid?: string };

  const DEMO_UID_MAP: Record<Role, string> = {
    super_admin: 'usr_super_01',
    admin: 'usr_admin_01',
    manager: 'usr_mgr_01',
    academic_staff: 'usr_acad_01',
    finance_staff: 'usr_fin_01',
    society_rep: 'usr_rep_01',
    student: 'usr_student_01',
    alumni: 'usr_alum_01',
  };

  const targetUid = uid || DEMO_UID_MAP[role] || 'usr_student_01';

  try {
    const customToken = await admin.auth().createCustomToken(targetUid, { role });
    sendSuccess(res, { customToken, uid: targetUid, role });
  } catch (err: any) {
    console.error('Error generating demo token:', err);
    sendError(res, 'INTERNAL', 'Failed to generate demo token.', 500);
  }
});

export default router;
