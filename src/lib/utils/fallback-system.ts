import { ServiceDeskError, ServiceDeskErrorType, ServiceDeskErrorContext } from '../types/service-desk-errors'
import { ServiceDeskData } from '../types/service-desk-pricing'
import { serviceDeskErrorHandler } from '../services/service-desk-error-handler'

export interface FallbackConfig {
  enableFallback: boolean
  fallbackTimeout: number
  maxFallbackAttempts: number
  fallbackStrategies: FallbackStrategy[]
}

export interface FallbackStrategy {
  name: string
  priority: number
  condition: (error: ServiceDeskError) => boolean
  execute: (error: ServiceDeskError, context: any) => Promise<any>
  description: string
}

export interface FallbackResult<T> {
  success: boolean
  result?: T
  strategy?: string
  error?: ServiceDeskError
  fallbackUsed: boolean
}

/**
 * Fallback system for Service Desk operations
 */
export class FallbackSystem {
  private config: FallbackConfig
  private strategies: Map<string, FallbackStrategy> = new Map()

  constructor(config: Partial<FallbackConfig> = {}) {
    this.config = {
      enableFallback: true,
      fallbackTimeout: 30000,
      maxFallbackAttempts: 3,
      fallbackStrategies: [],
      ...config
    }

    this.initializeDefaultStrategies()
  }

  /**
   * Execute operation with fallback support
   */
  async executeWithFallback<T>(
    primaryOperation: () => Promise<T>,
    context: ServiceDeskErrorContext,
    operationName: string = 'operation',
    fallbackData?: any
  ): Promise<FallbackResult<T>> {
    try {
      const result = await primaryOperation()
      return {
        success: true,
        result,
        fallbackUsed: false
      }
    } catch (error) {
      if (!this.config.enableFallback) {
        return {
          success: false,
          error: error as ServiceDeskError,
          fallbackUsed: false
        }
      }

      return await this.executeFallbackStrategies(
        error as ServiceDeskError,
        context,
        operationName,
        fallbackData
      )
    }
  }

  /**
   * Execute fallback strategies in priority order
   */
  private async executeFallbackStrategies<T>(
    error: ServiceDeskError,
    context: ServiceDeskErrorContext,
    operationName: string,
    fallbackData?: any
  ): Promise<FallbackResult<T>> {
    const applicableStrategies = Array.from(this.strategies.values())
      .filter(strategy => strategy.condition(error))
      .sort((a, b) => b.priority - a.priority)

    if (applicableStrategies.length === 0) {
      return {
        success: false,
        error: serviceDeskErrorHandler.createError(
          ServiceDeskErrorType.SYSTEM_ERROR,
          `Nenhuma estratégia de fallback disponível para ${operationName}`,
          context,
          { originalError: error }
        ),
        fallbackUsed: false
      }
    }

    for (const strategy of applicableStrategies) {
      try {
        const result = await Promise.race([
          strategy.execute(error, { context, operationName, fallbackData }),
          this.createTimeoutPromise(this.config.fallbackTimeout)
        ])

        // Log successful fallback
        serviceDeskErrorHandler.createError(
          ServiceDeskErrorType.SYSTEM_ERROR,
          `${operationName} recuperado usando estratégia: ${strategy.name}`,
          context,
          { 
            originalError: error, 
            strategy: strategy.name,
            description: strategy.description
          }
        )

        return {
          success: true,
          result,
          strategy: strategy.name,
          fallbackUsed: true
        }
      } catch (fallbackError) {
        // Log fallback failure and try next strategy
        serviceDeskErrorHandler.createError(
          ServiceDeskErrorType.SYSTEM_ERROR,
          `Estratégia de fallback ${strategy.name} falhou para ${operationName}`,
          context,
          { 
            originalError: error, 
            fallbackError,
            strategy: strategy.name
          }
        )
      }
    }

    // All fallback strategies failed
    return {
      success: false,
      error: serviceDeskErrorHandler.createError(
        ServiceDeskErrorType.SYSTEM_ERROR,
        `Todas as estratégias de fallback falharam para ${operationName}`,
        context,
        { 
          originalError: error,
          attemptedStrategies: applicableStrategies.map(s => s.name)
        }
      ),
      fallbackUsed: true
    }
  }

