import { useCallback, useEffect, useRef, useState } from 'react';
import type { ComplexityLevel } from '../types';
import { COMPLEXITY_LABELS } from '../types';

const pulseKeyframes = `
@keyframes thumbPulse {
  0%, 100% { box-shadow: 0 0 0 0px rgba(99,102,241,0.5); }
  50%       { box-shadow: 0 0 0 6px rgba(99,102,241,0); }
}
`;

// Inject keyframes once into the document head
if (typeof document !== 'undefined' && !document.getElementById('complexity-dial-styles')) {
  const style = document.createElement('style');
  style.id = 'complexity-dial-styles';
  style.textContent = pulseKeyframes;
  document.head.appendChild(style);
}

interface ComplexityDialProps {
  level: ComplexityLevel;
  isRewriting: boolean;
  onChange: (level: ComplexityLevel) => void;
}


const TICK_MARKS = [
  { label: 'Kindergarten', grade: 1,  leftPct: 0 },
  { label: 'Elementary',   grade: 4,  leftPct: (3  / 15) * 100 },
  { label: 'Middle',       grade: 6,  leftPct: (5  / 15) * 100 },
  { label: 'High',         grade: 8,  leftPct: (7  / 15) * 100 },
  { label: 'College',      grade: 12, leftPct: (11 / 15) * 100 },
  { label: 'Graduate',     grade: 16, leftPct: 100 },
];

export function ComplexityDial({ level, isRewriting, onChange }: ComplexityDialProps) {
  const [localLevel, setLocalLevel] = useState<number>(level);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setLocalLevel(level); }, [level]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value) as ComplexityLevel;
    setLocalLevel(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onChange(val), 600);
  }, [onChange]);

  return (
    <div style={{ padding: '12px 0' }}>
      {/* Scoped style for thumb pulse — only active while rewriting, respects prefers-reduced-motion */}
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .complexity-dial-input${isRewriting ? '.is-rewriting' : '.never'}::-webkit-slider-thumb {
            animation: thumbPulse 1s ease-in-out infinite;
          }
          .complexity-dial-input${isRewriting ? '.is-rewriting' : '.never'}::-moz-range-thumb {
            animation: thumbPulse 1s ease-in-out infinite;
          }
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Explain like I'm a...</span>
        <span style={{ fontSize: 13, color: '#6366f1', fontWeight: 700 }}>
          {COMPLEXITY_LABELS[localLevel]} (Grade {localLevel})
          {isRewriting && (
            <span
              aria-live="polite"
              style={{ marginLeft: 8, fontSize: 11, color: '#94a3b8' }}
            >
              rewriting…
            </span>
          )}
        </span>
      </div>

      {/* Slider with gradient track */}
      <div style={{ position: 'relative', height: 20 }}>
        {/* Gradient track behind the range input */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: 6,
            borderRadius: 3,
            transform: 'translateY(-50%)',
            background: 'linear-gradient(to right, #22c55e, #f59e0b, #ef4444)',
            pointerEvents: 'none',
          }}
        />
        <input
          type="range"
          min={1}
          max={16}
          step={1}
          value={localLevel}
          onChange={handleChange}
          disabled={isRewriting}
          className={`complexity-dial-input${isRewriting ? ' is-rewriting' : ''}`}
          style={{
            position: 'relative',
            width: '100%',
            background: 'transparent',
            accentColor: '#6366f1',
            cursor: isRewriting ? 'wait' : 'pointer',
            touchAction: 'manipulation',
          }}
          aria-label="Complexity level"
        />
      </div>

      {/* Tick mark labels */}
      <div style={{ position: 'relative', height: 18, marginTop: 4 }}>
        {TICK_MARKS.map(({ label, leftPct }) => (
          <span
            key={label}
            style={{
              position: 'absolute',
              left: `${leftPct}%`,
              fontSize: 10,
              color: '#94a3b8',
              whiteSpace: 'nowrap',
              transform: leftPct === 100 ? 'translateX(-100%)' : undefined,
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
