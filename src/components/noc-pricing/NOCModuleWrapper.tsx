'use client';

import React, { useState } from 'react';
import { NOCLandingPage } from './NOCLandingPage';
import { NOCPricingSystem } from './NOCPricingSystem';

export function NOCModuleWrapper() {
  const [view, setView] = useState<'landing' | 'new-proposal' | 'admin'>('landing');

  if (view === 'landing') {
    return (
      <NOCLandingPage
        onNewProposal={() => setView('new-proposal')}
        onAdminPanel={() => setView('admin')}
      />
    );
  }

  if (view === 'new-proposal' || view === 'admin') {
    return <NOCPricingSystem onBack={() => setView('landing')} />;
  }

  return null;
}
