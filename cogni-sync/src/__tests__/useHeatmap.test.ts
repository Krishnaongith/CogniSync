// Feature: cognisync-feature-expansion, Property 10: Heatmap Sentence Count Matches Input
// Feature: cognisync-feature-expansion, Property 11: Heatmap Color Monotonicity

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { computeHeatmap, scoreToColor } from '../hooks/useHeatmap';
import type { AdaptationProfile } from '../types';

// Helper: split text the same way computeHeatmap does
function splitSentences(text: string): string[] {
  return text.split(/[.!?]/).filter(s => s.trim().length > 0);
}

// Helper: parse a hex color channel
function parseHex(hex: string, offset: number): number {
  return parseInt(hex.slice(offset, offset + 2), 16);
}

// **Validates: Requirements 4.2**
describe('Property 10: Heatmap Sentence Count Matches Input', () => {
  it('returns one SentenceScore per non-empty sentence segment', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10 }).filter(text => splitSentences(text).length > 0),
        (text) => {
          const result = computeHeatmap(text, 'default');
          const expected = splitSentences(text).length;
          expect(result.length).toBe(expected);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// **Validates: Requirements 4.3, 4.6**
describe('Property 11: Heatmap Color Monotonicity', () => {
  const nonAnxietyProfiles: AdaptationProfile[] = ['default', 'adhd', 'dyslexia'];

  it('for non-anxiety profiles: higher score → higher green channel and lower red channel', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.float({ min: 0, max: 100 }),
          fc.float({ min: 0, max: 100 }),
        ).filter(([a, b]) => a > b + 1),
        fc.constantFrom(...nonAnxietyProfiles),
        ([a, b], profile) => {
          const colorA = scoreToColor(a, profile);
          const colorB = scoreToColor(b, profile);

          const greenA = parseHex(colorA, 3);
          const greenB = parseHex(colorB, 3);
          const redA = parseHex(colorA, 1);
          const redB = parseHex(colorB, 1);

          // Higher score → greener (higher green channel)
          expect(greenA).toBeGreaterThanOrEqual(greenB);
          // Higher score → less red (lower red channel)
          expect(redA).toBeLessThanOrEqual(redB);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('for anxiety profile: higher score → higher blue channel and lower red channel', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.float({ min: 0, max: 100 }),
          fc.float({ min: 0, max: 100 }),
        ).filter(([a, b]) => a > b + 1),
        ([a, b]) => {
          const colorA = scoreToColor(a, 'anxiety');
          const colorB = scoreToColor(b, 'anxiety');

          const blueA = parseHex(colorA, 5);
          const blueB = parseHex(colorB, 5);
          const redA = parseHex(colorA, 1);
          const redB = parseHex(colorB, 1);

          // Higher score → bluer (higher blue channel)
          expect(blueA).toBeGreaterThanOrEqual(blueB);
          // Higher score → less orange/red (lower red channel)
          expect(redA).toBeLessThanOrEqual(redB);
        },
      ),
      { numRuns: 100 },
    );
  });
});
