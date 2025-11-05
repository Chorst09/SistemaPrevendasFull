"use client";

import React, { useState } from 'react';
import { VendedorResponsavel } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit, User, Phone, Mail, Building } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const vendedorSchema = z.object({
  fornecedor: z.string().min(1, 'Nome do fornecedor é obrigatório'),
  vendedor: z.string().min(1, 'Nome do vendedor é obrigatório'),
  telefone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().email('Email inválido'),
});

interface VendedoresManagerProps {
  vendedores: VendedorResponsavel[];
  onChange: (vendedores: VendedorResponsavel[]) => void;
}

export function VendedoresManager({ vendedores, onChange }: VendedoresManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendedor, setEditingVendedor] = useState<VendedorResponsavel | null>(null);

  const form = useForm<z.infer<typeof vendedorSchema>>({
    resolver: zodResolver(vendedorSchema),
    defaultValues: {
      fornecedor: '',
      vendedor: '',
      telefone: '',
      email: '',
    },
  });

  const handleOpenModal = (vendedor?: VendedorResponsavel) => {
    if (vendedor) {
      setEditingVendedor(vendedor);
      form.reset({
        fornecedor: vendedor.fornecedor,
        vendedor: vendedor.vendedor,
        telefone: vendedor.telefone,
        email: vendedor.email,
      });
    } else {
      setEditingVendedor(null);
      form.reset({
        fornecedor: '',
        vendedor: '',
        telefone: '',
        email: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVendedor(null);
    form.reset();
  };

  const onSubmit = (values: z.infer<typeof vendedorSchema>) => {
    if (editingVendedor) {
      // Editando vendedor existente
      const updatedVendedores = vendedores.map(v => 
        v.id === editingVendedor.id 
          ? { ...editingVendedor, ...values }
          : v
      );
      onChange(updatedVendedores);
    } else {
      // Adicionando novo vendedor
      const newVendedor: VendedorResponsavel = {
        id: Date.now().toString(),
        ...values,
      };
      onChange([...vendedores, newVendedor]);
    }
    handleCloseModal();
  };

  const handleRemove = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este vendedor?')) {
      onChange(vendedores.filter(v => v.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-md font-semibold">Vendedores Responsáveis</h4>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => handleOpenModal()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Vendedor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingVendedor ? 'Editar Vendedor' : 'Adicionar Vendedor Responsável'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fornecedor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fornecedor</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Fortinet, Microsoft, Dell..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vendedor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Vendedor</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Pedro Almeida" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 99999-9999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="vendedor@empresa.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={handleCloseModal}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingVendedor ? 'Atualizar' : 'Adicionar'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Vendedores */}
      <div className="space-y-2">
        {vendedores.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum vendedor cadastrado</p>
            <p className="text-sm">Clique em "Adicionar Vendedor" para começar</p>
          </div>
        ) : (
          vendedores.map((vendedor) => (
            <Card key={vendedor.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-blue-500" />
                    <Badge variant="outline">{vendedor.fornecedor}</Badge>
                    <span className="font-medium">{vendedor.vendedor}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
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
                <div className="flex space-x-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenModal(vendedor)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(vendedor.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}