/**
 * Tipos relacionados ao cache e otimização de PDF
 */

// Configurações de cache de PDF
export interface PDFCacheConfig {
  enableCache: boolean
  cacheExpiration: number // em milliseconds
  maxCacheSize: number
  compressionLevel: number
  imageQuality: number
}

// Entrada de cache genérica
export interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

// Cache de template
export interface TemplateCache {
  compiledTemplate?: string
  fontMetrics?: Record<string, any>
  colorPalette?: Record<string, [number, number, number]>
}

// Configurações de otimização de PDF
export interface PDFOptimizationConfig {
  compress: boolean
  precision: number
  userUnit: number
  hotfixes: string[]
  format: string
  orientation: string
}

// Configurações de texto otimizado
export interface OptimizedTextSettings {
  fontSize: {
    title: number
    header: number
    body: number
    small: number
  }
  lineHeight: number
  maxLineLength: number
}

// Estatísticas de cache
export interface CacheStats {
  cacheSize: number
  templateCacheSize: number
  maxCacheSize: number
  hitRate: number
  config: PDFCacheConfig
}

// Configurações de performance
export interface PDFPerformanceConfig {
  enableLazyLoading: boolean
  batchSize: number
  processingDelay: number
  memoryThreshold: number
  enableWorkers: boolean
}

// Métricas de performance
export interface PDFPerformanceMetrics {
  generationTime: number
  memoryUsage: number
  cacheHitRate: number
  errorRate: number
  averageFileSize: number
}