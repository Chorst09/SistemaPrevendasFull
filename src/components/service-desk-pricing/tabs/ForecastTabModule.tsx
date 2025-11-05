'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  AlertTriangle, 
  Target,
  Calendar,
  DollarSign,
  Users,
  Activity,
  Zap,
  Shield,
  Lightbulb
} from 'lucide-react';
import { 
  ForecastData, 
  ForecastScenario, 
  ScenarioType, 
  ProjectionTimeframe,
  MonthlyProjection,
  DashboardKPI,
  AlertSeverity,
  InsightPriority
} from '@/lib/types/service-desk-pricing';
import { ForecastService } from '@/lib/services/forecast-service';

export interface ForecastTabModuleProps {
  data: ForecastData;
  onUpdate: (data: ForecastData) => void;
  isLoading?: boolean;
}

export function ForecastTabModule({ data, onUpdate, isLoading = false }: ForecastTabModuleProps) {
  const [activeScenario, setActiveScenario] = useState<string>(
    data.scenarios.find(s => s.isBaseline)?.id || data.scenarios[0]?.id || ''
  );
  const [selectedTimeframe, setSelectedTimeframe] = useState<ProjectionTimeframe>(
    ProjectionTimeframe.MEDIUM_TERM
  );

  // Calcular projeções usando o serviço
  const calculateProjections = useCallback((scenario: ForecastScenario) => {
    const baseRevenue = 100000; // Base revenue from budget
    const baseCosts = 80000; // Base costs from budget
    const contractDuration = data.assumptions.contractDuration;
    
    return ForecastService.calculateMonthlyProjections(
      scenario,
      baseRevenue,
      baseCosts,
      contractDuration,
      data.assumptions.seasonalFactors
    );
  }, [data.assumptions.contractDuration, data.assumptions.seasonalFactors]);

  // Cenários padrão usando o serviço
  const defaultScenarios: ForecastScenario[] = useMemo(() => 
    ForecastService.generateDefaultScenarios(100000, 80000), []
  );

  // Inicializar cenários se não existirem
  React.useEffect(() => {
    if (data.scenarios.length === 0) {
      const updatedData = {
        ...data,
        scenarios: defaultScenarios.map(scenario => ({
          ...scenario,
          projections: calculateProjections(scenario)
        }))
      };
      onUpdate(updatedData);
    }
  }, [data, defaultScenarios, calculateProjections, onUpdate]);

  const currentScenario = data.scenarios.find(s => s.id === activeScenario);
  const projections = currentScenario?.projections || [];

  // KPIs do Dashboard usando o serviço
  const dashboardKPIs: DashboardKPI[] = useMemo(() => 
    ForecastService.calculateDashboardKPIs(projections), [projections]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                <span>Forecast Financeiro</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Projeções e análise de cenários para planejamento estratégico
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={selectedTimeframe} onValueChange={(value) => setSelectedTimeframe(value as ProjectionTimeframe)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ProjectionTimeframe.SHORT_TERM}>12 meses</SelectItem>
                  <SelectItem value={ProjectionTimeframe.MEDIUM_TERM}>24 meses</SelectItem>
                  <SelectItem value={ProjectionTimeframe.LONG_TERM}>36 meses</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="scenarios">Cenários</TabsTrigger>
          <TabsTrigger value="projections">Projeções</TabsTrigger>
          <TabsTrigger value="risks">Riscos</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardKPIs.map((kpi) => (
              <Card key={kpi.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{kpi.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-2xl font-bold">
                          {kpi.unit === 'R$' 
                            ? `R$ ${(kpi.value / 1000000).toFixed(1)}M`
                            : `${kpi.value.toFixed(1)}${kpi.unit}`
                          }
                        </span>
                        <div className={`flex items-center space-x-1 ${
                          kpi.trend === 'up' ? 'text-green-500' : 
                          kpi.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                        }`}>
                          {kpi.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : 
                           kpi.trend === 'down' ? <TrendingDown className="h-4 w-4" /> : null}
                          <span className="text-sm">{kpi.change > 0 ? '+' : ''}{kpi.change.toFixed(1)}%</span>
                        </div>
                      </div>
                      {kpi.target && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Meta: {kpi.target}{kpi.unit}
                        </p>
                      )}
                    </div>
                    <div className={`p-2 rounded-full ${
                      kpi.status === 'good' ? 'bg-green-100 text-green-600' :
                      kpi.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {kpi.name.includes('Receita') ? <DollarSign className="h-4 w-4" /> :
                       kpi.name.includes('Equipe') ? <Users className="h-4 w-4" /> :
                       kpi.name.includes('ROI') ? <Target className="h-4 w-4" /> :
                       <Activity className="h-4 w-4" />}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Gráfico de Projeção */}
          <Card>
            <CardHeader>
              <CardTitle>Projeção de Receita e Lucro</CardTitle>
              <div className="flex items-center space-x-4">
                {data.scenarios.map((scenario) => (
                  <div key={scenario.id} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: scenario.color }}
                    />
                    <span className="text-sm">{scenario.name}</span>
                  </div>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center bg-slate-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600">Gráfico de Projeções</p>
                  <p className="text-sm text-slate-500">Integração com biblioteca de gráficos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insights e Alertas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <span>Insights Estratégicos</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Badge variant="secondary">Alta Prioridade</Badge>
                    <div>
                      <h4 className="font-medium text-blue-900">Oportunidade de Expansão</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Cenário otimista indica potencial para expandir equipe em 25% no Q2
                      </p>
                      <p className="text-xs text-blue-600 mt-2">Impacto: +R$ 2.1M em receita</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Badge variant="secondary">Média Prioridade</Badge>
                    <div>
                      <h4 className="font-medium text-green-900">Otimização de Custos</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Automação pode reduzir custos operacionais em 8%
                      </p>
                      <p className="text-xs text-green-600 mt-2">Economia: R$ 480K/ano</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <span>Alertas e Riscos</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex justify-between items-start">
                      <div>
                        <strong>Inflação de Custos</strong>
                        <p className="text-sm mt-1">Custos crescendo 2% acima do previsto</p>
                      </div>
                      <Badge variant="destructive">Crítico</Badge>
                    </div>
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex justify-between items-start">
                      <div>
                        <strong>Dependência de Cliente</strong>
                        <p className="text-sm mt-1">85% da receita de um único cliente</p>
                      </div>
                      <Badge variant="secondary">Médio</Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Scenarios Tab */}
        <TabsContent value="scenarios" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {data.scenarios.map((scenario) => (
              <Card 
                key={scenario.id} 
                className={`cursor-pointer transition-all ${
                  activeScenario === scenario.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setActiveScenario(scenario.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{scenario.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: scenario.color }}
                      />
                      <Badge variant={scenario.isBaseline ? "default" : "secondary"}>
                        {scenario.probability}%
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{scenario.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Crescimento Receita:</span>
                        <span className="ml-2 font-medium">{scenario.assumptions.revenueGrowth}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Inflação Custos:</span>
                        <span className="ml-2 font-medium">{scenario.assumptions.costInflation}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Crescimento Equipe:</span>
                        <span className="ml-2 font-medium">{scenario.assumptions.teamGrowth}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Ganhos Eficiência:</span>
                        <span className="ml-2 font-medium">{scenario.assumptions.efficiencyGains}%</span>
                      </div>
                    </div>
                    
                    {scenario.isBaseline && (
                      <Badge variant="default" className="w-full justify-center">
                        Cenário Base
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Configuração do Cenário Ativo */}
          {currentScenario && (
            <Card>
              <CardHeader>
                <CardTitle>Configurar {currentScenario.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Crescimento de Receita (%/ano)</Label>
                    <Input
                      type="number"
                      value={currentScenario.assumptions.revenueGrowth}
                      onChange={(e) => {
                        const updatedScenarios = data.scenarios.map(s => 
                          s.id === currentScenario.id 
                            ? { ...s, assumptions: { ...s.assumptions, revenueGrowth: parseFloat(e.target.value) || 0 }}
                            : s
                        );
                        onUpdate({ ...data, scenarios: updatedScenarios });
                      }}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Inflação de Custos (%/ano)</Label>
                    <Input
                      type="number"
                      value={currentScenario.assumptions.costInflation}
                      onChange={(e) => {
                        const updatedScenarios = data.scenarios.map(s => 
                          s.id === currentScenario.id 
                            ? { ...s, assumptions: { ...s.assumptions, costInflation: parseFloat(e.target.value) || 0 }}
                            : s
                        );
                        onUpdate({ ...data, scenarios: updatedScenarios });
                      }}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Crescimento da Equipe (%/ano)</Label>
                    <Input
                      type="number"
                      value={currentScenario.assumptions.teamGrowth}
                      onChange={(e) => {
                        const updatedScenarios = data.scenarios.map(s => 
                          s.id === currentScenario.id 
                            ? { ...s, assumptions: { ...s.assumptions, teamGrowth: parseFloat(e.target.value) || 0 }}
                            : s
                        );
                        onUpdate({ ...data, scenarios: updatedScenarios });
                      }}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Ganhos de Eficiência (%/ano)</Label>
                    <Input
                      type="number"
                      value={currentScenario.assumptions.efficiencyGains}
                      onChange={(e) => {
                        const updatedScenarios = data.scenarios.map(s => 
                          s.id === currentScenario.id 
                            ? { ...s, assumptions: { ...s.assumptions, efficiencyGains: parseFloat(e.target.value) || 0 }}
                            : s
                        );
                        onUpdate({ ...data, scenarios: updatedScenarios });
                      }}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Projections Tab */}
        <TabsContent value="projections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Projeções Detalhadas - {currentScenario?.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Período</th>
                      <th className="text-right p-2">Receita</th>
                      <th className="text-right p-2">Custos</th>
                      <th className="text-right p-2">Lucro</th>
                      <th className="text-right p-2">Margem</th>
                      <th className="text-right p-2">Equipe</th>
                      <th className="text-right p-2">Tickets</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projections.slice(0, 12).map((projection, index) => (
                      <tr key={index} className="border-b hover:bg-slate-50">
                        <td className="p-2">{projection.month}/{projection.year}</td>
                        <td className="text-right p-2">R$ {(projection.revenue / 1000).toFixed(0)}K</td>
                        <td className="text-right p-2">R$ {(projection.costs.total / 1000).toFixed(0)}K</td>
                        <td className="text-right p-2">R$ {(projection.profit / 1000).toFixed(0)}K</td>
                        <td className="text-right p-2">{projection.margin.toFixed(1)}%</td>
                        <td className="text-right p-2">{projection.teamSize}</td>
                        <td className="text-right p-2">{projection.ticketVolume.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risks Tab */}
        <TabsContent value="risks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Matriz de Riscos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                  <div className="text-center">
                    <Shield className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-600">Matriz de Probabilidade vs Impacto</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Análise de Sensibilidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Crescimento de Receita</span>
                      <Badge variant="secondary">Alta Sensibilidade</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Variação de ±5% impacta lucro em ±R$ 1.2M
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Inflação de Custos</span>
                      <Badge variant="secondary">Média Sensibilidade</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Variação de ±2% impacta lucro em ±R$ 480K
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Tamanho da Equipe</span>
                      <Badge variant="secondary">Baixa Sensibilidade</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Variação de ±10% impacta lucro em ±R$ 240K
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}