import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onIdTokenChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseClient';
import { UserRole, UserProfile, Permission, ROLE_DISPLAY_NAMES } from '../types/auth';
import { hasMinimumRole, hasAnyRole, hasPermission } from '../utils/rbacGuard';

interface AuthRBACContextValue {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  roleDisplayName: string | null;
  loading: boolean;
  hasRole: (minimumRole: UserRole) => boolean;
  hasAnyRole: (allowedRoles: UserRole[]) => boolean;
  hasPermission: (permission: Permission) => boolean;
  refreshRoleClaims: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthRBACContext = createContext<AuthRBACContextValue | undefined>(undefined);

export const AuthRBACProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const extractRoleFromClaimsOrProfile = async (currentUser: User): Promise<UserRole> => {
    try {
      const idTokenResult = await currentUser.getIdTokenResult(true);
      if (idTokenResult.claims.role) {
        return idTokenResult.claims.role as UserRole;
      }
      // Fallback: check Firestore users document
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        if (data.role) return data.role as UserRole;
      }
    } catch (err) {
      console.error('Error fetching role claims:', err);
    }
    return 'student'; // default role fallback
  };

  const refreshRoleClaims = async () => {
    if (!user) return;
    const resolvedRole = await extractRoleFromClaimsOrProfile(user);
    setRole(resolvedRole);
  };

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const resolvedRole = await extractRoleFromClaimsOrProfile(currentUser);
        setRole(resolvedRole);

        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile);
          } else {
            setProfile({
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              role: resolvedRole,
            });
          }
        } catch {
          setProfile({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            role: resolvedRole,
          });
        }
      } else {
        setRole(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
    setRole(null);
  };

  const value: AuthRBACContextValue = {
    user,
    profile,
    role,
    roleDisplayName: role ? ROLE_DISPLAY_NAMES[role] : null,
    loading,
    hasRole: (minRole: UserRole) => hasMinimumRole(role, minRole),
    hasAnyRole: (allowed: UserRole[]) => hasAnyRole(role, allowed),
    hasPermission: (perm: Permission) => hasPermission(role, perm),
    refreshRoleClaims,
    logout,
  };

  return <AuthRBACContext.Provider value={value}>{children}</AuthRBACContext.Provider>;
};

export const useAuthRBAC = (): AuthRBACContextValue => {
  const context = useContext(AuthRBACContext);
  if (!context) {
    throw new Error('useAuthRBAC must be used within an AuthRBACProvider');
  }
  return context;
};
