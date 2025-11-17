'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Project, ProjectStatus, ProjectType } from '@/lib/types/project';
import { 
  Info, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  CheckSquare, 
  Users,
  TrendingUp,
  FileText,
  ArrowLeft,
  Edit,
  Download,
  Play,
  Pause,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ProjectDetailViewProps {
  project: Project;
  onUpdate: (updates: Partial<Project>) => void;
  onBack: () => void;
}

export function ProjectDetailView({ project, onUpdate, onBack }: ProjectDetailViewProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedProject, setEditedProject] = useState<Partial<Project>>(project);

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.PLANNING: return 'secondary';
      case ProjectStatus.IN_PROGRESS: return 'default';
      case ProjectStatus.ON_HOLD: return 'outline';
      case ProjectStatus.COMPLETED: return 'default';
      case ProjectStatus.CANCELLED: return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.PLANNING: return 'Planejamento';
      case ProjectStatus.IN_PROGRESS: return 'Em Andamento';
      case ProjectStatus.ON_HOLD: return 'Pausado';
      case ProjectStatus.COMPLETED: return 'Concluído';
      case ProjectStatus.CANCELLED: return 'Cancelado';
      default: return status;
    }
  };

  const handleStatusChange = (newStatus: ProjectStatus) => {
    onUpdate({ status: newStatus });
  };

  const handleSaveEdit = () => {
    onUpdate(editedProject);
    setIsEditDialogOpen(false);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(project, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `projeto-${project.id}.json`;
    link.click();
  };

  const getBudgetPercentage = () => {
    return (project.budget.spentBudget / project.budget.totalBudget) * 100;
  };

  const getTimeProgress = () => {
    if (!project.startDate || !project.endDate) return 0;
    const start = new Date(project.startDate).getTime();
    const end = new Date(project.endDate).getTime();
    const now = Date.now();
    const total = end - start;
    const elapsed = now - start;
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  return (
    <div className="space-y-6">
      {/* Header com Ações */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <Button variant="ghost" size="sm" onClick={onBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </div>
              <div className="flex items-center space-x-3 mb-2">
                <CardTitle className="text-2xl">{project.name}</CardTitle>
                <Badge variant={getStatusColor(project.status)}>
                  {getStatusLabel(project.status)}
                </Badge>
                <Badge variant="outline">{project.type}</Badge>
              </div>
              <p className="text-muted-foreground">{project.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={project.status} onValueChange={(value) => handleStatusChange(value as ProjectStatus)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ProjectStatus.PLANNING}>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Planejamento
                    </div>
                  </SelectItem>
                  <SelectItem value={ProjectStatus.IN_PROGRESS}>
                    <div className="flex items-center">
                      <Play className="h-4 w-4 mr-2" />
                      Em Andamento
                    </div>
                  </SelectItem>
                  <SelectItem value={ProjectStatus.ON_HOLD}>
                    <div className="flex items-center">
                      <Pause className="h-4 w-4 mr-2" />
                      Pausado
                    </div>
                  </SelectItem>
                  <SelectItem value={ProjectStatus.COMPLETED}>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Concluído
                    </div>
                  </SelectItem>
                  <SelectItem value={ProjectStatus.CANCELLED}>
                    <div className="flex items-center">
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancelado
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span>Progresso Geral</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{project.progress.overallProgress}%</div>
            <Progress value={project.progress.overallProgress} className="mb-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Tempo: {getTimeProgress().toFixed(0)}%</span>
              <span>
                {project.progress.tasksCompleted}/{project.progress.totalTasks} tarefas
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span>Orçamento</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {project.budget.currency} {project.budget.totalBudget.toLocaleString()}
            </div>
            <Progress value={getBudgetPercentage()} className="mb-2" />
            <div className="flex justify-between text-xs">
              <span className="text-orange-600">
                Gasto: {project.budget.spentBudget.toLocaleString()}
              </span>
              <span className="text-green-600">
                Restante: {project.budget.remainingBudget.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-600" />
              <span>Equipe</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{project.team.length}</div>
            <p className="text-xs text-gray-500">
              {project.team.length === 1 ? 'membro' : 'membros'} alocados
            </p>
            <div className="mt-2 text-xs text-gray-500">
              Alocação média: {project.team.length > 0 
                ? (project.team.reduce((sum, m) => sum + m.allocation, 0) / project.team.length).toFixed(0)
                : 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span>Riscos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{project.risks.length}</div>
            <p className="text-xs text-gray-500 mb-2">
              {project.risks.length === 1 ? 'risco identificado' : 'riscos identificados'}
            </p>
            {project.risks.length > 0 && (
              <div className="flex gap-1 text-xs">
                <Badge variant="destructive" className="text-xs">
                  {project.risks.filter(r => r.riskScore >= 8).length} Alto
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {project.risks.filter(r => r.riskScore >= 5 && r.riskScore < 8).length} Médio
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {project.risks.filter(r => r.riskScore < 5).length} Baixo
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="timeline">Cronograma</TabsTrigger>
          <TabsTrigger value="budget">Orçamento</TabsTrigger>
          <TabsTrigger value="team">Equipe</TabsTrigger>
          <TabsTrigger value="risks">Riscos</TabsTrigger>
          <TabsTrigger value="deliverables">Entregas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Status de Saúde do Projeto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Status de Saúde do Projeto</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg" style={{
                  backgroundColor: project.progress.healthIndicators.schedule === 'on-track' ? '#dcfce7' : 
                                   project.progress.healthIndicators.schedule === 'at-risk' ? '#fef3c7' : '#fee2e2'
                }}>
                  <Calendar className="h-6 w-6 mx-auto mb-2" style={{
                    color: project.progress.healthIndicators.schedule === 'on-track' ? '#16a34a' : 
                           project.progress.healthIndicators.schedule === 'at-risk' ? '#ca8a04' : '#dc2626'
                  }} />
                  <div className="text-xs font-medium">Cronograma</div>
                  <div className="text-xs mt-1">
                    {project.progress.healthIndicators.schedule === 'on-track' ? 'No Prazo' :
                     project.progress.healthIndicators.schedule === 'at-risk' ? 'Em Risco' : 'Atrasado'}
                  </div>
                </div>

                <div className="text-center p-4 rounded-lg" style={{
                  backgroundColor: project.progress.healthIndicators.budget === 'on-track' ? '#dcfce7' : 
                                   project.progress.healthIndicators.budget === 'at-risk' ? '#fef3c7' : '#fee2e2'
                }}>
                  <DollarSign className="h-6 w-6 mx-auto mb-2" style={{
                    color: project.progress.healthIndicators.budget === 'on-track' ? '#16a34a' : 
                           project.progress.healthIndicators.budget === 'at-risk' ? '#ca8a04' : '#dc2626'
                  }} />
                  <div className="text-xs font-medium">Orçamento</div>
                  <div className="text-xs mt-1">
                    {project.progress.healthIndicators.budget === 'on-track' ? 'No Orçamento' :
                     project.progress.healthIndicators.budget === 'at-risk' ? 'Em Risco' : 'Acima'}
                  </div>
                </div>

                <div className="text-center p-4 rounded-lg" style={{
                  backgroundColor: project.progress.healthIndicators.scope === 'on-track' ? '#dcfce7' : 
                                   project.progress.healthIndicators.scope === 'at-risk' ? '#fef3c7' : '#fee2e2'
                }}>
                  <FileText className="h-6 w-6 mx-auto mb-2" style={{
                    color: project.progress.healthIndicators.scope === 'on-track' ? '#16a34a' : 
                           project.progress.healthIndicators.scope === 'at-risk' ? '#ca8a04' : '#dc2626'
                  }} />
                  <div className="text-xs font-medium">Escopo</div>
                  <div className="text-xs mt-1">
                    {project.progress.healthIndicators.scope === 'on-track' ? 'Controlado' :
                     project.progress.healthIndicators.scope === 'at-risk' ? 'Em Risco' : 'Expandindo'}
                  </div>
                </div>

                <div className="text-center p-4 rounded-lg" style={{
                  backgroundColor: project.progress.healthIndicators.quality === 'on-track' ? '#dcfce7' : 
                                   project.progress.healthIndicators.quality === 'at-risk' ? '#fef3c7' : '#fee2e2'
                }}>
                  <CheckSquare className="h-6 w-6 mx-auto mb-2" style={{
                    color: project.progress.healthIndicators.quality === 'on-track' ? '#16a34a' : 
                           project.progress.healthIndicators.quality === 'at-risk' ? '#ca8a04' : '#dc2626'
                  }} />
                  <div className="text-xs font-medium">Qualidade</div>
                  <div className="text-xs mt-1">
                    {project.progress.healthIndicators.quality === 'on-track' ? 'Boa' :
                     project.progress.healthIndicators.quality === 'at-risk' ? 'Em Risco' : 'Com Problemas'}
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-lg" style={{
                backgroundColor: project.progress.healthStatus === 'green' ? '#dcfce7' : 
                                 project.progress.healthStatus === 'yellow' ? '#fef3c7' : '#fee2e2'
              }}>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{
                    backgroundColor: project.progress.healthStatus === 'green' ? '#16a34a' : 
                                     project.progress.healthStatus === 'yellow' ? '#ca8a04' : '#dc2626'
                  }} />
                  <span className="font-semibold">
                    Status Geral: {project.progress.healthStatus === 'green' ? 'Saudável' :
                                   project.progress.healthStatus === 'yellow' ? 'Atenção Necessária' : 'Crítico'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5" />
                <span>Informações Gerais</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Cliente:</span>
                  <p className="font-medium">{project.clientId || 'Não informado'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Gerente do Projeto:</span>
                  <p className="font-medium">{project.projectManager || 'Não atribuído'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Criado em:</span>
                  <p className="font-medium">{new Date(project.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <span className="text-gray-500">Última Atualização:</span>
                  <p className="font-medium">{new Date(project.updatedAt).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <span className="text-gray-500">Início:</span>
                  <p className="font-medium">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString('pt-BR') : 'Não definido'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Fim Previsto:</span>
                  <p className="font-medium">
                    {project.endDate ? new Date(project.endDate).toLocaleDateString('pt-BR') : 'Não definido'}
                  </p>
                </div>
                {project.estimatedDuration && (
                  <div>
                    <span className="text-gray-500">Duração Estimada:</span>
                    <p className="font-medium">{project.estimatedDuration} dias</p>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Prioridade:</span>
                  <Badge variant={
                    project.priority === 'CRITICAL' ? 'destructive' :
                    project.priority === 'HIGH' ? 'secondary' : 'outline'
                  }>
                    {project.priority === 'CRITICAL' ? 'Crítica' :
                     project.priority === 'HIGH' ? 'Alta' :
                     project.priority === 'MEDIUM' ? 'Média' : 'Baixa'}
                  </Badge>
                </div>
              </div>

              {project.tags && project.tags.length > 0 && (
                <div className="pt-3 border-t">
                  <span className="text-gray-500 text-sm">Tags:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.tags.map((tag, i) => (
                      <Badge key={i} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Escopo do Projeto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <CheckSquare className="h-4 w-4 mr-2 text-green-600" />
                  Objetivos
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {project.scope.objectives.map((obj, i) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-blue-600" />
                  Entregas Principais
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {project.scope.deliverables.map((del, i) => (
                    <li key={i}>{del}</li>
                  ))}
                </ul>
              </div>

              {project.scope.outOfScope && project.scope.outOfScope.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <XCircle className="h-4 w-4 mr-2 text-red-600" />
                    Fora do Escopo
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {project.scope.outOfScope.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {project.scope.assumptions && project.scope.assumptions.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-2 text-purple-600" />
                    Premissas
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {project.scope.assumptions.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {project.scope.constraints && project.scope.constraints.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
                    Restrições
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {project.scope.constraints.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {project.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{project.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Cronograma do Projeto</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progresso do Cronograma</span>
                  <span className="text-sm font-bold">{getTimeProgress().toFixed(0)}%</span>
                </div>
                <Progress value={getTimeProgress()} className="mb-2" />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>
                    Início: {project.startDate ? new Date(project.startDate).toLocaleDateString('pt-BR') : 'N/A'}
                  </span>
                  <span>
                    Término: {project.endDate ? new Date(project.endDate).toLocaleDateString('pt-BR') : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {project.timeline.phases.map((phase) => {
                  const phaseProgress = phase.tasks.length > 0
                    ? (phase.tasks.filter(t => t.status === 'done').length / phase.tasks.length) * 100
                    : 0;

                  return (
                    <div key={phase.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-semibold text-lg">{phase.name}</h4>
                          <Badge variant={
                            phase.status === 'completed' ? 'default' :
                            phase.status === 'in-progress' ? 'secondary' :
                            phase.status === 'delayed' ? 'destructive' : 'outline'
                          }>
                            {phase.status === 'completed' ? 'Concluída' :
                             phase.status === 'in-progress' ? 'Em Andamento' :
                             phase.status === 'delayed' ? 'Atrasada' : 'Pendente'}
                          </Badge>
                        </div>
                        <span className="text-sm font-medium text-gray-600">
                          {phaseProgress.toFixed(0)}%
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{phase.description}</p>

                      <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(phase.startDate).toLocaleDateString('pt-BR')} - {new Date(phase.endDate).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center">
                          <CheckSquare className="h-3 w-3 mr-1" />
                          {phase.tasks.filter(t => t.status === 'done').length}/{phase.tasks.length} tarefas
                        </div>
                      </div>

                      <Progress value={phaseProgress} className="mb-3" />

                      {phase.tasks.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-xs font-semibold text-gray-700 mb-2">Tarefas:</p>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {phase.tasks.map(task => (
                              <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                                <div className="flex items-center space-x-2 flex-1">
                                  <CheckSquare className={`h-3 w-3 ${task.status === 'done' ? 'text-green-600' : 'text-gray-400'}`} />
                                  <span className={task.status === 'done' ? 'line-through text-gray-500' : ''}>
                                    {task.name}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {task.assignedTo && (
                                    <Badge variant="outline" className="text-xs">
                                      {task.assignedTo}
                                    </Badge>
                                  )}
                                  <Badge variant={
                                    task.status === 'done' ? 'default' :
                                    task.status === 'in-progress' ? 'secondary' : 'outline'
                                  } className="text-xs">
                                    {task.status === 'done' ? 'Concluída' :
                                     task.status === 'in-progress' ? 'Em Andamento' :
                                     task.status === 'review' ? 'Em Revisão' : 'A Fazer'}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Milestones */}
          {project.timeline.milestones && project.timeline.milestones.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Marcos do Projeto</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.timeline.milestones.map(milestone => (
                    <div key={milestone.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className={`h-5 w-5 ${milestone.status === 'achieved' ? 'text-green-600' : milestone.status === 'missed' ? 'text-red-600' : 'text-gray-400'}`} />
                        <div>
                          <p className="font-medium">{milestone.name}</p>
                          <p className="text-xs text-gray-500 mb-1">{milestone.description}</p>
                          <p className="text-xs text-gray-500">
                            Prazo: {new Date(milestone.dueDate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        milestone.status === 'achieved' ? 'default' : 
                        milestone.status === 'missed' ? 'destructive' : 'outline'
                      }>
                        {milestone.status === 'achieved' ? 'Alcançado' : 
                         milestone.status === 'missed' ? 'Perdido' : 'Pendente'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="budget">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Orçamento do Projeto</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Orçamento Total</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {project.budget.currency} {project.budget.totalBudget.toLocaleString()}
                  </div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Gasto</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {project.budget.currency} {project.budget.spentBudget.toLocaleString()}
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Restante</div>
                  <div className="text-2xl font-bold text-green-600">
                    {project.budget.currency} {project.budget.remainingBudget.toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Breakdown de Custos</h4>
                <div className="space-y-2">
                  {project.budget.breakdown.map(item => (
                    <div key={item.id} className="flex justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{item.category}</p>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {project.budget.currency} {item.plannedCost.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Gasto: {item.actualCost.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Equipe do Projeto</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project.team.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhum membro na equipe</p>
              ) : (
                <div className="space-y-3">
                  {project.team.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.role}</p>
                      </div>
                      <Badge variant="outline">{member.allocation}%</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Análise de Riscos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project.risks.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum risco identificado</p>
                  <p className="text-xs text-gray-400 mt-1">Isso é ótimo! Continue monitorando o projeto.</p>
                </div>
              ) : (
                <>
                  {/* Resumo de Riscos */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {project.risks.filter(r => r.riskScore >= 8).length}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Riscos Altos</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {project.risks.filter(r => r.riskScore >= 5 && r.riskScore < 8).length}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Riscos Médios</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {project.risks.filter(r => r.riskScore < 5).length}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Riscos Baixos</div>
                    </div>
                  </div>

                  {/* Lista de Riscos */}
                  <div className="space-y-4">
                    {project.risks
                      .sort((a, b) => b.riskScore - a.riskScore)
                      .map(risk => (
                        <div key={risk.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start space-x-3 flex-1">
                              <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                                risk.riskScore >= 8 ? 'text-red-600' :
                                risk.riskScore >= 5 ? 'text-orange-600' : 'text-yellow-600'
                              }`} />
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg mb-1">{risk.title}</h4>
                                <p className="text-sm text-gray-600">{risk.description}</p>
                              </div>
                            </div>
                            <Badge variant={
                              risk.riskScore >= 8 ? 'destructive' :
                              risk.riskScore >= 5 ? 'secondary' : 'outline'
                            } className="ml-2">
                              Score: {risk.riskScore}
                            </Badge>
                          </div>

                          <div className="flex items-center space-x-2 mb-3">
                            <Badge variant="outline" className="text-xs">
                              {risk.category === 'technical' ? 'Técnico' :
                               risk.category === 'financial' ? 'Financeiro' :
                               risk.category === 'resource' ? 'Recursos' :
                               risk.category === 'schedule' ? 'Cronograma' : 'Externo'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Prob: {risk.probability === 'high' ? 'Alta' : risk.probability === 'medium' ? 'Média' : 'Baixa'}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Impacto: {risk.impact === 'high' ? 'Alto' : risk.impact === 'medium' ? 'Médio' : 'Baixo'}
                            </Badge>
                            <Badge variant={
                              risk.status === 'mitigating' ? 'default' : 
                              risk.status === 'closed' ? 'secondary' : 'outline'
                            } className="text-xs">
                              {risk.status === 'identified' ? 'Identificado' : 
                               risk.status === 'analyzing' ? 'Analisando' : 
                               risk.status === 'mitigating' ? 'Mitigando' : 'Fechado'}
                            </Badge>
                          </div>

                          {risk.mitigationPlan && (
                            <div className="mt-3 p-3 bg-blue-50 rounded">
                              <p className="text-xs font-semibold text-blue-900 mb-1">Plano de Mitigação:</p>
                              <p className="text-xs text-blue-800">{risk.mitigationPlan}</p>
                            </div>
                          )}

                          {risk.owner && (
                            <div className="mt-2 flex items-center text-xs text-gray-500">
                              <Users className="h-3 w-3 mr-1" />
                              Responsável: {risk.owner}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deliverables">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Entregas do Projeto</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project.deliverables.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhuma entrega definida</p>
              ) : (
                <div className="space-y-3">
                  {project.deliverables.map(deliverable => (
                    <div key={deliverable.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{deliverable.name}</h4>
                        <Badge variant={
                          deliverable.status === 'delivered' ? 'default' :
                          deliverable.status === 'approved' ? 'default' :
                          deliverable.status === 'in-progress' ? 'secondary' : 'outline'
                        }>
                          {deliverable.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{deliverable.description}</p>
                      <div className="text-xs text-gray-500">
                        Prazo: {new Date(deliverable.dueDate).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Projeto</DialogTitle>
            <DialogDescription>
              Atualize as informações básicas do projeto
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Projeto</Label>
              <Input
                id="name"
                value={editedProject.name || ''}
                onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={editedProject.description || ''}
                onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Data de Início</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={editedProject.startDate ? new Date(editedProject.startDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setEditedProject({ ...editedProject, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Data de Término</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={editedProject.endDate ? new Date(editedProject.endDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setEditedProject({ ...editedProject, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Projeto</Label>
              <Select
                value={editedProject.type || project.type}
                onValueChange={(value) => setEditedProject({ ...editedProject, type: value as ProjectType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ProjectType.NOC}>NOC</SelectItem>
                  <SelectItem value={ProjectType.SERVICE_DESK}>Service Desk</SelectItem>
                  <SelectItem value={ProjectType.INFRASTRUCTURE}>Infraestrutura</SelectItem>
                  <SelectItem value={ProjectType.CLOUD_MIGRATION}>Migração Cloud</SelectItem>
                  <SelectItem value={ProjectType.SECURITY}>Segurança</SelectItem>
                  <SelectItem value={ProjectType.CUSTOM}>Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientId">Cliente</Label>
              <Input
                id="clientId"
                value={editedProject.clientId || ''}
                onChange={(e) => setEditedProject({ ...editedProject, clientId: e.target.value })}
                placeholder="ID ou nome do cliente"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
