/**
 * NOC Validation Engine
 * Motor de validação para dados NOC
 */

import { NOCPricingData, NOCTabValidationStatus } from '@/lib/types/noc-pricing';

export class NOCValidationEngine {
  /**
   * Valida dados de uma aba específica
   */
  validateTabData(tabId: string, tabData: any): NOCTabValidationStatus {
    switch (tabId) {
      case 'project':
        return this.validateProject(tabData);
      case 'devices':
        return this.validateDevices(tabData);
      case 'monitoring':
        return this.validateMonitoring(tabData);
      case 'sla':
        return this.validateSLA(tabData);
      case 'team':
        return this.validateTeam(tabData);
      case 'costs':
        return this.validateCosts(tabData);
      case 'taxes':
        return this.validateTaxes(tabData);
      case 'variables':
        return this.validateVariables(tabData);
      default:
        return {
          isValid: true,
          isComplete: true,
          errors: [],
          warnings: [],
          suggestions: []
        };
    }
  }

  /**
   * Valida dados do projeto
   */
  private validateProject(data: any): NOCTabValidationStatus {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!data.projectName || data.projectName.trim() === '') {
      errors.push('Nome do projeto é obrigatório');
    }

    if (!data.clientName || data.clientName.trim() === '') {
      errors.push('Nome do cliente é obrigatório');
    }

    if (!data.startDate) {
      errors.push('Data de início é obrigatória');
    }

    if (data.contractDuration < 1) {
      errors.push('Duração do contrato deve ser maior que 0');
    }

    if (data.contractDuration < 12) {
      warnings.push('Contratos menores que 12 meses podem ter custos mais altos');
    }

    if (!data.location || data.location.trim() === '') {
      warnings.push('Localização não informada');
    }

    suggestions.push('Contratos de 24 ou 36 meses geralmente oferecem melhor custo-benefício');

