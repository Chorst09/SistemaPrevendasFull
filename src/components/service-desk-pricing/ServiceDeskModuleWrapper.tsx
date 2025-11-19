'use client';

import React, { useState } from 'react';
import { ServiceDeskLandingPage } from './ServiceDeskLandingPage';
import { ServiceDeskPricingSystem } from './ServiceDeskPricingSystem';
import { ProposalClientDataForm, ProposalClientData } from '@/components/shared/ProposalClientDataForm';

export function ServiceDeskModuleWrapper() {
  const [view, setView] = useState<'landing' | 'client-data' | 'pricing' | 'admin'>('landing');
  const [clientData, setClientData] = useState<ProposalClientData | null>(null);

  if (view === 'landing') {
    return (
      <ServiceDeskLandingPage
        onNewProposal={() => setView('client-data')}
        onAdminPanel={() => setView('admin')}
      />
    );
  }

  if (view === 'client-data') {
    return (
      <ProposalClientDataForm
        moduleType="service-desk"
        onSubmit={(data) => {
          setClientData(data);
          setView('pricing');
        }}
        onBack={() => setView('landing')}
      />
    );
  }

  if (view === 'pricing' || view === 'admin') {
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
