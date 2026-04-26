import React, { useState, useRef } from 'react';
import type { Annotation } from '../types';
import { HIGHLIGHT_PALETTE } from '../hooks/useAnnotations';

interface AnnotationLayerProps {
  text: string;
  sessionId: string;
  annotations: Annotation[];
  onAdd: (a: Annotation) => void;
  onDelete: (id: string) => void;
}

interface SelectionInfo {
  startOffset: number;
  endOffset: number;
  rect: DOMRect;
}

export function AnnotationLayer({ text, sessionId, annotations, onAdd, onDelete }: AnnotationLayerProps) {
  const [annotateMode, setAnnotateMode] = useState(false);
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [activeNote, setActiveNote] = useState<Annotation | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleMouseUp() {
    if (!annotateMode) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !containerRef.current) return;

    const range = sel.getRangeAt(0);
    const containerText = containerRef.current.textContent ?? '';

    // Calculate offsets relative to container text
    const preRange = document.createRange();
    preRange.setStart(containerRef.current, 0);
    preRange.setEnd(range.startContainer, range.startOffset);
    const startOffset = preRange.toString().length;
    const endOffset = startOffset + range.toString().length;

    if (startOffset >= endOffset || endOffset > containerText.length) return;

    setSelection({ startOffset, endOffset, rect: range.getBoundingClientRect() });
    setShowNoteInput(false);
    setNoteInput('');
  }

  function handleHighlight(color: string) {
    if (!selection) return;
    const annotation: Annotation = {
      id: crypto.randomUUID(),
      sessionId,
      startOffset: selection.startOffset,
      endOffset: selection.endOffset,
      color,
      createdAt: new Date().toISOString(),
    };
    onAdd(annotation);
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }

  function handleAddNote() {
    setShowNoteInput(true);
  }

  function handleSaveNote() {
    if (!selection || !noteInput.trim()) return;
    const annotation: Annotation = {
      id: crypto.randomUUID(),
      sessionId,
      startOffset: selection.startOffset,
      endOffset: selection.endOffset,
      note: noteInput.trim(),
      createdAt: new Date().toISOString(),
    };
    onAdd(annotation);
    setSelection(null);
    setNoteInput('');
    setShowNoteInput(false);
    window.getSelection()?.removeAllRanges();
  }

  function dismissPopover() {
    setSelection(null);
    setShowNoteInput(false);
    setNoteInput('');
    window.getSelection()?.removeAllRanges();
  }

  // Build rendered segments with highlights
  function renderText() {
    // Collect all highlight annotations sorted by startOffset
    const highlights = annotations
      .filter(a => a.color)
      .sort((a, b) => a.startOffset - b.startOffset);

    const noteAnnotations = annotations.filter(a => a.note && !a.color);

    const segments: React.ReactNode[] = [];
    let cursor = 0;

    for (const ann of highlights) {
      const start = Math.max(ann.startOffset, cursor);
      const end = Math.min(ann.endOffset, text.length);
      if (start > cursor) {
        segments.push(<span key={`plain-${cursor}`}>{text.slice(cursor, start)}</span>);
      }
      if (start < end) {
        segments.push(
          <mark
            key={ann.id}
            style={{ backgroundColor: ann.color, cursor: 'pointer' }}
            title="Click to delete highlight"
            onClick={() => onDelete(ann.id)}
          >
            {text.slice(start, end)}
          </mark>
        );
        cursor = end;
      }
    }

    if (cursor < text.length) {
      segments.push(<span key={`plain-end`}>{text.slice(cursor)}</span>);
    }

    // Render note indicators
    const noteIndicators = noteAnnotations.map(ann => (
      <span
        key={`note-${ann.id}`}
        style={{ position: 'absolute', cursor: 'pointer', fontSize: '0.75rem' }}
        title={ann.note}
        onClick={() => setActiveNote(ann)}
      >
        📝
      </span>
    ));

    return (
      <>
        <span>{segments}</span>
        {noteIndicators}
      </>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => { setAnnotateMode(m => !m); setSelection(null); }}
        style={{ marginBottom: '0.5rem' }}
      >
        {annotateMode ? 'Done' : 'Annotate'}
      </button>

      <div
        ref={containerRef}
        onMouseUp={handleMouseUp}
        style={{ userSelect: annotateMode ? 'text' : 'auto', position: 'relative' }}
      >
        {renderText()}
      </div>

      {/* Selection popover */}
      {selection && (
        <div
          style={{
            position: 'fixed',
            top: selection.rect.bottom + window.scrollY + 4,
            left: selection.rect.left + window.scrollX,
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: 4,
            padding: '0.5rem',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          {!showNoteInput ? (
            <>
              <div style={{ marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.8rem' }}>Highlight</div>
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
                {HIGHLIGHT_PALETTE.map(color => (
                  <button
                    key={color}
                    onClick={() => handleHighlight(color)}
                    style={{
                      width: 20,
                      height: 20,
                      backgroundColor: color,
                      border: '1px solid #999',
                      borderRadius: 3,
                      cursor: 'pointer',
                    }}
                    title={color}
                  />
                ))}
              </div>
              <button onClick={handleAddNote} style={{ fontSize: '0.8rem' }}>Add note</button>
              <button onClick={dismissPopover} style={{ fontSize: '0.8rem', marginLeft: '0.5rem' }}>Cancel</button>
            </>
          ) : (
            <>
              <textarea
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                placeholder="Enter note..."
                rows={3}
                style={{ width: '200px', display: 'block', marginBottom: '0.25rem' }}
                autoFocus
              />
              <button onClick={handleSaveNote} style={{ fontSize: '0.8rem' }}>Save</button>
              <button onClick={dismissPopover} style={{ fontSize: '0.8rem', marginLeft: '0.5rem' }}>Cancel</button>
            </>
          )}
        </div>
      )}

      {/* Note popover */}
      {activeNote && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: 4,
            padding: '1rem',
            zIndex: 1001,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            maxWidth: 300,
          }}
        >
          <p style={{ margin: '0 0 0.5rem' }}>{activeNote.note}</p>
          <button onClick={() => { onDelete(activeNote.id); setActiveNote(null); }} style={{ fontSize: '0.8rem', marginRight: '0.5rem' }}>
            Delete
          </button>
          <button onClick={() => setActiveNote(null)} style={{ fontSize: '0.8rem' }}>Close</button>
        </div>
      )}
    </div>
  );
}
