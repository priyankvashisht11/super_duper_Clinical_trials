import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Tabs, Tab, Alert, Grid,
  TextField, FormControlLabel, Checkbox
} from '@mui/material';
import {
  Gavel as GovernanceIcon,
  Security as MonitoringIcon,
  Group as CommitteeIcon,
  Assignment as AuditIcon
} from '@mui/icons-material';
import { useProtocol } from '../../../contexts/ProtocolContext';
import { SectionHeader, SectionCompletionAlert } from '../index';
import { RichTextEditor } from '../RichTextEditor';
import { useValidation } from '../../../hooks/useValidation';
import { colors } from '../../../styles/theme';

export const TrialOversightEditor: React.FC = () => {
  const { protocol, refreshProtocol } = useProtocol();
  const { validateProtocol, getLatestValidation } = useValidation();
  const [activeTab, setActiveTab] = useState(0);
  const [content, setContent] = useState({
    governance: '',
    monitoring: '',
    committees: '',
    audits: '',
    monitoringPlan: {
      centralMonitoring: false,
      onSiteMonitoring: false,
      riskBasedMonitoring: false,
      remoteMonitoring: false
    },
    committeeDetails: {
      dsmb: '',
      steeringCommittee: '',
      adjudicationCommittee: ''
    }
  });
  const [validating, setValidating] = useState(false);
  const [sectionValidation, setSectionValidation] = useState<any>(null);
  const [showCompletionAlert, setShowCompletionAlert] = useState(false);
  const [lastCompletionScore, setLastCompletionScore] = useState(0);

  useEffect(() => {
    if (protocol?.sections) {
      const section = protocol.sections.find((s: any) => s.sectionNumber === '11');
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
    if (report?.sectionStatus?.['11']) {
      setSectionValidation(report.sectionStatus['11']);
    }
  };

  const handleValidateSection = async () => {
    if (!protocol?.id) return;
    
    setValidating(true);
    try {
      const report = await validateProtocol(protocol.id);
      if (report?.sectionStatus?.['11']) {
        setSectionValidation(report.sectionStatus['11']);
        
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
      const response = await fetch(`http://localhost:3001/api/protocols/sections/11`, {
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
    { label: 'Governance', icon: <GovernanceIcon />, key: 'governance' },
    { label: 'Monitoring', icon: <MonitoringIcon />, key: 'monitoring' },
    { label: 'Committees', icon: <CommitteeIcon />, key: 'committees' },
    { label: 'Audits', icon: <AuditIcon />, key: 'audits' }
  ];

  return (
    <Box>
      <SectionHeader
        sectionNumber="11"
        sectionTitle="Trial Oversight"
        description="Governance, monitoring, committees, and quality assurance"
        icon={<GovernanceIcon />}
        validationStatus={sectionValidation}
        onValidate={handleValidateSection}
        validating={validating}
      />

      {showCompletionAlert && (
        <SectionCompletionAlert
          sectionTitle="Trial Oversight"
          sectionNumber="11"
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
          {/* Governance */}
          {activeTab === 0 && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Section 11.1: Trial Governance Structure
                </Typography>
                <Typography variant="body2">
                  Describe the overall governance structure, roles and responsibilities,
                  and decision-making processes for the clinical trial.
                </Typography>
              </Alert>
              <RichTextEditor
                value={content.governance}
                onChange={(value) => setContent({ ...content, governance: value })}
                onSave={handleSave}
                placeholder="Describe governance structure, sponsor responsibilities, investigator roles, CRO involvement..."
                autoSave={true}
                minRows={8}
              />
            </Box>
          )}

          {/* Monitoring */}
          {activeTab === 1 && (
            <Box>
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Section 11.2: Monitoring Plan and Procedures
                </Typography>
                <Typography variant="body2">
                  Define the monitoring strategy, including risk-based monitoring,
                  central monitoring, and on-site monitoring procedures.
                </Typography>
              </Alert>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
                Monitoring Approaches
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={content.monitoringPlan.centralMonitoring}
                        onChange={(e) => setContent({
                          ...content,
                          monitoringPlan: {
                            ...content.monitoringPlan,
                            centralMonitoring: e.target.checked
                          }
                        })}
                      />
                    }
                    label="Central Statistical Monitoring"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={content.monitoringPlan.onSiteMonitoring}
                        onChange={(e) => setContent({
                          ...content,
                          monitoringPlan: {
                            ...content.monitoringPlan,
                            onSiteMonitoring: e.target.checked
                          }
                        })}
                      />
                    }
                    label="On-Site Monitoring"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={content.monitoringPlan.riskBasedMonitoring}
                        onChange={(e) => setContent({
                          ...content,
                          monitoringPlan: {
                            ...content.monitoringPlan,
                            riskBasedMonitoring: e.target.checked
                          }
                        })}
                      />
                    }
                    label="Risk-Based Monitoring"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={content.monitoringPlan.remoteMonitoring}
                        onChange={(e) => setContent({
                          ...content,
                          monitoringPlan: {
                            ...content.monitoringPlan,
                            remoteMonitoring: e.target.checked
                          }
                        })}
                      />
                    }
                    label="Remote Monitoring"
                  />
                </Grid>
              </Grid>

              <RichTextEditor
                value={content.monitoring}
                onChange={(value) => setContent({ ...content, monitoring: value })}
                onSave={handleSave}
                placeholder="Describe detailed monitoring procedures, frequency, key data points to monitor..."
                autoSave={true}
                minRows={6}
              />
            </Box>
          )}

          {/* Committees */}
          {activeTab === 2 && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Section 11.3: Oversight Committees
                </Typography>
                <Typography variant="body2">
                  Describe oversight committees such as DSMB, steering committee,
                  and adjudication committee, including their roles and procedures.
                </Typography>
              </Alert>
              
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Data Safety Monitoring Board (DSMB)"
                    value={content.committeeDetails.dsmb}
                    onChange={(e) => setContent({
                      ...content,
                      committeeDetails: {
                        ...content.committeeDetails,
                        dsmb: e.target.value
                      }
                    })}
                    placeholder="DSMB composition, meeting frequency, charter..."
                    multiline
                    rows={3}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Steering Committee"
                    value={content.committeeDetails.steeringCommittee}
                    onChange={(e) => setContent({
                      ...content,
                      committeeDetails: {
                        ...content.committeeDetails,
                        steeringCommittee: e.target.value
                      }
                    })}
                    placeholder="Steering committee members, responsibilities..."
                    multiline
                    rows={3}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Adjudication Committee"
                    value={content.committeeDetails.adjudicationCommittee}
                    onChange={(e) => setContent({
                      ...content,
                      committeeDetails: {
                        ...content.committeeDetails,
                        adjudicationCommittee: e.target.value
                      }
                    })}
                    placeholder="Adjudication committee for endpoints, procedures..."
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>

              <RichTextEditor
                value={content.committees}
                onChange={(value) => setContent({ ...content, committees: value })}
                onSave={handleSave}
                placeholder="Describe additional committee details, meeting procedures, decision-making processes..."
                autoSave={true}
                minRows={6}
              />
            </Box>
          )}

          {/* Audits */}
          {activeTab === 3 && (
            <Box>
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Section 11.4: Quality Assurance and Audits
                </Typography>
                <Typography variant="body2">
                  Describe quality assurance procedures, audit plans, and inspection
                  readiness, including regulatory inspection preparation.
                </Typography>
              </Alert>
              <RichTextEditor
                value={content.audits}
                onChange={(value) => setContent({ ...content, audits: value })}
                onSave={handleSave}
                placeholder="Describe QA procedures, audit frequency, inspection readiness, document management..."
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