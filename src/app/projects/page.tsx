'use client';

import React, { useState } from 'react';
import { ProjectList } from '@/components/service-desk-pricing/projects/ProjectList';
import { ServiceDeskPricingSystem } from '@/components/service-desk-pricing/ServiceDeskPricingSystem';
import { useProjectData } from '@/hooks/use-project-data';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3 } from 'lucide-react';

type ViewMode = 'list' | 'project';

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  // TODO: Get userId from authentication
  const userId = 'temp-user-id';
  
  const {
    data: projectData,
    isLoading,
    error,
    createNewProject,
    loadData
  } = useProjectData({
    projectId: selectedProjectId || undefined,
    userId,
    autoSave: true
  });

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setViewMode('project');
  };

  const handleCreateProject = async () => {
    try {
      const newProject = await createNewProject();
      setSelectedProjectId(newProject.project.id);
      setViewMode('project');
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleEditProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setViewMode('project');
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          // Reload the project list
          window.location.reload();
        } else {
          throw new Error('Failed to delete project');
        }
      } catch (error) {
        console.error('Failed to delete project:', error);
        alert('Erro ao excluir projeto');
      }
    }
  };

  const handleDuplicateProject = async (projectId: string) => {
    try {
      // Load the project data
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) throw new Error('Failed to load project');
      
      const originalProject = await response.json();
      
      // Create a copy with new ID and name
      const duplicatedProject = {
        ...originalProject,
        project: {
          ...originalProject.project,
          id: crypto.randomUUID(),
          name: `${originalProject.project.name} (Cópia)`,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };
      
      // Save the duplicated project
      const createResponse = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(duplicatedProject),
      });
      
      if (createResponse.ok) {
        const newProject = await createResponse.json();
        setSelectedProjectId(newProject.project.id);
        setViewMode('project');
      } else {
        throw new Error('Failed to duplicate project');
      }
    } catch (error) {
      console.error('Failed to duplicate project:', error);
      alert('Erro ao duplicar projeto');
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedProjectId(null);
  };

  if (viewMode === 'project') {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
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
              
              {projectData && (
                <div>
                  <h1 className="text-xl font-semibold">{projectData.project.name}</h1>
                  {projectData.project.client?.name && (
                    <p className="text-sm text-muted-foreground">
                      Cliente: {projectData.project.client.name}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Project Content */}
        <div className="container mx-auto px-4 py-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Carregando projeto...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => loadData()}>
                Tentar Novamente
              </Button>
            </div>
          ) : projectData ? (
            <ServiceDeskPricingSystem
              initialData={projectData}
              onDataChange={(data) => {
                // Auto-save is handled by the hook
                console.log('Project data updated');
              }}
              integrationMode="integrated"
            />
          ) : (
            <div className="text-center py-12">
              <p>Projeto não encontrado</p>
              <Button onClick={handleBackToList} className="mt-4">
                Voltar aos Projetos
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Service Desk Pricing</h1>
              <p className="text-muted-foreground mt-1">
                Sistema de precificação para projetos de Service Desk
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <a href="/dashboard">
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
              </a>
              <a href="/">
                <Button variant="ghost" size="sm">
                  Voltar ao Menu
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <ProjectList
          onSelectProject={handleSelectProject}
          onCreateProject={handleCreateProject}
          onEditProject={handleEditProject}
          onDeleteProject={handleDeleteProject}
          onDuplicateProject={handleDuplicateProject}
        />
      </div>
    </div>
  );
}