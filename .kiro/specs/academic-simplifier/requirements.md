# Requirements Document

## Introduction

Academic Simplifier is a web application that uses AI to transform dense academic content — syllabi, assignments, and course materials — into simplified, structured formats. The app targets students with hidden cognitive challenges (ADHD, dyslexia, anxiety, processing differences) by reducing cognitive overload through adaptive reading modes, actionable task extraction, plain language rewriting, and real-time complexity scoring. All AI processing uses mock API calls in the MVP; real integrations will be added in a later phase.

## Glossary

- **App**: The Academic Simplifier web application (Name of our app: "CogniSync")
- **User**: A student or learner using the App
- **Document**: An uploaded PDF file or pasted text containing academic content (syllabus, assignment, course material)
- **Processor**: The AI processing module responsible for analyzing and transforming Documents (mock in MVP)
- **Extractor**: The component that identifies key points and actionable tasks from a Document
- **Rewriter**: The component that rewrites Document content in plain language at a lower reading level
- **Scorer**: The component that computes cognitive load complexity metrics for a Document
- **Complexity Score**: A numeric readability metric (Flesch-Kincaid or token density) representing cognitive load
- **Focus View**: A reading mode that presents one concept at a time
- **Step-by-Step View**: A reading mode that presents content as numbered sequential instructions
- **Task**: An actionable to-do item derived from a Document, optionally including an implied deadline
- **Key Point**: A concise summary item representing essential information extracted from a Document

---

## Requirements

### Requirement 1: Document Ingestion

**User Story:** As a student, I want to upload a PDF/.pptx/.docx/.xlsx/.txt or any other common file format, and also be able to paste text directly, so that I can process any academic document without manual reformatting.

#### Acceptance Criteria

1. THE App SHALL accept file uploads of up to 100 MB in size.
2. THE App SHALL accept plain text input via a paste interface with a maximum of 80,000 characters.
3. WHEN a User uploads a file, THE App SHALL extract the text content from the file and make it available for processing.
4. WHEN a User submits a Document, THE App SHALL display a loading indicator until processing is complete.
5. IF a User uploads a file that is not an allowed file, THEN THE App SHALL display an error message stating that the file type is not supported.
6. IF a User uploads a file that exceeds 100 MB, THEN THE App SHALL display an error message stating the file size limit.
7. IF text extraction from the file fails, THEN THE App SHALL display an error message and prompt the User to paste the text manually.

---

### Requirement 2: AI-Powered Key Point Extraction

**User Story:** As a student, I want the app to pull out the most important points from my document, so that I can quickly understand what I need to know without reading everything.

#### Acceptance Criteria

1. WHEN a Document is submitted, THE Extractor SHALL identify and return a list of Key Points representing the essential information in the Document.
2. THE Extractor SHALL return no fewer than 3 and no more than 15 Key Points per Document.
3. THE App SHALL display Key Points as a distinct, scannable list separate from other output sections.
4. WHEN the Extractor is operating in MVP mode, THE Processor SHALL use mock API responses to simulate AI key point extraction without making real API calls.
5. IF the Extractor returns no Key Points, THEN THE App SHALL display a message indicating that no key points could be identified.

---

### Requirement 3: Actionable Task List Generation

**User Story:** As a student, I want vague assignment instructions converted into clear to-do items with implied deadlines, so that I know exactly what actions to take and when.

#### Acceptance Criteria

1. WHEN a Document is submitted, THE Extractor SHALL generate a list of Tasks derived from instructions, requirements, and deadlines found in the Document.
2. EACH Task SHALL include a short action-oriented description written in imperative form (e.g., "Submit essay draft").
3. WHEN a deadline or due date is detectable in the Document, THE Extractor SHALL associate that deadline with the relevant Task.
4. THE App SHALL display Tasks as a checklist that the User can mark as complete within the session.
5. WHEN the Extractor is operating in MVP mode, THE Processor SHALL use mock API responses to simulate task generation without making real API calls.
6. IF no Tasks are identified in a Document, THEN THE App SHALL display a message indicating that no actionable tasks were found.

---

### Requirement 4: Reading Modes

**User Story:** As a student with attention or processing differences, I want to choose how content is presented to me, so that I can engage with material in the format that works best for my needs.

#### Acceptance Criteria

1. THE App SHALL provide two reading modes: Focus View and Step-by-Step View.
2. WHEN a User selects Focus View, THE App SHALL display one Key Point or concept at a time with navigation controls to move forward and backward.
3. WHEN a User selects Step-by-Step View, THE App SHALL display the simplified content as a numbered sequential list of instructions or concepts.
4. THE App SHALL allow the User to switch between reading modes at any time without reprocessing the Document.
5. WHILE a User is in Focus View, THE App SHALL display a progress indicator showing the current item number and total count (e.g., "3 of 8").

---

### Requirement 5: Cognitive Load Scoring

**User Story:** As a student, I want to see a before-and-after complexity score for my document, so that I can understand how much the simplification has reduced the cognitive load.

#### Acceptance Criteria

1. WHEN a Document is submitted, THE Scorer SHALL compute a Complexity Score for the original Document content.
2. WHEN the Rewriter produces simplified output, THE Scorer SHALL compute a Complexity Score for the simplified content.
3. THE App SHALL display both the original and simplified Complexity Scores visually (e.g., a progress bar, gauge, or numeric comparison).
4. THE App SHALL display the percentage reduction between the original and simplified Complexity Scores.
5. THE Scorer SHALL compute Complexity Scores using the Flesch-Kincaid readability formula or token density calculation applied client-side or via mock response.
6. IF a Complexity Score cannot be computed for a Document, THEN THE App SHALL display a message indicating that scoring is unavailable for that content.

---

### Requirement 6: Plain Language Rewriting

**User Story:** As a student, I want jargon-heavy academic text rewritten in plain language at a lower reading level, so that I can understand the content without needing specialized vocabulary.

#### Acceptance Criteria

1. WHEN a Document is submitted, THE Rewriter SHALL produce a plain language version of the Document content targeting a reading level of Grade 8 or below (Flesch-Kincaid Grade Level ≤ 8).
2. THE Rewriter SHALL preserve the factual meaning and all key information from the original Document in the rewritten output.
3. THE App SHALL display the rewritten content in a dedicated output section alongside or below the original.
4. WHEN the Rewriter is operating in MVP mode, THE Processor SHALL use mock API responses to simulate plain language rewriting without making real API calls.
5. IF the Rewriter returns an empty or failed response, THEN THE App SHALL display an error message and show the original content unchanged.

---

### Requirement 7: Mock API Layer

**User Story:** As a developer, I want all AI-dependent features to use mock responses during the MVP phase, so that the app can be built and tested without consuming real API credits.

#### Acceptance Criteria

1. THE Processor SHALL include a mock mode that intercepts all AI API calls and returns predefined, realistic mock responses.
2. WHEN mock mode is active, THE Processor SHALL introduce a simulated delay of 500ms to 1500ms to replicate real API latency.
3. THE App SHALL default to mock mode in the MVP build.
4. THE mock responses SHALL cover all Processor operations: key point extraction, task generation, and plain language rewriting.
5. WHERE a real API integration is later added, THE Processor SHALL support switching from mock mode to live mode via a configuration flag without requiring code changes to consuming components.
