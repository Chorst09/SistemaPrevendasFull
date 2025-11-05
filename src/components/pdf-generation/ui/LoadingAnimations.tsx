/**
 * Enhanced Loading Animations for PDF Generation
 * Provides various loading states and animations for better UX
 */

import React from 'react'

interface LoadingAnimationProps {
  message?: string
  progress?: number
  variant?: 'spinner' | 'progress' | 'pulse' | 'dots'
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Animated spinner component
 */
export const LoadingSpinner: React.FC<LoadingAnimationProps> = ({ 
  message = 'Carregando...', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
      <p className="text-sm text-gray-600 animate-pulse">{message}</p>
    </div>
  )
}

/**
 * Progress bar with animation
 */
export const LoadingProgress: React.FC<LoadingAnimationProps> = ({ 
  message = 'Processando...', 
  progress = 0 
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6 max-w-md mx-auto">
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        ></div>
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-600">{message}</p>
        <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}% concluído</p>
      </div>
    </div>
  )
}

/**
 * Pulsing animation for loading states
 */
export const LoadingPulse: React.FC<LoadingAnimationProps> = ({ 
  message = 'Preparando...' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6">
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  )
}

/**
 * Animated dots loading
 */
export const LoadingDots: React.FC<LoadingAnimationProps> = ({ 
  message = 'Gerando PDF' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6">
      <div className="flex items-center space-x-1">
        <span className="text-lg text-gray-600">{message}</span>
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-gray-600 rounded-full animate-bounce"></div>
          <div className="w-1 h-1 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-1 h-1 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}

/**
 * PDF Generation specific loading with steps
 */
export const PDFGenerationLoading: React.FC<{ 
  currentStep: string
  steps: string[]
  progress: number 
}> = ({ currentStep, steps, progress }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-8 max-w-lg mx-auto">
      {/* Progress circle */}
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-200"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
            className="text-blue-600 transition-all duration-300 ease-out"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-gray-700">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Current step */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Gerando PDF</h3>
        <p className="text-sm text-blue-600 font-medium">{currentStep}</p>
      </div>

      {/* Steps list */}
      <div className="w-full max-w-sm">
        <div className="space-y-2">
          {steps.map((step, index) => {
            const isCompleted = steps.indexOf(currentStep) > index
            const isCurrent = step === currentStep
            
            return (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  isCompleted 
                    ? 'bg-green-500' 
                    : isCurrent 
                      ? 'bg-blue-500 animate-pulse' 
                      : 'bg-gray-200'
                }`}>
                  {isCompleted && (
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm ${
                  isCompleted 
                    ? 'text-green-600 line-through' 
                    : isCurrent 
                      ? 'text-blue-600 font-medium' 
                      : 'text-gray-500'
                }`}>
                  {step}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/**
 * Main loading component that switches between variants
 */
export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ 
  variant = 'spinner', 
  ...props 
}) => {
  switch (variant) {
    case 'progress':
      return <LoadingProgress {...props} />
    case 'pulse':
      return <LoadingPulse {...props} />
    case 'dots':
      return <LoadingDots {...props} />
    default:
      return <LoadingSpinner {...props} />
  }
}

export default LoadingAnimation