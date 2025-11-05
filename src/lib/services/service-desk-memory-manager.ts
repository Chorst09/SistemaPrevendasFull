import { 
  MemoryManager, 
  MemoryEfficientMap, 
  WeakRefManager,
  ServiceDeskMemoryOptimizer,
  LargeListOptimizer
} from '@/lib/utils/memory-optimization';
import { ServiceDeskData } from '@/lib/types/service-desk-pricing';

/**
 * Enhanced memory management specifically for Service Desk Pricing System
 */
export class ServiceDeskMemoryManager {
  private static instance: ServiceDeskMemoryManager;
  private memoryManager: MemoryManager;
  private optimizer: ServiceDeskMemoryOptimizer;
  private weakRefManager: WeakRefManager<any>;
  
  // Memory-efficient caches
  private tabDataCache: MemoryEfficientMap<string, any>;
  private calculationCache: MemoryEfficientMap<string, any>;
  private componentCache: MemoryEfficientMap<string, React.ComponentType>;
  private listOptimizers: Map<string, LargeListOptimizer<any>>;
  
  // Memory monitoring
  private memoryCheckInterval: NodeJS.Timeout | null = null;
  private memoryThreshold = 100 * 1024 * 1024; // 100MB
  private cleanupCallbacks: Map<string, () => void> = new Map();
  
  // Data access tracking for automatic cleanup
  private dataAccessTimes: Map<string, number> = new Map();
  private autoCleanupInterval: NodeJS.Timeout | null = null;
  
  // Pagination settings
  private defaultPageSize = 50;
  private maxItemsInMemory = 1000;

  private constructor() {
    this.memoryManager = MemoryManager.getInstance();
    this.optimizer = ServiceDeskMemoryOptimizer.getInstance();
    this.weakRefManager = new WeakRefManager();
    
    // Initialize caches with appropriate sizes
    this.tabDataCache = new MemoryEfficientMap(20); // 20 tabs max
    this.calculationCache = new MemoryEfficientMap(500); // 500 calculations
    this.componentCache = new MemoryEfficientMap(50); // 50 components
    this.listOptimizers = new Map();
    
    this.startMemoryMonitoring();
    this.startAutoCleanup();
    this.registerGlobalCleanup();
  }

  static getInstance(): ServiceDeskMemoryManager {
    if (!ServiceDeskMemoryManager.instance) {
      ServiceDeskMemoryManager.instance = new ServiceDeskMemoryManager();
    }
    return ServiceDeskMemoryManager.instance;
  }

