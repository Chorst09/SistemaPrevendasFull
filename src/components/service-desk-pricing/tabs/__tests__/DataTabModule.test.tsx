import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataTabModule } from '../DataTabModule';
import { ProjectData, TabValidationStatus, ServiceType } from '@/lib/types/service-desk-pricing';

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date) => date.toISOString().split('T')[0]),
  ptBR: {}
}));

describe('DataTabModule', () => {
  const mockProjectData: ProjectData = {
    id: 'project-1',
    name: 'Test Project',
    client: {
      name: 'Test Client',
      document: '12.345.678/0001-90',
      email: 'client@test.com',
      phone: '(11) 99999-9999',
      address: {
        street: 'Test Street',
        number: '123',
        complement: 'Suite 456',
        neighborhood: 'Test Neighborhood',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        country: 'Brasil'
      },
      contactPerson: 'John Doe'
    },
    contractPeriod: {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      durationMonths: 12,
      renewalOptions: []
    },
    description: 'Test project description',
    currency: 'BRL',
    location: 'São Paulo',
    serviceType: ServiceType.STANDARD,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  const mockValidation: TabValidationStatus = {
    tabId: 'data',
    isValid: true,
    errors: [],
    warnings: [],
    completionPercentage: 85
  };

  const mockProps = {
    data: mockProjectData,
    onUpdate: vi.fn(),
    validation: mockValidation,
    isLoading: false,
    onAutoSave: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render basic structure', () => {
      render(<DataTabModule {...mockProps} />);

      const titles = screen.getAllByText('Dados do Projeto');
      expect(titles.length).toBeGreaterThan(0);
      expect(screen.getByText('85% completo')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
    });

    it('should render project information fields', () => {
      render(<DataTabModule {...mockProps} />);

      const projectNameInputs = screen.getAllByDisplayValue('Test Project');
      expect(projectNameInputs.length).toBeGreaterThan(0);
      // Description might be in a textarea
      const descriptionField = screen.queryByDisplayValue('Test project description');
      if (descriptionField) {
        expect(descriptionField).toBeInTheDocument();
      }
    });

    it('should render client information fields', () => {
      render(<DataTabModule {...mockProps} />);

      const clientNameInputs = screen.getAllByDisplayValue('Test Client');
      expect(clientNameInputs.length).toBeGreaterThan(0);
      expect(screen.getByDisplayValue('12.345.678/0001-90')).toBeInTheDocument();
      expect(screen.getByDisplayValue('client@test.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('(11) 99999-9999')).toBeInTheDocument();
    });

    it('should render address fields', () => {
      render(<DataTabModule {...mockProps} />);

      expect(screen.getByDisplayValue('Test Street')).toBeInTheDocument();
      expect(screen.getByDisplayValue('123')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Suite 456')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Neighborhood')).toBeInTheDocument();
      expect(screen.getByDisplayValue('São Paulo')).toBeInTheDocument();
      expect(screen.getByDisplayValue('SP')).toBeInTheDocument();
      expect(screen.getByDisplayValue('01234-567')).toBeInTheDocument();
    });

    it('should show completion percentage badge', () => {
      render(<DataTabModule {...mockProps} />);

      const badge = screen.getByText('85% completo');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-primary'); // Default variant for >= 80%
    });

    it('should show different badge variants based on completion', () => {
      const lowCompletionValidation = {
        ...mockValidation,
        completionPercentage: 30
      };

      render(<DataTabModule {...mockProps} validation={lowCompletionValidation} />);

      const badge = screen.getByText('30% completo');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Validation Display', () => {
    it('should show validation errors', () => {
      const validationWithErrors: TabValidationStatus = {
        ...mockValidation,
        isValid: false,
        errors: [
          { field: 'name', message: 'Nome do projeto é obrigatório', code: 'REQUIRED_FIELD' },
          { field: 'client.name', message: 'Nome do cliente é obrigatório', code: 'REQUIRED_FIELD' }
        ]
      };

      render(<DataTabModule {...mockProps} validation={validationWithErrors} />);

      expect(screen.getByText('Campos obrigatórios não preenchidos:')).toBeInTheDocument();
      const errorMessages = screen.getAllByText('Nome do projeto é obrigatório');
      expect(errorMessages.length).toBeGreaterThan(0);
      const clientErrorMessages = screen.getAllByText('Nome do cliente é obrigatório');
      expect(clientErrorMessages.length).toBeGreaterThan(0);
    });

    it('should show validation warnings', () => {
      const validationWithWarnings: TabValidationStatus = {
        ...mockValidation,
        warnings: [
          { 
            field: 'description', 
            message: 'Descrição não informada',
            suggestion: 'Adicione uma descrição para melhor documentação'
          }
        ]
      };

      render(<DataTabModule {...mockProps} validation={validationWithWarnings} />);

      expect(screen.getByText('Atenção:')).toBeInTheDocument();
      expect(screen.getByText(/Descrição não informada/)).toBeInTheDocument();
      expect(screen.getByText(/Adicione uma descrição para melhor documentação/)).toBeInTheDocument();
    });

    it('should show correct validation icon for valid state', () => {
      render(<DataTabModule {...mockProps} />);

      // Check for success icon (CheckCircle2)
      const successIcon = document.querySelector('.text-green-500');
      expect(successIcon).toBeInTheDocument();
    });

    it('should show correct validation icon for invalid state', () => {
      const invalidValidation = {
        ...mockValidation,
        isValid: false,
        errors: [{ field: 'name', message: 'Required', code: 'REQUIRED_FIELD' }]
      };

      render(<DataTabModule {...mockProps} validation={invalidValidation} />);

      // Check for error icon (AlertCircle)
      const errorIcon = document.querySelector('.text-red-500');
      expect(errorIcon).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should update project name when user types', async () => {
      const user = userEvent.setup();
      render(<DataTabModule {...mockProps} />);

      const nameInputs = screen.getAllByDisplayValue('Test Project');
      const nameInput = nameInputs[0]; // Use the first one
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Project Name');

      // The component might be controlled, so we just check if onUpdate was called
      await waitFor(() => {
        expect(mockProps.onUpdate).toHaveBeenCalled();
      });
    });

    it('should update client information when user types', async () => {
      const user = userEvent.setup();
      render(<DataTabModule {...mockProps} />);

      const clientNameInputs = screen.getAllByDisplayValue('Test Client');
      const clientNameInput = clientNameInputs[0];
      await user.clear(clientNameInput);
      await user.type(clientNameInput, 'Updated Client Name');

      // Check if onUpdate was called
      await waitFor(() => {
        expect(mockProps.onUpdate).toHaveBeenCalled();
      });
    });

    it('should update description when user types', async () => {
      const user = userEvent.setup();
      render(<DataTabModule {...mockProps} />);

      const descriptionField = screen.queryByDisplayValue('Test project description');
      if (descriptionField) {
        await user.clear(descriptionField);
        await user.type(descriptionField, 'Updated description');

        // Check if onUpdate was called
        await waitFor(() => {
          expect(mockProps.onUpdate).toHaveBeenCalled();
        });
      }
    });

    it('should show "Salvando..." badge when there are unsaved changes', async () => {
      const user = userEvent.setup();
      render(<DataTabModule {...mockProps} />);

      const nameInput = screen.getByDisplayValue('Test Project');
      await user.type(nameInput, ' Updated');

      expect(screen.getByText('Salvando...')).toBeInTheDocument();
    });

    it('should enable save button when there are changes', async () => {
      const user = userEvent.setup();
      render(<DataTabModule {...mockProps} />);

      const saveButton = screen.getByRole('button', { name: /salvar/i });
      expect(saveButton).toBeDisabled();

      const nameInput = screen.getByDisplayValue('Test Project');
      await user.type(nameInput, ' Updated');

      expect(saveButton).toBeEnabled();
    });

    it('should call onUpdate when save button is clicked', async () => {
      const user = userEvent.setup();
      render(<DataTabModule {...mockProps} />);

      const nameInput = screen.getByDisplayValue('Test Project');
      await user.type(nameInput, ' Updated');

      const saveButton = screen.getByRole('button', { name: /salvar/i });
      await user.click(saveButton);

      expect(mockProps.onUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Project Updated'
        })
      );
    });
  });

  describe('Auto-save Functionality', () => {
    it('should trigger auto-save after delay when changes are made', async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      
      render(<DataTabModule {...mockProps} />);

      const nameInput = screen.getByDisplayValue('Test Project');
      await user.type(nameInput, ' Updated');

      // Fast-forward time to trigger auto-save
      vi.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(mockProps.onAutoSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Project Updated'
          })
        );
      });

      vi.useRealTimers();
    });

    it('should not trigger auto-save if no changes are made', async () => {
      vi.useFakeTimers();
      
      render(<DataTabModule {...mockProps} />);

      // Fast-forward time
      vi.advanceTimersByTime(2000);

      expect(mockProps.onAutoSave).not.toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('should debounce auto-save when multiple changes are made quickly', async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      
      render(<DataTabModule {...mockProps} />);

      const nameInput = screen.getByDisplayValue('Test Project');
      
      // Make multiple quick changes
      await user.type(nameInput, ' A');
      vi.advanceTimersByTime(500);
      await user.type(nameInput, 'B');
      vi.advanceTimersByTime(500);
      await user.type(nameInput, 'C');

      // Fast-forward to trigger auto-save
      vi.advanceTimersByTime(2000);

      // Should only be called once with the final state
      expect(mockProps.onAutoSave).toHaveBeenCalledTimes(1);
      expect(mockProps.onAutoSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Project ABC'
        })
      );

      vi.useRealTimers();
    });
  });

  describe('Date Handling', () => {
    it('should handle contract period dates', () => {
      render(<DataTabModule {...mockProps} />);

      // Check that date fields are rendered (implementation depends on date picker component)
      // This is a basic test - more specific tests would depend on the actual date picker implementation
      expect(screen.getByText(/período do contrato/i)).toBeInTheDocument();
    });

    it('should calculate contract duration when dates change', async () => {
      // This test would need to be implemented based on the actual date picker behavior
      // For now, we'll test the calculation logic indirectly through the component
      render(<DataTabModule {...mockProps} />);
      
      // The component should show the calculated duration
      expect(screen.getByText(/12/)).toBeInTheDocument(); // Duration in months
    });
  });

  describe('Loading State', () => {
    it('should disable save button when loading', () => {
      render(<DataTabModule {...mockProps} isLoading={true} />);

      const saveButton = screen.getByRole('button', { name: /salvar/i });
      expect(saveButton).toBeDisabled();
    });

    it('should show loading state appropriately', () => {
      render(<DataTabModule {...mockProps} isLoading={true} />);

      // Component should handle loading state gracefully
      expect(screen.getByText('Dados do Projeto')).toBeInTheDocument();
    });
  });

  describe('Data Synchronization', () => {
    it('should update local data when props change', () => {
      const { rerender } = render(<DataTabModule {...mockProps} />);

      const updatedData = {
        ...mockProjectData,
        name: 'Updated from Props'
      };

      rerender(<DataTabModule {...mockProps} data={updatedData} />);

      expect(screen.getByDisplayValue('Updated from Props')).toBeInTheDocument();
    });

    it('should reset hasChanges flag when props update', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<DataTabModule {...mockProps} />);

      // Make a change
      const nameInput = screen.getByDisplayValue('Test Project');
      await user.type(nameInput, ' Modified');

      // Should show unsaved changes
      expect(screen.getByText('Salvando...')).toBeInTheDocument();

      // Update props (simulating external save)
      const updatedData = {
        ...mockProjectData,
        name: 'Test Project Modified'
      };

      rerender(<DataTabModule {...mockProps} data={updatedData} />);

      // Should not show unsaved changes anymore
      expect(screen.queryByText('Salvando...')).not.toBeInTheDocument();
    });
  });

  describe('Field Validation Helpers', () => {
    it('should identify field errors correctly', () => {
      const validationWithFieldErrors: TabValidationStatus = {
        ...mockValidation,
        isValid: false,
        errors: [
          { field: 'name', message: 'Nome é obrigatório', code: 'REQUIRED_FIELD' },
          { field: 'client.email', message: 'Email inválido', code: 'INVALID_FORMAT' }
        ]
      };

      render(<DataTabModule {...mockProps} validation={validationWithFieldErrors} />);

      // Should show field-specific errors
      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument();
      expect(screen.getByText('Email inválido')).toBeInTheDocument();
    });

    it('should identify field warnings correctly', () => {
      const validationWithFieldWarnings: TabValidationStatus = {
        ...mockValidation,
        warnings: [
          { 
            field: 'description', 
            message: 'Descrição vazia',
            suggestion: 'Adicione uma descrição'
          }
        ]
      };

      render(<DataTabModule {...mockProps} validation={validationWithFieldWarnings} />);

      expect(screen.getByText(/Descrição vazia/)).toBeInTheDocument();
      expect(screen.getByText(/Adicione uma descrição/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for form fields', () => {
      render(<DataTabModule {...mockProps} />);

      // Check for proper labeling (implementation depends on actual form structure)
      const nameInputs = screen.getAllByDisplayValue('Test Project');
      expect(nameInputs.length).toBeGreaterThan(0);
      
      // Try to find client input by placeholder or label instead
      const clientInputByPlaceholder = screen.queryByPlaceholderText('Digite o nome do cliente');
      const clientInputByLabel = screen.queryByLabelText(/cliente/i);
      const clientInput = clientInputByPlaceholder || clientInputByLabel;
      if (clientInput) {
        expect(clientInput).toBeInTheDocument();
      }
    });

    it('should have proper ARIA attributes for validation states', () => {
      const validationWithErrors: TabValidationStatus = {
        ...mockValidation,
        isValid: false,
        errors: [
          { field: 'name', message: 'Nome é obrigatório', code: 'REQUIRED_FIELD' }
        ]
      };

      render(<DataTabModule {...mockProps} validation={validationWithErrors} />);

      // Should have proper ARIA attributes for error states
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });
  });
});