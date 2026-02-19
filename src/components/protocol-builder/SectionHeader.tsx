import React from 'react';
import {
  Box, Typography, Chip, LinearProgress, IconButton, Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { colors } from '../../styles/theme';

const HeaderContainer = styled(Box)(() => ({
  marginBottom: 24,
  padding: 24,
  borderRadius: 16,
  background: `linear-gradient(135deg, ${colors.primary.light}08 0%, ${colors.secondary.light}05 100%)`,
  border: `1px solid ${colors.primary.light}20`,
}));

const SectionTitle = styled(Typography)(() => ({
  fontWeight: 700,
  fontSize: '1.75rem',
  background: `linear-gradient(45deg, ${colors.primary.main}, ${colors.secondary.main})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  marginBottom: 8,
}));

const ValidationSummary = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  marginTop: 16,
  padding: 16,
  borderRadius: 12,
  background: 'rgba(255, 255, 255, 0.7)',
  border: '1px solid rgba(0, 0, 0, 0.1)',
}));

interface SectionValidationStatus {
  complete: boolean;
  completionScore: number;
  errors: number;
  warnings: number;
  lastValidated?: string;
}

interface SectionHeaderProps {
  sectionNumber: string;
  sectionTitle: string;
  description?: string;
  icon?: React.ReactNode;
  validationStatus?: SectionValidationStatus;
  onValidate?: () => void;
  validating?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  sectionNumber,
  sectionTitle,
  description,
  icon,
  validationStatus,
  onValidate,
  validating = false
}) => {
  const getStatusColor = () => {
    if (!validationStatus) return colors.text.disabled;
    if (validationStatus.errors > 0) return colors.semantic.error;
    if (validationStatus.warnings > 0) return colors.semantic.warning;
    if (validationStatus.complete) return colors.semantic.success;
    return colors.semantic.info;
  };

  const getStatusIcon = () => {
    if (!validationStatus) return <InfoIcon />;
    if (validationStatus.errors > 0) return <ErrorIcon />;
    if (validationStatus.warnings > 0) return <WarningIcon />;
    if (validationStatus.complete) return <CheckCircleIcon />;
    return <InfoIcon />;
  };

  const getProgressColor = (): 'primary' | 'success' | 'warning' | 'error' => {
    if (!validationStatus) return 'primary';
    const score = validationStatus.completionScore || 0;
    if (score >= 90) return 'success';
    if (score >= 70) return 'primary';
    if (score >= 40) return 'warning';
    return 'error';
  };

  const statusColor = getStatusColor();

  return (
    <HeaderContainer>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            {icon && (
              <Box sx={{ 
                color: colors.primary.main,
                display: 'flex',
                alignItems: 'center',
                fontSize: 28
              }}>
                {icon}
              </Box>
            )}
            <SectionTitle>
              Section {sectionNumber}: {sectionTitle}
            </SectionTitle>
          </Box>
          
          {description && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {description}
            </Typography>
          )}
        </Box>

        {onValidate && (
          <Tooltip title="Re-validate section">
            <IconButton
              onClick={onValidate}
              disabled={validating}
              sx={{
                background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
                color: '#ffffff',
                '&:hover': {
                  background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.secondary.dark} 100%)`,
                },
                '&:disabled': {
                  background: colors.text.disabled,
                  color: '#ffffff',
                }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {validationStatus && (
        <ValidationSummary>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ color: statusColor, display: 'flex', alignItems: 'center' }}>
              {getStatusIcon()}
            </Box>
            <Typography variant="body2" fontWeight={600}>
              Validation Status
            </Typography>
          </Box>

          <Box sx={{ flex: 1, mx: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Box sx={{ flex: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={validationStatus.completionScore || 0}
                  color={getProgressColor()}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: `${statusColor}20`
                  }}
                />
              </Box>
              <Typography variant="body2" fontWeight={700} sx={{ minWidth: 60 }}>
                {validationStatus.completionScore || 0}%
              </Typography>
            </Box>
            
            {validationStatus.lastValidated && (
              <Typography variant="caption" color="text.secondary">
                Last validated: {new Date(validationStatus.lastValidated).toLocaleString()}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {validationStatus.errors > 0 && (
              <Chip
                icon={<ErrorIcon sx={{ fontSize: 14 }} />}
                label={`${validationStatus.errors} Error${validationStatus.errors !== 1 ? 's' : ''}`}
                size="small"
                color="error"
                sx={{ fontSize: '0.75rem', fontWeight: 600 }}
              />
            )}
            
            {validationStatus.warnings > 0 && (
              <Chip
                icon={<WarningIcon sx={{ fontSize: 14 }} />}
                label={`${validationStatus.warnings} Warning${validationStatus.warnings !== 1 ? 's' : ''}`}
                size="small"
                color="warning"
                sx={{ fontSize: '0.75rem', fontWeight: 600 }}
              />
            )}
            
            {validationStatus.errors === 0 && validationStatus.warnings === 0 && validationStatus.complete && (
              <Chip
                icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                label="Complete"
                size="small"
                color="success"
                sx={{ fontSize: '0.75rem', fontWeight: 600 }}
              />
            )}
          </Box>
        </ValidationSummary>
      )}
    </HeaderContainer>
  );
};