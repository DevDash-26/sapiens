# Screen Inventory — All 53 Screens

Numbering is global (1–53) and matches the Progress Tracker. "Stage" refers to the original 11-stage grouping, kept here for traceability; phases (build order) are in `00-MASTER-PLAN.md`.

Legend: **BR** = business requirement it serves. **Components** = shared components from `01-DESIGN-SYSTEM.md` this screen should be built from.

---

## Stage 1 — Entry & Home (Screens 1–5)

**1. Splash / Loading**
Shows the app mark and a loading indicator while auth/session state resolves. No content, no copy beyond the mark. Auto-navigates to Login or Home.

**2. Login**
Email/username + password fields, primary "Log in" button, link to Sign up. Simple role detection can happen here (student vs staff email domain, or a mocked toggle) since real SSO isn't assumed. *Components: FormField, Button.*

**3. Sign Up / Register**
Name, university email, password, faculty/programme selection. Primary "Create account" button, link back to Login. *Components: FormField, Button.*

**4. Onboarding — Faculty & Year Selection** (BR2, BR14)
One-time setup after signup: select faculty, programme, year group. This drives targeted announcements later. Short heading, no filler subtitle, a "Continue" button. *Components: FormField/select, Button.*

**5. Home / Dashboard** (BR1)
The main feed everyone lands on. Sections: pinned/emergency alert banner if active (BR15), a short "Today" strip (upcoming deadline or event, if any), an announcements preview list (3–4 items, "See all" link), an events preview list (3–4 items, "See all" link). This is the single unified entry point the whole problem statement is about — keep it a real feed, not a grid of icon tiles. *Components: SectionHeader, ListRow, StatusBadge (for alert banner), Button (See all as text link).*

## Stage 2 — Content & Alerts (Screens 6–10)

**6. Announcements Feed** (BR2)
Scrollable list of announcements, newest first, filterable by scope (University-wide / My Faculty / My Year). Each row: title, source (e.g. "Faculty of Engineering"), timestamp, short excerpt. *Components: ListRow, FilterChip, SearchBar.*

**7. Announcement Detail** (BR2)
Full announcement: title, publishing department/author, timestamp, full body text, any attached info (date/location if relevant). No comments/reactions needed. *Components: Card.*

**8. Alerts Feed** (BR15)
Dedicated list of safety/emergency notices, most recent first, each clearly marked with severity (Critical / Advisory). This is separate from general announcements because it needs to be scannable fast in an actual emergency. *Components: ListRow, StatusBadge.*

**9. Schedule Change Notice** (BR16)
Detail view for a specific closure/schedule-change notice: what changed, effective date/time range, affected faculty/programme if scoped, reason (e.g. weather, public holiday). *Components: Card, StatusBadge.*

**10. Notifications Center**
Unified list of push-style notifications the user has received (new announcement, event reminder, request status change, etc.), each tappable to the relevant detail screen. Mark-as-read state. *Components: ListRow.*

## Stage 3 — Events, Calendar & Societies (Screens 11–15)

**11. Events Feed** (BR3)
List of upcoming events, university-organised and society-organised both shown, with a filter chip to distinguish them. Each row: title, organiser, date/time, location. *Components: ListRow, FilterChip, SearchBar.*

**12. Event Detail + RSVP** (BR3, BR4)
Full event info: title, organiser, description, date/time, location, and an "I'm interested" / "Going" action (BR4) with a simple interest count shown to the organiser side later, not to other students. *Components: Card, Button.*

**13. Academic Calendar** (BR13)
List or simple calendar-style view of key academic dates: exam periods, add/drop deadlines, semester milestones. Grouped by month or upcoming order — a scannable list is fine, a full interactive calendar grid is not required. *Components: SectionHeader, ListRow.*

**14. Societies Directory** (BR5)
Browsable/searchable list of student societies, each row: name, category, short one-line description, member count optional. *Components: ListRow, SearchBar, FilterChip.*

**15. Society Detail + Join** (BR5, BR6)
Full society profile: name, description, recent activity/posts, upcoming events it's running, and a "Join" / "Express interest" action. *Components: Card, Button, ListRow (for recent activity).*

## Stage 4 — Services & Lost/Found (Screens 16–20)

**16. Services Hub**
A simple menu screen listing the service categories available (Lost & Found, Facility Issues, Room Booking, Academic Support, FAQ, etc.) as a clean list, not an icon grid — each row navigates to that flow. *Components: ListRow.*

