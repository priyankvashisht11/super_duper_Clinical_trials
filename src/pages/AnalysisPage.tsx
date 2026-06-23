
import { Box } from '@mui/material';
import { TopNavigation } from '../components/layout';
import { AgentChatPanel } from '../components/agent/AgentChatPanel';

const SUGGESTED = [
  'Run interim analysis on the primary endpoint — time-to-event with Kaplan-Meier',
  'Calculate sample size for 80% power at 5% significance for my Phase 2 trial',
  'Compare baseline demographics across treatment arms — any imbalances?',
  'Generate a CONSORT-style patient flow diagram from my enrolment data',
  'Summarise overall response rate and disease control rate across all evaluable patients',
  'Perform subgroup analysis by ECOG status and prior lines of therapy',
];

export function AnalysisPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', bgcolor: '#F9FAFB' }}>
      <TopNavigation />
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <AgentChatPanel
          tab="analysis"
          title="Clinical Analysis Agent"
          suggestedQueries={SUGGESTED}
        />
      </Box>
    </Box>
  );
}
