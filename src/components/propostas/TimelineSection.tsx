import { CommercialProposal, TimelineMilestone } from '@/lib/types/commercial-proposal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface TimelineSectionProps {
  proposal: CommercialProposal;
  onUpdate?: (updates: Partial<CommercialProposal>) => void;
}

export function TimelineSection({ proposal, onUpdate }: TimelineSectionProps) {
  if (!onUpdate) return null;

  const addMilestone = () => {
    const newMilestone: TimelineMilestone = {
      id: crypto.randomUUID(),
      period: '',
      description: ''
    };
    onUpdate({
      timeline: {
        ...proposal.timeline,
        milestones: [...proposal.timeline.milestones, newMilestone]
      }
    });
  };

  const updateMilestone = (index: number, updates: Partial<TimelineMilestone>) => {
    const milestones = [...proposal.timeline.milestones];
    milestones[index] = { ...milestones[index], ...updates };
    onUpdate({
      timeline: { ...proposal.timeline, milestones }
    });
  };

  const removeMilestone = (index: number) => {
    const milestones = proposal.timeline.milestones.filter((_, i) => i !== index);
    onUpdate({
      timeline: { ...proposal.timeline, milestones }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>7. Cronograma e Prazos</CardTitle>
          <CardDescription>
            Defina a duração total e os principais marcos do projeto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="totalDuration">Duração Total Estimada</Label>
            <Input
              id="totalDuration"
              placeholder='Ex: "6 meses (contrato inicial)" ou "8 semanas para implementação"'
              value={proposal.timeline.totalDuration}
              onChange={(e) => onUpdate({
                timeline: { ...proposal.timeline, totalDuration: e.target.value }
              })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Marcos Principais</CardTitle>
            <Button onClick={addMilestone} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Marco
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {proposal.timeline.milestones.map((milestone, index) => (
            <Card key={milestone.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold">Marco {index + 1}</h4>
                    <Button onClick={() => removeMilestone(index)} size="sm" variant="ghost">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Período</Label>
                      <Input
                        placeholder='Ex: "Semana 1-2"'
                        value={milestone.period}
                        onChange={(e) => updateMilestone(index, { period: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Input
                        placeholder='Ex: "Kick-off e entrega do Planejamento"'
                        value={milestone.description}
                        onChange={(e) => updateMilestone(index, { description: e.target.value })}
                      />
                    </div>
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
