'use client';

import React, { useState, useCallback, useMemo, useEffect, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, BarChart3, Download, X, Users } from 'lucide-react';
import { ServiceDeskData, TabValidationStatus } from '@/lib/types/service-desk-pricing';
import { ServiceDeskDataManager } from '@/lib/services/service-desk-data-manager';
import { ServiceDeskValidationEngine } from '@/lib/services/service-desk-validation-engine';
import { ServiceDeskTemplateService } from '@/lib/services/service-desk-template-service';

// Navigation Components
import { TabNavigation } from './navigation/TabNavigation';
import { ValidationTransition } from './navigation/ValidationTransition';
import { ProgressIndicator } from './navigation/ProgressIndicator';
import { NavigationControls } from './navigation/NavigationControls';
import { Breadcrumbs, createServiceDeskBreadcrumbs } from './navigation/Breadcrumbs';
import { useServiceDeskNavigation } from '@/hooks/use-service-desk-navigation';

// Performance optimizations
import { LazyTabModules, preloadNextTab, preloadCriticalTabs } from '@/lib/utils/lazy-loading';
import { ServiceDeskCalculationCache } from '@/lib/utils/calculation-cache';
import { useDebouncedCalculations, batchCalculationManager } from '@/lib/utils/debounce';

// Template Components
import { TemplateManager } from './templates/TemplateManager';
import { TemplateApplicationDialog } from './templates/TemplateApplicationDialog';
import { 
  ServiceDeskTemplate, 
  TemplateApplication, 
  ConflictResolution 
} from '@/lib/types/service-desk-templates';

// Analytics Components
import { AnalyticsDashboard } from './analytics/AnalyticsDashboard';
import { ServiceDeskAnalyticsService } from '@/lib/services/service-desk-analytics-service';

// Export Components
import { UnifiedExportInterface } from './export/UnifiedExportInterface';

// UX Enhancement Components
import { TabTransition, FormFieldAnimation, AnimatedCard, NotificationAnimation } from './ui/AnimationsAndTransitions';
import { Tooltip, HelpIcon, ContextualHelp, QuickHelpCard } from './ui/TooltipsAndHelp';
import { GuidedTour, TourConfig } from './ui/GuidedTour';
import { basicServiceDeskTour, advancedFeaturesTour, quickTipsTour, TourLauncher } from './ui/ServiceDeskTours';

// Documentation and Help Components
import { DocumentationSystem } from './documentation/DocumentationSystem';
import { IntegratedHelpSystem, QuickHelpButton } from './help/IntegratedHelpSystem';
import { EmployeeRegistryManager } from './employees/EmployeeRegistryManager';

export interface ServiceDeskPricingSystemProps {
  initialData?: ServiceDeskData;
  onDataChange?: (data: ServiceDeskData) => void;
  integrationMode?: 'standalone' | 'integrated';
}