  /**
   * Start memory monitoring
   */
  private startMemoryMonitoring(): void {
    this.memoryCheckInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Start automatic cleanup of unused data
   */
  private startAutoCleanup(): void {
    this.autoCleanupInterval = setInterval(() => {
      this.cleanupUnusedData();
    }, 2 * 60 * 1000); // Check every 2 minutes
  }

  /**
   * Check memory usage and trigger cleanup if needed
   */
  private checkMemoryUsage(): void {
    if (typeof window === 'undefined') return;

    try {
      const memoryInfo = (performance as any).memory;
      if (memoryInfo && memoryInfo.usedJSHeapSize > this.memoryThreshold) {
        console.log('Service Desk Memory Manager: Memory threshold exceeded, triggering cleanup');
        this.performMemoryCleanup();
      }
    } catch (error) {
      // Memory API not available
    }
  }

  /**
   * Register global cleanup tasks
   */
  private registerGlobalCleanup(): void {
    this.memoryManager.registerCleanupTask('service-desk-memory-manager', () => {
      this.performMemoryCleanup();
    });
  }

  /**
   * Perform comprehensive memory cleanup
   */
  performMemoryCleanup(): void {
    // Clear caches
    this.tabDataCache.clear();
    this.calculationCache.clear();
    
    // Clean up weak references
    this.weakRefManager.cleanup();
    
    // Clean up list optimizers
    this.listOptimizers.clear();
    
    // Execute registered cleanup callbacks
    this.cleanupCallbacks.forEach((callback, key) => {
      try {
        callback();
      } catch (error) {
        console.warn(`Cleanup failed for ${key}:`, error);
      }
    });
    
    // Cleanup unused data automatically
    this.cleanupUnusedData();
    
    // Force garbage collection if available
    if (typeof window !== 'undefined' && 'gc' in window) {
      (window as any).gc();
    }
    
    console.log('Service Desk Memory Manager: Memory cleanup completed');
  }

  /**
   * Automatic cleanup of unused data based on access patterns
   */
  private cleanupUnusedData(): void {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes
    const inactiveAge = 10 * 60 * 1000; // 10 minutes for inactive data
    
    // Track data access times
    if (!this.dataAccessTimes) {
      this.dataAccessTimes = new Map();
    }
    
    // Clean up old tab data
    const tabKeysToRemove: string[] = [];
    this.tabDataCache.forEach((_, key) => {
      const lastAccess = this.dataAccessTimes.get(key) || 0;
      if (now - lastAccess > maxAge) {
        tabKeysToRemove.push(key);
      }
    });
    
    tabKeysToRemove.forEach(key => {
      this.tabDataCache.delete(key);
      this.dataAccessTimes.delete(key);
    });
    
    // Clean up old calculations
    const calcKeysToRemove: string[] = [];
    this.calculationCache.forEach((_, key) => {
      const lastAccess = this.dataAccessTimes.get(key) || 0;
      if (now - lastAccess > maxAge) {
        calcKeysToRemove.push(key);
      }
    });
    
    calcKeysToRemove.forEach(key => {
      this.calculationCache.delete(key);
      this.dataAccessTimes.delete(key);
    });
    
    // Clean up inactive list optimizers
    const inactiveOptimizers: string[] = [];
    this.listOptimizers.forEach((_, key) => {
      const lastAccess = this.dataAccessTimes.get(`list-${key}`) || 0;
      if (now - lastAccess > inactiveAge) {
        inactiveOptimizers.push(key);
      }
    });
    
    inactiveOptimizers.forEach(key => {
      this.listOptimizers.delete(key);
      this.dataAccessTimes.delete(`list-${key}`);
    });
    
    // Clean up unused component cache entries
    const componentKeysToRemove: string[] = [];
    this.componentCache.forEach((_, key) => {
      const lastAccess = this.dataAccessTimes.get(`component-${key}`) || 0;
      if (now - lastAccess > inactiveAge) {
        componentKeysToRemove.push(key);
      }
    });
    
    componentKeysToRemove.forEach(key => {
      this.componentCache.delete(key);
      this.dataAccessTimes.delete(`component-${key}`);
    });
    
    if (tabKeysToRemove.length > 0 || calcKeysToRemove.length > 0 || inactiveOptimizers.length > 0 || componentKeysToRemove.length > 0) {
      console.log(`Cleaned up ${tabKeysToRemove.length} tab data, ${calcKeysToRemove.length} calculations, ${inactiveOptimizers.length} list optimizers, ${componentKeysToRemove.length} components`);
    }
  }

  /**
   * Register cleanup callback for specific component/service
   */
  registerCleanupCallback(key: string, callback: () => void): void {
    this.cleanupCallbacks.set(key, callback);
  }

  /**
   * Unregister cleanup callback
   */
  unregisterCleanupCallback(key: string): void {
    this.cleanupCallbacks.delete(key);
  }

  /**
   * Cache tab data with automatic cleanup
   */
  cacheTabData(tabId: string, data: any): void {
    const key = `tab-${tabId}`;
    this.tabDataCache.set(key, data);
    this.optimizer.cacheTabData(tabId, data);
    
    // Track access time for automatic cleanup
    this.dataAccessTimes.set(key, Date.now());
  }

  /**
   * Get cached tab data
   */
  getCachedTabData(tabId: string): any {
    const key = `tab-${tabId}`;
    
    // Update access time
    this.dataAccessTimes.set(key, Date.now());
    
    return this.tabDataCache.get(key) || this.optimizer.getCachedTabData(tabId);
  }

  /**
   * Cache calculation result
   */
  cacheCalculation(calculationKey: string, result: any): void {
    this.calculationCache.set(calculationKey, result);
    this.optimizer.cacheCalculation(calculationKey, result);
    
    // Track access time for automatic cleanup
    this.dataAccessTimes.set(calculationKey, Date.now());
  }

  /**
   * Get cached calculation result
   */
  getCachedCalculation(calculationKey: string): any {
    // Update access time
    this.dataAccessTimes.set(calculationKey, Date.now());
    
    return this.calculationCache.get(calculationKey) || 
           this.optimizer.getCachedCalculation(calculationKey);
  }

  /**
   * Create optimized list manager for large datasets
   */
  createListOptimizer<T>(
    listId: string, 
    items: T[], 
    pageSize: number = this.defaultPageSize
  ): LargeListOptimizer<T> {
    // Check if items exceed memory limit
    if (items.length > this.maxItemsInMemory) {
      console.warn(`Large dataset detected (${items.length} items). Consider server-side pagination.`);
    }

    const optimizer = new LargeListOptimizer(items, pageSize);
    this.listOptimizers.set(listId, optimizer);
    
    // Register cleanup for this optimizer
    this.registerCleanupCallback(`list-${listId}`, () => {
      this.listOptimizers.delete(listId);
    });
    
    return optimizer;
  }

  /**
   * Get existing list optimizer
   */
  getListOptimizer<T>(listId: string): LargeListOptimizer<T> | undefined {
    return this.listOptimizers.get(listId) as LargeListOptimizer<T>;
  }

  /**
   * Remove list optimizer and free memory
   */
  removeListOptimizer(listId: string): void {
    this.listOptimizers.delete(listId);
    this.unregisterCleanupCallback(`list-${listId}`);
  }

  /**
   * Create weak reference for automatic cleanup
   */
  createWeakRef<T extends object>(obj: T, id?: number): WeakRef<T> {
    return this.weakRefManager.addRef(obj, id);
  }

  /**
   * Get memory statistics
   */
  getMemoryStats(): {
    tabDataCache: number;
    calculationCache: number;
    componentCache: number;
    listOptimizers: number;
    weakRefs: number;
    totalMemoryUsage: number;
    cleanupCallbacks: number;
  } {
    let totalMemoryUsage = 0;
    
    // Estimate memory usage
    try {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const memoryInfo = (performance as any).memory;
        if (memoryInfo) {
          totalMemoryUsage = memoryInfo.usedJSHeapSize;
        }
      }
    } catch (error) {
      // Memory API not available
    }

    return {
      tabDataCache: this.tabDataCache.size,
      calculationCache: this.calculationCache.size,
      componentCache: this.componentCache.size,
      listOptimizers: this.listOptimizers.size,
      weakRefs: this.weakRefManager.getLiveCount(),
      totalMemoryUsage: Math.round(totalMemoryUsage / 1024 / 1024), // MB
      cleanupCallbacks: this.cleanupCallbacks.size
    };
  }

