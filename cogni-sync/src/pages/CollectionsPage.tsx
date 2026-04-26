import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Collection, Session } from '../types/index';
import { useCollectionStore } from '../hooks/useCollectionStore';
import { useSessionStore } from '../hooks/useSessionStore';
import { useAppContext } from '../context/AppContext';
import { CollectionsView } from '../components/CollectionsView';
import { CollectionDetail } from '../components/CollectionDetail';

export function CollectionsPage() {
  const { collectionId } = useParams<{ collectionId?: string }>();
  const navigate = useNavigate();
  const { showToast, restoreSession } = useAppContext();

  const collectionStore = useCollectionStore(showToast);
  const sessionStore = useSessionStore(showToast);

  const [collections, setCollections] = useState<Collection[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | undefined>();

  const refresh = useCallback(async () => {
    const [allC, allS] = await Promise.all([
      collectionStore.getAllCollections(),
      sessionStore.getAllSessions(),
    ]);
    setCollections(allC);
    setSessions(allS);
    if (collectionId) {
      setSelectedCollection(allC.find((c) => c.id === collectionId));
    }
  }, [collectionId]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleCreate = async (name: string) => {
    const c = await collectionStore.createCollection(name);
    await refresh();
    return c;
  };

  const handleSelectCollection = (id: string) => {
    navigate(`/app/collections/${id}`);
  };

  const handleBack = () => {
    navigate('/app/collections');
  };

  const handleRename = async (id: string, newName: string) => {
    await collectionStore.renameCollection(id, newName);
    await refresh();
  };

  const handleDeleteCollection = async (id: string) => {
    await collectionStore.deleteCollection(id);
    await refresh();
  };

  const handleMoveSession = async (sessionId: string, targetCollectionId: string | null) => {
    await sessionStore.updateSession(sessionId, { collectionId: targetCollectionId });
    await refresh();
  };

  const handleDeleteSession = async (sessionId: string) => {
    await sessionStore.deleteSession(sessionId);
    await refresh();
  };

  const handleRenameSession = async (sessionId: string, newName: string) => {
    await sessionStore.updateSession(sessionId, { fileName: newName });
    await refresh();
  };

  // If a collectionId is in the URL and we have the collection, show detail
  if (collectionId && selectedCollection) {
    return (
      <CollectionDetail
        collection={selectedCollection}
        allCollections={collections}
        sessions={sessions}
        onBack={handleBack}
        onRename={handleRename}
        onDelete={handleDeleteCollection}
        onRestoreSession={restoreSession}
        onMoveSession={handleMoveSession}
        onDeleteSession={handleDeleteSession}
        onCreateCollection={handleCreate}
        onRenameSession={handleRenameSession}
      />
    );
  }

  return (
    <CollectionsView
      collections={collections}
      sessions={sessions}
      onSelectCollection={handleSelectCollection}
      onCreate={handleCreate}
    />
  );
}
