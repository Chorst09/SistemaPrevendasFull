import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TeamTabModuleNew, TeamMemberNew } from '../TeamTabModuleNew';

// Mock data for testing
const mockFullData = {
  project: {
    generalInfo: {
      userQuantity: 100
    },
    dimensioning: {
      incidentsPerUser: 1.5,
      tmaMinutes: 10,
      occupancyRate: 80,
      n1Distribution: 80,
      n1SixHourShift: false,
      coverageType: 'BUSINESS_HOURS'
    }
  }
};

const mockTeamData: TeamMemberNew[] = [];

const mockOnUpdate = jest.fn();
const mockOnUpdateSchedule = jest.fn();

describe('TeamTabModuleNew', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(
      <TeamTabModuleNew
        data={mockTeamData}
        onUpdate={mockOnUpdate}
        fullData={mockFullData}
        onUpdateSchedule={mockOnUpdateSchedule}
      />
    );
    
    expect(screen.getByText('Gestão de Equipe')).toBeInTheDocument();
  });

  it('should show empty state when no team members', () => {
    render(
      <TeamTabModuleNew
        data={[]}
        onUpdate={mockOnUpdate}
        fullData={mockFullData}
        onUpdateSchedule={mockOnUpdateSchedule}
      />
    );
    
    expect(screen.getByText('Nenhum cargo na equipe')).toBeInTheDocument();
    expect(screen.getByText('Dimensionar Equipe')).toBeInTheDocument();
  });

  it('should show dimensioning info when data is available', () => {
    render(
      <TeamTabModuleNew
        data={mockTeamData}
        onUpdate={mockOnUpdate}
        fullData={mockFullData}
        onUpdateSchedule={mockOnUpdateSchedule}
      />
    );
    
    expect(screen.getByText('Informações de Dimensionamento')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument(); // User quantity
    expect(screen.getByText('150')).toBeInTheDocument(); // Calculated calls per month
  });

  it('should enable dimensioning button when data is available', () => {
    render(
      <TeamTabModuleNew
        data={mockTeamData}
        onUpdate={mockOnUpdate}
        fullData={mockFullData}
        onUpdateSchedule={mockOnUpdateSchedule}
      />
    );
    
    const dimensionButton = screen.getAllByText('Dimensionar Equipe')[0];
    expect(dimensionButton).not.toBeDisabled();
  });

  it('should disable dimensioning button when data is not available', () => {
    render(
      <TeamTabModuleNew
        data={mockTeamData}
        onUpdate={mockOnUpdate}
        fullData={{}}
        onUpdateSchedule={mockOnUpdateSchedule}
      />
    );
    
    const dimensionButton = screen.getAllByText('Dimensionar Equipe')[0];
    expect(dimensionButton).toBeDisabled();
  });

  it('should call onUpdate when dimensioning team', async () => {
    render(
      <TeamTabModuleNew
        data={mockTeamData}
        onUpdate={mockOnUpdate}
        fullData={mockFullData}
        onUpdateSchedule={mockOnUpdateSchedule}
      />
    );
    
    const dimensionButton = screen.getAllByText('Dimensionar Equipe')[0];
    fireEvent.click(dimensionButton);
    
    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('should call onUpdateSchedule when dimensioning team', async () => {
    render(
      <TeamTabModuleNew
        data={mockTeamData}
        onUpdate={mockOnUpdate}
        fullData={mockFullData}
        onUpdateSchedule={mockOnUpdateSchedule}
      />
    );
    
    const dimensionButton = screen.getAllByText('Dimensionar Equipe')[0];
    fireEvent.click(dimensionButton);
    
    await waitFor(() => {
      expect(mockOnUpdateSchedule).toHaveBeenCalled();
    });
  });

  it('should render team members correctly', () => {
    const teamWithMembers: TeamMemberNew[] = [
      {
        id: 'member-1',
        jobPositionId: 'pos-1',
        quantity: 2,
        workingHours: 8,
        isActive: true,
        notes: 'Test member'
      }
    ];

    render(
      <TeamTabModuleNew
        data={teamWithMembers}
        onUpdate={mockOnUpdate}
        fullData={mockFullData}
        onUpdateSchedule={mockOnUpdateSchedule}
      />
    );
    
    expect(screen.getByText('2 pessoas')).toBeInTheDocument();
    expect(screen.getByText('8h')).toBeInTheDocument();
  });

  it('should show validation errors when provided', () => {
    const validation = {
      isValid: false,
      errors: ['Cargo do membro 1 é obrigatório'],
      warnings: [],
      completionPercentage: 50
    };

    render(
      <TeamTabModuleNew
        data={mockTeamData}
        onUpdate={mockOnUpdate}
        fullData={mockFullData}
        onUpdateSchedule={mockOnUpdateSchedule}
        validation={validation}
      />
    );
    
    expect(screen.getByText('Problemas encontrados:')).toBeInTheDocument();
    expect(screen.getByText('Cargo do membro 1 é obrigatório')).toBeInTheDocument();
  });
});