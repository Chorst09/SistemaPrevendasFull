import { ServiceDeskData, ExportOption, ExportCustomization } from '@/lib/types/service-desk-pricing';
import * as XLSX from 'xlsx';

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  format: 'pdf' | 'excel' | 'json' | 'csv';
  sections: ExportSection[];
  customizable: boolean;
}

export interface ExportSection {
  id: string;
  name: string;
  required: boolean;
  dataPath: string;
  formatter?: (data: any) => any;
}

export interface ScheduledReport {
  id: string;
  name: string;
  templateId: string;
  schedule: ReportSchedule;
  recipients: string[];
  enabled: boolean;
  lastRun?: Date;
  nextRun: Date;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  time: string; // HH:mm format
}

export class ReportExportService {
  private static instance: ReportExportService;
  private templates: Map<string, ExportTemplate> = new Map();
  private scheduledReports: Map<string, ScheduledReport> = new Map();

  private constructor() {
    this.initializeDefaultTemplates();
  }

  static getInstance(): ReportExportService {
    if (!ReportExportService.instance) {
      ReportExportService.instance = new ReportExportService();
    }
    return ReportExportService.instance;
  }

  /**
   * Initialize default export templates
   */
  private initializeDefaultTemplates(): void {
    // Executive Summary Template
    this.templates.set('executive-summary', {
      id: 'executive-summary',
      name: 'Resumo Executivo',
      description: 'Relatório executivo com KPIs principais e análise de viabilidade',
      format: 'pdf',
      sections: [
        { id: 'project-info', name: 'Informações do Projeto', required: true, dataPath: 'project' },
        { id: 'financial-summary', name: 'Resumo Financeiro', required: true, dataPath: 'budget' },
        { id: 'kpis', name: 'Indicadores Principais', required: true, dataPath: 'finalAnalysis.kpis' },
        { id: 'recommendations', name: 'Recomendações', required: false, dataPath: 'finalAnalysis.recommendations' }
      ],
      customizable: true
    });

    // Detailed Cost Analysis Template
    this.templates.set('cost-analysis', {
      id: 'cost-analysis',
      name: 'Análise Detalhada de Custos',
      description: 'Relatório completo com breakdown de todos os custos',
      format: 'excel',
      sections: [
        { id: 'team-costs', name: 'Custos da Equipe', required: true, dataPath: 'team' },
        { id: 'infrastructure', name: 'Infraestrutura', required: true, dataPath: 'otherCosts' },
        { id: 'taxes', name: 'Impostos', required: true, dataPath: 'taxes' },
        { id: 'monthly-breakdown', name: 'Breakdown Mensal', required: true, dataPath: 'budget.monthlyBreakdown' }
      ],
      customizable: true
    });

    // Technical Proposal Template
    this.templates.set('technical-proposal', {
      id: 'technical-proposal',
      name: 'Proposta Técnica',
      description: 'Proposta técnica detalhada com escala e recursos',
      format: 'pdf',
      sections: [
        { id: 'service-description', name: 'Descrição do Serviço', required: true, dataPath: 'project' },
        { id: 'team-structure', name: 'Estrutura da Equipe', required: true, dataPath: 'team' },
        { id: 'work-schedule', name: 'Escala de Trabalho', required: true, dataPath: 'schedules' },
        { id: 'sla-requirements', name: 'Requisitos de SLA', required: false, dataPath: 'schedules' }
      ],
      customizable: true
    });

    // Financial Analysis Template
    this.templates.set('financial-analysis', {
      id: 'financial-analysis',
      name: 'Análise Financeira',
      description: 'Análise financeira completa com ROI e payback',
      format: 'excel',
      sections: [
        { id: 'profitability', name: 'Análise de Rentabilidade', required: true, dataPath: 'analysis' },
        { id: 'scenarios', name: 'Cenários de Negociação', required: false, dataPath: 'negotiations' },
        { id: 'risk-analysis', name: 'Análise de Riscos', required: true, dataPath: 'analysis.riskAnalysis' },
        { id: 'sensitivity', name: 'Análise de Sensibilidade', required: false, dataPath: 'analysis.sensitivityAnalysis' }
      ],
      customizable: true
    });

    // Data Export Template (JSON)
    this.templates.set('data-export', {
      id: 'data-export',
      name: 'Exportação de Dados',
      description: 'Exportação completa dos dados em formato JSON',
      format: 'json',
      sections: [
        { id: 'all-data', name: 'Todos os Dados', required: true, dataPath: '' }
      ],
      customizable: false
    });
  }