**17. Lost & Found Feed** (BR7)
Two-tab list: "Lost" items and "Found" items, each row showing item name, short description, location, date. Search/filter by category. *Components: Tabs, ListRow, SearchBar, FilterChip.*

**18. Report Lost Item** (BR7)
Form: item name/category, description, last known location, date lost, optional photo, contact preference. Submit button. *Components: FormField, Button.*

**19. Report Found Item** (BR7)
Form: item name/category, description, location found, date found, optional photo, where it's being held. Submit button. *Components: FormField, Button.*

**20. Item Detail / Claim** (BR7)
Full detail of a lost/found listing plus a "This is mine" / "Contact reporter" action that starts a claim, which then shows up in the reporting user's tracking (Screen 26/27). *Components: Card, Button, StatusBadge (Open/Claimed/Resolved).*

## Stage 5 — Other Request Forms (Screens 21–25)

**21. Report Facility Issue** (BR21)
Form: issue category (electrical, plumbing, furniture, etc.), location/room, description, optional photo, urgency level. Submit button. *Components: FormField, Button.*

**22. Request Academic Support** (BR9)
Form: support type (peer tutoring, study group, mentorship), subject/course, brief description of need, preferred availability. Submit button. *Components: FormField, Button.*

**23. Submit Feedback / Question** (BR17)
Simple form: category (feedback, question, suggestion), message body, optional contact-back toggle. Submit button. *Components: FormField, Button.*

**24. List a Textbook / Study Material** (BR27)
Form: title/course, condition, price (or "free"), description, optional photo, contact preference. Submit button. *Components: FormField, Button.*

**25. Browse Textbook Exchange** (BR27)
Searchable/filterable list of textbook listings from other students: title, course, condition, price, lister. Tapping opens contact details or a simple contact action. *Components: ListRow, SearchBar, FilterChip.*

## Stage 6 — Tracking & Room Booking (Screens 26–30)

**26. My Requests (Tracking Dashboard)**
Unified list of everything the current student has submitted — lost/found reports, facility issues, academic support requests, feedback, room bookings — each row with type, short title, status badge, date. This is the screen that makes all those forms feel like a real system rather than a black hole. *Components: ListRow, StatusBadge, FilterChip (by type/status).*

**27. Request Detail / Status Timeline**
Detail of a single submitted request: full submitted info, current status, and a simple timeline (Submitted → In review → Resolved/Rejected) with timestamps and any staff response note. *Components: Card, StatusBadge.*

**28. Classroom Availability Browser** (BR8)
List or simple schedule view of rooms with their current/upcoming availability (Free / Booked, with time ranges), filterable by building or capacity. *Components: ListRow, StatusBadge, FilterChip.*

**29. Room Booking Request** (BR8)
Form: room (pre-filled if coming from Screen 28), date, start/end time, purpose, group size. Submit button. Goes into staff approval queue (Screen 46). *Components: FormField, Button.*

**30. My Bookings**
List of the student's own room booking requests with status (Pending / Approved / Rejected) and details. *Components: ListRow, StatusBadge.*

## Stage 7 — AI, FAQ, Staff Directory, Profile, System States (Screens 31–35)

**31. AI Assistant** (BR33)
A conversational chat screen: message list (user + assistant bubbles), input field at the bottom. Assistant answers natural-language questions and can deep-link to the relevant screen (e.g. "show me tonight's events" → navigates to Events feed). Keep the visual style consistent with the rest of the app — plain bubbles, no gradient/glow effects, no decorative avatar art. *Components: Card (message bubble), FormField (input), Button (send).*

**32. FAQ** (BR10)
Searchable list of frequently asked questions grouped by category, expandable rows (question → answer), no extra chrome. *Components: SearchBar, ListRow (expandable), FilterChip.*

**33. Staff Directory** (BR22)
Searchable list of staff/department contacts: name, role/department, contact method (email/office hours). *Components: ListRow, SearchBar, FilterChip.*

**34. Profile / Settings**
User's own info (name, faculty, year), notification preferences, log out action, and a link back to "My Requests." *Components: Card, FormField, Button.*

**35. System States (Empty / Error / Offline)**
Not a single screen but the shared empty/error/offline state pattern used across all list screens: short heading + one sentence + optional retry/action button. Build once as a reusable `EmptyState`/`ErrorState` component and apply it to every list/feed screen from Phases 1–3 retroactively. *Components: EmptyState.*

