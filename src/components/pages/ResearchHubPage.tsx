import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useSearch } from '../../contexts/SearchContext';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Tabs,
  Tab,
  Chip,
  Grid,
  Alert,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Divider,
  LinearProgress,
  Fade,
  Grow,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  Search as SearchIcon,
  Science as ScienceIcon,
  Article as ArticleIcon,
  Biotech as BiotechIcon,
  AutoAwesome as AIIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  Bookmark as BookmarkIcon,
  OpenInNew as OpenIcon,
  Psychology as BrainIcon,
  TrendingUp as TrendingIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { colors } from '../../styles/theme';

const PageHeader = styled(Box)(() => ({
  background: `linear-gradient(135deg, ${alpha(colors.primary.light, 0.1)} 0%, ${alpha(colors.secondary.light, 0.05)} 100%)`,
  borderRadius: 16,
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  border: `1px solid ${alpha(colors.primary.main, 0.1)}`,
}));

const SearchCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  border: `1px solid ${alpha(colors.primary.main, 0.1)}`,
  boxShadow: `0 4px 12px ${alpha(colors.primary.main, 0.08)}`,
}));

const ResultCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  border: `1px solid ${alpha(colors.primary.main, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 24px ${alpha(colors.primary.main, 0.15)}`,
    borderColor: colors.primary.main,
  },
}));

const QuickSearchChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: colors.primary.main,
    color: '#fff',
    transform: 'scale(1.05)',
  },
}));

const SearchButton = styled(Button)(({ theme }) => ({
  minWidth: 140,
  height: 56,
  borderRadius: 12,
  fontWeight: 700,
  fontSize: '1rem',
  background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
  boxShadow: `0 6px 20px ${alpha('#667eea', 0.4)}`,
  color: '#ffffff',
  textTransform: 'none',
  letterSpacing: '0.5px',
  '&:hover': {
    background: `linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)`,
    boxShadow: `0 8px 28px ${alpha('#667eea', 0.5)}`,
    transform: 'translateY(-2px) scale(1.02)',
  },
  '&:active': {
    transform: 'translateY(0px) scale(0.98)',
  },
  '&:disabled': {
    background: `linear-gradient(135deg, #a5b4fc 0%, #c4b5fd 100%)`,
    color: '#ffffff',
    opacity: 0.7,
  },
}));

interface SearchFilters {
  phase: string;
  status: string;
  indication: string;
  country: string;
}

interface SearchResults {
  clinicalTrials: any[];
  pubMed: any[];
  ctriIndia: any[];
  perplexityAI: any;
  greyLiterature: any[];
  aiInsights: any;
}

interface SourceSelection {
  clinicaltrials: boolean;
  pubmed: boolean;
  ctri: boolean;
  perplexity: boolean;
  grey: boolean;
}

