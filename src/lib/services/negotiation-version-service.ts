import { NegotiationScenario } from '../types/service-desk-pricing';

export interface NegotiationVersion {
  id: string;
  scenarioId: string;
  version: number;
  data: NegotiationScenario;
  createdAt: Date;
  createdBy?: string;
  changeDescription?: string;
  tags?: string[];
}

export interface VersionComparison {
  fromVersion: NegotiationVersion;
  toVersion: NegotiationVersion;
  changes: VersionChange[];
}

export interface VersionChange {
  type: 'added' | 'removed' | 'modified';
  field: string;
  oldValue?: any;
  newValue?: any;
  description: string;
}

/**
 * Service for managing negotiation scenario versions
 * Provides functionality for saving, loading, comparing, and rolling back versions
 */
export class NegotiationVersionService {
  private static readonly STORAGE_KEY = 'negotiation-versions';
  private static readonly MAX_VERSIONS_PER_SCENARIO = 50;

  /**
   * Save a new version of a negotiation scenario
   */
  static async saveVersion(
    scenario: NegotiationScenario,
    changeDescription?: string,
    createdBy?: string
  ): Promise<NegotiationVersion> {
    const versions = await this.getVersions(scenario.id);
    
    // Create new version
    const newVersion: NegotiationVersion = {
      id: `${scenario.id}-v${scenario.version + 1}-${Date.now()}`,
      scenarioId: scenario.id,
      version: scenario.version + 1,
      data: {
        ...scenario,
        version: scenario.version + 1,
        createdAt: new Date()
      },
      createdAt: new Date(),
      createdBy,
      changeDescription,
      tags: []
    };

    // Add to versions list
    const updatedVersions = [...versions, newVersion];
    
    // Keep only the latest MAX_VERSIONS_PER_SCENARIO versions
    const trimmedVersions = updatedVersions
      .sort((a, b) => b.version - a.version)
      .slice(0, this.MAX_VERSIONS_PER_SCENARIO);

    // Save to storage
    await this.saveVersionsToStorage(scenario.id, trimmedVersions);

    return newVersion;
  }

  /**
   * Get all versions for a scenario
   */
  static async getVersions(scenarioId: string): Promise<NegotiationVersion[]> {
    try {
      const allVersions = this.loadVersionsFromStorage();
      return allVersions[scenarioId] || [];
    } catch (error) {
      console.error('Error loading versions:', error);
      return [];
    }
  }

  /**
   * Get a specific version by version number
   */
  static async getVersion(scenarioId: string, version: number): Promise<NegotiationVersion | null> {
    const versions = await this.getVersions(scenarioId);
    return versions.find(v => v.version === version) || null;
  }

  /**
   * Get the latest version of a scenario
   */
  static async getLatestVersion(scenarioId: string): Promise<NegotiationVersion | null> {
    const versions = await this.getVersions(scenarioId);
    if (versions.length === 0) return null;
    
    return versions.reduce((latest, current) => 
      current.version > latest.version ? current : latest
    );
  }

  /**
   * Rollback to a specific version
   */
  static async rollbackToVersion(
    scenarioId: string, 
    targetVersion: number,
    createBackup: boolean = true
  ): Promise<NegotiationScenario> {
    const versions = await this.getVersions(scenarioId);
    const targetVersionData = versions.find(v => v.version === targetVersion);
    
    if (!targetVersionData) {
      throw new Error(`Version ${targetVersion} not found for scenario ${scenarioId}`);
    }

    // Create backup of current state if requested
    if (createBackup) {
      const latestVersion = await this.getLatestVersion(scenarioId);
      if (latestVersion) {
        await this.saveVersion(
          latestVersion.data,
          `Backup before rollback to v${targetVersion}`,
          'system'
        );
      }
    }

    // Return the target version data with updated timestamp
    return {
      ...targetVersionData.data,
      createdAt: new Date()
    };
  }

