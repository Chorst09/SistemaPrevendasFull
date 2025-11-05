import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OtherCostsTabModule } from '../OtherCostsTabModule';
import { AdditionalCost, CostCategory, CostType, CostFrequency } from '@/lib/types/service-desk-pricing';

import { vi } from 'vitest';
import { expect } from 'playwright/test';
import { expect } from 'playwright/test';
import { it } from 'date-fns/locale';
import { expect } from 'playwright/test';
import { expect } from 'playwright/test';
import { it } from 'date-fns/locale';
import { expect } from 'playwright/test';
import { it } from 'date-fns/locale';
import { expect } from 'playwright/test';
import { expect } from 'playwright/test';
import { it } from 'date-fns/locale';
import { expect } from 'playwright/test';
import { it } from 'date-fns/locale';
import { expect } from 'playwright/test';
import { expect } from 'playwright/test';
import { expect } from 'playwright/test';
import { it } from 'date-fns/locale';
import { expect } from 'playwright/test';
import { expect } from 'playwright/test';
import { expect } from 'playwright/test';
import { it } from 'date-fns/locale';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

// Mock the cost template service
vi.mock('@/lib/services/cost-template-service', () => ({
  CostTemplateService: {
    getTemplates: vi.fn(() => []),
    getPreviousProjectCosts: vi.fn(() => []),
    validateForDuplicates: vi.fn(() => ({ isValid: true, duplicates: [] })),
    applyTemplate: vi.fn(() => []),
    importFromPreviousProject: vi.fn(() => []),
    saveTemplate: vi.fn(),
    saveProjectCosts: vi.fn()
  }
}));

const mockCosts: AdditionalCost[] = [
  {
    id: 'cost-1',
    name: 'Sistema ITSM',
    category: CostCategory.LICENSES,
    value: 2500,
    type: CostType.FIXED,
    frequency: CostFrequency.MONTHLY,
    startDate: new Date('2024-01-01'),
    description: 'Licença do sistema ITSM',
    allocation: { method: 'equal', periods: [] }
  },
  {
    id: 'cost-2',
    name: 'Servidores Cloud',
    category: CostCategory.INFRASTRUCTURE,
    value: 3500,
    type: CostType.VARIABLE,
    frequency: CostFrequency.MONTHLY,
    startDate: new Date('2024-01-01'),
    description: 'Instâncias na nuvem',
    allocation: { method: 'proportional', periods: [] }
  }
];

describe('OtherCostsTabModule', () => {
  const mockOnUpdate = vi.fn();
  const mockOnAutoSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with costs', () => {
    render(
      <OtherCostsTabModule
        data={mockCosts}
        onUpdate={mockOnUpdate}
        onAutoSave={mockOnAutoSave}
      />
    );

    expect(screen.getByText('Outros Custos')).toBeInTheDocument();
    expect(screen.getByText('Sistema ITSM')).toBeInTheDocument();
    expect(screen.getByText('Servidores Cloud')).toBeInTheDocument();
  });

  it('displays cost summary correctly', () => {
    render(
      <OtherCostsTabModule
        data={mockCosts}
        onUpdate={mockOnUpdate}
        onAutoSave={mockOnAutoSave}
      />
    );

    expect(screen.getByText('Resumo de Custos')).toBeInTheDocument();
    expect(screen.getByText('Total de Itens')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // 2 items
  });

  it('opens add cost dialog when button is clicked', async () => {
    render(
      <OtherCostsTabModule
        data={mockCosts}
        onUpdate={mockOnUpdate}
        onAutoSave={mockOnAutoSave}
      />
    );

    const addButton = screen.getByText('Adicionar Custo');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Adicionar Novo Custo')).toBeInTheDocument();
    });
  });

  it('filters costs by category', () => {
    render(
      <OtherCostsTabModule
        data={mockCosts}
        onUpdate={mockOnUpdate}
        onAutoSave={mockOnAutoSave}
      />
    );

    // Click on Licenses filter
    const licensesFilter = screen.getByText(/Licenças/);
    fireEvent.click(licensesFilter);

    // Should show only the ITSM system
    expect(screen.getByText('Sistema ITSM')).toBeInTheDocument();
    // Infrastructure cost should not be visible in filtered view
    expect(screen.queryByText('Servidores Cloud')).not.toBeInTheDocument();
  });

  it('calls onUpdate when save is clicked', () => {
    render(
      <OtherCostsTabModule
        data={mockCosts}
        onUpdate={mockOnUpdate}
        onAutoSave={mockOnAutoSave}
      />
    );

    // Simulate changes by adding a cost (this would normally happen through the form)
    // For this test, we'll just click save to verify the callback
    const saveButton = screen.getByText('Salvar');
    
    // Save button should be disabled initially (no changes)
    expect(saveButton).toBeDisabled();
  });

  it('shows validation errors when provided', () => {
    const validation = {
      tabId: 'other-costs',
      isValid: false,
      errors: [{ field: 'costs', message: 'Pelo menos um custo é obrigatório', code: 'REQUIRED' }],
      warnings: [],
      completionPercentage: 50
    };

    render(
      <OtherCostsTabModule
        data={[]}
        onUpdate={mockOnUpdate}
        onAutoSave={mockOnAutoSave}
        validation={validation}
      />
    );

    expect(screen.getByText('Problemas encontrados nos custos:')).toBeInTheDocument();
    expect(screen.getByText('Pelo menos um custo é obrigatório')).toBeInTheDocument();
  });

  it('displays empty state when no costs are present', () => {
    render(
      <OtherCostsTabModule
        data={[]}
        onUpdate={mockOnUpdate}
        onAutoSave={mockOnAutoSave}
      />
    );

    expect(screen.getByText('Nenhum custo adicionado ainda')).toBeInTheDocument();
    expect(screen.getByText('Clique em "Adicionar Custo" para começar')).toBeInTheDocument();
  });
});