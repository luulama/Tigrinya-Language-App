# Tigrinya Learning App — Complete UX & Design Audit

**Scope:** Full inspection of `apps/web` (20 Next.js App Router pages, shared layout shell, onboarding, first-lesson experience, learning path, review queue, progress/achievements, parent/teacher supervision, games/stories/conversations, and `@polyglot/ui`).

## 1. Executive Summary

The codebase already has unusually strong educational ethics and engineering discipline: truthful evidence tracking, explicit review gates, non-punitive retries, strict accessibility foundations, and privacy-respecting local/account boundaries. However, the visual presentation and interaction architecture read like an early developer prototype rather than a warm, calm, world-class learning product.

## 2. Screen-by-Screen Findings

| Area | Key Issues Found | Priority |
| --- | --- | --- |
| **Design System (`globals.css`, `entry-systems.css`, `@polyglot/ui`)** | Only 6 CSS tokens; hardcoded ad-hoc hex colors scattered across components; flat 1px bordered boxes with zero depth hierarchy; raw browser `<select>` inputs; no hover/press tactile states; generic system font stack without a warm display/body pairing or loaded Ethiopic webfont fallback. | **P0 — Foundation** |
| **Learning Path (`/learn`)** | Most critical screen is reduced to two static cards plus two `<details>` blocks. No visual progression path, no unit/chapter structure, no milestone discovery, no "what to do next" focus card, and no clear review opportunity surface. | **P0 — Core Experience** |
| **Onboarding (`/onboarding`)** | Feels like an austere vertical form: plain stacked buttons, raw `<select>` for pacing, no progress indicator, no learner-type / guide-language / daily-rhythm framing, and raw links placed next to primary buttons on the plan summary. | **P0 — Conversion & Retention** |
| **Lesson Flow (`/first-lesson`, `/learn/[id]`, `/review`)** | Flat container panels, tiny progress dashes, unstyled `<ul>` recap list, raw SVG drawing rectangle without gentle typography baselines, small action hierarchy, and muted completion moments that miss an opportunity for warm, restrained pride. | **P0 — Core Loop** |
| **Mele Companion (`bear-companion.tsx`, `learning-journey.tsx`)** | Treated as a repeated generic box rather than a coherent companion system with mood-matched surfaces, calm personality voice, contextual empty states, encouragement, and celebration moments. | **P1 — Emotional Design** |
| **Navigation & Mobile UX (`shell.tsx`)** | Top header wraps awkwardly into two rows on narrow phones; no thumb-friendly mobile bottom navigation bar; desktop footer dumps 9 undifferentiated links; secondary tools compete visually with core learner actions. | **P1 — Mobile-First** |
| **Landing Page (`/`)** | Good restraint and clear headline, but flat 3-card row and stark layout lack the warmth, tactile Fidäl richness, and audience resonance needed for children, adult beginners, and heritage learners. | **P1 — First Impression** |
| **Progress, Achievements & Parents (`/progress`, `/achievements`, `/parents`)** | Text-only stacked paragraphs inside flat cards; no visual skill evidence meters; weak distinction between visit-only observations and verified linked accounts; dry empty states. | **P2 — Trust & Clarity** |

## 3. Accessibility & Motion Audit (WCAG 2.2 AA)

- **Strengths preserved:** Skip link, semantic landmarks, `lang="ti" dir="ltr"` on Fidäl, `aria-live="polite"` status regions, keyboard focus management on step transitions, accessible drawing alternatives (text & visual skip), and `prefers-reduced-motion` support.
- **Improvements implemented:** Unified high-contrast WCAG AA+ color token pairs (all normal text >= 4.5:1), 48px+ primary touch targets across mobile and desktop, non-color state indicators (checkmarks, locks, badges), refined focus rings, bottom mobile navigation with safe-area insets, and strictly purposeful 60fps GPU-composited transitions (`transform`, `opacity`) disabled completely under `prefers-reduced-motion: reduce`.

## 4. Improvement Priorities Executed

1. **P0 — Semantic Design System:** Warm parchment-and-botanical palette, Fraunces + Source Sans 3 + Noto Sans Ethiopic typography scale (supporting Tigrinya, Swedish, English), 4px spacing scale, 4-tier warm elevation, and upgraded `@polyglot/ui` primitives.
2. **P0 — Visual Learning Path (`/learn`):** Winding stepping-stone curriculum map covering Unit 1 Fidäl Foundations, Unit 2 First Words (4 themed chapters), Unit 3 Read & Write, and honest locked gates for Units 4–5, paired with a <1-second "Next step" focus hero and quick review/game shortcuts.
3. **P0 — Empathetic Onboarding (`/onboarding`):** Visual 5-step guided journey with tactile illustrated choice cards, integrated learner-type / guide-language / daily-rhythm adaptation, and a tailored starting plan summary.
4. **P0 — Focused Lesson Stage (`/first-lesson`, `/learn/[id]`, `/review`):** Smooth progress bar, warm paper Fidäl specimen & writing canvas with baseline guides, tactile choice tiles, gentle model comparison on retry, and a memorable first-Fidäl milestone celebration.
5. **P1 — Mele Companion System:** Unified emotional tokens, calm companion card styling, empty-state integration, and quiet-view continuity.
6. **P1 — Mobile-First Shell & Secondary Pages:** Clean top bar + thumb-friendly mobile bottom tab bar, plus cohesive redesign of `/`, `/games`, `/progress`, `/achievements`, `/parents`, `/profile`, `/signin`, and `/offline`.
