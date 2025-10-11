import React, { useState } from 'react';
import { Box, Typography, Grid, Divider } from '@mui/material';
import {
  // Layout components
  MainContainer,
  Section,
  SectionHeader,
  FlexRow,
  FlexColumn,
  ResponsiveGrid,
  
  // Card components
  BaseCard,
  TrialCard,
  FeatureCard,
  StatsCard,
  
  // Button components
  PrimaryButton,
  SecondaryButton,
  GhostButton,
  GenerateButton,
  VoiceButton,
  BookmarkButton,
  
  // Typography components
  PageTitle,
  SectionTitle,
  CardTitle,
  BodyText,
  CTRINumber,
  PhaseText,
  StatusText,
  
  // Input components
  FormInput,
  MedicalAutocomplete,
  FilterSlider,
  
  // Status components
  StatusChip,
  PhaseChip,
  ProgressIndicator,
  ConnectionStatus,
  ConfidenceScore,
} from '../styled';

/**
 * Design System Demo Component
 * Showcases all styled components and design patterns
 */
export const DesignSystemDemo: React.FC = () => {
  const [sliderValue, setSliderValue] = useState(50);
  const [autocompleteValue, setAutocompleteValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const sampleConditions = [
    { label: 'Diabetes Mellitus Type 2', value: 'diabetes-t2', category: 'Endocrine' },
    { label: 'Hypertension', value: 'hypertension', category: 'Cardiovascular' },
    { label: 'Breast Cancer', value: 'breast-cancer', category: 'Oncology' },
    { label: 'Alzheimer Disease', value: 'alzheimer', category: 'Neurology' },
  ];

  return (
    <MainContainer>
      <PageTitle>Design System Demo</PageTitle>
      
      {/* Typography Section */}
      <Section>
        <SectionHeader>
          <SectionTitle>Typography</SectionTitle>
        </SectionHeader>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <BaseCard>
              <Box p={3}>
                <Typography variant="h1">Heading 1 - Page Title</Typography>
                <Typography variant="h2">Heading 2 - Section Title</Typography>
                <Typography variant="h3">Heading 3 - Subsection</Typography>
                <Typography variant="h4">Heading 4 - Card Title</Typography>
                <Typography variant="body1">Body 1 - Main content text with proper line height and spacing for readability.</Typography>
                <Typography variant="body2">Body 2 - Secondary content text, slightly smaller.</Typography>
                <Typography variant="caption">Caption - Metadata and fine print text.</Typography>
              </Box>
            </BaseCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <BaseCard>
              <Box p={3}>
                <CardTitle>Medical Typography</CardTitle>
                <FlexColumn>
                  <CTRINumber number="CTRI/2024/01/012345" />
                  <PhaseText phase="III" />
                  <StatusText status="recruiting" />
                  <BodyText>
                    This demonstrates medical-specific typography components with proper styling for clinical trial information.
                  </BodyText>
                </FlexColumn>
              </Box>
            </BaseCard>
          </Grid>
        </Grid>
      </Section>

      <Divider sx={{ my: 4 }} />

      {/* Buttons Section */}
      <Section>
        <SectionHeader>
          <SectionTitle>Buttons</SectionTitle>
        </SectionHeader>
        <ResponsiveGrid>
          <BaseCard>
            <Box p={3}>
              <CardTitle>Primary Actions</CardTitle>
              <FlexColumn>
                <PrimaryButton>Primary Button</PrimaryButton>
                <SecondaryButton>Secondary Button</SecondaryButton>
                <GhostButton>Ghost Button</GhostButton>
                <GenerateButton>Generate Document</GenerateButton>
              </FlexColumn>
            </Box>
          </BaseCard>
          
          <BaseCard>
            <Box p={3}>
              <CardTitle>Interactive Buttons</CardTitle>
              <FlexRow>
                <VoiceButton 
                  className={isRecording ? 'recording' : ''}
                  onClick={() => setIsRecording(!isRecording)}
                />
                <BookmarkButton 
                  className={isBookmarked ? 'bookmarked' : ''}
                  onClick={() => setIsBookmarked(!isBookmarked)}
                />
              </FlexRow>
            </Box>
          </BaseCard>
        </ResponsiveGrid>
      </Section>

      <Divider sx={{ my: 4 }} />

      {/* Cards Section */}
      <Section>
        <SectionHeader>
          <SectionTitle>Cards</SectionTitle>
        </SectionHeader>
        <ResponsiveGrid>
          <TrialCard selected={false} bookmarked={true}>
            <Box p={3}>
              <FlexRow>
                <CTRINumber number="CTRI/2024/01/012345" />
                <StatusChip status="recruiting" />
              </FlexRow>
              <CardTitle>Efficacy of Novel Diabetes Treatment</CardTitle>
              <BodyText>
                A randomized, double-blind, placebo-controlled Phase III trial evaluating the efficacy and safety of a novel diabetes treatment in Indian patients.
              </BodyText>
              <FlexRow>
                <PhaseChip phase="III" />
                <Typography variant="body2" color="textSecondary">Mumbai, MH</Typography>
              </FlexRow>
            </Box>
          </TrialCard>

          <FeatureCard>
            <Box p={3} textAlign="center">
              <CardTitle>AI-Powered Search</CardTitle>
              <BodyText>
                Advanced search capabilities with natural language processing and medical terminology recognition.
              </BodyText>
            </Box>
          </FeatureCard>

          <StatsCard>
            <Box p={3}>
              <Typography className="stats-number">12,000+</Typography>
              <Typography className="stats-label">Clinical Trials</Typography>
            </Box>
          </StatsCard>
        </ResponsiveGrid>
      </Section>

      <Divider sx={{ my: 4 }} />

      {/* Form Inputs Section */}
      <Section>
        <SectionHeader>
          <SectionTitle>Form Inputs</SectionTitle>
        </SectionHeader>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <BaseCard>
              <Box p={3}>
                <CardTitle>Text Inputs</CardTitle>
                <FlexColumn>
                  <FormInput
                    label="Research Question"
                    placeholder="Enter your research question..."
                    multiline
                    rows={3}
                  />
                  <MedicalAutocomplete
                    options={sampleConditions}
                    value={autocompleteValue}
                    onChange={(value) => setAutocompleteValue(value as string)}
                    placeholder="Search medical conditions..."
                  />
                </FlexColumn>
              </Box>
            </BaseCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <BaseCard>
              <Box p={3}>
                <CardTitle>Range Slider</CardTitle>
                <Box mt={2}>
                  <Typography gutterBottom>Distance: {sliderValue} km</Typography>
                  <FilterSlider
                    value={sliderValue}
                    onChange={(_, value) => setSliderValue(value as number)}
                    min={0}
                    max={500}
                    step={10}
                    valueLabelDisplay="auto"
                  />
                </Box>
              </Box>
            </BaseCard>
          </Grid>
        </Grid>
      </Section>

      <Divider sx={{ my: 4 }} />

      {/* Status Indicators Section */}
      <Section>
        <SectionHeader>
          <SectionTitle>Status Indicators</SectionTitle>
        </SectionHeader>
        <ResponsiveGrid>
          <BaseCard>
            <Box p={3}>
              <CardTitle>Trial Status</CardTitle>
              <FlexColumn>
                <StatusChip status="recruiting" />
                <StatusChip status="not_yet_recruiting" />
                <StatusChip status="completed" />
                <StatusChip status="suspended" />
              </FlexColumn>
            </Box>
          </BaseCard>

          <BaseCard>
            <Box p={3}>
              <CardTitle>Trial Phases</CardTitle>
              <FlexRow>
                <PhaseChip phase="I" />
                <PhaseChip phase="II" />
                <PhaseChip phase="III" />
                <PhaseChip phase="IV" />
              </FlexRow>
            </Box>
          </BaseCard>

          <BaseCard>
            <Box p={3}>
              <CardTitle>Progress & Status</CardTitle>
              <FlexColumn>
                <Box>
                  <Typography variant="body2" gutterBottom>Document Generation Progress</Typography>
                  <ProgressIndicator progress={75} />
                </Box>
                <ConnectionStatus online={true} />
                <ConfidenceScore score={85} />
              </FlexColumn>
            </Box>
          </BaseCard>
        </ResponsiveGrid>
      </Section>
    </MainContainer>
  );
};

export default DesignSystemDemo;