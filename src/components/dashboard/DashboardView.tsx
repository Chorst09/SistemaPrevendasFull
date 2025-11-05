"use client"
import React from 'react';
import type { Partner, RO } from '@/lib/types';
import StatCard from './StatCard';
import SalesChart from './SalesChart';
import QuoteStatusChart from './QuoteStatusChart';
import { Users, DollarSign, Archive, Briefcase } from 'lucide-react';
import RoDashboardView from './RoDashboardView';
import { RoChartsView } from './RoChartsView';

interface DashboardViewProps {
    partners: Partner[];
    salesData: any[];
    quoteStatusData: any[];
    ros: RO[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ partners, salesData, quoteStatusData, ros }) => {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    icon={<Briefcase className="w-6 h-6" />} 
                    title="Orçamentos Ativos" 
                    value="75" 
                    subtext="+5% vs. mês passado" 
                    variant="primary"
                />
                <StatCard 
                    icon={<DollarSign className="w-6 h-6" />} 
                    title="Valor Aprovado (Mês)" 
                    value="R$ 125.800" 
                    subtext="+12% vs. mês passado" 
                    variant="success"
                />
                <StatCard 
                    icon={<Users className="w-6 h-6" />} 
                    title="Total de Parceiros" 
                    value={partners.length} 
                    subtext="Distribuidores e Fornecedores" 
                    variant="default"
                />
                <StatCard 
                    icon={<Archive className="w-6 h-6" />} 
                    title="Produtos Cadastrados" 
                    value="1.204" 
                    subtext="Catálogo atualizado" 
                    variant="accent"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                    <SalesChart data={salesData} />
                </div>
                <div className="lg:col-span-2">
                    <QuoteStatusChart data={quoteStatusData} />
                </div>
            </div>

            <div className="space-y-8">
                <RoDashboardView ros={ros} partners={partners} />
                <RoChartsView ros={ros} partners={partners} />
            </div>
        </div>
    );
};

export default DashboardView;
