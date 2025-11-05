/**
 * PDF Fallback Templates
 * Provides fallback functionality for existing PDF templates
 * Ensures backward compatibility when enhanced features fail
 */

import { jsPDF } from 'jspdf';
import { 
  ProposalData, 
  ClientData, 
  CompanyInfo,
  EquipmentItem 
} from '@/lib/types/pdf/core';

/**
 * Fallback template configuration
 */
export interface FallbackTemplateConfig {
  useSimpleLayout: boolean;
  includeBasicInfo: boolean;
  includeEquipmentList: boolean;
  includeTotals: boolean;
  includeTerms: boolean;
  errorRecoveryMode: boolean;
}

/**
 * Simple fallback PDF template
 * Used when enhanced templates fail or are unavailable
 */
export class FallbackPDFTemplate {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;
  private config: FallbackTemplateConfig;

  constructor(doc: jsPDF, config: Partial<FallbackTemplateConfig> = {}) {
    this.doc = doc;
    this.pageWidth = doc.internal.pageSize.getWidth();
    this.pageHeight = doc.internal.pageSize.getHeight();
    this.margin = 20;
    this.currentY = this.margin;
    
    this.config = {
      useSimpleLayout: true,
      includeBasicInfo: true,
      includeEquipmentList: true,
      includeTotals: true,
      includeTerms: true,
      errorRecoveryMode: false,
      ...config
    };
  }

  /**
   * Renders a simple, reliable PDF proposal
   */
  render(
    proposalData: ProposalData,
    clientData: ClientData,
    companyInfo: CompanyInfo
  ): void {
    try {
      // Header
      this.renderHeader(companyInfo);
      
      // Client information
      if (this.config.includeBasicInfo) {
        this.renderClientInfo(clientData);
      }
      
      // Equipment list
      if (this.config.includeEquipmentList && proposalData.equipments.length > 0) {
        this.renderEquipmentList(proposalData.equipments);
      }
      
      // Totals
      if (this.config.includeTotals) {
        this.renderTotals(proposalData);
      }
      
      // Terms
      if (this.config.includeTerms) {
        this.renderBasicTerms();
      }
      
      // Footer
      this.renderFooter(companyInfo);
      
    } catch (error) {
      console.error('Error in fallback template:', error);
      
      if (!this.config.errorRecoveryMode) {
        // Try minimal recovery mode
        this.renderMinimalProposal(proposalData, clientData, companyInfo);
      }
    }
  }

  /**
   * Renders minimal proposal in case of errors
   */
  private renderMinimalProposal(
    proposalData: ProposalData,
    clientData: ClientData,
    companyInfo: CompanyInfo
  ): void {
    try {
      this.doc.setFontSize(16);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('PROPOSTA COMERCIAL', this.pageWidth / 2, 40, { align: 'center' });
      
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`Cliente: ${clientData.companyName}`, this.margin, 60);
      this.doc.text(`Projeto: ${clientData.projectName}`, this.margin, 70);
      this.doc.text(`Valor Total: R$ ${proposalData.totalAnnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, this.margin, 80);
      this.doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, this.margin, 90);
      
    } catch (error) {
      console.error('Critical error in minimal template:', error);
      // Last resort - just add basic text
      this.doc.text('Erro na geração do PDF', this.margin, 40);
    }
  }

  private renderHeader(companyInfo: CompanyInfo): void {
    try {
      // Company name
      this.doc.setFontSize(18);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(companyInfo.name, this.margin, this.currentY);
      
      this.currentY += 10;
      
      // Contact info
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`${companyInfo.phone} | ${companyInfo.email}`, this.margin, this.currentY);
      
      this.currentY += 20;
      
      // Title
      this.doc.setFontSize(16);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('PROPOSTA COMERCIAL', this.pageWidth / 2, this.currentY, { align: 'center' });
      
      this.currentY += 20;
      
    } catch (error) {
      console.error('Error rendering header:', error);
      this.currentY += 40; // Skip header section
    }
  }

  private renderClientInfo(clientData: ClientData): void {
    try {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('DADOS DO CLIENTE', this.margin, this.currentY);
      
      this.currentY += 10;
      
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      
      const clientInfo = [
        `Empresa: ${clientData.companyName}`,
        `Contato: ${clientData.contactName}`,
        `Email: ${clientData.email}`,
        `Telefone: ${clientData.phone}`,
        `Projeto: ${clientData.projectName}`
      ];
      
      clientInfo.forEach(info => {
        this.doc.text(info, this.margin, this.currentY);
        this.currentY += 6;
      });
      
      this.currentY += 10;
      
    } catch (error) {
      console.error('Error rendering client info:', error);
      this.currentY += 50; // Skip section
    }
  }

  private renderEquipmentList(equipments: EquipmentItem[]): void {
    try {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('ITENS DA PROPOSTA', this.margin, this.currentY);
      
      this.currentY += 15;
      
      // Simple table header
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Item', this.margin, this.currentY);
      this.doc.text('Modelo', this.margin + 40, this.currentY);
      this.doc.text('Tipo', this.margin + 80, this.currentY);
      this.doc.text('Valor Mensal', this.margin + 120, this.currentY);
      
      this.currentY += 8;
      
      // Draw line
      this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
      this.currentY += 5;
      
      // Equipment rows
      this.doc.setFont('helvetica', 'normal');
      equipments.forEach((equipment, index) => {
        if (this.currentY > this.pageHeight - 50) {
          this.doc.addPage();
          this.currentY = this.margin;
        }
        
        this.doc.text(`${index + 1}`, this.margin, this.currentY);
        this.doc.text(equipment.model, this.margin + 40, this.currentY);
        this.doc.text(equipment.type, this.margin + 80, this.currentY);
        this.doc.text(`R$ ${equipment.monthlyCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, this.margin + 120, this.currentY);
        
        this.currentY += 6;
      });
      
