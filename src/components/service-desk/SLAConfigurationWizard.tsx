"use client"

import { useState } from "react"
import { Check, Clock, AlertTriangle, Settings, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ServiceDeskSLA, 
  ServiceDeskTicketPriority, 
  ServiceDeskTicketCategory,
  ServiceDeskServiceLevel
} from "@/lib/types/service-desk"
import { 
  SERVICE_DESK_TICKET_PRIORITIES, 
  SERVICE_DESK_TICKET_CATEGORIES,
  DEFAULT_SLA_TEMPLATES
} from "@/lib/constants/service-desk"

interface SLAConfigurationWizardProps {
  serviceLevel: ServiceDeskServiceLevel
  onSLAsConfigured: (slas: ServiceDeskSLA[]) => void
  onClose: () => void
  existingSLAs?: ServiceDeskSLA[]
}

export function SLAConfigurationWizard({
  serviceLevel,
  onSLAsConfigured,
  onClose,
  existingSLAs = []
}: SLAConfigurationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [configuredSLAs, setConfiguredSLAs] = useState<ServiceDeskSLA[]>(existingSLAs)
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")

  const steps = [
    { id: 'template', title: 'Escolher Template', description: 'Selecione um template base' },
    { id: 'customize', title: 'Personalizar', description: 'Ajuste os tempos conforme necessário' },
    { id: 'review', title: 'Revisar', description: 'Confirme a configuração final' }
  ]

  // Aplicar template selecionado
  const applyTemplate = (templateName: string) => {
    const template = DEFAULT_SLA_TEMPLATES.find(t => t.name === templateName)
    if (!template) return

    const newSLAs: ServiceDeskSLA[] = template.slas.map((sla, index) => ({
      id: `sla-${Date.now()}-${index}`,
      ...sla,
      createdAt: new Date(),
      updatedAt: new Date()
    }))

    setConfiguredSLAs(newSLAs)
    setSelectedTemplate(templateName)
    setCurrentStep(1)
  }

  // Atualizar SLA específico
  const updateSLA = (slaId: string, updates: Partial<ServiceDeskSLA>) => {
    setConfiguredSLAs(slas => slas.map(sla => 
      sla.id === slaId ? { ...sla, ...updates, updatedAt: new Date() } : sla
    ))
  }

  // Adicionar novo SLA personalizado
  const addCustomSLA = () => {
    const newSLA: ServiceDeskSLA = {
      id: `custom-sla-${Date.now()}`,
      name: 'SLA Personalizado',
      priority: ServiceDeskTicketPriority.MEDIUM,
      category: ServiceDeskTicketCategory.OTHER,
      responseTime: 60,
      resolutionTime: 24,
      escalationTime: 8,
      businessHoursOnly: true,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setConfiguredSLAs([...configuredSLAs, newSLA])
  }

  // Remover SLA
  const removeSLA = (slaId: string) => {
    setConfiguredSLAs(slas => slas.filter(sla => sla.id !== slaId))
  }

  // Finalizar configuração
  const finishConfiguration = () => {
    onSLAsConfigured(configuredSLAs)
    onClose()
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`
  }

  const formatResolutionTime = (hours: number) => {
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Configuração de SLAs</h2>
              <p className="text-muted-foreground">
                Configure os acordos de nível de serviço para {serviceLevel}
              </p>
            </div>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mt-6 space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <div className="ml-2 text-sm">
                  <div className="font-medium">{step.title}</div>
                  <div className="text-muted-foreground">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-8 h-px bg-gray-300 mx-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: Template Selection */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Escolha um Template Base</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {DEFAULT_SLA_TEMPLATES.map(template => (
                    <Card 
                      key={template.name} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => applyTemplate(template.name)}
                    >
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">{template.name}</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {template.description}
                        </p>
                        <div className="space-y-1">
                          {template.slas.slice(0, 3).map((sla, index) => (
                            <div key={index} className="text-xs text-muted-foreground">
                              • {sla.priority} - {formatTime(sla.responseTime)} resposta
                            </div>
                          ))}
                          {template.slas.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              + {template.slas.length - 3} mais...
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setConfiguredSLAs([])
                      setCurrentStep(1)
                    }}
                  >
                    Criar do Zero
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Customization */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Personalizar SLAs</h3>
                <Button onClick={addCustomSLA} variant="outline" size="sm">
                  Adicionar SLA
                </Button>
              </div>

              <div className="space-y-4">
                {configuredSLAs.map((sla, index) => (
                  <Card key={sla.id}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Nome</Label>
                          <Input
                            value={sla.name}
                            onChange={(e) => updateSLA(sla.id, { name: e.target.value })}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Prioridade</Label>
                          <Select
                            value={sla.priority}
                            onValueChange={(value) => updateSLA(sla.id, { priority: value as ServiceDeskTicketPriority })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {SERVICE_DESK_TICKET_PRIORITIES.map(priority => (
                                <SelectItem key={priority.value} value={priority.value}>
                                  {priority.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Categoria</Label>
                          <Select
                            value={sla.category}
                            onValueChange={(value) => updateSLA(sla.id, { category: value as ServiceDeskTicketCategory })}
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

                        <div className="flex items-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeSLA(sla.id)}
                            className="text-red-600"
                          >
                            Remover
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="space-y-2">
                          <Label>Tempo Resposta (min)</Label>
                          <Input
                            type="number"
                            value={sla.responseTime}
                            onChange={(e) => updateSLA(sla.id, { responseTime: parseInt(e.target.value) || 0 })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Tempo Resolução (h)</Label>
                          <Input
                            type="number"
                            value={sla.resolutionTime}
                            onChange={(e) => updateSLA(sla.id, { resolutionTime: parseInt(e.target.value) || 0 })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Tempo Escalação (h)</Label>
                          <Input
                            type="number"
                            value={sla.escalationTime}
                            onChange={(e) => updateSLA(sla.id, { escalationTime: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 mt-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={sla.businessHoursOnly}
                            onCheckedChange={(checked) => updateSLA(sla.id, { businessHoursOnly: checked })}
                          />
                          <Label>Apenas horário comercial</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={sla.active}
                            onCheckedChange={(checked) => updateSLA(sla.id, { active: checked })}
                          />
                          <Label>Ativo</Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {configuredSLAs.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Nenhum SLA configurado</h3>
                      <p className="text-muted-foreground mb-4">
                        Adicione SLAs para definir os tempos de resposta e resolução
                      </p>
                      <Button onClick={addCustomSLA}>
                        Adicionar Primeiro SLA
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(0)}>
                  Voltar
                </Button>
                <Button 
                  onClick={() => setCurrentStep(2)}
                  disabled={configuredSLAs.length === 0}
                >
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Revisar Configuração</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Resumo dos SLAs */}
                <Card>
                  <CardHeader>
                    <CardTitle>SLAs Configurados</CardTitle>
                    <CardDescription>
                      {configuredSLAs.length} SLA(s) para {serviceLevel}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {configuredSLAs.map(sla => (
                        <div key={sla.id} className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{sla.name}</span>
                            <Badge variant="outline">{sla.priority}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>Resposta: {formatTime(sla.responseTime)}</div>
                            <div>Resolução: {formatResolutionTime(sla.resolutionTime)}</div>
                            <div>Horário: {sla.businessHoursOnly ? 'Comercial' : '24x7'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Métricas Calculadas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Métricas Esperadas</CardTitle>
                    <CardDescription>
                      Baseado na configuração atual
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <Zap className="h-6 w-6 mx-auto text-blue-500 mb-1" />
                        <div className="font-bold text-blue-600">
                          {formatTime(Math.round(configuredSLAs.reduce((sum, sla) => sum + sla.responseTime, 0) / configuredSLAs.length))}
                        </div>
                        <div className="text-sm text-muted-foreground">Tempo Médio Resposta</div>
                      </div>

                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <Clock className="h-6 w-6 mx-auto text-green-500 mb-1" />
                        <div className="font-bold text-green-600">
                          {formatResolutionTime(Math.round(configuredSLAs.reduce((sum, sla) => sum + sla.resolutionTime, 0) / configuredSLAs.length))}
                        </div>
                        <div className="text-sm text-muted-foreground">Tempo Médio Resolução</div>
                      </div>

                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <AlertTriangle className="h-6 w-6 mx-auto text-orange-500 mb-1" />
                        <div className="font-bold text-orange-600">
                          {configuredSLAs.filter(sla => sla.priority === ServiceDeskTicketPriority.CRITICAL).length}
                        </div>
                        <div className="text-sm text-muted-foreground">SLAs Críticos</div>
                      </div>

                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <Settings className="h-6 w-6 mx-auto text-purple-500 mb-1" />
                        <div className="font-bold text-purple-600">
                          {Math.round((configuredSLAs.filter(sla => sla.active).length / configuredSLAs.length) * 100)}%
                        </div>
                        <div className="text-sm text-muted-foreground">SLAs Ativos</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Voltar
                </Button>
                <Button onClick={finishConfiguration}>
                  Aplicar Configuração
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}