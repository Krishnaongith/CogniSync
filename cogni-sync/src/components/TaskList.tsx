import { useState } from 'react';
import { Task } from '../types/index';
import { validateDeadline } from '../calendar/deadlineValidator';

interface TaskListProps {
  tasks: Task[];
  taskCompletions: Record<string, boolean>;
  onToggle: (taskId: string) => void;
  onUpdateDeadline: (taskId: string, deadline: string | undefined) => void;
}

function DeadlineField({ task, onUpdateDeadline }: { task: Task; onUpdateDeadline: (taskId: string, deadline: string | undefined) => void }) {
  const [error, setError] = useState<string | undefined>(undefined);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (value === '') {
      setError(undefined);
      onUpdateDeadline(task.id, undefined);
      return;
    }
    const result = validateDeadline(value);
    if (!result.valid) {
      setError(result.error);
    } else {
      setError(undefined);
      onUpdateDeadline(task.id, value);
    }
  }

  return (
    <div style={{ marginTop: 4 }}>
      <input
        type="date"
        defaultValue={task.deadline ?? ''}
        onChange={handleChange}
        style={{
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
      {error && (
        <span style={{ display: 'block', fontSize: 11, color: '#f87171', marginTop: 2 }}>
          {error}
        </span>
      )}
    </div>
  );
}

export function TaskList({ tasks, taskCompletions, onToggle, onUpdateDeadline }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <p style={{ color: '#777', fontStyle: 'italic' }}>
        No actionable tasks were found in this document.
      </p>
    );
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {tasks.map((task) => {
        const completed = taskCompletions[task.id] ?? false;
        return (
          <li key={task.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
            <input
              type="checkbox"
              checked={completed}
              onChange={() => onToggle(task.id)}
              style={{ marginTop: 3, cursor: 'pointer' }}
            />
            <div>
              <span style={{ textDecoration: completed ? 'line-through' : 'none', color: completed ? '#999' : 'inherit' }}>
                {task.description}
              </span>
              <DeadlineField task={task} onUpdateDeadline={onUpdateDeadline} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
