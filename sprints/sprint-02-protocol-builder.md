# Sprint 2 — Protocol Builder v2

**Status:** ✅ COMPLETE  
**Shipped:** 2026-05-14  
**Duration:** 1 session

---

## Goal

Rebuild the Protocol Builder from a cluttered, over-featured mess into a focused doc editor. PI writes the 14 ICH M11 sections with AI assistance. No popups. No floating buttons. Document-first.

---

## Deliverables

### ProtocolBuilderPage (`src/pages/ProtocolBuilderPage.tsx`)
- **Rewrite**: 840 lines → ~380 lines
- **2-column layout**: 252px fixed left nav + full-width content area
- **Left nav**: 14 ICH M11 sections in 4 groups (Foundation / Patient & Treatment / Data & Analysis / Governance), completion dots per section
- **Top bar**: back arrow, trial name, phase chip, indication, 3-dot menu (rename/delete/export-stub)
- **Section workspace**: large textarea, compliance tags, prev/next nav buttons

### AI Integration
- **"Generate with AI"**: prominent CTA when section is empty → `POST /api/ai/generate-content`
- **AI Assist bar**: always-visible inline query input → `POST /api/ai/section-assistance`, "Apply to document" button
- **Autosave**: 1.5s debounce via `autoSaveSection()`

### Removed (intentionally)
- Popup tooltips
- Floating FAB button
- Validation sidebar
- Keyboard shortcuts popup
- User guide dialog
- Clone dialog
- 6-button header cluster

---

## ICH M11 Sections (14)

| # | Section | Group |
|---|---|---|
| 1 | Summary | Foundation |
| 2 | Introduction | Foundation |
| 3 | Objectives | Foundation |
| 4 | Trial Design | Foundation |
| 5 | Population (Eligibility) | Patient & Treatment |
| 6 | Interventions | Patient & Treatment |
| 7 | Discontinuation | Patient & Treatment |
| 8 | Assessments | Data & Analysis |
| 9 | Adverse Events | Data & Analysis |
| 10 | Statistics | Data & Analysis |
| 11 | Statistical Considerations | Data & Analysis |
| 12 | Trial Oversight | Governance |
| 13 | Appendices | Governance |
| 14 | References | Governance |

---

## Acceptance Criteria

- [x] All 14 sections navigable from left nav
- [x] AI generate + AI assist both call backend and apply response
- [x] Autosave fires on keystroke with debounce
- [x] 0 TypeScript errors, build passes

---

## Technical Decisions

| Decision | Choice | Reason |
|---|---|---|
| Remove validation sidebar | Yes | Sidebar cluttered main writing area, validation runs on save anyway |
| AI assist bar | Always visible | PI should always be 1 click from AI help on any section |
| Autosave debounce | 1.5s | Shorter = too many API calls; 2s+ feels laggy |
| Section storage | JSON blobs in DB | Protocol sections are free-form text, not structured data |
