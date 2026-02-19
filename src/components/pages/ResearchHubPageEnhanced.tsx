import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  InputAdornment,
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
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  OpenInNew as OpenIcon,
  Psychology as BrainIcon,
  TrendingUp as TrendingIcon,
  Edit as EditIcon,
  FindInPage as FindIcon,
  Lightbulb as LightbulbIcon,
  CompareArrows as CompareIcon,
  Timeline as TimelineIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { colors } from '../../styles/theme';

// Styled Components
const PageContainer = styled(Box)(() => ({
  minHeight: '100vh',
  backgroundColor: '#f8f9fa',
  padding: '32px',
  '@media (max-width: 600px)': {
    padding: '16px',
  },
}));

const TaskSection = styled(Box)(() => ({
  marginBottom: '40px',
  maxWidth: 1200,
  margin: '0 auto',
}));

const TaskCard = styled(Card)(() => ({
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: `1px solid ${alpha(colors.primary.main, 0.08)}`,
  borderRadius: 16,
  height: '100%',
  backgroundColor: '#ffffff',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: `0 12px 32px ${alpha(colors.primary.main, 0.18)}`,
    borderColor: colors.primary.main,
  },
}));

const TaskIcon = styled(Box)(() => ({
  width: 56,
  height: 56,
  borderRadius: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '16px',
  transition: 'transform 0.3s ease',
  '.MuiCard-root:hover &': {
    transform: 'scale(1.1) rotate(5deg)',
  },
}));

const SearchCard = styled(Card)(() => ({
  marginBottom: '24px',
  border: `1px solid ${alpha(colors.primary.main, 0.08)}`,
  boxShadow: `0 2px 12px ${alpha(colors.primary.main, 0.06)}`,
  borderRadius: 16,
  backgroundColor: '#ffffff',
}));

const ResultCard = styled(Card)(() => ({
  marginBottom: '20px',
  border: `1px solid ${alpha(colors.primary.main, 0.08)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  borderRadius: 12,
  backgroundColor: '#ffffff',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 8px 28px ${alpha(colors.primary.main, 0.16)}`,
    borderColor: colors.primary.main,
  },
}));

const QuickActionChip = styled(Chip)(() => ({
  margin: '4px',
  cursor: 'pointer',
  transition: 'all 0.25s ease',
  borderRadius: 20,
  fontWeight: 500,
  fontSize: '0.875rem',
  padding: '6px 4px',
  '&:hover': {
    backgroundColor: colors.primary.main,
    color: '#fff',
    transform: 'translateY(-2px)',
    boxShadow: `0 4px 12px ${alpha(colors.primary.main, 0.3)}`,
  },
}));

const SearchButton = styled(Button)(() => ({
  minWidth: 140,
  height: 56,
  borderRadius: 12,
  fontWeight: 700,
  fontSize: '1rem',
  background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
  boxShadow: `0 4px 16px ${alpha('#667eea', 0.35)}`,
  color: '#ffffff',
  textTransform: 'none',
  letterSpacing: '0.5px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: `linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)`,
    boxShadow: `0 6px 24px ${alpha('#667eea', 0.45)}`,
    transform: 'translateY(-2px)',
  },
  '&:disabled': {
    background: alpha('#667eea', 0.5),
    color: '#ffffff',
  },
}));

interface TaskOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
}

interface SourceOption {
  id: string;
  name: string;
  icon: React.ReactElement;
  enabled: boolean;
}

