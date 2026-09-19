# Progress Tracker

**This file is the single source of truth for build status.** Antigravity must read this before starting any work and update it (status + notes) immediately after finishing each screen — not batched at the end of a phase.

Status values: `not started` / `in progress` / `done` / `blocked`

## How to update this file
- When you start a screen, set it to `in progress`.
- When a screen is fully built, styled per `01-DESIGN-SYSTEM.md`, and navigable, set it to `done`.
- If you had to make an assumption (spec was ambiguous), add one short line in Notes.
- If something blocks you (missing shared component, unclear routing), set `blocked` and say why in Notes — don't leave it silently `in progress`.
- Update the "Last updated" line at the bottom each session.

---

## Phase 1 — Foundation (Screens 1–10)

| # | Screen | Status | Notes |
|---|---|---|---|
| 1 | Splash / Loading | done | Authoritative UCL crest badge, auto-resolves session state |
| 2 | Login | done | University email + password, role auto-detection & quick demo user selectors |
| 3 | Sign Up / Register | done | Name, university email, student ID, password, initial faculty selection |
| 4 | Onboarding — Faculty & Year | done | 3-step cohort setup: Faculty (FOC/FOB/FOE), Programme, Year Group (1-4) |
| 5 | Home / Dashboard | done | Pinned emergency alert banner, Today strip, targeted notices & events preview |
| 6 | Announcements Feed | done | Real-time search, scope chips (Targeted/Uni-wide), category filters |
| 7 | Announcement Detail | done | Verified publisher metadata, audience tags, attachment download & WhatsApp share |
| 8 | Alerts Feed | done | Dedicated safety channel, active vs resolved filter, Text.lk SMS indicators |
| 9 | Schedule Change Notice | done | Affected duration/scope, bookings freed & events flagged impact counters, updates timeline |
| 10 | Notifications Center | done | Multi-channel inbox, unread filtering, mark all as read, tap to route |

## Phase 2 — Student Core Utilities (Screens 11–20)

| # | Screen | Status | Notes |
|---|---|---|---|
| 11 | Events Feed | done | Real-time search, category filters (academic, society, sports, career, workshop), registered/all switch, interactive RSVP |
| 12 | Event Detail + RSVP | done | Verified organizer info, location/capacity counters, interactive RSVP button, calendar export & share |
| 13 | Academic Calendar | done | Monthly/weekly agenda view, semester milestone markers, category filters (exam, holiday, lecture, deadline), event details modal |
| 14 | Societies Directory | done | Search & category chips, member count, verified badge, my-memberships section, fast join/leave |
| 15 | Society Detail + Join | done | Executive committee listing, upcoming events, contact channels, interactive membership join/manage toggle |
| 16 | Services Hub | done | Direct grid navigation to Lost & Found, Facility Issues, Room Bookings, Academic Support, Peer Exchange, FAQ |
| 17 | Lost & Found Feed | done | Lost vs Found segment tabs, category filter chips, search, image cards, claim count badge, report actions |
| 18 | Report Lost Item | done | Category dropdown, color/brand tags, campus location picker, incident date, auto-validating submission |
| 19 | Report Found Item | done | Drop-off desk selector (Security/Library/Student Affairs), private verification hint requirement, secure handover guidance |
| 20 | Item Detail / Claim | done | Dual view (Lost vs Found item specs), private claim modal with verification evidence and contact submission |

## Phase 3 — Engagement & Assistance (Screens 21–30)

