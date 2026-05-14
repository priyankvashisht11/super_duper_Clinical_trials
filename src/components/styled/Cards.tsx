import { styled } from '@mui/material/styles';
import { Card, CardContent, CardActions } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { colors } from '../../styles/theme';

// Base card components
export const BaseCard = styled(Card)(() => ({
  borderRadius: 12,
  border: `1px solid ${colors.border.light}`,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  transition: 'all 0.2s ease-in-out',
  
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    transform: 'translateY(-2px)',
    borderColor: colors.border.main,
  },
}));

export const TrialCard = styled(BaseCard)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  cursor: 'pointer',
  position: 'relative',
  
  '&.selected': {
    borderColor: colors.primary.main,
    backgroundColor: alpha(colors.primary.main, 0.02),
    
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: 4,
      height: '100%',
      backgroundColor: colors.primary.main,
      borderRadius: '4px 0 0 4px',
    },
  },
  
  '&.bookmarked': {
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 12,
      right: 12,
      width: 0,
      height: 0,
      borderLeft: '8px solid transparent',
      borderRight: '8px solid transparent',
      borderTop: `12px solid ${colors.status.active}`,
    },
  },
}));

export const TrialCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
  
  '&:last-child': {
    paddingBottom: theme.spacing(3),
  },
  
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    
    '&:last-child': {
      paddingBottom: theme.spacing(2),
    },
  },
}));

export const TrialCardActions = styled(CardActions)(({ theme }) => ({
  padding: `0 ${theme.spacing(3)} ${theme.spacing(2)}`,
  gap: theme.spacing(1),
  
  [theme.breakpoints.down('sm')]: {
    padding: `0 ${theme.spacing(2)} ${theme.spacing(2)}`,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
}));

// Feature cards for landing page
export const FeatureCard = styled(BaseCard)(() => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'center',
  
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
  },
}));

export const FeatureCardContent = styled(CardContent)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(4),
  
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
  },
}));

// Document preview card
export const DocumentCard = styled(BaseCard)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  
  '& .document-header': {
    backgroundColor: colors.background.surface,
    borderBottom: `1px solid ${colors.border.light}`,
  },
  
  '& .document-content': {
    flex: 1,
    padding: theme.spacing(3),
    fontFamily: 'Georgia, serif',
    lineHeight: 1.6,
    
    '& h1, & h2, & h3': {
      color: colors.text.primary,
      marginBottom: theme.spacing(2),
    },
    
    '& p': {
      marginBottom: theme.spacing(2),
      color: colors.text.secondary,
    },
    
    '& .citation': {
      fontSize: '0.875rem',
      color: colors.text.disabled,
      fontStyle: 'italic',
    },
  },
}));

// Filter group cards
export const FilterGroupCard = styled(BaseCard)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  boxShadow: 'none',
  border: `1px solid ${colors.border.light}`,
  
  '&:hover': {
    transform: 'none',
    boxShadow: 'none',
  },
  
  '& .filter-header': {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${colors.border.light}`,
    cursor: 'pointer',
    
    '&:hover': {
      backgroundColor: alpha(colors.primary.main, 0.02),
    },
  },
  
  '& .filter-content': {
    padding: theme.spacing(2),
  },
}));

// Stats cards
export const StatsCard = styled(BaseCard)(({ theme }) => ({
  textAlign: 'center',
  
  '& .stats-number': {
    fontSize: '2.5rem',
    fontWeight: 700,
    color: colors.primary.main,
    lineHeight: 1,
  },
  
  '& .stats-label': {
    fontSize: '0.875rem',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: theme.spacing(1),
  },
}));

// Hero section card
export const HeroCard = styled(BaseCard)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.primary.light} 0%, ${alpha(colors.primary.main, 0.1)} 100%)`,
  border: `1px solid ${alpha(colors.primary.main, 0.2)}`,
  padding: theme.spacing(6),
  textAlign: 'center',
  
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(4),
  },
  
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
  },
}));

// Compact card for mobile
export const CompactCard = styled(BaseCard)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    borderRadius: 8,
    margin: theme.spacing(1, 0),
    
    '& .MuiCardContent-root': {
      padding: theme.spacing(2),
      
      '&:last-child': {
        paddingBottom: theme.spacing(2),
      },
    },
  },
}));