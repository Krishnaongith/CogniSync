# Implementation Plan: CogniSync Ship-Ready Transformation

## Overview

Transform CogniSync from a single-page tool into a shippable multi-page SaaS product by introducing React Router v6, a conversion-focused landing page, a persistent app shell with tab navigation, a first-time onboarding flow, design system hardening, a print stylesheet, and polished share functionality. The existing core processing pipeline is preserved intact.

## Tasks

- [x] 1. Install dependencies and set up routing infrastructure
  - Run `cd cogni-sync && npm install react-router-dom` to add React Router v6
  - Create `cogni-sync/src/router.tsx` with `createBrowserRouter` defining all routes: `/`, `/app` (with nested index, `simplify`, `history`, `digest`, `progress`), `/privacy`, `/terms`, and a `*` catch-all redirecting to `/`
  - Update `cogni-sync/src/main.tsx` to wrap `<RouterProvider router={router} />` inside `<AppProvider>` and remove the old `<App />` import
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_

- [x] 2. Update design system tokens and component styles
  - [x] 2.1 Add button height scale tokens, card tokens, and `@media print` rules to `cogni-sync/src/styles/tokens.css`
    - Add `--btn-height-sm: 40px`, `--btn-height-md: 48px`, `--btn-height-lg: 56px`, `--btn-radius: 8px`, `--card-padding: 24px`, `--card-radius: 12px`
    - Add `@media print` block hiding `.navbar`, `.app-tabs`, `.fab-main`, `.fab-actions`, `.profile-section`, `.upload-section`, `.progress-tracker`, `.onboarding-modal`, `.toast-container`, `.read-aloud-controls`, `.complexity-dial`, `.floating-actions`; set `body { background: white; color: black; }` and `.card { break-inside: avoid; box-shadow: none; border: 1px solid #ccc; }`
    - _Requirements: 11.3, 11.4, 11.5, 11.6, 14.2, 14.4_

  - [x] 2.2 Add standardized button classes and app tab navigation styles to `cogni-sync/src/styles/components.css`
    - Add `.btn`, `.btn-sm`, `.btn-lg`, `.btn-primary`, `.btn-ghost` classes using the token variables
    - Add `.app-tabs`, `.app-tab`, and `.app-tab[aria-current="page"]` styles; add `@media (max-width: 768px)` rule hiding tab label spans
    - _Requirements: 11.3, 11.4, 11.5, 9.3, 9.5, 9.8_

- [x] 3. Update `COMPLEXITY_LABELS` constant and `ComplexityDial` component
  - [x] 3.1 Replace the sparse `COMPLEXITY_LABELS` map in `cogni-sync/src/types/index.ts` with the full 16-entry mapping
    - Map: 1→'Kindergarten', 2→'Early Elementary', 3→'Early Elementary', 4→'Elementary', 5→'Elementary', 6→'Middle School', 7→'Middle School', 8→'High School', 9→'High School', 10→'Early College', 11→'Early College', 12→'College', 13→'College', 14→'Advanced', 15→'Advanced', 16→'Graduate'
    - _Requirements: 13.1, 13.2_

  - [x] 3.2 Update `ComplexityDial.tsx` to use direct lookup instead of `getClosestLabel`
    - Replace the `getClosestLabel` helper with `COMPLEXITY_LABELS[localLevel]` direct lookup since every level now has an entry
    - _Requirements: 13.1, 13.2, 13.3_

  - [ ]* 3.3 Write property test for ComplexityDial label mapping
    - **Property 5: ComplexityDial Label Mapping**
    - **Validates: Requirements 12.2, 13.1, 13.2, 13.3**
    - File: `cogni-sync/src/__tests__/complexityDialLabels.test.ts`
    - Use `fc.integer({ min: 1, max: 16 })` to generate levels; render `<ComplexityDial>` and assert the displayed label matches `COMPLEXITY_LABELS[level]`
    - Include comment: `// Feature: cognisync-ship-ready-transformation, Property 5: complexity dial label mapping`
    - `numRuns: 100`

