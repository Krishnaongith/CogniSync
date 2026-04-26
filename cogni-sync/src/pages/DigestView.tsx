import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WeeklyDigest } from '../components/WeeklyDigest';
import { useAppContext } from '../context/AppContext';

export function DigestView() {
  const { savedSessions } = useAppContext();
  const navigate = useNavigate();

  return (
    <WeeklyDigest
      sessions={savedSessions}
      onClose={() => navigate('/app')}
    />
  );
}
