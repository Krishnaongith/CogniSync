
# Implementation Plan: CogniSync Feature Expansion

## Overview

Implement 12 new capabilities across the existing React + TypeScript + Vite frontend (`cogni-sync/`), Node.js/Express backend (`server/index.js`), and a new browser extension (`extension/`). Tasks are ordered by dependency: type system first, then persistence, then server endpoints, then feature modules, then UI wiring.

## Tasks

- [x] 1. Extend the type system with all new data models
  - Add `Annotation`, `Session`, `SentenceScore`, `JargonTerm`, `GlossaryResult`, `SynthesisResult`, `AskResult`, `DigestTask`, and `WeeklyDigestResult` interfaces to `cogni-sync/src/types/index.ts`
  - Extend `Task` to include optional `sourceFileName?: string` and `sessionId?: string` fields
  - _Requirements: 1.2, 2.2, 4.2, 5.3, 6.3, 7.5, 8.1, 9.2, 10.2, 11.2_

- [x] 2. Implement `useSessionStore` hook (IndexedDB persistence)
  - Create `cogni-sync/src/hooks/useSessionStore.ts`
  - Open `cognisync_db` (version 1) with an `sessions` object store keyed on `id`, indexed by `savedAt` and `fileName`
  - Implement `saveSession`, `getSession`, `getAllSessions` (sorted descending by `savedAt`), `deleteSession`
  - Enforce the 50-session cap on `saveSession`: query by `savedAt` index and delete the oldest when count exceeds 50
  - Fall back to `localStorage` serialization when `indexedDB` is not available
  - Wrap all operations in try/catch and surface errors via the existing `showToast` mechanism
  - [x] 2.1 Write property test for session save/restore round-trip
    - **Property 1: Session Save/Restore Round-Trip**
    - **Validates: Requirements 1.2, 1.5**
  - [x] 2.2 Write property test for session history ordering
    - **Property 2: Session History Ordering**
    - **Validates: Requirements 1.4**
  - [x] 2.3 Write property test for session delete
    - **Property 3: Session Delete Removes Entry**
    - **Validates: Requirements 1.6**
  - [x] 2.4 Write property test for session count cap
    - **Property 4: Session Count Cap**
    - **Validates: Requirements 1.7**
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

- [x] 3. Add new server endpoints to `server/index.js`
  - [x] 3.1 Add `POST /synthesize` endpoint
    - Accept `{ results: ProcessorResult[], fileNames: string[] }` in the request body
    - Build a system prompt instructing Bedrock to produce a plain-English "week at a glance" paragraph from the merged tasks and key points
    - Return `{ summary: string }`
    - Return 400 for missing fields, 500 with `{ error }` for Bedrock failures
    - _Requirements: 6.4_
  - [x] 3.2 Add `POST /ask` endpoint
    - Accept `{ selectionText: string, question: string, context: string }` in the request body
    - Build a system prompt instructing Bedrock to answer the question about the selected passage
    - Return `{ answer: string }`
    - Return 400 for missing fields, 500 with `{ error }` for Bedrock failures
    - _Requirements: 7.4, 7.5_
  - [x] 3.3 Add `POST /glossary` endpoint
    - Accept `{ text: string, profile: string }` in the request body
    - Build a system prompt instructing Bedrock to identify up to 20 jargon terms and return `{ terms: JargonTerm[] }` (each with `term`, `definition`, `exampleSentence`)
    - When `profile` is `"dyslexia"` or `"anxiety"`, instruct Bedrock to write definitions at Grade 6 or below
    - Return 400 for missing fields, 500 with `{ error }` for Bedrock failures
    - _Requirements: 8.1, 8.5, 8.6_

