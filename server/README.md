# cogni-sync-server — Backend

Express server that proxies requests to AWS Bedrock (Amazon Nova Pro) to simplify academic content.

## Prerequisites

- Node.js 18+
- npm 9+
- AWS credentials with access to Bedrock in `us-east-2`

## Install & Run

```bash
npm install
npm start        # node index.js
npm run dev      # node --watch index.js (auto-restarts on file change)
```

The server listens on **port 3001** and accepts requests from `http://localhost:5173` (CORS).

## AWS Credentials

The server uses the [AWS SDK default credential chain](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html). Set credentials via environment variables before starting:

```bash
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=...   # if using temporary credentials
```

> **Note:** The server does not use dotenv. Credentials must be exported in your shell session before running `npm start` — creating a `.env` file will have no effect.

The Bedrock client is hardcoded to region `us-east-2` and model `us.amazon.nova-pro-v1:0`.

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
