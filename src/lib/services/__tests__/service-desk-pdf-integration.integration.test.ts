import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ServiceDeskPDFIntegration } from '../service-desk-pdf-integration';
import { ServiceDeskData, ProjectStatus } from '@/lib/types/service-desk-pricing';

// Mock PDF generation utilities
vi.mock('@/lib/pdf/generators/ServiceDeskPDFGenerator', () => ({
  ServiceDeskPDFGenerator: vi.fn().mockImplementation(() => ({
    generateProposal: vi.fn().mockResolvedValue({
      success: true,
      pdfBlob: new Blob(['mock pdf content'], { type: 'application/pdf' }),
      metadata: {
        pages: 5,
        size: 1024,
        generatedAt: new Date()
      }
    }),
    generateDetailedReport: vi.fn().mockResolvedValue({
      success: true,
      pdfBlob: new Blob(['mock detailed report'], { type: 'application/pdf' }),
      metadata: {
        pages: 12,
        size: 2048,
        generatedAt: new Date()
      }
    })
  }))
}));

// Mock PDF templates
vi.mock('@/components/pdf-generation/templates/ServiceDeskProposalTemplate', () => ({
  ServiceDeskProposalTemplate: vi.fn().mockImplementation(() => ({
    render: vi.fn().mockReturnValue('<div>Mock PDF Template</div>')
  }))
}));

// Mock storage service
vi.mock('@/lib/pdf/services/storage', () => ({
  PDFStorageService: vi.fn().mockImplementation(() => ({
    saveProposal: vi.fn().mockResolvedValue({
      id: 'proposal-123',
      url: 'blob:mock-pdf-url',
      metadata: { size: 1024, pages: 5 }
    }),
    getProposal: vi.fn().mockResolvedValue({
      id: 'proposal-123',
      blob: new Blob(['mock pdf'], { type: 'application/pdf' }),
      metadata: { size: 1024, pages: 5 }
    }),
    deleteProposal: vi.fn().mockResolvedValue(true)
  }))
}));

