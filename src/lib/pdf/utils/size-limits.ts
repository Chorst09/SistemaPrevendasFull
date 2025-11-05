import { ProposalData, PDFError, PDFErrorType } from '../types'
import { pdfErrorHandler } from './error-handling'

/**
 * PDF size and performance limits configuration
 */
export interface PDFSizeLimits {
  maxEquipments: number
  maxEquipmentsWarning: number
  maxPDFSizeMB: number
  maxPDFSizeWarningMB: number
  maxProcessingTimeMs: number
  maxMemoryUsageMB: number
}

/**
 * Default size limits for PDF generation
 */
export const DEFAULT_PDF_LIMITS: PDFSizeLimits = {
  maxEquipments: 100,
  maxEquipmentsWarning: 20,
  maxPDFSizeMB: 10,
  maxPDFSizeWarningMB: 5,
  maxProcessingTimeMs: 30000, // 30 seconds
  maxMemoryUsageMB: 100
}

/**
 * Size limit check result
 */
export interface SizeLimitResult {
  withinLimits: boolean
  warnings: string[]
  errors: string[]
  estimatedSizeMB: number
  estimatedProcessingTimeMs: number
  recommendations: string[]
}

/**
 * PDF size and performance limit checker
 */
export class PDFSizeLimitChecker {
  private limits: PDFSizeLimits

  constructor(limits: PDFSizeLimits = DEFAULT_PDF_LIMITS) {
    this.limits = limits
  }

  /**
   * Check if proposal data is within size limits
   */
  checkLimits(proposalData: ProposalData): SizeLimitResult {
    const warnings: string[] = []
    const errors: string[] = []
    const recommendations: string[] = []

    const equipmentCount = proposalData.equipments.length
    const estimatedSizeMB = this.estimatePDFSize(proposalData)
    const estimatedProcessingTimeMs = this.estimateProcessingTime(proposalData)

    // Check equipment count limits
    if (equipmentCount > this.limits.maxEquipments) {
      errors.push(
        `Muitos equipamentos (${equipmentCount}). Máximo permitido: ${this.limits.maxEquipments}`
      )
      recommendations.push('Divida a proposta em múltiplos documentos')
    } else if (equipmentCount > this.limits.maxEquipmentsWarning) {
      warnings.push(
        `Grande quantidade de equipamentos (${equipmentCount}). Recomendado: até ${this.limits.maxEquipmentsWarning}`
      )
      recommendations.push('Considere dividir em múltiplas propostas para melhor performance')
    }

    // Check estimated PDF size
    if (estimatedSizeMB > this.limits.maxPDFSizeMB) {
      errors.push(
        `PDF estimado muito grande (${estimatedSizeMB.toFixed(1)}MB). Máximo: ${this.limits.maxPDFSizeMB}MB`
      )
      recommendations.push('Reduza a quantidade de equipamentos ou use template simplificado')
    } else if (estimatedSizeMB > this.limits.maxPDFSizeWarningMB) {
      warnings.push(
        `PDF estimado grande (${estimatedSizeMB.toFixed(1)}MB). Recomendado: até ${this.limits.maxPDFSizeWarningMB}MB`
      )
      recommendations.push('Considere otimizar o conteúdo para reduzir o tamanho')
    }

    // Check estimated processing time
    if (estimatedProcessingTimeMs > this.limits.maxProcessingTimeMs) {
      warnings.push(
        `Tempo de processamento estimado alto (${Math.round(estimatedProcessingTimeMs / 1000)}s). Máximo recomendado: ${Math.round(this.limits.maxProcessingTimeMs / 1000)}s`
      )
      recommendations.push('A geração pode ser lenta. Considere reduzir a complexidade')
    }

    // Check for memory concerns
    const estimatedMemoryMB = this.estimateMemoryUsage(proposalData)
    if (estimatedMemoryMB > this.limits.maxMemoryUsageMB) {
      warnings.push(
        `Uso de memória estimado alto (${estimatedMemoryMB.toFixed(1)}MB). Pode causar lentidão`
      )
      recommendations.push('Feche outras abas do navegador para liberar memória')
    }

    // Check for specific data patterns that can cause issues
    const dataWarnings = this.checkDataPatterns(proposalData)
    warnings.push(...dataWarnings.warnings)
    recommendations.push(...dataWarnings.recommendations)

    return {
      withinLimits: errors.length === 0,
      warnings,
      errors,
      estimatedSizeMB,
      estimatedProcessingTimeMs,
      recommendations: [...new Set(recommendations)] // Remove duplicates
    }
  }

