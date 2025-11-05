import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create job positions first
  const jobPositions = [
    {
      name: 'Analista de Service Desk N1',
      level: 'N1',
      salary8h: 1780.00,
      salary6h: 1580.00,
      description: 'Analista responsável pelo primeiro nível de atendimento'
    },
    {
      name: 'Analista de Service Desk N2',
      level: 'N2',
      salary8h: 2880.00,
      salary6h: null,
      description: 'Analista responsável pelo segundo nível de atendimento'
    },
    {
      name: 'Analista de Service Desk N3',
      level: 'N3',
      salary8h: 7380.00,
      salary6h: null,
      description: 'Analista responsável pelo terceiro nível de atendimento'
    },
    {
      name: 'Líder Técnico',
      level: 'Liderança',
      salary8h: 5200.00,
      salary6h: null,
      description: 'Líder técnico responsável pela coordenação da equipe técnica'
    },
    {
      name: 'Coordenador',
      level: 'Gestão',
      salary8h: 9800.00,
      salary6h: null,
      description: 'Coordenador responsável pela gestão geral do projeto'
    }
  ];

  console.log('🏢 Creating job positions...');
  
  for (const position of jobPositions) {
    await prisma.jobPosition.upsert({
      where: { name: position.name },
      update: position,
      create: position,
    });
    console.log(`✅ Created job position: ${position.name}`);
  }

  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'admin@servicedesk.com' },
    update: {},
    create: {
      email: 'admin@servicedesk.com',
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  console.log('✅ Created user:', user.email);

  // Create a test client
  const client = await prisma.client.create({
    data: {
      name: 'Empresa Exemplo Ltda',
      document: '12.345.678/0001-90',
      email: 'contato@exemplo.com',
      phone: '(11) 99999-9999',
      contactPerson: 'João Silva',
      address: {
        create: {
          street: 'Rua das Flores',
          number: '123',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
          country: 'Brasil',
        },
      },
    },
  });

  console.log('✅ Created client:', client.name);

  // Create a test project
  const project = await prisma.project.create({
    data: {
      name: 'Service Desk Exemplo',
      description: 'Projeto de exemplo para demonstração',
      userId: user.id,
      clientId: client.id,
      contractPeriod: {
        create: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          durationMonths: 12,
        },
      },
      generalInfo: {
        create: {
          userQuantity: 500,
          monthlyCalls: 1200,
        },
      },
      dimensioning: {
        create: {
          incidentsPerUser: 1.5,
          tmaMinutes: 8,
          occupancyRate: 85,
          n1Distribution: 80,
          n1Capacity: 120,
          n2Capacity: 80,
          suggestedN1: 3,
          suggestedN2: 2,
        },
      },
    },
  });

  console.log('✅ Created project:', project.name);

  // Get job positions for team members
  const n1Position = await prisma.jobPosition.findFirst({ where: { name: 'Analista de Service Desk N1' } });
  const n2Position = await prisma.jobPosition.findFirst({ where: { name: 'Analista de Service Desk N2' } });
  const coordPosition = await prisma.jobPosition.findFirst({ where: { name: 'Coordenador' } });

  // Create some team members using the new structure
  const teamMembers = await Promise.all([
    prisma.teamMember.create({
      data: {
        projectId: project.id,
        name: 'Ana Silva',
        jobPositionId: n1Position!.id,
        workingHours: 8,
      },
    }),
    prisma.teamMember.create({
      data: {
        projectId: project.id,
        name: 'Carlos Santos',
        jobPositionId: n2Position!.id,
        workingHours: 8,
      },
    }),
    prisma.teamMember.create({
      data: {
        projectId: project.id,
        name: 'Maria Oliveira',
        jobPositionId: coordPosition!.id,
        workingHours: 8,
      },
    }),
  ]);

  console.log('✅ Created team members:', teamMembers.length);

  // Create budget
  const budget = await prisma.budget.create({
    data: {
      projectId: project.id,
      teamCosts: 17000,
      infrastructureCosts: 5000,
      otherCosts: 2000,
      totalTaxes: 4800,
      totalCosts: 28800,
      marginValue: 25,
      totalPrice: 36000,
    },
  });

  console.log('✅ Created budget with total price:', budget.totalPrice);

  // Create forecast
  const forecast = await prisma.forecast.create({
    data: {
      projectId: project.id,
      assumptions: {
        contractDuration: 24,
        inflationRate: 6.5,
        salaryAdjustment: 8.0,
        renewalProbability: 85,
        expansionProbability: 40,
        churnRate: 5,
      },
      scenarios: {
        create: [
          {
            name: 'Cenário Otimista',
            description: 'Crescimento acelerado com baixa inflação',
            type: 'OPTIMISTIC',
            probability: 25,
            assumptions: {
              revenueGrowth: 20,
              costInflation: 5,
              teamGrowth: 15,
              efficiencyGains: 10,
            },
            color: '#22c55e',
          },
          {
            name: 'Cenário Realista',
            description: 'Crescimento moderado conforme mercado',
            type: 'REALISTIC',
            probability: 50,
            assumptions: {
              revenueGrowth: 12,
              costInflation: 8,
              teamGrowth: 10,
              efficiencyGains: 5,
            },
            isBaseline: true,
            color: '#3b82f6',
          },
          {
            name: 'Cenário Pessimista',
            description: 'Crescimento lento com alta inflação',
            type: 'PESSIMISTIC',
            probability: 25,
            assumptions: {
              revenueGrowth: 5,
              costInflation: 12,
              teamGrowth: 5,
              efficiencyGains: 2,
            },
            color: '#ef4444',
          },
        ],
      },
    },
  });

  console.log('✅ Created forecast with scenarios:', forecast.id);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });