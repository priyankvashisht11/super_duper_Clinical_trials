import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Psychology as AIIcon,
  ExpandMore as ExpandMoreIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  AutoFixHigh as AutoFixIcon,
} from '@mui/icons-material';
import { colors } from '../../styles/theme';
import { aiService } from '../../services/aiService';
import type { AIValidationResponse } from '../../services/aiService';
import { useNotification } from '../../hooks/useNotification';

interface AIValidationInsightsProps {
  sectionName: string;
  content: any;
  protocolContext?: any;
  onImprovementSuggestion?: (suggestion: string) => void;
  autoValidate?: boolean;
}

export const AIValidationInsights: React.FC<AIValidationInsightsProps> = ({
  sectionName,
  content,
  protocolContext,
  onImprovementSuggestion,
  autoValidate = false,
}) => {
  const [validation, setValidation] = useState<AIValidationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const notification = useNotification();

  const validateContent = async () => {
    if (!content || Object.keys(content).length === 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await aiService.validateAndImprove(
        sectionName,
        content,
        protocolContext
      );
      setValidation(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate content';
      setError(errorMessage);
      notification.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoValidate && content && Object.keys(content).length > 0) {
      const timer = setTimeout(() => {
        validateContent();
      }, 2000); // Debounce validation

      return () => clearTimeout(timer);
    }
  }, [content, autoValidate]);

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
        return <InfoIcon sx={{ color: colors.semantic.info }} />;
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

  if (!content || Object.keys(content).length === 0) {
    return (
      <Card sx={{ background: colors.primary.light + '05' }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <AIIcon sx={{ fontSize: 48, color: colors.primary.light, mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Add content to this section to get AI validation insights
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${colors.primary.light}05 0%, ${colors.secondary.light}05 100%)`,
        border: `1px solid ${colors.primary.light}20`,
      }}
    >
      <CardContent>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <AIIcon sx={{ color: colors.primary.main }} />
            <Typography variant="h6" fontWeight={700}>
              AI Validation Insights
            </Typography>
          </Box>
          <Tooltip title="Refresh validation">
            <IconButton onClick={validateContent} disabled={loading} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Loading State */}
        {loading && (
          <Box textAlign="center" py={3}>
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary" mt={2}>
              AI is analyzing your content...
            </Typography>
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Validation Results */}
        {validation && !loading && (
          <Box>
            {/* Quality Score */}
            <Card sx={{ mb: 3, background: 'white' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Content Quality Score
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <TrendingUpIcon sx={{ color: getScoreColor(validation.score) }} />
                    <Typography
                      variant="h4"
                      fontWeight={700}
                      sx={{ color: getScoreColor(validation.score) }}
                    >
                      {validation.score}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      / 100
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={validation.score}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: colors.primary.light + '20',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getScoreColor(validation.score),
                      borderRadius: 4,
                    },
                  }}
                />
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                  <Typography variant="caption" color="text.secondary">
                    {getScoreLabel(validation.score)}
                  </Typography>
                  <Chip
                    label={`${validation.issues.length} issues found`}
                    size="small"
                    sx={{
                      background: validation.issues.length === 0 
                        ? colors.semantic.success + '20' 
                        : colors.semantic.warning + '20',
                      color: validation.issues.length === 0 
                        ? colors.semantic.success 
                        : colors.semantic.warning,
                    }}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Issues */}
            {validation.issues.length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <ErrorIcon sx={{ color: colors.semantic.error }} />
                    <Typography variant="subtitle1" fontWeight={600}>
                      Issues Found ({validation.issues.length})
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {validation.issues.map((issue, index) => (
                      <ListItem
                        key={index}
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
                          primary={issue.message}
                          secondary={issue.suggestion}
                          primaryTypographyProps={{
                            fontWeight: 600,
                            color: getSeverityColor(issue.severity),
                          }}
                          secondaryTypographyProps={{
                            variant: 'body2',
                            sx: { mt: 0.5 },
                          }}
                        />
                        {onImprovementSuggestion && (
                          <Button
                            size="small"
                            startIcon={<AutoFixIcon />}
                            onClick={() => onImprovementSuggestion(issue.suggestion)}
                            sx={{ ml: 1 }}
                          >
                            Apply
                          </Button>
                        )}
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Improvements */}
            {validation.improvements.length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CheckIcon sx={{ color: colors.semantic.success }} />
                    <Typography variant="subtitle1" fontWeight={600}>
                      Improvement Suggestions ({validation.improvements.length})
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {validation.improvements.map((improvement, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          background: colors.semantic.success + '05',
                          borderRadius: 1,
                          mb: 1,
                          border: `1px solid ${colors.semantic.success}20`,
                        }}
                      >
                        <ListItemIcon>
                          <CheckIcon sx={{ color: colors.semantic.success }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={improvement}
                          primaryTypographyProps={{
                            variant: 'body2',
                          }}
                        />
                        {onImprovementSuggestion && (
                          <Button
                            size="small"
                            startIcon={<AutoFixIcon />}
                            onClick={() => onImprovementSuggestion(improvement)}
                            sx={{ ml: 1 }}
                          >
                            Apply
                          </Button>
                        )}
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Perfect Score */}
            {validation.score === 100 && validation.issues.length === 0 && (
              <Alert
                severity="success"
                sx={{
                  background: `linear-gradient(135deg, ${colors.semantic.success}10 0%, ${colors.primary.light}10 100%)`,
                }}
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  Excellent Work! 🎉
                </Typography>
                <Typography variant="body2">
                  This section meets all quality standards and regulatory requirements.
                </Typography>
              </Alert>
            )}
          </Box>
        )}

        {/* Empty State */}
        {!validation && !loading && !error && (
          <Box textAlign="center" py={3}>
            <Button
              variant="contained"
              startIcon={<AIIcon />}
              onClick={validateContent}
              sx={{
                background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
              }}
            >
              Analyze Content Quality
            </Button>
            <Typography variant="body2" color="text.secondary" mt={2}>
              Get AI-powered insights on content quality and compliance
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};