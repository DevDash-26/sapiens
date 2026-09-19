# Frontend Integration Guide: Authentication & RBAC

> **Authoritative Frontend Guide for UCL Campus Management System**  
> **Backend Base URL (Live Cloud Functions):** `https://asia-south1-ucl-net-prod.cloudfunctions.net/api`  
> **Local Emulator Base URL:** `http://127.0.0.1:5001/ucl-net-prod/asia-south1/api`  
> **Project ID:** `ucl-net-prod` | **Region:** `asia-south1`

---

## 1. Authentication Architecture Overview

The backend uses **Salon-Evo-style Header-Based Bearer Token Authentication**.

- **Header Standard:** All protected API endpoints require an `Authorization` HTTP header formatted exactly as:
  ```http
  Authorization: Bearer <FIREBASE_ID_TOKEN>
  ```
- **Backend Verification Pipeline:**
  1. Validates the JWT ID token signature using Firebase Admin SDK.
  2. Queries Firestore `/users/{uid}` to verify that the account exists.
  3. Verifies account status is `active` (rejects suspended accounts with `403 FORBIDDEN`).
  4. Injects authenticated user metadata (`req.user`) and role claims (`req.role`).
- **Missing / Malformed Header:** Returns standard 401:
  ```json
  {
    "ok": false,
    "error": {
      "code": "UNAUTHENTICATED",
      "message": "Authorization header missing. Expected 'Bearer <token>'."
    }
  }
  ```

---

## 2. Authoritative Auth Endpoints

| Endpoint | Method | Auth Required | Purpose |
| :--- | :--- | :--- | :--- |
| `/v1/auth/login` | `POST` | None (Credentials) or Bearer Token (Session Check) | Authenticate with email/password OR verify existing token |
| `/v1/auth/logout` | `POST` | `Authorization: Bearer <idToken>` | Revokes refresh tokens on Firebase Auth |
| `/v1/auth/demo-token` | `POST` | None | Instant one-tap role switcher token generator |
| `/v1/me` | `GET` | `Authorization: Bearer <idToken>` | Retrieve complete user profile & permissions |
| `/v1/me` | `PATCH` | `Authorization: Bearer <idToken>` | Register FCM push notification token or update preferences |

---

## 3. Endpoint Specifications

### 3.1. Login (`POST /v1/auth/login`)

The login endpoint supports two modes:

#### Mode A: Email & Password (User Credential Login)
Submit user credentials in JSON request body:

```http
POST /v1/auth/login HTTP/1.1
Host: asia-south1-ucl-net-prod.cloudfunctions.net
Content-Type: application/json

{
  "email": "nimasha@ucl.demo",
  "password": "Demo@1234"
}
```

**Success Response (`200 OK`):**
```json
{
  "ok": true,
  "data": {
    "idToken": "eyJhbGciOiJSUzI1NiIs...",
    "refreshToken": "AMf-vBw...",
    "expiresIn": "3600",
    "user": {
      "id": "usr_student_01",
      "uid": "usr_student_01",
      "email": "nimasha@ucl.demo",
      "displayName": "Nimasha Perera",
      "role": "student",
      "status": "active",
      "faculty": "FOC",
      "programme": "BSC-SE",
      "yearGroup": 2,
      "studentId": "UCL/24/0142",
      "phone": "+94771234567",
      "smsOptIn": true,
      "societyIds": ["soc_robotics"],
      "notifPrefs": {
        "push": true,
        "categories": {
          "announcement": true,
          "event": true,
          "society": true,
          "booking": true,
          "request": true
        }
      },
      "lastLoginAt": "2026-09-19T06:51:12.355Z",
      "createdAt": "2026-08-01T05:00:00.000Z"
    }
  },
  "meta": {
    "serverTime": "2026-09-19T06:51:16.993Z"
  }
}
```

#### Mode B: Session Verification (Existing Token)
If your frontend already has a stored `idToken` on app launch, call `/v1/auth/login` with the token in the header to validate it and get the latest user profile:

```http
POST /v1/auth/login HTTP/1.1
Host: asia-south1-ucl-net-prod.cloudfunctions.net
Authorization: Bearer <idToken>
```

---

### 3.2. Logout (`POST /v1/auth/logout`)

