'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Calculator,
  Download,
  FileText,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';

import { 
  ProfitabilityAnalysis,
  ServiceDeskData,
  ValidationResult,
  ROIAnalysis,
  PaybackAnalysis,
  MarginAnalysis,
  RiskAnalysis,
  SensitivityAnalysis,
  ChartConfiguration,
  ExportCustomization
} from '@/lib/types/service-desk-pricing';
import { ServiceDeskCalculationEngine } from '@/lib/services/service-desk-calculation-engine';
import { ReportExportService, ReportTemplate, ScheduledReport } from '@/lib/services/report-export-service';

export interface ResultTabModuleProps {
  data: ProfitabilityAnalysis;
  onUpdate: (data: ProfitabilityAnalysis) => void;
  onAutoSave: (data: ProfitabilityAnalysis) => void;
  validation?: ValidationResult;
  isLoading?: boolean;
  // Additional props for calculations
  fullData?: ServiceDeskData;
}

const CHART_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', 
  '#ff00ff', '#00ffff', '#ff0000', '#0000ff', '#ffff00'
];

export function ResultTabModule({
  data,
  onUpdate,
  onAutoSave,
  validation,
  isLoading = false,
  fullData
}: ResultTabModuleProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [calculatedAnalysis, setCalculatedAnalysis] = useState<ProfitabilityAnalysis>(data);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [exportCustomization, setExportCustomization] = useState<ExportCustomization>({
    includeCharts: true,
    includeDetails: true,
    language: 'pt',
    currency: 'BRL',
    dateFormat: 'dd/MM/yyyy'
  });

  const calculationEngine = useMemo(() => new ServiceDeskCalculationEngine(), []);
  const reportTemplates = useMemo(() => ReportExportService.getTemplates(), []);

  // Recalculate analysis when full data changes
  useEffect(() => {
    if (fullData) {
      calculateProfitabilityAnalysis();
    }
  }, [fullData]);

  const calculateProfitabilityAnalysis = async () => {
    if (!fullData) return;

    setIsCalculating(true);
    try {
      // Calculate team costs
      const teamCosts = calculationEngine.calculateTeamCosts(fullData.team, fullData.schedules);
      
      // Calculate taxes
      const taxes = calculationEngine.calculateTaxes(fullData.budget.totalPrice, fullData.taxes);
      
      // Calculate margins
      const margins = calculationEngine.calculateMargins(
        teamCosts.totalMonthlyCost,
        fullData.budget.margin,
        fullData.otherCosts
      );

      // Calculate ROI
      const investment = fullData.budget.totalCosts;
      const monthlyProfit = margins.totalPrice / 12 - (teamCosts.totalMonthlyCost + taxes.totalTaxes / 12);
      const returns = Array(12).fill(monthlyProfit);
      const roi = calculationEngine.calculateROI(investment, returns);

      // Calculate payback
      const payback = calculationEngine.calculatePayback(investment, returns);

      // Calculate margin analysis
      const marginAnalysis = calculationEngine.calculateMarginAnalysis(
        fullData.budget.monthlyBreakdown,
        fullData.budget.teamCosts,
        fullData.budget.taxes
      );

      // Generate risk analysis
      const riskAnalysis = generateRiskAnalysis(fullData, margins);

      // Generate sensitivity analysis
      const sensitivityAnalysis = generateSensitivityAnalysis(fullData);

      // Generate charts
      const charts = generateChartConfigurations(fullData, margins, teamCosts);

      const newAnalysis: ProfitabilityAnalysis = {
        roi,
        payback,
        margins: marginAnalysis,
        riskAnalysis,
        sensitivityAnalysis,
        charts
      };

      setCalculatedAnalysis(newAnalysis);
      onUpdate(newAnalysis);
      onAutoSave(newAnalysis);

    } catch (error) {
      console.error('Error calculating profitability analysis:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const generateRiskAnalysis = (data: ServiceDeskData, margins: any): RiskAnalysis => {
    const riskFactors = [];
    let overallRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Team size risk
    if (data.team.length < 3) {
      riskFactors.push({
        name: 'Equipe Pequena',
        probability: 0.7,
        impact: 0.6,
        category: 'operational' as const,
        description: 'Equipe muito pequena pode comprometer a continuidade do serviço'
      });
    }

    // Margin risk
    if (margins.grossMargin < 15) {
      riskFactors.push({
        name: 'Margem Baixa',
        probability: 0.8,
        impact: 0.8,
        category: 'financial' as const,
        description: 'Margem de lucro muito baixa pode comprometer a viabilidade'
      });
      overallRisk = 'high';
    }

    // Contract duration risk
    if (data.project.contractPeriod.durationMonths < 6) {
      riskFactors.push({
        name: 'Contrato Curto',
        probability: 0.5,
        impact: 0.4,
        category: 'market' as const,
        description: 'Contratos curtos aumentam o risco de descontinuidade'
      });
    }

    // Tax burden risk
    const effectiveTaxRate = (data.budget.taxes.total / data.budget.totalPrice) * 100;
    if (effectiveTaxRate > 30) {
      riskFactors.push({
        name: 'Carga Tributária Alta',
        probability: 0.9,
        impact: 0.7,
        category: 'regulatory' as const,
        description: 'Carga tributária elevada reduz a margem de lucro'
      });
      overallRisk = overallRisk === 'low' ? 'medium' : 'high';
    }

    // Calculate overall risk
    if (riskFactors.length === 0) {
      overallRisk = 'low';
    } else if (riskFactors.some(r => r.probability * r.impact > 0.6)) {
      overallRisk = 'critical';
    } else if (riskFactors.some(r => r.probability * r.impact > 0.4)) {
      overallRisk = 'high';
    } else {
      overallRisk = 'medium';
    }

    const mitigation = riskFactors.map(risk => ({
      riskFactor: risk.name,
      strategy: getMitigationStrategy(risk.name),
      cost: estimateMitigationCost(risk.name),
      effectiveness: 0.7
    }));

    return {
      riskFactors,
      overallRisk,
      mitigation
    };
  };

  const getMitigationStrategy = (riskName: string): string => {
    const strategies: Record<string, string> = {
      'Equipe Pequena': 'Contratar mais profissionais ou estabelecer parcerias',
      'Margem Baixa': 'Revisar custos e renegociar preços',
      'Contrato Curto': 'Negociar renovação automática ou contratos mais longos',
      'Carga Tributária Alta': 'Otimizar regime tributário ou estrutura fiscal'
    };
    return strategies[riskName] || 'Monitorar e revisar periodicamente';
  };

  const estimateMitigationCost = (riskName: string): number => {
    const costs: Record<string, number> = {
      'Equipe Pequena': 50000,
      'Margem Baixa': 10000,
      'Contrato Curto': 5000,
      'Carga Tributária Alta': 15000
    };
    return costs[riskName] || 10000;
  };

  const generateSensitivityAnalysis = (data: ServiceDeskData): SensitivityAnalysis => {
    const variables = [
      {
        name: 'Salários da Equipe',
        baseValue: data.team.reduce((sum, member) => sum + member.salary, 0),
        variations: [-20, -10, -5, 5, 10, 20],
        impacts: [-15, -7.5, -3.75, 3.75, 7.5, 15]
      },
      {
        name: 'Preço do Contrato',
        baseValue: data.budget.totalPrice,
        variations: [-15, -10, -5, 5, 10, 15],
        impacts: [-12, -8, -4, 4, 8, 12]
      },
      {
        name: 'Outros Custos',
        baseValue: data.otherCosts.reduce((sum, cost) => sum + cost.value, 0),
        variations: [-30, -15, -10, 10, 15, 30],
        impacts: [-5, -2.5, -1.7, 1.7, 2.5, 5]
      }
    ];

    const scenarios = [
      {
        name: 'Cenário Otimista',
        changes: [
          { variable: 'Preço do Contrato', change: 10 },
          { variable: 'Outros Custos', change: -15 }
        ],
        resultingProfit: data.budget.totalPrice * 1.1 - data.budget.totalCosts * 0.85,
        profitChange: 25
      },
      {
        name: 'Cenário Pessimista',
        changes: [
          { variable: 'Salários da Equipe', change: 15 },
          { variable: 'Outros Custos', change: 20 }
        ],
        resultingProfit: data.budget.totalPrice - data.budget.totalCosts * 1.35,
        profitChange: -35
      }
    ];

    return { variables, scenarios };
  };

  const generateChartConfigurations = (
    data: ServiceDeskData, 
    margins: any, 
    teamCosts: any
  ): ChartConfiguration[] => {
    return [
      {
        type: 'pie',
        title: 'Distribuição de Custos',
        data: [
          { name: 'Equipe', value: teamCosts.totalMonthlyCost * 12, color: CHART_COLORS[0] },
          { name: 'Impostos', value: data.budget.taxes.total, color: CHART_COLORS[1] },
          { name: 'Outros Custos', value: data.budget.otherCosts, color: CHART_COLORS[2] },
          { name: 'Infraestrutura', value: data.budget.infrastructureCosts, color: CHART_COLORS[3] }
        ],
        xAxis: '',
        yAxis: '',
        series: []
      },
      {
        type: 'bar',
        title: 'Evolução Mensal de Custos e Receitas',
        data: data.budget.monthlyBreakdown.map((month, index) => ({
          month: `Mês ${index + 1}`,
          receita: month.revenue,
          custos: month.totalCosts,
          lucro: month.profit
        })),
        xAxis: 'month',
        yAxis: 'value',
        series: [
          { name: 'Receita', data: [], color: CHART_COLORS[0] },
          { name: 'Custos', data: [], color: CHART_COLORS[1] },
          { name: 'Lucro', data: [], color: CHART_COLORS[2] }
        ]
      },
      {
        type: 'line',
        title: 'Evolução da Margem de Lucro',
        data: data.budget.monthlyBreakdown.map((month, index) => ({
          month: `Mês ${index + 1}`,
          margem: month.margin
        })),
        xAxis: 'month',
        yAxis: 'margem',
        series: [
          { name: 'Margem %', data: [], color: CHART_COLORS[0] }
        ]
      }
    ];
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const getRiskColor = (risk: 'low' | 'medium' | 'high' | 'critical'): string => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      critical: 'text-red-600'
    };
    return colors[risk];
  };

  const getRiskBadgeVariant = (risk: 'low' | 'medium' | 'high' | 'critical') => {
    const variants = {
      low: 'default',
      medium: 'secondary',
      high: 'destructive',
      critical: 'destructive'
    } as const;
    return variants[risk];
  };

  // Export functionality
  const handleExport = async (templateId: string) => {
    if (!fullData) {
      alert('Dados do projeto não disponíveis para exportação');
      return;
    }

    setIsExporting(true);
    try {
      const blob = await ReportExportService.exportReport(
        fullData,
        calculatedAnalysis,
        templateId,
        exportCustomization
      );

      const template = ReportExportService.getTemplate(templateId);
      if (template) {
        const filename = ReportExportService.generateFilename(
          fullData.project.name,
          template.name,
          template.format
        );
        ReportExportService.downloadBlob(blob, filename);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Erro ao exportar relatório. Tente novamente.');
    } finally {
      setIsExporting(false);
      setShowExportDialog(false);
    }
  };

  const handleQuickExport = async (format: 'pdf' | 'excel' | 'json') => {
    const templateMap = {
      pdf: 'executive-summary',
      excel: 'financial-report',
      json: 'data-export'
    };
    
    await handleExport(templateMap[format]);
  };

  const handleScheduleReport = (reportData: Omit<ScheduledReport, 'id'>) => {
    try {
      ReportExportService.scheduleReport(reportData);
      alert('Relatório agendado com sucesso!');
      setShowScheduleDialog(false);
    } catch (error) {
      console.error('Error scheduling report:', error);
      alert('Erro ao agendar relatório. Tente novamente.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Análise de Resultado</h2>
          <p className="text-muted-foreground">
            Dashboard de rentabilidade e análise financeira do projeto
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={calculateProfitabilityAnalysis}
            disabled={isCalculating || !fullData}
            variant="outline"
          >
            <Calculator className="w-4 h-4 mr-2" />
            {isCalculating ? 'Calculando...' : 'Recalcular'}
          </Button>
          
          {/* Quick Export Buttons */}
          <Button
            onClick={() => handleQuickExport('pdf')}
            disabled={isExporting || !fullData}
            variant="outline"
          >
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </Button>
          
          <Button
            onClick={() => handleQuickExport('excel')}
            disabled={isExporting || !fullData}
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
          
          <Button
            onClick={() => setShowExportDialog(true)}
            disabled={isExporting || !fullData}
            variant="default"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exportando...' : 'Exportar'}
          </Button>
          
          <Button
            onClick={() => setShowScheduleDialog(true)}
            disabled={!fullData}
            variant="outline"
          >
            <Clock className="w-4 h-4 mr-2" />
            Agendar
          </Button>
        </div>
      </div>

      {/* Validation Alerts */}
      {validation && validation.errors.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Alguns dados necessários para o cálculo estão incompletos. 
            Verifique as abas anteriores.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="roi">ROI & Payback</TabsTrigger>
          <TabsTrigger value="margins">Margens</TabsTrigger>
          <TabsTrigger value="risks">Riscos</TabsTrigger>
          <TabsTrigger value="sensitivity">Sensibilidade</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ROI</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercentage(calculatedAnalysis.roi.roi)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Retorno sobre investimento
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Payback</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {calculatedAnalysis.payback.simplePayback} meses
                </div>
                <p className="text-xs text-muted-foreground">
                  Tempo de retorno simples
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Margem Bruta</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPercentage(calculatedAnalysis.margins.grossMargin)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Margem bruta de lucro
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Risco</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Badge variant={getRiskBadgeVariant(calculatedAnalysis.riskAnalysis.overallRisk)}>
                    {calculatedAnalysis.riskAnalysis.overallRisk.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Nível de risco geral
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChartIcon className="w-4 h-4 mr-2" />
                  Distribuição de Custos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={calculatedAnalysis.charts.find(c => c.type === 'pie')?.data || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {calculatedAnalysis.charts.find(c => c.type === 'pie')?.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Evolution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Evolução Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={calculatedAnalysis.charts.find(c => c.type === 'bar')?.data || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="receita" fill={CHART_COLORS[0]} name="Receita" />
                    <Bar dataKey="custos" fill={CHART_COLORS[1]} name="Custos" />
                    <Bar dataKey="lucro" fill={CHART_COLORS[2]} name="Lucro" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ROI & Payback Tab */}
        <TabsContent value="roi" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Análise de ROI</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Investimento</p>
                    <p className="text-2xl font-bold">{formatCurrency(calculatedAnalysis.roi.investment)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ROI</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatPercentage(calculatedAnalysis.roi.roi)}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">TIR</p>
                    <p className="text-lg font-semibold">{formatPercentage(calculatedAnalysis.roi.irr)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">VPL</p>
                    <p className="text-lg font-semibold">{formatCurrency(calculatedAnalysis.roi.npv)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Análise de Payback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Payback Simples</p>
                    <p className="text-2xl font-bold">{calculatedAnalysis.payback.simplePayback} meses</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Payback Descontado</p>
                    <p className="text-2xl font-bold">{calculatedAnalysis.payback.discountedPayback} meses</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ponto de Equilíbrio</p>
                  <p className="text-lg font-semibold">{calculatedAnalysis.payback.breakEvenPoint} meses</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cash Flow Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Caixa Acumulado</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={calculatedAnalysis.payback.cashFlowAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Area 
                    type="monotone" 
                    dataKey="cumulativeCashFlow" 
                    stroke={CHART_COLORS[0]} 
                    fill={CHART_COLORS[0]}
                    fillOpacity={0.3}
                    name="Fluxo Acumulado"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Margins Tab */}
        <TabsContent value="margins" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Margens</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Margem Bruta</span>
                    <span className="font-semibold">{formatPercentage(calculatedAnalysis.margins.grossMargin)}</span>
                  </div>
                  <Progress value={calculatedAnalysis.margins.grossMargin} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Margem Líquida</span>
                    <span className="font-semibold">{formatPercentage(calculatedAnalysis.margins.netMargin)}</span>
                  </div>
                  <Progress value={calculatedAnalysis.margins.netMargin} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Margem EBITDA</span>
                    <span className="font-semibold">{formatPercentage(calculatedAnalysis.margins.ebitdaMargin)}</span>
                  </div>
                  <Progress value={calculatedAnalysis.margins.ebitdaMargin} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evolução das Margens</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={calculatedAnalysis.margins.marginTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis tickFormatter={(value) => `${value}%`} />
                    <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="grossMargin" 
                      stroke={CHART_COLORS[0]} 
                      name="Margem Bruta"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="netMargin" 
                      stroke={CHART_COLORS[1]} 
                      name="Margem Líquida"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Risks Tab */}
        <TabsContent value="risks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Fatores de Risco
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {calculatedAnalysis.riskAnalysis.riskFactors.map((risk, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{risk.name}</h4>
                        <Badge variant="outline">{risk.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{risk.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Probabilidade:</span>
                          <div className="flex items-center mt-1">
                            <Progress value={risk.probability * 100} className="h-2 flex-1 mr-2" />
                            <span className="font-medium">{formatPercentage(risk.probability * 100)}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Impacto:</span>
                          <div className="flex items-center mt-1">
                            <Progress value={risk.impact * 100} className="h-2 flex-1 mr-2" />
                            <span className="font-medium">{formatPercentage(risk.impact * 100)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estratégias de Mitigação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {calculatedAnalysis.riskAnalysis.mitigation.map((mitigation, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">{mitigation.riskFactor}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{mitigation.strategy}</p>
                      <div className="flex justify-between items-center text-sm">
                        <span>
                          <span className="text-muted-foreground">Custo:</span>
                          <span className="font-medium ml-1">{formatCurrency(mitigation.cost)}</span>
                        </span>
                        <span>
                          <span className="text-muted-foreground">Efetividade:</span>
                          <span className="font-medium ml-1">{formatPercentage(mitigation.effectiveness * 100)}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sensitivity Tab */}
        <TabsContent value="sensitivity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Sensibilidade</CardTitle>
              <p className="text-sm text-muted-foreground">
                Impacto de variações nas principais variáveis do projeto
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {calculatedAnalysis.sensitivityAnalysis.variables.map((variable, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">{variable.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Valor base: {formatCurrency(variable.baseValue)}
                    </p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      {variable.variations.map((variation, vIndex) => (
                        <div key={vIndex} className="text-center">
                          <div className="font-medium">
                            {variation > 0 ? '+' : ''}{variation}%
                          </div>
                          <div className={`text-sm ${variable.impacts[vIndex] > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {variable.impacts[vIndex] > 0 ? '+' : ''}{variable.impacts[vIndex]}% lucro
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cenários de Análise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {calculatedAnalysis.sensitivityAnalysis.scenarios.map((scenario, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">{scenario.name}</h4>
                    <div className="space-y-2 mb-3">
                      {scenario.changes.map((change, cIndex) => (
                        <div key={cIndex} className="text-sm">
                          <span className="text-muted-foreground">{change.variable}:</span>
                          <span className="ml-1 font-medium">
                            {change.change > 0 ? '+' : ''}{change.change}%
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Lucro Resultante:</span>
                        <span className="font-semibold">{formatCurrency(scenario.resultingProfit)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-muted-foreground">Variação:</span>
                        <span className={`font-semibold ${scenario.profitChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {scenario.profitChange > 0 ? '+' : ''}{scenario.profitChange}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Dialog */}
      {showExportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Exportar Relatório</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowExportDialog(false)}
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Selecione o Template
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {reportTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        selectedTemplate === template.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {template.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{template.format.toUpperCase()}</Badge>
                          {template.isExecutive && (
                            <Badge variant="default">Executivo</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Opções de Personalização</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportCustomization.includeCharts}
                        onChange={(e) =>
                          setExportCustomization(prev => ({
                            ...prev,
                            includeCharts: e.target.checked
                          }))
                        }
                      />
                      <span className="text-sm">Incluir Gráficos</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={exportCustomization.includeDetails}
                        onChange={(e) =>
                          setExportCustomization(prev => ({
                            ...prev,
                            includeDetails: e.target.checked
                          }))
                        }
                      />
                      <span className="text-sm">Incluir Detalhes</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Idioma
                    </label>
                    <select
                      value={exportCustomization.language}
                      onChange={(e) =>
                        setExportCustomization(prev => ({
                          ...prev,
                          language: e.target.value as 'pt' | 'en' | 'es'
                        }))
                      }
                      className="w-full border rounded px-2 py-1 text-sm"
                    >
                      <option value="pt">Português</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Moeda
                    </label>
                    <select
                      value={exportCustomization.currency}
                      onChange={(e) =>
                        setExportCustomization(prev => ({
                          ...prev,
                          currency: e.target.value
                        }))
                      }
                      className="w-full border rounded px-2 py-1 text-sm"
                    >
                      <option value="BRL">Real (BRL)</option>
                      <option value="USD">Dólar (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowExportDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => selectedTemplate && handleExport(selectedTemplate)}
                  disabled={!selectedTemplate || isExporting}
                >
                  {isExporting ? 'Exportando...' : 'Exportar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Dialog */}
      {showScheduleDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Agendar Relatório</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowScheduleDialog(false)}
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nome do Agendamento
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  placeholder="Ex: Relatório Mensal de ROI"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Template
                </label>
                <select className="w-full border rounded px-3 py-2">
                  {reportTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Frequência
                </label>
                <select className="w-full border rounded px-3 py-2">
                  <option value="daily">Diário</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                  <option value="quarterly">Trimestral</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Destinatários (emails separados por vírgula)
                </label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                  placeholder="email1@exemplo.com, email2@exemplo.com"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowScheduleDialog(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={() => {
                  // This would need to collect form data and call handleScheduleReport
                  setShowScheduleDialog(false);
                }}>
                  Agendar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}