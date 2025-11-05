export interface Printer {
  id: string
  modelo: string
  marca: string
  tipo: 'Laser P&B' | 'Laser Colorida' | 'Jato de Tinta' | 'Multifuncional P&B' | 'Multifuncional Colorida'
  velocidadePPM: number
  custoAquisicao: number
  custoMensalLocacao: number
  vidaUtilPaginas: number
  consumoEnergia: number // kWh por mês
  custoManutencaoMensal: number
  ativo: boolean
  // Dados de precificação
  precificacao?: {
    custoBase: number
    margemDesejada: number
    regimeTributario: string
    icmsCompra: number
    icmsVenda: number
    ipiCompra: number
    pisCofinsSaida: number
    comissaoVenda: number
    custosOperacionais: number
    precoVendaSugerido: number
    periodosLocacao: {
      [key: number]: {
        valorMensal: number
        valorTotal: number
        paybackMeses: number
        roi: number
      }
    }
    calculadoEm: string
  }
}

export interface Suprimento {
  id: string
  printerId: string
  tipo: 'Toner P&B' | 'Toner Ciano' | 'Toner Magenta' | 'Toner Amarelo' | 'Toner Preto' | 'Fotoconductor' | 'Kit Manutenção' | 'Papel'
  descricao: string
  rendimentoPaginas: number
  custoUnitario: number
  estoqueMinimo: number
  estoqueAtual: number
  fornecedor: string
  codigoOriginal: string
  compativel: boolean // true = compatível, false = original
}

export interface CustoPorPagina {
  printerId: string
  custoTonerPB: number
  custoTonerColor: number
  custoFotoconductor: number
  custoManutencao: number
  custoEnergia: number
  custoDepreciacao: number
  custoTotalPB: number
  custoTotalColor: number
}

export interface ContratoImpressao {
  id: string
  clienteId: string
  impressoras: {
    printerId: string
    quantidade: number
    volumeMensalPB: number
    volumeMensalColor: number
  }[]
  valorMensalTotal: number
  valorAnualTotal: number
  dataInicio: string
  dataFim: string
  status: 'Ativo' | 'Inativo' | 'Proposta'
}

export interface RelatorioConsumo {
  printerId: string
  mes: string
  paginasPB: number
  paginasColor: number
  custoSuprimentos: number
  custoManutencao: number
  custoTotal: number
}