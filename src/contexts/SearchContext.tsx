import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface SearchFilters {
  condition: string;
  phase: string[];
  status: string[];
  location: { city: string; radius: number };
  ageRange: [number, number];
  gender: string;
}

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: SearchFilters;
  updateFilter: (key: keyof SearchFilters, value: any) => void;
  clearFilters: () => void;
  activeFilterCount: number;
  triggerSearch: () => void;
  searchTrigger: number;
}

const defaultFilters: SearchFilters = {
  condition: '',
  phase: [],
  status: [],
  location: { city: '', radius: 50 },
  ageRange: [18, 65],
  gender: 'all',
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [searchTrigger, setSearchTrigger] = useState(0);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const triggerSearch = () => {
    setSearchTrigger(prev => prev + 1);
  };

  const activeFilterCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (key === 'condition' && value) return count + 1;
    if (key === 'phase' && Array.isArray(value) && value.length > 0) return count + value.length;
    if (key === 'status' && Array.isArray(value) && value.length > 0) return count + value.length;
    if (key === 'location' && value.city) return count + 1;
    if (key === 'ageRange' && (value[0] !== 18 || value[1] !== 65)) return count + 1;
    if (key === 'gender' && value !== 'all') return count + 1;
    return count;
  }, 0);

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        filters,
        updateFilter,
        clearFilters,
        activeFilterCount,
        triggerSearch,
        searchTrigger,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
};
