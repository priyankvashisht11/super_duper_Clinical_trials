import { Request, Response } from 'express';
import prisma from '../db';

// ── Frontend-compatible shapes ─────────────────────────────────────────────────

interface FrontendField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
}

interface FrontendForm {
  id: string;
  name: string;
  fields: FrontendField[];
}

interface FrontendPatient {
  id: string;
  subjectId: string;
  site: string;
  status: string;
  enrolledAt: string;
}

interface FrontendEntry {
  id: string;
  patientId: string;
  formId: string;
  visitDate: string;
  data: Record<string, string>;
  submittedAt: string;
  signature: { signerName: string; signerRole: string; timestamp: string } | null;
}

interface FrontendAudit {
  id: string;
  timestamp: string;
  action: string;
  entity: string;
  detail: string;
}

interface EDCState {
  forms: FrontendForm[];
  patients: FrontendPatient[];
  entries: FrontendEntry[];
  audit: FrontendAudit[];
}

// ── Shared helper ─────────────────────────────────────────────────────────────

async function getFullState(): Promise<EDCState> {
  const [forms, patients, entries, audit] = await Promise.all([
    prisma.crfForm.findMany({
      include: { fields: { orderBy: { orderIndex: 'asc' } } },
      orderBy: { orderIndex: 'asc' },
    }),
    prisma.edcPatient.findMany({ orderBy: { enrolledAt: 'asc' } }),
    prisma.edcEntry.findMany({ orderBy: { submittedAt: 'asc' } }),
    prisma.edcAuditLog.findMany({ orderBy: { timestamp: 'asc' } }),
  ]);

  return {
    forms: forms.map(f => ({
      id: f.id,
      name: f.name,
      fields: f.fields.map(fl => ({
        id: fl.id,
        type: fl.type,
        label: fl.label,
        required: fl.required,
        ...(fl.options.length > 0 ? { options: fl.options } : {}),
      })),
    })),
    patients: patients.map(p => ({
      id: p.id,
      subjectId: p.subjectId,
      site: p.site,
      status: p.status,
      enrolledAt: p.enrolledAt.toISOString(),
    })),
    entries: entries.map(e => ({
      id: e.id,
      patientId: e.patientId,
      formId: e.formId,
      visitDate: e.visitDate,
      data: e.data as Record<string, string>,
      submittedAt: e.submittedAt.toISOString(),
      signature: e.signerName
        ? {
            signerName: e.signerName,
            signerRole: e.signerRole ?? '',
            timestamp: (e.signedAt ?? e.submittedAt).toISOString(),
          }
        : null,
    })),
    audit: audit.map(a => ({
      id: a.id,
      timestamp: a.timestamp.toISOString(),
      action: a.action,
      entity: a.entity,
      detail: a.detail,
    })),
  };
}

function nextOrderIndex(current: { orderIndex: number }[]): number {
  return current.length === 0 ? 0 : Math.max(...current.map(x => x.orderIndex)) + 1;
}

async function addAudit(action: string, entity: string, detail: string) {
  await prisma.edcAuditLog.create({ data: { action, entity, detail } });
}

// ── Handlers ──────────────────────────────────────────────────────────────────

