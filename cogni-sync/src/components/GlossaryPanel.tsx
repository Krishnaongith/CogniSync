import type { JargonTerm } from '../types';

interface GlossaryPanelProps {
  terms: JargonTerm[];
}

export function GlossaryPanel({ terms }: GlossaryPanelProps) {
  if (terms.length === 0) return null;

  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
        Glossary
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {terms.map((t, i) => (
          <div
            key={i}
            style={{
              background: 'var(--color-surface, rgba(255,255,255,0.05))',
              border: '1px solid var(--color-border, rgba(255,255,255,0.1))',
              borderRadius: 8,
              padding: '12px 16px',
            }}
          >
            <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#7c6fcd', fontSize: 14 }}>
              {t.term}
            </p>
            <p style={{ margin: '0 0 4px', fontSize: 14 }}>
              {t.definition}
            </p>
            <p style={{ margin: 0, opacity: 0.65, fontSize: 13, fontStyle: 'italic' }}>
              "{t.exampleSentence}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
