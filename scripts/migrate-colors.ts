#!/usr/bin/env tsx

/**
 * Script de migração para o novo sistema de cores
 * Analisa o código existente e sugere/aplica mudanças para o novo sistema
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { migrateCSSFile } from '../src/lib/compatibility/legacy-colors';

interface MigrationResult {
  file: string;
  changes: Array<{ from: string; to: string; line?: number }>;
  warnings: string[];
  errors: string[];
}

interface MigrationOptions {
  dryRun: boolean;
  verbose: boolean;
  includePatterns: string[];
  excludePatterns: string[];
  backupOriginals: boolean;
}

class ColorMigrationTool {
  private options: MigrationOptions;
  private results: MigrationResult[] = [];

  constructor(options: Partial<MigrationOptions> = {}) {
    this.options = {
      dryRun: false,
      verbose: false,
      includePatterns: ['src/**/*.{ts,tsx,js,jsx,css,scss}'],
      excludePatterns: ['node_modules/**', 'dist/**', 'build/**', '.next/**'],
      backupOriginals: true,
      ...options,
    };
  }

  /**
   * Executa a migração completa
   */
  async migrate(): Promise<void> {
    console.log('🎨 Iniciando migração do sistema de cores...\n');

    try {
      const files = await this.findFiles();
      console.log(`📁 Encontrados ${files.length} arquivos para análise\n`);

      for (const file of files) {
        await this.migrateFile(file);
      }

      this.generateReport();
    } catch (error) {
      console.error('❌ Erro durante a migração:', error);
      process.exit(1);
    }
  }

  /**
   * Encontra todos os arquivos que devem ser migrados
   */
  private async findFiles(): Promise<string[]> {
    const allFiles: string[] = [];

    for (const pattern of this.options.includePatterns) {
      const files = await glob(pattern, {
        ignore: this.options.excludePatterns,
      });
      allFiles.push(...files);
    }

    return [...new Set(allFiles)]; // Remove duplicatas
  }

  /**
   * Migra um arquivo específico
   */
  private async migrateFile(filePath: string): Promise<void> {
    const result: MigrationResult = {
      file: filePath,
      changes: [],
      warnings: [],
      errors: [],
    };

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const extension = path.extname(filePath);

      if (this.options.verbose) {
        console.log(`🔍 Analisando: ${filePath}`);
      }

      // Migra baseado no tipo de arquivo
      switch (extension) {
        case '.css':
        case '.scss':
          await this.migrateCSSFile(filePath, content, result);
          break;
        case '.ts':
        case '.tsx':
        case '.js':
        case '.jsx':
          await this.migrateJSFile(filePath, content, result);
          break;
        default:
          result.warnings.push(`Tipo de arquivo não suportado: ${extension}`);
      }

      if (result.changes.length > 0 || result.warnings.length > 0 || result.errors.length > 0) {
        this.results.push(result);
      }
    } catch (error) {
      result.errors.push(`Erro ao processar arquivo: ${error}`);
      this.results.push(result);
    }
  }

  /**
   * Migra arquivo CSS/SCSS
   */
  private async migrateCSSFile(filePath: string, content: string, result: MigrationResult): Promise<void> {
    const { migratedCSS, changes } = migrateCSSFile(content);

    result.changes = changes;

    if (changes.length > 0 && !this.options.dryRun) {
      if (this.options.backupOriginals) {
        fs.writeFileSync(`${filePath}.backup`, content);
      }
      fs.writeFileSync(filePath, migratedCSS);
    }
  }

  /**
   * Migra arquivo JavaScript/TypeScript
   */
  private async migrateJSFile(filePath: string, content: string, result: MigrationResult): Promise<void> {
    let migratedContent = content;
    const changes: Array<{ from: string; to: string; line?: number }> = [];

    // Padrões para detectar cores hardcoded
    const colorPatterns = [
      // Cores hexadecimais
      { pattern: /#4F46E5/gi, replacement: 'hsl(var(--primary))', name: 'Deep indigo' },
      { pattern: /#818CF8/gi, replacement: 'hsl(var(--accent-purple))', name: 'Soft violet' },
      { pattern: /#F9FAFB/gi, replacement: 'hsl(var(--background))', name: 'Light background' },
      
      // Classes Tailwind comuns
      { pattern: /\bbg-indigo-600\b/g, replacement: 'bg-primary', name: 'Background indigo' },
      { pattern: /\bbg-indigo-700\b/g, replacement: 'bg-primary-700', name: 'Background indigo dark' },
      { pattern: /\btext-indigo-600\b/g, replacement: 'text-primary', name: 'Text indigo' },
      { pattern: /\bbg-violet-400\b/g, replacement: 'bg-accent-purple', name: 'Background violet' },
      { pattern: /\btext-violet-400\b/g, replacement: 'text-accent-purple', name: 'Text violet' },
      
      // Estilos inline comuns
      { pattern: /backgroundColor:\s*['"]#4F46E5['"]/g, replacement: 'backgroundColor: "hsl(var(--primary))"', name: 'Inline background' },
      { pattern: /color:\s*['"]#4F46E5['"]/g, replacement: 'color: "hsl(var(--primary))"', name: 'Inline color' },
    ];

    const lines = content.split('\n');

    colorPatterns.forEach(({ pattern, replacement, name }) => {
      const matches = content.match(pattern);
      if (matches) {
        migratedContent = migratedContent.replace(pattern, replacement);
        
        // Encontra linha onde ocorreu a mudança
        lines.forEach((line, index) => {
          if (pattern.test(line)) {
            changes.push({
              from: matches[0],
              to: replacement,
              line: index + 1,
            });
          }
        });
      }
    });

    // Detecta uso de cores não migradas
    const unmappedColorPatterns = [
      /#[0-9A-Fa-f]{6}/g, // Cores hex
      /#[0-9A-Fa-f]{3}/g,  // Cores hex curtas
      /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g, // RGB
      /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/g, // RGBA
    ];

    unmappedColorPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Ignora cores já migradas
          if (!match.match(/#4F46E5|#818CF8|#F9FAFB/i)) {
            result.warnings.push(`Cor não migrada encontrada: ${match}`);
          }
        });
      }
    });

    result.changes = changes;

    if (changes.length > 0 && !this.options.dryRun) {
      if (this.options.backupOriginals) {
        fs.writeFileSync(`${filePath}.backup`, content);
      }
      fs.writeFileSync(filePath, migratedContent);
    }
  }

  /**
   * Gera relatório da migração
   */
  private generateReport(): void {
    console.log('\n📊 RELATÓRIO DE MIGRAÇÃO\n');
    console.log('='.repeat(50));

    const totalFiles = this.results.length;
    const totalChanges = this.results.reduce((sum, result) => sum + result.changes.length, 0);
    const totalWarnings = this.results.reduce((sum, result) => sum + result.warnings.length, 0);
    const totalErrors = this.results.reduce((sum, result) => sum + result.errors.length, 0);

    console.log(`📁 Arquivos processados: ${totalFiles}`);
    console.log(`✅ Total de mudanças: ${totalChanges}`);
    console.log(`⚠️  Total de avisos: ${totalWarnings}`);
    console.log(`❌ Total de erros: ${totalErrors}`);

    if (this.options.dryRun) {
      console.log('\n🔍 MODO DRY-RUN - Nenhuma alteração foi aplicada');
    }

    console.log('\n📋 DETALHES POR ARQUIVO:\n');

    this.results.forEach(result => {
      if (result.changes.length > 0 || result.warnings.length > 0 || result.errors.length > 0) {
        console.log(`📄 ${result.file}`);

        if (result.changes.length > 0) {
          console.log(`  ✅ ${result.changes.length} mudança(s):`);
          result.changes.forEach(change => {
            const lineInfo = change.line ? ` (linha ${change.line})` : '';
            console.log(`    • ${change.from} → ${change.to}${lineInfo}`);
          });
        }

        if (result.warnings.length > 0) {
          console.log(`  ⚠️  ${result.warnings.length} aviso(s):`);
          result.warnings.forEach(warning => {
            console.log(`    • ${warning}`);
          });
        }

        if (result.errors.length > 0) {
          console.log(`  ❌ ${result.errors.length} erro(s):`);
          result.errors.forEach(error => {
            console.log(`    • ${error}`);
          });
        }

        console.log('');
      }
    });

    // Gera arquivo de relatório
    const reportPath = 'color-migration-report.json';
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      options: this.options,
      summary: {
        totalFiles,
        totalChanges,
        totalWarnings,
        totalErrors,
      },
      results: this.results,
    }, null, 2));

    console.log(`📄 Relatório detalhado salvo em: ${reportPath}`);

    if (totalErrors > 0) {
      console.log('\n❌ Migração concluída com erros. Verifique os problemas acima.');
      process.exit(1);
    } else {
      console.log('\n✅ Migração concluída com sucesso!');
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options: Partial<MigrationOptions> = {};

  // Parse argumentos da linha de comando
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--no-backup':
        options.backupOriginals = false;
        break;
      case '--include':
        if (args[i + 1]) {
          options.includePatterns = [args[i + 1]];
          i++;
        }
        break;
      case '--exclude':
        if (args[i + 1]) {
          options.excludePatterns = [args[i + 1]];
          i++;
        }
        break;
      case '--help':
        console.log(`
🎨 Ferramenta de Migração do Sistema de Cores

Uso: tsx scripts/migrate-colors.ts [opções]

Opções:
  --dry-run        Executa sem aplicar mudanças (apenas análise)
  --verbose        Mostra informações detalhadas durante a execução
  --no-backup      Não cria backup dos arquivos originais
  --include <glob> Padrão de arquivos para incluir (padrão: src/**/*.{ts,tsx,js,jsx,css,scss})
  --exclude <glob> Padrão de arquivos para excluir (padrão: node_modules/**)
  --help           Mostra esta ajuda

Exemplos:
  tsx scripts/migrate-colors.ts --dry-run
  tsx scripts/migrate-colors.ts --verbose --include "src/components/**/*.tsx"
  tsx scripts/migrate-colors.ts --no-backup
        `);
        process.exit(0);
    }
  }

  const migrationTool = new ColorMigrationTool(options);
  await migrationTool.migrate();
}

// Executa apenas se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

export { ColorMigrationTool };