import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Select, MenuItem,
  FormControl, InputLabel, IconButton, Accordion, AccordionSummary,
  AccordionDetails, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  Science as ScienceIcon
} from '@mui/icons-material';
import { useProtocol } from '../../../contexts/ProtocolContext';
import { useValidation } from '../../../hooks/useValidation';
import { useNotification } from '../../../hooks/useNotification';
import { SectionHeader, SectionCompletionAlert } from '../index';
import { colors } from '../../../styles/theme';

const StyledCard = styled(Box)(() => ({
  background: `linear-gradient(135deg, ${colors.primary.light}15 0%, ${colors.secondary.light}15 100%)`,
  border: `1px solid ${colors.primary.light}30`,
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  padding: 24,
}));

const GradientButton = styled(Button)(() => ({
  background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
  borderRadius: 12,
  textTransform: 'none',
  fontWeight: 600,
  '&:hover': {
    background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.secondary.dark} 100%)`,
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
  },
}));

const StyledAccordion = styled(Accordion)(() => ({
  borderRadius: 12,
  '&:before': { display: 'none' },
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  border: '2px solid transparent',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  },
}));

interface LocalObjective {
  id?: string;
  objectiveType: string;
  objectiveText: string;
  estimand?: {
    treatment?: string;
    population?: string;
    endpoint?: string;
    intercurrentEvents?: string;
    summaryMeasure?: string;
  };
}

export const ObjectivesEditor: React.FC = () => {
  const { protocol, refreshProtocol } = useProtocol();
  const { validateProtocol, getLatestValidation } = useValidation();
  const notification = useNotification();
  const [objectives, setObjectives] = useState<LocalObjective[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [currentObjective, setCurrentObjective] = useState<LocalObjective>({
    objectiveType: 'primary',
    objectiveText: ''
  });
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [sectionValidation, setSectionValidation] = useState<any>(null);
  const [showCompletionAlert, setShowCompletionAlert] = useState(false);
  const [lastCompletionScore, setLastCompletionScore] = useState(0);

  // Load validation status on mount and when protocol changes
  useEffect(() => {
    if (protocol?.id) {
      loadSectionValidation();
    }
  }, [protocol?.id]);

  // Update objectives when protocol changes
  useEffect(() => {
    if (protocol?.objectives) {
      setObjectives(protocol.objectives.map(obj => ({
        id: obj.id,
        objectiveType: obj.objectiveType,
        objectiveText: obj.objectiveText,
        estimand: obj.estimand
      })));
    }
  }, [protocol?.objectives]);

  const loadSectionValidation = async () => {
    if (!protocol?.id) return;
    
    const report = await getLatestValidation(protocol.id);
    if (report?.sectionStatus?.['3']) {
      setSectionValidation(report.sectionStatus['3']);
    }
  };

  const handleValidateSection = async () => {
    if (!protocol?.id) return;
    
    setValidating(true);
    try {
      const report = await validateProtocol(protocol.id);
      if (report?.sectionStatus?.['3']) {
        const newValidation = report.sectionStatus['3'];
        setSectionValidation(newValidation);
        
        // Show completion alert if score improved significantly
        if (newValidation.completionScore && newValidation.completionScore > lastCompletionScore + 10) {
          setShowCompletionAlert(true);
          setLastCompletionScore(newValidation.completionScore);
        }
      }
    } finally {
      setValidating(false);
    }
  };

  const handleAddObjective = () => {
    setCurrentObjective({
      objectiveType: 'primary',
      objectiveText: ''
    });
    setEditingIndex(null);
    setDialogOpen(true);
  };

  const handleEditObjective = (index: number) => {
    setCurrentObjective(objectives[index]);
    setEditingIndex(index);
    setDialogOpen(true);
  };

  const handleSaveObjective = async () => {
    setSaving(true);
    try {
      const url = currentObjective.id
        ? `http://localhost:3001/api/protocols/objectives/${currentObjective.id}`
        : 'http://localhost:3001/api/protocols/objectives';
      const method = currentObjective.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentObjective,
          protocolId: protocol?.id
        })
      });

      if (!response.ok) throw new Error('Failed to save objective');
      
      await refreshProtocol();
      setDialogOpen(false);
      notification.success(currentObjective.id ? 'Objective updated successfully!' : 'Objective added successfully!');
      
      // AUTO-VALIDATE after save
      setTimeout(() => {
        handleValidateSection();
      }, 500);
      
    } catch (error) {
      console.error('Error saving objective:', error);
      notification.error('Failed to save objective. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteObjective = async (id: string) => {
    if (!confirm('Delete this objective?')) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/protocols/objectives/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete');
      
      await refreshProtocol();
      notification.success('Objective deleted successfully!');
      
      // AUTO-VALIDATE after delete
      setTimeout(() => {
        handleValidateSection();
      }, 500);
      
    } catch (error) {
      console.error('Error deleting objective:', error);
      notification.error('Failed to delete objective. Please try again.');
    }
  };

  const getObjectiveTypeColor = (type: string) => {
    switch (type) {
      case 'primary': return colors.primary.main;
      case 'secondary': return colors.secondary.main;
      case 'exploratory': return '#9c27b0';
      default: return colors.text.secondary;
    }
  };

  return (
    <Box>
      {/* Section Header with Validation */}
      <SectionHeader
        sectionNumber="3"
        sectionTitle="Trial Objectives and Estimands"
        description="Define primary, secondary, and exploratory objectives with ICH E9(R1) estimand framework"
        icon={<ScienceIcon />}
        validationStatus={sectionValidation}
        onValidate={handleValidateSection}
        validating={validating}
      />

      {/* Completion Alert */}
      {showCompletionAlert && sectionValidation && (
        <SectionCompletionAlert
          sectionTitle="Trial Objectives and Estimands"
          sectionNumber="3"
          completionScore={sectionValidation.completionScore || 0}
          onDismiss={() => setShowCompletionAlert(false)}
        />
      )}

      {/* Add Objective Button */}
      <Box sx={{ mb: 3 }}>
        <GradientButton
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddObjective}
          size="large"
        >
          Add Objective
        </GradientButton>
      </Box>

      {/* Objectives List */}
      {objectives.length === 0 ? (
        <Alert severity="info" icon={<ScienceIcon />}>
          No objectives defined yet. Click "Add Objective" to create your first trial objective.
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {objectives.map((objective, index) => (
            <StyledAccordion
              key={objective.id || index}
              sx={{
                border: `2px solid ${getObjectiveTypeColor(objective.objectiveType)}30`,
                '&:hover': {
                  borderColor: `${getObjectiveTypeColor(objective.objectiveType)}60`,
                }
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Chip
                    label={objective.objectiveType.toUpperCase()}
                    size="small"
                    sx={{
                      backgroundColor: getObjectiveTypeColor(objective.objectiveType),
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                    }}
                  />
                  <Typography variant="body1" fontWeight={600} sx={{ flex: 1 }}>
                    {objective.objectiveText || 'Untitled Objective'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditObjective(index);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (objective.id) handleDeleteObjective(objective.id);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {objective.objectiveText}
                </Typography>
                
                {objective.objectiveType === 'primary' && objective.estimand && (
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                      ICH E9(R1) Estimand Framework:
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      {objective.estimand.treatment && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">Treatment</Typography>
                          <Typography variant="body2">{objective.estimand.treatment}</Typography>
                        </Box>
                      )}
                      {objective.estimand.population && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">Population</Typography>
                          <Typography variant="body2">{objective.estimand.population}</Typography>
                        </Box>
                      )}
                      {objective.estimand.endpoint && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">Endpoint</Typography>
                          <Typography variant="body2">{objective.estimand.endpoint}</Typography>
                        </Box>
                      )}
                      {objective.estimand.intercurrentEvents && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">Intercurrent Events</Typography>
                          <Typography variant="body2">{objective.estimand.intercurrentEvents}</Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}
              </AccordionDetails>
            </StyledAccordion>
          ))}
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingIndex !== null ? 'Edit Objective' : 'Add New Objective'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Objective Type</InputLabel>
              <Select
                value={currentObjective.objectiveType}
                label="Objective Type"
                onChange={(e) => setCurrentObjective({
                  ...currentObjective,
                  objectiveType: e.target.value as string
                })}
              >
                <MenuItem value="primary">Primary</MenuItem>
                <MenuItem value="secondary">Secondary</MenuItem>
                <MenuItem value="exploratory">Exploratory</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Objective Text"
              value={currentObjective.objectiveText}
              onChange={(e) => setCurrentObjective({
                ...currentObjective,
                objectiveText: e.target.value
              })}
              placeholder="Describe the trial objective..."
            />

            {currentObjective.objectiveType === 'primary' && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2, color: colors.primary.main }}>
                  ICH E9(R1) Estimand Framework
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Treatment"
                    value={currentObjective.estimand?.treatment || ''}
                    onChange={(e) => setCurrentObjective({
                      ...currentObjective,
                      estimand: {
                        ...currentObjective.estimand,
                        treatment: e.target.value
                      }
                    })}
                    placeholder="Describe the treatment condition..."
                  />
                  <TextField
                    fullWidth
                    label="Population"
                    value={currentObjective.estimand?.population || ''}
                    onChange={(e) => setCurrentObjective({
                      ...currentObjective,
                      estimand: {
                        ...currentObjective.estimand,
                        population: e.target.value
                      }
                    })}
                    placeholder="Define the target population..."
                  />
                  <TextField
                    fullWidth
                    label="Endpoint"
                    value={currentObjective.estimand?.endpoint || ''}
                    onChange={(e) => setCurrentObjective({
                      ...currentObjective,
                      estimand: {
                        ...currentObjective.estimand,
                        endpoint: e.target.value
                      }
                    })}
                    placeholder="Specify the primary endpoint..."
                  />
                  <FormControl fullWidth>
                    <InputLabel>Intercurrent Events Strategy</InputLabel>
                    <Select
                      value={currentObjective.estimand?.intercurrentEvents || ''}
                      label="Intercurrent Events Strategy"
                      onChange={(e) => setCurrentObjective({
                        ...currentObjective,
                        estimand: {
                          ...currentObjective.estimand,
                          intercurrentEvents: e.target.value
                        }
                      })}
                    >
                      <MenuItem value="treatment-policy">Treatment Policy</MenuItem>
                      <MenuItem value="composite">Composite</MenuItem>
                      <MenuItem value="hypothetical">Hypothetical</MenuItem>
                      <MenuItem value="while-on-treatment">While on Treatment</MenuItem>
                      <MenuItem value="principal-stratum">Principal Stratum</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="Summary Measure"
                    value={currentObjective.estimand?.summaryMeasure || ''}
                    onChange={(e) => setCurrentObjective({
                      ...currentObjective,
                      estimand: {
                        ...currentObjective.estimand,
                        summaryMeasure: e.target.value
                      }
                    })}
                    placeholder="Define how the endpoint will be summarized..."
                  />
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <GradientButton
            onClick={handleSaveObjective}
            disabled={saving || !currentObjective.objectiveText.trim()}
            variant="contained"
          >
            {saving ? 'Saving...' : 'Save Objective'}
          </GradientButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};