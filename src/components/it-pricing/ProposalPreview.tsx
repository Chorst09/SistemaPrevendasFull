"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Download, Printer, X } from "lucide-react"
import { useProposalStore } from "@/lib/stores/proposal-store"
import type { ProposalData } from "@/lib/types/proposals"

interface ProposalPreviewProps {
  proposal: ProposalData
  isOpen: boolean
  onClose: () => void
}

export function ProposalPreview({ proposal, isOpen, onClose }: ProposalPreviewProps) {
  const { generateProposalPDF } = useProposalStore()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const getTotalValue = () => {
    return proposal.budgets.reduce((total, budget) => total + budget.totalValue, 0)
  }

  const getModuleName = (module: string) => {
    switch (module) {
      case 'sales': return 'VENDAS'
      case 'rental': return 'LOCAÇÃO'
      case 'services': return 'SERVIÇOS'
      default: return module.toUpperCase()
    }
  }

  const handleDownloadPDF = () => {
    generateProposalPDF(proposal.id, 'save')
    onClose()
  }

  const handlePrintPDF = () => {
    generateProposalPDF(proposal.id, 'print')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Prévia da Proposta - {proposal.projectName}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-4 bg-white text-black" style={{ fontFamily: 'Arial, sans-serif' }}>
          {/* Header */}
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold mb-2">PROPOSTA COMERCIAL</h1>
            <div className="flex justify-between text-sm">
              <span>Proposta: {proposal.id}</span>
              <span>Data: {formatDate(proposal.createdAt)}</span>
            </div>
          </div>

          {/* Dados do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">DADOS DO CLIENTE</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><strong>Cliente:</strong> {proposal.clientName}</div>
              <div><strong>Empresa:</strong> {proposal.clientCompany}</div>
              <div><strong>E-mail:</strong> {proposal.clientEmail}</div>
              <div><strong>Telefone:</strong> {proposal.clientPhone}</div>
              {proposal.clientCNPJ && (
                <div><strong>CNPJ:</strong> {proposal.clientCNPJ}</div>
              )}
            </CardContent>
          </Card>

          {/* Dados do Projeto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">DADOS DO PROJETO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><strong>Projeto:</strong> {proposal.projectName}</div>
              <div><strong>Tipo:</strong> {proposal.projectType}</div>
              <div><strong>Descrição:</strong> {proposal.projectDescription}</div>
              {proposal.deliveryDate && (
                <div><strong>Prazo de Entrega:</strong> {formatDate(proposal.deliveryDate)}</div>
              )}
            </CardContent>
          </Card>

          {/* Gerente de Contas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">GERENTE DE CONTAS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div><strong>Nome:</strong> {proposal.managerName}</div>
              <div><strong>E-mail:</strong> {proposal.managerEmail}</div>
              <div><strong>Telefone:</strong> {proposal.managerPhone}</div>
              <div><strong>Departamento:</strong> {proposal.managerDepartment}</div>
            </CardContent>
          </Card>

          {/* Orçamentos */}
          {proposal.budgets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ORÇAMENTOS DETALHADOS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {proposal.budgets.map((budget, index) => (
                  <div key={budget.id} className="border rounded p-4">
                    <h3 className="font-bold text-base mb-4">
                      {index + 1}. {getModuleName(budget.module)}
                    </h3>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Descrição</th>
                            <th className="text-center py-2 w-16">Qtd</th>
                            <th className="text-right py-2 w-24">Valor Unit.</th>
                            <th className="text-right py-2 w-24">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {budget.items.map((item) => (
                            <tr key={item.id} className="border-b">
                              <td className="py-2">{item.description}</td>
                              <td className="text-center py-2">{item.quantity}</td>
                              <td className="text-right py-2">{formatCurrency(item.unitPrice)}</td>
                              <td className="text-right py-2 font-medium">{formatCurrency(item.totalPrice)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 font-bold">
                            <td colSpan={3} className="text-right py-2">Subtotal {getModuleName(budget.module)}:</td>
                            <td className="text-right py-2">{formatCurrency(budget.totalValue)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                ))}

                {/* Total Geral */}
                <div className="bg-gray-100 p-4 rounded border-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">TOTAL GERAL DA PROPOSTA:</span>
                    <span className="text-xl font-bold text-[hsl(var(--accent-green))]">
                      {formatCurrency(getTotalValue())}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rodapé */}
          <div className="border-t pt-4 text-xs text-gray-600">
            <p>Esta proposta é válida por 30 dias a partir da data de emissão.</p>
            <p>Valores sujeitos a alteração sem aviso prévio.</p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button variant="outline" onClick={handlePrintPDF}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir PDF
          </Button>
          <Button onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Baixar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}