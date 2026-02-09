import React, { useState, useCallback, useEffect } from 'react';
import { Box, Card, CardContent, Button, TextField } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { colors } from '../../styles/theme';

const StyledCard = styled(Card)(() => ({
  border: `1px solid ${colors.primary.light}30`,
  borderRadius: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
}));

const GradientButton = styled(Button)(() => ({
  background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 600,
  '&:hover': {
    background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.secondary.dark} 100%)`,
  },
}));

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  placeholder?: string;
  autoSave?: boolean;
  minRows?: number;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  onSave,
  placeholder = 'Enter text...',
  autoSave = true,
  minRows = 8
}) => {
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>(value);

  // Debounced auto-save
  const debouncedSave = useCallback(() => {
    if (autoSave && onSave && value !== lastSaved && value.trim()) {
      setSaving(true);
      onSave();
      setLastSaved(value);
      setTimeout(() => setSaving(false), 500);
    }
  }, [autoSave, onSave, value, lastSaved]);

  useEffect(() => {
    if (autoSave && value !== lastSaved) {
      const timer = setTimeout(debouncedSave, 2000);
      return () => clearTimeout(timer);
    }
  }, [value, debouncedSave, autoSave, lastSaved]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  const handleManualSave = () => {
    if (onSave) {
      setSaving(true);
      onSave();
      setLastSaved(value);
      setTimeout(() => setSaving(false), 500);
    }
  };

  return (
    <Box>
      <StyledCard>
        <CardContent>
          <TextField
            fullWidth
            multiline
            minRows={minRows}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#ffffff',
                '& fieldset': {
                  border: 'none',
                },
                '&:hover fieldset': {
                  border: 'none',
                },
                '&.Mui-focused fieldset': {
                  border: `2px solid ${colors.primary.main}`,
                },
              },
              '& .MuiInputBase-input': {
                fontSize: '0.95rem',
                lineHeight: 1.6,
              },
            }}
          />
        </CardContent>
      </StyledCard>

      {!autoSave && onSave && (
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <GradientButton
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleManualSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </GradientButton>
        </Box>
      )}

      {autoSave && saving && (
        <Box display="flex" justifyContent="flex-end" mt={1}>
          <Box
            sx={{
              fontSize: '0.75rem',
              color: colors.text.secondary,
              fontStyle: 'italic',
            }}
          >
            Auto-saving...
          </Box>
        </Box>
      )}
    </Box>
  );
};