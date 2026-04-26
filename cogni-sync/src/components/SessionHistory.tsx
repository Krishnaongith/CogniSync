import React from 'react';
import type { Session, Collection } from '../types/index';
import { CollectionPicker } from './CollectionPicker';

interface SessionHistoryProps {
  sessions: Session[];
  onRestore: (session: Session) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  collections?: Collection[];
  onMoveSession?: (sessionId: string, collectionId: string | null) => Promise<void>;
  onCreateCollection?: (name: string) => Promise<Collection>;
}

function formatDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function SessionHistory({ sessions, onRestore, onDelete, onClose, collections, onMoveSession, onCreateCollection }: SessionHistoryProps) {
  const sorted = [...sessions].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Session History"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: 'var(--color-surface, #fff)',
          borderRadius: '12px',
          padding: '24px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Session History</h2>
          <button
            onClick={onClose}
            aria-label="Close session history"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.25rem',
              lineHeight: 1,
              padding: '4px 8px',
            }}
          >
            ✕
          </button>
        </div>

        {sorted.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted, #888)', textAlign: 'center', margin: '24px 0' }}>
            No saved sessions yet.
          </p>
        ) : (
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {sorted.map((session) => (
              <li
                key={session.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'var(--color-surface-alt, #f5f5f5)',
                  cursor: 'pointer',
                }}
                onClick={() => onRestore(session)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {session.fileName ?? 'Untitled'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted, #888)', marginTop: '2px' }}>
                    {formatDate(session.savedAt)}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestore(session);
                  }}
                  aria-label={`Restore session ${session.fileName ?? 'Untitled'}`}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-primary, #6366f1)',
                    background: 'transparent',
                    color: 'var(--color-primary, #6366f1)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Restore
                </button>

                {collections && onMoveSession && onCreateCollection && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <CollectionPicker
                      collections={collections}
                      selectedId={session.collectionId ?? null}
                      onSelect={async (cid) => { await onMoveSession(session.id, cid); }}
                      onCreate={onCreateCollection}
                    />
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(session.id);
                  }}
                  aria-label={`Delete session ${session.fileName ?? 'Untitled'}`}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-error, #ef4444)',
                    background: 'transparent',
                    color: 'var(--color-error, #ef4444)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
