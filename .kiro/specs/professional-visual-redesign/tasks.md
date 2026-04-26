# Implementation Tasks

## Overview

Transform CogniSync into a professionally stunning, production-ready application through a systematic redesign covering the design system, all components, dark mode, responsive layout, and performance optimizations.

## Tasks

- [x] 1. Design System & Token Overhaul
  - [x] 1.1 Expand `tokens.css` with full color scale (primary-50 through primary-900), neutral gray scale, semantic color variants (light/dark), and OKLCH-based surface tokens
  - [x] 1.2 Add typography tokens: font-size scale (xs through 5xl), font-weight scale, line-height scale, letter-spacing tokens
  - [x] 1.3 Add spacing tokens using rem units (space-0 through space-24), shadow tokens (xs through 2xl + focus variants), and expanded border-radius tokens
  - [x] 1.4 Add transition duration and easing tokens (duration-fast/base/slow/slower, ease-in/out/in-out/spring/bounce)
  - [x] 1.5 Add dark theme CSS overrides under `[data-theme="dark"]` selector in tokens.css
  - [x] 1.6 Add global animation keyframes (fadeInUp, fadeIn, scaleIn, shimmer, spin, pulse) and reduced-motion reset

- [x] 2. Theme System (Dark Mode)
  - [x] 2.1 Create `src/hooks/useTheme.ts` — reads from localStorage + system preference, applies `data-theme` attribute to `<html>`, persists choice
  - [x] 2.2 Add theme toggle button to `Header.tsx` — sun/moon SVG icon, accessible label, smooth icon transition
  - [x] 2.3 Update `index.html` with inline script to apply saved theme before first paint (prevents flash)

- [x] 3. Header Redesign
  - [x] 3.1 Add sticky header behavior — compact version appears on scroll with reduced padding and smaller title
  - [x] 3.2 Make header stats responsive — 2-column grid on mobile, 4-column row on tablet+
  - [x] 3.3 Integrate theme toggle button into header top-right area
  - [x] 3.4 Improve header logo/wordmark with a small SVG brain icon beside the CogniSync title

- [x] 4. Document Ingestion Redesign
  - [x] 4.1 Redesign drop zone with larger hit area, animated dashed border on drag-over, and a more prominent upload icon
  - [x] 4.2 Improve tab switcher styling — pill tabs with smooth sliding indicator
  - [x] 4.3 Enhance textarea with character count progress bar (not just text counter)
  - [x] 4.4 Add animated processing state with step-by-step progress messages ("Extracting text…", "Analyzing content…", "Generating insights…")

- [x] 5. Card Component Enhancement
  - [x] 5.1 Replace emoji icons with inline SVG icons for consistency and scalability
  - [x] 5.2 Improve collapse animation — use CSS `grid-template-rows` transition for smooth height animation instead of instant show/hide
  - [x] 5.3 Add `variant` prop support: `'default'` (current glass), `'elevated'` (stronger shadow, white bg), `'outlined'` (border only)
  - [x] 5.4 Fix inline `<style>` injection per card instance — extract to a single shared stylesheet

- [x] 6. Adaptation Profile Selector Redesign
  - [x] 6.1 Redesign profile cards with larger icons, better label hierarchy, and a subtle checkmark indicator when selected
  - [x] 6.2 Make grid responsive — 2-column on mobile, 4-column on tablet+
  - [x] 6.3 Add tooltip on each profile card explaining what it does (visible on hover/focus)

- [x] 7. Progress Tracker & Quick Stats Polish
  - [x] 7.1 Add animated number counters — numbers count up from 0 on first render using a simple requestAnimationFrame loop
  - [x] 7.2 Improve achievement badge layout with a horizontal scroll on mobile
  - [x] 7.3 Add empty state to ProgressTracker when documentsProcessed === 0 — motivational message with a CTA

- [x] 8. Floating Actions Enhancement
  - [x] 8.1 Fix CSS-in-JS camelCase properties that are being used as CSS strings (backdropFilter, borderRadius etc.) — convert to proper CSS
  - [x] 8.2 Implement actual export functionality — copy simplified content + key points to clipboard as Markdown
  - [x] 8.3 Implement share functionality — use Web Share API with fallback to clipboard copy of a summary

- [x] 9. Loading & Empty States
  - [x] 9.1 Redesign `SkeletonCard` to match the actual Card layout more closely (icon placeholder, title bar, content lines)
  - [x] 9.2 Add an empty/welcome state for when no document has been processed — illustration using CSS shapes + gradients, headline, and upload CTA
  - [x] 9.3 Add animated processing steps overlay during document loading

