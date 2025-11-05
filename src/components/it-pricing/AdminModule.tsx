"use client"

import { useState } from "react"
import { ArrowLeft, BarChart3, Users, Package, TrendingUp, DollarSign, FileText, Settings, Eye, Package2, UserCheck, Calendar } from "lucide-react"
import { ConfigurationModule } from "./ConfigurationModule"
import { ProposalsManagement } from "./ProposalsManagement"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AdminModuleProps {
  onBack: () => void
}

export function AdminModule({ onBack }: AdminModuleProps) {
  const [activeTab, setActiveTab] = useState("visao-geral")

  // Dados mockados para o dashboard
  const dashboardData = {
    receitaTotal: 548000,
    produtosAtivos: 1247,
    clientesAtivos: 342,
    contratosAtivos: 89,
    crescimentoReceita: 12.5,
    novosProdutos: 23,
    novosClientes: 16,
    contratosFinalizados: 2
  }

  const revenueByModule = [
    { module: "Vendas", percentage: 60, value: 328800, color: "bg-blue-500" },
    { module: "Locação", percentage: 25, value: 137000, color: "bg-green-500" },
    { module: "Serviços", percentage: 15, value: 82200, color: "bg-orange-500" }
  ]

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
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">Gerencie seu sistema de precificação de produtos de TI</p>
        </div>
      </div>

      <div className="px-6">
        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-8">
            <TabsTrigger value="visao-geral" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="propostas" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Propostas
            </TabsTrigger>
            <TabsTrigger value="produtos" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Relatórios
            </TabsTrigger>
            <TabsTrigger value="clientes" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="configuracoes" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Visão Geral Tab */}
          <TabsContent value="visao-geral" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {dashboardData.receitaTotal.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+{dashboardData.crescimentoReceita}%</span> em relação ao mês anterior
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
                  <Package2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.produtosAtivos.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+{dashboardData.novosProdutos}</span> novos produtos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.clientesAtivos}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+{dashboardData.novosClientes}</span> novos clientes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.contratosAtivos}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-red-600">-{dashboardData.contratosFinalizados}</span> contratos finalizados
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue by Module */}
              <Card>
                <CardHeader>
                  <CardTitle>Receita por Módulo</CardTitle>
                  <p className="text-sm text-muted-foreground">Comparativo mensal dos últimos 6 meses</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {revenueByModule.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.module}</span>
                          <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${item.color}`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          R$ {item.value.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Distribution Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Receita</CardTitle>
                  <p className="text-sm text-muted-foreground">Participação de cada módulo na receita total</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600">60%</div>
                      <div className="text-sm text-muted-foreground">Vendas</div>
                      <Badge variant="secondary" className="mt-2">Módulo Principal</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">25%</div>
                        <div className="text-sm text-muted-foreground">Locação</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">15%</div>
                        <div className="text-sm text-muted-foreground">Serviços</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Outras tabs com conteúdo placeholder */}
          <TabsContent value="propostas" className="space-y-6">
            <ProposalsManagement />
          </TabsContent>

          <TabsContent value="produtos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Produtos</CardTitle>
                <p className="text-sm text-muted-foreground">Cadastre e gerencie produtos para precificação</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Catálogo de Produtos</h3>
                  <p className="text-muted-foreground mb-4">Funcionalidade em desenvolvimento</p>
                  <Button variant="outline">Gerenciar Produtos</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Avançado</CardTitle>
                <p className="text-sm text-muted-foreground">Métricas detalhadas e insights de negócio</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Relatórios Analíticos</h3>
                  <p className="text-muted-foreground mb-4">Funcionalidade em desenvolvimento</p>
                  <Button variant="outline">Ver Analytics</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="relatorios" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Gerenciais</CardTitle>
                <p className="text-sm text-muted-foreground">Relatórios customizados para tomada de decisão</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Centro de Relatórios</h3>
                  <p className="text-muted-foreground mb-4">Funcionalidade em desenvolvimento</p>
                  <Button variant="outline">Gerar Relatórios</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clientes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Clientes</CardTitle>
                <p className="text-sm text-muted-foreground">CRM integrado ao sistema de precificação</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Base de Clientes</h3>
                  <p className="text-muted-foreground mb-4">Funcionalidade em desenvolvimento</p>
                  <Button variant="outline">Gerenciar Clientes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuracoes" className="space-y-6">
            <ConfigurationModule />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}