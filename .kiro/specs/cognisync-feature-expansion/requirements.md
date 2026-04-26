# Requirements Document

## Introduction

This document defines the requirements for the CogniSync Feature Expansion — a set of 14 new capabilities added to the existing React + TypeScript + Vite document simplification web app. CogniSync serves students with ADHD, dyslexia, and anxiety by simplifying academic documents via AI. The expansion covers five areas: utility features (calendar export, multi-document synthesis, complexity heatmap, saved sessions, shareable output), LMS browser extension integration, user control features (highlight & ask, glossary mode, audio read-aloud, task due date editing), engagement features (weekly digest, annotation layer), and a browser extension.

The existing system already provides: document ingestion (PDF, DOCX, PPTX, XLSX, TXT), AI-powered simplification via AWS Bedrock, complexity scoring, reading modes (Focus View, Step-by-Step), adaptation profiles (ADHD, Dyslexia, Anxiety, Default), key points extraction, and task list detection with Eisenhower matrix prioritization.

---

## Glossary

- **App**: The CogniSync React + TypeScript + Vite web application running in the browser.
- **Session**: A single processed document result, including the original text, simplified output, key points, tasks, scores, annotations, and metadata.
- **Session_Store**: The browser-side persistence layer (IndexedDB) that stores saved Sessions.
- **Calendar_Exporter**: The module responsible for generating .ics files and initiating Google Calendar pushes from detected Task deadlines.
- **Synthesizer**: The server-side module that merges multiple document ProcessorResults into a unified weekly action plan.
- **Heatmap_Renderer**: The client-side module that annotates original text sentences with a color derived from their per-sentence cognitive load score.
- **Share_Service**: The module responsible for generating PDF exports and shareable encoded URLs of simplified output.
- **Glossary_Builder**: The AI-assisted module that detects domain-specific jargon in simplified output and produces a mini glossary.
- **TTS_Engine**: The browser's Web Speech API SpeechSynthesis interface used for audio read-aloud.
- **Annotation_Store**: The per-session storage layer (within Session_Store) that persists user highlights and notes.
- **Digest_Service**: The module that aggregates tasks across saved Sessions and delivers a weekly summary.
- **Extension**: The Chrome/Firefox browser extension that detects LMS pages and injects a "Simplify with CogniSync" button.
- **LMS**: A Learning Management System such as Canvas or Blackboard.
- **ProcessorResult**: The existing data structure returned by the server `/process` endpoint, containing keyPoints, tasks, rewrittenText, originalScore, simplifiedScore, and tldr.
- **Task**: The existing data structure representing a detected to-do item with optional deadline, urgency, and importance fields.
- **Sentence_Score**: A per-sentence cognitive load value (0–100, higher = more complex) derived from Flesch Reading Ease applied to individual sentences.
- **ICS**: The iCalendar file format (.ics) used for calendar event exchange.
- **Jargon_Term**: A domain-specific or technical word detected in the simplified output that may be unfamiliar to the target student audience.
- **Annotation**: A user-created highlight range and/or text note attached to a specific character offset range within a Session's simplified output.

---

## Requirements

### Requirement 1: Saved Sessions / History

**User Story:** As a student, I want to save processed documents locally and return to them later, so that I do not need to re-upload the same file every time I revisit my notes.

#### Acceptance Criteria

1. WHEN a document is successfully processed, THE App SHALL offer the user an option to save the current Session to the Session_Store.
2. WHEN the user saves a Session, THE Session_Store SHALL persist the Session including the original text, ProcessorResult, adaptation profile, complexity level, task completions, and a timestamp.
3. THE Session_Store SHALL store Sessions using IndexedDB with a fallback to localStorage when IndexedDB is unavailable.
4. WHEN the user opens the Sessions history view, THE App SHALL display a list of saved Sessions ordered by most recently saved first.
5. WHEN the user selects a saved Session from the history list, THE App SHALL restore the full Session state including simplified output, key points, tasks, task completions, and annotations without re-processing.
6. WHEN the user deletes a saved Session, THE Session_Store SHALL remove the Session and THE App SHALL update the history list immediately.
7. IF the Session_Store exceeds 50 saved Sessions, THEN THE Session_Store SHALL automatically remove the oldest Session to stay within the limit.
8. THE Session_Store SHALL store all data locally in the user's browser and SHALL NOT transmit Session data to any external server.

---

### Requirement 2: Calendar Export

