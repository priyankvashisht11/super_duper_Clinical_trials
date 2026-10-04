# NexTrial (a.k.a. Clinical IQ) — Full Project Context

**Purpose of this document:** complete, current-as-of-inspection context for a new developer or an LLM assistant picking up this codebase cold. Written 2026-10-03 by directly inspecting the repository (file tree, git history, Prisma schema, source files, Docker/CI config) — not from memory or prior docs, several of which were found to be stale. Where this document supersedes an older in-repo doc, that's called out explicitly.

---

## 1. What This Project Is

A full-stack, AI-powered clinical trials management platform built for Indian physicians/investigators (PIs). It aims to cover the **entire trial lifecycle in one tool**: literature research → protocol authoring (ICH M11) → regulatory prep (CTRI/CDSCO/ICMR/GCP) → patient-trial matching → electronic data capture (EDC) → analysis → submission-ready documents.

**Positioning (from `scispace-mytomorrows-positioning.pdf`, the original product doc):** "SciSpace + myTomorrows for India" — SciSpace's research-intelligence UX plus myTomorrows' patient-trial matching, wrapped in an India-first regulatory workflow that doesn't exist as an integrated product anywhere else today.

**Two names in the repo — this is not a bug, it's history:**
- `clinical-iq-platform` is the `package.json` name and the original product name (pre-rebrand).
- **NexTrial** is the current brand — used in the UI, nginx config, deployment scripts, sprint docs, and `.env.production.example`. The rebrand happened at "Sprint 0."
- If you're searching the code, you'll see both. Treat NexTrial as current truth for anything user-facing.

**Current maturity: alpha / investor-demo stage**, not production-grade for handling real patient data yet. It **is**, however, actually deployed to a live DigitalOcean server with CI/CD (see §8). Several core compliance gaps (e-signature cryptographic binding, RBAC, real PII name-detection) are tracked but not fully closed — see §9.

---

## 2. Tech Stack

### Frontend (`/`, root-level `src/`)
- React 19 + TypeScript, built with Vite 7
- MUI (Material UI) v7 for components, Emotion for styling
- React Router v7 (client-side routing, see §5)
- Axios for HTTP, Notistack for toasts, react-hook-form for forms
- `jspdf` for client-side PDF generation (Analysis/Submission tab)
- `react-markdown` + `remark-gfm` for rendering AI responses
- Vitest + React Testing Library for tests (test coverage is minimal — 2 test files total)

### Backend (`backend/`)
- Node.js + Express + TypeScript, run via `tsx` in dev (no nodemon)
- Prisma ORM → PostgreSQL 15
- JWT auth (access + refresh tokens) with `bcrypt` password hashing
- `zod` and `express-validator` for request validation
- `express-rate-limit` for rate limiting (present, wiring should be verified per-route)

### External AI
- **Perplexity API** (`sonar` / `sonar-pro` models) is the primary and currently-configured AI provider — chosen specifically because it does live web search, which matters for clinical literature currency (see EXPERT_REVIEW.md rationale).
- The agent orchestrator (`backend/src/services/agent.orchestrator.ts`) will **auto-switch to Anthropic Claude (`claude-sonnet-4-6`)** if `ANTHROPIC_API_KEY` is set in `backend/.env`. As of this writing, **the local `backend/.env` does not have `ANTHROPIC_API_KEY` set** — only `PERPLEXITY_API_KEY`. So locally, everything currently runs on Perplexity.

### Data / infra services (Docker)
- PostgreSQL 15 — primary datastore
- Redis 7 — present in docker-compose, provisioned, not confirmed wired into any backend code path yet (no cache-layer usage found in a quick scan — verify before relying on it)
- Qdrant (vector DB, port 6333) — provisioned for the planned CTRI semantic-search ingestion pipeline (Sprint 9 design, not yet implemented — see §9)
- n8n (workflow automation, port 5678) — provisioned for the same planned CTRI ingestion pipeline, not yet built

---

## 3. Repository Structure

