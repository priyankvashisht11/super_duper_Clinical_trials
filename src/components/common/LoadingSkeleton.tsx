import React from 'react';
import { Box, Skeleton, Card, CardContent, Grid } from '@mui/material';

export const ProtocolListSkeleton: React.FC = () => (
  <Grid container spacing={3}>
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <Grid item xs={12} md={6} lg={4} key={i}>
        <Card>
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
      </Grid>
    ))}
  </Grid>
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
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} variant="text" height={40} sx={{ mb: 1 }} />
            ))}
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={9}>
        <Card>
          <CardContent>
            <Skeleton variant="text" width="40%" height={40} sx={{ mb: 3 }} />
            <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={200} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
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