**User Story:** As a student, I want to export detected deadlines to my calendar, so that I can track assignment due dates without manually re-entering them.

#### Acceptance Criteria

1. WHEN a ProcessorResult contains at least one Task with a non-empty deadline field, THE App SHALL display a "Export to Calendar" action in the task list area.
2. WHEN the user activates the "Export to Calendar" action, THE Calendar_Exporter SHALL generate a valid ICS file containing one VEVENT per Task that has a confirmed deadline.
3. WHEN the Calendar_Exporter generates an ICS file, THE App SHALL trigger a browser file download of the ICS file named `cognisync-deadlines.ics`.
4. WHERE Google Calendar integration is enabled, THE Calendar_Exporter SHALL provide an option to open a pre-filled Google Calendar event creation URL for each Task deadline.
5. WHEN a Task deadline is in an ambiguous or non-ISO format, THE Calendar_Exporter SHALL parse the deadline into a valid date before generating the VEVENT, and IF parsing fails, THEN THE Calendar_Exporter SHALL skip that Task and notify the user of the skipped item.
6. THE ICS file generated by THE Calendar_Exporter SHALL conform to RFC 5545 and SHALL be importable by Google Calendar, Apple Calendar, and Outlook.

---

### Requirement 3: Task Due Date Editing

**User Story:** As a student, I want to manually edit or confirm detected deadlines before exporting, so that I can correct AI errors and ensure my calendar reflects accurate dates.

#### Acceptance Criteria

1. WHEN the task list is displayed, THE App SHALL render each Task's deadline as an editable field alongside the task description.
2. WHEN the user edits a Task deadline, THE App SHALL validate that the entered value is a recognizable date format and SHALL display an inline error message if the format is invalid.
3. WHEN the user confirms a valid edited deadline, THE App SHALL update the Task's deadline in the current Session state.
4. WHEN the user clears a Task deadline field, THE App SHALL set the Task's deadline to undefined and SHALL exclude that Task from calendar exports.
5. WHEN a Task has no AI-detected deadline, THE App SHALL display an empty editable deadline field so the user can add one manually.

---

### Requirement 4: Complexity Heatmap

**User Story:** As a student, I want to see which sentences in the original text are hardest to understand, so that I can focus my attention on the most cognitively demanding parts.

#### Acceptance Criteria

1. WHEN a document is successfully processed, THE App SHALL display a "Complexity Heatmap" view of the original text alongside the simplified output.
2. WHEN rendering the heatmap view, THE Heatmap_Renderer SHALL split the original text into individual sentences and compute a Sentence_Score for each sentence using the Flesch Reading Ease formula.
3. WHEN rendering each sentence, THE Heatmap_Renderer SHALL apply a background color on a continuous green-to-red gradient where a Sentence_Score of 100 maps to green and a Sentence_Score of 0 maps to red.
4. WHEN the user hovers over or focuses a highlighted sentence, THE App SHALL display a tooltip showing the sentence's Sentence_Score and a human-readable label (e.g., "Difficult", "Standard").
5. THE Heatmap_Renderer SHALL render the heatmap entirely client-side without additional server requests.
6. WHEN the adaptation profile is set to "anxiety", THE App SHALL replace the red-to-green color gradient with a blue-to-orange gradient to avoid distress-inducing color associations.

---

### Requirement 5: Shareable Output

**User Story:** As a student, I want to export or share the simplified version of a document, so that I can collaborate with study groups, tutors, or accessibility offices.

#### Acceptance Criteria

1. WHEN a document is successfully processed, THE App SHALL display export and share actions accessible from the results area.
2. WHEN the user activates the "Export as PDF" action, THE Share_Service SHALL generate a PDF containing the tldr, key points, simplified text, and task list, and THE App SHALL trigger a browser download of the PDF.
3. WHEN the user activates the "Copy shareable link" action, THE Share_Service SHALL encode the simplified output, key points, and task list into a URL-safe base64 string appended as a query parameter to the App's base URL, and THE App SHALL copy the resulting URL to the clipboard.
4. WHEN a user opens a shareable link, THE App SHALL decode the query parameter and render the shared simplified output, key points, and task list in a read-only view.
5. IF the encoded shareable link exceeds 8,000 characters, THEN THE Share_Service SHALL truncate the simplified text to fit within the limit and SHALL notify the user that the shared content was truncated.
6. THE Share_Service SHALL NOT require user authentication or a backend server to generate shareable links.

---

### Requirement 6: Multi-Document Synthesis

