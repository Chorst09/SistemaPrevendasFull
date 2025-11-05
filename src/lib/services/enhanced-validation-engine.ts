import { ServiceDeskValidationEngine } from './service-desk-validation-engine';
import {
  ServiceDeskData,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  TabValidationStatus
} from '@/lib/types/service-desk-pricing';

export interface TransitionValidationResult {
  canNavigate: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  requiresConfirmation: boolean;
  blockingIssues: string[];
  suggestions: string[];
}

export interface ValidationContext {
  fromTab: string;
  toTab: string;
  data: ServiceDeskData;
  userPreferences?: {
    allowNavigationWithWarnings: boolean;
    autoSaveOnNavigation: boolean;
    strictValidation: boolean;
  };
}

export class EnhancedValidationEngine extends ServiceDeskValidationEngine {
  
  /**
   * Enhanced transition validation with detailed analysis
   */
  validateTransitionEnhanced(context: ValidationContext): TransitionValidationResult {
    const { fromTab, toTab, data, userPreferences } = context;
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const blockingIssues: string[] = [];
    const suggestions: string[] = [];

    // Get basic transition validation
    const basicValidation = this.validateTransition(fromTab, toTab, data);
    errors.push(...basicValidation.errors);
    warnings.push(...basicValidation.warnings);

    // Enhanced validations
    this.validateCurrentTabCompleteness(fromTab, data, errors, warnings, suggestions);
    this.validateDependencyChain(toTab, data, errors, warnings, blockingIssues);
    this.validateDataConsistency(fromTab, toTab, data, warnings, suggestions);
    this.validateBusinessRules(fromTab, toTab, data, errors, warnings, suggestions);

    // Check for blocking issues
    const hasBlockingErrors = errors.some(error => 
      ['REQUIRED_FIELD', 'DEPENDENCY_NOT_MET', 'INVALID_VALUE'].includes(error.code)
    );

    if (hasBlockingErrors) {
      blockingIssues.push('critical_errors');
    }

    // Determine if confirmation is required
    const requiresConfirmation = this.shouldRequireConfirmation(
      fromTab, 
      toTab, 
      errors, 
      warnings, 
      userPreferences
    );

    return {
      canNavigate: !hasBlockingErrors,
      errors,
      warnings,
      requiresConfirmation,
      blockingIssues,
      suggestions
    };
  }

  /**
   * Validate current tab completeness before navigation
   */
  private validateCurrentTabCompleteness(
    fromTab: string,
    data: ServiceDeskData,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    suggestions: string[]
  ): void {
    const tabData = this.getTabDataForValidation(data, fromTab);
    const validation = this.validateTabData(fromTab, tabData);

    // Check completion percentage
    if (validation.completionPercentage < 50) {
      warnings.push({
        field: 'completion',
        message: `Aba atual está apenas ${validation.completionPercentage}% completa`,
        suggestion: 'Complete mais campos antes de prosseguir'
      });
      suggestions.push('Complete os campos obrigatórios da aba atual');
    }

    // Add specific suggestions based on tab
    switch (fromTab) {
      case 'data':
        if (!data.project?.client?.name) {
          suggestions.push('Adicione informações do cliente');
        }
        if (!data.project?.contractPeriod?.startDate) {
          suggestions.push('Defina o período do contrato');
        }
        break;
      
      case 'team':
        if (!data.team || data.team.length === 0) {
          suggestions.push('Adicione pelo menos um membro à equipe');
        } else if (data.team.some(member => !member.role)) {
          suggestions.push('Defina os cargos de todos os membros da equipe');
        }
        break;
      
      case 'scale':
        if (!data.schedules || data.schedules.length === 0) {
          suggestions.push('Configure pelo menos uma escala de trabalho');
        }
        break;
    }
  }

