import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Psychology as AIIcon,
  ExpandMore as ExpandMoreIcon,
  Send as SendIcon,
  Lightbulb as LightbulbIcon,
  Link as LinkIcon,
  AutoFixHigh as AutoFixIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { colors } from '../../styles/theme';
import { aiService } from '../../services/aiService';
import type { AIAssistanceResponse } from '../../services/aiService';
import { useNotification } from '../../hooks/useNotification';

interface AIAssistantPanelProps {
  sectionName: string;
  currentContent: any;
  protocolContext?: any;
  onContentSuggestion?: (content: string) => void;
  onClose?: () => void;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  sectionName,
  currentContent,
  protocolContext,
  onContentSuggestion,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIAssistanceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const notification = useNotification();

  const handleAskAI = async () => {
    if (!query.trim()) {
      notification.warning('Please enter a question or request');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await aiService.getSectionAssistance(
        sectionName,
        currentContent,
        query,
        protocolContext
      );
      setResponse(result);
      notification.success('AI assistance received!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get AI assistance';
      setError(errorMessage);
      notification.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleApplySuggestion = (suggestion: string) => {
    if (onContentSuggestion) {
      onContentSuggestion(suggestion);
      notification.success('Suggestion applied!');
    }
  };

  const quickPrompts = [
    'Help me improve this section',
    'What are the regulatory requirements?',
    'Suggest best practices',
    'Check for completeness',
    'Provide examples',
    'Review for compliance',
  ];

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(135deg, ${colors.primary.light}10 0%, ${colors.secondary.light}10 100%)`,
        border: `1px solid ${colors.primary.light}30`,
      }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <AIIcon sx={{ color: colors.primary.main, fontSize: 28 }} />
            <Typography variant="h6" fontWeight={700}>
              AI Assistant
            </Typography>
            <Chip
              label={sectionName}
              size="small"
              sx={{
                background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
                color: 'white',
                fontWeight: 600,
              }}
            />
          </Box>
          {onClose && (
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </Box>

        {/* Quick Prompts */}
        <Box mb={3}>
          <Typography variant="subtitle2" fontWeight={600} mb={1} color="text.secondary">
            Quick Actions:
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {quickPrompts.map((prompt, index) => (
              <Chip
                key={index}
                label={prompt}
                size="small"
                onClick={() => setQuery(prompt)}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    background: colors.primary.light + '20',
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Query Input */}
        <Box mb={2}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Ask me anything about this section... For example: 'Help me write inclusion criteria for a Phase 2 oncology trial' or 'What regulatory requirements should I consider?'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleAskAI();
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                background: 'white',
              },
            }}
          />
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
            <Typography variant="caption" color="text.secondary">
              Press Ctrl+Enter to send
            </Typography>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={16} /> : <SendIcon />}
              onClick={handleAskAI}
              disabled={loading || !query.trim()}
              sx={{
                background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
                minWidth: 100,
              }}
            >
              {loading ? 'Thinking...' : 'Ask AI'}
            </Button>
          </Box>
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* AI Response */}
        {response && (
          <Box flex={1} sx={{ overflowY: 'auto' }}>
            {/* Main Response */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={1}>
                  <LightbulbIcon sx={{ color: colors.semantic.warning }} />
                  <Typography variant="subtitle1" fontWeight={600}>
                    AI Response
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6,
                    background: 'white',
                    p: 2,
                    borderRadius: 1,
                    border: `1px solid ${colors.primary.light}20`,
                  }}
                >
                  {response.content}
                </Typography>
                {onContentSuggestion && (
                  <Button
                    startIcon={<AutoFixIcon />}
                    onClick={() => handleApplySuggestion(response.content)}
                    sx={{ mt: 2 }}
                  >
                    Apply to Section
                  </Button>
                )}
              </AccordionDetails>
            </Accordion>

            {/* Suggestions */}
            {response.suggestions && response.suggestions.length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <SearchIcon sx={{ color: colors.primary.main }} />
                    <Typography variant="subtitle1" fontWeight={600}>
                      Related Questions ({response.suggestions.length})
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {response.suggestions.map((suggestion, index) => (
                      <ListItem
                        key={index}
                        button
                        onClick={() => setQuery(suggestion)}
                        sx={{
                          borderRadius: 1,
                          mb: 0.5,
                          '&:hover': {
                            background: colors.primary.light + '10',
                          },
                        }}
                      >
                        <ListItemIcon>
                          <LightbulbIcon sx={{ fontSize: 16, color: colors.semantic.info }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={suggestion}
                          primaryTypographyProps={{
                            variant: 'body2',
                            sx: { cursor: 'pointer' },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Citations */}
            {response.citations && response.citations.length > 0 && (
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LinkIcon sx={{ color: colors.semantic.success }} />
                    <Typography variant="subtitle1" fontWeight={600}>
                      References ({response.citations.length})
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {response.citations.map((citation, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <LinkIcon sx={{ fontSize: 16, color: colors.semantic.success }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={citation}
                          primaryTypographyProps={{
                            variant: 'body2',
                            component: 'a',
                            href: citation.startsWith('http') ? citation : `https://www.google.com/search?q=${encodeURIComponent(citation)}`,
                            target: '_blank',
                            rel: 'noopener noreferrer',
                            sx: {
                              color: colors.primary.main,
                              textDecoration: 'none',
                              '&:hover': {
                                textDecoration: 'underline',
                              },
                            },
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            )}
          </Box>
        )}

        {/* Empty State */}
        {!response && !loading && (
          <Box
            flex={1}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            color="text.secondary"
          >
            <AIIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
            <Typography variant="h6" gutterBottom>
              AI Assistant Ready
            </Typography>
            <Typography variant="body2" sx={{ maxWidth: 300 }}>
              Ask me anything about the {sectionName} section. I can help with content generation, 
              regulatory guidance, best practices, and more.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};