```
/ (root — frontend app)
├── src/
│   ├── App.tsx                      # Router — the real map of what pages exist (see §5)
│   ├── pages/                       # "New" pages (Sprint 1+), mostly agentic or Sprint 9-11 builds
│   │   ├── DashboardPage.tsx        # Authenticated home — trial cards, stats, create-trial
│   │   ├── ResearchPage.tsx         # Thin wrapper around <AgentChatPanel tab="research">
│   │   ├── RegulatoryPage.tsx       # CTRI/CDSCO/ICMR/GCP checklist UI (own data model, not agentic)
│   │   ├── PatientMatchPage.tsx     # Thin wrapper around <AgentChatPanel tab="match">
│   │   ├── EDCPage.tsx              # CRF builder + patient enrollment + data entry, backed by PostgreSQL via edcService
│   │   ├── CollectPage.tsx          # Separate, newer field-data-collection tool — see callout below
│   │   ├── AnalysisPage.tsx         # Cross-module dashboard + PDF export ("Submission Package")
│   │   └── ProtocolBuilderPage.tsx  # 14-section ICH M11 protocol editor
│   ├── components/
│   │   ├── pages/                   # "Old" pages predating the Sprint 0 rebuild (LandingPage, AboutPage, SettingsPage, etc.) — still routed, not dead
│   │   ├── agent/AgentChatPanel.tsx # The shared agentic chat UI used by 5 of the 6 feature tabs
│   │   ├── protocol-builder/        # Section editors/nav for the M11 builder
│   │   ├── layout/                  # TopNavigation, MainLayout, LifecyclePipeline (6-stage visual), FilterSidebar
│   │   ├── auth/                    # AuthModal, NotificationPanel, UserProfileMenu
│   │   └── styled/                  # Design-system primitives (Buttons, Cards, Inputs, Typography, etc.)
│   ├── contexts/                    # AuthContext, SearchContext, ProtocolContext, AICoPilotContext
│   ├── services/                    # authService, agentService (SSE client), protocolService, edcService, aiService, notificationService
│   ├── constants/trialStages.ts     # Shared 6-stage lifecycle definition (Research→Protocol→Regulatory→Execute→Analyze→Submit)
│   └── styles/theme.ts              # MUI theme — cobalt #0047AB primary, teal #00897B secondary, dark bg #0A1628
│
├── backend/
│   ├── src/
│   │   ├── app.ts                   # Express app, route registration
│   │   ├── controllers/             # One per domain: agent, ai, analysis, auth, edc, match, notification, protocol, research, user, validation(-rules)
│   │   ├── routes/                  # Matching route files
│   │   ├── services/
│   │   │   ├── agent.orchestrator.ts   # Core agentic engine (626 lines) — see §6
│   │   │   ├── pii.redactor.ts         # PII tokenization before data hits an LLM — see §7
│   │   │   ├── ai.service.ts           # Perplexity/Claude call wrapper
│   │   │   ├── research.service.ts     # PubMed/CTRI/ClinicalTrials.gov search + synthesis (1404 lines, largest service)
│   │   │   └── validation.service.ts   # ICH M11 / GCP / India-specific protocol validation rules (1021 lines)
│   │   ├── middleware/               # auth, rate-limit, validation
│   │   └── seed.ts, seed-validation-rules.ts
│   └── prisma/
│       ├── schema.prisma             # Full schema — see §4
│       └── migrations/               # 7 migrations, latest: 20260515075836_add_agent_audit_log
│
├── sprints/                          # Design docs, one per sprint, 0 through 9 — Sprint 9 is the most current written doc
├── docs/tech_debt.md                 # Living tech-debt register — accurate and worth reading before touching backend controllers
├── EXPERT_REVIEW.md                  # Point-in-time (post-Sprint-6) architecture rationale doc, written for an external reviewer — good for "why," but predates Sprints 7-11, so treat its "not implemented" list as partially outdated (see §9 for current gap list)
├── SECURITY.md                       # API key handling guidelines (dated Feb 2026, still broadly accurate)
├── SESSION_REPORT_2026_05_15.txt     # AI-assistant session log from the Sprint 7/8 push — historical, not a living doc
├── README.md                         # **STALE** — describes the pre-rebrand "Clinical Trials Platform," React 18, MUI v5, GPT-4. Do not trust this file for current stack facts; this full.md and docs/tech_debt.md are more current.
├── docker-compose.yml                # Local dev services (hardcoded passwords — fine for local, see §9)
├── docker-compose.prod.yml           # Production services, env-var driven
├── Dockerfile / backend/Dockerfile   # Frontend (nginx static) and backend (multi-stage, Alpine) images
├── nginx/nextrial.conf               # Production reverse-proxy config template
├── scripts/server-bootstrap.sh       # One-time DigitalOcean droplet setup script
├── scripts/backup.sh                 # DB backup script (cron'd daily by the bootstrap script)
└── .github/workflows/deploy.yml      # CI/CD — push to `master` auto-deploys
```

