// src/components/partners/PartnerView.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Edit, Trash2, Package, Search } from "lucide-react";
import PartnerForm from "./PartnerForm"; // Assumindo que você tem este componente
import { Partner } from "@/lib/types"; // Assumindo que você tem este tipo

// Importar Firebase
import { getFirestore, doc, collection, setDoc, deleteDoc, getDocs } from "firebase/firestore";
// Importação de User e useAuth removidas
// import { User } from "firebase/auth";
// import { useAuth } from "@/hooks/use-auth";
import { getFirebaseApp } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import { PartnerType } from "@/lib/types/enums";


// Defina as props para o componente
interface PartnerViewProps {
  partnerType: string; // Ex: "Cliente" ou "Fornecedor"
}

const PartnerView: React.FC<PartnerViewProps> = ({ partnerType }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Uso de useAuth removido
  // const { user, loading: loadingAuth } = useAuth();
  // Não precisamos mais do estado de carregamento de autenticação aqui

  // Obtém a instância do Firestore (db)
  const app = getFirebaseApp();
  const db = app ? getFirestore(app) : null;

  // Função para construir a referência da coleção Firestore (agora sem subcoleção de usuário)
  const getPartnersCollectionRef = () => {
    if (!db) return null;
    // Altere o caminho da coleção para ser direto, sem o userId
    return collection(db, "partners"); // Coleção "partners" no nível raiz
  };

  // Função para carregar parceiros do Firestore
  const loadPartners = async () => {
    // Verifica se Firestore está disponível antes de tentar carregar
    if (!db) {
      setPartners([]);
      setLoadingPartners(false);
      console.error("Firestore não disponível para carregar parceiros.");
      return;
    }

    setLoadingPartners(true); // Indica que o carregamento começou
    const partnersCollectionRef = getPartnersCollectionRef(); // Usa a nova função

    if (!partnersCollectionRef) {
      setLoadingPartners(false);
      console.error("Referência da coleção de parceiros não disponível.");
      return;
    }

    try {
      const querySnapshot = await getDocs(partnersCollectionRef);
      const loadedPartners: Partner[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: parseInt(doc.id) || Date.now(), // Converte para number ou usa timestamp
          name: data.name || '',
          type: data.type || 'Distribuidor',
          contact: data.contact || '',
          phone: data.phone || '',
          status: data.status || 'Ativo',
          mainContact: data.mainContact,
          site: data.site,
          siteEcommerce: data.siteEcommerce,
          products: data.products,
          sitePartner: data.sitePartner,
          siteRO: data.siteRO,
          templateRO: data.templateRO,
          procedimentoRO: data.procedimentoRO,
          login: data.login,
          password: data.password,
          loginEcommerce: data.loginEcommerce,
          passwordEcommerce: data.passwordEcommerce,
          vendedoresResponsaveis: data.vendedoresResponsaveis || []
        } as Partner;
      });

      // Filtrar por partnerType, se necessário, no cliente após carregar tudo
      // Ou você pode adicionar uma query no getDocs para filtrar no lado do servidor
      const filteredPartners = loadedPartners.filter(p => p.type === partnerType); // Exemplo de filtro

      setPartners(filteredPartners); // Atualiza o estado local com os parceiros carregados e filtrados
      console.log(`Parceiros (${partnerType}) carregados:`, filteredPartners);
    } catch (error) {
      console.error("Erro ao carregar parceiros:", error);
      // Implementar tratamento de erro na UI (ex: exibir mensagem de erro)
    } finally {
      setLoadingPartners(false); // Indica que o carregamento terminou
    }
  };

  // Efeito para carregar parceiros quando o componente monta
  useEffect(() => {
    loadPartners();
    // Removida a dependência 'user'
  }, [db, partnerType]); // Adicionada dependência 'db' e 'partnerType'


  const handleOpenModal = (partner?: Partner) => {
    setEditingPartner(partner || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingPartner(null);
    setIsModalOpen(false);
  };

  // Função para remover campos undefined dos dados
  const cleanDataForFirestore = (data: any) => {
    const cleaned: any = {};
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        cleaned[key] = data[key];
      }
    });
    return cleaned;
  };

  // Lógica para salvar/atualizar parceiro no Firestore
  const handleSave = async (partnerData: Partner) => {
    // Verifica se Firestore está disponível antes de salvar
    if (!db) {
      console.error("Firestore não disponível para salvar.");
      // Implementar feedback para o usuário (ex: toast de erro)
      return;
    }

    const partnersCollectionRef = getPartnersCollectionRef(); // Usa a nova função

    if (!partnersCollectionRef) {
      console.error("Referência da coleção de parceiros não disponível.");
      // Implementar feedback para o usuário
      return;
    }

    try {
      if (partnerData.id) {
        // Editando um parceiro existente (o ID do documento já existe)
        const partnerDocRef = doc(partnersCollectionRef, partnerData.id.toString());
        // Cria um objeto com os dados a serem salvos, excluindo o ID (que já está no caminho)
        const { id, ...rawDataToSave } = partnerData;
        const dataToSave = cleanDataForFirestore(rawDataToSave);
        await setDoc(partnerDocRef, dataToSave, { merge: true }); // Atualiza o documento mesclando os dados
        console.log("Parceiro atualizado no Firestore:", partnerData.id);

      } else {
        // Adicionando um novo parceiro (Firestore gerará o ID do documento)
        // doc() sem um ID específico cria uma referência com um ID automático
        const newPartnerRef = doc(partnersCollectionRef);
        // Inclua o partnerType nos dados ao salvar um novo parceiro
        const rawDataToSave = { ...partnerData, type: partnerType };
        const dataToSave = cleanDataForFirestore(rawDataToSave);
        await setDoc(newPartnerRef, dataToSave); // Salva os dados no novo documento
        console.log("Novo parceiro adicionado ao Firestore com ID:", newPartnerRef.id);

        // Atualizar o estado local com o novo parceiro incluindo o ID gerado pelo Firestore e o type
        setPartners([...partners, {
          ...dataToSave,
          id: parseInt(newPartnerRef.id) || Date.now(),
          type: partnerType as PartnerType
        }]);

      }

      // Após salvar no Firestore, recarrega a lista para manter o estado local sincronizado
      loadPartners();

      handleCloseModal(); // Fecha o modal após salvar
      // Implementar toast de sucesso
    } catch (error) {
      console.error("Erro ao salvar parceiro no Firestore:", error);
      // Implementar tratamento de erro na UI (com toast)
    }
  };

  // Lógica para excluir parceiro do Firestore
  const handleDelete = async (partnerId: string) => {
    // Verifica se Firestore está disponível antes de excluir
    if (!db) {
      console.error("Firestore não disponível para excluir.");
      // Implementar feedback para o usuário
      return;
    }

    const partnersCollectionRef = getPartnersCollectionRef(); // Usa a nova função

    if (!partnersCollectionRef) {
      console.error("Referência da coleção de parceiros não disponível.");
      // Implementar feedback para o usuário
      return;
    }

    // Confirmação antes de excluir
    if (window.confirm("Tem certeza que deseja excluir este parceiro?")) {
      try {
        const partnerDocRef = doc(partnersCollectionRef, partnerId); // Obtém a referência do documento pelo ID
        await deleteDoc(partnerDocRef); // Exclui o documento do Firestore
        console.log("Parceiro excluído do Firestore:", partnerId);
        // Atualiza o estado local removendo o parceiro excluído para uma resposta rápida na UI
        setPartners(partners.filter(p => p.id.toString() !== partnerId));
        // Implementar toast de sucesso
      } catch (error) {
        console.error("Erro ao excluir parceiro do Firestore:", error);
        // Implementar tratamento de erro na UI (com toast)
      }
    }
  };

  // Filtrar parceiros baseado no termo de busca
  const filteredPartners = partners.filter(partner =>
    partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (partner.products && partner.products.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Card className="shadow-lg">
      {/* Não precisamos mais verificar loadingAuth */}
      {/* {!loadingAuth && ( */}
      <>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <CardTitle className="text-2xl mb-4 sm:mb-0">Lista de {partnerType}s</CardTitle>
          {/* O botão "Novo" não depende mais do usuário logado */}
          {/* {user && ( */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenModal()}>
                <PlusCircle size={20} className="mr-2" />
                Novo {partnerType}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingPartner ? `Editar ${partnerType}` : `Adicionar Novo ${partnerType}`}</DialogTitle>
              </DialogHeader>
              {/* Renderiza o formulário de parceiro */}
              {isModalOpen && (
                <PartnerForm
                  partner={editingPartner}
                  onSave={handleSave}
                  onCancel={handleCloseModal}
                  partnerType={partnerType as any}
                />
              )}
            </DialogContent>
          </Dialog>
          {/* )} */}
        </CardHeader>
        <CardContent>
          {/* Campo de busca e estatísticas */}
          <div className="mb-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome, contato ou produtos..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {!loadingPartners && (
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  Mostrando {filteredPartners.length} de {partners.length} {partnerType.toLowerCase()}s
                </span>
                <span>
                  {partners.filter(p => p.products && p.products.trim()).length} com produtos/serviços cadastrados
                </span>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            {/* Renderiza o loader enquanto carrega a lista de parceiros */}
            {loadingPartners ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Carregando {partnerType}s...</span>
              </div>
            ) : filteredPartners.length === 0 ? (
              // Mensagem se não houver parceiros
              <p className="text-center text-gray-500">
                {searchTerm ? `Nenhum ${partnerType} encontrado para "${searchTerm}".` : `Nenhum ${partnerType} encontrado.`}
              </p>
            ) : (
              // Renderiza a tabela de parceiros
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Produtos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Mapeia a lista de parceiros para linhas da tabela */}
                  {filteredPartners.map((partner) => (
                    <TableRow key={partner.id}>
                      <TableCell>{partner.name}</TableCell>
                      <TableCell>{partner.type}</TableCell>
                      <TableCell>{partner.contact}</TableCell>
                      <TableCell>{partner.phone}</TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {partner.products ? (
                            (() => {
                              const productList = partner.products.split(',').map(p => p.trim()).filter(p => p);
                              const displayProducts = productList.slice(0, 3);
                              const remainingCount = productList.length - 3;

                              return (
                                <div className="flex flex-wrap items-center gap-1">
                                  <Package className="h-4 w-4 text-blue-600 mr-1" />
                                  <div className="flex flex-wrap gap-1">
                                    {displayProducts.map((product, index) => (
                                      <span
                                        key={index}
                                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                                        title={product}
                                      >
                                        {product.length > 15 ? `${product.substring(0, 15)}...` : product}
                                      </span>
                                    ))}
                                    {remainingCount > 0 && (
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 px-2 text-xs bg-gray-100 hover:bg-gray-200"
                                          >
                                            +{remainingCount} mais
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md">
                                          <DialogHeader>
                                            <DialogTitle className="flex items-center gap-2">
                                              <Package className="h-5 w-5" />
                                              Produtos/Serviços - {partner.name}
                                            </DialogTitle>
                                          </DialogHeader>
                                          <div className="space-y-2">
                                            <p className="text-sm text-gray-600">
                                              Total de itens: {productList.length}
                                            </p>
                                            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
                                              {productList.map((product, index) => (
                                                <span
                                                  key={index}
                                                  className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                                                >
                                                  {product}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        </DialogContent>
                                      </Dialog>
                                    )}
                                  </div>
                                </div>
                              );
                            })()
                          ) : (
                            <div className="flex items-center text-gray-400 text-sm">
                              <Package className="h-4 w-4 mr-1" />
                              Nenhum produto/serviço cadastrado
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{partner.status}</TableCell>
                      <TableCell>
                        {/* Botões de ação (Editar e Excluir) - Excluir não depende mais do usuário logado */}
                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(partner)}>
                          <Edit size={18} />
                        </Button>
                        {/* Botão de excluir não depende mais do usuário logado */}
                        {/* {user && ( */}
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(partner.id.toString())}> {/* Usa partner.id! para afirmar que não é undefined */}
                          <Trash2 size={18} className="text-red-500" />
                        </Button>
                        {/* )} */}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </>
      {/* )} */}
    </Card>
  );
};

export default PartnerView;
