import { TaxConfiguration, TaxRegime, CustomTax } from '@/lib/types/service-desk-pricing';

export interface TaxTemplate {
  id: string;
  name: string;
  region: string;
  taxRegime: TaxRegime;
  taxes: Omit<TaxConfiguration, 'region' | 'customTaxes' | 'taxRegime'>;
  customTaxes: CustomTax[];
  description: string;
  category: 'federal' | 'state' | 'municipal' | 'mixed';
  lastUpdated: Date;
  isDefault: boolean;
}

export interface TaxValidationRule {
  field: keyof TaxConfiguration;
  minValue: number;
  maxValue: number;
  warningThreshold?: number;
  message: string;
}

/**
 * Service for managing tax templates and validation
 */
export class TaxTemplateService {
  private static readonly STORAGE_KEY = 'service-desk-tax-templates';
  
  private static readonly DEFAULT_TEMPLATES: TaxTemplate[] = [
    {
      id: 'sp-simples',
      name: 'São Paulo - Simples Nacional',
      region: 'São Paulo, SP',
      taxRegime: TaxRegime.SIMPLES_NACIONAL,
      taxes: {
        icms: 0,
        pis: 0,
        cofins: 0,
        iss: 2.0,
        ir: 0,
        csll: 0
      },
      customTaxes: [],
      description: 'Configuração padrão para empresas do Simples Nacional em São Paulo',
      category: 'municipal',
      lastUpdated: new Date(),
      isDefault: true
    },
    {
      id: 'rj-presumido',
      name: 'Rio de Janeiro - Lucro Presumido',
      region: 'Rio de Janeiro, RJ',
      taxRegime: TaxRegime.LUCRO_PRESUMIDO,
      taxes: {
        icms: 18.0,
        pis: 0.65,
        cofins: 3.0,
        iss: 5.0,
        ir: 1.2,
        csll: 1.08
      },
      customTaxes: [],
      description: 'Configuração padrão para empresas do Lucro Presumido no Rio de Janeiro',
      category: 'mixed',
      lastUpdated: new Date(),
      isDefault: true
    },
    {
      id: 'mg-real',
      name: 'Minas Gerais - Lucro Real',
      region: 'Belo Horizonte, MG',
      taxRegime: TaxRegime.LUCRO_REAL,
      taxes: {
        icms: 18.0,
        pis: 1.65,
        cofins: 7.6,
        iss: 3.0,
        ir: 15.0,
        csll: 9.0
      },
      customTaxes: [],
      description: 'Configuração padrão para empresas do Lucro Real em Minas Gerais',
      category: 'mixed',
      lastUpdated: new Date(),
      isDefault: true
    },
    {
      id: 'rs-presumido',
      name: 'Rio Grande do Sul - Lucro Presumido',
      region: 'Porto Alegre, RS',
      taxRegime: TaxRegime.LUCRO_PRESUMIDO,
      taxes: {
        icms: 17.0,
        pis: 0.65,
        cofins: 3.0,
        iss: 4.0,
        ir: 1.2,
        csll: 1.08
      },
      customTaxes: [
        {
          name: 'Taxa de Fiscalização Municipal',
          rate: 0.5,
          calculationBase: 'revenue',
          description: 'Taxa específica do município de Porto Alegre'
        }
      ],
      description: 'Configuração para empresas do Lucro Presumido no Rio Grande do Sul',
      category: 'mixed',
      lastUpdated: new Date(),
      isDefault: true
    },
    {
      id: 'df-simples',
      name: 'Distrito Federal - Simples Nacional',
      region: 'Brasília, DF',
      taxRegime: TaxRegime.SIMPLES_NACIONAL,
      taxes: {
        icms: 0,
        pis: 0,
        cofins: 0,
        iss: 2.5,
        ir: 0,
        csll: 0
      },
      customTaxes: [],
      description: 'Configuração para empresas do Simples Nacional no Distrito Federal',
      category: 'municipal',
      lastUpdated: new Date(),
      isDefault: true
    }
  ];

  private static readonly VALIDATION_RULES: TaxValidationRule[] = [
    {
      field: 'icms',
      minValue: 0,
      maxValue: 25,
      warningThreshold: 20,
      message: 'ICMS deve estar entre 0% e 25%'
    },
    {
      field: 'pis',
      minValue: 0,
      maxValue: 10,
      warningThreshold: 5,
      message: 'PIS deve estar entre 0% e 10%'
    },
    {
      field: 'cofins',
      minValue: 0,
      maxValue: 15,
      warningThreshold: 10,
      message: 'COFINS deve estar entre 0% e 15%'
    },
    {
      field: 'iss',
      minValue: 0,
      maxValue: 10,
      warningThreshold: 8,
      message: 'ISS deve estar entre 0% e 10%'
    },
    {
      field: 'ir',
      minValue: 0,
      maxValue: 25,
      warningThreshold: 20,
      message: 'IR deve estar entre 0% e 25%'
    },
    {
      field: 'csll',
      minValue: 0,
      maxValue: 15,
      warningThreshold: 12,
      message: 'CSLL deve estar entre 0% e 15%'
    }
  ];

