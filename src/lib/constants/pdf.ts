/**
 * Constantes relacionadas ao sistema de PDF
 */

import { PDFCacheConfig, PDFOptimizationConfig } from '../types/pdf/cache'
import { PDFSizeLimits } from '../types/pdf/errors'
import { PDFFormat, PDFOrientation, CompressionLevel } from '../types/pdf/enums'

// Limites padrão de tamanho de PDF
export const DEFAULT_PDF_SIZE_LIMITS: PDFSizeLimits = {
  maxEquipments: 100,
  maxEquipmentsWarning: 20,
  maxPDFSizeMB: 10,
  maxPDFSizeWarningMB: 5,
  maxProcessingTimeMs: 30000, // 30 segundos
  maxMemoryUsageMB: 100
}

// Configuração padrão de cache
export const DEFAULT_PDF_CACHE_CONFIG: PDFCacheConfig = {
  enableCache: true,
  cacheExpiration: 1000 * 60 * 30, // 30 minutos
  maxCacheSize: 50, // 50 entradas
  compressionLevel: 2, // Médio
  imageQuality: 0.8 // 80%
}

// Configuração padrão de otimização
export const DEFAULT_PDF_OPTIMIZATION_CONFIG: PDFOptimizationConfig = {
  compress: true,
  precision: 2,
  userUnit: 1.0,
  hotfixes: [],
  format: PDFFormat.A4,
  orientation: PDFOrientation.PORTRAIT
}

// Configurações de fonte padrão
export const DEFAULT_FONT_SIZES = {
  title: 18,
  header: 14,
  body: 10,
  small: 8,
  tiny: 6
} as const

// Configurações de margem padrão (em mm)
export const DEFAULT_MARGINS = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20
} as const

// Configurações de cor padrão
export const DEFAULT_COLORS = {
  primary: [0, 102, 204] as [number, number, number], // Azul
  secondary: [108, 117, 125] as [number, number, number], // Cinza
  success: [40, 167, 69] as [number, number, number], // Verde
  danger: [220, 53, 69] as [number, number, number], // Vermelho
  warning: [255, 193, 7] as [number, number, number], // Amarelo
  info: [23, 162, 184] as [number, number, number], // Ciano
  light: [248, 249, 250] as [number, number, number], // Cinza claro
  dark: [52, 58, 64] as [number, number, number], // Cinza escuro
  white: [255, 255, 255] as [number, number, number],
  black: [0, 0, 0] as [number, number, number]
} as const

// Configurações de linha padrão
export const DEFAULT_LINE_SETTINGS = {
  width: 0.5,
  style: 'solid',
  color: DEFAULT_COLORS.dark
} as const

// Configurações de tabela padrão
export const DEFAULT_TABLE_SETTINGS = {
  headerHeight: 8,
  rowHeight: 6,
  cellPadding: 2,
  borderWidth: 0.3,
  alternateRowColor: DEFAULT_COLORS.light
} as const

// Mensagens de erro padrão
export const PDF_ERROR_MESSAGES = {
  'GENERATION_FAILED': 'Falha na geração do PDF. Verifique os dados e tente novamente.',
  'STORAGE_FAILED': 'Erro ao salvar o PDF. Verifique o espaço disponível no navegador.',
  'INVALID_DATA': 'Dados inválidos detectados. Verifique as informações inseridas.',
  'BROWSER_NOT_SUPPORTED': 'Seu navegador não suporta esta funcionalidade. Atualize ou use outro navegador.'
} as const

// Extensões de arquivo suportadas
export const SUPPORTED_FILE_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif'
] as const

// Tipos MIME suportados
export const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif'
] as const

// Configurações de validação
export const VALIDATION_RULES = {
  minCompanyNameLength: 2,
  maxCompanyNameLength: 100,
  minProjectNameLength: 5,
  maxProjectNameLength: 80,
  minEquipmentModelLength: 2,
  maxEquipmentModelLength: 100,
  minContractPeriod: 1,
  maxContractPeriod: 60,
  maxEquipmentVolume: 100000,
  maxEquipmentCost: 10000,
  emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phoneRegex: /^\(\d{2}\)\s\d{4,5}-\d{4}$/ // Formato brasileiro
} as const

// Configurações de performance
export const PERFORMANCE_SETTINGS = {
  batchSize: 10, // Processar equipamentos em lotes
  processingDelay: 100, // ms entre lotes
  memoryThreshold: 0.8, // 80% da memória disponível
  maxRetries: 3,
  retryDelay: 1000 // ms
} as const

// Configurações de cache por tipo
export const CACHE_SETTINGS = {
  template: {
    ttl: 1000 * 60 * 60, // 1 hora
    maxSize: 10
  },
  proposal: {
    ttl: 1000 * 60 * 30, // 30 minutos
    maxSize: 50
  },
  validation: {
    ttl: 1000 * 60 * 5, // 5 minutos
    maxSize: 100
  }
} as const

// Configurações de compressão por nível
export const COMPRESSION_SETTINGS = {
  [CompressionLevel.NONE]: {
    imageQuality: 1.0,
    precision: 3,
    compress: false
  },
  [CompressionLevel.LOW]: {
    imageQuality: 0.9,
    precision: 2,
    compress: true
  },
  [CompressionLevel.MEDIUM]: {
    imageQuality: 0.8,
    precision: 2,
    compress: true
  },
  [CompressionLevel.HIGH]: {
    imageQuality: 0.7,
    precision: 1,
    compress: true
  },
  [CompressionLevel.MAXIMUM]: {
    imageQuality: 0.6,
    precision: 1,
    compress: true
  }
} as const

// URLs e endpoints (se aplicável)
export const PDF_ENDPOINTS = {
  // Adicionar endpoints de API se necessário
} as const

// Configurações de desenvolvimento
export const DEV_SETTINGS = {
  enableDebugLogs: process.env.NODE_ENV === 'development',
  showPerformanceMetrics: process.env.NODE_ENV === 'development',
  enableErrorDetails: process.env.NODE_ENV === 'development'
} as const

// Exportação padrão com todas as constantes
export default {
  DEFAULT_PDF_SIZE_LIMITS,
  DEFAULT_PDF_CACHE_CONFIG,
  DEFAULT_PDF_OPTIMIZATION_CONFIG,
  DEFAULT_FONT_SIZES,
  DEFAULT_MARGINS,
  DEFAULT_COLORS,
  DEFAULT_LINE_SETTINGS,
  DEFAULT_TABLE_SETTINGS,
  PDF_ERROR_MESSAGES,
  SUPPORTED_FILE_EXTENSIONS,
  SUPPORTED_MIME_TYPES,
  VALIDATION_RULES,
  PERFORMANCE_SETTINGS,
  CACHE_SETTINGS,
  COMPRESSION_SETTINGS,
  PDF_ENDPOINTS,
  DEV_SETTINGS
}