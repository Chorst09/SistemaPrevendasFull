"use client"

import { useState } from "react"
import { ShoppingCart, Plus, Trash2, ArrowLeft, Laptop, Zap, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ModuleShortcuts } from "./ModuleShortcuts"
import type { ProductItem, ICMSInterstateRates } from "@/lib/types/pricing"
import { defaultICMSRates, stateNames } from "@/lib/types/pricing"
import { createConfiguredPricingEngine } from "@/lib/utils/pricing-engine"
import { useProposalStore } from "@/lib/stores/proposal-store"
import { useConfigurationStore } from "@/lib/stores/configuration-store"
import { usePricingIntegration } from "@/hooks/use-pricing-integration"
import { ProposalClientForm, type ClientData } from "@/components/calculators/ProposalClientForm"

interface SalesModuleProps {
  onBack: () => void
  onModuleChange?: (module: 'sales' | 'rental' | 'services') => void
  onNavigateToProposals?: () => void
}

export function SalesModule({ onBack, onModuleChange, onNavigateToProposals }: SalesModuleProps) {
  const { currentProposal, addBudgetToProposal } = useProposalStore()
  const { getActiveTaxRegime, costsExpenses, laborCosts } = useConfigurationStore()
  const [products, setProducts] = useState<ProductItem[]>([
    {
      id: "1",
      description: "Servidor Dell PowerEdge R740 - Processador Intel Xeon, 32GB RAM, 2TB HD",
      quantity: 1,
      unitCost: 8500,
      icmsCredit: 1020,
      totalCost: 8500,
      icmsSalePercent: 18,
      icmsDestLocalPercent: defaultICMSRates["SP"],
      difalSale: 0,
      icmsST: false,
      marginCommission: 2234.29,
      taxes: 1802.35,
      grossRevenue: 11516.64,
    },
  ])

  const [desiredMargin, setDesiredMargin] = useState(20)
  const [isFinalConsumer, setIsFinalConsumer] = useState(false)
  const [destinationUF, setDestinationUF] = useState<keyof ICMSInterstateRates>("SP")
  const [analysisTab, setAnalysisTab] = useState<"resumo" | "analise">("resumo")
  const [showGoToProposal, setShowGoToProposal] = useState(false)
  const [showClientForm, setShowClientForm] = useState(false)
  
  // Hook de integração com orçamentos
  const { createQuoteFromPricingData } = usePricingIntegration()

  // Criar instância configurada do pricing engine
  const activeTaxRegime = getActiveTaxRegime()
  const configuredPricingEngine = createConfiguredPricingEngine(activeTaxRegime, costsExpenses, laborCosts)

  // Verificar se as configurações estão carregadas
  if (!costsExpenses || !activeTaxRegime) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Carregando Configurações...</h2>
          <p className="text-muted-foreground">
            {!activeTaxRegime && "Nenhum regime tributário ativo encontrado. "}
            {!costsExpenses && "Configurações de custos não encontradas. "}
            <br />
            Vá em Configurações para definir os parâmetros necessários.
          </p>
        </div>
      </div>
    )
  }

  const addProduct = () => {
    const newProduct: ProductItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unitCost: 0,
      icmsCredit: 0,
      totalCost: 0,
      icmsSalePercent: 12,
      icmsDestLocalPercent: defaultICMSRates[destinationUF],
      difalSale: 0,
      icmsST: false,
      marginCommission: 0,
      taxes: 0,
      grossRevenue: 0,
    }
    setProducts([...products, newProduct])
  }

  const removeProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id))
  }

  const updateProduct = (id: string, field: keyof ProductItem, value: string | number | boolean) => {
    setProducts(
      products.map((p) => {
        if (p.id === id) {
          const updated = { ...p, [field]: value }
          if (field === "quantity" || field === "unitCost" || field === "icmsST") {
            updated.totalCost = updated.quantity * updated.unitCost
            const calculation = configuredPricingEngine.calculateSalesPrice(updated.unitCost, updated.quantity, desiredMargin)
            updated.marginCommission = calculation.marginCommission
            updated.taxes = calculation.taxes
            updated.grossRevenue = calculation.finalPrice
            updated.difalSale = configuredPricingEngine.calculateDIFAL(updated, destinationUF as string, defaultICMSRates, isFinalConsumer)

            // Adicionar ICMS ST ao total se aplicável
            if (updated.icmsST) {
              const icmsSTValue = configuredPricingEngine.calculateICMSST(updated, updated.icmsSalePercent)
              updated.grossRevenue += icmsSTValue
            }
          }
          return updated
        }
        return p
      }),
    )
  }

  // Função para recalcular todos os produtos quando a margem de lucro muda
  const recalculateAllProducts = () => {
    setProducts(
      products.map((p) => {
        const updated = { ...p }
        updated.totalCost = updated.quantity * updated.unitCost
        const calculation = configuredPricingEngine.calculateSalesPrice(updated.unitCost, updated.quantity, desiredMargin)
        updated.marginCommission = calculation.marginCommission
        updated.taxes = calculation.taxes
        updated.grossRevenue = calculation.finalPrice
        updated.difalSale = configuredPricingEngine.calculateDIFAL(updated, destinationUF as string, defaultICMSRates, isFinalConsumer)

        // Adicionar ICMS ST ao total se aplicável
        if (updated.icmsST) {
          const icmsSTValue = configuredPricingEngine.calculateICMSST(updated, updated.icmsSalePercent)
          updated.grossRevenue += icmsSTValue
        }
        return updated
      }),
    )
  }

  // Função para recalcular quando configurações ICMS mudam
  const recalculateICMS = () => {
    setProducts(
      products.map((p) => {
        const updated = { ...p }
        updated.difalSale = configuredPricingEngine.calculateDIFAL(updated, destinationUF as string, defaultICMSRates, isFinalConsumer)

        // Recalcular receita bruta considerando ICMS ST
        const calculation = configuredPricingEngine.calculateSalesPrice(updated.unitCost, updated.quantity, desiredMargin)
        updated.grossRevenue = calculation.finalPrice

        if (updated.icmsST) {
          const icmsSTValue = configuredPricingEngine.calculateICMSST(updated, updated.icmsSalePercent)
          updated.grossRevenue += icmsSTValue
        }
        return updated
      }),
    )
  }

  const getTotals = () => {
    return products.reduce(
      (acc, product) => ({
        baseCost: acc.baseCost + product.totalCost,
        marginCommission: acc.marginCommission + product.marginCommission,
        taxes: acc.taxes + product.taxes,
        grossRevenue: acc.grossRevenue + product.grossRevenue,
      }),
      { baseCost: 0, marginCommission: 0, taxes: 0, grossRevenue: 0 },
    )
  }

  const totals = getTotals()
  const suggestedPrice = totals.grossRevenue

  const handleOptimizePrice = () => {
    alert("Funcionalidade de otimização com IA em desenvolvimento!")
  }

  const handleSaveProposal = () => {
    setShowClientForm(true)
  }

  const handleClientFormSubmit = async (clientData: ClientData) => {
    try {
      const pricingData = {
        items: products.map(product => ({
          description: product.description,
          quantity: product.quantity,
          unitPrice: product.unitCost,
          totalPrice: product.grossRevenue,
          specifications: {
            icmsCredit: product.icmsCredit,
            icmsSalePercent: product.icmsSalePercent,
            icmsDestLocalPercent: product.icmsDestLocalPercent,
            difalSale: product.difalSale,
            icmsST: product.icmsST,
            marginCommission: product.marginCommission,
            taxes: product.taxes
          }
        })),
        totalValue: totals.grossRevenue,
        specifications: {
          desiredMargin,
          isFinalConsumer,
          destinationUF,
          taxRegime: activeTaxRegime?.name || 'N/A'
        }
      }

      await createQuoteFromPricingData({
        name: `Vendas de TI - ${clientData.nomeProjeto}`,
        clientName: clientData.razaoSocial,
        totalPrice: totals.grossRevenue,
        module: 'IT Sales/Rental/Services',
        technicalSpecs: pricingData.specifications,
        clientData: {
          razaoSocial: clientData.razaoSocial,
          nomeContato: clientData.nomeContato,
          telefoneCliente: clientData.telefoneCliente,
          emailCliente: clientData.emailCliente,
          nomeProjeto: clientData.nomeProjeto,
          nomeGerente: clientData.nomeGerente,
          telefoneGerente: clientData.telefoneGerente,
          emailGerente: clientData.emailGerente
        }
      })

      setShowClientForm(false)
      alert('Proposta criada e enviada para Orçamentos com sucesso!')
      
      if (onNavigateToProposals) {
        setShowGoToProposal(true)
      }
    } catch (error) {
      console.error('Erro ao criar proposta:', error)
      alert('Erro ao criar proposta. Tente novamente.')
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with Back Button and Title */}
      <div className="mb-8 p-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        {/* Main Header */}
        <Card className="bg-gradient-to-r from-[hsl(var(--accent-cyan))] to-[hsl(var(--primary-800))] border-[hsl(var(--accent-cyan)/0.5)] mb-6 card-modern">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Laptop className="h-8 w-8 text-white" />
              <h1 className="text-3xl font-bold text-white">Vendas de TI</h1>
              <Zap className="h-6 w-6 text-[hsl(var(--accent-orange))]" />
            </div>
            <p className="text-white/90 text-lg mb-4">Sistema de Vendas Inteligente</p>
            <Badge className="bg-[hsl(var(--primary-700))] hover:bg-[hsl(var(--primary-600))] text-white border-white/20">
              Regime Tributário Ativo: {activeTaxRegime?.name || 'Nenhum'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="px-6">
        {/* Module Shortcuts */}
        {onModuleChange && (
          <ModuleShortcuts
            currentModule="sales"
            onModuleChange={onModuleChange}
          />
        )}

        {/* Module Tab */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-muted rounded-lg p-1">
            <Button className="bg-[hsl(var(--accent-cyan))] hover:bg-[hsl(var(--accent-cyan)/0.9)] text-white">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Venda
            </Button>
          </div>
        </div>

        {/* Products Section - Redesigned */}
        <div className="space-y-8">
          <Card className="bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--muted)/0.3)] border-[hsl(var(--accent-cyan)/0.2)] shadow-xl">
            <CardHeader className="bg-gradient-to-r from-[hsl(var(--accent-cyan)/0.1)] to-[hsl(var(--primary-800)/0.1)] border-b border-[hsl(var(--accent-cyan)/0.2)]">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-[hsl(var(--accent-cyan))] to-[hsl(var(--primary-600))] rounded-lg flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-white" />
                  </div>
                  Parâmetros de Cálculo
                </CardTitle>
                <Badge variant="outline" className="bg-[hsl(var(--accent-cyan)/0.1)] border-[hsl(var(--accent-cyan)/0.3)] text-[hsl(var(--accent-cyan))]">
                  {products.length} {products.length === 1 ? 'item' : 'itens'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Products List */}
              <div className="space-y-6">
                {products.map((product, index) => (
                  <Card key={product.id} className="bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--muted)/0.2)] border-[hsl(var(--border))] hover:border-[hsl(var(--accent-cyan)/0.3)] transition-all duration-300 hover:shadow-lg">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-[hsl(var(--accent-orange))] to-[hsl(var(--accent-yellow))] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <h3 className="font-semibold text-lg">Item {index + 1}</h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProduct(product.id)}
                          className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Description Section */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <div className="w-4 h-4 bg-[hsl(var(--accent-cyan))] rounded-sm flex items-center justify-center">
                            <span className="text-white text-xs">📝</span>
                          </div>
                          Descrição do Produto
                        </Label>
                        <textarea
                          value={product.description}
                          onChange={(e) => updateProduct(product.id, "description", e.target.value)}
                          className="w-full h-20 p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] resize-none focus:border-[hsl(var(--accent-cyan))] focus:ring-2 focus:ring-[hsl(var(--accent-cyan)/0.2)] transition-all"
                          placeholder="Digite uma descrição detalhada do produto..."
                        />
                      </div>

                      {/* Basic Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <div className="w-4 h-4 bg-[hsl(var(--accent-green))] rounded-sm flex items-center justify-center">
                              <span className="text-white text-xs">#</span>
                            </div>
                            Quantidade
                          </Label>
                          <Input
                            type="number"
                            value={product.quantity}
                            onChange={(e) => updateProduct(product.id, "quantity", Number.parseInt(e.target.value) || 0)}
                            className="text-center font-medium"
                            min="1"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <div className="w-4 h-4 bg-[hsl(var(--accent-orange))] rounded-sm flex items-center justify-center">
                              <span className="text-white text-xs">R$</span>
                            </div>
                            Custo Unitário
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">R$</span>
                            <Input
                              type="number"
                              value={product.unitCost}
                              onChange={(e) => updateProduct(product.id, "unitCost", Number.parseFloat(e.target.value) || 0)}
                              className="pl-8 font-medium"
                              step="0.01"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            <div className="w-4 h-4 bg-[hsl(var(--accent-cyan))] rounded-sm flex items-center justify-center">
                              <span className="text-white text-xs">💰</span>
                            </div>
                            Custo Total
                          </Label>
                          <div className="p-3 bg-[hsl(var(--muted))] rounded-lg border">
                            <span className="font-bold text-lg text-[hsl(var(--accent-cyan))]">
                              {configuredPricingEngine.formatCurrency(product.totalCost)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ICMS Section */}
                      <div className="bg-[hsl(var(--muted)/0.5)] p-4 rounded-lg border border-[hsl(var(--border))]">
                        <h4 className="font-medium mb-4 flex items-center gap-2">
                          <div className="w-5 h-5 bg-[hsl(var(--accent-yellow))] rounded flex items-center justify-center">
                            <span className="text-white text-xs">📊</span>
                          </div>
                          Configurações ICMS
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground">Crédito ICMS (R$)</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                              <Input
                                type="number"
                                value={product.icmsCredit}
                                onChange={(e) => updateProduct(product.id, "icmsCredit", Number.parseFloat(e.target.value) || 0)}
                                className="pl-8 text-sm"
                                step="0.01"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground">ICMS Venda (%)</Label>
                            <div className="relative">
                              <Input
                                type="number"
                                value={product.icmsSalePercent}
                                onChange={(e) => updateProduct(product.id, "icmsSalePercent", Number.parseFloat(e.target.value) || 0)}
                                className="pr-8 text-sm"
                                step="0.01"
                              />
                              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--accent-cyan))] text-sm font-medium">%</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground">ICMS Destino (%)</Label>
                            <div className="relative">
                              <Input
                                type="number"
                                value={product.icmsDestLocalPercent}
                                onChange={(e) => updateProduct(product.id, "icmsDestLocalPercent", Number.parseFloat(e.target.value) || 0)}
                                className="pr-8 text-sm"
                                step="0.01"
                              />
                              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[hsl(var(--accent-cyan))] text-sm font-medium">%</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground">ICMS ST</Label>
                            <div className="flex flex-col items-center gap-2">
                              <Checkbox
                                checked={product.icmsST}
                                onCheckedChange={(checked) => updateProduct(product.id, "icmsST", checked === true)}
                                className="w-5 h-5"
                              />
                              <div className="text-xs text-center">
                                {product.icmsST ? (
                                  <span className="text-[hsl(var(--accent-green))]">Ativo</span>
                                ) : (
                                  <span className="text-muted-foreground">Inativo</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Results Section */}
                      <div className="bg-gradient-to-r from-[hsl(var(--accent-cyan)/0.1)] to-[hsl(var(--primary-800)/0.1)] p-4 rounded-lg border border-[hsl(var(--accent-cyan)/0.2)]">
                        <h4 className="font-medium mb-4 flex items-center gap-2">
                          <div className="w-5 h-5 bg-[hsl(var(--accent-green))] rounded flex items-center justify-center">
                            <span className="text-white text-xs">💹</span>
                          </div>
                          Resultados Calculados
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground mb-1">DIFAL Venda</div>
                            <div className="font-bold text-[hsl(var(--accent-orange))]">
                              {configuredPricingEngine.formatCurrency(product.difalSale)}
                            </div>
                            <div className="text-xs mt-1">
                              {isFinalConsumer ? (
                                <span className="text-[hsl(var(--accent-green))]">Calculado</span>
                              ) : (
                                <span className="text-muted-foreground">N/A</span>
                              )}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground mb-1">ICMS ST</div>
                            <div className="font-bold text-[hsl(var(--accent-purple))]">
                              {configuredPricingEngine.formatCurrency(
                                configuredPricingEngine.calculateICMSST(product, product.icmsSalePercent)
                              )}
                            </div>
                            <div className="text-xs mt-1">
                              {product.icmsST ? (
                                <span className="text-[hsl(var(--accent-green))]">Ativo</span>
                              ) : (
                                <span className="text-muted-foreground">N/A</span>
                              )}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground mb-1">Margem + Comissão</div>
                            <div className="font-bold text-[hsl(var(--accent-green))]">
                              {configuredPricingEngine.formatCurrency(product.marginCommission)}
                            </div>
                            <div className="text-xs text-[hsl(var(--accent-green))] mt-1">
                              {desiredMargin}% + {costsExpenses?.comissaoVenda || 3}%
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground mb-1">Impostos</div>
                            <div className="font-bold text-[hsl(var(--destructive))]">
                              {configuredPricingEngine.formatCurrency(product.taxes)}
                            </div>
                            <div className="text-xs text-[hsl(var(--destructive))] mt-1">
                              {activeTaxRegime?.name || 'N/A'}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground mb-1">Receita Bruta</div>
                            <div className="font-bold text-xl text-[hsl(var(--accent-cyan))]">
                              {configuredPricingEngine.formatCurrency(product.grossRevenue)}
                            </div>
                            <div className="text-xs text-[hsl(var(--accent-cyan))] mt-1">
                              Final
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Add Product Button */}
              <div className="flex justify-center mt-8">
                <Button
                  onClick={addProduct}
                  className="bg-gradient-to-r from-[hsl(var(--accent-cyan))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--accent-cyan)/0.9)] hover:to-[hsl(var(--primary-500))] text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Adicionar Novo Item
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Configuration Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Margin Configuration */}
            <Card className="bg-gradient-to-br from-[hsl(var(--accent-orange)/0.1)] to-[hsl(var(--accent-yellow)/0.1)] border-[hsl(var(--accent-orange)/0.2)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[hsl(var(--accent-orange))] to-[hsl(var(--accent-yellow))] rounded-lg flex items-center justify-center">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  Margem de Lucro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Margem de Lucro Desejada</Label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Input
                        type="number"
                        value={desiredMargin}
                        onChange={(e) => {
                          const newMargin = Number.parseFloat(e.target.value) || 0
                          setDesiredMargin(newMargin)
                          setTimeout(() => recalculateAllProducts(), 0)
                        }}
                        className="text-center text-xl font-bold pr-12"
                        step="0.1"
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[hsl(var(--accent-orange))] font-bold text-lg">%</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Esta margem será aplicada sobre o custo base de todos os itens
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ICMS Configuration */}
            <Card className="bg-gradient-to-br from-[hsl(var(--accent-cyan)/0.1)] to-[hsl(var(--primary-800)/0.1)] border-[hsl(var(--accent-cyan)/0.2)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[hsl(var(--accent-cyan))] to-[hsl(var(--primary-600))] rounded-lg flex items-center justify-center">
                    <Settings className="h-4 w-4 text-white" />
                  </div>
                  Configurações ICMS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="finalConsumer"
                      checked={isFinalConsumer}
                      onCheckedChange={(checked) => {
                        setIsFinalConsumer(checked === true)
                        // Recalcular DIFAL quando mudar o status do consumidor final
                        setTimeout(() => recalculateICMS(), 0)
                      }}
                      className="w-5 h-5"
                    />
                    <Label htmlFor="finalConsumer" className="text-sm font-medium">
                      Consumidor Final é Contribuinte do ICMS?
                    </Label>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">UF de Destino</Label>
                    <Select
                      value={destinationUF as string}
                      onValueChange={(value) => {
                        setDestinationUF(value as keyof ICMSInterstateRates)
                        // Recalcular DIFAL quando mudar UF de destino
                        setTimeout(() => recalculateICMS(), 0)
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {Object.entries(stateNames).map(([uf, name]) => (
                          <SelectItem key={uf} value={uf}>
                            <div className="flex items-center justify-between w-full">
                              <span>{uf} - {name}</span>
                              <Badge variant="outline" className="ml-2">
                                {defaultICMSRates[uf as keyof ICMSInterstateRates]}%
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mt-4 p-3 bg-[hsl(var(--muted)/0.5)] rounded-lg border">
                    <div className="text-xs text-muted-foreground mb-2">Informações DIFAL:</div>
                    <div className="text-xs">
                      {isFinalConsumer ? (
                        <span className="text-[hsl(var(--accent-green))]">
                          ✓ DIFAL será calculado para consumidor final contribuinte
                        </span>
                      ) : (
                        <span className="text-[hsl(var(--muted-foreground))]">
                          ○ DIFAL não se aplica (consumidor não contribuinte)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results and Analysis section */}
          <Card className="bg-gradient-to-br from-[hsl(var(--primary-800))] to-[hsl(var(--primary-900))] text-white card-modern border-[hsl(var(--primary-600)/0.5)] shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white text-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-[hsl(var(--accent-cyan))] to-[hsl(var(--primary-600))] rounded-lg flex items-center justify-center">
                  📊
                </div>
                Resultados e Análise
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Tabs */}
              <div className="flex mb-6 bg-[hsl(var(--primary-900)/0.5)] rounded-lg p-1 backdrop-blur-sm">
                <Button
                  onClick={() => setAnalysisTab("resumo")}
                  className={`flex-1 rounded-r-none transition-all duration-300 ${analysisTab === "resumo"
                    ? "bg-gradient-to-r from-[hsl(var(--accent-cyan))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--accent-cyan)/0.9)] hover:to-[hsl(var(--primary-500))] text-white shadow-lg"
                    : "bg-transparent hover:bg-[hsl(var(--primary-700)/0.5)] text-[hsl(var(--primary-200))] hover:text-white"
                    }`}
                >
                  📊 Resumo
                </Button>
                <Button
                  onClick={() => setAnalysisTab("analise")}
                  className={`flex-1 rounded-l-none transition-all duration-300 ${analysisTab === "analise"
                    ? "bg-gradient-to-r from-[hsl(var(--accent-cyan))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--accent-cyan)/0.9)] hover:to-[hsl(var(--primary-500))] text-white shadow-lg"
                    : "bg-transparent hover:bg-[hsl(var(--primary-700)/0.5)] text-[hsl(var(--primary-200))] hover:text-white"
                    }`}
                >
                  📋 Análise
                </Button>
              </div>

              {analysisTab === "resumo" ? (
                <>
                  {/* Price Display */}
                  <div className="text-center mb-8">
                    <p className="text-white/80 mb-2">Preço Final Sugerido</p>
                    <p className="text-5xl font-bold text-[hsl(var(--accent-orange))] mb-8">{configuredPricingEngine.formatCurrency(suggestedPrice)}</p>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-8 mb-8">
                    <div className="text-center">
                      <p className="text-white/80 text-sm mb-1">CUSTO BASE</p>
                      <p className="text-2xl font-bold text-white">{configuredPricingEngine.formatCurrency(totals.baseCost)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/80 text-sm mb-1">MARGEM+COM</p>
                      <p className="text-2xl font-bold text-white">{configuredPricingEngine.formatCurrency(totals.marginCommission)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/80 text-sm mb-1">IMPOSTOS</p>
                      <p className="text-2xl font-bold text-white">{configuredPricingEngine.formatCurrency(totals.taxes)}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-4">
                    <Button
                      onClick={handleOptimizePrice}
                      className="w-full bg-[hsl(var(--accent-orange))] hover:bg-[hsl(var(--accent-orange)/0.9)] text-white py-3 text-lg"
                    >
                      💡 Otimizar Preço com IA
                    </Button>
                    <Button
                      onClick={handleSaveProposal}
                      className="w-full bg-[hsl(var(--accent-green))] hover:bg-[hsl(var(--accent-green)/0.9)] text-white py-3 text-lg"
                    >
                      ✅ Salvar Proposta
                    </Button>
                    {showGoToProposal && onNavigateToProposals && (
                      <Button
                        onClick={onNavigateToProposals}
                        className="w-full bg-[hsl(var(--accent-cyan))] hover:bg-[hsl(var(--accent-cyan)/0.9)] text-white py-3 text-lg"
                      >
                        📋 Ir à Proposta
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <h3 className="text-white text-lg font-semibold flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-[hsl(var(--accent-cyan))] to-[hsl(var(--primary-600))] rounded flex items-center justify-center text-xs">
                      📋
                    </div>
                    Análise DRE - Demonstrativo de Resultado
                  </h3>
                  <div className="bg-gradient-to-br from-[hsl(var(--primary-900))] to-[hsl(var(--primary-800))] p-6 rounded-lg border border-[hsl(var(--primary-600)/0.3)] backdrop-blur-sm">
                    <div className="space-y-4">
                      <div className="flex justify-between border-b border-[hsl(var(--primary-600)/0.5)] pb-2">
                        <span className="text-[hsl(var(--primary-200))]">Receita Bruta</span>
                        <span className="text-[hsl(var(--accent-green))] font-semibold">{configuredPricingEngine.formatCurrency(suggestedPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[hsl(var(--primary-200))]">(-) Impostos</span>
                        <span className="text-[hsl(var(--destructive))]">{configuredPricingEngine.formatCurrency(totals.taxes)}</span>
                      </div>
                      <div className="flex justify-between border-b border-[hsl(var(--primary-600)/0.5)] pb-2">
                        <span className="text-[hsl(var(--primary-200))]">(-) Custos Diretos</span>
                        <span className="text-[hsl(var(--destructive))]">{configuredPricingEngine.formatCurrency(totals.baseCost)}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span className="text-white">Lucro Líquido</span>
                        <span className="text-[hsl(var(--accent-green))]">{configuredPricingEngine.formatCurrency(totals.marginCommission)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[hsl(var(--primary-300))]">Margem Líquida</span>
                        <span className="text-[hsl(var(--accent-cyan))] font-semibold">
                          {((totals.marginCommission / suggestedPrice) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modal de Dados do Cliente */}
        <ProposalClientForm
          isOpen={showClientForm}
          onClose={() => setShowClientForm(false)}
          onSubmit={handleClientFormSubmit}
        />
      </div>
    </div>
  )
}