# CogniSync

**Academic content, simplified for you.**

CogniSync is an AI-powered web application that transforms dense academic documents into clear, structured, and actionable content - tailored to how your brain actually works.

Upload a syllabus, paste assignment instructions, or drop in lecture notes. CogniSync extracts key points, builds a prioritized task list, rewrites everything in plain language, and adapts the experience to your cognitive profile.

Built for students with ADHD, dyslexia, anxiety, and other cognitive differences - but genuinely useful for anyone facing a wall of academic text.

> Built at a hackathon using **AWS Kiro** (MCPs, Skills, Steerings) + **Amazon Bedrock (Nova Pro)**

---

## Features

### Core
- **Document ingestion** - PDF, DOCX, PPTX, XLSX, TXT up to 100 MB, or paste text directly
- **AI-powered simplification** - Key point extraction, task generation, and plain-language rewrite in one pass via Amazon Nova Pro (AWS Bedrock)
- **Adaptation profiles** - ADHD, Dyslexia, Anxiety, and Default profiles that tune AI tone, sentence structure, and UI layout
- **Complexity dial** - Rewrite content at any reading level from Kindergarten to Graduate in real time
- **Priority matrix** - Tasks auto-classified into Eisenhower quadrants (Do Now / Schedule / Delegate / Eliminate)
- **Reading modes** - Focus View (one concept at a time) and Step-by-Step View (numbered instructions)
- **Complexity scoring** - Client-side Flesch-Kincaid before/after scores with percentage reduction shown visually

### Organization & Sharing
- **Session collections** - Organize saved sessions into named collections with rename, move, and inline creation
- **Share links** - Encode simplified content into shareable URLs
- **Calendar export** - Detected deadlines exported as `.ics` files

### Accessibility & UX
- **Complexity heatmap** - Sentence-level difficulty visualization (green → red)
- **Glossary** - Auto-generated jargon definitions with example sentences
- **Weekly digest** - Tasks due in the next 7 days, surfaced across all sessions
- **Browser extension** - Chrome and Firefox extension for in-page simplification

---

## Project Structure

```
CogniSync/
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
├── extension/           # Browser extension (Chrome + Firefox)
└── docs/                # Project documentation and ideation
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- AWS credentials configured for Bedrock access (required for live AI mode)

### Frontend

```bash
cd cogni-sync
npm install
npm run dev
```

Opens at `http://localhost:5173`.

> The frontend works **without** the backend using a built-in mock API. Toggle via the `useMock` config flag in `processor.ts`.

### Backend

```bash
cd server
npm install
npm start
```

Runs at `http://localhost:3001`. Exposes `/process`, `/rewrite`, `/glossary`, and `/synthesize` endpoints.

### Tests

```bash
cd cogni-sync
npm test
```

Runs Vitest with property-based tests (fast-check, 100 iterations per property) covering scoring, ingestion, session management, collection store, reading modes, and more.

---

## Tech Stack

| Layer       | Technology                           |
|-------------|--------------------------------------|
| Frontend    | React 18, TypeScript, Vite           |
| Routing     | React Router v7                      |
| AI          | Amazon Nova Pro via AWS Bedrock      |
| Backend     | Node.js, Express                     |
| Persistence | IndexedDB (localStorage fallback)    |
| Testing     | Vitest, fast-check, Testing Library  |
| File parsing| pdfjs-dist, mammoth, jszip, xlsx     |
| AI Tooling  | AWS Kiro (MCPs, Skills, Steerings)   |

---

## Accessibility

- WCAG AA contrast ratios throughout
- Full keyboard navigation
- Screen reader support via semantic HTML and ARIA landmarks
- `prefers-reduced-motion` respected
- No `user-scalable=no` - users can zoom freely
- Skip-to-main link, `aria-live` regions for status updates

---

## Roadmap

See [`docs/ROADMAP.md`](docs/ROADMAP.md) for planned features and priorities.

---

## Ideation

Curious how this project came together? See [`docs/IDEATION.md`](docs/IDEATION.md) for the original MVP brainstorm and feature evolution - built iteratively using AWS Kiro.

---

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for guidelines.

---

## License

MIT
