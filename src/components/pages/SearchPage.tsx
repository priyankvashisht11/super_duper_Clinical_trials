import React, { useState, useCallback, useEffect } from 'react';
import { Box, Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import { SearchResults } from '../search/SearchResults';
import { useSearch } from '../../hooks/useSearch';
import { useFilters } from '../../hooks/useFilters';
import type { ClinicalTrial } from '../../types';

const SearchPageContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  minHeight: '100vh',
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(4),
}));

const SearchContent = styled(Container)(({ theme }) => ({
  maxWidth: '100%',
  padding: 0,
  
  [theme.breakpoints.up('lg')]: {
    maxWidth: 'none',
  },
}));

interface SearchPageProps {
  initialQuery?: string;
  onTrialSelect?: (trial: ClinicalTrial) => void;
  onGenerateDocument?: (trialIds: string[]) => void;
  selectable?: boolean;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  initialQuery = '',
  onTrialSelect,
  onGenerateDocument,
  selectable = false,
}) => {
  // Search state
  const {
    query,
    results,
    totalCount,
    currentPage,
    totalPages,
    sortBy,
    sortOrder,
    isLoading,
    error,
    hasSearched,
    search,
    changePage,
    changeSort,
    clearSearch,

  } = useSearch({
    initialQuery,
    pageSize: 12,
    autoSearch: true,
  });

  // Filter state
  const {
    filters,
    activeFilterCount,
    clearFilters,
  } = useFilters();

  // Selection state for document generation
  const [selectedTrials, setSelectedTrials] = useState<string[]>([]);
  const [, setBookmarkedTrials] = useState<string[]>([]);

  // Load bookmarked trials from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('bookmarkedTrials');
    if (saved) {
      try {
        setBookmarkedTrials(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading bookmarked trials:', error);
      }
    }
  }, []);

  // Perform search when query or filters change
  useEffect(() => {
    if (query.trim() || activeFilterCount > 0) {
      search(query, filters, true);
    }
  }, [query, filters, activeFilterCount, search]);

  // Handle page changes
  const handlePageChange = useCallback((page: number) => {
    changePage(page, filters);
  }, [changePage, filters]);

  // Handle page size changes
  const handlePageSizeChange = useCallback((pageSize: number) => {
    // This would require updating the search hook to support dynamic page size
    console.log('Page size change requested:', pageSize);
  }, []);

  // Handle sort changes
  const handleSortChange = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    changeSort(sortBy, sortOrder, filters);
  }, [changeSort, filters]);

  // Handle trial selection for document generation
  const handleTrialSelect = useCallback((trialId: string, selected: boolean) => {
    setSelectedTrials(prev => {
      if (selected) {
        return [...prev, trialId];
      } else {
        return prev.filter(id => id !== trialId);
      }
    });
  }, []);

  // Handle clear selection
  const handleClearSelection = useCallback(() => {
    setSelectedTrials([]);
  }, []);

  // Handle trial click (view details)
  const handleTrialClick = useCallback((trial: ClinicalTrial) => {
    onTrialSelect?.(trial);
  }, [onTrialSelect]);

  // Handle bookmark toggle
  const handleBookmarkToggle = useCallback((trialId: string, bookmarked: boolean) => {
    setBookmarkedTrials(prev => {
      const updated = bookmarked 
        ? [...prev, trialId]
        : prev.filter(id => id !== trialId);
      
      // Save to localStorage
      localStorage.setItem('bookmarkedTrials', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Handle generate summary (single trial)
  const handleGenerateSummary = useCallback((trialId: string) => {
    onGenerateDocument?.([trialId]);
  }, [onGenerateDocument]);

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    clearSearch();
    setSelectedTrials([]);
  }, [clearSearch]);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: string) => {
    search(suggestion, filters, true);
  }, [search, filters]);

  return (
    <SearchPageContainer>
      <SearchContent>
        <SearchResults
          // Data
          results={results}
          totalCount={totalCount}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={12}
          
          // Search state
          query={query}
          filters={filters}
          sortBy={sortBy}
          sortOrder={sortOrder}
          
          // Loading and error states
          isLoading={isLoading}
          error={error}
          hasSearched={hasSearched}
          
          // Selection state
          selectedTrials={selectedTrials}
          onTrialSelect={selectable ? handleTrialSelect : undefined}
          onClearSelection={handleClearSelection}
          
          // Actions
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSortChange={handleSortChange}
          onTrialClick={handleTrialClick}
          onBookmarkToggle={handleBookmarkToggle}
          onGenerateSummary={handleGenerateSummary}
          onClearSearch={handleClearSearch}
          onClearFilters={handleClearFilters}
          onSuggestionClick={handleSuggestionClick}
          
          // Configuration
          selectable={selectable}
          showPagination={true}
          showSortControls={true}
          highlightQuery={true}
        />
      </SearchContent>
    </SearchPageContainer>
  );
};

export default SearchPage;