- [x] 4. Create view page components
  - [x] 4.1 Create `cogni-sync/src/pages/SimplifyView.tsx` by extracting the `AppContent` function body from `App.tsx`
    - Move all JSX and logic from `AppContent` into `SimplifyView`; import `useAppContext` directly; remove the `showHistory`/`showDigest` props (history and digest are now separate routes)
    - Remove the `SessionHistory` and `WeeklyDigest` modal rendering from this component (they live at `/app/history` and `/app/digest`)
    - _Requirements: 1.3_

  - [x] 4.2 Create `cogni-sync/src/pages/HistoryView.tsx` as a full-page wrapper for `SessionHistory`
    - Import `SessionHistory` and `useAppContext`; render `SessionHistory` with `restoreSession` wired to `useNavigate('/app')` after restore
    - _Requirements: 1.4_

  - [x] 4.3 Create `cogni-sync/src/pages/DigestView.tsx` as a full-page wrapper for `WeeklyDigest`
    - Import `WeeklyDigest` and `useAppContext`; render `WeeklyDigest` with `savedSessions`
    - _Requirements: 1.5_

  - [x] 4.4 Create `cogni-sync/src/pages/ProgressView.tsx` as a full-page wrapper for `ProgressTracker`
    - Import `ProgressTracker` and `useAppContext`; render `ProgressTracker` with `progressStats`
    - _Requirements: 1.6_

- [x] 5. Create `AppHeader` component
  - Create `cogni-sync/src/components/AppHeader.tsx` with logo (links to `/`), tab nav using `NavLink` from react-router-dom, theme toggle, and profile selector dropdown
  - Use the `TABS` constant: `[{ id: 'simplify', label: 'Simplify', path: '/app' }, { id: 'history', label: 'History', path: '/app/history' }, { id: 'digest', label: 'Digest', path: '/app/digest' }, { id: 'progress', label: 'Progress', path: '/app/progress' }]`
  - Apply `aria-current="page"` to the active tab using `NavLink`'s `isActive` callback; use `.app-tab` and `.app-tabs` CSS classes from `components.css`
  - Include theme toggle (reuse logic from `Header.tsx`) and `AdaptationProfileSelector` dropdown on the right
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

- [x] 6. Create `OnboardingFlow` modal component
  - Create `cogni-sync/src/components/OnboardingFlow.tsx` as a three-step modal with `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and focus trap
  - Step 1: profile selection using `AdaptationProfileSelector`; Step 2: reading mode toggle using `ReadingModeToggle`; Step 3: sample document upload using `DocumentIngestion` with a pre-loaded sample text
  - Each step has a "Next" / "Finish" button and a "Skip" button that advances without saving
  - On completion or full skip, call `onComplete()` prop; the caller (`AppShell`) writes `localStorage.setItem('cognisync_onboarded', 'true')`
  - Wrap `localStorage.setItem` in try/catch; silently ignore storage errors
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_

  - [ ]* 6.1 Write property test for onboarding completion flag
    - **Property 4: Onboarding Completion Flag**
    - **Validates: Requirements 10.7, 10.8**
    - File: `cogni-sync/src/__tests__/onboardingFlow.test.tsx`
    - Use `fc.array(fc.constantFrom('next', 'skip'), { minLength: 3, maxLength: 3 })` to generate action sequences; simulate each action through the 3-step flow; assert `localStorage.getItem('cognisync_onboarded') === 'true'`; re-mount `AppShell` and assert `OnboardingFlow` is not rendered
    - Include comment: `// Feature: cognisync-ship-ready-transformation, Property 4: onboarding completion flag`
    - `numRuns: 100`

- [x] 7. Create `AppShell` layout route component
  - Create `cogni-sync/src/pages/AppShell.tsx` that renders `AppHeader`, conditionally renders `OnboardingFlow` (when `localStorage.getItem('cognisync_onboarded') !== 'true'`), and renders `<Outlet />`
  - On `OnboardingFlow` `onComplete`, set `localStorage.setItem('cognisync_onboarded', 'true')` and hide the modal
  - _Requirements: 9.1, 10.1, 10.7, 10.8_