- [x] 10. Responsive Layout
  - [x] 10.1 Add responsive padding to `AppContent` container — `clamp(16px, 4vw, 32px)` horizontal padding
  - [x] 10.2 Add `@media` breakpoints to all components that need layout changes at mobile widths
  - [x] 10.3 Add `env(safe-area-inset-bottom)` padding to FAB for notched mobile devices
  - [x] 10.4 Ensure all interactive elements have minimum 44×44px touch targets

- [x] 11. Typography & Readability
  - [x] 11.1 Update `index.html` to load Inter with full weight range (300–800) and add `font-display: swap`
  - [x] 11.2 Apply consistent typography tokens across all components — replace hardcoded font sizes with CSS variables
  - [x] 11.3 Add `text-wrap: balance` to all headings and `text-wrap: pretty` to body paragraphs

- [x] 12. Performance & Code Quality
  - [x] 12.1 Extract all repeated `<style>` tag injections from components into a single `src/styles/components.css` file imported in `main.tsx`
  - [x] 12.2 Add `will-change: transform` to animated elements (cards on hover, FAB)
  - [x] 12.3 Add `content-visibility: auto` to result cards below the fold
  - [x] 12.4 Memoize `getProfileStyles` and other pure functions called on every render

- [x] 13. Accessibility Polish
  - [x] 13.1 Audit all icon-only buttons and add `aria-label` where missing
  - [x] 13.2 Ensure all color combinations in the new dark theme meet WCAG AA contrast ratios
  - [x] 13.3 Add `role="status"` live region for theme change announcements
  - [x] 13.4 Add print stylesheet to `index.html` or `global.css`

- [x] 14. Property-Based Tests
  - [x] 14.1 Write PBT for spacing scale monotonicity — verify spacing values are strictly increasing
  - [x] 14.2 Write PBT for card collapse state consistency — content visibility always matches `isExpanded`
  - [x] 14.3 Write PBT for toast auto-dismiss timing — toasts dismiss within duration ± 100ms

- [x] 15. Toast & Feedback System (Req 11)
  - [x] 15.1 Create `src/components/Toast.tsx` — supports success/error/warning/info types, slide-in animation, auto-dismiss for non-errors, aria-live announcement
  - [x] 15.2 Create `src/hooks/useToast.ts` — manages toast queue, exposes `showToast` / `dismissToast`, stacks multiple toasts
  - [x] 15.3 Wire `useToast` into `AppContext` and trigger success toast on document processed, error toast on failure

- [x] 16. Form Validation UX (Req 22)
  - [x] 16.1 Add blur-time validation to the paste textarea — show inline error with icon when submitted empty, clear on correction
  - [x] 16.2 Replace plain character counter with a color-coded progress bar (green → amber → red at 60%/85% thresholds)
  - [x] 16.3 Ensure submit button is disabled and visually muted when no valid input exists

- [x] 17. Tooltip Component (Req 23)
  - [x] 17.1 Create `src/components/Tooltip.tsx` — wraps any child, shows on hover (500ms delay) and focus (immediate), positions to avoid viewport edges, includes arrow, dismisses on Escape
  - [x] 17.2 Apply `Tooltip` to adaptation profile cards with descriptive content
  - [x] 17.3 Apply `Tooltip` to complexity dial tick marks and the FAB action buttons

- [x] 18. Data Visualization Enhancement (Req 24)
  - [x] 18.1 Redesign `ComplexityScoreDisplay` — animated fill bars with color interpolation (green→amber→red), diagonal stripe pattern overlay, aria-valuenow/min/max attributes, hover tooltip with full Flesch-Kincaid breakdown
  - [x] 18.2 Redesign `PriorityMatrix` — color-coded quadrant headers (error/info/warning/gray), task item hover with translateX, responsive 2×2 grid on tablet / accordion on mobile
  - [x] 18.3 Add `role="heading"` + `aria-level` to quadrant headers; ensure color is never the sole differentiator (label text always present)

- [x] 19. Empty / Welcome State (Req 19)
  - [x] 19.1 Create `WelcomeState` component — CSS-only brain illustration (concentric circles + box-shadow), headline, subtext, and upload CTA button
  - [x] 19.2 Add subtle dot-grid decorative background to the welcome state using `radial-gradient`
  - [x] 19.3 Render `WelcomeState` in `AppContent` when `processing.status === 'idle'` (replacing the blank space below the ingestion form)

