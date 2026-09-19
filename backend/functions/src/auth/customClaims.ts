import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v1';

export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'manager'
  | 'academic_staff'
  | 'finance_staff'
  | 'society_rep'
  | 'student'
  | 'past_alumni';

export const VALID_ROLES: UserRole[] = [
  'super_admin',
  'admin',
  'manager',
  'academic_staff',
  'finance_staff',
  'society_rep',
  'student',
  'past_alumni',
];

/**
 * Assigns custom claims to Firebase Authentication user.
 * This claim is then validated natively in firestore.rules via request.auth.token.role.
 */
export async function setUserRoleClaim(uid: string, role: UserRole): Promise<void> {
  if (!VALID_ROLES.includes(role)) {
    throw new Error(`Invalid role: ${role}. Must be one of ${VALID_ROLES.join(', ')}`);
  }

  const auth = admin.auth();
  const db = admin.firestore();

  // Set Firebase Auth custom claim
  await auth.setCustomUserClaims(uid, { role });

  // Update corresponding Firestore user document
  await db.collection('users').doc(uid).set(
    {
      role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  console.log(`Successfully assigned role "${role}" to user ${uid}`);
}

/**
 * Callable Cloud Function to allow Admins/Super Admins to update user roles
 */
export const setUserRole = functions.https.onCall(async (data: any, context: any) => {
  // Enforce authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const callerRole = context.auth.token.role as UserRole;
  const { targetUid, newRole } = data as { targetUid: string; newRole: UserRole };

  // Only Super Admin or Admin can change roles
  if (callerRole !== 'super_admin' && callerRole !== 'admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only Super Admin or Admin can assign roles.'
    );
  }

  // Only Super Admin can assign the super_admin role
  if (newRole === 'super_admin' && callerRole !== 'super_admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only a Super Admin can promote another user to Super Admin.'
    );
  }

  if (!targetUid || !newRole || !VALID_ROLES.includes(newRole)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `targetUid and a valid role (${VALID_ROLES.join(', ')}) are required.`
    );
  }

  try {
    await setUserRoleClaim(targetUid, newRole);
    return { success: true, targetUid, assignedRole: newRole };
  } catch (error: any) {
    console.error('Error assigning role:', error);
    throw new functions.https.HttpsError('internal', error.message || 'Failed to assign role.');
  }
});

/**
 * Auth Trigger: When a new user signs up, initialize their profile and default claim
 */
export const onUserCreated = functions.auth.user().onCreate(async (user: any) => {
  const defaultRole: UserRole = 'student';
  try {
    await setUserRoleClaim(user.uid, defaultRole);

    await admin.firestore().collection('users').doc(user.uid).set(
      {
        uid: user.uid,
        email: user.email || null,
        displayName: user.displayName || null,
        role: defaultRole,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    console.log(`Initialized user ${user.uid} with default role "${defaultRole}"`);
  } catch (err) {
    console.error(`Error in onUserCreated for ${user.uid}:`, err);
  }
});
