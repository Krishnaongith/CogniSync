import { v4 as uuidv4 } from 'uuid';
import type { Task } from '../types/index';

// ─── Date parsing ─────────────────────────────────────────────────────────────

/**
 * Attempt to parse a deadline string into a Date.
 * Returns null if the string cannot be parsed into a valid date.
 */
export function parseDeadline(deadline: string): Date | null {
  if (!deadline || deadline.trim() === '') return null;
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return null;
  return d;
}

/**
 * Format a Date as YYYYMMDD for ICS DTSTART;VALUE=DATE.
 */
export function formatDateYYYYMMDD(date: Date): string {
  const y = date.getUTCFullYear().toString().padStart(4, '0');
  const m = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const d = date.getUTCDate().toString().padStart(2, '0');
  return `${y}${m}${d}`;
}

/**
 * Format a Date as YYYYMMDDTHHMMSSZ for ICS DTSTAMP.
 */
function formatDTSTAMP(date: Date): string {
  const y = date.getUTCFullYear().toString().padStart(4, '0');
  const mo = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const d = date.getUTCDate().toString().padStart(2, '0');
  const h = date.getUTCHours().toString().padStart(2, '0');
  const mi = date.getUTCMinutes().toString().padStart(2, '0');
  const s = date.getUTCSeconds().toString().padStart(2, '0');
  return `${y}${mo}${d}T${h}${mi}${s}Z`;
}

// ─── ICS string builder (pure, exported for testability) ─────────────────────

export interface BuildICSResult {
  icsString: string;
  skipped: string[];
}

/**
 * Build an RFC 5545 VCALENDAR string from a list of tasks.
 * Tasks without a parseable deadline are skipped.
 */
export function buildICSString(tasks: Task[]): BuildICSResult {
  const skipped: string[] = [];
  const vevents: string[] = [];
  const now = new Date();
  const dtstamp = formatDTSTAMP(now);

  for (const task of tasks) {
    if (!task.deadline) {
      skipped.push(task.description);
      continue;
    }
    const parsed = parseDeadline(task.deadline);
    if (!parsed) {
      skipped.push(task.description);
      continue;
    }

    const uid = `${uuidv4()}@cognisync`;
    const dtstart = formatDateYYYYMMDD(parsed);
    const summary = task.description.replace(/\n/g, ' ');

    vevents.push(
      [
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART;VALUE=DATE:${dtstart}`,
        `SUMMARY:${summary}`,
        'DESCRIPTION:Exported from CogniSync',
        'END:VEVENT',
      ].join('\r\n'),
    );
  }

  const icsString = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CogniSync//EN',
    ...vevents,
    'END:VCALENDAR',
  ].join('\r\n');

  return { icsString, skipped };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate an ICS Blob from a list of tasks.
 * Returns the Blob and a list of skipped task descriptions.
 */
export function generateICS(tasks: Task[]): { icsBlob: Blob; skipped: string[] } {
  const { icsString, skipped } = buildICSString(tasks);
  const icsBlob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' });
  return { icsBlob, skipped };
}

/**
 * Trigger a browser download of the ICS blob as `cognisync-deadlines.ics`.
 */
export function downloadICS(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cognisync-deadlines.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Build a Google Calendar event creation URL for a single task.
 * Format: https://calendar.google.com/calendar/render?action=TEMPLATE&text=<title>&dates=<YYYYMMDD>/<YYYYMMDD>&details=Exported+from+CogniSync
 */
export function getGoogleCalendarURL(task: Task): string {
  if (!task.deadline) return '';
  const parsed = parseDeadline(task.deadline);
  if (!parsed) return '';

  const dateStr = formatDateYYYYMMDD(parsed);
  const encodedTitle = encodeURIComponent(task.description);

  return (
    `https://calendar.google.com/calendar/render` +
    `?action=TEMPLATE` +
    `&text=${encodedTitle}` +
    `&dates=${dateStr}/${dateStr}` +
    `&details=Exported+from+CogniSync`
  );
}
