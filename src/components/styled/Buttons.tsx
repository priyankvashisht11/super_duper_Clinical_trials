import { styled } from '@mui/material/styles';
import { Button, IconButton, Fab } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { colors } from '../../styles/theme';

// Primary action buttons
export const PrimaryButton = styled(Button)(() => ({
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 500,
  padding: '10px 20px',
  minHeight: 40,
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  
  '&:hover': {
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    transform: 'translateY(-1px)',
  },
  
  '&:active': {
    transform: 'translateY(0)',
  },
}));

// Secondary action buttons
export const SecondaryButton = styled(Button)(() => ({
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 500,
  padding: '10px 20px',
  minHeight: 40,
  borderWidth: 1.5,
  
  '&:hover': {
    borderWidth: 1.5,
    backgroundColor: alpha(colors.primary.main, 0.04),
  },
}));

// Ghost/text buttons
export const GhostButton = styled(Button)(() => ({
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 500,
  padding: '8px 16px',
  minHeight: 36,
  
  '&:hover': {
    backgroundColor: alpha(colors.primary.main, 0.04),
  },
}));

// Search button with special styling
export const SearchButton = styled(PrimaryButton)(({ theme }) => ({
  borderRadius: '0 28px 28px 0',
  minWidth: 120,
  height: 56,
  
  [theme.breakpoints.down('sm')]: {
    minWidth: 80,
    height: 48,
    borderRadius: '0 24px 24px 0',
  },
}));

// Voice input button
export const VoiceButton = styled(IconButton)(() => ({
  width: 48,
  height: 48,
  backgroundColor: alpha(colors.primary.main, 0.1),
  color: colors.primary.main,
  
  '&:hover': {
    backgroundColor: alpha(colors.primary.main, 0.2),
  },
  
  '&.recording': {
    backgroundColor: colors.status.notYetRecruiting,
    color: 'white',
    animation: 'pulse 1.5s infinite',
  },
  
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
    },
    '50%': {
      transform: 'scale(1.1)',
    },
    '100%': {
      transform: 'scale(1)',
    },
  },
}));

// Filter toggle button
export const FilterToggleButton = styled(Button)(() => ({
  borderRadius: 20,
  textTransform: 'none',
  fontWeight: 500,
  padding: '6px 16px',
  minHeight: 32,
  fontSize: '0.8125rem',
  border: `1px solid ${colors.border.main}`,
  
  '&.active': {
    backgroundColor: colors.primary.main,
    color: 'white',
    borderColor: colors.primary.main,
  },
  
  '&:hover': {
    borderColor: colors.primary.main,
    backgroundColor: alpha(colors.primary.main, 0.04),
  },
}));

// Bookmark button
export const BookmarkButton = styled(IconButton)(() => ({
  width: 36,
  height: 36,
  color: colors.text.disabled,
  
  '&:hover': {
    color: colors.status.active,
    backgroundColor: alpha(colors.status.active, 0.1),
  },
  
  '&.bookmarked': {
    color: colors.status.active,
  },
}));

// Generate document button
export const GenerateButton = styled(PrimaryButton)(() => ({
  background: `linear-gradient(45deg, ${colors.primary.main} 30%, ${colors.secondary.main} 90%)`,
  color: 'white',
  fontWeight: 600,
  
  '&:hover': {
    background: `linear-gradient(45deg, ${colors.primary.dark} 30%, ${colors.secondary.dark} 90%)`,
  },
  
  '&:disabled': {
    background: colors.text.disabled,
    color: 'white',
  },
}));

// Export button
export const ExportButton = styled(SecondaryButton)(() => ({
  borderColor: colors.secondary.main,
  color: colors.secondary.main,
  
  '&:hover': {
    borderColor: colors.secondary.main,
    backgroundColor: alpha(colors.secondary.main, 0.04),
  },
}));

// Floating action button for mobile
export const FloatingActionButton = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: 24,
  right: 24,
  backgroundColor: colors.primary.main,
  color: 'white',
  
  '&:hover': {
    backgroundColor: colors.primary.dark,
  },
  
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}));

// Chip-style button
export const ChipButton = styled(Button)(() => ({
  borderRadius: 16,
  textTransform: 'none',
  fontWeight: 500,
  padding: '4px 12px',
  minHeight: 28,
  fontSize: '0.8125rem',
  border: `1px solid ${colors.border.main}`,
  
  '&:hover': {
    backgroundColor: alpha(colors.primary.main, 0.04),
    borderColor: colors.primary.main,
  },
  
  '&.selected': {
    backgroundColor: colors.primary.main,
    color: 'white',
    borderColor: colors.primary.main,
  },
}));

// Loading button with spinner
export const LoadingButton = styled(PrimaryButton)<{ loading?: boolean }>(({ loading }) => ({
  position: 'relative',
  
  ...(loading && {
    color: 'transparent',
    
    '&::after': {
      content: '""',
      position: 'absolute',
      width: 16,
      height: 16,
      top: '50%',
      left: '50%',
      marginLeft: -8,
      marginTop: -8,
      border: '2px solid transparent',
      borderTop: '2px solid currentColor',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
  }),
  
  '@keyframes spin': {
    '0%': {
      transform: 'rotate(0deg)',
    },
    '100%': {
      transform: 'rotate(360deg)',
    },
  },
}));

// Button group for related actions
export const ButtonGroup = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: 8,
  
  '& > button': {
    flex: 1,
  },
  
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
}));