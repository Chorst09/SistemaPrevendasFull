import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AutomaticDataCleanup, ServiceDeskDataCleanup } from '../automatic-data-cleanup';

describe('AutomaticDataCleanup', () => {
  let cleanupService: AutomaticDataCleanup;

  beforeEach(() => {
    cleanupService = AutomaticDataCleanup.getInstance();
    // Stop automatic cleanup during tests
    cleanupService.stopAutomaticCleanup();
  });

  afterEach(() => {
    cleanupService.destroy();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = AutomaticDataCleanup.getInstance();
      const instance2 = AutomaticDataCleanup.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Data Access Tracking', () => {
    it('should track data access', () => {
      cleanupService.trackDataAccess('test-key');
      const stats = cleanupService.getCleanupStats();
      expect(stats.trackedDataEntries).toBeGreaterThan(0);
    });
  });

  describe('Cleanup Callbacks', () => {
    it('should register and execute cleanup callbacks', () => {
      const mockCallback = vi.fn();
      cleanupService.registerCleanupCallback('test-callback', mockCallback);
      
      const stats = cleanupService.getCleanupStats();
      expect(stats.registeredCallbacks).toBe(1);
      
      cleanupService.forceCleanup();
      expect(mockCallback).toHaveBeenCalled();
    });

    it('should unregister cleanup callbacks', () => {
      const mockCallback = vi.fn();
      cleanupService.registerCleanupCallback('test-callback', mockCallback);
      cleanupService.unregisterCleanupCallback('test-callback');
      
      const stats = cleanupService.getCleanupStats();
      expect(stats.registeredCallbacks).toBe(0);
    });
  });

  describe('Configuration', () => {
    it('should configure cleanup thresholds', () => {
      cleanupService.configureThresholds({
        unusedDataThreshold: 60000, // 1 minute
        memoryThreshold: 200 * 1024 * 1024 // 200MB
      });
      
      const stats = cleanupService.getCleanupStats();
      expect(stats.memoryThreshold).toBe(200);
    });
  });

  describe('Statistics', () => {
    it('should provide cleanup statistics', () => {
      const stats = cleanupService.getCleanupStats();
      
      expect(stats).toHaveProperty('isRunning');
      expect(stats).toHaveProperty('trackedDataEntries');
      expect(stats).toHaveProperty('registeredCallbacks');
      expect(stats).toHaveProperty('memoryThreshold');
      expect(stats).toHaveProperty('cleanupInterval');
    });
  });
});

describe('ServiceDeskDataCleanup', () => {
  describe('Team Data Cleanup', () => {
    it('should clean up team data based on access threshold', () => {
      const teamData = [
        { id: '1', name: 'Member 1', lastAccessed: Date.now() - 10 * 60 * 1000 }, // 10 minutes ago
        { id: '2', name: 'Member 2', lastAccessed: Date.now() - 1 * 60 * 1000 },  // 1 minute ago
        { id: '3', name: 'Member 3', lastAccessed: Date.now() }                    // Now
      ];

      const cleaned = ServiceDeskDataCleanup.cleanupTeamData(teamData, 5 * 60 * 1000); // 5 minute threshold
      expect(cleaned).toHaveLength(2); // Should keep only the 2 recently accessed items
    });
  });

  describe('Large Array Cleanup', () => {
    it('should clean up large arrays by removing unused items', () => {
      const items = Array.from({ length: 1500 }, (_, i) => ({
        id: `item-${i}`,
        lastAccessed: i < 500 ? Date.now() : Date.now() - 20 * 60 * 1000 // First 500 are recent
      }));

      const cleaned = ServiceDeskDataCleanup.cleanupLargeArray(items, 1000, 10 * 60 * 1000);
      expect(cleaned.length).toBeLessThanOrEqual(1000);
      expect(cleaned.length).toBeGreaterThan(0);
    });
  });

  describe('Object Memory Optimization', () => {
    it('should optimize object for memory efficiency', () => {
      const obj = {
        id: '1',
        name: 'Test',
        description: 'Long description...',
        metadata: { /* large object */ },
        essentialField: 'important'
      };

      const optimized = ServiceDeskDataCleanup.optimizeObjectForMemory(obj, ['id', 'name', 'essentialField']);
      
      expect(optimized).toHaveProperty('id');
      expect(optimized).toHaveProperty('name');
      expect(optimized).toHaveProperty('essentialField');
      expect(optimized).not.toHaveProperty('description');
      expect(optimized).not.toHaveProperty('metadata');
    });
  });

  describe('Data Summary Creation', () => {
    it('should create memory-efficient summary of large datasets', () => {
      const items = [
        { id: '1', value: 100, category: 'A' },
        { id: '2', value: 200, category: 'B' },
        { id: '3', value: 150, category: 'A' },
        { id: '4', value: 300, category: 'C' }
      ];

      const summary = ServiceDeskDataCleanup.createDataSummary(items, ['value', 'category']);
      
      expect(summary.totalItems).toBe(4);
      expect(summary.summary).toHaveProperty('value_sum');
      expect(summary.summary).toHaveProperty('value_avg');
      expect(summary.summary).toHaveProperty('category_count');
      expect(summary.sampleItems).toHaveLength(4); // All items since less than 10
    });
  });

  describe('Calculation Cache Cleanup', () => {
    it('should clean up calculation cache entries', () => {
      const cache = new Map();
      const now = Date.now();
      
      cache.set('recent', { value: 100, lastAccessed: now });
      cache.set('old', { value: 200, lastAccessed: now - 10 * 60 * 1000 }); // 10 minutes ago
      
      ServiceDeskDataCleanup.cleanupCalculationCache(cache, 5 * 60 * 1000); // 5 minute threshold
      
      expect(cache.has('recent')).toBe(true);
      expect(cache.has('old')).toBe(false);
    });
  });
});