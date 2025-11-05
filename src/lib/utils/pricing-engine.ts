import type { PricingCalculation } from "@/lib/types/pricing"
import type { TaxRegime } from "@/lib/types/tax-regimes"
import type { CostsExpenses } from "@/lib/types/costs-expenses"
import type { LaborCosts } from "@/lib/types/labor-costs"

export class PricingEngine {
  private taxRegime: TaxRegime | null = null
  private costsExpenses: CostsExpenses | null = null
  private laborCosts: LaborCosts | null = null

  // Método para configurar os dados do sistema
  configure(taxRegime: TaxRegime | null, costsExpenses: CostsExpenses | null, laborCosts: LaborCosts | null) {
    this.taxRegime = taxRegime
    this.costsExpenses = costsExpenses
    this.laborCosts = laborCosts
  }

  calculateSalesPrice(
    unitCost: number,
    quantity: number,
    desiredMargin: number
  ): PricingCalculation {
    const baseCost = unitCost * quantity
    
    // Usar margem desejada + comissão de venda das configurações
    const commissionRate = this.costsExpenses?.comissaoVenda || 3
    const marginCommission = baseCost * (desiredMargin / 100)
    const commission = baseCost * (commissionRate / 100)
    const totalMarginCommission = marginCommission + commission
    
    // Calcular impostos baseado no regime tributário ativo
    let taxes = 0
    if (this.taxRegime) {
      const grossRevenue = baseCost + totalMarginCommission
      const basePresuncao = grossRevenue * (this.taxRegime.basePresuncaoVenda / 100)
      
      // Impostos federais sobre a base de presunção
      const pis = basePresuncao * (this.taxRegime.pis / 100)
      const cofins = basePresuncao * (this.taxRegime.cofins / 100)
      const csll = basePresuncao * (this.taxRegime.csll / 100)
      const irpj = basePresuncao * (this.taxRegime.irpj / 100)
      
      // ICMS sobre a receita bruta
      const icms = grossRevenue * (this.taxRegime.icms / 100)
      
      taxes = pis + cofins + csll + irpj + icms
    } else {
      // Fallback para cálculo simples
      taxes = (baseCost + totalMarginCommission) * 0.15
    }
    
    const finalPrice = baseCost + totalMarginCommission + taxes

    return {
      baseCost,
      marginCommission: totalMarginCommission,
      taxes,
      finalPrice
    }
  }

  calculateRentalPrice(
    unitValue: number,
    quantity: number,
    contractPeriod: number,
    desiredMargin: number
  ): PricingCalculation {
    const baseCost = (unitValue * quantity) / contractPeriod
    
    // Usar margem desejada + comissão de locação das configurações
    const commissionRate = this.costsExpenses?.comissaoLocacao || 10
    const marginCommission = baseCost * (desiredMargin / 100)
    const commission = baseCost * (commissionRate / 100)
    const totalMarginCommission = marginCommission + commission
    
    // Calcular impostos baseado no regime tributário ativo
    let taxes = 0
    if (this.taxRegime) {
      const grossRevenue = baseCost + totalMarginCommission
      const basePresuncao = grossRevenue * (this.taxRegime.basePresuncaoVenda / 100)
      
      // Impostos federais sobre a base de presunção
      const pis = basePresuncao * (this.taxRegime.pis / 100)
      const cofins = basePresuncao * (this.taxRegime.cofins / 100)
      const csll = basePresuncao * (this.taxRegime.csll / 100)
      const irpj = basePresuncao * (this.taxRegime.irpj / 100)
      
      // ICMS sobre a receita bruta
      const icms = grossRevenue * (this.taxRegime.icms / 100)
      
      taxes = pis + cofins + csll + irpj + icms
    } else {
      // Fallback para cálculo simples
      taxes = (baseCost + totalMarginCommission) * 0.15
    }
    
    const finalPrice = baseCost + totalMarginCommission + taxes

    return {
      baseCost,
      marginCommission: totalMarginCommission,
      taxes,
      finalPrice
    }
  }

  calculateServicePrice(
    hourlyRate: number,
    totalHours: number,
    desiredMargin: number
  ): PricingCalculation {
    const baseCost = hourlyRate * totalHours
    
    // Usar margem desejada + comissão de serviço das configurações
    const commissionRate = this.costsExpenses?.comissaoServico || 5
    const marginCommission = baseCost * (desiredMargin / 100)
    const commission = baseCost * (commissionRate / 100)
    const totalMarginCommission = marginCommission + commission
    
    // Calcular impostos baseado no regime tributário ativo (serviços)
    let taxes = 0
    if (this.taxRegime) {
      const grossRevenue = baseCost + totalMarginCommission
      const basePresuncao = grossRevenue * (this.taxRegime.basePresuncaoServico / 100)
      
      // Impostos federais sobre a base de presunção
      const pis = basePresuncao * (this.taxRegime.pis / 100)
      const cofins = basePresuncao * (this.taxRegime.cofins / 100)
      const csll = basePresuncao * (this.taxRegime.csll / 100)
      const irpj = basePresuncao * (this.taxRegime.irpj / 100)
      
      // ISS sobre a receita bruta
      const iss = grossRevenue * (this.taxRegime.iss / 100)
      
      taxes = pis + cofins + csll + irpj + iss
    } else {
      // Fallback para cálculo simples
      taxes = (baseCost + totalMarginCommission) * 0.11
    }
    
    const finalPrice = baseCost + totalMarginCommission + taxes

    return {
      baseCost,
      marginCommission: totalMarginCommission,
      taxes,
      finalPrice
    }
  }

  calculateDIFAL(
    product: any,
    destinationUF: string,
    icmsRates: any,
    isFinalConsumer: boolean = false
  ): number {
    // DIFAL só se aplica quando consumidor final é contribuinte do ICMS
    if (!isFinalConsumer) {
      return 0
    }

    // Cálculo do DIFAL
    const icmsOrigin = 12 // SP (origem)
    const icmsDestination = icmsRates[destinationUF] || 7
    const difference = icmsDestination - icmsOrigin
    
    if (difference > 0) {
      return (product.totalCost * difference) / 100
    }
    
    return 0
  }

  calculateICMSST(
    product: any,
    icmsSTRate: number = 18
  ): number {
    // Cálculo simplificado do ICMS ST
    if (!product.icmsST) {
      return 0
    }

    // Base de cálculo do ICMS ST (valor do produto + margem presumida)
    const presumedMargin = 0.30 // 30% de margem presumida
    const stBase = product.totalCost * (1 + presumedMargin)
    
    // ICMS ST = (Base ST * Alíquota ST) - ICMS próprio
    const icmsSTValue = (stBase * icmsSTRate) / 100
    const icmsOwn = (product.totalCost * product.icmsSalePercent) / 100
    
    return Math.max(0, icmsSTValue - icmsOwn)
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }
}

// Instância global do pricing engine
export const pricingEngine = new PricingEngine()

// Hook para criar uma instância configurada do pricing engine
export function createConfiguredPricingEngine(
  taxRegime: TaxRegime | null,
  costsExpenses: CostsExpenses | null,
  laborCosts: LaborCosts | null
): PricingEngine {
  const engine = new PricingEngine()
  engine.configure(taxRegime, costsExpenses, laborCosts)
  return engine
}