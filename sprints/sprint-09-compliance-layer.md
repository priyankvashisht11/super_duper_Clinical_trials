# Sprint 9 — Compliance Layer (DPDP + GCP Audit Trail + CTRI Ingestion)

**Status:** 🔜 NEXT  
**Target:** TBD  
**Priority drivers:** DPDP Act 2023, GCP ICH E6(R2) §5.5, prototype hardening before real patient data enters the system

---

## Why This Sprint Exists

External architect review (2026-05-15) flagged three gaps that must be addressed before NexTrial handles real patient data in the match or EDC tabs:

1. **DPDP Act 2023** — patient descriptions in the Match agent flow to US-based LLM APIs. Under Sec. 16, cross-border transfer of health data requires the Data Fiduciary (the HCP) to have DPAs with vendors and enforce pseudonymization.

2. **GCP audit trail** — ICH E6(R2) §5.5.3 requires every system action on patient-relevant data to be immutably logged. "The agent flagged this deviation" must be traceable to a timestamp, user, and model version.

3. **CTRI search is a Perplexity web search hack** — fragile, unindexed, may miss trials. WHO ICTRP provides a public bulk XML/CSV export that includes all Indian CTRI trials. A nightly n8n ingestion pipeline gives us fast, reliable, offline-capable CTRI search via Qdrant vector index.

---

## Deliverables

### 0. SSE Connection Limit — HTTP/2 or Multiplex (HIGHEST PRIORITY)

**Why it's not Phase 6:** NexTrial has 5 feature tabs. A PI with Research + Match + Regulatory streaming simultaneously is already at 3 SSE connections. Add a second browser tab of NexTrial = 4. The HTTP/1.1 browser cap is 6 per origin. This fails in user testing, not in production scaling.

**Option A (faster):** Enable HTTP/2 on the production nginx reverse proxy — one config line.
```nginx
listen 443 ssl http2;
```
Lifts the per-origin cap to ~100 multiplexed streams per connection.

**Option B (correct long-term):** SSE multiplexing — one `EventSource` per user, events include `sessionId` so client demuxes them. This is how Slack/Linear/Notion do it. Requires refactor of:
- `agent.controller.ts` — single user channel instead of per-session channel
- `AgentChatPanel.tsx` — subscribe to shared EventSource, filter by sessionId
- `agentService.ts` — `streamRun()` becomes `subscribeToUserChannel()`

**Sprint 9 ships:** Option A for staging. Option B design documented for Sprint 10.

### 1. PIIRedactor service (already shipped in Sprint 8)

`backend/src/services/pii.redactor.ts` — tokenizes before LLM, restores in display.

Patterns covered: Indian phone numbers, email, dates-of-birth, MRN/patient IDs, Aadhaar, PAN.

Wired into: `match` and `edc` tab configs via `requiresPIIRedaction: true` flag.

**Already shipped in Sprint 8 (post-review):**
- `generalizeAndRedact()` on PIIRedactor — Layer 2 quasi-identifier generalization for match tab
  - Age → 10-year bands: "52-year-old" → "50–59 year old"
  - Cities → tier strings: "Mumbai" → "tier-1 Indian city", "Pune" → "tier-2 Indian city"
  - 25 Indian cities + NCR region covered
- Match tab wired to `generalizeAndRedact()`, EDC tab to `redact()` only

**Remaining work:**

