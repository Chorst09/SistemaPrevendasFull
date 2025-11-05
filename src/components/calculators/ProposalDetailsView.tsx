"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  Calendar,
  DollarSign,
  Server,
  Cpu,
  HardDrive,
  MemoryStick
} from 'lucide-react';

interface VMConfig {
  id: string;
  name: string;
  vcpu: number;
  ram: number;
  storageType: string;
  storageSize: number;
  networkCard: string;
  os: string;
  backupSize: number;
  additionalIP: boolean;
  additionalSnapshot: boolean;
  vpnSiteToSite: boolean;
  quantity: number;
}

interface Proposal {
  id: string;
  proposalNumber: string;
  name: string;
  clientName: string;
  date: string;
  vms: VMConfig[];
  totalPrice: number;
  clientData?: {
    razaoSocial: string;
    nomeContato: string;
    telefoneCliente: string;
    emailCliente: string;
    nomeProjeto: string;
    nomeGerente: string;
    telefoneGerente: string;
    emailGerente: string;
  };
}

interface ProposalDetailsViewProps {
  proposal: Proposal;
  calculateVMPrice: (vm: VMConfig) => number;
}

export function ProposalDetailsView({ proposal, calculateVMPrice }: ProposalDetailsViewProps) {
  if (!proposal.clientData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Dados do cliente não disponíveis para esta proposta.</p>
      </div>
    );
  }

  const { clientData } = proposal;

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Proposta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-blue-500" />
              <span>Proposta {proposal.proposalNumber}</span>
            </div>
            <Badge variant="outline">
              {new Date(proposal.date).toLocaleDateString('pt-BR')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Projeto</h3>
              <p className="text-2xl font-bold text-blue-600">{clientData.nomeProjeto}</p>
            </div>
            <div className="text-right">
              <h3 className="font-semibold text-lg mb-2">Valor Total</h3>
              <p className="text-2xl font-bold text-green-600">
                {proposal.totalPrice.toLocaleString('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                })}/mês
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dados do Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-blue-500" />
              <span>Dados do Cliente</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Razão Social</label>
              <p className="text-lg font-semibold">{clientData.razaoSocial}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Contato Principal</label>
              <p className="font-medium">{clientData.nomeContato}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-xs text-muted-foreground">Telefone</label>
                  <p className="text-sm">{clientData.telefoneCliente}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-xs text-muted-foreground">Email</label>
                  <p className="text-sm">{clientData.emailCliente}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados do Gerente de Contas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-green-500" />
              <span>Gerente de Contas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nome</label>
              <p className="text-lg font-semibold">{clientData.nomeGerente}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-xs text-muted-foreground">Telefone</label>
                  <p className="text-sm">{clientData.telefoneGerente}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-xs text-muted-foreground">Email</label>
                  <p className="text-sm">{clientData.emailGerente}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                Responsável pelo acompanhamento comercial e técnico da proposta
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Especificações Técnicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5 text-purple-500" />
            <span>Especificações Técnicas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {proposal.vms.map((vm, index) => (
              <div key={vm.id} className="border rounded-lg p-4 bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-lg">{vm.name}</h4>
                  <Badge variant="secondary">Qtd: {vm.quantity}</Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Cpu className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">vCPU</p>
                      <p className="font-medium">{vm.vcpu} cores</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <MemoryStick className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">RAM</p>
                      <p className="font-medium">{vm.ram} GB</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <HardDrive className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Storage</p>
                      <p className="font-medium">{vm.storageSize} GB</p>
                      <p className="text-xs text-muted-foreground">{vm.storageType}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground">Sistema</p>
                    <p className="font-medium">{vm.os}</p>
                    <p className="text-xs text-muted-foreground">{vm.networkCard}</p>
                  </div>
                </div>

                {/* Serviços Adicionais */}
                {(vm.backupSize > 0 || vm.additionalIP || vm.additionalSnapshot || vm.vpnSiteToSite) && (
                  <div className="border-t pt-3">
                    <p className="text-sm font-medium mb-2">Serviços Adicionais:</p>
                    <div className="flex flex-wrap gap-2">
                      {vm.backupSize > 0 && (
                        <Badge variant="outline">Backup: {vm.backupSize} GB</Badge>
                      )}
                      {vm.additionalIP && (
                        <Badge variant="outline">IP Adicional</Badge>
                      )}
                      {vm.additionalSnapshot && (
                        <Badge variant="outline">Snapshot Adicional</Badge>
                      )}
                      {vm.vpnSiteToSite && (
                        <Badge variant="outline">VPN Site-to-Site</Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Valor por VM:</span>
                    <span className="font-semibold">
                      {calculateVMPrice(vm).toLocaleString('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      })}/mês
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total ({vm.quantity}x):</span>
                    <span className="font-bold text-green-600">
                      {(calculateVMPrice(vm) * vm.quantity).toLocaleString('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      })}/mês
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          {/* Resumo Financeiro */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold">Total da Proposta:</span>
              <span className="font-bold text-2xl text-green-600">
                {proposal.totalPrice.toLocaleString('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                })}/mês
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Valor mensal para {proposal.vms.length} VM{proposal.vms.length > 1 ? 's' : ''} configurada{proposal.vms.length > 1 ? 's' : ''}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}