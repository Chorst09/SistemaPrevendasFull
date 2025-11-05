import { useEffect, useRef, useCallback, useState } from 'react';
import { 
  useMemoryCleanup, 
  serviceDeskMemoryOptimizer,
  globalMemoryManager,
  MemoryEfficientMap
} from '@/lib/utils/memory-optimization';

// Hook for tab-specific memory optimization
export const useTabMemoryOptimization = (tabId: string) => {
  const [isActive, setIsActive] = useState(false);
  const dataRef = useRef<any>(null);
  const cleanupFunctions = useRef<Array<() => void>>([]);

  // Register cleanup for this tab
  useMemoryCleanup(`tab-${tabId}`, () => {
    // Clean up tab-specific data when memory pressure is detected
    if (!isActive) {
      dataRef.current = null;
      serviceDeskMemoryOptimizer.clearCache('data');
    }
  });

  // Mark tab as active/inactive for memory management
  const setTabActive = useCallback((active: boolean) => {
    setIsActive(active);
    
    if (!active) {
      // Schedule cleanup for inactive tab after delay
      const timeout = setTimeout(() => {
        if (!isActive) {
          dataRef.current = null;
        }
      }, 30000); // 30 seconds delay
      
      cleanupFunctions.current.push(() => clearTimeout(timeout));
    }
  }, [isActive]);

  // Cache data for this tab
  const cacheData = useCallback((data: any) => {
    dataRef.current = data;
    serviceDeskMemoryOptimizer.cacheTabData(tabId, data);
  }, [tabId]);

  // Get cached data
  const getCachedData = useCallback(() => {
    return dataRef.current || serviceDeskMemoryOptimizer.getCachedTabData(tabId);
  }, [tabId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupFunctions.current.forEach(cleanup => cleanup());
      cleanupFunctions.current = [];
    };
  }, []);

  return {
    setTabActive,
    cacheData,
    getCachedData,
    isActive
  };
};

// Hook for large dataset memory optimization
export const useLargeDatasetOptimization = <T>(
  data: T[],
  options: {
    pageSize?: number;
    cacheKey?: string;
    enableVirtualization?: boolean;
    itemHeight?: number;
  } = {}
) => {
  const {
    pageSize = 50,
    cacheKey,
    enableVirtualization = false,
    itemHeight = 60
  } = options;

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: 'asc' | 'desc';
  } | null>(null);

  const cache = useRef(new MemoryEfficientMap<string, T[]>(10));
  const filteredDataRef = useRef<T[]>(data);

  // Apply filters and sorting
  const processData = useCallback(() => {
    let result = [...data];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(item =>
        Object.values(item as any).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    filteredDataRef.current = result;

    // Cache processed data if cache key provided
    if (cacheKey) {
      cache.current.set(`${cacheKey}-${searchTerm}-${JSON.stringify(sortConfig)}`, result);
    }

    return result;
  }, [data, searchTerm, sortConfig, cacheKey]);

  // Get current page data
  const getCurrentPageData = useCallback(() => {
    const filteredData = processData();
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      items: filteredData.slice(startIndex, endIndex),
      totalItems: filteredData.length,
      totalPages: Math.ceil(filteredData.length / pageSize),
      currentPage,
      hasNext: currentPage < Math.ceil(filteredData.length / pageSize),
      hasPrevious: currentPage > 1
    };
  }, [processData, currentPage, pageSize]);

  // Navigation functions
  const goToPage = useCallback((page: number) => {
    const totalPages = Math.ceil(filteredDataRef.current.length / pageSize);
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [pageSize]);

  const nextPage = useCallback(() => {
    const totalPages = Math.ceil(filteredDataRef.current.length / pageSize);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, pageSize]);

  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  // Search function
  const search = useCallback((term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page
  }, []);

  // Sort function
  const sort = useCallback((key: keyof T, direction: 'asc' | 'desc') => {
    setSortConfig({ key, direction });
    setCurrentPage(1); // Reset to first page
  }, []);

  // Clear cache when data changes
  useEffect(() => {
    if (cacheKey) {
      cache.current.clear();
    }
    setCurrentPage(1);
  }, [data, cacheKey]);

  // Register memory cleanup
  useMemoryCleanup(`large-dataset-${cacheKey || 'default'}`, () => {
    cache.current.clear();
  });

  return {
    ...getCurrentPageData(),
    search,
    sort,
    goToPage,
    nextPage,
    previousPage,
    searchTerm,
    sortConfig,
    enableVirtualization,
    itemHeight
  };
};

