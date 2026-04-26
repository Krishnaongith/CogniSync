import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { useAppContext } from '../context/AppContext';
import type { AdaptationProfile } from '../types';
import { ADAPTATION_PROFILES } from '../types';

// ── Icons ────────────────────────────────────────────────────────────────────

function DocumentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

// ── Tab definitions ───────────────────────────────────────────────────────────

const TABS = [
  { id: 'simplify',    label: 'Simplify',    path: '/app',              end: true,  Icon: DocumentIcon },
  { id: 'history',     label: 'History',     path: '/app/history',     end: false, Icon: ClockIcon    },
  { id: 'collections', label: 'Collections', path: '/app/collections', end: false, Icon: FolderIcon   },
  { id: 'digest',      label: 'Digest',      path: '/app/digest',      end: false, Icon: CalendarIcon },
  { id: 'progress',    label: 'Progress',    path: '/app/progress',    end: false, Icon: ChartIcon    },
] as const;

// ── Profile selector ──────────────────────────────────────────────────────────

function ProfileSelect({ selected, onChange }: { selected: AdaptationProfile; onChange: (p: AdaptationProfile) => void }) {
  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value as AdaptationProfile)}
      aria-label="Adaptation profile"
      style={{
        background: 'rgba(99,102,241,0.1)',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 8,
        color: '#818cf8',
        fontSize: 12,
        fontWeight: 600,
        fontFamily: 'inherit',
        padding: '6px 28px 6px 10px',
        cursor: 'pointer',
        appearance: 'none',
        WebkitAppearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23818cf8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 8px center',
        minWidth: 100,
      }}
    >
      {ADAPTATION_PROFILES.map((p) => (
        <option key={p.id} value={p.id}>{p.label}</option>
      ))}
    </select>
  );
}

// ── AppHeader ─────────────────────────────────────────────────────────────────

export function AppHeader() {
  const { theme, toggleTheme } = useTheme();
  const { adaptationProfile, setAdaptationProfile } = useAppContext();
  const [announcement, setAnnouncement] = React.useState('');

  const handleThemeToggle = () => {
    toggleTheme();
    setAnnouncement(theme === 'dark' ? 'Switched to light mode' : 'Switched to dark mode');
    setTimeout(() => setAnnouncement(''), 1000);
  };

  return (
    <>
      <style>{`
        .app-header {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 200;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 clamp(12px, 3vw, 32px);
          background: rgba(13, 20, 36, 0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(99, 102, 241, 0.1);
          gap: 12px;
        }

        [data-theme="light"] .app-header {
          background: rgba(255, 255, 255, 0.9);
          border-bottom: 1px solid rgba(99, 102, 241, 0.12);
        }

        .app-header-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          flex-shrink: 0;
        }

        .app-header-logo {
          width: 30px; height: 30px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 14px rgba(99, 102, 241, 0.4);
        }

        .app-header-wordmark {
          font-size: 1rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #f0f4ff 0%, #a5b4fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        [data-theme="light"] .app-header-wordmark {
          background: linear-gradient(135deg, #1e1b4b 0%, #4f46e5 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .app-header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .app-header-theme-toggle {
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 50%;
          width: 34px; height: 34px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #818cf8;
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
        }

        .app-header-theme-toggle:hover {
          background: rgba(99, 102, 241, 0.2);
          transform: scale(1.08);
          box-shadow: 0 0 12px rgba(99, 102, 241, 0.3);
        }

        .app-header-theme-toggle:focus-visible {
          outline: 2px solid rgba(99, 102, 241, 0.6);
          outline-offset: 2px;
        }

        @media (max-width: 480px) {
          .app-header-wordmark { display: none; }
          .app-header-profile-select { display: none; }
        }
      `}</style>

      <header className="app-header" role="banner">
        {/* Logo — left */}
        <Link to="/" className="app-header-brand" aria-label="CogniSync home">
          <div className="app-header-logo" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
            </svg>
          </div>
          <span className="app-header-wordmark">CogniSync</span>
        </Link>

        {/* Tab navigation — center */}
        <nav className="app-tabs" aria-label="App navigation">
          {TABS.map(({ id, label, path, end, Icon }) => (
            <NavLink
              key={id}
              to={path}
              end={end}
              className={({ isActive }) => isActive ? 'app-tab' : 'app-tab'}
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Actions — right */}
        <div className="app-header-actions">
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}
          >
            {announcement}
          </div>

          <div className="app-header-profile-select">
            <ProfileSelect selected={adaptationProfile} onChange={setAdaptationProfile} />
          </div>

          <button
            className="app-header-theme-toggle"
            onClick={handleThemeToggle}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>
      </header>
    </>
  );
}
