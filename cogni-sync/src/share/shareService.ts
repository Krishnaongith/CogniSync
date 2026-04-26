import LZString from 'lz-string';
import type { KeyPoint, Task, ProcessorResult } from '../types';

export interface SharePayload {
  keyPoints: KeyPoint[];
  tasks: Task[];
  rewrittenText: string;
  tldr?: string;
}

export interface EncodeResult {
  url: string;
  truncated: boolean;
}

const MAX_URL_LENGTH = 8000;

export function encode(payload: SharePayload): EncodeResult {
  const origin = window.location.origin;

  const buildURL = (p: SharePayload): string => {
    const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(p));
    return origin + '/?share=' + compressed;
  };

  let url = buildURL(payload);

  if (url.length <= MAX_URL_LENGTH) {
    return { url, truncated: false };
  }

  // Truncate rewrittenText until URL fits
  let text = payload.rewrittenText;
  while (text.length > 0 && url.length > MAX_URL_LENGTH) {
    // Remove ~10% of remaining text each iteration for efficiency
    const removeCount = Math.max(1, Math.floor(text.length * 0.1));
    text = text.slice(0, text.length - removeCount);
    url = buildURL({ ...payload, rewrittenText: text });
  }

  // Edge case: even empty rewrittenText might exceed limit (very unlikely)
  if (url.length > MAX_URL_LENGTH) {
    url = buildURL({ ...payload, rewrittenText: '' });
  }

  return { url, truncated: true };
}

export function decode(url: string): SharePayload | null {
  try {
    const urlObj = new URL(url);
    const share = urlObj.searchParams.get('share');
    if (!share) return null;
    const decompressed = LZString.decompressFromEncodedURIComponent(share);
    if (!decompressed) return null;
    return JSON.parse(decompressed) as SharePayload;
  } catch {
    return null;
  }
}

export function generatePDF(result: ProcessorResult): void {
  const keyPointsHTML = result.keyPoints
    .map((kp) => `<li>${kp.text}</li>`)
    .join('\n');

  const tasksHTML = result.tasks
    .map((t) => `<li>${t.description}${t.deadline ? ` (Due: ${t.deadline})` : ''}</li>`)
    .join('\n');

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>CogniSync Export</title>
<style>body{font-family:sans-serif;padding:2rem;max-width:800px;margin:0 auto}h1,h2{color:#333}ul{line-height:1.8}</style>
</head>
<body>
${result.tldr ? `<h1>TL;DR</h1><p>${result.tldr}</p>` : ''}
<h2>Key Points</h2>
<ul>${keyPointsHTML}</ul>
<h2>Simplified Text</h2>
<p>${result.rewrittenText}</p>
<h2>Tasks</h2>
<ul>${tasksHTML}</ul>
</body>
</html>`;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  iframe.style.opacity = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();
    iframe.contentWindow?.print();
  }

  setTimeout(() => {
    document.body.removeChild(iframe);
  }, 1000);
}
