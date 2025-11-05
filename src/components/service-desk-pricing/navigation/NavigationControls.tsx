'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  Clock, 
  CheckCircle2,
  SkipForward,
  RotateCcw,
  Target,
  Zap
} from 'lucide-react';
import { TabValidationStatus } from '@/lib/types/service-desk-pricing';

export interface NavigationControlsProps {
  currentTab: string;
  currentTabLabel: string;
  totalTabs: number;
  currentTabIndex: number;
  validationStatus: Record<string, TabValidationStatus>;
  canNavigateNext: boolean;
  canNavigatePrevious: boolean;
  onNavigateNext: () => void;
  onNavigatePrevious: () => void;
  onNavigateToFirstError?: () => void;
  onNavigateToFirstIncomplete?: () => void;
  onNavigateToTab?: (tabId: string) => void;
  navigationRecommendations?: Array<{
    tabId: string;
    tabName: string;
    priority: 'high' | 'medium' | 'low';
    reason: string;
    action: string;
  }>;
  className?: string;
}

export function NavigationControls({
  currentTab,
  currentTabLabel,
  totalTabs,
  currentTabIndex,
  validationStatus,
  canNavigateNext,
  canNavigatePrevious,
  onNavigateNext,
  onNavigatePrevious,
  onNavigateToFirstError,
  onNavigateToFirstIncomplete,
  onNavigateToTab,
  navigationRecommendations = [],
  className = ''
}: NavigationControlsProps) {
  
  // Calculate statistics
  const stats = React.useMemo(() => {
    const allTabs = Object.keys(validationStatus);
    const completedTabs = allTabs.filter(tabId => {
      const status = validationStatus[tabId];
      return status && status.isValid && status.completionPercentage >= 100;
    }).length;
    
    const tabsWithErrors = allTabs.filter(tabId => {
      const status = validationStatus[tabId];
      return status && status.errors.length > 0;
    }).length;
    
    const tabsWithWarnings = allTabs.filter(tabId => {
      const status = validationStatus[tabId];
      return status && status.warnings.length > 0 && status.errors.length === 0;
    }).length;
    
    return {
      completed: completedTabs,
      withErrors: tabsWithErrors,
      withWarnings: tabsWithWarnings,
      total: allTabs.length
    };
  }, [validationStatus]);

  // Get priority recommendations
  const priorityRecommendations = navigationRecommendations.slice(0, 3);

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">Controles de Navegação</span>
            <Badge variant="outline">
              {currentTabIndex + 1} de {totalTabs}
            </Badge>
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Aba atual: {currentTabLabel}</span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Primary Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigatePrevious}
            disabled={!canNavigatePrevious}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </Button>

          <div className="flex items-center space-x-4">
            {/* Quick Stats */}
            <div className="flex items-center space-x-3 text-sm">
              <div className="flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>{stats.completed}</span>
              </div>
              {stats.withErrors > 0 && (
                <div className="flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span>{stats.withErrors}</span>
                </div>
              )}
              {stats.withWarnings > 0 && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <span>{stats.withWarnings}</span>
                </div>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onNavigateNext}
            disabled={!canNavigateNext}
            className="flex items-center space-x-2"
          >
            <span>Próxima</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <Separator />

        {/* Quick Actions */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Ações Rápidas</h4>
          <div className="grid grid-cols-2 gap-2">
            {onNavigateToFirstError && stats.withErrors > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigateToFirstError}
                className="flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Corrigir Erros</span>
                <Badge variant="destructive" className="ml-auto">
                  {stats.withErrors}
                </Badge>
              </Button>
            )}

            {onNavigateToFirstIncomplete && stats.total - stats.completed > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigateToFirstIncomplete}
                className="flex items-center space-x-2 text-yellow-600 border-yellow-300 hover:bg-yellow-50"
              >
                <Clock className="w-4 h-4" />
                <span>Completar</span>
                <Badge variant="secondary" className="ml-auto">
                  {stats.total - stats.completed}
                </Badge>
              </Button>
            )}

            {onNavigateToTab && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigateToTab('data')}
                  className="flex items-center space-x-2 text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Início</span>
                </Button>

                {stats.completed === stats.total && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigateToTab('final-analysis')}
                    className="flex items-center space-x-2 text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <Target className="w-4 h-4" />
                    <span>Finalizar</span>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Recommendations */}
        {priorityRecommendations.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Recomendações</h4>
              <div className="space-y-2">
                {priorityRecommendations.map((rec, index) => (
                  <div
                    key={index}
                    className={`
                      flex items-center justify-between p-2 rounded-md border
                      ${rec.priority === 'high' ? 'border-red-200 bg-red-50' : ''}
                      ${rec.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' : ''}
                      ${rec.priority === 'low' ? 'border-blue-200 bg-blue-50' : ''}
                    `}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`
                        w-2 h-2 rounded-full
                        ${rec.priority === 'high' ? 'bg-red-500' : ''}
                        ${rec.priority === 'medium' ? 'bg-yellow-500' : ''}
                        ${rec.priority === 'low' ? 'bg-blue-500' : ''}
                      `} />
                      <div>
                        <p className="text-sm font-medium">{rec.tabName}</p>
                        <p className="text-xs text-muted-foreground">{rec.reason}</p>
                      </div>
                    </div>
                    {onNavigateToTab && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onNavigateToTab(rec.tabId)}
                        className="h-6 px-2 text-xs"
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        {rec.action}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Progress Summary */}
        <Separator />
        <div className="text-center">
          <div className="text-sm text-muted-foreground">
            Progresso geral: {Math.round((stats.completed / stats.total) * 100)}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {stats.completed} de {stats.total} abas concluídas
          </div>
        </div>
      </CardContent>
    </Card>
  );
}