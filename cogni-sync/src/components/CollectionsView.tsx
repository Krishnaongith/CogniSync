import React, { useState } from 'react';
import type { Collection, Session } from '../types/index';
import {
  validateCollectionName,
  isNameDuplicate,
  sortCollectionsByUpdatedAt,
  getSessionsForCollection,
} from '../hooks/useCollectionStore';

export interface CollectionsViewProps {
  collections: Collection[];
  sessions: Session[];
  onSelectCollection: (id: string) => void;
  onCreate: (name: string) => Promise<Collection>;
}

export function CollectionsView({
  collections,
  sessions,
  onSelectCollection,
  onCreate,
}: CollectionsViewProps) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const sorted = sortCollectionsByUpdatedAt(collections);
  const uncategorized = getSessionsForCollection(sessions, null);

  const handleCreate = async () => {
    const nameErr = validateCollectionName(newName);
    if (nameErr) { setError(nameErr); return; }
    if (isNameDuplicate(newName, collections)) {
      setError('A collection with this name already exists');
      return;
    }
    setSubmitting(true);
    try {
      await onCreate(newName.trim());
      setCreating(false);
      setNewName('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleCreate(); }
    if (e.key === 'Escape') { setCreating(false); setNewName(''); setError(null); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 'var(--font-size-xl, 1.25rem)', fontWeight: 600, color: 'var(--text-primary)' }}>
          Collections
        </h2>
        {!creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-base, 8px)',
              border: '1px solid var(--color-primary, #6366f1)',
              background: 'transparent',
              color: 'var(--color-primary-light, #818cf8)',
              fontSize: 'var(--font-size-sm, 0.875rem)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span aria-hidden="true">＋</span> New Collection
          </button>
        )}
      </div>

      {/* Inline create */}
      {creating && (
        <div
          style={{
            padding: 16,
            borderRadius: 'var(--radius-md, 12px)',
            background: 'var(--glass-bg, rgba(17,24,39,0.7))',
            border: '1px solid var(--border-default)',
            backdropFilter: 'var(--glass-blur)',
          }}
        >
          <input
            type="text"
            value={newName}
            onChange={(e) => { setNewName(e.target.value); setError(null); }}
            onKeyDown={handleKeyDown}
            placeholder="Collection name…"
            disabled={submitting}
            aria-label="New collection name"
            autoFocus
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 'var(--radius-xs, 4px)',
              border: error ? '1px solid var(--color-error)' : '1px solid var(--border-default)',
              background: 'var(--surface-3, #1a2235)',
              color: 'var(--text-primary)',
              fontSize: 'var(--font-size-sm)',
              outline: 'none',
            }}
          />
          {error && (
            <div role="alert" style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-xs)', marginTop: 4 }}>
              {error}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              type="button"
              onClick={handleCreate}
              disabled={submitting}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-xs, 4px)',
                border: 'none',
                background: 'var(--color-primary, #6366f1)',
                color: '#fff',
                fontSize: 'var(--font-size-sm)',
                cursor: submitting ? 'wait' : 'pointer',
              }}
            >
              {submitting ? 'Creating…' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => { setCreating(false); setNewName(''); setError(null); }}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-xs, 4px)',
                border: '1px solid var(--border-default)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: 'var(--font-size-sm)',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {sorted.length === 0 && uncategorized.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: 'var(--text-tertiary, #64748b)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>📁</div>
          <p style={{ margin: 0 }}>No collections yet. Create one to organize your sessions.</p>
        </div>
      )}

      {/* Collection cards */}
      {sorted.map((c) => {
        const count = getSessionsForCollection(sessions, c.id).length;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelectCollection(c.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 16,
              borderRadius: 'var(--radius-md, 12px)',
              background: 'var(--glass-bg, rgba(17,24,39,0.7))',
              border: '1px solid var(--border-default)',
              backdropFilter: 'var(--glass-blur)',
              boxShadow: 'var(--glass-shadow)',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
              color: 'var(--text-primary)',
              transition: 'border-color var(--transition-fast)',
            }}
          >
            <span style={{ fontSize: 20 }} aria-hidden="true">📁</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {c.name}
              </div>
            </div>
            <span
              style={{
                padding: '2px 10px',
                borderRadius: 'var(--radius-full, 9999px)',
                background: 'rgba(99,102,241,0.15)',
                color: 'var(--color-primary-light, #818cf8)',
                fontSize: 'var(--font-size-xs, 0.75rem)',
                fontWeight: 600,
              }}
            >
              {count}
            </span>
            <span style={{ color: 'var(--text-tertiary)', fontSize: 14 }} aria-hidden="true">›</span>
          </button>
        );
      })}

      {/* Uncategorized section */}
      {uncategorized.length > 0 && (
        <div
          style={{
            marginTop: sorted.length > 0 ? 8 : 0,
            padding: 16,
            borderRadius: 'var(--radius-md, 12px)',
            background: 'var(--glass-bg, rgba(17,24,39,0.7))',
            border: '1px solid var(--border-subtle)',
            backdropFilter: 'var(--glass-blur)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 500, fontStyle: 'italic' }}>Uncategorized</span>
            <span
              style={{
                padding: '2px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(100,116,139,0.15)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
              }}
            >
              {uncategorized.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
