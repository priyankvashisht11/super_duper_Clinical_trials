import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  FormControlLabel,
  Switch,
  TextField,
  Paper,
  Divider,
} from '@mui/material';
import { TrialCard } from './TrialCard';
import type { ClinicalTrial } from '../../types';

// Sample trial data for demo
const sampleTrials: ClinicalTrial[] = [
  {
    id: 'trial-001',
    ctriNumber: 'CTRI/2024/01/012345',
    title: 'Efficacy of Novel Diabetes Treatment in Type 2 Diabetes Patients',
    briefSummary: 'This is a Phase III randomized controlled trial to evaluate the efficacy and safety of a novel diabetes treatment compared to standard care in patients with Type 2 diabetes mellitus.',
    detailedDescription: 'A comprehensive multi-center study examining the long-term effects of innovative diabetes management protocols.',
    phase: 'III',
    studyType: 'Interventional',
    recruitmentStatus: 'recruiting',
    condition: 'Type 2 Diabetes Mellitus',
    intervention: 'Novel Diabetes Drug XYZ-123',
    inclusionCriteria: ['Age between 18-65 years', 'Diagnosed with Type 2 Diabetes for at least 6 months'],
    exclusionCriteria: ['Pregnancy or breastfeeding', 'Severe kidney disease (eGFR < 30)'],
    primarySponsor: 'All Institute of Medical Sciences (AIIMS), New Delhi',
    principalInvestigator: 'Dr. Rajesh Kumar Sharma, MD, DM (Endocrinology)',
    locations: [
      {
        hospital: 'AIIMS Delhi',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        coordinates: { lat: 28.5665, lng: 77.2090 }
      },
      {
        hospital: 'PGIMER Chandigarh',
        city: 'Chandigarh',
        state: 'Punjab',
        country: 'India'
      }
    ],
    contactInfo: {
      name: 'Dr. Rajesh Kumar Sharma',
      email: 'rajesh.sharma@aiims.edu',
      phone: '+91-11-26588500'
    },
    startDate: new Date('2024-01-15'),
    completionDate: new Date('2025-12-31'),
    lastUpdated: new Date('2024-01-10')
  },
  {
    id: 'trial-002',
    ctriNumber: 'CTRI/2024/02/023456',
    title: 'Cardiovascular Safety Study of Hypertension Medication',
    briefSummary: 'A Phase II study to assess the cardiovascular safety profile of a new hypertension medication in patients with moderate to severe hypertension.',
    phase: 'II',
    studyType: 'Interventional',
    recruitmentStatus: 'not_yet_recruiting',
    condition: 'Hypertension',
    intervention: 'Experimental Antihypertensive Drug',
    inclusionCriteria: ['Age 40-75 years', 'Diagnosed hypertension'],
    exclusionCriteria: ['Recent cardiac events', 'Uncontrolled diabetes'],
    primarySponsor: 'Sree Chitra Tirunal Institute, Trivandrum',
    principalInvestigator: 'Dr. Priya Nair, MD (Cardiology)',
    locations: [
      {
        hospital: 'SCTIMST Trivandrum',
        city: 'Trivandrum',
        state: 'Kerala',
        country: 'India'
      }
    ],
    contactInfo: {
      name: 'Dr. Priya Nair',
      email: 'priya.nair@sctimst.ac.in',
      phone: '+91-471-2524266'
    },
    startDate: new Date('2024-03-01'),
    completionDate: new Date('2025-08-31'),
    lastUpdated: new Date('2024-01-05')
  },
  {
    id: 'trial-003',
    ctriNumber: 'CTRI/2024/03/034567',
    title: 'Immunotherapy Trial for Advanced Cancer Patients',
    briefSummary: 'A Phase I dose-escalation study of a novel immunotherapy agent in patients with advanced solid tumors.',
    phase: 'I',
    studyType: 'Interventional',
    recruitmentStatus: 'completed',
    condition: 'Advanced Solid Tumors',
    intervention: 'Experimental Immunotherapy Agent',
    inclusionCriteria: ['Age 18+ years', 'Advanced cancer', 'ECOG performance status 0-2'],
    exclusionCriteria: ['Active autoimmune disease', 'Prior immunotherapy'],
    primarySponsor: 'Tata Memorial Centre, Mumbai',
    principalInvestigator: 'Dr. Amit Dutt, MD (Oncology)',
    locations: [
      {
        hospital: 'Tata Memorial Hospital',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India'
      }
    ],
    contactInfo: {
      name: 'Dr. Amit Dutt',
      email: 'amit.dutt@tmc.gov.in',
      phone: '+91-22-24177000'
    },
    startDate: new Date('2023-06-01'),
    completionDate: new Date('2024-01-31'),
    lastUpdated: new Date('2024-02-01')
  }
];

