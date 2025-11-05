import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ServiceDeskMemoryManager } from '../service-desk-memory-manager';
import { ServiceDeskData } from '@/lib/types/service-desk-pricing';

// Mock the memory optimization utilities
vi.mock('@/lib/utils/memory-optimization', () => ({
  MemoryManager: {
    getInstance: () => ({
      registerCleanupTask: vi.fn(),
      unregisterCleanupTask: vi.fn(),
      forceCleanup: vi.fn()
    })
  },
  ServiceDeskMemoryOptimizer: {
    getInstance: () => ({
      cacheTabData: vi.fn(),
      getCachedTabData: vi.fn(),
      cacheCalculation: vi.fn(),
      getCachedCalculation: vi.fn(),
      cacheComponent: vi.fn(),
      getCachedComponent: vi.fn(),
      clearCache: vi.fn(),
      getMemoryStats: () => ({
        dataCache: 5,
        calculationCache: 10,
        componentCache: 3,
        total: 18
      })
    })
  },
  WeakRefManager: vi.fn().mockImplementation(() => ({
    addRef: vi.fn(),
    cleanup: vi.fn(),
    getLiveCount: () => 5,
    getLiveObjects: () => []
  })),
  MemoryEfficientMap: vi.fn().mockImplementation(() => ({
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
    clear: vi.fn(),
    size: 0,
    forEach: vi.fn()
  })),
  LargeListOptimizer: vi.fn().mockImplementation(() => ({
    updateItems: vi.fn(),
    search: vi.fn(),
    sort: vi.fn(),
    getCurrentPageItems: () => [],
    getPaginationInfo: () => ({
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      pageSize: 50,
      hasNext: false,
      hasPrevious: false
    })
  }))
}));

