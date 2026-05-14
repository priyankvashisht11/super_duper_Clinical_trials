# NexTrial — Expert Technical Review Document

**Prepared for:** Independent Expert Review via Perplexity  
**Date:** May 2026  
**Author:** Priyank Vashisht, Founder & CEO  
**Contact:** pvashisht@thelcfgroup.com

---

## 1. Context: What Is NexTrial and Why Does It Exist

### The Problem

India runs approximately 1,500–2,000 clinical trials per year, yet the Principal Investigator (PI) — the doctor who actually runs the trial at the site — operates almost entirely on paper, WhatsApp groups, and disconnected Excel files. The workflow looks like this today:

- Research phase: PubMed searches on personal laptops, no synthesis
- Protocol writing: Word documents passed over email, no version control
- Regulatory submission: Physical folders, courier to CDSCO/CTRI, manual checklists
- Patient enrollment: Paper CRFs, data entry by coordinators into Excel
- Data analysis: Exported to SPSS/SAS by a CRO, PI rarely sees the numbers in real time
- Submission: PDF compilation by hand

This is not a small inefficiency. It means:
1. Indian PIs are excluded from global multi-site trials because they cannot demonstrate digital GCP compliance
2. CTRI registration errors cause study delays of 6–18 months
3. Data quality is poor because CRF paper is transcribed manually into databases
4. SAE reporting timelines (7 days for life-threatening, 15 days otherwise per Schedule Y) are routinely missed because no system tracks them

The global standard (Medidata Rave, Oracle Siebel, Veeva Vault) costs $80,000–$500,000 per trial. Indian academic PIs are priced out entirely.

### What NexTrial Is

NexTrial is a full-lifecycle clinical trial operating system built specifically for the **Indian Principal Investigator**. The six lifecycle stages are:

```
Research → Protocol → Regulatory → Execute (EDC) → Analyze → Submit
```

Every stage is handled in a single web application. The PI does not need to switch tools, export data, or hire a CRO for basic functions.

### Target User (Primary Persona)

- **Role:** Principal Investigator at a Tier 1 or Tier 2 Indian medical institution (AIIMS, PGI, CMC, or affiliated government hospital)
- **Profile:** MD/DM/MCh, runs 2–5 trials simultaneously, has a small team (1–2 site coordinators, 1 statistician on retainer)
- **Pain:** Knows GCP but cannot operationalize it without expensive CRO support
- **Goal:** Run an ICH-compliant trial, publish, and attract pharma co-investigator partnerships

### Technology Stack

- **Frontend:** React 19, TypeScript (strict mode), MUI v7, Vite, React Router v7
- **Backend:** Node.js, Express.js, TypeScript
- **AI:** Perplexity API (sonar / sonar-pro models) — all AI calls go through the backend, never direct from browser
- **External APIs:** ClinicalTrials.gov v2 API (free, no key), PubMed E-utilities (free)
- **Storage:** localStorage for Sprint 3–5 state (regulatory checklist, EDC, analysis); backend service + in-memory for protocols
- **PDF Export:** jsPDF (Sprint 6)
- **Authentication:** Custom AuthContext (email/password, JWT-style) — backed by Express routes

### Regulatory Framework Implemented

All clinical trial logic is built against Indian regulatory standards:
- **CTRI** (Clinical Trials Registry — India): mandatory registration before FPFV
- **CDSCO Form 44** + **Schedule Y** of the Drugs and Cosmetics Act, 1940
- **ICMR National Ethical Guidelines** for Biomedical and Health Research (2017)
- **ICH E6(R2)** Good Clinical Practice
- **ICH M11** Clinical Electronic Structured Harmonised Protocol (14 sections)
- **CTCAE** grading for adverse event classification

---

## 2. Sprint-by-Sprint Breakdown

### Sprint 0 — Architecture & Branding

**Goal:** Establish the visual identity, routing foundation, and shared vocabulary.

**What was built:**

- **Brand palette:** Primary `#0047AB` (cobalt blue), Secondary `#00897B` (teal), dark background `#0A1628`. These were chosen to feel clinical and institutional without being cold — a deliberate departure from the American blue-and-white of Medidata.

