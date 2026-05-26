import React from 'react';
import { Box } from '@mui/material';
import { TopNavigation } from '../components/layout';
import { AgentChatPanel } from '../components/agent/AgentChatPanel';

const SUGGESTED = [
  'What are the CDSCO requirements for Phase 2 oncology trials in India?',
  'Generate a CTRI registration checklist for a first-in-human study',
  'Summarise recent SUGAM portal changes affecting IND submissions 2024',
  'What ethics committee (EC) documents are mandatory before patient enrolment?',
  'Schedule Y vs New Drugs and Clinical Trials Rules 2019 — key differences',
  'GCP inspection readiness — most common CDSCO findings in oncology trials',
];

export function RegulatoryPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', bgcolor: '#F9FAFB' }}>
      <TopNavigation />
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <AgentChatPanel
          tab="regulatory"
          title="Regulatory Intelligence Agent"
          suggestedQueries={SUGGESTED}
        />
      </Box>
    </Box>
  );
}
