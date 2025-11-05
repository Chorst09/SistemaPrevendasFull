/**
 * Sistema de Feature Flags para migração suave do sistema de cores
 * Permite ativar/desativar o novo sistema de cores gradualmente
 */

export interface FeatureFlags {
  newColorSystem: boolean;
  highContrastMode: boolean;
  modernComponents: boolean;
  glassEffects: boolean;
  chartColors: boolean;
}

// Configuração padrão das feature flags
const defaultFlags: FeatureFlags = {
  newColorSystem: true, // Novo sistema de cores ativado por padrão
  highContrastMode: true, // Modo alto contraste disponível
  modernComponents: true, // Componentes modernos ativados
  glassEffects: true, // Efeitos de vidro ativados
  chartColors: true, // Novas cores de gráfico ativadas
};

// Feature flags do ambiente (podem ser sobrescritas por variáveis de ambiente)
const environmentFlags: Partial<FeatureFlags> = {
  newColorSystem: process.env.NEXT_PUBLIC_NEW_COLOR_SYSTEM === 'true',
  highContrastMode: process.env.NEXT_PUBLIC_HIGH_CONTRAST_MODE !== 'false',
  modernComponents: process.env.NEXT_PUBLIC_MODERN_COMPONENTS !== 'false',
  glassEffects: process.env.NEXT_PUBLIC_GLASS_EFFECTS !== 'false',
  chartColors: process.env.NEXT_PUBLIC_CHART_COLORS !== 'false',
};

// Combina flags padrão com flags do ambiente
export const featureFlags: FeatureFlags = {
  ...defaultFlags,
  ...Object.fromEntries(
    Object.entries(environmentFlags).filter(([, value]) => value !== undefined)
  ) as Partial<FeatureFlags>,
};

/**
 * Hook para verificar se uma feature flag está ativa
 */
export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  return featureFlags[flag];
}

/**
 * Função para verificar se uma feature flag está ativa (uso em componentes server)
 */
export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  return featureFlags[flag];
}

/**
 * Função para obter classes CSS baseadas nas feature flags
 */
export function getFeatureClasses(): {
  colorSystem: string;
  components: string;
  effects: string;
} {
  return {
    colorSystem: featureFlags.newColorSystem ? 'new-color-system' : 'legacy-color-system',
    components: featureFlags.modernComponents ? 'modern-components' : 'legacy-components',
    effects: featureFlags.glassEffects ? 'glass-effects-enabled' : 'glass-effects-disabled',
  };
}

/**
 * Função para obter configuração de cores para gráficos
 */
export function getChartColorConfig() {
  if (!featureFlags.chartColors) {
    // Cores legadas para compatibilidade
    return {
      primary: '#4F46E5', // Deep indigo (cor original)
      secondary: '#818CF8', // Soft violet (cor original)
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    };
  }

  // Novas cores do sistema
  return {
    primary: 'hsl(var(--accent-cyan))',
    secondary: 'hsl(var(--accent-orange))',
    success: 'hsl(var(--accent-green))',
    warning: 'hsl(var(--accent-yellow))',
    error: 'hsl(var(--destructive))',
    info: 'hsl(var(--primary))',
    revenue: 'hsl(var(--chart-revenue))',
    cost: 'hsl(var(--chart-cost))',
    profit: 'hsl(var(--chart-profit))',
    tax: 'hsl(var(--chart-tax))',
    commission: 'hsl(var(--chart-commission))',
  };
}

/**
 * Função para obter classes de botão baseadas nas feature flags
 */
export function getButtonClasses(variant: 'primary' | 'secondary' | 'destructive' = 'primary'): string {
  if (!featureFlags.modernComponents) {
    // Classes legadas
    const legacyClasses = {
      primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
      destructive: 'bg-red-600 hover:bg-red-700 text-white',
    };
    return legacyClasses[variant];
  }

  // Classes modernas
  const modernClasses = {
    primary: 'btn-primary-modern',
    secondary: 'btn-secondary-modern',
    destructive: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
  };
  return modernClasses[variant];
}

/**
 * Função para obter classes de card baseadas nas feature flags
 */
export function getCardClasses(withGlass: boolean = false): string {
  if (!featureFlags.modernComponents) {
    return 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm';
  }

  if (withGlass && featureFlags.glassEffects) {
    return 'glass-effect';
  }

  return 'card-modern';
}

