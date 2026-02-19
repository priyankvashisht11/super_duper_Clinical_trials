import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  Box,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fade,
  Alert,
  alpha
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  AutoAwesome as AIIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { useAICoPilot } from '../../contexts/AICoPilotContext';
import { colors } from '../../styles/theme';

interface AIEnhancedInputProps {
  fieldName: string;
  fieldType: string;
  sectionNumber: string;
  protocolContext: any;
  value: string;
  onChange: (value: string) => void;
  label: string;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
}

export const AIEnhancedInput: React.FC<AIEnhancedInputProps> = ({
  fieldName,
  fieldType,
  sectionNumber,
  protocolContext,
  value,
  onChange,
  label,
  multiline = false,
  rows = 1,
  required = false,
  placeholder,
  helperText
}) => {
  const { setCurrentField, suggestions, validation, isAnalyzing } = useAICoPilot();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isFocused) {
      setCurrentField({
        fieldName,
        fieldValue: value,
        fieldType,
        sectionNumber,
        protocolContext
      });
    }
  }, [value, isFocused, fieldName, fieldType, sectionNumber]);

  useEffect(() => {
    setShowSuggestions(suggestions.length > 0 && isFocused && value.length > 3);
    setSelectedIndex(0);
  }, [suggestions, isFocused, value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Tab' && showSuggestions) {
      e.preventDefault();
      applySuggestion(suggestions[selectedIndex]);
    } else if (e.key === 'Enter' && showSuggestions && !multiline) {
      e.preventDefault();
      applySuggestion(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const applySuggestion = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  const getValidationColor = () => {
    if (!validation) return undefined;
    switch (validation.status) {
      case 'valid': return colors.semantic.success;
      case 'warning': return colors.semantic.warning;
      case 'error': return colors.semantic.error;
      default: return colors.text.secondary;
    }
  };

  const getValidationIcon = () => {
    if (!validation) return null;
    switch (validation.status) {
      case 'valid': return <CheckIcon />;
      case 'warning': return <WarningIcon />;
      case 'error': return <ErrorIcon />;
      default: return null;
    }
  };

  return (
    <Box position="relative">
      <TextField
        inputRef={inputRef}
        fullWidth
        label={
          <Box display="flex" alignItems="center" gap={1}>
            {label}
            {required && <span style={{ color: colors.semantic.error }}>*</span>}
            {isAnalyzing && isFocused && (
              <CircularProgress size={12} sx={{ ml: 1 }} />
            )}
          </Box>
        }
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        multiline={multiline}
        rows={rows}
        placeholder={placeholder || ''}
        helperText={helperText || ''}
        InputProps={{
          endAdornment: (
            <Box display="flex" alignItems="center" gap={1}>
              {validation && isFocused && (
                <Box sx={{ color: getValidationColor(), display: 'flex' }}>
                  {getValidationIcon()}
                </Box>
              )}
              {suggestions.length > 0 && isFocused && (
                <Chip
                  icon={<AIIcon />}
                  label={`${suggestions.length} AI`}
                  size="small"
                  sx={{
                    background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.7rem'
                  }}
                />
              )}
            </Box>
          )
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: getValidationColor() || undefined,
              borderWidth: validation && isFocused ? 2 : 1,
              transition: 'all 0.3s ease'
            }
          }
        }}
      />

      {/* AI Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <Fade in>
          <Paper
            elevation={8}
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              mt: 0.5,
              zIndex: 1300,
              maxHeight: 300,
              overflow: 'auto',
              border: `2px solid ${colors.primary.main}`
            }}
          >
            <Box
              p={1}
              sx={{
                background: `linear-gradient(135deg, ${alpha(colors.primary.main, 0.2)} 0%, ${alpha(colors.secondary.main, 0.2)} 100%)`
              }}
            >
              <Typography variant="caption" fontWeight={700} display="flex" alignItems="center" gap={0.5}>
                <AIIcon fontSize="small" />
                AI Suggestions (Tab/Enter to use, ↑↓ to navigate, Esc to dismiss)
              </Typography>
            </Box>
            <List dense disablePadding>
              {suggestions.map((suggestion, index) => (
                <ListItem
                  key={index}
                  component="li"
                  onClick={() => applySuggestion(suggestion)}
                  sx={{
                    py: 1.5,
                    cursor: 'pointer',
                    backgroundColor: index === selectedIndex ? alpha(colors.primary.main, 0.2) : 'transparent',
                    '&:hover': {
                      backgroundColor: alpha(colors.primary.main, 0.3)
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <ArrowIcon sx={{ color: colors.primary.main, fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={suggestion}
                    primaryTypographyProps={{
                      variant: 'body2',
                      sx: {
                        fontWeight: index === selectedIndex ? 600 : 400
                      }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Fade>
      )}

      {/* Validation Message */}
      {validation && validation.message && isFocused && (
        <Fade in>
          <Alert
            severity={
              validation.status === 'valid' ? 'success' :
              validation.status === 'warning' ? 'warning' :
              validation.status === 'error' ? 'error' : 'info'
            }
            sx={{ mt: 1 }}
            icon={getValidationIcon()}
          >
            <Typography variant="body2">
              {validation.message}
            </Typography>
          </Alert>
        </Fade>
      )}
    </Box>
  );
};