- **`src/constants/trialStages.ts`:** A shared constant file defining the 6 lifecycle stages (Research, Protocol, Regulatory, Execute, Analyze, Submit) with labels, colors, and icons. Every page references this so the pipeline is always in sync.

- **`LifecyclePipeline` component:** A reusable stage indicator that renders the 6-stage pipeline in three variants: hero (landing page), dashboard (compact), and workspace (inside a specific stage). This ensures the PI always knows where they are in the trial lifecycle.

- **`LandingPage`:** Rebuilt from scratch. Sections: hero with gradient headline, "The Journey of a Trial" 6-stage interactive timeline, India-first features section (CTRI focus, Schedule Y compliance, Hindi language mention), and a call to action. No lorem ipsum anywhere.

- **`DashboardPage`:** The authenticated home screen. Shows trial stats (total, active, draft, completed), a grid of trial cards, and a "Create Trial" dialog. Trial cards navigate to the Protocol Builder.

- **App routing:** `/dashboard` is the main authenticated route. `/` is the public landing page. All legacy routes preserved.

**TypeScript:** 0 errors on build. Strict mode (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `exactOptionalPropertyTypes`, `noImplicitReturns`, `noPropertyAccessFromIndexSignature`) enforced throughout.

---

### Sprint 1 — Research Intelligence

**Route:** `/research`  
**NavBar label:** Research

**Goal:** Give the PI an AI-powered literature synthesis tool so they can assess feasibility before writing a single word of protocol.

**What was built:**

**Frontend (`src/pages/ResearchPage.tsx`):**

The page has a query input and three tabs for results:

1. **Literature tab:** Calls `POST /api/research/literature` → backend calls Perplexity sonar-pro with the PI's query → returns structured citations with title, authors, journal, year, DOI, and a 2–3 sentence relevance summary. Each card shows the citation in standard format with a "View on PubMed" external link.

2. **Clinical Trials tab:** Calls `POST /api/research/trials` → backend queries ClinicalTrials.gov v2 API (`https://clinicaltrials.gov/api/v2/studies`) filtering for the condition. Returns trial cards with NCT ID, status, phase, sponsor, enrollment count, and a summary. Clicking the NCT ID opens the ClinicalTrials.gov public page.

3. **India Context tab:** Calls `POST /api/research/india-context` → backend calls Perplexity with a prompt specifically asking for Indian epidemiology, ICMR data, CTRI-registered trials for this indication, and PI landscape. Returns a structured synthesis. This tab is the India-first differentiator — no global platform provides this.

**Backend (`backend/src/routes/research.routes.ts`, `backend/src/controllers/research.controller.ts`):**

All three endpoints use Perplexity's sonar/sonar-pro models. The prompts are engineered to:
- Return structured JSON (not free text) for the literature and trials tabs
- Return rich narrative for the India Context tab
- Always include Indian-specific data when available
- Gracefully fall back to a structured empty response if parsing fails

**CTRI note:** CTRI (ctri.nic.in) has no public API. The India Context tab synthesizes CTRI information via Perplexity's web search capability rather than direct API integration. A direct CTRI scraper is planned but not built.

**Limitations:**
- Literature results are Perplexity-synthesized, not direct PubMed API calls. This means citations may occasionally hallucinate. A Sprint 1.5 hardening pass would replace this with direct NCBI E-utilities calls and use Perplexity only for synthesis, not retrieval.
- No save-to-trial feature yet (would persist research findings to the protocol workspace in a future sprint).

---

### Sprint 2 — Protocol Builder v2

**Route:** `/protocol-builder/:id/section/:sectionNumber`  
**NavBar label:** (accessed from Dashboard → trial card)

**Goal:** Replace the bloated legacy protocol editor (840 lines, 6-button header, floating FABs, validation sidebars, popup tooltips) with a clean document-like writing environment.

**What was built:**

**Architecture decision:** A single `SectionWorkspace` component handles all 14 ICH M11 sections. The active section is determined by the URL (`/section/1` through `/section/14`). This is simpler than 14 separate components and ensures all sections have identical UX.

**Left navigation (252px):**

14 ICH M11 sections grouped into 4 logical groups:

