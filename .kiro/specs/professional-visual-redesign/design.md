# Design Document: Professional Visual Redesign

## Overview

This design document specifies the technical implementation for transforming CogniSync from a hackathon project into a professionally stunning, production-ready application. The redesign builds upon the existing glassmorphism foundation while introducing a comprehensive design system, enhanced component library, and modern UI/UX patterns.

### Current State Analysis

CogniSync currently implements:
- Basic design tokens in `tokens.css` with color palette, spacing, shadows, and typography
- Glassmorphism effects with backdrop blur
- Component-based architecture using React + TypeScript
- Context API for state management
- Animated gradient backgrounds
- Basic accessibility features (focus-visible, ARIA labels, prefers-reduced-motion)

### Design Goals

1. **Systematic Design Foundation**: Establish a comprehensive design system with expanded tokens, documentation, and usage guidelines
2. **Professional Visual Polish**: Enhance all components with refined styling, micro-interactions, and visual hierarchy
3. **Accessibility First**: Ensure WCAG 2.1 Level AA compliance across all features
4. **Performance Optimization**: Maintain 60fps animations and fast load times
5. **Responsive Excellence**: Deliver exceptional experiences across all device sizes
6. **Maintainable Architecture**: Create clean, documented, and extensible code

## Architecture

### Design System Architecture

The design system will be organized into four layers:

1. **Foundation Layer** (`src/styles/tokens.css`)
   - Design tokens (colors, spacing, typography, shadows, etc.)
   - Global resets and base styles
   - CSS custom properties for theming

2. **Component Layer** (`src/components/`)
   - Reusable UI components with consistent styling
   - Component-specific styles using scoped CSS-in-JS
   - Shared component utilities

3. **Pattern Layer** (`src/patterns/`)
   - Composite components combining multiple base components
   - Layout patterns and templates
   - Complex interaction patterns

4. **Theme Layer** (`src/styles/themes/`)
   - Light theme (default)
   - Dark theme
   - High contrast theme
   - Theme switching utilities

### File Organization

```
cogni-sync/
├── src/
│   ├── styles/
│   │   ├── tokens.css              # Design tokens (enhanced)
│   │   ├── global.css              # Global styles
│   │   ├── themes/
│   │   │   ├── dark.css           # Dark theme overrides
│   │   │   └── high-contrast.css  # High contrast theme
│   │   └── utilities.css          # Utility classes
│   ├── components/
│   │   ├── base/                  # Base components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   └── Toast.tsx
│   │   ├── layout/                # Layout components
│   │   │   ├── Container.tsx
│   │   │   ├── Grid.tsx
│   │   │   └── Stack.tsx
│   │   └── [existing components]
│   ├── hooks/
│   │   ├── useTheme.ts           # Theme management
│   │   ├── useMediaQuery.ts      # Responsive utilities
│   │   ├── useReducedMotion.ts   # Motion preferences
│   │   └── useToast.ts           # Toast notifications
│   └── utils/
│       ├── accessibility.ts       # A11y utilities
│       └── animation.ts          # Animation helpers
```

### Technology Stack

- **React 18.3+**: Component framework with concurrent features
- **TypeScript 5.6+**: Type safety and developer experience
- **CSS Custom Properties**: Dynamic theming and token system
- **Vite 6+**: Fast build tooling and HMR
- **Vitest + Fast-check**: Unit and property-based testing

## Components and Interfaces

### Enhanced Design Token System

#### Color System

Expand the existing color palette with semantic tokens and theme support:

