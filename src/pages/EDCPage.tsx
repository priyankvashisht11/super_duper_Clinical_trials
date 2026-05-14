import { useState } from 'react';
import type { SelectChangeEvent } from '@mui/material';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  alpha,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
  PersonAdd as PersonAddIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { TopNavigation } from '../components/layout';

// ── Types ─────────────────────────────────────────────────────────────────────

type FieldType = 'text' | 'number' | 'date' | 'select' | 'yesno';
type PatientStatus = 'screening' | 'enrolled' | 'completed' | 'withdrawn';

interface EDCField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  options?: string[];
}

interface EDCForm {
  id: string;
  name: string;
  fields: EDCField[];
}

interface EDCPatient {
  id: string;
  subjectId: string;
  site: string;
  status: PatientStatus;
  enrolledAt: string;
}

interface DataEntry {
  id: string;
  patientId: string;
  formId: string;
  visitDate: string;
  data: Record<string, string>;
  submittedAt: string;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  entity: string;
  detail: string;
}

interface EDCState {
  forms: EDCForm[];
  patients: EDCPatient[];
  entries: DataEntry[];
  audit: AuditEntry[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'nextrial_edc_v1';

const FIELD_LABELS: Record<FieldType, string> = {
  text:   'Text',
  number: 'Number',
  date:   'Date',
  select: 'Dropdown',
  yesno:  'Yes / No',
};

const STATUS_CONFIG: Record<PatientStatus, { bg: string; color: string; label: string }> = {
  screening: { bg: '#FFF8E1', color: '#F57F17', label: 'Screening' },
  enrolled:  { bg: '#EFF6FF', color: '#0047AB', label: 'Enrolled'  },
  completed: { bg: '#E8F5E9', color: '#2E7D32', label: 'Completed' },
  withdrawn: { bg: '#F5F5F5', color: '#757575', label: 'Withdrawn' },
};

// ── Storage helpers ───────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function now(): string {
  return new Date().toISOString();
}

const SEED: EDCState = {
  forms: [
    {
      id: 'form-screening',
      name: 'Screening Visit',
      fields: [
        { id: 'f1', type: 'date',   label: 'Screening Date',            required: true  },
        { id: 'f2', type: 'number', label: 'Age (years)',                required: true  },
        { id: 'f3', type: 'select', label: 'ECOG Performance Status',    required: true,
          options: ['0 – Fully active', '1 – Restricted strenuous', '2 – Ambulatory', '3 – Limited self-care', '4 – Bedbound'] },
        { id: 'f4', type: 'yesno',  label: 'Informed Consent Obtained',  required: true  },
        { id: 'f5', type: 'text',   label: 'Primary Diagnosis (ICD-10)', required: true  },
      ],
    },
    {
      id: 'form-baseline',
      name: 'Baseline Assessment',
      fields: [
        { id: 'g1', type: 'date',   label: 'Visit Date',            required: true  },
        { id: 'g2', type: 'number', label: 'Weight (kg)',            required: false },
        { id: 'g3', type: 'number', label: 'Systolic BP (mmHg)',     required: false },
        { id: 'g4', type: 'number', label: 'Diastolic BP (mmHg)',    required: false },
        { id: 'g5', type: 'yesno',  label: 'Concomitant Medications', required: false },
      ],
    },
    {
      id: 'form-week4',
      name: 'Week 4 Assessment',
      fields: [
        { id: 'h1', type: 'date',   label: 'Visit Date',           required: true  },
        { id: 'h2', type: 'select', label: 'Response Assessment',   required: true,
          options: ['CR – Complete Response', 'PR – Partial Response', 'SD – Stable Disease', 'PD – Progressive Disease'] },
        { id: 'h3', type: 'yesno',  label: 'Adverse Event Reported', required: true  },
        { id: 'h4', type: 'text',   label: 'AE Description',        required: false },
        { id: 'h5', type: 'select', label: 'AE Grade (CTCAE)',       required: false,
          options: ['Grade 1 – Mild', 'Grade 2 – Moderate', 'Grade 3 – Severe', 'Grade 4 – Life-threatening'] },
      ],
    },
  ],
  patients: [],
  entries: [],
  audit: [
    {
      id: uid(),
      timestamp: now(),
      action: 'INIT',
      entity: 'System',
      detail: 'EDC module initialized with 3 default visit forms (Screening, Baseline, Week 4)',
    },
  ],
};

function loadState(): EDCState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as EDCState;
  } catch { /* ignore */ }
  return SEED;
}

