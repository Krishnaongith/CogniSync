// Feature: cognisync-feature-expansion, Property 20: TTS Profile Configuration
// Feature: cognisync-feature-expansion, Property 21: TTS Key Points Read in Order
// Feature: cognisync-feature-expansion, Property 22: TTS Stop Returns to Idle

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getTTSConfig, getKeyPointUtterances, getTTSStatusAfterStop } from '../hooks/useTTS';
import type { AdaptationProfile } from '../types';

// **Validates: Requirements 9.7, 9.8**
describe('Property 20: TTS Profile Configuration', () => {
  it('returns correct rate and pitch for each adaptation profile', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<AdaptationProfile>('default', 'adhd', 'dyslexia', 'anxiety'),
        (profile) => {
          const config = getTTSConfig(profile);
          if (profile === 'dyslexia') {
            expect(config.rate).toBe(0.85);
            expect(config.pitch).toBe(1.0);
          } else if (profile === 'anxiety') {
            expect(config.rate).toBe(1.0);
            expect(config.pitch).toBe(0.9);
          } else {
            expect(config.rate).toBe(1.0);
            expect(config.pitch).toBe(1.0);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

// **Validates: Requirements 9.3**
describe('Property 21: TTS Key Points Read in Order', () => {
  it('returns key point utterances in the same order as input', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 10 }),
        (keyPoints) => {
          const utterances = getKeyPointUtterances(keyPoints);
          expect(utterances).toHaveLength(keyPoints.length);
          for (let i = 0; i < keyPoints.length; i++) {
            expect(utterances[i]).toBe(keyPoints[i]);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

// **Validates: Requirements 9.6**
describe('Property 22: TTS Stop Returns to Idle', () => {
  it('always returns idle status after stop regardless of current playback state', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<'playing' | 'paused'>('playing', 'paused'),
        (playbackState) => {
          const result = getTTSStatusAfterStop(playbackState);
          expect(result).toBe('idle');
        },
      ),
      { numRuns: 100 },
    );
  });
});