async function getState(req: Request, res: Response): Promise<void> {
  try {
    const state = await getFullState();
    res.json({ ok: true, state });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
}

async function createForm(req: Request, res: Response): Promise<void> {
  try {
    const { name } = req.body as { name: string };
    if (!name?.trim()) { res.status(400).json({ ok: false, error: 'name required' }); return; }
    const existing = await prisma.crfForm.findMany({ select: { orderIndex: true } });
    await prisma.crfForm.create({ data: { name: name.trim(), orderIndex: nextOrderIndex(existing) } });
    await addAudit('CREATE_FORM', name.trim(), `Created visit form "${name.trim()}"`);
    res.json({ ok: true, state: await getFullState() });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
}

async function deleteForm(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const form = await prisma.crfForm.findUnique({ where: { id } });
    if (!form) { res.status(404).json({ ok: false, error: 'not found' }); return; }
    await prisma.crfForm.delete({ where: { id } });
    await addAudit('DELETE_FORM', form.name, `Deleted visit form "${form.name}"`);
    res.json({ ok: true, state: await getFullState() });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
}

async function addField(req: Request, res: Response): Promise<void> {
  try {
    const { formId } = req.params as { formId: string };
    const existing = await prisma.crfField.findMany({ where: { formId }, select: { orderIndex: true } });
    await prisma.crfField.create({
      data: { formId, type: 'text', label: 'New Field', required: false, options: [], orderIndex: nextOrderIndex(existing) },
    });
    res.json({ ok: true, state: await getFullState() });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
}

async function updateField(req: Request, res: Response): Promise<void> {
  try {
    const { fieldId } = req.params as { fieldId: string };
    const { type, label, required, options } = req.body as {
      type: string; label: string; required: boolean; options?: string[];
    };
    await prisma.crfField.update({
      where: { id: fieldId },
      data: { type, label, required, options: options ?? [] },
    });
    res.json({ ok: true, state: await getFullState() });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
}

async function deleteField(req: Request, res: Response): Promise<void> {
  try {
    const { fieldId } = req.params as { fieldId: string };
    await prisma.crfField.delete({ where: { id: fieldId } });
    res.json({ ok: true, state: await getFullState() });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
}

async function moveField(req: Request, res: Response): Promise<void> {
  try {
    const { formId, fieldId } = req.params as { formId: string; fieldId: string };
    const { dir } = req.body as { dir: 'up' | 'down' };
    const fields = await prisma.crfField.findMany({
      where: { formId },
      orderBy: { orderIndex: 'asc' },
    });
    const idx = fields.findIndex(f => f.id === fieldId);
    if (idx < 0) { res.status(404).json({ ok: false, error: 'field not found' }); return; }
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= fields.length) { res.json({ ok: true, state: await getFullState() }); return; }
    const a = fields[idx];
    const b = fields[swapIdx];
    await Promise.all([
      prisma.crfField.update({ where: { id: a.id }, data: { orderIndex: b.orderIndex } }),
      prisma.crfField.update({ where: { id: b.id }, data: { orderIndex: a.orderIndex } }),
    ]);
    res.json({ ok: true, state: await getFullState() });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
}

async function enrollPatient(req: Request, res: Response): Promise<void> {
  try {
    const { subjectId, site, status } = req.body as { subjectId: string; site: string; status: string };
    if (!subjectId?.trim() || !site?.trim()) { res.status(400).json({ ok: false, error: 'subjectId and site required' }); return; }
    await prisma.edcPatient.create({ data: { subjectId: subjectId.trim(), site: site.trim(), status: status ?? 'screening' } });
    await addAudit('ENROLL', subjectId.trim(), `${subjectId.trim()} enrolled at ${site.trim()} — status: ${status}`);
    res.json({ ok: true, state: await getFullState() });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
}

async function submitEntry(req: Request, res: Response): Promise<void> {
  try {
    const { patientId, formId, visitDate, data, signerName, signerRole } = req.body as {
      patientId: string; formId: string; visitDate: string;
      data: Record<string, string>; signerName?: string; signerRole?: string;
    };
    const [patient, form] = await Promise.all([
      prisma.edcPatient.findUnique({ where: { id: patientId } }),
      prisma.crfForm.findUnique({ where: { id: formId } }),
    ]);
    if (!patient || !form) { res.status(404).json({ ok: false, error: 'patient or form not found' }); return; }
    await prisma.edcEntry.create({
      data: {
        patientId,
        formId,
        visitDate,
        data,
        signerName: signerName?.trim() ?? null,
        signerRole: signerRole?.trim() ?? null,
        signedAt: signerName ? new Date() : null,
      },
    });
    const sigDetail = signerName ? ` — Signed by ${signerName} (${signerRole})` : '';
    await addAudit('SUBMIT', patient.subjectId, `CRF "${form.name}" submitted for ${patient.subjectId} (Visit: ${visitDate})${sigDetail}`);
    res.json({ ok: true, state: await getFullState() });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
}

export const edcController = {
  getState,
  createForm,
  deleteForm,
  addField,
  updateField,
  deleteField,
  moveField,
  enrollPatient,
  submitEntry,
};
