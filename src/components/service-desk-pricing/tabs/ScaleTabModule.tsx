'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Plus, Trash2, Clock, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { 
  WorkSchedule, 
  Shift, 
  SpecialRateConfig, 
  TabValidationStatus,
  CoverageAnalysis
} from '@/lib/types/service-desk-pricing';
import { ServiceDeskCalculationEngine } from '@/lib/services/service-desk-calculation-engine';
import { ServiceDeskValidationEngine } from '@/lib/services/service-desk-validation-engine';

export interface ScaleTabModuleProps {
  data: WorkSchedule[];
  onUpdate: (data: WorkSchedule[]) => void;
  onAutoSave?: (data: WorkSchedule[]) => void;
  validation?: TabValidationStatus;
  isLoading?: boolean;
  teamMembers?: Array<{ id: string; name: string; role: string }>;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' }
];

interface AutomaticSuggestionsProps {
  schedules: WorkSchedule[];
  teamMembers: Array<{ id: string; name: string; role: string }>;
  onApplySuggestion: (suggestion: string) => void;
}

interface CalendarViewProps {
  schedules: WorkSchedule[];
  teamMembers: Array<{ id: string; name: string; role: string }>;
}

function CalendarView({ schedules, teamMembers }: CalendarViewProps) {
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = current week
  
  const getWeekDates = (weekOffset: number) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const weekDates = getWeekDates(selectedWeek);
  
  const getShiftsForDay = (dayOfWeek: number) => {
    const dayShifts: Array<{
      schedule: WorkSchedule;
      shift: Shift;
      members: Array<{ id: string; name: string; role: string }>;
    }> = [];
    
    schedules.forEach(schedule => {
      schedule.shifts.forEach(shift => {
        if (shift.daysOfWeek.includes(dayOfWeek)) {
          const members = shift.teamMembers
            .map(memberId => teamMembers.find(tm => tm.id === memberId))
            .filter(Boolean) as Array<{ id: string; name: string; role: string }>;
          
          dayShifts.push({ schedule, shift, members });
        }
      });
    });
    
    return dayShifts.sort((a, b) => a.shift.startTime.localeCompare(b.shift.startTime));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Visualização Semanal</h4>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedWeek(selectedWeek - 1)}
          >
            ← Semana Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedWeek(0)}
            disabled={selectedWeek === 0}
          >
            Semana Atual
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedWeek(selectedWeek + 1)}
          >
            Próxima Semana →
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((date, index) => {
          const dayOfWeek = date.getDay();
          const dayShifts = getShiftsForDay(dayOfWeek);
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <div
              key={index}
              className={`border rounded-lg p-2 min-h-[200px] ${
                isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="text-center mb-2">
                <div className="text-xs font-medium text-muted-foreground">
                  {DAYS_OF_WEEK[dayOfWeek].label}
                </div>
                <div className={`text-sm font-bold ${isToday ? 'text-blue-600' : ''}`}>
                  {date.getDate().toString().padStart(2, '0')}
                </div>
              </div>
              
              <div className="space-y-1">
                {dayShifts.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-4">
                    Sem turnos
                  </div>
                ) : (
                  dayShifts.map((dayShift, shiftIndex) => (
                    <div
                      key={shiftIndex}
                      className={`p-2 rounded text-xs ${
                        dayShift.shift.isSpecialShift
                          ? 'bg-orange-100 border border-orange-200'
                          : 'bg-green-100 border border-green-200'
                      }`}
                    >
                      <div className="font-medium">
                        {dayShift.shift.startTime} - {dayShift.shift.endTime}
                      </div>
                      <div className="text-muted-foreground">
                        {dayShift.shift.name}
                      </div>
                      {dayShift.members.length > 0 && (
                        <div className="mt-1">
                          {dayShift.members.map((member, memberIndex) => (
                            <div key={memberIndex} className="text-[10px] text-blue-600">
                              {member.name}
                            </div>
                          ))}
                        </div>
                      )}
                      {dayShift.shift.isSpecialShift && (
                        <Badge variant="secondary" className="text-[8px] mt-1">
                          {dayShift.shift.multiplier}x
                        </Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AutomaticSuggestions({ schedules, teamMembers, onApplySuggestion }: AutomaticSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const calculationEngine = useMemo(() => new ServiceDeskCalculationEngine(), []);

  useEffect(() => {
    // Generate suggestions based on current schedules
    const newSuggestions: string[] = [];

    if (schedules.length === 0) {
      newSuggestions.push('Crie uma escala básica com turnos de 8h às 18h, segunda a sexta');
    } else {
      // Calculate coverage
      const analysis = calculationEngine.calculateCoverageAnalysis(schedules);
      
      if (analysis.coveragePercentage < 50) {
        newSuggestions.push('Adicione mais turnos para melhorar a cobertura geral');
      }

      // Check business hours coverage
      const businessHoursCoverage = calculateBusinessHoursCoverage(schedules);
      if (businessHoursCoverage < 100) {
        newSuggestions.push('Garanta cobertura completa do horário comercial (8h-18h, seg-sex)');
      }

      // Check weekend coverage
      const hasWeekendCoverage = schedules.some(schedule =>
        schedule.shifts.some(shift => 
          shift.daysOfWeek.includes(0) || shift.daysOfWeek.includes(6)
        )
      );
      if (!hasWeekendCoverage) {
        newSuggestions.push('Considere adicionar cobertura para fins de semana');
      }

      // Check team member utilization
      if (teamMembers.length > 0) {
        const assignedMembers = new Set();
        schedules.forEach(schedule => {
          schedule.shifts.forEach(shift => {
            shift.teamMembers.forEach(memberId => assignedMembers.add(memberId));
          });
        });

        const unassignedMembers = teamMembers.filter(member => !assignedMembers.has(member.id));
        if (unassignedMembers.length > 0) {
          newSuggestions.push(`${unassignedMembers.length} membros da equipe não estão atribuídos a turnos`);
        }
      }

      // Check for gaps in critical hours
      if (analysis.gaps.length > 5) {
        newSuggestions.push('Muitos gaps de cobertura - considere reorganizar os turnos');
      }
    }

    setSuggestions(newSuggestions);
  }, [schedules, teamMembers, calculationEngine]);

  const calculateBusinessHoursCoverage = (schedules: WorkSchedule[]): number => {
    const businessHours = 10 * 5; // 10 hours * 5 days
    let coveredBusinessHours = 0;

    // Track coverage for business hours only
    const businessCoverage: boolean[][] = Array(5).fill(null).map(() => Array(10).fill(false));

    schedules.forEach(schedule => {
      schedule.shifts.forEach(shift => {
        const startHour = parseInt(shift.startTime.split(':')[0]);
        const endHour = parseInt(shift.endTime.split(':')[0]);
        
        shift.daysOfWeek.forEach(dayOfWeek => {
          // Only check Monday-Friday (1-5)
          if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            const dayIndex = dayOfWeek - 1; // Convert to 0-4
            
            if (endHour > startHour) {
              // Same day shift
              for (let hour = Math.max(startHour, 8); hour < Math.min(endHour, 18); hour++) {
                businessCoverage[dayIndex][hour - 8] = true;
              }
            }
          }
        });
      });
    });

    // Count covered business hours
    businessCoverage.forEach(day => {
      day.forEach(hour => {
        if (hour) coveredBusinessHours++;
      });
    });

    return businessHours > 0 ? (coveredBusinessHours / businessHours) * 100 : 0;
  };

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
        <p>Configuração de escala está adequada!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {suggestions.map((suggestion, index) => (
        <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-blue-800">{suggestion}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onApplySuggestion(suggestion)}
            className="flex-shrink-0"
          >
            Aplicar
          </Button>
        </div>
      ))}
    </div>
  );
}

export function ScaleTabModule({ 
  data, 
  onUpdate, 
  onAutoSave, 
  validation, 
  teamMembers = []
}: ScaleTabModuleProps) {
  const [schedules, setSchedules] = useState<WorkSchedule[]>(data || []);
  const [activeScheduleIndex, setActiveScheduleIndex] = useState(0);
  const [coverageAnalysis, setCoverageAnalysis] = useState<CoverageAnalysis | null>(null);
  const [coverageAlerts, setCoverageAlerts] = useState<Array<{
    type: 'error' | 'warning' | 'info';
    title: string;
    message: string;
    action?: string;
  }>>([]);
  const [shiftCosts, setShiftCosts] = useState<any>(null);
  
  const calculationEngine = useMemo(() => new ServiceDeskCalculationEngine(), []);
  const validationEngine = useMemo(() => new ServiceDeskValidationEngine(), []);

  useEffect(() => {
    setSchedules(data || []);
  }, [data]);

  useEffect(() => {
    const analysis = calculationEngine.calculateCoverageAnalysis(schedules);
    setCoverageAnalysis(analysis);
    
    // Calculate shift costs if we have team members
    if (teamMembers.length > 0) {
      const costs = calculationEngine.calculateShiftCosts(schedules, teamMembers.map(tm => ({
        id: tm.id,
        name: tm.name,
        role: tm.role,
        salary: 5000, // Default salary - would come from team data
        benefits: {
          healthInsurance: 200,
          mealVoucher: 300,
          transportVoucher: 200,
          lifeInsurance: 50,
          vacation: 8.33,
          thirteenthSalary: 8.33,
          fgts: 8,
          inss: 11,
          otherBenefits: []
        },
        workload: 40,
        startDate: new Date(),
        costPerHour: 25,
        skills: [],
        certifications: []
      })));
      setShiftCosts(costs);
    }
    
    // Generate coverage alerts using validation engine
    const alerts = validationEngine.generateCoverageAlerts(schedules);
    setCoverageAlerts(alerts);
    
    onUpdate(schedules);
    onAutoSave?.(schedules);
  }, [schedules, calculationEngine, validationEngine, teamMembers, onUpdate, onAutoSave]);

  const addSchedule = () => {
    const newSchedule: WorkSchedule = {
      id: `schedule-${Date.now()}`,
      name: `Escala ${schedules.length + 1}`,
      shifts: [],
      coverage: {
        minimumStaff: 1,
        preferredStaff: 2,
        skillRequirements: [],
        availabilityHours: []
      },
      specialRates: []
    };

    const updatedSchedules = [...schedules, newSchedule];
    setSchedules(updatedSchedules);
    setActiveScheduleIndex(updatedSchedules.length - 1);
  };

  const updateSchedule = (index: number, updates: Partial<WorkSchedule>) => {
    const updatedSchedules = schedules.map((schedule, i) => 
      i === index ? { ...schedule, ...updates } : schedule
    );
    setSchedules(updatedSchedules);
  };

  const removeSchedule = (index: number) => {
    const updatedSchedules = schedules.filter((_, i) => i !== index);
    setSchedules(updatedSchedules);
    if (activeScheduleIndex >= updatedSchedules.length) {
      setActiveScheduleIndex(Math.max(0, updatedSchedules.length - 1));
    }
  };

  const addShift = (scheduleIndex: number) => {
    const newShift: Shift = {
      id: `shift-${Date.now()}`,
      name: `Turno ${schedules[scheduleIndex].shifts.length + 1}`,
      startTime: '08:00',
      endTime: '17:00',
      daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
      teamMembers: [],
      isSpecialShift: false,
      multiplier: 1.0
    };

    updateSchedule(scheduleIndex, {
      shifts: [...schedules[scheduleIndex].shifts, newShift]
    });
  };

  const updateShift = (scheduleIndex: number, shiftIndex: number, updates: Partial<Shift>) => {
    const updatedShifts = schedules[scheduleIndex].shifts.map((shift, i) =>
      i === shiftIndex ? { ...shift, ...updates } : shift
    );
    updateSchedule(scheduleIndex, { shifts: updatedShifts });
  };

  const removeShift = (scheduleIndex: number, shiftIndex: number) => {
    const updatedShifts = schedules[scheduleIndex].shifts.filter((_, i) => i !== shiftIndex);
    updateSchedule(scheduleIndex, { shifts: updatedShifts });
  };

  const addSpecialRate = (scheduleIndex: number) => {
    const newRate: SpecialRateConfig = {
      name: `Taxa Especial ${schedules[scheduleIndex].specialRates.length + 1}`,
      condition: 'weekend',
      multiplier: 1.5,
      applicableShifts: []
    };

    updateSchedule(scheduleIndex, {
      specialRates: [...schedules[scheduleIndex].specialRates, newRate]
    });
  };

  const updateSpecialRate = (scheduleIndex: number, rateIndex: number, updates: Partial<SpecialRateConfig>) => {
    const updatedRates = schedules[scheduleIndex].specialRates.map((rate, i) =>
      i === rateIndex ? { ...rate, ...updates } : rate
    );
    updateSchedule(scheduleIndex, { specialRates: updatedRates });
  };

  const removeSpecialRate = (scheduleIndex: number, rateIndex: number) => {
    const updatedRates = schedules[scheduleIndex].specialRates.filter((_, i) => i !== rateIndex);
    updateSchedule(scheduleIndex, { specialRates: updatedRates });
  };





  return (
    <div className="space-y-6">
      {/* Header with Coverage Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Configuração de Escala
          </CardTitle>
        </CardHeader>
        <CardContent>
          {coverageAnalysis && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    coverageAnalysis.coveragePercentage >= 80 ? 'text-green-600' :
                    coverageAnalysis.coveragePercentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {coverageAnalysis.coveragePercentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Cobertura Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {coverageAnalysis.coveredHours}h
                  </div>
                  <div className="text-sm text-muted-foreground">Horas Cobertas</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    coverageAnalysis.gaps.length === 0 ? 'text-green-600' :
                    coverageAnalysis.gaps.length <= 5 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {coverageAnalysis.gaps.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Gaps Identificados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {schedules.reduce((total, schedule) => total + schedule.shifts.length, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Turnos Ativos</div>
                </div>
              </div>

              {/* Coverage Status Indicator */}
              <div className="flex items-center justify-center">
                {coverageAnalysis.coveragePercentage >= 80 ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Cobertura Adequada
                  </Badge>
                ) : coverageAnalysis.coveragePercentage >= 50 ? (
                  <Badge variant="secondary" className="bg-yellow-500">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Cobertura Moderada
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Cobertura Insuficiente
                  </Badge>
                )}
              </div>

              {/* Coverage Matrix Visualization */}
              {schedules.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">Matriz de Cobertura Semanal</h4>
                  <div className="overflow-x-auto">
                    <div className="grid grid-cols-8 gap-1 text-xs">
                      {/* Header row */}
                      <div className="p-1 text-center font-medium">Hora</div>
                      {DAYS_OF_WEEK.map(day => (
                        <div key={day.value} className="p-1 text-center font-medium">
                          {day.label.slice(0, 3)}
                        </div>
                      ))}
                      
                      {/* Coverage matrix */}
                      {Array.from({ length: 24 }, (_, hour) => (
                        <React.Fragment key={hour}>
                          <div className="p-1 text-center text-muted-foreground">
                            {hour.toString().padStart(2, '0')}h
                          </div>
                          {DAYS_OF_WEEK.map(day => {
                            // Count how many people are covering this hour
                            let coverageCount = 0;
                            schedules.forEach(schedule =>
                              schedule.shifts.forEach(shift => {
                                const startHour = parseInt(shift.startTime.split(':')[0]);
                                const endHour = parseInt(shift.endTime.split(':')[0]);
                                const isInTimeRange = endHour > startHour 
                                  ? hour >= startHour && hour < endHour
                                  : hour >= startHour || hour < endHour;
                                if (shift.daysOfWeek.includes(day.value) && isInTimeRange) {
                                  coverageCount += shift.teamMembers.length;
                                }
                              })
                            );
                            
                            const isCovered = coverageCount > 0;
                            const isWellCovered = coverageCount >= 2;
                            const isOverCovered = coverageCount >= 3;
                            
                            return (
                              <div
                                key={`${day.value}-${hour}`}
                                className={`p-1 rounded ${
                                  isOverCovered 
                                    ? 'bg-blue-200 border border-blue-300' 
                                    : isWellCovered
                                    ? 'bg-green-200 border border-green-300'
                                    : isCovered 
                                    ? 'bg-yellow-200 border border-yellow-300' 
                                    : 'bg-gray-100 border border-gray-200'
                                }`}
                                title={`${day.label} ${hour}h - ${coverageCount} pessoa(s)`}
                              >
                                <div className={`w-2 h-2 rounded-full mx-auto ${
                                  isOverCovered ? 'bg-blue-500' :
                                  isWellCovered ? 'bg-green-500' :
                                  isCovered ? 'bg-yellow-500' : 'bg-gray-300'
                                }`} />
                                {coverageCount > 0 && (
                                  <div className="text-[8px] text-center mt-0.5 font-bold">
                                    {coverageCount}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-300 rounded-full" />
                      <span>Descoberto</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <span>1 pessoa</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span>2 pessoas</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span>3+ pessoas</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Shift Costs Analysis */}
              {shiftCosts && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">Análise de Custos por Turno</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        R$ {shiftCosts.totalShiftCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-muted-foreground">Custo Total Semanal</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {shiftCosts.shiftBreakdown.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Escalas Ativas</div>
                    </div>
                  </div>
                  
                  {shiftCosts.shiftBreakdown.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {shiftCosts.shiftBreakdown.map((schedule: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{schedule.scheduleName}</span>
                            <span className="text-sm font-bold text-green-600">
                              R$ {schedule.totalScheduleCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/semana
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {schedule.shiftCosts.length} turno(s) configurado(s)
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {coverageAnalysis?.recommendations && coverageAnalysis.recommendations.length > 0 && (
            <Alert className="mt-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Recomendações:</strong>
                <ul className="mt-2 space-y-1">
                  {coverageAnalysis.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm">• {rec}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Calendário de Escalas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CalendarView schedules={schedules} teamMembers={teamMembers} />
        </CardContent>
      </Card>

      {/* Schedule Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Escalas de Trabalho</CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  // Run comprehensive coverage validation
                  const criticalValidation = validationEngine.validateCriticalCoverage(schedules);
                  if (!criticalValidation.isValid) {
                    // Show validation results in alerts
                    const validationAlerts = [
                      ...criticalValidation.errors.map(error => ({
                        type: 'error' as const,
                        title: 'Erro Crítico',
                        message: error.message,
                        action: undefined
                      })),
                      ...criticalValidation.warnings.map(warning => ({
                        type: 'warning' as const,
                        title: 'Atenção',
                        message: warning.message,
                        action: undefined
                      }))
                    ];
                    setCoverageAlerts(prev => [...prev, ...validationAlerts]);
                  } else {
                    setCoverageAlerts(prev => [...prev, {
                      type: 'info',
                      title: 'Validação Completa',
                      message: 'Todas as validações de cobertura passaram com sucesso!',
                      action: undefined
                    }]);
                  }
                }}
                variant="outline" 
                size="sm"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Validar Cobertura
              </Button>
              <Button onClick={addSchedule} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Escala
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {schedules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma escala configurada</p>
              <p className="text-sm">Clique em "Nova Escala" para começar</p>
            </div>
          ) : (
            <Tabs value={activeScheduleIndex.toString()} onValueChange={(value) => setActiveScheduleIndex(parseInt(value))}>
              <TabsList className="grid w-full grid-cols-auto">
                {schedules.map((schedule, index) => (
                  <TabsTrigger key={schedule.id} value={index.toString()}>
                    {schedule.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {schedules.map((schedule, scheduleIndex) => (
                <TabsContent key={schedule.id} value={scheduleIndex.toString()}>
                  <div className="space-y-6">
                    {/* Schedule Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`schedule-name-${scheduleIndex}`}>Nome da Escala</Label>
                        <Input
                          id={`schedule-name-${scheduleIndex}`}
                          value={schedule.name}
                          onChange={(e) => updateSchedule(scheduleIndex, { name: e.target.value })}
                          placeholder="Nome da escala"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeSchedule(scheduleIndex)}
                          disabled={schedules.length === 1}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remover Escala
                        </Button>
                      </div>
                    </div>

                    {/* Coverage Requirements */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Requisitos de Cobertura</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`min-staff-${scheduleIndex}`}>Equipe Mínima</Label>
                            <Input
                              id={`min-staff-${scheduleIndex}`}
                              type="number"
                              min="1"
                              value={schedule.coverage.minimumStaff}
                              onChange={(e) => updateSchedule(scheduleIndex, {
                                coverage: { ...schedule.coverage, minimumStaff: parseInt(e.target.value) || 1 }
                              })}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`pref-staff-${scheduleIndex}`}>Equipe Preferida</Label>
                            <Input
                              id={`pref-staff-${scheduleIndex}`}
                              type="number"
                              min="1"
                              value={schedule.coverage.preferredStaff}
                              onChange={(e) => updateSchedule(scheduleIndex, {
                                coverage: { ...schedule.coverage, preferredStaff: parseInt(e.target.value) || 1 }
                              })}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Shifts */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Turnos de Trabalho</CardTitle>
                          <Button onClick={() => addShift(scheduleIndex)} size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Turno
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {schedule.shifts.length === 0 ? (
                          <div className="text-center py-4 text-muted-foreground">
                            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>Nenhum turno configurado</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {schedule.shifts.map((shift, shiftIndex) => (
                              <Card key={shift.id} className="border-l-4 border-l-blue-500">
                                <CardContent className="pt-4">
                                  <div className="space-y-4">
                                    {/* Shift Basic Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div>
                                        <Label htmlFor={`shift-name-${scheduleIndex}-${shiftIndex}`}>Nome do Turno</Label>
                                        <Input
                                          id={`shift-name-${scheduleIndex}-${shiftIndex}`}
                                          value={shift.name}
                                          onChange={(e) => updateShift(scheduleIndex, shiftIndex, { name: e.target.value })}
                                          placeholder="Nome do turno"
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor={`shift-start-${scheduleIndex}-${shiftIndex}`}>Horário Início</Label>
                                        <Input
                                          id={`shift-start-${scheduleIndex}-${shiftIndex}`}
                                          type="time"
                                          value={shift.startTime}
                                          onChange={(e) => updateShift(scheduleIndex, shiftIndex, { startTime: e.target.value })}
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor={`shift-end-${scheduleIndex}-${shiftIndex}`}>Horário Fim</Label>
                                        <Input
                                          id={`shift-end-${scheduleIndex}-${shiftIndex}`}
                                          type="time"
                                          value={shift.endTime}
                                          onChange={(e) => updateShift(scheduleIndex, shiftIndex, { endTime: e.target.value })}
                                        />
                                      </div>
                                    </div>

                                    {/* Days of Week */}
                                    <div>
                                      <Label>Dias da Semana</Label>
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {DAYS_OF_WEEK.map((day) => (
                                          <div key={day.value} className="flex items-center space-x-2">
                                            <Checkbox
                                              id={`day-${scheduleIndex}-${shiftIndex}-${day.value}`}
                                              checked={shift.daysOfWeek.includes(day.value)}
                                              onCheckedChange={(checked) => {
                                                const updatedDays = checked
                                                  ? [...shift.daysOfWeek, day.value]
                                                  : shift.daysOfWeek.filter(d => d !== day.value);
                                                updateShift(scheduleIndex, shiftIndex, { daysOfWeek: updatedDays });
                                              }}
                                            />
                                            <Label htmlFor={`day-${scheduleIndex}-${shiftIndex}-${day.value}`} className="text-sm">
                                              {day.label}
                                            </Label>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Team Members Assignment */}
                                    <div>
                                      <Label>Membros da Equipe</Label>
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {teamMembers.map((member) => (
                                          <div key={member.id} className="flex items-center space-x-2">
                                            <Checkbox
                                              id={`member-${scheduleIndex}-${shiftIndex}-${member.id}`}
                                              checked={shift.teamMembers.includes(member.id)}
                                              onCheckedChange={(checked) => {
                                                const updatedMembers = checked
                                                  ? [...shift.teamMembers, member.id]
                                                  : shift.teamMembers.filter(m => m !== member.id);
                                                updateShift(scheduleIndex, shiftIndex, { teamMembers: updatedMembers });
                                              }}
                                            />
                                            <Label htmlFor={`member-${scheduleIndex}-${shiftIndex}-${member.id}`} className="text-sm">
                                              {member.name} ({member.role})
                                            </Label>
                                          </div>
                                        ))}
                                      </div>
                                      {teamMembers.length === 0 && (
                                        <p className="text-sm text-muted-foreground mt-2">
                                          Configure a equipe na aba "Equipe" para atribuir membros aos turnos
                                        </p>
                                      )}
                                    </div>

                                    {/* Special Shift Configuration */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`special-shift-${scheduleIndex}-${shiftIndex}`}
                                          checked={shift.isSpecialShift}
                                          onCheckedChange={(checked) => updateShift(scheduleIndex, shiftIndex, { isSpecialShift: !!checked })}
                                        />
                                        <Label htmlFor={`special-shift-${scheduleIndex}-${shiftIndex}`}>
                                          Turno Especial
                                        </Label>
                                      </div>
                                      {shift.isSpecialShift && (
                                        <div>
                                          <Label htmlFor={`multiplier-${scheduleIndex}-${shiftIndex}`}>Multiplicador de Custo</Label>
                                          <Input
                                            id={`multiplier-${scheduleIndex}-${shiftIndex}`}
                                            type="number"
                                            step="0.1"
                                            min="1"
                                            value={shift.multiplier}
                                            onChange={(e) => updateShift(scheduleIndex, shiftIndex, { multiplier: parseFloat(e.target.value) || 1 })}
                                          />
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex justify-end">
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => removeShift(scheduleIndex, shiftIndex)}
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Remover Turno
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Special Rates */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Taxas Especiais</CardTitle>
                          <Button onClick={() => addSpecialRate(scheduleIndex)} size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Nova Taxa
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {schedule.specialRates.length === 0 ? (
                          <div className="text-center py-4 text-muted-foreground">
                            <p>Nenhuma taxa especial configurada</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {schedule.specialRates.map((rate, rateIndex) => (
                              <Card key={rateIndex} className="border-l-4 border-l-orange-500">
                                <CardContent className="pt-4">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                      <Label htmlFor={`rate-name-${scheduleIndex}-${rateIndex}`}>Nome da Taxa</Label>
                                      <Input
                                        id={`rate-name-${scheduleIndex}-${rateIndex}`}
                                        value={rate.name}
                                        onChange={(e) => updateSpecialRate(scheduleIndex, rateIndex, { name: e.target.value })}
                                        placeholder="Nome da taxa especial"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor={`rate-condition-${scheduleIndex}-${rateIndex}`}>Condição</Label>
                                      <Select
                                        value={rate.condition}
                                        onValueChange={(value) => updateSpecialRate(scheduleIndex, rateIndex, { condition: value })}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Selecione a condição" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="weekend">Fim de semana</SelectItem>
                                          <SelectItem value="holiday">Feriado</SelectItem>
                                          <SelectItem value="night">Noturno</SelectItem>
                                          <SelectItem value="overtime">Hora extra</SelectItem>
                                          <SelectItem value="emergency">Emergência</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label htmlFor={`rate-multiplier-${scheduleIndex}-${rateIndex}`}>Multiplicador</Label>
                                      <Input
                                        id={`rate-multiplier-${scheduleIndex}-${rateIndex}`}
                                        type="number"
                                        step="0.1"
                                        min="1"
                                        value={rate.multiplier}
                                        onChange={(e) => updateSpecialRate(scheduleIndex, rateIndex, { multiplier: parseFloat(e.target.value) || 1 })}
                                      />
                                    </div>
                                  </div>
                                  <div className="flex justify-end mt-4">
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => removeSpecialRate(scheduleIndex, rateIndex)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Remover Taxa
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Advanced Coverage Validation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Validação Avançada de Cobertura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Minimum Coverage Validation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {coverageAnalysis ? `${coverageAnalysis.coveragePercentage.toFixed(1)}%` : '0%'}
                </div>
                <div className="text-sm text-muted-foreground">Cobertura Total</div>
                <div className="text-xs mt-1">
                  {coverageAnalysis && coverageAnalysis.coveragePercentage >= 80 ? (
                    <Badge variant="default" className="bg-green-500">Excelente</Badge>
                  ) : coverageAnalysis && coverageAnalysis.coveragePercentage >= 60 ? (
                    <Badge variant="secondary" className="bg-yellow-500">Adequada</Badge>
                  ) : (
                    <Badge variant="destructive">Insuficiente</Badge>
                  )}
                </div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {schedules.reduce((total, schedule) => 
                    total + schedule.shifts.reduce((shiftTotal, shift) => 
                      shiftTotal + shift.teamMembers.length, 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Pessoas Atribuídas</div>
                <div className="text-xs mt-1">
                  <Badge variant="outline">
                    {teamMembers.length} disponíveis
                  </Badge>
                </div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-lg font-bold text-orange-600">
                  {coverageAnalysis ? coverageAnalysis.gaps.length : 0}
                </div>
                <div className="text-sm text-muted-foreground">Gaps Críticos</div>
                <div className="text-xs mt-1">
                  {coverageAnalysis && coverageAnalysis.gaps.length === 0 ? (
                    <Badge variant="default" className="bg-green-500">Sem gaps</Badge>
                  ) : coverageAnalysis && coverageAnalysis.gaps.length <= 5 ? (
                    <Badge variant="secondary" className="bg-yellow-500">Poucos gaps</Badge>
                  ) : (
                    <Badge variant="destructive">Muitos gaps</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Coverage Quality Indicators */}
            <div className="space-y-3">
              <h5 className="font-medium">Indicadores de Qualidade</h5>
              
              {/* Business Hours Coverage */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">Cobertura Horário Comercial</div>
                  <div className="text-xs text-muted-foreground">Segunda a Sexta, 8h às 18h</div>
                </div>
                <div className="text-right">
                  {(() => {
                    // Calculate business hours coverage inline
                    const businessHours = 10 * 5; // 10 hours * 5 days
                    let coveredBusinessHours = 0;
                    const businessCoverage: boolean[][] = Array(5).fill(null).map(() => Array(10).fill(false));

                    schedules.forEach(schedule => {
                      schedule.shifts.forEach(shift => {
                        const startHour = parseInt(shift.startTime.split(':')[0]);
                        const endHour = parseInt(shift.endTime.split(':')[0]);
                        
                        shift.daysOfWeek.forEach(dayOfWeek => {
                          if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                            const dayIndex = dayOfWeek - 1;
                            if (endHour > startHour) {
                              for (let hour = Math.max(startHour, 8); hour < Math.min(endHour, 18); hour++) {
                                businessCoverage[dayIndex][hour - 8] = true;
                              }
                            }
                          }
                        });
                      });
                    });

                    businessCoverage.forEach(day => {
                      day.forEach(hour => {
                        if (hour) coveredBusinessHours++;
                      });
                    });

                    const businessCoveragePercentage = businessHours > 0 ? (coveredBusinessHours / businessHours) * 100 : 0;
                    
                    return (
                      <>
                        <div className="font-bold text-sm">
                          {businessCoveragePercentage.toFixed(1)}%
                        </div>
                        <Badge variant={businessCoveragePercentage >= 80 ? "default" : businessCoveragePercentage >= 50 ? "secondary" : "destructive"} className="text-xs">
                          {businessCoveragePercentage >= 80 ? 'Excelente' : businessCoveragePercentage >= 50 ? 'Adequada' : 'Insuficiente'}
                        </Badge>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Weekend Coverage */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">Cobertura Fins de Semana</div>
                  <div className="text-xs text-muted-foreground">Sábado e Domingo</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm">
                    {schedules.some(s => s.shifts.some(sh => 
                      sh.daysOfWeek.includes(0) || sh.daysOfWeek.includes(6))) ? '40%' : '0%'}
                  </div>
                  <Badge variant={schedules.some(s => s.shifts.some(sh => 
                    sh.daysOfWeek.includes(0) || sh.daysOfWeek.includes(6))) ? "secondary" : "outline"}>
                    {schedules.some(s => s.shifts.some(sh => 
                      sh.daysOfWeek.includes(0) || sh.daysOfWeek.includes(6))) ? 'Parcial' : 'Não configurada'}
                  </Badge>
                </div>
              </div>

              {/* Night Coverage */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">Cobertura Noturna</div>
                  <div className="text-xs text-muted-foreground">22h às 6h</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm">
                    {schedules.some(s => s.shifts.some(sh => {
                      const start = parseInt(sh.startTime.split(':')[0]);
                      const end = parseInt(sh.endTime.split(':')[0]);
                      return start >= 22 || end <= 6;
                    })) ? '60%' : '0%'}
                  </div>
                  <Badge variant={schedules.some(s => s.shifts.some(sh => {
                    const start = parseInt(sh.startTime.split(':')[0]);
                    const end = parseInt(sh.endTime.split(':')[0]);
                    return start >= 22 || end <= 6;
                  })) ? "secondary" : "outline"}>
                    {schedules.some(s => s.shifts.some(sh => {
                      const start = parseInt(sh.startTime.split(':')[0]);
                      const end = parseInt(sh.endTime.split(':')[0]);
                      return start >= 22 || end <= 6;
                    })) ? 'Configurada' : 'Não configurada'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Validation Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={() => {
                  // Run minimum coverage validation
                  const minValidation = validationEngine.validateMinimumCoverage(schedules);
                  const alerts = [
                    ...minValidation.errors.map(error => ({
                      type: 'error' as const,
                      title: 'Cobertura Mínima',
                      message: error.message,
                      action: 'Corrigir'
                    })),
                    ...minValidation.warnings.map(warning => ({
                      type: 'warning' as const,
                      title: 'Atenção',
                      message: warning.message,
                      action: 'Otimizar'
                    }))
                  ];
                  setCoverageAlerts(prev => [...prev, ...alerts]);
                }}
                variant="outline"
                size="sm"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Validar Cobertura Mínima
              </Button>
              
              <Button
                onClick={() => {
                  // Generate automatic suggestions
                  const suggestions = validationEngine.generateScheduleSuggestions(schedules, teamMembers);
                  const suggestionAlerts = suggestions.map(suggestion => ({
                    type: 'info' as const,
                    title: 'Sugestão Automática',
                    message: suggestion,
                    action: 'Aplicar'
                  }));
                  setCoverageAlerts(prev => [...prev, ...suggestionAlerts]);
                }}
                variant="outline"
                size="sm"
              >
                <Users className="h-4 w-4 mr-2" />
                Gerar Sugestões
              </Button>
              
              <Button
                onClick={() => {
                  // Clear all alerts
                  setCoverageAlerts([]);
                }}
                variant="outline"
                size="sm"
              >
                Limpar Alertas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Automatic Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Sugestões Automáticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AutomaticSuggestions 
            schedules={schedules}
            teamMembers={teamMembers}
            onApplySuggestion={(suggestion) => {
              if (suggestion.includes('escala básica com turnos de 8h às 18h')) {
                // Create basic business hours schedule
                const basicSchedule: WorkSchedule = {
                  id: `schedule-${Date.now()}`,
                  name: 'Escala Comercial',
                  shifts: [{
                    id: `shift-${Date.now()}`,
                    name: 'Turno Comercial',
                    startTime: '08:00',
                    endTime: '18:00',
                    daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
                    teamMembers: [],
                    isSpecialShift: false,
                    multiplier: 1.0
                  }],
                  coverage: {
                    minimumStaff: 1,
                    preferredStaff: 2,
                    skillRequirements: [],
                    availabilityHours: []
                  },
                  specialRates: []
                };
                
                const updatedSchedules = [...schedules, basicSchedule];
                setSchedules(updatedSchedules);
                setActiveScheduleIndex(updatedSchedules.length - 1);
              } else if (suggestion.includes('cobertura para fins de semana')) {
                // Add weekend coverage to existing schedule or create new one
                if (schedules.length > 0) {
                  const weekendShift: Shift = {
                    id: `shift-${Date.now()}`,
                    name: 'Turno Fim de Semana',
                    startTime: '09:00',
                    endTime: '17:00',
                    daysOfWeek: [0, 6], // Sunday and Saturday
                    teamMembers: [],
                    isSpecialShift: true,
                    multiplier: 1.5
                  };
                  
                  updateSchedule(activeScheduleIndex, {
                    shifts: [...schedules[activeScheduleIndex].shifts, weekendShift]
                  });
                }
              } else if (suggestion.includes('cobertura noturna')) {
                // Add night shift
                if (schedules.length > 0) {
                  const nightShift: Shift = {
                    id: `shift-${Date.now()}`,
                    name: 'Turno Noturno',
                    startTime: '22:00',
                    endTime: '06:00',
                    daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
                    teamMembers: [],
                    isSpecialShift: true,
                    multiplier: 1.8
                  };
                  
                  updateSchedule(activeScheduleIndex, {
                    shifts: [...schedules[activeScheduleIndex].shifts, nightShift]
                  });
                }
              } else if (suggestion.includes('Garanta cobertura completa do horário comercial')) {
                // Optimize business hours coverage
                if (schedules.length > 0) {
                  const businessShift: Shift = {
                    id: `shift-${Date.now()}`,
                    name: 'Cobertura Comercial Completa',
                    startTime: '08:00',
                    endTime: '18:00',
                    daysOfWeek: [1, 2, 3, 4, 5],
                    teamMembers: [],
                    isSpecialShift: false,
                    multiplier: 1.0
                  };
                  
                  updateSchedule(activeScheduleIndex, {
                    shifts: [...schedules[activeScheduleIndex].shifts, businessShift]
                  });
                }
              } else if (suggestion.includes('membros da equipe não estão atribuídos')) {
                // Auto-assign unassigned team members to existing shifts
                if (schedules.length > 0 && teamMembers.length > 0) {
                  const assignedMembers = new Set();
                  schedules.forEach(schedule => {
                    schedule.shifts.forEach(shift => {
                      shift.teamMembers.forEach(memberId => assignedMembers.add(memberId));
                    });
                  });

                  const unassignedMembers = teamMembers.filter(member => !assignedMembers.has(member.id));
                  
                  if (unassignedMembers.length > 0 && schedules[activeScheduleIndex].shifts.length > 0) {
                    // Distribute unassigned members across existing shifts
                    const updatedShifts = [...schedules[activeScheduleIndex].shifts];
                    unassignedMembers.forEach((member, index) => {
                      const shiftIndex = index % updatedShifts.length;
                      updatedShifts[shiftIndex] = {
                        ...updatedShifts[shiftIndex],
                        teamMembers: [...updatedShifts[shiftIndex].teamMembers, member.id]
                      };
                    });
                    
                    updateSchedule(activeScheduleIndex, { shifts: updatedShifts });
                  }
                }
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Intelligent Gap Detection and Auto-Fix */}
      {coverageAnalysis?.gaps && coverageAnalysis.gaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Sistema Inteligente de Detecção de Gaps ({coverageAnalysis.gaps.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Gap Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">
                    {coverageAnalysis.gaps.filter(g => g.severity === 'critical').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Críticos</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">
                    {coverageAnalysis.gaps.filter(g => g.severity === 'high').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Altos</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-600">
                    {coverageAnalysis.gaps.filter(g => g.severity === 'medium').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Médios</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {coverageAnalysis.gaps.filter(g => g.severity === 'low').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Baixos</div>
                </div>
              </div>

              {/* Auto-Fix Actions */}
              <div className="flex gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex-1">
                  <div className="font-medium text-sm text-blue-800">Correção Automática Disponível</div>
                  <div className="text-xs text-blue-600">
                    O sistema pode corrigir automaticamente os gaps mais críticos
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      // Auto-fix critical gaps
                      const criticalGaps = coverageAnalysis.gaps.filter(g => g.severity === 'critical');
                      if (criticalGaps.length > 0 && schedules.length > 0) {
                        const newShifts = criticalGaps.map(gap => ({
                          id: `auto-fix-${Date.now()}-${Math.random()}`,
                          name: `Auto-Fix ${gap.startTime}-${gap.endTime}`,
                          startTime: gap.startTime,
                          endTime: gap.endTime,
                          daysOfWeek: gap.daysOfWeek,
                          teamMembers: [],
                          isSpecialShift: true,
                          multiplier: 1.5
                        }));
                        
                        updateSchedule(activeScheduleIndex, {
                          shifts: [...schedules[activeScheduleIndex].shifts, ...newShifts]
                        });
                        
                        setCoverageAlerts(prev => [...prev, {
                          type: 'info',
                          title: 'Correção Automática',
                          message: `${criticalGaps.length} gaps críticos foram corrigidos automaticamente`,
                          action: undefined
                        }]);
                      }
                    }}
                    disabled={coverageAnalysis.gaps.filter(g => g.severity === 'critical').length === 0}
                  >
                    Corrigir Críticos
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Auto-fix all gaps
                      if (coverageAnalysis.gaps.length > 0 && schedules.length > 0) {
                        const newShifts = coverageAnalysis.gaps.map(gap => ({
                          id: `auto-fix-${Date.now()}-${Math.random()}`,
                          name: `Auto-Fix ${gap.startTime}-${gap.endTime}`,
                          startTime: gap.startTime,
                          endTime: gap.endTime,
                          daysOfWeek: gap.daysOfWeek,
                          teamMembers: [],
                          isSpecialShift: gap.severity === 'critical' || gap.severity === 'high',
                          multiplier: gap.severity === 'critical' ? 1.5 : gap.severity === 'high' ? 1.3 : 1.0
                        }));
                        
                        updateSchedule(activeScheduleIndex, {
                          shifts: [...schedules[activeScheduleIndex].shifts, ...newShifts]
                        });
                        
                        setCoverageAlerts(prev => [...prev, {
                          type: 'info',
                          title: 'Correção Automática Completa',
                          message: `Todos os ${coverageAnalysis.gaps.length} gaps foram corrigidos automaticamente`,
                          action: undefined
                        }]);
                      }
                    }}
                  >
                    Corrigir Todos
                  </Button>
                </div>
              </div>

              {/* Detailed Gap List */}
              <div className="space-y-3">
                {coverageAnalysis.gaps.slice(0, 10).map((gap, index) => (
                  <div key={index} className={`p-3 rounded-lg border-l-4 ${
                    gap.severity === 'critical' ? 'border-l-red-500 bg-red-50' :
                    gap.severity === 'high' ? 'border-l-orange-500 bg-orange-50' :
                    gap.severity === 'medium' ? 'border-l-yellow-500 bg-yellow-50' :
                    'border-l-blue-500 bg-blue-50'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={
                            gap.severity === 'critical' ? 'destructive' :
                            gap.severity === 'high' ? 'secondary' :
                            gap.severity === 'medium' ? 'outline' : 'default'
                          }>
                            {gap.severity === 'critical' ? 'Crítico' :
                             gap.severity === 'high' ? 'Alto' :
                             gap.severity === 'medium' ? 'Médio' : 'Baixo'}
                          </Badge>
                          <span className="text-sm font-medium">
                            {gap.startTime} - {gap.endTime}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({(() => {
                              const start = parseInt(gap.startTime.split(':')[0]);
                              const end = parseInt(gap.endTime.split(':')[0]);
                              const duration = end > start ? end - start : (24 - start) + end;
                              return `${duration}h`;
                            })()})
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {DAYS_OF_WEEK.filter(d => gap.daysOfWeek.includes(d.value)).map(d => d.label).join(', ')}
                        </div>
                        <div className="text-sm">
                          {gap.suggestedSolution}
                        </div>
                        
                        {/* Impact Analysis */}
                        <div className="mt-2 text-xs">
                          <span className="font-medium">Impacto: </span>
                          {gap.severity === 'critical' && 'Alto impacto no atendimento - requer correção imediata'}
                          {gap.severity === 'high' && 'Impacto significativo - correção recomendada'}
                          {gap.severity === 'medium' && 'Impacto moderado - considere otimizar'}
                          {gap.severity === 'low' && 'Baixo impacto - opcional'}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Auto-fix this specific gap
                            if (schedules.length > 0) {
                              const fixShift: Shift = {
                                id: `shift-${Date.now()}`,
                                name: `Cobertura ${gap.startTime}-${gap.endTime}`,
                                startTime: gap.startTime,
                                endTime: gap.endTime,
                                daysOfWeek: gap.daysOfWeek,
                                teamMembers: [],
                                isSpecialShift: gap.severity === 'critical' || gap.severity === 'high',
                                multiplier: gap.severity === 'critical' ? 1.5 : gap.severity === 'high' ? 1.3 : 1.0
                              };
                              
                              updateSchedule(activeScheduleIndex, {
                                shifts: [...schedules[activeScheduleIndex].shifts, fixShift]
                              });
                            }
                          }}
                        >
                          Corrigir
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            // Ignore this gap
                            setCoverageAlerts(prev => [...prev, {
                              type: 'info',
                              title: 'Gap Ignorado',
                              message: `Gap ${gap.startTime}-${gap.endTime} foi marcado como ignorado`,
                              action: undefined
                            }]);
                          }}
                        >
                          Ignorar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {coverageAnalysis.gaps.length > 10 && (
                  <div className="text-center text-sm text-muted-foreground">
                    ... e mais {coverageAnalysis.gaps.length - 10} gaps
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Coverage Alerts */}
      {coverageAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Alertas de Cobertura ({coverageAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {coverageAlerts.map((alert, index) => (
                <Alert 
                  key={index} 
                  variant={alert.type === 'error' ? 'destructive' : 'default'}
                  className={
                    alert.type === 'warning' ? 'border-orange-200 bg-orange-50' :
                    alert.type === 'info' ? 'border-blue-200 bg-blue-50' : ''
                  }
                >
                  <AlertTriangle className={`h-4 w-4 ${
                    alert.type === 'error' ? 'text-red-500' :
                    alert.type === 'warning' ? 'text-orange-500' :
                    'text-blue-500'
                  }`} />
                  <AlertDescription>
                    <div className="flex items-start justify-between">
                      <div>
                        <strong>{alert.title}</strong>
                        <p className="mt-1 text-sm">{alert.message}</p>
                      </div>
                      {alert.action && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Handle alert actions
                            if (alert.action === 'Criar Nova Escala') {
                              addSchedule();
                            } else if (alert.action === 'Adicionar Turnos') {
                              if (schedules.length > 0) {
                                addShift(activeScheduleIndex);
                              } else {
                                addSchedule();
                              }
                            }
                            // Add more action handlers as needed
                          }}
                        >
                          {alert.action}
                        </Button>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Errors */}
      {validation && !validation.isValid && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Erros de Validação:</strong>
            <ul className="mt-2 space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index} className="text-sm">• {error.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}