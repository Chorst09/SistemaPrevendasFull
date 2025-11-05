import {
  ServiceDeskData,
  TeamMember,
  WorkSchedule,
  TaxConfiguration,
  MarketVariables,
  ConsolidatedBudget,
  TeamCostCalculation,
  TeamMemberCostCalculation,
  TaxCalculationResult,
  TaxBreakdown,
  ROIAnalysis,
  PaybackAnalysis,
  MarginAnalysis,
  CashFlowPeriod,
  MarginTrendPoint,
  ScenarioConfig,
  NegotiationScenario,
  MarginConfiguration,
  AdditionalCost,
  MonthlyBudget,
  TeamCostSummary,
  TaxSummary
} from '../types/service-desk-pricing';
import { ServiceDeskCalculationCache, cached } from '../utils/calculation-cache';

/**
 * Core calculation engine for Service Desk pricing system
 * Handles all financial calculations including team costs, taxes, margins, ROI, and scenario analysis
 * Enhanced with caching for improved performance
 */
export class ServiceDeskCalculationEngine {
  private cache: ServiceDeskCalculationCache;

  constructor() {
    this.cache = ServiceDeskCalculationCache.getInstance();
  }
  
  /**
   * Calculate total team costs including salaries, benefits, and special rates
   */
  calculateTeamCosts(team: TeamMember[], schedules: WorkSchedule[]): TeamCostCalculation {
    // Check cache first
    const cachedResult = this.cache.getTeamCosts({ team, schedules });
    if (cachedResult) {
      return cachedResult;
    }
    const breakdown: TeamMemberCostCalculation[] = [];
    let totalMonthlyCost = 0;
    let totalHours = 0;

    team.forEach(member => {
      const memberCalculation = this.calculateMemberCost(member, schedules);
      breakdown.push(memberCalculation);
      totalMonthlyCost += memberCalculation.totalCost;
      totalHours += member.workload * 4.33; // weeks to month conversion
    });

    const totalAnnualCost = totalMonthlyCost * 12;
    const costPerHour = totalHours > 0 ? totalMonthlyCost / totalHours : 0;

    const result = {
      totalMonthlyCost,
      totalAnnualCost,
      costPerHour,
      breakdown
    };

    // Cache the result
    this.cache.cacheTeamCosts({ team, schedules }, result);
    return result;
  }

  /**
   * Calculate individual team member costs
   */
  private calculateMemberCost(member: TeamMember, schedules: WorkSchedule[]): TeamMemberCostCalculation {
    const baseSalary = member.salary;
    const benefits = this.calculateBenefits(member);
    
    // Calculate special shift multipliers
    const shiftMultiplier = this.calculateShiftMultiplier(member, schedules);
    const adjustedSalary = baseSalary * shiftMultiplier;
    
    const totalCost = adjustedSalary + benefits;
    const hourlyRate = member.workload > 0 ? totalCost / (member.workload * 4.33) : 0;
    const annualCost = totalCost * 12;

    return {
      memberId: member.id,
      baseSalary: adjustedSalary,
      benefits,
      totalCost,
      hourlyRate,
      annualCost
    };
  }

  /**
   * Calculate benefits for a team member
   */
  private calculateBenefits(member: TeamMember): number {
    const benefits = member.benefits;
    let totalBenefits = 0;

    // Fixed benefits
    totalBenefits += benefits.healthInsurance || 0;
    totalBenefits += benefits.mealVoucher || 0;
    totalBenefits += benefits.transportVoucher || 0;
    totalBenefits += benefits.lifeInsurance || 0;

    // Percentage-based benefits
    totalBenefits += member.salary * (benefits.vacation / 100 || 0);
    totalBenefits += member.salary * (benefits.thirteenthSalary / 100 || 0);
    totalBenefits += member.salary * (benefits.fgts / 100 || 0.08); // Default 8%
    totalBenefits += member.salary * (benefits.inss / 100 || 0);

    // Custom benefits
    benefits.otherBenefits?.forEach(benefit => {
      if (benefit.type === 'fixed') {
        totalBenefits += benefit.value;
      } else {
        totalBenefits += member.salary * (benefit.value / 100);
      }
    });

    return totalBenefits;
  }