  /**
   * Get all available tax templates
   */
  static getTemplates(): TaxTemplate[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const customTemplates = JSON.parse(stored) as TaxTemplate[];
        return [...this.DEFAULT_TEMPLATES, ...customTemplates];
      }
    } catch (error) {
      console.warn('Error loading custom tax templates:', error);
    }
    return this.DEFAULT_TEMPLATES;
  }

  /**
   * Get templates filtered by region or tax regime
   */
  static getTemplatesByFilter(filter: {
    region?: string;
    taxRegime?: TaxRegime;
    category?: string;
  }): TaxTemplate[] {
    const templates = this.getTemplates();
    
    return templates.filter(template => {
      if (filter.region && !template.region.toLowerCase().includes(filter.region.toLowerCase())) {
        return false;
      }
      if (filter.taxRegime && template.taxRegime !== filter.taxRegime) {
        return false;
      }
      if (filter.category && template.category !== filter.category) {
        return false;
      }
      return true;
    });
  }

  /**
   * Save a custom tax template
   */
  static saveTemplate(template: Omit<TaxTemplate, 'id' | 'lastUpdated' | 'isDefault'>): TaxTemplate {
    const newTemplate: TaxTemplate = {
      ...template,
      id: `custom-${Date.now()}`,
      lastUpdated: new Date(),
      isDefault: false
    };

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const customTemplates = stored ? JSON.parse(stored) as TaxTemplate[] : [];
      customTemplates.push(newTemplate);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(customTemplates));
    } catch (error) {
      console.error('Error saving tax template:', error);
      throw new Error('Não foi possível salvar o template');
    }

    return newTemplate;
  }

  /**
   * Delete a custom tax template
   */
  static deleteTemplate(templateId: string): boolean {
    if (this.DEFAULT_TEMPLATES.some(t => t.id === templateId)) {
      throw new Error('Não é possível excluir templates padrão');
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const customTemplates = JSON.parse(stored) as TaxTemplate[];
        const filtered = customTemplates.filter(t => t.id !== templateId);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
        return true;
      }
    } catch (error) {
      console.error('Error deleting tax template:', error);
      throw new Error('Não foi possível excluir o template');
    }

    return false;
  }

  /**
   * Validate tax configuration
   */
  static validateTaxConfiguration(config: TaxConfiguration): {
    isValid: boolean;
    errors: Array<{ field: string; message: string }>;
    warnings: Array<{ field: string; message: string }>;
  } {
    const errors: Array<{ field: string; message: string }> = [];
    const warnings: Array<{ field: string; message: string }> = [];

    // Validate basic tax rates
    this.VALIDATION_RULES.forEach(rule => {
      const value = config[rule.field] as number;
      
      if (value < rule.minValue || value > rule.maxValue) {
        errors.push({
          field: rule.field,
          message: rule.message
        });
      } else if (rule.warningThreshold && value > rule.warningThreshold) {
        warnings.push({
          field: rule.field,
          message: `${rule.field.toUpperCase()} está acima do valor recomendado (${rule.warningThreshold}%)`
        });
      }
    });

    // Validate region
    if (!config.region || config.region.trim().length === 0) {
      errors.push({
        field: 'region',
        message: 'Região é obrigatória'
      });
    }

    // Validate tax regime
    if (!config.taxRegime) {
      errors.push({
        field: 'taxRegime',
        message: 'Regime tributário é obrigatório'
      });
    }

    // Validate custom taxes
    config.customTaxes.forEach((tax, index) => {
      if (!tax.name || tax.name.trim().length === 0) {
        errors.push({
          field: `customTaxes[${index}].name`,
          message: `Nome do imposto customizado ${index + 1} é obrigatório`
        });
      }

      if (tax.rate < 0 || tax.rate > 100) {
        errors.push({
          field: `customTaxes[${index}].rate`,
          message: `Taxa do imposto customizado ${index + 1} deve estar entre 0% e 100%`
        });
      }
    });

    // Check for regime-specific validations
    if (config.taxRegime === TaxRegime.SIMPLES_NACIONAL) {
      if (config.pis > 0 || config.cofins > 0 || config.ir > 0 || config.csll > 0) {
        warnings.push({
          field: 'taxRegime',
          message: 'No Simples Nacional, PIS, COFINS, IR e CSLL geralmente são zero'
        });
      }
    }

    // Check total tax burden
    const totalTaxRate = config.icms + config.pis + config.cofins + config.iss + config.ir + config.csll +
      config.customTaxes.reduce((sum, tax) => sum + (tax.calculationBase === 'revenue' ? tax.rate : 0), 0);

    if (totalTaxRate > 50) {
      warnings.push({
        field: 'total',
        message: `Carga tributária total muito alta (${totalTaxRate.toFixed(2)}%)`
      });
    } else if (totalTaxRate > 35) {
      warnings.push({
        field: 'total',
        message: `Carga tributária alta (${totalTaxRate.toFixed(2)}%)`
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get tax optimization suggestions
   */
  static getTaxOptimizationSuggestions(config: TaxConfiguration): string[] {
    const suggestions: string[] = [];
    const validation = this.validateTaxConfiguration(config);

    // Regime-specific suggestions
    if (config.taxRegime === TaxRegime.LUCRO_PRESUMIDO) {
      const totalFederalTaxes = config.pis + config.cofins + config.ir + config.csll;
      if (totalFederalTaxes > 10) {
        suggestions.push('Considere avaliar o Lucro Real se a margem de lucro for baixa');
      }
    }

    if (config.taxRegime === TaxRegime.LUCRO_REAL) {
      suggestions.push('Aproveite as deduções disponíveis no Lucro Real para otimizar a carga tributária');
    }

    // ISS optimization
    if (config.iss > 5) {
      suggestions.push('Verifique se há benefícios fiscais municipais disponíveis para reduzir o ISS');
    }

    // ICMS optimization
    if (config.icms > 15) {
      suggestions.push('Analise a possibilidade de créditos de ICMS ou benefícios estaduais');
    }

    // Custom tax suggestions
    if (config.customTaxes.length > 3) {
      suggestions.push('Revise os impostos customizados para evitar duplicações');
    }

    // Total burden suggestions
    const totalRate = config.icms + config.pis + config.cofins + config.iss + config.ir + config.csll;
    if (totalRate > 30) {
      suggestions.push('Considere consultoria tributária para otimização da carga fiscal');
    }

    return suggestions;
  }

  /**
   * Import tax configuration from previous projects
   */
  static importFromPreviousProject(projectData: any): TaxConfiguration | null {
    try {
      // This would typically integrate with a project database
      // For now, return a mock configuration
      if (projectData && projectData.taxes) {
        return {
          region: projectData.taxes.region || '',
          taxRegime: projectData.taxes.taxRegime || TaxRegime.LUCRO_PRESUMIDO,
          icms: projectData.taxes.icms || 0,
          pis: projectData.taxes.pis || 0,
          cofins: projectData.taxes.cofins || 0,
          iss: projectData.taxes.iss || 0,
          ir: projectData.taxes.ir || 0,
          csll: projectData.taxes.csll || 0,
          customTaxes: projectData.taxes.customTaxes || []
        };
      }
    } catch (error) {
      console.error('Error importing tax configuration:', error);
    }
    return null;
  }

  /**
   * Export tax configuration for reuse
   */
  static exportConfiguration(config: TaxConfiguration): string {
    try {
      return JSON.stringify({
        ...config,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      }, null, 2);
    } catch (error) {
      console.error('Error exporting tax configuration:', error);
      throw new Error('Não foi possível exportar a configuração');
    }
  }

  /**
   * Import tax configuration from JSON
   */
  static importConfiguration(jsonData: string): TaxConfiguration {
    try {
      const data = JSON.parse(jsonData);
      
      // Validate imported data
      const config: TaxConfiguration = {
        region: data.region || '',
        taxRegime: data.taxRegime || TaxRegime.LUCRO_PRESUMIDO,
        icms: Number(data.icms) || 0,
        pis: Number(data.pis) || 0,
        cofins: Number(data.cofins) || 0,
        iss: Number(data.iss) || 0,
        ir: Number(data.ir) || 0,
        csll: Number(data.csll) || 0,
        customTaxes: Array.isArray(data.customTaxes) ? data.customTaxes : []
      };

      const validation = this.validateTaxConfiguration(config);
      if (!validation.isValid) {
        throw new Error(`Configuração inválida: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      return config;
    } catch (error) {
      console.error('Error importing tax configuration:', error);
      throw new Error('Não foi possível importar a configuração. Verifique o formato do arquivo.');
    }
  }

  /**
   * Get regional tax information
   */
  static getRegionalTaxInfo(region: string): {
    averageISS: number;
    averageICMS: number;
    commonBenefits: string[];
    recommendations: string[];
  } {
    // This would typically come from a database or API
    const regionalData: Record<string, any> = {
      'são paulo': {
        averageISS: 3.5,
        averageICMS: 18.0,
        commonBenefits: ['Programa de Incentivo Fiscal Municipal', 'Redução de ISS para TI'],
        recommendations: ['Verifique benefícios da Lei de Inovação', 'Considere o programa Startup SP']
      },
      'rio de janeiro': {
        averageISS: 4.0,
        averageICMS: 19.0,
        commonBenefits: ['Programa Rio Inovação', 'Benefícios para empresas de tecnologia'],
        recommendations: ['Analise incentivos da CODIN', 'Verifique benefícios do Porto Maravilha']
      },
      'minas gerais': {
        averageISS: 3.0,
        averageICMS: 18.0,
        commonBenefits: ['Programa Minas Digital', 'Incentivos para startups'],
        recommendations: ['Considere o programa Startup BH', 'Verifique benefícios do Vale da Eletrônica']
      }
    };

    const key = region.toLowerCase();
    const data = regionalData[key] || {
      averageISS: 4.0,
      averageICMS: 18.0,
      commonBenefits: ['Consulte a prefeitura local'],
      recommendations: ['Busque orientação tributária regional']
    };

    return data;
  }
}