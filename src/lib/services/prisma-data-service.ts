import { prisma } from '@/lib/prisma';
import { ServiceDeskData } from '@/lib/types/service-desk-pricing';
import { Prisma } from '@prisma/client';

export class PrismaDataService {
  // Project CRUD operations
  async createProject(userId: string, data: Partial<ServiceDeskData>) {
    try {
      const project = await prisma.project.create({
        data: {
          name: data.project?.name || 'Novo Projeto',
          description: data.project?.description,
          currency: data.project?.currency || 'BRL',
          location: data.project?.location,
          serviceType: data.project?.serviceType || 'STANDARD',
          userId,
          // Create related entities
          client: data.project?.client ? {
            create: {
              name: data.project.client.name,
              document: data.project.client.document,
              email: data.project.client.email,
              phone: data.project.client.phone,
              contactPerson: data.project.client.contactPerson,
              address: data.project.client.address ? {
                create: {
                  street: data.project.client.address.street,
                  number: data.project.client.address.number,
                  complement: data.project.client.address.complement,
                  neighborhood: data.project.client.address.neighborhood,
                  city: data.project.client.address.city,
                  state: data.project.client.address.state,
                  zipCode: data.project.client.address.zipCode,
                  country: data.project.client.address.country || 'Brasil',
                }
              } : undefined
            }
          } : undefined,
          contractPeriod: data.project?.contractPeriod ? {
            create: {
              startDate: data.project.contractPeriod.startDate,
              endDate: data.project.contractPeriod.endDate,
              durationMonths: data.project.contractPeriod.durationMonths,
              renewalOptions: data.project.contractPeriod.renewalOptions || [],
            }
          } : undefined,
          generalInfo: data.project?.generalInfo ? {
            create: {
              userQuantity: data.project.generalInfo.userQuantity,
              monthlyCalls: data.project.generalInfo.monthlyCalls,
            }
          } : undefined,
          dimensioning: data.project?.dimensioning ? {
            create: {
              incidentsPerUser: data.project.dimensioning.incidentsPerUser,
              tmaMinutes: data.project.dimensioning.tmaMinutes,
              occupancyRate: data.project.dimensioning.occupancyRate,
              n1Distribution: data.project.dimensioning.n1Distribution,
              n1Capacity: data.project.dimensioning.n1Capacity,
              n2Capacity: data.project.dimensioning.n2Capacity,
              n1SixHourShift: data.project.dimensioning.n1SixHourShift,
              coverageType: data.project.dimensioning.coverageType || 'BUSINESS_HOURS',
              suggestedN1: data.project.dimensioning.suggestedN1,
              suggestedN2: data.project.dimensioning.suggestedN2,
            }
          } : undefined,
          additionalServices: data.project?.additionalServices ? {
            create: {
              needsSoftware: data.project.additionalServices.needsSoftware,
              needs0800: data.project.additionalServices.needs0800,
              needsDirectCall: data.project.additionalServices.needsDirectCall,
              needsInfrastructure: data.project.additionalServices.needsInfrastructure,
            }
          } : undefined,
        },
        include: this.getFullProjectInclude(),
      });

      return this.transformPrismaToServiceDeskData(project);
    } catch (error) {
      console.error('Error creating project:', error);
      throw new Error('Failed to create project');
    }
  }

