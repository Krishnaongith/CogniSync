import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionHistory } from '../components/SessionHistory';
import { useAppContext } from '../context/AppContext';
import { useCollectionStore } from '../hooks/useCollectionStore';
import { useSessionStore } from '../hooks/useSessionStore';
import type { Collection } from '../types/index';

export function HistoryView() {
  const { savedSessions, restoreSession, deleteSession, showToast } = useAppContext();
  const navigate = useNavigate();
  const collectionStore = useCollectionStore(showToast);
  const sessionStore = useSessionStore(showToast);
  const [collections, setCollections] = useState<Collection[]>([]);

  const refreshCollections = useCallback(async () => {
    setCollections(await collectionStore.getAllCollections());
  }, []);

  useEffect(() => { refreshCollections(); }, [refreshCollections]);

  const handleMoveSession = async (sessionId: string, collectionId: string | null) => {
    await sessionStore.updateSession(sessionId, { collectionId });
    await refreshCollections();
  };

  const handleCreateCollection = async (name: string) => {
    const c = await collectionStore.createCollection(name);
    await refreshCollections();
    return c;
  };

  return (
    <SessionHistory
      sessions={savedSessions}
      onRestore={(s) => { restoreSession(s); navigate('/app'); }}
      onDelete={deleteSession}
      onClose={() => navigate('/app')}
      collections={collections}
      onMoveSession={handleMoveSession}
      onCreateCollection={handleCreateCollection}
    />
  );
}
