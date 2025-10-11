import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Alert,
  Snackbar,
  Fade,
  Collapse,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { TrialCard } from '../trials/TrialCard';
import { SearchResultsSkeleton } from './SearchResultsSkeleton';
import { SearchSortControls } from './SearchSortControls';
import { SearchPagination } from './SearchPagination';
import { SearchEmptyState } from './SearchEmptyState';
import type { ClinicalTrial, SearchFilters } from '../../types';
import { colors } from '../../styles/theme';

const ResultsContainer = styled(Box)(({ theme }) => ({
  width: '100%',
}));

const ResultsHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  borderBottom: `1px solid ${colors.border.light}`,
  
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(1),
  },
}));

const ResultsGrid = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const SelectionBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1.5, 2),
  backgroundColor: colors.primary.light,
  borderRadius: 8,
  marginBottom: theme.spacing(2),
  border: `1px solid ${colors.primary.main}`,
  
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(1),
  },
}));

const SelectionInfo = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 500,
  color: colors.primary.dark,
  
  '& .count': {
    fontWeight: 600,
  },
}));

interface SearchResultsProps {
  // Data
  results: ClinicalTrial[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  
  // Search state
  query: string;
  filters: SearchFilters;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  
  // Selection state
  selectedTrials: string[];
  onTrialSelect?: (trialId: string, selected: boolean) => void;
  onClearSelection?: () => void;
  
  // Actions
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onTrialClick?: (trial: ClinicalTrial) => void;
  onBookmarkToggle?: (trialId: string, bookmarked: boolean) => void;
  onGenerateSummary?: (trialId: string) => void;
  onClearSearch?: () => void;
  onClearFilters?: () => void;
  onSuggestionClick?: (suggestion: string) => void;
  
  // Configuration
  selectable?: boolean;
  showPagination?: boolean;
  showSortControls?: boolean;
  highlightQuery?: boolean;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  // Data
  results,
  totalCount,
  currentPage,
  totalPages,
  pageSize,
  
  // Search state
  query,
  filters,
  sortBy,
  sortOrder,
  
  // Loading and error states
  isLoading,
  error,
  hasSearched,
  
  // Selection state
  selectedTrials = [],
  onTrialSelect,
  onClearSelection,
  
  // Actions
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onTrialClick,
  onBookmarkToggle,
  onGenerateSummary,
  onClearSearch,
  onClearFilters,
  onSuggestionClick,
  
  // Configuration
  selectable = false,
  showPagination = true,
  showSortControls = true,
  highlightQuery = true,
}) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return !!(
      (filters.condition && filters.condition.trim()) ||
      (filters.phase && filters.phase.length > 0) ||
      (filters.status && filters.status.length > 0) ||
      (filters.location && filters.location.city.trim()) ||
      (filters.ageRange && (filters.ageRange.min !== 18 || filters.ageRange.max !== 65)) ||
      (filters.gender && filters.gender !== 'all')
    );
  }, [filters]);

  // Handle trial selection
  const handleTrialSelect = useCallback((trialId: string, selected: boolean) => {
    onTrialSelect?.(trialId, selected);
    
    if (selected) {
      setSnackbarMessage('Trial added to selection');
    } else {
      setSnackbarMessage('Trial removed from selection');
    }
    setSnackbarOpen(true);
  }, [onTrialSelect]);

  // Handle trial click
  const handleTrialClick = useCallback((trial: ClinicalTrial) => {
    onTrialClick?.(trial);
  }, [onTrialClick]);

  // Handle bookmark toggle
  const handleBookmarkToggle = useCallback((trialId: string, bookmarked: boolean) => {
    onBookmarkToggle?.(trialId, bookmarked);
    
    setSnackbarMessage(bookmarked ? 'Trial bookmarked' : 'Bookmark removed');
    setSnackbarOpen(true);
  }, [onBookmarkToggle]);

  // Handle generate summary
  const handleGenerateSummary = useCallback((trialId: string) => {
    onGenerateSummary?.(trialId);
    setSnackbarMessage('Generating trial summary...');
    setSnackbarOpen(true);
  }, [onGenerateSummary]);

  // Close snackbar
  const handleSnackbarClose = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  // Get highlight terms for search
  const highlightTerms = useMemo(() => {
    if (!highlightQuery || !query.trim()) return undefined;
    return query.trim();
  }, [highlightQuery, query]);

  // Show loading state
  if (isLoading) {
    return (
      <ResultsContainer>
        {showSortControls && (
          <ResultsHeader>
            <SearchSortControls
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={onSortChange}
              disabled={true}
            />
          </ResultsHeader>
        )}
        <SearchResultsSkeleton count={pageSize} />
      </ResultsContainer>
    );
  }

  // Show error state
  if (error) {
    return (
      <ResultsContainer>
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            onClearSearch && (
              <Typography
                component="button"
                onClick={onClearSearch}
                sx={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                Try again
              </Typography>
            )
          }
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Search Error
          </Typography>
          {error}
        </Alert>
      </ResultsContainer>
    );
  }

  // Show empty state
  if (!hasSearched || (hasSearched && results.length === 0)) {
    return (
      <ResultsContainer>
        <SearchEmptyState
          query={query}
          hasFilters={hasActiveFilters}
          onClearSearch={onClearSearch}
          onClearFilters={onClearFilters}
          onSuggestionClick={onSuggestionClick}
        />
      </ResultsContainer>
    );
  }

  // Show results
  return (
    <ResultsContainer>
      {/* Sort controls */}
      {showSortControls && (
        <ResultsHeader>
          <SearchSortControls
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={onSortChange}
            totalCount={totalCount}
          />
        </ResultsHeader>
      )}

      {/* Selection bar */}
      <Collapse in={selectable && selectedTrials.length > 0}>
        <SelectionBar>
          <SelectionInfo>
            <span className="count">{selectedTrials.length}</span> trial
            {selectedTrials.length !== 1 ? 's' : ''} selected for document generation
          </SelectionInfo>
          {onClearSelection && (
            <Typography
              component="button"
              onClick={onClearSelection}
              sx={{
                background: 'none',
                border: 'none',
                color: colors.primary.dark,
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Clear selection
            </Typography>
          )}
        </SelectionBar>
      </Collapse>

      {/* Results grid */}
      <ResultsGrid>
        {results.map((trial, index) => (
          <Fade 
            key={trial.id} 
            in 
            timeout={300 + index * 50}
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            <Box>
              <TrialCard
                trial={trial}
                isSelected={selectedTrials.includes(trial.id)}
                onSelect={selectable ? handleTrialSelect : undefined}
                onViewDetails={handleTrialClick}
                onBookmark={handleBookmarkToggle}
                onGenerateSummary={handleGenerateSummary}
                selectable={selectable}
                highlightMatching={highlightTerms}
              />
            </Box>
          </Fade>
        ))}
      </ResultsGrid>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <SearchPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </ResultsContainer>
  );
};

export default SearchResults;