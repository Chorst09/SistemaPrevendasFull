/**
 * PDF Compatibility Layer
 * Ensures backward compatibility with existing PDF generation system
 * while providing enhanced functionality for Service Desk integration
 */

import { 
  ProposalData, 
  ClientData, 
  CompanyInfo,
  EquipmentItem,
  PDFGenerationResult,
  SavedProposal,
  SimplePDFData
} from '@/lib/types/pdf/core';

import { PDFGenerator } from '@/components/pdf-generation/generators/PDFGenerator';
import { ServiceDeskPDFGenerator } from '@/lib/pdf/generators/ServiceDeskPDFGenerator';
import { 
  PDFIntegrationBridge,
  PDFTemplateConfig,
  DataMappingConfig
} from './pdf-integration-bridge';

import { 
  ServiceDeskData,
  ExecutiveDashboard
} from '@/lib/types/service-desk-pricing';

import { ServiceDeskProposal } from '@/lib/types/service-desk';

/**
 * Legacy PDF generation options for backward compatibility
 */
export interface LegacyPDFOptions {
  template?: 'standard' | 'professional' | 'simple';
  includeCharts?: boolean;
  includeDetails?: boolean;
  companyInfo?: Partial<CompanyInfo>;
  customization?: {
    colors?: Record<string, string>;
    fonts?: Record<string, string>;
    layout?: 'portrait' | 'landscape';
  };
}

/**
 * Enhanced PDF generation options (new functionality)
 */
export interface EnhancedPDFOptions extends LegacyPDFOptions {
  serviceDeskData?: ServiceDeskData;
  executiveDashboard?: ExecutiveDashboard;
  templateConfig?: Partial<PDFTemplateConfig>;
  mappingConfig?: Partial<DataMappingConfig>;
  enableEnhancedFeatures?: boolean;
}

/**
 * Migration status for gradual data migration
 */
export interface MigrationStatus {
  isLegacyData: boolean;
  migrationRequired: boolean;
  migrationSteps: string[];
  compatibilityLevel: 'full' | 'partial' | 'deprecated';
}

/**
 * PDF Compatibility Layer Class
 * Provides unified interface for both legacy and enhanced PDF generation
 */
export class PDFCompatibilityLayer {
  private legacyGenerator: PDFGenerator;
  private serviceDeskGenerator: ServiceDeskPDFGenerator;
  private integrationBridge: PDFIntegrationBridge;
  private migrationEnabled: boolean;

  constructor(enableMigration: boolean = true) {
    this.legacyGenerator = new PDFGenerator();
    this.serviceDeskGenerator = new ServiceDeskPDFGenerator();
    this.integrationBridge = new PDFIntegrationBridge();
    this.migrationEnabled = enableMigration;
  }

  /**
   * Main PDF generation method with backward compatibility
   * Automatically detects data type and uses appropriate generator
   */
  async generatePDF(
    proposalData: ProposalData | ServiceDeskData,
    clientData: ClientData,
    options: EnhancedPDFOptions = {}
  ): Promise<PDFGenerationResult> {
    
    try {
      // Detect data type and migration status
      const migrationStatus = this.analyzeMigrationStatus(proposalData, options);
      
      // Handle legacy data with fallback support
      if (migrationStatus.isLegacyData) {
        return await this.handleLegacyGeneration(
          proposalData as ProposalData, 
          clientData, 
          options,
          migrationStatus
        );
      }

      // Handle enhanced service desk data
      if (this.isServiceDeskData(proposalData)) {
        return await this.handleEnhancedGeneration(
          proposalData as ServiceDeskData,
          clientData,
          options
        );
      }

      // Fallback to legacy generator for unknown data types
      console.warn('Unknown data type, falling back to legacy generator');
      return await this.legacyGenerator.generatePDF(proposalData as ProposalData, clientData);

    } catch (error) {
      console.error('PDF generation failed:', error);
      
      // Attempt fallback generation if enhanced generation fails
      if (options.enableEnhancedFeatures && !migrationStatus.isLegacyData) {
        console.log('Attempting fallback to legacy generator...');
        try {
          const legacyData = this.convertToLegacyFormat(proposalData, clientData);
          return await this.legacyGenerator.generatePDF(legacyData, clientData);
        } catch (fallbackError) {
          console.error('Fallback generation also failed:', fallbackError);
          throw error; // Throw original error
        }
      }
      
      throw error;
    }
  }