```css
:root {
  /* Brand Colors - Primary Palette */
  --color-primary-50: #eef2ff;
  --color-primary-100: #e0e7ff;
  --color-primary-200: #c7d2fe;
  --color-primary-300: #a5b4fc;
  --color-primary-400: #818cf8;
  --color-primary-500: #6366f1;  /* Base primary */
  --color-primary-600: #4f46e5;
  --color-primary-700: #4338ca;
  --color-primary-800: #3730a3;
  --color-primary-900: #312e81;
  
  /* Semantic Colors */
  --color-success-light: #d1fae5;
  --color-success: #22c55e;
  --color-success-dark: #16a34a;
  
  --color-warning-light: #fef3c7;
  --color-warning: #f59e0b;
  --color-warning-dark: #d97706;
  
  --color-error-light: #fee2e2;
  --color-error: #ef4444;
  --color-error-dark: #dc2626;
  
  --color-info-light: #dbeafe;
  --color-info: #3b82f6;
  --color-info-dark: #2563eb;
  
  /* Neutral Palette */
  --color-gray-50: #f8fafc;
  --color-gray-100: #f1f5f9;
  --color-gray-200: #e2e8f0;
  --color-gray-300: #cbd5e1;
  --color-gray-400: #94a3b8;
  --color-gray-500: #64748b;
  --color-gray-600: #475569;
  --color-gray-700: #334155;
  --color-gray-800: #1e293b;
  --color-gray-900: #0f172a;
  
  /* Surface Colors */
  --color-surface-base: #ffffff;
  --color-surface-raised: #ffffff;
  --color-surface-overlay: rgba(255, 255, 255, 0.95);
  
  /* Text Colors */
  --color-text-primary: var(--color-gray-900);
  --color-text-secondary: var(--color-gray-600);
  --color-text-tertiary: var(--color-gray-400);
  --color-text-inverse: #ffffff;
  
  /* Border Colors */
  --color-border-subtle: var(--color-gray-200);
  --color-border-default: var(--color-gray-300);
  --color-border-strong: var(--color-gray-400);
}
```

#### Typography Scale

```css
:root {
  /* Font Families */
  --font-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'SF Mono', 'Monaco', 'Cascadia Code', 'Courier New', monospace;
  
  /* Font Sizes */
  --font-size-xs: 0.75rem;      /* 12px */
  --font-size-sm: 0.875rem;     /* 14px */
  --font-size-base: 1rem;       /* 16px */
  --font-size-lg: 1.125rem;     /* 18px */
  --font-size-xl: 1.25rem;      /* 20px */
  --font-size-2xl: 1.5rem;      /* 24px */
  --font-size-3xl: 1.875rem;    /* 30px */
  --font-size-4xl: 2.25rem;     /* 36px */
  --font-size-5xl: 3rem;        /* 48px */
  
  /* Font Weights */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-extrabold: 800;
  
  /* Line Heights */
  --line-height-tight: 1.25;
  --line-height-snug: 1.375;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.625;
  --line-height-loose: 2;
  
  /* Letter Spacing */
  --letter-spacing-tight: -0.02em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.025em;
  --letter-spacing-wider: 0.05em;
}
```

#### Spacing Scale

```css
:root {
  /* Spacing Scale (4px base) */
  --space-0: 0;
  --space-px: 1px;
  --space-0-5: 0.125rem;  /* 2px */
  --space-1: 0.25rem;     /* 4px */
  --space-1-5: 0.375rem;  /* 6px */
  --space-2: 0.5rem;      /* 8px */
  --space-2-5: 0.625rem;  /* 10px */
  --space-3: 0.75rem;     /* 12px */
  --space-4: 1rem;        /* 16px */
  --space-5: 1.25rem;     /* 20px */
  --space-6: 1.5rem;      /* 24px */
  --space-7: 1.75rem;     /* 28px */
  --space-8: 2rem;        /* 32px */
  --space-10: 2.5rem;     /* 40px */
  --space-12: 3rem;       /* 48px */
  --space-16: 4rem;       /* 64px */
  --space-20: 5rem;       /* 80px */
  --space-24: 6rem;       /* 96px */
}
```

#### Shadow System

