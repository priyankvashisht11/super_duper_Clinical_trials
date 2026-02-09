import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Typography, Box, Button } from '@mui/material';
import { MainLayout } from './components/layout';
import { LandingPage } from './components/pages';
import { ValidationDemoPage } from './components/pages/ValidationDemoPage';
import { ProtocolBuilderPage } from './pages/ProtocolBuilderPage';
import { ProtocolListPage } from './pages/ProtocolListPage';
import { ErrorBoundary, NotificationProvider } from './components/common';

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
    <ErrorBoundary>
      <NotificationProvider>
        <Routes>
      <Route path="/" element={
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
      } />
      
      <Route path="/search" element={
        <MainLayout showFilters={true} showDocumentPanel={true}>
          <Box sx={{ p: 4 }}>
            <Typography variant="h4">Search Trials</Typography>
            <Typography variant="body1" color="text.secondary">
              Search functionality coming soon...
            </Typography>
          </Box>
        </MainLayout>
      } />
      
      <Route path="/documents" element={
        <MainLayout showFilters={false} showDocumentPanel={true}>
          <Box sx={{ p: 4 }}>
            <Typography variant="h4">My Documents</Typography>
            <Typography variant="body1" color="text.secondary">
              Your saved documents will appear here...
            </Typography>
          </Box>
        </MainLayout>
      } />
      
      <Route path="/bookmarks" element={
        <MainLayout showFilters={false} showDocumentPanel={false}>
          <Box sx={{ p: 4 }}>
            <Typography variant="h4">Bookmarks</Typography>
            <Typography variant="body1" color="text.secondary">
              Your bookmarked trials will appear here...
            </Typography>
          </Box>
        </MainLayout>
      } />
      
      <Route path="/protocols" element={<ProtocolListPage />} />
      
      <Route path="/protocols/:id/*" element={<ProtocolBuilderPage />} />
      
      <Route path="/protocol-builder" element={
        <MainLayout showFilters={false} showDocumentPanel={false}>
          <Box sx={{ p: 4 }}>
            <Typography variant="h4">Protocol Builder (Legacy)</Typography>
            <Typography variant="body1" color="text.secondary">
              This is the old demo. Use /protocols for the new builder.
            </Typography>
          </Box>
        </MainLayout>
      } />
      
      <Route path="/validation-demo" element={
        <ValidationDemoPage />
      } />
      
      <Route path="/about" element={
        <MainLayout showFilters={false} showDocumentPanel={false}>
          <Box sx={{ p: 4 }}>
            <Typography variant="h4">About</Typography>
            <Typography variant="body1" color="text.secondary">
              Learn more about our clinical trials platform...
            </Typography>
          </Box>
        </MainLayout>
      } />
        </Routes>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
