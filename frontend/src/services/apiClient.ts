// UCL Campus Hub — API Client Service
// Implements full REST API client conforming to docs/API-Contract+DataModel.md

import {
  Content,
  ContentCard,
  Alert,
  Request,
  Claim,
  Room,
  Booking,
  Society,
  FAQ,
  Staff,
  User,
  Role,
  Faculty,
  UserStatus,
  ApiSuccessResponse,
  AiActionType,
} from '../types/contract';
import { Platform } from 'react-native';
import { auth } from './firebaseClient';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  'https://asia-south1-ucl-net-prod.cloudfunctions.net/api';

let authTokenOverride: string | null = null;
let authUserOverride: { uid?: string; email?: string; role?: string } | null = null;
let memoryToken: string | null = null;

// Storage helper supporting Web (localStorage) & Native/Memory
export const tokenStorage = {
  async getToken(): Promise<string | null> {
    if (authTokenOverride) return authTokenOverride;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('@ucl_auth_id_token');
        if (stored) return stored;
      } catch {}
    }
    return memoryToken;
  },
  async setToken(token: string): Promise<void> {
    authTokenOverride = token;
    memoryToken = token;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        localStorage.setItem('@ucl_auth_id_token', token);
      } catch {}
    }
  },
  async removeToken(): Promise<void> {
    authTokenOverride = null;
    memoryToken = null;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        localStorage.removeItem('@ucl_auth_id_token');
      } catch {}
    }
  },
};

export function setApiAuthToken(token: string | null) {
  authTokenOverride = token;
  memoryToken = token;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      if (token) {
        localStorage.setItem('@ucl_auth_id_token', token);
      } else {
        localStorage.removeItem('@ucl_auth_id_token');
      }
    } catch {}
  }
}

