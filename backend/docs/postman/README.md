# UCL Campus Management System — Postman Test Collection

This directory contains the authoritative Postman Test Collection and Environment for the **Universal College Lanka (UCL) Campus Management System API (v1.0)**.

---

## 📁 Files in This Directory

- **`UCL_Campus_Hub_API.postman_collection.json`**: Postman Collection v2.1 containing **31 API test requests** organized into 5 logical modules.
- **`UCL_Campus_Hub_Environment.postman_environment.json`**: Postman Environment file pre-configured for both Cloud (`ucl-net-prod`) and Local Firebase Emulators.

---

## 🚀 Quick Import Guide

1. Open **Postman** (Desktop or Web).
2. Click **Import** (top left).
3. Drag & drop both files:
   - `docs/postman/UCL_Campus_Hub_API.postman_collection.json`
   - `docs/postman/UCL_Campus_Hub_Environment.postman_environment.json`
4. Select the environment **"UCL Campus Hub - Cloud & Local"** in the top-right environment selector.

---

## 🔑 Authentication Workflows Supported

### Workflow A: Production Firebase Auth Flow (Google Identity Toolkit)
1. Run **`1. Google Identity Toolkit & Auth -> 1. Demo Role Switcher Token`**.
   - Postman test script automatically stores `CUSTOM_TOKEN`, `DEMO_UID`, and `DEMO_ROLE` into variables.
2. Run **`1. Google Identity Toolkit & Auth -> 2. Sign In With Custom Token`**.
   - Identity Toolkit exchanges the custom token for a production **Firebase ID Token** and **Refresh Token**, automatically saved into `{{ID_TOKEN}}` and `{{REFRESH_TOKEN}}`.
3. Run **`1. Google Identity Toolkit & Auth -> 5. Refresh ID Token`** whenever the 1-hour token expires.
4. All subsequent collection endpoints automatically inject:
   ```http
   Authorization: Bearer {{ID_TOKEN}}
   ```

### Workflow B: Zero-Latency Demo Mode Bypass
Every request in the collection is pre-configured with the bypass header:
```http
x-demo-uid: {{DEMO_UID}}
```
When `DEMO_MODE=true` is enabled on the backend, you can execute all Phase 1 and Phase 2 endpoints immediately without obtaining an ID token.

---

## 📋 Comprehensive Endpoint Coverage

### 1. Google Identity Toolkit & Auth
- `POST /auth/demo-token` — Generate custom token for instant role switching
- `POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken` — Exchange custom token for ID token
- `POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword` — Password authentication
- `POST https://identitytoolkit.googleapis.com/v1/accounts:signUp` — Create new Firebase Auth user
- `POST https://securetoken.googleapis.com/v1/token` — Refresh expired ID token
- `POST https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode` — Trigger password reset email
- `POST https://identitytoolkit.googleapis.com/v1/accounts:lookup` — Lookup user account profile
- `POST https://identitytoolkit.googleapis.com/v1/accounts:update` — Update user profile / display name

### 2. Phase 1: System & User Profiles
- `GET /health` — Health check & uptime probe
- `GET /meta/config` — Enums, faculties, programmes, categories
- `GET /me` — Authenticated user profile & notification preferences
- `POST /me/bootstrap` — Profile hydration on new sign-up
- `PATCH /me` — Update phone, SMS opt-in, notification preferences
- `PUT /me/fcm-token` — Register device push notification token
- `DELETE /me/fcm-token` — Unregister device push notification token

### 3. Phase 2: Unified Feed & Calendar
- `GET /feed` — Unified home feed in 1 round trip (`forYou`, `university`, `upcomingEvents`, `nextCalendar`, `me`)
- `GET /calendar` — Merged academic calendar, events, and holidays
- `GET /calendar/ics` — Standard iCalendar feed download

### 4. Phase 2: Targeted Content Engine
- `GET /contents` — Filtered list of card projections
- `GET /contents?type=announcement` — Filter by content type
- `GET /contents?q=database` — Server-side text search
- `GET /contents?mine=true` — Filter by authored content
- `GET /contents/moderation/queue` — Pending review queue (staff/manager)
- `GET /contents/:id` — Detail view with viewer flags (`canEdit`, `interested`) & `shareUrl`
- `POST /contents` — Create new announcement/event draft
- `PATCH /contents/:id` — Update authored draft
- `POST /contents/:id/submit-for-review` — Submit content for moderation
- `POST /contents/:id/approve` — Approve pending content
- `POST /contents/:id/reject` — Reject pending content with reason
- `POST /contents/:id/pin` — Pin/unpin content on feed
- `POST /contents/:id/interested` — RSVP / express interest
- `DELETE /contents/:id/interested` — Remove RSVP
- `POST /contents/:id/archive` — Archive content

### 5. Phase 2: Inbox & Notifications
- `GET /notifications` — Get notification inbox
- `GET /notifications?unread=true` — Filter unread notifications with `meta.unreadCount`
- `POST /notifications/read` (by ID) — Mark specific notification as read
- `POST /notifications/read` (all: true) — Mark all notifications as read

---

## 🧪 Automated Testing & Assertions
Every request includes pre-configured **Postman Tests** validating:
- HTTP status code (`200 OK`, `201 Created`).
- Standard envelope format (`{ "ok": true, "data": ... }`).
- Automatic environment variable capturing (`ID_TOKEN`, `CUSTOM_TOKEN`, `CONTENT_ID`, `DEMO_UID`).
