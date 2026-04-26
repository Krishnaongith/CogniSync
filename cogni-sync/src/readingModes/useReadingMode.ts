import { useState } from 'react';
import type { ReadingMode, ReadingModeState, FocusViewState } from '../types';
import { navigateForward, navigateBackward } from './readingModeController';

export interface UseReadingModeResult {
  mode: ReadingMode;
  focusState: FocusViewState | undefined;
  setMode: (mode: ReadingMode) => void;
  next: () => void;
  prev: () => void;
}

export function useReadingMode(initialTotal = 0): UseReadingModeResult {
  const [state, setState] = useState<ReadingModeState>({
    mode: 'focus',
    focusState: initialTotal > 0 ? { currentIndex: 0, total: initialTotal } : undefined,
  });

  const setMode = (mode: ReadingMode) => {
    setState(prev => ({ ...prev, mode }));
  };

  const next = () => {
    setState(prev => {
      if (!prev.focusState) return prev;
      return { ...prev, focusState: navigateForward(prev.focusState) };
    });
  };

  const prev = () => {
    setState(prev => {
      if (!prev.focusState) return prev;
      return { ...prev, focusState: navigateBackward(prev.focusState) };
    });
  };

  return {
    mode: state.mode,
    focusState: state.focusState,
    setMode,
    next,
    prev,
  };
}
