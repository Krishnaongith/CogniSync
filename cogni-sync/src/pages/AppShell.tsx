import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { OnboardingFlow } from '../components/OnboardingFlow';

export function AppShell() {
  const [showOnboarding, setShowOnboarding] = useState(
    () => localStorage.getItem('cognisync_onboarded') !== 'true'
  );

  function handleOnboardingComplete() {
    try { localStorage.setItem('cognisync_onboarded', 'true'); } catch {}
    setShowOnboarding(false);
  }

  return (
    <>
      <AppHeader />
      {showOnboarding && <OnboardingFlow onComplete={handleOnboardingComplete} />}
      <div style={{ paddingTop: 60 }}>
        <Outlet />
      </div>
    </>
  );
}
