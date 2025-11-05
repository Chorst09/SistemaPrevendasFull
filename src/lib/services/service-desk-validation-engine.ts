import {
  ServiceDeskData,
  ProjectData,
  TeamMember,
  WorkSchedule,
  TaxConfiguration,
  MarketVariables,
  AdditionalCost,
  ConsolidatedBudget,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  TabValidationStatus
} from '@/lib/types/service-desk-pricing';

export class ServiceDeskValidationEngine {
  
  /**
   * Validates data for a specific tab
   */
  validateTabData(tabId: string, data: any): TabValidationStatus {
    let validation: ValidationResult;
    
    switch (tabId) {
      case 'data':
        validation = this.validateProjectData(data);
        break;
      case 'team':
        validation = this.validateTeamConfiguration(data);
        break;
      case 'scale':
        validation = this.validateScheduleCoverage(data);
        break;
      case 'taxes':
        validation = this.validateTaxConfiguration(data);
        break;
      case 'variables':
        validation = this.validateMarketVariables(data);
        break;
      case 'other-costs':
        validation = this.validateAdditionalCosts(data);
        break;
      case 'budget':
        validation = this.validateBudgetConsistency(data);
        break;
      case 'result':
        validation = this.validateAnalysisData(data);
        break;
      case 'negotiation':
        validation = this.validateNegotiationScenarios(data);
        break;
      case 'final-analysis':
        validation = this.validateFinalAnalysis(data);
        break;
      default:
        validation = { isValid: true, errors: [], warnings: [] };
    }

    return {
      tabId,
      isValid: validation.isValid,
      errors: validation.errors,
      warnings: validation.warnings,
      completionPercentage: this.calculateCompletionPercentage(tabId, data)
    };
  }

  /**
   * Validates project data (Tab 1: Dados)
   */
  validateProjectData(data: ProjectData): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Required fields validation
    if (!data?.name?.trim()) {
      errors.push({
        field: 'name',
        message: 'Nome do projeto é obrigatório',
        code: 'REQUIRED_FIELD'
      });
    }

    if (!data?.client?.name?.trim()) {
      errors.push({
        field: 'client.name',
        message: 'Nome do cliente é obrigatório',
        code: 'REQUIRED_FIELD'
      });
    }

    if (!data?.client?.document?.trim()) {
      errors.push({
        field: 'client.document',
        message: 'CNPJ/CPF do cliente é obrigatório',
        code: 'REQUIRED_FIELD'
      });
    }

    // Email validation
    if (data?.client?.email && !this.isValidEmail(data.client.email)) {
      errors.push({
        field: 'client.email',
        message: 'Email inválido',
        code: 'INVALID_FORMAT'
      });
    }

