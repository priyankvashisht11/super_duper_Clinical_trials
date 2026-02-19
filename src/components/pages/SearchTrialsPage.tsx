import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Alert,
  Fade,
  Grow,
} from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp as TrendingIcon,
  LocationOn as LocationIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { SearchBar } from '../search/SearchBar';
import { DemoSearchResults } from '../search/DemoSearchResults';
import { colors } from '../../styles/theme';
import type { ClinicalTrial } from '../../types';

const PageHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(colors.primary.light, 0.1)} 0%, ${alpha(colors.secondary.light, 0.05)} 100%)`,
  borderRadius: 16,
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  border: `1px solid ${alpha(colors.primary.main, 0.1)}`,
}));

const QuickSearchCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: `1px solid ${alpha(colors.primary.main, 0.1)}`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 24px ${alpha(colors.primary.main, 0.15)}`,
    borderColor: colors.primary.main,
  },
}));

const TrendingChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: colors.primary.main,
    color: '#fff',
    transform: 'scale(1.05)',
  },
}));

export const SearchTrialsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'diabetes Phase III Mumbai',
    'cancer immunotherapy Delhi',
    'cardiovascular Phase II Bangalore'
  ]);

  const quickSearches = [
    {
      title: 'Diabetes Studies',
      icon: <ScienceIcon />,
      query: 'diabetes Phase III',
      color: colors.primary.main,
      count: '450+ trials'
    },
    {
      title: 'Cancer Research',
      icon: <ScienceIcon />,
      query: 'cancer immunotherapy',
      color: colors.secondary.main,
      count: '680+ trials'
    },
    {
      title: 'Cardiovascular',
      icon: <ScienceIcon />,
      query: 'cardiovascular Phase II',
      color: '#e91e63',
      count: '320+ trials'
    },
    {
      title: 'Neurological',
      icon: <ScienceIcon />,
      query: 'neurological disorders',
      color: '#9c27b0',
      count: '280+ trials'
    },
  ];

  const trendingSearches = [
    'COVID-19 vaccine',
    'Alzheimer treatment',
    'Type 2 diabetes',
    'Breast cancer',
    'Hypertension',
    'Asthma',
    'Depression',
    'Rheumatoid arthritis',
  ];

  const popularLocations = [
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Chennai',
    'Hyderabad',
    'Pune',
    'Kolkata',
    'Ahmedabad',
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowResults(true);
    
    if (!recentSearches.includes(query)) {
      setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
    }
  };

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleTrialSelect = (trial: ClinicalTrial) => {
    console.log('Trial selected:', trial);
  };

  const handleClearRecentSearch = (search: string) => {
    setRecentSearches(prev => prev.filter(s => s !== search));
  };

  return (
    <Box sx={{ p: 4 }}>
      <Fade in timeout={600}>
        <PageHeader>
          <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: colors.text.primary }}>
            <SearchIcon sx={{ fontSize: 40, verticalAlign: 'middle', mr: 1, color: colors.primary.main }} />
            Search Clinical Trials
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Search through 12,000+ CTRI trials with AI-powered filters and intelligent matching
          </Typography>
          
          <SearchBar
            placeholder="Search by condition, intervention, location, or trial ID..."
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            recentSearches={recentSearches}
            onClearRecentSearch={handleClearRecentSearch}
            showSuggestions={true}
            autoFocus={true}
          />
        </PageHeader>
      </Fade>

      {!showResults ? (
        <>
          {/* Quick Search Categories */}
          <Grow in timeout={800} style={{ transitionDelay: '200ms' }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
                Quick Search by Category
              </Typography>
              <Grid container spacing={2}>
                {quickSearches.map((item, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <QuickSearchCard onClick={() => handleQuickSearch(item.query)}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Box
                            sx={{
                              backgroundColor: alpha(item.color, 0.1),
                              borderRadius: 2,
                              p: 1,
                              mr: 1.5,
                            }}
                          >
                            {React.cloneElement(item.icon, { sx: { color: item.color } })}
                          </Box>
                          <Typography variant="h6" fontWeight={600}>
                            {item.title}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {item.count}
                        </Typography>
                      </CardContent>
                    </QuickSearchCard>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grow>

          {/* Trending Searches */}
          <Fade in timeout={1000} style={{ transitionDelay: '400ms' }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
                <TrendingIcon sx={{ verticalAlign: 'middle', mr: 1, color: colors.primary.main }} />
                Trending Searches
              </Typography>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {trendingSearches.map((search, index) => (
                      <TrendingChip
                        key={index}
                        label={search}
                        onClick={() => handleQuickSearch(search)}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Fade>

          {/* Popular Locations */}
          <Fade in timeout={1200} style={{ transitionDelay: '600ms' }}>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
                <LocationIcon sx={{ verticalAlign: 'middle', mr: 1, color: colors.secondary.main }} />
                Search by Location
              </Typography>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {popularLocations.map((location, index) => (
                      <TrendingChip
                        key={index}
                        label={location}
                        onClick={() => handleQuickSearch(location)}
                        variant="outlined"
                        color="secondary"
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Fade>

          {/* Info Alert */}
          <Fade in timeout={1400} style={{ transitionDelay: '800ms' }}>
            <Alert 
              severity="info" 
              sx={{ 
                mt: 3,
                backgroundColor: '#e3f2fd',
                border: '2px solid #2196f3',
                '& .MuiAlert-icon': { color: '#1976d2' },
                '& .MuiAlert-message': { 
                  color: '#0d47a1',
                  fontWeight: 600,
                  '& .MuiTypography-root': { color: '#0d47a1', fontWeight: 600 }
                }
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                💡 Pro Tip: Use the filters on the left to narrow down your search by phase, status, condition, and more!
              </Typography>
            </Alert>
          </Fade>
        </>
      ) : (
        <Fade in timeout={600}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Search Results for "{searchQuery}"
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setShowResults(false)}
                size="small"
              >
                New Search
              </Button>
            </Box>
            <DemoSearchResults
              query={searchQuery}
              onTrialSelect={handleTrialSelect}
            />
          </Box>
        </Fade>
      )}
    </Box>
  );
};
