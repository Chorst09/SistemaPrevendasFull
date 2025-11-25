'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  DollarSign, 
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  Activity,
  FileText,
  Calendar,
  Zap,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download
} from 'lucide-react';
import { ServiceDeskData } from '@/lib/types/service-desk-pricing';
import { useProjectData } from '@/hooks/use-project-data';
import { useReportGeneration } from '@/hooks/use-report-generation';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface SystemDashboardProps {
  data?: ServiceDeskData;
  userId: string;
}

interface DashboardMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  averageProjectValue: number;
  totalTeamMembers: number;
  averageTeamSize: number;
  reportsGenerated: number;
  completionRate: number;
  growthRate: number;
}

interface ProjectSummary {
  id: string;
  name: string;
  client: string;
  status: string;
  value: number;
  completion: number;
  lastUpdated: Date;
  teamSize: number;
}

export function SystemDashboard({ data, userId }: SystemDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  
  const { reports } = useReportGeneration();
  
  // Mock data for demonstration - in real app, this would come from API
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalRevenue: 0,
    averageProjectValue: 0,
    totalTeamMembers: 0,
    averageTeamSize: 0,
    reportsGenerated: 0,
    completionRate: 0,
    growthRate: 0
  });

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, [userId, timeRange]);

  const loadDashboardData = async () => {
    try {
      // In a real implementation, this would fetch from API
      // For now, we'll use mock data
      const mockProjects: ProjectSummary[] = [
        {
          id: '1',
          name: 'Service Desk Banco ABC',
          client: 'Banco ABC',
          status: 'active',
          value: 850000,
          completion: 85,
          lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          teamSize: 12
        },
        {
          id: '2',
          name: 'Help Desk Empresa XYZ',
          client: 'Empresa XYZ',
          status: 'completed',
          value: 450000,
          completion: 100,
          lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          teamSize: 8
        },
        {
          id: '3',
          name: 'Suporte TI Corporativo',
          client: 'Corp Solutions',
          status: 'active',
          value: 1200000,
          completion: 65,
          lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          teamSize: 15
        }
      ];

      setProjects(mockProjects);

      const calculatedMetrics: DashboardMetrics = {
        totalProjects: mockProjects.length,
        activeProjects: mockProjects.filter(p => p.status === 'active').length,
        completedProjects: mockProjects.filter(p => p.status === 'completed').length,
        totalRevenue: mockProjects.reduce((sum, p) => sum + p.value, 0),
        averageProjectValue: mockProjects.reduce((sum, p) => sum + p.value, 0) / mockProjects.length,
        totalTeamMembers: mockProjects.reduce((sum, p) => sum + p.teamSize, 0),
        averageTeamSize: mockProjects.reduce((sum, p) => sum + p.teamSize, 0) / mockProjects.length,
        reportsGenerated: reports.length,
        completionRate: mockProjects.reduce((sum, p) => sum + p.completion, 0) / mockProjects.length,
        growthRate: 15.5 // Mock growth rate
      };

      setMetrics(calculatedMetrics);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const recentProjects = useMemo(() => {
    return projects
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
      .slice(0, 5);
  }, [projects]);

  const recentReports = useMemo(() => {
    return reports
      .filter(r => r.status === 'completed')
      .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
      .slice(0, 3);
  }, [reports]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral dos seus projetos e atividades
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={loadDashboardData}>
            Atualizar
          </Button>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-700">Total de Projetos</p>
                <p className="text-3xl font-bold text-blue-900">{metrics.totalProjects}</p>
                <p className="text-xs text-blue-600 mt-1 font-medium">
                  {metrics.activeProjects} ativos
                </p>
              </div>
              <div className="p-3 bg-blue-500 rounded-lg shadow-md">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-700">Receita Total</p>
                <p className="text-3xl font-bold text-green-900">{formatCurrency(metrics.totalRevenue)}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <p className="text-xs text-green-700 font-medium">+{metrics.growthRate}%</p>
                </div>
              </div>
              <div className="p-3 bg-green-500 rounded-lg shadow-md">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-700">Equipe Total</p>
                <p className="text-3xl font-bold text-purple-900">{metrics.totalTeamMembers}</p>
                <p className="text-xs text-purple-600 mt-1 font-medium">
                  Média {Math.round(metrics.averageTeamSize)} por projeto
                </p>
              </div>
              <div className="p-3 bg-purple-500 rounded-lg shadow-md">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-orange-700">Taxa de Conclusão</p>
                <p className="text-3xl font-bold text-orange-900">{Math.round(metrics.completionRate)}%</p>
                <div className="w-full bg-orange-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all" 
                    style={{ width: `${metrics.completionRate}%` }}
                  ></div>
                </div>
              </div>
              <div className="p-3 bg-orange-500 rounded-lg shadow-md">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="projects">Projetos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-slate-800">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span>Atividade Recente</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-slate-900">{project.name}</p>
                        <p className="text-xs text-slate-600">{project.client}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(project.status)}>
                        {project.status === 'active' ? 'Ativo' : 'Concluído'}
                      </Badge>
                      <p className="text-xs text-slate-600 mt-1">
                        {formatDistanceToNow(project.lastUpdated, { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-slate-800">
                  <Award className="h-5 w-5 text-purple-600" />
                  <span>Métricas de Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">Valor Médio por Projeto</span>
                    <span className="text-sm font-bold text-green-700">{formatCurrency(metrics.averageProjectValue)}</span>
                  </div>
                  <Progress value={75} className="h-3 bg-slate-200" />
                </div>

                <div className="space-y-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">Projetos Concluídos</span>
                    <span className="text-sm font-bold text-blue-700">{metrics.completedProjects}/{metrics.totalProjects}</span>
                  </div>
                  <Progress value={(metrics.completedProjects / metrics.totalProjects) * 100} className="h-3 bg-slate-200" />
                </div>

                <div className="space-y-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">Relatórios Gerados</span>
                    <span className="text-sm font-bold text-orange-700">{metrics.reportsGenerated}</span>
                  </div>
                  <Progress value={Math.min((metrics.reportsGenerated / 10) * 100, 100)} className="h-3 bg-slate-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Projetos Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold">{project.name}</h3>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status === 'active' ? 'Ativo' : 'Concluído'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{project.client}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatCurrency(project.value)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{project.teamSize} membros</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatDistanceToNow(project.lastUpdated, { addSuffix: true, locale: ptBR })}</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium mb-2">{project.completion}% completo</div>
                      <Progress value={project.completion} className="w-24 h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentReports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum relatório gerado ainda</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{report.config.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {report.config.type} • {report.config.format.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(report.generatedAt, { addSuffix: true, locale: ptBR })}
                        </span>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}