# CogniSync - Roadmap

This roadmap reflects planned improvements and features, organized by phase. Built on what we learned during the hackathon.

---

## Phase 1 - Polish & Stability (Near Term)

These are improvements to what's already shipped:

- [ ] Cloud-synced sessions (currently IndexedDB / local only)
- [ ] Task due date manual override UI
- [ ] URL ingestion - paste a link, scrape and process the page
- [ ] Improved deadline detection accuracy (edge cases in unstructured text)
- [ ] Lighthouse accessibility audit pass - fix any remaining WCAG gaps
- [ ] Error boundary improvements and better loading states

---

## Phase 2 - Power Features (Medium Term)

- [ ] Custom cognitive profiles - users define their own tone, chunk size, font, contrast
- [ ] Highlight & Ask - select any sentence in simplified output → ask a follow-up
- [ ] Multi-document synthesis - upload a full course folder → one unified weekly plan
- [ ] Google Drive / OneDrive import
- [ ] Notion / Obsidian export

---

## Phase 3 - Ecosystem (Longer Term)

- [ ] Weekly digest (email or push notification with "Your week at a glance")
- [ ] Annotation layer - highlight and note directly on simplified output
- [ ] Slack / Discord bot - paste a link in a study server → get a summary back
- [ ] Shareable simplified documents as proper PDFs (not just URL encoding)
- [ ] LMS deep integration (Canvas, Blackboard) via extension

---

## What's Already Shipped

| Feature | Status |
|---|---|
| PDF/DOCX/PPTX/XLSX/TXT ingestion | ✅ |
| Text paste input | ✅ |
| AI simplification (Amazon Nova Pro / Bedrock) | ✅ |
| Adaptation profiles (ADHD, Dyslexia, Anxiety, Default) | ✅ |
| Complexity dial (Kindergarten → Graduate) | ✅ |
| Priority matrix (Eisenhower quadrants) | ✅ |
| Focus View reading mode | ✅ |
| Step-by-Step reading mode | ✅ |
| Flesch-Kincaid before/after scoring | ✅ |
| Complexity heatmap | ✅ |
| Glossary generation | ✅ |
| Calendar export (.ics) | ✅ |
| Session collections | ✅ |
| Share links | ✅ |
| Weekly digest | ✅ |
| Chrome / Firefox browser extension | ✅ |

---

## Contributing

Have an idea or want to pick something up? See [`CONTRIBUTING.md`](../CONTRIBUTING.md).
