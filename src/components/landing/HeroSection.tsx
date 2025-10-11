import React, { useState } from 'react';
import { Box, Typography, Fade, Grow } from '@mui/material';
import { PlayArrow as PlayIcon } from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { PrimaryButton, SecondaryButton } from '../styled/Buttons';
import { SearchBar } from '../search/SearchBar';
import { DemoSearchResults } from '../search/DemoSearchResults';
import { colors } from '../../styles/theme';
import type { ClinicalTrial } from '../../types';

// Styled components for the hero section that fits within the main layout
const HeroContainer = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(colors.primary.light, 0.1)} 0%, ${alpha(colors.secondary.light, 0.05)} 100%)`,
  borderRadius: 16,
  padding: theme.spacing(6, 4),
  marginBottom: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  border: `1px solid ${alpha(colors.primary.main, 0.1)}`,
  
  // Subtle background pattern
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `radial-gradient(circle at 20% 50%, ${alpha(colors.primary.main, 0.03)} 0%, transparent 50%),
                     radial-gradient(circle at 80% 20%, ${alpha(colors.secondary.main, 0.03)} 0%, transparent 50%)`,
    pointerEvents: 'none',
  },
  
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(4, 3),
  },
  
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3, 2),
  },
}));

const HeroTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 700,
  color: colors.text.primary,
  textAlign: 'center',
  marginBottom: theme.spacing(2),
  lineHeight: 1.2,
  
  [theme.breakpoints.down('md')]: {
    fontSize: '2rem',
  },
  
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.75rem',
  },
}));

const HeroSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.125rem',
  fontWeight: 400,
  color: colors.text.secondary,
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  lineHeight: 1.5,
  maxWidth: '600px',
  margin: `0 auto ${theme.spacing(4)}px`,
  
  [theme.breakpoints.down('sm')]: {
    fontSize: '1rem',
    marginBottom: theme.spacing(3),
  },
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  maxWidth: 600,
  margin: '0 auto',
  marginBottom: theme.spacing(3),
}));

const CTAContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: 12,
  justifyContent: 'center',
  marginBottom: theme.spacing(4),
  
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
}));

const DemoButton = styled(SecondaryButton)(({ theme }) => ({
  borderRadius: 20,
  padding: '8px 20px',
  fontSize: '0.9375rem',
  fontWeight: 500,
  borderColor: colors.primary.main,
  color: colors.primary.main,
  minWidth: 140,
  
  '&:hover': {
    backgroundColor: alpha(colors.primary.main, 0.08),
    borderColor: colors.primary.main,
    transform: 'translateY(-1px)',
  },
  
  [theme.breakpoints.down('sm')]: {
    minWidth: 160,
  },
}));

const RegisterButton = styled(PrimaryButton)(({ theme }) => ({
  borderRadius: 20,
  padding: '8px 20px',
  fontSize: '0.9375rem',
  fontWeight: 600,
  minWidth: 140,
  background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
  boxShadow: `0 4px 12px ${alpha(colors.primary.main, 0.3)}`,
  border: 'none',
  color: '#FFFFFF',
  
  '&:hover': {
    background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.secondary.dark} 100%)`,
    boxShadow: `0 6px 16px ${alpha(colors.primary.main, 0.4)}`,
    transform: 'translateY(-2px)',
  },
  
  '&:active': {
    transform: 'translateY(0px)',
    boxShadow: `0 2px 8px ${alpha(colors.primary.main, 0.3)}`,
  },
  
  [theme.breakpoints.down('sm')]: {
    minWidth: 160,
  },
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  gap: 32,
  
  [theme.breakpoints.down('sm')]: {
    gap: 20,
  },
}));

const StatItem = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  
  '& .stat-number': {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: colors.primary.main,
    display: 'block',
    
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.25rem',
    },
  },
  
  '& .stat-label': {
    fontSize: '0.75rem',
    fontWeight: 500,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
}));

interface HeroSectionProps {
  onSearch?: (query: string) => void;
  onDemo?: () => void;
  onRegister?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearch,
  onDemo,
  onRegister,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'diabetes Phase III Mumbai',
    'cancer immunotherapy Delhi',
    'cardiovascular Phase II'
  ]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowResults(true);
    
    // Add to recent searches if not already present
    if (!recentSearches.includes(query)) {
      setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
    }
    
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleVoiceInput = () => {
    // Mock voice input functionality
    console.log('Voice input activated');
  };

  const handleDemo = () => {
    const demoQuery = 'diabetes Phase III Mumbai';
    setSearchQuery(demoQuery);
    setShowResults(true);
    if (onDemo) {
      onDemo();
    }
  };

  const handleTrialSelect = (trial: ClinicalTrial) => {
    console.log('Trial selected:', trial);
    // This would typically open a detailed view or add to document generation
  };

  const handleClearRecentSearch = (search: string) => {
    setRecentSearches(prev => prev.filter(s => s !== search));
  };

  return (
    <HeroContainer>
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in timeout={600}>
          <Box>
            <HeroTitle variant="h1">
              AI-Powered Clinical Trials Research
              <br />
              <Box
                component="span"
                sx={{
                  background: `linear-gradient(45deg, ${colors.primary.main}, ${colors.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                for Indian Physicians
              </Box>
            </HeroTitle>
          </Box>
        </Fade>

        <Fade in timeout={800} style={{ transitionDelay: '200ms' }}>
          <Box>
            <HeroSubtitle variant="h6">
              Search 12,000+ CTRI trials, generate research summaries, and match patients 
              with AI-powered tools designed for medical professionals
            </HeroSubtitle>
          </Box>
        </Fade>

        <Grow in timeout={1000} style={{ transitionDelay: '400ms' }}>
          <SearchContainer>
            <SearchBar
              placeholder="Try: 'diabetes Phase III Mumbai' or 'cancer immunotherapy'"
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              onVoiceInput={handleVoiceInput}
              recentSearches={recentSearches}
              onClearRecentSearch={handleClearRecentSearch}
              showSuggestions={true}
              autoFocus={false}
            />
          </SearchContainer>
        </Grow>

        <Fade in timeout={1200} style={{ transitionDelay: '600ms' }}>
          <CTAContainer>
            <RegisterButton onClick={onRegister}>
              Get Started Free
            </RegisterButton>
            <DemoButton onClick={handleDemo} startIcon={<PlayIcon fontSize="small" />}>
              Watch Demo
            </DemoButton>
          </CTAContainer>
        </Fade>

        {showResults && searchQuery && (
          <Fade in timeout={600}>
            <Box sx={{ mt: 4 }}>
              <DemoSearchResults
                query={searchQuery}
                onTrialSelect={handleTrialSelect}
              />
            </Box>
          </Fade>
        )}

        <Fade in timeout={1400} style={{ transitionDelay: '800ms' }}>
          <StatsContainer>
            <StatItem>
              <Typography className="stat-number">12,000+</Typography>
              <Typography className="stat-label">CTRI Trials</Typography>
            </StatItem>
            <StatItem>
              <Typography className="stat-number">500+</Typography>
              <Typography className="stat-label">Medical Centers</Typography>
            </StatItem>
            <StatItem>
              <Typography className="stat-number">50+</Typography>
              <Typography className="stat-label">Specialties</Typography>
            </StatItem>
          </StatsContainer>
        </Fade>
      </Box>
    </HeroContainer>
  );
};

export default HeroSection;