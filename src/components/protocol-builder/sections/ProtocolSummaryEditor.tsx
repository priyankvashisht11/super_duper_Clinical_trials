import React, { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Alert, Chip,
  Divider, Button
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useProtocol } from '../../../contexts/ProtocolContext';
import { SectionHeader, SectionCompletionAlert } from '../index';
import { useValidation } from '../../../hooks/useValidation';
import { colors } from '../../../styles/theme';

const GradientButton = styled(Button)(() => ({
  background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 600,
  '&:hover': {
    background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.secondary.dark} 100%)`,
  },
}));

export const ProtocolSummaryEditor: React.FC = () => {
  const { protocol } = useProtocol();
  const { validateProtocol, getLatestValidation } = useValidation();
  const [summary, setSummary] = useState<any>({});
  const [validating, setValidating] = useState(false);
  const [sectionValidation, setSectionValidation] = useState<any>(null);
  const [showCompletionAlert, setShowCompletionAlert] = useState(false);
  const [lastCompletionScore, setLastCompletionScore] = useState(0);

  useEffect(() => {
    if (protocol) {
      generateSummary();
      loadSectionValidation();
    }
  }, [protocol]);

  const loadSectionValidation = async () => {
    if (!protocol?.id) return;
    
    const report = await getLatestValidation(protocol.id);
    if (report?.sectionStatus?.['1']) {
      setSectionValidation(report.sectionStatus['1']);
    }
  };

  const handleValidateSection = async () => {
    if (!protocol?.id) return;
    
    setValidating(true);
    try {
      const report = await validateProtocol(protocol.id);
      if (report?.sectionStatus?.['1']) {
        const newValidation = report.sectionStatus['1'];
        setSectionValidation(newValidation);
        
        // Check overall completeness score from report
        if (report?.completenessScore && report.completenessScore > lastCompletionScore + 10) {
          setShowCompletionAlert(true);
          setLastCompletionScore(report.completenessScore);
        }
      }
    } finally {
      setValidating(false);
    }
  };

  const generateSummary = () => {
    setSummary({
      title: protocol?.fullTitle,
      sponsor: protocol?.sponsorProtocolIdentifier,
      phase: protocol?.trialPhase,
      indication: protocol?.indication,
      studyType: protocol?.studyType,
      objectivesCount: protocol?.objectives?.length || 0,
      primaryObjectives: protocol?.objectives?.filter((o: any) => o.objectiveType === 'primary').length || 0,
      inclusionCount: protocol?.eligibilityCriteria?.filter((c: any) => c.criterionType === 'inclusion').length || 0,
      exclusionCount: protocol?.eligibilityCriteria?.filter((c: any) => c.criterionType === 'exclusion').length || 0,
      interventionsCount: protocol?.interventions?.length || 0,
      completeness: protocol?.completenessPercentage || 0
    });
  };

  return (
    <Box>
      <SectionHeader
        sectionNumber="1"
        sectionTitle="Protocol Summary"
        description="Auto-generated overview of key protocol elements"
        icon={<DashboardIcon />}
        validationStatus={sectionValidation}
        onValidate={handleValidateSection}
        validating={validating}
      />

      {showCompletionAlert && sectionValidation && (
        <SectionCompletionAlert
          sectionTitle="Protocol Summary"
          sectionNumber="1"
          completionScore={lastCompletionScore}
          onDismiss={() => setShowCompletionAlert(false)}
        />
      )}

      <Alert 
        severity="info" 
        icon={<DashboardIcon sx={{ fontSize: 40 }} />}
        sx={{ 
          mb: 3,
          backgroundColor: '#e3f2fd',
          border: `3px solid #2196f3`,
          borderRadius: 3,
          padding: 3,
          boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)',
          '& .MuiAlert-icon': {
            color: '#1976d2',
            fontSize: 40,
            marginRight: 2
          },
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#0d47a1' }}>
          📊 Auto-Generated Summary Section
        </Typography>
        <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#1565c0', fontSize: '1rem' }}>
          This section is <strong style={{ color: '#0d47a1' }}>automatically generated</strong> from data you enter in other sections.
          <br />
          <strong>Complete sections 2-14</strong> to see your protocol summary populate here.
        </Typography>
      </Alert>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight={700}>
              Protocol Overview
            </Typography>
            <GradientButton
              size="small"
              startIcon={<RefreshIcon />}
              onClick={generateSummary}
            >
              Refresh
            </GradientButton>
          </Box>

          {/* Basic Information */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3, mb: 3 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Protocol Title
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {summary.title || 'Not set'}
              </Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Sponsor Protocol Identifier
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {summary.sponsor || 'Not set'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Indication
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {summary.indication || 'Not set'}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Phase
                </Typography>
                <Chip
                  label={summary.phase || 'Not set'}
                  color="primary"
                  size="small"
                />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Study Type
                </Typography>
                <Chip
                  label={summary.studyType || 'Not set'}
                  color="secondary"
                  size="small"
                />
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Content Summary */}
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Protocol Content
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
            <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} color="primary">
                {summary.objectivesCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Objectives
              </Typography>
              <Typography variant="caption" display="block" color="primary">
                ({summary.primaryObjectives} primary)
              </Typography>
            </Card>
            <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} color="success.main">
                {summary.inclusionCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Inclusion Criteria
              </Typography>
            </Card>
            <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} color="error.main">
                {summary.exclusionCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Exclusion Criteria
              </Typography>
            </Card>
            <Card variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} color="secondary.main">
                {summary.interventionsCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Interventions
              </Typography>
            </Card>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Completeness */}
          <Box display="flex" alignItems="center" gap={2}>
            <CheckCircleIcon sx={{ color: colors.semantic.success, fontSize: 32 }} />
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Protocol Completeness: {summary.completeness}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Complete remaining sections to increase protocol quality
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};