import React from 'react';
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  Divider,
  Button,
  Chip,
  Collapse,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Close as CloseIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { FilterSidebar as StyledFilterSidebar } from '../styled/Layout';

import { useSearch } from '../../contexts/SearchContext';
import {
  ConditionAutocomplete,
  CheckboxGroup,
  LocationPicker,
  AgeRangeSlider,
  GenderRadioGroup,
} from '../filters';
import {
  trialPhases,
  recruitmentStatuses,
} from '../../data/medicalConditions';

interface FilterSidebarProps {
  open: boolean;
  mobileOpen: boolean;
  onClose: () => void;
  onToggle?: () => void;
}

interface FilterGroupProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const FilterGroup: React.FC<FilterGroupProps> = ({
  title,
  children,
  defaultExpanded = true,
}) => {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  return (
    <Box sx={{ mb: 2 }}>
      <Button
        onClick={() => setExpanded(!expanded)}
        sx={{
          width: '100%',
          justifyContent: 'space-between',
          mb: 1,
          fontWeight: 600,
          color: 'text.primary',
          textTransform: 'none',
        }}
        variant="text"
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 'inherit' }}>
          {title}
        </Typography>
        {expanded ? <ExpandLess /> : <ExpandMore />}
      </Button>
      
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ pl: 1 }}>
          {children}
        </Box>
      </Collapse>
    </Box>
  );
};

const FilterContent: React.FC = () => {
  const { filters, activeFilterCount, updateFilter, clearFilters, triggerSearch } = useSearch();

  const handleConditionChange = (condition: string) => {
    updateFilter('condition', condition);
    triggerSearch();
  };

  const handlePhaseChange = (phases: string[]) => {
    updateFilter('phase', phases);
    triggerSearch();
  };

  const handleStatusChange = (statuses: string[]) => {
    updateFilter('status', statuses);
    triggerSearch();
  };

  const handleLocationChange = (location: { city: string; radius: number }) => {
    updateFilter('location', location);
    triggerSearch();
  };

  const handleLocationClear = () => {
    updateFilter('location', { city: '', radius: 50 });
    triggerSearch();
  };

  const handleAgeRangeChange = (ageRange: { min: number; max: number }) => {
    updateFilter('ageRange', [ageRange.min, ageRange.max]);
    triggerSearch();
  };

  const handleAgeRangeClear = () => {
    updateFilter('ageRange', [18, 65]);
    triggerSearch();
  };

  const handleGenderChange = (gender: 'all' | 'male' | 'female') => {
    updateFilter('gender', gender);
    triggerSearch();
  };

  const handleClearAll = () => {
    clearFilters();
    triggerSearch();
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header with filter count and clear button */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Filters
          </Typography>
          {activeFilterCount > 0 && (
            <Chip
              label={activeFilterCount}
              size="small"
              color="primary"
              sx={{ ml: 1, minWidth: 24, height: 20 }}
            />
          )}
        </Box>
        {activeFilterCount > 0 && (
          <Button
            size="small"
            startIcon={<ClearIcon />}
            onClick={handleClearAll}
            sx={{ fontSize: '0.75rem', minWidth: 'auto' }}
          >
            Clear All
          </Button>
        )}
      </Box>

      {/* Medical Condition Filter */}
      <FilterGroup title="Medical Condition">
        <ConditionAutocomplete
          value={filters.condition || ''}
          onChange={handleConditionChange}
          placeholder="Search conditions..."
        />
      </FilterGroup>

      {/* Trial Phase Filter */}
      <FilterGroup title="Trial Phase">
        <CheckboxGroup
          options={trialPhases.map(phase => ({
            value: phase.value,
            label: phase.label,
            description: phase.description,
          }))}
          selectedValues={filters.phase || []}
          onChange={handlePhaseChange}
        />
      </FilterGroup>

      {/* Recruitment Status Filter */}
      <FilterGroup title="Recruitment Status">
        <CheckboxGroup
          options={recruitmentStatuses.map(status => ({
            value: status.value,
            label: status.label,
            description: status.description,
          }))}
          selectedValues={filters.status || []}
          onChange={handleStatusChange}
        />
      </FilterGroup>

      {/* Location Filter */}
      <FilterGroup title="Location">
        <LocationPicker
          city={filters.location?.city || ''}
          radius={filters.location?.radius || 50}
          onChange={handleLocationChange}
          onClear={handleLocationClear}
        />
      </FilterGroup>

      {/* Age Range Filter */}
      <FilterGroup title="Age Range">
        <AgeRangeSlider
          minAge={filters.ageRange[0]}
          maxAge={filters.ageRange[1]}
          onChange={handleAgeRangeChange}
          onClear={handleAgeRangeClear}
        />
      </FilterGroup>

      {/* Gender Filter */}
      <FilterGroup title="Gender">
        <Box sx={{ p: 1 }}>
          <GenderRadioGroup
            value={filters.gender || 'all'}
            onChange={handleGenderChange}
          />
        </Box>
      </FilterGroup>
    </Box>
  );
};

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  open,
  mobileOpen,
  onClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Filters
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <FilterContent />
      </Drawer>
    );
  }

  if (!open) {
    return null;
  }

  return (
    <StyledFilterSidebar elevation={0}>
      <FilterContent />
    </StyledFilterSidebar>
  );
};