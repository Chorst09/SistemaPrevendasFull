import { CommercialProposal, InvestmentPlan } from '@/lib/types/commercial-proposal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

interface InvestmentSectionProps {
  proposal: CommercialProposal;
  onUpdate?: (updates: Partial<CommercialProposal>) => void;
}

export function InvestmentSection({ proposal, onUpdate }: InvestmentSectionProps) {
  if (!onUpdate) return null;

  const addPlan = () => {
    const newPlan: InvestmentPlan = {
      id: crypto.randomUUID(),
      name: '',
      value: 0,
      recurrence: 'monthly',
      description: ''
    };
    onUpdate({
      investment: {
        ...proposal.investment,
        plans: [...(proposal.investment.plans || []), newPlan]
      }
    });
  };

  const updatePlan = (index: number, updates: Partial<InvestmentPlan>) => {
    const plans = [...(proposal.investment.plans || [])];
    plans[index] = { ...plans[index], ...updates };
    onUpdate({
      investment: { ...proposal.investment, plans }
    });
  };

  const removePlan = (index: number) => {
    const plans = (proposal.investment.plans || []).filter((_, i) => i !== index);
    onUpdate({
      investment: { ...proposal.investment, plans }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>8. Investimento e Condições Comerciais</CardTitle>
          <CardDescription>
            Defina os planos, valores e condições de pagamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="setupFee">Taxa de Setup (se houver)</Label>
            <Input
              id="setupFee"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={proposal.investment.setupFee || 0}
              onChange={(e) => onUpdate({
                investment: { ...proposal.investment, setupFee: Number(e.target.value) }
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentConditions">Condições de Pagamento</Label>
            <Textarea
              id="paymentConditions"
              rows={3}
              placeholder='Ex: "Pagamento mensal via boleto/PIX, com vencimento todo dia 10"'
              value={proposal.investment.paymentConditions}
              onChange={(e) => onUpdate({
                investment: { ...proposal.investment, paymentConditions: e.target.value }
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contractTerms">Condições Contratuais</Label>
            <Textarea
              id="contractTerms"
              rows={3}
              placeholder='Ex: "Contrato com fidelidade de 6 meses", "Rescisão com aviso prévio de 30 dias"'
              value={proposal.investment.contractTerms}
              onChange={(e) => onUpdate({
                investment: { ...proposal.investment, contractTerms: e.target.value }
              })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Planos e Valores</CardTitle>
            <Button onClick={addPlan} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Plano
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {(proposal.investment.plans || []).map((plan, index) => (
            <Card key={plan.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold">Plano {index + 1}</h4>
                    <Button onClick={() => removePlan(index)} size="sm" variant="ghost">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome do Plano</Label>
                      <Input
                        placeholder='Ex: "Plano Completo"'
                        value={plan.name}
                        onChange={(e) => updatePlan(index, { name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Valor (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={plan.value}
                        onChange={(e) => updatePlan(index, { value: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Recorrência</Label>
                    <Select
                      value={plan.recurrence}
                      onValueChange={(value: any) => updatePlan(index, { recurrence: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="quarterly">Trimestral</SelectItem>
                        <SelectItem value="annual">Anual</SelectItem>
                        <SelectItem value="one-time">Pagamento Único</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea
                      rows={2}
                      placeholder="Descreva o que está incluído neste plano..."
                      value={plan.description || ''}
                      onChange={(e) => updatePlan(index, { description: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
