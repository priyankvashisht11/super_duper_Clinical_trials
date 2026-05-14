import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Chip, TextField, IconButton, Checkbox,
  Collapse, alpha, CircularProgress, Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  AutoAwesome as AIIcon,
  Send as SendIcon,
  OpenInNew as ExternalIcon,
  CheckCircle as DoneIcon,
} from '@mui/icons-material';
import { TopNavigation } from '../components/layout';

// ── Data ──────────────────────────────────────────────────────────────────────

interface CheckItem {
  id: string;
  label: string;
  detail: string;
  required: boolean;
}

interface Track {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  bgColor: string;
  tag: string;
  link?: string;
  linkLabel?: string;
  items: CheckItem[];
}

const TRACKS: Track[] = [
  {
    id: 'ctri',
    title: 'CTRI Registration',
    subtitle: 'Clinical Trials Registry — India (ICMR)',
    color: '#0047AB',
    bgColor: '#EFF6FF',
    tag: 'Mandatory',
    link: 'https://ctri.nic.in',
    linkLabel: 'ctri.nic.in',
    items: [
      { id: 'ctri-1',  label: 'Trial title (English + Hindi)',                      detail: 'Full scientific title and short public title. Hindi translation recommended for CTRI public display.',                                              required: true  },
      { id: 'ctri-2',  label: 'Brief summary (≤500 words)',                          detail: 'Lay-language summary of objectives, design, population, and intervention. Used in the public CTRI registry entry.',                                  required: true  },
      { id: 'ctri-3',  label: 'Ethics committee approval obtained',                  detail: 'Letter from duly constituted IEC registered with DHR. Must precede CTRI registration for interventional trials.',                                    required: true  },
      { id: 'ctri-4',  label: 'Trial phase defined',                                 detail: 'Phase I / II / III / IV or Observational. CDSCO classification must match.',                                                                         required: true  },
      { id: 'ctri-5',  label: 'Countries of recruitment specified',                  detail: 'List all countries where sites are active. Single-country India trials must state "India" only.',                                                    required: true  },
      { id: 'ctri-6',  label: 'Sample size justified and documented',                detail: 'Statistical power, alpha, expected effect size, attrition assumption. Matches Section 10 of protocol.',                                              required: true  },
      { id: 'ctri-7',  label: 'Expected trial start date set',                       detail: 'Date of first participant enrolment (FPFV). Can be approximate ± 3 months.',                                                                         required: true  },
      { id: 'ctri-8',  label: 'Principal Investigator details complete',             detail: 'Full name, medical registration number, institution address, specialisation, qualification (e.g. MD, DM).',                                          required: true  },
      { id: 'ctri-9',  label: 'Sponsor / CRO details complete',                      detail: 'Legal entity name, address, contact person, regulatory status (Indian vs foreign sponsor).',                                                         required: true  },
      { id: 'ctri-10', label: 'All trial sites in India listed',                     detail: 'Each site: site name, address, site PI name and registration number. Site registration on CTRI may also be required.',                               required: true  },
      { id: 'ctri-11', label: 'Intervention details documented',                     detail: 'Drug: INN, dose, route, frequency, duration. Device: model, manufacturer. Procedure: full description.',                                            required: true  },
      { id: 'ctri-12', label: 'Eligibility criteria finalised',                      detail: 'All inclusion and exclusion criteria from Protocol Section 5. Must match exactly — CTRI entry is a public commitment.',                              required: true  },
      { id: 'ctri-13', label: 'Primary and secondary endpoints defined',             detail: 'Primary endpoint with timepoint. Up to 5 secondary endpoints. Wording must match Protocol Section 3.',                                               required: true  },
      { id: 'ctri-14', label: 'Study design specified',                              detail: 'Randomised / non-randomised, parallel / crossover, open / single-blind / double-blind, controlled / uncontrolled.',                                  required: true  },
    ],
  },
  {
    id: 'cdsco',
    title: 'CDSCO Form 44',
    subtitle: 'Drugs Controller General — New Drug CT Application',
    color: '#D97706',
    bgColor: '#FFFBEB',
    tag: 'Mandatory (Drugs)',
    link: 'https://cdsco.gov.in',
    linkLabel: 'cdsco.gov.in',
    items: [
      { id: 'cdsco-1',  label: 'Schedule Y application prepared',                   detail: 'Cover letter addressed to DCGI, Form 44 with all annexures, filing fee challan. Submit through Sugam portal.',                                       required: true  },
      { id: 'cdsco-2',  label: 'IND classification confirmed',                      detail: 'New Chemical Entity (NCE), New Drug, Fixed Dose Combination or import case. Determines Schedule Y pathway.',                                          required: true  },
      { id: 'cdsco-3',  label: 'Protocol synopsis (≤2 pages) prepared',             detail: 'Brief synopsis including objective, design, sample size, endpoints, sites, sponsor. Submitted as part of Form 44.',                                   required: true  },
      { id: 'cdsco-4',  label: 'Investigator Brochure (IB) — latest version',       detail: 'Pre-clinical, CMC, and clinical safety data. Must be the latest IB version. IB version number must match protocol header.',                          required: true  },
      { id: 'cdsco-5',  label: 'Patient Information Sheet prepared',                detail: 'English version + at least one local language (Hindi mandatory; regional language for non-Hindi states). CDSCO template preferred.',                  required: true  },
      { id: 'cdsco-6',  label: 'Informed Consent Form — IEC reviewed',              detail: 'ICF approved by IEC with stamp and signature. Separate ICF for each site if multi-centre. Audio-visual ICF process for illiterate participants.',     required: true  },
      { id: 'cdsco-7',  label: 'IEC approval letter obtained',                      detail: 'Letter on IEC letterhead with DHR registration number, trial reference, IEC member list, quorum confirmation.',                                      required: true  },
      { id: 'cdsco-8',  label: 'Insurance / indemnity certificate obtained',        detail: 'Valid insurance policy covering trial-related injury compensation for participants at all Indian sites. Sponsor-issued or third-party.',              required: true  },
      { id: 'cdsco-9',  label: 'Sponsor undertaking letter prepared',               detail: 'Letter from sponsor (or authorised representative) committing to GCP, protocol conduct, and regulatory compliance.',                                  required: true  },
      { id: 'cdsco-10', label: 'GCP training certificates — all investigators',     detail: 'CDSCO-recognised GCP training (e.g. NIPER, NIMS, or WHO-CIOMS). Must be within past 3 years. Copy for each PI and co-investigator.',               required: true  },
      { id: 'cdsco-11', label: 'CV and medical registration — each site PI',        detail: 'Current CV (≤2 years old), MCI/NMC registration certificate. Specialist qualification relevant to indication.',                                      required: true  },
      { id: 'cdsco-12', label: 'Trial Master File initiated at each site',          detail: 'Site TMF with regulatory binder, ICF logs, protocol, IB, approval letters, delegation log, SAE forms. Ready for CDSCO inspection.',                 required: true  },
    ],
  },
  {
    id: 'icmr',
    title: 'ICMR Ethics',
    subtitle: 'National Ethical Guidelines 2017 — DHR Registration',
    color: '#059669',
    bgColor: '#ECFDF5',
    tag: 'Mandatory',
    link: 'https://main.icmr.nic.in',
    linkLabel: 'icmr.nic.in',
    items: [
      { id: 'icmr-1',  label: 'IEC duly constituted and DHR-registered',            detail: 'IEC must be registered with Department of Health Research (DHR). Verify registration number on the DHR IEC registry. Re-registration every 3 years.',  required: true  },
      { id: 'icmr-2',  label: 'Scientific merit review completed',                  detail: 'Separate scientific review by qualified scientific committee or peer review. IEC may co-opt experts if needed. Document minutes.',                     required: true  },
      { id: 'icmr-3',  label: 'Ethical review completed by IEC',                   detail: 'Full IEC review meeting with quorum (≥7 members including lay person, woman, legal expert). Minutes and approval letter.',                             required: true  },
      { id: 'icmr-4',  label: 'Community consultation documented (if applicable)',  detail: 'Required for community-based trials or involving vulnerable populations. Document method: focus groups, panchayat meetings, patient organisations.',    required: false },
      { id: 'icmr-5',  label: 'Informed consent process — adults with capacity',    detail: 'Process to be documented in protocol. Voluntary, comprehensible, without coercion. Witness required if participant illiterate. Audio-visual option.',   required: true  },
      { id: 'icmr-6',  label: 'Assent and consent — minors and vulnerable groups',  detail: 'Parental consent + assent for children ≥7 years. Separate procedure for participants with cognitive impairment. Guardian consent for others.',         required: false },
      { id: 'icmr-7',  label: 'Privacy and confidentiality plan documented',        detail: 'Data handling, storage, access controls, anonymisation, DPDP Act 2023 compliance. Who can access identifiable data and when.',                         required: true  },
      { id: 'icmr-8',  label: 'Post-trial access plan described in protocol',       detail: 'What happens to participants after trial ends. Access to proven beneficial treatments. Justified if post-trial access not possible.',                    required: true  },
      { id: 'icmr-9',  label: 'Compensation for trial-related injury — policy',     detail: 'Defined compensation policy aligned with CDSCO Schedule Y. Quantum of compensation, timeline, no-fault basis. Described in ICF.',                     required: true  },
      { id: 'icmr-10', label: 'Data management and sharing plan prepared',          detail: 'Data will be shared per ICMR open-data policy after trial completion. Plan submitted to IEC. De-identification before sharing.',                       required: true  },
    ],
  },
  {
    id: 'gcp',
    title: 'GCP Checklist',
    subtitle: 'ICH E6(R2) — Good Clinical Practice Readiness',
    color: '#6D28D9',
    bgColor: '#F5F3FF',
    tag: 'GCP ICH E6(R2)',
    items: [
      { id: 'gcp-1',  label: 'Investigator qualifications and responsibilities documented', detail: 'Signed Form FDA 1572 equivalent (or local equivalent). Duties listed in protocol. Delegation log signed by PI.',                                 required: true  },
      { id: 'gcp-2',  label: 'Delegation log prepared and signed',                          detail: 'Every person delegated trial tasks listed with name, initials, role, date delegated/revoked. Signed by PI. Updated when staff changes.',          required: true  },
      { id: 'gcp-3',  label: 'All protocol versions have IEC/IRB approval',                 detail: 'Each protocol amendment approved by IEC before implementation. Approval letters filed in TMF. No unapproved amendments implemented.',             required: true  },
      { id: 'gcp-4',  label: 'Latest IB version distributed to all investigators',          detail: 'IB version and date matches protocol header. Distribution log showing each investigator received it. Acknowledge receipt signed.',               required: true  },
      { id: 'gcp-5',  label: 'Trial Master File (TMF) structure established',               detail: 'DIA TMF Reference Model or equivalent. Essential documents per ICH E6(R2) Appendix. Both Investigator and Sponsor TMF sections.',               required: true  },
      { id: 'gcp-6',  label: 'Screen failure and enrolment logs set up',                    detail: 'Screen failure log captures reason for failure (coded, not identifiable). Enrolment log with subject ID, randomisation number, date.',           required: true  },
      { id: 'gcp-7',  label: 'SUSAR reporting procedure documented and tested',             detail: 'Serious Unexpected Suspected Adverse Reaction: 7-day fatal/life-threatening, 15-day others. Route: site → sponsor → CDSCO + IEC.',             required: true  },
      { id: 'gcp-8',  label: 'Protocol deviation / violation SOP in place',                 detail: 'Classification (major/minor), documentation in CRF, reporting to sponsor, IEC notification for major deviations. CAPA process.',                required: true  },
      { id: 'gcp-9',  label: 'Monitoring plan agreed with sponsor',                         detail: 'On-site and remote monitoring frequency, SDV scope, critical data fields, monitoring visit report template. Risk-based approach per E6(R2).',    required: true  },
      { id: 'gcp-10', label: 'EDC / data collection system validated and access-controlled', detail: 'Audit trail enabled and immutable. Role-based access. Validation documentation (IQ/OQ/PQ or equivalent). 21 CFR Part 11 / Annex 11 if applicable.', required: true  },
    ],
  },
];

