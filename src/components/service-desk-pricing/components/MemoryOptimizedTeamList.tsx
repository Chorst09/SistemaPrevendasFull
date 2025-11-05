import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  DollarSign, 
  Clock, 
  User,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { TeamMember } from '@/lib/types/service-desk-pricing';
import { useServiceDeskMemoryOptimization } from '@/hooks/use-memory-optimization';
import { usePaginatedVirtualScrolling } from '@/hooks/use-virtual-scrolling';

interface MemoryOptimizedTeamListProps {
  team: TeamMember[];
  onEdit: (member: TeamMember) => void;
  onDelete: (memberId: string) => void;
  onMemberClick?: (member: TeamMember) => void;
  className?: string;
  enableVirtualization?: boolean;
  pageSize?: number;
}

export function MemoryOptimizedTeamList({
  team,
  onEdit,
  onDelete,
  onMemberClick,
  className = '',
  enableVirtualization = true,
  pageSize = 20
}: MemoryOptimizedTeamListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof TeamMember; direction: 'asc' | 'desc' } | undefined>(undefined);
  
  const { memoryStats, cacheCalculation, getCachedCalculation } = useServiceDeskMemoryOptimization('team-list');

  // Use virtual scrolling for large teams
  const virtualScrollResult = usePaginatedVirtualScrolling(
    team,
    {
      itemHeight: 120,
      containerHeight: 400,
      pageSize,
      searchTerm,
      searchFields: ['name', 'role'],
      sortConfig,
      enableMemoryOptimization: team.length > 50
    },
    'team-list-virtual'
  );

  // Automatic cleanup of unused team member data
  useEffect(() => {
    const cleanup = () => {
      // Clear cached calculations for team members not currently visible
      const visibleIds = new Set(virtualScrollResult.visibleItems.map(member => member.id));
      
      // This would be handled by the memory manager automatically
      console.log(`Team list cleanup: ${team.length - visibleIds.size} members not visible`);
    };

    // Register cleanup
    const timeoutId = setTimeout(cleanup, 30000); // Cleanup after 30 seconds of inactivity
    
    return () => clearTimeout(timeoutId);
  }, [virtualScrollResult.visibleItems, team.length]);

  // Memoized team member cost calculation
  const calculateMemberCost = useCallback((member: TeamMember): number => {
    const cacheKey = `member-cost-${member.id}-${member.salary}-${member.workload}`;
    
    // Check cache first
    const cached = getCachedCalculation(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    // Calculate cost
    const monthlyHours = member.workload * 4.33;
    const benefitsTotal = Object.values(member.benefits).reduce((sum, benefit) => {
      if (typeof benefit === 'number') return sum + benefit;
      if (Array.isArray(benefit)) {
        return sum + benefit.reduce((benefitSum, b) => benefitSum + (b.value || 0), 0);
      }
      return sum;
    }, 0);
    
    const totalMonthlyCost = member.salary + benefitsTotal;
    const costPerHour = monthlyHours > 0 ? totalMonthlyCost / monthlyHours : 0;
    
    // Cache the result
    cacheCalculation(cacheKey, costPerHour);
    
    return costPerHour;
  }, [getCachedCalculation, cacheCalculation]);

  // Render team member item
  const renderTeamMember = useCallback((member: TeamMember, index: number) => {
    const costPerHour = calculateMemberCost(member);
    
    return (
      <Card 
        key={member.id} 
        className="hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => onMemberClick?.(member)}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-gray-500" />
                <h4 className="font-medium text-gray-900">{member.name}</h4>
                <Badge variant="secondary" className="text-xs">
                  {member.role}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(member.salary)}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{member.workload}h/semana</span>
                </div>
                
                <div className="col-span-2">
                  <span className="text-xs text-gray-500">
                    Custo/hora: {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(costPerHour)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(member);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(member.id);
                }}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }, [calculateMemberCost, onEdit, onDelete, onMemberClick]);

  // Handle search
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // Handle sort
  const handleSort = useCallback((key: keyof TeamMember) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Memory usage warning
  const memoryWarning = useMemo(() => {
    if (team.length > 500 && memoryStats.totalMemoryUsage > 100) {
      return `Large team (${team.length} members) with high memory usage (${memoryStats.totalMemoryUsage}MB)`;
    }
    return null;
  }, [team.length, memoryStats.totalMemoryUsage]);

  // Decide whether to use virtual scrolling or pagination
  const shouldUseVirtualScrolling = enableVirtualization && team.length > 100;

  return (
    <div className={className}>
      {/* Search and controls */}
      <div className="mb-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou cargo..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('name')}
              className={sortConfig?.key === 'name' ? 'bg-blue-50' : ''}
            >
              Nome {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('salary')}
              className={sortConfig?.key === 'salary' ? 'bg-blue-50' : ''}
            >
              Salário {sortConfig?.key === 'salary' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </Button>
          </div>
        </div>

        {/* Memory warning */}
        {memoryWarning && (
          <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
            ⚠️ {memoryWarning}
          </div>
        )}

        {/* Stats */}
        <div className="text-sm text-gray-500">
          Mostrando {virtualScrollResult.visibleItems.length} de {virtualScrollResult.totalFilteredItems} membros
          {memoryStats.totalMemoryUsage > 0 && (
            <span className="ml-4">
              Uso de memória: {memoryStats.totalMemoryUsage}MB
            </span>
          )}
        </div>
      </div>

      {/* Team list */}
      {shouldUseVirtualScrolling ? (
        <div className="space-y-2" style={{ height: 400 }}>
          <div 
            className="overflow-auto"
            style={{ height: virtualScrollResult.totalHeight }}
            onScroll={(e) => virtualScrollResult.handleScroll(e.currentTarget.scrollTop)}
          >
            <div
              style={{
                transform: `translateY(${virtualScrollResult.offsetY}px)`,
                position: 'relative'
              }}
            >
              {virtualScrollResult.visibleItems.map((member, index) => (
                <div key={member.id} style={{ height: 120 }}>
                  {renderTeamMember(member, virtualScrollResult.startIndex + index)}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {virtualScrollResult.visibleItems.map((member, index) => 
            renderTeamMember(member, index)
          )}
        </div>
      )}

      {/* Pagination */}
      {virtualScrollResult.paginationInfo.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="text-sm text-gray-600">
            Página {virtualScrollResult.paginationInfo.currentPage} de {virtualScrollResult.paginationInfo.totalPages}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={virtualScrollResult.previousPage}
              disabled={!virtualScrollResult.paginationInfo.hasPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={virtualScrollResult.nextPage}
              disabled={!virtualScrollResult.paginationInfo.hasNext}
            >
              Próximo
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Lightweight team member summary for memory efficiency
export function TeamMemberSummary({ 
  team, 
  className = '' 
}: { 
  team: TeamMember[]; 
  className?: string; 
}) {
  const { cacheCalculation, getCachedCalculation } = useServiceDeskMemoryOptimization('team-summary');

  const summary = useMemo(() => {
    const cacheKey = `team-summary-${team.length}-${team.map(m => m.id).join(',')}`;
    
    // Check cache first
    const cached = getCachedCalculation(cacheKey);
    if (cached) return cached;

    const totalMembers = team.length;
    const totalSalary = team.reduce((sum, member) => sum + member.salary, 0);
    const avgSalary = totalMembers > 0 ? totalSalary / totalMembers : 0;
    const totalWorkload = team.reduce((sum, member) => sum + member.workload, 0);
    
    const roleDistribution = team.reduce((acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const result = {
      totalMembers,
      totalSalary,
      avgSalary,
      totalWorkload,
      roleDistribution
    };

    // Cache the result
    cacheCalculation(cacheKey, result);
    
    return result;
  }, [team, getCachedCalculation, cacheCalculation]);

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{summary.totalMembers}</div>
          <div className="text-sm text-gray-600">Membros</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              notation: 'compact'
            }).format(summary.totalSalary)}
          </div>
          <div className="text-sm text-gray-600">Salários Totais</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(summary.avgSalary)}
          </div>
          <div className="text-sm text-gray-600">Salário Médio</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{summary.totalWorkload}h</div>
          <div className="text-sm text-gray-600">Carga Horária Total</div>
        </CardContent>
      </Card>
    </div>
  );
}