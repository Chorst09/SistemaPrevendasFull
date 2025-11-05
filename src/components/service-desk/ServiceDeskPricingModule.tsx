"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Save, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  ServiceDeskService, 
  ServiceDeskServiceLevel, 
  ServiceDeskTicketCategory 
} from "@/lib/types/service-desk"
import { 
  SERVICE_DESK_SERVICE_LEVELS, 
  SERVICE_DESK_TICKET_CATEGORIES,
  DEFAULT_SERVICE_DESK_METRICS
} from "@/lib/constants/service-desk"
import { useToast } from "@/hooks/use-toast"

interface ServiceDeskPricingModuleProps {
  service: ServiceDeskService | null
  onBack: () => void
  onUpdateService: (service: ServiceDeskService) => void
}

export function ServiceDeskPricingModule({
  service,
  onBack,
  onUpdateService
}: ServiceDeskPricingModuleProps) {
  const { toast } = useToast()
  const isEditing = !!service

  const [formData, setFormData] = useState<Partial<ServiceDeskService>>({
    name: "",
    description: "",
    category: ServiceDeskTicketCategory.OTHER,
    serviceLevel: ServiceDeskServiceLevel.STANDARD,
    baseCost: 45.00,
    setupCost: 200.00,
    minimumUsers: 10,
    maximumUsers: 500,
    includedHours: 3,
    additionalHourCost: 90.00,
    slaIds: [],
    features: [],
    active: true
  })

  const [newFeature, setNewFeature] = useState("")
  const [calculatedMetrics, setCalculatedMetrics] = useState({
    estimatedTicketsPerUser: 0,
    estimatedResolutionTime: 0,
    costPerTicket: 0,
    monthlyRevenue: 0
  })

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description,
        category: service.category,
        serviceLevel: service.serviceLevel,
        baseCost: service.baseCost,
        setupCost: service.setupCost,
        minimumUsers: service.minimumUsers,
        maximumUsers: service.maximumUsers,
        includedHours: service.includedHours,
        additionalHourCost: service.additionalHourCost,
        slaIds: service.slaIds,
        features: service.features,
        active: service.active
      })
    }
  }, [service])

  useEffect(() => {
    calculateMetrics()
  }, [formData.serviceLevel, formData.baseCost, formData.minimumUsers])

  const calculateMetrics = () => {
    if (!formData.serviceLevel || !formData.baseCost || !formData.minimumUsers) return

    const metrics = DEFAULT_SERVICE_DESK_METRICS[formData.serviceLevel]
    const estimatedTicketsPerUser = metrics.averageTicketsPerUser
    const estimatedResolutionTime = metrics.averageResolutionTime
    const costPerTicket = formData.baseCost / estimatedTicketsPerUser
    const monthlyRevenue = formData.baseCost * formData.minimumUsers

    setCalculatedMetrics({
      estimatedTicketsPerUser,
      estimatedResolutionTime,
      costPerTicket,
      monthlyRevenue
    })
  }

  const addFeature = () => {
    if (newFeature.trim() && formData.features) {
      setFormData(prev => ({
        ...prev,
        features: [...(prev.features || []), newFeature.trim()]
      }))
      setNewFeature("")
    }
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || []
    }))
  }

  const handleSave = () => {
    if (!formData.name || !formData.description || !formData.baseCost) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      })
      return
    }

    const serviceData: ServiceDeskService = {
      id: service?.id || Date.now().toString(),
      name: formData.name!,
      description: formData.description!,
      category: formData.category!,
      serviceLevel: formData.serviceLevel!,
      baseCost: formData.baseCost!,
      setupCost: formData.setupCost || 0,
      minimumUsers: formData.minimumUsers || 1,
      maximumUsers: formData.maximumUsers,
      includedHours: formData.includedHours || 0,
      additionalHourCost: formData.additionalHourCost || 0,
      slaIds: formData.slaIds || [],
      features: formData.features || [],
      active: formData.active !== false,
      createdAt: service?.createdAt || new Date(),
      updatedAt: new Date()
    }

    onUpdateService(serviceData)

    toast({
      title: isEditing ? "Serviço atualizado" : "Serviço criado",
      description: `${serviceData.name} foi ${isEditing ? 'atualizado' : 'criado'} com sucesso.`
    })
  }

  const getServiceLevelInfo = (level: ServiceDeskServiceLevel) => {
    return SERVICE_DESK_SERVICE_LEVELS.find(l => l.value === level)
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
                <h1 className="text-2xl font-bold">
                  {isEditing ? "Editar Serviço" : "Novo Serviço"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEditing ? `Editando: ${service?.name}` : "Criar novo serviço de Service Desk"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {formData.serviceLevel || "Não definido"}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário Principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>
                  Dados principais do serviço de Service Desk
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Serviço *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Suporte Técnico Nível 1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nível de Serviço *</Label>
                    <Select
                      value={formData.serviceLevel}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, serviceLevel: value as ServiceDeskServiceLevel }))}
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
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o serviço de Service Desk..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as ServiceDeskTicketCategory }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_DESK_TICKET_CATEGORIES.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.icon} {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
                  />
                  <Label htmlFor="active">Serviço ativo</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Precificação</CardTitle>
                <CardDescription>
                  Configure os custos e limites do serviço
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="baseCost">Custo Base por Usuário (R$) *</Label>
                    <Input
                      id="baseCost"
                      type="number"
                      step="0.01"
                      value={formData.baseCost}
                      onChange={(e) => setFormData(prev => ({ ...prev, baseCost: parseFloat(e.target.value) || 0 }))}
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="setupCost">Custo de Setup (R$)</Label>
                    <Input
                      id="setupCost"
                      type="number"
                      step="0.01"
                      value={formData.setupCost}
                      onChange={(e) => setFormData(prev => ({ ...prev, setupCost: parseFloat(e.target.value) || 0 }))}
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minimumUsers">Mínimo de Usuários</Label>
                    <Input
                      id="minimumUsers"
                      type="number"
                      value={formData.minimumUsers}
                      onChange={(e) => setFormData(prev => ({ ...prev, minimumUsers: parseInt(e.target.value) || 0 }))}
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maximumUsers">Máximo de Usuários</Label>
                    <Input
                      id="maximumUsers"
                      type="number"
                      value={formData.maximumUsers || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, maximumUsers: e.target.value ? parseInt(e.target.value) : undefined }))}
                      min="1"
                      placeholder="Sem limite"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="includedHours">Horas Incluídas/Usuário</Label>
                    <Input
                      id="includedHours"
                      type="number"
                      value={formData.includedHours}
                      onChange={(e) => setFormData(prev => ({ ...prev, includedHours: parseInt(e.target.value) || 0 }))}
                      min="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalHourCost">Custo por Hora Adicional (R$)</Label>
                  <Input
                    id="additionalHourCost"
                    type="number"
                    step="0.01"
                    value={formData.additionalHourCost}
                    onChange={(e) => setFormData(prev => ({ ...prev, additionalHourCost: parseFloat(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Funcionalidades</CardTitle>
                <CardDescription>
                  Liste as funcionalidades incluídas neste serviço
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Digite uma funcionalidade..."
                    onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                  />
                  <Button onClick={addFeature} disabled={!newFeature.trim()}>
                    Adicionar
                  </Button>
                </div>

                {formData.features && formData.features.length > 0 && (
                  <div className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{feature}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFeature(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remover
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {formData.serviceLevel && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Funcionalidades Padrão do Nível:</Label>
                    <div className="mt-2 space-y-1">
                      {getServiceLevelInfo(formData.serviceLevel)?.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Painel de Métricas */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Métricas Calculadas</CardTitle>
                <CardDescription>
                  Estimativas baseadas no nível de serviço
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {calculatedMetrics.estimatedTicketsPerUser}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Tickets por usuário/mês
                  </div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {calculatedMetrics.estimatedResolutionTime}h
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Tempo médio de resolução
                  </div>
                </div>

                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    R$ {calculatedMetrics.costPerTicket.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Custo por ticket
                  </div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    R$ {calculatedMetrics.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Receita mensal mínima
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo do Serviço</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Nível:</span>
                  <Badge>{formData.serviceLevel}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Categoria:</span>
                  <span className="text-sm">{formData.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Custo/usuário:</span>
                  <span className="text-sm font-medium">
                    R$ {formData.baseCost?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Setup:</span>
                  <span className="text-sm font-medium">
                    R$ {formData.setupCost?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Horas incluídas:</span>
                  <span className="text-sm font-medium">
                    {formData.includedHours || 0}h/usuário
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Usuários:</span>
                  <span className="text-sm font-medium">
                    {formData.minimumUsers} - {formData.maximumUsers || '∞'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Button onClick={handleSave} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? "Atualizar Serviço" : "Criar Serviço"}
              </Button>
              <Button variant="outline" onClick={onBack} className="w-full">
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}