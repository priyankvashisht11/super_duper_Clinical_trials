import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Button,
  Fade,
  Grow,
} from '@mui/material';
import {
  Info as InfoIcon,
  Search as SearchIcon,
  Description as DocumentIcon,
  Psychology as AIIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Groups as GroupsIcon,
  Email as EmailIcon,
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { colors } from '../../styles/theme';

const PageHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(colors.primary.light, 0.1)} 0%, ${alpha(colors.secondary.light, 0.05)} 100%)`,
  borderRadius: 16,
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  border: `1px solid ${alpha(colors.primary.main, 0.1)}`,
}));

const FeatureCard = styled(Card)(() => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  border: `1px solid ${alpha(colors.primary.main, 0.1)}`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 12px 32px ${alpha(colors.primary.main, 0.2)}`,
    borderColor: colors.primary.main,
  },
  '& .MuiCardContent-root': {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
}));

const TeamCard = styled(Card)(() => ({
  textAlign: 'center',
  transition: 'all 0.3s ease',
  border: `1px solid ${alpha(colors.primary.main, 0.1)}`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 24px ${alpha(colors.primary.main, 0.15)}`,
  },
}));

const StatsBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(3),
  borderRadius: 12,
  background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
  color: '#fff',
}));

export const AboutPage: React.FC = () => {
  const features = [
    {
      icon: <SearchIcon sx={{ fontSize: 40 }} />,
      title: 'Comprehensive Search',
      description: 'Search through 12,000+ CTRI trials with advanced filters for phase, status, location, and medical conditions.',
      color: colors.primary.main,
    },
    {
      icon: <AIIcon sx={{ fontSize: 40 }} />,
      title: 'AI-Powered Insights',
      description: 'Generate research summaries, patient matching reports, and literature reviews using Perplexity AI integration.',
      color: colors.secondary.main,
    },
    {
      icon: <DocumentIcon sx={{ fontSize: 40 }} />,
      title: 'Document Generation',
      description: 'Create professional research documents with multiple templates, citation styles, and export formats.',
      color: '#e91e63',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Secure & Compliant',
      description: 'Built with security best practices, data encryption, and compliance with medical data handling standards.',
      color: '#9c27b0',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      title: 'Fast & Efficient',
      description: 'Optimized performance with real-time search, instant filters, and responsive design for all devices.',
      color: '#ff9800',
    },
    {
      icon: <GroupsIcon sx={{ fontSize: 40 }} />,
      title: 'Designed for Physicians',
      description: 'Tailored specifically for Indian medical professionals with localized data and relevant features.',
      color: '#4caf50',
    },
  ];

  const stats = [
    { value: '12,000+', label: 'CTRI Trials' },
    { value: '500+', label: 'Medical Centers' },
    { value: '50+', label: 'Specialties' },
    { value: '24/7', label: 'Availability' },
  ];

  const team = [
    {
      name: 'Dr. Shruti Vashisht',
      role: 'Medical Director',
      avatar: 'SV',
      specialty: 'Clinical Research',
    },
    {
      name: 'Secret Team',
      role: 'Lead Developer',
      avatar: 'ST',
      specialty: 'Full Stack',
    },
    {
      name: 'Dr. Anuj Vashisht',
      role: 'Clinical Advisor',
      avatar: 'AV',
      specialty: 'Oncology',
    },
    {
      name: 'Priyank Vashisht',
      role: 'AI Engineer',
      avatar: 'PV',
      specialty: 'Machine Learning',
    },
  ];

  const technologies = [
    'React',
    'TypeScript',
    'Material-UI',
    'Node.js',
    'Express',
    'PostgreSQL',
    'Prisma',
    'Perplexity AI',
    'Docker',
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Fade in timeout={600}>
        <PageHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <InfoIcon sx={{ fontSize: 40, mr: 1.5, color: colors.primary.main }} />
            <Typography variant="h4" fontWeight={700} sx={{ color: colors.text.primary }}>
              About Clinical IQ
            </Typography>
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 3, 
              color: colors.text.primary,
              fontWeight: 500,
              lineHeight: 1.6
            }}
          >
            Empowering Indian physicians with AI-powered clinical trials research tools
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              lineHeight: 1.8,
              fontSize: '1rem',
              mb: 2
            }}
          >
            Clinical IQ is designed to streamline clinical trials research for medical professionals in India.
            We provide comprehensive access to CTRI trial data, intelligent search capabilities, and AI-powered
            document generation to help physicians make informed decisions and advance medical research.
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              lineHeight: 1.8,
              fontSize: '1rem',
              color: colors.primary.main,
              fontWeight: 500,
              fontStyle: 'italic'
            }}
          >
            Proudly developed in India, for India — bridging the gap between cutting-edge AI technology 
            and the unique needs of Indian healthcare research.
          </Typography>
        </PageHeader>
      </Fade>

      {/* Stats */}
      <Fade in timeout={800} style={{ transitionDelay: '200ms' }}>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid size={{ xs: 6, md: 3 }} key={index}>
              <StatsBox>
                <Typography variant="h3" fontWeight={700}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {stat.label}
                </Typography>
              </StatsBox>
            </Grid>
          ))}
        </Grid>
      </Fade>

      {/* Features */}
      <Fade in timeout={1000} style={{ transitionDelay: '400ms' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
            Key Features
          </Typography>
          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={index} sx={{ display: 'flex' }}>
                <Grow in timeout={600} style={{ transitionDelay: `${index * 100}ms`, width: '100%' }}>
                  <FeatureCard>
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box
                        sx={{
                          backgroundColor: alpha(feature.color, 0.1),
                          borderRadius: 3,
                          p: 2,
                          display: 'inline-flex',
                          mb: 2,
                          alignSelf: 'flex-start',
                        }}
                      >
                        {React.cloneElement(feature.icon, { sx: { color: feature.color, fontSize: 40 } })}
                      </Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, flexGrow: 1 }}>
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </FeatureCard>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Fade>

      {/* Technology Stack */}
      <Fade in timeout={1200} style={{ transitionDelay: '600ms' }}>
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
              Technology Stack
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Built with modern, reliable technologies for optimal performance and scalability
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {technologies.map((tech, index) => (
                <Chip
                  key={index}
                  label={tech}
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* Team */}
      <Fade in timeout={1400} style={{ transitionDelay: '800ms' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
            Our Team
          </Typography>
          <Grid container spacing={3}>
            {team.map((member, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <TeamCard>
                  <CardContent>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        margin: '0 auto 16px',
                        background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
                        fontSize: '1.5rem',
                        fontWeight: 700,
                      }}
                    >
                      {member.avatar}
                    </Avatar>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {member.name}
                    </Typography>
                    <Typography variant="body2" color="primary" fontWeight={600} gutterBottom>
                      {member.role}
                    </Typography>
                    <Chip
                      label={member.specialty}
                      size="small"
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                </TeamCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Fade>

      {/* Mission Statement */}
      <Fade in timeout={1600} style={{ transitionDelay: '1000ms' }}>
        <Card
          sx={{
            mb: 4,
            background: `linear-gradient(135deg, ${alpha(colors.primary.main, 0.05)} 0%, ${alpha(colors.secondary.main, 0.05)} 100%)`,
            border: `2px solid ${alpha(colors.primary.main, 0.2)}`,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Our Mission
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 2 }}>
              Clinical IQ's mission is to democratize access to clinical trials information and empower Indian physicians with
              cutting-edge AI tools that accelerate medical research, improve patient outcomes, and
              advance healthcare innovation across the country.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              We believe that every physician should have access to comprehensive, up-to-date clinical
              trials data and intelligent tools that help them make informed decisions for their patients
              and contribute to the advancement of medical science through Clinical IQ.
            </Typography>
          </CardContent>
        </Card>
      </Fade>

      {/* Contact */}
      <Fade in timeout={1800} style={{ transitionDelay: '1200ms' }}>
        <Card>
          <CardContent>
            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
              Get in Touch
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Have questions or feedback? We'd love to hear from you!
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<EmailIcon />}
                sx={{
                  background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
                }}
              >
                Email Us
              </Button>
              <Button
                variant="outlined"
                startIcon={<GitHubIcon />}
              >
                GitHub
              </Button>
              <Button
                variant="outlined"
                startIcon={<LinkedInIcon />}
              >
                LinkedIn
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};
