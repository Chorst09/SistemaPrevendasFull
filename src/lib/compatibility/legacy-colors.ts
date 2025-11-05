/**
 * Camada de compatibilidade para cores legadas
 * Mapeia cores antigas para o novo sistema quando possível
 */

import { featureFlags } from '@/lib/feature-flags';

// Mapeamento de cores legadas para o novo sistema
export const legacyColorMap = {
  // Cores originais do blueprint
  'indigo-600': 'hsl(var(--primary))',
  'indigo-700': 'hsl(var(--primary-700))',
  'indigo-500': 'hsl(var(--primary-500))',
  'violet-400': 'hsl(var(--accent-purple))',
  'violet-500': 'hsl(var(--accent-purple))',
  'gray-50': 'hsl(var(--primary-50))',
  'gray-100': 'hsl(var(--primary-100))',
  'gray-200': 'hsl(var(--primary-200))',
  'gray-300': 'hsl(var(--primary-300))',
  'gray-400': 'hsl(var(--primary-400))',
  'gray-500': 'hsl(var(--primary-500))',
  'gray-600': 'hsl(var(--primary-600))',
  'gray-700': 'hsl(var(--primary-700))',
  'gray-800': 'hsl(var(--primary-800))',
  'gray-900': 'hsl(var(--primary-900))',
  
  // Cores semânticas comuns
  'blue-500': 'hsl(var(--accent-cyan))',
  'blue-600': 'hsl(var(--accent-cyan))',
  'orange-500': 'hsl(var(--accent-orange))',
  'orange-600': 'hsl(var(--accent-orange))',
  'yellow-500': 'hsl(var(--accent-yellow))',
  'yellow-600': 'hsl(var(--accent-yellow))',
  'green-500': 'hsl(var(--accent-green))',
  'green-600': 'hsl(var(--accent-green))',
  'red-500': 'hsl(var(--destructive))',
  'red-600': 'hsl(var(--destructive))',
  
  // Backgrounds comuns
  'white': 'hsl(var(--background))',
  'black': 'hsl(var(--foreground))',
  'transparent': 'transparent',
} as const;

// Classes Tailwind legadas mapeadas para o novo sistema
export const legacyClassMap = {
  // Backgrounds
  'bg-indigo-600': 'bg-primary',
  'bg-indigo-700': 'bg-primary-700',
  'bg-indigo-500': 'bg-primary-500',
  'bg-violet-400': 'bg-accent-purple',
  'bg-gray-50': 'bg-primary-50',
  'bg-gray-100': 'bg-primary-100',
  'bg-gray-800': 'bg-primary-800',
  'bg-gray-900': 'bg-primary-900',
  'bg-white': 'bg-background',
  'bg-blue-500': 'bg-accent-cyan',
  'bg-orange-500': 'bg-accent-orange',
  'bg-green-500': 'bg-accent-green',
  'bg-red-500': 'bg-destructive',
  
  // Text colors
  'text-indigo-600': 'text-primary',
  'text-indigo-700': 'text-primary-700',
  'text-violet-400': 'text-accent-purple',
  'text-gray-600': 'text-primary-600',
  'text-gray-700': 'text-primary-700',
  'text-gray-800': 'text-primary-800',
  'text-gray-900': 'text-foreground',
  'text-white': 'text-background',
  'text-black': 'text-foreground',
  'text-blue-500': 'text-accent-cyan',
  'text-orange-500': 'text-accent-orange',
  'text-green-500': 'text-accent-green',
  'text-red-500': 'text-destructive',
  
  // Border colors
  'border-indigo-600': 'border-primary',
  'border-gray-200': 'border-border',
  'border-gray-300': 'border-border',
  'border-blue-500': 'border-accent-cyan',
  'border-orange-500': 'border-accent-orange',
  'border-green-500': 'border-accent-green',
  'border-red-500': 'border-destructive',
  
  // Hover states
  'hover:bg-indigo-700': 'hover:bg-primary-700',
  'hover:bg-gray-100': 'hover:bg-primary-100',
  'hover:bg-gray-800': 'hover:bg-primary-800',
  'hover:text-indigo-600': 'hover:text-primary',
  'hover:text-blue-500': 'hover:text-accent-cyan',
  
  // Focus states
  'focus:border-indigo-500': 'focus:border-primary',
  'focus:ring-indigo-500': 'focus:ring-primary',
  'focus:border-blue-500': 'focus:border-accent-cyan',
  'focus:ring-blue-500': 'focus:ring-accent-cyan',
} as const;

/**
 * Converte uma cor legada para o novo sistema
 */
export function convertLegacyColor(legacyColor: string): string {
  if (!featureFlags.newColorSystem) {
    return legacyColor;
  }

  return legacyColorMap[legacyColor as keyof typeof legacyColorMap] || legacyColor;
}

