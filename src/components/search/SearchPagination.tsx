import React from 'react';
import {
  Box,
  Pagination,
  Typography,
  Select,
  MenuItem,
  FormControl,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { colors } from '../../styles/theme';

const PaginationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 0),
  borderTop: `1px solid ${colors.border.light}`,
  marginTop: theme.spacing(3),
  
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(2),
    alignItems: 'center',
  },
}));

const ResultsInfo = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: colors.text.secondary,
  
  '& .highlight': {
    fontWeight: 600,
    color: colors.text.primary,
  },
  
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.8125rem',
    textAlign: 'center',
  },
}));

const PageSizeContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  
  [theme.breakpoints.down('sm')]: {
    order: -1,
  },
}));

const PageSizeSelect = styled(Select)(({ theme }) => ({
  minWidth: 80,
  height: 32,
  
  '& .MuiSelect-select': {
    padding: '6px 8px',
    fontSize: '0.875rem',
  },
  
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: colors.border.main,
  },
  
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: colors.primary.main,
  },
}));

const StyledPagination = styled(Pagination)(({ theme }) => ({
  '& .MuiPaginationItem-root': {
    fontSize: '0.875rem',
    minWidth: 32,
    height: 32,
    
    '&.Mui-selected': {
      backgroundColor: colors.primary.main,
      color: 'white',
      
      '&:hover': {
        backgroundColor: colors.primary.dark,
      },
    },
    
    '&:hover': {
      backgroundColor: colors.primary.light,
    },
  },
  
  [theme.breakpoints.down('sm')]: {
    '& .MuiPaginationItem-root': {
      minWidth: 28,
      height: 28,
      fontSize: '0.8125rem',
    },
  },
}));

const PAGE_SIZE_OPTIONS = [6, 12, 24, 48] as const;

interface SearchPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  disabled?: boolean;
}

export const SearchPagination: React.FC<SearchPaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  disabled = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    onPageChange(page);
  };

  const handlePageSizeChange = (event: any) => {
    const newPageSize = parseInt(event.target.value);
    onPageSizeChange?.(newPageSize);
  };

  // Calculate result range
  const startResult = (currentPage - 1) * pageSize + 1;
  const endResult = Math.min(currentPage * pageSize, totalCount);

  if (totalCount === 0) {
    return null;
  }

  return (
    <PaginationContainer>
      {/* Results info */}
      <ResultsInfo>
        Showing{' '}
        <span className="highlight">
          {startResult.toLocaleString()}
        </span>
        {' '}-{' '}
        <span className="highlight">
          {endResult.toLocaleString()}
        </span>
        {' '}of{' '}
        <span className="highlight">
          {totalCount.toLocaleString()}
        </span>
        {' '}results
      </ResultsInfo>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <StyledPagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          disabled={disabled}
          size={isMobile ? 'small' : 'medium'}
          siblingCount={isMobile ? 0 : 1}
          boundaryCount={1}
          showFirstButton={!isMobile}
          showLastButton={!isMobile}
        />
      )}

      {/* Page size selector */}
      {onPageSizeChange && (
        <PageSizeContainer>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: '0.875rem', whiteSpace: 'nowrap' }}
          >
            Show:
          </Typography>
          <FormControl size="small">
            <PageSizeSelect
              value={pageSize}
              onChange={handlePageSizeChange}
              disabled={disabled}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </PageSizeSelect>
          </FormControl>
        </PageSizeContainer>
      )}
    </PaginationContainer>
  );
};

export default SearchPagination;