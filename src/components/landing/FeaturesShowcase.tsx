import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Container,
  Fade,
  Grow,
  Dialog,
  DialogContent,
  IconButton,
  Chip,
  Avatar,
  Rating,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  AutoAwesome as AIIcon,
  PersonSearch as MatchingIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Close as CloseIcon,
  PlayArrow as PlayIcon,
  TrendingUp as TrendingUpIcon,
  Groups as GroupsIcon,
  LocalHospital as HospitalIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { colors } from '../../styles/theme';

// Styled components
const ShowcaseContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(8),
  position: 'relative',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 700,
  textAlign: 'center',
  marginBottom: theme.spacing(2),
  background: `linear-gradient(45deg, ${colors.primary.main}, ${colors.secondary.main})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  
  [theme.breakpoints.down('md')]: {
    fontSize: '2rem',
  },
  
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.75rem',
  },
}));

const SectionSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.125rem',
  color: colors.text.secondary,
  textAlign: 'center',
  marginBottom: theme.spacing(6),
  maxWidth: 900,
  marginLeft: 'auto',
  marginRight: 'auto',
  lineHeight: 1.8,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  display: 'block',
  
  [theme.breakpoints.down('sm')]: {
    fontSize: '1rem',
    marginBottom: theme.spacing(4),
    maxWidth: '100%',
  },
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 16,
  border: `1px solid ${alpha(colors.primary.main, 0.1)}`,
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${colors.primary.main}, ${colors.secondary.main})`,
    transform: 'scaleX(0)',
    transformOrigin: 'left',
    transition: 'transform 0.3s ease-in-out',
  },
  
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 12px 32px ${alpha(colors.primary.main, 0.15)}`,
    borderColor: colors.primary.main,
    
    '&::before': {
      transform: 'scaleX(1)',
    },
  },
}));

const FeatureIcon = styled(Box)(({ theme }) => ({
  width: 64,
  height: 64,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(colors.primary.main, 0.1)}, ${alpha(colors.secondary.main, 0.1)})`,
  border: `2px solid ${alpha(colors.primary.main, 0.2)}`,
  
  '& .MuiSvgIcon-root': {
    fontSize: '2rem',
    color: colors.primary.main,
  },
}));

const StatCard = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(3),
  borderRadius: 12,
  background: `linear-gradient(135deg, ${alpha(colors.primary.main, 0.05)}, ${alpha(colors.secondary.main, 0.05)})`,
  border: `1px solid ${alpha(colors.primary.main, 0.1)}`,
  
  '& .stat-number': {
    fontSize: '2.5rem',
    fontWeight: 700,
    color: colors.primary.main,
    display: 'block',
    marginBottom: theme.spacing(1),
    
    [theme.breakpoints.down('sm')]: {
      fontSize: '2rem',
    },
  },
  
  '& .stat-label': {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  
  '& .stat-description': {
    fontSize: '0.75rem',
    color: colors.text.secondary,
    marginTop: theme.spacing(0.5),
  },
}));

const TestimonialCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  border: `1px solid ${alpha(colors.primary.main, 0.1)}`,
  background: `linear-gradient(135deg, ${alpha(colors.primary.main, 0.02)}, ${alpha(colors.secondary.main, 0.02)})`,
  height: '100%',
  
  '& .testimonial-text': {
    fontSize: '1rem',
    fontStyle: 'italic',
    color: colors.text.primary,
    marginBottom: theme.spacing(2),
    lineHeight: 1.6,
  },
  
  '& .testimonial-author': {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
}));

// Animation hook for counting numbers
const useCountUp = (end: number, duration: number = 2000, start: number = 0) => {
  const [count, setCount] = useState(start);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * (end - start) + start));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isVisible, end, duration, start]);

  return { count, ref };
};

// Feature data
const features = [
  {
    id: 'search',
    icon: SearchIcon,
    title: 'Comprehensive CTRI Search',
    description: 'Access complete Indian clinical trials database with advanced filtering and real-time results.',
    benefits: ['12,000+ CTRI trials', 'Advanced filtering', 'Real-time search', 'Location-based results'],
    demoType: 'search' as const,
  },
  {
    id: 'ai-generation',
    icon: AIIcon,
    title: 'AI Document Generation',
    description: 'Generate professional research summaries and literature reviews with GPT-4 powered AI.',
    benefits: ['GPT-4 powered', 'Multiple templates', 'AMA citations', 'Real-time streaming'],
    demoType: 'document' as const,
  },
  {
    id: 'patient-matching',
    icon: MatchingIcon,
    title: 'Patient-Trial Matching',
    description: 'AI-powered eligibility screening with confidence scoring for optimal patient-trial matches.',
    benefits: ['AI eligibility screening', 'Confidence scoring', 'Geographic matching', 'Physician oversight'],
    demoType: 'matching' as const,
  },
  {
    id: 'performance',
    icon: SpeedIcon,
    title: 'Lightning Fast Performance',
    description: 'Optimized for speed with sub-500ms search results and progressive web app capabilities.',
    benefits: ['<500ms search', 'Offline capability', 'PWA support', 'Mobile optimized'],
    demoType: 'performance' as const,
  },
  {
    id: 'security',
    icon: SecurityIcon,
    title: 'Medical-Grade Security',
    description: 'CDSCO compliant with enterprise-grade security and privacy protection for medical data.',
    benefits: ['CDSCO compliant', 'AES-256 encryption', 'Role-based access', 'Audit trails'],
    demoType: 'security' as const,
  },
  {
    id: 'multilingual',
    icon: LanguageIcon,
    title: 'Multi-language Support',
    description: 'Native support for English and Hindi with medical terminology translation capabilities.',
    benefits: ['English & Hindi', 'Medical terminology', 'Voice input', 'Regional support'],
    demoType: 'language' as const,
  },
];

