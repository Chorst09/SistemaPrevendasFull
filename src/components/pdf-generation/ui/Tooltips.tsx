/**
 * Tooltip Components for PDF Generation
 * Provides contextual help and guidance for users
 */

import React, { useState, useRef, useEffect } from 'react'

interface TooltipProps {
  content: string | React.ReactNode
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  disabled?: boolean
  className?: string
}

/**
 * Basic Tooltip Component
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 500,
  disabled = false,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [actualPosition, setActualPosition] = useState(position)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const tooltipRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  const showTooltip = () => {
    if (disabled) return
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
      adjustPosition()
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  const adjustPosition = () => {
    if (!tooltipRef.current || !triggerRef.current) return

    const tooltip = tooltipRef.current
    const trigger = triggerRef.current
    const rect = trigger.getBoundingClientRect()
    const tooltipRect = tooltip.getBoundingClientRect()
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }

    let newPosition = position

    // Check if tooltip would go outside viewport and adjust
    switch (position) {
      case 'top':
        if (rect.top - tooltipRect.height < 0) {
          newPosition = 'bottom'
        }
        break
      case 'bottom':
        if (rect.bottom + tooltipRect.height > viewport.height) {
          newPosition = 'top'
        }
        break
      case 'left':
        if (rect.left - tooltipRect.width < 0) {
          newPosition = 'right'
        }
        break
      case 'right':
        if (rect.right + tooltipRect.width > viewport.width) {
          newPosition = 'left'
        }
        break
    }

    setActualPosition(newPosition)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const getTooltipClasses = () => {
    const baseClasses = `
      absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg
      transition-opacity duration-200 pointer-events-none max-w-xs
      ${isVisible ? 'opacity-100' : 'opacity-0'}
    `

    const positionClasses = {
      top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
      bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
      left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
      right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
    }

    return `${baseClasses} ${positionClasses[actualPosition]} ${className}`
  }

  const getArrowClasses = () => {
    const arrowClasses = {
      top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900',
      bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900',
      left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900',
      right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900'
    }

    return `absolute w-0 h-0 border-4 ${arrowClasses[actualPosition]}`
  }

  return (
    <div 
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div ref={tooltipRef} className={getTooltipClasses()}>
          {content}
          <div className={getArrowClasses()}></div>
        </div>
      )}
    </div>
  )
}

/**
 * Help Icon with Tooltip
 */
export const HelpTooltip: React.FC<{
  content: string | React.ReactNode
  position?: TooltipProps['position']
}> = ({ content, position = 'top' }) => {
  return (
    <Tooltip content={content} position={position}>
      <button
        type="button"
        className="inline-flex items-center justify-center w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Ajuda"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </button>
    </Tooltip>
  )
}

/**
 * Pre-configured tooltips for PDF operations
 */
export const PDFTooltips = {
  generatePDF: (
    <div className="space-y-2">
      <p className="font-medium">Gerar PDF da Proposta</p>
      <p className="text-xs">Cria um documento PDF profissional com todos os dados da proposta.</p>
    </div>
  ),

  editProposal: (
    <div className="space-y-2">
      <p className="font-medium">Editar Proposta</p>
      <p className="text-xs">Permite modificar os dados da proposta e regenerar o PDF automaticamente.</p>
    </div>
  ),

  viewPDF: (
    <div className="space-y-2">
      <p className="font-medium">Visualizar PDF</p>
      <p className="text-xs">Abre o PDF em uma nova aba para visualização completa.</p>
    </div>
  ),

  downloadPDF: (
    <div className="space-y-2">
      <p className="font-medium">Baixar PDF</p>
      <p className="text-xs">Faz o download do arquivo PDF para seu computador.</p>
    </div>
  ),

  deleteProposal: (
    <div className="space-y-2">
      <p className="font-medium">Excluir Proposta</p>
      <p className="text-xs text-red-300">Remove permanentemente a proposta do sistema.</p>
    </div>
  ),

  clientData: (
    <div className="space-y-2">
      <p className="font-medium">Dados do Cliente</p>
      <p className="text-xs">Informações que aparecerão no cabeçalho do PDF da proposta.</p>
    </div>
  ),

  equipmentSpecs: (
    <div className="space-y-2">
      <p className="font-medium">Especificações dos Equipamentos</p>
      <p className="text-xs">Detalhes técnicos que serão incluídos na tabela do PDF.</p>
    </div>
  ),

  financialSummary: (
    <div className="space-y-2">
      <p className="font-medium">Resumo Financeiro</p>
      <p className="text-xs">Valores mensais e anuais calculados automaticamente.</p>
    </div>
  ),

  searchProposals: (
    <div className="space-y-2">
      <p className="font-medium">Buscar Propostas</p>
      <p className="text-xs">Digite o nome do cliente ou projeto para filtrar as propostas.</p>
    </div>
  ),

  proposalStatus: (
    <div className="space-y-2">
      <p className="font-medium">Status da Proposta</p>
      <ul className="text-xs space-y-1">
        <li>• <span className="text-green-300">Finalizada</span>: PDF gerado com sucesso</li>
        <li>• <span className="text-yellow-300">Rascunho</span>: Em processo de criação</li>
        <li>• <span className="text-red-300">Erro</span>: Falha na geração</li>
      </ul>
    </div>
  )
}

/**
 * Tooltip wrapper for form fields
 */
export const FieldTooltip: React.FC<{
  label: string
  tooltip: string | React.ReactNode
  children: React.ReactNode
  required?: boolean
}> = ({ label, tooltip, children, required = false }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <HelpTooltip content={tooltip} />
      </div>
      {children}
    </div>
  )
}

export default Tooltip