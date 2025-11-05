/**
 * Índice centralizado de todos os tipos do sistema
 * Exporta tipos organizados por módulo para facilitar importações
 */

// Enums
export * from './enums'

// Tipos base
export * from './base'

// Tipos de RFP e licitações
export * from './rfp'

// Tipos de editais
export * from './edital'

// Tipos de PDF (nova estrutura modularizada)
export * from './pdf'

// Tipos de outsourcing
export * from './outsourcing'

// Tipos de service desk
export * from './service-desk'

// Re-exportações organizadas por módulo para facilitar importações específicas
export * as Enums from './enums'
export * as Base from './base'
export * as RFP from './rfp'
export * as Edital from './edital'
export * as PDF from './pdf'
export * as Outsourcing from './outsourcing'
export * as ServiceDesk from './service-desk'

// Tipos legados mantidos para compatibilidade (serão removidos gradualmente)
export type { Partner, Quote, Proposal, RO, Training } from './base'
export type { 
  RFP as RFPLegacy, 
  PriceRecord, 
  PriceRecordItem, 
  BidFile, 
  BidDocs 
} from './rfp'
export type {
  Edital as EditalLegacy,
  EditalFile,
  EditalAIAnalysis,
  EditalDocument,
  EditalProduct,
  EditalAnalysis,
  AnalysisType,
  AnalysisResult,
  ProductItem,
  SuggestedModel,
  DocumentRequirement
} from './edital'

// Navegação (mantido no base por ser usado globalmente)
export type { NavItem, NavSubItem } from './base'

// Utilitários de tipo
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>

// Helpers para IDs
export type StringID = string
export type NumberID = number
export type EntityID = StringID | NumberID

// Helpers para status
export type StatusType = 
  | 'Ativo' | 'Inativo'
  | 'Pendente' | 'Aprovado' | 'Rejeitado'
  | 'Rascunho' | 'Enviado' | 'Finalizado'

// Helpers para datas
export type DateString = string // ISO date string
export type TimestampString = string // ISO datetime string

// Helpers para arquivos
export type FileExtension = 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'jpg' | 'png' | 'gif'
export type MimeType = string

// Helpers para valores monetários
export type CurrencyValue = number
export type PercentageValue = number // 0-100

// Helpers para validação
export interface ValidationError {
  field: string
  message: string
  code?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings?: ValidationError[]
}

// Helpers para paginação e filtros
export interface SortConfig {
  field: string
  direction: 'asc' | 'desc'
}

export interface FilterConfig {
  [key: string]: any
}

export interface SearchConfig {
  query: string
  fields: string[]
  caseSensitive?: boolean
}

// Helpers para formulários
export type FormFieldType = 
  | 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  | 'select' | 'multiselect' | 'checkbox' | 'radio'
  | 'date' | 'datetime' | 'time'
  | 'textarea' | 'file' | 'image'

export interface FormField {
  name: string
  label: string
  type: FormFieldType
  required?: boolean
  placeholder?: string
  options?: Array<{ value: any; label: string }>
  validation?: {
    min?: number
    max?: number
    pattern?: string
    custom?: (value: any) => boolean | string
  }
}

// Helpers para notificações
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  actions?: Array<{
    label: string
    action: () => void
  }>
}

// Modules already exported above