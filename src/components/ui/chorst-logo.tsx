"use client";

import React, { useState } from 'react';
import Image from 'next/image';

interface ChorstLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  logoSrc?: string; // Permite passar uma URL personalizada do logo
}

export function ChorstLogo({ size = 'md', className = '', logoSrc }: ChorstLogoProps) {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32',
    '2xl': 'w-48 h-48'
  };

  const pixelSizes = {
    sm: 48,
    md: 64,
    lg: 80,
    xl: 128,
    '2xl': 192
  };

  // Se há uma imagem personalizada e não houve erro, usa a imagem
  if (logoSrc && !imageError) {
    return (
      <div className={`flex items-center space-x-4 ${className}`}>
        <div className="relative">
          <div className={`${sizeClasses[size]} relative overflow-hidden rounded-lg shadow-lg bg-white/10 backdrop-blur-sm`}>
            <Image
              src={logoSrc}
              alt="Chorst Consultoria Logo"
              width={pixelSizes[size]}
              height={pixelSizes[size]}
              className="object-contain w-full h-full"
              onError={() => setImageError(true)}
              priority
            />
          </div>
        </div>
      </div>
    );
  }

  // Fallback para o SVG quando não há imagem ou há erro
  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {/* Logo da Chorst Consultoria */}
      <div className="relative">
        <div className={`${sizeClasses[size]} relative overflow-hidden rounded-lg shadow-lg`}>
          {/* Logo SVG baseado na imagem fornecida */}
          <svg 
            className="w-full h-full" 
            viewBox="0 0 400 400" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Definições de gradientes */}
            <defs>
              <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="30%" stopColor="#1e40af" />
                <stop offset="70%" stopColor="#1e3a8a" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#92400e" />
                <stop offset="30%" stopColor="#a16207" />
                <stop offset="70%" stopColor="#ca8a04" />
                <stop offset="100%" stopColor="#92400e" />
              </linearGradient>
              <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#f8fafc" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </linearGradient>
            </defs>
            
            {/* Fundo azul escuro */}
            <rect width="400" height="400" fill="url(#backgroundGradient)" />
            
            {/* Círculo principal dourado */}
            <ellipse cx="200" cy="240" rx="180" ry="140" fill="url(#circleGradient)" opacity="0.95" />
            
            {/* Linhas horizontais decorativas douradas */}
            <line x1="20" y1="140" x2="380" y2="140" stroke="#ca8a04" strokeWidth="6" opacity="0.8" />
            <line x1="20" y1="340" x2="380" y2="340" stroke="#ca8a04" strokeWidth="6" opacity="0.8" />
            
            {/* Estrela no topo */}
            <g transform="translate(200, 60)">
              <polygon 
                points="0,-15 4,-5 15,-5 7,2 11,12 0,6 -11,12 -7,2 -15,-5 -4,-5" 
                fill="white" 
                stroke="#ca8a04" 
                strokeWidth="1"
              />
            </g>
            
            {/* Texto CH no centro */}
            <text 
              x="200" 
              y="180" 
              textAnchor="middle" 
              fill="url(#textGradient)"
              style={{ 
                fontSize: '48px', 
                fontFamily: 'serif', 
                fontWeight: 'bold',
                letterSpacing: '2px'
              }}
            >
              CH
            </text>
            
            {/* Texto CHORST grande */}
            <text 
              x="200" 
              y="260" 
              textAnchor="middle" 
              fill="url(#textGradient)"
              style={{ 
                fontSize: '72px', 
                fontFamily: 'serif', 
                fontWeight: 'bold',
                letterSpacing: '6px',
                fontStyle: 'italic'
              }}
            >
              CHORST
            </text>
            
            {/* Texto CHORST CONSULTORIA na parte inferior */}
            <text 
              x="200" 
              y="320" 
              textAnchor="middle" 
              fill="#ca8a04"
              style={{ 
                fontSize: '24px', 
                fontFamily: 'sans-serif', 
                fontWeight: '600',
                letterSpacing: '3px'
              }}
            >
              CHORST CONSULTORIA
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}