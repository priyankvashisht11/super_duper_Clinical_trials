import React, { useState, useEffect } from 'react';
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
  Avatar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Description as DocumentIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { MainAppBar, MainToolbar, LogoContainer, NavMenu, NavMenuItem, UserMenu } from '../styled/Navigation';
import clinicalIQLogo from '../../assets/clinical_iq_logo_concept_2.png';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from '../auth/AuthModal';
import { NotificationPanel } from '../auth/NotificationPanel';
import { UserProfileMenu } from '../auth/UserProfileMenu';
import notificationService from '../../services/notificationService';

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
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Modal and menu states
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [notificationAnchor, setNotificationAnchor] = useState<HTMLElement | null>(null);
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Check if a path is active
  const isActive = (path: string) => {
    if (path === '/search') {
      return location.pathname === '/search';
    }
    if (path === '/protocol-builder') {
      return location.pathname === '/protocol-builder';
    }
    if (path === '/protocols') {
      return location.pathname === '/protocols' || location.pathname.startsWith('/protocols/');
    }
    return location.pathname === path;
  };

  // Load unread notification count
  useEffect(() => {
    if (isAuthenticated) {
      loadUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchor(event.currentTarget);
  };

  const getInitials = () => {
    if (!user) return '';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  // Handle navigation clicks
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    navigate(path);
  };

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
            <img 
              src={clinicalIQLogo} 
              alt="Clinical IQ Logo" 
              style={{ 
                height: '48px', 
                width: 'auto',
                marginRight: '10px',
                verticalAlign: 'middle'
              }} 
            />
            <Typography
              variant="h5"
              component="a"
              href="/"
              onClick={(e) => handleNavClick(e, '/')}
              className="logo-text"
              sx={{ 
                textDecoration: 'none',
                fontSize: '1.5rem',
                fontWeight: 700,
                verticalAlign: 'middle',
                lineHeight: '48px',
                cursor: 'pointer'
              }}
            >
              Clinical IQ
            </Typography>
          </LogoContainer>
        </Box>

        {/* Center section: Navigation (Desktop only) */}
        {!isMobile && (
          <NavMenu>
            <NavMenuItem 
              href="/search" 
              className={isActive('/search') ? 'active' : ''}
              onClick={(e) => handleNavClick(e, '/search')}
            >
              Research Hub
            </NavMenuItem>
            <NavMenuItem 
              href="/documents" 
              className={isActive('/documents') ? 'active' : ''}
              onClick={(e) => handleNavClick(e, '/documents')}
            >
              My Documents
            </NavMenuItem>
            <NavMenuItem 
              href="/bookmarks" 
              className={isActive('/bookmarks') ? 'active' : ''}
              onClick={(e) => handleNavClick(e, '/bookmarks')}
            >
              Bookmarks
            </NavMenuItem>
            <NavMenuItem 
              href="/protocol-builder" 
              className={isActive('/protocol-builder') || isActive('/protocols') ? 'active' : ''}
              onClick={(e) => handleNavClick(e, '/protocol-builder')}
            >
              Protocol Builder
            </NavMenuItem>
            <NavMenuItem 
              href="/data-management" 
              className={isActive('/data-management') ? 'active' : ''}
              onClick={(e) => handleNavClick(e, '/data-management')}
            >
              Data Management and Analysis
            </NavMenuItem>
            <NavMenuItem 
              href="/about" 
              className={isActive('/about') ? 'active' : ''}
              onClick={(e) => handleNavClick(e, '/about')}
            >
              About
            </NavMenuItem>
          </NavMenu>
        )}

        {/* Right section: Actions + User menu */}
        <UserMenu>
          {!isMobile && (
            <>
              {isAuthenticated && (
                <>
                  <IconButton
                    color="inherit"
                    aria-label="notifications"
                    onClick={handleNotificationClick}
                  >
                    <Badge badgeContent={unreadCount} color="error">
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
            </>
          )}
          
          {isAuthenticated ? (
            <IconButton color="inherit" aria-label="account" onClick={handleProfileClick}>
              <Avatar
                src={user?.profileImageUrl}
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'primary.main',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                {getInitials()}
              </Avatar>
            </IconButton>
          ) : (
            !isMobile && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => setAuthModalOpen(true)}
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
            )
          )}
        </UserMenu>
      </MainToolbar>

      {/* Auth Modal */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Notification Panel */}
      {isAuthenticated && (
        <NotificationPanel
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={() => setNotificationAnchor(null)}
          onUnreadCountChange={setUnreadCount}
        />
      )}

      {/* User Profile Menu */}
      {isAuthenticated && (
        <UserProfileMenu
          anchorEl={profileAnchor}
          open={Boolean(profileAnchor)}
          onClose={() => setProfileAnchor(null)}
        />
      )}
    </MainAppBar>
  );
};