/**
 * Utilitários para migração do sistema de cores
 * Funções auxiliares para validação e compatibilidade
 */

import { featureFlags } from '@/lib/feature-flags';

export interface BrowserSupport {
  cssCustomProperties: boolean;
  backdropFilter: boolean;
  colorScheme: boolean;
  gridLayout: boolean;
  flexbox: boolean;
}

export interface MigrationMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  componentsAffected: number;
  errorsFound: number;
  warningsFound: number;
  performanceImpact: number;
}

/**
 * Detecta suporte do navegador para recursos necessários
 */
export function detectBrowserSupport(): BrowserSupport {
  if (typeof window === 'undefined') {
    // Server-side - assume suporte completo
    return {
      cssCustomProperties: true,
      backdropFilter: true,
      colorScheme: true,
      gridLayout: true,
      flexbox: true,
    };
  }

  const support: BrowserSupport = {
    cssCustomProperties: false,
    backdropFilter: false,
    colorScheme: false,
    gridLayout: false,
    flexbox: false,
  };

  // Verifica CSS Custom Properties
  if (window.CSS && window.CSS.supports) {
    support.cssCustomProperties = window.CSS.supports('color', 'var(--test)');
    support.backdropFilter = window.CSS.supports('backdrop-filter', 'blur(10px)');
    support.colorScheme = window.CSS.supports('color-scheme', 'dark');
    support.gridLayout = window.CSS.supports('display', 'grid');
    support.flexbox = window.CSS.supports('display', 'flex');
  }

  return support;
}

/**
 * Calcula contraste entre duas cores
 */
export function calculateContrast(color1: string, color2: string): number {
  // Converte cores para RGB
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  // Calcula luminância relativa
  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);

  // Calcula contraste
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Converte hex para RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calcula luminância relativa
 */
function getRelativeLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Verifica se uma cor atende aos critérios WCAG
 */
export function isWCAGCompliant(
  foreground: string, 
  background: string, 
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): boolean {
  const contrast = calculateContrast(foreground, background);
  
  if (level === 'AAA') {
    return size === 'large' ? contrast >= 4.5 : contrast >= 7;
  }
  
  return size === 'large' ? contrast >= 3 : contrast >= 4.5;
}

/**
 * Gera fallbacks CSS para navegadores antigos
 */
export function generateCSSFallbacks(property: string, modernValue: string): string {
  const fallbacks: Record<string, string> = {
    'hsl(var(--primary))': '#00D4FF',
    'hsl(var(--accent-orange))': '#FF6B35',
    'hsl(var(--accent-cyan))': '#00D4FF',
    'hsl(var(--background))': '#1a2332',
    'hsl(var(--foreground))': '#ffffff',
    'hsl(var(--card))': '#2a3441',
    'hsl(var(--border))': '#3a4550',
  };

  const fallback = fallbacks[modernValue] || modernValue;
  
  return `${property}: ${fallback}; /* Fallback */\n${property}: ${modernValue}; /* Modern */`;
}

/**
 * Monitora performance da migração
 */
export class MigrationPerformanceMonitor {
  private metrics: MigrationMetrics;
  private observer?: PerformanceObserver;

  constructor() {
    this.metrics = {
      startTime: Date.now(),
      componentsAffected: 0,
      errorsFound: 0,
      warningsFound: 0,
      performanceImpact: 0,
    };

    this.setupPerformanceObserver();
  }

  private setupPerformanceObserver() {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    try {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach(entry => {
          if (entry.entryType === 'paint') {
            this.metrics.performanceImpact += entry.startTime;
          }
        });
      });

      this.observer.observe({ entryTypes: ['paint', 'layout-shift'] });
    } catch (error) {
      console.warn('Performance Observer não suportado:', error);
    }
  }

  startMigration() {
    this.metrics.startTime = Date.now();
  }

  endMigration() {
    this.metrics.endTime = Date.now();
    this.metrics.duration = this.metrics.endTime - this.metrics.startTime;
    
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  recordComponent() {
    this.metrics.componentsAffected++;
  }

  recordError() {
    this.metrics.errorsFound++;
  }

  recordWarning() {
    this.metrics.warningsFound++;
  }

  getMetrics(): MigrationMetrics {
    return { ...this.metrics };
  }

  generateReport(): string {
    const { duration, componentsAffected, errorsFound, warningsFound, performanceImpact } = this.metrics;
    
    return `
Relatório de Migração do Sistema de Cores
==========================================

Duração: ${duration ? `${duration}ms` : 'Em andamento'}
Componentes Afetados: ${componentsAffected}
Erros Encontrados: ${errorsFound}
Avisos Encontrados: ${warningsFound}
Impacto na Performance: ${performanceImpact.toFixed(2)}ms

Status: ${errorsFound === 0 ? 'Sucesso' : 'Problemas encontrados'}
    `.trim();
  }
}

