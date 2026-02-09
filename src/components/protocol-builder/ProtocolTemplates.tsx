import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Box, Typography, Grid, Card, CardContent, CardActions,
  Chip, Alert
} from '@mui/material';
import {
  Description as TemplateIcon,
  Science as ScienceIcon,
  Favorite as HeartIcon,
  Speed as SpeedIcon,
  LocalHospital as HospitalIcon
} from '@mui/icons-material';
import { colors } from '../../styles/theme';

interface Template {
  id: string;
  name: string;
  description: string;
  phase: string;
  indication: string;
  icon: React.ReactNode;
  color: string;
  templateData: any;
}

interface ProtocolTemplatesProps {
  open: boolean;
  onClose: () => void;
  onSelect: (template: Template) => void;
}

const TEMPLATES: Template[] = [
  {
    id: 'phase3-diabetes',
    name: 'Phase 3 Diabetes Trial',
    description: 'Randomized, double-blind, placebo-controlled trial template for Type 2 Diabetes',
    phase: 'Phase 3',
    indication: 'Type 2 Diabetes Mellitus',
    icon: <HeartIcon />,
    color: colors.semantic.error,
    templateData: {
      trialPhase: 'Phase 3',
      indication: 'Type 2 Diabetes Mellitus',
      studyType: 'Interventional',
      objectives: [
        {
          objectiveType: 'primary',
          objectiveText: 'To evaluate the efficacy of [DRUG] compared to placebo in reducing HbA1c levels in patients with Type 2 Diabetes Mellitus',
          estimand: {
            endpoint: 'Change from baseline in HbA1c at Week 24',
            population: 'Full Analysis Set',
            intercurrentEvents: 'Treatment policy strategy',
            summaryMeasure: 'Difference in means'
          }
        }
      ],
      eligibilityCriteria: [
        {
          criterionType: 'inclusion',
          criterionText: 'Adults aged 18-75 years with Type 2 Diabetes Mellitus'
        },
        {
          criterionType: 'inclusion',
          criterionText: 'HbA1c between 7.0% and 10.5% at screening'
        },
        {
          criterionType: 'exclusion',
          criterionText: 'Type 1 diabetes or secondary diabetes'
        }
      ]
    }
  },
  {
    id: 'phase2-oncology',
    name: 'Phase 2 Oncology Trial',
    description: 'Open-label, multi-arm trial template for solid tumors',
    phase: 'Phase 2',
    indication: 'Solid Tumors',
    icon: <ScienceIcon />,
    color: colors.semantic.warning,
    templateData: {
      trialPhase: 'Phase 2',
      indication: 'Advanced Solid Tumors',
      studyType: 'Interventional',
      objectives: [
        {
          objectiveType: 'primary',
          objectiveText: 'To evaluate the objective response rate (ORR) of [DRUG] in patients with advanced solid tumors',
          estimand: {
            endpoint: 'Objective Response Rate by RECIST v1.1',
            population: 'Efficacy Analysis Set',
            intercurrentEvents: 'Composite strategy',
            summaryMeasure: 'Proportion'
          }
        }
      ],
      eligibilityCriteria: [
        {
          criterionType: 'inclusion',
          criterionText: 'Adults aged ≥18 years with histologically confirmed advanced solid tumors'
        },
        {
          criterionType: 'inclusion',
          criterionText: 'ECOG performance status 0-1'
        },
        {
          criterionType: 'exclusion',
          criterionText: 'Prior treatment with similar mechanism of action'
        }
      ]
    }
  },
  {
    id: 'phase1-fih',
    name: 'Phase 1 First-in-Human',
    description: 'Dose-escalation, safety, and tolerability study template',
    phase: 'Phase 1',
    indication: 'Healthy Volunteers',
    icon: <SpeedIcon />,
    color: colors.primary.main,
    templateData: {
      trialPhase: 'Phase 1',
      indication: 'Healthy Volunteers',
      studyType: 'Interventional',
      objectives: [
        {
          objectiveType: 'primary',
          objectiveText: 'To evaluate the safety and tolerability of [DRUG] and determine the maximum tolerated dose (MTD)',
          estimand: {
            endpoint: 'Dose-limiting toxicities (DLTs)',
            population: 'Safety Analysis Set',
            intercurrentEvents: 'Treatment policy strategy',
            summaryMeasure: 'Proportion'
          }
        }
      ],
      eligibilityCriteria: [
        {
          criterionType: 'inclusion',
          criterionText: 'Healthy male and female volunteers aged 18-55 years'
        },
        {
          criterionType: 'inclusion',
          criterionText: 'BMI between 18.5 and 30.0 kg/m²'
        },
        {
          criterionType: 'exclusion',
          criterionText: 'Any clinically significant medical condition'
        }
      ]
    }
  },
  {
    id: 'phase3-cv',
    name: 'Phase 3 Cardiovascular',
    description: 'Event-driven outcomes trial template for cardiovascular disease',
    phase: 'Phase 3',
    indication: 'Cardiovascular Disease',
    icon: <HospitalIcon />,
    color: colors.secondary.main,
    templateData: {
      trialPhase: 'Phase 3',
      indication: 'Cardiovascular Disease',
      studyType: 'Interventional',
      objectives: [
        {
          objectiveType: 'primary',
          objectiveText: 'To evaluate the effect of [DRUG] on major adverse cardiovascular events (MACE) compared to placebo',
          estimand: {
            endpoint: 'Time to first occurrence of MACE',
            population: 'Intent-to-treat population',
            intercurrentEvents: 'Composite strategy',
            summaryMeasure: 'Hazard ratio'
          }
        }
      ],
      eligibilityCriteria: [
        {
          criterionType: 'inclusion',
          criterionText: 'Adults aged ≥50 years with established cardiovascular disease'
        },
        {
          criterionType: 'inclusion',
          criterionText: 'LDL cholesterol ≥70 mg/dL despite statin therapy'
        },
        {
          criterionType: 'exclusion',
          criterionText: 'Recent myocardial infarction or stroke within 30 days'
        }
      ]
    }
  }
];

export const ProtocolTemplates: React.FC<ProtocolTemplatesProps> = ({
  open,
  onClose,
  onSelect
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const handleSelect = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <TemplateIcon sx={{ color: colors.primary.main, fontSize: 32 }} />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Protocol Templates
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Start with a pre-configured template to save time
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 3 }}>
          Templates include pre-filled sections, objectives, criteria, and design elements
          that you can customize for your trial.
        </Alert>

        <Grid container spacing={3}>
          {TEMPLATES.map((template) => (
            <Grid item xs={12} md={6} key={template.id}>
              <Card
                sx={{
                  border: selectedTemplate?.id === template.id ? `3px solid ${template.color}` : '1px solid',
                  borderColor: selectedTemplate?.id === template.id ? template.color : 'divider',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-4px)'
                  }
                }}
                onClick={() => setSelectedTemplate(template)}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        backgroundColor: `${template.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: template.color
                      }}
                    >
                      {template.icon}
                    </Box>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight={700}>
                        {template.name}
                      </Typography>
                      <Chip
                        label={template.phase}
                        size="small"
                        sx={{
                          backgroundColor: `${template.color}20`,
                          color: template.color,
                          fontWeight: 700
                        }}
                      />
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {template.description}
                  </Typography>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Indication:
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {template.indication}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSelect}
          disabled={!selectedTemplate}
          sx={{
            background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`
          }}
        >
          Use Template
        </Button>
      </DialogActions>
    </Dialog>
  );
};