// Hook for calculation result caching
export const useCalculationCache = (cacheKey: string) => {
  const cache = useRef(new MemoryEfficientMap<string, any>(100));

  const getCachedResult = useCallback((key: string) => {
    const fullKey = `${cacheKey}-${key}`;
    return cache.current.get(fullKey) || serviceDeskMemoryOptimizer.getCachedCalculation(fullKey);
  }, [cacheKey]);

  const setCachedResult = useCallback((key: string, result: any) => {
    const fullKey = `${cacheKey}-${key}`;
    cache.current.set(fullKey, result);
    serviceDeskMemoryOptimizer.cacheCalculation(fullKey, result);
  }, [cacheKey]);

  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  // Register cleanup
  useMemoryCleanup(`calculation-cache-${cacheKey}`, () => {
    cache.current.clear();
  });

  return {
    getCachedResult,
    setCachedResult,
    clearCache
  };
};

// Hook for component lazy loading with memory optimization
export const useLazyComponentLoading = () => {
  const [loadedComponents, setLoadedComponents] = useState<Set<string>>(new Set());
  const componentCache = useRef(new Map<string, React.ComponentType>());

  const loadComponent = useCallback(async (
    componentName: string,
    importFn: () => Promise<{ default: React.ComponentType }>
  ): Promise<React.ComponentType | null> => {
    // Check if already cached
    const cached = componentCache.current.get(componentName) || 
                  serviceDeskMemoryOptimizer.getCachedComponent(componentName);
    
    if (cached) {
      return cached;
    }

    try {
      const module = await importFn();
      const component = module.default;
      
      // Cache the component
      componentCache.current.set(componentName, component);
      serviceDeskMemoryOptimizer.cacheComponent(componentName, component);
      
      setLoadedComponents(prev => new Set([...prev, componentName]));
      
      return component;
    } catch (error) {
      console.error(`Failed to load component ${componentName}:`, error);
      return null;
    }
  }, []);

  const isComponentLoaded = useCallback((componentName: string) => {
    return loadedComponents.has(componentName);
  }, [loadedComponents]);

  const unloadComponent = useCallback((componentName: string) => {
    componentCache.current.delete(componentName);
    setLoadedComponents(prev => {
      const newSet = new Set(prev);
      newSet.delete(componentName);
      return newSet;
    });
  }, []);

  // Register cleanup
  useMemoryCleanup('lazy-components', () => {
    componentCache.current.clear();
    setLoadedComponents(new Set());
  });

  return {
    loadComponent,
    isComponentLoaded,
    unloadComponent,
    loadedComponents: Array.from(loadedComponents)
  };
};

// Hook for memory usage monitoring
export const useMemoryMonitoring = () => {
  const [memoryStats, setMemoryStats] = useState({
    used: 0,
    total: 0,
    percentage: 0
  });

  const updateMemoryStats = useCallback(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      try {
        const memoryInfo = (performance as any).memory;
        if (memoryInfo) {
          const used = memoryInfo.usedJSHeapSize;
          const total = memoryInfo.totalJSHeapSize;
          const percentage = (used / total) * 100;
          
          setMemoryStats({
            used: Math.round(used / 1024 / 1024), // MB
            total: Math.round(total / 1024 / 1024), // MB
            percentage: Math.round(percentage)
          });
        }
      } catch (error) {
        // Memory API not available
      }
    }
  }, []);

  const getServiceDeskMemoryStats = useCallback(() => {
    return serviceDeskMemoryOptimizer.getMemoryStats();
  }, []);

  const forceGarbageCollection = useCallback(() => {
    globalMemoryManager.forceCleanup();
    
    // Force garbage collection if available
    if (typeof window !== 'undefined' && 'gc' in window) {
      (window as any).gc();
    }
    
    // Update stats after cleanup
    setTimeout(updateMemoryStats, 100);
  }, [updateMemoryStats]);

  // Update stats periodically
  useEffect(() => {
    updateMemoryStats();
    const interval = setInterval(updateMemoryStats, 10000); // Every 10 seconds
    
    return () => clearInterval(interval);
  }, [updateMemoryStats]);

  return {
    memoryStats,
    serviceDeskStats: getServiceDeskMemoryStats(),
    updateMemoryStats,
    forceGarbageCollection
  };
};

