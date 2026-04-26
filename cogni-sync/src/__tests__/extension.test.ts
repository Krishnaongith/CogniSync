// Feature: cognisync-feature-expansion, Property 28: Extension Settings Preserved Across Update
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { createRequire } from 'module';

// Validates: Requirements 12.7

// Import preserveSettings from the extension helper
const require = createRequire(import.meta.url);
const { preserveSettings } = require('../../../extension/settingsHelper.js');

describe('Property 28: Extension Settings Preserved Across Update', () => {
  it('returns existing config when non-empty (simulates update without clearing storage)', () => {
    fc.assert(
      fc.property(
        fc.record({
          theme: fc.string({ minLength: 1 }),
          profile: fc.string({ minLength: 1 }),
        }),
        fc.record({
          theme: fc.string({ minLength: 1 }),
          profile: fc.string({ minLength: 1 }),
        }),
        (existing, defaults) => {
          const result = preserveSettings(existing, defaults);
          expect(result).toEqual(existing);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns defaults when existing config is empty (first install)', () => {
    fc.assert(
      fc.property(
        fc.record({
          theme: fc.string({ minLength: 1 }),
          profile: fc.string({ minLength: 1 }),
        }),
        (defaults) => {
          const result = preserveSettings({}, defaults);
          expect(result).toEqual(defaults);
        }
      ),
      { numRuns: 100 }
    );
  });
});
