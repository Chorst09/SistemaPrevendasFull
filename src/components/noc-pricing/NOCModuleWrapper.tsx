'use client';

import React, { useState } from 'react';
import { NOCLandingPage } from './NOCLandingPage';
import { NOCPricingSystem } from './NOCPricingSystem';
import { ProposalClientDataForm, ProposalClientData } from '@/components/shared/ProposalClientDataForm';

export function NOCModuleWrapper() {
  const [view, setView] = useState<'landing' | 'client-data' | 'pricing' | 'admin'>('landing');
  const [clientData, setClientData] = useState<ProposalClientData | null>(null);

  if (view === 'landing') {
    return (
      <NOCLandingPage
        onNewProposal={() => setView('client-data')}
        onAdminPanel={() => setView('admin')}
      />
    );
  }

  if (view === 'client-data') {
    return (
      <ProposalClientDataForm
        moduleType="noc"
        onSubmit={(data) => {
          setClientData(data);
          setView('pricing');
        }}
        onBack={() => setView('landing')}
      />
    );
  }

  if (view === 'pricing' || view === 'admin') {
    return <NOCPricingSystem onBack={() => setView('landing')} />;
  }

  return null;
}
