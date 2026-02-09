import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  LinearProgress,
  Chip,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import {
  Psychology as AIIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Lightbulb as LightbulbIcon,
  ExpandMore as ExpandMoreIcon,
  Assessment as AssessmentIcon,
  AutoFixHigh as AutoFixIcon,
} from '@mui/icons-material';
import { colors } from '../../styles/theme';
import { aiService } from '../../services/aiService';
import type { AIProtocolAnalysisResponse } from '../../services/aiService';
import { useNotification } from '../../hooks/useNotification';

interface AIProtocolDashboardProps {
  protocol: any;
  onSectionFocus?: (sectionNumber: string) => void;
}

export const AIProtocolDashboard: React.FC<AIProtocolDashboardProps> = ({
  protocol,
  onSectionFocus,
}) => {
  const [analysis, setAnalysis] = useState<AIProtocolAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const notification = useNotification();

  const analyzeProtocol = async () => {
    if (!protocol) return;

    setLoading(true);
    setError(null);

    try {
      const result = await aiService.analyzeProtocol(protocol);
      setAnalysis(result);
      notification.success('Protocol analysis complete!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze protocol';
      setError(errorMessage);
      notification.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (protocol && protocol.sections && Object.keys(protocol.sections).length > 0) {
      analyzeProtocol();
    }
  }, [protocol]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return colors.semantic.success;
    if (score >= 60) return colors.semantic.warning;
    return colors.semantic.error;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Improvement';
    return 'Poor';
  };

  const getSeverityIcon = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return <ErrorIcon sx={{ color: colors.semantic.error }} />;
      case 'medium':
        return <WarningIcon sx={{ color: colors.semantic.warning }} />;
      case 'low':
        return <LightbulbIcon sx={{ color: colors.semantic.info }} />;
    }
  };

  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return colors.semantic.error;
      case 'medium':
        return colors.semantic.warning;
      case 'low':
        return colors.semantic.info;
    }
  };

  const sectionNames: { [key: string]: string } = {
    '1': 'Protocol Summary',
    '2': 'Introduction',
    '3': 'Trial Objectives',
    '4': 'Trial Design',
    '5': 'Eligibility Criteria',
    '6': 'Interventions',
    '7': 'Discontinuation',
    '8': 'Assessments',
    '9': 'Adverse Events',
    '10': 'Statistics',
    '11': 'Trial Oversight',
    '12': 'Appendices',
    '13': 'Glossary',
    '14': 'References',
  };

  if (!protocol) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <AIIcon sx={{ fontSize: 64, color: colors.primary.light, mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No protocol data available for analysis
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Card sx={{ mb: 3, background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)` }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <AIIcon sx={{ fontSize: 32, color: 'white' }} />
              <Box>
                <Typography variant="h5" fontWeight={700} color="white">
                  AI Protocol Analysis
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Comprehensive quality assessment and recommendations
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              startIcon={<AssessmentIcon />}
              onClick={analyzeProtocol}
              disabled={loading}
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  background: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              {loading ? 'Analyzing...' : 'Refresh Analysis'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              AI is analyzing your protocol...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This may take a few moments
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Analysis Results */}
      {analysis && !loading && (
        <Grid container spacing={3}>
          {/* Overall Score */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
                  <Typography variant="h6" fontWeight={600}>
                    Overall Quality Score
                  </Typography>
                  <TrendingUpIcon sx={{ color: getScoreColor(analysis.overallScore) }} />
                </Box>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Typography
                    variant="h2"
                    fontWeight={700}
                    sx={{ color: getScoreColor(analysis.overallScore) }}
                  >
                    {analysis.overallScore}
                  </Typography>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      / 100
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getScoreLabel(analysis.overallScore)}
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={analysis.overallScore}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: colors.primary.light + '20',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getScoreColor(analysis.overallScore),
                      borderRadius: 4,
                    },
                  }}
                />
                <Box display="flex" justifyContent="space-between" mt={2}>
                  <Typography variant="body2" color="text.secondary">
                    {analysis.completedSections} of {analysis.totalSections} sections
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round((analysis.completedSections / analysis.totalSections) * 100)}% complete
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Completion Progress */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  Section Completion Status
                </Typography>
                <Grid container spacing={1}>
                  {analysis.sectionAnalysis.map((section) => (
                    <Grid item xs={6} sm={4} md={3} key={section.section}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          background: getScoreColor(section.score) + '10',
                          border: `1px solid ${getScoreColor(section.score)}30`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          },
                        }}
                        onClick={() => onSectionFocus && onSectionFocus(section.section)}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Section {section.section}
                        </Typography>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {sectionNames[section.section] || `Section ${section.section}`}
                        </Typography>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                          <Typography
                            variant="caption"
                            fontWeight={700}
                            sx={{ color: getScoreColor(section.score) }}
                          >
                            {section.score}/100
                          </Typography>
                          <Chip
                            size="small"
                            label={section.issues.length}
                            sx={{
                              fontSize: '0.6rem',
                              height: 16,
                              background: section.issues.length === 0 
                                ? colors.semantic.success + '20' 
                                : colors.semantic.warning + '20',
                              color: section.issues.length === 0 
                                ? colors.semantic.success 
                                : colors.semantic.warning,
                            }}
                          />
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Critical Issues */}
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={1}>
                  <ErrorIcon sx={{ color: colors.semantic.error }} />
                  <Typography variant="h6" fontWeight={600}>
                    Critical Issues & Recommendations
                  </Typography>
                  <Chip
                    label={analysis.sectionAnalysis.reduce((total, section) => 
                      total + section.issues.filter(issue => issue.severity === 'high').length, 0
                    )}
                    size="small"
                    sx={{
                      background: colors.semantic.error + '20',
                      color: colors.semantic.error,
                    }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {analysis.sectionAnalysis.map((section) =>
                    section.issues
                      .filter(issue => issue.severity === 'high')
                      .map((issue, index) => (
                        <ListItem
                          key={`${section.section}-${index}`}
                          sx={{
                            background: getSeverityColor(issue.severity) + '05',
                            borderRadius: 1,
                            mb: 1,
                            border: `1px solid ${getSeverityColor(issue.severity)}20`,
                          }}
                        >
                          <ListItemIcon>
                            {getSeverityIcon(issue.severity)}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Chip
                                  label={`Section ${section.section}`}
                                  size="small"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                                <Typography variant="body2" fontWeight={600}>
                                  {issue.message}
                                </Typography>
                              </Box>
                            }
                            secondary={issue.suggestion}
                          />
                          <Button
                            size="small"
                            startIcon={<AutoFixIcon />}
                            onClick={() => onSectionFocus && onSectionFocus(section.section)}
                          >
                            Fix
                          </Button>
                        </ListItem>
                      ))
                  )}
                </List>
                {analysis.sectionAnalysis.every(section => 
                  section.issues.filter(issue => issue.severity === 'high').length === 0
                ) && (
                  <Alert severity="success">
                    <Typography variant="subtitle2" fontWeight={600}>
                      No Critical Issues Found! 🎉
                    </Typography>
                    <Typography variant="body2">
                      Your protocol meets all critical quality standards.
                    </Typography>
                  </Alert>
                )}
              </AccordionDetails>
            </Accordion>
          </Grid>

          {/* Improvement Opportunities */}
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={1}>
                  <LightbulbIcon sx={{ color: colors.semantic.info }} />
                  <Typography variant="h6" fontWeight={600}>
                    Improvement Opportunities
                  </Typography>
                  <Chip
                    label={analysis.sectionAnalysis.reduce((total, section) => 
                      total + section.improvements.length, 0
                    )}
                    size="small"
                    sx={{
                      background: colors.semantic.info + '20',
                      color: colors.semantic.info,
                    }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {analysis.sectionAnalysis.map((section) =>
                    section.improvements.map((improvement, index) => (
                      <ListItem
                        key={`${section.section}-improvement-${index}`}
                        sx={{
                          background: colors.semantic.info + '05',
                          borderRadius: 1,
                          mb: 1,
                          border: `1px solid ${colors.semantic.info}20`,
                        }}
                      >
                        <ListItemIcon>
                          <LightbulbIcon sx={{ color: colors.semantic.info }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Chip
                                label={`Section ${section.section}`}
                                size="small"
                                sx={{ fontSize: '0.7rem' }}
                              />
                              <Typography variant="body2">
                                {improvement}
                              </Typography>
                            </Box>
                          }
                        />
                        <Button
                          size="small"
                          startIcon={<AutoFixIcon />}
                          onClick={() => onSectionFocus && onSectionFocus(section.section)}
                        >
                          Improve
                        </Button>
                      </ListItem>
                    ))
                  )}
                </List>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      )}

      {/* Empty State */}
      {!analysis && !loading && !error && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <AIIcon sx={{ fontSize: 64, color: colors.primary.light, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Ready to Analyze Your Protocol
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Add content to your protocol sections to get comprehensive AI analysis and recommendations.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AssessmentIcon />}
              onClick={analyzeProtocol}
              sx={{
                background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
              }}
            >
              Start Analysis
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};