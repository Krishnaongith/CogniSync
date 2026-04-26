import React, { useState, useRef, useEffect } from 'react';
import type { Collection } from '../types/index';
import {
  validateCollectionName,
  isNameDuplicate,
  sortCollectionsByUpdatedAt,
} from '../hooks/useCollectionStore';

export interface CollectionPickerProps {
  collections: Collection[];
  selectedId: string | null;
  onSelect: (collectionId: string | null) => void;
  onCreate: (name: string) => Promise<Collection>;
}

export function CollectionPicker({
  collections,
  selectedId,
  onSelect,
  onCreate,
}: CollectionPickerProps) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sorted = sortCollectionsByUpdatedAt(collections);
  const selectedLabel = selectedId
    ? sorted.find((c) => c.id === selectedId)?.name ?? 'Unknown'
    : 'Uncategorized';

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
        setNewName('');
        setError(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Focus input when creating
  useEffect(() => {
    if (creating && inputRef.current) inputRef.current.focus();
  }, [creating]);

  const handleCreate = async () => {
    const nameErr = validateCollectionName(newName);
    if (nameErr) { setError(nameErr); return; }
    if (isNameDuplicate(newName, collections)) {
      setError('A collection with this name already exists');
      return;
    }
    setSubmitting(true);
    try {
      const created = await onCreate(newName.trim());
      onSelect(created.id);
      setCreating(false);
      setNewName('');
      setError(null);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create collection');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleCreate(); }
    if (e.key === 'Escape') { setCreating(false); setNewName(''); setError(null); }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select collection"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          borderRadius: 'var(--radius-base, 8px)',
          border: '1px solid var(--border-default, rgba(99,102,241,0.15))',
          background: 'var(--glass-bg, rgba(17,24,39,0.7))',
          color: 'var(--text-primary, #f0f4ff)',
          fontSize: 'var(--font-size-sm, 0.875rem)',
          cursor: 'pointer',
          backdropFilter: 'var(--glass-blur, blur(20px))',
          transition: 'border-color var(--transition-fast, 150ms ease-out)',
          minWidth: 140,
        }}
      >
        <span style={{ fontSize: 14 }} aria-hidden="true">📁</span>
        <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedLabel}
        </span>
        <span style={{ fontSize: 10, opacity: 0.6 }} aria-hidden="true">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Collections"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: 4,
            minWidth: 220,
            maxHeight: 280,
            overflowY: 'auto',
            background: 'var(--color-surface-overlay, rgba(13,20,36,0.95))',
            border: '1px solid var(--border-default, rgba(99,102,241,0.15))',
            borderRadius: 'var(--radius-md, 12px)',
            boxShadow: 'var(--glass-shadow)',
            backdropFilter: 'var(--glass-blur, blur(20px))',
            zIndex: 100,
            padding: '4px 0',
          }}
        >
          {/* Create new */}
          {!creating ? (
            <button
              type="button"
              onClick={() => setCreating(true)}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--border-subtle, rgba(99,102,241,0.08))',
                color: 'var(--color-primary-light, #818cf8)',
                fontSize: 'var(--font-size-sm, 0.875rem)',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span aria-hidden="true">＋</span> New collection
            </button>
          ) : (
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle, rgba(99,102,241,0.08))' }}>
              <input
                ref={inputRef}
                type="text"
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setError(null); }}
                onKeyDown={handleKeyDown}
                placeholder="Collection name…"
                disabled={submitting}
                aria-label="New collection name"
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-xs, 4px)',
                  border: error
                    ? '1px solid var(--color-error, #ef4444)'
                    : '1px solid var(--border-default, rgba(99,102,241,0.15))',
                  background: 'var(--surface-3, #1a2235)',
                  color: 'var(--text-primary, #f0f4ff)',
                  fontSize: 'var(--font-size-sm, 0.875rem)',
                  outline: 'none',
                }}
              />
              {error && (
                <div role="alert" style={{ color: 'var(--color-error, #ef4444)', fontSize: 'var(--font-size-xs, 0.75rem)', marginTop: 4 }}>
                  {error}
                </div>
              )}
              <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={submitting}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-xs, 4px)',
                    border: 'none',
                    background: 'var(--color-primary, #6366f1)',
                    color: '#fff',
                    fontSize: 'var(--font-size-xs, 0.75rem)',
                    cursor: submitting ? 'wait' : 'pointer',
                  }}
                >
                  {submitting ? '…' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => { setCreating(false); setNewName(''); setError(null); }}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-xs, 4px)',
                    border: '1px solid var(--border-default)',
                    background: 'transparent',
                    color: 'var(--text-secondary, #94a3b8)',
                    fontSize: 'var(--font-size-xs, 0.75rem)',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Uncategorized option */}
          <div
            role="option"
            aria-selected={selectedId === null}
            tabIndex={0}
            onClick={() => { onSelect(null); setOpen(false); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { onSelect(null); setOpen(false); } }}
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
              background: selectedId === null ? 'rgba(99,102,241,0.12)' : 'transparent',
              color: 'var(--text-secondary, #94a3b8)',
              fontSize: 'var(--font-size-sm, 0.875rem)',
              fontStyle: 'italic',
            }}
          >
            Uncategorized
          </div>

          {/* Collection list */}
          {sorted.map((c) => (
            <div
              key={c.id}
              role="option"
              aria-selected={selectedId === c.id}
              tabIndex={0}
              onClick={() => { onSelect(c.id); setOpen(false); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { onSelect(c.id); setOpen(false); } }}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                background: selectedId === c.id ? 'rgba(99,102,241,0.12)' : 'transparent',
                color: 'var(--text-primary, #f0f4ff)',
                fontSize: 'var(--font-size-sm, 0.875rem)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {c.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
