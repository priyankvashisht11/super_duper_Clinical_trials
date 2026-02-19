import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
  MenuItem,
  Tabs,
  Tab,
  InputAdornment,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export function SettingsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Password change state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    trialAlerts: true,
    protocolUpdates: true,
    weeklyDigest: true,
    theme: 'light',
    language: 'en',
    timezone: 'Asia/Kolkata',
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await authService.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('One number');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('One special character');
    return errors;
  };

  const getPasswordStrength = (password: string): number => {
    const errors = validatePassword(password);
    return ((5 - errors.length) / 5) * 100;
  };

  const handlePasswordChange = async () => {
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    const passwordErrors = validatePassword(passwordData.newPassword);
    if (passwordErrors.length > 0) {
      setError(`Password must have: ${passwordErrors.join(', ')}`);
      return;
    }

    setLoading(true);

    try {
      await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      setSuccess('Password changed successfully! All other sessions have been logged out.');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesChange = (field: string, value: any) => {
    setPreferences({ ...preferences, [field]: value });
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await authService.updatePreferences(preferences);
      setSuccess('Preferences saved successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">Please sign in to access settings.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" fontWeight={600} mb={3}>
          Settings
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)} sx={{ mb: 2 }}>
          <Tab label="Security" />
          <Tab label="Notifications" />
          <Tab label="Preferences" />
        </Tabs>

        {/* Security Tab */}
        <TabPanel value={tab} index={0}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Change Password
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Password"
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        edge="end"
                      >
                        {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="New Password"
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {passwordData.newPassword && (
                <Box sx={{ mt: 1 }}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Password Strength
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getPasswordStrength(passwordData.newPassword).toFixed(0)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={getPasswordStrength(passwordData.newPassword)}
                    color={
                      getPasswordStrength(passwordData.newPassword) < 40
                        ? 'error'
                        : getPasswordStrength(passwordData.newPassword) < 80
                        ? 'warning'
                        : 'success'
                    }
                  />
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                onClick={handlePasswordChange}
                disabled={
                  loading ||
                  !passwordData.currentPassword ||
                  !passwordData.newPassword ||
                  !passwordData.confirmPassword
                }
              >
                Change Password
              </Button>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" color="text.secondary">
            <strong>Note:</strong> Changing your password will log you out of all other devices
            and sessions for security reasons.
          </Typography>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={tab} index={1}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Notification Preferences
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.emailNotifications}
                    onChange={(e) =>
                      handlePreferencesChange('emailNotifications', e.target.checked)
                    }
                  />
                }
                label="Email Notifications"
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                Receive notifications via email
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.pushNotifications}
                    onChange={(e) =>
                      handlePreferencesChange('pushNotifications', e.target.checked)
                    }
                  />
                }
                label="Push Notifications"
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                Receive push notifications in the app
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.trialAlerts}
                    onChange={(e) => handlePreferencesChange('trialAlerts', e.target.checked)}
                  />
                }
                label="Trial Alerts"
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                Get notified about new clinical trials matching your interests
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.protocolUpdates}
                    onChange={(e) =>
                      handlePreferencesChange('protocolUpdates', e.target.checked)
                    }
                  />
                }
                label="Protocol Updates"
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                Receive updates about your protocols
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.weeklyDigest}
                    onChange={(e) => handlePreferencesChange('weeklyDigest', e.target.checked)}
                  />
                }
                label="Weekly Digest"
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                Receive a weekly summary of activity
              </Typography>
            </Grid>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                onClick={handleSavePreferences}
                disabled={loading}
              >
                Save Notification Preferences
              </Button>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Preferences Tab */}
        <TabPanel value={tab} index={2}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Application Preferences
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Theme"
                value={preferences.theme}
                onChange={(e) => handlePreferencesChange('theme', e.target.value)}
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
                <MenuItem value="auto">Auto</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Language"
                value={preferences.language}
                onChange={(e) => handlePreferencesChange('language', e.target.value)}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="hi">Hindi</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Timezone"
                value={preferences.timezone}
                onChange={(e) => handlePreferencesChange('timezone', e.target.value)}
              >
                <MenuItem value="Asia/Kolkata">Asia/Kolkata (IST)</MenuItem>
                <MenuItem value="America/New_York">America/New_York (EST)</MenuItem>
                <MenuItem value="Europe/London">Europe/London (GMT)</MenuItem>
                <MenuItem value="Asia/Tokyo">Asia/Tokyo (JST)</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                onClick={handleSavePreferences}
                disabled={loading}
              >
                Save Preferences
              </Button>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Container>
  );
}
