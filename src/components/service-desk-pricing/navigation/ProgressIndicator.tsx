'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Clock,
  TrendingUp,
  Target,
  Award
} from 'lucide-react';
import { TabValidationStatus } from '@/lib/types/service-desk-pricing';

export interface TabConfig {
  id: string;
  label: string;
  weight?: number; // Weight for progress calculation (default: 1)
  isOptional?: boolean;
}

export interface ProgressIndicatorProps {
  tabs: TabConfig[];
  validationStatus: Record<string, TabValidationStatus>;
  activeTab: string;
  showDetails?: boolean;
  showMilestones?: boolean;
  showNavigationShortcuts?: boolean;
  onNavigateToTab?: (tabId: string) => void;
  onNavigateToFirstError?: () => void;
  onNavigateToFirstIncomplete?: () => void;
  className?: string;
}

export function ProgressIndicator({
  tabs,
  validationStatus,
  activeTab,
  showDetails = true,
  showMilestones = true,
  showNavigationShortcuts = true,
  onNavigateToTab,
  onNavigateToFirstError,
  onNavigateToFirstIncomplete,
  className = ''
}: ProgressIndicatorProps) {
  // Calculate weighted progress
  const calculateProgress = () => {
    const totalWeight = tabs.reduce((sum, tab) => sum + (tab.weight || 1), 0);
    let completedWeight = 0;
    let validTabsCount = 0;
    let tabsWithWarnings = 0;
    let tabsWithErrors = 0;

    tabs.forEach(tab => {
      const status = validationStatus[tab.id];
      const weight = tab.weight || 1;
      
      if (status) {
        if (status.isValid && status.completionPercentage >= 100) {
          completedWeight += weight;
          validTabsCount++;
        } else if (status.errors.length > 0) {
          tabsWithErrors++;
        } else if (status.warnings.length > 0) {
          tabsWithWarnings++;
        }
        
        // Add partial progress for incomplete tabs
        if (status.completionPercentage > 0 && status.completionPercentage < 100) {
          completedWeight += (weight * status.completionPercentage / 100);
        }
      }
    });

    const overallProgress = (completedWeight / totalWeight) * 100;
    
    return {
      overallProgress: Math.round(overallProgress),
      completedTabs: validTabsCount,
      totalTabs: tabs.length,
      tabsWithWarnings,
      tabsWithErrors,
      pendingTabs: tabs.length - validTabsCount - tabsWithErrors
    };
  };

  const progress = calculateProgress();

  // Get progress status
  const getProgressStatus = () => {
    if (progress.overallProgress >= 100) return 'completed';
    if (progress.overallProgress >= 75) return 'near-completion';
    if (progress.overallProgress >= 50) return 'good-progress';
    if (progress.overallProgress >= 25) return 'started';
    return 'beginning';
  };

  const progressStatus = getProgressStatus();

  // Get status color and icon
  const getStatusDisplay = () => {
    switch (progressStatus) {
      case 'completed':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200',
          icon: <Award className="w-5 h-5 text-green-600" />,
          message: 'Projeto concluído!'
        };
      case 'near-completion':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 border-blue-200',
          icon: <Target className="w-5 h-5 text-blue-600" />,
          message: 'Quase finalizado'
        };
      case 'good-progress':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200',
          icon: <TrendingUp className="w-5 h-5 text-green-600" />,
          message: 'Bom progresso'
        };
      case 'started':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 border-yellow-200',
          icon: <Clock className="w-5 h-5 text-yellow-600" />,
          message: 'Em andamento'
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50 border-gray-200',
          icon: <Clock className="w-5 h-5 text-gray-600" />,
          message: 'Iniciando'
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  // Get milestones
  const getMilestones = () => [
    { threshold: 25, label: 'Dados Básicos', reached: progress.overallProgress >= 25 },
    { threshold: 50, label: 'Configuração', reached: progress.overallProgress >= 50 },
    { threshold: 75, label: 'Análise', reached: progress.overallProgress >= 75 },
    { threshold: 100, label: 'Finalização', reached: progress.overallProgress >= 100 }
  ];

  const milestones = getMilestones();

  return (
    <Card className={`${statusDisplay.bgColor} ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {statusDisplay.icon}
            <span className={`text-lg ${statusDisplay.color}`}>
              Progresso do Projeto
            </span>
          </div>
          <Badge variant="outline" className={statusDisplay.color}>
            {progress.overallProgress}%
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{statusDisplay.message}</span>
            <span className="text-sm text-muted-foreground">
              {progress.completedTabs} de {progress.totalTabs} abas
            </span>
          </div>
          <Progress 
            value={progress.overallProgress} 
            className="w-full h-3"
          />
        </div>

        {/* Milestones */}
        {showMilestones && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Marcos do Projeto</h4>
            <div className="grid grid-cols-2 gap-2">
              {milestones.map((milestone, index) => (
                <div 
                  key={index}
                  className={`flex items-center space-x-2 p-2 rounded-md ${
                    milestone.reached 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {milestone.reached ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                  <span className="text-xs font-medium">{milestone.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Status */}
        {showDetails && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Status Detalhado</h4>
            
            <div className="grid grid-cols-3 gap-3">
              {/* Completed */}
              <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-md">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <div>
                  <div className="text-sm font-medium text-green-700">
                    {progress.completedTabs}
                  </div>
                  <div className="text-xs text-green-600">Concluídas</div>
                </div>
              </div>

              {/* With Warnings */}
              {progress.tabsWithWarnings > 0 && (
                <div className="flex items-center space-x-2 p-2 bg-yellow-50 rounded-md">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <div>
                    <div className="text-sm font-medium text-yellow-700">
                      {progress.tabsWithWarnings}
                    </div>
                    <div className="text-xs text-yellow-600">Com Avisos</div>
                  </div>
                </div>
              )}

              {/* With Errors */}
              {progress.tabsWithErrors > 0 && (
                <div className="flex items-center space-x-2 p-2 bg-red-50 rounded-md">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <div>
                    <div className="text-sm font-medium text-red-700">
                      {progress.tabsWithErrors}
                    </div>
                    <div className="text-xs text-red-600">Com Erros</div>
                  </div>
                </div>
              )}

              {/* Pending */}
              {progress.pendingTabs > 0 && (
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">
                      {progress.pendingTabs}
                    </div>
                    <div className="text-xs text-gray-600">Pendentes</div>
                  </div>
                </div>
              )}
            </div>

            {/* Current Tab Indicator */}
            <div className="p-2 bg-blue-50 rounded-md border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-blue-700">
                    Trabalhando em: {tabs.find(t => t.id === activeTab)?.label || 'Desconhecido'}
                  </span>
                </div>
                {onNavigateToTab && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigateToTab(activeTab)}
                    className="h-6 px-2 text-xs text-blue-600 hover:bg-blue-100"
                  >
                    Focar
                  </Button>
                )}
              </div>
              {validationStatus[activeTab] && (
                <div className="mt-1 ml-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-600">
                      Progresso da aba atual
                    </span>
                    <span className="text-xs text-blue-600">
                      {Math.round(validationStatus[activeTab].completionPercentage)}%
                    </span>
                  </div>
                  <Progress 
                    value={validationStatus[activeTab].completionPercentage} 
                    className="w-full h-1 mt-1"
                  />
                </div>
              )}
            </div>

            {/* Navigation Shortcuts */}
            {showNavigationShortcuts && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Ações Rápidas</h4>
                <div className="flex flex-wrap gap-2">
                  {onNavigateToFirstError && progress.tabsWithErrors > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onNavigateToFirstError}
                      className="flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <AlertCircle className="w-3 h-3" />
                      <span className="text-xs">Corrigir Erros ({progress.tabsWithErrors})</span>
                    </Button>
                  )}

                  {onNavigateToFirstIncomplete && progress.pendingTabs > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onNavigateToFirstIncomplete}
                      className="flex items-center space-x-2 text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                    >
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">Completar ({progress.pendingTabs})</span>
                    </Button>
                  )}

                  {progress.overallProgress >= 100 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onNavigateToTab?.('final-analysis')}
                      className="flex items-center space-x-2 text-green-600 border-green-300 hover:bg-green-50"
                    >
                      <Award className="w-3 h-3" />
                      <span className="text-xs">Ver Análise Final</span>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}