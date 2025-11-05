"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RO, Partner } from '@/lib/types';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Building,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  AlertTriangle
} from 'lucide-react';

interface RoMetricsProps {
  ros: RO[];
  partners: Partner[];
}

export function RoMetrics({ ros, partners }: RoMetricsProps) {
  
  // Calcular métricas
  const totalRos = ros.length;
  const aprovados = ros.filter(ro => ro.status === 'Aprovado').length;
  const negados = ros.filter(ro => ro.status === 'Negado').length;
  const expirados = ros.filter(ro => ro.status === 'Expirado').length;
  
  const valorTotal = ros.reduce((sum, ro) => sum + ro.value, 0);
  const valorAprovado = ros.filter(ro => ro.status === 'Aprovado').reduce((sum, ro) => sum + ro.value, 0);
  
  const taxaAprovacao = totalRos > 0 ? (aprovados / totalRos) * 100 : 0;
  const taxaRejeicao = totalRos > 0 ? (negados / totalRos) * 100 : 0;
  
  // RO's próximos do vencimento (próximos 30 dias)
  const hoje = new Date();
  const em30Dias = new Date();
  em30Dias.setDate(hoje.getDate() + 30);
  
  const proximosVencimento = ros.filter(ro => {
    const dataVencimento = new Date(ro.expiryDate);
    return dataVencimento >= hoje && dataVencimento <= em30Dias;
  }).length;
  
  // Fornecedor com mais RO's
  const rosPorFornecedor = partners
    .filter(p => p.type === 'Fornecedor')
    .map(supplier => ({
      nome: supplier.name.replace('Fornecedor ', ''),
      quantidade: ros.filter(ro => ro.supplierId === supplier.id).length
    }))
    .sort((a, b) => b.quantidade - a.quantidade);
  
  const topFornecedor = rosPorFornecedor[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Taxa de Aprovação */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Taxa de Aprovação</p>
              <p className="text-2xl font-bold text-green-600">{taxaAprovacao.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {aprovados} de {totalRos} RO's
              </p>
            </div>
            <div className="relative">
              <CheckCircle className="h-8 w-8 text-green-500" />
              {taxaAprovacao >= 70 && (
                <TrendingUp className="h-4 w-4 text-green-500 absolute -top-1 -right-1" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Taxa de Rejeição */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Taxa de Rejeição</p>
              <p className="text-2xl font-bold text-red-600">{taxaRejeicao.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {negados} de {totalRos} RO's
              </p>
            </div>
            <div className="relative">
              <XCircle className="h-8 w-8 text-red-500" />
              {taxaRejeicao >= 30 && (
                <AlertTriangle className="h-4 w-4 text-red-500 absolute -top-1 -right-1" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Valor Aprovado */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Valor Aprovado</p>
              <p className="text-2xl font-bold text-blue-600">
                {valorAprovado.toLocaleString('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                })}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {((valorAprovado / valorTotal) * 100).toFixed(1)}% do total
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      {/* Próximos do Vencimento */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Próximos Vencimento</p>
              <p className="text-2xl font-bold text-orange-600">{proximosVencimento}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Próximos 30 dias
              </p>
            </div>
            <div className="relative">
              <Calendar className="h-8 w-8 text-orange-500" />
              {proximosVencimento > 0 && (
                <AlertTriangle className="h-4 w-4 text-orange-500 absolute -top-1 -right-1" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Fornecedor */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Top Fornecedor</p>
              <p className="text-lg font-bold truncate">
                {topFornecedor?.nome || 'N/A'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {topFornecedor?.quantidade || 0} RO's
              </p>
            </div>
            <div className="relative">
              <Building className="h-8 w-8 text-purple-500" />
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                1
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RO's Expirados */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">RO's Expirados</p>
              <p className="text-2xl font-bold text-gray-600">{expirados}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {((expirados / totalRos) * 100).toFixed(1)}% do total
              </p>
            </div>
            <Clock className="h-8 w-8 text-gray-500" />
          </div>
        </CardContent>
      </Card>

      {/* Ticket Médio */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
              <p className="text-2xl font-bold text-indigo-600">
                {totalRos > 0 ? (valorTotal / totalRos).toLocaleString('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }) : 'R$ 0'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Por RO
              </p>
            </div>
            <Target className="h-8 w-8 text-indigo-500" />
          </div>
        </CardContent>
      </Card>

      {/* Performance Geral */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Performance</p>
              <div className="flex items-center space-x-2 mt-1">
                {taxaAprovacao >= 70 ? (
                  <Badge className="bg-green-100 text-green-800">Excelente</Badge>
                ) : taxaAprovacao >= 50 ? (
                  <Badge className="bg-yellow-100 text-yellow-800">Boa</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">Precisa Melhorar</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Baseado na taxa de aprovação
              </p>
            </div>
            <div className="relative">
              {taxaAprovacao >= 70 ? (
                <TrendingUp className="h-8 w-8 text-green-500" />
              ) : taxaAprovacao >= 50 ? (
                <Target className="h-8 w-8 text-yellow-500" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-500" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}