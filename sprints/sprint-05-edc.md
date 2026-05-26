> **⚠ SUPERSEDED** — Archived for historical reference. EDCPage replaced by `AgentChatPanel tab="edc"` in [Sprint 8](sprint-08-agentic-ai.md). The CRF/patient/audit data models and `/api/edc` endpoints remain active; the agent's `analyzeEdcData` tool queries this data.

# Sprint 5 — EDC Data Collection

**Status:** ✅ COMPLETE (superseded by Sprint 8 agentic rewrite)  
**Shipped:** 2026-05-14  
**Duration:** 1 session

---

## Goal

Build a lightweight in-app EDC (Electronic Data Capture) so a PI can create CRF forms, enrol patients, and enter visit data — all without leaving NexTrial.

---

## Deliverables

### Frontend — EDCPage (`src/pages/EDCPage.tsx`)
**~470 lines, 3-tab layout**

#### Tab 1: CRF Forms
- 2-column: form list (left) + field editor (right)
- Add/delete visit forms via dialog
- Per-field: type (text/number/date/select/yesno), label (inline edit), required toggle, up/down reorder, delete
- Options editor for dropdown fields
- Seeded with 3 defaults: Screening Visit, Baseline Assessment, Week 4 Assessment

#### Tab 2: Patients
- Status summary row: Screening / Enrolled / Completed / Withdrawn counts
- "Enroll Patient" dialog: Subject ID, Site, Initial Status
- Patient table: Subject ID | Site | Status chip | Enrolled date | CRFs filed | Completion % (LinearProgress) | Enter Data
- "Enter Data" dialog: pick visit form + date → render typed fields → submit CRF
- Creates DataEntry + AuditEntry on submit

#### Tab 3: Audit Log
- Reverse-chronological table
- Action chips with distinct colours: INIT / CREATE_FORM / DELETE_FORM / ENROLL / SUBMIT

### Backend — PostgreSQL via Prisma (Sprint 7 addition)
**5 Prisma models**: CrfForm, CrfField, EdcPatient, EdcEntry, EdcAuditLog  
**9 endpoints** at `/api/edc/...`  
**edcService.ts**: API-first with localStorage fallback and mirror

### Persistence
- `localStorage` key `nextrial_edc_v1` — AnalysisPage reads this for metrics

---

## Acceptance Criteria

- [x] CRF form creation and field configuration works
- [x] Patient enrollment and data entry persists
- [x] Audit log shows all actions in reverse-chron order
- [x] Data syncs to PostgreSQL via backend API
- [x] localStorage fallback works when backend unreachable
- [x] 0 TypeScript errors

---

## Technical Decisions

| Decision | Choice | Reason |
|---|---|---|
| Field types | text/number/date/select/yesno | Covers 95% of real CRF use cases without over-engineering |
| API + localStorage mirror | Yes | Resilient; backend can be down during site visit |
| Audit log | Immutable append-only | GCP ICH E6(R2) requirement |

→ **Superseded by Sprint 8**: EDCPage rebuilt as `AgentChatPanel` with `tab="edc"` — agent can query, summarise, and flag data issues conversationally.
