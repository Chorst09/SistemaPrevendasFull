import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog'
import { Button } from '../../ui/button'
import { Alert, AlertDescription } from '../../ui/alert'
import { 
  Download, 
  ExternalLink, 
  AlertCircle, 
  Loader2,
  FileText,
  X
} from 'lucide-react'

interface PDFViewerProps {
  isOpen: boolean
  onClose: () => void
  pdfUrl: string
  fileName?: string
  onDownload?: () => void
}

export function PDFViewer({
  isOpen,
  onClose,
  pdfUrl,
  fileName = 'proposta.pdf',
  onDownload
}: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Reset states when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      setHasError(false)
      setErrorMessage('')
    }
  }, [isOpen])

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setHasError(true)
    setErrorMessage('Não foi possível carregar o PDF. Tente fazer o download.')
  }

  const handleOpenInNewTab = () => {
    try {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      setHasError(true)
      setErrorMessage('Não foi possível abrir o PDF em nova aba.')
    }
  }

  const handleDownload = () => {
    if (onDownload) {
      onDownload()
    } else {
      // Fallback download method
      try {
        const link = document.createElement('a')
        link.href = pdfUrl
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error) {
        setHasError(true)
        setErrorMessage('Não foi possível fazer o download do PDF.')
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <span>Visualizar PDF - {fileName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleDownload}
                size="sm"
                variant="outline"
                className="flex items-center space-x-1"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </Button>
              <Button
                onClick={handleOpenInNewTab}
                size="sm"
                variant="outline"
                className="flex items-center space-x-1"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Nova Aba</span>
              </Button>
              <Button
                onClick={onClose}
                size="sm"
                variant="ghost"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 px-6 pb-6">
          {hasError ? (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {errorMessage}
                <div className="mt-2 space-x-2">
                  <Button
                    onClick={handleDownload}
                    size="sm"
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Fazer Download
                  </Button>
                  <Button
                    onClick={handleOpenInNewTab}
                    size="sm"
                    variant="outline"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Abrir em Nova Aba
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="relative w-full h-[70vh] bg-muted rounded-lg overflow-hidden">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Carregando PDF...</span>
                  </div>
                </div>
              )}
              
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title="PDF Viewer"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                style={{ display: hasError ? 'none' : 'block' }}
              />
            </div>
          )}

          {/* Browser compatibility notice */}
          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              💡 <strong>Dica:</strong> Se o PDF não carregar corretamente, 
              use os botões "Download" ou "Nova Aba" acima.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PDFViewer