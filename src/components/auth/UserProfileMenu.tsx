import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Box,
  Typography,
} from '@mui/material';
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  Description as DescriptionIcon,
  Bookmark as BookmarkIcon,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface UserProfileMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

export function UserProfileMenu({ anchorEl, open, onClose }: UserProfileMenuProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleMenuClick = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate('/');
  };

  if (!user) return null;

  const getInitials = () => {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  const getFullName = () => {
    const title = user.title ? `${user.title} ` : '';
    return `${title}${user.firstName} ${user.lastName}`;
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: {
          width: 280,
          mt: 1,
        },
      }}
    >
      {/* User Info Header */}
      <Box sx={{ px: 2, py: 2 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            {...(user.profileImageUrl ? { src: user.profileImageUrl } : {})}
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'primary.main',
              fontSize: '1.2rem',
              fontWeight: 600,
            }}
          >
            {getInitials()}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {getFullName()}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {user.email}
            </Typography>
            {user.specialty && (
              <Typography variant="caption" color="text.secondary">
                {user.specialty}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Menu Items */}
      <MenuItem onClick={() => handleMenuClick('/profile')}>
        <ListItemIcon>
          <PersonIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Profile</ListItemText>
      </MenuItem>

      <MenuItem onClick={() => handleMenuClick('/settings')}>
        <ListItemIcon>
          <SettingsIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Settings</ListItemText>
      </MenuItem>

      <MenuItem onClick={() => handleMenuClick('/protocols')}>
        <ListItemIcon>
          <DescriptionIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>My Protocols</ListItemText>
      </MenuItem>

      <MenuItem onClick={() => handleMenuClick('/bookmarks')}>
        <ListItemIcon>
          <BookmarkIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Bookmarks</ListItemText>
      </MenuItem>

      <MenuItem onClick={() => handleMenuClick('/preferences')}>
        <ListItemIcon>
          <NotificationsIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Preferences</ListItemText>
      </MenuItem>

      <MenuItem onClick={() => handleMenuClick('/help')}>
        <ListItemIcon>
          <HelpIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Help & Support</ListItemText>
      </MenuItem>

      <Divider />

      <MenuItem onClick={handleLogout}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Logout</ListItemText>
      </MenuItem>
    </Menu>
  );
}
