// EDC service — tries the API, falls back to localStorage on any error.
// Every method that mutates state returns the complete EDCState after the operation.

const API = `${import.meta.env['VITE_API_URL'] || 'http://localhost:3001/api'}/edc`;
const STORAGE_KEY = 'nextrial_edc_v1';

// ── Types (mirrored from EDCPage) ─────────────────────────────────────────────

export type FieldType = 'text' | 'number' | 'date' | 'select' | 'yesno';
export type PatientStatus = 'screening' | 'enrolled' | 'completed' | 'withdrawn';

export interface EDCField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  options?: string[];
}

export interface EDCForm {
  id: string;
  name: string;
  fields: EDCField[];
}

export interface EDCPatient {
  id: string;
  subjectId: string;
  site: string;
  status: PatientStatus;
  enrolledAt: string;
}

export interface Signature {
  signerName: string;
  signerRole: string;
  timestamp: string;
}

export interface DataEntry {
  id: string;
  patientId: string;
  formId: string;
  visitDate: string;
  data: Record<string, string>;
  submittedAt: string;
  signature: Signature | null;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  entity: string;
  detail: string;
}

export interface EDCState {
  forms: EDCForm[];
  patients: EDCPatient[];
  entries: DataEntry[];
  audit: AuditEntry[];
}

// ── localStorage helpers ──────────────────────────────────────────────────────

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
        { id: 'g1', type: 'date',   label: 'Visit Date',             required: true  },
        { id: 'g2', type: 'number', label: 'Weight (kg)',             required: false },
        { id: 'g3', type: 'number', label: 'Systolic BP (mmHg)',      required: false },
        { id: 'g4', type: 'number', label: 'Diastolic BP (mmHg)',     required: false },
        { id: 'g5', type: 'yesno',  label: 'Concomitant Medications', required: false },
      ],
    },
    {
      id: 'form-week4',
      name: 'Week 4 Assessment',
      fields: [
        { id: 'h1', type: 'date',   label: 'Visit Date',            required: true  },
        { id: 'h2', type: 'select', label: 'Response Assessment',    required: true,
          options: ['CR – Complete Response', 'PR – Partial Response', 'SD – Stable Disease', 'PD – Progressive Disease'] },
        { id: 'h3', type: 'yesno',  label: 'Adverse Event Reported', required: true  },
        { id: 'h4', type: 'text',   label: 'AE Description',         required: false },
        { id: 'h5', type: 'select', label: 'AE Grade (CTCAE)',        required: false,
          options: ['Grade 1 – Mild', 'Grade 2 – Moderate', 'Grade 3 – Severe', 'Grade 4 – Life-threatening'] },
      ],
    },
  ],
  patients: [],
  entries: [],
  audit: [
    { id: uid(), timestamp: now(), action: 'INIT', entity: 'System',
      detail: 'EDC module initialized with 3 default visit forms (Screening, Baseline, Week 4)' },
  ],
};

function loadLocal(): EDCState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as EDCState;
  } catch { /* ignore */ }
  return SEED;
}

function saveLocal(s: EDCState): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

// ── API wrapper ───────────────────────────────────────────────────────────────

async function apiCall(path: string, opts: RequestInit = {}): Promise<EDCState> {
  const r = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const d = await r.json() as { ok: boolean; state?: EDCState; error?: string };
  if (!d.ok || !d.state) throw new Error(d.error ?? 'API error');
  saveLocal(d.state);
  return d.state;
}

// ── Public API ────────────────────────────────────────────────────────────────

