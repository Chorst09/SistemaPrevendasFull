'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface TaxesTabProps {
  data: {
    federalTax: number;
    stateTax: number;
    municipalTax: number;
    socialCharges: number;
  };
  onChange: (data: any) => void;
}

export function TaxesTab({ data, onChange }: TaxesTabProps) {
  const handleChange = (field: string, value: number) => {
    onChange({ ...data, [field]: value });
  };

  const totalTax = data.federalTax + data.stateTax + data.municipalTax + data.socialCharges;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Impostos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Imposto Federal (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={data.federalTax}
                onChange={(e) => handleChange('federalTax', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label>Imposto Estadual (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={data.stateTax}
                onChange={(e) => handleChange('stateTax', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label>Imposto Municipal (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={data.municipalTax}
                onChange={(e) => handleChange('municipalTax', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label>Encargos Sociais (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={data.socialCharges}
                onChange={(e) => handleChange('socialCharges', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Carga Tributária Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold text-red-600">
              {totalTax.toFixed(2)}%
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Total de impostos e encargos
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
