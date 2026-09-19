# Phase 4 — AI/FAQ/Profile & Staff Console Start (Screens 31–40)

## Prompt to give Antigravity

> Also treat `.\docs\API-Contract+DataModel.md` as the single source of truth for the API contract and data models — every data shape you use in this phase (mock or otherwise) must match it exactly. Check `wireframes/*.html` for the original UI/color direction, but `devdash-docs/01-DESIGN-SYSTEM.md` overrides it wherever they differ.
>
> Read `devdash-docs/01-DESIGN-SYSTEM.md` and check `devdash-docs/03-PROGRESS-TRACKER.md` before starting. Read the Phase 4 section of `devdash-docs/02-SCREEN-INVENTORY.md` for full screen detail.
>
> This phase has two halves — finish the student-facing "everyone" screens, then start the staff console.
>
> **Half A — screens 31–35 (student-facing, mobile):** AI Assistant, FAQ, Staff Directory, Profile/Settings, and the shared System States pattern (Empty/Error/Offline). Build the `EmptyState`/`ErrorState` component in this half and then retrofit it onto any list/feed screens from Phases 1–3 that don't yet handle an empty or error case — check them and fix any that are missing it.
>
> The AI Assistant (31) should be a real, styled chat UI (message bubbles, input bar) with a small set of scripted/mocked responses to common queries (e.g. "when's the next event", "how do I report a lost item") that can deep-link into the relevant already-built screen. It does not need a real LLM backend for this hackathon build — mock it, but make the UI production-quality.
>
> **Half B — screens 36–40 (staff console, wider/desktop layout):** Staff Login/Console Dashboard, Announcement Composer, Content Management List, Event Management (staff), Society Management (staff/rep). This is the first staff-facing work — set up a separate navigation stack gated by a mocked staff/admin role, and a wider-layout scaffold (sidebar nav + content area) that Phase 5 will keep building into. Announcement Composer (37) and Content Management (38) should write into the same announcement data used by screens 6/7 from Phase 1, so publishing here actually shows up in the student feed.
>
> Mark each screen `done` in the tracker as you finish it, noting in the tracker which half. Stop after screen 40 and summarize the staff console scaffold (nav structure, role gating) since Phase 5 builds directly on it.

## Screens in this phase

31. AI Assistant
32. FAQ
33. Staff Directory
34. Profile / Settings
35. System States (Empty/Error/Offline) — shared component + retrofit
36. Staff Login / Console Dashboard
37. Announcement Composer
38. Content Management List
39. Event Management (staff)
40. Society Management (staff/rep)

(Full spec: `02-SCREEN-INVENTORY.md`, Stage 7 & Stage 8 sections.)

## Acceptance checklist

- [ ] AI Assistant has a real chat UI, on-theme, with working deep-links to at least 3–4 other screens
- [ ] EmptyState/ErrorState component built once and applied across earlier list screens, not just new ones
- [ ] Staff console has its own gated navigation stack and wider-layout scaffold
- [ ] Announcement Composer writes to the same data source the student Announcements Feed reads from — publishing is visibly connected end to end
- [ ] Staff console screens read as more data-dense/enterprise than student screens, per the design system
- [ ] Progress tracker updated for all 10 screens
