import React, { useState } from 'react';
import { useParams, Routes, Route, Navigate, useParams as useRouteParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CircularProgress, Fade, IconButton, Tooltip, alpha, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Error as ErrorIcon, Visibility, VisibilityOff, Download as DownloadIcon, ContentCopy as ContentCopyIcon, Keyboard as KeyboardIcon, Help as HelpIcon } from '@mui/icons-material';
import { ProtocolProvider, useProtocol } from '../contexts/ProtocolContext';
import { SectionNav, ProtocolMetadataForm, ExportManager, CloneProtocolDialog } from '../components/protocol-builder';
import { ValidationStatusBar } from '../components/protocol-builder/ValidationStatusBar';
import { ObjectivesEditor, EligibilityEditor, InterventionsEditor, IntroductionEditor, TrialDesignEditor, AssessmentsEditor, StatisticsEditor, ProtocolSummaryEditor, DiscontinuationEditor, AdverseEventsEditor, TrialOversightEditor, AppendicesEditor, GlossaryEditor, ReferencesEditor } from '../components/protocol-builder/sections';
import { ValidationPanel } from '../components/validation/ValidationPanel';
import { useValidation } from '../hooks/useValidation';
import { KeyboardShortcuts, useKeyboardShortcuts, UserGuide } from '../components/common';
import { useNotification } from '../hooks/useNotification';
import { colors } from '../styles/theme';

const BuilderContainer = styled(Box)({
  display: 'flex',
  height: '100vh',
  background: `linear-gradient(135deg, ${alpha(colors.primary.light, 0.03)} 0%, ${alpha(colors.secondary.light, 0.02)} 100%)`,
  overflow: 'hidden',
});

const SidebarContainer = styled(Box)(() => ({
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

const HeaderCard = styled(Card)(() => ({
  margin: 24,
  padding: 24,
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  border: `1px solid ${alpha(colors.primary.main, 0.1)}`,
  borderRadius: 16,
  boxShadow: `0 4px 12px ${alpha(colors.primary.main, 0.08)}`,
}));

const ContentCard = styled(Card)(() => ({
  margin: '0 24px 24px 24px',
  padding: 32,
  background: '#ffffff',
  border: `1px solid ${alpha(colors.primary.main, 0.1)}`,
  borderRadius: 16,
  boxShadow: `0 4px 12px ${alpha(colors.primary.main, 0.08)}`,
}));

const ValidationSidebar = styled(Box)(() => ({
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

const ValidationToggle = styled(IconButton)(() => ({
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

// Section Content Component
const SectionContent: React.FC = () => {
  const { sectionNumber } = useRouteParams<{ sectionNumber: string }>();
  
  switch (sectionNumber) {
    case '1':
      return <ProtocolSummaryEditor />;
    case '2':
      return <IntroductionEditor />;
    case '3':
      return <ObjectivesEditor />;
    case '4':
      return <TrialDesignEditor />;
    case '5':
      return <EligibilityEditor />;
    case '6':
      return <InterventionsEditor />;
    case '7':
      return <DiscontinuationEditor />;
    case '8':
      return <AssessmentsEditor />;
    case '9':
      return <AdverseEventsEditor />;
    case '10':
      return <StatisticsEditor />;
    case '11':
      return <TrialOversightEditor />;
    case '12':
      return <AppendicesEditor />;
    case '13':
      return <GlossaryEditor />;
    case '14':
      return <ReferencesEditor />;
    default:
      return (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Section {sectionNumber} Editor
          </Typography>
          <Typography color="text.secondary">
            Editor for this section coming in next phase...
          </Typography>
        </Card>
      );
  }
};

const ProtocolBuilderContent: React.FC = () => {
  const { protocol, loading, error } = useProtocol();
  const [showValidation, setShowValidation] = useState(false);
  const [validationReport, setValidationReport] = useState<any>(null);
  const [validationLoading, setValidationLoading] = useState(false);
  const [sectionStatus, setSectionStatus] = useState<any>({});
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const navigate = useNavigate();
  const notification = useNotification();
  
  // Validation hook
  const { validateProtocol } = useValidation();

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSave: () => {
      notification.info('Auto-save active - changes saved automatically');
    },
    onExport: () => setExportDialogOpen(true),
    onNew: () => navigate('/protocols'),
    onHelp: () => setShortcutsOpen(true)
  });

  const handleValidate = async () => {
    if (!protocol?.id) return;
    
    setValidationLoading(true);
    try {
      const report = await validateProtocol(protocol.id);
      setValidationReport(report);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setValidationLoading(false);
    }
  };

  const handleValidationComplete = (report: any) => {
    setValidationReport(report);
    setSectionStatus(report.sectionStatus || {});
  };

  const handleNavigateToSection = (sectionNumber: string) => {
    navigate(`section/${sectionNumber}`);
  };

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
          <SectionNav 
            sections={protocol.sections || []} 
            protocolId={protocol.id}
            sectionStatus={sectionStatus}
          />
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
                  {/* Export Button */}
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => setExportDialogOpen(true)}
                    sx={{
                      borderColor: colors.primary.main,
                      color: colors.primary.main,
                      '&:hover': {
                        borderColor: colors.primary.dark,
                        backgroundColor: `${colors.primary.main}10`
                      }
                    }}
                  >
                    Export
                  </Button>

                  {/* Clone Button */}
                  <Button
                    variant="outlined"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => setCloneDialogOpen(true)}
                    sx={{
                      borderColor: colors.secondary.main,
                      color: colors.secondary.main,
                      '&:hover': {
                        borderColor: colors.secondary.dark,
                        backgroundColor: `${colors.secondary.main}10`
                      }
                    }}
                  >
                    Clone
                  </Button>

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

                  {/* Help Buttons */}
                  <Tooltip title="Keyboard Shortcuts (?)">
                    <IconButton
                      onClick={() => setShortcutsOpen(true)}
                      sx={{
                        color: colors.text.secondary,
                        '&:hover': {
                          color: colors.primary.main,
                          backgroundColor: `${colors.primary.main}10`
                        }
                      }}
                    >
                      <KeyboardIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="User Guide">
                    <IconButton
                      onClick={() => setGuideOpen(true)}
                      sx={{
                        color: colors.text.secondary,
                        '&:hover': {
                          color: colors.primary.main,
                          backgroundColor: `${colors.primary.main}10`
                        }
                      }}
                    >
                      <HelpIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </HeaderCard>

            {/* Content Area */}
            <ContentCard>
              {/* Validation Status Bar - Always Visible */}
              <ValidationStatusBar
                protocolId={protocol.id}
                onValidationComplete={handleValidationComplete}
              />
              
              <Routes>
                <Route index element={<ProtocolMetadataForm />} />
                <Route path="section/:sectionNumber" element={<SectionContent />} />
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
              report={validationReport}
              loading={validationLoading}
              onValidate={handleValidate}
              onNavigateToSection={handleNavigateToSection}
            />
          </ValidationSidebar>
        </Fade>
      )}

      {/* Export Manager */}
      <ExportManager
        protocolId={protocol.id}
        protocolTitle={protocol?.fullTitle || 'Protocol'}
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
      />

      {/* Clone Protocol Dialog */}
      <CloneProtocolDialog
        protocolId={protocol.id}
        protocolTitle={protocol?.fullTitle || 'Protocol'}
        open={cloneDialogOpen}
        onClose={() => setCloneDialogOpen(false)}
        onSuccess={(newId) => {
          window.location.href = `/protocols/${newId}`;
        }}
      />

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      {/* User Guide */}
      <UserGuide
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
      />
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
