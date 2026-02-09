import { useState } from 'react';
import type { ValidationReport } from '../types/validation.types';

const API_BASE_URL = 'http://localhost:3001/api/protocols';

export const useValidation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateProtocol = async (protocolId: string): Promise<ValidationReport | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/${protocolId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Validation failed');
      }

      const data = await response.json();
      return data.data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getLatestValidation = async (protocolId: string): Promise<ValidationReport | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${protocolId}/validation/latest`);
      
      if (response.status === 404) {
        return null; // No validation exists yet
      }

      if (!response.ok) {
        throw new Error('Failed to fetch validation');
      }

      const data = await response.json();
      return data.data;
    } catch (err: any) {
      console.error('Failed to fetch validation:', err);
      return null;
    }
  };

  const getValidationHistory = async (
    protocolId: string, 
    limit: number = 10
  ): Promise<ValidationReport[]> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/${protocolId}/validation/history?limit=${limit}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }

      const data = await response.json();
      return data.data;
    } catch (err: any) {
      console.error('Failed to fetch history:', err);
      return [];
    }
  };

  return {
    validateProtocol,
    getLatestValidation,
    getValidationHistory,
    loading,
    error
  };
};
