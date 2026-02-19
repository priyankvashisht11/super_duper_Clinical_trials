import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Box, Typography, TextField, MenuItem, Button, CircularProgress, 
  alpha, Fade, IconButton, Tooltip, InputAdornment, Alert, Collapse 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Save, Warning as WarningIcon, AutoAwesome as AIIcon,
  CheckCircle as CheckIcon, Info as InfoIcon 
} from '@mui/icons-material';
import { useProtocol } from '../../contexts/ProtocolContext';
import { useValidation } from '../../hooks/useValidation';
import { aiService } from '../../services/aiService';
import { colors } from '../../styles/theme';
import { generateFieldAssistancePrompt, getFieldGuidance, validateFieldContext } from '../../utils/aiFieldAssistance';

const FormHeader = styled(Box)(() => ({
  paddingBottom: 24,
  borderBottom: `2px solid ${alpha(colors.primary.main, 0.1)}`,
}));

const FormSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
});

const FormRow = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: 20,
});

const StyledTextField = styled(TextField)(() => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    background: '#ffffff',
    transition: 'all 0.2s ease',
    
    '&:hover': {
      boxShadow: `0 2px 8px ${alpha(colors.primary.main, 0.1)}`,
    },
    
    '&.Mui-focused': {
      boxShadow: `0 4px 12px ${alpha(colors.primary.main, 0.15)}`,
    },
  },
  
  '& .MuiInputLabel-root': {
    fontWeight: 500,
    color: colors.text.secondary,
    
    '&.Mui-focused': {
      color: colors.primary.main,
    },
  },
}));

