import React, { useState } from 'react';
import type { Collection, Session } from '../types/index';
import { validateCollectionName, isNameDuplicate, getSessionsForCollection } from '../hooks/useCollectionStore';
import { CollectionPicker } from './CollectionPicker';

export interface CollectionDetailProps {
  collection: Collection;
  allCollections: Collection[];
  sessions: Session[];
  onBack: () => void;
  onRename: (id: string, newName: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRestoreSession: (session: Session) => void;
  onMoveSession: (sessionId: string, collectionId: string | null) => Promise<void>;
  onDeleteSession: (sessionId: string) => Promise<void>;
  onCreateCollection: (name: string) => Promise<Collection>;
  onRenameSession: (sessionId: string, newName: string) => Promise<void>;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

export function CollectionDetail({
  collection,
  allCollections,
  sessions,
  onBack,
  onRename,
  onDelete,
  onRestoreSession,
  onMoveSession,
  onDeleteSession,
  onCreateCollection,
  onRenameSession,
}: CollectionDetailProps) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(collection.name);
  const [editError, setEditError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [movingSessionId, setMovingSessionId] = useState<string | null>(null);
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(null);
  const [sessionNewName, setSessionNewName] = useState('');

  const collectionSessions = getSessionsForCollection(sessions, collection.id);

  const handleRename = async () => {
    const err = validateCollectionName(editName);
    if (err) { setEditError(err); return; }
    if (isNameDuplicate(editName, allCollections, collection.id)) {
      setEditError('A collection with this name already exists');
      return;
    }
    try {
      await onRename(collection.id, editName.trim());
      setEditing(false);
      setEditError(null);
    } catch (e) {
      setEditError(e instanceof Error ? e.message : 'Rename failed');
    }
  };

  const handleDeleteConfirm = async () => {
    await onDelete(collection.id);
    setConfirmDelete(false);
    onBack();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to collections"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary, #94a3b8)',
            cursor: 'pointer',
            fontSize: 20,
            padding: '4px 8px',
          }}
        >
          ←
        </button>

        {editing ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="text"
                value={editName}
                onChange={(e) => { setEditName(e.target.value); setEditError(null); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename();
                  if (e.key === 'Escape') { setEditing(false); setEditName(collection.name); setEditError(null); }
                }}
                aria-label="Rename collection"
                autoFocus
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-xs, 4px)',
                  border: editError ? '1px solid var(--color-error)' : '1px solid var(--border-default)',
                  background: 'var(--surface-3, #1a2235)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-lg, 1.125rem)',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
              <button type="button" onClick={handleRename} style={{ padding: '6px 12px', borderRadius: 'var(--radius-xs)', border: 'none', background: 'var(--color-primary)', color: '#fff', fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
                Save
              </button>
              <button type="button" onClick={() => { setEditing(false); setEditName(collection.name); setEditError(null); }} style={{ padding: '6px 12px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
            {editError && <div role="alert" style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-xs)' }}>{editError}</div>}
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2
              style={{ margin: 0, fontSize: 'var(--font-size-xl)', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
              onClick={() => setEditing(true)}
              title="Click to rename"
            >
              {collection.name}
            </h2>
            <span style={{ padding: '2px 10px', borderRadius: 'var(--radius-full)', background: 'rgba(99,102,241,0.15)', color: 'var(--color-primary-light)', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
              {collectionSessions.length}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          aria-label="Delete collection"
          style={{
            padding: '6px 12px',
            borderRadius: 'var(--radius-base, 8px)',
            border: '1px solid var(--color-error, #ef4444)',
            background: 'transparent',
            color: 'var(--color-error)',
            fontSize: 'var(--font-size-sm)',
            cursor: 'pointer',
          }}
        >
          Delete
        </button>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div
          role="alertdialog"
          aria-label="Confirm delete collection"
          style={{
            padding: 16,
            borderRadius: 'var(--radius-md)',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.3)',
          }}
        >
          <p style={{ margin: '0 0 12px', color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)' }}>
            Delete "{collection.name}"? Sessions will be moved to Uncategorized.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={handleDeleteConfirm} style={{ padding: '6px 14px', borderRadius: 'var(--radius-xs)', border: 'none', background: 'var(--color-error)', color: '#fff', fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
              Delete
            </button>
            <button type="button" onClick={() => setConfirmDelete(false)} style={{ padding: '6px 14px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sessions list */}
      {collectionSessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-tertiary)' }}>
          <p style={{ margin: 0 }}>No sessions in this collection yet.</p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {collectionSessions.map((session) => (
            <li
              key={session.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 12,
                borderRadius: 'var(--radius-base, 8px)',
                background: 'var(--glass-bg, rgba(17,24,39,0.7))',
                border: '1px solid var(--border-subtle)',
                backdropFilter: 'var(--glass-blur)',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                {renamingSessionId === session.id ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="text"
                      value={sessionNewName}
                      onChange={(e) => setSessionNewName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && sessionNewName.trim()) {
                          onRenameSession(session.id, sessionNewName.trim());
                          setRenamingSessionId(null);
                        }
                        if (e.key === 'Escape') setRenamingSessionId(null);
                      }}
                      autoFocus
                      aria-label="Rename session"
                      style={{
                        flex: 1,
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-xs, 4px)',
                        border: '1px solid var(--border-default)',
                        background: 'var(--surface-3, #1a2235)',
                        color: 'var(--text-primary)',
                        fontSize: 'var(--font-size-sm)',
                        outline: 'none',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => { if (sessionNewName.trim()) { onRenameSession(session.id, sessionNewName.trim()); setRenamingSessionId(null); } }}
                      style={{ padding: '3px 8px', borderRadius: 'var(--radius-xs)', border: 'none', background: 'var(--color-primary)', color: '#fff', fontSize: 'var(--font-size-xs)', cursor: 'pointer' }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setRenamingSessionId(null)}
                      style={{ padding: '3px 8px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)', cursor: 'pointer' }}
                    onClick={() => { setRenamingSessionId(session.id); setSessionNewName(session.fileName ?? 'Untitled'); }}
                    title="Click to rename"
                  >
                    {session.fileName ?? 'Untitled'}
                  </div>
                )}
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>
                  {formatDate(session.savedAt)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onRestoreSession(session)}
                aria-label={`Restore ${session.fileName ?? 'Untitled'}`}
                style={{ padding: '4px 10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-primary)', background: 'transparent', color: 'var(--color-primary-light)', fontSize: 'var(--font-size-xs)', cursor: 'pointer' }}
              >
                Restore
              </button>

              {movingSessionId === session.id ? (
                <CollectionPicker
                  collections={allCollections}
                  selectedId={session.collectionId ?? null}
                  onSelect={async (cid) => { await onMoveSession(session.id, cid); setMovingSessionId(null); }}
                  onCreate={onCreateCollection}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setMovingSessionId(session.id)}
                  aria-label={`Move ${session.fileName ?? 'Untitled'}`}
                  style={{ padding: '4px 10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-default)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)', cursor: 'pointer' }}
                >
                  Move to…
                </button>
              )}

              <button
                type="button"
                onClick={() => onDeleteSession(session.id)}
                aria-label={`Delete ${session.fileName ?? 'Untitled'}`}
                style={{ padding: '4px 10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-error)', background: 'transparent', color: 'var(--color-error)', fontSize: 'var(--font-size-xs)', cursor: 'pointer' }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
