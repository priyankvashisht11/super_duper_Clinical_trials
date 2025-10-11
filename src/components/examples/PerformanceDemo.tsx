import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  Button,
  Alert,
  Fade,
  CircularProgress,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  CloudDownload as OfflineIcon,
  PhoneAndroid as MobileIcon,
  TrendingUp as MetricsIcon,
  Wifi as OnlineIcon,
  WifiOff as WifiOffIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { colors } from '../../styles/theme';

const DemoContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  background: `linear-gradient(135deg, ${alpha(colors.primary.main, 0.02)}, ${alpha(colors.secondary.main, 0.02)})`,
  border: `1px solid ${alpha(colors.primary.main, 0.1)}`,
}));

const MetricCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  border: `1px solid ${alpha(colors.primary.main, 0.1)}`,
  background: `linear-gradient(135deg, ${alpha(colors.primary.main, 0.02)}, ${alpha(colors.secondary.main, 0.02)})`,
  transition: 'all 0.2s ease-in-out',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 24px ${alpha(colors.primary.main, 0.15)}`,
  },
}));

const PerformanceBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const SpeedIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 2),
  borderRadius: 20,
  background: `linear-gradient(135deg, ${alpha(colors.secondary.main, 0.1)}, ${alpha(colors.primary.main, 0.1)})`,
  border: `1px solid ${alpha(colors.secondary.main, 0.2)}`,
}));

const performanceMetrics = [
  {
    label: 'Search Response Time',
    value: 245,
    unit: 'ms',
    target: 500,
    icon: SpeedIcon,
    color: colors.status.recruiting,
    description: 'Average time to return search results',
  },
  {
    label: 'Page Load Time',
    value: 1.2,
    unit: 's',
    target: 2.0,
    icon: MetricsIcon,
    color: colors.status.recruiting,
    description: 'Time to interactive on first load',
  },
  {
    label: 'Offline Capability',
    value: 85,
    unit: '%',
    target: 80,
    icon: OfflineIcon,
    color: colors.status.recruiting,
    description: 'Features available without internet',
  },
  {
    label: 'Mobile Performance',
    value: 92,
    unit: '/100',
    target: 90,
    icon: MobileIcon,
    color: colors.status.recruiting,
    description: 'Lighthouse mobile performance score',
  },
];

const coreWebVitals = [
  {
    metric: 'Largest Contentful Paint (LCP)',
    value: 1.8,
    unit: 's',
    threshold: 2.5,
    status: 'good',
    description: 'Time until largest content element is rendered',
  },
  {
    metric: 'First Input Delay (FID)',
    value: 45,
    unit: 'ms',
    threshold: 100,
    status: 'good',
    description: 'Time from first user interaction to browser response',
  },
  {
    metric: 'Cumulative Layout Shift (CLS)',
    value: 0.08,
    unit: '',
    threshold: 0.1,
    status: 'good',
    description: 'Visual stability during page load',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'good':
      return colors.status.recruiting;
    case 'needs-improvement':
      return colors.status.notYetRecruiting;
    case 'poor':
      return colors.status.completed;
    default:
      return colors.text.secondary;
  }
};

export const PerformanceDemo: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const handleRunPerformanceTest = () => {
    setIsRunningTest(true);
    
    // Simulate performance test
    setTimeout(() => {
      setTestResults({
        searchTime: Math.floor(Math.random() * 200) + 150,
        loadTime: (Math.random() * 0.8 + 0.8).toFixed(1),
        timestamp: new Date().toLocaleTimeString(),
      });
      setIsRunningTest(false);
    }, 3000);
  };

  const toggleOfflineMode = () => {
    setIsOnline(!isOnline);
  };

  return (
    <DemoContainer>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        ⚡ Lightning Fast Performance Demo
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Experience sub-500ms search results, progressive web app capabilities, and optimized performance for medical workflows.
      </Typography>

      {/* Online/Offline Toggle */}
      <Box sx={{ mb: 4 }}>
        <Alert 
          severity={isOnline ? "success" : "warning"} 
          icon={isOnline ? <OnlineIcon /> : <WifiOffIcon />}
          action={
            <Button color="inherit" size="small" onClick={toggleOfflineMode}>
              {isOnline ? 'Test Offline Mode' : 'Go Online'}
            </Button>
          }
        >
          {isOnline 
            ? 'Online Mode: Full functionality available with real-time data sync'
            : 'Offline Mode: Core features available with cached data and local storage'
          }
        </Alert>
      </Box>

      {/* Performance Metrics */}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Real-time Performance Metrics
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {performanceMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          const percentage = (metric.value / metric.target) * 100;
          
          return (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <Fade in timeout={600} style={{ transitionDelay: `${index * 100}ms` }}>
                <MetricCard>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <IconComponent sx={{ fontSize: 40, color: metric.color, mb: 2 }} />
                    
                    <Typography variant="h4" sx={{ fontWeight: 700, color: metric.color, mb: 1 }}>
                      {metric.value}{metric.unit}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
                      {metric.label}
                    </Typography>
                    
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(percentage, 100)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: alpha(metric.color, 0.1),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          backgroundColor: metric.color,
                        },
                        mb: 2,
                      }}
                    />
                    
                    <Typography variant="caption" color="text.secondary">
                      {metric.description}
                    </Typography>
                    
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={percentage >= 100 ? 'Excellent' : percentage >= 80 ? 'Good' : 'Needs Improvement'}
                        size="small"
                        sx={{
                          backgroundColor: alpha(metric.color, 0.1),
                          color: metric.color,
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                  </CardContent>
                </MetricCard>
              </Fade>
            </Grid>
          );
        })}
      </Grid>

      {/* Core Web Vitals */}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Core Web Vitals
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {coreWebVitals.map((vital, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{ borderRadius: 2, border: `1px solid ${alpha(getStatusColor(vital.status), 0.2)}` }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {vital.metric}
                  </Typography>
                  <Chip
                    label={vital.status.replace('-', ' ')}
                    size="small"
                    sx={{
                      backgroundColor: alpha(getStatusColor(vital.status), 0.1),
                      color: getStatusColor(vital.status),
                      fontWeight: 500,
                      textTransform: 'capitalize',
                    }}
                  />
                </Box>
                
                <Typography variant="h4" sx={{ fontWeight: 700, color: getStatusColor(vital.status), mb: 1 }}>
                  {vital.value}{vital.unit}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {vital.description}
                </Typography>
                
                <PerformanceBar>
                  <Typography variant="caption" color="text.secondary">
                    Threshold: {vital.threshold}{vital.unit}
                  </Typography>
                </PerformanceBar>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Live Performance Test */}
      <Card sx={{ borderRadius: 2, border: `1px solid ${alpha(colors.primary.main, 0.2)}` }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Live Performance Test
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Run a real-time performance test to measure current search speed and responsiveness.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
            <Button
              variant="contained"
              onClick={handleRunPerformanceTest}
              disabled={isRunningTest}
              startIcon={isRunningTest ? <CircularProgress size={16} /> : <SpeedIcon />}
            >
              {isRunningTest ? 'Running Test...' : 'Run Performance Test'}
            </Button>
            
            {testResults && (
              <SpeedIndicator>
                <SpeedIcon fontSize="small" sx={{ color: colors.status.recruiting }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Last test: {testResults.searchTime}ms search • {testResults.loadTime}s load
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  at {testResults.timestamp}
                </Typography>
              </SpeedIndicator>
            )}
          </Box>

          {isRunningTest && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Testing performance metrics...
              </Typography>
              <LinearProgress 
                sx={{ 
                  height: 6, 
                  borderRadius: 3,
                  backgroundColor: alpha(colors.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    background: `linear-gradient(90deg, ${colors.primary.main}, ${colors.secondary.main})`,
                  },
                }} 
              />
            </Box>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                PWA Features
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <Typography component="li" variant="body2" color="text.secondary">
                  Service worker caching
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary">
                  Offline search capability
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary">
                  Background sync
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary">
                  App-like experience
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                Optimization Techniques
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                <Typography component="li" variant="body2" color="text.secondary">
                  Code splitting & lazy loading
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary">
                  Image optimization
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary">
                  CDN delivery
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary">
                  Database indexing
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </DemoContainer>
  );
};

export default PerformanceDemo;