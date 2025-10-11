import { useState } from 'react';
import { Typography, Box, Button } from '@mui/material';
import { MainLayout } from './components/layout';
import { LandingPage } from './components/pages/LandingPage';

function App() {
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Removed unused handleAdvancedSearch and handleBrowseAll functions

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    setShowSearchResults(true);
  };

  const handleDemo = () => {
    console.log('Demo requested');
  };

  const handleRegister = () => {
    console.log('Registration requested');
  };

  const handleFeatureDemo = (featureId: string) => {
    console.log('Feature demo requested:', featureId);
  };

  return (
    <MainLayout showFilters={true} showDocumentPanel={true}>
      {/* Main content area */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          p: 4,
        }}
      >
        {!showSearchResults ? (
          <LandingPage
            onSearch={handleSearch}
            onDemo={handleDemo}
            onRegister={handleRegister}
            onFeatureDemo={handleFeatureDemo}
          />
        ) : (
          /* Search Results */
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
              Search Results
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              The DocumentPanel on the right has been enhanced with new features:
              <br />• Document template selection
              <br />• Citation style options  
              <br />• Enhanced trial selection
              <br />• Progress indicators
              <br />• Export capabilities
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => setShowSearchResults(false)}
            >
              Back to Home
            </Button>
          </Box>
        )}
      </Box>
    </MainLayout>
  );
}

export default App;
