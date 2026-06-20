// Feature: cognisync-feature-expansion, Property 14: Batch File Count Boundary
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { capFileList } from '../processor/synthesizer';

describe('Property-based tests - batch processor', () => {

  it(
    // Feature: cognisync-feature-expansion, Property 14: Batch File Count Boundary
    'P14: capFileList returns all N files when N ≤ 10, and exactly 10 when N > 10',
    () => {
      fc.assert(
        fc.property(
          fc.array(fc.constant('file'), { minLength: 1, maxLength: 15 }),
          (files) => {
            const result = capFileList(files);

            if (files.length <= 10) {
              expect(result.length).toBe(files.length);
            } else {
              expect(result.length).toBe(10);
            }
          },
        ),
        { numRuns: 100 },
      );
    },
  );

});
