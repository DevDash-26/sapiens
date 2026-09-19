# DevDash '26: Universal College Lanka (UCL) Campus Management System

> **Authoritative Project Memory & Developer Guidelines**  
> **Event:** DevDash '26 Hackathon (6-Hour Development Sprint)  
> **Repository:** Monorepo (`frontend` + `backend/functions`)

---

## 1. Project Context & Objectives
We are building a unified, authoritative digital platform for Universal College Lanka (UCL) students and staff to replace fragmented communication channels (WhatsApp groups, physical notice boards, individual emails, etc.).

- **Core Value Proposition:** A single reliable hub for announcements, events, societies, lost & found, academic notices, financial aid, emergency SMS, and AI campus assistant.
- **Strict Requirement Coverage:** All functional (FR) and non-functional (NFR) requirements must be built completely—nothing left out.
- **Pitch Strategy:** The application runs as a responsive Web Single Page App (SPA) hosted on Netlify, designed to look and feel like a mobile app (constrained mobile aspect ratio `maxWidth: 480`).

---

## 2. Technology Stack & Exact Versions
- **Frontend Framework:** Expo SDK 57 (`expo@~57.0.24`, `@expo/cli@^57.0.26`).
- **Frontend Engine:** React 19.2.3, React Native 0.86.3, `react-native-web@~0.21.2`.
- **Frontend Target & Hosting:** Web SPA via `react-native-web`, deployed to **Netlify** (`dist/` directory).
- **Backend & Database:** Google Firebase (Firestore, Firebase Authentication, Cloud Storage, Firebase Cloud Functions).
- **Backend Logic:** Firebase Cloud Functions (Node.js 20, TypeScript, Firebase Admin SDK).
- **SMS Gateway:** **Text.lk API** (`https://app.text.lk/api/v3/sms/send`) with Bearer token authentication for critical safety broadcasts.
- **AI Campus Assistant:** **OpenAI API** (`gpt-4o-mini` / `gpt-3.5-turbo`) for natural language student FAQ resolution, smart search, and in-app navigation guidance.
- **AI Pair Programming Tools:** Google Jules & Google Antigravity (Code Generation & Orchestration), Google Veo (Presentation Video Generation).

---

## 3. Monorepo Architecture
The workspace uses npm/Yarn workspaces with dependencies isolated between Expo frontend and Firebase backend functions:

```plaintext
/campus-management-monorepo
├── package.json                      # Root workspace config ["frontend", "backend/functions"]
├── .gitignore                        # Git ignore patterns (node_modules, .expo, dist, .firebase)
├── README.md                         # Monorepo architecture & quick start documentation
├── GEMINI.md                         # Project development memory, contracts & instructions
│
├── /frontend                         # Expo 57 Web SPA (Mobile & Desktop Responsive)
│   ├── package.json                  # Expo 57, react-native, react-native-web, firebase
│   ├── app.json                      # Expo config (bundle identifier: com.ucl.campusmanagement)
│   ├── metro.config.js               # Configured with watchFolders & nodeModulesPaths for root workspace
│   ├── netlify.toml                  # Netlify build command & SPA rewrite rule (/* -> /index.html)
│   ├── tsconfig.json                 # Strict TypeScript configuration
│   ├── babel.config.js               # babel-preset-expo preset
│   ├── index.ts                      # Expo registerRootComponent entrypoint
│   ├── App.tsx                       # Root container, AuthRBACProvider & Demo Role Switcher
│   ├── assets/                       # App icons, splash, and favicons
│   └── /src
│       ├── /components               # Reusable UI chunks (Button, Modal, FormInput, Header)
│       ├── /contexts                 # React Contexts (AuthRBACContext.tsx)
│       ├── /services                 # Firebase client SDK & OpenAI API service initializers
│       │   ├── firebaseClient.ts     # Client Firestore, Auth, Storage, Functions init
│       │   └── openaiClient.ts       # OpenAI campus assistant service
│       ├── /screens                  # Role-segmented portal screens
│       │   ├── /admin                # Super Admin, Admin, Manager, Finance Staff views
│       │   │   ├── AdminDashboard.tsx# Administrative overview & emergency alert trigger
│       │   │   └── DataTransfer.tsx  # Bulk CSV/JSON Import & Export interface (NFR5)
│       │   ├── /staff                # Academic Staff & Society Rep views
│       │   │   └── StaffDashboard.tsx# Notice publisher & society event creation
│       │   ├── /student              # Student views
│       │   │   ├── StudentDashboard.tsx # Student hub
│       │   │   ├── EventsScreen.tsx  # Event listings & RSVP
│       │   │   ├── LostAndFoundScreen.tsx # Lost & found reporting
│       │   │   ├── FAQScreen.tsx     # FAQs & AI Assistant trigger
│       │   │   └── ChatAssistant.tsx # OpenAI-powered campus chatbot (BR33)
│       │   └── /alumni               # Restricted to Past Alumni
│       │       └── AlumniDashboard.tsx # Alumni network, mentorship & events
│       ├── /types
│       │   └── auth.ts               # 8-tier RBAC role definitions and permission sets
│       └── /utils
│           └── rbacGuard.ts          # RBAC hierarchy & conditional rendering helper
│
└── /backend                          # Google Firebase Backend Architecture
    ├── firebase.json                 # Firebase project configuration & emulator settings
    ├── .firebaserc                   # Firebase project alias
    ├── firestore.rules               # Strict database rules mapping CRUD to Custom Claims
    ├── storage.rules                 # Rules for file uploads (posters, logos, attachments)
    └── /functions                    # Firebase Cloud Functions (Node.js 20 / TypeScript)
        ├── package.json              # Backend dependencies (firebase-admin, functions, axios)
        ├── tsconfig.json             # TypeScript configuration
        └── /src
            ├── index.ts              # Main entrypoint exporting all Cloud Functions
            ├── /auth
            │   └── customClaims.ts   # Assigns Firebase Custom Claims across the 8 tiers
            ├── /api                  
            │   └── dataTransfer.ts   # Heavy JSON/CSV data import and export endpoints (NFR5)
            ├── /triggers             # Firestore document listeners
            │   └── onEmergencyCreated.ts # Triggers Text.lk broadcast upon critical alert (BR15)
            └── /sms
                └── textLkClient.ts   # Text.lk SMS API client with batching & formatting
```

