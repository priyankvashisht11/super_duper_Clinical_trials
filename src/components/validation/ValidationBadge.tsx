import React from 'react';
import { Chip, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CheckCircle, Warning, Error as ErrorIcon } from '@mui/icons-material';
import type { ValidationStatus } from '../../types/validation.types';
import { colors } from '../../styles/theme';

const StyledChip = styled(Chip)<{ validationstatus: ValidationStatus; badgesize: 'sm' | 'md' | 'lg' }>(
  ({ validationstatus, badgesize }) => {
    const sizeStyles = {
      sm: { height: 24, fontSize: '0.75rem', '& .MuiChip-icon': { fontSize: 16 } },
      md: { height: 32, fontSize: '0.875rem', '& .MuiChip-icon': { fontSize: 18 } },
      lg: { height: 40, fontSize: '1rem', '& .MuiChip-icon': { fontSize: 20 } }
    };

    const statusStyles = {
      valid: {
        backgroundColor: alpha(colors.semantic.success, 0.1),
        color: colors.semantic.success,
        border: `1px solid ${alpha(colors.semantic.success, 0.3)}`,
        '& .MuiChip-icon': { color: colors.semantic.success }
      },
      valid_with_warnings: {
        backgroundColor: alpha(colors.semantic.warning, 0.1),
        color: colors.semantic.warning,
        border: `1px solid ${alpha(colors.semantic.warning, 0.3)}`,
        '& .MuiChip-icon': { color: colors.semantic.warning }
      },
      invalid: {
        backgroundColor: alpha(colors.semantic.error, 0.1),
        color: colors.semantic.error,
        border: `1px solid ${alpha(colors.semantic.error, 0.3)}`,
        '& .MuiChip-icon': { color: colors.semantic.error }
      }
    };

    return {
      fontWeight: 600,
      borderRadius: 20,
      ...sizeStyles[badgesize],
      ...statusStyles[validationstatus],
    };
  }
);

interface ValidationBadgeProps {
  status: ValidationStatus;
  errorCount?: number;
  warningCount?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const ValidationBadge: React.FC<ValidationBadgeProps> = ({
  status,
  errorCount = 0,
  warningCount = 0,
  size = 'md'
}) => {
  const getIcon = () => {
    switch (status) {
      case 'valid':
        return <CheckCircle />;
      case 'valid_with_warnings':
        return <Warning />;
      case 'invalid':
        return <ErrorIcon />;
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'valid':
        return 'Valid';
      case 'valid_with_warnings':
        return `${warningCount} Warning${warningCount !== 1 ? 's' : ''}`;
      case 'invalid':
        return `${errorCount} Error${errorCount !== 1 ? 's' : ''}`;
    }
  };

  return (
    <StyledChip
      icon={getIcon()}
      label={getLabel()}
      validationstatus={status}
      badgesize={size}
      variant="outlined"
    />
  );
};
