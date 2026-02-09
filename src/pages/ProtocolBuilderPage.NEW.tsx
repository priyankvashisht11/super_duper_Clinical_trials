import React, { useState } from 'react';
import { useParams, Routes, Route, Navigate } from 'react-router-dom';
import { Box, Typography, Card, CircularProgress, Fade, IconButton, Tooltip, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CheckCircle, Warning, Error as ErrorIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { ProtocolProvider, useProtocol } from '../contexts/ProtocolContext';
import { SectionNav, ProtocolMetadataForm } from '../components/protocol-builder';
import { ValidationPanel } from '../components/validation/ValidationPanel';
import { colors } from '../styles/theme';

const BuilderContainer = styled(Box)({
  display: 'flex',
  height: '100vh',
  background: `linear-gradient(135deg, ${alpha(colors.primary.light, 0.03)} 0%, ${alpha(colors.secondary.light, 0.02)} 100%)`,
  overflow: 'hidden',
});

const SidebarContainer = styled(Box)(({ theme }) => ({
  width: 280,
  flexShrink: 0,
  background: '#ffffff',
  borderRight: `1px solid ${alpha(colors.primary.main, 0.1)}`,
  boxShadow: `4px 0 12px ${alpha(colors.primary.main, 0.05)}`,
  overflowY: 'auto',
  zIndex: 10,
}));

const MainContent = styled(Box)({
  flex: 1,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
});

const HeaderCard = styled(Card)(({ theme }) => ({
  margin: 24,
  padding: 24,
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  border: `1px solid ${alpha(colors.primary.main, 0.1)}`,
  borderRadius: 16,
  boxShadow: `0 4px 12px ${alpha(colors.primary.main, 0.08)}`,
}));

const ContentCard = styled(Card)(({ theme }) => ({
  margin: '0 24px 24px 24px',
  padding: 32,
  background: '#ffffff',
  border: `1px solid ${alpha(colors.primary.main, 0.1)}`,
  borderRadius: 16,
  boxShadow: `0 4px 12px ${alpha(colors.primary.main, 0.08)}`,
}));

const ValidationSidebar = styled(Box)(({ theme }) => ({
  width: 400,
  flexShrink: 0,
  background: '#ffffff',
  borderLeft: `1px solid ${alpha(colors.primary.main, 0.1)}`,
  boxShadow: `-4px 0 12px ${alpha(colors.primary.main, 0.05)}`,
  overflowY: 'auto',
  zIndex: 10,
}));

const ProgressCircle = styled(Box)({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const ValidationToggle = styled(IconButton)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
  color: '#ffffff',
  padding: 12,
  boxShadow: `0 4px 12px ${alpha(colors.primary.main, 0.3)}`,
  
  '&:hover': {
    background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.secondary.dark} 100%)`,
    boxShadow: `0 6px 16px ${alpha(colors.primary.main, 0.4)}`,
    transform: 'scale(1.05)',
  },
  
  '&.active': {
    background: `linear-gradient(135deg, ${colors.semantic.success} 0%, ${colors.semantic.info} 100%)`,
  },
}));

const ProtocolBuilderContent: React.FC = () => {
  const { protocol, loading, error } = useProtocol();
  const [showValidation, setShowValidation] = useState(false);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 2 }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary">Loading protocol...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', p: 4 }}>
        <Card sx={{ p: 4, maxWidth: 500, textAlign: 'center', borderColor: 'error.main' }}>
          <ErrorIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" fontWeight={600} gutterBottom>Error Loading Protocol</Typography>
          <Typography color="text.secondary">{error}</Typography>
        </Card>
      </Box>
    );
  }

  if (!protocol) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Typography variant="h6" color="text.secondary">Protocol not found</Typography>
      </Box>
    );
  }

  const completeness = protocol.completenessPercentage || 0;
  const getCompletenessColor = () => {
    if (completeness >= 90) return colors.semantic.success;
    if (completeness >= 70) return colors.semantic.info;
    if (completeness >= 40) return colors.semantic.warning;
    return colors.text.disabled;
  };

  return (
    <BuilderContainer>
      {/* Left Sidebar - Section Navigation */}
      <Fade in timeout={400}>
        <SidebarContainer>
          <SectionNav sections={protocol.sections || []} protocolId={protocol.id} />
        </SidebarContainer>
      </Fade>

      {/* Main Content Area */}
      <MainContent>
        <Fade in timeout={600}>
          <Box>
            {/* Header */}
            <HeaderCard>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="h4" 
                    fontWeight={700}
                    sx={{ 
                      mb: 1,
                      background: `linear-gradient(45deg, ${colors.primary.main}, ${colors.secondary.main})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {protocol.shortTitle || protocol.fullTitle}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      {protocol.sponsorProtocolIdentifier}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">•</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Version {protocol.protocolVersion}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">•</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(protocol.protocolDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  {/* Circular Progress */}
                  <ProgressCircle>
                    <CircularProgress
                      variant="determinate"
                      value={completeness}
                      size={80}
                      thickness={4}
                      sx={{
                        color: getCompletenessColor(),
                        '& .MuiCircularProgress-circle': {
                          strokeLinecap: 'round',
                        },
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="h6" fontWeight={700} sx={{ color: getCompletenessColor() }}>
                        {completeness}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                        Complete
                      </Typography>
                    </Box>
                  </ProgressCircle>

                  {/* Validation Toggle */}
                  <Tooltip title={showValidation ? 'Hide Validation' : 'Show Validation'}>
                    <ValidationToggle
                      onClick={() => setShowValidation(!showValidation)}
                      className={showValidation ? 'active' : ''}
                    >
                      {showValidation ? <VisibilityOff /> : <Visibility />}
                    </ValidationToggle>
                  </Tooltip>
                </Box>
              </Box>
            </HeaderCard>

            {/* Content Area */}
            <ContentCard>
              <Routes>
                <Route index element={<ProtocolMetadataForm />} />
                <Route path="section/:sectionNumber" element={
                  <Box>
                    <Typography variant="h5" fontWeight={600} gutterBottom>Section Content</Typography>
                    <Typography color="text.secondary">Section editor coming soon...</Typography>
                  </Box>
                } />
                <Route path="*" element={<Navigate to="" replace />} />
              </Routes>
            </ContentCard>
          </Box>
        </Fade>
      </MainContent>

      {/* Right Sidebar - Validation Panel */}
      {showValidation && (
        <Fade in timeout={400}>
          <ValidationSidebar>
            <ValidationPanel
              protocolId={protocol.id}
              onNavigateToSection={() => {}}
            />
          </ValidationSidebar>
        </Fade>
      )}
    </BuilderContainer>
  );
};

export const ProtocolBuilderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Typography variant="h6" color="text.secondary">No protocol ID provided</Typography>
      </Box>
    );
  }

  return (
    <ProtocolProvider protocolId={id}>
      <ProtocolBuilderContent />
    </ProtocolProvider>
  );
};
