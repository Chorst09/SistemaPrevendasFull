/**
 * Helper para usar localStorage de forma segura no SSR
 */

export const isClient = typeof window !== 'undefined';

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (!isClient) return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('Error accessing localStorage:', error);
      return null;
    }
  },

  setItem: (key: string, value: string): void => {
    if (!isClient) return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('Error writing to localStorage:', error);
    }
  },

  removeItem: (key: string): void => {
    if (!isClient) return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Error removing from localStorage:', error);
    }
  },

  clear: (): void => {
    if (!isClient) return;
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Error clearing localStorage:', error);
    }
  },

  key: (index: number): string | null => {
    if (!isClient) return null;
    try {
      return localStorage.key(index);
    } catch (error) {
      console.warn('Error accessing localStorage key:', error);
      return null;
    }
  },

  get length(): number {
    if (!isClient) return 0;
    try {
      return localStorage.length;
    } catch (error) {
      console.warn('Error getting localStorage length:', error);
      return 0;
    }
  }
};
