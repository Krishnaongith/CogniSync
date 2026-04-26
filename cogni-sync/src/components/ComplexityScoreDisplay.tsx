import { useState, useEffect } from 'react';
import type { ComplexityScore } from '../types/index';
import { Tooltip } from './Tooltip';

interface ComplexityScoreDisplayProps {
  originalScore: ComplexityScore & { summary?: string };
  simplifiedScore: ComplexityScore & { summary?: string };
}

const EASE_COLOR = (ease: number) => {
  if (ease >= 70) return '#22c55e';
  if (ease >= 40) return '#f59e0b';
  return '#ef4444';
};

const STRIPE_OVERLAY =
  'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.15) 4px, rgba(255,255,255,0.15) 8px)';

function ScoreBar({ score, label }: { score: ComplexityScore & { summary?: string }; label: string }) {
  const target = Math.min(100, Math.max(0, score.fleschReadingEase));
  const color = EASE_COLOR(target);
  const [animatedWidth, setAnimatedWidth] = useState(0);

  useEffect(() => {
    // Start from 0, animate to target on mount
    setAnimatedWidth(0);
    const raf = requestAnimationFrame(() => {
      // Small delay so the transition actually fires
      setTimeout(() => setAnimatedWidth(target), 30);
    });
    return () => cancelAnimationFrame(raf);
  }, [target]);

  const tooltipText = `Grade ${score.fleschKincaidGrade.toFixed(1)} | Ease ${score.fleschReadingEase.toFixed(1)}/100 | ${score.label}`;

  return (
    <div style={{ flex: 1, minWidth: 180 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>
          {score.fleschReadingEase.toFixed(0)}
        </span>
        <span style={{ fontSize: 13, color: '#64748b' }}>/ 100 ease</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, background: color + '22', color, borderRadius: 999, padding: '2px 8px', fontWeight: 600 }}>
          {score.label}
        </span>
      </div>
      <Tooltip content={tooltipText} placement="top">
        <div
          style={{ background: '#e2e8f0', borderRadius: 999, height: 8, overflow: 'hidden', marginBottom: 6, cursor: 'default' }}
        >
          <div
            role="progressbar"
            aria-valuenow={Math.round(target)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${label} reading ease: ${Math.round(target)} out of 100`}
            style={{
              width: `${animatedWidth}%`,
              height: '100%',
              borderRadius: 999,
              transition: 'width 0.6s ease-out',
              background: color,
              backgroundImage: STRIPE_OVERLAY,
            }}
          />
        </div>
      </Tooltip>
      <div style={{ fontSize: 12, color: '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>
        Grade {score.fleschKincaidGrade.toFixed(1)}
        {score.summary && <span style={{ marginLeft: 8, fontStyle: 'italic' }}>— {score.summary}</span>}
      </div>
    </div>
  );
}

export function ComplexityScoreDisplay({ originalScore, simplifiedScore }: ComplexityScoreDisplayProps) {
  const unavailable = originalScore.fleschKincaidGrade === 0 && originalScore.fleschReadingEase === 0;
  if (unavailable) {
    return <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Complexity scoring is unavailable for this content.</p>;
  }

  const origGrade = originalScore.fleschKincaidGrade;
  const simplGrade = simplifiedScore.fleschKincaidGrade;
  const reduction = origGrade > 0 ? (((origGrade - simplGrade) / origGrade) * 100).toFixed(1) : '0.0';
  const improved = parseFloat(reduction) > 0;

  return (
    <div>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 16 }}>
        <ScoreBar score={originalScore} label="Original" />
        <ScoreBar score={simplifiedScore} label="Simplified" />
      </div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: improved ? '#f0fdf4' : '#fef2f2',
        color: improved ? '#16a34a' : '#dc2626',
        borderRadius: 999, padding: '4px 14px', fontSize: 13, fontWeight: 700,
      }}>
        {improved ? '↓' : '↑'} Complexity {improved ? 'reduced' : 'increased'} by {Math.abs(parseFloat(reduction))}%
      </div>
    </div>
  );
}
