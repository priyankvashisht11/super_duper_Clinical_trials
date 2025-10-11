import React from 'react';
import {
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Tooltip,
} from '@mui/material';
import { CheckboxGroup as StyledCheckboxGroup } from '../styled/Inputs';

interface CheckboxOption {
  value: string;
  label: string;
  description?: string;
  count?: number;
}

interface CheckboxGroupProps {
  options: CheckboxOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  maxHeight?: number;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  options,
  selectedValues,
  onChange,
  maxHeight = 200,
}) => {
  const handleChange = (value: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedValues, value]);
    } else {
      onChange(selectedValues.filter(v => v !== value));
    }
  };

  return (
    <StyledCheckboxGroup>
      <FormGroup sx={{ maxHeight, overflowY: 'auto' }}>
        {options.map((option) => {
          const isChecked = selectedValues.includes(option.value);
          
          const checkbox = (
            <FormControlLabel
              key={option.value}
              control={
                <Checkbox
                  checked={isChecked}
                  onChange={(e) => handleChange(option.value, e.target.checked)}
                  size="small"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <Typography variant="body2">
                    {option.label}
                  </Typography>
                  {option.count !== undefined && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      ({option.count})
                    </Typography>
                  )}
                </Box>
              }
              sx={{
                width: '100%',
                margin: 0,
                '& .MuiFormControlLabel-label': {
                  width: '100%',
                },
              }}
            />
          );

          if (option.description) {
            return (
              <Tooltip key={option.value} title={option.description} placement="right">
                {checkbox}
              </Tooltip>
            );
          }

          return checkbox;
        })}
      </FormGroup>
    </StyledCheckboxGroup>
  );
};