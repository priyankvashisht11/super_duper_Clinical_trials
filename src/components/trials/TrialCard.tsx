import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Box,
  IconButton,
  Button,
  Checkbox,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Bookmark,
  BookmarkBorder,
  LocationOn,
  Person,
  Business,
  Science,
  Visibility,
  Add,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import type { ClinicalTrial, RecruitmentStatus, TrialPhase } from '../../types';

// Styled components for enhanced card design
const StyledCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  borderRadius: 12,
  border: `1px solid ${theme.palette.border.light}`,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  transition: 'all 0.2s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    transform: 'translateY(-2px)',
    borderColor: theme.palette.border.main,
  },
  '&.selected': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
}));

const CTRINumber = styled(Typography)(({ theme }) => ({
  fontFamily: 'monospace',
  fontSize: '0.875rem',
  fontWeight: 600,
  color: theme.palette.primary.main,
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  padding: '4px 8px',
  borderRadius: 4,
  display: 'inline-block',
  marginBottom: theme.spacing(1),
}));

const StatusChip = styled(Chip)<{ status: RecruitmentStatus }>(({ theme, status }) => {
  const getStatusColor = (status: RecruitmentStatus) => {
    switch (status) {
      case 'recruiting':
        return {
          backgroundColor: alpha(theme.palette.status.recruiting, 0.1),
          color: theme.palette.status.recruiting,
          borderColor: theme.palette.status.recruiting,
        };
      case 'not_yet_recruiting':
        return {
          backgroundColor: alpha(theme.palette.status.notYetRecruiting, 0.1),
          color: theme.palette.status.notYetRecruiting,
          borderColor: theme.palette.status.notYetRecruiting,
        };
      case 'completed':
        return {
          backgroundColor: alpha(theme.palette.status.completed, 0.1),
          color: theme.palette.status.completed,
          borderColor: theme.palette.status.completed,
        };
      case 'suspended':
        return {
          backgroundColor: alpha(theme.palette.status.suspended, 0.1),
          color: theme.palette.status.suspended,
          borderColor: theme.palette.status.suspended,
        };
      default:
        return {
          backgroundColor: alpha(theme.palette.grey[500], 0.1),
          color: theme.palette.grey[700],
          borderColor: theme.palette.grey[500],
        };
    }
  };

  const colors = getStatusColor(status);
  return {
    ...colors,
    border: `1px solid ${colors.borderColor}`,
    fontWeight: 500,
    fontSize: '0.75rem',
    height: 24,
  };
});

const PhaseChip = styled(Chip)<{ phase: TrialPhase }>(({ theme, phase }) => {
  const getPhaseColor = (phase: TrialPhase) => {
    switch (phase) {
      case 'I':
        return {
          backgroundColor: alpha(theme.palette.medical.phase1, 0.1),
          color: theme.palette.medical.phase1,
        };
      case 'II':
        return {
          backgroundColor: alpha(theme.palette.medical.phase2, 0.1),
          color: theme.palette.medical.phase2,
        };
      case 'III':
        return {
          backgroundColor: alpha(theme.palette.medical.phase3, 0.1),
          color: theme.palette.medical.phase3,
        };
      case 'IV':
        return {
          backgroundColor: alpha(theme.palette.medical.phase4, 0.1),
          color: theme.palette.medical.phase4,
        };
      default:
        return {
          backgroundColor: alpha(theme.palette.grey[500], 0.1),
          color: theme.palette.grey[700],
        };
    }
  };

  return {
    ...getPhaseColor(phase),
    fontWeight: 500,
    fontSize: '0.75rem',
    height: 24,
  };
});

const MetadataRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  marginBottom: theme.spacing(0.5),
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  '& .MuiSvgIcon-root': {
    fontSize: '1rem',
    color: theme.palette.text.disabled,
  },
}));

const SelectionCheckbox = styled(Checkbox)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  padding: theme.spacing(0.5),
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  borderRadius: '50%',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
}));

// Props interface
export interface TrialCardProps {
  trial: ClinicalTrial;
  isSelected?: boolean;
  isBookmarked?: boolean;
  showDistance?: boolean;
  distance?: number;
  highlightMatching?: string;
  onSelect?: (trialId: string, selected: boolean) => void;
  onBookmark?: (trialId: string, bookmarked: boolean) => void;
  onViewDetails?: (trialId: string) => void;
  onGenerateSummary?: (trialId: string) => void;
  selectable?: boolean;
  compact?: boolean;
}

// Utility functions
const formatRecruitmentStatus = (status: RecruitmentStatus): string => {
  switch (status) {
    case 'recruiting':
      return 'Recruiting';
    case 'not_yet_recruiting':
      return 'Not Yet Recruiting';
    case 'completed':
      return 'Completed';
    case 'suspended':
      return 'Suspended';
    default:
      return 'Unknown';
  }
};

const formatPhase = (phase: TrialPhase): string => {
  return `Phase ${phase}`;
};

const formatLocation = (trial: ClinicalTrial): string => {
  if (trial.locations.length === 0) return 'Location not specified';
  
  const primaryLocation = trial.locations[0];
  if (trial.locations.length === 1) {
    return `${primaryLocation.city}, ${primaryLocation.state}`;
  }
  
  return `${primaryLocation.city}, ${primaryLocation.state} +${trial.locations.length - 1} more`;
};

const getAgeGenderInfo = (_trial: ClinicalTrial): string => {
  // This would typically come from inclusion criteria parsing
  // For now, we'll use placeholder logic
  return 'All ages, Both sexes';
};

