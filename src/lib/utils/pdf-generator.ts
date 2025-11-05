import jsPDF from 'jspdf'
import type { ProposalData } from '@/lib/types/proposals'

// PDF-optimized color palette based on the new color system
const PDF_COLORS = {
  // Primary colors - darker for better print contrast
  primary: {
    900: [26, 35, 50],      // #1a2332 - Dark blue for headers
    800: [42, 52, 65],      // #2a3441 - Medium blue for sections
    700: [58, 69, 80],      // #3a4550 - Light blue for borders
    600: [74, 86, 96],      // #4a5660 - Text secondary
    500: [90, 103, 112],    // #5a6770 - Text muted
  },
  // Accent colors - optimized for PDF rendering
  accent: {
    orange: [255, 107, 53],   // #FF6B35 - Orange for highlights
    cyan: [0, 180, 216],      // #00B4D8 - Darker cyan for better print
    teal: [0, 180, 166],      // #00B4A6 - Teal for success elements
    yellow: [255, 184, 0],    // #FFB800 - Yellow for warnings
  },
  // Semantic colors
  semantic: {
    success: [0, 180, 166],   // Teal
    warning: [255, 107, 53],  // Orange
    error: [220, 38, 127],    // Pink/Red
    info: [0, 180, 216],      // Cyan
  },
  // Grayscale for text and borders
  grayscale: {
    black: [0, 0, 0],
    darkGray: [51, 51, 51],
    mediumGray: [102, 102, 102],
    lightGray: [204, 204, 204],
    white: [255, 255, 255],
  }
} as const

export class ProposalPDFGenerator {
  private doc: jsPDF
  private pageHeight: number
  private pageWidth: number
  private margin: number
  private currentY: number

  constructor() {
    this.doc = new jsPDF()
    this.pageHeight = this.doc.internal.pageSize.height
    this.pageWidth = this.doc.internal.pageSize.width
    this.margin = 20
    this.currentY = this.margin
  }

  private setTextColor(color: number[]) {
    this.doc.setTextColor(color[0], color[1], color[2])
  }

  private setDrawColor(color: number[]) {
    this.doc.setDrawColor(color[0], color[1], color[2])
  }

  private setFillColor(color: number[]) {
    this.doc.setFillColor(color[0], color[1], color[2])
  }

  private addText(text: string, x: number, y: number, options?: { 
    fontSize?: number, 
    fontStyle?: string,
    color?: number[],
    align?: 'left' | 'center' | 'right'
  }) {
    if (options?.fontSize) {
      this.doc.setFontSize(options.fontSize)
    }
    if (options?.fontStyle) {
      this.doc.setFont('helvetica', options.fontStyle as any)
    }
    if (options?.color) {
      this.setTextColor(options.color)
    }
    
    const align = options?.align || 'left'
    this.doc.text(text, x, y, { align })
  }

  private addLine(y: number, color?: number[], thickness?: number) {
    if (color) {
      this.setDrawColor(color)
    }
    if (thickness) {
      this.doc.setLineWidth(thickness)
    }
    this.doc.line(this.margin, y, this.pageWidth - this.margin, y)
    // Reset to default
    this.setDrawColor(PDF_COLORS.grayscale.black)
    this.doc.setLineWidth(0.2)
  }

  private addColoredSection(x: number, y: number, width: number, height: number, fillColor: number[], borderColor?: number[]) {
    this.setFillColor(fillColor)
    if (borderColor) {
      this.setDrawColor(borderColor)
    }
    this.doc.rect(x, y, width, height, borderColor ? 'FD' : 'F')
    // Reset colors
    this.setDrawColor(PDF_COLORS.grayscale.black)
  }

