# Requirements Document

## Introduction

CogniSync is an AI-powered academic content simplifier for students with cognitive differences (ADHD, dyslexia, anxiety, processing disorders). The core product — profile-aware AI simplification, complexity dial, and Eisenhower priority matrix — is already built and functional. This transformation spec covers everything needed to turn the existing single-page tool into a shippable SaaS product: a conversion-focused landing page, multi-page routing, a polished app shell with navigation, a first-time onboarding flow, visual design consistency, and several missing feature implementations (PDF export, share functionality, complexity grade labels).

The hero workflow is deliberately focused: drop a document → pick a cognitive profile → receive simplified content + key points + to-do list. Advanced features (heatmap, glossary, annotations, gamification) are surfaced progressively rather than all at once.

## Glossary

- **App**: The CogniSync React + TypeScript + Vite frontend application.
- **AppShell**: The persistent layout wrapper rendered at `/app` and all nested routes, containing the app header and tab navigation.
- **LandingPage**: The marketing and conversion page rendered at the `/` route.
- **Router**: React Router v6 managing client-side navigation between routes.
- **OnboardingFlow**: The localStorage-gated modal sequence shown to first-time visitors of `/app`.
- **ProfileSelector**: The UI control allowing users to choose one of four cognitive adaptation profiles (Default, ADHD, Dyslexia, Anxiety).
- **ComplexityDial**: The slider control that sets the target reading grade level (K–16) for AI rewriting.
- **PriorityMatrix**: The Eisenhower quadrant view that auto-classifies extracted tasks.
- **SessionHistory**: The component displaying previously saved processing sessions.
- **WeeklyDigest**: The component synthesizing tasks and key points across multiple saved sessions.
- **ProgressTracker**: The component displaying streaks, achievements, and usage statistics.
- **FloatingActions**: The floating action button menu providing quick access to export, share, and new document actions.
- **ShareService**: The module using LZ-string URL compression to encode and decode shareable session payloads.
- **DesignSystem**: The set of CSS custom properties defined in `tokens.css` and component styles in `components.css`.
- **GlassCard**: A card component styled with `backdrop-filter: blur` and semi-transparent background per the glassmorphism design language.
- **Toast**: The transient notification component used for user feedback.
- **SkeletonCard**: The animated placeholder card shown during document processing.

---

## Requirements

### Requirement 1: Multi-Page Routing

**User Story:** As a user, I want distinct pages for the landing experience and the app tool, so that I can navigate between marketing content and the actual product without confusion.

#### Acceptance Criteria

1. THE Router SHALL render the `LandingPage` component at the `/` route.
2. THE Router SHALL render the `AppShell` component at the `/app` route and all `/app/*` nested routes.
3. WHEN a user navigates to `/app` or `/app/simplify`, THE AppShell SHALL render the main document processing tool as the default view.
4. WHEN a user navigates to `/app/history`, THE AppShell SHALL render the `SessionHistory` component as a full page.
5. WHEN a user navigates to `/app/digest`, THE AppShell SHALL render the `WeeklyDigest` component as a full page.
6. WHEN a user navigates to `/app/progress`, THE AppShell SHALL render the `ProgressTracker` component as a full page.
7. THE Router SHALL render a static `PrivacyPolicy` page at the `/privacy` route.
8. THE Router SHALL render a static `TermsOfService` page at the `/terms` route.
9. IF a user navigates to an undefined route, THEN THE Router SHALL redirect the user to the `/` route.

---

### Requirement 2: Landing Page — Hero Section

**User Story:** As a prospective user, I want a compelling hero section when I first visit the site, so that I immediately understand what CogniSync does and feel motivated to try it.

#### Acceptance Criteria

1. THE LandingPage SHALL render a hero section as the first visible content above the fold.
2. THE LandingPage hero SHALL display a primary headline communicating that CogniSync adapts to different cognitive styles.
3. THE LandingPage hero SHALL display a sub-headline describing the problem of cognitive overload from dense academic text.
4. THE LandingPage hero SHALL display a "Try It Free" call-to-action button that navigates the user to `/app`.
5. THE LandingPage hero SHALL display a "See How It Works" call-to-action button that smooth-scrolls to the "How It Works" section anchor.
6. THE LandingPage hero SHALL display an animated background using CSS gradients or keyframe animations without using video elements.
7. WHEN the user's device reports `prefers-reduced-motion: reduce`, THE LandingPage SHALL disable all hero background animations.

