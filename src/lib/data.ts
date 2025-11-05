import type { Partner, Quote, RO, Training, BidDocs, Proposal, RFP, PriceRecord, Edital } from './types';

export const initialPartners: Partner[] = [
  { 
    id: 1, 
    name: 'Distribuidor TechData', 
    type: 'Distribuidor', 
    contact: 'joao@techdata.com', 
    phone: '(11) 98765-4321', 
    status: 'Ativo', 
    site: 'https://portal.techdata.com', 
    siteEcommerce: 'https://shop.techdata.com', 
    login: 'user_techdata', 
    password: '123', 
    loginEcommerce: 'shop_user', 
    passwordEcommerce: 'shop123', 
    products: 'Licenças Microsoft, Hardware Dell, Cisco',
    vendedoresResponsaveis: [
      { id: '1', fornecedor: 'Microsoft', vendedor: 'Ana Silva', telefone: '(11) 99999-1111', email: 'ana.silva@techdata.com' },
      { id: '2', fornecedor: 'Dell', vendedor: 'Carlos Santos', telefone: '(11) 99999-2222', email: 'carlos.santos@techdata.com' },
      { id: '3', fornecedor: 'Cisco', vendedor: 'Maria Oliveira', telefone: '(11) 99999-3333', email: 'maria.oliveira@techdata.com' }
    ]
  },
  { id: 2, name: 'Fornecedor AWS', type: 'Fornecedor', contact: 'maria@aws.com', phone: '(11) 91234-5678', status: 'Ativo', sitePartner: 'https://partner.aws.amazon.com', login: 'aws_partner', password: 'aws_password', siteRO: 'https://partner.aws.amazon.com/ro', templateRO: 'template_aws_ro.pdf', procedimentoRO: '1. Logar no portal de parceiros.\n2. Ir para a seção de registro de oportunidades.\n3. Preencher o formulário com os dados do cliente.' },
  { 
    id: 3, 
    name: 'Distribuidor Ingram Micro', 
    type: 'Distribuidor', 
    contact: 'carlos@ingram.com', 
    phone: '(21) 99999-8888', 
    status: 'Inativo', 
    site: 'https://www.ingrammicro.com.br', 
    siteEcommerce: 'https://ecommerce.ingrammicro.com.br', 
    login: 'user_ingram', 
    password: '456', 
    loginEcommerce: 'ecom_user', 
    passwordEcommerce: 'ecom456', 
    products: 'HP, IBM, Lenovo',
    vendedoresResponsaveis: [
      { id: '4', fornecedor: 'HP', vendedor: 'Roberto Lima', telefone: '(21) 98888-1111', email: 'roberto.lima@ingram.com' },
      { id: '5', fornecedor: 'IBM', vendedor: 'Fernanda Costa', telefone: '(21) 98888-2222', email: 'fernanda.costa@ingram.com' },
      { id: '6', fornecedor: 'Lenovo', vendedor: 'Paulo Mendes', telefone: '(21) 98888-3333', email: 'paulo.mendes@ingram.com' }
    ]
  },
  { id: 4, name: 'Fornecedor Microsoft', type: 'Fornecedor', contact: 'ana@microsoft.com', phone: '(41) 98877-6655', status: 'Ativo', sitePartner: 'https://partner.microsoft.com', login: 'ms_partner', password: 'ms_password', siteRO: 'https://partner.microsoft.com/ro', templateRO: 'procedimento_ro_ms.docx', procedimentoRO: 'Utilizar o Partner Center para registrar a oportunidade. É necessário o tenant ID do cliente.' },
  { 
    id: 5, 
    name: 'Distribuidor Westcon', 
    type: 'Distribuidor', 
    contact: 'pedro@westcon.com', 
    phone: '(31) 98765-1234', 
    status: 'Ativo', 
    site: 'https://www.westcon.com', 
    siteEcommerce: 'https://store.westcon.com', 
    login: 'user_westcon', 
    password: '789', 
    loginEcommerce: 'store_user', 
    passwordEcommerce: 'store789', 
    products: 'Palo Alto, F5, Juniper',
    vendedoresResponsaveis: [
      { id: '7', fornecedor: 'Fortinet', vendedor: 'Pedro Almeida', telefone: '(31) 97777-1111', email: 'pedro.almeida@westcon.com' },
      { id: '8', fornecedor: 'Palo Alto', vendedor: 'Juliana Rocha', telefone: '(31) 97777-2222', email: 'juliana.rocha@westcon.com' },
      { id: '9', fornecedor: 'F5', vendedor: 'Ricardo Ferreira', telefone: '(31) 97777-3333', email: 'ricardo.ferreira@westcon.com' },
      { id: '10', fornecedor: 'Juniper', vendedor: 'Camila Souza', telefone: '(31) 97777-4444', email: 'camila.souza@westcon.com' }
    ]
  },
  { id: 6, name: 'Fornecedor Oracle', type: 'Fornecedor', contact: 'lucia@oracle.com', phone: '(51) 91234-8765', status: 'Inativo', sitePartner: 'https://partner.oracle.com', login: 'ora_partner', password: 'ora_password', siteRO: 'https://partner.oracle.com/ro', templateRO: '', procedimentoRO: 'Registro de oportunidade feito diretamente pelo gerente de canais.' },
];

