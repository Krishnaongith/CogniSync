import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './pages/AppShell';
import { SimplifyView } from './pages/SimplifyView';
import { HistoryView } from './pages/HistoryView';
import { DigestView } from './pages/DigestView';
import { ProgressView } from './pages/ProgressView';
import { CollectionsPage } from './pages/CollectionsPage';
import { LandingPage } from './pages/LandingPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/app',
    element: <AppShell />,
    children: [
      { index: true, element: <SimplifyView /> },
      { path: 'simplify', element: <SimplifyView /> },
      { path: 'history', element: <HistoryView /> },
      { path: 'digest', element: <DigestView /> },
      { path: 'progress', element: <ProgressView /> },
      { path: 'collections', element: <CollectionsPage /> },
      { path: 'collections/:collectionId', element: <CollectionsPage /> },
    ],
  },
  {
    path: '/privacy',
    element: <PrivacyPage />,
  },
  {
    path: '/terms',
    element: <TermsPage />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
