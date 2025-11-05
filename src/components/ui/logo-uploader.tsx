"use client";

import React, { useState, useRef } from 'react';
import { Upload, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChorstLogo } from '@/components/ui/chorst-logo';

interface LogoUploaderProps {
  onLogoChange?: (logoUrl: string | null) => void;
  currentLogo?: string | null;
}

export function LogoUploader({ onLogoChange, currentLogo }: LogoUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentLogo || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('O arquivo deve ter no máximo 5MB.');
      return;
    }

    setUploading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      onLogoChange?.(result);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setPreview(null);
    onLogoChange?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Logo da Empresa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview do Logo Atual */}
        <div className="flex justify-center">
          <ChorstLogo 
            size="xl" 
            logoSrc={preview || undefined}
          />
        </div>

        {/* Área de Upload */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
          
          {uploading ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Carregando...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Arraste uma imagem aqui ou</p>
                <button
                  type="button"
                  onClick={openFileDialog}
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  clique para selecionar
                </button>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG até 5MB</p>
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex space-x-2">
          <Button
            onClick={openFileDialog}
            variant="outline"
            className="flex-1"
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Selecionar Arquivo
          </Button>
          
          {preview && (
            <Button
              onClick={removeLogo}
              variant="outline"
              size="icon"
              className="text-red-500 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {preview && (
          <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
            <Check className="h-4 w-4" />
            <span>Logo carregado com sucesso!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}