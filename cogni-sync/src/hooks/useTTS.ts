import { useState, useCallback } from 'react';
import type { AdaptationProfile } from '../types';

export interface TTSConfig {
  rate: number;
  pitch: number;
}

// Returns the TTS config for a given profile
export function getTTSConfig(profile: AdaptationProfile): TTSConfig {
  if (profile === 'dyslexia') return { rate: 0.85, pitch: 1.0 };
  if (profile === 'anxiety') return { rate: 1.0, pitch: 0.9 };
  return { rate: 1.0, pitch: 1.0 };
}

// Returns the utterances that would be queued for a list of key points (in order)
export function getKeyPointUtterances(keyPoints: string[]): string[] {
  return [...keyPoints];
}

// Pure state transition: stop always returns idle
export function getTTSStatusAfterStop(_status: 'playing' | 'paused'): 'idle' {
  return 'idle';
}

export type TTSStatus = 'idle' | 'playing' | 'paused';

export function useTTS(profile: AdaptationProfile) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [status, setStatus] = useState<TTSStatus>('idle');
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const speak = useCallback((text: string) => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const config = getTTSConfig(profile);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = config.rate;
    utterance.pitch = config.pitch;
    utterance.onstart = () => setStatus('playing');
    utterance.onend = () => setStatus('idle');
    utterance.onerror = () => setStatus('idle');
    setCurrentIndex(0);
    window.speechSynthesis.speak(utterance);
  }, [profile, supported]);

  const speakKeyPoints = useCallback((keyPoints: string[]) => {
    if (!supported || keyPoints.length === 0) return;
    window.speechSynthesis.cancel();
    const config = getTTSConfig(profile);

    let index = 0;
    setCurrentIndex(0);
    setStatus('playing');

    function speakNext() {
      if (index >= keyPoints.length) {
        setStatus('idle');
        return;
      }
      const utterance = new SpeechSynthesisUtterance(keyPoints[index]);
      utterance.rate = config.rate;
      utterance.pitch = config.pitch;
      const currentIdx = index;
      utterance.onstart = () => setCurrentIndex(currentIdx);
      utterance.onend = () => {
        index += 1;
        if (index < keyPoints.length) {
          setTimeout(speakNext, 500);
        } else {
          setStatus('idle');
        }
      };
      utterance.onerror = () => setStatus('idle');
      window.speechSynthesis.speak(utterance);
    }

    speakNext();
  }, [profile, supported]);

  const pause = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.pause();
    setStatus('paused');
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.resume();
    setStatus('playing');
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setStatus('idle');
    setCurrentIndex(0);
  }, [supported]);

  return { supported, status, currentIndex, speak, speakKeyPoints, pause, resume, stop };
}
