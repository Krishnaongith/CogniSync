/**
 * Estimates the number of syllables in an English word.
 * Algorithm: count vowel groups, subtract silent-e endings, handle exceptions.
 * Minimum 1 syllable per word.
 */
export function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length === 0) return 1;

  // Common exceptions
  const exceptions: Record<string, number> = {
    the: 1,
    every: 3,
    area: 3,
    idea: 3,
    real: 2,
    being: 2,
    doing: 2,
    going: 2,
    having: 2,
    making: 2,
    taking: 2,
    coming: 2,
    giving: 2,
    living: 2,
    using: 2,
    saying: 2,
    seeing: 2,
    trying: 2,
    knowing: 2,
    getting: 2,
    putting: 2,
    setting: 2,
    letting: 2,
    running: 2,
    sitting: 2,
    hitting: 2,
    cutting: 2,
    winning: 2,
    beginning: 3,
    everything: 3,
    everyone: 3,
    something: 2,
    somewhere: 2,
    sometimes: 3,
    someone: 2,
    anybody: 4,
    nobody: 3,
    everybody: 4,
  };

  if (Object.prototype.hasOwnProperty.call(exceptions, w)) return exceptions[w];

  // Count vowel groups
  const vowelGroups = w.match(/[aeiouy]+/g);
  let count = vowelGroups ? vowelGroups.length : 0;

  // Subtract silent trailing 'e' (e.g., "make", "take") but not "le" endings
  if (w.length > 2 && w.endsWith('e') && !w.endsWith('le') && !/[aeiouy]e$/.test(w.slice(0, -1))) {
    count -= 1;
  }

  // Add for 'le' ending preceded by consonant (e.g., "table", "simple")
  if (w.length > 2 && /[^aeiouy]le$/.test(w)) {
    count += 1;
  }

  // Subtract for 'ed' ending that is silent (e.g., "walked", "talked")
  if (w.endsWith('ed') && w.length > 3) {
    const beforeEd = w.slice(0, -2);
    if (!/[td]$/.test(beforeEd)) {
      count -= 1;
    }
  }

  return Math.max(1, count);
}
