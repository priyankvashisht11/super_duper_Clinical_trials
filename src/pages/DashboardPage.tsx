import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  alpha,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Science as ScienceIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  ArrowForward as ArrowIcon,
  AutoAwesome as AIIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { protocolService } from '../services/protocolService';
import type { Protocol, CreateProtocolInput } from '../services/protocolService';

// ── Helpers ───────────────────────────────────────────────────────────────────

const statusColor = (status: string) => {
  switch (status) {
    case 'draft': return { bg: '#FFF7ED', text: '#C2410C', label: 'Draft' };
    case 'active': return { bg: '#ECFDF5', text: '#065F46', label: 'Active' };
    case 'completed': return { bg: '#EFF6FF', text: '#1E40AF', label: 'Completed' };
    default: return { bg: '#F3F4F6', text: '#374151', label: status };
  }
};

const phaseColor = (phase?: string) => {
  if (!phase) return '#546E7A';
  if (phase.includes('1')) return '#7C3AED';
  if (phase.includes('2')) return '#0047AB';
  if (phase.includes('3')) return '#059669';
  if (phase.includes('4')) return '#D97706';
  return '#546E7A';
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// ── Stat card ─────────────────────────────────────────────────────────────────

const StatCard: React.FC<{ value: number | string; label: string; icon: React.ReactNode; color: string }> = ({ value, label, icon, color }) => (
  <Card sx={{ border: '1px solid #E8EDF5', boxShadow: 'none', borderRadius: 3 }}>
    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: 2, backgroundColor: alpha(color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ sx: object }>, { sx: { fontSize: 20, color } }) : icon}
        </Box>
      </Box>
      <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#0A1628', lineHeight: 1 }}>{value}</Typography>
      <Typography sx={{ fontSize: '0.8rem', color: '#546E7A', mt: 0.5 }}>{label}</Typography>
    </CardContent>
  </Card>
);

// ── Protocol / trial card ─────────────────────────────────────────────────────

