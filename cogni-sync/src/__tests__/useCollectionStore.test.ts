import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  validateCollectionName,
  isNameDuplicate,
  sortCollectionsByUpdatedAt,
  getSessionsForCollection,
} from '../hooks/useCollectionStore';
import type { Collection, Session, ProcessorResult, AdaptationProfile, ComplexityLevel } from '../types/index';

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const collectionArb: fc.Arbitrary<Collection> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }).filter((n) => n.trim().length > 0),
  createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }).map((d) => d.toISOString()),
  updatedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }).map((d) => d.toISOString()),
});

const processorResultArb: fc.Arbitrary<ProcessorResult> = fc.record({
  keyPoints: fc.array(
    fc.record({ id: fc.uuid(), text: fc.string({ minLength: 1, maxLength: 50 }) }),
    { minLength: 1, maxLength: 3 },
  ),
  tasks: fc.array(
    fc.record({
      id: fc.uuid(),
      description: fc.string({ minLength: 1, maxLength: 50 }),
      completed: fc.boolean(),
      deadline: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
      urgency: fc.option(fc.constantFrom('urgent' as const, 'not-urgent' as const), { nil: undefined }),
      importance: fc.option(fc.constantFrom('important' as const, 'not-important' as const), { nil: undefined }),
    }),
    { minLength: 0, maxLength: 3 },
  ),
  rewrittenText: fc.string({ minLength: 1, maxLength: 200 }),
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

const adaptationProfileArb: fc.Arbitrary<AdaptationProfile> = fc.constantFrom(
  'default' as const, 'adhd' as const, 'dyslexia' as const, 'anxiety' as const,
);

const complexityLevelArb: fc.Arbitrary<ComplexityLevel> = fc.constantFrom(
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
) as fc.Arbitrary<ComplexityLevel>;

function sessionArb(collectionIdArb?: fc.Arbitrary<string | null | undefined>): fc.Arbitrary<Session> {
  const cidArb = collectionIdArb ?? fc.option(fc.uuid(), { nil: null });
  return fc.record({
    id: fc.uuid(),
    savedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }).map((d) => d.toISOString()),
    fileName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
    rawText: fc.string({ minLength: 1, maxLength: 200 }),
    result: processorResultArb,
    adaptationProfile: adaptationProfileArb,
    complexityLevel: complexityLevelArb,
    taskCompletions: fc.dictionary(fc.uuid(), fc.boolean()),
    annotations: fc.constant([]),
    collectionId: cidArb,
  });
}

// ─── Property Tests ───────────────────────────────────────────────────────────

