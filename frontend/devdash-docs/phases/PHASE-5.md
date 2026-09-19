# Phase 5 — Staff Console: Alerts, Requests & Ops (Screens 41–50)

## Prompt to give Antigravity

> Also treat `.\docs\API-Contract+DataModel.md` as the single source of truth for the API contract and data models — every data shape you use in this phase (mock or otherwise) must match it exactly. Check `wireframes/*.html` for the original UI/color direction, but `devdash-docs/01-DESIGN-SYSTEM.md` overrides it wherever they differ.
>
> Read `devdash-docs/01-DESIGN-SYSTEM.md` and check `devdash-docs/03-PROGRESS-TRACKER.md` before starting. Read the Phase 5 section of `devdash-docs/02-SCREEN-INVENTORY.md` for full screen detail.
>
> Build Phase 5 of the DevDash'26 Expo app: screens 41–50, all staff console. Use the staff console navigation/layout scaffold from Phase 4 — extend it, don't rebuild it.
>
> Screens 43, 44, 45, 46 are queues that read/act on the generic "request" data model established in Phase 3 (screen 26's data source). Each queue should filter to its own request type, support a status change action (e.g. Open → In progress → Resolved, or Pending → Approved/Rejected for bookings), and — critically — those status changes must reflect back in the corresponding student-facing tracking screens (26/27/30) since that end-to-end loop is the actual point of the tracking system.
>
> Screen 48 (User & Access Role Management) is the concrete implementation of BR12's differentiated access levels — build it as a real role table (student/academic staff/society rep/finance staff/admin staff) with edit actions, and make sure the staff console's own route gating (from Phase 4) actually respects these roles where relevant (e.g. only admin/academic staff can access Emergency Alert Broadcast).
>
> Mark each screen `done` in the tracker as you finish it. Stop after screen 50 and summarize the full staff-side coverage, and confirm the queue → student-tracking feedback loop works.

## Screens in this phase

41. Emergency Alert Broadcast
42. Schedule Change Broadcast
43. Facility Issue Queue
44. Academic Support Queue
45. Feedback Inbox
46. Room Booking Approval Queue
47. Lost & Found Admin
48. User & Access Role Management
49. FAQ Management
50. Staff Directory Management

(Full spec: `02-SCREEN-INVENTORY.md`, Stage 9 & Stage 10 sections.)

## Acceptance checklist

- [ ] All four request queues (43/44/46/47) act on the same underlying data as the student My Requests screen (26) — status changes are visible on both sides
- [ ] Emergency Alert Broadcast (41) has a confirmation step before sending, given its sensitivity
- [ ] User & Access Role Management (48) is a real, editable role table, and staff route-gating respects it
- [ ] FAQ Management (49) writes to the same data the student FAQ screen (32) reads
- [ ] Staff Directory Management (50) writes to the same data the student Staff Directory (33) reads
- [ ] Progress tracker updated for all 10 screens
