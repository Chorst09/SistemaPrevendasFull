import { 
  ServiceDeskData, 
  ValidationResult, 
  ValidationError, 
  ValidationWarning,
  TeamMember,
  ProjectData,
  WorkSchedule,
  TaxConfiguration,
  ConsolidatedBudget,
  TabValidationStatus
} from '../types/service-desk-pricing'
import { 
  ServiceDeskErrorType, 
  ServiceDeskErrorContext,
  createServiceDeskError
} from '../types/service-desk-errors'
import { serviceDeskErrorHandler } from './service-desk-error-handler'

export interface ValidationRule {
  id: string
  name: string
  description: string
  severity: 'error' | 'warning' | 'info'
  category: 'required' | 'format' | 'business' | 'consistency' | 'performance'
  validate: (value: any, context: ValidationContext) => ValidationRuleResult
  autoFix?: (value: any, context: ValidationContext) => any
  suggestion?: (value: any, context: ValidationContext) => string
}

export interface ValidationRuleResult {
  isValid: boolean
  message?: string
  suggestion?: string
  autoFixAvailable?: boolean
  fixedValue?: any
}

export interface ValidationContext {
  field: string
  data: ServiceDeskData
  tabId?: string
  relatedFields?: string[]
  userInput?: boolean
}

export interface RealTimeValidationConfig {
  enabled: boolean
  debounceMs: number
  validateOnChange: boolean
  validateOnBlur: boolean
  showSuggestions: boolean
  autoFix: boolean
}

export interface ValidationSuggestion {
  field: string
  type: 'correction' | 'improvement' | 'alternative'
  message: string
  action?: () => void
  priority: 'low' | 'medium' | 'high'
}

export interface CrossTabValidation {
  sourceTab: string
  targetTab: string
  dependencies: string[]
  validate: (sourceData: any, targetData: any) => ValidationResult
}

/**
 * Advanced validation service with real-time validation and auto-correction
 */
export class AdvancedValidationService {
  private rules: Map<string, ValidationRule> = new Map()
  private crossTabValidations: CrossTabValidation[] = []
  private config: RealTimeValidationConfig = {
    enabled: true,
    debounceMs: 300,
    validateOnChange: true,
    validateOnBlur: true,
    showSuggestions: true,
    autoFix: false
  }

  constructor(config?: Partial<RealTimeValidationConfig>) {
    if (config) {
      this.config = { ...this.config, ...config }
    }
    this.initializeDefaultRules()
    this.initializeCrossTabValidations()
  }

