'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, FolderKanban } from 'lucide-react';
import { ProjectGeneratorService } from '@/lib/services/project-generator-service';
import { Project } from '@/lib/types/project';
import { ProjectListView } from '@/components/projects/ProjectListView';
import { ProjectDetailView } from '@/components/projects/ProjectDetailView';
import { ProjectGeneratorModal } from '@/components/projects/ProjectGeneratorModal';

type ViewMode = 'list' | 'detail';

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const allProjects = ProjectGeneratorService.getAllProjects();
    setProjects(allProjects);
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

  const handleProjectGenerated = (project: Project) => {
    setShowGeneratorModal(false);
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
              <Button onClick={handleGenerateProject} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Gerar Projeto</span>
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
    </div>
  );
}
