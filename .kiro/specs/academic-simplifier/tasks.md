# Implementation Plan: Academic Simplifier (CogniSync)

## Overview

Phase 2 visual polish and WOW features. Phase 1 (tasks 1–14) is complete. Tasks marked `*` are optional — skip for the 35-minute target.

## Tasks

- [x] 1–14. Phase 1 complete (scaffold, types, ingestion, mock API, processor, extractor, scorer, reading modes, UI, wiring, tests)

---

## Phase 2: WOW Features & Visual Polish

- [x] 15. Design system foundation
  - [x] 15.1 Create `src/styles/tokens.css` with CSS custom properties
    - `--color-primary: #6366f1`, `--color-primary-light: #eef2ff`, `--color-surface: #fff`, `--color-surface-muted: #f8fafc`, `--color-border: #e2e8f0`, `--color-text: #0f172a`, `--color-text-muted: #64748b`
    - `--radius-sm: 8px`, `--radius-md: 12px`, `--radius-lg: 16px`
    - `--shadow-sm: 0 1px 3px rgba(0,0,0,0.08)`, `--shadow-md: 0 4px 12px rgba(0,0,0,0.1)`
    - `--font-family: Inter, system-ui, sans-serif`
    - _Requirements: V1_
  - [x] 15.2 Update `index.html` — add Inter font via Google Fonts `<link>` with `preconnect`, import `tokens.css` in `main.tsx`, apply `font-family` to `body`
    - _Requirements: V1.2_

- [x] 16. Hero header with gradient branding
  - [x] 16.1 Create `src/components/Header.tsx`
    - Full-width gradient: `background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)`
    - White CogniSync `<h1>` with `text-wrap: balance`, white tagline
    - Subtle CSS dot-grid overlay (two `radial-gradient` background layers, `@media (prefers-reduced-motion: no-preference)` only)
    - First child: visually-hidden skip link `<a href="#main-content">Skip to main content</a>` visible on `:focus-visible`
    - _Requirements: V2_
  - [x] 16.2 Add `id="main-content"` to main wrapper in `App.tsx`, import and render `<Header />`
    - _Requirements: V2.4, V10.1_

- [x] 17. Card layout system
  - [x] 17.1 Create `src/components/Card.tsx`
    - Props: `accentColor: string`, `icon: string` (emoji), `title: string`, `children: ReactNode`, `animationDelay?: number`
    - Styles: white bg, `border-radius: var(--radius-lg)`, `box-shadow: var(--shadow-sm)`, `border: 1px solid var(--color-border)`, `border-left: 4px solid accentColor`
    - Icon (`aria-hidden="true"`) + title row
    - `@keyframes cardIn` entrance animation with `animation-delay` prop, disabled under `prefers-reduced-motion`
    - _Requirements: V3_
  - [x] 17.2 Wrap all output sections in `App.tsx` with `<Card>` — Key Points (indigo), Priority Matrix (red `#ef4444`), Simplified Content (violet `#8b5cf6`), Complexity Score (green `#22c55e`), Reading Mode (blue `#3b82f6`)
    - _Requirements: V3.1_

- [x] 18. Adaptation Profile Selector — visual polish
  - [x] 18.1 Update `AdaptationProfileSelector.tsx`
    - Each button: emoji at 28px, bold label, small description line below
    - Active: `background: var(--color-primary)`, white text, `box-shadow: 0 0 0 3px rgba(99,102,241,0.3)`
    - Explicit transition: `background-color 0.15s, border-color 0.15s, color 0.15s, box-shadow 0.15s`
    - Wrap in `<div role="group" aria-label="Reading profile">`
    - Re-process button: spinner SVG during loading, `disabled` attribute while processing
    - _Requirements: V4_

- [x] 19. Priority Matrix — visual polish
  - [x] 19.1 Update `PriorityMatrix.tsx`
    - Quadrant colors: Do Now (`#fef2f2`/`#ef4444`), Schedule (`#f0fdf4`/`#22c55e`), Delegate (`#fffbeb`/`#f59e0b`), Eliminate (`#f8fafc`/`#94a3b8`)
    - Task count badge in each quadrant header (small pill)
    - Wrap each task's checkbox + text in `<label>` — single hit target
    - Completed task: `transition: opacity 0.2s, color 0.2s` to `opacity: 0.4` + strikethrough
    - Responsive: `grid-template-columns: 1fr` on mobile via `@media (max-width: 640px)`
    - _Requirements: V5_