  /**
   * Validate dependency chain for target tab
   */
  private validateDependencyChain(
    toTab: string,
    data: ServiceDeskData,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    blockingIssues: string[]
  ): void {
    const dependencies = this.getTabDependencies(toTab);
    
    for (const depTab of dependencies) {
      const depData = this.getTabDataForValidation(data, depTab);
      const depValidation = this.validateTabData(depTab, depData);
      
      if (!depValidation.isValid) {
        errors.push({
          field: 'dependency',
          message: `Aba "${this.getTabDisplayName(depTab)}" tem erros que impedem a navegação`,
          code: 'DEPENDENCY_NOT_MET'
        });
        blockingIssues.push(depTab);
      } else if (depValidation.completionPercentage < 80) {
        warnings.push({
          field: 'dependency_completion',
          message: `Aba "${this.getTabDisplayName(depTab)}" está incompleta (${depValidation.completionPercentage}%)`,
          suggestion: 'Complete as dependências para melhor experiência'
        });
      }
    }
  }

  /**
   * Validate data consistency between tabs
   */
  private validateDataConsistency(
    fromTab: string,
    toTab: string,
    data: ServiceDeskData,
    warnings: ValidationWarning[],
    suggestions: string[]
  ): void {
    // Check team-scale consistency
    if ((fromTab === 'team' && toTab === 'scale') || (fromTab === 'scale' && toTab === 'team')) {
      this.validateTeamScaleConsistency(data, warnings, suggestions);
    }

    // Check budget consistency with team and costs
    if (toTab === 'budget') {
      this.validateBudgetDataConsistency(data, warnings, suggestions);
    }

    // Check result tab has sufficient data
    if (toTab === 'result') {
      this.validateResultDataAvailability(data, warnings, suggestions);
    }
  }

  /**
   * Validate team-scale consistency
   */
  private validateTeamScaleConsistency(
    data: ServiceDeskData,
    warnings: ValidationWarning[],
    suggestions: string[]
  ): void {
    if (!data.team || !data.schedules) return;

    const teamMemberIds = new Set(data.team.map(member => member.id));
    const assignedMemberIds = new Set<string>();

    data.schedules.forEach(schedule => {
      schedule.shifts.forEach(shift => {
        shift.teamMembers.forEach(memberId => {
          assignedMemberIds.add(memberId);
          
          if (!teamMemberIds.has(memberId)) {
            warnings.push({
              field: 'team_scale_consistency',
              message: `Membro ${memberId} atribuído a turno mas não existe na equipe`,
              suggestion: 'Remova membros inexistentes dos turnos ou adicione-os à equipe'
            });
          }
        });
      });
    });

    const unassignedMembers = data.team.filter(member => !assignedMemberIds.has(member.id));
    if (unassignedMembers.length > 0) {
      warnings.push({
        field: 'unassigned_members',
        message: `${unassignedMembers.length} membros da equipe não estão atribuídos a turnos`,
        suggestion: 'Atribua todos os membros da equipe a turnos ou remova-os'
      });
      suggestions.push('Revise a atribuição de membros aos turnos');
    }
  }

  /**
   * Validate budget data consistency
   */
  private validateBudgetDataConsistency(
    data: ServiceDeskData,
    warnings: ValidationWarning[],
    suggestions: string[]
  ): void {
    if (!data.team || data.team.length === 0) {
      warnings.push({
        field: 'budget_team',
        message: 'Orçamento sem dados de equipe',
        suggestion: 'Configure a equipe antes de definir o orçamento'
      });
      suggestions.push('Volte à aba Equipe e configure os membros');
    }

    if (!data.taxes) {
      warnings.push({
        field: 'budget_taxes',
        message: 'Orçamento sem configuração de impostos',
        suggestion: 'Configure os impostos para cálculo preciso'
      });
      suggestions.push('Configure os impostos na aba correspondente');
    }
  }

