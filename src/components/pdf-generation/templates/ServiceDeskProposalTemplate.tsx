/**
 * Enhanced Service Desk Proposal Template
 * Generates comprehensive PDF proposals with executive dashboard data
 */

import { jsPDF } from 'jspdf';
import { 
  EnhancedProposalData,
  TeamCompositionSection,
  ScheduleAnalysisSection,
  FinancialBreakdownSection,
  RiskAssessmentSection,
  RecommendationSection,
  BenchmarkAnalysisSection,
  ApprovalWorkflowSection
} from '@/lib/services/service-desk-pdf-integration';
import { ClientData, CompanyInfo } from '@/lib/types/pdf/core';
import { ExecutiveDashboard, KPI } from '@/lib/types/service-desk-pricing';

export class ServiceDeskProposalTemplate {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;
  private colors: {
    primary: [number, number, number];
    secondary: [number, number, number];
    accent: [number, number, number];
    text: [number, number, number];
    lightGray: [number, number, number];
    success: [number, number, number];
    warning: [number, number, number];
    danger: [number, number, number];
  };

  constructor(doc: jsPDF) {
    this.doc = doc;
    this.pageWidth = doc.internal.pageSize.getWidth();
    this.pageHeight = doc.internal.pageSize.getHeight();
    this.margin = 20;
    this.currentY = this.margin;
    
    this.colors = {
      primary: [37, 99, 235],
      secondary: [100, 116, 139],
      accent: [5, 150, 105],
      text: [31, 41, 55],
      lightGray: [248, 250, 252],
      success: [34, 197, 94],
      warning: [251, 191, 36],
      danger: [239, 68, 68]
    };
  }

  /**
   * Renders the complete enhanced proposal
   */
  render(
    proposalData: EnhancedProposalData,
    clientData: ClientData,
    companyInfo: CompanyInfo,
    executiveDashboard?: ExecutiveDashboard
  ): void {
    // Page 1: Cover and Executive Summary
    this.renderCoverPage(proposalData, clientData, companyInfo);
    
    if (executiveDashboard) {
      this.addPage();
      this.renderExecutiveSummary(executiveDashboard, proposalData);
    }

    // Page 2: Team Composition
    this.addPage();
    this.renderTeamComposition(proposalData.teamComposition);

    // Page 3: Schedule Analysis
    this.addPage();
    this.renderScheduleAnalysis(proposalData.scheduleAnalysis);

    // Page 4: Financial Breakdown
    this.addPage();
    this.renderFinancialBreakdown(proposalData.financialBreakdown);

    // Page 5: Risk Assessment
    this.addPage();
    this.renderRiskAssessment(proposalData.riskAssessment);

    // Page 6: Recommendations
    if (proposalData.recommendations.length > 0) {
      this.addPage();
      this.renderRecommendations(proposalData.recommendations);
    }

    // Page 7: Benchmark Analysis
    if (proposalData.benchmarkAnalysis.metrics.length > 0) {
      this.addPage();
      this.renderBenchmarkAnalysis(proposalData.benchmarkAnalysis);
    }

    // Page 8: Approval Workflow
    if (proposalData.approvalWorkflow.totalLevels > 0) {
      this.addPage();
      this.renderApprovalWorkflow(proposalData.approvalWorkflow);
    }

    // Final Page: Terms and Conditions
    this.addPage();
    this.renderTermsAndConditions(proposalData, clientData);
  }

  /**
   * Renders cover page
   */
  private renderCoverPage(
    proposalData: EnhancedProposalData,
    clientData: ClientData,
    companyInfo: CompanyInfo
  ): void {
    this.currentY = 40;

    // Company logo area (placeholder)
    this.doc.setDrawColor(...this.colors.lightGray);
    this.doc.rect(this.margin, this.currentY, 60, 30);
    this.doc.setFontSize(10);
    this.doc.setTextColor(...this.colors.secondary);
    this.doc.text('LOGO', this.margin + 30, this.currentY + 18, { align: 'center' });

    // Title
    this.currentY += 50;
    this.doc.setFontSize(28);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.colors.primary);
    this.doc.text('PROPOSTA DE SERVICE DESK', this.pageWidth / 2, this.currentY, { align: 'center' });

