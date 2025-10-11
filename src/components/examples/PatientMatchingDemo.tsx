import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  Fade,
  Alert,
  Divider,
} from '@mui/material';
import {
  PersonSearch as MatchingIcon,
  Psychology as AIIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { colors } from '../../styles/theme';

const DemoContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  background: `linear-gradient(135deg, ${alpha(colors.primary.main, 0.02)}, ${alpha(colors.secondary.main, 0.02)})`,
  border: `1px solid ${alpha(colors.primary.main, 0.1)}`,
}));

const MatchCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  border: `1px solid ${alpha(colors.primary.main, 0.1)}`,
  transition: 'all 0.2s ease-in-out',
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${colors.primary.main}, ${colors.secondary.main})`,
  },
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 24px ${alpha(colors.primary.main, 0.15)}`,
  },
}));

const ConfidenceScore = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 2),
  borderRadius: 20,
  background: `linear-gradient(135deg, ${alpha(colors.secondary.main, 0.1)}, ${alpha(colors.primary.main, 0.1)})`,
  border: `1px solid ${alpha(colors.secondary.main, 0.2)}`,
}));

const steps = ['Patient Info', 'AI Analysis', 'Match Results'];

const mockPatientData = {
  age: '45',
  gender: 'Female',
  condition: 'Type 2 Diabetes Mellitus',
  location: 'Mumbai, Maharashtra',
  medicalHistory: 'Diagnosed 5 years ago, currently on Metformin, HbA1c: 8.2%',
  preferences: 'Willing to travel up to 50km, prefers Phase III trials',
};

const mockMatches = [
  {
    id: '1',
    ctriNumber: 'CTRI/2024/01/012345',
    title: 'Efficacy of Novel GLP-1 Agonist in T2DM',
    confidence: 92,
    phase: 'III',
    location: 'KEM Hospital, Mumbai',
    distance: '12 km',
    matchReasons: [
      'Age criteria: 18-65 years ✓',
      'HbA1c > 7.5% ✓',
      'Currently on Metformin ✓',
      'No contraindications ✓',
    ],
    concerns: [],
    status: 'recruiting',
  },
  {
    id: '2',
    ctriNumber: 'CTRI/2024/01/012346',
    title: 'Comparative Study of SGLT-2 Inhibitors',
    confidence: 87,
    phase: 'III',
    location: 'Tata Memorial Hospital, Mumbai',
    distance: '18 km',
    matchReasons: [
      'Age criteria: 25-70 years ✓',
      'T2DM diagnosis ✓',
      'Geographic proximity ✓',
    ],
    concerns: [
      'Requires kidney function tests',
    ],
    status: 'recruiting',
  },
  {
    id: '3',
    ctriNumber: 'CTRI/2024/01/012347',
    title: 'Prevention of Diabetic Complications',
    confidence: 78,
    phase: 'II',
    location: 'AIIMS Mumbai',
    distance: '25 km',
    matchReasons: [
      'Age criteria: 30-60 years ✓',
      'Diabetes duration > 3 years ✓',
    ],
    concerns: [
      'Phase II trial (patient prefers Phase III)',
      'Requires additional screening',
    ],
    status: 'recruiting',
  },
];

const getConfidenceColor = (score: number) => {
  if (score >= 90) return colors.status.recruiting;
  if (score >= 80) return colors.status.notYetRecruiting;
  return colors.status.suspended;
};

