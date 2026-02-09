import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  AutoFixHigh as AutoFixIcon,
  Psychology as AIIcon,
  Settings as SettingsIcon,
  Preview as PreviewIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { colors } from '../../styles/theme';
import { aiService } from '../../services/aiService';
import type { AIContentGenerationResponse } from '../../services/aiService';
import { useNotification } from '../../hooks/useNotification';

interface AIContentGeneratorProps {
  open: boolean;
  onClose: () => void;
  sectionName: string;
  onContentGenerated: (content: string) => void;
  protocolContext?: any;
}

const steps = ['Configure', 'Generate', 'Review'];

const templateTypes = [
  { value: 'phase1', label: 'Phase I Trial' },
  { value: 'phase2', label: 'Phase II Trial' },
  { value: 'phase3', label: 'Phase III Trial' },
  { value: 'oncology', label: 'Oncology Study' },
  { value: 'cardiology', label: 'Cardiology Study' },
  { value: 'neurology', label: 'Neurology Study' },
  { value: 'pediatric', label: 'Pediatric Study' },
  { value: 'rare-disease', label: 'Rare Disease Study' },
  { value: 'device', label: 'Medical Device Study' },
  { value: 'biomarker', label: 'Biomarker Study' },
];

export const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({
  open,
  onClose,
  sectionName,
  onContentGenerated,
  protocolContext,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<AIContentGenerationResponse | null>(null);
  
  // Configuration state
  const [templateType, setTemplateType] = useState('');
  const [studyPhase, setStudyPhase] = useState('');
  const [indication, setIndication] = useState('');
  const [population, setPopulation] = useState('');
  const [intervention, setIntervention] = useState('');
  const [additionalRequirements, setAdditionalRequirements] = useState('');

  const notification = useNotification();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setGeneratedContent(null);
    setError(null);
    setTemplateType('');
    setStudyPhase('');
    setIndication('');
    setPopulation('');
    setIntervention('');
    setAdditionalRequirements('');
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const parameters = {
        templateType,
        studyPhase,
        indication,
        population,
        intervention,
        additionalRequirements,
        protocolContext,
      };

      const result = await aiService.generateSectionContent(
        sectionName,
        parameters,
        templateType
      );

      setGeneratedContent(result);
      handleNext();
      notification.success('Content generated successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate content';
      setError(errorMessage);
      notification.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyContent = () => {
    if (generatedContent) {
      onContentGenerated(generatedContent.content);
      notification.success('Content applied to section!');
      onClose();
      handleReset();
    }
  };

  const renderConfigurationStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SettingsIcon />
        Configure Content Generation
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Provide details about your study to generate tailored content for the {sectionName} section.
      </Typography>

      <Box display="flex" flexDirection="column" gap={3}>
        <FormControl fullWidth>
          <InputLabel>Template Type</InputLabel>
          <Select
            value={templateType}
            onChange={(e) => setTemplateType(e.target.value)}
            label="Template Type"
          >
            {templateTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Study Phase"
          placeholder="e.g., Phase II, Phase III, Pilot Study"
          value={studyPhase}
          onChange={(e) => setStudyPhase(e.target.value)}
        />

        <TextField
          fullWidth
          label="Indication/Disease"
          placeholder="e.g., Non-small cell lung cancer, Type 2 diabetes"
          value={indication}
          onChange={(e) => setIndication(e.target.value)}
        />

        <TextField
          fullWidth
          label="Target Population"
          placeholder="e.g., Adults 18-75 years, Treatment-naive patients"
          value={population}
          onChange={(e) => setPopulation(e.target.value)}
        />

        <TextField
          fullWidth
          label="Intervention/Treatment"
          placeholder="e.g., Experimental drug XYZ, Combination therapy"
          value={intervention}
          onChange={(e) => setIntervention(e.target.value)}
        />

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Additional Requirements"
          placeholder="Any specific requirements, regulatory considerations, or special populations..."
          value={additionalRequirements}
          onChange={(e) => setAdditionalRequirements(e.target.value)}
        />
      </Box>
    </Box>
  );

  const renderGenerateStep = () => (
    <Box textAlign="center">
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <AIIcon />
        Generating Content
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        AI is creating tailored content for your {sectionName} section...
      </Typography>

      {loading && (
        <Box my={4}>
          <CircularProgress size={60} />
          <Typography variant="body2" color="text.secondary" mt={2}>
            This may take a few moments...
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <Box my={4}>
          <Typography variant="body1" color="text.secondary">
            Ready to generate content with your specifications.
          </Typography>
        </Box>
      )}
    </Box>
  );

  const renderReviewStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PreviewIcon />
        Review Generated Content
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Review the AI-generated content and apply it to your section.
      </Typography>

      {generatedContent && (
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Generated Content:
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                  maxHeight: 300,
                  overflowY: 'auto',
                  background: colors.primary.light + '05',
                  p: 2,
                  borderRadius: 1,
                  border: `1px solid ${colors.primary.light}20`,
                }}
              >
                {generatedContent.content}
              </Typography>
            </CardContent>
          </Card>

          {generatedContent.recommendations && generatedContent.recommendations.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  AI Recommendations:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {generatedContent.recommendations.map((rec, index) => (
                    <Chip
                      key={index}
                      label={rec}
                      size="small"
                      sx={{
                        background: colors.semantic.info + '20',
                        color: colors.semantic.info,
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      )}
    </Box>
  );

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderConfigurationStep();
      case 1:
        return renderGenerateStep();
      case 2:
        return renderReviewStep();
      default:
        return 'Unknown step';
    }
  };

  const isStepComplete = (step: number) => {
    switch (step) {
      case 0:
        return templateType && indication;
      case 1:
        return generatedContent !== null;
      case 2:
        return true;
      default:
        return false;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: `linear-gradient(135deg, ${colors.primary.light}05 0%, ${colors.secondary.light}05 100%)`,
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <AutoFixIcon sx={{ color: colors.primary.main }} />
          <Typography variant="h6" fontWeight={700}>
            AI Content Generator - {sectionName}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ width: '100%', mt: 2 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label, index) => (
              <Step key={label} completed={isStepComplete(index)}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ mt: 4, mb: 2 }}>
            {getStepContent(activeStep)}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose}>
          Cancel
        </Button>
        
        {activeStep > 0 && (
          <Button onClick={handleBack}>
            Back
          </Button>
        )}

        {activeStep === 0 && (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!isStepComplete(0)}
            sx={{
              background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
            }}
          >
            Next
          </Button>
        )}

        {activeStep === 1 && (
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <AIIcon />}
            sx={{
              background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
            }}
          >
            {loading ? 'Generating...' : 'Generate Content'}
          </Button>
        )}

        {activeStep === 2 && (
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              onClick={handleReset}
            >
              Generate New
            </Button>
            <Button
              variant="contained"
              onClick={handleApplyContent}
              startIcon={<CheckIcon />}
              sx={{
                background: `linear-gradient(135deg, ${colors.semantic.success} 0%, ${colors.primary.main} 100%)`,
              }}
            >
              Apply Content
            </Button>
          </Box>
        )}
      </DialogActions>
    </Dialog>
  );
};