export interface CostsExpenses {
  id: string
  comissaoVenda: number
  comissaoLocacao: number
  comissaoServico: number
  margemLucroServico: number
  despesasAdmin: number
  outrasDespesas: number
  custoFinanceiroMensal: number
  taxaDescontoVPL: number
  depreciacao: number
  createdAt: Date
  updatedAt: Date
}

export const initialCostsExpenses: CostsExpenses = {
  id: "1",
  comissaoVenda: 3,
  comissaoLocacao: 10,
  comissaoServico: 5,
  margemLucroServico: 20,
  despesasAdmin: 2,
  outrasDespesas: 1,
  custoFinanceiroMensal: 1.17,
  taxaDescontoVPL: 15,
  depreciacao: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
}