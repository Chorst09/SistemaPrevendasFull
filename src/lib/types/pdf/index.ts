/**
 * Índice centralizado dos tipos de PDF
 * Exporta todos os tipos organizados por módulo
 */

// Core types
export * from './core'

// Error and validation types
export * from './errors'

// Component types
export * from './components'

// Cache and optimization types
export * from './cache'

// Hook types
export * from './hooks'

// Enum types
export * from './enums'

// Re-exportações organizadas por módulo
export * as PDFCore from './core'
export * as PDFErrors from './errors'
export * as PDFComponents from './components'
export * as PDFCache from './cache'
export * as PDFHooks from './hooks'
export * as PDFEnums from './enums'

// Tipos legados para compatibilidade (serão removidos gradualmente)
export type {
  ProposalData as LegacyProposalData,
  ClientData as LegacyClientData,
  EquipmentItem as LegacyEquipmentItem,
  SavedProposal as LegacySavedProposal
} from './core'

export type {
  PDFError as LegacyPDFError,
  PDFErrorType as LegacyPDFErrorType
} from './errors'

// Default export com todos os módulos
export default {
  Core: require('./core'),
  Errors: require('./errors'),
  Components: require('./components'),
  Cache: require('./cache'),
  Hooks: require('./hooks')
}