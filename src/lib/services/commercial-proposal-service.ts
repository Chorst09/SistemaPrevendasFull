/**
 * Serviço para gerenciar propostas comerciais
 */

import { CommercialProposal, ProposalStatus, ProposalTemplate } from '@/lib/types/commercial-proposal';

export class CommercialProposalService {
  private static readonly STORAGE_KEY = 'commercial-proposals';
  private static readonly TEMPLATES_KEY = 'proposal-templates';

  /**
   * Cria uma proposta vazia
   */
  static createEmptyProposal(): CommercialProposal {
    const now = new Date();
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 15); // Válida por 15 dias

    return {
      id: crypto.randomUUID(),
      title: 'Nova Proposta Comercial',
      proposalNumber: this.generateProposalNumber(),
      version: '1.0',
      status: ProposalStatus.DRAFT,
      createdAt: now,
      updatedAt: now,
      validUntil,

      // 1. Capa
      cover: {
        clientName: '',
        clientContact: '',
        ourCompany: 'Sua Empresa',
        ourContact: '',
        proposalDate: now,
        validityDays: 15,
        proposalTitle: ''
      },

      // 2. Tom de Voz
      toneOfVoice: 'consultivo-especialista',

      // 3. Sumário Executivo
      executiveSummary: {
        problem: '',
        solution: '',
        mainBenefit: ''
      },

      // 4. Entendimento do Desafio
      challengeUnderstanding: {
        currentContext: [],
        businessObjectives: []
      },

      // 5. Solução Proposta
      proposedSolution: {
        methodology: '',
        phases: []
      },

      // 6. Escopo Detalhado
      detailedScope: {
        includedServices: [],
        excludedServices: []
      },

      // 7. Cronograma
      timeline: {
        totalDuration: '',
        milestones: []
      },

      // 8. Investimento
      investment: {
        plans: [],
        setupFee: 0,
        paymentConditions: '',
        contractTerms: ''
      },

      // 9. Diferenciais
      differentials: {
        whoWeAre: '',
        keyDifferentials: [],
        socialProof: []
      },

      // 10. Próximos Passos
      nextSteps: {
        callToAction: '',
        contactInfo: ''
      },

      client: {
        name: '',
        document: '',
        email: '',
        phone: '',
        address: {
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'Brasil'
        },
        contactPerson: '',
        contactEmail: '',
        contactPhone: ''
      },
      company: {
        name: 'Sua Empresa',
        document: '',
        email: 'contato@suaempresa.com',
        phone: '(11) 0000-0000',
        website: 'www.suaempresa.com',
        logo: '',
        address: {
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'Brasil'
        }
      },
      items: [],
      attachments: [],
      approvals: []
    };
  }

  /**
   * Gera número de proposta
   */
  private static generateProposalNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `PROP-${year}-${random}`;
  }

  /**
   * Salva proposta no localStorage
   */
  static async saveProposal(proposal: CommercialProposal): Promise<void> {
    const proposals = this.getAllProposals();
    const index = proposals.findIndex(p => p.id === proposal.id);

    proposal.updatedAt = new Date();

    if (index >= 0) {
      proposals[index] = proposal;
    } else {
      proposals.push(proposal);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(proposals));
  }

  /**
   * Busca todas as propostas
   */
  static getAllProposals(): CommercialProposal[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return [];

    try {
      const proposals = JSON.parse(data);
      return proposals.map((p: any) => {
        // Se a proposta não tem a nova estrutura, criar uma vazia
        if (!p.cover || !p.timeline || !p.executiveSummary) {
          console.warn('Proposta com estrutura antiga detectada, criando nova estrutura');
          const newProposal = this.createEmptyProposal();
          return {
            ...newProposal,
            id: p.id || newProposal.id,
            title: p.title || newProposal.title,
            proposalNumber: p.proposalNumber || newProposal.proposalNumber,
            createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
            updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
            validUntil: p.validUntil ? new Date(p.validUntil) : new Date(),
            client: p.client || newProposal.client,
            company: p.company || newProposal.company
          };
        }

        // Proposta com estrutura correta
        return {
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
          validUntil: new Date(p.validUntil),
          cover: {
            ...p.cover,
            proposalDate: new Date(p.cover.proposalDate)
          },
          timeline: {
            ...p.timeline,
            milestones: (p.timeline.milestones || []).map((m: any) => ({
              ...m
            }))
          }
        };
      });
    } catch (error) {
      console.error('Error loading proposals:', error);
      // Limpar localStorage se houver erro crítico
      localStorage.removeItem(this.STORAGE_KEY);
      return [];
    }
  }

  /**
   * Busca proposta por ID
   */
  static getProposalById(id: string): CommercialProposal | null {
    const proposals = this.getAllProposals();
    return proposals.find(p => p.id === id) || null;
  }

  /**
   * Deleta proposta
   */
  static async deleteProposal(id: string): Promise<void> {
    const proposals = this.getAllProposals();
    const filtered = proposals.filter(p => p.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  /**
   * Duplica proposta
   */
  static async duplicateProposal(id: string): Promise<CommercialProposal> {
    const original = this.getProposalById(id);
    if (!original) throw new Error('Proposta não encontrada');

    const duplicate: CommercialProposal = {
      ...original,
      id: crypto.randomUUID(),
      title: `${original.title} (Cópia)`,
      proposalNumber: this.generateProposalNumber(),
      status: ProposalStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
      approvals: []
    };

    await this.saveProposal(duplicate);
    return duplicate;
  }

  /**
   * Calcula totais da proposta
   */
  static calculateTotals(proposal: CommercialProposal): CommercialProposal {
    const subtotal = proposal.items.reduce((sum, item) => sum + item.total, 0);
    const discount = (subtotal * proposal.pricing.discountPercentage) / 100;
    const afterDiscount = subtotal - discount;
    
    const totalTaxes = proposal.pricing.taxes.reduce((sum, tax) => {
      tax.amount = (afterDiscount * tax.rate) / 100;
      return sum + tax.amount;
    }, 0);

    const total = afterDiscount + totalTaxes;

    return {
      ...proposal,
      pricing: {
        ...proposal.pricing,
        subtotal,
        discount,
        totalTaxes,
        total
      }
    };
  }

  /**
   * Exporta proposta para JSON
   */
  static exportToJSON(proposal: CommercialProposal): string {
    return JSON.stringify(proposal, null, 2);
  }

  /**
   * Importa proposta de JSON
   */
  static importFromJSON(json: string): CommercialProposal {
    const data = JSON.parse(json);
    return {
      ...data,
      id: crypto.randomUUID(), // Novo ID
      createdAt: new Date(),
      updatedAt: new Date(),
      status: ProposalStatus.DRAFT
    };
  }

  /**
   * Salva template
   */
  static async saveTemplate(template: ProposalTemplate): Promise<void> {
    const templates = this.getAllTemplates();
    const index = templates.findIndex(t => t.id === template.id);

    template.updatedAt = new Date();

    if (index >= 0) {
      templates[index] = template;
    } else {
      templates.push(template);
    }

    localStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(templates));
  }

  /**
   * Busca todos os templates
   */
  static getAllTemplates(): ProposalTemplate[] {
    const data = localStorage.getItem(this.TEMPLATES_KEY);
    if (!data) return [];

    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading templates:', error);
      return [];
    }
  }

  /**
   * Cria proposta a partir de template
   */
  static createFromTemplate(templateId: string): CommercialProposal {
    const templates = this.getAllTemplates();
    const template = templates.find(t => t.id === templateId);
    
    if (!template) throw new Error('Template não encontrado');

    const base = this.createEmptyProposal();
    return {
      ...base,
      ...template.template,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: ProposalStatus.DRAFT
    };
  }

  /**
   * Limpa dados antigos do localStorage
   */
  static clearOldData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('Dados antigos removidos com sucesso');
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
    }
  }
}
