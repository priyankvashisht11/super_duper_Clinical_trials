import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Tabs, Tab, Alert, Button, Chip, LinearProgress, Fade, IconButton, Tooltip
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Lightbulb as LightbulbIcon,
  Science as ScienceIcon,
  AutoAwesome as AIIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  CheckCircle as CheckIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useProtocol } from '../../../contexts/ProtocolContext';
import { useNavigate } from 'react-router-dom';
import { SectionHeader, SectionCompletionAlert } from '../index';
import { RichTextEditor } from '../RichTextEditor';
import { AIIntroductionCopilot } from '../../ai/AIIntroductionCopilot';
import { useValidation } from '../../../hooks/useValidation';
import { colors } from '../../../styles/theme';

export const IntroductionEditor: React.FC = () => {
  const { 
    protocol, 
    autoSaveSection, 
    saving, 
    lastSaved,
    navigateToNextSection,
    navigateToPrevSection,
    getSectionProgress 
  } = useProtocol();
  const navigate = useNavigate();
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
  const [previousTab, setPreviousTab] = useState(0);
  const [sectionProgress, setSectionProgress] = useState(0);

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
      const progress = getSectionProgress('2');
      setSectionProgress(progress);
      
      // Auto-advance to next tab when current is complete
      const currentTabKey = tabs[activeTab].key;
      const currentValue = content[currentTabKey as keyof typeof content];
      const wordCount = (currentValue || '').trim().split(/\s+/).filter(Boolean).length;
      
      if (wordCount >= 300 && activeTab < tabs.length - 1) {
        // Show completion message and suggest moving to next tab
        const timer = setTimeout(() => {
          if (window.confirm(`Great! ${tabs[activeTab].label} section is complete (${wordCount} words). Move to ${tabs[activeTab + 1].label}?`)) {
            setActiveTab(activeTab + 1);
          }
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [protocol?.id, content, activeTab]);

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

  const handleContentChange = (field: string, value: string) => {
    const newContent = { ...content, [field]: value };
    setContent(newContent);
    // Trigger auto-save
    autoSaveSection('2', newContent);
  };

  const handleAIInsert = (field: string, generatedText: string) => {
    // Insert at end of existing content
    const currentValue = content[field as keyof typeof content];
    const newValue = currentValue 
      ? `${currentValue}\n\n${generatedText}` 
      : generatedText;
    handleContentChange(field, newValue);
  };

  const handleAIReplace = (field: string, generatedText: string) => {
    // Replace entire content
    handleContentChange(field, generatedText);
  };

  const handleTabChange = (_: any, newValue: number) => {
    // Save current tab content before switching
    const currentTabKey = tabs[activeTab].key;
    const currentValue = content[currentTabKey as keyof typeof content];
    
    // Ensure content is saved
    if (currentValue !== content[currentTabKey as keyof typeof content]) {
      const newContent = { ...content, [currentTabKey]: currentValue };
      autoSaveSection('2', newContent);
    }
    
    setPreviousTab(activeTab);
    setActiveTab(newValue);
  };

  const handleNavigateNext = () => {
    const nextSection = navigateToNextSection('2');
    if (nextSection && protocol?.id) {
      navigate(`/protocols/${protocol.id}/section/${nextSection}`);
    }
  };

  const handleNavigatePrev = () => {
    const prevSection = navigateToPrevSection('2');
    if (prevSection && protocol?.id) {
      navigate(`/protocols/${protocol.id}/section/${prevSection}`);
    } else if (protocol?.id) {
      navigate(`/protocols/${protocol.id}`);
    }
  };

  const tabs = [
    { label: 'Background', icon: <DescriptionIcon />, key: 'background', 
      prompt: 'Generate a comprehensive background section for a clinical trial protocol about {indication}. Include disease epidemiology, current treatment landscape, and unmet medical needs.' },
    { label: 'Rationale', icon: <LightbulbIcon />, key: 'rationale',
      prompt: 'Generate a study rationale explaining why this {trialPhase} clinical trial for {indication} is needed, what it will contribute to medical knowledge, and how it addresses unmet needs.' },
    { label: 'Benefit-Risk', icon: <ScienceIcon />, key: 'benefitRisk',
      prompt: 'Generate a benefit-risk assessment for a clinical trial investigating {indication}. Include known and potential benefits, known and potential risks, and overall benefit-risk balance.' }
  ];

  const currentTab = tabs[activeTab];
  const currentContent = content[currentTab.key as keyof typeof content];
  const isFieldComplete = currentContent && currentContent.trim().length > 100;

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

      {/* Auto-save indicator */}
      <Fade in={saving || !!lastSaved}>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          {saving ? (
            <>
              <SaveIcon sx={{ fontSize: 16, color: colors.primary.main }} />
              <Typography variant="caption" color="text.secondary">
                Saving...
              </Typography>
            </>
          ) : lastSaved ? (
            <>
              <CheckIcon sx={{ fontSize: 16, color: colors.semantic.success }} />
              <Typography variant="caption" color="text.secondary">
                Last saved {lastSaved.toLocaleTimeString()}
              </Typography>
            </>
          ) : null}
        </Box>
      </Fade>

      {/* Section Progress */}
      <Card sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" fontWeight={600}>
            Section Progress
          </Typography>
          <Typography variant="body2" fontWeight={700} color="primary">
            {sectionProgress}%
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={sectionProgress}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: `${colors.primary.main}20`,
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              background: `linear-gradient(90deg, ${colors.primary.main}, ${colors.secondary.main})`
            }
          }}
        />
      </Card>

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
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .Mui-selected': {
              color: `${colors.primary.main} !important`
            }
          }}
        >
          {tabs.map((tab, index) => {
            const fieldContent = content[tab.key as keyof typeof content];
            const isComplete = fieldContent && fieldContent.trim().length > 100;
            
            return (
              <Tab
                key={tab.key}
                icon={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {tab.icon}
                    {isComplete && <CheckIcon sx={{ fontSize: 16, color: colors.semantic.success }} />}
                  </Box>
                }
                iconPosition="start"
                label={tab.label}
              />
            );
          })}
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          {/* Tab Content */}
          <Box>
            <Alert 
              severity="info" 
              sx={{ 
                mb: 2,
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
                Section 2.{activeTab + 1}: {currentTab.label}
              </Typography>
              <Typography variant="body2">
                {activeTab === 0 && 'Provide disease/condition background, current treatment landscape, and unmet medical needs. Target: ~300 words.'}
                {activeTab === 1 && 'Explain why this trial is needed, what it will contribute to knowledge, and how it addresses unmet needs. Target: ~300 words.'}
                {activeTab === 2 && 'Describe known and potential benefits, known and potential risks, and the overall benefit-risk assessment. Target: ~300 words.'}
              </Typography>
            </Alert>

            {/* AI Copilot */}
            <AIIntroductionCopilot
              fieldName={currentTab.label}
              fieldValue={currentContent}
              sectionNumber="2"
              protocolContext={protocol}
              targetWordCount={300}
              onInsert={(text) => handleAIInsert(currentTab.key, text)}
              onReplace={(text) => handleAIReplace(currentTab.key, text)}
            />

            <RichTextEditor
              value={currentContent}
              onChange={(value) => handleContentChange(currentTab.key, value)}
              placeholder={`Describe the ${currentTab.label.toLowerCase()}...`}
              autoSave={false} // We handle auto-save at component level
            />

            {isFieldComplete && (
              <Chip
                icon={<CheckIcon />}
                label="Section Complete"
                color="success"
                size="small"
                sx={{ mt: 2 }}
              />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<PrevIcon />}
          onClick={handleNavigatePrev}
          sx={{
            borderColor: colors.text.secondary,
            color: colors.text.secondary
          }}
        >
          Previous: Protocol Summary
        </Button>

        <Button
          variant="contained"
          endIcon={<NextIcon />}
          onClick={handleNavigateNext}
          sx={{
            background: `linear-gradient(135deg, ${colors.primary.main}, ${colors.secondary.main})`,
            '&:hover': {
              background: `linear-gradient(135deg, ${colors.primary.dark}, ${colors.secondary.dark})`
            }
          }}
        >
          Next: Trial Objectives
        </Button>
      </Box>
    </Box>
  );
};
