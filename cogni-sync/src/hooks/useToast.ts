import React from 'react';
import type { ToastItem, ToastType } from '../components/Toast';

interface ShowToastOptions {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // default: 4000 for success/info/warning, 0 for error
}

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const showToast = React.useCallback((options: ShowToastOptions) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const duration = options.duration ?? (options.type === 'error' ? 0 : 4000);
    const toast: ToastItem = { id, ...options, duration };

    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const dismissToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, showToast, dismissToast };
}