Revokes all active refresh tokens in Firebase Auth and timestamps session termination:

```http
POST /v1/auth/logout HTTP/1.1
Host: asia-south1-ucl-net-prod.cloudfunctions.net
Authorization: Bearer <idToken>
```

**Success Response (`200 OK`):**
```json
{
  "ok": true,
  "data": {
    "message": "Session revoked successfully."
  }
}
```

---

### 3.3. Instant Demo Role Switcher (`POST /v1/auth/demo-token`)

For hackathon judges and interactive role demoing, this endpoint mints an authentic Firebase ID Token for any role **without needing passwords**:

```http
POST /v1/auth/demo-token HTTP/1.1
Host: asia-south1-ucl-net-prod.cloudfunctions.net
Content-Type: application/json

{
  "role": "super_admin"
}
```

**Accepted `role` values:**
- `super_admin`
- `admin`
- `manager`
- `finance_staff`
- `academic_staff`
- `society_rep`
- `student`
- `past_alumni`

**Success Response (`200 OK`):**
```json
{
  "ok": true,
  "data": {
    "idToken": "eyJhbGciOiJSUzI1Ni...",
    "refreshToken": "...",
    "expiresIn": "3600",
    "role": "super_admin",
    "user": {
      "id": "usr_super_01",
      "email": "super@ucl.demo",
      "displayName": "Chief Administrator",
      "role": "super_admin",
      "department": "IT & Infrastructure"
    }
  }
}
```

---

### 3.4. Get Authenticated User Profile (`GET /v1/me`)

```http
GET /v1/me HTTP/1.1
Host: asia-south1-ucl-net-prod.cloudfunctions.net
Authorization: Bearer <idToken>
```

**Success Response (`200 OK`):**
```json
{
  "ok": true,
  "data": {
    "user": {
      "id": "usr_student_01",
      "email": "nimasha@ucl.demo",
      "displayName": "Nimasha Perera",
      "role": "student",
      "status": "active"
    }
  }
}
```

---

### 3.5. Register Push Notification Token (`PATCH /v1/me`)

Submit Expo / FCM push tokens and update notification preferences:

```http
PATCH /v1/me HTTP/1.1
Host: asia-south1-ucl-net-prod.cloudfunctions.net
Authorization: Bearer <idToken>
Content-Type: application/json

{
  "fcmToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "notifPrefs": {
    "push": true,
    "categories": {
      "announcement": true,
      "event": true,
      "booking": true
    }
  }
}
```

---

## 4. 8-Tier RBAC Seed Accounts & Credentials

All test accounts share the standard password: **`Demo@1234`**.

| Role Rank | Role Code | Display Name | Seeded Email | Password | Seeded UID | Scope / Privileges |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| **8** | `super_admin` | Super Admin | `super@ucl.demo` | `Demo@1234` | `usr_super_01` | Full CRUD, overrides, system config |
| **7** | `admin` | Admin Staff | `admin@ucl.demo` | `Demo@1234` | `usr_admin_01` | Campus alerts, room approvals, user roles |
| **6** | `manager` | Manager | `manager@ucl.demo` | `Demo@1234` | `usr_manager_01` | Operations, audit logs, safety broadcasts |
| **5** | `finance_staff` | Finance Staff | `finance@ucl.demo` | `Demo@1234` | `usr_finance_01` | Financial aid, receipts, fee notices |
| **4** | `academic_staff`| Academic Staff| `lecturer.foc@ucl.demo`| `Demo@1234` | `usr_staff_01` | Timetable notices, lectures, calendar |
| **3** | `society_rep` | Society Rep | `robotics.rep@ucl.demo` | `Demo@1234` | `usr_socrep_01` | Club profile, events, RSVP review |
| **2** | `student` | Student | `nimasha@ucl.demo` | `Demo@1234` | `usr_student_01` | Feed, RSVP, bookings, lost & found, AI |
| **1** | `past_alumni` | Past Alumni | `alumni@ucl.demo` | `Demo@1234` | `usr_alumni_01` | Directory, mentorship, reunions |

---

## 5. Frontend Implementation Walkthrough

### 5.1. Axios API Client with Auto-Injected Bearer Token

