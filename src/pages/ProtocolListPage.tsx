import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Card, CardContent, LinearProgress, Chip, Fade, Grow, alpha, Button,
  Tabs, Tab, Grid, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, 
  DialogActions, Menu, MenuItem, ListItemIcon, ListItemText, TextField
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Science, CheckCircle, Schedule, Edit, Add as AddIcon, Description as TemplateIcon,
  Psychology as AIIcon, Assessment as AssessmentIcon, MoreVert as MoreIcon,
  Delete as DeleteIcon, ContentCopy as CopyIcon, Visibility as ViewIcon, Home as HomeIcon,
  DriveFileRenameOutline as RenameIcon
} from '@mui/icons-material';
import { PrimaryButton } from '../components/styled/Buttons';
import { ProtocolTemplates } from '../components/protocol-builder/ProtocolTemplates';
import { ProtocolListSkeleton } from '../components/common/LoadingSkeleton';
import { AIProtocolDashboard } from '../components/ai';
import { colors } from '../styles/theme';
import { useAuth } from '../contexts/AuthContext';

const PageContainer = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(colors.primary.light, 0.05)} 0%, ${alpha(colors.secondary.light, 0.03)} 100%)`,
  minHeight: '100vh',
  padding: theme.spacing(4),
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 700,
  color: colors.text.primary,
  marginBottom: theme.spacing(1),
}));

const PageSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.125rem',
  color: colors.text.secondary,
  marginBottom: theme.spacing(3),
}));

const StatsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(4),
}));

const StatCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  border: `1px solid ${alpha(colors.primary.main, 0.1)}`,
  borderRadius: 12,
  boxShadow: `0 2px 8px ${alpha(colors.primary.main, 0.08)}`,
  transition: 'all 0.3s ease',
  
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 24px ${alpha(colors.primary.main, 0.15)}`,
  },
}));

