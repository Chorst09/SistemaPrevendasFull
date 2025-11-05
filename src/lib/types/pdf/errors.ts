/**
 * Tipos relacionados a erros e validação de PDF
 */

// Tipos de erro de PDF
export enum PDFErrorType {
  GENERATION_FAILED = 'GENERATION_FAILED',
  STORAGE_FAILED = 'STORAGE_FAILED',
  INVALID_DATA = 'INVALID_DATA',
  BROWSER_NOT_SUPPORTED = 'BROWSER_NOT_SUPPORTED'
}

// Status de PDF
export enum PDFStatus {
  GENERATING = 'Gerando',
  COMPLETED = 'Concluído',
  ERROR = 'Erro'
}

// Erro de PDF
export interface PDFError {
  type: PDFErrorType
  message: string
  details?: any
}

// Resultado de validação de PDF
export interface PDFValidationResult {
  valid: boolean
  errors: string[]
  warnings?: string[]
}

// Regra de validação
export interface ValidationRule<T> {
  name: string
  validate: (data: T) => ValidationResult
  severity: 'error' | 'warning' | 'info'
  autoFix?: (data: T) => T
}

// Resultado de validação individual
export interface ValidationResult {
  valid: boolean
  message?: string
  details?: any
  suggestedFix?: string
}

// Relatório de validação completo
export interface ValidationReport {
  valid: boolean
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
  infos: ValidationIssue[]
  canAutoFix: boolean
  fixedData?: {
    proposalData?: any
    clientData?: any
  }
}

// Issue de validação
export interface ValidationIssue {
  rule: string
  message: string
  severity: 'error' | 'warning' | 'info'
  field?: string
  suggestedFix?: string
  autoFixAvailable: boolean
}

// Resultado de verificação de limites de tamanho
export interface SizeLimitResult {
  withinLimits: boolean
  warnings: string[]
  errors: string[]
  estimatedSizeMB: number
  estimatedProcessingTimeMs: number
  recommendations: string[]
}

// Configuração de limites de PDF
export interface PDFSizeLimits {
  maxEquipments: number
  maxEquipmentsWarning: number
  maxPDFSizeMB: number
  maxPDFSizeWarningMB: number
  maxProcessingTimeMs: number
  maxMemoryUsageMB: number
}