const TrialCard: React.FC<{
  protocol: Protocol;
  onOpen: () => void;
  onDelete: () => void;
}> = ({ protocol, onOpen, onDelete }) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const statusStyle = statusColor(protocol.protocolStatus);

  return (
    <Card
      sx={{
        border: '1px solid #E8EDF5',
        boxShadow: 'none',
        borderRadius: 3,
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease',
        '&:hover': { borderColor: '#0047AB', boxShadow: '0 8px 24px rgba(0,71,171,0.1)', transform: 'translateY(-2px)' },
      }}
      onClick={onOpen}
    >
      <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', '&:last-child': { pb: 3 } }}>
        {/* Header row */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label={statusStyle.label}
              size="small"
              sx={{ fontSize: '0.7rem', fontWeight: 600, backgroundColor: statusStyle.bg, color: statusStyle.text, height: 22, border: 'none' }}
            />
            {protocol.trialPhase && (
              <Chip
                label={protocol.trialPhase}
                size="small"
                sx={{ fontSize: '0.7rem', fontWeight: 600, backgroundColor: alpha(phaseColor(protocol.trialPhase), 0.1), color: phaseColor(protocol.trialPhase), height: 22 }}
              />
            )}
          </Stack>
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); }}
            sx={{ ml: 1, flexShrink: 0 }}
          >
            <MoreIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Title */}
        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0A1628', mb: 0.5, lineHeight: 1.4 }}>
          {protocol.shortTitle || protocol.fullTitle}
        </Typography>
        {protocol.indication && (
          <Typography sx={{ fontSize: '0.8rem', color: '#7C3AED', fontWeight: 500, mb: 2 }}>
            {protocol.indication}
          </Typography>
        )}

        <Box sx={{ flex: 1 }} />

        {/* Progress */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
            <Typography sx={{ fontSize: '0.75rem', color: '#546E7A' }}>Protocol completion</Typography>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#0047AB' }}>
              {Math.round(protocol.completenessPercentage ?? 0)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={protocol.completenessPercentage ?? 0}
            sx={{ height: 5, borderRadius: 3, backgroundColor: '#E8EDF5', '& .MuiLinearProgress-bar': { borderRadius: 3, background: 'linear-gradient(90deg, #0047AB 0%, #00897B 100%)' } }}
          />
        </Box>

        {/* Footer */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '0.72rem', color: '#90A4AE' }}>
            Updated {formatDate(protocol.updatedAt)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#0047AB' }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Open</Typography>
            <ArrowIcon sx={{ fontSize: 14 }} />
          </Box>
        </Box>
      </CardContent>

      {/* Context menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)} onClick={(e) => e.stopPropagation()}>
        <MenuItem onClick={() => { setMenuAnchor(null); onOpen(); }}>
          <ListItemIcon><ViewIcon fontSize="small" /></ListItemIcon>Open
        </MenuItem>
        <MenuItem onClick={() => { setMenuAnchor(null); onDelete(); }} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>Delete
        </MenuItem>
      </Menu>
    </Card>
  );
};

// ── Empty state ───────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ onCreate: () => void }> = ({ onCreate }) => (
  <Box sx={{ textAlign: 'center', py: 10, px: 2 }}>
    <Box sx={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
      <ScienceIcon sx={{ fontSize: 36, color: '#0047AB' }} />
    </Box>
    <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#0A1628', mb: 1 }}>
      Start your first clinical trial
    </Typography>
    <Typography sx={{ fontSize: '0.9rem', color: '#546E7A', maxWidth: 420, mx: 'auto', mb: 4, lineHeight: 1.7 }}>
      NexTrial will guide you from initial research through protocol design, regulatory submission,
      patient enrollment and data analysis — all in one place.
    </Typography>
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={onCreate}
      sx={{ background: 'linear-gradient(135deg, #0047AB 0%, #00897B 100%)', fontWeight: 700, px: 4, py: 1.25, borderRadius: 2, boxShadow: '0 4px 16px rgba(0,71,171,0.3)' }}
    >
      Start a New Trial
    </Button>
  </Box>
);

// ── New trial dialog ──────────────────────────────────────────────────────────

interface NewTrialDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (protocol: Protocol) => void;
  userName: string;
}

const NewTrialDialog: React.FC<NewTrialDialogProps> = ({ open, onClose, onCreated, userName }) => {
  const [title, setTitle] = useState('');
  const [indication, setIndication] = useState('');
  const [phase, setPhase] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!title.trim()) { setError('Trial title is required'); return; }
    setCreating(true);
    setError('');
    try {
      const input: CreateProtocolInput = {
        sponsorProtocolIdentifier: `NT-${Date.now()}`,
        fullTitle: title.trim(),
        shortTitle: title.trim().slice(0, 60),
        protocolVersion: '1.0',
        protocolDate: new Date().toISOString().split('T')[0],
        ...(phase ? { trialPhase: phase } : {}),
        ...(indication ? { indication } : {}),
        studyType: 'Interventional',
        createdBy: userName,
      };
      const protocol = await protocolService.createProtocol(input);
      onCreated(protocol);
      setTitle(''); setIndication(''); setPhase('');
    } catch (err: any) {
      setError(err.message || 'Failed to create trial');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1.1rem', pb: 0 }}>Start a New Trial</DialogTitle>
      <DialogContent sx={{ pt: 2, pb: 1 }}>
        <Stack spacing={2.5} mt={1}>
          <TextField
            label="Trial Title *"
            placeholder="e.g. Phase 2 study of Metformin in T2DM patients"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(''); }}
            error={Boolean(error)}
            helperText={error}
            fullWidth
            autoFocus
          />
          <TextField
            label="Indication / Therapeutic Area"
            placeholder="e.g. Type 2 Diabetes, Oncology, Cardiology"
            value={indication}
            onChange={(e) => setIndication(e.target.value)}
            fullWidth
          />
          <TextField
            label="Trial Phase"
            value={phase}
            onChange={(e) => setPhase(e.target.value)}
            fullWidth
            select
            SelectProps={{ native: true }}
            InputLabelProps={{ shrink: true }}
          >
            <option value="">Select phase</option>
            {['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Observational'].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} sx={{ color: '#546E7A' }}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={creating || !title.trim()}
          startIcon={creating ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
          sx={{ background: 'linear-gradient(135deg, #0047AB 0%, #00897B 100%)', fontWeight: 600, px: 3, boxShadow: 'none' }}
        >
          {creating ? 'Creating…' : 'Create Trial'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Main dashboard ────────────────────────────────────────────────────────────

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTrialOpen, setNewTrialOpen] = useState(false);

  const firstName = user?.firstName ?? 'Doctor';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    const load = async () => {
      try {
        const data = await protocolService.getAllProtocols();
        setProtocols(data);
      } catch {
        // Backend not running — show empty state gracefully
        setProtocols([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await protocolService.deleteProtocol(id);
      setProtocols((prev) => prev.filter((p) => p.id !== id));
    } catch {}
  };

  const stats = {
    total: protocols.length,
    draft: protocols.filter((p) => p.protocolStatus === 'draft').length,
    active: protocols.filter((p) => p.protocolStatus === 'active').length,
    avgCompletion: protocols.length
      ? Math.round(protocols.reduce((sum, p) => sum + (p.completenessPercentage ?? 0), 0) / protocols.length)
      : 0,
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F7F9FC' }}>
      {/* Header */}
      <Box sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid #E8EDF5', px: { xs: 2, md: 4 }, py: 3 }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#0A1628' }}>
              {greeting}, Dr. {firstName}
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: '#546E7A', mt: 0.25 }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setNewTrialOpen(true)}
            sx={{ background: 'linear-gradient(135deg, #0047AB 0%, #00897B 100%)', fontWeight: 700, px: 3, py: 1.25, borderRadius: 2, boxShadow: '0 4px 16px rgba(0,71,171,0.25)', '&:hover': { boxShadow: '0 8px 24px rgba(0,71,171,0.35)' } }}
          >
            New Trial
          </Button>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
        {/* Stats */}
        <Grid container spacing={2} mb={4}>
          {[
            { value: stats.total, label: 'Total Trials', icon: <AssignmentIcon />, color: '#0047AB' },
            { value: stats.draft, label: 'In Draft', icon: <EditIcon />, color: '#D97706' },
            { value: stats.active, label: 'Active', icon: <CheckIcon />, color: '#059669' },
            { value: `${stats.avgCompletion}%`, label: 'Avg Completion', icon: <ScheduleIcon />, color: '#7C3AED' },
          ].map((s) => (
            <Grid size={{ xs: 6, md: 3 }} key={s.label}>
              <StatCard {...s} />
            </Grid>
          ))}
        </Grid>

        {/* Quick-access banners */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 4 }}>

        {/* AI Research Intelligence banner */}
        <Box
          onClick={() => navigate('/research')}
          sx={{
            p: 2.5,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(0,71,171,0.06) 100%)',
            border: '1px solid rgba(124,58,237,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              background: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(0,71,171,0.10) 100%)',
              borderColor: 'rgba(124,58,237,0.35)',
              transform: 'translateY(-1px)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: 'rgba(124,58,237,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AIIcon sx={{ fontSize: 18, color: '#7C3AED' }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0A1628' }}>
                AI Research Intelligence
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#546E7A' }}>
                Ask any clinical question. Get PubMed + ClinicalTrials.gov synthesis in seconds.
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#7C3AED' }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Open</Typography>
            <ArrowIcon sx={{ fontSize: 16 }} />
          </Box>
        </Box>

        {/* Regulatory Prep banner */}
        <Box
          onClick={() => navigate('/regulatory')}
          sx={{
            p: 2.5,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(217,119,6,0.08) 0%, rgba(5,150,105,0.06) 100%)',
            border: '1px solid rgba(217,119,6,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              background: 'linear-gradient(135deg, rgba(217,119,6,0.12) 0%, rgba(5,150,105,0.10) 100%)',
              borderColor: 'rgba(217,119,6,0.35)',
              transform: 'translateY(-1px)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: 'rgba(217,119,6,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AssignmentIcon sx={{ fontSize: 18, color: '#D97706' }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0A1628' }}>
                Regulatory Prep
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#546E7A' }}>
                CTRI · CDSCO Form 44 · ICMR Ethics · GCP checklist
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#D97706' }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Open</Typography>
            <ArrowIcon sx={{ fontSize: 16 }} />
          </Box>
        </Box>

        {/* Patient Matching banner */}
        <Box
          onClick={() => navigate('/match')}
          sx={{
            p: 2.5,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(0,137,123,0.08) 0%, rgba(0,71,171,0.06) 100%)',
            border: '1px solid rgba(0,137,123,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              background: 'linear-gradient(135deg, rgba(0,137,123,0.12) 0%, rgba(0,71,171,0.10) 100%)',
              borderColor: 'rgba(0,137,123,0.35)',
              transform: 'translateY(-1px)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: 'rgba(0,137,123,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ScienceIcon sx={{ fontSize: 18, color: '#00897B' }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0A1628' }}>
                Patient-Trial Matching
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#546E7A' }}>
                AI-scored eligibility matching across ClinicalTrials.gov
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#00897B' }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Open</Typography>
            <ArrowIcon sx={{ fontSize: 16 }} />
          </Box>
        </Box>

        {/* EDC banner */}
        <Box
          onClick={() => navigate('/edc')}
          sx={{
            p: 2.5,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(0,71,171,0.08) 0%, rgba(0,137,123,0.06) 100%)',
            border: '1px solid rgba(0,71,171,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              background: 'linear-gradient(135deg, rgba(0,71,171,0.12) 0%, rgba(0,137,123,0.10) 100%)',
              borderColor: 'rgba(0,71,171,0.35)',
              transform: 'translateY(-1px)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: 'rgba(0,71,171,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckIcon sx={{ fontSize: 18, color: '#0047AB' }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0A1628' }}>
                Electronic Data Capture
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#546E7A' }}>
                eCRF builder · Patient enrollment · GCP audit trail
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#0047AB' }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Open</Typography>
            <ArrowIcon sx={{ fontSize: 16 }} />
          </Box>
        </Box>

        {/* Analysis & Submission — full-width hero banner */}
        <Box
          onClick={() => navigate('/analysis')}
          sx={{
            gridColumn: { xs: '1', md: '1 / -1' },
            p: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #0047AB 0%, #00897B 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 24px rgba(0,71,171,0.2)',
            '&:hover': {
              boxShadow: '0 8px 32px rgba(0,71,171,0.35)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 44, height: 44, borderRadius: 2.5, backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AIIcon sx={{ fontSize: 22, color: '#fff' }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#fff', letterSpacing: '-0.01em' }}>
                Analysis & Submission
              </Typography>
              <Typography sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)' }}>
                AI insights · Live trial dashboard · Export-ready PDFs (Trial Summary · Regulatory Report · CRF Matrix · Cover Letter)
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#fff' }}>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>Open</Typography>
            <ArrowIcon sx={{ fontSize: 18 }} />
          </Box>
        </Box>

        </Box>{/* end grid */}

        {/* Trials grid */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#0A1628' }}>My Trials</Typography>
          {protocols.length > 0 && (
            <Typography sx={{ fontSize: '0.8rem', color: '#546E7A' }}>{protocols.length} trial{protocols.length !== 1 ? 's' : ''}</Typography>
          )}
        </Box>

        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3].map((n) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={n}>
                <Card sx={{ border: '1px solid #E8EDF5', boxShadow: 'none', borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Skeleton width={80} height={24} sx={{ mb: 1 }} />
                    <Skeleton width="90%" height={20} sx={{ mb: 0.5 }} />
                    <Skeleton width="60%" height={16} sx={{ mb: 3 }} />
                    <Skeleton height={8} sx={{ borderRadius: 2, mb: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Skeleton width={80} height={14} />
                      <Skeleton width={50} height={14} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : protocols.length === 0 ? (
          <EmptyState onCreate={() => setNewTrialOpen(true)} />
        ) : (
          <Grid container spacing={3}>
            {protocols.map((protocol) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={protocol.id}>
                <TrialCard
                  protocol={protocol}
                  onOpen={() => navigate(`/protocol-builder/${protocol.id}`)}
                  onDelete={() => handleDelete(protocol.id)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <NewTrialDialog
        open={newTrialOpen}
        onClose={() => setNewTrialOpen(false)}
        onCreated={(p) => {
          setProtocols((prev) => [p, ...prev]);
          setNewTrialOpen(false);
          navigate(`/protocol-builder/${p.id}`);
        }}
        userName={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'PI'}
      />
    </Box>
  );
};

export default DashboardPage;
