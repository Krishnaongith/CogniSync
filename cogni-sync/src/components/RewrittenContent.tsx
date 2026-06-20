import { useState, useRef, useCallback } from 'react';
import { API_BASE } from '../config';
import type { AskResult, JargonTerm } from '../types';
import { addAnswer } from './askAnswerManager';

interface RewrittenContentProps {
  rewrittenText: string;
  originalText?: string;
  glossaryTerms?: JargonTerm[];
}

interface PopoverState {
  visible: boolean;
  x: number;
  y: number;
  selectedText: string;
}

interface QuestionState {
  active: boolean;
  question: string;
  loading: boolean;
  error: string | null;
}

export function RewrittenContent({ rewrittenText, originalText, glossaryTerms }: RewrittenContentProps) {
  const [popover, setPopover] = useState<PopoverState>({ visible: false, x: 0, y: 0, selectedText: '' });
  const [questionState, setQuestionState] = useState<QuestionState>({ active: false, question: '', loading: false, error: null });
  const [answers, setAnswers] = useState<AskResult[]>([]);
  const [glossaryPopover, setGlossaryPopover] = useState<{ term: JargonTerm; x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelectionEnd = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.toString().trim() === '') {
      setPopover(p => ({ ...p, visible: false }));
      return;
    }
    const selectedText = selection.toString().trim();
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    setPopover({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
      selectedText,
    });
  }, []);

  const handleAskClick = () => {
    setQuestionState({ active: true, question: popover.selectedText, loading: false, error: null });
    setPopover(p => ({ ...p, visible: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuestionState(q => ({ ...q, loading: true, error: null }));
    try {
      const res = await fetch(`${API_BASE}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectionText: popover.selectedText || questionState.question,
          question: questionState.question,
          context: rewrittenText,
        }),
      });
      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      const newAnswer: AskResult = {
        question: questionState.question,
        answer: data.answer,
        selectionText: popover.selectedText || questionState.question,
      };
      setAnswers(prev => addAnswer(prev, newAnswer));
      setQuestionState({ active: false, question: '', loading: false, error: null });
    } catch {
      setQuestionState(q => ({ ...q, loading: false, error: 'Something went wrong. Try again.' }));
    }
  };

  const hasFailed = !rewrittenText || rewrittenText.trim().length === 0;

  // Render a single line of text, applying bold (**text**) and glossary underlines
  function renderInline(line: string, glossary: typeof glossaryTerms) {
    // Split on **bold** markers
    const boldParts = line.split(/(\*\*[^*]+\*\*)/g);
    const nodes: React.ReactNode[] = [];

    boldParts.forEach((segment, bi) => {
      const boldMatch = segment.match(/^\*\*(.+)\*\*$/);
      const text = boldMatch ? boldMatch[1] : segment;
      const isBold = !!boldMatch;

      if (!glossary || glossary.length === 0) {
        nodes.push(isBold ? <strong key={bi}>{text}</strong> : <span key={bi}>{text}</span>);
        return;
      }

      const escaped = glossary.map(t => t.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');
      const subParts = text.split(pattern);

      const inner = subParts.map((sub, si) => {
        const matched = glossary.find(t => t.term.toLowerCase() === sub.toLowerCase());
        if (matched) {
          return (
            <span
              key={si}
              tabIndex={0}
              style={{ borderBottom: '2px dotted #6366f1', cursor: 'pointer' }}
              onClick={e => {
                const rect = (e.target as HTMLElement).getBoundingClientRect();
                setGlossaryPopover({ term: matched, x: rect.left + rect.width / 2, y: rect.top - 8 });
              }}
              onFocus={e => {
                const rect = (e.target as HTMLElement).getBoundingClientRect();
                setGlossaryPopover({ term: matched, x: rect.left + rect.width / 2, y: rect.top - 8 });
              }}
            >
              {sub}
            </span>
          );
        }
        return sub;
      });

      nodes.push(isBold ? <strong key={bi}>{inner}</strong> : <span key={bi}>{inner}</span>);
    });

    return nodes;
  }

  // Build highlighted text segments for glossary terms, with markdown rendering
  function renderTextWithGlossary() {
    const lines = rewrittenText.split('\n');
    return (
      <div style={{ lineHeight: 1.7, color: 'var(--text-primary)' }}>
        {lines.map((line, i) => {
          const h2 = line.match(/^##\s+(.+)/);
          const h3 = line.match(/^###\s+(.+)/);
          if (h2) return <h2 key={i} style={{ fontSize: 17, fontWeight: 700, margin: '20px 0 8px' }}>{h2[1]}</h2>;
          if (h3) return <h3 key={i} style={{ fontSize: 15, fontWeight: 600, margin: '16px 0 6px' }}>{h3[1]}</h3>;
          if (line.trim() === '') return <div key={i} style={{ height: 10 }} />;
          return <p key={i} style={{ margin: '0 0 8px' }}>{renderInline(line, glossaryTerms)}</p>;
        })}
      </div>
    );
  }

  if (hasFailed) {
    return (
      <div>
        <p style={{ color: '#c0392b', marginBottom: 8 }}>
          Simplification failed. Showing original content.
        </p>
        {originalText && (
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, color: 'var(--text-primary)' }}>
            {originalText}
          </p>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div
        onMouseUp={handleSelectionEnd}
        onTouchEnd={handleSelectionEnd}
        style={{ userSelect: 'text' }}
      >
        {renderTextWithGlossary()}
      </div>

      {/* Glossary term popover */}
      {glossaryPopover && (
        <div
          style={{
            position: 'fixed',
            left: glossaryPopover.x,
            top: glossaryPopover.y,
            transform: 'translate(-50%, -100%)',
            background: 'var(--color-surface, #fff)',
            border: '1px solid var(--border-default)',
            borderRadius: 8,
            padding: '10px 14px',
            zIndex: 1100,
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            maxWidth: 280,
          }}
        >
          <button
            onClick={() => setGlossaryPopover(null)}
            style={{ position: 'absolute', top: 6, right: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 16 }}
          >
            ×
          </button>
          <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#6366f1', fontSize: 14 }}>
            {glossaryPopover.term.term}
          </p>
          <p style={{ margin: '0 0 4px', color: 'var(--text-primary)', fontSize: 13 }}>
            {glossaryPopover.term.definition}
          </p>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 12, fontStyle: 'italic' }}>
            "{glossaryPopover.term.exampleSentence}"
          </p>
        </div>
      )}

      {/* Selection popover */}
      {popover.visible && (
        <div
          style={{
            position: 'fixed',
            left: popover.x,
            top: popover.y,
            transform: 'translate(-50%, -100%)',
            background: '#1a1a2e',
            color: '#fff',
            borderRadius: 6,
            padding: '6px 12px',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            whiteSpace: 'nowrap',
          }}
        >
          <button
            onClick={handleAskClick}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 13,
              padding: 0,
            }}
          >
            Ask about this
          </button>
        </div>
      )}

      {/* Inline question input */}
      {questionState.active && (
        <form onSubmit={handleSubmit} style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="text"
            value={questionState.question}
            onChange={e => setQuestionState(q => ({ ...q, question: e.target.value }))}
            placeholder="What does this mean?"
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: 4,
              border: '1px solid #ccc',
              fontSize: 14,
            }}
            autoFocus
          />
          <button
            type="submit"
            disabled={questionState.loading}
            style={{
              padding: '6px 14px',
              borderRadius: 4,
              background: '#4f46e5',
              color: '#fff',
              border: 'none',
              cursor: questionState.loading ? 'not-allowed' : 'pointer',
              fontSize: 14,
            }}
          >
            {questionState.loading ? '...' : 'Ask'}
          </button>
          <button
            type="button"
            onClick={() => setQuestionState({ active: false, question: '', loading: false, error: null })}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 18 }}
          >
            ×
          </button>
        </form>
      )}

      {/* Loading spinner */}
      {questionState.loading && (
        <p style={{ color: '#888', fontSize: 13, marginTop: 6 }}>Loading answer…</p>
      )}

      {/* Error message */}
      {questionState.error && (
        <p style={{ color: '#c0392b', fontSize: 13, marginTop: 6 }}>{questionState.error}</p>
      )}

      {/* Answers list */}
      {answers.length > 0 && (
        <div style={{ marginTop: 16 }}>
          {answers.map((a, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(99,102,241,0.08)',
                borderLeft: '3px solid #6366f1',
                borderRadius: 4,
                padding: '10px 14px',
                marginBottom: 10,
              }}
            >
              <p style={{ margin: '0 0 4px', fontSize: 13, color: 'var(--text-secondary)' }}>
                <em>"{a.selectionText}"</em>
              </p>
              <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                Q: {a.question}
              </p>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)' }}>{a.answer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
