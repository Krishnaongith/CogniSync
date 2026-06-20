// Feature: cognisync-feature-expansion, Property 15: Synthesis Merge Correctness
// Feature: cognisync-feature-expansion, Property 16: Synthesis Source Labels
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { mergeTasks, mergeKeyPoints } from '../processor/synthesizer';
import type { ProcessorResult } from '../types/index';

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const scoreArb = fc.record({
  fleschKincaidGrade: fc.float({ min: 0, max: 20, noNaN: true }),
  fleschReadingEase: fc.float({ min: 0, max: 100, noNaN: true }),
  label: fc.constantFrom(
    'Very Easy' as const,
    'Easy' as const,
    'Fairly Easy' as const,
    'Standard' as const,
    'Fairly Difficult' as const,
    'Difficult' as const,
    'Very Confusing' as const,
  ),
});

// Generate ISO date strings for valid deadline sorting
const isoDateArb = fc
  .date({ min: new Date('2024-01-01'), max: new Date('2026-12-31') })
  .map((d) => d.toISOString().slice(0, 10)); // YYYY-MM-DD

const taskArb = fc.record({
  id: fc.uuid(),
  description: fc.string({ minLength: 1, maxLength: 80 }),
  completed: fc.boolean(),
  deadline: fc.option(isoDateArb, { nil: undefined }),
  urgency: fc.option(fc.constantFrom('urgent' as const, 'not-urgent' as const), { nil: undefined }),
  importance: fc.option(fc.constantFrom('important' as const, 'not-important' as const), { nil: undefined }),
});

const keyPointArb = fc.record({
  id: fc.uuid(),
  // Use distinct-enough text to avoid accidental dedup collisions within one result
  text: fc.string({ minLength: 5, maxLength: 80 }),
});

const processorResultArb: fc.Arbitrary<ProcessorResult> = fc.record({
  keyPoints: fc.array(keyPointArb, { minLength: 1, maxLength: 5 }),
  tasks: fc.array(taskArb, { minLength: 0, maxLength: 5 }),
  rewrittenText: fc.string({ minLength: 1, maxLength: 200 }),
  originalScore: scoreArb,
  simplifiedScore: scoreArb,
  tldr: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
});

// ─── Property 15: Synthesis Merge Correctness ────────────────────────────────

describe('Property-based tests - synthesizer', () => {

  it(
    // Feature: cognisync-feature-expansion, Property 15: Synthesis Merge Correctness
    'P15: mergeTasks sorts by deadline ascending (no-deadline tasks last); mergeKeyPoints has no duplicate text',
    () => {
      fc.assert(
        fc.property(
          fc.array(processorResultArb, { minLength: 2, maxLength: 5 }),
          (results) => {
            const fileNames = results.map((_, i) => `file${i}.pdf`);

            // ── mergeTasks: deadline ordering ──────────────────────────────
            const tasks = mergeTasks(results, fileNames);

            // Find the index of the first task without a deadline
            const firstNoDeadline = tasks.findIndex((t) => !t.deadline);

            // All tasks before firstNoDeadline must have deadlines
            if (firstNoDeadline !== -1) {
              for (let i = 0; i < firstNoDeadline; i++) {
                expect(tasks[i].deadline).toBeTruthy();
              }
              // All tasks from firstNoDeadline onward must NOT have deadlines
              for (let i = firstNoDeadline; i < tasks.length; i++) {
                expect(tasks[i].deadline == null || tasks[i].deadline === '').toBe(true);
              }
            }

            // Tasks with deadlines must be sorted ascending
            const withDeadline = tasks.filter((t) => t.deadline);
            for (let i = 0; i < withDeadline.length - 1; i++) {
              const a = new Date(withDeadline[i].deadline!).getTime();
              const b = new Date(withDeadline[i + 1].deadline!).getTime();
              expect(a).toBeLessThanOrEqual(b);
            }

            // ── mergeKeyPoints: no duplicate text ─────────────────────────
            const keyPoints = mergeKeyPoints(results, fileNames);
            const seen = new Set<string>();
            for (const kp of keyPoints) {
              const key = kp.text.toLowerCase().trim();
              expect(seen.has(key)).toBe(false);
              seen.add(key);
            }
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  // ─── Property 16: Synthesis Source Labels ──────────────────────────────────

  it(
    // Feature: cognisync-feature-expansion, Property 16: Synthesis Source Labels
    'P16: every merged task and key point has a non-empty sourceFileName that is one of the input file names',
    () => {
      fc.assert(
        fc.property(
          fc.array(processorResultArb, { minLength: 2, maxLength: 5 }),
          (results) => {
            const fileNames = results.map((_, i) => `doc${i}.pdf`);
            const fileNameSet = new Set(fileNames);

            const tasks = mergeTasks(results, fileNames);
            const keyPoints = mergeKeyPoints(results, fileNames);

            for (const task of tasks) {
              expect(task.sourceFileName).toBeTruthy();
              expect(fileNameSet.has(task.sourceFileName!)).toBe(true);
            }

            for (const kp of keyPoints) {
              expect(kp.sourceFileName).toBeTruthy();
              expect(fileNameSet.has(kp.sourceFileName!)).toBe(true);
            }
          },
        ),
        { numRuns: 100 },
      );
    },
  );

});
