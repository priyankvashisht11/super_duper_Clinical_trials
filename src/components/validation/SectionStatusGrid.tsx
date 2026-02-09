import React from 'react';
import { Card, CardContent, Box, Typography, Chip, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CheckCircle, Error as ErrorIcon, Warning, Schedule } from '@mui/icons-material';
import type { SectionStatus } from '../../types/validation.types';
import { colors } from '../../styles/theme';

const SectionCard = styled(Card)<{ sectionstatus: string }>(({ sectionstatus }) => {
  const statusColors = {
    complete: colors.semantic.success,
    invalid: colors.semantic.error,
    warning: colors.semantic.warning,
    incomplete: colors.text.disabled,
  };

  const color = statusColors[sectionstatus as keyof typeof statusColors] || colors.text.disabled;

  return {
    borderRadius: 12,
    border: `2px solid ${alpha(color, 0.2)}`,
    background: `linear-gradient(135deg, ${alpha(color, 0.02)} 0%, ${alpha(color, 0.05)} 100%)`,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    height: '100%',
    
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: `0 8px 25px ${alpha(color, 0.15)}`,
      borderColor: alpha(color, 0.4),
    },
  };
});

const StatusIcon = styled(Box)<{ sectionstatus: string }>(({ sectionstatus }) => {
  const statusColors = {
    complete: colors.semantic.success,
    invalid: colors.semantic.error,
    warning: colors.semantic.warning,
    incomplete: colors.text.disabled,
  };

  const color = statusColors[sectionstatus as keyof typeof statusColors] || colors.text.disabled;

  return {
    width: 40,
    height: 40,
    borderRadius: '50%',
    backgroundColor: alpha(color, 0.1),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: color,
  };
});

const SectionNumber = styled(Chip)(() => ({
  height: 24,
  fontSize: '0.75rem',
  fontWeight: 700,
  borderRadius: 6,
  backgroundColor: alpha(colors.text.secondary, 0.1),
  color: colors.text.secondary,
  border: `1px solid ${alpha(colors.text.secondary, 0.2)}`,
}));

const StatusChip = styled(Chip)<{ chipstatus: 'error' | 'warning' | 'complete' }>(({ chipstatus }) => {
  const statusStyles = {
    error: {
      backgroundColor: alpha(colors.semantic.error, 0.1),
      color: colors.semantic.error,
      border: `1px solid ${alpha(colors.semantic.error, 0.3)}`,
    },
    warning: {
      backgroundColor: alpha(colors.semantic.warning, 0.1),
      color: colors.semantic.warning,
      border: `1px solid ${alpha(colors.semantic.warning, 0.3)}`,
    },
    complete: {
      backgroundColor: alpha(colors.semantic.success, 0.1),
      color: colors.semantic.success,
      border: `1px solid ${alpha(colors.semantic.success, 0.3)}`,
    }
  };

  return {
    height: 20,
    fontSize: '0.7rem',
    fontWeight: 700,
    borderRadius: 4,
    ...statusStyles[chipstatus],
  };
});

interface SectionStatusGridProps {
  sections: Record<string, SectionStatus>;
  onSectionClick?: (sectionNumber: string) => void;
}

export const SectionStatusGrid: React.FC<SectionStatusGridProps> = ({
  sections,
  onSectionClick
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle sx={{ fontSize: 24 }} />;
      case 'invalid':
        return <ErrorIcon sx={{ fontSize: 24 }} />;
      case 'warning':
        return <Warning sx={{ fontSize: 24 }} />;
      case 'incomplete':
      default:
        return <Schedule sx={{ fontSize: 24 }} />;
    }
  };

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
      {Object.entries(sections).map(([sectionNumber, status]) => (
        <SectionCard 
          key={sectionNumber}
          sectionstatus={status.status}
          onClick={() => onSectionClick?.(sectionNumber)}
        >
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <StatusIcon sectionstatus={status.status}>
                {getStatusIcon(status.status)}
              </StatusIcon>
              <SectionNumber
                label={`Section ${sectionNumber}`}
                size="small"
                variant="outlined"
              />
            </Box>
            
            {/* Title */}
            <Typography 
              variant="body2" 
              fontWeight={600} 
              color="text.primary"
              sx={{ 
                mb: 2, 
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.3,
                minHeight: '2.6em'
              }}
            >
              {status.title}
            </Typography>
            
            {/* Status Chips */}
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {status.errors > 0 && (
                <StatusChip
                  chipstatus="error"
                  label={`${status.errors} error${status.errors !== 1 ? 's' : ''}`}
                  size="small"
                  variant="outlined"
                />
              )}
              {status.warnings > 0 && (
                <StatusChip
                  chipstatus="warning"
                  label={`${status.warnings} warning${status.warnings !== 1 ? 's' : ''}`}
                  size="small"
                  variant="outlined"
                />
              )}
              {status.errors === 0 && status.warnings === 0 && status.complete && (
                <StatusChip
                  chipstatus="complete"
                  label="Complete"
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </CardContent>
        </SectionCard>
      ))}
    </Box>
  );
};
