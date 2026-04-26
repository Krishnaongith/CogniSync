import React from 'react';

interface WelcomeStateProps {
  onUploadClick?: () => void;
}

export function WelcomeState({ onUploadClick }: WelcomeStateProps) {
  return (
    <>
      <style>{`
        .ws-root {
          text-align: center;
          padding: 48px 24px 32px;
          position: relative;
          overflow: hidden;
          animation: fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both;
        }
        .ws-dot-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(99,102,241,0.12) 1px, transparent 1px);
          background-size: 24px 24px;
          pointer-events: none;
          z-index: 0;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
        }
        .ws-content { position: relative; z-index: 1; }
        .ws-illustration {
          width: 96px; height: 96px;
          margin: 0 auto 28px;
          position: relative;
        }
        .ws-illustration-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(99,102,241,0.15);
        }
        .ws-illustration-core {
          position: absolute;
          inset: 20px;
          background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.15));
          border-radius: 50%;
          border: 1px solid rgba(99,102,241,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #818cf8;
        }
        @media (prefers-reduced-motion: no-preference) {
          .ws-illustration {
            animation: float 4s ease-in-out infinite;
          }
          .ws-illustration-ring:nth-child(1) {
            animation: glowPulse 3s ease-in-out infinite;
          }
        }
        .ws-title {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--text-primary);
          margin: 0 0 12px;
        }
        .ws-sub {
          font-size: 1rem;
          color: var(--text-secondary);
          line-height: 1.65;
          max-width: 420px;
          margin: 0 auto 28px;
        }
        .ws-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          background: linear-gradient(135deg, #6366f1, #7c3aed);
          color: #fff;
          border: none;
          border-radius: 999px;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          box-shadow: 0 4px 20px rgba(99,102,241,0.4);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .ws-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(99,102,241,0.5);
        }
        .ws-features {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-top: 32px;
          flex-wrap: wrap;
        }
        .ws-feature {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-tertiary);
          font-weight: 500;
        }
        .ws-feature-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
      `}</style>

      <div className="ws-root">
        <div className="ws-dot-grid" aria-hidden="true" />
        <div className="ws-content">
          <div className="ws-illustration" aria-hidden="true">
            <div className="ws-illustration-ring" style={{ inset: 0 }} />
            <div className="ws-illustration-ring" style={{ inset: 8 }} />
            <div className="ws-illustration-core">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
              </svg>
            </div>
          </div>

          <h2 className="ws-title">Ready to simplify your learning?</h2>
          <p className="ws-sub">
            Upload a PDF, DOCX, or paste text to transform dense academic content into clear, structured insights — adapted to your learning style.
          </p>

          {onUploadClick && (
            <button className="ws-cta" onClick={onUploadClick}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Upload a Document
            </button>
          )}

          <div className="ws-features" aria-label="Key features">
            {[
              { color: '#818cf8', label: 'AI-powered simplification' },
              { color: '#34d399', label: '100% private & local' },
              { color: '#c084fc', label: '4 learning profiles' },
              { color: '#60a5fa', label: '16 complexity levels' },
            ].map(f => (
              <div key={f.label} className="ws-feature">
                <div className="ws-feature-dot" style={{ background: f.color }} aria-hidden="true" />
                {f.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
