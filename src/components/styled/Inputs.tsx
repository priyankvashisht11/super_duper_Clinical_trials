import { styled } from '@mui/material/styles';
import { TextField, Autocomplete, Slider, FormControl, InputBase } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { colors } from '../../styles/theme';

// Search input with special styling
export const SearchInput = styled(InputBase)(({ theme }) => ({
  flex: 1,
  height: 56,
  padding: '0 20px',
  fontSize: '1rem',
  backgroundColor: colors.background.default,
  border: `2px solid ${colors.border.light}`,
  borderRadius: '28px 0 0 28px',
  borderRight: 'none',
  
  '&:hover': {
    borderColor: colors.primary.main,
  },
  
  '&.Mui-focused': {
    borderColor: colors.primary.main,
    boxShadow: `0 0 0 3px ${alpha(colors.primary.main, 0.1)}`,
  },
  
  '& input': {
    padding: 0,
    
    '&::placeholder': {
      color: colors.text.disabled,
      opacity: 1,
    },
  },
  
  [theme.breakpoints.down('sm')]: {
    height: 48,
    fontSize: '0.9375rem',
    padding: '0 16px',
    borderRadius: '24px 0 0 24px',
  },
}));

// Standard form input
export const FormInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    backgroundColor: colors.background.default,
    
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.primary.main,
    },
    
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderWidth: 2,
      borderColor: colors.primary.main,
    },
  },
  
  '& .MuiInputLabel-root': {
    fontWeight: 500,
    color: colors.text.secondary,
    
    '&.Mui-focused': {
      color: colors.primary.main,
    },
  },
  
  '& .MuiFormHelperText-root': {
    fontSize: '0.8125rem',
    marginTop: theme.spacing(0.5),
  },
}));

// Autocomplete with medical styling
export const MedicalAutocomplete = styled(Autocomplete)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    padding: '4px 8px',
    borderRadius: 8,
    
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.primary.main,
    },
    
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderWidth: 2,
      borderColor: colors.primary.main,
    },
  },
  
  '& .MuiAutocomplete-paper': {
    borderRadius: 8,
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    border: `1px solid ${colors.border.light}`,
    marginTop: theme.spacing(0.5),
  },
  
  '& .MuiAutocomplete-option': {
    padding: '8px 16px',
    
    '&:hover': {
      backgroundColor: alpha(colors.primary.main, 0.04),
    },
    
    '&[aria-selected="true"]': {
      backgroundColor: alpha(colors.primary.main, 0.08),
    },
  },
  
  '& .MuiAutocomplete-tag': {
    backgroundColor: alpha(colors.primary.main, 0.1),
    color: colors.primary.dark,
    borderRadius: 12,
    fontSize: '0.8125rem',
    
    '& .MuiChip-deleteIcon': {
      color: colors.primary.main,
      
      '&:hover': {
        color: colors.primary.dark,
      },
    },
  },
}));

// Research question input
export const ResearchQuestionInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    backgroundColor: colors.background.surface,
    
    '& textarea': {
      fontSize: '0.9375rem',
      lineHeight: 1.5,
    },
  },
  
  '& .MuiInputLabel-root': {
    fontWeight: 500,
  },
}));

// Filter slider
export const FilterSlider = styled(Slider)(({ theme }) => ({
  color: colors.primary.main,
  height: 6,
  
  '& .MuiSlider-track': {
    border: 'none',
    borderRadius: 3,
  },
  
  '& .MuiSlider-thumb': {
    height: 20,
    width: 20,
    backgroundColor: colors.background.default,
    border: `2px solid ${colors.primary.main}`,
    
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: `0 0 0 8px ${alpha(colors.primary.main, 0.16)}`,
    },
    
    '&:before': {
      display: 'none',
    },
  },
  
  '& .MuiSlider-valueLabel': {
    lineHeight: 1.2,
    fontSize: 12,
    background: 'unset',
    padding: 0,
    width: 32,
    height: 32,
    borderRadius: '50% 50% 50% 0',
    backgroundColor: colors.primary.main,
    transformOrigin: 'bottom left',
    transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
    
    '&:before': {
      display: 'none',
    },
    
    '&.MuiSlider-valueLabelOpen': {
      transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
    },
    
    '& > *': {
      transform: 'rotate(45deg)',
    },
  },
}));

// Checkbox group container
export const CheckboxGroup = styled(FormControl)(({ theme }) => ({
  '& .MuiFormGroup-root': {
    gap: theme.spacing(0.5),
  },
  
  '& .MuiFormControlLabel-root': {
    margin: 0,
    padding: theme.spacing(0.5, 1),
    borderRadius: 6,
    
    '&:hover': {
      backgroundColor: alpha(colors.primary.main, 0.04),
    },
  },
  
  '& .MuiCheckbox-root': {
    color: colors.text.disabled,
    
    '&.Mui-checked': {
      color: colors.primary.main,
    },
  },
  
  '& .MuiFormControlLabel-label': {
    fontSize: '0.875rem',
    color: colors.text.primary,
  },
}));

// Radio group with medical styling
export const RadioGroup = styled(FormControl)(({ theme }) => ({
  '& .MuiFormGroup-root': {
    gap: theme.spacing(0.5),
  },
  
  '& .MuiFormControlLabel-root': {
    margin: 0,
    padding: theme.spacing(0.5, 1),
    borderRadius: 6,
    
    '&:hover': {
      backgroundColor: alpha(colors.primary.main, 0.04),
    },
  },
  
  '& .MuiRadio-root': {
    color: colors.text.disabled,
    
    '&.Mui-checked': {
      color: colors.primary.main,
    },
  },
}));

// Location input with map integration
export const LocationInput = styled(FormInput)(({ theme }) => ({
  '& .MuiInputAdornment-root': {
    color: colors.text.secondary,
  },
}));

// File upload input
export const FileUploadInput = styled('input')({
  display: 'none',
});

export const FileUploadLabel = styled('label')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: '10px 20px',
  borderRadius: 8,
  border: `2px dashed ${colors.border.main}`,
  backgroundColor: colors.background.surface,
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  
  '&:hover': {
    borderColor: colors.primary.main,
    backgroundColor: alpha(colors.primary.main, 0.02),
  },
  
  '&.dragover': {
    borderColor: colors.primary.main,
    backgroundColor: alpha(colors.primary.main, 0.04),
  },
}));

// Search suggestions dropdown
export const SearchSuggestions = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  backgroundColor: colors.background.default,
  border: `1px solid ${colors.border.light}`,
  borderTop: 'none',
  borderRadius: '0 0 8px 8px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
  zIndex: 1000,
  maxHeight: 300,
  overflowY: 'auto',
}));

export const SuggestionItem = styled('div')(({ theme }) => ({
  padding: '12px 16px',
  cursor: 'pointer',
  borderBottom: `1px solid ${colors.border.light}`,
  
  '&:hover': {
    backgroundColor: alpha(colors.primary.main, 0.04),
  },
  
  '&:last-child': {
    borderBottom: 'none',
  },
  
  '& .suggestion-text': {
    fontSize: '0.9375rem',
    color: colors.text.primary,
  },
  
  '& .suggestion-category': {
    fontSize: '0.8125rem',
    color: colors.text.secondary,
    marginTop: theme.spacing(0.5),
  },
}));