/**
 * Valida CSS customizado para compatibilidade
 */
export function validateCustomCSS(cssContent: string): {
  isValid: boolean;
  issues: Array<{
    line: number;
    message: string;
    severity: 'error' | 'warning';
  }>;
} {
  const issues: Array<{ line: number; message: string; severity: 'error' | 'warning' }> = [];
  const lines = cssContent.split('\n');

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    // Verifica uso de cores hardcoded
    const hexColorRegex = /#[0-9a-fA-F]{3,6}/g;
    const hexMatches = line.match(hexColorRegex);
    
    if (hexMatches) {
      issues.push({
        line: lineNumber,
        message: `Cor hardcoded encontrada: ${hexMatches.join(', ')}. Considere usar variáveis CSS.`,
        severity: 'warning',
      });
    }

    // Verifica uso de !important desnecessário
    if (line.includes('!important') && !line.includes('/* migration-safe */')) {
      issues.push({
        line: lineNumber,
        message: 'Uso de !important pode interferir na migração',
        severity: 'warning',
      });
    }

    // Verifica propriedades CSS obsoletas
    const obsoleteProperties = ['filter: alpha', '-ms-filter', 'zoom'];
    obsoleteProperties.forEach(prop => {
      if (line.includes(prop)) {
        issues.push({
          line: lineNumber,
          message: `Propriedade obsoleta: ${prop}`,
          severity: 'error',
        });
      }
    });
  });

  return {
    isValid: issues.filter(i => i.severity === 'error').length === 0,
    issues,
  };
}

/**
 * Gera CSS de transição suave entre sistemas
 */
export function generateTransitionCSS(fromSystem: 'legacy' | 'modern', toSystem: 'legacy' | 'modern'): string {
  if (fromSystem === toSystem) return '';

  const transitionDuration = '300ms';
  const transitionEasing = 'cubic-bezier(0.4, 0, 0.2, 1)';

  return `
/* Transição suave entre sistemas de cores */
* {
  transition: 
    background-color ${transitionDuration} ${transitionEasing},
    color ${transitionDuration} ${transitionEasing},
    border-color ${transitionDuration} ${transitionEasing},
    box-shadow ${transitionDuration} ${transitionEasing};
}

/* Desabilita transições para elementos que podem causar problemas */
.no-transition,
.no-transition * {
  transition: none !important;
}

/* Transições específicas para componentes críticos */
.btn-primary-modern {
  transition: all ${transitionDuration} ${transitionEasing};
}

.card-modern {
  transition: 
    background-color ${transitionDuration} ${transitionEasing},
    border-color ${transitionDuration} ${transitionEasing},
    box-shadow ${transitionDuration} ${transitionEasing};
}

.glass-effect {
  transition: 
    background-color ${transitionDuration} ${transitionEasing},
    backdrop-filter ${transitionDuration} ${transitionEasing};
}
  `.trim();
}

/**
 * Utilitário para debug da migração
 */
export class MigrationDebugger {
  private logs: Array<{
    timestamp: number;
    level: 'info' | 'warn' | 'error';
    message: string;
    data?: any;
  }> = [];

  log(level: 'info' | 'warn' | 'error', message: string, data?: any) {
    const entry = {
      timestamp: Date.now(),
      level,
      message,
      data,
    };

    this.logs.push(entry);

    if (process.env.NODE_ENV === 'development') {
      console[level](`[Migration] ${message}`, data || '');
    }
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  getLogs() {
    return [...this.logs];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  clearLogs() {
    this.logs = [];
  }
}

// Instância global do debugger
export const migrationDebugger = new MigrationDebugger();

/**
 * Hook para usar utilitários de migração em componentes React
 */
export function useMigrationUtils() {
  const browserSupport = detectBrowserSupport();
  
  return {
    browserSupport,
    calculateContrast,
    isWCAGCompliant,
    validateCustomCSS,
    debugger: migrationDebugger,
  };
}