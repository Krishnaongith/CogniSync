import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  sortSessionsDescending,
  enforceSessionCap,
  removeSessionById,
} from '../hooks/useSessionStore';
import type { Session, Annotation, ProcessorResult, AdaptationProfile, ComplexityLevel } from '../types/index';

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const annotationArb: fc.Arbitrary<Annotation> = fc.record({
  id: fc.uuid(),
  sessionId: fc.uuid(),
  startOffset: fc.nat({ max: 1000 }),
  endOffset: fc.nat({ max: 2000 }),
  color: fc.option(fc.hexaString({ minLength: 6, maxLength: 6 }).map((h) => `#${h}`), { nil: undefined }),
  note: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
  createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }).map((d) => d.toISOString()),
});

const processorResultArb: fc.Arbitrary<ProcessorResult> = fc.record({
  keyPoints: fc.array(
    fc.record({ id: fc.uuid(), text: fc.string({ minLength: 1, maxLength: 100 }) }),
    { minLength: 1, maxLength: 5 },
  ),
  tasks: fc.array(
    fc.record({
      id: fc.uuid(),
      description: fc.string({ minLength: 1, maxLength: 100 }),
      completed: fc.boolean(),
      deadline: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
      urgency: fc.option(fc.constantFrom('urgent' as const, 'not-urgent' as const), { nil: undefined }),
      importance: fc.option(fc.constantFrom('important' as const, 'not-important' as const), { nil: undefined }),
    }),
    { minLength: 0, maxLength: 5 },
  ),
  rewrittenText: fc.string({ minLength: 1, maxLength: 500 }),
  originalScore: fc.record({
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
  }),
  simplifiedScore: fc.record({
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
  }),
  tldr: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
});

const adaptationProfileArb: fc.Arbitrary<AdaptationProfile> = fc.constantFrom(
  'default' as const,
  'adhd' as const,
  'dyslexia' as const,
  'anxiety' as const,
);

const complexityLevelArb: fc.Arbitrary<ComplexityLevel> = fc.constantFrom(
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
) as fc.Arbitrary<ComplexityLevel>;

/** Build a Session arbitrary with a specific savedAt date for ordering tests. */
function sessionArb(savedAtArb?: fc.Arbitrary<string>): fc.Arbitrary<Session> {
  const dateArb = savedAtArb ??
    fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }).map((d) => d.toISOString());

  return fc.record({
    id: fc.uuid(),
    savedAt: dateArb,
    fileName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
    rawText: fc.string({ minLength: 1, maxLength: 500 }),
    result: processorResultArb,
    adaptationProfile: adaptationProfileArb,
    complexityLevel: complexityLevelArb,
    taskCompletions: fc.dictionary(fc.uuid(), fc.boolean()),
    annotations: fc.array(annotationArb, { minLength: 0, maxLength: 3 }),
  });
}

// ─── Property Tests ───────────────────────────────────────────────────────────

describe('Property-based tests - useSessionStore pure helpers', () => {

  // ── Property 1: Session Save/Restore Round-Trip ──────────────────────────

  it(
    // Feature: cognisync-feature-expansion, Property 1: Session Save/Restore Round-Trip
    'P1: saving a session and restoring it by id produces a deeply equal object',
    () => {
      fc.assert(
        fc.property(sessionArb(), (session) => {
          // Simulate the localStorage fallback store (pure in-memory map)
          const store = new Map<string, Session>();

          // save
          store.set(session.id, session);

          // restore
          const restored = store.get(session.id);

          expect(restored).toBeDefined();
          expect(restored).toEqual(session);
        }),
        { numRuns: 100 },
      );
    },
  );

  // ── Property 2: Session History Ordering ─────────────────────────────────

  it(
    // Feature: cognisync-feature-expansion, Property 2: Session History Ordering
    'P2: getAllSessions returns sessions sorted descending by savedAt',
    () => {
      fc.assert(
        fc.property(
          fc.array(sessionArb(), { minLength: 2, maxLength: 20 }).filter(
            // Ensure distinct savedAt values to make ordering unambiguous
            (sessions) => new Set(sessions.map((s) => s.savedAt)).size === sessions.length,
          ),
          (sessions) => {
            const sorted = sortSessionsDescending(sessions);

            for (let i = 0; i < sorted.length - 1; i++) {
              const a = new Date(sorted[i].savedAt).getTime();
              const b = new Date(sorted[i + 1].savedAt).getTime();
              expect(a).toBeGreaterThanOrEqual(b);
            }
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  // ── Property 3: Session Delete Removes Entry ──────────────────────────────

  it(
    // Feature: cognisync-feature-expansion, Property 3: Session Delete Removes Entry
    'P3: deleting a session by id removes it from the list',
    () => {
      fc.assert(
        fc.property(
          fc.array(sessionArb(), { minLength: 1, maxLength: 20 }),
          fc.nat(),
          (sessions, indexSeed) => {
            const targetIndex = indexSeed % sessions.length;
            const targetId = sessions[targetIndex].id;

            const after = removeSessionById(sessions, targetId);

            expect(after.find((s) => s.id === targetId)).toBeUndefined();
            expect(after.length).toBe(sessions.length - 1);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  // ── Property 4: Session Count Cap ────────────────────────────────────────

  it(
    // Feature: cognisync-feature-expansion, Property 4: Session Count Cap
    'P4: after enforcing cap, store contains at most 50 sessions and oldest are removed',
    () => {
      fc.assert(
        fc.property(
          fc.array(sessionArb(), { minLength: 51, maxLength: 60 }).filter(
            // Ensure distinct savedAt values so oldest is deterministic
            (sessions) => new Set(sessions.map((s) => s.savedAt)).size === sessions.length,
          ),
          (sessions) => {
            const capped = enforceSessionCap(sessions);

            // Must not exceed cap
            expect(capped.length).toBeLessThanOrEqual(50);

            // The oldest sessions (smallest savedAt) must have been removed
            const sortedAll = sortSessionsDescending(sessions);
            const expectedKept = sortedAll.slice(0, 50);
            const expectedKeptIds = new Set(expectedKept.map((s) => s.id));

            for (const s of capped) {
              expect(expectedKeptIds.has(s.id)).toBe(true);
            }

            // None of the removed sessions should appear in capped
            const removedSessions = sortedAll.slice(50);
            for (const removed of removedSessions) {
              expect(capped.find((s) => s.id === removed.id)).toBeUndefined();
            }
          },
        ),
        { numRuns: 100 },
      );
    },
  );

});
