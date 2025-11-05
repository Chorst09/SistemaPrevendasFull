/**
 * Error types and interfaces for Service Desk Pricing System
 */

export enum ServiceDeskErrorType {
  // Calculation errors
  CALCULATION_ERROR = 'calculation_error',
  INVALID_CALCULATION_INPUT = 'invalid_calculation_input',
  CALCULATION_OVERFLOW = 'calculation_overflow',
  
  // Validation errors
  VALIDATION_ERROR = 'validation_error',
  REQUIRED_FIELD_MISSING = 'required_field_missing',
  INVALID_DATA_FORMAT = 'invalid_data_format',
  DATA_CONSISTENCY_ERROR = 'data_consistency_error',
  
  // Data persistence errors
  DATA_PERSISTENCE_ERROR = 'data_persistence_error',
  STORAGE_QUOTA_EXCEEDED = 'storage_quota_exceeded',
  DATA_CORRUPTION = 'data_corruption',
  SYNC_ERROR = 'sync_error',
  
  // Navigation errors
  NAVIGATION_ERROR = 'navigation_error',
  TAB_TRANSITION_BLOCKED = 'tab_transition_blocked',
  UNSAVED_CHANGES = 'unsaved_changes',
  
  // Integration errors
  INTEGRATION_ERROR = 'integration_error',
  PDF_GENERATION_FAILED = 'pdf_generation_failed',
  EXPORT_FAILED = 'export_failed',
  
  // System errors
  SYSTEM_ERROR = 'system_error',
  BROWSER_NOT_SUPPORTED = 'browser_not_supported',
  MEMORY_ERROR = 'memory_error',
  NETWORK_ERROR = 'network_error'
}

export interface ServiceDeskError {
  type: ServiceDeskErrorType
  message: string
  details?: any
  tabId?: string
  timestamp: Date
  severity?: 'low' | 'medium' | 'high' | 'critical'
  recoverable?: boolean
  userAction?: string
}

export interface ServiceDeskErrorContext {
  tabId?: string
  operation?: string
  data?: any
  userAgent?: string
  timestamp: Date
}

export interface ErrorRecoveryOption {
  label: string
  action: string
  description: string
  severity: 'safe' | 'caution' | 'destructive'
}

export interface ErrorHandlingConfig {
  enableRetry: boolean
  maxRetryAttempts: number
  retryDelay: number
  enableFallback: boolean
  enableLogging: boolean
  enableUserReporting: boolean
}

export interface ValidationErrorDetail {
  field: string
  value: any
  expectedType: string
  constraint?: string
  suggestion?: string
}

export interface CalculationErrorDetail {
  operation: string
  inputs: any[]
  expectedOutput?: any
  actualOutput?: any
  formula?: string
}

export interface DataPersistenceErrorDetail {
  operation: 'save' | 'load' | 'delete' | 'sync'
  dataType: string
  dataSize?: number
  storageType: 'localStorage' | 'indexedDB' | 'sessionStorage'
}

export interface NavigationErrorDetail {
  fromTab: string
  toTab: string
  blockedReason: string
  unsavedFields?: string[]
}

export interface IntegrationErrorDetail {
  service: string
  endpoint?: string
  requestData?: any
  responseStatus?: number
  responseData?: any
}

// Error factory functions
export const createServiceDeskError = (
  type: ServiceDeskErrorType,
  message: string,
  context?: ServiceDeskErrorContext,
  details?: any
): ServiceDeskError => {
  return {
    type,
    message,
    details: {
      ...details,
      context
    },
    tabId: context?.tabId,
    timestamp: new Date(),
    severity: getErrorSeverity(type),
    recoverable: isErrorRecoverable(type)
  }
}

export const getErrorSeverity = (type: ServiceDeskErrorType): 'low' | 'medium' | 'high' | 'critical' => {
  switch (type) {
    case ServiceDeskErrorType.VALIDATION_ERROR:
    case ServiceDeskErrorType.REQUIRED_FIELD_MISSING:
    case ServiceDeskErrorType.INVALID_DATA_FORMAT:
      return 'low'
    
    case ServiceDeskErrorType.CALCULATION_ERROR:
    case ServiceDeskErrorType.INVALID_CALCULATION_INPUT:
    case ServiceDeskErrorType.NAVIGATION_ERROR:
    case ServiceDeskErrorType.TAB_TRANSITION_BLOCKED:
    case ServiceDeskErrorType.UNSAVED_CHANGES:
      return 'medium'
    
    case ServiceDeskErrorType.DATA_PERSISTENCE_ERROR:
    case ServiceDeskErrorType.STORAGE_QUOTA_EXCEEDED:
    case ServiceDeskErrorType.INTEGRATION_ERROR:
    case ServiceDeskErrorType.PDF_GENERATION_FAILED:
    case ServiceDeskErrorType.EXPORT_FAILED:
    case ServiceDeskErrorType.CALCULATION_OVERFLOW:
      return 'high'
    
    case ServiceDeskErrorType.SYSTEM_ERROR:
    case ServiceDeskErrorType.DATA_CORRUPTION:
    case ServiceDeskErrorType.BROWSER_NOT_SUPPORTED:
    case ServiceDeskErrorType.MEMORY_ERROR:
    case ServiceDeskErrorType.NETWORK_ERROR:
      return 'critical'
    
    default:
      return 'medium'
  }
}