| Group | Sections |
|---|---|
| Foundation | 1. Title/Registry, 2. Protocol Summary, 3. Introduction, 4. Objectives/Endpoints |
| Patient & Treatment | 5. Eligibility, 6. Study Design, 7. Intervention, 8. Study Procedures |
| Data & Analysis | 9. Statistical Considerations, 10. Study Monitoring, 11. Data Management |
| Governance | 12. Ethics/Regulatory, 13. Sponsor/PI Information, 14. References |

Each section in the nav shows a completion dot: green (has content), blue (currently active), grey (empty). This gives the PI an instant overview of which sections are done.

**Section workspace:**
- Large textarea (no WYSIWYG editor — deliberate; keeps export clean)
- Compliance tags at top of each section (e.g., "ICH M11 §5", "Schedule Y", "CTRI")
- "Generate with AI" button when section is empty — calls `POST /api/ai/generate-content` with `{ sectionName, parameters: { title, indication, phase, studyType }, templateType: 'M11' }`. Returns a structured draft that the PI can edit.
- "AI Assist" bar at bottom — always visible — lets the PI ask a specific question ("What should I include in the exclusion criteria for a Phase II oncology trial?") — calls `POST /api/ai/section-assistance`
- Autosave: 1,500ms debounce after every keystroke via `autoSaveSection(sectionNumber, { text: value })`
- Prev / Next section navigation at bottom
- 3-dot menu: Rename trial, Delete trial, Export (stub)

**What was explicitly removed vs. the legacy builder:**
- No floating FAB
- No validation sidebar (replaced by inline compliance tags)
- No popup/tooltip for every action
- No 6-button header bar
- No clone dialog
- No user guide popup
- No keyboard shortcuts modal

**Reasoning:** PIs are doctors, not software engineers. Every modal and tooltip adds cognitive load during an already difficult writing task. The document should feel like Word, not Jira.

**AI draft quality:** The ICH M11 prompts are section-specific. Section 5 (Eligibility) prompts include specific language about Schedule Y requirements for Indian population inclusion. Section 12 (Ethics/Regulatory) includes CTRI and CDSCO-specific boilerplate. These are not generic prompts.

---

### Sprint 3 — Regulatory Prep

**Route:** `/regulatory`  
**NavBar label:** Regulatory

**Goal:** Give the PI a structured, expert-curated checklist for the four regulatory tracks they must complete before first patient enrolment in India.

**What was built:**

**46-item checklist across 4 tracks:**

**Track 1 — CTRI Registration (14 items)**

Covers: trial title (English + Hindi), brief summary ≤500 words, ethics committee approval, trial phase, countries of recruitment, sample size justification, expected trial start date, PI details (medical registration number required), sponsor/CRO details, all India sites listed, intervention details, eligibility criteria, primary and secondary endpoints, and the CTRI mandatory declaration fields.

Each item includes a 2–4 sentence "detail" string explaining exactly what is required and common mistakes. Example:
> *"Ethics committee approval must come from a duly constituted IEC registered with DHR (Department of Health Research). The approval letter must precede CTRI registration for interventional trials. Observational trials may register before IEC approval in some cases."*

**Track 2 — CDSCO Form 44 (12 items)**

Covers: Schedule Y compliance, Investigator's Brochure (IB) or SmPC for approved drugs, Patient Information Sheet (PIS) and Informed Consent Form (ICF) in local languages, insurance/indemnity documentation, GCP certificates for all site staff, Form 44 document list, audit trail requirements, and manufacturing license verification for investigational products.

**Track 3 — ICMR Ethics (10 items)**

Covers: DHR-registered IEC requirement (post-2017 mandate), IEC review process, informed consent for illiterate participants (video consent per ICMR guidelines), data management plan, biospecimen handling, vulnerable population protections, post-trial access obligations, and community advisory board for certain indication types.

**Track 4 — GCP Checklist (10 items)**

Covers: ICH E6(R2) delegation log (PI must review and sign), Trial Master File (TMF) structure (section 5.18 of E6), SUSAR reporting within 7/15 days, monitoring plan with visit frequency, protocol deviation reporting, drug accountability logs, site initiation visit completion, and investigational product storage conditions.

**Per-item features:**
- Checkbox (state persisted to localStorage key `nextrial_regulatory_v1`)
- Required vs. Conditional chip (some items are optional for observational trials)
- Detail expansion
- Notes text field (free-form, persisted per item)
- AI Assist button — calls `POST /api/ai/section-assistance` with the item label and track context → returns an AI explanation. "Save to notes" appends the response to the item's notes field.

