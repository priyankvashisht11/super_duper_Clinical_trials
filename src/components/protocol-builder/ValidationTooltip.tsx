import React, { useState } from 'react';
import {
  Tooltip, Box, Typography, Chip, IconButton, Fade, Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { colors } from '../../styles/theme';

const StyledTooltip = styled(Tooltip)(() => ({
  '& .MuiTooltip-tooltip': {
    backgroundColor: 'transparent',
    padding: 0,
    maxWidth: 320,
  },
}));

const TooltipContent = styled(Paper)<{ severity: 'error' | 'warning' | 'success' | 'info' }>(({ severity }) => {
  const getColors = () => {
    switch (severity) {
      case 'error':
        return {
          bg: colors.semantic.error,
          border: colors.semantic.error,
          icon: colors.semantic.error,
        };
      case 'warning':
        return {
          bg: colors.semantic.warning,
          border: colors.semantic.warning,
          icon: colors.semantic.warning,
        };
      case 'success':
        return {
          bg: colors.semantic.success,
          border: colors.semantic.success,
          icon: colors.semantic.success,
        };
      case 'info':
      default:
        return {
          bg: colors.semantic.info,
          border: colors.semantic.info,
          icon: colors.semantic.info,
        };
    }
  };

  const colorScheme = getColors();

  return {
    padding: 12,
    borderRadius: 12,
    border: `2px solid ${colorScheme.border}`,
    background: `linear-gradient(135deg, ${colorScheme.bg}15 0%, ${colorScheme.bg}05 100%)`,
    boxShadow: `0 4px 12px ${colorScheme.bg}20`,
    maxWidth: 320,
  };
});

const TooltipHeader = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 8,
}));

const TooltipTitle = styled(Typography)(() => ({
  fontWeight: 700,
  fontSize: '0.875rem',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
}));

interface ValidationIssue {
  id: string;
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
}

interface ValidationTooltipProps {
  children: React.ReactElement;
  issues: ValidationIssue[];
  fieldName?: string;
  open?: boolean;
  onClose?: () => void;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  showOnHover?: boolean;
}

export const ValidationTooltip: React.FC<ValidationTooltipProps> = ({
  children,
  issues,
  fieldName,
  open: controlledOpen,
  onClose,
  placement = 'top',
  showOnHover = true
}) => {
  const [internalOpen, setInternalOpen] = useState(false);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const handleOpen = () => {
    if (controlledOpen === undefined && showOnHover) {
      setInternalOpen(true);
    }
  };

  const handleClose = () => {
    if (controlledOpen === undefined) {
      setInternalOpen(false);
    }
    onClose?.();
  };

  if (!issues || issues.length === 0) {
    return children;
  }

  const primaryIssue = issues[0];
  const hasErrors = issues.some(issue => issue.severity === 'error');
  const hasWarnings = issues.some(issue => issue.severity === 'warning');
  
  const severity = hasErrors ? 'error' : hasWarnings ? 'warning' : 'info';

  const getIcon = (sev: string) => {
    switch (sev) {
      case 'error':
        return <ErrorIcon sx={{ fontSize: 16 }} />;
      case 'warning':
        return <WarningIcon sx={{ fontSize: 16 }} />;
      case 'success':
        return <CheckCircleIcon sx={{ fontSize: 16 }} />;
      case 'info':
      default:
        return <InfoIcon sx={{ fontSize: 16 }} />;
    }
  };

  const tooltipContent = (
    <TooltipContent severity={severity}>
      <TooltipHeader>
        <TooltipTitle>
          {getIcon(severity)}
          {fieldName ? `${fieldName} Issues` : 'Validation Issues'}
        </TooltipTitle>
        
        {onClose && (
          <IconButton
            size="small"
            onClick={handleClose}
            sx={{ 
              padding: 0.5,
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.1)' }
            }}
          >
            <CloseIcon sx={{ fontSize: 14 }} />
          </IconButton>
        )}
      </TooltipHeader>

      <Box sx={{ mb: 1 }}>
        <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
          {hasErrors && (
            <Chip
              icon={<ErrorIcon sx={{ fontSize: 12 }} />}
              label={`${issues.filter(i => i.severity === 'error').length} Error${issues.filter(i => i.severity === 'error').length !== 1 ? 's' : ''}`}
              size="small"
              color="error"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          )}
          {hasWarnings && (
            <Chip
              icon={<WarningIcon sx={{ fontSize: 12 }} />}
              label={`${issues.filter(i => i.severity === 'warning').length} Warning${issues.filter(i => i.severity === 'warning').length !== 1 ? 's' : ''}`}
              size="small"
              color="warning"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          )}
        </Box>
      </Box>

      <Box>
        {issues.slice(0, 3).map((issue, index) => (
          <Box key={issue.id} sx={{ mb: index < Math.min(issues.length, 3) - 1 ? 1 : 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              {getIcon(issue.severity)}
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.3 }}>
                  {issue.message}
                </Typography>
                {issue.suggestion && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: '0.75rem', 
                      color: 'text.secondary',
                      fontStyle: 'italic',
                      display: 'block',
                      mt: 0.5
                    }}
                  >
                    💡 {issue.suggestion}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        ))}
        
        {issues.length > 3 && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mt: 1, display: 'block' }}>
            + {issues.length - 3} more issue{issues.length - 3 !== 1 ? 's' : ''}
          </Typography>
        )}
      </Box>
    </TooltipContent>
  );

  return (
    <StyledTooltip
      title={tooltipContent}
      open={isOpen}
      onOpen={handleOpen}
      onClose={handleClose}
      placement={placement}
      arrow
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 200 }}
      disableHoverListener={!showOnHover}
      disableFocusListener={!showOnHover}
      disableTouchListener={!showOnHover}
    >
      {children}
    </StyledTooltip>
  );
};