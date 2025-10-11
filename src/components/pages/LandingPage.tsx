import React from 'react';
import { Box, Container } from '@mui/material';
import { HeroSection, FeaturesShowcase } from '../landing';

interface LandingPageProps {
  onSearch?: (query: string) => void;
  onDemo?: () => void;
  onRegister?: () => void;
  onFeatureDemo?: (featureId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSearch,
  onDemo,
  onRegister,
  onFeatureDemo,
}) => {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Hero Section */}
        <HeroSection
          onSearch={onSearch}
          onDemo={onDemo}
          onRegister={onRegister}
        />
        
        {/* Features Showcase */}
        <FeaturesShowcase
          onFeatureDemo={onFeatureDemo}
        />
      </Container>
    </Box>
  );
};

export default LandingPage;