- [x] 4. Implement `calendarExporter` module
  - Create `cogni-sync/src/calendar/calendarExporter.ts`
  - Implement `generateICS(tasks: Task[]): { icsBlob: Blob; skipped: string[] }` — filter tasks with parseable deadlines, build RFC 5545 VCALENDAR string with one VEVENT per task (UID, DTSTAMP, DTSTART, SUMMARY), return a `Blob` and a list of skipped task descriptions
  - Implement `getGoogleCalendarURL(task: Task): string` — encode task description and deadline into a Google Calendar event creation URL
  - Implement `downloadICS(blob: Blob): void` — trigger browser download as `cognisync-deadlines.ics`
  - [x] 4.1 Write property test for ICS VEVENT count
    - **Property 5: ICS VEVENT Count Matches Tasks with Deadlines**
    - **Validates: Requirements 2.2**
  - [x] 4.2 Write property test for ICS RFC 5545 structure
    - **Property 6: ICS RFC 5545 Structure**
    - **Validates: Requirements 2.6**
  - [x] 4.3 Write property test for Google Calendar URL
    - **Property 7: Google Calendar URL Contains Task Data**
    - **Validates: Requirements 2.4**
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 5. Implement task deadline editing in the task list UI
  - Modify `cogni-sync/src/components/TaskList.tsx` to render each task's deadline as an `<input type="date">` editable field
  - Add inline validation: show an error message when the entered value is not a recognizable date; clear the error on valid input
  - Wire the `onChange` handler to update the task's deadline in `AppContext` state (add `updateTaskDeadline(taskId, deadline)` to `AppContext`)
  - When the field is cleared, set `deadline` to `undefined` and exclude the task from calendar exports
  - Render an empty editable field for tasks with no AI-detected deadline
  - [x] 5.1 Write property test for deadline mutation correctness
    - **Property 8: Deadline Mutation Correctness**
    - **Validates: Requirements 3.3, 3.4**
  - [x] 5.2 Write property test for deadline validation
    - **Property 9: Deadline Validation Rejects Invalid Formats**
    - **Validates: Requirements 3.2**
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 6. Implement `useHeatmap` hook and `HeatmapView` component
  - Create `cogni-sync/src/hooks/useHeatmap.ts`
  - Implement `computeHeatmap(text: string, profile: AdaptationProfile): SentenceScore[]` — split text on `.`, `!`, `?`, apply `scoreText` from `cogni-sync/src/scorer/scorer.ts` to each sentence, return array of `SentenceScore`
  - Map each score to a CSS color: green-to-red gradient for all profiles except `"anxiety"`, blue-to-orange for `"anxiety"`
  - Create `cogni-sync/src/components/HeatmapView.tsx` — render each sentence as a `<span>` with the computed background color; show a tooltip on hover/focus with the score value and label
  - [x] 6.1 Write property test for heatmap sentence count
    - **Property 10: Heatmap Sentence Count Matches Input**
    - **Validates: Requirements 4.2**
  - [x] 6.2 Write property test for heatmap color monotonicity
    - **Property 11: Heatmap Color Monotonicity**
    - **Validates: Requirements 4.3, 4.6**
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 7. Implement `shareService` module
  - Create `cogni-sync/src/share/shareService.ts`
  - Install `lz-string` (`npm install lz-string`) for compression
  - Implement `encode(payload): string` — `JSON.stringify` → `LZString.compressToEncodedURIComponent` → append as `?share=` query param to `window.location.origin`
  - Implement `decode(url: string): SharePayload | null` — extract `share` param → `LZString.decompressFromEncodedURIComponent` → `JSON.parse`; wrap in try/catch and return `null` on failure
  - Implement `generatePDF(result: ProcessorResult): Blob` — build a minimal HTML string with tldr, key points, simplified text, and task list; use `window.print()` or a `<iframe>` print approach to produce a PDF download
  - Enforce the 8,000-character URL limit: truncate `rewrittenText` until the encoded URL fits, then notify the caller via a returned `truncated: boolean` flag
  - [x] 7.1 Write property test for share encode/decode round-trip
    - **Property 12: Share Encode/Decode Round-Trip**
    - **Validates: Requirements 5.3, 5.4**
  - [x] 7.2 Write property test for shareable URL length invariant
    - **Property 13: Shareable URL Length Invariant**
    - **Validates: Requirements 5.5**
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 8. Implement multi-document batch processing and synthesis
  - Modify `cogni-sync/src/components/DocumentIngestion.tsx` to accept `multiple` files (up to 10) via the file input
  - Add a batch processing loop in `AppContext.submitDocument`: process each file sequentially through the existing `processDocument` function; track per-file status in a `batchProgress` state array (pending / success / error)
  - Display a progress indicator showing `X of N files processed` and an inline error badge for failed files
  - After all files complete, call `POST /synthesize` with the merged results and file names; merge task lists (sorted by deadline, tasks without deadlines last) and deduplicate key points by text
  - Label each task and key point with its source `fileName`
  - Offer a "Save synthesis" button that saves the unified result to the Session_Store
  - [x] 8.1 Write property test for batch file count boundary
    - **Property 14: Batch File Count Boundary**
    - **Validates: Requirements 6.1**
  - [x] 8.2 Write property test for synthesis merge correctness
    - **Property 15: Synthesis Merge Correctness**
    - **Validates: Requirements 6.3**
  - [x] 8.3 Write property test for synthesis source labels
    - **Property 16: Synthesis Source Labels**
    - **Validates: Requirements 6.5**
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [x] 9. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement Highlight & Ask feature
  - Modify `cogni-sync/src/components/RewrittenContent.tsx` to wrap text in a container that listens for `mouseup` / `touchend` events and reads `window.getSelection()`
  - When a non-empty selection exists, render a contextual popover near the selection with an "Ask about this" button
  - On button click, show an inline input pre-populated with the selected text and placeholder "What does this mean?"
  - On form submit, call `POST /ask` with `{ selectionText, question, context: rewrittenText }`; show a loading spinner; render the answer inline below the passage
  - On error, show an inline retry message
  - Cap simultaneous open answers at 5: when a 6th is opened, close the oldest
  - [x] 10.1 Write property test for ask answer count cap
    - **Property 17: Ask Answer Count Cap**
    - **Validates: Requirements 7.7**
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [x] 11. Implement Glossary Mode
  - Create `cogni-sync/src/components/GlossaryPanel.tsx` — render a consolidated list of all `JargonTerm` entries with term, definition, and example sentence
  - After a document is processed, call `POST /glossary` with `{ text: rewrittenText, profile }`; store the `GlossaryResult` in `AppContext`
  - In `RewrittenContent`, scan the text for each detected `term` and wrap occurrences in a `<span>` with a dotted underline; on click/focus, show a glossary card popover with the term's definition and example sentence
  - If the `/glossary` endpoint fails, hide underlines and show a non-blocking toast notice
  - [x] 11.1 Write property test for glossary term count cap
    - **Property 18: Glossary Term Count Cap**
    - **Validates: Requirements 8.1**
  - [x] 11.2 Write property test for glossary card content completeness
    - **Property 19: Glossary Card Content Completeness**
    - **Validates: Requirements 8.3**
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [x] 12. Implement `useTTS` hook and `ReadAloudControls` component
  - Create `cogni-sync/src/hooks/useTTS.ts`
  - Check `'speechSynthesis' in window`; if absent, set `supported: false` and return early
  - Implement `speak(text: string)`, `pause()`, `resume()`, `stop()` using `SpeechSynthesisUtterance` and `window.speechSynthesis`
  - Apply profile-specific config: `rate = 0.85` for `"dyslexia"`, `pitch = 0.9` for `"anxiety"`, defaults otherwise
  - Track `status: 'idle' | 'playing' | 'paused'` and `currentIndex` for key-point reading (500 ms pause between items)
  - Create `cogni-sync/src/components/ReadAloudControls.tsx` — render Play/Pause/Resume/Stop buttons; hide entirely when `supported === false` and show a browser-support notice
  - [x] 12.1 Write property test for TTS profile configuration
    - **Property 20: TTS Profile Configuration**
    - **Validates: Requirements 9.7, 9.8**
  - [x] 12.2 Write property test for TTS key points read in order
    - **Property 21: TTS Key Points Read in Order**
    - **Validates: Requirements 9.3**
  - [x] 12.3 Write property test for TTS stop returns to idle
    - **Property 22: TTS Stop Returns to Idle**
    - **Validates: Requirements 9.6**
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9_

