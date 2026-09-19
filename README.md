# Campus Management System Monorepo

Comprehensive full-stack Campus Management System built with **Expo 57** (Mobile & Web) and **Google Firebase** (Cloud Functions, Firestore, Storage, Auth), designed to satisfy all functional and non-functional requirements (FRs & NFRs).

---

## 🏛️ Architecture Overview

```plaintext
/campus-management-monorepo
├── package.json                      # Root workspace config (workspaces: ["frontend", "backend/functions"])
│
├── /frontend                         # Expo 57 App (iOS, Android & Web via Netlify)
│   ├── package.json                  # Expo, react-native-web, and frontend dependencies
│   ├── app.json                      # Expo configuration (bundle identifier, splash screen)
│   ├── metro.config.js               # *Crucial*: Configured to watch root monorepo paths
│   ├── netlify.toml                  # Export & redirect rules for SPA web hosting on Netlify
│   └── /src
│       ├── /components               # Reusable UI (Button, Modal, FormInput, Header)
│       ├── /contexts                 # Global React Contexts
│       │   └── AuthRBACContext.tsx   # Enforces the 8 roles across routes and UI elements
│       ├── /services                 # Firebase client SDK initialization
│       │   └── firebaseClient.ts     # Client-side Firebase init
│       ├── /screens                  # UI screens segmented by role access
│       │   ├── /admin                # Views for Super Admin, Admin, Manager, Finance Staff
│       │   │   ├── AdminDashboard.tsx# Control center & emergency broadcast UI
│       │   │   └── DataTransfer.tsx  # Frontend UI for CSV/JSON Import & Export (NFR5)
│       │   ├── /staff                # Views for Academic Staff, Society Reps
│       │   │   └── StaffDashboard.tsx# Notice & Event publisher
│       │   ├── /student              # Views for Student
│       │   │   ├── StudentDashboard.tsx
│       │   │   ├── EventsScreen.tsx
│       │   │   ├── LostAndFoundScreen.tsx
│       │   │   └── FAQScreen.tsx
│       │   └── /alumni               # Views restricted to Past Alumni
│       │       └── AlumniDashboard.tsx
│       └── /utils
│           └── rbacGuard.ts          # Helper to conditionally render UI based on the 8 roles
│
└── /backend                          # Google Firebase Backend Architecture
    ├── firebase.json                 # Firebase project config (Functions, Firestore, Storage)
    ├── .firebaserc                   # Firebase project alias
    ├── firestore.rules               # Security rules mapping CRUD operations to the 8 roles
    ├── storage.rules                 # Rules for file uploads (posters, logos, attachments)
    └── /functions                    # Firebase Cloud Functions (Node.js 20)
        ├── package.json              
        └── /src
            ├── index.ts              # Entrypoint exporting all cloud functions
            ├── /auth
            │   └── customClaims.ts   # Assigns Firebase Custom Claims (Super Admin -> Alumni)
            ├── /api                  
            │   └── dataTransfer.ts   # Handles heavy backend JSON/CSV data import and export
            ├── /triggers             # Firestore document listeners
            │   └── onEmergencyCreated.ts # Triggers Text.lk broadcast on critical alerts
            └── /sms
                └── textLkClient.ts   # Integration with Text.lk API for critical SMS alerts
```

---

## 👥 8-Tier Role-Based Access Control (RBAC)

The system enforces 8 distinct roles across client UI guards and database security rules:

1. **Super Admin**: Complete root access to system configurations, user claims, finance, and imports/exports.
2. **Admin**: University administration, role assignments, emergency alerts, announcements.
3. **Manager**: Department management, society approvals, emergency announcements.
4. **Academic Staff**: Course notices, academic updates, student academic inquiries.
5. **Finance Staff**: Invoicing, payment reconciliation, fee clearance, financial imports/exports.
6. **Society Rep / Club President**: Club event organization, club memberships, notices.
7. **Student**: Course access, event attendance, lost & found reporting, FAQs.
8. **Past Alumni**: Alumni directory, mentorship network, homecoming & reunion updates.

---

## ⚡ Core Features

- **Text.lk SMS Gateway Integration (BR15)**: Automatic Firestore Trigger on `emergencies` collection broadcasts instant SMS to students and staff.
- **Bulk Data Migration (NFR5)**: High-speed batch import and export of student records, staff accounts, courses, and financial data in CSV and JSON formats.
- **Expo 57 Monorepo Setup**: Metro bundler configured with `watchFolders` to resolve monorepo packages and shared dependencies.
- **Multi-Platform Ready**: Deploys as Native Mobile (iOS/Android) and Single Page Web App (Netlify).

---

## 🚀 Quick Start Commands

```bash
# Install root dependencies
npm install

# Run Expo frontend (mobile & web)
npm run start:frontend

# Build & export for web
npm run build:frontend

# Build backend functions
npm run build:backend
```
