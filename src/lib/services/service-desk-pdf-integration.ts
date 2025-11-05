/**
 * Integration bridge between Service Desk Pricing System and PDF Generation
 * Maps service desk data to PDF-compatible formats and generates enhanced proposals
 */

import { 
  ServiceDeskData, 
  ExecutiveDashboard,
  KPI,
  Recommendation,
  MarketBenchmark,
  ApprovalStatus
} from '@/lib/types/service-desk-pricing';
import { ServiceDeskServiceLevel } from '@/lib/types/service-desk';
import { 
  ProposalData, 
  ClientData, 
  CompanyInfo,
  PDFGenerationResult 
} from '@/lib/types/pdf/core';
import { PDFGenerator } from '@/components/pdf-generation/generators/PDFGenerator';
import { ServiceDeskPDFGenerator } from '@/lib/pdf/generators/ServiceDeskPDFGenerator';

export interface ServiceDeskPDFOptions {
  includeExecutiveSummary?: boolean;
  includeKPIs?: boolean;
  includeRecommendations?: boolean;
  includeBenchmarks?: boolean;
  includeApprovals?: boolean;
  templateType?: 'standard' | 'executive' | 'detailed';
  language?: 'pt' | 'en';
}

export interface EnhancedProposalData extends ProposalData {
  // Service desk specific data
  serviceDeskData: ServiceDeskData;
  executiveDashboard?: ExecutiveDashboard;
  
  // Enhanced sections
  teamComposition: TeamCompositionSection;
  scheduleAnalysis: ScheduleAnalysisSection;
  financialBreakdown: FinancialBreakdownSection;
  riskAssessment: RiskAssessmentSection;
  recommendations: RecommendationSection[];
  benchmarkAnalysis: BenchmarkAnalysisSection;
  approvalWorkflow: ApprovalWorkflowSection;
}

export interface TeamCompositionSection {
  totalMembers: number;
  roles: Array<{
    role: string;
    count: number;
    avgSalary: number;
    totalCost: number;
  }>;
  totalMonthlyCost: number;
  totalAnnualCost: number;
  costPerHour: number;
}

export interface ScheduleAnalysisSection {
  totalSchedules: number;
  coveragePercentage: number;
  shifts: Array<{
    name: string;
    hours: string;
    daysOfWeek: string[];
    teamMembers: number;
  }>;
  specialRates: Array<{
    name: string;
    multiplier: number;
    applicableShifts: string[];
  }>;
  gaps: Array<{
    timeRange: string;
    severity: string;
    suggestion: string;
  }>;
}

export interface FinancialBreakdownSection {
  teamCosts: {
    salaries: number;
    benefits: number;
    total: number;
  };
  otherCosts: {
    infrastructure: number;
    licenses: number;
    training: number;
    other: number;
    total: number;
  };
  taxes: {
    federal: number;
    state: number;
    municipal: number;
    total: number;
    effectiveRate: number;
  };
  margins: {
    grossMargin: number;
    netMargin: number;
    targetMargin: number;
  };
  totals: {
    totalCosts: number;
    totalPrice: number;
    profit: number;
    profitMargin: number;
  };
}

export interface RiskAssessmentSection {
  overallRisk: 'low' | 'medium' | 'high';
  riskScore: number;
  riskFactors: Array<{
    factor: string;
    impact: 'low' | 'medium' | 'high';
    probability: number;
    mitigation: string;
  }>;
  recommendations: string[];
}

export interface RecommendationSection {
  type: 'cost_optimization' | 'pricing_adjustment' | 'risk_mitigation' | 'scope_change';
  title: string;
  description: string;
  impact: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  timeline: string;
}

export interface BenchmarkAnalysisSection {
  metrics: Array<{
    metric: string;
    ourValue: number;
    marketAverage: number;
    marketBest: number;
    position: 'below' | 'average' | 'above' | 'best';
    analysis: string;
  }>;
  overallPosition: 'below' | 'average' | 'above' | 'best';
  keyInsights: string[];
}

