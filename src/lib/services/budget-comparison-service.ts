import {
  ConsolidatedBudget,
  ServiceDeskData,
  MonthlyBudget,
  MarginConfiguration
} from '../types/service-desk-pricing';

export interface BudgetComparison {
  currentBudget: ConsolidatedBudget;
  previousBudgets: ConsolidatedBudget[];
  deviations: BudgetDeviations;
  trends: BudgetTrends;
  recommendations: BudgetRecommendation[];
  alerts: BudgetAlert[];
}

export interface BudgetDeviations {
  teamCosts: {
    absolute: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  };
  otherCosts: {
    absolute: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  };
  taxes: {
    absolute: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  };
  totalPrice: {
    absolute: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  };
  margin: {
    absolute: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  };
}

export interface BudgetTrends {
  teamCostTrend: TrendPoint[];
  marginTrend: TrendPoint[];
  priceTrend: TrendPoint[];
  profitabilityTrend: TrendPoint[];
}

export interface TrendPoint {
  period: string;
  value: number;
  label: string;
}

export interface BudgetRecommendation {
  type: 'cost_optimization' | 'margin_adjustment' | 'pricing_strategy' | 'risk_mitigation';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: {
    financial: number;
    risk: 'low' | 'medium' | 'high';
  };
  actionItems: string[];
}

export interface BudgetAlert {
  type: 'warning' | 'error' | 'info';
  category: 'margin' | 'costs' | 'pricing' | 'trend';
  title: string;
  message: string;
  threshold?: number;
  currentValue?: number;
  suggestedAction?: string;
}

/**
 * Service for budget comparison and analysis
 */
export class BudgetComparisonService {
  
  /**
   * Compare current budget with historical budgets
   */
  compareBudgets(
    currentBudget: ConsolidatedBudget,
    previousBudgets: ConsolidatedBudget[] = []
  ): BudgetComparison {
    
    const deviations = this.calculateDeviations(currentBudget, previousBudgets);
    const trends = this.calculateTrends(currentBudget, previousBudgets);
    const recommendations = this.generateRecommendations(currentBudget, deviations, trends);
    const alerts = this.generateAlerts(currentBudget, deviations);

    return {
      currentBudget,
      previousBudgets,
      deviations,
      trends,
      recommendations,
      alerts
    };
  }

  /**
   * Calculate deviations from previous budgets
   */
  private calculateDeviations(
    currentBudget: ConsolidatedBudget,
    previousBudgets: ConsolidatedBudget[]
  ): BudgetDeviations {
    
    if (previousBudgets.length === 0) {
      return this.createEmptyDeviations();
    }

    // Use the most recent budget for comparison
    const referenceBudget = previousBudgets[previousBudgets.length - 1];
    
    const teamCostsDeviation = this.calculateDeviation(
      currentBudget.teamCosts.total,
      referenceBudget.teamCosts.total
    );
    
    const otherCostsDeviation = this.calculateDeviation(
      currentBudget.otherCosts,
      referenceBudget.otherCosts
    );
    
    const taxesDeviation = this.calculateDeviation(
      currentBudget.taxes.total,
      referenceBudget.taxes.total
    );
    
    const totalPriceDeviation = this.calculateDeviation(
      currentBudget.totalPrice,
      referenceBudget.totalPrice
    );
    
    const currentMarginPercentage = this.calculateMarginPercentage(currentBudget);
    const referenceMarginPercentage = this.calculateMarginPercentage(referenceBudget);
    const marginDeviation = this.calculateDeviation(
      currentMarginPercentage,
      referenceMarginPercentage
    );

    return {
      teamCosts: teamCostsDeviation,
      otherCosts: otherCostsDeviation,
      taxes: taxesDeviation,
      totalPrice: totalPriceDeviation,
      margin: marginDeviation
    };
  }

  /**
   * Calculate deviation between two values
   */
  private calculateDeviation(current: number, reference: number): {
    absolute: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  } {
    const absolute = current - reference;
    const percentage = reference !== 0 ? (absolute / reference) * 100 : 0;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(percentage) > 5) {
      trend = percentage > 0 ? 'up' : 'down';
    }

