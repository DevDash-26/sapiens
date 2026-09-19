# Design System — Mandatory for Every Screen

Audience: a Gen-Z student body, but a solution the university would actually trust and adopt long-term. The target feel is **"enterprise-grade product, worn by a younger brand"** — think Linear, Notion, or a well-designed banking app: confident, high-contrast, legible, information-dense where it needs to be — not a flashy hackathon demo.

This file is not optional styling guidance — every phase must follow it. If a phase doc's screen description conflicts with this file, this file wins.

## Hard "no AI slop" rules

These are explicit bans. Do not do any of the following, anywhere in the app:

1. **No low-opacity / translucent surfaces.** No `rgba(255,255,255,0.1)`-style glass cards, no frosted-glass panels, no semi-transparent overlays used as a primary surface. Cards and containers use solid, opaque backgrounds with real contrast against the page background. Elevation comes from subtle shadows or borders, not transparency.
2. **No gradient soup.** Do not default to purple-to-blue or pink-to-orange gradients on buttons, headers, or backgrounds. Gradients are allowed only as a rare, deliberate accent (e.g. one hero banner on the home screen), never as the default button/card style.
3. **No icon or emoji clutter.** Icons are functional, not decorative. Don't add an icon next to every label, every list item, every stat. If a piece of UI is understandable from its text alone, it doesn't need an icon. No emoji in UI copy or as substitutes for icons.
4. **No unnecessary SVG illustrations.** Avoid stock-style blob illustrations, generic "flat character" art, or decorative SVGs used just to fill empty space. Empty states use short, clear copy and a single simple icon at most — not an illustration.
5. **No generic "AI app" fonts.** Do not use Poppins, Montserrat, Quicksand, or similar rounded geometric fonts as the default — they read as generated/templated. Do not use a monospace font for body or UI text (monospace only for things that are genuinely code/IDs, if ever). Use the typography spec below instead.
6. **No unnecessary subtitles or filler copy.** Every screen needs a clear heading; it does not need a one-line explainer subtitle under every heading and every card just to sound polished. If the label already says what it is, don't add a sentence restating it.
7. **No excessive rounding.** Avoid fully pill-shaped buttons and cards everywhere. Use moderate, consistent corner radii (see below) — enough to feel current, not so much it reads as a template.

## Typography

- Primary UI typeface: **Inter** (fallback: system default — San Francisco on iOS, Roboto on Android). Inter is clean, highly legible at small sizes, and is what serious modern products use — it does not read as "AI generated."
- Do not introduce a second display/decorative typeface. Personality comes from color, spacing and content — not from a second font.
- Weight scale: Regular (400) for body text, Medium (500) for labels/buttons, Semibold (600) for headings. Avoid Bold (700+) except for large hero numbers/headlines.
- Type scale (mobile): Display 28/34, H1 22/28, H2 18/24, Body 15/22, Caption 13/18. Staff console (wider layouts) can use a slightly denser scale: Body 14/20, Caption 12/16.
- Minimum body text size: 14px. Never go smaller for anything a user needs to read (not just decorative labels).

## Color

Define these as theme tokens (e.g. in `theme/colors.ts`) and use them everywhere — no hardcoded hex values in screen files.

- **Primary brand color:** a single deep, saturated color (not neon, not pastel) — e.g. a deep indigo (`#3730A9`-ish) or deep teal. Used for primary buttons, active nav states, links, key highlights. Pick one and use it consistently; do not introduce a second "accent" hue competing for attention.
- **Neutrals:** a proper gray scale from near-white background to near-black text, with enough steps for background / card surface / border / muted text / primary text. All text-on-background pairs must meet at least WCAG AA contrast (4.5:1 for body text).
- **Semantic colors (solid, not tinted-pastel):** Success (green), Warning (amber), Error (red), Info (blue) — each with a solid-fill badge/chip style and a corresponding readable text-on-color combination. Don't use these as low-opacity background washes; use them as solid chips/badges or left-border accents.
- **Dark backgrounds get dark surfaces, light backgrounds get light surfaces** — no translucency-based theming trick. If dark mode is in scope, it's a fully separate token set, not opacity-adjusted light mode.

## Layout & spacing

- 8pt spacing grid (4, 8, 12, 16, 24, 32...). Be consistent — don't eyeball spacing per screen.
- Corner radius: small controls (chips, inputs) 8px, cards 12px, modals/sheets 16px. Nothing above 20px except where a fully round control is semantically correct (e.g. an avatar, a small icon-only FAB if one is genuinely needed).
- Student mobile screens: single column, generous touch targets (min 44px height), bottom tab bar for primary navigation (4–5 tabs max).
- Staff console screens: can use multi-column layouts (sidebar nav + content, or list + detail split view) since they run on wider viewports — this is where "enterprise" density is appropriate. Data tables, filters, and bulk actions are expected here.

## Components (build these once in Phase 1–2, reuse everywhere)

- `Button` (primary solid, secondary outline, tertiary text-only, destructive) — text-first, icon only when it adds real meaning (e.g. a trailing chevron on a nav row).
- `Card` — solid surface, subtle border or shadow, consistent padding.
- `ListRow` — for announcements, events, requests, etc. Title, short meta line, optional single status badge. No stacked icon rows.
- `StatusBadge` — solid-color chip: Pending / Approved / Rejected / Resolved / Open, etc.
- `EmptyState` — heading + one short sentence + optional single action button. No illustration required; a single small icon is enough if any.
- `FormField` — label above input, clear error text below in the Error color, no placeholder-as-label anti-pattern.
- `SectionHeader` — for grouping content on Home/dashboards; text only, no decorative rule unless it's a simple 1px divider.
- `Tabs`, `SearchBar`, `FilterChip` — shared across list/browse screens (events, societies, announcements, requests).

## Tone of copy

- Direct and plain. "Report a lost item," not "Let's help you find what you lost! 🎒".
- No exclamation marks by default. No emoji in system copy.
- Gen-Z-appropriate means efficient and non-patronizing, not cutesy. Staff/admin screens should read as fully professional (no informal copy at all there).

## How "enterprise meets Gen-Z" actually shows up

- **Enterprise side:** solid contrast, dense and well-organized staff console, real data tables, clear status/workflow states (pending → approved → resolved), role-gated access, no fluff copy.
- **Gen-Z side:** a confident single brand color used boldly (not beige-corporate), clean modern type (Inter, not Times-New-Roman-enterprise), fast and low-friction flows (RSVP/join in one tap, not a 5-field form), a home feed that feels like a feed (not a static portal page).
