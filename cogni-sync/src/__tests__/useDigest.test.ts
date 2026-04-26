import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { computeDigest } from '../hooks/useDigest';
import type { Session, ProcessorResult, AdaptationProfile, ComplexityLevel, Annotation } from '../types/index';

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const adaptationProfileArb: fc.Arbitrary<AdaptationProfile> = fc.constantFrom(
  'default' as const,
  'adhd' as const,
  'dyslexia' as const,
  'anxiety' as const,
);

const complexityLevelArb: fc.Arbitrary<ComplexityLevel> = fc.constantFrom(
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
) as fc.Arbitrary<ComplexityLevel>;

const annotationArb: fc.Arbitrary<Annotation> = fc.record({
  id: fc.uuid(),
  sessionId: fc.uuid(),
  startOffset: fc.nat({ max: 1000 }),
  endOffset: fc.nat({ max: 2000 }),
  color: fc.option(fc.hexaString({ minLength: 6, maxLength: 6 }).map((h) => `#${h}`), { nil: undefined }),
  note: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
  createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }).map((d) => d.toISOString()),
});

/** Generate an ISO date string offset by `offsetMs` from a base timestamp */
function isoDateOffset(baseMs: number, offsetMs: number): string {
  return new Date(baseMs + offsetMs).toISOString();
}

const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

/**
 * Task arbitrary with a deadline that is either:
 * - inside the 7-day window [now, now + 7days]
 * - before now (past)
 * - after the 7-day window (future)
 * - undefined (no deadline)
 */
function taskWithVariousDeadlinesArb(now: number) {
  return fc.oneof(
    // In window: deadline between now and now+7days (inclusive)
    fc.integer({ min: 0, max: sevenDaysMs }).map((offset) => ({
      id: fc.sample(fc.uuid(), 1)[0],
      description: 'task in window',
      completed: false,
      deadline: isoDateOffset(now, offset),
    })),
    // Before now (past)
    fc.integer({ min: 1, max: sevenDaysMs }).map((offset) => ({
      id: fc.sample(fc.uuid(), 1)[0],
      description: 'task in past',
      completed: false,
      deadline: isoDateOffset(now, -offset),
    })),
    // After window
    fc.integer({ min: sevenDaysMs + 1, max: sevenDaysMs * 4 }).map((offset) => ({
      id: fc.sample(fc.uuid(), 1)[0],
      description: 'task in far future',
      completed: false,
      deadline: isoDateOffset(now, offset),
    })),
    // No deadline
    fc.constant({
      id: fc.sample(fc.uuid(), 1)[0],
      description: 'task no deadline',
      completed: false,
      deadline: undefined,
    }),
  );
}

function processorResultWithTasksArb(now: number): fc.Arbitrary<ProcessorResult> {
  return fc.record({
    keyPoints: fc.array(
      fc.record({ id: fc.uuid(), text: fc.string({ minLength: 1, maxLength: 50 }) }),
      { minLength: 0, maxLength: 3 },
    ),
    tasks: fc.array(taskWithVariousDeadlinesArb(now), { minLength: 1, maxLength: 5 }),
    rewrittenText: fc.string({ minLength: 1, maxLength: 100 }),
    originalScore: fc.record({
      fleschKincaidGrade: fc.float({ min: 0, max: 20, noNaN: true }),
      fleschReadingEase: fc.float({ min: 0, max: 100, noNaN: true }),
      label: fc.constantFrom(
        'Very Easy' as const, 'Easy' as const, 'Fairly Easy' as const,
        'Standard' as const, 'Fairly Difficult' as const, 'Difficult' as const, 'Very Confusing' as const,
      ),
    }),
    simplifiedScore: fc.record({
      fleschKincaidGrade: fc.float({ min: 0, max: 20, noNaN: true }),
      fleschReadingEase: fc.float({ min: 0, max: 100, noNaN: true }),
      label: fc.constantFrom(
        'Very Easy' as const, 'Easy' as const, 'Fairly Easy' as const,
        'Standard' as const, 'Fairly Difficult' as const, 'Difficult' as const, 'Very Confusing' as const,
      ),
    }),
    tldr: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
  });
}

function sessionWithTasksArb(now: number): fc.Arbitrary<Session> {
  return fc.record({
    id: fc.uuid(),
    savedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }).map((d) => d.toISOString()),
    fileName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
    rawText: fc.string({ minLength: 1, maxLength: 200 }),
    result: processorResultWithTasksArb(now),
    adaptationProfile: adaptationProfileArb,
    complexityLevel: complexityLevelArb,
    taskCompletions: fc.dictionary(fc.uuid(), fc.boolean()),
    annotations: fc.array(annotationArb, { minLength: 0, maxLength: 2 }),
  });
}

// ─── Property Tests ───────────────────────────────────────────────────────────

describe('Property-based tests — computeDigest', () => {

  // ── Property 26: Digest Filters to 7-Day Window and Sorts Ascending ──────

  it(
    // Feature: cognisync-feature-expansion, Property 26: Digest Filters to 7-Day Window and Sorts Ascending
    'P26: computeDigest returns only tasks within [now, now+7days] sorted ascending by deadline',
    () => {
      const now = Date.now();

      fc.assert(
        fc.property(
          fc.array(sessionWithTasksArb(now), { minLength: 1, maxLength: 5 }),
          (sessions) => {
            const { tasks } = computeDigest(sessions, now);

            const cutoff = now + sevenDaysMs;

            // All returned tasks must have deadlines within [now, cutoff]
            for (const task of tasks) {
              expect(task.deadline).toBeDefined();
              const deadlineMs = new Date(task.deadline!).getTime();
              expect(deadlineMs).toBeGreaterThanOrEqual(now);
              expect(deadlineMs).toBeLessThanOrEqual(cutoff);
            }

            // Tasks must be sorted ascending by deadline
            for (let i = 0; i < tasks.length - 1; i++) {
              const a = new Date(tasks[i].deadline!).getTime();
              const b = new Date(tasks[i + 1].deadline!).getTime();
              expect(a).toBeLessThanOrEqual(b);
            }
          },
        ),
        { numRuns: 100 },
      );
    },
  );

});
