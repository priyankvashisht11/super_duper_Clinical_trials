import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import {
  Box, Typography, IconButton, Button, Chip, TextField,
  CircularProgress, Menu, MenuItem, ListItemIcon, alpha,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  MoreVert as MoreIcon,
  AutoAwesome as AIIcon,
  Delete as DeleteIcon,
  DriveFileRenameOutline as RenameIcon,
  FileDownload as ExportIcon,
  Send as SendIcon,
  ChevronRight as NextIcon,
  ChevronLeft as PrevIcon,
} from '@mui/icons-material';
import { ProtocolProvider, useProtocol } from '../contexts/ProtocolContext';

// ── Section definitions ───────────────────────────────────────────────────────

const SECTIONS = [
  { number: '1',  title: 'Protocol Summary',        group: 'Foundation',          description: 'High-level synopsis — population, intervention, primary endpoint, design rationale.', tags: ['ICH M11 §1', 'CDSCO'] },
  { number: '2',  title: 'Introduction',             group: 'Foundation',          description: 'Disease background, burden in India, current standard of care, and unmet need this trial addresses.', tags: ['ICH M11 §2', 'GCP'] },
  { number: '3',  title: 'Objectives & Estimands',  group: 'Foundation',          description: 'Primary, secondary and exploratory objectives with estimands per ICH E9(R1).', tags: ['ICH M11 §3', 'ICH E9(R1)'] },
  { number: '4',  title: 'Trial Design',             group: 'Foundation',          description: 'Overall design, randomisation, blinding, treatment arms, visit schedule, and trial schema.', tags: ['ICH M11 §4', 'ICMR'] },
  { number: '5',  title: 'Trial Population',         group: 'Patient & Treatment', description: 'Inclusion and exclusion criteria for participant eligibility. Include India-specific considerations.', tags: ['ICH M11 §5', 'CTRI'] },
  { number: '6',  title: 'Trial Intervention',       group: 'Patient & Treatment', description: 'Investigational product, dose, route, frequency, duration. Comparator and rescue medication.', tags: ['ICH M11 §6', 'CDSCO'] },
  { number: '7',  title: 'Discontinuation',          group: 'Patient & Treatment', description: 'Rules for stopping a participant or the whole trial. Withdrawal procedures.', tags: ['ICH M11 §7', 'GCP'] },
  { number: '8',  title: 'Trial Assessments',        group: 'Data & Analysis',     description: 'Schedule of assessments — efficacy, safety, biomarkers, PK/PD, PRO instruments.', tags: ['ICH M11 §8'] },
  { number: '9',  title: 'Adverse Events',           group: 'Data & Analysis',     description: 'AE/SAE definitions, grading, collection procedures, causality, SUSAR reporting to CDSCO.', tags: ['ICH M11 §9', 'ICMR', 'CDSCO'] },
  { number: '10', title: 'Statistical Plan',         group: 'Data & Analysis',     description: 'Analysis populations, endpoints, statistical methods, multiplicity, sample size justification.', tags: ['ICH M11 §10', 'ICH E9'] },
  { number: '11', title: 'Trial Oversight',          group: 'Governance',          description: 'Regulatory context, ethics committee (IEC), data protection, insurance, audit plan.', tags: ['ICH M11 §11', 'GCP', 'ICMR'] },
  { number: '12', title: 'Appendices',               group: 'Governance',          description: 'Supplementary materials, informed consent forms, questionnaires, other supporting documents.', tags: ['ICH M11 §12'] },
  { number: '13', title: 'Glossary',                 group: 'Governance',          description: 'Definitions of key terms, abbreviations and acronyms used in the protocol.', tags: ['ICH M11 §13'] },
  { number: '14', title: 'References',               group: 'Governance',          description: 'Bibliography — clinical, regulatory, and epidemiological references cited in the protocol.', tags: ['ICH M11 §14'] },
] as const;

type SectionDef = typeof SECTIONS[number];

const GROUPS = ['Foundation', 'Patient & Treatment', 'Data & Analysis', 'Governance'] as const;

// ── Section nav item ──────────────────────────────────────────────────────────

