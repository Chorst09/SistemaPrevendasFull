/**
 * Unified Proposal Service
 * Serviço unificado para gerenciar todas as propostas (Comerciais e NOC)
 */

import { CommercialProposal } from '@/lib/types/commercial-proposal';
import { NOCProposal } from './noc-proposal-service';

export type ProposalType = 'commercial' | 'noc';

export interface UnifiedProposal {
  id: string;
  type: ProposalType;
  title: string;
  client: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  
  // Dados específicos
  commercialData?: CommercialProposal;
  nocData?: NOCProposal;
  
  // Referência para proposta NOC (quando é comercial)
  linkedNOCProposalId?: string;
}

export class UnifiedProposalService {
  private static readonly STORAGE_KEY = 'unified-proposals';

  /**
   * Salva uma proposta NOC
   */
  static async saveNOCProposal(nocProposal: Omit<NOCProposal, 'id' | 'updatedAt' | 'status'>): Promise<UnifiedProposal> {
    console.log('UnifiedProposalService.saveNOCProposal - Iniciando...', nocProposal);
    
    const proposals = this.getAllProposals();
    console.log('UnifiedProposalService.saveNOCProposal - Propostas existentes:', proposals.length);
    
    // Gerar ID único com timestamp + random
    const uniqueId = `noc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const unifiedProposal: UnifiedProposal = {
      id: uniqueId,
      type: 'noc',
      title: nocProposal.title,
      client: nocProposal.client,
      createdAt: nocProposal.createdAt,
      updatedAt: new Date().toISOString(),
      status: 'draft',
      nocData: {
        ...nocProposal,
        id: uniqueId,
        updatedAt: new Date().toISOString(),
        status: 'draft'
      } as NOCProposal
    };

    console.log('UnifiedProposalService.saveNOCProposal - Proposta criada:', unifiedProposal);
    
    proposals.push(unifiedProposal);
    console.log('UnifiedProposalService.saveNOCProposal - Total após adicionar:', proposals.length);
    
    this.saveToStorage(proposals);
    
    // Verificar se foi salvo
    const savedProposals = this.getAllProposals();
    console.log('UnifiedProposalService.saveNOCProposal - Verificação após salvar:', savedProposals.length);
    
    const found = savedProposals.find(p => p.id === uniqueId);
    console.log('UnifiedProposalService.saveNOCProposal - Proposta encontrada após salvar:', found ? 'SIM' : 'NÃO');

    console.log('UnifiedProposalService - Proposta NOC salva com sucesso:', unifiedProposal.id);
    return unifiedProposal;
  }

  /**
   * Salva uma proposta comercial
   */
  static async saveCommercialProposal(
    commercialProposal: CommercialProposal,
    linkedNOCProposalId?: string
  ): Promise<UnifiedProposal> {
    const proposals = this.getAllProposals();
    
    // Converter datas para string se necessário
    const createdAt = typeof commercialProposal.createdAt === 'string' 
      ? commercialProposal.createdAt 
      : commercialProposal.createdAt.toISOString();
    
    const updatedAt = typeof commercialProposal.updatedAt === 'string'
      ? commercialProposal.updatedAt
      : commercialProposal.updatedAt.toISOString();
    
    const unifiedProposal: UnifiedProposal = {
      id: commercialProposal.id,
      type: 'commercial',
      title: commercialProposal.title,
      client: commercialProposal.client?.name || commercialProposal.cover.clientName || 'Cliente não informado',
      createdAt,
      updatedAt,
      status: commercialProposal.status as any,
      commercialData: commercialProposal,
      linkedNOCProposalId
    };

    // Verifica se já existe
    const existingIndex = proposals.findIndex(p => p.id === unifiedProposal.id);
    if (existingIndex >= 0) {
      proposals[existingIndex] = unifiedProposal;
    } else {
      proposals.push(unifiedProposal);
    }

    this.saveToStorage(proposals);

    console.log('UnifiedProposalService - Proposta Comercial salva:', unifiedProposal.id);
    return unifiedProposal;
  }

  /**
   * Obtém todas as propostas
   */
  static getAllProposals(): UnifiedProposal[] {
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
   * Obtém propostas por tipo
   */
  static getProposalsByType(type: ProposalType): UnifiedProposal[] {
    return this.getAllProposals().filter(p => p.type === type);
  }

  /**
   * Obtém apenas propostas NOC (para seleção)
   */
  static getNOCProposalsForSelection(): Array<{ id: string; title: string; client: string }> {
    return this.getProposalsByType('noc').map(p => ({
      id: p.id,
      title: p.title,
      client: p.client
    }));
  }

  /**
   * Obtém uma proposta por ID
   */
  static getProposalById(id: string): UnifiedProposal | null {
    const proposals = this.getAllProposals();
    return proposals.find(p => p.id === id) || null;
  }

  /**
   * Obtém proposta NOC vinculada
   */
  static getLinkedNOCProposal(commercialProposalId: string): UnifiedProposal | null {
    const commercial = this.getProposalById(commercialProposalId);
    if (!commercial || !commercial.linkedNOCProposalId) return null;
    
    return this.getProposalById(commercial.linkedNOCProposalId);
  }

  /**
   * Atualiza uma proposta
   */
  static async updateProposal(id: string, updates: Partial<UnifiedProposal>): Promise<UnifiedProposal | null> {
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
  private static saveToStorage(proposals: UnifiedProposal[]): void {
    if (typeof window === 'undefined') {
      console.log('UnifiedProposalService.saveToStorage - Window undefined, não salvando');
      return;
    }

    try {
      const key = this.STORAGE_KEY;
      const data = JSON.stringify(proposals);
      console.log('UnifiedProposalService.saveToStorage - Salvando:', key, proposals.length, 'propostas');
      console.log('UnifiedProposalService.saveToStorage - Dados:', data.substring(0, 200) + '...');
      
      localStorage.setItem(key, data);
      
      // Verificar se foi salvo
      const saved = localStorage.getItem(key);
      console.log('UnifiedProposalService.saveToStorage - Verificação:', saved ? `Salvo com sucesso (${saved.length} chars)` : 'ERRO: Não foi salvo');
      
      // Verificar se pode fazer parse
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('UnifiedProposalService.saveToStorage - Parse OK:', parsed.length, 'propostas');
      }
    } catch (error) {
      console.error('UnifiedProposalService.saveToStorage - Error saving proposals:', error);
      throw error;
    }
  }

  /**
   * Migra propostas antigas para o novo formato
   */
  static async migrateOldProposals(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      // Migrar propostas comerciais antigas
      const oldCommercial = localStorage.getItem('commercial-proposals');
      if (oldCommercial) {
        const commercialProposals = JSON.parse(oldCommercial) as CommercialProposal[];
        console.log('Migrando', commercialProposals.length, 'propostas comerciais...');
        
        for (const proposal of commercialProposals) {
          await this.saveCommercialProposal(proposal);
        }
        
        // Backup e remove
        localStorage.setItem('commercial-proposals-backup', oldCommercial);
        localStorage.removeItem('commercial-proposals');
      }

      // Migrar propostas NOC antigas
      const oldNOC = localStorage.getItem('noc-proposals');
      if (oldNOC) {
        const nocProposals = JSON.parse(oldNOC) as NOCProposal[];
        console.log('Migrando', nocProposals.length, 'propostas NOC...');
        
        for (const proposal of nocProposals) {
          await this.saveNOCProposal(proposal);
        }
        
        // Backup e remove
        localStorage.setItem('noc-proposals-backup', oldNOC);
        localStorage.removeItem('noc-proposals');
      }

      console.log('Migração concluída!');
    } catch (error) {
      console.error('Erro na migração:', error);
    }
  }
}
