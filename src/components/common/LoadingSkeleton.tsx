import React from 'react';
import { Box, Skeleton, Card, CardContent } from '@mui/material';

export const ProtocolListSkeleton: React.FC = () => (
  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <Card key={i}>
        <CardContent>
          <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={80} sx={{ mb: 2 }} />
          <Box display="flex" gap={1}>
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
          </Box>
        </CardContent>
      </Card>
    ))}
  </Box>
);

export const ProtocolBuilderSkeleton: React.FC = () => (
  <Box>
    <Box display="flex" justifyContent="space-between" mb={3}>
      <Box flex={1}>
        <Skeleton variant="text" width="40%" height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="60%" height={24} />
      </Box>
      <Box display="flex" gap={2}>
        <Skeleton variant="rectangular" width={100} height={40} />
        <Skeleton variant="rectangular" width={100} height={40} />
      </Box>
    </Box>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '300px 1fr' }, gap: 3 }}>
      <Card>
        <CardContent>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} variant="text" height={40} sx={{ mb: 1 }} />
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Skeleton variant="text" width="40%" height={40} sx={{ mb: 3 }} />
          <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={200} />
        </CardContent>
      </Card>
    </Box>
  </Box>
);

export const SectionEditorSkeleton: React.FC = () => (
  <Card>
    <CardContent>
      <Skeleton variant="text" width="30%" height={40} sx={{ mb: 3 }} />
      <Skeleton variant="rectangular" height={300} sx={{ mb: 2 }} />
      <Box display="flex" justifyContent="flex-end">
        <Skeleton variant="rectangular" width={120} height={40} />
      </Box>
    </CardContent>
  </Card>
);
