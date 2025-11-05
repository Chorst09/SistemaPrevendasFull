import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { PrinterCalculatorModule } from '../../printer-outsourcing/PrinterCalculatorModule'
import { ProposalListManager } from '../managers/ProposalListManager'
import { ArrowLeft } from 'lucide-react'

// Mock printer data for testing
const mockPrinters = [
  {
    id: '1',
    modelo: 'LaserJet Pro M404n',
    marca: 'HP',
    tipo: 'Laser P&B' as const,
    velocidadePPM: 38,
    custoAquisicao: 2500,
    custoMensalLocacao: 120,
    vidaUtilPaginas: 100000,
    consumoEnergia: 15,
    custoManutencaoMensal: 50,
    ativo: true,
    precificacao: {
      custoBase: 2500,
      margemDesejada: 25,
      regimeTributario: 'Simples Nacional',
      icmsCompra: 18,
      icmsVenda: 18,
      ipiCompra: 0,
      pisCofinsSaida: 3.65,
      comissaoVenda: 5,
      custosOperacionais: 10,
      precoVendaSugerido: 0.08,
      periodosLocacao: {
        12: { valorMensal: 150, valorTotal: 1800, paybackMeses: 12, roi: 15.5 },
        24: { valorMensal: 130, valorTotal: 3120, paybackMeses: 18, roi: 18.2 },
        36: { valorMensal: 120, valorTotal: 4320, paybackMeses: 20, roi: 22.1 }
      },
      calculadoEm: new Date().toISOString()
    }
  }
]

const mockSuprimentos: any[] = []

type ViewMode = 'list' | 'calculator' | 'editing'

export function EditingExample() {
  const [currentView, setCurrentView] = useState<ViewMode>('list')
  const [editingProposalId, setEditingProposalId] = useState<string | undefined>()

  const handleEditProposal = (proposalId: string) => {
    setEditingProposalId(proposalId)
    setCurrentView('editing')
  }

  const handleCreateNew = () => {
    setEditingProposalId(undefined)
    setCurrentView('calculator')
  }

  const handleBackToList = () => {
    setEditingProposalId(undefined)
    setCurrentView('list')
  }

  return (
    <div className="min-h-screen bg-background">
      {currentView === 'list' && (
        <div className="container mx-auto p-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Teste de Edição de Propostas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Este componente demonstra a funcionalidade de edição de propostas. 
                Você pode criar novas propostas ou editar propostas existentes.
              </p>
              <div className="space-y-2">
                <p className="text-sm"><strong>Como testar:</strong></p>
                <ol className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>1. Crie uma nova proposta clicando em "Nova Proposta"</li>
                  <li>2. Preencha os dados e gere o PDF</li>
                  <li>3. Volte para esta tela e clique em "Editar" na proposta criada</li>
                  <li>4. Modifique os dados e regenere o PDF</li>
                  <li>5. Verifique que a proposta foi atualizada com nova versão</li>
                  <li>6. Clique em "Histórico" para ver as versões anteriores</li>
                  <li>7. Compare versões selecionando duas e clicando em "Comparar"</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <ProposalListManager
            onEditProposal={handleEditProposal}
            onCreateNew={handleCreateNew}
          />
        </div>
      )}

      {(currentView === 'calculator' || currentView === 'editing') && (
        <PrinterCalculatorModule
          onBack={handleBackToList}
          printers={mockPrinters}
          suprimentos={mockSuprimentos}
          editingProposalId={editingProposalId}
        />
      )}
    </div>
  )
}

export default EditingExample