---

## 4. Role-Based Access Control (RBAC) — 8 Tiers

We enforce an **8-tier RBAC system** using Firebase Custom Claims (`request.auth.token.role`). The UI includes an interactive **Demo Role Switcher** to instantly toggle between any of these 8 states during presentations without manual re-authentication.

| Tier Rank | Role Name | Code Identifier | Key Privileges & Scope |
| :--- | :--- | :--- | :--- |
| **8** | **Super Admin** | `super_admin` | Full CRUD across all collections. Can override user roles and system taxonomy. |
| **7** | **Admin Staff** | `admin` | Post campus-wide alerts, assign roles, approve room bookings/maintenance, manage directories. |
| **6** | **Manager** | `manager` | Oversee campus operations, issue operational approvals, view platform metrics and logs. |
| **5** | **Finance Staff** | `finance_staff` | Publish and manage financial aid, tuition fee receipts, scholarships, and run finance imports/exports. |
| **4** | **Academic Staff** | `academic_staff` | Publish faculty-specific announcements, course calendar milestones, and guest lecture updates. |
| **3** | **Society Rep / Club President** | `society_rep` | Manage society profile, publish club events, review member sign-ups. |
| **2** | **Student** | `student` | Read announcements/calendar, RSVP to events, chat with AI Assistant, book rooms, report lost & found. |
| **1** | **Past Alumni** | `past_alumni` | Access alumni directory, mentorship program, and reunion engagement events. |

---

## 5. Critical Integrations & Non-Functional Requirements

### 5.1. Text.lk SMS API for Emergency Communication (BR15)
- **Requirement:** Instant SMS delivery for critical safety and campus emergencies.
- **Backend Flow:**
  1. Admin/Manager creates a document in Firestore collection `emergencies/{emergencyId}` with severity `CRITICAL`.
  2. Cloud Function trigger `onEmergencyCreated` intercepts the creation.
  3. Queries registered student and staff mobile numbers.
  4. Dispatches POST requests to `https://app.text.lk/api/v3/sms/send` using a Bearer token.
  5. Updates document with dispatch audit statistics (`successfulCount`, `failureCount`, `dispatchedAt`).