// Hook for automatic data cleanup based on usage patterns
export const useDataCleanup = (dataKey: string, maxAge: number = 300000) => { // 5 minutes default
  const lastAccessTime = useRef<Map<string, number>>(new Map());
  const cleanupInterval = useRef<NodeJS.Timeout | null>(null);

  const markDataAccess = useCallback((key: string) => {
    lastAccessTime.current.set(key, Date.now());
  }, []);

  const cleanupOldData = useCallback(() => {
    const now = Date.now();
    const keysToRemove: string[] = [];
    
    lastAccessTime.current.forEach((accessTime, key) => {
      if (now - accessTime > maxAge) {
        keysToRemove.push(key);
      }
    });
    
    keysToRemove.forEach(key => {
      lastAccessTime.current.delete(key);
      // Trigger cleanup for this specific data
      serviceDeskMemoryOptimizer.clearCache('data');
    });
    
    if (keysToRemove.length > 0) {
      console.log(`Cleaned up ${keysToRemove.length} old data entries for ${dataKey}`);
    }
  }, [dataKey, maxAge]);

  // Start cleanup interval
  useEffect(() => {
    cleanupInterval.current = setInterval(cleanupOldData, 60000); // Check every minute
    
    return () => {
      if (cleanupInterval.current) {
        clearInterval(cleanupInterval.current);
      }
    };
  }, [cleanupOldData]);

  // Register with global memory manager
  useMemoryCleanup(`data-cleanup-${dataKey}`, cleanupOldData);

  return {
    markDataAccess,
    cleanupOldData
  };
};

// Hook for enhanced service desk memory optimization
export const useServiceDeskMemoryOptimization = (tabId: string) => {
  const [memoryStats, setMemoryStats] = useState({
    tabDataCache: 0,
    calculationCache: 0,
    totalMemoryUsage: 0
  });

  const memoryManagerRef = useRef<any>(null);

  // Initialize memory manager
  useEffect(() => {
    const initMemoryManager = async () => {
      const { serviceDeskMemoryManager } = await import('@/lib/services/service-desk-memory-manager');
      memoryManagerRef.current = serviceDeskMemoryManager;
      
      // Register cleanup for this tab
      serviceDeskMemoryManager.registerCleanupCallback(`tab-${tabId}`, () => {
        console.log(`Cleaning up memory for tab: ${tabId}`);
      });
    };

    initMemoryManager();

    return () => {
      if (memoryManagerRef.current) {
        memoryManagerRef.current.unregisterCleanupCallback(`tab-${tabId}`);
      }
    };
  }, [tabId]);

  // Update memory stats periodically
  useEffect(() => {
    const updateStats = () => {
      if (memoryManagerRef.current) {
        const stats = memoryManagerRef.current.getMemoryStats();
        setMemoryStats({
          tabDataCache: stats.tabDataCache,
          calculationCache: stats.calculationCache,
          totalMemoryUsage: stats.totalMemoryUsage
        });
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const cacheTabData = useCallback((data: any) => {
    if (memoryManagerRef.current) {
      memoryManagerRef.current.cacheTabData(tabId, data);
    }
  }, [tabId]);

  const getCachedTabData = useCallback(() => {
    if (memoryManagerRef.current) {
      return memoryManagerRef.current.getCachedTabData(tabId);
    }
    return null;
  }, [tabId]);

  const cacheCalculation = useCallback((key: string, result: any) => {
    if (memoryManagerRef.current) {
      memoryManagerRef.current.cacheCalculation(`${tabId}-${key}`, result);
    }
  }, [tabId]);

  const getCachedCalculation = useCallback((key: string) => {
    if (memoryManagerRef.current) {
      return memoryManagerRef.current.getCachedCalculation(`${tabId}-${key}`);
    }
    return null;
  }, [tabId]);

  const createListOptimizer = useCallback(<T>(listId: string, items: T[], pageSize?: number) => {
    if (memoryManagerRef.current) {
      return memoryManagerRef.current.createListOptimizer(`${tabId}-${listId}`, items, pageSize);
    }
    return null;
  }, [tabId]);

  const forceCleanup = useCallback(() => {
    if (memoryManagerRef.current) {
      memoryManagerRef.current.forceCleanup();
    }
  }, []);

  const getOptimizationRecommendations = useCallback(() => {
    if (memoryManagerRef.current) {
      return memoryManagerRef.current.getOptimizationRecommendations();
    }
    return [];
  }, []);

  return {
    memoryStats,
    cacheTabData,
    getCachedTabData,
    cacheCalculation,
    getCachedCalculation,
    createListOptimizer,
    forceCleanup,
    getOptimizationRecommendations
  };
};