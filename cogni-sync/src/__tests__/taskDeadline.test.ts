import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { applyDeadlineUpdate } from '../context/AppContext';
import { validateDeadline } from '../calendar/deadlineValidator';
import type { Task } from '../types/index';

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const taskArb: fc.Arbitrary<Task> = fc.record({
  id: fc.uuid(),
  description: fc.string({ minLength: 1, maxLength: 100 }),
  deadline: fc.option(fc.string(), { nil: undefined }),
  completed: fc.boolean(),
  urgency: fc.option(fc.constantFrom('urgent' as const, 'not-urgent' as const), { nil: undefined }),
  importance: fc.option(fc.constantFrom('important' as const, 'not-important' as const), { nil: undefined }),
});

const validDateArb: fc.Arbitrary<string> = fc
  .date({ min: new Date('2020-01-01'), max: new Date('2035-12-31') })
  .map((d) => d.toISOString().slice(0, 10));

const invalidDateArb: fc.Arbitrary<string> = fc
  .stringMatching(/^[a-z]{5,20}$/)
  .filter((s) => isNaN(Date.parse(s)));

// ─── Property Tests ───────────────────────────────────────────────────────────

describe('Property-based tests — task deadline', () => {

  // ── Property 8: Deadline Mutation Correctness ─────────────────────────────

  it(
    // Feature: cognisync-feature-expansion, Property 8: Deadline Mutation Correctness
    'P8: updating a task deadline sets exactly that value; clearing sets undefined',
    () => {
      fc.assert(
        fc.property(
          fc.array(taskArb, { minLength: 1, maxLength: 10 }),
          fc.integer({ min: 0, max: 9 }),
          validDateArb,
          (tasks, indexRaw, newDeadline) => {
            const index = indexRaw % tasks.length;
            const targetTask = tasks[index];

            // Setting a valid deadline
            const updated = applyDeadlineUpdate(tasks, targetTask.id, newDeadline);
            const mutated = updated.find((t) => t.id === targetTask.id)!;
            expect(mutated.deadline).toBe(newDeadline);

            // Other tasks are unchanged
            updated.forEach((t) => {
              if (t.id !== targetTask.id) {
                const original = tasks.find((o) => o.id === t.id)!;
                expect(t.deadline).toBe(original.deadline);
              }
            });

            // Clearing the deadline sets it to undefined
            const cleared = applyDeadlineUpdate(tasks, targetTask.id, undefined);
            const clearedTask = cleared.find((t) => t.id === targetTask.id)!;
            expect(clearedTask.deadline).toBeUndefined();
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  // ── Property 9: Deadline Validation Rejects Invalid Formats ──────────────

  it(
    // Feature: cognisync-feature-expansion, Property 9: Deadline Validation Rejects Invalid Formats
    'P9: validateDeadline returns valid:false for non-date strings and valid:true for valid dates',
    () => {
      // Invalid strings → valid: false
      fc.assert(
        fc.property(invalidDateArb, (invalidStr) => {
          const result = validateDeadline(invalidStr);
          expect(result.valid).toBe(false);
          expect(result.error).toBe('Invalid date format');
        }),
        { numRuns: 100 },
      );

      // Valid date strings → valid: true
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2020-01-01'), max: new Date('2035-12-31') })
            .map((d) => d.toISOString().slice(0, 10)),
          (validDate) => {
            const result = validateDeadline(validDate);
            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();
          },
        ),
        { numRuns: 100 },
      );
    },
  );

});
