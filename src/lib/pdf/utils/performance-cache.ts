/**
 * Performance Cache for PDF Generation
 * Implements caching for templates and optimizations for PDF generation
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

interface TemplateCache {
  compiledTemplate?: string
  fontMetrics?: Record<string, any>
  colorPalette?: Record<string, [number, number, number]>
}

interface PDFOptimizationConfig {
  enableCache: boolean
  cacheExpiration: number // in milliseconds
  maxCacheSize: number
  compressionLevel: number
  imageQuality: number
}

/**
 * PDF Performance Cache Manager
 */
export class PDFPerformanceCache {
  private cache = new Map<string, CacheEntry<any>>()
  private templateCache = new Map<string, TemplateCache>()
  private config: PDFOptimizationConfig

  constructor(config?: Partial<PDFOptimizationConfig>) {
    this.config = {
      enableCache: true,
      cacheExpiration: 30 * 60 * 1000, // 30 minutes
      maxCacheSize: 50,
      compressionLevel: 6,
      imageQuality: 0.8,
      ...config
    }
  }

  /**
   * Get cached template data
   */
  getTemplate(templateKey: string): TemplateCache | null {
    if (!this.config.enableCache) return null

    const cached = this.templateCache.get(templateKey)
    if (cached) {
      return cached
    }
    return null
  }

  /**
   * Cache template data for reuse
   */
  setTemplate(templateKey: string, template: TemplateCache): void {
    if (!this.config.enableCache) return

    // Manage cache size
    if (this.templateCache.size >= this.config.maxCacheSize) {
      const firstKey = this.templateCache.keys().next().value
      this.templateCache.delete(firstKey)
    }

    this.templateCache.set(templateKey, template)
  }

  /**
   * Get cached data with expiration check
   */
  get<T>(key: string): T | null {
    if (!this.config.enableCache) return null

    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Set cached data with expiration
   */
  set<T>(key: string, data: T, customExpiration?: number): void {
    if (!this.config.enableCache) return

    const expiration = customExpiration || this.config.cacheExpiration
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + expiration
    }

    // Manage cache size
    if (this.cache.size >= this.config.maxCacheSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, entry)
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear()
    this.templateCache.clear()
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      templateCacheSize: this.templateCache.size,
      maxCacheSize: this.config.maxCacheSize,
      config: this.config
    }
  }

  /**
   * Generate cache key for proposal data
   */
  generateProposalKey(proposalData: any, clientData: any): string {
    const dataString = JSON.stringify({ proposalData, clientData })
    return this.hashString(dataString)
  }

  /**
   * Simple hash function for cache keys
   */
  private hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36)
  }
}

/**
 * Global cache instance
 */
export const pdfCache = new PDFPerformanceCache()

/**
 * PDF Size Optimization utilities
 */
export class PDFSizeOptimizer {
  /**
   * Optimize PDF generation settings for smaller file size
   */
  static getOptimizedSettings() {
    return {
      compress: true,
      precision: 2,
      userUnit: 1.0,
      hotfixes: ['px_scaling'],
      format: 'a4',
      orientation: 'portrait'
    }
  }

  /**
   * Compress image data before adding to PDF
   */
  static compressImage(imageData: string, quality: number = 0.8): string {
    // Create canvas for image compression
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    return new Promise<string>((resolve) => {
      img.onload = () => {
        // Calculate optimal dimensions
        const maxWidth = 800
        const maxHeight = 600
        let { width, height } = img

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = imageData
    }) as any
  }

  /**
   * Optimize text rendering for smaller PDF size
   */
  static optimizeTextSettings() {
    return {
      fontSize: {
        title: 14,
        header: 12,
        body: 10,
        small: 8
      },
      lineHeight: 1.2,
      maxLineLength: 80
    }
  }
}