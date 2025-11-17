/**
 * Generated Proposal Service
 * Serviço para gerenciar propostas comerciais geradas (PDFs)
 */

import { CommercialProposal } from '@/lib/types/commercial-proposal';

export interface GeneratedProposal {
  id: string;
  proposalId: string; // ID da proposta comercial original
  title: string;
  client: string;
  proposalNumber: string;
  generatedAt: string;
  generatedBy?: string;
  status: 'generated' | 'sent' | 'approved' | 'rejected';
  pdfUrl?: string;
  
  // Dados da proposta original
  proposalData: CommercialProposal;
  
  // Metadados
  fileSize?: number;
  pageCount?: number;
  notes?: string;
}

export class GeneratedProposalService {
  private static readonly STORAGE_KEY = 'generated-proposals';

  /**
   * Salva uma proposta gerada
   */
  static saveGeneratedProposal(proposal: CommercialProposal): GeneratedProposal {
    const proposals = this.getAllGeneratedProposals();
    
    const generatedProposal: GeneratedProposal = {
      id: `gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      proposalId: proposal.id,
      title: proposal.title,
      client: proposal.client?.name || proposal.cover.clientName || 'Cliente não informado',
      proposalNumber: proposal.proposalNumber,
      generatedAt: new Date().toISOString(),
      status: 'generated',
      proposalData: proposal
    };

    // Verificar se já existe uma proposta gerada para este ID
    const existingIndex = proposals.findIndex(p => p.proposalId === proposal.id);
    if (existingIndex >= 0) {
      // Atualizar existente
      proposals[existingIndex] = {
        ...proposals[existingIndex],
        ...generatedProposal,
        id: proposals[existingIndex].id // Manter o ID original
      };
    } else {
      // Adicionar nova
      proposals.push(generatedProposal);
    }

    this.saveToStorage(proposals);
    console.log('GeneratedProposalService - Proposta gerada salva:', generatedProposal.id);
    
    return generatedProposal;
  }

  /**
   * Obtém todas as propostas geradas
   */
  static getAllGeneratedProposals(): GeneratedProposal[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading generated proposals:', error);
      return [];
    }
  }

  /**
   * Obtém propostas geradas para seleção (formato simplificado)
   */
  static getGeneratedProposalsForSelection(): Array<{
    id: string;
    title: string;
    client: string;
    proposalNumber: string;
    generatedAt: string;
  }> {
    return this.getAllGeneratedProposals().map(p => ({
      id: p.id,
      title: p.title,
      client: p.client,
      proposalNumber: p.proposalNumber,
      generatedAt: p.generatedAt
    }));
  }

  /**
   * Obtém uma proposta gerada por ID
   */
  static getGeneratedProposalById(id: string): GeneratedProposal | null {
    const proposals = this.getAllGeneratedProposals();
    return proposals.find(p => p.id === id) || null;
  }

  /**
   * Obtém proposta gerada pelo ID da proposta original
   */
  static getGeneratedProposalByProposalId(proposalId: string): GeneratedProposal | null {
    const proposals = this.getAllGeneratedProposals();
    return proposals.find(p => p.proposalId === proposalId) || null;
  }

  /**
   * Atualiza o status de uma proposta gerada
   */
  static updateStatus(id: string, status: GeneratedProposal['status']): boolean {
    const proposals = this.getAllGeneratedProposals();
    const index = proposals.findIndex(p => p.id === id);

    if (index === -1) return false;

    proposals[index].status = status;
    this.saveToStorage(proposals);
    return true;
  }

  /**
   * Atualiza uma proposta gerada
   */
  static updateGeneratedProposal(id: string, updates: Partial<GeneratedProposal>): GeneratedProposal | null {
    const proposals = this.getAllGeneratedProposals();
    const index = proposals.findIndex(p => p.id === id);

    if (index === -1) return null;

    proposals[index] = {
      ...proposals[index],
      ...updates
    };

    this.saveToStorage(proposals);
    return proposals[index];
  }

  /**
   * Deleta uma proposta gerada
   */
  static deleteGeneratedProposal(id: string): boolean {
    const proposals = this.getAllGeneratedProposals();
    const filtered = proposals.filter(p => p.id !== id);

    if (filtered.length === proposals.length) return false;

    this.saveToStorage(filtered);
    return true;
  }

  /**
   * Salva no localStorage
   */
  private static saveToStorage(proposals: GeneratedProposal[]): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(proposals));
      console.log('GeneratedProposalService - Salvo:', proposals.length, 'propostas geradas');
    } catch (error) {
      console.error('Error saving generated proposals:', error);
      throw error;
    }
  }

  /**
   * Migra propostas do serviço antigo de propostas geradas
   */
  static async migrateFromOldService(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      // Buscar propostas do serviço antigo (se existir)
      const oldKey = 'printer-proposals'; // ou outro nome que você usava
      const oldData = localStorage.getItem(oldKey);
      
      if (oldData) {
        const oldProposals = JSON.parse(oldData);
        console.log('Migrando', oldProposals.length, 'propostas antigas...');
        
        for (const proposal of oldProposals) {
          // Converter para o novo formato se necessário
          if (proposal.proposalData) {
            this.saveGeneratedProposal(proposal.proposalData);
          }
        }
        
        console.log('Migração de propostas geradas concluída!');
      }
    } catch (error) {
      console.error('Erro na migração de propostas geradas:', error);
    }
  }

  /**
   * Limpa todas as propostas geradas
   */
  static clearAll(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('GeneratedProposalService - Todas as propostas geradas foram removidas');
  }
}
