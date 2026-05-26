import React from 'react';
import { Box } from '@mui/material';
import { TopNavigation } from '../components/layout';
import { AgentChatPanel } from '../components/agent/AgentChatPanel';

const SUGGESTED = [
  'Find trials for a 52-year-old female with HER2+ breast cancer in Mumbai — recruiting',
  'Match a diabetic male patient, 65 years, with diabetic nephropathy, Delhi NCR',
  'Pediatric ALL patient, relapsed, looking for CAR-T or immunotherapy trials in India',
  'COPD patient with FEV1 < 50% — what trials are currently enrolling?',
  'Match patient with treatment-resistant depression for rTMS or ketamine trials',
  'Rheumatoid arthritis, biologic-naive, 40F — CTRI trials in Bangalore or Pune',
];

export function PatientMatchPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', bgcolor: '#F9FAFB' }}>
      <TopNavigation />
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <AgentChatPanel
          tab="match"
          title="Patient Matching Agent"
          suggestedQueries={SUGGESTED}
        />
      </Box>
    </Box>
  );
}
