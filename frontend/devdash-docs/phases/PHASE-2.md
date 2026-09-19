# Phase 2 — Student Core Utilities (Screens 11–20)

## Prompt to give Antigravity

> Also treat `.\docs\API-Contract+DataModel.md` as the single source of truth for the API contract and data models — every data shape you use in this phase (mock or otherwise) must match it exactly. Check `wireframes/*.html` for the original UI/color direction, but `devdash-docs/01-DESIGN-SYSTEM.md` overrides it wherever they differ.
>
> Read `devdash-docs/01-DESIGN-SYSTEM.md` and check `devdash-docs/03-PROGRESS-TRACKER.md` for current status before starting. Read the Phase 2 section of `devdash-docs/02-SCREEN-INVENTORY.md` for full screen detail.
>
> Build Phase 2 of the DevDash'26 Expo app: screens 11–20 covering Events/Calendar/Societies and Services/Lost & Found (Events Feed, Event Detail + RSVP, Academic Calendar, Societies Directory, Society Detail + Join, Services Hub, Lost & Found Feed, Report Lost Item, Report Found Item, Item Detail / Claim).
>
> Reuse the shared components and theme from Phase 1 — do not recreate `Button`, `Card`, `ListRow`, `FormField`, etc. If a screen needs a new shared component (e.g. `Tabs` for the Lost/Found split), build it under `components/` so later phases can reuse it too, and note it added in the tracker.
>
> Extend the mock data layer with events, societies, and lost/found listings.
>
> Wire the "I'm interested"/"Join"/"Report" actions to local state changes (mocked, no backend) so the UI reflects the action (e.g. RSVP button changes state after tapping).
>
> Mark each screen `done` in `devdash-docs/03-PROGRESS-TRACKER.md` as you finish it. Stop after screen 20 and summarize what's built and anything to flag before Phase 3.

## Screens in this phase

11. Events Feed
12. Event Detail + RSVP
13. Academic Calendar
14. Societies Directory
15. Society Detail + Join
16. Services Hub
17. Lost & Found Feed
18. Report Lost Item
19. Report Found Item
20. Item Detail / Claim

(Full spec: `02-SCREEN-INVENTORY.md`, Stage 3 & Stage 4 sections.)

## Acceptance checklist

- [ ] No shared component rebuilt from scratch — Phase 1 components reused
- [ ] Events/Societies/Lost&Found all backed by extended mock data
- [ ] RSVP / Join / Report actions reflect state changes in the UI
- [ ] Services Hub correctly routes to Lost & Found (built) and stubs remaining categories cleanly for later phases
- [ ] Design system compliance maintained (spot-check against the "no AI slop" list)
- [ ] Progress tracker updated for all 10 screens
