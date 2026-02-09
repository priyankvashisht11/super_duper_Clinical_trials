import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Box, Typography, Stepper, Step, StepLabel, StepContent
} from '@mui/material';
import {
  MenuBook as GuideIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { colors } from '../../styles/theme';

interface UserGuideProps {
  open: boolean;
  onClose: () => void;
}

const GUIDE_STEPS = [
  {
    label: 'Create Your Protocol',
    content: (
      <>
        <Typography variant="body2" paragraph>
          Start by creating a new protocol from the Protocol List page:
        </Typography>
        <ul>
          <li><Typography variant="body2">Click "New Protocol" or use a Template</Typography></li>
          <li><Typography variant="body2">Fill in basic metadata (title, identifier, phase)</Typography></li>
          <li><Typography variant="body2">Click "Create Protocol" to begin</Typography></li>
        </ul>
      </>
    )
  },
  {
    label: 'Complete All 14 Sections',
    content: (
      <>
        <Typography variant="body2" paragraph>
          Navigate through all M11 sections using the sidebar:
        </Typography>
        <ul>
          <li><Typography variant="body2">Section 1: Auto-generated summary</Typography></li>
          <li><Typography variant="body2">Sections 2-14: Author your protocol content</Typography></li>
          <li><Typography variant="body2">Watch validation status update in real-time</Typography></li>
          <li><Typography variant="body2">All changes are auto-saved</Typography></li>
        </ul>
      </>
    )
  },
  {
    label: 'Monitor Validation',
    content: (
      <>
        <Typography variant="body2" paragraph>
          Use the built-in validation system to ensure quality:
        </Typography>
        <ul>
          <li><Typography variant="body2">Check the Validation Status Bar at the top</Typography></li>
          <li><Typography variant="body2">Look for green checkmarks in section navigation</Typography></li>
          <li><Typography variant="body2">Fix errors and warnings as they appear</Typography></li>
          <li><Typography variant="body2">Aim for 100% completion</Typography></li>
        </ul>
      </>
    )
  },
  {
    label: 'Export & Share',
    content: (
      <>
        <Typography variant="body2" paragraph>
          When your protocol is ready:
        </Typography>
        <ul>
          <li><Typography variant="body2">Click "Export" to download USDM JSON</Typography></li>
          <li><Typography variant="body2">Use "Clone" to create variations</Typography></li>
          <li><Typography variant="body2">Share with your team for review</Typography></li>
        </ul>
      </>
    )
  }
];

export const UserGuide: React.FC<UserGuideProps> = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <GuideIcon sx={{ color: colors.primary.main, fontSize: 32 }} />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Quick Start Guide
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Learn how to use the Protocol Builder
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Stepper activeStep={activeStep} orientation="vertical">
          {GUIDE_STEPS.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                {step.content}
                <Box mt={2}>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    size="small"
                    disabled={index === GUIDE_STEPS.length - 1}
                    sx={{
                      background: index === GUIDE_STEPS.length - 1 ? undefined : 
                        `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
                      mr: 1
                    }}
                  >
                    {index === GUIDE_STEPS.length - 1 ? 'Finish' : 'Continue'}
                  </Button>
                  <Button
                    onClick={handleBack}
                    size="small"
                    disabled={index === 0}
                  >
                    Back
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {activeStep === GUIDE_STEPS.length && (
          <Box textAlign="center" py={4}>
            <CheckIcon sx={{ fontSize: 64, color: colors.semantic.success, mb: 2 }} />
            <Typography variant="h6" fontWeight={700} gutterBottom>
              You're Ready to Go!
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Press '?' anytime to see keyboard shortcuts.
            </Typography>
            <Button onClick={handleReset} size="small">
              Restart Guide
            </Button>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};