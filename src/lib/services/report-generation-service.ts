import { ServiceDeskData } from '@/lib/types/service-desk-pricing';
import { ReportConfig, ReportSection } from '@/components/service-desk-pricing/reports/ReportGenerator';

export interface GeneratedReport {
  id: string;
  config: ReportConfig;
  data: ServiceDeskData;
  generatedAt: Date;
  fileUrl?: string;
  fileSize?: number;
  status: 'generating' | 'completed' | 'failed';
  error?: string;
}

export interface ReportMetrics {
  totalCost: number;
  monthlyRecurring: number;
  teamSize: number;
  profitMargin: number;
  roi: number;
  paybackPeriod: number;
  riskScore: number;
}

export class ReportGenerationService {
  private static instance: ReportGenerationService;
  private reports: Map<string, GeneratedReport> = new Map();
  private templates: Map<string, ReportConfig> = new Map();

  static getInstance(): ReportGenerationService {
    if (!ReportGenerationService.instance) {
      ReportGenerationService.instance = new ReportGenerationService();
    }
    return ReportGenerationService.instance;
  }

  async generateReport(config: ReportConfig, data: ServiceDeskData): Promise<GeneratedReport> {
    const reportId = crypto.randomUUID();
    
    const report: GeneratedReport = {
      id: reportId,
      config,
      data,
      generatedAt: new Date(),
      status: 'generating'
    };

    this.reports.set(reportId, report);

    try {
      // Calculate metrics
      const metrics = this.calculateMetrics(data);
      
      // Generate report content based on format
      let content: any;
      switch (config.format) {
        case 'pdf':
          content = await this.generatePDFReport(config, data, metrics);
          break;
        case 'excel':
          content = await this.generateExcelReport(config, data, metrics);
          break;
        case 'word':
          content = await this.generateWordReport(config, data, metrics);
          break;
        case 'html':
          content = await this.generateHTMLReport(config, data, metrics);
          break;
        default:
          throw new Error(`Unsupported format: ${config.format}`);
      }

      // Simulate file generation and storage
      const fileUrl = await this.storeReportFile(reportId, content, config.format);
      
      report.status = 'completed';
      report.fileUrl = fileUrl;
      report.fileSize = this.estimateFileSize(content);
      
      this.reports.set(reportId, report);
      
      return report;
    } catch (error) {
      report.status = 'failed';
      report.error = error instanceof Error ? error.message : 'Unknown error';
      this.reports.set(reportId, report);
      throw error;
    }
  }

  private calculateMetrics(data: ServiceDeskData): ReportMetrics {
    // Calculate total cost
    const totalCost = this.calculateTotalCost(data);
    
    // Calculate monthly recurring cost
    const monthlyRecurring = this.calculateMonthlyRecurring(data);
    
    // Calculate team size
    const teamSize = data.team?.members?.length || 0;
    
    // Calculate profit margin (simplified)
    const revenue = data.budget?.totalValue || 0;
    const profitMargin = revenue > 0 ? ((revenue - totalCost) / revenue) * 100 : 0;
    
    // Calculate ROI (simplified)
    const roi = totalCost > 0 ? ((revenue - totalCost) / totalCost) * 100 : 0;
    
    // Calculate payback period (simplified - in months)
    const monthlyProfit = (revenue - totalCost) / 12;
    const paybackPeriod = monthlyProfit > 0 ? totalCost / monthlyProfit : 0;
    
    // Calculate risk score (simplified)
    const riskScore = this.calculateRiskScore(data);

    return {
      totalCost,
      monthlyRecurring,
      teamSize,
      profitMargin,
      roi,
      paybackPeriod,
      riskScore
    };
  }

  private calculateTotalCost(data: ServiceDeskData): number {
    let total = 0;
    
    // Team costs
    if (data.team?.members) {
      total += data.team.members.reduce((sum, member) => {
        return sum + (member.salary || 0) + (member.benefits || 0);
      }, 0);
    }
    
    // Other costs
    if (data.otherCosts) {
      total += Object.values(data.otherCosts).reduce((sum: number, cost: any) => {
        return sum + (typeof cost === 'number' ? cost : cost?.value || 0);
      }, 0);
    }
    
    // Infrastructure costs
    if (data.infrastructure) {
      total += Object.values(data.infrastructure).reduce((sum: number, cost: any) => {
        return sum + (typeof cost === 'number' ? cost : cost?.value || 0);
      }, 0);
    }

    return total;
  }

  private calculateMonthlyRecurring(data: ServiceDeskData): number {
    const totalCost = this.calculateTotalCost(data);
    const contractMonths = data.project.contractDuration || 12;
    return totalCost / contractMonths;
  }

