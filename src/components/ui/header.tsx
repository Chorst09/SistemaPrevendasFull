"use client";

import React from 'react';
import { Search, User, Menu, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChorstLogo } from '@/components/ui/chorst-logo';

interface HeaderProps {
    currentTitle: string;
    currentSubtitle?: string;
    logoSrc?: string | null;
}

export function Header({ currentTitle, currentSubtitle, logoSrc }: HeaderProps) {
    return (
        <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 border-b border-slate-700/50 shadow-2xl relative overflow-hidden">
            {/* Efeito de brilho sutil */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>

            {/* Logo e Título Principal */}
            <div className="px-4 py-3 border-b border-slate-700/30 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 md:space-x-4">
                        {/* Logo da Chorst Consultoria */}
                        <div className="flex-shrink-0">
                            <ChorstLogo size="lg" logoSrc={logoSrc || undefined} />
                        </div>

                        {/* Separador - oculto em mobile */}
                        <div className="hidden md:block h-12 w-px bg-gradient-to-b from-transparent via-slate-400 to-transparent"></div>

                        {/* Nome do Sistema */}
                        <div className="flex flex-col min-w-0">
                            <h1 className="text-lg md:text-xl font-bold text-white bg-gradient-to-r from-white to-amber-100 bg-clip-text text-transparent">
                                Sistema Pré-Venda TI
                            </h1>
                            <p className="text-xs text-slate-300 font-medium">
                                Gestão Completa de Precificações, Oportunidades e Propostas
                            </p>
                        </div>
                    </div>

                    {/* Controles do Header */}
                    <div className="flex items-center space-x-3">
                        {/* Barra de busca - Desktop */}
                        <div className="relative hidden lg:block">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 w-3 h-3" />
                            <Input
                                type="search"
                                placeholder="Buscar..."
                                className="pl-8 w-48 h-8 text-sm bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-amber-500 focus:ring-amber-500/20"
                            />
                        </div>

                        {/* Botões de ação */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="lg:hidden h-8 w-8 text-white hover:bg-slate-700/50"
                        >
                            <Search className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 text-white hover:bg-slate-700/50"
                        >
                            <Settings className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="relative h-8 w-8 rounded-full text-white hover:bg-slate-700/50"
                        >
                            <User className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="md:hidden h-8 w-8 text-white hover:bg-slate-700/50"
                        >
                            <Menu className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Breadcrumb/Navegação Atual */}
            <div className="px-4 py-2 bg-slate-800/30 relative z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-white capitalize">
                            {currentTitle}
                        </h2>
                        {currentSubtitle && (
                            <p className="text-xs text-slate-300 mt-0.5">
                                {currentSubtitle}
                            </p>
                        )}
                    </div>

                    {/* Indicadores de status ou informações adicionais */}
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-xs text-slate-300">Online</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}