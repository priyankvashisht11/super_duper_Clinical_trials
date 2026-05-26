> **⚠ SUPERSEDED** — Archived for historical reference. RegulatoryPage replaced by `AgentChatPanel tab="regulatory"` in [Sprint 8](sprint-08-agentic-ai.md). The checklist data model and localStorage key `nextrial_regulatory_v1` remain in use by the analysis module.

# Sprint 3 — Regulatory Prep

**Status:** ✅ COMPLETE (superseded by Sprint 8 agentic rewrite)  
**Shipped:** 2026-05-14  
**Duration:** 1 session

---

## Goal

Give the PI a live, interactive regulatory checklist covering the 4 major tracks for Indian clinical trials: CTRI Registration, CDSCO Form 44, ICMR Ethics, and GCP Readiness.

---

## Deliverables

### RegulatoryPage (`src/pages/RegulatoryPage.tsx`)
- **4 regulatory tracks** with collapsible accordion panels
- **Track summary cards**: progress bar + completion dots at top

### Track Specs

| Track | Items | Standard |
|---|---|---|
| CTRI Registration | 14 | Form A fields, IEC, CTRI requirements |
| CDSCO Form 44 | 12 | Schedule Y, IB, PIS/ICF, insurance, GCP certs |
| ICMR Ethics | 10 | DHR registration, IEC review, consent, data plan |
| GCP Checklist | 10 | ICH E6 R2 — TMF, delegation log, SUSAR, monitoring plan |

### Per-Item Features
- Checkbox (required/optional)
- `required` / `conditional` chip
- Detailed description text
- Notes field (free text)
- AI assist button → `POST /api/ai/section-assistance` with requirement context
- "Save to notes" on AI response

### Persistence
- Full state saved to `localStorage` key `nextrial_regulatory_v1`
- AnalysisPage reads this key to compute Regulatory Readiness %

---

## Acceptance Criteria

- [x] All 4 tracks visible with correct item counts
- [x] Checkbox state persists across page reload
- [x] AI assist returns relevant CDSCO/CTRI guidance text
- [x] Progress bar reflects checked items accurately
- [x] 0 TypeScript errors

---

## Technical Decisions

| Decision | Choice | Reason |
|---|---|---|
| Persistence | localStorage | No user account needed for checklist; fast, offline-capable |
| Track order | CTRI → CDSCO → ICMR → GCP | Mirrors real submission timeline order |
| AI context | Full item label + description sent | Perplexity needs context to give actionable CDSCO-specific answers |

→ **Superseded by Sprint 8**: RegulatoryPage rebuilt as `AgentChatPanel` wrapper — checklist moved to agent conversation; historical checklists will become artifacts.