const ProtocolCard = styled(Card)(({ theme }) => ({
  background: '#ffffff',
  border: `1px solid ${alpha(colors.primary.main, 0.1)}`,
  borderRadius: 16,
  boxShadow: `0 4px 12px ${alpha(colors.primary.main, 0.08)}`,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  height: '100%',
  
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 12px 32px ${alpha(colors.primary.main, 0.2)}`,
    borderColor: colors.primary.main,
  },
}));

const ProtocolsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: theme.spacing(3),
}));

const CreateButton = styled(PrimaryButton)(({ theme }) => ({
  borderRadius: 28,
  padding: '14px 36px',
  fontSize: '1.05rem',
  fontWeight: 700,
  background: `linear-gradient(135deg, #2196f3 0%, #00bcd4 100%)`,
  boxShadow: `0 6px 20px ${alpha('#2196f3', 0.4)}`,
  color: '#ffffff',
  textTransform: 'none',
  letterSpacing: '0.5px',
  border: 'none',
  
  '&:hover': {
    background: `linear-gradient(135deg, #1976d2 0%, #00acc1 100%)`,
    boxShadow: `0 8px 28px ${alpha('#2196f3', 0.5)}`,
    transform: 'translateY(-3px) scale(1.02)',
  },
  
  '&:active': {
    transform: 'translateY(-1px) scale(0.98)',
  },
  
  '& .MuiButton-startIcon': {
    marginRight: theme.spacing(1),
  },
}));

interface Protocol {
  id: string;
  sponsorProtocolIdentifier: string;
  fullTitle: string;
  shortTitle?: string;
  protocolVersion: string;
  protocolStatus?: string;
  trialPhase?: string;
  indication?: string;
  completenessPercentage?: number;
  updatedAt: string;
}

export const ProtocolListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [protocolToDelete, setProtocolToDelete] = useState<Protocol | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [protocolToRename, setProtocolToRename] = useState<Protocol | null>(null);
  const [newProtocolName, setNewProtocolName] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);

  useEffect(() => {
    loadProtocols();
  }, [user]); // Reload when user changes

  const loadProtocols = async () => {
    try {
      // Filter by logged-in user's email if available
      const params = new URLSearchParams();
      if (user?.email) {
        params.append('createdBy', user.email);
      }
      
      const response = await fetch(`http://localhost:3001/api/protocols?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to load protocols');
      const data = await response.json();
      setProtocols(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    try {
      // Create a new blank protocol
      const protocolData = {
        sponsorProtocolIdentifier: `PROTO-${Date.now()}`,
        fullTitle: 'New Clinical Trial Protocol',
        shortTitle: 'New Protocol',
        protocolVersion: '1.0',
        protocolDate: new Date().toISOString().split('T')[0],
        protocolStatus: 'draft',
        studyType: 'Interventional',
        createdBy: user?.email || 'anonymous' // Use logged-in user's email or 'anonymous'
      };

      const response = await fetch('http://localhost:3001/api/protocols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(protocolData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create protocol');
      }
      
      const newProtocol = await response.json();
      const protocolId = newProtocol.data.id;

      // Navigate to the new protocol
      navigate(`/protocols/${protocolId}`);
    } catch (error: any) {
      console.error('Failed to create new protocol:', error);
      alert(`Failed to create new protocol: ${error.message}`);
    }
  };

  const handleCreateFromTemplate = async (template: any) => {
    try {
      // Create protocol with template data
      const protocolData = {
        sponsorProtocolIdentifier: `${template.id.toUpperCase()}-${Date.now()}`,
        fullTitle: `${template.name} - ${new Date().getFullYear()}`,
        shortTitle: template.name,
        protocolVersion: '1.0',
        protocolDate: new Date().toISOString().split('T')[0],
        protocolStatus: 'draft',
        trialPhase: template.templateData.trialPhase,
        indication: template.templateData.indication,
        studyType: template.templateData.studyType
      };

      const response = await fetch('http://localhost:3001/api/protocols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(protocolData)
      });

      if (!response.ok) throw new Error('Failed to create protocol');
      const newProtocol = await response.json();
      const protocolId = newProtocol.data.id;

      // Add template objectives
      if (template.templateData.objectives) {
        for (const obj of template.templateData.objectives) {
          await fetch('http://localhost:3001/api/protocols/objectives', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              protocolId,
              objectiveType: obj.objectiveType,
              objectiveText: obj.objectiveText,
              estimand: obj.estimand
            })
          });
        }
      }

      // Add template eligibility criteria
      if (template.templateData.eligibilityCriteria) {
        for (const criterion of template.templateData.eligibilityCriteria) {
          await fetch('http://localhost:3001/api/protocols/criteria', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              protocolId,
              criterionType: criterion.criterionType,
              criterionText: criterion.criterionText
            })
          });
        }
      }

      // Navigate to new protocol
      navigate(`/protocols/${protocolId}`);
    } catch (error) {
      console.error('Failed to create protocol from template:', error);
      alert('Failed to create protocol from template. Please try again.');
    }
  };

  const handleOpenProtocol = (id: string) => {
    navigate(`/protocols/${id}`);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, protocol: Protocol) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedProtocol(protocol);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProtocol(null);
  };

  const handleDeleteClick = (protocol: Protocol) => {
    setProtocolToDelete(protocol);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!protocolToDelete) return;

    try {
      const response = await fetch(`http://localhost:3001/api/protocols/${protocolToDelete.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete protocol');
      }

      // Remove from local state
      setProtocols(protocols.filter(p => p.id !== protocolToDelete.id));
      setDeleteDialogOpen(false);
      setProtocolToDelete(null);
    } catch (error) {
      console.error('Failed to delete protocol:', error);
      alert('Failed to delete protocol. Please try again.');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProtocolToDelete(null);
  };

  const handleRenameClick = (protocol: Protocol) => {
    setProtocolToRename(protocol);
    setNewProtocolName(protocol.shortTitle || protocol.fullTitle);
    setRenameDialogOpen(true);
    handleMenuClose();
  };

  const handleRenameConfirm = async () => {
    if (!protocolToRename || !newProtocolName.trim()) return;

    try {
      const response = await fetch(`http://localhost:3001/api/protocols/${protocolToRename.id}`, {
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

      // Update local state
      setProtocols(protocols.map(p => 
        p.id === protocolToRename.id 
          ? { ...p, shortTitle: newProtocolName.trim() }
          : p
      ));
      
      setRenameDialogOpen(false);
      setProtocolToRename(null);
      setNewProtocolName('');
    } catch (error: any) {
      console.error('Failed to rename protocol:', error);
      alert(`Failed to rename protocol: ${error.message}`);
      // Don't close dialog on error so user can try again
    }
  };

  const handleRenameCancel = () => {
    setRenameDialogOpen(false);
    setProtocolToRename(null);
    setNewProtocolName('');
  };

  const getStatusColor = (completeness: number) => {
    if (completeness >= 90) return colors.semantic.success;
    if (completeness >= 70) return colors.semantic.info;
    if (completeness >= 40) return colors.semantic.warning;
    return colors.text.disabled;
  };

  const stats = {
    total: protocols.length,
    ready: protocols.filter(p => (p.completenessPercentage || 0) >= 90).length,
    inProgress: protocols.filter(p => (p.completenessPercentage || 0) >= 40 && (p.completenessPercentage || 0) < 90).length,
    draft: protocols.filter(p => (p.completenessPercentage || 0) < 40).length,
  };

  if (loading) {
    return (
      <PageContainer>
        <Fade in timeout={600}>
          <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
            <HeaderSection>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                  <PageTitle>My Protocols</PageTitle>
                  <PageSubtitle>Manage your clinical trial protocols with ICH M11 compliance</PageSubtitle>
                </Box>
              </Box>
            </HeaderSection>
            <ProtocolListSkeleton />
          </Box>
        </Fade>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 8 }}>
          <Card sx={{ p: 4, textAlign: 'center', borderColor: 'error.main' }}>
            <Typography variant="h5" color="error" gutterBottom>Error Loading Protocols</Typography>
            <Typography color="text.secondary">{error}</Typography>
          </Card>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Fade in timeout={600}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          {/* Header */}
          <HeaderSection>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <IconButton
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Home button clicked');
                      navigate('/');
                    }}
                    sx={{
                      color: colors.primary.main,
                      cursor: 'pointer',
                      zIndex: 10,
                      '&:hover': {
                        backgroundColor: `${colors.primary.main}10`,
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <HomeIcon />
                  </IconButton>
                  <PageTitle sx={{ mb: 0 }}>
                    My Protocols
                  </PageTitle>
                </Box>
                <PageSubtitle>
                  Manage your clinical trial protocols with ICH M11 compliance
                </PageSubtitle>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<TemplateIcon />}
                  onClick={() => setTemplatesOpen(true)}
                  sx={{
                    borderColor: colors.secondary.main,
                    color: colors.secondary.main,
                    '&:hover': {
                      borderColor: colors.secondary.dark,
                      backgroundColor: `${colors.secondary.main}10`
                    }
                  }}
                >
                  Templates
                </Button>
                <CreateButton onClick={handleCreateNew} startIcon={<AddIcon />}>
                  New Protocol
                </CreateButton>
              </Box>
            </Box>

            {/* Stats */}
            <StatsGrid>
              <Grow in timeout={800}>
                <StatCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Science sx={{ fontSize: 40, color: colors.primary.main }} />
                      <Box>
                        <Typography variant="h4" fontWeight={700} color="primary">
                          {stats.total}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Protocols
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </StatCard>
              </Grow>

              <Grow in timeout={900}>
                <StatCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CheckCircle sx={{ fontSize: 40, color: colors.semantic.success }} />
                      <Box>
                        <Typography variant="h4" fontWeight={700} sx={{ color: colors.semantic.success }}>
                          {stats.ready}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Ready for Review
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </StatCard>
              </Grow>

              <Grow in timeout={1000}>
                <StatCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Edit sx={{ fontSize: 40, color: colors.semantic.warning }} />
                      <Box>
                        <Typography variant="h4" fontWeight={700} sx={{ color: colors.semantic.warning }}>
                          {stats.inProgress}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          In Progress
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </StatCard>
              </Grow>

              <Grow in timeout={1100}>
                <StatCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Schedule sx={{ fontSize: 40, color: colors.text.disabled }} />
                      <Box>
                        <Typography variant="h4" fontWeight={700} color="text.secondary">
                          {stats.draft}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Draft
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </StatCard>
              </Grow>
            </StatsGrid>
          </HeaderSection>

          {/* Protocols Grid */}
          {protocols.length === 0 ? (
            <Fade in timeout={1000}>
              <Card sx={{ p: 8, textAlign: 'center', borderRadius: 4 }}>
                <Science sx={{ fontSize: 80, color: colors.text.disabled, mb: 2 }} />
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  No Protocols Yet
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 4 }}>
                  Get started by creating your first clinical trial protocol
                </Typography>
                <CreateButton onClick={handleCreateNew} startIcon={<Science />}>
                  Create Your First Protocol
                </CreateButton>
              </Card>
            </Fade>
          ) : (
            <ProtocolsGrid>
              {protocols.map((protocol, index) => {
                const completeness = protocol.completenessPercentage || 0;
                
                return (
                  <Grow key={protocol.id} in timeout={800 + index * 100}>
                    <ProtocolCard onClick={() => handleOpenProtocol(protocol.id)}>
                      <CardContent sx={{ p: 3 }}>
                        {/* Header */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1 }}>
                            <Chip 
                              label={protocol.sponsorProtocolIdentifier}
                              size="small"
                              sx={{ 
                                fontWeight: 600,
                                bgcolor: alpha(colors.primary.main, 0.1),
                                color: colors.primary.main,
                              }}
                            />
                            {protocol.protocolStatus && (
                              <Chip 
                                label={protocol.protocolStatus}
                                size="small"
                                sx={{ 
                                  fontWeight: 600,
                                  background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.secondary.main})`,
                                  color: '#fff',
                                }}
                              />
                            )}
                          </Box>
                          
                          {/* Menu Button */}
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, protocol)}
                            sx={{
                              color: colors.text.secondary,
                              '&:hover': {
                                color: colors.primary.main,
                                backgroundColor: `${colors.primary.main}10`
                              }
                            }}
                          >
                            <MoreIcon />
                          </IconButton>
                        </Box>

                        {/* Title */}
                        <Typography 
                          variant="h6" 
                          fontWeight={600}
                          sx={{ 
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: 56,
                          }}
                        >
                          {protocol.shortTitle || protocol.fullTitle}
                        </Typography>

                        {/* Details */}
                        <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {protocol.trialPhase && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Science sx={{ fontSize: 18, color: colors.text.secondary }} />
                              <Typography variant="body2" color="text.secondary">
                                {protocol.trialPhase}
                              </Typography>
                            </Box>
                          )}
                          {protocol.indication && (
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ 
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {protocol.indication}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            Version {protocol.protocolVersion}
                          </Typography>
                        </Box>

                        {/* Completeness */}
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" fontWeight={600} color="text.secondary">
                              Completeness
                            </Typography>
                            <Typography 
                              variant="body2" 
                              fontWeight={700}
                              sx={{ color: getStatusColor(completeness) }}
                            >
                              {completeness}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={completeness}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: alpha(colors.primary.main, 0.1),
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                background: `linear-gradient(90deg, ${getStatusColor(completeness)}, ${alpha(getStatusColor(completeness), 0.7)})`,
                              },
                            }}
                          />
                        </Box>

                        {/* Footer */}
                        <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(colors.primary.main, 0.1)}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            Updated {new Date(protocol.updatedAt).toLocaleDateString()}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            fontWeight={600}
                            sx={{ color: colors.primary.main }}
                          >
                            Open →
                          </Typography>
                        </Box>
                      </CardContent>
                    </ProtocolCard>
                  </Grow>
                );
              })}
            </ProtocolsGrid>
          )}
        </Box>
      </Fade>

      {/* Protocol Templates Dialog */}
      <ProtocolTemplates
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        onSelect={handleCreateFromTemplate}
      />

      {/* Protocol Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => {
          if (selectedProtocol) {
            handleOpenProtocol(selectedProtocol.id);
          }
          handleMenuClose();
        }}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Open Protocol</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          if (selectedProtocol) {
            handleRenameClick(selectedProtocol);
          }
        }}>
          <ListItemIcon>
            <RenameIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename Protocol</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          if (selectedProtocol) {
            handleDeleteClick(selectedProtocol);
          }
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: colors.semantic.error }} />
          </ListItemIcon>
          <ListItemText sx={{ color: colors.semantic.error }}>Delete Protocol</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
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
          {protocolToDelete && (
            <Box sx={{ mt: 2, p: 2, bgcolor: `${colors.semantic.error}10`, borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                {protocolToDelete.sponsorProtocolIdentifier}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {protocolToDelete.fullTitle}
              </Typography>
            </Box>
          )}
          <DialogContentText sx={{ mt: 2, color: colors.semantic.error, fontWeight: 600 }}>
            This action cannot be undone. All protocol data, sections, objectives, and criteria will be permanently deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleDeleteCancel}
            variant="outlined"
            sx={{
              borderColor: colors.text.secondary,
              color: colors.text.secondary
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
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
        onClose={handleRenameCancel}
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
            Enter a new name for this protocol. This will update the short title displayed in the protocol list.
          </DialogContentText>
          {protocolToRename && (
            <Box sx={{ mb: 3, p: 2, bgcolor: `${colors.primary.main}10`, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Current Name
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {protocolToRename.shortTitle || protocolToRename.fullTitle}
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
                handleRenameConfirm();
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
            onClick={handleRenameCancel}
            variant="outlined"
            sx={{
              borderColor: colors.text.secondary,
              color: colors.text.secondary
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRenameConfirm}
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
    </PageContainer>
  );
};
