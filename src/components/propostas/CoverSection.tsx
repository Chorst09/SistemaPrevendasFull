import { CommercialProposal, ToneOfVoice } from '@/lib/types/commercial-proposal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CoverSectionProps {
  proposal: CommercialProposal;
  onUpdate: (updates: Partial<CommercialProposal>) => void;
}

export function CoverSection({ proposal, onUpdate }: CoverSectionProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>1. Informações de Capa e Contexto</CardTitle>
          <CardDescription>
            Dados básicos que aparecerão na capa da proposta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Para (Cliente)</Label>
              <Input
                id="clientName"
                placeholder="Nome da Empresa Cliente"
                value={proposal.cover.clientName}
                onChange={(e) => onUpdate({
                  cover: { ...proposal.cover, clientName: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientContact">A/C (Contato Principal)</Label>
              <Input
                id="clientContact"
                placeholder="Nome da pessoa de contato"
                value={proposal.cover.clientContact}
                onChange={(e) => onUpdate({
                  cover: { ...proposal.cover, clientContact: e.target.value }
                })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ourCompany">De (Nossa Empresa)</Label>
              <Input
                id="ourCompany"
                placeholder="Nome da Sua Empresa"
                value={proposal.cover.ourCompany}
                onChange={(e) => onUpdate({
                  cover: { ...proposal.cover, ourCompany: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ourContact">Nosso Contato</Label>
              <Input
                id="ourContact"
                placeholder="Seu Nome/Cargo/Email"
                value={proposal.cover.ourContact}
                onChange={(e) => onUpdate({
                  cover: { ...proposal.cover, ourContact: e.target.value }
                })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proposalDate">Data da Proposta</Label>
              <Input
                id="proposalDate"
                type="date"
                value={new Date(proposal.cover.proposalDate).toISOString().split('T')[0]}
                onChange={(e) => onUpdate({
                  cover: { ...proposal.cover, proposalDate: new Date(e.target.value) }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validityDays">Validade (dias)</Label>
              <Input
                id="validityDays"
                type="number"
                placeholder="Ex: 15"
                value={proposal.cover.validityDays}
                onChange={(e) => onUpdate({
                  cover: { ...proposal.cover, validityDays: Number(e.target.value) }
                })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proposalTitle">Título da Proposta</Label>
            <Input
              id="proposalTitle"
              placeholder='Ex: "Proposta de Parceria Estratégica em Marketing Digital"'
              value={proposal.cover.proposalTitle}
              onChange={(e) => onUpdate({
                cover: { ...proposal.cover, proposalTitle: e.target.value },
                title: e.target.value // Atualiza também o título principal
              })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Tom de Voz e Estilo</CardTitle>
          <CardDescription>
            Escolha o tom de voz que melhor se adequa ao seu cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="toneOfVoice">Tom de Voz Desejado</Label>
            <Select
              value={proposal.toneOfVoice}
              onValueChange={(value) => onUpdate({ toneOfVoice: value as ToneOfVoice })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="formal-corporativo">Formal e Corporativo</SelectItem>
                <SelectItem value="consultivo-especialista">Consultivo e Especialista</SelectItem>
                <SelectItem value="moderno-parceiro">Moderno e Parceiro</SelectItem>
                <SelectItem value="direto-tecnico">Direto e Técnico</SelectItem>
                <SelectItem value="entusiasta-criativo">Entusiasta e Criativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
