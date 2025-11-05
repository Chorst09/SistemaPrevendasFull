export interface LaborCosts {
  id: string
  // Encargos Sociais (CLT) - percentuais
  ferias: number
  umTercoFerias: number
  decimoTerceiro: number
  inssBase: number
  inssSistemaS: number
  inssFeriasDecimo: number
  fgts: number
  fgtsFeriasDecimo: number
  multaFgtsRescisao: number
  outros: number

  // Benefícios (CLT) - valores em reais
  valeTransporte: number
  planoSaude: number
  valeAlimentacao: number

  // Parâmetros Gerais
  salarioBasePadrao: number
  diasUteisNoMes: number
  horasPorDia: number

  // Campos calculados
  totalEncargos: number
  totalBeneficios: number
  custoHora: number
  valorVendaHora: number

  createdAt: Date
  updatedAt: Date
}

export const initialLaborCosts: LaborCosts = {
  id: "1",
  ferias: 8.33,
  umTercoFerias: 2.78,
  decimoTerceiro: 8.33,
  inssBase: 20,
  inssSistemaS: 7.8,
  inssFeriasDecimo: 1.52,
  fgts: 8,
  fgtsFeriasDecimo: 1.56,
  multaFgtsRescisao: 1.91,
  outros: 1,
  valeTransporte: 200,
  planoSaude: 300,
  valeAlimentacao: 550,
  salarioBasePadrao: 5000,
  diasUteisNoMes: 21,
  horasPorDia: 8,
  totalEncargos: 61.23,
  totalBeneficios: 1050,
  custoHora: 54.24,
  valorVendaHora: 90.03,
  createdAt: new Date(),
  updatedAt: new Date(),
}