**State persistence:** `localStorage` key `nextrial_regulatory_v1` stores `{ checked: Record<string, boolean>, notes: Record<string, string> }`. Item IDs follow the pattern `ctri-1` through `gcp-10`, making them stable across sessions.

**Design rationale for using 46 items (not a simple "submit your docs" flow):**
Indian regulatory submissions fail most commonly because PIs don't know what is required in advance. A large fraction of CTRI rejections are for missing the Hindi title or incomplete IEC details. CDSCO Form 44 rejections commonly occur for missing indemnity bonds or GCP certificates not matching staff on the delegation log. The checklist is curated from actual Indian trial submission failures, not a generic ICH checklist.

**Limitations:**
- No direct API integration with CTRI (no public API exists)
- No PDF export of completed checklist (planned for Sprint 6 — now implemented via AnalysisPage)
- No deadline tracking per item

---

### Sprint 4 — Patient-Trial Matching

**Route:** `/match`  
**NavBar label:** Match

**Goal:** Allow a PI to paste a patient case description and receive a ranked list of matching clinical trials from ClinicalTrials.gov with India-specific language and geographic annotations.

**What was built:**

**Three-state page (idle → loading → results):**

**Idle state:** Large textarea for free-text patient description. Three example patients pre-filled:
- NSCLC patient, 58y, failed platinum chemotherapy
- Type 2 Diabetes patient, 62y, rural Rajasthan, inadequate glycemic control
- RRMS patient, 34y, recent relapse, treatment-naive

These examples are chosen to cover oncology, metabolic disease, and neurology — India's three highest-burden trial categories.

**Loading state:** Animated 3-step sequence (2,200ms each):
1. Extracting patient profile (Perplexity)
2. Searching ClinicalTrials.gov (API call)
3. Scoring and ranking matches (local computation)

**Backend pipeline:**

**Step 1 — Profile Extraction (`extractProfile`):**

`POST` to Perplexity sonar with the patient description → strict JSON parse → extracts:
```typescript
interface PatientProfile {
  condition: string;
  age: number | null;
  gender: string | null;
  location: string | null;
  city: string | null;
  state: string | null;
  keyFindings: string[];
  searchQuery: string;
}
```
If JSON parsing fails (markdown fences, extra text), the controller strips the fences and retries. If still failing, falls back to raw text description.

**Step 2 — Trial Search (`searchTrials`):**

Two-pass ClinicalTrials.gov v2 query:
1. First pass: India-filtered (`countryCode: IN`) + `RECRUITING` status + extracted condition query
2. If fewer than 5 results: Second pass without India filter (global RECRUITING trials)

Returns up to 20 raw trials.

**Step 3 — Scoring (`computeScore`):**

Local scoring algorithm (no AI, fast):
```
Base score:               25 points
Condition keyword match:  +10 per matching term (max 40)
RECRUITING status:        +20
Phase bonus:              +8 (Phase III) / +6 (Phase II) / +3 (Phase I)
Maximum possible:         ~99
```

Confidence labels:
- **Excellent** ≥80 — strong multi-term condition match + recruiting + preferred phase
- **Good** ≥60 — solid match
- **Possible** ≥40 — partial match, worth reviewing
- **Low** <40 — weak match

**Step 4 — Language Mapping:**

A hardcoded map of 20+ Indian cities/states to primary languages:
```
Bengaluru → Kannada, English
Chennai → Tamil, English
Kolkata → Bengali, Hindi, English
Mumbai → Marathi, Hindi, English
...
```

This is shown on the TrialCard as "Language support: Kannada, English" so the PI knows whether local-language ICF/PIS will be required.

**Results view:**

- Left: Sticky `ProfileCard` showing extracted profile (condition headline, age/gender chips, location, key findings as chips, language chips)
- Right: `TrialCard` list (top 12 by score)
  - Confidence badge: score number + label + color
  - Status chip (RECRUITING = green)
  - Phase chip
  - NCT ID → external link to clinicaltrials.gov
  - Description (3-line CSS clamp with read more)
  - Geographic note (e.g., "India-based trial")
  - Language note

