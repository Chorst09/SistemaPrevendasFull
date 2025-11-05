'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Plus, 
  Trash2, 
  Edit, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  CalendarIcon,
  Copy,
  Download,
  Upload,
  Calculator,
  PieChart,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { 
  AdditionalCost, 
  TabValidationStatus,
  CostCategory,
  CostType,
  CostFrequency,
  CostAllocation
} from '@/lib/types/service-desk-pricing';
import { CostTemplateService, CostTemplate } from '@/lib/services/cost-template-service';

export interface OtherCostsTabModuleProps {
  data: AdditionalCost[];
  onUpdate: (data: AdditionalCost[]) => void;
  validation?: TabValidationStatus;
  isLoading?: boolean;
  onAutoSave?: (data: AdditionalCost[]) => void;
}

interface CostFormData extends Omit<AdditionalCost, 'id'> {
  id?: string;
}

const defaultCostAllocation: CostAllocation = {
  method: 'equal',
  periods: [],
  percentages: []
};

const defaultCostData: CostFormData = {
  name: '',
  category: CostCategory.OTHER,
  value: 0,
  type: CostType.FIXED,
  frequency: CostFrequency.MONTHLY,
  startDate: new Date(),
  description: '',
  allocation: { ...defaultCostAllocation }
};

// Cost category configurations
const costCategoryConfig = {
  [CostCategory.INFRASTRUCTURE]: {
    label: 'Infraestrutura',
    icon: '🏗️',
    description: 'Servidores, rede, data center',
    commonItems: ['Servidores', 'Storage', 'Rede', 'Data Center', 'Cloud Services']
  },
  [CostCategory.LICENSES]: {
    label: 'Licenças',
    icon: '📄',
    description: 'Software, sistemas, ferramentas',
    commonItems: ['Microsoft Office', 'Windows Server', 'Antivírus', 'Monitoring Tools', 'ITSM']
  },
  [CostCategory.TRAINING]: {
    label: 'Treinamentos',
    icon: '🎓',
    description: 'Capacitação da equipe',
    commonItems: ['Certificações', 'Cursos Online', 'Workshops', 'Conferências', 'Material Didático']
  },
  [CostCategory.EQUIPMENT]: {
    label: 'Equipamentos',
    icon: '💻',
    description: 'Hardware, dispositivos',
    commonItems: ['Notebooks', 'Monitores', 'Telefones', 'Impressoras', 'Periféricos']
  },
  [CostCategory.FACILITIES]: {
    label: 'Instalações',
    icon: '🏢',
    description: 'Aluguel, manutenção predial',
    commonItems: ['Aluguel', 'Condomínio', 'Limpeza', 'Segurança', 'Manutenção']
  },
  [CostCategory.UTILITIES]: {
    label: 'Utilidades',
    icon: '⚡',
    description: 'Energia, internet, telefone',
    commonItems: ['Energia Elétrica', 'Internet', 'Telefone', 'Água', 'Gás']
  },
  [CostCategory.INSURANCE]: {
    label: 'Seguros',
    icon: '🛡️',
    description: 'Seguros diversos',
    commonItems: ['Seguro Predial', 'Seguro Equipamentos', 'Seguro Responsabilidade', 'Seguro Cyber']
  },
  [CostCategory.LEGAL]: {
    label: 'Jurídico',
    icon: '⚖️',
    description: 'Serviços jurídicos, compliance',
    commonItems: ['Advocacia', 'Compliance', 'Auditoria', 'Consultoria Jurídica', 'Documentação']
  },
  [CostCategory.MARKETING]: {
    label: 'Marketing',
    icon: '📢',
    description: 'Divulgação, comunicação',
    commonItems: ['Website', 'Material Gráfico', 'Eventos', 'Publicidade', 'Comunicação']
  },
  [CostCategory.OTHER]: {
    label: 'Outros',
    icon: '📦',
    description: 'Custos diversos',
    commonItems: ['Diversos', 'Contingência', 'Reserva Técnica', 'Imprevistos']
  }
};

