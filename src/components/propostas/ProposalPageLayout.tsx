'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ProposalPageLayoutProps {
  children: React.ReactNode;
  pageNumber?: number;
}

export function ProposalPageLayout({ children, pageNumber }: ProposalPageLayoutProps) {
  const [headerError, setHeaderError] = useState(false);
  const [footerError, setFooterError] = useState(false);

  return (
    <div className="relative w-full aspect-[3/4] bg-white rounded-lg overflow-hidden shadow-2xl">
      {/* Cabeçalho */}
      <div className="absolute top-0 left-0 right-0 h-24 z-10 bg-white">
        {!headerError ? (
          <div className="relative w-full h-full">
            <Image
              src="/images/proposal/header.png"
              alt="Cabeçalho da Proposta"
              fill
              className="object-cover object-center"
              onError={() => setHeaderError(true)}
              priority
            />
          </div>
        ) : (
          // Fallback caso a imagem não exista
          <div className="w-full h-full bg-gradient-to-r from-slate-600 via-slate-500 to-slate-700 flex items-center justify-center">
            <div className="text-white text-center px-4">
              <div className="text-sm font-semibold mb-1">📤 Cabeçalho da Proposta</div>
              <div className="text-xs opacity-75">Adicione header.png em /public/images/proposal/</div>
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo da página */}
      <div className="absolute top-24 bottom-48 left-0 right-0 overflow-auto">
        {children}
      </div>

      {/* Rodapé */}
      <div className="absolute bottom-0 left-0 right-0 h-48 z-10 bg-white">
        {!footerError ? (
          <div className="relative w-full h-full">
            <Image
              src="/images/proposal/footer.png"
              alt="Rodapé da Proposta"
              fill
              className="object-contain object-bottom"
              onError={() => setFooterError(true)}
              priority
            />
          </div>
        ) : (
          // Fallback caso a imagem não exista
          <div className="w-full h-full">
            {/* Barra superior cyan/azul */}
            <div className="h-16 bg-gradient-to-r from-cyan-500 via-cyan-400 to-slate-600"></div>
            
            {/* Logo Double */}
            <div className="h-24 bg-white flex items-center justify-center">
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-600 mb-1">📤 Rodapé da Proposta</div>
                <div className="text-xs text-gray-400">Adicione footer.png em /public/images/proposal/</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Número da página sobreposto */}
        {pageNumber && (
          <div className="absolute bottom-6 right-8 text-gray-600 text-sm font-medium bg-white/90 px-3 py-1 rounded shadow">
            Página {pageNumber}
          </div>
        )}
      </div>
    </div>
  );
}