```css
:root {
  /* Elevation Shadows */
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  
  /* Focus Shadows */
  --shadow-focus: 0 0 0 3px rgba(99, 102, 241, 0.5);
  --shadow-focus-error: 0 0 0 3px rgba(239, 68, 68, 0.5);
  --shadow-focus-success: 0 0 0 3px rgba(34, 197, 94, 0.5);
}
```

#### Border Radius

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.25rem;    /* 4px */
  --radius-base: 0.375rem; /* 6px */
  --radius-md: 0.5rem;     /* 8px */
  --radius-lg: 0.75rem;    /* 12px */
  --radius-xl: 1rem;       /* 16px */
  --radius-2xl: 1.5rem;    /* 24px */
  --radius-3xl: 2rem;      /* 32px */
  --radius-full: 9999px;
}
```

#### Transitions

```css
:root {
  /* Duration */
  --duration-instant: 0ms;
  --duration-fast: 150ms;
  --duration-base: 250ms;
  --duration-slow: 350ms;
  --duration-slower: 500ms;
  
  /* Easing Functions */
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  /* Combined Transitions */
  --transition-fast: var(--duration-fast) var(--ease-out);
  --transition-base: var(--duration-base) var(--ease-in-out);
  --transition-slow: var(--duration-slow) var(--ease-in-out);
  --transition-spring: var(--duration-slower) var(--ease-spring);
}
```

### Base Component Specifications

#### Button Component

```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

Styling specifications:
- Primary: Solid background with brand color, white text
- Secondary: Outlined with brand color, brand text
- Tertiary: Subtle background, brand text
- Ghost: Transparent background, hover shows subtle background
- Danger: Error color for destructive actions

Size specifications:
- Small: 32px height, 12px vertical padding, 16px horizontal padding
- Medium: 40px height, 12px vertical padding, 20px horizontal padding
- Large: 48px height, 14px vertical padding, 24px horizontal padding

States:
- Hover: Darken background by 10%, scale 1.02
- Active: Darken background by 20%, scale 0.98
- Focus: Show focus ring with 3px offset
- Disabled: 50% opacity, cursor not-allowed
- Loading: Show spinner, disable interaction

#### Input Component

```typescript
interface InputProps {
  type: 'text' | 'email' | 'password' | 'number' | 'search';
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}
```

Styling specifications:
- Height: 44px (meets touch target requirements)
- Padding: 12px horizontal, 10px vertical
- Border: 1px solid border-default, 2px on focus
- Border radius: radius-md
- Font size: font-size-base

States:
- Default: Subtle border, neutral background
- Focus: Primary border, focus ring
- Error: Error border, error text below
- Disabled: Reduced opacity, not-allowed cursor
- With icon: Adjust padding to accommodate icon

#### Toast Notification Component

```typescript
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number; // milliseconds, 0 for persistent
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

Behavior:
- Appear from top-right with slide-in animation
- Stack multiple toasts vertically
- Auto-dismiss after duration (except errors)
- Swipe to dismiss on mobile
- Announce to screen readers via aria-live

#### Tooltip Component

```typescript
interface TooltipProps {
  content: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
  delay?: number; // milliseconds before showing
  children: React.ReactElement;
}
```

Behavior:
- Show on hover after delay (default 500ms)
- Show immediately on focus
- Position dynamically to avoid viewport edges
- Include arrow pointing to target
- Dismiss on mouse leave or blur
- Max width: 250px with text wrapping

### Enhanced Existing Components

#### Card Component Enhancements

Current implementation is good. Enhancements:
1. Add `variant` prop: 'default' | 'elevated' | 'outlined'
2. Add `interactive` prop for clickable cards
3. Add `loading` state with skeleton content
4. Improve collapse animation with height transition
5. Add optional footer section

#### Header Component Enhancements

Current implementation is strong. Minor enhancements:
1. Add sticky header variant that appears on scroll
2. Add breadcrumb navigation support
3. Improve mobile responsiveness (stack stats on small screens)
4. Add theme toggle button

### Layout Components

#### Container Component

```typescript
interface ContainerProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: boolean;
  children: React.ReactNode;
}
```

Max widths:
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- full: 100%

#### Grid Component

```typescript
interface GridProps {
  columns: number | { sm?: number; md?: number; lg?: number };
  gap?: keyof typeof spacing;
  children: React.ReactNode;
}
```

Responsive grid system using CSS Grid with automatic column adjustment.

#### Stack Component

```typescript
interface StackProps {
  direction: 'horizontal' | 'vertical';
  gap?: keyof typeof spacing;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
  children: React.ReactNode;
}
```

Flexbox-based layout component for common stacking patterns.

## Data Models

### Theme Configuration

```typescript
interface Theme {
  name: string;
  colors: {
    primary: ColorScale;
    success: ColorScale;
    warning: ColorScale;
    error: ColorScale;
    info: ColorScale;
    gray: ColorScale;
    surface: SurfaceColors;
    text: TextColors;
    border: BorderColors;
  };
  typography: TypographyConfig;
  spacing: SpacingScale;
  shadows: ShadowScale;
  radius: RadiusScale;
  transitions: TransitionConfig;
}

interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;  // Base color
  600: string;
  700: string;
  800: string;
  900: string;
}

interface SurfaceColors {
  base: string;
  raised: string;
  overlay: string;
}

interface TextColors {
  primary: string;
  secondary: string;
  tertiary: string;
  inverse: string;
}

interface BorderColors {
  subtle: string;
  default: string;
  strong: string;
}
```

### Toast Notification State

```typescript
interface ToastState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration: number;
  createdAt: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  toasts: ToastState[];
  showToast: (toast: Omit<ToastState, 'id' | 'createdAt'>) => string;
  dismissToast: (id: string) => void;
  clearAll: () => void;
}
```

### Responsive Breakpoints

```typescript
const breakpoints = {
  sm: 640,   // Mobile landscape
  md: 768,   // Tablet portrait
  lg: 1024,  // Tablet landscape / Small desktop
  xl: 1280,  // Desktop
  '2xl': 1536, // Large desktop
} as const;

type Breakpoint = keyof typeof breakpoints;
```

## Dark Mode Implementation

### Theme Toggle Hook

```typescript
// src/hooks/useTheme.ts
export function useTheme() {
  const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('cogni-theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cogni-theme', theme);
  }, [theme]);

  return { theme, toggleTheme: () => setTheme(t => t === 'light' ? 'dark' : 'light') };
}
```

### Dark Theme CSS Tokens

```css
[data-theme="dark"] {
  --color-surface: #0f172a;
  --color-surface-muted: #1e293b;
  --color-surface-elevated: rgba(30, 41, 59, 0.95);
  --color-border: #334155;
  --color-border-light: rgba(51, 65, 85, 0.5);
  --color-text: #f1f5f9;
  --color-text-muted: #94a3b8;
  --color-text-light: #64748b;
  --glass-bg: rgba(15, 23, 42, 0.85);
  --glass-border: rgba(51, 65, 85, 0.6);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
```

## Responsive Design Strategy

### Breakpoint System

```css
/* Mobile first — base styles target 320px+ */
/* Tablet: @media (min-width: 768px) */
/* Desktop: @media (min-width: 1024px) */
/* Wide: @media (min-width: 1280px) */
```

### Layout Behavior Per Breakpoint

| Component | Mobile (< 768px) | Tablet (768–1023px) | Desktop (1024px+) |
|---|---|---|---|
| Header stats | 2-column grid | 4-column row | 4-column row |
| Profile selector | 2-column grid | 4-column row | 4-column row |
| Quick stats | 1-column stack | 3-column grid | 3-column grid |
| Progress tracker | 2-column grid | 4-column grid | 4-column grid |
| Content max-width | 100% | 100% | 900px centered |
| FAB labels | Hidden | Visible | Visible |

### Mobile-Specific Enhancements

- Increase tap targets to minimum 44×44px
- Use `touch-action: manipulation` on all interactive elements
- Remove hover-only interactions; use active states instead
- Bottom-safe-area padding for notched devices via `env(safe-area-inset-bottom)`

## Animation System

### Keyframe Library

```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}

