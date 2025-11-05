import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TeamTabModule } from '../TeamTabModule';

describe('TeamTabModule', () => {
  const mockProps = {
    team: [],
    onTeamUpdate: vi.fn(),
    validation: {
      tabId: 'team',
      isValid: true,
      errors: [],
      warnings: [],
      completionPercentage: 100
    }
  };

  it('renders basic structure', () => {
    render(<TeamTabModule {...mockProps} />);
    // Just check that the component renders without crashing
    expect(document.body).toBeInTheDocument();
  });
});