// ── Persistence helpers ───────────────────────────────────────────────────────

const STORAGE_KEY = 'nextrial_regulatory_v1';

interface StoredState {
  checked: Record<string, boolean>;
  notes: Record<string, string>;
}

const load = (): StoredState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { checked: {}, notes: {} };
  } catch {
    return { checked: {}, notes: {} };
  }
};

const persist = (state: StoredState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

// ── Track summary card ────────────────────────────────────────────────────────

const TrackCard: React.FC<{
  track: Track;
  checkedCount: number;
  active: boolean;
  onToggle: () => void;
}> = ({ track, checkedCount, active, onToggle }) => {
  const total = track.items.length;
  const pct = Math.round((checkedCount / total) * 100);
  const done = checkedCount === total;

  return (
    <Box
      onClick={onToggle}
      sx={{
        border: '1px solid',
        borderColor: active ? track.color : '#E8EDF5',
        borderRadius: 3,
        p: 2.5,
        cursor: 'pointer',
        backgroundColor: active ? alpha(track.color, 0.04) : '#ffffff',
        transition: 'all 0.2s ease',
        '&:hover': { borderColor: track.color, backgroundColor: alpha(track.color, 0.03) },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0A1628' }}>
              {track.title}
            </Typography>
            {done && <DoneIcon sx={{ fontSize: 16, color: '#059669' }} />}
          </Box>
          <Typography sx={{ fontSize: '0.75rem', color: '#78909C', lineHeight: 1.4 }}>
            {track.subtitle}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={track.tag}
            size="small"
            sx={{ fontSize: '0.62rem', height: 18, backgroundColor: track.bgColor, color: track.color, fontWeight: 700, flexShrink: 0 }}
          />
          {active ? <CollapseIcon sx={{ fontSize: 20, color: '#90A4AE' }} /> : <ExpandIcon sx={{ fontSize: 20, color: '#90A4AE' }} />}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: '#E8EDF5', overflow: 'hidden' }}>
          <Box
            sx={{
              height: '100%',
              width: `${pct}%`,
              backgroundColor: done ? '#059669' : track.color,
              borderRadius: 3,
              transition: 'width 0.3s ease',
            }}
          />
        </Box>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: done ? '#059669' : track.color, flexShrink: 0 }}>
          {checkedCount}/{total}
        </Typography>
      </Box>
    </Box>
  );
};

