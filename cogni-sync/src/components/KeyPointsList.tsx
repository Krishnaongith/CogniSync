import { KeyPoint } from '../types/index';

interface KeyPointsListProps {
  keyPoints: KeyPoint[];
}

export function KeyPointsList({ keyPoints }: KeyPointsListProps) {
  if (keyPoints.length === 0) {
    return (
      <p style={{ color: 'var(--text-tertiary)', fontStyle: 'italic', margin: 0 }}>
        No key points could be identified in this document.
      </p>
    );
  }

  return (
    <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {keyPoints.map((kp, i) => (
        <li key={kp.id} style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          padding: '10px 14px',
          background: 'rgba(99,102,241,0.04)',
          border: '1px solid rgba(99,102,241,0.08)',
          borderRadius: 10,
          lineHeight: 1.6,
          fontSize: '0.9375rem',
          color: 'var(--text-primary)',
          animation: `fadeInUp 0.4s cubic-bezier(0.16,1,0.3,1) ${i * 40}ms both`,
        }}>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 22, height: 22,
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: '50%',
            fontSize: 11,
            fontWeight: 700,
            color: '#818cf8',
            flexShrink: 0,
            marginTop: 1,
            fontVariantNumeric: 'tabular-nums',
          }} aria-hidden="true">
            {i + 1}
          </span>
          {kp.text}
        </li>
      ))}
    </ul>
  );
}