const NavItem: React.FC<{
  section: SectionDef;
  active: boolean;
  filled: boolean;
  onClick: () => void;
}> = ({ section, active, filled, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 1.5,
      px: 2,
      py: 1.25,
      cursor: 'pointer',
      borderLeft: active ? '2px solid #0047AB' : '2px solid transparent',
      backgroundColor: active ? alpha('#0047AB', 0.06) : 'transparent',
      '&:hover': { backgroundColor: active ? alpha('#0047AB', 0.08) : alpha('#0047AB', 0.03) },
      transition: 'background 0.15s',
    }}
  >
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        flexShrink: 0,
        mt: 0.6,
        backgroundColor: filled ? '#059669' : active ? '#0047AB' : '#D0D9E8',
        transition: 'background 0.2s',
      }}
    />
    <Box>
      <Typography sx={{ fontSize: '0.68rem', color: '#90A4AE', fontWeight: 700, lineHeight: 1, letterSpacing: '0.04em' }}>
        §{section.number}
      </Typography>
      <Typography
        sx={{
          fontSize: '0.82rem',
          color: active ? '#0047AB' : '#3D4E63',
          fontWeight: active ? 600 : 400,
          lineHeight: 1.35,
          mt: 0.25,
        }}
      >
        {section.title}
      </Typography>
    </Box>
  </Box>
);

// ── Section workspace ─────────────────────────────────────────────────────────