  private checkPageBreak(requiredSpace: number = 20) {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.doc.addPage()
      this.currentY = this.margin
    }
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  generateProposalPDF(proposal: ProposalData): void {
    // Header with brand colors
    this.addColoredSection(this.margin, this.currentY - 5, this.pageWidth - 2 * this.margin, 25, 
                          [PDF_COLORS.primary[900][0], PDF_COLORS.primary[900][1], PDF_COLORS.primary[900][2]])
    
    this.addText('PROPOSTA COMERCIAL', this.margin + 5, this.currentY + 10, {
      fontSize: 20,
      fontStyle: 'bold',
      color: PDF_COLORS.grayscale.white
    })
    this.currentY += 30

    // Proposal info with accent colors
    this.addText(`Proposta: ${proposal.id}`, this.margin, this.currentY, {
      fontSize: 12,
      color: PDF_COLORS.primary[800]
    })
    this.addText(`Data: ${this.formatDate(proposal.createdAt)}`, this.pageWidth - 80, this.currentY, {
      fontSize: 12,
      color: PDF_COLORS.primary[800]
    })
    this.currentY += 20

    // Linha separadora com cor
    this.addLine(this.currentY, PDF_COLORS.accent.cyan, 1)
    this.currentY += 15

    // Dados do Cliente
    this.addText('DADOS DO CLIENTE', this.margin, this.currentY, {
      fontSize: 14,
      fontStyle: 'bold',
      color: PDF_COLORS.primary[900]
    })
    this.currentY += 10

    // Background section for client data
    this.addColoredSection(this.margin - 2, this.currentY - 2, this.pageWidth - 2 * this.margin + 4, 35, 
                          [248, 249, 250]) // Light gray background

    this.addText(`Cliente: ${proposal.clientName}`, this.margin + 5, this.currentY + 5, {
      fontSize: 10,
      color: PDF_COLORS.grayscale.black
    })
    this.addText(`Empresa: ${proposal.clientCompany}`, this.margin + 5, this.currentY + 11, {
      fontSize: 10,
      color: PDF_COLORS.grayscale.darkGray
    })
    this.addText(`E-mail: ${proposal.clientEmail}`, this.margin + 5, this.currentY + 17, {
      fontSize: 10,
      color: PDF_COLORS.accent.cyan
    })
    this.addText(`Telefone: ${proposal.clientPhone}`, this.margin + 5, this.currentY + 23, {
      fontSize: 10,
      color: PDF_COLORS.grayscale.darkGray
    })
    
    if (proposal.clientCNPJ) {
      this.addText(`CNPJ: ${proposal.clientCNPJ}`, this.margin + 5, this.currentY + 29, {
        fontSize: 10,
        color: PDF_COLORS.grayscale.darkGray
      })
    }
    this.currentY += 45

    // Dados do Projeto
    this.addText('DADOS DO PROJETO', this.margin, this.currentY, {
      fontSize: 14,
      fontStyle: 'bold',
      color: PDF_COLORS.primary[900]
    })
    this.currentY += 10

    this.addText(`Projeto: ${proposal.projectName}`, this.margin, this.currentY, {
      fontSize: 10,
      fontStyle: 'bold',
      color: PDF_COLORS.accent.orange
    })
    this.currentY += 6
    this.addText(`Tipo: ${proposal.projectType}`, this.margin, this.currentY, {
      fontSize: 10,
      color: PDF_COLORS.grayscale.darkGray
    })
    this.currentY += 6
    
    // Descrição com quebra de linha
    this.addText('Descrição:', this.margin, this.currentY, {
      fontSize: 10,
      fontStyle: 'bold',
      color: PDF_COLORS.primary[700]
    })
    this.currentY += 6
    
    const description = this.doc.splitTextToSize(proposal.projectDescription, this.pageWidth - 2 * this.margin - 10)
    this.setTextColor(PDF_COLORS.grayscale.black)
    this.doc.text(description, this.margin + 5, this.currentY)
    this.currentY += description.length * 4 + 6

    if (proposal.deliveryDate) {
      this.addText(`Prazo de Entrega: ${this.formatDate(proposal.deliveryDate)}`, this.margin, this.currentY, {
        fontSize: 10,
        color: PDF_COLORS.semantic.warning
      })
      this.currentY += 6
    }
    this.currentY += 10

    // Gerente de Contas
    this.addText('GERENTE DE CONTAS', this.margin, this.currentY, {
      fontSize: 14,
      fontStyle: 'bold',
      color: PDF_COLORS.primary[900]
    })
    this.currentY += 10

    // Background section for manager data
    this.addColoredSection(this.margin - 2, this.currentY - 2, this.pageWidth - 2 * this.margin + 4, 26, 
                          [248, 249, 250]) // Light gray background

    this.addText(`Nome: ${proposal.managerName}`, this.margin + 5, this.currentY + 5, {
      fontSize: 10,
      color: PDF_COLORS.grayscale.black
    })
    this.addText(`E-mail: ${proposal.managerEmail}`, this.margin + 5, this.currentY + 11, {
      fontSize: 10,
      color: PDF_COLORS.accent.cyan
    })
    this.addText(`Telefone: ${proposal.managerPhone}`, this.margin + 5, this.currentY + 17, {
      fontSize: 10,
      color: PDF_COLORS.grayscale.darkGray
    })
    this.addText(`Departamento: ${proposal.managerDepartment}`, this.margin + 5, this.currentY + 23, {
      fontSize: 10,
      color: PDF_COLORS.grayscale.darkGray
    })
    this.currentY += 35

    // Orçamentos
    if (proposal.budgets.length > 0) {
      this.checkPageBreak(50)
      
      this.addText('ORÇAMENTOS DETALHADOS', this.margin, this.currentY, {
        fontSize: 14,
        fontStyle: 'bold',
        color: PDF_COLORS.primary[900]
      })
      this.currentY += 15

      let totalGeral = 0

      proposal.budgets.forEach((budget, index) => {
        this.checkPageBreak(40)
        
        // Título do módulo com background colorido
        const moduleTitle = budget.module === 'sales' ? 'VENDAS' : 
                           budget.module === 'rental' ? 'LOCAÇÃO' : 'SERVIÇOS'
        
        const moduleColor = budget.module === 'sales' ? PDF_COLORS.accent.orange :
                           budget.module === 'rental' ? PDF_COLORS.accent.teal : PDF_COLORS.accent.cyan
        
        this.addColoredSection(this.margin - 2, this.currentY - 2, this.pageWidth - 2 * this.margin + 4, 12, 
                              moduleColor, PDF_COLORS.primary[700])
        
        this.addText(`${index + 1}. ${moduleTitle}`, this.margin + 5, this.currentY + 5, {
          fontSize: 12,
          fontStyle: 'bold',
          color: PDF_COLORS.grayscale.white
        })
        this.currentY += 18

        // Cabeçalho da tabela com cores
        this.addColoredSection(this.margin, this.currentY - 2, this.pageWidth - 2 * this.margin, 10, 
                              PDF_COLORS.primary[800])
        
        this.addText('Descrição', this.margin + 2, this.currentY + 4, {
          fontSize: 9,
          fontStyle: 'bold',
          color: PDF_COLORS.grayscale.white
        })
        this.addText('Qtd', this.margin + 100, this.currentY + 4, {
          fontSize: 9,
          fontStyle: 'bold',
          color: PDF_COLORS.grayscale.white
        })
        this.addText('Valor Unit.', this.margin + 120, this.currentY + 4, {
          fontSize: 9,
          fontStyle: 'bold',
          color: PDF_COLORS.grayscale.white
        })
        this.addText('Total', this.margin + 160, this.currentY + 4, {
          fontSize: 9,
          fontStyle: 'bold',
          color: PDF_COLORS.grayscale.white
        })
        this.currentY += 15

        // Itens do orçamento com cores alternadas
        let itemIndex = 0
        budget.items.forEach((item) => {
          this.checkPageBreak(15)
          
          // Background alternado para linhas
          if (itemIndex % 2 === 0) {
            const itemHeight = Math.max(Math.ceil(item.description.length / 90) * 4, 8)
            this.addColoredSection(this.margin, this.currentY - 2, this.pageWidth - 2 * this.margin, itemHeight + 2, 
                                  [248, 249, 250])
          }
          
          const description = this.doc.splitTextToSize(item.description, 90)
          this.setTextColor(PDF_COLORS.grayscale.black)
          this.doc.text(description, this.margin + 2, this.currentY)
          
          this.addText(item.quantity.toString(), this.margin + 100, this.currentY, {
            fontSize: 9,
            color: PDF_COLORS.grayscale.darkGray
          })
          this.addText(this.formatCurrency(item.unitPrice), this.margin + 120, this.currentY, {
            fontSize: 9,
            color: PDF_COLORS.grayscale.darkGray
          })
          this.addText(this.formatCurrency(item.totalPrice), this.margin + 160, this.currentY, {
            fontSize: 9,
            fontStyle: 'bold',
            color: PDF_COLORS.accent.orange
          })
          
          this.currentY += Math.max(description.length * 4, 8)
          itemIndex++
        })

        // Subtotal do módulo
        this.currentY += 5
        this.addLine(this.currentY, PDF_COLORS.primary[700], 0.5)
        this.currentY += 8
        
        this.addText(`Subtotal ${moduleTitle}:`, this.margin + 120, this.currentY, {
          fontSize: 10,
          fontStyle: 'bold',
          color: PDF_COLORS.primary[800]
        })
        this.addText(this.formatCurrency(budget.totalValue), this.margin + 160, this.currentY, {
          fontSize: 10,
          fontStyle: 'bold',
          color: moduleColor
        })
        this.currentY += 15

        totalGeral += budget.totalValue
      })

      // Total Geral com destaque
      this.checkPageBreak(30)
      this.currentY += 10
      
      this.addColoredSection(this.margin + 70, this.currentY - 2, this.pageWidth - 2 * this.margin - 70, 15, 
                            PDF_COLORS.primary[900])
      
      this.addLine(this.currentY, PDF_COLORS.accent.cyan, 2)
      this.currentY += 10
      
      this.addText('TOTAL GERAL DA PROPOSTA:', this.margin + 75, this.currentY, {
        fontSize: 12,
        fontStyle: 'bold',
        color: PDF_COLORS.grayscale.white
      })
      this.addText(this.formatCurrency(totalGeral), this.margin + 160, this.currentY, {
        fontSize: 12,
        fontStyle: 'bold',
        color: PDF_COLORS.accent.orange
      })
    }

    // Rodapé com cores
    this.checkPageBreak(40)
    this.currentY = this.pageHeight - 40
    
    this.addLine(this.currentY, PDF_COLORS.accent.cyan, 1)
    this.currentY += 10
    
    // Background do rodapé
    this.addColoredSection(this.margin, this.currentY - 2, this.pageWidth - 2 * this.margin, 15, 
                          [248, 249, 250])
    
    this.addText('Esta proposta é válida por 30 dias a partir da data de emissão.', this.margin + 5, this.currentY + 5, {
      fontSize: 8,
      color: PDF_COLORS.grayscale.darkGray
    })
    this.addText('Valores sujeitos a alteração sem aviso prévio.', this.margin + 5, this.currentY + 10, {
      fontSize: 8,
      color: PDF_COLORS.grayscale.darkGray
    })
  }

