import { CommercialProposal, SocialProofItem } from '@/lib/types/commercial-proposal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, X } from 'lucide-react';

interface DifferentialsSectionProps {
  proposal: CommercialProposal;
  onUpdate?: (updates: Partial<CommercialProposal>) => void;
}

export function DifferentialsSection({ proposal, onUpdate }: DifferentialsSectionProps) {
  if (!onUpdate) return null;

  const addDifferential = () => {
    onUpdate({
      differentials: {
        ...proposal.differentials,
        keyDifferentials: [...proposal.differentials.keyDifferentials, '']
      }
    });
  };

  const updateDifferential = (index: number, value: string) => {
    const diffs = [...proposal.differentials.keyDifferentials];
    diffs[index] = value;
    onUpdate({
      differentials: { ...proposal.differentials, keyDifferentials: diffs }
    });
  };

  const removeDifferential = (index: number) => {
    const diffs = proposal.differentials.keyDifferentials.filter((_, i) => i !== index);
    onUpdate({
      differentials: { ...proposal.differentials, keyDifferentials: diffs }
    });
  };

  const addSocialProof = () => {
    const newProof: SocialProofItem = {
      id: crypto.randomUUID(),
      type: 'testimonial',
      description: '',
      company: '',
      author: '',
      authorRole: ''
    };
    onUpdate({
      differentials: {
        ...proposal.differentials,
        socialProof: [...proposal.differentials.socialProof, newProof]
      }
    });
  };

  const updateSocialProof = (index: number, updates: Partial<SocialProofItem>) => {
    const proofs = [...proposal.differentials.socialProof];
    proofs[index] = { ...proofs[index], ...updates };
    onUpdate({
      differentials: { ...proposal.differentials, socialProof: proofs }
    });
  };

  const removeSocialProof = (index: number) => {
    const proofs = proposal.differentials.socialProof.filter((_, i) => i !== index);
    onUpdate({
      differentials: { ...proposal.differentials, socialProof: proofs }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>9. Por que a [Nome da Sua Empresa]? (Nossos Diferenciais)</CardTitle>
          <CardDescription>
            Destaque seus diferenciais e prove sua credibilidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="whoWeAre">Quem Somos</Label>
            <Textarea
              id="whoWeAre"
              rows={4}
              placeholder="Breve parágrafo sobre sua empresa..."
              value={proposal.differentials.whoWeAre}
              onChange={(e) => onUpdate({
                differentials: { ...proposal.differentials, whoWeAre: e.target.value }
              })}
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Diferenciais (2-3 pontos fortes)</Label>
              <Button onClick={addDifferential} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
            {proposal.differentials.keyDifferentials.map((diff, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder='Ex: "Equipe 100% sênior", "Certificação Gold Partner"'
                  value={diff}
                  onChange={(e) => updateDifferential(index, e.target.value)}
                />
                <Button onClick={() => removeDifferential(index)} size="icon" variant="ghost">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Prova Social (Estudos de Caso ou Depoimentos)</CardTitle>
            <Button onClick={addSocialProof} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {proposal.differentials.socialProof.map((proof, index) => (
            <Card key={proof.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold">Prova Social {index + 1}</h4>
                    <Button onClick={() => removeSocialProof(index)} size="sm" variant="ghost">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={proof.type}
                      onValueChange={(value: any) => updateSocialProof(index, { type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="case-study">Estudo de Caso</SelectItem>
                        <SelectItem value="testimonial">Depoimento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Empresa/Cliente</Label>
                    <Input
                      placeholder="Nome da empresa"
                      value={proof.company || ''}
                      onChange={(e) => updateSocialProof(index, { company: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição/Depoimento</Label>
                    <Textarea
                      rows={3}
                      placeholder='Ex: "A Empresa X aumentou suas vendas em 40% após nosso projeto..."'
                      value={proof.description}
                      onChange={(e) => updateSocialProof(index, { description: e.target.value })}
                    />
                  </div>
                  {proof.type === 'testimonial' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Autor</Label>
                        <Input
                          placeholder="Nome do autor"
                          value={proof.author || ''}
                          onChange={(e) => updateSocialProof(index, { author: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Cargo</Label>
                        <Input
                          placeholder="Ex: CEO"
                          value={proof.authorRole || ''}
                          onChange={(e) => updateSocialProof(index, { authorRole: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