export interface ApprovalWorkflowSection {
  totalLevels: number;
  approvedLevels: number;
  pendingLevels: number;
  rejectedLevels: number;
  approvals: Array<{
    level: string;
    approver: string;
    status: 'pending' | 'approved' | 'rejected' | 'conditional';
    date?: Date;
    comments?: string;
    conditions?: string[];
  }>;
  overallStatus: 'pending' | 'approved' | 'rejected' | 'conditional';
}

/**
 * Service Desk PDF Integration Service
 */
export class ServiceDeskPDFIntegration {
  private pdfGenerator: PDFGenerator;
  private serviceDeskPDFGenerator: ServiceDeskPDFGenerator;

  constructor() {
    this.pdfGenerator = new PDFGenerator();
    this.serviceDeskPDFGenerator = new ServiceDeskPDFGenerator();
  }

  /**
   * Maps Service Desk data to PDF-compatible proposal data
   */
  mapServiceDeskDataToProposal(
    serviceDeskData: ServiceDeskData,
    executiveDashboard?: ExecutiveDashboard,
    options: ServiceDeskPDFOptions = {}
  ): EnhancedProposalData {
    
    // Map basic proposal data
    const baseProposalData: ProposalData = {
      equipments: this.mapTeamToEquipments(serviceDeskData.team),
      totalMonthly: serviceDeskData.budget.totalPrice / serviceDeskData.project.contractPeriod.durationMonths,
      totalAnnual: serviceDeskData.budget.totalPrice,
      contractPeriod: serviceDeskData.project.contractPeriod.durationMonths,
      generatedAt: new Date()
    };

    // Create enhanced proposal data
    const enhancedProposal: EnhancedProposalData = {
      ...baseProposalData,
      serviceDeskData,
      executiveDashboard,
      teamComposition: this.createTeamCompositionSection(serviceDeskData),
      scheduleAnalysis: this.createScheduleAnalysisSection(serviceDeskData),
      financialBreakdown: this.createFinancialBreakdownSection(serviceDeskData),
      riskAssessment: this.createRiskAssessmentSection(serviceDeskData, executiveDashboard),
      recommendations: this.createRecommendationSections(executiveDashboard?.recommendations || []),
      benchmarkAnalysis: this.createBenchmarkAnalysisSection(executiveDashboard?.benchmarks || []),
      approvalWorkflow: this.createApprovalWorkflowSection(executiveDashboard?.approvals || [])
    };

    return enhancedProposal;
  }

  /**
   * Maps Service Desk data to client data
   */
  mapServiceDeskDataToClient(serviceDeskData: ServiceDeskData): ClientData {
    return {
      companyName: serviceDeskData.project.client.name,
      contactName: serviceDeskData.project.client.contactPerson,
      email: serviceDeskData.project.client.email,
      phone: serviceDeskData.project.client.phone,
      projectName: serviceDeskData.project.name,
      managerName: serviceDeskData.project.client.contactPerson,
      managerEmail: serviceDeskData.project.client.email,
      managerPhone: serviceDeskData.project.client.phone
    };
  }

