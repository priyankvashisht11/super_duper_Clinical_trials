import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Button, IconButton, Chip, TextField, Tab, Tabs,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem,
  alpha, Tooltip, Avatar, AvatarGroup, Badge, Snackbar, Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  ContentCopy as DuplicateIcon,
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
  Science as ScienceIcon,
  TableChart as TableIcon,
  Assignment as FormIcon,
  People as PeopleIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as RadioIcon,
  TextFields as TextIcon,
  Numbers as NumberIcon,
  CalendarToday as DateIcon,
  ArrowDropDown as SelectIcon,
  LinearScale as SliderIcon,
  Notes as TextareaIcon,
  History as HistoryIcon,
  RestoreFromTrash as RestoreIcon,
  WifiOff as OfflineIcon,
  Wifi as OnlineIcon,
  FiberManualRecord as DotIcon,
  Commit as CommitIcon,
  CompareArrows as DiffIcon,
} from '@mui/icons-material';
import { TopNavigation } from '../components/layout/TopNavigation';

// ── Types ─────────────────────────────────────────────────────────────────────

type FieldType = 'text' | 'number' | 'date' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'scale';

interface FormField {
  id: string; type: FieldType; label: string; required: boolean;
  options?: string[]; min?: number; max?: number; placeholder?: string;
}
interface CRFForm {
  id: string; name: string; description: string;
  fields: FormField[]; createdAt: string; createdBy: string;
}
interface DataRecord {
  id: string; formId: string; formName: string;
  submittedBy: string; submittedAt: string; data: Record<string, any>;
}
interface CollectState { forms: CRFForm[]; records: DataRecord[]; }

// Sprint 11 — Git-inspired versioning
interface Commit {
  hash: string;           // 7-char like git
  timestamp: string;
  author: string;
  message: string;        // primary change as commit title
  changes: string[];      // full list of changes (git diff lines)
  snapshot: CollectState; // full state at commit point
}

// Sprint 10 — Presence
interface PresenceUser { id: string; name: string; color: string; tab: string; lastSeen: number; }

// ── Constants ─────────────────────────────────────────────────────────────────

const STORAGE_KEY  = 'nextrial_collect_v1';
const COMMITS_KEY  = 'nextrial_collect_commits_v1';
const CHANNEL_NAME = 'nextrial_collect_sync';
const PRESENCE_COLORS = ['#0047AB','#00897B','#7C3AED','#D97706','#DC2626','#059669'];

// ── Storage helpers ───────────────────────────────────────────────────────────

function loadState(): CollectState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CollectState;
  } catch {}
  return {
    forms: [
      {
        id: 'f-demo-1', name: 'Baseline Assessment',
        description: 'Initial patient evaluation at Visit 1',
        createdAt: new Date().toISOString(), createdBy: 'PI',
        fields: [
          { id: 'f1', type: 'text',   label: 'Subject ID',           required: true,  placeholder: 'e.g. PT-001' },
          { id: 'f2', type: 'date',   label: 'Visit Date',           required: true  },
          { id: 'f3', type: 'number', label: 'Age (years)',          required: true,  min: 18, max: 100 },
          { id: 'f4', type: 'select', label: 'Gender',               required: true,  options: ['Male','Female','Other','Prefer not to say'] },
          { id: 'f5', type: 'number', label: 'Weight (kg)',          required: false, min: 30, max: 200 },
          { id: 'f6', type: 'number', label: 'Height (cm)',          required: false, min: 100, max: 220 },
          { id: 'f7', type: 'radio',  label: 'ECOG Performance Status', required: true, options: ['0 – Fully active','1 – Restricted strenuous activity','2 – Ambulatory','3 – Limited self-care','4 – Fully disabled'] },
          { id: 'f8', type: 'scale',  label: 'Pain Score (VAS)',    required: false, min: 0, max: 10 },
          { id: 'f9', type: 'textarea', label: 'Clinical Notes',    required: false, placeholder: 'Observations, co-morbidities, concomitant medications…' },
        ],
      },
      {
        id: 'f-demo-2', name: 'Adverse Event Log',
        description: 'Record any adverse event during the trial',
        createdAt: new Date().toISOString(), createdBy: 'PI',
        fields: [
          { id: 'a1', type: 'text',   label: 'Subject ID',           required: true  },
          { id: 'a2', type: 'date',   label: 'AE Onset Date',        required: true  },
          { id: 'a3', type: 'text',   label: 'AE Description',       required: true  },
          { id: 'a4', type: 'select', label: 'Severity (CTCAE)',     required: true,  options: ['Grade 1 – Mild','Grade 2 – Moderate','Grade 3 – Severe','Grade 4 – Life-threatening','Grade 5 – Fatal'] },
          { id: 'a5', type: 'radio',  label: 'Causality',            required: true,  options: ['Unrelated','Possibly related','Probably related','Definitely related'] },
          { id: 'a6', type: 'radio',  label: 'Serious AE?',         required: true,  options: ['Yes','No'] },
          { id: 'a7', type: 'textarea', label: 'Action Taken',      required: true  },
          { id: 'a8', type: 'radio',  label: 'Outcome',              required: true,  options: ['Resolved','Resolving','Not resolved','Resolved with sequelae','Fatal','Unknown'] },
        ],
      },
    ],
    records: [],
  };
}

function saveState(s: CollectState) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

function loadCommits(): Commit[] {
  try { return JSON.parse(localStorage.getItem(COMMITS_KEY) || '[]'); } catch { return []; }
}
function saveCommits(c: Commit[]) { localStorage.setItem(COMMITS_KEY, JSON.stringify(c.slice(0, 60))); }

// ── Git-inspired diff + commit ────────────────────────────────────────────────

