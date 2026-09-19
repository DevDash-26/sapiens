# Phase 1 — Foundation (Screens 1–10)

## Prompt to give Antigravity

> Also treat `.\docs\API-Contract+DataModel.md` as the single source of truth for the API contract and data models — every data shape you use in this phase (mock or otherwise) must match it exactly. Check `wireframes/*.html` for the original UI/color direction, but `devdash-docs/01-DESIGN-SYSTEM.md` overrides it wherever they differ.
>
> Read `devdash-docs/01-DESIGN-SYSTEM.md` and `devdash-docs/03-PROGRESS-TRACKER.md` first — these govern how you build. Then read the Phase 1 section of `devdash-docs/02-SCREEN-INVENTORY.md` for full detail on each screen below.
>
> Build Phase 1 of the DevDash'26 Expo app: screens 1–10 (Splash, Login, Sign Up, Onboarding, Home, Announcements Feed, Announcement Detail, Alerts Feed, Schedule Change Notice, Notifications Center).
>
> Before writing screen code, set up the shared foundation, since every later phase depends on it:
> - Theme tokens (colors, spacing, radius, typography) per the design system.
> - The shared component library: `Button`, `Card`, `ListRow`, `StatusBadge`, `FormField`, `SectionHeader`, `SearchBar`, `FilterChip`.
> - Local mock data layer (e.g. `lib/mockData/`) with realistic seed data for announcements, alerts, and a couple of faculties/years, so screens render real-looking content rather than lorem ipsum.
> - Navigation shell (student-facing bottom tabs; a placeholder tab is fine for sections not yet built).
>
> Then build the 10 screens, following the design system strictly — no translucent cards, no gradient buttons, no icon clutter, Inter typography, solid contrast.
>
> After each screen is done, mark it `done` in `devdash-docs/03-PROGRESS-TRACKER.md` immediately, with a one-line note if you made any assumption. Update the overall progress count and timestamp at the bottom of that file when you finish the phase.
>
> Stop after screen 10 and summarize what was built, what shared components/theme now exist for later phases to reuse, and anything you'd flag before moving to Phase 2.

## Screens in this phase

1. Splash / Loading
2. Login
3. Sign Up / Register
4. Onboarding — Faculty & Year Selection
5. Home / Dashboard
6. Announcements Feed
7. Announcement Detail
8. Alerts Feed
9. Schedule Change Notice
10. Notifications Center

(Full spec for each: `02-SCREEN-INVENTORY.md`, Stage 1 & Stage 2 sections.)

## Acceptance checklist

- [ ] Theme tokens file exists and is used everywhere (no hardcoded colors in screens)
- [ ] Shared components exist under `components/` and are reused, not duplicated per screen
- [ ] Mock data layer exists with believable seed content
- [ ] All 10 screens render, navigate correctly, and pass the design system's "no AI slop" checklist
- [ ] Home screen genuinely pulls from announcements + alerts + events preview data (even if Events isn't built yet, stub the section cleanly)
- [ ] Progress tracker updated for all 10 screens
