import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Grid,
  Chip,
  alpha,
  Container,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ArrowForward as ArrowIcon,
  CheckCircle as CheckIcon,
  AutoAwesome as AIIcon,
  Shield as ShieldIcon,
  Speed as SpeedIcon,
  Public as GlobalIcon,
  TrendingUp as TrendIcon,
  Groups as GroupsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { LifecyclePipeline } from '../layout/LifecyclePipeline';
import { TRIAL_STAGES } from '../../constants/trialStages';
import { TopNavigation } from '../layout/TopNavigation';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from '../auth/AuthModal';

// ── Hero ─────────────────────────────────────────────────────────────────────

const HeroSection: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(150deg, #050E1F 0%, #0A1E42 40%, #08173A 70%, #050E1F 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        px: { xs: 2, md: 4 },
        pt: 12,
        pb: 8,
      }}
    >
      {/* Background dot grid */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.04) 1.5px, transparent 0)',
          backgroundSize: '44px 44px',
          pointerEvents: 'none',
        }}
      />

      {/* Ambient glow orbs */}
      <Box sx={{ position: 'absolute', top: '15%', left: '8%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,71,171,0.25) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: '10%', right: '6%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,137,123,0.2) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      {/* Badge */}
      <Chip
        icon={<AIIcon sx={{ fontSize: '0.9rem !important', color: '#00BFA5 !important' }} />}
        label="India's First End-to-End Clinical Trial Platform"
        sx={{ mb: 4, backgroundColor: 'rgba(0,191,165,0.1)', border: '1px solid rgba(0,191,165,0.25)', color: '#00BFA5', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.02em', px: 1, height: 32 }}
      />

      {/* Headline */}
      <Typography
        component="h1"
        sx={{
          fontSize: { xs: '2.6rem', sm: '3.5rem', md: '4.5rem', lg: '5rem' },
          fontWeight: 800,
          color: '#ffffff',
          textAlign: 'center',
          lineHeight: 1.08,
          letterSpacing: '-0.03em',
          maxWidth: 900,
          mb: 3,
        }}
      >
        Run Smarter{' '}
        <Box component="span" sx={{ background: 'linear-gradient(90deg, #4FC3F7 0%, #00BFA5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Clinical Trials
        </Box>
        <br />in India
      </Typography>

      {/* Sub-headline */}
      <Typography sx={{ fontSize: { xs: '1rem', md: '1.2rem' }, color: 'rgba(255,255,255,0.62)', textAlign: 'center', maxWidth: 620, lineHeight: 1.7, mb: 5 }}>
        From your first research question to final regulatory submission — AI-powered,
        CTRI-compliant, and built specifically for Indian physicians.
      </Typography>

      {/* CTAs */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={8}>
        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowIcon />}
          onClick={onGetStarted}
          sx={{ background: 'linear-gradient(135deg, #0047AB 0%, #00897B 100%)', color: '#ffffff', fontWeight: 700, fontSize: '1rem', px: 4, py: 1.5, borderRadius: 2.5, boxShadow: '0 8px 32px rgba(0,71,171,0.4)', '&:hover': { boxShadow: '0 12px 40px rgba(0,71,171,0.5)', transform: 'translateY(-2px)' }, transition: 'all 0.2s ease' }}
        >
          Start Your Trial
        </Button>
        <Button
          variant="outlined"
          size="large"
          sx={{ borderColor: 'rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.85)', fontWeight: 500, fontSize: '1rem', px: 4, py: 1.5, borderRadius: 2.5, '&:hover': { borderColor: 'rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.05)' } }}
        >
          See How It Works
        </Button>
      </Stack>

      {/* Pipeline visual card */}
      <Box sx={{ width: '100%', maxWidth: 1100, backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, p: { xs: 2, md: 3 }, backdropFilter: 'blur(8px)' }}>
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 2, textAlign: 'center' }}>
          The Complete Trial Journey
        </Typography>
        <LifecyclePipeline variant="hero" />
      </Box>

      {/* Stats row */}
      {!isMobile && (
        <Stack direction="row" spacing={4} mt={6} sx={{ borderTop: '1px solid rgba(255,255,255,0.08)', pt: 4, width: '100%', maxWidth: 800, justifyContent: 'center' }}>
          {[{ value: '150+', label: 'Validation Rules' }, { value: '6', label: 'Compliance Frameworks' }, { value: 'CTRI', label: 'Native Integration' }, { value: '1', label: 'Platform. Everything.' }].map((s) => (
            <Box key={s.label} sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: '#4FC3F7', lineHeight: 1 }}>{s.value}</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', mt: 0.5 }}>{s.label}</Typography>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
};

// ── Journey section ───────────────────────────────────────────────────────────

const JourneySection: React.FC = () => (
  <Box sx={{ backgroundColor: '#ffffff', py: { xs: 8, md: 12 }, px: { xs: 2, md: 4 } }}>
    <Container maxWidth="lg">
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Chip label="The Journey" sx={{ mb: 2, backgroundColor: '#EFF6FF', color: '#0047AB', fontWeight: 600, fontSize: '0.75rem' }} />
        <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, fontWeight: 800, color: '#0A1628', mb: 2, letterSpacing: '-0.02em' }}>
          Six stages. One platform.
        </Typography>
        <Typography sx={{ fontSize: '1.1rem', color: '#546E7A', maxWidth: 560, mx: 'auto', lineHeight: 1.7 }}>
          Every phase of your clinical trial — from the first literature search to final
          regulatory submission — integrated and AI-powered.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {TRIAL_STAGES.map((stage, i) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={stage.id}>
            <Box
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 3,
                border: '1px solid #E8EDF5',
                backgroundColor: '#ffffff',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.25s ease',
                '&:hover': { borderColor: stage.color, boxShadow: `0 8px 32px ${alpha(stage.color, 0.12)}`, transform: 'translateY(-4px)' },
              }}
            >
              <Typography sx={{ position: 'absolute', top: 12, right: 18, fontSize: '2.5rem', fontWeight: 900, color: alpha(stage.color, 0.07), lineHeight: 1 }}>
                {i + 1}
              </Typography>
              <Box sx={{ width: 44, height: 44, borderRadius: 2, backgroundColor: stage.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <stage.Icon sx={{ fontSize: 22, color: stage.color }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0A1628', mb: 1 }}>{stage.label}</Typography>
              <Typography sx={{ fontSize: '0.875rem', color: '#546E7A', lineHeight: 1.6 }}>{stage.description}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Container>
  </Box>
);

// ── Features section ──────────────────────────────────────────────────────────

const FEATURES = [
  {
    Icon: AIIcon,
    color: '#7C3AED',
    title: 'AI Research Intelligence',
    description: 'Ask any clinical question. NexTrial synthesises PubMed, CTRI and ICMR archives to deliver a research-grade landscape analysis in minutes, not weeks.',
    points: ['PubMed + CTRI + ICMR synthesis', 'Semantic literature search', 'Auto-citation management'],
  },
  {
    Icon: ShieldIcon,
    color: '#0047AB',
    title: 'Compliance Built In',
    description: 'Every protocol section validated against ICH M11, ICMR ethical guidelines, CDSCO Form 44 requirements and GCP-ICH E6 R2 — invisibly, in real time.',
    points: ['CTRI registration wizard', 'CDSCO Form 44 prep', 'GCP-ICH E6 R2 checks'],
  },
  {
    Icon: GroupsIcon,
    color: '#059669',
    title: 'India-First EDC',
    description: 'Design your eCRF, enroll patients with geographic proximity scoring, collect data in Hindi/Tamil/Bengali, and maintain a full audit trail — all in one place.',
    points: ['eCRF builder for PIs', 'Multi-language data entry', 'Full audit trail & query management'],
  },
];

const FeaturesSection: React.FC = () => (
  <Box sx={{ backgroundColor: '#F7F9FC', py: { xs: 8, md: 12 }, px: { xs: 2, md: 4 } }}>
    <Container maxWidth="lg">
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Chip label="Platform Features" sx={{ mb: 2, backgroundColor: '#E0F2F1', color: '#00695C', fontWeight: 600, fontSize: '0.75rem' }} />
        <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, fontWeight: 800, color: '#0A1628', mb: 2, letterSpacing: '-0.02em' }}>
          Everything a PI needs
        </Typography>
        <Typography sx={{ fontSize: '1.1rem', color: '#546E7A', maxWidth: 520, mx: 'auto' }}>
          No more switching between tools. No more manual compliance checks. No more Excel trackers.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {FEATURES.map(({ Icon, color, title, description, points }) => (
          <Grid size={{ xs: 12, md: 4 }} key={title}>
            <Box
              sx={{
                p: 4,
                height: '100%',
                borderRadius: 3,
                backgroundColor: '#ffffff',
                border: '1px solid #E8EDF5',
                transition: 'all 0.25s ease',
                '&:hover': { boxShadow: `0 12px 40px ${alpha(color, 0.1)}`, transform: 'translateY(-4px)', borderColor: alpha(color, 0.3) },
              }}
            >
              <Box sx={{ width: 52, height: 52, borderRadius: 2.5, backgroundColor: alpha(color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
                <Icon sx={{ fontSize: 26, color }} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#0A1628', mb: 1.5 }}>{title}</Typography>
              <Typography sx={{ fontSize: '0.9rem', color: '#546E7A', lineHeight: 1.7, mb: 2.5 }}>{description}</Typography>
              <Stack spacing={1}>
                {points.map((p) => (
                  <Box key={p} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckIcon sx={{ fontSize: 16, color, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.85rem', color: '#0A1628', fontWeight: 500 }}>{p}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Container>
  </Box>
);

// ── India-first section ───────────────────────────────────────────────────────

const IndiaSection: React.FC = () => (
  <Box sx={{ background: 'linear-gradient(135deg, #0A1628 0%, #0D2E5F 100%)', py: { xs: 8, md: 12 }, px: { xs: 2, md: 4 } }}>
    <Container maxWidth="lg">
      <Grid container spacing={6} alignItems="center">
        <Grid size={{ xs: 12, md: 6 }}>
          <Chip label="India-First Design" sx={{ mb: 3, backgroundColor: 'rgba(255,203,71,0.15)', color: '#FFCB47', fontWeight: 600, fontSize: '0.75rem', border: '1px solid rgba(255,203,71,0.25)' }} />
          <Typography sx={{ fontSize: { xs: '1.8rem', md: '2.5rem' }, fontWeight: 800, color: '#ffffff', mb: 2, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Built for India's clinical trial ecosystem
          </Typography>
          <Typography sx={{ fontSize: '1rem', color: 'rgba(255,255,255,0.62)', lineHeight: 1.8, mb: 4 }}>
            Western tools don't understand CTRI, CDSCO, or how a physician in Pune runs a trial
            differently from one in Munich. NexTrial does.
          </Typography>
          <Stack spacing={2}>
            {[
              { Icon: GlobalIcon, text: "CTRI-native — India's trial registry is the primary source, not an afterthought" },
              { Icon: ShieldIcon, text: 'CDSCO Form 44, ICMR ethics guidelines, Schedule Y compliance baked in' },
              { Icon: SpeedIcon, text: 'Hindi, Tamil, Bengali data entry for site coordinators across India' },
              { Icon: TrendIcon, text: 'Geographic proximity scoring for patient recruitment using Indian pincodes' },
            ].map(({ Icon, text }) => (
              <Box key={text} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: 1.5, backgroundColor: 'rgba(0,191,165,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.25 }}>
                  <Icon sx={{ fontSize: 15, color: '#00BFA5' }} />
                </Box>
                <Typography sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>{text}</Typography>
              </Box>
            ))}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Grid container spacing={2}>
            {[
              { value: '$3.38B', label: 'Indian clinical trials market', sub: 'Growing at 8.1% CAGR' },
              { value: '1.4M+', label: 'Indian physicians', sub: 'With no integrated trial tool' },
              { value: '60–70%', label: 'Lower pricing', sub: 'vs. Western alternatives' },
              { value: '6', label: 'Compliance frameworks', sub: 'All built in. Automatically.' },
            ].map(({ value, label, sub }) => (
              <Grid size={6} key={label}>
                <Box sx={{ p: 3, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', height: '100%' }}>
                  <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#4FC3F7', lineHeight: 1, mb: 0.5 }}>{value}</Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 600, mb: 0.5 }}>{label}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>{sub}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  </Box>
);

// ── CTA section ───────────────────────────────────────────────────────────────

const CTASection: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => (
  <Box sx={{ backgroundColor: '#ffffff', py: { xs: 8, md: 12 }, px: { xs: 2, md: 4 }, textAlign: 'center' }}>
    <Container maxWidth="md">
      <Typography sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 800, color: '#0A1628', mb: 2, letterSpacing: '-0.02em' }}>
        Ready to run your first trial?
      </Typography>
      <Typography sx={{ fontSize: '1.1rem', color: '#546E7A', mb: 5, maxWidth: 500, mx: 'auto', lineHeight: 1.7 }}>
        Join Indian physicians moving their clinical research from scattered spreadsheets and guesswork
        to one intelligent platform.
      </Typography>
      <Button
        variant="contained"
        size="large"
        endIcon={<ArrowIcon />}
        onClick={onGetStarted}
        sx={{ background: 'linear-gradient(135deg, #0047AB 0%, #00897B 100%)', color: '#ffffff', fontWeight: 700, fontSize: '1.05rem', px: 5, py: 1.75, borderRadius: 2.5, boxShadow: '0 8px 32px rgba(0,71,171,0.3)', '&:hover': { boxShadow: '0 12px 40px rgba(0,71,171,0.45)', transform: 'translateY(-2px)' }, transition: 'all 0.2s ease' }}
      >
        Start Your Trial — Free
      </Button>
      <Typography sx={{ mt: 2, fontSize: '0.8rem', color: '#90A4AE' }}>
        No credit card required. CTRI-compliant from day one.
      </Typography>
    </Container>
  </Box>
);

// ── Footer ────────────────────────────────────────────────────────────────────

const LandingFooter: React.FC = () => (
  <Box sx={{ backgroundColor: '#0A1628', py: 4, px: { xs: 2, md: 4 } }}>
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 28, height: 28, borderRadius: '7px', background: 'linear-gradient(135deg, #0047AB 0%, #00897B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.9rem' }}>N</Typography>
          </Box>
          <Typography sx={{ fontWeight: 700, color: '#ffffff', fontSize: '1rem' }}>NexTrial</Typography>
        </Box>
        <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>
          © 2026 NexTrial. India's Clinical Trial Platform.
        </Typography>
      </Box>
    </Container>
  </Box>
);

// ── Root export ───────────────────────────────────────────────────────────────

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      setAuthOpen(true);
    }
  };

  return (
    <Box>
      {/* Nav over the dark hero */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, backgroundColor: 'transparent' }}>
        <TopNavigation />
      </Box>

      <HeroSection onGetStarted={handleGetStarted} />
      <JourneySection />
      <FeaturesSection />
      <IndiaSection />
      <CTASection onGetStarted={handleGetStarted} />
      <LandingFooter />

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </Box>
  );
};

export default LandingPage;
