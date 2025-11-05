'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  FileText,
  Download,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Star,
  Award,
  Shield,
  Zap,
  Users,
  Calendar,
  PieChart as PieChartIcon,
  Activity,
  Briefcase,
  TrendingUp as TrendingUpIcon
} from 'lucide-react';

import { 
  ExecutiveDashboard,
  KPI,
  ExecutiveSummary,
  Recommendation,
  MarketBenchmark,
  ApprovalStatus,
  ServiceDeskData,
  ValidationResult
} from '@/lib/types/service-desk-pricing';
import { ServiceDeskCalculationEngine } from '@/lib/services/service-desk-calculation-engine';
import { 
  ServiceDeskPDFIntegration, 
  generateServiceDeskProposalPDF,
  ServiceDeskPDFOptions 
} from '@/lib/services/service-desk-pdf-integration';

export interface FinalAnalysisTabModuleProps {
  data: ExecutiveDashboard;
  onUpdate: (data: ExecutiveDashboard) => void;
  onAutoSave: (data: ExecutiveDashboard) => void;
  validation?: ValidationResult;
  isLoading?: boolean;
  // Additional props for calculations and PDF integration
  fullData?: ServiceDeskData;
}

const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

const KPI_ICONS = {
  revenue: DollarSign,
  profit: TrendingUp,
  margin: Target,
  roi: BarChart3,
  payback: Clock,
  risk: Shield,
  team: Users,
  timeline: Calendar
};

const RECOMMENDATION_ICONS = {
  cost_optimization: DollarSign,
  pricing_adjustment: Target,
  risk_mitigation: Shield,
  scope_change: Briefcase
};

