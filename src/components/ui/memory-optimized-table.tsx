import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MemoryStick
} from 'lucide-react';
import { useServiceDeskMemoryOptimization } from '@/hooks/use-memory-optimization';
import { useTableVirtualization } from '@/hooks/use-virtual-scrolling';

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  width: number;
  sortable?: boolean;
  render?: (value: any, item: T, index: number) => React.ReactNode;
}

export interface MemoryOptimizedTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  className?: string;
  pageSize?: number;
  enableVirtualization?: boolean;
  enableMemoryOptimization?: boolean;
  searchFields?: (keyof T)[];
  onRowClick?: (item: T, index: number) => void;
  rowHeight?: number;
  maxHeight?: number;
  tableId?: string;
}

export function MemoryOptimizedTable<T extends Record<string, any>>({
  data,
  columns,
  className = '',
  pageSize = 50,
  enableVirtualization = true,
  enableMemoryOptimization = true,
  searchFields = [],
  onRowClick,
  rowHeight = 60,
  maxHeight = 400,
  tableId = 'table'
}: MemoryOptimizedTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { 
    memoryStats, 
    cacheCalculation, 
    getCachedCalculation,
    createListOptimizer 
  } = useServiceDeskMemoryOptimization(tableId);

  // Determine if we should use memory optimization
  const shouldOptimize = enableMemoryOptimization && data.length > 100;
  const shouldVirtualize = enableVirtualization && data.length > 200;

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm || searchFields.length === 0) return data;

    const cacheKey = `filtered-${tableId}-${searchTerm}-${searchFields.join(',')}`;
    const cached = getCachedCalculation(cacheKey);
    if (cached) return cached;

    const filtered = data.filter(item =>
      searchFields.some(field =>
        String(item[field]).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    cacheCalculation(cacheKey, filtered);
    return filtered;
  }, [data, searchTerm, searchFields, tableId, getCachedCalculation, cacheCalculation]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    const cacheKey = `sorted-${tableId}-${sortConfig.key.toString()}-${sortConfig.direction}`;
    const cached = getCachedCalculation(cacheKey);
    if (cached) return cached;

    const sorted = [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    cacheCalculation(cacheKey, sorted);
    return sorted;
  }, [filteredData, sortConfig, tableId, getCachedCalculation, cacheCalculation]);

  // Paginate data for memory efficiency
  const paginatedData = useMemo(() => {
    if (!shouldOptimize) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize, shouldOptimize]);

  // Use virtual scrolling for large datasets
  const virtualScrollResult = useTableVirtualization(
    shouldVirtualize ? paginatedData : [],
    {
      rowHeight,
      containerHeight: maxHeight,
      columns: columns.map(col => ({ key: col.key, width: col.width }))
    },
    `${tableId}-virtual`
  );

  const displayData = shouldVirtualize ? virtualScrollResult.visibleItems : paginatedData;
  const totalPages = Math.ceil(sortedData.length / pageSize);

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
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  // Memory usage warning
  const memoryWarning = useMemo(() => {
    const totalCells = data.length * columns.length;
    if (totalCells > 10000 && memoryStats.totalMemoryUsage > 150) {
      return `Large table (${totalCells} cells) with high memory usage (${memoryStats.totalMemoryUsage}MB)`;
    }
    return null;
  }, [data.length, columns.length, memoryStats.totalMemoryUsage]);

  // Create list optimizer for very large datasets
  useEffect(() => {
    if (data.length > 1000) {
      createListOptimizer(`${tableId}-data`, data, pageSize);
    }
  }, [data, tableId, pageSize, createListOptimizer]);

  // Render table header
  const renderHeader = () => (
    <thead className="bg-gray-50">
      <tr>
        {columns.map((column) => (
          <th
            key={column.key.toString()}
            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
            style={{ width: column.width }}
            onClick={() => column.sortable !== false && handleSort(column.key)}
          >
            <div className="flex items-center gap-2">
              <span>{column.label}</span>
              {column.sortable !== false && (
                <div className="flex flex-col">
                  {sortConfig?.key === column.key ? (
                    sortConfig.direction === 'asc' ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )
                  ) : (
                    <ArrowUpDown className="h-3 w-3 text-gray-400" />
                  )}
                </div>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );

  // Render table row
  const renderRow = useCallback((item: T, index: number) => (
    <tr
      key={index}
      className="hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onRowClick?.(item, index)}
      style={{ height: rowHeight }}
    >
      {columns.map((column) => (
        <td
          key={column.key.toString()}
          className="px-4 py-3 whitespace-nowrap text-sm text-gray-900"
          style={{ width: column.width }}
        >
          {column.render 
            ? column.render(item[column.key], item, index)
            : String(item[column.key] || '')
          }
        </td>
      ))}
    </tr>
  ), [columns, onRowClick, rowHeight]);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Tabela de Dados
            {shouldOptimize && (
              <Badge variant="secondary" className="text-xs">
                <MemoryStick className="h-3 w-3 mr-1" />
                Otimizada
              </Badge>
            )}
          </CardTitle>
          
          {/* Search */}
          {searchFields.length > 0 && (
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
        {memoryWarning && (
          <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
            ⚠️ {memoryWarning}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            Mostrando {displayData.length} de {sortedData.length} registros
            {shouldOptimize && (
              <span className="ml-2">
                (Página {currentPage} de {totalPages})
              </span>
            )}
          </div>
          
          {memoryStats.totalMemoryUsage > 0 && (
            <div>
              Uso de memória: {memoryStats.totalMemoryUsage}MB
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Table */}
        <div className="overflow-hidden">
          {shouldVirtualize ? (
            <div 
              className="overflow-auto"
              style={{ height: maxHeight }}
              onScroll={(e) => virtualScrollResult.handleScroll(e.currentTarget.scrollTop)}
            >
              <table className="min-w-full divide-y divide-gray-200">
                {renderHeader()}
                <tbody 
                  className="bg-white divide-y divide-gray-200"
                  style={{ height: virtualScrollResult.totalHeight }}
                >
                  <tr style={{ height: virtualScrollResult.offsetY }}>
                    <td colSpan={columns.length}></td>
                  </tr>
                  {displayData.map((item, index) => 
                    renderRow(item, virtualScrollResult.startIndex + index)
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-auto" style={{ maxHeight }}>
              <table className="min-w-full divide-y divide-gray-200">
                {renderHeader()}
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayData.map((item, index) => renderRow(item, index))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {shouldOptimize && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
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

// Specialized table for Service Desk data
export interface ServiceDeskDataTableProps {
  data: Array<{
    id: string;
    name: string;
    type: string;
    value: number;
    status: string;
    lastModified: Date;
  }>;
  onRowClick?: (item: any) => void;
  className?: string;
}

export function ServiceDeskDataTable({
  data,
  onRowClick,
  className = ''
}: ServiceDeskDataTableProps) {
  const columns: TableColumn<any>[] = [
    {
      key: 'name',
      label: 'Nome',
      width: 200,
      sortable: true
    },
    {
      key: 'type',
      label: 'Tipo',
      width: 120,
      sortable: true,
      render: (value) => (
        <Badge variant="secondary">{value}</Badge>
      )
    },
    {
      key: 'value',
      label: 'Valor',
      width: 150,
      sortable: true,
      render: (value) => (
        <span className="font-medium">
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(value)}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      width: 100,
      sortable: true,
      render: (value) => (
        <Badge 
          variant={value === 'active' ? 'default' : 'secondary'}
        >
          {value === 'active' ? 'Ativo' : 'Inativo'}
        </Badge>
      )
    },
    {
      key: 'lastModified',
      label: 'Última Modificação',
      width: 180,
      sortable: true,
      render: (value: Date) => (
        <span className="text-sm text-gray-600">
          {value.toLocaleDateString('pt-BR')}
        </span>
      )
    }
  ];

  return (
    <MemoryOptimizedTable
      data={data}
      columns={columns}
      className={className}
      pageSize={25}
      enableVirtualization={data.length > 100}
      enableMemoryOptimization={data.length > 50}
      searchFields={['name', 'type', 'status']}
      onRowClick={onRowClick}
      rowHeight={60}
      maxHeight={500}
      tableId="service-desk-data"
    />
  );
}