import { jsPDF } from '../../../lib/pdf/utils/imports'
import { 
  ProposalData, 
  ClientData, 
  CompanyInfo, 
  EquipmentItem 
} from '../../../lib/pdf/types/index'

/**
 * Professional PDF Template for Proposals
 * Implements a comprehensive layout with header, client data, equipment table, and financial summary
 */
export class ProposalTemplate {
  private doc: any
  private pageWidth: number
  private pageHeight: number
  private margins = { top: 20, right: 20, bottom: 20, left: 20 }
  private colors = {
    primary: '#2563eb',    // Blue-600
    secondary: '#64748b',  // Slate-500
    accent: '#059669',     // Emerald-600
    text: '#1f2937',       // Gray-800
    lightGray: '#f8fafc'   // Slate-50
  }

  constructor(doc: any) {
    this.doc = doc
    this.pageWidth = doc.internal.pageSize.getWidth()
    this.pageHeight = doc.internal.pageSize.getHeight()
  }

  /**
   * Render complete professional template
   */
  render(proposalData: ProposalData, clientData: ClientData, companyInfo: CompanyInfo): void {
    this.renderHeader(companyInfo)
    this.renderClientSection(clientData)
    this.renderEquipmentsSection(proposalData.equipments)
    this.renderFinancialSummary(proposalData)
    this.renderFooter(proposalData.generatedAt, companyInfo)
  }

  /**
   * Render professional header with logo and company information
   */
  private renderHeader(companyInfo: CompanyInfo): void {
    // Background header bar
    this.doc.setFillColor(this.hexToRgb(this.colors.primary))
    this.doc.rect(0, 0, this.pageWidth, 50, 'F')

    // Company name (white text on blue background)
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(24)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(companyInfo.name, this.margins.left, 25)

    // Subtitle
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('PROPOSTA COMERCIAL - OUTSOURCING DE IMPRESSÃO', this.margins.left, 35)

    // Company contact info (right side, white text)
    this.doc.setFontSize(10)
    const contactInfo = [
      companyInfo.address,
      `Tel: ${companyInfo.phone}`,
      companyInfo.email,
      companyInfo.website
    ]
    
    contactInfo.forEach((info, index) => {
      this.doc.text(info, this.pageWidth - this.margins.right, 15 + (index * 4), { align: 'right' })
    })

    // Reset text color for body content
    this.doc.setTextColor(this.hexToRgb(this.colors.text))
  }

  /**
   * Render client information section with professional styling
   */
  private renderClientSection(clientData: ClientData): void {
    let yPosition = 70

    // Section header with background
    this.doc.setFillColor(this.hexToRgb(this.colors.lightGray))
    this.doc.rect(this.margins.left, yPosition - 5, this.pageWidth - (this.margins.left + this.margins.right), 15, 'F')
    
    this.doc.setTextColor(this.hexToRgb(this.colors.primary))
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('DADOS DO CLIENTE', this.margins.left + 5, yPosition + 5)
    
    yPosition += 20

    // Client details in two columns
    this.doc.setTextColor(this.hexToRgb(this.colors.text))
    this.doc.setFontSize(11)
    this.doc.setFont('helvetica', 'normal')
    
    const leftColumnData = [
      { label: 'Razão Social:', value: clientData.companyName },
      { label: 'Contato:', value: clientData.contactName },
      { label: 'Email:', value: clientData.email }
    ]

    const rightColumnData = [
      { label: 'Projeto:', value: clientData.projectName },
      { label: 'Gerente:', value: clientData.managerName },
      { label: 'Telefone:', value: clientData.phone }
    ]

    // Left column
    leftColumnData.forEach((item, index) => {
      const y = yPosition + (index * 8)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(item.label, this.margins.left + 5, y)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(item.value, this.margins.left + 35, y)
    })

    // Right column
    const midPoint = this.pageWidth / 2
    rightColumnData.forEach((item, index) => {
      const y = yPosition + (index * 8)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(item.label, midPoint, y)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(item.value, midPoint + 25, y)
    })
  }

  /**
   * Render equipments table with professional styling
   */
  private renderEquipmentsSection(equipments: EquipmentItem[]): void {
    let yPosition = 140
    const tableStartY = yPosition + 15

    // Section header
    this.doc.setFillColor(this.hexToRgb(this.colors.lightGray))
    this.doc.rect(this.margins.left, yPosition - 5, this.pageWidth - (this.margins.left + this.margins.right), 15, 'F')
    
    this.doc.setTextColor(this.hexToRgb(this.colors.primary))
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('EQUIPAMENTOS E ESPECIFICAÇÕES', this.margins.left + 5, yPosition + 5)
    
    yPosition = tableStartY

    // Table configuration
    const tableWidth = this.pageWidth - (this.margins.left + this.margins.right)
    const colWidths = [45, 25, 30, 35, 35] // Column widths in mm
    const headers = ['Modelo/Marca', 'Tipo', 'Vol. Mensal', 'Custo Mensal', 'Especificações']

    // Table header with background
    this.doc.setFillColor(this.hexToRgb(this.colors.primary))
    this.doc.rect(this.margins.left, yPosition, tableWidth, 10, 'F')
    
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'bold')
    
    let xPosition = this.margins.left + 2
    headers.forEach((header, index) => {
      this.doc.text(header, xPosition, yPosition + 7)
      xPosition += colWidths[index]
    })

