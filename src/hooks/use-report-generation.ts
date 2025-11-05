import { useState, useCallback, useEffect } from 'react';
import { ReportConfig } from '@/components/service-desk-pricing/reports/ReportGenerator';
import { ServiceDeskData } from '@/lib/types/service-desk-pricing';

export interface GeneratedReportInfo {
  id: string;
  status: 'generating' | 'completed' | 'failed';
  generatedAt: Date;
  fileUrl?: string;
  fileSize?: number;
  error?: string;
  config: {
    name: string;
    description?: string;
    type: string;
    format: string;
  };
}

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  type: string;
  format: string;
  sections: Array<{
    id: string;
    name: string;
    type: string;
    enabled: boolean;
  }>;
}

export function useReportGeneration() {
  const [reports, setReports] = useState<GeneratedReportInfo[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load reports and templates on mount
  useEffect(() => {
    loadReports();
    loadTemplates();
  }, []);

  const loadReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/reports');
      const data = await response.json();

      if (data.success) {
        setReports(data.reports.map((report: any) => ({
          ...report,
          generatedAt: new Date(report.generatedAt)
        })));
      } else {
        throw new Error(data.error || 'Failed to load reports');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadTemplates = useCallback(async () => {
    try {
      const response = await fetch('/api/reports/templates');
      const data = await response.json();

      if (data.success) {
        setTemplates(data.templates);
      } else {
        throw new Error(data.error || 'Failed to load templates');
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
      // Don't set error for templates as it's not critical
    }
  }, []);

  const generateReport = useCallback(async (config: ReportConfig, data: ServiceDeskData): Promise<GeneratedReportInfo> => {
    try {
      setIsGenerating(true);
      setError(null);

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config, data }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate report');
      }

      const newReport: GeneratedReportInfo = {
        ...result.report,
        generatedAt: new Date(result.report.generatedAt)
      };

      setReports(prev => [newReport, ...prev]);
      return newReport;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate report';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const saveTemplate = useCallback(async (config: ReportConfig): Promise<void> => {
    try {
      const response = await fetch('/api/reports/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to save template');
      }

      // Reload templates to get the updated list
      await loadTemplates();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save template';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [loadTemplates]);

  const deleteReport = useCallback(async (reportId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/reports?id=${reportId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete report');
      }

      setReports(prev => prev.filter(report => report.id !== reportId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete report';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteTemplate = useCallback(async (templateId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/reports/templates?id=${templateId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete template');
      }

      setTemplates(prev => prev.filter(template => template.id !== templateId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete template';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const getReportStatus = useCallback(async (reportId: string): Promise<GeneratedReportInfo | null> => {
    try {
      const response = await fetch(`/api/reports?id=${reportId}`);
      const result = await response.json();

      if (!result.success) {
        return null;
      }

      return {
        ...result.report,
        generatedAt: new Date(result.report.generatedAt)
      };
    } catch (err) {
      console.error('Failed to get report status:', err);
      return null;
    }
  }, []);

  const downloadReport = useCallback(async (reportId: string): Promise<void> => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report || !report.fileUrl) {
        throw new Error('Report not found or not ready for download');
      }

      // In a real implementation, this would handle the actual file download
      // For now, we'll simulate it
      const link = document.createElement('a');
      link.href = report.fileUrl;
      link.download = `${report.config.name}.${report.config.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download report';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [reports]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    reports,
    templates,
    isGenerating,
    isLoading,
    error,

    // Actions
    generateReport,
    saveTemplate,
    deleteReport,
    deleteTemplate,
    getReportStatus,
    downloadReport,
    loadReports,
    loadTemplates,
    clearError,

    // Computed values
    completedReports: reports.filter(r => r.status === 'completed'),
    failedReports: reports.filter(r => r.status === 'failed'),
    generatingReports: reports.filter(r => r.status === 'generating'),
  };
}