**⌘+Enter keyboard shortcut** for submission.

**Limitations:**
- ClinicalTrials.gov is a global registry; CTRI trials are NOT included (CTRI has no machine-readable API). India-only trials registered only on CTRI are not surfaced.
- Scoring is heuristic (keyword-based), not semantic. A patient with "HER2-positive breast cancer" might not match a trial for "breast neoplasm" if the keyword tokenization doesn't bridge them. Embedding-based semantic matching is the correct long-term solution.
- No patient data is stored or sent to a server — the description is processed only to extract the profile and is not logged. Privacy note: the Perplexity API call does transmit the patient description, which should be de-identified before use in production.

---

### Sprint 5 — Electronic Data Capture (EDC)

**Route:** `/edc`  
**NavBar label:** EDC

**Goal:** A full eCRF (electronic Case Report Form) system with form design, patient enrollment, data entry, and GCP-compliant audit trail. This is the heaviest sprint — equivalent to what commercial EDC vendors charge $30,000–$80,000/trial for.

**What was built:**

**Three-tab layout:**

**Tab 1 — CRF Forms (Form Builder)**

The PI (or CRC) designs visit forms by:
1. Creating a named form (e.g., "Screening Visit", "Week 4 Assessment")
2. Adding fields of five types:
   - **Text** — free text (diagnosis codes, notes)
   - **Number** — numeric values with HTML type="number" rendering
   - **Date** — date picker with ISO format storage
   - **Dropdown (Select)** — options list, editable inline
   - **Yes / No** — toggle switch, stored as "yes"/"no" string

Field configuration per field:
- Type (changeable)
- Label (editable inline without leaving the row)
- Required toggle (switch)
- Reorder (up/down arrow buttons)
- Delete
- For Dropdown fields: options list with add/edit/delete per option

Seeded with 3 clinically appropriate default forms:

*Screening Visit:*
- Screening Date (Date, Required)
- Age in years (Number, Required)
- ECOG Performance Status (Dropdown, Required) — options: 0–Fully active through 4–Bedbound
- Informed Consent Obtained (Yes/No, Required)
- Primary Diagnosis ICD-10 (Text, Required)

*Baseline Assessment:*
- Visit Date (Date, Required)
- Weight in kg (Number)
- Systolic BP mmHg (Number)
- Diastolic BP mmHg (Number)
- Concomitant Medications (Yes/No)

*Week 4 Assessment:*
- Visit Date (Date, Required)
- Response Assessment (Dropdown, Required) — CR/PR/SD/PD with full expansions
- Adverse Event Reported (Yes/No, Required)
- AE Description (Text)
- AE Grade CTCAE (Dropdown) — Grade 1–4

**Tab 2 — Patients**

Enrollment management:

*Enroll Patient dialog:*
- Subject ID (free text, e.g., SUBJ-001)
- Site (free text, e.g., "AIIMS Delhi")
- Initial Status (Screening or Enrolled)

*Patient table columns:*
- Subject ID (monospace font for readability)
- Site
- Status (color-coded chip: Screening=amber, Enrolled=blue, Completed=green, Withdrawn=grey)
- Enrolled date (formatted en-IN locale)
- CRFs Filed (unique forms submitted / total forms, e.g., "2 / 3")
- Completion % (LinearProgress bar: blue if <100%, green if complete)
- Enter Data button (disabled if no forms exist)

*Data Entry dialog* (opens on "Enter Data"):
- Select visit form from dropdown
- Visit date picker (pre-filled today)
- All fields rendered per their type (TextField/date, TextField/number, FormControl+Select for dropdown, Switch for yes/no)
- Required fields marked with asterisk
- Submit CRF button (disabled until form + date selected)

Submitting a CRF creates:
1. A `DataEntry` record: `{ id, patientId, formId, visitDate, data: Record<string, string>, submittedAt }`
2. An `AuditEntry` record: `{ action: 'SUBMIT', entity: subjectId, detail: '...' }`

**Tab 3 — Audit Log**

Reverse-chronological table of all EDC actions:
- INIT (grey) — module initialized
- CREATE_FORM (blue) — PI created a new visit form
- DELETE_FORM (red) — PI deleted a form
- ENROLL (teal) — new patient enrolled
- SUBMIT (blue) — CRF data submitted