const SectionWorkspace: React.FC<{ sectionNum: string }> = ({ sectionNum }) => {
  const { protocol, autoSaveSection } = useProtocol();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const sectionDef = SECTIONS.find(s => s.number === sectionNum);
  const protocolSection = protocol?.sections?.find(s => s.sectionNumber === sectionNum);

  const [text, setText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync section content when section changes
  useEffect(() => {
    const content = protocolSection?.content;
    setText(typeof content?.text === 'string' ? content.text : '');
    setSavedAt(null);
    setAiResponse('');
    setAiQuery('');
  }, [sectionNum, protocolSection?.id]);

  const scheduleAutoSave = useCallback(
    (value: string) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        autoSaveSection(sectionNum, { text: value });
        setSavedAt(new Date());
      }, 1500);
    },
    [sectionNum, autoSaveSection]
  );

  const handleChange = (value: string) => {
    setText(value);
    scheduleAutoSave(value);
  };

  const handleGenerate = async () => {
    if (!protocol || !sectionDef) return;
    setGenerating(true);
    try {
      const res = await fetch('http://localhost:3001/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionName: sectionDef.title,
          parameters: {
            title: protocol.fullTitle,
            indication: protocol.indication,
            phase: protocol.trialPhase,
            studyType: protocol.studyType,
          },
          templateType: 'M11',
        }),
      });
      const json = await res.json();
      const raw = json.data?.content || json.data?.text || json.data || '';
      const generated = typeof raw === 'string' ? raw : JSON.stringify(raw, null, 2);
      handleChange(generated);
    } catch {
      // Backend offline — user can type manually
    } finally {
      setGenerating(false);
    }
  };

  const handleAiQuery = async () => {
    if (!aiQuery.trim() || !sectionDef) return;
    setAiLoading(true);
    setAiResponse('');
    try {
      const res = await fetch('http://localhost:3001/api/ai/section-assistance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionName: sectionDef.title,
          currentContent: text,
          userQuery: aiQuery,
          context: { indication: protocol?.indication, phase: protocol?.trialPhase },
        }),
      });
      const json = await res.json();
      const raw = json.data?.suggestion || json.data?.response || json.data?.content || json.data || '';
      setAiResponse(typeof raw === 'string' ? raw : JSON.stringify(raw));
    } catch {
      setAiResponse('Backend not available. Start the server to use AI assistance.');
    } finally {
      setAiLoading(false);
    }
  };

  const applyAiResponse = () => {
    handleChange(text ? `${text}\n\n${aiResponse}` : aiResponse);
    setAiResponse('');
    setAiQuery('');
  };

  const prevNum = String(Number(sectionNum) - 1);
  const nextNum = String(Number(sectionNum) + 1);
  const hasPrev = SECTIONS.some(s => s.number === prevNum);
  const hasNext = SECTIONS.some(s => s.number === nextNum);

  if (!sectionDef) return null;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', px: { xs: 2, md: 5 }, py: 5 }}>
      {/* Section header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
          <Typography
            sx={{ fontSize: '0.7rem', color: '#90A4AE', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', mr: 0.5 }}
          >
            Section {sectionDef.number} of 14
          </Typography>
          {sectionDef.tags.map(tag => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{ fontSize: '0.63rem', height: 18, backgroundColor: '#EFF6FF', color: '#0047AB', fontWeight: 600, borderRadius: 1 }}
            />
          ))}
        </Box>
        <Typography sx={{ fontSize: '1.625rem', fontWeight: 800, color: '#0A1628', lineHeight: 1.25, mb: 1 }}>
          {sectionDef.title}
        </Typography>
        <Typography sx={{ fontSize: '0.875rem', color: '#546E7A', lineHeight: 1.7, maxWidth: 620 }}>
          {sectionDef.description}
        </Typography>
      </Box>

      {/* Empty state — generate CTA */}
      {!text && !generating && (
        <Box
          sx={{
            border: '2px dashed #D0D9E8',
            borderRadius: 3,
            p: 5,
            textAlign: 'center',
            mb: 4,
            backgroundColor: alpha('#7C3AED', 0.015),
          }}
        >
          <Box
            sx={{ width: 52, height: 52, borderRadius: '14px', backgroundColor: alpha('#7C3AED', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}
          >
            <AIIcon sx={{ fontSize: 26, color: '#7C3AED' }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0A1628', mb: 0.75 }}>
            Start with an AI-drafted first cut
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', color: '#546E7A', mb: 3, maxWidth: 380, mx: 'auto', lineHeight: 1.7 }}>
            NexTrial drafts this section from your trial title, indication, and phase. You read and edit from there.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<AIIcon />}
              onClick={handleGenerate}
              sx={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #0047AB 100%)',
                fontWeight: 700,
                px: 3,
                py: 1.25,
                borderRadius: 2,
                boxShadow: '0 4px 16px rgba(124,58,237,0.25)',
                '&:hover': { boxShadow: '0 8px 24px rgba(124,58,237,0.35)' },
              }}
            >
              Generate with AI
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleChange(' ')}
              sx={{ fontWeight: 600, px: 3, py: 1.25, borderRadius: 2, borderColor: '#D0D9E8', color: '#546E7A' }}
            >
              Write manually
            </Button>
          </Box>
        </Box>
      )}

      {/* Generating spinner */}
      {generating && (
        <Box
          sx={{ border: '1px solid #E8EDF5', borderRadius: 3, p: 5, textAlign: 'center', mb: 4, backgroundColor: alpha('#7C3AED', 0.02) }}
        >
          <CircularProgress size={32} sx={{ color: '#7C3AED', mb: 2 }} />
          <Typography sx={{ color: '#546E7A', fontSize: '0.875rem' }}>
            Drafting {sectionDef.title}…
          </Typography>
        </Box>
      )}

      {/* Content editor */}
      {text && !generating && (
        <Box sx={{ mb: 4 }}>
          <TextField
            multiline
            fullWidth
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            minRows={14}
            maxRows={40}
            placeholder={`Write your ${sectionDef.title} here…`}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '0.9375rem',
                lineHeight: 1.75,
                fontFamily: '"Inter", system-ui, sans-serif',
                color: '#0A1628',
                '& fieldset': { borderColor: '#E8EDF5' },
                '&:hover fieldset': { borderColor: '#C5D0E0' },
                '&.Mui-focused fieldset': { borderColor: '#0047AB', borderWidth: '1.5px' },
              },
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.25 }}>
            <Typography sx={{ fontSize: '0.72rem', color: '#B0BEC5' }}>
              {savedAt ? `Saved ${savedAt.toLocaleTimeString()}` : 'Saving…'}
            </Typography>
            <Button
              size="small"
              startIcon={<AIIcon sx={{ fontSize: '14px !important' }} />}
              onClick={handleGenerate}
              sx={{ fontSize: '0.72rem', color: '#7C3AED', py: 0.25, '&:hover': { backgroundColor: alpha('#7C3AED', 0.06) } }}
            >
              Regenerate
            </Button>
          </Box>
        </Box>
      )}

      {/* AI assist bar */}
      <Box
        sx={{
          border: '1px solid',
          borderColor: alpha('#7C3AED', 0.2),
          borderRadius: 3,
          p: 2,
          backgroundColor: alpha('#7C3AED', 0.025),
          mb: 5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <AIIcon sx={{ fontSize: 15, color: '#7C3AED' }} />
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#7C3AED', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            AI Assist
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            multiline
            maxRows={3}
            placeholder={`e.g. "Add ICMR-compliant language" · "Tighten eligibility criteria" · "Expand the statistical rationale"`}
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAiQuery(); } }}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '0.85rem',
                borderRadius: 2,
                backgroundColor: '#ffffff',
                '& fieldset': { borderColor: '#E8EDF5' },
                '&:hover fieldset': { borderColor: '#D0D9E8' },
                '&.Mui-focused fieldset': { borderColor: '#7C3AED' },
              },
            }}
          />
          <IconButton
            onClick={handleAiQuery}
            disabled={!aiQuery.trim() || aiLoading}
            size="small"
            sx={{
              alignSelf: 'flex-end',
              color: '#7C3AED',
              backgroundColor: alpha('#7C3AED', 0.08),
              '&:hover': { backgroundColor: alpha('#7C3AED', 0.14) },
              '&.Mui-disabled': { opacity: 0.4 },
            }}
          >
            {aiLoading ? <CircularProgress size={16} color="inherit" /> : <SendIcon sx={{ fontSize: 16 }} />}
          </IconButton>
        </Box>

        {/* AI response */}
        {aiResponse && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#ffffff', borderRadius: 2, border: '1px solid #E8EDF5' }}>
            <Typography sx={{ fontSize: '0.875rem', color: '#0A1628', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
              {aiResponse}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
              <Button
                size="small"
                variant="contained"
                onClick={applyAiResponse}
                sx={{ fontSize: '0.75rem', backgroundColor: '#0047AB', fontWeight: 600, py: 0.5, px: 1.5, boxShadow: 'none', borderRadius: 1.5 }}
              >
                Apply to document
              </Button>
              <Button
                size="small"
                onClick={() => { setAiResponse(''); setAiQuery(''); }}
                sx={{ fontSize: '0.75rem', color: '#90A4AE' }}
              >
                Dismiss
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      {/* Prev / Next navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E8EDF5', pt: 3 }}>
        <Button
          startIcon={<PrevIcon />}
          disabled={!hasPrev}
          onClick={() => navigate(`/protocol-builder/${id}/section/${prevNum}`)}
          sx={{ color: '#546E7A', fontWeight: 500, '&:hover': { backgroundColor: alpha('#0047AB', 0.05) } }}
        >
          {hasPrev ? SECTIONS.find(s => s.number === prevNum)?.title : ''}
        </Button>
        <Button
          endIcon={<NextIcon />}
          disabled={!hasNext}
          onClick={() => navigate(`/protocol-builder/${id}/section/${nextNum}`)}
          sx={{ color: '#546E7A', fontWeight: 500, '&:hover': { backgroundColor: alpha('#0047AB', 0.05) } }}
        >
          {hasNext ? SECTIONS.find(s => s.number === nextNum)?.title : ''}
        </Button>
      </Box>
    </Box>
  );
};

// Wrapper to read sectionNumber from nested route params
const SectionWorkspaceRoute: React.FC = () => {
  const { sectionNumber } = useParams<{ sectionNumber: string }>();
  return <SectionWorkspace sectionNum={sectionNumber || '1'} />;
};

// ── Main builder layout ───────────────────────────────────────────────────────

const ProtocolBuilderContent: React.FC = () => {
  const { protocol, loading, error, updateProtocol } = useProtocol();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newName, setNewName] = useState('');

  // Parse active section from URL
  const activeSectionNum = location.pathname.match(/section\/(\d+)/)?.[1] || '1';

  const isSectionFilled = (num: string) => {
    const s = protocol?.sections?.find(sec => sec.sectionNumber === num);
    return typeof s?.content?.text === 'string' && s.content.text.trim().length > 0;
  };

  const completion = Math.round(protocol?.completenessPercentage ?? 0);

  const handleRename = async () => {
    if (!protocol || !newName.trim()) return;
    await updateProtocol({ shortTitle: newName.trim() });
    setRenameOpen(false);
  };

  const handleDelete = async () => {
    if (!protocol) return;
    try {
      await fetch(`http://localhost:3001/api/protocols/${protocol.id}`, { method: 'DELETE' });
    } catch {}
    navigate('/dashboard');
  };

  const phaseColor = (phase?: string) => {
    if (!phase) return '#546E7A';
    if (phase.includes('1')) return '#7C3AED';
    if (phase.includes('2')) return '#0047AB';
    if (phase.includes('3')) return '#059669';
    if (phase.includes('4')) return '#D97706';
    return '#546E7A';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#F7F9FC' }}>
        <CircularProgress size={40} sx={{ color: '#0047AB' }} />
      </Box>
    );
  }

  if (error || !protocol) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Typography sx={{ color: '#546E7A' }}>{error || 'Protocol not found'}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#F7F9FC' }}>

      {/* ── Left nav ─────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          width: 252,
          flexShrink: 0,
          backgroundColor: '#ffffff',
          borderRight: '1px solid #E8EDF5',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* Logo + trial meta */}
        <Box sx={{ p: 2.5, borderBottom: '1px solid #E8EDF5' }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 0.75, cursor: 'pointer', mb: 2 }}
            onClick={() => navigate('/dashboard')}
          >
            <Box sx={{ width: 26, height: 26, borderRadius: '7px', background: 'linear-gradient(135deg, #0047AB 0%, #00897B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.8rem', lineHeight: 1 }}>N</Typography>
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0A1628' }}>NexTrial</Typography>
          </Box>
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#3D4E63', lineHeight: 1.4, mb: 2 }}>
            {protocol.shortTitle || protocol.fullTitle}
          </Typography>
          {/* Completion bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: '#E8EDF5', overflow: 'hidden' }}>
              <Box
                sx={{
                  height: '100%',
                  width: `${completion}%`,
                  background: 'linear-gradient(90deg, #0047AB 0%, #00897B 100%)',
                  borderRadius: 2,
                  transition: 'width 0.4s ease',
                }}
              />
            </Box>
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#0047AB', flexShrink: 0 }}>
              {completion}%
            </Typography>
          </Box>
        </Box>

        {/* Section list */}
        <Box sx={{ flex: 1, py: 1 }}>
          {GROUPS.map(group => (
            <Box key={group}>
              <Typography
                sx={{
                  px: 2.5,
                  pt: 2,
                  pb: 0.75,
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  color: '#B0BEC5',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                }}
              >
                {group}
              </Typography>
              {SECTIONS.filter(s => s.group === group).map(section => (
                <NavItem
                  key={section.number}
                  section={section}
                  active={activeSectionNum === section.number}
                  filled={isSectionFilled(section.number)}
                  onClick={() => navigate(`/protocol-builder/${id}/section/${section.number}`)}
                />
              ))}
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Right: topbar + content ───────────────────────────────────────────── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <Box
          sx={{
            height: 56,
            flexShrink: 0,
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #E8EDF5',
            display: 'flex',
            alignItems: 'center',
            px: 3,
            gap: 1.5,
          }}
        >
          <IconButton size="small" onClick={() => navigate('/dashboard')} sx={{ color: '#546E7A' }}>
            <BackIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '0.875rem',
              color: '#0A1628',
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {protocol.shortTitle || protocol.fullTitle}
          </Typography>
          {protocol.trialPhase && (
            <Chip
              label={protocol.trialPhase}
              size="small"
              sx={{
                fontSize: '0.68rem',
                fontWeight: 600,
                height: 22,
                backgroundColor: alpha(phaseColor(protocol.trialPhase), 0.1),
                color: phaseColor(protocol.trialPhase),
              }}
            />
          )}
          {protocol.indication && (
            <Typography sx={{ fontSize: '0.78rem', color: '#78909C', display: { xs: 'none', lg: 'block' } }}>
              {protocol.indication}
            </Typography>
          )}
          <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)} sx={{ color: '#546E7A' }}>
            <MoreIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* Scrollable content */}
        <Box sx={{ flex: 1, overflowY: 'auto', backgroundColor: '#F7F9FC' }}>
          <Routes>
            <Route index element={<Navigate to="section/1" replace />} />
            <Route path="section/:sectionNumber" element={<SectionWorkspaceRoute />} />
            <Route path="*" element={<Navigate to="section/1" replace />} />
          </Routes>
        </Box>
      </Box>

      {/* ── 3-dot menu ─────────────────────────────────────────────────────────── */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        PaperProps={{ sx: { borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', mt: 0.5 } }}
      >
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            setNewName(protocol.shortTitle || protocol.fullTitle);
            setRenameOpen(true);
          }}
        >
          <ListItemIcon><RenameIcon fontSize="small" /></ListItemIcon>
          Rename
        </MenuItem>
        <MenuItem disabled sx={{ opacity: 0.5 }}>
          <ListItemIcon><ExportIcon fontSize="small" /></ListItemIcon>
          Export — Sprint 6
        </MenuItem>
        <MenuItem
          onClick={() => { setMenuAnchor(null); setDeleteOpen(true); }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      {/* ── Rename dialog ───────────────────────────────────────────────────────── */}
      <Dialog open={renameOpen} onClose={() => setRenameOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 0 }}>Rename Trial</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            fullWidth
            label="Trial name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); }}
            sx={{ mt: 0.5 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setRenameOpen(false)} sx={{ color: '#546E7A' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleRename}
            disabled={!newName.trim()}
            sx={{ background: 'linear-gradient(135deg, #0047AB 0%, #00897B 100%)', fontWeight: 600, boxShadow: 'none' }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete dialog ───────────────────────────────────────────────────────── */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#DC2626' }}>Delete Trial?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#546E7A', lineHeight: 1.7 }}>
            This will permanently delete <strong>{protocol.shortTitle || protocol.fullTitle}</strong> and all of its sections. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ color: '#546E7A' }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ── Page entry ────────────────────────────────────────────────────────────────

export const ProtocolBuilderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Typography sx={{ color: '#546E7A' }}>No protocol ID provided</Typography>
      </Box>
    );
  }

  return (
    <ProtocolProvider protocolId={id}>
      <ProtocolBuilderContent />
    </ProtocolProvider>
  );
};
