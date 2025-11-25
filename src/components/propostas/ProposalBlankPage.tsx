'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { ProposalPageLayout } from './ProposalPageLayout';

interface ProposalBlankPageProps {
  pageNumber?: number;
  title?: string;
  content?: React.ReactNode;
  onContinue?: () => void;
  onBack?: () => void;
  showNavigation?: boolean;
}

export function ProposalBlankPage({ 
  pageNumber, 
  title,
  content,
  onContinue, 
  onBack,
  showNavigation = true 
}: ProposalBlankPageProps) {
  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Botões de navegação */}
        {showNavigation && (
          <div className="flex justify-between mb-4">
            {onBack && (
              <Button
                onClick={onBack}
                variant="outline"
                className="bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            )}
            <div className="flex-1"></div>
          </div>
        )}

        {/* Página com layout padrão */}
        <ProposalPageLayout pageNumber={pageNumber}>
          <div className="p-12">
            {title && (
              <h1 className="text-3xl font-bold text-gray-800 mb-8">{title}</h1>
            )}
            {content || (
              <div className="text-gray-400 text-center py-20">
                Conteúdo da página
              </div>
            )}
          </div>
        </ProposalPageLayout>

        {/* Botão Continuar */}
        {showNavigation && onContinue && (
          <Button
            onClick={onContinue}
            size="lg"
            className="w-full mt-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-6 text-lg font-semibold rounded-xl shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all transform hover:scale-105"
          >
            Continuar
            <ArrowRight className="h-6 w-6 ml-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
