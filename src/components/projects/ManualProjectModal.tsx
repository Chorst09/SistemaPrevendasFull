'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project, ProjectType, ProjectPriority, ProjectStatus } from '@/lib/types/project';
import { ProjectGeneratorService } from '@/lib/services/project-generator-service';
import { Plus, X, Save, Loader2 } from 'lucide-react';

interface ManualProjectModalProps {
  onClose: () => void;
  onCreate: (project: Project) => void;
}

export function ManualProjectModal({ onClose, onCreate }: ManualProjectModalProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Dados básicos
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ProjectType>(ProjectType.CUSTOM);
  const [priority, setPriority] = useState<ProjectPriority>(ProjectPriority.MEDIUM);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [projectManager, setProjectManager] = useState('');
  const [clientId, setClientId] = useState('');

  // Escopo
  const [objectives, setObjectives] = useState<string[]>(['']);
  const [deliverables, setDeliverables] = useState<Array<{ name: string; startDate: string; endDate: string }>>([
    { name: '', startDate: '', endDate: '' }
  ]);
  const [outOfScope, setOutOfScope] = useState<string[]>(['']);
  const [assumptions, setAssumptions] = useState<string[]>(['']);
  const [constraints, setConstraints] = useState<string[]>(['']);

  // Orçamento
  const [totalBudget, setTotalBudget] = useState('');
  const [currency, setCurrency] = useState('BRL');

  // Equipe
  const [teamMembers, setTeamMembers] = useState<Array<{ name: string; role: string; allocation: string }>>([
    { name: '', role: '', allocation: '100' }
  ]);

  // Notas
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');

  const handleAddItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  };

  const handleRemoveItem = (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.map((item, i) => i === index ? value : item));
  };

  const handleAddTeamMember = () => {
    setTeamMembers(prev => [...prev, { name: '', role: '', allocation: '100' }]);
  };

  const handleRemoveTeamMember = (index: number) => {
    setTeamMembers(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateTeamMember = (index: number, field: string, value: string) => {
    setTeamMembers(prev => prev.map((member, i) => 
      i === index ? { ...member, [field]: value } : member
    ));
  };

  const handleAddDeliverable = () => {
    setDeliverables(prev => [...prev, { name: '', startDate: '', endDate: '' }]);
  };

  const handleRemoveDeliverable = (index: number) => {
    setDeliverables(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateDeliverable = (index: number, field: 'name' | 'startDate' | 'endDate', value: string) => {
    setDeliverables(prev => prev.map((del, i) => 
      i === index ? { ...del, [field]: value } : del
    ));
  };

  // Gerar cronograma automaticamente com base nas entregas
  const generateTimeline = () => {
    const validDeliverables = deliverables.filter(d => d.name.trim() && d.startDate && d.endDate);
    
    if (validDeliverables.length === 0) {
      return { phases: [], milestones: [] };
    }

    // Ordenar entregas por data de término
    const sortedDeliverables = [...validDeliverables].sort((a, b) => 
      new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
    );

    // Criar milestones baseados nas entregas
    const milestones = sortedDeliverables.map((del, index) => ({
      id: `milestone-${index}`,
      name: del.name,
      description: `Entrega: ${del.name}`,
      dueDate: del.endDate,
      status: 'pending' as const,
      deliverables: [del.name]
    }));

    // Criar fases baseadas nas entregas
    const phases = sortedDeliverables.map((del, index) => {
      return {
        id: `phase-${index}`,
        name: `Fase ${index + 1}: ${del.name}`,
        description: `Fase focada na entrega: ${del.name}`,
        startDate: del.startDate,
        endDate: del.endDate,
        status: 'not-started' as const,
        tasks: [],
        dependencies: index > 0 ? [`phase-${index - 1}`] : []
      };
    });

    return { phases, milestones };
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      alert('Por favor, preencha o nome do projeto');
      return;
    }

    setIsCreating(true);

    try {
      const project: Project = {
        id: `proj-${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        type,
        status: ProjectStatus.PLANNING,
        priority,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        projectManager: projectManager.trim() || undefined,
        clientId: clientId.trim() || undefined,
        team: teamMembers
          .filter(m => m.name.trim())
          .map((m, i) => ({
            id: `team-${i}`,
            name: m.name.trim(),
            role: m.role.trim(),
            allocation: parseInt(m.allocation) || 100
          })),
        scope: {
          objectives: objectives.filter(o => o.trim()),
          deliverables: deliverables.filter(d => d.name.trim()).map(d => d.name.trim()),
          outOfScope: outOfScope.filter(o => o.trim()),
          assumptions: assumptions.filter(a => a.trim()),
          constraints: constraints.filter(c => c.trim())
        },
        timeline: generateTimeline(),
        budget: {
          totalBudget: parseFloat(totalBudget) || 0,
          spentBudget: 0,
          remainingBudget: parseFloat(totalBudget) || 0,
          currency,
          breakdown: [],
          costVariance: 0,
          costPerformanceIndex: 1
        },
        risks: [],
        deliverables: deliverables
          .filter(d => d.name.trim() && d.startDate && d.endDate)
          .map((d, i) => ({
            id: `deliverable-${i}`,
            name: d.name.trim(),
            description: `Período: ${new Date(d.startDate).toLocaleDateString('pt-BR')} a ${new Date(d.endDate).toLocaleDateString('pt-BR')}`,
            type: 'other' as const,
            status: 'pending' as const,
            dueDate: d.endDate,
            assignedTo: undefined,
            acceptanceCriteria: []
          })),
        progress: {
          overallProgress: 0,
          phasesCompleted: 0,
          tasksCompleted: 0,
          totalTasks: 0,
          milestonesAchieved: 0,
          totalMilestones: 0,
          scheduleVariance: 0,
          schedulePerformanceIndex: 1,
          healthStatus: 'green',
          healthIndicators: {
            schedule: 'on-track',
            budget: 'on-track',
            scope: 'on-track',
            quality: 'on-track'
          }
        },
        documents: [],
        notes: notes.trim(),
        tags: tags.split(',').map(t => t.trim()).filter(t => t)
      };

      await ProjectGeneratorService.saveProject(project);
      onCreate(project);
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      alert('Erro ao criar projeto. Tente novamente.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Projeto Manual</DialogTitle>
          <DialogDescription>
            Preencha as informações do projeto. Você pode adicionar mais detalhes depois.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="basic">Básico</TabsTrigger>
            <TabsTrigger value="scope">Escopo</TabsTrigger>
            <TabsTrigger value="team">Equipe</TabsTrigger>
            <TabsTrigger value="budget">Orçamento</TabsTrigger>
            <TabsTrigger value="timeline">Cronograma</TabsTrigger>
          </TabsList>

          {/* Aba Básico */}
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Nome do Projeto *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Implementação NOC Cliente XYZ"
                />
              </div>

              <div className="col-span-2">
                <Label>Descrição</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o projeto..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Tipo de Projeto</Label>
                <Select value={type} onValueChange={(v) => setType(v as ProjectType)}>
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

              <div>
                <Label>Prioridade</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as ProjectPriority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ProjectPriority.LOW}>Baixa</SelectItem>
                    <SelectItem value={ProjectPriority.MEDIUM}>Média</SelectItem>
                    <SelectItem value={ProjectPriority.HIGH}>Alta</SelectItem>
                    <SelectItem value={ProjectPriority.CRITICAL}>Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Data de Início</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <Label>Data de Término</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div>
                <Label>Gerente de Projeto</Label>
                <Input
                  value={projectManager}
                  onChange={(e) => setProjectManager(e.target.value)}
                  placeholder="Nome do gerente"
                />
              </div>

              <div>
                <Label>ID do Cliente</Label>
                <Input
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="Identificador do cliente"
                />
              </div>

              <div className="col-span-2">
                <Label>Tags (separadas por vírgula)</Label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Ex: urgente, cliente-vip, infraestrutura"
                />
              </div>

              <div className="col-span-2">
                <Label>Notas</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observações gerais sobre o projeto..."
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>

          {/* Aba Escopo */}
          <TabsContent value="scope" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Objetivos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {objectives.map((obj, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={obj}
                      onChange={(e) => handleUpdateItem(index, e.target.value, setObjectives)}
                      placeholder="Objetivo do projeto"
                    />
                    {objectives.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(index, setObjectives)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddItem(setObjectives)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Objetivo
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Entregas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {deliverables.map((del, index) => (
                  <div key={index} className="space-y-2 p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-gray-700">Entrega {index + 1}</Label>
                      {deliverables.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDeliverable(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <Input
                      value={del.name}
                      onChange={(e) => handleUpdateDeliverable(index, 'name', e.target.value)}
                      placeholder="Nome da entrega"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-gray-600">Data de Início</Label>
                        <Input
                          type="date"
                          value={del.startDate}
                          onChange={(e) => handleUpdateDeliverable(index, 'startDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Data de Término</Label>
                        <Input
                          type="date"
                          value={del.endDate}
                          onChange={(e) => handleUpdateDeliverable(index, 'endDate', e.target.value)}
                        />
                      </div>
                    </div>
                    {del.startDate && del.endDate && (
                      <p className="text-xs text-blue-600">
                        Duração: {Math.ceil((new Date(del.endDate).getTime() - new Date(del.startDate).getTime()) / (1000 * 60 * 60 * 24))} dias
                      </p>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddDeliverable}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Entrega
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  As datas de início e término das entregas serão usadas para gerar o cronograma automaticamente
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Fora do Escopo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {outOfScope.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => handleUpdateItem(index, e.target.value, setOutOfScope)}
                      placeholder="O que não está incluído"
                    />
                    {outOfScope.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(index, setOutOfScope)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddItem(setOutOfScope)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Premissas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {assumptions.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) => handleUpdateItem(index, e.target.value, setAssumptions)}
                        placeholder="Premissa"
                      />
                      {assumptions.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(index, setAssumptions)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddItem(setAssumptions)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Restrições</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {constraints.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) => handleUpdateItem(index, e.target.value, setConstraints)}
                        placeholder="Restrição"
                      />
                      {constraints.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(index, setConstraints)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddItem(setConstraints)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba Equipe */}
          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Membros da Equipe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {teamMembers.map((member, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2">
                    <div className="col-span-5">
                      <Input
                        value={member.name}
                        onChange={(e) => handleUpdateTeamMember(index, 'name', e.target.value)}
                        placeholder="Nome"
                      />
                    </div>
                    <div className="col-span-4">
                      <Input
                        value={member.role}
                        onChange={(e) => handleUpdateTeamMember(index, 'role', e.target.value)}
                        placeholder="Função"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={member.allocation}
                        onChange={(e) => handleUpdateTeamMember(index, 'allocation', e.target.value)}
                        placeholder="%"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div className="col-span-1">
                      {teamMembers.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTeamMember(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddTeamMember}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Membro
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Orçamento */}
          <TabsContent value="budget" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Orçamento Total</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Moeda</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRL">BRL (R$)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Valor Total</Label>
                    <Input
                      type="number"
                      value={totalBudget}
                      onChange={(e) => setTotalBudget(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Você poderá adicionar detalhamento de custos depois na visualização do projeto.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Cronograma - Estilo Gantt */}
          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Cronograma - Gráfico de Gantt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {React.useMemo(() => {
                  const timeline = generateTimeline();
                  
                  if (timeline.phases.length === 0) {
                    return (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Adicione entregas com datas na aba "Escopo" para gerar o cronograma automaticamente</p>
                      </div>
                    );
                  }

                  // Calcular datas mínima e máxima para o gráfico
                  const allDates = timeline.phases.flatMap(p => [new Date(p.startDate), new Date(p.endDate)]);
                  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
                  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
                  const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

                  // Função para calcular posição e largura da barra
                  const getBarStyle = (startDate: string, endDate: string) => {
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    const daysFromStart = Math.ceil((start.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
                    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    
                    const leftPercent = (daysFromStart / totalDays) * 100;
                    const widthPercent = (duration / totalDays) * 100;
                    
                    return {
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`
                    };
                  };

                  // Gerar meses para o cabeçalho
                  const months: { month: string; days: number }[] = [];
                  let currentDate = new Date(minDate);
                  while (currentDate <= maxDate) {
                    const monthStart = new Date(currentDate);
                    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                    const endOfRange = monthEnd > maxDate ? maxDate : monthEnd;
                    const daysInMonth = Math.ceil((endOfRange.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    
                    months.push({
                      month: monthStart.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
                      days: daysInMonth
                    });
                    
                    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
                  }

                  return (
                    <>
                      {/* Resumo */}
                      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border">
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Início do Projeto</p>
                          <p className="text-sm font-bold text-blue-600">{minDate.toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Duração Total</p>
                          <p className="text-sm font-bold text-purple-600">{totalDays} dias</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Término do Projeto</p>
                          <p className="text-sm font-bold text-green-600">{maxDate.toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>

                      {/* Gráfico de Gantt */}
                      <div className="border rounded-lg overflow-hidden bg-white">
                        {/* Cabeçalho com meses */}
                        <div className="flex border-b bg-gray-100">
                          <div className="w-64 p-2 border-r font-semibold text-sm">Tarefa</div>
                          <div className="flex-1 flex">
                            {months.map((m, i) => (
                              <div
                                key={i}
                                className="border-r last:border-r-0 p-2 text-center text-xs font-semibold"
                                style={{ width: `${(m.days / totalDays) * 100}%` }}
                              >
                                {m.month}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Linhas do Gantt */}
                        <div className="divide-y">
                          {timeline.phases.map((phase, index) => {
                            const barStyle = getBarStyle(phase.startDate, phase.endDate);
                            const duration = Math.ceil((new Date(phase.endDate).getTime() - new Date(phase.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                            
                            return (
                              <div key={phase.id} className="flex hover:bg-blue-50 transition-colors">
                                {/* Nome da tarefa */}
                                <div className="w-64 p-3 border-r">
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs">
                                      {index + 1}
                                    </Badge>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{phase.name.replace(`Fase ${index + 1}: `, '')}</p>
                                      <p className="text-xs text-gray-500">{duration} dias</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Área do gráfico */}
                                <div className="flex-1 p-2 relative">
                                  {/* Grid de fundo */}
                                  <div className="absolute inset-0 flex">
                                    {months.map((m, i) => (
                                      <div
                                        key={i}
                                        className="border-r last:border-r-0"
                                        style={{ width: `${(m.days / totalDays) * 100}%` }}
                                      />
                                    ))}
                                  </div>

                                  {/* Barra de progresso */}
                                  <div className="relative h-8 flex items-center">
                                    <div
                                      className="absolute h-6 rounded-md shadow-sm flex items-center justify-between px-2 text-xs font-medium text-white transition-all hover:shadow-md"
                                      style={{
                                        ...barStyle,
                                        backgroundColor: `hsl(${(index * 360) / timeline.phases.length}, 70%, 50%)`
                                      }}
                                    >
                                      <span className="truncate">{new Date(phase.startDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                                      <span className="truncate">{new Date(phase.endDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                                    </div>
                                  </div>

                                  {/* Milestone (diamante) no final */}
                                  <div
                                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-green-600 rotate-45 border-2 border-white shadow-md"
                                    style={{ left: `calc(${barStyle.left} + ${barStyle.width})` }}
                                    title={`Marco: ${phase.name}`}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Legenda */}
                      <div className="flex items-center justify-center space-x-6 text-xs text-gray-600 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-blue-500 rounded"></div>
                          <span>Fase do Projeto</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-600 rotate-45 border-2 border-white"></div>
                          <span>Marco (Milestone)</span>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground text-center">
                        Cronograma gerado automaticamente no formato Gantt. Você poderá editar após criar o projeto.
                      </p>
                    </>
                  );
                }, [deliverables])}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isCreating}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={isCreating || !name.trim()}>
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Criar Projeto
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