Create or update `src/services/apiClient.ts`:

```typescript
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  'https://asia-south1-ucl-net-prod.cloudfunctions.net/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Storage helper supporting Web (localStorage) & Native (AsyncStorage)
export const tokenStorage = {
  async getToken(): Promise<string | null> {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return localStorage.getItem('@ucl_auth_id_token');
    }
    return await AsyncStorage.getItem('@ucl_auth_id_token');
  },
  async setToken(token: string): Promise<void> {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      localStorage.setItem('@ucl_auth_id_token', token);
      return;
    }
    await AsyncStorage.setItem('@ucl_auth_id_token', token);
  },
  async removeToken(): Promise<void> {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      localStorage.removeItem('@ucl_auth_id_token');
      return;
    }
    await AsyncStorage.removeItem('@ucl_auth_id_token');
  },
};

// Request Interceptor: Injects Authorization Header
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStorage.getToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handles 401 Unauthorized globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear invalid session token
      await tokenStorage.removeToken();
    }
    return Promise.reject(error);
  }
);
```

---

### 5.2. Auth Service Layer (`src/services/authService.ts`)

```typescript
import { apiClient, tokenStorage } from './apiClient';
import { UserRole, UserProfile } from '../types/auth';

export interface LoginResponse {
  idToken: string;
  refreshToken: string;
  expiresIn: string;
  user: UserProfile;
}

export const authService = {
  // 1. Login with credentials
  async loginWithCredentials(email: string, password: string): Promise<LoginResponse> {
    const res = await apiClient.post<{ ok: boolean; data: LoginResponse }>('/v1/auth/login', {
      email,
      password,
    });
    const { idToken, user } = res.data.data;
    await tokenStorage.setToken(idToken);
    return res.data.data;
  },

  // 2. Validate session on launch
  async validateSession(): Promise<UserProfile | null> {
    const token = await tokenStorage.getToken();
    if (!token) return null;

    try {
      const res = await apiClient.post<{ ok: boolean; data: { user: UserProfile } }>('/v1/auth/login');
      return res.data.data.user;
    } catch {
      await tokenStorage.removeToken();
      return null;
    }
  },

  // 3. One-Tap Demo Role Switcher (Zero-Latency Judge Presentation)
  async switchDemoRole(role: UserRole): Promise<LoginResponse> {
    const res = await apiClient.post<{ ok: boolean; data: LoginResponse }>('/v1/auth/demo-token', {
      role,
    });
    const { idToken } = res.data.data;
    await tokenStorage.setToken(idToken);
    return res.data.data;
  },

  // 4. Logout
  async logout(): Promise<void> {
    try {
      await apiClient.post('/v1/auth/logout');
    } catch (e) {
      console.warn('Logout network error (clearing local token regardless):', e);
    } finally {
      await tokenStorage.removeToken();
    }
  },
};
```

---

### 5.3. Fast Demo Bypass (Optional Header)

If running in local demo mode or during offline testing, the backend will honor the header:
```http
x-demo-uid: usr_student_01
```
This grants immediate access as the specified user without passing through Firebase Token verification.

---

## 6. Standardized Error Response Format

All backend endpoints return errors matching this schema:

```json
{
  "ok": false,
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Authorization header missing. Expected 'Bearer <token>'."
  }
}
```

| HTTP Status | Error Code | Meaning / Action |
| :---: | :--- | :--- |
| **401** | `UNAUTHENTICATED` | Token missing, expired, or invalid. Prompt user to login. |
| **403** | `FORBIDDEN` | Insufficient permissions for the role, or user account is suspended. |
| **400** | `VALIDATION_ERROR`| Request body missing required fields or format error. Check `error.details`. |
| **404** | `NOT_FOUND` | Document or resource not found. |
| **500** | `INTERNAL` | Unexpected backend error. |

---

## 7. Strict Architectural Rule

> [!IMPORTANT]
> **Zero Frontend Data Seeding Policy:**  
> The frontend application must **NEVER** write initial mock or seed data to Firestore during startup, mounting, or local runs. All seed data is managed through backend scripts (`backend/functions/src/scripts/seed.ts`) and Cloud Functions. The frontend is exclusively a consumer of the API and Firestore reads.
