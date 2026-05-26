# Sprint 7 — E-Signature + CDSCO PDFs + PostgreSQL

**Status:** ✅ COMPLETE  
**Shipped:** 2026-05-14  
**Duration:** 1 session

---

## Goal

Three hardening deliverables bundled into one sprint: ICH E6(R2)-compliant e-signatures on CRF submissions, CDSCO-formatted PDF output with proper headers/footers, and PostgreSQL persistence for all EDC data.

---

## Deliverables

### 1. E-Signature Layer (ICH E6(R2) §5.5.3)

**SignatureModal component:**
- Fields: typed full name + role dropdown (6 GCP roles: Principal Investigator, Sub-Investigator, Study Coordinator, Data Manager, Pharmacist, Monitor)
- Timestamp: IST, auto-set on modal open
- Flow: "Submit CRF" → "Review & Sign" → SignatureModal → "Sign & Submit CRF"

**Storage:**
- `Signature` interface: `{ signerName, signerRole, timestamp }` stored inside `DataEntry`
- Audit entries append "— Signed by Name (Role)" suffix on signed submissions

### 2. CDSCO-Formatted PDFs

**`addHeaderFooter(doc, title, version, date, isLandscape)` helper:**
- Per-page headers: title / version / date, 7.5pt grey, separated by 13mm line
- Per-page footers: CONFIDENTIAL watermark + "Page N of M" right-aligned
- A4 margins: 25mm left/right, content starts at y=28

**docVersion TextField** in AnalysisPage header (default "1.0") — stamped on every PDF

**All 4 PDFs updated:**
- Trial Summary: metrics table + full enrollment table with version/date headers
- Regulatory Report: track-by-track completion, next steps, proper footer
- CRF Matrix (landscape): patient × form grid with CDSCO header
- Cover Letter: full CDSCO address block + expanded letter body template

### 3. PostgreSQL EDC Backend

**5 new Prisma models:**

| Model | Purpose |
|---|---|
| `CrfForm` | Visit form definitions |
| `CrfField` | Individual fields per form |
| `EdcPatient` | Enrolled subjects |
| `EdcEntry` | CRF submissions with signature |
| `EdcAuditLog` | Immutable audit trail |

**`edc.controller.ts`** — `getFullState()` helper + 9 handlers (GET state, CRUD forms/fields/patients/entries)  
**`edc.routes.ts`** — 9 endpoints at `/api/edc/...`  
**`edcService.ts`** (frontend) — API-first with localStorage mirror and fallback

---

## Acceptance Criteria

- [x] CRF submission requires signature before finalising
- [x] Signature (name + role + timestamp) appears in audit log
- [x] All 4 PDFs have per-page headers and footers
- [x] docVersion field stamps version on all PDFs
- [x] EDC data persists in PostgreSQL
- [x] localStorage fallback still works
- [x] `npx prisma generate` clean, 0 TypeScript errors, build 3.02s

---

## Technical Decisions

| Decision | Choice | Reason |
|---|---|---|
| E-sign as typed name | Yes (not image) | ICH E6(R2) allows typed name with identity binding; simpler than digital certificate |
| PDF headers | Per-page | CDSCO reviewers may print individual pages; each must be self-identifying |
| EDC Postgres | API-first with fallback | Clinical sites may have intermittent connectivity |
| Audit log | Append-only, no update/delete | GCP §8 requirement — trail must be irreversible |
