import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Tabs, Tab, Alert
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Lightbulb as LightbulbIcon,
  Science as ScienceIcon
} from '@mui/icons-material';
import { useProtocol } from '../../../contexts/ProtocolContext';
import { SectionHeader, SectionCompletionAlert } from '../index';
import { RichTextEditor } from '../RichTextEditor';
import { useValidation } from '../../../hooks/useValidation';
import { colors } from '../../../styles/theme';

export const IntroductionEditor: React.FC = () => {
  const { protocol, refreshProtocol } = useProtocol();
  const { validateProtocol, getLatestValidation } = useValidation();
  const [activeTab, setActiveTab] = useState(0);
  const [content, setContent] = useState({
    background: '',
    rationale: '',
    benefitRisk: ''
  });
  const [validating, setValidating] = useState(false);
  const [sectionValidation, setSectionValidation] = useState<any>(null);
  const [showCompletionAlert, setShowCompletionAlert] = useState(false);
  const [lastCompletionScore, setLastCompletionScore] = useState(0);

  useEffect(() => {
    if (protocol?.sections) {
      const section = protocol.sections.find((s: any) => s.sectionNumber === '2');
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
    if (report?.sectionStatus?.['2']) {
      setSectionValidation(report.sectionStatus['2']);
    }
  };

  const handleValidateSection = async () => {
    if (!protocol?.id) return;
    
    setValidating(true);
    try {
      const report = await validateProtocol(protocol.id);
      if (report?.sectionStatus?.['2']) {
        const newValidation = report.sectionStatus['2'];
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
    try {
      const response = await fetch(`http://localhost:3001/api/protocols/sections/2`, {
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
    { label: 'Background', icon: <DescriptionIcon />, key: 'background' },
    { label: 'Rationale', icon: <LightbulbIcon />, key: 'rationale' },
    { label: 'Benefit-Risk', icon: <ScienceIcon />, key: 'benefitRisk' }
  ];

  return (
    <Box>
      <SectionHeader
        sectionNumber="2"
        sectionTitle="Introduction"
        description="Background information, study rationale, and benefit-risk assessment"
        icon={<DescriptionIcon />}
        validationStatus={sectionValidation}
        onValidate={handleValidateSection}
        validating={validating}
      />

      {showCompletionAlert && sectionValidation && (
        <SectionCompletionAlert
          sectionTitle="Introduction"
          sectionNumber="2"
          completionScore={sectionValidation.completionScore || 0}
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
          {/* Background Tab */}
          {activeTab === 0 && (
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
                  Section 2.1: Background
                </Typography>
                <Typography variant="body2">
                  Provide disease/condition background, current treatment landscape,
                  and unmet medical needs.
                </Typography>
              </Alert>
              <RichTextEditor
                value={content.background}
                onChange={(value) => setContent({ ...content, background: value })}
                onSave={handleSave}
                placeholder="Describe the disease/condition background..."
                autoSave={true}
              />
            </Box>
          )}

          {/* Rationale Tab */}
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
                  Section 2.2: Study Rationale
                </Typography>
                <Typography variant="body2">
                  Explain why this trial is needed, what it will contribute to knowledge,
                  and how it addresses unmet needs.
                </Typography>
              </Alert>
              <RichTextEditor
                value={content.rationale}
                onChange={(value) => setContent({ ...content, rationale: value })}
                onSave={handleSave}
                placeholder="Explain the rationale for this clinical trial..."
                autoSave={true}
              />
            </Box>
          )}

          {/* Benefit-Risk Tab */}
          {activeTab === 2 && (
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
                  Section 2.3: Benefit-Risk Assessment
                </Typography>
                <Typography variant="body2">
                  Describe known and potential benefits, known and potential risks,
                  and the overall benefit-risk assessment.
                </Typography>
              </Alert>
              <RichTextEditor
                value={content.benefitRisk}
                onChange={(value) => setContent({ ...content, benefitRisk: value })}
                onSave={handleSave}
                placeholder="Describe the benefit-risk assessment..."
                autoSave={true}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};