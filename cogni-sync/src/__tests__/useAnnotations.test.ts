import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  addAnnotation,
  deleteAnnotation,
  getAnnotations,
  HIGHLIGHT_PALETTE,
} from '../hooks/useAnnotations';
import type { Annotation } from '../types/index';

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const annotationArb: fc.Arbitrary<Annotation> = fc.record({
  id: fc.uuid(),
  sessionId: fc.string({ minLength: 1 }),
  startOffset: fc.nat(),
  endOffset: fc.nat(),
  color: fc.option(fc.string(), { nil: undefined }),
  note: fc.option(fc.string(), { nil: undefined }),
  createdAt: fc.string(),
});

// ─── Property Tests ───────────────────────────────────────────────────────────

describe('Property-based tests - useAnnotations pure helpers', () => {

  // ── Property 23: Annotation Persistence Round-Trip ───────────────────────

  it(
    // Feature: cognisync-feature-expansion, Property 23: Annotation Persistence Round-Trip
    'P23: adding annotations and retrieving by sessionId returns deeply equal originals filtered by sessionId',
    () => {
      fc.assert(
        fc.property(
          fc.array(annotationArb, { minLength: 1, maxLength: 10 }),
          fc.string({ minLength: 1 }),
          (annotations, targetSessionId) => {
            // Build a list by adding all annotations to an empty list
            let store: Annotation[] = [];
            for (const ann of annotations) {
              store = addAnnotation(store, ann);
            }

            // Retrieve by sessionId
            const retrieved = getAnnotations(store, targetSessionId);

            // Expected: originals filtered by sessionId
            const expected = annotations.filter(a => a.sessionId === targetSessionId);

            expect(retrieved).toEqual(expected);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  // ── Property 24: Annotation Delete Removes Entry ─────────────────────────

  it(
    // Feature: cognisync-feature-expansion, Property 24: Annotation Delete Removes Entry
    'P24: deleting an annotation by id removes it from the list',
    () => {
      fc.assert(
        fc.property(
          fc.array(annotationArb, { minLength: 1, maxLength: 10 }),
          fc.nat(),
          (annotations, indexSeed) => {
            const targetIndex = indexSeed % annotations.length;
            const targetId = annotations[targetIndex].id;

            const after = deleteAnnotation(annotations, targetId);

            expect(after.find(a => a.id === targetId)).toBeUndefined();
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  // ── Property 25: Highlight Color Palette Size ─────────────────────────────

  it(
    // Feature: cognisync-feature-expansion, Property 25: Highlight Color Palette Size
    'P25: HIGHLIGHT_PALETTE contains at least 3 distinct valid hex colors',
    () => {
      fc.assert(
        fc.property(
          fc.constantFrom(0, 1, 2),
          (index) => {
            // Palette must have at least 3 colors
            expect(HIGHLIGHT_PALETTE.length).toBeGreaterThanOrEqual(3);

            // All colors must be distinct
            const unique = new Set(HIGHLIGHT_PALETTE);
            expect(unique.size).toBe(HIGHLIGHT_PALETTE.length);

            // Each indexed color must be a valid hex color string
            const color = HIGHLIGHT_PALETTE[index];
            expect(color).toMatch(/^#[0-9a-fA-F]{3,8}$/);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

});