/**
 * Função para validar compatibilidade com código existente
 */
export function validateCompatibility(): {
  isCompatible: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Verifica se há conflitos entre flags
  if (featureFlags.glassEffects && !featureFlags.modernComponents) {
    warnings.push('Glass effects requerem modern components para funcionar corretamente');
  }

  if (featureFlags.chartColors && !featureFlags.newColorSystem) {
    warnings.push('Chart colors requerem o novo sistema de cores para funcionar corretamente');
  }

  // Verifica suporte do navegador para CSS Custom Properties
  if (typeof window !== 'undefined') {
    const supportsCustomProperties = window.CSS && window.CSS.supports && window.CSS.supports('color', 'var(--test)');
    if (!supportsCustomProperties && featureFlags.newColorSystem) {
      errors.push('Navegador não suporta CSS Custom Properties. Considere usar fallbacks.');
    }
  }

  return {
    isCompatible: errors.length === 0,
    warnings,
    errors,
  };
}

/**
 * Função para migração gradual - permite ativar features por usuário/sessão
 */
export function enableFeatureForUser(userId: string, feature: keyof FeatureFlags): void {
  if (typeof window !== 'undefined') {
    const userFlags = JSON.parse(localStorage.getItem(`user-flags-${userId}`) || '{}');
    userFlags[feature] = true;
    localStorage.setItem(`user-flags-${userId}`, JSON.stringify(userFlags));
  }
}

/**
 * Função para obter flags específicas do usuário
 */
export function getUserFeatureFlags(userId: string): Partial<FeatureFlags> {
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem(`user-flags-${userId}`) || '{}');
  }
  return {};
}

/**
 * Função para rollback de features em caso de problemas
 */
export function rollbackFeature(feature: keyof FeatureFlags): void {
  if (typeof window !== 'undefined') {
    const rollbackFlags = JSON.parse(localStorage.getItem('rollback-flags') || '{}');
    rollbackFlags[feature] = false;
    localStorage.setItem('rollback-flags', JSON.stringify(rollbackFlags));
    
    // Dispara evento para notificar sistema de migração
    window.dispatchEvent(new CustomEvent('featureRollback', {
      detail: { feature, timestamp: Date.now() }
    }));
    
    // Força reload da página para aplicar mudanças
    window.location.reload();
  }
}

/**
 * Função para migração gradual por porcentagem de usuários
 */
export function shouldEnableFeatureForUser(
  feature: keyof FeatureFlags, 
  rolloutPercentage: number,
  userId?: string
): boolean {
  if (typeof window === 'undefined') return false;

  // Verifica se feature está forçadamente habilitada/desabilitada
  const forceEnabled = localStorage.getItem(`force-enable-${feature}`) === 'true';
  const forceDisabled = localStorage.getItem(`force-disable-${feature}`) === 'true';
  
  if (forceEnabled) return true;
  if (forceDisabled) return false;

  // Usa userId se fornecido, senão usa hash do user agent
  const identifier = userId || navigator.userAgent;
  const hash = hashString(identifier);
  const userPercentile = hash % 100;
  
  return userPercentile < rolloutPercentage;
}

/**
 * Função auxiliar para gerar hash de string
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Converte para 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Função para forçar habilitação de feature (para testes)
 */
export function forceEnableFeature(feature: keyof FeatureFlags): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`force-enable-${feature}`, 'true');
    localStorage.removeItem(`force-disable-${feature}`);
    
    // Notifica sistema de migração
    window.dispatchEvent(new CustomEvent('featureForceEnabled', {
      detail: { feature, timestamp: Date.now() }
    }));
  }
}

/**
 * Função para forçar desabilitação de feature (para testes)
 */
export function forceDisableFeature(feature: keyof FeatureFlags): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`force-disable-${feature}`, 'true');
    localStorage.removeItem(`force-enable-${feature}`);
    
    // Notifica sistema de migração
    window.dispatchEvent(new CustomEvent('featureForceDisabled', {
      detail: { feature, timestamp: Date.now() }
    }));
  }
}

/**
 * Função para obter estatísticas de uso das features
 */
export function getFeatureUsageStats(): Record<keyof FeatureFlags, boolean> {
  return { ...featureFlags };
}

// Exporta as flags para uso direto quando necessário
export { featureFlags as flags };