'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Users, 
  DollarSign, 
  Clock, 
  AlertCircle, 
  CheckCircle2,
  Briefcase,
  Settings,
  Calculator,
  Save,
  X
} from 'lucide-react';
import { JobPositionsManager, JobPosition } from '../positions/JobPositionsManager';

export interface TeamMemberNew {
  id: string;
  jobPositionId: string;
  quantity: number; // Number of people in this position
  workingHours: 8 | 6; // 8 or 6 hours
  isActive: boolean;
  notes?: string;
  // Legacy fields for backward compatibility
  name?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface TeamTabModuleNewProps {
  data: TeamMemberNew[]; // Team data from the system
  onUpdate: (team: TeamMemberNew[]) => void;
  fullData?: any; // Full ServiceDeskData for dimensioning
  onUpdateSchedule?: (schedules: any[]) => void; // Callback to update schedules
  isLoading?: boolean;
  validation?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    completionPercentage: number;
  };
}

export function TeamTabModuleNew({ 
  data: teamProp, 
  onUpdate, 
  fullData,
  onUpdateSchedule,
  isLoading = false,
  validation 
}: TeamTabModuleNewProps) {
  // Ensure team is always an array
  const team = teamProp || [];
  
  const [activeTab, setActiveTab] = useState('team');
  const [selectedPosition, setSelectedPosition] = useState<JobPosition | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMemberNew | null>(null);
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);
  
  const [memberForm, setMemberForm] = useState({
    jobPositionId: '',
    quantity: 1,
    workingHours: 8 as 8 | 6,
    notes: ''
  });

  // Load job positions (in a real app, this would come from API)
  useEffect(() => {
    const defaultPositions: JobPosition[] = [
      {
        id: 'pos-1',
        name: 'Analista de Service Desk N1',
        level: 'N1',
        salary8h: 1780.00,
        salary6h: 1580.00,
        description: 'Analista responsável pelo primeiro nível de atendimento',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'pos-2',
        name: 'Analista de Service Desk N2',
        level: 'N2',
        salary8h: 2880.00,
        description: 'Analista responsável pelo segundo nível de atendimento',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'pos-3',
        name: 'Analista de Service Desk N3',
        level: 'N3',
        salary8h: 7380.00,
        description: 'Analista responsável pelo terceiro nível de atendimento',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'pos-4',
        name: 'Líder Técnico',
        level: 'Liderança',
        salary8h: 5200.00,
        description: 'Líder técnico responsável pela coordenação da equipe técnica',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'pos-5',
        name: 'Coordenador',
        level: 'Gestão',
        salary8h: 9800.00,
        description: 'Coordenador responsável pela gestão geral do projeto',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    setJobPositions(defaultPositions);
  }, []);

  const handleAddMember = () => {
    setIsAddingMember(true);
    setEditingMember(null);
    setMemberForm({
      jobPositionId: '',
      quantity: 1,
      workingHours: 8,
      notes: ''
    });
  };

  const handleEditMember = (member: TeamMemberNew) => {
    setEditingMember(member);
    setIsAddingMember(false);
    setMemberForm({
      jobPositionId: member.jobPositionId,
      quantity: member.quantity,
      workingHours: member.workingHours,
      notes: member.notes || ''
    });
  };

  const handleSaveMember = () => {
    if (!memberForm.jobPositionId || memberForm.quantity < 1) {
      return;
    }

    const memberData: TeamMemberNew = {
      id: editingMember?.id || `member-${Date.now()}`,
      jobPositionId: memberForm.jobPositionId,
      quantity: memberForm.quantity,
      workingHours: memberForm.workingHours,
      isActive: true,
      notes: memberForm.notes || undefined
    };

    if (editingMember) {
      // Update existing member
      const updatedTeam = team.map(member => 
        member.id === editingMember.id ? memberData : member
      );
      onUpdate(updatedTeam);
    } else {
      // Add new member
      onUpdate([...team, memberData]);
    }

    // Reset form
    setIsAddingMember(false);
    setEditingMember(null);
    setMemberForm({
      jobPositionId: '',
      quantity: 1,
      workingHours: 8,
      notes: ''
    });
  };

  const handleDeleteMember = (memberId: string) => {
    if (confirm('Tem certeza que deseja remover este membro da equipe?')) {
      const updatedTeam = team.filter(member => member.id !== memberId);
      onUpdate(updatedTeam);
    }
  };

  const handleCancel = () => {
    setIsAddingMember(false);
    setEditingMember(null);
    setMemberForm({
      jobPositionId: '',
      quantity: 1,
      workingHours: 8,
      notes: ''
    });
  };

  // Função para gerar escala básica automaticamente
  const generateBasicSchedule = useCallback((teamMembers: TeamMemberNew[], fullData: any) => {
    if (!fullData?.project?.dimensioning) return;

    const coverageType = fullData.project.dimensioning.coverageType;
    const schedules = [];

    // Criar escala baseada no tipo de cobertura
    if (coverageType === 'BUSINESS_HOURS' || coverageType === '8x5') {
      // Escala 8x5 (Segunda a Sexta, 8h às 18h)
      const totalMembers = teamMembers.reduce((sum, member) => sum + member.quantity, 0);
      schedules.push({
        id: `schedule-${Date.now()}`,
        name: 'Horário Comercial',
        shifts: [
          {
            id: `shift-${Date.now()}-1`,
            name: 'Turno Comercial',
            startTime: '08:00',
            endTime: '18:00',
            daysOfWeek: [1, 2, 3, 4, 5], // Segunda a Sexta
            teamMembers: teamMembers.flatMap(member => {
              const entries = [];
              for (let i = 0; i < member.quantity; i++) {
                entries.push(`${member.id}-${i}`);
              }
              return entries;
            }),
            isSpecialShift: false,
            multiplier: 1.0
          }
        ],
        coverage: {
          minimumStaff: Math.max(1, Math.floor(totalMembers * 0.6)),
          preferredStaff: totalMembers,
          skillRequirements: [],
          availabilityHours: [
            {
              startTime: '08:00',
              endTime: '18:00',
              daysOfWeek: [1, 2, 3, 4, 5],
              priority: 'high'
            }
          ]
        },
        specialRates: []
      });
    } else if (coverageType === 'EXTENDED_HOURS' || coverageType === '12x5') {
      // Escala 12x5 (Segunda a Sexta, 6h às 18h)
      const totalMembers = teamMembers.reduce((sum, member) => sum + member.quantity, 0);
      schedules.push({
        id: `schedule-${Date.now()}`,
        name: 'Horário Estendido',
        shifts: [
          {
            id: `shift-${Date.now()}-1`,
            name: 'Turno Manhã',
            startTime: '06:00',
            endTime: '14:00',
            daysOfWeek: [1, 2, 3, 4, 5],
            teamMembers: teamMembers.filter(member => {
              const pos = jobPositions.find(p => p.id === member.jobPositionId);
              return pos?.level === 'N1';
            }).flatMap(member => {
              const entries = [];
              const halfQuantity = Math.ceil(member.quantity / 2);
              for (let i = 0; i < halfQuantity; i++) {
                entries.push(`${member.id}-${i}`);
              }
              return entries;
            }),
            isSpecialShift: false,
            multiplier: 1.0
          },
          {
            id: `shift-${Date.now()}-2`,
            name: 'Turno Tarde',
            startTime: '10:00',
            endTime: '18:00',
            daysOfWeek: [1, 2, 3, 4, 5],
            teamMembers: teamMembers.flatMap(member => {
              const pos = jobPositions.find(p => p.id === member.jobPositionId);
              if (pos?.level === 'N1') {
                const entries = [];
                const halfQuantity = Math.floor(member.quantity / 2);
                for (let i = Math.ceil(member.quantity / 2); i < member.quantity; i++) {
                  entries.push(`${member.id}-${i}`);
                }
                return entries;
              } else {
                // N2 trabalha no turno da tarde
                const entries = [];
                for (let i = 0; i < member.quantity; i++) {
                  entries.push(`${member.id}-${i}`);
                }
                return entries;
              }
            }),
            isSpecialShift: false,
            multiplier: 1.0
          }
        ],
        coverage: {
          minimumStaff: Math.max(1, Math.floor(totalMembers * 0.5)),
          preferredStaff: Math.ceil(totalMembers * 0.8),
          skillRequirements: [],
          availabilityHours: [
            {
              startTime: '06:00',
              endTime: '18:00',
              daysOfWeek: [1, 2, 3, 4, 5],
              priority: 'high'
            }
          ]
        },
        specialRates: []
      });
    } else if (coverageType === 'FULL_TIME' || coverageType === '24x7') {
      // Escala 24x7 com 3 turnos
      const totalMembers = teamMembers.reduce((sum, member) => sum + member.quantity, 0);
      schedules.push({
        id: `schedule-${Date.now()}`,
        name: 'Atendimento 24x7',
        shifts: [
          {
            id: `shift-${Date.now()}-1`,
            name: 'Turno Manhã (6h-14h)',
            startTime: '06:00',
            endTime: '14:00',
            daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Todos os dias
            teamMembers: teamMembers.flatMap(member => {
              const entries = [];
              const thirdQuantity = Math.ceil(member.quantity / 3);
              for (let i = 0; i < thirdQuantity; i++) {
                entries.push(`${member.id}-${i}`);
              }
              return entries;
            }),
            isSpecialShift: false,
            multiplier: 1.0
          },
          {
            id: `shift-${Date.now()}-2`,
            name: 'Turno Tarde (14h-22h)',
            startTime: '14:00',
            endTime: '22:00',
            daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
            teamMembers: teamMembers.flatMap(member => {
              const entries = [];
              const thirdQuantity = Math.ceil(member.quantity / 3);
              const startIndex = Math.ceil(member.quantity / 3);
              for (let i = startIndex; i < startIndex + thirdQuantity && i < member.quantity; i++) {
                entries.push(`${member.id}-${i}`);
              }
              return entries;
            }),
            isSpecialShift: false,
            multiplier: 1.2
          },
          {
            id: `shift-${Date.now()}-3`,
            name: 'Turno Noite (22h-6h)',
            startTime: '22:00',
            endTime: '06:00',
            daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
            teamMembers: teamMembers.flatMap(member => {
              const entries = [];
              const thirdQuantity = Math.ceil(member.quantity / 3);
              const startIndex = Math.ceil(member.quantity / 3) * 2;
              for (let i = startIndex; i < member.quantity; i++) {
                entries.push(`${member.id}-${i}`);
              }
              return entries;
            }),
            isSpecialShift: true,
            multiplier: 1.5
          }
        ],
        coverage: {
          minimumStaff: Math.max(1, Math.floor(totalMembers * 0.3)),
          preferredStaff: Math.ceil(totalMembers * 0.6),
          skillRequirements: [],
          availabilityHours: [
            {
              startTime: '00:00',
              endTime: '23:59',
              daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
              priority: 'critical'
            }
          ]
        },
        specialRates: [
          {
            name: 'Adicional Noturno',
            condition: 'night',
            multiplier: 1.5,
            applicableShifts: [`shift-${Date.now()}-3`]
          }
        ]
      });
    }

    // Atualizar os dados do sistema com a nova escala
    if (schedules.length > 0) {
      console.log('Escala gerada:', schedules);
      
      // Usar callback se disponível, senão usar localStorage como fallback
      if (onUpdateSchedule) {
        onUpdateSchedule(schedules);
      } else {
        // Fallback: salvar no localStorage para que o ScaleTab possa pegar
        localStorage.setItem('generatedSchedule', JSON.stringify(schedules));
      }
    }
  }, [jobPositions, onUpdateSchedule]);

  // Função para dimensionar equipe automaticamente baseado nos dados
  const handleDimensionTeam = useCallback(() => {
    if (!fullData?.project?.dimensioning || !fullData?.project?.generalInfo) {
      alert('Dados de dimensionamento não encontrados. Preencha a aba DADOS primeiro.');
      return;
    }

    // Calcular dimensionamento usando Erlang C (simplificado)
    const calculateErlangDimensioning = (
      userQuantity: number,
      incidentsPerUser: number,
      tmaMinutes: number,
      occupancyRate: number,
      n1Distribution: number,
      n1SixHourShift: boolean
    ) => {
      const totalCallsPerMonth = userQuantity * incidentsPerUser;
      const totalCallsPerDay = totalCallsPerMonth / 22; // 22 working days
      const totalMinutesPerDay = totalCallsPerDay * tmaMinutes;
      
      // Calcular agentes N1
      const workingMinutesPerDay = n1SixHourShift ? 360 : 480; // 6h = 360min, 8h = 480min
      const effectiveMinutes = workingMinutesPerDay * (occupancyRate / 100);
      const n1CallsPerMonth = totalCallsPerMonth * (n1Distribution / 100);
      const n1CallsPerDay = n1CallsPerMonth / 22;
      const n1MinutesPerDay = n1CallsPerDay * tmaMinutes;
      const n1Agents = Math.ceil(n1MinutesPerDay / effectiveMinutes);
      
      // Calcular agentes N2 (sempre 8h)
      const n2CallsPerMonth = totalCallsPerMonth * ((100 - n1Distribution) / 100);
      const n2CallsPerDay = n2CallsPerMonth / 22;
      const n2MinutesPerDay = n2CallsPerDay * tmaMinutes;
      const n2EffectiveMinutes = 480 * (occupancyRate / 100); // N2 sempre 8h
      const n2Agents = Math.ceil(n2MinutesPerDay / n2EffectiveMinutes);
      
      return {
        n1Agents: Math.max(1, n1Agents),
        n2Agents: Math.max(1, n2Agents),
        totalCallsPerMonth
      };
    };

    const erlangResult = calculateErlangDimensioning(
      fullData.project.generalInfo?.userQuantity || 100,
      fullData.project.dimensioning?.incidentsPerUser || 1.5,
      fullData.project.dimensioning?.tmaMinutes || 10,
      fullData.project.dimensioning?.occupancyRate || 80,
      fullData.project.dimensioning?.n1Distribution || 80,
      fullData.project.dimensioning?.n1SixHourShift || false
    );

    // Encontrar IDs dos cargos N1 e N2
    const n1Position = jobPositions.find(p => p.level === 'N1');
    const n2Position = jobPositions.find(p => p.level === 'N2');

    if (!n1Position || !n2Position) {
      alert('Cargos N1 e N2 não encontrados. Verifique se os cargos estão cadastrados.');
      return;
    }

    // Criar nova equipe dimensionada
    const dimensionedTeam: TeamMemberNew[] = [];

    // Adicionar N1
    if (erlangResult.n1Agents > 0) {
      dimensionedTeam.push({
        id: `n1-${Date.now()}`,
        jobPositionId: n1Position.id,
        quantity: erlangResult.n1Agents,
        workingHours: fullData.project.dimensioning?.n1SixHourShift ? 6 : 8,
        isActive: true,
        notes: 'Dimensionado automaticamente'
      });
    }

    // Adicionar N2
    if (erlangResult.n2Agents > 0) {
      dimensionedTeam.push({
        id: `n2-${Date.now()}`,
        jobPositionId: n2Position.id,
        quantity: erlangResult.n2Agents,
        workingHours: 8, // N2 sempre 8h
        isActive: true,
        notes: 'Dimensionado automaticamente'
      });
    }

    // Manter outros cargos (N3, Líder, Coordenador) se já existirem
    const otherPositions = team.filter(member => {
      const position = jobPositions.find(p => p.id === member.jobPositionId);
      return position && !['N1', 'N2'].includes(position.level || '');
    });

    const finalTeam = [...dimensionedTeam, ...otherPositions];
    onUpdate(finalTeam);

    // Gerar escala básica automaticamente
    generateBasicSchedule(finalTeam, fullData);

    alert(`Equipe dimensionada com sucesso!\\n\\nN1: ${erlangResult.n1Agents} pessoas\\nN2: ${erlangResult.n2Agents} pessoas\\n\\nEscala básica gerada automaticamente!\\n\\nBaseado em ${Math.round(erlangResult.totalCallsPerMonth)} chamados/mês`);
  }, [fullData, jobPositions, team, onUpdate]);

  // Calculate team costs
  const teamCosts = useMemo(() => {
    let totalCost = 0;
    let totalMembers = team.length;
    let costByPosition: Record<string, { count: number; cost: number }> = {};

    team.forEach(member => {
      const position = jobPositions.find(p => p.id === member.jobPositionId);
      if (position) {
        const salary = member.workingHours === 8 ? position.salary8h : (position.salary6h || position.salary8h);
        const memberTotalCost = salary * member.quantity;
        totalCost += memberTotalCost;

        if (!costByPosition[position.name]) {
          costByPosition[position.name] = { count: 0, cost: 0 };
        }
        costByPosition[position.name].count += member.quantity;
        costByPosition[position.name].cost += memberTotalCost;
      }
    });

    const actualTotalMembers = team.reduce((sum, member) => sum + member.quantity, 0);
    
    return {
      totalCost,
      totalMembers: actualTotalMembers,
      averageCost: actualTotalMembers > 0 ? totalCost / actualTotalMembers : 0,
      costByPosition
    };
  }, [team, jobPositions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPositionById = (id: string) => {
    return jobPositions.find(p => p.id === id);
  };

  const getLevelColor = (level?: string) => {
    switch (level) {
      case 'N1':
        return 'bg-blue-100 text-blue-800';
      case 'N2':
        return 'bg-green-100 text-green-800';
      case 'N3':
        return 'bg-purple-100 text-purple-800';
      case 'Liderança':
        return 'bg-orange-100 text-orange-800';
      case 'Gestão':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>Gestão de Equipe</span>
                  {validation && (
                    <Badge variant={validation.isValid ? 'default' : 'secondary'}>
                      {validation.completionPercentage}% completo
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure a equipe do projeto com base nos cargos e salários cadastrados
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{team.length} membros</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <DollarSign className="h-3 w-3" />
                <span>{formatCurrency(teamCosts.totalCost)}</span>
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Validation Status */}
      {validation && !validation.isValid && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Problemas encontrados:</p>
              <ul className="list-disc list-inside space-y-1">
                {validation.errors.map((error: any, index: number) => (
                  <li key={index} className="text-sm">{error.message || error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="team" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Equipe</span>
            {team.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {team.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="positions" className="flex items-center space-x-2">
            <Briefcase className="h-4 w-4" />
            <span>Cargos</span>
          </TabsTrigger>
          <TabsTrigger value="costs" className="flex items-center space-x-2">
            <Calculator className="h-4 w-4" />
            <span>Custos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="space-y-6">
          {/* Add/Edit Member Form */}
          {(isAddingMember || editingMember) && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingMember ? 'Editar Cargo' : 'Adicionar Cargo'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="job-position">Cargo *</Label>
                    <Select
                      value={memberForm.jobPositionId}
                      onValueChange={(value) => setMemberForm(prev => ({ ...prev, jobPositionId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cargo" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobPositions.map((position) => (
                          <SelectItem key={position.id} value={position.id}>
                            <div className="flex items-center space-x-2">
                              <span>{position.name}</span>
                              {position.level && (
                                <Badge className={getLevelColor(position.level)} variant="secondary">
                                  {position.level}
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantidade *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={memberForm.quantity}
                      onChange={(e) => setMemberForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                      placeholder="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="working-hours">Carga Horária</Label>
                    <Select
                      value={memberForm.workingHours.toString()}
                      onValueChange={(value) => setMemberForm(prev => ({ 
                        ...prev, 
                        workingHours: parseInt(value) as 8 | 6 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8">8 horas</SelectItem>
                        <SelectItem value="6">6 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Input
                    id="notes"
                    value={memberForm.notes}
                    onChange={(e) => setMemberForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Observações adicionais"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Button onClick={handleSaveMember} className="flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>Salvar</span>
                  </Button>
                  <Button variant="outline" onClick={handleCancel} className="flex items-center space-x-2">
                    <X className="h-4 w-4" />
                    <span>Cancelar</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dimensioning Info */}
          {fullData?.project?.dimensioning && fullData?.project?.generalInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5" />
                  <span>Informações de Dimensionamento</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Usuários</p>
                    <p className="text-muted-foreground">{fullData.project.generalInfo.userQuantity || 0}</p>
                  </div>
                  <div>
                    <p className="font-medium">Chamados/mês</p>
                    <p className="text-muted-foreground">
                      {Math.round((fullData.project.generalInfo.userQuantity || 0) * (fullData.project.dimensioning.incidentsPerUser || 1.5))}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Distribuição N1</p>
                    <p className="text-muted-foreground">{fullData.project.dimensioning.n1Distribution || 80}%</p>
                  </div>
                  <div>
                    <p className="font-medium">Cobertura</p>
                    <p className="text-muted-foreground">
                      {fullData.project.dimensioning.coverageType === 'BUSINESS_HOURS' && '8x5'}
                      {fullData.project.dimensioning.coverageType === 'EXTENDED_HOURS' && '12x5'}
                      {fullData.project.dimensioning.coverageType === 'FULL_TIME' && '24x7'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Team Members List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Membros da Equipe</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={handleDimensionTeam}
                    variant="outline"
                    className="flex items-center space-x-2"
                    disabled={!fullData?.project?.dimensioning || !fullData?.project?.generalInfo}
                  >
                    <Calculator className="h-4 w-4" />
                    <span>Dimensionar Equipe</span>
                  </Button>
                  <Button onClick={handleAddMember} className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Adicionar Cargo</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {team.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum cargo na equipe</h3>
                  <p className="text-muted-foreground mb-4">
                    Use "Dimensionar Equipe" para calcular automaticamente ou adicione cargos manualmente
                  </p>
                  <div className="flex items-center justify-center space-x-2">
                    <Button 
                      onClick={handleDimensionTeam}
                      disabled={!fullData?.project?.dimensioning || !fullData?.project?.generalInfo}
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      Dimensionar Equipe
                    </Button>
                    <Button variant="outline" onClick={handleAddMember}>
                      Adicionar Cargo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {team.map((member) => {
                    const position = getPositionById(member.jobPositionId);
                    const salary = position ? (
                      member.workingHours === 8 ? position.salary8h : (position.salary6h || position.salary8h)
                    ) : 0;

                    return (
                      <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold">{position?.name || 'Cargo não encontrado'}</h3>
                            <Badge variant="outline">
                              {member.quantity} {member.quantity === 1 ? 'pessoa' : 'pessoas'}
                            </Badge>
                            {position?.level && (
                              <Badge className={getLevelColor(position.level)}>
                                {position.level}
                              </Badge>
                            )}
                            <Badge variant="outline">
                              {member.workingHours}h
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4" />
                              <span>{formatCurrency(salary)} por pessoa</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-semibold text-primary">{formatCurrency(salary * member.quantity)} total</span>
                            </span>
                          </div>
                          {member.notes && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Obs: {member.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditMember(member)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMember(member.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positions" className="space-y-6">
          <JobPositionsManager readOnly />
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
          {/* Cost Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo de Custos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{teamCosts.totalMembers}</div>
                  <div className="text-sm text-muted-foreground">Total de Membros</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(teamCosts.totalCost)}
                  </div>
                  <div className="text-sm text-muted-foreground">Custo Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(teamCosts.averageCost)}
                  </div>
                  <div className="text-sm text-muted-foreground">Custo Médio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(teamCosts.totalCost * 12)}
                  </div>
                  <div className="text-sm text-muted-foreground">Custo Anual</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Breakdown by Position */}
          {Object.keys(teamCosts.costByPosition).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Custos por Cargo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(teamCosts.costByPosition).map(([positionName, data]) => (
                    <div key={positionName} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{positionName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {data.count} {data.count === 1 ? 'membro' : 'membros'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(data.cost)}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(data.cost / data.count)} por membro
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}