export const edcService = {

  async getState(): Promise<EDCState> {
    try {
      return await apiCall('/state');
    } catch {
      return loadLocal();
    }
  },

  async addForm(name: string): Promise<EDCState> {
    try {
      return await apiCall('/forms', { method: 'POST', body: JSON.stringify({ name }) });
    } catch {
      const s = loadLocal();
      const form: EDCForm = { id: uid(), name, fields: [] };
      const audit: AuditEntry = { id: uid(), timestamp: now(), action: 'CREATE_FORM', entity: name, detail: `Created visit form "${name}"` };
      const next = { ...s, forms: [...s.forms, form], audit: [...s.audit, audit] };
      saveLocal(next);
      return next;
    }
  },

  async deleteForm(id: string): Promise<EDCState> {
    try {
      return await apiCall(`/forms/${id}`, { method: 'DELETE' });
    } catch {
      const s = loadLocal();
      const form = s.forms.find(f => f.id === id);
      if (!form) return s;
      const audit: AuditEntry = { id: uid(), timestamp: now(), action: 'DELETE_FORM', entity: form.name, detail: `Deleted visit form "${form.name}"` };
      const next = { ...s, forms: s.forms.filter(f => f.id !== id), audit: [...s.audit, audit] };
      saveLocal(next);
      return next;
    }
  },

  async addField(formId: string): Promise<EDCState> {
    try {
      return await apiCall(`/forms/${formId}/fields`, { method: 'POST' });
    } catch {
      const s = loadLocal();
      const field: EDCField = { id: uid(), type: 'text', label: 'New Field', required: false };
      const next = { ...s, forms: s.forms.map(f => f.id === formId ? { ...f, fields: [...f.fields, field] } : f) };
      saveLocal(next);
      return next;
    }
  },

  async updateField(formId: string, field: EDCField): Promise<EDCState> {
    try {
      return await apiCall(`/forms/${formId}/fields/${field.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ type: field.type, label: field.label, required: field.required, options: field.options }),
      });
    } catch {
      const s = loadLocal();
      const next = { ...s, forms: s.forms.map(f => f.id === formId ? { ...f, fields: f.fields.map(fl => fl.id === field.id ? field : fl) } : f) };
      saveLocal(next);
      return next;
    }
  },

  async deleteField(formId: string, fieldId: string): Promise<EDCState> {
    try {
      return await apiCall(`/forms/${formId}/fields/${fieldId}`, { method: 'DELETE' });
    } catch {
      const s = loadLocal();
      const next = { ...s, forms: s.forms.map(f => f.id === formId ? { ...f, fields: f.fields.filter(fl => fl.id !== fieldId) } : f) };
      saveLocal(next);
      return next;
    }
  },

  async moveField(formId: string, fieldId: string, dir: 'up' | 'down'): Promise<EDCState> {
    try {
      return await apiCall(`/forms/${formId}/fields/${fieldId}/move`, { method: 'POST', body: JSON.stringify({ dir }) });
    } catch {
      const s = loadLocal();
      const next = {
        ...s, forms: s.forms.map(f => {
          if (f.id !== formId) return f;
          const idx = f.fields.findIndex(fl => fl.id === fieldId);
          if (idx < 0) return f;
          const swap = dir === 'up' ? idx - 1 : idx + 1;
          if (swap < 0 || swap >= f.fields.length) return f;
          const fields = [...f.fields];
          const tmp = fields[idx]; fields[idx] = fields[swap]; fields[swap] = tmp;
          return { ...f, fields };
        }),
      };
      saveLocal(next);
      return next;
    }
  },

  async enrollPatient(subjectId: string, site: string, status: PatientStatus): Promise<EDCState> {
    try {
      return await apiCall('/patients', { method: 'POST', body: JSON.stringify({ subjectId, site, status }) });
    } catch {
      const s = loadLocal();
      const patient: EDCPatient = { id: uid(), subjectId, site, status, enrolledAt: now() };
      const audit: AuditEntry = { id: uid(), timestamp: now(), action: 'ENROLL', entity: subjectId, detail: `${subjectId} enrolled at ${site} — status: ${status}` };
      const next = { ...s, patients: [...s.patients, patient], audit: [...s.audit, audit] };
      saveLocal(next);
      return next;
    }
  },

  async submitEntry(
    patientId: string, formId: string, visitDate: string,
    data: Record<string, string>,
    sig: Signature | null,
  ): Promise<EDCState> {
    try {
      return await apiCall('/entries', {
        method: 'POST',
        body: JSON.stringify({
          patientId, formId, visitDate, data,
          signerName: sig?.signerName ?? null,
          signerRole: sig?.signerRole ?? null,
        }),
      });
    } catch {
      const s = loadLocal();
      const patient = s.patients.find(p => p.id === patientId);
      const form = s.forms.find(f => f.id === formId);
      if (!patient || !form) return s;
      const entry: DataEntry = { id: uid(), patientId, formId, visitDate, data, submittedAt: now(), signature: sig };
      const sigDetail = sig ? ` — Signed by ${sig.signerName} (${sig.signerRole})` : '';
      const audit: AuditEntry = {
        id: uid(), timestamp: now(), action: 'SUBMIT', entity: patient.subjectId,
        detail: `CRF "${form.name}" submitted for ${patient.subjectId} (Visit: ${visitDate})${sigDetail}`,
      };
      const next = { ...s, entries: [...s.entries, entry], audit: [...s.audit, audit] };
      saveLocal(next);
      return next;
    }
  },
};
