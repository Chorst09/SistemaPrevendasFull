"use client"

import { useState, useEffect, useCallback } from "react"
import { ArrowLeft, Plus, Trash2, Calculator, FileText, Users, Clock, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ServiceDeskService, 
  ServiceDeskSLA, 
  ServiceDeskItem,
  ServiceDeskClientData,
  ServiceDeskProposal,
  ServiceDeskServiceLevel,
  ServiceDeskContractType
} from "@/lib/types/service-desk"
import { 
  SERVICE_DESK_CONTRACT_PERIODS,
  SERVICE_DESK_SERVICE_LEVELS,
  DEFAULT_SERVICE_DESK_METRICS
} from "@/lib/constants/service-desk"
import { useToast } from "@/hooks/use-toast"
import { calculateServiceItemCosts, calculateProposalTotals, calculateExpectedMetrics } from "@/lib/utils/service-desk-calculations"
import { generateServiceDeskProposalPDF } from "@/lib/pdf/generators/ServiceDeskPDFGenerator"

interface ServiceDeskCalculatorModuleProps {
  onBack: () => void
  onNavigateToProposals?: () => void
  services: ServiceDeskService[]
  slas: ServiceDeskSLA[]
  editingProposalId?: string | null
  onFinishEditing?: () => void
}

export function ServiceDeskCalculatorModule({
  onBack,
  onNavigateToProposals,
  services,
  slas,
  editingProposalId,
  onFinishEditing
}: ServiceDeskCalculatorModuleProps) {
  const { toast } = useToast()
  
  // Estados do formulário
  const [clientData, setClientData] = useState<ServiceDeskClientData>({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    projectName: "",
    managerName: "",
    managerEmail: "",
    managerPhone: "",
    employeeCount: 0,
    currentITSupport: "",
    businessHours: {
      start: "08:00",
      end: "18:00",
      timezone: "America/Sao_Paulo"
    },
    criticalSystems: []
  })

  const [serviceItems, setServiceItems] = useState<ServiceDeskItem[]>([])
  const [contractPeriod, setContractPeriod] = useState<number>(12)
  const [selectedServiceLevel, setSelectedServiceLevel] = useState<ServiceDeskServiceLevel>(ServiceDeskServiceLevel.STANDARD)
  const [notes, setNotes] = useState<string>("")

  // Carregar dados se estiver editando
  useEffect(() => {
    if (editingProposalId) {
      loadProposalForEditing(editingProposalId)
    }
  }, [editingProposalId])

  const loadProposalForEditing = (proposalId: string) => {
    // Aqui você carregaria os dados da proposta do localStorage ou API
    const savedProposals = JSON.parse(localStorage.getItem('serviceDeskProposals') || '[]')
    const proposal = savedProposals.find((p: ServiceDeskProposal) => p.id === proposalId)
    
    if (proposal) {
      setClientData(proposal.clientData)
      setServiceItems(proposal.serviceItems)
      setContractPeriod(proposal.contractType === ServiceDeskContractType.MONTHLY ? 1 : 
                       proposal.contractType === ServiceDeskContractType.QUARTERLY ? 3 :
                       proposal.contractType === ServiceDeskContractType.SEMIANNUAL ? 6 : 12)
      setSelectedServiceLevel(proposal.serviceLevel)
      setNotes(proposal.notes || "")
    }
  }

  // Adicionar novo item de serviço
  const addServiceItem = () => {
    const newItem: ServiceDeskItem = {
      id: Date.now().toString(),
      serviceName: "",
      category: services[0]?.category || "OTHER" as any,
      serviceLevel: selectedServiceLevel,
      userCount: 10,
      monthlyTickets: 20,
      averageResolutionTime: 8,
      costPerUser: 45.00,
      setupCost: 200.00,
      monthlyCost: 450.00,
      annualCost: 5400.00,
      contractPeriod: contractPeriod,
      includedHours: 3,
      additionalHours: 0,
      additionalHoursCost: 0,
      isFromCatalog: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setServiceItems([...serviceItems, newItem])
  }

  // Adicionar serviço do catálogo
  const addServiceFromCatalog = (service: ServiceDeskService) => {
    const userCount = Math.max(service.minimumUsers, 10)
    
    const calculatedItem = calculateServiceItemCosts(
      userCount,
      service.serviceLevel,
      service.baseCost,
      service.setupCost,
      service.includedHours,
      service.additionalHourCost
    )

    const newItem: ServiceDeskItem = {
      ...calculatedItem,
      id: Date.now().toString(),
      serviceId: service.id,
      serviceName: service.name,
      category: service.category,
      contractPeriod: contractPeriod,
      isFromCatalog: true,
      specifications: {
        features: service.features,
        slaIds: service.slaIds
      }
    }
    setServiceItems([...serviceItems, newItem])
  }

  // Atualizar item de serviço
  const updateServiceItem = (id: string, updates: Partial<ServiceDeskItem>) => {
    setServiceItems(items => items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, ...updates }
        
        // Recalcular custos se necessário
        if (updates.userCount !== undefined || updates.costPerUser !== undefined || updates.serviceLevel !== undefined) {
          const userCount = updates.userCount ?? item.userCount
          const costPerUser = updates.costPerUser ?? item.costPerUser
          const serviceLevel = updates.serviceLevel ?? item.serviceLevel
          const setupCost = updates.setupCost ?? item.setupCost
          const includedHours = updates.includedHours ?? item.includedHours
          const additionalHourCost = services.find(s => s.id === item.serviceId)?.additionalHourCost || 90

          const recalculated = calculateServiceItemCosts(
            userCount,
            serviceLevel,
            costPerUser,
            setupCost,
            includedHours,
            additionalHourCost
          )

          Object.assign(updatedItem, {
            monthlyCost: recalculated.monthlyCost,
            annualCost: recalculated.annualCost,
            monthlyTickets: recalculated.monthlyTickets,
            additionalHours: recalculated.additionalHours,
            additionalHoursCost: recalculated.additionalHoursCost,
            averageResolutionTime: recalculated.averageResolutionTime
          })
        }
        
        return updatedItem
      }
      return item
    }))
  }

  // Remover item de serviço
  const removeServiceItem = (id: string) => {
    setServiceItems(items => items.filter(item => item.id !== id))
  }

  // Calcular totais
  const calculateTotals = useCallback(() => {
    const totalUsers = serviceItems.reduce((sum, item) => sum + item.userCount, 0)
    const totalSetupCost = serviceItems.reduce((sum, item) => sum + item.setupCost, 0)
    const monthlyCost = serviceItems.reduce((sum, item) => sum + item.monthlyCost + item.additionalHoursCost, 0)
    const annualCost = monthlyCost * 12
    const totalIncludedHours = serviceItems.reduce((sum, item) => sum + (item.includedHours * item.userCount), 0)
    const estimatedAdditionalHours = serviceItems.reduce((sum, item) => sum + item.additionalHours, 0)
    const additionalHoursCost = serviceItems.reduce((sum, item) => sum + item.additionalHoursCost, 0)

    return {
      totalUsers,
      totalSetupCost,
      monthlyCost,
      annualCost,
      totalIncludedHours,
      estimatedAdditionalHours,
      additionalHoursCost
    }
  }, [serviceItems])

  const totals = calculateTotals()

  // Gerar proposta
  const generateProposal = async () => {
    if (!clientData.companyName || !clientData.contactName || serviceItems.length === 0) {
      toast({
        title: "Dados incompletos",
        description: "Preencha os dados do cliente e adicione pelo menos um serviço.",
        variant: "destructive"
      })
      return
    }

    try {
      const proposal: ServiceDeskProposal = {
        id: editingProposalId || Date.now().toString(),
        clientData,
        serviceItems,
        totals,
        contractType: contractPeriod === 1 ? ServiceDeskContractType.MONTHLY :
                     contractPeriod === 3 ? ServiceDeskContractType.QUARTERLY :
                     contractPeriod === 6 ? ServiceDeskContractType.SEMIANNUAL :
                     ServiceDeskContractType.ANNUAL,
        serviceLevel: selectedServiceLevel,
        slaConfiguration: slas.filter(sla => 
          serviceItems.some(item => 
            item.specifications?.slaIds?.includes(sla.id)
          )
        ),
        status: 'Rascunho',
        createdAt: editingProposalId ? new Date() : new Date(),
        updatedAt: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        notes,
        version: 1
      }

      // Gerar PDF da proposta
      toast({
        title: "Gerando PDF...",
        description: "Aguarde enquanto geramos o PDF da proposta."
      })

      const { blob, url } = await generateServiceDeskProposalPDF(proposal)
      proposal.pdfBlob = blob
      proposal.pdfUrl = url

      // Salvar no localStorage
      const savedProposals = JSON.parse(localStorage.getItem('serviceDeskProposals') || '[]')
      
      if (editingProposalId) {
        const index = savedProposals.findIndex((p: ServiceDeskProposal) => p.id === editingProposalId)
        if (index !== -1) {
          savedProposals[index] = proposal
        }
      } else {
        savedProposals.push(proposal)
      }
      
      localStorage.setItem('serviceDeskProposals', JSON.stringify(savedProposals))

      toast({
        title: "Proposta gerada com sucesso!",
        description: `Proposta para ${clientData.companyName} foi ${editingProposalId ? 'atualizada' : 'criada'} com PDF.`
      })

      // Abrir PDF em nova aba
      if (url) {
        window.open(url, '_blank')
      }

      if (editingProposalId && onFinishEditing) {
        onFinishEditing()
      }

      if (onNavigateToProposals) {
        onNavigateToProposals()
      }
    } catch (error) {
      console.error('Erro ao gerar proposta:', error)
      toast({
        title: "Erro ao gerar proposta",
        description: "Ocorreu um erro ao gerar o PDF. Tente novamente.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button onClick={onBack} variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Calculadora Service Desk</h1>
                <p className="text-sm text-muted-foreground">
                  {editingProposalId ? 'Editando proposta existente' : 'Criar nova proposta de Service Desk'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {serviceItems.length} serviço(s)
              </Badge>
              <Badge variant="outline">
                {totals.totalUsers} usuário(s)
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="client" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="client">Dados do Cliente</TabsTrigger>
            <TabsTrigger value="services">Serviços</TabsTrigger>
            <TabsTrigger value="configuration">Configuração</TabsTrigger>
            <TabsTrigger value="summary">Resumo</TabsTrigger>
          </TabsList>

          <TabsContent value="client" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Cliente</CardTitle>
                <CardDescription>
                  Dados básicos do cliente e projeto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nome da Empresa *</Label>
                    <Input
                      id="companyName"
                      value={clientData.companyName}
                      onChange={(e) => setClientData(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="Ex: Empresa ABC Ltda"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Nome do Contato *</Label>
                    <Input
                      id="contactName"
                      value={clientData.contactName}
                      onChange={(e) => setClientData(prev => ({ ...prev, contactName: e.target.value }))}
                      placeholder="Ex: João Silva"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={clientData.email}
                      onChange={(e) => setClientData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Ex: joao@empresa.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      value={clientData.phone}
                      onChange={(e) => setClientData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Ex: (11) 99999-9999"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Nome do Projeto *</Label>
                    <Input
                      id="projectName"
                      value={clientData.projectName}
                      onChange={(e) => setClientData(prev => ({ ...prev, projectName: e.target.value }))}
                      placeholder="Ex: Implementação Service Desk"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employeeCount">Número de Funcionários</Label>
                    <Input
                      id="employeeCount"
                      type="number"
                      value={clientData.employeeCount}
                      onChange={(e) => setClientData(prev => ({ ...prev, employeeCount: parseInt(e.target.value) || 0 }))}
                      placeholder="Ex: 100"
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="managerName">Nome do Gerente</Label>
                    <Input
                      id="managerName"
                      value={clientData.managerName}
                      onChange={(e) => setClientData(prev => ({ ...prev, managerName: e.target.value }))}
                      placeholder="Ex: Maria Santos"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="managerEmail">Email do Gerente</Label>
                    <Input
                      id="managerEmail"
                      type="email"
                      value={clientData.managerEmail}
                      onChange={(e) => setClientData(prev => ({ ...prev, managerEmail: e.target.value }))}
                      placeholder="Ex: maria@empresa.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="managerPhone">Telefone do Gerente</Label>
                    <Input
                      id="managerPhone"
                      value={clientData.managerPhone}
                      onChange={(e) => setClientData(prev => ({ ...prev, managerPhone: e.target.value }))}
                      placeholder="Ex: (11) 88888-8888"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentITSupport">Suporte Atual de TI</Label>
                    <Input
                      id="currentITSupport"
                      value={clientData.currentITSupport}
                      onChange={(e) => setClientData(prev => ({ ...prev, currentITSupport: e.target.value }))}
                      placeholder="Ex: Equipe interna, terceirizado, etc."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Serviços</h2>
                <p className="text-muted-foreground">Adicione os serviços de Service Desk necessários</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={addServiceItem} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Serviço Personalizado
                </Button>
              </div>
            </div>

            {/* Catálogo de Serviços */}
            <Card>
              <CardHeader>
                <CardTitle>Catálogo de Serviços</CardTitle>
                <CardDescription>Selecione serviços pré-configurados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {services.filter(s => s.active).map(service => (
                    <Card key={service.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold">{service.name}</h4>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{service.serviceLevel}</Badge>
                            <span className="text-sm font-medium">
                              R$ {service.baseCost.toFixed(2)}/usuário
                            </span>
                          </div>
                          <Button 
                            size="sm" 
                            className="w-full"
                            onClick={() => addServiceFromCatalog(service)}
                          >
                            Adicionar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Lista de Serviços Adicionados */}
            <div className="space-y-4">
              {serviceItems.map((item, index) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Serviço {index + 1}</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeServiceItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Nome do Serviço</Label>
                        <Input
                          value={item.serviceName}
                          onChange={(e) => updateServiceItem(item.id, { serviceName: e.target.value })}
                          placeholder="Ex: Suporte Técnico Nível 1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nível de Serviço</Label>
                        <Select
                          value={item.serviceLevel}
                          onValueChange={(value) => updateServiceItem(item.id, { serviceLevel: value as ServiceDeskServiceLevel })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SERVICE_DESK_SERVICE_LEVELS.map(level => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Número de Usuários</Label>
                        <Input
                          type="number"
                          value={item.userCount}
                          onChange={(e) => updateServiceItem(item.id, { userCount: parseInt(e.target.value) || 0 })}
                          min="1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Custo por Usuário (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.costPerUser}
                          onChange={(e) => updateServiceItem(item.id, { costPerUser: parseFloat(e.target.value) || 0 })}
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Custo de Setup (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.setupCost}
                          onChange={(e) => updateServiceItem(item.id, { setupCost: parseFloat(e.target.value) || 0 })}
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Horas Incluídas/Usuário</Label>
                        <Input
                          type="number"
                          value={item.includedHours}
                          onChange={(e) => updateServiceItem(item.id, { includedHours: parseInt(e.target.value) || 0 })}
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          R$ {item.monthlyCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-sm text-muted-foreground">Custo Mensal</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {item.includedHours * item.userCount}h
                        </div>
                        <div className="text-sm text-muted-foreground">Horas Incluídas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {item.additionalHours}h
                        </div>
                        <div className="text-sm text-muted-foreground">Horas Adicionais</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          R$ {item.additionalHoursCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-sm text-muted-foreground">Custo Adicional</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {serviceItems.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum serviço adicionado</h3>
                    <p className="text-muted-foreground mb-4">
                      Adicione serviços do catálogo ou crie um serviço personalizado
                    </p>
                    <Button onClick={addServiceItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Primeiro Serviço
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="configuration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Contrato</CardTitle>
                <CardDescription>
                  Defina o período do contrato e nível de serviço padrão
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Período do Contrato</Label>
                    <Select
                      value={contractPeriod.toString()}
                      onValueChange={(value) => setContractPeriod(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_DESK_CONTRACT_PERIODS.map(period => (
                          <SelectItem key={period.value} value={period.value.toString()}>
                            {period.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Nível de Serviço Padrão</Label>
                    <Select
                      value={selectedServiceLevel}
                      onValueChange={(value) => setSelectedServiceLevel(value as ServiceDeskServiceLevel)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_DESK_SERVICE_LEVELS.map(level => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Observações adicionais sobre a proposta..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                  <div className="text-2xl font-bold">{totals.totalUsers}</div>
                  <div className="text-sm text-muted-foreground">Total de Usuários</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <DollarSign className="h-8 w-8 mx-auto text-green-500 mb-2" />
                  <div className="text-2xl font-bold">
                    R$ {totals.totalSetupCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-muted-foreground">Custo de Setup</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Calculator className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                  <div className="text-2xl font-bold">
                    R$ {totals.monthlyCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-muted-foreground">Custo Mensal</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                  <div className="text-2xl font-bold">{totals.totalIncludedHours}h</div>
                  <div className="text-sm text-muted-foreground">Horas Incluídas</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Custo de Setup:</span>
                    <span className="font-semibold">
                      R$ {totals.totalSetupCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Custo Mensal Base:</span>
                    <span className="font-semibold">
                      R$ {totals.monthlyCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Horas Adicionais:</span>
                    <span className="font-semibold">
                      R$ {totals.additionalHoursCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Mensal:</span>
                    <span className="font-semibold">
                      R$ {(totals.monthlyCost + totals.additionalHoursCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Anual:</span>
                    <span className="font-semibold">
                      R$ {((totals.monthlyCost + totals.additionalHoursCost) * 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold">Total do Contrato ({contractPeriod} meses):</span>
                    <span className="font-bold text-primary">
                      R$ {(totals.totalSetupCost + ((totals.monthlyCost + totals.additionalHoursCost) * contractPeriod)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Métricas Esperadas */}
            {serviceItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Métricas Esperadas</CardTitle>
                  <CardDescription>
                    Baseado nos níveis de serviço selecionados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {(() => {
                          const metrics = calculateExpectedMetrics({
                            serviceItems,
                            totals,
                            clientData,
                            serviceLevel: selectedServiceLevel,
                            slaConfiguration: [],
                            contractType: ServiceDeskContractType.ANNUAL,
                            status: 'Rascunho',
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            validUntil: new Date(),
                            version: 1,
                            id: ''
                          })
                          return `${metrics.averageResolutionTime}h`
                        })()}
                      </div>
                      <div className="text-sm text-muted-foreground">Tempo Médio Resolução</div>
                    </div>
                    
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {(() => {
                          const metrics = calculateExpectedMetrics({
                            serviceItems,
                            totals,
                            clientData,
                            serviceLevel: selectedServiceLevel,
                            slaConfiguration: [],
                            contractType: ServiceDeskContractType.ANNUAL,
                            status: 'Rascunho',
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            validUntil: new Date(),
                            version: 1,
                            id: ''
                          })
                          return `${metrics.slaCompliance}%`
                        })()}
                      </div>
                      <div className="text-sm text-muted-foreground">SLA Compliance</div>
                    </div>
                    
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">
                        {(() => {
                          const metrics = calculateExpectedMetrics({
                            serviceItems,
                            totals,
                            clientData,
                            serviceLevel: selectedServiceLevel,
                            slaConfiguration: [],
                            contractType: ServiceDeskContractType.ANNUAL,
                            status: 'Rascunho',
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            validUntil: new Date(),
                            version: 1,
                            id: ''
                          })
                          return `${metrics.customerSatisfaction}%`
                        })()}
                      </div>
                      <div className="text-sm text-muted-foreground">Satisfação Cliente</div>
                    </div>
                    
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">
                        R$ {(() => {
                          const metrics = calculateExpectedMetrics({
                            serviceItems,
                            totals,
                            clientData,
                            serviceLevel: selectedServiceLevel,
                            slaConfiguration: [],
                            contractType: ServiceDeskContractType.ANNUAL,
                            status: 'Rascunho',
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            validUntil: new Date(),
                            version: 1,
                            id: ''
                          })
                          return metrics.costPerTicket.toFixed(2)
                        })()}
                      </div>
                      <div className="text-sm text-muted-foreground">Custo por Ticket</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={onBack}>
                Cancelar
              </Button>
              <Button onClick={generateProposal} className="px-8">
                <FileText className="h-4 w-4 mr-2" />
                {editingProposalId ? 'Atualizar Proposta' : 'Gerar Proposta'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}