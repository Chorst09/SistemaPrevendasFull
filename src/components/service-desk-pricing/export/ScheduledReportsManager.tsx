'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { safeFormatDate } from '@/lib/utils/date-utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar,
  Clock,
  Mail,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Settings,
  Save,
  Users
} from 'lucide-react';
import { 
  ReportExportService, 
  ScheduledReport, 
  ReportSchedule,
  ExportTemplate 
} from '@/lib/services/report-export-service';
import { useToast } from '@/hooks/use-toast';

interface ScheduledReportsManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ScheduleFormData {
  name: string;
  templateId: string;
  schedule: ReportSchedule;
  recipients: string[];
  enabled: boolean;
}

const defaultSchedule: ReportSchedule = {
  frequency: 'monthly',
  dayOfMonth: 1,
  time: '09:00'
};

export function ScheduledReportsManager({ open, onOpenChange }: ScheduledReportsManagerProps) {
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [templates, setTemplates] = useState<ExportTemplate[]>([]);
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<ScheduleFormData>({
    name: '',
    templateId: '',
    schedule: { ...defaultSchedule },
    recipients: [],
    enabled: true
  });
  const [newRecipient, setNewRecipient] = useState('');
  const { toast } = useToast();

  const exportService = ReportExportService.getInstance();

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = () => {
    setScheduledReports(exportService.getScheduledReports());
    setTemplates(exportService.getTemplates());
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Diário';
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensal';
      case 'quarterly': return 'Trimestral';
      default: return frequency;
    }
  };

  const getStatusColor = (enabled: boolean, nextRun: Date) => {
    if (!enabled) return 'bg-gray-100 text-gray-800';
    const now = new Date();
    const isOverdue = nextRun < now;
    return isOverdue ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
  };

  const getStatusLabel = (enabled: boolean, nextRun: Date) => {
    if (!enabled) return 'Pausado';
    const now = new Date();
    const isOverdue = nextRun < now;
    return isOverdue ? 'Atrasado' : 'Ativo';
  };

  const handleCreateNew = () => {
    setFormData({
      name: '',
      templateId: '',
      schedule: { ...defaultSchedule },
      recipients: [],
      enabled: true
    });
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleEdit = (reportId: string) => {
    const report = scheduledReports.find(r => r.id === reportId);
    if (!report) return;

    setFormData({
      name: report.name,
      templateId: report.templateId,
      schedule: { ...report.schedule },
      recipients: [...report.recipients],
      enabled: report.enabled
    });
    setSelectedReport(reportId);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleDelete = (reportId: string) => {
    exportService.deleteScheduledReport(reportId);
    loadData();
    toast({
      title: 'Sucesso',
      description: 'Relatório agendado removido com sucesso!'
    });
  };

  const handleToggleEnabled = (reportId: string, enabled: boolean) => {
    exportService.updateScheduledReport(reportId, { enabled });
    loadData();
    toast({
      title: 'Sucesso',
      description: enabled ? 'Relatório ativado!' : 'Relatório pausado!'
    });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome do relatório é obrigatório.',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.templateId) {
      toast({
        title: 'Erro',
        description: 'Selecione um template.',
        variant: 'destructive'
      });
      return;
    }

    if (formData.recipients.length === 0) {
      toast({
        title: 'Erro',
        description: 'Adicione pelo menos um destinatário.',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (isCreating) {
        exportService.scheduleReport(formData);
        toast({
          title: 'Sucesso',
          description: 'Relatório agendado com sucesso!'
        });
      } else if (isEditing) {
        exportService.updateScheduledReport(selectedReport, formData);
        toast({
          title: 'Sucesso',
          description: 'Relatório atualizado com sucesso!'
        });
      }

      loadData();
      setIsCreating(false);
      setIsEditing(false);
      setSelectedReport('');
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar relatório. Tente novamente.',
        variant: 'destructive'
      });
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setSelectedReport('');
    setFormData({
      name: '',
      templateId: '',
      schedule: { ...defaultSchedule },
      recipients: [],
      enabled: true
    });
  };

  const addRecipient = () => {
    if (newRecipient.trim() && !formData.recipients.includes(newRecipient.trim())) {
      setFormData(prev => ({
        ...prev,
        recipients: [...prev.recipients, newRecipient.trim()]
      }));
      setNewRecipient('');
    }
  };

  const removeRecipient = (email: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== email)
    }));
  };

  const updateSchedule = (updates: Partial<ReportSchedule>) => {
    setFormData(prev => ({
      ...prev,
      schedule: { ...prev.schedule, ...updates }
    }));
  };

  const isFormMode = isCreating || isEditing;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Relatórios Agendados
          </DialogTitle>
          <DialogDescription>
            {isFormMode 
              ? (isCreating ? 'Criar novo agendamento de relatório' : 'Editar agendamento de relatório')
              : 'Gerencie relatórios automáticos e agendamentos'
            }
          </DialogDescription>
        </DialogHeader>

        {!isFormMode ? (
          // Reports List View
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {scheduledReports.length} relatórios agendados
              </div>
              <Button onClick={handleCreateNew} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Agendamento
              </Button>
            </div>

            {scheduledReports.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Nenhum relatório agendado</h3>
                    <p className="text-sm mb-4">
                      Configure relatórios automáticos para serem gerados e enviados periodicamente.
                    </p>
                    <Button onClick={handleCreateNew}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Agendamento
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {scheduledReports.map((report) => {
                  const template = templates.find(t => t.id === report.templateId);
                  return (
                    <Card key={report.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-sm">{report.name}</CardTitle>
                              <Badge className={getStatusColor(report.enabled, report.nextRun)}>
                                {getStatusLabel(report.enabled, report.nextRun)}
                              </Badge>
                            </div>
                            <CardDescription className="text-xs">
                              Template: {template?.name || 'Template não encontrado'}
                            </CardDescription>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleEnabled(report.id, !report.enabled)}
                              className="h-8 w-8 p-0"
                            >
                              {report.enabled ? (
                                <Pause className="h-3 w-3" />
                              ) : (
                                <Play className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(report.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(report.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div>
                            <div className="text-muted-foreground">Frequência</div>
                            <div className="font-medium">
                              {getFrequencyLabel(report.schedule.frequency)}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Próxima Execução</div>
                            <div className="font-medium">
                              {safeFormatDate(report.nextRun)} às {report.schedule.time}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Destinatários</div>
                            <div className="font-medium flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {report.recipients.length}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Última Execução</div>
                            <div className="font-medium">
                              {report.lastRun ? safeFormatDate(report.lastRun) : 'Nunca'}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          // Report Form View
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="report-name">Nome do Relatório</Label>
                <Input
                  id="report-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Relatório Mensal de Custos"
                />
              </div>

              <div>
                <Label htmlFor="template">Template</Label>
                <Select
                  value={formData.templateId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, templateId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} ({template.format.toUpperCase()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enabled"
                  checked={formData.enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
                />
                <Label htmlFor="enabled" className="text-sm">
                  Ativar agendamento
                </Label>
              </div>

              <Separator />

              {/* Schedule Configuration */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Configuração de Agendamento</Label>
                
                <div>
                  <Label htmlFor="frequency" className="text-sm">Frequência</Label>
                  <Select
                    value={formData.schedule.frequency}
                    onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'quarterly') =>
                      updateSchedule({ frequency: value })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="quarterly">Trimestral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.schedule.frequency === 'weekly' && (
                  <div>
                    <Label htmlFor="day-of-week" className="text-sm">Dia da Semana</Label>
                    <Select
                      value={formData.schedule.dayOfWeek?.toString() || '1'}
                      onValueChange={(value) => updateSchedule({ dayOfWeek: parseInt(value) })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Segunda-feira</SelectItem>
                        <SelectItem value="2">Terça-feira</SelectItem>
                        <SelectItem value="3">Quarta-feira</SelectItem>
                        <SelectItem value="4">Quinta-feira</SelectItem>
                        <SelectItem value="5">Sexta-feira</SelectItem>
                        <SelectItem value="6">Sábado</SelectItem>
                        <SelectItem value="0">Domingo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {(formData.schedule.frequency === 'monthly' || formData.schedule.frequency === 'quarterly') && (
                  <div>
                    <Label htmlFor="day-of-month" className="text-sm">Dia do Mês</Label>
                    <Input
                      id="day-of-month"
                      type="number"
                      min="1"
                      max="31"
                      value={formData.schedule.dayOfMonth || 1}
                      onChange={(e) => updateSchedule({ dayOfMonth: parseInt(e.target.value) })}
                      className="h-8"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="time" className="text-sm">Horário</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.schedule.time}
                    onChange={(e) => updateSchedule({ time: e.target.value })}
                    className="h-8"
                  />
                </div>
              </div>
            </div>

            {/* Recipients Configuration */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Destinatários</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Adicione os e-mails que receberão o relatório automaticamente
                </p>
              </div>

              <div className="flex gap-2">
                <Input
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  placeholder="email@exemplo.com"
                  onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
                  className="h-8"
                />
                <Button onClick={addRecipient} size="sm" className="h-8">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              {formData.recipients.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    {formData.recipients.length} destinatário(s)
                  </Label>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {formData.recipients.map((email, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted p-2 rounded text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          <span>{email}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRecipient(email)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Preview */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Resumo do Agendamento</Label>
                <Card className="border-dashed">
                  <CardContent className="pt-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nome:</span>
                        <span>{formData.name || 'Não definido'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Template:</span>
                        <span>
                          {templates.find(t => t.id === formData.templateId)?.name || 'Não selecionado'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Frequência:</span>
                        <span>{getFrequencyLabel(formData.schedule.frequency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Horário:</span>
                        <span>{formData.schedule.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Destinatários:</span>
                        <span>{formData.recipients.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge className={formData.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {formData.enabled ? 'Ativo' : 'Pausado'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {isFormMode ? (
              isCreating ? 'Criando novo agendamento' : 'Editando agendamento'
            ) : (
              `${scheduledReports.filter(r => r.enabled).length} de ${scheduledReports.length} ativos`
            )}
          </div>
          <div className="flex gap-2">
            {isFormMode ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  {isCreating ? 'Criar Agendamento' : 'Salvar Alterações'}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}