- [x] 13. Implement `useAnnotations` hook and `AnnotationLayer` component
  - Create `cogni-sync/src/hooks/useAnnotations.ts`
  - Implement `addAnnotation`, `deleteAnnotation`, `getAnnotations(sessionId)` operating on the in-memory annotation list (persisted as part of the Session via `useSessionStore`)
  - Define a palette of at least 3 highlight colors (e.g., `#fde68a`, `#a7f3d0`, `#bfdbfe`)
  - Create `cogni-sync/src/components/AnnotationLayer.tsx`
  - Add an annotation mode toggle to the simplified content area; when active, listen for text selection and show a popover with "Highlight" (color picker from palette) and "Add note" options
  - Render highlights as colored `<mark>` elements over the selected character ranges; render note indicators as small icons at the selection start; clicking a note indicator shows the note text in a popover
  - On annotation delete, remove the visual element immediately and update the annotation list
  - [x] 13.1 Write property test for annotation persistence round-trip
    - **Property 23: Annotation Persistence Round-Trip**
    - **Validates: Requirements 10.6, 10.7**
  - [x] 13.2 Write property test for annotation delete removes entry
    - **Property 24: Annotation Delete Removes Entry**
    - **Validates: Requirements 10.8**
  - [x] 13.3 Write property test for highlight color palette size
    - **Property 25: Highlight Color Palette Size**
    - **Validates: Requirements 10.3**
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_

