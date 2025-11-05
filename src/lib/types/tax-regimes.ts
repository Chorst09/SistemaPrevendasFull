export interface TaxRegime {
  id: string
  name: string
  active: boolean
  pis: number
  cofins: number
  csll: number
  irpj: number
  icms: number
  iss: number
  basePresuncaoVenda: number
  basePresuncaoServico: number
  createdAt: Date
  updatedAt: Date
}

export const initialTaxRegimes: TaxRegime[] = [
  {
    id: "1",
    name: "Lucro Presumido",
    active: true,
    pis: 0.65,
    cofins: 3,
    csll: 9,
    irpj: 15,
    icms: 18,
    iss: 5,
    basePresuncaoVenda: 8,
    basePresuncaoServico: 32,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Lucro Real",
    active: false,
    pis: 1.65,
    cofins: 7.6,
    csll: 9,
    irpj: 15,
    icms: 18,
    iss: 5,
    basePresuncaoVenda: 0,
    basePresuncaoServico: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]