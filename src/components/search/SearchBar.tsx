import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  InputBase,
  IconButton,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Popper,
  ClickAwayListener,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Mic as MicIcon,
  Clear as ClearIcon,
  History as HistoryIcon,
  TrendingUp as TrendingIcon,
  MedicalServices as MedicalIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { colors } from '../../styles/theme';

// Sample medical conditions for autocomplete
const MEDICAL_CONDITIONS = [
  'Diabetes Type 2',
  'Hypertension',
  'Coronary Artery Disease',
  'Breast Cancer',
  'Lung Cancer',
  'Alzheimer Disease',
  'Parkinson Disease',
  'Rheumatoid Arthritis',
  'Multiple Sclerosis',
  'Chronic Kidney Disease',
  'Heart Failure',
  'Stroke',
  'Depression',
  'Anxiety Disorders',
  'Asthma',
  'COPD',
  'HIV/AIDS',
  'Hepatitis B',
  'Hepatitis C',
  'Tuberculosis',
];

// Sample search suggestions
const SEARCH_SUGGESTIONS = [
  { text: 'diabetes Phase III Mumbai', category: 'Popular Search' },
  { text: 'cancer immunotherapy Delhi', category: 'Trending' },
  { text: 'cardiovascular Phase II Bangalore', category: 'Recent' },
  { text: 'neurological disorders Chennai', category: 'Popular Search' },
  { text: 'oncology Phase I Hyderabad', category: 'Trending' },
];

const SearchContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  maxWidth: 600,
}));

const SearchBarContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'white',
  borderRadius: 28,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  border: `2px solid ${alpha(colors.primary.main, 0.1)}`,
  padding: '4px 4px 4px 20px',
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  
  '&:hover': {
    boxShadow: '0 6px 25px rgba(0,0,0,0.12)',
    borderColor: alpha(colors.primary.main, 0.2),
    transform: 'translateY(-1px)',
  },
  
  '&.focused': {
    boxShadow: '0 6px 25px rgba(0,0,0,0.12)',
    borderColor: colors.primary.main,
    transform: 'translateY(-1px)',
  },
  
  [theme.breakpoints.down('sm')]: {
    borderRadius: 24,
    padding: '4px 4px 4px 16px',
  },
}));

const SearchInput = styled(InputBase)(({ theme }) => ({
  flex: 1,
  fontSize: '1rem',
  fontWeight: 400,
  color: colors.text.primary,
  
  '& .MuiInputBase-input': {
    padding: '14px 0',
    
    '&::placeholder': {
      color: colors.text.secondary,
      opacity: 1,
    },
    
    [theme.breakpoints.down('sm')]: {
      padding: '10px 0',
      fontSize: '0.9375rem',
    },
  },
}));

const VoiceButton = styled(IconButton)(({ theme }) => ({
  width: 40,
  height: 40,
  marginRight: 8,
  backgroundColor: alpha(colors.primary.main, 0.1),
  color: colors.primary.main,
  transition: 'all 0.2s ease-in-out',
  
  '&:hover': {
    backgroundColor: alpha(colors.primary.main, 0.2),
    transform: 'scale(1.05)',
  },
  
  '&.recording': {
    backgroundColor: colors.status.notYetRecruiting,
    color: 'white',
    animation: 'pulse 1.5s infinite',
  },
  
  '@keyframes pulse': {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.1)' },
    '100%': { transform: 'scale(1)' },
  },
  
  [theme.breakpoints.down('sm')]: {
    width: 36,
    height: 36,
    marginRight: 4,
  },
}));

const ClearButton = styled(IconButton)(({ theme }) => ({
  width: 32,
  height: 32,
  marginRight: 8,
  color: colors.text.secondary,
  
  '&:hover': {
    backgroundColor: alpha(colors.text.secondary, 0.1),
    color: colors.text.primary,
  },
}));

const SearchButton = styled(IconButton)(({ theme }) => ({
  width: 40,
  height: 40,
  backgroundColor: colors.primary.main,
  color: 'white',
  borderRadius: 20,
  
  '&:hover': {
    backgroundColor: colors.primary.dark,
    transform: 'scale(1.05)',
  },
  
  '&:disabled': {
    backgroundColor: colors.text.disabled,
    color: 'white',
  },
  
  [theme.breakpoints.down('sm')]: {
    width: 36,
    height: 36,
  },
}));

const SuggestionsPopper = styled(Popper)(({ theme }) => ({
  zIndex: 1300,
  width: '100%',
  marginTop: theme.spacing(0.5),
}));

const SuggestionsPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  border: `1px solid ${colors.border.light}`,
  overflow: 'hidden',
  maxHeight: 400,
  overflowY: 'auto',
}));

const SuggestionItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '12px 16px',
  cursor: 'pointer',
  borderBottom: `1px solid ${colors.border.light}`,
  transition: 'background-color 0.2s ease-in-out',
  
  '&:hover': {
    backgroundColor: alpha(colors.primary.main, 0.04),
  },
  
  '&:last-child': {
    borderBottom: 'none',
  },
  
  '& .suggestion-icon': {
    marginRight: theme.spacing(1.5),
    color: colors.text.secondary,
    fontSize: '1.125rem',
  },
  
  '& .suggestion-content': {
    flex: 1,
  },
  
  '& .suggestion-text': {
    fontSize: '0.9375rem',
    color: colors.text.primary,
    fontWeight: 500,
  },
  
  '& .suggestion-category': {
    fontSize: '0.8125rem',
    color: colors.text.secondary,
    marginTop: theme.spacing(0.25),
  },
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  padding: '8px 16px',
  backgroundColor: colors.background.surface,
  borderBottom: `1px solid ${colors.border.light}`,
  
  '& .section-title': {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
}));

const RecentSearchChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.25),
  fontSize: '0.8125rem',
  height: 28,
  backgroundColor: alpha(colors.primary.main, 0.08),
  color: colors.primary.dark,
  
  '&:hover': {
    backgroundColor: alpha(colors.primary.main, 0.12),
  },
  
  '& .MuiChip-deleteIcon': {
    color: colors.primary.main,
    fontSize: '1rem',
    
    '&:hover': {
      color: colors.primary.dark,
    },
  },
}));



interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  onVoiceInput?: () => void;
  isLoading?: boolean;
  recentSearches?: string[];
  onClearRecentSearch?: (search: string) => void;
  showSuggestions?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search clinical trials (e.g., 'diabetes Phase III Mumbai')",
  value: controlledValue,
  onChange,
  onSearch,
  onVoiceInput,
  isLoading = false,
  recentSearches = [],
  onClearRecentSearch,
  showSuggestions = true,
  autoFocus = false,
  disabled = false,
}) => {
  const [internalValue, setInternalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<typeof SEARCH_SUGGESTIONS>([]);
  const [filteredConditions, setFilteredConditions] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const searchValue = controlledValue !== undefined ? controlledValue : internalValue;
  
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);
  
  useEffect(() => {
    if (searchValue && showSuggestions) {
      const query = searchValue.toLowerCase();
      
      // Filter medical conditions
      const matchingConditions = MEDICAL_CONDITIONS.filter(condition =>
        condition.toLowerCase().includes(query)
      ).slice(0, 5);
      
      // Filter search suggestions
      const matchingSuggestions = SEARCH_SUGGESTIONS.filter(suggestion =>
        suggestion.text.toLowerCase().includes(query)
      ).slice(0, 3);
      
      setFilteredConditions(matchingConditions);
      setFilteredSuggestions(matchingSuggestions);
      setShowDropdown(isFocused && (matchingConditions.length > 0 || matchingSuggestions.length > 0 || recentSearches.length > 0));
    } else {
      setShowDropdown(isFocused && recentSearches.length > 0);
    }
  }, [searchValue, isFocused, showSuggestions, recentSearches]);
  
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInternalValue(newValue);
    onChange?.(newValue);
  }, [onChange]);
  
  const handleSearch = useCallback(() => {
    if (searchValue.trim() && !disabled) {
      onSearch?.(searchValue.trim());
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  }, [searchValue, onSearch, disabled]);
  
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    } else if (event.key === 'Escape') {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  }, [handleSearch]);
  
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (showSuggestions) {
      setShowDropdown(true);
    }
  }, [showSuggestions]);
  
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Delay hiding dropdown to allow for clicks
    setTimeout(() => setShowDropdown(false), 150);
  }, []);
  
  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInternalValue(suggestion);
    onChange?.(suggestion);
    onSearch?.(suggestion);
    setShowDropdown(false);
  }, [onChange, onSearch]);
  
  const handleClear = useCallback(() => {
    setInternalValue('');
    onChange?.('');
    inputRef.current?.focus();
  }, [onChange]);
  
  const handleVoiceClick = useCallback(() => {
    if (disabled) return;
    
    setIsRecording(!isRecording);
    
    // Mock voice input functionality
    if (!isRecording) {
      // Simulate voice recording
      setTimeout(() => {
        setIsRecording(false);
        const mockVoiceInput = 'diabetes treatment Phase III';
        setInternalValue(mockVoiceInput);
        onChange?.(mockVoiceInput);
      }, 2000);
    }
    
    onVoiceInput?.();
  }, [isRecording, disabled, onChange, onVoiceInput]);
  
  const handleClickAway = useCallback(() => {
    setShowDropdown(false);
  }, []);
  
  const renderSuggestions = () => {
    if (!showDropdown) return null;
    
    const hasRecentSearches = recentSearches.length > 0;
    const hasConditions = filteredConditions.length > 0;
    const hasSuggestions = filteredSuggestions.length > 0;
    
    if (!hasRecentSearches && !hasConditions && !hasSuggestions) {
      return null;
    }
    
    return (
      <SuggestionsPopper
        open={showDropdown}
        anchorEl={containerRef.current}
        placement="bottom-start"
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 4],
            },
          },
        ]}
      >
        <SuggestionsPaper>
          {hasRecentSearches && !searchValue && (
            <>
              <SectionHeader>
                <Typography className="section-title">Recent Searches</Typography>
              </SectionHeader>
              <Box sx={{ p: 1 }}>
                {recentSearches.slice(0, 5).map((search, index) => (
                  <RecentSearchChip
                    key={index}
                    label={search}
                    onClick={() => handleSuggestionClick(search)}
                    onDelete={() => onClearRecentSearch?.(search)}
                    size="small"
                  />
                ))}
              </Box>
            </>
          )}
          
          {hasConditions && (
            <>
              {hasRecentSearches && !searchValue && <Divider />}
              <SectionHeader>
                <Typography className="section-title">Medical Conditions</Typography>
              </SectionHeader>
              {filteredConditions.map((condition, index) => (
                <SuggestionItem
                  key={index}
                  onClick={() => handleSuggestionClick(condition)}
                >
                  <MedicalIcon className="suggestion-icon" />
                  <Box className="suggestion-content">
                    <Typography className="suggestion-text">{condition}</Typography>
                  </Box>
                </SuggestionItem>
              ))}
            </>
          )}
          
          {hasSuggestions && (
            <>
              {(hasRecentSearches || hasConditions) && <Divider />}
              <SectionHeader>
                <Typography className="section-title">Suggested Searches</Typography>
              </SectionHeader>
              {filteredSuggestions.map((suggestion, index) => (
                <SuggestionItem
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                >
                  {suggestion.category === 'Trending' ? (
                    <TrendingIcon className="suggestion-icon" />
                  ) : (
                    <HistoryIcon className="suggestion-icon" />
                  )}
                  <Box className="suggestion-content">
                    <Typography className="suggestion-text">{suggestion.text}</Typography>
                    <Typography className="suggestion-category">{suggestion.category}</Typography>
                  </Box>
                </SuggestionItem>
              ))}
            </>
          )}
        </SuggestionsPaper>
      </SuggestionsPopper>
    );
  };
  
  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <SearchContainer ref={containerRef}>
        <SearchBarContainer
          className={isFocused ? 'focused' : ''}
          elevation={0}
        >
          <SearchIcon 
            sx={{ 
              color: colors.text.secondary, 
              mr: 2,
              fontSize: '1.25rem',
            }} 
          />
          
          <SearchInput
            ref={inputRef}
            placeholder={placeholder}
            value={searchValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
          />
          
          {isLoading && (
            <Box sx={{ mr: 1 }}>
              <CircularProgress size={20} thickness={4} />
            </Box>
          )}
          
          {searchValue && !isLoading && (
            <ClearButton
              onClick={handleClear}
              aria-label="Clear search"
              size="small"
            >
              <ClearIcon fontSize="small" />
            </ClearButton>
          )}
          
          <VoiceButton
            className={isRecording ? 'recording' : ''}
            onClick={handleVoiceClick}
            aria-label={isRecording ? 'Stop recording' : 'Voice search'}
            disabled={disabled}
          >
            <MicIcon fontSize="small" />
          </VoiceButton>
          
          <SearchButton
            onClick={handleSearch}
            disabled={!searchValue.trim() || disabled || isLoading}
            aria-label="Search"
          >
            <SearchIcon fontSize="small" />
          </SearchButton>
        </SearchBarContainer>
        
        {renderSuggestions()}
      </SearchContainer>
    </ClickAwayListener>
  );
};

export default SearchBar;