import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Chip, CircularProgress, alpha,
  IconButton, Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  AutoAwesome as AIIcon,
  OpenInNew as ExternalIcon,
  ArrowBack as BackIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Language as LangIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { TopNavigation } from '../components/layout';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PatientProfile {
  condition: string;
  age: number | null;
  gender: string | null;
  location: string | null;
  city: string | null;
  state: string | null;
  keyFindings: string[];
  searchQuery: string;
}

interface TrialMatch {
  nctId: string;
  title: string;
  status: string;
  phase: string;
  condition: string;
  intervention: string;
  enrollment: number;
  sponsor: string;
  startDate: string | null;
  description: string;
  confidenceScore: number;
  confidenceLabel: 'excellent' | 'good' | 'possible' | 'low';
  languages: string[];
  geographicNote: string;
  url: string;
}

interface MatchResult {
  profile: PatientProfile;
  matches: TrialMatch[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const EXAMPLES = [
  '58-year-old female, Stage IIIA non-small cell lung cancer (NSCLC), EGFR exon 19 deletion positive, progressed on first-line erlotinib, ECOG PS 1, based in Mumbai, Maharashtra. Seeking second-line targeted therapy options.',
  '42-year-old male, Type 2 Diabetes Mellitus, HbA1c 9.4%, eGFR 68 mL/min, on metformin 1g BD + glimepiride 2mg OD, BMI 31, located in Bengaluru, Karnataka. Inadequate glycaemic control, exploring newer agents.',
  '35-year-old female, relapsing-remitting multiple sclerosis (RRMS), 2 relapses in past 12 months, MRI shows 4 new T2 lesions, currently on interferon beta-1a, based in Hyderabad, Telangana. Considering escalation therapy.',
];

const LOADING_STEPS = [
  { label: 'Extracting patient profile…',       sub: 'AI reads condition, age, location, key findings' },
  { label: 'Searching ClinicalTrials.gov…',     sub: 'Querying active recruiting trials worldwide'      },
  { label: 'Scoring eligibility matches…',      sub: 'Ranking trials by condition fit and proximity'    },
];

const CONFIDENCE_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  excellent: { color: '#059669', bg: '#ECFDF5', label: 'Excellent match' },
  good:      { color: '#0047AB', bg: '#EFF6FF', label: 'Good match'      },
  possible:  { color: '#D97706', bg: '#FFFBEB', label: 'Possible match'  },
  low:       { color: '#78909C', bg: '#F3F4F6', label: 'Low match'       },
};

// ── Sub-components ────────────────────────────────────────────────────────────

const LoadingView: React.FC<{ step: number }> = ({ step }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10 }}>
    <Box
      sx={{
        width: 56,
        height: 56,
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #7C3AED 0%, #0047AB 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 3,
      }}
    >
      <AIIcon sx={{ color: '#fff', fontSize: 28 }} />
    </Box>

    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%', maxWidth: 480 }}>
      {LOADING_STEPS.map((s, i) => {
        const done    = i < step;
        const active  = i === step;
        const pending = i > step;
        return (
          <Box
            key={i}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2,
              p: 2,
              borderRadius: 3,
              backgroundColor: active ? alpha('#7C3AED', 0.06) : 'transparent',
              border: active ? `1px solid ${alpha('#7C3AED', 0.2)}` : '1px solid transparent',
              opacity: pending ? 0.35 : 1,
              transition: 'all 0.3s ease',
            }}
          >
            <Box sx={{ flexShrink: 0, mt: 0.25 }}>
              {done ? (
                <CheckIcon sx={{ fontSize: 20, color: '#059669' }} />
              ) : active ? (
                <CircularProgress size={20} sx={{ color: '#7C3AED' }} />
              ) : (
                <Box sx={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #D0D9E8' }} />
              )}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: done || active ? 600 : 400, fontSize: '0.9rem', color: '#0A1628' }}>
                {s.label}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#78909C', mt: 0.25 }}>{s.sub}</Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  </Box>
);

