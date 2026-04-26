import React from 'react';

interface TooltipProps {
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactElement;
}

let tooltipStyleInjected = false;
function injectTooltipStyles() {
  if (tooltipStyleInjected) return;
  tooltipStyleInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    .tooltip-wrapper {
      position: relative;
      display: inline-flex;
    }
    .tooltip-bubble {
      position: absolute;
      z-index: 9000;
      background: #1e293b;
      color: #f1f5f9;
      font-size: 12px;
      font-weight: 500;
      line-height: 1.4;
      padding: 6px 10px;
      border-radius: 6px;
      white-space: nowrap;
      max-width: 220px;
      white-space: normal;
      pointer-events: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      animation: tooltipFadeIn 0.15s ease;
    }
    .tooltip-bubble.placement-top {
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
    }
    .tooltip-bubble.placement-bottom {
      top: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%);
    }
    .tooltip-bubble.placement-left {
      right: calc(100% + 8px);
      top: 50%;
      transform: translateY(-50%);
    }
    .tooltip-bubble.placement-right {
      left: calc(100% + 8px);
      top: 50%;
      transform: translateY(-50%);
    }
    .tooltip-arrow {
      position: absolute;
      width: 0;
      height: 0;
    }
    .tooltip-bubble.placement-top .tooltip-arrow {
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%);
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 5px solid #1e293b;
    }
    .tooltip-bubble.placement-bottom .tooltip-arrow {
      top: -4px;
      left: 50%;
      transform: translateX(-50%);
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-bottom: 5px solid #1e293b;
    }
    @keyframes tooltipFadeIn {
      from { opacity: 0; transform: translateX(-50%) translateY(4px); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @media (prefers-reduced-motion: reduce) {
      .tooltip-bubble { animation: none; }
    }
  `;
  document.head.appendChild(style);
}

export function Tooltip({ content, placement = 'top', children }: TooltipProps) {
  const [visible, setVisible] = React.useState(false);
  const hoverTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    injectTooltipStyles();
  }, []);

  // Dismiss on Escape
  React.useEffect(() => {
    if (!visible) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVisible(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [visible]);

  function handleMouseEnter() {
    hoverTimerRef.current = setTimeout(() => setVisible(true), 500);
  }

  function handleMouseLeave() {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setVisible(false);
  }

  function handleFocus() {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setVisible(true);
  }

  function handleBlur() {
    setVisible(false);
  }

  return (
    <span
      className="tooltip-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {React.cloneElement(children, {
        'aria-describedby': visible ? 'tooltip-content' : undefined,
      })}
      {visible && (
        <span
          id="tooltip-content"
          role="tooltip"
          className={`tooltip-bubble placement-${placement}`}
        >
          {content}
          <span className="tooltip-arrow" aria-hidden="true" />
        </span>
      )}
    </span>
  );
}
