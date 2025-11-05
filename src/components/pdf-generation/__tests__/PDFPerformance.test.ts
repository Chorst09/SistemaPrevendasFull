/**
 * Performance Tests for PDF Generation
 * Tests performance characteristics and limits
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { PDFGenerator } from '../generators/PDFGenerator'
import { ProposalData, ClientData, EquipmentItem } from '../../../lib/pdf/types'
import { pdfCache } from '../../../lib/pdf/utils/performance-cache'

vi.mock('../../../lib/pdf/utils/imports', () => ({
  jsPDF: vi.fn().mockImplementation(() => {
    const startTime = performance.now()
    
    return {
      internal: {
        pageSize: { getWidth: () => 210, getHeight: () => 297 },
        getCurrentPageInfo: () => ({ pageNumber: 1 })
      },
      setFillColor: vi.fn(),
      setTextColor: vi.fn(),
      setFontSize: vi.fn(),
      setFont: vi.fn(),
      rect: vi.fn(),
      text: vi.fn(),
      output: vi.fn().mockImplementation(() => {
        const endTime = performance.now()
        const duration = endTime - startTime
        
        // Simulate realistic PDF generation time based on content size
        const baseSize = 1024 * 10 // 10KB base
        const contentMultiplier = Math.random() * 0.5 + 0.5 // 0.5-1.0x
        const size = Math.floor(baseSize * contentMultiplier)
        
        return new Blob([new ArrayBuffer(size)], { type: 'application/pdf' })
      })
    }
  })
}))

vi.mock('../../../lib/pdf/utils/error-handling', () => ({
  pdfErrorHandler: {
    createError: vi.fn((type, message) => ({ type, message })),
    checkPDFSizeLimits: vi.fn().mockReturnValue({ withinLimits: true })
  },
  validatePDFData: vi.fn().mockReturnValue({ valid: true, errors: [] }),
  checkBrowserSupport: vi.fn().mockReturnValue({ supported: true, issues: [] })
}))

vi.mock('../templates/ProposalTemplate', () => ({
  default: vi.fn().mockImplementation(() => ({
    render: vi.fn()
  }))
}))

describe('PDF Generation Performance', () => {
  let generator: PDFGenerator
  let baseClientData: ClientData

  beforeEach(() => {
    generator = new PDFGenerator()
    baseClientData = {
      companyName: 'Test Company',
      contactName: 'John Doe',
      email: 'john@test.com',
      phone: '123-456-7890',
      projectName: 'Test Project',
      managerName: 'Jane Manager',
      managerEmail: 'jane@test.com',
      managerPhone: '098-765-4321'
    }
    
    vi.clearAllMocks()
    pdfCache.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const createEquipmentItem = (index: number): EquipmentItem => ({
    id: `equipment-${index}`,
    model: `Model ${index}`,
    brand: `Brand ${index}`,
    type: index % 2 === 0 ? 'Printer' : 'Scanner',
    monthlyVolume: 1000 + (index * 100),
    monthlyCost: 500 + (index * 50),
    specifications: {
      color: index % 2 === 0 ? 'Yes' : 'No',
      duplex: 'Yes',
      speed: `${20 + index} ppm`,
      resolution: '1200x1200 dpi'
    }
  })

  const createProposalData = (equipmentCount: number): ProposalData => {
    const equipments = Array.from({ length: equipmentCount }, (_, i) => createEquipmentItem(i))
    const totalMonthly = equipments.reduce((sum, eq) => sum + (eq.monthlyCost || 0), 0)
    
    return {
      equipments,
      totalMonthly,
      totalAnnual: totalMonthly * 12,
      contractPeriod: 12,
      generatedAt: new Date()
    }
  }

  it('should generate small PDFs quickly (< 1 second)', async () => {
    const proposalData = createProposalData(5) // 5 equipments
    
    const startTime = performance.now()
    const result = await generator.generatePDF(proposalData, baseClientData)
    const endTime = performance.now()
    
    const duration = endTime - startTime
    
    expect(duration).toBeLessThan(1000) // Less than 1 second
    expect(result.blob.size).toBeGreaterThan(0)
    expect(result.url).toBeTruthy()
  })

  it('should handle medium-sized PDFs efficiently (< 3 seconds)', async () => {
    const proposalData = createProposalData(25) // 25 equipments
    
    const startTime = performance.now()
    const result = await generator.generatePDF(proposalData, baseClientData)
    const endTime = performance.now()
    
    const duration = endTime - startTime
    
    expect(duration).toBeLessThan(3000) // Less than 3 seconds
    expect(result.blob.size).toBeGreaterThan(0)
  })

  it('should handle large PDFs within reasonable time (< 10 seconds)', async () => {
    const proposalData = createProposalData(100) // 100 equipments
    
    const startTime = performance.now()
    const result = await generator.generatePDF(proposalData, baseClientData)
    const endTime = performance.now()
    
    const duration = endTime - startTime
    
    expect(duration).toBeLessThan(10000) // Less than 10 seconds
    expect(result.blob.size).toBeGreaterThan(0)
  }, 15000) // Increase test timeout

  it('should benefit from caching on repeated generations', async () => {
    const proposalData = createProposalData(10)
    
    // First generation (no cache)
    const startTime1 = performance.now()
    const result1 = await generator.generatePDF(proposalData, baseClientData)
    const endTime1 = performance.now()
    const duration1 = endTime1 - startTime1
    
    // Second generation (should use cache)
    const startTime2 = performance.now()
    const result2 = await generator.generatePDF(proposalData, baseClientData)
    const endTime2 = performance.now()
    const duration2 = endTime2 - startTime2
    
    // Cache should make second generation much faster
    expect(duration2).toBeLessThan(duration1 * 0.1) // At least 10x faster
    expect(result1.blob.size).toEqual(result2.blob.size)
  })

  it('should maintain consistent performance across multiple generations', async () => {
    const proposalData = createProposalData(15)
    const durations: number[] = []
    const iterations = 5
    
    for (let i = 0; i < iterations; i++) {
      // Clear cache to ensure fresh generation each time
      pdfCache.clear()
      
      const startTime = performance.now()
      await generator.generatePDF(proposalData, baseClientData)
      const endTime = performance.now()
      
      durations.push(endTime - startTime)
    }
    
    // Calculate statistics
    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length
    const maxDuration = Math.max(...durations)
    const minDuration = Math.min(...durations)
    const variance = maxDuration - minDuration
    
    // Performance should be consistent (variance < 50% of average)
    expect(variance).toBeLessThan(avgDuration * 0.5)
    expect(avgDuration).toBeLessThan(2000) // Average should be under 2 seconds
  })

  it('should handle memory efficiently with large datasets', async () => {
    const proposalData = createProposalData(200) // Very large dataset
    
    // Monitor memory usage (simplified)
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0
    
    const result = await generator.generatePDF(proposalData, baseClientData)
    
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
    const memoryIncrease = finalMemory - initialMemory
    
    expect(result.blob.size).toBeGreaterThan(0)
    
    // Memory increase should be reasonable (less than 50MB)
    if (initialMemory > 0) {
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
    }
  }, 20000) // Longer timeout for large dataset

  it('should optimize PDF file size based on content', async () => {
    const smallProposal = createProposalData(5)
    const largeProposal = createProposalData(50)
    
    const smallResult = await generator.generatePDF(smallProposal, baseClientData)
    const largeResult = await generator.generatePDF(largeProposal, baseClientData)
    
    // Larger proposal should result in larger PDF, but not linearly
    expect(largeResult.blob.size).toBeGreaterThan(smallResult.blob.size)
    
    // Size increase should be reasonable (not more than 10x for 10x content)
    const sizeRatio = largeResult.blob.size / smallResult.blob.size
    expect(sizeRatio).toBeLessThan(10)
  })

  it('should handle concurrent PDF generations', async () => {
    const proposalData = createProposalData(10)
    const concurrentGenerations = 3
    
    const startTime = performance.now()
    
    // Generate multiple PDFs concurrently
    const promises = Array.from({ length: concurrentGenerations }, () => 
      generator.generatePDF(proposalData, baseClientData)
    )
    
    const results = await Promise.all(promises)
    const endTime = performance.now()
    
    const totalDuration = endTime - startTime
    
    // All generations should complete
    expect(results).toHaveLength(concurrentGenerations)
    results.forEach(result => {
      expect(result.blob.size).toBeGreaterThan(0)
      expect(result.url).toBeTruthy()
    })
    
    // Concurrent execution should be more efficient than sequential
    // (though this is hard to test reliably in a unit test environment)
    expect(totalDuration).toBeLessThan(5000) // Should complete within 5 seconds
  })

  it('should clean up resources properly', async () => {
    const proposalData = createProposalData(10)
    
    // Generate PDF and track URL creation
    const result = await generator.generatePDF(proposalData, baseClientData)
    
    expect(result.url).toBeTruthy()
    expect(typeof result.url).toBe('string')
    
    // In a real scenario, URLs should be revoked when no longer needed
    // This is more of a documentation test for proper cleanup
    expect(global.URL.createObjectURL).toBeDefined()
    expect(global.URL.revokeObjectURL).toBeDefined()
  })
})