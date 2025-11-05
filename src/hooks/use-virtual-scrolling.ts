import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useServiceDeskMemoryOptimization } from './use-memory-optimization';

export interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  enableMemoryOptimization?: boolean;
}

export interface VirtualScrollResult<T> {
  visibleItems: T[];
  startIndex: number;
  endIndex: number;
  totalHeight: number;
  offsetY: number;
  handleScroll: (scrollTop: number) => void;
  scrollToIndex: (index: number) => void;
}

/**
 * Hook for virtual scrolling with memory optimization
 */
export const useVirtualScrolling = <T>(
  items: T[],
  config: VirtualScrollConfig,
  listId: string = 'default'
): VirtualScrollResult<T> => {
  const {
    itemHeight,
    containerHeight,
    overscan = 5,
    enableMemoryOptimization = true
  } = config;

  const [scrollTop, setScrollTop] = useState(0);
  const { createListOptimizer, memoryStats } = useServiceDeskMemoryOptimization(listId);
  const listOptimizerRef = useRef<any>(null);

  // Initialize list optimizer for memory efficiency
  useEffect(() => {
    if (enableMemoryOptimization && items.length > 100) {
      listOptimizerRef.current = createListOptimizer(listId, items, 50);
    }
  }, [items, listId, createListOptimizer, enableMemoryOptimization]);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    const start = Math.max(0, visibleStart - overscan);
    const end = Math.min(items.length - 1, visibleEnd + overscan);

    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // Get visible items
  const visibleItems = useMemo(() => {
    const { start, end } = visibleRange;
    return items.slice(start, end + 1);
  }, [items, visibleRange]);

  // Calculate total height
  const totalHeight = useMemo(() => {
    return items.length * itemHeight;
  }, [items.length, itemHeight]);

  // Calculate offset
  const offsetY = useMemo(() => {
    return visibleRange.start * itemHeight;
  }, [visibleRange.start, itemHeight]);

  // Handle scroll
  const handleScroll = useCallback((newScrollTop: number) => {
    setScrollTop(newScrollTop);
  }, []);

  // Scroll to specific index
  const scrollToIndex = useCallback((index: number) => {
    const targetScrollTop = index * itemHeight;
    setScrollTop(targetScrollTop);
  }, [itemHeight]);

  // Log memory usage for large lists
  useEffect(() => {
    if (items.length > 1000 && memoryStats.totalMemoryUsage > 100) {
      console.warn(`Large virtual list (${items.length} items) with high memory usage (${memoryStats.totalMemoryUsage}MB)`);
    }
  }, [items.length, memoryStats.totalMemoryUsage]);

  return {
    visibleItems,
    startIndex: visibleRange.start,
    endIndex: visibleRange.end,
    totalHeight,
    offsetY,
    handleScroll,
    scrollToIndex
  };
};

/**
 * Hook for paginated virtual scrolling with search and sort
 */
export const usePaginatedVirtualScrolling = <T>(
  items: T[],
  config: VirtualScrollConfig & {
    pageSize?: number;
    searchTerm?: string;
    searchFields?: (keyof T)[];
    sortConfig?: { key: keyof T; direction: 'asc' | 'desc' };
  },
  listId: string = 'paginated'
) => {
  const {
    pageSize = 50,
    searchTerm = '',
    searchFields = [],
    sortConfig,
    ...virtualConfig
  } = config;

  const [currentPage, setCurrentPage] = useState(1);
  const { createListOptimizer } = useServiceDeskMemoryOptimization(listId);
  const listOptimizerRef = useRef<any>(null);

  // Initialize list optimizer
  useEffect(() => {
    if (items.length > 100) {
      listOptimizerRef.current = createListOptimizer(listId, items, pageSize);
    }
  }, [items, listId, pageSize, createListOptimizer]);

  // Filter and sort items
  const processedItems = useMemo(() => {
    let result = [...items];

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

    return result;
  }, [items, searchTerm, searchFields, sortConfig]);

  // Get current page items
  const currentPageItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return processedItems.slice(startIndex, endIndex);
  }, [processedItems, currentPage, pageSize]);

  // Virtual scrolling for current page
  const virtualScrollResult = useVirtualScrolling(currentPageItems, virtualConfig, `${listId}-page`);

  // Pagination info
  const paginationInfo = useMemo(() => {
    const totalPages = Math.ceil(processedItems.length / pageSize);
    return {
      currentPage,
      totalPages,
      totalItems: processedItems.length,
      pageSize,
      hasNext: currentPage < totalPages,
      hasPrevious: currentPage > 1
    };
  }, [processedItems.length, currentPage, pageSize]);

  // Navigation functions
  const goToPage = useCallback((page: number) => {
    const totalPages = Math.ceil(processedItems.length / pageSize);
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [processedItems.length, pageSize]);

  const nextPage = useCallback(() => {
    if (paginationInfo.hasNext) {
      setCurrentPage(prev => prev + 1);
    }
  }, [paginationInfo.hasNext]);

  const previousPage = useCallback(() => {
    if (paginationInfo.hasPrevious) {
      setCurrentPage(prev => prev - 1);
    }
  }, [paginationInfo.hasPrevious]);

  // Reset to first page when search/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig]);

  return {
    ...virtualScrollResult,
    paginationInfo,
    goToPage,
    nextPage,
    previousPage,
    totalFilteredItems: processedItems.length
  };
};

