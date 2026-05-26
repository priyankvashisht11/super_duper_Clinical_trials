> **⚠ SUPERSEDED** — Archived for historical reference. PatientMatchPage replaced by `AgentChatPanel tab="match"` in [Sprint 8](sprint-08-agentic-ai.md). The scoring algorithm and ClinicalTrials.gov two-pass search logic are now inside the agent's tool registry.

# Sprint 4 — Patient-Trial Matching

**Status:** ✅ COMPLETE (superseded by Sprint 8 agentic rewrite)  
**Shipped:** 2026-05-14  
**Duration:** 1 session

---

## Goal

PI pastes a patient description in plain English → system extracts a structured profile → searches ClinicalTrials.gov → scores and ranks matching trials.

---

## Deliverables

### Backend

**`match.controller.ts`** — 3-stage pipeline:
1. **Profile extraction**: Perplexity sonar parses free-text description → structured JSON `{ condition, age, gender, location, city, state, keyFindings }`
2. **Trial search**: ClinicalTrials.gov API v2 with India filter; fallback to global if <5 results
3. **Scoring**: deterministic scoring algorithm

**Scoring algorithm:**

| Factor | Points |
|---|---|
| Base score | 25 |
| Condition keyword match | 0–40 |
| Status = RECRUITING | 20 |
| Phase match | 0–8 |
| **Max** | **99** |

**Language mapping**: 20+ Indian cities/states → primary languages (Kannada, Tamil, Bengali, etc.) shown on trial card.

### Frontend

**PatientMatchPage** — 3 states:

| State | Content |
|---|---|
| Idle | Large textarea + 3 example patient descriptions (NSCLC, T2DM, RRMS) |
| Loading | Animated 3-step sequence: Extract profile → Search trials → Score matches |
| Results | Sticky `ProfileCard` + scrollable `TrialCard` list |

**ProfileCard**: condition, age, gender, location, key findings, language chips  
**TrialCard**: confidence badge (excellent/good/possible/low), status chip, phase, NCT ID link, description, geographic note

---

## Acceptance Criteria

- [x] Profile extraction works for condition, age, gender, location from free text
- [x] India-first trial search with global fallback
- [x] Confidence badges calculated correctly
- [x] Language chip shown for known Indian cities
- [x] 0 TypeScript errors

---

## Technical Decisions

| Decision | Choice | Reason |
|---|---|---|
| Profile extraction | Perplexity LLM | Free text is too varied for regex; LLM handles "52-year-old woman with stage III..." |
| Scoring | Deterministic local | No LLM calls for scoring — fast, consistent, debuggable |
| Two-pass search | India filter → global fallback | Indian PIs care about local trials first |

→ **Superseded by Sprint 8**: PatientMatchPage rebuilt as `AgentChatPanel` with `tab="match"` — agentic flow gives richer multi-step reasoning.
