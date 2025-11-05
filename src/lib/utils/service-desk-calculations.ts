/**
 * Utilitários para cálculos do Service Desk
 */

import { 
  ServiceDeskItem, 
  ServiceDeskProposal, 
  ServiceDeskServiceLevel,
  ServiceDeskClientData 
} from '@/lib/types/service-desk'
import { DEFAULT_SERVICE_DESK_METRICS } from '@/lib/constants/service-desk'

export interface ServiceDeskCalculationResult {
  monthlyCost: number
  annualCost: number
  setupCost: number
  totalIncludedHours: number
  estimatedAdditionalHours: number
  additionalHoursCost: number
  totalUsers: number
  averageCostPerUser: number
  estimatedTicketsPerMonth: number
  breakdown: {
    baseCosts: number
    additionalHours: number
    setup: number
  }
}

/**
 * Calcula custos completos de um item de serviço
 */
export function calculateServiceItemCosts(
  userCount: number,
  serviceLevel: ServiceDeskServiceLevel,
  baseCost: number,
  setupCost: number,
  includedHours: number,
  additionalHourCost: number
): ServiceDeskItem {
  const metrics = DEFAULT_SERVICE_DESK_METRICS[serviceLevel]
  
  // Cálculos básicos
  const monthlyCost = userCount * baseCost
  const annualCost = monthlyCost * 12
  const totalIncludedHours = userCount * includedHours
  
  // Estimativa de tickets e horas necessárias
  const estimatedTicketsPerMonth = userCount * metrics.averageTicketsPerUser
  const hoursPerTicket = metrics.averageResolutionTime / 60 // converter para horas
  const totalRequiredHours = estimatedTicketsPerMonth * hoursPerTicket
  
  // Calcular horas adicionais necessárias
  const additionalHours = Math.max(0, Math.ceil(totalRequiredHours - totalIncludedHours))
  const additionalHoursCost = additionalHours * additionalHourCost
  
  return {
    id: Date.now().toString(),
    serviceName: `Serviço ${serviceLevel}`,
    category: 'Outros' as any,
    serviceLevel,
    userCount,
    monthlyTickets: estimatedTicketsPerMonth,
    averageResolutionTime: metrics.averageResolutionTime,
    costPerUser: baseCost,
    setupCost,
    monthlyCost,
    annualCost,
    contractPeriod: 12,
    includedHours,
    additionalHours,
    additionalHoursCost,
    isFromCatalog: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

/**
 * Calcula totais de uma proposta completa
 */
export function calculateProposalTotals(serviceItems: ServiceDeskItem[]): ServiceDeskCalculationResult {
  const totals = serviceItems.reduce(
    (acc, item) => ({
      monthlyCost: acc.monthlyCost + item.monthlyCost,
      annualCost: acc.annualCost + item.annualCost,
      setupCost: acc.setupCost + item.setupCost,
      totalIncludedHours: acc.totalIncludedHours + (item.includedHours * item.userCount),
      estimatedAdditionalHours: acc.estimatedAdditionalHours + item.additionalHours,
      additionalHoursCost: acc.additionalHoursCost + item.additionalHoursCost,
      totalUsers: acc.totalUsers + item.userCount,
      estimatedTicketsPerMonth: acc.estimatedTicketsPerMonth + item.monthlyTickets
    }),
    {
      monthlyCost: 0,
      annualCost: 0,
      setupCost: 0,
      totalIncludedHours: 0,
      estimatedAdditionalHours: 0,
      additionalHoursCost: 0,
      totalUsers: 0,
      estimatedTicketsPerMonth: 0
    }
  )

  const averageCostPerUser = totals.totalUsers > 0 ? totals.monthlyCost / totals.totalUsers : 0

  return {
    ...totals,
    averageCostPerUser,
    breakdown: {
      baseCosts: totals.monthlyCost,
      additionalHours: totals.additionalHoursCost,
      setup: totals.setupCost
    }
  }
}

/**
 * Calcula ROI estimado do Service Desk
 */
export function calculateServiceDeskROI(
  proposal: ServiceDeskProposal,
  currentITCosts?: number
): {
  monthlySavings: number
  annualSavings: number
  roiPercentage: number
  paybackPeriodMonths: number
} {
  const currentMonthlyCosts = currentITCosts || (proposal.totals.totalUsers * 150) // Estimativa padrão
  const newMonthlyCosts = proposal.totals.monthlyCost + proposal.totals.additionalHoursCost
  
  const monthlySavings = Math.max(0, currentMonthlyCosts - newMonthlyCosts)
  const annualSavings = monthlySavings * 12
  
  const totalInvestment = proposal.totals.totalSetupCost + (newMonthlyCosts * 12)
  const roiPercentage = totalInvestment > 0 ? (annualSavings / totalInvestment) * 100 : 0
  
  const paybackPeriodMonths = monthlySavings > 0 ? 
    Math.ceil(proposal.totals.totalSetupCost / monthlySavings) : 0

  return {
    monthlySavings,
    annualSavings,
    roiPercentage,
    paybackPeriodMonths
  }
}

/**
 * Sugere otimizações para reduzir custos
 */
export function suggestOptimizations(proposal: ServiceDeskProposal): string[] {
  const suggestions: string[] = []
  const totals = proposal.totals

  // Verificar se há muitas horas adicionais
  if (totals.estimatedAdditionalHours > totals.totalIncludedHours * 0.5) {
    suggestions.push('Considere um nível de serviço superior com mais horas incluídas')
  }

  // Verificar custo por usuário
  const costPerUser = totals.monthlyCost / totals.totalUsers
  if (costPerUser > 100) {
    suggestions.push('Custo por usuário elevado - considere negociar desconto por volume')
  }

  // Verificar setup cost vs monthly
  if (totals.totalSetupCost > totals.monthlyCost * 3) {
    suggestions.push('Custo de setup alto - considere parcelar ou negociar redução')
  }

  // Sugerir consolidação de serviços
  if (proposal.serviceItems.length > 3) {
    suggestions.push('Considere consolidar serviços similares para simplificar gestão')
  }

  return suggestions
}

/**
 * Calcula métricas de performance esperadas
 */
export function calculateExpectedMetrics(proposal: ServiceDeskProposal) {
  const weightedMetrics = proposal.serviceItems.reduce(
    (acc, item) => {
      const metrics = DEFAULT_SERVICE_DESK_METRICS[item.serviceLevel]
      const weight = item.userCount / proposal.totals.totalUsers

      return {
        averageResolutionTime: acc.averageResolutionTime + (metrics.averageResolutionTime * weight),
        firstCallResolution: acc.firstCallResolution + (metrics.firstCallResolution * weight),
        customerSatisfaction: acc.customerSatisfaction + (metrics.customerSatisfaction * weight),
        slaCompliance: acc.slaCompliance + (metrics.slaCompliance * weight)
      }
    },
    {
      averageResolutionTime: 0,
      firstCallResolution: 0,
      customerSatisfaction: 0,
      slaCompliance: 0
    }
  )

  return {
    averageResolutionTime: Math.round(weightedMetrics.averageResolutionTime),
    firstCallResolution: Math.round(weightedMetrics.firstCallResolution * 100),
    customerSatisfaction: Math.round(weightedMetrics.customerSatisfaction * 100),
    slaCompliance: Math.round(weightedMetrics.slaCompliance * 100),
    estimatedTicketsPerMonth: proposal.totals.totalUsers * 3, // média
    costPerTicket: proposal.totals.monthlyCost / (proposal.totals.totalUsers * 3)
  }
}