import { useState, useRef, useCallback } from 'react';
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
      const res = await fetch('http://localhost:3001/ask', {
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

  // Build highlighted text segments for glossary terms
  function renderTextWithGlossary() {
    if (!glossaryTerms || glossaryTerms.length === 0) {
      return <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, color: 'var(--text-primary)' }}>{rewrittenText}</p>;
    }

    // Build a regex that matches any of the terms (case-insensitive)
    const escaped = glossaryTerms.map(t => t.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');
    const parts = rewrittenText.split(pattern);

    return (
      <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, color: 'var(--text-primary)' }}>
        {parts.map((part, i) => {
          const matchedTerm = glossaryTerms.find(
            t => t.term.toLowerCase() === part.toLowerCase()
          );
          if (matchedTerm) {
            return (
              <span
                key={i}
                tabIndex={0}
                style={{ borderBottom: '2px dotted #6366f1', cursor: 'pointer' }}
                onClick={e => {
                  const rect = (e.target as HTMLElement).getBoundingClientRect();
                  setGlossaryPopover({ term: matchedTerm, x: rect.left + rect.width / 2, y: rect.top - 8 });
                }}
                onFocus={e => {
                  const rect = (e.target as HTMLElement).getBoundingClientRect();
                  setGlossaryPopover({ term: matchedTerm, x: rect.left + rect.width / 2, y: rect.top - 8 });
                }}
              >
                {part}
              </span>
            );
          }
          return part;
        })}
      </p>
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