  /**
   * Validate result data availability
   */
  private validateResultDataAvailability(
    data: ServiceDeskData,
    warnings: ValidationWarning[],
    suggestions: string[]
  ): void {
    if (!data.budget) {
      warnings.push({
        field: 'result_budget',
        message: 'Análise de resultado sem dados de orçamento',
        suggestion: 'Configure o orçamento para gerar análises precisas'
      });
      suggestions.push('Complete o orçamento antes de analisar resultados');
    }

    const hasMinimalData = data.team && data.team.length > 0 && data.project?.name;
    if (!hasMinimalData) {
      warnings.push({
        field: 'result_minimal_data',
        message: 'Dados insuficientes para análise de resultado',
        suggestion: 'Complete pelo menos dados básicos e equipe'
      });
    }
  }

  /**
   * Validate business rules for navigation
   */
  private validateBusinessRules(
    fromTab: string,
    toTab: string,
    data: ServiceDeskData,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    suggestions: string[]
  ): void {
    // Rule: Cannot go to final analysis without completing key tabs
    if (toTab === 'final-analysis') {
      const requiredTabs = ['data', 'team', 'budget', 'result'];
      const incompleteTabs = requiredTabs.filter(tabId => {
        const tabData = this.getTabDataForValidation(data, tabId);
        const validation = this.validateTabData(tabId, tabData);
        return validation.completionPercentage < 90;
      });

      if (incompleteTabs.length > 0) {
        errors.push({
          field: 'final_analysis_requirements',
          message: `Complete as abas obrigatórias: ${incompleteTabs.map(id => this.getTabDisplayName(id)).join(', ')}`,
          code: 'BUSINESS_RULE_VIOLATION'
        });
      }
    }

    // Rule: Cannot skip data tab
    if (fromTab === 'data' && toTab !== 'team' && !data.project?.name) {
      errors.push({
        field: 'data_required',
        message: 'Complete os dados básicos antes de pular para outras abas',
        code: 'BUSINESS_RULE_VIOLATION'
      });
    }

    // Rule: Team should be configured before scale
    if (toTab === 'scale' && (!data.team || data.team.length === 0)) {
      warnings.push({
        field: 'team_before_scale',
        message: 'Recomendado configurar equipe antes da escala',
        suggestion: 'Configure a equipe para facilitar a criação de escalas'
      });
      suggestions.push('Configure a equipe primeiro para melhor experiência');
    }

    // Rule: Budget calculations need team and taxes
    if (toTab === 'budget') {
      if (!data.team || data.team.length === 0) {
        warnings.push({
          field: 'budget_needs_team',
          message: 'Orçamento mais preciso com dados de equipe',
          suggestion: 'Configure a equipe para cálculos automáticos'
        });
      }

      if (!data.taxes?.region) {
        warnings.push({
          field: 'budget_needs_taxes',
          message: 'Configure impostos para cálculo completo do orçamento',
          suggestion: 'Defina a região e impostos aplicáveis'
        });
      }
    }
  }

  /**
   * Determine if confirmation dialog should be shown
   */
  private shouldRequireConfirmation(
    fromTab: string,
    toTab: string,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    userPreferences?: ValidationContext['userPreferences']
  ): boolean {
    // Always require confirmation if there are errors
    if (errors.length > 0) return true;

    // Require confirmation for warnings unless user disabled it
    if (warnings.length > 0 && !userPreferences?.allowNavigationWithWarnings) {
      return true;
    }

    // Require confirmation when jumping multiple tabs
    const tabOrder = ['data', 'team', 'scale', 'taxes', 'variables', 'other-costs', 'budget', 'result', 'negotiation', 'final-analysis'];
    const fromIndex = tabOrder.indexOf(fromTab);
    const toIndex = tabOrder.indexOf(toTab);
    
    if (Math.abs(toIndex - fromIndex) > 2) {
      return true;
    }

    // Require confirmation for critical tabs
    const criticalTabs = ['final-analysis', 'result', 'budget'];
    if (criticalTabs.includes(toTab) && warnings.length > 0) {
      return true;
    }

    // Strict validation mode
    if (userPreferences?.strictValidation && warnings.length > 0) {
      return true;
    }

    return false;
  }