export const initialQuotes: Quote[] = [
  { id: 'ORC-001', client: 'Empresa Alpha', projectName: 'Migração de Servidores', accountManager: 'João da Silva', status: 'Enviado', total: 15000, date: '2024-07-28', distributorId: 1, quotationFile: 'cotacao_alpha.pdf', pricingFile: 'precificacao_alpha.xlsx' },
  { id: 'ORC-002', client: 'Startup Beta', projectName: 'Novo App Mobile', accountManager: 'Maria Oliveira', status: 'Aprovado', total: 7500, date: '2024-07-25', distributorId: 3, quotationFile: '', pricingFile: '' },
  { id: 'ORC-003', client: 'Indústria Gama', projectName: 'Upgrade de Rede', accountManager: 'João da Silva', status: 'Pendente', total: 32000, date: '2024-07-22', distributorId: 5, quotationFile: 'cotacao_gama.xlsx', pricingFile: 'custos_gama.xlsx' },
  { id: 'ORC-004', client: 'Comércio Delta', projectName: 'Sistema de E-commerce', accountManager: 'Carlos Pereira', status: 'Rejeitado', total: 5000, date: '2024-07-20', distributorId: 1, quotationFile: '', pricingFile: '' },
  { id: 'ORC-005', client: 'Consultoria Epsilon', projectName: 'Licenciamento de Software', accountManager: 'Maria Oliveira', status: 'Aguardando Distribuidor', total: 9200, date: '2024-07-29', distributorId: 1, quotationFile: '', pricingFile: '' },
];

export const initialProposals: Proposal[] = [
  { 
    id: 'PROP-001', 
    title: 'Solução de Infraestrutura Cloud', 
    client: 'Empresa Alpha', 
    description: 'Migração completa da infraestrutura para nuvem AWS com serviços de consultoria e suporte técnico.', 
    status: 'Aprovada', 
    value: 85000, 
    date: '2024-07-15', 
    expiryDate: '2024-08-15', 
    accountManager: 'João da Silva', 
    distributorId: 1, 
    proposalFile: 'proposta_alpha_cloud.pdf', 
    technicalSpecs: 'especificacoes_tecnicas_alpha.pdf', 
    commercialTerms: 'termos_comerciais_alpha.pdf' 
  },
  { 
    id: 'PROP-002', 
    title: 'Sistema de Gestão Empresarial', 
    client: 'Startup Beta', 
    description: 'Implementação de ERP completo com módulos de gestão financeira, estoque e recursos humanos.', 
    status: 'Em Análise', 
    value: 45000, 
    date: '2024-07-20', 
    expiryDate: '2024-08-20', 
    accountManager: 'Maria Oliveira', 
    distributorId: 3, 
    proposalFile: 'proposta_beta_erp.pdf', 
    technicalSpecs: 'especificacoes_tecnicas_beta.pdf', 
    commercialTerms: '' 
  },
  { 
    id: 'PROP-003', 
    title: 'Segurança da Informação', 
    client: 'Indústria Gama', 
    description: 'Implementação de soluções de segurança cibernética incluindo firewall, antivírus e treinamento de equipe.', 
    status: 'Rascunho', 
    value: 28000, 
    date: '2024-07-25', 
    expiryDate: '2024-08-25', 
    accountManager: 'João da Silva', 
    distributorId: 5, 
    proposalFile: '', 
    technicalSpecs: '', 
    commercialTerms: '' 
  },
  { 
    id: 'PROP-004', 
    title: 'Modernização de Rede', 
    client: 'Comércio Delta', 
    description: 'Upgrade completo da infraestrutura de rede com equipamentos de última geração e configuração avançada.', 
    status: 'Enviada', 
    value: 65000, 
    date: '2024-07-18', 
    expiryDate: '2024-08-18', 
    accountManager: 'Carlos Pereira', 
    distributorId: 1, 
    proposalFile: 'proposta_delta_rede.pdf', 
    technicalSpecs: 'especificacoes_tecnicas_delta.pdf', 
    commercialTerms: 'termos_comerciais_delta.pdf' 
  },
  { 
    id: 'PROP-005', 
    title: 'Licenciamento Microsoft 365', 
    client: 'Consultoria Epsilon', 
    description: 'Migração para Microsoft 365 com licenças E5 e serviços de migração e treinamento.', 
    status: 'Rejeitada', 
    value: 15000, 
    date: '2024-07-10', 
    expiryDate: '2024-08-10', 
    accountManager: 'Maria Oliveira', 
    distributorId: 1, 
    proposalFile: 'proposta_epsilon_m365.pdf', 
    technicalSpecs: '', 
    commercialTerms: 'termos_comerciais_epsilon.pdf' 
  },
];

