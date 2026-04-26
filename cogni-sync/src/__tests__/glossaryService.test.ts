// Feature: cognisync-feature-expansion, Property 18: Glossary Term Count Cap
// Feature: cognisync-feature-expansion, Property 19: Glossary Card Content Completeness
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { capGlossaryTerms, isCompleteJargonTerm } from '../glossary/glossaryService';
import type { JargonTerm } from '../types';

// Strings with at least one non-whitespace character (so trim() is never empty)
const nonEmptyStringArb = fc.string({ minLength: 1 }).filter(s => s.trim().length > 0);

const jargonTermArb = fc.record({
  term: nonEmptyStringArb,
  definition: nonEmptyStringArb,
  exampleSentence: nonEmptyStringArb,
});

describe('Property 18: Glossary Term Count Cap', () => {
  it('capGlossaryTerms returns at most 20 terms for any input', () => {
    // **Validates: Requirements 8.1**
    fc.assert(
      fc.property(
        fc.array(jargonTermArb, { minLength: 0, maxLength: 30 }),
        (terms: JargonTerm[]) => {
          const result = capGlossaryTerms({ terms });
          expect(result.terms.length).toBeLessThanOrEqual(20);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('capGlossaryTerms preserves terms when count is <= 20', () => {
    fc.assert(
      fc.property(
        fc.array(jargonTermArb, { minLength: 0, maxLength: 20 }),
        (terms: JargonTerm[]) => {
          const result = capGlossaryTerms({ terms });
          expect(result.terms.length).toBe(terms.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 19: Glossary Card Content Completeness', () => {
  it('isCompleteJargonTerm returns true for terms with all non-empty fields', () => {
    // **Validates: Requirements 8.3**
    fc.assert(
      fc.property(
        jargonTermArb,
        (term: JargonTerm) => {
          expect(isCompleteJargonTerm(term)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('isCompleteJargonTerm returns false when term field is empty or whitespace', () => {
    fc.assert(
      fc.property(
        fc.record({
          term: fc.oneof(fc.constant(''), fc.string().map(s => '   ' + s.replace(/\S/g, ' '))),
          definition: fc.string({ minLength: 1 }),
          exampleSentence: fc.string({ minLength: 1 }),
        }),
        (term: JargonTerm) => {
          expect(isCompleteJargonTerm(term)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('isCompleteJargonTerm returns false when definition field is empty or whitespace', () => {
    fc.assert(
      fc.property(
        fc.record({
          term: fc.string({ minLength: 1 }),
          definition: fc.oneof(fc.constant(''), fc.string().map(s => '   ' + s.replace(/\S/g, ' '))),
          exampleSentence: fc.string({ minLength: 1 }),
        }),
        (term: JargonTerm) => {
          expect(isCompleteJargonTerm(term)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('isCompleteJargonTerm returns false when exampleSentence field is empty or whitespace', () => {
    fc.assert(
      fc.property(
        fc.record({
          term: fc.string({ minLength: 1 }),
          definition: fc.string({ minLength: 1 }),
          exampleSentence: fc.oneof(fc.constant(''), fc.string().map(s => '   ' + s.replace(/\S/g, ' '))),
        }),
        (term: JargonTerm) => {
          expect(isCompleteJargonTerm(term)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
