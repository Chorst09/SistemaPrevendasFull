import { AdditionalCost, CostCategory, CostType, CostFrequency } from '@/lib/types/service-desk-pricing';

export interface CostTemplate {
  id: string;
  name: string;
  description: string;
  category: CostCategory;
  projectType: string;
  costs: Omit<AdditionalCost, 'id' | 'startDate' | 'endDate'>[];
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
}

export interface ProjectTypeCostTemplate {
  projectType: string;
  templates: CostTemplate[];
}

export class CostTemplateService {
  private static readonly STORAGE_KEY = 'service-desk-cost-templates';
  private static readonly PROJECT_COSTS_KEY = 'service-desk-project-costs';

  // Default templates for different project types
  private static readonly DEFAULT_TEMPLATES: CostTemplate[] = [
    {
      id: 'template-basic-service-desk',
      name: 'Service Desk Básico',
      description: 'Custos básicos para operação de service desk',
      category: CostCategory.INFRASTRUCTURE,
      projectType: 'basic',
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      costs: [
        {
          name: 'Sistema ITSM',
          category: CostCategory.LICENSES,
          value: 2500,
          type: CostType.FIXED,
          frequency: CostFrequency.MONTHLY,
          description: 'Licença do sistema de gerenciamento de serviços de TI',
          allocation: { method: 'equal', periods: [] }
        },
        {
          name: 'Telefonia VoIP',
          category: CostCategory.UTILITIES,
          value: 800,
          type: CostType.FIXED,
          frequency: CostFrequency.MONTHLY,
          description: 'Sistema de telefonia para atendimento',
          allocation: { method: 'equal', periods: [] }
        },
        {
          name: 'Monitoramento de Infraestrutura',
          category: CostCategory.LICENSES,
          value: 1200,
          type: CostType.FIXED,
          frequency: CostFrequency.MONTHLY,
          description: 'Ferramentas de monitoramento de servidores e rede',
          allocation: { method: 'equal', periods: [] }
        }
      ]
    },
    {
      id: 'template-premium-service-desk',
      name: 'Service Desk Premium',
      description: 'Custos para service desk com recursos avançados',
      category: CostCategory.INFRASTRUCTURE,
      projectType: 'premium',
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      costs: [
        {
          name: 'Sistema ITSM Enterprise',
          category: CostCategory.LICENSES,
          value: 5000,
          type: CostType.FIXED,
          frequency: CostFrequency.MONTHLY,
          description: 'Licença enterprise do sistema ITSM com IA',
          allocation: { method: 'equal', periods: [] }
        },
        {
          name: 'Central Telefônica Avançada',
          category: CostCategory.UTILITIES,
          value: 1500,
          type: CostType.FIXED,
          frequency: CostFrequency.MONTHLY,
          description: 'Sistema telefônico com IVR e gravação',
          allocation: { method: 'equal', periods: [] }
        },
        {
          name: 'Plataforma de Monitoramento APM',
          category: CostCategory.LICENSES,
          value: 3000,
          type: CostType.FIXED,
          frequency: CostFrequency.MONTHLY,
          description: 'Application Performance Monitoring',
          allocation: { method: 'equal', periods: [] }
        },
        {
          name: 'Chatbot e IA',
          category: CostCategory.LICENSES,
          value: 2000,
          type: CostType.FIXED,
          frequency: CostFrequency.MONTHLY,
          description: 'Plataforma de chatbot com inteligência artificial',
          allocation: { method: 'equal', periods: [] }
        },
        {
          name: 'Treinamento Especializado',
          category: CostCategory.TRAINING,
          value: 8000,
          type: CostType.EVENTUAL,
          frequency: CostFrequency.QUARTERLY,
          description: 'Treinamentos avançados para a equipe',
          allocation: { method: 'equal', periods: [] }
        }
      ]
    },
    {
      id: 'template-infrastructure-costs',
      name: 'Custos de Infraestrutura',
      description: 'Custos relacionados à infraestrutura de TI',
      category: CostCategory.INFRASTRUCTURE,
      projectType: 'all',
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      costs: [
        {
          name: 'Servidores Cloud',
          category: CostCategory.INFRASTRUCTURE,
          value: 3500,
          type: CostType.VARIABLE,
          frequency: CostFrequency.MONTHLY,
          description: 'Instâncias de servidores na nuvem',
          allocation: { method: 'proportional', periods: [] }
        },
        {
          name: 'Backup e Storage',
          category: CostCategory.INFRASTRUCTURE,
          value: 800,
          type: CostType.FIXED,
          frequency: CostFrequency.MONTHLY,
          description: 'Armazenamento e backup de dados',
          allocation: { method: 'equal', periods: [] }
        },
        {
          name: 'Conectividade Internet',
          category: CostCategory.UTILITIES,
          value: 1200,
          type: CostType.FIXED,
          frequency: CostFrequency.MONTHLY,
          description: 'Links de internet redundantes',
          allocation: { method: 'equal', periods: [] }
        }
      ]
    },
    {
      id: 'template-compliance-costs',
      name: 'Custos de Compliance',
      description: 'Custos relacionados a compliance e auditoria',
      category: CostCategory.LEGAL,
      projectType: 'enterprise',
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      costs: [
        {
          name: 'Auditoria Externa',
          category: CostCategory.LEGAL,
          value: 15000,
          type: CostType.EVENTUAL,
          frequency: CostFrequency.ANNUAL,
          description: 'Auditoria de segurança e compliance',
          allocation: { method: 'equal', periods: [] }
        },
        {
          name: 'Certificações ISO',
          category: CostCategory.LEGAL,
          value: 25000,
          type: CostType.EVENTUAL,
          frequency: CostFrequency.ANNUAL,
          description: 'Manutenção de certificações ISO 27001, 20000',
          allocation: { method: 'equal', periods: [] }
        },
        {
          name: 'Consultoria Jurídica',
          category: CostCategory.LEGAL,
          value: 5000,
          type: CostType.FIXED,
          frequency: CostFrequency.MONTHLY,
          description: 'Consultoria jurídica especializada em TI',
          allocation: { method: 'equal', periods: [] }
        }
      ]
    }
  ];

