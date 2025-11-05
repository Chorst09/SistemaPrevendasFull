import { useEffect, useRef, useCallback, useState } from 'react';

// Memory cleanup utilities
export class MemoryManager {
  private static instance: MemoryManager;
  private cleanupTasks: Map<string, () => void> = new Map();
  private memoryThreshold = 100 * 1024 * 1024; // 100MB threshold
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startMemoryMonitoring();
  }

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  // Register cleanup task
  registerCleanupTask(key: string, cleanupFn: () => void): void {
    this.cleanupTasks.set(key, cleanupFn);
  }

  // Unregister cleanup task
  unregisterCleanupTask(key: string): void {
    this.cleanupTasks.delete(key);
  }

  // Force cleanup of unused data
  forceCleanup(): void {
    this.cleanupTasks.forEach((cleanupFn, key) => {
      try {
        cleanupFn();
      } catch (error) {
        console.warn(`Cleanup failed for ${key}:`, error);
      }
    });

    // Force garbage collection if available
    if (typeof window !== 'undefined' && 'gc' in window) {
      (window as any).gc();
    }
  }

  // Start memory monitoring
  private startMemoryMonitoring(): void {
    if (typeof window === 'undefined') return;

    this.cleanupInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, 30000); // Check every 30 seconds
  }

  // Check memory usage and trigger cleanup if needed
  private checkMemoryUsage(): void {
    if (typeof window === 'undefined' || !('performance' in window)) return;

    try {
      const memoryInfo = (performance as any).memory;
      if (memoryInfo && memoryInfo.usedJSHeapSize > this.memoryThreshold) {
        console.log('Memory threshold exceeded, triggering cleanup');
        this.forceCleanup();
      }
    } catch (error) {
      // Memory API not available
    }
  }

  // Cleanup on destroy
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.forceCleanup();
    this.cleanupTasks.clear();
  }
}

// React hook for automatic memory cleanup
export const useMemoryCleanup = (key: string, cleanupFn: () => void) => {
  const memoryManager = useRef(MemoryManager.getInstance());

  useEffect(() => {
    memoryManager.current.registerCleanupTask(key, cleanupFn);

    return () => {
      memoryManager.current.unregisterCleanupTask(key);
    };
  }, [key, cleanupFn]);
};

// Pagination utility for large lists
export interface PaginationConfig {
  pageSize: number;
  totalItems: number;
  currentPage: number;
}

export class PaginationManager<T> {
  private items: T[] = [];
  private pageSize: number;
  private currentPage: number = 1;

  constructor(items: T[], pageSize: number = 50) {
    this.items = items;
    this.pageSize = pageSize;
  }

  // Get current page items
  getCurrentPageItems(): T[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.items.slice(startIndex, endIndex);
  }

  // Get pagination info
  getPaginationInfo(): PaginationConfig {
    return {
      pageSize: this.pageSize,
      totalItems: this.items.length,
      currentPage: this.currentPage
    };
  }

  // Navigate to page
  goToPage(page: number): void {
    const totalPages = Math.ceil(this.items.length / this.pageSize);
    this.currentPage = Math.max(1, Math.min(page, totalPages));
  }

  // Get total pages
  getTotalPages(): number {
    return Math.ceil(this.items.length / this.pageSize);
  }

  // Update items and reset to first page
  updateItems(newItems: T[]): void {
    this.items = newItems;
    this.currentPage = 1;
  }

  // Add items
  addItems(newItems: T[]): void {
    this.items.push(...newItems);
  }

  // Remove items
  removeItems(predicate: (item: T) => boolean): void {
    this.items = this.items.filter(item => !predicate(item));
    
    // Adjust current page if necessary
    const totalPages = this.getTotalPages();
    if (this.currentPage > totalPages) {
      this.currentPage = Math.max(1, totalPages);
    }
  }
}

// React hook for pagination
export const usePagination = <T>(
  items: T[],
  pageSize: number = 50
) => {
  const paginationManager = useRef(new PaginationManager(items, pageSize));

  // Update items when they change
  useEffect(() => {
    paginationManager.current.updateItems(items);
  }, [items]);

  const getCurrentPageItems = useCallback(() => {
    return paginationManager.current.getCurrentPageItems();
  }, []);

  const goToPage = useCallback((page: number) => {
    paginationManager.current.goToPage(page);
  }, []);

  const getPaginationInfo = useCallback(() => {
    return paginationManager.current.getPaginationInfo();
  }, []);

  const getTotalPages = useCallback(() => {
    return paginationManager.current.getTotalPages();
  }, []);

  return {
    getCurrentPageItems,
    goToPage,
    getPaginationInfo,
    getTotalPages
  };
};

