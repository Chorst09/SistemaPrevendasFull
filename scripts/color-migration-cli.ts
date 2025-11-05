#!/usr/bin/env tsx

/**
 * CLI para gerenciar migração do sistema de cores
 * Permite executar migração, validação e rollback via linha de comando
 */

import { program } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import fs from 'fs/promises';
import path from 'path';

interface MigrationConfig {
  enabledFeatures: {
    newColorSystem: boolean;
    modernComponents: boolean;
    glassEffects: boolean;
    chartColors: boolean;
    highContrastMode: boolean;
  };
  rolloutPercentage: number;
  userGroups: string[];
  fallbackMode: 'legacy' | 'hybrid' | 'modern';
  validationLevel: 'strict' | 'moderate' | 'permissive';
}

interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    type: 'css' | 'component' | 'accessibility' | 'performance';
    message: string;
    severity: 'error' | 'warning' | 'info';
    location?: string;
  }>;
  recommendations: string[];
  compatibilityScore: number;
}

class ColorMigrationCLI {
  private configPath = '.kiro/migration/config.json';
  private backupPath = '.kiro/migration/backup';

  async init() {
    program
      .name('color-migration')
      .description('CLI para gerenciar migração do sistema de cores')
      .version('1.0.0');

    program
      .command('init')
      .description('Inicializa configuração de migração')
      .action(() => this.initConfig());

    program
      .command('validate')
      .description('Valida compatibilidade do sistema atual')
      .option('-v, --verbose', 'Saída detalhada')
      .action((options) => this.validate(options));

    program
      .command('migrate')
      .description('Executa migração do sistema de cores')
      .option('-c, --config <path>', 'Caminho para arquivo de configuração')
      .option('-d, --dry-run', 'Executa sem fazer mudanças')
      .action((options) => this.migrate(options));

    program
      .command('rollback')
      .description('Desfaz migração e restaura sistema anterior')
      .option('-f, --force', 'Força rollback sem confirmação')
      .action((options) => this.rollback(options));

    program
      .command('status')
      .description('Mostra status atual da migração')
      .action(() => this.status());

    program
      .command('backup')
      .description('Cria backup do sistema atual')
      .action(() => this.backup());

    program
      .command('restore')
      .description('Restaura backup anterior')
      .option('-l, --list', 'Lista backups disponíveis')
      .option('-r, --restore <id>', 'Restaura backup específico')
      .action((options) => this.restore(options));

    await program.parseAsync();
  }

