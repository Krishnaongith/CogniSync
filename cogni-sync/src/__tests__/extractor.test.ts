import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { extractFromMockResponse } from '../processor/extractor';
import type { MockResponse } from '../types';

// Helper to build a MockResponse from arbitrary parts
function buildMockResponse(
  keyPoints: { id: string; text: string }[],
  tasks: { id: string; description: string; completed: boolean; deadline?: string }[],
): MockResponse {
  return {
    keyPoints,
    tasks,
    rewrittenText: 'Some rewritten text.',
  };
}

// Feature: academic-simplifier, Property 6: Key point count invariant
describe('Property 6: Key point count invariant', () => {
  it('returned key points length is in [3, 15]', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({ id: fc.uuid(), text: fc.string({ minLength: 1 }) }),
          { minLength: 3, maxLength: 15 },
        ),
        fc.array(
          fc.record({
            id: fc.uuid(),
            description: fc.string({ minLength: 1 }),
            completed: fc.boolean(),
          }),
        ),
        (keyPoints, tasks) => {
          const response = buildMockResponse(keyPoints, tasks);
          const output = extractFromMockResponse(response);
          expect(output.keyPoints.length).toBeGreaterThanOrEqual(3);
          expect(output.keyPoints.length).toBeLessThanOrEqual(15);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// Feature: academic-simplifier, Property 8: Task structure invariant
describe('Property 8: Task structure invariant', () => {
  it('every task has non-empty description and completed === false', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({ id: fc.uuid(), text: fc.string({ minLength: 1 }) }),
          { minLength: 3, maxLength: 15 },
        ),
        fc.array(
          fc.record({
            id: fc.uuid(),
            description: fc.string({ minLength: 1 }),
            completed: fc.boolean(),
          }),
        ),
        (keyPoints, tasks) => {
          const response = buildMockResponse(keyPoints, tasks);
          const output = extractFromMockResponse(response);
          for (const task of output.tasks) {
            expect(task.description.trim().length).toBeGreaterThan(0);
            expect(task.completed).toBe(false);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

// Unit tests for edge cases
describe('Extractor unit tests', () => {
  it('empty key points list returns empty keyPoints array with informational message path', () => {
    const response = buildMockResponse([], []);
    const output = extractFromMockResponse(response);
    expect(output.keyPoints).toEqual([]);
  });

  it('fewer than 3 key points returns empty keyPoints array', () => {
    const response = buildMockResponse(
      [{ id: 'a', text: 'Only one point' }, { id: 'b', text: 'Only two points' }],
      [],
    );
    const output = extractFromMockResponse(response);
    expect(output.keyPoints).toEqual([]);
  });

  it('empty tasks list returns empty tasks array with informational message path', () => {
    const response = buildMockResponse(
      [
        { id: '1', text: 'Point one' },
        { id: '2', text: 'Point two' },
        { id: '3', text: 'Point three' },
      ],
      [],
    );
    const output = extractFromMockResponse(response);
    expect(output.tasks).toEqual([]);
  });

  it('clamps key points to 15 when more than 15 are provided', () => {
    const keyPoints = Array.from({ length: 20 }, (_, i) => ({
      id: String(i),
      text: `Point ${i}`,
    }));
    const response = buildMockResponse(keyPoints, []);
    const output = extractFromMockResponse(response);
    expect(output.keyPoints.length).toBe(15);
  });

  it('filters out tasks with empty descriptions', () => {
    const response = buildMockResponse(
      [
        { id: '1', text: 'Point one' },
        { id: '2', text: 'Point two' },
        { id: '3', text: 'Point three' },
      ],
      [
        { id: 't1', description: 'Valid task', completed: false },
        { id: 't2', description: '', completed: false },
        { id: 't3', description: '   ', completed: false },
      ],
    );
    const output = extractFromMockResponse(response);
    expect(output.tasks.length).toBe(1);
    expect(output.tasks[0].description).toBe('Valid task');
  });

  it('sets completed to false regardless of input value', () => {
    const response = buildMockResponse(
      [
        { id: '1', text: 'Point one' },
        { id: '2', text: 'Point two' },
        { id: '3', text: 'Point three' },
      ],
      [{ id: 't1', description: 'A task', completed: true }],
    );
    const output = extractFromMockResponse(response);
    expect(output.tasks[0].completed).toBe(false);
  });
});
