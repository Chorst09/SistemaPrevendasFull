'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { useColorMigration } from '@/lib/migration/color-migration';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Settings, 
  Play, 
  Palette,
  Info
} from 'lucide-react';

/**
 * Indicador de status da migração que aparece na interface
 * Mostra o progresso atual e permite acesso rápido às configurações
 */
export function MigrationStatusIndicator() {
  const { status, config } = useColorMigration();

  if (!status.isActive && status.progress === 0) {
    return null; // Não mostra nada se não há migração ativa ou concluída
  }

  const getStatusIcon = () => {
    if (status.errors.length > 0) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    
    if (status.warnings.length > 0) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
    
    if (status.progress === 100) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    return <Settings className="h-4 w-4 text-blue-500 animate-spin" />;
  };

  const getStatusText = () => {
    if (status.errors.length > 0) return 'Erro na Migração';
    if (status.progress === 100) return 'Migração Concluída';
    if (status.isActive) return 'Migrando...';
    return 'Migração Pausada';
  };

  const getStatusVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    if (status.errors.length > 0) return 'destructive';
    if (status.progress === 100) return 'default';
    return 'secondary';
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 gap-2 text-xs"
        >
          {getStatusIcon()}
          <span className="hidden sm:inline">{getStatusText()}</span>
          <Badge variant={getStatusVariant()} className="text-xs px-1">
            {status.progress}%
          </Badge>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            <h4 className="font-medium">Migração do Sistema de Cores</h4>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progresso</span>
              <span>{status.progress}%</span>
            </div>
            <Progress value={status.progress} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Fase Atual</span>
              <Badge variant="outline" className="text-xs">
                {status.currentPhase}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span>Status</span>
              <Badge variant={getStatusVariant()} className="text-xs">
                {status.isActive ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </div>

          {status.affectedComponents.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Componentes Afetados</h5>
              <div className="text-xs text-muted-foreground">
                {status.affectedComponents.slice(0, 3).join(', ')}
                {status.affectedComponents.length > 3 && 
                  ` e mais ${status.affectedComponents.length - 3}`
                }
              </div>
            </div>
          )}

          {status.errors.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-red-600">Erros</h5>
              <div className="space-y-1">
                {status.errors.slice(0, 2).map((error, index) => (
                  <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                    {error}
                  </div>
                ))}
                {status.errors.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{status.errors.length - 2} erros adicionais
                  </div>
                )}
              </div>
            </div>
          )}

          {status.warnings.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-yellow-600">Avisos</h5>
              <div className="space-y-1">
                {status.warnings.slice(0, 2).map((warning, index) => (
                  <div key={index} className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                    {warning}
                  </div>
                ))}
                {status.warnings.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{status.warnings.length - 2} avisos adicionais
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="pt-2 border-t">
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => {
                  // Abre painel de configuração (implementar navegação)
                  console.log('Abrir configurações de migração');
                }}
              >
                <Settings className="h-3 w-3 mr-1" />
                Configurar
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => {
                  // Abre documentação (implementar)
                  window.open('/docs/color-system-migration', '_blank');
                }}
              >
                <Info className="h-3 w-3 mr-1" />
                Ajuda
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Versão compacta do indicador para uso em barras de status
 */
export function CompactMigrationIndicator() {
  const { status } = useColorMigration();

  if (!status.isActive && status.progress === 0) {
    return null;
  }

  const getStatusColor = () => {
    if (status.errors.length > 0) return 'text-red-500';
    if (status.progress === 100) return 'text-green-500';
    if (status.isActive) return 'text-blue-500';
    return 'text-yellow-500';
  };

  return (
    <div className="flex items-center gap-1 text-xs">
      <Palette className={`h-3 w-3 ${getStatusColor()}`} />
      <span className="text-muted-foreground">
        Migração: {status.progress}%
      </span>
    </div>
  );
}

/**
 * Banner de notificação para migração ativa
 */
export function MigrationBanner() {
  const { status } = useColorMigration();
  const [dismissed, setDismissed] = React.useState(false);

  if (!status.isActive || dismissed || status.progress === 100) {
    return null;
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-950 border-b border-blue-200 dark:border-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Migração do Sistema de Cores em Andamento
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Progress value={status.progress} className="w-24 h-2" />
              <span className="text-xs text-blue-700 dark:text-blue-300">
                {status.progress}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-blue-700 hover:text-blue-900 dark:text-blue-300"
              onClick={() => {
                // Abre detalhes da migração
                console.log('Ver detalhes da migração');
              }}
            >
              Ver Detalhes
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-blue-700 hover:text-blue-900 dark:text-blue-300"
              onClick={() => setDismissed(true)}
            >
              ×
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}