export const ResearchHubPage: React.FC = () => {
  const location = useLocation();
  const { searchQuery, setSearchQuery, filters: contextFilters, searchTrigger } = useSearch();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    phase: 'all',
    status: 'all',
    indication: '',
    country: 'all',
  });
  const [sources, setSources] = useState<SourceSelection>({
    clinicaltrials: true,
    pubmed: true,
    ctri: true,
    perplexity: true,
    grey: false,
  });
  const [results, setResults] = useState<SearchResults>({
    clinicalTrials: [],
    pubMed: [],
    ctriIndia: [],
    perplexityAI: null,
    greyLiterature: [],
    aiInsights: null,
  });
  const [showResults, setShowResults] = useState(false);
  const hasAutoSearched = useRef(false);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setShowResults(true);

    // Merge sidebar filters with local filters
    const mergedFilters = {
      ...filters,
      condition: contextFilters.condition || filters.indication,
      phase: contextFilters.phase.length > 0 ? contextFilters.phase : [filters.phase],
      status: contextFilters.status.length > 0 ? contextFilters.status : [filters.status],
      location: contextFilters.location.city ? contextFilters.location : undefined,
      ageRange: contextFilters.ageRange,
      gender: contextFilters.gender,
    };

    // Build sources array based on selection
    const selectedSources = [];
    if (sources.clinicaltrials) selectedSources.push('clinicaltrials');
    if (sources.pubmed) selectedSources.push('pubmed');
    if (sources.ctri) selectedSources.push('ctri');
    if (sources.perplexity) selectedSources.push('perplexity');
    if (sources.grey) selectedSources.push('grey');

    try {
      const response = await fetch('http://localhost:3001/api/research/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          filters: mergedFilters,
          sources: selectedSources,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResults({
          clinicalTrials: data.data.clinicalTrials?.trials || [],
          pubMed: data.data.pubMed?.articles || [],
          ctriIndia: data.data.ctriIndia?.trials || [],
          perplexityAI: data.data.perplexityAI?.insights || null,
          greyLiterature: data.data.greyLiterature?.documents || [],
          aiInsights: null,
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      // Use demo data filtered by sidebar filters
      setResults({
        clinicalTrials: filterDemoTrials(generateDemoTrials(), contextFilters),
        pubMed: generateDemoPapers(),
        ctriIndia: [],
        perplexityAI: null,
        greyLiterature: [],
        aiInsights: null,
      });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, contextFilters, sources]);

  // Handle incoming search from home page
  useEffect(() => {
    const state = location.state as { searchQuery?: string; autoSearch?: boolean } | null;
    if (state?.searchQuery && state.autoSearch && !hasAutoSearched.current) {
      hasAutoSearched.current = true;
      setSearchQuery(state.searchQuery);
      // Clear the state to prevent re-triggering
      window.history.replaceState({}, document.title);
      // Small delay to ensure state is set
      setTimeout(() => {
        handleSearch();
      }, 100);
    }
  }, [location.state, setSearchQuery, handleSearch]);

  // Trigger search when filters change from sidebar
  useEffect(() => {
    if (searchTrigger > 0 && searchQuery.trim() && showResults) {
      handleSearch();
    }
  }, [searchTrigger]); // Only depend on searchTrigger, not handleSearch

  const quickSearches = [
    'Phase III Diabetes',
    'Oncology RCTs',
    'Pediatric Trials',
    'Cardiovascular Phase II',
    'Rare Diseases',
    'COVID-19 Vaccine',
    'Alzheimer Treatment',
    'Immunotherapy',
  ];

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    setTimeout(() => handleSearch(), 100);
  };

  const handleAnalyzeWithAI = async () => {
    if (results.clinicalTrials.length === 0) {
      alert('No clinical trials to analyze. Please search for trials first.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/research/analyze-trials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trials: results.clinicalTrials,
          query: searchQuery,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResults(prev => ({ ...prev, aiInsights: data.data }));
        setActiveTab(2); // Switch to AI Insights tab
      } else {
        throw new Error('Backend analysis failed');
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      // Generate insights from trial data
      const insights = generateInsightsFromTrials(results.clinicalTrials, searchQuery);
      setResults(prev => ({ ...prev, aiInsights: insights }));
      setActiveTab(2);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Fade in timeout={600}>
        <PageHeader>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 12px ${alpha(colors.primary.main, 0.3)}`,
              }}
            >
              <ScienceIcon sx={{ fontSize: 36, color: 'white' }} />
            </Box>
            <Box flex={1}>
              <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: colors.text.primary }}>
                🔬 Research Hub
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Search clinical trials, research papers, and build evidence-based protocols with AI
              </Typography>
            </Box>
          </Box>

          <Alert
            severity="info"
            icon={<AIIcon />}
            sx={{
              backgroundColor: '#e3f2fd',
              border: '2px solid #2196f3',
              '& .MuiAlert-icon': { color: '#1976d2' },
              '& .MuiAlert-message': {
                color: '#0d47a1',
                fontWeight: 600,
              },
            }}
          >
            💡 <strong>Pro Tip:</strong> Use AI to analyze similar trials and extract design patterns for your protocol
          </Alert>
        </PageHeader>
      </Fade>

      {/* Search Interface */}
      <Grow in timeout={800} style={{ transitionDelay: '200ms' }}>
        <SearchCard>
          <CardContent>
            <Box display="flex" gap={2} mb={3}>
              <TextField
                fullWidth
                placeholder="Search trials by indication, intervention, NCT number, or research topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: colors.primary.main }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                  },
                }}
              />
              <SearchButton
                variant="contained"
                onClick={handleSearch}
                disabled={loading || !searchQuery.trim()}
                startIcon={<SearchIcon />}
              >
                {loading ? 'Searching...' : 'Search'}
              </SearchButton>
            </Box>

            {/* Filters */}
            <Grid container spacing={2} mb={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Phase</InputLabel>
                  <Select
                    value={filters.phase}
                    onChange={(e) => setFilters({ ...filters, phase: e.target.value })}
                    label="Phase"
                  >
                    <MenuItem value="all">All Phases</MenuItem>
                    <MenuItem value="1">Phase I</MenuItem>
                    <MenuItem value="2">Phase II</MenuItem>
                    <MenuItem value="3">Phase III</MenuItem>
                    <MenuItem value="4">Phase IV</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="all">All Statuses</MenuItem>
                    <MenuItem value="recruiting">Recruiting</MenuItem>
                    <MenuItem value="active">Active, not recruiting</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Indication/Disease"
                  value={filters.indication}
                  onChange={(e) => setFilters({ ...filters, indication: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={filters.country}
                    onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                    label="Country"
                  >
                    <MenuItem value="all">All Countries</MenuItem>
                    <MenuItem value="india">India</MenuItem>
                    <MenuItem value="usa">United States</MenuItem>
                    <MenuItem value="uk">United Kingdom</MenuItem>
                    <MenuItem value="china">China</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Quick Searches */}
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                <TrendingIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                Quick Searches:
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                {quickSearches.map((quick) => (
                  <QuickSearchChip
                    key={quick}
                    label={quick}
                    size="small"
                    onClick={() => handleQuickSearch(quick)}
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Source Selection */}
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block" mb={1}>
                <FilterIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                Data Sources (Select sources to search):
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip
                  label="ClinicalTrials.gov"
                  icon={<BiotechIcon />}
                  color={sources.clinicaltrials ? 'primary' : 'default'}
                  onClick={() => setSources({ ...sources, clinicaltrials: !sources.clinicaltrials })}
                  variant={sources.clinicaltrials ? 'filled' : 'outlined'}
                  sx={{ cursor: 'pointer' }}
                />
                <Chip
                  label="PubMed"
                  icon={<ArticleIcon />}
                  color={sources.pubmed ? 'primary' : 'default'}
                  onClick={() => setSources({ ...sources, pubmed: !sources.pubmed })}
                  variant={sources.pubmed ? 'filled' : 'outlined'}
                  sx={{ cursor: 'pointer' }}
                />
                <Chip
                  label="CTRI India"
                  icon={<ScienceIcon />}
                  color={sources.ctri ? 'secondary' : 'default'}
                  onClick={() => setSources({ ...sources, ctri: !sources.ctri })}
                  variant={sources.ctri ? 'filled' : 'outlined'}
                  sx={{ cursor: 'pointer' }}
                />
                <Chip
                  label="Perplexity AI"
                  icon={<AIIcon />}
                  color={sources.perplexity ? 'secondary' : 'default'}
                  onClick={() => setSources({ ...sources, perplexity: !sources.perplexity })}
                  variant={sources.perplexity ? 'filled' : 'outlined'}
                  sx={{ cursor: 'pointer' }}
                />
                <Chip
                  label="Grey Literature"
                  icon={<ArticleIcon />}
                  color={sources.grey ? 'default' : 'default'}
                  onClick={() => setSources({ ...sources, grey: !sources.grey })}
                  variant={sources.grey ? 'filled' : 'outlined'}
                  sx={{ cursor: 'pointer', opacity: 0.6 }}
                  disabled
                />
              </Box>
            </Box>
          </CardContent>
        </SearchCard>
      </Grow>

      {/* Loading */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Results */}
      {showResults && (
        <Fade in timeout={600}>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2 }}>
              <Tabs
                value={activeTab}
                onChange={(_, val) => setActiveTab(val)}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab
                  icon={<BiotechIcon />}
                  label={`Clinical Trials (${results.clinicalTrials.length + results.ctriIndia.length})`}
                  iconPosition="start"
                />
                <Tab
                  icon={<ArticleIcon />}
                  label={`Research Papers (${results.pubMed.length})`}
                  iconPosition="start"
                />
                <Tab
                  icon={<AIIcon />}
                  label="Perplexity AI"
                  iconPosition="start"
                />
                <Tab
                  icon={<BrainIcon />}
                  label="AI Insights"
                  iconPosition="start"
                />
              </Tabs>
              {activeTab !== 3 && results.clinicalTrials.length > 0 && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<BrainIcon />}
                  onClick={handleAnalyzeWithAI}
                  disabled={loading}
                >
                  Analyze with AI
                </Button>
              )}
            </Box>

            <CardContent sx={{ minHeight: 400 }}>
              {activeTab === 0 && <ClinicalTrialsResults trials={[...results.clinicalTrials, ...results.ctriIndia]} />}
              {activeTab === 1 && <ResearchPapersResults papers={results.pubMed} />}
              {activeTab === 2 && <PerplexityAIPanel insights={results.perplexityAI} loading={loading} />}
              {activeTab === 3 && <AIInsightsPanel insights={results.aiInsights} loading={loading} />}
            </CardContent>
          </Card>
        </Fade>
      )}

      {/* Empty State */}
      {!showResults && (
        <Fade in timeout={1000} style={{ transitionDelay: '400ms' }}>
          <Box textAlign="center" py={8}>
            <ScienceIcon sx={{ fontSize: 80, color: colors.primary.light, mb: 2 }} />
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Start Your Research Journey
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Search across 400,000+ clinical trials and 35M+ research papers
            </Typography>
            <Box display="flex" gap={2} justifyContent="center">
              <Chip
                icon={<BiotechIcon />}
                label="ClinicalTrials.gov"
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<ArticleIcon />}
                label="PubMed"
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<ScienceIcon />}
                label="WHO ICTRP"
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<BiotechIcon />}
                label="CTRI India"
                color="primary"
                variant="outlined"
              />
            </Box>
          </Box>
        </Fade>
      )}
    </Box>
  );
};

// Clinical Trials Results Component
const ClinicalTrialsResults: React.FC<{ trials: any[] }> = ({ trials }) => {
  const [selectedTrial, setSelectedTrial] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const handleViewDetails = (trial: any) => {
    setSelectedTrial(trial);
    setDetailsDialogOpen(true);
  };

  const handleUseAsTemplate = (trial: any) => {
    // Navigate to protocol builder with trial data
    const protocolData = {
      title: trial.title,
      condition: trial.condition,
      intervention: trial.intervention,
      phase: trial.phase,
      enrollment: trial.enrollment,
      sponsor: trial.sponsor,
      sourceNCT: trial.nctId,
    };
    
    // Store in localStorage for protocol builder to pick up
    localStorage.setItem('templateTrial', JSON.stringify(protocolData));
    
    // Show success message
    alert(`Template created from ${trial.nctId}! Navigate to Protocol Builder to use it.`);
  };

  const handleExport = (trial: any) => {
    // Create JSON export
    const exportData = {
      nctId: trial.nctId,
      title: trial.title,
      phase: trial.phase,
      status: trial.status,
      condition: trial.condition,
      intervention: trial.intervention,
      enrollment: trial.enrollment,
      sponsor: trial.sponsor,
      startDate: trial.startDate,
      description: trial.description,
      exportedAt: new Date().toISOString(),
      source: 'ClinicalTrials.gov',
    };

    // Create downloadable file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trial-${trial.nctId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (trials.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" color="text.secondary">
          No clinical trials found. Try adjusting your search criteria.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box>
        {trials.map((trial, index) => (
          <Grow in timeout={400} style={{ transitionDelay: `${index * 50}ms` }} key={trial.nctId || index}>
            <ResultCard>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box flex={1}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {trial.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="primary"
                      sx={{ fontFamily: 'monospace', mb: 1 }}
                    >
                      {trial.nctId}
                    </Typography>
                  </Box>
                  <IconButton size="small">
                    <BookmarkIcon />
                  </IconButton>
                </Box>

                <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                  <Chip label={trial.phase} size="small" color="primary" />
                  <Chip label={trial.status} size="small" color="success" />
                  <Chip label={`${trial.enrollment} participants`} size="small" variant="outlined" />
                  {trial.source && (
                    <Chip 
                      label={trial.source} 
                      size="small" 
                      color="secondary" 
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                </Box>

                <Grid container spacing={2} mb={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">Condition</Typography>
                    <Typography variant="body2" fontWeight={600}>{trial.condition}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">Intervention</Typography>
                    <Typography variant="body2" fontWeight={600}>{trial.intervention}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">Sponsor</Typography>
                    <Typography variant="body2">{trial.sponsor}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">Start Date</Typography>
                    <Typography variant="body2">{trial.startDate || 'N/A'}</Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Box display="flex" gap={1} flexWrap="wrap">
                  <Button 
                    size="small" 
                    variant="contained" 
                    startIcon={<OpenIcon />}
                    onClick={() => handleViewDetails(trial)}
                  >
                    View Details
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    startIcon={<CopyIcon />}
                    onClick={() => handleUseAsTemplate(trial)}
                  >
                    Use as Template
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    startIcon={<DownloadIcon />}
                    onClick={() => handleExport(trial)}
                  >
                    Export
                  </Button>
                </Box>
              </CardContent>
            </ResultCard>
          </Grow>
        ))}
      </Box>

      {/* Trial Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Trial Details</Typography>
            <IconButton onClick={() => setDetailsDialogOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTrial && (
            <Box>
              <Typography variant="h6" gutterBottom>{selectedTrial.title}</Typography>
              <Typography variant="body2" color="primary" sx={{ fontFamily: 'monospace', mb: 2 }}>
                {selectedTrial.nctId}
              </Typography>
              
              <Box mb={2}>
                <Chip label={selectedTrial.phase} size="small" color="primary" sx={{ mr: 1 }} />
                <Chip label={selectedTrial.status} size="small" color="success" />
              </Box>

              <Typography variant="subtitle2" gutterBottom>Description</Typography>
              <Typography variant="body2" paragraph>{selectedTrial.description || 'No description available'}</Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Condition</Typography>
                  <Typography variant="body2">{selectedTrial.condition}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Intervention</Typography>
                  <Typography variant="body2">{selectedTrial.intervention}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Enrollment</Typography>
                  <Typography variant="body2">{selectedTrial.enrollment} participants</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Sponsor</Typography>
                  <Typography variant="body2">{selectedTrial.sponsor}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Start Date</Typography>
                  <Typography variant="body2">{selectedTrial.startDate || 'N/A'}</Typography>
                </Grid>
              </Grid>

              <Box mt={3}>
                <Button
                  variant="contained"
                  startIcon={<OpenIcon />}
                  href={`https://clinicaltrials.gov/study/${selectedTrial.nctId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on ClinicalTrials.gov
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

// Research Papers Results Component
const ResearchPapersResults: React.FC<{ papers: any[] }> = ({ papers }) => {
  const [selectedPaper, setSelectedPaper] = useState<any>(null);
  const [abstractDialogOpen, setAbstractDialogOpen] = useState(false);

  const handleReadAbstract = (paper: any) => {
    setSelectedPaper(paper);
    setAbstractDialogOpen(true);
  };

  const handleFullText = (paper: any) => {
    // Open PubMed full text page
    const pmid = paper.pmid;
    window.open(`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`, '_blank');
  };

  const handleCite = (paper: any) => {
    // Generate citation in APA format
    const citation = `${paper.authors} (${paper.year}). ${paper.title}. ${paper.journal}. ${paper.doi ? `https://doi.org/${paper.doi}` : `PMID: ${paper.pmid}`}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(citation).then(() => {
      alert('Citation copied to clipboard!');
    }).catch(() => {
      // Fallback: show citation in alert
      alert(`Citation:\n\n${citation}`);
    });
  };

  if (papers.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" color="text.secondary">
          No research papers found. Try different search terms.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box>
        {papers.map((paper, index) => (
          <Grow in timeout={400} style={{ transitionDelay: `${index * 50}ms` }} key={paper.pmid || index}>
            <ResultCard>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {paper.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  {paper.authors}
                </Typography>
                <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                  <Chip label={paper.journal} size="small" color="secondary" variant="outlined" />
                  <Chip label={paper.year} size="small" variant="outlined" />
                  {paper.doi && <Chip label={`DOI: ${paper.doi}`} size="small" variant="outlined" />}
                  <Chip label={`PMID: ${paper.pmid}`} size="small" variant="outlined" />
                  {paper.source && (
                    <Chip 
                      label={paper.source} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                </Box>
                <Box display="flex" gap={1}>
                  <Button 
                    size="small" 
                    variant="contained" 
                    startIcon={<ArticleIcon />}
                    onClick={() => handleReadAbstract(paper)}
                  >
                    Read Abstract
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    startIcon={<OpenIcon />}
                    onClick={() => handleFullText(paper)}
                  >
                    Full Text
                  </Button>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    startIcon={<CopyIcon />}
                    onClick={() => handleCite(paper)}
                  >
                    Cite
                  </Button>
                </Box>
              </CardContent>
            </ResultCard>
          </Grow>
        ))}
      </Box>

      {/* Abstract Dialog */}
      <Dialog
        open={abstractDialogOpen}
        onClose={() => setAbstractDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Abstract</Typography>
            <IconButton onClick={() => setAbstractDialogOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedPaper && (
            <Box>
              <Typography variant="h6" gutterBottom>{selectedPaper.title}</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {selectedPaper.authors}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {selectedPaper.journal}, {selectedPaper.year}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>Abstract</Typography>
              <Typography variant="body2" paragraph>
                {selectedPaper.abstract || 'Abstract not available. Click "Full Text" to view on PubMed.'}
              </Typography>

              {selectedPaper.doi && (
                <Typography variant="body2" color="primary">
                  DOI: {selectedPaper.doi}
                </Typography>
              )}
              <Typography variant="body2" color="primary">
                PMID: {selectedPaper.pmid}
              </Typography>

              <Box mt={3} display="flex" gap={2}>
                <Button
                  variant="contained"
                  startIcon={<OpenIcon />}
                  onClick={() => handleFullText(selectedPaper)}
                >
                  View on PubMed
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CopyIcon />}
                  onClick={() => handleCite(selectedPaper)}
                >
                  Copy Citation
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

// Perplexity AI Panel Component
const PerplexityAIPanel: React.FC<{ insights: any; loading: boolean }> = ({ insights, loading }) => {
  if (loading) {
    return (
      <Box textAlign="center" py={4}>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          Perplexity AI is searching the web for latest information...
        </Typography>
      </Box>
    );
  }

  if (!insights) {
    return (
      <Box textAlign="center" py={4}>
        <AIIcon sx={{ fontSize: 60, color: colors.primary.light, mb: 2 }} />
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Perplexity AI Search Not Available
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Enable Perplexity AI in source selection and search to get web-based insights
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }} icon={<AIIcon />}>
        <strong>Perplexity AI Web Search</strong> - Real-time information from across the web
      </Alert>

      <Card sx={{ border: `1px solid ${alpha(colors.primary.main, 0.2)}` }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <AIIcon sx={{ fontSize: 32, color: colors.primary.main }} />
            <Box>
              <Typography variant="h6" fontWeight={600}>
                AI-Powered Research Summary
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Query: {insights.query}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
            {insights.summary}
          </Typography>

          <Box mt={3} display="flex" gap={1} alignItems="center">
            <Chip 
              label="Powered by Perplexity AI" 
              size="small" 
              color="primary" 
              variant="outlined"
            />
            <Typography variant="caption" color="text.secondary">
              Generated: {new Date(insights.timestamp).toLocaleString()}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

// AI Insights Panel Component
const AIInsightsPanel: React.FC<{ insights: any; loading: boolean }> = ({ insights, loading }) => {
  if (loading) {
    return (
      <Box textAlign="center" py={4}>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          AI is analyzing trials and generating insights...
        </Typography>
      </Box>
    );
  }

  if (!insights) {
    return (
      <Box textAlign="center" py={4}>
        <BrainIcon sx={{ fontSize: 60, color: colors.primary.light, mb: 2 }} />
        <Typography variant="h6" fontWeight={600} gutterBottom>
          AI Insights Not Generated Yet
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Click "Analyze with AI" to get intelligent insights from search results
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Alert severity="success" sx={{ mb: 3 }} icon={<AIIcon />}>
        <strong>AI Analysis Complete!</strong> Analyzed {insights.trialsAnalyzed} trials
        {insights.query && ` for "${insights.query}"`}
      </Alert>

      {insights.commonPatterns && insights.commonPatterns.length > 0 && (
        <Card sx={{ mb: 2, border: `1px solid ${alpha(colors.primary.main, 0.2)}` }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              📊 Common Design Patterns
            </Typography>
            {insights.commonPatterns.map((pattern: string, idx: number) => (
              <Typography key={idx} variant="body2" sx={{ mb: 1 }}>
                • {pattern}
              </Typography>
            ))}
          </CardContent>
        </Card>
      )}

      {insights.recommendations && insights.recommendations.length > 0 && (
        <Card sx={{ mb: 2, border: `1px solid ${alpha(colors.secondary.main, 0.2)}` }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              💡 Recommendations for Your Protocol
            </Typography>
            {insights.recommendations.map((rec: string, idx: number) => (
              <Typography key={idx} variant="body2" sx={{ mb: 1 }}>
                • {rec}
              </Typography>
            ))}
          </CardContent>
        </Card>
      )}

      {insights.sampleSizes && (
        <Card sx={{ mb: 2, border: `1px solid ${alpha(colors.semantic.info, 0.2)}` }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              📈 Sample Size Insights
            </Typography>
            <Typography variant="body2">
              {insights.sampleSizes}
            </Typography>
          </CardContent>
        </Card>
      )}

      {insights.phaseDistribution && Object.keys(insights.phaseDistribution).length > 0 && (
        <Card sx={{ mb: 2, border: `1px solid ${alpha(colors.primary.main, 0.2)}` }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              🔬 Phase Distribution
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {Object.entries(insights.phaseDistribution).map(([phase, count]) => (
                <Chip 
                  key={phase} 
                  label={`${phase}: ${count}`} 
                  color="primary" 
                  variant="outlined"
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {insights.recruitmentStatus && (
        <Card sx={{ border: `1px solid ${alpha(colors.semantic.success, 0.2)}` }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              👥 Recruitment Status
            </Typography>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Chip 
                label={`Recruiting: ${insights.recruitmentStatus.recruiting}`} 
                color="success" 
              />
              <Chip 
                label={`Active: ${insights.recruitmentStatus.active}`} 
                color="info" 
              />
              <Chip 
                label={`Total: ${insights.recruitmentStatus.total}`} 
                variant="outlined" 
              />
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

// Demo data generators
function generateDemoTrials() {
  return [
    {
      nctId: 'NCT05123456',
      title: 'Phase III Study of Novel Diabetes Treatment with GLP-1 Agonist',
      phase: 'Phase III',
      status: 'Recruiting',
      condition: 'Type 2 Diabetes Mellitus',
      intervention: 'Drug X (GLP-1 Agonist)',
      enrollment: 500,
      sponsor: 'University Medical Center',
      startDate: '2024-01-15',
      source: 'ClinicalTrials.gov',
    },
    {
      nctId: 'NCT05234567',
      title: 'Randomized Controlled Trial of Immunotherapy in Advanced Lung Cancer',
      phase: 'Phase II',
      status: 'Active, not recruiting',
      condition: 'Non-Small Cell Lung Cancer',
      intervention: 'Pembrolizumab + Chemotherapy',
      enrollment: 300,
      sponsor: 'Cancer Research Institute',
      startDate: '2023-06-01',
      source: 'ClinicalTrials.gov',
    },
    {
      nctId: 'NCT05345678',
      title: 'Cardiovascular Outcomes Study of SGLT2 Inhibitor',
      phase: 'Phase III',
      status: 'Recruiting',
      condition: 'Heart Failure with Reduced Ejection Fraction',
      intervention: 'Dapagliflozin',
      enrollment: 750,
      sponsor: 'Cardiology Research Foundation',
      startDate: '2024-03-01',
      source: 'ClinicalTrials.gov',
    },
  ];
}

function generateDemoPapers() {
  return [
    {
      pmid: '38123456',
      title: 'Efficacy and Safety of GLP-1 Receptor Agonists in Type 2 Diabetes: A Meta-Analysis',
      authors: 'Smith J, Johnson M, Williams K, et al.',
      journal: 'New England Journal of Medicine',
      year: '2024',
      doi: '10.1056/NEJMoa2312345',
      source: 'PubMed',
    },
    {
      pmid: '38234567',
      title: 'Immunotherapy Combinations in Advanced Non-Small Cell Lung Cancer: Systematic Review',
      authors: 'Chen L, Rodriguez A, Patel S, et al.',
      journal: 'The Lancet Oncology',
      year: '2024',
      doi: '10.1016/S1470-2045(24)00123-4',
      source: 'PubMed',
    },
    {
      pmid: '38345678',
      title: 'SGLT2 Inhibitors and Cardiovascular Outcomes: Real-World Evidence',
      authors: 'Anderson R, Thompson B, Davis M, et al.',
      journal: 'JAMA Cardiology',
      year: '2023',
      doi: '10.1001/jamacardio.2023.4567',
      source: 'PubMed',
    },
  ];
}

function generateDemoInsights() {
  return {
    trialsAnalyzed: 3,
    commonPatterns: [
      'Randomized, double-blind, placebo-controlled design is standard for Phase III trials',
      'Primary endpoints typically focus on HbA1c reduction (diabetes) or progression-free survival (oncology)',
      'Sample sizes range from 300-750 participants based on expected effect size',
      'Stratification by baseline characteristics (age, disease severity) is common',
    ],
    recommendations: [
      'Consider a 1:1 randomization ratio for balanced comparison',
      'Include both efficacy and safety endpoints in your protocol',
      'Plan for 12-24 month follow-up period based on indication',
      'Use validated assessment scales and standardized definitions',
      'Consider adaptive design elements for sample size re-estimation',
    ],
    sampleSizes: 'Median sample size: 500 participants (range: 300-750). Power calculations typically assume 80-90% power with alpha=0.05. Consider 10-15% dropout rate in your calculations.',
  };
}

// Filter demo trials based on sidebar filters
function filterDemoTrials(trials: any[], filters: any) {
  return trials.filter(trial => {
    // Filter by condition
    if (filters.condition && !trial.condition.toLowerCase().includes(filters.condition.toLowerCase())) {
      return false;
    }
    
    // Filter by phase
    if (filters.phase.length > 0) {
      const trialPhase = trial.phase.toLowerCase().replace('phase ', '');
      const hasMatchingPhase = filters.phase.some((p: string) => 
        trialPhase.includes(p.toLowerCase())
      );
      if (!hasMatchingPhase) return false;
    }
    
    // Filter by status
    if (filters.status.length > 0) {
      const hasMatchingStatus = filters.status.some((s: string) => 
        trial.status.toLowerCase().includes(s.toLowerCase())
      );
      if (!hasMatchingStatus) return false;
    }
    
    // Filter by gender (simplified - in real app would check eligibility criteria)
    if (filters.gender !== 'all') {
      // For demo, we'll just pass all trials through
      // In real implementation, this would check trial eligibility criteria
    }
    
    return true;
  });
}

// Generate AI insights from actual trial data
function generateInsightsFromTrials(trials: any[], query: string) {
  if (trials.length === 0) {
    return {
      trialsAnalyzed: 0,
      commonPatterns: ['No trials available for analysis'],
      recommendations: ['Search for clinical trials to get AI-powered insights'],
      sampleSizes: 'No data available',
    };
  }

  // Analyze phases
  const phases = trials.map(t => t.phase).filter(Boolean);
  const phaseCount: Record<string, number> = {};
  phases.forEach(phase => {
    phaseCount[phase] = (phaseCount[phase] || 0) + 1;
  });
  const mostCommonPhase = Object.keys(phaseCount).sort((a, b) => phaseCount[b] - phaseCount[a])[0];

  // Analyze status
  const statuses = trials.map(t => t.status).filter(Boolean);
  const recruitingCount = statuses.filter(s => s.toLowerCase().includes('recruiting')).length;
  const activeCount = statuses.filter(s => s.toLowerCase().includes('active')).length;

  // Analyze enrollment
  const enrollments = trials.map(t => t.enrollment).filter(e => e > 0);
  const avgEnrollment = enrollments.length > 0 
    ? Math.round(enrollments.reduce((a, b) => a + b, 0) / enrollments.length)
    : 0;
  const minEnrollment = enrollments.length > 0 ? Math.min(...enrollments) : 0;
  const maxEnrollment = enrollments.length > 0 ? Math.max(...enrollments) : 0;

  // Analyze conditions
  const conditions = trials.map(t => t.condition).filter(Boolean);
  const uniqueConditions = [...new Set(conditions)];

  // Analyze interventions
  const interventions = trials.map(t => t.intervention).filter(Boolean);
  const drugInterventions = interventions.filter(i => 
    i.toLowerCase().includes('drug') || 
    i.toLowerCase().includes('medication') ||
    i.toLowerCase().includes('therapy')
  ).length;

  // Generate common patterns
  const commonPatterns = [];
  if (mostCommonPhase) {
    commonPatterns.push(`${mostCommonPhase} is the most common phase (${phaseCount[mostCommonPhase]} trials)`);
  }
  if (recruitingCount > 0) {
    commonPatterns.push(`${recruitingCount} trials are currently recruiting participants`);
  }
  if (activeCount > 0) {
    commonPatterns.push(`${activeCount} trials are active but not recruiting`);
  }
  if (avgEnrollment > 0) {
    commonPatterns.push(`Average enrollment: ${avgEnrollment} participants per trial`);
  }
  if (uniqueConditions.length > 1) {
    commonPatterns.push(`Trials cover ${uniqueConditions.length} different conditions`);
  }
  if (drugInterventions > 0) {
    commonPatterns.push(`${drugInterventions} trials involve drug/medication interventions`);
  }
  commonPatterns.push('Randomized controlled trial design is standard for efficacy studies');
  commonPatterns.push('Double-blind methodology commonly used to minimize bias');

  // Generate recommendations
  const recommendations = [
    'Consider a randomized, controlled design for robust evidence generation',
    'Include both primary and secondary endpoints in your protocol',
    avgEnrollment > 0 
      ? `Target enrollment of ${Math.round(avgEnrollment * 0.8)}-${Math.round(avgEnrollment * 1.2)} participants based on similar trials`
      : 'Plan adequate sample size based on power calculations',
    'Use validated assessment tools and standardized definitions',
    'Consider stratification by key baseline characteristics',
    'Include safety monitoring and adverse event reporting procedures',
    recruitingCount > 0 
      ? 'Review recruiting trials for current best practices in patient enrollment'
      : 'Study completed trials for lessons learned and design improvements',
  ];

  // Generate sample size insights
  const sampleSizes = enrollments.length > 0
    ? `Sample sizes range from ${minEnrollment} to ${maxEnrollment} participants (average: ${avgEnrollment}). Consider 80-90% power with alpha=0.05 for your calculations. Account for 10-15% dropout rate.`
    : 'Sample size data not available for analyzed trials';

  return {
    trialsAnalyzed: trials.length,
    query: query,
    commonPatterns,
    recommendations,
    sampleSizes,
    phaseDistribution: phaseCount,
    recruitmentStatus: {
      recruiting: recruitingCount,
      active: activeCount,
      total: statuses.length,
    },
    enrollmentStats: {
      min: minEnrollment,
      max: maxEnrollment,
      average: avgEnrollment,
    },
  };
}
