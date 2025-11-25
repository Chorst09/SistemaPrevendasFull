'use client';

import React, { useState } from 'react';
import { ProjectPhase, ProjectTask, ProjectPriority } from '@/lib/types/project';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  CheckSquare,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface PhaseManagementModalProps {
  phases: ProjectPhase[];
  onUpdate: (phases: ProjectPhase[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function PhaseManagementModal({
  phases,
  onUpdate,
  isOpen,
  onClose,
}: PhaseManagementModalProps) {
  const [expandedPhaseId, setExpandedPhaseId] = useState<string | null>(null);

  const getPhaseProgress = (phase: ProjectPhase) => {
    if (phase.tasks.length === 0) return 0;
    const completed = phase.tasks.filter(t => t.status === 'done').length;
    return (completed / phase.tasks.length) * 100;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500 text-white';
      case 'in-progress':
        return 'bg-orange-500 text-white';
      case 'delayed':
        return 'bg-red-500 text-white';
      default:
        return 'bg-amber-500 text-white';
    }
  };

  const getPhaseCardBgColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#dcfce7'; // verde claro
      case 'in-progress':
        return '#fed7aa'; // laranja claro
      case 'delayed':
        return '#fee2e2'; // vermelho claro
      default:
        return '#fef3c7'; // âmbar claro
    }
  };

  const getPhaseHeaderBgColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'linear-gradient(to right, #10b981, #059669)'; // verde
      case 'in-progress':
        return 'linear-gradient(to right, #f97316, #ea580c)'; // laranja
      case 'delayed':
        return 'linear-gradient(to right, #ef4444, #dc2626)'; // vermelho
      default:
        return 'linear-gradient(to right, #eab308, #ca8a04)'; // âmbar
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-emerald-50 border-l-4 border-l-emerald-500';
      case 'in-progress':
        return 'bg-blue-50 border-l-4 border-l-blue-500';
      case 'review':
        return 'bg-amber-50 border-l-4 border-l-amber-500';
      default:
        return 'bg-slate-50 border-l-4 border-l-slate-400';
    }
  };

  const handlePhaseStatusChange = (phaseId: string, newStatus: string) => {
    const updatedPhases = phases.map(p =>
      p.id === phaseId ? { ...p, status: newStatus as any } : p
    );
    onUpdate(updatedPhases);
  };

  const handleTaskStatusChange = (phaseId: string, taskId: string, newStatus: string) => {
    const updatedPhases = phases.map(p => {
      if (p.id === phaseId) {
        return {
          ...p,
          tasks: p.tasks.map(t =>
            t.id === taskId ? { ...t, status: newStatus as any } : t
          ),
        };
      }
      return p;
    });
    onUpdate(updatedPhases);
  };

  const handleAddTask = (phaseId: string) => {
    const newTask: ProjectTask = {
      id: `task-${Date.now()}`,
      name: 'Nova Tarefa',
      description: '',
      status: 'todo',
      priority: ProjectPriority.MEDIUM,
      estimatedHours: 8,
      dependencies: [],
    };

    const updatedPhases = phases.map(p => {
      if (p.id === phaseId) {
        return { ...p, tasks: [...p.tasks, newTask] };
      }
      return p;
    });
    onUpdate(updatedPhases);
  };

  const handleDeleteTask = (phaseId: string, taskId: string) => {
    const updatedPhases = phases.map(p => {
      if (p.id === phaseId) {
        return { ...p, tasks: p.tasks.filter(t => t.id !== taskId) };
      }
      return p;
    });
    onUpdate(updatedPhases);
  };

  const handleUpdateTask = (phaseId: string, taskId: string, updates: Partial<ProjectTask>) => {
    const updatedPhases = phases.map(p => {
      if (p.id === phaseId) {
        return {
          ...p,
          tasks: p.tasks.map(t =>
            t.id === taskId ? { ...t, ...updates } : t
          ),
        };
      }
      return p;
    });
    onUpdate(updatedPhases);
  };

  const handleAddPhase = () => {
    const newPhase: ProjectPhase = {
      id: `phase-${Date.now()}`,
      name: 'Nova Fase',
      description: 'Descrição da fase',
      status: 'not-started',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      tasks: [],
    };
    onUpdate([...phases, newPhase]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">Gerenciar Fases do Projeto</DialogTitle>
          <DialogDescription className="text-gray-700 font-semibold">
            Acompanhe e atualize o status das fases e tarefas do seu projeto
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Fases do Projeto</h3>
            <Button
              onClick={handleAddPhase}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white border-0 font-bold shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Fase
            </Button>
          </div>

          {phases.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Plus className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-semibold mb-2">Nenhuma fase criada</p>
              <p className="text-sm text-gray-500 mb-4">Clique no botão acima para adicionar a primeira fase</p>
              <Button
                onClick={handleAddPhase}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Fase
              </Button>
            </div>
          ) : null}

          {phases.map((phase) => {
            const progress = getPhaseProgress(phase);
            const isExpanded = expandedPhaseId === phase.id;

            return (
              <Card key={phase.id} className="border-l-4 shadow-lg hover:shadow-xl transition-all" style={{ 
                backgroundColor: getPhaseCardBgColor(phase.status),
                borderLeftColor: phase.status === 'completed' ? '#10b981' : phase.status === 'in-progress' ? '#f97316' : phase.status === 'delayed' ? '#ef4444' : '#eab308',
                borderLeftWidth: '6px'
              }}>
                <CardHeader className="pb-3 border-b-4" style={{ 
                  background: getPhaseHeaderBgColor(phase.status),
                  borderBottomColor: phase.status === 'completed' ? '#059669' : phase.status === 'in-progress' ? '#ea580c' : phase.status === 'delayed' ? '#dc2626' : '#ca8a04'
                }}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setExpandedPhaseId(isExpanded ? null : phase.id)
                          }
                          style={{ color: 'white' }}
                          className="hover:opacity-80"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5" style={{ color: 'white' }} />
                          ) : (
                            <ChevronDown className="h-5 w-5" style={{ color: 'white' }} />
                          )}
                        </Button>
                        <h3 className="text-lg font-bold drop-shadow" style={{ color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{phase.name}</h3>
                        <Badge className={`${getStatusColor(phase.status)} font-bold text-sm shadow-md`} style={{ fontSize: '12px', fontWeight: 'bold' }}>
                          {phase.status === 'completed'
                            ? 'Concluída'
                            : phase.status === 'in-progress'
                            ? 'Em Andamento'
                            : phase.status === 'delayed'
                            ? 'Atrasada'
                            : 'Pendente'}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold drop-shadow" style={{ color: '#e0f2ff', textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>{phase.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold drop-shadow-lg" style={{ color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                        {progress.toFixed(0)}%
                      </div>
                      <p className="text-xs font-bold" style={{ color: '#e0f2ff' }}>
                        {phase.tasks.filter(t => t.status === 'done').length}/
                        {phase.tasks.length} tarefas
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-2 font-bold" style={{ color: '#e0f2ff' }}>
                      <span>Progresso</span>
                      <span>
                        {new Date(phase.startDate).toLocaleDateString('pt-BR')} -{' '}
                        {new Date(phase.endDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <Progress value={progress} className="h-3" style={{ backgroundColor: '#88ddff' }} />
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Select
                      value={phase.status}
                      onValueChange={(value) =>
                        handlePhaseStatusChange(phase.id, value)
                      }
                    >
                      <SelectTrigger className="w-[180px] h-8 text-xs font-bold bg-white shadow-md" style={{ borderColor: '#0088ff', borderWidth: '2px', color: '#0066ff' }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not-started">Pendente</SelectItem>
                        <SelectItem value="in-progress">Em Andamento</SelectItem>
                        <SelectItem value="completed">Concluída</SelectItem>
                        <SelectItem value="delayed">Atrasada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-3 bg-gray-50 pt-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-gray-900">Tarefas</h4>
                        <Button
                          size="sm"
                          onClick={() => handleAddTask(phase.id)}
                          className="border-0 font-bold shadow-md text-white"
                          style={{ background: 'linear-gradient(to right, #0066ff, #00ccff)', cursor: 'pointer' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #0044cc, #0099ff)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(to right, #0066ff, #00ccff)'}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Adicionar Tarefa
                        </Button>
                      </div>

                      {phase.tasks.length === 0 ? (
                        <p className="text-sm text-gray-600 py-4 text-center font-semibold">
                          Nenhuma tarefa nesta fase
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {phase.tasks.map((task) => (
                            <div
                              key={task.id}
                              className={`p-3 rounded-lg shadow-md hover:shadow-lg transition-all border-l-4 ${getTaskStatusColor(
                                task.status
                              )}`}
                              style={{
                                borderLeftColor: task.status === 'done' ? '#10b981' : task.status === 'in-progress' ? '#0066ff' : task.status === 'review' ? '#f59e0b' : '#9ca3af',
                                backgroundColor: task.status === 'done' ? '#f0fdf4' : task.status === 'in-progress' ? '#f0f9ff' : task.status === 'review' ? '#fffbf0' : '#f9fafb'
                              }}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <CheckSquare
                                      className="h-5 w-5 flex-shrink-0 font-bold"
                                      style={{
                                        color: task.status === 'done' ? '#10b981' : task.status === 'in-progress' ? '#0066ff' : task.status === 'review' ? '#f59e0b' : '#9ca3af'
                                      }}
                                    />
                                    <input
                                      type="text"
                                      value={task.name}
                                      onChange={(e) =>
                                        handleUpdateTask(phase.id, task.id, {
                                          name: e.target.value,
                                        })
                                      }
                                      className="font-bold text-sm bg-transparent border-0 p-0 focus:outline-none focus:ring-0 flex-1"
                                      style={{ color: '#111827' }}
                                    />
                                  </div>
                                  {task.description && (
                                    <p className="text-xs ml-7 font-semibold" style={{ color: '#1f2937' }}>
                                      {task.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2 ml-7 text-xs font-semibold" style={{ color: '#374151' }}>
                                    <Calendar className="h-4 w-4" />
                                    <span>{task.estimatedHours}h estimadas</span>
                                    {task.assignedTo && (
                                      <>
                                        <span>•</span>
                                        <span className="font-bold">{task.assignedTo}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Select
                                    value={task.status}
                                    onValueChange={(value) =>
                                      handleTaskStatusChange(
                                        phase.id,
                                        task.id,
                                        value
                                      )
                                    }
                                  >
                                    <SelectTrigger className="w-[120px] h-8 text-xs font-bold bg-white shadow-sm" style={{ borderColor: '#d1d5db', borderWidth: '2px', color: '#111827' }}>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="todo">A Fazer</SelectItem>
                                      <SelectItem value="in-progress">
                                        Em Andamento
                                      </SelectItem>
                                      <SelectItem value="review">
                                        Em Revisão
                                      </SelectItem>
                                      <SelectItem value="done">Concluída</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      handleDeleteTask(phase.id, task.id)
                                    }
                                    className="hover:opacity-80"
                                  >
                                    <Trash2 className="h-4 w-4 font-bold" style={{ color: '#b91c1c' }} />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
