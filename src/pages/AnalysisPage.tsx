import { useState } from 'react';
import { jsPDF } from 'jspdf';
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  Paper,
  CircularProgress,
  Alert,
  alpha,
  LinearProgress,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { TopNavigation } from '../components/layout';

// ── Local types (mirror localStorage shapes from EDC + Regulatory pages) ───────

interface EDCField { id: string; type: string; label: string; }
interface EDCForm { id: string; name: string; fields: EDCField[]; }
interface EDCPatient { id: string; subjectId: string; site: string; status: string; enrolledAt: string; }
interface DataEntry { id: string; patientId: string; formId: string; data: Record<string, string>; }
interface EDCState { forms: EDCForm[]; patients: EDCPatient[]; entries: DataEntry[]; }
interface RegState { checked: Record<string, boolean>; }

interface Insights {
  enrollmentVelocity: string;
  safetyProfile: string;
  dataQuality: string;
  regulatoryReadiness: string;
  topRecommendations: string[];
}

interface Metrics {
  enrolled: number; active: number; completed: number; withdrawn: number;
  adverseEvents: number; crfsFiled: number; totalPossibleCrfs: number;
  completionPct: number; regulatoryChecked: number; regulatoryProgress: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const REG_TOTAL = 46;

const REG_TRACKS = [
  { prefix: 'ctri',  name: 'CTRI Registration', total: 14, color: '#0047AB' },
  { prefix: 'cdsco', name: 'CDSCO Form 44',      total: 12, color: '#D97706' },
  { prefix: 'icmr',  name: 'ICMR Ethics',         total: 10, color: '#7C3AED' },
  { prefix: 'gcp',   name: 'GCP Checklist',        total: 10, color: '#00897B' },
];

const STATUS_CFG: Record<string, { bg: string; color: string; label: string }> = {
  screening: { bg: '#FFF8E1', color: '#F57F17', label: 'Screening' },
  enrolled:  { bg: '#EFF6FF', color: '#0047AB', label: 'Enrolled'  },
  completed: { bg: '#E8F5E9', color: '#2E7D32', label: 'Completed' },
  withdrawn: { bg: '#F5F5F5', color: '#757575', label: 'Withdrawn' },
};

// ── Storage helpers ───────────────────────────────────────────────────────────

function loadEDC(): EDCState {
  try {
    const raw = localStorage.getItem('nextrial_edc_v1');
    if (raw) return JSON.parse(raw) as EDCState;
  } catch { /* ignore */ }
  return { forms: [], patients: [], entries: [] };
}

function loadRegulatory(): RegState {
  try {
    const raw = localStorage.getItem('nextrial_regulatory_v1');
    if (raw) return JSON.parse(raw) as RegState;
  } catch { /* ignore */ }
  return { checked: {} };
}

// ── Metric computation ────────────────────────────────────────────────────────

function computeMetrics(edc: EDCState, reg: RegState): Metrics {
  const enrolled  = edc.patients.length;
  const active    = edc.patients.filter(p => p.status === 'enrolled').length;
  const completed = edc.patients.filter(p => p.status === 'completed').length;
  const withdrawn = edc.patients.filter(p => p.status === 'withdrawn').length;

  const adverseEvents = edc.entries.filter(entry => {
    const form = edc.forms.find(f => f.id === entry.formId);
    if (!form) return false;
    return form.fields.some(
      field => field.type === 'yesno' &&
               field.label.toLowerCase().includes('adverse') &&
               entry.data[field.id] === 'yes'
    );
  }).length;

  const uniquePairs  = new Set(edc.entries.map(e => `${e.patientId}:${e.formId}`));
  const crfsFiled    = uniquePairs.size;
  const totalPossibleCrfs = enrolled * edc.forms.length;
  const completionPct = totalPossibleCrfs > 0 ? Math.round((crfsFiled / totalPossibleCrfs) * 100) : 0;

  const regulatoryChecked  = Object.values(reg.checked).filter(Boolean).length;
  const regulatoryProgress = REG_TOTAL > 0 ? Math.round((regulatoryChecked / REG_TOTAL) * 100) : 0;

  return { enrolled, active, completed, withdrawn, adverseEvents, crfsFiled, totalPossibleCrfs, completionPct, regulatoryChecked, regulatoryProgress };
}

// ── PDF generators ────────────────────────────────────────────────────────────

function pdfTrialSummary(edc: EDCState, m: Metrics): void {
  const doc = new jsPDF();
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('NexTrial — Trial Summary Report', 20, 30);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated: ${today}`, 20, 40);
  doc.text('Confidential — For Investigator Use Only', 20, 47);

  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(220, 220, 220);
  doc.line(20, 52, 190, 52);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Key Metrics', 20, 62);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  let y = 72;
  const rows = [
    ['Total Subjects',        String(m.enrolled)],
    ['Active (Enrolled)',     String(m.active)],
    ['Completed',             String(m.completed)],
    ['Withdrawn',             String(m.withdrawn)],
    ['Adverse Events',        String(m.adverseEvents)],
    ['CRF Completion',        `${m.crfsFiled} / ${m.totalPossibleCrfs} (${m.completionPct}%)`],
    ['Regulatory Readiness',  `${m.regulatoryChecked} / ${REG_TOTAL} items (${m.regulatoryProgress}%)`],
  ];
  rows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');   doc.text(label + ':', 22, y);
    doc.setFont('helvetica', 'normal'); doc.text(value, 90, y);
    y += 8;
  });

  y += 6;
  doc.line(20, y, 190, y); y += 10;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
  doc.text('Patient Enrollment', 20, y); y += 10;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Subject ID', 20, y); doc.text('Site', 65, y); doc.text('Status', 120, y); doc.text('Enrolled', 160, y);
  y += 4;
  doc.line(20, y, 190, y); y += 6;
  doc.setFont('helvetica', 'normal');

  edc.patients.forEach(p => {
    if (y > 270) { doc.addPage(); y = 20; }
    const statusLabel = STATUS_CFG[p.status]?.label ?? p.status;
    doc.text(p.subjectId, 20, y);
    doc.text(p.site.slice(0, 25), 65, y);
    doc.text(statusLabel, 120, y);
    doc.text(new Date(p.enrolledAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), 160, y);
    y += 7;
  });

  if (edc.patients.length === 0) { doc.text('No patients enrolled yet.', 20, y); }

  doc.save('nextrial-trial-summary.pdf');
}

function pdfRegulatoryReport(reg: RegState): void {
  const doc = new jsPDF();
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const checkedCount = Object.values(reg.checked).filter(Boolean).length;

  doc.setFont('helvetica', 'bold'); doc.setFontSize(22);
  doc.text('NexTrial — Regulatory Readiness Report', 20, 30);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(120, 120, 120);
  doc.text(`Generated: ${today}`, 20, 40);
  doc.setTextColor(0, 0, 0);
  doc.line(20, 50, 190, 50);

  doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
  doc.text('Overall Completion', 20, 62);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(12);
  doc.text(`${checkedCount} / ${REG_TOTAL} items complete (${Math.round((checkedCount / REG_TOTAL) * 100)}%)`, 20, 72);

  let y = 88;
  REG_TRACKS.forEach(track => {
    const trackChecked = Object.entries(reg.checked)
      .filter(([k, v]) => k.startsWith(track.prefix) && v).length;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
    doc.text(`${track.name}`, 20, y); y += 7;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
    doc.text(`${trackChecked} / ${track.total} items complete`, 24, y); y += 12;
  });

  y += 4;
  doc.line(20, y, 190, y); y += 10;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
  doc.text('Next Steps', 20, y); y += 8;
  doc.setFont('helvetica', 'normal');
  const outstanding = REG_TOTAL - checkedCount;
  const steps = [
    `Complete the remaining ${outstanding} outstanding checklist items`,
    'Obtain signed copies of all IEC approvals and store in Trial Master File',
    'Verify CTRI registration is public and accurate before first patient enrolment',
    'Confirm Schedule Y compliance with CDSCO and maintain GCP training records',
  ];
  steps.forEach(step => {
    const lines = doc.splitTextToSize(`• ${step}`, 165) as string[];
    doc.text(lines, 22, y); y += lines.length * 6 + 3;
  });

  doc.save('nextrial-regulatory-report.pdf');
}

function pdfCRFMatrix(edc: EDCState): void {
  const doc = new jsPDF({ orientation: 'landscape' });
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
  doc.text('NexTrial — CRF Completeness Matrix', 20, 25);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(120, 120, 120);
  doc.text(`Generated: ${today}`, 20, 33);
  doc.setTextColor(0, 0, 0);
  doc.line(20, 37, 277, 37);

  const colWidth = Math.min(50, edc.forms.length > 0 ? 190 / edc.forms.length : 50);
  let y = 48;

  doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
  doc.text('Subject', 20, y);
  edc.forms.forEach((form, i) => {
    doc.text(form.name.slice(0, 18), 80 + i * colWidth, y);
  });
  y += 4; doc.line(20, y, 277, y); y += 6;

  doc.setFont('helvetica', 'normal');
  edc.patients.forEach(patient => {
    if (y > 185) { doc.addPage(); y = 20; }
    doc.text(`${patient.subjectId} (${patient.site.slice(0, 12)})`, 20, y);
    edc.forms.forEach((form, i) => {
      const hasEntry = edc.entries.some(e => e.patientId === patient.id && e.formId === form.id);
      doc.text(hasEntry ? '✓ Filed' : '– Pending', 80 + i * colWidth, y);
    });
    y += 8;
  });

  if (edc.patients.length === 0) { doc.text('No patients enrolled.', 20, y); }

  doc.save('nextrial-crf-matrix.pdf');
}

function pdfCoverLetter(): void {
  const doc = new jsPDF();
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
  doc.text('NexTrial Clinical Trial Platform', 20, 25);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(120, 120, 120);
  doc.text('India\'s End-to-End Clinical Trial OS', 20, 32);
  doc.setTextColor(0, 0, 0);
  doc.line(20, 38, 190, 38);

  doc.setFontSize(11);
  let y = 52;
  doc.text(`Date: ${today}`, 20, y); y += 8;
  doc.text('To: The Secretary,', 20, y); y += 7;
  doc.text('Central Drugs Standard Control Organisation (CDSCO)', 20, y); y += 7;
  doc.text('Ministry of Health & Family Welfare, New Delhi', 20, y); y += 16;

  doc.setFont('helvetica', 'bold'); doc.text('Subject: Clinical Trial Application — Submission of Documents', 20, y); y += 12;
  doc.setFont('helvetica', 'normal');

  const body = [
    'Dear Sir/Madam,',
    '',
    'We, the undersigned Principal Investigator and Sponsor representative, hereby submit the complete clinical trial application package for the above-referenced study, conducted in compliance with Schedule Y of the Drugs and Cosmetics Act, 1940, ICH E6(R2) Good Clinical Practice guidelines, and all applicable Indian regulatory requirements.',
    '',
    'The enclosed submission package includes:',
    '  1. Completed Trial Protocol (ICH M11 format)',
    '  2. Regulatory Readiness Checklist (CTRI, CDSCO Form 44, ICMR Ethics, GCP)',
    '  3. Patient Enrollment and CRF Completeness Summary',
    '  4. Ethics Committee Approval (attached separately)',
    '',
    'We confirm that all subjects have provided written informed consent prior to participation, all adverse events have been reported within the stipulated timelines, and the trial is being conducted per the approved protocol.',
    '',
    'Please acknowledge receipt of this submission. We are available for any queries or additional documentation.',
  ];

  body.forEach(line => {
    if (line === '') { y += 5; return; }
    if (y > 265) { doc.addPage(); y = 20; }
    const wrapped = doc.splitTextToSize(line, 165) as string[];
    doc.text(wrapped, 20, y);
    y += wrapped.length * 6 + 2;
  });

  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.text('Principal Investigator', 20, y);
  doc.text('Sponsor Representative', 120, y);
  y += 20;
  doc.line(20, y, 90, y); doc.line(120, y, 190, y);

  doc.save('nextrial-cover-letter.pdf');
}

// ── Insight card ──────────────────────────────────────────────────────────────

function InsightCard({ title, text, color }: { title: string; text: string; color: string }) {
  return (
    <Paper
      variant="outlined"
      sx={{ p: 2.5, borderRadius: 2, borderColor: alpha(color, 0.25), backgroundColor: alpha(color, 0.03) }}
    >
      <Typography variant="caption" sx={{ fontWeight: 700, color, letterSpacing: '0.08em' }}>
        {title.toUpperCase()}
      </Typography>
      <Typography variant="body2" sx={{ mt: 1, color: 'text.primary', lineHeight: 1.6 }}>
        {text}
      </Typography>
    </Paper>
  );
}

// ── AnalysisPage ──────────────────────────────────────────────────────────────

export function AnalysisPage() {
  const [edc, setEdc] = useState<EDCState>(() => loadEDC());
  const [reg, setReg] = useState<RegState>(() => loadRegulatory());
  const [insights, setInsights] = useState<Insights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState('');
  const [exporting, setExporting] = useState<string | null>(null);

  const m = computeMetrics(edc, reg);

  const handleRefresh = () => {
    setEdc(loadEDC());
    setReg(loadRegulatory());
    setInsights(null);
  };

  const handleGenerateInsights = async () => {
    setInsightsLoading(true);
    setInsightsError('');
    try {
      const resp = await fetch('http://localhost:3001/api/analysis/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrolled: m.enrolled, active: m.active, completed: m.completed,
          withdrawn: m.withdrawn, adverseEvents: m.adverseEvents,
          crfsFiled: m.crfsFiled, totalPossibleCrfs: m.totalPossibleCrfs,
          regulatoryProgress: m.regulatoryProgress,
          indication: 'Not specified', phase: 'Not specified',
        }),
      });
      const data = (await resp.json()) as { ok: boolean; insights: Insights };
      if (data.ok) setInsights(data.insights);
      else setInsightsError('Analysis service returned an error.');
    } catch {
      setInsightsError('Backend offline — showing offline analysis.');
      const aePct = m.enrolled > 0 ? Math.round((m.adverseEvents / m.enrolled) * 100) : 0;
      setInsights({
        enrollmentVelocity: `${m.enrolled} subjects enrolled — ${m.active} active, ${m.completed} completed, ${m.withdrawn} withdrawn. ${m.enrolled === 0 ? 'No subjects enrolled yet. Open the EDC module to begin enrollment.' : 'Monitor against the projected enrollment timeline.'}`,
        safetyProfile: `${m.adverseEvents} adverse event${m.adverseEvents !== 1 ? 's' : ''} reported across ${m.enrolled} subjects (${aePct}% AE rate). ${aePct > 30 ? 'Elevated AE rate warrants DSMB review.' : 'AE rate within expected range. Continue standard pharmacovigilance.'}`,
        dataQuality: `CRF completion at ${m.completionPct}% (${m.crfsFiled} of ${m.totalPossibleCrfs} possible entries). ${m.completionPct < 70 ? 'Below target — follow up with site coordinators.' : 'On track. Aim for ≥95% before database lock.'}`,
        regulatoryReadiness: `Regulatory checklist ${m.regulatoryProgress}% complete (${m.regulatoryChecked} / ${REG_TOTAL} items). ${m.regulatoryProgress < 80 ? 'Address outstanding items before FPFV.' : 'On track for timely regulatory submission.'}`,
        topRecommendations: [
          'Complete all CRFs and resolve open data queries before database lock per ICH E6(R2)',
          'Report SAEs to the IEC and CDSCO within protocol-specified timelines',
          `Address remaining ${REG_TOTAL - m.regulatoryChecked} regulatory checklist items — prioritize CTRI and CDSCO`,
        ],
      });
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleExport = async (key: string, fn: () => void) => {
    setExporting(key);
    await new Promise(r => setTimeout(r, 300));
    try { fn(); } catch { /* ignore */ }
    setExporting(null);
  };

  const metricCards = [
    { label: 'Enrolled',         value: m.enrolled,            icon: <PeopleIcon />,     color: '#0047AB', sub: `${m.active} active · ${m.completed} completed` },
    { label: 'CRF Completion',   value: `${m.completionPct}%`, icon: <AssignmentIcon />, color: '#00897B', sub: `${m.crfsFiled} / ${m.totalPossibleCrfs} entries` },
    { label: 'Adverse Events',   value: m.adverseEvents,       icon: <WarningIcon />,    color: m.adverseEvents > 3 ? '#D32F2F' : '#F57F17', sub: `across ${m.enrolled} subject${m.enrolled !== 1 ? 's' : ''}` },
    { label: 'Regulatory Ready', value: `${m.regulatoryProgress}%`, icon: <CheckIcon />, color: m.regulatoryProgress >= 80 ? '#2E7D32' : '#F57F17', sub: `${m.regulatoryChecked} / ${REG_TOTAL} items` },
  ];

  const docs = [
    { key: 'summary',    title: 'Trial Summary',         desc: 'Metrics, enrollment list, subject status breakdown', fn: () => pdfTrialSummary(edc, m) },
    { key: 'regulatory', title: 'Regulatory Report',     desc: 'CTRI · CDSCO · ICMR · GCP checklist completion',    fn: () => pdfRegulatoryReport(reg) },
    { key: 'crf',        title: 'CRF Completeness',      desc: 'Patient × visit form completeness matrix',           fn: () => pdfCRFMatrix(edc) },
    { key: 'cover',      title: 'Submission Cover Letter', desc: 'CDSCO cover letter template (ICH M11 compliant)',  fn: () => pdfCoverLetter() },
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <TopNavigation />
      <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0A1628', letterSpacing: '-0.02em', mb: 0.5 }}>
              Analysis & Submission
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Live trial dashboard · AI insights · Export-ready submission package
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Tooltip title="Re-read data from EDC and Regulatory modules">
              <IconButton onClick={handleRefresh} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={insightsLoading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <AIIcon />}
              onClick={handleGenerateInsights}
              disabled={insightsLoading}
              sx={{ background: 'linear-gradient(135deg, #7C3AED 0%, #0047AB 100%)', boxShadow: 'none', fontWeight: 600 }}
            >
              {insightsLoading ? 'Analyzing…' : 'Generate AI Insights'}
            </Button>
          </Stack>
        </Box>

        {/* Metrics row */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
          {metricCards.map(card => (
            <Paper key={card.label} variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, borderColor: alpha(card.color, 0.2), backgroundColor: alpha(card.color, 0.03) }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 2, backgroundColor: alpha(card.color, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {card.icon}
                </Box>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: card.color, lineHeight: 1, mb: 0.5 }}>
                {card.value}
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#0A1628', display: 'block' }}>{card.label}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{card.sub}</Typography>
            </Paper>
          ))}
        </Box>

        {/* Trial Progress */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3, mb: 4 }}>

          {/* Enrollment table */}
          <Paper variant="outlined" sx={{ borderRadius: 2.5, overflow: 'hidden' }}>
            <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Patient Enrollment</Typography>
              <Chip label={`${m.enrolled} subjects`} size="small" sx={{ backgroundColor: alpha('#0047AB', 0.08), color: '#0047AB', fontWeight: 600 }} />
            </Box>
            {edc.patients.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                <PeopleIcon sx={{ fontSize: 40, opacity: 0.2, mb: 1 }} />
                <Typography variant="body2">No patients enrolled yet</Typography>
                <Typography variant="caption">Open the EDC module to enroll subjects</Typography>
              </Box>
            ) : (
              <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                {edc.patients.map((patient, i) => {
                  const cfg = STATUS_CFG[patient.status] ?? STATUS_CFG['screening'];
                  const filed = edc.entries.filter(e => e.patientId === patient.id);
                  const unique = new Set(filed.map(e => e.formId)).size;
                  return (
                    <Box key={patient.id}
                      sx={{ px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < edc.patients.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{patient.subjectId}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{patient.site}</Typography>
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{unique}/{edc.forms.length} CRFs</Typography>
                        <Chip label={cfg.label} size="small" sx={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: '0.7rem' }} />
                      </Stack>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Paper>

          {/* Regulatory track progress */}
          <Paper variant="outlined" sx={{ borderRadius: 2.5, overflow: 'hidden' }}>
            <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Regulatory Tracks</Typography>
              <Chip label={`${m.regulatoryProgress}% complete`} size="small"
                sx={{ backgroundColor: alpha(m.regulatoryProgress >= 80 ? '#2E7D32' : '#F57F17', 0.1), color: m.regulatoryProgress >= 80 ? '#2E7D32' : '#F57F17', fontWeight: 600 }}
              />
            </Box>
            <Box sx={{ p: 2.5 }}>
              <Stack spacing={2.5}>
                {REG_TRACKS.map(track => {
                  const checked = Object.entries(reg.checked).filter(([k, v]) => k.startsWith(track.prefix + '-') && v).length;
                  const pct = Math.round((checked / track.total) * 100);
                  return (
                    <Box key={track.prefix}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{track.name}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{checked} / {track.total}</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={pct} sx={{
                        height: 8, borderRadius: 4, backgroundColor: '#E5E7EB',
                        '& .MuiLinearProgress-bar': { backgroundColor: track.color, borderRadius: 4 },
                      }} />
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          </Paper>
        </Box>

        {/* Data completeness matrix */}
        {edc.patients.length > 0 && edc.forms.length > 0 && (
          <Paper variant="outlined" sx={{ borderRadius: 2.5, overflow: 'hidden', mb: 4 }}>
            <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>CRF Completeness Matrix</Typography>
            </Box>
            <Box sx={{ overflowX: 'auto' }}>
              <Box sx={{ minWidth: 500 }}>
                {/* Header row */}
                <Box sx={{ display: 'flex', px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', backgroundColor: '#F9FAFB' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, width: 140, flexShrink: 0 }}>Subject</Typography>
                  {edc.forms.map(form => (
                    <Typography key={form.id} variant="caption" sx={{ fontWeight: 700, flex: 1, textAlign: 'center' }}>{form.name}</Typography>
                  ))}
                </Box>
                {edc.patients.map((patient, i) => (
                  <Box key={patient.id}
                    sx={{ display: 'flex', px: 2.5, py: 1.5, alignItems: 'center', borderBottom: i < edc.patients.length - 1 ? '1px solid' : 'none', borderColor: 'divider', '&:hover': { backgroundColor: '#F9FAFB' } }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace', width: 140, flexShrink: 0 }}>{patient.subjectId}</Typography>
                    {edc.forms.map(form => {
                      const filed = edc.entries.some(e => e.patientId === patient.id && e.formId === form.id);
                      return (
                        <Box key={form.id} sx={{ flex: 1, textAlign: 'center' }}>
                          {filed
                            ? <Chip label="✓ Filed" size="small" sx={{ backgroundColor: alpha('#2E7D32', 0.1), color: '#2E7D32', fontWeight: 600, fontSize: '0.7rem' }} />
                            : <Typography variant="caption" sx={{ color: 'text.disabled' }}>— pending</Typography>
                          }
                        </Box>
                      );
                    })}
                  </Box>
                ))}
              </Box>
            </Box>
          </Paper>
        )}

        {/* AI Insights */}
        {(insights ?? insightsLoading) && (
          <Paper variant="outlined" sx={{ borderRadius: 2.5, overflow: 'hidden', mb: 4 }}>
            <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
              <AIIcon sx={{ color: '#7C3AED', fontSize: '1.1rem' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>AI Analysis</Typography>
              {insightsLoading && <CircularProgress size={14} sx={{ ml: 1 }} />}
            </Box>
            {insightsError && <Alert severity="info" sx={{ m: 2 }}>{insightsError}</Alert>}
            {insights && (
              <Box sx={{ p: 2.5 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
                  <InsightCard title="Enrollment Velocity"    text={insights.enrollmentVelocity}    color="#0047AB" />
                  <InsightCard title="Safety Profile"         text={insights.safetyProfile}         color="#D32F2F" />
                  <InsightCard title="Data Quality"           text={insights.dataQuality}           color="#00897B" />
                  <InsightCard title="Regulatory Readiness"   text={insights.regulatoryReadiness}   color="#7C3AED" />
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.08em', display: 'block', mb: 1.5 }}>
                  TOP RECOMMENDATIONS
                </Typography>
                <Stack spacing={1}>
                  {insights.topRecommendations.map((rec, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                      <Box sx={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: alpha('#7C3AED', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#7C3AED' }}>{i + 1}</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6 }}>{rec}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Paper>
        )}

        {/* Submission Package */}
        <Paper variant="outlined" sx={{ borderRadius: 2.5, overflow: 'hidden' }}>
          <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingIcon sx={{ color: '#0047AB', fontSize: '1.1rem' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Submission Package</Typography>
            <Box sx={{ flex: 1 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Downloads generate from your live trial data</Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 0 }}>
            {docs.map((doc, i) => (
              <Box key={doc.key} sx={{
                p: 2.5,
                borderRight: i % 2 === 0 ? '1px solid' : 'none',
                borderBottom: i < 2 ? '1px solid' : 'none',
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 2,
              }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>{doc.title}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{doc.desc}</Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={exporting === doc.key ? <CircularProgress size={14} /> : <DownloadIcon />}
                  disabled={exporting === doc.key}
                  onClick={() => { void handleExport(doc.key, doc.fn); }}
                  sx={{ flexShrink: 0 }}
                >
                  PDF
                </Button>
              </Box>
            ))}
          </Box>
        </Paper>

      </Box>
    </Box>
  );
}