// Main component
export const TrialCard: React.FC<TrialCardProps> = ({
  trial,
  isSelected = false,
  isBookmarked = false,
  showDistance = false,
  distance,
  highlightMatching,
  onSelect,
  onBookmark,
  onViewDetails,
  onGenerateSummary,
  selectable = false,
  compact = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [localBookmarked, setLocalBookmarked] = useState(isBookmarked);

  // Handle bookmark toggle with local storage
  const handleBookmarkToggle = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    const newBookmarked = !localBookmarked;
    setLocalBookmarked(newBookmarked);
    
    // Update local storage
    const bookmarkedTrials = JSON.parse(
      localStorage.getItem('bookmarkedTrials') || '[]'
    );
    
    if (newBookmarked) {
      if (!bookmarkedTrials.includes(trial.id)) {
        bookmarkedTrials.push(trial.id);
      }
    } else {
      const index = bookmarkedTrials.indexOf(trial.id);
      if (index > -1) {
        bookmarkedTrials.splice(index, 1);
      }
    }
    
    localStorage.setItem('bookmarkedTrials', JSON.stringify(bookmarkedTrials));
    onBookmark?.(trial.id, newBookmarked);
  }, [localBookmarked, trial.id, onBookmark]);

  // Handle selection toggle
  const handleSelectionToggle = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    onSelect?.(trial.id, event.target.checked);
  }, [trial.id, onSelect]);

  // Handle card click
  const handleCardClick = useCallback(() => {
    if (!selectable) {
      onViewDetails?.(trial.id);
    }
  }, [selectable, onViewDetails, trial.id]);

  // Handle action buttons
  const handleViewDetails = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    onViewDetails?.(trial.id);
  }, [onViewDetails, trial.id]);

  const handleGenerateSummary = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    onGenerateSummary?.(trial.id);
  }, [onGenerateSummary, trial.id]);

  // Highlight matching text
  const highlightText = (text: string, highlight?: string): React.ReactNode => {
    if (!highlight || !text) return text;
    
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <Box
          key={index}
          component="span"
          sx={{
            backgroundColor: alpha(theme.palette.primary.main, 0.2),
            fontWeight: 600,
          }}
        >
          {part}
        </Box>
      ) : (
        part
      )
    );
  };

  return (
    <StyledCard
      className={isSelected ? 'selected' : ''}
      onClick={handleCardClick}
      data-testid="trial-card"
    >
      {/* Selection checkbox for document generation */}
      {selectable && (
        <SelectionCheckbox
          checked={isSelected}
          onChange={handleSelectionToggle}
          size="small"
          data-testid="select-trial-checkbox"
        />
      )}

      <CardContent sx={{ pb: compact ? 1 : 2 }}>
        {/* Header with CTRI number and status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <CTRINumber variant="body2">
            {trial.ctriNumber}
          </CTRINumber>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <StatusChip
              status={trial.recruitmentStatus}
              label={formatRecruitmentStatus(trial.recruitmentStatus)}
              size="small"
            />
            <Tooltip title={localBookmarked ? 'Remove bookmark' : 'Bookmark trial'}>
              <IconButton
                size="small"
                onClick={handleBookmarkToggle}
                sx={{ p: 0.5 }}
              >
                {localBookmarked ? (
                  <Bookmark sx={{ color: theme.palette.primary.main }} />
                ) : (
                  <BookmarkBorder />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Trial title */}
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 600,
            mb: 1,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: compact ? 2 : 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {highlightText(trial.title, highlightMatching)}
        </Typography>

        {/* Brief summary */}
        {!compact && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.4,
            }}
          >
            {highlightText(trial.briefSummary, highlightMatching)}
          </Typography>
        )}

        {/* Trial metadata */}
        <Box sx={{ mb: compact ? 1 : 2 }}>
          {/* Phase and Location */}
          <MetadataRow>
            <Science />
            <PhaseChip
              phase={trial.phase}
              label={formatPhase(trial.phase)}
              size="small"
            />
            <LocationOn sx={{ ml: 1 }} />
            <Typography variant="body2">
              {formatLocation(trial)}
              {showDistance && distance && (
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ color: theme.palette.primary.main, ml: 0.5 }}
                >
                  ({distance.toFixed(1)} km)
                </Typography>
              )}
            </Typography>
          </MetadataRow>

          {/* Age and Gender */}
          <MetadataRow>
            <Person />
            <Typography variant="body2">
              {getAgeGenderInfo(trial)}
            </Typography>
          </MetadataRow>

          {/* Sponsor */}
          <MetadataRow>
            <Business />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {trial.primarySponsor}
            </Typography>
          </MetadataRow>

          {/* Principal Investigator */}
          {!compact && (
            <MetadataRow>
              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                PI: {trial.principalInvestigator}
              </Typography>
            </MetadataRow>
          )}
        </Box>
      </CardContent>

      {/* Action buttons */}
      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Visibility />}
          onClick={handleViewDetails}
          sx={{ mr: 1 }}
        >
          View Details
        </Button>
        <Button
          variant="contained"
          size="small"
          startIcon={<Add />}
          onClick={handleGenerateSummary}
          disabled={!onGenerateSummary}
        >
          {isMobile ? 'Generate' : 'Generate Summary'}
        </Button>
      </CardActions>
    </StyledCard>
  );
};

export default TrialCard;