export const initialRos: RO[] = [
    { id: 1, supplierId: 2, roNumber: 'AWS-12345', openDate: '2024-07-15', expiryDate: '2024-10-15', clientName: 'Empresa Alpha', product: 'AWS EC2 Instances', value: 25000, status: 'Aprovado' },
    { id: 2, supplierId: 4, roNumber: 'MS-ABC-678', openDate: '2024-06-20', expiryDate: '2024-09-20', clientName: 'Startup Beta', product: 'Microsoft 365 E5', value: 12000, status: 'Expirado' },
    { id: 3, supplierId: 6, roNumber: 'ORA-789-XYZ', openDate: '2024-08-01', expiryDate: '2024-11-01', clientName: 'Indústria Gama', product: 'Oracle Database Enterprise', value: 45000, status: 'Negado' },
];

export const initialTrainings: Training[] = [
    { id: 1, supplierId: 2, trainingName: 'AWS Certified Cloud Practitioner', type: 'Técnico', participantName: 'Carlos Silva', expiryDate: '2025-08-01' },
    { id: 2, supplierId: 4, trainingName: 'MS-900: Microsoft 365 Fundamentals', type: 'Comercial', participantName: 'Mariana Oliveira', expiryDate: '2026-01-15' },
    { id: 3, supplierId: 4, trainingName: 'AZ-104: Microsoft Azure Administrator', type: 'Técnico', participantName: 'Carlos Silva', expiryDate: '2025-11-20' },
];

export const initialBidDocs: BidDocs = {
    company: [{id: 1, name: 'Contrato Social.pdf'}, {id: 2, name: 'CNPJ.pdf'}],
    proofs: [{id: 1, name: 'Atestado de Capacidade Técnica.pdf'}],
    certifications: [{id: 1, name: 'Certificação ISO 9001.pdf'}, {id: 2, name: 'Certificação ISO 27001.pdf'}],
};


export const salesData = [
  { name: 'Jan', 'Orçamentos': 30, 'Vendas': 20 },
  { name: 'Fev', 'Orçamentos': 45, 'Vendas': 25 },
  { name: 'Mar', 'Orçamentos': 60, 'Vendas': 40 },
  { name: 'Abr', 'Orçamentos': 50, 'Vendas': 35 },
  { name: 'Mai', 'Orçamentos': 70, 'Vendas': 55 },
  { name: 'Jun', 'Orçamentos': 85, 'Vendas': 65 },
];

export const quoteStatusData = [
  { name: 'Aprovado', value: 400 },
  { name: 'Pendente', value: 300 },
  { name: 'Enviado', value: 300 },
  { name: 'Rejeitado', value: 200 },
  { name: 'Aguardando Distribuidor', value: 150 },
];

