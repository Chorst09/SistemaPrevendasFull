'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { serviceDeskMemoryManager } from '@/lib/utils/memory-optimization';

// Types
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  startIndex: number;
  endIndex: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface EnhancedPaginationConfig {
  pageSize: number;
  pageSizeOptions: number[];
  showPageSizeSelector: boolean;
  showJumpToPage: boolean;
  showMemoryStats: boolean;
  enableMemoryOptimization: boolean;
  maxPagesInMemory: number;
  preloadPages: number;
}

export interface EnhancedPaginationProps<T> {
  items: T[];
  config: EnhancedPaginationConfig;
  onPageChange: (page: number, items: T[]) => void;
  onPageSizeChange?: (pageSize: number) => void;
  className?: string;
  listId?: string;
}

/**
 * Enhanced pagination component with memory optimization
 */
export function EnhancedPagination<T>({
  items,
  config,
  onPageChange,
  onPageSizeChange,
  className = '',
  listId = 'enhanced-pagination'
}: EnhancedPaginationProps<T>) {
  const safeItems = items || [];
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(config.pageSize);
  
  // Calculate pagination info
  const paginationInfo = useMemo((): PaginationInfo => {
    const totalPages = Math.ceil(safeItems.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, safeItems.length);

    return {
      currentPage,
      totalPages,
      totalItems: safeItems.length,
      pageSize,
      startIndex,
      endIndex,
      hasNext: currentPage < totalPages,
      hasPrevious: currentPage > 1
    };
  }, [safeItems.length, currentPage, pageSize]);

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="text-sm text-gray-700">
        Mostrando {paginationInfo.startIndex + 1} a {paginationInfo.endIndex} de {paginationInfo.totalItems} resultados
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(1)}
          disabled={!paginationInfo.hasPrevious}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={!paginationInfo.hasPrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm">
          Página {paginationInfo.currentPage} de {paginationInfo.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={!paginationInfo.hasNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(paginationInfo.totalPages)}
          disabled={!paginationInfo.hasNext}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
/**
 *
 Hook for managing enhanced pagination
 */
export const useEnhancedPagination = <T,>(
  items: T[],
  initialConfig: Partial<EnhancedPaginationConfig> = {}
) => {
  const [currentPageItems, setCurrentPageItems] = useState<T[]>([]);
  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 50,
    startIndex: 0,
    endIndex: 0,
    hasNext: false,
    hasPrevious: false
  });

  const safeItems = items || [];
  
  const config: EnhancedPaginationConfig = {
    pageSize: 50,
    pageSizeOptions: [25, 50, 100, 200],
    showPageSizeSelector: true,
    showJumpToPage: true,
    showMemoryStats: true,
    enableMemoryOptimization: safeItems.length > 100,
    maxPagesInMemory: 10,
    preloadPages: 2,
    ...initialConfig
  };

  const handlePageChange = useCallback((page: number) => {
    const totalPages = Math.ceil(safeItems.length / config.pageSize);
    const startIndex = (page - 1) * config.pageSize;
    const endIndex = Math.min(startIndex + config.pageSize, safeItems.length);
    const pageItems = safeItems.slice(startIndex, endIndex);

    setCurrentPageItems(pageItems);
    setPaginationInfo({
      currentPage: page,
      totalPages,
      totalItems: safeItems.length,
      pageSize: config.pageSize,
      startIndex,
      endIndex,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    });
  }, [safeItems, config.pageSize]);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    const newConfig = { ...config, pageSize: newPageSize };
    handlePageChange(1);
  }, [config, handlePageChange]);

  // Initialize with first page
  useEffect(() => {
    if (safeItems.length > 0) {
      handlePageChange(1);
    }
  }, [safeItems.length, handlePageChange]);

  return {
    currentPageItems,
    paginationInfo,
    config,
    handlePageChange,
    handlePageSizeChange
  };
};

// Simple pagination component
export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  showFirstLast = true
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showFirstLast?: boolean;
}) {
  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {showFirstLast && currentPage > 1 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {visiblePages.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      {showFirstLast && currentPage < totalPages && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}