  private calculateRiskScore(data: ServiceDeskData): number {
    let riskScore = 0;
    
    // Team size risk
    const teamSize = data.team?.members?.length || 0;
    if (teamSize < 3) riskScore += 20;
    else if (teamSize > 20) riskScore += 10;
    
    // Contract duration risk
    const duration = data.project.contractDuration || 0;
    if (duration < 6) riskScore += 30;
    else if (duration > 36) riskScore += 15;
    
    // Budget risk
    const budget = data.budget?.totalValue || 0;
    const cost = this.calculateTotalCost(data);
    const margin = budget > 0 ? ((budget - cost) / budget) * 100 : 0;
    if (margin < 10) riskScore += 25;
    else if (margin < 20) riskScore += 10;
    
    // Technology risk (simplified)
    if (data.project.serviceType === 'advanced') riskScore += 15;
    
    return Math.min(riskScore, 100);
  }

  private async generatePDFReport(config: ReportConfig, data: ServiceDeskData, metrics: ReportMetrics): Promise<any> {
    // This would integrate with a PDF generation library like jsPDF or Puppeteer
    const content = {
      title: config.name,
      sections: await this.generateSectionContent(config.sections, data, metrics),
      branding: config.branding,
      metadata: {
        generatedAt: new Date(),
        projectName: data.project.name,
        clientName: data.project.client?.name
      }
    };

    return content;
  }

  private async generateExcelReport(config: ReportConfig, data: ServiceDeskData, metrics: ReportMetrics): Promise<any> {
    // This would integrate with a library like ExcelJS
    const workbook = {
      worksheets: [
        {
          name: 'Resumo Executivo',
          data: this.generateExecutiveSummaryData(data, metrics)
        },
        {
          name: 'Detalhamento de Custos',
          data: this.generateCostBreakdownData(data)
        },
        {
          name: 'Composição da Equipe',
          data: this.generateTeamCompositionData(data)
        }
      ]
    };

    return workbook;
  }

  private async generateWordReport(config: ReportConfig, data: ServiceDeskData, metrics: ReportMetrics): Promise<any> {
    // This would integrate with a library like docx
    const document = {
      sections: await this.generateSectionContent(config.sections, data, metrics),
      styles: config.branding
    };

    return document;
  }

