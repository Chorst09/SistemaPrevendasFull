import { 
  ForecastData, 
  ForecastScenario, 
  MonthlyProjection, 
  ScenarioType,
  ForecastRisk,
  RiskCategory,
  RiskSeverity,
  SensitivityAnalysis,
  DashboardKPI,
  DashboardAlert,
  AlertType,
  AlertSeverity,
  DashboardInsight,
  InsightType,
  InsightPriority
} from '@/lib/types/service-desk-pricing';

export class ForecastService {
  /**
   * Calcula projeções mensais para um cenário específico
   */
  static calculateMonthlyProjections(
    scenario: ForecastScenario,
    baseRevenue: number,
    baseCosts: number,
    contractDuration: number = 24,
    seasonalFactors: { month: number; factor: number }[] = []
  ): MonthlyProjection[] {
    const projections: MonthlyProjection[] = [];
    
    for (let month = 1; month <= contractDuration; month++) {
      const year = Math.floor((month - 1) / 12) + 1;
      const monthInYear = ((month - 1) % 12) + 1;
      
      // Fatores de crescimento compostos
      const timeInYears = (month - 1) / 12;
      const revenueGrowthFactor = Math.pow(1 + (scenario.assumptions.revenueGrowth / 100), timeInYears);
      const costInflationFactor = Math.pow(1 + (scenario.assumptions.costInflation / 100), timeInYears);
      const efficiencyFactor = Math.pow(1 + (scenario.assumptions.efficiencyGains / 100), timeInYears);
      
      // Fator sazonal
      const seasonalFactor = seasonalFactors.find(f => f.month === monthInYear)?.factor || 1.0;
      
      // Cálculos base
      const revenue = baseRevenue * revenueGrowthFactor * seasonalFactor;
      const rawCosts = baseCosts * costInflationFactor;
      const costs = rawCosts / efficiencyFactor; // Eficiência reduz custos
      const profit = revenue - costs;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
      
      // Tamanho da equipe
      const teamGrowthFactor = Math.pow(1 + (scenario.assumptions.teamGrowth / 100), timeInYears);
      const teamSize = Math.ceil(10 * teamGrowthFactor);
      
      // Volume de tickets
      const ticketVolume = Math.ceil(1000 * revenueGrowthFactor * seasonalFactor);
      
      projections.push({
        month: monthInYear,
        year: new Date().getFullYear() + year - 1,
        revenue,
        costs: {
          personnel: costs * 0.65,
          infrastructure: costs * 0.15,
          operations: costs * 0.12,
          taxes: costs * 0.05,
          other: costs * 0.03,
          total: costs
        },
        profit,
        margin,
        teamSize,
        ticketVolume,
        kpis: this.calculateMonthlyKPIs(revenue, costs, teamSize, ticketVolume, month)
      });
    }
    
    return projections;
  }

  /**
   * Calcula KPIs mensais
   */
  private static calculateMonthlyKPIs(
    revenue: number,
    costs: number,
    teamSize: number,
    ticketVolume: number,
    month: number
  ) {
    // Simulação de variação nos KPIs baseada no mês e performance
    const performanceFactor = Math.sin((month * Math.PI) / 6) * 0.1 + 1; // Variação sazonal
    
    return {
      customerSatisfaction: Math.min(100, 80 + (revenue / costs - 1) * 50 + Math.random() * 10),
      slaCompliance: Math.min(100, 90 + performanceFactor * 5 + Math.random() * 5),
      firstCallResolution: Math.min(100, 70 + (teamSize / (ticketVolume / 1000)) * 20 + Math.random() * 10),
      averageResolutionTime: Math.max(1, 6 - performanceFactor + Math.random() * 2),
      costPerTicket: ticketVolume > 0 ? costs / ticketVolume : 0,
      revenuePerEmployee: teamSize > 0 ? revenue / teamSize : 0
    };
  }

  /**
   * Gera cenários padrão baseados nos dados do projeto
   */
  static generateDefaultScenarios(baseRevenue: number, baseCosts: number): ForecastScenario[] {
    return [
      {
        id: 'optimistic',
        name: 'Cenário Otimista',
        description: 'Crescimento acelerado com condições favoráveis de mercado',
        type: ScenarioType.OPTIMISTIC,
        probability: 25,
        assumptions: {
          revenueGrowth: 20,
          costInflation: 5,
          teamGrowth: 15,
          efficiencyGains: 10,
          marketFactors: [],
          customAdjustments: []
        },
        projections: [],
        isBaseline: false,
        color: '#10B981'
      },
      {
        id: 'realistic',
        name: 'Cenário Realista',
        description: 'Crescimento moderado baseado em tendências históricas',
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
      },
      {
        id: 'pessimistic',
        name: 'Cenário Pessimista',
        description: 'Crescimento limitado com desafios de mercado',
        type: ScenarioType.PESSIMISTIC,
        probability: 25,
        assumptions: {
          revenueGrowth: 5,
          costInflation: 12,
          teamGrowth: 5,
          efficiencyGains: 2,
          marketFactors: [],
          customAdjustments: []
        },
        projections: [],
        isBaseline: false,
        color: '#EF4444'
      }
    ];
  }

