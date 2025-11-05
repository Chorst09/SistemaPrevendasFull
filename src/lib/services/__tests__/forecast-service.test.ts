import { describe, it, expect } from 'vitest';
import { ForecastService } from '../forecast-service';
import { ScenarioType } from '@/lib/types/service-desk-pricing';

describe('ForecastService', () => {
  const mockScenario = {
    id: 'test-scenario',
    name: 'Test Scenario',
    description: 'Test scenario for unit tests',
    type: ScenarioType.REALISTIC,
    probability: 50,
    assumptions: {
      revenueGrowth: 12,
      costInflation: 8,
      teamGrowth: 10,
      efficiencyGains: 5,
      marketFactors: [],
      customAdjustments: []
    },
    projections: [],
    isBaseline: true,
    color: '#3B82F6'
  };

  describe('calculateMonthlyProjections', () => {
    it('should calculate projections for given scenario', () => {
      const projections = ForecastService.calculateMonthlyProjections(
        mockScenario,
        100000, // baseRevenue
        80000,  // baseCosts
        12,     // contractDuration
        []      // seasonalFactors
      );

      expect(projections).toHaveLength(12);
      expect(projections[0].revenue).toBeGreaterThan(0);
      expect(projections[0].costs.total).toBeGreaterThan(0);
      expect(projections[0].profit).toBeDefined();
      expect(projections[0].margin).toBeDefined();
    });

    it('should apply growth factors correctly', () => {
      const projections = ForecastService.calculateMonthlyProjections(
        mockScenario,
        100000,
        80000,
        12,
        []
      );

      // Revenue should grow over time
      expect(projections[11].revenue).toBeGreaterThan(projections[0].revenue);
      
      // Costs should increase due to inflation
      expect(projections[11].costs.total).toBeGreaterThan(projections[0].costs.total);
    });
  });

  describe('generateDefaultScenarios', () => {
    it('should generate three default scenarios', () => {
      const scenarios = ForecastService.generateDefaultScenarios(100000, 80000);
      
      expect(scenarios).toHaveLength(3);
      expect(scenarios.find(s => s.type === ScenarioType.OPTIMISTIC)).toBeDefined();
      expect(scenarios.find(s => s.type === ScenarioType.REALISTIC)).toBeDefined();
      expect(scenarios.find(s => s.type === ScenarioType.PESSIMISTIC)).toBeDefined();
    });

    it('should have realistic scenario as baseline', () => {
      const scenarios = ForecastService.generateDefaultScenarios(100000, 80000);
      const baseline = scenarios.find(s => s.isBaseline);
      
      expect(baseline).toBeDefined();
      expect(baseline?.type).toBe(ScenarioType.REALISTIC);
    });
  });

  describe('calculateDashboardKPIs', () => {
    it('should calculate KPIs from projections', () => {
      const projections = ForecastService.calculateMonthlyProjections(
        mockScenario,
        100000,
        80000,
        12,
        []
      );
      
      const kpis = ForecastService.calculateDashboardKPIs(projections);
      
      expect(kpis).toHaveLength(4);
      expect(kpis.find(k => k.id === 'total-revenue')).toBeDefined();
      expect(kpis.find(k => k.id === 'avg-margin')).toBeDefined();
      expect(kpis.find(k => k.id === 'team-growth')).toBeDefined();
      expect(kpis.find(k => k.id === 'roi-projection')).toBeDefined();
    });

    it('should return empty array for empty projections', () => {
      const kpis = ForecastService.calculateDashboardKPIs([]);
      expect(kpis).toHaveLength(0);
    });
  });

  describe('identifyRisks', () => {
    it('should identify risks based on projections', () => {
      const projections = ForecastService.calculateMonthlyProjections(
        {
          ...mockScenario,
          assumptions: {
            ...mockScenario.assumptions,
            revenueGrowth: 2, // Low growth to trigger low margin risk
            costInflation: 15  // High inflation
          }
        },
        100000,
        95000, // High base costs to create low margins
        12,
        []
      );
      
      const risks = ForecastService.identifyRisks(projections);
      
      expect(risks.length).toBeGreaterThan(0);
      expect(risks.some(r => r.category === 'financial')).toBe(true);
    });

    it('should return empty array for empty projections', () => {
      const risks = ForecastService.identifyRisks([]);
      expect(risks).toHaveLength(0);
    });
  });

  describe('generateInsights', () => {
    it('should generate insights based on projections', () => {
      const projections = ForecastService.calculateMonthlyProjections(
        mockScenario,
        100000,
        80000,
        12,
        []
      );
      
      const insights = ForecastService.generateInsights(projections);
      
      expect(insights.length).toBeGreaterThan(0);
      expect(insights[0]).toHaveProperty('type');
      expect(insights[0]).toHaveProperty('title');
      expect(insights[0]).toHaveProperty('description');
      expect(insights[0]).toHaveProperty('impact');
      expect(insights[0]).toHaveProperty('confidence');
    });

    it('should return empty array for empty projections', () => {
      const insights = ForecastService.generateInsights([]);
      expect(insights).toHaveLength(0);
    });
  });

  describe('calculateScenarioSummary', () => {
    it('should calculate summary metrics', () => {
      const projections = ForecastService.calculateMonthlyProjections(
        mockScenario,
        100000,
        80000,
        12,
        []
      );
      
      const summary = ForecastService.calculateScenarioSummary(projections);
      
      expect(summary.totalRevenue).toBeGreaterThan(0);
      expect(summary.totalCosts).toBeGreaterThan(0);
      expect(summary.totalProfit).toBeDefined();
      expect(summary.averageMargin).toBeDefined();
      expect(summary.roi).toBeDefined();
      expect(summary.paybackPeriod).toBeGreaterThanOrEqual(0);
      expect(summary.breakEvenMonth).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty projections', () => {
      const summary = ForecastService.calculateScenarioSummary([]);
      
      expect(summary.totalRevenue).toBe(0);
      expect(summary.totalCosts).toBe(0);
      expect(summary.totalProfit).toBe(0);
      expect(summary.averageMargin).toBe(0);
      expect(summary.roi).toBe(0);
      expect(summary.paybackPeriod).toBe(0);
      expect(summary.breakEvenMonth).toBe(0);
    });
  });
});