import React, { useState, useEffect } from 'react';
import {
  Alert, AlertTitle, Collapse, IconButton, Box, Typography, Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Celebration as CelebrationIconMui
} from '@mui/icons-material';
import { colors } from '../../styles/theme';

const StyledAlert = styled(Alert)(() => ({
  borderRadius: 16,
  border: `2px solid ${colors.semantic.success}`,
  background: `linear-gradient(135deg, ${colors.semantic.success}10 0%, ${colors.semantic.success}05 100%)`,
  boxShadow: `0 4px 12px ${colors.semantic.success}20`,
  marginBottom: 16,
  
  '& .MuiAlert-icon': {
    color: colors.semantic.success,
    fontSize: 28,
  },
  
  '& .MuiAlert-message': {
    flex: 1,
  },
}));

const StyledCelebrationIcon = styled(CelebrationIconMui)(() => ({
  color: colors.semantic.success,
  fontSize: 20,
  animation: 'bounce 0.6s ease-in-out',
  
  '@keyframes bounce': {
    '0%, 20%, 50%, 80%, 100%': {
      transform: 'translateY(0)',
    },
    '40%': {
      transform: 'translateY(-10px)',
    },
    '60%': {
      transform: 'translateY(-5px)',
    },
  },
}));

interface SectionCompletionAlertProps {
  sectionTitle: string;
  sectionNumber: string;
  completionScore: number;
  onDismiss?: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export const SectionCompletionAlert: React.FC<SectionCompletionAlertProps> = ({
  sectionTitle,
  sectionNumber,
  completionScore,
  onDismiss,
  autoHide = true,
  autoHideDelay = 5000
}) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (autoHide && autoHideDelay > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [autoHide, autoHideDelay]);

  const handleDismiss = () => {
    setShow(false);
    onDismiss?.();
  };

  const getCompletionMessage = () => {
    if (completionScore >= 100) {
      return "Perfect! This section is now 100% complete.";
    } else if (completionScore >= 90) {
      return "Excellent! This section is nearly complete.";
    } else if (completionScore >= 80) {
      return "Great progress! This section is mostly complete.";
    } else {
      return "Good work! This section is making progress.";
    }
  };

  const getCompletionColor = () => {
    if (completionScore >= 100) return colors.semantic.success;
    if (completionScore >= 90) return colors.semantic.info;
    if (completionScore >= 80) return colors.semantic.warning;
    return colors.primary.main;
  };

  return (
    <Collapse in={show}>
      <StyledAlert
        severity="success"
        icon={<CheckCircleIcon />}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={handleDismiss}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
      >
        <AlertTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <StyledCelebrationIcon />
          Section {sectionNumber} Updated!
        </AlertTitle>
        
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>{sectionTitle}</strong> - {getCompletionMessage()}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={`${completionScore}% Complete`}
              size="small"
              sx={{
                backgroundColor: getCompletionColor(),
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
            />
            
            {completionScore >= 100 && (
              <Chip
                icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                label="Ready for Review"
                size="small"
                color="success"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>
        </Box>
      </StyledAlert>
    </Collapse>
  );
};