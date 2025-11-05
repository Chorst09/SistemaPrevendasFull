/**
 * Lazy Loading Components for PDF Generation
 * Implements code splitting and lazy loading for better performance
 */

import React, { Suspense, lazy } from 'react'
import { PDFGeneratorProps } from '../../../lib/pdf/types'

// Lazy load PDF components
const LazyPDFGenerator = lazy(() => import('../generators/PDFGenerator').then(module => ({
  default: module.PDFGeneratorComponent
})))

const LazyProposalTemplate = lazy(() => import('../templates/ProposalTemplate'))

const LazyPDFViewer = lazy(() => import('../viewers/PDFViewer'))

const LazyProposalConfirmation = lazy(() => import('../viewers/ProposalConfirmation'))

const LazyProposalListManager = lazy(() => import('../managers/ProposalListManager'))

/**
 * Loading fallback component
 */
const PDFLoadingFallback: React.FC<{ message?: string }> = ({ message = 'Carregando...' }) => (
  <div className="flex items-center justify-center p-8">
    <div className="flex flex-col items-center gap-3">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  </div>
)

/**
 * Lazy PDF Generator with loading state
 */
export const LazyPDFGeneratorComponent: React.FC<PDFGeneratorProps> = (props) => (
  <Suspense fallback={<PDFLoadingFallback message="Carregando gerador de PDF..." />}>
    <LazyPDFGenerator {...props} />
  </Suspense>
)

/**
 * Lazy PDF Viewer with loading state
 */
export const LazyPDFViewerComponent: React.FC<any> = (props) => (
  <Suspense fallback={<PDFLoadingFallback message="Carregando visualizador..." />}>
    <LazyPDFViewer {...props} />
  </Suspense>
)

/**
 * Lazy Proposal Confirmation with loading state
 */
export const LazyProposalConfirmationComponent: React.FC<any> = (props) => (
  <Suspense fallback={<PDFLoadingFallback message="Carregando confirmação..." />}>
    <LazyProposalConfirmation {...props} />
  </Suspense>
)

/**
 * Lazy Proposal List Manager with loading state
 */
export const LazyProposalListManagerComponent: React.FC<any> = (props) => (
  <Suspense fallback={<PDFLoadingFallback message="Carregando lista de propostas..." />}>
    <LazyProposalListManager {...props} />
  </Suspense>
)

/**
 * HOC for lazy loading PDF components with error boundary
 */
export function withLazyPDFLoading<T extends object>(
  Component: React.ComponentType<T>,
  loadingMessage?: string
) {
  return React.forwardRef<any, T>((props, ref) => (
    <Suspense fallback={<PDFLoadingFallback message={loadingMessage} />}>
      <Component {...props} ref={ref} />
    </Suspense>
  ))
}

/**
 * Preload PDF components for better UX
 */
export const preloadPDFComponents = () => {
  // Preload critical components
  const preloadPromises = [
    import('../generators/PDFGenerator'),
    import('../templates/ProposalTemplate'),
    import('../viewers/PDFViewer')
  ]

  return Promise.all(preloadPromises).catch(error => {
    console.warn('Failed to preload PDF components:', error)
  })
}

/**
 * Hook to preload components on user interaction
 */
export const usePDFPreloader = () => {
  const [isPreloaded, setIsPreloaded] = React.useState(false)

  const preload = React.useCallback(async () => {
    if (isPreloaded) return

    try {
      await preloadPDFComponents()
      setIsPreloaded(true)
    } catch (error) {
      console.warn('Preload failed:', error)
    }
  }, [isPreloaded])

  return { preload, isPreloaded }
}

export default {
  LazyPDFGeneratorComponent,
  LazyPDFViewerComponent,
  LazyProposalConfirmationComponent,
  LazyProposalListManagerComponent,
  withLazyPDFLoading,
  preloadPDFComponents,
  usePDFPreloader
}