/**
 * Hook for infinite scrolling with memory optimization
 */
export const useInfiniteScrolling = <T>(
  items: T[],
  config: VirtualScrollConfig & {
    loadMoreThreshold?: number;
    onLoadMore?: () => Promise<T[]>;
  },
  listId: string = 'infinite'
) => {
  const { loadMoreThreshold = 10, onLoadMore, ...virtualConfig } = config;
  const [isLoading, setIsLoading] = useState(false);
  const [allItems, setAllItems] = useState<T[]>(items);
  const loadingRef = useRef(false);

  // Update items when prop changes
  useEffect(() => {
    setAllItems(items);
  }, [items]);

  const virtualScrollResult = useVirtualScrolling(allItems, virtualConfig, listId);

  // Check if we need to load more items
  const checkLoadMore = useCallback(async () => {
    if (
      !onLoadMore ||
      loadingRef.current ||
      virtualScrollResult.endIndex < allItems.length - loadMoreThreshold
    ) {
      return;
    }

    loadingRef.current = true;
    setIsLoading(true);

    try {
      const newItems = await onLoadMore();
      setAllItems(prev => [...prev, ...newItems]);
    } catch (error) {
      console.error('Error loading more items:', error);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [onLoadMore, virtualScrollResult.endIndex, allItems.length, loadMoreThreshold]);

  // Check for load more when visible range changes
  useEffect(() => {
    checkLoadMore();
  }, [checkLoadMore]);

  return {
    ...virtualScrollResult,
    isLoading,
    loadMore: checkLoadMore,
    totalItems: allItems.length
  };
};

/**
 * Hook for memory-efficient table virtualization
 */
export const useTableVirtualization = <T>(
  data: T[],
  config: {
    rowHeight: number;
    containerHeight: number;
    columns: Array<{ key: keyof T; width: number }>;
    overscan?: number;
  },
  tableId: string = 'table'
) => {
  const { rowHeight, containerHeight, columns, overscan = 5 } = config;
  const { createListOptimizer, memoryStats } = useServiceDeskMemoryOptimization(tableId);

  const virtualScrollResult = useVirtualScrolling(
    data,
    {
      itemHeight: rowHeight,
      containerHeight,
      overscan,
      enableMemoryOptimization: data.length > 100
    },
    tableId
  );

  // Calculate total table width
  const totalWidth = useMemo(() => {
    return columns.reduce((sum, col) => sum + col.width, 0);
  }, [columns]);

  // Memory usage warning for large tables
  useEffect(() => {
    const totalCells = data.length * columns.length;
    if (totalCells > 10000 && memoryStats.totalMemoryUsage > 150) {
      console.warn(`Large table (${totalCells} cells) with high memory usage (${memoryStats.totalMemoryUsage}MB)`);
    }
  }, [data.length, columns.length, memoryStats.totalMemoryUsage]);

  return {
    ...virtualScrollResult,
    columns,
    totalWidth,
    rowHeight
  };
};