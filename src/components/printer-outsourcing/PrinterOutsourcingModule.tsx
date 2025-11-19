"use client"

import { useState, useEffect } from "react"
import { Printer, Calculator, Package, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PrinterCalculatorModule } from "@/components/printer-outsourcing/PrinterCalculatorModule"
import { PrinterManagementModule } from "@/components/printer-outsourcing/PrinterManagementModule"
import { SupplyManagementModule } from "@/components/printer-outsourcing/SupplyManagementModule"
import { CostCalculationModule } from "@/components/printer-outsourcing/CostCalculationModule"
import { PrinterPricingModule } from "@/components/printer-outsourcing/PrinterPricingModule"
import { Printer as PrinterType, Suprimento } from "./types"

type ModuleType = "home" | "calculator" | "printers" | "supplies" | "costs" | "pricing" | "proposals" | "new-printer"

interface PrinterOutsourcingModuleProps {
    onNavigateToProposals?: () => void
    editingProposalId?: string | null
    onFinishEditing?: () => void
    onBack?: () => void
}

export function PrinterOutsourcingModule({ onNavigateToProposals, editingProposalId, onFinishEditing, onBack }: PrinterOutsourcingModuleProps = {}) {
    const [currentModule, setCurrentModule] = useState<ModuleType>("home")
    const [selectedPrinter, setSelectedPrinter] = useState<PrinterType | null>(null)

    // Effect to navigate to calculator when editing mode is active
    useEffect(() => {
        if (editingProposalId && currentModule !== "calculator") {
            setCurrentModule("calculator")
        }
    }, [editingProposalId, currentModule])

    // Debug para verificar o estado atual
    console.log("PrinterOutsourcingModule - currentModule:", currentModule)
    // Dados de exemplo para demonstração
    const [printers, setPrinters] = useState<PrinterType[]>([
        {
            id: "1",
            modelo: "LaserJet Pro M404n",
            marca: "HP",
            tipo: "Laser P&B",
            velocidadePPM: 38,
            custoAquisicao: 1200,
            custoMensalLocacao: 80,
            vidaUtilPaginas: 100000,
            consumoEnergia: 15,
            custoManutencaoMensal: 25,
            ativo: true
        },
        {
            id: "2",
            modelo: "Color LaserJet Pro M454dn",
            marca: "HP",
            tipo: "Laser Colorida",
            velocidadePPM: 27,
            custoAquisicao: 2800,
            custoMensalLocacao: 150,
            vidaUtilPaginas: 80000,
            consumoEnergia: 25,
            custoManutencaoMensal: 45,
            ativo: true
        }
    ])

    const [suprimentos, setSuprimentos] = useState<Suprimento[]>([
        {
            id: "1",
            printerId: "1",
            tipo: "Toner P&B",
            descricao: "HP CF410A Toner Preto",
            rendimentoPaginas: 2300,
            custoUnitario: 180,
            estoqueMinimo: 2,
            estoqueAtual: 5,
            fornecedor: "HP Brasil",
            codigoOriginal: "CF410A",
            compativel: false
        },
        {
            id: "2",
            printerId: "2",
            tipo: "Toner Preto",
            descricao: "HP CF410X Toner Preto Alto Rendimento",
            rendimentoPaginas: 6500,
            custoUnitario: 420,
            estoqueMinimo: 1,
            estoqueAtual: 3,
            fornecedor: "HP Brasil",
            codigoOriginal: "CF410X",
            compativel: false
        },
        {
            id: "3",
            printerId: "2",
            tipo: "Toner Ciano",
            descricao: "HP CF411A Toner Ciano",
            rendimentoPaginas: 2300,
            custoUnitario: 280,
            estoqueMinimo: 1,
            estoqueAtual: 2,
            fornecedor: "HP Brasil",
            codigoOriginal: "CF411A",
            compativel: false
        },
        {
            id: "4",
            printerId: "2",
            tipo: "Toner Magenta",
            descricao: "HP CF413A Toner Magenta",
            rendimentoPaginas: 2300,
            custoUnitario: 280,
            estoqueMinimo: 1,
            estoqueAtual: 1,
            fornecedor: "HP Brasil",
            codigoOriginal: "CF413A",
            compativel: false
        },
        {
            id: "5",
            printerId: "2",
            tipo: "Toner Amarelo",
            descricao: "HP CF412A Toner Amarelo",
            rendimentoPaginas: 2300,
            custoUnitario: 280,
            estoqueMinimo: 1,
            estoqueAtual: 1,
            fornecedor: "HP Brasil",
            codigoOriginal: "CF412A",
            compativel: false
        }
    ])

    const handleBack = () => {
        setCurrentModule("home")
    }

    if (currentModule === "calculator") {
        console.log('Renderizando PrinterCalculatorModule')
        return <PrinterCalculatorModule 
            onBack={handleBack} 
            onNavigateToProposals={onNavigateToProposals} 
            printers={printers} 
            suprimentos={suprimentos}
            editingProposalId={editingProposalId}
            onFinishEditing={onFinishEditing}
        />
    }

    if (currentModule === "printers") {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="mb-6">
                    <Button onClick={handleBack} variant="outline">
                        ← Voltar
                    </Button>
                </div>
                <PrinterManagementModule
                    printers={printers}
                    onUpdatePrinters={setPrinters}
                    onPricePrinter={(printer) => {
                        setSelectedPrinter(printer)
                        setCurrentModule("pricing")
                    }}
                    onCreateNewPrinter={() => {
                        setSelectedPrinter(null)
                        setCurrentModule("new-printer")
                    }}
                />
            </div>
        )
    }

    if (currentModule === "supplies") {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="mb-6">
                    <Button onClick={handleBack} variant="outline">
                        ← Voltar
                    </Button>
                </div>
                <SupplyManagementModule printers={printers} suprimentos={suprimentos} onUpdateSuprimentos={setSuprimentos} />
            </div>
        )
    }

    if (currentModule === "costs") {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="mb-6">
                    <Button onClick={handleBack} variant="outline">
                        ← Voltar
                    </Button>
                </div>
                <CostCalculationModule printers={printers} suprimentos={suprimentos} />
            </div>
        )
    }

    if (currentModule === "pricing" && selectedPrinter) {
        return (
            <PrinterPricingModule
                printer={selectedPrinter}
                onBack={handleBack}
                onUpdatePrinter={(updatedPrinter) => {
                    const updatedPrinters = printers.map(p =>
                        p.id === updatedPrinter.id ? updatedPrinter : p
                    )
                    setPrinters(updatedPrinters)
                    setCurrentModule("printers")
                }}
            />
        )
    }

    if (currentModule === "new-printer") {
        return (
            <PrinterPricingModule
                printer={null}
                onBack={handleBack}
                onUpdatePrinter={(newPrinter) => {
                    setPrinters([...printers, newPrinter])
                    setCurrentModule("printers")
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
                                <Printer className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold font-[var(--font-heading)]">Outsourcing de Impressão</h1>
                                <p className="text-xs text-muted-foreground">Sistema de Precificação</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            {onBack && currentModule === "home" && (
                                <Button onClick={onBack} variant="outline" size="sm">
                                    ← Voltar
                                </Button>
                            )}
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
                        <Printer className="w-4 h-4 mr-2" />
                        Calculadora de Outsourcing
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-bold mb-8 font-[var(--font-heading)] leading-tight">
                        <span className="gradient-primary bg-clip-text text-transparent">Outsourcing de</span>
                        <br />
                        <span className="text-foreground">Impressão Inteligente</span>
                    </h1>
                    <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto font-[var(--font-body)] leading-relaxed">
                        Calcule o custo total de outsourcing de impressão com base no volume de páginas,
                        tipos de impressão e equipamentos necessários.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Button size="lg" className="px-8 py-4 text-lg hover-lift btn-primary-modern" onClick={() => {
                            console.log('Botão Iniciar Cálculo clicado!')
                            setCurrentModule("calculator")
                        }}>
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
                            Tudo que você precisa para calcular e gerenciar contratos de outsourcing de impressão
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="hover-lift card-modern relative overflow-hidden group cursor-pointer" onClick={() => setCurrentModule("printers")}>
                            <CardHeader>
                                <div className="w-16 h-16 bg-gradient-to-br from-[hsl(var(--accent-cyan))] to-[hsl(var(--primary-600))] rounded-2xl flex items-center justify-center mb-6 tech-glow">
                                    <Printer className="h-8 w-8 text-white" />
                                </div>
                                <CardTitle className="text-xl font-[var(--font-heading)]">Gestão de Impressoras</CardTitle>
                                <CardDescription className="text-sm font-[var(--font-body)]">
                                    Cadastre e gerencie impressoras
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-[hsl(var(--accent-cyan))]">{printers.length}</div>
                                    <div className="text-sm text-muted-foreground">Impressoras cadastradas</div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover-lift card-modern relative overflow-hidden group cursor-pointer" onClick={() => setCurrentModule("supplies")}>
                            <CardHeader>
                                <div className="w-16 h-16 bg-gradient-to-br from-[hsl(var(--accent-orange))] to-[hsl(var(--primary-600))] rounded-2xl flex items-center justify-center mb-6 tech-glow-orange">
                                    <Package className="h-8 w-8 text-white" />
                                </div>
                                <CardTitle className="text-xl font-[var(--font-heading)]">Gestão de Suprimentos</CardTitle>
                                <CardDescription className="text-sm font-[var(--font-body)]">
                                    Toners, fotocondutores e peças
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-[hsl(var(--accent-orange))]">{suprimentos.length}</div>
                                    <div className="text-sm text-muted-foreground">Suprimentos cadastrados</div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover-lift card-modern relative overflow-hidden group cursor-pointer" onClick={() => setCurrentModule("costs")}>
                            <CardHeader>
                                <div className="w-16 h-16 bg-gradient-to-br from-[hsl(var(--accent-green))] to-[hsl(var(--primary-600))] rounded-2xl flex items-center justify-center mb-6 tech-glow">
                                    <DollarSign className="h-8 w-8 text-white" />
                                </div>
                                <CardTitle className="text-xl font-[var(--font-heading)]">Custo por Página</CardTitle>
                                <CardDescription className="text-sm font-[var(--font-body)]">
                                    Cálculos automáticos de custos
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-[hsl(var(--accent-green))]">
                                        {printers.filter(p => p.ativo).length}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Impressoras ativas</div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover-lift card-modern relative overflow-hidden group cursor-pointer" onClick={() => {
                            console.log('Card Calculadora clicado!')
                            setCurrentModule("calculator")
                        }}>
                            <CardHeader>
                                <div className="w-16 h-16 bg-gradient-to-br from-[hsl(var(--accent-purple))] to-[hsl(var(--primary-600))] rounded-2xl flex items-center justify-center mb-6 tech-glow">
                                    <Calculator className="h-8 w-8 text-white" />
                                </div>
                                <CardTitle className="text-xl font-[var(--font-heading)]">Calculadora</CardTitle>
                                <CardDescription className="text-sm font-[var(--font-body)]">
                                    Gerar propostas de outsourcing
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
                                Siga estes passos para configurar e calcular custos de outsourcing
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <Card className="text-center">
                                <CardContent className="p-6">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-xl font-bold text-blue-600">1</span>
                                    </div>
                                    <h3 className="font-semibold mb-2">Cadastrar Impressoras</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Adicione as impressoras com especificações técnicas e custos
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="text-center">
                                <CardContent className="p-6">
                                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-xl font-bold text-orange-600">2</span>
                                    </div>
                                    <h3 className="font-semibold mb-2">Cadastrar Suprimentos</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Adicione toners, fotocondutores e peças com rendimento e custos
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="text-center">
                                <CardContent className="p-6">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-xl font-bold text-green-600">3</span>
                                    </div>
                                    <h3 className="font-semibold mb-2">Visualizar Custos</h3>
                                    <p className="text-sm text-muted-foreground">
                                        O sistema calcula automaticamente o custo por página
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
                                        Crie propostas baseadas nos custos reais calculados
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="text-center mt-8">
                            <Badge variant="outline" className="text-sm">
                                💡 Dica: Comece cadastrando as impressoras e depois os suprimentos para cada uma
                            </Badge>
                        </div>
                    </div>
                </section>
            </section>
        </div>
    )
}