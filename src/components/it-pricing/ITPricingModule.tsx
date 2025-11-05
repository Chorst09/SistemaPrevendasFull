"use client"

import { useState } from "react"
import { ShoppingCart, Calendar, Wrench, BarChart3, Users, Settings, Zap, Shield, TrendingUp, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { MobileNav } from "@/components/mobile-nav"
import { SalesModule } from "./SalesModule"
import { RentalModule } from "./RentalModule"
import { ServiceModule } from "./ServiceModule"
import { AdminModule } from "./AdminModule"
import { ProposalCreation } from "./ProposalCreation"
import { ProposalsManagement } from "./ProposalsManagement"

type ModuleType = "home" | "sales" | "rental" | "services" | "admin" | "proposal" | "proposals"

interface ITPricingModuleProps {
    onNavigateToProposals?: () => void
}

export function ITPricingModule({ onNavigateToProposals }: ITPricingModuleProps = {}) {
    const [currentModule, setCurrentModule] = useState<ModuleType>("home")

    const handleBack = () => {
        setCurrentModule("home")
    }

    const handleNavigate = (module: string) => {
        setCurrentModule(module as ModuleType)
    }

    const handleModuleChange = (module: 'sales' | 'rental' | 'services') => {
        setCurrentModule(module)
    }

    if (currentModule === "sales") {
        return <SalesModule onBack={handleBack} onModuleChange={handleModuleChange} onNavigateToProposals={onNavigateToProposals} />
    }

    if (currentModule === "rental") {
        return <RentalModule onBack={handleBack} onModuleChange={handleModuleChange} onNavigateToProposals={onNavigateToProposals} />
    }

    if (currentModule === "services") {
        return <ServiceModule onBack={handleBack} onModuleChange={handleModuleChange} onNavigateToProposals={onNavigateToProposals} />
    }

    if (currentModule === "admin") {
        return <AdminModule onBack={handleBack} />
    }

    if (currentModule === "proposal") {
        return <ProposalCreation onBack={handleBack} onSelectModule={(module) => setCurrentModule(module as ModuleType)} />
    }

    if (currentModule === "proposals") {
        return <ProposalsManagement onBack={handleBack} />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5">
            <header className="glass-effect border-b sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center tech-glow">
                                <BarChart3 className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold font-[var(--font-heading)]">PricingPro TI</h1>
                                <p className="text-xs text-muted-foreground">Sistema Inteligente</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <nav className="hidden md:flex items-center space-x-8">
                                <Button
                                    variant="ghost"
                                    className="text-sm font-medium hover:text-primary transition-colors font-[var(--font-body)]"
                                    onClick={() => setCurrentModule("sales")}
                                >
                                    Vendas
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="text-sm font-medium hover:text-primary transition-colors font-[var(--font-body)]"
                                    onClick={() => setCurrentModule("rental")}
                                >
                                    Locação
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="text-sm font-medium hover:text-primary transition-colors font-[var(--font-body)]"
                                    onClick={() => setCurrentModule("services")}
                                >
                                    Serviços
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="text-sm font-medium hover:text-primary transition-colors font-[var(--font-body)]"
                                    onClick={() => setCurrentModule("proposals")}
                                >
                                    Propostas
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="text-sm font-medium hover:text-primary transition-colors font-[var(--font-body)]"
                                    onClick={() => setCurrentModule("admin")}
                                >
                                    Admin
                                </Button>
                            </nav>
                            <div className="flex items-center space-x-2">
                                <ThemeToggle />
                                <MobileNav onNavigate={handleNavigate} />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                <div className="container mx-auto px-4 text-center relative">
                    <Badge variant="outline" className="mb-6 px-4 py-2 text-sm font-medium border-[hsl(var(--accent-cyan)/0.5)] bg-[hsl(var(--accent-cyan)/0.1)] text-[hsl(var(--accent-cyan))]">
                        <Zap className="w-4 h-4 mr-2" />
                        Sistema Completo de Precificação
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-bold mb-8 font-[var(--font-heading)] leading-tight">
                        <span className="gradient-primary bg-clip-text text-transparent">Potencialize Seu Negócio</span>
                        <br />
                        <span className="text-foreground">com Precificação Inteligente</span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto font-[var(--font-body)] leading-relaxed">
                        Nossa solução inovadora de precificação foi projetada para profissionais de TI que exigem precisão e
                        flexibilidade. Personalize sua estratégia de preços sem esforço e eleve o potencial do seu negócio.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Button size="lg" className="px-8 py-4 text-lg hover-lift btn-primary-modern" onClick={() => setCurrentModule("proposal")}>
                            Nova Proposta
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="px-8 py-4 text-lg hover-lift btn-secondary-modern"
                            onClick={() => setCurrentModule("admin")}
                        >
                            Painel Administrativo
                        </Button>
                    </div>
                </div>
            </section>

            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-6 font-[var(--font-heading)]">
                            Otimize a Gestão dos Seus Produtos de TI
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-[var(--font-body)]">
                            Três módulos integrados que trabalham em harmonia para atender todas as necessidades de precificação do
                            seu negócio de TI
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="hover-lift card-modern relative overflow-hidden group bg-gradient-to-br from-[hsl(var(--primary-800))] to-[hsl(var(--primary-900))] border-[hsl(var(--primary-600)/0.5)]">
                            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--accent-cyan)/0.15)] to-[hsl(var(--primary-700)/0.3)] opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(var(--accent-cyan)/0.1)] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-x-[-100%] group-hover:translate-x-[100%]"></div>
                            <CardHeader className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-[hsl(var(--accent-cyan))] to-[hsl(var(--primary-600))] rounded-2xl flex items-center justify-center mb-6 tech-glow group-hover:scale-110 transition-transform duration-300">
                                    <ShoppingCart className="h-8 w-8 text-white" />
                                </div>
                                <CardTitle className="text-2xl font-[var(--font-heading)] text-white group-hover:text-[hsl(var(--accent-cyan))] transition-colors duration-300">Módulo de Vendas</CardTitle>
                                <CardDescription className="text-base font-[var(--font-body)] text-[hsl(var(--primary-300))] group-hover:text-white transition-colors duration-300">
                                    Precificação inteligente para produtos de hardware e software com IA integrada
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="relative">
                                <ul className="space-y-3 text-sm font-[var(--font-body)] mb-6">
                                    <li className="flex items-center text-[hsl(var(--primary-200))] group-hover:text-white transition-colors duration-300">
                                        <Shield className="w-4 h-4 mr-2 text-[hsl(var(--accent-cyan))] group-hover:scale-110 transition-transform duration-300" /> Cálculo automático de preços
                                    </li>
                                    <li className="flex items-center text-[hsl(var(--primary-200))] group-hover:text-white transition-colors duration-300">
                                        <TrendingUp className="w-4 h-4 mr-2 text-[hsl(var(--accent-cyan))] group-hover:scale-110 transition-transform duration-300" /> Descontos por volume inteligentes
                                    </li>
                                    <li className="flex items-center text-[hsl(var(--primary-200))] group-hover:text-white transition-colors duration-300">
                                        <BarChart3 className="w-4 h-4 mr-2 text-[hsl(var(--accent-cyan))] group-hover:scale-110 transition-transform duration-300" /> Margem de lucro configurável
                                    </li>
                                    <li className="flex items-center text-[hsl(var(--primary-200))] group-hover:text-white transition-colors duration-300">
                                        <Zap className="w-4 h-4 mr-2 text-[hsl(var(--accent-cyan))] group-hover:scale-110 transition-transform duration-300" /> Geração de cotações instantânea
                                    </li>
                                </ul>
                                <Button className="w-full bg-gradient-to-r from-[hsl(var(--accent-cyan))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--accent-cyan)/0.9)] hover:to-[hsl(var(--primary-500))] text-white hover-lift border-0 shadow-lg group-hover:shadow-[hsl(var(--accent-cyan)/0.4)] group-hover:shadow-2xl transition-all duration-300" onClick={() => setCurrentModule("sales")}>
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    Acessar Vendas
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="hover-lift card-modern relative overflow-hidden group bg-gradient-to-br from-[hsl(var(--primary-800))] to-[hsl(var(--primary-900))] border-[hsl(var(--primary-600)/0.5)]">
                            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--accent-orange)/0.15)] to-[hsl(var(--primary-700)/0.3)] opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(var(--accent-orange)/0.1)] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-x-[-100%] group-hover:translate-x-[100%]"></div>
                            <CardHeader className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-[hsl(var(--accent-orange))] to-[hsl(var(--primary-600))] rounded-2xl flex items-center justify-center mb-6 tech-glow-orange group-hover:scale-110 transition-transform duration-300">
                                    <Calendar className="h-8 w-8 text-white" />
                                </div>
                                <CardTitle className="text-2xl font-[var(--font-heading)] text-white group-hover:text-[hsl(var(--accent-orange))] transition-colors duration-300">Módulo de Locação</CardTitle>
                                <CardDescription className="text-base font-[var(--font-body)] text-[hsl(var(--primary-300))] group-hover:text-white transition-colors duration-300">
                                    Gestão completa de locação de equipamentos com controle avançado
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="relative">
                                <ul className="space-y-3 text-sm font-[var(--font-body)] mb-6">
                                    <li className="flex items-center text-[hsl(var(--primary-200))] group-hover:text-white transition-colors duration-300">
                                        <Shield className="w-4 h-4 mr-2 text-[hsl(var(--accent-orange))] group-hover:scale-110 transition-transform duration-300" /> Preços por período flexível
                                    </li>
                                    <li className="flex items-center text-[hsl(var(--primary-200))] group-hover:text-white transition-colors duration-300">
                                        <TrendingUp className="w-4 h-4 mr-2 text-[hsl(var(--accent-orange))] group-hover:scale-110 transition-transform duration-300" /> Controle de disponibilidade
                                    </li>
                                    <li className="flex items-center text-[hsl(var(--primary-200))] group-hover:text-white transition-colors duration-300">
                                        <BarChart3 className="w-4 h-4 mr-2 text-[hsl(var(--accent-orange))] group-hover:scale-110 transition-transform duration-300" /> Taxas de setup automatizadas
                                    </li>
                                    <li className="flex items-center text-[hsl(var(--primary-200))] group-hover:text-white transition-colors duration-300">
                                        <Zap className="w-4 h-4 mr-2 text-[hsl(var(--accent-orange))] group-hover:scale-110 transition-transform duration-300" /> Contratos inteligentes
                                    </li>
                                </ul>
                                <Button className="w-full bg-gradient-to-r from-[hsl(var(--accent-orange))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--accent-orange)/0.9)] hover:to-[hsl(var(--primary-500))] text-white hover-lift border-0 shadow-lg group-hover:shadow-[hsl(var(--accent-orange)/0.4)] group-hover:shadow-2xl transition-all duration-300" onClick={() => setCurrentModule("rental")}>
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Acessar Locação
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="hover-lift card-modern relative overflow-hidden group bg-gradient-to-br from-[hsl(var(--primary-800))] to-[hsl(var(--primary-900))] border-[hsl(var(--primary-600)/0.5)]">
                            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--accent-green)/0.15)] to-[hsl(var(--primary-700)/0.3)] opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(var(--accent-green)/0.1)] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-x-[-100%] group-hover:translate-x-[100%]"></div>
                            <CardHeader className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-[hsl(var(--accent-green))] to-[hsl(var(--primary-600))] rounded-2xl flex items-center justify-center mb-6 tech-glow group-hover:scale-110 transition-transform duration-300">
                                    <Wrench className="h-8 w-8 text-white" />
                                </div>
                                <CardTitle className="text-2xl font-[var(--font-heading)] text-white group-hover:text-[hsl(var(--accent-green))] transition-colors duration-300">Módulo de Serviços</CardTitle>
                                <CardDescription className="text-base font-[var(--font-body)] text-[hsl(var(--primary-300))] group-hover:text-white transition-colors duration-300">
                                    Precificação de consultoria, suporte e implementação personalizada
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="relative">
                                <ul className="space-y-3 text-sm font-[var(--font-body)] mb-6">
                                    <li className="flex items-center text-[hsl(var(--primary-200))] group-hover:text-white transition-colors duration-300">
                                        <Shield className="w-4 h-4 mr-2 text-[hsl(var(--accent-green))] group-hover:scale-110 transition-transform duration-300" /> Múltiplos modelos de cobrança
                                    </li>
                                    <li className="flex items-center text-[hsl(var(--primary-200))] group-hover:text-white transition-colors duration-300">
                                        <TrendingUp className="w-4 h-4 mr-2 text-[hsl(var(--accent-green))] group-hover:scale-110 transition-transform duration-300" /> Taxas de emergência dinâmicas
                                    </li>
                                    <li className="flex items-center text-[hsl(var(--primary-200))] group-hover:text-white transition-colors duration-300">
                                        <BarChart3 className="w-4 h-4 mr-2 text-[hsl(var(--accent-green))] group-hover:scale-110 transition-transform duration-300" /> Agendamento integrado
                                    </li>
                                    <li className="flex items-center text-[hsl(var(--primary-200))] group-hover:text-white transition-colors duration-300">
                                        <Zap className="w-4 h-4 mr-2 text-[hsl(var(--accent-green))] group-hover:scale-110 transition-transform duration-300" /> Propostas personalizadas
                                    </li>
                                </ul>
                                <Button className="w-full bg-gradient-to-r from-[hsl(var(--accent-green))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--accent-green)/0.9)] hover:to-[hsl(var(--primary-500))] text-white hover-lift border-0 shadow-lg group-hover:shadow-[hsl(var(--accent-green)/0.4)] group-hover:shadow-2xl transition-all duration-300" onClick={() => setCurrentModule("services")}>
                                    <Wrench className="w-4 h-4 mr-2" />
                                    Acessar Serviços
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Card de Propostas */}
                    <div className="mt-16">
                        <div className="text-center mb-8">
                            <h3 className="text-3xl font-bold mb-4 font-[var(--font-heading)]">
                                Gestão de Propostas
                            </h3>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-[var(--font-body)]">
                                Visualize, gerencie e acompanhe todas as suas propostas comerciais em um só lugar
                            </p>
                        </div>

                        <div className="max-w-2xl mx-auto">
                            <Card className="hover-lift card-modern relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--accent-purple)/0.1)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <CardHeader className="relative text-center">
                                    <div className="w-20 h-20 bg-gradient-to-br from-[hsl(var(--accent-purple))] to-[hsl(var(--accent-purple)/0.8)] rounded-3xl flex items-center justify-center mb-6 mx-auto tech-glow">
                                        <FileText className="h-10 w-10 text-white" />
                                    </div>
                                    <CardTitle className="text-2xl font-[var(--font-heading)]">Central de Propostas</CardTitle>
                                    <CardDescription className="text-base font-[var(--font-body)]">
                                        Acesse todas as propostas criadas, edite informações e gere PDFs profissionais
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="relative">
                                    <ul className="space-y-3 text-sm text-muted-foreground font-[var(--font-body)] mb-6">
                                        <li className="flex items-center justify-center">
                                            <Shield className="w-4 h-4 mr-2 text-[hsl(var(--accent-purple))]" /> Visualização completa de propostas
                                        </li>
                                        <li className="flex items-center justify-center">
                                            <TrendingUp className="w-4 h-4 mr-2 text-[hsl(var(--accent-purple))]" /> Edição de dados do cliente e projeto
                                        </li>
                                        <li className="flex items-center justify-center">
                                            <BarChart3 className="w-4 h-4 mr-2 text-[hsl(var(--accent-purple))]" /> Geração de PDF profissional
                                        </li>
                                        <li className="flex items-center justify-center">
                                            <Zap className="w-4 h-4 mr-2 text-[hsl(var(--accent-purple))]" /> Controle de status e acompanhamento
                                        </li>
                                    </ul>
                                    <Button 
                                        className="w-full bg-gradient-to-r from-[hsl(var(--accent-purple))] to-[hsl(var(--accent-purple)/0.8)] hover:from-[hsl(var(--accent-purple)/0.9)] hover:to-[hsl(var(--accent-purple)/0.7)] text-white hover-lift" 
                                        onClick={() => setCurrentModule("proposals")}
                                    >
                                        <FileText className="w-4 h-4 mr-2" />
                                        Acessar Propostas
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5"></div>
                <div className="container mx-auto px-4 relative">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-6 font-[var(--font-heading)]">Dashboard Administrativo</h2>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-[var(--font-body)]">
                            Controle total sobre produtos, preços e performance com analytics avançado e insights em tempo real
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="flex items-center space-x-6 p-8 card-modern hover-lift">
                            <div className="w-14 h-14 bg-gradient-to-br from-[hsl(var(--accent-cyan))] to-[hsl(var(--accent-cyan)/0.8)] rounded-2xl flex items-center justify-center tech-glow">
                                <BarChart3 className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold font-[var(--font-heading)]">Analytics Avançado</h3>
                                <p className="text-sm text-muted-foreground font-[var(--font-body)]">
                                    Métricas e relatórios em tempo real
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-6 p-8 card-modern hover-lift">
                            <div className="w-14 h-14 bg-gradient-to-br from-[hsl(var(--accent-orange))] to-[hsl(var(--accent-orange)/0.8)] rounded-2xl flex items-center justify-center tech-glow-orange">
                                <Users className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold font-[var(--font-heading)]">Gestão de Clientes</h3>
                                <p className="text-sm text-muted-foreground font-[var(--font-body)]">CRM integrado e inteligente</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-6 p-8 card-modern hover-lift">
                            <div className="w-14 h-14 bg-gradient-to-br from-[hsl(var(--accent-green))] to-[hsl(var(--accent-green)/0.8)] rounded-2xl flex items-center justify-center tech-glow">
                                <Settings className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold font-[var(--font-heading)]">Configurações</h3>
                                <p className="text-sm text-muted-foreground font-[var(--font-body)]">
                                    Regras de negócio personalizáveis
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <Button size="lg" className="px-10 py-4 text-lg btn-primary-modern hover-lift" onClick={() => setCurrentModule("admin")}>
                            Acessar Dashboard
                        </Button>
                    </div>
                </div>
            </section>

            <footer className="border-t bg-card/50 backdrop-blur-sm py-12">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                            <BarChart3 className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="text-lg font-bold font-[var(--font-heading)]">PricingPro TI</span>
                    </div>
                    <p className="text-muted-foreground font-[var(--font-body)]">
                        © 2024 PricingPro TI. Sistema robusto de precificação para produtos de TI.
                    </p>
                </div>
            </footer>
        </div>
    )
}