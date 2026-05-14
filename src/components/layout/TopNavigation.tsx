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
  alpha,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from '../auth/AuthModal';
import { NotificationPanel } from '../auth/NotificationPanel';
import { UserProfileMenu } from '../auth/UserProfileMenu';
import notificationService from '../../services/notificationService';

interface TopNavigationProps {
  onMenuClick?: () => void;
  onDocumentPanelToggle?: () => void;
  documentPanelOpen?: boolean;
  showDocumentPanelToggle?: boolean;
}

const NAV_LINKS = [
  { label: 'Dashboard',  path: '/dashboard'  },
  { label: 'Research',   path: '/research'   },
  { label: 'Regulatory', path: '/regulatory' },
  { label: 'Match',      path: '/match'      },
  { label: 'EDC',        path: '/edc'        },
  { label: 'Analysis',   path: '/analysis'   },
  { label: 'Documents',  path: '/documents'  },
  { label: 'About',      path: '/about'      },
];

export const TopNavigation: React.FC<TopNavigationProps> = ({
  onMenuClick,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [notificationAnchor, setNotificationAnchor] = useState<HTMLElement | null>(null);
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      try { setUnreadCount(await notificationService.getUnreadCount()); } catch {}
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const getInitials = () => {
    if (!user) return '';
    return `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid',
        borderColor: 'border.light',
        color: 'text.primary',
        zIndex: theme.zIndex.appBar,
      }}
    >
      <Toolbar sx={{ minHeight: '64px !important', px: { xs: 2, md: 3 } }}>
        {/* Logo */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', flexShrink: 0 }}
          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
        >
          {/* N icon mark */}
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0047AB 0%, #00897B 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '1rem', lineHeight: 1 }}>N</Typography>
          </Box>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: '1.25rem',
              letterSpacing: '-0.02em',
              color: '#0A1628',
              ml: 0.5,
            }}
          >
            NexTrial
          </Typography>
        </Box>

        {/* Desktop nav links */}
        {!isMobile && isAuthenticated && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 4, flex: 1 }}>
            {NAV_LINKS.map(({ label, path }) => (
              <Button
                key={path}
                onClick={() => navigate(path)}
                sx={{
                  color: isActive(path) ? 'primary.main' : 'text.secondary',
                  fontWeight: isActive(path) ? 600 : 400,
                  fontSize: '0.9rem',
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 2,
                  backgroundColor: isActive(path) ? alpha('#0047AB', 0.06) : 'transparent',
                  '&:hover': {
                    backgroundColor: alpha('#0047AB', 0.06),
                    color: 'primary.main',
                  },
                }}
              >
                {label}
              </Button>
            ))}
          </Box>
        )}

        <Box sx={{ flex: 1 }} />

        {/* Right side actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isAuthenticated ? (
            <>
              <IconButton size="small" onClick={(e) => setNotificationAnchor(e.currentTarget)}>
                <Badge badgeContent={unreadCount || undefined} color="error">
                  <NotificationsIcon sx={{ fontSize: '1.25rem' }} />
                </Badge>
              </IconButton>

              <IconButton size="small" onClick={(e) => setProfileAnchor(e.currentTarget)}>
                <Avatar
                  {...(user?.profileImageUrl ? { src: user.profileImageUrl } : {})}
                  sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.8rem', fontWeight: 700 }}
                >
                  {getInitials()}
                </Avatar>
              </IconButton>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="text"
                size="small"
                onClick={() => setAuthModalOpen(true)}
                sx={{ color: 'text.secondary', fontWeight: 500 }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => setAuthModalOpen(true)}
                sx={{
                  background: 'linear-gradient(135deg, #0047AB 0%, #00897B 100%)',
                  fontWeight: 600,
                  px: 2,
                  boxShadow: 'none',
                  '&:hover': { boxShadow: '0 4px 12px rgba(0,71,171,0.3)' },
                }}
              >
                Get Started
              </Button>
            </Box>
          )}

          {isMobile && onMenuClick && (
            <IconButton edge="end" onClick={onMenuClick}>
              <MenuIcon />
            </IconButton>
          )}
        </Box>
      </Toolbar>

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {isAuthenticated && (
        <>
          <NotificationPanel
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={() => setNotificationAnchor(null)}
            onUnreadCountChange={setUnreadCount}
          />
          <UserProfileMenu
            anchorEl={profileAnchor}
            open={Boolean(profileAnchor)}
            onClose={() => setProfileAnchor(null)}
          />
        </>
      )}
    </AppBar>
  );
};