// Virtual scrolling utility
export interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  overscan?: number; // Number of items to render outside visible area
}

export class VirtualScrollManager<T> {
  private items: T[] = [];
  private config: VirtualScrollConfig;
  private scrollTop: number = 0;

  constructor(items: T[], config: VirtualScrollConfig) {
    this.items = items;
    this.config = { overscan: 5, ...config };
  }

  // Calculate visible range
  getVisibleRange(): { start: number; end: number } {
    const { itemHeight, containerHeight, overscan = 5 } = this.config;
    
    const visibleStart = Math.floor(this.scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight),
      this.items.length - 1
    );

    // Add overscan
    const start = Math.max(0, visibleStart - overscan);
    const end = Math.min(this.items.length - 1, visibleEnd + overscan);

    return { start, end };
  }

  // Get visible items
  getVisibleItems(): { items: T[]; startIndex: number; endIndex: number } {
    const { start, end } = this.getVisibleRange();
    const items = this.items.slice(start, end + 1);
    
    return {
      items,
      startIndex: start,
      endIndex: end
    };
  }

  // Update scroll position
  updateScrollTop(scrollTop: number): void {
    this.scrollTop = scrollTop;
  }

  // Get total height
  getTotalHeight(): number {
    return this.items.length * this.config.itemHeight;
  }

  // Get offset for visible items
  getOffset(): number {
    const { start } = this.getVisibleRange();
    return start * this.config.itemHeight;
  }

  // Update items
  updateItems(newItems: T[]): void {
    this.items = newItems;
  }
}

// React hook for virtual scrolling
export const useVirtualScroll = <T>(
  items: T[],
  config: VirtualScrollConfig
) => {
  const virtualScrollManager = useRef(new VirtualScrollManager(items, config));
  const scrollTopRef = useRef(0);

  // Update items when they change
  useEffect(() => {
    virtualScrollManager.current.updateItems(items);
  }, [items]);

  const handleScroll = useCallback((scrollTop: number) => {
    scrollTopRef.current = scrollTop;
    virtualScrollManager.current.updateScrollTop(scrollTop);
  }, []);

  const getVisibleItems = useCallback(() => {
    return virtualScrollManager.current.getVisibleItems();
  }, []);

  const getTotalHeight = useCallback(() => {
    return virtualScrollManager.current.getTotalHeight();
  }, []);

  const getOffset = useCallback(() => {
    return virtualScrollManager.current.getOffset();
  }, []);

  return {
    handleScroll,
    getVisibleItems,
    getTotalHeight,
    getOffset
  };
};

// Data cleanup utilities
export const cleanupUnusedData = (data: any, keepKeys: string[] = []): any => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => cleanupUnusedData(item, keepKeys));
  }

  const cleaned: any = {};
  Object.keys(data).forEach(key => {
    if (keepKeys.length === 0 || keepKeys.includes(key)) {
      cleaned[key] = cleanupUnusedData(data[key], keepKeys);
    }
  });

  return cleaned;
};

// Memory-efficient data structures
export class MemoryEfficientMap<K, V> extends Map<K, V> {
  private maxSize: number;
  private accessOrder: K[] = [];

  constructor(maxSize: number = 1000) {
    super();
    this.maxSize = maxSize;
  }

  set(key: K, value: V): this {
    // Remove from access order if exists
    const existingIndex = this.accessOrder.indexOf(key);
    if (existingIndex !== -1) {
      this.accessOrder.splice(existingIndex, 1);
    }

    // Add to end of access order
    this.accessOrder.push(key);

    // Remove oldest if over limit
    if (this.accessOrder.length > this.maxSize) {
      const oldestKey = this.accessOrder.shift();
      if (oldestKey !== undefined) {
        super.delete(oldestKey);
      }
    }

    return super.set(key, value);
  }

  get(key: K): V | undefined {
    const value = super.get(key);
    
    if (value !== undefined) {
      // Move to end of access order
      const index = this.accessOrder.indexOf(key);
      if (index !== -1) {
        this.accessOrder.splice(index, 1);
        this.accessOrder.push(key);
      }
    }

    return value;
  }

  delete(key: K): boolean {
    const index = this.accessOrder.indexOf(key);
    if (index !== -1) {
      this.accessOrder.splice(index, 1);
    }
    return super.delete(key);
  }

  clear(): void {
    this.accessOrder = [];
    super.clear();
  }
}

// Weak reference utilities for automatic cleanup
export class WeakRefManager<T extends object> {
  private refs: WeakRef<T>[] = [];
  private cleanupRegistry = new FinalizationRegistry((heldValue: number) => {
    // Cleanup when object is garbage collected
    console.log(`Object ${heldValue} was garbage collected`);
  });

