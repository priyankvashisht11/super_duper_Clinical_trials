import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
} from '@mui/material';
import {
  Science as ScienceIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Timeline as TimelineIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

const steps = [
  'Study Overview',
  'Eligibility Criteria',
  'Study Design',
  'Endpoints & Outcomes',
  'Review & Export',
];

export const ProtocolBuilderPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [protocolData, setProtocolData] = useState({
    studyTitle: '',
    studyPhase: '',
    condition: '',
    intervention: '',
    primaryObjective: '',
    inclusionCriteria: [] as string[],
    exclusionCriteria: [] as string[],
    studyType: '',
    duration: '',
    sampleSize: '',
    primaryEndpoint: '',
    secondaryEndpoints: [] as string[],
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setProtocolData({
      studyTitle: '',
      studyPhase: '',
      condition: '',
      intervention: '',
      primaryObjective: '',
      inclusionCriteria: [],
      exclusionCriteria: [],
      studyType: '',
      duration: '',
      sampleSize: '',
      primaryEndpoint: '',
      secondaryEndpoints: [],
    });
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" gutterBottom>
              Study Overview
            </Typography>
            <TextField
              fullWidth
              label="Study Title"
              value={protocolData.studyTitle}
              onChange={(e) =>
                setProtocolData({ ...protocolData, studyTitle: e.target.value })
              }
              placeholder="Enter the full title of your clinical trial"
            />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Study Phase"
                  value={protocolData.studyPhase}
                  onChange={(e) =>
                    setProtocolData({ ...protocolData, studyPhase: e.target.value })
                  }
                  placeholder="e.g., Phase II, Phase III"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Condition/Disease"
                  value={protocolData.condition}
                  onChange={(e) =>
                    setProtocolData({ ...protocolData, condition: e.target.value })
                  }
                  placeholder="e.g., Type 2 Diabetes"
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Intervention"
              value={protocolData.intervention}
              onChange={(e) =>
                setProtocolData({ ...protocolData, intervention: e.target.value })
              }
              placeholder="e.g., Drug name, procedure, device"
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Primary Objective"
              value={protocolData.primaryObjective}
              onChange={(e) =>
                setProtocolData({ ...protocolData, primaryObjective: e.target.value })
              }
              placeholder="Describe the main goal of this study"
            />
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" gutterBottom>
              Eligibility Criteria
            </Typography>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  Inclusion Criteria
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Define who can participate in the study
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {protocolData.inclusionCriteria.map((criteria, index) => (
                    <Chip
                      key={index}
                      label={criteria}
                      onDelete={() => {
                        const newCriteria = protocolData.inclusionCriteria.filter(
                          (_, i) => i !== index
                        );
                        setProtocolData({
                          ...protocolData,
                          inclusionCriteria: newCriteria,
                        });
                      }}
                    />
                  ))}
                </Box>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add inclusion criterion (press Enter)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement;
                      if (target.value.trim()) {
                        setProtocolData({
                          ...protocolData,
                          inclusionCriteria: [
                            ...protocolData.inclusionCriteria,
                            target.value.trim(),
                          ],
                        });
                        target.value = '';
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" color="error" gutterBottom>
                  Exclusion Criteria
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Define who cannot participate in the study
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {protocolData.exclusionCriteria.map((criteria, index) => (
                    <Chip
                      key={index}
                      label={criteria}
                      color="error"
                      variant="outlined"
                      onDelete={() => {
                        const newCriteria = protocolData.exclusionCriteria.filter(
                          (_, i) => i !== index
                        );
                        setProtocolData({
                          ...protocolData,
                          exclusionCriteria: newCriteria,
                        });
                      }}
                    />
                  ))}
                </Box>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add exclusion criterion (press Enter)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement;
                      if (target.value.trim()) {
                        setProtocolData({
                          ...protocolData,
                          exclusionCriteria: [
                            ...protocolData.exclusionCriteria,
                            target.value.trim(),
                          ],
                        });
                        target.value = '';
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" gutterBottom>
              Study Design
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Study Type"
                  value={protocolData.studyType}
                  onChange={(e) =>
                    setProtocolData({ ...protocolData, studyType: e.target.value })
                  }
                  placeholder="e.g., Randomized Controlled Trial"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Study Duration"
                  value={protocolData.duration}
                  onChange={(e) =>
                    setProtocolData({ ...protocolData, duration: e.target.value })
                  }
                  placeholder="e.g., 12 months"
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Target Sample Size"
              value={protocolData.sampleSize}
              onChange={(e) =>
                setProtocolData({ ...protocolData, sampleSize: e.target.value })
              }
              placeholder="e.g., 200 participants"
              type="number"
            />
          </Box>
        );

      case 3:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" gutterBottom>
              Endpoints & Outcomes
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Primary Endpoint"
              value={protocolData.primaryEndpoint}
              onChange={(e) =>
                setProtocolData({ ...protocolData, primaryEndpoint: e.target.value })
              }
              placeholder="Define the main outcome measure"
            />
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Secondary Endpoints
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {protocolData.secondaryEndpoints.map((endpoint, index) => (
                    <Chip
                      key={index}
                      label={endpoint}
                      onDelete={() => {
                        const newEndpoints = protocolData.secondaryEndpoints.filter(
                          (_, i) => i !== index
                        );
                        setProtocolData({
                          ...protocolData,
                          secondaryEndpoints: newEndpoints,
                        });
                      }}
                    />
                  ))}
                </Box>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add secondary endpoint (press Enter)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement;
                      if (target.value.trim()) {
                        setProtocolData({
                          ...protocolData,
                          secondaryEndpoints: [
                            ...protocolData.secondaryEndpoints,
                            target.value.trim(),
                          ],
                        });
                        target.value = '';
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>
          </Box>
        );

      case 4:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="h6" gutterBottom>
              Protocol Summary
            </Typography>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Study Overview
              </Typography>
              <Typography variant="body2">
                <strong>Title:</strong> {protocolData.studyTitle || 'Not specified'}
              </Typography>
              <Typography variant="body2">
                <strong>Phase:</strong> {protocolData.studyPhase || 'Not specified'}
              </Typography>
              <Typography variant="body2">
                <strong>Condition:</strong> {protocolData.condition || 'Not specified'}
              </Typography>
              <Typography variant="body2">
                <strong>Intervention:</strong> {protocolData.intervention || 'Not specified'}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Eligibility
              </Typography>
              <Typography variant="body2">
                <strong>Inclusion Criteria:</strong> {protocolData.inclusionCriteria.length} criteria defined
              </Typography>
              <Typography variant="body2">
                <strong>Exclusion Criteria:</strong> {protocolData.exclusionCriteria.length} criteria defined
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Study Design
              </Typography>
              <Typography variant="body2">
                <strong>Type:</strong> {protocolData.studyType || 'Not specified'}
              </Typography>
              <Typography variant="body2">
                <strong>Duration:</strong> {protocolData.duration || 'Not specified'}
              </Typography>
              <Typography variant="body2">
                <strong>Sample Size:</strong> {protocolData.sampleSize || 'Not specified'}
              </Typography>
            </Paper>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant="contained" startIcon={<CheckCircleIcon />}>
                Export Protocol
              </Button>
              <Button variant="outlined">
                Save Draft
              </Button>
            </Box>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Protocol Builder
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create comprehensive clinical trial protocols with our step-by-step builder
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScienceIcon color="primary" />
                <Box>
                  <Typography variant="h6">12</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Protocols Created
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon color="success" />
                <Box>
                  <Typography variant="h6">8</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimelineIcon color="warning" />
                <Box>
                  <Typography variant="h6">4</Typography>
                  <Typography variant="caption" color="text.secondary">
                    In Progress
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PeopleIcon color="info" />
                <Box>
                  <Typography variant="h6">3</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Collaborators
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Protocol Builder Form */}
      <Paper sx={{ p: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === steps.length ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Protocol Complete!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your clinical trial protocol has been successfully created.
            </Typography>
            <Button onClick={handleReset} variant="contained">
              Create New Protocol
            </Button>
          </Box>
        ) : (
          <>
            {renderStepContent(activeStep)}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                Back
              </Button>
              <Button onClick={handleNext} variant="contained">
                {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};