- [x] 8. Checkpoint — wire router and verify app shell
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Create landing page section components
  - [x] 9.1 Create `cogni-sync/src/pages/landing/HeroSection.tsx`
    - Headline communicating cognitive adaptation, sub-headline about cognitive overload, "Try It Free" button navigating to `/app`, "See How It Works" button smooth-scrolling to `#how-it-works` anchor
    - Animated CSS gradient background; suppress animations when `prefers-reduced-motion: reduce`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [x] 9.2 Create `cogni-sync/src/pages/landing/HowItWorksSection.tsx`
    - Exactly three steps: "Upload Your Document", "Choose Your Profile", "Get Simplified Output"
    - Each step has an icon, step number, title, and ≤2-sentence description; section has `id="how-it-works"` anchor
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 9.3 Create `cogni-sync/src/pages/landing/FeaturesSection.tsx`
    - Exactly six feature cards in a responsive CSS grid; cards for: Profile-Aware AI, Complexity Dial, Priority Matrix, Focus/Step-by-Step, TTS/Heatmap, Session History/Calendar Export
    - Grid collapses to single column below 768px; each card has icon, title, ≤2-line description
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 9.4 Create `cogni-sync/src/pages/landing/StatsSection.tsx`
    - At least three stat callouts (numeric value + label) and at least two testimonial cards with quote, name placeholder, and role placeholder
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 9.5 Create `cogni-sync/src/pages/landing/ProfilesSection.tsx`
    - Display all four profiles (Default, ADHD, Dyslexia, Anxiety) with a visual switcher; on profile select, render sample paragraph with the typography rules for that profile (line-height, font-size, letter-spacing, word-spacing from `ADAPTATION_PROFILES`); describe key traits of each profile
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 9.6 Write property test for profile switcher sample rendering
    - **Property 3: Profile Switcher Sample Rendering**
    - **Validates: Requirements 6.3**
    - File: `cogni-sync/src/__tests__/profilesSection.test.tsx`
    - Use `fc.constantFrom('default', 'adhd', 'dyslexia', 'anxiety')` to generate profiles; click the profile button; assert the sample paragraph has the expected inline styles for that profile
    - Include comment: `// Feature: cognisync-ship-ready-transformation, Property 3: profile switcher sample rendering`
    - `numRuns: 100`

  - [x] 9.7 Create `cogni-sync/src/pages/landing/PricingSection.tsx`
    - Exactly three tier cards: Free (5 docs/month, basic profiles, standard simplification), Pro ($9/month, unlimited docs, all features), Institution (custom pricing, LMS integration, bulk processing)
    - Pro card is visually distinguished as recommended; Pro card has a CTA button
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [x] 9.8 Create `cogni-sync/src/pages/landing/LandingFooter.tsx`
    - CogniSync logo + tagline; nav links to `/`, `/app`, `#how-it-works`, `#pricing`; legal links to `/privacy`, `/terms`; GitHub link; copyright line
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 10. Assemble `LandingPage` and create static legal pages
  - [x] 10.1 Create `cogni-sync/src/pages/LandingPage.tsx` composing all landing section components
    - Pure presentational component with no `AppContext` dependency; import and render `HeroSection`, `HowItWorksSection`, `FeaturesSection`, `StatsSection`, `ProfilesSection`, `PricingSection`, `LandingFooter` in order
    - Include a minimal `LandingNav` (logo + "Try It Free" link) fixed at the top
    - _Requirements: 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1_

  - [x] 10.2 Create `cogni-sync/src/pages/PrivacyPage.tsx` and `cogni-sync/src/pages/TermsPage.tsx`
    - Each renders a minimal header with CogniSync logo linking to `/`, a last-updated date, and placeholder legal text
    - _Requirements: 16.1, 16.2, 16.3, 16.4_

- [x] 11. Update `FloatingActions` for PDF export via `window.print()`
  - Replace the `generatePDF` iframe approach in `FloatingActions.tsx` with a direct `window.print()` call for the "Export as PDF" action
  - Disable the "Export as PDF" button (`aria-disabled`) when no processed result exists (pass an `hasResult` prop)
  - _Requirements: 14.1, 14.2, 14.5_

