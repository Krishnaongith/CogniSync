import React, { useState } from 'react';
import { computeDigest } from '../hooks/useDigest';
import type { Session, DigestTask } from '../types';

interface WeeklyDigestProps {
  sessions: Session[];
  onClose: () => void;
}

function formatDayLabel(deadline: string): string {
  const date = new Date(deadline);
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function groupByDay(tasks: DigestTask[]): Map<string, DigestTask[]> {
  const groups = new Map<string, DigestTask[]>();
  for (const task of tasks) {
    const label = formatDayLabel(task.deadline!);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(task);
  }
  return groups;
}

export function WeeklyDigest({ sessions, onClose }: WeeklyDigestProps) {
  const digest = computeDigest(sessions);
  const groups = groupByDay(digest.tasks);

  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied',
  );

  const handleEnableNotifications = async () => {
    if (typeof Notification === 'undefined') return;
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Weekly Digest"
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          background: 'var(--bg-card, #1a2035)',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Weekly Digest</h2>
          <button
            onClick={onClose}
            aria-label="Close weekly digest"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)', fontSize: '1.25rem', lineHeight: 1,
              padding: '4px 8px', borderRadius: '6px',
            }}
          >
            ✕
          </button>
        </div>

        {notifPermission === 'default' && (
          <div
            role="alert"
            style={{
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.25)',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Enable notifications to get a Monday 9AM digest reminder.
            </span>
            <button
              onClick={handleEnableNotifications}
              style={{
                background: 'rgba(99,102,241,0.8)',
                border: 'none', borderRadius: '6px',
                padding: '6px 12px', cursor: 'pointer',
                color: '#fff', fontSize: '0.8125rem', fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              Enable
            </button>
          </div>
        )}

        {digest.tasks.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '32px 0' }}>
            No tasks due in the next 7 days
          </p>
        ) : (
          <div>
            {Array.from(groups.entries()).map(([day, dayTasks]) => (
              <div key={day} style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 8px', fontSize: '0.875rem', fontWeight: 600, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {day}
                </h3>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {dayTasks.map(task => (
                    <li
                      key={task.id}
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      <span style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{task.description}</span>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {task.sourceFileName && (
                          <span style={{ background: 'rgba(99,102,241,0.15)', borderRadius: '4px', padding: '1px 6px' }}>
                            {task.sourceFileName}
                          </span>
                        )}
                        <span>{new Date(task.deadline!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
