// Feature: cognisync-feature-expansion, Property 17: Ask Answer Count Cap
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { addAnswer } from '../components/askAnswerManager';
import type { AskResult } from '../types';

const askResultArb = fc.record({
  question: fc.string(),
  answer: fc.string(),
  selectionText: fc.string(),
});

describe('Property 17: Ask Answer Count Cap', () => {
  it('never exceeds 5 answers regardless of how many are added', () => {
    // **Validates: Requirements 7.7**
    fc.assert(
      fc.property(
        fc.array(askResultArb, { minLength: 6, maxLength: 10 }),
        (askResults: AskResult[]) => {
          let answers: AskResult[] = [];
          for (const result of askResults) {
            answers = addAnswer(answers, result);
            expect(answers.length).toBeLessThanOrEqual(5);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('retains the most recent answers when evicting', () => {
    fc.assert(
      fc.property(
        fc.array(askResultArb, { minLength: 6, maxLength: 10 }),
        (askResults: AskResult[]) => {
          let answers: AskResult[] = [];
          for (const result of askResults) {
            answers = addAnswer(answers, result);
          }
          // The last answer added should always be the last in the list
          const lastAdded = askResults[askResults.length - 1];
          expect(answers[answers.length - 1]).toEqual(lastAdded);
        }
      ),
      { numRuns: 100 }
    );
  });
});
