import React, { useState } from 'react';
import {
  IconButton,
  Tooltip,
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Chip,
  Divider,
  alpha
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  Lightbulb as TipIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { aiService } from '../../services/aiService';
import { colors } from '../../styles/theme';

interface AIFieldAssistProps {
  fieldName: string;
  fieldValue: string;
  sectionNumber: string;
  protocolContext?: any;
  onSuggestionSelect: (suggestion: string) => void;
}

export const AIFieldAssist: React.FC<AIFieldAssistProps> = ({
  fieldName,
  fieldValue,
  sectionNumber,
  protocolContext,
  onSuggestionSelect
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [tips, setTips] = useState<string[]>([]);

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    
    if (suggestions.length === 0) {
      setLoading(true);
      try {
        const response = await aiService.getSectionAssistance(
          sectionNumber,
          { [fieldName]: fieldValue },
          `Provide 3-5 specific suggestions to improve or complete this field: "${fieldName}". Current value: "${fieldValue}". Also provide 2-3 best practice tips.`,
          protocolContext
        );
        
        // Parse response to extract suggestions and tips
        const content = response.content;
        const lines = content.split('\n').filter(line => line.trim());
        
        const suggestionsList: string[] = [];
        const tipsList: string[] = [];
        let inSuggestions = false;
        let inTips = false;
        
        lines.forEach(line => {
          if (line.toLowerCase().includes('suggestion')) {
            inSuggestions = true;
            inTips = false;
          } else if (line.toLowerCase().includes('tip') || line.toLowerCase().includes('best practice')) {
            inTips = true;
            inSuggestions = false;
          } else if (line.match(/^[\d\-\*•]/)) {
            const cleaned = line.replace(/^[\d\-\*•.\s]+/, '').trim();
            if (cleaned) {
              if (inSuggestions && suggestionsList.length < 5) {
                suggestionsList.push(cleaned);
              } else if (inTips && tipsList.length < 3) {
                tipsList.push(cleaned);
              }
            }
          }
        });
        
        setSuggestions(suggestionsList.length > 0 ? suggestionsList : [content]);
        setTips(tipsList);
      } catch (error: any) {
        console.error('AI assist error:', error);
        // Show context-aware generic suggestions based on field name
        const genericSuggestions = generateGenericSuggestions(fieldName, fieldValue, protocolContext);
        setSuggestions(genericSuggestions.suggestions);
        setTips(genericSuggestions.tips);
      } finally {
        setLoading(false);
      }
    }
  };

  // Generate context-aware generic suggestions when AI is unavailable
  const generateGenericSuggestions = (_field: string, _value: string, context: any) => {
    const indication = context?.indication || 'the target condition';
    const phase = context?.trialPhase || 'this phase';
    
    const suggestions = [
      `Provide comprehensive details about ${indication} including epidemiology and current treatment landscape`,
      `Describe the unmet medical needs in ${indication} that this trial aims to address`,
      `Include relevant clinical data and statistics supporting the need for this ${phase} trial`,
      `Reference applicable regulatory guidelines and industry standards for ${indication}`,
      `Ensure consistency with the trial objectives and overall protocol design`
    ];
    
    const tips = [
      'Use clear, evidence-based language appropriate for regulatory review',
      'Include citations for referenced studies, guidelines, and statistical data',
      'Maintain consistency in terminology throughout the protocol'
    ];
    
    return { suggestions, tips };
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    if (onSuggestionSelect && typeof onSuggestionSelect === 'function') {
      onSuggestionSelect(suggestion);
    } else {
      console.error('onSuggestionSelect is not a function:', onSuggestionSelect);
    }
    handleClose();
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title="Get AI suggestions for this field">
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{
            background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
            color: 'white',
            width: 32,
            height: 32,
            '&:hover': {
              background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.secondary.dark} 100%)`,
              transform: 'scale(1.05)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          <AIIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
            mt: 1,
            border: `2px solid ${colors.primary.main}`,
            boxShadow: `0 8px 24px ${alpha(colors.primary.main, 0.2)}`
          }
        }}
      >
        <Box
          sx={{
            p: 2,
            background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
            color: 'white'
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <AIIcon />
            <Typography variant="subtitle1" fontWeight={700}>
              AI Suggestions
            </Typography>
          </Box>
          <Typography variant="caption">
            {fieldName}
          </Typography>
        </Box>

        {loading ? (
          <Box display="flex" alignItems="center" justifyContent="center" p={4}>
            <CircularProgress size={40} />
          </Box>
        ) : (
          <>
            {suggestions.length > 0 && (
              <Box p={2}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom display="flex" alignItems="center" gap={0.5}>
                  <ArrowIcon fontSize="small" color="primary" />
                  Click to use:
                </Typography>
                <List dense disablePadding>
                  {suggestions.map((suggestion, index) => (
                    <ListItem key={index} disablePadding>
                      <ListItemButton
                        onClick={() => handleSelectSuggestion(suggestion)}
                        sx={{
                          borderRadius: 1,
                          mb: 0.5,
                          '&:hover': {
                            backgroundColor: alpha(colors.primary.main, 0.1)
                          }
                        }}
                      >
                        <ListItemText
                          primary={suggestion}
                          primaryTypographyProps={{
                            variant: 'body2',
                            sx: { lineHeight: 1.5 }
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {tips.length > 0 && (
              <>
                <Divider />
                <Box p={2}>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom display="flex" alignItems="center" gap={0.5}>
                    <TipIcon fontSize="small" sx={{ color: colors.semantic.warning }} />
                    Best Practices:
                  </Typography>
                  <List dense disablePadding>
                    {tips.map((tip, index) => (
                      <ListItem key={index} sx={{ px: 0, alignItems: 'flex-start' }}>
                        <Chip
                          label={index + 1}
                          size="small"
                          sx={{
                            width: 24,
                            height: 24,
                            fontSize: '0.7rem',
                            mr: 1,
                            mt: 0.5
                          }}
                        />
                        <ListItemText
                          primary={tip}
                          primaryTypographyProps={{
                            variant: 'body2',
                            color: 'text.secondary',
                            sx: { lineHeight: 1.5 }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </>
            )}
          </>
        )}
      </Popover>
    </>
  );
};
