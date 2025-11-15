import { CommercialProposal } from '@/lib/types/commercial-proposal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface ScopeSectionProps {
  proposal: CommercialProposal;
  onUpdate?: (updates: Partial<CommercialProposal>) => void;
}

export function ScopeSection({ proposal, onUpdate }: ScopeSectionProps) {
  if (!onUpdate) return null;

  const addIncludedService = () => {
    onUpdate({
      detailedScope: {
        ...proposal.detailedScope,
        includedServices: [...proposal.detailedScope.includedServices, '']
      }
    });
  };

  const updateIncludedService = (index: number, value: string) => {
    const services = [...proposal.detailedScope.includedServices];
    services[index] = value;
    onUpdate({
      detailedScope: { ...proposal.detailedScope, includedServices: services }
    });
  };

  const removeIncludedService = (index: number) => {
    const services = proposal.detailedScope.includedServices.filter((_, i) => i !== index);
    onUpdate({
      detailedScope: { ...proposal.detailedScope, includedServices: services }
    });
  };

  const addExcludedService = () => {
    onUpdate({
      detailedScope: {
        ...proposal.detailedScope,
        excludedServices: [...proposal.detailedScope.excludedServices, '']
      }
    });
  };

  const updateExcludedService = (index: number, value: string) => {
    const services = [...proposal.detailedScope.excludedServices];
    services[index] = value;
    onUpdate({
      detailedScope: { ...proposal.detailedScope, excludedServices: services }
    });
  };

  const removeExcludedService = (index: number) => {
    const services = proposal.detailedScope.excludedServices.filter((_, i) => i !== index);
    onUpdate({
      detailedScope: { ...proposal.detailedScope, excludedServices: services }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>6. Escopo Detalhado (O "O quê" Está Incluído)</CardTitle>
          <CardDescription>
            Defina claramente o que está e o que NÃO está incluído na proposta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Serviços Incluídos</Label>
              <Button onClick={addIncludedService} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
            {proposal.detailedScope.includedServices.map((service, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder='Ex: "Gestão de Mídias Sociais (Instagram, LinkedIn)"'
                  value={service}
                  onChange={(e) => updateIncludedService(index, e.target.value)}
                />
                <Button onClick={() => removeIncludedService(index)} size="icon" variant="ghost">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Serviços NÃO Incluídos</Label>
              <Button onClick={addExcludedService} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
            {proposal.detailedScope.excludedServices.map((service, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder='Ex: "Investimento em mídia paga (Google/Meta Ads)"'
                  value={service}
                  onChange={(e) => updateExcludedService(index, e.target.value)}
                />
                <Button onClick={() => removeExcludedService(index)} size="icon" variant="ghost">
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