- [ ]* 11.1 Write property test for PDF export content completeness
  - **Property 6: PDF Export Content Completeness**
  - **Validates: Requirements 14.3**
  - File: `cogni-sync/src/__tests__/pdfExport.test.ts`
  - Extract a pure `buildPrintHTML(result: ProcessorResult): string` function from `shareService.ts` or a new `printUtils.ts`; use a `fc.record` arbitrary for `ProcessorResult` with non-empty `keyPoints`, `rewrittenText`, and `tasks`; assert the returned HTML contains TLDR (if present), each key point text, simplified text prefix, and each task description
  - Include comment: `// Feature: cognisync-ship-ready-transformation, Property 6: PDF export content completeness`
  - `numRuns: 100`

- [x] 12. Verify and harden share functionality
  - [x] 12.1 Update `SimplifyView.tsx` to read the `?share=` URL param on mount (moved from `App.tsx`) and display the shared read-only view
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7_

  - [ ]* 12.2 Write property test for share payload round-trip
    - **Property 7: Share Payload Round-Trip**
    - **Validates: Requirements 15.2**
    - File: `cogni-sync/src/__tests__/shareRoundTrip.test.ts`
    - Use `fc.record` to generate arbitrary `SharePayload` values; call `encode(payload)`; if `!truncated`, call `decode(url)` and assert the result deeply equals the original payload
    - Include comment: `// Feature: cognisync-ship-ready-transformation, Property 7: share payload round-trip`
    - `numRuns: 100`

- [x] 13. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Wire router with all pages and finalize `main.tsx`
  - [x] 14.1 Update `cogni-sync/src/router.tsx` to import all page components (`LandingPage`, `AppShell`, `SimplifyView`, `HistoryView`, `DigestView`, `ProgressView`, `PrivacyPage`, `TermsPage`) and define the complete route tree
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_

  - [x] 14.2 Finalize `cogni-sync/src/main.tsx` to use `<AppProvider><RouterProvider router={router} /></AppProvider>` and remove the old `<App />` import
    - _Requirements: 1.1, 1.2_

  - [ ]* 14.3 Write property test for undefined route redirect
    - **Property 1: Undefined Route Redirect**
    - **Validates: Requirements 1.9**
    - File: `cogni-sync/src/__tests__/routerRedirect.test.tsx`
    - Use `fc.string({ minLength: 1 }).filter(s => !['/', '/app', '/app/simplify', '/app/history', '/app/digest', '/app/progress', '/privacy', '/terms'].includes('/' + s.replace(/^\//, '')))` to generate unknown paths; render the router at each path using `createMemoryRouter`; assert the rendered location is `/`
    - Include comment: `// Feature: cognisync-ship-ready-transformation, Property 1: undefined route redirect`
    - `numRuns: 100`

  - [ ]* 14.4 Write property test for tab navigation correctness
    - **Property 2: Tab Navigation Correctness**
    - **Validates: Requirements 9.3, 9.4, 9.5**
    - File: `cogni-sync/src/__tests__/tabNavigation.test.tsx`
    - Use `fc.constantFrom('simplify', 'history', 'digest', 'progress')` to generate tab IDs; render `AppHeader` inside a `MemoryRouter`; click the tab; assert the correct `NavLink` has `aria-current="page"` and all others do not
    - Include comment: `// Feature: cognisync-ship-ready-transformation, Property 2: tab navigation correctness`
    - `numRuns: 100`

- [x] 15. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- `react-router-dom` must be installed first: `cd cogni-sync && npm install react-router-dom`
- New pages go in `cogni-sync/src/pages/`; landing sections go in `cogni-sync/src/pages/landing/`
- Property-based tests use `fast-check` (already installed) and run with `vitest`; each test file goes in `cogni-sync/src/__tests__/`
- Each property test must include the comment `// Feature: cognisync-ship-ready-transformation, Property N: <property_text>` and use `numRuns: 100`
