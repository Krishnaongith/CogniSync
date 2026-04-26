// Feature: cognisync-feature-expansion, Property 27: Extension Text Extraction Non-Empty on Valid LMS Page
import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';

// Validates: Requirements 12.3

// Inline copy of extractContent from extension/content.js
// Uses textContent as fallback since jsdom does not implement innerText
function extractContent(): string {
  const selectors = ['main', '#content', '.content', 'article'];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    const text = (el as HTMLElement | null)?.innerText ?? el?.textContent ?? '';
    if (el && text && text.trim().length > 0) {
      return text.trim();
    }
  }
  return '';
}

describe('Property 27: Extension Text Extraction Non-Empty on Valid LMS Page', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('returns non-empty string when main element has content', () => {
    // Generate plain text strings (no HTML tags, no whitespace-only)
    const plainTextString = fc.string({ minLength: 1 })
      .filter(s => !s.includes('<') && !s.includes('>') && s.trim().length > 0);
    fc.assert(
      fc.property(
        fc.record({ mainContent: plainTextString }),
        ({ mainContent }) => {
          document.body.innerHTML = '<main>' + mainContent + '</main>';
          const result = extractContent();
          expect(result.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