  /**
   * Compare two versions and return the differences
   */
  static compareVersions(
    fromVersion: NegotiationVersion,
    toVersion: NegotiationVersion
  ): VersionComparison {
    const changes: VersionChange[] = [];

    // Compare basic properties
    if (fromVersion.data.name !== toVersion.data.name) {
      changes.push({
        type: 'modified',
        field: 'name',
        oldValue: fromVersion.data.name,
        newValue: toVersion.data.name,
        description: 'Nome do cenário alterado'
      });
    }

    if (fromVersion.data.description !== toVersion.data.description) {
      changes.push({
        type: 'modified',
        field: 'description',
        oldValue: fromVersion.data.description,
        newValue: toVersion.data.description,
        description: 'Descrição do cenário alterada'
      });
    }

    // Compare adjustments
    const fromAdjustments = fromVersion.data.adjustments;
    const toAdjustments = toVersion.data.adjustments;

    // Find added adjustments
    toAdjustments.forEach((adjustment, index) => {
      if (index >= fromAdjustments.length) {
        changes.push({
          type: 'added',
          field: `adjustments[${index}]`,
          newValue: adjustment,
          description: `Ajuste adicionado: ${adjustment.category} - ${adjustment.field}`
        });
      }
    });

    // Find removed adjustments
    if (fromAdjustments.length > toAdjustments.length) {
      for (let i = toAdjustments.length; i < fromAdjustments.length; i++) {
        changes.push({
          type: 'removed',
          field: `adjustments[${i}]`,
          oldValue: fromAdjustments[i],
          description: `Ajuste removido: ${fromAdjustments[i].category} - ${fromAdjustments[i].field}`
        });
      }
    }

    // Find modified adjustments
    const minLength = Math.min(fromAdjustments.length, toAdjustments.length);
    for (let i = 0; i < minLength; i++) {
      const fromAdj = fromAdjustments[i];
      const toAdj = toAdjustments[i];

      if (JSON.stringify(fromAdj) !== JSON.stringify(toAdj)) {
        const fieldChanges: string[] = [];
        
        if (fromAdj.category !== toAdj.category) {
          fieldChanges.push(`categoria: ${fromAdj.category} → ${toAdj.category}`);
        }
        if (fromAdj.field !== toAdj.field) {
          fieldChanges.push(`campo: ${fromAdj.field} → ${toAdj.field}`);
        }
        if (fromAdj.adjustedValue !== toAdj.adjustedValue) {
          fieldChanges.push(`valor: ${fromAdj.adjustedValue} → ${toAdj.adjustedValue}`);
        }
        if (fromAdj.reason !== toAdj.reason) {
          fieldChanges.push('justificativa alterada');
        }

        if (fieldChanges.length > 0) {
          changes.push({
            type: 'modified',
            field: `adjustments[${i}]`,
            oldValue: fromAdj,
            newValue: toAdj,
            description: `Ajuste modificado: ${fieldChanges.join(', ')}`
          });
        }
      }
    }

    // Compare results
    const fromResults = fromVersion.data.results;
    const toResults = toVersion.data.results;

    const resultFields = [
      'totalPrice', 'totalCost', 'profit', 'margin', 'roi', 'payback', 'riskLevel'
    ];

    resultFields.forEach(field => {
      const fromValue = fromResults[field as keyof typeof fromResults];
      const toValue = toResults[field as keyof typeof toResults];
      
      if (fromValue !== toValue) {
        changes.push({
          type: 'modified',
          field: `results.${field}`,
          oldValue: fromValue,
          newValue: toValue,
          description: `Resultado alterado: ${field}`
        });
      }
    });

    return {
      fromVersion,
      toVersion,
      changes
    };
  }

  /**
   * Delete all versions for a scenario
   */
  static async deleteAllVersions(scenarioId: string): Promise<void> {
    const allVersions = this.loadVersionsFromStorage();
    delete allVersions[scenarioId];
    this.saveAllVersionsToStorage(allVersions);
  }

