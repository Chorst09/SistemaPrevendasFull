"use client";

import { useState, useEffect } from 'react';

const LOGO_STORAGE_KEY = 'chorst-custom-logo';

export function useLogo() {
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar logo do localStorage na inicialização
  useEffect(() => {
    try {
      const savedLogo = localStorage.getItem(LOGO_STORAGE_KEY);
      if (savedLogo) {
        setLogoSrc(savedLogo);
      }
    } catch (error) {
      console.error('Erro ao carregar logo do localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Função para atualizar o logo
  const updateLogo = (newLogoSrc: string | null) => {
    try {
      if (newLogoSrc) {
        localStorage.setItem(LOGO_STORAGE_KEY, newLogoSrc);
      } else {
        localStorage.removeItem(LOGO_STORAGE_KEY);
      }
      setLogoSrc(newLogoSrc);
    } catch (error) {
      console.error('Erro ao salvar logo no localStorage:', error);
    }
  };

  // Função para remover o logo
  const removeLogo = () => {
    updateLogo(null);
  };

  return {
    logoSrc,
    isLoading,
    updateLogo,
    removeLogo
  };
}