/**
 * Tipos para hooks relacionados ao PDF
 */

import { ProposalData, ClientData } from './core'
import { ValidationReport } from './errors'

// Opções do hook de validação de PDF
export interface UsePDFValidationOptions {
  autoValidate?: boolean
  showBrowserWarnings?: boolean
}

// Retorno do hook de validação de PDF
export interface UsePDFValidationReturn {
  // Estado de validação
  validationReport: ValidationReport | null
  isValidating: boolean
  browserCompatible: boolean
  browserIssues: string[]
  
  // Ações de validação
  validate: () => void
  applyFixes: () => { proposalData: ProposalData; clientData: ClientData } | null
  clearValidation: () => void
  
  // Propriedades computadas
  hasErrors: boolean
  hasWarnings: boolean
  hasInfos: boolean
  canProceed: boolean
  canAutoFix: boolean
  
  // Resumo de validação
  validationSummary: string
}

// Opções do hook de edição de proposta
export interface UseProposalEditingOptions {
  autoSave?: boolean
  autoSaveDelay?: number
  validateOnChange?: boolean
}

// Estado de edição de proposta
export interface ProposalEditingState {
  isEditing: boolean
  isDirty: boolean
  isSaving: boolean
  hasUnsavedChanges: boolean
  lastSaved?: Date
  validationErrors: string[]
}

// Retorno do hook de edição de proposta
export interface UseProposalEditingReturn {
  // Estado
  state: ProposalEditingState
  proposalData: ProposalData
  clientData: ClientData
  
  // Ações
  updateProposalData: (data: Partial<ProposalData>) => void
  updateClientData: (data: Partial<ClientData>) => void
  save: () => Promise<boolean>
  reset: () => void
  startEditing: () => void
  stopEditing: () => void
  
  // Validação
  validate: () => boolean
  clearValidationErrors: () => void
}

// Opções do hook de cache de PDF
export interface UsePDFCacheOptions {
  enableCache?: boolean
  cacheExpiration?: number
  maxCacheSize?: number
}

// Retorno do hook de cache de PDF
export interface UsePDFCacheReturn {
  // Estado do cache
  cacheSize: number
  hitRate: number
  isEnabled: boolean
  
  // Ações do cache
  get: <T>(key: string) => T | null
  set: <T>(key: string, value: T, ttl?: number) => void
  remove: (key: string) => void
  clear: () => void
  
  // Estatísticas
  getStats: () => any // CacheStats
}