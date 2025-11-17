'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { NOCOperationalCosts } from '@/lib/types/noc-pricing';

interface CostsTabProps {
  data: NOCOperationalCosts;
  onChange: (data: NOCOperationalCosts) => void;
}

export function CostsTab({ data, onChange }: CostsTabProps) {
  const handleChange = (field: keyof NOCOperationalCosts, value: number) => {
    onChange({ ...data, [field]: value });
  };

  const totalCosts = Object.values(data).reduce((sum, val) => sum + val, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Infraestrutura</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Servidores (R$/mês)</Label>
              <Input
                type="number"
                min="0"
                value={data.serverCosts}
                onChange={(e) => handleChange('serverCosts', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label>Storage (R$/mês)</Label>
              <Input
                type="number"
                min="0"
                value={data.storageCosts}
                onChange={(e) => handleChange('storageCosts', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label>Rede (R$/mês)</Label>
              <Input
                type="number"
                min="0"
                value={data.networkCosts}
                onChange={(e) => handleChange('networkCosts', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Software e Licenças</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Licenças de Monitoramento (R$/mês)</Label>
              <Input
                type="number"
                min="0"
                value={data.monitoringLicenses}
                onChange={(e) => handleChange('monitoringLicenses', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label>Integrações (R$/mês)</Label>
              <Input
                type="number"
                min="0"
                value={data.integrationCosts}
                onChange={(e) => handleChange('integrationCosts', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Facilities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Espaço Físico (R$/mês)</Label>
              <Input
                type="number"
                min="0"
                value={data.facilityCosts}
                onChange={(e) => handleChange('facilityCosts', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label>Energia e Refrigeração (R$/mês)</Label>
              <Input
                type="number"
                min="0"
                value={data.utilitiesCosts}
                onChange={(e) => handleChange('utilitiesCosts', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Treinamento e Desenvolvimento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Treinamento (R$/ano)</Label>
              <Input
                type="number"
                min="0"
                value={data.trainingCosts}
                onChange={(e) => handleChange('trainingCosts', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label>Certificações (R$/ano)</Label>
              <Input
                type="number"
                min="0"
                value={data.certificationCosts}
                onChange={(e) => handleChange('certificationCosts', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label>Contingência (R$/mês)</Label>
              <Input
                type="number"
                min="0"
                value={data.contingencyCosts}
                onChange={(e) => handleChange('contingencyCosts', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumo de Custos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-2">Total de Custos Operacionais</div>
            <div className="text-4xl font-bold text-blue-600">
              R$ {totalCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-500 mt-1">por mês</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
