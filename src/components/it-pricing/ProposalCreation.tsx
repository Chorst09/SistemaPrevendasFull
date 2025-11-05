"use client"

import { useState } from "react"
import { ArrowLeft, User, Building, UserCheck, ShoppingCart, Calendar, Wrench } from "lucide-react"
import { useProposalStore } from "@/lib/stores/proposal-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProposalCreationProps {
  onBack: () => void
  onSelectModule: (module: string) => void
}

type ProposalStep = "form" | "modules"

export function ProposalCreation({ onBack, onSelectModule }: ProposalCreationProps) {
  const [currentStep, setCurrentStep] = useState<ProposalStep>("form")
  const { createProposal, setCurrentProposal } = useProposalStore()
  const [formData, setFormData] = useState({
    // Dados do Cliente
    clientName: "CARLOS HORST",
    clientEmail: "",
    clientPhone: "",
    clientCompany: "",
    clientCNPJ: "",
    clientAddress: "",
    
    // Dados do Projeto
    projectName: "CARLOS HORST",
    projectType: "",
    projectDescription: "",
    deliveryDate: "",
    estimatedBudget: "0,00",
    
    // Gerente de Contas
    managerName: "",
    managerEmail: "",
    managerPhone: "",
    managerDepartment: ""
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCreateProposal = () => {
    // Salvar a proposta no store
    const proposalId = createProposal({
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      clientPhone: formData.clientPhone,
      clientCompany: formData.clientCompany,
      clientCNPJ: formData.clientCNPJ,
      clientAddress: formData.clientAddress,
      projectName: formData.projectName,
      projectType: formData.projectType,
      projectDescription: formData.projectDescription,
      deliveryDate: formData.deliveryDate,
      estimatedBudget: formData.estimatedBudget,
      managerName: formData.managerName,
      managerEmail: formData.managerEmail,
      managerPhone: formData.managerPhone,
      managerDepartment: formData.managerDepartment
    })
    
    // Definir como proposta atual
    setCurrentProposal(proposalId)
    
    setCurrentStep("modules")
  }

  const handleModuleSelect = (module: string) => {
    onSelectModule(module)
  }

  if (currentStep === "modules") {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setCurrentStep("form")}>
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Building className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-semibold">Selecionar Módulos</h1>
                  <p className="text-sm text-muted-foreground">Escolha os módulos para sua proposta</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          {/* Resumo da Proposta */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Resumo da Proposta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Cliente</p>
                    <p className="font-medium">{formData.clientName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Empresa</p>
                    <p className="font-medium">{formData.clientCompany || "Double"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Projeto</p>
                    <p className="font-medium">{formData.projectName}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Escolha os Módulos */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">Escolha os Módulos</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Selecione os módulos que deseja incluir na sua proposta. Você pode escolher um 
              ou mais módulos conforme a necessidade do projeto.
            </p>
          </div>

          {/* Cards dos Módulos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Módulo de Vendas */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleModuleSelect("sales")}>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="h-8 w-8 text-teal-600" />
                </div>
                <CardTitle className="text-xl">Módulo de Vendas</CardTitle>
                <p className="text-muted-foreground">
                  Precificação inteligente para produtos de hardware e software
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-teal-600">Ideal para</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Venda de equipamentos</li>
                    <li>• Licenças de software</li>
                    <li>• Hardware personalizado</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Módulo de Locação */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleModuleSelect("rental")}>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Módulo de Locação</CardTitle>
                <p className="text-muted-foreground">
                  Gestão completa de locação de equipamentos
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-purple-600">Ideal para</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Aluguel de equipamentos</li>
                    <li>• Locação temporária</li>
                    <li>• Contratos flexíveis</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Módulo de Serviços */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleModuleSelect("services")}>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Wrench className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Módulo de Serviços</CardTitle>
                <p className="text-muted-foreground">
                  Precificação de consultoria, suporte e implementação
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-green-600">Ideal para</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Consultoria técnica</li>
                    <li>• Suporte especializado</li>
                    <li>• Implementação de projetos</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Building className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold">Nova Proposta</h1>
                <p className="text-sm text-muted-foreground">Criar proposta personalizada</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Dados do Cliente */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <CardTitle>Dados do Cliente</CardTitle>
                  <p className="text-sm text-muted-foreground">Informações do cliente para a proposta</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Nome do Cliente *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange("clientName", e.target.value)}
                  placeholder="Digite o nome completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">E-mail *</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => handleInputChange("clientEmail", e.target.value)}
                  placeholder="cliente@empresa.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Telefone *</Label>
                <Input
                  id="clientPhone"
                  value={formData.clientPhone}
                  onChange={(e) => handleInputChange("clientPhone", e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientCompany">Empresa *</Label>
                <Input
                  id="clientCompany"
                  value={formData.clientCompany}
                  onChange={(e) => handleInputChange("clientCompany", e.target.value)}
                  placeholder="Nome da empresa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientCNPJ">CNPJ</Label>
                <Input
                  id="clientCNPJ"
                  value={formData.clientCNPJ}
                  onChange={(e) => handleInputChange("clientCNPJ", e.target.value)}
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientAddress">Endereço</Label>
                <Textarea
                  id="clientAddress"
                  value={formData.clientAddress}
                  onChange={(e) => handleInputChange("clientAddress", e.target.value)}
                  placeholder="Endereço completo da empresa"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dados do Projeto */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <Building className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Dados do Projeto</CardTitle>
                  <p className="text-sm text-muted-foreground">Informações sobre o projeto a ser desenvolvido</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Nome do Projeto *</Label>
                <Input
                  id="projectName"
                  value={formData.projectName}
                  onChange={(e) => handleInputChange("projectName", e.target.value)}
                  placeholder="Digite o nome do projeto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectType">Tipo de Projeto *</Label>
                <Select value={formData.projectType} onValueChange={(value) => handleInputChange("projectType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="implementacao">Implementação</SelectItem>
                    <SelectItem value="consultoria">Consultoria</SelectItem>
                    <SelectItem value="suporte">Suporte</SelectItem>
                    <SelectItem value="desenvolvimento">Desenvolvimento</SelectItem>
                    <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectDescription">Descrição do Projeto *</Label>
                <Textarea
                  id="projectDescription"
                  value={formData.projectDescription}
                  onChange={(e) => handleInputChange("projectDescription", e.target.value)}
                  placeholder="Descreva detalhadamente o projeto"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryDate">Prazo de Entrega</Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => handleInputChange("deliveryDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedBudget">Orçamento Estimado (R$)</Label>
                <Input
                  id="estimatedBudget"
                  value={formData.estimatedBudget}
                  onChange={(e) => handleInputChange("estimatedBudget", e.target.value)}
                  placeholder="0,00"
                />
              </div>
            </CardContent>
          </Card>

          {/* Gerente de Contas */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle>Gerente de Contas</CardTitle>
                  <p className="text-sm text-muted-foreground">Responsável pela conta do cliente</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="managerName">Nome do Gerente *</Label>
                <Input
                  id="managerName"
                  value={formData.managerName}
                  onChange={(e) => handleInputChange("managerName", e.target.value)}
                  placeholder="Nome completo do gerente"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="managerEmail">E-mail do Gerente *</Label>
                <Input
                  id="managerEmail"
                  type="email"
                  value={formData.managerEmail}
                  onChange={(e) => handleInputChange("managerEmail", e.target.value)}
                  placeholder="gerente@empresa.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="managerPhone">Telefone do Gerente</Label>
                <Input
                  id="managerPhone"
                  value={formData.managerPhone}
                  onChange={(e) => handleInputChange("managerPhone", e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="managerDepartment">Departamento</Label>
                <Select value={formData.managerDepartment} onValueChange={(value) => handleInputChange("managerDepartment", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vendas">Vendas</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                    <SelectItem value="projetos">Projetos</SelectItem>
                    <SelectItem value="tecnico">Técnico</SelectItem>
                    <SelectItem value="suporte">Suporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-4 mt-8">
          <Button variant="outline" onClick={onBack}>
            Cancelar
          </Button>
          <Button onClick={handleCreateProposal} className="bg-teal-600 hover:bg-teal-700">
            <Building className="h-4 w-4 mr-2" />
            Criar Proposta
          </Button>
        </div>
      </div>
    </div>
  )
}