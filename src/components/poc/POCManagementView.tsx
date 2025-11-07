"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    BarChart3,
    Plus,
    Search,
    Calendar,
    Building,
    User,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    TrendingUp,
    FileText,
    Eye
} from 'lucide-react';

interface POC {
    id: string;
    title: string;
    client: string;
    technology: string;
    startDate: string;
    endDate: string;
    status: 'Planejamento' | 'Em Execução' | 'Concluído' | 'Cancelado';
    responsible: string;
    budget: number;
    progress: number;
    description: string;
}

export function POCManagementView() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    const pocs: POC[] = [
        {
            id: 'POC-001',
            title: 'Migração para Azure Cloud',
            client: 'Empresa Alpha',
            technology: 'Microsoft Azure',
            startDate: '2024-11-01',
            endDate: '2024-12-15',
            status: 'Em Execução',
            responsible: 'João Silva',
            budget: 50000,
            progress: 65,
            description: 'POC para validar migração de infraestrutura on-premise para Azure'
        },
        {
            id: 'POC-002',
            title: 'Implementação de IA Generativa',
            client: 'Startup Beta',
            technology: 'OpenAI GPT-4',
            startDate: '2024-10-15',
            endDate: '2024-11-30',
            status: 'Concluído',
            responsible: 'Maria Santos',
            budget: 30000,
            progress: 100,
            description: 'POC para chatbot inteligente com IA generativa'
        },
        {
            id: 'POC-003',
            title: 'Segurança Zero Trust',
            client: 'Indústria Gama',
            technology: 'Palo Alto Networks',
            startDate: '2024-12-01',
            endDate: '2025-01-31',
            status: 'Planejamento',
            responsible: 'Carlos Oliveira',
            budget: 75000,
            progress: 15,
            description: 'POC para implementação de arquitetura Zero Trust'
        },
        {
            id: 'POC-004',
            title: 'Automação RPA',
            client: 'Banco Delta',
            technology: 'UiPath',
            startDate: '2024-09-01',
            endDate: '2024-10-15',
            status: 'Cancelado',
            responsible: 'Ana Costa',
            budget: 40000,
            progress: 30,
            description: 'POC para automação de processos financeiros'
        },
        {
            id: 'POC-005',
            title: 'Kubernetes em Produção',
            client: 'TechCorp',
            technology: 'Kubernetes + Docker',
            startDate: '2024-11-15',
            endDate: '2025-01-15',
            status: 'Em Execução',
            responsible: 'Pedro Lima',
            budget: 60000,
            progress: 45,
            description: 'POC para orquestração de containers em produção'
        }
    ];

    const filteredPOCs = pocs.filter(poc => {
        const matchesSearch = poc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            poc.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
            poc.technology.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || poc.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Planejamento':
                return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Planejamento</Badge>;
            case 'Em Execução':
                return <Badge className="bg-yellow-100 text-yellow-800"><TrendingUp className="h-3 w-3 mr-1" />Em Execução</Badge>;
            case 'Concluído':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Concluído</Badge>;
            case 'Cancelado':
                return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Cancelado</Badge>;
            default:
                return null;
        }
    };

    const getProgressColor = (progress: number) => {
        if (progress >= 80) return 'bg-green-600';
        if (progress >= 50) return 'bg-yellow-600';
        return 'bg-blue-600';
    };

    const stats = {
        total: pocs.length,
        emExecucao: pocs.filter(p => p.status === 'Em Execução').length,
        concluidos: pocs.filter(p => p.status === 'Concluído').length,
        orcamentoTotal: pocs.reduce((sum, p) => sum + p.budget, 0)
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <BarChart3 className="h-8 w-8" />
                        Provas de Conceito (POC)
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Gestão e acompanhamento de POCs em andamento
                    </p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova POC
                </Button>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total de POCs</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <BarChart3 className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Em Execução</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.emExecucao}</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Concluídos</p>
                                <p className="text-2xl font-bold text-green-600">{stats.concluidos}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Orçamento Total</p>
                                <p className="text-2xl font-bold">
                                    {stats.orcamentoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                                </p>
                            </div>
                            <FileText className="h-8 w-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filtros */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Buscar por título, cliente ou tecnologia..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={selectedStatus === 'all' ? 'default' : 'outline'}
                                onClick={() => setSelectedStatus('all')}
                                size="sm"
                            >
                                Todos
                            </Button>
                            <Button
                                variant={selectedStatus === 'Planejamento' ? 'default' : 'outline'}
                                onClick={() => setSelectedStatus('Planejamento')}
                                size="sm"
                            >
                                Planejamento
                            </Button>
                            <Button
                                variant={selectedStatus === 'Em Execução' ? 'default' : 'outline'}
                                onClick={() => setSelectedStatus('Em Execução')}
                                size="sm"
                            >
                                Em Execução
                            </Button>
                            <Button
                                variant={selectedStatus === 'Concluído' ? 'default' : 'outline'}
                                onClick={() => setSelectedStatus('Concluído')}
                                size="sm"
                            >
                                Concluído
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Lista de POCs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredPOCs.map(poc => (
                    <Card key={poc.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CardTitle className="text-lg">{poc.title}</CardTitle>
                                        {getStatusBadge(poc.status)}
                                    </div>
                                    <p className="text-sm text-gray-600">{poc.description}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Building className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-600">{poc.client}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-600">{poc.responsible}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-600">
                                        {new Date(poc.startDate).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-gray-400" />
                                    <span className="text-gray-600">
                                        {new Date(poc.endDate).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-500">Progresso</span>
                                    <span className="text-sm font-bold">{poc.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${getProgressColor(poc.progress)}`}
                                        style={{ width: `${poc.progress}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t">
                                <div>
                                    <p className="text-xs text-gray-500">Orçamento</p>
                                    <p className="text-sm font-semibold">
                                        {poc.budget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Tecnologia</p>
                                    <p className="text-sm font-semibold">{poc.technology}</p>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button variant="outline" size="sm" className="flex-1">
                                    <Eye className="h-4 w-4 mr-2" />
                                    Ver Detalhes
                                </Button>
                                {poc.status === 'Em Execução' && (
                                    <Button size="sm" className="flex-1">
                                        Atualizar Status
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredPOCs.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Nenhuma POC encontrada com os filtros selecionados.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}