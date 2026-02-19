import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Tabs, Tab, Alert
} from '@mui/material';
import {
  ExitToApp as ExitIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useProtocol } from '../../../contexts/ProtocolContext';
import { SectionHeader, SectionCompletionAlert } from '../index';
import { RichTextEditor } from '../RichTextEditor';
import { useValidation } from '../../../hooks/useValidation';
import { colors } from '../../../styles/theme';

export const DiscontinuationEditor: React.FC = () => {
  const { protocol, refreshProtocol } = useProtocol();
  const { validateProtocol, getLatestValidation } = useValidation();
  const [activeTab, setActiveTab] = useState(0);
  const [content, setContent] = useState({
    withdrawalCriteria: '',
    discontinuationProcedures: '',
    lostToFollowUp: ''
  });
  const [validating, setValidating] = useState(false);
  const [sectionValidation, setSectionValidation] = useState<any>(null);
  const [showCompletionAlert, setShowCompletionAlert] = useState(false);
  const [lastCompletionScore, setLastCompletionScore] = useState(0);

  useEffect(() => {
    if (protocol?.sections) {
      const section = protocol.sections.find((s: any) => s.sectionNumber === '7');
      if (section?.content) {
        setContent(section.content);
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
    if (report?.sectionStatus?.['7']) {
      setSectionValidation(report.sectionStatus['7']);
    }
  };

  const handleValidateSection = async () => {
    if (!protocol?.id) return;
    
    setValidating(true);
    try {
      const report = await validateProtocol(protocol.id);
      if (report?.sectionStatus?.['7']) {
        const newValidation = report.sectionStatus['7'];
        setSectionValidation(newValidation);
        
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
      const response = await fetch(`http://localhost:3001/api/protocols/sections/7`, {
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
    { label: 'Withdrawal Criteria', icon: <ExitIcon />, key: 'withdrawalCriteria' },
    { label: 'Procedures', icon: <InfoIcon />, key: 'discontinuationProcedures' },
    { label: 'Lost to Follow-up', icon: <WarningIcon />, key: 'lostToFollowUp' }
  ];

  return (
    <Box>
      <SectionHeader
        sectionNumber="7"
        sectionTitle="Trial Subject Discontinuation"
        description="Withdrawal criteria, discontinuation procedures, and follow-up"
        icon={<ExitIcon />}
        validationStatus={sectionValidation}
        onValidate={handleValidateSection}
        validating={validating}
      />

      {showCompletionAlert && sectionValidation && (
        <SectionCompletionAlert
          sectionTitle="Trial Subject Discontinuation"
          sectionNumber="7"
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
          {/* Withdrawal Criteria */}
          {activeTab === 0 && (
            <Box>
              <Alert 
                severity="warning" 
                sx={{ 
                  mb: 3,
                  backgroundColor: '#fff3e0',
                  border: '2px solid #ff9800',
                  '& .MuiAlert-icon': { color: '#f57c00' },
                  '& .MuiAlert-message': { 
                    color: '#e65100',
                    fontWeight: 600,
                    '& .MuiTypography-root': { color: '#e65100', fontWeight: 600 }
                  }
                }}
              >
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Section 7.1: Criteria for Withdrawal
                </Typography>
                <Typography variant="body2">
                  Define when and why participants may be withdrawn from the trial,
                  including safety concerns, non-compliance, and voluntary withdrawal.
                </Typography>
              </Alert>
              <RichTextEditor
                value={content.withdrawalCriteria}
                onChange={(value) => setContent({ ...content, withdrawalCriteria: value })}
                onSave={handleSave}
                placeholder="Define withdrawal criteria (safety, non-compliance, investigator decision, participant decision)..."
                autoSave={true}
              />
            </Box>
          )}

          {/* Discontinuation Procedures */}
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
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Section 7.2: Discontinuation Procedures
                </Typography>
                <Typography variant="body2">
                  Describe the procedures for withdrawing participants, including
                  assessments, documentation, and follow-up requirements.
                </Typography>
              </Alert>
              <RichTextEditor
                value={content.discontinuationProcedures}
                onChange={(value) => setContent({ ...content, discontinuationProcedures: value })}
                onSave={handleSave}
                placeholder="Describe discontinuation procedures (assessments to perform, data collection, documentation requirements)..."
                autoSave={true}
              />
            </Box>
          )}

          {/* Lost to Follow-up */}
          {activeTab === 2 && (
            <Box>
              <Alert 
                severity="warning" 
                sx={{ 
                  mb: 3,
                  backgroundColor: '#fff3e0',
                  border: '2px solid #ff9800',
                  '& .MuiAlert-icon': { color: '#f57c00' },
                  '& .MuiAlert-message': { 
                    color: '#e65100',
                    fontWeight: 600,
                    '& .MuiTypography-root': { color: '#e65100', fontWeight: 600 }
                  }
                }}
              >
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Section 7.3: Lost to Follow-up
                </Typography>
                <Typography variant="body2">
                  Define procedures for handling participants lost to follow-up,
                  including contact attempts and data handling strategies.
                </Typography>
              </Alert>
              <RichTextEditor
                value={content.lostToFollowUp}
                onChange={(value) => setContent({ ...content, lostToFollowUp: value })}
                onSave={handleSave}
                placeholder="Describe procedures for lost to follow-up (contact attempts, timing, data handling)..."
                autoSave={true}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};