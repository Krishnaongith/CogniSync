import type { AdaptationProfile, SentenceScore } from '../types';
import { scoreText } from '../scorer/scorer';

/**
 * Split text into sentences on `.`, `!`, `?` and filter empty/whitespace-only segments.
 */
function splitSentences(text: string): string[] {
  return text.split(/[.!?]/).filter(s => s.trim().length > 0);
}

/**
 * Compute a heatmap for the given text by scoring each sentence.
 */
export function computeHeatmap(text: string, _profile: AdaptationProfile): SentenceScore[] {
  const sentences = splitSentences(text);
  return sentences.map(sentence => {
    const { fleschReadingEase, label } = scoreText(sentence);
    return {
      text: sentence.trim(),
      score: fleschReadingEase,
      label,
    };
  });
}

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
}

/**
 * Map a Flesch Reading Ease score (0–100) to a CSS hex color.
 * - Non-anxiety profiles: green (#22c55e) at 100, red (#ef4444) at 0
 * - Anxiety profile: blue (#3b82f6) at 100, orange (#f97316) at 0
 *
 * Interpolation: r = r1 + (r2 - r1) * (1 - score/100), same for g and b.
 * Where [r1,g1,b1] = high-score color, [r2,g2,b2] = low-score color.
 */
export function scoreToColor(score: number, profile: AdaptationProfile): string {
  const clamped = Math.min(100, Math.max(0, score));
  const t = 1 - clamped / 100; // 0 at score=100, 1 at score=0

  if (profile === 'anxiety') {
    const [r1, g1, b1] = hexToRgb('#3b82f6'); // blue (high score)
    const [r2, g2, b2] = hexToRgb('#f97316'); // orange (low score)
    return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
  } else {
    const [r1, g1, b1] = hexToRgb('#22c55e'); // green (high score)
    const [r2, g2, b2] = hexToRgb('#ef4444'); // red (low score)
    return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
  }
}