  /**
   * Estimate PDF file size based on content
   */
  private estimatePDFSize(proposalData: ProposalData): number {
    // Base size for PDF structure and styling
    let sizeMB = 0.1

    // Add size for each equipment (approximately 2KB per equipment)
    sizeMB += (proposalData.equipments.length * 2) / 1024

    // Add size for text content
    const totalTextLength = this.calculateTotalTextLength(proposalData)
    sizeMB += (totalTextLength * 0.001) / 1024 // Rough estimate

    // Add size for tables and formatting
    if (proposalData.equipments.length > 10) {
      sizeMB += 0.05 // Additional formatting overhead
    }

    return Math.max(sizeMB, 0.05) // Minimum 50KB
  }

  /**
   * Estimate processing time based on content complexity
   */
  private estimateProcessingTime(proposalData: ProposalData): number {
    // Base processing time
    let timeMs = 1000

    // Add time per equipment (approximately 50ms per equipment)
    timeMs += proposalData.equipments.length * 50

    // Add time for complex calculations
    const hasComplexData = proposalData.equipments.some(eq => 
      eq.specifications && Object.keys(eq.specifications).length > 5
    )
    if (hasComplexData) {
      timeMs += 2000
    }

    // Add time for large volumes
    const totalVolume = proposalData.equipments.reduce((sum, eq) => sum + eq.monthlyVolume, 0)
    if (totalVolume > 100000) {
      timeMs += 1000
    }

    return timeMs
  }

  /**
   * Estimate memory usage during PDF generation
   */
  private estimateMemoryUsage(proposalData: ProposalData): number {
    // Base memory for PDF generation
    let memoryMB = 10

    // Add memory per equipment
    memoryMB += proposalData.equipments.length * 0.1

    // Add memory for large text content
    const totalTextLength = this.calculateTotalTextLength(proposalData)
    memoryMB += (totalTextLength / 10000) // 1MB per 10k characters

    return memoryMB
  }

  /**
   * Calculate total text length in proposal
   */
  private calculateTotalTextLength(proposalData: ProposalData): number {
    let totalLength = 0

    proposalData.equipments.forEach(equipment => {
      totalLength += (equipment.model || '').length
      totalLength += (equipment.brand || '').length
      totalLength += (equipment.type || '').length
      
      if (equipment.specifications) {
        Object.values(equipment.specifications).forEach(value => {
          totalLength += String(value).length
        })
      }
    })

    return totalLength
  }

  /**
   * Check for specific data patterns that can cause issues
   */
  private checkDataPatterns(proposalData: ProposalData): {
    warnings: string[]
    recommendations: string[]
  } {
    const warnings: string[] = []
    const recommendations: string[] = []

    // Check for very long text fields
    const longTextFields = proposalData.equipments.filter(eq => 
      eq.model.length > 100 || eq.brand.length > 50
    )
    if (longTextFields.length > 0) {
      warnings.push(`${longTextFields.length} equipamento(s) com nomes muito longos`)
      recommendations.push('Use nomes mais concisos para equipamentos')
    }

    // Check for very high volumes
    const highVolumeEquipments = proposalData.equipments.filter(eq => 
      eq.monthlyVolume > 50000
    )
    if (highVolumeEquipments.length > 0) {
      warnings.push(`${highVolumeEquipments.length} equipamento(s) com volume muito alto`)
      recommendations.push('Verifique se os volumes estão corretos')
    }

    // Check for very high costs
    const highCostEquipments = proposalData.equipments.filter(eq => 
      eq.monthlyCost > 5000
    )
    if (highCostEquipments.length > 0) {
      warnings.push(`${highCostEquipments.length} equipamento(s) com custo muito alto`)
      recommendations.push('Verifique se os custos estão corretos')
    }

    // Check for duplicate equipment models
    const modelCounts = new Map<string, number>()
    proposalData.equipments.forEach(eq => {
      const key = `${eq.brand}-${eq.model}`
      modelCounts.set(key, (modelCounts.get(key) || 0) + 1)
    })

    const duplicates = Array.from(modelCounts.entries()).filter(([, count]) => count > 1)
    if (duplicates.length > 0) {
      warnings.push(`${duplicates.length} modelo(s) de equipamento duplicado(s)`)
      recommendations.push('Considere consolidar equipamentos duplicados')
    }

    return { warnings, recommendations }
  }