- [x] 14. Implement `useDigest` hook and `WeeklyDigest` component
  - Create `cogni-sync/src/hooks/useDigest.ts`
  - Implement `computeDigest(sessions: Session[]): WeeklyDigestResult` — filter tasks whose `deadline` parses to a date within the next 7 calendar days from `Date.now()`, sort ascending by deadline, attach `sourceFileName` and `sessionId`
  - Request browser notification permission if not already granted; schedule a `Notification` at 9:00 AM Monday using `setTimeout` offset from current time; clicking the notification opens the Weekly Digest view
  - Create `cogni-sync/src/components/WeeklyDigest.tsx` — render tasks grouped by day with source filename labels; show a one-time prompt to enable notifications if permission is `"default"`
  - Add a "Weekly Digest" entry to the app navigation (e.g., a button in `Header.tsx`) that shows the digest view
  - [x] 14.1 Write property test for digest filter and sort
    - **Property 26: Digest Filters to 7-Day Window and Sorts Ascending**
    - **Validates: Requirements 11.2, 11.3**
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

- [x] 15. Implement `SessionHistory` component and wire session save/restore into `AppContext`
  - Create `cogni-sync/src/components/SessionHistory.tsx` — render a list of saved sessions ordered by `savedAt` descending; each row shows `fileName`, `savedAt` date, and Delete button
  - Add `saveCurrentSession`, `restoreSession`, `deleteSession` actions to `AppContext` using `useSessionStore`
  - After a successful document process, show a "Save Session" button in the results area
  - On restore, set `processing.result`, `taskCompletions`, `adaptationProfile`, `complexityLevel`, and re-apply annotations from the restored session
  - Add a "History" entry to the app navigation that toggles the `SessionHistory` panel
  - _Requirements: 1.1, 1.2, 1.4, 1.5, 1.6, 1.7, 1.8_

- [x] 16. Wire all new features into `App.tsx` and `FloatingActions`
  - Add `HeatmapView` card to the results area (shown after successful processing)
  - Add `ReadAloudControls` to the Simplified Content card and Key Points card
  - Add `AnnotationLayer` toggle to the Simplified Content card
  - Add `GlossaryPanel` below the results area when glossary terms are available
  - Update `FloatingActions` `onExport` to call `shareService.generatePDF` and `onShare` to call `shareService.encode` and copy to clipboard
  - Add "Export to Calendar" button to the Priority Matrix / task list area when tasks with deadlines exist
  - _Requirements: 2.1, 4.1, 5.1, 8.4, 9.1, 10.1_

- [x] 17. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 18. Build the LMS browser extension
  - Create `extension/` directory with the following files:
  - `extension/manifest.json` — Chrome MV3 manifest: `manifest_version: 3`, `content_scripts` matching `*://*.instructure.com/*` and `*://*.blackboard.com/*`, `background.service_worker`, `permissions: ["storage"]`
  - `extension/manifest.firefox.json` — Firefox WebExtension manifest: same fields but `manifest_version: 2`, `background.scripts`, `browser_specific_settings`
  - `extension/content.js` — query `main`, `#content`, `.content`, `article` selectors for the main content region; if found, inject a "Simplify with CogniSync" button into the page; on click, extract `innerText` and call `chrome.runtime.sendMessage({ type: 'OPEN_APP', text })`; if no region found, show a tooltip "Could not detect content area — please paste text manually" and send `{ type: 'OPEN_APP', text: '' }`
  - `extension/background.js` — listen for `OPEN_APP` messages; open a new tab to the CogniSync app URL with the extracted text encoded as a `?text=` query parameter; preserve user config in `chrome.storage.local` across updates by reading before writing
  - [x] 18.1 Write property test for extension text extraction
    - **Property 27: Extension Text Extraction Non-Empty on Valid LMS Page**
    - **Validates: Requirements 12.3**
  - [x] 18.2 Write property test for extension settings preserved across update
    - **Property 28: Extension Settings Preserved Across Update**
    - **Validates: Requirements 12.7**
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

- [x] 19. Add `?text=` pre-load support to the React app
  - In `cogni-sync/src/main.tsx` (or `App.tsx`), read the `text` query parameter on mount; if present and non-empty, call `submitDocument(decodedText)` automatically
  - Read the `share` query parameter on mount; if present, call `shareService.decode` and render the shared output in a read-only view (no upload UI, no save button)
  - _Requirements: 5.4, 12.4_

- [x] 20. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- `fast-check` is already installed in `cogni-sync/package.json`; run tests with `npm test` (uses `vitest --run`)
- Property tests live in `cogni-sync/src/__tests__/` alongside existing tests; each must include the comment tag `// Feature: cognisync-feature-expansion, Property N: <property_text>` and set `numRuns: 100`
- The extension files are plain JS (no bundler needed for MV3 content/background scripts)
- `lz-string` must be installed before implementing `shareService`: `cd cogni-sync && npm install lz-string`
