import {
  ServiceDeskTemplate,
  TemplateCategory,
  TemplateType,
  TemplateComplexity,
  TemplateApplication,
  TemplateConflict,
  ConflictResolution,
  TemplateValidation,
  TemplateExport,
  TemplateImport,
  ImportConflict,
  ImportResolution,
  PresetDefinition,
  BUILTIN_PRESETS,
  TemplateUsageAnalytics
} from '@/lib/types/service-desk-templates';
import { ServiceDeskData, TaxRegime, ServiceType } from '@/lib/types/service-desk-pricing';
import { ServiceDeskDataManager } from './service-desk-data-manager';

export class ServiceDeskTemplateService {
  private static readonly STORAGE_KEY = 'service-desk-templates';
  private static readonly DB_NAME = 'ServiceDeskTemplatesDB';
  private static readonly DB_VERSION = 1;
  private static readonly STORE_NAME = 'templates';
  private static readonly ANALYTICS_STORE = 'analytics';
  
  private db: IDBDatabase | null = null;
  private templates: Map<string, ServiceDeskTemplate> = new Map();
  private analytics: Map<string, TemplateUsageAnalytics> = new Map();

  constructor() {
    this.initializeBuiltinPresets();
  }

  /**
   * Initialize built-in presets
   */
  private initializeBuiltinPresets(): void {
    BUILTIN_PRESETS.forEach(preset => {
      const template = this.createTemplateFromPreset(preset);
      this.templates.set(template.id, template);
    });
  }

  /**
   * Create template from preset definition
   */
  private createTemplateFromPreset(preset: PresetDefinition): ServiceDeskTemplate {
    const now = new Date();
    
    return {
      id: preset.id,
      name: preset.name,
      description: preset.description,
      category: preset.category,
      type: TemplateType.PRESET,
      version: '1.0.0',
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
      tags: [preset.industry.toLowerCase(), preset.serviceType, preset.complexity],
      isPublic: true,
      usageCount: 0,
      rating: 0,
      metadata: {
        industry: [preset.industry],
        serviceTypes: [preset.serviceType],
        teamSize: {
          min: Math.max(1, preset.teamSize - 5),
          max: preset.teamSize + 10,
          optimal: preset.teamSize
        },
        contractDuration: {
          minMonths: Math.max(1, preset.contractMonths - 6),
          maxMonths: preset.contractMonths + 12,
          optimalMonths: preset.contractMonths
        },
        complexity: preset.complexity,
        region: ['Brasil'],
        applicableRegions: ['Brasil', 'América Latina'],
        prerequisites: [],
        warnings: [],
        recommendations: []
      },
      data: this.generatePresetData(preset)
    };
  }

  /**
   * Generate preset data based on preset definition
   */
  private generatePresetData(preset: PresetDefinition): any {
    const baseData = ServiceDeskDataManager.createEmptyData();
    
    // Customize based on preset type
    switch (preset.id) {
      case 'basic-it-support':
        return this.generateBasicITSupportData(baseData);
      case 'enterprise-service-desk':
        return this.generateEnterpriseServiceDeskData(baseData);
      case 'healthcare-it-support':
        return this.generateHealthcareITSupportData(baseData);
      default:
        return this.generateGenericPresetData(baseData, preset);
    }
  }