// ── Single checklist item ─────────────────────────────────────────────────────

const ChecklistRow: React.FC<{
  item: CheckItem;
  trackColor: string;
  checked: boolean;
  notes: string;
  onCheck: (v: boolean) => void;
  onNotes: (v: string) => void;
}> = ({ item, trackColor, checked, notes, onCheck, onNotes }) => {
  const [showNotes, setShowNotes] = useState(Boolean(notes));
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [showAi, setShowAi] = useState(false);

  const handleAiAsk = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiResult('');
    try {
      const res = await fetch('http://localhost:3001/api/ai/section-assistance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionName: item.label,
          currentContent: notes,
          userQuery: aiQuery,
          context: { requirement: item.detail },
        }),
      });
      const json = await res.json();
      const raw = json.data?.suggestion || json.data?.response || json.data?.content || json.data || '';
      setAiResult(typeof raw === 'string' ? raw : JSON.stringify(raw));
    } catch {
      setAiResult('Backend not available. Start the server to use AI assistance.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Box
      sx={{
        borderBottom: '1px solid #F0F4F8',
        '&:last-child': { borderBottom: 'none' },
        backgroundColor: checked ? alpha('#059669', 0.02) : 'transparent',
        transition: 'background 0.2s',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, px: 3, py: 1.75 }}>
        <Checkbox
          checked={checked}
          onChange={(e) => onCheck(e.target.checked)}
          size="small"
          sx={{
            mt: 0.1,
            color: '#D0D9E8',
            '&.Mui-checked': { color: '#059669' },
            p: 0,
            flexShrink: 0,
          }}
        />
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: checked ? '#546E7A' : '#0A1628',
                    textDecoration: checked ? 'line-through' : 'none',
                    lineHeight: 1.4,
                  }}
                >
                  {item.label}
                </Typography>
                {!item.required && (
                  <Chip label="Conditional" size="small" sx={{ fontSize: '0.6rem', height: 16, color: '#78909C', borderColor: '#D0D9E8', border: '1px solid' }} />
                )}
              </Box>
              <Typography sx={{ fontSize: '0.78rem', color: '#78909C', lineHeight: 1.6, mt: 0.25 }}>
                {item.detail}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
              <Tooltip title="Add notes">
                <Button
                  size="small"
                  onClick={() => setShowNotes(v => !v)}
                  sx={{ fontSize: '0.7rem', color: '#90A4AE', minWidth: 0, px: 1, py: 0.25, '&:hover': { color: '#546E7A' } }}
                >
                  {showNotes ? 'Hide notes' : 'Notes'}
                </Button>
              </Tooltip>
              <Tooltip title="Ask AI">
                <IconButton
                  size="small"
                  onClick={() => setShowAi(v => !v)}
                  sx={{ color: showAi ? trackColor : '#B0BEC5', '&:hover': { color: trackColor, backgroundColor: alpha(trackColor, 0.08) } }}
                >
                  <AIIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Notes field */}
          {showNotes && (
            <TextField
              fullWidth
              multiline
              maxRows={4}
              size="small"
              placeholder="Add notes, document references, or action items…"
              value={notes}
              onChange={(e) => onNotes(e.target.value)}
              sx={{
                mt: 1.25,
                '& .MuiOutlinedInput-root': {
                  fontSize: '0.82rem',
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#E8EDF5' },
                  '&.Mui-focused fieldset': { borderColor: trackColor },
                },
              }}
            />
          )}

          {/* AI assist */}
          {showAi && (
            <Box sx={{ mt: 1.25, p: 1.5, backgroundColor: alpha(trackColor, 0.04), borderRadius: 2, border: `1px solid ${alpha(trackColor, 0.15)}` }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={`Ask AI about this requirement… e.g. "What documents do I need?"`}
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAiAsk(); } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontSize: '0.8rem',
                      borderRadius: 1.5,
                      backgroundColor: '#ffffff',
                      '& fieldset': { borderColor: 'transparent' },
                      '&.Mui-focused fieldset': { borderColor: trackColor },
                    },
                  }}
                />
                <IconButton
                  size="small"
                  onClick={handleAiAsk}
                  disabled={!aiQuery.trim() || aiLoading}
                  sx={{ color: trackColor, '&.Mui-disabled': { opacity: 0.4 } }}
                >
                  {aiLoading ? <CircularProgress size={15} color="inherit" /> : <SendIcon sx={{ fontSize: 15 }} />}
                </IconButton>
              </Box>
              {aiResult && (
                <Box sx={{ mt: 1.25, p: 1.5, backgroundColor: '#ffffff', borderRadius: 1.5, border: '1px solid #E8EDF5' }}>
                  <Typography sx={{ fontSize: '0.82rem', color: '#0A1628', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    {aiResult}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => { onNotes(notes ? `${notes}\n\n${aiResult}` : aiResult); setAiResult(''); setAiQuery(''); if (!showNotes) setShowNotes(true); }}
                    sx={{ mt: 1, fontSize: '0.72rem', color: trackColor, px: 1, py: 0.25 }}
                  >
                    Save to notes
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

// ── Full track checklist (expanded) ──────────────────────────────────────────

const TrackChecklist: React.FC<{
  track: Track;
  checked: Record<string, boolean>;
  notes: Record<string, string>;
  onCheck: (id: string, v: boolean) => void;
  onNotes: (id: string, v: string) => void;
}> = ({ track, checked, notes, onCheck, onNotes }) => (
  <Box
    sx={{
      border: `1px solid ${alpha(track.color, 0.2)}`,
      borderTop: 'none',
      borderRadius: '0 0 12px 12px',
      overflow: 'hidden',
      backgroundColor: '#ffffff',
      mb: 3,
    }}
  >
    {/* Track header inside checklist */}
    <Box
      sx={{
        px: 3,
        py: 2,
        backgroundColor: alpha(track.color, 0.04),
        borderBottom: `1px solid ${alpha(track.color, 0.1)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Typography sx={{ fontSize: '0.78rem', color: track.color, fontWeight: 600 }}>
        {track.items.filter(i => i.required).length} required · {track.items.filter(i => !i.required).length} conditional
      </Typography>
      {track.link && (
        <Button
          size="small"
          endIcon={<ExternalIcon sx={{ fontSize: '13px !important' }} />}
          href={track.link}
          target="_blank"
          rel="noopener noreferrer"
          component="a"
          sx={{ fontSize: '0.72rem', color: track.color, py: 0.25, px: 1, '&:hover': { backgroundColor: alpha(track.color, 0.08) } }}
        >
          {track.linkLabel}
        </Button>
      )}
    </Box>

    {track.items.map(item => (
      <ChecklistRow
        key={item.id}
        item={item}
        trackColor={track.color}
        checked={!!checked[item.id]}
        notes={notes[item.id] || ''}
        onCheck={(v) => onCheck(item.id, v)}
        onNotes={(v) => onNotes(item.id, v)}
      />
    ))}
  </Box>
);

// ── Page ──────────────────────────────────────────────────────────────────────

export const RegulatoryPage: React.FC = () => {
  const [state, setState] = useState<StoredState>({ checked: {}, notes: {} });
  const [activeTrack, setActiveTrack] = useState<string | null>('ctri');

  useEffect(() => {
    setState(load());
  }, []);

  const handleCheck = useCallback((id: string, v: boolean) => {
    setState(prev => {
      const next = { ...prev, checked: { ...prev.checked, [id]: v } };
      persist(next);
      return next;
    });
  }, []);

  const handleNotes = useCallback((id: string, v: string) => {
    setState(prev => {
      const next = { ...prev, notes: { ...prev.notes, [id]: v } };
      persist(next);
      return next;
    });
  }, []);

  const checkedCountFor = (track: Track) =>
    track.items.filter(i => state.checked[i.id]).length;

  const totalItems = TRACKS.reduce((sum, t) => sum + t.items.length, 0);
  const totalChecked = TRACKS.reduce((sum, t) => sum + checkedCountFor(t), 0);
  const overallPct = Math.round((totalChecked / totalItems) * 100);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F7F9FC' }}>
      <TopNavigation />

      {/* Page header */}
      <Box sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid #E8EDF5' }}>
        <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 5 }, py: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip label="Regulatory" size="small" sx={{ fontSize: '0.68rem', height: 20, backgroundColor: '#FFFBEB', color: '#D97706', fontWeight: 700 }} />
                <Typography sx={{ fontSize: '0.75rem', color: '#90A4AE' }}>India Regulatory Prep</Typography>
              </Box>
              <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#0A1628', lineHeight: 1.2, mb: 0.75 }}>
                Regulatory Submission Prep
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', color: '#546E7A', maxWidth: 560, lineHeight: 1.7 }}>
                Four tracks covering CTRI registration, CDSCO Form 44, ICMR ethics, and GCP readiness.
                Check off each requirement as you go — AI can help with any item.
              </Typography>
            </Box>
            {/* Overall progress */}
            <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
              <Typography sx={{ fontSize: '2.5rem', fontWeight: 900, color: overallPct === 100 ? '#059669' : '#0047AB', lineHeight: 1 }}>
                {overallPct}%
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#90A4AE', mt: 0.25 }}>
                {totalChecked} of {totalItems} items
              </Typography>
              <Box sx={{ width: 120, height: 5, borderRadius: 3, backgroundColor: '#E8EDF5', overflow: 'hidden', mt: 1 }}>
                <Box sx={{ height: '100%', width: `${overallPct}%`, backgroundColor: overallPct === 100 ? '#059669' : '#0047AB', borderRadius: 3, transition: 'width 0.4s' }} />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 5 }, py: 4 }}>
        {/* Track summary cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
            mb: 3,
          }}
        >
          {TRACKS.map(track => (
            <TrackCard
              key={track.id}
              track={track}
              checkedCount={checkedCountFor(track)}
              active={activeTrack === track.id}
              onToggle={() => setActiveTrack(prev => prev === track.id ? null : track.id)}
            />
          ))}
        </Box>

        {/* Active track checklist */}
        {TRACKS.map(track => (
          <Collapse key={track.id} in={activeTrack === track.id} timeout={250}>
            <TrackChecklist
              track={track}
              checked={state.checked}
              notes={state.notes}
              onCheck={handleCheck}
              onNotes={handleNotes}
            />
          </Collapse>
        ))}

        {/* Bottom hint */}
        <Box sx={{ textAlign: 'center', py: 3, color: '#B0BEC5' }}>
          <Typography sx={{ fontSize: '0.78rem' }}>
            Your checklist is saved in this browser. Export to PDF coming in Sprint 6.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default RegulatoryPage;
