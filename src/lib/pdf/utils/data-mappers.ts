import { ClientData as FormClientData } from '../../../components/calculators/ProposalClientForm'
import { ClientData as PDFClientData, ProposalData, EquipmentItem } from '../types/index'

/**
 * Maps form client data to PDF client data format
 */
export function mapFormClientDataToPDF(formData: FormClientData): PDFClientData {
  return {
    companyName: formData.razaoSocial,
    contactName: formData.nomeContato,
    email: formData.emailCliente,
    phone: formData.telefoneCliente,
    projectName: formData.nomeProjeto,
    managerName: formData.nomeGerente,
    managerEmail: formData.emailGerente,
    managerPhone: formData.telefoneGerente
  }
}

/**
 * Maps printer items to equipment items for PDF generation
 */
export function mapPrinterItemsToEquipments(printers: any[]): EquipmentItem[] {
  return printers.map(printer => ({
    id: printer.id,
    model: printer.modelo || 'N/A',
    brand: printer.marca || 'N/A',
    type: printer.tipo,
    monthlyVolume: printer.volumeMensal,
    monthlyCost: printer.custoMensal,
    specifications: {
      custoPorPagina: printer.custoPorPagina,
      custoAnual: printer.custoAnual,
      prazoContrato: printer.prazoContrato,
      isFromCatalog: printer.isFromCatalog,
      printerId: printer.printerId,
      valorMensalLocacao: printer.valorMensalLocacao
    }
  }))
}

/**
 * Creates proposal data from printer totals and items
 */
export function createProposalData(
  printers: any[], 
  totals: { custoMensal: number; custoAnual: number }
): ProposalData {
  // Calculate average contract period
  const avgContractPeriod = printers.length > 0 
    ? Math.round(printers.reduce((sum, p) => sum + p.prazoContrato, 0) / printers.length)
    : 12

  return {
    equipments: mapPrinterItemsToEquipments(printers),
    totalMonthly: totals.custoMensal,
    totalAnnual: totals.custoAnual,
    contractPeriod: avgContractPeriod,
    generatedAt: new Date()
  }
}

/**
 * Validates data before PDF generation
 */
export function validatePDFData(proposalData: ProposalData, clientData: PDFClientData): string[] {
  const errors: string[] = []

  // Validate client data
  if (!clientData.companyName?.trim()) {
    errors.push('Nome da empresa é obrigatório')
  }
  if (!clientData.contactName?.trim()) {
    errors.push('Nome do contato é obrigatório')
  }
  if (!clientData.email?.trim()) {
    errors.push('Email é obrigatório')
  }
  if (!clientData.projectName?.trim()) {
    errors.push('Nome do projeto é obrigatório')
  }

  // Validate proposal data
  if (!proposalData.equipments || proposalData.equipments.length === 0) {
    errors.push('Pelo menos um equipamento deve ser adicionado')
  }
  if (proposalData.totalMonthly <= 0) {
    errors.push('Valor mensal deve ser maior que zero')
  }

  return errors
}

export default {
  mapFormClientDataToPDF,
  mapPrinterItemsToEquipments,
  createProposalData,
  validatePDFData
}