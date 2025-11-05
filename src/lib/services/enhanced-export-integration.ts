import { ServiceDeskData, ExportCustomization } from '@/lib/types/service-desk-pricing';
import { ReportExportService, ExportTemplate } from './report-export-service';
import { ServiceDeskPDFIntegration, ServiceDeskPDFOptions } from './service-desk-pdf-integration';
import { PDFGenerationResult } from '@/lib/types/pdf/core';

export interface UnifiedExportOptions extends ExportCustomization {
  templateId: string;
  pdfOptions?: ServiceDeskPDFOptions;
  includeMetadata?: boolean;
  watermark?: string;
  password?: string;
}

export interface ExportResult {
  blob: Blob;
  url: string;
  filename: string;
  format: string;
  size: number;
  generatedAt: Date;
  metadata?: ExportMetadata;
}

export interface ExportMetadata {
  projectId: string;
  projectName: string;
  templateId: string;
  templateName: string;
  exportedBy: string;
  version: string;
  checksum?: string;
}

export interface ExportHistory {
  id: string;
  projectId: string;
  templateId: string;
  format: string;
  filename: string;
  size: number;
  exportedAt: Date;
  exportedBy: string;
  downloadCount: number;
  lastDownloaded?: Date;
}

/**
 * Enhanced Export Integration Service
 * Unifies the export system with the existing PDF generation system
 */
export class EnhancedExportIntegration {
  private static instance: EnhancedExportIntegration;
  private reportExportService: ReportExportService;
  private pdfIntegration: ServiceDeskPDFIntegration;
  private exportHistory: Map<string, ExportHistory> = new Map();

  private constructor() {
    this.reportExportService = ReportExportService.getInstance();
    this.pdfIntegration = new ServiceDeskPDFIntegration();
  }

  static getInstance(): EnhancedExportIntegration {
    if (!EnhancedExportIntegration.instance) {
      EnhancedExportIntegration.instance = new EnhancedExportIntegration();
    }
    return EnhancedExportIntegration.instance;
  }

  /**
   * Unified export method that handles all formats including enhanced PDF
   */
  async exportData(
    data: ServiceDeskData,
    options: UnifiedExportOptions
  ): Promise<ExportResult> {
    const template = this.reportExportService.getTemplate(options.templateId);
    if (!template) {
      throw new Error(`Template not found: ${options.templateId}`);
    }

    let result: ExportResult;

    if (template.format === 'pdf') {
      result = await this.exportToPDF(data, template, options);
    } else {
      result = await this.exportToOtherFormat(data, template, options);
    }

    // Record export in history
    this.recordExportHistory(result, data, template);

    return result;
  }

