import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Chip, Alert
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useProtocol } from '../../../contexts/ProtocolContext';
import { SectionHeader, SectionCompletionAlert } from '../index';
import { useValidation } from '../../../hooks/useValidation';
import { colors } from '../../../styles/theme';

const GradientButton = styled(Button)(() => ({
  background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 600,
  '&:hover': {
    background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.secondary.dark} 100%)`,
  },
}));

interface Assessment {
  id: string;
  name: string;
  category: string;
  timing: string[];
  procedures: string;
}

export const AssessmentsEditor: React.FC = () => {
  const { protocol, refreshProtocol } = useProtocol();
  const { validateProtocol, getLatestValidation } = useValidation();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState<Assessment>({
    id: '',
    name: '',
    category: '',
    timing: [],
    procedures: ''
  });
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [sectionValidation, setSectionValidation] = useState<any>(null);
  const [showCompletionAlert, setShowCompletionAlert] = useState(false);
  const [lastCompletionScore, setLastCompletionScore] = useState(0);

  const timepoints = ['Screening', 'Baseline', 'Week 4', 'Week 8', 'Week 12', 'Week 24', 'Follow-up'];

  useEffect(() => {
    if (protocol?.sections) {
      const section = protocol.sections.find((s: any) => s.sectionNumber === '8');
      if (section?.content?.assessments) {
        setAssessments(section.content.assessments);
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
    if (report?.sectionStatus?.['8']) {
      setSectionValidation(report.sectionStatus['8']);
    }
  };

  const handleValidateSection = async () => {
    if (!protocol?.id) return;
    
    setValidating(true);
    try {
      const report = await validateProtocol(protocol.id);
      if (report?.sectionStatus?.['8']) {
        const newValidation = report.sectionStatus['8'];
        setSectionValidation(newValidation);
        
        if (newValidation.completionScore && newValidation.completionScore > lastCompletionScore + 10) {
          setShowCompletionAlert(true);
          setLastCompletionScore(newValidation.completionScore);
        }
      }
    } finally {
      setValidating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`http://localhost:3001/api/protocols/sections/8`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocolId: protocol?.id,
          content: { assessments }
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
    } finally {
      setSaving(false);
    }
  };

  const handleAddAssessment = () => {
    const newAssessment: Assessment = {
      ...currentAssessment,
      id: Date.now().toString()
    };
    setAssessments([...assessments, newAssessment]);
    setDialogOpen(false);
    setCurrentAssessment({
      id: '',
      name: '',
      category: '',
      timing: [],
      procedures: ''
    });
  };

  const handleDeleteAssessment = (id: string) => {
    if (confirm('Delete this assessment?')) {
      setAssessments(assessments.filter(a => a.id !== id));
    }
  };

  return (
    <Box>
      <SectionHeader
        sectionNumber="8"
        sectionTitle="Trial Assessments"
        description="Schedule of Activities and assessment procedures"
        icon={<AssignmentIcon />}
        validationStatus={sectionValidation}
        onValidate={handleValidateSection}
        validating={validating}
      />

      {showCompletionAlert && sectionValidation && (
        <SectionCompletionAlert
          sectionTitle="Trial Assessments"
          sectionNumber="8"
          completionScore={sectionValidation.completionScore || 0}
          onDismiss={() => setShowCompletionAlert(false)}
        />
      )}

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight={700}>
              Schedule of Activities
            </Typography>
            <GradientButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
            >
              Add Assessment
            </GradientButton>
          </Box>

          {assessments.length === 0 ? (
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
              No assessments defined. Click "Add Assessment" to create your Schedule of Activities.
            </Alert>
          ) : (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: `${colors.primary.light}15` }}>
                      <TableCell sx={{ fontWeight: 700 }}>Assessment</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                      {timepoints.map(tp => (
                        <TableCell key={tp} align="center" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                          {tp}
                        </TableCell>
                      ))}
                      <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assessments.map((assessment) => (
                      <TableRow key={assessment.id} hover>
                        <TableCell>{assessment.name}</TableCell>
                        <TableCell>
                          <Chip label={assessment.category} size="small" />
                        </TableCell>
                        {timepoints.map(tp => (
                          <TableCell key={tp} align="center">
                            {assessment.timing.includes(tp) && (
                              <Box
                                sx={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  backgroundColor: colors.primary.main,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontSize: '0.75rem',
                                  fontWeight: 700
                                }}
                              >
                                ✓
                              </Box>
                            )}
                          </TableCell>
                        ))}
                        <TableCell>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteAssessment(assessment.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box display="flex" justifyContent="flex-end" mt={3}>
                <GradientButton
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Schedule'}
                </GradientButton>
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Assessment Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Assessment</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} pt={1}>
            <TextField
              fullWidth
              label="Assessment Name *"
              value={currentAssessment.name}
              onChange={(e) => setCurrentAssessment({ ...currentAssessment, name: e.target.value })}
              placeholder="e.g., Vital Signs, ECG, Laboratory Tests"
            />
            <TextField
              fullWidth
              label="Category"
              value={currentAssessment.category}
              onChange={(e) => setCurrentAssessment({ ...currentAssessment, category: e.target.value })}
              placeholder="e.g., Safety, Efficacy, PK, PD"
            />
            <Box>
              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                Select Timepoints:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {timepoints.map(tp => (
                  <Chip
                    key={tp}
                    label={tp}
                    onClick={() => {
                      const timing = currentAssessment.timing.includes(tp)
                        ? currentAssessment.timing.filter(t => t !== tp)
                        : [...currentAssessment.timing, tp];
                      setCurrentAssessment({ ...currentAssessment, timing });
                    }}
                    color={currentAssessment.timing.includes(tp) ? 'primary' : 'default'}
                    variant={currentAssessment.timing.includes(tp) ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Procedures / Details"
              value={currentAssessment.procedures}
              onChange={(e) => setCurrentAssessment({ ...currentAssessment, procedures: e.target.value })}
              placeholder="Describe the assessment procedures..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <GradientButton
            variant="contained"
            onClick={handleAddAssessment}
            disabled={!currentAssessment.name}
          >
            Add Assessment
          </GradientButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};