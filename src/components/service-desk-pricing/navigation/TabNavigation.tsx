'use client';

import React, { useMemo, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SimpleTabButton } from './SimpleTabButton';
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Home
} from 'lucide-react';
import { TabValidationStatus } from '@/lib/types/service-desk-pricing';

export interface TabConfig {
  id: string;
  label: string;
  shortLabel?: string;
  description: string;
  dependencies?: string[];
  isOptional?: boolean;
}

export interface TabNavigationProps {
  tabs: TabConfig[];
  activeTab: string;
  validationStatus: Record<string, TabValidationStatus>;
  onTabChange: (tabId: string) => void;
  onNavigateNext?: () => void;
  onNavigatePrevious?: () => void;
  onNavigateToFirstError?: () => void;
  onNavigateToFirstIncomplete?: () => void;
  showProgress?: boolean;
  showBreadcrumbs?: boolean;
  showQuickActions?: boolean;
  showTabPreview?: boolean;
  className?: string;
}

export function TabNavigation({
  tabs,
  activeTab,
  validationStatus,
  onTabChange,
  onNavigateNext,
  onNavigatePrevious,
  onNavigateToFirstError,
  onNavigateToFirstIncomplete,
  showProgress = true,
  showBreadcrumbs = true,
  showQuickActions = true,
  showTabPreview = true,
  className = ''
}: TabNavigationProps) {
  const activeTabIndex = useMemo(() => tabs.findIndex(tab => tab.id === activeTab), [tabs, activeTab]);
  const canNavigateNext = activeTabIndex < tabs.length - 1;
  const canNavigatePrevious = activeTabIndex > 0;

  // Calculate overall progress - memoized to prevent recalculation
  const { completedTabs, overallProgress } = useMemo(() => {
    const completed = tabs.filter(tab => {
      const status = validationStatus[tab.id];
      return status && status.isValid && status.completionPercentage >= 100;
    }).length;
    return {
      completedTabs: completed,
      overallProgress: (completed / tabs.length) * 100
    };
  }, [tabs, validationStatus]);

  // Get validation status for a tab - memoized
  const getTabValidationStatus = useCallback((tabId: string): 'valid' | 'invalid' | 'warning' | 'pending' => {
    const status = validationStatus[tabId];
    if (!status) return 'pending';
    
    if (status.errors.length > 0) return 'invalid';
    if (status.warnings.length > 0) return 'warning';
    if (status.completionPercentage >= 100) return 'valid';
    return 'pending';
  }, [validationStatus]);

  // Get status icon - memoized
  const getStatusIcon = useCallback((tabId: string) => {
    const status = getTabValidationStatus(tabId);
    
    switch (status) {
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'invalid':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  }, [getTabValidationStatus]);

  // Get status badge - memoized
  const getStatusBadge = useCallback((tabId: string) => {
    const status = getTabValidationStatus(tabId);
    const validationData = validationStatus[tabId];
    
    switch (status) {
      case 'valid':
        return <Badge variant="default" className="ml-2 bg-green-500 text-white">✓</Badge>;
      case 'invalid':
        return (
          <Badge variant="destructive" className="ml-2">
            {validationData?.errors.length || '!'}
          </Badge>
        );
      case 'warning':
        return (
          <Badge variant="secondary" className="ml-2 bg-yellow-500 text-white">
            {validationData?.warnings.length || '⚠'}
          </Badge>
        );
      default:
        return validationData?.completionPercentage ? (
          <Badge variant="outline" className="ml-2">
            {Math.round(validationData.completionPercentage)}%
          </Badge>
        ) : null;
    }
  }, [getTabValidationStatus, validationStatus]);

  // Check if tab can be accessed - memoized
  const canAccessTab = useCallback((tabId: string): boolean => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab || !tab.dependencies) return true;
    
    // Check if all dependencies are satisfied
    return tab.dependencies.every(depId => {
      const depStatus = validationStatus[depId];
      return depStatus && depStatus.isValid;
    });
  }, [tabs, validationStatus]);

  // Get tooltip content for tab - memoized
  const getTooltipContent = useCallback((tab: TabConfig) => {
    const status = validationStatus[tab.id];
    const canAccess = canAccessTab(tab.id);
    
    let content = tab.description;
    
    if (!canAccess) {
      const missingDeps = tab.dependencies?.filter(depId => {
        const depStatus = validationStatus[depId];
        return !depStatus || !depStatus.isValid;
      }) || [];
      
      content += `\n\nDependências não atendidas: ${missingDeps.map(id => 
        tabs.find(t => t.id === id)?.label || id
      ).join(', ')}`;
    }
    
    if (status) {
      if (status.errors.length > 0) {
        content += `\n\nErros: ${status.errors.map(e => e.message).join(', ')}`;
      }
      if (status.warnings.length > 0) {
        content += `\n\nAvisos: ${status.warnings.map(w => w.message).join(', ')}`;
      }
      if (status.completionPercentage < 100) {
        content += `\n\nProgresso: ${Math.round(status.completionPercentage)}%`;
      }
    }
    
    return content;
  }, [tabs, validationStatus, canAccessTab]);

  return (
    <div className={`space-y-4 ${className}`}>
        {/* Progress Bar */}
        {showProgress && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progresso Geral</span>
              <span className="text-sm text-muted-foreground">
                {completedTabs} de {tabs.length} abas concluídas
              </span>
            </div>
            <Progress value={overallProgress} className="w-full" />
          </div>
        )}

        {/* Breadcrumbs */}
        {showBreadcrumbs && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Home className="w-4 h-4" />
            <span>/</span>
            <span>Service Desk Pricing</span>
            <span>/</span>
            <span className="font-medium text-foreground">
              {tabs.find(t => t.id === activeTab)?.label || 'Desconhecido'}
            </span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab, index) => {
            const isActive = tab.id === activeTab;
            const canAccess = canAccessTab(tab.id);
            const status = getTabValidationStatus(tab.id);
            const validationData = validationStatus[tab.id];
            
            return (
              <SimpleTabButton
                key={tab.id}
                id={tab.id}
                label={tab.label}
                shortLabel={tab.shortLabel}
                index={index}
                isActive={isActive}
                canAccess={canAccess}
                status={status}
                validationData={validationData}
                onClick={() => canAccess && onTabChange(tab.id)}
                tooltip={getTooltipContent(tab)}
              />
            );
          })}
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
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

            {/* Quick Actions */}
            {showQuickActions && (
              <>
                {onNavigateToFirstError && Object.values(validationStatus).some(s => s.errors.length > 0) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onNavigateToFirstError}
                    className="flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Primeiro Erro</span>
                  </Button>
                )}

                {onNavigateToFirstIncomplete && tabs.some(tab => {
                  const status = validationStatus[tab.id];
                  return !status || status.completionPercentage < 100;
                }) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onNavigateToFirstIncomplete}
                    className="flex items-center space-x-2 text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Incompleto</span>
                  </Button>
                )}
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Tab Preview */}
            {showTabPreview && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>
                  Aba {activeTabIndex + 1} de {tabs.length}
                </span>
                {canNavigateNext && (
                  <span className="text-xs">
                    Próxima: {tabs[activeTabIndex + 1]?.shortLabel || tabs[activeTabIndex + 1]?.label}
                  </span>
                )}
              </div>
            )}
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
      </div>
  );
}