  /**
   * Get tab dependencies
   */
  private getTabDependencies(tabId: string): string[] {
    const dependencies: Record<string, string[]> = {
      'data': [],
      'team': ['data'],
      'scale': ['data', 'team'],
      'taxes': ['data'],
      'variables': ['data'],
      'other-costs': ['data'],
      'budget': ['data', 'team', 'taxes'],
      'result': ['data', 'team', 'budget'],
      'negotiation': ['data', 'team', 'budget', 'result'],
      'final-analysis': ['data', 'team', 'budget', 'result']
    };

    return dependencies[tabId] || [];
  }

  /**
   * Generate navigation recommendations
   */
  generateNavigationRecommendations(
    currentTab: string,
    data: ServiceDeskData
  ): Array<{
    tabId: string;
    tabName: string;
    priority: 'high' | 'medium' | 'low';
    reason: string;
    action: string;
  }> {
    const recommendations: Array<{
      tabId: string;
      tabName: string;
      priority: 'high' | 'medium' | 'low';
      reason: string;
      action: string;
    }> = [];

    // Check for incomplete required tabs
    const allTabs = ['data', 'team', 'scale', 'taxes', 'variables', 'other-costs', 'budget', 'result', 'negotiation', 'final-analysis'];
    
    allTabs.forEach(tabId => {
      if (tabId === currentTab) return;
      
      const tabData = this.getTabDataForValidation(data, tabId);
      const validation = this.validateTabData(tabId, tabData);
      
      if (validation.errors.length > 0) {
        recommendations.push({
          tabId,
          tabName: this.getTabDisplayName(tabId),
          priority: 'high',
          reason: `${validation.errors.length} erros encontrados`,
          action: 'Corrigir erros'
        });
      } else if (validation.completionPercentage < 50) {
        recommendations.push({
          tabId,
          tabName: this.getTabDisplayName(tabId),
          priority: 'medium',
          reason: `Apenas ${validation.completionPercentage}% completo`,
          action: 'Completar dados'
        });
      } else if (validation.warnings.length > 0) {
        recommendations.push({
          tabId,
          tabName: this.getTabDisplayName(tabId),
          priority: 'low',
          reason: `${validation.warnings.length} avisos encontrados`,
          action: 'Revisar avisos'
        });
      }
    });

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return recommendations.slice(0, 5); // Return top 5 recommendations
  }

  /**
   * Check if navigation path is optimal
   */
  isOptimalNavigationPath(fromTab: string, toTab: string): {
    isOptimal: boolean;
    suggestedPath?: string[];
    reason?: string;
  } {
    const tabOrder = ['data', 'team', 'scale', 'taxes', 'variables', 'other-costs', 'budget', 'result', 'negotiation', 'final-analysis'];
    const fromIndex = tabOrder.indexOf(fromTab);
    const toIndex = tabOrder.indexOf(toTab);

    // Sequential navigation is always optimal
    if (Math.abs(toIndex - fromIndex) <= 1) {
      return { isOptimal: true };
    }

    // Check if skipping tabs is problematic
    const dependencies = this.getTabDependencies(toTab);
    const skippedTabs = [];
    
    if (toIndex > fromIndex) {
      for (let i = fromIndex + 1; i < toIndex; i++) {
        const skippedTab = tabOrder[i];
        if (dependencies.includes(skippedTab)) {
          skippedTabs.push(skippedTab);
        }
      }
    }

    if (skippedTabs.length > 0) {
      const suggestedPath = [fromTab, ...skippedTabs, toTab];
      return {
        isOptimal: false,
        suggestedPath,
        reason: `Recomendado completar: ${skippedTabs.map(id => this.getTabDisplayName(id)).join(', ')}`
      };
    }

    return { isOptimal: true };
  }
}