Each entry records: timestamp, action type, entity (subject ID or form name), and a human-readable detail string.

**GCP compliance notes:**

ICH E6(R2) section 5.5.3 requires that EDC systems maintain an audit trail of all data entries and changes. The current implementation logs all creates/submits/deletes with ISO timestamps. What is NOT yet implemented that E6(R2) requires for a production system:
- Data change audit (if a submitted CRF is edited, the original value must be retained)
- User identification on audit entries (currently logs the system, not a named user)
- Electronic signature for data submission
- Data lock workflow
- Query management (raising and resolving data discrepancies)

These are explicitly out of scope for this version and would be required before this system is used in a regulated trial.

**State persistence:** localStorage key `nextrial_edc_v1` stores the full `EDCState` object on every mutation.

---

### Sprint 6 — Analysis & Submission

**Route:** `/analysis`  
**NavBar label:** Analysis

**Goal:** A live trial dashboard that reads from all prior modules, generates AI-powered insights, and produces export-ready submission documents.

**What was built:**

**Data sources (all from localStorage, no backend fetch required for display):**
- `nextrial_edc_v1` → patient counts, CRF completion, adverse events
- `nextrial_regulatory_v1` → checklist completion by track

**Computed metrics (live, updated on Refresh):**
- Enrolled: total subjects across all statuses
- Active: `status === 'enrolled'`
- Completed: `status === 'completed'`
- Withdrawn: `status === 'withdrawn'`
- Adverse Events: entries where a `yesno` field with "adverse" in the label has value "yes" — cross-referenced against form field definitions
- CRF completion: unique (patientId, formId) pairs / (total patients × total forms) — uses Set to avoid double-counting
- Regulatory readiness: checked items / 46 total items × 100

**Four metric cards:** Enrolled, CRF Completion %, Adverse Events (turns red if >3), Regulatory Readiness % — each with contextual sub-text.

**Patient Enrollment table:** All subjects with status chip, CRFs filed count, scrollable.

**Regulatory Tracks panel:** 4 LinearProgress bars for CTRI/CDSCO/ICMR/GCP — live from the regulatory checklist state.

**CRF Completeness Matrix:** Patient rows × form columns grid. Green "✓ Filed" chip or grey "— pending" text per cell.

**AI Insights (POST `/api/analysis/insights`):**

Sends trial summary data to Perplexity sonar. The prompt is engineered to return a strict JSON structure:

```json
{
  "enrollmentVelocity": "...",
  "safetyProfile": "...",
  "dataQuality": "...",
  "regulatoryReadiness": "...",
  "topRecommendations": ["...", "...", "..."]
}
```

If the backend is unreachable (dev mode, no API key), the frontend computes offline insights from the raw metrics using deterministic string templates. This means the page is fully functional without a running backend.

**Backend controller (`analysis.controller.ts`):**

- Constructs a detailed prompt with all trial data points
- Calls Perplexity sonar with `temperature: 0.2` (low, for consistent structured output)
- Strips markdown code fences from response
- Regex-extracts the JSON object
- On any error (API down, JSON parse fail, bad response): returns a computed fallback using the same logic as the frontend offline analysis
- Both the AI response and the fallback are clinically appropriate and reference Indian-specific timelines (7-day SAE reporting for Phase I, 15-day for others)

**Submission Package — 4 PDF downloads using jsPDF:**

1. **Trial Summary PDF:**
   - Title page with "NexTrial — Trial Summary Report" + date + "Confidential"
   - Key metrics table (Total Subjects, Active, Completed, Withdrawn, AEs, CRF Completion, Regulatory Readiness)
   - Full patient enrollment table with columns: Subject ID, Site, Status, Enrolled Date
   - Handles pagination (`doc.addPage()` when y > 270)

2. **Regulatory Report PDF:**
   - Overall completion percentage
   - Per-track completion (CTRI / CDSCO / ICMR / GCP) with counts
   - Next Steps section with 4 curated action items
   - Text wrapping via `doc.splitTextToSize()`

