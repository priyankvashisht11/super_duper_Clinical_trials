import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
} from '@mui/material';
import {
  SearchOff as NoResultsIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { colors } from '../../styles/theme';

const EmptyStateContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(6, 4),
  textAlign: 'center',
  backgroundColor: colors.background.surface,
  border: `1px solid ${colors.border.light}`,
  borderRadius: 16,
  minHeight: 400,
  
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(4, 3),
    minHeight: 300,
  },
}));

const EmptyIcon = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  backgroundColor: colors.primary.light,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
  
  '& .MuiSvgIcon-root': {
    fontSize: '2.5rem',
    color: colors.primary.main,
  },
  
  [theme.breakpoints.down('sm')]: {
    width: 64,
    height: 64,
    
    '& .MuiSvgIcon-root': {
      fontSize: '2rem',
    },
  },
}));

const EmptyTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 600,
  color: colors.text.primary,
  marginBottom: theme.spacing(1),
  
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.25rem',
  },
}));

const EmptyDescription = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  color: colors.text.secondary,
  marginBottom: theme.spacing(3),
  maxWidth: 500,
  lineHeight: 1.5,
  
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.9375rem',
  },
}));

const SuggestionsContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const SuggestionChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: 'white',
  border: `1px solid ${colors.border.main}`,
  
  '&:hover': {
    backgroundColor: colors.primary.light,
    borderColor: colors.primary.main,
  },
  
  '& .MuiChip-label': {
    fontSize: '0.875rem',
    fontWeight: 500,
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 20,
  padding: '10px 24px',
  fontSize: '0.9375rem',
  fontWeight: 500,
  textTransform: 'none',
  
  '&.primary': {
    backgroundColor: colors.primary.main,
    color: 'white',
    
    '&:hover': {
      backgroundColor: colors.primary.dark,
    },
  },
  
  '&.secondary': {
    backgroundColor: 'white',
    color: colors.primary.main,
    border: `1px solid ${colors.primary.main}`,
    
    '&:hover': {
      backgroundColor: colors.primary.light,
    },
  },
}));

interface SearchEmptyStateProps {
  query?: string;
  hasFilters?: boolean;
  onClearSearch?: () => void;
  onClearFilters?: () => void;
  onSuggestionClick?: (suggestion: string) => void;
  suggestions?: string[];
}

const DEFAULT_SUGGESTIONS = [
  'diabetes Phase III',
  'cancer immunotherapy',
  'cardiovascular disease',
  'hypertension treatment',
  'depression clinical trial',
  'arthritis Phase II',
];

export const SearchEmptyState: React.FC<SearchEmptyStateProps> = ({
  query,
  hasFilters = false,
  onClearSearch,
  onClearFilters,
  onSuggestionClick,
  suggestions = DEFAULT_SUGGESTIONS,
}) => {
  const hasQuery = query && query.trim().length > 0;

  const getTitle = () => {
    if (hasQuery && hasFilters) {
      return 'No trials match your search and filters';
    } else if (hasQuery) {
      return 'No trials found for your search';
    } else if (hasFilters) {
      return 'No trials match your filters';
    } else {
      return 'Start your clinical trials search';
    }
  };

  const getDescription = () => {
    if (hasQuery && hasFilters) {
      return 'Try adjusting your search terms or removing some filters to see more results.';
    } else if (hasQuery) {
      return 'Try different keywords, check for typos, or browse our suggested searches below.';
    } else if (hasFilters) {
      return 'Try removing some filters or adjusting your criteria to see more trials.';
    } else {
      return 'Search through thousands of clinical trials from the CTRI database. Use the search bar above or try one of these popular searches.';
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionClick?.(suggestion);
  };

  const handleClearAll = () => {
    onClearSearch?.();
    onClearFilters?.();
  };

  return (
    <EmptyStateContainer elevation={0}>
      <EmptyIcon>
        {hasQuery || hasFilters ? (
          <NoResultsIcon />
        ) : (
          <TrendingIcon />
        )}
      </EmptyIcon>

      <EmptyTitle>
        {getTitle()}
      </EmptyTitle>

      <EmptyDescription>
        {getDescription()}
      </EmptyDescription>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <SuggestionsContainer>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1.5, fontSize: '0.875rem', fontWeight: 500 }}
          >
            {hasQuery || hasFilters ? 'Try these searches:' : 'Popular searches:'}
          </Typography>
          <Box>
            {suggestions.slice(0, 6).map((suggestion, index) => (
              <SuggestionChip
                key={index}
                label={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                clickable
              />
            ))}
          </Box>
        </SuggestionsContainer>
      )}

      {/* Action buttons */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        {(hasQuery || hasFilters) && (
          <>
            {hasFilters && onClearFilters && (
              <ActionButton
                className="secondary"
                startIcon={<FilterIcon />}
                onClick={onClearFilters}
              >
                Clear Filters
              </ActionButton>
            )}
            {onClearSearch && (
              <ActionButton
                className="primary"
                startIcon={<RefreshIcon />}
                onClick={handleClearAll}
              >
                Clear Search
              </ActionButton>
            )}
          </>
        )}
      </Box>
    </EmptyStateContainer>
  );
};

export default SearchEmptyState;