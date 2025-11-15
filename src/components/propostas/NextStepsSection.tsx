import { CommercialProposal } from '@/lib/types/commercial-proposal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface NextStepsSectionProps {
  proposal: CommercialProposal;
  onUpdate?: (updates: Partial<CommercialProposal>) => void;
}

export function NextStepsSection({ proposal, onUpdate }: NextStepsSectionProps) {
  if (!onUpdate) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>10. Próximos Passos</CardTitle>
        <CardDescription>
          Deixe claro o que o cliente precisa fazer para aprovar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="callToAction">Call to Action</Label>
          <Textarea
            id="callToAction"
            rows={4}
            placeholder="Descreva o que o cliente deve fazer para aprovar a proposta"
            value={proposal.nextSteps.callToAction}
            onChange={(e) => onUpdate({
              nextSteps: { ...proposal.nextSteps, callToAction: e.target.value }
            })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactInfo">Informações de Contato</Label>
          <Textarea
            id="contactInfo"
            rows={3}
            placeholder="Informações de contato para dúvidas"
            value={proposal.nextSteps.contactInfo}
            onChange={(e) => onUpdate({
              nextSteps: { ...proposal.nextSteps, contactInfo: e.target.value }
            })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
