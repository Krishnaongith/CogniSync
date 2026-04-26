import React from 'react';

interface CardProps {
  accentColor: string;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  animationDelay?: number;
  collapsible?: boolean;
  variant?: 'default' | 'elevated' | 'outlined';
}

const CARD_CSS = `
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  @media (prefers-reduced-motion: reduce) {
    .cs-card { animation: none !important; opacity: 1 !important; transform: none !important; }
  }

  .cs-card {
    position: relative;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 16px;
    transition: transform 0.25s cubic-bezier(0.4,0,0.2,1),
                box-shadow 0.25s cubic-bezier(0.4,0,0.2,1),
                border-color 0.25s cubic-bezier(0.4,0,0.2,1);
    will-change: transform;
    overflow: hidden;
  }

  .cs-card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(135deg,
      var(--card-accent, rgba(99,102,241,0.06)) 0%,
      transparent 60%
    );
    pointer-events: none;
    z-index: 0;
  }

  /* Top accent line */
  .cs-card::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg,
      transparent 0%,
      var(--card-accent-solid, rgba(99,102,241,0.5)) 50%,
      transparent 100%
    );
    opacity: 0.6;
    pointer-events: none;
  }

  .cs-card:hover {
    transform: translateY(-3px);
  }

  .cs-card-inner {
    position: relative;
    z-index: 1;
  }

  .cs-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .cs-card-title-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .cs-card-icon {
    width: 40px; height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
  }

  .cs-card:hover .cs-card-icon {
    transform: scale(1.1) rotate(5deg);
  }

  .cs-card-title {
    font-weight: 700;
    font-size: 1rem;
    letter-spacing: -0.02em;
    margin: 0;
    color: var(--text-primary);
  }

  .cs-collapse-btn {
    background: rgba(99,102,241,0.08);
    border: 1px solid rgba(99,102,241,0.15);
    border-radius: 8px;
    width: 32px; height: 32px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    transition: background 0.2s, color 0.2s, transform 0.3s;
    flex-shrink: 0;
  }

  .cs-collapse-btn:hover {
    background: rgba(99,102,241,0.15);
    color: var(--text-primary);
  }

  .cs-collapse-btn.expanded {
    transform: rotate(180deg);
  }

  .cs-collapsible-grid {
    display: grid;
    grid-template-rows: 1fr;
    overflow: hidden;
    transition: grid-template-rows 0.35s cubic-bezier(0.4,0,0.2,1);
  }

  .cs-collapsible-grid.collapsed {
    grid-template-rows: 0fr;
  }

  .cs-collapsible-inner {
    min-height: 0;
  }
`;

let cardStyleInjected = false;
function injectCardStyles() {
  if (cardStyleInjected) return;
  cardStyleInjected = true;
  const style = document.createElement('style');
  style.textContent = CARD_CSS;
  document.head.appendChild(style);
}

export function Card({
  accentColor,
  icon,
  title,
  children,
  animationDelay = 0,
  collapsible = false,
  variant = 'default',
}: CardProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);

  React.useEffect(() => { injectCardStyles(); }, []);

  // Parse accent color to create glow/tint
  const accentAlpha = (a: number) => {
    // Convert hex to rgba
    const hex = accentColor.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  };

  const cardStyle: React.CSSProperties = {
    ['--card-accent' as string]: accentAlpha(0.07),
    ['--card-accent-solid' as string]: accentColor,
    background: 'var(--glass-bg)',
    backdropFilter: 'var(--glass-blur)',
    WebkitBackdropFilter: 'var(--glass-blur)',
    border: `1px solid ${accentAlpha(0.18)}`,
    boxShadow: `0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px ${accentAlpha(0.08)}, inset 0 1px 0 ${accentAlpha(0.1)}`,
    animation: `cardIn 0.5s cubic-bezier(0.16,1,0.3,1) ${animationDelay}ms both`,
    contentVisibility: 'auto',
  };

  if (variant === 'elevated') {
    cardStyle.background = 'var(--surface-3)';
    cardStyle.backdropFilter = 'none';
    (cardStyle as any).WebkitBackdropFilter = 'none';
    cardStyle.boxShadow = `var(--shadow-xl), 0 0 0 1px ${accentAlpha(0.1)}`;
  } else if (variant === 'outlined') {
    cardStyle.background = 'transparent';
    cardStyle.backdropFilter = 'none';
    (cardStyle as any).WebkitBackdropFilter = 'none';
    cardStyle.boxShadow = 'none';
    cardStyle.border = `1px solid var(--border-default)`;
  }

  return (
    <div className="cs-card" style={cardStyle}>
      <div className="cs-card-inner">
        <div className="cs-card-header" style={{ marginBottom: isExpanded ? 20 : 0 }}>
          <div className="cs-card-title-row">
            <div
              className="cs-card-icon"
              aria-hidden="true"
              style={{
                background: `linear-gradient(135deg, ${accentAlpha(0.2)}, ${accentAlpha(0.08)})`,
                border: `1px solid ${accentAlpha(0.25)}`,
                color: accentColor,
              }}
            >
              {icon}
            </div>
            <h3 className="cs-card-title">{title}</h3>
          </div>

          {collapsible && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`cs-collapse-btn${isExpanded ? ' expanded' : ''}`}
              aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
              aria-expanded={isExpanded}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          )}
        </div>

        <div className={`cs-collapsible-grid${collapsible && !isExpanded ? ' collapsed' : ''}`}>
          <div className="cs-collapsible-inner">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
