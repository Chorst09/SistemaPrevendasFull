import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ServiceDeskCalculationEngine } from '../service-desk-calculation-engine';
import { TeamMember, WorkSchedule, TaxConfiguration, MarketVariables, ServiceDeskData } from '@/lib/types/service-desk-pricing';

// Mock the calculation cache
vi.mock('@/lib/utils/calculation-cache', () => ({
  ServiceDeskCalculationCache: {
    getInstance: () => ({
      getTeamCosts: vi.fn(),
      cacheTeamCosts: vi.fn(),
      getTaxCalculations: vi.fn(),
      cacheTaxCalculations: vi.fn(),
      getROIAnalysis: vi.fn(),
      cacheROIAnalysis: vi.fn()
    })
  },
  cached: () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => descriptor
}));

describe('ServiceDeskCalculationEngine', () => {
  let engine: ServiceDeskCalculationEngine;

  beforeEach(() => {
    engine = new ServiceDeskCalculationEngine();
  });

  describe('Team Cost Calculations', () => {
    const mockTeamMember: TeamMember = {
      id: 'member-1',
      name: 'John Doe',
      role: 'Analyst',
      salary: 5000,
      benefits: {
        healthInsurance: 300,
        mealVoucher: 500,
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
      costPerHour: 0,
      skills: [],
      certifications: []
    };

    const mockSchedule: WorkSchedule = {
      id: 'schedule-1',
      name: 'Business Hours',
      shifts: [{
        id: 'shift-1',
        name: 'Morning Shift',
        startTime: '08:00',
        endTime: '17:00',
        daysOfWeek: [1, 2, 3, 4, 5],
        teamMembers: ['member-1'],
        isSpecialShift: false,
        multiplier: 1
      }],
      coverage: {
        minimumStaff: 1,
        preferredStaff: 2,
        criticalPeriods: []
      },
      specialRates: []
    };

    it('should calculate team costs correctly', () => {
      const result = engine.calculateTeamCosts([mockTeamMember], [mockSchedule]);

      expect(result).toHaveProperty('totalMonthlyCost');
      expect(result).toHaveProperty('totalAnnualCost');
      expect(result).toHaveProperty('costPerHour');
      expect(result).toHaveProperty('breakdown');
      expect(result.breakdown).toHaveLength(1);
      expect(result.totalMonthlyCost).toBeGreaterThan(0);
      expect(result.totalAnnualCost).toBe(result.totalMonthlyCost * 12);
    });

    it('should handle empty team gracefully', () => {
      const result = engine.calculateTeamCosts([], [mockSchedule]);

      expect(result.totalMonthlyCost).toBe(0);
      expect(result.totalAnnualCost).toBe(0);
      expect(result.costPerHour).toBe(0);
      expect(result.breakdown).toHaveLength(0);
    });

    it('should calculate benefits correctly', () => {
      const result = engine.calculateTeamCosts([mockTeamMember], [mockSchedule]);
      const memberBreakdown = result.breakdown[0];

      expect(memberBreakdown.benefits).toBeGreaterThan(0);
      // Benefits should include fixed amounts plus percentage-based benefits
      const expectedFixedBenefits = 300 + 500 + 200 + 50; // 1050
      const expectedPercentageBenefits = mockTeamMember.salary * (8.33 + 8.33 + 8 + 11) / 100; // 35.66% of salary
      expect(memberBreakdown.benefits).toBeCloseTo(expectedFixedBenefits + expectedPercentageBenefits, 0);
    });

    it('should apply shift multipliers correctly', () => {
      const specialSchedule: WorkSchedule = {
        ...mockSchedule,
        shifts: [{
          ...mockSchedule.shifts[0],
          isSpecialShift: true,
          multiplier: 1.5
        }]
      };

      const result = engine.calculateTeamCosts([mockTeamMember], [specialSchedule]);
      const memberBreakdown = result.breakdown[0];

      expect(memberBreakdown.baseSalary).toBe(mockTeamMember.salary * 1.5);
    });
  });

  describe('Coverage Analysis', () => {
    const mockSchedule: WorkSchedule = {
      id: 'schedule-1',
      name: 'Business Hours',
      shifts: [{
        id: 'shift-1',
        name: 'Morning Shift',
        startTime: '08:00',
        endTime: '17:00',
        daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
        teamMembers: ['member-1'],
        isSpecialShift: false,
        multiplier: 1
      }],
      coverage: {
        minimumStaff: 1,
        preferredStaff: 2,
        criticalPeriods: []
      },
      specialRates: []
    };

    it('should calculate coverage analysis correctly', () => {
      const result = engine.calculateCoverageAnalysis([mockSchedule]);

      expect(result).toHaveProperty('totalHours', 168); // 24 * 7
      expect(result).toHaveProperty('coveredHours');
      expect(result).toHaveProperty('coveragePercentage');
      expect(result).toHaveProperty('gaps');
      expect(result).toHaveProperty('recommendations');
      expect(result.coveragePercentage).toBeGreaterThan(0);
      expect(result.coveragePercentage).toBeLessThanOrEqual(100);
    });

    it('should identify coverage gaps', () => {
      const result = engine.calculateCoverageAnalysis([mockSchedule]);

      expect(Array.isArray(result.gaps)).toBe(true);
      // Should have gaps for nights, weekends, and early morning/late evening
      expect(result.gaps.length).toBeGreaterThan(0);
    });

    it('should provide recommendations', () => {
      const result = engine.calculateCoverageAnalysis([mockSchedule]);

      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(typeof result.recommendations[0]).toBe('string');
    });

    it('should handle empty schedules', () => {
      const result = engine.calculateCoverageAnalysis([]);

      expect(result.coveragePercentage).toBe(0);
      expect(result.coveredHours).toBe(0);
      expect(result.recommendations).toContain('Configure pelo menos uma escala de trabalho');
    });
  });

  describe('Tax Calculations', () => {
    const mockTaxConfig: TaxConfiguration = {
      region: 'SP',
      icms: 18,
      pis: 1.65,
      cofins: 7.6,
      iss: 5,
      ir: 15,
      csll: 9,
      customTaxes: [{
        id: 'custom-1',
        name: 'Custom Tax',
        rate: 2,
        calculationBase: 'revenue',
        description: 'Test custom tax'
      }],
      taxRegime: 'LUCRO_PRESUMIDO' as any
    };

    it('should calculate taxes correctly', () => {
      const revenue = 100000;
      const result = engine.calculateTaxes(revenue, mockTaxConfig);

      expect(result).toHaveProperty('totalTaxes');
      expect(result).toHaveProperty('effectiveRate');
      expect(result).toHaveProperty('breakdown');
      expect(result).toHaveProperty('optimizationSuggestions');
      expect(result.totalTaxes).toBeGreaterThan(0);
      expect(result.effectiveRate).toBeGreaterThan(0);
      expect(result.breakdown).toHaveLength(7); // 6 standard taxes + 1 custom
    });

    it('should calculate effective tax rate correctly', () => {
      const revenue = 100000;
      const result = engine.calculateTaxes(revenue, mockTaxConfig);

      const expectedTotalRate = 18 + 1.65 + 7.6 + 5 + 15 + 9 + 2; // 58.25%
      expect(result.effectiveRate).toBeCloseTo(expectedTotalRate, 1);
    });

    it('should handle zero revenue', () => {
      const result = engine.calculateTaxes(0, mockTaxConfig);

      expect(result.totalTaxes).toBe(0);
      expect(result.effectiveRate).toBe(0);
      expect(result.breakdown).toHaveLength(7);
    });

    it('should provide tax optimization suggestions', () => {
      const revenue = 100000;
      const result = engine.calculateTaxes(revenue, mockTaxConfig);

      expect(Array.isArray(result.optimizationSuggestions)).toBe(true);
      // High effective rate should trigger suggestions
      expect(result.optimizationSuggestions.length).toBeGreaterThan(0);
    });
  });

  describe('Margin Calculations', () => {
    it('should calculate margins with percentage margin', () => {
      const totalCosts = 80000;
      const marginConfig = {
        type: 'percentage' as const,
        value: 25, // 25% margin
        minimumMargin: 10,
        targetMargin: 25,
        maximumMargin: 40
      };

      const result = engine.calculateMargins(totalCosts, marginConfig);

      expect(result).toHaveProperty('totalPrice');
      expect(result).toHaveProperty('grossMargin');
      expect(result).toHaveProperty('netMargin');
      expect(result).toHaveProperty('markup');

      // With 25% margin, price should be cost / (1 - 0.25) = cost / 0.75
      const expectedPrice = totalCosts / 0.75;
      expect(result.totalPrice).toBeCloseTo(expectedPrice, 0);
      expect(result.grossMargin).toBeCloseTo(25, 1);
    });

    it('should calculate margins with fixed margin', () => {
      const totalCosts = 80000;
      const marginConfig = {
        type: 'fixed' as const,
        value: 20000, // Fixed margin of 20k
        minimumMargin: 10000,
        targetMargin: 20000,
        maximumMargin: 40000
      };

      const result = engine.calculateMargins(totalCosts, marginConfig);

      expect(result.totalPrice).toBe(totalCosts + marginConfig.value);
      const expectedGrossMargin = (marginConfig.value / result.totalPrice) * 100;
      expect(result.grossMargin).toBeCloseTo(expectedGrossMargin, 1);
    });

    it('should include additional costs in calculation', () => {
      const totalCosts = 80000;
      const additionalCosts = [
        { id: '1', name: 'License', value: 5000, category: 'SOFTWARE' as any, type: 'fixed' as any, description: '', startDate: new Date(), endDate: new Date() },
        { id: '2', name: 'Training', value: 3000, category: 'TRAINING' as any, type: 'fixed' as any, description: '', startDate: new Date(), endDate: new Date() }
      ];
      const marginConfig = {
        type: 'percentage' as const,
        value: 20,
        minimumMargin: 10,
        targetMargin: 20,
        maximumMargin: 30
      };

      const result = engine.calculateMargins(totalCosts, marginConfig, additionalCosts);

      const expectedFinalCosts = totalCosts + 5000 + 3000;
      const expectedPrice = expectedFinalCosts / 0.8; // 20% margin
      expect(result.totalPrice).toBeCloseTo(expectedPrice, 0);
    });
  });

  describe('ROI Analysis', () => {
    it('should calculate ROI correctly', () => {
      const investment = 100000;
      const returns = [30000, 35000, 40000]; // 3 years of returns

      const result = engine.calculateROI(investment, returns);

      expect(result).toHaveProperty('investment', investment);
      expect(result).toHaveProperty('returns', returns);
      expect(result).toHaveProperty('roi');
      expect(result).toHaveProperty('irr');
      expect(result).toHaveProperty('npv');
      expect(result).toHaveProperty('period', 3);

      const totalReturns = returns.reduce((sum, ret) => sum + ret, 0);
      const expectedROI = ((totalReturns - investment) / investment) * 100;
      expect(result.roi).toBeCloseTo(expectedROI, 1);
    });

    it('should handle empty returns', () => {
      const result = engine.calculateROI(100000, []);

      expect(result.roi).toBe(0);
      expect(result.irr).toBe(0);
      expect(result.npv).toBe(0);
      expect(result.period).toBe(0);
    });

    it('should calculate NPV with discount rate', () => {
      const investment = 100000;
      const returns = [50000, 60000];
      const discountRate = 0.1;

      const result = engine.calculateROI(investment, returns, discountRate);

      // NPV = -investment + sum(returns[i] / (1 + rate)^(i+1))
      const expectedNPV = -investment + 
        (returns[0] / Math.pow(1.1, 1)) + 
        (returns[1] / Math.pow(1.1, 2));
      
      expect(result.npv).toBeCloseTo(expectedNPV, 0);
    });
  });

  describe('Payback Analysis', () => {
    it('should calculate payback periods correctly', () => {
      const investment = 100000;
      const returns = [30000, 40000, 50000, 60000];

      const result = engine.calculatePayback(investment, returns);

      expect(result).toHaveProperty('simplePayback');
      expect(result).toHaveProperty('discountedPayback');
      expect(result).toHaveProperty('breakEvenPoint');
      expect(result).toHaveProperty('cashFlowAnalysis');

      // Simple payback should be when cumulative returns >= investment
      // 30k + 40k + 50k = 120k > 100k, so payback is in period 3
      expect(result.simplePayback).toBe(3);
      expect(result.breakEvenPoint).toBe(3);
      expect(result.cashFlowAnalysis).toHaveLength(4);
    });

    it('should handle case where payback never occurs', () => {
      const investment = 100000;
      const returns = [10000, 15000, 20000]; // Total 45k < 100k

      const result = engine.calculatePayback(investment, returns);

      expect(result.simplePayback).toBe(0); // Never pays back
      expect(result.breakEvenPoint).toBe(0);
    });
  });

  describe('Scenario Analysis', () => {
    const mockBaseData: ServiceDeskData = {
      project: {
        id: 'test-project',
        name: 'Test Project',
        client: { name: 'Test Client', document: '123', email: 'test@test.com', phone: '', address: {} as any, contactPerson: '' },
        contractPeriod: { startDate: new Date(), endDate: new Date(), durationMonths: 12, renewalOptions: [] },
        description: 'Test',
        currency: 'BRL',
        location: 'SP',
        serviceType: 'STANDARD' as any,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      team: [{
        id: 'member-1',
        name: 'Test Member',
        role: 'Analyst',
        salary: 5000,
        benefits: {} as any,
        workload: 40,
        startDate: new Date(),
        costPerHour: 0,
        skills: [],
        certifications: []
      }],
      schedules: [],
      taxes: {
        region: 'SP',
        icms: 18,
        pis: 1.65,
        cofins: 7.6,
        iss: 5,
        ir: 15,
        csll: 9,
        customTaxes: [],
        taxRegime: 'LUCRO_PRESUMIDO' as any
      },
      variables: {} as any,
      otherCosts: [],
      budget: {
        teamCosts: { salaries: 0, benefits: 0, total: 0, breakdown: [] },
        infrastructureCosts: 0,
        otherCosts: 0,
        taxes: { federal: 0, state: 0, municipal: 0, total: 0, breakdown: [] },
        totalCosts: 0,
        margin: { type: 'percentage', value: 20, minimumMargin: 10, targetMargin: 20, maximumMargin: 30 },
        totalPrice: 100000,
        monthlyBreakdown: []
      },
      analysis: {} as any,
      negotiations: [],
      finalAnalysis: {} as any,
      metadata: {} as any
    };

    const mockScenarios = [
      {
        id: 'optimistic',
        name: 'Optimistic',
        description: 'Best case scenario',
        adjustments: [
          { category: 'salary', adjustment: 10 }, // 10% increase
          { category: 'revenue', adjustment: 15 } // 15% increase
        ]
      },
      {
        id: 'pessimistic',
        name: 'Pessimistic',
        description: 'Worst case scenario',
        adjustments: [
          { category: 'salary', adjustment: 5 }, // 5% increase
          { category: 'revenue', adjustment: -10 } // 10% decrease
        ]
      }
    ];

    it('should calculate scenario analysis', () => {
      const results = engine.calculateScenarios(mockBaseData, mockScenarios);

      expect(results).toHaveLength(2);
      expect(results[0]).toHaveProperty('scenario');
      expect(results[0]).toHaveProperty('results');
      expect(results[0].scenario.id).toBe('optimistic');
      expect(results[1].scenario.id).toBe('pessimistic');
    });

    it('should apply scenario adjustments correctly', () => {
      const results = engine.calculateScenarios(mockBaseData, mockScenarios);

      // Optimistic scenario should have higher revenue
      const optimisticResults = results[0].results;
      const pessimisticResults = results[1].results;

      expect(optimisticResults.totalPrice).toBeGreaterThan(pessimisticResults.totalPrice);
    });
  });

  describe('Consolidated Budget', () => {
    const mockTeamCosts = {
      totalMonthlyCost: 10000,
      totalAnnualCost: 120000,
      costPerHour: 50,
      breakdown: [{
        memberId: 'member-1',
        baseSalary: 5000,
        benefits: 2000,
        totalCost: 7000,
        hourlyRate: 40,
        annualCost: 84000
      }]
    };

    const mockOtherCosts = [
      { id: '1', name: 'Infrastructure', value: 2000, category: 'INFRASTRUCTURE' as any, type: 'fixed' as any, description: '', startDate: new Date(), endDate: new Date() },
      { id: '2', name: 'Software', value: 1000, category: 'SOFTWARE' as any, type: 'fixed' as any, description: '', startDate: new Date(), endDate: new Date() }
    ];

    const mockTaxes = {
      totalTaxes: 5000,
      effectiveRate: 25,
      breakdown: [],
      optimizationSuggestions: []
    };

    const mockMarginConfig = {
      type: 'percentage' as const,
      value: 20,
      minimumMargin: 10,
      targetMargin: 20,
      maximumMargin: 30
    };

    it('should calculate consolidated budget correctly', () => {
      const result = engine.calculateConsolidatedBudget(
        mockTeamCosts,
        mockOtherCosts,
        mockTaxes,
        mockMarginConfig,
        12
      );

      expect(result).toHaveProperty('teamCosts');
      expect(result).toHaveProperty('infrastructureCosts');
      expect(result).toHaveProperty('otherCosts');
      expect(result).toHaveProperty('taxes');
      expect(result).toHaveProperty('totalCosts');
      expect(result).toHaveProperty('margin');
      expect(result).toHaveProperty('totalPrice');
      expect(result).toHaveProperty('monthlyBreakdown');

      expect(result.infrastructureCosts).toBe(2000);
      expect(result.otherCosts).toBe(3000); // 2000 + 1000
      expect(result.monthlyBreakdown).toHaveLength(12);
    });

    it('should generate monthly breakdown correctly', () => {
      const result = engine.calculateConsolidatedBudget(
        mockTeamCosts,
        mockOtherCosts,
        mockTaxes,
        mockMarginConfig,
        12
      );

      const firstMonth = result.monthlyBreakdown[0];
      expect(firstMonth).toHaveProperty('month');
      expect(firstMonth).toHaveProperty('year');
      expect(firstMonth).toHaveProperty('teamCosts');
      expect(firstMonth).toHaveProperty('otherCosts');
      expect(firstMonth).toHaveProperty('taxes');
      expect(firstMonth).toHaveProperty('totalCosts');
      expect(firstMonth).toHaveProperty('revenue');
      expect(firstMonth).toHaveProperty('profit');
      expect(firstMonth).toHaveProperty('margin');

      expect(firstMonth.teamCosts).toBe(mockTeamCosts.totalMonthlyCost);
    });
  });
});