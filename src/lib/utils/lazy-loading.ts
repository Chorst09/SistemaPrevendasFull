import { lazy, ComponentType } from 'react';

// Lazy loading utilities for tab modules
export const createLazyTabModule = <T = any>(
  importFn: () => Promise<{ default: ComponentType<T> }>
) => {
  return lazy(importFn);
};

// Preload function for critical tabs
export const preloadTabModule = async (
  importFn: () => Promise<{ default: ComponentType<any> }>
) => {
  try {
    await importFn();
  } catch (error) {
    console.warn('Failed to preload tab module:', error);
  }
};

// Tab module registry for lazy loading
export const TabModuleRegistry = {
  DataTab: () => import('../../components/service-desk-pricing/tabs/DataTabModule').then(m => ({ default: m.DataTabModule })),
  TeamTab: () => import('../../components/service-desk-pricing/tabs/TeamTabModuleNew').then(m => ({ default: m.TeamTabModuleNew })),
  ScaleTab: () => import('../../components/service-desk-pricing/tabs/ScaleTabModule').then(m => ({ default: m.ScaleTabModule })),
  TaxesTab: () => import('../../components/service-desk-pricing/tabs/TaxesTabModule').then(m => ({ default: m.TaxesTabModule })),
  VariablesTab: () => import('../../components/service-desk-pricing/tabs/VariablesTabModule').then(m => ({ default: m.VariablesTabModule })),
  OtherCostsTab: () => import('../../components/service-desk-pricing/tabs/OtherCostsTabModule').then(m => ({ default: m.OtherCostsTabModule })),
  BudgetTab: () => import('../../components/service-desk-pricing/tabs/BudgetTabModule').then(m => ({ default: m.BudgetTabModule })),
  ForecastTab: () => import('../../components/service-desk-pricing/tabs/ForecastTabModule').then(m => ({ default: m.ForecastTabModule })),
  ResultTab: () => import('../../components/service-desk-pricing/tabs/ResultTabModule').then(m => ({ default: m.ResultTabModule })),
  NegotiationTab: () => import('../../components/service-desk-pricing/tabs/NegotiationTabModule').then(m => ({ default: m.NegotiationTabModule })),
  FinalAnalysisTab: () => import('../../components/service-desk-pricing/tabs/FinalAnalysisTabModule').then(m => ({ default: m.FinalAnalysisTabModule })),
  ReportsTab: () => import('../../components/service-desk-pricing/tabs/ReportsTabModule').then(m => ({ default: m.ReportsTabModule })),
};

// Lazy loaded tab components
export const LazyTabModules = {
  DataTab: createLazyTabModule(TabModuleRegistry.DataTab),
  TeamTab: createLazyTabModule(TabModuleRegistry.TeamTab),
  ScaleTab: createLazyTabModule(TabModuleRegistry.ScaleTab),
  TaxesTab: createLazyTabModule(TabModuleRegistry.TaxesTab),
  VariablesTab: createLazyTabModule(TabModuleRegistry.VariablesTab),
  OtherCostsTab: createLazyTabModule(TabModuleRegistry.OtherCostsTab),
  BudgetTab: createLazyTabModule(TabModuleRegistry.BudgetTab),
  ForecastTab: createLazyTabModule(TabModuleRegistry.ForecastTab),
  ResultTab: createLazyTabModule(TabModuleRegistry.ResultTab),
  NegotiationTab: createLazyTabModule(TabModuleRegistry.NegotiationTab),
  FinalAnalysisTab: createLazyTabModule(TabModuleRegistry.FinalAnalysisTab),
  ReportsTab: createLazyTabModule(TabModuleRegistry.ReportsTab),
};

// Preload strategy for critical tabs
export const preloadCriticalTabs = async () => {
  // Preload the most commonly used tabs
  await Promise.all([
    preloadTabModule(TabModuleRegistry.DataTab),
    preloadTabModule(TabModuleRegistry.TeamTab),
    preloadTabModule(TabModuleRegistry.BudgetTab),
  ]);
};

// Progressive loading strategy
export const preloadNextTab = async (currentTab: string) => {
  const tabOrder = [
    'DataTab', 'TeamTab', 'ScaleTab', 'TaxesTab', 'VariablesTab',
    'OtherCostsTab', 'BudgetTab', 'ForecastTab', 'ResultTab', 'NegotiationTab', 'FinalAnalysisTab', 'ReportsTab'
  ];
  
  const currentIndex = tabOrder.indexOf(currentTab);
  if (currentIndex >= 0 && currentIndex < tabOrder.length - 1) {
    const nextTab = tabOrder[currentIndex + 1];
    const importFn = TabModuleRegistry[nextTab as keyof typeof TabModuleRegistry];
    if (importFn) {
      await preloadTabModule(importFn);
    }
  }
};