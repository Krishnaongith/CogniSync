import React from 'react';
import type { AdaptationProfile } from '../types';
import { computeHeatmap, scoreToColor } from '../hooks/useHeatmap';
import { Tooltip } from './Tooltip';

interface HeatmapViewProps {
  text: string;
  profile: AdaptationProfile;
}

export function HeatmapView({ text, profile }: HeatmapViewProps) {
  if (!text || text.trim().length === 0) {
    return (
      <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>
        No text to display. Process a document to see the complexity heatmap.
      </p>
    );
  }

  const sentences = computeHeatmap(text, profile);

  if (sentences.length === 0) {
    return (
      <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>
        No sentences detected in the provided text.
      </p>
    );
  }

  return (
    <p style={{ lineHeight: 2, margin: 0 }}>
      {sentences.map((s, i) => (
        <Tooltip key={i} content={`Score: ${Math.round(s.score)} — ${s.label}`} placement="top">
          <span
            style={{
              backgroundColor: scoreToColor(s.score, profile),
              padding: '1px 3px',
              borderRadius: 3,
              marginRight: 4,
              cursor: 'default',
              display: 'inline',
            }}
          >
            {s.text}.
          </span>
        </Tooltip>
      ))}
    </p>
  );
}
