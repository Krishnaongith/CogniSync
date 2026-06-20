import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { API_BASE } from '../config';
import type {
  AppState,
  ProcessingState,
  ReadingModeState,
  ReadingMode,
  AdaptationProfile,
  ComplexityLevel,
  Task,
  ProcessorResult,
  GlossaryResult,
  Session,
} from '../types/index';
import { validateFile, validatePaste, extractTextFromFile } from '../ingestion/ingestion';
import { processDocument, defaultConfig } from '../processor/processor';
import { rewriteAtLevel } from '../processor/liveApi';
import { mergeTasks, mergeKeyPoints, capFileList } from '../processor/synthesizer';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import { useSessionStore } from '../hooks/useSessionStore';

interface ProgressStats {
  documentsProcessed: number;
  totalReadingTime: number;
  currentStreak: number;
  longestStreak: number;
  lastVisitDate: string | null;
}

export interface BatchProgressItem {
  fileName: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

interface AppContextValue extends AppState {
  submitDocument: (input: File | File[] | string) => Promise<void>;
  toggleTask: (taskId: string) => void;
  updateTaskDeadline: (taskId: string, deadline: string | undefined) => void;
  setReadingMode: (mode: ReadingMode) => void;
  navigateNext: () => void;
  navigatePrev: () => void;
  setAdaptationProfile: (profile: AdaptationProfile) => void;
  reprocessWithProfile: (profile: AdaptationProfile) => Promise<void>;
  setComplexityLevel: (level: ComplexityLevel) => void;
  hasDocument: boolean;
  progressStats: ProgressStats;
  showToast: ReturnType<typeof useToast>['showToast'];
  batchProgress: BatchProgressItem[];
  glossaryResult: GlossaryResult | null;
  saveCurrentSession: (collectionId?: string | null) => Promise<void>;
  restoreSession: (session: Session) => void;
  deleteSession: (id: string) => Promise<void>;
  savedSessions: Session[];
}

const STORAGE_KEY = 'cognisync_progress_v2';

function loadProgressStats(): ProgressStats {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore errors
  }
  return {
    documentsProcessed: 0,
    totalReadingTime: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastVisitDate: null,
  };
}

function saveProgressStats(stats: ProgressStats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Ignore errors
  }
}

const AppContext = createContext<AppContextValue | null>(null);

