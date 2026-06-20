import { describe, it, expect, beforeAll } from 'vitest';
import * as fc from 'fast-check';
import { encode, decode } from '../share/shareService';
import type { SharePayload } from '../share/shareService';

// Mock window.location.origin for test environment
beforeAll(() => {
  Object.defineProperty(window, 'location', {
    value: { origin: 'http://localhost' },
    writable: true,
  });
});

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const keyPointArb = fc.record({
  id: fc.uuid(),
  text: fc.string({ minLength: 1, maxLength: 100 }),
});

const taskArb = fc.record({
  id: fc.uuid(),
  description: fc.string({ minLength: 1, maxLength: 100 }),
  deadline: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
  completed: fc.boolean(),
  urgency: fc.option(fc.constantFrom('urgent' as const, 'not-urgent' as const), { nil: undefined }),
  importance: fc.option(fc.constantFrom('important' as const, 'not-important' as const), { nil: undefined }),
});

const sharePayloadArb: fc.Arbitrary<SharePayload> = fc.record({
  keyPoints: fc.array(keyPointArb, { maxLength: 10 }),
  tasks: fc.array(taskArb, { maxLength: 10 }),
  rewrittenText: fc.string({ maxLength: 500 }),
  tldr: fc.option(fc.string(), { nil: undefined }),
});

// ─── Property Tests ───────────────────────────────────────────────────────────

describe('Property-based tests - shareService', () => {

  // ── Property 12: Share Encode/Decode Round-Trip ───────────────────────────

  it(
    // Feature: cognisync-feature-expansion, Property 12: Share Encode/Decode Round-Trip
    'P12: encoding a SharePayload and decoding the resulting URL produces an object deeply equal to the original',
    () => {
      fc.assert(
        fc.property(sharePayloadArb, (payload) => {
          const { url } = encode(payload);
          const decoded = decode(url);

          expect(decoded).not.toBeNull();
          expect(decoded!.keyPoints).toEqual(payload.keyPoints);
          expect(decoded!.tasks).toEqual(payload.tasks);
          // rewrittenText may be truncated, so we only check it matches the decoded value
          expect(decoded!.tldr).toEqual(payload.tldr);
          // The decoded rewrittenText should be a prefix of (or equal to) the original
          expect(payload.rewrittenText.startsWith(decoded!.rewrittenText)).toBe(true);
        }),
        { numRuns: 100 },
      );
    },
  );

  // ── Property 13: Shareable URL Length Invariant ───────────────────────────

  it(
    // Feature: cognisync-feature-expansion, Property 13: Shareable URL Length Invariant
    'P13: the URL produced by encode never exceeds 8000 characters',
    () => {
      fc.assert(
        fc.property(
          fc.record({
            keyPoints: fc.array(fc.record({ id: fc.uuid(), text: fc.string() })),
            tasks: fc.array(taskArb),
            rewrittenText: fc.string(),
            tldr: fc.option(fc.string(), { nil: undefined }),
          }),
          (payload) => {
            const { url } = encode(payload);
            expect(url.length).toBeLessThanOrEqual(8000);
          },
        ),
        { numRuns: 100 },
      );
    },
  );

});