    return {
      isValid: errors.length === 0,
      isComplete: errors.length === 0 && warnings.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Valida dispositivos
   */
  private validateDevices(data: any): NOCTabValidationStatus {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!data.devices || data.devices.length === 0) {
      errors.push('Adicione pelo menos um dispositivo para monitorar');
    }

    if (data.totalDevices === 0) {
      errors.push('Total de dispositivos não pode ser zero');
    }

    if (data.totalMetrics === 0) {
      warnings.push('Nenhuma métrica configurada');
    }

    // Valida cada dispositivo
    data.devices?.forEach((device: any, index: number) => {
      if (!device.name || device.name.trim() === '') {
        errors.push(`Dispositivo ${index + 1}: Nome é obrigatório`);
      }

      if (device.quantity <= 0) {
        errors.push(`Dispositivo ${index + 1}: Quantidade deve ser maior que 0`);
      }

      if (device.metricsCount <= 0) {
        warnings.push(`Dispositivo ${index + 1}: Nenhuma métrica configurada`);
      }

      if (device.checkInterval < 1) {
        warnings.push(`Dispositivo ${index + 1}: Intervalo de verificação muito baixo`);
      }
    });

    if (data.totalDevices > 1000) {
      suggestions.push('Para ambientes grandes, considere usar automação avançada e IA');
    }

    if (data.estimatedAlertsPerMonth > 10000) {
      warnings.push('Volume alto de alertas pode sobrecarregar a equipe. Considere ajustar thresholds');
    }

    return {
      isValid: errors.length === 0,
      isComplete: errors.length === 0 && data.devices?.length > 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Valida configuração de monitoramento
   */
  private validateMonitoring(data: any): NOCTabValidationStatus {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!data.tools || data.tools.length === 0) {
      errors.push('Selecione pelo menos uma ferramenta de monitoramento');
    }

    if (!data.alertChannels || data.alertChannels.length === 0) {
      warnings.push('Nenhum canal de alerta configurado');
    }

    if (data.customDashboards === 0) {
      warnings.push('Considere criar dashboards personalizados para melhor visualização');
    }

    if (data.automationLevel === 'none') {
      suggestions.push('Automação pode reduzir significativamente o tempo de resposta');
    }

    if (data.aiEnabled && data.automationLevel === 'none') {
      warnings.push('IA funciona melhor com automação habilitada');
    }

    if (!data.reportingEnabled) {
      warnings.push('Relatórios são importantes para análise de tendências');
    }

    return {
      isValid: errors.length === 0,
      isComplete: errors.length === 0 && data.tools?.length > 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Valida SLA
   */
  private validateSLA(data: any): NOCTabValidationStatus {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (data.availability < 90) {
      errors.push('Disponibilidade mínima deve ser 90%');
    }

    if (data.availability > 99.99) {
      warnings.push('SLA acima de 99.99% é muito difícil e caro de manter');
    }

    if (data.responseTime <= 0) {
      errors.push('Tempo de resposta deve ser maior que 0');
    }

    if (data.resolutionTime <= 0) {
      errors.push('Tempo de resolução deve ser maior que 0');
    }

    if (data.criticalIncidentResponse <= 0) {
      errors.push('Tempo de resposta para incidentes críticos deve ser maior que 0');
    }

    if (data.criticalIncidentResponse > data.responseTime) {
      warnings.push('Tempo de resposta para críticos deveria ser menor que o tempo padrão');
    }

    if (data.escalationLevels < 2) {
      warnings.push('Recomendamos pelo menos 2 níveis de escalação');
    }

    if (data.availability >= 99.9) {
      suggestions.push('Para alta disponibilidade, considere redundância e automação');
    }

    return {
      isValid: errors.length === 0,
      isComplete: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Valida equipe
   */
  private validateTeam(data: any): NOCTabValidationStatus {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!data.team || data.team.length === 0) {
      errors.push('Adicione pelo menos um membro à equipe');
    }

    if (data.teamSize === 0) {
      errors.push('Tamanho da equipe não pode ser zero');
    }

    // Valida cada membro
    data.team?.forEach((member: any, index: number) => {
      if (!member.name || member.name.trim() === '') {
        errors.push(`Membro ${index + 1}: Nome é obrigatório`);
      }

      if (member.monthlySalary <= 0) {
        errors.push(`Membro ${index + 1}: Salário deve ser maior que 0`);
      }

      if (member.monthlySalary < 2000) {
        warnings.push(`Membro ${index + 1}: Salário parece muito baixo`);
      }

      if (member.experienceYears < 0) {
        errors.push(`Membro ${index + 1}: Anos de experiência inválido`);
      }
    });

    // Verifica distribuição de níveis
    const l1Count = data.team?.filter((m: any) => m.role === 'analyst-l1').length || 0;
    const l2Count = data.team?.filter((m: any) => m.role === 'analyst-l2').length || 0;
    const l3Count = data.team?.filter((m: any) => m.role === 'analyst-l3').length || 0;

    if (l1Count === 0 && data.team?.length > 0) {
      warnings.push('Considere adicionar analistas L1 para primeiro atendimento');
    }

    if (l2Count === 0 && data.team?.length > 3) {
      warnings.push('Equipes maiores geralmente precisam de analistas L2');
    }

    if (data.teamSize < 3) {
      warnings.push('Equipe pequena pode ter dificuldade em manter cobertura 24x7');
    }

    suggestions.push('Distribua a equipe em turnos para garantir cobertura adequada');

    return {
      isValid: errors.length === 0,
      isComplete: errors.length === 0 && data.team?.length > 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Valida custos operacionais
   */
  private validateCosts(data: any): NOCTabValidationStatus {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (data.serverCosts < 0) {
      errors.push('Custo de servidores não pode ser negativo');
    }

    if (data.storageCosts < 0) {
      errors.push('Custo de storage não pode ser negativo');
    }

    if (data.networkCosts < 0) {
      errors.push('Custo de rede não pode ser negativo');
    }

    if (data.monitoringLicenses < 0) {
      errors.push('Custo de licenças não pode ser negativo');
    }

    if (data.monitoringLicenses === 0) {
      warnings.push('Nenhum custo de licença informado. Verifique se está correto');
    }

    if (data.facilityCosts === 0) {
      warnings.push('Custo de facilities não informado');
    }

    if (data.trainingCosts === 0) {
      suggestions.push('Considere investir em treinamento para a equipe');
    }

    const totalCosts = Object.values(data).reduce((sum: number, val: any) => 
      sum + (typeof val === 'number' ? val : 0), 0
    );

    if (totalCosts === 0) {
      warnings.push('Nenhum custo operacional informado');
    }

    return {
      isValid: errors.length === 0,
      isComplete: errors.length === 0 && totalCosts > 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Valida impostos
   */
  private validateTaxes(data: any): NOCTabValidationStatus {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (data.federalTax < 0 || data.federalTax > 100) {
      errors.push('Imposto federal deve estar entre 0 e 100%');
    }

    if (data.stateTax < 0 || data.stateTax > 100) {
      errors.push('Imposto estadual deve estar entre 0 e 100%');
    }

    if (data.municipalTax < 0 || data.municipalTax > 100) {
      errors.push('Imposto municipal deve estar entre 0 e 100%');
    }

    if (data.socialCharges < 0 || data.socialCharges > 100) {
      errors.push('Encargos sociais devem estar entre 0 e 100%');
    }

    const totalTax = data.federalTax + data.stateTax + data.municipalTax + data.socialCharges;

    if (totalTax === 0) {
      warnings.push('Nenhum imposto configurado. Verifique se está correto');
    }

    if (totalTax > 50) {
      warnings.push('Carga tributária muito alta. Verifique os valores');
    }

    return {
      isValid: errors.length === 0,
      isComplete: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Valida variáveis
   */
  private validateVariables(data: any): NOCTabValidationStatus {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (data.profitMargin < 0 || data.profitMargin > 100) {
      errors.push('Margem de lucro deve estar entre 0 e 100%');
    }

    if (data.riskMargin < 0 || data.riskMargin > 100) {
      errors.push('Margem de risco deve estar entre 0 e 100%');
    }

    if (data.profitMargin < 10) {
      warnings.push('Margem de lucro baixa pode comprometer a sustentabilidade');
    }

    if (data.profitMargin > 50) {
      warnings.push('Margem de lucro muito alta pode tornar o preço não competitivo');
    }

    if (data.riskMargin === 0) {
      warnings.push('Considere adicionar margem de risco para imprevistos');
    }

    if (data.inflationRate < 0) {
      warnings.push('Taxa de inflação negativa é incomum');
    }

    suggestions.push('Margens entre 15-30% são comuns no mercado de NOC');

    return {
      isValid: errors.length === 0,
      isComplete: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }
}
