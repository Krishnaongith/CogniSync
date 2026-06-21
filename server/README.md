# cogni-sync-server

Express server that proxies requests to the Anthropic Claude API to simplify academic content.

## Prerequisites

- Node.js 18+
- npm 9+
- An Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com))

## Install and Run

```bash
npm install
npm start        # node index.js
npm run dev      # node --watch index.js (auto-restarts on file change)
```

The server listens on **port 3001**.

## API Key

Create a `.env` file in this directory:

```
ANTHROPIC_API_KEY=sk-ant-...
```

The server loads it automatically on startup. In production (Render), set the key as an environment variable in the Render dashboard instead.

The server uses model `claude-haiku-4-5` (fast and cost-effective for text simplification).

## API Endpoints

### `POST /process`
Simplify an academic document. Returns structured JSON with a summary, key points, tasks, and rewritten text.

**Body**
```json
{ "text": "...", "profile": "default" }
```
`profile` options: `default` | `adhd` | `dyslexia` | `anxiety`

**Response**
```json
{
  "tldr": "...",
  "keyPoints": [{ "id": "...", "text": "..." }],
  "tasks": [{ "id": "...", "description": "...", "deadline": "...", "completed": false, "urgency": "urgent|not-urgent", "importance": "important|not-important" }],
  "rewrittenText": "..."
}
```

---

### `POST /rewrite`
Rewrite text at a specific Flesch-Kincaid grade level.

**Body**
```json
{ "text": "...", "gradeLevel": 8, "profile": "default" }
```

**Response**
```json
{ "rewrittenText": "..." }
```

---

### `POST /score`
Return Flesch-Kincaid complexity scores for original and simplified text.

**Body**
```json
{ "originalText": "...", "simplifiedText": "..." }
```

**Response**
```json
{
  "originalScore":   { "fleschKincaidGrade": 12, "fleschReadingEase": 45, "label": "Difficult", "summary": "..." },
  "simplifiedScore": { "fleschKincaidGrade": 7,  "fleschReadingEase": 70, "label": "Fairly Easy", "summary": "..." }
}
```

---

### `POST /synthesize`
Generate a "week at a glance" paragraph from multiple processed documents.

**Body**
```json
{ "results": [...], "fileNames": ["file1.pdf", "file2.docx"] }
```
Each element of `results` is a `/process` response object.

**Response**
```json
{ "summary": "..." }
```

---

### `POST /ask`
Answer a question about a highlighted passage in context.

**Body**
```json
{ "selectionText": "...", "question": "...", "context": "..." }
```

**Response**
```json
{ "answer": "..." }
```

---

### `POST /glossary`
Identify up to 20 jargon/technical terms and return plain-English definitions.

**Body**
```json
{ "text": "...", "profile": "default" }
```

**Response**
```json
{ "terms": [{ "term": "...", "definition": "...", "exampleSentence": "..." }] }
```