  /**
   * Legacy PDF generation with preserved interface
   */
  async generateLegacyPDF(
    proposalData: ProposalData,
    clientData: ClientData,
    options: LegacyPDFOptions = {}
  ): Promise<{ blob: Blob; url: string }> {
    
    // Set company info if provided
    if (options.companyInfo) {
      this.legacyGenerator.setCompanyInfo(options.companyInfo);
    }

    // Apply legacy customizations
    if (options.customization) {
      this.applyLegacyCustomizations(options.customization);
    }

    // Generate using legacy generator
    const result = await this.legacyGenerator.generatePDF(proposalData, clientData);
    
    return {
      blob: result.blob,
      url: result.url
    };
  }

  /**
   * Enhanced PDF generation for Service Desk data
   */
  async generateEnhancedPDF(
    serviceDeskData: ServiceDeskData,
    clientData: ClientData,
    executiveDashboard?: ExecutiveDashboard,
    options: EnhancedPDFOptions = {}
  ): Promise<PDFGenerationResult> {
    
    return await this.integrationBridge.generateEnhancedPDF(
      serviceDeskData,
      executiveDashboard,
      options.templateConfig,
      options.mappingConfig
    );
  }

  /**
   * Service Desk proposal generation (existing interface preserved)
   */
  async generateServiceDeskProposal(
    proposal: ServiceDeskProposal
  ): Promise<{ blob: Blob; url: string }> {
    
    return await this.serviceDeskGenerator.generateProposalPDF(proposal);
  }