    this.currentY += 15;
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...this.colors.text);
    this.doc.text(clientData.projectName, this.pageWidth / 2, this.currentY, { align: 'center' });

    // Client information box
    this.currentY += 40;
    this.renderInfoBox('INFORMAÇÕES DO CLIENTE', [
      `Empresa: ${clientData.companyName}`,
      `Contato: ${clientData.contactName}`,
      `Email: ${clientData.email}`,
      `Telefone: ${clientData.phone}`,
      `Projeto: ${clientData.projectName}`
    ]);

    // Project summary box
    this.currentY += 20;
    this.renderHighlightBox('RESUMO DO PROJETO', [
      `Equipe: ${proposalData.teamComposition.totalMembers} profissionais`,
      `Duração: ${proposalData.contractPeriod} meses`,
      `Investimento Total: ${this.formatCurrency(proposalData.totalAnnual)}`,
      `Investimento Mensal: ${this.formatCurrency(proposalData.totalMonthly)}`,
      `Cobertura: ${proposalData.scheduleAnalysis.coveragePercentage.toFixed(1)}%`
    ]);

    // Footer
    this.renderFooter(companyInfo);
  }

  /**
   * Renders executive summary with KPIs
   */
  private renderExecutiveSummary(
    dashboard: ExecutiveDashboard,
    proposalData: EnhancedProposalData
  ): void {
    this.currentY = this.margin;
    
    this.renderSectionHeader('RESUMO EXECUTIVO');

    // Executive summary text
    this.currentY += 10;
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...this.colors.text);
    
    const summaryText = `Esta proposta apresenta uma solução completa de Service Desk para ${proposalData.serviceDeskData.project.client.name}, ` +
      `com investimento total de ${this.formatCurrency(proposalData.totalAnnual)} e retorno esperado através de ` +
      `${dashboard.summary.keyHighlights.length} pontos positivos identificados na análise.`;
    
    this.doc.text(summaryText, this.margin, this.currentY, { 
      maxWidth: this.pageWidth - (this.margin * 2) 
    });

    // KPIs Grid
    this.currentY += 30;
    this.renderKPIsGrid(dashboard.kpis);

    // Key highlights and concerns
    this.currentY += 20;
    this.renderHighlightsAndConcerns(dashboard.summary);

    // Recommendation badge
    this.currentY += 20;
    this.renderRecommendationBadge(dashboard.summary.recommendedAction);
  }

  /**
   * Renders team composition section
   */
  private renderTeamComposition(teamComposition: TeamCompositionSection): void {
    this.currentY = this.margin;
    
    this.renderSectionHeader('COMPOSIÇÃO DA EQUIPE');

    // Team overview
    this.currentY += 10;
    this.renderInfoBox('VISÃO GERAL', [
      `Total de Profissionais: ${teamComposition.totalMembers}`,
      `Custo Mensal da Equipe: ${this.formatCurrency(teamComposition.totalMonthlyCost)}`,
      `Custo Anual da Equipe: ${this.formatCurrency(teamComposition.totalAnnualCost)}`,
      `Custo por Hora: ${this.formatCurrency(teamComposition.costPerHour)}`
    ]);

    // Roles breakdown
    this.currentY += 20;
    this.renderSubHeader('Distribuição por Função');
    this.currentY += 10;

    // Table header
    this.doc.setFillColor(...this.colors.primary);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), 8, 'F');
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(255, 255, 255);
    this.doc.text('Função', this.margin + 5, this.currentY + 5);
    this.doc.text('Qtd', this.margin + 80, this.currentY + 5);
    this.doc.text('Salário Médio', this.margin + 110, this.currentY + 5);
    this.doc.text('Custo Total', this.pageWidth - this.margin - 40, this.currentY + 5);

    this.currentY += 10;

    // Table rows
    teamComposition.roles.forEach((role, index) => {
      if (index % 2 === 0) {
        this.doc.setFillColor(...this.colors.lightGray);
        this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - (this.margin * 2), 8, 'F');
      }

      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(...this.colors.text);
      this.doc.text(role.role, this.margin + 5, this.currentY + 3);
      this.doc.text(role.count.toString(), this.margin + 80, this.currentY + 3);
      this.doc.text(this.formatCurrency(role.avgSalary), this.margin + 110, this.currentY + 3);
      this.doc.text(this.formatCurrency(role.totalCost), this.pageWidth - this.margin - 40, this.currentY + 3);

      this.currentY += 8;
    });
  }

  /**
   * Renders schedule analysis section
   */
  private renderScheduleAnalysis(scheduleAnalysis: ScheduleAnalysisSection): void {
    this.currentY = this.margin;
    
    this.renderSectionHeader('ANÁLISE DE ESCALAS');

    // Coverage overview
    this.currentY += 10;
    this.renderInfoBox('COBERTURA DE ATENDIMENTO', [
      `Total de Escalas: ${scheduleAnalysis.totalSchedules}`,
      `Cobertura Geral: ${scheduleAnalysis.coveragePercentage.toFixed(1)}%`,
      `Total de Turnos: ${scheduleAnalysis.shifts.length}`,
      `Taxas Especiais: ${scheduleAnalysis.specialRates.length}`
    ]);

    // Shifts table
    if (scheduleAnalysis.shifts.length > 0) {
      this.currentY += 20;
      this.renderSubHeader('Turnos de Trabalho');
      this.currentY += 10;

      // Table header
      this.doc.setFillColor(...this.colors.primary);
      this.doc.rect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), 8, 'F');
      
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(255, 255, 255);
      this.doc.text('Turno', this.margin + 5, this.currentY + 5);
      this.doc.text('Horário', this.margin + 60, this.currentY + 5);
      this.doc.text('Dias', this.margin + 110, this.currentY + 5);
      this.doc.text('Equipe', this.pageWidth - this.margin - 30, this.currentY + 5);

      this.currentY += 10;

      scheduleAnalysis.shifts.forEach((shift, index) => {
        if (index % 2 === 0) {
          this.doc.setFillColor(...this.colors.lightGray);
          this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - (this.margin * 2), 8, 'F');
        }

        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(...this.colors.text);
        this.doc.text(shift.name, this.margin + 5, this.currentY + 3);
        this.doc.text(shift.hours, this.margin + 60, this.currentY + 3);
        this.doc.text(shift.daysOfWeek.join(', '), this.margin + 110, this.currentY + 3);
        this.doc.text(shift.teamMembers.toString(), this.pageWidth - this.margin - 30, this.currentY + 3);

        this.currentY += 8;
      });
    }

    // Coverage gaps
    if (scheduleAnalysis.gaps.length > 0) {
      this.currentY += 15;
      this.renderSubHeader('Lacunas de Cobertura');
      this.currentY += 5;

      scheduleAnalysis.gaps.forEach(gap => {
        this.doc.setFontSize(9);
        this.doc.setTextColor(...this.colors.warning);
        this.doc.text(`• ${gap.timeRange} (${gap.severity}): ${gap.suggestion}`, this.margin + 5, this.currentY);
        this.currentY += 6;
      });
    }
  }

  /**
   * Renders financial breakdown section
   */
  private renderFinancialBreakdown(financialBreakdown: FinancialBreakdownSection): void {
    this.currentY = this.margin;
    
    this.renderSectionHeader('ANÁLISE FINANCEIRA DETALHADA');

    // Cost breakdown chart (simplified as table)
    this.currentY += 10;
    this.renderSubHeader('Composição de Custos');
    this.currentY += 10;

    const costItems = [
      ['Custos da Equipe', ''],
      ['  - Salários', this.formatCurrency(financialBreakdown.teamCosts.salaries)],
      ['  - Benefícios', this.formatCurrency(financialBreakdown.teamCosts.benefits)],
      ['  - Subtotal Equipe', this.formatCurrency(financialBreakdown.teamCosts.total)],
      ['', ''],
      ['Outros Custos', ''],
      ['  - Infraestrutura', this.formatCurrency(financialBreakdown.otherCosts.infrastructure)],
      ['  - Licenças', this.formatCurrency(financialBreakdown.otherCosts.licenses)],
      ['  - Treinamentos', this.formatCurrency(financialBreakdown.otherCosts.training)],
      ['  - Outros', this.formatCurrency(financialBreakdown.otherCosts.other)],
      ['  - Subtotal Outros', this.formatCurrency(financialBreakdown.otherCosts.total)],
      ['', ''],
      ['Impostos', ''],
      ['  - Federais', this.formatCurrency(financialBreakdown.taxes.federal)],
      ['  - Estaduais', this.formatCurrency(financialBreakdown.taxes.state)],
      ['  - Municipais', this.formatCurrency(financialBreakdown.taxes.municipal)],
      ['  - Subtotal Impostos', this.formatCurrency(financialBreakdown.taxes.total)],
      ['', ''],
      ['TOTAL GERAL', this.formatCurrency(financialBreakdown.totals.totalCosts)]
    ];

    costItems.forEach(([item, value], index) => {
      if (item === '' && value === '') {
        this.currentY += 3;
        return;
      }

      const isTotal = item.includes('TOTAL') || item.includes('Subtotal');
      const isSubItem = item.startsWith('  -');

      if (isTotal) {
        this.doc.setFont('helvetica', 'bold');
        this.doc.setFillColor(...this.colors.lightGray);
        this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - (this.margin * 2), 8, 'F');
      } else {
        this.doc.setFont('helvetica', 'normal');
      }

      this.doc.setFontSize(9);
      this.doc.setTextColor(...this.colors.text);
      this.doc.text(item, this.margin + (isSubItem ? 10 : 5), this.currentY + 3);
      if (value) {
        this.doc.text(value, this.pageWidth - this.margin - 40, this.currentY + 3);
      }

      this.currentY += 8;
    });

    // Profitability analysis
    this.currentY += 10;
    this.renderHighlightBox('ANÁLISE DE RENTABILIDADE', [
      `Receita Total: ${this.formatCurrency(financialBreakdown.totals.totalPrice)}`,
      `Custo Total: ${this.formatCurrency(financialBreakdown.totals.totalCosts)}`,
      `Lucro Bruto: ${this.formatCurrency(financialBreakdown.totals.profit)}`,
      `Margem de Lucro: ${financialBreakdown.totals.profitMargin.toFixed(1)}%`,
      `Margem Alvo: ${financialBreakdown.margins.targetMargin.toFixed(1)}%`
    ]);
  }

  /**
   * Renders risk assessment section
   */
  private renderRiskAssessment(riskAssessment: RiskAssessmentSection): void {
    this.currentY = this.margin;
    
    this.renderSectionHeader('AVALIAÇÃO DE RISCOS');

    // Risk overview
    this.currentY += 10;
    const riskColor = riskAssessment.overallRisk === 'low' ? this.colors.success :
                     riskAssessment.overallRisk === 'medium' ? this.colors.warning : this.colors.danger;

    this.doc.setFillColor(...riskColor);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), 25, 'F');

    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(255, 255, 255);
    this.doc.text('NÍVEL DE RISCO GERAL', this.pageWidth / 2, this.currentY + 10, { align: 'center' });
    this.doc.text(riskAssessment.overallRisk.toUpperCase(), this.pageWidth / 2, this.currentY + 20, { align: 'center' });

    this.currentY += 35;

    // Risk factors
    if (riskAssessment.riskFactors.length > 0) {
      this.renderSubHeader('Fatores de Risco Identificados');
      this.currentY += 10;

      riskAssessment.riskFactors.forEach((factor, index) => {
        const impactColor = factor.impact === 'low' ? this.colors.success :
                           factor.impact === 'medium' ? this.colors.warning : this.colors.danger;

        // Risk factor box
        this.doc.setDrawColor(...impactColor);
        this.doc.setLineWidth(0.5);
        this.doc.rect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), 20);

        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(...this.colors.text);
        this.doc.text(`${index + 1}. ${factor.factor}`, this.margin + 5, this.currentY + 8);

        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(`Impacto: ${factor.impact.toUpperCase()} | Probabilidade: ${(factor.probability * 100).toFixed(0)}%`, 
                     this.margin + 5, this.currentY + 14);

        this.doc.setFontSize(8);
        this.doc.setTextColor(...this.colors.secondary);
        this.doc.text(`Mitigação: ${factor.mitigation}`, this.margin + 5, this.currentY + 18, {
          maxWidth: this.pageWidth - (this.margin * 2) - 10
        });

        this.currentY += 25;
      });
    }

    // Risk recommendations
    if (riskAssessment.recommendations.length > 0) {
      this.currentY += 10;
      this.renderSubHeader('Recomendações de Mitigação');
      this.currentY += 5;

      riskAssessment.recommendations.forEach(recommendation => {
        this.doc.setFontSize(9);
        this.doc.setTextColor(...this.colors.text);
        this.doc.text(`• ${recommendation}`, this.margin + 5, this.currentY);
        this.currentY += 6;
      });
    }
  }

  /**
   * Renders recommendations section
   */
  private renderRecommendations(recommendations: RecommendationSection[]): void {
    this.currentY = this.margin;
    
    this.renderSectionHeader('RECOMENDAÇÕES ESTRATÉGICAS');

    recommendations.forEach((recommendation, index) => {
      this.currentY += 10;

      const priorityColor = recommendation.priority === 'critical' ? this.colors.danger :
                           recommendation.priority === 'high' ? this.colors.warning :
                           recommendation.priority === 'medium' ? this.colors.accent : this.colors.secondary;

      // Recommendation box
      this.doc.setDrawColor(...priorityColor);
      this.doc.setLineWidth(1);
      this.doc.rect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), 35);

      // Priority badge
      this.doc.setFillColor(...priorityColor);
      this.doc.rect(this.margin, this.currentY, 60, 8, 'F');
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(255, 255, 255);
      this.doc.text(recommendation.priority.toUpperCase(), this.margin + 30, this.currentY + 5, { align: 'center' });

      // Title and description
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(...this.colors.text);
      this.doc.text(recommendation.title, this.margin + 5, this.currentY + 15);

      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(recommendation.description, this.margin + 5, this.currentY + 22, {
        maxWidth: this.pageWidth - (this.margin * 2) - 10
      });

      // Impact and effort
      this.doc.setFontSize(8);
      this.doc.setTextColor(...this.colors.secondary);
      this.doc.text(`Impacto: ${this.formatCurrency(recommendation.impact)} | Esforço: ${recommendation.effort.toUpperCase()} | Prazo: ${recommendation.timeline}`, 
                   this.margin + 5, this.currentY + 30);

      this.currentY += 40;

      // Check if we need a new page
      if (this.currentY > this.pageHeight - 50) {
        this.addPage();
      }
    });
  }

  /**
   * Renders benchmark analysis section
   */
  private renderBenchmarkAnalysis(benchmarkAnalysis: BenchmarkAnalysisSection): void {
    this.currentY = this.margin;
    
    this.renderSectionHeader('ANÁLISE DE BENCHMARKS');

    // Overall position
    this.currentY += 10;
    const positionColor = benchmarkAnalysis.overallPosition === 'best' ? this.colors.success :
                         benchmarkAnalysis.overallPosition === 'above' ? this.colors.accent :
                         benchmarkAnalysis.overallPosition === 'average' ? this.colors.warning : this.colors.danger;

    this.doc.setFillColor(...positionColor);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), 15, 'F');

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(255, 255, 255);
    this.doc.text(`POSIÇÃO GERAL: ${benchmarkAnalysis.overallPosition.toUpperCase()}`, 
                 this.pageWidth / 2, this.currentY + 10, { align: 'center' });

    this.currentY += 25;

    // Metrics table
    this.renderSubHeader('Comparação Detalhada');
    this.currentY += 10;

    // Table header
    this.doc.setFillColor(...this.colors.primary);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), 8, 'F');
    
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(255, 255, 255);
    this.doc.text('Métrica', this.margin + 5, this.currentY + 5);
    this.doc.text('Nosso', this.margin + 70, this.currentY + 5);
    this.doc.text('Média', this.margin + 110, this.currentY + 5);
    this.doc.text('Melhor', this.margin + 140, this.currentY + 5);
    this.doc.text('Posição', this.pageWidth - this.margin - 30, this.currentY + 5);

    this.currentY += 10;

    benchmarkAnalysis.metrics.forEach((metric, index) => {
      if (index % 2 === 0) {
        this.doc.setFillColor(...this.colors.lightGray);
        this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - (this.margin * 2), 8, 'F');
      }

      const posColor = metric.position === 'best' ? this.colors.success :
                      metric.position === 'above' ? this.colors.accent :
                      metric.position === 'average' ? this.colors.warning : this.colors.danger;

      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(...this.colors.text);
      this.doc.text(metric.metric, this.margin + 5, this.currentY + 3);
      this.doc.text(metric.ourValue.toFixed(1), this.margin + 70, this.currentY + 3);
      this.doc.text(metric.marketAverage.toFixed(1), this.margin + 110, this.currentY + 3);
      this.doc.text(metric.marketBest.toFixed(1), this.margin + 140, this.currentY + 3);
      
      this.doc.setTextColor(...posColor);
      this.doc.text(metric.position.toUpperCase(), this.pageWidth - this.margin - 30, this.currentY + 3);

      this.currentY += 8;
    });

    // Key insights
    if (benchmarkAnalysis.keyInsights.length > 0) {
      this.currentY += 15;
      this.renderSubHeader('Principais Insights');
      this.currentY += 5;

      benchmarkAnalysis.keyInsights.forEach(insight => {
        this.doc.setFontSize(9);
        this.doc.setTextColor(...this.colors.text);
        this.doc.text(`• ${insight}`, this.margin + 5, this.currentY);
        this.currentY += 6;
      });
    }
  }

  /**
   * Renders approval workflow section
   */
  private renderApprovalWorkflow(approvalWorkflow: ApprovalWorkflowSection): void {
    this.currentY = this.margin;
    
    this.renderSectionHeader('FLUXO DE APROVAÇÕES');

    // Approval status overview
    this.currentY += 10;
    this.renderInfoBox('STATUS GERAL', [
      `Total de Níveis: ${approvalWorkflow.totalLevels}`,
      `Aprovados: ${approvalWorkflow.approvedLevels}`,
      `Pendentes: ${approvalWorkflow.pendingLevels}`,
      `Rejeitados: ${approvalWorkflow.rejectedLevels}`,
      `Status Geral: ${approvalWorkflow.overallStatus.toUpperCase()}`
    ]);

    // Approval details
    this.currentY += 20;
    this.renderSubHeader('Detalhes das Aprovações');
    this.currentY += 10;

    approvalWorkflow.approvals.forEach((approval, index) => {
      const statusColor = approval.status === 'approved' ? this.colors.success :
                         approval.status === 'rejected' ? this.colors.danger :
                         approval.status === 'conditional' ? this.colors.warning : this.colors.secondary;

      // Approval box
      this.doc.setDrawColor(...statusColor);
      this.doc.setLineWidth(0.5);
      this.doc.rect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), 25);

      // Status badge
      this.doc.setFillColor(...statusColor);
      this.doc.rect(this.pageWidth - this.margin - 50, this.currentY + 2, 45, 8, 'F');
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(255, 255, 255);
      this.doc.text(approval.status.toUpperCase(), this.pageWidth - this.margin - 27, this.currentY + 7, { align: 'center' });

      // Approval details
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(...this.colors.text);
      this.doc.text(`${approval.level} - ${approval.approver}`, this.margin + 5, this.currentY + 10);

      if (approval.date) {
        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(...this.colors.secondary);
        this.doc.text(`Data: ${approval.date.toLocaleDateString('pt-BR')}`, this.margin + 5, this.currentY + 16);
      }

      if (approval.comments) {
        this.doc.setFontSize(8);
        this.doc.text(`Comentários: ${approval.comments}`, this.margin + 5, this.currentY + 21, {
          maxWidth: this.pageWidth - (this.margin * 2) - 60
        });
      }

      this.currentY += 30;
    });
  }

  /**
   * Renders terms and conditions
   */
  private renderTermsAndConditions(proposalData: EnhancedProposalData, clientData: ClientData): void {
    this.currentY = this.margin;
    
    this.renderSectionHeader('TERMOS E CONDIÇÕES');

    this.currentY += 10;
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...this.colors.text);

    const terms = [
      '1. VALIDADE DA PROPOSTA',
      'Esta proposta tem validade de 30 (trinta) dias a partir da data de emissão.',
      '',
      '2. CONDIÇÕES DE PAGAMENTO',
      'Os valores apresentados são válidos para pagamento conforme cronograma a ser acordado.',
      '',
      '3. ESCOPO DOS SERVIÇOS',
      'Os serviços incluem todas as atividades descritas nesta proposta, conforme especificações técnicas.',
      '',
      '4. INÍCIO DOS SERVIÇOS',
      'Os serviços terão início após a assinatura do contrato e cumprimento das condições precedentes.',
      '',
      '5. GARANTIAS',
      'Todos os serviços prestados possuem garantia conforme especificado no contrato de prestação de serviços.',
      '',
      '6. CONFIDENCIALIDADE',
      'Todas as informações trocadas durante a execução do projeto serão tratadas com confidencialidade.',
      '',
      '7. PROPRIEDADE INTELECTUAL',
      'Os direitos de propriedade intelectual serão definidos conforme contrato específico.',
      '',
      '8. ALTERAÇÕES',
      'Qualquer alteração no escopo deverá ser formalizada através de aditivo contratual.'
    ];

    terms.forEach(term => {
      if (term === '') {
        this.currentY += 5;
        return;
      }

      if (term.match(/^\d+\./)) {
        this.doc.setFont('helvetica', 'bold');
        this.currentY += 8;
      } else {
        this.doc.setFont('helvetica', 'normal');
      }

      this.doc.text(term, this.margin, this.currentY, {
        maxWidth: this.pageWidth - (this.margin * 2)
      });
      this.currentY += 6;
    });

    // Signature area
    this.currentY += 20;
    this.doc.setDrawColor(...this.colors.secondary);
    this.doc.line(this.margin, this.currentY, this.margin + 80, this.currentY);
    this.doc.line(this.pageWidth - this.margin - 80, this.currentY, this.pageWidth - this.margin, this.currentY);

    this.currentY += 8;
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Fornecedor', this.margin + 40, this.currentY, { align: 'center' });
    this.doc.text('Cliente', this.pageWidth - this.margin - 40, this.currentY, { align: 'center' });
  }

  // Helper methods
  private addPage(): void {
    this.doc.addPage();
    this.currentY = this.margin;
  }

  private renderSectionHeader(title: string): void {
    this.doc.setFillColor(...this.colors.primary);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), 12, 'F');
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(255, 255, 255);
    this.doc.text(title, this.pageWidth / 2, this.currentY + 8, { align: 'center' });
    
    this.currentY += 20;
  }

  private renderSubHeader(title: string): void {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.colors.primary);
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 8;
  }

  private renderInfoBox(title: string, items: string[]): void {
    const boxHeight = 15 + (items.length * 6);
    
    this.doc.setDrawColor(...this.colors.secondary);
    this.doc.setFillColor(...this.colors.lightGray);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), boxHeight, 'FD');
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.colors.primary);
    this.doc.text(title, this.margin + 5, this.currentY + 8);
    
    let itemY = this.currentY + 15;
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...this.colors.text);
    
    items.forEach(item => {
      this.doc.text(`• ${item}`, this.margin + 10, itemY);
      itemY += 6;
    });
    
    this.currentY += boxHeight + 5;
  }

  private renderHighlightBox(title: string, items: string[]): void {
    const boxHeight = 15 + (items.length * 6);
    
    this.doc.setDrawColor(...this.colors.accent);
    this.doc.setFillColor(240, 253, 244);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), boxHeight, 'FD');
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.colors.accent);
    this.doc.text(title, this.margin + 5, this.currentY + 8);
    
    let itemY = this.currentY + 15;
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...this.colors.text);
    
    items.forEach(item => {
      this.doc.text(`• ${item}`, this.margin + 10, itemY);
      itemY += 6;
    });
    
    this.currentY += boxHeight + 5;
  }

  private renderKPIsGrid(kpis: KPI[]): void {
    const kpisPerRow = 2;
    const kpiWidth = (this.pageWidth - (this.margin * 2) - 10) / kpisPerRow;
    const kpiHeight = 25;
    
    for (let i = 0; i < kpis.length; i += kpisPerRow) {
      for (let j = 0; j < kpisPerRow && (i + j) < kpis.length; j++) {
        const kpi = kpis[i + j];
        const x = this.margin + (j * (kpiWidth + 5));
        
        const statusColor = kpi.status === 'good' ? this.colors.success :
                           kpi.status === 'warning' ? this.colors.warning : this.colors.danger;
        
        this.doc.setDrawColor(...statusColor);
        this.doc.setFillColor(255, 255, 255);
        this.doc.rect(x, this.currentY, kpiWidth, kpiHeight, 'FD');
        
        this.doc.setFontSize(8);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(...this.colors.secondary);
        this.doc.text(kpi.name, x + 5, this.currentY + 8);
        
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(...statusColor);
        this.doc.text(this.formatKPIValue(kpi.value, kpi.unit), x + 5, this.currentY + 18);
      }
      this.currentY += kpiHeight + 5;
    }
  }

  private renderHighlightsAndConcerns(summary: any): void {
    const columnWidth = (this.pageWidth - (this.margin * 2) - 10) / 2;
    
    // Highlights
    this.doc.setDrawColor(...this.colors.success);
    this.doc.setFillColor(240, 253, 244);
    this.doc.rect(this.margin, this.currentY, columnWidth, 60, 'FD');
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.colors.success);
    this.doc.text('PONTOS POSITIVOS', this.margin + 5, this.currentY + 10);
    
    let highlightY = this.currentY + 18;
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...this.colors.text);
    
    summary.keyHighlights.slice(0, 5).forEach((highlight: string) => {
      this.doc.text(`• ${highlight}`, this.margin + 5, highlightY, {
        maxWidth: columnWidth - 10
      });
      highlightY += 8;
    });
    
    // Concerns
    this.doc.setDrawColor(...this.colors.warning);
    this.doc.setFillColor(254, 252, 232);
    this.doc.rect(this.margin + columnWidth + 5, this.currentY, columnWidth, 60, 'FD');
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(...this.colors.warning);
    this.doc.text('PONTOS DE ATENÇÃO', this.margin + columnWidth + 10, this.currentY + 10);
    
    let concernY = this.currentY + 18;
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...this.colors.text);
    
    summary.concerns.slice(0, 5).forEach((concern: string) => {
      this.doc.text(`• ${concern}`, this.margin + columnWidth + 10, concernY, {
        maxWidth: columnWidth - 10
      });
      concernY += 8;
    });
    
    this.currentY += 65;
  }

  private renderRecommendationBadge(action: string): void {
    const badgeColor = action === 'approve' ? this.colors.success :
                      action === 'negotiate' ? this.colors.warning :
                      action === 'reject' ? this.colors.danger : this.colors.secondary;
    
    const badgeText = action === 'approve' ? 'RECOMENDADO PARA APROVAÇÃO' :
                     action === 'negotiate' ? 'RECOMENDADO PARA NEGOCIAÇÃO' :
                     action === 'reject' ? 'NÃO RECOMENDADO' : 'REQUER REVISÃO';
    
    this.doc.setFillColor(...badgeColor);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), 15, 'F');
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(255, 255, 255);
    this.doc.text(badgeText, this.pageWidth / 2, this.currentY + 10, { align: 'center' });
    
    this.currentY += 20;
  }

  private renderFooter(companyInfo: CompanyInfo): void {
    const footerY = this.pageHeight - 20;
    
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...this.colors.secondary);
    
    this.doc.text(`${companyInfo.name} | ${companyInfo.phone} | ${companyInfo.email}`, 
                 this.pageWidth / 2, footerY, { align: 'center' });
    this.doc.text(`Proposta gerada em ${new Date().toLocaleDateString('pt-BR')}`, 
                 this.pageWidth / 2, footerY + 6, { align: 'center' });
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  private formatKPIValue(value: number, unit: string): string {
    if (unit === 'R$') {
      return this.formatCurrency(value);
    } else if (unit === '%') {
      return `${value.toFixed(1)}%`;
    } else {
      return `${value.toFixed(1)} ${unit}`;
    }
  }
}