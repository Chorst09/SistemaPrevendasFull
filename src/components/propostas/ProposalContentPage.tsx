'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { ProposalPageLayout } from './ProposalPageLayout';

interface ProposalContentPageProps {
  pageNumber: number;
  title: string;
  content: React.ReactNode;
  onContinue: () => void;
  onBack: () => void;
}

export function ProposalContentPage({ 
  pageNumber, 
  title,
  content,
  onContinue, 
  onBack 
}: ProposalContentPageProps) {
  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Botão Voltar */}
        <Button
          onClick={onBack}
          variant="outline"
          className="mb-4 bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        {/* Página com layout padrão */}
        <ProposalPageLayout pageNumber={pageNumber}>
          <div className="p-12">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b-2 border-cyan-500 pb-4">
              {title}
            </h1>
            <div className="text-gray-700 leading-relaxed">
              {content}
            </div>
          </div>
        </ProposalPageLayout>

        {/* Botão Continuar */}
        <Button
          onClick={onContinue}
          size="lg"
          className="w-full mt-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-6 text-lg font-semibold rounded-xl shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all transform hover:scale-105"
        >
          Continuar
          <ArrowRight className="h-6 w-6 ml-3" />
        </Button>
      </div>
    </div>
  );
}
