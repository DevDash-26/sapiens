# DevDash'26 — Frontend Build Docs (for Antigravity CLI)

This folder is a **self-governing build plan** for the UCL DevDash'26 frontend (Expo/React Native).
It is meant to be dropped into the root of your already-set-up Expo template project, e.g.:

```
your-expo-app/
├── app/
├── components/
├── ...
└── devdash-docs/        <- this folder
```

## What's in here

| File | Purpose |
|---|---|
| `00-MASTER-PLAN.md` | The full 53-screen plan, grouped into 6 build phases. Read this first. |
| `01-DESIGN-SYSTEM.md` | Mandatory styling rules (colors, type, components, "no AI slop" rules). Must be followed on every screen, every phase. |
| `02-SCREEN-INVENTORY.md` | The full spec for all 53 screens — what each screen shows, what components it needs. |
| `03-PROGRESS-TRACKER.md` | The single source of truth for build status. Antigravity must read this before starting work and update it after every screen. |
| `phases/PHASE-1..6.md` | One prompt-ready brief per phase. Give these to Antigravity one at a time. |

## How to use this with Antigravity CLI

1. Copy this whole `devdash-docs/` folder into your Expo project root.
2. Open Antigravity CLI in that project directory.
3. For each phase, give Antigravity a message like:

   > Read `devdash-docs/01-DESIGN-SYSTEM.md`, `devdash-docs/03-PROGRESS-TRACKER.md`, and `devdash-docs/phases/PHASE-1.md`. Also read `.\docs\API-Contract+DataModel.md` — this is our single source of truth for the API contract and data models, so all data shapes, field names, and request/response structures must match it exactly. Check `wireframes/*.html` for the initial UI direction (layout, colors, general feel) before building, but where a wireframe conflicts with `01-DESIGN-SYSTEM.md`, the design system wins. Then start Phase 1: build the screens listed there, following the design system exactly. Update `03-PROGRESS-TRACKER.md` as you complete each screen. Stop and summarize when the phase is done.

## Reference sources Antigravity must always check

- **`.\docs\API-Contract+DataModel.md`** — single source of truth for API contracts and data models. Every mock data shape used in the app now must mirror this file's structure, so swapping in the real backend later is a drop-in change, not a rewrite.
- **`wireframes/*.html`** — initial UI reference for layout and color direction only. Useful for getting the general idea across before `01-DESIGN-SYSTEM.md` was written; `01-DESIGN-SYSTEM.md` is the final authority whenever the two disagree.

4. When a phase finishes, review the screens, then say **"start phase 2"** (etc.). Each phase file is self-contained — Antigravity doesn't need memory of earlier phases, only the progress tracker and design system, so this works even in a fresh session.
5. If a session gets interrupted mid-phase, just say **"continue"** — Antigravity should re-read `03-PROGRESS-TRACKER.md`, see which screens in the current phase are marked `done` vs `not started`, and resume from there. This is the whole point of the tracker: it's the memory across sessions.

## Governance rules Antigravity should always follow

- Never skip `01-DESIGN-SYSTEM.md` — every screen must comply with it, no exceptions, even under time pressure.
- Never start a phase's screens without first checking `03-PROGRESS-TRACKER.md` for what's already done, to avoid rebuilding or conflicting work.
- After finishing each individual screen (not just each phase), mark it `done` in the tracker immediately — don't batch updates to the end, since a session can be interrupted at any point.
- If a screen's spec in `02-SCREEN-INVENTORY.md` is ambiguous, make the most sensible enterprise-appropriate decision, note the assumption in the tracker's Notes column, and keep moving — don't stall the phase on a clarifying question.
- Reuse components aggressively. By Phase 2, a shared component library (cards, list rows, form fields, buttons, status badges, empty states) should exist under `components/` — later phases should import from it, not reinvent it.

## Priority order (if time runs out before all 6 phases are done)

Phases 1 → 2 → 3 cover the highest-priority stages (entry/home, content/alerts, services, tracking, AI/FAQ, events). A judge-ready demo is possible after Phase 3 alone. Phases 4–6 add staff console and polish.
