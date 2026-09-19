# Master Plan — 53 Screens, 6 Phases

Source: UCL DevDash'26 problem statement (`API-Contract_DataModel.md` / business requirements BR1–BR33, NFR1–NFR6).

Total screens: **53**
Platform: Expo (React Native), mobile-first for student screens, wide/responsive layout for staff console screens (can still run in Expo web or a tablet/desktop breakpoint).

## Why 6 phases (not 11)

The original 11-stage breakdown was sized for Stitch's 5-screens-per-prompt limit. Antigravity CLI doesn't have that ceiling — it can work through a batch of related screens autonomously in one sitting. So the 11 stages have been consolidated into 6 phases, each a coherent chunk of related functionality, while preserving the original priority order (foundation → student utilities → engagement/assistance → staff alerts → staff console → polish).

## Phase overview

| Phase | Name | Screens | Count | Audience | Priority |
|---|---|---|---|---|---|
| 1 | Foundation — Entry, Home, Content & Alerts | 1–10 | 10 | Everyone | Highest |
| 2 | Student Core Utilities — Services, Lost & Found, Tracking, Room Booking | 11–20 | 10 | Students | Highest |
| 3 | Engagement & Assistance — AI/FAQ/Profile, Events/Calendar/Societies | 21–30 | 10 | Everyone/Students | High |
| 4 | Staff Alerts & Remaining Student Forms — Broadcasts, Requests, Other Forms, Staff Content Start | 31–40 | 10 | Staff/Students | Medium |
| 5 | Staff Console — Content, Ops & Access Management | 41–50 | 10 | Staff/Admin | Medium |
| 6 | Highlights & Admin Overview | 51–53 | 3 | Mixed | Lowest |

Full per-screen detail is in `02-SCREEN-INVENTORY.md`. Full per-phase build briefs (ready to paste to Antigravity) are in `phases/PHASE-1.md` through `phases/PHASE-6.md`.

## Business requirement coverage map

| Phase | BRs covered |
|---|---|
| 1 | BR1, BR2, BR14, BR15, BR16 |
| 2 | BR7, BR8, BR21 (student side) |
| 3 | BR3, BR4, BR5, BR6, BR13, BR33, BR10, BR22 |
| 4 | BR9, BR17, BR27, BR11 (start), BR12 (start), BR15/BR16 (staff side) |
| 5 | BR7, BR8, BR9, BR10, BR12, BR17, BR21, BR22 (all staff/admin sides) |
| 6 | BR18, BR19, BR20, BR32 |

NFR1–NFR6 (usability, performance, reliability, security, maintainability, robustness) are addressed structurally: NFR1/NFR6 mainly through the design system and empty/error states (Phase 3), NFR4 through the role-gated staff console (Phases 4–5), NFR5 through the shared component library built starting Phase 1–2, and NFR2/NFR3 are implementation/infra concerns outside screen design, called out as engineering notes in the phase briefs where relevant.

## Tech notes for Antigravity

- **`.\docs\API-Contract+DataModel.md` is the single source of truth** for API contracts and data models — all mock data structures across every phase must match it, so the real backend can be dropped in later without reshaping the frontend.
- **`wireframes/*.html`** hold the original UI direction (layout, color ideas) — use them for initial orientation only; `01-DESIGN-SYSTEM.md` supersedes them on any conflict.
- Assume Expo Router (file-based routing) unless the existing template uses something else — check the project first before generating new routes.
- Student-facing screens: bottom tab or drawer navigation, mobile-first.
- Staff console screens: separate navigation stack, gated behind a staff/admin login state, laid out for wider screens (2–3 column layouts where it helps data density — request queues, tables).
- All data can be mocked/seeded locally (per the problem statement's Assumptions — no real backend integration is expected during the hackathon). Use a local mock data layer (e.g. `lib/mockData/`) so screens render realistic content, structured so it could later be swapped for real API calls.
- Auth can be a simple mocked role-switch (student / society rep / staff / admin) rather than a real auth backend, unless the project template already has real auth wired up.
