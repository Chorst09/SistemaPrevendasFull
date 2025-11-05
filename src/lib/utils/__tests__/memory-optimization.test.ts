import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  MemoryManager, 
  PaginationManager, 
  VirtualScrollManager,
  MemoryEfficientMap,
  ServiceDeskMemoryOptimizer,
  LargeListOptimizer,
  ServiceDeskDataStructures
} from '../memory-optimization';

describe('Memory Optimization Utilities', () => {
  describe('MemoryManager', () => {
    let memoryManager: MemoryManager;

    beforeEach(() => {
      memoryManager = MemoryManager.getInstance();
    });

    afterEach(() => {
      memoryManager.destroy();
    });

    it('should register and execute cleanup tasks', () => {
      let cleanupExecuted = false;
      
      memoryManager.registerCleanupTask('test', () => {
        cleanupExecuted = true;
      });

      memoryManager.forceCleanup();
      expect(cleanupExecuted).toBe(true);
    });

    it('should unregister cleanup tasks', () => {
      let cleanupExecuted = false;
      
      memoryManager.registerCleanupTask('test', () => {
        cleanupExecuted = true;
      });

      memoryManager.unregisterCleanupTask('test');
      memoryManager.forceCleanup();
      
      expect(cleanupExecuted).toBe(false);
    });
  });

  describe('PaginationManager', () => {
    let paginationManager: PaginationManager<{ id: number; name: string }>;
    const testItems = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));

    beforeEach(() => {
      paginationManager = new PaginationManager(testItems, 10);
    });

    it('should return correct page items', () => {
      const pageItems = paginationManager.getCurrentPageItems();
      expect(pageItems).toHaveLength(10);
      expect(pageItems[0].id).toBe(0);
      expect(pageItems[9].id).toBe(9);
    });

    it('should navigate to different pages', () => {
      paginationManager.goToPage(2);
      const pageItems = paginationManager.getCurrentPageItems();
      expect(pageItems[0].id).toBe(10);
      expect(pageItems[9].id).toBe(19);
    });

    it('should return correct pagination info', () => {
      const info = paginationManager.getPaginationInfo();
      expect(info.totalItems).toBe(100);
      expect(paginationManager.getTotalPages()).toBe(10);
      expect(info.currentPage).toBe(1);
      expect(info.pageSize).toBe(10);
    });
  });

  describe('MemoryEfficientMap', () => {
    let map: MemoryEfficientMap<string, number>;

    beforeEach(() => {
      map = new MemoryEfficientMap<string, number>(3);
    });

    it('should store and retrieve values', () => {
      map.set('key1', 1);
      map.set('key2', 2);
      
      expect(map.get('key1')).toBe(1);
      expect(map.get('key2')).toBe(2);
    });

    it('should evict oldest items when max size exceeded', () => {
      map.set('key1', 1);
      map.set('key2', 2);
      map.set('key3', 3);
      map.set('key4', 4); // Should evict key1
      
      expect(map.get('key1')).toBeUndefined();
      expect(map.get('key2')).toBe(2);
      expect(map.get('key3')).toBe(3);
      expect(map.get('key4')).toBe(4);
    });

    it('should update access order when getting items', () => {
      map.set('key1', 1);
      map.set('key2', 2);
      map.set('key3', 3);
      
      // Access key1 to move it to end
      map.get('key1');
      
      // Add key4, should evict key2 (oldest)
      map.set('key4', 4);
      
      expect(map.get('key1')).toBe(1); // Should still exist
      expect(map.get('key2')).toBeUndefined(); // Should be evicted
    });
  });

  describe('ServiceDeskMemoryOptimizer', () => {
    let optimizer: ServiceDeskMemoryOptimizer;

    beforeEach(() => {
      optimizer = ServiceDeskMemoryOptimizer.getInstance();
    });

    afterEach(() => {
      optimizer.clearCache('all');
    });

    it('should cache and retrieve tab data', () => {
      const testData = { name: 'Test', value: 123 };
      
      optimizer.cacheTabData('test-tab', testData);
      const retrieved = optimizer.getCachedTabData('test-tab');
      
      expect(retrieved).toEqual(testData);
    });

    it('should cache and retrieve calculations', () => {
      const result = { total: 1000, breakdown: [500, 300, 200] };
      
      optimizer.cacheCalculation('test-calc', result);
      const retrieved = optimizer.getCachedCalculation('test-calc');
      
      expect(retrieved).toEqual(result);
    });

    it('should provide memory statistics', () => {
      optimizer.cacheTabData('tab1', { data: 'test1' });
      optimizer.cacheCalculation('calc1', { result: 100 });
      
      const stats = optimizer.getMemoryStats();
      
      expect(stats.dataCache).toBeGreaterThan(0);
      expect(stats.calculationCache).toBeGreaterThan(0);
      expect(stats.total).toBeGreaterThan(0);
    });
  });

  describe('LargeListOptimizer', () => {
    let optimizer: LargeListOptimizer<{ id: number; name: string; category: string }>;
    const testItems = [
      { id: 1, name: 'Apple', category: 'Fruit' },
      { id: 2, name: 'Banana', category: 'Fruit' },
      { id: 3, name: 'Carrot', category: 'Vegetable' },
      { id: 4, name: 'Date', category: 'Fruit' },
      { id: 5, name: 'Eggplant', category: 'Vegetable' }
    ];

    beforeEach(() => {
      optimizer = new LargeListOptimizer(testItems, 2);
    });

    it('should return correct page items', () => {
      const pageItems = optimizer.getCurrentPageItems();
      expect(pageItems).toHaveLength(2);
      expect(pageItems[0].name).toBe('Apple');
      expect(pageItems[1].name).toBe('Banana');
    });

    it('should filter items by search term', () => {
      optimizer.search('apple', ['name']);
      const pageItems = optimizer.getCurrentPageItems();
      expect(pageItems).toHaveLength(1);
      expect(pageItems[0].name).toBe('Apple');
    });

    it('should sort items', () => {
      optimizer.sort('name', 'desc');
      const pageItems = optimizer.getCurrentPageItems();
      expect(pageItems[0].name).toBe('Eggplant');
      expect(pageItems[1].name).toBe('Date');
    });

    it('should provide correct pagination info', () => {
      const info = optimizer.getPaginationInfo();
      expect(info.totalItems).toBe(5);
      expect(info.totalPages).toBe(3);
      expect(info.currentPage).toBe(1);
      expect(info.hasNext).toBe(true);
      expect(info.hasPrevious).toBe(false);
    });
  });

  describe('ServiceDeskDataStructures', () => {
    it('should create team member index by role', () => {
      const members = [
        { id: '1', role: 'Developer' },
        { id: '2', role: 'Designer' },
        { id: '3', role: 'Developer' }
      ];

      const index = ServiceDeskDataStructures.createTeamMemberIndex(members);
      
      expect(index.get('Developer')).toHaveLength(2);
      expect(index.get('Designer')).toHaveLength(1);
    });

    it('should create schedule index by date', () => {
      const date1 = new Date('2024-01-01T10:00:00');
      const date2 = new Date('2024-01-02T10:00:00');
      
      const schedules = [
        { id: '1', startTime: date1, endTime: date1 },
        { id: '2', startTime: date1, endTime: date1 },
        { id: '3', startTime: date2, endTime: date2 }
      ];

      const index = ServiceDeskDataStructures.createScheduleIndex(schedules);
      
      const dateKey1 = date1.toDateString();
      const dateKey2 = date2.toDateString();
      
      expect(index.get(dateKey1)).toHaveLength(2);
      expect(index.get(dateKey2)).toHaveLength(1);
    });

    it('should create cost calculation cache', () => {
      const cache = ServiceDeskDataStructures.createCostCalculationCache();
      
      cache.set('calc1', 1000);
      cache.set('calc2', 2000);
      
      expect(cache.get('calc1')).toBe(1000);
      expect(cache.get('calc2')).toBe(2000);
    });
  });
});