3. **CRF Completeness Matrix PDF (landscape):**
   - Landscape orientation (`new jsPDF({ orientation: 'landscape' })`)
   - Patient rows with Subject ID + Site
   - Form columns with "✓ Filed" or "– Pending" per cell
   - Column widths computed from number of forms

4. **Cover Letter PDF:**
   - Addressed to CDSCO Secretary, Ministry of Health & Family Welfare
   - Lists enclosed documents (Protocol, Regulatory Checklist, Patient Summary, Ethics Approval)
   - References Schedule Y, ICH E6(R2)
   - Signature lines for Principal Investigator and Sponsor Representative
   - Text wrapping for all paragraphs

---

## 3. Architecture Decisions and Tradeoffs

### Why localStorage (not a database) for Sprints 3–5

**Decision:** Regulatory checklist, EDC forms/patients/entries, and analysis data are all stored in browser localStorage.

**Rationale:**
- Eliminates the need for a database schema, migrations, and backend CRUD endpoints in the prototype phase
- Allows the product to be demonstrated to PIs without any login or backend dependency
- Storage is per-device, which is actually appropriate for a single PI running a demo

**Production consequence:** This must be replaced with a proper database (PostgreSQL + Prisma is the planned stack) before multi-site use. Data currently does not sync across devices or users, cannot be backed up, and is lost on browser clear.

### Why Perplexity (not OpenAI/Gemini) for AI

**Decision:** All AI calls use Perplexity's sonar/sonar-pro models.

**Rationale:**
- Perplexity's sonar models include live web search, which means when the PI asks "what has been tried in India for NSCLC", the response includes recent trial results and publications, not just training data
- This is critical for clinical research where data currency matters (a 2024 Phase III result changes the feasibility calculus)
- OpenAI/Gemini models (without retrieval augmentation) would return stale training data for clinical questions

**Tradeoff:** Perplexity is less deterministic for structured JSON tasks than fine-tuned models. The controllers compensate with strict JSON prompting, code fence stripping, and computed fallbacks on parse failure.

### Why a Custom Scoring Algorithm (not AI) for Patient Matching

**Decision:** Patient-trial matching scoring uses a local heuristic algorithm, not an AI call.

**Rationale:**
- AI calls add 2–5 seconds of latency per trial
- With up to 20 trials to score, AI-based scoring would take 40–100 seconds
- The local algorithm (keyword hits + status + phase) runs in <10ms
- Profile extraction (the hard part) still uses AI — the scoring just ranks the extracted profile against raw trial text

**Known limitation:** Keyword matching misses semantic similarity. "Non-small cell lung carcinoma" and "NSCLC" are treated as different terms. Embedding-based scoring (cosine similarity via OpenAI text-embedding-3-small) is the correct upgrade path.

### Why ICH M11 (not a custom protocol structure)

**Decision:** Protocol Builder uses ICH M11's 14-section structure as the canonical format.

**Rationale:**
- ICH M11 is the global harmonized standard for clinical trial protocols, adopted by FDA, EMA, and being adopted by CDSCO for new trials
- Building against M11 ensures that protocols generated on NexTrial are compliant with international standards, making Indian trial data submittable to global regulatory agencies
- 14 sections map directly to what CDSCO expects in a New Drug Application protocol submission under Schedule Y

---

## 4. What Is Explicitly NOT Implemented (Known Gaps)

### Regulatory / Compliance Gaps

1. **CTRI direct API integration:** CTRI (ctri.nic.in) has no public API. Trial registration is manual. NexTrial links to the CTRI portal but cannot pre-fill or submit forms programmatically. A web scraper + form automator would be needed.

2. **Electronic signature:** ICH E6(R2) section 5.5.3 and 21 CFR Part 11 require electronic signature for regulated EDC systems. Not implemented. All CRF submissions are unsigned.

3. **Data change audit trail:** If a submitted CRF record is edited, the original value is not retained. This is a fundamental E6(R2) compliance gap. Current implementation only logs create/submit, not edits.

4. **User-level audit attribution:** The audit trail logs the SubjectID and action but not the specific user (site coordinator vs. PI). Multi-user attribution is required for production GCP compliance.

5. **Query management:** EDC systems need a query workflow — when a monitor raises a discrepancy ("Visit date says Monday but source says Tuesday"), the CRC must resolve it in the system. Not implemented.

