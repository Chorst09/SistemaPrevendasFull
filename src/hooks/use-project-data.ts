'use client';

import { useState, useEffect, useCallback } from 'react';
import { ServiceDeskData } from '@/lib/types/service-desk-pricing';
import { ServiceDeskDataManager } from '@/lib/services/service-desk-data-manager';

interface UseProjectDataOptions {
  projectId?: string;
  userId?: string;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

interface UseProjectDataReturn {
  data: ServiceDeskData | null;
  isLoading: boolean;
  error: string | null;
  saveData: (data: ServiceDeskData) => Promise<void>;
  loadData: () => Promise<void>;
  createNewProject: () => Promise<ServiceDeskData>;
  deleteProject: () => Promise<void>;
  isDirty: boolean;
  lastSaved: Date | null;
}

export function useProjectData({
  projectId,
  userId,
  autoSave = true,
  autoSaveDelay = 2000
}: UseProjectDataOptions = {}): UseProjectDataReturn {
  const [data, setData] = useState<ServiceDeskData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const dataManager = new ServiceDeskDataManager();

  // Load data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const loadedData = await dataManager.loadData(projectId, userId);
      setData(loadedData);
      setIsDirty(false);
      setLastSaved(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading project data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, userId]);

  // Save data
  const saveData = useCallback(async (dataToSave: ServiceDeskData) => {
    setError(null);

    try {
      await dataManager.persistData(dataToSave, userId);
      setData(dataToSave);
      setIsDirty(false);
      setLastSaved(new Date());
      
      // Clear auto-save timeout
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
        setAutoSaveTimeout(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save data');
      console.error('Error saving project data:', err);
      throw err;
    }
  }, [userId, autoSaveTimeout]);

  // Create new project
  const createNewProject = useCallback(async (): Promise<ServiceDeskData> => {
    setIsLoading(true);
    setError(null);

    try {
      const newData = ServiceDeskDataManager.createEmptyData();
      
      // If we have userId, try to create in Prisma
      if (userId) {
        try {
          const response = await fetch('/api/projects', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newData),
          });

          if (response.ok) {
            const createdProject = await response.json();
            setData(createdProject);
            setIsDirty(false);
            setLastSaved(new Date());
            return createdProject;
          }
        } catch (err) {
          console.warn('Failed to create project in database, using local data:', err);
        }
      }

      // Fallback to local creation
      await dataManager.persistData(newData, userId);
      setData(newData);
      setIsDirty(false);
      setLastSaved(new Date());
      return newData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      console.error('Error creating project:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Delete project
  const deleteProject = useCallback(async () => {
    if (!data?.project.id) return;

    setIsLoading(true);
    setError(null);

    try {
      // Try to delete from database first
      if (userId) {
        try {
          const response = await fetch(`/api/projects/${data.project.id}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('Failed to delete from database');
          }
        } catch (err) {
          console.warn('Failed to delete from database, continuing with local deletion:', err);
        }
      }

      // Clear local data
      setData(null);
      setIsDirty(false);
      setLastSaved(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      console.error('Error deleting project:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data?.project.id, userId]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !isDirty || !data) return;

    // Clear existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      saveData(data).catch(console.error);
    }, autoSaveDelay);

    setAutoSaveTimeout(timeout);

    // Cleanup
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [data, isDirty, autoSave, autoSaveDelay, saveData]);

  // Load data on mount or when projectId/userId changes
  useEffect(() => {
    loadData();
  }, [projectId, userId]); // Remove loadData from dependencies to avoid loop

  // Update data and mark as dirty
  const updateData = useCallback((newData: ServiceDeskData) => {
    setData(newData);
    setIsDirty(true);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  return {
    data,
    isLoading,
    error,
    saveData,
    loadData,
    createNewProject,
    deleteProject,
    isDirty,
    lastSaved,
  };
}