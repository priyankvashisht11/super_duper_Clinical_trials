import React, { useState } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import { TopNavigation } from './TopNavigation';
import { FilterSidebar } from './FilterSidebar';
import { DocumentPanel } from './DocumentPanel';
import { PageWrapper, ContentArea, MainContent } from '../styled/Layout';

interface MainLayoutProps {
  children: React.ReactNode;
  showFilters?: boolean;
  showDocumentPanel?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  showFilters = true,
  showDocumentPanel = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [documentPanelOpen, setDocumentPanelOpen] = useState(!isMobile && !isTablet);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleSidebarToggle = () => {
    if (isMobile) {
      setMobileDrawerOpen(!mobileDrawerOpen);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const handleDocumentPanelToggle = () => {
    setDocumentPanelOpen(!documentPanelOpen);
  };

  return (
    <PageWrapper>
      <TopNavigation
        onMenuClick={handleSidebarToggle}
        onDocumentPanelToggle={handleDocumentPanelToggle}
        documentPanelOpen={documentPanelOpen}
        showDocumentPanelToggle={showDocumentPanel}
      />
      
      <ContentArea>
        {showFilters && (
          <FilterSidebar
            open={sidebarOpen}
            mobileOpen={mobileDrawerOpen}
            onClose={() => setMobileDrawerOpen(false)}
            onToggle={handleSidebarToggle}
          />
        )}
        
        <MainContent>
          {children}
        </MainContent>
        
        {showDocumentPanel && (
          <DocumentPanel
            open={documentPanelOpen}
            onToggle={handleDocumentPanelToggle}
          />
        )}
      </ContentArea>
    </PageWrapper>
  );
};