| # | Screen | Status | Notes |
|---|---|---|---|
| 21 | Report Facility Issue | done | Building picker, room input, defect category (it, electrical, plumbing, furniture, cleaning), urgency level (low/med/high), photo upload preview |
| 22 | Request Academic Support | done | Need Support vs Mentor/Tutor segment, kind (study group, peer tutoring, mentorship), course code selector, preferred availability |
| 23 | Submit Feedback / Question | done | Category (suggestion, question, complaint, correction), anonymous toggle, contact-back preference, detailed message body |
| 24 | List a Textbook | done | Offer type (giveaway, swap, for sale), course code, condition tags (new/good/worn), price input (LKR), campus handover point |
| 25 | Browse Textbook Exchange | done | Real-time search, offer & course filter chips, condition tags, price labels, contact lister modal with pre-filled message |
| 26 | My Requests (Tracking) | done | **Core aggregator**: pulls together all 6 request types (Lost/Found, Facility, Academic, Feedback, Textbooks) with KPIs, filters, status badges |
| 27 | Request Detail / Status Timeline | done | Multi-stage lifecycle timeline (Submitted → Assigned → In Progress → Resolved), staff notes, interactive mark-as-resolved / cancel actions |
| 28 | Classroom Availability Browser | done | Day switcher (Mon–Fri), building & capacity filters, visual 30-min time-slot matrix (08:30–19:30) with Free/Busy color indicators, 1-tap book |
| 29 | Room Booking Request | done | Pre-filled room/date/slot from Screen 28, attendee count with room capacity limit warning, double-booking conflict check, instant confirmation |
| 30 | My Bookings | done | Active vs cancelled reservations, date/time ranges in Asia/Colombo, attendee counts, purpose details, interactive cancel reservation action |

## Phase 4 — Staff Alerts & Remaining Forms (Screens 31–40)

| # | Screen | Status | Notes |
|---|---|---|---|
| 31 | AI Assistant | done | Grounded UCL chat UI with suggested chips, thumbs up/down feedback, and deep-links to room bookings, lost & found, academic calendar, and staff directory |
| 32 | FAQ | done | Searchable accordion directory grouped by topic (Admissions, Examinations, IT, Library, Finance), verified source badges, helpfulness counters |
| 33 | Staff Directory | done | Academic & administrative staff directory with topic tags, office locations, consulting hours, direct email & phone intent triggers |
| 34 | Profile / Settings | done | User identity card with Faculty/Programme/Year, mandatory safety SMS toggle (locked per BR15), notification channel preferences, quick navigation shortcuts |
| 35 | System States (Empty/Error/Offline) | done | Interactive demonstration & test harness for Empty cohort feed, Network Error with retry, Offline Mode with cached banner, and Maintenance degraded mode |
| 36 | Staff Login / Console Dashboard | done | Enterprise data-dense dashboard gated by staff/admin roles with quick metric cards, pending queue alerts, and fast action launchers |
| 37 | Announcement Composer | done | Multi-target notice publisher with faculty, programme, year group targeting matrix, priority flags, markdown preview; writes directly to shared content store |
| 38 | Content Management List | done | Data table of published and scheduled notices with status filters, audience chips, inline unpublish/delete actions |
| 39 | Event Management (staff) | done | Staff event creation & capacity management with live RSVP attendance progress meter, date/time picker, and multi-category tagging |
| 40 | Society Management (staff/rep) | done | Society profile editor with executive committee listing, active member metrics, and interactive pending membership approval/rejection queue |

## Phase 5 — Staff Console: Ops & Access (Screens 41–50)