export function FinalAnalysisTabModule({
  data,
  onUpdate,
  onAutoSave,
  validation,
  isLoading = false,
  fullData
}: FinalAnalysisTabModuleProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState<ExecutiveDashboard>(data || createEmptyDashboard());
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalStatus | null>(null);
  const [pdfOptions, setPdfOptions] = useState<ServiceDeskPDFOptions>({
    includeExecutiveSummary: true,
    includeKPIs: true,
    includeRecommendations: true,
    includeBenchmarks: true,
    includeApprovals: true,
    templateType: 'executive',
    language: 'pt'
  });
  const [showPdfOptions, setShowPdfOptions] = useState(false);

  const calculationEngine = useMemo(() => new ServiceDeskCalculationEngine(), []);

  // Generate dashboard data from full project data
  useEffect(() => {
    if (fullData) {
      generateDashboardData();
    }
  }, [fullData]);

  // Auto-save dashboard when it changes
  useEffect(() => {
    if (dashboard && dashboard !== data) {
      onAutoSave(dashboard);
    }
  }, [dashboard, data, onAutoSave]);

  const createEmptyDashboard = useCallback((): ExecutiveDashboard => ({
    kpis: [],
    summary: {
      projectValue: 0,
      expectedProfit: 0,
      riskLevel: 'medium',
      recommendedAction: 'review',
      keyHighlights: [],
      concerns: []
    },
    recommendations: [],
    benchmarks: [],
    approvals: []
  }), []);

  const generateDashboardData = useCallback(() => {
    if (!fullData) return;

    try {
      // Calculate KPIs
      const kpis = generateKPIs(fullData);
      
      // Generate executive summary
      const summary = generateExecutiveSummary(fullData, kpis);
      
      // Generate recommendations
      const recommendations = generateRecommendations(fullData, kpis);
      
      // Generate benchmarks
      const benchmarks = generateBenchmarks(fullData);
      
      // Initialize approval workflow
      const approvals = initializeApprovals();

      const newDashboard: ExecutiveDashboard = {
        kpis,
        summary,
        recommendations,
        benchmarks,
        approvals
      };

      setDashboard(newDashboard);
      onUpdate(newDashboard);
    } catch (error) {
      console.error('Error generating dashboard data:', error);
    }
  }, [fullData, onUpdate]);

  const generateKPIs = useCallback((projectData: ServiceDeskData): KPI[] => {
    const kpis: KPI[] = [];

    // Revenue KPI
    kpis.push({
      name: 'Receita Total',
      value: projectData.budget.totalPrice,
      unit: 'R$',
      target: projectData.budget.totalPrice * 1.1,
      status: 'good',
      trend: 'up',
      description: 'Receita total esperada do projeto'
    });

    // Profit KPI
    const profit = projectData.budget.totalPrice - projectData.budget.totalCosts;
    const profitMargin = projectData.budget.totalPrice > 0 ? (profit / projectData.budget.totalPrice) * 100 : 0;
    
    kpis.push({
      name: 'Lucro Esperado',
      value: profit,
      unit: 'R$',
      target: projectData.budget.totalPrice * 0.2,
      status: profit > projectData.budget.totalPrice * 0.15 ? 'good' : profit > projectData.budget.totalPrice * 0.1 ? 'warning' : 'critical',
      trend: profit > 0 ? 'up' : 'down',
      description: 'Lucro líquido esperado do projeto'
    });

    // Margin KPI
    kpis.push({
      name: 'Margem de Lucro',
      value: profitMargin,
      unit: '%',
      target: 20,
      status: profitMargin >= 20 ? 'good' : profitMargin >= 15 ? 'warning' : 'critical',
      trend: profitMargin >= 15 ? 'up' : 'down',
      description: 'Margem de lucro sobre a receita'
    });

    // ROI KPI
    if (projectData.analysis.roi.roi > 0) {
      kpis.push({
        name: 'ROI',
        value: projectData.analysis.roi.roi,
        unit: '%',
        target: 25,
        status: projectData.analysis.roi.roi >= 25 ? 'good' : projectData.analysis.roi.roi >= 15 ? 'warning' : 'critical',
        trend: projectData.analysis.roi.roi >= 15 ? 'up' : 'down',
        description: 'Retorno sobre investimento'
      });
    }

    // Payback KPI
    if (projectData.analysis.payback.simplePayback > 0) {
      kpis.push({
        name: 'Payback',
        value: projectData.analysis.payback.simplePayback,
        unit: 'meses',
        target: 18,
        status: projectData.analysis.payback.simplePayback <= 18 ? 'good' : projectData.analysis.payback.simplePayback <= 24 ? 'warning' : 'critical',
        trend: projectData.analysis.payback.simplePayback <= 18 ? 'up' : 'down',
        description: 'Tempo para recuperar investimento'
      });
    }

    // Team Size KPI
    kpis.push({
      name: 'Tamanho da Equipe',
      value: projectData.team.length,
      unit: 'pessoas',
      target: Math.max(5, projectData.team.length),
      status: projectData.team.length >= 3 ? 'good' : projectData.team.length >= 1 ? 'warning' : 'critical',
      trend: 'stable',
      description: 'Número de profissionais na equipe'
    });

    // Contract Duration KPI
    kpis.push({
      name: 'Duração do Contrato',
      value: projectData.project.contractPeriod.durationMonths,
      unit: 'meses',
      target: 12,
      status: projectData.project.contractPeriod.durationMonths >= 12 ? 'good' : projectData.project.contractPeriod.durationMonths >= 6 ? 'warning' : 'critical',
      trend: 'stable',
      description: 'Duração total do contrato'
    });

    // Risk Level KPI
    const riskScore = calculateRiskScore(projectData);
    kpis.push({
      name: 'Nível de Risco',
      value: riskScore,
      unit: '/10',
      target: 3,
      status: riskScore <= 3 ? 'good' : riskScore <= 6 ? 'warning' : 'critical',
      trend: riskScore <= 5 ? 'up' : 'down',
      description: 'Avaliação geral de risco do projeto'
    });

    return kpis;
  }, []);

  const calculateRiskScore = useCallback((projectData: ServiceDeskData): number => {
    let riskScore = 0;

    // Team size risk
    if (projectData.team.length < 3) riskScore += 2;
    else if (projectData.team.length < 5) riskScore += 1;

    // Margin risk
    const profit = projectData.budget.totalPrice - projectData.budget.totalCosts;
    const profitMargin = projectData.budget.totalPrice > 0 ? (profit / projectData.budget.totalPrice) * 100 : 0;
    if (profitMargin < 10) riskScore += 3;
    else if (profitMargin < 15) riskScore += 2;
    else if (profitMargin < 20) riskScore += 1;

    // Contract duration risk
    if (projectData.project.contractPeriod.durationMonths < 6) riskScore += 2;
    else if (projectData.project.contractPeriod.durationMonths < 12) riskScore += 1;

    // Coverage risk
    if (projectData.schedules.length === 0) riskScore += 2;

    // Tax risk
    const effectiveTaxRate = (projectData.budget.taxes.total / projectData.budget.totalPrice) * 100;
    if (effectiveTaxRate > 30) riskScore += 1;

    return Math.min(riskScore, 10);
  }, []);

  const generateExecutiveSummary = useCallback((projectData: ServiceDeskData, kpis: KPI[]): ExecutiveSummary => {
    const profit = projectData.budget.totalPrice - projectData.budget.totalCosts;
    const profitMargin = projectData.budget.totalPrice > 0 ? (profit / projectData.budget.totalPrice) * 100 : 0;
    const riskScore = calculateRiskScore(projectData);

    const keyHighlights: string[] = [];
    const concerns: string[] = [];

    // Analyze KPIs for highlights and concerns
    kpis.forEach(kpi => {
      if (kpi.status === 'good') {
        keyHighlights.push(`${kpi.name}: ${formatKPIValue(kpi.value, kpi.unit)} (${kpi.description})`);
      } else if (kpi.status === 'critical') {
        concerns.push(`${kpi.name}: ${formatKPIValue(kpi.value, kpi.unit)} - ${kpi.description}`);
      }
    });

    // Additional analysis
    if (projectData.team.length >= 5) {
      keyHighlights.push('Equipe bem dimensionada para o projeto');
    }

    if (projectData.schedules.length > 0) {
      keyHighlights.push('Escalas de trabalho definidas');
    }

    if (profitMargin < 10) {
      concerns.push('Margem de lucro muito baixa - revisar custos ou preços');
    }

    if (projectData.team.length === 0) {
      concerns.push('Equipe não definida - impacto direto nos custos');
    }

    if (projectData.schedules.length === 0) {
      concerns.push('Escalas de trabalho não configuradas');
    }

    // Determine recommended action
    let recommendedAction: 'approve' | 'negotiate' | 'reject' | 'review' = 'review';
    
    if (profitMargin >= 20 && riskScore <= 3) {
      recommendedAction = 'approve';
    } else if (profitMargin >= 15 && riskScore <= 5) {
      recommendedAction = 'negotiate';
    } else if (profitMargin < 5 || riskScore >= 8) {
      recommendedAction = 'reject';
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'medium';
    if (riskScore <= 3) riskLevel = 'low';
    else if (riskScore >= 7) riskLevel = 'high';

    return {
      projectValue: projectData.budget.totalPrice,
      expectedProfit: profit,
      riskLevel,
      recommendedAction,
      keyHighlights: keyHighlights.slice(0, 5), // Limit to top 5
      concerns: concerns.slice(0, 5) // Limit to top 5
    };
  }, [calculateRiskScore]);

  const generateRecommendations = useCallback((projectData: ServiceDeskData, kpis: KPI[]): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    const profit = projectData.budget.totalPrice - projectData.budget.totalCosts;
    const profitMargin = projectData.budget.totalPrice > 0 ? (profit / projectData.budget.totalPrice) * 100 : 0;

    // Cost optimization recommendations
    if (profitMargin < 15) {
      recommendations.push({
        type: 'cost_optimization',
        title: 'Otimizar Custos da Equipe',
        description: 'Revisar composição da equipe e benefícios para reduzir custos operacionais',
        impact: projectData.budget.teamCosts.total * 0.1,
        effort: 'medium',
        priority: 'high'
      });
    }

    if (projectData.otherCosts.length > 0) {
      const totalOtherCosts = projectData.otherCosts.reduce((sum, cost) => sum + cost.value, 0);
      if (totalOtherCosts > projectData.budget.teamCosts.total * 0.3) {
        recommendations.push({
          type: 'cost_optimization',
          title: 'Revisar Outros Custos',
          description: 'Outros custos representam mais de 30% dos custos da equipe - revisar necessidade',
          impact: totalOtherCosts * 0.2,
          effort: 'low',
          priority: 'medium'
        });
      }
    }

    // Pricing recommendations
    if (profitMargin > 30) {
      recommendations.push({
        type: 'pricing_adjustment',
        title: 'Considerar Redução de Preço',
        description: 'Margem muito alta pode prejudicar competitividade - considerar redução estratégica',
        impact: -projectData.budget.totalPrice * 0.05,
        effort: 'low',
        priority: 'low'
      });
    } else if (profitMargin < 10) {
      recommendations.push({
        type: 'pricing_adjustment',
        title: 'Aumentar Preço do Projeto',
        description: 'Margem muito baixa - necessário aumentar preço para viabilidade',
        impact: projectData.budget.totalPrice * 0.1,
        effort: 'medium',
        priority: 'critical'
      });
    }

    // Risk mitigation recommendations
    if (projectData.team.length < 3) {
      recommendations.push({
        type: 'risk_mitigation',
        title: 'Ampliar Equipe',
        description: 'Equipe muito pequena representa risco para entrega - considerar ampliação',
        impact: -projectData.budget.totalPrice * 0.02,
        effort: 'high',
        priority: 'high'
      });
    }

    if (projectData.schedules.length === 0) {
      recommendations.push({
        type: 'risk_mitigation',
        title: 'Definir Escalas de Trabalho',
        description: 'Escalas não definidas podem impactar qualidade do atendimento',
        impact: 0,
        effort: 'medium',
        priority: 'high'
      });
    }

    // Scope recommendations
    if (projectData.project.contractPeriod.durationMonths < 12) {
      recommendations.push({
        type: 'scope_change',
        title: 'Estender Duração do Contrato',
        description: 'Contratos mais longos oferecem melhor estabilidade e ROI',
        impact: projectData.budget.totalPrice * 0.5,
        effort: 'medium',
        priority: 'medium'
      });
    }

    // Sort by priority and impact
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return Math.abs(b.impact) - Math.abs(a.impact);
    });
  }, []);

  const generateBenchmarks = useCallback((projectData: ServiceDeskData): MarketBenchmark[] => {
    const benchmarks: MarketBenchmark[] = [];
    const profit = projectData.budget.totalPrice - projectData.budget.totalCosts;
    const profitMargin = projectData.budget.totalPrice > 0 ? (profit / projectData.budget.totalPrice) * 100 : 0;

    // Profit margin benchmark
    benchmarks.push({
      metric: 'Margem de Lucro',
      ourValue: profitMargin,
      marketAverage: 18,
      marketBest: 25,
      position: profitMargin >= 25 ? 'best' : profitMargin >= 18 ? 'above' : profitMargin >= 12 ? 'average' : 'below',
      source: 'Pesquisa Mercado TI 2024'
    });

    // Team cost per hour benchmark
    const avgHourlyCost = projectData.team.length > 0 
      ? projectData.budget.teamCosts.total / (projectData.team.reduce((sum, member) => sum + member.workload, 0) * 4.33)
      : 0;
    
    benchmarks.push({
      metric: 'Custo Hora Equipe',
      ourValue: avgHourlyCost,
      marketAverage: 85,
      marketBest: 65,
      position: avgHourlyCost <= 65 ? 'best' : avgHourlyCost <= 85 ? 'above' : avgHourlyCost <= 105 ? 'average' : 'below',
      source: 'Relatório Salários TI 2024'
    });

    // Contract duration benchmark
    benchmarks.push({
      metric: 'Duração Contrato (meses)',
      ourValue: projectData.project.contractPeriod.durationMonths,
      marketAverage: 12,
      marketBest: 24,
      position: projectData.project.contractPeriod.durationMonths >= 24 ? 'best' : 
                projectData.project.contractPeriod.durationMonths >= 12 ? 'above' : 
                projectData.project.contractPeriod.durationMonths >= 6 ? 'average' : 'below',
      source: 'Análise Contratos Service Desk'
    });

    // Team size benchmark
    const teamSizePerContract = projectData.budget.totalPrice > 0 
      ? projectData.team.length / (projectData.budget.totalPrice / 100000) // Team per 100k revenue
      : 0;
    
    benchmarks.push({
      metric: 'Eficiência da Equipe',
      ourValue: teamSizePerContract,
      marketAverage: 2.5,
      marketBest: 2.0,
      position: teamSizePerContract <= 2.0 ? 'best' : teamSizePerContract <= 2.5 ? 'above' : teamSizePerContract <= 3.0 ? 'average' : 'below',
      source: 'Benchmark Produtividade TI'
    });

    return benchmarks;
  }, []);

  const initializeApprovals = useCallback((): ApprovalStatus[] => {
    return [
      {
        level: 'Técnico',
        status: 'pending',
        approver: 'Gerente Técnico',
        comments: 'Aguardando revisão técnica da proposta'
      },
      {
        level: 'Financeiro',
        status: 'pending',
        approver: 'Controller',
        comments: 'Aguardando análise financeira'
      },
      {
        level: 'Comercial',
        status: 'pending',
        approver: 'Diretor Comercial',
        comments: 'Aguardando aprovação comercial'
      },
      {
        level: 'Executivo',
        status: 'pending',
        approver: 'CEO',
        comments: 'Aprovação final pendente'
      }
    ];
  }, []);

  const updateApprovalStatus = useCallback((level: string, status: 'approved' | 'rejected' | 'conditional', comments?: string, conditions?: string[]) => {
    const updatedApprovals = dashboard.approvals.map(approval => {
      if (approval.level === level) {
        return {
          ...approval,
          status,
          date: new Date(),
          comments: comments || approval.comments,
          conditions
        };
      }
      return approval;
    });

    const updatedDashboard = {
      ...dashboard,
      approvals: updatedApprovals
    };

    setDashboard(updatedDashboard);
    onUpdate(updatedDashboard);
  }, [dashboard, onUpdate]);

  const generatePDFReport = useCallback(async (options?: ServiceDeskPDFOptions) => {
    if (!fullData) return;

    setIsGeneratingReport(true);
    try {
      // Use the integrated PDF generation system
      const finalOptions = { ...pdfOptions, ...options };
      
      const result = await generateServiceDeskProposalPDF(
        fullData,
        dashboard,
        finalOptions
      );
      
      // Create download link
      const a = document.createElement('a');
      a.href = result.url;
      a.download = `proposta-service-desk-${fullData.project.name || 'projeto'}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Show success message
      alert(`Relatório PDF gerado com sucesso! Tamanho: ${(result.size / 1024 / 1024).toFixed(2)} MB`);
      
    } catch (error) {
      console.error('Error generating PDF report:', error);
      alert(`Erro ao gerar relatório PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsGeneratingReport(false);
    }
  }, [fullData, dashboard, pdfOptions]);

  const formatKPIValue = useCallback((value: number, unit: string): string => {
    if (unit === 'R$') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    } else if (unit === '%') {
      return `${value.toFixed(1)}%`;
    } else {
      return `${value.toFixed(1)} ${unit}`;
    }
  }, []);

  const getKPIIcon = useCallback((kpiName: string) => {
    const name = kpiName.toLowerCase();
    if (name.includes('receita') || name.includes('valor')) return KPI_ICONS.revenue;
    if (name.includes('lucro')) return KPI_ICONS.profit;
    if (name.includes('margem')) return KPI_ICONS.margin;
    if (name.includes('roi')) return KPI_ICONS.roi;
    if (name.includes('payback')) return KPI_ICONS.payback;
    if (name.includes('risco')) return KPI_ICONS.risk;
    if (name.includes('equipe')) return KPI_ICONS.team;
    if (name.includes('duração') || name.includes('contrato')) return KPI_ICONS.timeline;
    return Activity;
  }, []);

  const getStatusColor = useCallback((status: 'good' | 'warning' | 'critical'): string => {
    const colors = {
      good: 'text-green-600',
      warning: 'text-yellow-600',
      critical: 'text-red-600'
    };
    return colors[status];
  }, []);

  const getStatusBadgeVariant = useCallback((status: 'good' | 'warning' | 'critical') => {
    const variants = {
      good: 'default',
      warning: 'secondary',
      critical: 'destructive'
    } as const;
    return variants[status];
  }, []);

  const getTrendIcon = useCallback((trend: 'up' | 'down' | 'stable') => {
    const icons = {
      up: TrendingUp,
      down: TrendingDown,
      stable: Minus
    };
    return icons[trend];
  }, []);

  const getRecommendationIcon = useCallback((type: string) => {
    return RECOMMENDATION_ICONS[type as keyof typeof RECOMMENDATION_ICONS] || Star;
  }, []);

  const getPriorityColor = useCallback((priority: 'low' | 'medium' | 'high' | 'critical'): string => {
    const colors = {
      low: 'text-gray-600',
      medium: 'text-blue-600',
      high: 'text-orange-600',
      critical: 'text-red-600'
    };
    return colors[priority];
  }, []);

  const getBenchmarkColor = useCallback((position: 'below' | 'average' | 'above' | 'best'): string => {
    const colors = {
      below: 'text-red-600',
      average: 'text-yellow-600',
      above: 'text-blue-600',
      best: 'text-green-600'
    };
    return colors[position];
  }, []);

  const getApprovalStatusIcon = useCallback((status: 'pending' | 'approved' | 'rejected' | 'conditional') => {
    const icons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: AlertTriangle,
      conditional: AlertTriangle
    };
    return icons[status];
  }, []);

  const getApprovalStatusColor = useCallback((status: 'pending' | 'approved' | 'rejected' | 'conditional'): string => {
    const colors = {
      pending: 'text-yellow-600',
      approved: 'text-green-600',
      rejected: 'text-red-600',
      conditional: 'text-orange-600'
    };
    return colors[status];
  }, []);

  // Prepare chart data
  const kpiChartData = useMemo(() => {
    return dashboard.kpis.map(kpi => ({
      name: kpi.name,
      value: kpi.value,
      target: kpi.target || 0,
      status: kpi.status
    }));
  }, [dashboard.kpis]);

  const benchmarkChartData = useMemo(() => {
    return dashboard.benchmarks.map(benchmark => ({
      metric: benchmark.metric,
      'Nosso Valor': benchmark.ourValue,
      'Média Mercado': benchmark.marketAverage,
      'Melhor Mercado': benchmark.marketBest
    }));
  }, [dashboard.benchmarks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Análise Final Executiva</h2>
          <p className="text-muted-foreground">
            Dashboard executivo com KPIs, análise de riscos e recomendações
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => generatePDFReport()}
            disabled={isLoading || isGeneratingReport || !fullData}
            variant="default"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGeneratingReport ? 'Gerando PDF...' : 'Gerar Proposta PDF'}
          </Button>

          <Button
            onClick={() => setShowPdfOptions(true)}
            disabled={isLoading || isGeneratingReport || !fullData}
            variant="outline"
          >
            <FileText className="w-4 h-4 mr-2" />
            Opções PDF
          </Button>
          
          <Button
            onClick={() => generateDashboardData()}
            disabled={isLoading || !fullData}
            variant="outline"
          >
            <Activity className="w-4 h-4 mr-2" />
            Atualizar Análise
          </Button>
        </div>
      </div>

      {/* Validation Alerts */}
      {validation && validation.errors.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Alguns dados necessários para análise final estão incompletos. 
            Verifique as abas anteriores.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="kpis">KPIs</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="approvals">Aprovações</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Executive Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Resumo Executivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Valor do Projeto</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatKPIValue(dashboard.summary.projectValue, 'R$')}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Lucro Esperado</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatKPIValue(dashboard.summary.expectedProfit, 'R$')}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Nível de Risco</p>
                  <Badge variant={dashboard.summary.riskLevel === 'low' ? 'default' : dashboard.summary.riskLevel === 'medium' ? 'secondary' : 'destructive'}>
                    {dashboard.summary.riskLevel.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Recomendação</p>
                  <Badge variant={
                    dashboard.summary.recommendedAction === 'approve' ? 'default' :
                    dashboard.summary.recommendedAction === 'negotiate' ? 'secondary' :
                    dashboard.summary.recommendedAction === 'reject' ? 'destructive' : 'outline'
                  }>
                    {dashboard.summary.recommendedAction === 'approve' ? 'APROVAR' :
                     dashboard.summary.recommendedAction === 'negotiate' ? 'NEGOCIAR' :
                     dashboard.summary.recommendedAction === 'reject' ? 'REJEITAR' : 'REVISAR'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Key Highlights */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Pontos Positivos
                  </h4>
                  {dashboard.summary.keyHighlights.length > 0 ? (
                    <ul className="space-y-2">
                      {dashboard.summary.keyHighlights.map((highlight, index) => (
                        <li key={index} className="text-sm flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum ponto positivo identificado</p>
                  )}
                </div>

                {/* Concerns */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
                    Pontos de Atenção
                  </h4>
                  {dashboard.summary.concerns.length > 0 ? (
                    <ul className="space-y-2">
                      {dashboard.summary.concerns.map((concern, index) => (
                        <li key={index} className="text-sm flex items-start">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {concern}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum ponto de atenção identificado</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick KPIs Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dashboard.kpis.slice(0, 4).map((kpi, index) => {
              const Icon = getKPIIcon(kpi.name);
              const TrendIcon = getTrendIcon(kpi.trend);
              
              return (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <Badge variant={getStatusBadgeVariant(kpi.status)}>
                        <TrendIcon className="w-3 h-3" />
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{kpi.name}</p>
                      <p className="text-lg font-bold">{formatKPIValue(kpi.value, kpi.unit)}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* KPIs Tab */}
        <TabsContent value="kpis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* KPIs List */}
            <Card>
              <CardHeader>
                <CardTitle>Indicadores de Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboard.kpis.map((kpi, index) => {
                    const Icon = getKPIIcon(kpi.name);
                    const TrendIcon = getTrendIcon(kpi.trend);
                    
                    return (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Icon className="w-5 h-5 mr-2 text-muted-foreground" />
                            <h4 className="font-medium">{kpi.name}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getStatusBadgeVariant(kpi.status)}>
                              <TrendIcon className="w-3 h-3 mr-1" />
                              {kpi.status.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-2">
                          <div>
                            <p className="text-sm text-muted-foreground">Valor Atual</p>
                            <p className="text-lg font-bold">{formatKPIValue(kpi.value, kpi.unit)}</p>
                          </div>
                          {kpi.target && (
                            <div>
                              <p className="text-sm text-muted-foreground">Meta</p>
                              <p className="text-lg font-bold text-muted-foreground">{formatKPIValue(kpi.target, kpi.unit)}</p>
                            </div>
                          )}
                        </div>
                        
                        {kpi.target && (
                          <div className="mb-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progresso</span>
                              <span>{((kpi.value / kpi.target) * 100).toFixed(0)}%</span>
                            </div>
                            <Progress value={Math.min((kpi.value / kpi.target) * 100, 100)} />
                          </div>
                        )}
                        
                        <p className="text-sm text-muted-foreground">{kpi.description}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* KPIs Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Comparação com Metas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={kpiChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={12}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Valor Atual" fill="#8884d8" />
                      <Bar dataKey="target" name="Meta" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2" />
                Recomendações Estratégicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard.recommendations.length > 0 ? (
                <div className="space-y-4">
                  {dashboard.recommendations.map((recommendation, index) => {
                    const Icon = getRecommendationIcon(recommendation.type);
                    
                    return (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center">
                            <Icon className="w-5 h-5 mr-2 text-muted-foreground" />
                            <div>
                              <h4 className="font-medium">{recommendation.title}</h4>
                              <p className="text-sm text-muted-foreground capitalize">
                                {recommendation.type.replace('_', ' ')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              recommendation.priority === 'critical' ? 'destructive' :
                              recommendation.priority === 'high' ? 'default' :
                              recommendation.priority === 'medium' ? 'secondary' : 'outline'
                            }>
                              {recommendation.priority.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">
                              Esforço: {recommendation.effort.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm mb-3">{recommendation.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Impacto Financeiro: </span>
                            <span className={`font-medium ${recommendation.impact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {recommendation.impact >= 0 ? '+' : ''}{formatKPIValue(recommendation.impact, 'R$')}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma recomendação disponível</p>
                  <p className="text-sm">Complete os dados do projeto para gerar recomendações</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Benchmarks Tab */}
        <TabsContent value="benchmarks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Benchmarks List */}
            <Card>
              <CardHeader>
                <CardTitle>Comparação com Mercado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboard.benchmarks.map((benchmark, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{benchmark.metric}</h4>
                        <Badge variant={
                          benchmark.position === 'best' ? 'default' :
                          benchmark.position === 'above' ? 'secondary' :
                          benchmark.position === 'average' ? 'outline' : 'destructive'
                        }>
                          {benchmark.position === 'best' ? 'MELHOR' :
                           benchmark.position === 'above' ? 'ACIMA' :
                           benchmark.position === 'average' ? 'MÉDIA' : 'ABAIXO'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Nosso Valor</p>
                          <p className="font-medium">{benchmark.ourValue.toFixed(1)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Média Mercado</p>
                          <p className="font-medium">{benchmark.marketAverage.toFixed(1)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Melhor Mercado</p>
                          <p className="font-medium">{benchmark.marketBest.toFixed(1)}</p>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-2">
                        Fonte: {benchmark.source}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Benchmarks Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Posicionamento no Mercado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={benchmarkChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="metric" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={12}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Nosso Valor" fill="#8884d8" />
                      <Bar dataKey="Média Mercado" fill="#82ca9d" />
                      <Bar dataKey="Melhor Mercado" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Fluxo de Aprovações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard.approvals.map((approval, index) => {
                  const StatusIcon = getApprovalStatusIcon(approval.status);
                  
                  return (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <StatusIcon className={`w-5 h-5 mr-2 ${getApprovalStatusColor(approval.status)}`} />
                          <div>
                            <h4 className="font-medium">{approval.level}</h4>
                            <p className="text-sm text-muted-foreground">{approval.approver}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            approval.status === 'approved' ? 'default' :
                            approval.status === 'rejected' ? 'destructive' :
                            approval.status === 'conditional' ? 'secondary' : 'outline'
                          }>
                            {approval.status === 'approved' ? 'APROVADO' :
                             approval.status === 'rejected' ? 'REJEITADO' :
                             approval.status === 'conditional' ? 'CONDICIONAL' : 'PENDENTE'}
                          </Badge>
                          {approval.status === 'pending' && (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedApproval(approval);
                                  setShowApprovalDialog(true);
                                }}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Aprovar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateApprovalStatus(approval.level, 'rejected', 'Rejeitado pelo usuário')}
                              >
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Rejeitar
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">{approval.comments}</p>
                      
                      {approval.date && (
                        <p className="text-xs text-muted-foreground">
                          {approval.status === 'approved' ? 'Aprovado' : 
                           approval.status === 'rejected' ? 'Rejeitado' : 'Atualizado'} em: {approval.date.toLocaleString()}
                        </p>
                      )}
                      
                      {approval.conditions && approval.conditions.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium mb-1">Condições:</p>
                          <ul className="text-sm text-muted-foreground">
                            {approval.conditions.map((condition, condIndex) => (
                              <li key={condIndex} className="flex items-start">
                                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                {condition}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* PDF Options Dialog */}
      {showPdfOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Opções de Geração PDF</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPdfOptions(false)}
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo de Template</label>
                <select
                  value={pdfOptions.templateType}
                  onChange={(e) => setPdfOptions(prev => ({ ...prev, templateType: e.target.value as any }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="standard">Padrão</option>
                  <option value="executive">Executivo</option>
                  <option value="detailed">Detalhado</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Seções a Incluir</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={pdfOptions.includeExecutiveSummary}
                      onChange={(e) => setPdfOptions(prev => ({ ...prev, includeExecutiveSummary: e.target.checked }))}
                      className="mr-2"
                    />
                    Resumo Executivo
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={pdfOptions.includeKPIs}
                      onChange={(e) => setPdfOptions(prev => ({ ...prev, includeKPIs: e.target.checked }))}
                      className="mr-2"
                    />
                    KPIs e Métricas
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={pdfOptions.includeRecommendations}
                      onChange={(e) => setPdfOptions(prev => ({ ...prev, includeRecommendations: e.target.checked }))}
                      className="mr-2"
                    />
                    Recomendações
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={pdfOptions.includeBenchmarks}
                      onChange={(e) => setPdfOptions(prev => ({ ...prev, includeBenchmarks: e.target.checked }))}
                      className="mr-2"
                    />
                    Análise de Benchmarks
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={pdfOptions.includeApprovals}
                      onChange={(e) => setPdfOptions(prev => ({ ...prev, includeApprovals: e.target.checked }))}
                      className="mr-2"
                    />
                    Status de Aprovações
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Idioma</label>
                <select
                  value={pdfOptions.language}
                  onChange={(e) => setPdfOptions(prev => ({ ...prev, language: e.target.value as any }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="pt">Português</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowPdfOptions(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    generatePDFReport(pdfOptions);
                    setShowPdfOptions(false);
                  }}
                  disabled={isGeneratingReport}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Gerar PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Dialog */}
      {showApprovalDialog && selectedApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Aprovar - {selectedApproval.level}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowApprovalDialog(false)}
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Aprovador: {selectedApproval.approver}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowApprovalDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    updateApprovalStatus(selectedApproval.level, 'approved', 'Aprovado pelo usuário');
                    setShowApprovalDialog(false);
                    setSelectedApproval(null);
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprovar
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    updateApprovalStatus(selectedApproval.level, 'conditional', 'Aprovação condicional', ['Revisar custos', 'Validar cronograma']);
                    setShowApprovalDialog(false);
                    setSelectedApproval(null);
                  }}
                >
                  Aprovar com Condições
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}