const TAB_CONFIG = [
  { 
    id: 'data', 
    label: 'Dados', 
    shortLabel: 'Dados',
    description: 'Configuração dos dados básicos do projeto, cliente e período de contrato',
    component: LazyTabModules.DataTab,
    weight: 1
  },
  { 
    id: 'team', 
    label: 'Equipe', 
    shortLabel: 'Equipe',
    description: 'Definição da equipe, cargos, salários e benefícios',
    component: LazyTabModules.TeamTab,
    dependencies: ['data'],
    weight: 2
  },
  { 
    id: 'scale', 
    label: 'Escala', 
    shortLabel: 'Escala',
    description: 'Configuração de horários de atendimento e escalas de trabalho',
    component: LazyTabModules.ScaleTab,
    dependencies: ['team'],
    weight: 2
  },
  { 
    id: 'taxes', 
    label: 'Impostos', 
    shortLabel: 'Impostos',
    description: 'Configuração de impostos e tributação aplicável',
    component: LazyTabModules.TaxesTab,
    dependencies: ['data'],
    weight: 1
  },
  { 
    id: 'variables', 
    label: 'Variáveis', 
    shortLabel: 'Variáveis',
    description: 'Definição de variáveis de mercado e cenários econômicos',
    component: LazyTabModules.VariablesTab,
    dependencies: ['data'],
    weight: 1
  },
  { 
    id: 'other-costs', 
    label: 'Outros Custos', 
    shortLabel: 'Custos',
    description: 'Configuração de custos adicionais e despesas diversas',
    component: LazyTabModules.OtherCostsTab,
    dependencies: ['data'],
    weight: 1
  },
  { 
    id: 'budget', 
    label: 'Orçamento', 
    shortLabel: 'Orçamento',
    description: 'Consolidação de custos e definição de margens',
    component: LazyTabModules.BudgetTab,
    dependencies: ['team', 'taxes', 'other-costs'],
    weight: 2
  },
  { 
    id: 'forecast', 
    label: 'Forecast', 
    shortLabel: 'Forecast',
    description: 'Projeções financeiras e análise de cenários futuros',
    component: LazyTabModules.ForecastTab,
    dependencies: ['budget'],
    weight: 2
  },
  { 
    id: 'result', 
    label: 'Resultado', 
    shortLabel: 'Resultado',
    description: 'Análise de rentabilidade, ROI e indicadores financeiros',
    component: LazyTabModules.ResultTab,
    dependencies: ['forecast'],
    weight: 2
  },
  { 
    id: 'negotiation', 
    label: 'Negociação', 
    shortLabel: 'Negociação',
    description: 'Simulação de cenários de negociação e ajustes comerciais',
    component: LazyTabModules.NegotiationTab,
    dependencies: ['result'],
    weight: 1,
    isOptional: true
  },
  { 
    id: 'final-analysis', 
    label: 'Análise Final', 
    shortLabel: 'Análise',
    description: 'Dashboard executivo e análise final do projeto',
    component: LazyTabModules.FinalAnalysisTab,
    dependencies: ['result'],
    weight: 2
  },
  { 
    id: 'reports', 
    label: 'Relatórios', 
    shortLabel: 'Relatórios',
    description: 'Geração de relatórios personalizados e profissionais',
    component: LazyTabModules.ReportsTab,
    dependencies: ['data'],
    weight: 1,
    isOptional: true
  },
];

