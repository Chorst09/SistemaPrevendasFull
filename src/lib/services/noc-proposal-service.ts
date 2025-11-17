/**
 * NOC Proposal Service
 * Serviço para gerenciar propostas NOC
 */

import { NOCPricingData } from '@/lib/types/noc-pricing';

export interface NOCProposal {
  id: string;
  title: string;
  description: string;
  type: 'NOC';
  client: string;
  data: NOCPricingData;
  calculations: any;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
}

export class NOCProposalService {
  private static readonly STORAGE_KEY = 'noc-proposals';

  /**
   * Salva uma nova proposta
   */
  static async saveProposal(proposalData: Omit<NOCProposal, 'id' | 'updatedAt' | 'status'>): Promise<NOCProposal> {
    const proposals = this.getAllProposals();
    
    const newProposal: NOCProposal = {
      ...proposalData,
      id: `noc-${Date.now()}`,
      updatedAt: new Date().toISOString(),
      status: 'draft'
    };

    proposals.push(newProposal);
    this.saveToStorage(proposals);

    return newProposal;
  }

  /**
   * Atualiza uma proposta existente
   */
  static async updateProposal(id: string, updates: Partial<NOCProposal>): Promise<NOCProposal | null> {
    const proposals = this.getAllProposals();
    const index = proposals.findIndex(p => p.id === id);

    if (index === -1) return null;

    proposals[index] = {
      ...proposals[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveToStorage(proposals);
    return proposals[index];
  }

  /**
   * Obtém todas as propostas
   */
  static getAllProposals(): NOCProposal[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading proposals:', error);
      return [];
    }
  }

  /**
   * Obtém uma proposta por ID
   */
  static getProposalById(id: string): NOCProposal | null {
    const proposals = this.getAllProposals();
    return proposals.find(p => p.id === id) || null;
  }

  /**
   * Deleta uma proposta
   */
  static async deleteProposal(id: string): Promise<boolean> {
    const proposals = this.getAllProposals();
    const filtered = proposals.filter(p => p.id !== id);

    if (filtered.length === proposals.length) return false;

    this.saveToStorage(filtered);
    return true;
  }

  /**
   * Salva no localStorage
   */
  private static saveToStorage(proposals: NOCProposal[]): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(proposals));
    } catch (error) {
      console.error('Error saving proposals:', error);
      throw error;
    }
  }

  /**
   * Exporta proposta para JSON
   */
  static exportToJSON(proposal: NOCProposal): string {
    return JSON.stringify(proposal, null, 2);
  }

  /**
   * Gera resumo da proposta para listagem
   */
  static getProposalSummary(proposal: NOCProposal) {
    return {
      id: proposal.id,
      title: proposal.title,
      client: proposal.client,
      totalDevices: proposal.data.totalDevices,
      teamSize: proposal.data.teamSize,
      monthlyPrice: proposal.calculations?.finalMonthlyPrice || 0,
      annualPrice: proposal.calculations?.finalAnnualPrice || 0,
      serviceLevel: proposal.data.project.serviceLevel,
      coverage: proposal.data.project.coverage,
      createdAt: proposal.createdAt,
      status: proposal.status
    };
  }
}