  /**
   * Calculate shift multiplier based on special rates
   */
  private calculateShiftMultiplier(member: TeamMember, schedules: WorkSchedule[]): number {
    let multiplier = 1;
    
    schedules.forEach(schedule => {
      schedule.shifts.forEach(shift => {
        if (shift.teamMembers.includes(member.id) && shift.isSpecialShift) {
          multiplier = Math.max(multiplier, shift.multiplier);
        }
      });
      
      schedule.specialRates.forEach(rate => {
        // Apply special rates based on conditions
        multiplier = Math.max(multiplier, rate.multiplier);
      });
    });

    return multiplier;
  }

  /**
   * Calculate coverage analysis for work schedules
   */
  calculateCoverageAnalysis(schedules: WorkSchedule[]): import('../types/service-desk-pricing').CoverageAnalysis {
    let totalHours = 168; // 24h * 7 days
    let coveredHours = 0;
    const gaps: import('../types/service-desk-pricing').CoverageGap[] = [];
    const recommendations: string[] = [];

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

    // Count covered hours
    coverageMatrix.forEach(day => {
      day.forEach(hour => {
        if (hour) coveredHours++;
      });
    });

    // Identify gaps
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    coverageMatrix.forEach((day, dayIndex) => {
      let gapStart = -1;
      day.forEach((covered, hour) => {
        if (!covered && gapStart === -1) {
          gapStart = hour;
        } else if (covered && gapStart !== -1) {
          gaps.push({
            startTime: `${gapStart.toString().padStart(2, '0')}:00`,
            endTime: `${hour.toString().padStart(2, '0')}:00`,
            daysOfWeek: [dayIndex],
            severity: this.calculateGapSeverity(gapStart, hour),
            suggestedSolution: `Considere adicionar cobertura para ${dayNames[dayIndex]} das ${gapStart}h às ${hour}h`
          });
          gapStart = -1;
        }
      });
      
      // Handle gap that extends to end of day
      if (gapStart !== -1) {
        gaps.push({
          startTime: `${gapStart.toString().padStart(2, '0')}:00`,
          endTime: '24:00',
          daysOfWeek: [dayIndex],
          severity: this.calculateGapSeverity(gapStart, 24),
          suggestedSolution: `Considere adicionar cobertura para ${dayNames[dayIndex]} das ${gapStart}h às 24h`
        });
      }
    });

    const coveragePercentage = totalHours > 0 ? (coveredHours / totalHours) * 100 : 0;

    // Generate recommendations
    if (schedules.length === 0) {
      recommendations.push('Configure pelo menos uma escala de trabalho');
    } else if (coveragePercentage < 30) {
      recommendations.push('Cobertura muito baixa - adicione mais turnos');
    } else if (coveragePercentage < 60) {
      recommendations.push('Cobertura baixa - considere expandir horários');
    } else if (coveragePercentage < 80) {
      recommendations.push('Cobertura adequada - considere otimizar horários');
    } else {
      recommendations.push('Boa cobertura de horários');
    }

    // Check for weekend coverage
    const weekendCoverage = (coverageMatrix[0].filter(h => h).length + coverageMatrix[6].filter(h => h).length) / 48 * 100;
    if (weekendCoverage < 50) {
      recommendations.push('Considere melhorar a cobertura de fins de semana');
    }

    // Check for night coverage (22:00 - 06:00)
    let nightCoverage = 0;
    coverageMatrix.forEach(day => {
      for (let hour = 22; hour < 24; hour++) {
        if (day[hour]) nightCoverage++;
      }
      for (let hour = 0; hour < 6; hour++) {
        if (day[hour]) nightCoverage++;
      }
    });
    const nightCoveragePercentage = (nightCoverage / (8 * 7)) * 100;
    if (nightCoveragePercentage < 30) {
      recommendations.push('Considere adicionar cobertura noturna');
    }

    return {
      totalHours,
      coveredHours,
      coveragePercentage: Math.min(coveragePercentage, 100),
      gaps,
      recommendations
    };
  }

  /**
   * Calculate gap severity based on time range
   */
  private calculateGapSeverity(startHour: number, endHour: number): 'low' | 'medium' | 'high' | 'critical' {
    const gapDuration = endHour - startHour;
    
    // Business hours (8-18) are critical
    if ((startHour >= 8 && startHour < 18) || (endHour > 8 && endHour <= 18)) {
      return gapDuration > 4 ? 'critical' : 'high';
    }
    
    // Evening hours (18-22) are medium priority
    if ((startHour >= 18 && startHour < 22) || (endHour > 18 && endHour <= 22)) {
      return gapDuration > 2 ? 'medium' : 'low';
    }
    
    // Night hours (22-6) are low priority unless very long
    return gapDuration > 6 ? 'medium' : 'low';
  }