      this.currentY += 10;
      
    } catch (error) {
      console.error('Error rendering equipment list:', error);
      this.currentY += 100; // Skip section
    }
  }

  private renderTotals(proposalData: ProposalData): void {
    try {
      // Draw box for totals
      const boxHeight = 40;
      this.doc.setDrawColor(0, 0, 0);
      this.doc.rect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), boxHeight);
      
      this.currentY += 10;
      
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('RESUMO FINANCEIRO', this.margin + 10, this.currentY);
      
      this.currentY += 10;
      
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`Valor Mensal: R$ ${proposalData.totalMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, this.margin + 10, this.currentY);
      
      this.currentY += 8;
      
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`Valor Total (${proposalData.contractPeriod} meses): R$ ${proposalData.totalAnnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, this.margin + 10, this.currentY);
      
      this.currentY += 20;
      
    } catch (error) {
      console.error('Error rendering totals:', error);
      this.currentY += 60; // Skip section
    }
  }

  private renderBasicTerms(): void {
    try {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('CONDIÇÕES GERAIS', this.margin, this.currentY);
      
      this.currentY += 10;
      
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      
      const terms = [
        '• Proposta válida por 30 dias',
        '• Valores sujeitos a alteração sem aviso prévio',
        '• Condições de pagamento a combinar',
        '• Início dos serviços após assinatura do contrato'
      ];
      
      terms.forEach(term => {
        this.doc.text(term, this.margin, this.currentY);
        this.currentY += 6;
      });
      
      this.currentY += 10;
      
    } catch (error) {
      console.error('Error rendering terms:', error);
      this.currentY += 40; // Skip section
    }
  }

  private renderFooter(companyInfo: CompanyInfo): void {
    try {
      const footerY = this.pageHeight - 20;
      
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`${companyInfo.name} - ${companyInfo.website}`, this.pageWidth / 2, footerY, { align: 'center' });
      this.doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, this.pageWidth / 2, footerY + 6, { align: 'center' });
      
    } catch (error) {
      console.error('Error rendering footer:', error);
      // Footer is not critical, continue
    }
  }
}

/**
 * Legacy template adapter
 * Ensures existing templates continue to work
 */
export class LegacyTemplateAdapter {
  private fallbackTemplate: FallbackPDFTemplate;

  constructor(doc: jsPDF) {
    this.fallbackTemplate = new FallbackPDFTemplate(doc, {
      useSimpleLayout: true,
      errorRecoveryMode: true
    });
  }

