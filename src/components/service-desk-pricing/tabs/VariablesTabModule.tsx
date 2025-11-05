'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { 
  Plus, 
  Trash2, 
  Edit, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  BarChart3,
  Calculator,
  Info,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  MarketVariables, 
  TabValidationStatus,
  InflationConfig,
  SalaryAdjustmentConfig,
  MarketFactor,
  ScenarioConfig,
  ScenarioAdjustment
} from '@/lib/types/service-desk-pricing';

export interface VariablesTabModuleProps {
  data: MarketVariables;
  onUpdate: (data: MarketVariables) => void;
  onAutoSave?: (data: MarketVariables) => void;
  validation?: TabValidationStatus;
  isLoading?: boolean;
}

const defaultInflationConfig: InflationConfig = {
  annualRate: 4.5,
  monthlyRate: 0.37,
  projectionPeriod: 12,
  source: 'IPCA - IBGE',
  lastUpdate: new Date()
};

const defaultSalaryAdjustment: SalaryAdjustmentConfig = {
  annualAdjustment: 5.0,
  adjustmentDate: new Date(),
  adjustmentType: 'inflation',
  minimumAdjustment: 3.0,
  maximumAdjustment: 10.0
};

const marketFactorCategories = [
  { value: 'economic', label: 'Econômico' },
  { value: 'technological', label: 'Tecnológico' },
  { value: 'regulatory', label: 'Regulatório' },
  { value: 'competitive', label: 'Competitivo' }
];

const scenarioCategories = [
  { value: 'salary', label: 'Salários' },
  { value: 'costs', label: 'Custos' },
  { value: 'revenue', label: 'Receita' },
  { value: 'taxes', label: 'Impostos' }
];