  /**
   * Get all available templates
   */
  getTemplates(): ExportTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): ExportTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * Export data using specified template
   */
  async exportData(
    data: ServiceDeskData,
    templateId: string,
    customization?: ExportCustomization
  ): Promise<Blob> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    switch (template.format) {
      case 'json':
        return this.exportToJSON(data, template, customization);
      case 'excel':
        return this.exportToExcel(data, template, customization);
      case 'csv':
        return this.exportToCSV(data, template, customization);
      case 'pdf':
        return this.exportToPDF(data, template, customization);
      default:
        throw new Error(`Unsupported format: ${template.format}`);
    }
  }

  /**
   * Export to JSON format
   */
  private async exportToJSON(
    data: ServiceDeskData,
    template: ExportTemplate,
    customization?: ExportCustomization
  ): Promise<Blob> {
    let exportData: any = {};

    if (template.id === 'data-export') {
      // Full data export
      exportData = data;
    } else {
      // Selective export based on template sections
      for (const section of template.sections) {
        if (section.required || customization?.includeDetails) {
          const sectionData = this.extractDataByPath(data, section.dataPath);
          if (section.formatter) {
            exportData[section.id] = section.formatter(sectionData);
          } else {
            exportData[section.id] = sectionData;
          }
        }
      }
    }

    // Add metadata
    exportData._metadata = {
      exportedAt: new Date().toISOString(),
      template: template.name,
      version: '1.0.0',
      customization
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  }

  /**
   * Export to Excel format
   */
  private async exportToExcel(
    data: ServiceDeskData,
    template: ExportTemplate,
    customization?: ExportCustomization
  ): Promise<Blob> {
    const workbook = XLSX.utils.book_new();

    // Add summary sheet
    const summaryData = [
      ['Projeto', data.project.name],
      ['Cliente', data.project.client.name],
      ['Período', `${data.project.contractPeriod.startDate.toLocaleDateString()} - ${data.project.contractPeriod.endDate.toLocaleDateString()}`],
      ['Valor Total', this.formatCurrency(data.budget.totalPrice, customization?.currency)],
      ['Margem', `${data.budget.margin.value}%`],
      ['Exportado em', new Date().toLocaleString()]
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');

    // Add sheets based on template sections
    for (const section of template.sections) {
      if (section.required || customization?.includeDetails) {
        const sectionData = this.extractDataByPath(data, section.dataPath);
        const sheet = this.createExcelSheet(sectionData, section.name);
        XLSX.utils.book_append_sheet(workbook, sheet, section.name);
      }
    }

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
  }

  /**
   * Export to CSV format
   */
  private async exportToCSV(
    data: ServiceDeskData,
    template: ExportTemplate,
    customization?: ExportCustomization
  ): Promise<Blob> {
    let csvContent = '';

    // Add header
    csvContent += `Relatório: ${template.name}\n`;
    csvContent += `Projeto: ${data.project.name}\n`;
    csvContent += `Exportado em: ${new Date().toLocaleString()}\n\n`;

    // Add data from each section
    for (const section of template.sections) {
      if (section.required || customization?.includeDetails) {
        csvContent += `${section.name}\n`;
        const sectionData = this.extractDataByPath(data, section.dataPath);
        csvContent += this.convertToCSV(sectionData);
        csvContent += '\n\n';
      }
    }

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  /**
   * Export to PDF format (placeholder - will integrate with existing PDF system)
   */
  private async exportToPDF(
    data: ServiceDeskData,
    template: ExportTemplate,
    customization?: ExportCustomization
  ): Promise<Blob> {
    // This will be implemented in the integration phase
    // For now, return a placeholder
    const pdfContent = `PDF Export - ${template.name}\n\nThis will be integrated with the existing PDF generation system.`;
    return new Blob([pdfContent], { type: 'application/pdf' });
  }

  /**
   * Extract data by path (dot notation)
   */
  private extractDataByPath(data: any, path: string): any {
    if (!path) return data;
    
    return path.split('.').reduce((obj, key) => {
      return obj && obj[key] !== undefined ? obj[key] : null;
    }, data);
  }

  /**
   * Create Excel sheet from data
   */
  private createExcelSheet(data: any, sheetName: string): XLSX.WorkSheet {
    if (Array.isArray(data)) {
      // Handle array data
      if (data.length === 0) {
        return XLSX.utils.aoa_to_sheet([['Nenhum dado disponível']]);
      }

      // Convert objects to array of arrays
      const headers = Object.keys(data[0]);
      const rows = data.map(item => headers.map(header => item[header]));
      return XLSX.utils.aoa_to_sheet([headers, ...rows]);
    } else if (typeof data === 'object' && data !== null) {
      // Handle object data
      const entries = Object.entries(data).map(([key, value]) => [key, value]);
      return XLSX.utils.aoa_to_sheet([['Campo', 'Valor'], ...entries]);
    } else {
      // Handle primitive data
      return XLSX.utils.aoa_to_sheet([['Valor'], [data]]);
    }
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: any): string {
    if (Array.isArray(data)) {
      if (data.length === 0) return 'Nenhum dado disponível\n';
      
      const headers = Object.keys(data[0]);
      let csv = headers.join(',') + '\n';
      
      for (const item of data) {
        const row = headers.map(header => {
          const value = item[header];
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        });
        csv += row.join(',') + '\n';
      }
      
      return csv;
    } else if (typeof data === 'object' && data !== null) {
      let csv = 'Campo,Valor\n';
      for (const [key, value] of Object.entries(data)) {
        const csvValue = typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        csv += `"${key}",${csvValue}\n`;
      }
      return csv;
    } else {
      return `Valor\n${data}\n`;
    }
  }

  /**
   * Format currency value
   */
  private formatCurrency(value: number, currency: string = 'BRL'): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(value);
  }

  /**
   * Create custom template
   */
  createCustomTemplate(template: Omit<ExportTemplate, 'id'>): string {
    const id = `custom-${Date.now()}`;
    this.templates.set(id, { ...template, id });
    return id;
  }

  /**
   * Update existing template
   */
  updateTemplate(templateId: string, updates: Partial<ExportTemplate>): boolean {
    const template = this.templates.get(templateId);
    if (!template) return false;

    this.templates.set(templateId, { ...template, ...updates });
    return true;
  }

  /**
   * Delete template
   */
  deleteTemplate(templateId: string): boolean {
    return this.templates.delete(templateId);
  }

  /**
   * Schedule automatic report generation
   */
  scheduleReport(report: Omit<ScheduledReport, 'id' | 'nextRun'>): string {
    const id = `scheduled-${Date.now()}`;
    const nextRun = this.calculateNextRun(report.schedule);
    
    const scheduledReport: ScheduledReport = {
      ...report,
      id,
      nextRun
    };

    this.scheduledReports.set(id, scheduledReport);
    
    // Set up the actual scheduling (in a real implementation, this would use a job scheduler)
    this.setupReportSchedule(scheduledReport);
    
    return id;
  }

  /**
   * Get all scheduled reports
   */
  getScheduledReports(): ScheduledReport[] {
    return Array.from(this.scheduledReports.values());
  }

  /**
   * Update scheduled report
   */
  updateScheduledReport(reportId: string, updates: Partial<ScheduledReport>): boolean {
    const report = this.scheduledReports.get(reportId);
    if (!report) return false;

    const updatedReport = { ...report, ...updates };
    if (updates.schedule) {
      updatedReport.nextRun = this.calculateNextRun(updates.schedule);
    }

    this.scheduledReports.set(reportId, updatedReport);
    this.setupReportSchedule(updatedReport);
    
    return true;
  }

  /**
   * Delete scheduled report
   */
  deleteScheduledReport(reportId: string): boolean {
    return this.scheduledReports.delete(reportId);
  }

  /**
   * Calculate next run time for scheduled report
   */
  private calculateNextRun(schedule: ReportSchedule): Date {
    const now = new Date();
    const [hours, minutes] = schedule.time.split(':').map(Number);
    
    let nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);

    switch (schedule.frequency) {
      case 'daily':
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;
        
      case 'weekly':
        const targetDay = schedule.dayOfWeek || 1; // Default to Monday
        const currentDay = nextRun.getDay();
        let daysUntilTarget = targetDay - currentDay;
        
        if (daysUntilTarget <= 0 || (daysUntilTarget === 0 && nextRun <= now)) {
          daysUntilTarget += 7;
        }
        
        nextRun.setDate(nextRun.getDate() + daysUntilTarget);
        break;
        
      case 'monthly':
        const targetDate = schedule.dayOfMonth || 1;
        nextRun.setDate(targetDate);
        
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }
        break;
        
      case 'quarterly':
        const currentMonth = nextRun.getMonth();
        const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
        const nextQuarterMonth = quarterStartMonth + 3;
        
        nextRun.setMonth(nextQuarterMonth);
        nextRun.setDate(schedule.dayOfMonth || 1);
        break;
    }

    return nextRun;
  }

  /**
   * Set up actual report scheduling (placeholder)
   */
  private setupReportSchedule(report: ScheduledReport): void {
    // In a real implementation, this would integrate with a job scheduler
    // For now, we'll just log the schedule
    console.log(`Scheduled report "${report.name}" for ${report.nextRun.toLocaleString()}`);
  }

  /**
   * Generate scheduled report
   */
  async generateScheduledReport(reportId: string, data: ServiceDeskData): Promise<void> {
    const report = this.scheduledReports.get(reportId);
    if (!report || !report.enabled) return;

    try {
      const blob = await this.exportData(data, report.templateId);
      
      // In a real implementation, this would send the report to recipients
      console.log(`Generated scheduled report: ${report.name}`);
      
      // Update last run and calculate next run
      report.lastRun = new Date();
      report.nextRun = this.calculateNextRun(report.schedule);
      
      this.scheduledReports.set(reportId, report);
      this.setupReportSchedule(report);
      
    } catch (error) {
      console.error(`Error generating scheduled report ${report.name}:`, error);
    }
  }

  /**
   * Get export statistics
   */
  getExportStats(): {
    totalTemplates: number;
    customTemplates: number;
    scheduledReports: number;
    activeSchedules: number;
  } {
    const customTemplates = Array.from(this.templates.values())
      .filter(t => t.id.startsWith('custom-')).length;
    
    const activeSchedules = Array.from(this.scheduledReports.values())
      .filter(r => r.enabled).length;

    return {
      totalTemplates: this.templates.size,
      customTemplates,
      scheduledReports: this.scheduledReports.size,
      activeSchedules
    };
  }
}