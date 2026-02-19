import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Alert, Button, List, ListItem,
  ListItemText, ListItemSecondaryAction, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField
} from '@mui/material';
import {
  Attachment as AttachmentIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useProtocol } from '../../../contexts/ProtocolContext';
import { SectionHeader, SectionCompletionAlert } from '../index';
import { RichTextEditor } from '../RichTextEditor';
import { useValidation } from '../../../hooks/useValidation';
import { colors } from '../../../styles/theme';

interface Appendix {
  id: string;
  title: string;
  description: string;
  content: string;
}

export const AppendicesEditor: React.FC = () => {
  const { protocol, refreshProtocol } = useProtocol();
  const { validateProtocol, getLatestValidation } = useValidation();
  const [appendices, setAppendices] = useState<Appendix[]>([]);
  const [selectedAppendix, setSelectedAppendix] = useState<Appendix | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAppendix, setEditingAppendix] = useState<Partial<Appendix>>({});
  const [validating, setValidating] = useState(false);
  const [sectionValidation, setSectionValidation] = useState<any>(null);
  const [showCompletionAlert, setShowCompletionAlert] = useState(false);
  const [lastCompletionScore, setLastCompletionScore] = useState(0);

  useEffect(() => {
    if (protocol?.sections) {
      const section = protocol.sections.find((s: any) => s.sectionNumber === '12');
      if (section?.content?.appendices) {
        setAppendices(section.content.appendices);
      }
    }
  }, [protocol]);

  useEffect(() => {
    if (protocol?.id) {
      loadSectionValidation();
    }
  }, [protocol?.id]);

  const loadSectionValidation = async () => {
    if (!protocol?.id) return;
    
    const report = await getLatestValidation(protocol.id);
    if (report?.sectionStatus?.['12']) {
      setSectionValidation(report.sectionStatus['12']);
    }
  };

  const handleValidateSection = async () => {
    if (!protocol?.id) return;
    
    setValidating(true);
    try {
      const report = await validateProtocol(protocol.id);
      if (report?.sectionStatus?.['12']) {
        setSectionValidation(report.sectionStatus['12']);
        
        // Check overall completeness score from report
        if (report?.completenessScore && report.completenessScore > lastCompletionScore + 10) {
          setShowCompletionAlert(true);
          setLastCompletionScore(report.completenessScore);
        }
      }
    } finally {
      setValidating(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/protocols/sections/12`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocolId: protocol?.id,
          content: { appendices }
        })
      });

      if (response.ok) {
        await refreshProtocol();
        setTimeout(() => {
          handleValidateSection();
        }, 500);
      }
    } catch (error) {
      console.error('Error saving section:', error);
    }
  };

  const handleAddAppendix = () => {
    setEditingAppendix({
      title: '',
      description: '',
      content: ''
    });
    setDialogOpen(true);
  };

  const handleEditAppendix = (appendix: Appendix) => {
    setEditingAppendix(appendix);
    setDialogOpen(true);
  };

  const handleSaveAppendix = () => {
    if (!editingAppendix.title) return;

    const newAppendix: Appendix = {
      id: editingAppendix.id || Date.now().toString(),
      title: editingAppendix.title || '',
      description: editingAppendix.description || '',
      content: editingAppendix.content || ''
    };

    if (editingAppendix.id) {
      // Edit existing
      setAppendices(prev => prev.map(a => a.id === editingAppendix.id ? newAppendix : a));
    } else {
      // Add new
      setAppendices(prev => [...prev, newAppendix]);
    }

    setDialogOpen(false);
    setEditingAppendix({});
    handleSave();
  };

  const handleDeleteAppendix = (id: string) => {
    setAppendices(prev => prev.filter(a => a.id !== id));
    if (selectedAppendix?.id === id) {
      setSelectedAppendix(null);
    }
    handleSave();
  };

  const handleAppendixContentChange = (content: string) => {
    if (!selectedAppendix) return;
    
    const updatedAppendix = { ...selectedAppendix, content };
    setSelectedAppendix(updatedAppendix);
    setAppendices(prev => prev.map(a => a.id === selectedAppendix.id ? updatedAppendix : a));
  };

  return (
    <Box>
      <SectionHeader
        sectionNumber="12"
        sectionTitle="Appendices"
        description="Supporting documents and supplementary materials"
        icon={<AttachmentIcon />}
        validationStatus={sectionValidation}
        onValidate={handleValidateSection}
        validating={validating}
      />

      {showCompletionAlert && (
        <SectionCompletionAlert
          sectionTitle="Appendices"
          sectionNumber="12"
          completionScore={lastCompletionScore}
          onDismiss={() => setShowCompletionAlert(false)}
        />
      )}

      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Appendices List */}
        <Card sx={{ width: 400, flexShrink: 0 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Appendices
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddAppendix}
                variant="contained"
                size="small"
                sx={{
                  background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
                }}
              >
                Add
              </Button>
            </Box>

            {appendices.length === 0 ? (
              <Alert 
                severity="info"
                sx={{ 
                  backgroundColor: '#e3f2fd',
                  border: '2px solid #2196f3',
                  '& .MuiAlert-icon': { color: '#1976d2' },
                  '& .MuiAlert-message': { 
                    color: '#0d47a1',
                    '& .MuiTypography-root': { color: '#0d47a1', fontWeight: 600 }
                  }
                }}
              >
                <Typography variant="body2">
                  No appendices added yet. Click "Add" to create supporting documents
                  like informed consent forms, case report forms, or laboratory manuals.
                </Typography>
              </Alert>
            ) : (
              <List>
                {appendices.map((appendix) => (
                  <ListItem
                    key={appendix.id}
                    component="div"
                    onClick={() => setSelectedAppendix(appendix)}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: `${colors.primary.light}10`,
                      },
                      ...(selectedAppendix?.id === appendix.id && {
                        backgroundColor: `${colors.primary.light}20`,
                        borderLeft: `3px solid ${colors.primary.main}`,
                      })
                    }}
                  >
                    <ListItemText
                      primary={appendix.title}
                      secondary={appendix.description}
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditAppendix(appendix);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAppendix(appendix.id);
                        }}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {/* Appendix Content Editor */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            {selectedAppendix ? (
              <Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {selectedAppendix.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                  {selectedAppendix.description}
                </Typography>
                
                <RichTextEditor
                  value={selectedAppendix.content}
                  onChange={handleAppendixContentChange}
                  onSave={handleSave}
                  placeholder="Enter the content for this appendix..."
                  autoSave={true}
                  minRows={15}
                />
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <AttachmentIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Select an Appendix
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose an appendix from the list to edit its content, or add a new one.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Add/Edit Appendix Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAppendix.id ? 'Edit Appendix' : 'Add New Appendix'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={editingAppendix.title || ''}
            onChange={(e) => setEditingAppendix({ ...editingAppendix, title: e.target.value })}
            margin="normal"
            placeholder="e.g., Informed Consent Form"
          />
          <TextField
            fullWidth
            label="Description"
            value={editingAppendix.description || ''}
            onChange={(e) => setEditingAppendix({ ...editingAppendix, description: e.target.value })}
            margin="normal"
            multiline
            rows={2}
            placeholder="Brief description of this appendix..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveAppendix}
            variant="contained"
            disabled={!editingAppendix.title}
          >
            {editingAppendix.id ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};