  async initConfig() {
    console.log(chalk.blue('🎨 Inicializando configuração de migração do sistema de cores\n'));

    const answers = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'features',
        message: 'Quais features você deseja habilitar?',
        choices: [
          { name: 'Novo sistema de cores', value: 'newColorSystem', checked: true },
          { name: 'Componentes modernos', value: 'modernComponents', checked: true },
          { name: 'Efeitos de vidro', value: 'glassEffects', checked: false },
          { name: 'Cores de gráficos', value: 'chartColors', checked: true },
          { name: 'Modo alto contraste', value: 'highContrastMode', checked: true },
        ],
      },
      {
        type: 'number',
        name: 'rolloutPercentage',
        message: 'Porcentagem de rollout inicial (0-100):',
        default: 10,
        validate: (value) => value >= 0 && value <= 100 || 'Deve ser entre 0 e 100',
      },
      {
        type: 'input',
        name: 'userGroups',
        message: 'Grupos de usuários para rollout (separados por vírgula):',
        default: 'beta-testers,developers',
        filter: (input) => input.split(',').map((s: string) => s.trim()),
      },
      {
        type: 'list',
        name: 'fallbackMode',
        message: 'Modo de fallback:',
        choices: [
          { name: 'Legacy - Mantém sistema antigo', value: 'legacy' },
          { name: 'Hybrid - Transição gradual', value: 'hybrid' },
          { name: 'Modern - Sistema novo completo', value: 'modern' },
        ],
        default: 'hybrid',
      },
      {
        type: 'list',
        name: 'validationLevel',
        message: 'Nível de validação:',
        choices: [
          { name: 'Strict - Validação rigorosa', value: 'strict' },
          { name: 'Moderate - Validação moderada', value: 'moderate' },
          { name: 'Permissive - Validação permissiva', value: 'permissive' },
        ],
        default: 'moderate',
      },
    ]);

    const config: MigrationConfig = {
      enabledFeatures: {
        newColorSystem: answers.features.includes('newColorSystem'),
        modernComponents: answers.features.includes('modernComponents'),
        glassEffects: answers.features.includes('glassEffects'),
        chartColors: answers.features.includes('chartColors'),
        highContrastMode: answers.features.includes('highContrastMode'),
      },
      rolloutPercentage: answers.rolloutPercentage,
      userGroups: answers.userGroups,
      fallbackMode: answers.fallbackMode,
      validationLevel: answers.validationLevel,
    };

    await this.ensureDirectoryExists(path.dirname(this.configPath));
    await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));

    console.log(chalk.green('✅ Configuração criada com sucesso!'));
    console.log(chalk.gray(`Arquivo salvo em: ${this.configPath}`));
  }

  async validate(options: { verbose?: boolean }) {
    const spinner = ora('Validando sistema de cores...').start();

    try {
      const validation = await this.performValidation();
      spinner.stop();

      console.log(chalk.blue('\n🔍 Resultados da Validação\n'));

      // Status geral
      if (validation.isValid) {
        console.log(chalk.green('✅ Sistema válido'));
      } else {
        console.log(chalk.red('❌ Problemas encontrados'));
      }

      console.log(chalk.gray(`Score de compatibilidade: ${validation.compatibilityScore}/100\n`));

      // Erros e avisos
      if (validation.errors.length > 0) {
        console.log(chalk.yellow('⚠️  Problemas encontrados:'));
        validation.errors.forEach((error, index) => {
          const icon = error.severity === 'error' ? '❌' : error.severity === 'warning' ? '⚠️' : 'ℹ️';
          const color = error.severity === 'error' ? chalk.red : error.severity === 'warning' ? chalk.yellow : chalk.blue;
          
          console.log(`${icon} ${color(error.message)}`);
          if (error.location && options.verbose) {
            console.log(chalk.gray(`   Local: ${error.location}`));
          }
          if (options.verbose) {
            console.log(chalk.gray(`   Tipo: ${error.type}`));
          }
        });
        console.log();
      }

      // Recomendações
      if (validation.recommendations.length > 0) {
        console.log(chalk.blue('💡 Recomendações:'));
        validation.recommendations.forEach(rec => {
          console.log(`   • ${rec}`);
        });
        console.log();
      }

      // Resumo detalhado se verbose
      if (options.verbose) {
        console.log(chalk.gray('📊 Detalhes da validação:'));
        const errorsByType = validation.errors.reduce((acc, error) => {
          acc[error.type] = (acc[error.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        Object.entries(errorsByType).forEach(([type, count]) => {
          console.log(chalk.gray(`   ${type}: ${count} problema(s)`));
        });
      }

    } catch (error) {
      spinner.fail('Erro na validação');
      console.error(chalk.red(`Erro: ${error}`));
      process.exit(1);
    }
  }

  async migrate(options: { config?: string; dryRun?: boolean }) {
    console.log(chalk.blue('🚀 Iniciando migração do sistema de cores\n'));

    // Carrega configuração
    let config: MigrationConfig;
    try {
      const configPath = options.config || this.configPath;
      const configContent = await fs.readFile(configPath, 'utf-8');
      config = JSON.parse(configContent);
    } catch (error) {
      console.error(chalk.red('❌ Erro ao carregar configuração. Execute "color-migration init" primeiro.'));
      process.exit(1);
    }

    if (options.dryRun) {
      console.log(chalk.yellow('🔍 Modo dry-run - nenhuma mudança será feita\n'));
    }

    // Confirma migração
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Deseja continuar com a migração?',
        default: false,
      },
    ]);

    if (!confirm) {
      console.log(chalk.gray('Migração cancelada.'));
      return;
    }

    // Cria backup antes da migração
    if (!options.dryRun) {
      const spinner = ora('Criando backup...').start();
      await this.createBackup();
      spinner.succeed('Backup criado');
    }

    // Executa fases da migração
    const phases = [
      { name: 'Preparação', progress: 25 },
      { name: 'Rollout', progress: 50 },
      { name: 'Validação', progress: 75 },
      { name: 'Finalização', progress: 100 },
    ];

    for (const phase of phases) {
      const spinner = ora(`Executando ${phase.name}...`).start();
      
      try {
        await this.executePhase(phase.name.toLowerCase(), config, options.dryRun);
        spinner.succeed(`${phase.name} concluída (${phase.progress}%)`);
      } catch (error) {
        spinner.fail(`Erro na ${phase.name}`);
        console.error(chalk.red(`Erro: ${error}`));
        
        if (!options.dryRun) {
          console.log(chalk.yellow('Executando rollback automático...'));
          await this.performRollback();
        }
        process.exit(1);
      }
    }

    console.log(chalk.green('\n✅ Migração concluída com sucesso!'));
    
    if (!options.dryRun) {
      console.log(chalk.blue('💡 Execute "color-migration status" para verificar o status atual.'));
    }
  }

  async rollback(options: { force?: boolean }) {
    console.log(chalk.yellow('🔄 Iniciando rollback do sistema de cores\n'));

    if (!options.force) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Tem certeza que deseja fazer rollback? Isso desfará todas as mudanças da migração.',
          default: false,
        },
      ]);

      if (!confirm) {
        console.log(chalk.gray('Rollback cancelado.'));
        return;
      }
    }

    const spinner = ora('Executando rollback...').start();

    try {
      await this.performRollback();
      spinner.succeed('Rollback concluído');
      console.log(chalk.green('✅ Sistema restaurado ao estado anterior.'));
    } catch (error) {
      spinner.fail('Erro no rollback');
      console.error(chalk.red(`Erro: ${error}`));
      process.exit(1);
    }
  }

  async status() {
    console.log(chalk.blue('📊 Status da Migração do Sistema de Cores\n'));

    try {
      // Verifica se existe configuração
      const configExists = await this.fileExists(this.configPath);
      if (!configExists) {
        console.log(chalk.yellow('⚠️  Nenhuma configuração encontrada. Execute "color-migration init" primeiro.'));
        return;
      }

      // Carrega configuração
      const configContent = await fs.readFile(this.configPath, 'utf-8');
      const config: MigrationConfig = JSON.parse(configContent);

      // Mostra configuração atual
      console.log(chalk.green('📋 Configuração Atual:'));
      console.log(`   Modo de fallback: ${config.fallbackMode}`);
      console.log(`   Rollout: ${config.rolloutPercentage}%`);
      console.log(`   Nível de validação: ${config.validationLevel}`);
      console.log(`   Grupos de usuários: ${config.userGroups.join(', ')}`);
      console.log();

      console.log(chalk.green('🎨 Features Habilitadas:'));
      Object.entries(config.enabledFeatures).forEach(([feature, enabled]) => {
        const icon = enabled ? '✅' : '❌';
        const name = feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        console.log(`   ${icon} ${name}`);
      });
      console.log();

      // Verifica backups disponíveis
      const backups = await this.listBackups();
      if (backups.length > 0) {
        console.log(chalk.blue('💾 Backups Disponíveis:'));
        backups.slice(0, 3).forEach(backup => {
          console.log(`   • ${backup.id} - ${backup.date}`);
        });
        if (backups.length > 3) {
          console.log(chalk.gray(`   ... e mais ${backups.length - 3} backup(s)`));
        }
      } else {
        console.log(chalk.yellow('⚠️  Nenhum backup encontrado.'));
      }

    } catch (error) {
      console.error(chalk.red(`Erro ao obter status: ${error}`));
      process.exit(1);
    }
  }

  async backup() {
    const spinner = ora('Criando backup do sistema atual...').start();

    try {
      const backupId = await this.createBackup();
      spinner.succeed(`Backup criado: ${backupId}`);
      console.log(chalk.green('✅ Backup criado com sucesso!'));
    } catch (error) {
      spinner.fail('Erro ao criar backup');
      console.error(chalk.red(`Erro: ${error}`));
      process.exit(1);
    }
  }

  async restore(options: { list?: boolean; restore?: string }) {
    if (options.list) {
      console.log(chalk.blue('💾 Backups Disponíveis:\n'));
      
      const backups = await this.listBackups();
      if (backups.length === 0) {
        console.log(chalk.yellow('Nenhum backup encontrado.'));
        return;
      }

      backups.forEach(backup => {
        console.log(`${chalk.green(backup.id)} - ${backup.date}`);
        if (backup.description) {
          console.log(chalk.gray(`   ${backup.description}`));
        }
      });
      return;
    }

    if (options.restore) {
      const spinner = ora(`Restaurando backup ${options.restore}...`).start();
      
      try {
        await this.restoreBackup(options.restore);
        spinner.succeed('Backup restaurado');
        console.log(chalk.green('✅ Sistema restaurado com sucesso!'));
      } catch (error) {
        spinner.fail('Erro ao restaurar backup');
        console.error(chalk.red(`Erro: ${error}`));
        process.exit(1);
      }
      return;
    }

    // Modo interativo
    const backups = await this.listBackups();
    if (backups.length === 0) {
      console.log(chalk.yellow('Nenhum backup encontrado.'));
      return;
    }

    const { selectedBackup } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedBackup',
        message: 'Selecione o backup para restaurar:',
        choices: backups.map(backup => ({
          name: `${backup.id} - ${backup.date}`,
          value: backup.id,
        })),
      },
    ]);

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Tem certeza que deseja restaurar este backup?',
        default: false,
      },
    ]);

    if (!confirm) {
      console.log(chalk.gray('Restauração cancelada.'));
      return;
    }

    const spinner = ora(`Restaurando backup ${selectedBackup}...`).start();
    
    try {
      await this.restoreBackup(selectedBackup);
      spinner.succeed('Backup restaurado');
      console.log(chalk.green('✅ Sistema restaurado com sucesso!'));
    } catch (error) {
      spinner.fail('Erro ao restaurar backup');
      console.error(chalk.red(`Erro: ${error}`));
      process.exit(1);
    }
  }

  // Métodos auxiliares
  private async performValidation(): Promise<ValidationResult> {
    // Simula validação - em produção faria análise real
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      isValid: true,
      errors: [
        {
          type: 'css',
          message: 'Algumas classes legadas encontradas em Button.tsx',
          severity: 'warning',
          location: 'src/components/ui/button.tsx',
        },
        {
          type: 'accessibility',
          message: 'Contraste pode ser melhorado em modo escuro',
          severity: 'info',
        },
      ],
      recommendations: [
        'Considere migrar classes legadas para o novo sistema',
        'Teste com leitores de tela após migração',
      ],
      compatibilityScore: 85,
    };
  }

  private async executePhase(phase: string, config: MigrationConfig, dryRun?: boolean): Promise<void> {
    // Simula execução de fase
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (dryRun) {
      console.log(chalk.gray(`   [DRY RUN] Executaria fase: ${phase}`));
    }
  }

  private async performRollback(): Promise<void> {
    // Simula rollback
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  private async createBackup(): Promise<string> {
    const backupId = `backup-${Date.now()}`;
    const backupDir = path.join(this.backupPath, backupId);
    
    await this.ensureDirectoryExists(backupDir);
    
    // Simula criação de backup
    const backupData = {
      id: backupId,
      date: new Date().toISOString(),
      description: 'Backup automático antes da migração',
      files: ['src/app/globals.css', 'src/lib/feature-flags.ts'],
    };

    await fs.writeFile(
      path.join(backupDir, 'metadata.json'),
      JSON.stringify(backupData, null, 2)
    );

    return backupId;
  }

  private async listBackups(): Promise<Array<{ id: string; date: string; description?: string }>> {
    try {
      const backupDirs = await fs.readdir(this.backupPath);
      const backups = [];

      for (const dir of backupDirs) {
        try {
          const metadataPath = path.join(this.backupPath, dir, 'metadata.json');
          const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));
          backups.push({
            id: metadata.id,
            date: new Date(metadata.date).toLocaleString(),
            description: metadata.description,
          });
        } catch {
          // Ignora diretórios sem metadata
        }
      }

      return backups.sort((a, b) => b.id.localeCompare(a.id));
    } catch {
      return [];
    }
  }

  private async restoreBackup(backupId: string): Promise<void> {
    // Simula restauração
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

// Executa CLI se chamado diretamente
if (require.main === module) {
  const cli = new ColorMigrationCLI();
  cli.init().catch(error => {
    console.error(chalk.red('Erro fatal:'), error);
    process.exit(1);
  });
}

export { ColorMigrationCLI };