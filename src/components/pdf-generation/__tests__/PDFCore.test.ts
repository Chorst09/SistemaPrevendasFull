/**
 * Core PDF Generation Tests
 * Simplified tests focusing on essential functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { pdfCache, PDFSizeOptimizer } from '../../../lib/pdf/utils/performance-cache'

describe('PDF Core Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('PDFPerformanceCache', () => {
    it('should create cache instance', () => {
      expect(pdfCache).toBeDefined()
      expect(typeof pdfCache.get).toBe('function')
      expect(typeof pdfCache.set).toBe('function')
      expect(typeof pdfCache.clear).toBe('function')
    })

    it('should cache and retrieve data', () => {
      const testData = { test: 'data' }
      const key = 'test-key'

      pdfCache.set(key, testData)
      const retrieved = pdfCache.get(key)

      expect(retrieved).toEqual(testData)
    })

    it('should return null for non-existent keys', () => {
      const result = pdfCache.get('non-existent-key')
      expect(result).toBeNull()
    })

    it('should clear all cached data', () => {
      pdfCache.set('key1', 'data1')
      pdfCache.set('key2', 'data2')
      
      pdfCache.clear()
      
      expect(pdfCache.get('key1')).toBeNull()
      expect(pdfCache.get('key2')).toBeNull()
    })

    it('should generate consistent cache keys', () => {
      const proposalData = { equipments: [], totalMonthly: 100 }
      const clientData = { companyName: 'Test' }

      const key1 = pdfCache.generateProposalKey(proposalData, clientData)
      const key2 = pdfCache.generateProposalKey(proposalData, clientData)

      expect(key1).toBe(key2)
      expect(typeof key1).toBe('string')
      expect(key1.length).toBeGreaterThan(0)
    })

    it('should provide cache statistics', () => {
      pdfCache.clear()
      pdfCache.set('test1', 'data1')
      pdfCache.set('test2', 'data2')

      const stats = pdfCache.getStats()

      expect(stats).toHaveProperty('cacheSize')
      expect(stats).toHaveProperty('templateCacheSize')
      expect(stats).toHaveProperty('maxCacheSize')
      expect(stats).toHaveProperty('config')
      expect(stats.cacheSize).toBe(2)
    })
  })

  describe('PDFSizeOptimizer', () => {
    it('should provide optimized settings', () => {
      const settings = PDFSizeOptimizer.getOptimizedSettings()

      expect(settings).toHaveProperty('compress')
      expect(settings).toHaveProperty('precision')
      expect(settings).toHaveProperty('format')
      expect(settings).toHaveProperty('orientation')
      expect(settings.compress).toBe(true)
      expect(settings.format).toBe('a4')
    })

    it('should provide optimized text settings', () => {
      const textSettings = PDFSizeOptimizer.optimizeTextSettings()

      expect(textSettings).toHaveProperty('fontSize')
      expect(textSettings).toHaveProperty('lineHeight')
      expect(textSettings).toHaveProperty('maxLineLength')
      expect(textSettings.fontSize).toHaveProperty('title')
      expect(textSettings.fontSize).toHaveProperty('body')
      expect(typeof textSettings.lineHeight).toBe('number')
    })
  })

  describe('Template Caching', () => {
    it('should cache and retrieve template data', () => {
      const templateKey = 'test-template'
      const templateData = {
        colorPalette: { primary: [255, 0, 0] },
        fontMetrics: { fontSize: 12 }
      }

      pdfCache.setTemplate(templateKey, templateData)
      const retrieved = pdfCache.getTemplate(templateKey)

      expect(retrieved).toEqual(templateData)
    })

    it('should return null for non-existent templates', () => {
      const result = pdfCache.getTemplate('non-existent-template')
      expect(result).toBeNull()
    })
  })

  describe('Cache Expiration', () => {
    it('should respect custom expiration times', async () => {
      const key = 'expiring-key'
      const data = 'expiring-data'
      const shortExpiration = 100 // 100ms

      pdfCache.set(key, data, shortExpiration)
      
      // Should be available immediately
      expect(pdfCache.get(key)).toBe(data)

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150))

      // Should be expired
      expect(pdfCache.get(key)).toBeNull()
    })
  })

  describe('Cache Size Management', () => {
    it('should manage cache size limits', () => {
      const cache = new (pdfCache.constructor as any)({ maxCacheSize: 2 })
      
      cache.set('key1', 'data1')
      cache.set('key2', 'data2')
      cache.set('key3', 'data3') // Should evict key1

      expect(cache.get('key1')).toBeNull()
      expect(cache.get('key2')).toBe('data2')
      expect(cache.get('key3')).toBe('data3')
    })
  })
})