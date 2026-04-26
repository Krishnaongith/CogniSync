import { useState } from 'react';

interface FloatingActionsProps {
  onNewDocument: () => void;
  onExport?: () => void;
  onShare?: () => void;
  hasResult?: boolean;
  exportData?: {
    title?: string;
    simplifiedContent?: string;
    keyPoints?: string[];
  };
}

export function FloatingActions({ onNewDocument, onExport, onShare, hasResult = true, exportData }: FloatingActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  function handleExport() {
    if (!hasResult) return;
    window.print();
    onExport?.();
    setIsOpen(false);
  }

  async function handleShare() {
    const text = exportData?.simplifiedContent
      ? `${exportData.title || 'CogniSync Summary'}\n\n${exportData.simplifiedContent.slice(0, 300)}...`
      : 'Check out this document summary from CogniSync!';
    if (navigator.share) {
      try { await navigator.share({ title: exportData?.title || 'CogniSync Summary', text, url: window.location.href }); }
      catch { /* cancelled */ }
    } else {
      try { await navigator.clipboard.writeText(text); } catch { /* silent */ }
    }
    onShare?.();
    setIsOpen(false);
  }

  return (
    <>
      <style>{`
        @keyframes fabIn {
          from { transform: scale(0) rotate(-180deg); opacity: 0; }
          to   { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes actionIn {
          from { transform: translateX(20px) scale(0.8); opacity: 0; }
          to   { transform: translateX(0) scale(1); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .fab-main, .fab-action { animation: none !important; }
        }

        .fab-main {
          position: fixed;
          bottom: calc(32px + env(safe-area-inset-bottom, 0px));
          right: 32px;
          width: 56px; height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #7c3aed);
          border: none;
          box-shadow: 0 8px 24px rgba(99,102,241,0.5), 0 0 0 1px rgba(99,102,241,0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
          transition: transform 0.25s cubic-bezier(0.4,0,0.2,1), box-shadow 0.25s;
          z-index: 1000;
          animation: fabIn 0.5s cubic-bezier(0.16,1,0.3,1);
          touch-action: manipulation;
          will-change: transform;
        }
        .fab-main:hover {
          transform: scale(1.1);
          box-shadow: 0 12px 32px rgba(99,102,241,0.6), 0 0 0 1px rgba(99,102,241,0.4);
        }
        .fab-main.open {
          transform: rotate(45deg);
          background: linear-gradient(135deg, #ef4444, #dc2626);
          box-shadow: 0 8px 24px rgba(239,68,68,0.4);
        }
        .fab-main.open:hover {
          transform: rotate(45deg) scale(1.1);
        }

        .fab-actions {
          position: fixed;
          bottom: calc(32px + env(safe-area-inset-bottom, 0px) + 68px);
          right: 32px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          z-index: 999;
          align-items: flex-end;
        }

        .fab-action {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(17,24,39,0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 999px;
          padding: 10px 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.08);
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          touch-action: manipulation;
          min-height: 44px;
          font-family: inherit;
          color: var(--text-primary);
        }
        .fab-action:hover {
          transform: translateX(-4px);
          border-color: rgba(99,102,241,0.4);
          box-shadow: 0 8px 28px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.2);
        }

        .fab-action-icon {
          width: 32px; height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 1rem;
        }

        .fab-action-label {
          font-size: 13px;
          font-weight: 600;
          padding-right: 4px;
        }

        @media (max-width: 480px) {
          .fab-action-label { display: none; }
          .fab-action { padding: 10px; }
          .fab-main { width: 50px; height: 50px; right: 20px; bottom: calc(20px + env(safe-area-inset-bottom, 0px)); }
          .fab-actions { right: 20px; bottom: calc(20px + env(safe-area-inset-bottom, 0px) + 62px); }
        }
      `}</style>

      {isOpen && (
        <div className="fab-actions">
          <button className="fab-action" onClick={() => { onNewDocument(); setIsOpen(false); }} style={{ animation: 'actionIn 0.3s cubic-bezier(0.16,1,0.3,1) 0.05s both' }} aria-label="Upload new document">
            <div className="fab-action-icon" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(37,99,235,0.15))', color: '#60a5fa' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <span className="fab-action-label">New Document</span>
          </button>

          {onExport && (
            <button
              className="fab-action"
              onClick={handleExport}
              style={{
                animation: 'actionIn 0.3s cubic-bezier(0.16,1,0.3,1) 0.1s both',
                opacity: hasResult ? 1 : 0.4,
                cursor: hasResult ? 'pointer' : 'default',
              }}
              aria-label="Export as PDF"
              aria-disabled={!hasResult}
            >
              <div className="fab-action-icon" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.15))', color: '#34d399' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </div>
              <span className="fab-action-label">Export as PDF</span>
            </button>
          )}

          {onShare && (
            <button className="fab-action" onClick={handleShare} style={{ animation: 'actionIn 0.3s cubic-bezier(0.16,1,0.3,1) 0.15s both' }} aria-label="Share summary">
              <div className="fab-action-icon" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(124,58,237,0.15))', color: '#c084fc' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              </div>
              <span className="fab-action-label">Share</span>
            </button>
          )}
        </div>
      )}

      <button
        className={`fab-main${isOpen ? ' open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close actions menu' : 'Open actions menu'}
        aria-expanded={isOpen}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </>
  );
}
