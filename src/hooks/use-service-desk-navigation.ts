'use client';

import { useState, useCallback, useMemo } from 'react';
import { TabValidationStatus, ValidationError, ValidationWarning, ServiceDeskData } from '@/lib/types/service-desk-pricing';
import { EnhancedValidationEngine, TransitionValidationResult, ValidationContext } from '@/lib/services/enhanced-validation-engine';

export interface TabConfig {
  id: string;
  label: string;
  shortLabel?: string;
  description: string;
  dependencies?: string[];
  isOptional?: boolean;
  weight?: number;
}

export interface NavigationState {
  activeTab: string;
  previousTab?: string;
  navigationHistory: string[];
  isTransitioning: boolean;
  pendingNavigation?: {
    fromTab: string;
    toTab: string;
    timestamp: number;
  };
}

export interface UseServiceDeskNavigationProps {
  tabs: TabConfig[];
  initialTab?: string;
  validationStatus: Record<string, TabValidationStatus>;
  data: ServiceDeskData;
  onTabChange?: (tabId: string) => void;
  onValidationRequired?: (fromTab: string, toTab: string) => Promise<boolean>;
  autoSaveOnNavigation?: boolean;
  userPreferences?: {
    allowNavigationWithWarnings: boolean;
    autoSaveOnNavigation: boolean;
    strictValidation: boolean;
  };
}

export interface NavigationValidation {
  canNavigate: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  requiresConfirmation: boolean;
  blockingIssues: string[];
  suggestions: string[];
}