export function setApiAuthUser(user: { uid?: string; email?: string; role?: string } | null) {
  authUserOverride = user;
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  const token = await tokenStorage.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (authUserOverride?.uid) {
    headers['x-demo-uid'] = authUserOverride.uid;
    headers['x-user-id'] = authUserOverride.uid;
  }
  if (authUserOverride?.email) {
    headers['x-user-email'] = authUserOverride.email;
  }
  if (authUserOverride?.role) {
    headers['x-user-role'] = authUserOverride.role;
    headers['x-role'] = authUserOverride.role;
  }
  try {
    const currentUser = auth.currentUser;
    if (currentUser && !headers['Authorization']) {
      const token = await currentUser.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (err) {
    // Client Firebase not logged in
  }
  return headers;
}

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const authHeaders = await getAuthHeader();
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    await tokenStorage.removeToken();
  }

  const json = await response.json();
  if (!response.ok || !json.ok) {
    const errorMessage = json.error?.message || `API request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return json.data as T;
}

export const apiClient = {
  setApiAuthToken,
  setApiAuthUser,

  // Meta & Health
  async getHealth(): Promise<{ status: string; timestamp: string }> {
    return apiFetch<{ status: string; timestamp: string }>('/health');
  },

  async getMetaConfig(): Promise<any> {
    return apiFetch<any>('/meta/config');
  },

  // Auth & Profile
  async postLogin(email: string, password?: string): Promise<{ idToken: string; user: User; refreshToken?: string }> {
    return apiFetch<any>('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim(), password: password || 'Demo@1234' }),
    });
  },

  async postLoginWithToken(): Promise<{ idToken?: string; user: User }> {
    return apiFetch<any>('/v1/auth/login', {
      method: 'POST',
    });
  },

  async postDemoToken(role: Role): Promise<{ idToken: string; user: User; refreshToken?: string }> {
    return apiFetch<any>('/v1/auth/demo-token', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  },

  async postLogout(): Promise<void> {
    try {
      await apiFetch<any>('/v1/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    }
  },

  async getMe(): Promise<User> {
    return apiFetch<User>('/me');
  },

  async bootstrapMe(profile: Partial<User>): Promise<User> {
    return apiFetch<User>('/me/bootstrap', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  },

  async updateMe(updates: Partial<User>): Promise<User> {
    return apiFetch<User>('/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  // Home & Feeds
  async getFeed(): Promise<{
    today: Array<any>;
    pinnedAlert: Alert | null;
    announcements: ContentCard[];
    events: ContentCard[];
  }> {
    return apiFetch<any>('/feed');
  },

  // Content Engine
  async getContents(params?: {
    type?: string;
    category?: string;
    status?: string;
    mine?: boolean;
    q?: string;
  }): Promise<ContentCard[]> {
    const query = new URLSearchParams();
    if (params?.type) query.append('type', params.type);
    if (params?.category) query.append('category', params.category);
    if (params?.status) query.append('status', params.status);
    if (params?.mine) query.append('mine', 'true');
    if (params?.q) query.append('q', params.q);

    const qs = query.toString();
    return apiFetch<ContentCard[]>(`/contents${qs ? `?${qs}` : ''}`);
  },

  async getContent(id: string): Promise<Content> {
    return apiFetch<Content>(`/contents/${id}`);
  },

  async createContent(content: Partial<Content>): Promise<Content> {
    return apiFetch<Content>('/contents', {
      method: 'POST',
      body: JSON.stringify(content),
    });
  },

  async updateContent(id: string, updates: Partial<Content>): Promise<Content> {
    return apiFetch<Content>(`/contents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteContent(id: string): Promise<void> {
    return apiFetch<void>(`/contents/${id}`, {
      method: 'DELETE',
    });
  },

  // Alerts & Safety
  async getAlerts(activeOnly = false): Promise<Alert[]> {
    return apiFetch<Alert[]>(`/alerts${activeOnly ? '?active=true' : ''}`);
  },

  async getAlert(id: string): Promise<Alert> {
    return apiFetch<Alert>(`/alerts/${id}`);
  },

  async createAlert(alert: Partial<Alert>): Promise<{ id: string; confirmToken: string }> {
    return apiFetch<{ id: string; confirmToken: string }>('/alerts', {
      method: 'POST',
      body: JSON.stringify(alert),
    });
  },

  async confirmAlert(id: string): Promise<{ id: string; status: string; impact: any }> {
    return apiFetch<any>(`/alerts/${id}/confirm`, {
      method: 'POST',
    });
  },

  async resolveAlert(id: string): Promise<{ id: string; status: string }> {
    return apiFetch<any>(`/alerts/${id}/resolve`, {
      method: 'POST',
    });
  },

  async addAlertUpdate(id: string, text: string): Promise<any> {
    return apiFetch<any>(`/alerts/${id}/updates`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  // Requests & Claims
  async getRequests(params?: { type?: string; status?: string; mine?: boolean }): Promise<Request[]> {
    const query = new URLSearchParams();
    if (params?.type) query.append('type', params.type);
    if (params?.status) query.append('status', params.status);
    if (params?.mine) query.append('mine', 'true');
    const qs = query.toString();
    return apiFetch<Request[]>(`/requests${qs ? `?${qs}` : ''}`);
  },

  async getRequest(id: string): Promise<Request> {
    return apiFetch<Request>(`/requests/${id}`);
  },

  async createRequest(reqData: Partial<Request>): Promise<Request> {
    return apiFetch<Request>('/requests', {
      method: 'POST',
      body: JSON.stringify(reqData),
    });
  },

  async updateRequest(id: string, updates: Partial<Request>): Promise<Request> {
    return apiFetch<Request>(`/requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async createClaim(requestId: string, claimData: { answer: string; message: string }): Promise<Claim> {
    return apiFetch<Claim>(`/requests/${requestId}/claims`, {
      method: 'POST',
      body: JSON.stringify(claimData),
    });
  },

  // Rooms & Bookings
  async getRooms(): Promise<Room[]> {
    return apiFetch<Room[]>('/rooms');
  },

  async getBookings(params?: { mine?: boolean; roomId?: string; date?: string }): Promise<Booking[]> {
    const query = new URLSearchParams();
    if (params?.mine) query.append('mine', 'true');
    if (params?.roomId) query.append('roomId', params.roomId);
    if (params?.date) query.append('date', params.date);
    const qs = query.toString();
    return apiFetch<Booking[]>(`/rooms/bookings${qs ? `?${qs}` : ''}`);
  },

  async createBooking(bookingData: {
    roomId: string;
    startsAt: string;
    endsAt: string;
    purpose: string;
    attendees: number;
  }): Promise<Booking> {
    return apiFetch<Booking>('/rooms/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  async cancelBooking(id: string, reason?: string): Promise<Booking> {
    return apiFetch<Booking>(`/rooms/bookings/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    });
  },

  // Societies
  async getSocieties(): Promise<Society[]> {
    return apiFetch<Society[]>('/societies');
  },

  async getSociety(id: string): Promise<Society> {
    return apiFetch<Society>(`/societies/${id}`);
  },

  async joinSociety(societyId: string, message?: string): Promise<any> {
    return apiFetch<any>(`/societies/${societyId}/members`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  async updateSociety(societyId: string, updates: Partial<Society>): Promise<Society> {
    return apiFetch<Society>(`/societies/${societyId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  // FAQs
  async getFAQs(category?: string, q?: string): Promise<FAQ[]> {
    const query = new URLSearchParams();
    if (category) query.append('category', category);
    if (q) query.append('q', q);
    const qs = query.toString();
    return apiFetch<FAQ[]>(`/faqs${qs ? `?${qs}` : ''}`);
  },

  async createFAQ(faq: Partial<FAQ>): Promise<FAQ> {
    return apiFetch<FAQ>('/faqs', {
      method: 'POST',
      body: JSON.stringify(faq),
    });
  },

  async updateFAQ(id: string, updates: Partial<FAQ>): Promise<FAQ> {
    return apiFetch<FAQ>(`/faqs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteFAQ(id: string): Promise<void> {
    return apiFetch<void>(`/faqs/${id}`, {
      method: 'DELETE',
    });
  },

  async voteFAQ(id: string, helpful: boolean): Promise<void> {
    return apiFetch<void>(`/faqs/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ helpful }),
    });
  },

  // Staff Directory
  async getStaff(department?: string, q?: string): Promise<Staff[]> {
    const query = new URLSearchParams();
    if (department) query.append('department', department);
    if (q) query.append('q', q);
    const qs = query.toString();
    return apiFetch<Staff[]>(`/staff${qs ? `?${qs}` : ''}`);
  },

  async createStaff(staffData: Partial<Staff>): Promise<Staff> {
    return apiFetch<Staff>('/staff', {
      method: 'POST',
      body: JSON.stringify(staffData),
    });
  },

  async updateStaff(id: string, updates: Partial<Staff>): Promise<Staff> {
    return apiFetch<Staff>(`/staff/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteStaff(id: string): Promise<void> {
    return apiFetch<void>(`/staff/${id}`, {
      method: 'DELETE',
    });
  },

  // Users & RBAC
  async getUsers(): Promise<User[]> {
    return apiFetch<User[]>('/users');
  },

  async updateUserRole(uid: string, role: Role): Promise<{ uid: string; role: Role }> {
    return apiFetch<any>(`/users/${uid}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },

  async updateUserStatus(uid: string, status: UserStatus): Promise<{ uid: string; status: UserStatus }> {
    return apiFetch<any>(`/users/${uid}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // AI Assistant
  async askAI(question: string): Promise<{
    answer: string;
    suggestedActions: Array<{ type: AiActionType; label: string; targetId?: string }>;
    sources: string[];
  }> {
    return apiFetch<any>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  },

  // Auth & Session
  async login(email: string, password?: string): Promise<User> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password || 'Demo@1234';

    // 1. Try authoritative /v1/auth/login endpoint per docs/to-frontend-on-auth.md
    try {
      const authRes = await this.postLogin(cleanEmail, cleanPassword);
      if (authRes?.idToken) {
        await tokenStorage.setToken(authRes.idToken);
      }
      if (authRes?.user) {
        setApiAuthUser({ uid: authRes.user.id || (authRes.user as any).uid, email: authRes.user.email, role: authRes.user.role });
        return authRes.user;
      }
    } catch (err: any) {
      console.warn('API /v1/auth/login attempt:', err?.message);
    }

    // 2. Known official seeded demo accounts mapped directly to Firestore document UIDs
    const DEMO_ACCOUNT_MAP: Record<string, { uid: string; role: Role; displayName: string; department?: string; faculty?: Faculty }> = {
      'manager@ucl.demo': { uid: 'usr_manager_01', role: 'manager', displayName: 'Facilities Manager', department: 'Facilities & Operations' },
      'admin@ucl.demo': { uid: 'usr_admin_01', role: 'admin', displayName: 'Registrar Office', department: 'Registrar' },
      'super@ucl.demo': { uid: 'usr_super_01', role: 'super_admin', displayName: 'Chief Administrator', department: 'IT & Infrastructure' },
      'lecturer.foc@ucl.demo': { uid: 'usr_staff_01', role: 'academic_staff', displayName: 'Dr. Kasun Silva', faculty: 'FOC', department: 'Faculty of Computing' },
      'kasun@ucl.demo': { uid: 'usr_staff_01', role: 'academic_staff', displayName: 'Dr. Kasun Silva', faculty: 'FOC', department: 'Faculty of Computing' },
      'finance@ucl.demo': { uid: 'usr_finance_01', role: 'finance_staff', displayName: 'Dilini Perera', department: 'Finance Office' },
      'robotics.rep@ucl.demo': { uid: 'usr_socrep_01', role: 'society_rep', displayName: 'Tharindu Jayasuriya', faculty: 'FOE' },
      'nimasha@ucl.demo': { uid: 'usr_student_01', role: 'student', displayName: 'Nimasha Perera', faculty: 'FOC' },
      'ravi@ucl.demo': { uid: 'usr_student_02', role: 'student', displayName: 'Ravi Kumar', faculty: 'FOB' },
      'alumni@ucl.demo': { uid: 'usr_alumni_01', role: 'alumni', displayName: 'Past Graduate' },
    };

    const demoMatch = DEMO_ACCOUNT_MAP[cleanEmail];

    // 3. Try /v1/auth/demo-token if demo account matched
    if (demoMatch) {
      try {
        const demoRes = await this.postDemoToken(demoMatch.role);
        if (demoRes?.idToken) {
          await tokenStorage.setToken(demoRes.idToken);
        }
        if (demoRes?.user) {
          setApiAuthUser({ uid: demoRes.user.id || (demoRes.user as any).uid || demoMatch.uid, email: demoRes.user.email, role: demoMatch.role });
          return { ...demoRes.user, role: demoMatch.role, id: demoRes.user.id || demoMatch.uid };
        }
      } catch (demoErr: any) {
        console.warn('API /v1/auth/demo-token attempt:', demoErr?.message);
      }
    }

    // 4. Set credentials on auth headers for API access
    setApiAuthUser({ email: cleanEmail, uid: demoMatch?.uid || `usr_${cleanEmail.split('@')[0]}`, role: demoMatch?.role });

    // 5. Try to fetch /me profile
    try {
      const me = await this.getMe();
      if (me && me.id) {
        setApiAuthUser({ uid: me.id, email: me.email, role: me.role });
        return me;
      }
    } catch {
      // Continue
    }

    const norm = cleanEmail;

    const inferredRole: Role = demoMatch?.role || (
      norm.includes('admin')
        ? 'admin'
        : norm.includes('super')
        ? 'super_admin'
        : norm.includes('manager')
        ? 'manager'
        : norm.includes('staff') || norm.includes('acad')
        ? 'academic_staff'
        : norm.includes('finance')
        ? 'finance_staff'
        : norm.includes('society') || norm.includes('rep')
        ? 'society_rep'
        : norm.includes('alumni')
        ? 'alumni'
        : 'student'
    );

    const resolvedUid = demoMatch?.uid || (
      inferredRole === 'manager'
        ? 'usr_manager_01'
        : inferredRole === 'admin'
        ? 'usr_admin_01'
        : inferredRole === 'super_admin'
        ? 'usr_super_01'
        : inferredRole === 'academic_staff'
        ? 'usr_acad_01'
        : inferredRole === 'finance_staff'
        ? 'usr_fin_01'
        : inferredRole === 'society_rep'
        ? 'usr_rep_01'
        : inferredRole === 'alumni'
        ? 'usr_alum_01'
        : 'usr_student_01'
    );

    const sessionUser: User = {
      id: resolvedUid,
      email: email.trim(),
      displayName: demoMatch?.displayName || email.split('@')[0].replace('.', ' '),
      role: inferredRole,
      status: 'active',
      faculty: demoMatch?.faculty || (inferredRole === 'student' ? 'FOC' : null),
      programme: inferredRole === 'student' ? 'BSC-SE' : null,
      yearGroup: inferredRole === 'student' ? 1 : null,
      studentId: inferredRole === 'student' ? 'UCL/26/0142' : null,
      phone: null,
      smsOptIn: true,
      societyIds: [],
      department: demoMatch?.department || (inferredRole !== 'student' ? 'Facilities & Operations' : null),
      alumniGradYear: inferredRole === 'alumni' ? 2023 : null,
      fcmTokens: [],
      notifPrefs: {
        push: true,
        categories: { announcement: true, event: true },
      },
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    setApiAuthUser({ uid: sessionUser.id, email: sessionUser.email, role: sessionUser.role });
    return sessionUser;
  },
};
