import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { User, Role } from '../types/contract';
import { sendError } from '../utils/envelope';
import { config } from '../config';

export interface AuthenticatedRequest extends Request {
  user?: User;
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
 * Main auth middleware:
 * Validates Firebase ID token and loads user profile & claims
 */
export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  // Check for Demo Mode bypass header if enabled
  if (config.demoMode && req.headers['x-demo-uid']) {
    const demoUid = req.headers['x-demo-uid'] as string;
    const userDoc = await getFirestoreUser(demoUid);
    if (userDoc) {
      req.user = userDoc;
      req.role = userDoc.role;
      return next();
    }
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const idToken = authHeader.split('Bearer ')[1].trim();
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.token = decodedToken;
    const roleFromClaim = (decodedToken.role as Role) || 'student';
    req.role = roleFromClaim;

    let user = await getFirestoreUser(decodedToken.uid);
    if (!user) {
      // Fallback in case user document is not yet hydrated
      user = {
        id: decodedToken.uid,
        email: decodedToken.email || '',
        displayName: decodedToken.name || '',
        role: roleFromClaim,
        status: 'active',
        faculty: null,
        programme: null,
        yearGroup: null,
        studentId: null,
        phone: null,
        smsOptIn: false,
        societyIds: [],
        department: null,
        alumniGradYear: null,
        fcmTokens: [],
        notifPrefs: { push: true, categories: {} },
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
    }
    req.user = user;
    return next();
  } catch (error) {
    console.warn('Invalid auth token:', error);
    return next();
  }
}

/**
 * Enforces that caller is authenticated
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    sendError(res, 'UNAUTHENTICATED', 'Missing or invalid authentication token.', 401);
    return;
  }
  next();
}

/**
 * Enforces role check (must be in allowed list)
 */
export function requireRole(allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.role) {
      sendError(res, 'UNAUTHENTICATED', 'Authentication required.', 401);
      return;
    }

    if (!allowedRoles.includes(req.role)) {
      sendError(
        res,
        'FORBIDDEN',
        `Role '${req.role}' is not authorized to access this resource.`,
        403
      );
      return;
    }
    next();
  };
}