  /**
   * Register a new fallback strategy
   */
  registerStrategy(strategy: FallbackStrategy): void {
    this.strategies.set(strategy.name, strategy)
  }

  /**
   * Remove a fallback strategy
   */
  unregisterStrategy(name: string): void {
    this.strategies.delete(name)
  }

  /**
   * Get all registered strategies
   */
  getStrategies(): FallbackStrategy[] {
    return Array.from(this.strategies.values())
  }

  /**
   * Initialize default fallback strategies
   */
  private initializeDefaultStrategies(): void {
    // Calculation fallback strategies
    this.registerStrategy({
      name: 'simple_calculation',
      priority: 100,
      condition: (error) => error.type === ServiceDeskErrorType.CALCULATION_ERROR,
      execute: async (error, context) => {
        return this.executeSimpleCalculation(context.fallbackData)
      },
      description: 'Usar cálculos simplificados quando cálculos complexos falham'
    })

    this.registerStrategy({
      name: 'cached_calculation',
      priority: 90,
      condition: (error) => error.type === ServiceDeskErrorType.CALCULATION_ERROR,
      execute: async (error, context) => {
        return this.getCachedCalculation(context.fallbackData)
      },
      description: 'Usar resultados de cálculos em cache'
    })

    // Data persistence fallback strategies
    this.registerStrategy({
      name: 'local_storage_fallback',
      priority: 100,
      condition: (error) => error.type === ServiceDeskErrorType.DATA_PERSISTENCE_ERROR,
      execute: async (error, context) => {
        return this.saveToLocalStorage(context.fallbackData)
      },
      description: 'Salvar dados no localStorage quando IndexedDB falha'
    })

    this.registerStrategy({
      name: 'session_storage_fallback',
      priority: 80,
      condition: (error) => error.type === ServiceDeskErrorType.DATA_PERSISTENCE_ERROR,
      execute: async (error, context) => {
        return this.saveToSessionStorage(context.fallbackData)
      },
      description: 'Salvar dados no sessionStorage como último recurso'
    })

    this.registerStrategy({
      name: 'memory_storage_fallback',
      priority: 60,
      condition: (error) => error.type === ServiceDeskErrorType.DATA_PERSISTENCE_ERROR,
      execute: async (error, context) => {
        return this.saveToMemory(context.fallbackData)
      },
      description: 'Manter dados apenas na memória'
    })

    // Integration fallback strategies
    this.registerStrategy({
      name: 'simple_pdf_template',
      priority: 100,
      condition: (error) => error.type === ServiceDeskErrorType.PDF_GENERATION_FAILED,
      execute: async (error, context) => {
        return this.generateSimplePDF(context.fallbackData)
      },
      description: 'Usar template PDF simplificado'
    })

    this.registerStrategy({
      name: 'text_export_fallback',
      priority: 80,
      condition: (error) => error.type === ServiceDeskErrorType.EXPORT_FAILED,
      execute: async (error, context) => {
        return this.exportAsText(context.fallbackData)
      },
      description: 'Exportar como texto quando PDF falha'
    })

    this.registerStrategy({
      name: 'json_export_fallback',
      priority: 70,
      condition: (error) => error.type === ServiceDeskErrorType.EXPORT_FAILED,
      execute: async (error, context) => {
        return this.exportAsJSON(context.fallbackData)
      },
      description: 'Exportar como JSON quando outros formatos falham'
    })

    // Validation fallback strategies
    this.registerStrategy({
      name: 'default_values_fallback',
      priority: 100,
      condition: (error) => error.type === ServiceDeskErrorType.VALIDATION_ERROR,
      execute: async (error, context) => {
        return this.applyDefaultValues(context.fallbackData)
      },
      description: 'Aplicar valores padrão para campos inválidos'
    })

    this.registerStrategy({
      name: 'skip_validation_fallback',
      priority: 50,
      condition: (error) => error.type === ServiceDeskErrorType.VALIDATION_ERROR,
      execute: async (error, context) => {
        return this.skipValidation(context.fallbackData)
      },
      description: 'Pular validação em casos críticos'
    })

    // Navigation fallback strategies
    this.registerStrategy({
      name: 'force_navigation_fallback',
      priority: 80,
      condition: (error) => error.type === ServiceDeskErrorType.NAVIGATION_ERROR,
      execute: async (error, context) => {
        return this.forceNavigation(context.fallbackData)
      },
      description: 'Forçar navegação descartando alterações não salvas'
    })

    this.registerStrategy({
      name: 'auto_save_fallback',
      priority: 90,
      condition: (error) => error.type === ServiceDeskErrorType.UNSAVED_CHANGES,
      execute: async (error, context) => {
        return this.autoSaveAndNavigate(context.fallbackData)
      },
      description: 'Salvar automaticamente antes de navegar'
    })
  }

