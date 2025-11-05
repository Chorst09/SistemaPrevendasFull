import { PDFError, PDFErrorType } from '../../types/pdf/errors'
import { ProposalData, ClientData } from '../../types/pdf/core'

/**
 * Comprehensive error handling utilities for PDF generation
 */
export class PDFErrorHandler {
  private static instance: PDFErrorHandler
  private errorLog: PDFError[] = []
  private maxLogSize = 50

  private constructor() {}

  static getInstance(): PDFErrorHandler {
    if (!PDFErrorHandler.instance) {
      PDFErrorHandler.instance = new PDFErrorHandler()
    }
    return PDFErrorHandler.instance
  }

  /**
   * Create a standardized PDF error
   */
  createError(type: PDFErrorType, message: string, details?: any): PDFError {
    const error: PDFError = {
      type,
      message,
      details: {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        ...details
      }
    }

    this.logError(error)
    return error
  }

  /**
   * Log error for debugging and analytics
   */
  private logError(error: PDFError): void {
    this.errorLog.unshift(error)
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('PDF Error:', error)
    }

    // In production, you might want to send to analytics service
    // this.sendToAnalytics(error)
  }

  /**
   * Get recent error log
   */
  getErrorLog(): PDFError[] {
    return [...this.errorLog]
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = []
  }

  /**
   * Check if browser supports PDF generation
   */
  checkBrowserCompatibility(): { supported: boolean; issues: string[] } {
    const issues: string[] = []

    // Check for required APIs
    if (!window.Blob) {
      issues.push('Blob API não suportada')
    }

    if (!window.URL || !window.URL.createObjectURL) {
      issues.push('URL.createObjectURL não suportado')
    }

    if (!window.indexedDB) {
      issues.push('IndexedDB não suportado')
    }

    // Check for Canvas support (needed for html2canvas)
    const canvas = document.createElement('canvas')
    if (!canvas.getContext || !canvas.getContext('2d')) {
      issues.push('Canvas 2D não suportado')
    }

    // Check for File API
    if (!window.File || !window.FileReader) {
      issues.push('File API não suportada')
    }

    // Check for modern JavaScript features
    try {
      // Test for Promise support
      new Promise(() => {})
      
      // Test for async/await support
      eval('(async () => {})')
    } catch (e) {
      issues.push('JavaScript moderno não suportado')
    }

    return {
      supported: issues.length === 0,
      issues
    }
  }

  /**
   * Validate proposal data before PDF generation
   */
  validateProposalData(proposalData: ProposalData): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check required fields
    if (!proposalData) {
      errors.push('Dados da proposta não fornecidos')
      return { valid: false, errors }
    }

    if (!proposalData.equipments || proposalData.equipments.length === 0) {
      errors.push('Nenhum equipamento selecionado')
    }

    if (typeof proposalData.totalMonthly !== 'number' || proposalData.totalMonthly <= 0) {
      errors.push('Valor mensal inválido')
    }

    if (typeof proposalData.totalAnnual !== 'number' || proposalData.totalAnnual <= 0) {
      errors.push('Valor anual inválido')
    }

    if (typeof proposalData.contractPeriod !== 'number' || proposalData.contractPeriod <= 0) {
      errors.push('Período do contrato inválido')
    }

    if (!proposalData.generatedAt || !(proposalData.generatedAt instanceof Date)) {
      errors.push('Data de geração inválida')
    }

    // Validate equipment data
    proposalData.equipments?.forEach((equipment, index) => {
      if (!equipment.id) {
        errors.push(`Equipamento ${index + 1}: ID não fornecido`)
      }

      if (!equipment.model || equipment.model.trim() === '') {
        errors.push(`Equipamento ${index + 1}: Modelo não fornecido`)
      }

      if (!equipment.brand || equipment.brand.trim() === '') {
        errors.push(`Equipamento ${index + 1}: Marca não fornecida`)
      }

      if (!equipment.type || equipment.type.trim() === '') {
        errors.push(`Equipamento ${index + 1}: Tipo não fornecido`)
      }

      if (typeof equipment.monthlyVolume !== 'number' || equipment.monthlyVolume < 0) {
        errors.push(`Equipamento ${index + 1}: Volume mensal inválido`)
      }

      if (typeof equipment.monthlyCost !== 'number' || equipment.monthlyCost < 0) {
        errors.push(`Equipamento ${index + 1}: Custo mensal inválido`)
      }
    })

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate client data before PDF generation
   */
  validateClientData(clientData: ClientData): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!clientData) {
      errors.push('Dados do cliente não fornecidos')
      return { valid: false, errors }
    }

    // Required fields
    if (!clientData.companyName || clientData.companyName.trim() === '') {
      errors.push('Nome da empresa é obrigatório')
    }

    if (!clientData.contactName || clientData.contactName.trim() === '') {
      errors.push('Nome do contato é obrigatório')
    }

    if (!clientData.projectName || clientData.projectName.trim() === '') {
      errors.push('Nome do projeto é obrigatório')
    }

    // Email validation
    if (clientData.email && !this.isValidEmail(clientData.email)) {
      errors.push('Email inválido')
    }

    if (clientData.managerEmail && !this.isValidEmail(clientData.managerEmail)) {
      errors.push('Email do gerente inválido')
    }

    // Phone validation
    if (clientData.phone && !this.isValidPhone(clientData.phone)) {
      errors.push('Telefone inválido')
    }

    if (clientData.managerPhone && !this.isValidPhone(clientData.managerPhone)) {
      errors.push('Telefone do gerente inválido')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Simple email validation
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Simple phone validation (Brazilian format)
   */
  private isValidPhone(phone: string): boolean {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '')
    
    // Brazilian phone: 10 or 11 digits
    return digits.length >= 10 && digits.length <= 11
  }

  /**
   * Check PDF size limits
   */
  checkPDFSizeLimits(equipmentCount: number): { withinLimits: boolean; warnings: string[] } {
    const warnings: string[] = []
    let withinLimits = true

    // Warn about large PDFs
    if (equipmentCount > 50) {
      warnings.push('Muitos equipamentos podem resultar em PDF muito grande')
      withinLimits = false
    }

    if (equipmentCount > 100) {
      warnings.push('PDF pode falhar com mais de 100 equipamentos')
      withinLimits = false
    }

    return { withinLimits, warnings }
  }

  /**
   * Get fallback options for failed PDF generation
   */
  getFallbackOptions(error: PDFError): Array<{
    label: string
    action: string
    description: string
  }> {
    const options = []

    switch (error.type) {
      case PDFErrorType.GENERATION_FAILED:
        options.push(
          {
            label: 'Tentar Template Simples',
            action: 'simple_template',
            description: 'Gerar PDF com template simplificado'
          },
          {
            label: 'Reduzir Equipamentos',
            action: 'reduce_equipment',
            description: 'Gerar PDF com menos equipamentos por página'
          }
        )
        break

      case PDFErrorType.STORAGE_FAILED:
        options.push(
          {
            label: 'Download Direto',
            action: 'direct_download',
            description: 'Baixar PDF sem salvar no navegador'
          },
          {
            label: 'Limpar Cache',
            action: 'clear_cache',
            description: 'Limpar dados salvos e tentar novamente'
          }
        )
        break

      case PDFErrorType.BROWSER_NOT_SUPPORTED:
        options.push(
          {
            label: 'Exportar Dados',
            action: 'export_data',
            description: 'Exportar dados em formato JSON'
          },
          {
            label: 'Copiar Informações',
            action: 'copy_text',
            description: 'Copiar informações como texto'
          }
        )
        break

      case PDFErrorType.INVALID_DATA:
        options.push(
          {
            label: 'Corrigir Dados',
            action: 'fix_data',
            description: 'Voltar ao formulário para corrigir'
          },
          {
            label: 'Usar Dados Padrão',
            action: 'use_defaults',
            description: 'Preencher campos vazios com valores padrão'
          }
        )
        break
    }

    return options
  }

  /**
   * Attempt to recover from error with fallback strategy
   */
  async attemptRecovery(
    error: PDFError,
    strategy: string,
    proposalData: ProposalData,
    clientData: ClientData
  ): Promise<{ success: boolean; result?: any; newError?: PDFError }> {
    try {
      switch (strategy) {
        case 'simple_template':
          return await this.generateSimplePDF(proposalData, clientData)

        case 'direct_download':
          return await this.generateDirectDownload(proposalData, clientData)

        case 'reduce_equipment':
          return await this.generateReducedPDF(proposalData, clientData)

        case 'export_data':
          return this.exportAsJSON(proposalData, clientData)

        case 'copy_text':
          return this.copyAsText(proposalData, clientData)

        case 'use_defaults':
          return await this.generateWithDefaults(proposalData, clientData)

        default:
          return {
            success: false,
            newError: this.createError(
              PDFErrorType.GENERATION_FAILED,
              'Estratégia de recuperação não reconhecida'
            )
          }
      }
    } catch (recoveryError) {
      return {
        success: false,
        newError: this.createError(
          PDFErrorType.GENERATION_FAILED,
          'Falha na tentativa de recuperação',
          recoveryError
        )
      }
    }
  }

  /**
   * Generate simple PDF fallback
   */
  private async generateSimplePDF(
    proposalData: ProposalData,
    clientData: ClientData
  ): Promise<{ success: boolean; result?: any }> {
    // This would use a simplified template
    // Implementation would depend on having a SimpleProposalTemplate
    return { success: false } // Placeholder
  }

  /**
   * Generate PDF for direct download without storage
   */
  private async generateDirectDownload(
    proposalData: ProposalData,
    clientData: ClientData
  ): Promise<{ success: boolean; result?: any }> {
    // This would generate PDF and trigger immediate download
    return { success: false } // Placeholder
  }

  /**
   * Generate PDF with reduced equipment per page
   */
  private async generateReducedPDF(
    proposalData: ProposalData,
    clientData: ClientData
  ): Promise<{ success: boolean; result?: any }> {
    // This would split equipment across multiple pages
    return { success: false } // Placeholder
  }

  /**
   * Export data as JSON
   */
  private exportAsJSON(
    proposalData: ProposalData,
    clientData: ClientData
  ): { success: boolean; result: any } {
    const data = {
      proposalData,
      clientData,
      exportedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `proposta-${clientData.companyName}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    return { success: true, result: 'Dados exportados como JSON' }
  }

  /**
   * Copy data as formatted text
   */
  private copyAsText(
    proposalData: ProposalData,
    clientData: ClientData
  ): { success: boolean; result: any } {
    const text = this.formatAsText(proposalData, clientData)
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
      return { success: true, result: 'Dados copiados para a área de transferência' }
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return { success: true, result: 'Dados copiados para a área de transferência' }
    }
  }

  /**
   * Generate PDF with default values for missing data
   */
  private async generateWithDefaults(
    proposalData: ProposalData,
    clientData: ClientData
  ): Promise<{ success: boolean; result?: any }> {
    // Fill in missing data with defaults
    const defaultedClientData = {
      companyName: clientData.companyName || 'Cliente',
      contactName: clientData.contactName || 'Contato',
      email: clientData.email || 'email@cliente.com',
      phone: clientData.phone || '(11) 9999-9999',
      projectName: clientData.projectName || 'Projeto de Outsourcing',
      managerName: clientData.managerName || clientData.contactName || 'Gerente',
      managerEmail: clientData.managerEmail || clientData.email || 'gerente@cliente.com',
      managerPhone: clientData.managerPhone || clientData.phone || '(11) 9999-9999'
    }

    return { success: false, result: defaultedClientData } // Placeholder
  }

  /**
   * Format proposal data as readable text
   */
  private formatAsText(proposalData: ProposalData, clientData: ClientData): string {
    const lines = [
      '=== PROPOSTA DE OUTSOURCING DE IMPRESSÃO ===',
      '',
      '--- DADOS DO CLIENTE ---',
      `Empresa: ${clientData.companyName}`,
      `Contato: ${clientData.contactName}`,
      `Email: ${clientData.email}`,
      `Telefone: ${clientData.phone}`,
      `Projeto: ${clientData.projectName}`,
      '',
      '--- EQUIPAMENTOS ---'
    ]

    proposalData.equipments.forEach((equipment, index) => {
      lines.push(`${index + 1}. ${equipment.brand} ${equipment.model}`)
      lines.push(`   Tipo: ${equipment.type}`)
      lines.push(`   Volume Mensal: ${equipment.monthlyVolume.toLocaleString()} páginas`)
      lines.push(`   Custo Mensal: R$ ${equipment.monthlyCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
      lines.push('')
    })

    lines.push('--- RESUMO FINANCEIRO ---')
    lines.push(`Total Mensal: R$ ${proposalData.totalMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
    lines.push(`Total Anual: R$ ${proposalData.totalAnnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
    lines.push(`Período do Contrato: ${proposalData.contractPeriod} meses`)
    lines.push('')
    lines.push(`Gerado em: ${proposalData.generatedAt.toLocaleString('pt-BR')}`)

    return lines.join('\n')
  }
}

// Export singleton instance
export const pdfErrorHandler = PDFErrorHandler.getInstance()

// Export utility functions
export const createPDFError = (type: PDFErrorType, message: string, details?: any): PDFError => {
  return pdfErrorHandler.createError(type, message, details)
}

export const validatePDFData = (proposalData: ProposalData, clientData: ClientData) => {
  const proposalValidation = pdfErrorHandler.validateProposalData(proposalData)
  const clientValidation = pdfErrorHandler.validateClientData(clientData)
  
  return {
    valid: proposalValidation.valid && clientValidation.valid,
    errors: [...proposalValidation.errors, ...clientValidation.errors]
  }
}

export const checkBrowserSupport = () => {
  return pdfErrorHandler.checkBrowserCompatibility()
}