  addRef(obj: T, id?: number): WeakRef<T> {
    const ref = new WeakRef(obj);
    this.refs.push(ref);
    
    if (id !== undefined) {
      this.cleanupRegistry.register(obj, id);
    }
    
    return ref;
  }

  // Clean up dead references
  cleanup(): void {
    this.refs = this.refs.filter(ref => ref.deref() !== undefined);
  }

  // Get all live objects
  getLiveObjects(): T[] {
    this.cleanup();
    return this.refs
      .map(ref => ref.deref())
      .filter((obj): obj is T => obj !== undefined);
  }

  // Get count of live objects
  getLiveCount(): number {
    this.cleanup();
    return this.refs.length;
  }
}

// Service Desk specific memory optimization utilities
export class ServiceDeskMemoryOptimizer {
  private static instance: ServiceDeskMemoryOptimizer;
  private dataCache = new MemoryEfficientMap<string, any>(100);
  private calculationCache = new MemoryEfficientMap<string, any>(200);
  private componentCache = new MemoryEfficientMap<string, React.ComponentType>(50);

  private constructor() {}

  static getInstance(): ServiceDeskMemoryOptimizer {
    if (!ServiceDeskMemoryOptimizer.instance) {
      ServiceDeskMemoryOptimizer.instance = new ServiceDeskMemoryOptimizer();
    }
    return ServiceDeskMemoryOptimizer.instance;
  }

  // Cache tab data to avoid re-rendering
  cacheTabData(tabId: string, data: any): void {
    this.dataCache.set(`tab-${tabId}`, data);
  }

  getCachedTabData(tabId: string): any {
    return this.dataCache.get(`tab-${tabId}`);
  }

  // Cache calculation results
  cacheCalculation(key: string, result: any): void {
    this.calculationCache.set(key, result);
  }

  getCachedCalculation(key: string): any {
    return this.calculationCache.get(key);
  }

  // Cache React components for lazy loading
  cacheComponent(name: string, component: React.ComponentType): void {
    this.componentCache.set(name, component);
  }

  getCachedComponent(name: string): React.ComponentType | undefined {
    return this.componentCache.get(name);
  }

  // Clear specific cache type
  clearCache(type: 'data' | 'calculations' | 'components' | 'all'): void {
    switch (type) {
      case 'data':
        this.dataCache.clear();
        break;
      case 'calculations':
        this.calculationCache.clear();
        break;
      case 'components':
        this.componentCache.clear();
        break;
      case 'all':
        this.dataCache.clear();
        this.calculationCache.clear();
        this.componentCache.clear();
        break;
    }
  }

  // Get memory usage statistics
  getMemoryStats(): {
    dataCache: number;
    calculationCache: number;
    componentCache: number;
    total: number;
  } {
    const dataSize = this.dataCache.size;
    const calcSize = this.calculationCache.size;
    const compSize = this.componentCache.size;
    
    return {
      dataCache: dataSize,
      calculationCache: calcSize,
      componentCache: compSize,
      total: dataSize + calcSize + compSize
    };
  }
}

// React hook for service desk memory optimization
export const useServiceDeskMemoryOptimization = (tabId: string) => {
  const optimizer = useRef(ServiceDeskMemoryOptimizer.getInstance());

  const cacheTabData = useCallback((data: any) => {
    optimizer.current.cacheTabData(tabId, data);
  }, [tabId]);

  const getCachedTabData = useCallback(() => {
    return optimizer.current.getCachedTabData(tabId);
  }, [tabId]);

  const clearTabCache = useCallback(() => {
    optimizer.current.clearCache('data');
  }, []);

  // Register cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't clear cache on unmount to preserve data between tab switches
    };
  }, []);

  return {
    cacheTabData,
    getCachedTabData,
    clearTabCache
  };
};

// Large list optimization utilities
export class LargeListOptimizer<T> {
  private items: T[] = [];
  private filteredItems: T[] = [];
  private pageSize: number;
  private currentPage: number = 1;
  private searchTerm: string = '';
  private searchFields: (keyof T)[] = [];
  private sortConfig: { key: keyof T; direction: 'asc' | 'desc' } | null = null;

  constructor(items: T[], pageSize: number = 50) {
    this.items = items;
    this.filteredItems = items;
    this.pageSize = pageSize;
  }

  // Update items and reset pagination
  updateItems(newItems: T[]): void {
    this.items = newItems;
    this.applyFiltersAndSort();
    this.currentPage = 1;
  }

  // Apply search filter
  search(term: string, searchFields: (keyof T)[]): void {
    this.searchTerm = term.toLowerCase();
    this.searchFields = searchFields;
    this.applyFiltersAndSort();
    this.currentPage = 1;
  }