function saveState(s: EDCState): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

// ── FormBuilderTab ────────────────────────────────────────────────────────────

interface FormBuilderTabProps {
  forms: EDCForm[];
  selectedFormId: string | null;
  onSelectForm: (id: string) => void;
  onAddForm: (name: string) => void;
  onDeleteForm: (id: string) => void;
  onAddField: (formId: string) => void;
  onDeleteField: (formId: string, fieldId: string) => void;
  onMoveField: (formId: string, fieldId: string, dir: 'up' | 'down') => void;
  onUpdateField: (formId: string, field: EDCField) => void;
}

function FormBuilderTab({
  forms,
  selectedFormId,
  onSelectForm,
  onAddForm,
  onDeleteForm,
  onAddField,
  onDeleteField,
  onMoveField,
  onUpdateField,
}: FormBuilderTabProps) {
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [newFormName, setNewFormName] = useState('');

  const selectedForm = forms.find(f => f.id === selectedFormId) ?? null;

  const handleAddForm = () => {
    if (!newFormName.trim()) return;
    onAddForm(newFormName.trim());
    setNewFormName('');
    setAddFormOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', gap: 3 }}>
      {/* Left: visit form list */}
      <Box sx={{ width: 240, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.08em' }}>
            VISIT FORMS
          </Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={() => setAddFormOpen(true)}>
            New
          </Button>
        </Box>
        <Stack spacing={1}>
          {forms.map(form => (
            <Box
              key={form.id}
              onClick={() => onSelectForm(form.id)}
              sx={{
                p: 1.5,
                borderRadius: 2,
                cursor: 'pointer',
                border: '1.5px solid',
                borderColor: selectedFormId === form.id ? 'primary.main' : 'transparent',
                backgroundColor: selectedFormId === form.id ? alpha('#0047AB', 0.05) : '#F9FAFB',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                '&:hover': { borderColor: 'primary.main' },
                transition: 'all 0.15s',
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{form.name}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {form.fields.length} field{form.fields.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); onDeleteForm(form.id); }}
                sx={{ opacity: 0.35, '&:hover': { opacity: 1, color: 'error.main' } }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Right: field editor */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {!selectedForm ? (
          <Box sx={{ textAlign: 'center', py: 10, color: 'text.secondary' }}>
            <Typography>Select a visit form on the left to edit its fields</Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{selectedForm.name}</Typography>
              <Button size="small" startIcon={<AddIcon />} variant="outlined" onClick={() => onAddField(selectedForm.id)}>
                Add Field
              </Button>
            </Box>

            {selectedForm.fields.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary', border: '2px dashed', borderColor: 'divider', borderRadius: 2 }}>
                <Typography>No fields yet — click "Add Field" to begin designing this form</Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {selectedForm.fields.map((field, idx) => (
                  <Paper key={field.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                      {/* Reorder */}
                      <Stack>
                        <IconButton size="small" disabled={idx === 0}
                          onClick={() => onMoveField(selectedForm.id, field.id, 'up')}>
                          <UpIcon sx={{ fontSize: '0.9rem' }} />
                        </IconButton>
                        <IconButton size="small" disabled={idx === selectedForm.fields.length - 1}
                          onClick={() => onMoveField(selectedForm.id, field.id, 'down')}>
                          <DownIcon sx={{ fontSize: '0.9rem' }} />
                        </IconButton>
                      </Stack>

                      {/* Type */}
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Type</InputLabel>
                        <Select
                          label="Type"
                          value={field.type}
                          onChange={(e: SelectChangeEvent) => {
                            const type = e.target.value as FieldType;
                            if (type === 'select') {
                              onUpdateField(selectedForm.id, { ...field, type, options: field.options ?? ['Option 1', 'Option 2'] });
                            } else {
                              onUpdateField(selectedForm.id, { ...field, type });
                            }
                          }}
                        >
                          {(['text', 'number', 'date', 'select', 'yesno'] as FieldType[]).map(t => (
                            <MenuItem key={t} value={t}>{FIELD_LABELS[t]}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {/* Label */}
                      <TextField
                        size="small"
                        label="Field Label"
                        value={field.label}
                        onChange={(e) => onUpdateField(selectedForm.id, { ...field, label: e.target.value })}
                        sx={{ flex: 1, minWidth: 180 }}
                      />

                      {/* Required */}
                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            checked={field.required}
                            onChange={(e) => onUpdateField(selectedForm.id, { ...field, required: e.target.checked })}
                          />
                        }
                        label={<Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>Required</Typography>}
                        sx={{ mr: 0 }}
                      />

                      {/* Delete */}
                      <IconButton size="small" onClick={() => onDeleteField(selectedForm.id, field.id)}
                        sx={{ color: 'error.main' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>

                    {/* Options editor for select fields */}
                    {field.type === 'select' && (
                      <Box sx={{ mt: 1.5, pl: 6 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.06em' }}>
                          OPTIONS
                        </Typography>
                        <Stack spacing={0.75} sx={{ mt: 0.5 }}>
                          {(field.options ?? []).map((opt, optIdx) => (
                            <Stack key={optIdx} direction="row" spacing={1} alignItems="center">
                              <TextField
                                size="small"
                                value={opt}
                                onChange={(e) => {
                                  const opts = [...(field.options ?? [])];
                                  opts[optIdx] = e.target.value;
                                  onUpdateField(selectedForm.id, { ...field, options: opts });
                                }}
                                sx={{ flex: 1 }}
                              />
                              <IconButton size="small"
                                onClick={() => {
                                  const opts = (field.options ?? []).filter((_, i) => i !== optIdx);
                                  onUpdateField(selectedForm.id, { ...field, options: opts });
                                }}>
                                <DeleteIcon sx={{ fontSize: '0.9rem' }} />
                              </IconButton>
                            </Stack>
                          ))}
                          <Button size="small" startIcon={<AddIcon />}
                            onClick={() => {
                              const opts = [...(field.options ?? []), 'New Option'];
                              onUpdateField(selectedForm.id, { ...field, options: opts });
                            }}>
                            Add Option
                          </Button>
                        </Stack>
                      </Box>
                    )}
                  </Paper>
                ))}
              </Stack>
            )}
          </>
        )}
      </Box>

      {/* Add form dialog */}
      <Dialog open={addFormOpen} onClose={() => setAddFormOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>New Visit Form</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Form Name"
            fullWidth
            size="small"
            sx={{ mt: 1 }}
            value={newFormName}
            onChange={(e) => setNewFormName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddForm(); }}
            placeholder="e.g. Week 8 Safety Assessment"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddFormOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddForm}
            disabled={!newFormName.trim()}
            sx={{ background: 'linear-gradient(135deg, #0047AB 0%, #00897B 100%)', boxShadow: 'none' }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ── PatientsTab ───────────────────────────────────────────────────────────────

interface PatientsTabProps {
  forms: EDCForm[];
  patients: EDCPatient[];
  entries: DataEntry[];
  onEnrollPatient: (subjectId: string, site: string, status: PatientStatus) => void;
  onSubmitEntry: (patientId: string, formId: string, visitDate: string, data: Record<string, string>) => void;
}

function PatientsTab({ forms, patients, entries, onEnrollPatient, onSubmitEntry }: PatientsTabProps) {
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [subjectId, setSubjectId] = useState('');
  const [site, setSite] = useState('');
  const [enrollStatus, setEnrollStatus] = useState<PatientStatus>('screening');

  const [entryOpen, setEntryOpen] = useState(false);
  const [entryPatient, setEntryPatient] = useState<EDCPatient | null>(null);
  const [entryFormId, setEntryFormId] = useState<string>('');
  const [visitDate, setVisitDate] = useState('');
  const [entryData, setEntryData] = useState<Record<string, string>>({});

  const selectedEntryForm = forms.find(f => f.id === entryFormId) ?? null;

  const screeningCount = patients.filter(p => p.status === 'screening').length;
  const enrolledCount  = patients.filter(p => p.status === 'enrolled').length;
  const completedCount = patients.filter(p => p.status === 'completed').length;
  const withdrawnCount = patients.filter(p => p.status === 'withdrawn').length;

  const handleEnroll = () => {
    if (!subjectId.trim() || !site.trim()) return;
    onEnrollPatient(subjectId.trim(), site.trim(), enrollStatus);
    setSubjectId('');
    setSite('');
    setEnrollStatus('screening');
    setEnrollOpen(false);
  };

  const handleOpenEntry = (patient: EDCPatient) => {
    setEntryPatient(patient);
    setEntryFormId(forms[0]?.id ?? '');
    setVisitDate(new Date().toISOString().slice(0, 10));
    setEntryData({});
    setEntryOpen(true);
  };

  const handleSubmit = () => {
    if (!entryPatient || !entryFormId || !visitDate) return;
    onSubmitEntry(entryPatient.id, entryFormId, visitDate, entryData);
    setEntryOpen(false);
  };

  const setFieldValue = (fieldId: string, value: string) => {
    setEntryData(prev => ({ ...prev, [fieldId]: value }));
  };

  return (
    <>
      {/* Status stats */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap">
        {[
          { label: 'Screening',  count: screeningCount,  color: '#F57F17' },
          { label: 'Enrolled',   count: enrolledCount,   color: '#0047AB' },
          { label: 'Completed',  count: completedCount,  color: '#2E7D32' },
          { label: 'Withdrawn',  count: withdrawnCount,  color: '#757575' },
        ].map(s => (
          <Box key={s.label} sx={{
            px: 2.5, py: 1.5, borderRadius: 2, border: '1px solid',
            borderColor: alpha(s.color, 0.25), backgroundColor: alpha(s.color, 0.06),
          }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.count}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{s.label}</Typography>
          </Box>
        ))}
        <Box sx={{ flex: 1 }} />
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setEnrollOpen(true)}
          sx={{ background: 'linear-gradient(135deg, #0047AB 0%, #00897B 100%)', boxShadow: 'none', alignSelf: 'flex-start' }}
        >
          Enroll Patient
        </Button>
      </Stack>

      {/* Patient table */}
      {patients.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 12, color: 'text.secondary', border: '2px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>No patients enrolled yet</Typography>
          <Typography variant="body2">Click "Enroll Patient" to add the first subject to this trial</Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F9FAFB' }}>
                <TableCell sx={{ fontWeight: 700 }}>Subject ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Site</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Enrolled</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>CRFs Filed</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Completion</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {patients.map(patient => {
                const patientEntries = entries.filter(e => e.patientId === patient.id);
                const uniqueForms = new Set(patientEntries.map(e => e.formId));
                const pct = forms.length > 0 ? Math.min((uniqueForms.size / forms.length) * 100, 100) : 0;
                const cfg = STATUS_CONFIG[patient.status];
                return (
                  <TableRow key={patient.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                        {patient.subjectId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{patient.site}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={cfg.label}
                        size="small"
                        sx={{ backgroundColor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: '0.75rem' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {new Date(patient.enrolledAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{uniqueForms.size} / {forms.length}</Typography>
                    </TableCell>
                    <TableCell sx={{ minWidth: 130 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          sx={{
                            flex: 1, height: 6, borderRadius: 3, backgroundColor: '#E5E7EB',
                            '& .MuiLinearProgress-bar': { backgroundColor: pct >= 100 ? '#2E7D32' : '#0047AB', borderRadius: 3 },
                          }}
                        />
                        <Typography variant="caption" sx={{ minWidth: 32, color: 'text.secondary' }}>
                          {Math.round(pct)}%
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        startIcon={<AssignmentIcon />}
                        onClick={() => handleOpenEntry(patient)}
                        variant="outlined"
                        disabled={forms.length === 0}
                      >
                        Enter Data
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Enroll dialog */}
      <Dialog open={enrollOpen} onClose={() => setEnrollOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Enroll New Patient</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              label="Subject ID"
              size="small"
              fullWidth
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              placeholder="e.g. SUBJ-001"
              onKeyDown={(e) => { if (e.key === 'Enter') handleEnroll(); }}
            />
            <TextField
              label="Site"
              size="small"
              fullWidth
              value={site}
              onChange={(e) => setSite(e.target.value)}
              placeholder="e.g. AIIMS Delhi"
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Initial Status</InputLabel>
              <Select
                label="Initial Status"
                value={enrollStatus}
                onChange={(e: SelectChangeEvent) => setEnrollStatus(e.target.value as PatientStatus)}
              >
                <MenuItem value="screening">Screening</MenuItem>
                <MenuItem value="enrolled">Enrolled</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEnrollOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleEnroll}
            disabled={!subjectId.trim() || !site.trim()}
            sx={{ background: 'linear-gradient(135deg, #0047AB 0%, #00897B 100%)', boxShadow: 'none' }}
          >
            Enroll
          </Button>
        </DialogActions>
      </Dialog>

      {/* Data entry dialog */}
      <Dialog open={entryOpen} onClose={() => setEntryOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Data Entry — {entryPatient?.subjectId}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {entryPatient?.site}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Visit Form</InputLabel>
                <Select
                  label="Visit Form"
                  value={entryFormId}
                  onChange={(e: SelectChangeEvent) => {
                    setEntryFormId(e.target.value);
                    setEntryData({});
                  }}
                >
                  {forms.map(f => <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField
                type="date"
                size="small"
                label="Visit Date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 160 }}
              />
            </Stack>

            {selectedEntryForm && (
              <Stack spacing={2}>
                {selectedEntryForm.fields.map(field => (
                  <Box key={field.id}>
                    {field.type === 'yesno' ? (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={entryData[field.id] === 'yes'}
                            onChange={(e) => setFieldValue(field.id, e.target.checked ? 'yes' : 'no')}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="body2">{field.label}</Typography>
                            {field.required && <Typography component="span" sx={{ color: 'error.main', fontSize: '1rem' }}>*</Typography>}
                          </Box>
                        }
                      />
                    ) : field.type === 'select' ? (
                      <FormControl size="small" fullWidth>
                        <InputLabel>{field.label}{field.required ? ' *' : ''}</InputLabel>
                        <Select
                          label={`${field.label}${field.required ? ' *' : ''}`}
                          value={entryData[field.id] ?? ''}
                          onChange={(e: SelectChangeEvent) => setFieldValue(field.id, e.target.value)}
                        >
                          {(field.options ?? []).map(opt => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <TextField
                        size="small"
                        fullWidth
                        label={`${field.label}${field.required ? ' *' : ''}`}
                        type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                        value={entryData[field.id] ?? ''}
                        onChange={(e) => setFieldValue(field.id, e.target.value)}
                        {...(field.type === 'date' ? { InputLabelProps: { shrink: true } } : {})}
                      />
                    )}
                  </Box>
                ))}
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEntryOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!entryFormId || !visitDate}
            sx={{ background: 'linear-gradient(135deg, #0047AB 0%, #00897B 100%)', boxShadow: 'none' }}
          >
            Submit CRF
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ── AuditTab ──────────────────────────────────────────────────────────────────

interface AuditTabProps {
  audit: AuditEntry[];
}

function AuditTab({ audit }: AuditTabProps) {
  const ACTION_COLORS: Record<string, { bg: string; color: string }> = {
    INIT:        { bg: '#F5F5F5', color: '#757575' },
    CREATE_FORM: { bg: alpha('#0047AB', 0.08), color: '#0047AB' },
    DELETE_FORM: { bg: '#FEECEF', color: '#C62828' },
    ENROLL:      { bg: alpha('#00897B', 0.08), color: '#00897B' },
    SUBMIT:      { bg: alpha('#0047AB', 0.08), color: '#0047AB' },
  };

  if (audit.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 10, color: 'text.secondary' }}>
        <Typography>No audit events yet</Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: '#F9FAFB' }}>
            <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Entity</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Detail</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {[...audit].reverse().map(entry => {
            const colors = ACTION_COLORS[entry.action] ?? { bg: '#F5F5F5', color: '#757575' };
            return (
              <TableRow key={entry.id} hover>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                    {new Date(entry.timestamp).toLocaleString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={entry.action}
                    size="small"
                    sx={{ backgroundColor: colors.bg, color: colors.color, fontWeight: 700, fontSize: '0.7rem', fontFamily: 'monospace' }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{entry.entity}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>{entry.detail}</Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ── EDCPage ───────────────────────────────────────────────────────────────────

export function EDCPage() {
  const [state, setState] = useState<EDCState>(() => loadState());
  const [activeTab, setActiveTab] = useState(0);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(
    () => loadState().forms[0]?.id ?? null
  );

  const update = (next: EDCState) => {
    setState(next);
    saveState(next);
  };

  // Form builder handlers
  const handleAddForm = (name: string) => {
    const form: EDCForm = { id: uid(), name, fields: [] };
    const audit: AuditEntry = { id: uid(), timestamp: now(), action: 'CREATE_FORM', entity: name, detail: `Created visit form "${name}"` };
    const next = { ...state, forms: [...state.forms, form], audit: [...state.audit, audit] };
    update(next);
    setSelectedFormId(form.id);
  };

  const handleDeleteForm = (formId: string) => {
    const form = state.forms.find(f => f.id === formId);
    if (!form) return;
    const newForms = state.forms.filter(f => f.id !== formId);
    const audit: AuditEntry = { id: uid(), timestamp: now(), action: 'DELETE_FORM', entity: form.name, detail: `Deleted visit form "${form.name}"` };
    update({ ...state, forms: newForms, audit: [...state.audit, audit] });
    if (selectedFormId === formId) setSelectedFormId(newForms[0]?.id ?? null);
  };

  const handleAddField = (formId: string) => {
    const field: EDCField = { id: uid(), type: 'text', label: 'New Field', required: false };
    update({ ...state, forms: state.forms.map(f => f.id === formId ? { ...f, fields: [...f.fields, field] } : f) });
  };

  const handleDeleteField = (formId: string, fieldId: string) => {
    update({ ...state, forms: state.forms.map(f => f.id === formId ? { ...f, fields: f.fields.filter(fl => fl.id !== fieldId) } : f) });
  };

  const handleMoveField = (formId: string, fieldId: string, dir: 'up' | 'down') => {
    const newForms = state.forms.map(f => {
      if (f.id !== formId) return f;
      const idx = f.fields.findIndex(fl => fl.id === fieldId);
      if (idx < 0) return f;
      const swap = dir === 'up' ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= f.fields.length) return f;
      const fields = [...f.fields];
      const tmp = fields[idx];
      fields[idx] = fields[swap];
      fields[swap] = tmp;
      return { ...f, fields };
    });
    update({ ...state, forms: newForms });
  };

  const handleUpdateField = (formId: string, field: EDCField) => {
    update({ ...state, forms: state.forms.map(f => f.id === formId ? { ...f, fields: f.fields.map(fl => fl.id === field.id ? field : fl) } : f) });
  };

  // Patient handlers
  const handleEnrollPatient = (subjectId: string, site: string, status: PatientStatus) => {
    const patient: EDCPatient = { id: uid(), subjectId, site, status, enrolledAt: now() };
    const audit: AuditEntry = { id: uid(), timestamp: now(), action: 'ENROLL', entity: subjectId, detail: `${subjectId} enrolled at ${site} — status: ${status}` };
    update({ ...state, patients: [...state.patients, patient], audit: [...state.audit, audit] });
  };

  const handleSubmitEntry = (patientId: string, formId: string, visitDate: string, data: Record<string, string>) => {
    const patient = state.patients.find(p => p.id === patientId);
    const form = state.forms.find(f => f.id === formId);
    if (!patient || !form) return;
    const entry: DataEntry = { id: uid(), patientId, formId, visitDate, data, submittedAt: now() };
    const audit: AuditEntry = { id: uid(), timestamp: now(), action: 'SUBMIT', entity: patient.subjectId, detail: `CRF "${form.name}" submitted for ${patient.subjectId} (Visit: ${visitDate})` };
    update({ ...state, entries: [...state.entries, entry], audit: [...state.audit, audit] });
  };

  const activeCount = state.patients.filter(p => p.status === 'enrolled' || p.status === 'completed').length;

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <TopNavigation />
      <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0A1628', letterSpacing: '-0.02em', mb: 0.5 }}>
              Electronic Data Capture
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Design eCRFs, enroll subjects, collect visit data — fully audited per ICH E6(R2)
            </Typography>
          </Box>
          <Stack direction="row" spacing={3}>
            {[
              { label: 'Patients',   value: state.patients.length, color: '#0047AB' },
              { label: 'Active',     value: activeCount,            color: '#00897B' },
              { label: 'CRFs Filed', value: state.entries.length,  color: '#F57F17' },
            ].map(s => (
              <Box key={s.label} sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{s.label}</Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v as number)}>
            <Tab label={`CRF Forms (${state.forms.length})`} />
            <Tab label={`Patients (${state.patients.length})`} />
            <Tab label={`Audit Log (${state.audit.length})`} />
          </Tabs>
        </Box>

        {activeTab === 0 && (
          <FormBuilderTab
            forms={state.forms}
            selectedFormId={selectedFormId}
            onSelectForm={setSelectedFormId}
            onAddForm={handleAddForm}
            onDeleteForm={handleDeleteForm}
            onAddField={handleAddField}
            onDeleteField={handleDeleteField}
            onMoveField={handleMoveField}
            onUpdateField={handleUpdateField}
          />
        )}
        {activeTab === 1 && (
          <PatientsTab
            forms={state.forms}
            patients={state.patients}
            entries={state.entries}
            onEnrollPatient={handleEnrollPatient}
            onSubmitEntry={handleSubmitEntry}
          />
        )}
        {activeTab === 2 && (
          <AuditTab audit={state.audit} />
        )}
      </Box>
    </Box>
  );
}
