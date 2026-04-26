import React from 'react';
import { ProgressTracker } from '../components/ProgressTracker';
import { useAppContext } from '../context/AppContext';

export function ProgressView() {
  const { progressStats } = useAppContext();

  return (
    <ProgressTracker
      documentsProcessed={progressStats.documentsProcessed}
      totalReadingTime={progressStats.totalReadingTime}
      currentStreak={progressStats.currentStreak}
      longestStreak={progressStats.longestStreak}
    />
  );
}
