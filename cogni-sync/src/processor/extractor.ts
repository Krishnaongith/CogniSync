import type { MockResponse, ExtractorOutput, Task } from '../types';

const MIN_KEY_POINTS = 3;
const MAX_KEY_POINTS = 15;

export function extractFromMockResponse(response: MockResponse): ExtractorOutput {
  const { keyPoints, tasks } = response;

  // Validate key points count
  if (keyPoints.length < MIN_KEY_POINTS) {
    // Fewer than 3, return empty with informational message (caller can surface this)
    return { keyPoints: [], tasks: [] };
  }

  // Clamp to max 15
  const clampedKeyPoints = keyPoints.slice(0, MAX_KEY_POINTS);

  // Ensure every task has a non-empty description and completed: false
  const validatedTasks: Task[] = tasks
    .filter((t) => t.description && t.description.trim().length > 0)
    .map((t) => ({ ...t, completed: false }));

  return {
    keyPoints: clampedKeyPoints,
    tasks: validatedTasks,
  };
}
