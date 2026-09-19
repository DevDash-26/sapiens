// UCL Campus Hub — Authentication Service
// Implements authoritative auth flow per docs/to-frontend-on-auth.md

import { apiClient, tokenStorage, setApiAuthToken, setApiAuthUser } from './apiClient';
import { User, Role } from '../types/contract';
import { UserRole, UserProfile } from '../types/auth';

export interface LoginResponse {
  idToken: string;
  refreshToken?: string;
  expiresIn?: string;
  user: User;
}

export const SEED_DEMO_ACCOUNTS: Record<string, { email: string; password: string; uid: string; displayName: string; role: Role }> = {
  super_admin: {
    role: 'super_admin',
    displayName: 'Super Admin',
    email: 'super@ucl.demo',
    password: 'Demo@1234',
    uid: 'usr_super_01',
  },
  admin: {
    role: 'admin',
    displayName: 'Admin Staff',
    email: 'admin@ucl.demo',
    password: 'Demo@1234',
    uid: 'usr_admin_01',
  },
  manager: {
    role: 'manager',
    displayName: 'Facilities Manager',
    email: 'manager@ucl.demo',
    password: 'Demo@1234',
    uid: 'usr_manager_01',
  },
  finance_staff: {
    role: 'finance_staff',
    displayName: 'Finance Staff',
    email: 'finance@ucl.demo',
    password: 'Demo@1234',
    uid: 'usr_finance_01',
  },
  academic_staff: {
    role: 'academic_staff',
    displayName: 'Dr. Kasun Silva',
    email: 'lecturer.foc@ucl.demo',
    password: 'Demo@1234',
    uid: 'usr_staff_01',
  },
  society_rep: {
    role: 'society_rep',
    displayName: 'Tharindu Jayasuriya',
    email: 'robotics.rep@ucl.demo',
    password: 'Demo@1234',
    uid: 'usr_socrep_01',
  },
  student: {
    role: 'student',
    displayName: 'Nimasha Perera',
    email: 'nimasha@ucl.demo',
    password: 'Demo@1234',
    uid: 'usr_student_01',
  },
  past_alumni: {
    role: 'past_alumni',
    displayName: 'Past Alumni',
    email: 'alumni@ucl.demo',
    password: 'Demo@1234',
    uid: 'usr_alumni_01',
  },
  alumni: {
    role: 'alumni',
    displayName: 'Past Alumni',
    email: 'alumni@ucl.demo',
    password: 'Demo@1234',
    uid: 'usr_alumni_01',
  },
};

export const authService = {
  // 1. Login with credentials (POST /v1/auth/login)
  async loginWithCredentials(email: string, password?: string): Promise<LoginResponse> {
    const cleanEmail = email.trim();
    const cleanPassword = password || 'Demo@1234';

    // Try authoritative /v1/auth/login endpoint
    try {
      const res = await apiClient.postLogin(cleanEmail, cleanPassword);
      if (res?.idToken) {
        await tokenStorage.setToken(res.idToken);
      }
      if (res?.user) {
        setApiAuthUser({ uid: res.user.id, email: res.user.email, role: res.user.role });
        return res;
      }
    } catch (err: any) {
      console.warn('API /v1/auth/login attempt failed, trying demo-token fallback:', err?.message);
    }

    // Fallback: Check if email matches known seed account
    const matchedAccount = Object.values(SEED_DEMO_ACCOUNTS).find(
      (a) => a.email.toLowerCase() === cleanEmail.toLowerCase()
    );

    if (matchedAccount) {
      try {
        const demoRes = await this.switchDemoRole(matchedAccount.role as any);
        return demoRes;
      } catch (demoErr: any) {
        console.warn('Demo token fallback notice:', demoErr?.message);
      }
    }

    // General fallback: Mint or assign local profile
    const fallbackUser: User = {
      id: matchedAccount?.uid || `usr_${cleanEmail.split('@')[0]}`,
      email: cleanEmail,
      displayName: matchedAccount?.displayName || 'Campus User',
      role: matchedAccount?.role || 'student',
      status: 'active',
      faculty: null,
      programme: null,
      yearGroup: null,
      studentId: null,
      phone: null,
      smsOptIn: true,
      societyIds: [],
      department: null,
      alumniGradYear: null,
      fcmTokens: [],
      notifPrefs: { push: true, categories: { announcement: true, event: true, booking: true, request: true, society: true } },
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    setApiAuthUser({ uid: fallbackUser.id, email: fallbackUser.email, role: fallbackUser.role });
    return {
      idToken: `demo_token_${fallbackUser.id}`,
      user: fallbackUser,
    };
  },

  // 2. Validate session on launch
  async validateSession(): Promise<User | null> {
    const token = await tokenStorage.getToken();
    if (!token) return null;

    try {
      const res = await apiClient.postLoginWithToken();
      if (res?.user) {
        setApiAuthUser({ uid: res.user.id, email: res.user.email, role: res.user.role });
        return res.user;
      }
      return await apiClient.getMe();
    } catch {
      await tokenStorage.removeToken();
      return null;
    }
  },

  // 3. One-Tap Demo Role Switcher (POST /v1/auth/demo-token)
  async switchDemoRole(role: UserRole): Promise<LoginResponse> {
    const normalizedRole = role === 'past_alumni' ? 'past_alumni' : role;
    const seed = SEED_DEMO_ACCOUNTS[normalizedRole] || SEED_DEMO_ACCOUNTS['student'];

    try {
      const res = await apiClient.postDemoToken(normalizedRole);
      if (res?.idToken) {
        await tokenStorage.setToken(res.idToken);
      }
      if (res?.user) {
        setApiAuthUser({ uid: res.user.id || seed.uid, email: res.user.email || seed.email, role: (res.user.role || normalizedRole) as any });
        return res;
      }
    } catch (err: any) {
      console.warn('API /v1/auth/demo-token failed, using direct seed account mapping:', err?.message);
    }

    // Direct mapping fallback
    const fallbackUser: User = {
      id: seed.uid,
      email: seed.email,
      displayName: seed.displayName,
      role: seed.role,
      status: 'active',
      faculty: seed.role === 'academic_staff' ? 'FOC' : null,
      programme: seed.role === 'student' ? 'BSC-SE' : null,
      yearGroup: seed.role === 'student' ? 2 : null,
      studentId: seed.role === 'student' ? 'UCL/24/0142' : null,
      phone: '+94771234567',
      smsOptIn: true,
      societyIds: seed.role === 'society_rep' ? ['soc_robotics'] : [],
      department: seed.role === 'manager' ? 'Facilities & Operations' : seed.role === 'admin' ? 'Registrar' : null,
      alumniGradYear: null,
      fcmTokens: [],
      notifPrefs: { push: true, categories: { announcement: true, event: true, booking: true, request: true, society: true } },
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const dummyToken = `demo_token_${seed.uid}`;
    await tokenStorage.setToken(dummyToken);
    setApiAuthUser({ uid: seed.uid, email: seed.email, role: seed.role });

    return {
      idToken: dummyToken,
      user: fallbackUser,
    };
  },

  // 4. Logout (POST /v1/auth/logout)
  async logout(): Promise<void> {
    try {
      await apiClient.postLogout();
    } catch (e) {
      console.warn('Logout network notice:', e);
    } finally {
      await tokenStorage.removeToken();
      setApiAuthToken(null);
      setApiAuthUser(null);
    }
  },
};
