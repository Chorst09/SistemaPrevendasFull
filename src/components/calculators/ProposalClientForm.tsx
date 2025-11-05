"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, User, Phone, Mail, FileText, Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const clientFormSchema = z.object({
  // Dados do Cliente
  razaoSocial: z.string().min(1, 'Razão social é obrigatória'),
  nomeContato: z.string().min(1, 'Nome do contato é obrigatório'),
  telefoneCliente: z.string().min(1, 'Telefone do cliente é obrigatório'),
  emailCliente: z.string().email('Email do cliente inválido'),
  nomeProjeto: z.string().min(1, 'Nome do projeto é obrigatório'),
  
  // Dados do Gerente de Contas
  nomeGerente: z.string().min(1, 'Nome do gerente é obrigatório'),
  telefoneGerente: z.string().min(1, 'Telefone do gerente é obrigatório'),
  emailGerente: z.string().email('Email do gerente inválido'),
});

export interface ClientData {
  razaoSocial: string;
  nomeContato: string;
  telefoneCliente: string;
  emailCliente: string;
  nomeProjeto: string;
  nomeGerente: string;
  telefoneGerente: string;
  emailGerente: string;
}

interface ProposalClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClientData) => void;
  initialData?: Partial<ClientData>;
  isLoading?: boolean;
}

export function ProposalClientForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData,
  isLoading = false
}: ProposalClientFormProps) {
  
  const form = useForm<ClientData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      razaoSocial: initialData?.razaoSocial || '',
      nomeContato: initialData?.nomeContato || '',
      telefoneCliente: initialData?.telefoneCliente || '',
      emailCliente: initialData?.emailCliente || '',
      nomeProjeto: initialData?.nomeProjeto || '',
      nomeGerente: initialData?.nomeGerente || '',
      telefoneGerente: initialData?.telefoneGerente || '',
      emailGerente: initialData?.emailGerente || '',
    }
  });

  const { register, handleSubmit, formState: { errors }, reset } = form;

  const handleFormSubmit = (data: ClientData) => {
    onSubmit(data);
    reset();
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <FileText className="h-6 w-6" />
            <span>Dados da Proposta</span>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Preencha os dados do cliente e gerente de contas para criar a proposta
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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
                  <Label htmlFor="razaoSocial">Razão Social *</Label>
                  <Input
                    id="razaoSocial"
                    {...register('razaoSocial')}
                    placeholder="Ex: Empresa ABC Ltda"
                    className={errors.razaoSocial ? 'border-red-500' : ''}
                  />
                  {errors.razaoSocial && (
                    <p className="text-sm text-red-500 mt-1">{errors.razaoSocial.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="nomeContato">Nome do Contato *</Label>
                  <Input
                    id="nomeContato"
                    {...register('nomeContato')}
                    placeholder="Ex: João Silva"
                    className={errors.nomeContato ? 'border-red-500' : ''}
                  />
                  {errors.nomeContato && (
                    <p className="text-sm text-red-500 mt-1">{errors.nomeContato.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="telefoneCliente">Telefone *</Label>
                    <Input
                      id="telefoneCliente"
                      {...register('telefoneCliente')}
                      placeholder="(11) 99999-9999"
                      className={errors.telefoneCliente ? 'border-red-500' : ''}
                    />
                    {errors.telefoneCliente && (
                      <p className="text-sm text-red-500 mt-1">{errors.telefoneCliente.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="emailCliente">Email *</Label>
                    <Input
                      id="emailCliente"
                      type="email"
                      {...register('emailCliente')}
                      placeholder="contato@empresa.com"
                      className={errors.emailCliente ? 'border-red-500' : ''}
                    />
                    {errors.emailCliente && (
                      <p className="text-sm text-red-500 mt-1">{errors.emailCliente.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="nomeProjeto">Nome do Projeto *</Label>
                  <Input
                    id="nomeProjeto"
                    {...register('nomeProjeto')}
                    placeholder="Ex: Migração para Cloud"
                    className={errors.nomeProjeto ? 'border-red-500' : ''}
                  />
                  {errors.nomeProjeto && (
                    <p className="text-sm text-red-500 mt-1">{errors.nomeProjeto.message}</p>
                  )}
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
                  <Label htmlFor="nomeGerente">Nome do Gerente *</Label>
                  <Input
                    id="nomeGerente"
                    {...register('nomeGerente')}
                    placeholder="Ex: Maria Santos"
                    className={errors.nomeGerente ? 'border-red-500' : ''}
                  />
                  {errors.nomeGerente && (
                    <p className="text-sm text-red-500 mt-1">{errors.nomeGerente.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="telefoneGerente">Telefone *</Label>
                    <Input
                      id="telefoneGerente"
                      {...register('telefoneGerente')}
                      placeholder="(11) 88888-8888"
                      className={errors.telefoneGerente ? 'border-red-500' : ''}
                    />
                    {errors.telefoneGerente && (
                      <p className="text-sm text-red-500 mt-1">{errors.telefoneGerente.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="emailGerente">Email *</Label>
                    <Input
                      id="emailGerente"
                      type="email"
                      {...register('emailGerente')}
                      placeholder="gerente@empresa.com"
                      className={errors.emailGerente ? 'border-red-500' : ''}
                    />
                    {errors.emailGerente && (
                      <p className="text-sm text-red-500 mt-1">{errors.emailGerente.message}</p>
                    )}
                  </div>
                </div>

                {/* Informações Adicionais */}
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Informações Importantes:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• O gerente de contas será o responsável pelo acompanhamento da proposta</li>
                    <li>• Todos os campos marcados com * são obrigatórios</li>
                    <li>• Os dados serão utilizados para gerar a proposta comercial</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Cancelar</span>
            </Button>
            
            <Button
              type="submit"
              className="flex items-center space-x-2"
              disabled={isLoading}
            >
              <Save className="h-4 w-4" />
              <span>{isLoading ? 'Gerando PDF...' : 'Criar Proposta'}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}