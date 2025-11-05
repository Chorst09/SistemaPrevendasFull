"use client";

import { useCallback } from 'react';
import { Quote } from '@/lib/types';

export interface PricingProposal {
  id: string;
  proposalNumber?: string;
  name: string;
  clientName: string;
  date: string;
  totalPrice: number;
  module: 'VM' | 'PABX/SIP' | 'Fiber Link' | 'Radio Internet' | 'Service Desk' | 'Printer Outsourcing' | 'IT Sales/Rental/Services';
  clientData?: {
    razaoSocial: string;
    nomeContato: string;
    telefoneCliente: string;
    emailCliente: string;
    nomeProjeto: string;
    nomeGerente: string;
    telefoneGerente: string;
    emailGerente: string;
  };
  technicalSpecs?: any; // Especificações técnicas específicas de cada módulo
}

export function useQuoteIntegration() {
  
  const convertProposalToQuote = useCallback((proposal: PricingProposal): Quote => {
    // Gerar ID único para o orçamento
    const quoteId = `QUO-${Date.now()}`;
    
    // Determinar o gerente de contas
    const accountManager = proposal.clientData?.nomeGerente || 'Não informado';
    
    // Converter proposta para orçamento
    const quote: Quote = {
      id: quoteId,
      client: proposal.clientData?.razaoSocial || proposal.clientName,
      projectName: proposal.clientData?.nomeProjeto || proposal.name,
      accountManager: accountManager,
      status: 'Pendente',
      total: proposal.totalPrice,
      date: proposal.date,
      distributorId: 1, // Distribuidor padrão - pode ser configurado
      quotationFile: '', // Será preenchido quando o arquivo for gerado
      pricingFile: `${proposal.module.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${proposal.id}.json`
    };

    return quote;
  }, []);

  const createQuoteFromProposal = useCallback((
    proposal: PricingProposal,
    onQuoteCreated?: (quote: Quote) => void
  ) => {
    try {
      const quote = convertProposalToQuote(proposal);
      
      // Callback para notificar que o orçamento foi criado
      if (onQuoteCreated) {
        onQuoteCreated(quote);
      }

      console.log('Orçamento criado a partir da proposta:', {
        proposalId: proposal.id,
        quoteId: quote.id,
        module: proposal.module,
        client: quote.client,
        total: quote.total
      });

      return quote;
    } catch (error) {
      console.error('Erro ao criar orçamento a partir da proposta:', error);
      throw error;
    }
  }, [convertProposalToQuote]);

  const getModuleDisplayName = useCallback((module: PricingProposal['module']): string => {
    const moduleNames = {
      'VM': 'Máquinas Virtuais',
      'PABX/SIP': 'PABX/SIP',
      'Fiber Link': 'Link via Fibra',
      'Radio Internet': 'Internet via Rádio',
      'Service Desk': 'Service Desk',
      'Printer Outsourcing': 'Outsourcing de Impressão',
      'IT Sales/Rental/Services': 'Venda/Locação/Serviços'
    };
    
    return moduleNames[module] || module;
  }, []);

  return {
    convertProposalToQuote,
    createQuoteFromProposal,
    getModuleDisplayName
  };
}