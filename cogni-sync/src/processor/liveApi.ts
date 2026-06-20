import type { MockResponse, AdaptationProfile } from '../types';
import { API_BASE as BASE } from '../config';
import { MOCK_RESPONSE } from './mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export async function getLiveResponse(inputText: string, profile: AdaptationProfile = 'default'): Promise<MockResponse> {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 800));
    return MOCK_RESPONSE;
  }
  const res = await fetch(`${BASE}/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: inputText, profile }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? 'Server error');
  }
  return res.json();
}

export async function rewriteAtLevel(text: string, gradeLevel: number, profile: AdaptationProfile = 'default'): Promise<string> {
  const res = await fetch(`${BASE}/rewrite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, gradeLevel, profile }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? 'Rewrite failed');
  }
  const data = await res.json();
  return data.rewrittenText;
}

export async function getBedrockScore(originalText: string, simplifiedText: string): Promise<{ originalScore: import('../types').ComplexityScore; simplifiedScore: import('../types').ComplexityScore }> {
  const res = await fetch(`${BASE}/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ originalText, simplifiedText }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? 'Score failed');
  }
  return res.json();
}