  /**
   * Get all available cost templates
   */
  static getTemplates(): CostTemplate[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const customTemplates = stored ? JSON.parse(stored) : [];
      
      // Combine default and custom templates
      return [...this.DEFAULT_TEMPLATES, ...customTemplates];
    } catch (error) {
      console.error('Error loading cost templates:', error);
      return this.DEFAULT_TEMPLATES;
    }
  }

  /**
   * Get templates by project type
   */
  static getTemplatesByProjectType(projectType: string): CostTemplate[] {
    const allTemplates = this.getTemplates();
    return allTemplates.filter(template => 
      template.projectType === projectType || template.projectType === 'all'
    );
  }

  /**
   * Get templates by category
   */
  static getTemplatesByCategory(category: CostCategory): CostTemplate[] {
    const allTemplates = this.getTemplates();
    return allTemplates.filter(template => template.category === category);
  }

  /**
   * Save a new custom template
   */
  static saveTemplate(template: Omit<CostTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): CostTemplate {
    try {
      const newTemplate: CostTemplate = {
        ...template,
        id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0
      };

      const stored = localStorage.getItem(this.STORAGE_KEY);
      const customTemplates = stored ? JSON.parse(stored) : [];
      customTemplates.push(newTemplate);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(customTemplates));
      
      return newTemplate;
    } catch (error) {
      console.error('Error saving cost template:', error);
      throw error;
    }
  }

  /**
   * Update an existing template
   */
  static updateTemplate(templateId: string, updates: Partial<CostTemplate>): CostTemplate | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const customTemplates = stored ? JSON.parse(stored) : [];
      
      const templateIndex = customTemplates.findIndex((t: CostTemplate) => t.id === templateId);
      if (templateIndex === -1) {
        return null;
      }

      customTemplates[templateIndex] = {
        ...customTemplates[templateIndex],
        ...updates,
        updatedAt: new Date()
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(customTemplates));
      
      return customTemplates[templateIndex];
    } catch (error) {
      console.error('Error updating cost template:', error);
      return null;
    }
  }

  /**
   * Delete a custom template
   */
  static deleteTemplate(templateId: string): boolean {
    try {
      // Don't allow deletion of default templates
      if (this.DEFAULT_TEMPLATES.some(t => t.id === templateId)) {
        return false;
      }

      const stored = localStorage.getItem(this.STORAGE_KEY);
      const customTemplates = stored ? JSON.parse(stored) : [];
      
      const filteredTemplates = customTemplates.filter((t: CostTemplate) => t.id !== templateId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredTemplates));
      
      return true;
    } catch (error) {
      console.error('Error deleting cost template:', error);
      return false;
    }
  }

  /**
   * Apply a template to generate costs
   */
  static applyTemplate(templateId: string, startDate: Date = new Date()): AdditionalCost[] {
    try {
      const templates = this.getTemplates();
      const template = templates.find(t => t.id === templateId);
      
      if (!template) {
        throw new Error('Template not found');
      }

      // Increment usage count
      this.incrementUsageCount(templateId);

      // Generate costs from template
      const costs: AdditionalCost[] = template.costs.map((costTemplate, index) => ({
        ...costTemplate,
        id: `cost-${Date.now()}-${index}`,
        startDate: startDate,
        endDate: undefined
      }));

      return costs;
    } catch (error) {
      console.error('Error applying cost template:', error);
      throw error;
    }
  }

  /**
   * Increment usage count for a template
   */
  private static incrementUsageCount(templateId: string): void {
    try {
      // Only increment for custom templates
      if (this.DEFAULT_TEMPLATES.some(t => t.id === templateId)) {
        return;
      }

      const stored = localStorage.getItem(this.STORAGE_KEY);
      const customTemplates = stored ? JSON.parse(stored) : [];
      
      const templateIndex = customTemplates.findIndex((t: CostTemplate) => t.id === templateId);
      if (templateIndex !== -1) {
        customTemplates[templateIndex].usageCount += 1;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(customTemplates));
      }
    } catch (error) {
      console.error('Error incrementing usage count:', error);
    }
  }

  /**
   * Save costs from a project for future reference
   */
  static saveProjectCosts(projectName: string, costs: AdditionalCost[]): void {
    try {
      const projectCosts = {
        projectName,
        costs: costs.map(cost => ({
          ...cost,
          id: undefined // Remove ID for reuse
        })),
        savedAt: new Date()
      };

      const stored = localStorage.getItem(this.PROJECT_COSTS_KEY);
      const allProjectCosts = stored ? JSON.parse(stored) : [];
      
      // Remove existing entry for same project
      const filteredCosts = allProjectCosts.filter((p: any) => p.projectName !== projectName);
      filteredCosts.push(projectCosts);
      
      // Keep only last 10 projects
      const recentCosts = filteredCosts.slice(-10);
      
      localStorage.setItem(this.PROJECT_COSTS_KEY, JSON.stringify(recentCosts));
    } catch (error) {
      console.error('Error saving project costs:', error);
    }
  }

  /**
   * Get costs from previous projects
   */
  static getPreviousProjectCosts(): Array<{
    projectName: string;
    costs: Omit<AdditionalCost, 'id'>[];
    savedAt: Date;
  }> {
    try {
      const stored = localStorage.getItem(this.PROJECT_COSTS_KEY);
      const projectCosts = stored ? JSON.parse(stored) : [];
      
      return projectCosts.map((p: any) => ({
        ...p,
        savedAt: new Date(p.savedAt)
      }));
    } catch (error) {
      console.error('Error loading previous project costs:', error);
      return [];
    }
  }

  /**
   * Import costs from a previous project
   */
  static importFromPreviousProject(projectName: string): AdditionalCost[] {
    try {
      const previousProjects = this.getPreviousProjectCosts();
      const project = previousProjects.find(p => p.projectName === projectName);
      
      if (!project) {
        throw new Error('Project not found');
      }

      // Generate new costs with unique IDs
      const costs: AdditionalCost[] = project.costs.map((costTemplate, index) => ({
        ...costTemplate,
        id: `cost-${Date.now()}-${index}`,
        startDate: new Date(),
        endDate: undefined
      }));

      return costs;
    } catch (error) {
      console.error('Error importing from previous project:', error);
      throw error;
    }
  }

  /**
   * Validate costs for duplicates
   */
  static validateForDuplicates(costs: AdditionalCost[]): {
    isValid: boolean;
    duplicates: Array<{
      name: string;
      category: CostCategory;
      indices: number[];
    }>;
  } {
    const duplicates: Array<{
      name: string;
      category: CostCategory;
      indices: number[];
    }> = [];

    const costMap = new Map<string, number[]>();

    costs.forEach((cost, index) => {
      const key = `${cost.name.toLowerCase()}-${cost.category}`;
      if (!costMap.has(key)) {
        costMap.set(key, []);
      }
      costMap.get(key)!.push(index);
    });

    costMap.forEach((indices, key) => {
      if (indices.length > 1) {
        const [name, category] = key.split('-');
        duplicates.push({
          name: costs[indices[0]].name,
          category: costs[indices[0]].category,
          indices
        });
      }
    });

    return {
      isValid: duplicates.length === 0,
      duplicates
    };
  }

  /**
   * Get cost analysis and suggestions
   */
  static analyzeCosts(costs: AdditionalCost[]): {
    totalMonthlyCost: number;
    totalAnnualCost: number;
    categoryBreakdown: Record<CostCategory, number>;
    typeBreakdown: Record<CostType, number>;
    suggestions: string[];
    warnings: string[];
  } {
    let totalMonthlyCost = 0;
    const categoryBreakdown: Record<CostCategory, number> = {} as any;
    const typeBreakdown: Record<CostType, number> = {} as any;
    const suggestions: string[] = [];
    const warnings: string[] = [];

    costs.forEach(cost => {
      const monthlyCost = this.calculateMonthlyCost(cost);
      totalMonthlyCost += monthlyCost;

      // Category breakdown
      if (!categoryBreakdown[cost.category]) {
        categoryBreakdown[cost.category] = 0;
      }
      categoryBreakdown[cost.category] += monthlyCost;

      // Type breakdown
      if (!typeBreakdown[cost.type]) {
        typeBreakdown[cost.type] = 0;
      }
      typeBreakdown[cost.type] += monthlyCost;
    });

    const totalAnnualCost = totalMonthlyCost * 12;

    // Generate suggestions
    if (Object.keys(categoryBreakdown).length < 3) {
      suggestions.push('Considere revisar se todas as categorias de custos foram incluídas');
    }

    if (categoryBreakdown[CostCategory.INFRASTRUCTURE] > totalMonthlyCost * 0.6) {
      warnings.push('Custos de infraestrutura representam mais de 60% do total');
    }

    if (typeBreakdown[CostType.FIXED] < totalMonthlyCost * 0.3) {
      suggestions.push('Considere aumentar a proporção de custos fixos para maior previsibilidade');
    }

    if (costs.length > 20) {
      suggestions.push('Muitos itens de custo. Considere consolidar itens similares');
    }

    return {
      totalMonthlyCost,
      totalAnnualCost,
      categoryBreakdown,
      typeBreakdown,
      suggestions,
      warnings
    };
  }

  /**
   * Calculate monthly cost for a given cost item
   */
  private static calculateMonthlyCost(cost: AdditionalCost): number {
    switch (cost.frequency) {
      case CostFrequency.MONTHLY:
        return cost.value;
      case CostFrequency.QUARTERLY:
        return cost.value / 3;
      case CostFrequency.SEMI_ANNUAL:
        return cost.value / 6;
      case CostFrequency.ANNUAL:
        return cost.value / 12;
      case CostFrequency.ONE_TIME:
        return cost.value / 12; // Distribute over a year
      default:
        return cost.value;
    }
  }
}