import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, List, ListItemButton, Chip, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CheckCircle, RadioButtonUnchecked, FiberManualRecord, Error as ErrorIcon, Warning as WarningIcon } from '@mui/icons-material';
import { useValidation } from '../../hooks/useValidation';
import { colors } from '../../styles/theme';

const NavContainer = styled(Box)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: '#ffffff',
});

const NavHeader = styled(Box)(() => ({
  padding: 24,
  background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
  borderBottom: `1px solid ${alpha(colors.primary.main, 0.2)}`,
}));

const NavList = styled(List)({
  padding: 16,
  flex: 1,
  overflowY: 'auto',
});

const SectionButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== '$active',
})<{ $active?: boolean }>(({ $active }) => ({
  borderRadius: 12,
  marginBottom: 8,
  padding: '12px 16px',
  transition: 'all 0.2s ease',
  border: `1px solid ${$active ? colors.primary.main : 'transparent'}`,
  background: $active 
    ? `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`
    : 'transparent',
  
  '&:hover': {
    background: $active
      ? `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.secondary.dark} 100%)`
      : alpha(colors.primary.main, 0.08),
    transform: 'translateX(4px)',
    boxShadow: $active 
      ? `0 4px 12px ${alpha(colors.primary.main, 0.3)}`
      : `0 2px 8px ${alpha(colors.primary.main, 0.1)}`,
  },
}));

const SectionNumber = styled(Chip, {
  shouldForwardProp: (prop) => prop !== '$active',
})<{ $active?: boolean }>(({ $active }) => ({
  height: 24,
  fontSize: '0.75rem',
  fontWeight: 700,
  background: $active ? 'rgba(255, 255, 255, 0.2)' : alpha(colors.primary.main, 0.1),
  color: $active ? '#ffffff' : colors.primary.main,
  border: 'none',
}));

interface Section {
  id: string;
  sectionNumber: string;
  sectionTitle: string;
  isComplete: boolean;
  isRequired: boolean;
}

interface SectionNavProps {
  sections: Section[];
  protocolId: string;
  sectionStatus?: Record<string, any>;
}

export const SectionNav: React.FC<SectionNavProps> = ({ sections, protocolId, sectionStatus = {} }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getLatestValidation } = useValidation();
  const [validationReport, setValidationReport] = useState<any>(null);

  const loadValidation = useCallback(async () => {
    try {
      const report = await getLatestValidation(protocolId);
      if (report) {
        setValidationReport(report);
      }
    } catch (error) {
      // Silently fail - validation is optional
      console.debug('No validation report available yet');
    }
  }, [protocolId, getLatestValidation]);

  useEffect(() => {
    if (protocolId) {
      loadValidation();
      // Poll for updates every 2 minutes (reduced frequency)
      const interval = setInterval(loadValidation, 120000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [protocolId, loadValidation]);

  const handleSectionClick = (sectionNumber: string) => {
    navigate(`/protocols/${protocolId}/section/${sectionNumber}`);
  };

  const isActive = (sectionNumber: string) => {
    return location.pathname.includes(`/section/${sectionNumber}`);
  };

  const getSectionValidationStatus = (sectionNumber: string) => {
    const status = sectionStatus[sectionNumber] || validationReport?.sectionStatus?.[sectionNumber];
    if (!status) return null;
    
    if (status.errors > 0) return 'error';
    if (status.warnings > 0) return 'warning';
    if (status.complete) return 'complete';
    return 'incomplete';
  };

  const getSectionValidationIcon = (sectionNumber: string) => {
    const status = getSectionValidationStatus(sectionNumber);
    switch (status) {
      case 'error':
        return <ErrorIcon sx={{ fontSize: 16, color: colors.semantic.error }} />;
      case 'warning':
        return <WarningIcon sx={{ fontSize: 16, color: colors.semantic.warning }} />;
      case 'complete':
        return <CheckCircle sx={{ fontSize: 16, color: colors.semantic.success }} />;
      default:
        return null;
    }
  };

  return (
    <NavContainer>
      <NavHeader>
        <Typography variant="h6" fontWeight={700} color="#ffffff" gutterBottom>
          Protocol Sections
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
          ICH M11 Structure
        </Typography>
      </NavHeader>

      <NavList>
        {sections.map((section) => {
          const active = isActive(section.sectionNumber);
          
          return (
            <SectionButton
              key={section.id}
              onClick={() => handleSectionClick(section.sectionNumber)}
              $active={active}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                <SectionNumber 
                  label={section.sectionNumber}
                  size="small"
                  $active={active}
                />
                <Typography 
                  variant="body2" 
                  fontWeight={600}
                  sx={{ 
                    color: active ? '#ffffff' : colors.text.primary,
                    flex: 1,
                    fontSize: '0.875rem',
                  }}
                >
                  {section.sectionTitle}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                {/* Validation Status Icon */}
                {getSectionValidationIcon(section.sectionNumber)}
                
                {section.isRequired && (
                  <FiberManualRecord 
                    sx={{ 
                      fontSize: 8,
                      color: active ? '#ffffff' : colors.semantic.error,
                    }} 
                  />
                )}
                {section.isComplete ? (
                  <CheckCircle 
                    sx={{ 
                      fontSize: 20,
                      color: active ? '#ffffff' : colors.semantic.success,
                    }} 
                  />
                ) : (
                  <RadioButtonUnchecked 
                    sx={{ 
                      fontSize: 20,
                      color: active ? 'rgba(255, 255, 255, 0.5)' : colors.text.disabled,
                    }} 
                  />
                )}
              </Box>
            </SectionButton>
          );
        })}
      </NavList>
    </NavContainer>
  );
};
