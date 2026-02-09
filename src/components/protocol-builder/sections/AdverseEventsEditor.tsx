import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Tabs, Tab, Alert, Grid,
  TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  Warning as WarningIcon,
  Report as ReportIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useProtocol } from '../../../contexts/ProtocolContext';
import { SectionHeader, SectionCompletionAlert } from '../index';
import { RichTextEditor } from '../RichTextEditor';
import { useValidation } from '../../../hooks/useValidation';
import { colors } from '../../../styles/theme';

export const AdverseEventsEditor: React.FC = () => {
  const { protocol, refreshProtocol } = useProtocol();
  const { validateProtocol, getLatestValidation } = useValidation();
  const [activeTab, setActiveTab] = useState(0);
  const [content, setContent] = useState({
    definitions: '',
    assessmentProcedures: '',
    reportingRequirements: '',
    followUpProcedures: '',
    reportingTimelines: {
      saeReporting: '24',
      regulatoryReporting: '15',
      irbReporting: '7'
    }
  });
  const [validating, setValidating] = useState(false);
  const [sectionValidation, setSectionValidation] = useState<any>(null);
  const [showCompletionAlert, setShowCompletionAlert] = useState(false);
  const [lastCompletionScore, setLastCompletionScore] = useState(0);

  useEffect(() => {
    if (protocol?.sections) {
      const section = protocol.sections.find((s: any) => s.sectionNumber === '9');
      if (section?.content) {
        setContent({ ...content, ...section.content });
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
    if (report?.sectionStatus?.['9']) {
      setSectionValidation(report.sectionStatus['9']);
    }
  };

  const handleValidateSection = async () => {
    if (!protocol?.id) return;
    
    setValidating(true);
    try {
      const report = await validateProtocol(protocol.id);
      if (report?.sectionStatus?.['9']) {
        setSectionValidation(report.sectionStatus['9']);
        
        // Check overall completeness score from report
        if (report?.completenessScore && report.completenessScore > lastCompletionScore + 10) {
          setShowCompletionAlert(true);
          setLastCompletionScore(report.completenessScore);
        }
      }
    } finally {
      setValidating(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/protocols/sections/9`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocolId: protocol?.id,
          content
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
    }
  };

  const tabs = [
    { label: 'Definitions', icon: <AssessmentIcon />, key: 'definitions' },
    { label: 'Assessment', icon: <WarningIcon />, key: 'assessment' },
    { label: 'Reporting', icon: <ReportIcon />, key: 'reporting' },
    { label: 'Follow-up', icon: <TimelineIcon />, key: 'followup' }
  ];

  return (
    <Box>
      <SectionHeader
        sectionNumber="9"
        sectionTitle="Adverse Events"
        description="Safety monitoring, adverse event definitions, and reporting procedures"
        icon={<WarningIcon />}
        validationStatus={sectionValidation}
        onValidate={handleValidateSection}
        validating={validating}
      />

      {showCompletionAlert && (
        <SectionCompletionAlert
          sectionTitle="Adverse Events"
          sectionNumber="9"
          completionScore={lastCompletionScore}
          onDismiss={() => setShowCompletionAlert(false)}
        />
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
          {tabs.map((tab) => (
            <Tab
              key={tab.key}
              icon={tab.icon}
              iconPosition="start"
              label={tab.label}
            />
          ))}
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          {/* Definitions */}
          {activeTab === 0 && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Section 9.1: Adverse Event and Serious Adverse Event Definitions
                </Typography>
                <Typography variant="body2">
                  Define adverse events (AE), serious adverse events (SAE), and 
                  suspected unexpected serious adverse reactions (SUSAR) according to ICH-GCP.
                </Typography>
              </Alert>
              <RichTextEditor
                value={content.definitions}
                onChange={(value) => setContent({ ...content, definitions: value })}
                onSave={handleSave}
                placeholder="Define AE, SAE, and SUSAR according to ICH-GCP guidelines..."
                autoSave={true}
                minRows={8}
              />
            </Box>
          )}

          {/* Assessment Procedures */}
          {activeTab === 1 && (
            <Box>
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Section 9.2: Assessment and Documentation Procedures
                </Typography>
                <Typography variant="body2">
                  Describe procedures for assessing, documenting, and grading adverse events,
                  including causality assessment and severity grading scales.
                </Typography>
              </Alert>
              <RichTextEditor
                value={content.assessmentProcedures}
                onChange={(value) => setContent({ ...content, assessmentProcedures: value })}
                onSave={handleSave}
                placeholder="Describe AE assessment procedures, grading scales (CTCAE), causality assessment..."
                autoSave={true}
                minRows={8}
              />
            </Box>
          )}

          {/* Reporting Requirements */}
          {activeTab === 2 && (
            <Box>
              <Alert severity="error" sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Section 9.3: Reporting Requirements and Timelines
                </Typography>
                <Typography variant="body2">
                  Define reporting requirements to sponsor, regulatory authorities, and IRB/EC,
                  including specific timelines for different types of events.
                </Typography>
              </Alert>
              
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>SAE Reporting (hours)</InputLabel>
                    <Select
                      value={content.reportingTimelines.saeReporting}
                      onChange={(e) => setContent({
                        ...content,
                        reportingTimelines: {
                          ...content.reportingTimelines,
                          saeReporting: e.target.value
                        }
                      })}
                    >
                      <MenuItem value="24">24 hours</MenuItem>
                      <MenuItem value="48">48 hours</MenuItem>
                      <MenuItem value="72">72 hours</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Regulatory Reporting (days)</InputLabel>
                    <Select
                      value={content.reportingTimelines.regulatoryReporting}
                      onChange={(e) => setContent({
                        ...content,
                        reportingTimelines: {
                          ...content.reportingTimelines,
                          regulatoryReporting: e.target.value
                        }
                      })}
                    >
                      <MenuItem value="7">7 days</MenuItem>
                      <MenuItem value="15">15 days</MenuItem>
                      <MenuItem value="30">30 days</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>IRB Reporting (days)</InputLabel>
                    <Select
                      value={content.reportingTimelines.irbReporting}
                      onChange={(e) => setContent({
                        ...content,
                        reportingTimelines: {
                          ...content.reportingTimelines,
                          irbReporting: e.target.value
                        }
                      })}
                    >
                      <MenuItem value="3">3 days</MenuItem>
                      <MenuItem value="7">7 days</MenuItem>
                      <MenuItem value="14">14 days</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <RichTextEditor
                value={content.reportingRequirements}
                onChange={(value) => setContent({ ...content, reportingRequirements: value })}
                onSave={handleSave}
                placeholder="Describe detailed reporting requirements, forms to use, contact information..."
                autoSave={true}
                minRows={6}
              />
            </Box>
          )}

          {/* Follow-up Procedures */}
          {activeTab === 3 && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Section 9.4: Follow-up and Resolution Procedures
                </Typography>
                <Typography variant="body2">
                  Describe procedures for following up on adverse events until resolution,
                  including additional assessments and long-term monitoring.
                </Typography>
              </Alert>
              <RichTextEditor
                value={content.followUpProcedures}
                onChange={(value) => setContent({ ...content, followUpProcedures: value })}
                onSave={handleSave}
                placeholder="Describe follow-up procedures, resolution criteria, long-term monitoring..."
                autoSave={true}
                minRows={8}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};