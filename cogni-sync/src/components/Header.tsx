import React from 'react';
import { useTheme } from '../hooks/useTheme';

interface HeaderProps {
  onHistoryClick?: () => void;
  onDigestClick?: () => void;
}

export function Header({ onHistoryClick, onDigestClick }: HeaderProps = {}) {
  const { theme, toggleTheme } = useTheme();
  const [announcement, setAnnouncement] = React.useState('');

  return (
    <>
      <style>{`
        .skip-link {
          position: absolute; width: 1px; height: 1px;
          padding: 0; margin: -1px; overflow: hidden;
          clip: rect(0,0,0,0); white-space: nowrap; border: 0;
        }
        .skip-link:focus-visible {
          position: static; width: auto; height: auto;
          padding: 8px 16px; margin: 0; overflow: visible; clip: auto;
          white-space: normal; background: var(--color-primary); color: #fff;
          font-weight: 600; border-radius: 6px; z-index: 9999;
        }

        /* ── Navbar ── */
        .navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 200;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 clamp(16px, 4vw, 40px);
          background: rgba(13, 20, 36, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(99, 102, 241, 0.1);
        }

        [data-theme="light"] .navbar {
          background: rgba(255, 255, 255, 0.85);
          border-bottom: 1px solid rgba(99, 102, 241, 0.12);
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .navbar-logo {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 0 16px rgba(99, 102, 241, 0.4);
        }

        .navbar-wordmark {
          font-size: 1.125rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #f0f4ff 0%, #a5b4fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        [data-theme="light"] .navbar-wordmark {
          background: linear-gradient(135deg, #1e1b4b 0%, #4f46e5 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .navbar-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.25);
          border-radius: 999px;
          padding: 3px 10px;
          font-size: 11px;
          font-weight: 600;
          color: #818cf8;
          letter-spacing: 0.03em;
        }

        @media (max-width: 480px) {
          .navbar-badge { display: none; }
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .theme-toggle {
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 50%;
          width: 36px; height: 36px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #818cf8;
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
        }
        .theme-toggle:hover {
          background: rgba(99, 102, 241, 0.2);
          transform: scale(1.08);
          box-shadow: 0 0 12px rgba(99, 102, 241, 0.3);
        }
        .theme-toggle:focus-visible {
          outline: 2px solid rgba(99, 102, 241, 0.6);
          outline-offset: 2px;
        }

        .nav-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(99, 102, 241, 0.08);
          border: 1px solid rgba(99, 102, 241, 0.18);
          border-radius: 8px;
          padding: 6px 12px;
          cursor: pointer;
          color: #818cf8;
          font-size: 12px;
          font-weight: 600;
          font-family: inherit;
          transition: background 0.2s, box-shadow 0.2s;
        }
        .nav-btn:hover {
          background: rgba(99, 102, 241, 0.18);
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.2);
        }
        .nav-btn:focus-visible {
          outline: 2px solid rgba(99, 102, 241, 0.6);
          outline-offset: 2px;
        }
        @media (max-width: 480px) {
          .nav-btn span { display: none; }
          .nav-btn { padding: 6px 8px; }
        }
        /* ── Hero Section ── */
        .hero {
          position: relative;
          padding: 120px clamp(16px, 4vw, 40px) 64px;
          text-align: center;
          overflow: hidden;
          z-index: 1;
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.25);
          border-radius: 999px;
          padding: 5px 14px;
          font-size: 11.5px;
          font-weight: 600;
          color: #818cf8;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 24px;
          animation: fadeInUp 0.6s var(--ease-spring) both;
        }

        .hero-title {
          margin: 0 0 20px;
          font-size: clamp(2.5rem, 7vw, 4.5rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1.05;
          animation: fadeInUp 0.6s var(--ease-spring) 0.1s both;
        }

        .hero-title-gradient {
          background: linear-gradient(135deg, #f0f4ff 0%, #a5b4fc 40%, #c084fc 70%, #f472b6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        [data-theme="light"] .hero-title-gradient {
          background: linear-gradient(135deg, #1e1b4b 0%, #4f46e5 40%, #7c3aed 70%, #db2777 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          margin: 0 auto 48px;
          max-width: 560px;
          font-size: clamp(1rem, 2.5vw, 1.2rem);
          color: var(--text-secondary);
          line-height: 1.65;
          animation: fadeInUp 0.6s var(--ease-spring) 0.2s both;
        }

        .hero-stats {
          display: flex;
          justify-content: center;
          gap: 0;
          flex-wrap: wrap;
          animation: fadeInUp 0.6s var(--ease-spring) 0.3s both;
        }

        .hero-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px 28px;
          border-right: 1px solid rgba(99, 102, 241, 0.15);
        }
        .hero-stat:last-child { border-right: none; }

        .hero-stat-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1;
          font-variant-numeric: tabular-nums;
          background: linear-gradient(135deg, #f0f4ff, #a5b4fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-stat-label {
          font-size: 11px;
          color: var(--text-tertiary);
          margin-top: 4px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 500;
        }

        @media (max-width: 640px) {
          .hero-stats {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0;
          }
          .hero-stat {
            border-right: none;
            border-bottom: 1px solid rgba(99, 102, 241, 0.1);
          }
          .hero-stat:nth-child(odd) {
            border-right: 1px solid rgba(99, 102, 241, 0.1);
          }
          .hero-stat:nth-last-child(-n+2) {
            border-bottom: none;
          }
        }

        /* Decorative orbs behind hero */
        .hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: -1;
        }
      `}</style>

      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Slim fixed navbar */}
      <nav className="navbar" aria-label="Main navigation">
        <a href="/" className="navbar-brand" aria-label="CogniSync home">
          <div className="navbar-logo" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
            </svg>
          </div>
          <span className="navbar-wordmark">CogniSync</span>
        </a>

        <div className="navbar-badge" aria-label="AI-Powered Academic Assistant">
          <span aria-hidden="true">✦</span>
          AI Academic Assistant
        </div>

        <div className="navbar-actions">
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}
          >
            {announcement}
          </div>

          {onHistoryClick && (
            <button className="nav-btn" onClick={onHistoryClick} aria-label="View session history">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>History</span>
            </button>
          )}

          {onDigestClick && (
            <button className="nav-btn" onClick={onDigestClick} aria-label="View weekly digest">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>Digest</span>
            </button>
          )}

          <button
            className="theme-toggle"
            onClick={() => {
              toggleTheme();
              setAnnouncement(theme === 'dark' ? 'Switched to light mode' : 'Switched to dark mode');
              setTimeout(() => setAnnouncement(''), 1000);
            }}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Hero section */}
      <header className="hero">
        {/* Decorative orbs */}
        <div className="hero-orb" style={{ width: 400, height: 400, background: 'rgba(99,102,241,0.12)', top: -100, left: '10%' }} aria-hidden="true" />
        <div className="hero-orb" style={{ width: 300, height: 300, background: 'rgba(168,85,247,0.1)', top: 0, right: '5%' }} aria-hidden="true" />

        <div className="hero-eyebrow" aria-label="AI-Powered Academic Assistant">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          AI-Powered Academic Assistant
        </div>

        <h1 className="hero-title">
          <span className="hero-title-gradient">Transform Dense Text</span>
          <br />
          <span style={{ color: 'var(--text-primary)' }}>Into Clear Insights</span>
        </h1>

        <p className="hero-subtitle">
          Upload any academic document and CogniSync instantly extracts key points, simplifies complexity, and adapts to your learning style, all processed privately in your browser.
        </p>

        <div className="hero-stats" role="list" aria-label="Key features">
          {[
            { value: '4', label: 'Learning Profiles' },
            { value: '16', label: 'Complexity Levels' },
            { value: '5', label: 'File Formats' },
            { value: '100%', label: 'Private & Local' },
          ].map(stat => (
            <div key={stat.label} className="hero-stat" role="listitem">
              <span className="hero-stat-value">{stat.value}</span>
              <span className="hero-stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </header>
    </>
  );
}