const ProfileCard: React.FC<{ profile: PatientProfile; onReset: () => void }> = ({ profile, onReset }) => (
  <Box
    sx={{
      width: { xs: '100%', md: 300 },
      flexShrink: 0,
      border: '1px solid #E8EDF5',
      borderRadius: 3,
      backgroundColor: '#ffffff',
      overflow: 'hidden',
      alignSelf: 'flex-start',
      position: 'sticky',
      top: 16,
    }}
  >
    {/* Header */}
    <Box sx={{ p: 2.5, borderBottom: '1px solid #E8EDF5', background: 'linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(0,71,171,0.04) 100%)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Patient Profile
        </Typography>
        <Tooltip title="New search">
          <IconButton size="small" onClick={onReset} sx={{ color: '#90A4AE' }}>
            <BackIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>
      <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0A1628', lineHeight: 1.35 }}>
        {profile.condition}
      </Typography>
    </Box>

    {/* Details */}
    <Box sx={{ p: 2.5 }}>
      {/* Age + Gender */}
      {(profile.age || profile.gender) && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {profile.age && (
            <Chip
              icon={<PersonIcon sx={{ fontSize: '13px !important' }} />}
              label={`${profile.age} yrs`}
              size="small"
              sx={{ fontSize: '0.72rem', fontWeight: 600, backgroundColor: '#F7F9FC' }}
            />
          )}
          {profile.gender && (
            <Chip
              label={profile.gender}
              size="small"
              sx={{ fontSize: '0.72rem', fontWeight: 600, backgroundColor: '#F7F9FC' }}
            />
          )}
        </Box>
      )}

      {/* Location */}
      {profile.location && (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
          <LocationIcon sx={{ fontSize: 15, color: '#78909C', mt: 0.15, flexShrink: 0 }} />
          <Typography sx={{ fontSize: '0.8rem', color: '#546E7A' }}>{profile.location}</Typography>
        </Box>
      )}

      {/* Key findings */}
      {profile.keyFindings.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#90A4AE', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1 }}>
            Key findings
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {profile.keyFindings.map((f, i) => (
              <Chip
                key={i}
                label={f}
                size="small"
                sx={{
                  fontSize: '0.68rem',
                  height: 20,
                  backgroundColor: alpha('#7C3AED', 0.07),
                  color: '#5B21B6',
                  fontWeight: 500,
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Language */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
          <LangIcon sx={{ fontSize: 14, color: '#78909C' }} />
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#90A4AE', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Language support
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {(profile.location
            ? LANG_FOR_LOCATION(profile.location)
            : ['Hindi', 'English']
          ).map(l => (
            <Chip key={l} label={l} size="small" sx={{ fontSize: '0.65rem', height: 18, backgroundColor: '#E0F2F1', color: '#00695C', fontWeight: 600 }} />
          ))}
        </Box>
      </Box>
    </Box>
  </Box>
);

// Derive languages on the frontend too for ProfileCard display
function LANG_FOR_LOCATION(location: string): string[] {
  const l = location.toLowerCase();
  const map: Record<string, string[]> = {
    mumbai: ['Marathi', 'Hindi', 'English'],
    delhi: ['Hindi', 'English', 'Punjabi'],
    bengaluru: ['Kannada', 'English'],
    bangalore: ['Kannada', 'English'],
    chennai: ['Tamil', 'English'],
    hyderabad: ['Telugu', 'Urdu', 'English'],
    kolkata: ['Bengali', 'Hindi', 'English'],
    pune: ['Marathi', 'Hindi', 'English'],
    ahmedabad: ['Gujarati', 'Hindi'],
    kerala: ['Malayalam', 'English'],
    karnataka: ['Kannada', 'English'],
    'tamil nadu': ['Tamil', 'English'],
    maharashtra: ['Marathi', 'Hindi', 'English'],
    gujarat: ['Gujarati', 'Hindi'],
    telangana: ['Telugu', 'Urdu', 'English'],
  };
  for (const [key, langs] of Object.entries(map)) {
    if (l.includes(key)) return langs;
  }
  return ['Hindi', 'English'];
}

const TrialCard: React.FC<{ trial: TrialMatch; rank: number }> = ({ trial, rank }) => {
  const cfg = CONFIDENCE_CONFIG[trial.confidenceLabel as keyof typeof CONFIDENCE_CONFIG] ?? CONFIDENCE_CONFIG['low'];

  const statusColor = (s: string) => {
    const u = s.toUpperCase();
    if (u === 'RECRUITING') return { color: '#059669', bg: '#ECFDF5' };
    if (u.includes('ACTIVE')) return { color: '#0047AB', bg: '#EFF6FF' };
    return { color: '#78909C', bg: '#F3F4F6' };
  };
  const sc = statusColor(trial.status);

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: rank === 0 ? alpha(cfg.color, 0.35) : '#E8EDF5',
        borderRadius: 3,
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: `0 8px 24px ${alpha('#0047AB', 0.08)}` },
      }}
    >
      {/* Top bar: score + status + phase */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          borderBottom: '1px solid #F0F4F8',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          flexWrap: 'wrap',
          backgroundColor: rank === 0 ? alpha(cfg.color, 0.025) : 'transparent',
        }}
      >
        {/* Confidence badge */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.5,
            py: 0.5,
            borderRadius: 10,
            backgroundColor: cfg.bg,
          }}
        >
          <Typography sx={{ fontWeight: 900, fontSize: '1rem', color: cfg.color, lineHeight: 1 }}>
            {trial.confidenceScore}
          </Typography>
          <Box>
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: cfg.color, lineHeight: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {cfg.label}
            </Typography>
          </Box>
        </Box>

        <Chip
          label={trial.status.replace(/_/g, ' ')}
          size="small"
          sx={{ fontSize: '0.68rem', fontWeight: 700, height: 20, backgroundColor: sc.bg, color: sc.color }}
        />
        {trial.phase && trial.phase !== 'N/A' && (
          <Chip
            label={trial.phase}
            size="small"
            sx={{ fontSize: '0.68rem', height: 20, backgroundColor: '#F0F4FF', color: '#0047AB', fontWeight: 600 }}
          />
        )}

        <Box sx={{ flex: 1 }} />

        <Button
          size="small"
          endIcon={<ExternalIcon sx={{ fontSize: '12px !important' }} />}
          href={trial.url}
          target="_blank"
          rel="noopener noreferrer"
          component="a"
          sx={{
            fontSize: '0.72rem',
            color: '#0047AB',
            fontWeight: 600,
            py: 0.25,
            px: 1,
            '&:hover': { backgroundColor: alpha('#0047AB', 0.06) },
          }}
        >
          {trial.nctId}
        </Button>
      </Box>

      {/* Body */}
      <Box sx={{ px: 2.5, py: 2 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0A1628', lineHeight: 1.45, mb: 0.75 }}>
          {trial.title}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1.5 }}>
          {trial.condition && trial.condition !== 'Not specified' && (
            <Typography sx={{ fontSize: '0.75rem', color: '#7C3AED', fontWeight: 600 }}>
              {trial.condition}
            </Typography>
          )}
          {trial.sponsor && trial.sponsor !== 'Not specified' && (
            <Typography sx={{ fontSize: '0.75rem', color: '#78909C' }}>
              {trial.sponsor}
            </Typography>
          )}
          {trial.enrollment > 0 && (
            <Typography sx={{ fontSize: '0.75rem', color: '#78909C' }}>
              n={trial.enrollment.toLocaleString()}
            </Typography>
          )}
        </Box>

        {trial.description && trial.description.length > 0 && (
          <Typography
            sx={{
              fontSize: '0.8rem',
              color: '#546E7A',
              lineHeight: 1.6,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 1.5,
            }}
          >
            {trial.description}
          </Typography>
        )}

        {/* Geographic + language note */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {trial.geographicNote && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocationIcon sx={{ fontSize: 13, color: '#B0BEC5' }} />
              <Typography sx={{ fontSize: '0.72rem', color: '#90A4AE' }}>{trial.geographicNote}</Typography>
            </Box>
          )}
          {trial.languages.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LangIcon sx={{ fontSize: 13, color: '#B0BEC5' }} />
              <Typography sx={{ fontSize: '0.72rem', color: '#90A4AE' }}>{trial.languages.join(' · ')}</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────

type PageState = 'idle' | 'loading' | 'results';

export const PatientMatchPage: React.FC = () => {
  const [state, setState] = useState<PageState>('idle');
  const [input, setInput] = useState('');
  const [loadStep, setLoadStep] = useState(0);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState('');
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Advance loading steps
  useEffect(() => {
    if (state === 'loading') {
      setLoadStep(0);
      stepTimer.current = setInterval(() => {
        setLoadStep(prev => Math.min(prev + 1, LOADING_STEPS.length - 1));
      }, 2200);
    } else {
      if (stepTimer.current) clearInterval(stepTimer.current);
    }
    return () => { if (stepTimer.current) clearInterval(stepTimer.current); };
  }, [state]);

  const handleSearch = async () => {
    if (!input.trim() || input.trim().length < 10) return;
    setError('');
    setState('loading');
    setLoadStep(0);

    try {
      const res = await fetch('http://localhost:3001/api/match/patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientDescription: input.trim() }),
      });
      const json = await res.json() as { success: boolean; data?: MatchResult; error?: string };
      if (!res.ok || !json.success) throw new Error(json.error ?? 'Match failed');
      setResult(json.data ?? null);
      setState('results');
    } catch (err) {
      const e = err as { message?: string };
      setError(e.message ?? 'Something went wrong. Make sure the backend server is running.');
      setState('idle');
    }
  };

  const handleReset = () => {
    setState('idle');
    setResult(null);
    setError('');
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  // ── Idle ─────────────────────────────────────────────────────────────────────

  if (state === 'idle') {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#F7F9FC' }}>
        <TopNavigation />

        <Box
          sx={{
            maxWidth: 720,
            mx: 'auto',
            px: { xs: 2, md: 4 },
            pt: { xs: 6, md: 10 },
            pb: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Hero */}
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #7C3AED 0%, #0047AB 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2.5,
            }}
          >
            <AIIcon sx={{ color: '#fff', fontSize: 26 }} />
          </Box>

          <Typography
            sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' }, fontWeight: 900, color: '#0A1628', textAlign: 'center', lineHeight: 1.2, mb: 1.5 }}
          >
            Patient-Trial Matching
          </Typography>
          <Typography sx={{ fontSize: '1rem', color: '#546E7A', textAlign: 'center', lineHeight: 1.7, mb: 4, maxWidth: 520 }}>
            Describe the patient in plain language. AI extracts the clinical profile and matches it against active recruiting trials.
          </Typography>

          {/* Input */}
          <Box sx={{ width: '100%', mb: 2 }}>
            <TextField
              inputRef={textareaRef}
              multiline
              fullWidth
              minRows={5}
              maxRows={10}
              placeholder="e.g. 58-year-old female, Stage III non-small cell lung cancer, EGFR exon 19 deletion positive, progressed on erlotinib, ECOG PS 1, based in Mumbai…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSearch();
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  fontSize: '0.9375rem',
                  lineHeight: 1.7,
                  '& fieldset': { borderColor: '#D0D9E8' },
                  '&:hover fieldset': { borderColor: '#B0BEC5' },
                  '&.Mui-focused fieldset': { borderColor: '#7C3AED', borderWidth: '1.5px' },
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
              <Typography sx={{ fontSize: '0.72rem', color: '#B0BEC5' }}>
                ⌘ Enter to search · Physician validates before any action is taken
              </Typography>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                disabled={input.trim().length < 10}
                sx={{
                  background: 'linear-gradient(135deg, #7C3AED 0%, #0047AB 100%)',
                  fontWeight: 700,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  boxShadow: '0 4px 16px rgba(124,58,237,0.25)',
                  '&:hover': { boxShadow: '0 8px 24px rgba(124,58,237,0.35)' },
                  '&.Mui-disabled': { opacity: 0.45 },
                }}
              >
                Find Trials
              </Button>
            </Box>
          </Box>

          {error && (
            <Box sx={{ width: '100%', p: 2, borderRadius: 2, backgroundColor: alpha('#DC2626', 0.06), border: '1px solid', borderColor: alpha('#DC2626', 0.2), mb: 2 }}>
              <Typography sx={{ fontSize: '0.85rem', color: '#DC2626' }}>{error}</Typography>
            </Box>
          )}

          {/* Example descriptions */}
          <Box sx={{ width: '100%' }}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#90A4AE', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1.5 }}>
              Example patients
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {EXAMPLES.map((ex, i) => (
                <Box
                  key={i}
                  onClick={() => setInput(ex)}
                  sx={{
                    p: 2,
                    border: '1px solid #E8EDF5',
                    borderRadius: 2,
                    cursor: 'pointer',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.15s',
                    '&:hover': { borderColor: '#7C3AED', backgroundColor: alpha('#7C3AED', 0.025) },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.82rem',
                      color: '#546E7A',
                      lineHeight: 1.6,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {ex}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────────

  if (state === 'loading') {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#F7F9FC' }}>
        <TopNavigation />
        <Box sx={{ maxWidth: 560, mx: 'auto', px: 2 }}>
          <LoadingView step={loadStep} />
        </Box>
      </Box>
    );
  }

  // ── Results ───────────────────────────────────────────────────────────────────

  if (!result) return null;

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F7F9FC' }}>
      <TopNavigation />

      {/* Results header */}
      <Box sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid #E8EDF5' }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 5 }, py: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Chip
                label="Patient-Trial Matching"
                size="small"
                sx={{ fontSize: '0.68rem', height: 20, backgroundColor: alpha('#7C3AED', 0.1), color: '#7C3AED', fontWeight: 700 }}
              />
              <Typography sx={{ fontSize: '0.75rem', color: '#90A4AE' }}>
                {result.matches.length} trial{result.matches.length !== 1 ? 's' : ''} found · Physician review required before any action
              </Typography>
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0A1628' }}>
              {result.profile.condition}
              {result.profile.age && ` · ${result.profile.age} yrs`}
              {result.profile.gender && ` · ${result.profile.gender}`}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<SearchIcon />}
            onClick={handleReset}
            sx={{ borderColor: '#D0D9E8', color: '#546E7A', fontWeight: 600, borderRadius: 2 }}
          >
            New search
          </Button>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 5 }, py: 4 }}>
        <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start', flexDirection: { xs: 'column', md: 'row' } }}>

          {/* Left: profile card */}
          <ProfileCard profile={result.profile} onReset={handleReset} />

          {/* Right: trial matches */}
          <Box sx={{ flex: 1 }}>
            {result.matches.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 10 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0A1628', mb: 1 }}>
                  No matching trials found
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', color: '#546E7A', mb: 3 }}>
                  Try rephrasing the patient description with more specific condition details, or check if the backend server is running.
                </Typography>
                <Button variant="outlined" onClick={handleReset} sx={{ borderRadius: 2 }}>
                  Try again
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {result.matches.map((trial, i) => (
                  <TrialCard key={trial.nctId} trial={trial} rank={i} />
                ))}

                <Box sx={{ textAlign: 'center', pt: 2, pb: 1 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: '#B0BEC5', lineHeight: 1.6 }}>
                    Results from ClinicalTrials.gov · AI-scored for eligibility fit · Physician must review eligibility criteria before enrolling any patient
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PatientMatchPage;
