import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Popper,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Chip,
  CircularProgress,
  Fade,
  ClickAwayListener,
} from '@mui/material';
import {
  Psychology as AIIcon,
  Lightbulb as LightbulbIcon,
  AutoFixHigh as AutoFixIcon,
} from '@mui/icons-material';
import { colors } from '../../styles/theme';
import { aiService } from '../../services/aiService';
import type { AIFormSuggestionsResponse } from '../../services/aiService';
import { useDebounce } from '../../utils/performance';

interface AISmartSuggestionsProps {
  sectionName: string;
  fieldName: string;
  value: string;
  protocolContext?: any;
  onSuggestionSelect: (suggestion: string) => void;
  anchorEl?: HTMLElement | null;
  open?: boolean;
  onClose?: () => void;
}

export const AISmartSuggestions: React.FC<AISmartSuggestionsProps> = ({
  sectionName,
  fieldName,
  value,
  protocolContext,
  onSuggestionSelect,
  anchorEl,
  open = false,
  onClose,
}) => {
  const [suggestions, setSuggestions] = useState<AIFormSuggestionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debouncedValue = useDebounce(value, 1000);
  const previousValue = useRef<string>('');

  const fetchSuggestions = async () => {
    if (!debouncedValue || debouncedValue.length < 3 || debouncedValue === previousValue.current) {
      return;
    }

    setLoading(true);
    setError(null);
    previousValue.current = debouncedValue;

    try {
      const result = await aiService.getFormCompletionSuggestions(
        sectionName,
        fieldName,
        debouncedValue,
        protocolContext
      );
      setSuggestions(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get suggestions');
      setSuggestions(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && debouncedValue) {
      fetchSuggestions();
    }
  }, [debouncedValue, open]);

  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionSelect(suggestion);
    if (onClose) {
      onClose();
    }
  };

  if (!open || !anchorEl) {
    return null;
  }

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement="bottom-start"
      transition
      style={{ zIndex: 1300 }}
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={200}>
          <Paper
            elevation={8}
            sx={{
              minWidth: 300,
              maxWidth: 500,
              maxHeight: 400,
              overflow: 'auto',
              background: `linear-gradient(135deg, ${colors.primary.light}05 0%, ${colors.secondary.light}05 100%)`,
              border: `1px solid ${colors.primary.light}30`,
            }}
          >
            <ClickAwayListener onClickAway={onClose || (() => {})}>
              <Box>
                {/* Header */}
                <Box
                  sx={{
                    p: 2,
                    background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
                    color: 'white',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <AIIcon sx={{ fontSize: 20 }} />
                    <Typography variant="subtitle2" fontWeight={600}>
                      AI Smart Suggestions
                    </Typography>
                    <Chip
                      label={fieldName}
                      size="small"
                      sx={{
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontSize: '0.7rem',
                      }}
                    />
                  </Box>
                </Box>

                {/* Loading State */}
                {loading && (
                  <Box display="flex" alignItems="center" justifyContent="center" p={3}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" color="text.secondary" ml={2}>
                      Getting AI suggestions...
                    </Typography>
                  </Box>
                )}

                {/* Error State */}
                {error && (
                  <Box p={2}>
                    <Typography variant="body2" color="error">
                      {error}
                    </Typography>
                  </Box>
                )}

                {/* Suggestions */}
                {suggestions && !loading && (
                  <Box>
                    {/* Explanation */}
                    {suggestions.explanation && (
                      <Box p={2} sx={{ background: colors.primary.light + '05' }}>
                        <Typography variant="body2" color="text.secondary">
                          {suggestions.explanation}
                        </Typography>
                      </Box>
                    )}

                    {/* Suggestion List */}
                    {suggestions.suggestions.length > 0 && (
                      <List dense>
                        {suggestions.suggestions.map((suggestion, index) => (
                          <ListItem
                            key={index}
                            button
                            onClick={() => handleSuggestionClick(suggestion)}
                            sx={{
                              '&:hover': {
                                background: colors.primary.light + '10',
                              },
                            }}
                          >
                            <ListItemIcon>
                              <LightbulbIcon
                                sx={{
                                  fontSize: 16,
                                  color: colors.semantic.info,
                                }}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={suggestion}
                              primaryTypographyProps={{
                                variant: 'body2',
                                sx: { cursor: 'pointer' },
                              }}
                            />
                            <AutoFixIcon
                              sx={{
                                fontSize: 16,
                                color: colors.primary.main,
                                opacity: 0.7,
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}

                    {/* No Suggestions */}
                    {suggestions.suggestions.length === 0 && (
                      <Box p={2} textAlign="center">
                        <Typography variant="body2" color="text.secondary">
                          No specific suggestions available for this input.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Empty State */}
                {!suggestions && !loading && !error && (
                  <Box p={2} textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      Type more to get AI suggestions...
                    </Typography>
                  </Box>
                )}
              </Box>
            </ClickAwayListener>
          </Paper>
        </Fade>
      )}
    </Popper>
  );
};