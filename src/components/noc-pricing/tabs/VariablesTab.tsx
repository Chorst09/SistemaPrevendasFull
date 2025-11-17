'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface VariablesTabProps {
  data: {
    inflationRate: number;
    dollarRate: number;
    profitMargin: number;
    riskMargin: number;
  };
  onChange: (data: any) => void;
}

export function VariablesTab({ data, onChange }: VariablesTabProps) {
  const handleChange = (field: string, value: number) => {
    onChange({ ...data, [field]: value });
  };

  const totalMargin = data.profitMargin + data.riskMargin;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Margens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Margem de Lucro (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={data.profitMargin}
                onChange={(e) => handleChange('profitMargin', parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-gray-500">Margem de lucro desejada</p>
            </div>

            <div className="space-y-2">
              <Label>Margem de Risco (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={data.riskMargin}
                onChange={(e) => handleChange('riskMargin', parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-gray-500">Margem para contingências</p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-center">
              <div className="text-sm text-green-700 mb-1">Margem Total</div>
              <div className="text-3xl font-bold text-green-600">{totalMargin.toFixed(1)}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Variáveis Econômicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Taxa de Inflação Anual (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={data.inflationRate}
                onChange={(e) => handleChange('inflationRate', parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-gray-500">Inflação projetada para o período</p>
            </div>

            <div className="space-y-2">
              <Label>Taxa do Dólar (R$)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={data.dollarRate}
                onChange={(e) => handleChange('dollarRate', parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-gray-500">Cotação do dólar para referência</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recomendações de Mercado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span>Margem de Lucro Típica (NOC)</span>
              <span className="font-medium">15% - 30%</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span>Margem de Risco Recomendada</span>
              <span className="font-medium">5% - 15%</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span>Margem Total Competitiva</span>
              <span className="font-medium">20% - 40%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