  /**
   * Simple PDF generation (preserved for backward compatibility)
   */
  async generateSimplePDF(
    data: SimplePDFData,
    options: LegacyPDFOptions = {}
  ): Promise<{ blob: Blob; url: string }> {
    
    // Convert simple data to full proposal format
    const proposalData: ProposalData = {
      equipments: data.equipments.map((eq, index) => ({
        id: `eq-${index}`,
        model: eq.model,
        brand: eq.brand,
        type: eq.type,
        monthlyVolume: eq.monthlyVolume,
        monthlyCost: eq.monthlyCost,
        specifications: {},
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      totalMonthly: data.totalMonthly,
      totalAnnual: data.totalAnnual,
      contractPeriod: 12,
      generatedAt: new Date()
    };

    const clientData: ClientData = {
      companyName: data.clientName,
      contactName: 'Contato',
      email: 'contato@cliente.com',
      phone: '(11) 9999-9999',
      projectName: data.projectName,
      managerName: 'Gerente',
      managerEmail: 'gerente@cliente.com',
      managerPhone: '(11) 9999-9999'
    };

    return await this.generateLegacyPDF(proposalData, clientData, options);
  }

  /**
   * Data migration utilities
   */
  async migrateProposalData(
    legacyData: ProposalData,
    clientData: ClientData
  ): Promise<ServiceDeskData> {
    
    if (!this.migrationEnabled) {
      throw new Error('Migration is disabled');
    }

    // Create basic service desk data structure from legacy data
    const serviceDeskData: ServiceDeskData = {
      project: {
        id: `migrated-${Date.now()}`,
        name: clientData.projectName,
        client: {
          name: clientData.companyName,
          document: '',
          email: clientData.email,
          phone: clientData.phone,
          address: {
            street: '',
            number: '',
            neighborhood: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'Brasil'
          },
          contactPerson: clientData.contactName
        },
        contractPeriod: {
          startDate: new Date(),
          endDate: new Date(Date.now() + legacyData.contractPeriod * 30 * 24 * 60 * 60 * 1000),
          durationMonths: legacyData.contractPeriod,
          renewalOptions: []
        },
        description: `Projeto migrado de dados legados`,
        currency: 'BRL',
        location: 'Brasil',
        serviceType: 'standard' as any,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      team: this.migrateEquipmentsToTeam(legacyData.equipments),
      schedules: [],
      taxes: this.createDefaultTaxConfiguration(),
      variables: this.createDefaultMarketVariables(),
      otherCosts: [],
      budget: this.createBudgetFromLegacyData(legacyData),
      analysis: this.createDefaultAnalysis(legacyData),
      negotiations: [],
      finalAnalysis: this.createDefaultExecutiveDashboard(legacyData),
      metadata: {
        version: '1.0.0',
        lastModified: new Date(),
        modifiedBy: 'system-migration',
        status: 'DRAFT' as any,
        tags: ['migrated', 'legacy'],
        notes: 'Dados migrados do sistema legado',
        attachments: []
      }
    };

    return serviceDeskData;
  }

  /**
   * Check migration status and requirements
   */
  analyzeMigrationStatus(
    data: ProposalData | ServiceDeskData,
    options: EnhancedPDFOptions
  ): MigrationStatus {
    
    const isLegacyData = this.isLegacyProposalData(data);
    const hasEnhancedOptions = !!(options.serviceDeskData || options.executiveDashboard);
    
    return {
      isLegacyData,
      migrationRequired: isLegacyData && hasEnhancedOptions,
      migrationSteps: isLegacyData ? [
        'Convert equipment items to team members',
        'Create default schedules',
        'Set up tax configuration',
        'Initialize market variables',
        'Create budget structure'
      ] : [],
      compatibilityLevel: isLegacyData ? 'partial' : 'full'
    };
  }

  /**
   * Preserve existing saved proposal functionality
   */
  async savePDFProposal(
    proposalData: ProposalData,
    clientData: ClientData,
    pdfBlob: Blob,
    version?: number
  ): Promise<SavedProposal> {
    
    const savedProposal: SavedProposal = {
      id: `proposal-${Date.now()}`,
      clientName: clientData.companyName,
      projectName: clientData.projectName,
      totalValue: proposalData.totalAnnual,
      createdAt: new Date(),
      updatedAt: new Date(),
      pdfBlob,
      proposalData,
      clientData,
      version: version || 1
    };

    // Store in localStorage for backward compatibility
    try {
      const proposals = this.getSavedProposals();
      proposals.push(savedProposal);
      localStorage.setItem('saved-proposals', JSON.stringify(proposals));
    } catch (error) {
      console.warn('Failed to save proposal to localStorage:', error);
    }

    return savedProposal;
  }

  /**
   * Get saved proposals (preserved functionality)
   */
  getSavedProposals(): SavedProposal[] {
    try {
      const saved = localStorage.getItem('saved-proposals');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn('Failed to load saved proposals:', error);
      return [];
    }
  }

  // Private helper methods
  private async handleLegacyGeneration(
    proposalData: ProposalData,
    clientData: ClientData,
    options: EnhancedPDFOptions,
    migrationStatus: MigrationStatus
  ): Promise<PDFGenerationResult> {
    
    // If enhanced features are requested, attempt migration
    if (options.enableEnhancedFeatures && options.serviceDeskData) {
      try {
        return await this.handleEnhancedGeneration(
          options.serviceDeskData,
          clientData,
          options
        );
      } catch (error) {
        console.warn('Enhanced generation failed, falling back to legacy:', error);
      }
    }

    // Use legacy generator
    const result = await this.generateLegacyPDF(proposalData, clientData, options);
    
    return {
      blob: result.blob,
      url: result.url,
      size: result.blob.size,
      generatedAt: new Date()
    };
  }

  private async handleEnhancedGeneration(
    serviceDeskData: ServiceDeskData,
    clientData: ClientData,
    options: EnhancedPDFOptions
  ): Promise<PDFGenerationResult> {
    
    return await this.integrationBridge.generateEnhancedPDF(
      serviceDeskData,
      options.executiveDashboard,
      options.templateConfig,
      options.mappingConfig
    );
  }

  private isServiceDeskData(data: any): data is ServiceDeskData {
    return data && 
           typeof data === 'object' && 
           'project' in data && 
           'team' in data && 
           'schedules' in data &&
           'budget' in data;
  }

  private isLegacyProposalData(data: any): data is ProposalData {
    return data && 
           typeof data === 'object' && 
           'equipments' in data && 
           'totalMonthly' in data && 
           'totalAnnual' in data &&
           !('project' in data);
  }

  private convertToLegacyFormat(
    data: ProposalData | ServiceDeskData,
    clientData: ClientData
  ): ProposalData {
    
    if (this.isLegacyProposalData(data)) {
      return data;
    }

    if (this.isServiceDeskData(data)) {
      return {
        equipments: data.team.map((member, index) => ({
          id: member.id || `member-${index}`,
          model: member.role,
          brand: 'Recurso Humano',
          type: 'Profissional',
          monthlyVolume: member.workload * 4.33,
          monthlyCost: member.salary,
          specifications: {
            name: member.name,
            skills: member.skills
          },
          createdAt: new Date(),
          updatedAt: new Date()
        })),
        totalMonthly: data.budget.totalPrice / data.project.contractPeriod.durationMonths,
        totalAnnual: data.budget.totalPrice,
        contractPeriod: data.project.contractPeriod.durationMonths,
        generatedAt: new Date()
      };
    }

    throw new Error('Unable to convert data to legacy format');
  }

  private applyLegacyCustomizations(customization: any): void {
    // Apply legacy customizations to generators
    // This preserves existing customization behavior
    if (customization.colors) {
      // Apply color customizations
    }
    
    if (customization.fonts) {
      // Apply font customizations
    }
  }

  // Migration helper methods
  private migrateEquipmentsToTeam(equipments: EquipmentItem[]): any[] {
    return equipments.map((equipment, index) => ({
      id: equipment.id || `migrated-member-${index}`,
      name: equipment.specifications?.name || `Profissional ${index + 1}`,
      role: equipment.model,
      salary: equipment.monthlyCost,
      benefits: {
        healthInsurance: 0,
        mealVoucher: 0,
        transportVoucher: 0,
        lifeInsurance: 0,
        vacation: 0,
        thirteenthSalary: 0,
        fgts: 0,
        inss: 0,
        otherBenefits: []
      },
      workload: equipment.monthlyVolume / 4.33, // Convert monthly to weekly hours
      startDate: new Date(),
      costPerHour: equipment.monthlyCost / (equipment.monthlyVolume || 160),
      skills: equipment.specifications?.skills || [],
      certifications: equipment.specifications?.certifications || []
    }));
  }

  private createDefaultTaxConfiguration(): any {
    return {
      region: 'Brasil',
      icms: 0,
      pis: 1.65,
      cofins: 7.6,
      iss: 5,
      ir: 0,
      csll: 0,
      customTaxes: [],
      taxRegime: 'SIMPLES_NACIONAL'
    };
  }

  private createDefaultMarketVariables(): any {
    return {
      inflation: {
        annualRate: 5.0,
        monthlyRate: 0.4,
        projectionPeriod: 12,
        source: 'IBGE',
        lastUpdate: new Date()
      },
      salaryAdjustments: {
        annualAdjustment: 5.0,
        adjustmentDate: new Date(),
        adjustmentType: 'inflation',
        minimumAdjustment: 3.0,
        maximumAdjustment: 10.0
      },
      marketFactors: [],
      scenarios: []
    };
  }

  private createBudgetFromLegacyData(legacyData: ProposalData): any {
    return {
      teamCosts: {
        salaries: legacyData.totalMonthly * 0.7,
        benefits: legacyData.totalMonthly * 0.2,
        total: legacyData.totalMonthly * 0.9
      },
      infrastructureCosts: legacyData.totalMonthly * 0.05,
      otherCosts: legacyData.totalMonthly * 0.05,
      taxes: {
        federal: legacyData.totalMonthly * 0.08,
        state: legacyData.totalMonthly * 0.02,
        municipal: legacyData.totalMonthly * 0.03,
        total: legacyData.totalMonthly * 0.13
      },
      totalCosts: legacyData.totalMonthly,
      margin: {
        type: 'percentage',
        value: 20,
        minimumMargin: 10,
        targetMargin: 20,
        maximumMargin: 30
      },
      totalPrice: legacyData.totalAnnual,
      monthlyBreakdown: []
    };
  }

  private createDefaultAnalysis(legacyData: ProposalData): any {
    return {
      roi: {
        investment: legacyData.totalAnnual,
        returns: [legacyData.totalAnnual * 1.2],
        roi: 20,
        irr: 15,
        npv: legacyData.totalAnnual * 0.2,
        period: legacyData.contractPeriod
      },
      payback: {
        simplePayback: 12,
        discountedPayback: 14,
        breakEvenPoint: 10,
        cashFlowAnalysis: []
      },
      margins: {
        grossMargin: 20,
        netMargin: 15,
        ebitdaMargin: 18,
        contributionMargin: 25,
        marginTrend: []
      },
      riskAnalysis: {
        riskFactors: [],
        overallRisk: 'medium' as const,
        mitigation: []
      },
      sensitivityAnalysis: {
        variables: [],
        scenarios: []
      },
      charts: []
    };
  }

  private createDefaultExecutiveDashboard(legacyData: ProposalData): any {
    return {
      kpis: [
        {
          name: 'Valor Total',
          value: legacyData.totalAnnual,
          unit: 'R$',
          status: 'good' as const,
          trend: 'stable' as const,
          description: 'Valor total do projeto'
        }
      ],
      summary: {
        projectValue: legacyData.totalAnnual,
        expectedProfit: legacyData.totalAnnual * 0.2,
        riskLevel: 'medium' as const,
        recommendedAction: 'approve' as const,
        keyHighlights: ['Projeto migrado do sistema legado'],
        concerns: []
      },
      recommendations: [],
      benchmarks: [],
      approvals: []
    };
  }
}

/**
 * Singleton instance for global access
 */
export const pdfCompatibilityLayer = new PDFCompatibilityLayer();

/**
 * Utility functions for backward compatibility
 */
export const legacyPDFUtils = {
  /**
   * Generate PDF using legacy interface (preserved)
   */
  async generatePDF(
    proposalData: ProposalData,
    clientData: ClientData,
    options?: LegacyPDFOptions
  ): Promise<{ blob: Blob; url: string }> {
    return await pdfCompatibilityLayer.generateLegacyPDF(proposalData, clientData, options);
  },

  /**
   * Generate simple PDF (preserved)
   */
  async generateSimplePDF(
    data: SimplePDFData,
    options?: LegacyPDFOptions
  ): Promise<{ blob: Blob; url: string }> {
    return await pdfCompatibilityLayer.generateSimplePDF(data, options);
  },

  /**
   * Save proposal (preserved)
   */
  async saveProposal(
    proposalData: ProposalData,
    clientData: ClientData,
    pdfBlob: Blob
  ): Promise<SavedProposal> {
    return await pdfCompatibilityLayer.savePDFProposal(proposalData, clientData, pdfBlob);
  },

  /**
   * Get saved proposals (preserved)
   */
  getSavedProposals(): SavedProposal[] {
    return pdfCompatibilityLayer.getSavedProposals();
  }
};

/**
 * Enhanced PDF utilities (new functionality)
 */
export const enhancedPDFUtils = {
  /**
   * Generate enhanced PDF with service desk data
   */
  async generateEnhancedPDF(
    serviceDeskData: ServiceDeskData,
    clientData: ClientData,
    executiveDashboard?: ExecutiveDashboard,
    options?: EnhancedPDFOptions
  ): Promise<PDFGenerationResult> {
    return await pdfCompatibilityLayer.generateEnhancedPDF(
      serviceDeskData,
      clientData,
      executiveDashboard,
      options
    );
  },

  /**
   * Migrate legacy data to service desk format
   */
  async migrateLegacyData(
    legacyData: ProposalData,
    clientData: ClientData
  ): Promise<ServiceDeskData> {
    return await pdfCompatibilityLayer.migrateProposalData(legacyData, clientData);
  },

  /**
   * Check if data needs migration
   */
  checkMigrationStatus(
    data: ProposalData | ServiceDeskData,
    options: EnhancedPDFOptions = {}
  ): MigrationStatus {
    return pdfCompatibilityLayer.analyzeMigrationStatus(data, options);
  }
};