export const ResearchHubPageEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { searchQuery, setSearchQuery } = useSearch();
  const [view, setView] = useState<'tasks' | 'search'>('tasks');
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [bookmarkedItems, setBookmarkedItems] = useState<Set<string>>(new Set());
  const [selectedTrial, setSelectedTrial] = useState<any>(null);
  const [selectedPaper, setSelectedPaper] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [abstractDialogOpen, setAbstractDialogOpen] = useState(false);
  
  const [sources, setSources] = useState<SourceOption[]>([
    { id: 'clinicaltrials', name: 'ClinicalTrials.gov', icon: <BiotechIcon />, enabled: true },
    { id: 'pubmed', name: 'PubMed', icon: <ArticleIcon />, enabled: true },
    { id: 'ctri', name: 'CTRI India', icon: <ScienceIcon />, enabled: true },
    { id: 'perplexity', name: 'Perplexity AI', icon: <AIIcon />, enabled: true },
  ]);

  const [results, setResults] = useState<any>({
    clinicalTrials: [],
    pubMed: [],
    perplexityAI: null,
    aiInsights: null,
    naturalLanguageResponse: null,
  });

  const [showResults, setShowResults] = useState(false);
  const [showKnowledgePanel, setShowKnowledgePanel] = useState(false);
  const [displayedKnowledge, setDisplayedKnowledge] = useState('');
  
  // Ref to store typing animation interval
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Task-oriented options (SciSpace-inspired)
  const taskOptions: TaskOption[] = [
    {
      id: 'find-trials',
      title: 'Find Similar Trials',
      description: 'Search for clinical trials similar to your research',
      icon: <FindIcon sx={{ fontSize: 28 }} />,
      color: '#667eea',
      action: () => handleTaskAction('find-trials'),
    },
    {
      id: 'literature-review',
      title: 'Literature Review',
      description: 'Comprehensive review of research papers and studies',
      icon: <ArticleIcon sx={{ fontSize: 28 }} />,
      color: '#f093fb',
      action: () => handleTaskAction('literature-review'),
    },
    {
      id: 'design-protocol',
      title: 'Design Protocol',
      description: 'Get AI assistance to design your trial protocol',
      icon: <EditIcon sx={{ fontSize: 28 }} />,
      color: '#4facfe',
      action: () => handleTaskAction('design-protocol'),
    },
    {
      id: 'analyze-trends',
      title: 'Analyze Trends',
      description: 'Discover trends and patterns in clinical research',
      icon: <TimelineIcon sx={{ fontSize: 28 }} />,
      color: '#43e97b',
      action: () => handleTaskAction('analyze-trends'),
    },
    {
      id: 'compare-studies',
      title: 'Compare Studies',
      description: 'Side-by-side comparison of multiple trials',
      icon: <CompareIcon sx={{ fontSize: 28 }} />,
      color: '#fa709a',
      action: () => handleTaskAction('compare-studies'),
    },
    {
      id: 'get-insights',
      title: 'Get AI Insights',
      description: 'AI-powered analysis and recommendations',
      icon: <LightbulbIcon sx={{ fontSize: 28 }} />,
      color: '#feca57',
      action: () => handleTaskAction('get-insights'),
    },
  ];

  const handleTaskAction = (taskId: string) => {
    setView('search');
    // Pre-configure search based on task
    switch (taskId) {
      case 'find-trials':
        setSearchQuery('');
        setSources(prev => prev.map(s => ({ ...s, enabled: s.id === 'clinicaltrials' || s.id === 'ctri' })));
        break;
      case 'literature-review':
        setSearchQuery('');
        setSources(prev => prev.map(s => ({ ...s, enabled: s.id === 'pubmed' || s.id === 'perplexity' })));
        break;
      case 'design-protocol':
        navigate('/protocol-builder');
        return;
      case 'analyze-trends':
        setSearchQuery('');
        setSources(prev => prev.map(s => ({ ...s, enabled: true })));
        setActiveTab(3); // AI Insights tab
        break;
      case 'compare-studies':
        setSearchQuery('');
        setSources(prev => prev.map(s => ({ ...s, enabled: s.id === 'clinicaltrials' })));
        break;
      case 'get-insights':
        setSearchQuery('');
        setSources(prev => prev.map(s => ({ ...s, enabled: s.id === 'perplexity' })));
        setActiveTab(2); // Perplexity AI tab
        break;
    }
  };

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      return; // Silently return if no query - user will see empty search box
    }

    // Clear any ongoing typing animation from previous search
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    setLoading(true);
    setLoadingProgress(0);
    setShowResults(true);
    setShowKnowledgePanel(false);
    setDisplayedKnowledge(''); // Clear previous knowledge immediately
    setView('search');

    const selectedSources = sources.filter(s => s.enabled).map(s => s.id);

    if (selectedSources.length === 0) {
      alert('Please select at least one data source');
      setLoading(false);
      return;
    }

    console.log('Starting search:', { query: searchQuery, sources: selectedSources });

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      // First, process natural language query for knowledge enrichment
      let nlResponse = null;
      try {
        console.log('Processing natural language query...');
        const nlResult = await fetch('http://localhost:3001/api/research/natural-language', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery.trim() }),
        });
        
        if (nlResult.ok) {
          const nlData = await nlResult.json();
          if (nlData.success && nlData.data.enrichedKnowledge) {
            nlResponse = nlData.data;
            setShowKnowledgePanel(true);
            
            // Animate the text display
            const fullText = nlData.data.enrichedKnowledge;
            setDisplayedKnowledge('');
            let currentIndex = 0;
            const typingSpeed = 15; // milliseconds per character
            
            typingIntervalRef.current = setInterval(() => {
              if (currentIndex < fullText.length) {
                setDisplayedKnowledge(fullText.substring(0, currentIndex + 1));
                currentIndex++;
              } else {
                if (typingIntervalRef.current) {
                  clearInterval(typingIntervalRef.current);
                  typingIntervalRef.current = null;
                }
              }
            }, typingSpeed);
            
            console.log('Natural language processing successful');
          }
        }
      } catch (nlError) {
        console.warn('Natural language processing failed, continuing with regular search:', nlError);
      }

      console.log('Sending API request to:', 'http://localhost:3001/api/research/search');
      
      const response = await fetch('http://localhost:3001/api/research/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery.trim(),
          filters: {},
          sources: selectedSources,
        }),
      });

      console.log('API Response status:', response.status);

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();
      
      console.log('API Response data:', {
        success: data.success,
        clinicalTrialsCount: data.data?.clinicalTrials?.trials?.length || 0,
        pubMedCount: data.data?.pubMed?.articles?.length || 0,
        perplexityAI: !!data.data?.perplexityAI?.insights
      });
      
      setLoadingProgress(100);
      
      if (data.success) {
        const newResults = {
          clinicalTrials: data.data.clinicalTrials?.trials || [],
          pubMed: data.data.pubMed?.articles || [],
          perplexityAI: data.data.perplexityAI?.insights || null,
          aiInsights: null,
          naturalLanguageResponse: nlResponse,
        };
        
        console.log('Setting results:', {
          clinicalTrials: newResults.clinicalTrials.length,
          pubMed: newResults.pubMed.length,
          perplexityAI: !!newResults.perplexityAI,
          naturalLanguage: !!newResults.naturalLanguageResponse
        });
        
        setResults(newResults);
      } else {
        console.error('API returned success=false:', data);
        alert('Search failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Search error:', {
        message: error.message,
        error: error
      });
      setLoadingProgress(100);
      alert(`Search failed: ${error.message}. Please check the console for details.`);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
      }, 500);
    }
  }, [searchQuery, sources]);

  // Handle auto-search from landing page
  useEffect(() => {
    const state = location.state as any;
    if (state?.searchQuery && state?.autoSearch) {
      // Set everything synchronously to prevent flash
      setSearchQuery(state.searchQuery);
      setView('search');
      
      // Clear the location state to prevent re-triggering
      navigate(location.pathname, { replace: true, state: {} });
      
      // Trigger search immediately
      setTimeout(() => {
        handleSearch();
      }, 50);
    }
  }, [location, setSearchQuery, navigate, handleSearch]);

  const toggleBookmark = (itemId: string) => {
    setBookmarkedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const toggleSource = (sourceId: string) => {
    setSources(prev => prev.map(s => 
      s.id === sourceId ? { ...s, enabled: !s.enabled } : s
    ));
  };

  // Format AI response to make quoted terms bold
  const formatAIResponse = (text: string) => {
    if (!text) return text;
    
    // Replace text in quotes with bold formatting
    // Matches: "term", 'term', **term**, or *term*
    return text
      .replace(/"([^"]+)"/g, '<strong>$1</strong>')
      .replace(/'([^']+)'/g, '<strong>$1</strong>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
  };

  // Memoize formatted content to prevent re-rendering
  const formattedKnowledge = React.useMemo(() => {
    const content = displayedKnowledge || results.naturalLanguageResponse?.enrichedKnowledge || '';
    return formatAIResponse(content);
  }, [displayedKnowledge, results.naturalLanguageResponse]);

  // Task-oriented view
  if (view === 'tasks') {
    return (
      <PageContainer>
        <Fade in timeout={600}>
          <Box maxWidth={1200} mx="auto">
            {/* Header */}
            <Box textAlign="center" mb={7} mt={3}>
              <Typography 
                variant="h3" 
                fontWeight={800} 
                gutterBottom 
                sx={{ 
                  color: colors.text.primary,
                  mb: 1.5,
                  fontSize: { xs: '2rem', md: '2.75rem' },
                  letterSpacing: '-0.5px',
                }}
              >
                🔬 Research Hub
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary" 
                mb={5}
                sx={{ 
                  fontWeight: 400,
                  fontSize: { xs: '1rem', md: '1.25rem' },
                  maxWidth: 600,
                  mx: 'auto',
                }}
              >
                What would you like to do today?
              </Typography>

              {/* Quick Search Bar */}
              <Box maxWidth={680} mx="auto" mb={2}>
                <TextField
                  fullWidth
                  placeholder="Ask anything: 'What are the latest diabetes trials?' or 'Explain CAR-T therapy'"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setView('search');
                      handleSearch();
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: colors.primary.main, fontSize: 26 }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <SearchButton
                          onClick={() => {
                            setView('search');
                            handleSearch();
                          }}
                          size="large"
                        >
                          Search
                        </SearchButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3.5,
                      fontSize: '1.05rem',
                      padding: '6px 16px',
                      backgroundColor: 'white',
                      border: `2px solid ${alpha(colors.primary.main, 0.1)}`,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                        borderColor: alpha(colors.primary.main, 0.2),
                      },
                      '&.Mui-focused': {
                        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.2)',
                        borderColor: colors.primary.main,
                      }
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Task Grid */}
            <TaskSection>
              <Typography 
                variant="h5" 
                fontWeight={700} 
                gutterBottom 
                sx={{ 
                  mb: 3.5, 
                  color: colors.text.primary,
                  fontSize: '1.5rem',
                }}
              >
                I want to...
              </Typography>
              <Box 
                sx={{ 
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                  gap: 3,
                }}
              >
                {taskOptions.map((task, index) => (
                  <Grow in timeout={400} style={{ transitionDelay: `${index * 50}ms` }} key={task.id}>
                    <TaskCard onClick={task.action}>
                        <CardContent sx={{ p: 3.5 }}>
                          <TaskIcon sx={{ backgroundColor: alpha(task.color, 0.12) }}>
                            <Box sx={{ color: task.color }}>
                              {task.icon}
                            </Box>
                          </TaskIcon>
                          <Typography 
                            variant="h6" 
                            fontWeight={700} 
                            gutterBottom 
                            sx={{ 
                              fontSize: '1.15rem',
                              mb: 1,
                              color: colors.text.primary,
                            }}
                          >
                            {task.title}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              lineHeight: 1.7,
                              fontSize: '0.9rem',
                            }}
                          >
                            {task.description}
                          </Typography>
                        </CardContent>
                      </TaskCard>
                    </Grow>
                ))}
              </Box>
            </TaskSection>

            {/* Quick Actions */}
            <Box mt={6} textAlign="center">
              <Typography 
                variant="subtitle1" 
                fontWeight={600} 
                gutterBottom 
                sx={{ 
                  color: colors.text.primary,
                  mb: 2.5,
                  fontSize: '1.1rem',
                }}
              >
                Popular Searches
              </Typography>
              <Box display="flex" gap={1.5} flexWrap="wrap" justifyContent="center" mt={2}>
                {[
                  'What are the latest Phase III diabetes trials?', 
                  'Explain CAR-T cell therapy for cancer', 
                  'Show me cardiovascular trials in India',
                  'What is the success rate of immunotherapy?',
                  'Latest COVID-19 vaccine research'
                ].map((term) => (
                  <QuickActionChip
                    key={term}
                    label={term}
                    onClick={() => {
                      setSearchQuery(term);
                      setView('search');
                      setTimeout(() => handleSearch(), 100);
                    }}
                    variant="outlined"
                    sx={{
                      borderRadius: 20,
                      fontWeight: 500,
                      borderColor: alpha(colors.primary.main, 0.25),
                      borderWidth: 1.5,
                      '&:hover': {
                        borderColor: colors.primary.main,
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </Fade>
      </PageContainer>
    );
  }

  // Search results view
  return (
    <PageContainer>
      <Box maxWidth={1200} mx="auto">
        {/* Back to tasks button */}
        <Box mb={3}>
          <Button
            startIcon={<TrendingIcon />}
            onClick={() => setView('tasks')}
            sx={{ 
              textTransform: 'none',
              fontWeight: 600,
              color: colors.primary.main,
              '&:hover': {
                backgroundColor: alpha(colors.primary.main, 0.08),
              }
            }}
          >
            Back to Tasks
          </Button>
        </Box>

        {/* Search Interface */}
        <SearchCard>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" gap={2} mb={3} flexDirection={{ xs: 'column', sm: 'row' }}>
              <TextField
                fullWidth
                placeholder="Ask anything: 'What are the latest diabetes trials?' or 'Explain CAR-T therapy'"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: colors.primary.main, fontSize: 24 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: '#f8f9fa',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#ffffff',
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#ffffff',
                    }
                  },
                }}
              />
              <SearchButton
                onClick={handleSearch}
                disabled={loading || !searchQuery.trim()}
                startIcon={<SearchIcon />}
                sx={{ minWidth: { xs: '100%', sm: 140 } }}
              >
                {loading ? 'Searching...' : 'Search'}
              </SearchButton>
            </Box>

            {/* Source Selection */}
            <Box>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                gutterBottom 
                display="block" 
                mb={1.5}
                sx={{ fontWeight: 600, fontSize: '0.8rem' }}
              >
                Data Sources:
              </Typography>
              <Box display="flex" gap={1.5} flexWrap="wrap">
                {sources.map((source) => (
                  <Chip
                    key={source.id}
                    label={source.name}
                    icon={source.icon}
                    color={source.enabled ? 'primary' : 'default'}
                    onClick={() => toggleSource(source.id)}
                    variant={source.enabled ? 'filled' : 'outlined'}
                    sx={{ 
                      cursor: 'pointer',
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          </CardContent>
        </SearchCard>

        {/* Loading with Progress */}
        {loading && (
          <Card sx={{ mb: 3, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2} mb={1.5}>
                <Box flex={1}>
                  <Typography variant="body1" fontWeight={600} gutterBottom sx={{ color: colors.text.primary }}>
                    Searching across data sources...
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={loadingProgress} 
                    sx={{ 
                      height: 10, 
                      borderRadius: 5,
                      backgroundColor: alpha(colors.primary.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 5,
                        background: `linear-gradient(90deg, ${colors.primary.main} 0%, ${colors.primary.light} 100%)`,
                      }
                    }} 
                  />
                </Box>
                <Typography variant="h5" color="primary" fontWeight={700}>
                  {loadingProgress}%
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {loadingProgress < 30 && '🔍 Connecting to databases...'}
                {loadingProgress >= 30 && loadingProgress < 60 && '📊 Fetching results...'}
                {loadingProgress >= 60 && loadingProgress < 90 && '⚙️ Processing data...'}
                {loadingProgress >= 90 && '✨ Almost done...'}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* AI Knowledge Panel - Premium Design */}
        {showKnowledgePanel && results.naturalLanguageResponse && !loading && (
          <Fade in timeout={800}>
            <Card 
              sx={{ 
                mb: 3, 
                borderRadius: 4,
                border: 'none',
                background: `linear-gradient(135deg, ${alpha('#667eea', 0.05)} 0%, ${alpha('#764ba2', 0.08)} 100%)`,
                boxShadow: `0 8px 32px ${alpha('#667eea', 0.15)}`,
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                }
              }}
            >
              <CardContent sx={{ p: 4 }}>
                {/* Header with Animation */}
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 8px 24px ${alpha('#667eea', 0.4)}`,
                      animation: 'pulse 2s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { transform: 'scale(1)' },
                        '50%': { transform: 'scale(1.05)' },
                      }
                    }}
                  >
                    <BrainIcon sx={{ fontSize: 32, color: '#fff' }} />
                  </Box>
                  <Box flex={1}>
                    <Typography 
                      variant="h5" 
                      fontWeight={800} 
                      sx={{ 
                        color: colors.text.primary,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 0.5,
                      }}
                    >
                      AI Knowledge Assistant
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Powered by advanced AI • Evidence-based insights
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => setShowKnowledgePanel(false)}
                    sx={{
                      backgroundColor: alpha(colors.primary.main, 0.1),
                      '&:hover': {
                        backgroundColor: alpha(colors.primary.main, 0.2),
                      }
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>

                {/* Main Content with Beautiful Typography */}
                <Card 
                  sx={{ 
                    mb: 3,
                    borderRadius: 3,
                    backgroundColor: '#ffffff',
                    border: `1px solid ${alpha(colors.primary.main, 0.1)}`,
                    boxShadow: `0 4px 16px ${alpha(colors.primary.main, 0.08)}`,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      key={formattedKnowledge}
                      sx={{ 
                        whiteSpace: 'pre-wrap', 
                        lineHeight: 2,
                        color: colors.text.primary,
                        fontSize: '1.05rem',
                        fontWeight: 400,
                        '& strong': {
                          fontWeight: 700,
                          color: colors.primary.main,
                          backgroundColor: alpha(colors.primary.main, 0.08),
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }
                      }}
                      dangerouslySetInnerHTML={{ 
                        __html: formattedKnowledge
                      }}
                    />
                    {displayedKnowledge && results.naturalLanguageResponse && displayedKnowledge.length < results.naturalLanguageResponse.enrichedKnowledge.length && (
                      <Box 
                        component="span" 
                        sx={{ 
                          display: 'inline-block',
                          width: 8,
                          height: 20,
                          backgroundColor: colors.primary.main,
                          ml: 0.5,
                          verticalAlign: 'middle',
                          animation: 'blink 1s infinite',
                          '@keyframes blink': {
                            '0%, 50%': { opacity: 1 },
                            '51%, 100%': { opacity: 0 },
                          }
                        }}
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Action Cards Grid */}
                <Box 
                  sx={{ 
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                    gap: 2.5,
                  }}
                >
                  {/* Suggested Search Terms Card */}
                  {results.naturalLanguageResponse.searchSuggestions && results.naturalLanguageResponse.searchSuggestions.length > 0 && (
                    <Card 
                      sx={{ 
                        borderRadius: 3,
                        backgroundColor: alpha('#667eea', 0.04),
                        border: `1px solid ${alpha('#667eea', 0.15)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: `0 12px 28px ${alpha('#667eea', 0.2)}`,
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <SearchIcon sx={{ fontSize: 22, color: '#fff' }} />
                          </Box>
                          <Typography variant="h6" fontWeight={700} sx={{ color: colors.text.primary }}>
                            Suggested Searches
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                          Click any term to explore related trials and research
                        </Typography>
                        <Box display="flex" gap={1} flexWrap="wrap">
                          {results.naturalLanguageResponse.searchSuggestions.map((term: string, idx: number) => (
                            <Chip
                              key={idx}
                              label={term}
                              size="medium"
                              onClick={() => {
                                setSearchQuery(term);
                                setTimeout(() => handleSearch(), 100);
                              }}
                              sx={{
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                backgroundColor: '#ffffff',
                                border: `1.5px solid ${alpha('#667eea', 0.3)}`,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  backgroundColor: '#667eea',
                                  color: '#fff',
                                  transform: 'translateY(-2px)',
                                  boxShadow: `0 6px 16px ${alpha('#667eea', 0.3)}`,
                                }
                              }}
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  )}

                  {/* Related Topics Card */}
                  {results.naturalLanguageResponse.relatedTopics && results.naturalLanguageResponse.relatedTopics.length > 0 && (
                    <Card 
                      sx={{ 
                        borderRadius: 3,
                        backgroundColor: alpha('#f093fb', 0.04),
                        border: `1px solid ${alpha('#f093fb', 0.15)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: `0 12px 28px ${alpha('#f093fb', 0.2)}`,
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <LightbulbIcon sx={{ fontSize: 22, color: '#fff' }} />
                          </Box>
                          <Typography variant="h6" fontWeight={700} sx={{ color: colors.text.primary }}>
                            Related Topics
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                          Expand your research with these connected areas
                        </Typography>
                        <Box display="flex" gap={1} flexWrap="wrap">
                          {results.naturalLanguageResponse.relatedTopics.map((topic: string, idx: number) => (
                            <Chip
                              key={idx}
                              label={topic}
                              size="medium"
                              onClick={() => {
                                setSearchQuery(topic);
                                setTimeout(() => handleSearch(), 100);
                              }}
                              sx={{
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                backgroundColor: '#ffffff',
                                border: `1.5px solid ${alpha('#f093fb', 0.3)}`,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  backgroundColor: '#f093fb',
                                  color: '#fff',
                                  transform: 'translateY(-2px)',
                                  boxShadow: `0 6px 16px ${alpha('#f093fb', 0.3)}`,
                                }
                              }}
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  )}
                </Box>

                {/* Quick Actions Footer */}
                <Box 
                  mt={3} 
                  pt={3} 
                  borderTop={`1px solid ${alpha(colors.primary.main, 0.1)}`}
                  display="flex"
                  gap={2}
                  flexWrap="wrap"
                  justifyContent="center"
                >
                  <Button
                    variant="outlined"
                    startIcon={<CopyIcon />}
                    onClick={() => {
                      navigator.clipboard.writeText(results.naturalLanguageResponse.enrichedKnowledge);
                      alert('✅ AI insights copied to clipboard!');
                    }}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: alpha(colors.primary.main, 0.3),
                      '&:hover': {
                        borderColor: colors.primary.main,
                        backgroundColor: alpha(colors.primary.main, 0.05),
                      }
                    }}
                  >
                    Copy Insights
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<BookmarkIcon />}
                    onClick={() => {
                      const bookmark = {
                        query: searchQuery,
                        insights: results.naturalLanguageResponse.enrichedKnowledge,
                        timestamp: new Date().toISOString(),
                      };
                      const bookmarks = JSON.parse(localStorage.getItem('aiBookmarks') || '[]');
                      bookmarks.push(bookmark);
                      localStorage.setItem('aiBookmarks', JSON.stringify(bookmarks));
                      alert('✅ Saved to your bookmarks!');
                    }}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: alpha(colors.primary.main, 0.3),
                      '&:hover': {
                        borderColor: colors.primary.main,
                        backgroundColor: alpha(colors.primary.main, 0.05),
                      }
                    }}
                  >
                    Save for Later
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AIIcon />}
                    onClick={() => {
                      setSearchQuery('');
                      setShowKnowledgePanel(false);
                    }}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                      }
                    }}
                  >
                    Ask Another Question
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        )}

        {/* Results */}
        {showResults && !loading && (
          <Card sx={{ borderRadius: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={activeTab} 
                onChange={(_, val) => setActiveTab(val)} 
                variant="scrollable"
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    minHeight: 64,
                  }
                }}
              >
                <Tab
                  label={`Clinical Trials (${results.clinicalTrials.length})`}
                  icon={<BiotechIcon />}
                  iconPosition="start"
                />
                <Tab
                  label={`Research Papers (${results.pubMed.length})`}
                  icon={<ArticleIcon />}
                  iconPosition="start"
                />
                <Tab
                  label="AI Insights"
                  icon={<AIIcon />}
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            <CardContent sx={{ minHeight: 400, p: 3 }}>
              {activeTab === 0 && (
                <ClinicalTrialsResults 
                  trials={results.clinicalTrials} 
                  onBookmark={toggleBookmark} 
                  bookmarked={bookmarkedItems}
                  onViewDetails={(trial) => {
                    setSelectedTrial(trial);
                    setDetailsDialogOpen(true);
                  }}
                  onUseAsTemplate={(trial) => {
                    const protocolData = {
                      title: trial.title,
                      condition: trial.condition,
                      intervention: trial.intervention,
                      phase: trial.phase,
                      enrollment: trial.enrollment,
                      sponsor: trial.sponsor,
                      sourceNCT: trial.nctId,
                    };
                    localStorage.setItem('templateTrial', JSON.stringify(protocolData));
                    navigate('/protocol-builder');
                  }}
                  onExport={(trial) => {
                    const exportData = {
                      ...trial,
                      exportedAt: new Date().toISOString(),
                      exportedFrom: 'Clinical IQ Research Hub',
                    };
                    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `trial-${trial.nctId}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                />
              )}
              {activeTab === 1 && (
                <ResearchPapersResults 
                  papers={results.pubMed} 
                  onBookmark={toggleBookmark} 
                  bookmarked={bookmarkedItems}
                  onReadAbstract={(paper) => {
                    setSelectedPaper(paper);
                    setAbstractDialogOpen(true);
                  }}
                  onFullText={(paper) => {
                    window.open(`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`, '_blank');
                  }}
                  onCite={(paper) => {
                    const citation = `${paper.authors} (${paper.year}). ${paper.title}. ${paper.journal}. ${paper.doi ? `https://doi.org/${paper.doi}` : `PMID: ${paper.pmid}`}`;
                    navigator.clipboard.writeText(citation).then(() => {
                      alert('Citation copied to clipboard!');
                    });
                  }}
                />
              )}
              {activeTab === 2 && <AIInsightsPanel insights={results.perplexityAI} />}
            </CardContent>
          </Card>
        )}
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

              <Box 
                sx={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 2,
                  mb: 3,
                }}
              >
                <Box>
                  <Typography variant="subtitle2">Condition</Typography>
                  <Typography variant="body2">{selectedTrial.condition}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">Intervention</Typography>
                  <Typography variant="body2">{selectedTrial.intervention}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">Enrollment</Typography>
                  <Typography variant="body2">{selectedTrial.enrollment} participants</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">Sponsor</Typography>
                  <Typography variant="body2">{selectedTrial.sponsor}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">Start Date</Typography>
                  <Typography variant="body2">{selectedTrial.startDate || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">Source</Typography>
                  <Typography variant="body2">{selectedTrial.source || 'ClinicalTrials.gov'}</Typography>
                </Box>
              </Box>

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
                  onClick={() => window.open(`https://pubmed.ncbi.nlm.nih.gov/${selectedPaper.pmid}/`, '_blank')}
                >
                  View on PubMed
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CopyIcon />}
                  onClick={() => {
                    const citation = `${selectedPaper.authors} (${selectedPaper.year}). ${selectedPaper.title}. ${selectedPaper.journal}. ${selectedPaper.doi ? `https://doi.org/${selectedPaper.doi}` : `PMID: ${selectedPaper.pmid}`}`;
                    navigator.clipboard.writeText(citation).then(() => {
                      alert('Citation copied to clipboard!');
                    });
                  }}
                >
                  Copy Citation
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

// Clinical Trials Results Component
const ClinicalTrialsResults: React.FC<{ 
  trials: any[]; 
  onBookmark: (id: string) => void; 
  bookmarked: Set<string>;
  onViewDetails: (trial: any) => void;
  onUseAsTemplate: (trial: any) => void;
  onExport: (trial: any) => void;
}> = ({ trials, onBookmark, bookmarked, onViewDetails, onUseAsTemplate, onExport }) => {
  if (trials.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <BiotechIcon sx={{ fontSize: 64, color: alpha(colors.primary.main, 0.3), mb: 2 }} />
        <Typography variant="h6" fontWeight={600} gutterBottom color="text.primary">
          No clinical trials found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try adjusting your search terms or data sources
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {trials.map((trial, index) => (
        <Grow in timeout={400} style={{ transitionDelay: `${index * 50}ms` }} key={trial.nctId || index}>
          <ResultCard>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box flex={1}>
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: colors.text.primary, fontSize: '1.15rem' }}>
                    {trial.title}
                  </Typography>
                  <Typography variant="body2" color="primary" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    {trial.nctId}
                  </Typography>
                </Box>
                <IconButton 
                  size="small" 
                  onClick={() => onBookmark(trial.nctId)}
                  sx={{
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.15)',
                    }
                  }}
                >
                  {bookmarked.has(trial.nctId) ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
                </IconButton>
              </Box>

              <Box display="flex" gap={1} mb={2.5} flexWrap="wrap">
                <Chip label={trial.phase} size="small" color="primary" sx={{ fontWeight: 600 }} />
                <Chip label={trial.status} size="small" color="success" sx={{ fontWeight: 600 }} />
                <Chip label={`${trial.enrollment} participants`} size="small" variant="outlined" />
                {trial.source && <Chip label={trial.source} size="small" color="secondary" variant="outlined" sx={{ fontWeight: 600 }} />}
              </Box>

              <Box 
                sx={{ 
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                  gap: 2,
                  mb: 2.5,
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Condition</Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ color: colors.text.primary }}>{trial.condition}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>Intervention</Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ color: colors.text.primary }}>{trial.intervention}</Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box display="flex" gap={1.5} flexWrap="wrap">
                <Button 
                  size="small" 
                  variant="contained" 
                  startIcon={<OpenIcon />} 
                  onClick={() => onViewDetails(trial)}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                  }}
                >
                  View Details
                </Button>
                <Button 
                  size="small" 
                  variant="outlined" 
                  startIcon={<CopyIcon />} 
                  onClick={() => onUseAsTemplate(trial)}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                  }}
                >
                  Use as Template
                </Button>
                <Button 
                  size="small" 
                  variant="outlined" 
                  startIcon={<DownloadIcon />} 
                  onClick={() => onExport(trial)}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                  }}
                >
                  Export
                </Button>
              </Box>
            </CardContent>
          </ResultCard>
        </Grow>
      ))}
    </Box>
  );
};

