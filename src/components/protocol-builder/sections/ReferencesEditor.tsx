import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Alert, Button, List, ListItem,
  ListItemText, ListItemSecondaryAction, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  LibraryBooks as ReferencesIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { useProtocol } from '../../../contexts/ProtocolContext';
import { SectionHeader, SectionCompletionAlert } from '../index';
import { useValidation } from '../../../hooks/useValidation';
import { colors } from '../../../styles/theme';

interface Reference {
  id: string;
  type: 'journal' | 'book' | 'guideline' | 'website' | 'other';
  authors: string;
  title: string;
  journal?: string;
  year: string;
  volume?: string;
  pages?: string;
  doi?: string;
  url?: string;
  accessDate?: string;
}

export const ReferencesEditor: React.FC = () => {
  const { protocol, refreshProtocol } = useProtocol();
  const { validateProtocol, getLatestValidation } = useValidation();
  const [references, setReferences] = useState<Reference[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReference, setEditingReference] = useState<Partial<Reference>>({});
  const [validating, setValidating] = useState(false);
  const [sectionValidation, setSectionValidation] = useState<any>(null);
  const [showCompletionAlert, setShowCompletionAlert] = useState(false);
  const [lastCompletionScore, setLastCompletionScore] = useState(0);

  useEffect(() => {
    if (protocol?.sections) {
      const section = protocol.sections.find((s: any) => s.sectionNumber === '14');
      if (section?.content?.references) {
        setReferences(section.content.references);
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
    if (report?.sectionStatus?.['14']) {
      setSectionValidation(report.sectionStatus['14']);
    }
  };

  const handleValidateSection = async () => {
    if (!protocol?.id) return;
    
    setValidating(true);
    try {
      const report = await validateProtocol(protocol.id);
      if (report?.sectionStatus?.['14']) {
        setSectionValidation(report.sectionStatus['14']);
        
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
      const response = await fetch(`http://localhost:3001/api/protocols/sections/14`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocolId: protocol?.id,
          content: { references }
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

  const handleAddReference = () => {
    setEditingReference({
      type: 'journal',
      authors: '',
      title: '',
      year: new Date().getFullYear().toString()
    });
    setDialogOpen(true);
  };

  const handleEditReference = (reference: Reference) => {
    setEditingReference(reference);
    setDialogOpen(true);
  };

  const handleSaveReference = () => {
    if (!editingReference.authors || !editingReference.title || !editingReference.year) return;

    const newReference: Reference = {
      id: editingReference.id || Date.now().toString(),
      type: editingReference.type || 'journal',
      authors: editingReference.authors || '',
      title: editingReference.title || '',
      journal: editingReference.journal || '',
      year: editingReference.year || '',
      volume: editingReference.volume || '',
      pages: editingReference.pages || '',
      doi: editingReference.doi || '',
      url: editingReference.url || '',
      accessDate: editingReference.accessDate || ''
    };

    if (editingReference.id) {
      // Edit existing
      setReferences(prev => prev.map(r => r.id === editingReference.id ? newReference : r));
    } else {
      // Add new
      setReferences(prev => [...prev, newReference]);
    }

    setDialogOpen(false);
    setEditingReference({});
    handleSave();
  };

  const handleDeleteReference = (id: string) => {
    setReferences(prev => prev.filter(r => r.id !== id));
    handleSave();
  };

  const formatReference = (ref: Reference, index: number) => {
    let formatted = `${index + 1}. ${ref.authors}. ${ref.title}.`;
    
    if (ref.type === 'journal' && ref.journal) {
      formatted += ` ${ref.journal}.`;
      if (ref.year) formatted += ` ${ref.year}`;
      if (ref.volume) formatted += `;${ref.volume}`;
      if (ref.pages) formatted += `:${ref.pages}`;
    } else if (ref.type === 'book') {
      if (ref.year) formatted += ` ${ref.year}.`;
    } else if (ref.type === 'website' || ref.type === 'guideline') {
      if (ref.year) formatted += ` ${ref.year}.`;
      if (ref.url) formatted += ` Available at: ${ref.url}`;
      if (ref.accessDate) formatted += `. Accessed ${ref.accessDate}.`;
    }
    
    if (ref.doi) formatted += ` doi:${ref.doi}`;
    
    return formatted;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'website':
        return <LinkIcon />;
      default:
        return <ReferencesIcon />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'journal':
        return colors.primary.main;
      case 'book':
        return colors.secondary.main;
      case 'guideline':
        return colors.semantic.info;
      case 'website':
        return colors.semantic.warning;
      default:
        return colors.text.secondary;
    }
  };

  return (
    <Box>
      <SectionHeader
        sectionNumber="14"
        sectionTitle="References"
        description="Literature citations and supporting documentation"
        icon={<ReferencesIcon />}
        validationStatus={sectionValidation}
        onValidate={handleValidateSection}
        validating={validating}
      />

      {showCompletionAlert && (
        <SectionCompletionAlert
          sectionTitle="References"
          sectionNumber="14"
          completionScore={lastCompletionScore}
          onDismiss={() => setShowCompletionAlert(false)}
        />
      )}

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={600}>
              Literature References
            </Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddReference}
              variant="contained"
              sx={{
                background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
              }}
            >
              Add Reference
            </Button>
          </Box>

          {references.length === 0 ? (
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
              <Typography variant="body2" fontWeight={600} gutterBottom>
                No references added yet
              </Typography>
              <Typography variant="body2">
                Add citations for scientific literature, regulatory guidelines, and other sources
                referenced in the protocol. Proper citations support the scientific rationale
                and regulatory compliance of your study.
              </Typography>
            </Alert>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {references.length} reference{references.length !== 1 ? 's' : ''}
              </Typography>
              
              <List>
                {references.map((reference, index) => (
                  <ListItem
                    key={reference.id}
                    sx={{
                      border: `1px solid ${colors.primary.light}20`,
                      borderRadius: 2,
                      mb: 2,
                      alignItems: 'flex-start',
                      '&:hover': {
                        backgroundColor: `${colors.primary.light}10`,
                      }
                    }}
                  >
                    <Box sx={{ mr: 2, mt: 1 }}>
                      {getTypeIcon(reference.type)}
                    </Box>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              backgroundColor: getTypeColor(reference.type),
                              color: 'white',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              fontWeight: 600,
                              textTransform: 'uppercase'
                            }}
                          >
                            {reference.type}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {reference.year}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                          {formatReference(reference, index)}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        size="small"
                        onClick={() => handleEditReference(reference)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteReference(reference.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Reference Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingReference.id ? 'Edit Reference' : 'Add New Reference'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal" sx={{ mt: 4 }}>
            <InputLabel>Reference Type</InputLabel>
            <Select
              value={editingReference.type || 'journal'}
              onChange={(e) => setEditingReference({ ...editingReference, type: e.target.value as any })}
            >
              <MenuItem value="journal">Journal Article</MenuItem>
              <MenuItem value="book">Book</MenuItem>
              <MenuItem value="guideline">Guideline/Regulation</MenuItem>
              <MenuItem value="website">Website</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Authors"
            value={editingReference.authors || ''}
            onChange={(e) => setEditingReference({ ...editingReference, authors: e.target.value })}
            margin="normal"
            placeholder="Last name, First initial. et al."
          />
          
          <TextField
            fullWidth
            label="Title"
            value={editingReference.title || ''}
            onChange={(e) => setEditingReference({ ...editingReference, title: e.target.value })}
            margin="normal"
            multiline
            rows={2}
          />
          
          {(editingReference.type === 'journal' || !editingReference.type) && (
            <TextField
              fullWidth
              label="Journal Name"
              value={editingReference.journal || ''}
              onChange={(e) => setEditingReference({ ...editingReference, journal: e.target.value })}
              margin="normal"
            />
          )}
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Year"
              value={editingReference.year || ''}
              onChange={(e) => setEditingReference({ ...editingReference, year: e.target.value })}
              margin="normal"
              sx={{ width: 120 }}
            />
            
            {editingReference.type === 'journal' && (
              <>
                <TextField
                  label="Volume"
                  value={editingReference.volume || ''}
                  onChange={(e) => setEditingReference({ ...editingReference, volume: e.target.value })}
                  margin="normal"
                  sx={{ width: 120 }}
                />
                <TextField
                  label="Pages"
                  value={editingReference.pages || ''}
                  onChange={(e) => setEditingReference({ ...editingReference, pages: e.target.value })}
                  margin="normal"
                  sx={{ flex: 1 }}
                  placeholder="e.g., 123-130"
                />
              </>
            )}
          </Box>
          
          <TextField
            fullWidth
            label="DOI (Optional)"
            value={editingReference.doi || ''}
            onChange={(e) => setEditingReference({ ...editingReference, doi: e.target.value })}
            margin="normal"
            placeholder="10.1000/xyz123"
          />
          
          {(editingReference.type === 'website' || editingReference.type === 'guideline') && (
            <>
              <TextField
                fullWidth
                label="URL"
                value={editingReference.url || ''}
                onChange={(e) => setEditingReference({ ...editingReference, url: e.target.value })}
                margin="normal"
                placeholder="https://..."
              />
              <TextField
                fullWidth
                label="Access Date"
                value={editingReference.accessDate || ''}
                onChange={(e) => setEditingReference({ ...editingReference, accessDate: e.target.value })}
                margin="normal"
                placeholder="January 1, 2024"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveReference}
            variant="contained"
            disabled={!editingReference.authors || !editingReference.title || !editingReference.year}
          >
            {editingReference.id ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};