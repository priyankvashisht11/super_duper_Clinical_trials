
import { Box } from '@mui/material';
import { TopNavigation } from '../components/layout';
import { AgentChatPanel } from '../components/agent/AgentChatPanel';

const SUGGESTED = [
  'Review my EDC data for missing values in the primary endpoint fields',
  'Identify protocol deviations in Visit 3 data across all sites',
  'Flag AE entries that lack required SAE narrative for CDSCO reporting',
  'Summarise query resolution status — how many outstanding queries per site?',
  'Audit trail review — show me data modifications in the last 7 days',
  'Cross-check lab values against normal ranges and flag out-of-window visits',
];

export function EDCPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', bgcolor: '#F9FAFB' }}>
      <TopNavigation />
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <AgentChatPanel
          tab="edc"
          title="EDC Data Intelligence Agent"
          suggestedQueries={SUGGESTED}
        />
      </Box>
    </Box>
  );
}