  /**
   * Generates enhanced PDF proposal with service desk data
   */
  async generateEnhancedProposal(
    serviceDeskData: ServiceDeskData,
    executiveDashboard?: ExecutiveDashboard,
    options: ServiceDeskPDFOptions = {}
  ): Promise<PDFGenerationResult> {
    
    try {
      // Map data to PDF format
      const proposalData = this.mapServiceDeskDataToProposal(serviceDeskData, executiveDashboard, options);
      const clientData = this.mapServiceDeskDataToClient(serviceDeskData);

      // Set company info if available
      const companyInfo: CompanyInfo = {
        name: 'Service Desk Solutions',
        logo: '',
        address: 'Endereço da Empresa',
        phone: '(11) 9999-9999',
        email: 'contato@servicedesk.com',
        website: 'www.servicedesk.com'
      };

      this.pdfGenerator.setCompanyInfo(companyInfo);

      // Generate PDF based on template type
      let result: { blob: Blob; url: string };
      
      if (options.templateType === 'executive' && executiveDashboard) {
        result = await this.generateExecutivePDF(proposalData, clientData, executiveDashboard);
      } else if (options.templateType === 'detailed') {
        result = await this.generateDetailedPDF(proposalData, clientData);
      } else {
        result = await this.pdfGenerator.generatePDF(proposalData, clientData);
      }

      return {
        blob: result.blob,
        url: result.url,
        size: result.blob.size,
        generatedAt: new Date()
      };

    } catch (error) {
      console.error('Error generating enhanced proposal:', error);
      throw new Error(`Falha na geração da proposta: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Generates executive-level PDF with dashboard data
   */
  private async generateExecutivePDF(
    proposalData: EnhancedProposalData,
    clientData: ClientData,
    executiveDashboard: ExecutiveDashboard
  ): Promise<{ blob: Blob; url: string }> {
    
    // Create a service desk proposal object for the specialized generator
    const serviceDeskProposal = {
      id: `proposal-${Date.now()}`,
      clientData: {
        companyName: clientData.companyName,
        contactName: clientData.contactName,
        email: clientData.email,
        phone: clientData.phone,
        projectName: clientData.projectName,
        managerName: clientData.managerName || clientData.contactName,
        managerEmail: clientData.managerEmail || clientData.email,
        managerPhone: clientData.managerPhone || clientData.phone,
        employeeCount: proposalData.serviceDeskData.team.length,
        businessHours: {
          start: '08:00',
          end: '18:00',
          timezone: 'America/Sao_Paulo'
        },
        criticalSystems: []
      },
      serviceLevel: this.determineServiceLevel(proposalData.serviceDeskData),
      serviceItems: this.createServiceItems(proposalData.serviceDeskData),
      totals: {
        totalUsers: proposalData.serviceDeskData.team.length,
        totalSetupCost: proposalData.financialBreakdown.otherCosts.total,
        monthlyCost: proposalData.totalMonthly,
        annualCost: proposalData.totalAnnual,
        totalIncludedHours: proposalData.serviceDeskData.team.length * 160,
        estimatedAdditionalHours: 0,
        additionalHoursCost: 0
      },
      contractType: 'Mensal' as any,
      slaConfiguration: this.createSLAConfiguration(proposalData.serviceDeskData),
      status: 'Rascunho' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      version: 1,
      serviceDeskData: proposalData.serviceDeskData,
      executiveDashboard,
      enhancedSections: {
        teamComposition: proposalData.teamComposition,
        scheduleAnalysis: proposalData.scheduleAnalysis,
        financialBreakdown: proposalData.financialBreakdown,
        riskAssessment: proposalData.riskAssessment,
        recommendations: proposalData.recommendations,
        benchmarkAnalysis: proposalData.benchmarkAnalysis,
        approvalWorkflow: proposalData.approvalWorkflow
      }
    };

    return await this.serviceDeskPDFGenerator.generateProposalPDF(serviceDeskProposal);
  }

  /**
   * Generates detailed PDF with comprehensive analysis
   */
  private async generateDetailedPDF(
    proposalData: EnhancedProposalData,
    clientData: ClientData
  ): Promise<{ blob: Blob; url: string }> {
    
    // Use the standard PDF generator but with enhanced data
    return await this.pdfGenerator.generatePDF(proposalData, clientData);
  }

  /**
   * Maps team members to equipment items for PDF compatibility
   */
  private mapTeamToEquipments(team: any[]): any[] {
    return team.map((member, index) => ({
      id: member.id || `member-${index}`,
      model: member.role,
      brand: 'Recurso Humano',
      type: 'Profissional',
      monthlyVolume: member.workload || 160, // hours per month
      monthlyCost: member.salary + (member.benefits ? Object.values(member.benefits).reduce((sum: number, val: any) => sum + (typeof val === 'number' ? val : 0), 0) : 0),
      specifications: {
        name: member.name,
        skills: member.skills || [],
        certifications: member.certifications || [],
        startDate: member.startDate,
        endDate: member.endDate
      }
    }));
  }

  /**
   * Creates team composition section
   */
  private createTeamCompositionSection(serviceDeskData: ServiceDeskData): TeamCompositionSection {
    const roleGroups = serviceDeskData.team.reduce((groups, member) => {
      const role = member.role;
      if (!groups[role]) {
        groups[role] = [];
      }
      groups[role].push(member);
      return groups;
    }, {} as Record<string, any[]>);

    const roles = Object.entries(roleGroups).map(([role, members]) => {
      const avgSalary = members.reduce((sum, member) => sum + member.salary, 0) / members.length;
      const totalCost = members.reduce((sum, member) => sum + member.salary, 0);
      
      return {
        role,
        count: members.length,
        avgSalary,
        totalCost
      };
    });

    const totalMonthlyCost = serviceDeskData.budget.teamCosts.total;
    const totalAnnualCost = totalMonthlyCost * 12;
    const totalHours = serviceDeskData.team.reduce((sum, member) => sum + member.workload, 0) * 4.33; // weeks to month
    const costPerHour = totalHours > 0 ? totalMonthlyCost / totalHours : 0;

    return {
      totalMembers: serviceDeskData.team.length,
      roles,
      totalMonthlyCost,
      totalAnnualCost,
      costPerHour
    };
  }

  /**
   * Creates schedule analysis section
   */
  private createScheduleAnalysisSection(serviceDeskData: ServiceDeskData): ScheduleAnalysisSection {
    const schedules = serviceDeskData.schedules || [];
    
    // Calculate coverage (simplified)
    const totalPossibleHours = 168; // 24h * 7 days
    let coveredHours = 0;
    
    schedules.forEach(schedule => {
      schedule.shifts.forEach(shift => {
        const startHour = parseInt(shift.startTime.split(':')[0]);
        const endHour = parseInt(shift.endTime.split(':')[0]);
        const shiftHours = endHour > startHour ? endHour - startHour : (24 - startHour) + endHour;
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

    const gaps: Array<{
      timeRange: string;
      severity: string;
      suggestion: string;
    }> = []; // Simplified - would need coverage analysis

    return {
      totalSchedules: schedules.length,
      coveragePercentage,
      shifts,
      specialRates,
      gaps
    };
  }

  /**
   * Creates financial breakdown section
   */
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
        licenses: serviceDeskData.otherCosts.filter(cost => cost.category === 'LICENSES' as any).reduce((sum, cost) => sum + cost.value, 0),
        training: serviceDeskData.otherCosts.filter(cost => cost.category === 'TRAINING' as any).reduce((sum, cost) => sum + cost.value, 0),
        other: serviceDeskData.otherCosts.filter(cost => !['LICENSES', 'TRAINING', 'INFRASTRUCTURE'].includes(cost.category as string)).reduce((sum, cost) => sum + cost.value, 0),
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

  /**
   * Creates risk assessment section
   */
  private createRiskAssessmentSection(
    serviceDeskData: ServiceDeskData, 
    executiveDashboard?: ExecutiveDashboard
  ): RiskAssessmentSection {
    
    const riskFactors = [];
    let riskScore = 0;

    // Team size risk
    if (serviceDeskData.team.length < 3) {
      riskFactors.push({
        factor: 'Equipe muito pequena',
        impact: 'high' as const,
        probability: 0.8,
        mitigation: 'Contratar mais profissionais ou terceirizar parte dos serviços'
      });
      riskScore += 3;
    }

    // Financial risk
    const profitMargin = serviceDeskData.budget.totalPrice > 0 
      ? ((serviceDeskData.budget.totalPrice - serviceDeskData.budget.totalCosts) / serviceDeskData.budget.totalPrice) * 100 
      : 0;
    
    if (profitMargin < 10) {
      riskFactors.push({
        factor: 'Margem de lucro muito baixa',
        impact: 'high' as const,
        probability: 0.9,
        mitigation: 'Revisar custos ou aumentar preços'
      });
      riskScore += 3;
    }

    // Schedule risk
    if (serviceDeskData.schedules.length === 0) {
      riskFactors.push({
        factor: 'Escalas não definidas',
        impact: 'medium' as const,
        probability: 0.7,
        mitigation: 'Definir escalas de trabalho detalhadas'
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
        'Monitorar indicadores de performance regularmente',
        'Manter plano de contingência atualizado',
        'Revisar riscos mensalmente'
      ]
    };
  }

  /**
   * Creates recommendation sections
   */
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

  /**
   * Creates benchmark analysis section
   */
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

    const keyInsights = this.generateKeyInsights(metrics);

    return {
      metrics,
      overallPosition,
      keyInsights
    };
  }

  /**
   * Creates approval workflow section
   */
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

  // Helper methods
  private determineServiceLevel(serviceDeskData: ServiceDeskData): ServiceDeskServiceLevel {
    const serviceType = serviceDeskData.project.serviceType;
    switch (serviceType) {
      case 'basic':
        return ServiceDeskServiceLevel.BASIC;
      case 'premium':
        return ServiceDeskServiceLevel.PREMIUM;
      case 'enterprise':
        return ServiceDeskServiceLevel.ENTERPRISE;
      default:
        return ServiceDeskServiceLevel.STANDARD;
    }
  }

  private createServiceItems(serviceDeskData: ServiceDeskData): any[] {
    return [{
      serviceName: 'Service Desk Completo',
      serviceLevel: this.determineServiceLevel(serviceDeskData),
      userCount: serviceDeskData.team.length,
      costPerUser: serviceDeskData.team.length > 0 ? serviceDeskData.budget.totalPrice / serviceDeskData.team.length : 0,
      includedHours: 160, // Standard hours per month
      monthlyTickets: serviceDeskData.team.length * 50, // Estimated tickets per user
      monthlyCost: serviceDeskData.budget.totalPrice / serviceDeskData.project.contractPeriod.durationMonths
    }];
  }

  private createSLAConfiguration(serviceDeskData: ServiceDeskData): any[] {
    return [
      {
        name: 'Incidentes Críticos',
        priority: 'Critical',
        category: 'Incident',
        responseTime: 15,
        resolutionTime: 4,
        businessHoursOnly: false
      },
      {
        name: 'Incidentes Altos',
        priority: 'High',
        category: 'Incident',
        responseTime: 30,
        resolutionTime: 8,
        businessHoursOnly: false
      },
      {
        name: 'Solicitações de Serviço',
        priority: 'Medium',
        category: 'Service Request',
        responseTime: 60,
        resolutionTime: 24,
        businessHoursOnly: true
      }
    ];
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
    
    const avgPosition = metrics.reduce((sum, m) => {
      const scores: Record<string, number> = { below: 1, average: 2, above: 3, best: 4 };
      return sum + (scores[m.position] || 2);
    }, 0) / metrics.length;
    
    if (avgPosition >= 3) {
      insights.push('Posicionamento geral competitivo no mercado');
    } else if (avgPosition >= 2.5) {
      insights.push('Posicionamento adequado com potencial de crescimento');
    } else {
      insights.push('Necessário investimento para melhorar posicionamento competitivo');
    }
    
    return insights;
  }
}

/**
 * Utility function to generate enhanced service desk proposal PDF
 */
export async function generateServiceDeskProposalPDF(
  serviceDeskData: ServiceDeskData,
  executiveDashboard?: ExecutiveDashboard,
  options: ServiceDeskPDFOptions = {}
): Promise<PDFGenerationResult> {
  const integration = new ServiceDeskPDFIntegration();
  return await integration.generateEnhancedProposal(serviceDeskData, executiveDashboard, options);
}