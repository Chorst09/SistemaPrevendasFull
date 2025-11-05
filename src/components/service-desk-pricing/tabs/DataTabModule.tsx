'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ProjectData, TabValidationStatus, ServiceType, RenewalOption, CoverageType } from '@/lib/types/service-desk-pricing';
import styles from './DataTabModule.module.css';

export interface DataTabModuleProps {
  data: ProjectData;
  onUpdate: (data: ProjectData) => void;
  validation?: TabValidationStatus;
  isLoading?: boolean;
  onAutoSave?: (data: ProjectData) => void;
}

export function DataTabModule({ 
  data, 
  onUpdate, 
  validation, 
  isLoading = false,
  onAutoSave 
}: DataTabModuleProps) {
  const [localData, setLocalData] = useState<ProjectData>(data);
  const [hasChanges, setHasChanges] = useState(false);

  // Auto-save functionality with debouncing
  useEffect(() => {
    if (hasChanges && onAutoSave) {
      const timeoutId = setTimeout(() => {
        onAutoSave(localData);
        setHasChanges(false);
      }, 2000); // 2 second delay

      return () => clearTimeout(timeoutId);
    }
  }, [localData, hasChanges, onAutoSave]);

  // Update local data when prop changes
  useEffect(() => {
    setLocalData(data);
    setHasChanges(false);
  }, [data]);

  const handleFieldChange = useCallback((field: string, value: any) => {
    setLocalData(prev => {
      const newData = { ...prev };
      const fieldPath = field.split('.');
      
      let current: any = newData;
      for (let i = 0; i < fieldPath.length - 1; i++) {
        if (!current[fieldPath[i]]) {
          current[fieldPath[i]] = {};
        }
        current = current[fieldPath[i]];
      }
      
      current[fieldPath[fieldPath.length - 1]] = value;
      newData.updatedAt = new Date();
      
      return newData;
    });
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(() => {
    onUpdate(localData);
    setHasChanges(false);
  }, [localData, onUpdate]);

  const calculateContractDuration = useCallback((startDate: Date, endDate: Date): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.ceil(diffDays / 30); // Convert to months
  }, []);

  // Função para calcular o volume de chamados baseado nos usuários e incidentes
  const calculateMonthlyCalls = useCallback((userQuantity: number, incidentsPerUser: number): number => {
    return Math.round(userQuantity * incidentsPerUser);
  }, []);

  // Função para calcular dimensionamento N1
  const calculateN1Agents = useCallback((
    userQuantity: number,
    incidentsPerUser: number,
    n1Distribution: number,
    n1Capacity: number,
    n1SixHourShift: boolean
  ): number => {
    const totalCalls = userQuantity * incidentsPerUser;
    const n1Calls = totalCalls * (n1Distribution / 100);
    
    // Ajustar capacidade se for turno de 6 horas (75% da capacidade de 8h)
    const adjustedCapacity = n1SixHourShift ? n1Capacity * 0.75 : n1Capacity;
    
    const agents = Math.ceil(n1Calls / adjustedCapacity);
    return Math.max(1, agents); // Mínimo 1 agente
  }, []);

  // Função para calcular dimensionamento N2
  const calculateN2Agents = useCallback((
    userQuantity: number,
    incidentsPerUser: number,
    n1Distribution: number,
    n2Capacity: number
  ): number => {
    const totalCalls = userQuantity * incidentsPerUser;
    const n2Calls = totalCalls * ((100 - n1Distribution) / 100);
    
    const agents = Math.ceil(n2Calls / n2Capacity);
    return Math.max(1, agents); // Mínimo 1 agente
  }, []);

  // Função para calcular dimensionamento baseado em Erlang C (simplificado)
  const calculateErlangDimensioning = useCallback((
    userQuantity: number,
    incidentsPerUser: number,
    tmaMinutes: number,
    occupancyRate: number,
    n1Distribution: number,
    n1SixHourShift: boolean = false
  ) => {
    const totalCallsPerMonth = userQuantity * incidentsPerUser;
    const totalCallsPerDay = totalCallsPerMonth / 22; // 22 dias úteis
    const totalCallsPerHour = totalCallsPerDay / 8; // 8 horas de trabalho
    
    // Cálculo de carga de trabalho (Erlang) - versão mais realista
    const workloadErlang = (totalCallsPerHour * tmaMinutes) / 60;
    
    // Ajustar pela taxa de ocupação e adicionar fatores de segurança
    const occupancyFactor = occupancyRate / 100;
    const safetyFactor = 1.2; // 20% de margem de segurança
    const adjustedWorkload = (workloadErlang / occupancyFactor) * safetyFactor;
    
    // Distribuir entre N1 e N2
    const n1Workload = adjustedWorkload * (n1Distribution / 100);
    const n2Workload = adjustedWorkload * ((100 - n1Distribution) / 100);
    
    // Calcular agentes com base na capacidade real
    const n1AgentsBasic = Math.ceil(n1Workload);
    const n2AgentsBasic = Math.ceil(n2Workload);
    
    // Para volumes maiores, usar cálculo baseado em capacidade
    const n1CallsPerMonth = totalCallsPerMonth * (n1Distribution / 100);
    const n2CallsPerMonth = totalCallsPerMonth * ((100 - n1Distribution) / 100);
    
    // Capacidades padrão (chamados/mês por agente)
    let n1MonthlyCapacity = 100;
    const n2MonthlyCapacity = 75;
    
    // Ajustar capacidade N1 se for turno de 6 horas (75% da capacidade de 8h)
    if (n1SixHourShift) {
      n1MonthlyCapacity = Math.round(n1MonthlyCapacity * 0.75);
    }
    
    const n1AgentsCapacity = Math.ceil(n1CallsPerMonth / n1MonthlyCapacity);
    const n2AgentsCapacity = Math.ceil(n2CallsPerMonth / n2MonthlyCapacity);
    
    // Usar o maior entre os dois métodos para garantir capacidade adequada
    const n1Agents = Math.max(1, Math.max(n1AgentsBasic, n1AgentsCapacity));
    const n2Agents = Math.max(1, Math.max(n2AgentsBasic, n2AgentsCapacity));
    
    return {
      totalCallsPerMonth,
      n1Agents,
      n2Agents,
      workloadErlang: Math.round(adjustedWorkload * 100) / 100,
      n1Capacity: n1MonthlyCapacity,
      n2Capacity: n2MonthlyCapacity
    };
  }, []);

  // Função para criar escalas automáticas baseadas no tipo de cobertura
  const createAutomaticSchedules = useCallback((
    n1Agents: number,
    n2Agents: number,
    coverageType: string,
    n1SixHourShift: boolean
  ) => {
    const schedules = [];
    
    switch (coverageType) {
      case CoverageType.BUSINESS_HOURS: // 8x5
        // Turno único: Segunda a Sexta, 8h às 17h
        schedules.push({
          id: crypto.randomUUID(),
          name: 'Horário Comercial',
          shifts: [
            {
              id: crypto.randomUUID(),
              name: n1SixHourShift ? 'N1 - Manhã (6h)' : 'N1 - Comercial (8h)',
              startTime: '08:00',
              endTime: n1SixHourShift ? '14:00' : '17:00',
              daysOfWeek: [1, 2, 3, 4, 5], // Segunda a Sexta
              teamMembers: Array.from({ length: n1Agents }, (_, i) => `n1-agent-${i + 1}`),
              isSpecialShift: false,
              multiplier: 1.0
            },
            {
              id: crypto.randomUUID(),
              name: 'N2 - Comercial (8h)',
              startTime: '08:00',
              endTime: '17:00',
              daysOfWeek: [1, 2, 3, 4, 5],
              teamMembers: Array.from({ length: n2Agents }, (_, i) => `n2-agent-${i + 1}`),
              isSpecialShift: false,
              multiplier: 1.0
            }
          ],
          coverage: {
            minimumStaff: Math.min(n1Agents + n2Agents, 2),
            preferredStaff: n1Agents + n2Agents,
            skillRequirements: [],
            availabilityHours: [
              {
                startTime: '08:00',
                endTime: '17:00',
                daysOfWeek: [1, 2, 3, 4, 5],
                priority: 'high' as const
              }
            ]
          },
          specialRates: []
        });
        break;

      case CoverageType.EXTENDED_HOURS: // 12x5
        schedules.push({
          id: crypto.randomUUID(),
          name: 'Horário Estendido',
          shifts: [
            {
              id: crypto.randomUUID(),
              name: n1SixHourShift ? 'N1 - Manhã (6h)' : 'N1 - Manhã (8h)',
              startTime: '07:00',
              endTime: n1SixHourShift ? '13:00' : '15:00',
              daysOfWeek: [1, 2, 3, 4, 5],
              teamMembers: Array.from({ length: Math.ceil(n1Agents / 2) }, (_, i) => `n1-morning-${i + 1}`),
              isSpecialShift: false,
              multiplier: 1.0
            },
            {
              id: crypto.randomUUID(),
              name: n1SixHourShift ? 'N1 - Tarde (6h)' : 'N1 - Tarde (8h)',
              startTime: n1SixHourShift ? '13:00' : '11:00',
              endTime: '19:00',
              daysOfWeek: [1, 2, 3, 4, 5],
              teamMembers: Array.from({ length: Math.floor(n1Agents / 2) }, (_, i) => `n1-afternoon-${i + 1}`),
              isSpecialShift: false,
              multiplier: 1.0
            },
            {
              id: crypto.randomUUID(),
              name: 'N2 - Estendido (12h)',
              startTime: '07:00',
              endTime: '19:00',
              daysOfWeek: [1, 2, 3, 4, 5],
              teamMembers: Array.from({ length: n2Agents }, (_, i) => `n2-extended-${i + 1}`),
              isSpecialShift: false,
              multiplier: 1.0
            }
          ],
          coverage: {
            minimumStaff: Math.min(n1Agents + n2Agents, 3),
            preferredStaff: n1Agents + n2Agents,
            skillRequirements: [],
            availabilityHours: [
              {
                startTime: '07:00',
                endTime: '19:00',
                daysOfWeek: [1, 2, 3, 4, 5],
                priority: 'high' as const
              }
            ]
          },
          specialRates: []
        });
        break;

      case CoverageType.FULL_TIME: // 24x7
        const totalAgents = n1Agents + n2Agents;
        const agentsPerShift = Math.ceil(totalAgents / 4); // 4 turnos de 6h
        
        schedules.push({
          id: crypto.randomUUID(),
          name: 'Cobertura 24x7',
          shifts: [
            {
              id: crypto.randomUUID(),
              name: 'Turno 1 - Madrugada (00h-06h)',
              startTime: '00:00',
              endTime: '06:00',
              daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Todos os dias
              teamMembers: Array.from({ length: agentsPerShift }, (_, i) => `shift1-agent-${i + 1}`),
              isSpecialShift: true,
              multiplier: 1.3 // Adicional noturno
            },
            {
              id: crypto.randomUUID(),
              name: 'Turno 2 - Manhã (06h-12h)',
              startTime: '06:00',
              endTime: '12:00',
              daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
              teamMembers: Array.from({ length: agentsPerShift }, (_, i) => `shift2-agent-${i + 1}`),
              isSpecialShift: false,
              multiplier: 1.0
            },
            {
              id: crypto.randomUUID(),
              name: 'Turno 3 - Tarde (12h-18h)',
              startTime: '12:00',
              endTime: '18:00',
              daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
              teamMembers: Array.from({ length: agentsPerShift }, (_, i) => `shift3-agent-${i + 1}`),
              isSpecialShift: false,
              multiplier: 1.0
            },
            {
              id: crypto.randomUUID(),
              name: 'Turno 4 - Noite (18h-00h)',
              startTime: '18:00',
              endTime: '23:59',
              daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
              teamMembers: Array.from({ length: agentsPerShift }, (_, i) => `shift4-agent-${i + 1}`),
              isSpecialShift: true,
              multiplier: 1.2 // Adicional noturno
            }
          ],
          coverage: {
            minimumStaff: agentsPerShift,
            preferredStaff: agentsPerShift + 1,
            skillRequirements: [],
            availabilityHours: [
              {
                startTime: '00:00',
                endTime: '23:59',
                daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
                priority: 'critical' as const
              }
            ]
          },
          specialRates: [
            {
              name: 'Adicional Noturno',
              condition: 'night',
              multiplier: 1.2,
              applicableShifts: ['shift1', 'shift4']
            },
            {
              name: 'Adicional Fim de Semana',
              condition: 'weekend',
              multiplier: 1.1,
              applicableShifts: ['shift1', 'shift2', 'shift3', 'shift4']
            }
          ]
        });
        break;
    }
    
    return schedules;
  }, []);

  const handleDateChange = useCallback((field: string, date: Date | undefined) => {
    if (!date) return;
    
    handleFieldChange(field, date);
    
    // Auto-calculate duration when both dates are set
    if (field === 'contractPeriod.startDate' && localData.contractPeriod.endDate) {
      const duration = calculateContractDuration(date, localData.contractPeriod.endDate);
      handleFieldChange('contractPeriod.durationMonths', duration);
    } else if (field === 'contractPeriod.endDate' && localData.contractPeriod.startDate) {
      const duration = calculateContractDuration(localData.contractPeriod.startDate, date);
      handleFieldChange('contractPeriod.durationMonths', duration);
    }
  }, [localData.contractPeriod, handleFieldChange, calculateContractDuration]);



  const getFieldError = (fieldName: string) => {
    return validation?.errors.find(error => error.field === fieldName);
  };

  const getFieldWarning = (fieldName: string) => {
    return validation?.warnings.find(warning => warning.field === fieldName);
  };

  const getValidationIcon = () => {
    if (!validation) return <Clock className="h-4 w-4 text-muted-foreground" />;
    if (validation.isValid) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  const getCompletionBadge = () => {
    if (!validation) return null;
    
    const percentage = validation.completionPercentage;
    const variant = percentage >= 80 ? 'default' : percentage >= 50 ? 'secondary' : 'destructive';
    
    return (
      <Badge variant={variant} className="ml-2">
        {percentage}% completo
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with validation status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CardTitle className="flex items-center space-x-2">
                {getValidationIcon()}
                <span>Dados do Projeto</span>
              </CardTitle>
              {getCompletionBadge()}
            </div>
            <div className="flex items-center space-x-2">
              {hasChanges && (
                <Badge variant="outline" className="text-orange-600">
                  <Clock className="h-3 w-3 mr-1" />
                  Salvando...
                </Badge>
              )}
              <Button 
                onClick={handleSave} 
                disabled={!hasChanges || isLoading}
                size="sm"
              >
                Salvar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Validation Alerts */}
      {validation && validation.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Campos obrigatórios não preenchidos:</p>
              <ul className="list-disc list-inside space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index} className="text-sm">{error.message}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {validation && validation.warnings.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Atenção:</p>
              <ul className="list-disc list-inside space-y-1">
                {validation.warnings.map((warning, index) => (
                  <li key={index} className="text-sm">
                    {warning.message}
                    {warning.suggestion && (
                      <span className="text-muted-foreground"> - {warning.suggestion}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Dados do Projeto */}
      <Card>
        <CardHeader>
          <CardTitle>Dados do Projeto</CardTitle>
          <p className="text-sm text-muted-foreground">
            Preencha as informações do projeto e dimensione a equipe.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações do Projeto e Cliente */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className={styles.sectionTitle}>Informações do Projeto e Cliente</h3>
              
              <div className="space-y-2">
                <Label htmlFor="project-name">Nome do Projeto</Label>
                <Input
                  id="project-name"
                  value={localData.name || 'Novo Projeto de Service Desk'}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  placeholder="Novo Projeto de Service Desk"
                  className={cn(getFieldError('name') && "border-red-500")}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-type">Tipo do Projeto</Label>
                <Select
                  value={localData.serviceType || 'STANDARD'}
                  onValueChange={(value) => handleFieldChange('serviceType', value as ServiceType)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Balcão de atendimento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BASIC">Suporte Básico</SelectItem>
                    <SelectItem value="STANDARD">Balcão de atendimento</SelectItem>
                    <SelectItem value="PREMIUM">Service Desk Avançado</SelectItem>
                    <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                    <SelectItem value="CUSTOM">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-social-reason">Razão Social do Cliente</Label>
                <Input
                  id="client-social-reason"
                  value={localData.client?.name || ''}
                  onChange={(e) => handleFieldChange('client.name', e.target.value)}
                  placeholder="Nome da empresa cliente"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-contact">Contato do Cliente</Label>
                <Input
                  id="client-contact"
                  value={localData.client?.contactPerson || ''}
                  onChange={(e) => handleFieldChange('client.contactPerson', e.target.value)}
                  placeholder="Nome do responsável"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Serviços Adicionais */}
            <div className="space-y-4">
              <h3 className={styles.sectionTitle}>Serviços Adicionais</h3>
              
              <div className="space-y-3">
                <div className={styles.checkboxContainer}>
                  <Label htmlFor="needs-software">Precisa de um software de Service Desk?</Label>
                  <input
                    type="checkbox"
                    id="needs-software"
                    checked={localData.additionalServices?.needsSoftware || false}
                    onChange={(e) => handleFieldChange('additionalServices.needsSoftware', e.target.checked)}
                    className={styles.customCheckbox}
                    disabled={isLoading}
                  />
                </div>

                <div className={styles.checkboxContainer}>
                  <Label htmlFor="needs-0800">Necessita um nº 0800?</Label>
                  <input
                    type="checkbox"
                    id="needs-0800"
                    checked={localData.additionalServices?.needs0800 || false}
                    onChange={(e) => handleFieldChange('additionalServices.needs0800', e.target.checked)}
                    className={styles.customCheckbox}
                    disabled={isLoading}
                  />
                </div>

                <div className={styles.checkboxContainer}>
                  <Label htmlFor="needs-directcall">Precisa de uma linha telefônica Directcall?</Label>
                  <input
                    type="checkbox"
                    id="needs-directcall"
                    checked={localData.additionalServices?.needsDirectCall || false}
                    onChange={(e) => handleFieldChange('additionalServices.needsDirectCall', e.target.checked)}
                    className={styles.customCheckbox}
                    disabled={isLoading}
                  />
                </div>

                <div className={styles.checkboxContainer}>
                  <Label htmlFor="needs-infrastructure">Fornecedor de infraestrutura NR17?</Label>
                  <input
                    type="checkbox"
                    id="needs-infrastructure"
                    checked={localData.additionalServices?.needsInfrastructure || false}
                    onChange={(e) => handleFieldChange('additionalServices.needsInfrastructure', e.target.checked)}
                    className={styles.customCheckbox}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações Gerais */}
      <Card className={styles.darkCard}>
        <CardHeader>
          <CardTitle className={styles.cyanTitle}>Informações Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="user-quantity">Quantidade de Usuários</Label>
              <Input
                id="user-quantity"
                type="number"
                value={localData.generalInfo?.userQuantity || 100}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  handleFieldChange('generalInfo.userQuantity', value);
                }}
                placeholder="100"
                min="1"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly-calls">Volume de Chamados/Mês</Label>
              <div className={styles.inputWithIcon}>
                <Input
                  id="monthly-calls"
                  type="number"
                  value={calculateMonthlyCalls(
                    localData.generalInfo?.userQuantity || 100,
                    localData.dimensioning?.incidentsPerUser || 1.5
                  )}
                  placeholder="150"
                  min="1"
                  disabled={true}
                  readOnly
                  className="bg-slate-100 text-slate-600"
                />
                <div className={styles.lockIcon}>
                  <span>🔒</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dimensionamento Automático (Erlang C Simplificado) */}
      <Card className={styles.darkCard}>
        <CardHeader>
          <CardTitle className={styles.cyanTitle}>Dimensionamento Automático (Erlang C Simplificado)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Ajuste as configurações para ver a sugestão de equipe. Clique em "Aplicar" para usar os valores.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="incidents-per-user">Incidentes por Usuário/Mês</Label>
              <Input
                id="incidents-per-user"
                type="number"
                step="0.1"
                value={localData.dimensioning?.incidentsPerUser || 1.5}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  handleFieldChange('dimensioning.incidentsPerUser', value);
                }}
                placeholder="1.5"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tma-minutes">TMA (minutos)</Label>
              <Input
                id="tma-minutes"
                type="number"
                value={localData.dimensioning?.tmaMinutes || 10}
                onChange={(e) => handleFieldChange('dimensioning.tmaMinutes', parseInt(e.target.value) || 0)}
                placeholder="10"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupancy-rate">Taxa de Ocupação (%)</Label>
              <Input
                id="occupancy-rate"
                type="number"
                value={localData.dimensioning?.occupancyRate || 80}
                onChange={(e) => handleFieldChange('dimensioning.occupancyRate', parseInt(e.target.value) || 0)}
                placeholder="80"
                min="1"
                max="100"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="n1-distribution">Distribuição N1 (%)</Label>
              <Input
                id="n1-distribution"
                type="number"
                value={localData.dimensioning?.n1Distribution || 80}
                onChange={(e) => handleFieldChange('dimensioning.n1Distribution', parseInt(e.target.value) || 0)}
                placeholder="80"
                min="0"
                max="100"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="n1-capacity">Capacidade N1 (chamados/mês/8h)</Label>
              <div className={styles.inputWithIcon}>
                <Input
                  id="n1-capacity"
                  type="number"
                  value={localData.dimensioning?.n1Capacity || 100}
                  onChange={(e) => handleFieldChange('dimensioning.n1Capacity', parseInt(e.target.value) || 0)}
                  placeholder="100"
                  disabled={isLoading}
                />
                <div className={styles.lockIcon}>
                  <span>🔒</span>
                </div>
              </div>
              <p className={styles.referenceText}>
                Referência (80-120): Média 100 chamados/mês por atendente.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="n2-capacity">Capacidade N2 (chamados/mês/8h)</Label>
              <div className={styles.inputWithIcon}>
                <Input
                  id="n2-capacity"
                  type="number"
                  value={localData.dimensioning?.n2Capacity || 75}
                  onChange={(e) => handleFieldChange('dimensioning.n2Capacity', parseInt(e.target.value) || 0)}
                  placeholder="75"
                  disabled={isLoading}
                />
                <div className={styles.lockIcon}>
                  <span>🔒</span>
                </div>
              </div>
              <p className={styles.referenceText}>
                Referência (60-90): Média 75 chamados/mês por atendente.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="n1-6hour-shift"
                  checked={localData.dimensioning?.n1SixHourShift || false}
                  onChange={(e) => handleFieldChange('dimensioning.n1SixHourShift', e.target.checked)}
                  className="rounded"
                  disabled={isLoading}
                />
                <Label htmlFor="n1-6hour-shift">Analista N1 fará turno de 6 horas?</Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="coverage-type">Tipo de Cobertura</Label>
                <Select
                  value={localData.dimensioning?.coverageType || CoverageType.BUSINESS_HOURS}
                  onValueChange={(value) => handleFieldChange('dimensioning.coverageType', value as CoverageType)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de cobertura" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CoverageType.BUSINESS_HOURS}>8x5 - Horário Comercial</SelectItem>
                    <SelectItem value={CoverageType.EXTENDED_HOURS}>12x5 - Horário Estendido</SelectItem>
                    <SelectItem value={CoverageType.FULL_TIME}>24x7 - Tempo Integral</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {localData.dimensioning?.coverageType === CoverageType.BUSINESS_HOURS && 'Segunda a Sexta: 8h às 17h'}
                  {localData.dimensioning?.coverageType === CoverageType.EXTENDED_HOURS && 'Segunda a Sexta: 7h às 19h'}
                  {localData.dimensioning?.coverageType === CoverageType.FULL_TIME && 'Todos os dias: 24 horas'}
                </p>
              </div>
            </div>
          </div>

          {/* Resultados do Dimensionamento */}
          <div className={styles.gridResults}>
            <Card className={styles.resultCard}>
              <CardContent className="p-4 text-center">
                <div className={styles.resultNumber}>
                  {(() => {
                    const erlangResult = calculateErlangDimensioning(
                      localData.generalInfo?.userQuantity || 100,
                      localData.dimensioning?.incidentsPerUser || 1.5,
                      localData.dimensioning?.tmaMinutes || 10,
                      localData.dimensioning?.occupancyRate || 80,
                      localData.dimensioning?.n1Distribution || 80,
                      localData.dimensioning?.n1SixHourShift || false
                    );
                    return erlangResult.n1Agents;
                  })()}
                </div>
                <p className={styles.resultLabel}>Atendentes Sugeridos N1</p>
                <p className="text-xs text-slate-400 mt-1">
                  {Math.round((localData.generalInfo?.userQuantity || 100) * (localData.dimensioning?.incidentsPerUser || 1.5) * (localData.dimensioning?.n1Distribution || 80) / 100)} chamados/mês
                  {localData.dimensioning?.n1SixHourShift && ' (6h/dia)'}
                </p>
              </CardContent>
            </Card>

            <Card className={styles.resultCard}>
              <CardContent className="p-4 text-center">
                <div className={styles.resultNumber}>
                  {(() => {
                    const erlangResult = calculateErlangDimensioning(
                      localData.generalInfo?.userQuantity || 100,
                      localData.dimensioning?.incidentsPerUser || 1.5,
                      localData.dimensioning?.tmaMinutes || 10,
                      localData.dimensioning?.occupancyRate || 80,
                      localData.dimensioning?.n1Distribution || 80,
                      localData.dimensioning?.n1SixHourShift || false
                    );
                    return erlangResult.n2Agents;
                  })()}
                </div>
                <p className={styles.resultLabel}>Atendentes Sugeridos N2</p>
                <p className="text-xs text-slate-400 mt-1">
                  {Math.round((localData.generalInfo?.userQuantity || 100) * (localData.dimensioning?.incidentsPerUser || 1.5) * (100 - (localData.dimensioning?.n1Distribution || 80)) / 100)} chamados/mês
                </p>
              </CardContent>
            </Card>

            <div className="flex flex-col items-center justify-center space-y-3">
              <Button 
                className={styles.applyButton}
                onClick={() => {
                  // Aplicar dimensionamento automático usando Erlang C
                  const erlangResult = calculateErlangDimensioning(
                    localData.generalInfo?.userQuantity || 100,
                    localData.dimensioning?.incidentsPerUser || 1.5,
                    localData.dimensioning?.tmaMinutes || 10,
                    localData.dimensioning?.occupancyRate || 80,
                    localData.dimensioning?.n1Distribution || 80,
                    localData.dimensioning?.n1SixHourShift || false
                  );
                  
                  // Criar escalas automáticas
                  const automaticSchedules = createAutomaticSchedules(
                    erlangResult.n1Agents,
                    erlangResult.n2Agents,
                    localData.dimensioning?.coverageType || CoverageType.BUSINESS_HOURS,
                    localData.dimensioning?.n1SixHourShift || false
                  );
                  
                  // Atualizar dados
                  const updatedData: ProjectData = {
                    ...localData,
                    generalInfo: {
                      userQuantity: localData.generalInfo?.userQuantity || 100,
                      monthlyCalls: erlangResult.totalCallsPerMonth
                    },
                    dimensioning: {
                      incidentsPerUser: localData.dimensioning?.incidentsPerUser || 1.5,
                      tmaMinutes: localData.dimensioning?.tmaMinutes || 10,
                      occupancyRate: localData.dimensioning?.occupancyRate || 80,
                      n1Distribution: localData.dimensioning?.n1Distribution || 80,
                      n1Capacity: localData.dimensioning?.n1Capacity || 100,
                      n2Capacity: localData.dimensioning?.n2Capacity || 75,
                      n1SixHourShift: localData.dimensioning?.n1SixHourShift || false,
                      coverageType: localData.dimensioning?.coverageType || CoverageType.BUSINESS_HOURS,
                      suggestedN1: erlangResult.n1Agents,
                      suggestedN2: erlangResult.n2Agents
                    }
                  };
                  
                  // Aplicar todas as mudanças
                  onUpdate(updatedData);
                  
                  // Mostrar feedback visual
                  console.log('Dimensionamento e escalas aplicados:', {
                    totalCalls: erlangResult.totalCallsPerMonth,
                    n1Agents: erlangResult.n1Agents,
                    n2Agents: erlangResult.n2Agents,
                    workload: erlangResult.workloadErlang,
                    coverageType: localData.dimensioning?.coverageType,
                    schedulesCreated: automaticSchedules.length,
                    n1SixHour: localData.dimensioning?.n1SixHourShift
                  });
                  
                  // Notificar sobre a criação das escalas
                  alert(`Dimensionamento aplicado com sucesso!\n\n` +
                    `• N1: ${erlangResult.n1Agents} agentes${localData.dimensioning?.n1SixHourShift ? ' (6h)' : ' (8h)'}\n` +
                    `• N2: ${erlangResult.n2Agents} agentes (8h)\n` +
                    `• Cobertura: ${localData.dimensioning?.coverageType === CoverageType.BUSINESS_HOURS ? '8x5' : 
                                   localData.dimensioning?.coverageType === CoverageType.EXTENDED_HOURS ? '12x5' : '24x7'}\n` +
                    `• Escalas criadas automaticamente na aba "Escala"`);
                }}
                disabled={isLoading}
              >
                Dimensionar Equipe
              </Button>
              
              {/* Informações do Cálculo */}
              <div className="text-center">
                <p className="text-xs text-slate-400">
                  Carga de trabalho: {(() => {
                    const erlangResult = calculateErlangDimensioning(
                      localData.generalInfo?.userQuantity || 100,
                      localData.dimensioning?.incidentsPerUser || 1.5,
                      localData.dimensioning?.tmaMinutes || 10,
                      localData.dimensioning?.occupancyRate || 80,
                      localData.dimensioning?.n1Distribution || 80,
                      localData.dimensioning?.n1SixHourShift || false
                    );
                    return erlangResult.workloadErlang;
                  })()} Erlangs
                </p>
                <p className="text-xs text-slate-400">
                  Total: {calculateMonthlyCalls(
                    localData.generalInfo?.userQuantity || 100,
                    localData.dimensioning?.incidentsPerUser || 1.5
                  )} chamados/mês
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client-name">
                Nome do Cliente *
              </Label>
              <Input
                id="client-name"
                value={localData.client.name}
                onChange={(e) => handleFieldChange('client.name', e.target.value)}
                placeholder="Nome da empresa ou pessoa"
                className={cn(getFieldError('client.name') && "border-red-500")}
                disabled={isLoading}
              />
              {getFieldError('client.name') && (
                <p className="text-sm text-red-500">{getFieldError('client.name')?.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-document">
                CNPJ/CPF *
              </Label>
              <Input
                id="client-document"
                value={localData.client.document}
                onChange={(e) => handleFieldChange('client.document', e.target.value)}
                placeholder="00.000.000/0000-00"
                className={cn(getFieldError('client.document') && "border-red-500")}
                disabled={isLoading}
              />
              {getFieldError('client.document') && (
                <p className="text-sm text-red-500">{getFieldError('client.document')?.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client-email">Email</Label>
              <Input
                id="client-email"
                type="email"
                value={localData.client.email}
                onChange={(e) => handleFieldChange('client.email', e.target.value)}
                placeholder="contato@empresa.com"
                className={cn(getFieldError('client.email') && "border-red-500")}
                disabled={isLoading}
              />
              {getFieldError('client.email') && (
                <p className="text-sm text-red-500">{getFieldError('client.email')?.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-phone">Telefone</Label>
              <Input
                id="client-phone"
                value={localData.client.phone}
                onChange={(e) => handleFieldChange('client.phone', e.target.value)}
                placeholder="(11) 99999-9999"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-person">Pessoa de Contato</Label>
            <Input
              id="contact-person"
              value={localData.client.contactPerson}
              onChange={(e) => handleFieldChange('client.contactPerson', e.target.value)}
              placeholder="Nome do responsável"
              disabled={isLoading}
            />
          </div>

          <Separator />

          {/* Client Address */}
          <div className="space-y-4">
            <h4 className="font-medium">Endereço</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="address-street">Logradouro</Label>
                <Input
                  id="address-street"
                  value={localData.client.address.street}
                  onChange={(e) => handleFieldChange('client.address.street', e.target.value)}
                  placeholder="Rua, Avenida, etc."
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address-number">Número</Label>
                <Input
                  id="address-number"
                  value={localData.client.address.number}
                  onChange={(e) => handleFieldChange('client.address.number', e.target.value)}
                  placeholder="123"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address-complement">Complemento</Label>
                <Input
                  id="address-complement"
                  value={localData.client.address.complement || ''}
                  onChange={(e) => handleFieldChange('client.address.complement', e.target.value)}
                  placeholder="Sala, Andar, etc."
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address-neighborhood">Bairro</Label>
                <Input
                  id="address-neighborhood"
                  value={localData.client.address.neighborhood}
                  onChange={(e) => handleFieldChange('client.address.neighborhood', e.target.value)}
                  placeholder="Nome do bairro"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address-city">Cidade</Label>
                <Input
                  id="address-city"
                  value={localData.client.address.city}
                  onChange={(e) => handleFieldChange('client.address.city', e.target.value)}
                  placeholder="Nome da cidade"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address-state">Estado</Label>
                <Input
                  id="address-state"
                  value={localData.client.address.state}
                  onChange={(e) => handleFieldChange('client.address.state', e.target.value)}
                  placeholder="SP"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address-zipcode">CEP</Label>
                <Input
                  id="address-zipcode"
                  value={localData.client.address.zipCode}
                  onChange={(e) => handleFieldChange('client.address.zipCode', e.target.value)}
                  placeholder="00000-000"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract Period */}
      <Card>
        <CardHeader>
          <CardTitle>Período do Contrato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Data de Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !localData.contractPeriod.startDate && "text-muted-foreground",
                      getFieldError('contractPeriod') && "border-red-500"
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localData.contractPeriod.startDate ? (
                      format(localData.contractPeriod.startDate, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={localData.contractPeriod.startDate}
                    onSelect={(date) => handleDateChange('contractPeriod.startDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Data de Fim</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !localData.contractPeriod.endDate && "text-muted-foreground",
                      getFieldError('contractPeriod') && "border-red-500"
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localData.contractPeriod.endDate ? (
                      format(localData.contractPeriod.endDate, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={localData.contractPeriod.endDate}
                    onSelect={(date) => handleDateChange('contractPeriod.endDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duração (meses)</Label>
              <Input
                id="duration"
                type="number"
                value={localData.contractPeriod.durationMonths}
                onChange={(e) => handleFieldChange('contractPeriod.durationMonths', parseInt(e.target.value) || 0)}
                placeholder="12"
                min="1"
                max="120"
                disabled={isLoading}
              />
            </div>
          </div>

          {getFieldError('contractPeriod') && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {getFieldError('contractPeriod')?.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}