### ⚠️ Naming collision to know about: `EDCPage` vs `CollectPage`

Both exist, both are routed (`/edc` and `/collect`), and they overlap conceptually (both are "structured field data collection" tools) but are **architecturally unrelated**:

- **`EDCPage.tsx`** (Sprint 5, rebuilt Sprint 7) — CRF forms + patient enrollment + e-signature, persisted to **PostgreSQL** via `edcService.ts` (with localStorage fallback on API failure). This is the "real" EDC module and the one referenced throughout the sprint docs and tech debt register.
- **`CollectPage.tsx`** (819 lines, undocumented Sprint 10-11 work — see callout below) — a separate, **entirely client-side** (localStorage + `BroadcastChannel`) REDCap/ODK-style form builder with its own git-inspired commit/version history, multi-tab "presence" indicators, and offline-detection banner. No backend persistence at all — data lives only in one browser.

Nothing in `/sprints` documents Sprint 10 or 11. The only trace of this work is inline code comments in `CollectPage.tsx` (`// Sprint 10 — Presence`, `// Sprint 11 — Git-inspired versioning`, `// Sprint 11: Offline detection`). **This is a documentation gap** — whoever built Sprints 10-11 didn't write a sprint doc. If you did this work, consider backfilling `sprints/sprint-10-*.md` and `sprint-11-*.md` for continuity.

Also worth knowing: the "multi-user presence" and "real-time sync" in `CollectPage` only work **across tabs in the same browser** (`BroadcastChannel` is same-origin, same-browser only) — it is not real multi-device/multi-user sync. Don't oversell this feature to a PI or sponsor.

---

## 4. Database Schema (Prisma)

PostgreSQL via Prisma. 7 migrations applied, latest `20260515075836_add_agent_audit_log`. Full model list:

**Protocol domain** (JSON-blob-heavy, predates the agentic rework):
- `Protocol` — core trial record; stores a USDM-shaped `usdmJson` blob plus relational fields for querying
- `ProtocolSection` — one row per M11 section, `content` is a JSON blob
- `Objective`, `EligibilityCriterion`, `Intervention` — structured sub-entities off `Protocol`
- `ControlledTerminology`, `ValidationRule`, `ValidationResult`

**Auth / users:**
- `User` (role: researcher/admin/viewer; country defaults to "India"), `Session` (JWT + refresh token), `UserPreferences` (theme/language/timezone, default `Asia/Kolkata`), `PasswordResetToken`, `EmailVerificationToken`
- `Notification` — in-app notifications with priority/read state

**EDC (Sprint 5/7):**
- `CrfForm` → `CrfField` (form builder)
- `EdcPatient` → `EdcEntry` (enrollment + per-visit data; `EdcEntry` carries `signerName`/`signerRole`/`signedAt` for the Sprint 7 e-signature feature)
- `EdcAuditLog` — simple append-only action log

**Agentic AI (Sprint 8):**
- `AgentSession` (one per tab per conversation) → `AgentMessage` (role: user/assistant/tool) + `AgentArtifact` (markdown/pdf/json/csv outputs)
- `AgentAuditLog` — **separate, more rigorous** audit trail specifically for GCP/21 CFR Part 11 purposes: logs `action` (PLAN/TOOL_CALL/SYNTHESIS/ARTIFACT/ERROR), `toolName`, a `queryHash` (SHA-256, first 16 chars — **unsalted**, see §9 for the known multi-tenant risk), `durationMs`, `status`. Explicitly commented in the schema as "never updated or deleted."

