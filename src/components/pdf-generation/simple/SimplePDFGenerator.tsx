/**
 * Simplified PDF Generator for testing
 * This is a minimal implementation to test PDF generation
 */

import React from 'react'

interface SimpleProposalData {
  clientName: string
  projectName: string
  totalMonthly: number
  totalAnnual: number
  equipments: Array<{
    model: string
    brand: string
    type: string
    monthlyVolume: number
    monthlyCost: number
  }>
}

export class SimplePDFGenerator {
  async generateSimplePDF(data: SimpleProposalData): Promise<{ blob: Blob; url: string }> {
    try {
      console.log('Iniciando geração de PDF simples')
      
      // Import jsPDF dynamically
      const jsPDFModule = await import('jspdf')
      const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF
      
      console.log('jsPDF importado:', jsPDF)
      
      // Create PDF document
      const doc = new jsPDF()
      
      // Add title
      doc.setFontSize(20)
      doc.text('PROPOSTA COMERCIAL', 20, 30)
      
      // Add client info
      doc.setFontSize(14)
      doc.text('DADOS DO CLIENTE', 20, 50)
      
      doc.setFontSize(12)
      doc.text(`Cliente: ${data.clientName}`, 20, 65)
      doc.text(`Projeto: ${data.projectName}`, 20, 75)
      
      // Add equipment info
      doc.setFontSize(14)
      doc.text('EQUIPAMENTOS', 20, 95)
      
      let yPos = 110
      data.equipments.forEach((equipment, index) => {
        doc.setFontSize(10)
        doc.text(`${index + 1}. ${equipment.brand} ${equipment.model}`, 20, yPos)
        doc.text(`Tipo: ${equipment.type}`, 30, yPos + 8)
        doc.text(`Volume: ${equipment.monthlyVolume.toLocaleString()} páginas/mês`, 30, yPos + 16)
        doc.text(`Custo: R$ ${equipment.monthlyCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 30, yPos + 24)
        yPos += 35
      })
      
      // Add totals
      doc.setFontSize(14)
      doc.text('RESUMO FINANCEIRO', 20, yPos + 10)
      
      doc.setFontSize(12)
      doc.text(`Total Mensal: R$ ${data.totalMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, yPos + 25)
      doc.text(`Total Anual: R$ ${data.totalAnnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, yPos + 35)
      
      // Generate blob
      const blob = doc.output('blob')
      const url = URL.createObjectURL(blob)
      
      console.log('PDF simples gerado com sucesso:', { blobSize: blob.size })
      
      return { blob, url }
    } catch (error) {
      console.error('Erro na geração do PDF simples:', error)
      throw error
    }
  }
}

export default SimplePDFGenerator