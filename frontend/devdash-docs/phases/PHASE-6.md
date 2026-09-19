# Phase 6 — Highlights & Admin Overview (Screens 51–53)

## Prompt to give Antigravity

> Also treat `.\docs\API-Contract+DataModel.md` as the single source of truth for the API contract and data models — every data shape you use in this phase (mock or otherwise) must match it exactly. Check `wireframes/*.html` for the original UI/color direction, but `devdash-docs/01-DESIGN-SYSTEM.md` overrides it wherever they differ.
>
> Read `devdash-docs/01-DESIGN-SYSTEM.md` and check `devdash-docs/03-PROGRESS-TRACKER.md` before starting. Read the Phase 6 section of `devdash-docs/02-SCREEN-INVENTORY.md` for full screen detail.
>
> Build the final 3 screens: Student Life Highlights (mobile, student-facing), Opportunities Board (mobile, student-facing, combining volunteering/alumni/jobs listings with a type filter), and Admin Overview Dashboard (staff console, wide layout — a cross-cutting summary pulling live counts from the data built in Phases 3–5: open requests by type, active alerts, recently published content, pending role changes).
>
> After these are built, do a full pass across all 53 screens:
> - Confirm every screen is marked `done` in `devdash-docs/03-PROGRESS-TRACKER.md`.
> - Spot-check a sample of screens from each earlier phase against `01-DESIGN-SYSTEM.md`'s "no AI slop" checklist and fix any drift.
> - Confirm navigation is complete end to end — no dead links, no screen unreachable from the nav.
> - Confirm the shared component library (`components/`) has no duplicated one-off versions of the same component built in different phases.
>
> Summarize the final state of the app and flag anything you'd recommend addressing before a real deployment (beyond hackathon scope) — e.g. real auth, real backend, NFR2/NFR3 performance and reliability work.

## Screens in this phase

51. Student Life Highlights
52. Opportunities Board
53. Admin Overview Dashboard

(Full spec: `02-SCREEN-INVENTORY.md`, Stage 11 section.)

## Acceptance checklist

- [ ] All 3 screens built and on-theme
- [ ] Admin Overview Dashboard pulls real counts from existing mock data, not static placeholder numbers
- [ ] All 53 screens confirmed `done` in the progress tracker
- [ ] Full design-system compliance pass completed across all phases
- [ ] No dead-end navigation anywhere in the app
- [ ] Final summary written with post-hackathon recommendations (auth, backend, performance/reliability)