  /**
   * Optimize service desk data for memory efficiency
   */
  optimizeServiceDeskData(data: ServiceDeskData): ServiceDeskData {
    // Create a memory-optimized copy
    const optimized = { ...data };
    
    // Optimize team data - keep only essential fields
    if (optimized.team && optimized.team.length > 100) {
      console.warn('Large team dataset detected. Consider pagination.');
    }
    
    // Optimize schedules - remove unnecessary data
    if (optimized.schedules && optimized.schedules.length > 200) {
      console.warn('Large schedules dataset detected. Consider pagination.');
    }
    
    // Optimize other costs - paginate if too many
    if (optimized.otherCosts && optimized.otherCosts.length > 100) {
      console.warn('Large costs dataset detected. Consider pagination.');
    }
    
    return optimized;
  }

  /**
   * Create paginated view of large arrays with enhanced memory management
   */
  createPaginatedView<T>(
    items: T[], 
    pageSize: number = this.defaultPageSize,
    options?: {
      enableVirtualization?: boolean;
      enableSearch?: boolean;
      searchFields?: (keyof T)[];
      enableSort?: boolean;
      cachePages?: boolean;
    }
  ): {
    totalItems: number;
    totalPages: number;
    getPage: (page: number) => T[];
    getCurrentPage: () => number;
    setCurrentPage: (page: number) => void;
    search: (term: string) => void;
    sort: (key: keyof T, direction: 'asc' | 'desc') => void;
    clearCache: () => void;
    getMemoryUsage: () => number;
  } {
    let currentPage = 1;
    let filteredItems = items;
    let searchTerm = '';
    let sortConfig: { key: keyof T; direction: 'asc' | 'desc' } | null = null;
    const pageCache = new Map<number, T[]>();
    const {
      enableVirtualization = items.length > 200,
      enableSearch = false,
      searchFields = [],
      enableSort = false,
      cachePages = items.length > 1000
    } = options || {};
    
    const applyFiltersAndSort = () => {
      let result = [...items];
      
      // Apply search filter
      if (enableSearch && searchTerm && searchFields.length > 0) {
        result = result.filter(item =>
          searchFields.some(field =>
            String(item[field]).toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      }
      
      // Apply sorting
      if (enableSort && sortConfig) {
        result.sort((a, b) => {
          const aVal = a[sortConfig!.key];
          const bVal = b[sortConfig!.key];
          
          if (aVal < bVal) return sortConfig!.direction === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortConfig!.direction === 'asc' ? 1 : -1;
          return 0;
        });
      }
      
      filteredItems = result;
      pageCache.clear(); // Clear cache when filters change
      currentPage = 1; // Reset to first page
    };
    
    const totalPages = () => Math.ceil(filteredItems.length / pageSize);
    
    return {
      totalItems: filteredItems.length,
      get totalPages() { return totalPages(); },
      getPage: (page: number) => {
        const pageNum = Math.max(1, Math.min(page, totalPages()));
        
        // Check cache first if enabled
        if (cachePages && pageCache.has(pageNum)) {
          return pageCache.get(pageNum)!;
        }
        
        const startIndex = (pageNum - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const pageItems = filteredItems.slice(startIndex, endIndex);
        
        // Cache the page if enabled
        if (cachePages) {
          pageCache.set(pageNum, pageItems);
          
          // Limit cache size to prevent memory issues
          if (pageCache.size > 10) {
            const oldestKey = pageCache.keys().next().value;
            pageCache.delete(oldestKey);
          }
        }
        
        return pageItems;
      },
      getCurrentPage: () => currentPage,
      setCurrentPage: (page: number) => {
        currentPage = Math.max(1, Math.min(page, totalPages()));
      },
      search: (term: string) => {
        if (enableSearch) {
          searchTerm = term.toLowerCase();
          applyFiltersAndSort();
        }
      },
      sort: (key: keyof T, direction: 'asc' | 'desc') => {
        if (enableSort) {
          sortConfig = { key, direction };
          applyFiltersAndSort();
        }
      },
      clearCache: () => {
        pageCache.clear();
      },
      getMemoryUsage: () => {
        return pageCache.size * pageSize * 0.001; // Rough estimate in KB
      }
    };
  }

  /**
   * Monitor component memory usage
   */
  monitorComponentMemory(componentName: string, component: React.ComponentType): void {
    this.componentCache.set(componentName, component);
    this.optimizer.cacheComponent(componentName, component);
    
    // Create weak reference for automatic cleanup
    this.createWeakRef(component as any, Date.now());
  }

  /**
   * Clean up component memory
   */
  cleanupComponentMemory(componentName: string): void {
    this.componentCache.delete(componentName);
    // The optimizer will handle its own cleanup
  }

  /**
   * Set memory threshold for automatic cleanup
   */
  setMemoryThreshold(thresholdMB: number): void {
    this.memoryThreshold = thresholdMB * 1024 * 1024;
  }

  /**
   * Force immediate memory cleanup
   */
  forceCleanup(): void {
    this.performMemoryCleanup();
  }

  /**
   * Destroy the memory manager and clean up all resources
   */
  destroy(): void {
    // Stop memory monitoring
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
      this.memoryCheckInterval = null;
    }
    
    // Stop auto cleanup
    if (this.autoCleanupInterval) {
      clearInterval(this.autoCleanupInterval);
      this.autoCleanupInterval = null;
    }
    
    // Perform final cleanup
    this.performMemoryCleanup();
    
    // Clear all caches
    this.tabDataCache.clear();
    this.calculationCache.clear();
    this.componentCache.clear();
    this.listOptimizers.clear();
    this.cleanupCallbacks.clear();
    this.dataAccessTimes.clear();
    
    // Unregister from global memory manager
    this.memoryManager.unregisterCleanupTask('service-desk-memory-manager');
  }

  /**
   * Get recommendations for memory optimization
   */
  getOptimizationRecommendations(): string[] {
    const stats = this.getMemoryStats();
    const recommendations: string[] = [];
    
    if (stats.totalMemoryUsage > 200) {
      recommendations.push('Consider reducing the amount of data loaded simultaneously');
    }
    
    if (stats.tabDataCache > 15) {
      recommendations.push('Too many tabs cached. Consider implementing tab-specific cleanup');
    }
    
    if (stats.calculationCache > 400) {
      recommendations.push('Large calculation cache. Consider clearing old calculations');
    }
    
    if (stats.listOptimizers > 10) {
      recommendations.push('Many list optimizers active. Consider cleanup of unused lists');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Memory usage is optimal');
    }
    
    return recommendations;
  }
}

// Export singleton instance
export const serviceDeskMemoryManager = ServiceDeskMemoryManager.getInstance();

// Export types for external use
export type ServiceDeskMemoryStats = ReturnType<ServiceDeskMemoryManager['getMemoryStats']>;
export type PaginatedView<T> = ReturnType<ServiceDeskMemoryManager['createPaginatedView']>;