// Research Papers Results Component
const ResearchPapersResults: React.FC<{ 
  papers: any[]; 
  onBookmark: (id: string) => void; 
  bookmarked: Set<string>;
  onReadAbstract: (paper: any) => void;
  onFullText: (paper: any) => void;
  onCite: (paper: any) => void;
}> = ({ papers, onBookmark, bookmarked, onReadAbstract, onFullText, onCite }) => {
  if (papers.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <ArticleIcon sx={{ fontSize: 64, color: alpha(colors.primary.main, 0.3), mb: 2 }} />
        <Typography variant="h6" fontWeight={600} gutterBottom color="text.primary">
          No research papers found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try different search terms or enable more data sources
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {papers.map((paper, index) => (
        <Grow in timeout={400} style={{ transitionDelay: `${index * 50}ms` }} key={paper.pmid || index}>
          <ResultCard>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box flex={1}>
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: colors.text.primary, fontSize: '1.15rem' }}>
                    {paper.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {paper.authors}
                  </Typography>
                </Box>
                <IconButton 
                  size="small" 
                  onClick={() => onBookmark(paper.pmid)}
                  sx={{
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.15)',
                    }
                  }}
                >
                  {bookmarked.has(paper.pmid) ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
                </IconButton>
              </Box>

              <Box display="flex" gap={1} mb={2.5} flexWrap="wrap">
                <Chip label={paper.journal} size="small" color="secondary" variant="outlined" sx={{ fontWeight: 600 }} />
                <Chip label={paper.year} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                {paper.source && <Chip label={paper.source} size="small" color="primary" variant="outlined" sx={{ fontWeight: 600 }} />}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box display="flex" gap={1.5} flexWrap="wrap">
                <Button 
                  size="small" 
                  variant="contained" 
                  startIcon={<ArticleIcon />} 
                  onClick={() => onReadAbstract(paper)}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                  }}
                >
                  Read Abstract
                </Button>
                <Button 
                  size="small" 
                  variant="outlined" 
                  startIcon={<OpenIcon />} 
                  onClick={() => onFullText(paper)}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                  }}
                >
                  Full Text
                </Button>
                <Button 
                  size="small" 
                  variant="outlined" 
                  startIcon={<CopyIcon />} 
                  onClick={() => onCite(paper)}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                  }}
                >
                  Cite
                </Button>
              </Box>
            </CardContent>
          </ResultCard>
        </Grow>
      ))}
    </Box>
  );
};

