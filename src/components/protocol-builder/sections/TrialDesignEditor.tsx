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
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Study Design Type *</InputLabel>
                <Select
                  value={designData.studyDesignType}
                  onChange={(e) => setDesignData({ ...designData, studyDesignType: e.target.value })}
                  label="Study Design Type *"
                >
                  <MenuItem value="Parallel">Parallel Group</MenuItem>
                  <MenuItem value="Crossover">Crossover</MenuItem>
                  <MenuItem value="Factorial">Factorial</MenuItem>
                  <MenuItem value="Adaptive">Adaptive</MenuItem>
                  <MenuItem value="Sequential">Sequential</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Control Type *</InputLabel>
                <Select
                  value={designData.controlType}
                  onChange={(e) => setDesignData({ ...designData, controlType: e.target.value })}
                  label="Control Type *"
                >
                  <MenuItem value="Placebo">Placebo Controlled</MenuItem>
                  <MenuItem value="Active">Active Controlled</MenuItem>
                  <MenuItem value="Dose">Dose Comparison</MenuItem>
                  <MenuItem value="Uncontrolled">Uncontrolled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Allocation Strategy *</InputLabel>
                <Select
                  value={designData.allocationStrategy}
                  onChange={(e) => setDesignData({ ...designData, allocationStrategy: e.target.value })}
                  label="Allocation Strategy *"
                >
                  <MenuItem value="Randomized">Randomized</MenuItem>
                  <MenuItem value="Non-Randomized">Non-Randomized</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Blinding Level *</InputLabel>
                <Select
                  value={designData.blindingLevel}
                  onChange={(e) => setDesignData({ ...designData, blindingLevel: e.target.value })}
                  label="Blinding Level *"
                >
                  <MenuItem value="Open-Label">Open-Label</MenuItem>
                  <MenuItem value="Single-Blind">Single-Blind</MenuItem>
                  <MenuItem value="Double-Blind">Double-Blind</MenuItem>
                  <MenuItem value="Triple-Blind">Triple-Blind</MenuItem>
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
                <Grid item xs={12} md={6}>
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
                <Grid item xs={12} md={6}>
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
                  <Grid item xs={12} md={6} key={index}>
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