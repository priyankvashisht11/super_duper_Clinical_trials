import React from 'react';
import { Box, Skeleton, Card, CardContent } from '@mui/material';
import { styled } from '@mui/material/styles';

const SkeletonCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: 12,
}));

const SkeletonRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

interface SearchResultsSkeletonProps {
  count?: number;
}

export const SearchResultsSkeleton: React.FC<SearchResultsSkeletonProps> = ({ 
  count = 6 
}) => {
  return (
    <Box>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} elevation={1}>
          <CardContent>
            {/* Header with CTRI number and status */}
            <SkeletonRow sx={{ justifyContent: 'space-between', mb: 2 }}>
              <Skeleton variant="text" width={180} height={24} />
              <Skeleton variant="rounded" width={80} height={24} />
            </SkeletonRow>
            
            {/* Title */}
            <Skeleton 
              variant="text" 
              width="90%" 
              height={32} 
              sx={{ mb: 1 }} 
            />
            <Skeleton 
              variant="text" 
              width="70%" 
              height={32} 
              sx={{ mb: 2 }} 
            />
            
            {/* Summary */}
            <Skeleton 
              variant="text" 
              width="100%" 
              height={20} 
              sx={{ mb: 0.5 }} 
            />
            <Skeleton 
              variant="text" 
              width="85%" 
              height={20} 
              sx={{ mb: 0.5 }} 
            />
            <Skeleton 
              variant="text" 
              width="60%" 
              height={20} 
              sx={{ mb: 2 }} 
            />
            
            {/* Metadata */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 1,
              mb: 2 
            }}>
              <SkeletonRow>
                <Skeleton variant="circular" width={16} height={16} />
                <Skeleton variant="text" width={120} height={20} />
              </SkeletonRow>
              <SkeletonRow>
                <Skeleton variant="circular" width={16} height={16} />
                <Skeleton variant="text" width={140} height={20} />
              </SkeletonRow>
              <SkeletonRow>
                <Skeleton variant="circular" width={16} height={16} />
                <Skeleton variant="text" width={160} height={20} />
              </SkeletonRow>
              <SkeletonRow>
                <Skeleton variant="circular" width={16} height={16} />
                <Skeleton variant="text" width={100} height={20} />
              </SkeletonRow>
            </Box>
            
            {/* Action buttons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Skeleton variant="rounded" width={100} height={32} />
              <Skeleton variant="rounded" width={120} height={32} />
            </Box>
          </CardContent>
        </SkeletonCard>
      ))}
    </Box>
  );
};

export default SearchResultsSkeleton;