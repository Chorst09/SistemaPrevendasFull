"use client";

import React from 'react';
import { Partner } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Globe, ShoppingCart, User, Phone, Mail, Building } from 'lucide-react';

interface PartnerDetailsProps {
  partner: Partner;
}

export function PartnerDetails({ partner }: PartnerDetailsProps) {
  const openLink = (url: string) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>{partner.name}</span>
            </CardTitle>
            <Badge variant={partner.status === 'Ativo' ? 'default' : 'secondary'}>
              {partner.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Tipo:</span>
              <span className="text-sm">{partner.type}</span>
            </div>
            
            {partner.mainContact && (
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Contato Principal:</span>
                <span className="text-sm">{partner.mainContact}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Email:</span>
              <span className="text-sm">{partner.contact}</span>
            </div>
            
            {partner.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Telefone:</span>
                <span className="text-sm">{partner.phone}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informações Específicas por Tipo */}
      {partner.type === 'Distribuidor' && (
        <Card>
          <CardHeader>
            <CardTitle>Informações do Portal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Site de Acesso */}
            {partner.site && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Site de Acesso</p>
                    <p className="text-xs text-muted-foreground">{partner.site}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openLink(partner.site!)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Site E-commerce */}
            {partner.siteEcommerce && (
              <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Site E-commerce</p>
                    <p className="text-xs text-muted-foreground">{partner.siteEcommerce}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openLink(partner.siteEcommerce!)}
                  className="border-green-200 hover:bg-green-100 dark:border-green-800 dark:hover:bg-green-900/20"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Credenciais Portal */}
            {(partner.login || partner.password) && (
              <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <p className="text-sm font-medium mb-2">Credenciais Portal</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {partner.login && (
                    <div>
                      <span className="font-medium">Login:</span> {partner.login}
                    </div>
                  )}
                  {partner.password && (
                    <div>
                      <span className="font-medium">Senha:</span> {partner.password}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Credenciais E-commerce */}
            {(partner.loginEcommerce || partner.passwordEcommerce) && (
              <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
                <p className="text-sm font-medium mb-2">Credenciais E-commerce</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {partner.loginEcommerce && (
                    <div>
                      <span className="font-medium">Login:</span> {partner.loginEcommerce}
                    </div>
                  )}
                  {partner.passwordEcommerce && (
                    <div>
                      <span className="font-medium">Senha:</span> {partner.passwordEcommerce}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Produtos */}
            {partner.products && (
              <div className="p-3 border rounded-lg">
                <p className="text-sm font-medium mb-2">Produtos Principais</p>
                <p className="text-sm text-muted-foreground">{partner.products}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Vendedores Responsáveis - apenas para Distribuidores */}
      {partner.type === 'Distribuidor' && partner.vendedoresResponsaveis && partner.vendedoresResponsaveis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Vendedores Responsáveis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {partner.vendedoresResponsaveis.map((vendedor) => (
              <div key={vendedor.id} className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-900/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-blue-600">{vendedor.fornecedor}</span>
                  </div>
                  <span className="text-sm font-medium">{vendedor.vendedor}</span>
                </div>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Phone className="h-3 w-3" />
                    <span>{vendedor.telefone}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Mail className="h-3 w-3" />
                    <span>{vendedor.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {partner.type === 'Fornecedor' && (
        <Card>
          <CardHeader>
            <CardTitle>Informações de RO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Site Partner */}
            {partner.sitePartner && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Site Partner</p>
                    <p className="text-xs text-muted-foreground">{partner.sitePartner}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openLink(partner.sitePartner!)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Site RO */}
            {partner.siteRO && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">Site Abertura de RO</p>
                    <p className="text-xs text-muted-foreground">{partner.siteRO}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openLink(partner.siteRO!)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Procedimento RO */}
            {partner.procedimentoRO && (
              <div className="p-3 border rounded-lg">
                <p className="text-sm font-medium mb-2">Procedimento para RO</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{partner.procedimentoRO}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}