export const initialRFPs: RFP[] = [
  {
    id: 'RFP-001',
    title: 'Sistema de Gestão Hospitalar',
    client: 'Hospital Municipal',
    type: 'RFP',
    description: 'Aquisição de sistema completo de gestão hospitalar incluindo prontuário eletrônico, gestão de leitos e faturamento.',
    status: 'Aberto',
    publishDate: '2024-07-15',
    deadlineDate: '2024-08-30',
    value: 500000,
    accountManager: 'João da Silva',
    category: 'Saúde',
    requirements: 'Sistema deve ser compatível com padrões HL7, ter certificação ANVISA e suporte 24/7.',
    attachments: ['edital_hospital.pdf', 'especificacoes_tecnicas.pdf'],
    notes: 'Cliente prioriza soluções nacionais com suporte local.'
  },
  {
    id: 'RFI-001',
    title: 'Infraestrutura de TI para Prefeitura',
    client: 'Prefeitura Municipal',
    type: 'RFI',
    description: 'Levantamento de informações sobre soluções de infraestrutura de TI para modernização da gestão municipal.',
    status: 'Em Análise',
    publishDate: '2024-07-10',
    deadlineDate: '2024-08-15',
    accountManager: 'Maria Oliveira',
    category: 'Governo',
    requirements: 'Soluções devem atender LGPD, ter certificação de segurança e ser escaláveis.',
    attachments: ['rfi_prefeitura.pdf'],
    notes: 'Processo em fase de análise das respostas recebidas.'
  },
  {
    id: 'RFP-002',
    title: 'Sistema de Controle de Tráfego',
    client: 'Departamento de Trânsito',
    type: 'RFP',
    description: 'Implementação de sistema inteligente de controle de tráfego com câmeras e semáforos conectados.',
    status: 'Respondido',
    publishDate: '2024-06-20',
    deadlineDate: '2024-07-25',
    submissionDate: '2024-07-20',
    value: 800000,
    accountManager: 'Carlos Pereira',
    category: 'Transporte',
    requirements: 'Sistema deve integrar com APIs de mapas, ter IA para detecção de incidentes e dashboard em tempo real.',
    attachments: ['edital_transito.pdf', 'especificacoes_tecnicas.pdf', 'resposta_rfp.pdf'],
    notes: 'Proposta enviada dentro do prazo. Aguardando avaliação.'
  },
  {
    id: 'RFI-002',
    title: 'Soluções de Segurança Cibernética',
    client: 'Banco Nacional',
    type: 'RFI',
    description: 'Levantamento de soluções de segurança cibernética para proteção de dados bancários e transações.',
    status: 'Fechado',
    publishDate: '2024-05-15',
    deadlineDate: '2024-06-30',
    submissionDate: '2024-06-25',
    accountManager: 'Ana Costa',
    category: 'Financeiro',
    requirements: 'Soluções devem atender regulamentações do BACEN, ter certificações internacionais e suporte 24/7.',
    attachments: ['rfi_banco.pdf', 'resposta_rfi.pdf'],
    notes: 'Processo finalizado. Cliente selecionou fornecedor concorrente.'
  },
  {
    id: 'RFP-003',
    title: 'Plataforma de E-learning',
    client: 'Universidade Federal',
    type: 'RFP',
    description: 'Desenvolvimento de plataforma de ensino a distância com recursos de videoconferência e gestão de cursos.',
    status: 'Vencido',
    publishDate: '2024-06-01',
    deadlineDate: '2024-07-15',
    value: 300000,
    accountManager: 'Pedro Santos',
    category: 'Educação',
    requirements: 'Plataforma deve suportar 10.000 usuários simultâneos, ter integração com sistemas acadêmicos e ser acessível.',
    attachments: ['edital_universidade.pdf'],
    notes: 'Prazo vencido sem envio de proposta. Oportunidade perdida.'
  }
];