export const TrialCardDemo: React.FC = () => {
  const [selectedTrials, setSelectedTrials] = useState<string[]>([]);
  const [bookmarkedTrials, setBookmarkedTrials] = useState<string[]>(['trial-001']);
  const [showDistance, setShowDistance] = useState(false);
  const [selectable, setSelectable] = useState(true);
  const [compact, setCompact] = useState(false);
  const [highlightText, setHighlightText] = useState('');

  const handleTrialSelect = (trialId: string, selected: boolean) => {
    setSelectedTrials(prev => 
      selected 
        ? [...prev, trialId]
        : prev.filter(id => id !== trialId)
    );
  };

  const handleTrialBookmark = (trialId: string, bookmarked: boolean) => {
    setBookmarkedTrials(prev => 
      bookmarked 
        ? [...prev, trialId]
        : prev.filter(id => id !== trialId)
    );
  };

  const handleViewDetails = (trialId: string) => {
    console.log('View details for trial:', trialId);
    alert(`View details for trial: ${trialId}`);
  };

  const handleGenerateSummary = (trialId: string) => {
    console.log('Generate summary for trial:', trialId);
    alert(`Generate summary for trial: ${trialId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Clinical Trial Card Component Demo
      </Typography>
      
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Interactive demonstration of the TrialCard component with various features and states.
      </Typography>

      {/* Controls */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Demo Controls
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={selectable}
                  onChange={(e) => setSelectable(e.target.checked)}
                />
              }
              label="Selectable"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={showDistance}
                  onChange={(e) => setShowDistance(e.target.checked)}
                />
              }
              label="Show Distance"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={compact}
                  onChange={(e) => setCompact(e.target.checked)}
                />
              }
              label="Compact Mode"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Highlight Text"
              value={highlightText}
              onChange={(e) => setHighlightText(e.target.value)}
              size="small"
              placeholder="e.g., diabetes"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Selected Trials Info */}
      {selectedTrials.length > 0 && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.light' }}>
          <Typography variant="h6" color="primary.main">
            Selected Trials ({selectedTrials.length})
          </Typography>
          <Typography variant="body2">
            {selectedTrials.join(', ')}
          </Typography>
        </Paper>
      )}

      <Divider sx={{ mb: 4 }} />

      {/* Trial Cards */}
      <Grid container spacing={3}>
        {sampleTrials.map((trial) => (
          <Grid item xs={12} md={6} lg={4} key={trial.id}>
            <TrialCard
              trial={trial}
              isSelected={selectedTrials.includes(trial.id)}
              isBookmarked={bookmarkedTrials.includes(trial.id)}
              showDistance={showDistance}
              {...(showDistance && { distance: Math.random() * 50 + 5 })}
              highlightMatching={highlightText || undefined}
              onSelect={handleTrialSelect}
              onBookmark={handleTrialBookmark}
              onViewDetails={handleViewDetails}
              onGenerateSummary={handleGenerateSummary}
              selectable={selectable}
              compact={compact}
            />
          </Grid>
        ))}
      </Grid>

      {/* Feature Showcase */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h4" gutterBottom>
          Feature Showcase
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Different Recruitment Statuses
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {(['recruiting', 'not_yet_recruiting', 'completed', 'suspended'] as const).map((status) => (
                <TrialCard
                  key={status}
                  trial={{
                    ...sampleTrials[0],
                    id: `status-${status}`,
                    recruitmentStatus: status,
                    title: `Trial with ${status.replace('_', ' ')} status`
                  }}
                  compact={true}
                />
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Different Trial Phases
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {(['I', 'II', 'III', 'IV'] as const).map((phase) => (
                <TrialCard
                  key={phase}
                  trial={{
                    ...sampleTrials[0],
                    id: `phase-${phase}`,
                    phase: phase,
                    title: `Phase ${phase} Clinical Trial`
                  }}
                  compact={true}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default TrialCardDemo;