export function ServiceDeskPricingSystem({
  initialData,
  onDataChange,
  integrationMode = 'integrated'
}: ServiceDeskPricingSystemProps) {
  // Early return for SSR - prevent localStorage access on server
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [data, setData] = useState<ServiceDeskData>(
    initialData || ServiceDeskDataManager.createEmptyData()
  );
  const [validationStatus, setValidationStatus] = useState<Record<string, TabValidationStatus>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Template management state
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [showTemplateApplication, setShowTemplateApplication] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ServiceDeskTemplate | null>(null);
  const [templateApplication, setTemplateApplication] = useState<TemplateApplication | null>(null);

  // Analytics state
  const [showAnalyticsDashboard, setShowAnalyticsDashboard] = useState(false);

  // Export state
  const [showExportInterface, setShowExportInterface] = useState(false);

  // UX Enhancement state
  const [showContextualHelp, setShowContextualHelp] = useState(false);
  const [activeTour, setActiveTour] = useState<string | null>(null);
  const [showTourLauncher, setShowTourLauncher] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    isVisible: boolean;
  }>>([]);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

  // Documentation and Help state
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [showIntegratedHelp, setShowIntegratedHelp] = useState(false);
  const [documentationCategory, setDocumentationCategory] = useState('getting-started');
  const [documentationSearchTerm, setDocumentationSearchTerm] = useState('');
  const [showEmployeeRegistry, setShowEmployeeRegistry] = useState(false);

  const dataManager = useMemo(() => new ServiceDeskDataManager(), []);
  const validationEngine = useMemo(() => new ServiceDeskValidationEngine(), []);
  const calculationCache = useMemo(() => ServiceDeskCalculationCache.getInstance(), []);
  const debouncedCalculations = useDebouncedCalculations();
  const templateService = useMemo(() => new ServiceDeskTemplateService(), []);
  const analyticsService = useMemo(() => new ServiceDeskAnalyticsService(), []);

  // Enhanced navigation with validation
  const navigation = useServiceDeskNavigation({
    tabs: TAB_CONFIG,
    initialTab: 'data',
    validationStatus,
    data,
    onTabChange: (tabId) => {
      // Additional logic when tab changes
      console.log('Navigated to tab:', tabId);
    },
    onValidationRequired: async (fromTab, toTab) => {
      // Custom validation logic if needed
      return true;
    },
    autoSaveOnNavigation: true,
    userPreferences: {
      allowNavigationWithWarnings: false,
      autoSaveOnNavigation: true,
      strictValidation: integrationMode === 'integrated' // Stricter validation in integrated mode
    }
  });

  // Initialize data manager and load data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        
        // Preload critical tabs for better performance
        await preloadCriticalTabs();
        
        // Initialize sync between tabs
        dataManager.initializeSync();
        
        // Check if user is first time user (only on client side)
        if (typeof window !== 'undefined') {
          const hasSeenTour = localStorage.getItem('service-desk-tour-completed');
          if (!hasSeenTour) {
            setIsFirstTimeUser(true);
            // Show tour launcher after a brief delay
            setTimeout(() => setShowTourLauncher(true), 2000);
          }
        }
        
        // Load existing data if no initial data provided
        if (!initialData) {
          const loadedData = await dataManager.loadData();
          setData(loadedData);
          
          // Validate all tabs
          const validations: Record<string, TabValidationStatus> = {};
          TAB_CONFIG.forEach(tab => {
            const tabData = dataManager.getTabData(loadedData, tab.id);
            validations[tab.id] = validationEngine.validateTabData(tab.id, tabData);
          });
          setValidationStatus(validations);
        }
        
        // Show welcome notification for new users
        if (isFirstTimeUser) {
          showNotification('info', 'Bem-vindo ao Sistema de Precificação Service Desk! Clique no botão "?" para fazer um tour guiado.');
        }
        
      } catch (error) {
        console.error('Error initializing data:', error);
        showNotification('error', 'Erro ao inicializar o sistema. Tente recarregar a página.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();

    // Cleanup on unmount
    return () => {
      dataManager.cleanup();
      batchCalculationManager.clearBatch();
    };
  }, [initialData, dataManager, validationEngine]);

  // Create backup when data changes significantly
  useEffect(() => {
    const createBackup = async () => {
      try {
        await dataManager.createBackup(data);
      } catch (error) {
        console.error('Error creating backup:', error);
      }
    };

    // Create backup every 10 minutes or when significant changes occur
    const backupInterval = setInterval(createBackup, 10 * 60 * 1000);
    
    return () => clearInterval(backupInterval);
  }, [data, dataManager]);

  // Handle data updates from tabs with performance optimizations
  const handleDataUpdate = useCallback(async (tabId: string, tabData: any) => {
    const startTime = Date.now();
    
    try {
      setIsLoading(true);
      
      // Track data operation start
      analyticsService.trackEvent({
        type: 'SYSTEM_EVENT' as any,
        category: 'DATA_OPERATION' as any,
        action: 'data_update_start',
        label: tabId,
        properties: { tabId }
      });
      
      // Update data
      const updatedData = dataManager.updateTabData(data, tabId, tabData);
      setData(updatedData);
      
      // Invalidate related caches when data changes
      calculationCache.invalidateRelatedCaches(tabId);
      
      // Validate updated data
      const validationStartTime = Date.now();
      const validation = validationEngine.validateTabData(tabId, tabData);
      const validationDuration = Date.now() - validationStartTime;
      
      // Track validation
      analyticsService.trackValidation(
        tabId, 
        validation.isValid, 
        validation.errors.length, 
        validation.warnings.length
      );
      
      setValidationStatus(prev => ({
        ...prev,
        [tabId]: validation
      }));
      
      // Persist data
      await dataManager.persistData(updatedData);
      
      // Notify parent component
      onDataChange?.(updatedData);
      
      // Track successful data operation
      const totalDuration = Date.now() - startTime;
      analyticsService.trackEvent({
        type: 'SYSTEM_EVENT' as any,
        category: 'DATA_OPERATION' as any,
        action: 'data_update_success',
        label: tabId,
        value: totalDuration,
        properties: { 
          tabId, 
          duration: totalDuration,
          validationDuration,
          hasErrors: validation.errors.length > 0,
          hasWarnings: validation.warnings.length > 0
        }
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Track error
      analyticsService.trackError(error as Error, `data_update_${tabId}`);
      analyticsService.trackEvent({
        type: 'ERROR_EVENT' as any,
        category: 'DATA_OPERATION' as any,
        action: 'data_update_error',
        label: tabId,
        value: duration,
        properties: { 
          tabId, 
          duration,
          errorMessage: (error as Error).message
        }
      });
      
      console.error('Error updating data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [data, dataManager, validationEngine, onDataChange, calculationCache, analyticsService]);

  // Handle auto-save from tabs with enhanced debouncing
  const handleAutoSave = useCallback(async (tabId: string, tabData: any) => {
    try {
      // Update data without loading state for auto-save
      const updatedData = dataManager.updateTabData(data, tabId, tabData);
      setData(updatedData);
      
      // Use batch calculation manager for performance
      batchCalculationManager.addToBatch(tabId, () => {
        // Invalidate related caches
        calculationCache.invalidateRelatedCaches(tabId);
        
        // Validate updated data
        const validation = validationEngine.validateTabData(tabId, tabData);
        setValidationStatus(prev => ({
          ...prev,
          [tabId]: validation
        }));
      });
      
      // Schedule auto-save with debouncing
      dataManager.scheduleAutoSave(updatedData);
      
      // Notify parent component
      onDataChange?.(updatedData);
      
    } catch (error) {
      console.error('Error during auto-save:', error);
    }
  }, [data, dataManager, validationEngine, onDataChange, calculationCache]);

  // Handle tab navigation with enhanced validation and preloading
  const handleTabChange = useCallback(async (newTab: string) => {
    const startTime = Date.now();
    const currentTab = navigation.navigationState.activeTab;
    
    // Track navigation
    analyticsService.trackNavigation(currentTab, newTab);
    
    // Preload next tab for better performance
    await preloadNextTab(newTab);
    navigation.navigateToTab(newTab);
    
    // Track navigation performance
    const duration = Date.now() - startTime;
    analyticsService.trackPerformance('tab_navigation', duration, true);
  }, [navigation, analyticsService]);

  // Template management handlers
  const handleOpenTemplateManager = useCallback(() => {
    setShowTemplateManager(true);
  }, []);

  const handleCloseTemplateManager = useCallback(() => {
    setShowTemplateManager(false);
    setSelectedTemplate(null);
    setTemplateApplication(null);
  }, []);

  const handleApplyTemplate = useCallback((application: TemplateApplication) => {
    setTemplateApplication(application);
    setShowTemplateApplication(true);
    setShowTemplateManager(false);
  }, []);

  const handleConfirmTemplateApplication = useCallback(async (
    application: TemplateApplication, 
    resolutions: Record<string, ConflictResolution>
  ) => {
    try {
      setIsLoading(true);
      
      // Apply conflict resolutions
      let updatedData = { ...application.targetData };
      
      application.conflicts.forEach(conflict => {
        const resolution = resolutions[conflict.field];
        if (resolution === ConflictResolution.USE_TEMPLATE) {
          // Apply template value
          const fieldPath = conflict.field.split('.');
          let current: any = updatedData;
          for (let i = 0; i < fieldPath.length - 1; i++) {
            current = current[fieldPath[i]];
          }
          current[fieldPath[fieldPath.length - 1]] = conflict.templateValue;
        }
        // For KEEP_EXISTING, we don't need to do anything
        // For MERGE, we would need more complex logic (TODO)
      });

      // Update data
      setData(updatedData);
      
      // Persist data
      await dataManager.persistData(updatedData);
      
      // Notify parent component
      onDataChange?.(updatedData);
      
      // Close dialogs
      setShowTemplateApplication(false);
      setTemplateApplication(null);
      setSelectedTemplate(null);
      
    } catch (error) {
      console.error('Error applying template:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dataManager, onDataChange]);

  const handleCancelTemplateApplication = useCallback(() => {
    setShowTemplateApplication(false);
    setTemplateApplication(null);
    setSelectedTemplate(null);
    setShowTemplateManager(true);
  }, []);

  const handleCreateTemplate = useCallback((template: ServiceDeskTemplate) => {
    // Template created successfully
    console.log('Template created:', template.name);
    analyticsService.trackEvent({
      type: 'BUSINESS_EVENT' as any,
      category: 'TEMPLATE_OPERATION' as any,
      action: 'template_created',
      label: template.name,
      properties: {
        templateId: template.id,
        templateCategory: template.category,
        templateType: template.type
      }
    });
    setShowTemplateManager(false);
  }, [analyticsService]);

  // Analytics handlers
  const handleOpenAnalyticsDashboard = useCallback(() => {
    setShowAnalyticsDashboard(true);
    analyticsService.trackUserAction('analytics_dashboard_opened');
  }, [analyticsService]);

  const handleCloseAnalyticsDashboard = useCallback(() => {
    setShowAnalyticsDashboard(false);
  }, []);

  // Notification management
  const showNotification = useCallback((
    type: 'success' | 'error' | 'warning' | 'info', 
    message: string,
    duration: number = 5000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const notification = { id, type, message, isVisible: true };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-hide notification
    setTimeout(() => {
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isVisible: false } : n)
      );
      
      // Remove from array after animation
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 300);
    }, duration);
  }, []);

  // Tour management
  const handleStartTour = useCallback((tourId: string) => {
    setActiveTour(tourId);
    setShowTourLauncher(false);
    analyticsService.trackEvent({
      type: 'USER_ACTION' as any,
      category: 'TOUR' as any,
      action: 'tour_started',
      label: tourId
    });
  }, [analyticsService]);

  const handleCloseTour = useCallback(() => {
    setActiveTour(null);
  }, []);

  const handleTourComplete = useCallback((tourId: string) => {
    setActiveTour(null);
    if (typeof window !== 'undefined') {
      localStorage.setItem('service-desk-tour-completed', 'true');
    }
    setIsFirstTimeUser(false);
    showNotification('success', 'Tour concluído! Agora você está pronto para usar o sistema.');
    
    analyticsService.trackEvent({
      type: 'USER_ACTION' as any,
      category: 'TOUR' as any,
      action: 'tour_completed',
      label: tourId
    });
  }, [analyticsService, showNotification]);

  const handleTourSkip = useCallback((tourId: string) => {
    setActiveTour(null);
    if (typeof window !== 'undefined') {
      localStorage.setItem('service-desk-tour-skipped', 'true');
    }
    
    analyticsService.trackEvent({
      type: 'USER_ACTION' as any,
      category: 'TOUR' as any,
      action: 'tour_skipped',
      label: tourId
    });
  }, [analyticsService]);

  // Contextual help management
  const handleToggleContextualHelp = useCallback(() => {
    setShowContextualHelp(!showContextualHelp);
    analyticsService.trackUserAction(showContextualHelp ? 'contextual_help_closed' : 'contextual_help_opened');
  }, [showContextualHelp, analyticsService]);

  // Documentation management
  const handleOpenDocumentation = useCallback((category?: string, searchTerm?: string) => {
    if (category) setDocumentationCategory(category);
    if (searchTerm) setDocumentationSearchTerm(searchTerm);
    setShowDocumentation(true);
    analyticsService.trackUserAction('documentation_opened');
  }, [analyticsService]);

  const handleCloseDocumentation = useCallback(() => {
    setShowDocumentation(false);
    setDocumentationSearchTerm('');
  }, []);

  // Integrated help management
  const handleToggleIntegratedHelp = useCallback(() => {
    setShowIntegratedHelp(!showIntegratedHelp);
    analyticsService.trackUserAction(showIntegratedHelp ? 'integrated_help_closed' : 'integrated_help_opened');
  }, [showIntegratedHelp, analyticsService]);

  // Create breadcrumb items
  const breadcrumbItems = useMemo(() => {
    const currentTabConfig = TAB_CONFIG.find(tab => tab.id === navigation.navigationState.activeTab);
    return createServiceDeskBreadcrumbs(
      navigation.navigationState.activeTab,
      currentTabConfig?.label || 'Desconhecido',
      () => {
        // Navigate to home - could be implemented
        console.log('Navigate to home');
      },
      () => {
        // Navigate to service desk overview
        navigation.navigateToTab('data');
      },
      data.project?.name // Add project name to breadcrumbs
    );
  }, [navigation, data.project?.name]);

  // Don't render on server to avoid localStorage errors
  if (!isMounted) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Indicator */}
        <div className="lg:col-span-2">
          <ProgressIndicator
            tabs={TAB_CONFIG}
            validationStatus={validationStatus}
            activeTab={navigation.navigationState.activeTab}
            showDetails={true}
            showMilestones={true}
            showNavigationShortcuts={true}
            onNavigateToTab={handleTabChange}
            onNavigateToFirstError={navigation.navigateToFirstError}
            onNavigateToFirstIncomplete={navigation.navigateToFirstIncomplete}
          />
        </div>

        {/* Navigation Controls */}
        <div className="lg:col-span-1">
          <NavigationControls
            currentTab={navigation.navigationState.activeTab}
            currentTabLabel={TAB_CONFIG.find(t => t.id === navigation.navigationState.activeTab)?.label || 'Desconhecido'}
            totalTabs={TAB_CONFIG.length}
            currentTabIndex={TAB_CONFIG.findIndex(t => t.id === navigation.navigationState.activeTab)}
            validationStatus={validationStatus}
            canNavigateNext={navigation.navigationCapabilities.canGoNext}
            canNavigatePrevious={navigation.navigationCapabilities.canGoPrevious}
            onNavigateNext={navigation.navigateNext}
            onNavigatePrevious={navigation.navigatePrevious}
            onNavigateToFirstError={navigation.navigateToFirstError}
            onNavigateToFirstIncomplete={navigation.navigateToFirstIncomplete}
            onNavigateToTab={handleTabChange}
            navigationRecommendations={navigation.navigationCapabilities.recommendations}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span>Sistema de Precificação Service Desk</span>
                {integrationMode === 'integrated' && (
                  <Badge variant="outline">Integrado com PDF</Badge>
                )}
              </div>
              {/* Breadcrumbs */}
              <Breadcrumbs 
                items={breadcrumbItems}
                showIcons={true}
                className="text-sm"
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Tooltip content="Gerencie templates para reutilizar configurações">
                <Button
                  variant="outline"
                  onClick={handleOpenTemplateManager}
                  className="flex items-center space-x-2"
                  data-tour="templates-button"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Templates</span>
                </Button>
              </Tooltip>
              
              <Tooltip content="Visualize métricas e analytics do sistema">
                <Button
                  variant="outline"
                  onClick={handleOpenAnalyticsDashboard}
                  className="flex items-center space-x-2"
                  data-tour="analytics-button"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
                </Button>
              </Tooltip>

              <Tooltip content="Exporte dados em PDF, Excel ou JSON">
                <Button
                  variant="outline"
                  onClick={() => setShowExportInterface(true)}
                  className="flex items-center space-x-2"
                  data-tour="export-button"
                >
                  <Download className="h-4 w-4" />
                  <span>Exportar</span>
                </Button>
              </Tooltip>

              <Tooltip content="Abrir documentação completa">
                <Button
                  variant="outline"
                  onClick={() => handleOpenDocumentation()}
                  className="flex items-center space-x-2"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Docs</span>
                </Button>
              </Tooltip>

              <QuickHelpButton
                activeTab={navigation.navigationState.activeTab}
                onOpenHelp={handleToggleIntegratedHelp}
              />

              <Tooltip content="Gerenciar cadastro de funcionários">
                <Button
                  variant="outline"
                  onClick={() => setShowEmployeeRegistry(true)}
                  className="flex items-center space-x-2"
                >
                  <Users className="h-4 w-4" />
                  <span>Funcionários</span>
                </Button>
              </Tooltip>

              <Tooltip content="Iniciar tour guiado">
                <Button
                  variant="outline"
                  onClick={() => setShowTourLauncher(true)}
                  className="flex items-center space-x-2"
                >
                  <span>?</span>
                </Button>
              </Tooltip>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enhanced Tab Navigation with animations */}
          <TabTransition tabId={navigation.navigationState.activeTab}>
            <TabNavigation
              tabs={TAB_CONFIG}
              activeTab={navigation.navigationState.activeTab}
              validationStatus={validationStatus}
              onTabChange={handleTabChange}
              onNavigateNext={navigation.navigateNext}
              onNavigatePrevious={navigation.navigatePrevious}
              onNavigateToFirstError={navigation.navigateToFirstError}
              onNavigateToFirstIncomplete={navigation.navigateToFirstIncomplete}
              showProgress={false} // Already shown in ProgressIndicator
              showBreadcrumbs={false} // Already shown above
              showQuickActions={true}
              showTabPreview={true}
            />
          </TabTransition>

          {/* Show validation alerts */}
          {navigation.navigationCapabilities.hasErrors && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription className="flex items-center justify-between">
                <span>
                  Existem erros que precisam ser corrigidos em algumas abas.
                </span>
                <button
                  onClick={navigation.navigateToFirstError}
                  className="text-sm underline hover:no-underline"
                >
                  Ir para primeiro erro
                </button>
              </AlertDescription>
            </Alert>
          )}

          {navigation.navigationCapabilities.hasWarnings && !navigation.navigationCapabilities.hasErrors && (
            <Alert className="mb-4">
              <AlertDescription>
                Existem avisos em algumas abas. Verifique os indicadores para mais detalhes.
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={navigation.navigationState.activeTab} onValueChange={handleTabChange} className="w-full">
            {/* Hidden TabsList - navigation is handled by TabNavigation component */}
            <TabsList className="hidden">
              {TAB_CONFIG.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {TAB_CONFIG.map((tab) => {
              const TabComponent = tab.component;
              const tabData = dataManager.getTabData(data, tab.id);
              
              // Prepare additional props for specific tabs
              const additionalProps: any = {};
              
              if (tab.id === 'team') {
                // Pass full data to team tab for dimensioning
                additionalProps.fullData = data;
                // Pass callback to update schedules
                additionalProps.onUpdateSchedule = (schedules: any[]) => {
                  handleDataUpdate('scale', schedules);
                };
              }
              
              if (tab.id === 'scale') {
                // Pass team members to scale tab - convert new format to expected format
                additionalProps.teamMembers = data.team?.flatMap(member => {
                  // Create individual entries for each person in the position
                  const entries = [];
                  for (let i = 0; i < member.quantity; i++) {
                    entries.push({
                      id: `${member.id}-${i}`,
                      name: `Pessoa ${i + 1}`, // Generic name for now
                      role: member.jobPositionId // Use position ID as role
                    });
                  }
                  return entries;
                }) || [];
              }
              
              if (tab.id === 'result') {
                // Pass full data to result tab for calculations and export
                additionalProps.fullData = data;
              }
              
              return (
                <TabsContent key={tab.id} value={tab.id} className="mt-6" data-tour={`${tab.id}-tab`}>
                  <AnimatedCard className="w-full">
                    <Suspense 
                      fallback={
                        <div className="flex items-center justify-center p-8">
                          <Loader2 className="h-8 w-8 animate-spin" />
                          <span className="ml-2">Carregando módulo...</span>
                        </div>
                      }
                    >
                      <TabTransition tabId={tab.id}>
                        <TabComponent
                          data={tabData}
                          onUpdate={(tabData: any) => handleDataUpdate(tab.id, tabData)}
                          onAutoSave={(tabData: any) => handleAutoSave(tab.id, tabData)}
                          validation={validationStatus[tab.id] || { isValid: true, errors: [], warnings: [], completionPercentage: 100, tabId: tab.id }}
                          isLoading={isLoading}
                          {...additionalProps}
                        />
                      </TabTransition>
                    </Suspense>
                  </AnimatedCard>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* Enhanced Navigation Validation Dialog */}
      {navigation.showValidationDialog && navigation.validationData && (
        <ValidationTransition
          isOpen={navigation.showValidationDialog}
          onClose={navigation.cancelNavigation}
          onConfirm={navigation.confirmNavigation}
          onCancel={navigation.cancelNavigation}
          fromTab={navigation.validationData.fromTab}
          toTab={navigation.validationData.toTab}
          fromTabLabel={TAB_CONFIG.find(t => t.id === navigation.validationData?.fromTab)?.label || ''}
          toTabLabel={TAB_CONFIG.find(t => t.id === navigation.validationData?.toTab)?.label || ''}
          validationStatus={validationStatus[navigation.validationData.fromTab] || {
            isValid: false,
            errors: [],
            warnings: [],
            completionPercentage: 0
          }}
          errors={navigation.validationData.validation.errors}
          warnings={navigation.validationData.validation.warnings}
          suggestions={navigation.validationData.validation.suggestions || []}
          blockingIssues={navigation.validationData.validation.blockingIssues}
          isOptimalPath={navigation.navigationPathAnalysis(navigation.validationData.toTab).isOptimal}
          suggestedPath={navigation.navigationPathAnalysis(navigation.validationData.toTab).suggestedPath}
          pathReason={navigation.navigationPathAnalysis(navigation.validationData.toTab).reason}
          canProceedWithWarnings={true}
          showSaveReminder={true}
          showPathAnalysis={true}
        />
      )}

      {/* Template Manager Dialog */}
      <TemplateManager
        currentData={data}
        onApplyTemplate={handleApplyTemplate}
        onCreateTemplate={handleCreateTemplate}
        isOpen={showTemplateManager}
        onClose={handleCloseTemplateManager}
      />

      {/* Template Application Dialog */}
      <TemplateApplicationDialog
        isOpen={showTemplateApplication}
        onClose={() => setShowTemplateApplication(false)}
        onConfirm={handleConfirmTemplateApplication}
        onCancel={handleCancelTemplateApplication}
        template={selectedTemplate}
        application={templateApplication}
      />

      {/* Analytics Dashboard */}
      <AnalyticsDashboard
        isOpen={showAnalyticsDashboard}
        onClose={handleCloseAnalyticsDashboard}
      />

      {/* Export Interface */}
      <UnifiedExportInterface
        open={showExportInterface}
        onOpenChange={setShowExportInterface}
        data={data}
      />

      {/* Contextual Help Panel */}
      <ContextualHelp
        title="Ajuda do Sistema"
        isOpen={showContextualHelp}
        onClose={() => setShowContextualHelp(false)}
        content={
          <div className="space-y-4">
            <QuickHelpCard
              title="Navegação por Abas"
              description="O sistema é organizado em 10 abas sequenciais. Complete cada aba antes de prosseguir para a próxima."
              tips={[
                "Use os indicadores coloridos para verificar o status de cada aba",
                "Campos obrigatórios são marcados com asterisco (*)",
                "O sistema salva automaticamente suas alterações"
              ]}
            />
            
            <QuickHelpCard
              title="Validação de Dados"
              description="O sistema valida seus dados em tempo real e oferece sugestões de correção."
              tips={[
                "Erros são mostrados em vermelho e impedem a navegação",
                "Avisos são mostrados em amarelo mas não bloqueiam",
                "Sugestões aparecem em azul para otimizar seus dados"
              ]}
            />
            
            <QuickHelpCard
              title="Atalhos de Teclado"
              description="Use atalhos para navegar mais rapidamente pelo sistema."
              tips={[
                "Ctrl + → : Próxima aba",
                "Ctrl + ← : Aba anterior", 
                "Ctrl + S : Salvar dados",
                "Ctrl + E : Abrir exportação"
              ]}
            />
          </div>
        }
      />

      {/* Tour Launcher Dialog */}
      {showTourLauncher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-blue-700">Tours Guiados</h2>
                <Button variant="ghost" onClick={() => setShowTourLauncher(false)}>
                  <X size={20} />
                </Button>
              </div>
              
              <TourLauncher 
                onStartTour={handleStartTour}
                className="mb-4"
              />
              
              {isFirstTimeUser && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
                  <p className="text-sm text-blue-800">
                    <strong>Primeira vez aqui?</strong> Recomendamos começar com o Tour Básico para conhecer as principais funcionalidades.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Guided Tours */}
      {activeTour === 'basic' && (
        <GuidedTour
          config={{
            ...basicServiceDeskTour,
            onComplete: () => handleTourComplete('basic'),
            onSkip: () => handleTourSkip('basic')
          }}
          isActive={true}
          onClose={handleCloseTour}
        />
      )}
      
      {activeTour === 'advanced' && (
        <GuidedTour
          config={{
            ...advancedFeaturesTour,
            onComplete: () => handleTourComplete('advanced'),
            onSkip: () => handleTourSkip('advanced')
          }}
          isActive={true}
          onClose={handleCloseTour}
        />
      )}
      
      {activeTour === 'tips' && (
        <GuidedTour
          config={{
            ...quickTipsTour,
            onComplete: () => handleTourComplete('tips'),
            onSkip: () => handleTourSkip('tips')
          }}
          isActive={true}
          onClose={handleCloseTour}
        />
      )}

      {/* Documentation System */}
      <DocumentationSystem
        isOpen={showDocumentation}
        onClose={handleCloseDocumentation}
        initialCategory={documentationCategory}
        initialSearchTerm={documentationSearchTerm}
      />

      {/* Integrated Help System */}
      <IntegratedHelpSystem
        activeTab={navigation.navigationState.activeTab}
        isOpen={showIntegratedHelp}
        onClose={() => setShowIntegratedHelp(false)}
        onOpenDocumentation={() => {
          setShowIntegratedHelp(false);
          handleOpenDocumentation('user-guide', navigation.navigationState.activeTab);
        }}
      />

      {/* Employee Registry Manager */}
      <EmployeeRegistryManager
        isOpen={showEmployeeRegistry}
        onClose={() => setShowEmployeeRegistry(false)}
        selectionMode={false}
      />

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-40 space-y-2">
        {notifications.map((notification) => (
          <NotificationAnimation
            key={notification.id}
            isVisible={notification.isVisible}
            position="top-right"
          >
            <div className={`
              px-4 py-3 rounded-md shadow-lg max-w-sm
              ${notification.type === 'success' ? 'bg-green-500 text-white' :
                notification.type === 'error' ? 'bg-red-500 text-white' :
                notification.type === 'warning' ? 'bg-yellow-500 text-white' :
                'bg-blue-500 text-white'}
            `}>
              <div className="flex items-center justify-between">
                <span className="text-sm">{notification.message}</span>
                <button
                  onClick={() => setNotifications(prev => 
                    prev.map(n => n.id === notification.id ? { ...n, isVisible: false } : n)
                  )}
                  className="ml-2 text-white hover:text-gray-200"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </NotificationAnimation>
        ))}
      </div>
    </div>
  );
}