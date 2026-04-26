import { ReadingMode } from '../types/index';

interface ReadingModeToggleProps {
  mode: ReadingMode;
  onSwitch: () => void;
}

export function ReadingModeToggle({ mode, onSwitch }: ReadingModeToggleProps) {
  const isFocus = mode === 'focus';

  return (
    <div style={{ display: 'inline-flex', border: '1px solid #ccc', borderRadius: 6, overflow: 'hidden' }}>
      <button
        onClick={isFocus ? undefined : onSwitch}
        style={{
          padding: '8px 18px',
          background: isFocus ? '#4a90e2' : '#fff',
          color: isFocus ? '#fff' : '#333',
          border: 'none',
          cursor: isFocus ? 'default' : 'pointer',
          fontWeight: isFocus ? 'bold' : 'normal',
        }}
      >
        Focus View
      </button>
      <button
        onClick={isFocus ? onSwitch : undefined}
        style={{
          padding: '8px 18px',
          background: !isFocus ? '#4a90e2' : '#fff',
          color: !isFocus ? '#fff' : '#333',
          border: 'none',
          borderLeft: '1px solid #ccc',
          cursor: !isFocus ? 'default' : 'pointer',
          fontWeight: !isFocus ? 'bold' : 'normal',
        }}
      >
        Step-by-Step
      </button>
    </div>
  );
}
