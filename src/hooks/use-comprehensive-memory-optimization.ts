import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { 
  useServiceDeskMemoryOptimization,
  useTabMemoryOptimization,
  useLargeDatasetOptimization,
  useCalculationCache,
  useMemoryMonitoring,
  useDataCleanup
} from './use-memory-optimization';
import { serviceDeskMemoryManager } from '@/lib/services/service-desk-memory-manager';
import { automaticDataCleanup, useAutomaticDataCleanup } from '@/lib/services/automatic-data-cleanup';

export interface MemoryOptimizationConfig {
  tabId: string;
  enableAutoCleanup?: boolean;
  enableVirtualization?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  maxMemoryUsage?: number; // MB
  cleanupInterval?: number; // milliseconds
  cacheSize?: number;
}

export interface MemoryOptimizationResult<T> {
  // Data management
  optimizedData: T[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  
  // Memory stats
  memoryStats: {
    used: number;
    total: number;
    percentage: number;
    cacheSize: number;
    recommendations: string[];
  };
  
  // Actions
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  search: (term: string, fields: (keyof T)[]) => void;
  sort: (key: keyof T, direction: 'asc' | 'desc') => void;
  forceCleanup: () => void;
  clearCache: () => void;
  
  // Optimization flags
  isVirtualized: boolean;
  isPaginated: boolean;
  isMemoryOptimized: boolean;
  shouldShowWarning: boolean;
}

/**
 * Comprehensive memory optimization hook that combines all memory optimization features
 */
export const useComprehensiveMemoryOptimization = <T extends Record<string, any>>(
  data: T[],
  config: MemoryOptimizationConfig
): MemoryOptimizationResult<T> => {
  const {
    tabId,
    enableAutoCleanup = true,
    enableVirtualization = true,
    enablePagination = true,
    pageSize = 50,
    maxMemoryUsage = 200,
    cleanupInterval = 5 * 60 * 1000, // 5 minutes
    cacheSize = 100
  } = config;

  // Core memory optimization hooks
  const serviceDeskMemory = useServiceDeskMemoryOptimization(tabId);
  const tabMemory = useTabMemoryOptimization(tabId);
  const calculationCache = useCalculationCache(tabId);
  const memoryMonitoring = useMemoryMonitoring();
  const dataCleanup = useDataCleanup(tabId, cleanupInterval);
  
  // Automatic data cleanup integration
  const automaticCleanup = useAutomaticDataCleanup(
    `comprehensive-${tabId}`,
    useCallback(() => {
      serviceDeskMemory.forceCleanup();
      calculationCache.clearCache();
    }, [serviceDeskMemory, calculationCache])
  );

  // State for data management
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFields, setSearchFields] = useState<(keyof T)[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Large dataset optimization
  const largeDatasetResult = useLargeDatasetOptimization(data, {
    pageSize,
    cacheKey: `${tabId}-dataset`,
    enableVirtualization: enableVirtualization && data.length > 200,
    itemHeight: 60
  });

  // Determine optimization strategies based on data size and memory usage
  const optimizationStrategy = useMemo(() => {
    const dataSize = data.length;
    const memoryUsage = memoryMonitoring.memoryStats.used;
    
    return {
      shouldVirtualize: enableVirtualization && dataSize > 200,
      shouldPaginate: enablePagination && (dataSize > 100 || memoryUsage > maxMemoryUsage),
      shouldOptimizeMemory: dataSize > 50 || memoryUsage > maxMemoryUsage / 2,
      shouldShowWarning: memoryUsage > maxMemoryUsage || dataSize > 1000
    };
  }, [data.length, memoryMonitoring.memoryStats.used, maxMemoryUsage, enableVirtualization, enablePagination]);

  // Process data with caching
  const processedData = useMemo(() => {
    const cacheKey = `processed-${tabId}-${searchTerm}-${JSON.stringify(sortConfig)}`;
    
    // Check cache first
    const cached = calculationCache.getCachedResult(cacheKey);
    if (cached) return cached;

    let result = [...data];

    // Apply search filter
    if (searchTerm && searchFields.length > 0) {
      result = result.filter(item =>
        searchFields.some(field =>
          String(item[field]).toLowerCase().includes(searchTerm.toLowerCase())
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

    // Cache the result
    calculationCache.setCachedResult(cacheKey, result);
    
    return result;
  }, [data, searchTerm, searchFields, sortConfig, tabId, calculationCache]);

  // Get optimized data based on strategy
  const optimizedData = useMemo(() => {
    if (optimizationStrategy.shouldPaginate) {
      return largeDatasetResult.items;
    }
    return processedData;
  }, [optimizationStrategy.shouldPaginate, largeDatasetResult.items, processedData]);

  // Memory statistics
  const memoryStats = useMemo(() => {
    const serviceStats = serviceDeskMemory.memoryStats;
    const globalStats = memoryMonitoring.memoryStats;
    const recommendations = serviceDeskMemory.getOptimizationRecommendations();

    return {
      used: globalStats.used,
      total: globalStats.total,
      percentage: globalStats.percentage,
      cacheSize: serviceStats.calculationCache + serviceStats.tabDataCache,
      recommendations
    };
  }, [serviceDeskMemory.memoryStats, memoryMonitoring.memoryStats, serviceDeskMemory]);

  // Search function
  const search = useCallback((term: string, fields: (keyof T)[]) => {
    setSearchTerm(term);
    setSearchFields(fields);
    dataCleanup.markDataAccess(`search-${term}`);
    automaticCleanup.trackAccess(); // Track access for automatic cleanup
  }, [dataCleanup, automaticCleanup]);

  // Sort function
  const sort = useCallback((key: keyof T, direction: 'asc' | 'desc') => {
    setSortConfig({ key, direction });
    dataCleanup.markDataAccess(`sort-${key.toString()}-${direction}`);
    automaticCleanup.trackAccess(); // Track access for automatic cleanup
  }, [dataCleanup, automaticCleanup]);

  // Force cleanup
  const forceCleanup = useCallback(() => {
    serviceDeskMemory.forceCleanup();
    calculationCache.clearCache();
    memoryMonitoring.forceGarbageCollection();
    dataCleanup.cleanupOldData();
    automaticCleanup.forceCleanup(); // Force automatic cleanup
  }, [serviceDeskMemory, calculationCache, memoryMonitoring, dataCleanup, automaticCleanup]);

  // Clear cache
  const clearCache = useCallback(() => {
    calculationCache.clearCache();
    serviceDeskMemory.cacheTabData(null);
  }, [calculationCache, serviceDeskMemory]);

  // Auto cleanup based on memory usage
  useEffect(() => {
    if (!enableAutoCleanup) return;

    const checkMemoryAndCleanup = () => {
      if (memoryStats.used > maxMemoryUsage) {
        console.log(`Memory usage (${memoryStats.used}MB) exceeded threshold (${maxMemoryUsage}MB), triggering cleanup`);
        forceCleanup();
      }
    };

    const interval = setInterval(checkMemoryAndCleanup, cleanupInterval);
    return () => clearInterval(interval);
  }, [enableAutoCleanup, memoryStats.used, maxMemoryUsage, cleanupInterval, forceCleanup]);

  // Cache current data for tab switching
  useEffect(() => {
    if (optimizationStrategy.shouldOptimizeMemory) {
      serviceDeskMemory.cacheTabData(optimizedData);
    }
  }, [optimizedData, optimizationStrategy.shouldOptimizeMemory, serviceDeskMemory]);

  // Mark tab as active for memory management
  useEffect(() => {
    tabMemory.setTabActive(true);
    return () => tabMemory.setTabActive(false);
  }, [tabMemory]);

  // Create list optimizer for very large datasets
  useEffect(() => {
    if (data.length > 1000) {
      serviceDeskMemory.createListOptimizer(`${tabId}-comprehensive`, data, pageSize);
    }
  }, [data, tabId, pageSize, serviceDeskMemory]);

  return {
    // Data
    optimizedData,
    totalItems: processedData.length,
    currentPage: largeDatasetResult.currentPage || 1,
    totalPages: largeDatasetResult.totalPages || 1,
    
    // Memory stats
    memoryStats,
    
    // Actions
    goToPage: largeDatasetResult.goToPage || (() => {}),
    nextPage: largeDatasetResult.nextPage || (() => {}),
    previousPage: largeDatasetResult.previousPage || (() => {}),
    search,
    sort,
    forceCleanup,
    clearCache,
    
    // Optimization flags
    isVirtualized: optimizationStrategy.shouldVirtualize,
    isPaginated: optimizationStrategy.shouldPaginate,
    isMemoryOptimized: optimizationStrategy.shouldOptimizeMemory,
    shouldShowWarning: optimizationStrategy.shouldShowWarning
  };
};

/**
 * Hook for automatic memory optimization based on data characteristics
 */
export const useAutoMemoryOptimization = <T extends Record<string, any>>(
  data: T[],
  tabId: string
) => {
  // Automatically determine optimization config based on data
  const config = useMemo((): MemoryOptimizationConfig => {
    const dataSize = data.length;
    const estimatedMemoryUsage = dataSize * 0.001; // Rough estimate: 1KB per item
    
    return {
      tabId,
      enableAutoCleanup: dataSize > 100,
      enableVirtualization: dataSize > 200,
      enablePagination: dataSize > 50,
      pageSize: dataSize > 1000 ? 25 : dataSize > 500 ? 50 : 100,
      maxMemoryUsage: Math.max(100, estimatedMemoryUsage * 2),
      cleanupInterval: dataSize > 1000 ? 2 * 60 * 1000 : 5 * 60 * 1000,
      cacheSize: Math.min(200, Math.max(50, Math.floor(dataSize / 10)))
    };
  }, [data.length, tabId]);

  return useComprehensiveMemoryOptimization(data, config);
};

/**
 * Hook for memory optimization with custom thresholds
 */
export const useCustomMemoryOptimization = <T extends Record<string, any>>(
  data: T[],
  tabId: string,
  customConfig: Partial<MemoryOptimizationConfig>
) => {
  const defaultConfig: MemoryOptimizationConfig = {
    tabId,
    enableAutoCleanup: true,
    enableVirtualization: true,
    enablePagination: true,
    pageSize: 50,
    maxMemoryUsage: 200,
    cleanupInterval: 5 * 60 * 1000,
    cacheSize: 100
  };

  const config = useMemo(() => ({
    ...defaultConfig,
    ...customConfig
  }), [customConfig]);

  return useComprehensiveMemoryOptimization(data, config);
};

/**
 * Hook for monitoring memory optimization performance
 */
export const useMemoryOptimizationMetrics = (tabId: string) => {
  const [metrics, setMetrics] = useState({
    cleanupCount: 0,
    cacheHitRate: 0,
    memoryReduction: 0,
    performanceGain: 0
  });

  const startTime = useRef(Date.now());
  const initialMemory = useRef(0);

  // Track metrics
  useEffect(() => {
    const updateMetrics = () => {
      const stats = serviceDeskMemoryManager.getMemoryStats();
      const currentTime = Date.now();
      const elapsed = currentTime - startTime.current;
      
      setMetrics(prev => ({
        cleanupCount: prev.cleanupCount,
        cacheHitRate: stats.calculationCache > 0 ? (stats.calculationCache / (stats.calculationCache + stats.tabDataCache)) * 100 : 0,
        memoryReduction: initialMemory.current > 0 ? ((initialMemory.current - stats.totalMemoryUsage) / initialMemory.current) * 100 : 0,
        performanceGain: elapsed > 0 ? Math.max(0, (10000 - elapsed) / 100) : 0 // Rough performance metric
      }));
    };

    // Set initial memory
    if (initialMemory.current === 0) {
      const stats = serviceDeskMemoryManager.getMemoryStats();
      initialMemory.current = stats.totalMemoryUsage;
    }

    const interval = setInterval(updateMetrics, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [tabId]);

  return metrics;
};