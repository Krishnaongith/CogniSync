# CogniSync

**Academic content, simplified for you.**

CogniSync is an AI-powered web application that transforms dense academic documents into clear, structured, and actionable content - tailored to how your brain actually works.

Upload a syllabus, paste assignment instructions, or drop in lecture notes. CogniSync extracts key points, builds a prioritized task list, rewrites everything in plain language, and adapts the experience to your cognitive profile.

Built for students with ADHD, dyslexia, anxiety, and other cognitive differences - but genuinely useful for anyone facing a wall of academic text.

---

## Live App

Frontend: [cogni-sync-delta.vercel.app](https://cogni-sync-delta.vercel.app)

---

## Features

### Core
- **Document ingestion** - PDF, DOCX, PPTX, XLSX, TXT up to 100 MB, or paste text directly
- **AI-powered simplification** - Key point extraction, task generation, and plain-language rewrite in one pass via Anthropic Claude
- **Adaptation profiles** - ADHD, Dyslexia, Anxiety, and Default profiles that tune AI tone, sentence structure, and UI layout
- **Complexity dial** - Rewrite content at any reading level from Kindergarten to Graduate in real time
- **Priority matrix** - Tasks auto-classified into Eisenhower quadrants (Do Now / Schedule / Delegate / Eliminate)
- **Reading modes** - Focus View (one concept at a time) and Step-by-Step View (numbered instructions)
- **Complexity scoring** - Flesch-Kincaid before/after scores with percentage reduction shown visually

### Organization and Sharing
- **Session collections** - Organize saved sessions into named collections with rename, move, and inline creation
- **Share links** - Encode simplified content into shareable URLs
- **Calendar export** - Detected deadlines exported as `.ics` files

### Accessibility and UX
- **Complexity heatmap** - Sentence-level difficulty visualization (green to red)
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
├── server/              # Node.js + Express backend (Anthropic Claude API)
├── extension/           # Browser extension (Chrome + Firefox)
└── docs/                # Project documentation and ideation
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- An Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com))

### Frontend

```bash
cd cogni-sync
npm install
npm run dev
```

Opens at `http://localhost:5173`.

> The frontend works without the backend using a built-in mock mode. Set `VITE_USE_MOCK=true` in `cogni-sync/.env.local` to enable it.

### Backend

```bash
cd server
npm install
npm start
```

Create a `server/.env` file with your API key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Runs at `http://localhost:3001`.

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
| AI          | Anthropic Claude (claude-haiku-4-5)  |
| Backend     | Node.js, Express                     |
| Hosting     | Vercel (frontend), Render (backend)  |
| Persistence | IndexedDB (localStorage fallback)    |
| Testing     | Vitest, fast-check, Testing Library  |
| File parsing| pdfjs-dist, mammoth, jszip, xlsx     |

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

## License

MIT
