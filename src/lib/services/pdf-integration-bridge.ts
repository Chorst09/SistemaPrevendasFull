/**
 * PDF Integration Bridge
 * Maps Service Desk Pricing System data to PDF generation system
 * Provides enhanced proposal generation with executive dashboard integration
 */

import { 
  ServiceDeskData, 
  ExecutiveDashboard,
  TeamMember,
  WorkSchedule,
  ConsolidatedBudget,
  ProfitabilityAnalysis,
  NegotiationScenario,
  KPI,
  Recommendation,
  MarketBenchmark,
  ApprovalStatus
} from '@/lib/types/service-desk-pricing';

import { 
  ProposalData, 
  ClientData, 
  CompanyInfo,
  EquipmentItem,
  PDFGenerationResult 
} from '@/lib/types/pdf/core';

import { ServiceDeskProposal } from '@/lib/types/service-desk';
import { PDFGenerator } from '@/components/pdf-generation/generators/PDFGenerator';
import { ServiceDeskPDFGenerator } from '@/lib/pdf/generators/ServiceDeskPDFGenerator';
import { 
  EnhancedProposalData,
  TeamCompositionSection,
  ScheduleAnalysisSection,
  FinancialBreakdownSection,
  RiskAssessmentSection,
  RecommendationSection,
  BenchmarkAnalysisSection,
  ApprovalWorkflowSection,
  ServiceDeskPDFOptions
} from './service-desk-pdf-integration';

/**
 * Enhanced PDF template configuration
 */
export interface PDFTemplateConfig {
  templateType: 'standard' | 'executive' | 'detailed' | 'summary';
  includeExecutiveSummary: boolean;
  includeKPIs: boolean;
  includeTeamAnalysis: boolean;
  includeScheduleAnalysis: boolean;
  includeFinancialBreakdown: boolean;
  includeRiskAssessment: boolean;
  includeRecommendations: boolean;
  includeBenchmarks: boolean;
  includeApprovalWorkflow: boolean;
  language: 'pt' | 'en';
  branding: BrandingConfig;
}

export interface BrandingConfig {
  companyLogo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  customHeader?: string;
  customFooter?: string;
}

/**
 * Data mapping configuration
 */
export interface DataMappingConfig {
  teamMemberToEquipment: boolean;
  scheduleToService: boolean;
  costsToLineItems: boolean;
  preserveOriginalStructure: boolean;
  enhanceWithCalculations: boolean;
}

/**
 * PDF Integration Bridge Class
 */
export class PDFIntegrationBridge {
  private pdfGenerator: PDFGenerator;
  private serviceDeskPDFGenerator: ServiceDeskPDFGenerator;
  private defaultConfig: PDFTemplateConfig;

  constructor() {
    this.pdfGenerator = new PDFGenerator();
    this.serviceDeskPDFGenerator = new ServiceDeskPDFGenerator();
    this.defaultConfig = this.getDefaultTemplateConfig();
  }

