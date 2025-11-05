"use client";

import { useCallback } from 'react';
import { useQuotes } from '@/contexts/QuoteContext';
import { PricingProposal } from '@/hooks/use-quote-integration';

export function usePricingIntegration() {
  const { createQuoteFromProposal } = useQuotes();

  const createQuoteFromPricingData = useCallback((
    proposalData: {
      name: string;
      clientName: string;
      totalPrice: number;
      module: PricingProposal['module'];
      technicalSpecs?: any;
      clientData?: PricingProposal['clientData'];
    }
  ) => {
    const pricingProposal: PricingProposal = {
      id: `${proposalData.module.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
      name: proposalData.name,
      clientName: proposalData.clientName,
      date: new Date().toISOString(),
      totalPrice: proposalData.totalPrice,
      module: proposalData.module,
      clientData: proposalData.clientData,
      technicalSpecs: proposalData.technicalSpecs
    };

    try {
      const quote = createQuoteFromProposal(pricingProposal);
      console.log(`Orçamento criado para ${proposalData.module}:`, quote);
      return quote;
    } catch (error) {
      console.error(`Erro ao criar orçamento para ${proposalData.module}:`, error);
      throw error;
    }
  }, [createQuoteFromProposal]);

  return {
    createQuoteFromPricingData
  };
}