const costTypeConfig = {
  [CostType.FIXED]: {
    label: 'Fixo',
    description: 'Valor constante independente do volume',
    color: 'bg-blue-100 text-blue-800'
  },
  [CostType.VARIABLE]: {
    label: 'Variável',
    description: 'Varia conforme o volume de atividade',
    color: 'bg-green-100 text-green-800'
  },
  [CostType.SEMI_VARIABLE]: {
    label: 'Semi-variável',
    description: 'Parte fixa + parte variável',
    color: 'bg-yellow-100 text-yellow-800'
  },
  [CostType.EVENTUAL]: {
    label: 'Eventual',
    description: 'Ocorre esporadicamente',
    color: 'bg-purple-100 text-purple-800'
  }
};

const costFrequencyConfig = {
  [CostFrequency.MONTHLY]: { label: 'Mensal', multiplier: 1 },
  [CostFrequency.QUARTERLY]: { label: 'Trimestral', multiplier: 3 },
  [CostFrequency.SEMI_ANNUAL]: { label: 'Semestral', multiplier: 6 },
  [CostFrequency.ANNUAL]: { label: 'Anual', multiplier: 12 },
  [CostFrequency.ONE_TIME]: { label: 'Única vez', multiplier: 0 }
};

export function OtherCostsTabModule({
  data,
  onUpdate,
  validation,
  isLoading = false,
  onAutoSave
}: OtherCostsTabModuleProps) {
  const [localData, setLocalData] = useState<AdditionalCost[]>(data);
  const [hasChanges, setHasChanges] = useState(false);
  const [isAddingCost, setIsAddingCost] = useState(false);
  const [editingCost, setEditingCost] = useState<AdditionalCost | null>(null);
  const [costForm, setCostForm] = useState<CostFormData>(defaultCostData);
  const [selectedCategory, setSelectedCategory] = useState<CostCategory | null>(null);
  const [costSummary, setCostSummary] = useState<any>(null);
  const [availableTemplates, setAvailableTemplates] = useState<CostTemplate[]>([]);
  const [previousProjects, setPreviousProjects] = useState<any[]>([]);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [duplicateValidation, setDuplicateValidation] = useState<any>(null);

  // Auto-save functionality with debouncing
  useEffect(() => {
    if (hasChanges && onAutoSave) {
      const timeoutId = setTimeout(() => {
        onAutoSave(localData);
        setHasChanges(false);
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [localData, hasChanges, onAutoSave]);

  // Update local data when prop changes
  useEffect(() => {
    setLocalData(data);
    setHasChanges(false);
  }, [data]);

  // Calculate cost summary when data changes
  useEffect(() => {
    calculateCostSummary();
    validateDuplicates();
  }, [localData]);

  // Load templates and previous projects on mount
  useEffect(() => {
    loadTemplatesAndProjects();
  }, []);

  const handleSave = useCallback(() => {
    onUpdate(localData);
    setHasChanges(false);
  }, [localData, onUpdate]);

  const calculateCostSummary = useCallback(() => {
    const summary = {
      totalMonthlyCost: 0,
      totalAnnualCost: 0,
      byCategory: {} as Record<CostCategory, number>,
      byType: {} as Record<CostType, number>,
      byFrequency: {} as Record<CostFrequency, number>
    };

    localData.forEach(cost => {
      const monthlyValue = calculateMonthlyCost(cost);
      const annualValue = monthlyValue * 12;

      summary.totalMonthlyCost += monthlyValue;
      summary.totalAnnualCost += annualValue;

      // By category
      if (!summary.byCategory[cost.category]) {
        summary.byCategory[cost.category] = 0;
      }
      summary.byCategory[cost.category] += monthlyValue;

      // By type
      if (!summary.byType[cost.type]) {
        summary.byType[cost.type] = 0;
      }
      summary.byType[cost.type] += monthlyValue;

      // By frequency
      if (!summary.byFrequency[cost.frequency]) {
        summary.byFrequency[cost.frequency] = 0;
      }
      summary.byFrequency[cost.frequency] += monthlyValue;
    });

    setCostSummary(summary);
  }, [localData]);

  const calculateMonthlyCost = useCallback((cost: AdditionalCost): number => {
    const frequencyConfig = costFrequencyConfig[cost.frequency];
    
    if (cost.frequency === CostFrequency.ONE_TIME) {
      // For one-time costs, distribute over contract period (assuming 12 months)
      return cost.value / 12;
    }
    
    return cost.value / frequencyConfig.multiplier;
  }, []);

  const resetCostForm = useCallback(() => {
    setCostForm({ ...defaultCostData });
  }, []);

  const handleAddCost = useCallback(() => {
    const newCost: AdditionalCost = {
      ...costForm,
      id: `cost-${Date.now()}`,
      startDate: costForm.startDate || new Date()
    };
    
    const updatedData = [...localData, newCost];
    setLocalData(updatedData);
    setHasChanges(true);
    setIsAddingCost(false);
    resetCostForm();
  }, [costForm, localData, resetCostForm]);

  const handleEditCost = useCallback((cost: AdditionalCost) => {
    setEditingCost(cost);
    setCostForm({ ...cost });
  }, []);

  const handleUpdateCost = useCallback(() => {
    if (!editingCost) return;
    
    const updatedCost: AdditionalCost = {
      ...costForm,
      id: editingCost.id
    };
    
    const updatedData = localData.map(cost => 
      cost.id === editingCost.id ? updatedCost : cost
    );
    
    setLocalData(updatedData);
    setHasChanges(true);
    setEditingCost(null);
    resetCostForm();
  }, [editingCost, costForm, localData, resetCostForm]);

  const handleRemoveCost = useCallback((costId: string) => {
    const updatedData = localData.filter(cost => cost.id !== costId);
    setLocalData(updatedData);
    setHasChanges(true);
  }, [localData]);

  const handleDuplicateCost = useCallback((cost: AdditionalCost) => {
    const duplicatedCost: AdditionalCost = {
      ...cost,
      id: `cost-${Date.now()}`,
      name: `${cost.name} (Cópia)`
    };
    
    const updatedData = [...localData, duplicatedCost];
    setLocalData(updatedData);
    setHasChanges(true);
  }, [localData]);

  const handleFormFieldChange = useCallback((field: string, value: any) => {
    setCostForm(prev => {
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

  const handleCategoryFilter = useCallback((category: CostCategory | null) => {
    setSelectedCategory(category);
  }, []);

  const getFilteredCosts = useCallback(() => {
    if (!selectedCategory) return localData;
    return localData.filter(cost => cost.category === selectedCategory);
  }, [localData, selectedCategory]);

  const exportCostsData = useCallback(() => {
    const dataToExport = {
      costs: localData,
      summary: costSummary,
      exportDate: new Date().toISOString(),
      totalCosts: localData.length
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `outros-custos-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [localData, costSummary]);

  const importCostsData = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (importedData.costs && Array.isArray(importedData.costs)) {
          const validatedCosts = importedData.costs.map((cost: any) => ({
            ...cost,
            id: `cost-${Date.now()}-${Math.random()}`,
            startDate: new Date(cost.startDate)
          }));
          
          setLocalData(validatedCosts);
          setHasChanges(true);
        }
      } catch (error) {
        console.error('Error importing costs data:', error);
      }
    };
    reader.readAsText(file);
  }, []);

  const loadTemplatesAndProjects = useCallback(() => {
    try {
      const templates = CostTemplateService.getTemplates();
      setAvailableTemplates(templates);

      const projects = CostTemplateService.getPreviousProjectCosts();
      setPreviousProjects(projects);
    } catch (error) {
      console.error('Error loading templates and projects:', error);
    }
  }, []);

  const validateDuplicates = useCallback(() => {
    const validation = CostTemplateService.validateForDuplicates(localData);
    setDuplicateValidation(validation);
  }, [localData]);

  const handleApplyTemplate = useCallback((templateId: string) => {
    try {
      const templateCosts = CostTemplateService.applyTemplate(templateId);
      const updatedData = [...localData, ...templateCosts];
      setLocalData(updatedData);
      setHasChanges(true);
      setIsTemplateDialogOpen(false);
    } catch (error) {
      console.error('Error applying template:', error);
    }
  }, [localData]);

  const handleImportFromProject = useCallback((projectName: string) => {
    try {
      const projectCosts = CostTemplateService.importFromPreviousProject(projectName);
      const updatedData = [...localData, ...projectCosts];
      setLocalData(updatedData);
      setHasChanges(true);
      setIsImportDialogOpen(false);
    } catch (error) {
      console.error('Error importing from project:', error);
    }
  }, [localData]);

  const handleSaveAsTemplate = useCallback(() => {
    if (localData.length === 0) return;

    try {
      const templateName = prompt('Nome do template:');
      if (!templateName) return;

      const template = {
        name: templateName,
        description: `Template criado em ${new Date().toLocaleDateString()}`,
        category: CostCategory.OTHER,
        projectType: 'custom',
        costs: localData.map(cost => ({
          name: cost.name,
          category: cost.category,
          value: cost.value,
          type: cost.type,
          frequency: cost.frequency,
          description: cost.description,
          allocation: cost.allocation
        }))
      };

      CostTemplateService.saveTemplate(template);
      loadTemplatesAndProjects(); // Refresh templates
    } catch (error) {
      console.error('Error saving template:', error);
    }
  }, [localData, loadTemplatesAndProjects]);

  const handleSaveProjectCosts = useCallback(() => {
    if (localData.length === 0) return;

    try {
      const projectName = prompt('Nome do projeto para salvar os custos:');
      if (!projectName) return;

      CostTemplateService.saveProjectCosts(projectName, localData);
      loadTemplatesAndProjects(); // Refresh projects
    } catch (error) {
      console.error('Error saving project costs:', error);
    }
  }, [localData, loadTemplatesAndProjects]);

  const handleRemoveDuplicates = useCallback(() => {
    if (!duplicateValidation || duplicateValidation.isValid) return;

    const indicesToRemove = new Set<number>();
    duplicateValidation.duplicates.forEach((duplicate: any) => {
      // Keep the first occurrence, remove the rest
      duplicate.indices.slice(1).forEach((index: number) => {
        indicesToRemove.add(index);
      });
    });

    const filteredData = localData.filter((_, index) => !indicesToRemove.has(index));
    setLocalData(filteredData);
    setHasChanges(true);
  }, [localData, duplicateValidation]);

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

  const filteredCosts = getFilteredCosts();

  return (
    <div className="space-y-6">
      {/* Header with validation status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CardTitle className="flex items-center space-x-2">
                {getValidationIcon()}
                <DollarSign className="h-5 w-5" />
                <span>Outros Custos</span>
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
              <p className="font-medium">Problemas encontrados nos custos:</p>
              <ul className="list-disc list-inside space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index} className="text-sm">{error.message}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Duplicate Validation Alert */}
      {duplicateValidation && !duplicateValidation.isValid && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium">Custos duplicados encontrados:</p>
                <Button variant="outline" size="sm" onClick={handleRemoveDuplicates}>
                  Remover Duplicatas
                </Button>
              </div>
              <ul className="list-disc list-inside space-y-1">
                {duplicateValidation.duplicates.map((duplicate: any, index: number) => (
                  <li key={index} className="text-sm">
                    <strong>{duplicate.name}</strong> na categoria {costCategoryConfig[duplicate.category as CostCategory].label} 
                    ({duplicate.indices.length} ocorrências)
                  </li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Cost Summary */}
      {costSummary && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <span>Resumo de Custos</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setIsTemplateDialogOpen(true)}>
                  📋 Templates
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsImportDialogOpen(true)}>
                  📁 Projetos Anteriores
                </Button>
                <Button variant="outline" size="sm" onClick={handleSaveAsTemplate} disabled={localData.length === 0}>
                  💾 Salvar Template
                </Button>
                <Button variant="outline" size="sm" onClick={exportCostsData}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={importCostsData}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Importar
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Custo Mensal</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(costSummary.totalMonthlyCost)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Custo Anual</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(costSummary.totalAnnualCost)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total de Itens</p>
                <p className="text-2xl font-bold text-purple-600">
                  {localData.length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Categorias</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Object.keys(costSummary.byCategory).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChart className="h-5 w-5" />
            <span>Filtros por Categoria</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryFilter(null)}
            >
              Todas ({localData.length})
            </Button>
            {Object.entries(costCategoryConfig).map(([category, config]) => {
              const count = localData.filter(cost => cost.category === category).length;
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryFilter(category as CostCategory)}
                  disabled={count === 0}
                >
                  {config.icon} {config.label} ({count})
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Costs Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {selectedCategory 
                ? `${costCategoryConfig[selectedCategory].label} (${filteredCosts.length})`
                : `Todos os Custos (${localData.length})`
              }
            </CardTitle>
            <Dialog open={isAddingCost} onOpenChange={setIsAddingCost}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Custo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Custo</DialogTitle>
                </DialogHeader>
                <CostForm
                  formData={costForm}
                  onFieldChange={handleFormFieldChange}
                  onSubmit={handleAddCost}
                  onCancel={() => {
                    setIsAddingCost(false);
                    resetCostForm();
                  }}
                  submitLabel="Adicionar Custo"
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCosts.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {selectedCategory 
                  ? `Nenhum custo na categoria ${costCategoryConfig[selectedCategory].label}`
                  : 'Nenhum custo adicionado ainda'
                }
              </p>
              <p className="text-sm text-muted-foreground">
                Clique em "Adicionar Custo" para começar
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCosts.map((cost) => (
                <CostCard
                  key={cost.id}
                  cost={cost}
                  onEdit={() => handleEditCost(cost)}
                  onRemove={() => handleRemoveCost(cost.id)}
                  onDuplicate={() => handleDuplicateCost(cost)}
                  monthlyCost={calculateMonthlyCost(cost)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Cost Dialog */}
      <Dialog open={!!editingCost} onOpenChange={(open) => !open && setEditingCost(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Custo: {editingCost?.name}</DialogTitle>
          </DialogHeader>
          <CostForm
            formData={costForm}
            onFieldChange={handleFormFieldChange}
            onSubmit={handleUpdateCost}
            onCancel={() => {
              setEditingCost(null);
              resetCostForm();
            }}
            submitLabel="Atualizar Custo"
          />
        </DialogContent>
      </Dialog>

      {/* Template Selection Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Aplicar Template de Custos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {availableTemplates.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum template disponível
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableTemplates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{template.name}</h3>
                          <Badge variant="outline">
                            {costCategoryConfig[template.category].icon} {costCategoryConfig[template.category].label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span>{template.costs.length} itens</span>
                          <span>Tipo: {template.projectType}</span>
                        </div>
                        <Button 
                          className="w-full" 
                          onClick={() => handleApplyTemplate(template.id)}
                        >
                          Aplicar Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Previous Projects Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Importar de Projetos Anteriores</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {previousProjects.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum projeto anterior encontrado
              </p>
            ) : (
              <div className="space-y-3">
                {previousProjects.map((project, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold">{project.projectName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {project.costs.length} custos • Salvo em {format(project.savedAt, 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        </div>
                        <Button onClick={() => handleImportFromProject(project.projectName)}>
                          Importar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
// Cost Card Component
interface CostCardProps {
  cost: AdditionalCost;
  onEdit: () => void;
  onRemove: () => void;
  onDuplicate: () => void;
  monthlyCost: number;
}

function CostCard({ cost, onEdit, onRemove, onDuplicate, monthlyCost }: CostCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const categoryConfig = costCategoryConfig[cost.category];
  const typeConfig = costTypeConfig[cost.type];
  const frequencyConfig = costFrequencyConfig[cost.frequency];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">{categoryConfig.icon}</span>
              <h3 className="font-semibold text-lg">{cost.name}</h3>
              <Badge variant="secondary" className={typeConfig.color}>
                {typeConfig.label}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
              <div>
                <p className="text-muted-foreground">Categoria</p>
                <p className="font-medium">{categoryConfig.label}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Valor Original</p>
                <p className="font-medium">{formatCurrency(cost.value)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Frequência</p>
                <p className="font-medium">{frequencyConfig.label}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Custo Mensal</p>
                <p className="font-medium text-green-600">{formatCurrency(monthlyCost)}</p>
              </div>
            </div>

            {cost.description && (
              <div className="mb-3">
                <p className="text-sm text-muted-foreground mb-1">Descrição:</p>
                <p className="text-sm">{cost.description}</p>
              </div>
            )}

            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Início: {format(cost.startDate, 'dd/MM/yyyy', { locale: ptBR })}</span>
              {cost.endDate && (
                <span>Fim: {format(cost.endDate, 'dd/MM/yyyy', { locale: ptBR })}</span>
              )}
            </div>
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

// Cost Form Component
interface CostFormProps {
  formData: CostFormData;
  onFieldChange: (field: string, value: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
}

function CostForm({
  formData,
  onFieldChange,
  onSubmit,
  onCancel,
  submitLabel
}: CostFormProps) {
  const [selectedCategoryItems, setSelectedCategoryItems] = useState<string[]>([]);

  useEffect(() => {
    if (formData.category) {
      setSelectedCategoryItems(costCategoryConfig[formData.category].commonItems);
    }
  }, [formData.category]);

  const handleCategoryChange = (category: CostCategory) => {
    onFieldChange('category', category);
    
    // Auto-suggest name if empty
    if (!formData.name) {
      const categoryConfig = costCategoryConfig[category];
      onFieldChange('name', categoryConfig.commonItems[0] || '');
    }
  };

  const handleQuickFill = (itemName: string) => {
    onFieldChange('name', itemName);
  };

  const calculatePreviewCost = () => {
    const frequencyConfig = costFrequencyConfig[formData.frequency];
    
    if (formData.frequency === CostFrequency.ONE_TIME) {
      return {
        monthly: formData.value / 12,
        annual: formData.value
      };
    }
    
    const monthly = formData.value / frequencyConfig.multiplier;
    return {
      monthly,
      annual: monthly * 12
    };
  };

  const previewCost = calculatePreviewCost();

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
              <Label htmlFor="cost-category">Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(costCategoryConfig).map(([category, config]) => (
                    <SelectItem key={category} value={category}>
                      <div className="flex items-center space-x-2">
                        <span>{config.icon}</span>
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.category && (
                <p className="text-sm text-muted-foreground">
                  {costCategoryConfig[formData.category].description}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost-name">Nome do Custo *</Label>
              <Input
                id="cost-name"
                value={formData.name}
                onChange={(e) => onFieldChange('name', e.target.value)}
                placeholder="Digite o nome do custo"
              />
              {selectedCategoryItems.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="text-xs text-muted-foreground">Sugestões:</span>
                  {selectedCategoryItems.slice(0, 3).map((item, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => handleQuickFill(item)}
                    >
                      {item}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost-value">Valor *</Label>
              <Input
                id="cost-value"
                type="number"
                value={formData.value}
                onChange={(e) => onFieldChange('value', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost-type">Tipo de Custo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => onFieldChange('type', value as CostType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(costTypeConfig).map(([type, config]) => (
                    <SelectItem key={type} value={type}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.type && (
                <p className="text-xs text-muted-foreground">
                  {costTypeConfig[formData.type].description}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost-frequency">Frequência</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => onFieldChange('frequency', value as CostFrequency)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(costFrequencyConfig).map(([frequency, config]) => (
                    <SelectItem key={frequency} value={frequency}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost-description">Descrição</Label>
            <Textarea
              id="cost-description"
              value={formData.description}
              onChange={(e) => onFieldChange('description', e.target.value)}
              placeholder="Descreva o custo, fornecedor, observações..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Period Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Período de Vigência</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Início *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? (
                      format(formData.startDate, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => onFieldChange('startDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Data de Fim (Opcional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? (
                      format(formData.endDate, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => onFieldChange('endDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Prévia de Custos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Custo Mensal</p>
              <p className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(previewCost.monthly)}
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Custo Anual</p>
              <p className="text-2xl font-bold text-blue-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(previewCost.annual)}
              </p>
            </div>
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
          disabled={!formData.name || !formData.category || formData.value <= 0}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}