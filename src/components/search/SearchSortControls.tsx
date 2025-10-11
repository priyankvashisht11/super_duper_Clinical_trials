import React from 'react';
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  SwapVert as SortIcon,
  KeyboardArrowUp as AscIcon,
  KeyboardArrowDown as DescIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { colors } from '../../styles/theme';

const SortContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(1, 0),
  
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(1),
  },
}));

const SortLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 500,
  color: colors.text.secondary,
  whiteSpace: 'nowrap',
  
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.8125rem',
  },
}));

const SortSelect = styled(Select)(({ theme }) => ({
  minWidth: 140,
  height: 36,
  
  '& .MuiSelect-select': {
    padding: '8px 12px',
    fontSize: '0.875rem',
  },
  
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: colors.border.main,
  },
  
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: colors.primary.main,
  },
  
  [theme.breakpoints.down('sm')]: {
    minWidth: 120,
    fontSize: '0.8125rem',
  },
}));

const OrderButton = styled(IconButton)(({ theme }) => ({
  width: 36,
  height: 36,
  border: `1px solid ${colors.border.main}`,
  borderRadius: 6,
  
  '&:hover': {
    backgroundColor: colors.primary.light,
    borderColor: colors.primary.main,
  },
  
  '&.active': {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
    color: 'white',
    
    '&:hover': {
      backgroundColor: colors.primary.dark,
    },
  },
}));

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'date', label: 'Start Date' },
  { value: 'title', label: 'Title' },
  { value: 'phase', label: 'Phase' },
  { value: 'status', label: 'Status' },
] as const;

interface SearchSortControlsProps {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  totalCount?: number;
  disabled?: boolean;
}

export const SearchSortControls: React.FC<SearchSortControlsProps> = ({
  sortBy,
  sortOrder,
  onSortChange,
  totalCount,
  disabled = false,
}) => {
  const handleSortFieldChange = (event: any) => {
    const newSortBy = event.target.value;
    onSortChange(newSortBy, sortOrder);
  };

  const handleSortOrderToggle = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(sortBy, newOrder);
  };

  const getSortOrderLabel = () => {
    if (sortBy === 'relevance') return 'Most relevant first';
    
    const fieldLabel = SORT_OPTIONS.find(opt => opt.value === sortBy)?.label || sortBy;
    return sortOrder === 'asc' 
      ? `${fieldLabel} (A-Z)` 
      : `${fieldLabel} (Z-A)`;
  };

  return (
    <SortContainer>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SortIcon sx={{ color: colors.text.secondary, fontSize: '1.125rem' }} />
        <SortLabel>Sort by:</SortLabel>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FormControl size="small">
          <SortSelect
            value={sortBy}
            onChange={handleSortFieldChange}
            disabled={disabled}
            displayEmpty
          >
            {SORT_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </SortSelect>
        </FormControl>
        
        {sortBy !== 'relevance' && (
          <Tooltip title={getSortOrderLabel()}>
            <OrderButton
              onClick={handleSortOrderToggle}
              disabled={disabled}
              className={sortOrder === 'desc' ? 'active' : ''}
              size="small"
            >
              {sortOrder === 'asc' ? (
                <AscIcon fontSize="small" />
              ) : (
                <DescIcon fontSize="small" />
              )}
            </OrderButton>
          </Tooltip>
        )}
      </Box>
      
      {totalCount !== undefined && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ 
            ml: 'auto',
            fontSize: '0.8125rem',
            whiteSpace: 'nowrap',
          }}
        >
          {totalCount.toLocaleString()} result{totalCount !== 1 ? 's' : ''}
        </Typography>
      )}
    </SortContainer>
  );
};

export default SearchSortControls;