**Design note carried over from the original architecture:** protocol content is stored as JSON blobs rather than fully normalized relational fields. This was a deliberate speed-over-structure tradeoff for the prototype phase — expect to revisit if cross-protocol querying/reporting becomes a requirement.

---

## 5. Frontend Routing (`src/App.tsx`)

| Route | Component | Notes |
|---|---|---|
| `/` | `LandingPage` | Public marketing page |
| `/dashboard` | `DashboardPage` | Main authenticated home |
| `/research` | `ResearchPage` | Agentic — Sprint 1 |
| `/regulatory` | `RegulatoryPage` | Checklist UI — Sprint 3 |
| `/match` | `PatientMatchPage` | Agentic — Sprint 4 |
| `/edc` | `EDCPage` | PostgreSQL-backed — Sprint 5/7 |
| `/collect` | `CollectPage` | Client-only, undocumented Sprint 9-11 |
| `/analysis` | `AnalysisPage` | Agentic + PDF export — Sprint 6 |
| `/protocol-builder` | redirects to `DashboardPage` | |
| `/protocol-builder/:id/*` | `ProtocolBuilderPage` | 14-section M11 editor |
| `/protocols`, `/protocols/:id/*` | legacy redirect / `ProtocolBuilderPage` | kept for old links |
| `/documents`, `/bookmarks`, `/about`, `/profile`, `/settings`, `/preferences→/settings`, `/help` | various `components/pages/*` | Older, non-agentic pages from pre-rebuild era, still live |
| `*` | redirects to `/` | |

Five of the six lifecycle tabs (Research, Match, Regulatory*, EDC*, Analysis) are meant to be "agentic" per Sprint 8 — *note Regulatory and EDC pages are actually their own bespoke UIs, not `<AgentChatPanel>` wrappers like Research/Match/Analysis. Verify current state in each file if this matters for your task; the sprint doc narrative (full agentic pivot) and the actual route-level components don't perfectly agree.

---

## 6. Agentic AI Architecture (Sprint 8, `backend/src/services/agent.orchestrator.ts`)

This is the core "smart co-investigator" engine referenced in product vision docs.

**Flow:** PI query → LLM plans a sequence of JSON tool-call steps → backend executes tools → results get synthesized by the LLM into a response → artifact (if any) saved to DB → everything streamed to the browser over SSE.

- **Tool registry:** `searchClinicalTrials`, `searchPubMed`, `searchWeb`, `searchCTRI` (currently a Perplexity web-search hack, not a real index — see §9), `parseEligibilityCriteria`, `analyzeEdcData`
- **Per-tab config** (`TAB_CONFIGS` in the orchestrator): each of the 6 tabs (`research`/`match`/`regulatory`/`edc`/`analysis`/`protocol`) gets its own system prompt, tool allowlist, plan prompt, and a `requiresPIIRedaction` flag. Currently `true` for `match` and `edc` only.
- **Streaming:** browser `EventSource` → `GET /api/agent/run/:sessionId/stream` → backend `emit()` pushes `plan` / `tool_start` / `tool_done` / `synthesis_chunk` / `artifact` / `done` events. Auth is now (2026-10-04) carried by the httpOnly session cookie via `EventSource(url, { withCredentials: true })` — previously the token was passed as `?token=...` in the URL because `EventSource` couldn't set custom headers, which also leaked it into server access logs and browser history; cookies close that.
- **Known scaling risk (flagged, not yet fixed):** browsers cap HTTP/1.1 connections to ~6 per origin. A PI with 3 tabs open streaming simultaneously, plus a second browser tab, hits that ceiling. Sprint 9 doc proposes HTTP/2 on nginx as the quick fix (`listen 443 ssl http2;` — one line) with full SSE-multiplexing as the correct long-term fix. **Check `nginx/nextrial.conf` before assuming this is done** — as inspected, the config does not yet have `http2` enabled.

---

## 7. PII / Compliance Layer (Sprint 8 + 9 work — `backend/src/services/pii.redactor.ts`)

