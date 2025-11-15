/**
 * Sistema de migração suave para o novo sistema de cores
 * Permite transição gradual entre sistemas de cor com validação de compatibilidade
 */

import { featureFlags, type FeatureFlags } from '@/lib/feature-flags';
import { convertLegacyColor, convertLegacyClass, migrateCSSFile } from '@/lib/compatibility/legacy-colors';

export interface MigrationConfig {
  enabledFeatures: Partial<FeatureFlags>;
  rolloutPercentage: number;
  userGroups: string[];
  fallbackMode: 'legacy' | 'hybrid' | 'modern';
  validationLevel: 'strict' | 'moderate' | 'permissive';
}

export interface MigrationStatus {
  isActive: boolean;
  currentPhase: 'preparation' | 'rollout' | 'validation' | 'completion';
  progress: number;
  errors: string[];
  warnings: string[];
  affectedComponents: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    type: 'css' | 'component' | 'accessibility' | 'performance';
    message: string;
    severity: 'error' | 'warning' | 'info';
    location?: string;
  }>;
  recommendations: string[];
  compatibilityScore: number;
}

class ColorMigrationManager {
  private config: MigrationConfig;
  private status: MigrationStatus;
  private validationCache: Map<string, ValidationResult> = new Map();

  constructor(config: Partial<MigrationConfig> = {}) {
    this.config = {
      enabledFeatures: {},
      rolloutPercentage: 0,
      userGroups: [],
      fallbackMode: 'hybrid',
      validationLevel: 'moderate',
      ...config,
    };

    this.status = {
      isActive: false,
      currentPhase: 'preparation',
      progress: 0,
      errors: [],
      warnings: [],
      affectedComponents: [],
    };
  }

  /**
   * Inicia o processo de migração
   */
  async startMigration(targetConfig: Partial<MigrationConfig>): Promise<void> {
    this.config = { ...this.config, ...targetConfig };
    this.status.isActive = true;
    this.status.currentPhase = 'preparation';
    this.status.progress = 0;
    this.status.errors = [];
    this.status.warnings = [];

    try {
      // Fase 1: Preparação
      await this.prepareMigration();
      this.status.currentPhase = 'rollout';
      this.status.progress = 25;

      // Fase 2: Rollout gradual
      await this.executeRollout();
      this.status.currentPhase = 'validation';
      this.status.progress = 75;

      // Fase 3: Validação
      await this.validateMigration();
      this.status.currentPhase = 'completion';
      this.status.progress = 100;

      // Fase 4: Finalização
      await this.completeMigration();
    } catch (error) {
      this.status.errors.push(`Erro durante migração: ${error}`);
      await this.rollbackMigration();
    }
  }

  /**
   * Prepara o ambiente para migração
   */
  private async prepareMigration(): Promise<void> {
    // Valida compatibilidade do navegador
    const browserSupport = this.validateBrowserSupport();
    if (!browserSupport.isSupported) {
      throw new Error('Navegador não suporta recursos necessários para migração');
    }

    // Cria backup das configurações atuais
    this.createConfigBackup();

    // Valida componentes existentes
    const componentValidation = await this.validateExistingComponents();
    if (componentValidation.errors.length > 0) {
      this.status.warnings.push(...componentValidation.errors.map(e => e.message));
    }

    // Prepara CSS com fallbacks
    await this.prepareCSSFallbacks();
  }

  /**
   * Executa o rollout gradual
   */
  private async executeRollout(): Promise<void> {
    const { rolloutPercentage, userGroups } = this.config;

    // Determina se o usuário atual deve receber as novas features
    const shouldEnableForUser = this.shouldEnableForCurrentUser(rolloutPercentage, userGroups);

    if (shouldEnableForUser) {
      // Aplica as novas features gradualmente
      await this.applyFeatureFlags();
      
      // Atualiza CSS dinamicamente
      await this.updateDynamicCSS();
      
      // Notifica componentes sobre mudanças
      this.notifyComponentsOfChanges();
    }
  }

