import { styled } from '@mui/material/styles';
import { Box, Container, Paper } from '@mui/material';
import { colors } from '../../styles/theme';

// Main layout containers
export const MainContainer = styled(Container)(({ theme }) => ({
  maxWidth: '1200px',
  padding: '0 16px',
  margin: '0 auto',
  
  [theme.breakpoints.down('md')]: {
    padding: '0 8px',
  },
}));

export const PageWrapper = styled(Box)(() => ({
  minHeight: '100vh',
  backgroundColor: colors.background.default,
  display: 'flex',
  flexDirection: 'column',
}));

export const ContentArea = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  gap: 24,
  padding: '24px 24px 0',
  minHeight: 'calc(100vh - 64px)', // Account for header height
  
  [theme.breakpoints.down('lg')]: {
    gap: 16,
    padding: '16px 16px 0',
  },
  
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    gap: 8,
    padding: '8px 8px 0',
  },
}));

// Three-column layout for desktop
export const FilterSidebar = styled(Paper)(({ theme }) => ({
  width: '280px',
  minHeight: 'calc(100vh - 88px)', // Account for header + padding
  backgroundColor: colors.background.surface,
  borderRadius: 12,
  border: `1px solid ${colors.border.light}`,
  overflow: 'auto',
  
  [theme.breakpoints.down('lg')]: {
    width: '240px',
  },
  
  [theme.breakpoints.down('md')]: {
    width: '100%',
    minHeight: 'auto',
    marginBottom: 16,
  },
}));

export const MainContent = styled(Box)(() => ({
  flex: 1,
  minHeight: 'calc(100vh - 88px)', // Account for header + padding
  display: 'flex',
  flexDirection: 'column',
  overflow: 'auto',
}));

export const DocumentPanel = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isOpen',
})<{ isOpen?: boolean }>(({ theme, isOpen = false }) => ({
  width: isOpen ? '400px' : '0px',
  minHeight: 'calc(100vh - 88px)', // Account for header + padding
  backgroundColor: colors.background.default,
  borderRadius: 12,
  border: `1px solid ${colors.border.light}`,
  transition: 'all 0.3s ease-in-out',
  overflow: 'hidden',
  
  [theme.breakpoints.down('lg')]: {
    width: isOpen ? '320px' : '0px',
  },
  
  [theme.breakpoints.down('md')]: {
    width: '100%',
    minHeight: 'auto',
    marginTop: 16,
  },
}));

// Section containers
export const Section = styled(Box)(({ theme }) => ({
  marginBottom: 32,
  
  [theme.breakpoints.down('md')]: {
    marginBottom: 24,
  },
}));

export const SectionHeader = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 16,
  paddingBottom: 8,
  borderBottom: `1px solid ${colors.border.light}`,
}));

// Grid layouts
export const ResponsiveGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: 16,
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: 8,
  },
}));

export const TwoColumnGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 24,
  
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: 16,
  },
}));

// Flex utilities
export const FlexRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
});

export const FlexColumn = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
});

export const FlexBetween = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const FlexCenter = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

// Spacing utilities
export const Spacer = styled(Box)<{ size?: number }>(({ size = 16 }) => ({
  height: size,
  width: '100%',
}));

export const VerticalSpacer = styled(Box)<{ size?: number }>(({ size = 16 }) => ({
  width: size,
  height: '100%',
}));