import type { ComplexityScore } from '../types';
import { countSyllables } from './syllables';

const DEFAULT_SCORE: ComplexityScore = {
  fleschKincaidGrade: 0,
  fleschReadingEase: 0,
  label: 'Very Confusing',
};

function getLabel(readingEase: number): ComplexityScore['label'] {
  if (readingEase >= 90) return 'Very Easy';
  if (readingEase >= 80) return 'Easy';
  if (readingEase >= 70) return 'Fairly Easy';
  if (readingEase >= 60) return 'Standard';
  if (readingEase >= 50) return 'Fairly Difficult';
  if (readingEase >= 30) return 'Difficult';
  return 'Very Confusing';
}

export function scoreText(text: string): ComplexityScore {
  if (!text || text.trim().length === 0) return DEFAULT_SCORE;

  // Split sentences on . ! ?
  const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0);
  // Split words on whitespace
  const words = text.split(/\s+/).filter(w => w.trim().length > 0);

  if (sentences.length === 0 || words.length === 0) return DEFAULT_SCORE;

  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);

  const wordsPerSentence = words.length / sentences.length;
  const syllablesPerWord = totalSyllables / words.length;

  const fleschKincaidGrade =
    0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;

  const rawEase =
    206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;

  const fleschReadingEase = Math.min(100, Math.max(0, rawEase));

  if (!isFinite(fleschKincaidGrade) || !isFinite(fleschReadingEase)) {
    return DEFAULT_SCORE;
  }

  return {
    fleschKincaidGrade,
    fleschReadingEase,
    label: getLabel(fleschReadingEase),
  };
}
