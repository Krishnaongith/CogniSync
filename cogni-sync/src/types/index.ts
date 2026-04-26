// Supported MIME types for file ingestion
export const SUPPORTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',   // .docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',         // .xlsx
  'text/plain',
] as const;

export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB
export const MAX_PASTE_CHARS = 80_000;

// --- Extractor ---

export interface KeyPoint {
  id: string;
  text: string;
  sourceFileName?: string;
}

export type TaskUrgency = 'urgent' | 'not-urgent';
export type TaskImportance = 'important' | 'not-important';

export interface Task {
  id: string;
  description: string;   // imperative form, e.g. "Submit essay draft"
  deadline?: string;     // ISO date string or human-readable, if detected
  completed: boolean;
  urgency?: TaskUrgency;
  importance?: TaskImportance;
  sourceFileName?: string;
  sessionId?: string;
}

// Eisenhower quadrant derived from urgency + importance
export type PriorityQuadrant = 'do-now' | 'schedule' | 'delegate' | 'eliminate';

export function getQuadrant(task: Task): PriorityQuadrant {
  const u = task.urgency ?? 'not-urgent';
  const i = task.importance ?? 'not-important';
  if (u === 'urgent' && i === 'important') return 'do-now';
  if (u === 'not-urgent' && i === 'important') return 'schedule';
  if (u === 'urgent' && i === 'not-important') return 'delegate';
  return 'eliminate';
}

export interface ExtractorOutput {
  keyPoints: KeyPoint[];  // 3–15 items
  tasks: Task[];
}

// --- Rewriter ---

export interface RewriterOutput {
  rewrittenText: string;
}

// --- Scorer ---

export interface ComplexityScore {
  fleschKincaidGrade: number;
  fleschReadingEase: number;  // 0–100, higher = easier
  label: 'Very Easy' | 'Easy' | 'Fairly Easy' | 'Standard' | 'Fairly Difficult' | 'Difficult' | 'Very Confusing';
}

// --- Ingestion ---

export interface IngestionResult {
  text: string;
  sourceType: 'file' | 'paste';
  fileName?: string;
}

export interface IngestionError {
  code: 'UNSUPPORTED_TYPE' | 'FILE_TOO_LARGE' | 'EXTRACTION_FAILED' | 'PASTE_TOO_LONG';
  message: string;
}

// --- Processor ---

export interface ProcessorConfig {
  useMock: boolean;
  mockDelayMs?: { min: number; max: number };
}

export interface ProcessorResult {
  keyPoints: KeyPoint[];
  tasks: Task[];
  rewrittenText: string;
  originalScore: ComplexityScore;
  simplifiedScore: ComplexityScore;
  tldr?: string;
}

// --- Mock API ---

export interface MockResponse {
  keyPoints: KeyPoint[];
  tasks: Task[];
  rewrittenText: string;
  tldr?: string;
}

// --- Document ---

export interface Document {
  id: string;
  rawText: string;
  sourceType: 'file' | 'paste';
  fileName?: string;
  ingestedAt: Date;
}

// --- Processing State ---

export type ProcessingStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ProcessingState {
  status: ProcessingStatus;
  document?: Document;
  result?: ProcessorResult;
  error?: IngestionError | string;
}

// --- Reading Modes ---

export type ReadingMode = 'focus' | 'step-by-step';

export interface FocusViewState {
  currentIndex: number;
  total: number;
}

export interface ReadingModeState {
  mode: ReadingMode;
  focusState?: FocusViewState;
}

// --- Adaptation Profile ---

export type AdaptationProfile = 'default' | 'adhd' | 'dyslexia' | 'anxiety';

export interface AdaptationProfileConfig {
  id: AdaptationProfile;
  label: string;
  description: string;
  chunkSize: 'small' | 'medium' | 'large';
  extraWhitespace: boolean;
  tone: 'calm' | 'neutral' | 'energetic';
}