function diffStates(prev: CollectState, next: CollectState): string[] {
  const lines: string[] = [];
  // Forms added
  next.forms.forEach(f => { if (!prev.forms.find(p => p.id === f.id)) lines.push(`+ Added form "${f.name}"`); });
  // Forms deleted
  prev.forms.forEach(f => { if (!next.forms.find(n => n.id === f.id)) lines.push(`- Deleted form "${f.name}"`); });
  // Field-level diff
  next.forms.forEach(nf => {
    const pf = prev.forms.find(f => f.id === nf.id);
    if (!pf) return;
    nf.fields.forEach(ff => { if (!pf.fields.find(pff => pff.id === ff.id)) lines.push(`+ Added field "${ff.label}" → ${nf.name}`); });
    pf.fields.forEach(ff => { if (!nf.fields.find(nff => nff.id === ff.id)) lines.push(`- Removed field "${ff.label}" from ${nf.name}`); });
    // Label renames
    nf.fields.forEach(ff => { const pff = pf.fields.find(p => p.id === ff.id); if (pff && pff.label !== ff.label) lines.push(`~ Renamed "${pff.label}" → "${ff.label}" in ${nf.name}`); });
  });
  // Records
  const newRec = next.records.length - prev.records.length;
  if (newRec > 0) lines.push(`+ Submitted ${newRec} new record${newRec > 1 ? 's' : ''}`);
  if (newRec < 0) lines.push(`- Deleted ${Math.abs(newRec)} record${Math.abs(newRec) > 1 ? 's' : ''}`);
  return lines;
}

function makeHash() { return Math.random().toString(36).slice(2, 9); }

function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

// ── Field icons / labels ──────────────────────────────────────────────────────

const FIELD_ICONS: Record<FieldType, React.ReactNode> = {
  text: <TextIcon sx={{ fontSize: 14 }} />, number: <NumberIcon sx={{ fontSize: 14 }} />,
  date: <DateIcon sx={{ fontSize: 14 }} />, select: <SelectIcon sx={{ fontSize: 14 }} />,
  radio: <RadioIcon sx={{ fontSize: 14 }} />, checkbox: <CheckIcon sx={{ fontSize: 14 }} />,
  textarea: <TextareaIcon sx={{ fontSize: 14 }} />, scale: <SliderIcon sx={{ fontSize: 14 }} />,
};
const FIELD_LABELS: Record<FieldType, string> = {
  text: 'Short text', number: 'Number', date: 'Date', select: 'Dropdown',
  radio: 'Single choice', checkbox: 'Multi-choice', textarea: 'Long text', scale: 'Scale (0–10)',
};

function uid() { return Math.random().toString(36).slice(2); }
const inputSx = { '& .MuiOutlinedInput-root': { fontSize: '0.85rem', backgroundColor: '#fff' } };

// ── Form Builder ──────────────────────────────────────────────────────────────