  /**
   * Generate basic IT support preset data
   */
  private generateBasicITSupportData(baseData: ServiceDeskData): any {
    return {
      projectTemplate: {
        serviceType: ServiceType.BASIC,
        defaultCurrency: 'BRL',
        defaultContractDuration: 12,
        industryDefaults: {
          supportHours: '8x5',
          responseTime: '4 horas',
          resolutionTime: '24 horas'
        }
      },
      teamTemplate: {
        roles: [
          {
            role: 'Analista de Suporte N1',
            description: 'Atendimento de primeiro nível',
            baseSalaryRange: { min: 3000, max: 4500, average: 3750, currency: 'BRL', region: 'Brasil', lastUpdated: new Date() },
            requiredSkills: ['Atendimento ao cliente', 'Windows', 'Office'],
            workloadPercentage: 100,
            isEssential: true,
            scalingFactor: 1.0
          },
          {
            role: 'Analista de Suporte N2',
            description: 'Atendimento de segundo nível',
            baseSalaryRange: { min: 4500, max: 6500, average: 5500, currency: 'BRL', region: 'Brasil', lastUpdated: new Date() },
            requiredSkills: ['Redes', 'Servidores', 'Active Directory'],
            workloadPercentage: 80,
            isEssential: true,
            scalingFactor: 0.5
          },
          {
            role: 'Coordenador de Suporte',
            description: 'Coordenação da equipe de suporte',
            baseSalaryRange: { min: 7000, max: 9000, average: 8000, currency: 'BRL', region: 'Brasil', lastUpdated: new Date() },
            requiredSkills: ['Gestão de equipe', 'ITIL', 'Relatórios'],
            workloadPercentage: 100,
            isEssential: true,
            scalingFactor: 0.2
          }
        ]
      },
      taxTemplate: {
        region: 'Brasil',
        taxRegime: TaxRegime.LUCRO_PRESUMIDO,
        defaultRates: {
          ...baseData.taxes,
          iss: 5,
          ir: 15,
          csll: 9,
          pis: 1.65,
          cofins: 7.6
        }
      },
      costsTemplate: {
        industry: 'Tecnologia',
        serviceType: ServiceType.BASIC,
        commonCosts: [
          {
            name: 'Licenças de Software',
            category: 'licenses',
            estimatedValue: 500,
            scalingFactor: 1.0,
            frequency: 'monthly',
            isOptional: false,
            dependencies: []
          },
          {
            name: 'Infraestrutura de TI',
            category: 'infrastructure',
            estimatedValue: 1000,
            scalingFactor: 0.8,
            frequency: 'monthly',
            isOptional: false,
            dependencies: []
          }
        ]
      }
    };
  }

  /**
   * Generate enterprise service desk preset data
   */
  private generateEnterpriseServiceDeskData(baseData: ServiceDeskData): any {
    return {
      projectTemplate: {
        serviceType: ServiceType.ENTERPRISE,
        defaultCurrency: 'BRL',
        defaultContractDuration: 24,
        industryDefaults: {
          supportHours: '24x7',
          responseTime: '15 minutos',
          resolutionTime: '4 horas'
        }
      },
      teamTemplate: {
        roles: [
          {
            role: 'Analista de Suporte N1',
            description: 'Atendimento de primeiro nível 24x7',
            baseSalaryRange: { min: 3500, max: 5000, average: 4250, currency: 'BRL', region: 'Brasil', lastUpdated: new Date() },
            requiredSkills: ['Atendimento ao cliente', 'Windows', 'Office', 'ITIL'],
            workloadPercentage: 100,
            isEssential: true,
            scalingFactor: 1.5
          },
          {
            role: 'Analista de Suporte N2',
            description: 'Atendimento de segundo nível especializado',
            baseSalaryRange: { min: 5000, max: 7500, average: 6250, currency: 'BRL', region: 'Brasil', lastUpdated: new Date() },
            requiredSkills: ['Redes avançadas', 'Servidores', 'Virtualização', 'Banco de dados'],
            workloadPercentage: 100,
            isEssential: true,
            scalingFactor: 1.0
          },
          {
            role: 'Especialista N3',
            description: 'Especialista em soluções complexas',
            baseSalaryRange: { min: 8000, max: 12000, average: 10000, currency: 'BRL', region: 'Brasil', lastUpdated: new Date() },
            requiredSkills: ['Arquitetura de TI', 'Segurança', 'Cloud Computing'],
            workloadPercentage: 80,
            isEssential: true,
            scalingFactor: 0.3
          },
          {
            role: 'Gerente de Service Desk',
            description: 'Gestão estratégica do service desk',
            baseSalaryRange: { min: 12000, max: 18000, average: 15000, currency: 'BRL', region: 'Brasil', lastUpdated: new Date() },
            requiredSkills: ['Gestão estratégica', 'ITIL Expert', 'KPIs', 'Orçamento'],
            workloadPercentage: 100,
            isEssential: true,
            scalingFactor: 0.1
          }
        ]
      },
      costsTemplate: {
        industry: 'Corporativo',
        serviceType: ServiceType.ENTERPRISE,
        commonCosts: [
          {
            name: 'Plataforma de Service Desk Enterprise',
            category: 'licenses',
            estimatedValue: 5000,
            scalingFactor: 1.0,
            frequency: 'monthly',
            isOptional: false,
            dependencies: []
          },
          {
            name: 'Infraestrutura de Monitoramento',
            category: 'infrastructure',
            estimatedValue: 8000,
            scalingFactor: 0.9,
            frequency: 'monthly',
            isOptional: false,
            dependencies: []
          },
          {
            name: 'Treinamentos e Certificações',
            category: 'training',
            estimatedValue: 2000,
            scalingFactor: 0.7,
            frequency: 'quarterly',
            isOptional: true,
            dependencies: []
          }
        ]
      }
    };
  }

