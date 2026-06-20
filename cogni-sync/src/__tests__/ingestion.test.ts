import { describe, it, expect, beforeAll } from 'vitest';
import * as fc from 'fast-check';
import { validateFile, validatePaste, extractTextFromFile } from '../ingestion/ingestion';
import { SUPPORTED_TYPES, MAX_FILE_SIZE_BYTES, MAX_PASTE_CHARS } from '../types/index';

// ─── jsdom polyfill ──────────────────────────────────────────────────────────
// jsdom does not implement File/Blob.prototype.text(); polyfill it via FileReader.
beforeAll(() => {
  if (typeof Blob !== 'undefined' && !Blob.prototype.text) {
    Blob.prototype.text = function (): Promise<string> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(this);
      });
    };
  }
});

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Create a File whose `.size` property is overridden to `byteSize`. */
function makeFileWithSize(byteSize: number, type = 'text/plain'): File {
  const file = new File([], 'test.txt', { type });
  Object.defineProperty(file, 'size', { value: byteSize, configurable: true });
  return file;
}

/** MIME types that are NOT in SUPPORTED_TYPES. */
const SUPPORTED_SET = new Set<string>(SUPPORTED_TYPES);

// ─── Property Tests ──────────────────────────────────────────────────────────

describe('Property-based tests - ingestion', () => {

  it(
    // Feature: academic-simplifier, Property 1: File size boundary enforcement
    'P1: FILE_TOO_LARGE when size > MAX_FILE_SIZE_BYTES, accepted when <=',
    () => {
      fc.assert(
        fc.property(fc.integer({ min: 0 }), (byteSize) => {
          const file = makeFileWithSize(byteSize);
          const result = validateFile(file);

          if (byteSize > MAX_FILE_SIZE_BYTES) {
            expect(result).not.toBeNull();
            expect(result!.code).toBe('FILE_TOO_LARGE');
          } else {
            // size is fine - only a type error is possible, not a size error
            if (result !== null) {
              expect(result.code).not.toBe('FILE_TOO_LARGE');
            }
          }
        }),
        { numRuns: 100 },
      );
    },
  );

  it(
    // Feature: academic-simplifier, Property 2: Paste length boundary enforcement
    'P2: PASTE_TOO_LONG when length > MAX_PASTE_CHARS, accepted when <=',
    () => {
      fc.assert(
        fc.property(fc.string(), (text) => {
          const result = validatePaste(text);

          if (text.length > MAX_PASTE_CHARS) {
            expect(result).not.toBeNull();
            expect(result!.code).toBe('PASTE_TOO_LONG');
          } else {
            expect(result).toBeNull();
          }
        }),
        { numRuns: 100 },
      );
    },
  );

  it(
    // Feature: academic-simplifier, Property 5: Unsupported file types are rejected
    'P5: UNSUPPORTED_TYPE for any MIME type not in SUPPORTED_TYPES',
    () => {
      fc.assert(
        fc.property(fc.string(), (mimeType) => {
          fc.pre(!SUPPORTED_SET.has(mimeType));

          const file = makeFileWithSize(1024, mimeType);
          const result = validateFile(file);

          expect(result).not.toBeNull();
          expect(result!.code).toBe('UNSUPPORTED_TYPE');
        }),
        { numRuns: 100 },
      );
    },
  );

  it(
    // Feature: academic-simplifier, Property 3: File text extraction round-trip
    'P3: extractTextFromFile returns text containing the original content for text/plain',
    async () => {
      await fc.assert(
        fc.asyncProperty(fc.string(), async (text) => {
          const blob = new Blob([text], { type: 'text/plain' });
          const file = new File([blob], 'test.txt', { type: 'text/plain' });

          const result = await extractTextFromFile(file);
          expect(result.text).toContain(text);
        }),
        { numRuns: 100 },
      );
    },
  );
});

// ─── Unit Tests ───────────────────────────────────────────────────────────────

describe('Unit tests - ingestion error codes', () => {

  it('returns UNSUPPORTED_TYPE for an unrecognised MIME type', () => {
    const file = makeFileWithSize(1024, 'image/png');
    const error = validateFile(file);
    expect(error).not.toBeNull();
    expect(error!.code).toBe('UNSUPPORTED_TYPE');
    expect(error!.message).toMatch(/not supported/i);
  });

  it('returns FILE_TOO_LARGE when file exceeds 100 MB', () => {
    const file = makeFileWithSize(MAX_FILE_SIZE_BYTES + 1);
    const error = validateFile(file);
    expect(error).not.toBeNull();
    expect(error!.code).toBe('FILE_TOO_LARGE');
    expect(error!.message).toMatch(/100 MB/i);
  });

  it('returns null for a valid file at exactly the size limit', () => {
    const file = makeFileWithSize(MAX_FILE_SIZE_BYTES);
    const error = validateFile(file);
    expect(error).toBeNull();
  });

  it('returns PASTE_TOO_LONG when paste exceeds 80,000 characters', () => {
    const longText = 'a'.repeat(MAX_PASTE_CHARS + 1);
    const error = validatePaste(longText);
    expect(error).not.toBeNull();
    expect(error!.code).toBe('PASTE_TOO_LONG');
    expect(error!.message).toMatch(/80,000/);
  });

  it('returns null for a paste at exactly the character limit', () => {
    const text = 'a'.repeat(MAX_PASTE_CHARS);
    const error = validatePaste(text);
    expect(error).toBeNull();
  });

  it('throws EXTRACTION_FAILED for a supported type that cannot be parsed', async () => {
    // A PPTX file triggers the "PPTX extraction not supported" path → EXTRACTION_FAILED
    const pptxType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    const file = makeFileWithSize(1024, pptxType);
    await expect(extractTextFromFile(file)).rejects.toMatchObject({ code: 'EXTRACTION_FAILED' });
  });

  it('throws UNSUPPORTED_TYPE when extractTextFromFile receives an unsupported file', async () => {
    const file = makeFileWithSize(1024, 'application/zip');
    await expect(extractTextFromFile(file)).rejects.toMatchObject({ code: 'UNSUPPORTED_TYPE' });
  });
});
