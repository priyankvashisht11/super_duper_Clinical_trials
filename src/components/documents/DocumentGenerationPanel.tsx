import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  Alert,
  Chip,
  IconButton,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Clear as ClearIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { DocumentTemplateSelector } from './DocumentTemplateSelector';
import { StreamingDocumentGenerator } from './StreamingDocumentGenerator';
import { DocumentGenerationRequest, DocumentGenerationResponse, ClinicalTrial } from '../../types';

interface DocumentGenerationPanelProps {
  selectedTrials: ClinicalTrial[];
  onTrialRemove?: (trialId: string) => void;
  onClose?: () => void;
}

const steps = [
  'Select Trials',
  'Choose Template',
  'Research Question',
  'Generate Document'
];

export const DocumentGenerationPanel: React.FC<DocumentGenerationPanelProps> = ({
  selectedTrials,
  onTrialRemove,
  onClose
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [templateType, setTemplateType] = useState<string>('');
  const [researchQuestion, setResearchQuestion] = useState('');
  const [citationStyle, setCitationStyle] = useState<'ama' | 'apa' | 'vancouver'>('ama');
  const [generationRequest, setGenerationRequest] = useState<DocumentGenerationRequest | null>(null);
  const [isTrialsExpanded, setIsTrialsExpanded] = useState(true);
  const [generatedDocument, setGeneratedDocument] = useState<DocumentGenerationResponse | null>(null);

  const canProceedToStep = useCallback((step: number) => {
    switch (step) {
      case 0: return selectedTrials.length > 0;
      case 1: return selectedTrials.length > 0 && templateType !== '';
      case 2: return selectedTrials.length > 0 && templateType !== '' && researchQuestion.trim() !== '';
      case 3: return selectedTrials.length > 0 && templateType !== '' && researchQuestion.trim() !== '';
      default: return false;
    }
  }, [selectedTrials.length, templateType, researchQuestion]);

  const handleNext = () => {
    if (canProceedToStep(activeStep + 1)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleGenerate = () => {
    if (!canProceedToStep(3)) return;

    const request: DocumentGenerationRequest = {
      trialIds: selectedTrials.map(trial => trial.id),
      researchQuestion,
      templateType: templateType as any,
      citationStyle
    };

    setGenerationRequest(request);
    setActiveStep(3);
  };

  const handleGenerationComplete = (response: DocumentGenerationResponse) => {
    setGeneratedDocument(response);
  };

  const handleGenerationError = (error: string) => {
    console.error('Generation error:', error);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="body1" gutterBottom>
              Select clinical trials to include in your document. You have {selectedTrials.length} trial{selectedTrials.length !== 1 ? 's' : ''} selected.
            </Typography>
            
            {selectedTrials.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                Please select at least one clinical trial from the search results to generate a document.
              </Alert>
            ) : (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ flex: 1 }}>
                    Selected Trials ({selectedTrials.length})
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setIsTrialsExpanded(!isTrialsExpanded)}
                  >
                    {isTrialsExpanded ? <CollapseIcon /> : <ExpandIcon />}
                  </IconButton>
                </Box>

                <Collapse in={isTrialsExpanded}>
                  <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                    {selectedTrials.map((trial) => (
                      <Paper
                        key={trial.id}
                        variant="outlined"
                        sx={{ p: 2, mb: 1, display: 'flex', alignItems: 'flex-start' }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {trial.ctriNumber}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {trial.title}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip label={`Phase ${trial.phase}`} size="small" />
                            <Chip label={trial.condition} size="small" variant="outlined" />
                            <Chip 
                              label={trial.recruitmentStatus.replace('_', ' ')} 
                              size="small" 
                              color={trial.recruitmentStatus === 'recruiting' ? 'success' : 'default'}
                            />
                          </Box>
                        </Box>
                        {onTrialRemove && (
                          <IconButton
                            size="small"
                            onClick={() => onTrialRemove(trial.id)}
                            sx={{ ml: 1 }}
                          >
                            <ClearIcon />
                          </IconButton>
                        )}
                      </Paper>
                    ))}
                  </Box>
                </Collapse>
              </Box>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <DocumentTemplateSelector
              selectedTemplate={templateType}
              onTemplateSelect={setTemplateType}
              disabled={selectedTrials.length === 0}
            />
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Research Question & Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Provide a specific research question to guide the AI document generation
            </Typography>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Research Question"
              placeholder="e.g., What are the latest treatment approaches for Type 2 Diabetes in Phase III trials conducted in India?"
              value={researchQuestion}
              onChange={(e) => setResearchQuestion(e.target.value)}
              sx={{ mb: 3 }}
              helperText="Be specific about what you want to learn from the selected trials"
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Citation Style</InputLabel>
              <Select
                value={citationStyle}
                label="Citation Style"
                onChange={(e) => setCitationStyle(e.target.value as any)}
              >
                <MenuItem value="ama">AMA (American Medical Association)</MenuItem>
                <MenuItem value="apa">APA (American Psychological Association)</MenuItem>
                <MenuItem value="vancouver">Vancouver</MenuItem>
              </Select>
            </FormControl>

            {researchQuestion.trim() && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Preview:</strong> The AI will analyze {selectedTrials.length} trial{selectedTrials.length !== 1 ? 's' : ''} to answer: "{researchQuestion}"
                </Typography>
              </Alert>
            )}
          </Box>
        );

      case 3:
        return (
          <Box sx={{ height: '600px' }}>
            {generationRequest ? (
              <StreamingDocumentGenerator
                request={generationRequest}
                onComplete={handleGenerationComplete}
                onError={handleGenerationError}
                autoStart={true}
              />
            ) : (
              <Alert severity="error">
                No generation request available. Please go back and complete the previous steps.
              </Alert>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" component="h1">
            AI Document Generator
          </Typography>
          {onClose && (
            <IconButton onClick={onClose}>
              <ClearIcon />
            </IconButton>
          )}
        </Box>
        <Typography variant="body2" color="text.secondary">
          Generate professional research documents from selected clinical trials
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {activeStep < 3 ? (
          <Box sx={{ p: 3 }}>
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel>
                    <Typography variant="h6">{label}</Typography>
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ mb: 2 }}>
                      {getStepContent(index)}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                        variant="outlined"
                      >
                        Back
                      </Button>
                      {index === steps.length - 2 ? (
                        <Button
                          variant="contained"
                          onClick={handleGenerate}
                          disabled={!canProceedToStep(index + 1)}
                        >
                          Generate Document
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          disabled={!canProceedToStep(index + 1)}
                        >
                          Continue
                        </Button>
                      )}
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Box>
        ) : (
          getStepContent(3)
        )}
      </Box>
    </Box>
  );
};

export default DocumentGenerationPanel;