import { ProposalData, ClientData } from '../../types/pdf/core'
import { PDFError, PDFErrorType } from '../../types/pdf/errors'
import { pdfErrorHandler } from './error-handling'

/**
 * Advanced validation rules and constraints for PDF generation
 */
export interface ValidationRule<T> {
  name: string
  validate: (data: T) => ValidationResult
  severity: 'error' | 'warning' | 'info'
  autoFix?: (data: T) => T
}

export interface ValidationResult {
  valid: boolean
  message?: string
  details?: any
  suggestedFix?: string
}

export interface ValidationReport {
  valid: boolean
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
  infos: ValidationIssue[]
  canAutoFix: boolean
  fixedData?: {
    proposalData?: ProposalData
    clientData?: ClientData
  }
}

export interface ValidationIssue {
  rule: string
  message: string
  severity: 'error' | 'warning' | 'info'
  field?: string
  suggestedFix?: string
  autoFixAvailable: boolean
}

/**
 * Advanced PDF validation system
 */
export class AdvancedPDFValidator {
  private static instance: AdvancedPDFValidator
  private proposalRules: ValidationRule<ProposalData>[] = []
  private clientRules: ValidationRule<ClientData>[] = []

  private constructor() {
    this.initializeRules()
  }

  static getInstance(): AdvancedPDFValidator {
    if (!AdvancedPDFValidator.instance) {
      AdvancedPDFValidator.instance = new AdvancedPDFValidator()
    }
    return AdvancedPDFValidator.instance
  }

  /**
   * Initialize all validation rules
   */
  private initializeRules(): void {
    this.initializeProposalRules()
    this.initializeClientRules()
  }

