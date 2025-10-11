import React from 'react';
import {
  RadioGroup as MuiRadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { RadioGroup } from '../styled/Inputs';
import { genderOptions } from '../../data/medicalConditions';

interface GenderRadioGroupProps {
  value: 'all' | 'male' | 'female';
  onChange: (value: 'all' | 'male' | 'female') => void;
}

export const GenderRadioGroup: React.FC<GenderRadioGroupProps> = ({
  value,
  onChange,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value as 'all' | 'male' | 'female');
  };

  return (
    <RadioGroup>
      <MuiRadioGroup
        value={value}
        onChange={handleChange}
        sx={{ gap: 0.5 }}
      >
        {genderOptions.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio size="small" />}
            label={option.label}
            sx={{
              margin: 0,
              '& .MuiFormControlLabel-label': {
                fontSize: '0.875rem',
              },
            }}
          />
        ))}
      </MuiRadioGroup>
    </RadioGroup>
  );
};