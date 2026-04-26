import { KeyPoint } from '../types/index';

interface StepByStepViewProps {
  keyPoints: KeyPoint[];
}

export function StepByStepView({ keyPoints }: StepByStepViewProps) {
  if (keyPoints.length === 0) {
    return (
      <p style={{ color: '#777', fontStyle: 'italic' }}>
        No key points to display.
      </p>
    );
  }

  return (
    <ol style={{ paddingLeft: 24, lineHeight: 1.8 }}>
      {keyPoints.map((kp) => (
        <li key={kp.id} style={{ marginBottom: 10 }}>
          {kp.text}
        </li>
      ))}
    </ol>
  );
}
