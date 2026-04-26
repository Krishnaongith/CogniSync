import type { ProcessorResult, Task, KeyPoint } from '../types';

/**
 * Merge tasks from multiple results, sorted by deadline ascending.
 * Tasks without deadlines come last. Each task is labeled with sourceFileName.
 */
export function mergeTasks(results: ProcessorResult[], fileNames: string[]): Task[] {
  const all: Task[] = [];

  for (let i = 0; i < results.length; i++) {
    const fileName = fileNames[i] ?? '';
    for (const task of results[i].tasks) {
      all.push({ ...task, sourceFileName: fileName });
    }
  }

  return all.sort((a, b) => {
    const aHas = a.deadline != null && a.deadline !== '';
    const bHas = b.deadline != null && b.deadline !== '';

    if (aHas && bHas) {
      return new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime();
    }
    if (aHas) return -1;
    if (bHas) return 1;
    return 0;
  });
}

/**
 * Deduplicate key points by text (case-insensitive, trimmed).
 * First occurrence wins. Each key point is labeled with sourceFileName.
 */
export function mergeKeyPoints(results: ProcessorResult[], fileNames: string[]): KeyPoint[] {
  const seen = new Set<string>();
  const merged: KeyPoint[] = [];

  for (let i = 0; i < results.length; i++) {
    const fileName = fileNames[i] ?? '';
    for (const kp of results[i].keyPoints) {
      const key = kp.text.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        merged.push({ ...kp, sourceFileName: fileName });
      }
    }
  }

  return merged;
}

/**
 * Enforce the 10-file cap: return at most 10 files.
 */
export function capFileList<T>(files: T[]): T[] {
  return files.slice(0, 10);
}