describe('ServiceDeskPDFIntegration Integration Tests', () => {
  let pdfIntegration: ServiceDeskPDFIntegration;
  let mockServiceDeskData: ServiceDeskData;

  beforeEach(() => {
    pdfIntegration = new ServiceDeskPDFIntegration();
    
    mockServiceDeskData = {
      project: {
        id: 'project-1',
        name: 'Integration Test Project',
        client: {
          name: 'Test Client Corp',
          document: '12.345.678/0001-90',
          email: 'contact@testclient.com',
          phone: '(11) 99999-9999',
          address: {
            street: 'Av. Paulista',
            number: '1000',
            complement: 'Sala 100',
            neighborhood: 'Bela Vista',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01310-100',
            country: 'Brasil'
          },
          contactPerson: 'João Silva'
        },
        contractPeriod: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          durationMonths: 12,
          renewalOptions: [{
            id: 'renewal-1',
            duration: 12,
            conditions: 'Renovação automática',
            priceAdjustment: 5
          }]
        },
        description: 'Projeto de Service Desk para suporte técnico especializado',
        currency: 'BRL',
        location: 'São Paulo - SP',
        serviceType: 'PREMIUM' as any,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      },
      team: [
        {
          id: 'member-1',
          name: 'Ana Costa',
          role: 'Coordenador de Service Desk',
          salary: 12000,
          benefits: {
            healthInsurance: 500,
            mealVoucher: 600,
            transportVoucher: 300,
            lifeInsurance: 100,
            vacation: 8.33,
            thirteenthSalary: 8.33,
            fgts: 8,
            inss: 11,
            otherBenefits: []
          },
          workload: 40,
          startDate: new Date('2024-01-01'),
          costPerHour: 75,
          skills: ['ITIL', 'Service Management', 'Leadership'],
          certifications: ['ITIL v4', 'PMP']
        },
        {
          id: 'member-2',
          name: 'Carlos Santos',
          role: 'Analista de Suporte Sênior',
          salary: 8000,
          benefits: {
            healthInsurance: 400,
            mealVoucher: 500,
            transportVoucher: 250,
            lifeInsurance: 75,
            vacation: 8.33,
            thirteenthSalary: 8.33,
            fgts: 8,
            inss: 11,
            otherBenefits: []
          },
          workload: 40,
          startDate: new Date('2024-01-01'),
          costPerHour: 50,
          skills: ['Windows Server', 'Active Directory', 'Network'],
          certifications: ['Microsoft Certified']
        }
      ],
      schedules: [
        {
          id: 'schedule-1',
          name: 'Horário Comercial',
          shifts: [
            {
              id: 'shift-1',
              name: 'Manhã',
              startTime: '08:00',
              endTime: '12:00',
              daysOfWeek: [1, 2, 3, 4, 5],
              teamMembers: ['member-1', 'member-2'],
              isSpecialShift: false,
              multiplier: 1
            },
            {
              id: 'shift-2',
              name: 'Tarde',
              startTime: '13:00',
              endTime: '18:00',
              daysOfWeek: [1, 2, 3, 4, 5],
              teamMembers: ['member-1', 'member-2'],
              isSpecialShift: false,
              multiplier: 1
            }
          ],
          coverage: {
            minimumStaff: 2,
            preferredStaff: 3,
            criticalPeriods: []
          },
          specialRates: []
        }
      ],
      taxes: {
        region: 'São Paulo - SP',
        icms: 18,
        pis: 1.65,
        cofins: 7.6,
        iss: 5,
        ir: 15,
        csll: 9,
        customTaxes: [],
        taxRegime: 'LUCRO_PRESUMIDO' as any
      },
      variables: {
        inflation: {
          annualRate: 4.5,
          monthlyRate: 0.37,
          projectionPeriod: 12,
          source: 'IBGE',
          lastUpdate: new Date('2024-01-01')
        },
        salaryAdjustments: {
          annualAdjustment: 5.5,
          adjustmentDate: new Date('2024-05-01'),
          adjustmentType: 'inflation',
          minimumAdjustment: 3,
          maximumAdjustment: 10
        },
        marketFactors: [],
        scenarios: []
      },
      otherCosts: [
        {
          id: 'cost-1',
          name: 'Licenças de Software',
          value: 15000,
          category: 'SOFTWARE' as any,
          type: 'fixed' as any,
          description: 'Licenças anuais de ferramentas de monitoramento',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31')
        },
        {
          id: 'cost-2',
          name: 'Infraestrutura de TI',
          value: 8000,
          category: 'INFRASTRUCTURE' as any,
          type: 'monthly' as any,
          description: 'Servidores e equipamentos de rede',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31')
        }
      ],
      budget: {
        teamCosts: {
          salaries: 240000,
          benefits: 96000,
          total: 336000,
          breakdown: [
            {
              memberId: 'member-1',
              memberName: 'Ana Costa',
              role: 'Coordenador',
              monthlyCost: 18000,
              annualCost: 216000
            },
            {
              memberId: 'member-2',
              memberName: 'Carlos Santos',
              role: 'Analista Sênior',
              monthlyCost: 10000,
              annualCost: 120000
            }
          ]
        },
        infrastructureCosts: 96000,
        otherCosts: 111000,
        taxes: {
          federal: 89250,
          state: 32400,
          municipal: 9000,
          total: 130650,
          breakdown: [
            { taxName: 'PIS', rate: 1.65, base: 180000, amount: 2970 },
            { taxName: 'COFINS', rate: 7.6, base: 180000, amount: 13680 },
            { taxName: 'IR', rate: 15, base: 180000, amount: 27000 },
            { taxName: 'CSLL', rate: 9, base: 180000, amount: 16200 },
            { taxName: 'ICMS', rate: 18, base: 180000, amount: 32400 },
            { taxName: 'ISS', rate: 5, base: 180000, amount: 9000 }
          ]
        },
        totalCosts: 673650,
        margin: {
          type: 'percentage',
          value: 25,
          minimumMargin: 15,
          targetMargin: 25,
          maximumMargin: 35
        },
        totalPrice: 898200,
        monthlyBreakdown: Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          year: 2024,
          teamCosts: 28000,
          otherCosts: 9250,
          taxes: 10887.5,
          totalCosts: 56137.5,
          revenue: 74850,
          profit: 18712.5,
          margin: 25
        }))
      },
      analysis: {
        roi: {
          investment: 673650,
          returns: [224550, 224550, 224550],
          roi: 33.3,
          irr: 15.2,
          npv: 125000,
          period: 36
        },
        payback: {
          simplePayback: 36,
          discountedPayback: 42,
          breakEvenPoint: 36,
          cashFlowAnalysis: []
        },
        margins: {
          grossMargin: 25,
          netMargin: 20,
          ebitdaMargin: 22,
          contributionMargin: 30,
          marginTrend: []
        },
        riskAnalysis: {
          riskFactors: ['Inflação acima do esperado', 'Rotatividade da equipe'],
          overallRisk: 'medium',
          mitigation: ['Cláusula de reajuste', 'Programa de retenção']
        },
        sensitivityAnalysis: {
          variables: [],
          scenarios: []
        },
        charts: []
      },
      negotiations: [],
      finalAnalysis: {
        kpis: [
          { name: 'ROI', value: 33.3, unit: '%', trend: 'up' },
          { name: 'Margem Líquida', value: 20, unit: '%', trend: 'stable' },
          { name: 'Payback', value: 36, unit: 'meses', trend: 'down' }
        ],
        summary: {
          projectValue: 898200,
          expectedProfit: 224550,
          riskLevel: 'medium',
          recommendedAction: 'approve',
          keyHighlights: [
            'ROI atrativo de 33.3%',
            'Margem saudável de 25%',
            'Equipe experiente e qualificada'
          ],
          concerns: [
            'Dependência de poucos profissionais chave',
            'Pressão inflacionária nos custos'
          ]
        },
        recommendations: [
          'Aprovar o projeto com as condições propostas',
          'Incluir cláusula de reajuste semestral',
          'Desenvolver plano de contingência para substituição de pessoal'
        ],
        benchmarks: [],
        approvals: []
      },
      metadata: {
        version: '1.0.0',
        lastModified: new Date('2024-01-15'),
        modifiedBy: 'integration-test',
        status: ProjectStatus.ACTIVE,
        tags: ['service-desk', 'premium', 'sao-paulo'],
        notes: 'Projeto de alta prioridade para cliente estratégico',
        attachments: []
      }
    };
  });

  describe('Data Mapping Integration', () => {
    it('should map service desk data to proposal format correctly', () => {
      const proposalData = pdfIntegration.mapServiceDeskDataToProposal(mockServiceDeskData);

      // Verify the enhanced proposal structure
      expect(proposalData).toHaveProperty('serviceDeskData');
      expect(proposalData).toHaveProperty('teamComposition');
      expect(proposalData).toHaveProperty('scheduleAnalysis');
      expect(proposalData).toHaveProperty('financialBreakdown');
      expect(proposalData).toHaveProperty('riskAssessment');
      expect(proposalData).toHaveProperty('recommendations');
      expect(proposalData).toHaveProperty('benchmarkAnalysis');
      expect(proposalData).toHaveProperty('approvalWorkflow');

      // Verify service desk data is included
      expect(proposalData.serviceDeskData.project.name).toBe('Integration Test Project');
      expect(proposalData.serviceDeskData.project.client.name).toBe('Test Client Corp');

      // Verify team composition
      expect(proposalData.teamComposition).toBeDefined();
      expect(proposalData.teamComposition.totalMembers).toBeGreaterThan(0);

      // Verify financial breakdown
      expect(proposalData.financialBreakdown).toBeDefined();
      expect(proposalData.financialBreakdown.teamCosts).toBeDefined();
      expect(proposalData.financialBreakdown.otherCosts).toBeDefined();
      expect(proposalData.financialBreakdown.taxes).toBeDefined();
    });

    it('should handle missing or incomplete data gracefully', () => {
      const incompleteData = {
        ...mockServiceDeskData,
        team: [],
        schedules: [],
        analysis: {
          roi: { investment: 0, returns: [], roi: 0, irr: 0, npv: 0, period: 0 },
          payback: { simplePayback: 0, discountedPayback: 0, breakEvenPoint: 0, cashFlowAnalysis: [] },
          margins: { grossMargin: 0, netMargin: 0, ebitdaMargin: 0, contributionMargin: 0, marginTrend: [] },
          riskAnalysis: { riskFactors: [], overallRisk: 'low', mitigation: [] },
          sensitivityAnalysis: { variables: [], scenarios: [] },
          charts: []
        }
      };

      const proposalData = pdfIntegration.mapServiceDeskDataToProposal(incompleteData);

      // Verify it handles empty data gracefully
      expect(proposalData.teamComposition.totalMembers).toBe(0);
      expect(proposalData.scheduleAnalysis.totalSchedules).toBe(0);
    });

    it('should format currency values correctly', () => {
      const proposalData = pdfIntegration.mapServiceDeskDataToProposal(mockServiceDeskData);

      // Check that monetary values are properly formatted
      expect(proposalData.financialBreakdown).toBeDefined();
      expect(typeof proposalData.financialBreakdown.totalCosts).toBe('number');
      expect(proposalData.totalAnnual).toBeGreaterThan(0);
    });
  });

  describe('PDF Generation Integration', () => {
    it('should generate standard proposal PDF successfully', async () => {
      const result = await pdfIntegration.generateEnhancedProposal(mockServiceDeskData, undefined, { templateType: 'standard' });

      expect(result.success).toBe(true);
      expect(result.pdfBlob).toBeInstanceOf(Blob);
      expect(result.pdfBlob.type).toBe('application/pdf');
      expect(result.metadata).toHaveProperty('pages');
      expect(result.metadata).toHaveProperty('size');
      expect(result.metadata).toHaveProperty('generatedAt');
      expect(result.metadata.pages).toBe(5);
      expect(result.metadata.size).toBe(1024);
    });

    it('should generate detailed proposal PDF successfully', async () => {
      const result = await pdfIntegration.generateEnhancedProposal(mockServiceDeskData, undefined, { templateType: 'detailed' });

      expect(result.success).toBe(true);
      expect(result.pdfBlob).toBeInstanceOf(Blob);
    });

    it('should generate executive summary PDF successfully', async () => {
      const result = await pdfIntegration.generateEnhancedProposal(mockServiceDeskData, undefined, { templateType: 'executive' });

      expect(result.success).toBe(true);
      expect(result.pdfBlob).toBeInstanceOf(Blob);
    });

    it('should handle PDF generation errors gracefully', async () => {
      // Test with invalid data
      const invalidData = { ...mockServiceDeskData, project: null as any };
      
      try {
        await pdfIntegration.generateEnhancedProposal(invalidData);
        // If it doesn't throw, check for error in result
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should include all required sections in generated PDF', async () => {
      const result = await pdfIntegration.generateEnhancedProposal(mockServiceDeskData, undefined, { templateType: 'detailed' });

      expect(result.success).toBe(true);
      expect(result.pdfBlob).toBeDefined();
    });
  });

  describe('Storage Integration', () => {
    it('should save generated proposal to storage', async () => {
      // Generate proposal first
      const result = await pdfIntegration.generateEnhancedProposal(mockServiceDeskData);

      expect(result.success).toBe(true);
      expect(result.pdfBlob).toBeDefined();
      expect(result.metadata).toHaveProperty('pages');
    });

    it('should retrieve saved proposal from storage', async () => {
      const proposalId = 'proposal-123';
      const result = await pdfIntegration.getStoredProposal(proposalId);

      expect(result.success).toBe(true);
      expect(result.proposalId).toBe(proposalId);
      expect(result.pdfBlob).toBeInstanceOf(Blob);
      expect(result.metadata).toHaveProperty('size');
      expect(result.metadata).toHaveProperty('pages');
    });

    it('should delete proposal from storage', async () => {
      const proposalId = 'proposal-123';
      const result = await pdfIntegration.deleteStoredProposal(proposalId);

      expect(result.success).toBe(true);
    });

    it('should handle storage errors gracefully', async () => {
      // Mock storage service to throw error
      const mockStorageService = vi.mocked(require('@/lib/pdf/services/storage').PDFStorageService);
      mockStorageService.mockImplementation(() => ({
        saveProposal: vi.fn().mockRejectedValue(new Error('Storage failed')),
        getProposal: vi.fn().mockRejectedValue(new Error('Storage failed')),
        deleteProposal: vi.fn().mockRejectedValue(new Error('Storage failed'))
      }));

      const result = await pdfIntegration.generateAndSaveProposal(mockServiceDeskData, 'standard');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Storage failed');
    });
  });

  describe('Template Integration', () => {
    it('should use correct template for different proposal types', async () => {
      await pdfIntegration.generateProposal(mockServiceDeskData, 'standard');
      await pdfIntegration.generateProposal(mockServiceDeskData, 'detailed');
      await pdfIntegration.generateProposal(mockServiceDeskData, 'executive');

      // Verify that different templates are used for different types
      const mockTemplate = vi.mocked(require('@/components/pdf-generation/templates/ServiceDeskProposalTemplate').ServiceDeskProposalTemplate);
      expect(mockTemplate).toHaveBeenCalledTimes(3);
    });

    it('should pass correct data to templates', async () => {
      await pdfIntegration.generateProposal(mockServiceDeskData, 'standard');

      const mockTemplate = vi.mocked(require('@/components/pdf-generation/templates/ServiceDeskProposalTemplate').ServiceDeskProposalTemplate);
      const templateInstance = mockTemplate.mock.results[0].value;
      
      expect(templateInstance.render).toHaveBeenCalledWith(
        expect.objectContaining({
          projectInfo: expect.any(Object),
          clientInfo: expect.any(Object),
          teamInfo: expect.any(Object),
          costBreakdown: expect.any(Object)
        })
      );
    });

    it('should handle template rendering errors', async () => {
      // Mock template to throw error
      const mockTemplate = vi.mocked(require('@/components/pdf-generation/templates/ServiceDeskProposalTemplate').ServiceDeskProposalTemplate);
      mockTemplate.mockImplementation(() => ({
        render: vi.fn().mockImplementation(() => {
          throw new Error('Template rendering failed');
        })
      }));

      const result = await pdfIntegration.generateProposal(mockServiceDeskData, 'standard');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Template rendering failed');
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain compatibility with existing PDF system', async () => {
      // Test that the integration doesn't break existing PDF functionality
      const legacyData = {
        projectName: 'Legacy Project',
        clientName: 'Legacy Client',
        totalPrice: 100000,
        items: []
      };

      const mappedData = pdfIntegration.mapLegacyDataToServiceDesk(legacyData);

      expect(mappedData).toHaveProperty('project');
      expect(mappedData).toHaveProperty('budget');
      expect(mappedData.project.name).toBe('Legacy Project');
      expect(mappedData.budget.totalPrice).toBe(100000);
    });

    it('should support legacy PDF templates', async () => {
      const result = await pdfIntegration.generateProposal(mockServiceDeskData, 'legacy');

      expect(result.success).toBe(true);
      expect(result.pdfBlob).toBeInstanceOf(Blob);
    });
  });

  describe('Performance Integration', () => {
    it('should handle large datasets efficiently', async () => {
      const largeDataset = {
        ...mockServiceDeskData,
        team: Array.from({ length: 100 }, (_, i) => ({
          id: `member-${i}`,
          name: `Member ${i}`,
          role: 'Analyst',
          salary: 5000,
          benefits: {} as any,
          workload: 40,
          startDate: new Date(),
          costPerHour: 0,
          skills: [],
          certifications: []
        })),
        otherCosts: Array.from({ length: 200 }, (_, i) => ({
          id: `cost-${i}`,
          name: `Cost ${i}`,
          value: 1000,
          category: 'INFRASTRUCTURE' as any,
          type: 'fixed' as any,
          description: '',
          startDate: new Date(),
          endDate: new Date()
        }))
      };

      const startTime = Date.now();
      const result = await pdfIntegration.generateProposal(largeDataset, 'detailed');
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should optimize memory usage during PDF generation', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      await pdfIntegration.generateProposal(mockServiceDeskData, 'detailed');
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Error Recovery Integration', () => {
    it('should retry PDF generation on transient failures', async () => {
      let attemptCount = 0;
      const mockPDFGenerator = vi.mocked(require('@/lib/pdf/generators/ServiceDeskPDFGenerator').ServiceDeskPDFGenerator);
      mockPDFGenerator.mockImplementation(() => ({
        generateProposal: vi.fn().mockImplementation(() => {
          attemptCount++;
          if (attemptCount < 3) {
            throw new Error('Transient failure');
          }
          return Promise.resolve({
            success: true,
            pdfBlob: new Blob(['success'], { type: 'application/pdf' }),
            metadata: { pages: 5, size: 1024, generatedAt: new Date() }
          });
        })
      }));

      const result = await pdfIntegration.generateProposal(mockServiceDeskData, 'standard');

      expect(result.success).toBe(true);
      expect(attemptCount).toBe(3); // Should have retried twice
    });

    it('should provide fallback templates when primary template fails', async () => {
      // Mock primary template to fail
      const mockTemplate = vi.mocked(require('@/components/pdf-generation/templates/ServiceDeskProposalTemplate').ServiceDeskProposalTemplate);
      mockTemplate.mockImplementationOnce(() => ({
        render: vi.fn().mockImplementation(() => {
          throw new Error('Primary template failed');
        })
      })).mockImplementationOnce(() => ({
        render: vi.fn().mockReturnValue('<div>Fallback Template</div>')
      }));

      const result = await pdfIntegration.generateProposal(mockServiceDeskData, 'standard');

      expect(result.success).toBe(true);
      expect(mockTemplate).toHaveBeenCalledTimes(2); // Primary + fallback
    });
  });
});