# Visual Enhancement Requirements

## Introduction

This document extends the core requirements with visual design, accessibility, and UX polish requirements for CogniSync. The goal is a hackathon-winning UI that is beautiful, accessible, and emotionally resonant — designed for students who need cognitive support.

Design direction: calm, modern, trustworthy. Think Linear meets Notion meets a wellness app. Dark-friendly, high contrast, generous whitespace, subtle motion.

---

## Requirement V1: Design System & Tokens

**User Story:** As a developer, I want a consistent design token system so that all UI elements share a coherent visual language.

### Acceptance Criteria

1. THE App SHALL define CSS custom properties (or a tokens file) for: primary color (`#6366f1`), surface colors, border radius (`8px`, `12px`, `16px`), shadow levels, and spacing scale.
2. THE App SHALL use a single sans-serif font stack: `Inter, system-ui, sans-serif` with `font-display: swap`.
3. ALL interactive elements SHALL use `border-radius: 10px` or greater for a soft, approachable feel.
4. THE App SHALL support a light mode baseline with all colors meeting WCAG AA contrast (4.5:1 for text, 3:1 for UI components).
5. THE App SHALL define a consistent shadow scale: `sm` (card lift), `md` (modal), `lg` (dropdown).

---

## Requirement V2: Hero Header & Branding

**User Story:** As a first-time visitor, I want the app to feel polished and purposeful from the first second, so that I trust it and want to use it.

### Acceptance Criteria

1. THE App SHALL display a full-width hero header with a gradient background (indigo → violet, `#6366f1` → `#8b5cf6`).
2. THE header SHALL contain the CogniSync wordmark, a one-line tagline ("Academic content, simplified for you"), and a subtle animated background pattern (CSS-only, respects `prefers-reduced-motion`).
3. THE header gradient SHALL transition smoothly and NOT use `transition: all`.
4. THE header SHALL include a `<nav>` landmark with a skip-to-main-content link as the first focusable element.
5. THE App name SHALL use `text-wrap: balance` to prevent widows on narrow viewports.

---

## Requirement V3: Card-Based Layout

**User Story:** As a user, I want each section of output to feel like a distinct, scannable card so that I can navigate the results without feeling overwhelmed.

### Acceptance Criteria

1. EACH output section (Key Points, Priority Matrix, Simplified Content, Complexity Score, Reading Mode) SHALL be wrapped in a card component with: white background, `border-radius: 16px`, `box-shadow: 0 1px 3px rgba(0,0,0,0.08)`, and `1px solid #e2e8f0` border.
2. EACH card SHALL have a colored left-border accent (4px) using the section's theme color.
3. EACH card header SHALL include a section icon (SVG, `aria-hidden="true"`) and title in `font-size: 18px`, `font-weight: 600`.
4. Cards SHALL animate in with a `translateY(8px) → translateY(0)` + `opacity: 0 → 1` entrance, staggered by 80ms per card, respecting `prefers-reduced-motion`.
5. Cards SHALL use `transform` and `opacity` only for animation (compositor-friendly).

---

## Requirement V4: Adaptation Profile Selector — Visual Polish

**User Story:** As a user, I want the profile selector to feel like a premium feature, not a plain row of buttons.

### Acceptance Criteria

1. EACH profile button SHALL display: emoji icon (28px), label, and a one-line description below the label.
2. THE active profile button SHALL show a filled indigo background with white text and a subtle `box-shadow: 0 0 0 3px rgba(99,102,241,0.3)` glow ring.
3. ALL profile buttons SHALL have a `:focus-visible` ring using `outline: 2px solid #6366f1; outline-offset: 2px`.
4. THE transition on profile buttons SHALL list properties explicitly: `background-color 0.15s, border-color 0.15s, color 0.15s, box-shadow 0.15s`.
5. THE "Re-process" button SHALL use a filled indigo style with a spinner icon during loading, and SHALL be disabled (not just visually) while processing.
6. THE profile section SHALL include a `role="group"` with `aria-label="Reading profile"` wrapping the buttons.

---

## Requirement V5: Priority Matrix — Visual Polish

**User Story:** As a user, I want the Eisenhower matrix to look like a real productivity tool, not a plain grid.

### Acceptance Criteria

1. EACH quadrant SHALL have a distinct color scheme: Do Now (red tint, `#fef2f2`/`#ef4444`), Schedule (green tint, `#f0fdf4`/`#22c55e`), Delegate (amber tint, `#fffbeb`/`#f59e0b`), Eliminate (slate tint, `#f8fafc`/`#94a3b8`).
2. EACH quadrant header SHALL include a small colored badge/pill showing the task count.
3. EACH task item SHALL use a `<label>` wrapping both the checkbox and description text (single hit target, no dead zones).
4. Completed tasks SHALL animate out with `opacity: 0.4` and `text-decoration: line-through`, using `transition: opacity 0.2s, color 0.2s`.
5. THE matrix SHALL be responsive: single column on mobile (< 640px), two columns on desktop.
6. THE matrix SHALL include axis labels: "URGENT →" on the horizontal axis and "IMPORTANT ↑" on the vertical axis.

---

## Requirement V6: Complexity Dial — Visual Polish

**User Story:** As a user, I want the complexity slider to feel interactive and satisfying to use.

### Acceptance Criteria

1. THE slider track SHALL use a gradient fill from green (simple) to red (complex): `linear-gradient(to right, #22c55e, #f59e0b, #ef4444)`.
2. THE current level label SHALL animate smoothly when the value changes using `transition: color 0.2s`.
3. THE "rewriting…" status SHALL be displayed in an `aria-live="polite"` region so screen readers announce it.
4. THE slider SHALL have `touch-action: manipulation` to prevent double-tap zoom delay on mobile.
5. WHEN rewriting is in progress, THE slider SHALL show a pulsing indigo glow on the thumb using a CSS animation that respects `prefers-reduced-motion`.
6. THE grade level labels (Kindergarten, Elementary, etc.) SHALL appear as tick marks below the slider at their respective positions.

