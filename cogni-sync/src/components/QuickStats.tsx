import React from 'react';

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

interface QuickStatsProps {
  keyPointsCount: number;
  tasksCount: number;
  completedTasks: number;
  readingTimeEstimate: number;
}

export function QuickStats({ keyPointsCount, tasksCount, completedTasks, readingTimeEstimate }: QuickStatsProps) {
  const completionPct = tasksCount > 0 ? Math.round((completedTasks / tasksCount) * 100) : 0;
  const animKP   = useCountUp(keyPointsCount);
  const animTime = useCountUp(readingTimeEstimate);

  return (
    <>
      <style>{`
        .qs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        @media (max-width: 480px) {
          .qs-grid { grid-template-columns: 1fr; }
        }
        .qs-card {
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          -webkit-backdrop-filter: var(--glass-blur);
          border-radius: 16px;
          padding: 20px;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: default;
        }
        .qs-card:hover {
          transform: translateY(-3px);
        }
        .qs-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--qs-accent, rgba(99,102,241,0.4)), transparent);
        }
        .qs-orb {
          position: absolute;
          top: -20px; right: -20px;
          width: 80px; height: 80px;
          border-radius: 50%;
          pointer-events: none;
        }
        .qs-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-tertiary);
          margin-bottom: 8px;
          position: relative;
        }
        .qs-value {
          font-size: 2rem;
          font-weight: 800;
          font-variant-numeric: tabular-nums;
          line-height: 1;
          position: relative;
        }
        .qs-sub {
          font-size: 12px;
          color: var(--text-tertiary);
          margin-top: 4px;
          position: relative;
        }
        .qs-progress-track {
          height: 4px;
          border-radius: 999px;
          overflow: hidden;
          margin-top: 10px;
          position: relative;
        }
        .qs-progress-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.8s cubic-bezier(0.16,1,0.3,1);
        }
      `}</style>

      <div className="qs-grid">
        {/* Key Points */}
        <div className="qs-card" style={{ ['--qs-accent' as string]: 'rgba(129,140,248,0.5)', border: '1px solid rgba(129,140,248,0.12)' }}>
          <div className="qs-orb" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }} aria-hidden="true" />
          <div className="qs-label">Key Points</div>
          <div className="qs-value" style={{ color: '#818cf8' }}>{animKP}</div>
          <div className="qs-sub">extracted insights</div>
        </div>

        {/* Tasks */}
        <div className="qs-card" style={{ ['--qs-accent' as string]: 'rgba(52,211,153,0.5)', border: '1px solid rgba(52,211,153,0.12)' }}>
          <div className="qs-orb" style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)' }} aria-hidden="true" />
          <div className="qs-label">Tasks</div>
          <div className="qs-value" style={{ color: '#34d399' }}>
            {completedTasks}<span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>/{tasksCount}</span>
          </div>
          <div className="qs-progress-track" style={{ background: 'rgba(52,211,153,0.1)' }}>
            <div className="qs-progress-fill" style={{ width: `${completionPct}%`, background: 'linear-gradient(90deg, #10b981, #34d399)' }} />
          </div>
        </div>

        {/* Reading time */}
        <div className="qs-card" style={{ ['--qs-accent' as string]: 'rgba(192,132,252,0.5)', border: '1px solid rgba(192,132,252,0.12)' }}>
          <div className="qs-orb" style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)' }} aria-hidden="true" />
          <div className="qs-label">Reading Time</div>
          <div className="qs-value" style={{ color: '#c084fc' }}>
            {animTime}<span style={{ fontSize: '1rem', fontWeight: 600, marginLeft: 3 }}>min</span>
          </div>
          <div className="qs-sub">estimated</div>
        </div>
      </div>
    </>
  );
}
