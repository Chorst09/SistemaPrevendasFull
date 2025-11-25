'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ProposalHeaderProps {
  pageNumber?: number;
}

interface ProposalFooterProps {
  pageNumber?: number;
}

export function ProposalHeader({ pageNumber }: ProposalHeaderProps) {
  const [headerError, setHeaderError] = useState(false);

  return (
    <div className="w-full h-24 bg-white">
      {!headerError ? (
        <div className="relative w-full h-full">
          <Image
            src="/images/proposal/header.png"
            alt="Cabeçalho da Proposta"
            fill
            className="object-contain object-center"
            onError={() => setHeaderError(true)}
            priority
          />
        </div>
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-slate-600 via-slate-500 to-slate-700 flex items-center justify-center">
          <div className="text-white text-center px-4">
            <div className="text-sm font-semibold mb-1">📤 Cabeçalho da Proposta</div>
            <div className="text-xs opacity-75">Adicione header.png em /public/images/proposal/</div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ProposalFooter({ pageNumber }: ProposalFooterProps) {
  const [footerError, setFooterError] = useState(false);

  return (
    <div className="relative w-full h-48 bg-white">
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
        <div className="w-full h-full">
          <div className="h-16 bg-gradient-to-r from-cyan-500 via-cyan-400 to-slate-600"></div>
          <div className="h-32 bg-white flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-600 mb-1">📤 Rodapé da Proposta</div>
              <div className="text-xs text-gray-400">Adicione footer.png em /public/images/proposal/</div>
            </div>
          </div>
        </div>
      )}
      
      {pageNumber && (
        <div className="absolute bottom-6 right-8 text-gray-600 text-sm font-medium bg-white/90 px-3 py-1 rounded shadow">
          Página {pageNumber}
        </div>
      )}
    </div>
  );
}