### 5.2. Bulk Data Import & Export (NFR5)
- **Requirement:** Bulk upload and download of CSV and JSON data for Students, Staff, Societies, Events, Courses, and Inventory.
- **Implementation:**
  - Cloud Functions `importData` and `exportData` in `backend/functions/src/api/dataTransfer.ts`.
  - Parses CSV strings or JSON arrays.
  - Executes chunked Firestore batch writes (450 records per batch commit).
  - Generates audit trails in `data_transfers` collection.
  - Frontend UI in `frontend/src/screens/admin/DataTransfer.tsx`.
  - **Zero Frontend Seeding Policy:** The frontend must never write seed data to Firestore directly during startup or development. All database population and migration happens through backend Cloud Functions or administrative seed endpoints.

### 5.3. AI Campus Assistant (BR33 - 9 Marks)
- **Requirement:** Conversational natural language interface powered by OpenAI for students and visitors to query campus FAQs, locate facilities, and navigate the application.
- **Provider:** **OpenAI API** (`/v1/chat/completions`).
- **Prompt Context:** Grounded with authoritative UCL campus data (examination procedures, timetable regulations, society registrations, emergency protocols).

### 5.4. Mobile Responsive Web Layout
- On desktop browsers, the root layout is constrained to mobile aspect ratio:
  ```css
  maxWidth: 480, marginHorizontal: 'auto', minHeight: '100vh'
  ```
- Works seamlessly on iOS, Android, and Desktop Web.

---

## 6. AI & Coder Guidelines (Jules & Antigravity)

1. **Zero-Latency Demo Guarantee:**
   - Use optimistic UI updates for instant feedback.
   - Include hardcoded `IS_DEMO_MODE` fallback in services to instantly return mock data if live endpoints or network fail during presentations.
2. **Strict Scope Control:**
   - Only build exact API contracts and schemas defined in this document. Do not bloat dependencies.
3. **Rule 5 Compliance:**
   - All code generated by Jules / Antigravity must be disclosed in the final project report as an "aid", asserting original core logic and architectural design.
4. **No Frontend Data Seeding (Strict Rule):**
   - **DO NOT** seed, inject, or write initial database mock records directly from frontend components, hooks, or client-side startup scripts.
   - All dataset population, test data ingestion, and batch migrations must strictly be handled through the backend (e.g., Firebase Cloud Functions, the NFR5 Data Transfer API, or backend administrative seed scripts).
   - The frontend remains strictly a client consumer and UI interface.
5. **Git Commit Cadence:**
   - Commit and push working increments to GitHub every 30–60 minutes.

---

## 7. Developer Commands & Workflows

### Setup & Run
```bash
# Install all dependencies across workspaces
npm install --legacy-peer-deps

# Start Expo development server (Mobile & Web)
npm run start:frontend
# or
cd frontend && npx expo start

# Test Web Export locally (Netlify build preview)
cd frontend && npx expo export -p web

# Build Firebase Functions
npm run build:backend
# or
cd backend/functions && npm run build
```

---

## 8. Current Implementation Status & Memory Log

| Phase | Milestone | Status | Commit / Notes |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Foundations, Auth, Targeted Feeds (Screens 1–10) | ✅ Completed | Onboarding cohort matrix, Notice/Alert feeds, Notifications Center (`48ec73c`) |
| **Phase 2** | Student Core Utilities (Screens 11–20) | ✅ Completed | Event RSVP, Academic Calendar, Societies, Lost & Found with claims (`3f44502`) |
| **Phase 3** | Engagement, Tracking & Room Booking (Screens 21–30) | ✅ Completed | Facility issues, Academic support, Feedback, Textbook exchange, Room availability & My Bookings |
| **Phase 4** | AI Assistant, FAQs & Staff Console (Screens 31–40) | ✅ Completed | Grounded OpenAI chatbot, Staff directory, Empty/Offline states, Notice/Event/Society management |
| **Phase 5** | Staff Console: Ops & Triage (Screens 41–50) | ✅ Completed | Text.lk emergency SMS, Schedule broadcast, Maintenance/Academic/Feedback queues, 8-tier RBAC table |
| **Phase 6** | Highlights & Executive Admin (Screens 51–53) | ✅ Completed | Student life milestone recaps, Career & mentorship board, University telemetry dashboard (53/53 Done) |
| **Phase 7** | Campus Facilities Hub & Bulk Data Transfer (100% Coverage) | ✅ Completed | Built Campus Facilities Hub (`CampusFacilitiesHubScreen.tsx` covering BR14, 23, 24, 25, 26, 29, 30, 31) and wired NFR5 Bulk Data Transfer (`DataTransfer.tsx`). 33/33 BRs + 6/6 NFRs 100% covered. |


