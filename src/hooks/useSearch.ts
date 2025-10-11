import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchService } from '../services/searchService';
import type { 
  ClinicalTrial, 
  SearchRequest, 
  SearchResponse, 
  SearchFilters,
  SearchFacets 
} from '../types';

export interface SearchState {
  query: string;
  results: ClinicalTrial[];
  totalCount: number;
  facets: SearchFacets | null;
  suggestions: string[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  currentPage: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface UseSearchOptions {
  initialQuery?: string;
  initialFilters?: SearchFilters;
  pageSize?: number;
  autoSearch?: boolean;
}

const defaultFilters: SearchFilters = {
  condition: '',
  phase: [],
  status: [],
  location: undefined,
  ageRange: undefined,
  gender: 'all',
};

export const useSearch = (options: UseSearchOptions = {}) => {
  const {
    initialQuery = '',
    initialFilters = defaultFilters,
    pageSize = 12,
    autoSearch = false,
  } = options;

  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize state from URL params
  const [state, setState] = useState<SearchState>(() => {
    const query = searchParams.get('q') || initialQuery;
    const page = parseInt(searchParams.get('page') || '1');
    const sortBy = searchParams.get('sort') || 'relevance';
    const sortOrder = (searchParams.get('order') || 'desc') as 'asc' | 'desc';

    return {
      query,
      results: [],
      totalCount: 0,
      facets: null,
      suggestions: [],
      isLoading: false,
      error: null,
      hasSearched: false,
      currentPage: page,
      sortBy,
      sortOrder,
    };
  });

  // Update URL when search state changes
  const updateURL = useCallback((newState: Partial<SearchState>) => {
    const params = new URLSearchParams(searchParams);
    
    if (newState.query !== undefined) {
      if (newState.query.trim()) {
        params.set('q', newState.query);
      } else {
        params.delete('q');
      }
    }
    
    if (newState.currentPage !== undefined && newState.currentPage > 1) {
      params.set('page', newState.currentPage.toString());
    } else {
      params.delete('page');
    }
    
    if (newState.sortBy !== undefined && newState.sortBy !== 'relevance') {
      params.set('sort', newState.sortBy);
    } else {
      params.delete('sort');
    }
    
    if (newState.sortOrder !== undefined && newState.sortOrder !== 'desc') {
      params.set('order', newState.sortOrder);
    } else {
      params.delete('order');
    }
    
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  // Perform search
  const performSearch = useCallback(async (
    query: string,
    filters: SearchFilters,
    page: number = 1,
    sort?: { field: string; order: 'asc' | 'desc' }
  ) => {
    if (!query.trim() && !hasActiveFilters(filters)) {
      setState(prev => ({
        ...prev,
        results: [],
        totalCount: 0,
        facets: null,
        suggestions: [],
        hasSearched: false,
        error: null,
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const request: SearchRequest = {
        query: query.trim(),
        filters,
        pagination: {
          page,
          limit: pageSize,
        },
        sort,
      };

      const response: SearchResponse = await searchService.searchTrials(request);

      setState(prev => ({
        ...prev,
        results: response.trials,
        totalCount: response.totalCount,
        facets: response.facets,
        suggestions: response.suggestions || [],
        isLoading: false,
        hasSearched: true,
        currentPage: page,
      }));

      // Update URL
      updateURL({ 
        query, 
        currentPage: page,
        sortBy: sort?.field,
        sortOrder: sort?.order,
      });

    } catch (error) {
      console.error('Search error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Search failed',
        results: [],
        totalCount: 0,
        facets: null,
      }));
    }
  }, [pageSize, updateURL]);

  // Helper function to check if filters are active
  const hasActiveFilters = useCallback((filters: SearchFilters): boolean => {
    return !!(
      (filters.condition && filters.condition.trim()) ||
      (filters.phase && filters.phase.length > 0) ||
      (filters.status && filters.status.length > 0) ||
      (filters.location && filters.location.city.trim()) ||
      (filters.ageRange && (filters.ageRange.min !== 18 || filters.ageRange.max !== 65)) ||
      (filters.gender && filters.gender !== 'all')
    );
  }, []);

  // Search function
  const search = useCallback((
    query: string, 
    filters: SearchFilters = defaultFilters,
    resetPage: boolean = true
  ) => {
    const page = resetPage ? 1 : state.currentPage;
    const sort = state.sortBy !== 'relevance' ? {
      field: state.sortBy,
      order: state.sortOrder,
    } : undefined;

    setState(prev => ({ ...prev, query }));
    performSearch(query, filters, page, sort);
  }, [state.currentPage, state.sortBy, state.sortOrder, performSearch]);

  // Change page
  const changePage = useCallback((page: number, filters: SearchFilters = defaultFilters) => {
    const sort = state.sortBy !== 'relevance' ? {
      field: state.sortBy,
      order: state.sortOrder,
    } : undefined;

    performSearch(state.query, filters, page, sort);
  }, [state.query, state.sortBy, state.sortOrder, performSearch]);

  // Change sort
  const changeSort = useCallback((
    sortBy: string, 
    sortOrder: 'asc' | 'desc' = 'desc',
    filters: SearchFilters = defaultFilters
  ) => {
    setState(prev => ({ ...prev, sortBy, sortOrder }));
    
    const sort = sortBy !== 'relevance' ? { field: sortBy, order: sortOrder } : undefined;
    performSearch(state.query, filters, 1, sort);
  }, [state.query, performSearch]);

  // Clear search
  const clearSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      query: '',
      results: [],
      totalCount: 0,
      facets: null,
      suggestions: [],
      hasSearched: false,
      error: null,
      currentPage: 1,
    }));
    updateURL({ query: '', currentPage: 1 });
  }, [updateURL]);

  // Get autocomplete suggestions
  const getSuggestions = useCallback(async (query: string): Promise<string[]> => {
    if (!query || query.length < 2) return [];
    
    try {
      return await searchService.getAutocompleteSuggestions(query);
    } catch (error) {
      console.error('Suggestions error:', error);
      return [];
    }
  }, []);

  // Auto-search on mount if query exists
  useEffect(() => {
    if (autoSearch && state.query.trim()) {
      search(state.query, initialFilters, false);
    }
  }, []); // Only run on mount

  // Computed values
  const totalPages = useMemo(() => 
    Math.ceil(state.totalCount / pageSize), 
    [state.totalCount, pageSize]
  );

  const hasResults = state.results.length > 0;
  const isEmpty = state.hasSearched && !state.isLoading && !hasResults && !state.error;

  return {
    // State
    query: state.query,
    results: state.results,
    totalCount: state.totalCount,
    facets: state.facets,
    suggestions: state.suggestions,
    isLoading: state.isLoading,
    error: state.error,
    hasSearched: state.hasSearched,
    currentPage: state.currentPage,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
    
    // Computed
    totalPages,
    hasResults,
    isEmpty,
    
    // Actions
    search,
    changePage,
    changeSort,
    clearSearch,
    getSuggestions,
  };
};

export default useSearch;