---

## Requirement V7: Document Ingestion — Visual Polish

**User Story:** As a user, I want the upload area to feel inviting and clear, not like a plain dashed box.

### Acceptance Criteria

1. THE file drop zone SHALL be a `<button>` element (or have `role="button"`, `tabIndex={0}`, and `onKeyDown` handler for Enter/Space) to be keyboard accessible.
2. THE drop zone SHALL have `aria-label="Upload a document"`.
3. THE drop zone SHALL display a cloud-upload SVG icon (`aria-hidden="true"`) above the instruction text.
4. WHEN a file is dragged over the drop zone, THE border SHALL animate to indigo and the background SHALL shift to `#eef2ff` using `transition: background-color 0.15s, border-color 0.15s`.
5. THE tab buttons ("Upload File" / "Paste Text") SHALL use a pill-style toggle with the active tab having a filled indigo background.
6. THE textarea SHALL have an explicit `<label>` element (visually hidden is acceptable) and `aria-label`.
7. THE character count SHALL use `aria-live="polite"` and `font-variant-numeric: tabular-nums`.
8. THE submit button label SHALL be specific: "Simplify Document" not "Simplify".
9. THE submit button SHALL show a spinner + "Processing…" during loading and SHALL be disabled once the request starts.
10. Placeholder text SHALL end with `…`: "Paste your academic text here…".

---

## Requirement V8: Complexity Score Display — Visual Polish

**User Story:** As a user, I want the before/after score comparison to feel like a meaningful data visualization.

### Acceptance Criteria

1. THE score bars SHALL use a color scale: red for high grade level (hard), green for low grade level (easy).
2. THE bar fill SHALL animate from 0 to its value on mount using `transition: width 0.6s ease-out`, respecting `prefers-reduced-motion`.
3. THE "Complexity reduced by X%" stat SHALL be displayed in a highlighted pill/badge with a green background.
4. Grade level numbers SHALL use `font-variant-numeric: tabular-nums` for stable layout.
5. THE section SHALL include a brief tooltip or helper text explaining what Flesch-Kincaid grade level means.

---

## Requirement V9: Focus View — Visual Polish

**User Story:** As a user in Focus View, I want each key point to feel like a focused reading card.

### Acceptance Criteria

1. THE current key point SHALL be displayed in a centered card with `font-size: 20px`, `font-weight: 500`, generous padding (`40px 32px`), and a soft shadow.
2. THE card SHALL animate between key points using `opacity: 0 → 1` + `translateX(8px) → 0` (direction-aware: forward goes right, back goes left), respecting `prefers-reduced-motion`.
3. THE Previous/Next buttons SHALL have `aria-label="Previous key point"` and `aria-label="Next key point"`.
4. THE progress indicator SHALL use `font-variant-numeric: tabular-nums`.
5. THE Previous button SHALL be visually disabled (not just `disabled` attribute) when at the first item, and Next when at the last.

---

## Requirement V10: Accessibility Baseline

**User Story:** As a user with a disability, I want the app to be fully keyboard navigable and screen reader friendly.

### Acceptance Criteria

1. THE App SHALL include a visually hidden skip link as the first focusable element: "Skip to main content" linking to `#main-content`.
2. ALL interactive elements SHALL have a visible `:focus-visible` ring: `outline: 2px solid #6366f1; outline-offset: 2px`. No `outline: none` without replacement.
3. ALL icon-only buttons SHALL have `aria-label`.
4. ALL decorative icons/emojis used as visual decoration SHALL have `aria-hidden="true"`.
5. THE App SHALL include `aria-live="polite"` regions for: processing status, rewriting status, and character count.
6. THE heading hierarchy SHALL be: `<h1>` CogniSync, `<h2>` section titles, `<h3>` subsection titles. No skipped levels.
7. ALL animations SHALL check `prefers-reduced-motion: reduce` and disable or reduce motion accordingly.
8. THE App SHALL NOT use `user-scalable=no` or `maximum-scale=1`.
9. Checkbox + label pairs in the Priority Matrix SHALL share a single hit target via `<label>` wrapping.
10. THE App SHALL use `touch-action: manipulation` on all interactive elements to prevent double-tap zoom delay.

---

## Requirement V11: Loading & Empty States

**User Story:** As a user, I want clear, beautiful feedback during loading and when content is empty.

### Acceptance Criteria

1. WHILE processing, THE App SHALL display a full-section skeleton loader (animated shimmer) in place of each output card.
2. THE shimmer animation SHALL use `background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)` with `background-size: 200%` and `animation: shimmer 1.5s infinite`, respecting `prefers-reduced-motion`.
3. EACH empty state (no key points, no tasks, no content) SHALL display a relevant illustration or icon with a helpful message in sentence case.
4. THE error state SHALL use a red-tinted card with an error icon, the error message, and a "Try again" action button.
5. Loading text SHALL end with `…`: "Processing your document…", "Rewriting…".

---

## Non-Functional Visual Requirements

1. THE App SHALL achieve a Lighthouse Performance score ≥ 90 on desktop.
2. THE App SHALL have zero layout shift (CLS = 0) during the loading → success transition.
3. ALL CSS transitions SHALL use `transform` and `opacity` only (no layout-triggering properties).
4. THE App SHALL be fully usable at viewport widths from 320px to 1440px.
5. THE App SHALL NOT use `transition: all` anywhere in the codebase.
