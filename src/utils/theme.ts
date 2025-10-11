// Utility functions for working with the theme and design system

import { alpha } from '@mui/material/styles';
import { colors, spacingValues } from '../styles/theme';
import type { TrialPhase, RecruitmentStatus } from '../types';

/**
 * Get color for trial phase
 */
export const getPhaseColor = (phase: TrialPhase): string => {
  switch (phase) {
    case 'I':
      return colors.medical.phase1;
    case 'II':
      return colors.medical.phase2;
    case 'III':
      return colors.medical.phase3;
    case 'IV':
      return colors.medical.phase4;
    default:
      return colors.medical.observational;
  }
};

/**
 * Get color for recruitment status
 */
export const getStatusColor = (status: RecruitmentStatus): string => {
  switch (status) {
    case 'recruiting':
      return colors.status.recruiting;
    case 'not_yet_recruiting':
      return colors.status.notYetRecruiting;
    case 'completed':
      return colors.status.completed;
    case 'suspended':
      return colors.status.suspended;
    default:
      return colors.text.secondary;
  }
};

/**
 * Get readable status label
 */
export const getStatusLabel = (status: RecruitmentStatus): string => {
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

/**
 * Get phase label with Roman numerals
 */
export const getPhaseLabel = (phase: TrialPhase): string => {
  return `Phase ${phase}`;
};

/**
 * Create alpha color with specified opacity
 */
export const createAlphaColor = (color: string, opacity: number): string => {
  return alpha(color, opacity);
};

/**
 * Get spacing value by key
 */
export const getSpacing = (key: keyof typeof spacingValues): number => {
  return spacingValues[key];
};

/**
 * Create responsive spacing based on screen size
 */
export const getResponsiveSpacing = (
  mobile: keyof typeof spacingValues,
  tablet: keyof typeof spacingValues,
  desktop: keyof typeof spacingValues
) => ({
  xs: spacingValues[mobile],
  sm: spacingValues[tablet],
  md: spacingValues[desktop],
});

/**
 * Get confidence score color based on percentage
 */
export const getConfidenceColor = (score: number): string => {
  if (score >= 80) return colors.semantic.success;
  if (score >= 60) return colors.semantic.warning;
  return colors.semantic.error;
};

/**
 * Get priority color
 */
export const getPriorityColor = (priority: 'high' | 'medium' | 'low'): string => {
  switch (priority) {
    case 'high':
      return colors.semantic.error;
    case 'medium':
      return colors.semantic.warning;
    case 'low':
      return colors.semantic.info;
    default:
      return colors.text.disabled;
  }
};

/**
 * Create hover styles for interactive elements
 */
export const createHoverStyles = (baseColor: string) => ({
  '&:hover': {
    backgroundColor: alpha(baseColor, 0.04),
    borderColor: baseColor,
  },
});

/**
 * Create focus styles for accessibility
 */
export const createFocusStyles = (color: string = colors.primary.main) => ({
  '&:focus-visible': {
    outline: `2px solid ${color}`,
    outlineOffset: '2px',
  },
});

/**
 * Create selection styles for selectable items
 */
export const createSelectionStyles = (color: string = colors.primary.main) => ({
  '&.selected': {
    backgroundColor: alpha(color, 0.08),
    borderColor: color,
    
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: 4,
      height: '100%',
      backgroundColor: color,
      borderRadius: '4px 0 0 4px',
    },
  },
});

/**
 * Create loading animation keyframes
 */
export const createLoadingAnimation = () => ({
  '@keyframes pulse': {
    '0%, 100%': {
      opacity: 1,
    },
    '50%': {
      opacity: 0.5,
    },
  },
  '@keyframes spin': {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100%': {
      transform: 'rotate(360deg)',
    },
  },
  '@keyframes shimmer': {
    '0%': {
      backgroundPosition: '200% 0',
    },
    '100%': {
      backgroundPosition: '-200% 0',
    },
  },
});

/**
 * Create skeleton loading styles
 */
export const createSkeletonStyles = () => ({
  background: `linear-gradient(90deg, ${colors.border.light} 25%, ${alpha(colors.border.main, 0.5)} 50%, ${colors.border.light} 75%)`,
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
});

/**
 * Create card elevation styles
 */
export const createCardElevation = (level: number = 1) => {
  const elevations = [
    'none',
    '0 2px 8px rgba(0,0,0,0.08)',
    '0 4px 16px rgba(0,0,0,0.12)',
    '0 8px 24px rgba(0,0,0,0.15)',
    '0 12px 32px rgba(0,0,0,0.2)',
  ];
  
  return {
    boxShadow: elevations[Math.min(level, elevations.length - 1)],
  };
};

/**
 * Create responsive font sizes
 */
export const createResponsiveFontSize = (
  mobile: string,
  tablet: string,
  desktop: string
) => ({
  fontSize: mobile,
  '@media (min-width: 600px)': {
    fontSize: tablet,
  },
  '@media (min-width: 960px)': {
    fontSize: desktop,
  },
});

/**
 * Create truncated text styles
 */
export const createTruncatedStyles = (lines: number = 1) => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

/**
 * Create gradient background
 */
export const createGradientBackground = (
  startColor: string,
  endColor: string,
  direction: string = '135deg'
) => ({
  background: `linear-gradient(${direction}, ${startColor} 0%, ${endColor} 100%)`,
});

/**
 * Validate color format (hex, rgb, rgba)
 */
export const isValidColor = (color: string): boolean => {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  const rgbRegex = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/;
  const rgbaRegex = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/;
  
  return hexRegex.test(color) || rgbRegex.test(color) || rgbaRegex.test(color);
};

/**
 * Convert hex color to RGB
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Get contrast ratio between two colors
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  // Simplified contrast ratio calculation
  // In a real implementation, you'd want to use a proper color library
  return 4.5; // Placeholder return value
};

/**
 * Check if color meets WCAG accessibility standards
 */
export const meetsAccessibilityStandards = (
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean => {
  const ratio = getContrastRatio(foreground, background);
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
};