export const ADAPTATION_PROFILES: AdaptationProfileConfig[] = [
  {
    id: 'default',
    label: 'Default',
    description: 'Standard layout and tone',
    chunkSize: 'large',
    extraWhitespace: false,
    tone: 'neutral',
  },
  {
    id: 'adhd',
    label: 'ADHD',
    description: 'Short chunks, high contrast, energetic tone',
    chunkSize: 'small',
    extraWhitespace: true,
    tone: 'energetic',
  },
  {
    id: 'dyslexia',
    label: 'Dyslexia',
    description: 'Wider spacing, larger text, calm tone',
    chunkSize: 'medium',
    extraWhitespace: true,
    tone: 'calm',
  },
  {
    id: 'anxiety',
    label: 'Anxiety',
    description: 'Gentle tone, no urgency language, calm pacing',
    chunkSize: 'medium',
    extraWhitespace: true,
    tone: 'calm',
  },
];

// --- Complexity Dial ---

// 1 = kindergarten, 5 = middle school, 8 = high school, 12 = college, 16 = graduate
export type ComplexityLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;

export const COMPLEXITY_LABELS: Record<number, string> = {
  1:  'Kindergarten',
  2:  'Early Elementary',
  3:  'Early Elementary',
  4:  'Elementary',
  5:  'Elementary',
  6:  'Middle School',
  7:  'Middle School',
  8:  'High School',
  9:  'High School',
  10: 'Early College',
  11: 'Early College',
  12: 'College',
  13: 'College',
  14: 'Advanced',
  15: 'Advanced',
  16: 'Graduate',
};

// --- App State ---

export interface AppState {
  processing: ProcessingState;
  readingMode: ReadingModeState;
  taskCompletions: Record<string, boolean>; // taskId -> completed
  adaptationProfile: AdaptationProfile;
  complexityLevel: ComplexityLevel;
  rewrittenAtLevel?: string; // cached rewrite for current complexity level
  isRewriting: boolean;
}

// --- Collection ---

export interface Collection {
  id: string;          // crypto.randomUUID()
  name: string;        // user-defined, unique (case-insensitive)
  createdAt: string;   // ISO 8601 timestamp
  updatedAt: string;   // ISO 8601 timestamp
}

// --- Session ---

export interface Annotation {
  id: string;
  sessionId: string;
  startOffset: number;   // character offset in simplified text
  endOffset: number;
  color?: string;        // highlight color hex, undefined = note-only
  note?: string;         // user note text, undefined = highlight-only
  createdAt: string;     // ISO timestamp
}

export interface Session {
  id: string;
  savedAt: string;                        // ISO timestamp
  fileName?: string;                      // source file name(s)
  rawText: string;
  result: ProcessorResult;
  adaptationProfile: AdaptationProfile;
  complexityLevel: ComplexityLevel;
  taskCompletions: Record<string, boolean>;
  annotations: Annotation[];
  collectionId?: string | null;           // FK to Collection.id, null = uncategorized
}

// --- Heatmap ---

export interface SentenceScore {
  text: string;
  score: number;   // Flesch Reading Ease 0–100
  label: ComplexityScore['label'];
}

// --- Glossary ---

export interface JargonTerm {
  term: string;
  definition: string;
  exampleSentence: string;
}

export interface GlossaryResult {
  terms: JargonTerm[];   // up to 20
}

// --- Synthesis ---

export interface SynthesisResult {
  sessions: ProcessorResult[];
  mergedTasks: Task[];          // sorted by deadline, labeled with source
  mergedKeyPoints: KeyPoint[];  // deduplicated
  summary: string;              // "week at a glance" paragraph from /synthesize
}

// --- Ask ---

export interface AskResult {
  question: string;
  answer: string;
  selectionText: string;
}

// --- Digest ---

export interface DigestTask extends Task {
  sourceFileName?: string;
  sessionId: string;
}

export interface WeeklyDigestResult {
  tasks: DigestTask[];   // tasks due within next 7 days, sorted by deadline
}
