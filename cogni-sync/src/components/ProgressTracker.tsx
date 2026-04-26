import React, { useMemo } from 'react';

function useCountUp(target: number, duration = 700): number {
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [count, setCount] = React.useState(prefersReducedMotion ? target : 0);
  React.useEffect(() => {
    if (prefersReducedMotion) { setCount(target); return; }
    if (target === 0) { setCount(0); return; }
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setCount(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, prefersReducedMotion]);
  return count;
}

interface ProgressTrackerProps {
  documentsProcessed: number;
  totalReadingTime: number;
  currentStreak: number;
  longestStreak: number;
}

const STAT_CONFIGS = [
  { key: 'docs',    label: 'Documents',     color: '#818cf8', glow: 'rgba(99,102,241,0.2)' },
  { key: 'time',    label: 'Minutes Read',  color: '#34d399', glow: 'rgba(52,211,153,0.2)' },
  { key: 'streak',  label: 'Day Streak',    color: '#f87171', glow: 'rgba(248,113,113,0.2)' },
  { key: 'best',    label: 'Best Streak',   color: '#c084fc', glow: 'rgba(192,132,252,0.2)' },
];

const ACHIEVEMENTS = [
  { icon: '🎯', label: 'First Steps',  color: '#34d399', req: (d: number) => d >= 1 },
  { icon: '📚', label: 'Bookworm',     color: '#60a5fa', req: (d: number) => d >= 5 },
  { icon: '🏆', label: 'Scholar',      color: '#fbbf24', req: (d: number) => d >= 10 },
  { icon: '🔥', label: 'On Fire',      color: '#f87171', req: (_: number, s: number) => s >= 3 },
  { icon: '⏰', label: 'Time Master',  color: '#c084fc', req: (_: number, __: number, t: number) => t >= 60 },
];

export function ProgressTracker({ documentsProcessed, totalReadingTime, currentStreak, longestStreak }: ProgressTrackerProps) {
  const animDocs    = useCountUp(documentsProcessed);
  const animTime    = useCountUp(totalReadingTime);
  const animStreak  = useCountUp(currentStreak);
  const animBest    = useCountUp(longestStreak);

  const values = [animDocs, animTime, animStreak, animBest];

  const achievements = useMemo(() =>
    ACHIEVEMENTS.filter(a => a.req(documentsProcessed, currentStreak, totalReadingTime)),
    [documentsProcessed, currentStreak, totalReadingTime]
  );

  return (
    <>
      <style>{`
        .pt-root {
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border: 1px solid var(--border-subtle);
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 24px;
          position: relative;
          overflow: hidden;
        }
        .pt-root::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent);
        }
        .pt-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        .pt-header-icon {
          width: 32px; height: 32px;
          background: rgba(99,102,241,0.12);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #818cf8;
        }
        .pt-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin: 0;
        }
        .pt-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        @media (max-width: 640px) {
          .pt-stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        .pt-stat {
          background: rgba(99,102,241,0.04);
          border: 1px solid rgba(99,102,241,0.08);
          border-radius: 12px;
          padding: 14px;
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: default;
        }
        .pt-stat:hover {
          transform: translateY(-2px);
        }
        .pt-stat-label {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-tertiary);
          margin-bottom: 6px;
        }
        .pt-stat-value {
          font-size: 1.75rem;
          font-weight: 800;
          font-variant-numeric: tabular-nums;
          line-height: 1;
        }
        .pt-empty {
          text-align: center;
          padding: 20px 16px;
        }
        .pt-empty-icon {
          font-size: 2rem;
          margin-bottom: 10px;
        }
        .pt-empty-title {
          font-size: 0.9375rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 6px;
        }
        .pt-empty-sub {
          font-size: 0.8125rem;
          color: var(--text-secondary);
          margin: 0;
        }
        .pt-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, var(--border-default), transparent);
          margin-bottom: 16px;
        }
        .pt-badges {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 2px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .pt-badges::-webkit-scrollbar { display: none; }
        .pt-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          border-radius: 999px;
          padding: 5px 12px;
          font-size: 12px;
          font-weight: 600;
          flex-shrink: 0;
          cursor: default;
          transition: transform 0.2s;
        }
        .pt-badge:hover { transform: translateY(-2px); }
        .pt-badge-label { font-size: 0.875rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; }
      `}</style>

      <div className="pt-root">
        <div className="pt-header">
          <div className="pt-header-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </div>
          <h2 className="pt-title">Your Progress</h2>
        </div>

        {documentsProcessed === 0 ? (
          <div className="pt-empty">
            <div className="pt-empty-icon" aria-hidden="true">🚀</div>
            <p className="pt-empty-title">Start your learning journey</p>
            <p className="pt-empty-sub">Process your first document to track progress and unlock achievements.</p>
          </div>
        ) : (
          <div className="pt-stats-grid">
            {STAT_CONFIGS.map((cfg, i) => (
              <div key={cfg.key} className="pt-stat" style={{ borderColor: `${cfg.glow}` }}>
                <div className="pt-stat-label">{cfg.label}</div>
                <div className="pt-stat-value" style={{ color: cfg.color }}>
                  {values[i]}
                  {cfg.key === 'time' && <span style={{ fontSize: '0.875rem', fontWeight: 600, marginLeft: 3 }}>m</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {achievements.length > 0 && (
          <>
            <div className="pt-divider" />
            <div className="pt-badge-label">Achievements</div>
            <div className="pt-badges">
              {achievements.map((a, i) => (
                <div key={i} className="pt-badge" style={{ background: `${a.color}15`, border: `1px solid ${a.color}30`, color: a.color }}>
                  <span aria-hidden="true">{a.icon}</span>
                  {a.label}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