  /**
   * Calculate shift costs including special rates and multipliers
   */
  calculateShiftCosts(schedules: WorkSchedule[], team: TeamMember[]): {
    totalShiftCosts: number;
    shiftBreakdown: Array<{
      scheduleId: string;
      scheduleName: string;
      shiftCosts: Array<{
        shiftId: string;
        shiftName: string;
        memberCosts: Array<{
          memberId: string;
          memberName: string;
          baseCost: number;
          multipliedCost: number;
          multiplier: number;
        }>;
        totalCost: number;
      }>;
      totalScheduleCost: number;
    }>;
  } {
    let totalShiftCosts = 0;
    const shiftBreakdown: any[] = [];

    schedules.forEach(schedule => {
      let totalScheduleCost = 0;
      const shiftCosts: any[] = [];

      schedule.shifts.forEach(shift => {
        let totalShiftCost = 0;
        const memberCosts: any[] = [];

        shift.teamMembers.forEach(memberId => {
          const member = team.find(m => m.id === memberId);
          if (member) {
            const baseCost = member.costPerHour || (member.salary / (member.workload * 4.33));
            let multiplier = 1;

            // Apply shift multiplier
            if (shift.isSpecialShift) {
              multiplier = Math.max(multiplier, shift.multiplier);
            }

            // Apply special rates
            schedule.specialRates.forEach(rate => {
              if (rate.applicableShifts.includes(shift.id) || rate.applicableShifts.length === 0) {
                multiplier = Math.max(multiplier, rate.multiplier);
              }
            });

            const multipliedCost = baseCost * multiplier;
            
            // Calculate hours per week for this shift
            const startHour = parseInt(shift.startTime.split(':')[0]);
            const endHour = parseInt(shift.endTime.split(':')[0]);
            const shiftHours = endHour > startHour ? endHour - startHour : (24 - startHour) + endHour;
            const weeklyHours = shiftHours * shift.daysOfWeek.length;
            const weeklyCost = multipliedCost * weeklyHours;

            memberCosts.push({
              memberId: member.id,
              memberName: member.name,
              baseCost,
              multipliedCost,
              multiplier,
              weeklyCost
            });

            totalShiftCost += weeklyCost;
          }
        });

        shiftCosts.push({
          shiftId: shift.id,
          shiftName: shift.name,
          memberCosts,
          totalCost: totalShiftCost
        });

        totalScheduleCost += totalShiftCost;
      });

      shiftBreakdown.push({
        scheduleId: schedule.id,
        scheduleName: schedule.name,
        shiftCosts,
        totalScheduleCost
      });

      totalShiftCosts += totalScheduleCost;
    });

    return {
      totalShiftCosts,
      shiftBreakdown
    };
  }

  /**
   * Calculate taxes based on configuration and revenue
   */
  calculateTaxes(revenue: number, taxConfig: TaxConfiguration): TaxCalculationResult {
    // Check cache first
    const cachedResult = this.cache.getTaxCalculations({ revenue, taxConfig });
    if (cachedResult) {
      return cachedResult;
    }
    const breakdown: TaxBreakdown[] = [];
    let totalTaxes = 0;

    // Federal taxes
    const pisAmount = revenue * (taxConfig.pis / 100);
    const cofinsAmount = revenue * (taxConfig.cofins / 100);
    const irAmount = revenue * (taxConfig.ir / 100);
    const csllAmount = revenue * (taxConfig.csll / 100);

    breakdown.push(
      { taxName: 'PIS', rate: taxConfig.pis, base: revenue, amount: pisAmount },
      { taxName: 'COFINS', rate: taxConfig.cofins, base: revenue, amount: cofinsAmount },
      { taxName: 'IR', rate: taxConfig.ir, base: revenue, amount: irAmount },
      { taxName: 'CSLL', rate: taxConfig.csll, base: revenue, amount: csllAmount }
    );

    totalTaxes += pisAmount + cofinsAmount + irAmount + csllAmount;

    // State taxes
    const icmsAmount = revenue * (taxConfig.icms / 100);
    breakdown.push({ taxName: 'ICMS', rate: taxConfig.icms, base: revenue, amount: icmsAmount });
    totalTaxes += icmsAmount;

    // Municipal taxes
    const issAmount = revenue * (taxConfig.iss / 100);
    breakdown.push({ taxName: 'ISS', rate: taxConfig.iss, base: revenue, amount: issAmount });
    totalTaxes += issAmount;

    // Custom taxes
    taxConfig.customTaxes.forEach(tax => {
      let taxBase = revenue;
      if (tax.calculationBase === 'profit') {
        taxBase = revenue * 0.2; // Simplified profit calculation
      }
      
      const amount = tax.calculationBase === 'fixed' ? tax.rate : taxBase * (tax.rate / 100);
      breakdown.push({ taxName: tax.name, rate: tax.rate, base: taxBase, amount });
      totalTaxes += amount;
    });

    const effectiveRate = revenue > 0 ? (totalTaxes / revenue) * 100 : 0;

    const result = {
      totalTaxes,
      effectiveRate,
      breakdown,
      optimizationSuggestions: this.generateTaxOptimizationSuggestions(taxConfig, effectiveRate)
    };

    // Cache the result
    this.cache.cacheTaxCalculations({ revenue, taxConfig }, result);
    return result;
  }