  /**
   * Calcula KPIs do dashboard
   */
  static calculateDashboardKPIs(projections: MonthlyProjection[]): DashboardKPI[] {
    if (projections.length === 0) return [];
    
    const totalRevenue = projections.reduce((sum, p) => sum + p.revenue, 0);
    const totalCosts = projections.reduce((sum, p) => sum + p.costs.total, 0);
    const totalProfit = totalRevenue - totalCosts;
    const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const lastMonth = projections[projections.length - 1];
    const firstMonth = projections[0];
    
    // Cálculo de ROI
    const investment = totalCosts;
    const roi = investment > 0 ? (totalProfit / investment) * 100 : 0;
    
    // Crescimento da equipe
    const teamGrowth = firstMonth.teamSize > 0 
      ? ((lastMonth.teamSize - firstMonth.teamSize) / firstMonth.teamSize) * 100 
      : 0;
    
    return [
      {
        id: 'total-revenue',
        name: 'Receita Total Projetada',
        value: totalRevenue,
        unit: 'R$',
        trend: 'up',
        change: 15.2,
        status: 'good',
        description: 'Receita acumulada para o período'
      },
      {
        id: 'avg-margin',
        name: 'Margem Média',
        value: avgMargin,
        unit: '%',
        trend: avgMargin > 20 ? 'up' : avgMargin > 15 ? 'stable' : 'down',
        change: 2.1,
        target: 20,
        status: avgMargin > 20 ? 'good' : avgMargin > 15 ? 'warning' : 'critical',
        description: 'Margem de lucro média projetada'
      },
      {
        id: 'team-growth',
        name: 'Crescimento da Equipe',
        value: lastMonth.teamSize,
        unit: 'pessoas',
        trend: teamGrowth > 0 ? 'up' : teamGrowth < 0 ? 'down' : 'stable',
        change: teamGrowth,
        status: 'good',
        description: 'Tamanho final da equipe'
      },
      {
        id: 'roi-projection',
        name: 'ROI Projetado',
        value: roi,
        unit: '%',
        trend: roi > 25 ? 'up' : roi > 15 ? 'stable' : 'down',
        change: 5.8,
        target: 25,
        status: roi > 25 ? 'good' : roi > 15 ? 'warning' : 'critical',
        description: 'Retorno sobre investimento projetado'
      }
    ];
  }

  /**
   * Identifica riscos baseados nas projeções
   */
  static identifyRisks(projections: MonthlyProjection[]): ForecastRisk[] {
    const risks: ForecastRisk[] = [];
    
    if (projections.length === 0) return risks;
    
    // Análise de margem
    const avgMargin = projections.reduce((sum, p) => sum + p.margin, 0) / projections.length;
    if (avgMargin < 15) {
      risks.push({
        id: 'low-margin',
        name: 'Margem Baixa',
        category: RiskCategory.FINANCIAL,
        probability: 70,
        impact: 80,
        severity: RiskSeverity.HIGH,
        description: 'Margem de lucro abaixo do esperado pode comprometer viabilidade',
        potentialLoss: projections.reduce((sum, p) => sum + p.revenue, 0) * 0.1,
        timeframe: 'Próximos 12 meses'
      });
    }
    
    // Análise de crescimento de custos
    const firstMonth = projections[0];
    const lastMonth = projections[projections.length - 1];
    const costGrowth = ((lastMonth.costs.total - firstMonth.costs.total) / firstMonth.costs.total) * 100;
    
    if (costGrowth > 50) {
      risks.push({
        id: 'cost-inflation',
        name: 'Inflação de Custos',
        category: RiskCategory.OPERATIONAL,
        probability: 60,
        impact: 70,
        severity: RiskSeverity.MEDIUM,
        description: 'Crescimento acelerado de custos pode impactar rentabilidade',
        potentialLoss: lastMonth.costs.total * 0.15,
        timeframe: 'Médio prazo'
      });
    }
    
    // Análise de dependência de cliente
    risks.push({
      id: 'client-dependency',
      name: 'Dependência de Cliente Único',
      category: RiskCategory.MARKET,
      probability: 30,
      impact: 90,
      severity: RiskSeverity.HIGH,
      description: 'Alta dependência de um único cliente representa risco significativo',
      potentialLoss: projections.reduce((sum, p) => sum + p.revenue, 0) * 0.85,
      timeframe: 'Qualquer momento'
    });
    
    return risks;
  }

  /**
   * Gera análise de sensibilidade
   */
  static generateSensitivityAnalysis(baseProjections: MonthlyProjection[]): SensitivityAnalysis[] {
    const totalProfit = baseProjections.reduce((sum, p) => sum + p.profit, 0);
    
    return [
      {
        variable: 'Crescimento de Receita',
        baseValue: 12, // 12% base growth
        variations: [-5, -2, 0, 2, 5], // percentage point changes
        impacts: [-15, -6, 0, 6, 15], // impact on profit percentage
        elasticity: 1.25 // profit elasticity to revenue growth
      },
      {
        variable: 'Inflação de Custos',
        baseValue: 8, // 8% base inflation
        variations: [-2, -1, 0, 1, 2],
        impacts: [8, 4, 0, -4, -8],
        elasticity: -0.5 // negative elasticity
      },
      {
        variable: 'Eficiência Operacional',
        baseValue: 5, // 5% base efficiency gains
        variations: [-3, -1, 0, 2, 5],
        impacts: [-6, -2, 0, 4, 10],
        elasticity: 0.8
      }
    ];
  }