  /**
   * Delete a specific version
   */
  static async deleteVersion(scenarioId: string, version: number): Promise<void> {
    const versions = await this.getVersions(scenarioId);
    const filteredVersions = versions.filter(v => v.version !== version);
    await this.saveVersionsToStorage(scenarioId, filteredVersions);
  }

  /**
   * Tag a version with labels
   */
  static async tagVersion(
    scenarioId: string, 
    version: number, 
    tags: string[]
  ): Promise<void> {
    const versions = await this.getVersions(scenarioId);
    const updatedVersions = versions.map(v => {
      if (v.version === version) {
        return { ...v, tags: [...(v.tags || []), ...tags] };
      }
      return v;
    });
    
    await this.saveVersionsToStorage(scenarioId, updatedVersions);
  }

  /**
   * Search versions by tags or description
   */
  static async searchVersions(
    scenarioId: string,
    query: string
  ): Promise<NegotiationVersion[]> {
    const versions = await this.getVersions(scenarioId);
    const lowerQuery = query.toLowerCase();
    
    return versions.filter(version => {
      const matchesDescription = version.changeDescription?.toLowerCase().includes(lowerQuery);
      const matchesTags = version.tags?.some(tag => tag.toLowerCase().includes(lowerQuery));
      const matchesCreatedBy = version.createdBy?.toLowerCase().includes(lowerQuery);
      
      return matchesDescription || matchesTags || matchesCreatedBy;
    });
  }

  /**
   * Get version statistics
   */
  static async getVersionStats(scenarioId: string): Promise<{
    totalVersions: number;
    oldestVersion: Date | null;
    newestVersion: Date | null;
    averageTimeBetweenVersions: number; // in hours
    mostActiveDay: string;
  }> {
    const versions = await this.getVersions(scenarioId);
    
    if (versions.length === 0) {
      return {
        totalVersions: 0,
        oldestVersion: null,
        newestVersion: null,
        averageTimeBetweenVersions: 0,
        mostActiveDay: ''
      };
    }

    const sortedVersions = versions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const oldestVersion = sortedVersions[0].createdAt;
    const newestVersion = sortedVersions[sortedVersions.length - 1].createdAt;

    // Calculate average time between versions
    let totalTimeDiff = 0;
    for (let i = 1; i < sortedVersions.length; i++) {
      const timeDiff = sortedVersions[i].createdAt.getTime() - sortedVersions[i - 1].createdAt.getTime();
      totalTimeDiff += timeDiff;
    }
    const averageTimeBetweenVersions = versions.length > 1 
      ? totalTimeDiff / (versions.length - 1) / (1000 * 60 * 60) // Convert to hours
      : 0;

    // Find most active day
    const dayCount: Record<string, number> = {};
    versions.forEach(version => {
      const day = version.createdAt.toDateString();
      dayCount[day] = (dayCount[day] || 0) + 1;
    });
    
    const mostActiveDay = Object.entries(dayCount)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || '';

    return {
      totalVersions: versions.length,
      oldestVersion,
      newestVersion,
      averageTimeBetweenVersions,
      mostActiveDay
    };
  }

  /**
   * Export versions to JSON
   */
  static async exportVersions(scenarioId: string): Promise<string> {
    const versions = await this.getVersions(scenarioId);
    return JSON.stringify(versions, null, 2);
  }