  /**
   * Generate tax optimization suggestions
   */
  private generateTaxOptimizationSuggestions(taxConfig: TaxConfiguration, effectiveRate: number): string[] {
    const suggestions: string[] = [];

    if (effectiveRate > 30) {
      suggestions.push('Taxa efetiva alta - considere revisar o regime tributário');
    }

    if (taxConfig.iss > 5) {
      suggestions.push('ISS elevado - verifique possibilidade de redução baseada na localização');
    }

    if (taxConfig.ir > 15) {
      suggestions.push('IR alto - analise possibilidade de dedução de despesas');
    }

    return suggestions;
  }

  /**
   * Calculate margins and markup
   */
  calculateMargins(
    totalCosts: number, 
    marginConfig: MarginConfiguration, 
    additionalCosts: AdditionalCost[] = []
  ): { totalPrice: number; grossMargin: number; netMargin: number; markup: number } {
    
    // Add additional costs
    const otherCosts = additionalCosts.reduce((sum, cost) => sum + cost.value, 0);
    const finalCosts = totalCosts + otherCosts;

    let totalPrice: number;
    
    if (marginConfig.type === 'percentage') {
      // Price = Cost / (1 - Margin%)
      totalPrice = finalCosts / (1 - marginConfig.value / 100);
    } else {
      // Fixed margin
      totalPrice = finalCosts + marginConfig.value;
    }

    const grossMargin = totalPrice - finalCosts;
    const grossMarginPercentage = totalPrice > 0 ? (grossMargin / totalPrice) * 100 : 0;
    const markup = finalCosts > 0 ? (grossMargin / finalCosts) * 100 : 0;

    return {
      totalPrice,
      grossMargin: grossMarginPercentage,
      netMargin: grossMarginPercentage, // Simplified - same as gross for now
      markup
    };
  }

  /**
   * Calculate ROI analysis
   */
  calculateROI(investment: number, returns: number[], discountRate: number = 0.1): ROIAnalysis {
    // Check cache first
    const cachedResult = this.cache.getROIAnalysis({ investment, returns, discountRate });
    if (cachedResult) {
      return cachedResult;
    }
    if (returns.length === 0) {
      return {
        investment,
        returns,
        roi: 0,
        irr: 0,
        npv: 0,
        period: 0
      };
    }

    // Simple ROI calculation
    const totalReturns = returns.reduce((sum, ret) => sum + ret, 0);
    const roi = investment > 0 ? ((totalReturns - investment) / investment) * 100 : 0;

    // NPV calculation
    let npv = -investment;
    returns.forEach((ret, index) => {
      npv += ret / Math.pow(1 + discountRate, index + 1);
    });

    // IRR calculation (simplified Newton-Raphson method)
    const irr = this.calculateIRR(investment, returns);

    const result = {
      investment,
      returns,
      roi,
      irr,
      npv,
      period: returns.length
    };

    // Cache the result
    this.cache.cacheROIAnalysis({ investment, returns, discountRate }, result);
    return result;
  }

