'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NOCProjectData, NOCServiceLevel, NOCCoverage } from '@/lib/types/noc-pricing';

interface ProjectTabProps {
  data: NOCProjectData;
  onChange: (data: NOCProjectData) => void;
}

export function ProjectTab({ data, onChange }: ProjectTabProps) {
  const handleChange = (field: keyof NOCProjectData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Nome do Projeto *</Label>
              <Input
                id="projectName"
                value={data.projectName}
                onChange={(e) => handleChange('projectName', e.target.value)}
                placeholder="Ex: NOC Empresa XYZ"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientName">Nome do Cliente *</Label>
              <Input
                id="clientName"
                value={data.clientName}
                onChange={(e) => handleChange('clientName', e.target.value)}
                placeholder="Ex: Empresa XYZ Ltda"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início *</Label>
              <Input
                id="startDate"
                type="date"
                value={data.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractDuration">Duração do Contrato (meses) *</Label>
              <Input
                id="contractDuration"
                type="number"
                min="1"
                value={data.contractDuration}
                onChange={(e) => handleChange('contractDuration', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localização</Label>
              <Input
                id="location"
                value={data.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Ex: São Paulo, Brasil"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moeda</Label>
              <Select value={data.currency} onValueChange={(value) => handleChange('currency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">BRL - Real Brasileiro</SelectItem>
                  <SelectItem value="USD">USD - Dólar Americano</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuração do Serviço</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serviceLevel">Nível de Serviço *</Label>
              <Select value={data.serviceLevel} onValueChange={(value: NOCServiceLevel) => handleChange('serviceLevel', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">
                    <div className="flex flex-col">
                      <span className="font-medium">Básico</span>
                      <span className="text-xs text-gray-500">Monitoramento essencial</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="standard">
                    <div className="flex flex-col">
                      <span className="font-medium">Padrão</span>
                      <span className="text-xs text-gray-500">Monitoramento completo</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="advanced">
                    <div className="flex flex-col">
                      <span className="font-medium">Avançado</span>
                      <span className="text-xs text-gray-500">Monitoramento + Automação</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="premium">
                    <div className="flex flex-col">
                      <span className="font-medium">Premium</span>
                      <span className="text-xs text-gray-500">Monitoramento + IA + Predição</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverage">Cobertura de Atendimento *</Label>
              <Select value={data.coverage} onValueChange={(value: NOCCoverage) => handleChange('coverage', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8x5">
                    <div className="flex flex-col">
                      <span className="font-medium">8x5</span>
                      <span className="text-xs text-gray-500">8h/dia, 5 dias/semana (comercial)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="12x5">
                    <div className="flex flex-col">
                      <span className="font-medium">12x5</span>
                      <span className="text-xs text-gray-500">12h/dia, 5 dias/semana</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="12x6">
                    <div className="flex flex-col">
                      <span className="font-medium">12x6</span>
                      <span className="text-xs text-gray-500">12h/dia, 6 dias/semana</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="24x5">
                    <div className="flex flex-col">
                      <span className="font-medium">24x5</span>
                      <span className="text-xs text-gray-500">24h/dia, 5 dias/semana</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="24x7">
                    <div className="flex flex-col">
                      <span className="font-medium">24x7</span>
                      <span className="text-xs text-gray-500">24h/dia, 7 dias/semana (ininterrupto)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h4 className="font-medium text-blue-900 mb-2">Sobre os Níveis de Serviço</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Básico:</strong> Monitoramento de disponibilidade e alertas básicos</li>
              <li>• <strong>Padrão:</strong> Monitoramento completo com métricas de performance</li>
              <li>• <strong>Avançado:</strong> Inclui automação de resposta e análise proativa</li>
              <li>• <strong>Premium:</strong> IA para predição de falhas e otimização contínua</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
