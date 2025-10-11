import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Grid,
  Chip,
  alpha
} from '@mui/material';
import {
  Description as LiteratureIcon,
  Compare as ComparisonIcon,
  PersonSearch as EligibilityIcon,
  Science as ResearchIcon
} from '@mui/icons-material';

export interface DocumentTemplate {
  type: 'literature_review' | 'trial_comparison' | 'patient_eligibility' | 'research_proposal';
  name: string;
  description: string;
  icon: React.ReactNode;
  estimatedTime: string;
  features: string[];
  color: string;
}

interface DocumentTemplateSelectorProps {
  selectedTemplate?: string;
  onTemplateSelect: (templateType: string) => void;
  disabled?: boolean;
}

const templates: DocumentTemplate[] = [
  {
    type: 'literature_review',
    name: 'Literature Review Summary',
    description: 'Comprehensive review of selected clinical trials with analysis and conclusions',
    icon: <LiteratureIcon />,
    estimatedTime: '2-3 minutes',
    features: ['Executive Summary', 'Methodology Analysis', 'Key Findings', 'Clinical Implications', 'AMA Citations'],
    color: '#1976d2'
  },
  {
    type: 'trial_comparison',
    name: 'Trial Comparison Report',
    description: 'Side-by-side comparison of multiple trials with key differences highlighted',
    icon: <ComparisonIcon />,
    estimatedTime: '1-2 minutes',
    features: ['Comparative Table', 'Study Design Analysis', 'Population Differences', 'Outcome Comparison', 'Recommendations'],
    color: '#388e3c'
  },
  {
    type: 'patient_eligibility',
    name: 'Patient Eligibility Assessment',
    description: 'Analysis of patient eligibility criteria across selected trials',
    icon: <EligibilityIcon />,
    estimatedTime: '1-2 minutes',
    features: ['Eligibility Matrix', 'Common Criteria', 'Exclusion Analysis', 'Geographic Access', 'Matching Framework'],
    color: '#f57c00'
  },
  {
    type: 'research_proposal',
    name: 'Research Proposal Draft',
    description: 'Foundation for research proposal based on current trial landscape',
    icon: <ResearchIcon />,
    estimatedTime: '3-4 minutes',
    features: ['Background Analysis', 'Research Gaps', 'Methodology Framework', 'Budget Considerations', 'Timeline'],
    color: '#7b1fa2'
  }
];

export const DocumentTemplateSelector: React.FC<DocumentTemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateSelect,
  disabled = false
}) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Document Template
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose the type of document you want to generate from your selected clinical trials
      </Typography>

      <Grid container spacing={2}>
        {templates.map((template) => {
          const isSelected = selectedTemplate === template.type;
          
          return (
            <Grid item xs={12} sm={6} key={template.type}>
              <Card
                sx={{
                  height: '100%',
                  border: 2,
                  borderColor: isSelected ? template.color : 'transparent',
                  backgroundColor: isSelected 
                    ? alpha(template.color, 0.05) 
                    : 'background.paper',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: disabled ? 'transparent' : alpha(template.color, 0.5),
                    backgroundColor: disabled 
                      ? 'background.paper' 
                      : alpha(template.color, 0.02),
                    transform: disabled ? 'none' : 'translateY(-2px)',
                    boxShadow: disabled ? 1 : 3
                  }
                }}
              >
                <CardActionArea
                  onClick={() => !disabled && onTemplateSelect(template.type)}
                  disabled={disabled}
                  sx={{ height: '100%', p: 0 }}
                >
                  <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          backgroundColor: alpha(template.color, 0.1),
                          color: template.color,
                          mr: 2
                        }}
                      >
                        {template.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                          {template.name}
                        </Typography>
                        <Chip
                          label={template.estimatedTime}
                          size="small"
                          sx={{
                            backgroundColor: alpha(template.color, 0.1),
                            color: template.color,
                            fontWeight: 500
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2, flex: 1 }}
                    >
                      {template.description}
                    </Typography>

                    {/* Features */}
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        Includes:
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {template.features.map((feature, index) => (
                          <Chip
                            key={index}
                            label={feature}
                            size="small"
                            variant="outlined"
                            sx={{
                              mr: 0.5,
                              mb: 0.5,
                              fontSize: '0.75rem',
                              height: 24,
                              borderColor: alpha(template.color, 0.3),
                              color: template.color,
                              '&:hover': {
                                backgroundColor: alpha(template.color, 0.05)
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </Box>

                    {/* Selection indicator */}
                    {isSelected && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: template.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.875rem',
                          fontWeight: 'bold'
                        }}
                      >
                        ✓
                      </Box>
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {selectedTemplate && (
        <Box sx={{ mt: 3, p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Selected:</strong> {templates.find(t => t.type === selectedTemplate)?.name}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DocumentTemplateSelector;