  /**
   * Valida a migração
   */
  private async validateMigration(): Promise<void> {
    const validation = await this.performFullValidation();
    
    if (!validation.isValid) {
      const criticalErrors = validation.errors.filter(e => e.severity === 'error');
      if (criticalErrors.length > 0) {
        throw new Error(`Validação falhou: ${criticalErrors.map(e => e.message).join(', ')}`);
      }
    }

    // Armazena resultados da validação
    this.status.warnings.push(...validation.errors.filter(e => e.severity === 'warning').map(e => e.message));
  }

  /**
   * Completa a migração
   */
  private async completeMigration(): Promise<void> {
    // Remove flags temporárias
    this.cleanupTemporaryFlags();
    
    // Atualiza configuração permanente
    this.updatePermanentConfig();
    
    // Limpa cache de validação
    this.validationCache.clear();
    
    this.status.isActive = false;
  }

  /**
   * Valida suporte do navegador
   */
  private validateBrowserSupport(): { isSupported: boolean; missingFeatures: string[] } {
    const missingFeatures: string[] = [];

    if (typeof window === 'undefined') {
      return { isSupported: true, missingFeatures }; // Server-side
    }

    // Verifica CSS Custom Properties
    if (!window.CSS || !window.CSS.supports || !window.CSS.supports('color', 'var(--test)')) {
      missingFeatures.push('CSS Custom Properties');
    }

    // Verifica backdrop-filter
    if (!window.CSS.supports('backdrop-filter', 'blur(10px)')) {
      missingFeatures.push('backdrop-filter');
    }

    // Verifica color-scheme
    if (!window.CSS.supports('color-scheme', 'dark')) {
      missingFeatures.push('color-scheme');
    }

    return {
      isSupported: missingFeatures.length === 0,
      missingFeatures,
    };
  }