  /**
   * Fallback strategy implementations
   */
  private async executeSimpleCalculation(data: any): Promise<any> {
    // Implement simple calculation logic
    if (!data || !data.team) {
      throw new Error('Dados insuficientes para cálculo simples')
    }

    const simpleCost = data.team.reduce((total: number, member: any) => {
      const salary = member.salary || 0
      const benefits = salary * 0.8 // 80% benefits estimate
      return total + salary + benefits
    }, 0)

    return {
      totalMonthlyCost: simpleCost,
      totalAnnualCost: simpleCost * 12,
      calculationMethod: 'simple_fallback'
    }
  }

  private async getCachedCalculation(data: any): Promise<any> {
    try {
      const cached = localStorage.getItem('service_desk_calculation_cache')
      if (cached) {
        const parsedCache = JSON.parse(cached)
        if (parsedCache.timestamp && Date.now() - parsedCache.timestamp < 3600000) { // 1 hour
          return parsedCache.data
        }
      }
    } catch (error) {
      // Ignore cache errors
    }
    
    throw new Error('Nenhum cálculo em cache disponível')
  }

  private async saveToLocalStorage(data: any): Promise<any> {
    try {
      const key = `service_desk_data_${Date.now()}`
      localStorage.setItem(key, JSON.stringify(data))
      return { 
        success: true, 
        storageType: 'localStorage',
        key 
      }
    } catch (error) {
      throw new Error('Falha ao salvar no localStorage')
    }
  }

  private async saveToSessionStorage(data: any): Promise<any> {
    try {
      const key = `service_desk_data_${Date.now()}`
      sessionStorage.setItem(key, JSON.stringify(data))
      return { 
        success: true, 
        storageType: 'sessionStorage',
        key 
      }
    } catch (error) {
      throw new Error('Falha ao salvar no sessionStorage')
    }
  }

  private async saveToMemory(data: any): Promise<any> {
    // Store in a global variable as last resort
    if (typeof window !== 'undefined') {
      (window as any).serviceDeskFallbackData = data
      return { 
        success: true, 
        storageType: 'memory',
        warning: 'Dados serão perdidos ao recarregar a página'
      }
    }
    
    throw new Error('Armazenamento em memória não disponível')
  }

