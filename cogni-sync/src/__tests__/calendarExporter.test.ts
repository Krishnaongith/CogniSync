import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { buildICSString, getGoogleCalendarURL } from '../calendar/calendarExporter';
import type { Task } from '../types/index';

// ─── Arbitraries ─────────────────────────────────────────────────────────────

/** A valid ISO date string (YYYY-MM-DD) that Date can parse. */
const validDeadlineArb: fc.Arbitrary<string> = fc
  .date({ min: new Date('2020-01-01'), max: new Date('2035-12-31') })
  .map((d) => d.toISOString().slice(0, 10)); // "YYYY-MM-DD"

/** A task with a valid, parseable deadline. */
const taskWithDeadlineArb: fc.Arbitrary<Task> = fc.record({
  id: fc.uuid(),
  description: fc.string({ minLength: 1, maxLength: 100 }),
  deadline: validDeadlineArb,
  completed: fc.boolean(),
  urgency: fc.option(fc.constantFrom('urgent' as const, 'not-urgent' as const), { nil: undefined }),
  importance: fc.option(fc.constantFrom('important' as const, 'not-important' as const), { nil: undefined }),
});

/** A task with no deadline (undefined). */
const taskWithoutDeadlineArb: fc.Arbitrary<Task> = fc.record({
  id: fc.uuid(),
  description: fc.string({ minLength: 1, maxLength: 100 }),
  deadline: fc.constant(undefined),
  completed: fc.boolean(),
  urgency: fc.option(fc.constantFrom('urgent' as const, 'not-urgent' as const), { nil: undefined }),
  importance: fc.option(fc.constantFrom('important' as const, 'not-important' as const), { nil: undefined }),
});

/** A task with an unparseable deadline string. */
const taskWithBadDeadlineArb: fc.Arbitrary<Task> = fc.record({
  id: fc.uuid(),
  description: fc.string({ minLength: 1, maxLength: 100 }),
  // Strings that are not valid dates: pure alphabetic strings
  deadline: fc.stringMatching(/^[a-z]{5,20}$/).filter((s) => isNaN(Date.parse(s))),
  completed: fc.boolean(),
  urgency: fc.option(fc.constantFrom('urgent' as const, 'not-urgent' as const), { nil: undefined }),
  importance: fc.option(fc.constantFrom('important' as const, 'not-important' as const), { nil: undefined }),
});

/** Mixed task list: some with valid deadlines, some without, some with bad deadlines. */
const mixedTaskListArb: fc.Arbitrary<Task[]> = fc.tuple(
  fc.array(taskWithDeadlineArb, { minLength: 0, maxLength: 5 }),
  fc.array(taskWithoutDeadlineArb, { minLength: 0, maxLength: 5 }),
  fc.array(taskWithBadDeadlineArb, { minLength: 0, maxLength: 3 }),
).map(([withDeadline, withoutDeadline, badDeadline]) =>
  [...withDeadline, ...withoutDeadline, ...badDeadline],
);

// ─── Property Tests ───────────────────────────────────────────────────────────

describe('Property-based tests - calendarExporter', () => {

  // ── Property 5: ICS VEVENT Count Matches Tasks with Deadlines ────────────

  it(
    // Feature: cognisync-feature-expansion, Property 5: ICS VEVENT Count Matches Tasks with Deadlines
    'P5: ICS string contains exactly as many VEVENT blocks as tasks with parseable deadlines',
    () => {
      fc.assert(
        fc.property(mixedTaskListArb, (tasks) => {
          const { icsString } = buildICSString(tasks);

          // Count VEVENT blocks in the output
          const veventMatches = icsString.match(/BEGIN:VEVENT/g);
          const veventCount = veventMatches ? veventMatches.length : 0;

          // Count tasks with parseable deadlines
          const tasksWithParseableDeadline = tasks.filter((t) => {
            if (!t.deadline) return false;
            const d = new Date(t.deadline);
            return !isNaN(d.getTime());
          });

          expect(veventCount).toBe(tasksWithParseableDeadline.length);
        }),
        { numRuns: 100 },
      );
    },
  );

  // ── Property 6: ICS RFC 5545 Structure ───────────────────────────────────

  it(
    // Feature: cognisync-feature-expansion, Property 6: ICS RFC 5545 Structure
    'P6: ICS string for non-empty task list with deadlines contains required RFC 5545 fields',
    () => {
      fc.assert(
        fc.property(
          fc.array(taskWithDeadlineArb, { minLength: 1, maxLength: 10 }),
          (tasks) => {
            const { icsString } = buildICSString(tasks);

            // Required top-level calendar fields
            expect(icsString).toContain('BEGIN:VCALENDAR');
            expect(icsString).toContain('VERSION:2.0');
            expect(icsString).toContain('PRODID');
            expect(icsString).toContain('END:VCALENDAR');

            // At least one VEVENT pair
            expect(icsString).toContain('BEGIN:VEVENT');
            expect(icsString).toContain('END:VEVENT');

            // Required VEVENT fields
            expect(icsString).toContain('UID:');
            expect(icsString).toContain('DTSTAMP:');
            expect(icsString).toContain('DTSTART;VALUE=DATE:');
            expect(icsString).toContain('SUMMARY:');
          },
        ),
        { numRuns: 100 },
      );
    },
  );

  // ── Property 7: Google Calendar URL Contains Task Data ───────────────────

  it(
    // Feature: cognisync-feature-expansion, Property 7: Google Calendar URL Contains Task Data
    'P7: Google Calendar URL contains encoded task description and deadline date',
    () => {
      fc.assert(
        fc.property(taskWithDeadlineArb, (task) => {
          const url = getGoogleCalendarURL(task);

          // URL must be non-empty and start with the Google Calendar base
          expect(url).toContain('https://calendar.google.com/calendar/render');
          expect(url).toContain('action=TEMPLATE');

          // The encoded task description must appear in the URL
          const encodedTitle = encodeURIComponent(task.description);
          expect(url).toContain(`text=${encodedTitle}`);

          // The deadline date (YYYYMMDD) must appear in the dates parameter
          const parsed = new Date(task.deadline!);
          const y = parsed.getUTCFullYear().toString().padStart(4, '0');
          const mo = (parsed.getUTCMonth() + 1).toString().padStart(2, '0');
          const d = parsed.getUTCDate().toString().padStart(2, '0');
          const dateStr = `${y}${mo}${d}`;
          expect(url).toContain(`dates=${dateStr}/${dateStr}`);
        }),
        { numRuns: 100 },
      );
    },
  );

});
