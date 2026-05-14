import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  IconButton,
  Alert,
  Fade,
  Divider,
} from '@mui/material';
import {
  Bookmark as BookmarkIcon,
  Share as ShareIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { colors } from '../../styles/theme';

const PageHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(colors.primary.light, 0.1)} 0%, ${alpha(colors.secondary.light, 0.05)} 100%)`,
  borderRadius: 16,
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  border: `1px solid ${alpha(colors.primary.main, 0.1)}`,
}));

const TrialCard = styled(Card)(() => ({
  transition: 'all 0.3s ease',
  border: `1px solid ${alpha(colors.primary.main, 0.1)}`,
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 24px ${alpha(colors.primary.main, 0.15)}`,
    borderColor: colors.primary.main,
  },
}));

const BookmarkButton = styled(IconButton)(() => ({
  position: 'absolute',
  top: 12,
  right: 12,
  backgroundColor: alpha('#fff', 0.9),
  '&:hover': {
    backgroundColor: '#fff',
  },
}));

interface BookmarkedTrial {
  id: string;
  title: string;
  ctriNumber: string;
  phase: string;
  status: string;
  condition: string;
  location: string;
  sponsor: string;
  bookmarkedAt: string;
  category: string;
}

export const BookmarksPage: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [bookmarkedTrials, setBookmarkedTrials] = useState<BookmarkedTrial[]>([
    {
      id: '1',
      title: 'A Phase III Study of Novel Diabetes Treatment',
      ctriNumber: 'CTRI/2024/01/123456',
      phase: 'Phase III',
      status: 'Recruiting',
      condition: 'Type 2 Diabetes',
      location: 'Mumbai, Maharashtra',
      sponsor: 'AIIMS Delhi',
      bookmarkedAt: '2024-02-09',
      category: 'diabetes'
    },
    {
      id: '2',
      title: 'Immunotherapy Trial for Advanced Cancer',
      ctriNumber: 'CTRI/2024/01/234567',
      phase: 'Phase II',
      status: 'Recruiting',
      condition: 'Lung Cancer',
      location: 'Bangalore, Karnataka',
      sponsor: 'Tata Memorial Hospital',
      bookmarkedAt: '2024-02-08',
      category: 'cancer'
    },
    {
      id: '3',
      title: 'Cardiovascular Disease Prevention Study',
      ctriNumber: 'CTRI/2024/01/345678',
      phase: 'Phase III',
      status: 'Active',
      condition: 'Hypertension',
      location: 'Chennai, Tamil Nadu',
      sponsor: 'CMC Vellore',
      bookmarkedAt: '2024-02-07',
      category: 'cardiovascular'
    },
    {
      id: '4',
      title: 'Alzheimer Disease Treatment Trial',
      ctriNumber: 'CTRI/2024/01/456789',
      phase: 'Phase II',
      status: 'Recruiting',
      condition: 'Alzheimer Disease',
      location: 'Delhi, NCR',
      sponsor: 'NIMHANS Bangalore',
      bookmarkedAt: '2024-02-06',
      category: 'neurological'
    },
  ]);

  const categories = [
    { value: 'all', label: 'All Bookmarks', count: bookmarkedTrials.length },
    { value: 'diabetes', label: 'Diabetes', count: bookmarkedTrials.filter(t => t.category === 'diabetes').length },
    { value: 'cancer', label: 'Cancer', count: bookmarkedTrials.filter(t => t.category === 'cancer').length },
    { value: 'cardiovascular', label: 'Cardiovascular', count: bookmarkedTrials.filter(t => t.category === 'cardiovascular').length },
    { value: 'neurological', label: 'Neurological', count: bookmarkedTrials.filter(t => t.category === 'neurological').length },
  ];

  const handleRemoveBookmark = (trialId: string) => {
    setBookmarkedTrials(prev => prev.filter(t => t.id !== trialId));
  };

  const handleViewTrial = (trialId: string) => {
    console.log('View trial:', trialId);
  };

  const handleShareTrial = (trialId: string) => {
    console.log('Share trial:', trialId);
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Phase I':
        return colors.semantic.info;
      case 'Phase II':
        return colors.semantic.warning;
      case 'Phase III':
        return colors.primary.main;
      case 'Phase IV':
        return colors.secondary.main;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Recruiting':
        return 'success';
      case 'Active':
        return 'primary';
      case 'Completed':
        return 'default';
      default:
        return 'default';
    }
  };

  const filteredTrials = filterCategory === 'all'
    ? bookmarkedTrials
    : bookmarkedTrials.filter(t => t.category === filterCategory);

  return (
    <Box sx={{ p: 4 }}>
      <Fade in timeout={600}>
        <PageHeader>
          <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: colors.text.primary }}>
            <BookmarkIcon sx={{ fontSize: 40, verticalAlign: 'middle', mr: 1, color: colors.primary.main }} />
            My Bookmarks
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quick access to your saved clinical trials for easy reference and comparison
          </Typography>
        </PageHeader>
      </Fade>

      {/* Stats */}
      <Fade in timeout={800} style={{ transitionDelay: '200ms' }}>
        <Card sx={{ mb: 3, background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`, color: '#fff' }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="h3" fontWeight={700}>
                  {bookmarkedTrials.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Bookmarks
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="h3" fontWeight={700}>
                  {bookmarkedTrials.filter(t => t.status === 'Recruiting').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Currently Recruiting
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="h3" fontWeight={700}>
                  {new Set(bookmarkedTrials.map(t => t.category)).size}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Categories
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Fade>

      {/* Category Filters */}
      <Fade in timeout={1000} style={{ transitionDelay: '400ms' }}>
        <Box sx={{ mb: 3, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <FilterIcon sx={{ color: colors.text.secondary }} />
          {categories.map((cat) => (
            <Chip
              key={cat.value}
              label={`${cat.label} (${cat.count})`}
              onClick={() => setFilterCategory(cat.value)}
              color={filterCategory === cat.value ? 'primary' : 'default'}
              sx={{ fontWeight: filterCategory === cat.value ? 600 : 400 }}
            />
          ))}
        </Box>
      </Fade>

      {/* Bookmarked Trials */}
      {filteredTrials.length > 0 ? (
        <Grid container spacing={3}>
          {filteredTrials.map((trial, index) => (
            <Grid size={{ xs: 12, md: 6 }} key={trial.id}>
              <Fade in timeout={600} style={{ transitionDelay: `${index * 100}ms` }}>
                <TrialCard>
                  <BookmarkButton
                    onClick={() => handleRemoveBookmark(trial.id)}
                    size="small"
                  >
                    <BookmarkIcon sx={{ color: colors.primary.main }} />
                  </BookmarkButton>

                  <CardContent sx={{ pt: 5 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {trial.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2, fontFamily: 'monospace' }}
                    >
                      {trial.ctriNumber}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip
                        label={trial.phase}
                        size="small"
                        sx={{
                          backgroundColor: alpha(getPhaseColor(trial.phase), 0.1),
                          color: getPhaseColor(trial.phase),
                          fontWeight: 600,
                        }}
                      />
                      <Chip
                        label={trial.status}
                        size="small"
                        color={getStatusColor(trial.status) as any}
                      />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Condition
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {trial.condition}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Location
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {trial.location}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Sponsor
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {trial.sponsor}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="caption" color="text.secondary">
                          Bookmarked: {new Date(trial.bookmarkedAt).toLocaleDateString()}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewTrial(trial.id)}
                        sx={{ flex: 1 }}
                      >
                        View Details
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => handleShareTrial(trial.id)}
                        sx={{ border: `1px solid ${colors.primary.main}` }}
                      >
                        <ShareIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveBookmark(trial.id)}
                        sx={{ border: `1px solid ${colors.semantic.error}`, color: colors.semantic.error }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </TrialCard>
              </Fade>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Fade in timeout={600}>
          <Alert
            severity="info"
            sx={{
              backgroundColor: '#e3f2fd',
              border: '2px solid #2196f3',
              '& .MuiAlert-icon': { color: '#1976d2' },
              '& .MuiAlert-message': {
                color: '#0d47a1',
                fontWeight: 600,
              }
            }}
          >
            <Typography variant="body2" fontWeight={600} gutterBottom>
              No bookmarks found
            </Typography>
            <Typography variant="body2">
              Start searching for trials and bookmark the ones you're interested in for quick access later!
            </Typography>
          </Alert>
        </Fade>
      )}
    </Box>
  );
};
