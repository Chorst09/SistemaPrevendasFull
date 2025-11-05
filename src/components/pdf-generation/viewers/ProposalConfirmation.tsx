import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog'
import { Button } from '../../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { 
  FileText, 
  Download, 
  Eye, 
  Edit, 
  CheckCircle, 
  Calendar,
  Building,
  DollarSign
} from 'lucide-react'
import { ProposalData, ClientData } from '../../../lib/pdf/types/index'

interface ProposalConfirmationProps {
  isOpen: boolean
  onClose: () => void
  onViewPDF: () => void
  onDownloadPDF: () => void
  onEditProposal: () => void
  proposalData: ProposalData
  clientData: ClientData
  pdfUrl: string
}

export function ProposalConfirmation({
  isOpen,
  onClose,
  onViewPDF,
  onDownloadPDF,
  onEditProposal,
  proposalData,
  clientData,
  pdfUrl
}: ProposalConfirmationProps) {

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <span>Proposta Gerada com Sucesso!</span>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Sua proposta PDF foi criada e está pronta para visualização ou download
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* PDF Preview Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <span>Preview da Proposta</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-8 bg-muted rounded-lg">
                <div className="text-center space-y-4">
                  <div className="w-16 h-20 bg-red-500 rounded shadow-lg mx-auto flex items-center justify-center">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Proposta - {clientData.projectName}</p>
                    <p className="text-sm text-muted-foreground">
                      Gerado em {proposalData.generatedAt.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {proposalData.equipments.length} equipamento(s)
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Proposal Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-blue-500" />
                  <span>Informações do Cliente</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Empresa</p>
                  <p className="font-semibold">{clientData.companyName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contato</p>
                  <p className="font-semibold">{clientData.contactName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Projeto</p>
                  <p className="font-semibold">{clientData.projectName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gerente</p>
                  <p className="font-semibold">{clientData.managerName}</p>
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <span>Resumo Financeiro</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Valor Mensal:</span>
                  <span className="font-bold text-green-600">
                    R$ {proposalData.totalMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Valor Anual:</span>
                  <span className="font-bold text-blue-600">
                    R$ {proposalData.totalAnnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Prazo do Contrato:</span>
                  <span className="font-semibold">
                    {proposalData.contractPeriod} meses
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Equipamentos:</span>
                  <span className="font-semibold">
                    {proposalData.equipments.length} item(s)
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Equipment List */}
          <Card>
            <CardHeader>
              <CardTitle>Equipamentos Inclusos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {proposalData.equipments.map((equipment, index) => (
                  <div key={equipment.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-semibold">
                        {equipment.brand} {equipment.model}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {equipment.type} - {equipment.monthlyVolume.toLocaleString()} páginas/mês
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        R$ {equipment.monthlyCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground">mensal</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
            <Button
              onClick={onViewPDF}
              className="flex items-center space-x-2 flex-1"
              variant="default"
            >
              <Eye className="h-4 w-4" />
              <span>Visualizar PDF</span>
            </Button>
            
            <Button
              onClick={onDownloadPDF}
              className="flex items-center space-x-2 flex-1"
              variant="outline"
            >
              <Download className="h-4 w-4" />
              <span>Baixar PDF</span>
            </Button>
            
            <Button
              onClick={onEditProposal}
              className="flex items-center space-x-2 flex-1"
              variant="outline"
            >
              <Edit className="h-4 w-4" />
              <span>Editar Proposta</span>
            </Button>
          </div>

          {/* Additional Information */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900">Próximos Passos</p>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• Revise a proposta antes de enviar ao cliente</li>
                  <li>• Faça o download para anexar em emails</li>
                  <li>• Use "Editar Proposta" para fazer ajustes se necessário</li>
                  <li>• A proposta foi salva automaticamente no sistema</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ProposalConfirmation