  /**
   * Import versions from JSON
   */
  static async importVersions(scenarioId: string, jsonData: string): Promise<void> {
    try {
      const importedVersions: NegotiationVersion[] = JSON.parse(jsonData);
      
      // Validate imported data
      const validVersions = importedVersions.filter(version => 
        version.id && version.scenarioId && version.version && version.data
      );

      if (validVersions.length === 0) {
        throw new Error('No valid versions found in imported data');
      }

      // Merge with existing versions
      const existingVersions = await this.getVersions(scenarioId);
      const mergedVersions = [...existingVersions];

      validVersions.forEach(importedVersion => {
        const existingIndex = mergedVersions.findIndex(v => v.version === importedVersion.version);
        if (existingIndex >= 0) {
          mergedVersions[existingIndex] = importedVersion;
        } else {
          mergedVersions.push(importedVersion);
        }
      });

      await this.saveVersionsToStorage(scenarioId, mergedVersions);
    } catch (error) {
      throw new Error(`Failed to import versions: ${error}`);
    }
  }

  /**
   * Create automatic backup before major changes
   */
  static async createAutoBackup(
    scenario: NegotiationScenario,
    changeType: 'major_adjustment' | 'bulk_changes' | 'rollback' | 'import'
  ): Promise<NegotiationVersion> {
    const changeDescriptions = {
      major_adjustment: 'Backup automático antes de ajuste significativo',
      bulk_changes: 'Backup automático antes de alterações em lote',
      rollback: 'Backup automático antes de rollback',
      import: 'Backup automático antes de importação'
    };

    return this.saveVersion(
      scenario,
      changeDescriptions[changeType],
      'system-auto'
    );
  }

  // Private helper methods

  private static loadVersionsFromStorage(): Record<string, NegotiationVersion[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return {};
      
      const parsed = JSON.parse(stored);
      
      // Convert date strings back to Date objects
      Object.keys(parsed).forEach(scenarioId => {
        parsed[scenarioId] = parsed[scenarioId].map((version: any) => ({
          ...version,
          createdAt: new Date(version.createdAt),
          data: {
            ...version.data,
            createdAt: new Date(version.data.createdAt)
          }
        }));
      });
      
      return parsed;
    } catch (error) {
      console.error('Error loading versions from storage:', error);
      return {};
    }
  }

  private static saveAllVersionsToStorage(versions: Record<string, NegotiationVersion[]>): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(versions));
    } catch (error) {
      console.error('Error saving versions to storage:', error);
    }
  }

  private static async saveVersionsToStorage(
    scenarioId: string, 
    versions: NegotiationVersion[]
  ): Promise<void> {
    const allVersions = this.loadVersionsFromStorage();
    allVersions[scenarioId] = versions;
    this.saveAllVersionsToStorage(allVersions);
  }

  /**
   * Clean up old versions based on retention policy
   */
  static async cleanupOldVersions(
    scenarioId: string,
    retentionDays: number = 90
  ): Promise<number> {
    const versions = await this.getVersions(scenarioId);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const versionsToKeep = versions.filter(version => 
      version.createdAt > cutoffDate || 
      version.tags?.includes('keep') ||
      version.createdBy === 'system-auto'
    );

    const removedCount = versions.length - versionsToKeep.length;
    
    if (removedCount > 0) {
      await this.saveVersionsToStorage(scenarioId, versionsToKeep);
    }

    return removedCount;
  }

  /**
   * Get version tree for visualization
   */
  static async getVersionTree(scenarioId: string): Promise<{
    nodes: Array<{
      id: string;
      version: number;
      createdAt: Date;
      changeDescription?: string;
      tags?: string[];
      isLatest: boolean;
    }>;
    edges: Array<{
      from: number;
      to: number;
    }>;
  }> {
    const versions = await this.getVersions(scenarioId);
    const sortedVersions = versions.sort((a, b) => a.version - b.version);
    const latestVersion = Math.max(...versions.map(v => v.version));

    const nodes = sortedVersions.map(version => ({
      id: version.id,
      version: version.version,
      createdAt: version.createdAt,
      changeDescription: version.changeDescription,
      tags: version.tags,
      isLatest: version.version === latestVersion
    }));

    const edges = sortedVersions.slice(1).map((version, index) => ({
      from: sortedVersions[index].version,
      to: version.version
    }));

    return { nodes, edges };
  }
}