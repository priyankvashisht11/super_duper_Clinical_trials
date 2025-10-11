import { styled } from '@mui/material/styles';
import { Chip, Badge, Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { colors } from '../../styles/theme';

// Status chips for trial recruitment status
export const StatusChip = styled(Chip)<{ status?: string }>(({ theme, status }) => {
  const getStatusStyles = (status?: string) => {
    switch (status) {
      case 'recruiting':
        return {
          backgroundColor: alpha(colors.status.recruiting, 0.1),
          color: colors.status.recruiting,
          borderColor: alpha(colors.status.recruiting, 0.3),
        };
      case 'not_yet_recruiting':
        return {
          backgroundColor: alpha(colors.status.notYetRecruiting, 0.1),
          color: colors.status.notYetRecruiting,
          borderColor: alpha(colors.status.notYetRecruiting, 0.3),
        };
      case 'completed':
        return {
          backgroundColor: alpha(colors.status.completed, 0.1),
          color: colors.status.completed,
          borderColor: alpha(colors.status.completed, 0.3),
        };
      case 'suspended':
        return {
          backgroundColor: alpha(colors.status.suspended, 0.1),
          color: colors.status.suspended,
          borderColor: alpha(colors.status.suspended, 0.3),
        };
      default:
        return {
          backgroundColor: alpha(colors.text.secondary, 0.1),
          color: colors.text.secondary,
          borderColor: alpha(colors.text.secondary, 0.3),
        };
    }
  };

  return {
    borderRadius: 16,
    fontWeight: 500,
    fontSize: '0.8125rem',
    height: 28,
    border: '1px solid',
    textTransform: 'capitalize',
    ...getStatusStyles(status),
  };
});

// Phase chips for trial phases
export const PhaseChip = styled(Chip)<{ phase?: string }>(({ theme, phase }) => {
  const getPhaseStyles = (phase?: string) => {
    switch (phase) {
      case 'I':
        return {
          backgroundColor: alpha(colors.medical.phase1, 0.1),
          color: colors.medical.phase1,
          borderColor: alpha(colors.medical.phase1, 0.3),
        };
      case 'II':
        return {
          backgroundColor: alpha(colors.medical.phase2, 0.1),
          color: colors.medical.phase2,
          borderColor: alpha(colors.medical.phase2, 0.3),
        };
      case 'III':
        return {
          backgroundColor: alpha(colors.medical.phase3, 0.1),
          color: colors.medical.phase3,
          borderColor: alpha(colors.medical.phase3, 0.3),
        };
      case 'IV':
        return {
          backgroundColor: alpha(colors.medical.phase4, 0.1),
          color: colors.medical.phase4,
          borderColor: alpha(colors.medical.phase4, 0.3),
        };
      default:
        return {
          backgroundColor: alpha(colors.medical.observational, 0.1),
          color: colors.medical.observational,
          borderColor: alpha(colors.medical.observational, 0.3),
        };
    }
  };

  return {
    borderRadius: 12,
    fontWeight: 600,
    fontSize: '0.75rem',
    height: 24,
    border: '1px solid',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    ...getPhaseStyles(phase),
  };
});

// Priority badge for important trials
export const PriorityBadge = styled(Badge)<{ priority?: 'high' | 'medium' | 'low' }>(({ theme, priority }) => {
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return colors.semantic.error;
      case 'medium': return colors.semantic.warning;
      case 'low': return colors.semantic.info;
      default: return colors.text.disabled;
    }
  };

  return {
    '& .MuiBadge-badge': {
      backgroundColor: getPriorityColor(priority),
      color: 'white',
      fontSize: '0.625rem',
      fontWeight: 600,
      minWidth: 16,
      height: 16,
    },
  };
});

// Bookmark indicator
export const BookmarkIndicator = styled(Box)<{ bookmarked?: boolean }>(({ theme, bookmarked }) => ({
  position: 'absolute',
  top: 12,
  right: 12,
  width: 0,
  height: 0,
  borderLeft: '8px solid transparent',
  borderRight: '8px solid transparent',
  borderTop: `12px solid ${bookmarked ? colors.status.active : 'transparent'}`,
  transition: 'all 0.2s ease-in-out',
}));

// Selection indicator for trial cards
export const SelectionIndicator = styled(Box)<{ selected?: boolean }>(({ theme, selected }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: 4,
  height: '100%',
  backgroundColor: selected ? colors.primary.main : 'transparent',
  borderRadius: '4px 0 0 4px',
  transition: 'all 0.2s ease-in-out',
}));

// Loading indicator
export const LoadingIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  
  '& .spinner': {
    width: 24,
    height: 24,
    border: `2px solid ${alpha(colors.primary.main, 0.2)}`,
    borderTop: `2px solid ${colors.primary.main}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  
  '@keyframes spin': {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100%': {
      transform: 'rotate(360deg)',
    },
  },
}));

// Progress indicator for document generation
export const ProgressIndicator = styled(Box)<{ progress?: number }>(({ theme, progress = 0 }) => ({
  width: '100%',
  height: 4,
  backgroundColor: alpha(colors.primary.main, 0.1),
  borderRadius: 2,
  overflow: 'hidden',
  
  '&::after': {
    content: '""',
    display: 'block',
    width: `${progress}%`,
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: 2,
    transition: 'width 0.3s ease-in-out',
  },
}));

// Online/offline status indicator
export const ConnectionStatus = styled(Box)<{ online?: boolean }>(({ theme, online = true }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(0.5, 1),
  borderRadius: 12,
  fontSize: '0.75rem',
  fontWeight: 500,
  backgroundColor: online ? alpha(colors.semantic.success, 0.1) : alpha(colors.semantic.error, 0.1),
  color: online ? colors.semantic.success : colors.semantic.error,
  
  '&::before': {
    content: '""',
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: 'currentColor',
  },
}));

// New/updated indicator
export const NewIndicator = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 8,
  right: 8,
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: colors.semantic.error,
  
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -2,
    left: -2,
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: alpha(colors.semantic.error, 0.3),
    animation: 'pulse 2s infinite',
  },
  
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(1.4)',
      opacity: 0,
    },
  },
}));

// Verification status for medical professionals
export const VerificationStatus = styled(Chip)<{ verified?: boolean }>(({ theme, verified = false }) => ({
  fontSize: '0.75rem',
  height: 24,
  backgroundColor: verified ? alpha(colors.semantic.success, 0.1) : alpha(colors.semantic.warning, 0.1),
  color: verified ? colors.semantic.success : colors.semantic.warning,
  border: `1px solid ${verified ? alpha(colors.semantic.success, 0.3) : alpha(colors.semantic.warning, 0.3)}`,
  
  '& .MuiChip-icon': {
    fontSize: '0.875rem',
    marginLeft: theme.spacing(0.5),
  },
}));

// Distance indicator for location-based results
export const DistanceIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  fontSize: '0.8125rem',
  color: colors.text.secondary,
  
  '& .distance-icon': {
    fontSize: '0.875rem',
  },
}));

// Confidence score indicator for AI matching
export const ConfidenceScore = styled(Box)<{ score?: number }>(({ theme, score = 0 }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return colors.semantic.success;
    if (score >= 60) return colors.semantic.warning;
    return colors.semantic.error;
  };

  return {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: getScoreColor(score),
    
    '&::before': {
      content: '""',
      width: 40,
      height: 4,
      backgroundColor: alpha(getScoreColor(score), 0.2),
      borderRadius: 2,
      position: 'relative',
      
      '&::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: `${score}%`,
        height: '100%',
        backgroundColor: getScoreColor(score),
        borderRadius: 2,
      },
    },
  };
});