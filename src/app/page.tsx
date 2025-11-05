// src/app/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react'; // Mantenha todos os hooks necessários
// Importação de useAuth removida
// import { useAuth } from "@/hooks/use-auth";
import { useRouter } from 'next/navigation';
import {
    Loader2, LogOut, User, Briefcase, BarChart, Search, Menu,
    Users, DollarSign, Archive, Calculator, PlusCircle,
    Trash2, Edit, Building, ShoppingCart, ExternalLink, FileDown, Paperclip,
    X, Server, Headset, Printer, ChevronDown, Tag, Info, Settings, FileText,
    BarChart2, TrendingUp, Percent, ShoppingBag, Repeat, Wrench, Zap,
    CheckCircle, Award, Gavel, Moon, Sun, Brain, CheckSquare, BarChart3 // Ícones para o botão de tema
} from 'lucide-react'; // Importe todos os ícones usados diretamente aqui

// Importe seus componentes de UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Header } from '@/components/ui/header';

// Importe seus componentes de View
import DashboardView from '@/components/dashboard/DashboardView';
import PartnerView from '@/components/partners/PartnerView';
import QuotesView from '@/components/quotes/QuotesView';
import ProposalsView from '@/components/proposals/ProposalsView';
import RoManagementView from '@/components/ro-management/RoManagementView';
import TrainingManagementView from '@/components/training-management/TrainingManagementView';
import CalculatorFrame from '@/components/calculators/CalculatorFrame';
import BidsAnalysis from '@/components/bids/BidsAnalysis';
import BidsDocumentationView from '@/components/bids/BidsDocumentationView';
import RFPView from '@/components/rfp/RFPView';
import PriceRecordView from '@/components/price-records/PriceRecordView';
import EditalAnalysisView from '@/components/edital-analysis/EditalAnalysisView';

import { ITPricingModule } from '@/components/it-pricing/ITPricingModule';
import { SettingsView } from '@/components/settings/SettingsView';
import { RoChartsView } from '@/components/dashboard/RoChartsView';
import { PrinterOutsourcingModule } from '@/components/printer-outsourcing/PrinterOutsourcingModule';
import { ServiceDeskModule } from '@/components/service-desk/ServiceDeskModule';
import { ServiceDeskPricingSystem } from '@/components/service-desk-pricing/ServiceDeskPricingSystem';
import { ProposalListManager } from '@/components/pdf-generation/managers/ProposalListManager';


// Importe dados e tipos se ainda usados aqui
import type { Partner, Quote, RO, Training, BidDocs, NavItem, NavSubItem, Proposal, RFP, PriceRecord, Edital } from '@/lib/types';
import { initialPartners, initialQuotes, initialRos, initialTrainings, initialBidDocs, initialProposals, initialRFPs, initialPriceRecords, initialEditais, salesData, quoteStatusData } from '@/lib/data';

// Importe o hook useTheme
import { useTheme } from 'next-themes'; // <--- ADICIONADO ESTE IMPORT
import { useLogo } from '@/hooks/use-logo';
import { QuoteProvider } from '@/contexts/QuoteContext';


