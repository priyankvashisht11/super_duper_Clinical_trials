import React from 'react';
import { Card, CardContent, Box, Typography, Chip, Button, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Error as ErrorIcon, Warning, Info, Lightbulb, ArrowForward } from '@mui/icons-material';
import type { ValidationIssue } from '../../types/validation.types';
import { colors } from '../../styles/theme';

const IssueCard = styled(Card)<{ severity: 'error' | 'warning' | 'info' }>(({ severity }) => {
  const severityColors = {
    error: colors.semantic.error,
    warning: colors.semantic.warning,
    info: colors.semantic.info
  };

  const color = severityColors[severity];

  return {
    borderRadius: 12,
    border: `2px solid ${alpha(color, 0.3)}`,
    borderLeft: `6px solid ${color}`,
    background: '#ffffff',
    boxShadow: `0 4px 12px ${alpha(color, 0.15)}`,
    marginBottom: 16,
    transition: 'all 0.2s ease',
    
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 6px 20px ${alpha(color, 0.25)}`,
      borderColor: alpha(color, 0.5),
    },
  };
});

const SeverityChip = styled(Chip)<{ severity: 'error' | 'warning' | 'info' }>(({ severity }) => {
  const severityStyles = {
    error: {
      backgroundColor: alpha(colors.semantic.error, 0.15),
      color: colors.semantic.error,
      border: `2px solid ${colors.semantic.error}`,
      fontWeight: 800,
    },
    warning: {
      backgroundColor: alpha(colors.semantic.warning, 0.15),
      color: colors.semantic.warning,
      border: `2px solid ${colors.semantic.warning}`,
      fontWeight: 800,
    },
    info: {
      backgroundColor: alpha(colors.semantic.info, 0.15),
      color: colors.semantic.info,
      border: `2px solid ${colors.semantic.info}`,
      fontWeight: 800,
    }
  };

  return {
    height: 26,
    fontSize: '0.75rem',
    fontWeight: 800,
    borderRadius: 6,
    ...severityStyles[severity],
  };
});

const BlockingChip = styled(Chip)(() => ({
  height: 24,
  fontSize: '0.75rem',
  fontWeight: 700,
  borderRadius: 6,
  backgroundColor: colors.text.primary,
  color: colors.background.paper,
  '& .MuiChip-label': {
    paddingLeft: 8,
    paddingRight: 8,
  },
}));

const RuleIdChip = styled(Chip)(() => ({
  height: 24,
  fontSize: '0.75rem',
  fontFamily: 'monospace',
  borderRadius: 6,
  backgroundColor: alpha(colors.text.secondary, 0.1),
  color: colors.text.secondary,
  border: `1px solid ${alpha(colors.text.secondary, 0.2)}`,
}));

const SuggestionBox = styled(Box)(() => ({
  marginTop: 12,
  padding: 12,
  borderRadius: 8,
  backgroundColor: alpha(colors.semantic.info, 0.05),
  border: `1px solid ${alpha(colors.semantic.info, 0.1)}`,
  display: 'flex',
  alignItems: 'flex-start',
  gap: 8,
}));

const NavigateButton = styled(Button)(() => ({
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.75rem',
  padding: '4px 12px',
  minWidth: 'auto',
}));

interface ValidationIssueCardProps {
  issue: ValidationIssue;
  onNavigate?: (section: string) => void;
}

export const ValidationIssueCard: React.FC<ValidationIssueCardProps> = ({
  issue,
  onNavigate
}) => {
  const getSeverityIcon = () => {
    switch (issue.severity) {
      case 'error':
        return <ErrorIcon sx={{ fontSize: 16 }} />;
      case 'warning':
        return <Warning sx={{ fontSize: 16 }} />;
      case 'info':
        return <Info sx={{ fontSize: 16 }} />;
    }
  };

  return (
    <IssueCard severity={issue.severity}>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <SeverityChip
              icon={getSeverityIcon()}
              label={issue.severity.toUpperCase()}
              severity={issue.severity}
              size="small"
              variant="outlined"
            />
            <RuleIdChip
              label={issue.ruleId}
              size="small"
              variant="outlined"
            />
            {issue.blocking && (
              <BlockingChip
                label="BLOCKING"
                size="small"
              />
            )}
          </Box>
          <NavigateButton
            onClick={() => onNavigate?.(issue.section)}
            color="primary"
            variant="outlined"
            size="small"
            endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
          >
            Section {issue.section}
          </NavigateButton>
        </Box>

        {/* Message */}
        <Typography 
          variant="body1" 
          fontWeight={600} 
          color="text.primary"
          sx={{ 
            mb: issue.suggestion ? 0 : 1,
            fontSize: '0.95rem',
            lineHeight: 1.6,
          }}
        >
          {issue.message}
        </Typography>

        {/* Suggestion */}
        {issue.suggestion && (
          <SuggestionBox>
            <Lightbulb sx={{ fontSize: 18, color: colors.semantic.info, mt: 0.25 }} />
            <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
              {issue.suggestion}
            </Typography>
          </SuggestionBox>
        )}

        {/* Field */}
        {issue.field && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Field: <code style={{ 
              backgroundColor: alpha(colors.text.secondary, 0.1), 
              padding: '2px 6px', 
              borderRadius: 4,
              fontFamily: 'monospace',
              fontSize: '0.75rem'
            }}>{issue.field}</code>
          </Typography>
        )}
      </CardContent>
    </IssueCard>
  );
};
