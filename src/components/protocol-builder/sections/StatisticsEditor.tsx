import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, TextField, Button,
  Tabs, Tab, Alert
} from '@mui/material';
import {
  BarChart as StatsIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useProtocol } from '../../../contexts/ProtocolContext';
import { SectionHeader, SectionCompletionAlert } from '../index';
import { RichTextEditor } from '../RichTextEditor';
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

export const StatisticsEditor: React.FC = () => {
  const { protocol, refreshProtocol } = useProtocol();
  const { validateProtocol, getLatestValidation } = useValidation();
  const [activeTab, setActiveTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [sectionValidation, setSectionValidation] = useState<any>(null);
  const [showCompletionAlert, setShowCompletionAlert] = useState(false);
  const [lastCompletionScore, setLastCompletionScore] = useState(0);
  
  const [statsData, setStatsData] = useState({
    // Sample Size
    totalSampleSize: '',
    sampleSizePerArm: '',
    sampleSizeJustification: '',
    powerAnalysis: '',
    dropoutRate: '',
    // Analysis Sets
    primaryAnalysisSet: '',
    safetyAnalysisSet: '',
    // Statistical Methods
    primaryAnalysisMethod: '',
    secondaryAnalysisMethod: '',
    interimAnalysis: '',
    // Endpoints
    primaryEndpoint: '',
    secondaryEndpoints: '',
    // Additional
    multipleTesting: '',
    missingDataHandling: '',
    // Data Management and Analysis
    dataManagementPlan: '',
    dataCollectionMethods: '',
    dataQualityAssurance: '',
    statisticalSoftware: '',
    dataMonitoring: ''
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
      {protocol && (
        <Box sx={{ mb: 3 }}>
          <AISampleSizeAgent
            protocolContext={{
              ...protocol,
              studyDesignType: protocol?.sections?.find((s: any) => s.sectionNumber === '4')?.content?.studyDesignType,
              numberOfArms: protocol?.sections?.find((s: any) => s.sectionNumber === '4')?.content?.numberOfArms,
              controlType: protocol?.sections?.find((s: any) => s.sectionNumber === '4')?.content?.controlType
            }}
            onApplyCalculation={(calculation: any) => {
              setStatsData({
                ...statsData,
                totalSampleSize: calculation.totalSampleSize.toString(),
                sampleSizePerArm: calculation.sampleSizePerArm.toString(),
                dropoutRate: (calculation.expectedDropoutRate * 100).toFixed(1) + '%',
                sampleSizeJustification: calculation.justification,
                powerAnalysis: calculation.powerAnalysis
              });
              setTimeout(() => handleSave(), 500);
            }}
            initialData={statsData}
          />
        </Box>
      )}

      <Card>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .Mui-selected': {
              color: `${colors.primary.main} !important`
            }
          }}
        >
          <Tab label="Sample Size" />
          <Tab label="Analysis Sets" />
          <Tab label="Statistical Methods" />
          <Tab label="Endpoints" />
          <Tab label="Data Management and Analysis" />
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          {/* Sample Size Tab */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Sample Size Calculation
              </Typography>
              <Grid container spacing={3} mb={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Total Sample Size *"
                    value={statsData.totalSampleSize}
                    onChange={(e) => setStatsData({ ...statsData, totalSampleSize: e.target.value })}
                    placeholder="e.g., 300"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Sample Size Per Arm"
                    value={statsData.sampleSizePerArm}
                    onChange={(e) => setStatsData({ ...statsData, sampleSizePerArm: e.target.value })}
                    placeholder="e.g., 150 per arm"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Expected Dropout Rate"
                    value={statsData.dropoutRate}
                    onChange={(e) => setStatsData({ ...statsData, dropoutRate: e.target.value })}
                    placeholder="e.g., 20%"
                  />
                </Grid>
              </Grid>

              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Sample Size Justification
              </Typography>
              <RichTextEditor
                value={statsData.sampleSizeJustification}
                onChange={(value) => setStatsData({ ...statsData, sampleSizeJustification: value })}
                onSave={handleSave}
                placeholder="Provide detailed justification for sample size..."
              />

              <Typography variant="subtitle2" fontWeight={600} gutterBottom mt={3}>
                Power Analysis
              </Typography>
              <RichTextEditor
                value={statsData.powerAnalysis}
                onChange={(value) => setStatsData({ ...statsData, powerAnalysis: value })}
                onSave={handleSave}
                placeholder="Describe power calculations (alpha, beta, effect size, assumptions)..."
              />
            </Box>
          )}

          {/* Analysis Sets Tab */}
          {activeTab === 1 && (
            <Box>
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3,
                  backgroundColor: '#e3f2fd',
                  border: '2px solid #2196f3',
                  '& .MuiAlert-icon': { color: '#1976d2' },
                  '& .MuiAlert-message': { 
                    color: '#0d47a1',
                    '& .MuiTypography-root': { color: '#0d47a1', fontWeight: 600 }
                  }
                }}
              >
                Define the analysis populations (ITT, PP, Safety Set, etc.)
              </Alert>

              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Primary Analysis Set
              </Typography>
              <RichTextEditor
                value={statsData.primaryAnalysisSet}
                onChange={(value) => setStatsData({ ...statsData, primaryAnalysisSet: value })}
                onSave={handleSave}
                placeholder="e.g., Intent-to-Treat (ITT) population includes..."
              />

              <Typography variant="subtitle2" fontWeight={600} gutterBottom mt={3}>
                Safety Analysis Set
              </Typography>
              <RichTextEditor
                value={statsData.safetyAnalysisSet}
                onChange={(value) => setStatsData({ ...statsData, safetyAnalysisSet: value })}
                onSave={handleSave}
                placeholder="e.g., All patients who received at least one dose..."
              />
            </Box>
          )}

          {/* Statistical Methods Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Primary Analysis Method
              </Typography>
              <RichTextEditor
                value={statsData.primaryAnalysisMethod}
                onChange={(value) => setStatsData({ ...statsData, primaryAnalysisMethod: value })}
                onSave={handleSave}
                placeholder="e.g., ANCOVA with baseline as covariate, treatment as factor..."
              />

              <Typography variant="subtitle2" fontWeight={600} gutterBottom mt={3}>
                Secondary Analysis Methods
              </Typography>
              <RichTextEditor
                value={statsData.secondaryAnalysisMethod}
                onChange={(value) => setStatsData({ ...statsData, secondaryAnalysisMethod: value })}
                onSave={handleSave}
                placeholder="Describe methods for secondary endpoints..."
              />

              <Typography variant="subtitle2" fontWeight={600} gutterBottom mt={3}>
                Interim Analysis Plan
              </Typography>
              <RichTextEditor
                value={statsData.interimAnalysis}
                onChange={(value) => setStatsData({ ...statsData, interimAnalysis: value })}
                onSave={handleSave}
                placeholder="Describe interim analysis timing, stopping rules, alpha spending..."
              />

              <Typography variant="subtitle2" fontWeight={600} gutterBottom mt={3}>
                Multiple Testing Procedures
              </Typography>
              <RichTextEditor
                value={statsData.multipleTesting}
                onChange={(value) => setStatsData({ ...statsData, multipleTesting: value })}
                onSave={handleSave}
                placeholder="e.g., Bonferroni correction, Hochberg procedure..."
              />

              <Typography variant="subtitle2" fontWeight={600} gutterBottom mt={3}>
                Missing Data Handling
              </Typography>
              <RichTextEditor
                value={statsData.missingDataHandling}
                onChange={(value) => setStatsData({ ...statsData, missingDataHandling: value })}
                onSave={handleSave}
                placeholder="Describe methods for handling missing data (e.g., LOCF, MI, MMR)..."
              />
            </Box>
          )}

          {/* Endpoints Tab */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Primary Endpoint
              </Typography>
              <RichTextEditor
                value={statsData.primaryEndpoint}
                onChange={(value) => setStatsData({ ...statsData, primaryEndpoint: value })}
                onSave={handleSave}
                placeholder="Define primary efficacy endpoint with measurement method and timing..."
              />

              <Typography variant="subtitle2" fontWeight={600} gutterBottom mt={3}>
                Secondary Endpoints
              </Typography>
              <RichTextEditor
                value={statsData.secondaryEndpoints}
                onChange={(value) => setStatsData({ ...statsData, secondaryEndpoints: value })}
                onSave={handleSave}
                placeholder="List and define all secondary endpoints..."
              />
            </Box>
          )}

          {/* Data Management and Analysis Tab */}
          {activeTab === 4 && (
            <Box>
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3,
                  backgroundColor: '#e3f2fd',
                  border: '2px solid #2196f3',
                  '& .MuiAlert-icon': { color: '#1976d2' },
                  '& .MuiAlert-message': { 
                    color: '#0d47a1',
                    '& .MuiTypography-root': { color: '#0d47a1', fontWeight: 600 }
                  }
                }}
              >
                Describe data management procedures, quality assurance, and analysis tools
              </Alert>

              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Data Management Plan
              </Typography>
              <RichTextEditor
                value={statsData.dataManagementPlan}
                onChange={(value) => setStatsData({ ...statsData, dataManagementPlan: value })}
                onSave={handleSave}
                placeholder="Describe overall data management strategy, responsibilities, and procedures..."
              />

              <Typography variant="subtitle2" fontWeight={600} gutterBottom mt={3}>
                Data Collection Methods
              </Typography>
              <RichTextEditor
                value={statsData.dataCollectionMethods}
                onChange={(value) => setStatsData({ ...statsData, dataCollectionMethods: value })}
                onSave={handleSave}
                placeholder="Describe how data will be collected (e.g., EDC system, paper CRFs, ePRO)..."
              />

              <Typography variant="subtitle2" fontWeight={600} gutterBottom mt={3}>
                Data Quality Assurance
              </Typography>
              <RichTextEditor
                value={statsData.dataQualityAssurance}
                onChange={(value) => setStatsData({ ...statsData, dataQualityAssurance: value })}
                onSave={handleSave}
                placeholder="Describe quality control procedures, data validation, query management..."
              />

              <Typography variant="subtitle2" fontWeight={600} gutterBottom mt={3}>
                Statistical Software
              </Typography>
              <RichTextEditor
                value={statsData.statisticalSoftware}
                onChange={(value) => setStatsData({ ...statsData, statisticalSoftware: value })}
                onSave={handleSave}
                placeholder="e.g., SAS version 9.4, R version 4.0, SPSS..."
              />

              <Typography variant="subtitle2" fontWeight={600} gutterBottom mt={3}>
                Data Monitoring Committee
              </Typography>
              <RichTextEditor
                value={statsData.dataMonitoring}
                onChange={(value) => setStatsData({ ...statsData, dataMonitoring: value })}
                onSave={handleSave}
                placeholder="Describe DMC composition, responsibilities, and meeting schedule..."
              />
            </Box>
          )}

          {/* Save Button */}
          <Box display="flex" justifyContent="flex-end" mt={3}>
            <GradientButton
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Statistics'}
            </GradientButton>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};