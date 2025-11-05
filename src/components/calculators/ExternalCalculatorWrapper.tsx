"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Save, AlertCircle } from 'lucide-react';
import { ProposalClientForm, ClientData } from './ProposalClientForm';
import { usePricingIntegration } from '@/hooks/use-pricing-integration';
import { PricingProposal } from '@/hooks/use-quote-integration';

interface ExternalCalculatorWrapperProps {
  src: string;
  title: string;
  module: PricingProposal['module'];
  description?: string;
}

export function ExternalCalculatorWrapper({ 
  src, 
  title, 
  module, 
  description 
}: ExternalCalculatorWrapperProps) {
  const [showClientForm, setShowClientForm] = useState(false);
  const [proposalData, setProposalData] = useState<any>(null);
  const { createQuoteFromPricingData } = usePricingIntegration();

  // Função para capturar dados do iframe (se disponível)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verificar se a mensagem vem do iframe correto
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'PRICING_PROPOSAL') {
        setProposalData(event.data.payload);
        setShowClientForm(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleClientFormSubmit = (clientData: ClientData) => {
    if (!proposalData) {
      // Se não há dados do iframe, criar proposta básica
      const basicProposal = {
        name: clientData.nomeProjeto,
        clientName: clientData.razaoSocial,
        totalPrice: 0, // Será preenchido manualmente
        module: module,
        clientData: clientData,
        technicalSpecs: {
          module: module,
          description: `Proposta criada via ${title}`,
          createdAt: new Date().toISOString()
        }
      };

      try {
        createQuoteFromPricingData(basicProposal);
        alert(`Orçamento criado com sucesso para ${title}!`);
      } catch (error) {
        alert('Erro ao criar orçamento. Tente novamente.');
      }
    } else {
      // Usar dados do iframe
      try {
        createQuoteFromPricingData({
          ...proposalData,
          module: module,
          clientData: clientData
        });
        alert(`Orçamento criado com sucesso para ${title}!`);
      } catch (error) {
        alert('Erro ao criar orçamento. Tente novamente.');
      }
    }

    setShowClientForm(false);
    setProposalData(null);
  };

  const handleManualProposal = () => {
    setProposalData(null);
    setShowClientForm(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header com informações e ações */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ExternalLink className="h-5 w-5" />
              <span>{title}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{module}</Badge>
              <Button
                onClick={handleManualProposal}
                size="sm"
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Criar Orçamento</span>
              </Button>
            </div>
          </CardTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>
              Após finalizar a precificação, clique em "Criar Orçamento" para enviar para a seção de Orçamentos
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Iframe do calculador externo */}
      <div className="flex-1 border rounded-lg overflow-hidden">
        <iframe 
          src={src} 
          className="w-full h-full border-0" 
          title={title}
          allow="fullscreen"
        />
      </div>

      {/* Modal de dados do cliente */}
      <ProposalClientForm
        isOpen={showClientForm}
        onClose={() => {
          setShowClientForm(false);
          setProposalData(null);
        }}
        onSubmit={handleClientFormSubmit}
      />
    </div>
  );
}