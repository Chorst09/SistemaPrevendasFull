'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Users, 
  DollarSign, 
  Clock, 
  AlertCircle, 
  CheckCircle2,
  Download,
  Upload,
  Copy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  TeamMember, 
  BenefitPackage, 
  CustomBenefit, 
  TabValidationStatus,
  TeamCostCalculation,
  WorkSchedule
} from '@/lib/types/service-desk-pricing';
import { ServiceDeskVirtualList, PaginatedList, TeamMemberList } from '@/components/ui/virtual-scroll';
import { MemoryOptimizedTable } from '@/components/ui/memory-optimized-table';
import { EnhancedVirtualScroll, ServiceDeskOptimizedList } from '@/components/ui/enhanced-virtual-scroll';
import { EnhancedPagination, useEnhancedPagination as useEnhancedPaginationHook } from '@/components/ui/enhanced-pagination';
import { useMemoryCleanup, usePagination } from '@/lib/utils/memory-optimization';
import { useDebouncedCalculations } from '@/lib/utils/debounce';
import { useTabMemoryOptimization, useLargeDatasetOptimization, useCalculationCache, useServiceDeskMemoryOptimization } from '@/hooks/use-memory-optimization';
import { usePaginatedVirtualScrolling } from '@/hooks/use-virtual-scrolling';
import { useComprehensiveMemoryOptimization } from '@/hooks/use-comprehensive-memory-optimization';
import { useAutomaticDataCleanup } from '@/lib/services/automatic-data-cleanup';
import { EmployeeRegistryManager } from '../employees/EmployeeRegistryManager';
import { EmployeeRegistryService, EmployeeProfile } from '@/lib/services/employee-registry-service';

export interface TeamTabModuleProps {
  team: TeamMember[];
  onTeamUpdate: (team: TeamMember[]) => void;
  costCalculations?: TeamCostCalculation;
  schedules?: WorkSchedule[];
  validation?: TabValidationStatus;
  isLoading?: boolean;
  onAutoSave?: (team: TeamMember[]) => void;
}

interface TeamMemberFormData extends Omit<TeamMember, 'id' | 'costPerHour'> {
  id?: string;
}

const defaultBenefits: BenefitPackage = {
  healthInsurance: 0,
  mealVoucher: 0,
  transportVoucher: 0,
  lifeInsurance: 0,
  vacation: 8.33, // 1/12 of salary
  thirteenthSalary: 8.33, // 1/12 of salary
  fgts: 8, // 8% of salary
  inss: 11, // Average INSS rate
  otherBenefits: []
};

const commonRoles = [
  'Analista de Service Desk N1',
  'Analista de Service Desk N2',
  'Analista de Service Desk N3',
  'Coordenador de Service Desk',
  'Supervisor de Service Desk',
  'Gerente de Service Desk',
  'Técnico de Suporte',
  'Especialista em Infraestrutura',
  'Analista de Sistemas',
  'DBA',
  'Arquiteto de Soluções'
];

// Salary templates by role
const salaryTemplates: Record<string, { salary: number; benefits: Partial<BenefitPackage> }> = {
  'Analista de Service Desk N1': {
    salary: 3500,
    benefits: {
      healthInsurance: 200,
      mealVoucher: 600,
      transportVoucher: 220,
      lifeInsurance: 50
    }
  },
  'Analista de Service Desk N2': {
    salary: 5000,
    benefits: {
      healthInsurance: 250,
      mealVoucher: 600,
      transportVoucher: 220,
      lifeInsurance: 75
    }
  },
  'Analista de Service Desk N3': {
    salary: 7000,
    benefits: {
      healthInsurance: 300,
      mealVoucher: 600,
      transportVoucher: 220,
      lifeInsurance: 100
    }
  },
  'Coordenador de Service Desk': {
    salary: 9000,
    benefits: {
      healthInsurance: 400,
      mealVoucher: 600,
      transportVoucher: 220,
      lifeInsurance: 150
    }
  },
  'Supervisor de Service Desk': {
    salary: 8000,
    benefits: {
      healthInsurance: 350,
      mealVoucher: 600,
      transportVoucher: 220,
      lifeInsurance: 125
    }
  },
  'Gerente de Service Desk': {
    salary: 12000,
    benefits: {
      healthInsurance: 500,
      mealVoucher: 600,
      transportVoucher: 220,
      lifeInsurance: 200
    }
  }
};