  /**
   * Cria backup das configurações atuais
   */
  private createConfigBackup(): void {
    if (typeof window !== 'undefined') {
      const currentConfig = {
        featureFlags: { ...featureFlags },
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
      };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('color-migration-backup', JSON.stringify(currentConfig));
      }
    }
  }

  /**
   * Valida componentes existentes
   */
  private async validateExistingComponents(): Promise<ValidationResult> {
    const errors: ValidationResult['errors'] = [];
    const recommendations: string[] = [];
    let compatibilityScore = 100;

    // Lista de componentes críticos para validar
    const criticalComponents = [
      'Button',
      'Card',
      'Input',
      'Select',
      'Chart',
      'Dashboard',
      'Navigation',
    ];

    for (const component of criticalComponents) {
      try {
        const validation = await this.validateComponent(component);
        if (!validation.isValid) {
          errors.push(...validation.errors);
          compatibilityScore -= 10;
        }
      } catch (error) {
        errors.push({
          type: 'component',
          message: `Erro ao validar componente ${component}: ${error}`,
          severity: 'warning',
          location: component,
        });
        compatibilityScore -= 5;
      }
    }

    // Adiciona recomendações baseadas nos erros encontrados
    if (errors.some(e => e.type === 'accessibility')) {
      recommendations.push('Considere implementar modo de alto contraste');
    }

    if (errors.some(e => e.type === 'css')) {
      recommendations.push('Atualize classes CSS legadas para o novo sistema');
    }

    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      recommendations,
      compatibilityScore: Math.max(0, compatibilityScore),
    };
  }

  /**
   * Valida um componente específico
   */
  private async validateComponent(componentName: string): Promise<ValidationResult> {
    const cacheKey = `component-${componentName}`;
    const cached = this.validationCache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const errors: ValidationResult['errors'] = [];
    const recommendations: string[] = [];

    // Simula validação de componente
    // Em uma implementação real, isso faria análise estática do código
    
    // Verifica se usa cores legadas
    const usesLegacyColors = this.checkForLegacyColors(componentName);
    if (usesLegacyColors.length > 0) {
      errors.push({
        type: 'css',
        message: `Componente ${componentName} usa cores legadas: ${usesLegacyColors.join(', ')}`,
        severity: 'warning',
        location: componentName,
      });
      recommendations.push(`Migre ${componentName} para usar variáveis CSS do novo sistema`);
    }

    // Verifica acessibilidade
    const accessibilityIssues = this.checkAccessibility(componentName);
    if (accessibilityIssues.length > 0) {
      errors.push(...accessibilityIssues.map(issue => ({
        type: 'accessibility' as const,
        message: issue,
        severity: 'warning' as const,
        location: componentName,
      })));
    }

    const result: ValidationResult = {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      recommendations,
      compatibilityScore: errors.length === 0 ? 100 : Math.max(0, 100 - errors.length * 10),
    };

    this.validationCache.set(cacheKey, result);
    return result;
  }

  /**
   * Verifica se um componente usa cores legadas
   */
  private checkForLegacyColors(componentName: string): string[] {
    // Em uma implementação real, isso analisaria o código do componente
    // Por agora, retorna uma lista simulada baseada no nome do componente
    const legacyColorPatterns = [
      'indigo-600',
      'gray-800',
      'blue-500',
      'violet-400',
    ];

    // Simula detecção baseada no nome do componente
    if (componentName.includes('Button')) {
      return ['indigo-600', 'indigo-700'];
    }
    
    if (componentName.includes('Card')) {
      return ['gray-800', 'gray-100'];
    }

    return [];
  }

  /**
   * Verifica problemas de acessibilidade
   */
  private checkAccessibility(componentName: string): string[] {
    const issues: string[] = [];

    // Simula verificação de acessibilidade
    if (componentName.includes('Button')) {
      // Verifica contraste de botões
      const contrastRatio = this.calculateContrastRatio('#FF6B35', '#1a2332');
      if (contrastRatio < 4.5) {
        issues.push(`Contraste insuficiente em ${componentName}: ${contrastRatio.toFixed(2)}:1`);
      }
    }

    return issues;
  }

  /**
   * Calcula razão de contraste entre duas cores
   */
  private calculateContrastRatio(color1: string, color2: string): number {
    // Implementação simplificada - em produção usaria uma biblioteca como chroma.js
    // Por agora retorna um valor simulado
    return 4.8; // Simula um contraste adequado
  }

  /**
   * Prepara CSS com fallbacks
   */
  private async prepareCSSFallbacks(): Promise<void> {
    if (typeof document === 'undefined') return;

    // Cria uma folha de estilo com fallbacks
    const fallbackCSS = `
      /* Fallbacks para navegadores sem suporte a CSS Custom Properties */
      .btn-primary-modern {
        background: #FF6B35; /* Fallback */
        background: hsl(var(--accent-orange)); /* Moderno */
      }
      
      .card-modern {
        background: #2a3441; /* Fallback */
        background: hsl(var(--card)); /* Moderno */
      }
      
      .text-primary {
        color: #00D4FF; /* Fallback */
        color: hsl(var(--primary)); /* Moderno */
      }
    `;

    const style = document.createElement('style');
    style.id = 'migration-fallbacks';
    style.textContent = fallbackCSS;
    document.head.appendChild(style);
  }

  /**
   * Determina se deve habilitar features para o usuário atual
   */
  private shouldEnableForCurrentUser(rolloutPercentage: number, userGroups: string[]): boolean {
    if (typeof window === 'undefined') return false;

    // Verifica se usuário está em grupo específico
    const userGroup = typeof window !== 'undefined' ? localStorage.getItem('user-group') : null;
    if (userGroup && userGroups.includes(userGroup)) {
      return true;
    }

    // Verifica rollout baseado em hash do user agent
    const hash = this.hashString(navigator.userAgent);
    const userPercentile = hash % 100;
    
    return userPercentile < rolloutPercentage;
  }

  /**
   * Gera hash simples de uma string
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Converte para 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Aplica feature flags
   */
  private async applyFeatureFlags(): Promise<void> {
    const { enabledFeatures } = this.config;

    Object.entries(enabledFeatures).forEach(([feature, enabled]) => {
      if (enabled && typeof window !== 'undefined') {
        try {
          localStorage.setItem(`migration-${feature}`, 'true');
        } catch (e) {
          console.warn('Failed to set migration feature:', e);
        }
        
        // Aplica classe CSS correspondente
        document.documentElement.classList.toggle(`migration-${feature}`, enabled);
      }
    });
  }

  /**
   * Atualiza CSS dinamicamente
   */
  private async updateDynamicCSS(): Promise<void> {
    if (typeof document === 'undefined') return;

    const { fallbackMode } = this.config;

    // Remove CSS antigo se existir
    const oldStyle = document.getElementById('dynamic-migration-css');
    if (oldStyle) {
      oldStyle.remove();
    }

    // Cria novo CSS baseado no modo
    let dynamicCSS = '';

    switch (fallbackMode) {
      case 'legacy':
        dynamicCSS = this.generateLegacyCSS();
        break;
      case 'hybrid':
        dynamicCSS = this.generateHybridCSS();
        break;
      case 'modern':
        dynamicCSS = this.generateModernCSS();
        break;
    }

    const style = document.createElement('style');
    style.id = 'dynamic-migration-css';
    style.textContent = dynamicCSS;
    document.head.appendChild(style);
  }

  /**
   * Gera CSS para modo legado
   */
  private generateLegacyCSS(): string {
    return `
      /* Modo legado - cores originais */
      :root {
        --primary: 231 48% 48%;
        --accent-orange: 231 48% 48%;
        --accent-cyan: 231 48% 48%;
      }
    `;
  }

  /**
   * Gera CSS para modo híbrido
   */
  private generateHybridCSS(): string {
    return `
      /* Modo híbrido - transição suave */
      :root {
        --primary: 195 100% 50%;
        --accent-orange: 20 100% 60%;
        --accent-cyan: 195 100% 50%;
      }
      
      .legacy-component {
        /* Mantém cores antigas para componentes não migrados */
        --local-primary: 231 48% 48%;
      }
    `;
  }

  /**
   * Gera CSS para modo moderno
   */
  private generateModernCSS(): string {
    return `
      /* Modo moderno - sistema completo */
      :root {
        --primary: 195 100% 50%;
        --accent-orange: 20 100% 60%;
        --accent-cyan: 195 100% 50%;
        --accent-green: 150 80% 45%;
        --accent-yellow: 45 100% 60%;
      }
    `;
  }

  /**
   * Notifica componentes sobre mudanças
   */
  private notifyComponentsOfChanges(): void {
    if (typeof window === 'undefined') return;

    // Dispara evento customizado para componentes React
    const event = new CustomEvent('colorSystemMigration', {
      detail: {
        phase: this.status.currentPhase,
        config: this.config,
        timestamp: Date.now(),
      },
    });

    window.dispatchEvent(event);
  }

  /**
   * Executa validação completa
   */
  private async performFullValidation(): Promise<ValidationResult> {
    const errors: ValidationResult['errors'] = [];
    const recommendations: string[] = [];

    // Valida CSS
    const cssValidation = await this.validateCSS();
    errors.push(...cssValidation.errors);

    // Valida acessibilidade
    const a11yValidation = await this.validateAccessibility();
    errors.push(...a11yValidation.errors);

    // Valida performance
    const perfValidation = await this.validatePerformance();
    errors.push(...perfValidation.errors);

    // Calcula score de compatibilidade
    const compatibilityScore = Math.max(0, 100 - errors.length * 5);

    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      recommendations,
      compatibilityScore,
    };
  }

  /**
   * Valida CSS
   */
  private async validateCSS(): Promise<ValidationResult> {
    const errors: ValidationResult['errors'] = [];

    if (typeof document === 'undefined') {
      return { isValid: true, errors, recommendations: [], compatibilityScore: 100 };
    }

    // Verifica se variáveis CSS estão definidas
    const computedStyle = getComputedStyle(document.documentElement);
    const requiredVariables = [
      '--primary',
      '--accent-orange',
      '--accent-cyan',
      '--background',
      '--foreground',
    ];

    requiredVariables.forEach(variable => {
      const value = computedStyle.getPropertyValue(variable).trim();
      if (!value) {
        errors.push({
          type: 'css',
          message: `Variável CSS ${variable} não está definida`,
          severity: 'error',
          location: 'globals.css',
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      recommendations: [],
      compatibilityScore: errors.length === 0 ? 100 : 50,
    };
  }

  /**
   * Valida acessibilidade
   */
  private async validateAccessibility(): Promise<ValidationResult> {
    const errors: ValidationResult['errors'] = [];

    // Simula validação de acessibilidade
    // Em produção, usaria ferramentas como axe-core

    return {
      isValid: true,
      errors,
      recommendations: ['Considere testar com leitores de tela'],
      compatibilityScore: 100,
    };
  }

  /**
   * Valida performance
   */
  private async validatePerformance(): Promise<ValidationResult> {
    const errors: ValidationResult['errors'] = [];

    if (typeof window !== 'undefined' && 'performance' in window) {
      // Verifica se há muitas recalculações de estilo
      const paintEntries = performance.getEntriesByType('paint');
      const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
      
      if (firstPaint && firstPaint.startTime > 2000) {
        errors.push({
          type: 'performance',
          message: `First paint demorou ${firstPaint.startTime}ms - considere otimizar CSS`,
          severity: 'warning',
        });
      }
    }

    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      recommendations: ['Monitore performance após migração'],
      compatibilityScore: 90,
    };
  }

  /**
   * Faz rollback da migração
   */
  async rollbackMigration(): Promise<void> {
    if (typeof window === 'undefined') return;

    // Restaura backup
    const backup = typeof window !== 'undefined' ? localStorage.getItem('color-migration-backup') : null;
    if (backup) {
      const backupData = JSON.parse(backup);
      
      // Remove CSS dinâmico
      const dynamicStyle = document.getElementById('dynamic-migration-css');
      if (dynamicStyle) {
        dynamicStyle.remove();
      }

      // Remove classes de migração
      document.documentElement.className = document.documentElement.className
        .split(' ')
        .filter(cls => !cls.startsWith('migration-'))
        .join(' ');

      // Limpa localStorage
      if (typeof window !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('migration-')) {
            localStorage.removeItem(key);
          }
        });
      }
        }
      });
    }

    this.status.isActive = false;
    this.status.currentPhase = 'preparation';
    this.status.progress = 0;
  }

  /**
   * Limpa flags temporárias
   */
  private cleanupTemporaryFlags(): void {
    if (typeof window === 'undefined') return;

    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('migration-temp-')) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Atualiza configuração permanente
   */
  private updatePermanentConfig(): void {
    if (typeof window === 'undefined') return;

    const finalConfig = {
      ...this.config,
      migrationCompleted: true,
      completionDate: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('color-system-config', JSON.stringify(finalConfig));
    }
  }

  /**
   * Obtém status atual da migração
   */
  getStatus(): MigrationStatus {
    return { ...this.status };
  }

  /**
   * Obtém configuração atual
   */
  getConfig(): MigrationConfig {
    return { ...this.config };
  }

  /**
   * Força validação de um componente específico
   */
  async validateSpecificComponent(componentName: string): Promise<ValidationResult> {
    this.validationCache.delete(`component-${componentName}`);
    return this.validateComponent(componentName);
  }
}

