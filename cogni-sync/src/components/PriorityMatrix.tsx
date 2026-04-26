import { useState } from 'react';
import type { Task, PriorityQuadrant } from '../types';
import { getQuadrant } from '../types';

interface PriorityMatrixProps {
  tasks: Task[];
  taskCompletions: Record<string, boolean>;
  onToggle: (taskId: string) => void;
  onUpdateDeadline?: (taskId: string, deadline: string | undefined) => void;
}

const QUADRANTS: {
  id: PriorityQuadrant;
  label: string;
  sub: string;
  bg: string;
  border: string;
  accent: string;
  headerBg: string;
  indicator: string;
}[] = [
  {
    id: 'do-now',
    label: 'Do Now',
    sub: 'Urgent + Important',
    bg: 'rgba(239,68,68,0.07)',
    border: 'rgba(239,68,68,0.35)',
    accent: '#ef4444',
    headerBg: 'rgba(239,68,68,0.12)',
    indicator: '🔴',
  },
  {
    id: 'schedule',
    label: 'Schedule',
    sub: 'Not Urgent + Important',
    bg: 'rgba(59,130,246,0.07)',
    border: 'rgba(59,130,246,0.35)',
    accent: '#3b82f6',
    headerBg: 'rgba(59,130,246,0.12)',
    indicator: '🔵',
  },
  {
    id: 'delegate',
    label: 'Delegate',
    sub: 'Urgent + Not Important',
    bg: 'rgba(245,158,11,0.07)',
    border: 'rgba(245,158,11,0.35)',
    accent: '#f59e0b',
    headerBg: 'rgba(245,158,11,0.12)',
    indicator: '🟡',
  },
  {
    id: 'eliminate',
    label: 'Eliminate',
    sub: 'Not Urgent + Not Important',
    bg: 'rgba(148,163,184,0.07)',
    border: 'rgba(148,163,184,0.25)',
    accent: '#94a3b8',
    headerBg: 'rgba(148,163,184,0.1)',
    indicator: '⚪',
  },
];

export function PriorityMatrix({ tasks, taskCompletions, onToggle, onUpdateDeadline }: PriorityMatrixProps) {
  const [expandedQuadrant, setExpandedQuadrant] = useState<PriorityQuadrant | null>('do-now');

  if (tasks.length === 0) {
    return <p style={{ color: '#777', fontStyle: 'italic' }}>No tasks found.</p>;
  }

  const grouped = QUADRANTS.map(q => ({
    ...q,
    tasks: tasks.filter(t => getQuadrant(t) === q.id),
  }));

  const toggleQuadrant = (id: PriorityQuadrant) => {
    setExpandedQuadrant(prev => (prev === id ? null : id));
  };

  return (
    <>
      <style>{`
        .priority-matrix-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 639px) {
          .priority-matrix-grid {
            grid-template-columns: 1fr !important;
          }
          .pm-quadrant-body {
            display: none;
          }
          .pm-quadrant-body.expanded {
            display: block;
          }
          .pm-chevron {
            display: inline-block !important;
          }
        }
        .pm-task-item {
          transition: transform 0.15s ease;
        }
        .pm-task-item:hover {
          transform: translateX(4px);
        }
        .pm-chevron {
          display: none;
          margin-left: auto;
          font-size: 12px;
          color: #64748b;
          transition: transform 0.2s ease;
        }
        .pm-chevron.open {
          transform: rotate(180deg);
        }
      `}</style>
      <div className="priority-matrix-grid">
        {grouped.map(q => {
          const isExpanded = expandedQuadrant === q.id;
          return (
            <div
              key={q.id}
              style={{
                background: q.bg,
                border: `2px solid ${q.border}`,
                borderRadius: 10,
                padding: '12px 14px',
                minHeight: 80,
              }}
            >
              {/* Quadrant header — clickable on mobile for accordion */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8,
                  background: q.headerBg,
                  borderRadius: 6,
                  padding: '6px 8px',
                  cursor: 'pointer',
                }}
                onClick={() => toggleQuadrant(q.id)}
                role="button"
                aria-expanded={isExpanded}
                aria-controls={`quadrant-body-${q.id}`}
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleQuadrant(q.id); } }}
              >
                {/* Decorative indicator — aria-hidden so screen readers skip it */}
                <span aria-hidden="true" style={{ fontSize: 13 }}>{q.indicator}</span>
                <span role="heading" aria-level={3} style={{ fontSize: 14, fontWeight: 700 }}>{q.label}</span>
                <span
                  style={{
                    background: q.accent,
                    color: '#fff',
                    borderRadius: 999,
                    padding: '1px 7px',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {q.tasks.length}
                </span>
                <span style={{ fontSize: 11, color: '#666' }}>{q.sub}</span>
                <span className={`pm-chevron${isExpanded ? ' open' : ''}`} aria-hidden="true">▼</span>
              </div>

              {/* Quadrant body */}
              <div
                id={`quadrant-body-${q.id}`}
                className={`pm-quadrant-body${isExpanded ? ' expanded' : ''}`}
              >
                {q.tasks.length === 0 ? (
                  <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: 0 }}>None</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {q.tasks.map(task => {
                      const done = taskCompletions[task.id] ?? false;
                      return (
                        <li key={task.id} className="pm-task-item" style={{ marginBottom: 8 }}>
                          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={done}
                              onChange={() => onToggle(task.id)}
                              style={{ marginTop: 2, cursor: 'pointer', flexShrink: 0 }}
                            />
                            <div>
                              <span
                                style={{
                                  fontSize: 13,
                                  transition: 'opacity 0.2s, color 0.2s',
                                  opacity: done ? 0.4 : 1,
                                  textDecoration: done ? 'line-through' : 'none',
                                  color: done ? '#999' : 'var(--text-primary)',
                                }}
                              >
                                {task.description}
                              </span>
                              {onUpdateDeadline ? (
                                <input
                                  type="date"
                                  defaultValue={task.deadline ?? ''}
                                  onChange={e => {
                                    const v = e.target.value;
                                    onUpdateDeadline(task.id, v || undefined);
                                  }}
                                  style={{
                                    display: 'block',
                                    marginTop: 3,
                                    fontSize: 11,
                                    color: 'var(--text-secondary)',
                                    background: 'rgba(99,102,241,0.08)',
                                    border: '1px solid rgba(99,102,241,0.2)',
                                    borderRadius: 5,
                                    padding: '2px 6px',
                                    fontFamily: 'inherit',
                                    colorScheme: 'dark',
                                  }}
                                  aria-label={`Deadline for ${task.description}`}
                                />
                              ) : task.deadline ? (
                                <span style={{ display: 'block', fontSize: 11, color: '#888' }}>Due: {task.deadline}</span>
                              ) : null}
                            </div>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
