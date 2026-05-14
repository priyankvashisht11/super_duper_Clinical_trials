import { createTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

// NexTrial brand color palette
const medicalColors = {
  primary: {
    main: '#0047AB',
    dark: '#003080',
    light: '#E8F0FE',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#00897B',
    dark: '#00695C',
    light: '#E0F2F1',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#F7F9FC',
    paper: '#FFFFFF',
    surface: '#EEF2F7',
    elevated: '#FAFBFF',
  },
  text: {
    primary: '#0A1628',
    secondary: '#546E7A',
    disabled: '#90A4AE',
    hint: '#B0BEC5',
  },
  border: {
    light: '#E8EDF5',
    main: '#D0D9E8',
    dark: '#A8B8CC',
  },
  stages: {
    research: '#7C3AED',
    protocol: '#0047AB',
    regulatory: '#D97706',
    execute: '#059669',
    analyze: '#0284C7',
    submit: '#6D28D9',
  },
  status: {
    recruiting: '#4CAF50',
    notYetRecruiting: '#FF9800',
    completed: '#F44336',
    suspended: '#9E9E9E',
    active: '#2196F3',
  },
  medical: {
    phase1: '#9C27B0',
    phase2: '#FF9800',
    phase3: '#4CAF50',
    phase4: '#2196F3',
    observational: '#795548',
  },
  semantic: {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
  },
};

// Spacing system based on 8px grid
export const spacingValues = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Enhanced breakpoints for medical platform
const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
  },
};

// Typography system optimized for medical content
const typography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 600,
  fontWeightExtraBold: 700,
  h1: {
    fontSize: '2rem', // 32px
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.01562em',
  },
  h2: {
    fontSize: '1.5rem', // 24px
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.00833em',
  },
  h3: {
    fontSize: '1.25rem', // 20px
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: '1.125rem', // 18px
    fontWeight: 500,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1rem', // 16px
    fontWeight: 500,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: '0.875rem', // 14px
    fontWeight: 500,
    lineHeight: 1.6,
  },
  body1: {
    fontSize: '1rem', // 16px
    fontWeight: 400,
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem', // 14px
    fontWeight: 400,
    lineHeight: 1.43,
  },
  caption: {
    fontSize: '0.75rem', // 12px
    fontWeight: 400,
    lineHeight: 1.66,
  },
  overline: {
    fontSize: '0.75rem', // 12px
    fontWeight: 500,
    lineHeight: 2.66,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08333em',
  },
  button: {
    fontSize: '0.875rem', // 14px
    fontWeight: 500,
    textTransform: 'none' as const,
    letterSpacing: '0.02857em',
  },
};

const baseTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: medicalColors.primary.main,
      dark: medicalColors.primary.dark,
      light: medicalColors.primary.light,
      contrastText: medicalColors.primary.contrastText,
    },
    secondary: {
      main: medicalColors.secondary.main,
      dark: medicalColors.secondary.dark,
      light: medicalColors.secondary.light,
      contrastText: medicalColors.secondary.contrastText,
    },
    background: {
      default: medicalColors.background.default,
      paper: medicalColors.background.paper,
    },
    text: {
      primary: medicalColors.text.primary,
      secondary: medicalColors.text.secondary,
      disabled: medicalColors.text.disabled,
    },
    divider: medicalColors.border.main,
    success: {
      main: medicalColors.semantic.success,
      light: alpha(medicalColors.semantic.success, 0.1),
      dark: alpha(medicalColors.semantic.success, 0.8),
    },
    warning: {
      main: medicalColors.semantic.warning,
      light: alpha(medicalColors.semantic.warning, 0.1),
      dark: alpha(medicalColors.semantic.warning, 0.8),
    },
    error: {
      main: medicalColors.semantic.error,
      light: alpha(medicalColors.semantic.error, 0.1),
      dark: alpha(medicalColors.semantic.error, 0.8),
    },
    info: {
      main: medicalColors.semantic.info,
      light: alpha(medicalColors.semantic.info, 0.1),
      dark: alpha(medicalColors.semantic.info, 0.8),
    },
  },
  typography,
  spacing: 8, // Base unit: 8px
  shape: {
    borderRadius: 8,
  },
  breakpoints,
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.1)',
    '0 2px 8px rgba(0,0,0,0.1)',
    '0 4px 16px rgba(0,0,0,0.15)',
    '0 8px 24px rgba(0,0,0,0.15)',
    '0 12px 32px rgba(0,0,0,0.2)',
    '0 16px 40px rgba(0,0,0,0.2)',
    '0 20px 48px rgba(0,0,0,0.25)',
    '0 24px 56px rgba(0,0,0,0.25)',
    '0 28px 64px rgba(0,0,0,0.3)',
    '0 32px 72px rgba(0,0,0,0.3)',
    '0 36px 80px rgba(0,0,0,0.35)',
    '0 40px 88px rgba(0,0,0,0.35)',
    '0 44px 96px rgba(0,0,0,0.4)',
    '0 48px 104px rgba(0,0,0,0.4)',
    '0 52px 112px rgba(0,0,0,0.45)',
    '0 56px 120px rgba(0,0,0,0.45)',
    '0 60px 128px rgba(0,0,0,0.5)',
    '0 64px 136px rgba(0,0,0,0.5)',
    '0 68px 144px rgba(0,0,0,0.55)',
    '0 72px 152px rgba(0,0,0,0.55)',
    '0 76px 160px rgba(0,0,0,0.6)',
    '0 80px 168px rgba(0,0,0,0.6)',
    '0 84px 176px rgba(0,0,0,0.65)',
    '0 88px 184px rgba(0,0,0,0.65)',
  ],
  components: {
    // Button components with medical styling
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '10px 20px',
          minHeight: 40,
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderWidth: 1.5,
          '&:hover': {
            borderWidth: 1.5,
            backgroundColor: alpha(medicalColors.primary.main, 0.04),
          },
        },
        sizeSmall: {
          padding: '6px 12px',
          minHeight: 32,
          fontSize: '0.8125rem',
        },
        sizeLarge: {
          padding: '12px 24px',
          minHeight: 48,
          fontSize: '0.9375rem',
        },
      },
    },

    // Card components for trial cards and panels
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: `1px solid ${medicalColors.border.light}`,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            transform: 'translateY(-2px)',
            borderColor: medicalColors.border.main,
          },
        },
      },
    },

    // Input components
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: medicalColors.background.default,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: medicalColors.primary.main,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: 2,
              borderColor: medicalColors.primary.main,
            },
          },
          '& .MuiInputLabel-root': {
            fontWeight: 500,
          },
        },
      },
    },

    MuiAutocomplete: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            padding: '4px 8px',
          },
        },
        paper: {
          borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          border: `1px solid ${medicalColors.border.light}`,
        },
        option: {
          padding: '8px 16px',
          '&:hover': {
            backgroundColor: alpha(medicalColors.primary.main, 0.04),
          },
          '&[aria-selected="true"]': {
            backgroundColor: alpha(medicalColors.primary.main, 0.08),
          },
        },
      },
    },

    // Chip components for status indicators
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
          fontSize: '0.8125rem',
          height: 28,
        },
        colorPrimary: {
          backgroundColor: alpha(medicalColors.primary.main, 0.1),
          color: medicalColors.primary.dark,
        },
        colorSecondary: {
          backgroundColor: alpha(medicalColors.secondary.main, 0.1),
          color: medicalColors.secondary.dark,
        },
      },
    },

    // Navigation components
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: medicalColors.background.default,
          color: medicalColors.text.primary,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderBottom: `1px solid ${medicalColors.border.light}`,
        },
      },
    },

    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '64px !important',
          padding: '0 24px',
        },
      },
    },

    // Paper components for panels and dialogs
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
        elevation2: {
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        },
        elevation3: {
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        },
      },
    },

    // List components for filters and results
    MuiList: {
      styleOverrides: {
        root: {
          padding: 0,
        },
      },
    },

    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          margin: '2px 0',
          '&:hover': {
            backgroundColor: alpha(medicalColors.primary.main, 0.04),
          },
        },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          '&:hover': {
            backgroundColor: alpha(medicalColors.primary.main, 0.04),
          },
        },
      },
    },

    // Drawer components for sidebars
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: `1px solid ${medicalColors.border.light}`,
          backgroundColor: medicalColors.background.surface,
        },
      },
    },

    // Dialog components
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        },
      },
    },

    // Skeleton components for loading states
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(medicalColors.border.light, 0.6),
        },
      },
    },

    // Progress components
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: alpha(medicalColors.primary.main, 0.1),
        },
        bar: {
          borderRadius: 4,
        },
      },
    },

    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: medicalColors.primary.main,
        },
      },
    },
  },
});

// Export color constants for use in styled components
export const colors = medicalColors;

// Custom theme extensions for medical-specific styling
declare module '@mui/material/styles' {
  interface Palette {
    border: {
      light: string;
      main: string;
      dark: string;
    };
    status: {
      recruiting: string;
      notYetRecruiting: string;
      completed: string;
      suspended: string;
      active: string;
    };
    medical: {
      phase1: string;
      phase2: string;
      phase3: string;
      phase4: string;
      observational: string;
    };
  }

  interface PaletteOptions {
    border?: {
      light?: string;
      main?: string;
      dark?: string;
    };
    status?: {
      recruiting?: string;
      notYetRecruiting?: string;
      completed?: string;
      suspended?: string;
      active?: string;
    };
    medical?: {
      phase1?: string;
      phase2?: string;
      phase3?: string;
      phase4?: string;
      observational?: string;
    };
  }


}

// Create the final theme with custom extensions
export const theme = createTheme({
  ...baseTheme,
  palette: {
    ...baseTheme.palette,
    border: medicalColors.border,
    status: medicalColors.status,
    medical: medicalColors.medical,
  },
});

export default theme;
