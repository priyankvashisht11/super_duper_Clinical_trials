import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, TextField, Select,
  MenuItem, FormControl, InputLabel, Button
} from '@mui/material';
import {
  AccountTree as DesignIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useProtocol } from '../../../contexts/ProtocolContext';
import { SectionHeader, SectionCompletionAlert } from '../index';
import { useValidation } from '../../../hooks/useValidation';
import { colors } from '../../../styles/theme';

const GradientButton = styled(Button)(() => ({
  background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 600,
  '&:hover': {
    background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.secondary.dark} 100%)`,
  },
}));

export const TrialDesignEditor: React.FC = () => {
  const { protocol, refreshProtocol } = useProtocol();
  const { validateProtocol, getLatestValidation } = useValidation();
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [sectionValidation, setSectionValidation] = useState<any>(null);
  const [showCompletionAlert, setShowCompletionAlert] = useState(false);
  const [lastCompletionScore, setLastCompletionScore] = useState(0);
  
  const [designData, setDesignData] = useState({
    studyDesignType: '',
    controlType: '',
    allocationStrategy: '',
    randomizationMethod: '',
    randomizationRatio: '',
    blindingLevel: '',
    trialDuration: '',
    numberOfArms: 2,
    armNames: ['Arm 1', 'Arm 2'],
    studyPhases: [] as string[],
    screeningPeriod: '',
    treatmentPeriod: '',
    followUpPeriod: ''
  });

  useEffect(() => {
    if (protocol?.sections) {
      const section = protocol.sections.find((s: any) => s.sectionNumber === '4');
      if (section?.content) {
        setDesignData({ ...designData, ...section.content });
      }
    }
  }, [protocol]);

  useEffect(() => {
    if (protocol?.id) {
      loadSectionValidation();
    }
  }, [protocol?.id]);

  const loadSectionValidation = async () => {
    if (!protocol?.id) return;
    
    const report = await getLatestValidation(protocol.id);
    if (report?.sectionStatus?.['4']) {
      setSectionValidation(report.sectionStatus['4']);
    }
  };

  const handleValidateSection = async () => {
    if (!protocol?.id) return;
    
    setValidating(true);
    try {
      const report = await validateProtocol(protocol.id);
      if (report?.sectionStatus?.['4']) {
        const newValidation = report.sectionStatus['4'];
        setSectionValidation(newValidation);
        
        if (newValidation.completionScore && newValidation.completionScore > lastCompletionScore + 10) {
          setShowCompletionAlert(true);
          setLastCompletionScore(newValidation.completionScore);
        }
      }
    } finally {
      setValidating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`http://localhost:3001/api/protocols/sections/4`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocolId: protocol?.id,
          content: designData
        })
      });

      if (response.ok) {
        await refreshProtocol();
        setTimeout(() => {
          handleValidateSection();
        }, 500);
      }
    } catch (error) {
      console.error('Error saving section:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleArmCountChange = (count: number) => {
    const newArmNames = Array(count).fill(null).map((_, i) => 
      designData.armNames[i] || `Arm ${i + 1}`
    );
    setDesignData({
      ...designData,
      numberOfArms: count,
      armNames: newArmNames
    });
  };

  return (
    <Box>
      <SectionHeader
        sectionNumber="4"
        sectionTitle="Trial Design"
        description="Study design, randomization, blinding, and trial structure"
        icon={<DesignIcon />}
        validationStatus={sectionValidation}
        onValidate={handleValidateSection}
        validating={validating}
      />

      {showCompletionAlert && sectionValidation && (
        <SectionCompletionAlert
          sectionTitle="Trial Design"
          sectionNumber="4"
          completionScore={sectionValidation.completionScore || 0}
          onDismiss={() => setShowCompletionAlert(false)}
        />
      )}

      <Card>
        <CardContent sx={{ p: 3 }}>
          {/* Design Overview */}
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Design Overview
          </Typography>
          
          {/* Visual Design Overview */}
          <Box sx={{ mb: 4, p: 4, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12}>
                <Card 
                  sx={{ 
                    minHeight: 160,
                    minWidth: 180,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    border: '2px solid #e0e0e0',
                    borderRadius: 3,
                    p: 2,
                    '&:hover': {
                      borderColor: colors.primary.main,
                      boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <CardContent sx={{ p: 3, width: '100%' }}>
                    <Typography variant="h3" fontWeight={700} color="text.secondary" sx={{ mb: 2 }}>
                      St.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', mb: 2 }}>
                      Study Design
                    </Typography>
                    <Typography 
                      variant="body2" 
                      fontWeight={600} 
                      sx={{ 
                        fontSize: '0.9rem',
                        color: designData.studyDesignType ? colors.primary.main : 'text.disabled',
                        minHeight: '2.5em',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {designData.studyDesignType || 'Not Selected'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card 
                  sx={{ 
                    minHeight: 160,
                    minWidth: 180,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    border: '2px solid #e0e0e0',
                    borderRadius: 3,
                    p: 2,
                    '&:hover': {
                      borderColor: colors.primary.main,
                      boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <CardContent sx={{ p: 3, width: '100%' }}>
                    <Typography variant="h3" fontWeight={700} color="text.secondary" sx={{ mb: 2 }}>
                      Cx.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', mb: 2 }}>
                      Control Type
                    </Typography>
                    <Typography 
                      variant="body2" 
                      fontWeight={600} 
                      sx={{ 
                        fontSize: '0.9rem',
                        color: designData.controlType ? colors.primary.main : 'text.disabled',
                        minHeight: '2.5em',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {designData.controlType || 'Not Selected'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card 
                  sx={{ 
                    minHeight: 160,
                    minWidth: 180,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    border: '2px solid #e0e0e0',
                    borderRadius: 3,
                    p: 2,
                    '&:hover': {
                      borderColor: colors.primary.main,
                      boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <CardContent sx={{ p: 3, width: '100%' }}>
                    <Typography variant="h3" fontWeight={700} color="text.secondary" sx={{ mb: 2 }}>
                      Ar.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', mb: 2 }}>
                      Allocation
                    </Typography>
                    <Typography 
                      variant="body2" 
                      fontWeight={600} 
                      sx={{ 
                        fontSize: '0.9rem',
                        color: designData.allocationStrategy ? colors.primary.main : 'text.disabled',
                        minHeight: '2.5em',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {designData.allocationStrategy || 'Not Selected'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card 
                  sx={{ 
                    minHeight: 160,
                    minWidth: 180,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    border: '2px solid #e0e0e0',
                    borderRadius: 3,
                    p: 2,
                    '&:hover': {
                      borderColor: colors.primary.main,
                      boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <CardContent sx={{ p: 3, width: '100%' }}>
                    <Typography variant="h3" fontWeight={700} color="text.secondary" sx={{ mb: 2 }}>
                      Br.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', mb: 2 }}>
                      Blinding Level
                    </Typography>
                    <Typography 
                      variant="body2" 
                      fontWeight={600} 
                      sx={{ 
                        fontSize: '0.9rem',
                        color: designData.blindingLevel ? colors.primary.main : 'text.disabled',
                        minHeight: '2.5em',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {designData.blindingLevel || 'Not Selected'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
          
          {/* Subtle connecting lines */}
          <Box sx={{ 
            position: 'relative',
            height: '40px',
            mb: 2,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '12.5%',
              right: '12.5%',
              height: '2px',
              background: `linear-gradient(90deg, transparent 0%, ${colors.primary.light} 20%, ${colors.primary.main} 50%, ${colors.primary.light} 80%, transparent 100%)`,
              opacity: 0.6
            }
          }}>
            {/* Connection dots */}
            <Box sx={{ 
              position: 'absolute',
              top: '50%',
              left: '12.5%',
              right: '12.5%',
              display: 'flex',
              justifyContent: 'space-between',
              transform: 'translateY(-50%)'
            }}>
              {[0, 1, 2, 3].map((index) => (
                <Box
                  key={index}
                  sx={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: colors.primary.main,
                    animation: `pulse-${index} 2s infinite`,
                    animationDelay: `${index * 0.2}s`,
                    boxShadow: `0 0 10px ${colors.primary.main}40`,
                    [`@keyframes pulse-${index}`]: {
                      '0%, 100%': {
                        transform: 'scale(1)',
                        opacity: 0.7
                      },
                      '50%': {
                        transform: 'scale(1.3)',
                        opacity: 1
                      }
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
          
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontSize: '1.1rem', fontWeight: 500 }}>Study Design Type *</InputLabel>
                <Select
                  value={designData.studyDesignType}
                  onChange={(e) => setDesignData({ ...designData, studyDesignType: e.target.value })}
                  label="Study Design Type *"
                  sx={{ 
                    height: '70px',
                    '& .MuiSelect-select': {
                      fontSize: '1.1rem',
                      padding: '20px 14px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center'
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderWidth: '2px'
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '1.1rem',
                      fontWeight: 500
                    }
                  }}
                >
                  <MenuItem value="Parallel" sx={{ fontSize: '1rem', padding: '12px 16px' }}>Parallel Group</MenuItem>
                  <MenuItem value="Crossover" sx={{ fontSize: '1rem', padding: '12px 16px' }}>Crossover</MenuItem>
                  <MenuItem value="Factorial" sx={{ fontSize: '1rem', padding: '12px 16px' }}>Factorial</MenuItem>
                  <MenuItem value="Adaptive" sx={{ fontSize: '1rem', padding: '12px 16px' }}>Adaptive</MenuItem>
                  <MenuItem value="Sequential" sx={{ fontSize: '1rem', padding: '12px 16px' }}>Sequential</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontSize: '1.1rem', fontWeight: 500 }}>Control Type *</InputLabel>
                <Select
                  value={designData.controlType}
                  onChange={(e) => setDesignData({ ...designData, controlType: e.target.value })}
                  label="Control Type *"
                  sx={{ 
                    height: '70px',
                    '& .MuiSelect-select': {
                      fontSize: '1.1rem',
                      padding: '20px 14px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center'
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderWidth: '2px'
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '1.1rem',
                      fontWeight: 500
                    }
                  }}
                >
                  <MenuItem value="Placebo" sx={{ fontSize: '1rem', padding: '12px 16px' }}>Placebo Controlled</MenuItem>
                  <MenuItem value="Active" sx={{ fontSize: '1rem', padding: '12px 16px' }}>Active Controlled</MenuItem>
                  <MenuItem value="Dose" sx={{ fontSize: '1rem', padding: '12px 16px' }}>Dose Comparison</MenuItem>
                  <MenuItem value="Uncontrolled" sx={{ fontSize: '1rem', padding: '12px 16px' }}>Uncontrolled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontSize: '1.1rem', fontWeight: 500 }}>Allocation Strategy *</InputLabel>
                <Select
                  value={designData.allocationStrategy}
                  onChange={(e) => setDesignData({ ...designData, allocationStrategy: e.target.value })}
                  label="Allocation Strategy *"
                  sx={{ 
                    height: '70px',
                    '& .MuiSelect-select': {
                      fontSize: '1.1rem',
                      padding: '20px 14px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center'
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderWidth: '2px'
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '1.1rem',
                      fontWeight: 500
                    }
                  }}
                >
                  <MenuItem value="Randomized" sx={{ fontSize: '1rem', padding: '12px 16px' }}>Randomized</MenuItem>
                  <MenuItem value="Non-Randomized" sx={{ fontSize: '1rem', padding: '12px 16px' }}>Non-Randomized</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontSize: '1.1rem', fontWeight: 500 }}>Blinding Level *</InputLabel>
                <Select
                  value={designData.blindingLevel}
                  onChange={(e) => setDesignData({ ...designData, blindingLevel: e.target.value })}
                  label="Blinding Level *"
                  sx={{ 
                    height: '70px',
                    '& .MuiSelect-select': {
                      fontSize: '1.1rem',
                      padding: '20px 14px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center'
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderWidth: '2px'
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: '1.1rem',
                      fontWeight: 500
                    }
                  }}
                >
                  <MenuItem value="Open-Label" sx={{ fontSize: '1rem', padding: '12px 16px' }}>Open-Label</MenuItem>
                  <MenuItem value="Single-Blind" sx={{ fontSize: '1rem', padding: '12px 16px' }}>Single-Blind</MenuItem>
                  <MenuItem value="Double-Blind" sx={{ fontSize: '1rem', padding: '12px 16px' }}>Double-Blind</MenuItem>
                  <MenuItem value="Triple-Blind" sx={{ fontSize: '1rem', padding: '12px 16px' }}>Triple-Blind</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Randomization Details */}
          {designData.allocationStrategy === 'Randomized' && (
            <>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Randomization Details
              </Typography>
              <Grid container spacing={3} mb={4}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Randomization Method</InputLabel>
                    <Select
                      value={designData.randomizationMethod}
                      onChange={(e) => setDesignData({ ...designData, randomizationMethod: e.target.value })}
                      label="Randomization Method"
                    >
                      <MenuItem value="Simple">Simple Randomization</MenuItem>
                      <MenuItem value="Block">Block Randomization</MenuItem>
                      <MenuItem value="Stratified">Stratified Randomization</MenuItem>
                      <MenuItem value="Adaptive">Adaptive Randomization</MenuItem>
                      <MenuItem value="IVRS">IVRS/IWRS</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Randomization Ratio"
                    value={designData.randomizationRatio}
                    onChange={(e) => setDesignData({ ...designData, randomizationRatio: e.target.value })}
                    placeholder="e.g., 1:1, 2:1, 1:1:1"
                    helperText="Enter ratio for treatment arms"
                  />
                </Grid>
              </Grid>
            </>
          )}

          {/* Trial Arms */}
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Trial Arms
          </Typography>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Number of Arms"
                value={designData.numberOfArms}
                onChange={(e) => handleArmCountChange(parseInt(e.target.value))}
                inputProps={{ min: 1, max: 10 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                {designData.armNames.map((armName, index) => (
                  <Grid item xs={12} key={index}>
                    <TextField
                      fullWidth
                      label={`Arm ${index + 1} Name`}
                      value={armName}
                      onChange={(e) => {
                        const newArmNames = [...designData.armNames];
                        newArmNames[index] = e.target.value;
                        setDesignData({ ...designData, armNames: newArmNames });
                      }}
                      placeholder={`e.g., Drug X 100mg, Placebo, Active Comparator`}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>

          {/* Study Duration */}
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Study Duration & Phases
          </Typography>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Screening Period"
                value={designData.screeningPeriod}
                onChange={(e) => setDesignData({ ...designData, screeningPeriod: e.target.value })}
                placeholder="e.g., 4 weeks"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Treatment Period"
                value={designData.treatmentPeriod}
                onChange={(e) => setDesignData({ ...designData, treatmentPeriod: e.target.value })}
                placeholder="e.g., 24 weeks"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Follow-up Period"
                value={designData.followUpPeriod}
                onChange={(e) => setDesignData({ ...designData, followUpPeriod: e.target.value })}
                placeholder="e.g., 12 weeks"
              />
            </Grid>
          </Grid>

          {/* Save Button */}
          <Box display="flex" justifyContent="flex-end">
            <GradientButton
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Design'}
            </GradientButton>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};


