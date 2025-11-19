'use client';

import React, { useState } from 'react';
import { ServiceDeskLandingPage } from './ServiceDeskLandingPage';
import { ServiceDeskPricingSystem } from './ServiceDeskPricingSystem';

export function ServiceDeskModuleWrapper() {
  const [view, setView] = useState<'landing' | 'new-proposal' | 'admin'>('landing');

  if (view === 'landing') {
    return (
      <ServiceDeskLandingPage
        onNewProposal={() => setView('new-proposal')}
        onAdminPanel={() => setView('admin')}
      />
    );
  }

  if (view === 'new-proposal' || view === 'admin') {
    return (
      <ServiceDeskPricingSystem
        integrationMode="integrated"
        onDataChange={(data) => console.log('Service Desk data updated:', data)}
        onBack={() => setView('landing')}
      />
    );
  }

  return null;
}