export function TeamTabModule({
  team,
  onTeamUpdate,
  costCalculations,
  schedules = [],
  validation,
  isLoading = false,
  onAutoSave
}: TeamTabModuleProps) {
  const [localTeam, setLocalTeam] = useState<TeamMember[]>(team || []);
  const [hasChanges, setHasChanges] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showEmployeeRegistry, setShowEmployeeRegistry] = useState(false);
  const [memberForm, setMemberForm] = useState<TeamMemberFormData>({
    name: '',
    role: '',
    salary: 0,
    benefits: { ...defaultBenefits },
    workload: 40,
    startDate: new Date(),
    skills: [],
    certifications: []
  });

  // Enhanced memory optimization
  const comprehensiveMemoryOptimization = useComprehensiveMemoryOptimization(localTeam || [], {
    tabId: 'team',
    enableAutoCleanup: true,
    enableVirtualization: (localTeam?.length || 0) > 100,
    enablePagination: (localTeam?.length || 0) > 50,
    pageSize: 25,
    maxMemoryUsage: 200,
    cleanupInterval: 3 * 60 * 1000, // 3 minutes
    cacheSize: 100
  });

  // Automatic data cleanup
  const automaticCleanup = useAutomaticDataCleanup(
    'team-tab',
    useCallback(() => {
      // Cleanup team member data that hasn't been accessed recently
      setLocalTeam(prev => prev.slice(0, 500)); // Keep only first 500 members if too many
    }, [])
  );

  // Enhanced pagination for better memory management
  // Temporarily disabled due to type issues
  // const enhancedPagination = useEnhancedPaginationHook<TeamMember>(localTeam || [], {
  //   pageSize: 25,
  //   pageSizeOptions: [10, 25, 50, 100],
  //   showPageSizeSelector: true,
  //   showJumpToPage: (localTeam?.length || 0) > 250,
  //   showMemoryStats: true,
  //   enableMemoryOptimization: (localTeam?.length || 0) > 50,
  //   maxPagesInMemory: 5,
  //   preloadPages: 1
  // });

  // Legacy hooks for backward compatibility
  const { setTabActive, cacheData, getCachedData } = useTabMemoryOptimization('team');
  const { getCachedResult, setCachedResult } = useCalculationCache('team-calculations');

  // Debounced calculations for performance
  const debouncedCalculations = useDebouncedCalculations();

  // Memory cleanup for team data
  useMemoryCleanup('team-tab-data', useCallback(() => {
    // Cleanup large objects when component unmounts
    setLocalTeam([]);
    setMemberForm({
      name: '',
      role: '',
      salary: 0,
      benefits: { ...defaultBenefits },
      workload: 40,
      startDate: new Date(),
      skills: [],
      certifications: []
    });
  }, []));

  // Mark tab as active when component mounts
  useEffect(() => {
    setTabActive(true);
    automaticCleanup.trackAccess(); // Track tab access for cleanup
    
    // Try to load cached data first
    const cached = getCachedData();
    if (cached && cached.length > 0) {
      setLocalTeam(cached);
    }

    return () => {
      setTabActive(false);
      // Cache current data before unmounting
      cacheData(localTeam);
    };
  }, [setTabActive, getCachedData, cacheData, localTeam, automaticCleanup]);

  // Memory optimization monitoring
  useEffect(() => {
    if (comprehensiveMemoryOptimization.memoryStats.used > 150) {
      const recommendations = comprehensiveMemoryOptimization.memoryStats.recommendations;
      if (recommendations.length > 0) {
        console.warn('Memory optimization recommendations:', recommendations);
      }
    }
  }, [comprehensiveMemoryOptimization.memoryStats]);

  // Auto cleanup when team gets too large
  useEffect(() => {
    if ((localTeam?.length || 0) > 1000) {
      console.warn('Very large team detected. Consider implementing server-side pagination.');
      // Force cleanup of old cached data
      comprehensiveMemoryOptimization.forceCleanup();
    }
  }, [localTeam?.length, comprehensiveMemoryOptimization]);

  // Auto-save functionality with debouncing
  useEffect(() => {
    if (hasChanges && onAutoSave) {
      const timeoutId = setTimeout(() => {
        onAutoSave?.(localTeam || []);
        setHasChanges(false);
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [localTeam, hasChanges, onAutoSave]);

  // Update local team when prop changes
  useEffect(() => {
    setLocalTeam(team || []);
    setHasChanges(false);
  }, [team]);

  const handleSave = useCallback(() => {
    onTeamUpdate(localTeam || []);
    setHasChanges(false);
  }, [localTeam, onTeamUpdate]);

  const calculateMemberCostPerHour = useCallback((member: TeamMember): number => {
    // Create cache key based on member data
    const cacheKey = `${member.id}-${member.salary}-${member.workload}-${JSON.stringify(member.benefits)}`;
    
    // Check cache first
    const cached = getCachedResult(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    const monthlyHours = member.workload * 4.33; // weeks to month
    if (monthlyHours === 0) return 0;
    
    const benefits = calculateMemberBenefits(member);
    const totalMonthlyCost = member.salary + benefits;
    const costPerHour = totalMonthlyCost / monthlyHours;
    
    // Cache the result
    setCachedResult(cacheKey, costPerHour);
    
    return costPerHour;
  }, [getCachedResult, setCachedResult]);

  // Debounced calculation for team costs
  const calculateTeamCostsDebounced = useCallback((teamData: TeamMember[]) => {
    debouncedCalculations.calculateTeamCosts(teamData, (result) => {
      // Update cost calculations when ready
      console.log('Team costs calculated:', result);
    });
  }, [debouncedCalculations]);

  const calculateMemberBenefits = useCallback((member: TeamMember): number => {
    const benefits = member.benefits;
    let totalBenefits = 0;

    // Fixed benefits
    totalBenefits += benefits.healthInsurance || 0;
    totalBenefits += benefits.mealVoucher || 0;
    totalBenefits += benefits.transportVoucher || 0;
    totalBenefits += benefits.lifeInsurance || 0;

    // Percentage-based benefits
    totalBenefits += member.salary * (benefits.vacation / 100 || 0);
    totalBenefits += member.salary * (benefits.thirteenthSalary / 100 || 0);
    totalBenefits += member.salary * (benefits.fgts / 100 || 0);
    totalBenefits += member.salary * (benefits.inss / 100 || 0);

    // Custom benefits
    benefits.otherBenefits?.forEach(benefit => {
      if (benefit.type === 'fixed') {
        totalBenefits += benefit.value;
      } else {
        totalBenefits += member.salary * (benefit.value / 100);
      }
    });

    return totalBenefits;
  }, []);

  const resetMemberForm = useCallback(() => {
    setMemberForm({
      name: '',
      role: '',
      salary: 0,
      benefits: { ...defaultBenefits },
      workload: 40,
      startDate: new Date(),
      skills: [],
      certifications: []
    });
  }, []);

  const handleAddMember = useCallback(() => {
    const newMember: TeamMember = {
      ...memberForm,
      id: `member-${Date.now()}`,
      costPerHour: 0 // Will be calculated
    };
    
    newMember.costPerHour = calculateMemberCostPerHour(newMember);
    
    const updatedTeam = [...(localTeam || []), newMember];
    setLocalTeam(updatedTeam);
    setHasChanges(true);
    setIsAddingMember(false);
    resetMemberForm();
  }, [memberForm, localTeam, calculateMemberCostPerHour, resetMemberForm]);

  const handleEditMember = useCallback((member: TeamMember) => {
    setEditingMember(member);
    setMemberForm({ ...member });
  }, []);

  const handleUpdateMember = useCallback(() => {
    if (!editingMember) return;
    
    const updatedMember: TeamMember = {
      ...memberForm,
      id: editingMember.id,
      costPerHour: 0 // Will be calculated
    };
    
    updatedMember.costPerHour = calculateMemberCostPerHour(updatedMember);
    
    const updatedTeam = (localTeam || []).map(member => 
      member.id === editingMember.id ? updatedMember : member
    );
    
    setLocalTeam(updatedTeam);
    setHasChanges(true);
    setEditingMember(null);
    resetMemberForm();
  }, [editingMember, memberForm, localTeam, calculateMemberCostPerHour, resetMemberForm]);

  const handleRemoveMember = useCallback((memberId: string) => {
    const updatedTeam = (localTeam || []).filter(member => member.id !== memberId);
    setLocalTeam(updatedTeam);
    setHasChanges(true);
  }, [localTeam]);

  const handleDuplicateMember = useCallback((member: TeamMember) => {
    const duplicatedMember: TeamMember = {
      ...member,
      id: `member-${Date.now()}`,
      name: `${member.name} (Cópia)`
    };
    
    const updatedTeam = [...(localTeam || []), duplicatedMember];
    setLocalTeam(updatedTeam);
    setHasChanges(true);
  }, [localTeam]);

  const handleSelectFromRegistry = useCallback((employee: EmployeeProfile) => {
    const employeeService = EmployeeRegistryService.getInstance();
    const teamMember = employeeService.convertToTeamMember(employee);
    
    // Calculate cost per hour
    teamMember.costPerHour = calculateMemberCostPerHour(teamMember);
    
    const updatedTeam = [...(localTeam || []), teamMember];
    setLocalTeam(updatedTeam);
    setHasChanges(true);
    setShowEmployeeRegistry(false);
  }, [localTeam, calculateMemberCostPerHour]);

  const handleFormFieldChange = useCallback((field: string, value: any) => {
    setMemberForm(prev => {
      const newForm = { ...prev };
      const fieldPath = field.split('.');
      
      let current: any = newForm;
      for (let i = 0; i < fieldPath.length - 1; i++) {
        if (!current[fieldPath[i]]) {
          current[fieldPath[i]] = {};
        }
        current = current[fieldPath[i]];
      }
      
      current[fieldPath[fieldPath.length - 1]] = value;
      return newForm;
    });
  }, []);

  const addCustomBenefit = useCallback(() => {
    const newBenefit: CustomBenefit = {
      name: '',
      value: 0,
      type: 'fixed'
    };
    
    setMemberForm(prev => ({
      ...prev,
      benefits: {
        ...prev.benefits,
        otherBenefits: [...(prev.benefits.otherBenefits || []), newBenefit]
      }
    }));
  }, []);

  const removeCustomBenefit = useCallback((index: number) => {
    setMemberForm(prev => ({
      ...prev,
      benefits: {
        ...prev.benefits,
        otherBenefits: prev.benefits.otherBenefits?.filter((_, i) => i !== index) || []
      }
    }));
  }, []);

  // Advanced functionality methods
  const applyRoleTemplate = useCallback((role: string) => {
    const template = salaryTemplates[role];
    if (template) {
      setMemberForm(prev => ({
        ...prev,
        salary: template.salary,
        benefits: {
          ...prev.benefits,
          ...template.benefits
        }
      }));
    }
  }, []);

  const validateWorkload = useCallback((workload: number): string[] => {
    const warnings: string[] = [];
    
    if (workload > 44) {
      warnings.push('Carga horária acima do limite legal (44h/semana)');
    }
    if (workload < 20) {
      warnings.push('Carga horária muito baixa pode impactar a produtividade');
    }
    if (workload > 60) {
      warnings.push('Carga horária excessiva pode causar burnout');
    }
    
    return warnings;
  }, []);

  const exportTeamData = useCallback(() => {
    const dataToExport = {
      team: localTeam,
      exportDate: new Date().toISOString(),
      totalMembers: localTeam?.length || 0,
      totalMonthlyCost: costCalculations?.totalMonthlyCost || 0,
      totalAnnualCost: costCalculations?.totalAnnualCost || 0
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `equipe-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [localTeam, costCalculations]);

  const importTeamData = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (importedData.team && Array.isArray(importedData.team)) {
          // Validate and sanitize imported data
          const validatedTeam = importedData.team.map((member: any) => ({
            ...member,
            id: `member-${Date.now()}-${Math.random()}`, // Generate new IDs
            costPerHour: calculateMemberCostPerHour(member)
          }));
          
          setLocalTeam(validatedTeam);
          setHasChanges(true);
        }
      } catch (error) {
        console.error('Error importing team data:', error);
        // Could show a toast notification here
      }
    };
    reader.readAsText(file);
  }, [calculateMemberCostPerHour]);

  const importFromPreviousProject = useCallback(() => {
    // This would typically fetch from a database or API
    // For now, we'll simulate with localStorage
    const previousProjects = JSON.parse(localStorage.getItem('previousTeams') || '[]');
    
    if (previousProjects.length > 0) {
      // For demo, use the most recent project
      const latestProject = previousProjects[previousProjects.length - 1];
      if (latestProject.team) {
        const importedTeam = latestProject.team.map((member: any) => ({
          ...member,
          id: `member-${Date.now()}-${Math.random()}`,
          costPerHour: calculateMemberCostPerHour(member)
        }));
        
        setLocalTeam(importedTeam);
        setHasChanges(true);
      }
    }
  }, [calculateMemberCostPerHour]);

  const saveAsTemplate = useCallback(() => {
    const template = {
      name: `Template ${new Date().toLocaleDateString()}`,
      team: localTeam,
      createdAt: new Date().toISOString()
    };
    
    const existingTemplates = JSON.parse(localStorage.getItem('teamTemplates') || '[]');
    existingTemplates.push(template);
    localStorage.setItem('teamTemplates', JSON.stringify(existingTemplates));
  }, [localTeam]);

  const getValidationIcon = () => {
    if (!validation) return <Clock className="h-4 w-4 text-muted-foreground" />;
    if (validation.isValid) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  const getCompletionBadge = () => {
    if (!validation) return null;
    
    const percentage = validation.completionPercentage;
    const variant = percentage >= 80 ? 'default' : percentage >= 50 ? 'secondary' : 'destructive';
    
    return (
      <Badge variant={variant} className="ml-2">
        {percentage}% completo
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header with validation status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CardTitle className="flex items-center space-x-2">
                {getValidationIcon()}
                <Users className="h-5 w-5" />
                <span>Equipe do Projeto</span>
              </CardTitle>
              {getCompletionBadge()}
            </div>
            <div className="flex items-center space-x-2">
              {hasChanges && (
                <Badge variant="outline" className="text-orange-600">
                  <Clock className="h-3 w-3 mr-1" />
                  Salvando...
                </Badge>
              )}
              <Button 
                onClick={handleSave} 
                disabled={!hasChanges || isLoading}
                size="sm"
              >
                Salvar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Validation Alerts */}
      {validation && validation.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Problemas encontrados na equipe:</p>
              <ul className="list-disc list-inside space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index} className="text-sm">{error.message}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Team Summary */}
      {costCalculations && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Resumo de Custos da Equipe</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={importFromPreviousProject}>
                  Importar de Projeto Anterior
                </Button>
                <Button variant="outline" size="sm" onClick={saveAsTemplate}>
                  Salvar como Template
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Custo Mensal</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(costCalculations.totalMonthlyCost)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Custo Anual</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(costCalculations.totalAnnualCost)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Custo por Hora</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(costCalculations.costPerHour)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total de Membros</p>
                <p className="text-2xl font-bold text-orange-600">
                  {localTeam?.length || 0}
                </p>
              </div>
            </div>

            {/* Workload Validation Warnings */}
            {(localTeam || []).some(member => validateWorkload(member.workload).length > 0) && (
              <div className="mt-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium">Atenção na carga horária:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {(localTeam || []).map(member => {
                          const warnings = validateWorkload(member.workload);
                          return warnings.map((warning, index) => (
                            <li key={`${member.id}-${index}`} className="text-sm">
                              <strong>{member.name}:</strong> {warning}
                            </li>
                          ));
                        })}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Team Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Membros da Equipe</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={importTeamData}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={exportTeamData}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowEmployeeRegistry(true)}>
                <Users className="h-4 w-4 mr-2" />
                Selecionar do Cadastro
              </Button>
              <Button size="sm" onClick={() => setShowEmployeeRegistry(false)}>
                <Users className="h-4 w-4 mr-2" />
                Gerenciar Cadastro
              </Button>
              <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Membro
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Membro</DialogTitle>
                  </DialogHeader>
                  <MemberForm
                    formData={memberForm}
                    onFieldChange={handleFormFieldChange}
                    onAddCustomBenefit={addCustomBenefit}
                    onRemoveCustomBenefit={removeCustomBenefit}
                    onApplyRoleTemplate={applyRoleTemplate}
                    onSubmit={handleAddMember}
                    onCancel={() => {
                      setIsAddingMember(false);
                      resetMemberForm();
                    }}
                    submitLabel="Adicionar Membro"
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {(localTeam?.length || 0) === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum membro adicionado ainda</p>
              <p className="text-sm text-muted-foreground">
                Clique em "Adicionar Membro" para começar a montar sua equipe
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Memory optimization warning */}
              {comprehensiveMemoryOptimization.shouldShowWarning && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Grande volume de dados ({localTeam?.length || 0} membros) detectado. 
                    Otimizações de memória estão ativas para melhor performance.
                    Uso atual: {comprehensiveMemoryOptimization.memoryStats.used}MB
                  </AlertDescription>
                </Alert>
              )}

              {/* Enhanced team list with automatic optimization */}
              <ServiceDeskOptimizedList
                items={(localTeam || []).map(member => ({ ...member, id: member.id }))}
                renderItem={(member: TeamMember, index) => (
                  <TeamMemberCard
                    key={member.id}
                    member={member}
                    onEdit={() => handleEditMember(member)}
                    onRemove={() => handleRemoveMember(member.id)}
                    onDuplicate={() => handleDuplicateMember(member)}
                    costCalculation={costCalculations?.breakdown.find(b => b.memberId === member.id)}
                  />
                )}
                searchFields={['name', 'role']}
                sortFields={['name', 'role', 'salary']}
                itemHeight={140}
                maxHeight={600}
                pageSize={comprehensiveMemoryOptimization.isPaginated ? 25 : 50}
                className="space-y-2"
                onItemClick={(member) => {
                  automaticCleanup.trackAccess(); // Track member access
                  handleEditMember(member);
                }}
                listId="team-members-optimized"
                enableAutoOptimization={true}
              />

              {/* Enhanced pagination for large teams */}
              {/* Temporarily disabled due to type issues */}
              {/* {comprehensiveMemoryOptimization.isPaginated && (
                <EnhancedPagination
                  items={localTeam}
                  config={enhancedPagination.config}
                  onPageChange={enhancedPagination.handlePageChange}
                  onPageSizeChange={enhancedPagination.handlePageSizeChange}
                  className="mt-4"
                  listId="team-pagination"
                />
              )} */}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Member Dialog */}
      <Dialog open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Membro: {editingMember?.name}</DialogTitle>
          </DialogHeader>
          <MemberForm
            formData={memberForm}
            onFieldChange={handleFormFieldChange}
            onAddCustomBenefit={addCustomBenefit}
            onRemoveCustomBenefit={removeCustomBenefit}
            onApplyRoleTemplate={applyRoleTemplate}
            onSubmit={handleUpdateMember}
            onCancel={() => {
              setEditingMember(null);
              resetMemberForm();
            }}
            submitLabel="Atualizar Membro"
          />
        </DialogContent>
      </Dialog>

      {/* Employee Registry Manager */}
      <EmployeeRegistryManager
        isOpen={showEmployeeRegistry}
        onClose={() => setShowEmployeeRegistry(false)}
        onSelectEmployee={handleSelectFromRegistry}
        selectionMode={true}
      />
    </div>
  );
}

// Team Member Card Component
interface TeamMemberCardProps {
  member: TeamMember;
  onEdit: () => void;
  onRemove: () => void;
  onDuplicate: () => void;
  costCalculation?: any;
}

function TeamMemberCard({ member, onEdit, onRemove, onDuplicate, costCalculation }: TeamMemberCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-lg">{member.name}</h3>
              <Badge variant="secondary">{member.role}</Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Salário Base</p>
                <p className="font-medium">{formatCurrency(member.salary)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Carga Horária</p>
                <p className="font-medium">{member.workload}h/semana</p>
              </div>
              <div>
                <p className="text-muted-foreground">Custo/Hora</p>
                <p className="font-medium">{formatCurrency(member.costPerHour)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Custo Mensal</p>
                <p className="font-medium text-green-600">
                  {costCalculation ? formatCurrency(costCalculation.totalCost) : 'Calculando...'}
                </p>
              </div>
            </div>

            {(member.skills?.length || 0) > 0 && (
              <div className="mt-3">
                <p className="text-sm text-muted-foreground mb-1">Habilidades:</p>
                <div className="flex flex-wrap gap-1">
                  {(member.skills || []).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <Button variant="ghost" size="sm" onClick={onDuplicate}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onRemove} className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Member Form Component
interface MemberFormProps {
  formData: TeamMemberFormData;
  onFieldChange: (field: string, value: any) => void;
  onAddCustomBenefit: () => void;
  onRemoveCustomBenefit: (index: number) => void;
  onApplyRoleTemplate: (role: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
}

function MemberForm({
  formData,
  onFieldChange,
  onAddCustomBenefit,
  onRemoveCustomBenefit,
  onApplyRoleTemplate,
  onSubmit,
  onCancel,
  submitLabel
}: MemberFormProps) {
  const handleSkillsChange = (skillsText: string) => {
    const skills = skillsText.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
    onFieldChange('skills', skills);
  };

  const handleCertificationsChange = (certsText: string) => {
    const certifications = certsText.split(',').map(cert => cert.trim()).filter(cert => cert.length > 0);
    onFieldChange('certifications', certifications);
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="member-name">Nome Completo *</Label>
              <Input
                id="member-name"
                value={formData.name}
                onChange={(e) => onFieldChange('name', e.target.value)}
                placeholder="Digite o nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="member-role">Cargo *</Label>
              <div className="flex space-x-2">
                <Select
                  value={formData.role}
                  onValueChange={(value) => onFieldChange('role', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Outro (personalizado)</SelectItem>
                  </SelectContent>
                </Select>
                {salaryTemplates[formData.role] && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onApplyRoleTemplate(formData.role)}
                  >
                    Aplicar Template
                  </Button>
                )}
              </div>
              {formData.role === 'custom' && (
                <Input
                  placeholder="Digite o cargo personalizado"
                  onChange={(e) => onFieldChange('role', e.target.value)}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="member-salary">Salário Base (R$) *</Label>
              <Input
                id="member-salary"
                type="number"
                value={formData.salary}
                onChange={(e) => onFieldChange('salary', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="member-workload">Carga Horária (horas/semana) *</Label>
              <Input
                id="member-workload"
                type="number"
                value={formData.workload}
                onChange={(e) => onFieldChange('workload', parseInt(e.target.value) || 0)}
                placeholder="40"
                min="1"
                max="60"
                className={cn(
                  formData.workload > 44 && "border-yellow-500",
                  formData.workload > 60 && "border-red-500"
                )}
              />
              {formData.workload > 0 && (
                <div className="text-sm space-y-1">
                  {formData.workload > 44 && formData.workload <= 60 && (
                    <p className="text-yellow-600">⚠️ Acima do limite legal (44h/semana)</p>
                  )}
                  {formData.workload > 60 && (
                    <p className="text-red-600">❌ Carga horária excessiva</p>
                  )}
                  {formData.workload < 20 && (
                    <p className="text-yellow-600">⚠️ Carga horária muito baixa</p>
                  )}
                  {formData.workload >= 20 && formData.workload <= 44 && (
                    <p className="text-green-600">✅ Carga horária adequada</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="member-skills">Habilidades (separadas por vírgula)</Label>
            <Textarea
              id="member-skills"
              value={formData.skills.join(', ')}
              onChange={(e) => handleSkillsChange(e.target.value)}
              placeholder="Windows Server, Active Directory, SQL Server, etc."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="member-certifications">Certificações (separadas por vírgula)</Label>
            <Textarea
              id="member-certifications"
              value={formData.certifications.join(', ')}
              onChange={(e) => handleCertificationsChange(e.target.value)}
              placeholder="ITIL, CompTIA A+, Microsoft Certified, etc."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Benefits Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Benefícios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="health-insurance">Plano de Saúde (R$)</Label>
              <Input
                id="health-insurance"
                type="number"
                value={formData.benefits.healthInsurance}
                onChange={(e) => onFieldChange('benefits.healthInsurance', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meal-voucher">Vale Refeição (R$)</Label>
              <Input
                id="meal-voucher"
                type="number"
                value={formData.benefits.mealVoucher}
                onChange={(e) => onFieldChange('benefits.mealVoucher', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transport-voucher">Vale Transporte (R$)</Label>
              <Input
                id="transport-voucher"
                type="number"
                value={formData.benefits.transportVoucher}
                onChange={(e) => onFieldChange('benefits.transportVoucher', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="life-insurance">Seguro de Vida (R$)</Label>
              <Input
                id="life-insurance"
                type="number"
                value={formData.benefits.lifeInsurance}
                onChange={(e) => onFieldChange('benefits.lifeInsurance', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vacation">Férias (%)</Label>
              <Input
                id="vacation"
                type="number"
                value={formData.benefits.vacation}
                onChange={(e) => onFieldChange('benefits.vacation', parseFloat(e.target.value) || 0)}
                placeholder="8.33"
                min="0"
                max="100"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thirteenth-salary">13º Salário (%)</Label>
              <Input
                id="thirteenth-salary"
                type="number"
                value={formData.benefits.thirteenthSalary}
                onChange={(e) => onFieldChange('benefits.thirteenthSalary', parseFloat(e.target.value) || 0)}
                placeholder="8.33"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fgts">FGTS (%)</Label>
              <Input
                id="fgts"
                type="number"
                value={formData.benefits.fgts}
                onChange={(e) => onFieldChange('benefits.fgts', parseFloat(e.target.value) || 0)}
                placeholder="8.00"
                min="0"
                max="100"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inss">INSS (%)</Label>
              <Input
                id="inss"
                type="number"
                value={formData.benefits.inss}
                onChange={(e) => onFieldChange('benefits.inss', parseFloat(e.target.value) || 0)}
                placeholder="11.00"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
          </div>

          <Separator />

          {/* Custom Benefits */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Benefícios Adicionais</Label>
              <Button type="button" variant="outline" size="sm" onClick={onAddCustomBenefit}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Benefício
              </Button>
            </div>

            {formData.benefits.otherBenefits?.map((benefit, index) => (
              <div key={index} className="flex items-end space-x-2 p-3 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`benefit-name-${index}`}>Nome</Label>
                  <Input
                    id={`benefit-name-${index}`}
                    value={benefit.name}
                    onChange={(e) => onFieldChange(`benefits.otherBenefits.${index}.name`, e.target.value)}
                    placeholder="Nome do benefício"
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label htmlFor={`benefit-value-${index}`}>Valor</Label>
                  <Input
                    id={`benefit-value-${index}`}
                    type="number"
                    value={benefit.value}
                    onChange={(e) => onFieldChange(`benefits.otherBenefits.${index}.value`, parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label htmlFor={`benefit-type-${index}`}>Tipo</Label>
                  <Select
                    value={benefit.type}
                    onValueChange={(value) => onFieldChange(`benefits.otherBenefits.${index}.type`, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixo (R$)</SelectItem>
                      <SelectItem value="percentage">Percentual (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveCustomBenefit(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          type="button" 
          onClick={onSubmit}
          disabled={!formData.name || !formData.role || formData.salary <= 0}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}

// Employee Registry Manager component should be added to the main TeamTabModule return
// This was incorrectly placed outside the component