  /**
   * Initialize proposal data validation rules
   */
  private initializeProposalRules(): void {
    // Equipment count validation
    this.proposalRules.push({
      name: 'equipment_count',
      severity: 'warning',
      validate: (data: ProposalData) => {
        if (data.equipments.length > 20) {
          return {
            valid: false,
            message: `Muitos equipamentos (${data.equipments.length}). PDFs com mais de 20 equipamentos podem ser lentos para gerar.`,
            suggestedFix: 'Considere dividir em múltiplas propostas ou usar paginação'
          }
        }
        if (data.equipments.length > 50) {
          return {
            valid: false,
            message: `Excesso de equipamentos (${data.equipments.length}). Limite recomendado: 50 equipamentos.`,
            suggestedFix: 'Divida em múltiplas propostas menores'
          }
        }
        return { valid: true }
      }
    })

    // Financial validation
    this.proposalRules.push({
      name: 'financial_consistency',
      severity: 'error',
      validate: (data: ProposalData) => {
        const calculatedMonthly = data.equipments.reduce((sum, eq) => sum + eq.monthlyCost, 0)
        const tolerance = 0.01 // R$ 0.01 tolerance for floating point
        
        if (Math.abs(calculatedMonthly - data.totalMonthly) > tolerance) {
          return {
            valid: false,
            message: `Total mensal inconsistente. Calculado: R$ ${calculatedMonthly.toFixed(2)}, Informado: R$ ${data.totalMonthly.toFixed(2)}`,
            suggestedFix: 'Recalcular totais automaticamente'
          }
        }

        const expectedAnnual = data.totalMonthly * 12
        if (Math.abs(expectedAnnual - data.totalAnnual) > tolerance) {
          return {
            valid: false,
            message: `Total anual inconsistente. Esperado: R$ ${expectedAnnual.toFixed(2)}, Informado: R$ ${data.totalAnnual.toFixed(2)}`,
            suggestedFix: 'Recalcular total anual (mensal × 12)'
          }
        }

        return { valid: true }
      },
      autoFix: (data: ProposalData) => {
        const calculatedMonthly = data.equipments.reduce((sum, eq) => sum + eq.monthlyCost, 0)
        return {
          ...data,
          totalMonthly: calculatedMonthly,
          totalAnnual: calculatedMonthly * 12
        }
      }
    })

    // Contract period validation
    this.proposalRules.push({
      name: 'contract_period',
      severity: 'warning',
      validate: (data: ProposalData) => {
        if (data.contractPeriod < 12) {
          return {
            valid: false,
            message: `Período de contrato muito curto (${data.contractPeriod} meses). Mínimo recomendado: 12 meses.`,
            suggestedFix: 'Considere um período mínimo de 12 meses'
          }
        }
        if (data.contractPeriod > 60) {
          return {
            valid: false,
            message: `Período de contrato muito longo (${data.contractPeriod} meses). Máximo recomendado: 60 meses.`,
            suggestedFix: 'Considere um período máximo de 60 meses'
          }
        }
        return { valid: true }
      }
    })

    // Equipment data validation
    this.proposalRules.push({
      name: 'equipment_data_quality',
      severity: 'error',
      validate: (data: ProposalData) => {
        const issues: string[] = []
        
        data.equipments.forEach((equipment, index) => {
          // Check for suspicious values
          if (equipment.monthlyCost <= 0) {
            issues.push(`Equipamento ${index + 1}: Custo mensal deve ser maior que zero`)
          }
          
          if (equipment.monthlyCost > 10000) {
            issues.push(`Equipamento ${index + 1}: Custo mensal muito alto (R$ ${equipment.monthlyCost.toFixed(2)})`)
          }
          
          if (equipment.monthlyVolume <= 0) {
            issues.push(`Equipamento ${index + 1}: Volume mensal deve ser maior que zero`)
          }
          
          if (equipment.monthlyVolume > 100000) {
            issues.push(`Equipamento ${index + 1}: Volume mensal muito alto (${equipment.monthlyVolume.toLocaleString()} páginas)`)
          }

          // Check for missing critical data
          if (!equipment.model || equipment.model.trim().length < 2) {
            issues.push(`Equipamento ${index + 1}: Modelo deve ter pelo menos 2 caracteres`)
          }
          
          if (!equipment.brand || equipment.brand.trim().length < 2) {
            issues.push(`Equipamento ${index + 1}: Marca deve ter pelo menos 2 caracteres`)
          }
        })

        if (issues.length > 0) {
          return {
            valid: false,
            message: `Problemas nos dados dos equipamentos: ${issues.join('; ')}`,
            details: issues
          }
        }

        return { valid: true }
      }
    })

    // Duplicate equipment detection
    this.proposalRules.push({
      name: 'duplicate_equipment',
      severity: 'warning',
      validate: (data: ProposalData) => {
        const seen = new Set<string>()
        const duplicates: string[] = []

        data.equipments.forEach(equipment => {
          const key = `${equipment.brand}-${equipment.model}-${equipment.type}`
          if (seen.has(key)) {
            duplicates.push(`${equipment.brand} ${equipment.model}`)
          } else {
            seen.add(key)
          }
        })

        if (duplicates.length > 0) {
          return {
            valid: false,
            message: `Equipamentos duplicados detectados: ${duplicates.join(', ')}`,
            suggestedFix: 'Remova ou consolide equipamentos duplicados'
          }
        }

        return { valid: true }
      }
    })

    // Date validation
    this.proposalRules.push({
      name: 'generation_date',
      severity: 'error',
      validate: (data: ProposalData) => {
        const now = new Date()
        const generatedAt = new Date(data.generatedAt)
        
        if (generatedAt > now) {
          return {
            valid: false,
            message: 'Data de geração não pode ser no futuro',
            suggestedFix: 'Usar data atual'
          }
        }

        // Check if date is too old (more than 1 year)
        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
        
        if (generatedAt < oneYearAgo) {
          return {
            valid: false,
            message: 'Data de geração muito antiga (mais de 1 ano)',
            suggestedFix: 'Atualizar para data atual'
          }
        }

        return { valid: true }
      },
      autoFix: (data: ProposalData) => ({
        ...data,
        generatedAt: new Date()
      })
    })
  }

