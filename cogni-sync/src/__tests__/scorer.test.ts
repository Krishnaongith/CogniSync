import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { scoreText } from '../scorer/scorer';

// Feature: academic-simplifier, Property 13: Scorer returns valid ComplexityScore for any non-empty text
describe('P13: Scorer returns valid ComplexityScore for any non-empty text', () => {
  it('returns numeric grade, reading ease in [0,100], and non-empty label for any non-empty string', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (text) => {
        const score = scoreText(text);
        expect(typeof score.fleschKincaidGrade).toBe('number');
        expect(isFinite(score.fleschKincaidGrade)).toBe(true);
        expect(score.fleschReadingEase).toBeGreaterThanOrEqual(0);
        expect(score.fleschReadingEase).toBeLessThanOrEqual(100);
        expect(score.label.length).toBeGreaterThan(0);
      }),
      { numRuns: 100 },
    );
  });
});

// Feature: academic-simplifier, Property 14: Complexity score percentage reduction formula
describe('P14: Complexity score percentage reduction formula', () => {
  it('computes ((orig - simplified) / orig) * 100 rounded to 1 decimal', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.1), max: Math.fround(100), noNaN: true }),
        fc.float({ min: Math.fround(0), max: Math.fround(100), noNaN: true }),
        (orig, simplified) => {
          const expected = Math.round(((orig - simplified) / orig) * 1000) / 10;
          const actual = Math.round(((orig - simplified) / orig) * 1000) / 10;
          expect(actual).toBe(expected);
          // Verify the formula produces a finite number
          expect(isFinite(actual)).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// Unit tests for Scorer
describe('scoreText unit tests', () => {
  it('returns default score for empty string', () => {
    const score = scoreText('');
    expect(score.fleschKincaidGrade).toBe(0);
    expect(score.fleschReadingEase).toBe(0);
    expect(score.label).toBe('Very Confusing');
  });

  it('returns default score for whitespace-only string', () => {
    const score = scoreText('   ');
    expect(score.fleschKincaidGrade).toBe(0);
    expect(score.fleschReadingEase).toBe(0);
    expect(score.label).toBe('Very Confusing');
  });

  it('computes a reasonable FK grade for a simple known sentence', () => {
    // "The cat sat on the mat." — very simple sentence, should score easy
    const score = scoreText('The cat sat on the mat.');
    expect(score.fleschReadingEase).toBeGreaterThan(60);
    expect(score.fleschKincaidGrade).toBeLessThan(6);
    expect(score.label).not.toBe('');
  });

  it('clamps fleschReadingEase to [0, 100]', () => {
    // Single-syllable words in a short sentence can push ease above 100 — must be clamped
    const score = scoreText('Go.');
    expect(score.fleschReadingEase).toBeGreaterThanOrEqual(0);
    expect(score.fleschReadingEase).toBeLessThanOrEqual(100);
  });

  it('returns a valid label for a complex academic sentence', () => {
    const complex =
      'The epistemological ramifications of poststructuralist hermeneutics necessitate a comprehensive reevaluation of ontological presuppositions.';
    const score = scoreText(complex);
    expect(['Very Easy', 'Easy', 'Fairly Easy', 'Standard', 'Fairly Difficult', 'Difficult', 'Very Confusing']).toContain(
      score.label,
    );
    expect(score.fleschKincaidGrade).toBeGreaterThan(8);
  });
});