---

### Requirement 3: Landing Page — How It Works Section

**User Story:** As a prospective user, I want a clear visual explanation of the product workflow, so that I understand how to use CogniSync before committing to try it.

#### Acceptance Criteria

1. THE LandingPage SHALL render a "How It Works" section with exactly three steps.
2. THE LandingPage "How It Works" section SHALL label the steps: "Upload Your Document", "Choose Your Profile", and "Get Simplified Output".
3. EACH step in the "How It Works" section SHALL display an icon or illustration, a step number, a title, and a brief description of no more than two sentences.
4. THE LandingPage "How It Works" section SHALL be reachable via the smooth-scroll anchor linked from the hero "See How It Works" button.

---

### Requirement 4: Landing Page — Features Section

**User Story:** As a prospective user, I want to see the key features of CogniSync presented clearly, so that I can evaluate whether the product meets my needs.

#### Acceptance Criteria

1. THE LandingPage SHALL render a features section containing exactly six feature cards in a responsive grid.
2. THE LandingPage features section SHALL include cards for: Profile-Aware AI, Complexity Dial, Priority Matrix, Focus View and Step-by-Step reading modes, Text-to-Speech and Heatmap, and Session History and Calendar Export.
3. EACH feature card SHALL display an icon, a title, and a description of no more than two lines.
4. WHEN the viewport width is less than 768px, THE LandingPage features grid SHALL collapse to a single-column layout.

---

### Requirement 5: Landing Page — Social Proof and Stats Section

**User Story:** As a prospective user, I want to see credibility signals and statistics, so that I feel confident the product is effective and trustworthy.

#### Acceptance Criteria

1. THE LandingPage SHALL render a social proof section containing at least three stat callouts with a numeric value and a descriptive label.
2. THE LandingPage social proof section SHALL include at least two student testimonial cards with placeholder content representing realistic student use cases.
3. EACH testimonial card SHALL display a quote, a student name placeholder, and a role or context placeholder.

---

### Requirement 6: Landing Page — Cognitive Profiles Section

**User Story:** As a prospective user with a cognitive difference, I want to see how CogniSync adapts content for my specific profile, so that I understand the product is designed for me.

#### Acceptance Criteria

1. THE LandingPage SHALL render a cognitive profiles section displaying all four adaptation profiles: Default, ADHD, Dyslexia, and Anxiety.
2. THE LandingPage cognitive profiles section SHALL display a visual profile switcher allowing the user to select a profile.
3. WHEN a user selects a profile in the cognitive profiles section, THE LandingPage SHALL display a sample paragraph of text rendered with the typography and spacing rules of that profile.
4. THE LandingPage cognitive profiles section SHALL describe the key traits of each profile (e.g., chunk size, spacing, tone).

---

### Requirement 7: Landing Page — Pricing Section

**User Story:** As a prospective user, I want to see clear pricing tiers, so that I can decide which plan fits my needs and budget.

#### Acceptance Criteria

1. THE LandingPage SHALL render a pricing section containing exactly three pricing tier cards: Free, Pro, and Institution.
2. THE LandingPage Free tier card SHALL list: 5 documents per month, basic profiles, and standard simplification.
3. THE LandingPage Pro tier card SHALL list: unlimited documents, all profiles, complexity dial, heatmap, glossary, annotations, calendar export, and weekly digest, at a price of $9 per month.
4. THE LandingPage Institution tier card SHALL indicate custom pricing and list LMS integration and bulk processing as features.
5. THE LandingPage pricing section SHALL visually distinguish the Pro tier card as the recommended option.
6. THE LandingPage Pro tier card SHALL display a call-to-action button.

---

### Requirement 8: Landing Page — Footer