**User Story:** As a student, I want to upload multiple documents at once and receive a unified weekly action plan, so that I can see all my deadlines and priorities across all my classes in one place.

#### Acceptance Criteria

1. WHEN the user selects multiple files in the document ingestion area, THE App SHALL accept up to 10 files simultaneously for batch processing.
2. WHEN multiple files are submitted, THE App SHALL process each file individually through the existing `/process` endpoint and SHALL display a progress indicator showing how many files have been processed.
3. WHEN all files have been processed, THE Synthesizer SHALL merge the individual ProcessorResults into a single unified Session containing: a combined task list sorted by deadline, deduplicated key points, and a synthesis summary.
4. WHEN the Synthesizer generates the synthesis summary, THE App SHALL send the merged task list and key points to the server `/synthesize` endpoint, which SHALL return a plain-English "week at a glance" paragraph.
5. WHEN the unified Session is displayed, THE App SHALL label each task and key point with the source document filename.
6. IF any individual file fails to process during batch ingestion, THEN THE App SHALL display an error for that file and SHALL continue processing the remaining files.
7. WHEN the unified Session is complete, THE App SHALL offer the user the option to save it to the Session_Store as a single Session.

---

### Requirement 7: Highlight & Ask

**User Story:** As a student, I want to select any sentence in the simplified output and ask a follow-up question about it, so that I can get immediate clarification on confusing content.

#### Acceptance Criteria

1. WHEN the simplified output is displayed, THE App SHALL enable text selection on the simplified content area.
2. WHEN the user selects a range of text in the simplified output, THE App SHALL display a contextual action popover near the selection containing a "Ask about this" button.
3. WHEN the user activates "Ask about this", THE App SHALL display an inline input field pre-populated with the selected text and a prompt placeholder such as "What does this mean?".
4. WHEN the user submits a follow-up question, THE App SHALL send the selected text and the question to the server `/ask` endpoint and SHALL display a loading indicator while awaiting the response.
5. WHEN the server returns a response, THE App SHALL display the answer inline below the selected passage without navigating away from the current view.
6. IF the server `/ask` endpoint returns an error, THEN THE App SHALL display an inline error message and SHALL allow the user to retry the question.
7. THE App SHALL support up to 5 simultaneous open follow-up answers visible at once within a single Session view.

---

### Requirement 8: Glossary Mode

**User Story:** As a student, I want domain-specific jargon in the simplified output to be automatically identified and explained, so that I can understand unfamiliar terms without leaving the app.

#### Acceptance Criteria

1. WHEN a document is successfully processed, THE Glossary_Builder SHALL analyze the simplified output and identify up to 20 Jargon_Terms.
2. WHEN Jargon_Terms are identified, THE App SHALL render each Jargon_Term in the simplified output with a visual underline indicator.
3. WHEN the user activates a Jargon_Term, THE App SHALL display a glossary card containing the term, a plain-English definition, and an example sentence.
4. WHEN the glossary card is displayed, THE App SHALL also render a consolidated Glossary panel at the bottom of the results area listing all identified Jargon_Terms and their definitions.
5. THE Glossary_Builder SHALL request jargon detection and definitions from the server `/glossary` endpoint, passing the simplified text and the active adaptation profile.
6. WHEN the adaptation profile is "dyslexia" or "anxiety", THE Glossary_Builder SHALL request definitions written at a Grade 6 reading level or below.
7. IF the server `/glossary` endpoint is unavailable, THEN THE App SHALL hide the glossary underline indicators and SHALL display a non-blocking notice that glossary mode is temporarily unavailable.

---

### Requirement 9: Audio Read-Aloud

**User Story:** As a student, I want the simplified content and key points to be read aloud to me, so that I can absorb the material through listening when reading is difficult.

#### Acceptance Criteria

1. WHEN a document is successfully processed, THE App SHALL display a "Read Aloud" control in the simplified content area and in the key points area.
2. WHEN the user activates "Read Aloud" on the simplified content, THE TTS_Engine SHALL begin reading the full simplified text aloud using the browser's SpeechSynthesis API.
3. WHEN the user activates "Read Aloud" on the key points, THE TTS_Engine SHALL read each key point aloud in order, pausing 500 milliseconds between items.
4. WHILE the TTS_Engine is reading, THE App SHALL highlight the sentence or key point currently being spoken.
5. WHILE the TTS_Engine is reading, THE App SHALL display Pause, Resume, and Stop controls.
6. WHEN the user activates Stop, THE TTS_Engine SHALL cancel speech synthesis and THE App SHALL return to the idle read-aloud state.
7. WHEN the adaptation profile is "dyslexia", THE TTS_Engine SHALL set the speech rate to 0.85 (85% of normal speed) by default.
8. WHEN the adaptation profile is "anxiety", THE TTS_Engine SHALL set the speech pitch to 0.9 (slightly lower than default) by default.
9. IF the browser does not support the Web Speech API, THEN THE App SHALL hide the "Read Aloud" controls and SHALL display a notice that audio read-aloud is not supported in the current browser.

