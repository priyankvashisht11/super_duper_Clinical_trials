> **⚠ SUPERSEDED** — Archived for historical reference. AnalysisPage replaced by `AgentChatPanel tab="analysis"` in [Sprint 8](sprint-08-agentic-ai.md). The jsPDF report generators and AI insights endpoint remain available and will be surfaced as agent artifacts.

# Sprint 6 — Analysis + Submission

**Status:** ✅ COMPLETE (superseded by Sprint 8 agentic rewrite)  
**Shipped:** 2026-05-14  
**Duration:** 1 session

---

## Goal

Cross-module live dashboard pulling from EDC + Regulatory localStorage state. AI-powered insights on enrollment velocity, safety, data quality. Submission-ready PDF package generation.

---

## Deliverables

### Frontend — AnalysisPage (`src/pages/AnalysisPage.tsx`)
**~500 lines**

#### Metrics Row (4 cards)
- Enrolled: active + completed breakdown
- CRF Completion %
- Adverse Events (red badge if >3)
- Regulatory Readiness % (from regulatory track completion)

#### Data Panels
- Patient Enrollment table: all subjects, status, CRFs filed
- Regulatory Tracks: 4 LinearProgress bars (CTRI/CDSCO/ICMR/GCP) — live from `nextrial_regulatory_v1`
- CRF Completeness Matrix: patient × form grid with ✓ / — cells

#### AI Insights (`POST /api/analysis/insights`)
- 4 insight cards: Enrollment Velocity / Safety Profile / Data Quality / Regulatory Readiness
- 3 numbered recommendations
- Graceful offline fallback: computed locally from localStorage data

#### Submission Package (4 PDFs via jsPDF)
- Trial Summary PDF: metrics table + patient enrollment table
- Regulatory Report PDF: track-by-track completion + next steps
- CRF Matrix PDF (landscape): patient × form completeness matrix
- Cover Letter PDF: CDSCO submission cover letter template

### Backend
- `analysis.controller.ts` — Perplexity sonar → structured JSON insights with fallback
- `analysis.routes.ts` — `POST /api/analysis/insights`
- `jspdf` installed as dependency

---

## Acceptance Criteria

- [x] Metrics cards read live from localStorage
- [x] AI Insights button returns 4 cards + 3 recommendations
- [x] All 4 PDF downloads work
- [x] Refresh button re-reads localStorage
- [x] 0 TypeScript errors

---

## Technical Decisions

| Decision | Choice | Reason |
|---|---|---|
| Data source | localStorage keys | Cross-module; no backend API needed for analysis aggregation |
| PDF generation | jsPDF client-side | No server file storage needed; instant download |
| Insights fallback | Local computation | Analysis page must work offline at conference/site |

→ **Superseded by Sprint 8**: AnalysisPage rebuilt as `AgentChatPanel` with `tab="analysis"` — agent can run more complex queries, compare cohorts, generate CONSORT diagrams.
