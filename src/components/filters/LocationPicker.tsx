import React from 'react';
import {
  Box,
  Typography,
  Autocomplete,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  MyLocation as MyLocationIcon,
} from '@mui/icons-material';
import { FilterSlider } from '../styled/Inputs';
import { indianCities } from '../../data/medicalConditions';

interface LocationPickerProps {
  city: string;
  radius: number;
  onChange: (location: { city: string; radius: number }) => void;
  onClear: () => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  city,
  radius,
  onChange,
  onClear,
}) => {
  const handleCityChange = (_event: any, newValue: string | null) => {
    const newCity = newValue || '';
    onChange({ city: newCity, radius });
    if (!newCity) {
      onClear();
    }
  };

  const handleRadiusChange = (_event: Event, newValue: number | number[]) => {
    const newRadius = Array.isArray(newValue) ? newValue[0] : newValue;
    onChange({ city, radius: newRadius });
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (_position) => {
          // In a real app, you'd reverse geocode these coordinates
          // For demo purposes, we'll just set a placeholder
          onChange({ city: 'Current Location', radius });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const radiusMarks = [
    { value: 10, label: '10km' },
    { value: 25, label: '25km' },
    { value: 50, label: '50km' },
    { value: 100, label: '100km' },
    { value: 200, label: '200km' },
  ];

  return (
    <Box sx={{ p: 1 }}>
      <Autocomplete
        options={indianCities}
        value={city || null}
        onChange={handleCityChange}
        freeSolo
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Enter city, state"
            variant="outlined"
            size="small"
            fullWidth
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <LocationIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  {params.InputProps.endAdornment}
                  <InputAdornment 
                    position="end" 
                    sx={{ cursor: 'pointer' }}
                    onClick={handleCurrentLocation}
                  >
                    <MyLocationIcon color="action" fontSize="small" />
                  </InputAdornment>
                </>
              ),
            }}
          />
        )}
        sx={{
          mb: 2,
          '& .MuiAutocomplete-paper': {
            maxHeight: 200,
          },
        }}
      />

      {city && (
        <Box sx={{ px: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Search radius: {radius} km
          </Typography>
          <FilterSlider
            value={radius}
            onChange={handleRadiusChange}
            min={5}
            max={500}
            marks={radiusMarks}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}km`}
            sx={{ mt: 1 }}
          />
        </Box>
      )}
    </Box>
  );
};