**User Story:** As a user, I want a footer with navigation and legal links, so that I can find important pages and understand the product's legal standing.

#### Acceptance Criteria

1. THE LandingPage SHALL render a footer containing the CogniSync logo and tagline.
2. THE LandingPage footer SHALL contain navigation links to: Home (`/`), App (`/app`), How It Works (anchor), and Pricing (anchor).
3. THE LandingPage footer SHALL contain legal links to: Privacy Policy (`/privacy`) and Terms of Service (`/terms`).
4. THE LandingPage footer SHALL contain a link to the project's GitHub repository.
5. THE LandingPage footer SHALL display a copyright line.

---

### Requirement 9: App Shell and Navigation

**User Story:** As a returning user, I want a persistent app header with clear navigation, so that I can move between the tool's sections without losing context.

#### Acceptance Criteria

1. THE AppShell SHALL render a persistent header visible on all `/app/*` routes.
2. THE AppShell header SHALL display the CogniSync logo on the left side; WHEN clicked, THE AppShell SHALL navigate the user to the `/` route.
3. THE AppShell header SHALL display tab navigation with the labels: "Simplify", "History", "Digest", and "Progress".
4. WHEN a user clicks a tab in the AppShell header, THE AppShell SHALL navigate to the corresponding nested route.
5. THE AppShell header SHALL display the active tab with a visually distinct active state.
6. THE AppShell header SHALL display a theme toggle button on the right side.
7. THE AppShell header SHALL display a `ProfileSelector` dropdown on the right side allowing the user to change the active adaptation profile.
8. WHEN the viewport width is less than 768px, THE AppShell header tab labels SHALL be replaced with icons only to preserve horizontal space.

---

### Requirement 10: Onboarding Flow

**User Story:** As a first-time user, I want a guided setup experience when I first open the app, so that I can configure my profile and understand the tool before processing my first document.

#### Acceptance Criteria

1. WHEN a user visits `/app` for the first time and no onboarding completion flag exists in `localStorage`, THE AppShell SHALL display the `OnboardingFlow` modal.
2. THE OnboardingFlow SHALL consist of exactly three steps presented in sequence.
3. THE OnboardingFlow step 1 SHALL prompt the user to select a cognitive adaptation profile using the `ProfileSelector`.
4. THE OnboardingFlow step 2 SHALL prompt the user to choose a preferred reading mode by toggling between Focus View and Step-by-Step.
5. THE OnboardingFlow step 3 SHALL present a drag-and-drop upload area with a pre-loaded sample document available to try.
6. THE OnboardingFlow SHALL display a "Skip" option on every step that advances to the next step without saving a selection.
7. WHEN the user completes or skips all steps, THE AppShell SHALL set an onboarding completion flag in `localStorage` and dismiss the modal.
8. WHEN the onboarding completion flag is present in `localStorage`, THE AppShell SHALL NOT display the `OnboardingFlow` modal on subsequent visits.

---

### Requirement 11: Visual Design System Consistency

**User Story:** As a user, I want a visually consistent and polished interface, so that the app feels professional and trustworthy.

#### Acceptance Criteria

1. THE DesignSystem SHALL define all color values as CSS custom properties in `tokens.css`; no component SHALL use hardcoded hex color values.
2. THE App SHALL use Inter or Plus Jakarta Sans as the heading font family, loaded via a web font import.
3. THE App SHALL apply a consistent button height scale: 40px for small buttons, 48px for default buttons, and 56px for large buttons.
4. THE App SHALL apply a consistent border-radius of 8px to all buttons.
5. WHEN a user hovers over a button, THE App SHALL apply a `translateY(-1px)` transform and an increased box-shadow.
6. THE App SHALL apply a consistent padding of 24px and border-radius of 12px to all card components.
7. WHEN a document is being processed, THE App SHALL display `SkeletonCard` components with a shimmer animation as loading placeholders.
8. WHEN a section has no content to display, THE App SHALL render an empty state with a descriptive message and a call-to-action.
9. THE App SHALL support both dark mode and light mode, toggled via the theme button, with all surfaces and text colors sourced from CSS custom properties.
10. WHEN the viewport width is less than 768px, THE App tool columns SHALL collapse to a single-column layout.
11. ALL interactive touch targets in THE App SHALL have a minimum size of 44x44 pixels.

