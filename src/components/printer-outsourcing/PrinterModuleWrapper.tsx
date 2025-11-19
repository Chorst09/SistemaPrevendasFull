'use client';

import React, { useState } from 'react';
import { PrinterLandingPage } from './PrinterLandingPage';
import { PrinterOutsourcingModule } from './PrinterOutsourcingModule';

export function PrinterModuleWrapper() {
  const [view, setView] = useState<'landing' | 'new-proposal' | 'admin'>('landing');

  if (view === 'landing') {
    return (
      <PrinterLandingPage
        onNewProposal={() => setView('new-proposal')}
        onAdminPanel={() => setView('admin')}
      />
    );
  }

  if (view === 'new-proposal' || view === 'admin') {
    return (
      <PrinterOutsourcingModule
        onNavigateToProposals={() => {}}
        onBack={() => setView('landing')}
      />
    );
  }

  return null;
}