Exists because patient descriptions typed into the Match tab (and some EDC queries) flow to a US-based LLM API, which raises DPDP Act 2023 §16 cross-border health-data-transfer obligations.

- **Layer 1 (regex, shipped):** strips/tokenizes Indian phone numbers, email, DOB-shaped dates, MRN prefixes, patient-ID prefixes (P/PT/SUB/SUBJ/PAT-prefixed), Aadhaar numbers, PAN numbers.
- **Layer 2 (generalization, shipped):** age → 10-year bands; city → tier string (25+ Indian cities + NCR mapped). Rationale documented inline: age+sex+condition+city is a classic re-identification set (cites Sweeney 2002).
- **Lifecycle contract (important if you touch this file):** `PIIRedactor` must be instantiated fresh per-request inside `runAgent()`, never as a singleton — the token map is ephemeral and must never be persisted or logged. This is enforced by convention/comment, not by code structure, so it's easy to accidentally break.
- **Tests (added 2026-10-04):** `pii.redactor.test.ts`, 36 adversarial cases, run via `npm test` in `backend/`. Writing them surfaced two real redaction gaps that are now fixed: the DOB regex never actually matched `YYYY-MM-DD` dates, and the MRN regex only consumed one separator character so `"MRN: 004521"` (colon *and* space) passed through unredacted.
- **`queryHash` salting (fixed 2026-10-04):** now salted per-`userId` before hashing, closing the cross-tenant rainbow-table risk.
- **Admin/self audit export (shipped 2026-10-04):** `GET /api/agent/audit?userId=&from=&to=&page=&limit=` — self-service by default, cross-user requires `role === 'admin'`.
- **Still not built:** NER-based name detection (regex can't catch free-text names like "Mr. Sharma"), vendor DPAs with Anthropic/Perplexity (process item, not code), the WHO ICTRP → Qdrant CTRI ingestion pipeline.

---

## 8. Deployment & Infrastructure (live, not hypothetical)

This is **currently deployed** — the CI/CD pipeline and bootstrap script are real and have clearly been run against a real DigitalOcean droplet (commit history shows iterative fixes to get the production build actually working: Alpine/Prisma binary targets, OpenSSL, TypeScript bypass, SCP-based deploy, env-driven API URLs).

- **Host:** DigitalOcean droplet, Ubuntu 22.04, Bangalore region (per `scripts/server-bootstrap.sh` header comment)
- **CI/CD:** `.github/workflows/deploy.yml` — triggers on push to `master`. Steps: typecheck frontend → build frontend (Vite, with `VITE_API_URL` baked in at build time from a GitHub secret) → SCP the built `dist/` to `/var/www/nextrial/` → SCP backend source + `docker-compose.prod.yml` to `/opt/nextrial/` → SSH in and `docker compose up --build -d backend` → poll `/health` for up to 60s → fail loudly with logs if it doesn't come up.
  - **Note:** this pipeline still does **not** typecheck the backend (only `npx tsc --noEmit` on the frontend), and the backend Dockerfile still runs `npx tsc --noEmitOnError false || true`, so a future backend typecheck regression would again ship silently. Worth tightening. As of 2026-10-04 the backend is actually clean (0 errors, was 24 as of 2026-10-03 — see `docs/tech_debt.md` for the fix-by-fix writeup), so there's no excuse not to make this step blocking now.
- **docker-compose.prod.yml:** Postgres (alpine), Redis (password-protected, 256MB maxmemory/LRU), Qdrant, n8n, and the backend container — all bound to `127.0.0.1` only (not exposed to the internet directly; nginx is the only public-facing process). Now also passes through `SMTP_*` env vars for the email service (added 2026-10-04).
- **nginx/nextrial.conf:** security headers set, gzip on, SSE route (`/api/agent/run/`) has buffering explicitly disabled with a 300s read timeout, static assets cached 1y/immutable, n8n proxied at `/n8n/` (password-protected via its own basic auth). Has a comment (added 2026-10-04) flagging that the live server's certbot-generated 443 block should be hand-edited to `listen 443 ssl http2;` to fix the SSE browser-connection-limit issue from sprint-09 — not something this session could apply directly (no SSH access to the droplet).
- **scripts/server-bootstrap.sh:** idempotent one-time setup — installs Docker/nginx/certbot/ufw/fail2ban, creates a 2GB swapfile (droplet is apparently small enough that Postgres+Redis+Docker risk OOM without it), creates a non-root `deploy` user for GitHub Actions to SSH as, auto-generates JWT secrets, obtains a Let's Encrypt cert via certbot, sets up a daily 2am DB backup cron. The `apt-get upgrade` step was hardened with `DEBIAN_FRONTEND=noninteractive` + `Dpkg::Options` flags (2026-10-04) to avoid interactive prompts during unattended runs.
- **Secrets hygiene:** `.env`, `backend/.env` are correctly gitignored and confirmed **not tracked** by git. `.env.production.backup` also exists locally but is untracked (caught by the `*.backup` gitignore rule). Only `.env.example`, `.env.production.example`, `backend/.env.example` are committed — all safe, templated, no real secrets.

---

## 9. Current State: What Works, What's Stubbed, What's Missing

### Solidly working
- Auth: register/login/JWT+refresh/password-reset-token/email-verification-token generation (DB side only — no email ever actually sent, see below)
- Protocol CRUD + 14-section ICH M11 builder with AI-assisted drafting and 1.5s autosave
- Validation engine (`validation.service.ts`, ~1000 lines) covering M11 conformance, cross-section consistency, GCP, and India-specific checks
- Regulatory checklist (CTRI/CDSCO/ICMR/GCP, 46 items total) with per-item AI assist, localStorage-persisted
- Patient-trial matching: Perplexity-based profile extraction → ClinicalTrials.gov v2 search → local heuristic scoring (deliberately not AI-based, for latency reasons — see EXPERT_REVIEW.md §3 for the rationale) → India-aware language/geography hints
- EDC: CRF form builder, patient enrollment, per-visit data entry, e-signature modal (name+role+IST timestamp), all PostgreSQL-backed with localStorage fallback
- Analysis dashboard: live cross-module metrics, AI insights (with graceful offline/local-compute fallback), 4 CDSCO-formatted PDF exports via jsPDF
- Agentic chat UX (SSE streaming, plan/tool/synthesis/artifact events) wired into Research, Match, and Analysis tabs
- PII redaction (regex + generalization layers) in front of the Match/EDC agent calls
- Append-only `AgentAuditLog` for every agent action

### Explicitly stubbed or mocked
- **CTRI search:** a Perplexity web-search prompt, not a real indexed/structured search. The planned fix (WHO ICTRP bulk XML → Qdrant vector index via a weekly n8n job) is designed in `sprints/sprint-09-compliance-layer.md` but **not implemented** — Qdrant and n8n are running in Docker but empty/unused for this purpose.
- **PDF exports:** functional (real jsPDF output, not literally fake), but not styled to actual CDSCO submission-document standards (no logo, non-standard margins/fonts per the EXPERT_REVIEW gap list) — treat as a working draft generator, not submission-ready output.
- ~~Email service~~ — fixed 2026-10-04, see below.

### Known gaps / risks (current as of 2026-10-04; full resolution history in `docs/tech_debt.md`)

**🔴 Most important open finding:** `ai`, `analysis`, `edc`, `match`, `protocol`, and `research` routes have **no authentication check at all** — only `agent`, `notification`, and `user` routes call `authenticateToken`. Anyone who can reach the API can read/write any protocol or EDC data. Not fixed yet because the real fix isn't just "add the middleware" — `Protocol`/`CrfForm`/`EdcPatient` etc. have no `userId`/owner column, so even a logged-in user would see everyone's data; and it's unclear whether anonymous access to Research/Match/Analysis is intentional (demo mode) or an oversight. See `docs/tech_debt.md` for the full writeup — this needs a product decision before it should be touched.

Resolved since the first version of this doc (2026-10-03) — kept here briefly so you know they were addressed, full detail in `docs/tech_debt.md`:
- Backend TypeScript errors: 24 → 0.
- JWT moved from localStorage to httpOnly cookies (`access_token`/`refresh_token`); SSE no longer needs `?token=` in the URL.
- Email service wired up (nodemailer SMTP, console-log fallback in dev) — password reset/verification emails actually send now, given SMTP credentials.
- `AgentAuditLog.queryHash` now salted per-user.
- `requireRole()` (existed, unused) now applied to the validation-rules toggle endpoint and the new `GET /api/agent/audit` endpoint.
- Agent artifact downloads now check ownership (previously any logged-in user could download any artifact by ID).
- PIIRedactor: 36-case adversarial test suite added (none existed before), which surfaced and fixed two real redaction gaps (`YYYY-MM-DD` dates and `"MRN: "`-with-space were both silently passing through unredacted).

Still open:
1. **No NER-based PII name detection** — regex-only redaction will miss free-text patient names in the Match tab.
2. **No electronic-signature cryptographic binding** — the SignatureModal captures name/role/timestamp but isn't cryptographically bound to the record.
3. **No RBAC beyond the two endpoints above** — `User.role` exists but almost nothing checks it, and most routes don't even check *who* you are (see the critical finding above).
4. **CollectPage's "multi-user" features are same-browser-only** (see §3 callout) — don't represent this as real multi-device collaboration.
5. **`docker-compose.yml` (local/dev) has hardcoded DB/n8n credentials** — fine for local dev, don't reuse these values anywhere real; `docker-compose.prod.yml` correctly uses env vars.
6. **`README.md` is stale** and describes a pre-rebrand, pre-Sprint-0 version of the stack — don't trust it; this document and `docs/tech_debt.md` are current.
7. **Redis is provisioned but its actual usage in the backend is unconfirmed** — worth verifying before assuming caching/session behavior depends on it.
8. **`JWT_REFRESH_SECRET` is configured everywhere but never actually used** — both token types are signed with the single `JWT_SECRET`. Not a bug, just dead config; flagging so it isn't mistaken for "two secrets in use."

---

## 10. Sprint History (what shipped, in order)

| Sprint | Title | Status | Key output |
|---|---|---|---|
| 0 | Architecture Reset + Branding | ✅ | NexTrial rebrand, new color palette, 6-stage lifecycle pipeline component, dashboard, 85 dead `.md` files + 9 dead `.tsx` removed |
| 1 | Research Intelligence | ✅ (superseded by Sprint 8's agentic rework) | `/research`, PubMed/CTRI/AI synthesis |
| 2 | Protocol Builder v2 | ✅ | Full rewrite of `ProtocolBuilderPage`, 2-column layout, AI draft generation |
| 3 | Regulatory Prep | ✅ | `/regulatory`, 46-item 4-track checklist |
| 4 | Patient-Trial Matching | ✅ | `/match`, extraction+search+scoring pipeline |
| 5 | EDC / Data Collection | ✅ | `/edc`, localStorage-first CRF builder |
| 6 | Analysis + Submission | ✅ | `/analysis`, live dashboard, 4 PDF exports |
| 7 | E-Signature + CDSCO PDFs + PostgreSQL | ✅ | EDC moved to Postgres, SignatureModal, CDSCO-formatted PDF headers/footers |
| 8 | Agentic AI Transformation | ✅ | `AgentOrchestrator`, SSE streaming, `AgentSession`/`AgentMessage`/`AgentArtifact`/`AgentAuditLog`, PIIRedactor v1, Redis/Qdrant/n8n added to Docker |
| 9 | Compliance Layer (DPDP + GCP audit + CTRI ingestion) | 🟡 Partially done | PIIRedactor generalization, tests (36 cases, 2 bugs found+fixed), queryHash salt, and admin/self audit endpoint all shipped 2026-10-04. Still open: NER name detection, CTRI/Qdrant ingestion, HTTP/2 SSE fix (documented, needs manual server action) |
| 10 | Collect: Presence & Real-Time Sync | ✅ | Backfilled 2026-10-03 from code — `sprints/sprint-10-collect-presence.md` |
| 11 | Collect: Version History & Offline Detection | ✅ | Backfilled 2026-10-03 from code — `sprints/sprint-11-collect-history-offline.md` |

Production deployment infrastructure (DigitalOcean + CI/CD, §8) was built **after** Sprint 8, based on commit timestamps, but has no corresponding sprint doc either.

---

## 11. Local Development Setup

```bash
# 1. Install deps
npm install                 # frontend, repo root
cd backend && npm install   # backend

# 2. Start infra (Postgres, Redis, Qdrant, n8n)
docker compose up -d        # repo root, uses docker-compose.yml

# 3. Backend env
cp backend/.env.example backend/.env
# Fill in: DATABASE_URL (matches docker-compose Postgres creds),
#          JWT_SECRET (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"),
#          PERPLEXITY_API_KEY (required for any AI feature to work),
#          ANTHROPIC_API_KEY (optional — orchestrator prefers this over Perplexity if set),
#          SMTP_* (optional — if unset, emails are logged to the console instead of sent, which is fine for local dev)

# 4. DB setup
cd backend
npx prisma generate
npx prisma migrate dev      # applies all 7 migrations
npm run seed                # optional sample data
npm run seed:validation-rules

# 5. Run
npm run dev                 # backend — tsx watch, port 3001
cd .. && npm run dev        # frontend — vite, default port 5173

# 6. Frontend env
cp .env.example .env
# VITE_API_URL=http://localhost:3001/api
```

The user's memory/session notes reference shortcut phrases **"START UP BABY"** (starts the full stack) and **"BABY GO DOWN"** (stops it) — these are user-defined conventions for the assistant, not scripts in the repo; if you're an LLM picking this up fresh, there is no `startup.sh` — you'd need to run the steps above (or ask what those commands are supposed to automate and build them).

---

## 12. Product Vision (for context on *why*, not just *what*)

Confirmed product principles (from the original positioning doc and prior planning conversations):
- Full lifecycle coverage: Research → Protocol → Regulatory → Execute (EDC) → Analyze → Submit, with the explicit test for any new feature being "does this help the PI move from idea to completed trial without leaving the platform?"
- AI must be **woven in, proactive**, not a chatbot bolted onto a form — "smart co-investigator," not "help assistant." Concretely: no popup tooltips, no generic suggestions, AI presents a first draft and the PI corrects it (not the reverse).
- India-first: CTRI/CDSCO/ICMR compliance woven in invisibly, multi-language support (Hindi/Tamil/Bengali planned), Indian pincode-based geographic matching, `Asia/Kolkata` timezone default, "India" as the default country on user records.
- Planned pricing tiers (₹2,000/mo Basic up to ₹3,00,000/mo Enterprise white-label) and multi-year revenue targets exist in the original positioning doc — these are business-side plans, not reflected in any billing code (no billing/subscription logic found in the codebase).

---

## 13. Git / Branching

- `master` is the actual working branch (confusingly, `main` also exists as a separate, apparently less-current branch — check with your collaborator before assuming which one is canonical for a given task)
- `origin/shivam_1.0` — a teammate's (Shivam's) branch
- Recent commit history before 2026-10-04 was entirely production-deployment hardening: Prisma/Alpine/OpenSSL fixes, TypeScript-bypass-for-build fixes, SCP-based deploy, `VITE_API_URL` consistency fixes. The 2026-10-04 commits are the first substantive backend-hardening work since then: all 24 backend TypeScript errors fixed, httpOnly-cookie auth migration, a working email service, two narrow RBAC applications, an artifact-ownership fix, PIIRedactor test suite (+2 real bugs it found), and backfilled sprint-10/11 docs. See `docs/tech_debt.md` for the detailed writeup of each.

---

## 14. If You're an LLM Reading This Cold

Treat this file as more current than `README.md` and `EXPERT_REVIEW.md` for stack/architecture facts (both predate significant later work), but treat `docs/tech_debt.md` and the `sprints/` folder as living, accurate, close-to-ground-truth docs for debt and sprint-by-sprint feature rationale respectively. When in doubt about whether something described here is still true, it's a small enough codebase to just grep/read the actual file — most claims above are traceable to a specific file path called out inline.
