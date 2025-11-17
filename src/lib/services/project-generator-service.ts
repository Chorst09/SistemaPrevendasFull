/**
 * Project Generator Service
 * Serviço para gerar projetos automaticamente a partir de propostas
 */

import { Project, ProjectType, ProjectStatus, ProjectPriority, ProjectGenerationConfig, ProjectPhase, ProjectTask, ProjectRisk, ProjectDeliverable } from '@/lib/types/project';
import { UnifiedProposalService, UnifiedProposal } from './unified-proposal-service';

export class ProjectGeneratorService {
  private static readonly STORAGE_KEY = 'projects';

  /**
   * Gera um projeto a partir de uma proposta
   */
  static async generateFromProposal(config: ProjectGenerationConfig): Promise<Project> {
    const proposal = UnifiedProposalService.getProposalById(config.proposalId);
    
    if (!proposal) {
      throw new Error('Proposta não encontrada');
    }

    const projectId = `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    // Determinar tipo de projeto
    const projectType = this.determineProjectType(proposal);

    // Criar projeto base
    const project: Project = {
      id: projectId,
      name: config.projectName || `Projeto - ${proposal.title}`,
      description: this.generateDescription(proposal),
      type: projectType,
      status: ProjectStatus.PLANNING,
      priority: ProjectPriority.MEDIUM,
      proposalId: proposal.id,
      clientId: proposal.client,
      createdAt: now,
      updatedAt: now,
      startDate: config.startDate || now,
      team: [],
      scope: this.generateScope(proposal, config),
      timeline: this.generateTimeline(proposal, config),
      budget: this.generateBudget(proposal, config),
      risks: config.generateRisks ? this.generateRisks(proposal) : [],
      deliverables: this.generateDeliverables(proposal),
      progress: this.initializeProgress(),
      documents: [],
      notes: '',
      tags: this.generateTags(proposal)
    };

    // Salvar projeto
    await this.saveProject(project);

    return project;
  }

  /**
   * Determina o tipo de projeto baseado na proposta
   */
  private static determineProjectType(proposal: UnifiedProposal): ProjectType {
    if (proposal.type === 'noc') {
      return ProjectType.NOC;
    }
    
    // Analisar título e descrição para determinar tipo
    const title = proposal.title.toLowerCase();
    
    if (title.includes('service desk') || title.includes('suporte')) {
      return ProjectType.SERVICE_DESK;
    }
    if (title.includes('infraestrutura') || title.includes('infrastructure')) {
      return ProjectType.INFRASTRUCTURE;
    }
    if (title.includes('cloud') || title.includes('migração')) {
      return ProjectType.CLOUD_MIGRATION;
    }
    if (title.includes('segurança') || title.includes('security')) {
      return ProjectType.SECURITY;
    }
    
    return ProjectType.CUSTOM;
  }

  /**
   * Gera descrição do projeto
   */
  private static generateDescription(proposal: UnifiedProposal): string {
    if (proposal.type === 'noc' && proposal.nocData) {
      const noc = proposal.nocData;
      return `Projeto de implementação de NOC (Network Operations Center) para ${proposal.client}. ` +
             `Monitoramento ${noc.data.project.coverage} de ${noc.data.totalDevices} dispositivos ` +
             `com SLA de ${noc.data.sla.availability}% de disponibilidade.`;
    }
    
    if (proposal.type === 'commercial' && proposal.commercialData) {
      return proposal.commercialData.executiveSummary?.solution || 
             `Projeto baseado na proposta comercial para ${proposal.client}`;
    }
    
    return `Projeto para ${proposal.client}`;
  }

  /**
   * Gera escopo do projeto
   */
  private static generateScope(proposal: UnifiedProposal, config: ProjectGenerationConfig): any {
    const scope = {
      objectives: [] as string[],
      deliverables: [] as string[],
      outOfScope: [] as string[],
      assumptions: [] as string[],
      constraints: [] as string[]
    };

    if (proposal.type === 'noc' && proposal.nocData) {
      const noc = proposal.nocData;
      
      scope.objectives = [
        `Implementar NOC com cobertura ${noc.data.project.coverage}`,
        `Monitorar ${noc.data.totalDevices} dispositivos`,
        `Garantir SLA de ${noc.data.sla.availability}% de disponibilidade`,
        `Tempo de resposta de ${noc.data.sla.responseTime} minutos`,
        `Resolução em até ${noc.data.sla.resolutionTime} horas`
      ];

      scope.deliverables = [
        'Infraestrutura de monitoramento configurada',
        'Ferramentas de monitoramento instaladas e configuradas',
        'Equipe NOC treinada e operacional',
        'Processos e procedimentos documentados',
        'Dashboards e relatórios configurados'
      ];

      scope.assumptions = [
        'Cliente fornecerá acesso aos dispositivos',
        'Infraestrutura de rede está disponível',
        'Equipe do cliente estará disponível para treinamento'
      ];

      scope.constraints = [
        `Orçamento: ${noc.data.project.currency} ${noc.calculations?.finalMonthlyPrice || 0}/mês`,
        `Prazo: ${noc.data.project.contractDuration} meses`,
        'Recursos limitados conforme proposta'
      ];
    }

    if (proposal.type === 'commercial' && proposal.commercialData) {
      const commercial = proposal.commercialData;
      
      if (commercial.detailedScope) {
        scope.deliverables = commercial.detailedScope.includedServices || [];
        scope.outOfScope = commercial.detailedScope.excludedServices || [];
      }
      
      if (commercial.challengeUnderstanding) {
        scope.objectives = commercial.challengeUnderstanding.businessObjectives || [];
      }
    }

    return scope;
  }

  /**
   * Gera cronograma do projeto
   */
  private static generateTimeline(proposal: UnifiedProposal, config: ProjectGenerationConfig): any {
    const phases: ProjectPhase[] = [];
    const milestones: any[] = [];

    const startDate = new Date(config.startDate || new Date());

    if (proposal.type === 'noc') {
      // Fases padrão para projeto NOC
      const nocPhases = [
        { name: 'Planejamento', duration: 14, tasks: ['Kickoff', 'Levantamento de requisitos', 'Definição de arquitetura'] },
        { name: 'Preparação', duration: 21, tasks: ['Setup de infraestrutura', 'Instalação de ferramentas', 'Configuração inicial'] },
        { name: 'Implementação', duration: 30, tasks: ['Configuração de monitoramento', 'Integração de dispositivos', 'Testes'] },
        { name: 'Treinamento', duration: 14, tasks: ['Treinamento da equipe', 'Documentação', 'Transferência de conhecimento'] },
        { name: 'Go-Live', duration: 7, tasks: ['Ativação', 'Monitoramento inicial', 'Ajustes finais'] }
      ];

      let currentDate = new Date(startDate);
      
      nocPhases.forEach((phaseData, index) => {
        const phaseStart = new Date(currentDate);
        const phaseEnd = new Date(currentDate);
        phaseEnd.setDate(phaseEnd.getDate() + phaseData.duration);

        const phase: ProjectPhase = {
          id: `phase-${index + 1}`,
          name: phaseData.name,
          description: `Fase ${index + 1} do projeto`,
          startDate: phaseStart.toISOString(),
          endDate: phaseEnd.toISOString(),
          status: 'not-started',
          tasks: phaseData.tasks.map((taskName, taskIndex) => ({
            id: `task-${index + 1}-${taskIndex + 1}`,
            name: taskName,
            description: '',
            status: 'todo' as const,
            priority: ProjectPriority.MEDIUM,
            estimatedHours: 8,
            dependencies: []
          })),
          dependencies: index > 0 ? [`phase-${index}`] : []
        };

        phases.push(phase);
        currentDate = new Date(phaseEnd);

        // Adicionar milestone no final de cada fase
        milestones.push({
          id: `milestone-${index + 1}`,
          name: `Conclusão: ${phaseData.name}`,
          description: `Fase ${phaseData.name} concluída`,
          dueDate: phaseEnd.toISOString(),
          status: 'pending',
          deliverables: phaseData.tasks
        });
      });
    }

    // Usar timeline da proposta comercial se disponível
    if (proposal.type === 'commercial' && proposal.commercialData?.timeline && config.useProposalTimeline) {
      proposal.commercialData.timeline.milestones?.forEach((milestone, index) => {
        milestones.push({
          id: `milestone-commercial-${index + 1}`,
          name: milestone.description,
          description: milestone.period,
          dueDate: new Date(startDate.getTime() + (index + 1) * 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          deliverables: []
        });
      });
    }

    return {
      phases,
      milestones
    };
  }

  /**
   * Gera orçamento do projeto
   */
  private static generateBudget(proposal: UnifiedProposal, config: ProjectGenerationConfig): any {
    let totalBudget = 0;
    let currency = 'BRL';
    const breakdown: any[] = [];

    if (proposal.type === 'noc' && proposal.nocData?.calculations) {
      const calc = proposal.nocData.calculations;
      currency = proposal.nocData.data.project.currency;
      
      // Orçamento baseado no primeiro ano
      totalBudget = calc.finalAnnualPrice || 0;

      breakdown.push(
        { id: 'budget-team', category: 'Equipe', description: 'Custos com equipe NOC', plannedCost: calc.monthlyTeamCost * 12, actualCost: 0, variance: 0 },
        { id: 'budget-infra', category: 'Infraestrutura', description: 'Infraestrutura e hardware', plannedCost: calc.monthlyInfrastructureCost * 12, actualCost: 0, variance: 0 },
        { id: 'budget-licenses', category: 'Licenças', description: 'Licenças de software', plannedCost: calc.monthlyLicenseCost * 12, actualCost: 0, variance: 0 },
        { id: 'budget-operational', category: 'Operacional', description: 'Custos operacionais', plannedCost: calc.monthlyOperationalCost * 12, actualCost: 0, variance: 0 }
      );
    }

    if (proposal.type === 'commercial' && proposal.commercialData?.investment) {
      const investment = proposal.commercialData.investment;
      
      // Usar o plano anual se disponível
      const annualPlan = investment.plans?.find(p => p.recurrence === 'annual');
      const monthlyPlan = investment.plans?.find(p => p.recurrence === 'monthly');
      
      totalBudget = annualPlan?.value || (monthlyPlan?.value || 0) * 12;
      
      if (investment.setupFee) {
        totalBudget += investment.setupFee;
        breakdown.push({
          id: 'budget-setup',
          category: 'Setup',
          description: 'Custos de implementação inicial',
          plannedCost: investment.setupFee,
          actualCost: 0,
          variance: 0
        });
      }
    }

    return {
      totalBudget: Math.round(totalBudget * 100) / 100,
      spentBudget: 0,
      remainingBudget: Math.round(totalBudget * 100) / 100,
      currency,
      breakdown,
      costVariance: 0,
      costPerformanceIndex: 1.0
    };
  }

  /**
   * Gera riscos do projeto
   */
  private static generateRisks(proposal: UnifiedProposal): ProjectRisk[] {
    const risks: ProjectRisk[] = [];
    const now = new Date().toISOString();

    // Riscos padrão
    risks.push(
      {
        id: 'risk-1',
        title: 'Atraso na entrega de equipamentos',
        description: 'Possível atraso na entrega de hardware necessário',
        category: 'schedule',
        probability: 'medium',
        impact: 'high',
        riskScore: 6,
        status: 'identified',
        identifiedDate: now
      },
      {
        id: 'risk-2',
        title: 'Disponibilidade da equipe do cliente',
        description: 'Equipe do cliente pode não estar disponível conforme planejado',
        category: 'resource',
        probability: 'medium',
        impact: 'medium',
        riskScore: 4,
        status: 'identified',
        identifiedDate: now
      },
      {
        id: 'risk-3',
        title: 'Mudanças de escopo',
        description: 'Cliente pode solicitar mudanças no escopo durante o projeto',
        category: 'external',
        probability: 'high',
        impact: 'medium',
        riskScore: 6,
        status: 'identified',
        identifiedDate: now
      }
    );

    return risks;
  }

  /**
   * Gera entregas do projeto
   */
  private static generateDeliverables(proposal: UnifiedProposal): ProjectDeliverable[] {
    const deliverables: ProjectDeliverable[] = [];
    const startDate = new Date();

    if (proposal.type === 'noc') {
      deliverables.push(
        {
          id: 'deliv-1',
          name: 'Plano de Projeto',
          description: 'Documento completo do plano de projeto',
          type: 'document',
          status: 'pending',
          dueDate: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          acceptanceCriteria: ['Aprovado pelo cliente', 'Todos os stakeholders revisaram']
        },
        {
          id: 'deliv-2',
          name: 'Infraestrutura NOC',
          description: 'Infraestrutura de monitoramento completa e operacional',
          type: 'hardware',
          status: 'pending',
          dueDate: new Date(startDate.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          acceptanceCriteria: ['Todos os dispositivos monitorados', 'Alertas funcionando', 'Dashboards configurados']
        },
        {
          id: 'deliv-3',
          name: 'Documentação Técnica',
          description: 'Documentação completa de processos e procedimentos',
          type: 'document',
          status: 'pending',
          dueDate: new Date(startDate.getTime() + 75 * 24 * 60 * 60 * 1000).toISOString(),
          acceptanceCriteria: ['Documentação completa', 'Revisada e aprovada']
        }
      );
    }

    return deliverables;
  }

  /**
   * Inicializa progresso do projeto
   */
  private static initializeProgress(): any {
    return {
      overallProgress: 0,
      phasesCompleted: 0,
      tasksCompleted: 0,
      totalTasks: 0,
      milestonesAchieved: 0,
      totalMilestones: 0,
      scheduleVariance: 0,
      schedulePerformanceIndex: 1.0,
      healthStatus: 'green',
      healthIndicators: {
        schedule: 'on-track',
        budget: 'on-track',
        scope: 'on-track',
        quality: 'on-track'
      }
    };
  }

  /**
   * Gera tags para o projeto
   */
  private static generateTags(proposal: UnifiedProposal): string[] {
    const tags: string[] = [];
    
    tags.push(proposal.type);
    tags.push(proposal.status);
    
    if (proposal.type === 'noc' && proposal.nocData) {
      tags.push('NOC');
      tags.push(proposal.nocData.data.project.serviceLevel);
      tags.push(proposal.nocData.data.project.coverage);
    }
    
    return tags;
  }

  /**
   * Salva projeto no localStorage
   */
  private static async saveProject(project: Project): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const projects = this.getAllProjects();
      projects.push(project);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
      console.log('Projeto salvo:', project.id);
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
      throw error;
    }
  }

  /**
   * Obtém todos os projetos
   */
  static getAllProjects(): Project[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      return [];
    }
  }

  /**
   * Obtém projeto por ID
   */
  static getProjectById(id: string): Project | null {
    const projects = this.getAllProjects();
    return projects.find(p => p.id === id) || null;
  }

  /**
   * Atualiza projeto
   */
  static async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    const projects = this.getAllProjects();
    const index = projects.findIndex(p => p.id === id);

    if (index === -1) return null;

    projects[index] = {
      ...projects[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
    return projects[index];
  }

  /**
   * Deleta projeto
   */
  static async deleteProject(id: string): Promise<boolean> {
    const projects = this.getAllProjects();
    const filtered = projects.filter(p => p.id !== id);

    if (filtered.length === projects.length) return false;

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }
}
