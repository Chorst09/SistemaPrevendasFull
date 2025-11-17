import { CommercialProposal, TimelineMilestone } from '@/lib/types/commercial-proposal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Calendar, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TimelineSectionProps {
  proposal: CommercialProposal;
  onUpdate?: (updates: Partial<CommercialProposal>) => void;
}

// Componente de Gantt Chart
function GanttChart({ milestones, totalDurationDays }: { milestones: TimelineMilestone[], totalDurationDays: number }) {
  if (milestones.length === 0 || totalDurationDays === 0) return null;

  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-cyan-500',
    'bg-indigo-500',
    'bg-teal-500'
  ];

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
      <h4 className="font-semibold mb-4 flex items-center">
        <Calendar className="h-4 w-4 mr-2" />
        Visualização do Cronograma (Gantt)
      </h4>
      
      <div className="space-y-3">
        {/* Escala de tempo */}
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <div className="w-48"></div>
          <div className="flex-1 flex justify-between px-2">
            <span>Início</span>
            <span>Meio</span>
            <span>Fim</span>
          </div>
        </div>

        {/* Barras do Gantt */}
        {milestones.map((milestone, index) => {
          const startDay = milestone.startDate 
            ? Math.floor((new Date(milestone.startDate).getTime() - new Date(milestones[0].startDate!).getTime()) / (1000 * 60 * 60 * 24))
            : 0;
          
          const duration = milestone.durationDays || 7;
          const startPercent = (startDay / totalDurationDays) * 100;
          const widthPercent = (duration / totalDurationDays) * 100;

          return (
            <div key={milestone.id} className="flex items-center">
              <div className="w-48 pr-4 text-sm font-medium truncate">
                {milestone.description || `Marco ${index + 1}`}
              </div>
              <div className="flex-1 relative h-8 bg-gray-200 rounded">
                <div
                  className={`absolute h-full ${colors[index % colors.length]} rounded flex items-center justify-center text-white text-xs font-medium`}
                  style={{
                    left: `${startPercent}%`,
                    width: `${widthPercent}%`,
                    minWidth: '60px'
                  }}
                >
                  {milestone.period}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="mt-4 pt-4 border-t text-xs text-gray-600">
        <p><strong>Duração Total:</strong> {totalDurationDays} dias</p>
      </div>
    </div>
  );
}

export function TimelineSection({ proposal, onUpdate }: TimelineSectionProps) {
  if (!onUpdate) return null;

  const [totalDurationDays, setTotalDurationDays] = useState(0);
  const [autoGenerateEnabled, setAutoGenerateEnabled] = useState(false);

  // Extrair número de dias da duração total
  useEffect(() => {
    const duration = proposal.timeline.totalDuration.toLowerCase();
    let days = 0;
    
    // Tentar extrair número de dias, semanas ou meses
    const daysMatch = duration.match(/(\d+)\s*(dia|day)/i);
    const weeksMatch = duration.match(/(\d+)\s*(semana|week)/i);
    const monthsMatch = duration.match(/(\d+)\s*(m[eê]s|month)/i);
    
    if (daysMatch) {
      days = parseInt(daysMatch[1]);
    } else if (weeksMatch) {
      days = parseInt(weeksMatch[1]) * 7;
    } else if (monthsMatch) {
      days = parseInt(monthsMatch[1]) * 30;
    }
    
    setTotalDurationDays(days);
  }, [proposal.timeline.totalDuration]);

  const generateAutomaticTimeline = () => {
    if (totalDurationDays === 0) {
      alert('Por favor, defina uma duração total válida (ex: "8 semanas", "2 meses", "60 dias")');
      return;
    }

    // Fases padrão de um projeto
    const phases = [
      { name: 'Kick-off e Planejamento', percentage: 10 },
      { name: 'Análise e Levantamento', percentage: 15 },
      { name: 'Desenvolvimento/Implementação', percentage: 40 },
      { name: 'Testes e Validação', percentage: 20 },
      { name: 'Treinamento e Documentação', percentage: 10 },
      { name: 'Go-live e Suporte', percentage: 5 }
    ];

    const startDate = new Date();
    let currentDay = 0;
    
    const milestones: TimelineMilestone[] = phases.map((phase, index) => {
      const duration = Math.ceil((totalDurationDays * phase.percentage) / 100);
      const phaseStartDate = new Date(startDate);
      phaseStartDate.setDate(phaseStartDate.getDate() + currentDay);
      
      const phaseEndDate = new Date(phaseStartDate);
      phaseEndDate.setDate(phaseEndDate.getDate() + duration);
      
      const weekStart = Math.floor(currentDay / 7) + 1;
      const weekEnd = Math.floor((currentDay + duration) / 7) + 1;
      
      currentDay += duration;
      
      return {
        id: crypto.randomUUID(),
        period: weekStart === weekEnd ? `Semana ${weekStart}` : `Semanas ${weekStart}-${weekEnd}`,
        description: phase.name,
        startDate: phaseStartDate.toISOString().split('T')[0],
        endDate: phaseEndDate.toISOString().split('T')[0],
        durationDays: duration
      };
    });

    onUpdate({
      timeline: {
        ...proposal.timeline,
        milestones
      }
    });
    
    setAutoGenerateEnabled(false);
  };

  const addMilestone = () => {
    const newMilestone: TimelineMilestone = {
      id: crypto.randomUUID(),
      period: '',
      description: '',
      durationDays: 7
    };
    onUpdate({
      timeline: {
        ...proposal.timeline,
        milestones: [...proposal.timeline.milestones, newMilestone]
      }
    });
  };

  const updateMilestone = (index: number, updates: Partial<TimelineMilestone>) => {
    const milestones = [...proposal.timeline.milestones];
    milestones[index] = { ...milestones[index], ...updates };
    onUpdate({
      timeline: { ...proposal.timeline, milestones }
    });
  };

  const removeMilestone = (index: number) => {
    const milestones = proposal.timeline.milestones.filter((_, i) => i !== index);
    onUpdate({
      timeline: { ...proposal.timeline, milestones }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>7. Cronograma e Prazos</CardTitle>
          <CardDescription>
            Defina a duração total e os principais marcos do projeto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="totalDuration">Duração Total Estimada</Label>
            <Input
              id="totalDuration"
              placeholder='Ex: "8 semanas", "2 meses", "60 dias"'
              value={proposal.timeline.totalDuration}
              onChange={(e) => onUpdate({
                timeline: { ...proposal.timeline, totalDuration: e.target.value }
              })}
            />
            {totalDurationDays > 0 && (
              <p className="text-xs text-green-600 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Detectado: {totalDurationDays} dias
              </p>
            )}
          </div>

          {totalDurationDays > 0 && proposal.timeline.milestones.length === 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900 mb-3">
                Gerar cronograma automaticamente com base na duração total?
              </p>
              <Button onClick={generateAutomaticTimeline} size="sm" variant="default">
                <Calendar className="h-4 w-4 mr-2" />
                Gerar Cronograma Automático
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Marcos Principais</CardTitle>
            <div className="flex gap-2">
              {proposal.timeline.milestones.length > 0 && totalDurationDays > 0 && (
                <Button onClick={generateAutomaticTimeline} size="sm" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Regenerar
                </Button>
              )}
              <Button onClick={addMilestone} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Marco
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Gantt Chart */}
          {proposal.timeline.milestones.length > 0 && totalDurationDays > 0 && (
            <GanttChart 
              milestones={proposal.timeline.milestones} 
              totalDurationDays={totalDurationDays}
            />
          )}

          {/* Lista de Marcos */}
          {proposal.timeline.milestones.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhum marco definido</p>
              <p className="text-sm mt-1">
                {totalDurationDays > 0 
                  ? 'Clique em "Gerar Cronograma Automático" acima'
                  : 'Defina uma duração total primeiro'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 mt-6">
              {proposal.timeline.milestones.map((milestone, index) => (
                <Card key={milestone.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-lg">Marco {index + 1}</h4>
                        <Button onClick={() => removeMilestone(index)} size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Período</Label>
                          <Input
                            placeholder='Ex: "Semana 1-2"'
                            value={milestone.period}
                            onChange={(e) => updateMilestone(index, { period: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Duração (dias)</Label>
                          <Input
                            type="number"
                            placeholder="7"
                            value={milestone.durationDays || ''}
                            onChange={(e) => updateMilestone(index, { durationDays: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Descrição</Label>
                        <Input
                          placeholder='Ex: "Kick-off e entrega do Planejamento"'
                          value={milestone.description}
                          onChange={(e) => updateMilestone(index, { description: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Data de Início</Label>
                          <Input
                            type="date"
                            value={milestone.startDate || ''}
                            onChange={(e) => updateMilestone(index, { startDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Data de Término</Label>
                          <Input
                            type="date"
                            value={milestone.endDate || ''}
                            onChange={(e) => updateMilestone(index, { endDate: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
