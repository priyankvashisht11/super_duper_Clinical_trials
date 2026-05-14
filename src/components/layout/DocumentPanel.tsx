import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Chip,
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
  Drawer,
} from '@mui/material';
import {
  Close as CloseIcon,
  Description as DocumentIcon,
  Download as DownloadIcon,
  AutoAwesome as AIIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { DocumentPanel as StyledDocumentPanel } from '../styled/Layout';
import { FlexBetween, FlexColumn } from '../styled/Layout';
import type { ClinicalTrial } from '../../types';

interface DocumentPanelProps {
  open: boolean;
  onToggle: () => void;
  selectedTrials?: ClinicalTrial[];
  onTrialRemove?: (trialId: string) => void;
}

const mockSelectedTrials: ClinicalTrial[] = [
  {
    id: '1',
    ctriNumber: 'CTRI/2024/01/012345',
    title: 'Efficacy of Novel Diabetes Treatment',
    briefSummary: 'A Phase III randomized controlled trial evaluating the efficacy and safety of a novel diabetes treatment.',
    phase: 'III' as const,
    studyType: 'Interventional',
    recruitmentStatus: 'recruiting' as const,
    condition: 'Type 2 Diabetes',
    intervention: 'Novel diabetes medication vs placebo',
    inclusionCriteria: ['Age 18-75 years', 'Diagnosed Type 2 Diabetes', 'HbA1c 7-11%'],
    exclusionCriteria: ['Type 1 Diabetes', 'Severe kidney disease', 'Pregnancy'],
    primarySponsor: 'AIIMS Delhi',
    principalInvestigator: 'Dr. Sharma',
    locations: [{
      hospital: 'AIIMS Delhi',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India'
    }],
    contactInfo: {
      name: 'Dr. Sharma',
      email: 'sharma@aiims.edu'
    },
    startDate: new Date('2024-01-15'),
    lastUpdated: new Date('2024-01-15')
  },
  {
    id: '2',
    ctriNumber: 'CTRI/2024/01/012346',
    title: 'Phase III Study of Hypertension Drug',
    briefSummary: 'A multicenter Phase III trial investigating a new antihypertensive medication.',
    phase: 'III' as const,
    studyType: 'Interventional',
    recruitmentStatus: 'recruiting' as const,
    condition: 'Hypertension',
    intervention: 'New antihypertensive drug vs standard care',
    inclusionCriteria: ['Age 21-70 years', 'Essential hypertension', 'BP >140/90 mmHg'],
    exclusionCriteria: ['Secondary hypertension', 'Heart failure', 'Pregnancy'],
    primarySponsor: 'PGI Chandigarh',
    principalInvestigator: 'Dr. Patel',
    locations: [{
      hospital: 'PGI Chandigarh',
      city: 'Chandigarh',
      state: 'Chandigarh',
      country: 'India'
    }],
    contactInfo: {
      name: 'Dr. Patel',
      email: 'patel@pgi.edu'
    },
    startDate: new Date('2024-02-01'),
    lastUpdated: new Date('2024-02-01')
  },
];

const DocumentPanelContent: React.FC<{ 
  onClose?: () => void;
  selectedTrials?: ClinicalTrial[];
  onTrialRemove?: (trialId: string) => void;
}> = ({ onClose, selectedTrials: propSelectedTrials, onTrialRemove }) => {
  const [selectedTrials, setSelectedTrials] = useState<ClinicalTrial[]>(propSelectedTrials || mockSelectedTrials);
  const [researchQuestion, setResearchQuestion] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Update local state when props change
  React.useEffect(() => {
    if (propSelectedTrials) {
      setSelectedTrials(propSelectedTrials);
    }
  }, [propSelectedTrials]);

  const handleRemoveTrial = (trialId: string) => {
    if (onTrialRemove) {
      onTrialRemove(trialId);
    } else {
      setSelectedTrials(prev => prev.filter(trial => trial.id !== trialId));
    }
  };

  const handleGenerate = async () => {
    if (!researchQuestion.trim() || selectedTrials.length === 0) return;
    
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedContent(`
# Research Summary

Based on the selected clinical trials and your research question: "${researchQuestion}"

## Key Findings

The analysis of ${selectedTrials.length} clinical trials reveals important insights into the treatment approaches and outcomes.

### Trial Overview
${selectedTrials.map(trial => `- **${trial.ctriNumber}**: ${trial.title}`).join('\n')}

### Methodology Analysis
The selected trials employ various methodological approaches, with Phase III studies showing promising results in patient outcomes.

### Clinical Implications
These findings suggest potential improvements in treatment protocols and patient care strategies.

## Recommendations

1. Further investigation into combination therapies
2. Extended follow-up studies for long-term outcomes
3. Consideration of patient-specific factors

*This document was generated using AI and should be reviewed by medical professionals.*
      `);
      setIsGenerating(false);
    }, 2000);
  };

  const handleExport = (format: 'docx' | 'pdf' | 'txt') => {
    // Placeholder for export functionality
    console.log(`Exporting as ${format.toUpperCase()}`);
  };

  return (
    <FlexColumn sx={{ height: '100%', p: 3 }}>
      {/* Header */}
      <FlexBetween sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DocumentIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Research Document
          </Typography>
        </Box>
        {onClose && (
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        )}
      </FlexBetween>

      {/* Selected Trials */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          Selected Trials ({selectedTrials.length})
        </Typography>
        
        {selectedTrials.length === 0 ? (
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
            <Typography variant="body2" color="text.secondary">
              No trials selected. Select trials from the search results to generate documents.
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {selectedTrials.map((trial) => (
              <Chip
                key={trial.id}
                label={
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {trial.ctriNumber}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', opacity: 0.8 }}>
                      {trial.title.length > 40 
                        ? `${trial.title.substring(0, 40)}...` 
                        : trial.title
                      }
                    </Typography>
                  </Box>
                }
                onDelete={() => handleRemoveTrial(trial.id)}
                deleteIcon={<DeleteIcon />}
                variant="outlined"
                sx={{ 
                  height: 'auto', 
                  py: 1, 
                  px: 2,
                  '& .MuiChip-label': { 
                    whiteSpace: 'normal',
                    textAlign: 'left',
                  }
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Research Question */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          Research Question
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Enter your research question... (e.g., What are the latest treatment approaches for Type 2 Diabetes in India?)"
          value={researchQuestion}
          onChange={(e) => setResearchQuestion(e.target.value)}
          variant="outlined"
          size="small"
        />
      </Box>

      {/* Generate Button */}
      <Button
        fullWidth
        variant="contained"
        startIcon={<AIIcon />}
        onClick={handleGenerate}
        disabled={!researchQuestion.trim() || selectedTrials.length === 0 || isGenerating}
        sx={{ mb: 3 }}
      >
        {isGenerating ? 'Generating...' : 'Generate Summary'}
      </Button>

      {/* Generated Content */}
      {(generatedContent || isGenerating) && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <FlexBetween sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Generated Document
            </Typography>
            {generatedContent && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleExport('docx')}
                >
                  DOCX
                </Button>
                <Button
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleExport('pdf')}
                >
                  PDF
                </Button>
              </Box>
            )}
          </FlexBetween>
          
          <Paper
            sx={{
              flex: 1,
              p: 2,
              bgcolor: 'grey.50',
              border: '1px solid',
              borderColor: 'grey.200',
              overflow: 'auto',
            }}
          >
            {isGenerating ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Generating document with AI...
                </Typography>
              </Box>
            ) : (
              <Typography
                variant="body2"
                component="pre"
                sx={{
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  lineHeight: 1.6,
                }}
              >
                {generatedContent}
              </Typography>
            )}
          </Paper>
        </Box>
      )}
    </FlexColumn>
  );
};

export const DocumentPanel: React.FC<DocumentPanelProps> = ({ 
  open, 
  onToggle, 
  selectedTrials, 
  onTrialRemove 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        anchor="right"
        open={open}
        onClose={onToggle}
        sx={{
          '& .MuiDrawer-paper': {
            width: '100%',
            maxWidth: 400,
            boxSizing: 'border-box',
          },
        }}
      >
        <DocumentPanelContent
          onClose={onToggle}
          {...(selectedTrials !== undefined ? { selectedTrials } : {})}
          {...(onTrialRemove !== undefined ? { onTrialRemove } : {})}
        />
      </Drawer>
    );
  }

  return (
    <StyledDocumentPanel isOpen={open} elevation={0}>
      {open && (
        <DocumentPanelContent
          {...(selectedTrials !== undefined ? { selectedTrials } : {})}
          {...(onTrialRemove !== undefined ? { onTrialRemove } : {})}
        />
      )}
    </StyledDocumentPanel>
  );
};