import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Select, MenuItem,
  FormControl, InputLabel, IconButton, Accordion, AccordionSummary,
  AccordionDetails, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Drawer, Fab, Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  Science as ScienceIcon,
  Psychology as AIIcon,
  AutoFixHigh as AutoFixIcon
} from '@mui/icons-material';
import { useProtocol } from '../../../contexts/ProtocolContext';
import { useValidation } from '../../../hooks/useValidation';
import { useNotification } from '../../../hooks/useNotification';
import { SectionHeader, SectionCompletionAlert } from '../index';
import { colors } from '../../../styles/theme';
import { 
  AIAssistantPanel, 
  AIContentGenerator,
  AIFieldAssist,
  AIEnhancedInput
} from '../../ai';
import { AICoPilotProvider } from '../../../contexts/AICoPilotContext';
import { AICoPilotSidebar } from '../../ai/AICoPilotSidebar';

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
    endpoint?: string;
    intercurrentEvents?: string;
    summaryMeasure?: string;
  };
  picot?: {
    population?: string;
    intervention?: string;
    control?: string;
    outcome?: string;
    timePeriod?: string;
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
  
  // AI Integration State
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiGeneratorOpen, setAiGeneratorOpen] = useState(false);
  const [isGeneratingObjective, setIsGeneratingObjective] = useState(false);

  // Auto-generate objective text when PICOT or estimand fields are filled
  useEffect(() => {
    const { population, intervention, control, outcome, timePeriod } = currentObjective.picot || {};
    const { treatment, endpoint } = currentObjective.estimand || {};
    
    // Only auto-generate if we have core fields and no existing objective text
    const hasPICOT = population && intervention && outcome;
    const hasEstimand = treatment && population && endpoint; // Use PICOT population for estimand too
    
    if ((hasPICOT || hasEstimand) && !currentObjective.objectiveText.trim()) {
      generateObjectiveFromFields();
    }
  }, [
    currentObjective.picot?.population,
    currentObjective.picot?.intervention,
    currentObjective.picot?.control,
    currentObjective.picot?.outcome,
    currentObjective.picot?.timePeriod,
    currentObjective.estimand?.treatment,
    currentObjective.estimand?.endpoint
  ]);

  // Generate objective text from available fields using AI
  const generateObjectiveFromFields = async () => {
    const { population, intervention, control, outcome, timePeriod } = currentObjective.picot || {};
    const { treatment, endpoint } = currentObjective.estimand || {};
    
    // Determine which framework has more complete data
    const hasPICOT = population && intervention && outcome;
    const hasEstimand = treatment && population && endpoint; // Use PICOT population for estimand
    
    if (!hasPICOT && !hasEstimand) return;
    
    setIsGeneratingObjective(true);
    try {
      const response = await fetch('http://localhost:3001/api/research/generate-objective', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Send both frameworks - backend will use whichever is more complete
          picot: {
            population,
            intervention,
            control,
            outcome,
            timePeriod
          },
          estimand: {
            treatment,
            population, // Use PICOT population for estimand
            endpoint
          },
          objectiveType: currentObjective.objectiveType,
          protocolContext: protocol
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentObjective(prev => ({
          ...prev,
          objectiveText: data.objectiveText
        }));
        notification.success('Objective text generated from your inputs!');
      }
    } catch (error) {
      console.error('Error generating objective:', error);
    } finally {
      setIsGeneratingObjective(false);
    }
  };

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
        estimand: obj.estimand,
        picot: obj.picot
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
        const score = (newValidation as any).completionScore;
        if (score && score > lastCompletionScore + 10) {
          setShowCompletionAlert(true);
          setLastCompletionScore(score);
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

  // AI Integration Functions
  const handleAIContentGenerated = (content: string) => {
    // Parse AI generated content and create new objective
    const newObjective: LocalObjective = {
      objectiveType: 'primary',
      objectiveText: content
    };
    setCurrentObjective(newObjective);
    setDialogOpen(true);
    notification.success('AI content generated! Review and save.');
  };

  return (
    <AICoPilotProvider>
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
            completionScore={(sectionValidation as any).completionScore || 0}
            onDismiss={() => setShowCompletionAlert(false)}
          />
        )}

        {/* Main Content with AI Co-Pilot Sidebar */}
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Left Column - Main Content */}
          <Box sx={{ flex: 1 }}>
            {/* Action Buttons */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <GradientButton
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddObjective}
                size="large"
              >
                Add Objective
              </GradientButton>
              <Button
                variant="outlined"
                startIcon={<AutoFixIcon />}
                onClick={() => setAiGeneratorOpen(true)}
                sx={{
                  borderColor: colors.primary.main,
                  color: colors.primary.main,
                  '&:hover': {
                    borderColor: colors.primary.dark,
                    background: colors.primary.light + '10',
                  },
                }}
              >
                AI Generate
              </Button>
            </Box>

            {/* Objectives List */}
            {objectives.length === 0 ? (
              <Alert 
                severity="info" 
                icon={<ScienceIcon />}
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
                No objectives defined yet. Click "Add Objective" to create your first trial objective, or use "AI Generate" for intelligent suggestions.
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
                      
                      {objective.objectiveType === 'primary' && (objective.picot || objective.estimand) && (
                        <Box>
                          {objective.picot && (
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                                PICOT Framework:
                              </Typography>
                              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                {objective.picot.population && (
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">Population</Typography>
                                    <Typography variant="body2">{objective.picot.population}</Typography>
                                  </Box>
                                )}
                                {objective.picot.intervention && (
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">Intervention</Typography>
                                    <Typography variant="body2">{objective.picot.intervention}</Typography>
                                  </Box>
                                )}
                                {objective.picot.control && (
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">Control</Typography>
                                    <Typography variant="body2">{objective.picot.control}</Typography>
                                  </Box>
                                )}
                                {objective.picot.outcome && (
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">Outcome</Typography>
                                    <Typography variant="body2">{objective.picot.outcome}</Typography>
                                  </Box>
                                )}
                                {objective.picot.timePeriod && (
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">Time Period</Typography>
                                    <Typography variant="body2">{objective.picot.timePeriod}</Typography>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          )}
                          
                          {objective.estimand && (
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
                                {objective.estimand.summaryMeasure && (
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">Summary Measure</Typography>
                                    <Typography variant="body2">{objective.estimand.summaryMeasure}</Typography>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          )}
                        </Box>
                      )}
                    </AccordionDetails>
                  </StyledAccordion>
                ))}
              </Box>
            )}
          </Box>

          {/* Right Column - AI Co-Pilot Sidebar */}
          <Box sx={{ width: 350, flexShrink: 0 }}>
            <AICoPilotSidebar />
          </Box>
        </Box>

        {/* AI Assistant Floating Action Button */}
        <Tooltip title="Open AI Assistant">
          <Fab
            color="primary"
            onClick={() => setAiDrawerOpen(true)}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.secondary.dark} 100%)`,
              },
            }}
          >
            <AIIcon />
          </Fab>
        </Tooltip>

        {/* AI Assistant Drawer */}
        <Drawer
          anchor="right"
          open={aiDrawerOpen}
          onClose={() => setAiDrawerOpen(false)}
          slotProps={{
            paper: {
              sx: {
                width: 450,
                maxWidth: '90vw',
              },
            },
          }}
        >
          <AIAssistantPanel
            open={aiDrawerOpen}
            onClose={() => setAiDrawerOpen(false)}
          />
        </Drawer>

        {/* AI Content Generator Dialog */}
        <AIContentGenerator
          open={aiGeneratorOpen}
          onClose={() => setAiGeneratorOpen(false)}
          sectionName="Trial Objectives and Estimands"
          onContentGenerated={handleAIContentGenerated}
          protocolContext={protocol}
        />

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

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <Box sx={{ position: 'relative', width: '100%' }}>
                <AIEnhancedInput
                  fieldName="objectiveText"
                  fieldType="text"
                  sectionNumber="3"
                  protocolContext={protocol}
                  value={currentObjective.objectiveText}
                  onChange={(value: string) => setCurrentObjective({
                    ...currentObjective,
                    objectiveText: value
                  })}
                  label="Objective Text"
                  multiline
                  rows={4}
                  placeholder="Describe the trial objective... (This will be auto-generated based on PICOT or ICH E9(R1) Estimand fields below)"
                  disabled={isGeneratingObjective}
                  sx={{ 
                    width: '100%',
                    '& .MuiInputBase-root': {
                      minHeight: '120px'
                    }
                  }}
                />
                {isGeneratingObjective && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: 1,
                      zIndex: 1
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AutoFixIcon 
                        sx={{ 
                          color: colors.primary.main,
                          '@keyframes pulse': {
                            '0%': { opacity: 1 },
                            '50%': { opacity: 0.5 },
                            '100%': { opacity: 1 }
                          },
                          animation: 'pulse 1.5s infinite'
                        }} 
                      />
                      <Typography variant="body2" color="primary">
                        Generating objective from your inputs...
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
              <AIFieldAssist
                fieldName="objectiveText"
                fieldValue={currentObjective.objectiveText}
                sectionNumber="3"
                protocolContext={protocol}
                onSuggestionSelect={(value: string) => setCurrentObjective({
                  ...currentObjective,
                  objectiveText: value
                })}
              />
            </Box>

            {currentObjective.objectiveType === 'primary' && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2, color: colors.primary.main }}>
                  PICOT Framework (Population, Intervention, Control, Outcome, Time)
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <AIEnhancedInput
                      fieldName="picot.population"
                      fieldType="text"
                      sectionNumber="3"
                      protocolContext={protocol}
                      value={currentObjective.picot?.population || ''}
                      onChange={(value: string) => setCurrentObjective({
                        ...currentObjective,
                        picot: {
                          ...currentObjective.picot,
                          population: value
                        }
                      })}
                      label="Population"
                      placeholder="Define the target population (e.g., adults with type 2 diabetes)..."
                    />
                    <AIFieldAssist
                      fieldName="picot.population"
                      fieldValue={currentObjective.picot?.population || ''}
                      sectionNumber="3"
                      protocolContext={protocol}
                      onSuggestionSelect={(value: string) => setCurrentObjective({
                        ...currentObjective,
                        picot: {
                          ...currentObjective.picot,
                          population: value
                        }
                      })}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <AIEnhancedInput
                      fieldName="picot.intervention"
                      fieldType="text"
                      sectionNumber="3"
                      protocolContext={protocol}
                      value={currentObjective.picot?.intervention || ''}
                      onChange={(value: string) => setCurrentObjective({
                        ...currentObjective,
                        picot: {
                          ...currentObjective.picot,
                          intervention: value
                        }
                      })}
                      label="Intervention"
                      placeholder="Describe the intervention being tested (e.g., new drug, therapy, procedure)..."
                    />
                    <AIFieldAssist
                      fieldName="picot.intervention"
                      fieldValue={currentObjective.picot?.intervention || ''}
                      sectionNumber="3"
                      protocolContext={protocol}
                      onSuggestionSelect={(value: string) => setCurrentObjective({
                        ...currentObjective,
                        picot: {
                          ...currentObjective.picot,
                          intervention: value
                        }
                      })}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <AIEnhancedInput
                      fieldName="picot.control"
                      fieldType="text"
                      sectionNumber="3"
                      protocolContext={protocol}
                      value={currentObjective.picot?.control || ''}
                      onChange={(value: string) => setCurrentObjective({
                        ...currentObjective,
                        picot: {
                          ...currentObjective.picot,
                          control: value
                        }
                      })}
                      label="Control"
                      placeholder="Define the control/comparator (e.g., placebo, standard care, active control)..."
                    />
                    <AIFieldAssist
                      fieldName="picot.control"
                      fieldValue={currentObjective.picot?.control || ''}
                      sectionNumber="3"
                      protocolContext={protocol}
                      onSuggestionSelect={(value: string) => setCurrentObjective({
                        ...currentObjective,
                        picot: {
                          ...currentObjective.picot,
                          control: value
                        }
                      })}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <AIEnhancedInput
                      fieldName="picot.outcome"
                      fieldType="text"
                      sectionNumber="3"
                      protocolContext={protocol}
                      value={currentObjective.picot?.outcome || ''}
                      onChange={(value: string) => setCurrentObjective({
                        ...currentObjective,
                        picot: {
                          ...currentObjective.picot,
                          outcome: value
                        }
                      })}
                      label="Outcome"
                      placeholder="Specify the primary outcome measure (e.g., HbA1c reduction, survival rate)..."
                    />
                    <AIFieldAssist
                      fieldName="picot.outcome"
                      fieldValue={currentObjective.picot?.outcome || ''}
                      sectionNumber="3"
                      protocolContext={protocol}
                      onSuggestionSelect={(value: string) => setCurrentObjective({
                        ...currentObjective,
                        picot: {
                          ...currentObjective.picot,
                          outcome: value
                        }
                      })}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <AIEnhancedInput
                      fieldName="picot.timePeriod"
                      fieldType="text"
                      sectionNumber="3"
                      protocolContext={protocol}
                      value={currentObjective.picot?.timePeriod || ''}
                      onChange={(value: string) => setCurrentObjective({
                        ...currentObjective,
                        picot: {
                          ...currentObjective.picot,
                          timePeriod: value
                        }
                      })}
                      label="Time Period"
                      placeholder="Define the time frame for assessment (e.g., 12 weeks, 6 months, 2 years)..."
                    />
                    <AIFieldAssist
                      fieldName="picot.timePeriod"
                      fieldValue={currentObjective.picot?.timePeriod || ''}
                      sectionNumber="3"
                      protocolContext={protocol}
                      onSuggestionSelect={(value: string) => setCurrentObjective({
                        ...currentObjective,
                        picot: {
                          ...currentObjective.picot,
                          timePeriod: value
                        }
                      })}
                    />
                  </Box>
                </Box>

                <Typography variant="h6" sx={{ mb: 2, mt: 4, color: colors.secondary.main }}>
                  ICH E9(R1) Estimand Framework
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <AIEnhancedInput
                      fieldName="estimand.treatment"
                      fieldType="text"
                      sectionNumber="3"
                      protocolContext={protocol}
                      value={currentObjective.estimand?.treatment || ''}
                      onChange={(value: string) => setCurrentObjective({
                        ...currentObjective,
                        estimand: {
                          ...currentObjective.estimand,
                          treatment: value
                        }
                      })}
                      label="Treatment"
                      placeholder="Describe the treatment condition..."
                    />
                    <AIFieldAssist
                      fieldName="estimand.treatment"
                      fieldValue={currentObjective.estimand?.treatment || ''}
                      sectionNumber="3"
                      protocolContext={protocol}
                      onSuggestionSelect={(value: string) => setCurrentObjective({
                        ...currentObjective,
                        estimand: {
                          ...currentObjective.estimand,
                          treatment: value
                        }
                      })}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <AIEnhancedInput
                      fieldName="estimand.endpoint"
                      fieldType="text"
                      sectionNumber="3"
                      protocolContext={protocol}
                      value={currentObjective.estimand?.endpoint || ''}
                      onChange={(value: string) => setCurrentObjective({
                        ...currentObjective,
                        estimand: {
                          ...currentObjective.estimand,
                          endpoint: value
                        }
                      })}
                      label="Endpoint"
                      placeholder="Specify the primary endpoint..."
                    />
                    <AIFieldAssist
                      fieldName="estimand.endpoint"
                      fieldValue={currentObjective.estimand?.endpoint || ''}
                      sectionNumber="3"
                      protocolContext={protocol}
                      onSuggestionSelect={(value: string) => setCurrentObjective({
                        ...currentObjective,
                        estimand: {
                          ...currentObjective.estimand,
                          endpoint: value
                        }
                      })}
                    />
                  </Box>
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
    </AICoPilotProvider>
  );
};