"use client"

import { useState, useEffect } from "react"
import { Calculator, DollarSign, TrendingUp, Save, ArrowLeft, Percent, FileText, Printer as PrinterIcon, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Printer } from "./types"

interface PrinterPricingModuleProps {
  printer: Printer | null
  onBack: () => void
  onUpdatePrinter: (printer: Printer) => void
}

export function PrinterPricingModule({ printer, onBack, onUpdatePrinter }: PrinterPricingModuleProps) {
  // Estados para dados básicos da impressora (quando é nova)
  const [isNewPrinter, setIsNewPrinter] = useState(!printer)
  const [printerData, setPrinterData] = useState({
    modelo: printer?.modelo || '',
    marca: printer?.marca || '',
    tipo: printer?.tipo || 'Laser P&B',
    velocidadePPM: printer?.velocidadePPM || 0,
    custoAquisicao: printer?.custoAquisicao || 0,
    custoMensalLocacao: printer?.custoMensalLocacao || 0,
    vidaUtilPaginas: printer?.vidaUtilPaginas || 0,
    consumoEnergia: printer?.consumoEnergia || 0,
    custoManutencaoMensal: printer?.custoManutencaoMensal || 0,
    ativo: printer?.ativo ?? true
  })
  // Estados para precificação
  const [custoBase, setCustoBase] = useState(printer?.custoAquisicao || 0)
  const [margemDesejada, setMargemDesejada] = useState(printer?.precificacao?.margemDesejada || 25)
  const [regimeTributario, setRegimeTributario] = useState(printer?.precificacao?.regimeTributario || 'Simples Nacional')
  const [icmsCompra, setIcmsCompra] = useState(printer?.precificacao?.icmsCompra || 12)
  const [icmsVenda, setIcmsVenda] = useState(printer?.precificacao?.icmsVenda || 18)
  const [ipiCompra, setIpiCompra] = useState(printer?.precificacao?.ipiCompra || 0)
  const [pisCofinsSaida, setPisCofinsSaida] = useState(printer?.precificacao?.pisCofinsSaida || 3.65)
  const [comissaoVenda, setComissaoVenda] = useState(printer?.precificacao?.comissaoVenda || 3)
  const [custosOperacionais, setCustosOperacionais] = useState(printer?.precificacao?.custosOperacionais || 8)

  // Estados para suprimentos
  const [suprimentos, setSuprimentos] = useState({
    tonerMono: {
      custo: 0,
      rendimento: 0,
      custoPorPagina: 0
    },
    tonerCiano: {
      custo: 0,
      rendimento: 0,
      custoPorPagina: 0
    },
    tonerMagenta: {
      custo: 0,
      rendimento: 0,
      custoPorPagina: 0
    },
    tonerAmarelo: {
      custo: 0,
      rendimento: 0,
      custoPorPagina: 0
    },
    fotoconductor: {
      custo: 0,
      rendimento: 0,
      custoPorPagina: 0
    },
    fusor: {
      custo: 0,
      rendimento: 0,
      custoPorPagina: 0
    }
  })

  // Estados calculados
  const [custoPaginaMono, setCustoPaginaMono] = useState(0)
  const [custoPaginaColor, setCustoPaginaColor] = useState(0)
  const [precoVendaSugerido, setPrecoVendaSugerido] = useState(0)
  const [periodosLocacao, setPeriodosLocacao] = useState<any>({})
  const [breakdown, setBreakdown] = useState<any>({})
  const [dre, setDre] = useState<any>({})

  // Regimes tributários disponíveis
  const regimesTributarios = [
    'Simples Nacional',
    'Lucro Presumido',
    'Lucro Real'
  ]

  // Função para calcular custo por página dos suprimentos
  const calcularCustoSuprimentos = () => {
    // Calcular custo por página de cada suprimento
    const suprimentosAtualizados = { ...suprimentos }
    
    Object.keys(suprimentosAtualizados).forEach(key => {
      const suprimento = suprimentosAtualizados[key as keyof typeof suprimentos]
      if (suprimento.custo > 0 && suprimento.rendimento > 0) {
        suprimento.custoPorPagina = suprimento.custo / suprimento.rendimento
      } else {
        suprimento.custoPorPagina = 0
      }
    })

    setSuprimentos(suprimentosAtualizados)

    // Calcular custo total por página mono (toner mono + fotoconductor + fusor)
    const custoMono = 
      suprimentosAtualizados.tonerMono.custoPorPagina +
      suprimentosAtualizados.fotoconductor.custoPorPagina +
      suprimentosAtualizados.fusor.custoPorPagina

    // Calcular custo total por página colorida (todos os toners + fotoconductor + fusor)
    const custoColor = 
      suprimentosAtualizados.tonerMono.custoPorPagina +
      suprimentosAtualizados.tonerCiano.custoPorPagina +
      suprimentosAtualizados.tonerMagenta.custoPorPagina +
      suprimentosAtualizados.tonerAmarelo.custoPorPagina +
      suprimentosAtualizados.fotoconductor.custoPorPagina +
      suprimentosAtualizados.fusor.custoPorPagina

    setCustoPaginaMono(custoMono)
    setCustoPaginaColor(custoColor)
  }

  // Função para atualizar suprimento
  const atualizarSuprimento = (tipo: keyof typeof suprimentos, campo: 'custo' | 'rendimento', valor: number) => {
    setSuprimentos(prev => ({
      ...prev,
      [tipo]: {
        ...prev[tipo],
        [campo]: valor
      }
    }))
  }

  // Função para calcular preços
  const calcularPrecos = () => {
    // Custo base com impostos de entrada
    const custoComIcms = custoBase / (1 - (icmsCompra / 100))
    const custoComIpi = custoComIcms * (1 + (ipiCompra / 100))
    const custoTotalEntrada = custoComIpi

    // Cálculo de impostos de saída baseado no regime
    let aliquotaImpostos = 0
    switch (regimeTributario) {
      case 'Simples Nacional':
        aliquotaImpostos = 6.0 // Anexo I - Comércio
        break
      case 'Lucro Presumido':
        aliquotaImpostos = icmsVenda + pisCofinsSaida + 1.2 // IRPJ + CSLL presumido
        break
      case 'Lucro Real':
        aliquotaImpostos = icmsVenda + pisCofinsSaida + 2.5 // IRPJ + CSLL real
        break
    }

    // Cálculo do preço de venda
    const custoComOperacionais = custoTotalEntrada * (1 + (custosOperacionais / 100))
    const custoComComissao = custoComOperacionais * (1 + (comissaoVenda / 100))
    const custoComMargem = custoComComissao * (1 + (margemDesejada / 100))
    const precoVenda = custoComMargem / (1 - (aliquotaImpostos / 100))

    setPrecoVendaSugerido(precoVenda)

    // Cálculo de locação para diferentes períodos
    const periodos = [12, 24, 36, 48, 60]
    const periodosCalc: any = {}

    periodos.forEach(meses => {
      // Fator de desconto baseado no período (quanto maior o período, menor o valor mensal)
      let fatorDesconto = 1.0
      switch (meses) {
        case 12: fatorDesconto = 1.0; break    // 100% - sem desconto
        case 24: fatorDesconto = 0.92; break   // 8% desconto
        case 36: fatorDesconto = 0.85; break   // 15% desconto
        case 48: fatorDesconto = 0.80; break   // 20% desconto
        case 60: fatorDesconto = 0.75; break   // 25% desconto
      }

      const valorTotal = precoVenda * fatorDesconto
      const valorMensal = valorTotal / meses
      const paybackMeses = (custoTotalEntrada / valorMensal)
      const roi = ((valorTotal - custoTotalEntrada) / custoTotalEntrada) * 100

      periodosCalc[meses] = {
        valorMensal,
        valorTotal,
        paybackMeses,
        roi
      }
    })

    setPeriodosLocacao(periodosCalc)

    // Breakdown detalhado
    setBreakdown({
      custoBase,
      custoTotalEntrada,
      custoComOperacionais,
      custoComComissao,
      custoComMargem,
      impostosSaida: precoVenda * (aliquotaImpostos / 100),
      margemLiquida: precoVenda - custoComMargem,
      aliquotaImpostos
    })

    // DRE Simplificado (baseado no período de 36 meses como exemplo)
    const periodo36 = periodosCalc[36]
    if (periodo36) {
      const receitaBruta = periodo36.valorTotal
      const impostos = receitaBruta * (aliquotaImpostos / 100)
      const receitaLiquida = receitaBruta - impostos
      const custoMercadoria = custoTotalEntrada
      const lucroBruto = receitaLiquida - custoMercadoria
      const despesasOperacionais = custoComOperacionais - custoTotalEntrada
      const despesasComissao = custoComComissao - custoComOperacionais
      const lucroOperacional = lucroBruto - despesasOperacionais - despesasComissao
      const lucroLiquido = lucroOperacional

      setDre({
        receitaBruta,
        impostos,
        receitaLiquida,
        custoMercadoria,
        lucroBruto,
        despesasOperacionais,
        despesasComissao,
        lucroOperacional,
        lucroLiquido,
        margemBruta: (lucroBruto / receitaBruta) * 100,
        margemLiquida: (lucroLiquido / receitaBruta) * 100
      })
    }
  }

  // Recalcular quando qualquer valor mudar
  // Sincronizar custo base com dados da impressora
  useEffect(() => {
    setCustoBase(printerData.custoAquisicao)
  }, [printerData.custoAquisicao])

  useEffect(() => {
    calcularPrecos()
  }, [custoBase, margemDesejada, regimeTributario, icmsCompra, icmsVenda, ipiCompra, pisCofinsSaida, comissaoVenda, custosOperacionais])

  // Recalcular custos de suprimentos quando valores mudarem
  useEffect(() => {
    calcularCustoSuprimentos()
  }, [suprimentos.tonerMono.custo, suprimentos.tonerMono.rendimento,
      suprimentos.tonerCiano.custo, suprimentos.tonerCiano.rendimento,
      suprimentos.tonerMagenta.custo, suprimentos.tonerMagenta.rendimento,
      suprimentos.tonerAmarelo.custo, suprimentos.tonerAmarelo.rendimento,
      suprimentos.fotoconductor.custo, suprimentos.fotoconductor.rendimento,
      suprimentos.fusor.custo, suprimentos.fusor.rendimento])

  const handleSave = () => {
    // Validar dados básicos se for nova impressora
    if (isNewPrinter && (!printerData.modelo || !printerData.marca)) {
      alert('Por favor, preencha pelo menos o modelo e marca da impressora.')
      return
    }

    const printerToSave: Printer = isNewPrinter ? {
      id: Date.now().toString(),
      modelo: printerData.modelo,
      marca: printerData.marca,
      tipo: printerData.tipo as any,
      velocidadePPM: printerData.velocidadePPM,
      custoAquisicao: printerData.custoAquisicao,
      custoMensalLocacao: printerData.custoMensalLocacao,
      vidaUtilPaginas: printerData.vidaUtilPaginas,
      consumoEnergia: printerData.consumoEnergia,
      custoManutencaoMensal: printerData.custoManutencaoMensal,
      ativo: printerData.ativo,
      precificacao: {
        custoBase,
        margemDesejada,
        regimeTributario,
        icmsCompra,
        icmsVenda,
        ipiCompra,
        pisCofinsSaida,
        comissaoVenda,
        custosOperacionais,
        precoVendaSugerido,
        periodosLocacao,
        calculadoEm: new Date().toISOString()
      }
    } : {
      ...printer!,
      precificacao: {
        custoBase,
        margemDesejada,
        regimeTributario,
        icmsCompra,
        icmsVenda,
        ipiCompra,
        pisCofinsSaida,
        comissaoVenda,
        custosOperacionais,
        precoVendaSugerido,
        periodosLocacao,
        calculadoEm: new Date().toISOString()
      }
    }

    onUpdatePrinter(printerToSave)
    alert(isNewPrinter ? 'Impressora cadastrada e precificada com sucesso!' : 'Precificação salva com sucesso!')
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-6">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Formulário de dados básicos da impressora (se for nova) */}
      {isNewPrinter && (
        <Card className="mb-6 border-slate-600 bg-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <PrinterIcon className="h-5 w-5 text-white" />
              Dados da Nova Impressora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-white">Marca *</Label>
                <Input
                  value={printerData.marca}
                  onChange={(e) => setPrinterData({...printerData, marca: e.target.value})}
                  placeholder="Ex: HP, Canon, Xerox"
                />
              </div>
              <div>
                <Label className="text-white">Modelo *</Label>
                <Input
                  value={printerData.modelo}
                  onChange={(e) => setPrinterData({...printerData, modelo: e.target.value})}
                  placeholder="Ex: LaserJet Pro M404n"
                />
              </div>
              <div>
                <Label className="text-white">Tipo</Label>
                <Select value={printerData.tipo} onValueChange={(value: any) => setPrinterData({...printerData, tipo: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laser P&B">Laser P&B</SelectItem>
                    <SelectItem value="Laser Colorida">Laser Colorida</SelectItem>
                    <SelectItem value="Jato de Tinta">Jato de Tinta</SelectItem>
                    <SelectItem value="Multifuncional P&B">Multifuncional P&B</SelectItem>
                    <SelectItem value="Multifuncional Colorida">Multifuncional Colorida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white">Velocidade (PPM)</Label>
                <Input
                  type="number"
                  value={printerData.velocidadePPM || ''}
                  onChange={(e) => setPrinterData({...printerData, velocidadePPM: Number(e.target.value)})}
                  placeholder="Páginas por minuto"
                />
              </div>
              <div>
                <Label className="text-white">Custo de Aquisição (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={printerData.custoAquisicao || ''}
                  onChange={(e) => setPrinterData({...printerData, custoAquisicao: Number(e.target.value)})}
                  placeholder="Valor de compra"
                />
              </div>
              <div>
                <Label className="text-white">Vida Útil (páginas)</Label>
                <Input
                  type="number"
                  value={printerData.vidaUtilPaginas || ''}
                  onChange={(e) => setPrinterData({...printerData, vidaUtilPaginas: Number(e.target.value)})}
                  placeholder="Total de páginas na vida útil"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulário de suprimentos (se for nova impressora) */}
      {isNewPrinter && (
        <Card className="mb-6 border-slate-600 bg-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Package className="h-5 w-5 text-white" />
              Suprimentos e Custo por Página
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Toner Mono */}
              <div className="space-y-4">
                <h4 className="font-semibold text-white">Toner Monocromático</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-white">Custo (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={suprimentos.tonerMono.custo || ''}
                      onChange={(e) => atualizarSuprimento('tonerMono', 'custo', Number(e.target.value))}
                      placeholder="Ex: 180.00"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-white">Rendimento (páginas)</Label>
                    <Input
                      type="number"
                      value={suprimentos.tonerMono.rendimento || ''}
                      onChange={(e) => atualizarSuprimento('tonerMono', 'rendimento', Number(e.target.value))}
                      placeholder="Ex: 2300"
                    />
                  </div>
                </div>
                <div className="text-sm text-blue-300 font-medium">
                  Custo/página: R$ {suprimentos.tonerMono.custoPorPagina.toFixed(4)}
                </div>
              </div>

              {/* Toners Coloridos */}
              <div className="space-y-4">
                <h4 className="font-semibold text-white">Toners Coloridos</h4>
                
                {/* Toner Ciano */}
                <div>
                  <Label className="text-xs text-cyan-300">Toner Ciano</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={suprimentos.tonerCiano.custo || ''}
                      onChange={(e) => atualizarSuprimento('tonerCiano', 'custo', Number(e.target.value))}
                      placeholder="Custo (R$)"
                    />
                    <Input
                      type="number"
                      value={suprimentos.tonerCiano.rendimento || ''}
                      onChange={(e) => atualizarSuprimento('tonerCiano', 'rendimento', Number(e.target.value))}
                      placeholder="Rendimento"
                    />
                  </div>
                </div>

                {/* Toner Magenta */}
                <div>
                  <Label className="text-xs text-pink-300">Toner Magenta</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={suprimentos.tonerMagenta.custo || ''}
                      onChange={(e) => atualizarSuprimento('tonerMagenta', 'custo', Number(e.target.value))}
                      placeholder="Custo (R$)"
                    />
                    <Input
                      type="number"
                      value={suprimentos.tonerMagenta.rendimento || ''}
                      onChange={(e) => atualizarSuprimento('tonerMagenta', 'rendimento', Number(e.target.value))}
                      placeholder="Rendimento"
                    />
                  </div>
                </div>

                {/* Toner Amarelo */}
                <div>
                  <Label className="text-xs text-yellow-300">Toner Amarelo</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={suprimentos.tonerAmarelo.custo || ''}
                      onChange={(e) => atualizarSuprimento('tonerAmarelo', 'custo', Number(e.target.value))}
                      placeholder="Custo (R$)"
                    />
                    <Input
                      type="number"
                      value={suprimentos.tonerAmarelo.rendimento || ''}
                      onChange={(e) => atualizarSuprimento('tonerAmarelo', 'rendimento', Number(e.target.value))}
                      placeholder="Rendimento"
                    />
                  </div>
                </div>
              </div>

              {/* Fotoconductor */}
              <div className="space-y-4">
                <h4 className="font-semibold text-white">Fotoconductor</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-white">Custo (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={suprimentos.fotoconductor.custo || ''}
                      onChange={(e) => atualizarSuprimento('fotoconductor', 'custo', Number(e.target.value))}
                      placeholder="Ex: 350.00"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-white">Rendimento (páginas)</Label>
                    <Input
                      type="number"
                      value={suprimentos.fotoconductor.rendimento || ''}
                      onChange={(e) => atualizarSuprimento('fotoconductor', 'rendimento', Number(e.target.value))}
                      placeholder="Ex: 12000"
                    />
                  </div>
                </div>
                <div className="text-sm text-blue-300 font-medium">
                  Custo/página: R$ {suprimentos.fotoconductor.custoPorPagina.toFixed(4)}
                </div>
              </div>

              {/* Fusor */}
              <div className="space-y-4">
                <h4 className="font-semibold text-white">Fusor</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-white">Custo (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={suprimentos.fusor.custo || ''}
                      onChange={(e) => atualizarSuprimento('fusor', 'custo', Number(e.target.value))}
                      placeholder="Ex: 450.00"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-white">Rendimento (páginas)</Label>
                    <Input
                      type="number"
                      value={suprimentos.fusor.rendimento || ''}
                      onChange={(e) => atualizarSuprimento('fusor', 'rendimento', Number(e.target.value))}
                      placeholder="Ex: 100000"
                    />
                  </div>
                </div>
                <div className="text-sm text-blue-300 font-medium">
                  Custo/página: R$ {suprimentos.fusor.custoPorPagina.toFixed(4)}
                </div>
              </div>
            </div>

            {/* Resumo dos custos por página */}
            <Separator className="my-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-700 border-slate-600">
                <CardContent className="p-4 text-center">
                  <h4 className="font-semibold text-white mb-2">Custo por Página Mono</h4>
                  <div className="text-2xl font-bold text-blue-300">
                    R$ {custoPaginaMono.toFixed(4)}
                  </div>
                  <div className="text-xs text-gray-300 mt-1">
                    Toner + Fotoconductor + Fusor
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-700 border-slate-600">
                <CardContent className="p-4 text-center">
                  <h4 className="font-semibold text-white mb-2">Custo por Página Colorida</h4>
                  <div className="text-2xl font-bold text-blue-300">
                    R$ {custoPaginaColor.toFixed(4)}
                  </div>
                  <div className="text-xs text-gray-300 mt-1">
                    Todos os Toners + Fotoconductor + Fusor
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <Card className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                {isNewPrinter ? 'Nova Impressora - Precificação' : 'Precificação de Impressora'}
              </h1>
              <p className="text-blue-100">
                {isNewPrinter ? `${printerData.marca} ${printerData.modelo}` : `${printer?.marca} ${printer?.modelo}`}
              </p>
              <Badge variant="secondary" className="mt-2">
                {isNewPrinter ? printerData.tipo : printer?.tipo}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100">Preço de Venda</div>
              <div className="text-3xl font-bold">{formatCurrency(precoVendaSugerido)}</div>
              <div className="text-sm text-blue-100">
                Locação 36m: {periodosLocacao[36] ? formatCurrency(periodosLocacao[36].valorMensal) : 'R$ 0,00'}/mês
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parâmetros de Entrada */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Custos e Parâmetros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Custo Base (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={custoBase}
                  onChange={(e) => setCustoBase(Number(e.target.value))}
                  placeholder="Custo de aquisição"
                />
              </div>

              <div>
                <Label>Margem Desejada (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={margemDesejada}
                  onChange={(e) => setMargemDesejada(Number(e.target.value))}
                  placeholder="Margem de lucro desejada"
                />
              </div>

              <div>
                <Label>Regime Tributário</Label>
                <Select value={regimeTributario} onValueChange={setRegimeTributario}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {regimesTributarios.map(regime => (
                      <SelectItem key={regime} value={regime}>{regime}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Comissão de Venda (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={comissaoVenda}
                  onChange={(e) => setComissaoVenda(Number(e.target.value))}
                  placeholder="Comissão do vendedor"
                />
              </div>

              <div>
                <Label>Custos Operacionais (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={custosOperacionais}
                  onChange={(e) => setCustosOperacionais(Number(e.target.value))}
                  placeholder="Custos administrativos"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Impostos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>ICMS Compra (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={icmsCompra}
                  onChange={(e) => setIcmsCompra(Number(e.target.value))}
                  placeholder="ICMS na compra"
                />
              </div>

              <div>
                <Label>ICMS Venda (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={icmsVenda}
                  onChange={(e) => setIcmsVenda(Number(e.target.value))}
                  placeholder="ICMS na venda"
                />
              </div>

              <div>
                <Label>IPI Compra (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={ipiCompra}
                  onChange={(e) => setIpiCompra(Number(e.target.value))}
                  placeholder="IPI na compra"
                />
              </div>

              <div>
                <Label>PIS/COFINS Saída (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={pisCofinsSaida}
                  onChange={(e) => setPisCofinsSaida(Number(e.target.value))}
                  placeholder="PIS + COFINS na saída"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resultados e Análise */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Preços por Período de Contrato
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border">
                  <div className="text-sm text-gray-600">Preço de Venda à Vista</div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(precoVendaSugerido)}
                  </div>
                </div>

                <Separator />

                <h4 className="font-semibold text-slate-800">Valores de Locação por Período:</h4>
                <div className="space-y-3">
                  {[12, 24, 36, 48, 60].map(meses => {
                    const periodo = periodosLocacao[meses]
                    if (!periodo) return null
                    
                    return (
                      <div key={meses} className="p-3 border border-slate-300 rounded-lg bg-slate-100">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-slate-800">{meses} meses</div>
                            <div className="text-sm text-slate-600">
                              Payback: {periodo.paybackMeses.toFixed(1)} meses
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">
                              {formatCurrency(periodo.valorMensal)}/mês
                            </div>
                            <div className="text-sm text-slate-600">
                              Total: {formatCurrency(periodo.valorTotal)}
                            </div>
                            <div className="text-sm text-green-600">
                              ROI: {periodo.roi.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                DRE - Demonstrativo de Resultado (36 meses)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between font-semibold border-b pb-2">
                    <span className="text-white">Receita Bruta:</span>
                    <span className="text-blue-400">{formatCurrency(dre.receitaBruta || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white">(-) Impostos:</span>
                    <span className="text-red-400">{formatCurrency(dre.impostos || 0)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-white">Receita Líquida:</span>
                    <span className="text-blue-400">{formatCurrency(dre.receitaLiquida || 0)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between">
                    <span className="text-white">(-) Custo da Mercadoria:</span>
                    <span className="text-red-400">{formatCurrency(dre.custoMercadoria || 0)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-white">Lucro Bruto:</span>
                    <span className="text-green-400">{formatCurrency(dre.lucroBruto || 0)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between">
                    <span className="text-white">(-) Despesas Operacionais:</span>
                    <span className="text-red-400">{formatCurrency(dre.despesasOperacionais || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white">(-) Comissões:</span>
                    <span className="text-red-400">{formatCurrency(dre.despesasComissao || 0)}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-white">Lucro Operacional:</span>
                    <span className="text-green-400">{formatCurrency(dre.lucroOperacional || 0)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span className="text-white">Lucro Líquido:</span>
                    <span className="text-green-400">{formatCurrency(dre.lucroLiquido || 0)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 p-3 bg-slate-700 border border-slate-600 rounded-lg">
                  <div className="text-center">
                    <div className="text-sm text-gray-300">Margem Bruta</div>
                    <div className="font-bold text-lg text-white">{formatPercent(dre.margemBruta || 0)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-300">Margem Líquida</div>
                    <div className="font-bold text-lg text-white">{formatPercent(dre.margemLiquida || 0)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Análise de Rentabilidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Margem Bruta:</span>
                    <div className="font-bold text-lg">
                      {formatPercent(((precoVendaSugerido - breakdown.custoTotalEntrada) / precoVendaSugerido) * 100)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Margem Líquida:</span>
                    <div className="font-bold text-lg">
                      {formatPercent(((breakdown.margemLiquida || 0) / precoVendaSugerido) * 100)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Markup:</span>
                    <div className="font-bold text-lg">
                      {(precoVendaSugerido / custoBase).toFixed(2)}x
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">ROI Locação (36m):</span>
                    <div className="font-bold text-lg">
                      {periodosLocacao[36] ? periodosLocacao[36].roi.toFixed(1) : '0.0'}%
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-yellow-800 mb-2">Recomendações:</h5>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Margem líquida ideal: 15-25%</li>
                    <li>• Payback locação: 30-36 meses</li>
                    <li>• Considere descontos por volume</li>
                    <li>• Monitore concorrência regularmente</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSave} className="w-full bg-green-600 hover:bg-green-700" size="lg">
            <Save className="h-4 w-4 mr-2" />
            Salvar Precificação
          </Button>
        </div>
      </div>
    </div>
  )
}