- [ ] **NER-based name detection** — library: [GLiNER `gliner-multi-v2.1`](https://github.com/urchade/GLiNER) (Python microservice) or [spaCy `en_core_web_trf`](https://spacy.io/) with `PERSON` entity extraction. Target: ≥90% recall on Indian English clinical free-text. Run via local Docker service, not an external API. Input: match-tab query after Layer 1+2. Output: names replaced with `[NAME_N]`.

- [ ] **PIIRedactor unit tests** — minimum **30 adversarial test cases** drawn from realistic Indian clinical free-text. Required cases:
  - Each of 7 regex patterns × at least 2 variants
  - Age generalization: single-age, "aged X", ", X years" formats
  - City generalization: Tier 1, Tier 2, NCR, unknown city (no change expected)
  - Quasi-identifier combo: "52F HER2+ Mumbai" → all three generalized
  - Edge cases: age=0, age=120, age=999 (out of range, no change)
  - Restore round-trip for structured tokens (generalized fields cannot restore — test that too)
  - Mixed Hindi city names with Latin script

- [ ] **queryHash per-tenant salt** — when multi-tenant is introduced (Phase 6), salt SHA-256 with `userId` to prevent rainbow-table correlation across tenants. Note in Phase 6 design doc.

- [ ] Log redaction events to AgentAuditLog (already wired, verify counts are correct)

### 2. AgentAuditLog (already shipped in Sprint 8)

Prisma model `AgentAuditLog` — append-only, never updated or deleted.

Fields: userId, sessionId, action (PLAN/TOOL_CALL/SYNTHESIS/ARTIFACT/PII_REDACTED/ERROR), toolName, queryHash (SHA-256 first 16 chars), status, durationMs, meta (JSON).

Migration: `20260515075836_add_agent_audit_log` — applied.

**Remaining work:**
- [ ] Admin endpoint: `GET /api/agent/audit?userId=&from=&to=` — for PI or CDSCO inspector to download their own audit trail
- [ ] Retention policy: audit logs must be retained ≥1 year (DPDP §8(7)) — add a scheduled n8n job to archive to cold storage after 1 year
- [ ] Export as signed PDF: for GCP inspection readiness

### 3. CDSCO GCP / NDCT 2019 Control Mapping (1-page document, not code)

**Why:** If a trial sponsor using NexTrial gets CDSCO-audited, they'll be asked for a Computer System Validation (CSV) document for the platform. This is a 4-hour task, not a codebase change.

**Deliverable:** `/docs/cdsco-control-mapping.md` — one-page table mapping NexTrial's existing controls to:
- New Drugs and Clinical Trials Rules 2019 (NDCT) — applicable to Indian trials
- ICH E6(R2) §5.5 (computerised systems) — already partially covered by Sprint 7 e-signatures and AgentAuditLog
- CDSCO GCP Guidelines (2001, updated 2019)

**Control mapping table (draft):**

| Control Requirement | NexTrial Implementation | Gap |
|---|---|---|
| Audit trail (NDCT Rule 31) | AgentAuditLog — append-only, SHA-256 queryHash | No admin export UI yet |
| Electronic signatures (ICH E6(R2) §5.5.3) | SignatureModal — name + role + IST timestamp | Not yet cryptographically bound |
| Access controls (NDCT Rule 31(5)) | JWT auth, userId isolation | No RBAC roles yet |
| Backup and recovery | Postgres in Docker volume | No documented backup procedure |
| System validation (NDCT Rule 31(4)) | TypeScript 0 errors, test coverage in Sprint 9 | No IQ/OQ/PQ doc |
| Data retention ≥ 5 years (NDCT) | Postgres + no delete | No cold archival to S3 |

**Note:** NexTrial as a co-pilot tool (PI drafts, reviews, signs off) requires less formal CSV than a standalone EDC system used without PI oversight. Document this positioning explicitly.

### 4. Vendor DPAs (process, not code)

- [ ] Sign Data Processing Agreement with Anthropic (available in Anthropic console → Legal)
- [ ] Sign DPA with Perplexity (contact their enterprise team)
- [ ] Document in `/docs/dpdp-compliance.md`: data flows, transfer mechanisms, vendor locations
- [ ] Add DPDP notice to user onboarding: "NexTrial uses AI services. Patient data is pseudonymized before processing."

### 4. CTRI Ingestion via n8n + Qdrant

**Goal:** Replace the fragile `searchCTRI` Perplexity web search with a real vector index of all Indian CTRI trials.

**Pipeline:**
```
n8n cron (weekly) 
  → WHO ICTRP bulk download (India filter)    https://trialsearch.who.int/Trial2.aspx?TrialID=
  → parse XML → extract: CTRI ID, title, condition, intervention, status, phase, sites
  → generate embeddings (model: TBD — BGE-M3 self-hosted or text-embedding-3-small)
  → upsert into Qdrant collection: `ctri_trials`
  → update Postgres: last_sync_at timestamp
```

**New tool in orchestrator:**
```typescript
async function searchCTRI(query: string): Promise<ToolResult> {
  // Semantic search against Qdrant ctri_trials collection
  const embedding = await embed(query);
  const results = await qdrant.search('ctri_trials', { vector: embedding, limit: 10 });
  return { tool: 'search_ctri', status: 'ok', count: results.length, data: results };
}
```

**Qdrant collection schema:**
```json
{
  "name": "ctri_trials",
  "vectors": { "size": 768, "distance": "Cosine" },
  "payload": ["ctri_id", "title", "condition", "intervention", "status", "phase", "sites", "pi_name"]
}
```

### 5. Research Brief Semantic Memory

**Goal:** When a PI asks a follow-up question, surface relevant past sessions.

- Embed every `AgentArtifact.content` on creation → store in Qdrant collection `research_briefs`
- At session start, query Qdrant for top-3 similar past briefs → include as context in planning prompt
- `GET /api/agent/sessions/similar?query=...` → returns top-3 past sessions by semantic similarity

### 6. Observability — Structured Agent Logging

**Goal:** Debug "why did the agent skip CTRI?" without guessing.

For now: structured `console.log` with JSON — Langfuse-compatible format so we can plug in Langfuse self-hosted later.

```typescript
console.log(JSON.stringify({
  ts: new Date().toISOString(),
  event: 'agent_step',
  userId, sessionId, tab,
  action, toolName, durationMs, status,
}));
```

**Future:** Self-hosted Langfuse (Docker) → add `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY` to env → swap console.log for Langfuse SDK.

---

## Acceptance Criteria

- [ ] PIIRedactor unit tests: 8 patterns × redact + restore = 16 test cases, all green
- [ ] Named-entity name detection blocks "John Smith" from reaching LLM (95% precision target)
- [ ] `GET /api/agent/audit` returns paginated logs for authenticated user
- [ ] CTRI Qdrant search returns real CTRI trial data for "diabetes" query
- [ ] n8n CTRI ingestion cron runs on schedule and updates Qdrant
- [ ] Research briefs embedded and retrievable by semantic similarity
- [ ] Vendor DPA docs present in `/docs/`
- [ ] 0 TypeScript errors

---

## Technical Decisions

| Decision | Choice | Reason |
|---|---|---|
| Embedding model | BGE-M3 self-hosted (multilingual) | Free, multilingual (Hindi/English medical terms), runs on CPU, 768-dim |
| Qdrant distance | Cosine | Standard for text embeddings |
| Audit log retention | Postgres + n8n archive → S3-compatible | Simple, auditable, cheap for 1yr retention |
| CTRI source | WHO ICTRP bulk XML | CTRI is a primary register; ICTRP is the authoritative aggregator |
| Observability | console.log (JSON) → Langfuse later | Start with zero infra; Langfuse SDK is a one-line swap |
| Named-entity for PII | Heuristic Title-case + medical vocab exclusion | NLP model adds a Docker service; heuristic covers 90% of cases in clinical context |

---

## What the Expert Review Said to Ignore (for prototype)

- **21 CFR Part 11 full CSV** — required if NexTrial's EDC is used in a regulated trial under FDA jurisdiction. Not applicable until FDA filing is imminent. Audit trail + e-signatures (Sprint 7) cover ICH E6(R2) for Indian trials.
- **HTTP/2 for SSE** — browser cap of 6 SSE connections per origin is real but only matters with 3+ tabs streaming simultaneously. Serve over HTTP/2 (nginx config change) in Phase 6 when you go multi-instance.
- **Programmatic Tool Calling** — Anthropic feature for Claude writing Python to orchestrate tools. Evaluate in Sprint 10 for batch patient matching and nightly EDC scans.
- **Supabase RLS** — multi-tenant row-level security. Phase 6 when adding multiple PI accounts per institution.
- **Puppeteer/Playwright PDF** — current jsPDF is fine for reports. Switch to server-side rendering only if protocol PDFs need complex table formatting or Hindi Unicode that jsPDF can't handle.
- **Opus 4.7** — use for hard protocol-design reasoning if Sonnet 4.6 quality is insufficient. Swap model name in `callLLM()`.