export const PatientMatchingDemo: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [patientData, setPatientData] = useState(mockPatientData);

  const handleNext = () => {
    if (activeStep === 0) {
      setActiveStep(1);
      setIsAnalyzing(true);
      
      // Simulate AI analysis
      setTimeout(() => {
        setIsAnalyzing(false);
        setActiveStep(2);
        setShowResults(true);
      }, 3000);
    } else if (activeStep === 1) {
      setActiveStep(2);
      setShowResults(true);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setIsAnalyzing(false);
    setShowResults(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <DemoContainer>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        👥 AI Patient-Trial Matching Demo
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Experience AI-powered eligibility screening with confidence scoring and geographic matching for optimal patient-trial matches.
      </Typography>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step Content */}
      {activeStep === 0 && (
        <Fade in timeout={600}>
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Patient Information
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Age"
                  value={patientData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Gender"
                  value={patientData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Medical Condition"
                  value={patientData.condition}
                  onChange={(e) => handleInputChange('condition', e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  value={patientData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Medical History & Current Treatment"
                  value={patientData.medicalHistory}
                  onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Patient Preferences"
                  value={patientData.preferences}
                  onChange={(e) => handleInputChange('preferences', e.target.value)}
                  variant="outlined"
                />
              </Grid>
            </Grid>

            <Button
              variant="contained"
              size="large"
              onClick={handleNext}
              startIcon={<AIIcon />}
              sx={{ minWidth: 200 }}
            >
              Start AI Analysis
            </Button>
          </Box>
        </Fade>
      )}

      {activeStep === 1 && (
        <Fade in timeout={600}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <AIIcon sx={{ fontSize: 64, color: colors.primary.main, mb: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              AI Analysis in Progress
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Our AI is analyzing patient eligibility against 12,000+ clinical trials...
            </Typography>
            
            <Box sx={{ maxWidth: 400, mx: 'auto', mb: 4 }}>
              <LinearProgress 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: alpha(colors.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: `linear-gradient(90deg, ${colors.primary.main}, ${colors.secondary.main})`,
                  },
                }} 
              />
            </Box>

            <Box sx={{ textAlign: 'left', maxWidth: 500, mx: 'auto' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                ✓ Parsing medical history and current medications
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                ✓ Matching inclusion/exclusion criteria across trials
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                ✓ Calculating geographic proximity and travel feasibility
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ✓ Generating confidence scores and recommendations
              </Typography>
            </Box>
          </Box>
        </Fade>
      )}

      {activeStep === 2 && showResults && (
        <Fade in timeout={600}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                AI Match Results
              </Typography>
              <Button variant="outlined" onClick={handleReset}>
                Try Another Patient
              </Button>
            </Box>

            <Alert severity="success" sx={{ mb: 4 }}>
              Found {mockMatches.length} potential matches with high confidence scores. 
              All matches require physician review and approval before patient contact.
            </Alert>

            <Grid container spacing={3}>
              {mockMatches.map((match, index) => (
                <Grid item xs={12} key={match.id}>
                  <Fade in timeout={400} style={{ transitionDelay: `${index * 200}ms` }}>
                    <MatchCard>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                          <Box>
                            <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                              {match.ctriNumber}
                            </Typography>
                            <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mt: 1 }}>
                              {match.title}
                            </Typography>
                          </Box>
                          <ConfidenceScore>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: getConfidenceColor(match.confidence) }}>
                              {match.confidence}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Match
                            </Typography>
                          </ConfidenceScore>
                        </Box>

                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: colors.status.recruiting }}>
                                ✓ Eligibility Matches
                              </Typography>
                              {match.matchReasons.map((reason, idx) => (
                                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                  <CheckIcon fontSize="small" sx={{ color: colors.status.recruiting }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {reason}
                                  </Typography>
                                </Box>
                              ))}
                            </Box>

                            {match.concerns.length > 0 && (
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: colors.status.notYetRecruiting }}>
                                  ⚠ Considerations
                                </Typography>
                                {match.concerns.map((concern, idx) => (
                                  <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <WarningIcon fontSize="small" sx={{ color: colors.status.notYetRecruiting }} />
                                    <Typography variant="body2" color="text.secondary">
                                      {concern}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            )}
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                Trial Details
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <LocationIcon fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                  {match.location} • {match.distance}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip label={`Phase ${match.phase}`} size="small" />
                                <Chip 
                                  label="Recruiting" 
                                  size="small" 
                                  sx={{ 
                                    backgroundColor: alpha(colors.status.recruiting, 0.1),
                                    color: colors.status.recruiting,
                                  }} 
                                />
                              </Box>
                            </Box>

                            <Button
                              variant="contained"
                              size="small"
                              fullWidth
                              sx={{ mt: 2 }}
                            >
                              Request Physician Review
                            </Button>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </MatchCard>
                  </Fade>
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ my: 4 }} />

            <Alert severity="info">
              <Typography variant="body2">
                <strong>Important:</strong> All AI recommendations require physician oversight. 
                This system assists with initial screening but does not replace clinical judgment. 
                Final eligibility determination must be made by qualified medical professionals.
              </Typography>
            </Alert>
          </Box>
        </Fade>
      )}
    </DemoContainer>
  );
};

export default PatientMatchingDemo;