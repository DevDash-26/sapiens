import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { User, Role } from '../types/contract';
import { sendError } from '../utils/envelope';
import { config } from '../config';

export interface AuthenticatedUser extends User {
  uid: string; // Salon Evo compatibility alias
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  token?: admin.auth.DecodedIdToken;
  role?: Role;
}

/**
 * Resolves user document from Firestore
 */
export async function getFirestoreUser(uid: string): Promise<User | null> {
  const doc = await admin.firestore().collection('users').doc(uid).get();
  if (!doc.exists) return null;
  return doc.data() as User;
}

/**
 * Header-Based Bearer Token Authentication Middleware (Salon Evo Style).
 * Strictly validates 'Authorization: Bearer <token>' header, verifies Firebase ID Token,
 * checks Firestore user document status, and attaches authenticated user to req.user.
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  // 1. Support Demo Mode bypass header for zero-token judging/presentation testing
  if (config.demoMode && req.headers['x-demo-uid']) {
    const demoUid = req.headers['x-demo-uid'] as string;
    try {
      const userDoc = await getFirestoreUser(demoUid);
      if (userDoc) {
        if (userDoc.status === 'suspended') {
          sendError(res, 'FORBIDDEN', 'Account has been deactivated by an admin.', 403);
          return;
        }
        const authUser: AuthenticatedUser = {
          ...userDoc,
          uid: userDoc.id,
        };
        req.user = authUser;
        req.role = userDoc.role;
        return next();
      }
    } catch (err: any) {
      console.error('Demo user lookup error:', err);
      sendError(res, 'INTERNAL', 'Failed to verify demo user in Firestore.', 500);
      return;
    }
  }

  // 2. Strict Authorization header check
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(
      res,
      'UNAUTHENTICATED',
      "Authorization header missing. Expected 'Bearer <token>'.",
      401
    );
    return;
  }

  const idToken = authHeader.split('Bearer ')[1].trim();
  let uid: string;
  let email: string | undefined;
  let decodedToken: admin.auth.DecodedIdToken;

  // 3. Verify Firebase ID Token
  try {
    decodedToken = await admin.auth().verifyIdToken(idToken);
    uid = decodedToken.uid;
    email = decodedToken.email;
    req.token = decodedToken;
  } catch (error) {
    const err = error as Error;
    sendError(
      res,
      'UNAUTHENTICATED',
      err.message || 'Firebase ID Token is expired, malformed, or invalid.',
      401
    );
    return;
  }

  // 4. Verify Firestore user document and active account state
  try {
    const userDoc = await getFirestoreUser(uid);

    if (!userDoc) {
      sendError(
        res,
        'FORBIDDEN',
        'Firebase Auth UID exists but no Firestore /users document found.',
        403
      );
      return;
    }

    if (userDoc.status === 'suspended') {
      sendError(
        res,
        'FORBIDDEN',
        'Account has been deactivated by an admin.',
        403
      );
      return;
    }

    const roleFromClaim = (decodedToken.role as Role) || userDoc.role;
    const authUser: AuthenticatedUser = {
      ...userDoc,
      uid: userDoc.id,
      email: email || userDoc.email,
      role: roleFromClaim,
    };

    req.user = authUser;
    req.role = roleFromClaim;

    next();
  } catch (error) {
    const err = error as Error;
    console.error('Firestore user lookup error:', err);
    sendError(
      res,
      'INTERNAL',
      err.message || 'Failed to verify user document in Firestore.',
      500
    );
    return;
  }
};

/**
 * Middleware factory to enforce Role-Based Access Control (RBAC).
 * Supports both rest parameters: requireRoles('admin', 'manager')
 * and array parameter: requireRoles(['admin', 'manager']).
 */
export const requireRoles = (...allowedRoles: (Role | Role[])[]) => {
  const flatRoles = allowedRoles.flat() as Role[];
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(
        res,
        'UNAUTHENTICATED',
        'User context missing. Ensure authenticateToken middleware is used.',
        401
      );
      return;
    }

    if (!flatRoles.includes(req.user.role)) {
      sendError(
        res,
        'FORBIDDEN',
        `Role '${req.user.role}' is not authorized to access this resource.`,
        403
      );
      return;
    }

    next();
  };
};

// Aliases for compatibility
export const requireRole = requireRoles;
export const requireAuth = authenticateToken;