// Statistics data
const statistics = [
  {
    number: 12000,
    suffix: '+',
    label: 'CTRI Trials',
    description: 'Complete database coverage',
    icon: HospitalIcon,
  },
  {
    number: 500,
    suffix: '+',
    label: 'Medical Centers',
    description: 'Across India',
    icon: GroupsIcon,
  },
  {
    number: 50,
    suffix: '+',
    label: 'Specialties',
    description: 'Medical conditions covered',
    icon: TrendingUpIcon,
  },
  {
    number: 95,
    suffix: '%',
    label: 'Accuracy Rate',
    description: 'AI matching precision',
    icon: AIIcon,
  },
];

// Testimonials data
const testimonials = [
  {
    id: 1,
    text: "This platform has revolutionized how I find relevant clinical trials for my patients. The AI matching is incredibly accurate and saves me hours of research time.",
    author: "Dr. Priya Sharma",
    role: "Oncologist",
    hospital: "AIIMS Delhi",
    avatar: "PS",
    rating: 5,
  },
  {
    id: 2,
    text: "The document generation feature is a game-changer for our research team. We can create comprehensive literature reviews in minutes instead of days.",
    author: "Dr. Rajesh Kumar",
    role: "Clinical Researcher",
    hospital: "PGIMER Chandigarh",
    avatar: "RK",
    rating: 5,
  },
  {
    id: 3,
    text: "As a busy physician, I appreciate how quickly I can search through thousands of trials and find exactly what I need for my patients. The interface is intuitive and professional.",
    author: "Dr. Anita Patel",
    role: "Cardiologist",
    hospital: "KEM Hospital Mumbai",
    avatar: "AP",
    rating: 5,
  },
];

interface FeaturesShowcaseProps {
  onFeatureDemo?: (featureId: string) => void;
}

export const FeaturesShowcase: React.FC<FeaturesShowcaseProps> = ({
  onFeatureDemo,
}) => {
  // Removed unused theme and isMobile variables
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);
  const [visibleFeatures, setVisibleFeatures] = useState<Set<string>>(new Set());

  // Intersection observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const featureId = entry.target.getAttribute('data-feature-id');
            if (featureId) {
              setVisibleFeatures(prev => new Set([...prev, featureId]));
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    const featureElements = document.querySelectorAll('[data-feature-id]');
    featureElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleFeatureClick = (feature: typeof features[0]) => {
    setSelectedDemo(feature.id);
    if (onFeatureDemo) {
      onFeatureDemo(feature.id);
    }
  };

  const handleCloseDemo = () => {
    setSelectedDemo(null);
  };

  return (
    <ShowcaseContainer maxWidth="lg">
      {/* Section Header */}
      <Fade in timeout={800}>
        <Box>
          <SectionTitle variant="h2">
            Powerful Features for Medical Professionals
          </SectionTitle>
          <SectionSubtitle>
            Discover how our AI-powered platform transforms clinical research workflows with cutting-edge technology designed specifically for Indian healthcare.
          </SectionSubtitle>
        </Box>
      </Fade>

      {/* Features Grid */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, 
        gap: 4, 
        mb: 8 
      }}>
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          const isVisible = visibleFeatures.has(feature.id);
          
          return (
            <Box key={feature.id}>
              <Grow
                in={isVisible}
                timeout={600}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div data-feature-id={feature.id}>
                  <FeatureCard onClick={() => handleFeatureClick(feature)}>
                    <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <FeatureIcon>
                        <IconComponent />
                      </FeatureIcon>
                      
                      <Typography 
                        variant="h5" 
                        component="h3" 
                        sx={{ 
                          mb: 2, 
                          fontWeight: 600,
                          fontSize: { xs: '1.25rem', sm: '1.5rem' },
                          lineHeight: 1.3,
                        }}
                      >
                        {feature.title}
                      </Typography>
                      
                      <Typography 
                        variant="body1" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 3, 
                          lineHeight: 1.6,
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                        }}
                      >
                        {feature.description}
                      </Typography>
                      
                      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {feature.benefits.map((benefit, idx) => (
                          <Chip
                            key={idx}
                            label={benefit}
                            size="small"
                            sx={{
                              backgroundColor: alpha(colors.primary.main, 0.1),
                              color: colors.primary.dark,
                              fontSize: '0.75rem',
                              height: 'auto',
                              '& .MuiChip-label': {
                                whiteSpace: 'normal',
                                padding: '4px 8px',
                                lineHeight: 1.4,
                              },
                            }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                    
                    <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
                      <Button
                        variant="outlined"
                        startIcon={<PlayIcon />}
                        fullWidth
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 500,
                        }}
                      >
                        Try Interactive Demo
                      </Button>
                    </CardActions>
                  </FeatureCard>
                </div>
              </Grow>
            </Box>
          );
        })}
      </Box>

      {/* Statistics Section */}
      <Fade in timeout={1000}>
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" component="h3" sx={{ textAlign: 'center', mb: 4, fontWeight: 600 }}>
            Platform Statistics
          </Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
            gap: 3 
          }}>
            {statistics.map((stat, index) => {
              const { count, ref } = useCountUp(stat.number, 2000);
              const IconComponent = stat.icon;
              
              return (
                <Box key={index}>
                  <StatCard ref={ref}>
                    <IconComponent sx={{ fontSize: '2rem', color: colors.primary.main, mb: 1 }} />
                    <Typography className="stat-number">
                      {count.toLocaleString()}{stat.suffix}
                    </Typography>
                    <Typography className="stat-label">
                      {stat.label}
                    </Typography>
                    <Typography className="stat-description">
                      {stat.description}
                    </Typography>
                  </StatCard>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Fade>

      {/* Testimonials Section */}
      <Fade in timeout={1200}>
        <Box>
          <Typography variant="h4" component="h3" sx={{ textAlign: 'center', mb: 4, fontWeight: 600 }}>
            What Medical Professionals Say
          </Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
            gap: 4 
          }}>
            {testimonials.map((testimonial, index) => (
              <Box key={testimonial.id}>
                <Grow in timeout={800} style={{ transitionDelay: `${index * 200}ms` }}>
                  <TestimonialCard>
                    <CardContent>
                      <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                      
                      <Typography className="testimonial-text">
                        "{testimonial.text}"
                      </Typography>
                      
                      <Box className="testimonial-author">
                        <Avatar sx={{ bgcolor: colors.primary.main }}>
                          {testimonial.avatar}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {testimonial.author}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {testimonial.role}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {testimonial.hospital}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </TestimonialCard>
                </Grow>
              </Box>
            ))}
          </Box>
        </Box>
      </Fade>

      {/* Demo Dialog */}
      <Dialog
        open={!!selectedDemo}
        onClose={handleCloseDemo}
        maxWidth="lg"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            minHeight: '60vh',
          },
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={handleCloseDemo}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              zIndex: 1,
            }}
          >
            <CloseIcon />
          </IconButton>
          
          <DialogContent sx={{ p: 4 }}>
            {selectedDemo && (
              <DemoContent featureId={selectedDemo} />
            )}
          </DialogContent>
        </Box>
      </Dialog>
    </ShowcaseContainer>
  );
};

// Demo content component
const DemoContent: React.FC<{ featureId: string }> = ({ featureId }) => {
  const feature = features.find(f => f.id === featureId);
  
  if (!feature) return null;

  // Dynamically render demo components based on feature type
  const renderDemo = () => {
    try {
      switch (feature.demoType) {
        case 'search': {
          const SearchDemo = React.lazy(() => import('../examples/SearchDemo'));
          return (
            <React.Suspense fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            }>
              <SearchDemo />
            </React.Suspense>
          );
        }
        case 'document': {
          const SimpleDocumentDemo = React.lazy(() => import('../examples/SimpleDocumentDemo'));
          return (
            <React.Suspense fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            }>
              <SimpleDocumentDemo />
            </React.Suspense>
          );
        }
        case 'matching': {
          const PatientMatchingDemo = React.lazy(() => import('../examples/PatientMatchingDemo'));
          return (
            <React.Suspense fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            }>
              <PatientMatchingDemo />
            </React.Suspense>
          );
        }
        case 'performance': {
          const PerformanceDemo = React.lazy(() => import('../examples/PerformanceDemo'));
          return (
            <React.Suspense fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            }>
              <PerformanceDemo />
            </React.Suspense>
          );
        }
        default:
          return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h4" gutterBottom>
                {feature.title} Demo
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Interactive demo for {feature.title.toLowerCase()} coming soon.
              </Typography>
              
              <Box sx={{ 
                minHeight: 300, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: alpha(colors.primary.main, 0.05),
                borderRadius: 2,
                border: `2px dashed ${alpha(colors.primary.main, 0.2)}`,
              }}>
                <Typography variant="h6" color="text.secondary">
                  {feature.title} Interactive Demo
                </Typography>
              </Box>
            </Box>
          );
      }
    } catch (error) {
      console.error('Error loading demo component:', error);
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h5" gutterBottom color="error">
            Demo Temporarily Unavailable
          </Typography>
          <Typography variant="body1" color="text.secondary">
            We're working on bringing you this interactive demo. Please try again later.
          </Typography>
        </Box>
      );
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
        {feature.title} Demo
      </Typography>
      {renderDemo()}
    </Box>
  );
};

export default FeaturesShowcase;