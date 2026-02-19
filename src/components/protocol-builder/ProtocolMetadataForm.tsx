import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Box, Typography, TextField, MenuItem, Button, CircularProgress, alpha, Fade } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Save, Warning as WarningIcon } from '@mui/icons-material';
import { useProtocol } from '../../contexts/ProtocolContext';
import { useValidation } from '../../hooks/useValidation';
import { colors } from '../../styles/theme';

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

export const ProtocolMetadataForm: React.FC = () => {
  const { protocol, updateProtocol, loading } = useProtocol();
  const { validateProtocol } = useValidation();
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ProtocolMetadata>({
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
          Basic information about your clinical trial protocol
        </Typography>
      </FormHeader>

      <FormSection>
        {/* Sponsor Protocol Identifier */}
        <StyledTextField
          {...register('sponsorProtocolIdentifier', { required: 'This field is required' })}
          label="Sponsor Protocol Identifier"
          placeholder="e.g., ABC-2024-001"
          required
          error={!!errors.sponsorProtocolIdentifier}
          helperText={errors.sponsorProtocolIdentifier?.message}
          fullWidth
        />

        {/* Full Title */}
        <StyledTextField
          {...register('fullTitle', { required: 'This field is required' })}
          label="Full Protocol Title"
          placeholder="Enter the complete protocol title"
          required
          error={!!errors.fullTitle}
          helperText={errors.fullTitle?.message}
          multiline
          rows={3}
          fullWidth
        />

        {/* Short Title */}
        <StyledTextField
          {...register('shortTitle')}
          label="Short Title"
          placeholder="Abbreviated title for easy reference"
          fullWidth
        />

        {/* Protocol Version and Date */}
        <FormRow>
          <StyledTextField
            {...register('protocolVersion', { required: 'This field is required' })}
            label="Protocol Version"
            placeholder="e.g., 1.0"
            required
            error={!!errors.protocolVersion}
            helperText={errors.protocolVersion?.message}
          />

          <StyledTextField
            {...register('protocolDate', { required: 'This field is required' })}
            label="Protocol Date"
            type="date"
            required
            error={!!errors.protocolDate}
            helperText={errors.protocolDate?.message}
            InputLabelProps={{ shrink: true }}
          />
        </FormRow>

        {/* Trial Phase */}
        <StyledTextField
          {...register('trialPhase')}
          label="Trial Phase"
          select
          fullWidth
        >
          <MenuItem value="">Select phase...</MenuItem>
          <MenuItem value="Phase I">Phase I</MenuItem>
          <MenuItem value="Phase II">Phase II</MenuItem>
          <MenuItem value="Phase III">Phase III</MenuItem>
          <MenuItem value="Phase IV">Phase IV</MenuItem>
          <MenuItem value="Phase I/II">Phase I/II</MenuItem>
          <MenuItem value="Phase II/III">Phase II/III</MenuItem>
        </StyledTextField>

        {/* Indication */}
        <StyledTextField
          {...register('indication')}
          label="Indication"
          placeholder="e.g., Type 2 Diabetes Mellitus"
          fullWidth
        />

        {/* Study Type */}
        <StyledTextField
          {...register('studyType')}
          label="Study Type"
          select
          fullWidth
        >
          <MenuItem value="">Select type...</MenuItem>
          <MenuItem value="Interventional">Interventional</MenuItem>
          <MenuItem value="Observational">Observational</MenuItem>
          <MenuItem value="Expanded Access">Expanded Access</MenuItem>
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
          {loading ? 'Saving...' : 'Save Changes'}
        </SaveButton>
      </Box>
    </Box>
  );
};