  /**
   * Calculate Internal Rate of Return using Newton-Raphson method
   */
  private calculateIRR(investment: number, returns: number[]): number {
    let rate = 0.1; // Initial guess
    const maxIterations = 100;
    const tolerance = 0.0001;

    for (let i = 0; i < maxIterations; i++) {
      let npv = -investment;
      let dnpv = 0;

      returns.forEach((ret, period) => {
        const factor = Math.pow(1 + rate, period + 1);
        npv += ret / factor;
        dnpv -= (period + 1) * ret / (factor * (1 + rate));
      });

      if (Math.abs(npv) < tolerance) {
        return rate * 100;
      }

      if (Math.abs(dnpv) < tolerance) {
        break;
      }

      rate = rate - npv / dnpv;
    }

    return rate * 100;
  }

  /**
   * Calculate payback analysis
   */
  calculatePayback(investment: number, returns: number[]): PaybackAnalysis {
    const cashFlowAnalysis: CashFlowPeriod[] = [];
    let cumulativeCashFlow = -investment;
    let simplePayback = 0;
    let discountedPayback = 0;
    let breakEvenPoint = 0;
    
    const discountRate = 0.1; // 10% discount rate

    returns.forEach((ret, index) => {
      const period = index + 1;
      const netCashFlow = ret;
      cumulativeCashFlow += netCashFlow;
      
      // Discounted cash flow
      const discountedCashFlow = netCashFlow / Math.pow(1 + discountRate, period);
      
      cashFlowAnalysis.push({
        period,
        cashIn: ret,
        cashOut: period === 1 ? investment : 0,
        netCashFlow,
        cumulativeCashFlow
      });

      // Simple payback
      if (simplePayback === 0 && cumulativeCashFlow >= 0) {
        simplePayback = period;
      }

      // Break-even point
      if (breakEvenPoint === 0 && cumulativeCashFlow >= 0) {
        breakEvenPoint = period;
      }
    });

    // Calculate discounted payback
    let discountedCumulative = -investment;
    for (let i = 0; i < returns.length; i++) {
      const discountedReturn = returns[i] / Math.pow(1 + discountRate, i + 1);
      discountedCumulative += discountedReturn;
      if (discountedPayback === 0 && discountedCumulative >= 0) {
        discountedPayback = i + 1;
        break;
      }
    }

    return {
      simplePayback,
      discountedPayback,
      breakEvenPoint,
      cashFlowAnalysis
    };
  }

  /**
   * Calculate margin analysis over time
   */
  calculateMarginAnalysis(
    monthlyBudgets: MonthlyBudget[],
    teamCosts: TeamCostSummary,
    taxes: TaxSummary
  ): MarginAnalysis {
    
    const marginTrend: MarginTrendPoint[] = [];
    let totalRevenue = 0;
    let totalCosts = 0;

    monthlyBudgets.forEach((budget, index) => {
      const grossMargin = budget.revenue > 0 ? ((budget.revenue - budget.totalCosts) / budget.revenue) * 100 : 0;
      const netMargin = budget.revenue > 0 ? (budget.profit / budget.revenue) * 100 : 0;
      
      marginTrend.push({
        period: index + 1,
        grossMargin,
        netMargin
      });

      totalRevenue += budget.revenue;
      totalCosts += budget.totalCosts;
    });

    const grossMargin = totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0;
    const netMargin = totalRevenue > 0 ? ((totalRevenue - totalCosts - taxes.total) / totalRevenue) * 100 : 0;
    const ebitdaMargin = grossMargin; // Simplified
    const contributionMargin = grossMargin; // Simplified

    return {
      grossMargin,
      netMargin,
      ebitdaMargin,
      contributionMargin,
      marginTrend
    };
  }

  /**
   * Calculate scenario analysis
   */
  calculateScenarios(
    baseData: ServiceDeskData,
    scenarios: ScenarioConfig[]
  ): Array<{ scenario: ScenarioConfig; results: any }> {
    
    return scenarios.map(scenario => {
      // Clone base data
      const scenarioData = JSON.parse(JSON.stringify(baseData));
      
      // Apply scenario adjustments
      scenario.adjustments.forEach(adjustment => {
        this.applyScenarioAdjustment(scenarioData, adjustment);
      });

      // Recalculate with adjusted data
      const teamCosts = this.calculateTeamCosts(scenarioData.team, scenarioData.schedules);
      const taxes = this.calculateTaxes(scenarioData.budget.totalPrice, scenarioData.taxes);
      const margins = this.calculateMargins(
        teamCosts.totalMonthlyCost,
        scenarioData.budget.margin,
        scenarioData.otherCosts
      );

      return {
        scenario,
        results: {
          teamCosts: teamCosts.totalMonthlyCost,
          taxes: taxes.totalTaxes,
          totalPrice: margins.totalPrice,
          grossMargin: margins.grossMargin,
          roi: this.calculateROI(margins.totalPrice * 0.2, [margins.totalPrice * 0.15]).roi
        }
      };
    });
  }