export const initialPriceRecords: PriceRecord[] = [
  {
    id: 'ATA-001',
    title: 'Ata de Registro de Preços - Equipamentos de TI',
    client: 'Prefeitura Municipal',
    type: 'Ata de Registro de Preços',
    description: 'Ata para aquisição de equipamentos de informática, incluindo computadores, impressoras e periféricos.',
    status: 'Ativo',
    publishDate: '2024-06-15',
    validityDate: '2025-06-15',
    totalValue: 2500000,
    accountManager: 'João da Silva',
    category: 'Tecnologia',
    items: [
      {
        id: '1',
        description: 'Notebook Dell Latitude 5520',
        unit: 'unidade',
        quantity: 100,
        unitPrice: 3500,
        totalPrice: 350000,
        supplier: 'Dell Brasil',
        brand: 'Dell',
        model: 'Latitude 5520'
      },
      {
        id: '2',
        description: 'Impressora HP LaserJet Pro M404n',
        unit: 'unidade',
        quantity: 50,
        unitPrice: 1200,
        totalPrice: 60000,
        supplier: 'HP Brasil',
        brand: 'HP',
        model: 'LaserJet Pro M404n'
      },
      {
        id: '3',
        description: 'Switch Cisco Catalyst 2960',
        unit: 'unidade',
        quantity: 20,
        unitPrice: 2500,
        totalPrice: 50000,
        supplier: 'Cisco Brasil',
        brand: 'Cisco',
        model: 'Catalyst 2960'
      }
    ],
    participants: ['Dell Brasil', 'HP Brasil', 'Cisco Brasil', 'Lenovo Brasil'],
    attachments: ['ata_001.pdf', 'edital_001.pdf', 'anexos_tecnicos.pdf'],
    notes: 'Ata válida por 12 meses com possibilidade de renovação por igual período.'
  },
  {
    id: 'ATA-002',
    title: 'Pregão Eletrônico - Serviços de Manutenção',
    client: 'Secretaria de Educação',
    type: 'Pregão Eletrônico',
    description: 'Pregão para contratação de serviços de manutenção preventiva e corretiva de equipamentos de informática.',
    status: 'Ativo',
    publishDate: '2024-05-20',
    validityDate: '2025-05-20',
    totalValue: 800000,
    accountManager: 'Maria Oliveira',
    category: 'Serviços',
    items: [
      {
        id: '1',
        description: 'Manutenção Preventiva - Computadores',
        unit: 'hora',
        quantity: 2000,
        unitPrice: 80,
        totalPrice: 160000,
        supplier: 'TechService Ltda',
        brand: '',
        model: ''
      },
      {
        id: '2',
        description: 'Manutenção Corretiva - Impressoras',
        unit: 'hora',
        quantity: 1000,
        unitPrice: 120,
        totalPrice: 120000,
        supplier: 'PrintFix Ltda',
        brand: '',
        model: ''
      }
    ],
    participants: ['TechService Ltda', 'PrintFix Ltda', 'Manutec Ltda'],
    attachments: ['pregao_002.pdf', 'especificacoes_servicos.pdf'],
    notes: 'Serviços devem ser prestados em até 24h para manutenção corretiva.'
  },
  {
    id: 'ATA-003',
    title: 'Concorrência - Sistema de Gestão Escolar',
    client: 'Secretaria de Educação Estadual',
    type: 'Concorrência',
    description: 'Concorrência para aquisição de sistema de gestão escolar com módulos de matrícula, notas e frequência.',
    status: 'Vencido',
    publishDate: '2023-12-01',
    validityDate: '2024-12-01',
    totalValue: 1500000,
    accountManager: 'Carlos Pereira',
    category: 'Educação',
    items: [
      {
        id: '1',
        description: 'Sistema de Gestão Escolar - Licença',
        unit: 'licença',
        quantity: 500,
        unitPrice: 2000,
        totalPrice: 1000000,
        supplier: 'EduTech Sistemas',
        brand: 'EduTech',
        model: 'Gestão Escolar v3.0'
      },
      {
        id: '2',
        description: 'Treinamento de Usuários',
        unit: 'hora',
        quantity: 200,
        unitPrice: 150,
        totalPrice: 30000,
        supplier: 'EduTech Sistemas',
        brand: '',
        model: ''
      }
    ],
    participants: ['EduTech Sistemas', 'SchoolSoft Ltda', 'EduManager'],
    attachments: ['concorrencia_003.pdf', 'especificacoes_sistema.pdf'],
    notes: 'Sistema deve ser compatível com padrões do MEC.'
  },
  {
    id: 'ATA-004',
    title: 'Ata de Registro de Preços - Material de Escritório',
    client: 'Tribunal de Justiça',
    type: 'Ata de Registro de Preços',
    description: 'Ata para aquisição de material de escritório e papelaria para uso administrativo.',
    status: 'Suspenso',
    publishDate: '2024-07-01',
    validityDate: '2025-07-01',
    totalValue: 300000,
    accountManager: 'Ana Costa',
    category: 'Administrativo',
    items: [
      {
        id: '1',
        description: 'Papel A4 75g - Resma',
        unit: 'resma',
        quantity: 1000,
        unitPrice: 15,
        totalPrice: 15000,
        supplier: 'Papelaria Central',
        brand: 'Chamex',
        model: ''
      },
      {
        id: '2',
        description: 'Caneta Esferográfica Azul',
        unit: 'unidade',
        quantity: 5000,
        unitPrice: 2.5,
        totalPrice: 12500,
        supplier: 'Papelaria Central',
        brand: 'Bic',
        model: 'Cristal'
      }
    ],
    participants: ['Papelaria Central', 'OfficeMax', 'Staples'],
    attachments: ['ata_004.pdf'],
    notes: 'Ata suspensa temporariamente para reavaliação de preços.'
  },
  {
    id: 'ATA-005',
    title: 'Pregão Eletrônico - Segurança Eletrônica',
    client: 'Secretaria de Segurança Pública',
    type: 'Pregão Eletrônico',
    description: 'Pregão para aquisição de sistemas de segurança eletrônica, câmeras e equipamentos de monitoramento.',
    status: 'Renovado',
    publishDate: '2023-08-15',
    validityDate: '2024-08-15',
    renewalDate: '2025-08-15',
    totalValue: 3500000,
    accountManager: 'Pedro Santos',
    category: 'Segurança',
    items: [
      {
        id: '1',
        description: 'Câmera IP Dome 4MP',
        unit: 'unidade',
        quantity: 200,
        unitPrice: 800,
        totalPrice: 160000,
        supplier: 'SecurityTech',
        brand: 'Hikvision',
        model: 'DS-2CD2142FWD-I'
      },
      {
        id: '2',
        description: 'NVR 32 Canais',
        unit: 'unidade',
        quantity: 10,
        unitPrice: 5000,
        totalPrice: 50000,
        supplier: 'SecurityTech',
        brand: 'Hikvision',
        model: 'DS-7732NI-K4'
      }
    ],
    participants: ['SecurityTech', 'SurveillancePro', 'SafeGuard'],
    attachments: ['pregao_005.pdf', 'especificacoes_seguranca.pdf'],
    notes: 'Ata renovada por mais 12 meses com ajuste de preços de 5%.'
  }
];

