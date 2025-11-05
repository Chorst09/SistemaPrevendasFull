import { create } from 'zustand'
import type { TaxRegime } from '@/lib/types/tax-regimes'
import type { CostsExpenses } from '@/lib/types/costs-expenses'
import type { LaborCosts } from '@/lib/types/labor-costs'
import { initialTaxRegimes } from '@/lib/types/tax-regimes'
import { initialCostsExpenses } from '@/lib/types/costs-expenses'
import { initialLaborCosts } from '@/lib/types/labor-costs'

interface ConfigurationState {
  taxRegimes: TaxRegime[]
  costsExpenses: CostsExpenses
  laborCosts: LaborCosts
  
  // Getters
  getActiveTaxRegime: () => TaxRegime | null
  
  // Actions
  setTaxRegimes: (regimes: TaxRegime[]) => void
  setCostsExpenses: (costs: CostsExpenses) => void
  setLaborCosts: (labor: LaborCosts) => void
}

export const useConfigurationStore = create<ConfigurationState>((set, get) => ({
  taxRegimes: initialTaxRegimes || [],
  costsExpenses: initialCostsExpenses,
  laborCosts: initialLaborCosts,
  
  getActiveTaxRegime: () => {
    const { taxRegimes } = get()
    return taxRegimes.find(regime => regime.active) || null
  },
  
  setTaxRegimes: (regimes) => set({ taxRegimes: regimes }),
  setCostsExpenses: (costs) => set({ costsExpenses: costs }),
  setLaborCosts: (labor) => set({ laborCosts: labor }),
}))