| # | Screen | Status | Notes |
|---|---|---|---|
| 41 | Emergency Alert Broadcast | done | Role-gated safety broadcast (super_admin/admin/manager) with severity toggle, scope selection, 2-step authorization modal, impact counters & Text.lk flash SMS trigger (BR15) |
| 42 | Schedule Change Broadcast | done | Campus closure & timetable rescheduling publisher with preset reason triggers, dynamic booking releases, event warning flags & SMS advisory toggle (BR16) |
| 43 | Facility Issue Queue | done | Staff maintenance defect triage queue with category & urgency badges, staff technician assignment, and live status feedback loop to student tracking (BR21) |
| 44 | Academic Support Queue | done | Peer tutoring & mentorship queue with course code filters, mentor assignment, meeting link response, and student timeline synchronization (BR9) |
| 45 | Feedback Inbox | done | Student suggestion, question & complaint triage with canned standard responses, official reply drafting, and student inbox feedback loop (BR17) |
| 46 | Room Booking Approval Queue | done | Study room reservation manager with conflict detection, group size vs capacity checks, and admin cancellation with slot release override (BR8) |
| 47 | Lost & Found Admin | done | Security desk inventory manager with staff-only secret verification hints, claim comparison, and official handover authorization (BR7) |
| 48 | User & Access Role Management | done | Interactive 8-tier RBAC table with search, role promotion/demotion, account active/suspension toggles, and strict admin route gating (BR12) |
| 49 | FAQ Management | done | Knowledgebase CRUD management with category assignment, keyword tagging for AI semantic search, verified department stamps & student vote metrics (BR10) |
| 50 | Staff Directory Management | done | Faculty roster editor with designation, consulting hours, office location, contact endpoints, and topic tag indexing for search & AI assistant (BR22) |

## Phase 6 — Highlights & Admin (Screens 51–53)

| # | Screen | Status | Notes |
|---|---|---|---|
| 51 | Student Life Highlights | done | Showcase of past campus milestones, hackathon victories, sports trophies, and society celebrations with interactive clap/cheer counters, image carousel, and social sharing (BR32) |
| 52 | Opportunities Board | done | Unified student career, volunteering, and 1-on-1 alumni mentorship network board with category filter chips (internship/part-time/volunteering/mentorship), quick application modal & direct HR links (BR18–20) |
| 53 | Admin Overview Dashboard | done | Executive university telemetry dashboard computing live KPIs across all queues (facility, academic, feedback, room reservations, active alerts, published notices, 8-tier RBAC breakdown, and system audit log) |

---

**Overall progress:** 53 / 53 screens done (All Phases 1–6 complete — 100%)

**Last updated:** 2026-09-19T11:18:00+05:30 (All 53 screens built, routed, styled per 01-DESIGN-SYSTEM.md, and verified with 0 TypeScript errors)

### Unified Request Data Model Schema (for Phase 4 & 5 Staff Queues)
All request forms write to and read from the generic `requests/{id}` Firestore contract (`Request` interface):
```typescript
interface Request {
  id: string; // 'req_...'
  type: 'lost' | 'found' | 'facility_issue' | 'academic_support' | 'feedback' | 'textbook';
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'rejected';
  visibility: 'public' | 'private';
  title: string;
  description: string;
  imageUrls: string[];
  location: string | null;
  occurredAt: string | null;
  data: {
    // lost/found:
    itemCategory?: 'electronics' | 'id_card_wallet' | 'keys' | 'clothing' | 'bags' | 'books' | 'other';
    color?: string;
    brand?: string;
    handedTo?: 'self' | 'security_desk' | 'library';
    // facility_issue:
    building?: string;
    room?: string;
    issueCategory?: 'electrical' | 'plumbing' | 'it' | 'furniture' | 'cleaning' | 'other';
    severity?: 'low' | 'medium' | 'high';
    // academic_support:
    kind?: 'study_group' | 'peer_tutoring' | 'mentorship';
    direction?: 'request' | 'offer';
    courseCode?: string;
    preferredTimes?: string;
    // feedback:
    anonymous?: boolean;
    relatedContentId?: string | null;
    // textbook:
    isbn?: string;
    condition?: 'new' | 'good' | 'worn';
    offer?: 'give_away' | 'swap' | 'sell';
    price?: number;
  };
  verificationHint: string | null; // private on found items
  handoverNote: string | null;
  ownerUid: string;
  ownerName: string;
  assigneeUid: string | null; // e.g. 'usr_mgr_01', 'usr_acad_01', 'usr_admin_01'
  resolution: string | null;
  createdAt: string; // ISO 8601 UTC
  updatedAt: string;
  resolvedAt: string | null;
}
```

