import React from 'react';

interface SkeletonCardProps {
  animationDelay?: number;
}

export function SkeletonCard({ animationDelay = 0 }: SkeletonCardProps) {
  return (
    <>
      <style>{`
        @keyframes skeletonShimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes skeletonIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sk-shimmer {
          background: linear-gradient(
            90deg,
            rgba(99,102,241,0.06) 0%,
            rgba(99,102,241,0.12) 50%,
            rgba(99,102,241,0.06) 100%
          );
          background-size: 200% 100%;
          animation: skeletonShimmer 1.8s ease-in-out infinite;
          border-radius: 6px;
        }
        @media (prefers-reduced-motion: reduce) {
          .sk-shimmer {
            background: rgba(99,102,241,0.08);
            animation: none;
          }
        }
      `}</style>

      <div
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          borderRadius: 16,
          border: '1px solid var(--border-subtle)',
          padding: 24,
          marginBottom: 16,
          animation: `skeletonIn 0.4s ease ${animationDelay}ms both`,
          position: 'relative',
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        {/* Top accent line */}
        <div className="sk-shimmer" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, borderRadius: 0 }} />

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="sk-shimmer" style={{ width: 40, height: 40, borderRadius: 10 }} />
            <div className="sk-shimmer" style={{ width: 140, height: 18 }} />
          </div>
          <div className="sk-shimmer" style={{ width: 28, height: 28, borderRadius: 8 }} />
        </div>

        {/* Content lines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[100, 88, 95, 72, 80].map((w, i) => (
            <div key={i} className="sk-shimmer" style={{ height: 13, width: `${w}%` }} />
          ))}
        </div>
      </div>
    </>
  );
}
