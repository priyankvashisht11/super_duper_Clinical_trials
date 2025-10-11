import React from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import { medicalConditions, type MedicalCondition } from '../../data/medicalConditions';

interface ConditionAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const ConditionAutocomplete: React.FC<ConditionAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'Search medical conditions...',
}) => {
  const [inputValue, setInputValue] = React.useState(value);

  const handleChange = (_event: any, newValue: string | MedicalCondition | null) => {
    const conditionName = newValue && typeof newValue === 'object' ? newValue.name : (typeof newValue === 'string' ? newValue : '');
    onChange(conditionName);
    setInputValue(conditionName);
  };

  const handleInputChange = (_event: any, newInputValue: string) => {
    setInputValue(newInputValue);
    // Allow free text input
    if (!newInputValue) {
      onChange('');
    }
  };

  const handleBlur = () => {
    // If user typed something that doesn't match any option, use it as free text
    if (inputValue && !medicalConditions.find(c => c.name === inputValue)) {
      onChange(inputValue);
    }
  };

  // Filter options based on input
  const filterOptions = (options: MedicalCondition[], { inputValue }: any) => {
    const filtered = options.filter((option) => {
      const searchText = inputValue.toLowerCase();
      return (
        option.name.toLowerCase().includes(searchText) ||
        option.category.toLowerCase().includes(searchText) ||
        (option.synonyms && option.synonyms.some(synonym => 
          synonym.toLowerCase().includes(searchText)
        ))
      );
    });
    
    return filtered.slice(0, 10); // Limit to 10 results for performance
  };

  const getOptionLabel = (option: MedicalCondition | string) => {
    if (typeof option === 'string') return option;
    return option.name;
  };

  const renderOption = (props: any, option: MedicalCondition) => (
    <Box component="li" {...props} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {option.name}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
        <Chip
          label={option.category}
          size="small"
          variant="outlined"
          sx={{ fontSize: '0.75rem', height: 20 }}
        />
        {option.synonyms && option.synonyms.length > 0 && (
          <Typography variant="caption" color="text.secondary">
            Also: {option.synonyms.slice(0, 2).join(', ')}
            {option.synonyms.length > 2 && '...'}
          </Typography>
        )}
      </Box>
    </Box>
  );

  const selectedOption = medicalConditions.find(c => c.name === value) || null;

  return (
    <Autocomplete
      options={medicalConditions}
      value={selectedOption}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onBlur={handleBlur}
      filterOptions={filterOptions}
      getOptionLabel={getOptionLabel}
      renderOption={renderOption}
      freeSolo
      clearOnBlur={false}
      selectOnFocus
      handleHomeEndKeys
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          variant="outlined"
          size="small"
          fullWidth
          InputProps={{
            ...params.InputProps,
            sx: {
              fontSize: '0.875rem',
            },
          }}
        />
      )}
      sx={{
        '& .MuiAutocomplete-paper': {
          maxHeight: 300,
        },
      }}
    />
  );
};