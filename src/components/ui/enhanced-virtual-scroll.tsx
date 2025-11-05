import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MemoryStick
} from 'lucide-react';
import { serviceDeskMemoryManager } from '@/lib/services/service-desk-memory-manager';

export interface EnhancedVirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  pageSize?: number;
  overscan?: number;
  enableMemoryOptimization?: boolean;
  enablePagination?: boolean;
  enableSearch?: boolean;
  enableSort?: boolean;
  searchFields?: string[];
  memoryThreshold?: number; // MB
}

export interface VirtualScrollItem {
  id: string;
  [key: string]: any;
}

export interface EnhancedVirtualScrollProps<T extends VirtualScrollItem> {
  items: T[];
  renderItem: (item: T, index: number, isVisible: boolean) => React.ReactNode;
  config: EnhancedVirtualScrollConfig;
  className?: string;
  onItemClick?: (item: T, index: number) => void;
  listId?: string;
}

/**
 * Enhanced virtual scroll component with automatic memory optimization
 */
export function EnhancedVirtualScroll<T extends VirtualScrollItem>({
  items,
  renderItem,
  config,
  className = '',
  onItemClick,
  listId = 'enhanced-virtual-scroll'
}: EnhancedVirtualScrollProps<T>) {
  const {
    itemHeight,
    containerHeight,
    pageSize = 50,
    overscan = 5,
    enableMemoryOptimization = true,
    enablePagination = true,
    enableSearch = false,
    enableSort = false,
    searchFields = [],
    memoryThreshold = 100
  } = config;

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [memoryStats, setMemoryStats] = useState({ used: 0, total: 0 });

  // Memory manager instance
  const memoryManager = serviceDeskMemoryManager;

  // Determine optimization strategy based on data size and memory usage
  const optimizationStrategy = useMemo(() => {
    const dataSize = items.length;
    const shouldVirtualize = dataSize > 200;
    const shouldPaginate = enablePagination && (dataSize > 100 || memoryStats.used > memoryThreshold);
    const shouldOptimizeMemory = enableMemoryOptimization && (dataSize > 50 || memoryStats.used > memoryThreshold / 2);
    
    return {
      shouldVirtualize,
      shouldPaginate,
      shouldOptimizeMemory,
      shouldShowWarning: memoryStats.used > memoryThreshold || dataSize > 1000
    };
  }, [items.length, memoryStats.used, memoryThreshold, enablePagination, enableMemoryOptimization]);

  // Filter and sort items with caching
  const processedItems = useMemo(() => {
    const cacheKey = `processed-${listId}-${searchTerm}-${JSON.stringify(sortConfig)}`;
    
    // Check cache first
    const cached = memoryManager.getCachedCalculation(cacheKey);
    if (cached) return cached;

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
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Cache the result
    memoryManager.cacheCalculation(cacheKey, result);
    
    return result;
  }, [items, searchTerm, searchFields, sortConfig, listId, enableSearch, enableSort, memoryManager]);

  // Get current page items for pagination
  const currentPageItems = useMemo(() => {
    if (!optimizationStrategy.shouldPaginate) return processedItems;
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return processedItems.slice(startIndex, endIndex);
  }, [processedItems, currentPage, pageSize, optimizationStrategy.shouldPaginate]);

  // Calculate visible range for virtualization
  const visibleRange = useMemo(() => {
    const displayItems = optimizationStrategy.shouldPaginate ? currentPageItems : processedItems;
    
    if (!optimizationStrategy.shouldVirtualize) {
      return {
        start: 0,
        end: displayItems.length - 1,
        items: displayItems
      };
    }

    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight),
      displayItems.length - 1
    );

    const start = Math.max(0, visibleStart - overscan);
    const end = Math.min(displayItems.length - 1, visibleEnd + overscan);

    return {
      start,
      end,
      items: displayItems.slice(start, end + 1)
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, currentPageItems, processedItems, optimizationStrategy]);

  // Calculate total height and offset
  const { totalHeight, offsetY } = useMemo(() => {
    const displayItems = optimizationStrategy.shouldPaginate ? currentPageItems : processedItems;
    const height = displayItems.length * itemHeight;
    const offset = optimizationStrategy.shouldVirtualize ? visibleRange.start * itemHeight : 0;
    
    return { totalHeight: height, offsetY: offset };
  }, [currentPageItems, processedItems, itemHeight, visibleRange.start, optimizationStrategy]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
  }, []);

  // Handle search
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  // Handle sort
  const handleSort = useCallback((key: keyof T) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  }, []);

  // Handle pagination
  const goToPage = useCallback((page: number) => {
    const totalPages = Math.ceil(processedItems.length / pageSize);
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [processedItems.length, pageSize]);

  // Update memory stats periodically
  useEffect(() => {
    const updateMemoryStats = () => {
      const stats = memoryManager.getMemoryStats();
      setMemoryStats({
        used: stats.totalMemoryUsage,
        total: stats.totalMemoryUsage + 50 // Rough estimate
      });
    };

    updateMemoryStats();
    const interval = setInterval(updateMemoryStats, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, [memoryManager]);

  // Create list optimizer for large datasets
  useEffect(() => {
    if (optimizationStrategy.shouldOptimizeMemory) {
      memoryManager.createListOptimizer(listId, items, pageSize);
    }
  }, [items, listId, pageSize, optimizationStrategy.shouldOptimizeMemory, memoryManager]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      memoryManager.removeListOptimizer(listId);
    };
  }, [listId, memoryManager]);

  const totalPages = Math.ceil(processedItems.length / pageSize);

  return (
    <Card className={className}>
      <CardContent className="p-0">
        {/* Header with search and controls */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">Lista de Dados</h3>
              {optimizationStrategy.shouldOptimizeMemory && (
                <Badge variant="secondary" className="text-xs">
                  <MemoryStick className="h-3 w-3 mr-1" />
                  Otimizada
                </Badge>
              )}
            </div>

            {/* Search */}
            {enableSearch && searchFields.length > 0 && (
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
          </div>

          {/* Memory warning */}
          {optimizationStrategy.shouldShowWarning && (
            <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded mb-4">
              ⚠️ Grande volume de dados ({items.length} itens) com uso de memória elevado ({memoryStats.used}MB)
            </div>
          )}

          {/* Stats and sort controls */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              Mostrando {visibleRange.items.length} de {processedItems.length} registros
              {optimizationStrategy.shouldPaginate && (
                <span className="ml-2">
                  (Página {currentPage} de {totalPages})
                </span>
              )}
            </div>
            
            {enableSort && (
              <div className="flex gap-2">
                {searchFields.map(field => (
                  <Button
                    key={field}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort(field as keyof T)}
                    className="text-xs"
                  >
                    {field}
                    {sortConfig?.key === field ? (
                      sortConfig.direction === 'asc' ? (
                        <ArrowUp className="h-3 w-3 ml-1" />
                      ) : (
                        <ArrowDown className="h-3 w-3 ml-1" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 ml-1 text-gray-400" />
                    )}
                  </Button>
                ))}
              </div>
            )}
            
            {memoryStats.used > 0 && (
              <div className="text-xs">
                Memória: {memoryStats.used}MB
              </div>
            )}
          </div>
        </div>

        {/* Virtual scroll container */}
        <div
          ref={containerRef}
          className="overflow-auto"
          style={{ height: containerHeight }}
          onScroll={handleScroll}
        >
          <div style={{ height: totalHeight, position: 'relative' }}>
            <div
              style={{
                transform: `translateY(${offsetY}px)`,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0
              }}
            >
              {visibleRange.items.map((item, index) => (
                <div
                  key={item.id}
                  style={{ height: itemHeight }}
                  className="flex items-center cursor-pointer hover:bg-gray-50"
                  onClick={() => onItemClick?.(item, visibleRange.start + index)}
                >
                  {renderItem(item, visibleRange.start + index, true)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pagination */}
        {optimizationStrategy.shouldPaginate && totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              
              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Próximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Memory-optimized list component for Service Desk data
 */
export interface ServiceDeskOptimizedListProps<T extends VirtualScrollItem> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  searchFields?: (keyof T)[];
  sortFields?: (keyof T)[];
  itemHeight?: number;
  maxHeight?: number;
  pageSize?: number;
  className?: string;
  onItemClick?: (item: T) => void;
  listId?: string;
  enableAutoOptimization?: boolean;
}

export function ServiceDeskOptimizedList<T extends VirtualScrollItem>({
  items,
  renderItem,
  searchFields = [],
  sortFields = [],
  itemHeight = 80,
  maxHeight = 400,
  pageSize = 50,
  className = '',
  onItemClick,
  listId = 'service-desk-list',
  enableAutoOptimization = true
}: ServiceDeskOptimizedListProps<T>) {
  // Auto-determine optimization settings based on data characteristics
  const config = useMemo((): EnhancedVirtualScrollConfig => {
    const dataSize = items.length;
    const estimatedMemoryUsage = dataSize * 0.001; // Rough estimate: 1KB per item
    
    return {
      itemHeight,
      containerHeight: maxHeight,
      pageSize: dataSize > 1000 ? 25 : dataSize > 500 ? 50 : 100,
      overscan: dataSize > 1000 ? 3 : 5,
      enableMemoryOptimization: enableAutoOptimization && dataSize > 50,
      enablePagination: dataSize > 100,
      enableSearch: searchFields.length > 0,
      enableSort: sortFields.length > 0,
      searchFields: searchFields.map(field => String(field)),
      memoryThreshold: Math.max(100, estimatedMemoryUsage * 2)
    };
  }, [items.length, itemHeight, maxHeight, pageSize, searchFields, sortFields, enableAutoOptimization]);

  return (
    <EnhancedVirtualScroll
      items={items}
      renderItem={renderItem}
      config={config}
      className={className}
      onItemClick={onItemClick}
      listId={listId}
    />
  );
}

/**
 * Hook for managing memory-optimized lists
 */
export const useMemoryOptimizedList = <T extends VirtualScrollItem>(
  items: T[],
  listId: string,
  options?: {
    pageSize?: number;
    enableAutoCleanup?: boolean;
    cleanupInterval?: number;
  }
) => {
  const {
    pageSize = 50,
    enableAutoCleanup = true,
    cleanupInterval = 5 * 60 * 1000 // 5 minutes
  } = options || {};

  const memoryManager = serviceDeskMemoryManager;
  const [memoryStats, setMemoryStats] = useState({ used: 0, recommendations: [] as string[] });

  // Create list optimizer
  useEffect(() => {
    if (items.length > 100) {
      memoryManager.createListOptimizer(listId, items, pageSize);
    }
  }, [items, listId, pageSize, memoryManager]);

  // Auto cleanup
  useEffect(() => {
    if (!enableAutoCleanup) return;

    const cleanup = () => {
      const stats = memoryManager.getMemoryStats();
      if (stats.totalMemoryUsage > 150) {
        memoryManager.forceCleanup();
      }
    };

    const interval = setInterval(cleanup, cleanupInterval);
    return () => clearInterval(interval);
  }, [enableAutoCleanup, cleanupInterval, memoryManager]);

  // Update memory stats
  useEffect(() => {
    const updateStats = () => {
      const stats = memoryManager.getMemoryStats();
      const recommendations = memoryManager.getOptimizationRecommendations();
      
      setMemoryStats({
        used: stats.totalMemoryUsage,
        recommendations
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 10000);
    return () => clearInterval(interval);
  }, [memoryManager]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      memoryManager.removeListOptimizer(listId);
    };
  }, [listId, memoryManager]);

  return {
    memoryStats,
    forceCleanup: () => memoryManager.forceCleanup(),
    clearCache: () => memoryManager.performMemoryCleanup()
  };
};