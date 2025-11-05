import React, { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog'
import { Button } from '../../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { Separator } from '../../ui/separator'
import { 
  History, 
  Calendar, 
  FileText, 
  Eye, 
  Download, 
  GitBranch,
  ArrowRight,
  Clock,
  User,
  DollarSign
} from 'lucide-react'
import { proposalStorage } from '../../../lib/pdf/services/storage'
import { SavedProposal, ProposalVersion } from '../../../lib/pdf/types'
import { useToast } from '../../../hooks/use-toast'
import { 
  downloadPDF,
  openPDFInNewTab,
  generatePDFFileName
} from '../../../lib/pdf/utils/pdf-viewer'

interface ProposalVersionHistoryProps {
  isOpen: boolean
  onClose: () => void
  proposalId: string
  currentProposal?: SavedProposal
}

export function ProposalVersionHistory({
  isOpen,
  onClose,
  proposalId,
  currentProposal
}: ProposalVersionHistoryProps) {
  const [versions, setVersions] = useState<ProposalVersion[]>([])
  const [proposal, setProposal] = useState<SavedProposal | null>(currentProposal || null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedVersions, setSelectedVersions] = useState<number[]>([])
  const { toast } = useToast()

  // Load version history
  const loadVersionHistory = useCallback(async () => {
    if (!proposalId) return

    setIsLoading(true)
    try {
      const [versionHistory, proposalData] = await Promise.all([
        proposalStorage.getVersionHistory(proposalId),
        currentProposal ? Promise.resolve(currentProposal) : proposalStorage.load(proposalId)
      ])

      setVersions(versionHistory)
      setProposal(proposalData)
    } catch (error) {
      console.error('Failed to load version history:', error)
      toast({
        title: "Erro ao Carregar",
        description: "Não foi possível carregar o histórico de versões.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [proposalId, currentProposal, toast])

  // Download version PDF
  const handleDownloadVersion = useCallback((version: ProposalVersion, versionNumber: number) => {
    try {
      const pdfUrl = URL.createObjectURL(version.pdfBlob)
      const fileName = generatePDFFileName(
        version.clientData.companyName, 
        `${version.clientData.projectName}_v${versionNumber}`
      )
      downloadPDF(pdfUrl, fileName)
      
      toast({
        title: "Download Iniciado",
        description: `Baixando versão ${versionNumber} da proposta.`,
      })
      
      // Clean up the URL
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000)
    } catch (error) {
      console.error('Failed to download version:', error)
      toast({
        title: "Erro no Download",
        description: "Não foi possível fazer o download da versão.",
        variant: "destructive"
      })
    }
  }, [toast])

  // View version PDF
  const handleViewVersion = useCallback((version: ProposalVersion, versionNumber: number) => {
    try {
      const pdfUrl = URL.createObjectURL(version.pdfBlob)
      const fileName = generatePDFFileName(
        version.clientData.companyName, 
        `${version.clientData.projectName}_v${versionNumber}`
      )
      openPDFInNewTab(pdfUrl, fileName)
      
      // Clean up the URL after a delay
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000)
    } catch (error) {
      console.error('Failed to view version:', error)
      toast({
        title: "Erro",
        description: "Não foi possível visualizar a versão.",
        variant: "destructive"
      })
    }
  }, [toast])

  // Toggle version selection for comparison
  const toggleVersionSelection = useCallback((versionNumber: number) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionNumber)) {
        return prev.filter(v => v !== versionNumber)
      } else if (prev.length < 2) {
        return [...prev, versionNumber]
      } else {
        // Replace the first selected version
        return [prev[1], versionNumber]
      }
    })
  }, [])

  // Compare selected versions
  const compareVersions = useCallback(() => {
    if (selectedVersions.length !== 2) return

    const [v1, v2] = selectedVersions.sort((a, b) => a - b)
    const version1 = versions.find(v => v.version === v1)
    const version2 = versions.find(v => v.version === v2) || 
                    (proposal && proposal.version === v2 ? proposal : null)

    if (!version1 || !version2) return

    const differences = proposalStorage.compareVersions(
      version1.proposalData,
      version2.proposalData
    )

    // Show comparison in a simple alert for now
    // In a real implementation, this could be a more sophisticated comparison view
    if (differences.length === 0) {
      toast({
        title: "Versões Idênticas",
        description: "Não foram encontradas diferenças entre as versões selecionadas.",
      })
    } else {
      const message = `Diferenças entre versão ${v1} e ${v2}:\n\n${differences.join('\n')}`
      alert(message)
    }
  }, [selectedVersions, versions, proposal, toast])

  // Load data when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadVersionHistory()
    }
  }, [isOpen, loadVersionHistory])

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando histórico de versões...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <History className="h-6 w-6 text-blue-500" />
            <span>Histórico de Versões</span>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {proposal ? `Proposta: ${proposal.projectName} - ${proposal.clientName}` : 'Carregando...'}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Comparison Controls */}
          {selectedVersions.length > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <GitBranch className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      {selectedVersions.length === 1 
                        ? `Versão ${selectedVersions[0]} selecionada`
                        : `Versões ${selectedVersions.join(' e ')} selecionadas`
                      }
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    {selectedVersions.length === 2 && (
                      <Button size="sm" onClick={compareVersions}>
                        Comparar Versões
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setSelectedVersions([])}
                    >
                      Limpar Seleção
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Version */}
          {proposal && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Badge className="bg-green-600 hover:bg-green-700">
                      Versão Atual ({proposal.version})
                    </Badge>
                    <span className="text-lg">Versão Mais Recente</span>
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant={selectedVersions.includes(proposal.version) ? "default" : "outline"}
                      onClick={() => toggleVersionSelection(proposal.version)}
                    >
                      {selectedVersions.includes(proposal.version) ? "Selecionado" : "Selecionar"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Atualizado em</p>
                      <p className="font-medium">{proposal.updatedAt.toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Valor Mensal</p>
                      <p className="font-medium text-green-700">
                        R$ {proposal.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Equipamentos</p>
                      <p className="font-medium">{proposal.proposalData.equipments.length} item(s)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Version History */}
          {versions.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Versões Anteriores</h3>
              {versions
                .sort((a, b) => b.version - a.version)
                .map((version) => (
                  <Card key={version.version} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                          <Badge variant="outline">
                            Versão {version.version}
                          </Badge>
                          <span className="text-base">
                            {version.createdAt.toLocaleDateString('pt-BR')} às {version.createdAt.toLocaleTimeString('pt-BR')}
                          </span>
                        </CardTitle>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewVersion(version, version.version)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Ver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadVersion(version, version.version)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Baixar
                          </Button>
                          <Button
                            size="sm"
                            variant={selectedVersions.includes(version.version) ? "default" : "outline"}
                            onClick={() => toggleVersionSelection(version.version)}
                          >
                            {selectedVersions.includes(version.version) ? "Selecionado" : "Selecionar"}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Valor Mensal</p>
                            <p className="font-medium">
                              R$ {version.proposalData.totalMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Equipamentos</p>
                            <p className="font-medium">{version.proposalData.equipments.length} item(s)</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Prazo</p>
                            <p className="font-medium">{version.proposalData.contractPeriod} meses</p>
                          </div>
                        </div>
                      </div>

                      {/* Changes */}
                      {version.changes && version.changes.length > 0 && (
                        <div>
                          <Separator className="mb-3" />
                          <h4 className="font-medium text-sm mb-2 flex items-center">
                            <ArrowRight className="h-3 w-3 mr-1" />
                            Alterações nesta versão:
                          </h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {version.changes.map((change, index) => (
                              <li key={index} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>{change}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma versão anterior</h3>
                <p className="text-muted-foreground">
                  Esta é a primeira versão da proposta. O histórico será criado quando você fizer alterações.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ProposalVersionHistory