  /**
   * Initialize client data validation rules
   */
  private initializeClientRules(): void {
    // Company name validation
    this.clientRules.push({
      name: 'company_name_quality',
      severity: 'error',
      validate: (data: ClientData) => {
        if (data.companyName.length < 2) {
          return {
            valid: false,
            message: 'Nome da empresa deve ter pelo menos 2 caracteres'
          }
        }
        
        if (data.companyName.length > 100) {
          return {
            valid: false,
            message: 'Nome da empresa muito longo (máximo 100 caracteres)'
          }
        }

        // Check for suspicious patterns
        if (/^[0-9]+$/.test(data.companyName)) {
          return {
            valid: false,
            message: 'Nome da empresa não pode conter apenas números'
          }
        }

        return { valid: true }
      }
    })

    // Email validation (advanced)
    this.clientRules.push({
      name: 'email_advanced',
      severity: 'error',
      validate: (data: ClientData) => {
        const emails = [data.email, data.managerEmail].filter(Boolean)
        const issues: string[] = []

        emails.forEach((email, index) => {
          const fieldName = index === 0 ? 'Email do contato' : 'Email do gerente'
          
          if (!email) return

          // Advanced email validation
          const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
          
          if (!emailRegex.test(email)) {
            issues.push(`${fieldName}: formato inválido`)
          }

          // Check for common typos
          const commonDomains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com']
          const domain = email.split('@')[1]?.toLowerCase()
          
          if (domain) {
            // Check for typos in common domains
            const typoChecks = [
              { correct: 'gmail.com', typos: ['gmai.com', 'gmial.com', 'gmail.co'] },
              { correct: 'hotmail.com', typos: ['hotmai.com', 'hotmial.com', 'hotmail.co'] },
              { correct: 'yahoo.com', typos: ['yaho.com', 'yahoo.co', 'yahooo.com'] }
            ]

            typoChecks.forEach(check => {
              if (check.typos.includes(domain)) {
                issues.push(`${fieldName}: possível erro de digitação. Você quis dizer ${check.correct}?`)
              }
            })
          }
        })

        if (issues.length > 0) {
          return {
            valid: false,
            message: issues.join('; ')
          }
        }

        return { valid: true }
      }
    })

    // Phone validation (Brazilian format)
    this.clientRules.push({
      name: 'phone_brazilian',
      severity: 'warning',
      validate: (data: ClientData) => {
        const phones = [data.phone, data.managerPhone].filter(Boolean)
        const issues: string[] = []

        phones.forEach((phone, index) => {
          const fieldName = index === 0 ? 'Telefone do contato' : 'Telefone do gerente'
          
          if (!phone) return

          // Remove all non-digits
          const digits = phone.replace(/\D/g, '')
          
          // Brazilian phone validation
          if (digits.length < 10 || digits.length > 11) {
            issues.push(`${fieldName}: deve ter 10 ou 11 dígitos`)
          }

          // Check area code (first 2 digits)
          if (digits.length >= 2) {
            const areaCode = parseInt(digits.substring(0, 2))
            if (areaCode < 11 || areaCode > 99) {
              issues.push(`${fieldName}: código de área inválido (${areaCode})`)
            }
          }

          // Check for repeated digits (likely fake)
          if (/^(\d)\1{9,}$/.test(digits)) {
            issues.push(`${fieldName}: número suspeito (muitos dígitos repetidos)`)
          }
        })

        if (issues.length > 0) {
          return {
            valid: false,
            message: issues.join('; ')
          }
        }

        return { valid: true }
      },
      autoFix: (data: ClientData) => {
        const fixPhone = (phone: string) => {
          if (!phone) return phone
          
          // Remove all non-digits
          let digits = phone.replace(/\D/g, '')
          
          // Add default area code if missing
          if (digits.length === 8) {
            digits = '11' + digits // Default to São Paulo area code
          }
          
          // Format as (XX) XXXXX-XXXX or (XX) XXXX-XXXX
          if (digits.length === 11) {
            return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7)}`
          } else if (digits.length === 10) {
            return `(${digits.substring(0, 2)}) ${digits.substring(2, 6)}-${digits.substring(6)}`
          }
          
          return phone
        }

        return {
          ...data,
          phone: fixPhone(data.phone),
          managerPhone: fixPhone(data.managerPhone)
        }
      }
    })

    // Project name validation
    this.clientRules.push({
      name: 'project_name_quality',
      severity: 'warning',
      validate: (data: ClientData) => {
        if (data.projectName.length < 5) {
          return {
            valid: false,
            message: 'Nome do projeto muito curto (mínimo 5 caracteres)',
            suggestedFix: 'Use um nome mais descritivo para o projeto'
          }
        }

        if (data.projectName.length > 80) {
          return {
            valid: false,
            message: 'Nome do projeto muito longo (máximo 80 caracteres)',
            suggestedFix: 'Use um nome mais conciso'
          }
        }

        // Check for generic names
        const genericNames = ['projeto', 'outsourcing', 'impressão', 'teste', 'proposta']
        const lowerName = data.projectName.toLowerCase()
        
        if (genericNames.some(generic => lowerName === generic)) {
          return {
            valid: false,
            message: 'Nome do projeto muito genérico',
            suggestedFix: 'Use um nome mais específico que identifique o projeto'
          }
        }

        return { valid: true }
      }
    })

    // Contact consistency validation
    this.clientRules.push({
      name: 'contact_consistency',
      severity: 'info',
      validate: (data: ClientData) => {
        const issues: string[] = []

        // Check if manager and contact are the same person
        if (data.contactName && data.managerName) {
          const contactNormalized = data.contactName.toLowerCase().trim()
          const managerNormalized = data.managerName.toLowerCase().trim()
          
          if (contactNormalized === managerNormalized) {
            if (data.email !== data.managerEmail || data.phone !== data.managerPhone) {
              issues.push('Contato e gerente têm o mesmo nome mas dados diferentes')
            }
          }
        }

        // Check for missing manager data when contact data exists
        if (data.contactName && !data.managerName) {
          issues.push('Considere preencher os dados do gerente do projeto')
        }

        if (issues.length > 0) {
          return {
            valid: false,
            message: issues.join('; '),
            suggestedFix: 'Verifique a consistência dos dados de contato'
          }
        }

        return { valid: true }
      }
    })
  }

  /**
   * Validate proposal and client data comprehensively
   */
  validate(proposalData: ProposalData, clientData: ClientData): ValidationReport {
    const errors: ValidationIssue[] = []
    const warnings: ValidationIssue[] = []
    const infos: ValidationIssue[] = []
    let canAutoFix = false
    const fixedData: { proposalData?: ProposalData; clientData?: ClientData } = {}

    // Validate proposal data
    this.proposalRules.forEach(rule => {
      const result = rule.validate(proposalData)
      if (!result.valid) {
        const issue: ValidationIssue = {
          rule: rule.name,
          message: result.message || 'Validation failed',
          severity: rule.severity,
          suggestedFix: result.suggestedFix,
          autoFixAvailable: !!rule.autoFix
        }

        if (rule.severity === 'error') {
          errors.push(issue)
        } else if (rule.severity === 'warning') {
          warnings.push(issue)
        } else {
          infos.push(issue)
        }

        if (rule.autoFix) {
          canAutoFix = true
          if (!fixedData.proposalData) {
            fixedData.proposalData = rule.autoFix(proposalData)
          }
        }
      }
    })

    // Validate client data
    this.clientRules.forEach(rule => {
      const result = rule.validate(clientData)
      if (!result.valid) {
        const issue: ValidationIssue = {
          rule: rule.name,
          message: result.message || 'Validation failed',
          severity: rule.severity,
          suggestedFix: result.suggestedFix,
          autoFixAvailable: !!rule.autoFix
        }

        if (rule.severity === 'error') {
          errors.push(issue)
        } else if (rule.severity === 'warning') {
          warnings.push(issue)
        } else {
          infos.push(issue)
        }

        if (rule.autoFix) {
          canAutoFix = true
          if (!fixedData.clientData) {
            fixedData.clientData = rule.autoFix(clientData)
          }
        }
      }
    })

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      infos,
      canAutoFix,
      fixedData: Object.keys(fixedData).length > 0 ? fixedData : undefined
    }
  }

  /**
   * Apply automatic fixes to data
   */
  applyAutoFixes(proposalData: ProposalData, clientData: ClientData): {
    proposalData: ProposalData
    clientData: ClientData
    appliedFixes: string[]
  } {
    let fixedProposalData = { ...proposalData }
    let fixedClientData = { ...clientData }
    const appliedFixes: string[] = []

    // Apply proposal fixes
    this.proposalRules.forEach(rule => {
      if (rule.autoFix) {
        const result = rule.validate(fixedProposalData)
        if (!result.valid) {
          fixedProposalData = rule.autoFix(fixedProposalData)
          appliedFixes.push(`${rule.name}: ${result.message}`)
        }
      }
    })

    // Apply client fixes
    this.clientRules.forEach(rule => {
      if (rule.autoFix) {
        const result = rule.validate(fixedClientData)
        if (!result.valid) {
          fixedClientData = rule.autoFix(fixedClientData)
          appliedFixes.push(`${rule.name}: ${result.message}`)
        }
      }
    })

    return {
      proposalData: fixedProposalData,
      clientData: fixedClientData,
      appliedFixes
    }
  }

  /**
   * Get validation summary for UI display
   */
  getValidationSummary(report: ValidationReport): string {
    const parts: string[] = []

    if (report.errors.length > 0) {
      parts.push(`${report.errors.length} erro(s)`)
    }

    if (report.warnings.length > 0) {
      parts.push(`${report.warnings.length} aviso(s)`)
    }

    if (report.infos.length > 0) {
      parts.push(`${report.infos.length} sugestão(ões)`)
    }

    if (parts.length === 0) {
      return 'Todos os dados estão válidos'
    }

    return `Encontrado(s): ${parts.join(', ')}`
  }
}

// Export singleton instance
export const advancedValidator = AdvancedPDFValidator.getInstance()

// Export utility functions
export const validateAdvanced = (proposalData: ProposalData, clientData: ClientData): ValidationReport => {
  return advancedValidator.validate(proposalData, clientData)
}

export const applyAutoFixes = (proposalData: ProposalData, clientData: ClientData) => {
  return advancedValidator.applyAutoFixes(proposalData, clientData)
}

export const getValidationSummary = (report: ValidationReport): string => {
  return advancedValidator.getValidationSummary(report)
}