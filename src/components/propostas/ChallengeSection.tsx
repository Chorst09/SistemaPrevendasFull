import { CommercialProposal } from '@/lib/types/commercial-proposal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ChallengeSectionProps {
  proposal: CommercialProposal;
  onUpdate: (updates: Partial<CommercialProposal>) => void;
}

export function ChallengeSection({ proposal, onUpdate }: ChallengeSectionProps) {
  const addContext = () => {
    onUpdate({
      challengeUnderstanding: {
        ...proposal.challengeUnderstanding,
        currentContext: [...proposal.challengeUnderstanding.currentContext, '']
      }
    });
  };

  const updateContext = (index: number, value: string) => {
    const contexts = [...proposal.challengeUnderstanding.currentContext];
    contexts[index] = value;
    onUpdate({
      challengeUnderstanding: { ...proposal.challengeUnderstanding, currentContext: contexts }
    });
  };

  const removeContext = (index: number) => {
    const contexts = proposal.challengeUnderstanding.currentContext.filter((_, i) => i !== index);
    onUpdate({
      challengeUnderstanding: { ...proposal.challengeUnderstanding, currentContext: contexts }
    });
  };

  const addObjective = () => {
    onUpdate({
      challengeUnderstanding: {
        ...proposal.challengeUnderstanding,
        businessObjectives: [...proposal.challengeUnderstanding.businessObjectives, '']
      }
    });
  };

  const updateObjective = (index: number, value: string) => {
    const objectives = [...proposal.challengeUnderstanding.businessObjectives];
    objectives[index] = value;
    onUpdate({
      challengeUnderstanding: { ...proposal.challengeUnderstanding, businessObjectives: objectives }
    });
  };

  const removeObjective = (index: number) => {
    const objectives = proposal.challengeUnderstanding.businessObjectives.filter((_, i) => i !== index);
    onUpdate({
      challengeUnderstanding: { ...proposal.challengeUnderstanding, businessObjectives: objectives }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>4. Entendimento do Desafio (Seção "Nós Ouvimos Você")</CardTitle>
          <CardDescription>
            Demonstre que você compreende profundamente o contexto e objetivos do cliente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Contexto Atual do Cliente</Label>
              <Button onClick={addContext} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
            {proposal.challengeUnderstanding.currentContext.map((context, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder='Ex: "Dificuldade em mensurar o ROI das ações de marketing"'
                  value={context}
                  onChange={(e) => updateContext(index, e.target.value)}
                />
                <Button onClick={() => removeContext(index)} size="icon" variant="ghost">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Objetivos de Negócio</Label>
              <Button onClick={addObjective} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
            {proposal.challengeUnderstanding.businessObjectives.map((objective, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder='Ex: "Expandir para o mercado X"'
                  value={objective}
                  onChange={(e) => updateObjective(index, e.target.value)}
                />
                <Button onClick={() => removeObjective(index)} size="icon" variant="ghost">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