  /**
   * Main method to generate enhanced PDF from Service Desk data
   */
  async generateEnhancedPDF(
    serviceDeskData: ServiceDeskData,
    executiveDashboard?: ExecutiveDashboard,
    templateConfig: Partial<PDFTemplateConfig> = {},
    mappingConfig: Partial<DataMappingConfig> = {}
  ): Promise<PDFGenerationResult> {
    
    const config = { ...this.defaultConfig, ...templateConfig };
    const mapping = { ...this.getDefaultMappingConfig(), ...mappingConfig };

    try {
      // Map service desk data to PDF-compatible format
      const proposalData = this.mapServiceDeskDataToProposal(serviceDeskData, mapping);
      const clientData = this.mapServiceDeskDataToClient(serviceDeskData);
      const companyInfo = this.createCompanyInfo(config.branding);

      // Create enhanced proposal data if executive dashboard is available
      if (executiveDashboard && config.templateType === 'executive') {
        const enhancedData = this.createEnhancedProposalData(
          serviceDeskData, 
          executiveDashboard, 
          proposalData,
          config
        );
        
        return await this.generateExecutivePDF(enhancedData, clientData, companyInfo, executiveDashboard);
      }

      // Generate standard or detailed PDF
      if (config.templateType === 'detailed') {
        return await this.generateDetailedPDF(proposalData, clientData, companyInfo, serviceDeskData);
      }

      // Generate standard PDF
      this.pdfGenerator.setCompanyInfo(companyInfo);
      return await this.pdfGenerator.generatePDF(proposalData, clientData);

    } catch (error) {
      console.error('Error generating enhanced PDF:', error);
      throw new Error(`Falha na geração do PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Maps Service Desk data to standard PDF proposal format
   */
  mapServiceDeskDataToProposal(
    serviceDeskData: ServiceDeskData,
    mappingConfig: DataMappingConfig
  ): ProposalData {
    
    const equipments = mappingConfig.teamMemberToEquipment 
      ? this.mapTeamMembersToEquipments(serviceDeskData.team)
      : this.mapSchedulesToEquipments(serviceDeskData.schedules);

    // Calculate totals from budget
    const totalMonthly = serviceDeskData.budget.totalPrice / serviceDeskData.project.contractPeriod.durationMonths;
    const totalAnnual = serviceDeskData.budget.totalPrice;

    return {
      equipments,
      totalMonthly,
      totalAnnual,
      contractPeriod: serviceDeskData.project.contractPeriod.durationMonths,
      generatedAt: new Date()
    };
  }

  /**
   * Maps Service Desk data to client information
   */
  mapServiceDeskDataToClient(serviceDeskData: ServiceDeskData): ClientData {
    const client = serviceDeskData.project.client;
    
    return {
      companyName: client.name,
      contactName: client.contactPerson,
      email: client.email,
      phone: client.phone,
      projectName: serviceDeskData.project.name,
      managerName: client.contactPerson,
      managerEmail: client.email,
      managerPhone: client.phone
    };
  }

  /**
   * Creates enhanced proposal data with executive dashboard information
   */
  private createEnhancedProposalData(
    serviceDeskData: ServiceDeskData,
    executiveDashboard: ExecutiveDashboard,
    baseProposal: ProposalData,
    config: PDFTemplateConfig
  ): EnhancedProposalData {
    
    return {
      ...baseProposal,
      serviceDeskData,
      executiveDashboard,
      teamComposition: config.includeTeamAnalysis 
        ? this.createTeamCompositionSection(serviceDeskData)
        : this.createEmptyTeamComposition(),
      scheduleAnalysis: config.includeScheduleAnalysis
        ? this.createScheduleAnalysisSection(serviceDeskData)
        : this.createEmptyScheduleAnalysis(),
      financialBreakdown: config.includeFinancialBreakdown
        ? this.createFinancialBreakdownSection(serviceDeskData)
        : this.createEmptyFinancialBreakdown(),
      riskAssessment: config.includeRiskAssessment
        ? this.createRiskAssessmentSection(serviceDeskData, executiveDashboard)
        : this.createEmptyRiskAssessment(),
      recommendations: config.includeRecommendations
        ? this.createRecommendationSections(executiveDashboard.recommendations)
        : [],
      benchmarkAnalysis: config.includeBenchmarks
        ? this.createBenchmarkAnalysisSection(executiveDashboard.benchmarks)
        : this.createEmptyBenchmarkAnalysis(),
      approvalWorkflow: config.includeApprovalWorkflow
        ? this.createApprovalWorkflowSection(executiveDashboard.approvals)
        : this.createEmptyApprovalWorkflow()
    };
  }

  /**
   * Maps team members to equipment items for PDF compatibility
   */
  private mapTeamMembersToEquipments(teamMembers: TeamMember[]): EquipmentItem[] {
    return teamMembers.map((member, index) => ({
      id: member.id || `member-${index}`,
      model: member.role,
      brand: 'Recurso Humano',
      type: 'Profissional',
      monthlyVolume: member.workload * 4.33, // Convert weekly hours to monthly
      monthlyCost: this.calculateMemberMonthlyCost(member),
      specifications: {
        name: member.name,
        skills: member.skills,
        certifications: member.certifications,
        startDate: member.startDate,
        endDate: member.endDate,
        costPerHour: member.costPerHour,
        benefits: member.benefits
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }

  /**
   * Maps work schedules to equipment items for service-based PDF
   */
  private mapSchedulesToEquipments(schedules: WorkSchedule[]): EquipmentItem[] {
    return schedules.flatMap((schedule, scheduleIndex) => 
      schedule.shifts.map((shift, shiftIndex) => ({
        id: `${schedule.id}-${shift.id}` || `schedule-${scheduleIndex}-shift-${shiftIndex}`,
        model: `${schedule.name} - ${shift.name}`,
        brand: 'Escala de Trabalho',
        type: 'Turno de Atendimento',
        monthlyVolume: this.calculateShiftMonthlyHours(shift),
        monthlyCost: this.calculateShiftMonthlyCost(shift, schedule),
        specifications: {
          startTime: shift.startTime,
          endTime: shift.endTime,
          daysOfWeek: shift.daysOfWeek,
          teamMembers: shift.teamMembers,
          isSpecialShift: shift.isSpecialShift,
          multiplier: shift.multiplier,
          coverage: schedule.coverage
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    );
  }

  /**
   * Generates executive PDF with enhanced template
   */
  private async generateExecutivePDF(
    enhancedData: EnhancedProposalData,
    clientData: ClientData,
    companyInfo: CompanyInfo,
    executiveDashboard: ExecutiveDashboard
  ): Promise<PDFGenerationResult> {
    
    // Create service desk proposal for specialized generator
    const serviceDeskProposal: ServiceDeskProposal = {
      id: `proposal-${Date.now()}`,
      clientData: {
        companyName: clientData.companyName,
        contactName: clientData.contactName,
        email: clientData.email,
        phone: clientData.phone,
        projectName: clientData.projectName,
        managerName: clientData.managerName,
        managerEmail: clientData.managerEmail,
        managerPhone: clientData.managerPhone,
        employeeCount: enhancedData.serviceDeskData.team.length,
        businessHours: {
          start: '08:00',
          end: '18:00',
          timezone: 'America/Sao_Paulo'
        },
        criticalSystems: []
      },
      serviceLevel: this.determineServiceLevel(enhancedData.serviceDeskData),
      serviceItems: this.createServiceItems(enhancedData.serviceDeskData),
      totals: {
        totalUsers: enhancedData.serviceDeskData.team.length,
        totalSetupCost: enhancedData.financialBreakdown.otherCosts.total,
        monthlyCost: enhancedData.totalMonthly,
        annualCost: enhancedData.totalAnnual,
        totalIncludedHours: enhancedData.serviceDeskData.team.length * 160,
        estimatedAdditionalHours: 0,
        additionalHoursCost: 0
      },
      contractType: 'Anual' as any,
      slaConfiguration: this.createSLAConfiguration(),
      status: 'Rascunho',
      createdAt: new Date(),
      updatedAt: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      version: 1,
      serviceDeskData: enhancedData.serviceDeskData,
      executiveDashboard,
      enhancedSections: {
        teamComposition: enhancedData.teamComposition,
        scheduleAnalysis: enhancedData.scheduleAnalysis,
        financialBreakdown: enhancedData.financialBreakdown,
        riskAssessment: enhancedData.riskAssessment,
        recommendations: enhancedData.recommendations,
        benchmarkAnalysis: enhancedData.benchmarkAnalysis,
        approvalWorkflow: enhancedData.approvalWorkflow
      }
    };

    const result = await this.serviceDeskPDFGenerator.generateProposalPDF(serviceDeskProposal);
    
    return {
      blob: result.blob,
      url: result.url,
      size: result.blob.size,
      generatedAt: new Date()
    };
  }

  /**
   * Generates detailed PDF with comprehensive analysis
   */
  private async generateDetailedPDF(
    proposalData: ProposalData,
    clientData: ClientData,
    companyInfo: CompanyInfo,
    serviceDeskData: ServiceDeskData
  ): Promise<PDFGenerationResult> {
    
    // Enhance proposal data with service desk details
    const enhancedProposal = {
      ...proposalData,
      serviceDeskDetails: {
        teamAnalysis: this.createTeamAnalysisSummary(serviceDeskData.team),
        scheduleAnalysis: this.createScheduleAnalysisSummary(serviceDeskData.schedules),
        financialAnalysis: this.createFinancialAnalysisSummary(serviceDeskData.budget),
        riskAnalysis: this.createRiskAnalysisSummary(serviceDeskData.analysis)
      }
    };

    this.pdfGenerator.setCompanyInfo(companyInfo);
    return await this.pdfGenerator.generatePDF(enhancedProposal, clientData);
  }

  // Helper methods for data creation
  private createTeamCompositionSection(serviceDeskData: ServiceDeskData): TeamCompositionSection {
    const team = serviceDeskData.team;
    
    // Group by role
    const roleGroups = team.reduce((groups, member) => {
      const role = member.role;
      if (!groups[role]) {
        groups[role] = [];
      }
      groups[role].push(member);
      return groups;
    }, {} as Record<string, TeamMember[]>);

    const roles = Object.entries(roleGroups).map(([role, members]) => {
      const avgSalary = members.reduce((sum, member) => sum + member.salary, 0) / members.length;
      const totalCost = members.reduce((sum, member) => sum + this.calculateMemberMonthlyCost(member), 0);
      
      return {
        role,
        count: members.length,
        avgSalary,
        totalCost
      };
    });

    const totalMonthlyCost = serviceDeskData.budget.teamCosts.total;
    const totalAnnualCost = totalMonthlyCost * 12;
    const totalHours = team.reduce((sum, member) => sum + member.workload, 0) * 4.33;
    const costPerHour = totalHours > 0 ? totalMonthlyCost / totalHours : 0;

    return {
      totalMembers: team.length,
      roles,
      totalMonthlyCost,
      totalAnnualCost,
      costPerHour
    };
  }

  private createScheduleAnalysisSection(serviceDeskData: ServiceDeskData): ScheduleAnalysisSection {
    const schedules = serviceDeskData.schedules;
    
    // Calculate coverage
    const totalPossibleHours = 168; // 24h * 7 days
    let coveredHours = 0;
    
    schedules.forEach(schedule => {
      schedule.shifts.forEach(shift => {
        const shiftHours = this.calculateShiftDailyHours(shift);
        coveredHours += shiftHours * shift.daysOfWeek.length;
      });
    });

    const coveragePercentage = Math.min((coveredHours / totalPossibleHours) * 100, 100);

    const shifts = schedules.flatMap(schedule => 
      schedule.shifts.map(shift => ({
        name: shift.name,
        hours: `${shift.startTime} - ${shift.endTime}`,
        daysOfWeek: shift.daysOfWeek.map(day => ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][day]),
        teamMembers: shift.teamMembers.length
      }))
    );

    const specialRates = schedules.flatMap(schedule => 
      schedule.specialRates.map(rate => ({
        name: rate.name,
        multiplier: rate.multiplier,
        applicableShifts: rate.applicableShifts
      }))
    );

    return {
      totalSchedules: schedules.length,
      coveragePercentage,
      shifts,
      specialRates,
      gaps: [] // Simplified for now
    };
  }

  private createFinancialBreakdownSection(serviceDeskData: ServiceDeskData): FinancialBreakdownSection {
    const budget = serviceDeskData.budget;
    
    return {
      teamCosts: {
        salaries: budget.teamCosts.salaries,
        benefits: budget.teamCosts.benefits,
        total: budget.teamCosts.total
      },
      otherCosts: {
        infrastructure: budget.infrastructureCosts,
        licenses: serviceDeskData.otherCosts
          .filter(cost => cost.category === 'LICENSES')
          .reduce((sum, cost) => sum + cost.value, 0),
        training: serviceDeskData.otherCosts
          .filter(cost => cost.category === 'TRAINING')
          .reduce((sum, cost) => sum + cost.value, 0),
        other: serviceDeskData.otherCosts
          .filter(cost => !['LICENSES', 'TRAINING', 'INFRASTRUCTURE'].includes(cost.category))
          .reduce((sum, cost) => sum + cost.value, 0),
        total: budget.otherCosts
      },
      taxes: {
        federal: budget.taxes.federal,
        state: budget.taxes.state,
        municipal: budget.taxes.municipal,
        total: budget.taxes.total,
        effectiveRate: budget.totalPrice > 0 ? (budget.taxes.total / budget.totalPrice) * 100 : 0
      },
      margins: {
        grossMargin: serviceDeskData.analysis.margins.grossMargin,
        netMargin: serviceDeskData.analysis.margins.netMargin,
        targetMargin: budget.margin.value
      },
      totals: {
        totalCosts: budget.totalCosts,
        totalPrice: budget.totalPrice,
        profit: budget.totalPrice - budget.totalCosts,
        profitMargin: budget.totalPrice > 0 ? ((budget.totalPrice - budget.totalCosts) / budget.totalPrice) * 100 : 0
      }
    };
  }

  private createRiskAssessmentSection(
    serviceDeskData: ServiceDeskData, 
    executiveDashboard?: ExecutiveDashboard
  ): RiskAssessmentSection {
    
    const riskFactors = [];
    let riskScore = 0;

    // Analyze team size risk
    if (serviceDeskData.team.length < 3) {
      riskFactors.push({
        factor: 'Equipe muito pequena para cobertura adequada',
        impact: 'high' as const,
        probability: 0.8,
        mitigation: 'Contratar profissionais adicionais ou estabelecer parcerias'
      });
      riskScore += 3;
    }

    // Analyze financial risk
    const profitMargin = serviceDeskData.budget.totalPrice > 0 
      ? ((serviceDeskData.budget.totalPrice - serviceDeskData.budget.totalCosts) / serviceDeskData.budget.totalPrice) * 100 
      : 0;
    
    if (profitMargin < 10) {
      riskFactors.push({
        factor: 'Margem de lucro abaixo do recomendado',
        impact: 'high' as const,
        probability: 0.9,
        mitigation: 'Revisar estrutura de custos e estratégia de precificação'
      });
      riskScore += 3;
    }

    // Analyze schedule coverage risk
    if (serviceDeskData.schedules.length === 0) {
      riskFactors.push({
        factor: 'Escalas de trabalho não definidas',
        impact: 'medium' as const,
        probability: 0.7,
        mitigation: 'Definir escalas detalhadas com cobertura 24x7'
      });
      riskScore += 2;
    }

    const overallRisk: 'low' | 'medium' | 'high' = 
      riskScore <= 2 ? 'low' : riskScore <= 5 ? 'medium' : 'high';

    return {
      overallRisk,
      riskScore: Math.min(riskScore, 10),
      riskFactors,
      recommendations: [
        'Implementar monitoramento contínuo de KPIs',
        'Estabelecer planos de contingência para cenários críticos',
        'Revisar e atualizar avaliação de riscos mensalmente'
      ]
    };
  }

  private createRecommendationSections(recommendations: Recommendation[]): RecommendationSection[] {
    return recommendations.map(rec => ({
      type: rec.type,
      title: rec.title,
      description: rec.description,
      impact: rec.impact,
      priority: rec.priority,
      effort: rec.effort,
      timeline: this.getTimelineFromEffort(rec.effort)
    }));
  }

  private createBenchmarkAnalysisSection(benchmarks: MarketBenchmark[]): BenchmarkAnalysisSection {
    const metrics = benchmarks.map(benchmark => ({
      metric: benchmark.metric,
      ourValue: benchmark.ourValue,
      marketAverage: benchmark.marketAverage,
      marketBest: benchmark.marketBest,
      position: benchmark.position,
      analysis: this.generateBenchmarkAnalysis(benchmark)
    }));

    // Calculate overall position
    const positionScores: Record<string, number> = { below: 1, average: 2, above: 3, best: 4 };
    const avgScore = metrics.reduce((sum, metric) => sum + (positionScores[metric.position] || 2), 0) / metrics.length;
    const overallPosition: 'below' | 'average' | 'above' | 'best' = 
      avgScore <= 1.5 ? 'below' : avgScore <= 2.5 ? 'average' : avgScore <= 3.5 ? 'above' : 'best';

    return {
      metrics,
      overallPosition,
      keyInsights: this.generateKeyInsights(metrics)
    };
  }

  private createApprovalWorkflowSection(approvals: ApprovalStatus[]): ApprovalWorkflowSection {
    const approvedLevels = approvals.filter(a => a.status === 'approved').length;
    const pendingLevels = approvals.filter(a => a.status === 'pending').length;
    const rejectedLevels = approvals.filter(a => a.status === 'rejected').length;

    let overallStatus: 'pending' | 'approved' | 'rejected' | 'conditional' = 'pending';
    
    if (rejectedLevels > 0) {
      overallStatus = 'rejected';
    } else if (approvedLevels === approvals.length) {
      overallStatus = 'approved';
    } else if (approvals.some(a => a.status === 'conditional')) {
      overallStatus = 'conditional';
    }

    return {
      totalLevels: approvals.length,
      approvedLevels,
      pendingLevels,
      rejectedLevels,
      approvals: approvals.map(approval => ({
        level: approval.level,
        approver: approval.approver,
        status: approval.status,
        date: approval.date,
        comments: approval.comments,
        conditions: approval.conditions
      })),
      overallStatus
    };
  }

  // Utility methods
  private calculateMemberMonthlyCost(member: TeamMember): number {
    const benefitsTotal = Object.values(member.benefits)
      .reduce((sum, value) => sum + (typeof value === 'number' ? value : 0), 0);
    return member.salary + benefitsTotal;
  }

  private calculateShiftMonthlyHours(shift: any): number {
    const dailyHours = this.calculateShiftDailyHours(shift);
    const daysPerMonth = shift.daysOfWeek.length * 4.33; // Average weeks per month
    return dailyHours * daysPerMonth;
  }

  private calculateShiftDailyHours(shift: any): number {
    const startHour = parseInt(shift.startTime.split(':')[0]);
    const endHour = parseInt(shift.endTime.split(':')[0]);
    return endHour > startHour ? endHour - startHour : (24 - startHour) + endHour;
  }

  private calculateShiftMonthlyCost(shift: any, schedule: WorkSchedule): number {
    const monthlyHours = this.calculateShiftMonthlyHours(shift);
    const baseCostPerHour = 50; // Default cost per hour
    const multiplier = shift.isSpecialShift ? shift.multiplier : 1;
    return monthlyHours * baseCostPerHour * multiplier;
  }

  private determineServiceLevel(serviceDeskData: ServiceDeskData): any {
    switch (serviceDeskData.project.serviceType) {
      case 'basic': return 'Básico';
      case 'premium': return 'Premium';
      case 'enterprise': return 'Empresarial';
      default: return 'Padrão';
    }
  }

  private createServiceItems(serviceDeskData: ServiceDeskData): any[] {
    return [{
      serviceName: 'Service Desk Completo',
      serviceLevel: this.determineServiceLevel(serviceDeskData),
      userCount: serviceDeskData.team.length,
      costPerUser: serviceDeskData.team.length > 0 
        ? serviceDeskData.budget.totalPrice / serviceDeskData.team.length 
        : 0,
      includedHours: 160,
      monthlyTickets: serviceDeskData.team.length * 50,
      monthlyCost: serviceDeskData.budget.totalPrice / serviceDeskData.project.contractPeriod.durationMonths
    }];
  }

  private createSLAConfiguration(): any[] {
    return [
      {
        name: 'Incidentes Críticos',
        priority: 'Crítica',
        category: 'Hardware',
        responseTime: 15,
        resolutionTime: 4,
        businessHoursOnly: false
      }
    ];
  }

  private createCompanyInfo(branding: BrandingConfig): CompanyInfo {
    return {
      name: 'Service Desk Solutions',
      logo: branding.companyLogo || '',
      address: 'Endereço da Empresa',
      phone: '(11) 9999-9999',
      email: 'contato@servicedesk.com',
      website: 'www.servicedesk.com'
    };
  }

  private getDefaultTemplateConfig(): PDFTemplateConfig {
    return {
      templateType: 'standard',
      includeExecutiveSummary: true,
      includeKPIs: true,
      includeTeamAnalysis: true,
      includeScheduleAnalysis: true,
      includeFinancialBreakdown: true,
      includeRiskAssessment: true,
      includeRecommendations: true,
      includeBenchmarks: true,
      includeApprovalWorkflow: true,
      language: 'pt',
      branding: {}
    };
  }

  private getDefaultMappingConfig(): DataMappingConfig {
    return {
      teamMemberToEquipment: true,
      scheduleToService: false,
      costsToLineItems: true,
      preserveOriginalStructure: true,
      enhanceWithCalculations: true
    };
  }

  // Empty section creators for optional sections
  private createEmptyTeamComposition(): TeamCompositionSection {
    return {
      totalMembers: 0,
      roles: [],
      totalMonthlyCost: 0,
      totalAnnualCost: 0,
      costPerHour: 0
    };
  }

  private createEmptyScheduleAnalysis(): ScheduleAnalysisSection {
    return {
      totalSchedules: 0,
      coveragePercentage: 0,
      shifts: [],
      specialRates: [],
      gaps: []
    };
  }

  private createEmptyFinancialBreakdown(): FinancialBreakdownSection {
    return {
      teamCosts: { salaries: 0, benefits: 0, total: 0 },
      otherCosts: { infrastructure: 0, licenses: 0, training: 0, other: 0, total: 0 },
      taxes: { federal: 0, state: 0, municipal: 0, total: 0, effectiveRate: 0 },
      margins: { grossMargin: 0, netMargin: 0, targetMargin: 0 },
      totals: { totalCosts: 0, totalPrice: 0, profit: 0, profitMargin: 0 }
    };
  }

  private createEmptyRiskAssessment(): RiskAssessmentSection {
    return {
      overallRisk: 'low',
      riskScore: 0,
      riskFactors: [],
      recommendations: []
    };
  }

  private createEmptyBenchmarkAnalysis(): BenchmarkAnalysisSection {
    return {
      metrics: [],
      overallPosition: 'average',
      keyInsights: []
    };
  }

  private createEmptyApprovalWorkflow(): ApprovalWorkflowSection {
    return {
      totalLevels: 0,
      approvedLevels: 0,
      pendingLevels: 0,
      rejectedLevels: 0,
      approvals: [],
      overallStatus: 'pending'
    };
  }

  // Analysis summary creators for detailed PDF
  private createTeamAnalysisSummary(team: TeamMember[]): any {
    return {
      totalMembers: team.length,
      averageSalary: team.reduce((sum, member) => sum + member.salary, 0) / team.length,
      totalMonthlyCost: team.reduce((sum, member) => sum + this.calculateMemberMonthlyCost(member), 0),
      skillsDistribution: this.analyzeSkillsDistribution(team)
    };
  }

  private createScheduleAnalysisSummary(schedules: WorkSchedule[]): any {
    return {
      totalSchedules: schedules.length,
      totalShifts: schedules.reduce((sum, schedule) => sum + schedule.shifts.length, 0),
      coverageHours: this.calculateTotalCoverageHours(schedules)
    };
  }

  private createFinancialAnalysisSummary(budget: ConsolidatedBudget): any {
    return {
      totalCosts: budget.totalCosts,
      totalPrice: budget.totalPrice,
      profitMargin: budget.totalPrice > 0 ? ((budget.totalPrice - budget.totalCosts) / budget.totalPrice) * 100 : 0,
      costBreakdown: {
        team: budget.teamCosts.total,
        infrastructure: budget.infrastructureCosts,
        other: budget.otherCosts,
        taxes: budget.taxes.total
      }
    };
  }

  private createRiskAnalysisSummary(analysis: ProfitabilityAnalysis): any {
    return {
      overallRisk: analysis.riskAnalysis.overallRisk,
      riskFactors: analysis.riskAnalysis.riskFactors.length,
      roi: analysis.roi.roi,
      paybackPeriod: analysis.payback.simplePayback
    };
  }

  // Helper analysis methods
  private analyzeSkillsDistribution(team: TeamMember[]): Record<string, number> {
    const skillCounts: Record<string, number> = {};
    team.forEach(member => {
      member.skills.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });
    return skillCounts;
  }

  private calculateTotalCoverageHours(schedules: WorkSchedule[]): number {
    return schedules.reduce((total, schedule) => {
      return total + schedule.shifts.reduce((shiftTotal, shift) => {
        return shiftTotal + this.calculateShiftMonthlyHours(shift);
      }, 0);
    }, 0);
  }

  private getTimelineFromEffort(effort: 'low' | 'medium' | 'high'): string {
    const timelines = {
      low: '1-2 semanas',
      medium: '1-2 meses',
      high: '3-6 meses'
    };
    return timelines[effort];
  }

  private generateBenchmarkAnalysis(benchmark: MarketBenchmark): string {
    const position = benchmark.position;
    const metric = benchmark.metric;
    
    if (position === 'best') {
      return `Excelente performance em ${metric}, superando as melhores práticas do mercado.`;
    } else if (position === 'above') {
      return `Performance acima da média em ${metric}, posicionamento competitivo forte.`;
    } else if (position === 'average') {
      return `Performance na média do mercado em ${metric}, há oportunidades de melhoria.`;
    } else {
      return `Performance abaixo da média em ${metric}, requer atenção imediata.`;
    }
  }

  private generateKeyInsights(metrics: any[]): string[] {
    const insights = [];
    
    const bestMetrics = metrics.filter(m => m.position === 'best');
    const belowMetrics = metrics.filter(m => m.position === 'below');
    
    if (bestMetrics.length > 0) {
      insights.push(`Excelência em ${bestMetrics.length} métrica(s): ${bestMetrics.map(m => m.metric).join(', ')}`);
    }
    
    if (belowMetrics.length > 0) {
      insights.push(`Oportunidades de melhoria em ${belowMetrics.length} métrica(s): ${belowMetrics.map(m => m.metric).join(', ')}`);
    }
    
    return insights;
  }
}

/**
 * Utility function to generate enhanced PDF with service desk data
 */
export async function generateEnhancedServiceDeskPDF(
  serviceDeskData: ServiceDeskData,
  executiveDashboard?: ExecutiveDashboard,
  templateConfig: Partial<PDFTemplateConfig> = {},
  mappingConfig: Partial<DataMappingConfig> = {}
): Promise<PDFGenerationResult> {
  const bridge = new PDFIntegrationBridge();
  return await bridge.generateEnhancedPDF(serviceDeskData, executiveDashboard, templateConfig, mappingConfig);
}