  /**
   * Generate healthcare IT support preset data
   */
  private generateHealthcareITSupportData(baseData: ServiceDeskData): any {
    return {
      projectTemplate: {
        serviceType: ServiceType.PREMIUM,
        defaultCurrency: 'BRL',
        defaultContractDuration: 36,
        industryDefaults: {
          supportHours: '24x7',
          responseTime: '30 minutos',
          resolutionTime: '2 horas',
          compliance: 'LGPD, CFM'
        }
      },
      teamTemplate: {
        roles: [
          {
            role: 'Analista de Suporte Hospitalar N1',
            description: 'Suporte especializado em sistemas hospitalares',
            baseSalaryRange: { min: 4000, max: 6000, average: 5000, currency: 'BRL', region: 'Brasil', lastUpdated: new Date() },
            requiredSkills: ['Sistemas hospitalares', 'LGPD', 'Atendimento médico'],
            workloadPercentage: 100,
            isEssential: true,
            scalingFactor: 1.2
          },
          {
            role: 'Especialista em Sistemas Médicos',
            description: 'Especialista em equipamentos e sistemas médicos',
            baseSalaryRange: { min: 7000, max: 10000, average: 8500, currency: 'BRL', region: 'Brasil', lastUpdated: new Date() },
            requiredSkills: ['Equipamentos médicos', 'HL7', 'DICOM', 'Regulamentação ANVISA'],
            workloadPercentage: 100,
            isEssential: true,
            scalingFactor: 0.4
          }
        ]
      },
      costsTemplate: {
        industry: 'Saúde',
        serviceType: ServiceType.PREMIUM,
        commonCosts: [
          {
            name: 'Licenças de Sistemas Hospitalares',
            category: 'licenses',
            estimatedValue: 3000,
            scalingFactor: 1.0,
            frequency: 'monthly',
            isOptional: false,
            dependencies: []
          },
          {
            name: 'Certificações de Segurança LGPD',
            category: 'legal',
            estimatedValue: 1500,
            scalingFactor: 0.5,
            frequency: 'annual',
            isOptional: false,
            dependencies: []
          }
        ]
      }
    };
  }

  /**
   * Generate generic preset data
   */
  private generateGenericPresetData(baseData: ServiceDeskData, preset: PresetDefinition): any {
    return {
      projectTemplate: {
        serviceType: preset.serviceType,
        defaultCurrency: 'BRL',
        defaultContractDuration: preset.contractMonths
      },
      teamTemplate: {
        roles: []
      },
      costsTemplate: {
        industry: preset.industry,
        serviceType: preset.serviceType,
        commonCosts: []
      }
    };
  }

