import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  ButtonGroup,
  Chip,
  CircularProgress,
  Divider,
  Alert,
  IconButton,
  Collapse,
  alpha,
  Tooltip
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  TrendingUp as ProgressIcon
} from '@mui/icons-material';
import { aiService } from '../../services/aiService';
import { colors } from '../../styles/theme';

interface AIIntroductionCopilotProps {
  fieldName: string;
  fieldValue: string;
  sectionNumber: string;
  protocolContext: any;
  targetWordCount?: number;
  onInsert: (text: string) => void;
  onReplace: (text: string) => void;
}

export const AIIntroductionCopilot: React.FC<AIIntroductionCopilotProps> = ({
  fieldName,
  fieldValue,
  sectionNumber,
  protocolContext,
  targetWordCount = 300,
  onInsert,
  onReplace
}) => {
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState<string | null>(null);
  const [generatedText, setGeneratedText] = useState<string>('');
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [realtimeInsights, setRealtimeInsights] = useState<string[]>([]);

  const wordCount = (fieldValue || '').trim().split(/\s+/).filter(Boolean).length;
  const progress = Math.min((wordCount / targetWordCount) * 100, 100);
  const wordsRemaining = Math.max(targetWordCount - wordCount, 0);

  // Real-time monitoring of user's writing
  useEffect(() => {
    const analyzeContent = () => {
      const insights: string[] = [];
      
      if (wordCount === 0) {
        insights.push('Start writing or use AI to generate content');
      } else if (wordCount < 50) {
        insights.push('Good start! Keep developing your ideas');
      } else if (wordCount < targetWordCount * 0.5) {
        insights.push(`${wordsRemaining} words to reach target`);
      } else if (wordCount < targetWordCount) {
        insights.push(`Almost there! ${wordsRemaining} words remaining`);
      } else {
        insights.push('Target word count reached! ✓');
      }

      // Content quality checks
      if (fieldValue.length > 0) {
        const sentences = fieldValue.split(/[.!?]+/).filter(Boolean);
        if (sentences.length < 3) {
          insights.push('Consider adding more detail with additional sentences');
        }
        
        // Check for key terms based on field
        if (fieldName === 'Background' && !fieldValue.toLowerCase().includes('epidemiology')) {
          insights.push('Consider including epidemiology data');
        }
        if (fieldName === 'Rationale' && !fieldValue.toLowerCase().includes('unmet need')) {
          insights.push('Highlight the unmet medical need');
        }
        if (fieldName === 'Benefit-Risk' && !fieldValue.toLowerCase().includes('benefit')) {
          insights.push('Describe potential benefits clearly');
        }
      }

      setRealtimeInsights(insights);
    };

    const debounce = setTimeout(analyzeContent, 500);
    return () => clearTimeout(debounce);
  }, [fieldValue, wordCount, targetWordCount, wordsRemaining, fieldName]);

  const handleAIAction = async (action: 'continue' | 'complete' | 'version') => {
    setLoading(true);
    setActionType(action);
    setShowSuggestion(false);

    try {
      let prompt = '';
      const indication = protocolContext?.indication || 'the condition';
      const phase = protocolContext?.trialPhase || 'clinical trial';

      switch (action) {
        case 'continue':
          prompt = `Continue writing the ${fieldName} section from where the user left off. Current text: "${fieldValue}". 
          Write approximately ${Math.min(wordsRemaining, 150)} more words that naturally continue the narrative. 
          Focus on ${indication} and ${phase}. Maintain the same tone and style.`;
          break;

        case 'complete':
          prompt = `Complete the ${fieldName} section for a ${phase} protocol about ${indication}. 
          Current text: "${fieldValue}". 
          Add approximately ${wordsRemaining} words to reach the target of ${targetWordCount} words total. 
          ${fieldName === 'Background' ? 'Include epidemiology, current treatments, and unmet needs.' : ''}
          ${fieldName === 'Rationale' ? 'Explain why this trial is needed and what it will contribute.' : ''}
          ${fieldName === 'Benefit-Risk' ? 'Describe benefits, risks, and overall assessment.' : ''}
          Ensure smooth transition from existing content.`;
          break;

        case 'version':
          prompt = `Generate an alternative version of the ${fieldName} section for a ${phase} protocol about ${indication}. 
          Original text: "${fieldValue}". 
          Create a fresh perspective with approximately ${targetWordCount} words. 
          Maintain professional medical writing style but use different phrasing and structure.`;
          break;
      }

      const response = await aiService.getSectionAssistance(
        sectionNumber,
        { [fieldName]: fieldValue },
        prompt,
        protocolContext
      );

      setGeneratedText(response.content);
      setShowSuggestion(true);
    } catch (error) {
      console.error('AI generation error:', error);
      // Fallback to template-based generation
      const fallbackText = generateFallbackText(action);
      setGeneratedText(fallbackText);
      setShowSuggestion(true);
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  const generateFallbackText = (action: string): string => {
    const indication = protocolContext?.indication || 'the target condition';
    const phase = protocolContext?.trialPhase || 'this clinical trial';

    if (action === 'continue') {
      return `Furthermore, ${indication} represents a significant clinical challenge requiring innovative therapeutic approaches. The proposed ${phase} aims to address these challenges through a comprehensive evaluation of safety and efficacy parameters.`;
    } else if (action === 'complete') {
      return `This ${phase} is designed to evaluate the therapeutic potential in ${indication}. The study will provide critical data on efficacy, safety, and tolerability, contributing to the evidence base for clinical decision-making. By addressing current gaps in treatment options, this trial has the potential to improve patient outcomes and quality of life.`;
    } else {
      return `The clinical landscape for ${indication} has evolved significantly, yet substantial unmet needs remain. This ${phase} represents a strategic approach to advancing therapeutic options through rigorous scientific evaluation and evidence generation.`;
    }
  };

  const handleInsert = () => {
    onInsert(generatedText);
    setShowSuggestion(false);
    setGeneratedText('');
  };

  const handleReplace = () => {
    onReplace(generatedText);
    setShowSuggestion(false);
    setGeneratedText('');
  };

  const handleDiscard = () => {
    setShowSuggestion(false);
    setGeneratedText('');
  };

  const getProgressColor = () => {
    if (progress >= 100) return colors.semantic.success;
    if (progress >= 70) return colors.primary.main;
    if (progress >= 40) return colors.semantic.warning;
    return colors.text.disabled;
  };

  return (
    <Card
      sx={{
        mb: 2,
        border: `2px solid ${colors.primary.main}30`,
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          background: `linear-gradient(135deg, ${colors.primary.main}15 0%, ${colors.secondary.main}10 100%)`,
          borderBottom: `1px solid ${colors.primary.main}20`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <AIIcon sx={{ color: colors.primary.main }} />
          <Typography variant="subtitle2" fontWeight={700}>
            AI Writing Copilot
          </Typography>
          <Chip
            label="Real-time"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.7rem',
              background: colors.semantic.success,
              color: 'white'
            }}
          />
        </Box>
        <IconButton size="small" onClick={() => setExpanded(!expanded)}>
          {expanded ? <CollapseIcon /> : <ExpandIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ p: 2 }}>
          {/* Word Count Progress */}
          <Box sx={{ mb: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" fontWeight={600} color="text.secondary">
                Word Count Progress
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="caption" fontWeight={700} color={getProgressColor()}>
                  {wordCount} / {targetWordCount} words
                </Typography>
                {progress >= 100 && <CheckIcon sx={{ fontSize: 16, color: colors.semantic.success }} />}
              </Box>
            </Box>
            <Box
              sx={{
                height: 8,
                borderRadius: 4,
                background: `${colors.primary.main}20`,
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  height: '100%',
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${getProgressColor()}, ${getProgressColor()}dd)`,
                  transition: 'width 0.3s ease'
                }}
              />
            </Box>
          </Box>

          {/* Real-time Insights */}
          {realtimeInsights.length > 0 && (
            <Alert
              severity="info"
              icon={<ProgressIcon />}
              sx={{
                mb: 2,
                fontSize: '0.875rem',
                '& .MuiAlert-message': { width: '100%' }
              }}
            >
              {realtimeInsights.map((insight, index) => (
                <Typography 
                  key={index} 
                  variant="caption" 
                  display="block"
                  sx={{ 
                    mb: 0.5, 
                    lineHeight: 1.6,
                    color: 'text.primary',
                    fontWeight: 500
                  }}
                >
                  • {insight}
                </Typography>
              ))}
            </Alert>
          )}

          {/* AI Action Buttons */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={1}>
              AI Actions:
            </Typography>
            <ButtonGroup fullWidth variant="outlined" size="small">
              <Button
                startIcon={loading && actionType === 'continue' ? <CircularProgress size={16} /> : <AddIcon />}
                onClick={() => handleAIAction('continue')}
                disabled={loading || wordCount === 0}
                sx={{
                  borderColor: colors.primary.main,
                  color: colors.primary.main,
                  '&:hover': {
                    borderColor: colors.primary.dark,
                    background: `${colors.primary.main}10`
                  }
                }}
              >
                Continue Writing
              </Button>
              <Button
                startIcon={loading && actionType === 'complete' ? <CircularProgress size={16} /> : <CheckIcon />}
                onClick={() => handleAIAction('complete')}
                disabled={loading || progress >= 100}
                sx={{
                  borderColor: colors.semantic.success,
                  color: colors.semantic.success,
                  '&:hover': {
                    borderColor: colors.semantic.success,
                    background: `${colors.semantic.success}10`
                  }
                }}
              >
                Complete For Me
              </Button>
              <Button
                startIcon={loading && actionType === 'version' ? <CircularProgress size={16} /> : <RefreshIcon />}
                onClick={() => handleAIAction('version')}
                disabled={loading}
                sx={{
                  borderColor: colors.secondary.main,
                  color: colors.secondary.main,
                  '&:hover': {
                    borderColor: colors.secondary.dark,
                    background: `${colors.secondary.main}10`
                  }
                }}
              >
                Another Version
              </Button>
            </ButtonGroup>
          </Box>

          {/* Generated Suggestion */}
          {showSuggestion && generatedText && (
            <Card
              sx={{
                p: 2,
                background: `${colors.primary.main}05`,
                border: `2px solid ${colors.primary.main}`,
                borderRadius: 2
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2" fontWeight={700} color="primary">
                  AI Generated Content
                </Typography>
                <Chip
                  label={`${generatedText.trim().split(/\s+/).filter(Boolean).length} words`}
                  size="small"
                  sx={{ fontSize: '0.7rem' }}
                />
              </Box>

              <Box
                sx={{
                  p: 2,
                  background: 'white',
                  borderRadius: 1,
                  mb: 2,
                  maxHeight: 200,
                  overflowY: 'auto',
                  border: `1px solid ${colors.primary.main}20`
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {generatedText}
                </Typography>
              </Box>

              <Box display="flex" gap={1}>
                <Tooltip title="Add to end of existing text">
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleInsert}
                    sx={{
                      flex: 1,
                      background: colors.primary.main,
                      '&:hover': { background: colors.primary.dark }
                    }}
                  >
                    Insert
                  </Button>
                </Tooltip>
                <Tooltip title="Replace all existing text">
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={handleReplace}
                    sx={{
                      flex: 1,
                      background: colors.semantic.warning,
                      '&:hover': { background: colors.semantic.warning, filter: 'brightness(0.9)' }
                    }}
                  >
                    Replace
                  </Button>
                </Tooltip>
                <Tooltip title="Discard this suggestion">
                  <IconButton size="small" onClick={handleDiscard} sx={{ color: colors.text.secondary }}>
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Card>
          )}

          {/* Tips */}
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.secondary" display="block">
            💡 Tip: Use "Continue Writing" to extend your current text, "Complete For Me" to reach target word count, or "Another Version" for a fresh perspective.
          </Typography>
        </Box>
      </Collapse>
    </Card>
  );
};