  /**
   * Get optimization suggestions based on current data
   */
  getOptimizationSuggestions(proposalData: ProposalData): string[] {
    const suggestions: string[] = []
    const equipmentCount = proposalData.equipments.length

    if (equipmentCount > 50) {
      suggestions.push('Divida a proposta em seções menores')
      suggestions.push('Use paginação para equipamentos')
    }

    if (equipmentCount > 20) {
      suggestions.push('Considere usar template simplificado')
      suggestions.push('Agrupe equipamentos similares')
    }

    const totalValue = proposalData.totalMonthly
    if (totalValue > 100000) {
      suggestions.push('Considere dividir em múltiplas propostas por valor')
    }

    return suggestions
  }

  /**
   * Check if browser can handle the estimated load
   */
  checkBrowserCapacity(proposalData: ProposalData): {
    canHandle: boolean
    warnings: string[]
    suggestions: string[]
  } {
    const warnings: string[] = []
    const suggestions: string[] = []

    const estimatedMemory = this.estimateMemoryUsage(proposalData)
    const estimatedTime = this.estimateProcessingTime(proposalData)

    // Check available memory (rough estimate)
    const availableMemory = this.estimateAvailableMemory()
    if (estimatedMemory > availableMemory * 0.8) {
      warnings.push('Memória disponível pode ser insuficiente')
      suggestions.push('Feche outras abas e aplicações')
      suggestions.push('Use modo incógnito para liberar memória')
    }

    // Check processing time
    if (estimatedTime > 20000) {
      warnings.push('Processamento pode ser muito lento')
      suggestions.push('Considere reduzir a quantidade de equipamentos')
    }

    return {
      canHandle: warnings.length === 0,
      warnings,
      suggestions
    }
  }

  /**
   * Rough estimate of available browser memory
   */
  private estimateAvailableMemory(): number {
    // Very rough estimate based on common browser limits
    // In reality, this would need more sophisticated detection
    
    // Use Device Memory API if available (with type assertion)
    const navigatorWithMemory = navigator as any
    if (navigatorWithMemory.deviceMemory) {
      return navigatorWithMemory.deviceMemory * 1024 * 0.3 // 30% of device memory
    }

    // Fallback estimates
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (userAgent.includes('mobile')) {
      return 512 // 512MB for mobile
    }
    
    return 2048 // 2GB for desktop
  }

  /**
   * Update size limits
   */
  updateLimits(newLimits: Partial<PDFSizeLimits>): void {
    this.limits = { ...this.limits, ...newLimits }
  }

  /**
   * Get current limits
   */
  getLimits(): PDFSizeLimits {
    return { ...this.limits }
  }
}

// Export singleton instance
export const pdfSizeLimitChecker = new PDFSizeLimitChecker()

// Export utility functions
export const checkPDFSizeLimits = (proposalData: ProposalData): SizeLimitResult => {
  return pdfSizeLimitChecker.checkLimits(proposalData)
}

export const getOptimizationSuggestions = (proposalData: ProposalData): string[] => {
  return pdfSizeLimitChecker.getOptimizationSuggestions(proposalData)
}

export const checkBrowserCapacity = (proposalData: ProposalData) => {
  return pdfSizeLimitChecker.checkBrowserCapacity(proposalData)
}