  // Apply sorting
  sort(key: keyof T, direction: 'asc' | 'desc'): void {
    this.sortConfig = { key, direction };
    this.applyFiltersAndSort();
  }

  // Apply filters and sorting
  private applyFiltersAndSort(): void {
    let result = [...this.items];

    // Apply search filter
    if (this.searchTerm && this.searchFields.length > 0) {
      result = result.filter(item => {
        return this.searchFields.some(field => 
          String(item[field]).toLowerCase().includes(this.searchTerm)
        );
      });
    }

    // Apply sorting
    if (this.sortConfig) {
      result.sort((a, b) => {
        const aVal = a[this.sortConfig!.key];
        const bVal = b[this.sortConfig!.key];
        
        if (aVal < bVal) return this.sortConfig!.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return this.sortConfig!.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    this.filteredItems = result;
  }

  // Get current page items
  getCurrentPageItems(): T[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredItems.slice(startIndex, endIndex);
  }

  // Navigation methods
  goToPage(page: number): void {
    const totalPages = this.getTotalPages();
    this.currentPage = Math.max(1, Math.min(page, totalPages));
  }

  nextPage(): boolean {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
      return true;
    }
    return false;
  }

  previousPage(): boolean {
    if (this.currentPage > 1) {
      this.currentPage--;
      return true;
    }
    return false;
  }

  // Get pagination info
  getPaginationInfo(): {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    hasNext: boolean;
    hasPrevious: boolean;
  } {
    const totalPages = this.getTotalPages();
    return {
      currentPage: this.currentPage,
      totalPages,
      totalItems: this.filteredItems.length,
      pageSize: this.pageSize,
      hasNext: this.currentPage < totalPages,
      hasPrevious: this.currentPage > 1
    };
  }

  private getTotalPages(): number {
    return Math.ceil(this.filteredItems.length / this.pageSize);
  }
}

// React hook for large list optimization
export const useLargeListOptimization = <T>(
  items: T[],
  pageSize: number = 50
) => {
  const [optimizer] = useState(() => new LargeListOptimizer(items, pageSize));
  const [, forceUpdate] = useState({});

  // Force re-render
  const triggerUpdate = useCallback(() => {
    forceUpdate({});
  }, []);

  // Update items
  useEffect(() => {
    optimizer.updateItems(items);
    triggerUpdate();
  }, [items, optimizer, triggerUpdate]);

  const search = useCallback((term: string, searchFields: (keyof T)[]) => {
    optimizer.search(term, searchFields);
    triggerUpdate();
  }, [optimizer, triggerUpdate]);

  const sort = useCallback((key: keyof T, direction: 'asc' | 'desc') => {
    optimizer.sort(key, direction);
    triggerUpdate();
  }, [optimizer, triggerUpdate]);

  const goToPage = useCallback((page: number) => {
    optimizer.goToPage(page);
    triggerUpdate();
  }, [optimizer, triggerUpdate]);

  const nextPage = useCallback(() => {
    if (optimizer.nextPage()) {
      triggerUpdate();
    }
  }, [optimizer, triggerUpdate]);

  const previousPage = useCallback(() => {
    if (optimizer.previousPage()) {
      triggerUpdate();
    }
  }, [optimizer, triggerUpdate]);

  return {
    currentItems: optimizer.getCurrentPageItems(),
    paginationInfo: optimizer.getPaginationInfo(),
    search,
    sort,
    goToPage,
    nextPage,
    previousPage
  };
};

// Memory-efficient data structures for service desk
export class ServiceDeskDataStructures {
  // Efficient storage for team members with quick lookup
  static createTeamMemberIndex<T extends { id: string; role: string }>(
    members: T[]
  ): Map<string, T[]> {
    const index = new Map<string, T[]>();
    
    members.forEach(member => {
      const role = member.role;
      if (!index.has(role)) {
        index.set(role, []);
      }
      index.get(role)!.push(member);
    });
    
    return index;
  }

  // Efficient storage for schedules with time-based lookup
  static createScheduleIndex<T extends { id: string; startTime: Date; endTime: Date }>(
    schedules: T[]
  ): Map<string, T[]> {
    const index = new Map<string, T[]>();
    
    schedules.forEach(schedule => {
      const dateKey = schedule.startTime.toDateString();
      if (!index.has(dateKey)) {
        index.set(dateKey, []);
      }
      index.get(dateKey)!.push(schedule);
    });
    
    return index;
  }

  // Efficient cost calculation cache
  static createCostCalculationCache(): MemoryEfficientMap<string, number> {
    return new MemoryEfficientMap<string, number>(500);
  }
}

// Global memory manager instance
export const globalMemoryManager = MemoryManager.getInstance();
export const serviceDeskMemoryOptimizer = ServiceDeskMemoryOptimizer.getInstance();