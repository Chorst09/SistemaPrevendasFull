"use client"

import { useState } from "react"
import { Settings, Zap, ArrowLeft, Plus, Trash2, Briefcase, Laptop } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ModuleShortcuts } from "./ModuleShortcuts"
import type { ServiceItem } from "@/lib/types/pricing"
import { createConfiguredPricingEngine } from "@/lib/utils/pricing-engine"
import { useProposalStore } from "@/lib/stores/proposal-store"
import { useConfigurationStore } from "@/lib/stores/configuration-store"
import { usePricingIntegration } from "@/hooks/use-pricing-integration"
import { ProposalClientForm, type ClientData } from "@/components/calculators/ProposalClientForm"

interface ServiceModuleProps {
  onBack: () => void
  onModuleChange?: (module: 'sales' | 'rental' | 'services') => void
  onNavigateToProposals?: () => void
}

export function ServiceModule({ onBack, onModuleChange, onNavigateToProposals }: ServiceModuleProps) {
  const { currentProposal, addBudgetToProposal } = useProposalStore()
  const { getActiveTaxRegime, costsExpenses, laborCosts } = useConfigurationStore()
  const [desiredMargin, setDesiredMargin] = useState(20)
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

  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([
    {
      id: "1",
      description: "Consultoria em TI",
      quantity: 1,
      unitValue: 150,
      totalValue: 6000,
      serviceType: "Consultoria",
      hourlyRate: 150,
      totalHours: 40,
      marginCommission: 1200,
    },
  ])

  const addServiceItem = () => {
    const newItem: ServiceItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unitValue: 0,
      totalValue: 0,
      serviceType: "Consultoria",
      hourlyRate: 0,
      totalHours: 0,
      marginCommission: 0,
    }
    setServiceItems([...serviceItems, newItem])
  }

  const removeServiceItem = (id: string) => {
    setServiceItems(serviceItems.filter((item) => item.id !== id))
  }

  const updateServiceItem = (id: string, field: keyof ServiceItem, value: string | number) => {
    setServiceItems(
      serviceItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }

          if (field === "hourlyRate" || field === "totalHours") {
            const calculation = configuredPricingEngine.calculateServicePrice(
              updatedItem.hourlyRate,
              updatedItem.totalHours,
              desiredMargin,
            )

            updatedItem.totalValue = calculation.baseCost
            updatedItem.marginCommission = calculation.marginCommission
          }

          return updatedItem
        }
        return item
      }),
    )
  }

  // Função para recalcular todos os itens quando a margem de lucro muda
  const recalculateAllServiceItems = () => {
    setServiceItems(
      serviceItems.map((item) => {
        const updatedItem = { ...item }
        const calculation = configuredPricingEngine.calculateServicePrice(
          updatedItem.hourlyRate,
          updatedItem.totalHours,
          desiredMargin,
        )

        updatedItem.totalValue = calculation.baseCost
        updatedItem.marginCommission = calculation.marginCommission
        return updatedItem
      }),
    )
  }

  const totalServiceCost = serviceItems.reduce((sum, item) => sum + item.totalValue, 0)
  const totalMarginCommission = serviceItems.reduce((sum, item) => sum + item.marginCommission, 0)

  const totalTaxes = serviceItems.reduce((sum, item) => {
    const calc = configuredPricingEngine.calculateServicePrice(item.hourlyRate, item.totalHours, desiredMargin)
    return sum + calc.taxes
  }, 0)

  const finalSuggestedPrice = totalServiceCost + totalMarginCommission + totalTaxes

  const handleOptimizePrice = () => {
    alert("Funcionalidade de otimização com IA em desenvolvimento!")
  }

  const handleSaveProposal = () => {
    setShowClientForm(true)
  }

  const handleClientFormSubmit = async (clientData: ClientData) => {
    try {
      const pricingData = {
        items: serviceItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.hourlyRate,
          totalPrice: item.totalValue + item.marginCommission,
          specifications: {
            serviceType: item.serviceType,
            hourlyRate: item.hourlyRate,
            totalHours: item.totalHours,
            totalValue: item.totalValue,
            marginCommission: item.marginCommission
          }
        })),
        totalValue: finalSuggestedPrice,
        specifications: {
          desiredMargin,
          taxRegime: activeTaxRegime?.name || 'N/A'
        }
      }

      await createQuoteFromPricingData({
        name: `Serviços de TI - ${clientData.nomeProjeto}`,
        clientName: clientData.razaoSocial,
        totalPrice: finalSuggestedPrice,
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
      {/* Header with Back Button */}
      <div className="mb-8 p-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={onBack}
            variant="outline"
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
              <h1 className="text-3xl font-bold text-white">Serviços de TI</h1>
              <Zap className="h-6 w-6 text-[hsl(var(--accent-orange))]" />
            </div>
            <p className="text-white/90 text-lg mb-4">Sistema de Serviços Inteligente</p>
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
            currentModule="services" 
            onModuleChange={onModuleChange}
          />
        )}

        {/* Module Tab */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-muted rounded-lg p-1">
            <Button className="bg-[hsl(var(--accent-cyan))] hover:bg-[hsl(var(--accent-cyan)/0.9)] text-white">
              <Briefcase className="h-4 w-4 mr-2" />
              Serviços
            </Button>
          </div>
        </div>

        {/* Services Section - Redesigned */}
        <Card className="mb-6 bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--muted)/0.3)] border-[hsl(var(--accent-cyan)/0.2)] shadow-xl">
          <CardHeader className="bg-gradient-to-r from-[hsl(var(--accent-cyan)/0.1)] to-[hsl(var(--primary-800)/0.1)] border-b border-[hsl(var(--accent-cyan)/0.2)]">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-[hsl(var(--accent-cyan))] to-[hsl(var(--primary-600))] rounded-lg flex items-center justify-center">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                Parâmetros de Cálculo
              </CardTitle>
              <Badge variant="outline" className="bg-[hsl(var(--accent-cyan)/0.1)] border-[hsl(var(--accent-cyan)/0.3)] text-[hsl(var(--accent-cyan))]">
                {serviceItems.length} {serviceItems.length === 1 ? 'serviço' : 'serviços'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Service Items List */}
            <div className="space-y-6">
              {serviceItems.map((item, index) => (
                <Card key={item.id} className="bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--muted)/0.2)] border-[hsl(var(--border))] hover:border-[hsl(var(--accent-cyan)/0.3)] transition-all duration-300 hover:shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-[hsl(var(--accent-orange))] to-[hsl(var(--accent-yellow))] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <h3 className="font-semibold text-lg">Serviço {index + 1}</h3>
                      </div>
                      <Button
                        onClick={() => removeServiceItem(item.id)}
                        variant="ghost"
                        size="sm"
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
                        Descrição do Serviço
                      </Label>
                      <textarea
                        value={item.description}
                        onChange={(e) => updateServiceItem(item.id, "description", e.target.value)}
                        className="w-full h-20 p-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] resize-none focus:border-[hsl(var(--accent-cyan))] focus:ring-2 focus:ring-[hsl(var(--accent-cyan)/0.2)] transition-all"
                        placeholder="Digite uma descrição detalhada do serviço..."
                      />
                    </div>

                    {/* Service Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <div className="w-4 h-4 bg-[hsl(var(--accent-green))] rounded-sm flex items-center justify-center">
                            <span className="text-white text-xs">#</span>
                          </div>
                          Quantidade
                        </Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateServiceItem(item.id, "quantity", Number.parseInt(e.target.value) || 0)}
                          className="text-center font-medium"
                          min="1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <div className="w-4 h-4 bg-[hsl(var(--accent-purple))] rounded-sm flex items-center justify-center">
                            <span className="text-white text-xs">🔧</span>
                          </div>
                          Tipo de Serviço
                        </Label>
                        <Select value={item.serviceType} onValueChange={(value) => updateServiceItem(item.id, "serviceType", value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Consultoria">
                              <div className="flex items-center gap-2">
                                <span>💼</span>
                                Consultoria
                              </div>
                            </SelectItem>
                            <SelectItem value="Suporte">
                              <div className="flex items-center gap-2">
                                <span>🛠️</span>
                                Suporte
                              </div>
                            </SelectItem>
                            <SelectItem value="Implementação">
                              <div className="flex items-center gap-2">
                                <span>⚙️</span>
                                Implementação
                              </div>
                            </SelectItem>
                            <SelectItem value="Treinamento">
                              <div className="flex items-center gap-2">
                                <span>📚</span>
                                Treinamento
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <div className="w-4 h-4 bg-[hsl(var(--accent-orange))] rounded-sm flex items-center justify-center">
                            <span className="text-white text-xs">R$</span>
                          </div>
                          Valor por Hora
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">R$</span>
                          <Input
                            type="number"
                            value={item.hourlyRate}
                            onChange={(e) => updateServiceItem(item.id, "hourlyRate", Number.parseFloat(e.target.value) || 0)}
                            className="pl-8 font-medium"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <div className="w-4 h-4 bg-[hsl(var(--accent-yellow))] rounded-sm flex items-center justify-center">
                            <span className="text-white text-xs">⏰</span>
                          </div>
                          Total de Horas
                        </Label>
                        <Input
                          type="number"
                          value={item.totalHours}
                          onChange={(e) => updateServiceItem(item.id, "totalHours", Number.parseFloat(e.target.value) || 0)}
                          className="text-center font-medium"
                          step="0.5"
                        />
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
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">Valor Base</div>
                          <div className="font-bold text-[hsl(var(--accent-orange))]">
                            {configuredPricingEngine.formatCurrency(item.totalValue)}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">Margem + Comissão</div>
                          <div className="font-bold text-[hsl(var(--accent-green))]">
                            {configuredPricingEngine.formatCurrency(item.marginCommission)}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-muted-foreground mb-1">Valor Final</div>
                          <div className="font-bold text-xl text-[hsl(var(--accent-cyan))]">
                            {configuredPricingEngine.formatCurrency(item.totalValue + item.marginCommission)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add Service Button */}
            <div className="flex justify-center mt-8">
              <Button
                onClick={addServiceItem}
                className="bg-gradient-to-r from-[hsl(var(--accent-cyan))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--accent-cyan)/0.9)] hover:to-[hsl(var(--primary-500))] text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-5 w-5 mr-2" />
                Adicionar Novo Serviço
              </Button>
            </div>

            {/* Total Summary */}
            <div className="mt-8 p-6 bg-gradient-to-r from-[hsl(var(--accent-green)/0.1)] to-[hsl(var(--accent-cyan)/0.1)] rounded-lg border border-[hsl(var(--accent-green)/0.2)]">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">Custo Base Total</div>
                <div className="text-3xl font-bold text-[hsl(var(--accent-green))]">
                  {configuredPricingEngine.formatCurrency(totalServiceCost)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
                        const newMargin = Number.parseInt(e.target.value) || 20
                        setDesiredMargin(newMargin)
                        setTimeout(() => recalculateAllServiceItems(), 0)
                      }}
                      className="text-center text-xl font-bold pr-12"
                      step="0.1"
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[hsl(var(--accent-orange))] font-bold text-lg">%</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Esta margem será aplicada sobre o valor base de todos os serviços
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Info Card */}
          <Card className="bg-gradient-to-br from-[hsl(var(--accent-cyan)/0.1)] to-[hsl(var(--primary-800)/0.1)] border-[hsl(var(--accent-cyan)/0.2)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[hsl(var(--accent-cyan))] to-[hsl(var(--primary-600))] rounded-lg flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-white" />
                </div>
                Informações dos Serviços
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total de Serviços:</span>
                  <Badge variant="outline" className="bg-[hsl(var(--accent-cyan)/0.1)]">
                    {serviceItems.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Horas Totais:</span>
                  <span className="font-medium">
                    {serviceItems.reduce((sum, item) => sum + item.totalHours, 0)}h
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Valor Médio/Hora:</span>
                  <span className="font-medium">
                    {configuredPricingEngine.formatCurrency(
                      serviceItems.length > 0 
                        ? serviceItems.reduce((sum, item) => sum + item.hourlyRate, 0) / serviceItems.length 
                        : 0
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results and Analysis Section */}
        <Card className="bg-gradient-to-br from-[hsl(var(--primary-800))] to-[hsl(var(--primary-900))] text-white card-modern border-[hsl(var(--primary-600)/0.5)] shadow-2xl mb-6">
          <CardHeader>
            <CardTitle className="text-white text-xl flex items-center gap-2">📊 Resultados e Análise</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Analysis Tabs */}
            <div className="flex gap-2 mb-6">
              <Button
                onClick={() => setAnalysisTab("resumo")}
                className={`flex-1 rounded-r-none transition-all duration-300 ${
                  analysisTab === "resumo" 
                    ? "bg-gradient-to-r from-[hsl(var(--accent-cyan))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--accent-cyan)/0.9)] hover:to-[hsl(var(--primary-500))] text-white shadow-lg" 
                    : "bg-transparent hover:bg-[hsl(var(--primary-700)/0.5)] text-[hsl(var(--primary-200))] hover:text-white"
                }`}
              >
                📊 Resumo
              </Button>
              <Button
                onClick={() => setAnalysisTab("analise")}
                className={`flex-1 rounded-l-none transition-all duration-300 ${
                  analysisTab === "analise" 
                    ? "bg-gradient-to-r from-[hsl(var(--accent-cyan))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--accent-cyan)/0.9)] hover:to-[hsl(var(--primary-500))] text-white shadow-lg" 
                    : "bg-transparent hover:bg-[hsl(var(--primary-700)/0.5)] text-[hsl(var(--primary-200))] hover:text-white"
                }`}
              >
                📋 Análise
              </Button>
            </div>

            {analysisTab === "resumo" ? (
              <div className="space-y-6">
                {/* Final Price */}
                <div className="text-center">
                  <p className="text-white/80 mb-2">Preço Final Sugerido</p>
                  <p className="text-5xl font-bold text-[hsl(var(--accent-orange))] mb-8">
                    {configuredPricingEngine.formatCurrency(finalSuggestedPrice)}
                  </p>
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-white/80 text-sm mb-1">CUSTO BASE</p>
                    <p className="text-2xl font-bold">
                      {configuredPricingEngine.formatCurrency(totalServiceCost)}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm mb-1">MARGEM+COM</p>
                    <p className="text-2xl font-bold">
                      {configuredPricingEngine.formatCurrency(totalMarginCommission)}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm mb-1">IMPOSTOS</p>
                    <p className="text-2xl font-bold">
                      {configuredPricingEngine.formatCurrency(totalTaxes)}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button onClick={handleOptimizePrice} className="w-full bg-[hsl(var(--accent-orange))] hover:bg-[hsl(var(--accent-orange)/0.9)] text-white py-3 text-lg">
                    💡 Otimizar Preço com IA
                  </Button>
                  <Button onClick={handleSaveProposal} className="w-full bg-[hsl(var(--accent-green))] hover:bg-[hsl(var(--accent-green)/0.9)] text-white py-3 text-lg">
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
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-white text-lg font-semibold">Análise DRE - Demonstrativo de Resultado</h3>
                <div className="bg-gradient-to-br from-[hsl(var(--primary-900))] to-[hsl(var(--primary-800))] p-6 rounded-lg border border-[hsl(var(--primary-600)/0.3)] backdrop-blur-sm">
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-[hsl(var(--primary-600)/0.5)] pb-2">
                      <span className="text-[hsl(var(--primary-200))]">Receita Bruta</span>
                      <span className="text-[hsl(var(--accent-green))] font-semibold">
                        {configuredPricingEngine.formatCurrency(finalSuggestedPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[hsl(var(--primary-200))]">(-) Impostos sobre Serviços</span>
                      <span className="text-[hsl(var(--destructive))]">
                        {configuredPricingEngine.formatCurrency(totalTaxes)}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[hsl(var(--primary-600)/0.5)] pb-2">
                      <span className="text-[hsl(var(--primary-200))]">(-) Custos Diretos</span>
                      <span className="text-[hsl(var(--destructive))]">
                        {configuredPricingEngine.formatCurrency(totalServiceCost)}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-white">Lucro Líquido</span>
                      <span className="text-[hsl(var(--accent-green))]">
                        {configuredPricingEngine.formatCurrency(totalMarginCommission)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[hsl(var(--primary-300))]">Margem Líquida</span>
                      <span className="text-[hsl(var(--accent-cyan))] font-semibold">
                        {((totalMarginCommission / finalSuggestedPrice) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

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