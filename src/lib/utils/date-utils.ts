/**
 * Utility functions for safe date handling
 */

/**
 * Safely converts a value to a Date object and formats it
 * @param value - Date, string, or number to convert
 * @param locale - Locale for formatting (default: 'pt-BR')
 * @returns Formatted date string or fallback
 */
export function safeFormatDate(
  value: Date | string | number | null | undefined,
  locale: string = 'pt-BR'
): string {
  if (!value) {
    return 'Data não disponível';
  }

  try {
    const date = new Date(value);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Data inválida';
    }
    
    return date.toLocaleDateString(locale);
  } catch (error) {
    console.warn('Error formatting date:', error);
    return 'Erro na data';
  }
}

/**
 * Safely converts a value to a Date object and formats it with time
 * @param value - Date, string, or number to convert
 * @param locale - Locale for formatting (default: 'pt-BR')
 * @returns Formatted datetime string or fallback
 */
export function safeFormatDateTime(
  value: Date | string | number | null | undefined,
  locale: string = 'pt-BR'
): string {
  if (!value) {
    return 'Data não disponível';
  }

  try {
    const date = new Date(value);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Data inválida';
    }
    
    return date.toLocaleString(locale);
  } catch (error) {
    console.warn('Error formatting datetime:', error);
    return 'Erro na data';
  }
}

/**
 * Safely converts a value to a Date object
 * @param value - Date, string, or number to convert
 * @returns Date object or null if invalid
 */
export function safeToDate(
  value: Date | string | number | null | undefined
): Date | null {
  if (!value) {
    return null;
  }

  try {
    const date = new Date(value);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return null;
    }
    
    return date;
  } catch (error) {
    console.warn('Error converting to date:', error);
    return null;
  }
}

/**
 * Checks if a value is a valid date
 * @param value - Value to check
 * @returns True if valid date
 */
export function isValidDate(value: any): boolean {
  if (!value) return false;
  
  try {
    const date = new Date(value);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
}