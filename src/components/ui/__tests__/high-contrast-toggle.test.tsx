import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HighContrastToggle } from '../high-contrast-toggle';

// Mock the accessibility hook
vi.mock('@/hooks/use-accessibility', () => ({
  useContrastCheck: vi.fn(() => ({
    ratio: 21,
    level: 'AAA',
    isAccessible: true
  }))
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('HighContrastToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.className = '';
  });

  afterEach(() => {
    document.documentElement.className = '';
  });

  it('should render with normal mode by default', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<HighContrastToggle />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Enable high contrast mode');
    expect(screen.getByText('Normal')).toBeInTheDocument();
  });

  it('should render in high contrast mode when localStorage preference is set', async () => {
    localStorageMock.getItem.mockReturnValue('true');
    
    render(<HighContrastToggle />);
    
    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Disable high contrast mode');
      expect(screen.getByText('High Contrast')).toBeInTheDocument();
    });
  });

  it('should toggle high contrast mode when clicked', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<HighContrastToggle />);
    
    const button = screen.getByRole('button');
    
    // Initially in normal mode
    expect(button).toHaveAttribute('aria-label', 'Enable high contrast mode');
    
    // Click to enable high contrast
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('high-contrast-mode', 'true');
      expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
    });
  });

  it('should remove high contrast class when toggling off', async () => {
    localStorageMock.getItem.mockReturnValue('true');
    
    render(<HighContrastToggle />);
    
    // Wait for initial state to be set
    await waitFor(() => {
      expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
    });
    
    const button = screen.getByRole('button');
    
    // Click to disable high contrast
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('high-contrast-mode', 'false');
      expect(document.documentElement.classList.contains('high-contrast')).toBe(false);
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  it('should respect system preference when no localStorage setting exists', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    // Mock system preference for high contrast
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-contrast: high)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    
    render(<HighContrastToggle />);
    
    expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
  });

  it('should announce changes to screen readers', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<HighContrastToggle />);
    
    const button = screen.getByRole('button');
    
    // Mock document.body.appendChild and removeChild
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');
    
    // Get initial state
    const initialLabel = button.getAttribute('aria-label');
    const isInitiallyEnabled = initialLabel?.includes('Disable');
    
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(appendChildSpy).toHaveBeenCalled();
    });
    
    // Check that the announcement element was created
    const calls = appendChildSpy.mock.calls;
    const announcementElement = calls[calls.length - 1][0] as HTMLElement;
    const expectedMessage = isInitiallyEnabled 
      ? 'High contrast mode disabled' 
      : 'High contrast mode enabled';
    expect(announcementElement.textContent).toBe(expectedMessage);
    expect(announcementElement.getAttribute('aria-live')).toBe('polite');
    
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  it('should have proper accessibility attributes', () => {
    render(<HighContrastToggle />);
    
    const button = screen.getByRole('button');
    
    expect(button).toHaveAttribute('aria-label');
    expect(button).toHaveAttribute('title');
    
    // Check for screen reader content
    const srContent = screen.getByText(/High contrast mode is currently/);
    expect(srContent).toHaveClass('sr-only');
  });

  it('should display contrast ratio information in title', () => {
    render(<HighContrastToggle />);
    
    const button = screen.getByRole('button');
    
    expect(button).toHaveAttribute('title', expect.stringContaining('Current contrast ratio: 21 (AAA)'));
  });
});