"use client"

import { useState, useMemo } from "react"
import { BarChart3, TrendingUp, Users, DollarSign, Clock, Target, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ServiceDeskService, 
  ServiceDeskSLA, 
  ServiceDeskProposal 
} from "@/lib/types/service-desk"
import { DEFAULT_SERVICE_DESK_METRICS } from "@/lib/constants/service-desk"

interface ServiceDeskReportsModuleProps {
  services: ServiceDeskService[]
  slas: ServiceDeskSLA[]
}

export function ServiceDeskReportsModule({ services, slas }: ServiceDeskReportsModuleProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("30")

  // Carregar propostas do localStorage
  const proposals: ServiceDeskProposal[] = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('serviceDeskProposals') || '[]')
    } catch {
      return []
    }
  }, [])

  // Calcular estatísticas
  const stats = useMemo(() => {
    const now = new Date()
    const periodDays = parseInt(selectedPeriod)
    const startDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000)

    const filteredProposals = proposals.filter(p => 
      new Date(p.createdAt) >= startDate
    )

    const totalProposals = filteredProposals.length
    const approvedProposals = filteredProposals.filter(p => p.status === 'Aprovada').length
    const totalValue = filteredProposals.reduce((sum, p) => sum + p.totals.annualCost, 0)
    const totalUsers = filteredProposals.reduce((sum, p) => sum + p.totals.totalUsers, 0)
    const averageValue = totalProposals > 0 ? totalValue / totalProposals : 0
    const conversionRate = totalProposals > 0 ? (approvedProposals / totalProposals) * 100 : 0

    // Estatísticas por nível de serviço
    const serviceStats = services.map(service => {
      const serviceProposals = filteredProposals.filter(p => 
        p.serviceItems.some(item => item.serviceId === service.id)
      )
      return {
        serviceName: service.name,
        serviceLevel: service.serviceLevel,
        count: serviceProposals.length,
        totalValue: serviceProposals.reduce((sum, p) => sum + p.totals.annualCost, 0),
        averageUsers: serviceProposals.length > 0 
          ? serviceProposals.reduce((sum, p) => sum + p.totals.totalUsers, 0) / serviceProposals.length 
          : 0
      }
    })

    // Top clientes
    const clientStats = filteredProposals.reduce((acc, proposal) => {
      const clientName = proposal.clientData.companyName
      if (!acc[clientName]) {
        acc[clientName] = {
          name: clientName,
          proposals: 0,
          totalValue: 0,
          totalUsers: 0
        }
      }
      acc[clientName].proposals++
      acc[clientName].totalValue += proposal.totals.annualCost
      acc[clientName].totalUsers += proposal.totals.totalUsers
      return acc
    }, {} as Record<string, any>)

    const topClients = Object.values(clientStats)
      .sort((a: any, b: any) => b.totalValue - a.totalValue)
      .slice(0, 5)

    // Tendência mensal (últimos 6 meses)
    const monthlyTrend = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const monthProposals = proposals.filter(p => {
        const createdAt = new Date(p.createdAt)
        return createdAt >= monthStart && createdAt <= monthEnd
      })

      monthlyTrend.push({
        month: monthStart.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        proposals: monthProposals.length,
        value: monthProposals.reduce((sum, p) => sum + p.totals.annualCost, 0),
        users: monthProposals.reduce((sum, p) => sum + p.totals.totalUsers, 0)
      })
    }

    return {
      totalProposals,
      approvedProposals,
      totalValue,
      totalUsers,
      averageValue,
      conversionRate,
      serviceStats,
      topClients,
      monthlyTrend
    }
  }, [proposals, selectedPeriod, services])

  // Métricas de SLA
  const slaMetrics = useMemo(() => {
    const activeSLAs = slas.filter(sla => sla.active)
    const averageResponseTime = activeSLAs.length > 0 
      ? activeSLAs.reduce((sum, sla) => sum + sla.responseTime, 0) / activeSLAs.length 
      : 0
    const averageResolutionTime = activeSLAs.length > 0 
      ? activeSLAs.reduce((sum, sla) => sum + sla.resolutionTime, 0) / activeSLAs.length 
      : 0

    return {
      totalSLAs: activeSLAs.length,
      averageResponseTime,
      averageResolutionTime,
      criticalSLAs: activeSLAs.filter(sla => sla.priority === 'Crítica').length,
      businessHoursSLAs: activeSLAs.filter(sla => sla.businessHoursOnly).length
    }
  }, [slas])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios Service Desk</h1>
          <p className="text-muted-foreground">
            Análises e métricas do sistema de Service Desk
          </p>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
            <SelectItem value="365">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Propostas</p>
                <p className="text-2xl font-bold">{stats.totalProposals}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.approvedProposals} aprovadas
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
                <p className="text-xs text-muted-foreground">
                  Média: {formatCurrency(stats.averageValue)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Usuários</p>
                <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  Média: {Math.round(stats.totalUsers / Math.max(stats.totalProposals, 1))} por proposta
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Conversão</p>
                <p className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">
                  {stats.approvedProposals} de {stats.totalProposals}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de SLA */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas de SLA</CardTitle>
          <CardDescription>
            Estatísticas dos acordos de nível de serviço configurados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Clock className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <div className="text-2xl font-bold text-blue-600">{slaMetrics.totalSLAs}</div>
              <div className="text-sm text-muted-foreground">SLAs Ativos</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Target className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {formatTime(Math.round(slaMetrics.averageResponseTime))}
              </div>
              <div className="text-sm text-muted-foreground">Tempo Médio Resposta</div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Clock className="h-8 w-8 mx-auto text-orange-500 mb-2" />
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(slaMetrics.averageResolutionTime)}h
              </div>
              <div className="text-sm text-muted-foreground">Tempo Médio Resolução</div>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg">
              <AlertTriangle className="h-8 w-8 mx-auto text-red-500 mb-2" />
              <div className="text-2xl font-bold text-red-600">{slaMetrics.criticalSLAs}</div>
              <div className="text-sm text-muted-foreground">SLAs Críticos</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Clock className="h-8 w-8 mx-auto text-purple-500 mb-2" />
              <div className="text-2xl font-bold text-purple-600">{slaMetrics.businessHoursSLAs}</div>
              <div className="text-sm text-muted-foreground">Horário Comercial</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estatísticas por Serviço */}
        <Card>
          <CardHeader>
            <CardTitle>Desempenho por Serviço</CardTitle>
            <CardDescription>
              Propostas e valores por tipo de serviço
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.serviceStats.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{service.serviceName}</div>
                    <div className="text-sm text-muted-foreground">
                      <Badge variant="outline" className="mr-2">
                        {service.serviceLevel}
                      </Badge>
                      {service.count} proposta(s)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(service.totalValue)}</div>
                    <div className="text-sm text-muted-foreground">
                      {Math.round(service.averageUsers)} usuários médio
                    </div>
                  </div>
                </div>
              ))}

              {stats.serviceStats.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum dado disponível para o período selecionado
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Clientes */}
        <Card>
          <CardHeader>
            <CardTitle>Top Clientes</CardTitle>
            <CardDescription>
              Clientes com maior valor em propostas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topClients.map((client: any, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium">{client.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {client.proposals} proposta(s) • {client.totalUsers} usuários
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(client.totalValue)}</div>
                  </div>
                </div>
              ))}

              {stats.topClients.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum cliente encontrado para o período selecionado
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tendência Mensal */}
      <Card>
        <CardHeader>
          <CardTitle>Tendência Mensal</CardTitle>
          <CardDescription>
            Evolução das propostas nos últimos 6 meses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.monthlyTrend.map((month, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="font-medium">{month.month}</div>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <div className="font-medium">{month.proposals}</div>
                    <div className="text-muted-foreground">Propostas</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{formatCurrency(month.value)}</div>
                    <div className="text-muted-foreground">Valor</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{month.users.toLocaleString()}</div>
                    <div className="text-muted-foreground">Usuários</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resumo de Serviços Cadastrados */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Serviços</CardTitle>
          <CardDescription>
            Visão geral dos serviços cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{services.length}</div>
              <div className="text-sm text-muted-foreground">Total de Serviços</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {services.filter(s => s.active).length}
              </div>
              <div className="text-sm text-muted-foreground">Serviços Ativos</div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(services.reduce((sum, s) => sum + s.baseCost, 0) / Math.max(services.length, 1))}
              </div>
              <div className="text-sm text-muted-foreground">Custo Médio</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(services.reduce((sum, s) => sum + s.includedHours, 0) / Math.max(services.length, 1))}h
              </div>
              <div className="text-sm text-muted-foreground">Horas Médias Incluídas</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}