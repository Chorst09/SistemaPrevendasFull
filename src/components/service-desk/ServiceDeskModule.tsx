"use client"

import { useState, useEffect } from "react"
import { Headphones, Calculator, Users, Settings, DollarSign, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ServiceDeskCalculatorModule } from "@/components/service-desk/ServiceDeskCalculatorModule"
import { ServiceDeskManagementModule } from "@/components/service-desk/ServiceDeskManagementModule"
import { SLAManagementModule } from "@/components/service-desk/SLAManagementModule"
import { ServiceDeskReportsModule } from "@/components/service-desk/ServiceDeskReportsModule"
import { ServiceDeskPricingModule } from "@/components/service-desk/ServiceDeskPricingModule"
import { 
  ServiceDeskService, 
  ServiceDeskSLA, 
  ServiceDeskServiceLevel,
  ServiceDeskTicketPriority,
  ServiceDeskTicketCategory
} from "@/lib/types/service-desk"

type ModuleType = "home" | "calculator" | "services" | "sla" | "reports" | "pricing" | "new-service"

interface ServiceDeskModuleProps {
  onNavigateToProposals?: () => void
  editingProposalId?: string | null
  onFinishEditing?: () => void
}

export function ServiceDeskModule({ 
  onNavigateToProposals, 
  editingProposalId, 
  onFinishEditing 
}: ServiceDeskModuleProps = {}) {
  const [currentModule, setCurrentModule] = useState<ModuleType>("home")
  const [selectedService, setSelectedService] = useState<ServiceDeskService | null>(null)

  // Effect to navigate to calculator when editing mode is active
  useEffect(() => {
    if (editingProposalId && currentModule !== "calculator") {
      setCurrentModule("calculator")
    }
  }, [editingProposalId, currentModule])

  // Dados de exemplo para demonstração
  const [services, setServices] = useState<ServiceDeskService[]>([
    {
      id: "1",
      name: "Suporte Básico",
      description: "Suporte técnico básico durante horário comercial",
      category: ServiceDeskTicketCategory.OTHER,
      serviceLevel: ServiceDeskServiceLevel.BASIC,
      baseCost: 25.00,
      setupCost: 100.00,
      minimumUsers: 10,
      maximumUsers: 100,
      includedHours: 2,
      additionalHourCost: 80.00,
      slaIds: ["1", "2"],
      features: [
        "Suporte 8x5 (horário comercial)",
        "Email e telefone",
        "SLA básico",
        "Até 2 tickets por usuário/mês"
      ],
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "2",
      name: "Suporte Padrão",
      description: "Suporte técnico padrão com disponibilidade estendida",
      category: ServiceDeskTicketCategory.OTHER,
      serviceLevel: ServiceDeskServiceLevel.STANDARD,
      baseCost: 45.00,
      setupCost: 200.00,
      minimumUsers: 20,
      maximumUsers: 500,
      includedHours: 3,
      additionalHourCost: 90.00,
      slaIds: ["1", "2", "3"],
      features: [
        "Suporte 12x5 (horário estendido)",
        "Email, telefone e chat",
        "SLA padrão",
        "Até 4 tickets por usuário/mês",
        "Acesso remoto"
      ],
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "3",
      name: "Suporte Premium",
      description: "Suporte técnico premium com alta disponibilidade",
      category: ServiceDeskTicketCategory.OTHER,
      serviceLevel: ServiceDeskServiceLevel.PREMIUM,
      baseCost: 75.00,
      setupCost: 500.00,
      minimumUsers: 50,
      maximumUsers: 1000,
      includedHours: 4,
      additionalHourCost: 100.00,
      slaIds: ["1", "2", "3", "4"],
      features: [
        "Suporte 24x5 (24h dias úteis)",
        "Todos os canais de comunicação",
        "SLA premium",
        "Tickets ilimitados",
        "Acesso remoto",
        "Suporte on-site"
      ],
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "4",
      name: "Suporte Empresarial",
      description: "Suporte técnico empresarial 24x7",
      category: ServiceDeskTicketCategory.OTHER,
      serviceLevel: ServiceDeskServiceLevel.ENTERPRISE,
      baseCost: 120.00,
      setupCost: 1000.00,
      minimumUsers: 100,
      maximumUsers: 5000,
      includedHours: 6,
      additionalHourCost: 120.00,
      slaIds: ["1", "2", "3", "4", "5"],
      features: [
        "Suporte 24x7 (24h todos os dias)",
        "Todos os canais + WhatsApp",
        "SLA empresarial",
        "Tickets ilimitados",
        "Acesso remoto",
        "Suporte on-site prioritário",
        "Gerente de conta dedicado"
      ],
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ])

  const [slas, setSlas] = useState<ServiceDeskSLA[]>([
    {
      id: "1",
      name: "Crítico - Hardware",
      priority: ServiceDeskTicketPriority.CRITICAL,
      category: ServiceDeskTicketCategory.HARDWARE,
      responseTime: 15,
      resolutionTime: 4,
      escalationTime: 2,
      businessHoursOnly: false,
      description: "SLA para problemas críticos de hardware",
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "2",
      name: "Alto - Software",
      priority: ServiceDeskTicketPriority.HIGH,
      category: ServiceDeskTicketCategory.SOFTWARE,
      responseTime: 30,
      resolutionTime: 8,
      escalationTime: 4,
      businessHoursOnly: true,
      description: "SLA para problemas de alta prioridade em software",
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "3",
      name: "Médio - Rede",
      priority: ServiceDeskTicketPriority.MEDIUM,
      category: ServiceDeskTicketCategory.NETWORK,
      responseTime: 60,
      resolutionTime: 24,
      escalationTime: 8,
      businessHoursOnly: true,
      description: "SLA para problemas de rede de prioridade média",
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "4",
      name: "Baixo - Geral",
      priority: ServiceDeskTicketPriority.LOW,
      category: ServiceDeskTicketCategory.OTHER,
      responseTime: 120,
      resolutionTime: 72,
      escalationTime: 24,
      businessHoursOnly: true,
      description: "SLA para solicitações de baixa prioridade",
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ])

  const handleBack = () => {
    setCurrentModule("home")
  }

  if (currentModule === "calculator") {
    return (
      <ServiceDeskCalculatorModule 
        onBack={handleBack} 
        onNavigateToProposals={onNavigateToProposals} 
        services={services} 
        slas={slas}
        editingProposalId={editingProposalId}
        onFinishEditing={onFinishEditing}
      />
    )
  }

  if (currentModule === "services") {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mb-6">
          <Button onClick={handleBack} variant="outline">
            ← Voltar
          </Button>
        </div>
        <ServiceDeskManagementModule
          services={services}
          onUpdateServices={setServices}
          onPriceService={(service) => {
            setSelectedService(service)
            setCurrentModule("pricing")
          }}
          onCreateNewService={() => {
            setSelectedService(null)
            setCurrentModule("new-service")
          }}
        />
      </div>
    )
  }

  if (currentModule === "sla") {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mb-6">
          <Button onClick={handleBack} variant="outline">
            ← Voltar
          </Button>
        </div>
        <SLAManagementModule 
          slas={slas} 
          onUpdateSlas={setSlas} 
        />
      </div>
    )
  }

  if (currentModule === "reports") {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mb-6">
          <Button onClick={handleBack} variant="outline">
            ← Voltar
          </Button>
        </div>
        <ServiceDeskReportsModule 
          services={services} 
          slas={slas} 
        />
      </div>
    )
  }

  if (currentModule === "pricing" && selectedService) {
    return (
      <ServiceDeskPricingModule
        service={selectedService}
        onBack={handleBack}
        onUpdateService={(updatedService) => {
          const updatedServices = services.map(s =>
            s.id === updatedService.id ? updatedService : s
          )
          setServices(updatedServices)
          setCurrentModule("services")
        }}
      />
    )
  }

  if (currentModule === "new-service") {
    return (
      <ServiceDeskPricingModule
        service={null}
        onBack={handleBack}
        onUpdateService={(newService) => {
          setServices([...services, newService])
          setCurrentModule("services")
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5">
      <header className="glass-effect border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center tech-glow">
                <Headphones className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-[var(--font-heading)]">Service Desk</h1>
                <p className="text-xs text-muted-foreground">Sistema de Precificação</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                Módulo: {currentModule}
              </Badge>
              {currentModule !== "home" && (
                <Button onClick={() => setCurrentModule("home")} variant="outline" size="sm">
                  🏠 Início
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 text-center relative">
          <Badge variant="outline" className="mb-6 px-4 py-2 text-sm font-medium border-[hsl(var(--accent-cyan)/0.5)] bg-[hsl(var(--accent-cyan)/0.1)] text-[hsl(var(--accent-cyan))]">
            <Headphones className="w-4 h-4 mr-2" />
            Calculadora de Service Desk
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 font-[var(--font-heading)] leading-tight">
            <span className="gradient-primary bg-clip-text text-transparent">Service Desk</span>
            <br />
            <span className="text-foreground">Inteligente</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto font-[var(--font-body)] leading-relaxed">
            Calcule o custo total de Service Desk com base no número de usuários,
            nível de serviço e SLAs personalizados para sua empresa.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              size="lg" 
              className="px-8 py-4 text-lg hover-lift btn-primary-modern" 
              onClick={() => setCurrentModule("calculator")}
            >
              <Calculator className="h-5 w-5 mr-2" />
              Iniciar Cálculo
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 font-[var(--font-heading)]">
              Funcionalidades do Sistema
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-[var(--font-body)]">
              Tudo que você precisa para calcular e gerenciar contratos de Service Desk
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover-lift card-modern relative overflow-hidden group cursor-pointer" onClick={() => setCurrentModule("services")}>
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-[hsl(var(--accent-cyan))] to-[hsl(var(--primary-600))] rounded-2xl flex items-center justify-center mb-6 tech-glow">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-[var(--font-heading)]">Gestão de Serviços</CardTitle>
                <CardDescription className="text-sm font-[var(--font-body)]">
                  Cadastre e gerencie serviços de TI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[hsl(var(--accent-cyan))]">{services.length}</div>
                  <div className="text-sm text-muted-foreground">Serviços cadastrados</div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift card-modern relative overflow-hidden group cursor-pointer" onClick={() => setCurrentModule("sla")}>
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-[hsl(var(--accent-orange))] to-[hsl(var(--primary-600))] rounded-2xl flex items-center justify-center mb-6 tech-glow-orange">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-[var(--font-heading)]">Gestão de SLA</CardTitle>
                <CardDescription className="text-sm font-[var(--font-body)]">
                  Configure SLAs e tempos de resposta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[hsl(var(--accent-orange))]">{slas.length}</div>
                  <div className="text-sm text-muted-foreground">SLAs configurados</div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift card-modern relative overflow-hidden group cursor-pointer" onClick={() => setCurrentModule("reports")}>
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-[hsl(var(--accent-green))] to-[hsl(var(--primary-600))] rounded-2xl flex items-center justify-center mb-6 tech-glow">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-[var(--font-heading)]">Relatórios</CardTitle>
                <CardDescription className="text-sm font-[var(--font-body)]">
                  Análises e métricas de custos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[hsl(var(--accent-green))]">
                    {services.filter(s => s.active).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Serviços ativos</div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift card-modern relative overflow-hidden group cursor-pointer" onClick={() => setCurrentModule("calculator")}>
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-[hsl(var(--accent-purple))] to-[hsl(var(--primary-600))] rounded-2xl flex items-center justify-center mb-6 tech-glow">
                  <Calculator className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-[var(--font-heading)]">Calculadora</CardTitle>
                <CardDescription className="text-sm font-[var(--font-body)]">
                  Gerar propostas de Service Desk
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-lg font-bold text-[hsl(var(--accent-purple))]">Criar</div>
                  <div className="text-sm text-muted-foreground">Nova proposta</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Seção de Instruções */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Como Usar o Sistema</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Siga estes passos para configurar e calcular custos de Service Desk
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-blue-600">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Cadastrar Serviços</h3>
                  <p className="text-sm text-muted-foreground">
                    Adicione os serviços de TI com níveis e custos
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-orange-600">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Configurar SLAs</h3>
                  <p className="text-sm text-muted-foreground">
                    Defina tempos de resposta e resolução por categoria
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-green-600">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Calcular Custos</h3>
                  <p className="text-sm text-muted-foreground">
                    O sistema calcula automaticamente baseado nos usuários
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-purple-600">4</span>
                  </div>
                  <h3 className="font-semibold mb-2">Gerar Propostas</h3>
                  <p className="text-sm text-muted-foreground">
                    Crie propostas personalizadas com SLAs definidos
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-8">
              <Badge variant="outline" className="text-sm">
                💡 Dica: Comece definindo os níveis de serviço e depois configure os SLAs
              </Badge>
            </div>
          </div>
        </section>
      </section>
    </div>
  )
}