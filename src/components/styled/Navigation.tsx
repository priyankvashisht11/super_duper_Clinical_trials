import { styled } from '@mui/material/styles';
import { AppBar, Toolbar, Drawer, List, ListItem, ListItemButton, Breadcrumbs } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { colors } from '../../styles/theme';

// Main navigation bar
export const MainAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: colors.background.default,
  color: colors.text.primary,
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  borderBottom: `1px solid ${colors.border.light}`,
  position: 'sticky',
  top: 0,
  zIndex: theme.zIndex.appBar,
}));

export const MainToolbar = styled(Toolbar)(({ theme }) => ({
  minHeight: '64px !important',
  padding: '0 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  
  [theme.breakpoints.down('md')]: {
    padding: '0 16px',
  },
}));

// Logo container
export const LogoContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  
  '& .logo-text': {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: colors.primary.main,
    textDecoration: 'none',
    letterSpacing: '-0.5px',
    background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  
  '& .logo-icon': {
    width: 40,
    height: 40,
    color: colors.primary.main,
  },
}));

// Navigation menu
export const NavMenu = styled('nav')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

export const NavMenuItem = styled('a')(({ theme }) => ({
  padding: '8px 16px',
  borderRadius: 6,
  textDecoration: 'none',
  color: colors.text.primary,
  fontSize: '0.9375rem',
  fontWeight: 500,
  transition: 'all 0.2s ease-in-out',
  
  '&:hover': {
    backgroundColor: alpha(colors.primary.main, 0.04),
    color: colors.primary.main,
  },
  
  '&.active': {
    backgroundColor: alpha(colors.primary.main, 0.08),
    color: colors.primary.main,
  },
}));

// User menu
export const UserMenu = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

// Mobile drawer
export const MobileDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 280,
    backgroundColor: colors.background.default,
    borderRight: `1px solid ${colors.border.light}`,
  },
}));

export const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 3),
  borderBottom: `1px solid ${colors.border.light}`,
  minHeight: 64,
}));

export const DrawerContent = styled('div')(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2, 0),
}));

// Sidebar navigation
export const SidebarNav = styled(List)(({ theme }) => ({
  padding: 0,
  
  '& .nav-section': {
    padding: theme.spacing(2, 3, 1),
    
    '& .section-title': {
      fontSize: '0.75rem',
      fontWeight: 600,
      color: colors.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
  },
}));

export const SidebarNavItem = styled(ListItem)(({ theme }) => ({
  padding: 0,
  margin: theme.spacing(0.5, 2),
}));

export const SidebarNavButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: 6,
  padding: theme.spacing(1, 2),
  minHeight: 40,
  
  '&:hover': {
    backgroundColor: alpha(colors.primary.main, 0.04),
  },
  
  '&.Mui-selected': {
    backgroundColor: alpha(colors.primary.main, 0.08),
    color: colors.primary.main,
    
    '&:hover': {
      backgroundColor: alpha(colors.primary.main, 0.12),
    },
    
    '& .MuiListItemIcon-root': {
      color: colors.primary.main,
    },
  },
  
  '& .MuiListItemIcon-root': {
    minWidth: 36,
    color: colors.text.secondary,
  },
  
  '& .MuiListItemText-primary': {
    fontSize: '0.9375rem',
    fontWeight: 500,
  },
}));

// Breadcrumb navigation
export const BreadcrumbNav = styled(Breadcrumbs)(({ theme }) => ({
  padding: theme.spacing(2, 0),
  
  '& .MuiBreadcrumbs-separator': {
    color: colors.text.disabled,
  },
  
  '& .breadcrumb-link': {
    color: colors.text.secondary,
    textDecoration: 'none',
    fontSize: '0.875rem',
    
    '&:hover': {
      color: colors.primary.main,
      textDecoration: 'underline',
    },
  },
  
  '& .breadcrumb-current': {
    color: colors.text.primary,
    fontSize: '0.875rem',
    fontWeight: 500,
  },
}));

// Tab navigation
export const TabNav = styled('div')(({ theme }) => ({
  display: 'flex',
  borderBottom: `1px solid ${colors.border.light}`,
  marginBottom: theme.spacing(3),
}));

export const TabButton = styled('button')<{ active?: boolean }>(({ theme, active = false }) => ({
  padding: '12px 24px',
  border: 'none',
  backgroundColor: 'transparent',
  color: active ? colors.primary.main : colors.text.secondary,
  fontSize: '0.9375rem',
  fontWeight: 500,
  cursor: 'pointer',
  borderBottom: `2px solid ${active ? colors.primary.main : 'transparent'}`,
  transition: 'all 0.2s ease-in-out',
  
  '&:hover': {
    color: colors.primary.main,
    backgroundColor: alpha(colors.primary.main, 0.02),
  },
  
  [theme.breakpoints.down('sm')]: {
    padding: '8px 16px',
    fontSize: '0.875rem',
  },
}));

// Pagination navigation
export const PaginationNav = styled('nav')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(3, 0),
}));

export const PaginationButton = styled('button')<{ active?: boolean; disabled?: boolean }>(({ theme, active = false, disabled = false }) => ({
  minWidth: 40,
  height: 40,
  border: `1px solid ${colors.border.main}`,
  backgroundColor: active ? colors.primary.main : colors.background.default,
  color: active ? 'white' : colors.text.primary,
  borderRadius: 6,
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontSize: '0.875rem',
  fontWeight: 500,
  transition: 'all 0.2s ease-in-out',
  opacity: disabled ? 0.5 : 1,
  
  '&:hover:not(:disabled)': {
    backgroundColor: active ? colors.primary.dark : alpha(colors.primary.main, 0.04),
    borderColor: colors.primary.main,
  },
}));

// Filter navigation
export const FilterNav = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  padding: theme.spacing(2, 0),
  borderBottom: `1px solid ${colors.border.light}`,
  marginBottom: theme.spacing(2),
}));

export const FilterTag = styled('div')<{ removable?: boolean }>(({ theme, removable = false }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  padding: '4px 12px',
  backgroundColor: alpha(colors.primary.main, 0.1),
  color: colors.primary.dark,
  borderRadius: 16,
  fontSize: '0.8125rem',
  fontWeight: 500,
  
  ...(removable && {
    paddingRight: theme.spacing(0.5),
    
    '& .remove-button': {
      width: 16,
      height: 16,
      borderRadius: '50%',
      backgroundColor: alpha(colors.primary.main, 0.2),
      color: colors.primary.main,
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.75rem',
      
      '&:hover': {
        backgroundColor: alpha(colors.primary.main, 0.3),
      },
    },
  }),
}));

// Back button
export const BackButton = styled('button')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: '8px 16px',
  border: `1px solid ${colors.border.main}`,
  backgroundColor: colors.background.default,
  color: colors.text.primary,
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: 500,
  transition: 'all 0.2s ease-in-out',
  
  '&:hover': {
    backgroundColor: alpha(colors.primary.main, 0.04),
    borderColor: colors.primary.main,
    color: colors.primary.main,
  },
  
  '& .back-icon': {
    fontSize: '1rem',
  },
}));