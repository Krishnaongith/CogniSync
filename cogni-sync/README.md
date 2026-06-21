# cogni-sync

React + TypeScript web app that ingests academic documents, simplifies them via AI, and presents the results with reading-aid features.

## Prerequisites

- Node.js 18+
- npm 9+

## Install and Run

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Build

```bash
npm run build   # Vite production build
npm run preview # serve the production build locally
```

## Tests

```bash
npm test
```

Uses [Vitest](https://vitest.dev/) with jsdom. Test files live in `src/__tests__/`.

## Mock vs Live API

By default the app calls the local backend at `http://localhost:3001`. To develop without the backend, create a `cogni-sync/.env.local` file:

```
VITE_USE_MOCK=true
```

This returns hardcoded fixture data with a simulated delay - no server or API key needed. Remove the file or set it to `false` to switch back to live mode.

In production, set `VITE_API_URL` to your deployed backend URL (e.g. on Render):

```
VITE_API_URL=https://your-backend.onrender.com
```

## src/ Structure

```
src/
├── __tests__/          # Vitest test suite
├── components/         # React UI components
│   ├── AppHeader.tsx
│   ├── DocumentIngestion.tsx
│   ├── RewrittenContent.tsx
│   ├── TaskList.tsx
│   ├── KeyPointsList.tsx
│   ├── ComplexityDial.tsx
│   ├── ComplexityScoreDisplay.tsx
│   ├── HeatmapView.tsx
│   ├── GlossaryPanel.tsx
│   ├── CollectionsView.tsx
│   ├── CollectionDetail.tsx
│   ├── SessionHistory.tsx
│   ├── FocusView.tsx
│   ├── StepByStepView.tsx
│   ├── ReadAloudControls.tsx
│   ├── AnnotationLayer.tsx
│   ├── PriorityMatrix.tsx
│   ├── ProgressTracker.tsx
│   ├── AdaptationProfileSelector.tsx
│   ├── OnboardingFlow.tsx
│   └── TldrBanner.tsx
├── config.ts           # API base URL (reads VITE_API_URL env var)
├── context/
│   └── AppContext.tsx  # Global React context
├── ingestion/
│   └── ingestion.ts   # Parses PDF, DOCX, PPTX, XLSX, plain text
├── processor/
│   ├── processor.ts   # Orchestrates mock vs live path
│   ├── mockApi.ts     # Legacy mock with fixture data
│   ├── mockData.ts    # Mock response fixture
│   ├── liveApi.ts     # HTTP calls to the backend server
│   ├── extractor.ts   # Text extraction helpers
│   └── synthesizer.ts # Multi-document synthesis
├── scorer/
│   ├── scorer.ts      # Client-side Flesch-Kincaid scoring
│   └── syllables.ts   # Syllable counting utility
├── calendar/
│   ├── calendarExporter.ts  # Exports tasks to .ics
│   └── deadlineValidator.ts
├── types/
│   └── index.ts       # Shared TypeScript types
├── styles/
│   ├── tokens.css     # Design tokens
│   └── components.css
├── router.tsx         # React Router configuration
├── App.tsx
└── main.tsx
```
