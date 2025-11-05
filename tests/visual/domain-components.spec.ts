import { test, expect } from '@playwright/test';
import { VisualTestHelper, THEMES } from './utils/visual-comparison';

/**
 * Domain-Specific Component Visual Regression Tests
 * 
 * Tests visual consistency of domain-specific components like
 * Edital Analysis and IT Pricing modules with the new color system
 */

test.describe('Domain Components Visual Regression', () => {
  let visualHelper: VisualTestHelper;

  test.beforeEach(async ({ page }) => {
    visualHelper = new VisualTestHelper(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Disable animations for consistent screenshots
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    });
  });

  test('should render edital analysis components with correct colors', async ({ page }) => {
    const editalAnalysisHTML = `
      <div class="min-h-screen bg-background p-8">
        <div class="max-w-6xl mx-auto space-y-8">
          <h1 class="text-3xl font-bold text-foreground">Edital Analysis Module</h1>
          
          <!-- Analysis Status Cards -->
          <section class="space-y-6">
            <h2 class="text-xl font-semibold text-foreground">Analysis Status</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="bg-card border border-border rounded-xl p-6">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <h3 class="font-semibold text-card-foreground">Em Análise</h3>
                </div>
                <p class="text-2xl font-bold text-orange-600 mb-2">12</p>
                <p class="text-sm text-muted-foreground">Editais pendentes</p>
              </div>
              
              <div class="bg-card border border-border rounded-xl p-6">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h3 class="font-semibold text-card-foreground">Concluídos</h3>
                </div>
                <p class="text-2xl font-bold text-green-600 mb-2">45</p>
                <p class="text-sm text-muted-foreground">Análises finalizadas</p>
              </div>
              
              <div class="bg-card border border-border rounded-xl p-6">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-3 h-3 bg-cyan-500 rounded-full"></div>
                  <h3 class="font-semibold text-card-foreground">Em Revisão</h3>
                </div>
                <p class="text-2xl font-bold text-cyan-600 mb-2">8</p>
                <p class="text-sm text-muted-foreground">Aguardando revisão</p>
              </div>
            </div>
          </section>

          <!-- Analysis Form -->
          <section class="space-y-6">
            <h2 class="text-xl font-semibold text-foreground">Nova Análise</h2>
            <div class="bg-card border border-border rounded-xl p-6">
              <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">Número do Edital</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 001/2024" 
                      class="w-full px-4 py-3 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">Órgão</label>
                    <select class="w-full px-4 py-3 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-cyan-500">
                      <option>Selecione o órgão</option>
                      <option>Prefeitura Municipal</option>
                      <option>Governo do Estado</option>
                      <option>Ministério</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-foreground mb-2">Descrição do Objeto</label>
                  <textarea 
                    placeholder="Descreva o objeto da licitação..." 
                    rows="4"
                    class="w-full px-4 py-3 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none"
                  ></textarea>
                </div>
                
                <div class="flex gap-4">
                  <button class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium">
                    Iniciar Análise
                  </button>
                  <button class="border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900 px-6 py-3 rounded-lg font-medium">
                    Salvar Rascunho
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- Analysis Results -->
          <section class="space-y-6">
            <h2 class="text-xl font-semibold text-foreground">Resultados da Análise</h2>
            <div class="bg-card border border-border rounded-xl p-6">
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-semibold text-card-foreground">Edital 001/2024 - Prefeitura Municipal</h3>
                  <span class="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                    Aprovado
                  </span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
                    <h4 class="font-medium text-primary-900 dark:text-primary-100 mb-2">Compatibilidade</h4>
                    <div class="flex items-center gap-2">
                      <div class="w-full bg-primary-200 dark:bg-primary-800 rounded-full h-2">
                        <div class="bg-green-500 h-2 rounded-full" style="width: 85%"></div>
                      </div>
                      <span class="text-sm font-medium text-primary-700 dark:text-primary-300">85%</span>
                    </div>
                  </div>
                  
                  <div class="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-lg">
                    <h4 class="font-medium text-cyan-900 dark:text-cyan-100 mb-2">Viabilidade</h4>
                    <div class="flex items-center gap-2">
                      <div class="w-full bg-cyan-200 dark:bg-cyan-800 rounded-full h-2">
                        <div class="bg-cyan-500 h-2 rounded-full" style="width: 92%"></div>
                      </div>
                      <span class="text-sm font-medium text-cyan-700 dark:text-cyan-300">92%</span>
                    </div>
                  </div>
                  
                  <div class="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                    <h4 class="font-medium text-orange-900 dark:text-orange-100 mb-2">Risco</h4>
                    <div class="flex items-center gap-2">
                      <div class="w-full bg-orange-200 dark:bg-orange-800 rounded-full h-2">
                        <div class="bg-orange-500 h-2 rounded-full" style="width: 25%"></div>
                      </div>
                      <span class="text-sm font-medium text-orange-700 dark:text-orange-300">Baixo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    `;

    await visualHelper.injectTestComponents(editalAnalysisHTML, 'edital-analysis-test');
    
    await visualHelper.compareAcrossThemes(
      '#edital-analysis-test',
      THEMES,
      'edital-analysis-module',
      { fullPage: true }
    );

    await visualHelper.cleanupTestComponents('edital-analysis-test');
  });

  test('should render IT pricing components with correct colors', async ({ page }) => {
    const itPricingHTML = `
      <div class="min-h-screen bg-background p-8">
        <div class="max-w-6xl mx-auto space-y-8">
          <h1 class="text-3xl font-bold text-foreground">IT Pricing Module</h1>
          
          <!-- Pricing Dashboard -->
          <section class="space-y-6">
            <h2 class="text-xl font-semibold text-foreground">Dashboard de Precificação</h2>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div class="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white rounded-xl p-6">
                <h3 class="font-semibold mb-2">Propostas Ativas</h3>
                <p class="text-3xl font-bold mb-1">24</p>
                <p class="text-cyan-100 text-sm">+12% este mês</p>
              </div>
              
              <div class="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6">
                <h3 class="font-semibold mb-2">Valor Total</h3>
                <p class="text-3xl font-bold mb-1">R$ 2.4M</p>
                <p class="text-orange-100 text-sm">+8% este mês</p>
              </div>
              
              <div class="bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-xl p-6">
                <h3 class="font-semibold mb-2">Taxa de Conversão</h3>
                <p class="text-3xl font-bold mb-1">68%</p>
                <p class="text-teal-100 text-sm">+5% este mês</p>
              </div>
              
              <div class="bg-gradient-to-br from-primary-700 to-primary-800 text-white rounded-xl p-6">
                <h3 class="font-semibold mb-2">Margem Média</h3>
                <p class="text-3xl font-bold mb-1">32%</p>
                <p class="text-primary-200 text-sm">+2% este mês</p>
              </div>
            </div>
          </section>

          <!-- Service Categories -->
          <section class="space-y-6">
            <h2 class="text-xl font-semibold text-foreground">Categorias de Serviço</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div class="bg-card border-2 border-cyan-500 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/20 rounded-lg flex items-center justify-center">
                    <div class="w-6 h-6 bg-cyan-500 rounded"></div>
                  </div>
                  <h3 class="font-semibold text-card-foreground">Desenvolvimento</h3>
                </div>
                <p class="text-muted-foreground mb-4">Desenvolvimento de software e aplicações</p>
                <button class="bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium w-full">
                  Configurar Preços
                </button>
              </div>
              
              <div class="bg-card border-2 border-orange-500 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                    <div class="w-6 h-6 bg-orange-500 rounded"></div>
                  </div>
                  <h3 class="font-semibold text-card-foreground">Infraestrutura</h3>
                </div>
                <p class="text-muted-foreground mb-4">Serviços de infraestrutura e cloud</p>
                <button class="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium w-full">
                  Configurar Preços
                </button>
              </div>
              
              <div class="bg-card border-2 border-teal-500 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-12 h-12 bg-teal-100 dark:bg-teal-900/20 rounded-lg flex items-center justify-center">
                    <div class="w-6 h-6 bg-teal-500 rounded"></div>
                  </div>
                  <h3 class="font-semibold text-card-foreground">Consultoria</h3>
                </div>
                <p class="text-muted-foreground mb-4">Consultoria e análise técnica</p>
                <button class="bg-teal-500 text-white px-4 py-2 rounded-lg text-sm font-medium w-full">
                  Configurar Preços
                </button>
              </div>
            </div>
          </section>

          <!-- Pricing Calculator -->
          <section class="space-y-6">
            <h2 class="text-xl font-semibold text-foreground">Calculadora de Preços</h2>
            <div class="bg-card border border-border rounded-xl p-6">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="space-y-4">
                  <h3 class="text-lg font-semibold text-card-foreground">Configuração do Projeto</h3>
                  
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-foreground mb-2">Tipo de Projeto</label>
                      <select class="w-full px-4 py-3 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-cyan-500">
                        <option>Desenvolvimento Web</option>
                        <option>Aplicativo Mobile</option>
                        <option>Sistema Desktop</option>
                        <option>Infraestrutura Cloud</option>
                      </select>
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-foreground mb-2">Complexidade</label>
                      <div class="flex gap-2">
                        <button class="flex-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 py-2 px-4 rounded-lg text-sm font-medium border-2 border-green-500">
                          Baixa
                        </button>
                        <button class="flex-1 bg-background border border-input py-2 px-4 rounded-lg text-sm font-medium">
                          Média
                        </button>
                        <button class="flex-1 bg-background border border-input py-2 px-4 rounded-lg text-sm font-medium">
                          Alta
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-foreground mb-2">Prazo (meses)</label>
                      <input 
                        type="number" 
                        value="6" 
                        class="w-full px-4 py-3 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div class="space-y-4">
                  <h3 class="text-lg font-semibold text-card-foreground">Resumo do Orçamento</h3>
                  
                  <div class="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg space-y-3">
                    <div class="flex justify-between">
                      <span class="text-primary-700 dark:text-primary-300">Desenvolvimento:</span>
                      <span class="font-medium text-primary-900 dark:text-primary-100">R$ 120.000</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-primary-700 dark:text-primary-300">Infraestrutura:</span>
                      <span class="font-medium text-primary-900 dark:text-primary-100">R$ 25.000</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-primary-700 dark:text-primary-300">Testes:</span>
                      <span class="font-medium text-primary-900 dark:text-primary-100">R$ 15.000</span>
                    </div>
                    <hr class="border-primary-200 dark:border-primary-700">
                    <div class="flex justify-between text-lg font-bold">
                      <span class="text-primary-900 dark:text-primary-100">Total:</span>
                      <span class="text-orange-600">R$ 160.000</span>
                    </div>
                  </div>
                  
                  <button class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium w-full">
                    Gerar Proposta
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    `;

    await visualHelper.injectTestComponents(itPricingHTML, 'it-pricing-test');
    
    await visualHelper.compareAcrossThemes(
      '#it-pricing-test',
      THEMES,
      'it-pricing-module',
      { fullPage: true }
    );

    await visualHelper.cleanupTestComponents('it-pricing-test');
  });

  test('should validate dashboard components color consistency', async ({ page }) => {
    const dashboardHTML = `
      <div class="min-h-screen bg-background p-8">
        <div class="max-w-7xl mx-auto space-y-8">
          <h1 class="text-3xl font-bold text-foreground">Dashboard Overview</h1>
          
          <!-- Key Metrics -->
          <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-muted-foreground">Total Revenue</p>
                  <p class="text-2xl font-bold text-card-foreground">R$ 1.2M</p>
                </div>
                <div class="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <div class="w-6 h-6 bg-green-500 rounded"></div>
                </div>
              </div>
              <div class="mt-4 flex items-center gap-2">
                <span class="text-green-600 text-sm font-medium">+12.5%</span>
                <span class="text-muted-foreground text-sm">from last month</span>
              </div>
            </div>
            
            <div class="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-muted-foreground">Active Projects</p>
                  <p class="text-2xl font-bold text-card-foreground">34</p>
                </div>
                <div class="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/20 rounded-lg flex items-center justify-center">
                  <div class="w-6 h-6 bg-cyan-500 rounded"></div>
                </div>
              </div>
              <div class="mt-4 flex items-center gap-2">
                <span class="text-cyan-600 text-sm font-medium">+8.2%</span>
                <span class="text-muted-foreground text-sm">from last month</span>
              </div>
            </div>
            
            <div class="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-muted-foreground">Completion Rate</p>
                  <p class="text-2xl font-bold text-card-foreground">94%</p>
                </div>
                <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <div class="w-6 h-6 bg-orange-500 rounded"></div>
                </div>
              </div>
              <div class="mt-4 flex items-center gap-2">
                <span class="text-orange-600 text-sm font-medium">+3.1%</span>
                <span class="text-muted-foreground text-sm">from last month</span>
              </div>
            </div>
            
            <div class="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-muted-foreground">Team Members</p>
                  <p class="text-2xl font-bold text-card-foreground">28</p>
                </div>
                <div class="w-12 h-12 bg-teal-100 dark:bg-teal-900/20 rounded-lg flex items-center justify-center">
                  <div class="w-6 h-6 bg-teal-500 rounded"></div>
                </div>
              </div>
              <div class="mt-4 flex items-center gap-2">
                <span class="text-teal-600 text-sm font-medium">+2 new</span>
                <span class="text-muted-foreground text-sm">this month</span>
              </div>
            </div>
          </section>

          <!-- Chart Section -->
          <section class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="bg-card border border-border rounded-xl p-6">
              <h3 class="text-lg font-semibold text-card-foreground mb-4">Revenue Trend</h3>
              <div class="h-64 flex items-end justify-center space-x-2">
                <div class="bg-cyan-500 w-8 h-32 rounded-t"></div>
                <div class="bg-orange-500 w-8 h-40 rounded-t"></div>
                <div class="bg-teal-500 w-8 h-48 rounded-t"></div>
                <div class="bg-purple-500 w-8 h-36 rounded-t"></div>
                <div class="bg-primary-600 w-8 h-52 rounded-t"></div>
                <div class="bg-pink-500 w-8 h-44 rounded-t"></div>
              </div>
            </div>
            
            <div class="bg-card border border-border rounded-xl p-6">
              <h3 class="text-lg font-semibold text-card-foreground mb-4">Project Status</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span class="text-foreground">Completed</span>
                  </div>
                  <span class="font-medium text-foreground">18 projects</span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span class="text-foreground">In Progress</span>
                  </div>
                  <span class="font-medium text-foreground">12 projects</span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 bg-cyan-500 rounded-full"></div>
                    <span class="text-foreground">Planning</span>
                  </div>
                  <span class="font-medium text-foreground">4 projects</span>
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span class="text-foreground">Delayed</span>
                  </div>
                  <span class="font-medium text-foreground">2 projects</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    `;

    await visualHelper.injectTestComponents(dashboardHTML, 'dashboard-test');
    
    await visualHelper.compareAcrossThemes(
      '#dashboard-test',
      THEMES,
      'dashboard-components',
      { fullPage: true }
    );

    await visualHelper.cleanupTestComponents('dashboard-test');
  });
});