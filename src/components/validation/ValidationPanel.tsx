import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Tabs, 
  Tab, 
  CircularProgress, 
  LinearProgress, 
  Card, 
  CardContent, 
  Fade, 
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  PlayArrow, 
  CheckCircle, 
  Assessment
} from '@mui/icons-material';
import type { ValidationReport } from '../../types/validation.types';
import { ValidationBadge } from './ValidationBadge';
import { ValidationIssueCard } from './ValidationIssueCard';
import { SectionStatusGrid } from './SectionStatusGrid';
import { colors } from '../../styles/theme';

const PanelContainer = styled(Box)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  borderLeft: `1px solid ${alpha(colors.primary.main, 0.1)}`,
});

const PanelHeader = styled(Box)(() => ({
  padding: 24,
  borderBottom: `1px solid ${alpha(colors.primary.main, 0.1)}`,
  background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
}));

const ValidateButton = styled(Button)(() => ({
  borderRadius: 12,
  padding: '12px 32px',
  fontWeight: 600,
  fontSize: '0.875rem',
  background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
  boxShadow: `0 4px 12px ${alpha(colors.primary.main, 0.3)}`,
  textTransform: 'none',
  
  '&:hover': {
    background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.secondary.dark} 100%)`,
    boxShadow: `0 6px 16px ${alpha(colors.primary.main, 0.4)}`,
    transform: 'translateY(-2px)',
  },
  
  '&:disabled': {
    background: colors.text.disabled,
    boxShadow: 'none',
    transform: 'none',
  },
}));

const StatsCard = styled(Card)(() => ({
  borderRadius: 16,
  boxShadow: `0 4px 20px ${alpha(colors.primary.main, 0.1)}`,
  border: `1px solid ${alpha(colors.primary.main, 0.1)}`,
  background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
  transition: 'all 0.3s ease',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 25px ${alpha(colors.primary.main, 0.15)}`,
  },
}));

const StyledTabs = styled(Tabs)(() => ({
  borderBottom: `1px solid ${alpha(colors.primary.main, 0.1)}`,
  
  '& .MuiTab-root': {
    minHeight: 48,
    fontWeight: 600,
    fontSize: '0.875rem',
    textTransform: 'none',
    
    '&.Mui-selected': {
      color: colors.primary.main,
    },
  },
  
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
    background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
  },
}));

const EmptyState = styled(Box)(() => ({
  textAlign: 'center',
  padding: 48,
  color: colors.text.secondary,
}));

const SuccessState = styled(Box)(() => ({
  textAlign: 'center',
  padding: 48,
  background: `linear-gradient(135deg, ${alpha(colors.semantic.success, 0.05)} 0%, ${alpha(colors.semantic.success, 0.1)} 100%)`,
  borderRadius: 16,
  border: `1px solid ${alpha(colors.semantic.success, 0.2)}`,
}));

interface ValidationPanelProps {
  report: ValidationReport | null;
  loading: boolean;
  onValidate: () => void;
  onNavigateToSection: (sectionNumber: string) => void;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  report,
  loading,
  onValidate,
  onNavigateToSection,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'sections'>('overview');

  const handleTabChange = (_: React.SyntheticEvent, newValue: 'overview' | 'issues' | 'sections') => {
    setActiveTab(newValue);
  };

  return (
    <PanelContainer>
      {/* Header */}
      <PanelHeader>
        <Typography 
          variant="h5" 
          fontWeight={700}
          sx={{ 
            mb: 1,
            background: `linear-gradient(45deg, ${colors.primary.main}, ${colors.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Protocol Validation
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Check compliance with ICH M11 and regulatory requirements
        </Typography>

        <ValidateButton
          onClick={onValidate}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
          fullWidth
        >
          {loading ? 'Validating...' : 'Validate Now'}
        </ValidateButton>

        {/* Status Summary */}
        {report && (
          <Fade in>
            <Box sx={{ mt: 3 }}>
              <ValidationBadge
                status={report.overallStatus}
                errorCount={report.totalErrors}
                warningCount={report.totalWarnings}
                size="lg"
              />
              <Box sx={{ display: 'flex', gap: 3, mt: 2, fontSize: '0.875rem' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Completeness:
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="text.primary">
                    {report.completenessScore}%
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Errors:
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="error.main">
                    {report.totalErrors}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Warnings:
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="warning.main">
                    {report.totalWarnings}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Fade>
        )}
      </PanelHeader>

      {/* Content */}
      {!report ? (
        <EmptyState>
          <Assessment sx={{ fontSize: 64, color: colors.text.disabled, mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No validation results yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click "Validate Now" to check protocol compliance
          </Typography>
        </EmptyState>
      ) : (
        <>
          {/* Tabs */}
          <StyledTabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Overview" value="overview" />
            <Tab label={`Issues (${report?.issues?.length || 0})`} value="issues" />
            <Tab label="Sections" value="sections" />
          </StyledTabs>

          {/* Tab Content */}
          <Box sx={{ p: 3, flex: 1, overflow: 'auto' }}>
            {activeTab === 'overview' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Stats Grid */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                  <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                    <StatsCard>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" fontWeight={700} color="primary.main">
                          {report.completenessScore}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Completeness
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={report.completenessScore}
                          sx={{
                            mt: 2,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: alpha(colors.primary.main, 0.1),
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
                            },
                          }}
                        />
                      </CardContent>
                    </StatsCard>
                  </Box>

                  <StatsCard>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" fontWeight={700} color="error.main">
                        {report.totalErrors}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Blocking Errors
                      </Typography>
                      {report.totalErrors > 0 && (
                        <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
                          Must be fixed before finalization
                        </Typography>
                      )}
                    </CardContent>
                  </StatsCard>

                  <StatsCard>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" fontWeight={700} color="warning.main">
                        {report.totalWarnings}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Warnings
                      </Typography>
                      {report.totalWarnings > 0 && (
                        <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
                          Recommended improvements
                        </Typography>
                      )}
                    </CardContent>
                  </StatsCard>
                </Box>

                {/* Recent Issues */}
                {report?.issues && report.issues.length > 0 && (
                  <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                      Recent Issues
                    </Typography>
                    {report.issues.slice(0, 3).map((issue, index) => (
                      <ValidationIssueCard
                        key={index}
                        issue={issue}
                        onNavigate={onNavigateToSection}
                      />
                    ))}
                    {report?.issues && report.issues.length > 3 && (
                      <Button
                        onClick={() => setActiveTab('issues')}
                        sx={{ mt: 2 }}
                        color="primary"
                        size="small"
                      >
                        View all {report.issues.length} issues →
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            )}

            {activeTab === 'issues' && (
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                  All Validation Issues ({report?.issues?.length || 0})
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Resolve blocking errors before submitting protocol for review
                </Typography>

                {!report?.issues || report.issues.length === 0 ? (
                  <SuccessState>
                    <CheckCircle sx={{ fontSize: 64, color: colors.semantic.success, mb: 2 }} />
                    <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ mb: 1 }}>
                      No issues found!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Your protocol meets all validation requirements
                    </Typography>
                  </SuccessState>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {report.issues.map((issue, index) => (
                      <ValidationIssueCard
                        key={index}
                        issue={issue}
                        onNavigate={onNavigateToSection}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {activeTab === 'sections' && (
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                  Section Status
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Click on a section to navigate and resolve issues
                </Typography>
                {report?.sectionStatus && (
                  <SectionStatusGrid
                    sections={report.sectionStatus}
                    onSectionClick={onNavigateToSection}
                  />
                )}
              </Box>
            )}
          </Box>
        </>
      )}
    </PanelContainer>
  );
};