export default function App() { // Ou Home
    // Chamada e uso de useAuth removidos
    // const { user, loading, logout } = useAuth();
    const router = useRouter();
    // Use useTheme() para gerenciar o tema (chamado incondicionalmente)
    const { theme, setTheme } = useTheme(); // <-- useTheme chamado incondicionalmente
    const [mounted, setMounted] = useState(false); // Estado para verificar se montou no cliente
    const { logoSrc } = useLogo(); // Hook para gerenciar logo personalizado

    const [activeTab, setActiveTab] = useState('dashboard'); // Estado da aba ativa
    const [editingProposalId, setEditingProposalId] = useState<string | null>(null); // Estado para edição de propostas
    // Você pode remover ou adaptar estes estados se os componentes de view gerenciarem seus próprios dados carregados do Firestore
    const [partners, setPartners] = useState<Partner[]>(initialPartners); // Exemplo: Manter se necessário para dados locais/testes
    const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
    const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
    const [rfps, setRfps] = useState<RFP[]>(initialRFPs);
    const [priceRecords, setPriceRecords] = useState<PriceRecord[]>(initialPriceRecords);
    const [editais, setEditais] = useState<Edital[]>(initialEditais);
    const [ros, setRos] = useState<RO[]>(initialRos);
    const [trainings, setTrainings] = useState<Training[]>(initialTrainings);
    const [bidDocs, setBidDocs] = useState<BidDocs>(initialBidDocs);

    // Estado para controlar se as seções colapsáveis estão abertas (adapte)
    const [openSections, setOpenSections] = useState({
        suppliers: true,
        pricing: true,
        bids: true,
    });


    // Efeito para verificar montagem no cliente (útil para coisas como useTheme)
    useEffect(() => {
        setMounted(true);
    }, []);


    // Efeito para redirecionamento removido
    // useEffect(() => { ... }, [user, loading, router]);


    // Definição dos Itens de Navegação (adapte do seu código original)
    const navItems: NavItem[] = [
        { id: 'dashboard', label: 'Dashboard', icon: <BarChart size={20} /> },
        { id: 'projects', label: 'Projetos', icon: <Briefcase size={20} /> },
        { id: 'distributors', label: 'Distribuidores', icon: <ShoppingCart size={20} /> },
        {
            id: 'suppliers',
            label: 'Fornecedores',
            icon: <Building size={20} />,
            subItems: [
                { id: 'suppliers-register', label: 'Cadastro', icon: <Users size={16} /> },
                { id: 'ro-management', label: 'Gestão de RO’s', icon: <FileText size={16} /> },
                { id: 'ro-charts', label: 'Gráficos de ROs', icon: <BarChart2 size={16} /> },
                { id: 'training-management', label: 'Gestão de Treinamentos', icon: <Award size={16} /> },
            ]
        },
        { id: 'quotes', label: 'Orçamentos', icon: <Briefcase size={20} /> },
        { id: 'proposals', label: 'Propostas', icon: <FileText size={20} /> },
        { id: 'generated-proposals', label: 'Propostas Geradas', icon: <FileDown size={20} /> },
        {
            id: 'pricing',
            label: 'Precificação',
            icon: <Calculator size={20} />,
            subItems: [
                { id: 'calculator-ti-vls', label: 'Venda/Locação/Serviços', icon: <Briefcase size={16} />, openInNewTab: false } as NavSubItem & { openInNewTab?: boolean; url?: string },
                { id: 'calculator-servicedesk', label: 'Service Desk', icon: <Headset size={16} />, openInNewTab: false } as NavSubItem & { openInNewTab?: boolean; url?: string },
                { id: 'calculator-servicedesk-advanced', label: 'Service Desk Avançado', icon: <Server size={16} />, openInNewTab: false } as NavSubItem & { openInNewTab?: boolean; url?: string },
                { id: 'calculator-printer', label: 'Outsourcing de Impressão', icon: <Printer size={16} />, openInNewTab: false } as NavSubItem & { openInNewTab?: boolean; url?: string },
                { id: 'simuladores', label: 'Simuladores', icon: <BarChart size={16} />, openInNewTab: true, url: 'https://simuladores-supa.vercel.app/' } as NavSubItem & { openInNewTab?: boolean; url?: string },
            ]
        },
        {
            id: 'bids',
            label: 'Licitações/Editais',
            icon: <Gavel size={20} />,
            subItems: [
                { id: 'bids-analyzer', label: 'Analisador de Editais', icon: <Brain size={16} /> },
                { id: 'bids-analysis', label: 'Análise de Editais', icon: <Search size={16} /> },
                { id: 'bids-docs', label: 'Documentações para Editais', icon: <FileText size={16} /> },
            ]
        },
        { id: 'price-records', label: 'Atas de Registro de Preços', icon: <Award size={20} /> },
        { id: 'rfp', label: 'RFP/RFI', icon: <FileText size={20} /> },
        { id: 'it-assessment', label: 'Assessment de TI', icon: <CheckSquare size={20} /> },
        { id: 'poc', label: 'Provas de Conceito POC', icon: <BarChart3 size={20} /> },
        { id: 'settings', label: 'Configurações', icon: <Settings size={20} /> },
    ];

    // Lógica para encontrar o item de navegação atual (adapte)
    const currentNavItem = useMemo(() => {
        for (const item of navItems) {
            if (item.id === activeTab) return { ...item, parentLabel: null };
            if (item.subItems) {
                const subItem = item.subItems.find(sub => sub.id === activeTab);
                if (subItem) return { ...subItem, parentLabel: item.label };
            }
        }
        return { ...navItems[0], parentLabel: null };
    }, [activeTab]);

    // Função para lidar com navegação
    const handleNavigation = (item: any) => {
        if (item.openInNewTab && item.url) {
            window.open(item.url, '_blank');
        } else {
            setActiveTab(item.id);
        }
    };

    // Função para Renderizar o Conteúdo da View Ativa (adapte do seu código original)
    const renderContent = () => {
        // NOTA: Os componentes de view (DashboardView, PartnerView, etc.) agora devem gerenciar seus próprios dados.
        // Remova a dependência de useAuth() dentro deles, se houver.

        switch (activeTab) {
            case 'dashboard': return <DashboardView salesData={salesData} quoteStatusData={quoteStatusData} partners={partners} ros={ros} />;
            case 'projects': return (
                <div className="p-6">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Projetos Service Desk</h2>
                        <p className="text-muted-foreground mb-6">
                            Gerencie seus projetos de precificação de Service Desk
                        </p>
                        <div className="flex items-center justify-center space-x-4">
                            <a 
                                href="/projects" 
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                            >
                                <Briefcase className="h-4 w-4 mr-2" />
                                Acessar Projetos
                            </a>
                            <a 
                                href="/dashboard" 
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                            >
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Ver Dashboard
                            </a>
                        </div>
                    </div>
                </div>
            );
            case 'distributors': return <PartnerView partnerType="Distribuidor" />; // PartnerView pode precisar adaptação
            case 'suppliers-register': return <PartnerView partnerType="Fornecedor" />; // PartnerView pode precisar adaptação
            case 'ro-management': return <RoManagementView 
                partners={partners} 
                ros={ros} 
                onSave={(ro) => {
                    setRos(prevRos => {
                        const existingIndex = prevRos.findIndex(r => r.id === ro.id);
                        
                        if (existingIndex !== -1) {
                            // Editando RO existente
                            const updatedRos = [...prevRos];
                            updatedRos[existingIndex] = ro;
                            return updatedRos;
                        } else {
                            // Adicionando novo RO
                            const newRo = { 
                                ...ro, 
                                id: ro.id || Date.now()
                            };
                            return [...prevRos, newRo];
                        }
                    });
                }} 
                onDelete={(id) => {
                    setRos(prevRos => prevRos.filter(r => r.id !== id));
                }} 
            />;
            case 'ro-charts': return <RoChartsView ros={ros} partners={partners} />;
            case 'training-management': return <TrainingManagementView 
                partners={partners} 
                trainings={trainings} 
                onSave={(training) => {
                    setTrainings(prevTrainings => {
                        const existingIndex = prevTrainings.findIndex(t => t.id === training.id);
                        
                        if (existingIndex !== -1) {
                            // Editando training existente
                            const updatedTrainings = [...prevTrainings];
                            updatedTrainings[existingIndex] = training;
                            return updatedTrainings;
                        } else {
                            // Adicionando novo training
                            const newTraining = { 
                                ...training, 
                                id: training.id || Date.now()
                            };
                            return [...prevTrainings, newTraining];
                        }
                    });
                }} 
                onDelete={(id) => {
                    setTrainings(prevTrainings => prevTrainings.filter(t => t.id !== id));
                }} 
            />;
            case 'quotes': return <QuotesView partners={partners} />;
            case 'proposals': return <ProposalsView proposals={proposals} partners={partners} onSave={(proposal) => setProposals(prev => [...prev.filter(p => p.id !== proposal.id), proposal])} onDelete={(id) => setProposals(prev => prev.filter(p => p.id !== id))} />;
            case 'generated-proposals': return <ProposalListManager 
                onEditProposal={(proposalId) => {
                    // Set editing proposal ID and navigate to printer calculator
                    setEditingProposalId(proposalId)
                    setActiveTab('calculator-printer')
                }}
                onCreateNew={() => {
                    // Clear editing mode and navigate to printer calculator
                    setEditingProposalId(null)
                    setActiveTab('calculator-printer')
                }}
                onNavigateToQuotes={() => setActiveTab('quotes')}
            />;
            case 'calculator-ti-vls': return <ITPricingModule onNavigateToProposals={() => setActiveTab('proposals')} />;
            case 'calculator-servicedesk': return <ServiceDeskModule 
                onNavigateToProposals={() => setActiveTab('proposals')}
                editingProposalId={editingProposalId}
                onFinishEditing={() => setEditingProposalId(null)}
            />;
            case 'calculator-servicedesk-advanced': return <ServiceDeskPricingSystem 
                integrationMode="integrated"
                onDataChange={(data) => {
                    console.log('Service Desk data updated:', data);
                }}
            />;
            case 'calculator-printer': return <PrinterOutsourcingModule 
                onNavigateToProposals={() => setActiveTab('proposals')}
                editingProposalId={editingProposalId}
                onFinishEditing={() => {
                    setEditingProposalId(null)
                    setActiveTab('generated-proposals')
                }}
            />;


            case 'bids-analyzer': return <iframe src="/edital-analyzer.html" className="w-full h-screen border-0" title="Analisador de Editais" />;
            case 'bids-analysis': return <EditalAnalysisView
                editais={editais}
                onAdd={(edital) => setEditais(prev => [...prev, { ...edital, id: `EDT-${Date.now()}` }])}
                onUpdate={(id, edital) => setEditais(prev => prev.map(e => e.id === id ? { ...edital, id } : e))}
                onDelete={(id) => setEditais(prev => prev.filter(e => e.id !== id))}
                onAddAnalysis={(editalId, analysis) => setEditais(prev => prev.map(e => e.id === editalId ? { ...e, analysis: { ...analysis, id: `ANL-${Date.now()}`, editalId } } : e))}
            />;
            case 'bids-docs': return <BidsDocumentationView docs={initialBidDocs} onDocsChange={setBidDocs} />; // Adapte se os docs vierem de outro lugar
            case 'rfp': return <RFPView rfps={rfps} onAdd={(rfp) => setRfps(prev => [...prev, { ...rfp, id: `RFP-${Date.now()}` }])} onUpdate={(id, rfp) => setRfps(prev => prev.map(r => r.id === id ? { ...rfp, id } : r))} onDelete={(id) => setRfps(prev => prev.filter(r => r.id !== id))} />;
            case 'it-assessment': return <iframe src="/it-assessment.html" className="w-full h-screen border-0" title="Assessment de TI" />;
            case 'poc': return <iframe src="/poc-management.html" className="w-full h-screen border-0" title="Provas de Conceito POC" />;
            case 'price-records': return <PriceRecordView priceRecords={priceRecords} onAdd={(priceRecord) => setPriceRecords(prev => [...prev, { ...priceRecord, id: `ATA-${Date.now()}` }])} onUpdate={(id, priceRecord) => setPriceRecords(prev => prev.map(r => r.id === id ? { ...priceRecord, id } : r))} onDelete={(id) => setPriceRecords(prev => prev.filter(r => r.id !== id))} />;
            case 'settings': return <SettingsView />;
            default: return <DashboardView salesData={salesData} quoteStatusData={quoteStatusData} partners={partners} ros={ros} />;
        }
    };


    // **Renderização da UI completa da página principal (sem verificações de autenticação)**
    return (
        <QuoteProvider initialData={quotes}>
            <div className="min-h-screen font-body bg-background text-foreground transition-colors duration-500">
            <div className="flex">

                {/* Sidebar - Implementação completa task 4.1: primary-900 background, hover states com accent colors, contraste adequado */}
                <aside className="w-64 bg-primary-900 shadow-xl flex-col h-screen sticky top-0 hidden md:flex border-r border-primary-700/50 sidebar-bg">
                    {/* Cabeçalho da Sidebar com primary-900 background */}
                    <div className="flex items-center justify-center h-24 border-b border-primary-700/50 bg-gradient-to-r from-slate-900 to-blue-900 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-cyan/5 to-transparent"></div>
                        <Briefcase className="w-8 h-8 text-accent-cyan relative z-10 drop-shadow-sm" />
                        <span className="ml-3 text-xl font-bold text-white relative z-10 drop-shadow-sm">Menu</span>
                    </div>
                    {/* Navegação da Sidebar com hover states usando accent colors */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {navItems.map(item => (
                            !item.subItems ? (
                                <Button
                                    key={item.id}
                                    variant="ghost"
                                    className={`w-full justify-start px-4 py-3 h-auto text-sm transition-all duration-300 rounded-lg ${
                                        activeTab === item.id 
                                            ? 'bg-gradient-to-r from-accent-cyan/20 to-accent-orange/10 text-accent-cyan border border-accent-cyan/40 shadow-lg shadow-accent-cyan/15' 
                                            : 'text-primary-300 hover:text-foreground hover:bg-primary-800/60 hover:border-accent-cyan/30 hover:shadow-md hover:shadow-accent-cyan/10 border border-transparent'
                                    }`}
                                    onClick={() => setActiveTab(item.id)}
                                >
                                    <span className={activeTab === item.id ? 'text-accent-cyan' : 'text-primary-300 group-hover:text-accent-cyan transition-colors duration-300'}>{item.icon}</span>
                                    <span className="ml-4 font-medium">{item.label}</span>
                                </Button>
                            ) : (
                                // Collapsible para itens com sub-itens
                                <Collapsible
                                    key={item.id}
                                    open={openSections[item.id as keyof typeof openSections] || item.subItems.some(sub => sub.id === activeTab)}
                                    onOpenChange={(isOpen) => setOpenSections(prev => ({ ...prev, [item.id]: isOpen }))}
                                >
                                    <CollapsibleTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className={`w-full justify-between px-4 py-3 h-auto text-sm transition-all duration-300 rounded-lg group ${
                                                item.subItems.some(sub => sub.id === activeTab)
                                                    ? 'bg-gradient-to-r from-accent-cyan/20 to-accent-orange/10 text-accent-cyan border border-accent-cyan/40 shadow-lg shadow-accent-cyan/15'
                                                    : 'text-primary-300 hover:text-foreground hover:bg-primary-800/60 hover:border-accent-cyan/30 hover:shadow-md hover:shadow-accent-cyan/10 border border-transparent'
                                            }`}
                                        >
                                            <div className="flex items-center">
                                                <span className={item.subItems.some(sub => sub.id === activeTab) ? 'text-accent-cyan' : 'text-primary-300 group-hover:text-accent-cyan transition-colors duration-300'}>{item.icon}</span>
                                                <span className="ml-4 font-medium">{item.label}</span>
                                            </div>
                                            <ChevronDown className={`w-5 h-5 transition-all duration-300 ${
                                                openSections[item.id as keyof typeof openSections] || item.subItems.some(sub => sub.id === activeTab) ? 'rotate-180 text-accent-cyan' : 'text-primary-400 group-hover:text-accent-cyan'
                                            }`} />
                                        </Button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="pl-8 pt-2 space-y-1">
                                        {item.subItems.map(subItem => (
                                            <Button
                                                key={subItem.id}
                                                variant="ghost"
                                                onClick={() => handleNavigation(subItem)}
                                                className={`w-full justify-start h-auto px-3 py-2 text-sm transition-all duration-300 rounded-md group ${
                                                    activeTab === subItem.id 
                                                        ? 'text-accent-cyan font-semibold bg-accent-cyan/15 border-l-4 border-accent-cyan shadow-sm shadow-accent-cyan/20' 
                                                        : 'text-primary-400 hover:text-foreground hover:bg-primary-800/40 hover:border-l-4 hover:border-accent-orange/60 border-l-4 border-transparent'
                                                }`}
                                            >
                                                <span className={activeTab === subItem.id ? 'text-accent-cyan' : 'text-primary-400 group-hover:text-accent-orange transition-colors duration-300'}>{subItem.icon}</span>
                                                <span className="ml-3">{subItem.label}</span>
                                            </Button>
                                        ))}
                                    </CollapsibleContent>
                                </Collapsible>
                            )
                        ))}
                    </nav>
                    {/* Parte inferior da Sidebar com primary-900 background */}
                    <div className="p-4 border-t border-primary-700/50 bg-primary-900 flex flex-col gap-2">
                        {/* Botão de Tema com accent colors no hover */}
                        <Button 
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
                            variant="outline" 
                            className="w-full bg-primary-800/60 border-primary-700/60 text-primary-200 hover:bg-primary-700/60 hover:border-accent-cyan/50 hover:text-foreground hover:shadow-md hover:shadow-accent-cyan/20 transition-all duration-300"
                        >
                            {mounted ? (
                                <>
                                    {theme === 'dark' ? <Sun className="mr-2 h-4 w-4 text-accent-orange" /> : <Moon className="mr-2 h-4 w-4 text-accent-cyan" />}
                                    <span className="font-medium">{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
                                </>
                            ) : (
                                <>
                                    <Sun className="mr-2 h-4 w-4 text-accent-orange" />
                                    <span className="font-medium">Mudar Tema</span>
                                </>
                            )}
                        </Button>
                    </div>
                </aside>


                {/* Conteúdo Principal da Página (Main) */}
                <main className="flex-1 max-h-screen overflow-y-auto">
                    {/* Header Elegante com Logo */}
                    <Header 
                        currentTitle={currentNavItem.parentLabel || currentNavItem.label}
                        currentSubtitle={currentNavItem.parentLabel ? currentNavItem.label : undefined}
                        logoSrc={logoSrc}
                    />
                    
                    {/* Área de conteúdo com padding */}
                    <div className="p-6 sm:p-10 h-[calc(100vh-200px)] overflow-y-auto">

                        {/* Área de Conteúdo Principal - Renderiza a view ativa */}
                        {renderContent()} {/* Chama a função para renderizar a view ativa */}
                    </div>

                </main>
            </div>
        </div>
        </QuoteProvider>
    );
}
