import { CommercialProposal } from '@/lib/types/commercial-proposal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';

interface PreviewSectionProps {
  proposal: CommercialProposal;
  onUpdate?: (updates: Partial<CommercialProposal>) => void;
}

export function PreviewSection({ proposal }: PreviewSectionProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const { ProposalPDFGenerator } = require('@/lib/services/proposal-pdf-generator');
    const generator = new ProposalPDFGenerator();
    generator.downloadPDF(proposal);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2 print:hidden">
        <Button onClick={handlePrint} variant="outline">
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
        <Button onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-12 space-y-8">
          {/* Capa */}
          <div className="text-center space-y-4 border-b pb-8">
            <h1 className="text-4xl font-bold">{proposal.cover.proposalTitle || 'Proposta Comercial'}</h1>
            <div className="text-lg text-muted-foreground space-y-2">
              <p><strong>Para:</strong> {proposal.cover.clientName}</p>
              <p><strong>A/C:</strong> {proposal.cover.clientContact}</p>
              <p><strong>De:</strong> {proposal.cover.ourCompany}</p>
              <p><strong>Data:</strong> {new Date(proposal.cover.proposalDate).toLocaleDateString('pt-BR')}</p>
              <p><strong>Validade:</strong> {proposal.cover.validityDays} dias</p>
            </div>
          </div>

          {/* Sumário Executivo */}
          {proposal.executiveSummary.problem && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Sumário Executivo</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">O Desafio</h3>
                  <p className="text-muted-foreground">{proposal.executiveSummary.problem}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Nossa Solução</h3>
                  <p className="text-muted-foreground">{proposal.executiveSummary.solution}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Benefício Esperado</h3>
                  <p className="text-muted-foreground">{proposal.executiveSummary.mainBenefit}</p>
                </div>
              </div>
            </div>
          )}

          {/* Entendimento do Desafio */}
          {proposal.challengeUnderstanding.currentContext.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Entendimento do Desafio</h2>
              <div>
                <h3 className="font-semibold text-lg mb-2">Contexto Atual</h3>
                <ul className="list-disc list-inside space-y-1">
                  {proposal.challengeUnderstanding.currentContext.map((context, i) => (
                    <li key={i} className="text-muted-foreground">{context}</li>
                  ))}
                </ul>
              </div>
              {proposal.challengeUnderstanding.businessObjectives.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Objetivos de Negócio</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {proposal.challengeUnderstanding.businessObjectives.map((obj, i) => (
                      <li key={i} className="text-muted-foreground">{obj}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Solução Proposta */}
          {proposal.proposedSolution.methodology && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">A Solução Proposta</h2>
              <p className="text-muted-foreground">{proposal.proposedSolution.methodology}</p>
            </div>
          )}

          {/* Escopo */}
          {(proposal.detailedScope.includedServices.length > 0 || proposal.detailedScope.excludedServices.length > 0) && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Escopo Detalhado</h2>
              {proposal.detailedScope.includedServices.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Serviços Incluídos</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {proposal.detailedScope.includedServices.map((service, i) => (
                      <li key={i} className="text-muted-foreground">{service}</li>
                    ))}
                  </ul>
                </div>
              )}
              {proposal.detailedScope.excludedServices.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Serviços NÃO Incluídos</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {proposal.detailedScope.excludedServices.map((service, i) => (
                      <li key={i} className="text-muted-foreground">{service}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Cronograma */}
          {proposal.timeline.totalDuration && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Cronograma</h2>
              <p><strong>Duração Total:</strong> {proposal.timeline.totalDuration}</p>
              {proposal.timeline.milestones.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Marcos Principais</h3>
                  <ul className="space-y-2">
                    {proposal.timeline.milestones.map((milestone, i) => (
                      <li key={i}>
                        <strong>{milestone.period}:</strong> {milestone.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Investimento */}
          {proposal.investment.plans.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Investimento</h2>
              {proposal.investment.plans.map((plan, i) => (
                <div key={i} className="border-l-4 border-primary pl-4">
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  <p className="text-2xl font-bold text-primary">
                    R$ {plan.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    <span className="text-sm text-muted-foreground ml-2">
                      {plan.recurrence === 'monthly' && '/ mês'}
                      {plan.recurrence === 'quarterly' && '/ trimestre'}
                      {plan.recurrence === 'annual' && '/ ano'}
                    </span>
                  </p>
                  {plan.description && <p className="text-muted-foreground mt-2">{plan.description}</p>}
                </div>
              ))}
              {proposal.investment.paymentConditions && (
                <div>
                  <h3 className="font-semibold">Condições de Pagamento</h3>
                  <p className="text-muted-foreground">{proposal.investment.paymentConditions}</p>
                </div>
              )}
            </div>
          )}

          {/* Diferenciais */}
          {proposal.differentials.whoWeAre && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Por que {proposal.cover.ourCompany}?</h2>
              <p className="text-muted-foreground">{proposal.differentials.whoWeAre}</p>
              {proposal.differentials.keyDifferentials.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Nossos Diferenciais</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {proposal.differentials.keyDifferentials.map((diff, i) => (
                      <li key={i} className="text-muted-foreground">{diff}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Próximos Passos */}
          {proposal.nextSteps.callToAction && (
            <div className="space-y-4 border-t pt-8">
              <h2 className="text-2xl font-bold">Próximos Passos</h2>
              <p className="text-muted-foreground">{proposal.nextSteps.callToAction}</p>
              {proposal.nextSteps.contactInfo && (
                <p className="text-muted-foreground">{proposal.nextSteps.contactInfo}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
