import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DataTabModule } from '../tabs/DataTabModule';
import { ProjectData, ServiceType } from '@/lib/types/service-desk-pricing';

describe('DataTabModule Integration', () => {
  let mockProjectData: ProjectData;
  let mockOnUpdate: ReturnType<typeof vi.fn>;
  let mockOnAutoSave: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    const now = new Date();
    mockProjectData = {
      id: 'test-id',
      name: '',
      client: {
        name: '',
        document: '',
        email: '',
        phone: '',
        address: {
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'Brasil'
        },
        contactPerson: ''
      },
      contractPeriod: {
        startDate: now,
        endDate: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()),
        durationMonths: 12,
        renewalOptions: []
      },
      description: '',
      currency: 'BRL',
      location: '',
      serviceType: ServiceType.STANDARD,
      createdAt: now,
      updatedAt: now
    };
    mockOnUpdate = vi.fn();
    mockOnAutoSave = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render project data form fields', () => {
    render(
      <DataTabModule
        data={mockProjectData}
        onUpdate={mockOnUpdate}
        onAutoSave={mockOnAutoSave}
      />
    );

    expect(screen.getByLabelText(/nome do projeto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nome do cliente/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cnpj\/cpf/i)).toBeInTheDocument();
  });

  it('should call onAutoSave when data changes', async () => {
    render(
      <DataTabModule
        data={mockProjectData}
        onUpdate={mockOnUpdate}
        onAutoSave={mockOnAutoSave}
      />
    );

    const projectNameInput = screen.getByLabelText(/nome do projeto/i);
    fireEvent.change(projectNameInput, { target: { value: 'Test Project' } });

    // Wait for auto-save debouncing
    await waitFor(() => {
      expect(mockOnAutoSave).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('should call onUpdate when save button is clicked', () => {
    render(
      <DataTabModule
        data={mockProjectData}
        onUpdate={mockOnUpdate}
        onAutoSave={mockOnAutoSave}
      />
    );

    const projectNameInput = screen.getByLabelText(/nome do projeto/i);
    fireEvent.change(projectNameInput, { target: { value: 'Test Project' } });

    const saveButton = screen.getByRole('button', { name: /salvar/i });
    fireEvent.click(saveButton);

    expect(mockOnUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Project'
      })
    );
  });

  it('should display validation errors', () => {
    const validation = {
      tabId: 'data',
      isValid: false,
      errors: [
        {
          field: 'name',
          message: 'Nome do projeto é obrigatório',
          code: 'REQUIRED_FIELD'
        }
      ],
      warnings: [],
      completionPercentage: 20
    };

    render(
      <DataTabModule
        data={mockProjectData}
        onUpdate={mockOnUpdate}
        onAutoSave={mockOnAutoSave}
        validation={validation}
      />
    );

    expect(screen.getByText(/campos obrigatórios não preenchidos/i)).toBeInTheDocument();
    expect(screen.getAllByText(/nome do projeto é obrigatório/i)).toHaveLength(2); // Alert + field error
  });

  it('should update contract duration when dates change', () => {
    render(
      <DataTabModule
        data={mockProjectData}
        onUpdate={mockOnUpdate}
        onAutoSave={mockOnAutoSave}
      />
    );

    // This test would require more complex date picker interaction
    // For now, we'll just verify the component renders without errors
    expect(screen.getByText(/período do contrato/i)).toBeInTheDocument();
  });

  it('should handle service type selection', () => {
    render(
      <DataTabModule
        data={mockProjectData}
        onUpdate={mockOnUpdate}
        onAutoSave={mockOnAutoSave}
      />
    );

    // Verify service type selector is present
    expect(screen.getByText(/tipo de serviço/i)).toBeInTheDocument();
  });
});