  /**
   * Initialize IndexedDB connection
   */
  private async initDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(ServiceDeskTemplateService.DB_NAME, ServiceDeskTemplateService.DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Templates store
        if (!db.objectStoreNames.contains(ServiceDeskTemplateService.STORE_NAME)) {
          const store = db.createObjectStore(ServiceDeskTemplateService.STORE_NAME, { keyPath: 'id' });
          store.createIndex('category', 'category', { unique: false });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('createdBy', 'createdBy', { unique: false });
          store.createIndex('tags', 'tags', { unique: false, multiEntry: true });
        }
        
        // Analytics store
        if (!db.objectStoreNames.contains(ServiceDeskTemplateService.ANALYTICS_STORE)) {
          const analyticsStore = db.createObjectStore(ServiceDeskTemplateService.ANALYTICS_STORE, { keyPath: 'templateId' });
          analyticsStore.createIndex('usageCount', 'usageCount', { unique: false });
          analyticsStore.createIndex('lastUsed', 'lastUsed', { unique: false });
        }
      };
    });
  }

  /**
   * Save template to storage
   */
  async saveTemplate(template: ServiceDeskTemplate): Promise<void> {
    try {
      // Save to memory cache
      this.templates.set(template.id, template);
      
      // Save to IndexedDB
      const db = await this.initDB();
      
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([ServiceDeskTemplateService.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(ServiceDeskTemplateService.STORE_NAME);
        const request = store.put(template);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  }

  /**
   * Load all templates
   */
  async loadTemplates(): Promise<ServiceDeskTemplate[]> {
    try {
      const db = await this.initDB();
      
      const templates = await new Promise<ServiceDeskTemplate[]>((resolve, reject) => {
        const transaction = db.transaction([ServiceDeskTemplateService.STORE_NAME], 'readonly');
        const store = transaction.objectStore(ServiceDeskTemplateService.STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      // Update memory cache
      templates.forEach(template => {
        this.templates.set(template.id, template);
      });
      
      return templates;
    } catch (error) {
      console.error('Error loading templates:', error);
      // Return built-in presets as fallback
      return Array.from(this.templates.values());
    }
  }

  /**
   * Get template by ID
   */
  async getTemplate(id: string): Promise<ServiceDeskTemplate | null> {
    // Check memory cache first
    const cached = this.templates.get(id);
    if (cached) {
      return cached;
    }

    try {
      const db = await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([ServiceDeskTemplateService.STORE_NAME], 'readonly');
        const store = transaction.objectStore(ServiceDeskTemplateService.STORE_NAME);
        const request = store.get(id);
        
        request.onsuccess = () => {
          const template = request.result;
          if (template) {
            this.templates.set(template.id, template);
          }
          resolve(template || null);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting template:', error);
      return null;
    }
  }

  /**
   * Delete template
   */
  async deleteTemplate(id: string): Promise<void> {
    try {
      // Remove from memory cache
      this.templates.delete(id);
      
      // Remove from IndexedDB
      const db = await this.initDB();
      
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([ServiceDeskTemplateService.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(ServiceDeskTemplateService.STORE_NAME);
        const request = store.delete(id);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }

  /**
   * Search templates
   */
  async searchTemplates(query: {
    text?: string;
    category?: TemplateCategory;
    type?: TemplateType;
    industry?: string;
    serviceType?: ServiceType;
    complexity?: TemplateComplexity;
    tags?: string[];
  }): Promise<ServiceDeskTemplate[]> {
    const templates = await this.loadTemplates();
    
    return templates.filter(template => {
      // Text search
      if (query.text) {
        const searchText = query.text.toLowerCase();
        const matchesText = 
          template.name.toLowerCase().includes(searchText) ||
          template.description.toLowerCase().includes(searchText) ||
          template.tags.some(tag => tag.toLowerCase().includes(searchText));
        
        if (!matchesText) return false;
      }
      
      // Category filter
      if (query.category && template.category !== query.category) {
        return false;
      }
      
      // Type filter
      if (query.type && template.type !== query.type) {
        return false;
      }
      
      // Industry filter
      if (query.industry && !template.metadata.industry.includes(query.industry)) {
        return false;
      }
      
      // Service type filter
      if (query.serviceType && !template.metadata.serviceTypes.includes(query.serviceType)) {
        return false;
      }
      
      // Complexity filter
      if (query.complexity && template.metadata.complexity !== query.complexity) {
        return false;
      }
      
      // Tags filter
      if (query.tags && query.tags.length > 0) {
        const hasMatchingTag = query.tags.some(tag => 
          template.tags.includes(tag.toLowerCase())
        );
        if (!hasMatchingTag) return false;
      }
      
      return true;
    });
  }

  /**
   * Apply template to service desk data
   */
  async applyTemplate(templateId: string, targetData: ServiceDeskData): Promise<TemplateApplication> {
    const template = await this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const application: TemplateApplication = {
      templateId,
      targetData,
      customizations: [],
      conflicts: [],
      warnings: []
    };

    // Apply template data
    if (template.data.projectTemplate) {
      this.applyProjectTemplate(template.data.projectTemplate, targetData, application);
    }

    if (template.data.teamTemplate) {
      this.applyTeamTemplate(template.data.teamTemplate, targetData, application);
    }

    if (template.data.taxTemplate) {
      this.applyTaxTemplate(template.data.taxTemplate, targetData, application);
    }

    if (template.data.costsTemplate) {
      this.applyCostsTemplate(template.data.costsTemplate, targetData, application);
    }

    // Record usage
    await this.recordTemplateUsage(templateId);

    return application;
  }

  /**
   * Apply project template
   */
  private applyProjectTemplate(projectTemplate: any, targetData: ServiceDeskData, application: TemplateApplication): void {
    if (projectTemplate.serviceType && targetData.project.serviceType !== projectTemplate.serviceType) {
      if (targetData.project.serviceType !== ServiceType.STANDARD) {
        application.conflicts.push({
          field: 'project.serviceType',
          templateValue: projectTemplate.serviceType,
          existingValue: targetData.project.serviceType,
          resolution: ConflictResolution.ASK_USER
        });
      } else {
        targetData.project.serviceType = projectTemplate.serviceType;
      }
    }

    if (projectTemplate.defaultCurrency && targetData.project.currency !== projectTemplate.defaultCurrency) {
      targetData.project.currency = projectTemplate.defaultCurrency;
    }
  }

  /**
   * Apply team template
   */
  private applyTeamTemplate(teamTemplate: any, targetData: ServiceDeskData, application: TemplateApplication): void {
    if (teamTemplate.roles && teamTemplate.roles.length > 0) {
      // If target has existing team members, create conflict
      if (targetData.team.length > 0) {
        application.conflicts.push({
          field: 'team',
          templateValue: teamTemplate.roles,
          existingValue: targetData.team,
          resolution: ConflictResolution.ASK_USER
        });
      } else {
        // Apply team roles
        targetData.team = teamTemplate.roles.map((roleTemplate: any) => ({
          id: crypto.randomUUID(),
          name: '',
          role: roleTemplate.role,
          salary: roleTemplate.baseSalaryRange.average,
          benefits: teamTemplate.defaultBenefits || {
            healthInsurance: 200,
            mealVoucher: 500,
            transportVoucher: 300,
            lifeInsurance: 50,
            vacation: 0,
            thirteenthSalary: 0,
            fgts: 0,
            inss: 0,
            otherBenefits: []
          },
          workload: roleTemplate.workloadPercentage,
          startDate: new Date(),
          costPerHour: 0,
          skills: roleTemplate.requiredSkills,
          certifications: []
        }));
      }
    }
  }

  /**
   * Apply tax template
   */
  private applyTaxTemplate(taxTemplate: any, targetData: ServiceDeskData, application: TemplateApplication): void {
    if (taxTemplate.defaultRates) {
      Object.assign(targetData.taxes, taxTemplate.defaultRates);
    }
  }

  /**
   * Apply costs template
   */
  private applyCostsTemplate(costsTemplate: any, targetData: ServiceDeskData, application: TemplateApplication): void {
    if (costsTemplate.commonCosts && costsTemplate.commonCosts.length > 0) {
      const newCosts = costsTemplate.commonCosts.map((costTemplate: any) => ({
        id: crypto.randomUUID(),
        name: costTemplate.name,
        category: costTemplate.category,
        value: costTemplate.estimatedValue,
        type: 'fixed',
        frequency: costTemplate.frequency,
        startDate: new Date(),
        description: `Template: ${costTemplate.name}`,
        allocation: {
          method: 'equal',
          periods: []
        }
      }));

      targetData.otherCosts.push(...newCosts);
    }
  }

  /**
   * Create template from current data
   */
  async createTemplateFromData(
    data: ServiceDeskData,
    templateInfo: {
      name: string;
      description: string;
      category: TemplateCategory;
      tags: string[];
      isPublic: boolean;
    }
  ): Promise<ServiceDeskTemplate> {
    const now = new Date();
    
    const template: ServiceDeskTemplate = {
      id: crypto.randomUUID(),
      name: templateInfo.name,
      description: templateInfo.description,
      category: templateInfo.category,
      type: TemplateType.USER_TEMPLATE,
      version: '1.0.0',
      createdAt: now,
      updatedAt: now,
      createdBy: 'user', // TODO: Get actual user ID
      tags: templateInfo.tags,
      isPublic: templateInfo.isPublic,
      usageCount: 0,
      rating: 0,
      metadata: {
        industry: [], // TODO: Infer from data
        serviceTypes: [data.project.serviceType],
        teamSize: {
          min: Math.max(1, data.team.length - 2),
          max: data.team.length + 5,
          optimal: data.team.length
        },
        contractDuration: {
          minMonths: Math.max(1, data.project.contractPeriod.durationMonths - 6),
          maxMonths: data.project.contractPeriod.durationMonths + 12,
          optimalMonths: data.project.contractPeriod.durationMonths
        },
        complexity: this.inferComplexity(data),
        region: [data.taxes.region || 'Brasil'],
        applicableRegions: [data.taxes.region || 'Brasil'],
        prerequisites: [],
        warnings: [],
        recommendations: []
      },
      data: this.extractTemplateData(data)
    };

    await this.saveTemplate(template);
    return template;
  }

  /**
   * Infer complexity from data
   */
  private inferComplexity(data: ServiceDeskData): TemplateComplexity {
    let complexityScore = 0;
    
    // Team size factor
    if (data.team.length > 20) complexityScore += 3;
    else if (data.team.length > 10) complexityScore += 2;
    else if (data.team.length > 5) complexityScore += 1;
    
    // Service type factor
    switch (data.project.serviceType) {
      case ServiceType.ENTERPRISE: complexityScore += 3; break;
      case ServiceType.PREMIUM: complexityScore += 2; break;
      case ServiceType.STANDARD: complexityScore += 1; break;
    }
    
    // Additional costs factor
    if (data.otherCosts.length > 10) complexityScore += 2;
    else if (data.otherCosts.length > 5) complexityScore += 1;
    
    // Contract duration factor
    if (data.project.contractPeriod.durationMonths > 24) complexityScore += 1;
    
    if (complexityScore >= 7) return TemplateComplexity.EXPERT;
    if (complexityScore >= 5) return TemplateComplexity.ADVANCED;
    if (complexityScore >= 3) return TemplateComplexity.INTERMEDIATE;
    return TemplateComplexity.BASIC;
  }

  /**
   * Extract template data from service desk data
   */
  private extractTemplateData(data: ServiceDeskData): any {
    return {
      projectTemplate: {
        serviceType: data.project.serviceType,
        defaultCurrency: data.project.currency,
        defaultContractDuration: data.project.contractPeriod.durationMonths
      },
      teamTemplate: {
        roles: data.team.map(member => ({
          role: member.role,
          description: `Template role: ${member.role}`,
          baseSalaryRange: {
            min: member.salary * 0.8,
            max: member.salary * 1.2,
            average: member.salary,
            currency: data.project.currency,
            region: data.taxes.region || 'Brasil',
            lastUpdated: new Date()
          },
          requiredSkills: member.skills,
          workloadPercentage: member.workload,
          isEssential: true,
          scalingFactor: 1.0
        })),
        defaultBenefits: data.team[0]?.benefits
      },
      taxTemplate: {
        region: data.taxes.region || 'Brasil',
        taxRegime: data.taxes.taxRegime,
        defaultRates: data.taxes
      },
      costsTemplate: {
        industry: 'Generic',
        serviceType: data.project.serviceType,
        commonCosts: data.otherCosts.map(cost => ({
          name: cost.name,
          category: cost.category,
          estimatedValue: cost.value,
          scalingFactor: 1.0,
          frequency: cost.frequency,
          isOptional: false,
          dependencies: []
        }))
      }
    };
  }

  /**
   * Export templates
   */
  async exportTemplates(templateIds: string[]): Promise<TemplateExport> {
    const templates: ServiceDeskTemplate[] = [];
    
    for (const id of templateIds) {
      const template = await this.getTemplate(id);
      if (template) {
        templates.push(template);
      }
    }

    return {
      version: '1.0.0',
      exportedAt: new Date(),
      templates,
      metadata: {
        source: 'ServiceDeskTemplateService',
        exportedBy: 'user', // TODO: Get actual user ID
        includeUsageData: false,
        includePrivateTemplates: false
      }
    };
  }

  /**
   * Import templates
   */
  async importTemplates(templateExport: TemplateExport): Promise<TemplateImport> {
    const conflicts: ImportConflict[] = [];
    
    // Check for conflicts
    for (const template of templateExport.templates) {
      const existing = await this.getTemplate(template.id);
      if (existing) {
        conflicts.push({
          templateId: template.id,
          templateName: template.name,
          conflictType: 'duplicate_id',
          resolution: ImportResolution.SKIP
        });
      }
    }

    // Import templates (for now, skip conflicts)
    for (const template of templateExport.templates) {
      const hasConflict = conflicts.some(c => c.templateId === template.id);
      if (!hasConflict) {
        await this.saveTemplate(template);
      }
    }

    return {
      source: templateExport,
      conflicts,
      options: {
        overwriteExisting: false,
        createBackup: true,
        validateTemplates: true,
        importPrivateTemplates: false
      }
    };
  }

  /**
   * Validate template
   */
  validateTemplate(template: ServiceDeskTemplate): TemplateValidation {
    const errors: any[] = [];
    const warnings: any[] = [];
    let score = 100;

    // Basic validation
    if (!template.name || template.name.trim().length === 0) {
      errors.push({
        field: 'name',
        message: 'Template name is required',
        severity: 'error'
      });
      score -= 20;
    }

    if (!template.description || template.description.trim().length === 0) {
      warnings.push({
        field: 'description',
        message: 'Template description is recommended',
        suggestion: 'Add a detailed description to help users understand the template purpose'
      });
      score -= 5;
    }

    if (!template.data || Object.keys(template.data).length === 0) {
      errors.push({
        field: 'data',
        message: 'Template must contain data',
        severity: 'error'
      });
      score -= 30;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, score)
    };
  }

  /**
   * Record template usage for analytics
   */
  private async recordTemplateUsage(templateId: string): Promise<void> {
    try {
      const db = await this.initDB();
      
      // Get existing analytics or create new
      let analytics = this.analytics.get(templateId);
      if (!analytics) {
        analytics = {
          templateId,
          usageCount: 0,
          lastUsed: new Date(),
          averageRating: 0,
          successRate: 0,
          commonCustomizations: [],
          userFeedback: []
        };
      }

      // Update usage
      analytics.usageCount++;
      analytics.lastUsed = new Date();

      // Save to memory and database
      this.analytics.set(templateId, analytics);

      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([ServiceDeskTemplateService.ANALYTICS_STORE], 'readwrite');
        const store = transaction.objectStore(ServiceDeskTemplateService.ANALYTICS_STORE);
        const request = store.put(analytics);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      // Also update template usage count
      const template = await this.getTemplate(templateId);
      if (template) {
        template.usageCount++;
        await this.saveTemplate(template);
      }
    } catch (error) {
      console.error('Error recording template usage:', error);
    }
  }

  /**
   * Get template analytics
   */
  async getTemplateAnalytics(templateId: string): Promise<TemplateUsageAnalytics | null> {
    try {
      const db = await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([ServiceDeskTemplateService.ANALYTICS_STORE], 'readonly');
        const store = transaction.objectStore(ServiceDeskTemplateService.ANALYTICS_STORE);
        const request = store.get(templateId);
        
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting template analytics:', error);
      return null;
    }
  }

  /**
   * Get popular templates
   */
  async getPopularTemplates(limit: number = 10): Promise<ServiceDeskTemplate[]> {
    const templates = await this.loadTemplates();
    
    return templates
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  /**
   * Get recommended templates based on current data
   */
  async getRecommendedTemplates(currentData: ServiceDeskData): Promise<ServiceDeskTemplate[]> {
    const templates = await this.loadTemplates();
    
    return templates.filter(template => {
      // Match service type
      if (!template.metadata.serviceTypes.includes(currentData.project.serviceType)) {
        return false;
      }
      
      // Match team size range
      const teamSize = currentData.team.length;
      if (teamSize > 0) {
        const { min, max } = template.metadata.teamSize;
        if (teamSize < min || teamSize > max) {
          return false;
        }
      }
      
      return true;
    }).slice(0, 5); // Return top 5 recommendations
  }
}