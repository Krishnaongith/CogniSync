# cogni-sync — Frontend

React + TypeScript web app that ingests academic documents, simplifies them via AI, and presents the results with reading-aid features.

## Prerequisites

- Node.js 18+
- npm 9+

## Install & Run

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Build

```bash
npm run build   # type-check + Vite production build
npm run preview # serve the production build locally
```

## Tests

```bash
npm test
```

Uses [Vitest](https://vitest.dev/) with jsdom. Test files live in `src/__tests__/`.

## Mock vs Live API

The processor has a `useMock` flag in `src/processor/processor.ts`:

```ts
export const defaultConfig: ProcessorConfig = {
  useMock: false,
};
```

- `useMock: false` — sends requests to the local server at `http://localhost:3001`. Requires the server to be running with a valid `ANTHROPIC_API_KEY`.
- `useMock: true` — returns hardcoded fixture data with a simulated delay; no server or API key needed.

To develop without the backend, set `useMock: true` in `defaultConfig`.

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
│   └── TldrBanner.tsx
├── context/
│   └── AppContext.tsx   # Global React context
├── ingestion/
│   └── ingestion.ts    # Parses PDF, DOCX, XLSX, plain text via mammoth/pdfjs/xlsx
├── processor/
│   ├── processor.ts    # Orchestrates mock vs live path
│   ├── mockApi.ts      # Fixture data with simulated delay
│   ├── liveApi.ts      # HTTP calls to the backend server
│   ├── extractor.ts    # Text extraction helpers
│   └── synthesizer.ts  # Multi-document synthesis
├── scorer/
│   ├── scorer.ts       # Client-side Flesch-Kincaid scoring
│   └── syllables.ts    # Syllable counting utility
├── calendar/
│   ├── calendarExporter.ts  # Exports tasks to .ics
│   └── deadlineValidator.ts
├── types/
│   └── index.ts        # Shared TypeScript types
├── styles/
│   ├── tokens.css      # Design tokens
│   └── components.css
├── router.tsx          # React Router configuration
├── App.tsx
└── main.tsx
```
