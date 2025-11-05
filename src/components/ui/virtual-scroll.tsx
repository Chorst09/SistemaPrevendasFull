import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useVirtualScroll, useLargeListOptimization } from '@/lib/utils/memory-optimization';

export interface VirtualScrollProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
}

export function VirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className = '',
  overscan = 5,
  onScroll
}: VirtualScrollProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    handleScroll,
    getVisibleItems,
    getTotalHeight,
    getOffset
  } = useVirtualScroll(items, {
    itemHeight,
    containerHeight,
    overscan
  });

  const handleScrollEvent = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    handleScroll(newScrollTop);
    onScroll?.(newScrollTop);
  }, [handleScroll, onScroll]);

  const { items: visibleItems, startIndex } = getVisibleItems();
  const totalHeight = getTotalHeight();
  const offset = getOffset();

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScrollEvent}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offset}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
              className="flex items-center"
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Specialized virtual scroll for service desk data
export interface ServiceDeskVirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
  maxHeight?: number;
  searchTerm?: string;
  filterFn?: (item: T, searchTerm: string) => boolean;
  className?: string;
}

export function ServiceDeskVirtualList<T>({
  items,
  renderItem,
  itemHeight = 60,
  maxHeight = 400,
  searchTerm = '',
  filterFn,
  className = ''
}: ServiceDeskVirtualListProps<T>) {
  const [filteredItems, setFilteredItems] = useState<T[]>(items);

  // Filter items based on search term
  useEffect(() => {
    if (!searchTerm || !filterFn) {
      setFilteredItems(items);
      return;
    }

    const filtered = items.filter(item => filterFn(item, searchTerm));
    setFilteredItems(filtered);
  }, [items, searchTerm, filterFn]);

  // If items are few, render normally without virtualization
  if (filteredItems.length <= 10) {
    return (
      <div className={`space-y-2 ${className}`} style={{ maxHeight }}>
        {filteredItems.map((item, index) => (
          <div key={index} style={{ minHeight: itemHeight }}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <VirtualScroll
      items={filteredItems}
      itemHeight={itemHeight}
      containerHeight={Math.min(maxHeight, filteredItems.length * itemHeight)}
      renderItem={renderItem}
      className={className}
      overscan={3}
    />
  );
}

// Paginated list component for memory efficiency
export interface PaginatedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  pageSize?: number;
  className?: string;
  showPagination?: boolean;
  searchTerm?: string;
  searchFields?: (keyof T)[];
  sortConfig?: { key: keyof T; direction: 'asc' | 'desc' };
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
}

export function PaginatedList<T>({
  items,
  renderItem,
  pageSize = 50,
  className = '',
  showPagination = true,
  searchTerm = '',
  searchFields = [],
  sortConfig,
  onSort
}: PaginatedListProps<T>) {
  const {
    currentItems,
    paginationInfo,
    search,
    sort,
    goToPage,
    nextPage,
    previousPage
  } = useLargeListOptimization(items, pageSize);

  // Apply search when searchTerm changes
  useEffect(() => {
    if (searchTerm && searchFields.length > 0) {
      search(searchTerm, searchFields);
    }
  }, [searchTerm, searchFields, search]);

  // Apply sort when sortConfig changes
  useEffect(() => {
    if (sortConfig) {
      sort(sortConfig.key, sortConfig.direction);
    }
  }, [sortConfig, sort]);

  // Sort handler for future use
  // const handleSort = (key: keyof T) => {
  //   const newDirection = sortConfig?.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
  //   onSort?.(key, newDirection);
  // };

  return (
    <div className={className}>
      <div className="space-y-2">
        {currentItems.map((item, index) => (
          <div key={index}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {showPagination && paginationInfo.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="text-sm text-gray-600">
            Mostrando {((paginationInfo.currentPage - 1) * paginationInfo.pageSize) + 1} a{' '}
            {Math.min(paginationInfo.currentPage * paginationInfo.pageSize, paginationInfo.totalItems)} de{' '}
            {paginationInfo.totalItems} itens
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={previousPage}
              disabled={!paginationInfo.hasPrevious}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Anterior
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, paginationInfo.totalPages) }, (_, i) => {
                let pageNum;
                if (paginationInfo.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (paginationInfo.currentPage <= 3) {
                  pageNum = i + 1;
                } else if (paginationInfo.currentPage >= paginationInfo.totalPages - 2) {
                  pageNum = paginationInfo.totalPages - 4 + i;
                } else {
                  pageNum = paginationInfo.currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3 py-1 text-sm border rounded ${
                      paginationInfo.currentPage === pageNum
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={nextPage}
              disabled={!paginationInfo.hasNext}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Próximo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Memory-optimized team member list with enhanced virtual scrolling
export interface TeamMemberListProps {
  members: Array<{ id: string; name: string; role: string; salary: number }>;
  onMemberClick?: (member: any) => void;
  searchTerm?: string;
  className?: string;
  enableMemoryOptimization?: boolean;
  pageSize?: number;
}

export function TeamMemberList({
  members,
  onMemberClick,
  searchTerm = '',
  className = '',
  enableMemoryOptimization = true,
  pageSize = 50
}: TeamMemberListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Use memory optimization for large lists
  const shouldOptimize = enableMemoryOptimization && members.length > 100;
  
  // Filter members based on search term
  const filteredMembers = useMemo(() => {
    if (!searchTerm) return members;
    
    return members.filter(member => 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [members, searchTerm]);

  // Paginate for memory efficiency
  const paginatedMembers = useMemo(() => {
    if (!shouldOptimize) return filteredMembers;
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredMembers.slice(startIndex, endIndex);
  }, [filteredMembers, currentPage, pageSize, shouldOptimize]);

  const totalPages = Math.ceil(filteredMembers.length / pageSize);

  const renderMember = useCallback((member: { id: string; name: string; role: string; salary: number }, _index: number) => (
    <div
      key={member.id}
      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onMemberClick?.(member)}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-gray-900">{member.name}</h4>
          <p className="text-sm text-gray-600">{member.role}</p>
        </div>
        <div className="text-right">
          <p className="font-medium text-gray-900">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(member.salary)}
          </p>
        </div>
      </div>
    </div>
  ), [onMemberClick]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const displayMembers = shouldOptimize ? paginatedMembers : filteredMembers;

  return (
    <div className={className}>
      {/* Memory usage indicator for large lists */}
      {shouldOptimize && (
        <div className="mb-2 text-xs text-gray-500">
          Mostrando {displayMembers.length} de {filteredMembers.length} membros 
          (otimização de memória ativa)
        </div>
      )}
      
      <ServiceDeskVirtualList
        items={displayMembers}
        renderItem={renderMember}
        searchTerm=""
        filterFn={() => true} // Already filtered above
        className=""
        itemHeight={80}
        maxHeight={400}
      />
      
      {/* Pagination for memory optimization */}
      {shouldOptimize && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Anterior
            </button>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Próximo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Memory-optimized cost item list with enhanced virtual scrolling
export interface CostItemListProps {
  costs: Array<{ id: string; name: string; category: string; amount: number }>;
  onCostClick?: (cost: any) => void;
  searchTerm?: string;
  className?: string;
  enableMemoryOptimization?: boolean;
  pageSize?: number;
}

export function CostItemList({
  costs,
  onCostClick,
  searchTerm = '',
  className = '',
  enableMemoryOptimization = true,
  pageSize = 50
}: CostItemListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Use memory optimization for large lists
  const shouldOptimize = enableMemoryOptimization && costs.length > 100;
  
  // Filter costs based on search term
  const filteredCosts = useMemo(() => {
    if (!searchTerm) return costs;
    
    return costs.filter(cost => 
      cost.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cost.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [costs, searchTerm]);

  // Paginate for memory efficiency
  const paginatedCosts = useMemo(() => {
    if (!shouldOptimize) return filteredCosts;
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredCosts.slice(startIndex, endIndex);
  }, [filteredCosts, currentPage, pageSize, shouldOptimize]);

  const totalPages = Math.ceil(filteredCosts.length / pageSize);

  const renderCost = useCallback((cost: { id: string; name: string; category: string; amount: number }, _index: number) => (
    <div
      key={cost.id}
      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onCostClick?.(cost)}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium text-gray-900">{cost.name}</h4>
          <p className="text-sm text-gray-600">{cost.category}</p>
        </div>
        <div className="text-right">
          <p className="font-medium text-gray-900">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(cost.amount)}
          </p>
        </div>
      </div>
    </div>
  ), [onCostClick]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const displayCosts = shouldOptimize ? paginatedCosts : filteredCosts;

  return (
    <div className={className}>
      {/* Memory usage indicator for large lists */}
      {shouldOptimize && (
        <div className="mb-2 text-xs text-gray-500">
          Mostrando {displayCosts.length} de {filteredCosts.length} custos 
          (otimização de memória ativa)
        </div>
      )}
      
      <ServiceDeskVirtualList
        items={displayCosts}
        renderItem={renderCost}
        searchTerm=""
        filterFn={() => true} // Already filtered above
        className=""
        itemHeight={80}
        maxHeight={400}
      />
      
      {/* Pagination for memory optimization */}
      {shouldOptimize && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Anterior
            </button>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Próximo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}