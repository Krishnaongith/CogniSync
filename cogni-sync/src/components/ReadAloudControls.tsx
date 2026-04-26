import React from 'react';
import type { AdaptationProfile } from '../types';
import { useTTS } from '../hooks/useTTS';

interface ReadAloudControlsProps {
  profile: AdaptationProfile;
  text?: string;
  keyPoints?: string[];
}

export function ReadAloudControls({ profile, text, keyPoints }: ReadAloudControlsProps) {
  const { supported, status, speak, speakKeyPoints, pause, resume, stop } = useTTS(profile);

  if (!supported) {
    return <p>Audio read-aloud is not supported in your browser</p>;
  }

  function handlePlay() {
    if (keyPoints && keyPoints.length > 0) {
      speakKeyPoints(keyPoints);
    } else if (text) {
      speak(text);
    }
  }

  return (
    <div className="read-aloud-controls">
      {status === 'idle' && (
        <button onClick={handlePlay} aria-label="Play">
          Play
        </button>
      )}
      {status === 'playing' && (
        <button onClick={pause} aria-label="Pause">
          Pause
        </button>
      )}
      {status === 'paused' && (
        <button onClick={resume} aria-label="Resume">
          Resume
        </button>
      )}
      {status !== 'idle' && (
        <button onClick={stop} aria-label="Stop">
          Stop
        </button>
      )}
    </div>
  );
}
