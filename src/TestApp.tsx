import React from 'react';
import { Box, Typography, Button } from '@mui/material';

function TestApp() {
  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Clinical Trials Platform - Test Mode
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        This is a test to verify the app is loading correctly.
      </Typography>
      <Button variant="contained" color="primary">
        Test Button
      </Button>
    </Box>
  );
}

export default TestApp;