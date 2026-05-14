import {
  Science as ScienceIcon,
  Description as DescriptionIcon,
  VerifiedUser as VerifiedUserIcon,
  Groups as GroupsIcon,
  Analytics as AnalyticsIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';

export interface TrialStage {
  id: string;
  label: string;
  Icon: SvgIconComponent;
  color: string;
  bgColor: string;
  description: string;
  route: string;
}

export const TRIAL_STAGES: TrialStage[] = [
  {
    id: 'research',
    label: 'Research',
    Icon: ScienceIcon,
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    description: 'Literature synthesis & landscape analysis across PubMed, CTRI, ICMR',
    route: 'research',
  },
  {
    id: 'protocol',
    label: 'Protocol',
    Icon: DescriptionIcon,
    color: '#0047AB',
    bgColor: '#EFF6FF',
    description: 'AI-guided ICH M11 protocol design with compliance built-in',
    route: 'protocol',
  },
  {
    id: 'regulatory',
    label: 'Regulatory',
    Icon: VerifiedUserIcon,
    color: '#D97706',
    bgColor: '#FFFBEB',
    description: 'CTRI registration, CDSCO Form 44, ICMR ethics & GCP compliance',
    route: 'regulatory',
  },
  {
    id: 'execute',
    label: 'Execute',
    Icon: GroupsIcon,
    color: '#059669',
    bgColor: '#ECFDF5',
    description: 'Patient enrollment, eCRF data collection & site coordination',
    route: 'execute',
  },
  {
    id: 'analyze',
    label: 'Analyze',
    Icon: AnalyticsIcon,
    color: '#0284C7',
    bgColor: '#F0F9FF',
    description: 'AI-powered trial insights, safety monitoring & interim analysis',
    route: 'analyze',
  },
  {
    id: 'submit',
    label: 'Submit',
    Icon: SendIcon,
    color: '#6D28D9',
    bgColor: '#F5F3FF',
    description: 'Final reporting, regulatory submission package & audit trail',
    route: 'submit',
  },
];
