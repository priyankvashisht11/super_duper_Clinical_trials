import React, { useState, useEffect } from 'react';
import { useParams, Routes, Route, Navigate, useParams as useRouteParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CircularProgress, Fade, IconButton, Tooltip, alpha, Button, Fab, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Error as ErrorIcon, Visibility, VisibilityOff, Download as DownloadIcon, ContentCopy as ContentCopyIcon, Keyboard as KeyboardIcon, Help as HelpIcon, SmartToy as AIIcon, Delete as DeleteIcon, CheckCircle, Home as HomeIcon, ArrowBack as BackIcon, DriveFileRenameOutline as RenameIcon } from '@mui/icons-material';
import { ProtocolProvider, useProtocol } from '../contexts/ProtocolContext';
import { SectionNav, ProtocolMetadataFormEnhanced, ExportManager, CloneProtocolDialog } from '../components/protocol-builder';
import { ValidationStatusBar } from '../components/protocol-builder/ValidationStatusBar';
import { ObjectivesEditor, EligibilityEditor, InterventionsEditor, IntroductionEditor, TrialDesignEditor, AssessmentsEditor, StatisticsEditor, ProtocolSummaryEditor, DiscontinuationEditor, AdverseEventsEditor, TrialOversightEditor, AppendicesEditor, GlossaryEditor, ReferencesEditor } from '../components/protocol-builder/sections';
import { ValidationPanel } from '../components/validation/ValidationPanel';
import { AIAssistantPanel, AISmartSuggestions } from '../components/ai';
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
  const { protocol, loading, error, saving, lastSaved, updateProtocol } = useProtocol();
  const [showValidation, setShowValidation] = useState(false);
  const [validationReport, setValidationReport] = useState<any>(null);
  const [validationLoading, setValidationLoading] = useState(false);
  const [sectionStatus, setSectionStatus] = useState<any>({});
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newProtocolName, setNewProtocolName] = useState('');
  const navigate = useNavigate();
  const notification = useNotification();
  const { sectionNumber } = useRouteParams();
  
  // Validation hook
  const { validateProtocol } = useValidation();

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSave: () => {
      notification.info('Auto-save active - changes saved automatically');
    },
    onExport: () => setExportDialogOpen(true),
    onNew: () => navigate('/protocol-builder'),
    onHelp: () => setShortcutsOpen(true)
  });

  // AI Assistant keyboard shortcut (Ctrl/Cmd + Shift + A)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setAiAssistantOpen(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

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

  const handleDeleteProtocol = async () => {
    if (!protocol?.id) return;

    try {
      const response = await fetch(`http://localhost:3001/api/protocols/${protocol.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete protocol');
      }

      notification.success('Protocol deleted successfully');
      navigate('/protocol-builder');
    } catch (error) {
      console.error('Failed to delete protocol:', error);
      notification.error('Failed to delete protocol');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleRenameProtocol = async () => {
    if (!protocol?.id || !newProtocolName.trim()) return;

    try {
      const response = await fetch(`http://localhost:3001/api/protocols/${protocol.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shortTitle: newProtocolName.trim(),
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to rename protocol');
      }

      // Update protocol context
      if (updateProtocol) {
        updateProtocol({ shortTitle: newProtocolName.trim() });
      }

      notification.success('Protocol renamed successfully');
      setRenameDialogOpen(false);
      setNewProtocolName('');
    } catch (error: any) {
      console.error('Failed to rename protocol:', error);
      notification.error(`Failed to rename protocol: ${error.message}`);
      // Don't close dialog on error so user can try again
    }
  };

  const handleOpenRenameDialog = () => {
    setNewProtocolName(protocol?.shortTitle || protocol?.fullTitle || '');
    setRenameDialogOpen(true);
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
              {/* Breadcrumb Navigation */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Tooltip title="Go to Home">
                  <IconButton
                    onClick={() => {
                      console.log('Navigating to home');
                      window.location.href = '/';
                    }}
                    size="small"
                    sx={{
                      color: colors.text.secondary,
                      cursor: 'pointer',
                      '&:hover': {
                        color: colors.primary.main,
                        backgroundColor: `${colors.primary.main}10`
                      }
                    }}
                  >
                    <HomeIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Typography variant="body2" color="text.secondary">/</Typography>
                <Tooltip title="Back to My Protocols">
                  <Button
                    onClick={() => {
                      console.log('Navigating to protocol builder');
                      window.location.href = '/protocol-builder';
                    }}
                    startIcon={<BackIcon fontSize="small" />}
                    size="small"
                    sx={{
                      color: colors.text.secondary,
                      textTransform: 'none',
                      minWidth: 'auto',
                      cursor: 'pointer',
                      '&:hover': {
                        color: colors.primary.main,
                        backgroundColor: `${colors.primary.main}10`
                      }
                    }}
                  >
                    My Protocols
                  </Button>
                </Tooltip>
                <Typography variant="body2" color="text.secondary">/</Typography>
                <Typography variant="body2" color="primary" fontWeight={600}>
                  {protocol.sponsorProtocolIdentifier}
                </Typography>
              </Box>

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
                  {/* Auto-save Status */}
                  {(saving || lastSaved) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, borderRadius: 2, backgroundColor: saving ? `${colors.primary.main}10` : `${colors.semantic.success}10` }}>
                      {saving ? (
                        <>
                          <CircularProgress size={16} thickness={4} />
                          <Typography variant="caption" color="primary" fontWeight={600}>
                            Saving...
                          </Typography>
                        </>
                      ) : (
                        <>
                          <CheckCircle sx={{ fontSize: 16, color: colors.semantic.success }} />
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            Saved {lastSaved?.toLocaleTimeString()}
                          </Typography>
                        </>
                      )}
                    </Box>
                  )}

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

                  {/* Rename Button */}
                  <Button
                    variant="outlined"
                    startIcon={<RenameIcon />}
                    onClick={handleOpenRenameDialog}
                    sx={{
                      borderColor: colors.primary.main,
                      color: colors.primary.main,
                      '&:hover': {
                        borderColor: colors.primary.dark,
                        backgroundColor: `${colors.primary.main}10`
                      }
                    }}
                  >
                    Rename
                  </Button>

                  {/* Delete Button */}
                  <Button
                    variant="outlined"
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteDialogOpen(true)}
                    sx={{
                      borderColor: colors.semantic.error,
                      color: colors.semantic.error,
                      '&:hover': {
                        borderColor: colors.semantic.error,
                        backgroundColor: `${colors.semantic.error}10`
                      }
                    }}
                  >
                    Delete
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
                <Route index element={<ProtocolMetadataFormEnhanced />} />
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

      {/* AI Assistant Panel */}
      <AIAssistantPanel
        open={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
        protocolId={protocol.id}
        currentSection={sectionNumber}
      />

      {/* Smart Suggestions Sidebar - Temporarily Disabled */}
      {/* TODO: Fix AISmartSuggestions component props mismatch */}
      {false && showSuggestions && protocol.sections && (
        <Box
          sx={{
            position: 'fixed',
            right: showValidation ? 420 : 20,
            top: 100,
            width: 320,
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto',
            zIndex: 999,
            transition: 'right 0.3s ease'
          }}
        >
          <AISmartSuggestions
            protocolId={protocol.id}
            currentSection={sectionNumber || 'metadata'}
            completedSections={protocol.sections.filter((s: any) => s.isComplete).map((s: any) => s.sectionNumber)}
            protocolContext={protocol}
          />
        </Box>
      )}

      {/* Floating AI Assistant Button */}
      <Tooltip title="AI Assistant (Ctrl+Shift+A)" placement="left">
        <Fab
          color="primary"
          aria-label="AI Assistant"
          onClick={() => setAiAssistantOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
            boxShadow: `0 8px 24px ${alpha(colors.primary.main, 0.4)}`,
            '&:hover': {
              background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.secondary.dark} 100%)`,
              boxShadow: `0 12px 32px ${alpha(colors.primary.main, 0.5)}`,
              transform: 'scale(1.05)'
            },
            transition: 'all 0.3s ease',
            zIndex: 1000
          }}
        >
          <AIIcon sx={{ fontSize: 32 }} />
        </Fab>
      </Tooltip>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          fontWeight: 700,
          color: colors.semantic.error,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <DeleteIcon />
          Delete Protocol?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this protocol?
          </DialogContentText>
          {protocol && (
            <Box sx={{ mt: 2, p: 2, bgcolor: `${colors.semantic.error}10`, borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                {protocol.sponsorProtocolIdentifier}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {protocol.fullTitle}
              </Typography>
            </Box>
          )}
          <DialogContentText sx={{ mt: 2, color: colors.semantic.error, fontWeight: 600 }}>
            This action cannot be undone. All protocol data, sections, objectives, and criteria will be permanently deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{
              borderColor: colors.text.secondary,
              color: colors.text.secondary
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteProtocol}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            sx={{
              background: colors.semantic.error,
              '&:hover': {
                background: colors.semantic.error,
                filter: 'brightness(0.9)'
              }
            }}
          >
            Delete Protocol
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rename Protocol Dialog */}
      <Dialog
        open={renameDialogOpen}
        onClose={() => setRenameDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          fontWeight: 700,
          color: colors.primary.main,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <RenameIcon />
          Rename Protocol
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Enter a new name for this protocol. This will update the short title displayed throughout the application.
          </DialogContentText>
          {protocol && (
            <Box sx={{ mb: 3, p: 2, bgcolor: `${colors.primary.main}10`, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Current Name
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {protocol.shortTitle || protocol.fullTitle}
              </Typography>
            </Box>
          )}
          <TextField
            autoFocus
            fullWidth
            label="New Protocol Name"
            value={newProtocolName}
            onChange={(e) => setNewProtocolName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && newProtocolName.trim()) {
                handleRenameProtocol();
              }
            }}
            placeholder="Enter new protocol name"
            helperText="Press Enter to save"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: colors.primary.main,
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setRenameDialogOpen(false)}
            variant="outlined"
            sx={{
              borderColor: colors.text.secondary,
              color: colors.text.secondary
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRenameProtocol}
            variant="contained"
            disabled={!newProtocolName.trim()}
            startIcon={<RenameIcon />}
            sx={{
              background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.secondary.dark} 100%)`,
              },
              '&:disabled': {
                background: colors.text.disabled,
                color: '#fff'
              }
            }}
          >
            Rename
          </Button>
        </DialogActions>
      </Dialog>
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
