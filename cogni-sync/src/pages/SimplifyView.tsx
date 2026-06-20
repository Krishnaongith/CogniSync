import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { DocumentIngestion } from '../components/DocumentIngestion';
import { KeyPointsList } from '../components/KeyPointsList';
import { PriorityMatrix } from '../components/PriorityMatrix';
import { RewrittenContent } from '../components/RewrittenContent';
import { ComplexityScoreDisplay } from '../components/ComplexityScoreDisplay';
import { ReadingModeToggle } from '../components/ReadingModeToggle';
import { FocusView } from '../components/FocusView';
import { StepByStepView } from '../components/StepByStepView';
import { ComplexityDial } from '../components/ComplexityDial';
import { AdaptationProfileSelector } from '../components/AdaptationProfileSelector';
import { Card } from '../components/Card';
import { SkeletonCard } from '../components/SkeletonCard';
import { TldrBanner } from '../components/TldrBanner';
import { ProgressTracker } from '../components/ProgressTracker';
import { QuickStats } from '../components/QuickStats';
import { FloatingActions } from '../components/FloatingActions';
import { WelcomeState } from '../components/WelcomeState';
import { HeatmapView } from '../components/HeatmapView';
import { ReadAloudControls } from '../components/ReadAloudControls';
import { GlossaryPanel } from '../components/GlossaryPanel';
import { TaskList } from '../components/TaskList';
import { CollectionPicker } from '../components/CollectionPicker';
import { useCollectionStore } from '../hooks/useCollectionStore';
import { generateICS, downloadICS } from '../calendar/calendarExporter';
import { generatePDF, encode, decode } from '../share/shareService';
import type { AdaptationProfile, ComplexityLevel, Collection } from '../types';
import { ADAPTATION_PROFILES } from '../types';

function getProfileStyles(profile: AdaptationProfile): React.CSSProperties {
  const cfg = ADAPTATION_PROFILES.find(p => p.id === profile)!;
  return {
    lineHeight: cfg.extraWhitespace ? 2 : 1.6,
    fontSize: profile === 'dyslexia' ? 17 : 15,
    letterSpacing: profile === 'dyslexia' ? '0.04em' : 'normal',
    wordSpacing: profile === 'dyslexia' ? '0.1em' : 'normal',
  };
}

/* ── SVG Icons for cards ── */
const KeyPointsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const MatrixIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const ContentIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);
const ScoreIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);
const ReadingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);
const HeatmapIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="4" height="4" rx="1"/><rect x="10" y="3" width="4" height="4" rx="1"/>
    <rect x="17" y="3" width="4" height="4" rx="1"/><rect x="3" y="10" width="4" height="4" rx="1"/>
    <rect x="10" y="10" width="4" height="4" rx="1"/><rect x="17" y="10" width="4" height="4" rx="1"/>
    <rect x="3" y="17" width="4" height="4" rx="1"/><rect x="10" y="17" width="4" height="4" rx="1"/>
    <rect x="17" y="17" width="4" height="4" rx="1"/>
  </svg>
);

