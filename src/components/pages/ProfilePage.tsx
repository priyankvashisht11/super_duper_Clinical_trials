import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';

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

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    title: '',
    specialty: '',
    institution: '',
    licenseNumber: '',
    phone: '',
    country: 'India',
    state: '',
    city: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        title: user.title || '',
        specialty: user.specialty || '',
        institution: user.institution || '',
        licenseNumber: user.licenseNumber || '',
        phone: user.phone || '',
        country: user.country || 'India',
        state: user.state || '',
        city: user.city || '',
      });
    }
  }, [user]);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedUser = await authService.updateProfile(formData);
      updateUser(updatedUser);
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        title: user.title || '',
        specialty: user.specialty || '',
        institution: user.institution || '',
        licenseNumber: user.licenseNumber || '',
        phone: user.phone || '',
        country: user.country || 'India',
        state: user.state || '',
        city: user.city || '',
      });
    }
    setEditing(false);
    setError('');
  };

  const getInitials = () => {
    if (!user) return '';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">Please sign in to view your profile.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight={600}>
            My Profile
          </Typography>
          {!editing ? (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? <CircularProgress size={20} /> : 'Save'}
              </Button>
            </Box>
          )}
        </Box>

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

        {/* Profile Photo */}
        <Box display="flex" alignItems="center" gap={3} mb={4}>
          <Avatar
            src={user.profileImageUrl}
            sx={{
              width: 100,
              height: 100,
              bgcolor: 'primary.main',
              fontSize: '2rem',
              fontWeight: 600,
            }}
          >
            {getInitials()}
          </Avatar>
          <Box>
            <Typography variant="h6">
              {user.title} {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
            {user.specialty && (
              <Typography variant="body2" color="text.secondary">
                {user.specialty}
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Personal Information */}
        <Typography variant="h6" fontWeight={600} mb={2}>
          Personal Information
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              disabled={!editing}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              disabled={!editing}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              disabled={!editing}
            >
              {TITLES.map((title) => (
                <MenuItem key={title} value={title}>
                  {title}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              disabled={!editing}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Professional Information */}
        <Typography variant="h6" fontWeight={600} mb={2}>
          Professional Information
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Specialty"
              value={formData.specialty}
              onChange={(e) => handleChange('specialty', e.target.value)}
              disabled={!editing}
            >
              {SPECIALTIES.map((specialty) => (
                <MenuItem key={specialty} value={specialty}>
                  {specialty}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="License Number"
              value={formData.licenseNumber}
              onChange={(e) => handleChange('licenseNumber', e.target.value)}
              disabled={!editing}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Institution"
              value={formData.institution}
              onChange={(e) => handleChange('institution', e.target.value)}
              disabled={!editing}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Location */}
        <Typography variant="h6" fontWeight={600} mb={2}>
          Location
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Country"
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
              disabled={!editing}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="State"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              disabled={!editing}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="City"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              disabled={!editing}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Account Information */}
        <Typography variant="h6" fontWeight={600} mb={2}>
          Account Information
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              value={user.email}
              disabled
              helperText="Email cannot be changed"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Role"
              value={user.role}
              disabled
              helperText="Role is assigned by administrators"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email Verified"
              value={user.emailVerified ? 'Yes' : 'No'}
              disabled
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Member Since"
              value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              disabled
            />
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
