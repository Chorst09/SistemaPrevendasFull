'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Project, ProjectStatus, ProjectPriority } from '@/lib/types/project';
import { 
  FolderKanban, 
  Search, 
  Trash2, 
  Eye, 
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

interface ProjectListViewProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onRefresh: () => void;
}

export function ProjectListView({
  projects,
  onSelectProject,
  onDeleteProject,
  onRefresh
}: ProjectListViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'ALL'>('ALL');

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'ALL' || project.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

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

  const getPriorityColor = (priority: ProjectPriority) => {
    switch (priority) {
      case ProjectPriority.LOW: return 'outline';
      case ProjectPriority.MEDIUM: return 'secondary';
      case ProjectPriority.HIGH: return 'default';
      case ProjectPriority.CRITICAL: return 'destructive';
      default: return 'outline';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'green': return 'text-green-600';
      case 'yellow': return 'text-yellow-600';
      case 'red': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FolderKanban className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum Projeto</h3>
          <p className="text-gray-500 text-center mb-4">
            Clique em "Gerar Projeto" para criar um projeto a partir de uma proposta
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar projetos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'ALL' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('ALL')}
                size="sm"
              >
                Todos
              </Button>
              <Button
                variant={filterStatus === ProjectStatus.PLANNING ? 'default' : 'outline'}
                onClick={() => setFilterStatus(ProjectStatus.PLANNING)}
                size="sm"
              >
                Planejamento
              </Button>
              <Button
                variant={filterStatus === ProjectStatus.IN_PROGRESS ? 'default' : 'outline'}
                onClick={() => setFilterStatus(ProjectStatus.IN_PROGRESS)}
                size="sm"
              >
                Em Andamento
              </Button>
              <Button
                variant={filterStatus === ProjectStatus.COMPLETED ? 'default' : 'outline'}
                onClick={() => setFilterStatus(ProjectStatus.COMPLETED)}
                size="sm"
              >
                Concluídos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Projetos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <Badge variant={getStatusColor(project.status)}>
                  {getStatusLabel(project.status)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Métricas */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                  <span>{project.progress.overallProgress}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>{project.team.length} membros</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span>{project.budget.currency} {project.budget.totalBudget.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{project.timeline.phases.length} fases</span>
                </div>
              </div>

              {/* Status de Saúde */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Saúde:</span>
                <div className={`flex items-center space-x-1 ${getHealthColor(project.progress.healthStatus)}`}>
                  <div className={`h-2 w-2 rounded-full ${project.progress.healthStatus === 'green' ? 'bg-green-600' : project.progress.healthStatus === 'yellow' ? 'bg-yellow-600' : 'bg-red-600'}`} />
                  <span className="text-sm font-medium capitalize">{project.progress.healthStatus}</span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge variant={getPriorityColor(project.priority)} className="text-xs">
                  {project.priority}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {project.type}
                </Badge>
              </div>

              {/* Ações */}
              <div className="flex space-x-2 pt-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => onSelectProject(project)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver Detalhes
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDeleteProject(project.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