    // Contract period validation
    if (data?.contractPeriod) {
      const { startDate, endDate } = data.contractPeriod;
      if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
        errors.push({
          field: 'contractPeriod',
          message: 'Data de início deve ser anterior à data de fim',
          code: 'INVALID_DATE_RANGE'
        });
      }
    }

    // Warnings
    if (!data?.description?.trim()) {
      warnings.push({
        field: 'description',
        message: 'Descrição do projeto não informada',
        suggestion: 'Adicione uma descrição para melhor documentação'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates team configuration (Tab 2: Equipe)
   */
  validateTeamConfiguration(team: any[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!team || team.length === 0) {
      errors.push({
        field: 'team',
        message: 'Pelo menos um cargo da equipe deve ser configurado',
        code: 'REQUIRED_FIELD'
      });
    } else {
      team.forEach((member, index) => {
        // Validação para nova estrutura TeamMemberNew
        if (!member.jobPositionId?.trim()) {
          errors.push({
            field: `team[${index}].jobPositionId`,
            message: `Cargo do membro ${index + 1} é obrigatório`,
            code: 'REQUIRED_FIELD'
          });
        }

        if (!member.quantity || member.quantity <= 0) {
          errors.push({
            field: `team[${index}].quantity`,
            message: `Quantidade de pessoas do cargo ${index + 1} deve ser maior que zero`,
            code: 'INVALID_VALUE'
          });
        }

        if (!member.workingHours || (member.workingHours !== 6 && member.workingHours !== 8)) {
          errors.push({
            field: `team[${index}].workingHours`,
            message: `Carga horária do cargo ${index + 1} deve ser 6 ou 8 horas`,
            code: 'INVALID_VALUE'
          });
        }

        // Validação para estrutura antiga (compatibilidade)
        if (member.name !== undefined && !member.name?.trim()) {
          errors.push({
            field: `team[${index}].name`,
            message: `Nome do membro ${index + 1} é obrigatório`,
            code: 'REQUIRED_FIELD'
          });
        }

        if (member.role !== undefined && !member.role?.trim()) {
          errors.push({
            field: `team[${index}].role`,
            message: `Cargo do membro ${index + 1} é obrigatório`,
            code: 'REQUIRED_FIELD'
          });
        }

        if (member.salary !== undefined && member.salary <= 0) {
          errors.push({
            field: `team[${index}].salary`,
            message: `Salário do membro ${index + 1} deve ser maior que zero`,
            code: 'INVALID_VALUE'
          });
        }

        if (member.workload !== undefined && (member.workload <= 0 || member.workload > 60)) {
          warnings.push({
            field: `team[${index}].workload`,
            message: `Carga horária do membro ${index + 1} parece incomum`,
            suggestion: 'Verifique se a carga horária está correta (0-60 horas/semana)'
          });
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates schedule coverage (Tab 3: Escala)
   */
  validateScheduleCoverage(schedules: WorkSchedule[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!schedules || schedules.length === 0) {
      warnings.push({
        field: 'schedules',
        message: 'Nenhuma escala configurada',
        suggestion: 'Configure pelo menos uma escala de trabalho'
      });
    } else {
      schedules.forEach((schedule, index) => {
        if (!schedule.name?.trim()) {
          errors.push({
            field: `schedules[${index}].name`,
            message: `Nome da escala ${index + 1} é obrigatório`,
            code: 'REQUIRED_FIELD'
          });
        }

        if (!schedule.shifts || schedule.shifts.length === 0) {
          errors.push({
            field: `schedules[${index}].shifts`,
            message: `Escala ${index + 1} deve ter pelo menos um turno`,
            code: 'REQUIRED_FIELD'
          });
        } else {
          // Validate individual shifts
          schedule.shifts.forEach((shift, shiftIndex) => {
            if (!shift.name?.trim()) {
              errors.push({
                field: `schedules[${index}].shifts[${shiftIndex}].name`,
                message: `Nome do turno ${shiftIndex + 1} da escala ${index + 1} é obrigatório`,
                code: 'REQUIRED_FIELD'
              });
            }

            if (!shift.startTime || !shift.endTime) {
              errors.push({
                field: `schedules[${index}].shifts[${shiftIndex}].time`,
                message: `Horários do turno ${shiftIndex + 1} da escala ${index + 1} são obrigatórios`,
                code: 'REQUIRED_FIELD'
              });
            }

            if (shift.startTime === shift.endTime) {
              errors.push({
                field: `schedules[${index}].shifts[${shiftIndex}].time`,
                message: `Horário de início e fim do turno ${shiftIndex + 1} não podem ser iguais`,
                code: 'INVALID_TIME_RANGE'
              });
            }

            if (!shift.daysOfWeek || shift.daysOfWeek.length === 0) {
              errors.push({
                field: `schedules[${index}].shifts[${shiftIndex}].daysOfWeek`,
                message: `Turno ${shiftIndex + 1} da escala ${index + 1} deve ter pelo menos um dia da semana`,
                code: 'REQUIRED_FIELD'
              });
            }

            if (shift.isSpecialShift && shift.multiplier <= 1) {
              warnings.push({
                field: `schedules[${index}].shifts[${shiftIndex}].multiplier`,
                message: `Turno especial ${shiftIndex + 1} tem multiplicador baixo`,
                suggestion: 'Turnos especiais geralmente têm multiplicador maior que 1.0'
              });
            }

            if (shift.teamMembers.length === 0) {
              warnings.push({
                field: `schedules[${index}].shifts[${shiftIndex}].teamMembers`,
                message: `Turno ${shiftIndex + 1} não tem membros atribuídos`,
                suggestion: 'Atribua pelo menos um membro da equipe ao turno'
              });
            }
          });
        }

        // Validate coverage requirements
        if (schedule.coverage.minimumStaff <= 0) {
          errors.push({
            field: `schedules[${index}].coverage.minimumStaff`,
            message: `Equipe mínima da escala ${index + 1} deve ser maior que zero`,
            code: 'INVALID_VALUE'
          });
        }

        if (schedule.coverage.preferredStaff < schedule.coverage.minimumStaff) {
          warnings.push({
            field: `schedules[${index}].coverage.preferredStaff`,
            message: `Equipe preferida da escala ${index + 1} é menor que a mínima`,
            suggestion: 'Equipe preferida deve ser maior ou igual à mínima'
          });
        }

        // Validate special rates
        schedule.specialRates?.forEach((rate, rateIndex) => {
          if (!rate.name?.trim()) {
            errors.push({
              field: `schedules[${index}].specialRates[${rateIndex}].name`,
              message: `Nome da taxa especial ${rateIndex + 1} é obrigatório`,
              code: 'REQUIRED_FIELD'
            });
          }

          if (rate.multiplier <= 1) {
            warnings.push({
              field: `schedules[${index}].specialRates[${rateIndex}].multiplier`,
              message: `Taxa especial ${rateIndex + 1} tem multiplicador baixo`,
              suggestion: 'Taxas especiais geralmente têm multiplicador maior que 1.0'
            });
          }
        });
      });

      // Validate overall coverage
      const coverageAnalysis = this.analyzeCoverage(schedules);
      if (coverageAnalysis.coveragePercentage < 40) {
        warnings.push({
          field: 'coverage',
          message: 'Cobertura geral muito baixa',
          suggestion: 'Considere adicionar mais turnos para melhorar a cobertura'
        });
      }

      if (coverageAnalysis.gaps.length > 10) {
        warnings.push({
          field: 'coverage',
          message: 'Muitos gaps de cobertura identificados',
          suggestion: 'Revise os horários dos turnos para reduzir gaps'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Analyze coverage for validation purposes
   */
  private analyzeCoverage(schedules: WorkSchedule[]): { coveragePercentage: number; gaps: any[] } {
    let totalHours = 168; // 24h * 7 days
    let coveredHours = 0;
    const gaps: any[] = [];

    // Track coverage by hour and day
    const coverageMatrix: boolean[][] = Array(7).fill(null).map(() => Array(24).fill(false));

    // Mark covered hours
    schedules.forEach(schedule => {
      schedule.shifts.forEach(shift => {
        const startHour = parseInt(shift.startTime.split(':')[0]);
        const endHour = parseInt(shift.endTime.split(':')[0]);
        
        shift.daysOfWeek.forEach(dayOfWeek => {
          if (endHour > startHour) {
            // Same day shift
            for (let hour = startHour; hour < endHour; hour++) {
              coverageMatrix[dayOfWeek][hour] = true;
            }
          } else {
            // Overnight shift
            for (let hour = startHour; hour < 24; hour++) {
              coverageMatrix[dayOfWeek][hour] = true;
            }
            for (let hour = 0; hour < endHour; hour++) {
              const nextDay = (dayOfWeek + 1) % 7;
              coverageMatrix[nextDay][hour] = true;
            }
          }
        });
      });
    });

    // Count covered hours and identify gaps
    coverageMatrix.forEach((day, dayIndex) => {
      let gapStart = -1;
      day.forEach((covered, hour) => {
        if (covered) coveredHours++;
        
        if (!covered && gapStart === -1) {
          gapStart = hour;
        } else if (covered && gapStart !== -1) {
          gaps.push({ day: dayIndex, start: gapStart, end: hour });
          gapStart = -1;
        }
      });
      
      if (gapStart !== -1) {
        gaps.push({ day: dayIndex, start: gapStart, end: 24 });
      }
    });

    const coveragePercentage = totalHours > 0 ? (coveredHours / totalHours) * 100 : 0;

    return { coveragePercentage, gaps };
  }

  /**
   * Validates minimum coverage requirements
   */
  validateMinimumCoverage(schedules: WorkSchedule[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!schedules || schedules.length === 0) {
      errors.push({
        field: 'coverage',
        message: 'Nenhuma escala configurada para validar cobertura',
        code: 'NO_SCHEDULES'
      });
      return { isValid: false, errors, warnings };
    }

    const analysis = this.analyzeCoverage(schedules);

    // Check minimum coverage thresholds
    if (analysis.coveragePercentage < 20) {
      errors.push({
        field: 'coverage',
        message: 'Cobertura muito baixa - mínimo de 20% necessário',
        code: 'INSUFFICIENT_COVERAGE'
      });
    } else if (analysis.coveragePercentage < 40) {
      warnings.push({
        field: 'coverage',
        message: 'Cobertura baixa - recomendado pelo menos 40%',
        suggestion: 'Adicione mais turnos para melhorar a cobertura'
      });
    }

    // Check business hours coverage (8-18, Mon-Fri)
    const businessHoursCoverage = this.calculateBusinessHoursCoverage(schedules);
    if (businessHoursCoverage < 80) {
      warnings.push({
        field: 'business_hours',
        message: 'Cobertura insuficiente em horário comercial',
        suggestion: 'Garanta cobertura adequada das 8h às 18h, segunda a sexta'
      });
    }

    // Check for critical gaps
    const criticalGaps = analysis.gaps.filter(gap => 
      this.isBusinessHour(gap.start) || this.isBusinessHour(gap.end - 1)
    );
    
    if (criticalGaps.length > 0) {
      warnings.push({
        field: 'critical_gaps',
        message: `${criticalGaps.length} gaps críticos em horário comercial`,
        suggestion: 'Revise os turnos para cobrir horários comerciais'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Calculate business hours coverage (8-18, Mon-Fri)
   */
  private calculateBusinessHoursCoverage(schedules: WorkSchedule[]): number {
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
            } else {
              // Overnight shift - check if it covers morning business hours
              for (let hour = Math.max(0, 8); hour < Math.min(endHour, 18); hour++) {
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
  }

  /**
   * Check if hour is within business hours (8-18)
   */
  private isBusinessHour(hour: number): boolean {
    return hour >= 8 && hour < 18;
  }

  /**
   * Validates critical coverage requirements with detailed analysis
   */
  validateCriticalCoverage(schedules: WorkSchedule[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!schedules || schedules.length === 0) {
      errors.push({
        field: 'schedules',
        message: 'Nenhuma escala configurada',
        code: 'NO_SCHEDULES'
      });
      return { isValid: false, errors, warnings };
    }

    const analysis = this.analyzeCoverage(schedules);

    // Critical business hours validation (8-18, Mon-Fri)
    const businessHoursCoverage = this.calculateBusinessHoursCoverage(schedules);
    if (businessHoursCoverage < 60) {
      errors.push({
        field: 'business_hours_coverage',
        message: `Cobertura de horário comercial insuficiente: ${businessHoursCoverage.toFixed(1)}%`,
        code: 'INSUFFICIENT_BUSINESS_COVERAGE'
      });
    } else if (businessHoursCoverage < 80) {
      warnings.push({
        field: 'business_hours_coverage',
        message: `Cobertura de horário comercial baixa: ${businessHoursCoverage.toFixed(1)}%`,
        suggestion: 'Recomendado pelo menos 80% de cobertura em horário comercial'
      });
    }

    // Check for dangerous coverage gaps (more than 4 hours uncovered)
    const dangerousGaps = analysis.gaps.filter(gap => {
      const gapDuration = this.calculateGapDuration(gap.start, gap.end);
      return gapDuration > 4;
    });

    if (dangerousGaps.length > 0) {
      errors.push({
        field: 'dangerous_gaps',
        message: `${dangerousGaps.length} gaps perigosos de mais de 4 horas detectados`,
        code: 'DANGEROUS_COVERAGE_GAPS'
      });
    }

    // Validate minimum staffing requirements
    const understaffedPeriods = this.findUnderstaffedPeriods(schedules);
    if (understaffedPeriods.length > 0) {
      warnings.push({
        field: 'understaffed_periods',
        message: `${understaffedPeriods.length} períodos com equipe insuficiente`,
        suggestion: 'Verifique se todos os turnos têm equipe mínima adequada'
      });
    }

    // Check for shift conflicts (same person in overlapping shifts)
    const shiftConflicts = this.detectShiftConflicts(schedules);
    if (shiftConflicts.length > 0) {
      errors.push({
        field: 'shift_conflicts',
        message: `${shiftConflicts.length} conflitos de turnos detectados`,
        code: 'SHIFT_CONFLICTS'
      });
    }

    // Validate weekend and holiday coverage
    const weekendCoverage = this.calculateWeekendCoverage(schedules);
    if (weekendCoverage < 20) {
      warnings.push({
        field: 'weekend_coverage',
        message: `Cobertura de fim de semana muito baixa: ${weekendCoverage.toFixed(1)}%`,
        suggestion: 'Considere adicionar cobertura para fins de semana'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Calculate gap duration in hours
   */
  private calculateGapDuration(start: number, end: number): number {
    return end > start ? end - start : (24 - start) + end;
  }

  /**
   * Find periods with insufficient staffing
   */
  private findUnderstaffedPeriods(schedules: WorkSchedule[]): Array<{
    schedule: string;
    period: string;
    required: number;
    actual: number;
  }> {
    const understaffed: Array<{
      schedule: string;
      period: string;
      required: number;
      actual: number;
    }> = [];

    schedules.forEach(schedule => {
      schedule.shifts.forEach(shift => {
        const actualStaff = shift.teamMembers.length;
        const requiredStaff = schedule.coverage.minimumStaff;
        
        if (actualStaff < requiredStaff) {
          understaffed.push({
            schedule: schedule.name,
            period: `${shift.name} (${shift.startTime}-${shift.endTime})`,
            required: requiredStaff,
            actual: actualStaff
          });
        }
      });
    });

    return understaffed;
  }

  /**
   * Detect conflicts where same person is assigned to overlapping shifts
   */
  private detectShiftConflicts(schedules: WorkSchedule[]): Array<{
    member: string;
    conflicts: Array<{ schedule: string; shift: string; time: string }>;
  }> {
    const memberShifts: Record<string, Array<{
      schedule: string;
      shift: string;
      startTime: string;
      endTime: string;
      daysOfWeek: number[];
    }>> = {};

    // Collect all shifts for each member
    schedules.forEach(schedule => {
      schedule.shifts.forEach(shift => {
        shift.teamMembers.forEach(memberId => {
          if (!memberShifts[memberId]) {
            memberShifts[memberId] = [];
          }
          memberShifts[memberId].push({
            schedule: schedule.name,
            shift: shift.name,
            startTime: shift.startTime,
            endTime: shift.endTime,
            daysOfWeek: shift.daysOfWeek
          });
        });
      });
    });

    const conflicts: Array<{
      member: string;
      conflicts: Array<{ schedule: string; shift: string; time: string }>;
    }> = [];

    // Check for conflicts
    Object.entries(memberShifts).forEach(([memberId, shifts]) => {
      const memberConflicts: Array<{ schedule: string; shift: string; time: string }> = [];
      
      for (let i = 0; i < shifts.length; i++) {
        for (let j = i + 1; j < shifts.length; j++) {
          const shift1 = shifts[i];
          const shift2 = shifts[j];
          
          // Check if shifts overlap in time and days
          const hasTimeOverlap = this.shiftsOverlapInTime(shift1, shift2);
          const hasDayOverlap = shift1.daysOfWeek.some(day => shift2.daysOfWeek.includes(day));
          
          if (hasTimeOverlap && hasDayOverlap) {
            memberConflicts.push({
              schedule: shift1.schedule,
              shift: shift1.shift,
              time: `${shift1.startTime}-${shift1.endTime}`
            });
            memberConflicts.push({
              schedule: shift2.schedule,
              shift: shift2.shift,
              time: `${shift2.startTime}-${shift2.endTime}`
            });
          }
        }
      }
      
      if (memberConflicts.length > 0) {
        conflicts.push({
          member: memberId,
          conflicts: memberConflicts
        });
      }
    });

    return conflicts;
  }

  /**
   * Calculate weekend coverage percentage
   */
  private calculateWeekendCoverage(schedules: WorkSchedule[]): number {
    const weekendHours = 48; // 24h * 2 days (Saturday and Sunday)
    let coveredWeekendHours = 0;

    // Track coverage for weekend only
    const weekendCoverage: boolean[][] = Array(2).fill(null).map(() => Array(24).fill(false));

    schedules.forEach(schedule => {
      schedule.shifts.forEach(shift => {
        const startHour = parseInt(shift.startTime.split(':')[0]);
        const endHour = parseInt(shift.endTime.split(':')[0]);
        
        shift.daysOfWeek.forEach(dayOfWeek => {
          // Check Saturday (6) and Sunday (0)
          let dayIndex = -1;
          if (dayOfWeek === 6) dayIndex = 0; // Saturday
          if (dayOfWeek === 0) dayIndex = 1; // Sunday
          
          if (dayIndex >= 0) {
            if (endHour > startHour) {
              // Same day shift
              for (let hour = startHour; hour < endHour; hour++) {
                weekendCoverage[dayIndex][hour] = true;
              }
            } else {
              // Overnight shift
              for (let hour = startHour; hour < 24; hour++) {
                weekendCoverage[dayIndex][hour] = true;
              }
              for (let hour = 0; hour < endHour; hour++) {
                weekendCoverage[dayIndex][hour] = true;
              }
            }
          }
        });
      });
    });

    // Count covered weekend hours
    weekendCoverage.forEach(day => {
      day.forEach(hour => {
        if (hour) coveredWeekendHours++;
      });
    });

    return weekendHours > 0 ? (coveredWeekendHours / weekendHours) * 100 : 0;
  }

  /**
   * Generate coverage alerts based on analysis
   */
  generateCoverageAlerts(schedules: WorkSchedule[]): Array<{
    type: 'error' | 'warning' | 'info';
    title: string;
    message: string;
    action?: string;
  }> {
    const alerts: Array<{
      type: 'error' | 'warning' | 'info';
      title: string;
      message: string;
      action?: string;
    }> = [];

    if (!schedules || schedules.length === 0) {
      alerts.push({
        type: 'error',
        title: 'Nenhuma Escala Configurada',
        message: 'Configure pelo menos uma escala de trabalho para começar',
        action: 'Criar Nova Escala'
      });
      return alerts;
    }

    const analysis = this.analyzeCoverage(schedules);
    const businessHoursCoverage = this.calculateBusinessHoursCoverage(schedules);
    const weekendCoverage = this.calculateWeekendCoverage(schedules);

    // Critical coverage alerts
    if (analysis.coveragePercentage < 30) {
      alerts.push({
        type: 'error',
        title: 'Cobertura Crítica',
        message: `Apenas ${analysis.coveragePercentage.toFixed(1)}% de cobertura total`,
        action: 'Adicionar Turnos'
      });
    } else if (analysis.coveragePercentage < 60) {
      alerts.push({
        type: 'warning',
        title: 'Cobertura Baixa',
        message: `${analysis.coveragePercentage.toFixed(1)}% de cobertura total`,
        action: 'Otimizar Horários'
      });
    }

    // Business hours alerts
    if (businessHoursCoverage < 80) {
      alerts.push({
        type: 'warning',
        title: 'Horário Comercial Insuficiente',
        message: `${businessHoursCoverage.toFixed(1)}% de cobertura em horário comercial`,
        action: 'Melhorar Cobertura 8h-18h'
      });
    }

    // Weekend coverage alerts
    if (weekendCoverage === 0) {
      alerts.push({
        type: 'info',
        title: 'Sem Cobertura de Fim de Semana',
        message: 'Nenhuma cobertura configurada para sábado e domingo',
        action: 'Adicionar Cobertura Weekend'
      });
    }

    // Gap alerts
    const criticalGaps = analysis.gaps.filter(gap => 
      this.calculateGapDuration(gap.start, gap.end) > 4
    );
    
    if (criticalGaps.length > 0) {
      alerts.push({
        type: 'error',
        title: 'Gaps Críticos Detectados',
        message: `${criticalGaps.length} períodos com mais de 4 horas sem cobertura`,
        action: 'Corrigir Gaps'
      });
    }

    // Staffing alerts
    const understaffed = this.findUnderstaffedPeriods(schedules);
    if (understaffed.length > 0) {
      alerts.push({
        type: 'warning',
        title: 'Equipe Insuficiente',
        message: `${understaffed.length} turnos com equipe abaixo do mínimo`,
        action: 'Ajustar Equipe'
      });
    }

    // Conflict alerts
    const conflicts = this.detectShiftConflicts(schedules);
    if (conflicts.length > 0) {
      alerts.push({
        type: 'error',
        title: 'Conflitos de Turno',
        message: `${conflicts.length} membros com turnos sobrepostos`,
        action: 'Resolver Conflitos'
      });
    }

    return alerts;
  }

  /**
   * Generate automatic schedule suggestions
   */
  generateScheduleSuggestions(schedules: WorkSchedule[], teamMembers: any[] = []): string[] {
    const suggestions: string[] = [];
    const analysis = this.analyzeCoverage(schedules);

    if (schedules.length === 0) {
      suggestions.push('Crie uma escala básica com turnos de 8h às 18h, segunda a sexta');
      return suggestions;
    }

    // Suggest basic coverage improvements
    if (analysis.coveragePercentage < 50) {
      suggestions.push('Adicione turnos para cobrir pelo menos 50% da semana');
    }

    // Check for weekend coverage
    const hasWeekendCoverage = schedules.some(schedule =>
      schedule.shifts.some(shift => 
        shift.daysOfWeek.includes(0) || shift.daysOfWeek.includes(6)
      )
    );

    if (!hasWeekendCoverage) {
      suggestions.push('Considere adicionar cobertura para fins de semana');
    }

    // Check for night coverage
    const hasNightCoverage = schedules.some(schedule =>
      schedule.shifts.some(shift => {
        const startHour = parseInt(shift.startTime.split(':')[0]);
        const endHour = parseInt(shift.endTime.split(':')[0]);
        return startHour >= 22 || endHour <= 6;
      })
    );

    if (!hasNightCoverage) {
      suggestions.push('Considere adicionar cobertura noturna (22h-6h)');
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
        suggestions.push(`${unassignedMembers.length} membros da equipe não estão atribuídos a turnos`);
      }
    }

    // Suggest optimal shift patterns
    const businessHoursCoverage = this.calculateBusinessHoursCoverage(schedules);
    if (businessHoursCoverage < 100) {
      suggestions.push('Garanta cobertura completa do horário comercial (8h-18h, seg-sex)');
    }

    // Check for overlapping shifts (potential optimization)
    const hasOverlaps = this.detectShiftOverlaps(schedules);
    if (hasOverlaps.length > 0) {
      suggestions.push(`${hasOverlaps.length} sobreposições de turnos detectadas - considere otimizar`);
    }

    return suggestions;
  }

  /**
   * Detect overlapping shifts that might indicate inefficiency
   */
  private detectShiftOverlaps(schedules: WorkSchedule[]): Array<{ schedule1: string; shift1: string; schedule2: string; shift2: string }> {
    const overlaps: Array<{ schedule1: string; shift1: string; schedule2: string; shift2: string }> = [];
    
    for (let i = 0; i < schedules.length; i++) {
      for (let j = i; j < schedules.length; j++) {
        const schedule1 = schedules[i];
        const schedule2 = schedules[j];
        
        schedule1.shifts.forEach(shift1 => {
          schedule2.shifts.forEach(shift2 => {
            if (schedule1.id === schedule2.id && shift1.id === shift2.id) return;
            
            // Check if shifts overlap in time and days
            const hasTimeOverlap = this.shiftsOverlapInTime(shift1, shift2);
            const hasDayOverlap = shift1.daysOfWeek.some(day => shift2.daysOfWeek.includes(day));
            
            if (hasTimeOverlap && hasDayOverlap) {
              overlaps.push({
                schedule1: schedule1.name,
                shift1: shift1.name,
                schedule2: schedule2.name,
                shift2: shift2.name
              });
            }
          });
        });
      }
    }
    
    return overlaps;
  }

  /**
   * Check if two shifts overlap in time
   */
  private shiftsOverlapInTime(shift1: any, shift2: any): boolean {
    const start1 = parseInt(shift1.startTime.split(':')[0]);
    const end1 = parseInt(shift1.endTime.split(':')[0]);
    const start2 = parseInt(shift2.startTime.split(':')[0]);
    const end2 = parseInt(shift2.endTime.split(':')[0]);
    
    // Handle overnight shifts
    const normalizeTime = (start: number, end: number) => {
      if (end < start) {
        return { start, end: end + 24 };
      }
      return { start, end };
    };
    
    const norm1 = normalizeTime(start1, end1);
    const norm2 = normalizeTime(start2, end2);
    
    return norm1.start < norm2.end && norm2.start < norm1.end;
  }

  /**
   * Validates tax configuration (Tab 4: Impostos)
   */
  validateTaxConfiguration(taxes: TaxConfiguration): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!taxes?.region?.trim()) {
      errors.push({
        field: 'region',
        message: 'Região para cálculo de impostos é obrigatória',
        code: 'REQUIRED_FIELD'
      });
    }

    // Validate tax rates
    const taxRates = ['icms', 'pis', 'cofins', 'iss', 'ir', 'csll'];
    taxRates.forEach(taxType => {
      const rate = taxes?.[taxType as keyof TaxConfiguration] as number;
      if (typeof rate === 'number' && (rate < 0 || rate > 100)) {
        errors.push({
          field: taxType,
          message: `Taxa de ${taxType.toUpperCase()} deve estar entre 0% e 100%`,
          code: 'INVALID_RANGE'
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates market variables (Tab 5: Variáveis)
   */
  validateMarketVariables(variables: MarketVariables): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (variables?.inflation) {
      if (variables.inflation.annualRate < 0 || variables.inflation.annualRate > 50) {
        warnings.push({
          field: 'inflation.annualRate',
          message: 'Taxa de inflação anual parece incomum',
          suggestion: 'Verifique se a taxa está correta (normalmente entre 0% e 15%)'
        });
      }
    }

    if (variables?.salaryAdjustments) {
      if (variables.salaryAdjustments.annualAdjustment < 0) {
        errors.push({
          field: 'salaryAdjustments.annualAdjustment',
          message: 'Reajuste salarial não pode ser negativo',
          code: 'INVALID_VALUE'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates additional costs (Tab 6: Outros Custos)
   */
  validateAdditionalCosts(costs: AdditionalCost[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (costs && costs.length > 0) {
      costs.forEach((cost, index) => {
        if (!cost.name?.trim()) {
          errors.push({
            field: `costs[${index}].name`,
            message: `Nome do custo ${index + 1} é obrigatório`,
            code: 'REQUIRED_FIELD'
          });
        }

        if (cost.value <= 0) {
          errors.push({
            field: `costs[${index}].value`,
            message: `Valor do custo ${index + 1} deve ser maior que zero`,
            code: 'INVALID_VALUE'
          });
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates budget consistency (Tab 7: Orçamento)
   */
  validateBudgetConsistency(budget: ConsolidatedBudget): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (budget?.margin) {
      if (budget.margin.value < 0) {
        errors.push({
          field: 'margin.value',
          message: 'Margem não pode ser negativa',
          code: 'INVALID_VALUE'
        });
      }

      if (budget.margin.value < 5) {
        warnings.push({
          field: 'margin.value',
          message: 'Margem muito baixa',
          suggestion: 'Considere aumentar a margem para garantir rentabilidade'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates analysis data (Tab 8: Resultado)
   */
  validateAnalysisData(analysis: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Basic validation - will be expanded when analysis module is implemented
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates negotiation scenarios (Tab 9: Negociação)
   */
  validateNegotiationScenarios(scenarios: any[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Basic validation - will be expanded when negotiation module is implemented
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates final analysis (Tab 10: Análise Final)
   */
  validateFinalAnalysis(analysis: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Basic validation - will be expanded when final analysis module is implemented
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates if user can transition from one tab to another
   */
  validateTransition(fromTab: string, toTab: string, data: ServiceDeskData): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Define tab dependencies
    const dependencies: Record<string, string[]> = {
      'team': ['data'],
      'scale': ['data', 'team'],
      'budget': ['data', 'team'],
      'result': ['data', 'team', 'budget'],
      'negotiation': ['data', 'team', 'budget', 'result'],
      'final-analysis': ['data', 'team', 'budget', 'result']
    };

    const requiredTabs = dependencies[toTab] || [];
    
    for (const requiredTab of requiredTabs) {
      const tabData = this.getTabDataForValidation(data, requiredTab);
      const validation = this.validateTabData(requiredTab, tabData);
      
      if (!validation.isValid) {
        errors.push({
          field: 'navigation',
          message: `Complete a aba "${this.getTabDisplayName(requiredTab)}" antes de prosseguir`,
          code: 'DEPENDENCY_NOT_MET'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Calculates completion percentage for a tab
   */
  private calculateCompletionPercentage(tabId: string, data: any): number {
    // Basic implementation - will be refined for each tab
    if (!data) return 0;

    switch (tabId) {
      case 'data':
        return this.calculateProjectDataCompletion(data);
      case 'team':
        return this.calculateTeamCompletion(data);
      default:
        return data ? 50 : 0; // Basic completion check
    }
  }

  private calculateProjectDataCompletion(data: ProjectData): number {
    if (!data) return 0;

    const fields = [
      data.name,
      data.client?.name,
      data.client?.document,
      data.client?.email,
      data.description,
      data.contractPeriod?.startDate,
      data.contractPeriod?.endDate
    ];

    const completedFields = fields.filter(field => field && String(field).trim()).length;
    return Math.round((completedFields / fields.length) * 100);
  }

  private calculateTeamCompletion(team: TeamMember[]): number {
    if (!team || team.length === 0) return 0;

    let totalCompletion = 0;
    team.forEach(member => {
      const fields = [member.name, member.role, member.salary, member.workload];
      const completedFields = fields.filter(field => field && String(field).trim()).length;
      totalCompletion += (completedFields / fields.length) * 100;
    });

    return Math.round(totalCompletion / team.length);
  }

  private getTabDataForValidation(data: ServiceDeskData, tabId: string): any {
    switch (tabId) {
      case 'data': return data.project;
      case 'team': return data.team;
      case 'scale': return data.schedules;
      case 'taxes': return data.taxes;
      case 'variables': return data.variables;
      case 'other-costs': return data.otherCosts;
      case 'budget': return data.budget;
      case 'result': return data.analysis;
      case 'negotiation': return data.negotiations;
      case 'final-analysis': return data.finalAnalysis;
      default: return null;
    }
  }

  private getTabDisplayName(tabId: string): string {
    const names: Record<string, string> = {
      'data': 'Dados',
      'team': 'Equipe',
      'scale': 'Escala',
      'taxes': 'Impostos',
      'variables': 'Variáveis',
      'other-costs': 'Outros Custos',
      'budget': 'Orçamento',
      'result': 'Resultado',
      'negotiation': 'Negociação',
      'final-analysis': 'Análise Final'
    };
    return names[tabId] || tabId;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}