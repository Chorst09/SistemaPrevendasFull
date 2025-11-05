'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Save, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Calculator,
  FileText,
  History,
  GitBranch,
  Zap,
  BarChart3
} from 'lucide-react';

import { 
  NegotiationScenario,
  NegotiationAdjustment,
  NegotiationResult,
  ScenarioComparison,
  ComparisonMetric,
  ServiceDeskData,
  ValidationResult
} from '@/lib/types/service-desk-pricing';
import { ServiceDeskCalculationEngine } from '@/lib/services/service-desk-calculation-engine';
import { 
  NegotiationVersionService, 
  NegotiationVersion, 
  VersionComparison 
} from '@/lib/services/negotiation-version-service';

export interface NegotiationTabModuleProps {
  data: NegotiationScenario[];
  onUpdate: (data: NegotiationScenario[]) => void;
  onAutoSave: (data: NegotiationScenario[]) => void;
  validation?: ValidationResult;
  isLoading?: boolean;
  // Additional props for calculations
  fullData?: ServiceDeskData;
}

const ADJUSTMENT_CATEGORIES = [
  { value: 'price', label: 'Preço' },
  { value: 'terms', label: 'Condições' },
  { value: 'scope', label: 'Escopo' },
  { value: 'timeline', label: 'Prazo' }
];

const CHART_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', 
  '#ff00ff', '#00ffff', '#ff0000', '#0000ff', '#ffff00'
];