export function VariablesTabModule({ 
  data, 
  onUpdate, 
  onAutoSave, 
  validation, 
  isLoading = false 
}: VariablesTabModuleProps) {
  const [localData, setLocalData] = useState<MarketVariables>(data);
  const [hasChanges, setHasChanges] = useState(false);
  const [isAddingFactor, setIsAddingFactor] = useState(false);
  const [isAddingScenario, setIsAddingScenario] = useState(false);
  const [editingFactor, setEditingFactor] = useState<MarketFactor | null>(null);
  const [editingScenario, setEditingScenario] = useState<ScenarioConfig | null>(null);
  const [impactAnalysis, setImpactAnalysis] = useState<any>(null);
  const [scenarioComparison, setScenarioComparison] = useState<any>(null);

  const [newFactor, setNewFactor] = useState<Partial<MarketFactor>>({
    name: '',
    impact: 0,
    description: '',
    category: 'economic',
    probability: 0.5
  });

  const [newScenario, setNewScenario] = useState<Partial<ScenarioConfig>>({
    name: '',
    description: '',
    probability: 0.33,
    adjustments: []
  });

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

  // Calculate impact analysis when data changes
  useEffect(() => {
    calculateImpactAnalysis();
    calculateScenarioComparison();
  }, [localData]);

  const handleSave = useCallback(() => {
    onUpdate(localData);
    setHasChanges(false);
  }, [localData, onUpdate]);

  const handleFieldChange = useCallback((field: string, value: any) => {
    setLocalData(prev => {
      const newData = { ...prev };
      const fieldPath = field.split('.');
      
      let current: any = newData;
      for (let i = 0; i < fieldPath.length - 1; i++) {
        if (!current[fieldPath[i]]) {
          current[fieldPath[i]] = {};
        }
        current = current[fieldPath[i]];
      }
      
      current[fieldPath[fieldPath.length - 1]] = value;
      
      return newData;
    });
    setHasChanges(true);
  }, []);

  const calculateMonthlyRate = useCallback((annualRate: number): number => {
    return Math.pow(1 + annualRate / 100, 1/12) - 1;
  }, []);

  const handleInflationChange = useCallback((field: keyof InflationConfig, value: any) => {
    const updatedInflation = { ...localData.inflation, [field]: value };
    
    // Auto-calculate monthly rate when annual rate changes
    if (field === 'annualRate') {
      updatedInflation.monthlyRate = calculateMonthlyRate(value) * 100;
    }
    
    setLocalData(prev => ({ ...prev, inflation: updatedInflation }));
    setHasChanges(true);
  }, [localData.inflation, calculateMonthlyRate]);

  const handleSalaryAdjustmentChange = useCallback((field: keyof SalaryAdjustmentConfig, value: any) => {
    const updatedAdjustment = { ...localData.salaryAdjustments, [field]: value };
    setLocalData(prev => ({ ...prev, salaryAdjustments: updatedAdjustment }));
    setHasChanges(true);
  }, [localData.salaryAdjustments]);

  const handleAddMarketFactor = useCallback(() => {
    if (newFactor.name && newFactor.impact !== undefined) {
      const factor: MarketFactor = {
        name: newFactor.name,
        impact: newFactor.impact,
        description: newFactor.description || '',
        category: newFactor.category || 'economic',
        probability: newFactor.probability || 0.5
      };

      const updatedFactors = [...localData.marketFactors, factor];
      setLocalData(prev => ({ ...prev, marketFactors: updatedFactors }));
      setHasChanges(true);
      setIsAddingFactor(false);
      setNewFactor({
        name: '',
        impact: 0,
        description: '',
        category: 'economic',
        probability: 0.5
      });
    }
  }, [newFactor, localData.marketFactors]);

  const handleEditMarketFactor = useCallback((factor: MarketFactor) => {
    setEditingFactor(factor);
    setNewFactor({ ...factor });
  }, []);

  const handleUpdateMarketFactor = useCallback(() => {
    if (!editingFactor || !newFactor.name) return;

    const updatedFactor: MarketFactor = {
      name: newFactor.name,
      impact: newFactor.impact || 0,
      description: newFactor.description || '',
      category: newFactor.category || 'economic',
      probability: newFactor.probability || 0.5
    };

    const updatedFactors = localData.marketFactors.map(factor =>
      factor.name === editingFactor.name ? updatedFactor : factor
    );

    setLocalData(prev => ({ ...prev, marketFactors: updatedFactors }));
    setHasChanges(true);
    setEditingFactor(null);
    setNewFactor({
      name: '',
      impact: 0,
      description: '',
      category: 'economic',
      probability: 0.5
    });
  }, [editingFactor, newFactor, localData.marketFactors]);

  const handleRemoveMarketFactor = useCallback((factorName: string) => {
    const updatedFactors = localData.marketFactors.filter(factor => factor.name !== factorName);
    setLocalData(prev => ({ ...prev, marketFactors: updatedFactors }));
    setHasChanges(true);
  }, [localData.marketFactors]);

  const handleAddScenario = useCallback(() => {
    if (newScenario.name && newScenario.adjustments && newScenario.adjustments.length > 0) {
      const scenario: ScenarioConfig = {
        name: newScenario.name,
        description: newScenario.description || '',
        probability: newScenario.probability || 0.33,
        adjustments: newScenario.adjustments
      };

      const updatedScenarios = [...localData.scenarios, scenario];
      setLocalData(prev => ({ ...prev, scenarios: updatedScenarios }));
      setHasChanges(true);
      setIsAddingScenario(false);
      setNewScenario({
        name: '',
        description: '',
        probability: 0.33,
        adjustments: []
      });
    }
  }, [newScenario, localData.scenarios]);

  const handleEditScenario = useCallback((scenario: ScenarioConfig) => {
    setEditingScenario(scenario);
    setNewScenario({ ...scenario });
  }, []);

  const handleUpdateScenario = useCallback(() => {
    if (!editingScenario || !newScenario.name) return;

    const updatedScenario: ScenarioConfig = {
      name: newScenario.name,
      description: newScenario.description || '',
      probability: newScenario.probability || 0.33,
      adjustments: newScenario.adjustments || []
    };

    const updatedScenarios = localData.scenarios.map(scenario =>
      scenario.name === editingScenario.name ? updatedScenario : scenario
    );

    setLocalData(prev => ({ ...prev, scenarios: updatedScenarios }));
    setHasChanges(true);
    setEditingScenario(null);
    setNewScenario({
      name: '',
      description: '',
      probability: 0.33,
      adjustments: []
    });
  }, [editingScenario, newScenario, localData.scenarios]);

  const handleRemoveScenario = useCallback((scenarioName: string) => {
    const updatedScenarios = localData.scenarios.filter(scenario => scenario.name !== scenarioName);
    setLocalData(prev => ({ ...prev, scenarios: updatedScenarios }));
    setHasChanges(true);
  }, [localData.scenarios]);

  const addScenarioAdjustment = useCallback(() => {
    const newAdjustment: ScenarioAdjustment = {
      category: 'salary',
      adjustment: 0,
      reason: ''
    };

    setNewScenario(prev => ({
      ...prev,
      adjustments: [...(prev.adjustments || []), newAdjustment]
    }));
  }, []);

  const updateScenarioAdjustment = useCallback((index: number, field: keyof ScenarioAdjustment, value: any) => {
    setNewScenario(prev => ({
      ...prev,
      adjustments: prev.adjustments?.map((adj, i) => 
        i === index ? { ...adj, [field]: value } : adj
      ) || []
    }));
  }, []);

  const removeScenarioAdjustment = useCallback((index: number) => {
    setNewScenario(prev => ({
      ...prev,
      adjustments: prev.adjustments?.filter((_, i) => i !== index) || []
    }));
  }, []);

  const calculateImpactAnalysis = useCallback(() => {
    const baseValue = 100000; // Base value for calculations
    let totalImpact = 0;
    let weightedImpact = 0;

    localData.marketFactors.forEach(factor => {
      const factorImpact = (factor.impact / 100) * baseValue * factor.probability;
      totalImpact += factorImpact;
      weightedImpact += Math.abs(factorImpact);
    });

    const inflationImpact = (localData.inflation.annualRate / 100) * baseValue;
    const salaryImpact = (localData.salaryAdjustments.annualAdjustment / 100) * baseValue * 0.6; // Assuming 60% of costs are salary

    setImpactAnalysis({
      totalMarketFactorImpact: totalImpact,
      weightedMarketFactorImpact: weightedImpact,
      inflationImpact,
      salaryImpact,
      combinedImpact: totalImpact + inflationImpact + salaryImpact,
      riskLevel: weightedImpact > baseValue * 0.1 ? 'high' : weightedImpact > baseValue * 0.05 ? 'medium' : 'low'
    });
  }, [localData]);

  const calculateScenarioComparison = useCallback(() => {
    const baseValue = 100000;
    const scenarios = localData.scenarios.map(scenario => {
      let scenarioValue = baseValue;
      
      scenario.adjustments.forEach(adjustment => {
        const adjustmentValue = (adjustment.adjustment / 100) * baseValue;
        scenarioValue += adjustmentValue;
      });

      return {
        name: scenario.name,
        value: scenarioValue,
        probability: scenario.probability,
        expectedValue: scenarioValue * scenario.probability,
        variance: Math.pow(scenarioValue - baseValue, 2) * scenario.probability
      };
    });

    const expectedValue = scenarios.reduce((sum, s) => sum + s.expectedValue, 0);
    const variance = scenarios.reduce((sum, s) => sum + s.variance, 0);
    const standardDeviation = Math.sqrt(variance);

    setScenarioComparison({
      scenarios,
      expectedValue,
      standardDeviation,
      riskLevel: standardDeviation > baseValue * 0.15 ? 'high' : standardDeviation > baseValue * 0.08 ? 'medium' : 'low'
    });
  }, [localData.scenarios]);

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

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'economic':
        return <TrendingUp className="h-4 w-4" />;
      case 'technological':
        return <BarChart3 className="h-4 w-4" />;
      case 'regulatory':
        return <AlertTriangle className="h-4 w-4" />;
      case 'competitive':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    return marketFactorCategories.find(c => c.value === category)?.label || category;
  };

  const getScenarioCategoryLabel = (category: string) => {
    return scenarioCategories.find(c => c.value === category)?.label || category;
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
                <TrendingUp className="h-5 w-5" />
                <span>Variáveis de Mercado</span>
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
              <p className="font-medium">Problemas encontrados nas variáveis:</p>
              <ul className="list-disc list-inside space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index} className="text-sm">{error.message}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {validation && validation.warnings.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Atenção:</p>
              <ul className="list-disc list-inside space-y-1">
                {validation.warnings.map((warning, index) => (
                  <li key={index} className="text-sm">
                    {warning.message}
                    {warning.suggestion && (
                      <span className="text-muted-foreground"> - {warning.suggestion}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="inflation" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="inflation">Inflação</TabsTrigger>
          <TabsTrigger value="salary">Reajustes</TabsTrigger>
          <TabsTrigger value="factors">Fatores de Mercado</TabsTrigger>
          <TabsTrigger value="scenarios">Cenários</TabsTrigger>
        </TabsList>

        <TabsContent value="inflation" className="space-y-6">
          {/* Inflation Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Inflação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="annual-rate">Taxa Anual (%)</Label>
                  <Input
                    id="annual-rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={localData.inflation.annualRate}
                    onChange={(e) => handleInflationChange('annualRate', parseFloat(e.target.value) || 0)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthly-rate">Taxa Mensal (%) - Calculada</Label>
                  <Input
                    id="monthly-rate"
                    type="number"
                    step="0.01"
                    value={localData.inflation.monthlyRate.toFixed(4)}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projection-period">Período de Projeção (meses)</Label>
                  <Input
                    id="projection-period"
                    type="number"
                    min="1"
                    max="120"
                    value={localData.inflation.projectionPeriod}
                    onChange={(e) => handleInflationChange('projectionPeriod', parseInt(e.target.value) || 12)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source">Fonte dos Dados</Label>
                  <Input
                    id="source"
                    value={localData.inflation.source}
                    onChange={(e) => handleInflationChange('source', e.target.value)}
                    placeholder="Ex: IPCA - IBGE"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Última Atualização</Label>
                <Input
                  type="date"
                  value={localData.inflation.lastUpdate.toISOString().split('T')[0]}
                  onChange={(e) => handleInflationChange('lastUpdate', new Date(e.target.value))}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salary" className="space-y-6">
          {/* Salary Adjustments Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Reajustes Salariais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="annual-adjustment">Reajuste Anual (%)</Label>
                  <Input
                    id="annual-adjustment"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={localData.salaryAdjustments.annualAdjustment}
                    onChange={(e) => handleSalaryAdjustmentChange('annualAdjustment', parseFloat(e.target.value) || 0)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adjustment-type">Tipo de Reajuste</Label>
                  <Select
                    value={localData.salaryAdjustments.adjustmentType}
                    onValueChange={(value) => handleSalaryAdjustmentChange('adjustmentType', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inflation">Inflação</SelectItem>
                      <SelectItem value="productivity">Produtividade</SelectItem>
                      <SelectItem value="market">Mercado</SelectItem>
                      <SelectItem value="negotiated">Negociado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-adjustment">Reajuste Mínimo (%)</Label>
                  <Input
                    id="min-adjustment"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={localData.salaryAdjustments.minimumAdjustment}
                    onChange={(e) => handleSalaryAdjustmentChange('minimumAdjustment', parseFloat(e.target.value) || 0)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-adjustment">Reajuste Máximo (%)</Label>
                  <Input
                    id="max-adjustment"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={localData.salaryAdjustments.maximumAdjustment}
                    onChange={(e) => handleSalaryAdjustmentChange('maximumAdjustment', parseFloat(e.target.value) || 0)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Data do Reajuste</Label>
                <Input
                  type="date"
                  value={localData.salaryAdjustments.adjustmentDate.toISOString().split('T')[0]}
                  onChange={(e) => handleSalaryAdjustmentChange('adjustmentDate', new Date(e.target.value))}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="factors" className="space-y-6">
          {/* Market Factors */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Fatores de Mercado</CardTitle>
                <Dialog open={isAddingFactor} onOpenChange={setIsAddingFactor}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Fator
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Novo Fator de Mercado</DialogTitle>
                    </DialogHeader>
                    <MarketFactorForm
                      factor={newFactor}
                      onFieldChange={(field, value) => setNewFactor(prev => ({ ...prev, [field]: value }))}
                      onSubmit={handleAddMarketFactor}
                      onCancel={() => {
                        setIsAddingFactor(false);
                        setNewFactor({
                          name: '',
                          impact: 0,
                          description: '',
                          category: 'economic',
                          probability: 0.5
                        });
                      }}
                      submitLabel="Adicionar Fator"
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {localData.marketFactors.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum fator de mercado configurado</p>
                  <p className="text-sm text-muted-foreground">
                    Adicione fatores que podem impactar o projeto
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {localData.marketFactors.map((factor, index) => (
                    <MarketFactorCard
                      key={index}
                      factor={factor}
                      onEdit={() => handleEditMarketFactor(factor)}
                      onRemove={() => handleRemoveMarketFactor(factor.name)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Market Factor Dialog */}
          <Dialog open={!!editingFactor} onOpenChange={(open) => !open && setEditingFactor(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Editar Fator: {editingFactor?.name}</DialogTitle>
              </DialogHeader>
              <MarketFactorForm
                factor={newFactor}
                onFieldChange={(field, value) => setNewFactor(prev => ({ ...prev, [field]: value }))}
                onSubmit={handleUpdateMarketFactor}
                onCancel={() => {
                  setEditingFactor(null);
                  setNewFactor({
                    name: '',
                    impact: 0,
                    description: '',
                    category: 'economic',
                    probability: 0.5
                  });
                }}
                submitLabel="Atualizar Fator"
              />
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          {/* Scenarios */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Cenários de Análise</CardTitle>
                <Dialog open={isAddingScenario} onOpenChange={setIsAddingScenario}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Cenário
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Novo Cenário</DialogTitle>
                    </DialogHeader>
                    <ScenarioForm
                      scenario={newScenario}
                      onFieldChange={(field, value) => setNewScenario(prev => ({ ...prev, [field]: value }))}
                      onAddAdjustment={addScenarioAdjustment}
                      onUpdateAdjustment={updateScenarioAdjustment}
                      onRemoveAdjustment={removeScenarioAdjustment}
                      onSubmit={handleAddScenario}
                      onCancel={() => {
                        setIsAddingScenario(false);
                        setNewScenario({
                          name: '',
                          description: '',
                          probability: 0.33,
                          adjustments: []
                        });
                      }}
                      submitLabel="Adicionar Cenário"
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {localData.scenarios.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum cenário configurado</p>
                  <p className="text-sm text-muted-foreground">
                    Crie cenários para análise de diferentes situações
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {localData.scenarios.map((scenario, index) => (
                    <ScenarioCard
                      key={index}
                      scenario={scenario}
                      onEdit={() => handleEditScenario(scenario)}
                      onRemove={() => handleRemoveScenario(scenario.name)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Scenario Dialog */}
          <Dialog open={!!editingScenario} onOpenChange={(open) => !open && setEditingScenario(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Cenário: {editingScenario?.name}</DialogTitle>
              </DialogHeader>
              <ScenarioForm
                scenario={newScenario}
                onFieldChange={(field, value) => setNewScenario(prev => ({ ...prev, [field]: value }))}
                onAddAdjustment={addScenarioAdjustment}
                onUpdateAdjustment={updateScenarioAdjustment}
                onRemoveAdjustment={removeScenarioAdjustment}
                onSubmit={handleUpdateScenario}
                onCancel={() => {
                  setEditingScenario(null);
                  setNewScenario({
                    name: '',
                    description: '',
                    probability: 0.33,
                    adjustments: []
                  });
                }}
                submitLabel="Atualizar Cenário"
              />
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>

      {/* Impact Analysis */}
      {impactAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="h-5 w-5" />
              <span>Análise de Impacto das Variáveis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Impacto da Inflação</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(impactAnalysis.inflationImpact)}
                </p>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatPercentage(localData.inflation.annualRate)} ao ano
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Impacto Salarial</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(impactAnalysis.salaryImpact)}
                </p>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatPercentage(localData.salaryAdjustments.annualAdjustment)} reajuste
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Fatores de Mercado</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(impactAnalysis.totalMarketFactorImpact)}
                </p>
                <div className="text-xs text-muted-foreground mt-1">
                  {localData.marketFactors.length} fator(es)
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Impacto Combinado</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(impactAnalysis.combinedImpact)}
                </p>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatPercentage((impactAnalysis.combinedImpact / 100000) * 100)} do valor base
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Risk Level and Alerts */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Nível de Risco:</span>
                  <Badge 
                    variant={
                      impactAnalysis.riskLevel === 'high' ? 'destructive' : 
                      impactAnalysis.riskLevel === 'medium' ? 'secondary' : 'default'
                    }
                  >
                    {impactAnalysis.riskLevel === 'high' ? 'Alto' : 
                     impactAnalysis.riskLevel === 'medium' ? 'Médio' : 'Baixo'}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Variação: {formatCurrency(impactAnalysis.weightedMarketFactorImpact)}
                </div>
              </div>

              {/* Significant Variation Alerts */}
              {impactAnalysis.riskLevel === 'high' && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Atenção:</strong> As variáveis de mercado indicam um impacto significativo no projeto. 
                    Recomenda-se revisar os fatores de risco e considerar estratégias de mitigação.
                  </AlertDescription>
                </Alert>
              )}

              {impactAnalysis.riskLevel === 'medium' && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Moderado:</strong> As variáveis apresentam impacto moderado. 
                    Monitore as condições de mercado e ajuste as projeções conforme necessário.
                  </AlertDescription>
                </Alert>
              )}

              {localData.inflation.annualRate > 8 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Inflação Elevada:</strong> A taxa de inflação de {formatPercentage(localData.inflation.annualRate)} 
                    está acima da meta. Considere ajustes mais frequentes nos preços.
                  </AlertDescription>
                </Alert>
              )}

              {localData.salaryAdjustments.annualAdjustment > localData.inflation.annualRate + 3 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Reajuste Salarial Alto:</strong> O reajuste salarial está significativamente 
                    acima da inflação. Verifique se está alinhado com a estratégia da empresa.
                  </AlertDescription>
                </Alert>
              )}

              {localData.marketFactors.some(f => Math.abs(f.impact) > 10) && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Fatores de Alto Impacto:</strong> Alguns fatores de mercado têm impacto superior a 10%. 
                    Revise estes fatores e considere planos de contingência.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Visual Impact Breakdown */}
            <div className="mt-6">
              <h4 className="font-medium mb-3">Distribuição do Impacto</h4>
              <div className="space-y-2">
                {/* Inflation Bar */}
                <div className="flex items-center space-x-3">
                  <div className="w-20 text-sm">Inflação</div>
                  <div className="flex-1 bg-muted rounded-full h-2 relative">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, Math.abs(impactAnalysis.inflationImpact / impactAnalysis.combinedImpact) * 100)}%` 
                      }}
                    />
                  </div>
                  <div className="w-24 text-sm text-right">
                    {formatCurrency(impactAnalysis.inflationImpact)}
                  </div>
                </div>

                {/* Salary Bar */}
                <div className="flex items-center space-x-3">
                  <div className="w-20 text-sm">Salários</div>
                  <div className="flex-1 bg-muted rounded-full h-2 relative">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, Math.abs(impactAnalysis.salaryImpact / impactAnalysis.combinedImpact) * 100)}%` 
                      }}
                    />
                  </div>
                  <div className="w-24 text-sm text-right">
                    {formatCurrency(impactAnalysis.salaryImpact)}
                  </div>
                </div>

                {/* Market Factors Bar */}
                <div className="flex items-center space-x-3">
                  <div className="w-20 text-sm">Mercado</div>
                  <div className="flex-1 bg-muted rounded-full h-2 relative">
                    <div 
                      className={cn(
                        "h-2 rounded-full",
                        impactAnalysis.totalMarketFactorImpact >= 0 ? "bg-purple-500" : "bg-red-500"
                      )}
                      style={{ 
                        width: `${Math.min(100, Math.abs(impactAnalysis.totalMarketFactorImpact / impactAnalysis.combinedImpact) * 100)}%` 
                      }}
                    />
                  </div>
                  <div className="w-24 text-sm text-right">
                    {formatCurrency(impactAnalysis.totalMarketFactorImpact)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scenario Comparison */}
      {scenarioComparison && scenarioComparison.scenarios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Comparação de Cenários</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Scenario Comparison Alerts */}
            {scenarioComparison.riskLevel === 'high' && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Alta Variabilidade:</strong> Os cenários apresentam grande variação 
                  (desvio padrão: {formatCurrency(scenarioComparison.standardDeviation)}). 
                  Considere estratégias de mitigação de risco.
                </AlertDescription>
              </Alert>
            )}

            {scenarioComparison.scenarios.some((s: any) => Math.abs(s.value - 100000) > 50000) && (
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Cenários Extremos:</strong> Alguns cenários apresentam variações superiores a 50% 
                  do valor base. Revise as premissas e probabilidades.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {scenarioComparison.scenarios.map((scenario: any, index: number) => {
                const baseValue = 100000;
                const variation = ((scenario.value - baseValue) / baseValue) * 100;
                const isExtreme = Math.abs(variation) > 25;
                
                return (
                  <div key={index} className={cn(
                    "p-4 rounded-lg border",
                    isExtreme ? "border-orange-200 bg-orange-50" : "bg-muted/50"
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{scenario.name}</span>
                        <Badge variant="outline">
                          {formatPercentage(scenario.probability * 100)} prob.
                        </Badge>
                        {isExtreme && (
                          <Badge variant="secondary" className="text-orange-600">
                            Extremo
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(scenario.value)}</div>
                        <div className={cn(
                          "text-sm font-medium",
                          variation > 0 ? "text-green-600" : variation < 0 ? "text-red-600" : "text-gray-600"
                        )}>
                          {variation > 0 ? '+' : ''}{variation.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    {/* Visual bar for scenario value */}
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                        <div 
                          className={cn(
                            "h-2 rounded-full",
                            variation > 10 ? "bg-green-500" : 
                            variation < -10 ? "bg-red-500" : "bg-blue-500"
                          )}
                          style={{ 
                            width: `${Math.min(100, Math.max(10, (scenario.value / Math.max(...scenarioComparison.scenarios.map((s: any) => s.value))) * 100))}%` 
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground w-20">
                        VE: {formatCurrency(scenario.expectedValue)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Valor Esperado</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(scenarioComparison.expectedValue)}
                </p>
                <div className="text-xs text-muted-foreground mt-1">
                  Média ponderada por probabilidade
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Desvio Padrão</p>
                <p className="text-xl font-bold text-purple-600">
                  {formatCurrency(scenarioComparison.standardDeviation)}
                </p>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatPercentage((scenarioComparison.standardDeviation / 100000) * 100)} do valor base
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Risco dos Cenários</p>
                <Badge 
                  variant={
                    scenarioComparison.riskLevel === 'high' ? 'destructive' : 
                    scenarioComparison.riskLevel === 'medium' ? 'secondary' : 'default'
                  }
                  className="text-lg"
                >
                  {scenarioComparison.riskLevel === 'high' ? 'Alto' : 
                   scenarioComparison.riskLevel === 'medium' ? 'Médio' : 'Baixo'}
                </Badge>
                <div className="text-xs text-muted-foreground mt-1">
                  Baseado na variabilidade
                </div>
              </div>
            </div>

            {/* Scenario Recommendations */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2 text-blue-900">Recomendações</h4>
              <div className="space-y-1 text-sm text-blue-800">
                {scenarioComparison.riskLevel === 'high' && (
                  <>
                    <div>• Considere criar um fundo de contingência para cobrir variações</div>
                    <div>• Revise as probabilidades dos cenários com especialistas</div>
                    <div>• Implemente monitoramento contínuo dos indicadores-chave</div>
                  </>
                )}
                {scenarioComparison.scenarios.length < 3 && (
                  <div>• Considere adicionar mais cenários para uma análise mais robusta</div>
                )}
                {scenarioComparison.scenarios.some((s: any) => s.probability > 0.6) && (
                  <div>• Verifique se algum cenário não está com probabilidade muito alta</div>
                )}
                <div>• Use o valor esperado ({formatCurrency(scenarioComparison.expectedValue)}) como base para planejamento</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Market Factor Card Component
interface MarketFactorCardProps {
  factor: MarketFactor;
  onEdit: () => void;
  onRemove: () => void;
}

function MarketFactorCard({ factor, onEdit, onRemove }: MarketFactorCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'economic':
        return <TrendingUp className="h-4 w-4" />;
      case 'technological':
        return <BarChart3 className="h-4 w-4" />;
      case 'regulatory':
        return <AlertTriangle className="h-4 w-4" />;
      case 'competitive':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories = [
      { value: 'economic', label: 'Econômico' },
      { value: 'technological', label: 'Tecnológico' },
      { value: 'regulatory', label: 'Regulatório' },
      { value: 'competitive', label: 'Competitivo' }
    ];
    return categories.find(c => c.value === category)?.label || category;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-lg">{factor.name}</h3>
              <Badge variant="secondary" className="flex items-center space-x-1">
                {getCategoryIcon(factor.category)}
                <span>{getCategoryLabel(factor.category)}</span>
              </Badge>
            </div>
            
            {factor.description && (
              <p className="text-sm text-muted-foreground mb-3">{factor.description}</p>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Impacto</p>
                <p className={cn(
                  "font-medium",
                  factor.impact > 0 ? "text-green-600" : factor.impact < 0 ? "text-red-600" : "text-gray-600"
                )}>
                  {factor.impact > 0 ? '+' : ''}{factor.impact.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Probabilidade</p>
                <p className="font-medium">{(factor.probability * 100).toFixed(0)}%</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
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

// Market Factor Form Component
interface MarketFactorFormProps {
  factor: Partial<MarketFactor>;
  onFieldChange: (field: string, value: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
}

function MarketFactorForm({ factor, onFieldChange, onSubmit, onCancel, submitLabel }: MarketFactorFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="factor-name">Nome do Fator *</Label>
        <Input
          id="factor-name"
          value={factor.name || ''}
          onChange={(e) => onFieldChange('name', e.target.value)}
          placeholder="Ex: Aumento do dólar"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="factor-category">Categoria</Label>
        <Select
          value={factor.category || 'economic'}
          onValueChange={(value) => onFieldChange('category', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="economic">Econômico</SelectItem>
            <SelectItem value="technological">Tecnológico</SelectItem>
            <SelectItem value="regulatory">Regulatório</SelectItem>
            <SelectItem value="competitive">Competitivo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="factor-impact">Impacto (%)</Label>
        <Input
          id="factor-impact"
          type="number"
          step="0.01"
          value={factor.impact || 0}
          onChange={(e) => onFieldChange('impact', parseFloat(e.target.value) || 0)}
          placeholder="Ex: 5.5 (positivo) ou -3.2 (negativo)"
        />
        <p className="text-xs text-muted-foreground">
          Valores positivos aumentam custos, negativos reduzem
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="factor-probability">
          Probabilidade: {((factor.probability || 0.5) * 100).toFixed(0)}%
        </Label>
        <Slider
          id="factor-probability"
          min={0}
          max={1}
          step={0.01}
          value={[factor.probability || 0.5]}
          onValueChange={(value) => onFieldChange('probability', value[0])}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="factor-description">Descrição</Label>
        <Textarea
          id="factor-description"
          value={factor.description || ''}
          onChange={(e) => onFieldChange('description', e.target.value)}
          placeholder="Descreva o fator e seu possível impacto"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={onSubmit} disabled={!factor.name}>
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}

// Scenario Card Component
interface ScenarioCardProps {
  scenario: ScenarioConfig;
  onEdit: () => void;
  onRemove: () => void;
}

function ScenarioCard({ scenario, onEdit, onRemove }: ScenarioCardProps) {
  const getScenarioCategoryLabel = (category: string) => {
    const categories = [
      { value: 'salary', label: 'Salários' },
      { value: 'costs', label: 'Custos' },
      { value: 'revenue', label: 'Receita' },
      { value: 'taxes', label: 'Impostos' }
    ];
    return categories.find(c => c.value === category)?.label || category;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-lg">{scenario.name}</h3>
              <Badge variant="outline">
                Probabilidade: {(scenario.probability * 100).toFixed(0)}%
              </Badge>
            </div>
            
            {scenario.description && (
              <p className="text-sm text-muted-foreground mb-3">{scenario.description}</p>
            )}
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Ajustes:</p>
              {scenario.adjustments.map((adjustment, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <Badge variant="secondary" className="text-xs">
                    {getScenarioCategoryLabel(adjustment.category)}
                  </Badge>
                  <span className={cn(
                    "font-medium",
                    adjustment.adjustment > 0 ? "text-green-600" : adjustment.adjustment < 0 ? "text-red-600" : "text-gray-600"
                  )}>
                    {adjustment.adjustment > 0 ? '+' : ''}{adjustment.adjustment.toFixed(2)}%
                  </span>
                  {adjustment.reason && (
                    <span className="text-muted-foreground">- {adjustment.reason}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
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

// Scenario Form Component
interface ScenarioFormProps {
  scenario: Partial<ScenarioConfig>;
  onFieldChange: (field: string, value: any) => void;
  onAddAdjustment: () => void;
  onUpdateAdjustment: (index: number, field: keyof ScenarioAdjustment, value: any) => void;
  onRemoveAdjustment: (index: number) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
}

function ScenarioForm({ 
  scenario, 
  onFieldChange, 
  onAddAdjustment, 
  onUpdateAdjustment, 
  onRemoveAdjustment, 
  onSubmit, 
  onCancel, 
  submitLabel 
}: ScenarioFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="scenario-name">Nome do Cenário *</Label>
        <Input
          id="scenario-name"
          value={scenario.name || ''}
          onChange={(e) => onFieldChange('name', e.target.value)}
          placeholder="Ex: Cenário Otimista"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="scenario-probability">
          Probabilidade: {((scenario.probability || 0.33) * 100).toFixed(0)}%
        </Label>
        <Slider
          id="scenario-probability"
          min={0}
          max={1}
          step={0.01}
          value={[scenario.probability || 0.33]}
          onValueChange={(value) => onFieldChange('probability', value[0])}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="scenario-description">Descrição</Label>
        <Textarea
          id="scenario-description"
          value={scenario.description || ''}
          onChange={(e) => onFieldChange('description', e.target.value)}
          placeholder="Descreva o cenário"
          rows={3}
        />
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Ajustes do Cenário</Label>
          <Button type="button" variant="outline" size="sm" onClick={onAddAdjustment}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Ajuste
          </Button>
        </div>

        {scenario.adjustments && scenario.adjustments.length > 0 ? (
          <div className="space-y-3">
            {scenario.adjustments.map((adjustment, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select
                        value={adjustment.category}
                        onValueChange={(value) => onUpdateAdjustment(index, 'category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="salary">Salários</SelectItem>
                          <SelectItem value="costs">Custos</SelectItem>
                          <SelectItem value="revenue">Receita</SelectItem>
                          <SelectItem value="taxes">Impostos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Ajuste (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={adjustment.adjustment}
                        onChange={(e) => onUpdateAdjustment(index, 'adjustment', parseFloat(e.target.value) || 0)}
                        placeholder="Ex: 5.5 ou -3.2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Motivo</Label>
                      <div className="flex space-x-2">
                        <Input
                          value={adjustment.reason}
                          onChange={(e) => onUpdateAdjustment(index, 'reason', e.target.value)}
                          placeholder="Motivo do ajuste"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveAdjustment(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            Nenhum ajuste configurado. Clique em "Adicionar Ajuste" para começar.
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          onClick={onSubmit} 
          disabled={!scenario.name || !scenario.adjustments || scenario.adjustments.length === 0}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}