"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useProposalStore } from "@/lib/stores/proposal-store"
import type { ProposalData } from "@/lib/types/proposals"

interface EditProposalModalProps {
  proposal: ProposalData
  isOpen: boolean
  onClose: () => void
}

export function EditProposalModal({ proposal, isOpen, onClose }: EditProposalModalProps) {
  const { updateProposal } = useProposalStore()
  
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientCompany: "",
    clientCNPJ: "",
    projectName: "",
    projectType: "",
    projectDescription: "",
    deliveryDate: "",
    estimatedBudget: "",
    managerName: "",
    managerEmail: "",
    managerPhone: "",
    managerDepartment: ""
  })

  useEffect(() => {
    if (proposal) {
      setFormData({
        clientName: proposal.clientName,
        clientEmail: proposal.clientEmail,
        clientPhone: proposal.clientPhone,
        clientCompany: proposal.clientCompany,
        clientCNPJ: proposal.clientCNPJ || "",
        projectName: proposal.projectName,
        projectType: proposal.projectType,
        projectDescription: proposal.projectDescription,
        deliveryDate: proposal.deliveryDate ? new Date(proposal.deliveryDate).toISOString().split('T')[0] : "",
        estimatedBudget: proposal.estimatedBudget,
        managerName: proposal.managerName,
        managerEmail: proposal.managerEmail,
        managerPhone: proposal.managerPhone,
        managerDepartment: proposal.managerDepartment
      })
    }
  }, [proposal])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const updatedData = {
      ...formData,
      deliveryDate: formData.deliveryDate ? new Date(formData.deliveryDate) : undefined,
      clientCNPJ: formData.clientCNPJ || undefined
    }

    updateProposal(proposal.id, updatedData)
    onClose()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Proposta - {proposal?.projectName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados do Cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Dados do Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Nome do Cliente *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="clientEmail">E-mail *</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="clientPhone">Telefone *</Label>
                <Input
                  id="clientPhone"
                  value={formData.clientPhone}
                  onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="clientCompany">Empresa *</Label>
                <Input
                  id="clientCompany"
                  value={formData.clientCompany}
                  onChange={(e) => handleInputChange('clientCompany', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="clientCNPJ">CNPJ</Label>
                <Input
                  id="clientCNPJ"
                  value={formData.clientCNPJ}
                  onChange={(e) => handleInputChange('clientCNPJ', e.target.value)}
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>
          </div>

          {/* Dados do Projeto */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Dados do Projeto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="projectName">Nome do Projeto *</Label>
                <Input
                  id="projectName"
                  value={formData.projectName}
                  onChange={(e) => handleInputChange('projectName', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="projectType">Tipo de Projeto *</Label>
                <Select value={formData.projectType} onValueChange={(value) => handleInputChange('projectType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desenvolvimento">Desenvolvimento</SelectItem>
                    <SelectItem value="consultoria">Consultoria</SelectItem>
                    <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
                    <SelectItem value="suporte">Suporte</SelectItem>
                    <SelectItem value="treinamento">Treinamento</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="projectDescription">Descrição do Projeto *</Label>
                <Textarea
                  id="projectDescription"
                  value={formData.projectDescription}
                  onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="deliveryDate">Prazo de Entrega</Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="estimatedBudget">Orçamento Estimado *</Label>
                <Input
                  id="estimatedBudget"
                  value={formData.estimatedBudget}
                  onChange={(e) => handleInputChange('estimatedBudget', e.target.value)}
                  placeholder="Ex: 50000"
                  required
                />
              </div>
            </div>
          </div>

          {/* Dados do Gerente */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Gerente de Contas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="managerName">Nome do Gerente *</Label>
                <Input
                  id="managerName"
                  value={formData.managerName}
                  onChange={(e) => handleInputChange('managerName', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="managerEmail">E-mail do Gerente *</Label>
                <Input
                  id="managerEmail"
                  type="email"
                  value={formData.managerEmail}
                  onChange={(e) => handleInputChange('managerEmail', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="managerPhone">Telefone do Gerente *</Label>
                <Input
                  id="managerPhone"
                  value={formData.managerPhone}
                  onChange={(e) => handleInputChange('managerPhone', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="managerDepartment">Departamento *</Label>
                <Select value={formData.managerDepartment} onValueChange={(value) => handleInputChange('managerDepartment', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vendas">Vendas</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                    <SelectItem value="projetos">Projetos</SelectItem>
                    <SelectItem value="ti">TI</SelectItem>
                    <SelectItem value="consultoria">Consultoria</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}