import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Alert, Button, List, ListItem,
  ListItemText, ListItemSecondaryAction, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, InputAdornment
} from '@mui/material';
import {
  MenuBook as GlossaryIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useProtocol } from '../../../contexts/ProtocolContext';
import { SectionHeader, SectionCompletionAlert } from '../index';
import { useValidation } from '../../../hooks/useValidation';
import { colors } from '../../../styles/theme';

interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category?: string;
}

export const GlossaryEditor: React.FC = () => {
  const { protocol, refreshProtocol } = useProtocol();
  const { validateProtocol, getLatestValidation } = useValidation();
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [filteredTerms, setFilteredTerms] = useState<GlossaryTerm[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<Partial<GlossaryTerm>>({});
  const [validating, setValidating] = useState(false);
  const [sectionValidation, setSectionValidation] = useState<any>(null);
  const [showCompletionAlert, setShowCompletionAlert] = useState(false);
  const [lastCompletionScore, setLastCompletionScore] = useState(0);

  useEffect(() => {
    if (protocol?.sections) {
      const section = protocol.sections.find((s: any) => s.sectionNumber === '13');
      if (section?.content?.terms) {
        const sortedTerms = section.content.terms.sort((a: GlossaryTerm, b: GlossaryTerm) => 
          a.term.toLowerCase().localeCompare(b.term.toLowerCase())
        );
        setTerms(sortedTerms);
        setFilteredTerms(sortedTerms);
      }
    }
  }, [protocol]);

  useEffect(() => {
    if (protocol?.id) {
      loadSectionValidation();
    }
  }, [protocol?.id]);

  useEffect(() => {
    // Filter terms based on search query
    const filtered = terms.filter(term =>
      term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (term.category && term.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredTerms(filtered);
  }, [searchQuery, terms]);

  const loadSectionValidation = async () => {
    if (!protocol?.id) return;
    
    const report = await getLatestValidation(protocol.id);
    if (report?.sectionStatus?.['13']) {
      setSectionValidation(report.sectionStatus['13']);
    }
  };

  const handleValidateSection = async () => {
    if (!protocol?.id) return;
    
    setValidating(true);
    try {
      const report = await validateProtocol(protocol.id);
      if (report?.sectionStatus?.['13']) {
        setSectionValidation(report.sectionStatus['13']);
        
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
      const response = await fetch(`http://localhost:3001/api/protocols/sections/13`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocolId: protocol?.id,
          content: { terms }
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

  const handleAddTerm = () => {
    setEditingTerm({
      term: '',
      definition: '',
      category: ''
    });
    setDialogOpen(true);
  };

  const handleEditTerm = (term: GlossaryTerm) => {
    setEditingTerm(term);
    setDialogOpen(true);
  };

  const handleSaveTerm = () => {
    if (!editingTerm.term || !editingTerm.definition) return;

    const newTerm: GlossaryTerm = {
      id: editingTerm.id || Date.now().toString(),
      term: editingTerm.term || '',
      definition: editingTerm.definition || '',
      category: editingTerm.category || ''
    };

    let updatedTerms;
    if (editingTerm.id) {
      // Edit existing
      updatedTerms = terms.map(t => t.id === editingTerm.id ? newTerm : t);
    } else {
      // Add new
      updatedTerms = [...terms, newTerm];
    }

    // Sort alphabetically
    updatedTerms.sort((a, b) => a.term.toLowerCase().localeCompare(b.term.toLowerCase()));
    setTerms(updatedTerms);
    setFilteredTerms(updatedTerms);

    setDialogOpen(false);
    setEditingTerm({});
    handleSave();
  };

  const handleDeleteTerm = (id: string) => {
    const updatedTerms = terms.filter(t => t.id !== id);
    setTerms(updatedTerms);
    setFilteredTerms(updatedTerms);
    handleSave();
  };

  // Common clinical trial terms to suggest
  const commonTerms = [
    { term: 'AE', definition: 'Adverse Event - Any untoward medical occurrence in a patient or clinical investigation subject' },
    { term: 'SAE', definition: 'Serious Adverse Event - An adverse event that results in death, is life-threatening, requires hospitalization, or results in persistent disability' },
    { term: 'ICF', definition: 'Informed Consent Form - A document that describes the clinical trial and the rights and responsibilities of participants' },
    { term: 'CRF', definition: 'Case Report Form - A printed, optical, or electronic document designed to record all protocol-required information' },
    { term: 'GCP', definition: 'Good Clinical Practice - An international ethical and scientific quality standard for clinical trials' },
    { term: 'IRB', definition: 'Institutional Review Board - An independent committee that reviews and approves clinical research protocols' },
    { term: 'PI', definition: 'Principal Investigator - The physician responsible for the conduct of the clinical trial at a study site' },
    { term: 'CRO', definition: 'Contract Research Organization - An organization that provides support to the pharmaceutical industry' }
  ];

  return (
    <Box>
      <SectionHeader
        sectionNumber="13"
        sectionTitle="Glossary of Terms and Abbreviations"
        description="Definitions of terms, abbreviations, and acronyms used in the protocol"
        icon={<GlossaryIcon />}
        validationStatus={sectionValidation}
        onValidate={handleValidateSection}
        validating={validating}
      />

      {showCompletionAlert && (
        <SectionCompletionAlert
          sectionTitle="Glossary of Terms and Abbreviations"
          sectionNumber="13"
          completionScore={lastCompletionScore}
          onDismiss={() => setShowCompletionAlert(false)}
        />
      )}

      <Card>
        <CardContent>
          {/* Header with Search and Add */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <TextField
              placeholder="Search terms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{ width: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddTerm}
              variant="contained"
              sx={{
                background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
              }}
            >
              Add Term
            </Button>
          </Box>

          {terms.length === 0 ? (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                No terms defined yet
              </Typography>
              <Typography variant="body2">
                Add definitions for abbreviations, acronyms, and technical terms used throughout the protocol.
                This helps ensure clarity and consistency for all readers.
              </Typography>
            </Alert>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {filteredTerms.length} of {terms.length} terms
              {searchQuery && ` matching "${searchQuery}"`}
            </Typography>
          )}

          {/* Terms List */}
          <List>
            {filteredTerms.map((term) => (
              <ListItem
                key={term.id}
                sx={{
                  border: `1px solid ${colors.primary.light}20`,
                  borderRadius: 2,
                  mb: 2,
                  '&:hover': {
                    backgroundColor: `${colors.primary.light}10`,
                  }
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h6" fontWeight={700} color="primary">
                        {term.term}
                      </Typography>
                      {term.category && (
                        <Typography
                          variant="caption"
                          sx={{
                            backgroundColor: colors.secondary.light,
                            color: colors.secondary.dark,
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontWeight: 600
                          }}
                        >
                          {term.category}
                        </Typography>
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {term.definition}
                    </Typography>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    size="small"
                    onClick={() => handleEditTerm(term)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteTerm(term.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>

          {/* Common Terms Suggestion */}
          {terms.length === 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Common Clinical Trial Terms
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Click to add commonly used terms to your glossary:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {commonTerms.map((commonTerm) => (
                  <Button
                    key={commonTerm.term}
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      const newTerm: GlossaryTerm = {
                        id: Date.now().toString() + Math.random(),
                        term: commonTerm.term,
                        definition: commonTerm.definition,
                        category: 'Clinical Trial'
                      };
                      const updatedTerms = [...terms, newTerm].sort((a, b) => 
                        a.term.toLowerCase().localeCompare(b.term.toLowerCase())
                      );
                      setTerms(updatedTerms);
                      setFilteredTerms(updatedTerms);
                      handleSave();
                    }}
                  >
                    {commonTerm.term}
                  </Button>
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Term Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTerm.id ? 'Edit Term' : 'Add New Term'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Term/Abbreviation"
            value={editingTerm.term || ''}
            onChange={(e) => setEditingTerm({ ...editingTerm, term: e.target.value })}
            margin="normal"
            placeholder="e.g., AE, SAE, ICF"
          />
          <TextField
            fullWidth
            label="Definition"
            value={editingTerm.definition || ''}
            onChange={(e) => setEditingTerm({ ...editingTerm, definition: e.target.value })}
            margin="normal"
            multiline
            rows={3}
            placeholder="Clear, concise definition of the term..."
          />
          <TextField
            fullWidth
            label="Category (Optional)"
            value={editingTerm.category || ''}
            onChange={(e) => setEditingTerm({ ...editingTerm, category: e.target.value })}
            margin="normal"
            placeholder="e.g., Clinical Trial, Regulatory, Medical"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveTerm}
            variant="contained"
            disabled={!editingTerm.term || !editingTerm.definition}
          >
            {editingTerm.id ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};