describe('Property-based tests - useCollectionStore', () => {

  // Feature: session-collections, Property 1: Collection creation produces a valid record
  it('P1: creating a collection from a valid name produces a valid record', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }).filter((n) => n.trim().length > 0),
        (name) => {
          const now = new Date().toISOString();
          const collection: Collection = {
            id: crypto.randomUUID(),
            name: name.trim(),
            createdAt: now,
            updatedAt: now,
          };

          expect(collection.id.length).toBeGreaterThan(0);
          expect(collection.name).toBe(name.trim());
          expect(collection.createdAt).toBe(collection.updatedAt);
          expect(() => new Date(collection.createdAt).toISOString()).not.toThrow();
          expect(new Date(collection.createdAt).toISOString()).toBe(collection.createdAt);
        },
      ),
      { numRuns: 100 },
    );
  });

  // Feature: session-collections, Property 2: Whitespace-only names are rejected
  it('P2: whitespace-only names are rejected by validateCollectionName', () => {
    fc.assert(
      fc.property(
        fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r', '\u00A0')),
        (wsName) => {
          const result = validateCollectionName(wsName);
          expect(result).not.toBeNull();
          expect(typeof result).toBe('string');
        },
      ),
      { numRuns: 100 },
    );
  });

  // Feature: session-collections, Property 3: Case-insensitive duplicate name detection
  it('P3: isNameDuplicate detects case variations as duplicates', () => {
    fc.assert(
      fc.property(
        collectionArb,
        fc.constantFrom('upper', 'lower', 'mixed') as fc.Arbitrary<string>,
        (collection, caseType) => {
          const name = collection.name;
          let variation: string;
          if (caseType === 'upper') variation = name.toUpperCase();
          else if (caseType === 'lower') variation = name.toLowerCase();
          else variation = name.split('').map((c, i) => (i % 2 === 0 ? c.toUpperCase() : c.toLowerCase())).join('');

          const existing = [collection];

          // Without excludeId, should detect duplicate
          expect(isNameDuplicate(variation, existing)).toBe(true);

          // With excludeId matching the collection's own id, should NOT detect duplicate
          expect(isNameDuplicate(variation, existing, collection.id)).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  // Feature: session-collections, Property 4: Rename preserves identity and updates timestamp
  it('P4: rename preserves id and createdAt, updates name and updatedAt', () => {
    fc.assert(
      fc.property(
        collectionArb,
        fc.string({ minLength: 1, maxLength: 100 }).filter((n) => n.trim().length > 0),
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
        (collection, newName, renameDate) => {
          // Ensure renameDate is after the collection's updatedAt
          const originalUpdatedAt = new Date(collection.updatedAt).getTime();
          const newUpdatedAt = new Date(Math.max(renameDate.getTime(), originalUpdatedAt)).toISOString();

          const renamed: Collection = {
            ...collection,
            name: newName.trim(),
            updatedAt: newUpdatedAt,
          };

          expect(renamed.id).toBe(collection.id);
          expect(renamed.createdAt).toBe(collection.createdAt);
          expect(renamed.name).toBe(newName.trim());
          expect(new Date(renamed.updatedAt).getTime()).toBeGreaterThanOrEqual(originalUpdatedAt);
        },
      ),
      { numRuns: 100 },
    );
  });

  // Feature: session-collections, Property 5: Collection deletion removes only the target
  it('P5: deleting a collection removes only the target, others unchanged', () => {
    fc.assert(
      fc.property(
        fc.array(collectionArb, { minLength: 1, maxLength: 20 }),
        fc.nat(),
        (collections, indexSeed) => {
          const targetIndex = indexSeed % collections.length;
          const targetId = collections[targetIndex].id;

          const after = collections.filter((c) => c.id !== targetId);

          expect(after.find((c) => c.id === targetId)).toBeUndefined();
          expect(after.length).toBe(collections.length - 1);

          // All remaining collections are unchanged
          for (const remaining of after) {
            const original = collections.find((c) => c.id === remaining.id);
            expect(remaining).toEqual(original);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  // Feature: session-collections, Property 6: Deletion cascade nullifies session collectionIds
  it('P6: cascade sets matching collectionIds to null, leaves others unchanged', () => {
    fc.assert(
      fc.property(
        fc.array(sessionArb(), { minLength: 1, maxLength: 20 }),
        fc.uuid(),
        (sessions, deletedCollectionId) => {
          const cascaded = sessions.map((s) => {
            if (s.collectionId === deletedCollectionId) {
              return { ...s, collectionId: null };
            }
            return s;
          });

          for (let i = 0; i < sessions.length; i++) {
            if (sessions[i].collectionId === deletedCollectionId) {
              expect(cascaded[i].collectionId).toBeNull();
            } else {
              expect(cascaded[i].collectionId).toBe(sessions[i].collectionId);
            }
            // All other fields unchanged
            const { collectionId: _a, ...originalRest } = sessions[i];
            const { collectionId: _b, ...cascadedRest } = cascaded[i];
            expect(cascadedRest).toEqual(originalRest);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  // Feature: session-collections, Property 7: Session collectionId assignment
  it('P7: updating collectionId changes only that field', () => {
    fc.assert(
      fc.property(
        sessionArb(),
        fc.option(fc.uuid(), { nil: null }),
        (session, targetCollectionId) => {
          const updated = { ...session, collectionId: targetCollectionId };

          expect(updated.collectionId).toBe(targetCollectionId);

          // All other fields unchanged
          const { collectionId: _a, ...originalRest } = session;
          const { collectionId: _b, ...updatedRest } = updated;
          expect(updatedRest).toEqual(originalRest);
        },
      ),
      { numRuns: 100 },
    );
  });

  // Feature: session-collections, Property 8: Collections sorted by updatedAt descending
  it('P8: sortCollectionsByUpdatedAt returns descending order', () => {
    fc.assert(
      fc.property(
        fc.array(collectionArb, { minLength: 2, maxLength: 20 }),
        (collections) => {
          const sorted = sortCollectionsByUpdatedAt(collections);

          for (let i = 0; i < sorted.length - 1; i++) {
            const a = new Date(sorted[i].updatedAt).getTime();
            const b = new Date(sorted[i + 1].updatedAt).getTime();
            expect(a).toBeGreaterThanOrEqual(b);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  // Feature: session-collections, Property 9: getSessionsForCollection returns correct filtered and sorted results
  it('P9: getSessionsForCollection filters and sorts correctly', () => {
    fc.assert(
      fc.property(
        fc.array(sessionArb(), { minLength: 1, maxLength: 20 }),
        fc.uuid(),
        (sessions, collectionId) => {
          const result = getSessionsForCollection(sessions, collectionId);

          // All returned sessions have the matching collectionId
          for (const s of result) {
            expect(s.collectionId).toBe(collectionId);
          }

          // Count matches expected
          const expectedCount = sessions.filter((s) => s.collectionId === collectionId).length;
          expect(result.length).toBe(expectedCount);

          // Sorted by savedAt descending
          for (let i = 0; i < result.length - 1; i++) {
            const a = new Date(result[i].savedAt).getTime();
            const b = new Date(result[i + 1].savedAt).getTime();
            expect(a).toBeGreaterThanOrEqual(b);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

});
