import { CommercialProposal } from '@/lib/types/commercial-proposal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface SolutionSectionProps {
  proposal: CommercialProposal;
  onUpdate: (updates: Partial<CommercialProposal>) => void;
}

export function SolutionSection({ proposal, onUpdate }: SolutionSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>5. A Solução Proposta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Metodologia/Abordagem</Label>
          <Textarea
            rows={6}
            placeholder='Descreva sua metodologia...'
            value={proposal.proposedSolution.methodology}
            onChange={(e) => onUpdate({
              proposedSolution: { ...proposal.proposedSolution, methodology: e.target.value }
            })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