---

### Requirement 12: Micro-interactions and Animations

**User Story:** As a user, I want subtle animations and transitions that provide feedback on my interactions, so that the app feels responsive and alive.

#### Acceptance Criteria

1. WHEN a user switches the active adaptation profile, THE ProfileSelector SHALL apply a smooth color transition of no more than 300ms.
2. WHEN a user moves the `ComplexityDial` slider, THE App SHALL update a grade label in real time beside the slider displaying the descriptive name for the current level.
3. WHEN a user unlocks an achievement in the `ProgressTracker`, THE App SHALL display a celebratory animation (confetti burst or shine effect).
4. WHEN the App is processing a document, THE App SHALL display an animated progress indicator with step labels describing the current processing stage.
5. WHEN `prefers-reduced-motion: reduce` is set, THE App SHALL suppress all non-essential animations defined in requirements 12.1 through 12.4.

---

### Requirement 13: Complexity Dial Grade Labels

**User Story:** As a user, I want descriptive grade labels on the complexity dial, so that I understand what reading level I am targeting without needing to interpret a raw number.

#### Acceptance Criteria

1. THE ComplexityDial SHALL display a descriptive label beside the slider for every position.
2. THE ComplexityDial label mapping SHALL be: 1 = "Kindergarten", 2–3 = "Early Elementary", 4–5 = "Elementary", 6–7 = "Middle School", 8–9 = "High School", 10–11 = "Early College", 12–13 = "College", 14–15 = "Advanced", 16 = "Graduate".
3. WHEN a user moves the slider, THE ComplexityDial SHALL update the displayed label within the same animation frame.

---

### Requirement 14: PDF Export

**User Story:** As a user, I want to export my simplified document as a PDF, so that I can save or print the output for offline study.

#### Acceptance Criteria

1. THE App SHALL provide an "Export as PDF" action accessible from the `FloatingActions` menu and the output section header.
2. WHEN a user triggers "Export as PDF", THE App SHALL invoke `window.print()` with a print stylesheet applied via `@media print`.
3. THE exported PDF SHALL include: the TLDR summary, key points list, simplified text, and task list.
4. THE print stylesheet SHALL hide all navigation, controls, and non-content UI elements from the printed output.
5. IF no processed document result exists, THEN THE App SHALL disable the "Export as PDF" action.

---

### Requirement 15: Share Functionality

**User Story:** As a user, I want to share a link to my simplified document output, so that I can send the results to a classmate or instructor.

#### Acceptance Criteria

1. THE App SHALL provide a "Share" action accessible from the `FloatingActions` menu.
2. WHEN a user triggers "Share", THE ShareService SHALL encode the current session payload (key points, tasks, simplified text, TLDR) into a compressed URL using LZ-string.
3. WHEN the URL is generated, THE App SHALL copy it to the clipboard using the Clipboard API.
4. WHEN the URL is successfully copied, THE App SHALL display a `Toast` notification with the message "Link copied!".
5. WHERE the browser supports the Web Share API (`navigator.share`), THE App SHALL offer native sharing as an alternative to clipboard copy on mobile devices.
6. IF the encoded payload exceeds the URL length limit and is truncated, THEN THE App SHALL display a `Toast` notification warning the user that the content was shortened.
7. IF no processed document result exists, THEN THE App SHALL disable the "Share" action.

---

### Requirement 16: Static Legal Pages

**User Story:** As a user, I want to access Privacy Policy and Terms of Service pages, so that I understand how my data is handled and what terms govern my use of the product.

#### Acceptance Criteria

1. THE Router SHALL render a `PrivacyPolicy` page at the `/privacy` route containing placeholder privacy policy content.
2. THE Router SHALL render a `TermsOfService` page at the `/terms` route containing placeholder terms of service content.
3. EACH legal page SHALL display the CogniSync header with a link back to the landing page.
4. EACH legal page SHALL display the last-updated date.
