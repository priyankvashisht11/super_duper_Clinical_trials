import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout';
import { LandingPage } from './components/pages/LandingPage';
import {
  MyDocumentsPage,
  BookmarksPage,
  AboutPage,
  ProfilePage,
  SettingsPage,
  HelpSupportPage,
} from './components/pages';
import { ProtocolBuilderPage } from './pages/ProtocolBuilderPage';
import { DashboardPage } from './pages/DashboardPage';
import { ResearchPage } from './pages/ResearchPage';
import { RegulatoryPage } from './pages/RegulatoryPage';
import { PatientMatchPage } from './pages/PatientMatchPage';
import { EDCPage } from './pages/EDCPage';
import { CollectPage } from './pages/CollectPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { ErrorBoundary, NotificationProvider } from './components/common';
import { SearchProvider } from './contexts/SearchContext';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <SearchProvider>
            <Routes>
              {/* Public landing */}
              <Route path="/" element={<LandingPage />} />

              {/* Main authenticated dashboard — replaces flat protocol list */}
              <Route path="/dashboard" element={
                <MainLayout showFilters={false} showDocumentPanel={false}>
                  <DashboardPage />
                </MainLayout>
              } />

              {/* Research Intelligence — Sprint 1 */}
              <Route path="/research" element={<ResearchPage />} />

              {/* Regulatory Prep — Sprint 3 */}
              <Route path="/regulatory" element={<RegulatoryPage />} />

              {/* Patient-Trial Matching — Sprint 4 */}
              <Route path="/match" element={<PatientMatchPage />} />

              {/* EDC / Data Collection — Sprint 5 */}
              <Route path="/edc" element={<EDCPage />} />

              {/* Collect — REDCap/ODK-inspired field data collection — Sprint 9 */}
              <Route path="/collect" element={<CollectPage />} />

              {/* Analysis & Submission — Sprint 6 */}
              <Route path="/analysis" element={<AnalysisPage />} />

              {/* Protocol builder — will be rebuilt in Sprint 2; kept functional for now */}
              <Route path="/protocol-builder" element={
                <MainLayout showFilters={false} showDocumentPanel={false}>
                  <DashboardPage />
                </MainLayout>
              } />
              <Route path="/protocol-builder/:id/*" element={<ProtocolBuilderPage />} />

              {/* Legacy protocol routes */}
              <Route path="/protocols" element={<Navigate to="/dashboard" replace />} />
              <Route path="/protocols/:id/*" element={<ProtocolBuilderPage />} />

              {/* Documents */}
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

              {/* Secondary pages */}
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

              <Route path="/preferences" element={<Navigate to="/settings" replace />} />

              <Route path="/help" element={
                <MainLayout showFilters={false} showDocumentPanel={false}>
                  <HelpSupportPage />
                </MainLayout>
              } />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </SearchProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