  /**
   * Export to PDF using the enhanced PDF integration
   */
  private async exportToPDF(
    data: ServiceDeskData,
    template: ExportTemplate,
    options: UnifiedExportOptions
  ): Promise<ExportResult> {
    try {
      const pdfOptions: ServiceDeskPDFOptions = {
        includeExecutiveSummary: true,
        includeKPIs: true,
        includeRecommendations: true,
        includeBenchmarks: true,
        includeApprovals: true,
        templateType: this.mapTemplateTypeToPDF(template.id),
        language: options.language || 'pt',
        ...options.pdfOptions
      };

      const pdfResult: PDFGenerationResult = await this.pdfIntegration.generateEnhancedProposal(
        data,
        data.finalAnalysis,
        pdfOptions
      );

      const filename = this.generateFilename(data, template, 'pdf');
      
      const metadata: ExportMetadata = {
        projectId: data.project.id,
        projectName: data.project.name,
        templateId: template.id,
        templateName: template.name,
        exportedBy: 'system', // In a real app, this would be the current user
        version: '1.0.0',
        checksum: await this.generateChecksum(pdfResult.blob)
      };

      return {
        blob: pdfResult.blob,
        url: pdfResult.url,
        filename,
        format: 'pdf',
        size: pdfResult.size,
        generatedAt: pdfResult.generatedAt,
        metadata: options.includeMetadata ? metadata : undefined
      };
    } catch (error) {
      console.error('PDF export error:', error);
      throw new Error(`Erro na exportação PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Export to other formats (Excel, JSON, CSV)
   */
  private async exportToOtherFormat(
    data: ServiceDeskData,
    template: ExportTemplate,
    options: UnifiedExportOptions
  ): Promise<ExportResult> {
    try {
      const blob = await this.reportExportService.exportData(data, template.id, options);
      const filename = this.generateFilename(data, template, template.format);
      const url = URL.createObjectURL(blob);

      const metadata: ExportMetadata = {
        projectId: data.project.id,
        projectName: data.project.name,
        templateId: template.id,
        templateName: template.name,
        exportedBy: 'system',
        version: '1.0.0',
        checksum: await this.generateChecksum(blob)
      };

      return {
        blob,
        url,
        filename,
        format: template.format,
        size: blob.size,
        generatedAt: new Date(),
        metadata: options.includeMetadata ? metadata : undefined
      };
    } catch (error) {
      console.error('Export error:', error);
      throw new Error(`Erro na exportação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Batch export multiple formats
   */
  async batchExport(
    data: ServiceDeskData,
    templateIds: string[],
    options: Partial<UnifiedExportOptions> = {}
  ): Promise<ExportResult[]> {
    const results: ExportResult[] = [];
    const errors: Array<{ templateId: string; error: string }> = [];

    for (const templateId of templateIds) {
      try {
        const result = await this.exportData(data, {
          ...options,
          templateId,
          includeCharts: options.includeCharts ?? true,
          includeDetails: options.includeDetails ?? true,
          language: options.language ?? 'pt',
          currency: options.currency ?? 'BRL',
          dateFormat: options.dateFormat ?? 'dd/MM/yyyy'
        });
        results.push(result);
      } catch (error) {
        errors.push({
          templateId,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }

    if (errors.length > 0) {
      console.warn('Batch export errors:', errors);
    }

    return results;
  }

  /**
   * Create a ZIP file with multiple exports
   */
  async exportAsZip(
    data: ServiceDeskData,
    templateIds: string[],
    options: Partial<UnifiedExportOptions> = {}
  ): Promise<ExportResult> {
    // This would require a ZIP library like JSZip
    // For now, we'll return a placeholder implementation
    const results = await this.batchExport(data, templateIds, options);
    
    // In a real implementation, this would create a ZIP file
    const zipContent = `ZIP Archive with ${results.length} files:\n` +
      results.map(r => `- ${r.filename} (${r.format.toUpperCase()}, ${this.formatFileSize(r.size)})`).join('\n');
    
    const blob = new Blob([zipContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const filename = `${data.project.name || 'export'}-${new Date().toISOString().split('T')[0]}.txt`;

    return {
      blob,
      url,
      filename,
      format: 'zip',
      size: blob.size,
      generatedAt: new Date(),
      metadata: {
        projectId: data.project.id,
        projectName: data.project.name,
        templateId: 'batch-export',
        templateName: 'Batch Export',
        exportedBy: 'system',
        version: '1.0.0'
      }
    };
  }

  /**
   * Get available templates with enhanced information
   */
  getAvailableTemplates(): Array<ExportTemplate & { 
    supportsEnhancedPDF: boolean;
    estimatedSize: string;
    recommendedFor: string[];
  }> {
    const templates = this.reportExportService.getTemplates();
    
    return templates.map(template => ({
      ...template,
      supportsEnhancedPDF: template.format === 'pdf',
      estimatedSize: this.estimateTemplateSize(template),
      recommendedFor: this.getTemplateRecommendations(template)
    }));
  }

  /**
   * Get export history for a project
   */
  getExportHistory(projectId: string): ExportHistory[] {
    return Array.from(this.exportHistory.values())
      .filter(history => history.projectId === projectId)
      .sort((a, b) => b.exportedAt.getTime() - a.exportedAt.getTime());
  }

  /**
   * Get export statistics
   */
  getExportStatistics(): {
    totalExports: number;
    exportsByFormat: Record<string, number>;
    exportsByTemplate: Record<string, number>;
    totalSize: number;
    averageSize: number;
    mostUsedTemplate: string;
    mostUsedFormat: string;
  } {
    const history = Array.from(this.exportHistory.values());
    
    const exportsByFormat: Record<string, number> = {};
    const exportsByTemplate: Record<string, number> = {};
    let totalSize = 0;

    history.forEach(h => {
      exportsByFormat[h.format] = (exportsByFormat[h.format] || 0) + 1;
      exportsByTemplate[h.templateId] = (exportsByTemplate[h.templateId] || 0) + 1;
      totalSize += h.size;
    });

    const mostUsedFormat = Object.entries(exportsByFormat)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';
    
    const mostUsedTemplate = Object.entries(exportsByTemplate)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    return {
      totalExports: history.length,
      exportsByFormat,
      exportsByTemplate,
      totalSize,
      averageSize: history.length > 0 ? totalSize / history.length : 0,
      mostUsedTemplate,
      mostUsedFormat
    };
  }

  /**
   * Clean up old export URLs to prevent memory leaks
   */
  cleanupExportUrls(olderThanMinutes: number = 60): void {
    const cutoffTime = new Date(Date.now() - olderThanMinutes * 60 * 1000);
    
    this.exportHistory.forEach((history, id) => {
      if (history.exportedAt < cutoffTime) {
        // In a real implementation, we would revoke the URL
        // URL.revokeObjectURL(history.url);
        this.exportHistory.delete(id);
      }
    });
  }

  // Private helper methods

  private mapTemplateTypeToPDF(templateId: string): 'standard' | 'executive' | 'detailed' {
    if (templateId.includes('executive')) return 'executive';
    if (templateId.includes('detailed') || templateId.includes('cost-analysis')) return 'detailed';
    return 'standard';
  }

  private generateFilename(data: ServiceDeskData, template: ExportTemplate, format: string): string {
    const projectName = data.project.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const templateName = template.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const timestamp = new Date().toISOString().split('T')[0];
    
    const extension = format === 'excel' ? 'xlsx' : format;
    return `${projectName}-${templateName}-${timestamp}.${extension}`;
  }

  private async generateChecksum(blob: Blob): Promise<string> {
    try {
      const buffer = await blob.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.warn('Could not generate checksum:', error);
      return '';
    }
  }

  private recordExportHistory(result: ExportResult, data: ServiceDeskData, template: ExportTemplate): void {
    const historyId = `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const history: ExportHistory = {
      id: historyId,
      projectId: data.project.id,
      templateId: template.id,
      format: result.format,
      filename: result.filename,
      size: result.size,
      exportedAt: result.generatedAt,
      exportedBy: 'system',
      downloadCount: 0
    };

    this.exportHistory.set(historyId, history);

    // Keep only the last 100 exports to prevent memory issues
    if (this.exportHistory.size > 100) {
      const oldestKey = Array.from(this.exportHistory.keys())[0];
      this.exportHistory.delete(oldestKey);
    }
  }

  private estimateTemplateSize(template: ExportTemplate): string {
    const baseSizes: Record<string, number> = {
      pdf: 500, // KB
      excel: 200,
      json: 50,
      csv: 20
    };

    const sectionMultiplier = template.sections.length * 0.2;
    const estimatedSize = (baseSizes[template.format] || 100) * (1 + sectionMultiplier);

    if (estimatedSize < 1024) {
      return `~${Math.round(estimatedSize)} KB`;
    } else {
      return `~${Math.round(estimatedSize / 1024 * 10) / 10} MB`;
    }
  }

  private getTemplateRecommendations(template: ExportTemplate): string[] {
    const recommendations: string[] = [];

    if (template.id.includes('executive')) {
      recommendations.push('Apresentações para diretoria');
      recommendations.push('Relatórios executivos');
    }

    if (template.id.includes('cost') || template.id.includes('financial')) {
      recommendations.push('Análise financeira detalhada');
      recommendations.push('Controle de custos');
    }

    if (template.id.includes('technical')) {
      recommendations.push('Documentação técnica');
      recommendations.push('Especificações de projeto');
    }

    if (template.format === 'excel') {
      recommendations.push('Análise de dados');
      recommendations.push('Planilhas de controle');
    }

    if (template.format === 'json') {
      recommendations.push('Integração com sistemas');
      recommendations.push('Backup de dados');
    }

    return recommendations.length > 0 ? recommendations : ['Uso geral'];
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Record download event for analytics
   */
  recordDownload(historyId: string): void {
    const history = this.exportHistory.get(historyId);
    if (history) {
      history.downloadCount++;
      history.lastDownloaded = new Date();
      this.exportHistory.set(historyId, history);
    }
  }

  /**
   * Get export recommendations based on project data
   */
  getExportRecommendations(data: ServiceDeskData): Array<{
    templateId: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
  }> {
    const recommendations = [];

    // Executive summary for high-value projects
    if (data.budget.totalPrice > 100000) {
      recommendations.push({
        templateId: 'executive-summary',
        reason: 'Projeto de alto valor requer aprovação executiva',
        priority: 'high' as const
      });
    }

    // Detailed cost analysis for complex projects
    if (data.team.length > 10 || data.otherCosts.length > 5) {
      recommendations.push({
        templateId: 'cost-analysis',
        reason: 'Projeto complexo necessita análise detalhada de custos',
        priority: 'high' as const
      });
    }

    // Technical proposal for service desk projects
    if (data.schedules.length > 0) {
      recommendations.push({
        templateId: 'technical-proposal',
        reason: 'Escalas definidas permitem proposta técnica detalhada',
        priority: 'medium' as const
      });
    }

    // Financial analysis for projects with risk factors
    if (data.analysis.riskAnalysis.overallRisk === 'high') {
      recommendations.push({
        templateId: 'financial-analysis',
        reason: 'Alto risco requer análise financeira aprofundada',
        priority: 'high' as const
      });
    }

    return recommendations;
  }
}