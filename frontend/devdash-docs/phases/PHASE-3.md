# Phase 3 — Engagement & Assistance (Screens 21–30)

## Prompt to give Antigravity

> Also treat `.\docs\API-Contract+DataModel.md` as the single source of truth for the API contract and data models — every data shape you use in this phase (mock or otherwise) must match it exactly. Check `wireframes/*.html` for the original UI/color direction, but `devdash-docs/01-DESIGN-SYSTEM.md` overrides it wherever they differ.
>
> Read `devdash-docs/01-DESIGN-SYSTEM.md` and check `devdash-docs/03-PROGRESS-TRACKER.md` before starting. Read the Phase 3 section of `devdash-docs/02-SCREEN-INVENTORY.md` for full screen detail.
>
> Build Phase 3 of the DevDash'26 Expo app: screens 21–30 — the remaining request forms, the unified tracking dashboard, and room booking (Report Facility Issue, Request Academic Support, Submit Feedback, List a Textbook, Browse Textbook Exchange, My Requests, Request Detail/Status Timeline, Classroom Availability Browser, Room Booking Request, My Bookings).
>
> Screen 26 (My Requests) is the important one: it must pull together everything submitted through screens 18/19 (lost/found reports), 21 (facility issues), 22 (academic support), 23 (feedback), and 29 (room bookings) into one status-tracked list. Design the mock data model for "a submitted request" once, generically, so every form in this phase (and the ones already built in Phase 2) writes into it consistently — this generic request model is also what staff console queues in Phases 4–5 will read from.
>
> Reuse shared components. Extend mock data for textbook listings and room/booking availability.
>
> Mark each screen `done` in the tracker as you finish it. Stop after screen 30 and summarize the request-tracking data model you used, since Phases 4–5's staff queues depend on it matching.

## Screens in this phase

21. Report Facility Issue
22. Request Academic Support
23. Submit Feedback / Question
24. List a Textbook
25. Browse Textbook Exchange
26. My Requests (Tracking Dashboard)
27. Request Detail / Status Timeline
28. Classroom Availability Browser
29. Room Booking Request
30. My Bookings

(Full spec: `02-SCREEN-INVENTORY.md`, Stage 5 & Stage 6 sections.)

## Acceptance checklist

- [ ] A single generic "request" data model backs Lost/Found, Facility Issues, Academic Support, Feedback, and Room Bookings
- [ ] My Requests (26) correctly aggregates across all request types with working status badges
- [ ] Request Detail (27) shows a real status timeline, not just a static state
- [ ] Room booking flow (28→29→30) is coherent: browsing availability pre-fills the booking form
- [ ] Progress tracker updated for all 10 screens
- [ ] Note left in tracker/summary describing the request data model shape, for Phase 4/5 staff queues to match
