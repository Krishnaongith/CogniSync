# CogniSync

**Academic content, simplified for you.**

CogniSync is a web app that transforms dense academic documents into clear, actionable content tailored to how your brain works. Upload a syllabus, paste assignment instructions, or drop in lecture notes — CogniSync extracts key points, builds a prioritized task list, and rewrites everything in plain language.

Designed for students with ADHD, dyslexia, anxiety, and other cognitive differences — but useful for anyone facing a wall of academic text.

## Features

- **Document ingestion** — PDF, DOCX, PPTX, XLSX, TXT up to 100 MB, or paste text directly
- **AI-powered simplification** — Key points, task extraction, and plain-language rewrite in one pass via Amazon Nova Pro (AWS Bedrock)
- **Adaptation profiles** — ADHD, Dyslexia, Anxiety, and Default profiles that change AI tone, sentence structure, and UI layout
- **Complexity dial** — Rewrite content at any grade level from Kindergarten to Graduate in real time
- **Priority matrix** — Tasks auto-classified into Eisenhower quadrants (Do Now / Schedule / Delegate / Eliminate)
- **Reading modes** — Focus View (one concept at a time) and Step-by-Step View
- **Complexity scoring** — Client-side Flesch-Kincaid before/after scores with percentage reduction
- **Session collections** — Organize saved sessions into named collections with rename, move, and inline creation
- **Complexity heatmap** — Sentence-level difficulty visualization
- **Glossary** — Auto-generated jargon definitions with example sentences
- **Calendar export** — Export detected deadlines as .ics files
- **Weekly digest** — Tasks due in the next 7 days across all sessions
- **Browser extension** — Chrome/Firefox extension for in-page simplification
- **Share links** — Encode simplified content into shareable URLs

## Project Structure

```
├── cogni-sync/          # React + TypeScript frontend (Vite)
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Route pages
│   │   ├── hooks/       # Custom hooks (session store, collection store, TTS, etc.)
│   │   ├── context/     # App-wide state (AppContext)
│   │   ├── processor/   # AI pipeline (mock + live API, extractor, synthesizer)
│   │   ├── scorer/      # Flesch-Kincaid scoring
│   │   ├── ingestion/   # File parsing (PDF, DOCX, PPTX, XLSX, TXT)
│   │   ├── calendar/    # ICS export
│   │   ├── glossary/    # Jargon detection
│   │   ├── share/       # URL-based sharing
│   │   ├── db/          # Shared IndexedDB module
│   │   ├── readingModes/# Focus + Step-by-Step controllers
│   │   ├── styles/      # Design tokens + component CSS
│   │   └── types/       # TypeScript interfaces
│   └── __tests__/       # Property-based + unit tests
├── server/              # Node.js + Express backend (AWS Bedrock)
└── extension/           # Browser extension (Chrome + Firefox)
```

## Getting Started

### Prerequisites

- Node.js 18+
- AWS credentials configured for Bedrock access (for live AI mode)

### Frontend

```bash
cd cogni-sync
npm install
npm run dev
```

Opens at `http://localhost:5173`.

### Backend

```bash
cd server
npm install
npm start
```

Runs at `http://localhost:3001`. Provides `/process`, `/rewrite`, `/glossary`, and `/synthesize` endpoints.

The frontend works without the backend using a built-in mock API — toggle via the `useMock` config flag in `processor.ts`.

### Tests

```bash
cd cogni-sync
npm test
```

Runs vitest with property-based tests (fast-check, 100 iterations per property) covering scoring, ingestion, session management, collection store, reading modes, and more.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Routing | React Router v7 |
| AI | Amazon Nova Pro via AWS Bedrock |
| Backend | Node.js, Express |
| Persistence | IndexedDB (localStorage fallback) |
| Testing | Vitest, fast-check, Testing Library |
| File parsing | pdfjs-dist, mammoth, jszip, xlsx |

## Accessibility

- WCAG AA contrast ratios
- Full keyboard navigation
- Screen reader support with semantic HTML and ARIA landmarks
- `prefers-reduced-motion` respected throughout
- No `user-scalable=no` — users can zoom freely
- Skip-to-main link, `aria-live` regions for status updates