export const isErrorRecoverable = (type: ServiceDeskErrorType): boolean => {
  switch (type) {
    case ServiceDeskErrorType.VALIDATION_ERROR:
    case ServiceDeskErrorType.REQUIRED_FIELD_MISSING:
    case ServiceDeskErrorType.INVALID_DATA_FORMAT:
    case ServiceDeskErrorType.CALCULATION_ERROR:
    case ServiceDeskErrorType.INVALID_CALCULATION_INPUT:
    case ServiceDeskErrorType.NAVIGATION_ERROR:
    case ServiceDeskErrorType.TAB_TRANSITION_BLOCKED:
    case ServiceDeskErrorType.UNSAVED_CHANGES:
    case ServiceDeskErrorType.SYNC_ERROR:
      return true
    
    case ServiceDeskErrorType.DATA_PERSISTENCE_ERROR:
    case ServiceDeskErrorType.STORAGE_QUOTA_EXCEEDED:
    case ServiceDeskErrorType.INTEGRATION_ERROR:
    case ServiceDeskErrorType.PDF_GENERATION_FAILED:
    case ServiceDeskErrorType.EXPORT_FAILED:
    case ServiceDeskErrorType.NETWORK_ERROR:
      return true
    
    case ServiceDeskErrorType.DATA_CORRUPTION:
    case ServiceDeskErrorType.BROWSER_NOT_SUPPORTED:
    case ServiceDeskErrorType.MEMORY_ERROR:
    case ServiceDeskErrorType.SYSTEM_ERROR:
    case ServiceDeskErrorType.CALCULATION_OVERFLOW:
      return false
    
    default:
      return true
  }
}

export const getErrorRecoveryOptions = (error: ServiceDeskError): ErrorRecoveryOption[] => {
  const options: ErrorRecoveryOption[] = []

  switch (error.type) {
    case ServiceDeskErrorType.VALIDATION_ERROR:
    case ServiceDeskErrorType.REQUIRED_FIELD_MISSING:
    case ServiceDeskErrorType.INVALID_DATA_FORMAT:
      options.push(
        {
          label: 'Corrigir Dados',
          action: 'fix_validation',
          description: 'Voltar ao formulário para corrigir os dados',
          severity: 'safe'
        },
        {
          label: 'Usar Valores Padrão',
          action: 'use_defaults',
          description: 'Preencher campos vazios com valores padrão',
          severity: 'caution'
        }
      )
      break

    case ServiceDeskErrorType.CALCULATION_ERROR:
    case ServiceDeskErrorType.INVALID_CALCULATION_INPUT:
      options.push(
        {
          label: 'Recalcular',
          action: 'recalculate',
          description: 'Tentar recalcular com os dados atuais',
          severity: 'safe'
        },
        {
          label: 'Resetar Cálculos',
          action: 'reset_calculations',
          description: 'Limpar todos os cálculos e começar novamente',
          severity: 'destructive'
        }
      )
      break

    case ServiceDeskErrorType.DATA_PERSISTENCE_ERROR:
    case ServiceDeskErrorType.STORAGE_QUOTA_EXCEEDED:
      options.push(
        {
          label: 'Tentar Salvar Novamente',
          action: 'retry_save',
          description: 'Tentar salvar os dados novamente',
          severity: 'safe'
        },
        {
          label: 'Exportar Dados',
          action: 'export_backup',
          description: 'Exportar dados como backup',
          severity: 'safe'
        },
        {
          label: 'Limpar Cache',
          action: 'clear_cache',
          description: 'Limpar dados antigos para liberar espaço',
          severity: 'caution'
        }
      )
      break

    case ServiceDeskErrorType.NAVIGATION_ERROR:
    case ServiceDeskErrorType.TAB_TRANSITION_BLOCKED:
      options.push(
        {
          label: 'Salvar e Continuar',
          action: 'save_and_continue',
          description: 'Salvar dados atuais e prosseguir',
          severity: 'safe'
        },
        {
          label: 'Descartar Alterações',
          action: 'discard_changes',
          description: 'Descartar alterações não salvas',
          severity: 'destructive'
        }
      )
      break

    case ServiceDeskErrorType.INTEGRATION_ERROR:
    case ServiceDeskErrorType.PDF_GENERATION_FAILED:
      options.push(
        {
          label: 'Tentar Novamente',
          action: 'retry_integration',
          description: 'Tentar a operação novamente',
          severity: 'safe'
        },
        {
          label: 'Usar Método Alternativo',
          action: 'alternative_method',
          description: 'Usar método alternativo de exportação',
          severity: 'caution'
        }
      )
      break

    case ServiceDeskErrorType.SYSTEM_ERROR:
    case ServiceDeskErrorType.BROWSER_NOT_SUPPORTED:
      options.push(
        {
          label: 'Recarregar Página',
          action: 'reload_page',
          description: 'Recarregar a página completamente',
          severity: 'caution'
        },
        {
          label: 'Exportar Dados',
          action: 'export_data',
          description: 'Exportar dados antes de sair',
          severity: 'safe'
        }
      )
      break

    default:
      options.push(
        {
          label: 'Tentar Novamente',
          action: 'retry',
          description: 'Tentar a operação novamente',
          severity: 'safe'
        }
      )
  }

  return options
}

