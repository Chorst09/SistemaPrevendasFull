import { CommercialProposal } from '@/lib/types/commercial-proposal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ExecutiveSummarySectionProps {
  proposal: CommercialProposal;
  onUpdate: (updates: Partial<CommercialProposal>) => void;
}

export function ExecutiveSummarySection({ proposal, onUpdate }: ExecutiveSummarySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>3. Sumário Executivo (A "Visão Geral")</CardTitle>
        <CardDescription>
          Apresente o problema, a solução e o benefício principal de forma concisa
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="problem">O Problema (A Dor do Cliente)</Label>
          <Textarea
            id="problem"
            rows={3}
            placeholder='Ex: "A [Nome do Cliente] busca aumentar sua geração de leads qualificados B2B..."'
            value={proposal.executiveSummary.problem}
            onChange={(e) => onUpdate({
              executiveSummary: { ...proposal.executiveSummary, problem: e.target.value }
            })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="solution">A Solução (Nossa Resposta)</Label>
          <Textarea
            id="solution"
            rows={3}
            placeholder='Ex: "Propomos a implementação de uma estratégia de Inbound Marketing completa..."'
            value={proposal.executiveSummary.solution}
            onChange={(e) => onUpdate({
              executiveSummary: { ...proposal.executiveSummary, solution: e.target.value }
            })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mainBenefit">O Benefício Principal (O Ganho)</Label>
          <Textarea
            id="mainBenefit"
            rows={3}
            placeholder='Ex: "...resultando em um aumento estimado de 30% em MQLs nos primeiros 6 meses."'
            value={proposal.executiveSummary.mainBenefit}
            onChange={(e) => onUpdate({
              executiveSummary: { ...proposal.executiveSummary, mainBenefit: e.target.value }
            })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