// AI Insights Panel - Enhanced Design
const AIInsightsPanel: React.FC<{ insights: any }> = ({ insights }) => {
  // Format insights text to highlight quoted terms and **bold** text
  const formatInsightsText = (text: string) => {
    if (!text) return text;
    
    return text
      // Handle **bold** markdown
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="highlight-term">$1</strong>')
      // Handle "quoted" terms
      .replace(/"([^"]+)"/g, '<strong class="highlight-term">$1</strong>')
      // Handle 'single quoted' terms
      .replace(/'([^']+)'/g, '<strong class="highlight-term">$1</strong>')
      // Handle ### headers
      .replace(/###\s+(.+)/g, '<h3 class="section-header">$1</h3>')
      // Handle ## headers
      .replace(/##\s+(.+)/g, '<h2 class="section-header">$1</h2>')
      // Handle # headers
      .replace(/#\s+(.+)/g, '<h1 class="section-header">$1</h1>')
      // Handle bullet points
      .replace(/^[-*]\s+(.+)/gm, '<li class="bullet-point">$1</li>')
      // Handle numbered lists
      .replace(/^\d+\.\s+(.+)/gm, '<li class="numbered-point">$1</li>');
  };

  const formattedInsights = React.useMemo(() => {
    return formatInsightsText(insights?.summary || '');
  }, [insights]);

  if (!insights) {
    return (
      <Box textAlign="center" py={8}>
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${alpha(colors.primary.main, 0.1)} 0%, ${alpha(colors.primary.light, 0.2)} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}
        >
          <BrainIcon sx={{ fontSize: 64, color: colors.primary.main }} />
        </Box>
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: colors.text.primary }}>
          AI Insights Not Available
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', lineHeight: 1.8, mt: 2 }}>
          Enable Perplexity AI from the data sources and perform a search to get intelligent, real-time insights and comprehensive analysis
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Card */}
      <Card 
        sx={{ 
          mb: 3,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha('#667eea', 0.08)} 0%, ${alpha('#764ba2', 0.12)} 100%)`,
          border: `2px solid ${alpha(colors.primary.main, 0.2)}`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 6px 20px ${alpha('#667eea', 0.4)}`,
              }}
            >
              <AIIcon sx={{ fontSize: 28, color: '#fff' }} />
            </Box>
            <Box flex={1}>
              <Typography variant="h6" fontWeight={700} sx={{ color: colors.text.primary, mb: 0.5 }}>
                AI-Powered Research Summary
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Real-time insights from web search • Evidence-based analysis
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Main Content Card */}
      <Card 
        sx={{ 
          border: `1px solid ${alpha(colors.primary.main, 0.12)}`,
          borderRadius: 3,
          backgroundColor: '#ffffff',
          boxShadow: `0 4px 20px ${alpha(colors.primary.main, 0.08)}`,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box
            sx={{ 
              '& .highlight-term': {
                fontWeight: 700,
                color: colors.primary.main,
                backgroundColor: alpha(colors.primary.main, 0.1),
                padding: '3px 8px',
                borderRadius: '6px',
                display: 'inline-block',
                margin: '0 2px',
                border: `1px solid ${alpha(colors.primary.main, 0.2)}`,
              },
              '& .section-header': {
                fontWeight: 700,
                color: colors.text.primary,
                marginTop: '24px',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: `2px solid ${alpha(colors.primary.main, 0.15)}`,
              },
              '& h1.section-header': {
                fontSize: '1.5rem',
              },
              '& h2.section-header': {
                fontSize: '1.3rem',
              },
              '& h3.section-header': {
                fontSize: '1.1rem',
              },
              '& .bullet-point, & .numbered-point': {
                marginLeft: '24px',
                marginBottom: '8px',
                lineHeight: 1.8,
                color: colors.text.primary,
                fontSize: '1.05rem',
                '&::marker': {
                  color: colors.primary.main,
                  fontWeight: 700,
                },
              },
              '& ul, & ol': {
                paddingLeft: 0,
                marginTop: '12px',
                marginBottom: '12px',
              },
              whiteSpace: 'pre-wrap', 
              lineHeight: 2,
              color: colors.text.primary,
              fontSize: '1.05rem',
              fontWeight: 400,
            }}
            dangerouslySetInnerHTML={{ __html: formattedInsights }}
          />
        </CardContent>
      </Card>

      {/* Info Footer */}
      <Box 
        mt={3} 
        p={2.5} 
        sx={{ 
          backgroundColor: alpha(colors.primary.main, 0.04),
          borderRadius: 2,
          border: `1px solid ${alpha(colors.primary.main, 0.1)}`,
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: alpha(colors.primary.main, 0.15),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ fontSize: '1.2rem' }}>💡</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.6 }}>
            This summary is generated using real-time web search and may include the latest clinical trials, research findings, and treatment approaches not yet indexed in traditional databases.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ResearchHubPageEnhanced;
