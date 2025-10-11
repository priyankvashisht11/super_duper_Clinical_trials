import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  useTheme,
  useMediaQuery,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Description as DocumentIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { MainAppBar, MainToolbar, LogoContainer, NavMenu, NavMenuItem, UserMenu } from '../styled/Navigation';

interface TopNavigationProps {
  onMenuClick: () => void;
  onDocumentPanelToggle: () => void;
  documentPanelOpen: boolean;
  showDocumentPanelToggle?: boolean;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  onMenuClick,
  onDocumentPanelToggle,
  documentPanelOpen,
  showDocumentPanelToggle = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <MainAppBar position="sticky" elevation={0}>
      <MainToolbar>
        {/* Left section: Menu + Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuClick}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
          
          <LogoContainer>
            <SearchIcon className="logo-icon" />
            <Typography
              variant="h6"
              component="a"
              href="/"
              className="logo-text"
              sx={{ textDecoration: 'none' }}
            >
              Clinical Trials
            </Typography>
          </LogoContainer>
        </Box>

        {/* Center section: Navigation (Desktop only) */}
        {!isMobile && (
          <NavMenu>
            <NavMenuItem href="/search" className="active">
              Search Trials
            </NavMenuItem>
            <NavMenuItem href="/documents">
              My Documents
            </NavMenuItem>
            <NavMenuItem href="/bookmarks">
              Bookmarks
            </NavMenuItem>
            <NavMenuItem href="/about">
              About
            </NavMenuItem>
          </NavMenu>
        )}

        {/* Right section: Actions + User menu */}
        <UserMenu>
          {!isMobile && (
            <>
              <IconButton color="inherit" aria-label="notifications">
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              
              {showDocumentPanelToggle && (
                <IconButton
                  color="inherit"
                  aria-label="toggle document panel"
                  onClick={onDocumentPanelToggle}
                  sx={{
                    backgroundColor: documentPanelOpen ? 'action.selected' : 'transparent',
                  }}
                >
                  {documentPanelOpen ? <CloseIcon /> : <DocumentIcon />}
                </IconButton>
              )}
            </>
          )}
          
          <IconButton color="inherit" aria-label="account">
            <AccountIcon />
          </IconButton>
          
          {!isMobile && (
            <Button
              variant="outlined"
              size="small"
              sx={{
                ml: 1,
                borderColor: 'text.secondary',
                color: 'text.primary',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'primary.light',
                },
              }}
            >
              Sign In
            </Button>
          )}
        </UserMenu>
      </MainToolbar>
    </MainAppBar>
  );
};