export interface ProposalData {
    id: string
    // Dados do Cliente
    clientName: string
    clientEmail: string
    clientPhone: string
    clientCompany: string
    clientCNPJ: string
    clientAddress: string

    // Dados do Projeto
    projectName: string
    projectType: string
    projectDescription: string
    deliveryDate: string
    estimatedBudget: string

    // Gerente de Contas
    managerName: string
    managerEmail: string
    managerPhone: string
    managerDepartment: string

    // Metadados
    status: "draft" | "active" | "completed" | "cancelled"
    createdAt: Date
    updatedAt: Date

    // Orçamentos associados
    budgets: Budget[]
}

export interface Budget {
    id: string
    proposalId: string
    module: "sales" | "rental" | "services"
    items: BudgetItem[]
    totalValue: number
    createdAt: Date
    updatedAt: Date
}

export interface BudgetItem {
    id: string
    description: string
    quantity: number
    unitPrice: number
    totalPrice: number
    module: "sales" | "rental" | "services"
    moduleData: any // Dados específicos do módulo (produtos, serviços, etc.)
}