import type { AdaptationProfile } from '../types';
import { ADAPTATION_PROFILES } from '../types';

interface AdaptationProfileSelectorProps {
  selected: AdaptationProfile;
  hasDocument: boolean;
  isLoading: boolean;
  onChange: (profile: AdaptationProfile) => void;
  onReprocess: (profile: AdaptationProfile) => void;
}

const TOOLTIPS: Record<AdaptationProfile, string> = {
  default:  'Standard academic simplification with balanced structure',
  adhd:     'Chunked content with bullet points and clear visual breaks',
  dyslexia: 'Increased spacing, simpler words, and dyslexia-friendly formatting',
  anxiety:  'Calm, reassuring tone with reduced information density',
};

const PROFILE_COLORS: Record<AdaptationProfile, { color: string; glow: string }> = {
  default:  { color: '#818cf8', glow: 'rgba(99,102,241,0.25)' },
  adhd:     { color: '#fbbf24', glow: 'rgba(251,191,36,0.25)' },
  dyslexia: { color: '#06b6d4', glow: 'rgba(6,182,212,0.25)' },
  anxiety:  { color: '#10b981', glow: 'rgba(16,185,129,0.25)' },
};

function BrainIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>;
}
function ZapIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
}
function BookIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
}
function LeafIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>;
}

const ICONS: Record<AdaptationProfile, () => JSX.Element> = {
  default: BrainIcon, adhd: ZapIcon, dyslexia: BookIcon, anxiety: LeafIcon,
};

function SpinnerSVG() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: 'spin 0.7s linear infinite', display: 'inline-block', verticalAlign: 'middle' }} aria-hidden="true">
      <circle cx="7" cy="7" r="5" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      <path d="M7 2 A5 5 0 0 1 12 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function AdaptationProfileSelector({ selected, hasDocument, isLoading, onChange, onReprocess }: AdaptationProfileSelectorProps) {
  return (
    <div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .ap-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          width: 100%;
        }
        @media (max-width: 600px) {
          .ap-grid { grid-template-columns: repeat(2, 1fr); }
        }

        .ap-btn {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 14px 8px;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
          touch-action: manipulation;
          min-height: 44px;
          font-family: inherit;
        }
        .ap-btn:hover:not([aria-pressed="true"]) {
          transform: translateY(-2px);
        }
        .ap-btn[aria-pressed="true"] {
          transform: translateY(-2px);
        }
        .ap-btn:focus-visible {
          outline: 2px solid rgba(99,102,241,0.6);
          outline-offset: 2px;
        }

        .ap-check {
          position: absolute;
          top: 6px; right: 6px;
          width: 18px; height: 18px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ap-reprocess {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 9px 18px;
          border-radius: 10px;
          border: none;
          background: rgba(99,102,241,0.12);
          border: 1px solid rgba(99,102,241,0.2);
          color: #818cf8;
          font-weight: 600;
          font-size: 13px;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 12px;
        }
        .ap-reprocess:hover:not(:disabled) {
          background: rgba(99,102,241,0.2);
          border-color: rgba(99,102,241,0.4);
          transform: translateY(-1px);
        }
        .ap-reprocess:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      <div role="group" aria-label="Reading profile" className="ap-grid">
        {ADAPTATION_PROFILES.map(profile => {
          const active = selected === profile.id;
          const Icon = ICONS[profile.id];
          const { color, glow } = PROFILE_COLORS[profile.id];

          return (
            <button
              key={profile.id}
              onClick={() => onChange(profile.id)}
              aria-pressed={active}
              aria-label={`${profile.label}: ${TOOLTIPS[profile.id]}`}
              title={TOOLTIPS[profile.id]}
              className="ap-btn"
              style={{
                border: active ? `1.5px solid ${color}` : '1.5px solid rgba(99,102,241,0.12)',
                background: active
                  ? `linear-gradient(135deg, ${color}20, ${color}10)`
                  : 'rgba(99,102,241,0.04)',
                boxShadow: active ? `0 0 20px ${glow}, inset 0 1px 0 ${color}20` : 'none',
                color: active ? color : 'var(--text-secondary)',
              }}
            >
              {active && (
                <span className="ap-check" aria-hidden="true">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1.5 5 4 7.5 8.5 2.5"/>
                  </svg>
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32 }}>
                <Icon />
              </span>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{profile.label}</span>
              <span style={{ fontSize: 10, color: active ? `${color}cc` : 'var(--text-tertiary)', textAlign: 'center', lineHeight: 1.3 }}>
                {profile.description}
              </span>
            </button>
          );
        })}
      </div>

      {hasDocument && (
        <button
          className="ap-reprocess"
          onClick={() => onReprocess(selected)}
          disabled={isLoading}
        >
          {isLoading ? <><SpinnerSVG /> Re-processing…</> : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              Re-process with this profile
            </>
          )}
        </button>
      )}
    </div>
  );
}
