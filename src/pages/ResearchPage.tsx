
import { Box } from '@mui/material';
import { TopNavigation } from '../components/layout/TopNavigation';
import { AgentChatPanel } from '../components/agent/AgentChatPanel';

const SUGGESTED = [
  'Find Phase 3 recruiting trials for NSCLC in India with immunotherapy arm',
  'CAR-T therapy outcomes in relapsed DLBCL 2023–2024 — latest trials',
  'Compare pembrolizumab vs nivolumab efficacy in gastric adenocarcinoma',
  'CTRI trials enrolling diabetes patients in tier-2 Indian cities',
  'Biomarkers predicting response to EGFR inhibitors in lung cancer',
  'Safety profile of CAR-T in elderly patients: recent literature',
];

export function ResearchPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', bgcolor: '#F9FAFB' }}>
      <TopNavigation />
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <AgentChatPanel
          tab="research"
          title="Research Intelligence Agent"
          suggestedQueries={SUGGESTED}
        />
      </Box>
    </Box>
  );
}