  private async generateSimplePDF(data: any): Promise<any> {
    // Create a simple text-based PDF alternative
    const textContent = this.formatDataAsText(data)
    
    const blob = new Blob([textContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    
    return {
      success: true,
      url,
      filename: `service-desk-proposal-${Date.now()}.txt`,
      type: 'text/plain',
      fallback: true
    }
  }

  private async exportAsText(data: any): Promise<any> {
    const textContent = this.formatDataAsText(data)
    
    const blob = new Blob([textContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    
    // Trigger download
    const a = document.createElement('a')
    a.href = url
    a.download = `service-desk-export-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    return {
      success: true,
      format: 'text',
      downloaded: true
    }
  }

  private async exportAsJSON(data: any): Promise<any> {
    const jsonContent = JSON.stringify(data, null, 2)
    
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    // Trigger download
    const a = document.createElement('a')
    a.href = url
    a.download = `service-desk-export-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    return {
      success: true,
      format: 'json',
      downloaded: true
    }
  }

  private async applyDefaultValues(data: any): Promise<any> {
    const defaultedData = { ...data }
    
    // Apply default values for common fields
    if (!defaultedData.project) {
      defaultedData.project = {
        name: 'Projeto Service Desk',
        client: {
          name: 'Cliente',
          email: 'cliente@exemplo.com',
          phone: '(11) 9999-9999'
        }
      }
    }
    
    if (!defaultedData.team || defaultedData.team.length === 0) {
      defaultedData.team = [{
        id: '1',
        name: 'Analista Service Desk',
        role: 'Analista',
        salary: 3000,
        workload: 40
      }]
    }
    
    return defaultedData
  }

  private async skipValidation(data: any): Promise<any> {
    return {
      ...data,
      validationSkipped: true,
      warning: 'Validação foi pulada - verifique os dados manualmente'
    }
  }

  private async forceNavigation(data: any): Promise<any> {
    return {
      success: true,
      action: 'force_navigation',
      discardedChanges: true,
      warning: 'Alterações não salvas foram descartadas'
    }
  }

  private async autoSaveAndNavigate(data: any): Promise<any> {
    try {
      // Try to save data first
      await this.saveToLocalStorage(data)
      
      return {
        success: true,
        action: 'auto_save_navigation',
        saved: true
      }
    } catch (error) {
      // If save fails, force navigation
      return this.forceNavigation(data)
    }
  }

  /**
   * Utility methods
   */
  private formatDataAsText(data: any): string {
    const lines = [
      '=== PROPOSTA SERVICE DESK ===',
      '',
      `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
      '',
      '--- DADOS DO PROJETO ---'
    ]

    if (data.project) {
      lines.push(`Nome: ${data.project.name || 'N/A'}`)
      if (data.project.client) {
        lines.push(`Cliente: ${data.project.client.name || 'N/A'}`)
        lines.push(`Email: ${data.project.client.email || 'N/A'}`)
        lines.push(`Telefone: ${data.project.client.phone || 'N/A'}`)
      }
    }

    lines.push('', '--- EQUIPE ---')
    if (data.team && data.team.length > 0) {
      data.team.forEach((member: any, index: number) => {
        lines.push(`${index + 1}. ${member.name || 'N/A'}`)
        lines.push(`   Cargo: ${member.role || 'N/A'}`)
        lines.push(`   Salário: R$ ${(member.salary || 0).toLocaleString('pt-BR')}`)
        lines.push(`   Carga Horária: ${member.workload || 0}h/semana`)
        lines.push('')
      })
    } else {
      lines.push('Nenhum membro da equipe definido')
    }

    if (data.budget) {
      lines.push('--- ORÇAMENTO ---')
      lines.push(`Custo Total: R$ ${(data.budget.totalCosts || 0).toLocaleString('pt-BR')}`)
      lines.push(`Preço Total: R$ ${(data.budget.totalPrice || 0).toLocaleString('pt-BR')}`)
    }

    lines.push('', '--- OBSERVAÇÕES ---')
    lines.push('Este documento foi gerado usando sistema de fallback.')
    lines.push('Para informações completas, use o sistema principal.')

    return lines.join('\n')
  }

  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operação de fallback excedeu timeout de ${timeout}ms`))
      }, timeout)
    })
  }
}

/**
 * Default fallback system instance
 */
export const defaultFallbackSystem = new FallbackSystem()

/**
 * Utility functions for common fallback patterns
 */
export async function executeWithFallback<T>(
  operation: () => Promise<T>,
  context: ServiceDeskErrorContext,
  operationName: string = 'operation',
  fallbackData?: any
): Promise<FallbackResult<T>> {
  return defaultFallbackSystem.executeWithFallback(operation, context, operationName, fallbackData)
}

export async function executeCalculationWithFallback(
  calculation: () => Promise<any>,
  context: ServiceDeskErrorContext,
  data: ServiceDeskData
): Promise<FallbackResult<any>> {
  return defaultFallbackSystem.executeWithFallback(
    calculation,
    context,
    'calculation',
    data
  )
}

export async function executePersistenceWithFallback(
  persistenceOperation: () => Promise<any>,
  context: ServiceDeskErrorContext,
  data: any
): Promise<FallbackResult<any>> {
  return defaultFallbackSystem.executeWithFallback(
    persistenceOperation,
    context,
    'data_persistence',
    data
  )
}

export async function executeExportWithFallback(
  exportOperation: () => Promise<any>,
  context: ServiceDeskErrorContext,
  data: any
): Promise<FallbackResult<any>> {
  return defaultFallbackSystem.executeWithFallback(
    exportOperation,
    context,
    'export',
    data
  )
}