export function SimplifyView() {
  const {
    processing, readingMode, taskCompletions, adaptationProfile,
    complexityLevel, rewrittenAtLevel, isRewriting, hasDocument,
    submitDocument, toggleTask, updateTaskDeadline, setReadingMode, navigateNext, navigatePrev,
    setAdaptationProfile, reprocessWithProfile, setComplexityLevel, progressStats,
    showToast, glossaryResult, saveCurrentSession, restoreSession, deleteSession, savedSessions,
  } = useAppContext();

  const [sharedPayload, setSharedPayload] = React.useState<import('../share/shareService').SharePayload | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const collectionStore = useCollectionStore(showToast);

  // Load collections
  useEffect(() => {
    collectionStore.getAllCollections().then(setCollections);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const text = params.get('text');
    if (text && text.trim().length > 0) {
      submitDocument(decodeURIComponent(text));
    }
    const shareParam = params.get('share');
    if (shareParam) {
      const fullUrl = window.location.href;
      const decoded = decode(fullUrl);
      if (decoded) {
        setSharedPayload(decoded);
      }
    }
  }, []);

  const isLoading = processing.status === 'loading';
  const isSuccess = processing.status === 'success';
  const result = processing.result;
  const profileStyles = React.useMemo(() => getProfileStyles(adaptationProfile), [adaptationProfile]);
  const displayedText = rewrittenAtLevel ?? result?.rewrittenText ?? '';
  const completedTasksCount = Object.values(taskCompletions).filter(Boolean).length;
  const totalTasks = result?.tasks.length ?? 0;

  const scrollToUpload = () => {
    document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <>
      <style>{`
        .app-layout {
          position: relative;
          z-index: 1;
          max-width: 960px;
          margin: 0 auto;
          padding: 0 clamp(16px, 4vw, 32px) 80px;
        }

        .upload-section {
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--border-default);
          border-radius: 24px;
          padding: 40px;
          margin-bottom: 24px;
          box-shadow: var(--glass-shadow);
          position: relative;
          overflow: hidden;
        }

        .upload-section::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent);
        }

        .upload-section-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 6px;
          letter-spacing: -0.02em;
        }

        .upload-section-sub {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0 0 28px;
        }

        .profile-section {
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--border-subtle);
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .profile-section-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin: 0 0 16px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .results-area {
          animation: fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes loadDot {
          0%, 80%, 100% { transform: scale(0.5); opacity: 0.3; }
          40%            { transform: scale(1);   opacity: 1; }
        }

        .load-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #6366f1;
          animation: loadDot 1.2s ease-in-out infinite;
        }

        @media (max-width: 640px) {
          .upload-section { padding: 24px 20px; }
        }
      `}</style>

      <main id="main-content" className="app-layout" style={profileStyles}>

        <ProgressTracker
          documentsProcessed={progressStats.documentsProcessed}
          totalReadingTime={progressStats.totalReadingTime}
          currentStreak={progressStats.currentStreak}
          longestStreak={progressStats.longestStreak}
        />

        <div className="profile-section">
          <p className="profile-section-title">Learning Profile</p>
          <AdaptationProfileSelector
            selected={adaptationProfile}
            hasDocument={hasDocument}
            isLoading={isLoading}
            onChange={(p) => setAdaptationProfile(p as AdaptationProfile)}
            onReprocess={(p) => reprocessWithProfile(p as AdaptationProfile)}
          />
        </div>

        <div className="upload-section" id="upload-section">
          <h2 className="upload-section-title">Analyze a Document</h2>
          <p className="upload-section-sub">Upload a file or paste text to get started</p>
          <DocumentIngestion
            onSubmit={submitDocument}
            isLoading={isLoading}
            error={processing.error}
          />
        </div>

        {processing.status === 'idle' && (
          <WelcomeState onUploadClick={scrollToUpload} />
        )}

        {isLoading && (
          <div style={{ marginTop: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24, color: '#818cf8', fontSize: 13, fontWeight: 500 }}>
              {[0, 1, 2].map(i => (
                <div key={i} className="load-dot" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
              <span style={{ marginLeft: 4 }}>Analyzing your document…</span>
            </div>
            <SkeletonCard animationDelay={0} />
            <SkeletonCard animationDelay={80} />
            <SkeletonCard animationDelay={160} />
            <SkeletonCard animationDelay={240} />
          </div>
        )}

        {sharedPayload && (
          <div style={{ marginTop: 24 }}>
            <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#818cf8' }}>
              Viewing shared content (read-only)
            </div>
            {sharedPayload.tldr && <TldrBanner text={sharedPayload.tldr} />}
            <Card accentColor="#818cf8" icon={<KeyPointsIcon />} title="Key Points" animationDelay={0} collapsible>
              <KeyPointsList keyPoints={sharedPayload.keyPoints} />
            </Card>
            <Card accentColor="#a78bfa" icon={<ContentIcon />} title="Simplified Content" animationDelay={60} collapsible>
              <RewrittenContent rewrittenText={sharedPayload.rewrittenText} />
            </Card>
          </div>
        )}

        {isSuccess && result && (
          <div className="results-area">
            {result.tldr && <TldrBanner text={result.tldr} />}

            <QuickStats
              keyPointsCount={result.keyPoints.length}
              tasksCount={totalTasks}
              completedTasks={completedTasksCount}
              readingTimeEstimate={Math.ceil(displayedText.split(/\s+/).length / 200)}
            />

            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => saveCurrentSession(selectedCollectionId)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 8,
                  background: 'rgba(99,102,241,0.15)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  color: '#818cf8',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Save Session
              </button>
              <CollectionPicker
                collections={collections}
                selectedId={selectedCollectionId}
                onSelect={setSelectedCollectionId}
                onCreate={async (name) => {
                  const c = await collectionStore.createCollection(name);
                  setCollections(await collectionStore.getAllCollections());
                  return c;
                }}
              />
            </div>

            <Card accentColor="#818cf8" icon={<KeyPointsIcon />} title="Key Points" animationDelay={0} collapsible>
              <KeyPointsList keyPoints={result.keyPoints} />
            </Card>

            <Card accentColor="#f87171" icon={<MatrixIcon />} title="Priority Matrix" animationDelay={60} collapsible>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 16, marginTop: 0 }}>
                Tasks auto-categorized by urgency and importance.
              </p>
              <PriorityMatrix tasks={result.tasks} taskCompletions={taskCompletions} onToggle={toggleTask} onUpdateDeadline={updateTaskDeadline} />
              {result.tasks.some(t => t.deadline) && (
                <button
                  onClick={() => {
                    const { icsBlob, skipped } = generateICS(result.tasks);
                    downloadICS(icsBlob);
                    if (skipped.length > 0) {
                      showToast({ type: 'error', title: `${skipped.length} tasks skipped`, message: 'Could not parse their deadlines.' });
                    }
                  }}
                  style={{
                    marginTop: 12,
                    padding: '7px 16px',
                    borderRadius: 8,
                    background: 'rgba(248,113,113,0.12)',
                    border: '1px solid rgba(248,113,113,0.3)',
                    color: '#f87171',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Export to Calendar
                </button>
              )}
            </Card>

            <Card accentColor="#a78bfa" icon={<ContentIcon />} title="Simplified Content" animationDelay={120} collapsible>
              <div style={{ background: 'rgba(99,102,241,0.05)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, border: '1px solid rgba(99,102,241,0.1)' }}>
                <ComplexityDial level={complexityLevel} isRewriting={isRewriting} onChange={(l) => setComplexityLevel(l as ComplexityLevel)} />
                <ReadAloudControls profile={adaptationProfile} text={displayedText} />
              </div>
              <RewrittenContent rewrittenText={displayedText} glossaryTerms={glossaryResult?.terms} />
            </Card>

            {glossaryResult && glossaryResult.terms.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <GlossaryPanel terms={glossaryResult.terms} />
              </div>
            )}

            <Card accentColor="#34d399" icon={<ScoreIcon />} title="Complexity Score" animationDelay={180} collapsible>
              <ComplexityScoreDisplay originalScore={result.originalScore} simplifiedScore={result.simplifiedScore} />
            </Card>

            <Card accentColor="#f59e0b" icon={<HeatmapIcon />} title="Complexity Heatmap" animationDelay={220} collapsible>
              <HeatmapView text={result.rewrittenText} profile={adaptationProfile} />
            </Card>

            <Card accentColor="#60a5fa" icon={<ReadingIcon />} title="Reading Mode" animationDelay={260} collapsible>
              <ReadingModeToggle mode={readingMode.mode} onSwitch={() => setReadingMode(readingMode.mode === 'focus' ? 'step-by-step' : 'focus')} />
              <div style={{ marginTop: 16 }}>
                {readingMode.mode === 'focus' ? (
                  <FocusView keyPoints={result.keyPoints} currentIndex={readingMode.focusState?.currentIndex ?? 0} onNext={navigateNext} onPrev={navigatePrev} />
                ) : (
                  <StepByStepView keyPoints={result.keyPoints} />
                )}
              </div>
            </Card>
          </div>
        )}

        {isSuccess && result && (
          <FloatingActions
            onNewDocument={scrollToUpload}
            onExport={() => generatePDF(result)}
            onShare={async () => {
              const { url, truncated } = encode({ keyPoints: result.keyPoints, tasks: result.tasks, rewrittenText: displayedText, tldr: result.tldr });
              await navigator.clipboard.writeText(url).catch(() => {});
              if (truncated) {
                showToast({ type: 'error', title: 'Link truncated', message: 'Content was shortened to fit URL limit.' });
              } else {
                showToast({ type: 'success', title: 'Link copied!' });
              }
            }}
            hasResult={isSuccess && !!result}
            exportData={{
              title: result.tldr,
              simplifiedContent: displayedText,
              keyPoints: result.keyPoints.map(kp => kp.text),
            }}
          />
        )}

        <div aria-live="polite" aria-atomic="true" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', clipPath: 'inset(50%)', whiteSpace: 'nowrap' }}>
          {isLoading ? 'Processing your document…' : isRewriting ? 'Rewriting content…' : isSuccess ? 'Document processed successfully.' : processing.status === 'error' ? 'An error occurred.' : ''}
        </div>
      </main>
    </>
  );
}