  /**
   * Apply scenario adjustment to data
   */
  private applyScenarioAdjustment(data: ServiceDeskData, adjustment: any): void {
    const factor = 1 + (adjustment.adjustment / 100);
    
    switch (adjustment.category) {
      case 'salary':
        data.team.forEach(member => {
          member.salary *= factor;
        });
        break;
      case 'costs':
        data.otherCosts.forEach(cost => {
          cost.value *= factor;
        });
        break;
      case 'revenue':
        data.budget.totalPrice *= factor;
        break;
      case 'taxes':
        Object.keys(data.taxes).forEach(key => {
          if (typeof data.taxes[key as keyof TaxConfiguration] === 'number') {
            (data.taxes[key as keyof TaxConfiguration] as number) *= factor;
          }
        });
        break;
    }
  }

  /**
   * Calculate consolidated budget
   */
  calculateConsolidatedBudget(
    teamCosts: TeamCostCalculation,
    otherCosts: AdditionalCost[],
    taxes: TaxCalculationResult,
    marginConfig: MarginConfiguration,
    contractPeriod: number
  ): ConsolidatedBudget {
    
    const infrastructureCosts = otherCosts
      .filter(cost => cost.category === 'INFRASTRUCTURE')
      .reduce((sum, cost) => sum + cost.value, 0);
    
    const totalOtherCosts = otherCosts.reduce((sum, cost) => sum + cost.value, 0);
    const totalCosts = teamCosts.totalMonthlyCost + totalOtherCosts;
    
    const margins = this.calculateMargins(totalCosts, marginConfig, otherCosts);
    
    // Generate monthly breakdown
    const monthlyBreakdown: MonthlyBudget[] = [];
    for (let month = 1; month <= contractPeriod; month++) {
      const monthlyTeamCost = teamCosts.totalMonthlyCost;
      const monthlyOtherCosts = totalOtherCosts / contractPeriod;
      const monthlyTotalCosts = monthlyTeamCost + monthlyOtherCosts;
      const monthlyRevenue = margins.totalPrice / contractPeriod;
      const monthlyTaxes = taxes.totalTaxes / contractPeriod;
      const monthlyProfit = monthlyRevenue - monthlyTotalCosts - monthlyTaxes;
      const monthlyMargin = monthlyRevenue > 0 ? (monthlyProfit / monthlyRevenue) * 100 : 0;

      monthlyBreakdown.push({
        month: ((month - 1) % 12) + 1,
        year: Math.floor((month - 1) / 12) + new Date().getFullYear(),
        teamCosts: monthlyTeamCost,
        otherCosts: monthlyOtherCosts,
        taxes: monthlyTaxes,
        totalCosts: monthlyTotalCosts,
        revenue: monthlyRevenue,
        profit: monthlyProfit,
        margin: monthlyMargin
      });
    }

    return {
      teamCosts: {
        salaries: teamCosts.breakdown.reduce((sum, member) => sum + member.baseSalary, 0),
        benefits: teamCosts.breakdown.reduce((sum, member) => sum + member.benefits, 0),
        total: teamCosts.totalMonthlyCost,
        breakdown: teamCosts.breakdown.map(member => ({
          memberId: member.memberId,
          memberName: '', // Would need to be populated from team data
          role: '', // Would need to be populated from team data
          monthlyCost: member.totalCost,
          annualCost: member.annualCost
        }))
      },
      infrastructureCosts,
      otherCosts: totalOtherCosts,
      taxes: {
        federal: taxes.breakdown.filter(t => ['PIS', 'COFINS', 'IR', 'CSLL'].includes(t.taxName))
          .reduce((sum, t) => sum + t.amount, 0),
        state: taxes.breakdown.filter(t => t.taxName === 'ICMS')
          .reduce((sum, t) => sum + t.amount, 0),
        municipal: taxes.breakdown.filter(t => t.taxName === 'ISS')
          .reduce((sum, t) => sum + t.amount, 0),
        total: taxes.totalTaxes,
        breakdown: taxes.breakdown
      },
      totalCosts,
      margin: marginConfig,
      totalPrice: margins.totalPrice,
      monthlyBreakdown
    };
  }
}