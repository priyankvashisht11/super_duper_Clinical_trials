import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  Description as DocumentIcon,
  Download as DownloadIcon,
  Visibility as PreviewIcon
} from '@mui/icons-material';
import { DocumentGenerationPanel } from '../documents';
import { sampleTrials } from '../../data/sampleTrials';
import { ClinicalTrial } from '../../types';

export const DocumentGenerationDemo: React.FC = () => {
  const [selectedTrials, setSelectedTrials] = useState<ClinicalTrial[]>([]);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [previewTrial, setPreviewTrial] = useState<ClinicalTrial | null>(null);

  // Get a subset of sample trials for demo
  const demoTrials = sampleTrials.slice(0, 6);

  const handleTrialToggle = (trial: ClinicalTrial) => {
    setSelectedTrials(prev => {
      const isSelected = prev.some(t => t.id === trial.id);
      if (isSelected) {
        return prev.filter(t => t.id !== trial.id);
      } else {
        return [...prev, trial];
      }
    });
  };

  const handleTrialRemove = (trialId: string) => {
    setSelectedTrials(prev => prev.filter(t => t.id !== trialId));
  };

  const handleGenerateDocument = () => {
    if (selectedTrials.length === 0) {
      // Auto-select first 3 trials for demo
      setSelectedTrials(demoTrials.slice(0, 3));
    }
    setIsGeneratorOpen(true);
  };

  const isTrialSelected = (trialId: string) => {
    return selectedTrials.some(t => t.id === trialId);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" gutterBottom>
          AI Document Generation Demo
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Select clinical trials and generate professional research documents with AI
        </Typography>
        <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto' }}>
          This is a demonstration of AI-powered document generation. Select trials below and click "Generate Document" to see the streaming AI in action.
        </Alert>
      </Box>

      {/* Selection Summary */}
      <Paper sx={{ p: 3, mb: 4, backgroundColor: 'primary.50' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AIIcon color="primary" />
              Selected Trials: {selectedTrials.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedTrials.length === 0 
                ? 'Select trials below to generate documents'
                : `Ready to generate documents from ${selectedTrials.length} trial${selectedTrials.length !== 1 ? 's' : ''}`
              }
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<DocumentIcon />}
            onClick={handleGenerateDocument}
            sx={{ minWidth: 200 }}
          >
            Generate Document
          </Button>
        </Box>
      </Paper>

      {/* Trial Selection Grid */}
      <Typography variant="h5" gutterBottom>
        Available Clinical Trials
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Click on trials to select them for document generation. You can select multiple trials to create comprehensive research documents.
      </Typography>

      <Grid container spacing={3}>
        {demoTrials.map((trial) => {
          const isSelected = isTrialSelected(trial.id);
          
          return (
            <Grid item xs={12} md={6} lg={4} key={trial.id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  border: 2,
                  borderColor: isSelected ? 'primary.main' : 'transparent',
                  backgroundColor: isSelected ? 'primary.50' : 'background.paper',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-2px)',
                    boxShadow: 3
                  }
                }}
                onClick={() => handleTrialToggle(trial)}
              >
                <CardContent sx={{ pb: 1 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                      {trial.ctriNumber}
                    </Typography>
                    {isSelected && (
                      <Chip
                        label="Selected"
                        size="small"
                        color="primary"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </Box>

                  {/* Title */}
                  <Typography variant="h6" component="h3" sx={{ mb: 2, lineHeight: 1.3 }}>
                    {trial.title}
                  </Typography>

                  {/* Summary */}
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {trial.briefSummary.length > 120 
                      ? `${trial.briefSummary.substring(0, 120)}...`
                      : trial.briefSummary
                    }
                  </Typography>

                  {/* Metadata */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    <Chip label={`Phase ${trial.phase}`} size="small" />
                    <Chip 
                      label={trial.recruitmentStatus.replace('_', ' ')} 
                      size="small" 
                      color={trial.recruitmentStatus === 'recruiting' ? 'success' : 'default'}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    <strong>Condition:</strong> {trial.condition}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Location:</strong> {trial.locations[0]?.city}, {trial.locations[0]?.state}
                  </Typography>
                </CardContent>

                <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    startIcon={<PreviewIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewTrial(trial);
                    }}
                  >
                    Preview
                  </Button>
                  <Button
                    size="small"
                    variant={isSelected ? 'contained' : 'outlined'}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTrialToggle(trial);
                    }}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Document Generation Dialog */}
      <Dialog
        open={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DocumentGenerationPanel
          selectedTrials={selectedTrials}
          onTrialRemove={handleTrialRemove}
          onClose={() => setIsGeneratorOpen(false)}
        />
      </Dialog>

      {/* Trial Preview Dialog */}
      <Dialog
        open={!!previewTrial}
        onClose={() => setPreviewTrial(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Trial Details: {previewTrial?.ctriNumber}
        </DialogTitle>
        <DialogContent>
          {previewTrial && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {previewTrial.title}
              </Typography>
              
              <Typography variant="body1" paragraph>
                {previewTrial.briefSummary}
              </Typography>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Phase:</strong> {previewTrial.phase}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Status:</strong> {previewTrial.recruitmentStatus.replace('_', ' ')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Condition:</strong> {previewTrial.condition}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>Intervention:</strong> {previewTrial.intervention}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="subtitle2" gutterBottom>
                Inclusion Criteria:
              </Typography>
              <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                {previewTrial.inclusionCriteria.slice(0, 3).map((criteria, index) => (
                  <Typography component="li" variant="body2" key={index}>
                    {criteria}
                  </Typography>
                ))}
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Study Locations:
              </Typography>
              <Box sx={{ mb: 2 }}>
                {previewTrial.locations.map((location, index) => (
                  <Chip
                    key={index}
                    label={`${location.hospital}, ${location.city}`}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewTrial(null)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (previewTrial) {
                handleTrialToggle(previewTrial);
              }
              setPreviewTrial(null);
            }}
          >
            {previewTrial && isTrialSelected(previewTrial.id) ? 'Remove from Selection' : 'Add to Selection'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentGenerationDemo;