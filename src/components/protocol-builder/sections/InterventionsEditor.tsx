import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField, Select, MenuItem,
  FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Medication as MedicationIcon,
  Science as ScienceIcon
} from '@mui/icons-material';
import { useProtocol } from '../../../contexts/ProtocolContext';
import { useValidation } from '../../../hooks/useValidation';
import { colors } from '../../../styles/theme';

const StyledCard = styled(Card)(() => ({
  background: `linear-gradient(135deg, ${colors.primary.light}15 0%, ${colors.secondary.light}15 100%)`,
  border: `1px solid ${colors.primary.light}30`,
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
}));

const GradientButton = styled(Button)(() => ({
  background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
  borderRadius: 12,
  textTransform: 'none',
  fontWeight: 600,
  '&:hover': {
    background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.secondary.dark} 100%)`,
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
  },
}));

const InterventionCard = styled(Card)(() => ({
  borderRadius: 16,
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    transform: 'translateY(-4px)',
  },
}));

interface InterventionForm {
  id?: string;
  interventionType: string;
  productName: string;
  dose?: string;
  doseUnit?: string;
  dosageForm?: string;
  routeOfAdministration?: string;
  frequency?: string;
  duration?: string;
  rationale?: string;
}

export const InterventionsEditor: React.FC = () => {
  const { protocol, refreshProtocol } = useProtocol();
  const { validateProtocol } = useValidation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentIntervention, setCurrentIntervention] = useState<InterventionForm>({
    interventionType: 'investigational_product',
    productName: ''
  });
  const [saving, setSaving] = useState(false);

  const interventions = protocol?.interventions || [];

  const handleSaveIntervention = async () => {
    setSaving(true);
    try {
      const url = currentIntervention.id
        ? `http://localhost:3001/api/protocols/interventions/${currentIntervention.id}`
        : 'http://localhost:3001/api/protocols/interventions';
      const method = currentIntervention.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentIntervention,
          protocolId: protocol?.id
        })
      });

      if (!response.ok) throw new Error('Failed to save intervention');
      
      await refreshProtocol();
      setDialogOpen(false);
      setCurrentIntervention({
        interventionType: 'investigational_product',
        productName: ''
      });
      
      // AUTO-VALIDATE after save
      if (protocol?.id) {
        await validateProtocol(protocol.id);
      }
    } catch (error) {
      console.error('Failed to save intervention:', error);
      alert('Failed to save intervention. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteIntervention = async (id: string) => {
    if (!confirm('Delete this intervention?')) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/protocols/interventions/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete');
      
      await refreshProtocol();
      
      // AUTO-VALIDATE after delete
      if (protocol?.id) {
        await validateProtocol(protocol.id);
      }
    } catch (error) {
      console.error('Failed to delete intervention:', error);
    }
  };

  const getInterventionTypeColor = (type: string) => {
    switch (type) {
      case 'investigational_product': return colors.primary.main;
      case 'comparator': return colors.secondary.main;
      case 'placebo': return colors.text.secondary;
      default: return colors.text.disabled;
    }
  };

  const formatInterventionType = (type: string) => {
    return type.replace('_', ' ').toUpperCase();
  };

  return (
    <Box>
      {/* Header */}
      <StyledCard sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <MedicationIcon sx={{ fontSize: 40, color: colors.primary.main }} />
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Trial Interventions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Define investigational products, comparators, and placebos
              </Typography>
            </Box>
          </Box>
          
          <GradientButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Add Intervention
          </GradientButton>
        </CardContent>
      </StyledCard>

      {/* Interventions List */}
      {interventions.length === 0 ? (
        <Alert severity="info" icon={<ScienceIcon />}>
          No interventions defined yet. Click "Add Intervention" to define your first intervention.
        </Alert>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
          {interventions.map((intervention) => (
            <InterventionCard
              key={intervention.id}
              sx={{
                borderTop: `4px solid ${getInterventionTypeColor(intervention.interventionType)}`
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Typography variant="h6" fontWeight={700}>
                    {intervention.productName}
                  </Typography>
                  <Chip
                    label={formatInterventionType(intervention.interventionType)}
                    size="small"
                    sx={{
                      backgroundColor: `${getInterventionTypeColor(intervention.interventionType)}20`,
                      color: getInterventionTypeColor(intervention.interventionType),
                      fontWeight: 700
                    }}
                  />
                </Box>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                  {intervention.dose && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Dose
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {intervention.dose} {intervention.doseUnit}
                      </Typography>
                    </Box>
                  )}
                  {intervention.routeOfAdministration && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Route
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {intervention.routeOfAdministration}
                      </Typography>
                    </Box>
                  )}
                  {intervention.frequency && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Frequency
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {intervention.frequency}
                      </Typography>
                    </Box>
                  )}
                  {intervention.duration && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Duration
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {intervention.duration}
                      </Typography>
                    </Box>
                  )}
                </Box>
                
                {intervention.rationale && (
                  <Typography variant="body2" color="text.secondary" mt={2}>
                    {intervention.rationale}
                  </Typography>
                )}
                
                <Box display="flex" gap={1} mt={2}>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setCurrentIntervention(intervention);
                      setDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => intervention.id && handleDeleteIntervention(intervention.id)}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </InterventionCard>
          ))}
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentIntervention.id ? 'Edit Intervention' : 'Add New Intervention'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} pt={1}>
            <FormControl fullWidth>
              <InputLabel>Intervention Type *</InputLabel>
              <Select
                value={currentIntervention.interventionType}
                onChange={(e) => setCurrentIntervention({
                  ...currentIntervention,
                  interventionType: e.target.value
                })}
                label="Intervention Type *"
              >
                <MenuItem value="investigational_product">Investigational Product</MenuItem>
                <MenuItem value="comparator">Active Comparator</MenuItem>
                <MenuItem value="placebo">Placebo</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Product Name *"
              value={currentIntervention.productName}
              onChange={(e) => setCurrentIntervention({
                ...currentIntervention,
                productName: e.target.value
              })}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
              <TextField
                fullWidth
                label="Dose"
                value={currentIntervention.dose || ''}
                onChange={(e) => setCurrentIntervention({
                  ...currentIntervention,
                  dose: e.target.value
                })}
              />
              <TextField
                fullWidth
                label="Dose Unit"
                value={currentIntervention.doseUnit || ''}
                onChange={(e) => setCurrentIntervention({
                  ...currentIntervention,
                  doseUnit: e.target.value
                })}
                placeholder="mg, mL, IU, etc."
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Route of Administration</InputLabel>
                <Select
                  value={currentIntervention.routeOfAdministration || ''}
                  onChange={(e) => setCurrentIntervention({
                    ...currentIntervention,
                    routeOfAdministration: e.target.value
                  })}
                  label="Route of Administration"
                >
                  <MenuItem value="Oral">Oral</MenuItem>
                  <MenuItem value="Intravenous">Intravenous (IV)</MenuItem>
                  <MenuItem value="Intramuscular">Intramuscular (IM)</MenuItem>
                  <MenuItem value="Subcutaneous">Subcutaneous (SC)</MenuItem>
                  <MenuItem value="Topical">Topical</MenuItem>
                  <MenuItem value="Inhalation">Inhalation</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Frequency"
                value={currentIntervention.frequency || ''}
                onChange={(e) => setCurrentIntervention({
                  ...currentIntervention,
                  frequency: e.target.value
                })}
                placeholder="Once daily, BID, etc."
              />
            </Box>

            <TextField
              fullWidth
              label="Duration"
              value={currentIntervention.duration || ''}
              onChange={(e) => setCurrentIntervention({
                ...currentIntervention,
                duration: e.target.value
              })}
              placeholder="12 weeks, until progression, etc."
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Rationale"
              value={currentIntervention.rationale || ''}
              onChange={(e) => setCurrentIntervention({
                ...currentIntervention,
                rationale: e.target.value
              })}
              placeholder="Rationale for this intervention..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <GradientButton
            variant="contained"
            onClick={handleSaveIntervention}
            disabled={saving || !currentIntervention.productName}
          >
            {saving ? 'Saving...' : 'Save Intervention'}
          </GradientButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};