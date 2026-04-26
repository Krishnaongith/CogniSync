import { useEffect } from 'react';
import type { Session, DigestTask, WeeklyDigestResult } from '../types';

// Pure: filter tasks due within next 7 days from `now`, sort ascending by deadline
export function computeDigest(sessions: Session[], now: number = Date.now()): WeeklyDigestResult {
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const cutoff = now + sevenDaysMs;

  const tasks: DigestTask[] = [];

  for (const session of sessions) {
    for (const task of session.result.tasks) {
      if (!task.deadline) continue;
      const deadlineMs = new Date(task.deadline).getTime();
      if (isNaN(deadlineMs)) continue;
      if (deadlineMs >= now && deadlineMs <= cutoff) {
        tasks.push({
          ...task,
          sourceFileName: session.fileName,
          sessionId: session.id,
        });
      }
    }
  }

  tasks.sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

  return { tasks };
}

function getNextMondayAt9AM(now: Date): Date {
  const day = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const daysUntilMonday = day === 1 ? 7 : (8 - day) % 7 || 7;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilMonday);
  next.setHours(9, 0, 0, 0);
  return next;
}

export function useDigest(sessions: Session[]) {
  const digest = computeDigest(sessions);

  // Request notification permission and schedule Monday 9am notification
  useEffect(() => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          scheduleMonday9AMNotification(digest.tasks.length);
        }
      });
    } else if (Notification.permission === 'granted') {
      scheduleMonday9AMNotification(digest.tasks.length);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { digest };
}

function scheduleMonday9AMNotification(taskCount: number) {
  const next = getNextMondayAt9AM(new Date());
  const delay = next.getTime() - Date.now();
  if (delay <= 0) return;

  setTimeout(() => {
    new Notification('CogniSync Weekly Digest', {
      body: `You have ${taskCount} tasks due this week`,
      icon: '/favicon.ico',
    });
  }, delay);
}