// Error message templates
export const getErrorMessage = (error: ServiceDeskError): string => {
  const baseMessages: Record<ServiceDeskErrorType, string> = {
    [ServiceDeskErrorType.CALCULATION_ERROR]: 'Erro nos cálculos de precificação',
    [ServiceDeskErrorType.INVALID_CALCULATION_INPUT]: 'Dados inválidos para cálculo',
    [ServiceDeskErrorType.CALCULATION_OVERFLOW]: 'Valores muito grandes para calcular',
    [ServiceDeskErrorType.VALIDATION_ERROR]: 'Erro de validação de dados',
    [ServiceDeskErrorType.REQUIRED_FIELD_MISSING]: 'Campos obrigatórios não preenchidos',
    [ServiceDeskErrorType.INVALID_DATA_FORMAT]: 'Formato de dados inválido',
    [ServiceDeskErrorType.DATA_CONSISTENCY_ERROR]: 'Inconsistência nos dados',
    [ServiceDeskErrorType.DATA_PERSISTENCE_ERROR]: 'Erro ao salvar dados',
    [ServiceDeskErrorType.STORAGE_QUOTA_EXCEEDED]: 'Espaço de armazenamento esgotado',
    [ServiceDeskErrorType.DATA_CORRUPTION]: 'Dados corrompidos detectados',
    [ServiceDeskErrorType.SYNC_ERROR]: 'Erro de sincronização',
    [ServiceDeskErrorType.NAVIGATION_ERROR]: 'Erro na navegação',
    [ServiceDeskErrorType.TAB_TRANSITION_BLOCKED]: 'Transição entre abas bloqueada',
    [ServiceDeskErrorType.UNSAVED_CHANGES]: 'Alterações não salvas',
    [ServiceDeskErrorType.INTEGRATION_ERROR]: 'Erro de integração',
    [ServiceDeskErrorType.PDF_GENERATION_FAILED]: 'Falha na geração do PDF',
    [ServiceDeskErrorType.EXPORT_FAILED]: 'Falha na exportação',
    [ServiceDeskErrorType.SYSTEM_ERROR]: 'Erro interno do sistema',
    [ServiceDeskErrorType.BROWSER_NOT_SUPPORTED]: 'Navegador não suportado',
    [ServiceDeskErrorType.MEMORY_ERROR]: 'Erro de memória',
    [ServiceDeskErrorType.NETWORK_ERROR]: 'Erro de conexão'
  }

  return error.message || baseMessages[error.type] || 'Erro desconhecido'
}

// Error logging interface
export interface ErrorLog {
  id: string
  error: ServiceDeskError
  context: ServiceDeskErrorContext
  resolved: boolean
  resolvedAt?: Date
  resolution?: string
}

export interface ErrorReporter {
  logError(error: ServiceDeskError, context: ServiceDeskErrorContext): void
  getErrorLogs(): ErrorLog[]
  markErrorResolved(errorId: string, resolution: string): void
  clearErrorLogs(): void
}