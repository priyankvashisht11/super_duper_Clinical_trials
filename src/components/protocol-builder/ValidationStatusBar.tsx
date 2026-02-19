import React, { useState, useEffect } from 'react';
import {
  Box, Card, LinearProgress, Typography, Chip, IconButton,
  Collapse, Alert, Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { colors } from '../../styles/theme';
import { useValidation } from '../../hooks/useValidation';
import { ValidationBadge } from '../validation/ValidationBadge';

const StyledCard = styled(Card)(() => ({
  marginBottom: 16,
  borderRadius: 16,
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  '& .spin': {
    animation: 'spin 1s linear infinite',
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
}));

const StatusHeader = styled(Box)(() => ({
  padding: 16,
  borderBottom: '1px solid rgba(0,0,0,0.1)',
}));

const ValidateButton = styled(Button)(() => ({
  background: '#ffffff',
  border: `3px solid ${colors.primary.main}`,
  borderRadius: 12,
  textTransform: 'none',
  fontWeight: 700,
  fontSize: '1.1rem',
  color: colors.primary.main,
  boxShadow: `0 4px 16px ${colors.primary.main}30`,
  padding: '14px 32px',
  '&:hover': {
    background: colors.primary.main,
    color: '#ffffff',
    borderColor: colors.primary.dark,
    boxShadow: `0 6px 20px ${colors.primary.main}40`,
    transform: 'translateY(-2px)'
  },
  '&:active': {
    transform: 'translateY(0px)'
  },
  '&:disabled': {
    background: colors.text.disabled,
    borderColor: colors.text.disabled,
    color: '#ffffff',
    opacity: 0.6
  },
  transition: 'all 0.2s ease'
}));

interface ValidationStatusBarProps {
  protocolId: string;
  onValidationComplete?: (report: any) => void;
}

export const ValidationStatusBar: React.FC<ValidationStatusBarProps> = ({
  protocolId,
  onValidationComplete
}) => {
  const [expanded, setExpanded] = useState(false);
  const [report, setReport] = useState<any>(null);
  const { validateProtocol, getLatestValidation, loading } = useValidation();

  useEffect(() => {
    loadValidation();
  }, [protocolId]);

  const loadValidation = async () => {
    const latest = await getLatestValidation(protocolId);
    if (latest) {
      setReport(latest);
      onValidationComplete?.(latest);
    }
  };

  const handleValidate = async () => {
    const result = await validateProtocol(protocolId);
    if (result) {
      setReport(result);
      onValidationComplete?.(result);
    }
  };

  if (!report) {
    return (
      <StyledCard
        sx={{
          background: '#ffffff',
          border: `2px solid ${colors.primary.main}`,
          boxShadow: `0 4px 16px ${colors.primary.main}30`
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Protocol Validation
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Check compliance with ICH M11 and regulatory requirements
              </Typography>
            </Box>
          </Box>
          <ValidateButton
            fullWidth
            size="large"
            onClick={handleValidate}
            disabled={loading}
            startIcon={loading ? <RefreshIcon className="spin" /> : <CheckCircleIcon />}
          >
            {loading ? 'Validating Protocol...' : 'Validate Now'}
          </ValidateButton>
        </Box>
      </StyledCard>
    );
  }

  const completenessPercent = report.completenessScore || 0;
  const hasErrors = report.totalErrors > 0;
  const hasWarnings = report.totalWarnings > 0;

  const getStatusColor = () => {
    if (hasErrors) return colors.semantic.error;
    if (hasWarnings) return colors.semantic.warning;
    return colors.semantic.success;
  };

  const getProgressColor = () => {
    if (completenessPercent >= 90) return 'success';
    if (completenessPercent >= 70) return 'primary';
    if (completenessPercent >= 40) return 'warning';
    return 'error';
  };

  const statusColor = getStatusColor();

  return (
    <StyledCard
      sx={{
        border: `2px solid ${statusColor}30`,
      }}
    >
      {/* Header */}
      <StatusHeader
        sx={{
          background: `linear-gradient(135deg, ${statusColor}15 0%, ${statusColor}05 100%)`,
          borderBottom: `1px solid ${statusColor}20`
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2} flex={1}>
            {/* Status Icon */}
            {hasErrors ? (
              <ErrorIcon sx={{ color: colors.semantic.error, fontSize: 32 }} />
            ) : hasWarnings ? (
              <WarningIcon sx={{ color: colors.semantic.warning, fontSize: 32 }} />
            ) : (
              <CheckCircleIcon sx={{ color: colors.semantic.success, fontSize: 32 }} />
            )}

            {/* Status Info */}
            <Box flex={1}>
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <Typography variant="h6" fontWeight={700}>
                  Protocol Validation
                </Typography>
                <ValidationBadge
                  status={report.overallStatus}
                  errorCount={report.totalErrors}
                  warningCount={report.totalWarnings}
                  size="sm"
                />
              </Box>

              {/* Progress Bar */}
              <Box display="flex" alignItems="center" gap={2}>
                <Box flex={1}>
                  <LinearProgress
                    variant="determinate"
                    value={completenessPercent}
                    color={getProgressColor()}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: `${statusColor}20`
                    }}
                  />
                </Box>
                <Typography variant="body2" fontWeight={700} sx={{ minWidth: 60 }}>
                  {completenessPercent}% Complete
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Actions */}
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton
              size="small"
              onClick={handleValidate}
              disabled={loading}
              title="Re-validate"
            >
              <RefreshIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setExpanded(!expanded)}
              title={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>
      </StatusHeader>

      {/* Expanded Details */}
      <Collapse in={expanded}>
        <Box p={2}>
          <Box display="flex" gap={2} mb={2}>
            {/* Errors */}
            {report.totalErrors > 0 && (
              <Chip
                icon={<ErrorIcon />}
                label={`${report.totalErrors} Error${report.totalErrors !== 1 ? 's' : ''}`}
                color="error"
                sx={{ fontWeight: 700 }}
              />
            )}

            {/* Warnings */}
            {report.totalWarnings > 0 && (
              <Chip
                icon={<WarningIcon />}
                label={`${report.totalWarnings} Warning${report.totalWarnings !== 1 ? 's' : ''}`}
                color="warning"
                sx={{ fontWeight: 700 }}
              />
            )}

            {/* Success */}
            {report.totalErrors === 0 && report.totalWarnings === 0 && (
              <Chip
                icon={<CheckCircleIcon />}
                label="All checks passed"
                color="success"
                sx={{ fontWeight: 700 }}
              />
            )}
          </Box>

          {/* Top Issues Preview */}
          {report.issues && report.issues.length > 0 && (
            <Box>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                Top Issues:
              </Typography>
              {report.issues.slice(0, 3).map((issue: any, index: number) => (
                <Alert
                  key={index}
                  severity={issue.severity}
                  sx={{ mb: 1, fontSize: '0.875rem' }}
                  icon={false}
                >
                  <strong>Section {issue.section}:</strong> {issue.message}
                </Alert>
              ))}
              {report.issues.length > 3 && (
                <Typography variant="caption" color="text.secondary">
                  + {report.issues.length - 3} more issues
                </Typography>
              )}
            </Box>
          )}

          <Typography variant="caption" color="text.secondary" display="block" mt={2}>
            Last validated: {new Date(report.validationDate).toLocaleString()}
          </Typography>
        </Box>
      </Collapse>
    </StyledCard>
  );
};