## Stage 8 — Staff Console: Content (Screens 36–40)

**36. Staff Login / Console Dashboard**
Separate login flow (or role-gate on the same login) leading to a staff home: quick stats (pending requests count, active alerts, recent submissions) and shortcuts to the content/alerts/ops sections. Desktop/wide layout. *Components: Card, SectionHeader.*

**37. Announcement Composer** (BR11, BR12)
Form: title, body, scope (university-wide / specific faculty / specific year), publish now or schedule. Only accessible to roles authorized to publish (BR12). *Components: FormField, Button.*

**38. Content Management List** (BR11)
Table/list of all published content (announcements, alerts, events, etc.) owned by this staff user or their department, with edit/unpublish actions and status (Published/Draft/Scheduled). *Components: ListRow or data table, StatusBadge, FilterChip.*

**39. Event Management** (BR3, staff side)
Staff-side create/edit form for events plus a list of the department's events with interest-count (from BR4 RSVPs) visible. *Components: FormField, Button, ListRow.*

**40. Society Management** (BR5, staff/society-rep side)
For society representatives: edit society profile, post updates, view join requests (BR6) and approve/see interest list. *Components: FormField, Button, ListRow.*

## Stage 9 — Staff Console: Alerts & Requests (Screens 41–45)

**41. Emergency Alert Broadcast** (BR15)
Form restricted to authorized roles: alert title, message, severity (Critical/Advisory), scope, send immediately. Confirmation step before sending given the sensitivity. *Components: FormField, Button, StatusBadge.*

**42. Schedule Change Broadcast** (BR16)
Form: affected area (campus-wide/building/faculty), reason, effective date/time range, message. *Components: FormField, Button.*

**43. Facility Issue Queue** (BR21, staff side)
Table/list of submitted facility issues with status filters (Open/In progress/Resolved), assign/update-status actions. *Components: ListRow/data table, StatusBadge, FilterChip.*

**44. Academic Support Queue** (BR9, staff side)
List of academic support requests with status, assign-to-staff action, and a response field. *Components: ListRow/data table, StatusBadge, FormField (response).*

**45. Feedback Inbox** (BR17, staff side)
List of submitted feedback/questions, filterable by category/status, with a reply/resolve action. *Components: ListRow/data table, StatusBadge, FormField (reply).*

## Stage 10 — Staff Console: Ops (Screens 46–50)

**46. Room Booking Approval Queue** (BR8, staff side)
List of pending/approved/rejected booking requests with approve/reject actions and conflict warnings if two requests overlap. *Components: ListRow/data table, StatusBadge.*

**47. Lost & Found Admin** (BR7, staff side)
Admin view of all lost/found listings with the ability to mark items resolved/claimed and manage potential matches between a "lost" and a "found" report. *Components: ListRow/data table, StatusBadge.*

**48. User & Access Role Management** (BR12)
Table of staff accounts with their role (academic/society/finance/administrative/admin) and permission level, with edit-role action. This is the screen that enforces BR12's differentiated access. *Components: data table, StatusBadge/role chip, Button.*

**49. FAQ Management** (BR10, staff side)
List of FAQ entries with add/edit/delete, grouped by category. *Components: FormField, Button, ListRow.*

**50. Staff Directory Management** (BR22, staff side)
List of directory entries with add/edit/delete for departments to keep their own contact info current (BR11's "keep accurate" requirement applied to this dataset). *Components: FormField, Button, ListRow.*

## Stage 11 — Highlights & Admin (Screens 51–53)

**51. Student Life Highlights** (BR32)
A feed of past event recaps/achievements — photos optional, short write-ups, so it can double as the university's "proof of life" showcase. Mobile, student-facing. *Components: ListRow/Card, SectionHeader.*

**52. Opportunities Board** (BR18, BR19, BR20)
Combined feed of volunteering opportunities, alumni-related activities, and job/internship/placement listings, with a filter to separate the three types since they're distinct audiences within one BR-light category. Mobile, student-facing. *Components: ListRow, FilterChip, SearchBar.*

**53. Admin Overview Dashboard**
Top-level admin screen (desktop): cross-cutting stats across all modules — open requests by type, active alerts, recent content published, pending role changes — the "one glance, whole system" screen for whoever owns the platform long-term (ties back to Project Objective: "a stronger long-term foundation"). *Components: Card, SectionHeader, data table (recent activity).*