    yPosition += 12

    // Table rows with alternating colors
    this.doc.setTextColor(this.hexToRgb(this.colors.text))
    this.doc.setFont('helvetica', 'normal')
    
    equipments.forEach((equipment, rowIndex) => {
      // Alternating row background
      if (rowIndex % 2 === 0) {
        this.doc.setFillColor(this.hexToRgb(this.colors.lightGray))
        this.doc.rect(this.margins.left, yPosition - 2, tableWidth, 10, 'F')
      }

      xPosition = this.margins.left + 2
      
      const rowData = [
        `${equipment.model}\n${equipment.brand}`,
        equipment.type,
        equipment.monthlyVolume?.toString() || 'N/A',
        `R$ ${equipment.monthlyCost?.toFixed(2).replace('.', ',') || '0,00'}`,
        this.formatSpecifications(equipment.specifications)
      ]

      rowData.forEach((data, colIndex) => {
        const maxWidth = colWidths[colIndex] - 4
        const splitText = this.doc.splitTextToSize(data, maxWidth)
        this.doc.text(splitText, xPosition, yPosition + 5)
        xPosition += colWidths[colIndex]
      })

      yPosition += 12

      // Add new page if needed
      if (yPosition > this.pageHeight - 100) {
        this.doc.addPage()
        yPosition = this.margins.top + 20
      }
    })
  }

  /**
   * Render financial summary with professional styling
   */
  private renderFinancialSummary(proposalData: ProposalData): void {
    let yPosition = this.pageHeight - 120

    // Section header
    this.doc.setFillColor(this.hexToRgb(this.colors.accent))
    this.doc.rect(this.margins.left, yPosition - 5, this.pageWidth - (this.margins.left + this.margins.right), 15, 'F')
    
    this.doc.setTextColor(255, 255, 255)
    this.doc.setFontSize(14)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('RESUMO FINANCEIRO', this.margins.left + 5, yPosition + 5)
    
    yPosition += 25

    // Financial summary box
    const boxHeight = 40
    this.doc.setDrawColor(this.hexToRgb(this.colors.accent))
    this.doc.setLineWidth(1)
    this.doc.rect(this.margins.left, yPosition, this.pageWidth - (this.margins.left + this.margins.right), boxHeight)

    // Financial details
    this.doc.setTextColor(this.hexToRgb(this.colors.text))
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'normal')
    
    const financialData = [
      { label: 'Valor Mensal:', value: `R$ ${proposalData.totalMonthly?.toFixed(2).replace('.', ',') || '0,00'}`, highlight: true },
      { label: 'Valor Anual:', value: `R$ ${proposalData.totalAnnual?.toFixed(2).replace('.', ',') || '0,00'}`, highlight: true },
      { label: 'Prazo do Contrato:', value: `${proposalData.contractPeriod || 12} meses`, highlight: false }
    ]

    financialData.forEach((item, index) => {
      const y = yPosition + 10 + (index * 10)
      
      // Label
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(item.label, this.margins.left + 10, y)
      
      // Value (highlighted if important)
      if (item.highlight) {
        this.doc.setTextColor(this.hexToRgb(this.colors.accent))
        this.doc.setFont('helvetica', 'bold')
      } else {
        this.doc.setTextColor(this.hexToRgb(this.colors.text))
        this.doc.setFont('helvetica', 'normal')
      }
      
      this.doc.text(item.value, this.margins.left + 60, y)
      this.doc.setTextColor(this.hexToRgb(this.colors.text))
    })
  }

  /**
   * Render professional footer
   */
  private renderFooter(generatedAt: Date, companyInfo: CompanyInfo): void {
    const yPosition = this.pageHeight - 30

    // Footer separator line
    this.doc.setDrawColor(this.hexToRgb(this.colors.secondary))
    this.doc.setLineWidth(0.5)
    this.doc.line(this.margins.left, yPosition - 10, this.pageWidth - this.margins.right, yPosition - 10)

    // Footer content
    this.doc.setTextColor(this.hexToRgb(this.colors.secondary))
    this.doc.setFontSize(9)
    this.doc.setFont('helvetica', 'normal')
    
    // Generation date (left)
    this.doc.text(
      `Proposta gerada em: ${generatedAt.toLocaleDateString('pt-BR')} às ${generatedAt.toLocaleTimeString('pt-BR')}`, 
      this.margins.left, 
      yPosition
    )

    // Contact info (right)
    this.doc.text(
      `${companyInfo.phone} | ${companyInfo.email}`, 
      this.pageWidth - this.margins.right, 
      yPosition, 
      { align: 'right' }
    )

    // Page number (center)
    this.doc.text(
      `Página ${this.doc.internal.getCurrentPageInfo().pageNumber}`, 
      this.pageWidth / 2, 
      yPosition, 
      { align: 'center' }
    )
  }

  /**
   * Format equipment specifications for display
   */
  private formatSpecifications(specs?: Record<string, any>): string {
    if (!specs || Object.keys(specs).length === 0) {
      return 'N/A'
    }

    const specEntries = Object.entries(specs).slice(0, 3) // Limit to 3 specs
    return specEntries.map(([key, value]) => `${key}: ${value}`).join('\n')
  }

  /**
   * Convert hex color to RGB values
   */
  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0]
  }
}

export default ProposalTemplate