@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}
```

### Reduced Motion

All animations are wrapped in `@media (prefers-reduced-motion: no-preference)` or use the pattern:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Print Stylesheet

```css
@media print {
  header, .fab-main, .fab-actions, .profile-btn, button { display: none !important; }
  body { background: white; color: black; font-family: Georgia, serif; }
  .card-animated { box-shadow: none; border: 1px solid #ccc; break-inside: avoid; }
  details, [aria-expanded="false"] + * { display: block !important; }
}
```

## Correctness Properties

*Properties are formal, testable statements about system behavior that hold across all valid inputs.*

### Property 1: Design Token Completeness

**Property**: Every CSS custom property referenced in component styles must be defined in `tokens.css`.

```typescript
// Testable via static analysis: scan all style strings for var(--X) and verify X exists in tokens.css
property("all referenced CSS vars are defined", fc.constant(null), () => {
  const tokenNames = extractTokenNames(tokensCSS);
  const usedVars = extractUsedVars(allComponentStyles);
  return usedVars.every(v => tokenNames.has(v));
});
```

### Property 2: Color Contrast Invariant

**Property**: All text-on-background color pairs must meet WCAG AA (4.5:1 for normal text, 3:1 for large text).

```typescript
property("text colors meet WCAG AA contrast", fc.record({
  textColor: fc.constantFrom(...TEXT_COLORS),
  bgColor: fc.constantFrom(...SURFACE_COLORS),
}), ({ textColor, bgColor }) => {
  return contrastRatio(textColor, bgColor) >= 4.5;
});
```

### Property 3: Animation Duration Bounds

**Property**: All animation durations must be between 0ms and 500ms.

```typescript
property("animation durations are within bounds", fc.constantFrom(...ANIMATION_DURATIONS), (duration) => {
  return duration >= 0 && duration <= 500;
});
```

### Property 4: Touch Target Size

**Property**: All interactive elements must have a minimum hit area of 44×44px.

```typescript
property("interactive elements meet touch target size", fc.constantFrom(...INTERACTIVE_ELEMENTS), (el) => {
  return el.minHeight >= 44 && el.minWidth >= 44;
});
```

### Property 5: Theme Token Parity

**Property**: Every token defined in the light theme must have a corresponding override in the dark theme.

```typescript
property("dark theme defines all light theme tokens", fc.constant(null), () => {
  const lightTokens = extractTokenNames(lightThemeCSS);
  const darkTokens = extractTokenNames(darkThemeCSS);
  return [...lightTokens].every(t => darkTokens.has(t));
});
```

### Property 6: Spacing Scale Monotonicity

**Property**: The spacing scale must be strictly increasing.

```typescript
property("spacing scale is monotonically increasing", fc.constant(SPACING_VALUES), (values) => {
  return values.every((v, i) => i === 0 || v > values[i - 1]);
});
```

### Property 7: Card Collapse State Consistency

**Property**: A card's content visibility must always match its `isExpanded` state.

```typescript
property("card content visibility matches expanded state", fc.boolean(), (isExpanded) => {
  const { queryByTestId } = render(<Card isExpanded={isExpanded} ... />);
  const content = queryByTestId('card-content');
  return isExpanded ? content !== null : content === null;
});
```

### Property 8: Toast Auto-Dismiss Timing

**Property**: Success and info toasts must auto-dismiss within their specified duration ± 100ms.

```typescript
property("toasts dismiss within duration", fc.integer({ min: 1000, max: 5000 }), async (duration) => {
  const { getByRole } = render(<Toast type="success" duration={duration} />);
  await waitFor(() => expect(getByRole('alert')).not.toBeInTheDocument(), { timeout: duration + 100 });
});
```
