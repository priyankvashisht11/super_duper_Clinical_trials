import { styled } from '@mui/material/styles';
import { Typography } from '@mui/material';
import { colors } from '../../styles/theme';

// Page titles
export const PageTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 700,
  color: colors.text.primary,
  marginBottom: theme.spacing(3),
  
  [theme.breakpoints.down('md')]: {
    fontSize: '1.75rem',
    marginBottom: theme.spacing(2),
  },
  
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.5rem',
  },
}));

// Section titles
export const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 600,
  color: colors.text.primary,
  marginBottom: theme.spacing(2),
  
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.25rem',
  },
}));

// Card titles
export const CardTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.125rem',
  fontWeight: 600,
  color: colors.text.primary,
  marginBottom: theme.spacing(1),
  lineHeight: 1.4,
}));

// Subtitle text
export const Subtitle = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 400,
  color: colors.text.secondary,
  lineHeight: 1.5,
}));

// Body text with medical styling
export const BodyText = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  fontWeight: 400,
  color: colors.text.primary,
  lineHeight: 1.6,
  marginBottom: theme.spacing(2),
  
  '&:last-child': {
    marginBottom: 0,
  },
}));

// Caption text for metadata
export const CaptionText = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 400,
  color: colors.text.secondary,
  lineHeight: 1.43,
}));

// Small text for fine print
export const SmallText = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  fontWeight: 400,
  color: colors.text.disabled,
  lineHeight: 1.66,
}));

// Overline text for labels
export const OverlineText = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  fontWeight: 500,
  color: colors.text.secondary,
  textTransform: 'uppercase',
  letterSpacing: '0.08333em',
  lineHeight: 2.66,
}));

// Hero title for landing page
export const HeroTitle = styled(Typography)(({ theme }) => ({
  fontSize: '3rem',
  fontWeight: 700,
  color: colors.text.primary,
  textAlign: 'center',
  marginBottom: theme.spacing(3),
  lineHeight: 1.2,
  
  [theme.breakpoints.down('lg')]: {
    fontSize: '2.5rem',
  },
  
  [theme.breakpoints.down('md')]: {
    fontSize: '2rem',
  },
  
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.75rem',
    marginBottom: theme.spacing(2),
  },
}));

// Hero subtitle
export const HeroSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.25rem',
  fontWeight: 400,
  color: colors.text.secondary,
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  lineHeight: 1.5,
  maxWidth: '600px',
  margin: `0 auto ${theme.spacing(4)}px`,
  
  [theme.breakpoints.down('md')]: {
    fontSize: '1.125rem',
    marginBottom: theme.spacing(3),
  },
  
  [theme.breakpoints.down('sm')]: {
    fontSize: '1rem',
    marginBottom: theme.spacing(2),
  },
}));

// CTRI number styling
export const CTRINumber = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 500,
  color: colors.primary.main,
  fontFamily: 'Monaco, Consolas, monospace',
  backgroundColor: colors.primary.light,
  padding: '2px 8px',
  borderRadius: 4,
  display: 'inline-block',
}));

// Trial phase text
export const PhaseText = styled(Typography)<{ phase?: string }>(({ theme, phase }) => {
  const getPhaseColor = (phase?: string) => {
    switch (phase) {
      case 'I': return colors.medical.phase1;
      case 'II': return colors.medical.phase2;
      case 'III': return colors.medical.phase3;
      case 'IV': return colors.medical.phase4;
      default: return colors.medical.observational;
    }
  };

  return {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: getPhaseColor(phase),
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };
});

// Status text with color coding
export const StatusText = styled(Typography)<{ status?: string }>(({ theme, status }) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'recruiting': return colors.status.recruiting;
      case 'not_yet_recruiting': return colors.status.notYetRecruiting;
      case 'completed': return colors.status.completed;
      case 'suspended': return colors.status.suspended;
      default: return colors.text.secondary;
    }
  };

  return {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: getStatusColor(status),
    textTransform: 'capitalize',
  };
});

// Highlighted text for search results
export const HighlightedText = styled('span')(({ theme }) => ({
  backgroundColor: colors.status.notYetRecruiting,
  color: 'white',
  padding: '1px 4px',
  borderRadius: 2,
  fontWeight: 500,
}));

// Link text
export const LinkText = styled(Typography)(({ theme }) => ({
  color: colors.primary.main,
  textDecoration: 'none',
  cursor: 'pointer',
  
  '&:hover': {
    textDecoration: 'underline',
  },
}));

// Error text
export const ErrorText = styled(Typography)(({ theme }) => ({
  color: colors.semantic.error,
  fontSize: '0.875rem',
  fontWeight: 400,
  marginTop: theme.spacing(0.5),
}));

// Success text
export const SuccessText = styled(Typography)(({ theme }) => ({
  color: colors.semantic.success,
  fontSize: '0.875rem',
  fontWeight: 400,
  marginTop: theme.spacing(0.5),
}));

// Truncated text with ellipsis
export const TruncatedText = styled(Typography)<{ lines?: number }>(({ theme, lines = 2 }) => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

// Medical terminology text
export const MedicalText = styled(Typography)(({ theme }) => ({
  fontFamily: 'Georgia, serif',
  fontSize: '0.9375rem',
  lineHeight: 1.6,
  color: colors.text.primary,
}));

// Citation text
export const CitationText = styled(Typography)(({ theme }) => ({
  fontSize: '0.8125rem',
  fontStyle: 'italic',
  color: colors.text.disabled,
  lineHeight: 1.5,
  
  '& a': {
    color: colors.primary.main,
    textDecoration: 'none',
    
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));