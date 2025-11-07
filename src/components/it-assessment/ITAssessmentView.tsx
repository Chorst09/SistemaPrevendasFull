"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    CheckSquare,
    Server,
    Shield,
    Cloud,
    Database,
    Network,
    Users,
    AlertTriangle,
    CheckCircle,
    XCircle
} from 'lucide-react';

export function ITAssessmentView() {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const categories = [
        { id: 'infrastructure', name: 'Infraestrutura', icon: Server, color: 'blue' },
        { id: 'security', name: 'Segurança', icon: Shield, color: 'red' },
        { id: 'cloud', name: 'Cloud', icon: Cloud, color: 'cyan' },
        { id: 'data', name: 'Dados', icon: Database, color: 'green' },
        { id: 'network', name: 'Rede', icon: Network, color: 'purple' },
        { id: 'users', name: 'Usuários', icon: Users, color: 'orange' }
    ];

    const assessmentItems = [
        {
            id: 1,
            category: 'infrastructure',
            title: 'Servidores e Hardware',
            description: 'Avaliação da infraestrutura física e virtual',
            status: 'completed',
            score: 85
        },
        {
            id: 2,
            category: 'security',
            title: 'Políticas de Segurança',
            description: 'Análise de políticas e controles de segurança',
            status: 'in-progress',
            score: 70
        },
        {
            id: 3,
            category: 'cloud',
            title: 'Migração para Cloud',
            description: 'Avaliação de prontidão para cloud',
            status: 'pending',
            score: 0
        },
        {
            id: 4,
            category: 'data',
            title: 'Backup e Recuperação',
            description: 'Análise de estratégias de backup',
            status: 'completed',
            score: 90
        },
        {
            id: 5,
            category: 'network',
            title: 'Infraestrutura de Rede',
            description: 'Avaliação de topologia e performance',
            status: 'completed',
            score: 75
        },
        {
            id: 6,
            category: 'users',
            title: 'Gestão de Usuários',
            description: 'Análise de controles de acesso',
            status: 'in-progress',
            score: 65
        }
    ];

    const filteredItems = selectedCategory === 'all'
        ? assessmentItems
        : assessmentItems.filter(item => item.category === selectedCategory);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Concluído</Badge>;
            case 'in-progress':
                return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3 mr-1" />Em Andamento</Badge>;
            case 'pending':
                return <Badge className="bg-gray-100 text-gray-800"><XCircle className="h-3 w-3 mr-1" />Pendente</Badge>;
            default:
                return null;
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const overallScore = Math.round(
        assessmentItems.reduce((sum, item) => sum + item.score, 0) / assessmentItems.length
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <CheckSquare className="h-8 w-8" />
                        Assessment de TI
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Avaliação completa da infraestrutura e processos de TI
                    </p>
                </div>
                <Button>
                    Novo Assessment
                </Button>
            </div>

            {/* Score Geral */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Score Geral</p>
                            <p className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
                                {overallScore}%
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">
                                {assessmentItems.filter(i => i.status === 'completed').length} de {assessmentItems.length} concluídos
                            </p>
                            <div className="w-48 bg-gray-200 rounded-full h-2 mt-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${(assessmentItems.filter(i => i.status === 'completed').length / assessmentItems.length) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Filtros por Categoria */}
            <Card>
                <CardHeader>
                    <CardTitle>Categorias</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={selectedCategory === 'all' ? 'default' : 'outline'}
                            onClick={() => setSelectedCategory('all')}
                            size="sm"
                        >
                            Todas
                        </Button>
                        {categories.map(category => {
                            const Icon = category.icon;
                            return (
                                <Button
                                    key={category.id}
                                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                                    onClick={() => setSelectedCategory(category.id)}
                                    size="sm"
                                    className="gap-2"
                                >
                                    <Icon className="h-4 w-4" />
                                    {category.name}
                                </Button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Lista de Assessments */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map(item => {
                    const category = categories.find(c => c.id === item.category);
                    const Icon = category?.icon || Server;

                    return (
                        <Card key={item.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <Icon className="h-5 w-5 text-blue-600" />
                                        <CardTitle className="text-lg">{item.title}</CardTitle>
                                    </div>
                                    {getStatusBadge(item.status)}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 mb-4">{item.description}</p>

                                {item.score > 0 && (
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-500">Score</span>
                                            <span className={`text-lg font-bold ${getScoreColor(item.score)}`}>
                                                {item.score}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${item.score >= 80 ? 'bg-green-600' :
                                                        item.score >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                                                    }`}
                                                style={{ width: `${item.score}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1">
                                        Ver Detalhes
                                    </Button>
                                    {item.status !== 'completed' && (
                                        <Button size="sm" className="flex-1">
                                            Continuar
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {filteredItems.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <p className="text-gray-500">Nenhum assessment encontrado nesta categoria.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}