const SaveButton = styled(Button)(() => ({
  borderRadius: 12,
  padding: '12px 32px',
  fontSize: '1rem',
  fontWeight: 600,
  background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
  boxShadow: `0 4px 12px ${alpha(colors.primary.main, 0.3)}`,
  
  '&:hover': {
    background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.secondary.dark} 100%)`,
    boxShadow: `0 6px 16px ${alpha(colors.primary.main, 0.4)}`,
    transform: 'translateY(-2px)',
  },
  
  '&:disabled': {
    background: colors.text.disabled,
    boxShadow: 'none',
  },
}));

const UnsavedIndicator = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 16px',
  borderRadius: 8,
  background: alpha(colors.semantic.warning, 0.1),
  border: `1px solid ${alpha(colors.semantic.warning, 0.3)}`,
}));

const AISuggestionBox = styled(Box)(() => ({
  marginTop: 8,
  padding: 12,
  borderRadius: 8,
  background: `${colors.primary.main}10`,
  border: `2px solid ${colors.primary.main}`,
}));

interface ProtocolMetadata {
  sponsorProtocolIdentifier: string;
  fullTitle: string;
  shortTitle?: string;
  protocolVersion: string;
  protocolDate: string;
  trialPhase?: string;
  indication?: string;
  studyType?: string;
}

export const ProtocolMetadataFormEnhanced: React.FC = () => {
  const { protocol, updateProtocol, loading } = useProtocol();
  const { validateProtocol } = useValidation();
  const { register, handleSubmit, reset, formState: { errors, isDirty }, setValue, watch } = useForm<ProtocolMetadata>({
    defaultValues: {
      sponsorProtocolIdentifier: '',
      fullTitle: '',
      shortTitle: '',
      protocolVersion: '',
      protocolDate: '',
      trialPhase: '',
      indication: '',
      studyType: ''
    }
  });

  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<{ field: string; text: string } | null>(null);
  const [showGuidance, setShowGuidance] = useState<string | null>(null);
  const [fieldWarnings, setFieldWarnings] = useState<Record<string, string>>({});

  const watchedFields = watch();

  useEffect(() => {
    if (protocol) {
      reset({
        sponsorProtocolIdentifier: protocol.sponsorProtocolIdentifier || '',
        fullTitle: protocol.fullTitle || '',
        shortTitle: protocol.shortTitle || '',
        protocolVersion: protocol.protocolVersion || '',
        protocolDate: protocol.protocolDate ? protocol.protocolDate.split('T')[0] : '',
        trialPhase: protocol.trialPhase || '',
        indication: protocol.indication || '',
        studyType: protocol.studyType || ''
      });
    }
  }, [protocol, reset]);

  const handleAIAssist = async (field: 'indication' | 'fullTitle') => {
    setAiLoading(field);
    setAiSuggestion(null);

    try {
      // Generate intelligent, context-aware prompt
      const promptConfig = generateFieldAssistancePrompt(
        field,
        watchedFields[field] || '',
        watchedFields
      );

      const response = await aiService.getSectionAssistance(
        'metadata',
        { [field]: watchedFields[field] },
        promptConfig.userPrompt,
        watchedFields
      );

      // Clean up the response - remove any explanatory text
      let cleanedText = response.content.trim();
      
      // Remove common AI response patterns
      cleanedText = cleanedText
        .replace(/^(Here's|Here is|I suggest|Suggestion:|Based on|The indication is:?)\s*/i, '')
        .replace(/^["']|["']$/g, '') // Remove quotes
        .replace(/\n.*/g, '') // Take only first line
        .trim();

      setAiSuggestion({ field, text: cleanedText });
    } catch (error) {
      console.error('AI assist error:', error);
      
      // No fallback - if AI fails, show error message
      console.error('AI assistance failed and no valid response available');
      alert('AI assistance is temporarily unavailable. Please enter the value manually or try again in a moment.');
    } finally {
      setAiLoading(null);
    }
  };

  // Validate field context when values change
  useEffect(() => {
    const newWarnings: Record<string, string> = {};
    
    // Validate indication
    const indicationValue = watchedFields['indication'];
    const phaseValue = watchedFields.trialPhase;
    
    if (indicationValue && phaseValue) {
      const validation = validateFieldContext('indication', indicationValue, watchedFields);
      if (validation.warning) {
        newWarnings['indication'] = validation.warning;
      }
    }
    
    setFieldWarnings(newWarnings);
  }, [watchedFields]);

  const handleUseSuggestion = () => {
    if (aiSuggestion) {
      setValue(aiSuggestion.field as any, aiSuggestion.text, { shouldDirty: true });
      setAiSuggestion(null);
    }
  };

  const onSubmit = async (data: ProtocolMetadata) => {
    await updateProtocol(data);
    
    // AUTO-VALIDATE after metadata save
    if (protocol?.id) {
      await validateProtocol(protocol.id);
    }
  };

  if (!protocol) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FormHeader>
        <Typography 
          variant="h4" 
          fontWeight={700}
          sx={{ 
            mb: 1,
            background: `linear-gradient(45deg, ${colors.primary.main}, ${colors.secondary.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Protocol Metadata
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Basic information about your clinical trial protocol (ICH M11 compliant)
        </Typography>
      </FormHeader>

      <FormSection>
        {/* Sponsor Protocol Identifier */}
        <StyledTextField
          {...register('sponsorProtocolIdentifier', { required: 'This field is required' })}
          label="Sponsor Protocol Identifier *"
          placeholder="e.g., ABC-2024-001"
          required
          error={!!errors.sponsorProtocolIdentifier}
          helperText={errors.sponsorProtocolIdentifier?.message || 'Unique identifier assigned by sponsor'}
          fullWidth
        />

        {/* Full Title with AI Assist */}
        <Box>
          <StyledTextField
            {...register('fullTitle', { required: 'This field is required' })}
            label="Full Protocol Title *"
            placeholder="Enter the complete protocol title following ICH M11 guidelines"
            required
            error={!!errors.fullTitle}
            helperText={errors.fullTitle?.message || 'Complete title including phase, design, intervention, and indication'}
            multiline
            rows={3}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="AI Generate Title">
                    <IconButton
                      onClick={() => handleAIAssist('fullTitle')}
                      disabled={aiLoading === 'fullTitle'}
                      sx={{
                        background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.secondary.main})`,
                        color: 'white',
                        '&:hover': {
                          background: `linear-gradient(135deg, ${colors.primary.dark}, ${colors.secondary.dark})`,
                        }
                      }}
                    >
                      {aiLoading === 'fullTitle' ? <CircularProgress size={20} color="inherit" /> : <AIIcon />}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              )
            }}
          />
          {aiSuggestion?.field === 'fullTitle' && (
            <AISuggestionBox>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                <Typography variant="caption" fontWeight={700} color="primary">
                  AI Suggested Title:
                </Typography>
                <Button
                  size="small"
                  startIcon={<CheckIcon />}
                  onClick={handleUseSuggestion}
                  sx={{ textTransform: 'none' }}
                >
                  Use This
                </Button>
              </Box>
              <Typography variant="body2">{aiSuggestion.text}</Typography>
            </AISuggestionBox>
          )}
        </Box>

        {/* Short Title */}
        <StyledTextField
          {...register('shortTitle')}
          label="Short Title"
          placeholder="Abbreviated title for easy reference"
          helperText="Optional: Brief version for internal use"
          fullWidth
        />

        {/* Protocol Version and Date */}
        <FormRow>
          <StyledTextField
            {...register('protocolVersion', { required: 'This field is required' })}
            label="Protocol Version *"
            placeholder="e.g., 1.0"
            required
            error={!!errors.protocolVersion}
            helperText={errors.protocolVersion?.message || 'Version number (e.g., 1.0, 2.0)'}
          />

          <StyledTextField
            {...register('protocolDate', { required: 'This field is required' })}
            label="Protocol Date *"
            type="date"
            required
            error={!!errors.protocolDate}
            helperText={errors.protocolDate?.message || 'Date of this protocol version'}
            InputLabelProps={{ shrink: true }}
          />
        </FormRow>

        {/* Trial Phase */}
        <StyledTextField
          {...register('trialPhase')}
          label="Trial Phase"
          select
          helperText="Select the clinical trial phase (required for ICH M11)"
          fullWidth
        >
          <MenuItem value="">Select phase...</MenuItem>
          <MenuItem value="Phase I">Phase I - First-in-Human, Safety & Dosing</MenuItem>
          <MenuItem value="Phase II">Phase II - Efficacy & Safety in Target Population</MenuItem>
          <MenuItem value="Phase III">Phase III - Confirmatory Efficacy & Safety</MenuItem>
          <MenuItem value="Phase IV">Phase IV - Post-Marketing Surveillance</MenuItem>
          <MenuItem value="Phase I/II">Phase I/II - Combined Early Phase</MenuItem>
          <MenuItem value="Phase II/III">Phase II/III - Seamless Design</MenuItem>
        </StyledTextField>

        {/* Indication with AI Assist */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="body2" fontWeight={600} color="text.secondary">
              Indication
            </Typography>
            <Tooltip title="Show field guidance">
              <IconButton 
                size="small" 
                onClick={() => setShowGuidance(showGuidance === 'indication' ? null : 'indication')}
                sx={{ color: colors.primary.main }}
              >
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Collapse in={showGuidance === 'indication'}>
            <Alert 
              severity="info" 
              sx={{ mb: 2, backgroundColor: alpha(colors.primary.main, 0.05) }}
              icon={<InfoIcon sx={{ color: colors.primary.main }} />}
            >
              <Typography variant="body2" fontWeight={600} gutterBottom>
                What is this field?
              </Typography>
              <Typography variant="body2" paragraph>
                {getFieldGuidance('indication')?.whatToFill}
              </Typography>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Examples:
              </Typography>
              <Box component="ul" sx={{ mt: 0.5, pl: 2 }}>
                {getFieldGuidance('indication')?.examples.slice(0, 3).map((ex, i) => (
                  <Typography key={i} component="li" variant="body2">
                    {ex}
                  </Typography>
                ))}
              </Box>
            </Alert>
          </Collapse>
          
          <StyledTextField
            {...register('indication')}
            label="Indication"
            placeholder="e.g., Type 2 Diabetes Mellitus"
            helperText={fieldWarnings['indication'] || "Target disease or medical condition (required for validation)"}
            fullWidth
            error={!!fieldWarnings['indication']}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="AI Suggest Indication">
                    <IconButton
                      onClick={() => handleAIAssist('indication')}
                      disabled={aiLoading === 'indication'}
                      sx={{
                        background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.secondary.main})`,
                        color: 'white',
                        '&:hover': {
                          background: `linear-gradient(135deg, ${colors.primary.dark}, ${colors.secondary.dark})`,
                        }
                      }}
                    >
                      {aiLoading === 'indication' ? <CircularProgress size={20} color="inherit" /> : <AIIcon />}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              )
            }}
          />
          {aiSuggestion?.field === 'indication' && (
            <AISuggestionBox>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="caption" fontWeight={700} color="primary">
                  AI Suggested Indication:
                </Typography>
                <Button
                  size="small"
                  startIcon={<CheckIcon />}
                  onClick={handleUseSuggestion}
                  sx={{ textTransform: 'none' }}
                >
                  Use This
                </Button>
              </Box>
              <Typography variant="body2">{aiSuggestion.text}</Typography>
            </AISuggestionBox>
          )}
        </Box>

        {/* Study Type */}
        <StyledTextField
          {...register('studyType')}
          label="Study Type"
          select
          helperText="Classification of study design"
          fullWidth
        >
          <MenuItem value="">Select type...</MenuItem>
          <MenuItem value="Interventional">Interventional - Testing intervention effects</MenuItem>
          <MenuItem value="Observational">Observational - No intervention assignment</MenuItem>
          <MenuItem value="Expanded Access">Expanded Access - Compassionate use</MenuItem>
        </StyledTextField>
      </FormSection>

      {/* Footer */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pt: 3,
          borderTop: `2px solid ${alpha(colors.primary.main, 0.1)}`,
        }}
      >
        {isDirty ? (
          <Fade in>
            <UnsavedIndicator>
              <WarningIcon sx={{ fontSize: 20, color: colors.semantic.warning }} />
              <Typography variant="body2" fontWeight={600} sx={{ color: colors.semantic.warning }}>
                Unsaved changes
              </Typography>
            </UnsavedIndicator>
          </Fade>
        ) : (
          <Box />
        )}

        <SaveButton
          type="submit"
          variant="contained"
          disabled={loading || !isDirty}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
        >
          {loading ? 'Saving...' : 'Save & Validate'}
        </SaveButton>
      </Box>
    </Box>
  );
};
