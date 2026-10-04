# NexTrial Sprint Specs

One file per sprint. Each spec is written before execution begins and updated on completion.

---

| Sprint | Title | Status | Shipped |
|---|---|---|---|
| [Sprint 0](sprint-00-architecture-reset.md) | Architecture Reset + Branding | ✅ Complete | 2026-05-14 |
| [Sprint 1](sprint-01-research-intelligence.md) | Research Intelligence | ✅ Complete (superseded S8) | 2026-05-14 |
| [Sprint 2](sprint-02-protocol-builder.md) | Protocol Builder v2 | ✅ Complete | 2026-05-14 |
| [Sprint 3](sprint-03-regulatory-prep.md) | Regulatory Prep | ✅ Complete (superseded S8) | 2026-05-14 |
| [Sprint 4](sprint-04-patient-match.md) | Patient-Trial Matching | ✅ Complete (superseded S8) | 2026-05-14 |
| [Sprint 5](sprint-05-edc.md) | EDC Data Collection | ✅ Complete (superseded S8) | 2026-05-14 |
| [Sprint 6](sprint-06-analysis-submission.md) | Analysis + Submission | ✅ Complete (superseded S8) | 2026-05-14 |
| [Sprint 7](sprint-07-esignature-postgres-pdf.md) | E-Signature + CDSCO PDFs + PostgreSQL | ✅ Complete | 2026-05-14 |
| [Sprint 8](sprint-08-agentic-ai.md) | Agentic AI Transformation | ✅ Complete | 2026-05-15 |
| [Sprint 9](sprint-09-compliance-layer.md) | Compliance Layer (DPDP + Audit + CTRI) | 🟡 Partially shipped (PII Layer 2 done; NER, tests, CTRI ingestion, HTTP/2 open) | — |
| [Sprint 10](sprint-10-collect-presence.md) | Collect: Presence & Real-Time Sync | ✅ Complete (backfilled 2026-10-03) | unknown |
| [Sprint 11](sprint-11-collect-history-offline.md) | Collect: Version History & Offline Detection | ✅ Complete (backfilled 2026-10-03) | unknown |

Sprints 10 and 11 shipped in code with no sprint doc written at the time — see the numbering note in each backfilled doc for a flagged inconsistency with Sprint 9's numbering.

---

## Naming Convention

`sprint-{NN}-{kebab-slug}.md`

## Spec Structure (per file)

Each sprint spec includes:
- **Goal** — one paragraph, the "why"
- **Deliverables** — what exactly ships (components, routes, models)
- **Acceptance Criteria** — checkboxes, must all be green before sprint is "done"
- **Technical Decisions** — table of key choices + reasoning

Specs for completed sprints are updated to reflect what actually shipped vs what was planned.