- [x] 20. Complexity Dial — visual polish
  - [x] 20.1 Update `ComplexityDial.tsx`
    - Gradient track via a styled `<div>` behind the range input: `linear-gradient(to right, #22c55e, #f59e0b, #ef4444)`
    - `aria-live="polite"` on the rewriting status span
    - `touch-action: manipulation` on the range input
    - Tick marks: render 6 `<span>` labels at correct `left: X%` positions for Kindergarten/Elementary/Middle/High/College/Graduate
    - _Requirements: V6_

- [x] 21. Document Ingestion — visual polish
  - [x] 21.1 Update `DocumentIngestion.tsx`
    - Drop zone: add `role="button"`, `tabIndex={0}`, `onKeyDown` (Enter/Space triggers click), `aria-label="Upload a document"`
    - Cloud upload SVG icon (`aria-hidden="true"`) above text
    - Drag-over: `transition: background-color 0.15s, border-color 0.15s`
    - Tab toggle: pill style — active tab `background: var(--color-primary)`, white text, `border-radius: 999px`
    - Add `<label htmlFor="paste-textarea">` (visually hidden) + `id="paste-textarea"` on textarea
    - Character count: `aria-live="polite"`, `font-variant-numeric: tabular-nums`
    - Submit button: "Simplify Document", spinner + disabled during loading
    - Placeholder: "Paste your academic text here…"
    - _Requirements: V7_

- [x] 22. Skeleton loaders
  - [x] 22.1 Create `src/components/SkeletonCard.tsx`
    - Shimmer animation: `background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)`, `background-size: 200%`, `animation: shimmer 1.5s infinite`
    - Static grey fallback under `prefers-reduced-motion`
    - _Requirements: V11.1, V11.2_
  - [x] 22.2 Render 5 `<SkeletonCard>` placeholders in `App.tsx` while `processing.status === 'loading'`
    - _Requirements: V11.1_

- [x] 23. Global accessibility baseline
  - [x] 23.1 Add global CSS rule: `*:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }` — remove any `outline: none` without replacement
    - _Requirements: V10.2_
  - [x] 23.2 Add `aria-live="polite"` status region in `App.tsx` for processing and rewriting states
    - _Requirements: V10.5_

- [x] 24. Final checkpoint
  - Verify app runs end-to-end: upload/paste → skeleton → results with card layout
  - Verify profile selector shows descriptions + glow on active
  - Verify Re-process button appears after first submission
  - Verify Complexity Dial updates text on drag
  - Verify skip link appears on Tab key press
  - Run `npx vitest --run` — confirm all passing

---

## Optional Tasks (skip for 35-min target)

- [ ]* 25. Complexity Score Display — animated bars
  - [ ]* 25.1 Bar color scale (red→green), `transition: width 0.6s ease-out` on mount, "reduced by X%" green pill badge, `font-variant-numeric: tabular-nums`, FK tooltip
  - _Requirements: V8_

- [x] 26. Focus View — direction-aware transitions
  - [x] 26.1 `opacity + translateX(±8px)` animation between key points, `aria-label` on nav buttons, `font-variant-numeric` on progress, visually disabled at boundaries
  - _Requirements: V9_

- [ ]* 27. Priority Matrix axis labels
  - [ ]* 27.1 "URGENT →" horizontal and "IMPORTANT ↑" vertical axis labels
  - _Requirements: V5.6_

- [x] 28. Complexity Dial pulse animation
  - [x] 28.1 Pulsing glow on slider thumb while rewriting, `prefers-reduced-motion` guard
  - _Requirements: V6.5_

- [ ]* 29. Property tests for new correctness properties (P17–P20)
  - [ ]* 29.1 P17: Priority Matrix quadrant assignment
  - [ ]* 29.2 P18: Complexity dial level bounds
  - [ ]* 29.3 P19: Re-process preserves raw text
  - [ ]* 29.4 P20: Adaptation profile CSS invariant
