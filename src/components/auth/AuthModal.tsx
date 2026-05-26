import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Box,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: 'signin' | 'signup';
}

const TITLES = ['Dr.', 'Prof.', 'Mr.', 'Ms.', 'Mrs.'];
const SPECIALTIES = [
  'Cardiology',
  'Oncology',
  'Neurology',
  'Pediatrics',
  'Psychiatry',
  'Radiology',
  'Surgery',
  'Internal Medicine',
  'Emergency Medicine',
  'Anesthesiology',
  'Other',
];

export function AuthModal({ open, onClose, defaultTab = 'signin' }: AuthModalProps) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup'>(defaultTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sign In form
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  // Sign Up form
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    title: '',
    specialty: '',
    institution: '',
    licenseNumber: '',
    acceptTerms: false,
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: 'signin' | 'signup') => {
    setTab(newValue);
    setError('');
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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(signInData.email, signInData.password, signInData.rememberMe);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordErrors = validatePassword(signUpData.password);
    if (passwordErrors.length > 0) {
      setError(`Password must have: ${passwordErrors.join(', ')}`);
      return;
    }

    if (!signUpData.acceptTerms) {
      setError('You must accept the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      await register({
        email: signUpData.email,
        password: signUpData.password,
        firstName: signUpData.firstName,
        lastName: signUpData.lastName,
        ...(signUpData.title ? { title: signUpData.title } : {}),
        ...(signUpData.specialty ? { specialty: signUpData.specialty } : {}),
        ...(signUpData.institution ? { institution: signUpData.institution } : {}),
        ...(signUpData.licenseNumber ? { licenseNumber: signUpData.licenseNumber } : {}),
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight={600}>
            Welcome to NexTrial
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Tabs value={tab} onChange={handleTabChange} centered sx={{ mb: 3 }}>
          <Tab label="Sign In" value="signin" />
          <Tab label="Sign Up" value="signup" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Sign In Form */}
        {tab === 'signin' && (
          <Box component="form" onSubmit={handleSignIn}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={signInData.email}
              onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
              required
              margin="normal"
              autoComplete="email"
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={signInData.password}
              onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
              required
              margin="normal"
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={signInData.rememberMe}
                  onChange={(e) => setSignInData({ ...signInData, rememberMe: e.target.checked })}
                />
              }
              label="Remember me"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 2, mb: 2 }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            <Typography variant="body2" color="text.secondary" align="center">
              Forgot password?{' '}
              <Typography component="span" color="primary" sx={{ cursor: 'pointer' }}>
                Reset it
              </Typography>
            </Typography>
          </Box>
        )}

        {/* Sign Up Form */}
        {tab === 'signup' && (
          <Box component="form" onSubmit={handleSignUp}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={signUpData.email}
              onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
              required
              margin="normal"
              autoComplete="email"
            />

            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="First Name"
                value={signUpData.firstName}
                onChange={(e) => setSignUpData({ ...signUpData, firstName: e.target.value })}
                required
                margin="normal"
              />

              <TextField
                fullWidth
                label="Last Name"
                value={signUpData.lastName}
                onChange={(e) => setSignUpData({ ...signUpData, lastName: e.target.value })}
                required
                margin="normal"
              />
            </Box>

            <Box display="flex" gap={2}>
              <TextField
                select
                label="Title"
                value={signUpData.title}
                onChange={(e) => setSignUpData({ ...signUpData, title: e.target.value })}
                margin="normal"
                sx={{ minWidth: 120 }}
              >
                {TITLES.map((title) => (
                  <MenuItem key={title} value={title}>
                    {title}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                label="Specialty"
                value={signUpData.specialty}
                onChange={(e) => setSignUpData({ ...signUpData, specialty: e.target.value })}
                margin="normal"
              >
                {SPECIALTIES.map((specialty) => (
                  <MenuItem key={specialty} value={specialty}>
                    {specialty}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <TextField
              fullWidth
              label="Institution"
              value={signUpData.institution}
              onChange={(e) => setSignUpData({ ...signUpData, institution: e.target.value })}
              margin="normal"
            />

            <TextField
              fullWidth
              label="License Number (Optional)"
              value={signUpData.licenseNumber}
              onChange={(e) => setSignUpData({ ...signUpData, licenseNumber: e.target.value })}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={signUpData.password}
              onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
              required
              margin="normal"
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {signUpData.password && (
              <Box sx={{ mt: 1 }}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Password Strength
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {getPasswordStrength(signUpData.password).toFixed(0)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={getPasswordStrength(signUpData.password)}
                  color={
                    getPasswordStrength(signUpData.password) < 40
                      ? 'error'
                      : getPasswordStrength(signUpData.password) < 80
                      ? 'warning'
                      : 'success'
                  }
                />
              </Box>
            )}

            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={signUpData.confirmPassword}
              onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
              required
              margin="normal"
              autoComplete="new-password"
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

            <FormControlLabel
              control={
                <Checkbox
                  checked={signUpData.acceptTerms}
                  onChange={(e) => setSignUpData({ ...signUpData, acceptTerms: e.target.checked })}
                  required
                />
              }
              label={
                <Typography variant="body2">
                  I accept the{' '}
                  <Typography component="span" color="primary" sx={{ cursor: 'pointer' }}>
                    Terms and Conditions
                  </Typography>
                </Typography>
              }
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