/**
 * Converte uma classe CSS legada para o novo sistema
 */
export function convertLegacyClass(legacyClass: string): string {
  if (!featureFlags.newColorSystem) {
    return legacyClass;
  }

  return legacyClassMap[legacyClass as keyof typeof legacyClassMap] || legacyClass;
}

/**
 * Converte múltiplas classes CSS legadas
 */
export function convertLegacyClasses(classes: string): string {
  if (!featureFlags.newColorSystem) {
    return classes;
  }

  return classes
    .split(' ')
    .map(cls => convertLegacyClass(cls.trim()))
    .join(' ');
}

/**
 * Hook para usar cores com compatibilidade legada
 */
export function useLegacyCompatibleColor(color: string): string {
  return convertLegacyColor(color);
}

/**
 * Função para gerar CSS com fallbacks para navegadores antigos
 */
export function generateCSSWithFallbacks(property: string, newValue: string, fallbackValue: string): string {
  if (!featureFlags.newColorSystem) {
    return `${property}: ${fallbackValue};`;
  }

  return `
    ${property}: ${fallbackValue}; /* Fallback */
    ${property}: ${newValue}; /* Novo sistema */
  `;
}

/**
 * Objeto com estilos inline compatíveis
 */
export function getCompatibleInlineStyles(styles: Record<string, string>): Record<string, string> {
  if (!featureFlags.newColorSystem) {
    return styles;
  }

  const convertedStyles: Record<string, string> = {};
  
  Object.entries(styles).forEach(([property, value]) => {
    convertedStyles[property] = convertLegacyColor(value);
  });

  return convertedStyles;
}

/**
 * Função para detectar se uma cor é do sistema legado
 */
export function isLegacyColor(color: string): boolean {
  return Object.keys(legacyColorMap).includes(color);
}

/**
 * Função para obter todas as cores disponíveis (legadas + novas)
 */
export function getAllAvailableColors(): {
  legacy: string[];
  modern: string[];
  mapped: Record<string, string>;
} {
  return {
    legacy: Object.keys(legacyColorMap),
    modern: Object.values(legacyColorMap),
    mapped: legacyColorMap,
  };
}

/**
 * Função para validar se uma cor tem suporte adequado
 */
export function validateColorSupport(color: string): {
  isSupported: boolean;
  hasModernEquivalent: boolean;
  modernEquivalent?: string;
  recommendation: string;
} {
  const isLegacy = isLegacyColor(color);
  const modernEquivalent = isLegacy ? convertLegacyColor(color) : undefined;

  if (isLegacy && featureFlags.newColorSystem) {
    return {
      isSupported: true,
      hasModernEquivalent: true,
      modernEquivalent,
      recommendation: `Use ${modernEquivalent} em vez de ${color}`,
    };
  }

  if (!isLegacy && color.startsWith('hsl(var(--')) {
    return {
      isSupported: true,
      hasModernEquivalent: false,
      recommendation: 'Cor do novo sistema - OK',
    };
  }

  return {
    isSupported: false,
    hasModernEquivalent: false,
    recommendation: `Cor ${color} não é suportada pelo sistema atual`,
  };
}

/**
 * Função para migrar automaticamente um arquivo CSS
 */
export function migrateCSSFile(cssContent: string): {
  migratedCSS: string;
  changes: Array<{ from: string; to: string; line?: number }>;
} {
  const changes: Array<{ from: string; to: string; line?: number }> = [];
  let migratedCSS = cssContent;

  // Migra cores hexadecimais conhecidas
  const hexColorMap: Record<string, string> = {
    '#4F46E5': 'hsl(var(--primary))', // Deep indigo
    '#818CF8': 'hsl(var(--accent-purple))', // Soft violet
    '#F9FAFB': 'hsl(var(--background))', // Very light gray
  };

  Object.entries(hexColorMap).forEach(([hex, modern]) => {
    const regex = new RegExp(hex, 'gi');
    if (regex.test(migratedCSS)) {
      migratedCSS = migratedCSS.replace(regex, modern);
      changes.push({ from: hex, to: modern });
    }
  });

  // Migra classes Tailwind
  Object.entries(legacyClassMap).forEach(([legacy, modern]) => {
    const regex = new RegExp(`\\b${legacy}\\b`, 'g');
    if (regex.test(migratedCSS)) {
      migratedCSS = migratedCSS.replace(regex, modern);
      changes.push({ from: legacy, to: modern });
    }
  });

  return { migratedCSS, changes };
}

// Exporta mapeamentos para uso direto
export { legacyColorMap as colorMap, legacyClassMap as classMap };