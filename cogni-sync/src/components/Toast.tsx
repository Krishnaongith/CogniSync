import React from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration: number; // 0 = persistent (errors)
}

interface ToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const TOAST_COLORS: Record<ToastType, { bg: string; border: string; icon: string; color: string }> = {
  success: { bg: 'rgba(209,250,229,0.95)', border: '#22c55e', icon: '✓', color: '#16a34a' },
  error:   { bg: 'rgba(254,226,226,0.95)', border: '#ef4444', icon: '✕', color: '#dc2626' },
  warning: { bg: 'rgba(254,243,199,0.95)', border: '#f59e0b', icon: '⚠', color: '#d97706' },
  info:    { bg: 'rgba(219,234,254,0.95)', border: '#3b82f6', icon: 'ℹ', color: '#2563eb' },
};

let toastStyleInjected = false;
function injectToastStyles() {
  if (toastStyleInjected) return;
  toastStyleInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes toastSlideIn {
      from { transform: translateX(110%); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }
    @keyframes toastSlideOut {
      from { transform: translateX(0);    opacity: 1; }
      to   { transform: translateX(110%); opacity: 0; }
    }
    .toast-item {
      animation: toastSlideIn 0.3s var(--ease-spring, cubic-bezier(0.16,1,0.3,1)) both;
    }
    @media (prefers-reduced-motion: reduce) {
      .toast-item { animation: none !important; }
    }
  `;
  document.head.appendChild(style);
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  React.useEffect(() => { injectToastStyles(); }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        maxWidth: 360,
        width: 'calc(100vw - 32px)',
      }}
    >
      {toasts.map(toast => {
        const colors = TOAST_COLORS[toast.type];
        return (
          <div
            key={toast.id}
            className="toast-item"
            role="alert"
            style={{
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              borderLeft: `4px solid ${colors.border}`,
              borderRadius: 12,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span style={{
              width: 22, height: 22,
              borderRadius: '50%',
              background: colors.border,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
            }} aria-hidden="true">
              {colors.icon}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: colors.color }}>{toast.title}</div>
              {toast.message && (
                <div style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>{toast.message}</div>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                fontSize: 18,
                lineHeight: 1,
                padding: '0 2px',
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
