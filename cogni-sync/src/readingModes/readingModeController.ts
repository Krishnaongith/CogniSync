import type { FocusViewState, ReadingMode } from '../types';

export function navigateForward(state: FocusViewState): FocusViewState {
  return {
    currentIndex: Math.min(state.currentIndex + 1, state.total - 1),
    total: state.total,
  };
}

export function navigateBackward(state: FocusViewState): FocusViewState {
  return {
    currentIndex: Math.max(state.currentIndex - 1, 0),
    total: state.total,
  };
}

export function switchMode(current: ReadingMode): ReadingMode {
  return current === 'focus' ? 'step-by-step' : 'focus';
}
