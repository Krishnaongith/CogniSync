import React from 'react';

const FEATURES = [
  {
    title: 'Profile-Aware AI',
    description: 'ADHD, Dyslexia, and Anxiety modes each adapt output formatting, chunk size, and tone to match your cognitive needs.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
      </svg>
    ),
    color: '#6366f1',
  },
  {
    title: 'Complexity Dial',
    description: 'Rewrite any content from Grade K to Graduate level with a single slider, instantly re-explained at your target reading level.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
      </svg>
    ),
    color: '#8b5cf6',
  },
  {
    title: 'Priority Matrix',
    description: 'Eisenhower quadrant auto-classifies your tasks into Do Now, Schedule, Delegate, and Eliminate, so you always know what matters most.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="8" height="8" rx="1"/>
        <rect x="13" y="3" width="8" height="8" rx="1"/>
        <rect x="3" y="13" width="8" height="8" rx="1"/>
        <rect x="13" y="13" width="8" height="8" rx="1"/>
      </svg>
    ),
    color: '#06b6d4',
  },
  {
    title: 'Focus & Step-by-Step',
    description: 'Two reading modes for different attention spans: Focus mode shows one point at a time, Step-by-Step walks through content sequentially.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    color: '#10b981',
  },
  {
    title: 'Text-to-Speech + Heatmap',
    description: 'Listen to your simplified content with natural TTS, and see sentence complexity highlighted in a color-coded heatmap at a glance.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      </svg>
    ),
    color: '#f472b6',
  },
  {
    title: 'Session History + Calendar',
    description: 'Save every session for later review, and export task deadlines directly to your calendar, so you never miss a due date again.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    color: '#f59e0b',
  },
];

export function FeaturesSection() {
  return (
    <>
      <style>{`
        .features-section {
          padding: clamp(64px, 10vw, 120px) clamp(20px, 5vw, 48px);
          background: #070b14;
          position: relative;
        }

        .features-section::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(6,182,212,0.3), transparent);
        }

        .features-inner {
          max-width: 1100px;
          margin: 0 auto;
        }

        .features-label {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #8b5cf6;
          margin-bottom: 12px;
        }

        .features-heading {
          font-size: clamp(1.75rem, 3.5vw, 2.5rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #f0f4ff;
          margin: 0 0 16px;
        }

        .features-subtext {
          font-size: 1.05rem;
          color: #64748b;
          max-width: 520px;
          line-height: 1.65;
          margin: 0 0 56px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 767px) {
          .features-grid {
            grid-template-columns: 1fr;
          }
        }

        .feature-card {
          background: rgba(17, 24, 39, 0.7);
          border: 1px solid rgba(99, 102, 241, 0.1);
          border-radius: 16px;
          padding: 28px 24px;
          backdrop-filter: blur(20px);
          transition: border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
        }

        .feature-card:hover {
          border-color: rgba(99, 102, 241, 0.25);
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.25);
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
        }

        .feature-title {
          font-size: 1rem;
          font-weight: 700;
          color: #f0f4ff;
          margin: 0 0 8px;
        }

        .feature-desc {
          font-size: 0.875rem;
          line-height: 1.65;
          color: #64748b;
          margin: 0;
        }
      `}</style>

      <section className="features-section" aria-labelledby="features-heading">
        <div className="features-inner">
          <span className="features-label">Features</span>
          <h2 id="features-heading" className="features-heading">Everything your brain needs</h2>
          <p className="features-subtext">
            Six powerful tools working together to reduce cognitive load and help you study smarter.
          </p>

          <div className="features-grid">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="feature-card">
                <div
                  className="feature-icon"
                  aria-hidden="true"
                  style={{
                    background: `${feature.color}18`,
                    border: `1px solid ${feature.color}30`,
                    color: feature.color,
                  }}
                >
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
