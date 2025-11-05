'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Activity, 
  BarChart3, 
  Clock, 
  Users, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Zap,
  Database,
  Cpu,
  MemoryStick,
  Download,
  RefreshCw,
  Calendar,
  Target,
  CheckCircle,
  XCircle
} from 'lucide-react';

import { ServiceDeskAnalytics } from '@/lib/types/service-desk-analytics';
import { ServiceDeskAnalyticsService } from '@/lib/services/service-desk-analytics-service';

export interface AnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AnalyticsDashboard({ isOpen, onClose }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<ServiceDeskAnalytics | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');

  const analyticsService = useMemo(() => new ServiceDeskAnalyticsService(), []);

  useEffect(() => {
    if (isOpen) {
      loadAnalytics();
    }
  }, [isOpen, timeRange]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '1d':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      const [analyticsData, alertsData] = await Promise.all([
        analyticsService.getAnalytics(startDate, endDate),
        analyticsService.getPerformanceAlerts()
      ]);

      setAnalytics(analyticsData);
      setAlerts(alertsData);
    } catch (err) {
      setError('Erro ao carregar dados de analytics');
      console.error('Error loading analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      setIsLoading(true);
      const report = await analyticsService.generateReport();
      
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Erro ao exportar relatório');
      console.error('Error exporting report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
    return `${(ms / 3600000).toFixed(1)}h`;
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  const getPerformanceColor = (value: number, threshold: number, inverse: boolean = false) => {
    const isGood = inverse ? value < threshold : value > threshold;
    return isGood ? 'text-green-600' : 'text-red-600';
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Dashboard de Analytics</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Último dia</SelectItem>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" onClick={loadAnalytics} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleExportReport} disabled={isLoading}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Alerts Section */}
          {alerts.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {alerts.map((alert, index) => (
                  <Alert key={index} variant={alert.severity === 'error' ? 'destructive' : 'default'}>
                    <div className="flex items-center space-x-2">
                      {getAlertIcon(alert.severity)}
                      <AlertDescription className="text-sm">
                        {alert.message}
                      </AlertDescription>
                    </div>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="usage">Uso</TabsTrigger>
              <TabsTrigger value="errors">Erros</TabsTrigger>
              <TabsTrigger value="business">Negócio</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="flex-1 overflow-auto space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p>Carregando analytics...</p>
                  </div>
                </div>
              ) : analytics ? (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <Activity className="h-4 w-4 mr-2" />
                          Uptime
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {analytics.systemMetrics.availability.uptime.toFixed(1)}%
                        </div>
                        <p className="text-xs text-gray-600">
                          {formatDuration(analytics.systemMetrics.uptime)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Tempo de Resposta
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold ${getPerformanceColor(analytics.systemMetrics.responseTime.average, 1000, true)}`}>
                          {analytics.systemMetrics.responseTime.average.toFixed(0)}ms
                        </div>
                        <p className="text-xs text-gray-600">
                          P95: {analytics.systemMetrics.responseTime.p95.toFixed(0)}ms
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <MemoryStick className="h-4 w-4 mr-2" />
                          Uso de Memória
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold ${getPerformanceColor(analytics.systemMetrics.memoryUsage.percentage, 80, true)}`}>
                          {analytics.systemMetrics.memoryUsage.percentage.toFixed(1)}%
                        </div>
                        <p className="text-xs text-gray-600">
                          {formatBytes(analytics.systemMetrics.memoryUsage.used)} / {formatBytes(analytics.systemMetrics.memoryUsage.total)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Taxa de Erro
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className={`text-2xl font-bold ${getPerformanceColor(analytics.errorMetrics.errorFrequency.errorRate, 5, true)}`}>
                          {analytics.errorMetrics.errorFrequency.errorRate.toFixed(1)}%
                        </div>
                        <p className="text-xs text-gray-600">
                          {analytics.errorMetrics.errorFrequency.totalErrors} erros
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Usage Overview */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Users className="h-5 w-5 mr-2" />
                          Métricas de Uso
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Sessões Ativas</span>
                          <Badge variant="outline">{analytics.usageMetrics.totalSessions}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Duração Média da Sessão</span>
                          <Badge variant="outline">
                            {formatDuration(analytics.usageMetrics.averageSessionDuration)}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Cálculos Realizados</span>
                          <Badge variant="outline">
                            {analytics.usageMetrics.featureUsage.calculations.totalCalculations}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Validações Executadas</span>
                          <Badge variant="outline">
                            {analytics.usageMetrics.featureUsage.validations.totalValidations}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Target className="h-5 w-5 mr-2" />
                          Performance do Sistema
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Throughput</span>
                          <Badge variant="outline">
                            {analytics.systemMetrics.throughput.requestsPerSecond.toFixed(1)} req/s
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Cálculos/s</span>
                          <Badge variant="outline">
                            {analytics.systemMetrics.throughput.calculationsPerSecond.toFixed(1)}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Operações de Dados/s</span>
                          <Badge variant="outline">
                            {analytics.systemMetrics.throughput.dataOperationsPerSecond.toFixed(1)}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Pico de Throughput</span>
                          <Badge variant="outline">
                            {analytics.systemMetrics.throughput.peakThroughput.toFixed(1)} req/s
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Tab Usage */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Uso por Aba</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(analytics.usageMetrics.tabUsage).map(([tabId, usage]) => (
                          <div key={tabId} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium capitalize">{tabId}</span>
                              <Badge variant="secondary" className="text-xs">
                                {usage.visits} visitas
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <span>{formatDuration(usage.timeSpent)}</span>
                              <span>•</span>
                              <span>{usage.completionRate.toFixed(1)}% conclusão</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum dado de analytics disponível</p>
                </div>
              )}
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="flex-1 overflow-auto space-y-4">
              {analytics && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Tempo de Resposta</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs">Média</span>
                          <span className="text-xs font-mono">
                            {analytics.systemMetrics.responseTime.average.toFixed(0)}ms
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs">Mediana</span>
                          <span className="text-xs font-mono">
                            {analytics.systemMetrics.responseTime.median.toFixed(0)}ms
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs">P95</span>
                          <span className="text-xs font-mono">
                            {analytics.systemMetrics.responseTime.p95.toFixed(0)}ms
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs">P99</span>
                          <span className="text-xs font-mono">
                            {analytics.systemMetrics.responseTime.p99.toFixed(0)}ms
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Uso de Recursos</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs">CPU</span>
                          <span className="text-xs font-mono">
                            {analytics.performanceMetrics.resourceMetrics.cpuUsage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs">Memória</span>
                          <span className="text-xs font-mono">
                            {formatBytes(analytics.performanceMetrics.resourceMetrics.memoryUsage)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs">Disco</span>
                          <span className="text-xs font-mono">
                            {formatBytes(analytics.performanceMetrics.resourceMetrics.diskUsage)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs">Rede</span>
                          <span className="text-xs font-mono">
                            {formatBytes(analytics.performanceMetrics.resourceMetrics.networkUsage)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Cálculos</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs">Total</span>
                          <span className="text-xs font-mono">
                            {analytics.performanceMetrics.calculationMetrics.totalCalculations}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs">Tempo Médio</span>
                          <span className="text-xs font-mono">
                            {analytics.performanceMetrics.calculationMetrics.averageCalculationTime.toFixed(0)}ms
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs">Lentos</span>
                          <span className="text-xs font-mono">
                            {analytics.performanceMetrics.calculationMetrics.slowCalculations}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Métricas de Rede</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Latência Média</span>
                            <Badge variant="outline">
                              {analytics.performanceMetrics.networkMetrics.averageLatency.toFixed(0)}ms
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Requisições</span>
                            <Badge variant="outline">
                              {analytics.performanceMetrics.networkMetrics.requestCount}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Falhas</span>
                            <Badge variant={analytics.performanceMetrics.networkMetrics.failedRequests > 0 ? "destructive" : "outline"}>
                              {analytics.performanceMetrics.networkMetrics.failedRequests}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Upload</span>
                            <Badge variant="outline">
                              {formatBytes(analytics.performanceMetrics.networkMetrics.bandwidth.upload)}/s
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Download</span>
                            <Badge variant="outline">
                              {formatBytes(analytics.performanceMetrics.networkMetrics.bandwidth.download)}/s
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Pico</span>
                            <Badge variant="outline">
                              {formatBytes(analytics.performanceMetrics.networkMetrics.bandwidth.peak)}/s
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Usage Tab */}
            <TabsContent value="usage" className="flex-1 overflow-auto space-y-4">
              {analytics && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Uso de Funcionalidades</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Cálculos</span>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              {analytics.usageMetrics.featureUsage.calculations.totalCalculations}
                            </Badge>
                            <Badge variant={analytics.usageMetrics.featureUsage.calculations.failedCalculations > 0 ? "destructive" : "secondary"}>
                              {analytics.usageMetrics.featureUsage.calculations.failedCalculations} falhas
                            </Badge>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Validações</span>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              {analytics.usageMetrics.featureUsage.validations.totalValidations}
                            </Badge>
                            <Badge variant={analytics.usageMetrics.featureUsage.validations.failedValidations > 0 ? "destructive" : "secondary"}>
                              {analytics.usageMetrics.featureUsage.validations.failedValidations} falhas
                            </Badge>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Operações de Dados</span>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              {analytics.usageMetrics.featureUsage.dataOperations.saves + 
                               analytics.usageMetrics.featureUsage.dataOperations.loads}
                            </Badge>
                            <Badge variant={analytics.usageMetrics.featureUsage.dataOperations.failures > 0 ? "destructive" : "secondary"}>
                              {analytics.usageMetrics.featureUsage.dataOperations.failures} falhas
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Templates</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Templates Aplicados</span>
                          <Badge variant="outline">
                            {analytics.usageMetrics.templateUsage.templatesApplied}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Templates Criados</span>
                          <Badge variant="outline">
                            {analytics.usageMetrics.templateUsage.templatesCreated}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Taxa de Sucesso</span>
                          <Badge variant="outline">
                            {analytics.usageMetrics.templateUsage.templateSuccessRate.toFixed(1)}%
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Distribuição de Uso por Horário</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-12 gap-1">
                        {Array.from({ length: 24 }, (_, hour) => {
                          const usage = analytics.usageMetrics.timeDistribution.hourlyUsage[hour] || 0;
                          const maxUsage = Math.max(...Object.values(analytics.usageMetrics.timeDistribution.hourlyUsage));
                          const intensity = maxUsage > 0 ? usage / maxUsage : 0;
                          
                          return (
                            <div
                              key={hour}
                              className="text-center"
                              title={`${hour}h: ${usage} eventos`}
                            >
                              <div className="text-xs mb-1">{hour}</div>
                              <div
                                className="h-8 bg-blue-500 rounded"
                                style={{ opacity: intensity }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Errors Tab */}
            <TabsContent value="errors" className="flex-1 overflow-auto space-y-4">
              {analytics && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Total de Erros</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                          {analytics.errorMetrics.errorFrequency.totalErrors}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Taxa de Erro</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                          {analytics.errorMetrics.errorFrequency.errorRate.toFixed(1)}%
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Erros Críticos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-800">
                          {analytics.errorMetrics.errorSeverity.criticalErrors}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Não Resolvidos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                          {analytics.errorMetrics.errorResolution.unresolved}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Erros por Tipo</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {Object.entries(analytics.errorMetrics.errorFrequency.errorsByType).map(([type, count]) => (
                            <div key={type} className="flex justify-between items-center">
                              <span className="text-sm">{type}</span>
                              <Badge variant="destructive">{count}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Distribuição por Severidade</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Crítico</span>
                            <Badge variant="destructive">
                              {analytics.errorMetrics.errorSeverity.criticalErrors}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Alto</span>
                            <Badge variant="destructive">
                              {analytics.errorMetrics.errorSeverity.highSeverityErrors}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Médio</span>
                            <Badge variant="secondary">
                              {analytics.errorMetrics.errorSeverity.mediumSeverityErrors}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Baixo</span>
                            <Badge variant="outline">
                              {analytics.errorMetrics.errorSeverity.lowSeverityErrors}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Business Tab */}
            <TabsContent value="business" className="flex-1 overflow-auto space-y-4">
              {analytics && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Projetos Concluídos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {analytics.businessMetrics.productivityMetrics.projectsCompleted}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Duração Média</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatDuration(analytics.businessMetrics.productivityMetrics.averageProjectDuration)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Tempo até Valor</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatDuration(analytics.businessMetrics.productivityMetrics.timeToValue)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">ROI</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {analytics.businessMetrics.valueMetrics.roi.roi.toFixed(1)}%
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Métricas de Qualidade</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Precisão dos Cálculos</span>
                          <Badge variant="outline">
                            {analytics.businessMetrics.qualityMetrics.accuracyMetrics.calculationAccuracy.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Precisão dos Dados</span>
                          <Badge variant="outline">
                            {analytics.businessMetrics.qualityMetrics.accuracyMetrics.dataAccuracy.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Completude dos Dados</span>
                          <Badge variant="outline">
                            {analytics.businessMetrics.qualityMetrics.completenessMetrics.dataCompleteness.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Consistência</span>
                          <Badge variant="outline">
                            {analytics.businessMetrics.qualityMetrics.consistencyMetrics.crossTabConsistency.toFixed(1)}%
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Valor para o Usuário</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Satisfação do Usuário</span>
                          <Badge variant="outline">
                            {analytics.businessMetrics.valueMetrics.userValue.userSatisfaction.toFixed(1)}/10
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Conclusão de Tarefas</span>
                          <Badge variant="outline">
                            {analytics.businessMetrics.valueMetrics.userValue.taskCompletion.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Retenção de Usuários</span>
                          <Badge variant="outline">
                            {analytics.businessMetrics.valueMetrics.userValue.userRetention.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Score de Recomendação</span>
                          <Badge variant="outline">
                            {analytics.businessMetrics.valueMetrics.userValue.recommendationScore.toFixed(1)}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}