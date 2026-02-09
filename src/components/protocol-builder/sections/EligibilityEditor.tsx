import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField, Tabs, Tab,
  IconButton, Alert, Chip, Fade
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
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
  minWidth: 120,
  height: 'fit-content',
  '&:hover': {
    background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.secondary.dark} 100%)`,
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
  },
}));

const StyledTabs = styled(Tabs)(() => ({
  borderBottom: 1,
  borderColor: 'divider',
  '& .MuiTab-root': {
    fontWeight: 600,
    textTransform: 'none',
  },
  '& .Mui-selected': {
    color: `${colors.primary.main} !important`,
  },
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
    background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
  },
}));

const CriterionCard = styled(Card)(() => ({
  borderRadius: 12,
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transform: 'translateY(-2px)',
  },
}));

export const EligibilityEditor: React.FC = () => {
  const { protocol, refreshProtocol } = useProtocol();
  const { validateProtocol } = useValidation();
  const [activeTab, setActiveTab] = useState(0);
  const [newCriterion, setNewCriterion] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const criteria = protocol?.eligibilityCriteria || [];
  const inclusionCriteria = criteria.filter(c => c.criterionType === 'inclusion');
  const exclusionCriteria = criteria.filter(c => c.criterionType === 'exclusion');
  
  const currentType = activeTab === 0 ? 'inclusion' : 'exclusion';
  const currentCriteria = currentType === 'inclusion' ? inclusionCriteria : exclusionCriteria;

  const handleAddCriterion = async () => {
    if (!newCriterion.trim()) return;
    
    setSaving(true);
    try {
      const response = await fetch('http://localhost:3001/api/protocols/criteria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocolId: protocol?.id,
          criterionType: currentType,
          criterionText: newCriterion
        })
      });

      if (!response.ok) throw new Error('Failed to add criterion');
      
      await refreshProtocol();
      setNewCriterion('');
      
      // AUTO-VALIDATE after save
      if (protocol?.id) {
        await validateProtocol(protocol.id);
      }
    } catch (error) {
      console.error('Failed to add criterion:', error);
      alert('Failed to add criterion. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCriterion = async (id: string) => {
    if (!confirm('Delete this criterion?')) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/protocols/criteria/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete');
      
      await refreshProtocol();
      
      // AUTO-VALIDATE after delete
      if (protocol?.id) {
        await validateProtocol(protocol.id);
      }
    } catch (error) {
      console.error('Failed to delete criterion:', error);
    }
  };

  const handleUpdateCriterion = async (id: string, text: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/protocols/criteria/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ criterionText: text })
      });
      
      if (!response.ok) throw new Error('Failed to update');
      
      await refreshProtocol();
      setEditingId(null);
      
      // AUTO-VALIDATE after update
      if (protocol?.id) {
        await validateProtocol(protocol.id);
      }
    } catch (error) {
      console.error('Failed to update criterion:', error);
    }
  };

  return (
    <Box>
      {/* Header */}
      <StyledCard sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <PeopleIcon sx={{ fontSize: 40, color: colors.primary.main }} />
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
                Eligibility Criteria
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Define inclusion and exclusion criteria for participant selection
              </Typography>
            </Box>
          </Box>
          
          <Box display="flex" gap={3}>
            <Box>
              <Typography variant="h4" fontWeight={700} color={colors.semantic.success}>
                {inclusionCriteria.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Inclusion Criteria
              </Typography>
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={700} color={colors.semantic.error}>
                {exclusionCriteria.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Exclusion Criteria
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </StyledCard>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <StyledTabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
        >
          <Tab
            icon={<CheckCircleIcon />}
            iconPosition="start"
            label={`Inclusion Criteria (${inclusionCriteria.length})`}
          />
          <Tab
            icon={<CancelIcon />}
            iconPosition="start"
            label={`Exclusion Criteria (${exclusionCriteria.length})`}
          />
        </StyledTabs>
        
        <CardContent>
          {/* Add New Criterion */}
          <Box display="flex" gap={2} mb={3}>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder={`Enter new ${currentType} criterion...`}
              value={newCriterion}
              onChange={(e) => setNewCriterion(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleAddCriterion();
                }
              }}
            />
            <GradientButton
              variant="contained"
              onClick={handleAddCriterion}
              disabled={!newCriterion.trim() || saving}
            >
              <AddIcon sx={{ mr: 1 }} />
              Add
            </GradientButton>
          </Box>

          {/* Criteria List */}
          {currentCriteria.length === 0 ? (
            <Alert
              severity="info"
              icon={currentType === 'inclusion' ? <CheckCircleIcon /> : <CancelIcon />}
            >
              No {currentType} criteria defined yet. Add your first criterion above.
            </Alert>
          ) : (
            <Box display="flex" flexDirection="column" gap={2}>
              {currentCriteria.map((criterion) => (
                <Fade in key={criterion.id}>
                  <CriterionCard
                    variant="outlined"
                    sx={{
                      borderLeft: `4px solid ${
                        criterion.criterionType === 'inclusion'
                          ? colors.semantic.success
                          : colors.semantic.error
                      }`
                    }}
                  >
                    <CardContent>
                      <Box display="flex" gap={2} alignItems="start">
                        <Chip
                          label={criterion.criterionNumber}
                          size="small"
                          sx={{
                            backgroundColor: `${
                              criterion.criterionType === 'inclusion'
                                ? colors.semantic.success
                                : colors.semantic.error
                            }20`,
                            color:
                              criterion.criterionType === 'inclusion'
                                ? colors.semantic.success
                                : colors.semantic.error,
                            fontWeight: 700,
                            minWidth: 40
                          }}
                        />
                        
                        {editingId === criterion.id ? (
                          <TextField
                            fullWidth
                            multiline
                            defaultValue={criterion.criterionText}
                            onBlur={(e) => handleUpdateCriterion(criterion.id!, e.target.value)}
                            autoFocus
                          />
                        ) : (
                          <Typography flex={1} variant="body1">
                            {criterion.criterionText}
                          </Typography>
                        )}
                        
                        <Box display="flex" gap={1}>
                          <IconButton
                            size="small"
                            onClick={() => setEditingId(criterion.id!)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteCriterion(criterion.id!)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </CriterionCard>
                </Fade>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Helper Text */}
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2" fontWeight={600} gutterBottom>
          Tips for Writing Criteria:
        </Typography>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>Be specific and measurable</li>
          <li>Use objective criteria when possible</li>
          <li>Consider regulatory requirements</li>
          <li>Press Ctrl+Enter to quickly add criteria</li>
        </ul>
      </Alert>
    </Box>
  );
};