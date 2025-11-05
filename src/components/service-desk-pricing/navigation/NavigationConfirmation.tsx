'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle2,
  X,
  ArrowRight,
  Lightbulb,
  Route
} from 'lucide-react';
import { ValidationError, ValidationWarning } from '@/lib/types/service-desk-pricing';

export interface NavigationConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  fromTab: string;
  toTab: string;
  fromTabLabel: string;
  toTabLabel: string;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
  blockingIssues: string[];
  isOptimalPath?: boolean;
  suggestedPath?: string[];
  pathReason?: string;
  canProceedWithWarnings?: boolean;
  showSaveReminder?: boolean;
}

export function NavigationConfirmation({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  fromTab,
  toTab,
  fromTabLabel,
  toTabLabel,
  errors,
  warnings,
  suggestions,
  blockingIssues,
  isOptimalPath = true,
  suggestedPath,
  pathReason,
  canProceedWithWarnings = true,
  showSaveReminder = true
}: NavigationConfirmationProps) {
  const [acknowledgeWarnings, setAcknowledgeWarnings] = useState(false);
  const [saveChanges, setSaveChanges] = useState(true);
  const [followSuggestedPath, setFollowSuggestedPath] = useState(false);

  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0;
  const hasSuggestions = suggestions.length > 0;
  const hasBlockingIssues = blockingIssues.length > 0;
  const canProceed = !hasErrors && (!hasWarnings || (canProceedWithWarnings && acknowledgeWarnings));

  const handleConfirm = () => {
    if (canProceed) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    setAcknowledgeWarnings(false);
    setSaveChanges(true);
    setFollowSuggestedPath(false);
    onCancel();
  };

  const handleClose = () => {
    setAcknowledgeWarnings(false);
    setSaveChanges(true);
    setFollowSuggestedPath(false);
    onClose();
  };

  const getDialogIcon = () => {
    if (hasErrors) return <AlertCircle className="w-5 h-5 text-red-500" />;
    if (hasWarnings) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <Info className="w-5 h-5 text-blue-500" />;
  };

  const getDialogTitle = () => {
    if (hasErrors) return 'Erros Encontrados';
    if (hasWarnings) return 'Avisos Encontrados';
    return 'Confirmar Navegação';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getDialogIcon()}
            <span>{getDialogTitle()}</span>
          </DialogTitle>
          <DialogDescription className="flex items-center space-x-2">
            <span>Navegando de</span>
            <Badge variant="outline">{fromTabLabel}</Badge>
            <ArrowRight className="w-4 h-4" />
            <Badge variant="outline">{toTabLabel}</Badge>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-96">
          <div className="space-y-4">
            {/* Path Analysis */}
            {!isOptimalPath && suggestedPath && (
              <Alert className="border-blue-200 bg-blue-50">
                <Route className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Caminho Sugerido</AlertTitle>
                <AlertDescription className="text-blue-700">
                  <div className="space-y-2">
                    <p>{pathReason}</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">Caminho recomendado:</span>
                      {suggestedPath.map((tabId, index) => (
                        <React.Fragment key={tabId}>
                          <Badge variant="secondary" className="text-xs">
                            {tabId}
                          </Badge>
                          {index < suggestedPath.length - 1 && (
                            <ArrowRight className="w-3 h-3" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Errors Section */}
            {hasErrors && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erros que impedem a navegação</AlertTitle>
                <AlertDescription>
                  Os seguintes erros devem ser corrigidos antes de prosseguir:
                </AlertDescription>
              </Alert>
            )}

            {errors.map((error, index) => (
              <div key={index} className="border-l-4 border-red-500 pl-4 py-2 bg-red-50 rounded-r">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-700">
                      {error.field}
                    </p>
                    <p className="text-sm text-red-600">
                      {error.message}
                    </p>
                    <Badge variant="destructive" className="text-xs mt-1">
                      {error.code}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}

            {/* Warnings Section */}
            {hasWarnings && (
              <>
                {hasErrors && <Separator />}
                <Alert variant="default" className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertTitle className="text-yellow-800">Avisos encontrados</AlertTitle>
                  <AlertDescription className="text-yellow-700">
                    Os seguintes avisos foram identificados. Você pode prosseguir, mas recomendamos revisar:
                  </AlertDescription>
                </Alert>
              </>
            )}

            {warnings.map((warning, index) => (
              <div key={index} className="border-l-4 border-yellow-500 pl-4 py-2 bg-yellow-50 rounded-r">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-700">
                      {warning.field}
                    </p>
                    <p className="text-sm text-yellow-600">
                      {warning.message}
                    </p>
                    {warning.suggestion && (
                      <p className="text-xs text-yellow-500 mt-1 italic">
                        💡 {warning.suggestion}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Suggestions Section */}
            {hasSuggestions && (
              <>
                <Separator />
                <Alert className="border-blue-200 bg-blue-50">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">Sugestões</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    Recomendações para melhorar a qualidade dos dados:
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-2 p-2 bg-blue-50 rounded">
                      <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-700">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Blocking Issues */}
            {hasBlockingIssues && (
              <>
                <Separator />
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Problemas Críticos</AlertTitle>
                  <AlertDescription>
                    Os seguintes problemas impedem a navegação:
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  {blockingIssues.map((issue, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-red-50 rounded border border-red-200">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-700 font-medium">{issue}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Acknowledgment Sections */}
            <Separator />
            
            {/* Path Acknowledgment */}
            {!isOptimalPath && suggestedPath && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="follow-suggested-path"
                  checked={followSuggestedPath}
                  onCheckedChange={(checked) => setFollowSuggestedPath(checked === true)}
                />
                <label
                  htmlFor="follow-suggested-path"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Seguir caminho recomendado
                </label>
              </div>
            )}

            {/* Warning Acknowledgment */}
            {hasWarnings && canProceedWithWarnings && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acknowledge-warnings"
                  checked={acknowledgeWarnings}
                  onCheckedChange={(checked) => setAcknowledgeWarnings(checked === true)}
                />
                <label
                  htmlFor="acknowledge-warnings"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Estou ciente dos avisos e desejo prosseguir
                </label>
              </div>
            )}

            {/* Save Changes */}
            {showSaveReminder && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="save-changes"
                  checked={saveChanges}
                  onCheckedChange={(checked) => setSaveChanges(checked === true)}
                />
                <label
                  htmlFor="save-changes"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Salvar alterações antes de navegar
                </label>
              </div>
            )}

            {/* Success Message */}
            {!hasErrors && !hasWarnings && !hasSuggestions && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Tudo pronto!</AlertTitle>
                <AlertDescription>
                  Não foram encontrados problemas. Você pode prosseguir com segurança.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          
          <div className="flex space-x-2">
            {hasErrors && (
              <Button variant="secondary" onClick={handleClose}>
                Corrigir Erros
              </Button>
            )}
            
            <Button 
              onClick={handleConfirm}
              disabled={!canProceed}
              className={hasWarnings && !hasErrors ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {hasWarnings && !hasErrors ? 'Prosseguir com Avisos' : 'Prosseguir'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}