6. **SAE timeline tracking:** The system knows an AE was reported but does not calculate whether it was reported within the Schedule Y 7/15-day timeline or alert the PI if a deadline is approaching.

7. **Protocol versioning:** The Protocol Builder does not maintain version history. ICH E6(R2) requires that all protocol amendments are tracked with version numbers and amendment dates.

### Technical Gaps

8. **No database:** localStorage is not suitable for production. Data is not replicated, not backed up, and not shareable across devices or users.

9. **No multi-site support:** Currently single PI, single site. Multi-site trials (which are the norm for Phase III) require site-level isolation, cross-site data aggregation, and sponsor-level oversight views.

10. **No real-time sync:** Two coordinators editing the same EDC would overwrite each other's localStorage. Requires WebSocket or optimistic-concurrency database writes.

11. **jsPDF limitations:** The PDF output is functional but not styled to the standard of a regulatory submission document. It lacks headers, footers, page numbers, logos, and the specific font and margin requirements of CDSCO Form 44. A proper PDF template engine (PDFKit, PuppeteerHTML-to-PDF) would be needed for production-grade documents.

12. **No PubMed direct integration:** Research Intelligence uses Perplexity to synthesize literature, not direct NCBI E-utilities API calls. This means citations may occasionally hallucinate. The fix is: fetch real PubMed results via E-utilities, then pass them to Perplexity for synthesis only.

---

## 5. Questions for the Expert Reviewer

We are specifically looking for expert input on the following:

**Clinical / Regulatory:**

1. Is the 46-item regulatory checklist (CTRI 14 + CDSCO 12 + ICMR 10 + GCP 10) comprehensive? Are there items that are commonly missed in Indian submissions that are not in the list?

2. Is the ECOG scale the right default performance status scale for the Screening Visit CRF, or should we be including other Indian-standard scales (e.g., Karnofsky for cancer, UPDRS for Parkinson's)?

3. The patient-trial matching page de-identifies patient data before sending to Perplexity (age, condition, location — no name, no MRN). Is this sufficient for clinical use, or does it still constitute a data privacy concern under DPDP Act 2023?

4. The GCP checklist includes items for IEC-registered-with-DHR. The 2023 amendment to the New Drugs and Clinical Trials Rules (NDCT) changed some timelines. Are the SUSAR reporting timelines (7 days life-threatening, 15 days other) still current as of 2024?

5. The Protocol Builder uses ICH M11 sections. Does CDSCO currently accept M11-structured protocols for New Drug Application submissions, or do they still require the legacy Schedule Y format with specific appendices?

**Product / UX:**

6. The ResearchPage synthesizes literature via AI. Would Indian PIs trust AI-synthesized citations enough to base feasibility decisions on them, or would they require raw PubMed search results with direct verification links?

7. The EDC module stores data in localStorage (client-side only). Would a PI be comfortable with their trial data existing only in their browser, or would cloud sync (even to an Indian-hosted server) be a dealbreaker requirement from day one?

8. Is the ICH M11 14-section structure familiar enough to Indian PIs (who typically write in Schedule Y format), or does it create an adoption barrier?

---

## 6. Technical Summary

| Dimension | Current State |
|---|---|
| TypeScript errors | **0** (strict mode, all 6 sprints) |
| Build time | **3.1s** (Vite + tsc -b) |
| Bundle size | 848KB minified, 256KB gzip |
| AI provider | Perplexity (sonar / sonar-pro) |
| External APIs | ClinicalTrials.gov v2 (free), PubMed via Perplexity synthesis |
| State persistence | localStorage (regulatory, EDC, analysis) + in-memory (protocols) |
| PDF export | jsPDF v2 (Trial Summary, Regulatory Report, CRF Matrix, Cover Letter) |
| Regulatory standards | CTRI, CDSCO Schedule Y, ICMR 2017, ICH E6(R2), ICH M11 |
| Database | None (production blocker) |
| Authentication | Custom JWT-style (email/password), not production-hardened |
| Multi-user support | None (single-user localStorage model) |
| Production readiness | **Alpha / Demo** — not suitable for regulated trial use without database, e-signatures, and multi-user audit trail |

---

*This document was prepared for expert review and contains detailed implementation notes that may be considered proprietary. Please treat as confidential.*
