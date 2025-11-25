'use client';

import React, { useState } from 'react';
import { ProjectPhase, ProjectTask, ProjectPriority } from '@/lib/types/project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Edit,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  AlertCircle,
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
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingPhase, setEditingPhase] = useState<ProjectPhase | null>(null);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);

  const getPhaseProgress = (phase: ProjectPhase) => {
    if (phase.tasks.length === 0) return 0;
    const completed = phase.tasks.filter(t => t.status === 'done').length;
    return (completed / phase.tasks.length) * 100;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'delayed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-50 border-green-200';
      case 'in-progress':
        return 'bg-blue-50 border-blue-200';
      case 'review':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Fases do Projeto</DialogTitle>
          <DialogDescription>
            Acompanhe e atualize o status das fases e tarefas do seu projeto
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {phases.map((phase) => {
            const progress = getPhaseProgress(phase);
            const isExpanded = expandedPhaseId === phase.id;

            return (
              <Card key={phase.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setExpandedPhaseId(isExpanded ? null : phase.id)
                          }
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                        <h3 className="text-lg font-semibold">{phase.name}</h3>
                        <Badge className={getStatusColor(phase.status)}>
                          {phase.status === 'completed'
                            ? 'Concluída'
                            : phase.status === 'in-progress'
                            ? 'Em Andamento'
                            : phase.status === 'delayed'
                            ? 'Atrasada'
                            : 'Pendente'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{phase.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {progress.toFixed(0)}%
                      </div>
                      <p className="text-xs text-gray-500">
                        {phase.tasks.filter(t => t.status === 'done').length}/
                        {phase.tasks.length} tarefas
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progresso</span>
                      <span>
                        {new Date(phase.startDate).toLocaleDateString('pt-BR')} -{' '}
                        {new Date(phase.endDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Select
                      value={phase.status}
                      onValueChange={(value) =>
                        handlePhaseStatusChange(phase.id, value)
                      }
                    >
                      <SelectTrigger className="w-[180px] h-8 text-xs">
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
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">Tarefas</h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddTask(phase.id)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Adicionar Tarefa
                        </Button>
                      </div>

                      {phase.tasks.length === 0 ? (
                        <p className="text-xs text-gray-500 py-4 text-center">
                          Nenhuma tarefa nesta fase
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {phase.tasks.map((task) => (
                            <div
                              key={task.id}
                              className={`p-3 rounded border ${getTaskStatusColor(
                                task.status
                              )}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <CheckSquare
                                      className={`h-4 w-4 ${
                                        task.status === 'done'
                                          ? 'text-green-600'
                                          : 'text-gray-400'
                                      }`}
                                    />
                                    <input
                                      type="text"
                                      value={task.name}
                                      onChange={(e) =>
                                        handleUpdateTask(phase.id, task.id, {
                                          name: e.target.value,
                                        })
                                      }
                                      className="font-medium text-sm bg-transparent border-0 p-0 focus:outline-none focus:ring-0 flex-1"
                                    />
                                  </div>
                                  {task.description && (
                                    <p className="text-xs text-gray-600 ml-6">
                                      {task.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2 ml-6 text-xs text-gray-500">
                                    <Calendar className="h-3 w-3" />
                                    <span>{task.estimatedHours}h estimadas</span>
                                    {task.assignedTo && (
                                      <>
                                        <span>•</span>
                                        <span>{task.assignedTo}</span>
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
                                    <SelectTrigger className="w-[120px] h-7 text-xs">
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
                                  >
                                    <Trash2 className="h-3 w-3 text-red-500" />
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
