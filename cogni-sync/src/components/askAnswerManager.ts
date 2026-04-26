import type { AskResult } from '../types';

const MAX_ANSWERS = 5;

// Add a new answer, evicting the oldest if count would exceed 5
export function addAnswer(answers: AskResult[], newAnswer: AskResult): AskResult[] {
  const updated = [...answers, newAnswer];
  if (updated.length > MAX_ANSWERS) {
    return updated.slice(updated.length - MAX_ANSWERS);
  }
  return updated;
}
