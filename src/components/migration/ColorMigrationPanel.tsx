'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  useColorMigration, 
  startColorMigration, 
  rollbackColorMigration,
  validateColorSystem,
  type MigrationConfig,
  type ValidationResult 
} from '@/lib/migration/color-migration';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Settings, 
  Play, 
  Square, 
  RotateCcw,
  Eye,
  Palette,
  Shield,
  Zap
} from 'lucide-react';

export function ColorMigrationPanel() {
  const { status, config, startMigration, rollback, validate } = useColorMigration();
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [migrationConfig, setMigrationConfig] = useState<Partial<MigrationConfig>>({
    enabledFeatures: {
      newColorSystem: true,
      modernComponents: true,
      glassEffects: false,
      chartColors: true,
      highContrastMode: true,
    },
    rolloutPercentage: 10,
    userGroups: ['beta-testers'],
    fallbackMode: 'hybrid',
    validationLevel: 'moderate',
  });

  // Executa validação inicial
  useEffect(() => {
    handleValidation();
  }, []);

  const handleValidation = async () => {
    setIsValidating(true);
    try {
      const result = await validate();
      setValidationResult(result);
    } catch (error) {
      console.error('Erro na validação:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleStartMigration = async () => {
    try {
      await startMigration(migrationConfig);
    } catch (error) {
      console.error('Erro ao iniciar migração:', error);
    }
  };

  const handleRollback = async () => {
    try {
      await rollback();
    } catch (error) {
      console.error('Erro no rollback:', error);
    }
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'preparation':
        return <Settings className="h-4 w-4" />;
      case 'rollout':
        return <Play className="h-4 w-4" />;
      case 'validation':
        return <Shield className="h-4 w-4" />;
      case 'completion':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'preparation':
        return 'bg-blue-500';
      case 'rollout':
        return 'bg-orange-500';
      case 'validation':
        return 'bg-yellow-500';
      case 'completion':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Status da Migração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Status da Migração do Sistema de Cores
          </CardTitle>
          <CardDescription>
            Gerencie a transição suave para o novo sistema de cores
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getPhaseIcon(status.currentPhase)}
              <span className="font-medium capitalize">{status.currentPhase}</span>
              <Badge 
                variant={status.isActive ? "default" : "secondary"}
                className={status.isActive ? getPhaseColor(status.currentPhase) : ''}
              >
                {status.isActive ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {status.progress}% completo
            </div>
          </div>

          <Progress value={status.progress} className="w-full" />

          {status.errors.length > 0 && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Erros Encontrados</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {status.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {status.warnings.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Avisos</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {status.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={handleStartMigration}
              disabled={status.isActive}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Iniciar Migração
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleRollback}
              disabled={!status.isActive}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Rollback
            </Button>

            <Button 
              variant="outline"
              onClick={handleValidation}
              disabled={isValidating}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              {isValidating ? 'Validando...' : 'Validar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="validation">Validação</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* Configuração */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração da Migração</CardTitle>
              <CardDescription>
                Configure como a migração será executada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Features */}
              <div className="space-y-4">
                <h4 className="font-medium">Features a Habilitar</h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(migrationConfig.enabledFeatures || {}).map(([feature, enabled]) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Switch
                        id={feature}
                        checked={enabled}
                        onCheckedChange={(checked) => 
                          setMigrationConfig(prev => ({
                            ...prev,
                            enabledFeatures: {
                              ...prev.enabledFeatures,
                              [feature]: checked,
                            },
                          }))
                        }
                      />
                      <Label htmlFor={feature} className="text-sm">
                        {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rollout Percentage */}
              <div className="space-y-2">
                <Label>Porcentagem de Rollout: {migrationConfig.rolloutPercentage}%</Label>
                <Slider
                  value={[migrationConfig.rolloutPercentage || 0]}
                  onValueChange={([value]) => 
                    setMigrationConfig(prev => ({ ...prev, rolloutPercentage: value }))
                  }
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Fallback Mode */}
              <div className="space-y-2">
                <Label>Modo de Fallback</Label>
                <div className="flex gap-2">
                  {['legacy', 'hybrid', 'modern'].map((mode) => (
                    <Button
                      key={mode}
                      variant={migrationConfig.fallbackMode === mode ? "default" : "outline"}
                      size="sm"
                      onClick={() => 
                        setMigrationConfig(prev => ({ ...prev, fallbackMode: mode as any }))
                      }
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Validation Level */}
              <div className="space-y-2">
                <Label>Nível de Validação</Label>
                <div className="flex gap-2">
                  {['strict', 'moderate', 'permissive'].map((level) => (
                    <Button
                      key={level}
                      variant={migrationConfig.validationLevel === level ? "default" : "outline"}
                      size="sm"
                      onClick={() => 
                        setMigrationConfig(prev => ({ ...prev, validationLevel: level as any }))
                      }
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validação */}
        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resultados da Validação</CardTitle>
              <CardDescription>
                Verifique a compatibilidade e possíveis problemas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {validationResult ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {validationResult.isValid ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">
                        {validationResult.isValid ? 'Sistema Válido' : 'Problemas Encontrados'}
                      </span>
                    </div>
                    <Badge variant="outline">
                      Score: {validationResult.compatibilityScore}/100
                    </Badge>
                  </div>

                  <Progress value={validationResult.compatibilityScore} className="w-full" />

                  {validationResult.errors.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Problemas Encontrados</h4>
                      <div className="space-y-2">
                        {validationResult.errors.map((error, index) => (
                          <div key={index} className="flex items-start gap-2 p-2 rounded border">
                            {getSeverityIcon(error.severity)}
                            <div className="flex-1">
                              <div className="font-medium text-sm">{error.message}</div>
                              {error.location && (
                                <div className="text-xs text-muted-foreground">
                                  Local: {error.location}
                                </div>
                              )}
                              <Badge variant="outline" size="sm" className="mt-1">
                                {error.type}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {validationResult.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Recomendações</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {validationResult.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Clique em "Validar" para verificar o sistema
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preview do Sistema de Cores</CardTitle>
              <CardDescription>
                Visualize como as cores aparecerão após a migração
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Primary Colors */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Primary</h4>
                  <div className="space-y-1">
                    {[900, 800, 700, 600, 500].map(shade => (
                      <div key={shade} className="flex items-center gap-2">
                        <div 
                          className={`w-6 h-6 rounded border`}
                          style={{ backgroundColor: `hsl(var(--primary-${shade}))` }}
                        />
                        <span className="text-xs">{shade}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Accent Colors */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Accent</h4>
                  <div className="space-y-1">
                    {['cyan', 'orange', 'yellow', 'green', 'purple'].map(color => (
                      <div key={color} className="flex items-center gap-2">
                        <div 
                          className={`w-6 h-6 rounded border`}
                          style={{ backgroundColor: `hsl(var(--accent-${color}))` }}
                        />
                        <span className="text-xs capitalize">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chart Colors */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Chart</h4>
                  <div className="space-y-1">
                    {[1, 2, 3, 4, 5].map(num => (
                      <div key={num} className="flex items-center gap-2">
                        <div 
                          className={`w-6 h-6 rounded border`}
                          style={{ backgroundColor: `hsl(var(--chart-${num}))` }}
                        />
                        <span className="text-xs">Chart {num}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Semantic Colors */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Semantic</h4>
                  <div className="space-y-1">
                    {['background', 'foreground', 'muted', 'border', 'destructive'].map(color => (
                      <div key={color} className="flex items-center gap-2">
                        <div 
                          className={`w-6 h-6 rounded border`}
                          style={{ backgroundColor: `hsl(var(--${color}))` }}
                        />
                        <span className="text-xs capitalize">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Component Preview */}
              <div className="mt-6 space-y-4">
                <h4 className="font-medium">Preview de Componentes</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Button className="w-full">Botão Primário</Button>
                    <Button variant="secondary" className="w-full">Botão Secundário</Button>
                    <Button variant="outline" className="w-full">Botão Outline</Button>
                  </div>
                  <Card className="p-4">
                    <h5 className="font-medium mb-2">Card de Exemplo</h5>
                    <p className="text-sm text-muted-foreground">
                      Este é um exemplo de como os cards aparecerão com o novo sistema de cores.
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Badge>Badge</Badge>
                      <Badge variant="secondary">Secondary</Badge>
                      <Badge variant="outline">Outline</Badge>
                    </div>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}