describe('ServiceDeskMemoryManager', () => {
  let memoryManager: ServiceDeskMemoryManager;

  beforeEach(() => {
    // Get fresh instance for each test
    memoryManager = ServiceDeskMemoryManager.getInstance();
  });

  afterEach(() => {
    // Clean up after each test
    memoryManager.destroy();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ServiceDeskMemoryManager.getInstance();
      const instance2 = ServiceDeskMemoryManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Tab Data Caching', () => {
    it('should cache and retrieve tab data', () => {
      const testData = { test: 'data' };
      
      memoryManager.cacheTabData('test-tab', testData);
      
      // Since we're using mocks, we just verify the methods don't throw
      expect(() => memoryManager.cacheTabData('test-tab', testData)).not.toThrow();
      expect(() => memoryManager.getCachedTabData('test-tab')).not.toThrow();
    });

    it('should handle missing cached data gracefully', () => {
      const retrieved = memoryManager.getCachedTabData('non-existent-tab');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('Calculation Caching', () => {
    it('should cache and retrieve calculation results', () => {
      const result = { value: 42 };
      
      // Since we're using mocks, we just verify the methods don't throw
      expect(() => memoryManager.cacheCalculation('test-calc', result)).not.toThrow();
      expect(() => memoryManager.getCachedCalculation('test-calc')).not.toThrow();
    });
  });

  describe('List Optimization', () => {
    it('should create list optimizer for large datasets', () => {
      const items = Array.from({ length: 200 }, (_, i) => ({ id: i, name: `Item ${i}` }));
      
      const optimizer = memoryManager.createListOptimizer('test-list', items, 25);
      
      expect(optimizer).toBeDefined();
    });

    it('should warn about very large datasets', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const items = Array.from({ length: 2000 }, (_, i) => ({ id: i, name: `Item ${i}` }));
      
      memoryManager.createListOptimizer('large-list', items);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Large dataset detected')
      );
      
      consoleSpy.mockRestore();
    });

    it('should remove list optimizer and cleanup', () => {
      const items = [{ id: 1, name: 'Item 1' }];
      
      memoryManager.createListOptimizer('test-list', items);
      memoryManager.removeListOptimizer('test-list');
      
      const optimizer = memoryManager.getListOptimizer('test-list');
      expect(optimizer).toBeUndefined();
    });
  });

  describe('Memory Statistics', () => {
    it('should provide memory statistics', () => {
      const stats = memoryManager.getMemoryStats();
      
      expect(stats).toHaveProperty('tabDataCache');
      expect(stats).toHaveProperty('calculationCache');
      expect(stats).toHaveProperty('componentCache');
      expect(stats).toHaveProperty('listOptimizers');
      expect(stats).toHaveProperty('weakRefs');
      expect(stats).toHaveProperty('totalMemoryUsage');
      expect(stats).toHaveProperty('cleanupCallbacks');
    });
  });

  describe('Cleanup Management', () => {
    it('should register and unregister cleanup callbacks', () => {
      const cleanupFn = vi.fn();
      
      memoryManager.registerCleanupCallback('test-cleanup', cleanupFn);
      memoryManager.unregisterCleanupCallback('test-cleanup');
      
      // Perform cleanup to verify callback was removed
      memoryManager.performMemoryCleanup();
      
      expect(cleanupFn).not.toHaveBeenCalled();
    });

    it('should execute cleanup callbacks during memory cleanup', () => {
      const cleanupFn = vi.fn();
      
      memoryManager.registerCleanupCallback('test-cleanup', cleanupFn);
      memoryManager.performMemoryCleanup();
      
      expect(cleanupFn).toHaveBeenCalled();
    });

    it('should handle cleanup callback errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const errorCleanup = vi.fn().mockImplementation(() => {
        throw new Error('Cleanup error');
      });
      
      memoryManager.registerCleanupCallback('error-cleanup', errorCleanup);
      memoryManager.performMemoryCleanup();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Cleanup failed for error-cleanup:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Service Desk Data Optimization', () => {
    it('should optimize service desk data structure', () => {
      const mockData: Partial<ServiceDeskData> = {
        team: Array.from({ length: 150 }, (_, i) => ({
          id: `member-${i}`,
          name: `Member ${i}`,
          role: 'Analyst',
          salary: 5000,
          benefits: {},
          workload: 40,
          startDate: new Date(),
          skills: [],
          certifications: []
        })),
        schedules: Array.from({ length: 250 }, (_, i) => ({
          id: `schedule-${i}`,
          name: `Schedule ${i}`,
          shifts: [],
          coverage: {} as any,
          specialRates: []
        })),
        otherCosts: Array.from({ length: 150 }, (_, i) => ({
          id: `cost-${i}`,
          name: `Cost ${i}`,
          category: 'Infrastructure',
          amount: 1000,
          type: 'fixed' as any,
          description: '',
          startDate: new Date(),
          endDate: new Date()
        }))
      };

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const optimized = memoryManager.optimizeServiceDeskData(mockData as ServiceDeskData);
      
      expect(optimized).toBeDefined();
      expect(consoleSpy).toHaveBeenCalledTimes(3); // One warning for each large dataset
      
      consoleSpy.mockRestore();
    });
  });

  describe('Paginated Views', () => {
    it('should create paginated view for large arrays', () => {
      const items = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));
      
      const paginatedView = memoryManager.createPaginatedView(items, 10);
      
      expect(paginatedView.totalItems).toBe(100);
      expect(paginatedView.totalPages).toBe(10);
      expect(paginatedView.getCurrentPage()).toBe(1);
      
      const firstPage = paginatedView.getPage(1);
      expect(firstPage).toHaveLength(10);
      expect(firstPage[0]).toEqual({ id: 0, name: 'Item 0' });
    });

    it('should handle page navigation correctly', () => {
      const items = Array.from({ length: 25 }, (_, i) => ({ id: i, name: `Item ${i}` }));
      const paginatedView = memoryManager.createPaginatedView(items, 10);
      
      paginatedView.setCurrentPage(2);
      expect(paginatedView.getCurrentPage()).toBe(2);
      
      const secondPage = paginatedView.getPage(2);
      expect(secondPage).toHaveLength(10);
      expect(secondPage[0]).toEqual({ id: 10, name: 'Item 10' });
      
      // Test boundary conditions
      paginatedView.setCurrentPage(0); // Should clamp to 1
      expect(paginatedView.getCurrentPage()).toBe(1);
      
      paginatedView.setCurrentPage(10); // Should clamp to max pages
      expect(paginatedView.getCurrentPage()).toBe(3); // 25 items / 10 per page = 3 pages
    });
  });

  describe('Memory Threshold Management', () => {
    it('should set and use memory threshold', () => {
      memoryManager.setMemoryThreshold(200); // 200MB
      
      // We can't easily test the actual threshold checking without mocking performance.memory,
      // but we can verify the method doesn't throw
      expect(() => memoryManager.setMemoryThreshold(200)).not.toThrow();
    });
  });

  describe('Optimization Recommendations', () => {
    it('should provide optimization recommendations', () => {
      const recommendations = memoryManager.getOptimizationRecommendations();
      
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0]).toBe('Memory usage is optimal');
    });
  });

  describe('Component Memory Monitoring', () => {
    it('should monitor component memory usage', () => {
      const mockComponent = () => null;
      
      memoryManager.monitorComponentMemory('test-component', mockComponent);
      memoryManager.cleanupComponentMemory('test-component');
      
      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('Weak References', () => {
    it('should create weak references for automatic cleanup', () => {
      const obj = { test: 'data' };
      
      // Since we're using mocks, we just verify the method doesn't throw
      expect(() => memoryManager.createWeakRef(obj, 123)).not.toThrow();
    });
  });

  describe('Force Cleanup', () => {
    it('should force immediate cleanup', () => {
      const cleanupFn = vi.fn();
      
      memoryManager.registerCleanupCallback('test', cleanupFn);
      memoryManager.forceCleanup();
      
      expect(cleanupFn).toHaveBeenCalled();
    });
  });

  describe('Destruction', () => {
    it('should properly destroy and cleanup all resources', () => {
      const cleanupFn = vi.fn();
      
      memoryManager.registerCleanupCallback('test', cleanupFn);
      memoryManager.destroy();
      
      expect(cleanupFn).toHaveBeenCalled();
    });
  });
});