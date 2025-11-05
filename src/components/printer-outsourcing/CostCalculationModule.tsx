"use client"

import { useState, useEffect } from "react"
import { Calculator, TrendingUp, DollarSign, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Printer, Suprimento, CustoPorPagina } from "./types"

interface CostCalculationModuleProps {
  printers: Printer[]
  suprimentos: Suprimento[]
}

export function CostCalculationModule({ printers, suprimentos }: CostCalculationModuleProps) {
  const [custosPorPagina, setCustosPorPagina] = useState<CustoPorPagina[]>([])
  const [custoEnergia] = useState(0.65) // R$ por kWh (média Brasil)

  useEffect(() => {
    calculateCostPerPage()
  }, [printers, suprimentos])

  const calculateCostPerPage = () => {
    const custos: CustoPorPagina[] = []

    printers.forEach(printer => {
      if (!printer.ativo) return

      const suprimentosPrinter = suprimentos.filter(s => s.printerId === printer.id)
      
      // Calcular custos de suprimentos
      const tonerPB = suprimentosPrinter.find(s => s.tipo === 'Toner P&B' || s.tipo === 'Toner Preto')
      const tonerCiano = suprimentosPrinter.find(s => s.tipo === 'Toner Ciano')
      const tonerMagenta = suprimentosPrinter.find(s => s.tipo === 'Toner Magenta')
      const tonerAmarelo = suprimentosPrinter.find(s => s.tipo === 'Toner Amarelo')
      const fotoconductor = suprimentosPrinter.find(s => s.tipo === 'Fotoconductor')

      // Custo por página - Toner P&B
      const custoTonerPB = tonerPB ? (tonerPB.custoUnitario / tonerPB.rendimentoPaginas) : 0

      // Custo por página - Toner Colorido (soma dos 3 toners coloridos)
      const custoTonerColor = (
        (tonerCiano ? (tonerCiano.custoUnitario / tonerCiano.rendimentoPaginas) : 0) +
        (tonerMagenta ? (tonerMagenta.custoUnitario / tonerMagenta.rendimentoPaginas) : 0) +
        (tonerAmarelo ? (tonerAmarelo.custoUnitario / tonerAmarelo.rendimentoPaginas) : 0)
      )

      // Custo por página - Fotoconductor
      const custoFotoconductorPagina = fotoconductor ? (fotoconductor.custoUnitario / fotoconductor.rendimentoPaginas) : 0

      // Custo por página - Manutenção (baseado na vida útil da impressora)
      const custoManutencaoPagina = printer.vidaUtilPaginas > 0 ? 
        (printer.custoManutencaoMensal * 12 * 5) / printer.vidaUtilPaginas : 0 // 5 anos de vida útil

      // Custo por página - Energia (baseado no consumo e páginas por mês estimadas)
      const paginasEstimadasMes = 2000 // Estimativa padrão
      const custoEnergiaPagina = printer.consumoEnergia > 0 ? 
        (printer.consumoEnergia * custoEnergia) / paginasEstimadasMes : 0

      // Custo por página - Depreciação (baseado no custo de aquisição e vida útil)
      const custoDepreciacaoPagina = printer.vidaUtilPaginas > 0 && printer.custoAquisicao > 0 ? 
        printer.custoAquisicao / printer.vidaUtilPaginas : 0

      // Totais
      const custoTotalPB = custoTonerPB + custoFotoconductorPagina + custoManutencaoPagina + custoEnergiaPagina + custoDepreciacaoPagina
      const custoTotalColor = custoTonerColor + custoFotoconductorPagina + custoManutencaoPagina + custoEnergiaPagina + custoDepreciacaoPagina

      custos.push({
        printerId: printer.id,
        custoTonerPB,
        custoTonerColor,
        custoFotoconductor: custoFotoconductorPagina,
        custoManutencao: custoManutencaoPagina,
        custoEnergia: custoEnergiaPagina,
        custoDepreciacao: custoDepreciacaoPagina,
        custoTotalPB,
        custoTotalColor
      })
    })

    setCustosPorPagina(custos)
  }

  const getPrinterName = (printerId: string) => {
    const printer = printers.find(p => p.id === printerId)
    return printer ? `${printer.marca} ${printer.modelo}` : 'Impressora não encontrada'
  }

  const getPrinter = (printerId: string) => {
    return printers.find(p => p.id === printerId)
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 4,
      maximumFractionDigits: 4
    })
  }

  const getSuprimentosCount = (printerId: string) => {
    return suprimentos.filter(s => s.printerId === printerId).length
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Cálculo de Custo por Página</h2>
        <Badge variant="outline" className="text-sm">
          Custo Energia: R$ {custoEnergia}/kWh
        </Badge>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Impressoras Ativas</p>
                <p className="text-2xl font-bold">{printers.filter(p => p.ativo).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Custo Médio P&B</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(custosPorPagina.reduce((acc, c) => acc + c.custoTotalPB, 0) / (custosPorPagina.length || 1))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Custo Médio Color</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(custosPorPagina.reduce((acc, c) => acc + c.custoTotalColor, 0) / (custosPorPagina.length || 1))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Total Suprimentos</p>
                <p className="text-2xl font-bold">{suprimentos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalhamento por Impressora */}
      <div className="space-y-4">
        {custosPorPagina.map((custo) => {
          const printer = getPrinter(custo.printerId)
          if (!printer) return null

          return (
            <Card key={custo.printerId} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{getPrinterName(custo.printerId)}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{printer.tipo}</Badge>
                    <Badge variant="secondary">{getSuprimentosCount(custo.printerId)} suprimentos</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Custo P&B */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-800 rounded"></div>
                      Impressão Preto & Branco
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Toner P&B:</span>
                        <span className="font-mono">{formatCurrency(custo.custoTonerPB)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fotoconductor:</span>
                        <span className="font-mono">{formatCurrency(custo.custoFotoconductor)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Manutenção:</span>
                        <span className="font-mono">{formatCurrency(custo.custoManutencao)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Energia:</span>
                        <span className="font-mono">{formatCurrency(custo.custoEnergia)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Depreciação:</span>
                        <span className="font-mono">{formatCurrency(custo.custoDepreciacao)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 font-bold">
                        <span>Total P&B:</span>
                        <span className="font-mono text-lg text-blue-600">{formatCurrency(custo.custoTotalPB)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Custo Colorido */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded"></div>
                      Impressão Colorida
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Toners Coloridos:</span>
                        <span className="font-mono">{formatCurrency(custo.custoTonerColor)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fotoconductor:</span>
                        <span className="font-mono">{formatCurrency(custo.custoFotoconductor)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Manutenção:</span>
                        <span className="font-mono">{formatCurrency(custo.custoManutencao)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Energia:</span>
                        <span className="font-mono">{formatCurrency(custo.custoEnergia)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Depreciação:</span>
                        <span className="font-mono">{formatCurrency(custo.custoDepreciacao)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 font-bold">
                        <span>Total Colorido:</span>
                        <span className="font-mono text-lg text-purple-600">{formatCurrency(custo.custoTotalColor)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informações Adicionais */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Velocidade:</span>
                      <p className="font-semibold">{printer.velocidadePPM} PPM</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Vida Útil:</span>
                      <p className="font-semibold">{printer.vidaUtilPaginas.toLocaleString()} páginas</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Consumo:</span>
                      <p className="font-semibold">{printer.consumoEnergia} kWh/mês</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Manutenção:</span>
                      <p className="font-semibold">R$ {printer.custoManutencaoMensal}/mês</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {custosPorPagina.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Calculator className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-2">Nenhum cálculo disponível</p>
            <p className="text-sm text-gray-400">
              Cadastre impressoras e suprimentos para visualizar os custos por página
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}