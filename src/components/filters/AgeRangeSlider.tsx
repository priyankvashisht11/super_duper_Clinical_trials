import React from 'react';
import {
  Box,
  Typography,
} from '@mui/material';
import { FilterSlider } from '../styled/Inputs';

interface AgeRangeSliderProps {
  minAge: number;
  maxAge: number;
  onChange: (range: { min: number; max: number }) => void;
  onClear: () => void;
}

export const AgeRangeSlider: React.FC<AgeRangeSliderProps> = ({
  minAge,
  maxAge,
  onChange,
  onClear,
}) => {
  const handleChange = (event: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      const [min, max] = newValue;
      onChange({ min, max });
      
      // Clear if back to default range
      if (min === 18 && max === 65) {
        onClear();
      }
    }
  };

  const ageMarks = [
    { value: 18, label: '18' },
    { value: 30, label: '30' },
    { value: 45, label: '45' },
    { value: 60, label: '60' },
    { value: 65, label: '65+' },
  ];

  return (
    <Box sx={{ p: 1, px: 2 }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Age range: {minAge} - {maxAge === 65 ? '65+' : maxAge} years
      </Typography>
      <FilterSlider
        value={[minAge, maxAge]}
        onChange={handleChange}
        min={18}
        max={65}
        marks={ageMarks}
        valueLabelDisplay="auto"
        valueLabelFormat={(value) => `${value === 65 ? '65+' : value}`}
        sx={{ mt: 2, mb: 1 }}
      />
    </Box>
  );
};