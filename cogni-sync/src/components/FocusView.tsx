import { useState, useEffect, useRef } from 'react';
import { KeyPoint } from '../types/index';

interface FocusViewProps {
  keyPoints: KeyPoint[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
}

type Direction = 'forward' | 'backward';
type AnimPhase = 'idle' | 'exit' | 'enter';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function FocusView({ keyPoints, currentIndex, onNext, onPrev }: FocusViewProps) {
  const total = keyPoints.length;
  const safeIndex = Math.min(Math.max(currentIndex, 0), total - 1);

  const [displayedIndex, setDisplayedIndex] = useState(safeIndex);
  const [direction, setDirection] = useState<Direction>('forward');
  const [phase, setPhase] = useState<AnimPhase>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (currentIndex === displayedIndex) return;

    const reduced = prefersReducedMotion();
    const newDirection: Direction = currentIndex > displayedIndex ? 'forward' : 'backward';
    setDirection(newDirection);

    if (reduced) {
      setDisplayedIndex(safeIndex);
      return;
    }

    setPhase('exit');
    timeoutRef.current = setTimeout(() => {
      setDisplayedIndex(safeIndex);
      setPhase('enter');
      timeoutRef.current = setTimeout(() => {
        setPhase('idle');
      }, 200);
    }, 200);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  if (total === 0) {
    return (
      <p style={{ color: '#777', fontStyle: 'italic' }}>
        No key points to display.
      </p>
    );
  }

  const current = keyPoints[displayedIndex] ?? keyPoints[safeIndex];
  const atFirst = safeIndex === 0;
  const atLast = safeIndex === total - 1;

  // direction-aware translate: forward = enter from right (+8px), exit to left (-8px)
  //                            backward = enter from left (-8px), exit to right (+8px)
  const enterTranslate = direction === 'forward' ? '8px' : '-8px';
  const exitTranslate = direction === 'forward' ? '-8px' : '8px';

  const cardStyle: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 500,
    padding: '32px 28px',
    borderRadius: 12,
    background: 'rgba(99,102,241,0.08)',
    border: '1px solid rgba(99,102,241,0.2)',
    textAlign: 'center',
    lineHeight: 1.7,
    color: 'var(--text-primary)',
    transition: 'opacity 0.2s ease, transform 0.2s ease',
    opacity: phase === 'exit' ? 0 : 1,
    transform:
      phase === 'exit'
        ? `translateX(${exitTranslate})`
        : phase === 'enter'
        ? `translateX(${enterTranslate})`
        : 'translateX(0)',
  };

  const navBtnBase: React.CSSProperties = {
    padding: '7px 18px',
    borderRadius: 8,
    border: '1px solid rgba(99,102,241,0.25)',
    background: 'rgba(99,102,241,0.1)',
    color: '#818cf8',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: 'inherit',
    transition: 'opacity 0.15s, background 0.15s',
  };

  const prevStyle: React.CSSProperties = {
    ...navBtnBase,
    opacity: atFirst ? 0.4 : 1,
    cursor: atFirst ? 'not-allowed' : 'pointer',
  };

  const nextStyle: React.CSSProperties = {
    ...navBtnBase,
    opacity: atLast ? 0.4 : 1,
    cursor: atLast ? 'not-allowed' : 'pointer',
  };

  return (
    <div style={{ padding: '24px 16px' }}>
      <div style={cardStyle}>
        {current.text}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, marginTop: 20 }}>
        <button
          onClick={onPrev}
          disabled={atFirst}
          aria-label="Previous key point"
          style={prevStyle}
        >
          ← Previous
        </button>
        <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
          {safeIndex + 1} of {total}
        </span>
        <button
          onClick={onNext}
          disabled={atLast}
          aria-label="Next key point"
          style={nextStyle}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
