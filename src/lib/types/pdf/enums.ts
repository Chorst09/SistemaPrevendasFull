/**
 * Enums específicos do sistema de PDF
 */

// Status de PDF
export enum PDFStatus {
  GENERATING = 'Gerando',
  COMPLETED = 'Concluído',
  ERROR = 'Erro'
}

// Tipos de erro de PDF
export enum PDFErrorType {
  GENERATION_FAILED = 'GENERATION_FAILED',
  STORAGE_FAILED = 'STORAGE_FAILED',
  INVALID_DATA = 'INVALID_DATA',
  BROWSER_NOT_SUPPORTED = 'BROWSER_NOT_SUPPORTED'
}

// Tipos de módulo de precificação
export enum PricingModule {
  IT_PRICING = 'IT Pricing',
  PRINTER_OUTSOURCING = 'Printer Outsourcing',
  SERVICE_DESK = 'Service Desk'
}

// Tipos de template de PDF
export enum PDFTemplateType {
  STANDARD = 'Standard',
  SIMPLE = 'Simple',
  DETAILED = 'Detailed',
  CUSTOM = 'Custom'
}

// Orientação do PDF
export enum PDFOrientation {
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape'
}

// Formato do PDF
export enum PDFFormat {
  A4 = 'a4',
  A3 = 'a3',
  LETTER = 'letter',
  LEGAL = 'legal'
}

// Qualidade de compressão
export enum CompressionLevel {
  NONE = 0,
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  MAXIMUM = 4
}

// Tipos de cache
export enum CacheType {
  MEMORY = 'memory',
  LOCAL_STORAGE = 'localStorage',
  INDEXED_DB = 'indexedDB'
}

// Severidade de validação
export enum ValidationSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

// Estratégias de recuperação de erro
export enum ErrorRecoveryStrategy {
  SIMPLE_TEMPLATE = 'simple_template',
  DIRECT_DOWNLOAD = 'direct_download',
  REDUCE_EQUIPMENT = 'reduce_equipment',
  EXPORT_DATA = 'export_data',
  COPY_TEXT = 'copy_text',
  USE_DEFAULTS = 'use_defaults'
}

export default {
  PDFStatus,
  PDFErrorType,
  PricingModule,
  PDFTemplateType,
  PDFOrientation,
  PDFFormat,
  CompressionLevel,
  CacheType,
  ValidationSeverity,
  ErrorRecoveryStrategy
}