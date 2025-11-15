'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CommercialProposal } from '@/lib/types/commercial-proposal';
import { CommercialProposalService } from '@/lib/services/commercial-proposal-service';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, FileText } from 'lucide-react';

// Importar componentes de cada seção
import { CoverSection } from '@/components/propostas/CoverSection';
import { ExecutiveSummarySection } from '@/components/propostas/ExecutiveSummarySection';
import { ChallengeSection } from '@/components/propostas/ChallengeSection';
import { SolutionSection } from '@/components/propostas/SolutionSection';
import { ScopeSection } from '@/components/propostas/ScopeSection';
import { TimelineSection } from '@/components/propostas/TimelineSection';
import { InvestmentSection } from '@/components/propostas/InvestmentSection';
import { DifferentialsSection } from '@/components/propostas/DifferentialsSection';
import { NextStepsSection } from '@/components/propostas/NextStepsSection';
import { PreviewSection } from '@/components/propostas/PreviewSection';

export default function EditProposalPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [proposal, setProposal] = useState<CommercialProposal | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('capa');

  useEffect(() => {
    if (id) {
      const loaded = CommercialProposalService.getProposalById(id);
      if (loaded) {
        setProposal(loaded);
      } else {
        router.push('/propostas');
      }
    }

    // Verificar se há parâmetro tab na URL
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [id, router]);

  const handleSave = async () => {
    if (!proposal) return;

    setIsSaving(true);
    try {
      await CommercialProposalService.saveProposal(proposal);
      alert('Proposta salva com sucesso!');
    } catch (error) {
      console.error('Error saving proposal:', error);
      alert('Erro ao salvar proposta');
    } finally {
      setIsSaving(false);
    }
  };

  const updateProposal = (updates: Partial<CommercialProposal>) => {
    if (!proposal) return;
    setProposal({ ...proposal, ...updates });
  };

  if (!proposal) {
    return <div className="container mx-auto py-8">Carregando...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/propostas')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{proposal.title}</h1>
              <p className="text-muted-foreground">{proposal.proposalNumber}</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isSaving} size="lg">
            <Save className="mr-2 h-5 w-5" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
        
        {/* Indicador de Seções */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                Proposta Comercial Completa - 10 Seções
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Clique nas abas numeradas abaixo para preencher cada seção da proposta. 
                Use a aba "Preview" para visualizar o documento final.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="bg-background border rounded-lg p-2">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2">
            <TabsTrigger value="capa">1. Capa</TabsTrigger>
            <TabsTrigger value="sumario">2. Sumário</TabsTrigger>
            <TabsTrigger value="desafio">3. Desafio</TabsTrigger>
            <TabsTrigger value="solucao">4. Solução</TabsTrigger>
            <TabsTrigger value="escopo">5. Escopo</TabsTrigger>
            <TabsTrigger value="cronograma">6. Cronograma</TabsTrigger>
            <TabsTrigger value="investimento">7. Investimento</TabsTrigger>
            <TabsTrigger value="diferenciais">8. Diferenciais</TabsTrigger>
            <TabsTrigger value="proximos">9. Próximos</TabsTrigger>
            <TabsTrigger value="preview">
              <FileText className="h-4 w-4 mr-1" />
              Preview
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="capa">
          <CoverSection proposal={proposal} onUpdate={updateProposal} />
        </TabsContent>

        <TabsContent value="sumario">
          <ExecutiveSummarySection proposal={proposal} onUpdate={updateProposal} />
        </TabsContent>

        <TabsContent value="desafio">
          <ChallengeSection proposal={proposal} onUpdate={updateProposal} />
        </TabsContent>

        <TabsContent value="solucao">
          <SolutionSection proposal={proposal} onUpdate={updateProposal} />
        </TabsContent>

        <TabsContent value="escopo">
          <ScopeSection proposal={proposal} onUpdate={updateProposal} />
        </TabsContent>

        <TabsContent value="cronograma">
          <TimelineSection proposal={proposal} onUpdate={updateProposal} />
        </TabsContent>

        <TabsContent value="investimento">
          <InvestmentSection proposal={proposal} onUpdate={updateProposal} />
        </TabsContent>

        <TabsContent value="diferenciais">
          <DifferentialsSection proposal={proposal} onUpdate={updateProposal} />
        </TabsContent>

        <TabsContent value="proximos">
          <NextStepsSection proposal={proposal} onUpdate={updateProposal} />
        </TabsContent>

        <TabsContent value="preview">
          <PreviewSection proposal={proposal} />
        </TabsContent>
      </Tabs>

      {/* Botão de Salvar Fixo */}
      <div className="fixed bottom-8 right-8">
        <Button onClick={handleSave} disabled={isSaving} size="lg" className="shadow-lg">
          <Save className="mr-2 h-5 w-5" />
          {isSaving ? 'Salvando...' : 'Salvar Proposta'}
        </Button>
      </div>
    </div>
  );
}