  async getProject(projectId: string, userId: string) {
    try {
      // Use API instead of direct Prisma in browser
      const response = await fetch(`/api/projects/${projectId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }
      
      const project = await response.json();
      
      // Get job positions separately
      const jobPositionsResponse = await fetch('/api/job-positions');
      const jobPositions = jobPositionsResponse.ok ? await jobPositionsResponse.json() : [];

      if (!project) {
        throw new Error('Project not found');
      }

      const serviceDeskData = this.transformPrismaToServiceDeskData(project);
      serviceDeskData.jobPositions = jobPositions;

      return serviceDeskData;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw new Error('Failed to fetch project');
    }
  }

  async updateProject(projectId: string, userId: string, data: Partial<ServiceDeskData>) {
    try {
      const project = await prisma.project.update({
        where: {
          id: projectId,
          userId,
        },
        data: {
          name: data.project?.name,
          description: data.project?.description,
          currency: data.project?.currency,
          location: data.project?.location,
          serviceType: data.project?.serviceType,
          updatedAt: new Date(),
        },
        include: this.getFullProjectInclude(),
      });

      return this.transformPrismaToServiceDeskData(project);
    } catch (error) {
      console.error('Error updating project:', error);
      throw new Error('Failed to update project');
    }
  }

  async deleteProject(projectId: string, userId: string) {
    try {
      await prisma.project.delete({
        where: {
          id: projectId,
          userId,
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting project:', error);
      throw new Error('Failed to delete project');
    }
  }

  async listProjects(userId: string, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const [projects, total] = await Promise.all([
        prisma.project.findMany({
          where: { userId },
          include: {
            client: true,
            contractPeriod: true,
            _count: {
              select: {
                teamMembers: true,
                schedules: true,
                negotiations: true,
              }
            }
          },
          orderBy: { updatedAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.project.count({ where: { userId } }),
      ]);

      return {
        projects: projects.map(project => ({
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status,
          client: project.client?.name,
          startDate: project.contractPeriod?.startDate,
          endDate: project.contractPeriod?.endDate,
          teamSize: project._count.teamMembers,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error listing projects:', error);
      throw new Error('Failed to list projects');
    }
  }

  // Team management
  async addTeamMember(projectId: string, memberData: any) {
    try {
      const member = await prisma.teamMember.create({
        data: {
          projectId,
          name: memberData.name,
          jobPositionId: memberData.jobPositionId,
          workingHours: memberData.workingHours || 8,
          startDate: memberData.startDate || new Date(),
          endDate: memberData.endDate,
          notes: memberData.notes,
          // Legacy fields for backward compatibility
          role: memberData.role,
          salary: memberData.salary,
          benefits: memberData.benefits || {},
          workload: memberData.workload,
          costPerHour: memberData.costPerHour,
          skills: memberData.skills || [],
          certifications: memberData.certifications || [],
        },
      });

      return member;
    } catch (error) {
      console.error('Error adding team member:', error);
      throw new Error('Failed to add team member');
    }
  }

  async updateTeamMember(memberId: string, memberData: any) {
    try {
      const member = await prisma.teamMember.update({
        where: { id: memberId },
        data: {
          name: memberData.name,
          jobPositionId: memberData.jobPositionId,
          workingHours: memberData.workingHours,
          endDate: memberData.endDate,
          notes: memberData.notes,
          // Legacy fields for backward compatibility
          role: memberData.role,
          salary: memberData.salary,
          benefits: memberData.benefits,
          workload: memberData.workload,
          costPerHour: memberData.costPerHour,
          skills: memberData.skills,
          certifications: memberData.certifications,
          updatedAt: new Date(),
        },
      });

      return member;
    } catch (error) {
      console.error('Error updating team member:', error);
      throw new Error('Failed to update team member');
    }
  }

  async removeTeamMember(memberId: string) {
    try {
      await prisma.teamMember.delete({
        where: { id: memberId },
      });

      return { success: true };
    } catch (error) {
      console.error('Error removing team member:', error);
      throw new Error('Failed to remove team member');
    }
  }

  // Job Positions methods
  async getJobPositions() {
    try {
      const jobPositions = await prisma.jobPosition.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
      });

      return jobPositions;
    } catch (error) {
      console.error('Error fetching job positions:', error);
      throw new Error('Failed to fetch job positions');
    }
  }

  // Forecast management
  async saveForecast(projectId: string, forecastData: any) {
    try {
      const forecast = await prisma.forecast.upsert({
        where: { projectId },
        update: {
          assumptions: forecastData.assumptions,
          updatedAt: new Date(),
        },
        create: {
          projectId,
          assumptions: forecastData.assumptions,
        },
      });

      // Save scenarios
      if (forecastData.scenarios) {
        await prisma.forecastScenario.deleteMany({
          where: { forecastId: forecast.id },
        });

        await prisma.forecastScenario.createMany({
          data: forecastData.scenarios.map((scenario: any) => ({
            forecastId: forecast.id,
            name: scenario.name,
            description: scenario.description,
            type: scenario.type,
            probability: scenario.probability,
            assumptions: scenario.assumptions,
            isBaseline: scenario.isBaseline,
            color: scenario.color,
          })),
        });
      }

      return forecast;
    } catch (error) {
      console.error('Error saving forecast:', error);
      throw new Error('Failed to save forecast');
    }
  }

  // Budget management
  async saveBudget(projectId: string, budgetData: any) {
    try {
      const budget = await prisma.budget.upsert({
        where: { projectId },
        update: {
          teamCosts: budgetData.teamCosts?.total || 0,
          infrastructureCosts: budgetData.infrastructureCosts || 0,
          otherCosts: budgetData.otherCosts || 0,
          totalTaxes: budgetData.taxes?.total || 0,
          totalCosts: budgetData.totalCosts || 0,
          marginType: budgetData.margin?.type || 'PERCENTAGE',
          marginValue: budgetData.margin?.value || 20,
          totalPrice: budgetData.totalPrice || 0,
          monthlyBreakdown: budgetData.monthlyBreakdown || [],
          updatedAt: new Date(),
        },
        create: {
          projectId,
          teamCosts: budgetData.teamCosts?.total || 0,
          infrastructureCosts: budgetData.infrastructureCosts || 0,
          otherCosts: budgetData.otherCosts || 0,
          totalTaxes: budgetData.taxes?.total || 0,
          totalCosts: budgetData.totalCosts || 0,
          marginType: budgetData.margin?.type || 'PERCENTAGE',
          marginValue: budgetData.margin?.value || 20,
          totalPrice: budgetData.totalPrice || 0,
          monthlyBreakdown: budgetData.monthlyBreakdown || [],
        },
      });

      return budget;
    } catch (error) {
      console.error('Error saving budget:', error);
      throw new Error('Failed to save budget');
    }
  }

  // Analytics and reporting
  async getProjectAnalytics(userId: string, timeframe = '30d') {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (timeframe === '30d' ? 30 : 7));

      const analytics = await prisma.project.groupBy({
        by: ['status'],
        where: {
          userId,
          createdAt: { gte: startDate },
        },
        _count: { id: true },
      });

      const totalProjects = await prisma.project.count({ where: { userId } });
      const activeProjects = await prisma.project.count({
        where: { userId, status: 'IN_PROGRESS' },
      });

      return {
        totalProjects,
        activeProjects,
        projectsByStatus: analytics,
        timeframe,
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw new Error('Failed to fetch analytics');
    }
  }

  // Helper methods
  private getFullProjectInclude() {
    return {
      client: {
        include: { address: true }
      },
      contractPeriod: true,
      generalInfo: true,
      dimensioning: true,
      additionalServices: true,
      teamMembers: {
        include: {
          jobPosition: true
        }
      },
      schedules: {
        include: { assignments: true }
      },
      taxes: true,
      variables: true,
      otherCosts: true,
      budget: true,
      forecast: {
        include: {
          scenarios: true,
          projections: true,
          risks: true,
          insights: true,
          alerts: true,
        }
      },
      analysis: true,
      negotiations: true,
    };
  }

  private transformPrismaToServiceDeskData(project: any): ServiceDeskData {
    return {
      project: {
        id: project.id,
        name: project.name,
        client: project.client ? {
          name: project.client.name,
          document: project.client.document,
          email: project.client.email,
          phone: project.client.phone,
          contactPerson: project.client.contactPerson,
          address: project.client.address ? {
            street: project.client.address.street,
            number: project.client.address.number,
            complement: project.client.address.complement,
            neighborhood: project.client.address.neighborhood,
            city: project.client.address.city,
            state: project.client.address.state,
            zipCode: project.client.address.zipCode,
            country: project.client.address.country,
          } : {
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'Brasil'
          }
        } : {
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
        contractPeriod: project.contractPeriod ? {
          startDate: project.contractPeriod.startDate,
          endDate: project.contractPeriod.endDate,
          durationMonths: project.contractPeriod.durationMonths,
          renewalOptions: project.contractPeriod.renewalOptions || [],
        } : {
          startDate: new Date(),
          endDate: new Date(),
          durationMonths: 12,
          renewalOptions: []
        },
        description: project.description || '',
        currency: project.currency,
        location: project.location || '',
        serviceType: project.serviceType,
        additionalServices: project.additionalServices ? {
          needsSoftware: project.additionalServices.needsSoftware,
          needs0800: project.additionalServices.needs0800,
          needsDirectCall: project.additionalServices.needsDirectCall,
          needsInfrastructure: project.additionalServices.needsInfrastructure,
        } : {
          needsSoftware: false,
          needs0800: false,
          needsDirectCall: false,
          needsInfrastructure: false
        },
        generalInfo: project.generalInfo ? {
          userQuantity: project.generalInfo.userQuantity,
          monthlyCalls: project.generalInfo.monthlyCalls,
        } : {
          userQuantity: 100,
          monthlyCalls: 150
        },
        dimensioning: project.dimensioning ? {
          incidentsPerUser: project.dimensioning.incidentsPerUser,
          tmaMinutes: project.dimensioning.tmaMinutes,
          occupancyRate: project.dimensioning.occupancyRate,
          n1Distribution: project.dimensioning.n1Distribution,
          n1Capacity: project.dimensioning.n1Capacity,
          n2Capacity: project.dimensioning.n2Capacity,
          n1SixHourShift: project.dimensioning.n1SixHourShift,
          coverageType: project.dimensioning.coverageType,
          suggestedN1: project.dimensioning.suggestedN1,
          suggestedN2: project.dimensioning.suggestedN2,
        } : {
          incidentsPerUser: 1.5,
          tmaMinutes: 10,
          occupancyRate: 80,
          n1Distribution: 80,
          n1Capacity: 100,
          n2Capacity: 75,
          n1SixHourShift: false,
          coverageType: 'BUSINESS_HOURS' as any,
          suggestedN1: 2,
          suggestedN2: 1
        },
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
      team: project.teamMembers?.map((member: any) => ({
        id: member.id,
        name: member.name,
        jobPositionId: member.jobPositionId,
        workingHours: member.workingHours || 8,
        startDate: member.startDate,
        endDate: member.endDate,
        isActive: member.isActive,
        notes: member.notes,
        // Legacy fields for backward compatibility
        role: member.role,
        salary: member.salary,
        benefits: member.benefits,
        workload: member.workload,
        costPerHour: member.costPerHour,
        skills: member.skills || [],
        certifications: member.certifications || [],
      })) || [],
      jobPositions: [], // Will be loaded separately
      schedules: project.schedules?.map((schedule: any) => ({
        id: schedule.id,
        name: schedule.name,
        description: schedule.description,
        coverageType: schedule.coverageType,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        daysOfWeek: schedule.daysOfWeek,
        isActive: schedule.isActive,
        assignments: schedule.assignments || [],
      })) || [],
      taxes: {
        region: project.taxes?.[0]?.region || '',
        icms: project.taxes?.find((t: any) => t.name === 'ICMS')?.rate || 0,
        pis: project.taxes?.find((t: any) => t.name === 'PIS')?.rate || 1.65,
        cofins: project.taxes?.find((t: any) => t.name === 'COFINS')?.rate || 7.6,
        iss: project.taxes?.find((t: any) => t.name === 'ISS')?.rate || 5,
        ir: project.taxes?.find((t: any) => t.name === 'IR')?.rate || 15,
        csll: project.taxes?.find((t: any) => t.name === 'CSLL')?.rate || 9,
        customTaxes: project.taxes?.filter((t: any) => t.type === 'CUSTOM') || [],
        taxRegime: 'LUCRO_PRESUMIDO' as any,
      },
      variables: {
        inflation: {
          annualRate: project.variables?.find((v: any) => v.name === 'inflation')?.value || 4.5,
          monthlyRate: 0.37,
          projectionPeriod: 12,
          source: 'IBGE',
          lastUpdate: new Date(),
        },
        salaryAdjustments: {
          annualAdjustment: project.variables?.find((v: any) => v.name === 'salary_adjustment')?.value || 5,
          adjustmentDate: new Date(),
          adjustmentType: 'inflation' as any,
          minimumAdjustment: 3,
          maximumAdjustment: 10,
        },
        marketFactors: project.variables?.filter((v: any) => v.type === 'MARKET_FACTOR') || [],
        scenarios: [],
      },
      otherCosts: project.otherCosts?.map((cost: any) => ({
        id: cost.id,
        name: cost.name,
        category: cost.category,
        amount: cost.amount,
        frequency: cost.frequency,
        description: cost.description,
        isActive: cost.isActive,
      })) || [],
      budget: project.budget ? {
        teamCosts: {
          salaries: project.budget.teamCosts,
          benefits: 0,
          total: project.budget.teamCosts,
          breakdown: [],
        },
        infrastructureCosts: project.budget.infrastructureCosts,
        otherCosts: project.budget.otherCosts,
        taxes: {
          federal: 0,
          state: 0,
          municipal: 0,
          total: project.budget.totalTaxes,
          breakdown: [],
        },
        totalCosts: project.budget.totalCosts,
        margin: {
          type: project.budget.marginType,
          value: project.budget.marginValue,
          minimumMargin: 10,
          targetMargin: 20,
          maximumMargin: 40,
        },
        totalPrice: project.budget.totalPrice,
        monthlyBreakdown: project.budget.monthlyBreakdown || [],
      } : {
        teamCosts: { salaries: 0, benefits: 0, total: 0, breakdown: [] },
        infrastructureCosts: 0,
        otherCosts: 0,
        taxes: { federal: 0, state: 0, municipal: 0, total: 0, breakdown: [] },
        totalCosts: 0,
        margin: { type: 'percentage' as any, value: 20, minimumMargin: 10, targetMargin: 20, maximumMargin: 40 },
        totalPrice: 0,
        monthlyBreakdown: [],
      },
      forecast: project.forecast ? {
        id: project.forecast.id,
        projectId: project.id,
        scenarios: project.forecast.scenarios?.map((scenario: any) => ({
          id: scenario.id,
          name: scenario.name,
          description: scenario.description,
          type: scenario.type,
          probability: scenario.probability,
          assumptions: scenario.assumptions,
          projections: [],
          isBaseline: scenario.isBaseline,
          color: scenario.color,
        })) || [],
        assumptions: project.forecast.assumptions,
        projections: project.forecast.projections || [],
        riskAnalysis: {
          risks: project.forecast.risks || [],
          mitigations: [],
          sensitivityAnalysis: [],
          monteCarloResults: undefined,
        },
        dashboard: {
          kpis: [],
          charts: [],
          alerts: project.forecast.alerts || [],
          insights: project.forecast.insights || [],
          lastUpdated: project.forecast.updatedAt,
        },
        createdAt: project.forecast.createdAt,
        updatedAt: project.forecast.updatedAt,
      } : {
        id: '',
        projectId: project.id,
        scenarios: [],
        assumptions: {
          contractDuration: 24,
          inflationRate: 6.5,
          salaryAdjustment: 8.0,
          renewalProbability: 85,
          expansionProbability: 40,
          churnRate: 5,
          seasonalFactors: [],
        },
        projections: [],
        riskAnalysis: { risks: [], mitigations: [], sensitivityAnalysis: [], monteCarloResults: undefined },
        dashboard: { kpis: [], charts: [], alerts: [], insights: [], lastUpdated: new Date() },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      analysis: project.analysis ? {
        roi: {
          investment: 0,
          returns: [],
          roi: project.analysis.roi,
          irr: project.analysis.irr || 0,
          npv: project.analysis.npv || 0,
          period: project.analysis.period || 12,
        },
        payback: {
          simplePayback: project.analysis.payback || 0,
          discountedPayback: project.analysis.discountedPayback || 0,
          breakEvenPoint: project.analysis.breakEven || 0,
          cashFlowAnalysis: [],
        },
        margins: {
          grossMargin: 0,
          netMargin: 0,
          ebitdaMargin: 0,
          contributionMargin: 0,
          marginTrend: [],
        },
        riskAnalysis: {
          riskFactors: [],
          overallRisk: 'low' as const,
          mitigation: [],
        },
        sensitivityAnalysis: {
          variables: [],
          scenarios: [],
          results: [],
        },
        charts: [],
      } : {
        roi: { investment: 0, returns: [], roi: 0, irr: 0, npv: 0, period: 12 },
        payback: { simplePayback: 0, discountedPayback: 0, breakEvenPoint: 0, cashFlowAnalysis: [] },
        margins: { grossMargin: 0, netMargin: 0, ebitdaMargin: 0, contributionMargin: 0, marginTrend: [] },
        riskAnalysis: { riskFactors: [], overallRisk: 'low' as const, mitigation: [] },
        sensitivityAnalysis: { variables: [], scenarios: [], results: [] },
        charts: [],
      },
      negotiations: project.negotiations?.map((negotiation: any) => ({
        id: negotiation.id,
        name: negotiation.name,
        description: negotiation.description,
        adjustments: negotiation.adjustments,
        status: negotiation.status,
        createdAt: negotiation.createdAt,
        updatedAt: negotiation.updatedAt,
      })) || [],
    };
  }
}

export const prismaDataService = new PrismaDataService();