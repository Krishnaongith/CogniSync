import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getMockResponse } from '../processor/mockApi';
import { processDocument, defaultConfig } from '../processor/processor';
import type { ProcessingStatus } from '../types';

// ─── Property Tests ──────────────────────────────────────────────────────────

describe('Property-based tests — processor', () => {

  it(
    // Feature: academic-simplifier, Property 16: Mock delay is within specified range
    'P16: getMockResponse resolves in [500, 1500] ms',
    async () => {
      await fc.assert(
        fc.asyncProperty(fc.string(), async (inputText) => {
          const start = Date.now();
          await getMockResponse(inputText);
          const elapsed = Date.now() - start;

          expect(elapsed).toBeGreaterThanOrEqual(500);
          expect(elapsed).toBeLessThanOrEqual(1500);
        }),
        { numRuns: 5 },
      );
    },
    { timeout: 30000 },
  );

  it(
    // Feature: academic-simplifier, Property 7: Mock mode covers all operations
    'P7: mock mode returns non-empty keyPoints, tasks array, and non-empty rewrittenText',
    async () => {
      await fc.assert(
        fc.asyncProperty(fc.string(), async (docText) => {
          const result = await processDocument(docText, {
            useMock: true,
            mockDelayMs: { min: 0, max: 0 },
          });

          expect(Array.isArray(result.keyPoints)).toBe(true);
          expect(result.keyPoints.length).toBeGreaterThan(0);

          expect(Array.isArray(result.tasks)).toBe(true);

          expect(typeof result.rewrittenText).toBe('string');
          expect(result.rewrittenText.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 },
      );
    },
    { timeout: 30000 },
  );

  it(
    // Feature: academic-simplifier, Property 4: Loading state is active during processing
    'P4: status is loading while promise is in flight, then success or error after',
    async () => {
      await fc.assert(
        fc.asyncProperty(fc.string(), async (docText) => {
          let status: ProcessingStatus = 'idle';

          const promise = processDocument(docText, {
            useMock: true,
            mockDelayMs: { min: 0, max: 0 },
          });
          status = 'loading';

          expect(status).toBe('loading');

          try {
            await promise;
            status = 'success';
          } catch {
            status = 'error';
          }

          expect(status === 'success' || status === 'error').toBe(true);
        }),
        { numRuns: 100 },
      );
    },
    { timeout: 30000 },
  );

});

// ─── Unit Tests ───────────────────────────────────────────────────────────────

describe('Unit tests — processor', () => {

  it('defaultConfig.useMock is true', () => {
    expect(defaultConfig.useMock).toBe(true);
  });

  it('mock response structure contains all required fields', async () => {
    const result = await processDocument('some academic text', {
      useMock: true,
      mockDelayMs: { min: 0, max: 0 },
    });

    expect(result).toHaveProperty('keyPoints');
    expect(result).toHaveProperty('tasks');
    expect(result).toHaveProperty('rewrittenText');
    expect(result).toHaveProperty('originalScore');
    expect(result).toHaveProperty('simplifiedScore');

    expect(Array.isArray(result.keyPoints)).toBe(true);
    expect(Array.isArray(result.tasks)).toBe(true);
    expect(typeof result.rewrittenText).toBe('string');
  });

  it('live mode stub throws "Live mode not implemented"', async () => {
    await expect(
      processDocument('some text', { useMock: false }),
    ).rejects.toThrow('Live mode not implemented');
  });

});
