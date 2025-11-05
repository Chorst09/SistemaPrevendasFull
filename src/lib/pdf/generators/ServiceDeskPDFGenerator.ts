/**
 * Gerador de PDF para propostas de Service Desk
 */

import { jsPDF } from 'jspdf'
import { ServiceDeskProposal } from '@/lib/types/service-desk'
import { calculateProposalTotals, calculateExpectedMetrics, calculateServiceDeskROI } from '@/lib/utils/service-desk-calculations'
import { ServiceDeskProposalTemplate } from '@/components/pdf-generation/templates/ServiceDeskProposalTemplate'
import { 
  EnhancedProposalData,
  ServiceDeskPDFOptions 
} from '@/lib/services/service-desk-pdf-integration'
import { ClientData, CompanyInfo } from '@/lib/types/pdf/core'
import { ExecutiveDashboard } from '@/lib/types/service-desk-pricing'
import { FallbackPDFTemplate, fallbackTemplateUtils } from '@/lib/services/pdf-fallback-templates'

export class ServiceDeskPDFGenerator {
  private doc: jsPDF
  private pageWidth: number
  private pageHeight: number
  private margin: number

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    this.margin = 20
  }

  /**
   * Gera PDF completo da proposta de Service Desk
   */
  async generateProposalPDF(proposal: ServiceDeskProposal): Promise<{ blob: Blob; url: string }> {
    try {
      // Check if this is an enhanced proposal with executive dashboard
      if (proposal.enhancedSections && proposal.executiveDashboard) {
        return this.generateEnhancedProposalPDF(proposal);
      }

      // Standard proposal generation (existing logic)
      // Página 1: Capa e Resumo Executivo
      this.addCoverPage(proposal)
      
      // Página 2: Detalhes dos Serviços
      this.doc.addPage()
      this.addServicesPage(proposal)
      
      // Página 3: SLAs e Métricas
      this.doc.addPage()
      this.addSLAPage(proposal)
      
      // Página 4: Análise Financeira
      this.doc.addPage()
      this.addFinancialPage(proposal)

      // Gerar blob e URL
      const pdfBlob = this.doc.output('blob')
      const pdfUrl = URL.createObjectURL(pdfBlob)

      return { blob: pdfBlob, url: pdfUrl }
    } catch (error) {
      console.error('Error generating Service Desk PDF:', error);
      
      // Fallback to simple template
      try {
        return this.generateFallbackPDF(proposal);
      } catch (fallbackError) {
        console.error('Fallback PDF generation also failed:', fallbackError);
        throw new Error(`Erro ao gerar PDF: ${error}`)
      }
    }
  }

  /**
   * Generates enhanced PDF with executive dashboard data
   */
  private async generateEnhancedProposalPDF(proposal: ServiceDeskProposal): Promise<{ blob: Blob; url: string }> {
    try {
      // Create enhanced proposal data structure
      const enhancedData: EnhancedProposalData = {
        equipments: [], // Will be mapped from service items
        totalMonthly: proposal.totals.monthlyCost,
        totalAnnual: proposal.totals.annualCost,
        contractPeriod: 12, // Default contract period
        generatedAt: new Date(),
        serviceDeskData: proposal.serviceDeskData || {} as any, // Fallback
        executiveDashboard: proposal.executiveDashboard,
        teamComposition: proposal.enhancedSections?.teamComposition || {} as any,
        scheduleAnalysis: proposal.enhancedSections?.scheduleAnalysis || {} as any,
        financialBreakdown: proposal.enhancedSections?.financialBreakdown || {} as any,
        riskAssessment: proposal.enhancedSections?.riskAssessment || {} as any,
        recommendations: proposal.enhancedSections?.recommendations || [],
        benchmarkAnalysis: proposal.enhancedSections?.benchmarkAnalysis || {} as any,
        approvalWorkflow: proposal.enhancedSections?.approvalWorkflow || {} as any
      };

      // Create client data
      const clientData: ClientData = {
        companyName: proposal.clientData.companyName,
        contactName: proposal.clientData.contactName,
        email: proposal.clientData.email,
        phone: proposal.clientData.phone,
        projectName: proposal.clientData.projectName,
        managerName: proposal.clientData.contactName,
        managerEmail: proposal.clientData.email,
        managerPhone: proposal.clientData.phone
      };

      // Create company info
      const companyInfo: CompanyInfo = {
        name: 'Service Desk Solutions',
        logo: '',
        address: 'Endereço da Empresa',
        phone: '(11) 9999-9999',
        email: 'contato@servicedesk.com',
        website: 'www.servicedesk.com'
      };

      // Use enhanced template
      const template = new ServiceDeskProposalTemplate(this.doc);
      template.render(enhancedData, clientData, companyInfo, proposal.executiveDashboard);

      // Generate blob and URL
      const pdfBlob = this.doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);

      return { blob: pdfBlob, url: pdfUrl };
    } catch (error) {
      throw new Error(`Erro ao gerar PDF aprimorado: ${error}`);
    }
  }

  /**
   * Adiciona página de capa
   */
  private addCoverPage(proposal: ServiceDeskProposal) {
    let yPos = 40

    // Título principal
    this.doc.setFontSize(24)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('PROPOSTA DE SERVICE DESK', this.pageWidth / 2, yPos, { align: 'center' })
    
    yPos += 20
    this.doc.setFontSize(16)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(proposal.clientData.projectName, this.pageWidth / 2, yPos, { align: 'center' })

    yPos += 30

    // Informações do cliente
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('DADOS DO CLIENTE', this.margin, yPos)
    
    yPos += 10
    this.doc.setFontSize(11)
    this.doc.setFont('helvetica', 'normal')
    
    const clientInfo = [
      `Empresa: ${proposal.clientData.companyName}`,
      `Contato: ${proposal.clientData.contactName}`,
      `Email: ${proposal.clientData.email}`,
      `Telefone: ${proposal.clientData.phone}`,
      `Funcionários: ${proposal.clientData.employeeCount}`,
      `Projeto: ${proposal.clientData.projectName}`
    ]

    clientInfo.forEach(info => {
      this.doc.text(info, this.margin, yPos)
      yPos += 6
    })

    yPos += 20

    // Resumo da proposta
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('RESUMO DA PROPOSTA', this.margin, yPos)
    
    yPos += 15

    // Box com totais
    this.doc.setDrawColor(0, 102, 204)
    this.doc.setFillColor(240, 248, 255)
    this.doc.rect(this.margin, yPos, this.pageWidth - (this.margin * 2), 60, 'FD')

    yPos += 15
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    
    const summaryInfo = [
      `Total de Usuários: ${proposal.totals.totalUsers}`,
      `Nível de Serviço: ${proposal.serviceLevel}`,
      `Custo de Setup: R$ ${proposal.totals.totalSetupCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `Custo Mensal: R$ ${proposal.totals.monthlyCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `Custo Anual: R$ ${proposal.totals.annualCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    ]

    summaryInfo.forEach(info => {
      this.doc.text(info, this.margin + 10, yPos)
      yPos += 8
    })

    // Data e validade
    yPos = this.pageHeight - 40
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, this.margin, yPos)
    this.doc.text(`Válida até: ${proposal.validUntil.toLocaleDateString('pt-BR')}`, this.margin, yPos + 6)
  }

  /**
   * Adiciona página de serviços
   */
  private addServicesPage(proposal: ServiceDeskProposal) {
    let yPos = 30

    this.doc.setFontSize(18)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('SERVIÇOS INCLUÍDOS', this.margin, yPos)

    yPos += 20

    proposal.serviceItems.forEach((service, index) => {
      // Cabeçalho do serviço
      this.doc.setFillColor(245, 245, 245)
      this.doc.rect(this.margin, yPos - 5, this.pageWidth - (this.margin * 2), 12, 'F')
      
      this.doc.setFontSize(12)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(`${index + 1}. ${service.serviceName}`, this.margin + 5, yPos + 3)

      yPos += 15

      // Detalhes do serviço
      this.doc.setFontSize(10)
      this.doc.setFont('helvetica', 'normal')
      
      const serviceDetails = [
        `Nível: ${service.serviceLevel}`,
        `Usuários: ${service.userCount}`,
        `Custo por usuário: R$ ${service.costPerUser.toFixed(2)}`,
        `Horas incluídas: ${service.includedHours}h por usuário/mês`,
        `Tickets estimados/mês: ${service.monthlyTickets}`,
        `Custo mensal: R$ ${service.monthlyCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      ]

      serviceDetails.forEach(detail => {
        this.doc.text(`• ${detail}`, this.margin + 10, yPos)
        yPos += 5
      })

      yPos += 10

      // Verificar se precisa de nova página
      if (yPos > this.pageHeight - 50) {
        this.doc.addPage()
        yPos = 30
      }
    })
  }

  /**
   * Adiciona página de SLAs
   */
  private addSLAPage(proposal: ServiceDeskProposal) {
    let yPos = 30

    this.doc.setFontSize(18)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('ACORDOS DE NÍVEL DE SERVIÇO (SLA)', this.margin, yPos)

    yPos += 20

    if (proposal.slaConfiguration && proposal.slaConfiguration.length > 0) {
      proposal.slaConfiguration.forEach((sla, index) => {
        this.doc.setFontSize(12)
        this.doc.setFont('helvetica', 'bold')
        this.doc.text(`${index + 1}. ${sla.name}`, this.margin, yPos)

        yPos += 8

        this.doc.setFontSize(10)
        this.doc.setFont('helvetica', 'normal')
        
        const slaDetails = [
          `Prioridade: ${sla.priority}`,
          `Categoria: ${sla.category}`,
          `Tempo de Resposta: ${sla.responseTime} minutos`,
          `Tempo de Resolução: ${sla.resolutionTime} horas`,
          `Horário: ${sla.businessHoursOnly ? 'Comercial' : '24x7'}`
        ]

        slaDetails.forEach(detail => {
          this.doc.text(`• ${detail}`, this.margin + 10, yPos)
          yPos += 5
        })

        yPos += 10
      })
    }

    // Métricas esperadas
    yPos += 10
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('MÉTRICAS ESPERADAS', this.margin, yPos)

    yPos += 15

    const metrics = calculateExpectedMetrics(proposal)
    
    this.doc.setFontSize(11)
    this.doc.setFont('helvetica', 'normal')
    
    const metricsInfo = [
      `Tempo Médio de Resolução: ${metrics.averageResolutionTime} horas`,
      `Resolução na Primeira Chamada: ${metrics.firstCallResolution}%`,
      `Satisfação do Cliente: ${metrics.customerSatisfaction}%`,
      `Compliance SLA: ${metrics.slaCompliance}%`,
      `Tickets Estimados/Mês: ${metrics.estimatedTicketsPerMonth}`,
      `Custo por Ticket: R$ ${metrics.costPerTicket.toFixed(2)}`
    ]

    metricsInfo.forEach(metric => {
      this.doc.text(`• ${metric}`, this.margin + 5, yPos)
      yPos += 6
    })
  }

  /**
   * Adiciona página financeira
   */
  private addFinancialPage(proposal: ServiceDeskProposal) {
    let yPos = 30

    this.doc.setFontSize(18)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('ANÁLISE FINANCEIRA', this.margin, yPos)

    yPos += 20

    // Tabela de custos
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('RESUMO DE CUSTOS', this.margin, yPos)

    yPos += 15

    // Cabeçalho da tabela
    this.doc.setFillColor(0, 102, 204)
    this.doc.setTextColor(255, 255, 255)
    this.doc.rect(this.margin, yPos - 5, this.pageWidth - (this.margin * 2), 10, 'F')
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('ITEM', this.margin + 5, yPos)
    this.doc.text('VALOR', this.pageWidth - this.margin - 40, yPos)

    yPos += 12
    this.doc.setTextColor(0, 0, 0)
    this.doc.setFont('helvetica', 'normal')

    const costItems = [
      ['Custo de Setup', `R$ ${proposal.totals.totalSetupCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
      ['Custo Mensal Base', `R$ ${proposal.totals.monthlyCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
      ['Horas Adicionais Estimadas', `R$ ${proposal.totals.additionalHoursCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
      ['Total Mensal', `R$ ${(proposal.totals.monthlyCost + proposal.totals.additionalHoursCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`],
      ['Total Anual', `R$ ${((proposal.totals.monthlyCost + proposal.totals.additionalHoursCost) * 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`]
    ]

    costItems.forEach(([item, value], index) => {
      if (index === costItems.length - 1) {
        this.doc.setFont('helvetica', 'bold')
        this.doc.setFillColor(240, 240, 240)
        this.doc.rect(this.margin, yPos - 3, this.pageWidth - (this.margin * 2), 8, 'F')
      }
      
      this.doc.text(item, this.margin + 5, yPos)
      this.doc.text(value, this.pageWidth - this.margin - 40, yPos)
      yPos += 8
    })

    // ROI Analysis
    yPos += 20
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('ANÁLISE DE RETORNO (ROI)', this.margin, yPos)

    yPos += 15

    const roi = calculateServiceDeskROI(proposal)
    
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'normal')
    
    const roiInfo = [
      `Economia Mensal Estimada: R$ ${roi.monthlySavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `Economia Anual Estimada: R$ ${roi.annualSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `ROI Anual: ${roi.roiPercentage.toFixed(1)}%`,
      `Payback: ${roi.paybackPeriodMonths} meses`
    ]

    roiInfo.forEach(info => {
      this.doc.text(`• ${info}`, this.margin + 5, yPos)
      yPos += 6
    })

    // Observações finais
    yPos += 20
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'italic')
    this.doc.text('* Valores estimados baseados em métricas da indústria', this.margin, yPos)
    this.doc.text('* ROI calculado considerando redução de custos internos de TI', this.margin, yPos + 6)
    this.doc.text('* Proposta válida por 30 dias', this.margin, yPos + 12)
  }

  /**
   * Generates fallback PDF when enhanced generation fails
   */
  private async generateFallbackPDF(proposal: ServiceDeskProposal): Promise<{ blob: Blob; url: string }> {
    console.log('Generating fallback PDF for Service Desk proposal');
    
    // Create new document for fallback
    const fallbackDoc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Create fallback template
    const fallbackTemplate = fallbackTemplateUtils.createSafeFallback(fallbackDoc);
    
    // Convert Service Desk proposal to basic proposal data
    const proposalData = {
      equipments: proposal.serviceItems.map((item, index) => ({
        id: `service-${index}`,
        model: item.serviceName,
        brand: 'Service Desk',
        type: item.serviceLevel,
        monthlyVolume: item.userCount,
        monthlyCost: item.monthlyCost,
        specifications: {
          includedHours: item.includedHours,
          monthlyTickets: item.monthlyTickets
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })),
      totalMonthly: proposal.totals.monthlyCost,
      totalAnnual: proposal.totals.annualCost,
      contractPeriod: 12,
      generatedAt: new Date()
    };

    const clientData = {
      companyName: proposal.clientData.companyName,
      contactName: proposal.clientData.contactName,
      email: proposal.clientData.email,
      phone: proposal.clientData.phone,
      projectName: proposal.clientData.projectName,
      managerName: proposal.clientData.managerName,
      managerEmail: proposal.clientData.managerEmail,
      managerPhone: proposal.clientData.managerPhone
    };

    const companyInfo = {
      name: 'Service Desk Solutions',
      logo: '',
      address: 'Endereço da Empresa',
      phone: '(11) 9999-9999',
      email: 'contato@servicedesk.com',
      website: 'www.servicedesk.com'
    };

    // Render fallback template
    fallbackTemplate.render(proposalData, clientData, companyInfo);

    // Generate blob and URL
    const pdfBlob = fallbackDoc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

    return { blob: pdfBlob, url: pdfUrl };
  }
}

/**
 * Função utilitária para gerar PDF de proposta
 */
export async function generateServiceDeskProposalPDF(proposal: ServiceDeskProposal): Promise<{ blob: Blob; url: string }> {
  const generator = new ServiceDeskPDFGenerator()
  return await generator.generateProposalPDF(proposal)
}