  /**
   * Adapts legacy template calls to new system
   */
  render(
    proposalData: ProposalData,
    clientData: ClientData,
    companyInfo: CompanyInfo,
    templateType: string = 'standard'
  ): void {
    
    try {
      // Try to use appropriate template based on type
      switch (templateType) {
        case 'professional':
        case 'detailed':
          this.renderProfessionalTemplate(proposalData, clientData, companyInfo);
          break;
        case 'simple':
          this.renderSimpleTemplate(proposalData, clientData, companyInfo);
          break;
        default:
          this.fallbackTemplate.render(proposalData, clientData, companyInfo);
      }
    } catch (error) {
      console.error('Legacy template adapter error:', error);
      // Always fall back to basic template
      this.fallbackTemplate.render(proposalData, clientData, companyInfo);
    }
  }

  private renderProfessionalTemplate(
    proposalData: ProposalData,
    clientData: ClientData,
    companyInfo: CompanyInfo
  ): void {
    // Enhanced fallback with more professional styling
    const enhancedConfig: FallbackTemplateConfig = {
      useSimpleLayout: false,
      includeBasicInfo: true,
      includeEquipmentList: true,
      includeTotals: true,
      includeTerms: true,
      errorRecoveryMode: false
    };
    
    const professionalTemplate = new FallbackPDFTemplate(this.fallbackTemplate['doc'], enhancedConfig);
    professionalTemplate.render(proposalData, clientData, companyInfo);
  }

  private renderSimpleTemplate(
    proposalData: ProposalData,
    clientData: ClientData,
    companyInfo: CompanyInfo
  ): void {
    // Minimal template for simple proposals
    const simpleConfig: FallbackTemplateConfig = {
      useSimpleLayout: true,
      includeBasicInfo: true,
      includeEquipmentList: false,
      includeTotals: true,
      includeTerms: false,
      errorRecoveryMode: false
    };
    
    const simpleTemplate = new FallbackPDFTemplate(this.fallbackTemplate['doc'], simpleConfig);
    simpleTemplate.render(proposalData, clientData, companyInfo);
  }
}

/**
 * Template migration utilities
 */
export class TemplateMigrationUtils {
  
  /**
   * Migrates old template configurations to new format
   */
  static migrateTemplateConfig(oldConfig: any): FallbackTemplateConfig {
    return {
      useSimpleLayout: oldConfig.layout !== 'complex',
      includeBasicInfo: oldConfig.includeClientInfo !== false,
      includeEquipmentList: oldConfig.includeItems !== false,
      includeTotals: oldConfig.includeTotals !== false,
      includeTerms: oldConfig.includeTerms !== false,
      errorRecoveryMode: false
    };
  }

  /**
   * Checks if template needs migration
   */
  static needsMigration(templateVersion: string): boolean {
    const currentVersion = '2.0.0';
    return templateVersion < currentVersion;
  }

  /**
   * Provides migration path for templates
   */
  static getMigrationPath(fromVersion: string, toVersion: string): string[] {
    const migrations = [];
    
    if (fromVersion < '1.5.0') {
      migrations.push('Update color scheme');
      migrations.push('Migrate font settings');
    }
    
    if (fromVersion < '2.0.0') {
      migrations.push('Add enhanced sections support');
      migrations.push('Update layout structure');
    }
    
    return migrations;
  }
}

/**
 * Utility functions for fallback templates
 */
export const fallbackTemplateUtils = {
  /**
   * Creates a safe fallback template
   */
  createSafeFallback(doc: jsPDF): FallbackPDFTemplate {
    return new FallbackPDFTemplate(doc, {
      useSimpleLayout: true,
      includeBasicInfo: true,
      includeEquipmentList: true,
      includeTotals: true,
      includeTerms: true,
      errorRecoveryMode: true
    });
  },

  /**
   * Creates legacy adapter
   */
  createLegacyAdapter(doc: jsPDF): LegacyTemplateAdapter {
    return new LegacyTemplateAdapter(doc);
  },

  /**
   * Validates template compatibility
   */
  validateCompatibility(templateName: string, version: string): boolean {
    const supportedTemplates = ['standard', 'professional', 'simple', 'enhanced'];
    const supportedVersions = ['1.0.0', '1.5.0', '2.0.0'];
    
    return supportedTemplates.includes(templateName) && supportedVersions.includes(version);
  }
};