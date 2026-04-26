import type { JargonTerm, GlossaryResult } from '../types';

// Cap terms to at most 20
export function capGlossaryTerms(result: GlossaryResult): GlossaryResult {
  return { terms: result.terms.slice(0, 20) };
}

// Check that a JargonTerm has all required non-empty fields
export function isCompleteJargonTerm(term: JargonTerm): boolean {
  return (
    typeof term.term === 'string' && term.term.trim().length > 0 &&
    typeof term.definition === 'string' && term.definition.trim().length > 0 &&
    typeof term.exampleSentence === 'string' && term.exampleSentence.trim().length > 0
  );
}
