"use client";

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RO, Partner } from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Building,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { RoMetrics } from './RoMetrics';

interface RoChartsViewProps {
  ros: RO[];
  partners: Partner[];
}

export function RoChartsView({ ros, partners }: RoChartsViewProps) {
  const [selectedAccountManager, setSelectedAccountManager] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<string>('all');

  // Listas únicas para os filtros
  const accountManagers = useMemo(() => {
    const managers = [...new Set(ros.map(ro => ro.accountManager).filter(Boolean))];
    return managers.sort();
  }, [ros]);

  const clients = useMemo(() => {
    const clientList = [...new Set(ros.map(ro => ro.clientName))];
    return clientList.sort();
  }, [ros]);

  // ROs filtrados
  const filteredRos = useMemo(() => {
    return ros.filter(ro => {
      const matchesManager = selectedAccountManager === 'all' || ro.accountManager === selectedAccountManager;
      const matchesClient = selectedClient === 'all' || ro.clientName === selectedClient;
      return matchesManager && matchesClient;
    });
  }, [ros, selectedAccountManager, selectedClient]);

  // Dados processados para os gráficos
  const chartData = useMemo(() => {
    // 1. RO's por Status
    const statusData = [
      { name: 'Aprovado', value: filteredRos.filter(ro => ro.status === 'Aprovado').length, color: '#10b981' },
      { name: 'Negado', value: filteredRos.filter(ro => ro.status === 'Negado').length, color: '#ef4444' },
      { name: 'Expirado', value: filteredRos.filter(ro => ro.status === 'Expirado').length, color: '#6b7280' }
    ];

    // 2. RO's por Fornecedor
    const supplierData = partners
      .filter(p => p.type === 'Fornecedor')
      .map(supplier => {
        const supplierRos = filteredRos.filter(ro => ro.supplierId === supplier.id);
        return {
          name: supplier.name.replace('Fornecedor ', ''),
          total: supplierRos.length,
          aprovados: supplierRos.filter(ro => ro.status === 'Aprovado').length,
          negados: supplierRos.filter(ro => ro.status === 'Negado').length,
          expirados: supplierRos.filter(ro => ro.status === 'Expirado').length,
          valor: supplierRos.reduce((sum, ro) => sum + ro.value, 0)
        };
      })
      .filter(data => data.total > 0);

    // 3. Valor total por mês (simulado baseado nas datas)
    const monthlyData = filteredRos.reduce((acc, ro) => {
      const month = new Date(ro.openDate).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      const existing = acc.find(item => item.month === month);

      if (existing) {
        existing.valor += ro.value;
        existing.quantidade += 1;
      } else {
        acc.push({
          month,
          valor: ro.value,
          quantidade: 1
        });
      }

      return acc;
    }, [] as Array<{ month: string; valor: number; quantidade: number }>);

    // 4. Estatísticas gerais
    const totalValue = filteredRos.reduce((sum, ro) => sum + ro.value, 0);
    const avgValue = filteredRos.length > 0 ? totalValue / filteredRos.length : 0;
    const approvalRate = filteredRos.length > 0 ? (filteredRos.filter(ro => ro.status === 'Aprovado').length / filteredRos.length) * 100 : 0;

    return {
      statusData,
      supplierData,
      monthlyData,
      stats: {
        total: filteredRos.length,
        totalValue,
        avgValue,
        approvalRate
      }
    };
  }, [filteredRos, partners]);

  const COLORS = ['#10b981', '#ef4444', '#6b7280'];

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Filtros de RO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Gerente de Contas</label>
              <Select value={selectedAccountManager} onValueChange={setSelectedAccountManager}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os gerentes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os gerentes</SelectItem>
                  {accountManagers.map(manager => (
                    <SelectItem key={manager} value={manager}>{manager}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cliente</label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os clientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os clientes</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client} value={client}>{client}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedAccountManager('all');
                  setSelectedClient('all');
                }}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>

          {(selectedAccountManager !== 'all' || selectedClient !== 'all') && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Filtros ativos:</strong>
                {selectedAccountManager !== 'all' && ` Gerente: ${selectedAccountManager}`}
                {selectedClient !== 'all' && ` Cliente: ${selectedClient}`}
                {` (${filteredRos.length} de ${ros.length} ROs)`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Métricas Detalhadas */}
      <RoMetrics ros={filteredRos} partners={partners} />

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de RO's</p>
                <p className="text-2xl font-bold">{chartData.stats.total}</p>
              </div>
              <Building className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">
                  {chartData.stats.totalValue.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
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
                <p className="text-sm font-medium text-muted-foreground">Valor Médio</p>
                <p className="text-2xl font-bold">
                  {chartData.stats.avgValue.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Aprovação</p>
                <p className="text-2xl font-bold">{chartData.stats.approvalRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Status dos RO's */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Distribuição por Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              {chartData.statusData.map((item, index) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Barras - RO's por Fornecedor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>RO's por Fornecedor</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.supplierData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="aprovados" stackId="a" fill="#10b981" name="Aprovados" />
                  <Bar dataKey="negados" stackId="a" fill="#ef4444" name="Negados" />
                  <Bar dataKey="expirados" stackId="a" fill="#6b7280" name="Expirados" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Linha - Evolução Mensal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Evolução Mensal</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'valor'
                      ? Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                      : value,
                    name === 'valor' ? 'Valor Total' : 'Quantidade'
                  ]}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="quantidade" fill="#3b82f6" name="Quantidade de RO's" />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="valor"
                  stroke="#10b981"
                  strokeWidth={3}
                  name="Valor Total (R$)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Detalhes por Fornecedor */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes por Fornecedor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Fornecedor</th>
                  <th className="text-center p-2">Total RO's</th>
                  <th className="text-center p-2">Aprovados</th>
                  <th className="text-center p-2">Negados</th>
                  <th className="text-center p-2">Expirados</th>
                  <th className="text-right p-2">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {chartData.supplierData.map((supplier) => (
                  <tr key={supplier.name} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{supplier.name}</td>
                    <td className="text-center p-2">{supplier.total}</td>
                    <td className="text-center p-2">
                      <Badge variant="default">{supplier.aprovados}</Badge>
                    </td>
                    <td className="text-center p-2">
                      <Badge variant="destructive">{supplier.negados}</Badge>
                    </td>
                    <td className="text-center p-2">
                      <Badge variant="secondary">{supplier.expirados}</Badge>
                    </td>
                    <td className="text-right p-2 font-medium">
                      {supplier.valor.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}