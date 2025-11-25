'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, FolderKanban } from 'lucide-react';
import { ProjectGeneratorService } from '@/lib/services/project-generator-service';
import { Project, ProjectStatus, ProjectPriority } from '@/lib/types/project';
import { ProjectListView } from '@/components/projects/ProjectListView';
import { ProjectDetailView } from '@/components/projects/ProjectDetailView';
import { ProjectGeneratorModal } from '@/components/projects/ProjectGeneratorModal';
import { ManualProjectModal } from '@/components/projects/ManualProjectModal';

type ViewMode = 'list' | 'detail';

export default function ProjectsPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const allProjects = ProjectGeneratorService.getAllProjects();
    
    // Se não houver projetos, criar um de exemplo
    if (allProjects.length === 0) {
      createExampleProject();
    } else {
      setProjects(allProjects);
    }
  };

  const createExampleProject = () => {
    const exampleProject: Project = {
      id: `proj-example-${Date.now()}`,
      name: 'Implementação NOC - Banco ABC',
      description: 'Projeto de implementação de Network Operations Center para o Banco ABC com monitoramento 24x7 de infraestrutura crítica.',
      type: 'noc',
      status: 'in-progress',
      priority: 'high',
      proposalId: undefined,
      clientId: 'banco-abc',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      projectManager: 'Carlos Silva',
      team: [
        { id: 'team-1', name: 'Carlos Silva', role: 'Gerente de Projeto', allocation: 100 },
        { id: 'team-2', name: 'Ana Santos', role: 'Arquiteta de Sistemas', allocation: 80 },
        { id: 'team-3', name: 'João Oliveira', role: 'Engenheiro NOC', allocation: 100 },
        { id: 'team-4', name: 'Maria Costa', role: 'Especialista em Segurança', allocation: 60 }
      ],
      scope: {
        objectives: [
          'Implementar NOC com monitoramento 24x7',
          'Configurar alertas e escalação automática',
          'Treinar equipe do cliente',
          'Documentar processos e procedimentos'
        ],
        deliverables: ['Infraestrutura NOC', 'Dashboards de Monitoramento', 'Documentação Técnica', 'Treinamento da Equipe'],
        outOfScope: ['Desenvolvimento de aplicações customizadas', 'Migração de dados legados'],
        assumptions: ['Cliente fornecerá acesso à infraestrutura', 'Equipe disponível para treinamento'],
        constraints: ['Implementação deve ser concluída em 90 dias', 'Sem downtime durante implementação']
      },
      timeline: {
        phases: [
          {
            id: 'phase-1',
            name: 'Fase 1: Planejamento e Design',
            description: 'Análise de requisitos e design da solução',
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
            tasks: [],
            dependencies: []
          },
          {
            id: 'phase-2',
            name: 'Fase 2: Implementação',
            description: 'Instalação e configuração da infraestrutura NOC',
            startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'in-progress',
            tasks: [],
            dependencies: ['phase-1']
          },
          {
            id: 'phase-3',
            name: 'Fase 3: Testes e Validação',
            description: 'Testes de funcionalidade e validação com cliente',
            startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'not-started',
            tasks: [],
            dependencies: ['phase-2']
          },
          {
            id: 'phase-4',
            name: 'Fase 4: Treinamento e Go-Live',
            description: 'Treinamento da equipe e ativação do NOC',
            startDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'not-started',
            tasks: [],
            dependencies: ['phase-3']
          }
        ],
        milestones: [
          { id: 'ms-1', name: 'Design Aprovado', description: 'Design da solução aprovado pelo cliente', dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), status: 'completed', deliverables: [] },
          { id: 'ms-2', name: 'Infraestrutura Instalada', description: 'Infraestrutura NOC completamente instalada', dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), status: 'in-progress', deliverables: [] },
          { id: 'ms-3', name: 'Testes Concluídos', description: 'Todos os testes de funcionalidade concluídos', dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending', deliverables: [] }
        ]
      },
      budget: {
        totalBudget: 450000,
        spentBudget: 180000,
        remainingBudget: 270000,
        currency: 'BRL',
        breakdown: [
          { category: 'Infraestrutura', amount: 200000, spent: 80000 },
          { category: 'Licenças de Software', amount: 150000, spent: 60000 },
          { category: 'Serviços Profissionais', amount: 100000, spent: 40000 }
        ],
        costVariance: 0,
        costPerformanceIndex: 1.0
      },
      risks: [
        { id: 'risk-1', title: 'Atraso na Entrega de Hardware', description: 'Possível atraso na entrega dos servidores', probability: 'medium', impact: 'high', mitigation: 'Manter contato com fornecedor e ter plano B' },
        { id: 'risk-2', title: 'Resistência da Equipe', description: 'Equipe do cliente pode resistir às mudanças', probability: 'low', impact: 'medium', mitigation: 'Treinamento abrangente e suporte contínuo' }
      ],
      deliverables: [
        { id: 'del-1', name: 'Infraestrutura NOC', description: 'Servidores, switches e equipamentos de rede', type: 'infrastructure', status: 'in-progress', dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), assignedTo: 'João Oliveira', acceptanceCriteria: ['Todos os servidores operacionais', 'Rede configurada e testada'] },
        { id: 'del-2', name: 'Dashboards de Monitoramento', description: 'Painéis de controle e visualização de dados', type: 'software', status: 'in-progress', dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), assignedTo: 'Ana Santos', acceptanceCriteria: ['Dashboards responsivos', 'Alertas em tempo real'] },
        { id: 'del-3', name: 'Documentação Técnica', description: 'Manuais e guias técnicos', type: 'documentation', status: 'pending', dueDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(), assignedTo: 'Maria Costa', acceptanceCriteria: ['Documentação completa', 'Exemplos práticos'] }
      ],
      progress: {
        overallProgress: 65,
        phasesCompleted: 1,
        tasksCompleted: 12,
        totalTasks: 20,
        milestonesAchieved: 1,
        totalMilestones: 3,
        scheduleVariance: 0,
        schedulePerformanceIndex: 1.0,
        healthStatus: 'green',
        healthIndicators: {
          schedule: 'on-track',
          budget: 'on-track',
          scope: 'on-track',
          quality: 'on-track'
        }
      },
      documents: [],
      notes: 'Projeto de exemplo para demonstração do sistema de gerenciamento de projetos.',
      tags: ['NOC', 'Infraestrutura', 'Banco ABC', 'Crítico']
    };

    ProjectGeneratorService.saveProject(exampleProject);
    setProjects([exampleProject]);
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedProject(null);
    loadProjects();
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      await ProjectGeneratorService.deleteProject(projectId);
      loadProjects();
    }
  };

  const handleGenerateProject = () => {
    setShowGeneratorModal(true);
  };

  const handleCreateManualProject = () => {
    setShowManualModal(true);
  };

  const handleProjectGenerated = (project: Project) => {
    setShowGeneratorModal(false);
    loadProjects();
    setSelectedProject(project);
    setViewMode('detail');
  };

  const handleProjectCreated = (project: Project) => {
    setShowManualModal(false);
    loadProjects();
    setSelectedProject(project);
    setViewMode('detail');
  };

  if (viewMode === 'detail' && selectedProject) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToList}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar aos Projetos</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <ProjectDetailView
            project={selectedProject}
            onUpdate={(updates) => {
              ProjectGeneratorService.updateProject(selectedProject.id, updates);
              setSelectedProject({ ...selectedProject, ...updates });
              loadProjects();
            }}
            onBack={handleBackToList}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FolderKanban className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Gestão de Projetos</h1>
                <p className="text-muted-foreground mt-1">
                  Gerencie e acompanhe seus projetos
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={handleCreateManualProject} variant="outline" className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Criar Projeto Manual</span>
              </Button>
              <Button onClick={handleGenerateProject} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Gerar de Proposta</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <ProjectListView
          projects={projects}
          onSelectProject={handleSelectProject}
          onDeleteProject={handleDeleteProject}
          onRefresh={loadProjects}
        />
      </div>

      {showGeneratorModal && (
        <ProjectGeneratorModal
          onClose={() => setShowGeneratorModal(false)}
          onGenerate={handleProjectGenerated}
        />
      )}

      {showManualModal && (
        <ManualProjectModal
          onClose={() => setShowManualModal(false)}
          onCreate={handleProjectCreated}
        />
      )}
    </div>
  );
}
