import { useState, useEffect, useCallback } from 'react';

export interface JobPosition {
  id: string;
  name: string;
  level?: string;
  salary8h: number;
  salary6h?: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function useJobPositions() {
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadJobPositions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/job-positions');
      const data = await response.json();

      if (data.success) {
        setJobPositions(data.jobPositions.map((pos: any) => ({
          ...pos,
          createdAt: new Date(pos.createdAt),
          updatedAt: new Date(pos.updatedAt)
        })));
      } else {
        throw new Error(data.error || 'Failed to load job positions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load job positions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createJobPosition = useCallback(async (positionData: Omit<JobPosition, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>) => {
    try {
      const response = await fetch('/api/job-positions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(positionData),
      });

      const data = await response.json();

      if (data.success) {
        const newPosition = {
          ...data.jobPosition,
          createdAt: new Date(data.jobPosition.createdAt),
          updatedAt: new Date(data.jobPosition.updatedAt)
        };
        setJobPositions(prev => [...prev, newPosition]);
        return newPosition;
      } else {
        throw new Error(data.error || 'Failed to create job position');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create job position';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateJobPosition = useCallback(async (id: string, positionData: Partial<Omit<JobPosition, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const response = await fetch('/api/job-positions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...positionData }),
      });

      const data = await response.json();

      if (data.success) {
        const updatedPosition = {
          ...data.jobPosition,
          createdAt: new Date(data.jobPosition.createdAt),
          updatedAt: new Date(data.jobPosition.updatedAt)
        };
        setJobPositions(prev => prev.map(pos => pos.id === id ? updatedPosition : pos));
        return updatedPosition;
      } else {
        throw new Error(data.error || 'Failed to update job position');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update job position';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteJobPosition = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/job-positions?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setJobPositions(prev => prev.filter(pos => pos.id !== id));
      } else {
        throw new Error(data.error || 'Failed to delete job position');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete job position';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const getJobPositionById = useCallback((id: string) => {
    return jobPositions.find(pos => pos.id === id);
  }, [jobPositions]);

  const getJobPositionsByLevel = useCallback((level: string) => {
    return jobPositions.filter(pos => pos.level === level);
  }, [jobPositions]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    loadJobPositions();
  }, [loadJobPositions]);

  return {
    jobPositions,
    isLoading,
    error,
    loadJobPositions,
    createJobPosition,
    updateJobPosition,
    deleteJobPosition,
    getJobPositionById,
    getJobPositionsByLevel,
    clearError,
  };
}