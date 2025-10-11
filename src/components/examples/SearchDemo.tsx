import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Chip,
  Grid,
  Skeleton,
  Fade,
  IconButton,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  People as PeopleIcon,
  Mic as MicIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { colors } from '../../styles/theme';

const DemoContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  background: `linear-gradient(135deg, ${alpha(colors.primary.main, 0.02)}, ${alpha(colors.secondary.main, 0.02)})`,
  border: `1px solid ${alpha(colors.primary.main, 0.1)}`,
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 28,
    backgroundColor: colors.background.default,
    fontSize: '1rem',
    
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.primary.main,
    },
    
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.primary.main,
      borderWidth: 2,
    },
  },
}));

const TrialCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  border: `1px solid ${alpha(colors.primary.main, 0.1)}`,
  transition: 'all 0.2s ease-in-out',
  cursor: 'pointer',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 24px ${alpha(colors.primary.main, 0.15)}`,
    borderColor: colors.primary.main,
  },
}));

const mockTrials = [
  {
    id: '1',
    ctriNumber: 'CTRI/2024/01/012345',
    title: 'Efficacy of Novel Diabetes Treatment in Type 2 Diabetes Mellitus',
    phase: 'III',
    status: 'recruiting',
    location: 'Mumbai, Maharashtra',
    condition: 'Type 2 Diabetes Mellitus',
    ageRange: '18-65 years',
    participants: '200 participants',
  },
  {
    id: '2',
    ctriNumber: 'CTRI/2024/01/012346',
    title: 'Comparative Study of Insulin Therapies in Diabetic Patients',
    phase: 'II',
    status: 'recruiting',
    location: 'Delhi, NCR',
    condition: 'Diabetes Mellitus',
    ageRange: '25-70 years',
    participants: '150 participants',
  },
  {
    id: '3',
    ctriNumber: 'CTRI/2024/01/012347',
    title: 'Prevention of Diabetic Complications Through Early Intervention',
    phase: 'III',
    status: 'not_yet_recruiting',
    location: 'Bangalore, Karnataka',
    condition: 'Pre-diabetes',
    ageRange: '30-60 years',
    participants: '300 participants',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'recruiting':
      return colors.status.recruiting;
    case 'not_yet_recruiting':
      return colors.status.notYetRecruiting;
    case 'completed':
      return colors.status.completed;
    default:
      return colors.status.suspended;
  }
};

const getStatusLabel = (status: string) => {
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const SearchDemo: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [filteredTrials, setFilteredTrials] = useState(mockTrials);

  useEffect(() => {
    if (searchQuery.length > 0) {
      setIsSearching(true);
      
      // Simulate search delay
      const timer = setTimeout(() => {
        const filtered = mockTrials.filter(trial =>
          trial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          trial.condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
          trial.location.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredTrials(filtered);
        setIsSearching(false);
        setShowResults(true);
      }, 800);

      return () => clearTimeout(timer);
    } else {
      setShowResults(false);
      setFilteredTrials(mockTrials);
    }
  }, [searchQuery]);

  const handleVoiceSearch = () => {
    // Simulate voice input
    setSearchQuery('diabetes Phase III Mumbai');
  };

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <DemoContainer>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        🔍 Comprehensive CTRI Search Demo
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Experience lightning-fast search through 12,000+ clinical trials with intelligent filtering and real-time results.
      </Typography>

      {/* Search Bar */}
      <Box sx={{ mb: 4 }}>
        <SearchField
          fullWidth
          placeholder="Try: 'diabetes Phase III Mumbai' or 'cancer immunotherapy'"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleVoiceSearch} size="small">
                  <MicIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        
        {/* Quick Search Suggestions */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
            Try:
          </Typography>
          {['diabetes', 'cancer', 'cardiovascular', 'Phase III'].map((suggestion) => (
            <Button
              key={suggestion}
              size="small"
              variant="outlined"
              onClick={() => handleQuickSearch(suggestion)}
              sx={{
                borderRadius: 4,
                textTransform: 'none',
                fontSize: '0.75rem',
                minWidth: 'auto',
                px: 2,
                py: 0.5,
              }}
            >
              {suggestion}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Search Results */}
      {isSearching && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Searching through 12,000+ trials...
          </Typography>
          {[1, 2, 3].map((i) => (
            <Card key={i} sx={{ mb: 2 }}>
              <CardContent>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={20} />
                <Skeleton variant="text" width="100%" height={60} />
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Skeleton variant="rectangular" width={80} height={24} />
                  <Skeleton variant="rectangular" width={100} height={24} />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {showResults && !isSearching && (
        <Fade in timeout={600}>
          <Box>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Found {filteredTrials.length} matching trials
              <Chip 
                label={`${Math.round(Math.random() * 200 + 100)}ms`} 
                size="small" 
                color="success" 
                sx={{ ml: 2 }} 
              />
            </Typography>
            
            <Grid container spacing={3}>
              {filteredTrials.map((trial, index) => (
                <Grid item xs={12} key={trial.id}>
                  <Fade in timeout={400} style={{ transitionDelay: `${index * 100}ms` }}>
                    <TrialCard>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                            {trial.ctriNumber}
                          </Typography>
                          <Chip
                            label={getStatusLabel(trial.status)}
                            size="small"
                            sx={{
                              backgroundColor: alpha(getStatusColor(trial.status), 0.1),
                              color: getStatusColor(trial.status),
                              fontWeight: 500,
                            }}
                          />
                        </Box>
                        
                        <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                          {trial.title}
                        </Typography>
                        
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <LocationIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {trial.location}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <TimeIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                Phase {trial.phase} • {trial.ageRange}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <PeopleIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {trial.participants}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Condition:</strong> {trial.condition}
                            </Typography>
                          </Grid>
                        </Grid>
                        
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip label={`Phase ${trial.phase}`} size="small" />
                          <Chip label={trial.condition} size="small" variant="outlined" />
                        </Box>
                      </CardContent>
                    </TrialCard>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>
      )}

      {!showResults && !isSearching && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Start typing to search through 12,000+ clinical trials in real-time
          </Typography>
        </Box>
      )}
    </DemoContainer>
  );
};

export default SearchDemo;