---

### Requirement 10: Annotation Layer

**User Story:** As a student, I want to highlight passages and add personal notes on top of the simplified output, so that I can capture my own understanding alongside the AI-generated content.

#### Acceptance Criteria

1. WHEN a document is successfully processed, THE App SHALL enable an annotation mode toggle in the simplified content area.
2. WHEN annotation mode is active and the user selects a text range in the simplified output, THE App SHALL display an action popover with options to highlight the selection or add a note.
3. WHEN the user chooses to highlight, THE App SHALL apply a persistent visual highlight to the selected text range using a color chosen from a palette of at least 3 colors.
4. WHEN the user chooses to add a note, THE App SHALL display an inline text input anchored to the selection, and WHEN the user saves the note, THE App SHALL render a note indicator icon at the selection start.
5. WHEN the user activates a note indicator, THE App SHALL display the note text in a popover.
6. WHEN the user saves a Session containing annotations, THE Annotation_Store SHALL persist all Annotations (highlight ranges and notes) as part of the Session in the Session_Store.
7. WHEN the user restores a saved Session, THE App SHALL re-apply all persisted Annotations to the restored simplified output.
8. WHEN the user deletes an Annotation, THE App SHALL remove the visual highlight or note indicator immediately and SHALL update the Annotation_Store.

---

### Requirement 11: Weekly Digest

**User Story:** As a student, I want to receive a weekly summary of all my upcoming tasks across saved sessions, so that I can stay on top of my workload without manually reviewing each document.

#### Acceptance Criteria

1. WHEN the user has at least one saved Session containing Tasks with deadlines, THE App SHALL display a "Weekly Digest" view accessible from the main navigation.
2. WHEN the Weekly Digest view is opened, THE Digest_Service SHALL aggregate all Tasks from saved Sessions whose deadlines fall within the next 7 calendar days.
3. WHEN the Digest_Service aggregates tasks, THE App SHALL display the tasks grouped by day, sorted by deadline ascending, and labeled with the source document filename.
4. WHEN the user has granted browser notification permission, THE App SHALL schedule a browser push notification at 9:00 AM on Monday of each week summarizing the count of tasks due that week.
5. WHEN the user activates the notification, THE App SHALL open the Weekly Digest view.
6. IF the user has not granted notification permission, THEN THE App SHALL display the Weekly Digest view without scheduling notifications and SHALL offer a one-time prompt to enable notifications.
7. THE Digest_Service SHALL compute the weekly digest entirely client-side from the Session_Store without requiring a server request.

---

### Requirement 12: LMS Browser Extension

**User Story:** As a student, I want a browser button on Canvas and Blackboard pages that lets me simplify content without leaving the LMS, so that I can use CogniSync with zero friction during my normal study workflow.

#### Acceptance Criteria

1. THE Extension SHALL be installable as a Chrome Manifest V3 extension and as a Firefox WebExtension.
2. WHEN the Extension is installed and the user navigates to a page on a supported LMS domain (canvas.instructure.com or any subdomain, blackboard.com or any subdomain), THE Extension SHALL inject a "Simplify with CogniSync" button into the page's primary content area.
3. WHEN the user activates the "Simplify with CogniSync" button, THE Extension SHALL extract the visible text content of the LMS page's main content region.
4. WHEN text is extracted, THE Extension SHALL open the CogniSync App in a new browser tab with the extracted text pre-loaded and processing initiated automatically.
5. IF the Extension cannot identify a main content region on the LMS page, THEN THE Extension SHALL display a tooltip message "Could not detect content area — please paste text manually" and SHALL open the CogniSync App in a new tab without pre-loaded text.
6. THE Extension SHALL NOT collect, store, or transmit any LMS page content to any server other than the CogniSync backend server used for document processing.
7. WHEN the Extension is updated, THE Extension SHALL preserve any user configuration settings across the update.