// Chart colors using the new design system with semantic meanings
export const PIE_COLORS = [
  'hsl(var(--chart-1))', // Ciano principal - Para dados primários
  'hsl(var(--chart-2))', // Laranja - Para dados secundários/ações
  'hsl(var(--chart-3))', // Verde/Teal - Para dados positivos
  'hsl(var(--chart-4))', // Amarelo - Para avisos/neutros
  'hsl(var(--chart-5))', // Roxo - Para dados especiais
  'hsl(var(--chart-6))', // Rosa - Para dados críticos
  'hsl(var(--chart-7))', // Azul escuro - Para contraste
  'hsl(var(--chart-8))'  // Ciano escuro - Para variações
];

// Cores específicas para diferentes tipos de dados
export const CHART_COLORS = {
  revenue: 'hsl(var(--chart-revenue))',
  cost: 'hsl(var(--chart-cost))',
  profit: 'hsl(var(--chart-profit))',
  tax: 'hsl(var(--chart-tax))',
  commission: 'hsl(var(--chart-commission))',
  growth: 'hsl(var(--chart-growth))',
  decline: 'hsl(var(--chart-decline))',
  neutral: 'hsl(var(--chart-neutral))'
};

export const initialEditais: Edital[] = [
  {
    id: 'EDT-001',
    title: 'Aquisição de Equipamentos de Informática',
    publicationNumber: '001/2024',
    publishingBody: 'Prefeitura Municipal de São Paulo',
    publishDate: '2024-07-15',
    openingDate: '2024-08-15',
    submissionDeadline: '2024-08-10',
    estimatedValue: 2500000,
    category: 'Tecnologia',
    status: 'Em Análise',
    description: 'Pregão eletrônico para aquisição de equipamentos de informática para escolas municipais.',
    requirements: 'Empresa com experiência mínima de 3 anos no setor de TI.',
    documents: [
      {
        id: '1',
        name: 'Proposta Comercial',
        type: 'Obrigatório',
        description: 'Proposta comercial detalhada com preços e condições',
        deadline: '2024-08-10',
        status: 'Em Preparação',
        notes: 'Aguardando cotação dos fornecedores'
      },
      {
        id: '2',
        name: 'Certificado de Registro Cadastral',
        type: 'Obrigatório',
        description: 'CRC válido junto ao órgão',
        deadline: '2024-08-10',
        status: 'Pronto',
        notes: 'Documento já disponível'
      },
      {
        id: '3',
        name: 'Certificado de Capacidade Técnica',
        type: 'Obrigatório',
        description: 'Comprovante de experiência em projetos similares',
        deadline: '2024-08-10',
        status: 'Pendente',
        notes: 'Precisa coletar referências de clientes'
      }
    ],
    products: [
      {
        id: '1',
        description: 'Notebook Dell Latitude 5520',
        quantity: 500,
        unit: 'unidade',
        estimatedUnitPrice: 3500,
        totalEstimatedPrice: 1750000,
        specifications: 'Intel i5, 8GB RAM, 256GB SSD, Windows 11 Pro',
        brand: 'Dell',
        model: 'Latitude 5520',
        supplier: 'Dell Brasil',
        status: 'Disponível'
      },
      {
        id: '2',
        description: 'Impressora HP LaserJet Pro M404n',
        quantity: 100,
        unit: 'unidade',
        estimatedUnitPrice: 1200,
        totalEstimatedPrice: 120000,
        specifications: 'Impressão laser monocromática, rede Ethernet',
        brand: 'HP',
        model: 'LaserJet Pro M404n',
        supplier: 'HP Brasil',
        status: 'Em Cotação'
      }
    ],
    analysis: {
      id: 'ANL-001',
      editalId: 'EDT-001',
      analysisDate: '2024-07-20',
      analyst: 'João da Silva',
      documentAnalysis: {
        totalDocuments: 3,
        readyDocuments: 1,
        pendingDocuments: 2,
        criticalDocuments: ['Certificado de Capacidade Técnica'],
        notes: 'Dois documentos críticos ainda pendentes'
      },
      productAnalysis: {
        totalProducts: 2,
        availableProducts: 1,
        unavailableProducts: 0,
        totalEstimatedValue: 1870000,
        competitiveAdvantage: 'Boa relação com fornecedores Dell e HP',
        notes: 'Produtos bem definidos e disponíveis'
      },
      timelineAnalysis: {
        daysUntilOpening: 25,
        daysUntilDeadline: 20,
        isUrgent: false,
        timelineRisk: 'Baixo',
        notes: 'Prazo adequado para preparação'
      },
      publishingBodyAnalysis: {
        bodyType: 'Municipal',
        previousExperience: 'Já participamos de 3 licitações com este órgão',
        paymentHistory: 'Bom',
        notes: 'Órgão confiável com histórico positivo'
      },
      overallAssessment: {
        score: 75,
        recommendation: 'Participar',
        strengths: ['Boa relação com fornecedores', 'Experiência prévia com o órgão'],
        weaknesses: ['Documentação ainda incompleta'],
        opportunities: ['Possibilidade de parcerias futuras'],
        threats: ['Concorrência forte no setor'],
        finalNotes: 'Edital viável com boa probabilidade de sucesso'
      }
    },
                    files: [
                  {
                    id: 'FILE-001',
                    name: 'edital_001.pdf',
                    type: 'pdf',
                    size: 2048576, // 2MB
                    uploadDate: '2024-07-20',
                    aiAnalysis: {
                      id: 'AI-001',
                      fileId: 'FILE-001',
                      analysisDate: '2024-07-20',
                      summary: "Análise automática do edital realizada com sucesso. Foram identificados pontos-chave importantes para a participação na licitação.",
                      keyPoints: [
                        "Prazo de submissão: 30 dias",
                        "Valor estimado: R$ 2.500.000,00",
                        "Documentação obrigatória: 15 itens",
                        "Experiência mínima: 3 anos"
                      ],
                      requirements: [
                        "Certificado de Registro Cadastral",
                        "Certificado de Capacidade Técnica",
                        "Proposta comercial detalhada",
                        "Documentação fiscal"
                      ],
                      deadlines: [
                        "Abertura: 15/08/2024",
                        "Submissão: 10/08/2024",
                        "Validade: 60 dias"
                      ],
                      values: [
                        "Valor total: R$ 2.500.000,00",
                        "Garantia: R$ 50.000,00",
                        "Prazo de pagamento: 30 dias"
                      ],
                      risks: [
                        "Prazo apertado para documentação",
                        "Concorrência forte no setor",
                        "Especificações técnicas complexas"
                      ],
                      opportunities: [
                        "Possibilidade de parcerias",
                        "Mercado em crescimento",
                        "Órgão com histórico positivo"
                      ],
                      recommendations: [
                        "Participar da licitação",
                        "Acelerar preparação de documentos",
                        "Buscar parcerias estratégicas"
                      ],
                      confidence: 85,
                      processingTime: 3.2
                    }
                  }
                ],
                attachments: ['anexos_tecnicos.pdf'],
                notes: 'Edital prioritário para a empresa'
  },
  {
    id: 'EDT-002',
    title: 'Sistema de Gestão Escolar',
    publicationNumber: '002/2024',
    publishingBody: 'Secretaria de Educação do Estado',
    publishDate: '2024-07-10',
    openingDate: '2024-08-20',
    submissionDeadline: '2024-08-15',
    estimatedValue: 1800000,
    category: 'Educação',
    status: 'Aberto',
    description: 'Licitação para aquisição de sistema de gestão escolar com módulos de matrícula, notas e frequência.',
    requirements: 'Empresa com certificação ISO 27001 e experiência em projetos educacionais.',
    documents: [
      {
        id: '1',
        name: 'Proposta Técnica',
        type: 'Obrigatório',
        description: 'Proposta técnica detalhada do sistema',
        deadline: '2024-08-15',
        status: 'Pendente',
        notes: 'Aguardando desenvolvimento da proposta'
      },
      {
        id: '2',
        name: 'Certificado ISO 27001',
        type: 'Obrigatório',
        description: 'Certificação de segurança da informação',
        deadline: '2024-08-15',
        status: 'Pronto',
        notes: 'Certificação válida até 2025'
      }
    ],
    products: [
      {
        id: '1',
        description: 'Sistema de Gestão Escolar - Licença',
        quantity: 1000,
        unit: 'licença',
        estimatedUnitPrice: 1500,
        totalEstimatedPrice: 1500000,
        specifications: 'Sistema web com módulos de gestão escolar',
        brand: 'EduTech',
        model: 'Gestão Escolar v3.0',
        supplier: 'EduTech Sistemas',
        status: 'Disponível'
      },
      {
        id: '2',
        description: 'Treinamento de Usuários',
        quantity: 200,
        unit: 'hora',
        estimatedUnitPrice: 150,
        totalEstimatedPrice: 30000,
        specifications: 'Treinamento presencial e online',
        supplier: 'EduTech Sistemas',
        status: 'Disponível'
      }
    ],
    attachments: ['edital_002.pdf', 'especificacoes_sistema.pdf'],
    notes: 'Projeto estratégico para expansão no setor educacional'
  },
  {
    id: 'EDT-003',
    title: 'Segurança Eletrônica e CFTV',
    publicationNumber: '003/2024',
    publishingBody: 'Tribunal de Justiça',
    publishDate: '2024-07-05',
    openingDate: '2024-08-10',
    submissionDeadline: '2024-08-05',
    estimatedValue: 3200000,
    category: 'Segurança',
    status: 'Fechado',
    description: 'Pregão para aquisição de sistemas de segurança eletrônica e câmeras de monitoramento.',
    requirements: 'Empresa com experiência mínima de 5 anos em segurança eletrônica.',
    documents: [
      {
        id: '1',
        name: 'Proposta Comercial',
        type: 'Obrigatório',
        description: 'Proposta comercial com preços e condições',
        deadline: '2024-08-05',
        status: 'Enviado',
        notes: 'Proposta enviada com sucesso'
      },
      {
        id: '2',
        name: 'Certificado de Registro Cadastral',
        type: 'Obrigatório',
        description: 'CRC válido junto ao órgão',
        deadline: '2024-08-05',
        status: 'Enviado',
        notes: 'Documento enviado'
      }
    ],
    products: [
      {
        id: '1',
        description: 'Câmera IP Dome 4MP',
        quantity: 300,
        unit: 'unidade',
        estimatedUnitPrice: 800,
        totalEstimatedPrice: 240000,
        specifications: 'Câmera IP com resolução 4MP, visão noturna',
        brand: 'Hikvision',
        model: 'DS-2CD2142FWD-I',
        supplier: 'SecurityTech',
        status: 'Disponível'
      },
      {
        id: '2',
        description: 'NVR 64 Canais',
        quantity: 8,
        unit: 'unidade',
        estimatedUnitPrice: 8000,
        totalEstimatedPrice: 64000,
        specifications: 'Gravador de vídeo em rede com 64 canais',
        brand: 'Hikvision',
        model: 'DS-9664NI-I8',
        supplier: 'SecurityTech',
        status: 'Disponível'
      }
    ],
    analysis: {
      id: 'ANL-002',
      editalId: 'EDT-003',
      analysisDate: '2024-07-12',
      analyst: 'Maria Oliveira',
      documentAnalysis: {
        totalDocuments: 2,
        readyDocuments: 2,
        pendingDocuments: 0,
        criticalDocuments: [],
        notes: 'Toda documentação pronta e enviada'
      },
      productAnalysis: {
        totalProducts: 2,
        availableProducts: 2,
        unavailableProducts: 0,
        totalEstimatedValue: 304000,
        competitiveAdvantage: 'Parceria exclusiva com SecurityTech',
        notes: 'Produtos disponíveis com boa margem'
      },
      timelineAnalysis: {
        daysUntilOpening: 5,
        daysUntilDeadline: 0,
        isUrgent: true,
        timelineRisk: 'Alto',
        notes: 'Prazo muito apertado'
      },
      publishingBodyAnalysis: {
        bodyType: 'Federal',
        previousExperience: 'Primeira participação com este órgão',
        paymentHistory: 'Excelente',
        notes: 'Órgão federal com excelente histórico de pagamento'
      },
      overallAssessment: {
        score: 85,
        recommendation: 'Participar',
        strengths: ['Produtos disponíveis', 'Documentação completa'],
        weaknesses: ['Prazo apertado'],
        opportunities: ['Abertura de mercado federal'],
        threats: ['Concorrência forte'],
        finalNotes: 'Excelente oportunidade apesar do prazo apertado'
      }
    },
    attachments: ['edital_003.pdf', 'proposta_enviada.pdf'],
    notes: 'Proposta enviada com sucesso'
  }
];
