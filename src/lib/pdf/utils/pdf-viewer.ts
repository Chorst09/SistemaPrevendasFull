/**
 * Utility functions for PDF viewing and downloading
 */

export interface PDFViewerOptions {
  fileName?: string
  openInNewTab?: boolean
  autoDownload?: boolean
}

/**
 * Open PDF in a new tab/window
 */
export function openPDFInNewTab(pdfUrl: string, fileName?: string): void {
  try {
    const newWindow = window.open(pdfUrl, '_blank', 'noopener,noreferrer')
    
    if (!newWindow) {
      throw new Error('Popup blocked or failed to open new window')
    }
    
    // Set title if fileName is provided
    if (fileName) {
      newWindow.document.title = fileName
    }
  } catch (error) {
    console.error('Failed to open PDF in new tab:', error)
    throw new Error('Não foi possível abrir o PDF em nova aba. Verifique se popups estão habilitados.')
  }
}

/**
 * Download PDF file
 */
export function downloadPDF(pdfUrl: string, fileName: string = 'proposta.pdf'): void {
  try {
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = fileName
    link.style.display = 'none'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('Failed to download PDF:', error)
    throw new Error('Não foi possível fazer o download do PDF.')
  }
}

/**
 * Check if browser supports PDF viewing
 */
export function isBrowserPDFSupported(): boolean {
  try {
    // Check if browser has PDF plugin
    const hasPDFPlugin = navigator.plugins && 
      Array.from(navigator.plugins).some(plugin => 
        plugin.name.toLowerCase().includes('pdf')
      )
    
    // Check if browser supports PDF MIME type
    const supportsPDFMime = navigator.mimeTypes && 
      !!navigator.mimeTypes.namedItem('application/pdf')
    
    return hasPDFPlugin || supportsPDFMime || true // Most modern browsers support PDF
  } catch (error) {
    console.warn('Could not detect PDF support:', error)
    return true // Assume support by default
  }
}

/**
 * Generate a filename for PDF based on client and date
 */
export function generatePDFFileName(clientName: string, projectName?: string): string {
  const date = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
  const sanitizedClientName = clientName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')
  
  let fileName = `Proposta_${sanitizedClientName}_${date}`
  
  if (projectName) {
    const sanitizedProjectName = projectName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')
    fileName = `Proposta_${sanitizedClientName}_${sanitizedProjectName}_${date}`
  }
  
  return `${fileName}.pdf`
}

/**
 * Create a blob URL from PDF blob
 */
export function createPDFBlobUrl(pdfBlob: Blob): string {
  try {
    return URL.createObjectURL(pdfBlob)
  } catch (error) {
    console.error('Failed to create blob URL:', error)
    throw new Error('Não foi possível criar URL para o PDF.')
  }
}

/**
 * Revoke a blob URL to free memory
 */
export function revokePDFBlobUrl(url: string): void {
  try {
    URL.revokeObjectURL(url)
  } catch (error) {
    console.warn('Failed to revoke blob URL:', error)
  }
}

/**
 * Handle PDF viewing with fallback options
 */
export function handlePDFViewing(
  pdfBlob: Blob, 
  options: PDFViewerOptions = {}
): { url: string; fileName: string } {
  const { fileName, openInNewTab = false, autoDownload = false } = options
  
  // Generate filename if not provided
  const finalFileName = fileName || `proposta_${Date.now()}.pdf`
  
  // Create blob URL
  const pdfUrl = createPDFBlobUrl(pdfBlob)
  
  // Handle auto actions
  if (autoDownload) {
    downloadPDF(pdfUrl, finalFileName)
  }
  
  if (openInNewTab) {
    openPDFInNewTab(pdfUrl, finalFileName)
  }
  
  return { url: pdfUrl, fileName: finalFileName }
}

/**
 * Validate PDF blob
 */
export function validatePDFBlob(blob: Blob): boolean {
  return blob instanceof Blob && 
         blob.type === 'application/pdf' && 
         blob.size > 0
}