/** Pure helper — exported for testability */
export function applyDeadlineUpdate(tasks: Task[], taskId: string, deadline: string | undefined): Task[] {
  return tasks.map((t) => t.id === taskId ? { ...t, deadline } : t);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [processing, setProcessing] = useState<ProcessingState>({ status: 'idle' });
  const [readingMode, setReadingModeState] = useState<ReadingModeState>({ mode: 'focus' });
  const [taskCompletions, setTaskCompletions] = useState<Record<string, boolean>>({});
  const [adaptationProfile, setAdaptationProfileState] = useState<AdaptationProfile>('default');
  const [complexityLevel, setComplexityLevelState] = useState<ComplexityLevel>(8);
  const [rewrittenAtLevel, setRewrittenAtLevel] = useState<string | undefined>(undefined);
  const [isRewriting, setIsRewriting] = useState(false);
  const [lastRawText, setLastRawText] = useState<string | undefined>(undefined);
  const [progressStats, setProgressStats] = useState<ProgressStats>(loadProgressStats);
  const [batchProgress, setBatchProgress] = useState<BatchProgressItem[]>([]);
  // null means tab is currently hidden — only count while visible
  const visibleSinceRef = useRef<number | null>(document.hidden ? null : Date.now());
  const statsRef = useRef(progressStats);
  const [glossaryResult, setGlossaryResult] = useState<GlossaryResult | null>(null);
  const { toasts, showToast, dismissToast } = useToast();
  const sessionStore = useSessionStore(showToast);
  const [savedSessions, setSavedSessions] = useState<Session[]>([]);

  // Keep statsRef in sync so the unload handler always sees current stats
  useEffect(() => { statsRef.current = progressStats; }, [progressStats]);

  // Track actual time spent — only counts while the tab is visible
  useEffect(() => {
    const flush = () => {
      if (visibleSinceRef.current === null) return 0;
      const elapsed = Math.floor((Date.now() - visibleSinceRef.current) / 60000);
      visibleSinceRef.current = null;
      return elapsed;
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        const elapsed = flush();
        if (elapsed > 0) {
          setProgressStats(prev => {
            const next = { ...prev, totalReadingTime: prev.totalReadingTime + elapsed };
            saveProgressStats(next);
            return next;
          });
        }
      } else {
        visibleSinceRef.current = Date.now();
      }
    };

    const onUnload = () => {
      const elapsed = flush();
      if (elapsed > 0) {
        const next = { ...statsRef.current, totalReadingTime: statsRef.current.totalReadingTime + elapsed };
        saveProgressStats(next);
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('beforeunload', onUnload);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('beforeunload', onUnload);
    };
  }, []);

  // Update streak on mount
  useEffect(() => {
    const today = new Date().toDateString();
    const lastVisit = progressStats.lastVisitDate;
    
    if (lastVisit !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();
      
      let newStreak = progressStats.currentStreak;
      if (lastVisit === yesterdayStr) {
        newStreak += 1;
      } else if (lastVisit !== null) {
        newStreak = 1;
      } else {
        newStreak = 1;
      }
      
      const newStats = {
        ...progressStats,
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, progressStats.longestStreak),
        lastVisitDate: today,
      };
      
      setProgressStats(newStats);
      saveProgressStats(newStats);
    }
  }, []);

  // Load saved sessions on mount
  useEffect(() => {
    sessionStore.getAllSessions().then(setSavedSessions);
  }, []);

  const submitDocument = useCallback(async (input: File | File[] | string) => {
    setProcessing({ status: 'loading' });
    setRewrittenAtLevel(undefined);
    setBatchProgress([]);
    setGlossaryResult(null);

    // ── Multi-file batch path ──────────────────────────────────────────────
    if (Array.isArray(input)) {
      const files = capFileList(input);
      const fileNames = files.map((f) => f.name);

      // Initialise progress entries
      const initialProgress: BatchProgressItem[] = files.map((f) => ({
        fileName: f.name,
        status: 'pending',
      }));
      setBatchProgress(initialProgress);

      const results: ProcessorResult[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const fileError = validateFile(file);
          if (fileError) throw new Error(fileError.message);

          const ingestionResult = await extractTextFromFile(file);
          const result = await processDocument(ingestionResult.text, defaultConfig, adaptationProfile);
          results.push(result);

          setBatchProgress((prev) =>
            prev.map((p, idx) => idx === i ? { ...p, status: 'success' } : p),
          );
        } catch (err) {
          const message =
            err && typeof err === 'object' && 'message' in err
              ? String((err as { message: unknown }).message)
              : 'Processing failed';
          setBatchProgress((prev) =>
            prev.map((p, idx) => idx === i ? { ...p, status: 'error', error: message } : p),
          );
        }
      }

      if (results.length === 0) {
        setProcessing({ status: 'error', error: 'All files failed to process.' });
        return;
      }

      // Merge tasks and key points
      // Use only the file names corresponding to successful results
      const successNames: string[] = [];
      for (let i = 0; i < files.length; i++) {
        if (successNames.length < results.length) {
          successNames.push(fileNames[i]);
        }
      }

      const mergedTasks = mergeTasks(results, successNames);
      const mergedKeyPoints = mergeKeyPoints(results, successNames);

      // Call /synthesize for summary
      let summary = '';
      try {
        const resp = await fetch(`${API_BASE}/synthesize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ results, fileNames: successNames }),
        });
        if (resp.ok) {
          const data = await resp.json() as { summary: string };
          summary = data.summary;
        }
      } catch {
        // Non-fatal — proceed without summary
      }

      // Build unified result from first successful result as base
      const baseResult = results[0];
      const unifiedResult: ProcessorResult = {
        ...baseResult,
        tasks: mergedTasks,
        keyPoints: mergedKeyPoints,
        rewrittenText: summary || baseResult.rewrittenText,
        tldr: summary || baseResult.tldr,
      };

      setLastRawText(files.map((f) => f.name).join(', '));
      setTaskCompletions({});
      setComplexityLevelState(8);
      setReadingModeState((prev) => ({
        ...prev,
        focusState: { currentIndex: 0, total: mergedKeyPoints.length },
      }));
      setProcessing({ status: 'success', result: unifiedResult });
      showToast({ type: 'success', title: 'Batch processed!', message: `${results.length} of ${files.length} files processed.` });

      const newStats = {
        ...progressStats,
        documentsProcessed: progressStats.documentsProcessed + results.length,
        totalReadingTime: progressStats.totalReadingTime,
      };
      setProgressStats(newStats);
      saveProgressStats(newStats);
      return;
    }

    // ── Single file / paste path ───────────────────────────────────────────
    try {
      let text: string;

      if (input instanceof File) {
        const fileError = validateFile(input);
        if (fileError) { setProcessing({ status: 'error', error: fileError }); return; }
        const ingestionResult = await extractTextFromFile(input);
        text = ingestionResult.text;
      } else {
        const pasteError = validatePaste(input);
        if (pasteError) { setProcessing({ status: 'error', error: pasteError }); return; }
        text = input;
      }

      const result = await processDocument(text, defaultConfig, adaptationProfile);

      setLastRawText(text);
      setTaskCompletions({});
      setComplexityLevelState(8);
      setReadingModeState((prev) => ({
        ...prev,
        focusState: { currentIndex: 0, total: result.keyPoints.length },
      }));
      setProcessing({ status: 'success', result });
      showToast({ type: 'success', title: 'Document processed!', message: 'Your content has been simplified.' });
      
      // Fetch glossary terms (non-blocking)
      try {
        const glossaryResp = await fetch(`${API_BASE}/glossary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: result.rewrittenText, profile: adaptationProfile }),
        });
        if (glossaryResp.ok) {
          const glossaryData = await glossaryResp.json() as GlossaryResult;
          setGlossaryResult(glossaryData);
        } else {
          setGlossaryResult(null);
          showToast({ type: 'error', title: 'Glossary mode temporarily unavailable', message: '' });
        }
      } catch {
        setGlossaryResult(null);
        showToast({ type: 'error', title: 'Glossary mode temporarily unavailable', message: '' });
      }

      // Update progress stats — time is tracked separately via the interval/unload listeners
      const newStats = {
        ...progressStats,
        documentsProcessed: progressStats.documentsProcessed + 1,
      };
      setProgressStats(newStats);
      saveProgressStats(newStats);
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'An unexpected error occurred.';
      setProcessing({ status: 'error', error: message });
      showToast({ type: 'error', title: 'Processing failed', message });
    }
  }, [adaptationProfile, progressStats, showToast]);

  const toggleTask = useCallback((taskId: string) => {
    setTaskCompletions((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  }, []);

  const updateTaskDeadline = useCallback((taskId: string, deadline: string | undefined) => {
    setProcessing((prev) => {
      if (prev.status !== 'success' || !prev.result) return prev;
      return {
        ...prev,
        result: {
          ...prev.result,
          tasks: applyDeadlineUpdate(prev.result.tasks, taskId, deadline),
        },
      };
    });
  }, []);

  const setReadingMode = useCallback((mode: ReadingMode) => {
    setReadingModeState((prev) => ({ ...prev, mode }));
  }, []);

  const navigateNext = useCallback(() => {
    setReadingModeState((prev) => {
      if (!prev.focusState) return prev;
      const { currentIndex, total } = prev.focusState;
      return { ...prev, focusState: { currentIndex: Math.min(currentIndex + 1, total - 1), total } };
    });
  }, []);

  const navigatePrev = useCallback(() => {
    setReadingModeState((prev) => {
      if (!prev.focusState) return prev;
      const { currentIndex, total } = prev.focusState;
      return { ...prev, focusState: { currentIndex: Math.max(currentIndex - 1, 0), total } };
    });
  }, []);

  const setAdaptationProfile = useCallback((profile: AdaptationProfile) => {
    setAdaptationProfileState(profile);
  }, []);

  const reprocessWithProfile = useCallback(async (profile: AdaptationProfile) => {
    if (!lastRawText) return;
    setAdaptationProfileState(profile);
    setProcessing({ status: 'loading' });
    setRewrittenAtLevel(undefined);
    try {
      const result = await processDocument(lastRawText, defaultConfig, profile);
      setTaskCompletions({});
      setComplexityLevelState(8);
      setReadingModeState((prev) => ({
        ...prev,
        focusState: { currentIndex: 0, total: result.keyPoints.length },
      }));
      setProcessing({ status: 'success', result });
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'An unexpected error occurred.';
      setProcessing({ status: 'error', error: message });
    }
  }, [lastRawText]);

  const setComplexityLevel = useCallback(async (level: ComplexityLevel) => {
    setComplexityLevelState(level);
    if (processing.status !== 'success' || !processing.result) return;

    const originalText = processing.result.rewrittenText;
    setIsRewriting(true);
    try {
      const rewritten = await rewriteAtLevel(originalText, level, adaptationProfile);
      setRewrittenAtLevel(rewritten);
    } catch {
      // silently fall back to original
    } finally {
      setIsRewriting(false);
    }
  }, [processing, adaptationProfile]);

  const saveCurrentSession = useCallback(async (collectionId?: string | null) => {
    if (processing.status !== 'success' || !processing.result) return;
    const session: Session = {
      id: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
      fileName: processing.document?.fileName ?? lastRawText?.slice(0, 40),
      rawText: lastRawText ?? '',
      result: processing.result,
      adaptationProfile,
      complexityLevel,
      taskCompletions,
      annotations: [],
      collectionId: collectionId ?? null,
    };
    await sessionStore.saveSession(session);
    const updated = await sessionStore.getAllSessions();
    setSavedSessions(updated);
    showToast({ type: 'success', title: 'Session saved!' });
  }, [processing, lastRawText, adaptationProfile, complexityLevel, taskCompletions, sessionStore, showToast]);

  const restoreSession = useCallback((session: Session) => {
    setProcessing({ status: 'success', result: session.result });
    setTaskCompletions(session.taskCompletions);
    setAdaptationProfileState(session.adaptationProfile);
    setComplexityLevelState(session.complexityLevel);
    setLastRawText(session.rawText);
    setRewrittenAtLevel(undefined);
  }, []);

  const deleteSession = useCallback(async (id: string) => {
    await sessionStore.deleteSession(id);
    const updated = await sessionStore.getAllSessions();
    setSavedSessions(updated);
  }, [sessionStore]);

  return (
    <AppContext.Provider
      value={{
        processing,
        readingMode,
        taskCompletions,
        adaptationProfile,
        complexityLevel,
        rewrittenAtLevel,
        isRewriting,
        hasDocument: !!lastRawText,
        submitDocument,
        toggleTask,
        updateTaskDeadline,
        setReadingMode,
        navigateNext,
        navigatePrev,
        setAdaptationProfile,
        reprocessWithProfile,
        setComplexityLevel,
        progressStats,
        showToast,
        batchProgress,
        glossaryResult,
        saveCurrentSession,
        restoreSession,
        deleteSession,
        savedSessions,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

export { AppContext };