    return { absolute, percentage, trend };
  }

  /**
   * Calculate margin percentage from budget
   */
  private calculateMarginPercentage(budget: ConsolidatedBudget): number {
    if (budget.totalPrice === 0) return 0;
    return ((budget.totalPrice - budget.totalCosts) / budget.totalPrice) * 100;
  }

  /**
   * Create empty deviations for when there's no comparison data
   */
  private createEmptyDeviations(): BudgetDeviations {
    const emptyDeviation = { absolute: 0, percentage: 0, trend: 'stable' as const };
    
    return {
      teamCosts: emptyDeviation,
      otherCosts: emptyDeviation,
      taxes: emptyDeviation,
      totalPrice: emptyDeviation,
      margin: emptyDeviation
    };
  }

  /**
   * Calculate trends over time
   */
  private calculateTrends(
    currentBudget: ConsolidatedBudget,
    previousBudgets: ConsolidatedBudget[]
  ): BudgetTrends {
    
    const allBudgets = [...previousBudgets, currentBudget];
    
    const teamCostTrend = allBudgets.map((budget, index) => ({
      period: `Orçamento ${index + 1}`,
      value: budget.teamCosts.total,
      label: this.formatCurrency(budget.teamCosts.total)
    }));

    const marginTrend = allBudgets.map((budget, index) => ({
      period: `Orçamento ${index + 1}`,
      value: this.calculateMarginPercentage(budget),
      label: `${this.calculateMarginPercentage(budget).toFixed(1)}%`
    }));

    const priceTrend = allBudgets.map((budget, index) => ({
      period: `Orçamento ${index + 1}`,
      value: budget.totalPrice,
      label: this.formatCurrency(budget.totalPrice)
    }));

    const profitabilityTrend = allBudgets.map((budget, index) => {
      const profit = budget.totalPrice - budget.totalCosts - budget.taxes.total;
      return {
        period: `Orçamento ${index + 1}`,
        value: profit,
        label: this.formatCurrency(profit)
      };
    });

    return {
      teamCostTrend,
      marginTrend,
      priceTrend,
      profitabilityTrend
    };
  }

  /**
   * Generate recommendations based on analysis
   */
  private generateRecommendations(
    currentBudget: ConsolidatedBudget,
    deviations: BudgetDeviations,
    trends: BudgetTrends
  ): BudgetRecommendation[] {
    
    const recommendations: BudgetRecommendation[] = [];
    const marginPercentage = this.calculateMarginPercentage(currentBudget);

    // Margin-based recommendations
    if (marginPercentage < 10) {
      recommendations.push({
        type: 'margin_adjustment',
        priority: 'critical',
        title: 'Margem Crítica',
        description: 'A margem atual está abaixo do mínimo recomendado de 10%',
        impact: {
          financial: (currentBudget.totalPrice * 0.1) - (currentBudget.totalPrice - currentBudget.totalCosts),
          risk: 'high'
        },
        actionItems: [
          'Revisar custos de equipe',
          'Negociar melhores condições com fornecedores',
          'Ajustar preço de venda',
          'Otimizar carga tributária'
        ]
      });
    } else if (marginPercentage < 15) {
      recommendations.push({
        type: 'margin_adjustment',
        priority: 'high',
        title: 'Margem Baixa',
        description: 'A margem atual está abaixo do recomendado de 15%',
        impact: {
          financial: (currentBudget.totalPrice * 0.15) - (currentBudget.totalPrice - currentBudget.totalCosts),
          risk: 'medium'
        },
        actionItems: [
          'Analisar possibilidade de aumento de preço',
          'Revisar eficiência da equipe',
          'Buscar otimizações de custo'
        ]
      });
    }

    // Team cost recommendations
    const teamCostPercentage = (currentBudget.teamCosts.total / currentBudget.totalPrice) * 100;
    if (teamCostPercentage > 70) {
      recommendations.push({
        type: 'cost_optimization',
        priority: 'high',
        title: 'Custos de Equipe Elevados',
        description: `Custos de equipe representam ${teamCostPercentage.toFixed(1)}% do preço total`,
        impact: {
          financial: currentBudget.teamCosts.total * 0.1,
          risk: 'medium'
        },
        actionItems: [
          'Revisar dimensionamento da equipe',
          'Analisar produtividade por membro',
          'Considerar terceirização de atividades específicas',
          'Otimizar escalas de trabalho'
        ]
      });
    }

    // Tax optimization recommendations
    const taxPercentage = (currentBudget.taxes.total / currentBudget.totalPrice) * 100;
    if (taxPercentage > 30) {
      recommendations.push({
        type: 'cost_optimization',
        priority: 'medium',
        title: 'Carga Tributária Elevada',
        description: `Impostos representam ${taxPercentage.toFixed(1)}% do preço total`,
        impact: {
          financial: currentBudget.taxes.total * 0.1,
          risk: 'low'
        },
        actionItems: [
          'Revisar regime tributário',
          'Consultar especialista em planejamento tributário',
          'Analisar benefícios fiscais disponíveis'
        ]
      });
    }

    // Trend-based recommendations
    if (deviations.margin.trend === 'down' && Math.abs(deviations.margin.percentage) > 10) {
      recommendations.push({
        type: 'risk_mitigation',
        priority: 'high',
        title: 'Tendência de Queda na Margem',
        description: `Margem reduziu ${Math.abs(deviations.margin.percentage).toFixed(1)}% em relação ao orçamento anterior`,
        impact: {
          financial: Math.abs(deviations.margin.absolute),
          risk: 'high'
        },
        actionItems: [
          'Identificar causas da redução de margem',
          'Implementar controles de custo mais rigorosos',
          'Revisar estratégia de precificação'
        ]
      });
    }

    // Pricing strategy recommendations
    if (deviations.totalPrice.trend === 'up' && deviations.totalPrice.percentage > 20) {
      recommendations.push({
        type: 'pricing_strategy',
        priority: 'medium',
        title: 'Aumento Significativo de Preço',
        description: `Preço aumentou ${deviations.totalPrice.percentage.toFixed(1)}% em relação ao orçamento anterior`,
        impact: {
          financial: deviations.totalPrice.absolute,
          risk: 'medium'
        },
        actionItems: [
          'Validar competitividade do preço no mercado',
          'Preparar justificativas para o aumento',
          'Considerar estratégia de implementação gradual'
        ]
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Generate alerts based on budget analysis
   */
  private generateAlerts(
    currentBudget: ConsolidatedBudget,
    deviations: BudgetDeviations
  ): BudgetAlert[] {
    
    const alerts: BudgetAlert[] = [];
    const marginPercentage = this.calculateMarginPercentage(currentBudget);

    // Critical margin alert
    if (marginPercentage < 5) {
      alerts.push({
        type: 'error',
        category: 'margin',
        title: 'Margem Crítica',
        message: 'Margem abaixo de 5% - risco de prejuízo',
        threshold: 5,
        currentValue: marginPercentage,
        suggestedAction: 'Revisar custos ou aumentar preço imediatamente'
      });
    } else if (marginPercentage < 10) {
      alerts.push({
        type: 'warning',
        category: 'margin',
        title: 'Margem Baixa',
        message: 'Margem abaixo do recomendado',
        threshold: 10,
        currentValue: marginPercentage,
        suggestedAction: 'Considerar ajustes de custo ou preço'
      });
    }

    // Cost deviation alerts
    if (Math.abs(deviations.teamCosts.percentage) > 15) {
      alerts.push({
        type: 'warning',
        category: 'costs',
        title: 'Variação Significativa em Custos de Equipe',
        message: `Custos de equipe ${deviations.teamCosts.trend === 'up' ? 'aumentaram' : 'diminuíram'} ${Math.abs(deviations.teamCosts.percentage).toFixed(1)}%`,
        currentValue: deviations.teamCosts.percentage,
        suggestedAction: 'Revisar dimensionamento e custos da equipe'
      });
    }

    // Price deviation alerts
    if (Math.abs(deviations.totalPrice.percentage) > 25) {
      alerts.push({
        type: 'info',
        category: 'pricing',
        title: 'Variação Significativa no Preço',
        message: `Preço total ${deviations.totalPrice.trend === 'up' ? 'aumentou' : 'diminuiu'} ${Math.abs(deviations.totalPrice.percentage).toFixed(1)}%`,
        currentValue: deviations.totalPrice.percentage,
        suggestedAction: 'Validar impacto competitivo da mudança de preço'
      });
    }

    // Monthly budget consistency alerts
    const monthlyMargins = currentBudget.monthlyBreakdown.map(month => month.margin);
    const marginVariation = this.calculateVariationCoefficient(monthlyMargins);
    
    if (marginVariation > 20) {
      alerts.push({
        type: 'warning',
        category: 'trend',
        title: 'Alta Variação nas Margens Mensais',
        message: 'Margens mensais apresentam alta variabilidade',
        currentValue: marginVariation,
        suggestedAction: 'Revisar distribuição de custos ao longo do período'
      });
    }

    return alerts;
  }

  /**
   * Calculate coefficient of variation for an array of values
   */
  private calculateVariationCoefficient(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);
    
    return mean !== 0 ? (standardDeviation / mean) * 100 : 0;
  }

  /**
   * Format currency value
   */
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  /**
   * Get budget health score (0-100)
   */
  getBudgetHealthScore(budget: ConsolidatedBudget): {
    score: number;
    category: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    factors: Array<{
      name: string;
      score: number;
      weight: number;
      description: string;
    }>;
  } {
    const marginPercentage = this.calculateMarginPercentage(budget);
    const teamCostPercentage = (budget.teamCosts.total / budget.totalPrice) * 100;
    const taxPercentage = (budget.taxes.total / budget.totalPrice) * 100;
    
    const factors = [
      {
        name: 'Margem de Lucro',
        score: this.scoreMargin(marginPercentage),
        weight: 0.4,
        description: `Margem atual: ${marginPercentage.toFixed(1)}%`
      },
      {
        name: 'Eficiência de Custos',
        score: this.scoreTeamCosts(teamCostPercentage),
        weight: 0.3,
        description: `Custos de equipe: ${teamCostPercentage.toFixed(1)}% do total`
      },
      {
        name: 'Carga Tributária',
        score: this.scoreTaxes(taxPercentage),
        weight: 0.2,
        description: `Impostos: ${taxPercentage.toFixed(1)}% do total`
      },
      {
        name: 'Consistência Mensal',
        score: this.scoreConsistency(budget.monthlyBreakdown),
        weight: 0.1,
        description: 'Variabilidade das margens mensais'
      }
    ];

    const weightedScore = factors.reduce((sum, factor) => 
      sum + (factor.score * factor.weight), 0
    );

    let category: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    if (weightedScore >= 90) category = 'excellent';
    else if (weightedScore >= 75) category = 'good';
    else if (weightedScore >= 60) category = 'fair';
    else if (weightedScore >= 40) category = 'poor';
    else category = 'critical';

    return {
      score: Math.round(weightedScore),
      category,
      factors
    };
  }

  private scoreMargin(marginPercentage: number): number {
    if (marginPercentage >= 20) return 100;
    if (marginPercentage >= 15) return 80;
    if (marginPercentage >= 10) return 60;
    if (marginPercentage >= 5) return 40;
    return 20;
  }

  private scoreTeamCosts(teamCostPercentage: number): number {
    if (teamCostPercentage <= 50) return 100;
    if (teamCostPercentage <= 60) return 80;
    if (teamCostPercentage <= 70) return 60;
    if (teamCostPercentage <= 80) return 40;
    return 20;
  }

  private scoreTaxes(taxPercentage: number): number {
    if (taxPercentage <= 20) return 100;
    if (taxPercentage <= 25) return 80;
    if (taxPercentage <= 30) return 60;
    if (taxPercentage <= 35) return 40;
    return 20;
  }

  private scoreConsistency(monthlyBreakdown: MonthlyBudget[]): number {
    const margins = monthlyBreakdown.map(month => month.margin);
    const variation = this.calculateVariationCoefficient(margins);
    
    if (variation <= 5) return 100;
    if (variation <= 10) return 80;
    if (variation <= 15) return 60;
    if (variation <= 20) return 40;
    return 20;
  }
}