export function NegotiationTabModule({
  data,
  onUpdate,
  onAutoSave,
  validation,
  isLoading = false,
  fullData
}: NegotiationTabModuleProps) {
  const [activeTab, setActiveTab] = useState('scenarios');
  const [scenarios, setScenarios] = useState<NegotiationScenario[]>(data || []);
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [isCreatingScenario, setIsCreatingScenario] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [newScenarioDescription, setNewScenarioDescription] = useState('');
  const [scenarioVersions, setScenarioVersions] = useState<Record<string, NegotiationVersion[]>>({});
  const [versionComparison, setVersionComparison] = useState<VersionComparison | null>(null);
  const [showVersionComparison, setShowVersionComparison] = useState(false);

  const calculationEngine = useMemo(() => new ServiceDeskCalculationEngine(), []);

  // Initialize base scenario if none exists
  useEffect(() => {
    if (scenarios.length === 0 && fullData) {
      createBaseScenario();
    }
  }, [fullData]);

  // Load versions for all scenarios
  useEffect(() => {
    const loadVersions = async () => {
      const versionsMap: Record<string, NegotiationVersion[]> = {};
      
      for (const scenario of scenarios) {
        const versions = await NegotiationVersionService.getVersions(scenario.id);
        versionsMap[scenario.id] = versions;
      }
      
      setScenarioVersions(versionsMap);
    };

    if (scenarios.length > 0) {
      loadVersions();
    }
  }, [scenarios]);

  // Auto-save scenarios when they change
  useEffect(() => {
    if (scenarios.length > 0) {
      onAutoSave(scenarios);
    }
  }, [scenarios, onAutoSave]);

  const createBaseScenario = useCallback(() => {
    if (!fullData) return;

    const baseScenario: NegotiationScenario = {
      id: 'base-scenario',
      name: 'Cenário Base',
      description: 'Cenário original baseado nos dados do projeto',
      baseScenario: true,
      adjustments: [],
      results: calculateScenarioResults(fullData, []),
      createdAt: new Date(),
      version: 1
    };

    setScenarios([baseScenario]);
    setSelectedScenario(baseScenario.id);
    onUpdate([baseScenario]);
  }, [fullData, onUpdate]);

  const calculateScenarioResults = useCallback((
    projectData: ServiceDeskData, 
    adjustments: NegotiationAdjustment[]
  ): NegotiationResult => {
    if (!projectData) {
      return {
        totalPrice: 0,
        totalCost: 0,
        profit: 0,
        margin: 0,
        roi: 0,
        payback: 0,
        riskLevel: 'medium'
      };
    }

    // Clone project data to apply adjustments
    const adjustedData = JSON.parse(JSON.stringify(projectData));
    
    // Apply adjustments
    adjustments.forEach(adjustment => {
      applyAdjustment(adjustedData, adjustment);
    });

    // Calculate results
    const teamCosts = calculationEngine.calculateTeamCosts(adjustedData.team, adjustedData.schedules);
    const taxes = calculationEngine.calculateTaxes(adjustedData.budget.totalPrice, adjustedData.taxes);
    const margins = calculationEngine.calculateMargins(
      teamCosts.totalMonthlyCost,
      adjustedData.budget.margin,
      adjustedData.otherCosts
    );

    const totalCost = teamCosts.totalMonthlyCost * 12 + taxes.totalTaxes;
    const profit = margins.totalPrice - totalCost;
    const margin = margins.totalPrice > 0 ? (profit / margins.totalPrice) * 100 : 0;
    
    const roi = calculationEngine.calculateROI(
      totalCost * 0.2, // Simplified investment calculation
      Array(12).fill(profit / 12)
    );

    const payback = calculationEngine.calculatePayback(
      totalCost * 0.2,
      Array(12).fill(profit / 12)
    );

    // Determine risk level based on margin
    let riskLevel: 'low' | 'medium' | 'high' = 'medium';
    if (margin < 10) riskLevel = 'high';
    else if (margin > 25) riskLevel = 'low';

    return {
      totalPrice: margins.totalPrice,
      totalCost,
      profit,
      margin,
      roi: roi.roi,
      payback: payback.simplePayback,
      riskLevel
    };
  }, [calculationEngine]);

  const applyAdjustment = (data: ServiceDeskData, adjustment: NegotiationAdjustment) => {
    switch (adjustment.category) {
      case 'price':
        if (adjustment.field === 'totalPrice') {
          data.budget.totalPrice = adjustment.adjustedValue;
        } else if (adjustment.field === 'margin') {
          data.budget.margin.value = adjustment.adjustedValue;
        }
        break;
      case 'terms':
        if (adjustment.field === 'contractPeriod') {
          data.project.contractPeriod.durationMonths = adjustment.adjustedValue;
        }
        break;
      case 'scope':
        if (adjustment.field === 'teamSize') {
          // Adjust team size (simplified)
          const currentSize = data.team.length;
          const targetSize = adjustment.adjustedValue;
          if (targetSize < currentSize) {
            data.team = data.team.slice(0, targetSize);
          }
        }
        break;
      case 'timeline':
        if (adjustment.field === 'startDate') {
          data.project.contractPeriod.startDate = new Date(adjustment.adjustedValue);
        }
        break;
    }
  };

  const createNewScenario = useCallback(() => {
    if (!newScenarioName.trim() || !fullData) return;

    const newScenario: NegotiationScenario = {
      id: `scenario-${Date.now()}`,
      name: newScenarioName,
      description: newScenarioDescription,
      baseScenario: false,
      adjustments: [],
      results: calculateScenarioResults(fullData, []),
      createdAt: new Date(),
      version: 1
    };

    const updatedScenarios = [...scenarios, newScenario];
    setScenarios(updatedScenarios);
    setSelectedScenario(newScenario.id);
    setIsCreatingScenario(false);
    setNewScenarioName('');
    setNewScenarioDescription('');
    onUpdate(updatedScenarios);
  }, [newScenarioName, newScenarioDescription, fullData, scenarios, calculateScenarioResults, onUpdate]);

  const duplicateScenario = useCallback((scenarioId: string) => {
    const originalScenario = scenarios.find(s => s.id === scenarioId);
    if (!originalScenario) return;

    const duplicatedScenario: NegotiationScenario = {
      ...originalScenario,
      id: `scenario-${Date.now()}`,
      name: `${originalScenario.name} (Cópia)`,
      baseScenario: false,
      createdAt: new Date(),
      version: 1
    };

    const updatedScenarios = [...scenarios, duplicatedScenario];
    setScenarios(updatedScenarios);
    setSelectedScenario(duplicatedScenario.id);
    onUpdate(updatedScenarios);
  }, [scenarios, onUpdate]);

  const deleteScenario = useCallback((scenarioId: string) => {
    if (scenarios.find(s => s.id === scenarioId)?.baseScenario) {
      alert('Não é possível excluir o cenário base');
      return;
    }

    const updatedScenarios = scenarios.filter(s => s.id !== scenarioId);
    setScenarios(updatedScenarios);
    
    if (selectedScenario === scenarioId) {
      setSelectedScenario(updatedScenarios[0]?.id || '');
    }
    
    onUpdate(updatedScenarios);
  }, [scenarios, selectedScenario, onUpdate]);

  const addAdjustment = useCallback((scenarioId: string) => {
    const newAdjustment: NegotiationAdjustment = {
      category: 'price',
      field: 'totalPrice',
      originalValue: fullData?.budget.totalPrice || 0,
      adjustedValue: fullData?.budget.totalPrice || 0,
      impact: 0,
      reason: ''
    };

    const updatedScenarios = scenarios.map(scenario => {
      if (scenario.id === scenarioId) {
        const updatedAdjustments = [...scenario.adjustments, newAdjustment];
        return {
          ...scenario,
          adjustments: updatedAdjustments,
          results: calculateScenarioResults(fullData!, updatedAdjustments)
        };
      }
      return scenario;
    });

    setScenarios(updatedScenarios);
    onUpdate(updatedScenarios);
  }, [scenarios, fullData, calculateScenarioResults, onUpdate]);

  const updateAdjustment = useCallback((
    scenarioId: string, 
    adjustmentIndex: number, 
    field: keyof NegotiationAdjustment, 
    value: any
  ) => {
    const updatedScenarios = scenarios.map(scenario => {
      if (scenario.id === scenarioId) {
        const updatedAdjustments = scenario.adjustments.map((adj, index) => {
          if (index === adjustmentIndex) {
            const updatedAdjustment = { ...adj, [field]: value };
            
            // Calculate impact
            if (field === 'adjustedValue' && adj.originalValue !== 0) {
              updatedAdjustment.impact = ((value - adj.originalValue) / adj.originalValue) * 100;
            }
            
            return updatedAdjustment;
          }
          return adj;
        });

        return {
          ...scenario,
          adjustments: updatedAdjustments,
          results: calculateScenarioResults(fullData!, updatedAdjustments)
        };
      }
      return scenario;
    });

    setScenarios(updatedScenarios);
    onAutoSave(updatedScenarios);
  }, [scenarios, fullData, calculateScenarioResults, onAutoSave]);

  const removeAdjustment = useCallback((scenarioId: string, adjustmentIndex: number) => {
    const updatedScenarios = scenarios.map(scenario => {
      if (scenario.id === scenarioId) {
        const updatedAdjustments = scenario.adjustments.filter((_, index) => index !== adjustmentIndex);
        return {
          ...scenario,
          adjustments: updatedAdjustments,
          results: calculateScenarioResults(fullData!, updatedAdjustments)
        };
      }
      return scenario;
    });

    setScenarios(updatedScenarios);
    onUpdate(updatedScenarios);
  }, [scenarios, fullData, calculateScenarioResults, onUpdate]);

  const saveScenarioVersion = useCallback(async (scenarioId: string, changeDescription?: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) return;

    try {
      // Create auto backup before major changes
      await NegotiationVersionService.createAutoBackup(scenario, 'major_adjustment');
      
      // Save new version
      const newVersion = await NegotiationVersionService.saveVersion(
        scenario,
        changeDescription || 'Versão salva manualmente',
        'user'
      );

      // Update local state
      const updatedScenarios = scenarios.map(s => 
        s.id === scenarioId ? newVersion.data : s
      );

      setScenarios(updatedScenarios);
      onUpdate(updatedScenarios);

      // Reload versions
      const versions = await NegotiationVersionService.getVersions(scenarioId);
      setScenarioVersions(prev => ({
        ...prev,
        [scenarioId]: versions
      }));

      alert('Versão salva com sucesso!');
    } catch (error) {
      console.error('Error saving version:', error);
      alert('Erro ao salvar versão. Tente novamente.');
    }
  }, [scenarios, onUpdate]);

  const rollbackToVersion = useCallback(async (scenarioId: string, targetVersion: number) => {
    try {
      const rolledBackScenario = await NegotiationVersionService.rollbackToVersion(
        scenarioId,
        targetVersion,
        true // Create backup
      );

      const updatedScenarios = scenarios.map(s => 
        s.id === scenarioId ? rolledBackScenario : s
      );

      setScenarios(updatedScenarios);
      onUpdate(updatedScenarios);
      setShowVersionHistory(false);

      // Reload versions
      const versions = await NegotiationVersionService.getVersions(scenarioId);
      setScenarioVersions(prev => ({
        ...prev,
        [scenarioId]: versions
      }));

      alert(`Rollback para versão ${targetVersion} realizado com sucesso!`);
    } catch (error) {
      console.error('Error during rollback:', error);
      alert('Erro durante rollback. Tente novamente.');
    }
  }, [scenarios, onUpdate]);

  const compareVersions = useCallback(async (scenarioId: string, fromVersion: number, toVersion: number) => {
    try {
      const versions = scenarioVersions[scenarioId] || [];
      const fromVersionData = versions.find(v => v.version === fromVersion);
      const toVersionData = versions.find(v => v.version === toVersion);

      if (!fromVersionData || !toVersionData) {
        alert('Versões não encontradas para comparação');
        return;
      }

      const comparison = NegotiationVersionService.compareVersions(fromVersionData, toVersionData);
      setVersionComparison(comparison);
      setShowVersionComparison(true);
    } catch (error) {
      console.error('Error comparing versions:', error);
      alert('Erro ao comparar versões. Tente novamente.');
    }
  }, [scenarioVersions]);

  const generateComparison = useCallback((): ScenarioComparison => {
    const selectedScenarios = scenarios.filter(s => s.id === selectedScenario || s.baseScenario);
    
    const metrics: ComparisonMetric[] = [
      {
        name: 'Preço Total',
        values: selectedScenarios.map(s => s.results.totalPrice),
        unit: 'R$',
        higherIsBetter: true
      },
      {
        name: 'Custo Total',
        values: selectedScenarios.map(s => s.results.totalCost),
        unit: 'R$',
        higherIsBetter: false
      },
      {
        name: 'Lucro',
        values: selectedScenarios.map(s => s.results.profit),
        unit: 'R$',
        higherIsBetter: true
      },
      {
        name: 'Margem',
        values: selectedScenarios.map(s => s.results.margin),
        unit: '%',
        higherIsBetter: true
      },
      {
        name: 'ROI',
        values: selectedScenarios.map(s => s.results.roi),
        unit: '%',
        higherIsBetter: true
      },
      {
        name: 'Payback',
        values: selectedScenarios.map(s => s.results.payback),
        unit: 'meses',
        higherIsBetter: false
      }
    ];

    // Generate recommendation
    const baseScenario = selectedScenarios.find(s => s.baseScenario);
    const currentScenario = selectedScenarios.find(s => s.id === selectedScenario);
    
    let recommendation = 'Análise dos cenários concluída.';
    if (baseScenario && currentScenario && !currentScenario.baseScenario) {
      const profitDiff = currentScenario.results.profit - baseScenario.results.profit;
      const marginDiff = currentScenario.results.margin - baseScenario.results.margin;
      
      if (profitDiff > 0 && marginDiff > 0) {
        recommendation = 'Cenário recomendado: melhora tanto o lucro quanto a margem.';
      } else if (profitDiff > 0) {
        recommendation = 'Cenário com maior lucro, mas considere o impacto na margem.';
      } else if (marginDiff > 0) {
        recommendation = 'Cenário com melhor margem, mas menor lucro absoluto.';
      } else {
        recommendation = 'Cenário menos favorável que o base. Revisar ajustes.';
      }
    }

    return {
      scenarios: selectedScenarios.map(s => s.id),
      metrics,
      recommendation
    };
  }, [scenarios, selectedScenario]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const getRiskColor = (risk: 'low' | 'medium' | 'high'): string => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-red-600'
    };
    return colors[risk];
  };

  const getRiskBadgeVariant = (risk: 'low' | 'medium' | 'high') => {
    const variants = {
      low: 'default',
      medium: 'secondary',
      high: 'destructive'
    } as const;
    return variants[risk];
  };

  const currentScenario = scenarios.find(s => s.id === selectedScenario);
  const comparison = generateComparison();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Simulador de Negociação</h2>
          <p className="text-muted-foreground">
            Crie e compare diferentes cenários de negociação
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsCreatingScenario(true)}
            disabled={isLoading || !fullData}
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Cenário
          </Button>
          
          {currentScenario && !currentScenario.baseScenario && (
            <>
              <Button
                onClick={() => {
                  const description = prompt('Descreva as alterações desta versão (opcional):');
                  saveScenarioVersion(currentScenario.id, description || undefined);
                }}
                disabled={isLoading}
                variant="outline"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Versão
              </Button>
              
              <Button
                onClick={() => setShowVersionHistory(true)}
                disabled={isLoading}
                variant="outline"
              >
                <History className="w-4 h-4 mr-2" />
                Histórico
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Validation Alerts */}
      {validation && validation.errors.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Alguns dados necessários para simulação estão incompletos. 
            Verifique as abas anteriores.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scenarios">Cenários</TabsTrigger>
          <TabsTrigger value="adjustments">Ajustes</TabsTrigger>
          <TabsTrigger value="comparison">Comparação</TabsTrigger>
        </TabsList>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scenario List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GitBranch className="w-4 h-4 mr-2" />
                  Cenários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {scenarios.map((scenario) => (
                    <div
                      key={scenario.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        selectedScenario === scenario.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedScenario(scenario.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{scenario.name}</h4>
                          {scenario.baseScenario && (
                            <Badge variant="outline" className="mt-1">Base</Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateScenario(scenario.id);
                            }}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          {!scenario.baseScenario && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteScenario(scenario.id);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {scenario.description}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        {scenario.adjustments.length} ajuste(s) • v{scenario.version}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Scenario Results */}
            {currentScenario && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{currentScenario.name}</span>
                    <Badge variant={getRiskBadgeVariant(currentScenario.results.riskLevel)}>
                      Risco {currentScenario.results.riskLevel.toUpperCase()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Preço Total</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(currentScenario.results.totalPrice)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Custo Total</p>
                      <p className="text-xl font-bold text-red-600">
                        {formatCurrency(currentScenario.results.totalCost)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Lucro</p>
                      <p className="text-xl font-bold">
                        {formatCurrency(currentScenario.results.profit)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Margem</p>
                      <p className="text-xl font-bold">
                        {formatPercentage(currentScenario.results.margin)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">ROI</p>
                      <p className="text-xl font-bold">
                        {formatPercentage(currentScenario.results.roi)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Payback</p>
                      <p className="text-xl font-bold">
                        {currentScenario.results.payback} meses
                      </p>
                    </div>
                  </div>

                  {currentScenario.description && (
                    <div className="border-t pt-4">
                      <p className="text-sm text-muted-foreground">
                        {currentScenario.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Adjustments Tab */}
        <TabsContent value="adjustments" className="space-y-6">
          {currentScenario ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Ajustes - {currentScenario.name}</span>
                  <Button
                    onClick={() => addAdjustment(currentScenario.id)}
                    disabled={currentScenario.baseScenario}
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Ajuste
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentScenario.baseScenario ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      O cenário base não pode ser editado. Crie um novo cenário ou duplique este para fazer ajustes.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {currentScenario.adjustments.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum ajuste configurado</p>
                        <p className="text-sm">Clique em "Adicionar Ajuste" para começar</p>
                      </div>
                    ) : (
                      currentScenario.adjustments.map((adjustment, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div>
                              <Label htmlFor={`category-${index}`}>Categoria</Label>
                              <Select
                                value={adjustment.category}
                                onValueChange={(value) => 
                                  updateAdjustment(currentScenario.id, index, 'category', value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {ADJUSTMENT_CATEGORIES.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                      {cat.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor={`field-${index}`}>Campo</Label>
                              <Input
                                id={`field-${index}`}
                                value={adjustment.field}
                                onChange={(e) => 
                                  updateAdjustment(currentScenario.id, index, 'field', e.target.value)
                                }
                                placeholder="Ex: totalPrice, margin"
                              />
                            </div>

                            <div>
                              <Label htmlFor={`original-${index}`}>Valor Original</Label>
                              <Input
                                id={`original-${index}`}
                                type="number"
                                value={adjustment.originalValue}
                                onChange={(e) => 
                                  updateAdjustment(currentScenario.id, index, 'originalValue', parseFloat(e.target.value) || 0)
                                }
                              />
                            </div>

                            <div>
                              <Label htmlFor={`adjusted-${index}`}>Valor Ajustado</Label>
                              <Input
                                id={`adjusted-${index}`}
                                type="number"
                                value={adjustment.adjustedValue}
                                onChange={(e) => 
                                  updateAdjustment(currentScenario.id, index, 'adjustedValue', parseFloat(e.target.value) || 0)
                                }
                              />
                            </div>
                          </div>

                          <div className="mb-4">
                            <Label htmlFor={`reason-${index}`}>Justificativa</Label>
                            <Textarea
                              id={`reason-${index}`}
                              value={adjustment.reason}
                              onChange={(e) => 
                                updateAdjustment(currentScenario.id, index, 'reason', e.target.value)
                              }
                              placeholder="Explique o motivo deste ajuste..."
                              rows={2}
                            />
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-muted-foreground">
                                Impacto: 
                                <span className={`ml-1 font-medium ${
                                  adjustment.impact > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {adjustment.impact > 0 ? '+' : ''}{formatPercentage(adjustment.impact)}
                                </span>
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeAdjustment(currentScenario.id, index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Selecione um cenário para visualizar e editar os ajustes.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Comparação de Cenários
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scenarios.length < 2 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Crie pelo menos 2 cenários para comparar</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Comparison Chart */}
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparison.metrics}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name, props) => {
                            const metric = comparison.metrics.find(m => m.name === props.payload.name);
                            if (metric?.unit === 'R$') {
                              return formatCurrency(Number(value));
                            } else if (metric?.unit === '%') {
                              return formatPercentage(Number(value));
                            }
                            return `${value} ${metric?.unit || ''}`;
                          }}
                        />
                        <Legend />
                        {comparison.scenarios.map((scenarioId, index) => {
                          const scenario = scenarios.find(s => s.id === scenarioId);
                          return (
                            <Bar
                              key={scenarioId}
                              dataKey={`values[${index}]`}
                              name={scenario?.name || 'Cenário'}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                          );
                        })}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Metrics Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">Métrica</th>
                          {comparison.scenarios.map(scenarioId => {
                            const scenario = scenarios.find(s => s.id === scenarioId);
                            return (
                              <th key={scenarioId} className="px-4 py-2 text-center">
                                {scenario?.name}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {comparison.metrics.map((metric, index) => (
                          <tr key={metric.name} className={index % 2 === 0 ? 'bg-gray-25' : ''}>
                            <td className="px-4 py-2 font-medium">{metric.name}</td>
                            {metric.values.map((value, valueIndex) => (
                              <td key={valueIndex} className="px-4 py-2 text-center">
                                {metric.unit === 'R$' ? formatCurrency(value) :
                                 metric.unit === '%' ? formatPercentage(value) :
                                 `${value} ${metric.unit}`}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Recommendation */}
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Recomendação:</strong> {comparison.recommendation}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Scenario Dialog */}
      {isCreatingScenario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Novo Cenário</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCreatingScenario(false)}
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="scenario-name">Nome do Cenário</Label>
                <Input
                  id="scenario-name"
                  value={newScenarioName}
                  onChange={(e) => setNewScenarioName(e.target.value)}
                  placeholder="Ex: Negociação Cliente A"
                />
              </div>

              <div>
                <Label htmlFor="scenario-description">Descrição</Label>
                <Textarea
                  id="scenario-description"
                  value={newScenarioDescription}
                  onChange={(e) => setNewScenarioDescription(e.target.value)}
                  placeholder="Descreva o objetivo deste cenário..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsCreatingScenario(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={createNewScenario}
                  disabled={!newScenarioName.trim()}
                >
                  Criar Cenário
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Version History Dialog */}
      {showVersionHistory && currentScenario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Histórico de Versões - {currentScenario.name}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVersionHistory(false)}
              >
                ×
              </Button>
            </div>

            <div className="space-y-3">
              {/* Current Version */}
              <div className="border rounded-lg p-4 bg-blue-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">Versão {currentScenario.version} (Atual)</h4>
                    <p className="text-sm text-muted-foreground">
                      {currentScenario.createdAt.toLocaleString()}
                    </p>
                    <p className="text-sm mt-1">
                      {currentScenario.adjustments.length} ajuste(s)
                    </p>
                  </div>
                  <Badge variant="default">Atual</Badge>
                </div>
              </div>

              {/* Previous Versions */}
              {scenarioVersions[currentScenario.id]?.map((version, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">Versão {version.version}</h4>
                        {version.tags && version.tags.length > 0 && (
                          <div className="flex gap-1">
                            {version.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {version.createdAt.toLocaleString()}
                        {version.createdBy && ` • por ${version.createdBy}`}
                      </p>
                      {version.changeDescription && (
                        <p className="text-sm mt-1 text-gray-600">
                          {version.changeDescription}
                        </p>
                      )}
                      <p className="text-sm mt-1">
                        {version.data.adjustments.length} ajuste(s)
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => compareVersions(currentScenario.id, version.version, currentScenario.version)}
                        title="Comparar com versão atual"
                      >
                        <GitBranch className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rollbackToVersion(currentScenario.id, version.version)}
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Restaurar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {(!scenarioVersions[currentScenario.id] || scenarioVersions[currentScenario.id].length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma versão anterior encontrada</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={() => setShowVersionHistory(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Version Comparison Dialog */}
      {showVersionComparison && versionComparison && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Comparação de Versões: v{versionComparison.fromVersion.version} → v{versionComparison.toVersion.version}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVersionComparison(false)}
              >
                ×
              </Button>
            </div>

            <div className="space-y-6">
              {/* Version Info */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Versão {versionComparison.fromVersion.version}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">
                      {versionComparison.fromVersion.createdAt.toLocaleString()}
                    </p>
                    {versionComparison.fromVersion.changeDescription && (
                      <p className="text-sm mt-1">
                        {versionComparison.fromVersion.changeDescription}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Versão {versionComparison.toVersion.version}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">
                      {versionComparison.toVersion.createdAt.toLocaleString()}
                    </p>
                    {versionComparison.toVersion.changeDescription && (
                      <p className="text-sm mt-1">
                        {versionComparison.toVersion.changeDescription}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Changes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Alterações ({versionComparison.changes.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {versionComparison.changes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma alteração detectada entre as versões
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {versionComparison.changes.map((change, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-start gap-3">
                            <Badge 
                              variant={
                                change.type === 'added' ? 'default' :
                                change.type === 'removed' ? 'destructive' : 'secondary'
                              }
                              className="mt-0.5"
                            >
                              {change.type === 'added' ? 'Adicionado' :
                               change.type === 'removed' ? 'Removido' : 'Modificado'}
                            </Badge>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{change.field}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {change.description}
                              </p>
                              {change.oldValue !== undefined && change.newValue !== undefined && (
                                <div className="mt-2 text-xs">
                                  <div className="flex gap-4">
                                    <div>
                                      <span className="text-red-600">Antes:</span>
                                      <span className="ml-1 font-mono bg-red-50 px-1 rounded">
                                        {typeof change.oldValue === 'object' 
                                          ? JSON.stringify(change.oldValue, null, 2)
                                          : String(change.oldValue)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-green-600">Depois:</span>
                                      <span className="ml-1 font-mono bg-green-50 px-1 rounded">
                                        {typeof change.newValue === 'object' 
                                          ? JSON.stringify(change.newValue, null, 2)
                                          : String(change.newValue)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Results Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Comparação de Resultados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Versão {versionComparison.fromVersion.version}</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Preço Total:</span>
                          <span>{formatCurrency(versionComparison.fromVersion.data.results.totalPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Lucro:</span>
                          <span>{formatCurrency(versionComparison.fromVersion.data.results.profit)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Margem:</span>
                          <span>{formatPercentage(versionComparison.fromVersion.data.results.margin)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ROI:</span>
                          <span>{formatPercentage(versionComparison.fromVersion.data.results.roi)}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Versão {versionComparison.toVersion.version}</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Preço Total:</span>
                          <span>{formatCurrency(versionComparison.toVersion.data.results.totalPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Lucro:</span>
                          <span>{formatCurrency(versionComparison.toVersion.data.results.profit)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Margem:</span>
                          <span>{formatPercentage(versionComparison.toVersion.data.results.margin)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ROI:</span>
                          <span>{formatPercentage(versionComparison.toVersion.data.results.roi)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button onClick={() => setShowVersionComparison(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}