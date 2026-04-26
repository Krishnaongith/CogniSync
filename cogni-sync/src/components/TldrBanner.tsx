interface TldrBannerProps {
  text: string;
}

export function TldrBanner({ text }: TldrBannerProps) {
  return (
    <>
      <style>{`
        @keyframes tldrIn {
          from { opacity: 0; transform: translateY(-12px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .tldr-root {
          position: relative;
          overflow: hidden;
          border-radius: 16px;
          padding: 20px 24px;
          margin-bottom: 20px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
          animation: tldrIn 0.5s cubic-bezier(0.16,1,0.3,1) both;
          background: linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.06) 100%);
          border: 1px solid rgba(99,102,241,0.2);
        }
        .tldr-root::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,0.6), rgba(168,85,247,0.4), transparent);
        }
        .tldr-icon {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.15));
          border: 1px solid rgba(99,102,241,0.25);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #818cf8;
        }
        .tldr-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #818cf8;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tldr-label-dot {
          width: 3px; height: 3px;
          border-radius: 50%;
          background: #818cf8;
        }
        .tldr-text {
          margin: 0;
          font-size: 1rem;
          line-height: 1.65;
          color: var(--text-primary);
          font-weight: 500;
        }
      `}</style>
      <div className="tldr-root">
        <div className="tldr-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div className="tldr-label">
            <span>TL;DR</span>
            <span className="tldr-label-dot" />
            <span style={{ fontWeight: 600, textTransform: 'none', letterSpacing: 'normal', color: 'var(--text-secondary)' }}>The Short Version</span>
          </div>
          <p className="tldr-text">{text}</p>
        </div>
      </div>
    </>
  );
}