  save(filename: string): void {
    this.doc.save(filename)
  }

  getBlob(): Blob {
    return this.doc.output('blob')
  }

  getDataURL(): string {
    return this.doc.output('dataurlstring')
  }

  // Utility method to test color fidelity across different PDF viewers
  generateColorTestPage(): void {
    this.doc.addPage()
    this.currentY = this.margin

    this.addText('TESTE DE FIDELIDADE DE CORES - PDF', this.margin, this.currentY, {
      fontSize: 16,
      fontStyle: 'bold',
      color: PDF_COLORS.primary[900]
    })
    this.currentY += 20

    // Test primary colors
    this.addText('Cores Primárias:', this.margin, this.currentY, {
      fontSize: 12,
      fontStyle: 'bold',
      color: PDF_COLORS.grayscale.black
    })
    this.currentY += 10

    Object.entries(PDF_COLORS.primary).forEach(([shade, color], index) => {
      this.addColoredSection(this.margin + index * 30, this.currentY, 25, 15, color)
      this.addText(shade, this.margin + index * 30, this.currentY + 20, {
        fontSize: 8,
        color: PDF_COLORS.grayscale.black
      })
    })
    this.currentY += 35

    // Test accent colors
    this.addText('Cores de Destaque:', this.margin, this.currentY, {
      fontSize: 12,
      fontStyle: 'bold',
      color: PDF_COLORS.grayscale.black
    })
    this.currentY += 10

    Object.entries(PDF_COLORS.accent).forEach(([name, color], index) => {
      this.addColoredSection(this.margin + index * 40, this.currentY, 35, 15, color)
      this.addText(name, this.margin + index * 40, this.currentY + 20, {
        fontSize: 8,
        color: PDF_COLORS.grayscale.black
      })
    })
    this.currentY += 35

    // Test text contrast
    this.addText('Teste de Contraste de Texto:', this.margin, this.currentY, {
      fontSize: 12,
      fontStyle: 'bold',
      color: PDF_COLORS.grayscale.black
    })
    this.currentY += 15

    // Dark background with light text
    this.addColoredSection(this.margin, this.currentY, 150, 20, PDF_COLORS.primary[900])
    this.addText('Texto claro em fundo escuro', this.margin + 5, this.currentY + 12, {
      fontSize: 10,
      color: PDF_COLORS.grayscale.white
    })

    // Light background with dark text
    this.addColoredSection(this.margin + 160, this.currentY, 150, 20, [248, 249, 250])
    this.addText('Texto escuro em fundo claro', this.margin + 165, this.currentY + 12, {
      fontSize: 10,
      color: PDF_COLORS.grayscale.black
    })
  }
}

export function generateProposalPDF(proposal: ProposalData, action: 'save' | 'print' = 'save'): void {
  const generator = new ProposalPDFGenerator()
  generator.generateProposalPDF(proposal)
  
  if (action === 'save') {
    const filename = `proposta-${proposal.id}-${proposal.projectName.replace(/\s+/g, '-').toLowerCase()}.pdf`
    generator.save(filename)
  } else if (action === 'print') {
    const blob = generator.getBlob()
    const url = URL.createObjectURL(blob)
    const printWindow = window.open(url)
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print()
        URL.revokeObjectURL(url)
      }
    }
  }
}

// Utility function to test PDF color fidelity
export function generateColorTestPDF(): void {
  const generator = new ProposalPDFGenerator()
  generator.generateColorTestPage()
  generator.save('color-test.pdf')
}

// Export color constants for use in other components
export { PDF_COLORS }