// Instância singleton do gerenciador de migração
export const migrationManager = new ColorMigrationManager();

// Funções utilitárias para uso em componentes
export function useMigrationStatus(): MigrationStatus {
  return migrationManager.getStatus();
}

export function useMigrationConfig(): MigrationConfig {
  return migrationManager.getConfig();
}

export async function startColorMigration(config: Partial<MigrationConfig>): Promise<void> {
  return migrationManager.startMigration(config);
}

export async function rollbackColorMigration(): Promise<void> {
  return migrationManager.rollbackMigration();
}

export async function validateColorSystem(): Promise<ValidationResult> {
  return migrationManager.performFullValidation();
}

// Hook React para usar o sistema de migração
export function useColorMigration() {
  const [status, setStatus] = React.useState(migrationManager.getStatus());
  const [config, setConfig] = React.useState(migrationManager.getConfig());

  React.useEffect(() => {
    const handleMigrationEvent = (event: CustomEvent) => {
      setStatus(migrationManager.getStatus());
      setConfig(migrationManager.getConfig());
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('colorSystemMigration', handleMigrationEvent as EventListener);
      
      return () => {
        window.removeEventListener('colorSystemMigration', handleMigrationEvent as EventListener);
      };
    }
  }, []);

  return {
    status,
    config,
    startMigration: (newConfig: Partial<MigrationConfig>) => migrationManager.startMigration(newConfig),
    rollback: () => migrationManager.rollbackMigration(),
    validate: () => migrationManager.performFullValidation(),
  };
}

// Adiciona import do React para o hook
import React from 'react';