const FormBuilder: React.FC<{ state: CollectState; onChange: (s: CollectState) => void }> = ({ state, onChange }) => {
  const [selId, setSelId] = useState<string | null>(state.forms[0]?.id ?? null);
  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editFid, setEditFid] = useState<string | null>(null);

  const form = state.forms.find(f => f.id === selId) ?? null;

  const addForm = () => {
    if (!newName.trim()) return;
    const nf: CRFForm = { id: uid(), name: newName.trim(), description: newDesc.trim(), fields: [], createdAt: new Date().toISOString(), createdBy: 'You' };
    onChange({ ...state, forms: [...state.forms, nf] });
    setSelId(nf.id); setNewOpen(false); setNewName(''); setNewDesc('');
  };
  const deleteForm = (id: string) => {
    const s = { ...state, forms: state.forms.filter(f => f.id !== id), records: state.records.filter(r => r.formId !== id) };
    onChange(s); if (selId === id) setSelId(s.forms[0]?.id ?? null);
  };
  const addField = (type: FieldType) => {
    if (!form) return;
    const nf: FormField = { id: uid(), type, label: FIELD_LABELS[type], required: false, ...((['select','radio','checkbox'].includes(type)) ? { options: ['Option 1','Option 2'] } : {}), ...(type === 'scale' ? { min: 0, max: 10 } : {}), ...(type === 'number' ? { min: 0 } : {}) };
    const updated = { ...form, fields: [...form.fields, nf] };
    onChange({ ...state, forms: state.forms.map(f => f.id === form.id ? updated : f) });
    setEditFid(nf.id);
  };
  const upd = (fid: string, patch: Partial<FormField>) => {
    if (!form) return;
    onChange({ ...state, forms: state.forms.map(f => f.id === form.id ? { ...form, fields: form.fields.map(ff => ff.id === fid ? { ...ff, ...patch } : ff) } : f) });
  };
  const removeField = (fid: string) => { if (!form) return; onChange({ ...state, forms: state.forms.map(f => f.id === form.id ? { ...form, fields: form.fields.filter(ff => ff.id !== fid) } : f) }); };
  const moveField = (fid: string, dir: 'up' | 'down') => {
    if (!form) return;
    const idx = form.fields.findIndex(ff => ff.id === fid);
    if ((dir === 'up' && idx === 0) || (dir === 'down' && idx === form.fields.length - 1)) return;
    const arr = [...form.fields]; const swap = dir === 'up' ? idx - 1 : idx + 1;
    [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
    onChange({ ...state, forms: state.forms.map(f => f.id === form.id ? { ...form, fields: arr } : f) });
  };

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      {/* Sidebar */}
      <Box sx={{ width: { xs: '100%', md: 260 }, flexShrink: 0, borderRight: '1px solid #E8EDF5', overflowY: 'auto', backgroundColor: '#fff' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #E8EDF5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#546E7A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Forms</Typography>
          <Button size="small" startIcon={<AddIcon sx={{ fontSize: '13px !important' }} />} onClick={() => setNewOpen(true)} sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#0047AB', minWidth: 0, px: 1 }}>New</Button>
        </Box>
        {state.forms.map(f => (
          <Box key={f.id} onClick={() => setSelId(f.id)} sx={{ px: 2, py: 1.5, cursor: 'pointer', borderLeft: selId === f.id ? '2px solid #0047AB' : '2px solid transparent', backgroundColor: selId === f.id ? alpha('#0047AB', 0.05) : 'transparent', '&:hover': { backgroundColor: alpha('#0047AB', 0.03) } }}>
            <Typography sx={{ fontWeight: selId === f.id ? 600 : 400, fontSize: '0.85rem', color: selId === f.id ? '#0047AB' : '#0A1628' }}>{f.name}</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#90A4AE', mt: 0.25 }}>{f.fields.length} fields · {f.createdBy}</Typography>
          </Box>
        ))}
      </Box>

      {/* Editor */}
      {form ? (
        <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0A1628' }}>{form.name}</Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#546E7A', mt: 0.25 }}>{form.description || 'No description'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Duplicate"><IconButton size="small" onClick={() => { const d: CRFForm = { ...form, id: uid(), name: `${form.name} (copy)`, createdAt: new Date().toISOString() }; onChange({ ...state, forms: [...state.forms, d] }); setSelId(d.id); }}><DuplicateIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
              <Tooltip title="Delete form"><IconButton size="small" onClick={() => deleteForm(form.id)} sx={{ color: '#DC2626' }}><DeleteIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
            </Box>
          </Box>

          {form.fields.map((ff, idx) => (
            <Box key={ff.id} sx={{ border: '1px solid', borderColor: editFid === ff.id ? '#0047AB' : '#E8EDF5', borderRadius: 2, mb: 1.5, overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.25, backgroundColor: editFid === ff.id ? alpha('#0047AB', 0.04) : '#FAFBFC', cursor: 'pointer' }} onClick={() => setEditFid(editFid === ff.id ? null : ff.id)}>
                <Box sx={{ color: '#7C3AED', display: 'flex' }}>{FIELD_ICONS[ff.type]}</Box>
                <Typography sx={{ flex: 1, fontSize: '0.875rem', fontWeight: 500, color: '#0A1628' }}>{ff.label || '(untitled)'}</Typography>
                {ff.required && <Chip label="Required" size="small" sx={{ fontSize: '0.6rem', height: 16, backgroundColor: alpha('#DC2626', 0.1), color: '#DC2626', fontWeight: 700 }} />}
                <Chip label={FIELD_LABELS[ff.type]} size="small" sx={{ fontSize: '0.6rem', height: 16, backgroundColor: alpha('#7C3AED', 0.08), color: '#7C3AED', fontWeight: 600 }} />
                <IconButton size="small" onClick={e => { e.stopPropagation(); moveField(ff.id, 'up'); }} disabled={idx === 0} sx={{ p: 0.25 }}><UpIcon sx={{ fontSize: 14 }} /></IconButton>
                <IconButton size="small" onClick={e => { e.stopPropagation(); moveField(ff.id, 'down'); }} disabled={idx === form.fields.length - 1} sx={{ p: 0.25 }}><DownIcon sx={{ fontSize: 14 }} /></IconButton>
                <IconButton size="small" onClick={e => { e.stopPropagation(); removeField(ff.id); }} sx={{ color: '#DC2626', p: 0.25 }}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton>
              </Box>
              {editFid === ff.id && (
                <Box sx={{ p: 2, borderTop: '1px solid #E8EDF5', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                  <TextField size="small" label="Field Label" value={ff.label} onChange={e => upd(ff.id, { label: e.target.value })} sx={{ gridColumn: 'span 2', ...inputSx }} />
                  <TextField size="small" label="Placeholder" value={ff.placeholder ?? ''} onChange={e => upd(ff.id, { placeholder: e.target.value })} sx={inputSx} />
                  <TextField select size="small" label="Required?" value={ff.required ? 'yes' : 'no'} onChange={e => upd(ff.id, { required: e.target.value === 'yes' })} sx={inputSx}>
                    <MenuItem value="yes">Required</MenuItem><MenuItem value="no">Optional</MenuItem>
                  </TextField>
                  {(ff.type === 'number' || ff.type === 'scale') && <>
                    <TextField size="small" label="Min" type="number" value={ff.min ?? ''} onChange={e => upd(ff.id, { min: Number(e.target.value) })} sx={inputSx} />
                    <TextField size="small" label="Max" type="number" value={ff.max ?? ''} onChange={e => upd(ff.id, { max: Number(e.target.value) })} sx={inputSx} />
                  </>}
                  {(['select','radio','checkbox'].includes(ff.type)) && (
                    <Box sx={{ gridColumn: 'span 2' }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#546E7A', mb: 1 }}>Options (one per line)</Typography>
                      <TextField multiline minRows={3} fullWidth size="small" value={(ff.options ?? []).join('\n')} onChange={e => upd(ff.id, { options: e.target.value.split('\n') })} sx={inputSx} />
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          ))}

          <Box sx={{ mt: 2.5, p: 2, border: '1px dashed #D0D9E8', borderRadius: 2, backgroundColor: '#FAFBFC' }}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#546E7A', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Add field</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {(Object.keys(FIELD_LABELS) as FieldType[]).map(type => (
                <Button key={type} size="small" startIcon={FIELD_ICONS[type]} onClick={() => addField(type)} sx={{ fontSize: '0.72rem', fontWeight: 600, px: 1.25, py: 0.5, borderRadius: 1.5, backgroundColor: alpha('#0047AB', 0.06), color: '#0047AB', '&:hover': { backgroundColor: alpha('#0047AB', 0.12) } }}>
                  {FIELD_LABELS[type]}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>
      ) : (
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
          <FormIcon sx={{ fontSize: 48, color: '#D0D9E8' }} />
          <Typography sx={{ color: '#90A4AE', fontSize: '0.875rem' }}>Select a form or create a new one</Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setNewOpen(true)} sx={{ borderColor: '#0047AB', color: '#0047AB', fontWeight: 600 }}>New Form</Button>
        </Box>
      )}

      <Dialog open={newOpen} onClose={() => setNewOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>New CRF Form</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField autoFocus fullWidth label="Form name" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addForm(); }} sx={{ mb: 2, mt: 1 }} />
          <TextField fullWidth label="Description (optional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} multiline rows={2} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setNewOpen(false)} sx={{ color: '#546E7A' }}>Cancel</Button>
          <Button variant="contained" onClick={addForm} disabled={!newName.trim()} sx={{ background: '#0047AB', fontWeight: 600, boxShadow: 'none' }}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ── Data Entry ────────────────────────────────────────────────────────────────

const DataEntry: React.FC<{ state: CollectState; onChange: (s: CollectState) => void; currentUser: string }> = ({ state, onChange, currentUser }) => {
  const [selFormId, setSelFormId] = useState(state.forms[0]?.id ?? '');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);

  const form = state.forms.find(f => f.id === selFormId);
  useEffect(() => { setFormData({}); setSubmitted(false); }, [selFormId]);

  const submit = () => {
    if (!form) return;
    const missing = form.fields.filter(f => f.required && !formData[f.id] && formData[f.id] !== 0);
    if (missing.length) { alert(`Required: ${missing.map(f => f.label).join(', ')}`); return; }
    const rec: DataRecord = { id: uid(), formId: form.id, formName: form.name, submittedBy: currentUser, submittedAt: new Date().toISOString(), data: { ...formData } };
    onChange({ ...state, records: [...state.records, rec] });
    setFormData({}); setSubmitted(true); setTimeout(() => setSubmitted(false), 3000);
  };

  const renderField = (ff: FormField) => {
    const val = formData[ff.id] ?? ''; const set = (v: any) => setFormData(p => ({ ...p, [ff.id]: v }));
    const label = `${ff.label}${ff.required ? ' *' : ''}`;
    switch (ff.type) {
      case 'text':    return <TextField key={ff.id} fullWidth size="small" label={label} value={val} onChange={e => set(e.target.value)} {...(ff.placeholder ? { placeholder: ff.placeholder } : {})} sx={inputSx} />;
      case 'textarea':return <TextField key={ff.id} fullWidth size="small" label={label} value={val} onChange={e => set(e.target.value)} multiline minRows={3} {...(ff.placeholder ? { placeholder: ff.placeholder } : {})} sx={inputSx} />;
      case 'number':  return <TextField key={ff.id} fullWidth size="small" label={label} type="number" value={val} onChange={e => set(e.target.value)} inputProps={{ min: ff.min, max: ff.max }} sx={inputSx} />;
      case 'date':    return <TextField key={ff.id} fullWidth size="small" label={label} type="date" value={val} onChange={e => set(e.target.value)} InputLabelProps={{ shrink: true }} sx={inputSx} />;
      case 'select':  return (
        <TextField key={ff.id} select fullWidth size="small" label={label} value={val} onChange={e => set(e.target.value)} sx={inputSx}>
          <MenuItem value="">Select…</MenuItem>
          {(ff.options ?? []).map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
        </TextField>
      );
      case 'radio': case 'checkbox': {
        const isMulti = ff.type === 'checkbox';
        return (
          <Box key={ff.id}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#546E7A', mb: 0.75 }}>{label}</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {(ff.options ?? []).map(o => {
                const checked = isMulti ? (Array.isArray(val) ? val.includes(o) : false) : val === o;
                return (
                  <Box key={o} onClick={() => isMulti ? set(checked ? (Array.isArray(val) ? val.filter((c: string) => c !== o) : []) : [...(Array.isArray(val) ? val : []), o]) : set(o)}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', px: 1.5, py: 0.75, borderRadius: 1.5, border: '1px solid', borderColor: checked ? '#0047AB' : '#E8EDF5', backgroundColor: checked ? alpha('#0047AB', 0.05) : 'transparent', transition: 'all 0.1s' }}>
                    {checked ? <CheckIcon sx={{ fontSize: 16, color: '#0047AB' }} /> : <RadioIcon sx={{ fontSize: 16, color: '#D0D9E8' }} />}
                    <Typography sx={{ fontSize: '0.85rem', color: checked ? '#0047AB' : '#3D4E63', fontWeight: checked ? 600 : 400 }}>{o}</Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        );
      }
      case 'scale': {
        const min = ff.min ?? 0; const max = ff.max ?? 10;
        return (
          <Box key={ff.id}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#546E7A', mb: 0.75 }}>{label}{val !== '' && <span style={{ color: '#0047AB', marginLeft: 8, fontSize: '0.95rem', fontWeight: 800 }}>{val}</span>}</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {Array.from({ length: max - min + 1 }, (_, i) => i + min).map(n => (
                <Box key={n} onClick={() => set(n)} sx={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1.5, border: '1px solid', borderColor: val === n ? '#0047AB' : '#E8EDF5', backgroundColor: val === n ? '#0047AB' : 'transparent', color: val === n ? '#fff' : '#3D4E63', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.1s', '&:hover': { borderColor: '#0047AB', backgroundColor: alpha('#0047AB', 0.08) } }}>{n}</Box>
              ))}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography sx={{ fontSize: '0.68rem', color: '#90A4AE' }}>None · {min}</Typography>
              <Typography sx={{ fontSize: '0.68rem', color: '#90A4AE' }}>Maximum · {max}</Typography>
            </Box>
          </Box>
        );
      }
      default: return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 680, mx: 'auto', px: 3, py: 4 }}>
      <TextField select fullWidth size="small" label="Select form" value={selFormId} onChange={e => setSelFormId(e.target.value)} sx={{ mb: 3, ...inputSx }}>
        {state.forms.map(f => <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>)}
      </TextField>
      {form ? (
        <>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0A1628', mb: 0.5 }}>{form.name}</Typography>
          {form.description && <Typography sx={{ fontSize: '0.82rem', color: '#546E7A', mb: 3 }}>{form.description}</Typography>}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>{form.fields.map(ff => renderField(ff))}</Box>
          {submitted && (
            <Box sx={{ mt: 3, p: 2, borderRadius: 2, backgroundColor: alpha('#059669', 0.08), border: '1px solid', borderColor: alpha('#059669', 0.3), display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckIcon sx={{ color: '#059669', fontSize: 20 }} />
              <Typography sx={{ color: '#059669', fontWeight: 600, fontSize: '0.875rem' }}>Record submitted successfully</Typography>
            </Box>
          )}
          <Button variant="contained" onClick={submit} fullWidth sx={{ mt: 3.5, background: 'linear-gradient(135deg, #0047AB 0%, #00897B 100%)', fontWeight: 700, py: 1.25, borderRadius: 2, boxShadow: 'none', fontSize: '0.9rem' }}>
            Submit Record
          </Button>
        </>
      ) : <Typography sx={{ color: '#90A4AE', textAlign: 'center' }}>No forms — create one in Form Builder</Typography>}
    </Box>
  );
};

// ── Records ───────────────────────────────────────────────────────────────────

const Records: React.FC<{ state: CollectState; onChange: (s: CollectState) => void }> = ({ state, onChange }) => {
  const [filterForm, setFilterForm] = useState('');
  const [viewRec, setViewRec] = useState<DataRecord | null>(null);
  const filtered = filterForm ? state.records.filter(r => r.formId === filterForm) : state.records;

  const exportCSV = () => {
    if (!filtered.length) return;
    const keys = Array.from(new Set(filtered.flatMap(r => Object.keys(r.data))));
    const header = ['Record ID','Form','Submitted By','Date',...keys];
    const rows = filtered.map(r => [r.id, r.formName, r.submittedBy, new Date(r.submittedAt).toLocaleString(), ...keys.map(k => r.data[k] ?? '')]);
    const csv = [header,...rows].map(row => row.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download = `nextrial_data_${Date.now()}.csv`; a.click();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField select size="small" label="Filter by form" value={filterForm} onChange={e => setFilterForm(e.target.value)} sx={{ minWidth: 220, ...inputSx }}>
          <MenuItem value="">All forms</MenuItem>
          {state.forms.map(f => <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>)}
        </TextField>
        <Typography sx={{ color: '#546E7A', fontSize: '0.82rem' }}>{filtered.length} record{filtered.length !== 1 ? 's' : ''}</Typography>
        <Box sx={{ flex: 1 }} />
        <Button startIcon={<DownloadIcon />} variant="outlined" size="small" onClick={exportCSV} disabled={!filtered.length} sx={{ borderColor: '#0047AB', color: '#0047AB', fontWeight: 700, fontSize: '0.78rem' }}>Export CSV</Button>
      </Box>
      {filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}><TableIcon sx={{ fontSize: 48, color: '#D0D9E8', mb: 2 }} /><Typography sx={{ color: '#90A4AE', fontSize: '0.875rem' }}>No records yet</Typography></Box>
      ) : (
        <Box sx={{ border: '1px solid #E8EDF5', borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 0.8fr 0.9fr 80px', backgroundColor: '#F0F4FF', px: 2, py: 1.25 }}>
            {['Record ID','Form','Submitted by','Date',''].map(h => <Typography key={h} sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#546E7A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</Typography>)}
          </Box>
          {filtered.map((rec, i) => (
            <Box key={rec.id} sx={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 0.8fr 0.9fr 80px', px: 2, py: 1.5, borderTop: i > 0 ? '1px solid #E8EDF5' : 'none', alignItems: 'center', '&:hover': { backgroundColor: '#FAFBFF' } }}>
              <Typography sx={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#546E7A' }}>{rec.id.slice(0,8)}</Typography>
              <Typography sx={{ fontSize: '0.82rem', color: '#0A1628', fontWeight: 500 }}>{rec.formName}</Typography>
              <Typography sx={{ fontSize: '0.82rem', color: '#546E7A' }}>{rec.submittedBy}</Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#90A4AE' }}>{new Date(rec.submittedAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})}</Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="View"><IconButton size="small" onClick={() => setViewRec(rec)} sx={{ color: '#0047AB' }}><EditIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                <Tooltip title="Delete"><IconButton size="small" onClick={() => onChange({ ...state, records: state.records.filter(r => r.id !== rec.id) })} sx={{ color: '#DC2626' }}><DeleteIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
              </Box>
            </Box>
          ))}
        </Box>
      )}
      <Dialog open={!!viewRec} onClose={() => setViewRec(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        {viewRec && <>
          <DialogTitle sx={{ fontWeight: 700, pb: 0 }}>{viewRec.formName}</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Typography sx={{ fontSize: '0.75rem', color: '#90A4AE', mb: 2 }}>By {viewRec.submittedBy} · {new Date(viewRec.submittedAt).toLocaleString('en-IN')}</Typography>
            {Object.entries(viewRec.data).map(([k,v]) => (
              <Box key={k} sx={{ mb: 1.5 }}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#546E7A', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.25 }}>{k}</Typography>
                <Typography sx={{ fontSize: '0.875rem', color: '#0A1628' }}>{Array.isArray(v) ? v.join(', ') : String(v ?? '—')}</Typography>
              </Box>
            ))}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}><Button onClick={() => setViewRec(null)} sx={{ color: '#546E7A' }}>Close</Button></DialogActions>
        </>}
      </Dialog>
    </Box>
  );
};

// ── Sprint 11: History (Git-inspired) ─────────────────────────────────────────

const HistoryTab: React.FC<{ commits: Commit[]; onRestore: (snapshot: CollectState) => void }> = ({ commits, onRestore }) => {
  const [selected, setSelected] = useState<Commit | null>(null);
  const [restoreOpen, setRestoreOpen] = useState(false);

  if (commits.length === 0) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 2 }}>
        <HistoryIcon sx={{ fontSize: 48, color: '#D0D9E8' }} />
        <Typography sx={{ color: '#90A4AE', fontSize: '0.875rem' }}>No history yet — changes will appear here</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      {/* Commit log */}
      <Box sx={{ width: { xs: '100%', md: 380 }, borderRight: '1px solid #E8EDF5', overflowY: 'auto', backgroundColor: '#fff' }}>
        <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #E8EDF5' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#546E7A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Commit Log — {commits.length} commits</Typography>
        </Box>
        {commits.map((c, i) => (
          <Box key={c.hash} onClick={() => setSelected(c)}
            sx={{ px: 3, py: 2, borderBottom: '1px solid #F0F4FF', cursor: 'pointer', backgroundColor: selected?.hash === c.hash ? alpha('#0047AB', 0.05) : 'transparent', borderLeft: selected?.hash === c.hash ? '3px solid #0047AB' : '3px solid transparent', '&:hover': { backgroundColor: alpha('#0047AB', 0.03) }, transition: 'all 0.1s' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <CommitIcon sx={{ fontSize: 14, color: '#0047AB', transform: 'rotate(90deg)' }} />
              {/* The vertical line connecting commits */}
              <Typography sx={{ fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: 700, color: '#0047AB', backgroundColor: alpha('#0047AB', 0.08), px: 0.75, borderRadius: 0.75 }}>{c.hash}</Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#90A4AE', ml: 'auto' }}>{relTime(c.timestamp)}</Typography>
            </Box>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#0A1628', mb: 0.25 }}>{c.message}</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#546E7A' }}>by {c.author} · {c.changes.length} change{c.changes.length !== 1 ? 's' : ''}</Typography>
            {i === 0 && <Chip label="HEAD" size="small" sx={{ mt: 0.75, fontSize: '0.6rem', height: 16, backgroundColor: '#059669', color: '#fff', fontWeight: 700 }} />}
          </Box>
        ))}
      </Box>

      {/* Diff panel */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
        {selected ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <DiffIcon sx={{ fontSize: 18, color: '#0047AB' }} />
                  <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0A1628' }}>Changeset</Typography>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#0047AB', backgroundColor: alpha('#0047AB', 0.08), px: 0.75, borderRadius: 0.75 }}>{selected.hash}</Typography>
                </Box>
                <Typography sx={{ fontSize: '0.8rem', color: '#546E7A' }}>by {selected.author} · {new Date(selected.timestamp).toLocaleString('en-IN')}</Typography>
              </Box>
              <Button startIcon={<RestoreIcon />} variant="outlined" size="small" onClick={() => setRestoreOpen(true)} sx={{ borderColor: '#D97706', color: '#D97706', fontWeight: 700, fontSize: '0.78rem', '&:hover': { backgroundColor: alpha('#D97706', 0.05) } }}>
                Restore this version
              </Button>
            </Box>

            {/* Diff lines — git diff style */}
            <Box sx={{ border: '1px solid #E8EDF5', borderRadius: 2, overflow: 'hidden', fontFamily: 'monospace', fontSize: '0.82rem' }}>
              <Box sx={{ px: 2, py: 1, backgroundColor: '#F7F9FC', borderBottom: '1px solid #E8EDF5' }}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#546E7A', letterSpacing: '0.05em', textTransform: 'uppercase' }}>diff — {selected.changes.length} change{selected.changes.length !== 1 ? 's' : ''}</Typography>
              </Box>
              {selected.changes.map((line, i) => {
                const isAdd = line.startsWith('+');
                const isDel = line.startsWith('-');
                return (
                  <Box key={i} sx={{ px: 2, py: 0.75, display: 'flex', alignItems: 'center', gap: 1.5, borderTop: i > 0 ? '1px solid #F0F4FF' : 'none', backgroundColor: isAdd ? alpha('#059669', 0.04) : isDel ? alpha('#DC2626', 0.04) : alpha('#D97706', 0.04) }}>
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: isAdd ? '#059669' : isDel ? '#DC2626' : '#D97706', width: 16, flexShrink: 0 }}>{line[0]}</Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: '#2D3A4A', fontFamily: 'inherit' }}>{line.slice(2)}</Typography>
                  </Box>
                );
              })}
            </Box>

            {/* Snapshot stats */}
            <Box sx={{ mt: 2.5, display: 'flex', gap: 2 }}>
              <Box sx={{ px: 2, py: 1.5, borderRadius: 2, backgroundColor: '#F7F9FC', border: '1px solid #E8EDF5', textAlign: 'center' }}>
                <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#0047AB' }}>{selected.snapshot.forms.length}</Typography>
                <Typography sx={{ fontSize: '0.65rem', color: '#90A4AE', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Forms</Typography>
              </Box>
              <Box sx={{ px: 2, py: 1.5, borderRadius: 2, backgroundColor: '#F7F9FC', border: '1px solid #E8EDF5', textAlign: 'center' }}>
                <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#059669' }}>{selected.snapshot.records.length}</Typography>
                <Typography sx={{ fontSize: '0.65rem', color: '#90A4AE', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Records</Typography>
              </Box>
              <Box sx={{ px: 2, py: 1.5, borderRadius: 2, backgroundColor: '#F7F9FC', border: '1px solid #E8EDF5', textAlign: 'center' }}>
                <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#7C3AED' }}>{selected.snapshot.forms.reduce((a, f) => a + f.fields.length, 0)}</Typography>
                <Typography sx={{ fontSize: '0.65rem', color: '#90A4AE', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total fields</Typography>
              </Box>
            </Box>
          </>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, gap: 2 }}>
            <DiffIcon sx={{ fontSize: 40, color: '#D0D9E8' }} />
            <Typography sx={{ color: '#90A4AE', fontSize: '0.875rem' }}>Select a commit to see its changeset</Typography>
          </Box>
        )}
      </Box>

      {/* Restore confirm */}
      <Dialog open={restoreOpen} onClose={() => setRestoreOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#D97706' }}>Restore this version?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#546E7A', lineHeight: 1.7, fontSize: '0.875rem' }}>
            This will replace your current forms and records with the state at commit <strong style={{ fontFamily: 'monospace', color: '#0047AB' }}>{selected?.hash}</strong>. Current state will be saved as a new commit first.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setRestoreOpen(false)} sx={{ color: '#546E7A' }}>Cancel</Button>
          <Button variant="contained" onClick={() => { if (selected) { onRestore(selected.snapshot); setRestoreOpen(false); } }} sx={{ backgroundColor: '#D97706', fontWeight: 700, '&:hover': { backgroundColor: '#B45309' } }}>Restore</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────

export const CollectPage: React.FC = () => {
  const [state, setState] = useState<CollectState>(loadState);
  const [commits, setCommits] = useState<Commit[]>(loadCommits);
  const [tab, setTab] = useState(0);
  const [online, setOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(0);
  const [presence, setPresence] = useState<PresenceUser[]>([]);
  const [syncToast, setSyncToast] = useState(false);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const prevStateRef = useRef<CollectState>(state);

  // ── Current user ────────────────────────────────────────────────────────────
  const currentUser = (() => {
    try { const u = JSON.parse(localStorage.getItem('user') || '{}'); return u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : 'You'; } catch { return 'You'; }
  })();
  const myId = useRef(uid()).current;
  const myColor = PRESENCE_COLORS[Math.abs(myId.charCodeAt(0) % PRESENCE_COLORS.length)];

  // ── Sprint 10: BroadcastChannel real-time sync ──────────────────────────────
  useEffect(() => {
    const ch = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = ch;

    ch.onmessage = (e) => {
      const { type, payload } = e.data as { type: string; payload: any };
      switch (type) {
        case 'state_update':
          setState(payload.state);
          saveState(payload.state);
          prevStateRef.current = payload.state;
          setSyncToast(true);
          break;
        case 'presence_ping':
          setPresence(prev => {
            const exists = prev.find(p => p.id === payload.id);
            if (exists) return prev.map(p => p.id === payload.id ? { ...p, lastSeen: Date.now(), tab: payload.tab } : p);
            return [...prev, { ...payload, lastSeen: Date.now() }];
          });
          // reply with my presence
          ch.postMessage({ type: 'presence_ping', payload: { id: myId, name: currentUser, color: myColor, tab: String(tab), lastSeen: Date.now() } });
          break;
        case 'presence_leave':
          setPresence(prev => prev.filter(p => p.id !== payload.id));
          break;
      }
    };

    // Announce self
    ch.postMessage({ type: 'presence_ping', payload: { id: myId, name: currentUser, color: myColor, tab: String(tab), lastSeen: Date.now() } });

    // Heartbeat every 4s
    const beat = setInterval(() => {
      ch.postMessage({ type: 'presence_ping', payload: { id: myId, name: currentUser, color: myColor, tab: String(tab), lastSeen: Date.now() } });
      // Prune stale presence (> 12s)
      setPresence(prev => prev.filter(p => Date.now() - p.lastSeen < 12000));
    }, 4000);

    return () => {
      ch.postMessage({ type: 'presence_leave', payload: { id: myId } });
      ch.close(); clearInterval(beat);
    };
  }, [myId, currentUser, myColor]);

  // Update tab in presence heartbeat
  useEffect(() => {
    channelRef.current?.postMessage({ type: 'presence_ping', payload: { id: myId, name: currentUser, color: myColor, tab: String(tab), lastSeen: Date.now() } });
  }, [tab, myId, currentUser, myColor]);

  // ── Sprint 11: Offline detection ────────────────────────────────────────────
  useEffect(() => {
    const goOnline = () => { setOnline(true); if (pendingSync > 0) { setPendingSync(0); } };
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
  }, [pendingSync]);

  // ── Sprint 11: commit on every change ──────────────────────────────────────
  const handleChange = useCallback((next: CollectState) => {
    const prev = prevStateRef.current;
    const changes = diffStates(prev, next);

    if (changes.length > 0) {
      const commit: Commit = {
        hash: makeHash(),
        timestamp: new Date().toISOString(),
        author: currentUser,
        message: changes[0].slice(2), // strip the +/- prefix
        changes,
        snapshot: next,
      };
      setCommits(prev => { const updated = [commit, ...prev].slice(0, 60); saveCommits(updated); return updated; });
    }

    setState(next);
    saveState(next);
    prevStateRef.current = next;

    // Broadcast to other tabs (Sprint 10)
    channelRef.current?.postMessage({ type: 'state_update', payload: { state: next, from: myId } });

    // Offline queue counter
    if (!navigator.onLine) setPendingSync(p => p + 1);
  }, [currentUser, myId]);

  const handleRestore = useCallback((snapshot: CollectState) => {
    handleChange(snapshot);
  }, [handleChange]);

  const totalRecords = state.records.length;
  const TAB_NAMES = ['Form Builder','Enter Data',`Records (${totalRecords})`,'History'];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#F7F9FC' }}>
      <TopNavigation />

      {/* Sprint 11: Offline banner */}
      {!online && (
        <Box sx={{ backgroundColor: '#FEF3C7', borderBottom: '1px solid #FDE68A', px: 3, py: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <OfflineIcon sx={{ fontSize: 16, color: '#D97706' }} />
          <Typography sx={{ fontSize: '0.8rem', color: '#92400E', fontWeight: 600 }}>
            You're offline — changes are saved locally{pendingSync > 0 ? ` (${pendingSync} pending sync)` : ''}
          </Typography>
        </Box>
      )}

      {/* Page header */}
      <Box sx={{ backgroundColor: '#fff', borderBottom: '1px solid #E8EDF5', px: { xs: 2, md: 4 }, pt: 3, pb: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5, flexWrap: 'wrap' }}>
              <ScienceIcon sx={{ color: '#0047AB', fontSize: 22 }} />
              <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0A1628' }}>Data Collection</Typography>
              <Chip label="REDCap-style" size="small" sx={{ fontSize: '0.65rem', height: 20, backgroundColor: alpha('#0047AB', 0.08), color: '#0047AB', fontWeight: 700 }} />
              <Chip label="ODK-inspired" size="small" sx={{ fontSize: '0.65rem', height: 20, backgroundColor: alpha('#00897B', 0.08), color: '#00897B', fontWeight: 700 }} />
              {/* Sprint 10 live indicator */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.25, borderRadius: 1, backgroundColor: alpha('#059669', 0.08) }}>
                <DotIcon sx={{ fontSize: 8, color: '#059669' }} />
                <Typography sx={{ fontSize: '0.65rem', color: '#059669', fontWeight: 700 }}>LIVE</Typography>
              </Box>
            </Box>
            <Typography sx={{ fontSize: '0.82rem', color: '#546E7A' }}>
              Design CRFs, capture field data, and track history — collaborative, all within NexTrial
            </Typography>
          </Box>

          {/* Stats + presence */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#0047AB', lineHeight: 1 }}>{state.forms.length}</Typography>
              <Typography sx={{ fontSize: '0.65rem', color: '#90A4AE', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Forms</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', lineHeight: 1 }}>{totalRecords}</Typography>
              <Typography sx={{ fontSize: '0.65rem', color: '#90A4AE', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Records</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#7C3AED', lineHeight: 1 }}>{commits.length}</Typography>
              <Typography sx={{ fontSize: '0.65rem', color: '#90A4AE', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Commits</Typography>
            </Box>

            {/* Sprint 10: live presence */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.75 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <PeopleIcon sx={{ fontSize: 13, color: '#546E7A' }} />
                <Typography sx={{ fontSize: '0.7rem', color: '#546E7A', fontWeight: 600 }}>
                  {presence.length > 0 ? `${presence.length + 1} active` : 'Only you'}
                </Typography>
              </Box>
              <AvatarGroup max={5} sx={{ '& .MuiAvatar-root': { width: 26, height: 26, fontSize: '0.65rem', fontWeight: 700, border: '2px solid #fff' } }}>
                {/* Self */}
                <Tooltip title={`${currentUser} (you)`}>
                  <Avatar sx={{ backgroundColor: myColor, width: 26, height: 26 }}>
                    {currentUser.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </Avatar>
                </Tooltip>
                {/* Others */}
                {presence.map(p => (
                  <Tooltip key={p.id} title={`${p.name} — tab ${TAB_NAMES[Number(p.tab)] ?? '?'}`}>
                    <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} badgeContent={<DotIcon sx={{ fontSize: 8, color: '#059669' }} />}>
                      <Avatar sx={{ backgroundColor: p.color, width: 26, height: 26 }}>
                        {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </Avatar>
                    </Badge>
                  </Tooltip>
                ))}
              </AvatarGroup>
            </Box>

            {/* Online/offline pill */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.25, py: 0.5, borderRadius: 10, border: '1px solid', borderColor: online ? alpha('#059669', 0.3) : alpha('#D97706', 0.3), backgroundColor: online ? alpha('#059669', 0.05) : alpha('#D97706', 0.05) }}>
              {online ? <OnlineIcon sx={{ fontSize: 13, color: '#059669' }} /> : <OfflineIcon sx={{ fontSize: 13, color: '#D97706' }} />}
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: online ? '#059669' : '#D97706' }}>{online ? 'Online' : 'Offline'}</Typography>
            </Box>
          </Box>
        </Box>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ '& .MuiTab-root': { fontSize: '0.82rem', fontWeight: 600, textTransform: 'none', minHeight: 44 }, '& .Mui-selected': { color: '#0047AB' }, '& .MuiTabs-indicator': { backgroundColor: '#0047AB' } }}>
          <Tab label="Form Builder"    icon={<FormIcon sx={{ fontSize: 15 }} />}    iconPosition="start" />
          <Tab label="Enter Data"      icon={<EditIcon sx={{ fontSize: 15 }} />}     iconPosition="start" />
          <Tab label={`Records (${totalRecords})`} icon={<TableIcon sx={{ fontSize: 15 }} />}  iconPosition="start" />
          <Tab label={`History (${commits.length})`} icon={<HistoryIcon sx={{ fontSize: 15 }} />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Tab content */}
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {tab === 0 && <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex' }}><FormBuilder state={state} onChange={handleChange} /></Box>}
        {tab === 1 && <Box sx={{ flex: 1, overflowY: 'auto' }}><DataEntry state={state} onChange={handleChange} currentUser={currentUser} /></Box>}
        {tab === 2 && <Box sx={{ flex: 1, overflowY: 'auto' }}><Records state={state} onChange={handleChange} /></Box>}
        {tab === 3 && <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex' }}><HistoryTab commits={commits} onRestore={handleRestore} /></Box>}
      </Box>

      {/* Sprint 10: sync toast */}
      <Snackbar open={syncToast} autoHideDuration={2500} onClose={() => setSyncToast(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="info" onClose={() => setSyncToast(false)} sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
          A collaborator made changes — synced
        </Alert>
      </Snackbar>
    </Box>
  );
};