export function useServiceDeskNavigation({
  tabs,
  initialTab = tabs[0]?.id || '',
  validationStatus,
  data,
  onTabChange,
  onValidationRequired,
  autoSaveOnNavigation = true,
  userPreferences = {
    allowNavigationWithWarnings: false,
    autoSaveOnNavigation: true,
    strictValidation: false
  }
}: UseServiceDeskNavigationProps) {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    activeTab: initialTab,
    navigationHistory: [initialTab],
    isTransitioning: false
  });

  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validationData, setValidationData] = useState<{
    fromTab: string;
    toTab: string;
    validation: NavigationValidation;
  } | null>(null);

  // Enhanced validation engine
  const validationEngine = useMemo(() => new EnhancedValidationEngine(), []);

  // Get current tab configuration
  const currentTab = useMemo(() => 
    tabs.find(tab => tab.id === navigationState.activeTab),
    [tabs, navigationState.activeTab]
  );

  // Get tab index
  const getTabIndex = useCallback((tabId: string) => 
    tabs.findIndex(tab => tab.id === tabId),
    [tabs]
  );

  // Check if tab can be accessed based on dependencies
  const canAccessTab = useCallback((tabId: string): boolean => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab || !tab.dependencies) return true;
    
    return tab.dependencies.every(depId => {
      const depStatus = validationStatus[depId];
      return depStatus && depStatus.isValid;
    });
  }, [tabs, validationStatus]);

  // Enhanced navigation validation
  const validateNavigation = useCallback((fromTab: string, toTab: string): NavigationValidation => {
    const context: ValidationContext = {
      fromTab,
      toTab,
      data,
      userPreferences
    };

    const result = validationEngine.validateTransitionEnhanced(context);
    
    return {
      canNavigate: result.canNavigate,
      errors: result.errors,
      warnings: result.warnings,
      requiresConfirmation: result.requiresConfirmation,
      blockingIssues: result.blockingIssues,
      suggestions: result.suggestions
    };
  }, [data, userPreferences, validationEngine]);

  // Navigate to tab with validation
  const navigateToTab = useCallback(async (toTab: string, force = false) => {
    if (navigationState.isTransitioning) return false;
    
    const fromTab = navigationState.activeTab;
    if (fromTab === toTab) return true;

    setNavigationState(prev => ({ ...prev, isTransitioning: true }));

    try {
      // Validate navigation
      const validation = validateNavigation(fromTab, toTab);
      
      // If validation fails and not forced, show validation dialog
      if (!validation.canNavigate && !force) {
        setValidationData({ fromTab, toTab, validation });
        setShowValidationDialog(true);
        return false;
      }

      // If requires confirmation and not forced, show validation dialog
      if (validation.requiresConfirmation && !force) {
        setValidationData({ fromTab, toTab, validation });
        setShowValidationDialog(true);
        return false;
      }

      // Call external validation if provided
      if (onValidationRequired && !force) {
        const externalValidation = await onValidationRequired(fromTab, toTab);
        if (!externalValidation) {
          return false;
        }
      }

      // Perform navigation
      setNavigationState(prev => ({
        ...prev,
        activeTab: toTab,
        previousTab: fromTab,
        navigationHistory: [...prev.navigationHistory, toTab],
        pendingNavigation: undefined
      }));

      // Notify parent component
      onTabChange?.(toTab);
      
      return true;
    } finally {
      setNavigationState(prev => ({ ...prev, isTransitioning: false }));
    }
  }, [navigationState, validateNavigation, onValidationRequired, onTabChange]);

  // Navigate to next tab
  const navigateNext = useCallback(() => {
    const currentIndex = getTabIndex(navigationState.activeTab);
    if (currentIndex < tabs.length - 1) {
      const nextTab = tabs[currentIndex + 1];
      return navigateToTab(nextTab.id);
    }
    return Promise.resolve(false);
  }, [navigationState.activeTab, tabs, getTabIndex, navigateToTab]);

  // Navigate to previous tab
  const navigatePrevious = useCallback(() => {
    const currentIndex = getTabIndex(navigationState.activeTab);
    if (currentIndex > 0) {
      const previousTab = tabs[currentIndex - 1];
      return navigateToTab(previousTab.id);
    }
    return Promise.resolve(false);
  }, [navigationState.activeTab, tabs, getTabIndex, navigateToTab]);

  // Navigate to first tab with errors
  const navigateToFirstError = useCallback(() => {
    const tabWithError = tabs.find(tab => {
      const status = validationStatus[tab.id];
      return status && status.errors.length > 0;
    });
    
    if (tabWithError) {
      return navigateToTab(tabWithError.id);
    }
    return Promise.resolve(false);
  }, [tabs, validationStatus, navigateToTab]);

  // Navigate to first incomplete tab
  const navigateToFirstIncomplete = useCallback(() => {
    const incompleteTab = tabs.find(tab => {
      const status = validationStatus[tab.id];
      return !status || status.completionPercentage < 100;
    });
    
    if (incompleteTab) {
      return navigateToTab(incompleteTab.id);
    }
    return Promise.resolve(false);
  }, [tabs, validationStatus, navigateToTab]);

  // Confirm navigation (for validation dialog)
  const confirmNavigation = useCallback(() => {
    if (validationData) {
      setShowValidationDialog(false);
      navigateToTab(validationData.toTab, true); // Force navigation
      setValidationData(null);
    }
  }, [validationData, navigateToTab]);

  // Cancel navigation (for validation dialog)
  const cancelNavigation = useCallback(() => {
    setShowValidationDialog(false);
    setValidationData(null);
  }, []);

  // Get navigation recommendations
  const navigationRecommendations = useMemo(() => {
    return validationEngine.generateNavigationRecommendations(navigationState.activeTab, data);
  }, [navigationState.activeTab, data, validationEngine]);

  // Check if current navigation path is optimal
  const navigationPathAnalysis = useCallback((toTab: string) => {
    return validationEngine.isOptimalNavigationPath(navigationState.activeTab, toTab);
  }, [navigationState.activeTab, validationEngine]);

  // Get navigation capabilities
  const navigationCapabilities = useMemo(() => {
    const currentIndex = getTabIndex(navigationState.activeTab);
    
    return {
      canGoNext: currentIndex < tabs.length - 1,
      canGoPrevious: currentIndex > 0,
      canGoToTab: (tabId: string) => canAccessTab(tabId),
      hasErrors: Object.values(validationStatus).some(status => status.errors.length > 0),
      hasWarnings: Object.values(validationStatus).some(status => status.warnings.length > 0),
      isComplete: tabs.every(tab => {
        const status = validationStatus[tab.id];
        return status && status.isValid && status.completionPercentage >= 100;
      }),
      recommendations: navigationRecommendations
    };
  }, [navigationState.activeTab, tabs, getTabIndex, canAccessTab, validationStatus, navigationRecommendations]);

  return {
    // State
    navigationState,
    currentTab,
    showValidationDialog,
    validationData,
    navigationCapabilities,
    
    // Actions
    navigateToTab,
    navigateNext,
    navigatePrevious,
    navigateToFirstError,
    navigateToFirstIncomplete,
    confirmNavigation,
    cancelNavigation,
    
    // Utilities
    getTabIndex,
    canAccessTab,
    validateNavigation,
    navigationPathAnalysis,
    
    // Enhanced features
    validationEngine
  };
}