  /**
   * Configure validation behavior
   */
  configure(config: Partial<RealTimeValidationConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Validate entire service desk data
   */
  validateComplete(data: ServiceDeskData): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    try {
      // Validate each section
      const projectValidation = this.validateProject(data.project, data)
      const teamValidation = this.validateTeam(data.team, data)
      const scheduleValidation = this.validateSchedules(data.schedules, data)
      const taxValidation = this.validateTaxes(data.taxes, data)
      const budgetValidation = this.validateBudget(data.budget, data)

      // Combine results
      errors.push(
        ...projectValidation.errors,
        ...teamValidation.errors,
        ...scheduleValidation.errors,
        ...taxValidation.errors,
        ...budgetValidation.errors
      )

      warnings.push(
        ...projectValidation.warnings,
        ...teamValidation.warnings,
        ...scheduleValidation.warnings,
        ...taxValidation.warnings,
        ...budgetValidation.warnings
      )

      // Cross-tab validations
      const crossTabResults = this.validateCrossTabConsistency(data)
      errors.push(...crossTabResults.errors)
      warnings.push(...crossTabResults.warnings)

    } catch (error) {
      errors.push({
        field: 'system',
        message: 'Erro interno durante validação',
        code: 'VALIDATION_SYSTEM_ERROR'
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Validate specific field with real-time feedback
   */
  validateField(
    field: string, 
    value: any, 
    data: ServiceDeskData, 
    tabId?: string
  ): ValidationRuleResult {
    const context: ValidationContext = {
      field,
      data,
      tabId,
      userInput: true
    }

    const rule = this.rules.get(field)
    if (!rule) {
      return { isValid: true }
    }

    try {
      const result = rule.validate(value, context)
      
      // Auto-fix if enabled and available
      if (!result.isValid && this.config.autoFix && rule.autoFix) {
        try {
          const fixedValue = rule.autoFix(value, context)
          return {
            ...result,
            autoFixAvailable: true,
            fixedValue,
            suggestion: `Valor corrigido automaticamente para: ${fixedValue}`
          }
        } catch (fixError) {
          // Auto-fix failed, return original result
        }
      }

      // Add suggestion if available
      if (!result.isValid && rule.suggestion) {
        result.suggestion = rule.suggestion(value, context)
      }

      return result
    } catch (error) {
      return {
        isValid: false,
        message: 'Erro durante validação do campo',
        suggestion: 'Verifique o valor inserido'
      }
    }
  }

  /**
   * Get validation suggestions for improving data quality
   */
  getSuggestions(data: ServiceDeskData, tabId?: string): ValidationSuggestion[] {
    const suggestions: ValidationSuggestion[] = []

    // Analyze data and provide suggestions
    suggestions.push(...this.getProjectSuggestions(data.project))
    suggestions.push(...this.getTeamSuggestions(data.team))
    suggestions.push(...this.getScheduleSuggestions(data.schedules))
    suggestions.push(...this.getBudgetSuggestions(data.budget, data))

    // Sort by priority
    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  /**
   * Validate tab completion status
   */
  validateTabCompletion(tabId: string, data: ServiceDeskData): TabValidationStatus {
    const tabData = this.getTabData(tabId, data)
    const validation = this.validateTabData(tabId, tabData, data)
    
    const completionPercentage = this.calculateCompletionPercentage(tabId, tabData)

    return {
      tabId,
      isValid: validation.isValid,
      errors: validation.errors,
      warnings: validation.warnings,
      completionPercentage
    }
  }

  /**
   * Validate cross-tab consistency
   */
  validateCrossTabConsistency(data: ServiceDeskData): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    for (const crossValidation of this.crossTabValidations) {
      try {
        const sourceData = this.getTabData(crossValidation.sourceTab, data)
        const targetData = this.getTabData(crossValidation.targetTab, data)
        
        const result = crossValidation.validate(sourceData, targetData)
        
        errors.push(...result.errors)
        warnings.push(...result.warnings)
      } catch (error) {
        errors.push({
          field: `${crossValidation.sourceTab}-${crossValidation.targetTab}`,
          message: 'Erro na validação cruzada entre abas',
          code: 'CROSS_TAB_VALIDATION_ERROR'
        })
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Register custom validation rule
   */
  registerRule(rule: ValidationRule): void {
    this.rules.set(rule.id, rule)
  }

  /**
   * Register cross-tab validation
   */
  registerCrossTabValidation(validation: CrossTabValidation): void {
    this.crossTabValidations.push(validation)
  }

  /**
   * Initialize default validation rules
   */
  private initializeDefaultRules(): void {
    // Project validation rules
    this.registerRule({
      id: 'project.name',
      name: 'Nome do Projeto',
      description: 'Nome do projeto deve ser informado',
      severity: 'error',
      category: 'required',
      validate: (value, context) => ({
        isValid: Boolean(value && value.trim().length > 0),
        message: value ? undefined : 'Nome do projeto é obrigatório'
      }),
      autoFix: (value, context) => value || 'Projeto Service Desk',
      suggestion: (value, context) => 'Informe um nome descritivo para o projeto'
    })

    this.registerRule({
      id: 'project.client.name',
      name: 'Nome do Cliente',
      description: 'Nome do cliente deve ser informado',
      severity: 'error',
      category: 'required',
      validate: (value, context) => ({
        isValid: Boolean(value && value.trim().length > 0),
        message: value ? undefined : 'Nome do cliente é obrigatório'
      }),
      autoFix: (value, context) => value || 'Cliente',
      suggestion: (value, context) => 'Informe o nome completo do cliente'
    })

    this.registerRule({
      id: 'project.client.email',
      name: 'Email do Cliente',
      description: 'Email deve ter formato válido',
      severity: 'warning',
      category: 'format',
      validate: (value, context) => {
        if (!value) return { isValid: true }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return {
          isValid: emailRegex.test(value),
          message: emailRegex.test(value) ? undefined : 'Formato de email inválido'
        }
      },
      suggestion: (value, context) => 'Use o formato: usuario@dominio.com'
    })

    this.registerRule({
      id: 'project.client.phone',
      name: 'Telefone do Cliente',
      description: 'Telefone deve ter formato válido',
      severity: 'warning',
      category: 'format',
      validate: (value, context) => {
        if (!value) return { isValid: true }
        const digits = value.replace(/\D/g, '')
        return {
          isValid: digits.length >= 10 && digits.length <= 11,
          message: (digits.length >= 10 && digits.length <= 11) ? undefined : 'Telefone deve ter 10 ou 11 dígitos'
        }
      },
      autoFix: (value, context) => {
        const digits = value.replace(/\D/g, '')
        if (digits.length === 10) {
          return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
        } else if (digits.length === 11) {
          return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
        }
        return value
      },
      suggestion: (value, context) => 'Use o formato: (11) 99999-9999'
    })

    // Team validation rules
    this.registerRule({
      id: 'team.member.name',
      name: 'Nome do Membro',
      description: 'Nome do membro da equipe é obrigatório',
      severity: 'error',
      category: 'required',
      validate: (value, context) => ({
        isValid: Boolean(value && value.trim().length > 0),
        message: value ? undefined : 'Nome do membro é obrigatório'
      }),
      suggestion: (value, context) => 'Informe o nome completo do membro da equipe'
    })

    this.registerRule({
      id: 'team.member.salary',
      name: 'Salário do Membro',
      description: 'Salário deve ser um valor positivo',
      severity: 'error',
      category: 'business',
      validate: (value, context) => {
        const numValue = Number(value)
        return {
          isValid: !isNaN(numValue) && numValue > 0,
          message: (!isNaN(numValue) && numValue > 0) ? undefined : 'Salário deve ser um valor positivo'
        }
      },
      autoFix: (value, context) => {
        const numValue = Number(value)
        return isNaN(numValue) || numValue <= 0 ? 3000 : numValue
      },
      suggestion: (value, context) => {
        const numValue = Number(value)
        if (numValue < 1320) return 'Valor abaixo do salário mínimo'
        if (numValue > 50000) return 'Valor muito alto, verifique se está correto'
        return 'Informe o salário base mensal'
      }
    })

    this.registerRule({
      id: 'team.member.workload',
      name: 'Carga Horária',
      description: 'Carga horária deve estar entre 1 e 168 horas por semana',
      severity: 'error',
      category: 'business',
      validate: (value, context) => {
        const numValue = Number(value)
        return {
          isValid: !isNaN(numValue) && numValue > 0 && numValue <= 168,
          message: (!isNaN(numValue) && numValue > 0 && numValue <= 168) ? undefined : 'Carga horária deve estar entre 1 e 168 horas por semana'
        }
      },
      autoFix: (value, context) => {
        const numValue = Number(value)
        if (isNaN(numValue) || numValue <= 0) return 40
        if (numValue > 168) return 168
        return numValue
      },
      suggestion: (value, context) => {
        const numValue = Number(value)
        if (numValue > 44) return 'Carga horária acima de 44h pode gerar custos extras'
        if (numValue < 20) return 'Carga horária muito baixa pode afetar a produtividade'
        return 'Carga horária padrão é 40h por semana'
      }
    })

    // Tax validation rules
    this.registerRule({
      id: 'taxes.rate',
      name: 'Alíquota de Imposto',
      description: 'Alíquota deve estar entre 0% e 100%',
      severity: 'error',
      category: 'business',
      validate: (value, context) => {
        const numValue = Number(value)
        return {
          isValid: !isNaN(numValue) && numValue >= 0 && numValue <= 100,
          message: (!isNaN(numValue) && numValue >= 0 && numValue <= 100) ? undefined : 'Alíquota deve estar entre 0% e 100%'
        }
      },
      autoFix: (value, context) => {
        const numValue = Number(value)
        if (isNaN(numValue) || numValue < 0) return 0
        if (numValue > 100) return 100
        return numValue
      },
      suggestion: (value, context) => 'Verifique as alíquotas vigentes para sua região'
    })

    // Budget validation rules
    this.registerRule({
      id: 'budget.margin',
      name: 'Margem de Lucro',
      description: 'Margem deve ser um valor positivo',
      severity: 'warning',
      category: 'business',
      validate: (value, context) => {
        if (!value) return { isValid: true }
        const numValue = Number(value)
        return {
          isValid: !isNaN(numValue) && numValue >= 0,
          message: (!isNaN(numValue) && numValue >= 0) ? undefined : 'Margem deve ser um valor positivo'
        }
      },
      suggestion: (value, context) => {
        const numValue = Number(value)
        if (numValue < 10) return 'Margem muito baixa pode comprometer a rentabilidade'
        if (numValue > 50) return 'Margem muito alta pode tornar proposta não competitiva'
        return 'Margem típica para service desk é entre 15% e 30%'
      }
    })
  }

  /**
   * Initialize cross-tab validations
   */
  private initializeCrossTabValidations(): void {
    // Team vs Schedule consistency
    this.registerCrossTabValidation({
      sourceTab: 'team',
      targetTab: 'schedule',
      dependencies: ['team.members', 'schedule.shifts'],
      validate: (teamData, scheduleData) => {
        const errors: ValidationError[] = []
        const warnings: ValidationWarning[] = []

        if (teamData && scheduleData && scheduleData.length > 0) {
          const teamMemberIds = teamData.map((member: TeamMember) => member.id)
          
          scheduleData.forEach((schedule: WorkSchedule, scheduleIndex: number) => {
            schedule.shifts?.forEach((shift, shiftIndex) => {
              shift.teamMembers?.forEach(memberId => {
                if (!teamMemberIds.includes(memberId)) {
                  errors.push({
                    field: `schedule[${scheduleIndex}].shifts[${shiftIndex}].teamMembers`,
                    message: `Membro da equipe ${memberId} não encontrado na aba Equipe`,
                    code: 'TEAM_MEMBER_NOT_FOUND'
                  })
                }
              })
            })
          })
        }

        return { isValid: errors.length === 0, errors, warnings }
      }
    })

    // Team vs Budget consistency
    this.registerCrossTabValidation({
      sourceTab: 'team',
      targetTab: 'budget',
      dependencies: ['team.costs', 'budget.teamCosts'],
      validate: (teamData, budgetData) => {
        const errors: ValidationError[] = []
        const warnings: ValidationWarning[] = []

        if (teamData && budgetData) {
          const calculatedTeamCost = teamData.reduce((total: number, member: TeamMember) => {
            const monthlyCost = member.salary + (member.benefits?.healthInsurance || 0) + 
                              (member.benefits?.mealVoucher || 0) + (member.benefits?.transportVoucher || 0)
            return total + monthlyCost
          }, 0)

          const budgetTeamCost = budgetData.teamCosts?.total || 0

          if (Math.abs(calculatedTeamCost - budgetTeamCost) > calculatedTeamCost * 0.1) {
            warnings.push({
              field: 'budget.teamCosts',
              message: 'Custo da equipe no orçamento difere significativamente do calculado na aba Equipe',
              code: 'TEAM_COST_MISMATCH'
            })
          }
        }

        return { isValid: errors.length === 0, errors, warnings }
      }
    })

    // Project vs Budget consistency
    this.registerCrossTabValidation({
      sourceTab: 'project',
      targetTab: 'budget',
      dependencies: ['project.contractPeriod', 'budget.monthlyBreakdown'],
      validate: (projectData, budgetData) => {
        const errors: ValidationError[] = []
        const warnings: ValidationWarning[] = []

        if (projectData?.contractPeriod && budgetData?.monthlyBreakdown) {
          const contractMonths = projectData.contractPeriod.durationMonths
          const budgetMonths = budgetData.monthlyBreakdown.length

          if (contractMonths !== budgetMonths) {
            warnings.push({
              field: 'budget.monthlyBreakdown',
              message: `Período do contrato (${contractMonths} meses) não coincide com breakdown mensal (${budgetMonths} meses)`,
              code: 'CONTRACT_BUDGET_PERIOD_MISMATCH'
            })
          }
        }

        return { isValid: errors.length === 0, errors, warnings }
      }
    })
  }

  /**
   * Validation helper methods
   */
  private validateProject(project: ProjectData, data: ServiceDeskData): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    if (!project) {
      errors.push({
        field: 'project',
        message: 'Dados do projeto são obrigatórios',
        code: 'REQUIRED_PROJECT'
      })
      return { isValid: false, errors, warnings }
    }

    // Validate individual fields
    const nameResult = this.validateField('project.name', project.name, data)
    if (!nameResult.isValid) {
      errors.push({
        field: 'project.name',
        message: nameResult.message || 'Nome do projeto inválido',
        code: 'INVALID_PROJECT_NAME'
      })
    }

    if (project.client) {
      const clientNameResult = this.validateField('project.client.name', project.client.name, data)
      if (!clientNameResult.isValid) {
        errors.push({
          field: 'project.client.name',
          message: clientNameResult.message || 'Nome do cliente inválido',
          code: 'INVALID_CLIENT_NAME'
        })
      }

      const emailResult = this.validateField('project.client.email', project.client.email, data)
      if (!emailResult.isValid) {
        warnings.push({
          field: 'project.client.email',
          message: emailResult.message || 'Email do cliente inválido',
          code: 'INVALID_CLIENT_EMAIL'
        })
      }

      const phoneResult = this.validateField('project.client.phone', project.client.phone, data)
      if (!phoneResult.isValid) {
        warnings.push({
          field: 'project.client.phone',
          message: phoneResult.message || 'Telefone do cliente inválido',
          code: 'INVALID_CLIENT_PHONE'
        })
      }
    }

    return { isValid: errors.length === 0, errors, warnings }
  }

  private validateTeam(team: TeamMember[], data: ServiceDeskData): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    if (!team || team.length === 0) {
      errors.push({
        field: 'team',
        message: 'Pelo menos um membro da equipe é obrigatório',
        code: 'REQUIRED_TEAM_MEMBER'
      })
      return { isValid: false, errors, warnings }
    }

    team.forEach((member, index) => {
      const nameResult = this.validateField('team.member.name', member.name, data)
      if (!nameResult.isValid) {
        errors.push({
          field: `team[${index}].name`,
          message: nameResult.message || 'Nome do membro inválido',
          code: 'INVALID_MEMBER_NAME'
        })
      }

      const salaryResult = this.validateField('team.member.salary', member.salary, data)
      if (!salaryResult.isValid) {
        errors.push({
          field: `team[${index}].salary`,
          message: salaryResult.message || 'Salário inválido',
          code: 'INVALID_MEMBER_SALARY'
        })
      }

      const workloadResult = this.validateField('team.member.workload', member.workload, data)
      if (!workloadResult.isValid) {
        errors.push({
          field: `team[${index}].workload`,
          message: workloadResult.message || 'Carga horária inválida',
          code: 'INVALID_MEMBER_WORKLOAD'
        })
      }
    })

    return { isValid: errors.length === 0, errors, warnings }
  }

  private validateSchedules(schedules: WorkSchedule[], data: ServiceDeskData): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Schedule validation logic here
    return { isValid: errors.length === 0, errors, warnings }
  }

  private validateTaxes(taxes: TaxConfiguration, data: ServiceDeskData): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    if (taxes) {
      const taxFields = ['icms', 'pis', 'cofins', 'iss', 'ir', 'csll']
      
      taxFields.forEach(field => {
        const value = (taxes as any)[field]
        if (typeof value === 'number') {
          const result = this.validateField('taxes.rate', value, data)
          if (!result.isValid) {
            errors.push({
              field: `taxes.${field}`,
              message: result.message || `${field.toUpperCase()} inválido`,
              code: 'INVALID_TAX_RATE'
            })
          }
        }
      })
    }

    return { isValid: errors.length === 0, errors, warnings }
  }

  private validateBudget(budget: ConsolidatedBudget, data: ServiceDeskData): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    if (budget) {
      if (budget.margin) {
        const marginResult = this.validateField('budget.margin', budget.margin.value, data)
        if (!marginResult.isValid) {
          warnings.push({
            field: 'budget.margin',
            message: marginResult.message || 'Margem inválida',
            code: 'INVALID_MARGIN'
          })
        }
      }

      // Check for negative margin
      if (budget.totalPrice && budget.totalCosts && budget.totalPrice < budget.totalCosts) {
        warnings.push({
          field: 'budget',
          message: 'Preço total é menor que o custo total (margem negativa)',
          code: 'NEGATIVE_MARGIN'
        })
      }
    }

    return { isValid: errors.length === 0, errors, warnings }
  }

  private getTabData(tabId: string, data: ServiceDeskData): any {
    switch (tabId) {
      case 'project': return data.project
      case 'team': return data.team
      case 'schedule': return data.schedules
      case 'taxes': return data.taxes
      case 'variables': return data.variables
      case 'otherCosts': return data.otherCosts
      case 'budget': return data.budget
      case 'analysis': return data.analysis
      case 'negotiation': return data.negotiations
      case 'finalAnalysis': return data.finalAnalysis
      default: return null
    }
  }

  private validateTabData(tabId: string, tabData: any, fullData: ServiceDeskData): ValidationResult {
    switch (tabId) {
      case 'project': return this.validateProject(tabData, fullData)
      case 'team': return this.validateTeam(tabData, fullData)
      case 'schedule': return this.validateSchedules(tabData, fullData)
      case 'taxes': return this.validateTaxes(tabData, fullData)
      case 'budget': return this.validateBudget(tabData, fullData)
      default: return { isValid: true, errors: [], warnings: [] }
    }
  }

  private calculateCompletionPercentage(tabId: string, tabData: any): number {
    if (!tabData) return 0

    switch (tabId) {
      case 'project':
        const projectFields = ['name', 'client.name', 'contractPeriod.startDate', 'contractPeriod.endDate']
        const projectCompleted = projectFields.filter(field => {
          const value = this.getNestedValue(tabData, field)
          return value !== null && value !== undefined && value !== ''
        }).length
        return Math.round((projectCompleted / projectFields.length) * 100)

      case 'team':
        if (!Array.isArray(tabData) || tabData.length === 0) return 0
        const teamFields = ['name', 'role', 'salary', 'workload']
        const teamCompleted = tabData.reduce((total, member) => {
          const memberCompleted = teamFields.filter(field => {
            const value = member[field]
            return value !== null && value !== undefined && value !== ''
          }).length
          return total + (memberCompleted / teamFields.length)
        }, 0)
        return Math.round((teamCompleted / tabData.length) * 100)

      default:
        return 50 // Default completion for other tabs
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  private getProjectSuggestions(project: ProjectData): ValidationSuggestion[] {
    const suggestions: ValidationSuggestion[] = []

    if (!project?.description || project.description.trim().length < 50) {
      suggestions.push({
        field: 'project.description',
        type: 'improvement',
        message: 'Adicione uma descrição mais detalhada do projeto',
        priority: 'medium'
      })
    }

    return suggestions
  }

  private getTeamSuggestions(team: TeamMember[]): ValidationSuggestion[] {
    const suggestions: ValidationSuggestion[] = []

    if (team && team.length < 2) {
      suggestions.push({
        field: 'team',
        type: 'improvement',
        message: 'Considere adicionar mais membros para garantir cobertura adequada',
        priority: 'medium'
      })
    }

    return suggestions
  }

  private getScheduleSuggestions(schedules: WorkSchedule[]): ValidationSuggestion[] {
    const suggestions: ValidationSuggestion[] = []

    if (!schedules || schedules.length === 0) {
      suggestions.push({
        field: 'schedules',
        type: 'improvement',
        message: 'Configure escalas de trabalho para otimizar a cobertura',
        priority: 'high'
      })
    }

    return suggestions
  }

  private getBudgetSuggestions(budget: ConsolidatedBudget, data: ServiceDeskData): ValidationSuggestion[] {
    const suggestions: ValidationSuggestion[] = []

    if (budget?.margin && budget.margin.value < 15) {
      suggestions.push({
        field: 'budget.margin',
        type: 'improvement',
        message: 'Margem baixa pode comprometer a rentabilidade do projeto',
        priority: 'high'
      })
    }

    return suggestions
  }
}

// Export singleton instance
export const advancedValidationService = new AdvancedValidationService()

// Export utility functions
export const validateServiceDeskField = (
  field: string,
  value: any,
  data: ServiceDeskData,
  tabId?: string
): ValidationRuleResult => {
  return advancedValidationService.validateField(field, value, data, tabId)
}

export const getValidationSuggestions = (
  data: ServiceDeskData,
  tabId?: string
): ValidationSuggestion[] => {
  return advancedValidationService.getSuggestions(data, tabId)
}

export const validateTabCompletion = (
  tabId: string,
  data: ServiceDeskData
): TabValidationStatus => {
  return advancedValidationService.validateTabCompletion(tabId, data)
}