  private async generateHTMLReport(config: ReportConfig, data: ServiceDeskData, metrics: ReportMetrics): Promise<string> {
    const sections = await this.generateSectionContent(config.sections, data, metrics);
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${config.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .section { margin: 30px 0; }
            .kpi { display: inline-block; margin: 10px; padding: 20px; border: 1px solid #ddd; text-align: center; }
            .chart-placeholder { background: #f5f5f5; height: 300px; display: flex; align-items: center; justify-content: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${config.name}</h1>
            <p>${config.description}</p>
            <p>Projeto: ${data.project.name} | Cliente: ${data.project.client?.name}</p>
          </div>
          ${sections.map(section => `
            <div class="section">
              <h2>${section.title}</h2>
              <div>${section.content}</div>
            </div>
          `).join('')}
        </body>
      </html>
    `;
  }

  private async generateSectionContent(sections: ReportSection[], data: ServiceDeskData, metrics: ReportMetrics): Promise<any[]> {
    const enabledSections = sections.filter(s => s.enabled).sort((a, b) => a.order - b.order);
    
    return Promise.all(enabledSections.map(async section => {
      switch (section.type) {
        case 'summary':
          return this.generateExecutiveSummary(data, metrics);
        case 'kpi':
          return this.generateKPISection(data, metrics);
        case 'chart':
          return this.generateChartSection(section, data);
        case 'table':
          return this.generateTableSection(section, data);
        case 'text':
          return this.generateTextSection(section, data);
        case 'forecast':
          return this.generateForecastSection(section, data);
        default:
          return { title: section.name, content: 'Seção não implementada' };
      }
    }));
  }

  private generateExecutiveSummary(data: ServiceDeskData, metrics: ReportMetrics): any {
    return {
      title: 'Resumo Executivo',
      content: `
        <p>Este relatório apresenta a análise completa do projeto ${data.project.name} para o cliente ${data.project.client?.name}.</p>
        <h3>Principais Indicadores:</h3>
        <ul>
          <li>Custo Total: R$ ${metrics.totalCost.toLocaleString('pt-BR')}</li>
          <li>Custo Mensal Recorrente: R$ ${metrics.monthlyRecurring.toLocaleString('pt-BR')}</li>
          <li>Tamanho da Equipe: ${metrics.teamSize} profissionais</li>
          <li>Margem de Lucro: ${metrics.profitMargin.toFixed(1)}%</li>
          <li>ROI: ${metrics.roi.toFixed(1)}%</li>
          <li>Payback: ${metrics.paybackPeriod.toFixed(1)} meses</li>
          <li>Score de Risco: ${metrics.riskScore.toFixed(0)}/100</li>
        </ul>
      `
    };
  }

  private generateKPISection(data: ServiceDeskData, metrics: ReportMetrics): any {
    return {
      title: 'Indicadores Chave de Performance',
      content: `
        <div class="kpi">
          <h3>R$ ${metrics.totalCost.toLocaleString('pt-BR')}</h3>
          <p>Custo Total</p>
        </div>
        <div class="kpi">
          <h3>${metrics.teamSize}</h3>
          <p>Profissionais</p>
        </div>
        <div class="kpi">
          <h3>${metrics.profitMargin.toFixed(1)}%</h3>
          <p>Margem de Lucro</p>
        </div>
        <div class="kpi">
          <h3>${metrics.roi.toFixed(1)}%</h3>
          <p>ROI</p>
        </div>
      `
    };
  }

  private generateChartSection(section: ReportSection, data: ServiceDeskData): any {
    return {
      title: section.name,
      content: `
        <div class="chart-placeholder">
          <p>Gráfico: ${section.name}</p>
          <p>Tipo: ${section.config.chartType || 'bar'}</p>
        </div>
      `
    };
  }

  private generateTableSection(section: ReportSection, data: ServiceDeskData): any {
    return {
      title: section.name,
      content: `
        <table border="1" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th>Item</th>
              <th>Valor</th>
              <th>Percentual</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Custos de Pessoal</td>
              <td>R$ ${(data.team?.members?.reduce((sum, m) => sum + (m.salary || 0), 0) || 0).toLocaleString('pt-BR')}</td>
              <td>70%</td>
            </tr>
            <tr>
              <td>Infraestrutura</td>
              <td>R$ 50.000</td>
              <td>20%</td>
            </tr>
            <tr>
              <td>Outros Custos</td>
              <td>R$ 25.000</td>
              <td>10%</td>
            </tr>
          </tbody>
        </table>
      `
    };
  }

  private generateTextSection(section: ReportSection, data: ServiceDeskData): any {
    return {
      title: section.name,
      content: `
        <p>Visão geral do projeto ${data.project.name}:</p>
        <p><strong>Cliente:</strong> ${data.project.client?.name}</p>
        <p><strong>Tipo de Serviço:</strong> ${data.project.serviceType}</p>
        <p><strong>Duração do Contrato:</strong> ${data.project.contractDuration} meses</p>
        <p><strong>Localização:</strong> ${data.project.location}</p>
      `
    };
  }

  private generateForecastSection(section: ReportSection, data: ServiceDeskData): any {
    return {
      title: section.name,
      content: `
        <p>Projeções financeiras para os próximos ${section.config.timeframe || '12 meses'}:</p>
        <div class="chart-placeholder">
          <p>Gráfico de Projeções</p>
          <p>Cenários: ${section.config.scenarios?.join(', ') || 'Baseline'}</p>
        </div>
      `
    };
  }

  private generateExecutiveSummaryData(data: ServiceDeskData, metrics: ReportMetrics): any[][] {
    return [
      ['Indicador', 'Valor'],
      ['Custo Total', `R$ ${metrics.totalCost.toLocaleString('pt-BR')}`],
      ['Custo Mensal', `R$ ${metrics.monthlyRecurring.toLocaleString('pt-BR')}`],
      ['Tamanho da Equipe', metrics.teamSize.toString()],
      ['Margem de Lucro', `${metrics.profitMargin.toFixed(1)}%`],
      ['ROI', `${metrics.roi.toFixed(1)}%`],
      ['Payback (meses)', metrics.paybackPeriod.toFixed(1)],
      ['Score de Risco', `${metrics.riskScore.toFixed(0)}/100`]
    ];
  }

  private generateCostBreakdownData(data: ServiceDeskData): any[][] {
    const teamCost = data.team?.members?.reduce((sum, m) => sum + (m.salary || 0), 0) || 0;
    
    return [
      ['Categoria', 'Valor', 'Percentual'],
      ['Custos de Pessoal', `R$ ${teamCost.toLocaleString('pt-BR')}`, '70%'],
      ['Infraestrutura', 'R$ 50.000', '20%'],
      ['Outros Custos', 'R$ 25.000', '10%']
    ];
  }

  private generateTeamCompositionData(data: ServiceDeskData): any[][] {
    const headers = ['Nome', 'Cargo', 'Salário', 'Benefícios'];
    const rows = data.team?.members?.map(member => [
      member.name || 'N/A',
      member.role || 'N/A',
      `R$ ${(member.salary || 0).toLocaleString('pt-BR')}`,
      `R$ ${(member.benefits || 0).toLocaleString('pt-BR')}`
    ]) || [];

    return [headers, ...rows];
  }

  private async storeReportFile(reportId: string, content: any, format: string): Promise<string> {
    // In a real implementation, this would upload to cloud storage
    // For now, we'll simulate with a local URL
    return `/api/reports/${reportId}/download.${format}`;
  }

  private estimateFileSize(content: any): number {
    // Rough estimation based on content
    const contentString = JSON.stringify(content);
    return contentString.length * 1.5; // Rough multiplier for formatting
  }

  async getReport(reportId: string): Promise<GeneratedReport | null> {
    return this.reports.get(reportId) || null;
  }

  async listReports(): Promise<GeneratedReport[]> {
    return Array.from(this.reports.values());
  }

  async deleteReport(reportId: string): Promise<boolean> {
    return this.reports.delete(reportId);
  }

  async saveTemplate(config: ReportConfig): Promise<void> {
    this.templates.set(config.id, config);
  }

  async getTemplates(): Promise<ReportConfig[]> {
    return Array.from(this.templates.values());
  }

  async deleteTemplate(templateId: string): Promise<boolean> {
    return this.templates.delete(templateId);
  }
}