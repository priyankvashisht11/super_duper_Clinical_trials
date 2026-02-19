import React from 'react';
import { Box, Typography, Fade, Alert, AlertTitle } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { colors } from '../../styles/theme';
import type { ClinicalTrial } from '../../types';

// Sample demo data for clinical trials
export const DEMO_TRIALS: ClinicalTrial[] = [
  {
    id: 'demo-1',
    ctriNumber: 'CTRI/2024/01/012345',
    title: 'Efficacy and Safety of Novel Metformin Extended-Release in Type 2 Diabetes',
    briefSummary: 'A randomized, double-blind, placebo-controlled Phase III study evaluating the efficacy and safety of a novel extended-release metformin formulation in Indian patients with Type 2 diabetes mellitus.',
    detailedDescription: 'This study aims to evaluate the long-term glycemic control and cardiovascular outcomes of a new extended-release metformin formulation compared to standard metformin in Indian patients with Type 2 diabetes.',
    phase: 'III',
    studyType: 'Interventional',
    recruitmentStatus: 'recruiting',
    condition: 'Type 2 Diabetes Mellitus',
    intervention: 'Metformin Extended-Release 1000mg',
    inclusionCriteria: [
      'Adults aged 18-65 years',
      'Diagnosed with Type 2 diabetes for at least 6 months',
      'HbA1c between 7.0-10.0%',
      'BMI 23-35 kg/m²'
    ],
    exclusionCriteria: [
      'Type 1 diabetes or secondary diabetes',
      'Severe kidney or liver disease',
      'Pregnancy or breastfeeding',
      'Recent cardiovascular events'
    ],
    primarySponsor: 'All Institute of Medical Sciences, Delhi',
    principalInvestigator: 'Dr. Rajesh Sharma, MD',
    locations: [
      {
        hospital: 'AIIMS Delhi',
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        coordinates: { lat: 28.5672, lng: 77.2100 }
      },
      {
        hospital: 'King George Medical University',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        country: 'India',
        coordinates: { lat: 26.8467, lng: 80.9462 }
      }
    ],
    contactInfo: {
      name: 'Dr. Rajesh Sharma',
      email: 'rajesh.sharma@aiims.edu',
      phone: '+91-11-2659-3333'
    },
    startDate: new Date('2024-02-01'),
    completionDate: new Date('2026-01-31'),
    lastUpdated: new Date('2024-01-15')
  },
  {
    id: 'demo-2',
    ctriNumber: 'CTRI/2024/01/012346',
    title: 'Immunotherapy Combination Trial for Advanced Non-Small Cell Lung Cancer',
    briefSummary: 'Phase II study evaluating the combination of pembrolizumab and carboplatin-paclitaxel in treatment-naive patients with advanced non-small cell lung cancer.',
    phase: 'II',
    studyType: 'Interventional',
    recruitmentStatus: 'recruiting',
    condition: 'Non-Small Cell Lung Cancer',
    intervention: 'Pembrolizumab + Carboplatin + Paclitaxel',
    inclusionCriteria: [
      'Histologically confirmed NSCLC',
      'Stage IIIB or IV disease',
      'ECOG performance status 0-1',
      'Adequate organ function'
    ],
    exclusionCriteria: [
      'Prior systemic therapy for advanced disease',
      'Active autoimmune disease',
      'Severe cardiac dysfunction',
      'Active infections'
    ],
    primarySponsor: 'Tata Memorial Hospital, Mumbai',
    principalInvestigator: 'Dr. Priya Menon, MD',
    locations: [
      {
        hospital: 'Tata Memorial Hospital',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        coordinates: { lat: 19.0760, lng: 72.8777 }
      }
    ],
    contactInfo: {
      name: 'Dr. Priya Menon',
      email: 'priya.menon@tmc.gov.in',
      phone: '+91-22-2417-7000'
    },
    startDate: new Date('2024-03-01'),
    completionDate: new Date('2025-12-31'),
    lastUpdated: new Date('2024-01-10')
  },
  {
    id: 'demo-3',
    ctriNumber: 'CTRI/2024/01/012347',
    title: 'Cardiovascular Outcomes Study of SGLT2 Inhibitor in Indian Diabetics',
    briefSummary: 'Large-scale Phase IV post-marketing surveillance study to evaluate cardiovascular outcomes of dapagliflozin in Indian patients with Type 2 diabetes and established cardiovascular disease.',
    phase: 'IV',
    studyType: 'Observational',
    recruitmentStatus: 'not_yet_recruiting',
    condition: 'Type 2 Diabetes with Cardiovascular Disease',
    intervention: 'Dapagliflozin 10mg',
    inclusionCriteria: [
      'Type 2 diabetes with HbA1c ≥7%',
      'Established cardiovascular disease',
      'Age ≥40 years',
      'eGFR ≥30 mL/min/1.73m²'
    ],
    exclusionCriteria: [
      'Type 1 diabetes',
      'Severe heart failure (NYHA Class IV)',
      'Dialysis or kidney transplant',
      'Pregnancy'
    ],
    primarySponsor: 'Christian Medical College, Vellore',
    principalInvestigator: 'Dr. Sunil Kumar, DM',
    locations: [
      {
        hospital: 'Christian Medical College',
        city: 'Vellore',
        state: 'Tamil Nadu',
        country: 'India',
        coordinates: { lat: 12.9249, lng: 79.1353 }
      },
      {
        hospital: 'Sree Chitra Tirunal Institute',
        city: 'Thiruvananthapuram',
        state: 'Kerala',
        country: 'India',
        coordinates: { lat: 8.5241, lng: 76.9366 }
      }
    ],
    contactInfo: {
      name: 'Dr. Sunil Kumar',
      email: 'sunil.kumar@cmcvellore.ac.in',
      phone: '+91-416-228-2020'
    },
    startDate: new Date('2024-04-01'),
    completionDate: new Date('2027-03-31'),
    lastUpdated: new Date('2024-01-08')
  }
];

const DemoContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: alpha(colors.primary.light, 0.02),
  borderRadius: 12,
  border: `1px solid ${alpha(colors.primary.main, 0.1)}`,
}));

const ResultsHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  
  '& .results-count': {
    fontSize: '0.875rem',
    color: colors.text.secondary,
    marginBottom: theme.spacing(0.5),
  },
  
  '& .results-title': {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: colors.text.primary,
  },
}));

const TrialCard = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: 12,
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(2),
  border: `1px solid ${colors.border.light}`,
  transition: 'all 0.2s ease-in-out',
  cursor: 'pointer',
  
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    borderColor: alpha(colors.primary.main, 0.3),
    transform: 'translateY(-1px)',
  },
  
  '&:last-child': {
    marginBottom: 0,
  },
}));

const TrialHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(1.5),
  
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
}));

const TrialNumber = styled(Typography)(({ theme }) => ({
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: colors.primary.main,
  fontFamily: 'monospace',
}));

const StatusChip = styled(Box)<{ status: string }>(({ theme, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'recruiting':
        return colors.status.recruiting;
      case 'not_yet_recruiting':
        return colors.status.notYetRecruiting;
      case 'completed':
        return colors.status.completed;
      default:
        return colors.text.secondary;
    }
  };
  
  const statusColor = getStatusColor();
  
  return {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: 16,
    backgroundColor: alpha(statusColor, 0.1),
    color: statusColor,
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'capitalize',
    
    '&::before': {
      content: '""',
      width: 6,
      height: 6,
      borderRadius: '50%',
      backgroundColor: statusColor,
      marginRight: theme.spacing(0.75),
    },
  };
});

const TrialTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.125rem',
  fontWeight: 600,
  color: colors.text.primary,
  lineHeight: 1.4,
  marginBottom: theme.spacing(1),
}));

const TrialSummary = styled(Typography)(({ theme }) => ({
  fontSize: '0.9375rem',
  color: colors.text.secondary,
  lineHeight: 1.5,
  marginBottom: theme.spacing(2),
}));

const TrialMeta = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: theme.spacing(1.5),
  
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(1),
  },
}));

const MetaItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  fontSize: '0.8125rem',
  color: colors.text.secondary,
  
  '& .meta-icon': {
    marginRight: theme.spacing(0.75),
    fontSize: '1rem',
  },
  
  '& .meta-label': {
    fontWeight: 500,
    marginRight: theme.spacing(0.5),
  },
  
  '& .meta-value': {
    color: colors.text.primary,
  },
}));

interface DemoSearchResultsProps {
  query: string;
  onTrialSelect?: (trial: ClinicalTrial) => void;
}

export const DemoSearchResults: React.FC<DemoSearchResultsProps> = ({
  query,
  onTrialSelect,
}) => {
  // Filter trials based on query
  const filteredTrials = DEMO_TRIALS.filter(trial => {
    const searchTerms = query.toLowerCase().split(' ');
    const searchableText = `
      ${trial.title} 
      ${trial.briefSummary} 
      ${trial.condition} 
      ${trial.intervention}
      ${trial.phase}
      ${trial.locations.map(loc => `${loc.city} ${loc.state}`).join(' ')}
    `.toLowerCase();
    
    return searchTerms.some(term => searchableText.includes(term));
  });
  
  const handleTrialClick = (trial: ClinicalTrial) => {
    onTrialSelect?.(trial);
  };
  
  if (filteredTrials.length === 0) {
    return (
      <DemoContainer>
        <Alert severity="info">
          <AlertTitle>No Demo Results Found</AlertTitle>
          Try searching for "diabetes", "cancer", or "cardiovascular" to see sample clinical trials.
        </Alert>
      </DemoContainer>
    );
  }
  
  return (
    <DemoContainer>
      <Alert 
        severity="info" 
        sx={{ 
          mb: 2,
          backgroundColor: '#e3f2fd',
          border: '2px solid #2196f3',
          borderRadius: 2,
          '& .MuiAlert-icon': { 
            color: '#1976d2',
            fontSize: 28
          },
          '& .MuiAlert-message': { 
            color: '#0d47a1',
            '& .MuiAlertTitle-root': { 
              color: '#0d47a1', 
              fontWeight: 700,
              fontSize: '1.1rem',
              mb: 0.5
            }
          }
        }}
      >
        <AlertTitle>Demo Results</AlertTitle>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0d47a1' }}>
          These are sample clinical trials for demonstration purposes. In the full platform, 
          you would see real CTRI database results.
        </Typography>
      </Alert>
      
      <ResultsHeader>
        <Typography className="results-count">
          Found {filteredTrials.length} demo trial{filteredTrials.length !== 1 ? 's' : ''} for "{query}"
        </Typography>
        <Typography className="results-title">
          Clinical Trials Search Results
        </Typography>
      </ResultsHeader>
      
      {filteredTrials.map((trial, index) => (
        <Fade in timeout={300 + index * 100} key={trial.id}>
          <TrialCard onClick={() => handleTrialClick(trial)}>
            <TrialHeader>
              <TrialNumber>{trial.ctriNumber}</TrialNumber>
              <StatusChip status={trial.recruitmentStatus}>
                {trial.recruitmentStatus.replace('_', ' ')}
              </StatusChip>
            </TrialHeader>
            
            <TrialTitle>{trial.title}</TrialTitle>
            <TrialSummary>{trial.briefSummary}</TrialSummary>
            
            <TrialMeta>
              <MetaItem>
                <span className="meta-label">Phase:</span>
                <span className="meta-value">{trial.phase}</span>
              </MetaItem>
              
              <MetaItem>
                <span className="meta-label">Condition:</span>
                <span className="meta-value">{trial.condition}</span>
              </MetaItem>
              
              <MetaItem>
                <span className="meta-label">Location:</span>
                <span className="meta-value">
                  {trial.locations[0].city}, {trial.locations[0].state}
                  {trial.locations.length > 1 && ` +${trial.locations.length - 1} more`}
                </span>
              </MetaItem>
              
              <MetaItem>
                <span className="meta-label">Sponsor:</span>
                <span className="meta-value">{trial.primarySponsor}</span>
              </MetaItem>
            </TrialMeta>
          </TrialCard>
        </Fade>
      ))}
    </DemoContainer>
  );
};

export default DemoSearchResults;