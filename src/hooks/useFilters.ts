import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { SearchFilters } from '../types';

export interface FilterState extends SearchFilters {
  activeFilterCount: number;
}

const defaultFilters: SearchFilters = {
  condition: '',
  phase: [],
  status: [],
  location: undefined,
  ageRange: undefined,
  gender: 'all',
};

export const useFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<SearchFilters>(() => {
    // Initialize from URL params
    const urlFilters: SearchFilters = { ...defaultFilters };
    
    const condition = searchParams.get('condition');
    if (condition) urlFilters.condition = condition;
    
    const phase = searchParams.get('phase');
    if (phase) urlFilters.phase = phase.split(',');
    
    const status = searchParams.get('status');
    if (status) urlFilters.status = status.split(',');
    
    const location = searchParams.get('location');
    const radius = searchParams.get('radius');
    if (location) {
      urlFilters.location = {
        city: location,
        radius: radius ? parseInt(radius) : 50,
      };
    }
    
    const ageMin = searchParams.get('ageMin');
    const ageMax = searchParams.get('ageMax');
    if (ageMin || ageMax) {
      urlFilters.ageRange = {
        min: ageMin ? parseInt(ageMin) : 18,
        max: ageMax ? parseInt(ageMax) : 65,
      };
    }
    
    const gender = searchParams.get('gender');
    if (gender && ['all', 'male', 'female'].includes(gender)) {
      urlFilters.gender = gender as 'all' | 'male' | 'female';
    }
    
    return urlFilters;
  });

  // Calculate active filter count
  const activeFilterCount = useCallback(() => {
    let count = 0;
    if (filters.condition && filters.condition.trim()) count++;
    if (filters.phase && filters.phase.length > 0) count++;
    if (filters.status && filters.status.length > 0) count++;
    if (filters.location && filters.location.city.trim()) count++;
    if (filters.ageRange && (filters.ageRange.min !== 18 || filters.ageRange.max !== 65)) count++;
    if (filters.gender && filters.gender !== 'all') count++;
    return count;
  }, [filters]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.condition && filters.condition.trim()) {
      params.set('condition', filters.condition);
    }
    
    if (filters.phase && filters.phase.length > 0) {
      params.set('phase', filters.phase.join(','));
    }
    
    if (filters.status && filters.status.length > 0) {
      params.set('status', filters.status.join(','));
    }
    
    if (filters.location && filters.location.city.trim()) {
      params.set('location', filters.location.city);
      params.set('radius', filters.location.radius.toString());
    }
    
    if (filters.ageRange && (filters.ageRange.min !== 18 || filters.ageRange.max !== 65)) {
      params.set('ageMin', filters.ageRange.min.toString());
      params.set('ageMax', filters.ageRange.max.toString());
    }
    
    if (filters.gender && filters.gender !== 'all') {
      params.set('gender', filters.gender);
    }
    
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const updateFilter = useCallback(<K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const clearFilter = useCallback((key: keyof SearchFilters) => {
    setFilters(prev => ({
      ...prev,
      [key]: defaultFilters[key],
    }));
  }, []);

  return {
    filters,
    activeFilterCount: activeFilterCount(),
    updateFilter,
    clearFilters,
    clearFilter,
  };
};