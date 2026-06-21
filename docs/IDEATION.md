# CogniSync - Ideation and Build Process

This document captures the ideation process behind CogniSync. It reflects how the project evolved from a rough problem statement to a shipped product.

---

## The Problem

Students with cognitive differences - ADHD, dyslexia, anxiety - face an invisible barrier every time they open a syllabus or assignment. The information is all there, but the density, structure, and language actively work against how their brains process things.

No tool was solving this at the source. We built CogniSync to do exactly that.

---

## MVP Scope (Initial Brainstorm)

When we started, we defined the smallest version that would actually demonstrate value:

- **Document upload** - PDF or text paste for syllabi and assignments
- **AI key point extraction** - pull out only what matters
- **Task list generation** - convert vague instructions into clear to-dos with implied deadlines
- **Two reading modes** - Focus View (one concept at a time) and Step-by-Step View
- **Cognitive load score** - a before/after Flesch-Kincaid metric shown visually
- **Plain language rewriting** - strip jargon, rewrite at a lower reading level

**Wow feature (what we wanted to ship that would make someone stop scrolling):**

- Live complexity heatmap - color-coded by cognitive load at the sentence level
- Priority matrix - auto-classify tasks into Eisenhower quadrants, not just a list
- "Explain like I'm a freshman" slider - real-time complexity dial as you drag
- Calendar export - deadlines pushed as `.ics` files
- Comparison view - side-by-side original vs. simplified with live reduction percentage
- Multi-document synthesis - unified weekly action plan from an entire course folder

---

## Feature Evolution

As we built, new ideas surfaced. These were organized by effort vs. impact:

### High Value Additions

| Feature | Why It Matters |
|---|---|
| Calendar Export | Detected deadlines exported as `.ics` files. Makes the app worth opening weekly. |
| Multi-Document Synthesis | Upload a full course folder and get one unified weekly action plan. |
| Complexity Heatmap | Users see exactly where the friction is, not just an aggregate score. |
| Saved Sessions | Return to last week's syllabus without re-uploading - makes it a habit. |
| Shareable Output | Students share with study groups, tutors, or accessibility offices. |

### Integrations

| Feature | Why It Matters |
|---|---|
| LMS Browser Extension | Chrome/Firefox button on Canvas/Blackboard pages - zero friction. |
| Google Drive / OneDrive Import | Pick a file directly from cloud storage. |
| Notion / Obsidian Export | Export key points and tasks directly into a note. |
| Slack / Discord Bot | Paste a link in a study server and the bot replies with the summary. |

### User Control

| Feature | Why It Matters |
|---|---|
| Custom Profiles | Not everyone fits ADHD/Dyslexia/Anxiety boxes. Let users define their own. |
| Highlight and Ask | Select any sentence and ask a follow-up ("What does this mean?"). |
| Glossary Mode | Auto-detect jargon and show a mini glossary card. Huge for first-gen and ESL students. |
| Audio Read-Aloud | TTS via browser Web Speech API - no extra cost. |
| Task Due Date Editing | Manual override for AI-detected deadlines. AI gets it wrong sometimes. |

### Quick Wins

| Feature | Why It Matters |
|---|---|
| URL Ingestion | Paste a URL and scrape and process the page. Works for online syllabi. |
| Keyboard Shortcuts | Navigate Focus View, toggle modes without a mouse. |
| High Contrast Theme | A real accessibility need, not just a preference. |

---

## What We Actually Built

By the end of the initial build, we had shipped: document ingestion (PDF/DOCX/PPTX/XLSX/TXT), AI simplification via Anthropic Claude, adaptation profiles, the complexity dial, priority matrix, Focus View, Step-by-Step View, complexity heatmap, glossary, highlight and ask, calendar export, session collections, share links, a weekly digest, and a Chrome/Firefox browser extension.

The app is deployed publicly - frontend on Vercel, backend on Render.

---

## Priority Picks for Next Phase

If we had to pick three things to build next:

1. **Saved Sessions with cloud sync** - makes it a tool people return to daily
2. **URL Ingestion** - removes the biggest friction point (having to download files first)
3. **Custom Profiles** - because real users don't fit neat diagnostic boxes

See [`docs/ROADMAP.md`](ROADMAP.md) for the full prioritized list.
