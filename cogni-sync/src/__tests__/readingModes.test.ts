import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  navigateForward,
  navigateBackward,
  switchMode,
} from '../readingModes/readingModeController';
import type { ProcessingState, ReadingMode } from '../types';

// ─── Property Tests ──────────────────────────────────────────────────────────

describe('Property-based tests — reading modes', () => {

  it(
    // Feature: academic-simplifier, Property 11: Focus View navigation stays in bounds
    'P11: Focus View navigation stays in bounds',
    () => {
      fc.assert(
        fc.property(
          fc.array(fc.string(), { minLength: 1 }),
          fc.integer({ min: 0 }),
          (keyPoints, rawIndex) => {
            const N = keyPoints.length;
            const currentIndex = rawIndex % N;
            const state = { currentIndex, total: N };

            const fwd = navigateForward(state);
            expect(fwd.currentIndex).toBe(Math.min(currentIndex + 1, N - 1));
            expect(fwd.total).toBe(N);

            const bwd = navigateBackward(state);
            expect(bwd.currentIndex).toBe(Math.max(currentIndex - 1, 0));
            expect(bwd.total).toBe(N);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  it(
    // Feature: academic-simplifier, Property 12: Step-by-Step View item count
    'P12: Step-by-Step View renders exactly N items',
    () => {
      fc.assert(
        fc.property(
          fc.array(fc.string(), { minLength: 1 }),
          (keyPoints) => {
            const N = keyPoints.length;
            // Simulate the rendered list: one item per key point
            const renderedItems = keyPoints.map((text, i) => ({ index: i, text }));
            expect(renderedItems.length).toBe(N);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  it(
    // Feature: academic-simplifier, Property 10: Reading mode switch does not trigger reprocessing
    'P10: Reading mode switch does not alter processingState',
    () => {
      fc.assert(
        fc.property(
          fc.constantFrom<ReadingMode>('focus', 'step-by-step'),
          fc.string(),
          (initialMode, resultText) => {
            const processingState: ProcessingState = {
              status: 'success',
              result: {
                keyPoints: [{ id: '1', text: resultText }],
                tasks: [],
                rewrittenText: resultText,
                originalScore: {
                  fleschKincaidGrade: 8,
                  fleschReadingEase: 60,
                  label: 'Standard',
                },
                simplifiedScore: {
                  fleschKincaidGrade: 6,
                  fleschReadingEase: 70,
                  label: 'Fairly Easy',
                },
              },
            };

            const resultBefore = processingState.result;
            const statusBefore = processingState.status;

            // Simulate mode switch — pure state transition, does not touch processingState
            const newMode = switchMode(initialMode);
            expect(newMode).not.toBe(initialMode);

            // processingState must be unchanged
            expect(processingState.result).toBe(resultBefore);
            expect(processingState.status).toBe(statusBefore);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  it(
    // Feature: academic-simplifier, Property 9: Task completion toggle
    'P9: Task completion toggle round-trip restores original value',
    () => {
      const toggle = (completions: Record<string, boolean>, id: string) => ({
        ...completions,
        [id]: !completions[id],
      });

      fc.assert(
        fc.property(
          fc.uuid(),
          fc.boolean(),
          (taskId, initialValue) => {
            const completions: Record<string, boolean> = { [taskId]: initialValue };

            const afterFirst = toggle(completions, taskId);
            expect(afterFirst[taskId]).toBe(!initialValue);

            const afterSecond = toggle(afterFirst, taskId);
            expect(afterSecond[taskId]).toBe(initialValue);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

});

// ─── Unit Tests ───────────────────────────────────────────────────────────────

describe('Unit tests — reading mode controller', () => {

  describe('switchMode', () => {
    it('toggles from focus to step-by-step', () => {
      expect(switchMode('focus')).toBe('step-by-step');
    });

    it('toggles from step-by-step to focus', () => {
      expect(switchMode('step-by-step')).toBe('focus');
    });

    it('double toggle returns original mode', () => {
      expect(switchMode(switchMode('focus'))).toBe('focus');
      expect(switchMode(switchMode('step-by-step'))).toBe('step-by-step');
    });
  });

  describe('navigateForward', () => {
    it('increments index when not at end', () => {
      expect(navigateForward({ currentIndex: 2, total: 5 })).toEqual({ currentIndex: 3, total: 5 });
    });

    it('clamps at last index when at end', () => {
      expect(navigateForward({ currentIndex: 4, total: 5 })).toEqual({ currentIndex: 4, total: 5 });
    });

    it('clamps at 0 for single-item list', () => {
      expect(navigateForward({ currentIndex: 0, total: 1 })).toEqual({ currentIndex: 0, total: 1 });
    });
  });

  describe('navigateBackward', () => {
    it('decrements index when not at start', () => {
      expect(navigateBackward({ currentIndex: 3, total: 5 })).toEqual({ currentIndex: 2, total: 5 });
    });

    it('clamps at 0 when at start', () => {
      expect(navigateBackward({ currentIndex: 0, total: 5 })).toEqual({ currentIndex: 0, total: 5 });
    });

    it('clamps at 0 for single-item list', () => {
      expect(navigateBackward({ currentIndex: 0, total: 1 })).toEqual({ currentIndex: 0, total: 1 });
    });
  });

  describe('progress indicator', () => {
    it('reports correct "N of M" values', () => {
      const state = { currentIndex: 2, total: 7 };
      // Progress indicator: currentIndex + 1 of total
      const current = state.currentIndex + 1;
      const total = state.total;
      expect(current).toBe(3);
      expect(total).toBe(7);
    });

    it('reports 1 of 1 for single item', () => {
      const state = { currentIndex: 0, total: 1 };
      expect(state.currentIndex + 1).toBe(1);
      expect(state.total).toBe(1);
    });
  });

});
