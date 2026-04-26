import type { JargonTerm } from '../types';

interface GlossaryPanelProps {
  terms: JargonTerm[];
}

export function GlossaryPanel({ terms }: GlossaryPanelProps) {
  if (terms.length === 0) return null;

  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', marginBottom: 12 }}>
        Glossary
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {terms.map((t, i) => (
          <div
            key={i}
            style={{
              background: '#f8f7ff',
              border: '1px solid #e0e0f0',
              borderRadius: 8,
              padding: '12px 16px',
            }}
          >
            <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#4f46e5', fontSize: 14 }}>
              {t.term}
            </p>
            <p style={{ margin: '0 0 4px', color: '#333', fontSize: 14 }}>
              {t.definition}
            </p>
            <p style={{ margin: 0, color: '#666', fontSize: 13, fontStyle: 'italic' }}>
              "{t.exampleSentence}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
