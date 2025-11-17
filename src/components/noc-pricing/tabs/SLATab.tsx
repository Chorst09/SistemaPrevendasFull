'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NOCSLAConfig } from '@/lib/types/noc-pricing';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, TrendingUp } from 'lucide-react';

interface SLATabProps {
  data: NOCSLAConfig;
  onChange: (data: NOCSLAConfig) => void;
}

export function SLATab({ data, onChange }: SLATabProps) {
  const getAvailabilityLevel = (availability: number) => {
    if (availability >= 99.99) return { label: 'Crítico', color: 'destructive', downtime: '52 min/ano' };
    if (availability >= 99.9) return { label: 'Alto', color: 'default', downtime: '8.7 horas/ano' };
    if (availability >= 99.5) return { label: 'Médio', color: 'secondary', downtime: '43.8 horas/ano' };
    return { label: 'Básico', color: 'outline', downtime: '87.6 horas/ano' };
  };

  const availabilityLevel = getAvailabilityLevel(data.availability);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Disponibilidade do Serviço</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Disponibilidade Garantida (%)</Label>
              <Badge variant={availabilityLevel.color as any}>
                {availabilityLevel.label}
              </Badge>
            </div>
            <Input
              type="number"
              min="90"
              max="100"
              step="0.01"
              value={data.availability}
              onChange={(e) => onChange({ ...data, availability: parseFloat(e.target.value) || 99.9 })}
            />
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Downtime máximo permitido:</span>
              <span className="font-medium">{availabilityLevel.downtime}</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Níveis de Disponibilidade Comuns</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex justify-between">
                <span>99.0% (Two Nines)</span>
                <span>3.65 dias/ano de downtime</span>
              </div>
              <div className="flex justify-between">
                <span>99.5% (Two Nines Five)</span>
                <span>1.83 dias/ano de downtime</span>
              </div>
              <div className="flex justify-between">
                <span>99.9% (Three Nines)</span>
                <span>8.76 horas/ano de downtime</span>
              </div>
              <div className="flex justify-between">
                <span>99.99% (Four Nines)</span>
                <span>52.56 minutos/ano de downtime</span>
              </div>
              <div className="flex justify-between">
                <span>99.999% (Five Nines)</span>
                <span>5.26 minutos/ano de downtime</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Tempos de Resposta</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tempo de Resposta Padrão (minutos)</Label>
              <Input
                type="number"
                min="1"
                value={data.responseTime}
                onChange={(e) => onChange({ ...data, responseTime: parseInt(e.target.value) || 15 })}
              />
              <p className="text-xs text-gray-500">Tempo para primeira resposta em alertas normais</p>
            </div>

            <div className="space-y-2">
              <Label>Resposta para Incidentes Críticos (minutos)</Label>
              <Input
                type="number"
                min="1"
                value={data.criticalIncidentResponse}
                onChange={(e) => onChange({ ...data, criticalIncidentResponse: parseInt(e.target.value) || 5 })}
              />
              <p className="text-xs text-gray-500">Tempo para resposta em incidentes críticos</p>
            </div>

            <div className="space-y-2">
              <Label>Tempo de Resolução (horas)</Label>
              <Input
                type="number"
                min="1"
                value={data.resolutionTime}
                onChange={(e) => onChange({ ...data, resolutionTime: parseInt(e.target.value) || 4 })}
              />
              <p className="text-xs text-gray-500">Tempo médio para resolução de incidentes</p>
            </div>

            <div className="space-y-2">
              <Label>Níveis de Escalação</Label>
              <Input
                type="number"
                min="1"
                max="5"
                value={data.escalationLevels}
                onChange={(e) => onChange({ ...data, escalationLevels: parseInt(e.target.value) || 3 })}
              />
              <p className="text-xs text-gray-500">Número de níveis de escalação</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900 mb-1">Recomendações</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Tempo de resposta crítico deve ser menor que o padrão</li>
                  <li>• Recomendamos pelo menos 2 níveis de escalação</li>
                  <li>• Para SLA 99.9%+, resposta crítica deve ser ≤ 15 minutos</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Relatórios e Métricas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Frequência de Relatórios</Label>
            <Select
              value={data.reportingFrequency}
              onValueChange={(value: any) => onChange({ ...data, reportingFrequency: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">
                  <div className="flex flex-col">
                    <span className="font-medium">Diário</span>
                    <span className="text-xs text-gray-500">Relatórios todos os dias</span>
                  </div>
                </SelectItem>
                <SelectItem value="weekly">
                  <div className="flex flex-col">
                    <span className="font-medium">Semanal</span>
                    <span className="text-xs text-gray-500">Relatórios semanais</span>
                  </div>
                </SelectItem>
                <SelectItem value="monthly">
                  <div className="flex flex-col">
                    <span className="font-medium">Mensal</span>
                    <span className="text-xs text-gray-500">Relatórios mensais</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Métricas Incluídas nos Relatórios</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Disponibilidade real vs. SLA</li>
              <li>• Tempo médio de resposta (MTTR)</li>
              <li>• Tempo médio entre falhas (MTBF)</li>
              <li>• Número de incidentes por severidade</li>
              <li>• Taxa de resolução no primeiro contato</li>
              <li>• Análise de tendências e padrões</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumo do SLA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Disponibilidade</div>
              <div className="text-2xl font-bold">{data.availability}%</div>
              <Badge variant={availabilityLevel.color as any} className="mt-2">
                {availabilityLevel.label}
              </Badge>
            </div>

            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Resposta Padrão</div>
              <div className="text-2xl font-bold">{data.responseTime} min</div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Resposta Crítica</div>
              <div className="text-2xl font-bold text-red-600">{data.criticalIncidentResponse} min</div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Tempo de Resolução</div>
              <div className="text-2xl font-bold">{data.resolutionTime}h</div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Níveis de Escalação</div>
              <div className="text-2xl font-bold">{data.escalationLevels}</div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Relatórios</div>
              <div className="text-2xl font-bold capitalize">{data.reportingFrequency}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