  /**
   * Gera alertas baseados nas projeções
   */
  static generateAlerts(projections: MonthlyProjection[]): DashboardAlert[] {
    const alerts: DashboardAlert[] = [];
    
    if (projections.length === 0) return alerts;
    
    // Alerta de margem baixa
    const avgMargin = projections.reduce((sum, p) => sum + p.margin, 0) / projections.length;
    if (avgMargin < 15) {
      alerts.push({
        id: 'low-margin-alert',
        type: AlertType.PERFORMANCE,
        severity: AlertSeverity.WARNING,
        title: 'Margem Abaixo do Esperado',
        message: `Margem média de ${avgMargin.toFixed(1)}% está abaixo da meta de 15%`,
        threshold: 15,
        currentValue: avgMargin,
        trend: 'worsening',
        actionRequired: true,
        createdAt: new Date()
      });
    }
    
    // Alerta de crescimento de custos
    const firstMonth = projections[0];
    const lastMonth = projections[projections.length - 1];
    const costGrowth = ((lastMonth.costs.total - firstMonth.costs.total) / firstMonth.costs.total) * 100;
    
    if (costGrowth > 30) {
      alerts.push({
        id: 'cost-growth-alert',
        type: AlertType.BUDGET,
        severity: AlertSeverity.ERROR,
        title: 'Crescimento Acelerado de Custos',
        message: `Custos crescendo ${costGrowth.toFixed(1)}% no período`,
        threshold: 30,
        currentValue: costGrowth,
        trend: 'worsening',
        actionRequired: true,
        createdAt: new Date()
      });
    }
    
    return alerts;
  }

  /**
   * Gera insights estratégicos
   */
  static generateInsights(projections: MonthlyProjection[]): DashboardInsight[] {
    const insights: DashboardInsight[] = [];
    
    if (projections.length === 0) return insights;
    
    const totalRevenue = projections.reduce((sum, p) => sum + p.revenue, 0);
    const avgMargin = projections.reduce((sum, p) => sum + p.margin, 0) / projections.length;
    
    // Insight de otimização de custos
    if (avgMargin < 20) {
      insights.push({
        id: 'cost-optimization',
        type: InsightType.COST_OPTIMIZATION,
        title: 'Oportunidade de Otimização de Custos',
        description: 'Automação de processos pode reduzir custos operacionais em até 8%',
        impact: totalRevenue * 0.08,
        confidence: 75,
        recommendation: 'Implementar ferramentas de automação para reduzir custos manuais',
        priority: InsightPriority.HIGH,
        category: 'Operacional'
      });
    }
    
    // Insight de expansão
    const lastMonth = projections[projections.length - 1];
    if (lastMonth.margin > 25) {
      insights.push({
        id: 'expansion-opportunity',
        type: InsightType.REVENUE_OPPORTUNITY,
        title: 'Oportunidade de Expansão',
        description: 'Margens saudáveis indicam potencial para expandir operação',
        impact: totalRevenue * 0.25,
        confidence: 60,
        recommendation: 'Considerar expansão da equipe ou novos serviços',
        priority: InsightPriority.MEDIUM,
        category: 'Estratégico'
      });
    }
    
    return insights;
  }

  /**
   * Calcula métricas de resumo para um cenário
   */
  static calculateScenarioSummary(projections: MonthlyProjection[]) {
    if (projections.length === 0) {
      return {
        totalRevenue: 0,
        totalCosts: 0,
        totalProfit: 0,
        averageMargin: 0,
        roi: 0,
        paybackPeriod: 0,
        breakEvenMonth: 0
      };
    }
    
    const totalRevenue = projections.reduce((sum, p) => sum + p.revenue, 0);
    const totalCosts = projections.reduce((sum, p) => sum + p.costs.total, 0);
    const totalProfit = totalRevenue - totalCosts;
    const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const roi = totalCosts > 0 ? (totalProfit / totalCosts) * 100 : 0;
    
    // Calcular payback period (meses para recuperar investimento)
    let cumulativeProfit = 0;
    let paybackPeriod = 0;
    const initialInvestment = projections[0]?.costs.total || 0;
    
    for (let i = 0; i < projections.length; i++) {
      cumulativeProfit += projections[i].profit;
      if (cumulativeProfit >= initialInvestment) {
        paybackPeriod = i + 1;
        break;
      }
    }
    
    // Calcular break-even month
    let breakEvenMonth = 0;
    for (let i = 0; i < projections.length; i++) {
      if (projections[i].profit > 0) {
        breakEvenMonth = i + 1;
        break;
      }
    }
    
    return {
      totalRevenue,
      totalCosts,
      totalProfit,
      averageMargin,
      roi,
      paybackPeriod,
      breakEvenMonth
    };
  }
}