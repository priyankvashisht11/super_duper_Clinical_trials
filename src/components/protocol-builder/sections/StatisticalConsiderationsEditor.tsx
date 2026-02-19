import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, TextField,
  Button, Tabs, Tab, Divider
} from '@mui/material';
import {
  Calculate as StatsIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useProtocol } from '../../../contexts/ProtocolContext';
import { SectionHeader, SectionCompletionAlert } from '../index';
import { useValidation } from '../../../hooks/useValidation';
import { colors } from '../../../styles/theme';
import { AISampleSizeAgent } from '../../ai/AISampleSizeAgent';

const GradientButton = styled(Button)(() => ({
  background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 600,
  '&:hover': {
    background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.secondary.dark} 100%)`,
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`stats-tabpanel-${index}`}
      aria-labelledby={`stats-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export const StatisticalConsiderationsEditor: React.FC = () => {
  const { protocol, refreshProtocol } = useProtocol();
  const { validateProtocol, getLatestValidation } = useValidation();
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [sectionValidation, setSectionValidation] = useState<any>(null);
  const [showCompletionAlert, setShowCompletionAlert] = useState(false);
  const [lastCompletionScore, setLastCompletionScore] = useState(0);
  const [currentTab, setCurrentTab] = useState(0);
  
  const [statsData, setStatsData] = useState({
    // Sample Size
    totalSampleSize: '',
    sampleSizePerArm: '',
    expectedDropoutRate: '',
    sampleSizeJustification: '',
    
    // Power Analysis
    powerAnalysis: '',
    statisticalPower: '',
    significanceLevel: '',
    effectSize: '',
    
    // Analysis Sets
    analysisSets: '',
    primaryAnalysisSet: '',
    sensitivityAnalyses: '',
    
    // Statistical Methods
    primaryEndpointMethod: '',
    secondaryEndpointMethods: '',
    handlingOfMissingData: '',
    interimAnalyses: '',
    
    // Endpoints
    primaryEndpoint: '',
    secondaryEndpoints: ''
  });

  useEffect(() => {
    if (protocol?.sections) {
      const section = protocol.sections.find((s: any) => s.sectionNumber === '10');
      if (section?.content) {
        setStatsData({ ...statsData, ...section.content });
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
    if (report?.sectionStatus?.['10']) {
      setSectionValidation(report.sectionStatus['10']);
    }
  };

  const handleValidateSection = async () => {
    if (!protocol?.id) return;
    
    setValidating(true);
    try {
      const report = await validateProtocol(protocol.id);
      if (report?.sectionStatus?.['10']) {
        const newValidation = report.sectionStatus['10'];
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
      const response = await fetch(`http://localhost:3001/api/protocols/sections/10`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocolId: protocol?.id,
          content: statsData
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

  const handleApplyCalculation = (calculation: any) => {
    setStatsData({
      ...statsData,
      totalSampleSize: calculation.totalSampleSize.toString(),
      sampleSizePerArm: calculation.sampleSizePerArm.toString(),
      expectedDropoutRate: (calculation.expectedDropoutRate * 100).toFixed(1),
      sampleSizeJustification: calculation.justification,
      powerAnalysis: calculation.powerAnalysis
    });
    
    // Auto-save after applying
    setTimeout(() => {
      handleSave();
    }, 500);
  };

  return (
    <Box>
      <SectionHeader
        sectionNumber="10"
        sectionTitle="Statistical Considerations"
        description="Sample size, analysis sets, statistical methods, and endpoints"
        icon={<StatsIcon />}
        validationStatus={sectionValidation}
        onValidate={handleValidateSection}
        validating={validating}
      />

      {showCompletionAlert && sectionValidation && (
        <SectionCompletionAlert
          sectionTitle="Statistical Considerations"
          sectionNumber="10"
          completionScore={sectionValidation.completionScore || 0}
          onDismiss={() => setShowCompletionAlert(false)}
        />
      )}

      {/* AI Sample Size Agent */}
      <Card sx={{ mb: 3, border: '3px solid red' }}>
        <CardContent>
          <Typography variant="h5" color="error" gutterBottom>
            🤖 AI Sample Size Agent - TEST
          </Typography>
          <Typography>
            If you can see this red box, the component location is correct but the actual agent has an issue.
          </Typography>
        </CardContent>
      </Card>

      {protocol && (
        <Box sx={{ mb: 3 }}>
          <AISampleSizeAgent
            protocolContext={{
              ...protocol,
              studyDesignType: protocol?.sections?.find((s: any) => s.sectionNumber === '4')?.content?.studyDesignType,
              numberOfArms: protocol?.sections?.find((s: any) => s.sectionNumber === '4')?.content?.numberOfArms,
              controlType: protocol?.sections?.find((s: any) => s.sectionNumber === '4')?.content?.controlType
            }}
            onApplyCalculation={handleApplyCalculation}
            initialData={statsData}
          />
        </Box>
      )}

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              mb: 2
            }}
          >
            <Tab label="Sample Size" />
            <Tab label="Analysis Sets" />
            <Tab label="Statistical Methods" />
            <Tab label="Endpoints" />
          </Tabs>

          {/* Sample Size Tab */}
          <TabPanel value={currentTab} index={0}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Sample Size Calculation
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Use the AI agent above to calculate sample size through conversation, or fill manually below.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Total Sample Size *"
                  type="number"
                  value={statsData.totalSampleSize}
                  onChange={(e) => setStatsData({ ...statsData, totalSampleSize: e.target.value })}
                  placeholder="e.g., 300"
                  helperText="Total number of participants"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Sample Size Per Arm *"
                  type="number"
                  value={statsData.sampleSizePerArm}
                  onChange={(e) => setStatsData({ ...statsData, sampleSizePerArm: e.target.value })}
                  placeholder="e.g., 150"
                  helperText="Participants per treatment arm"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Expected Dropout Rate (%)"
                  type="number"
                  value={statsData.expectedDropoutRate}
                  onChange={(e) => setStatsData({ ...statsData, expectedDropoutRate: e.target.value })}
                  placeholder="e.g., 15"
                  helperText="Anticipated dropout percentage"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Sample Size Justification *"
                  value={statsData.sampleSizeJustification}
                  onChange={(e) => setStatsData({ ...statsData, sampleSizeJustification: e.target.value })}
                  placeholder="Provide detailed justification for the sample size calculation, including assumptions, effect size, power, and significance level..."
                  helperText="Explain the rationale and calculations"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight={700} gutterBottom>
              Power Analysis
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Statistical Power"
                  value={statsData.statisticalPower}
                  onChange={(e) => setStatsData({ ...statsData, statisticalPower: e.target.value })}
                  placeholder="e.g., 80% or 0.80"
                  helperText="Typically 80% or 90%"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Significance Level (Alpha)"
                  value={statsData.significanceLevel}
                  onChange={(e) => setStatsData({ ...statsData, significanceLevel: e.target.value })}
                  placeholder="e.g., 0.05"
                  helperText="Typically 0.05 (two-sided)"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Effect Size"
                  value={statsData.effectSize}
                  onChange={(e) => setStatsData({ ...statsData, effectSize: e.target.value })}
                  placeholder="e.g., 0.5 or 10 mmHg"
                  helperText="Expected treatment effect"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Power Analysis Description"
                  value={statsData.powerAnalysis}
                  onChange={(e) => setStatsData({ ...statsData, powerAnalysis: e.target.value })}
                  placeholder="Describe the power analysis, including formulas used, assumptions, and sensitivity analyses..."
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Analysis Sets Tab */}
          <TabPanel value={currentTab} index={1}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Analysis Populations
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Analysis Sets Definition"
                  value={statsData.analysisSets}
                  onChange={(e) => setStatsData({ ...statsData, analysisSets: e.target.value })}
                  placeholder="Define ITT, PP, Safety Set, etc..."
                  helperText="Describe all analysis populations (ITT, Per-Protocol, Safety Set)"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Primary Analysis Set"
                  value={statsData.primaryAnalysisSet}
                  onChange={(e) => setStatsData({ ...statsData, primaryAnalysisSet: e.target.value })}
                  placeholder="e.g., Intention-to-Treat (ITT)"
                  helperText="Which population will be used for primary analysis"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Sensitivity Analyses"
                  value={statsData.sensitivityAnalyses}
                  onChange={(e) => setStatsData({ ...statsData, sensitivityAnalyses: e.target.value })}
                  placeholder="Describe planned sensitivity analyses..."
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Statistical Methods Tab */}
          <TabPanel value={currentTab} index={2}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Statistical Methods
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Primary Endpoint Analysis Method *"
                  value={statsData.primaryEndpointMethod}
                  onChange={(e) => setStatsData({ ...statsData, primaryEndpointMethod: e.target.value })}
                  placeholder="e.g., ANCOVA with baseline as covariate, stratified by site..."
                  helperText="Describe the statistical method for primary endpoint"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Secondary Endpoint Methods"
                  value={statsData.secondaryEndpointMethods}
                  onChange={(e) => setStatsData({ ...statsData, secondaryEndpointMethods: e.target.value })}
                  placeholder="Describe methods for each secondary endpoint..."
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Handling of Missing Data"
                  value={statsData.handlingOfMissingData}
                  onChange={(e) => setStatsData({ ...statsData, handlingOfMissingData: e.target.value })}
                  placeholder="e.g., Multiple imputation, LOCF, mixed models..."
                  helperText="Describe approach to missing data"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Interim Analyses"
                  value={statsData.interimAnalyses}
                  onChange={(e) => setStatsData({ ...statsData, interimAnalyses: e.target.value })}
                  placeholder="Describe any planned interim analyses and stopping rules..."
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Endpoints Tab */}
          <TabPanel value={currentTab} index={3}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Study Endpoints
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Primary Endpoint *"
                  value={statsData.primaryEndpoint}
                  onChange={(e) => setStatsData({ ...statsData, primaryEndpoint: e.target.value })}
                  placeholder="Define the primary endpoint clearly, including measurement method and timepoint..."
                  helperText="The main outcome measure for the study"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Secondary Endpoints"
                  value={statsData.secondaryEndpoints}
                  onChange={(e) => setStatsData({ ...statsData, secondaryEndpoints: e.target.value })}
                  placeholder="List all secondary endpoints with measurement methods and timepoints..."
                  helperText="Additional outcome measures"
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Save Button */}
          <Box display="flex" justifyContent="flex-end" mt={3}>
            <GradientButton
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Statistical Considerations'}
            </GradientButton>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
