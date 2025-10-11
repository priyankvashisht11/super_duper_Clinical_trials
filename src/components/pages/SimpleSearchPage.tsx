import React from 'react';
import { Box, Typography } from '@mui/material';

interface SimpleSearchPageProps {
  initialQuery?: string;
}

export const SimpleSearchPage: React.FC<SimpleSearchPageProps> = ({
  initialQuery = '',
}) => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Search Results
      </Typography>
      <Typography variant="body1">
        Query: "{initialQuery}"
      </Typography>
      <Typography variant="body2" sx={{ mt: 2 }}>
        Search functionality is being implemented...
      </Typography>
    </Box>
  );
};

export default SimpleSearchPage;