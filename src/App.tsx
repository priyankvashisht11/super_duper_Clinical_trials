import { Routes, Route, useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { MainLayout } from './components/layout';
import { 
  LandingPage, 
  ResearchHubPageEnhanced as ResearchHubPage, 
  MyDocumentsPage, 
  BookmarksPage, 
  AboutPage,
  ValidationDemoPage,
  ProfilePage,
  SettingsPage,
  HelpSupportPage,
} from './components/pages';
import { ProtocolBuilderPage } from './pages/ProtocolBuilderPage';
import { ProtocolListPage } from './pages/ProtocolListPage';
import { ErrorBoundary, NotificationProvider } from './components/common';
import { SearchProvider } from './contexts/SearchContext';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    // Navigate to Research Hub with the search query as state
    navigate('/search', { state: { searchQuery: query, autoSearch: true } });
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
      <AuthProvider>
        <NotificationProvider>
          <SearchProvider>
            <Routes>
      <Route path="/" element={
        <MainLayout showFilters={false} showDocumentPanel={false}>
          <LandingPage
            onSearch={handleSearch}
            onDemo={handleDemo}
            onRegister={handleRegister}
            onFeatureDemo={handleFeatureDemo}
          />
        </MainLayout>
      } />
      
      <Route path="/search" element={
        <MainLayout showFilters={true} showDocumentPanel={true}>
          <ResearchHubPage />
        </MainLayout>
      } />
      
      <Route path="/documents" element={
        <MainLayout showFilters={false} showDocumentPanel={true}>
          <MyDocumentsPage />
        </MainLayout>
      } />
      
      <Route path="/bookmarks" element={
        <MainLayout showFilters={false} showDocumentPanel={false}>
          <BookmarksPage />
        </MainLayout>
      } />
      
      <Route path="/protocol-builder" element={<ProtocolListPage />} />
      
      <Route path="/protocol-builder/:id/*" element={<ProtocolBuilderPage />} />
      
      {/* Legacy route redirects */}
      <Route path="/protocols" element={<ProtocolListPage />} />
      <Route path="/protocols/:id/*" element={<ProtocolBuilderPage />} />
      
      <Route path="/validation-demo" element={
        <ValidationDemoPage />
      } />
      
      <Route path="/about" element={
        <MainLayout showFilters={false} showDocumentPanel={false}>
          <AboutPage />
        </MainLayout>
      } />

      <Route path="/profile" element={
        <MainLayout showFilters={false} showDocumentPanel={false}>
          <ProfilePage />
        </MainLayout>
      } />

      <Route path="/settings" element={
        <MainLayout showFilters={false} showDocumentPanel={false}>
          <SettingsPage />
        </MainLayout>
      } />

      <Route path="/preferences" element={
        <MainLayout showFilters={false} showDocumentPanel={false}>
          <SettingsPage />
        </MainLayout>
      } />

      <Route path="/help" element={
        <MainLayout showFilters={false} showDocumentPanel={false}>
          <HelpSupportPage />
        </MainLayout>
      } />
        </Routes>
          </SearchProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
