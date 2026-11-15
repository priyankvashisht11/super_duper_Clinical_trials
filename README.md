# NexTrial

**An AI-powered clinical trials platform for Indian physician-investigators** — covering the full trial lifecycle from literature research through protocol authoring, regulatory prep, patient-trial matching, electronic data capture (EDC), and analysis, in one tool.

> 🚧 **Work in progress.** This is an actively-developed personal/portfolio project, not a finished product. Several core pieces (most notably: most API routes have no authentication yet, and a few features are intentionally stubbed for the prototype stage) are called out honestly below and in [`docs/tech_debt.md`](docs/tech_debt.md). Don't take anything here as production-ready or regulatory-compliant as-is.

## What it does

India has no integrated platform covering a clinical trial's full lifecycle — tools exist for literature search, or for patient matching, or for EDC, but not for all of it together, and nothing is built around CTRI/CDSCO/ICMR compliance specifically. NexTrial is an attempt at that:

- **Research** — AI-assisted literature synthesis across trial registries and medical literature for a given therapeutic area
- **Protocol Builder** — a 14-section editor following the ICH M11 standard protocol structure, with AI-assisted drafting and a validation engine covering M11 conformance, cross-section consistency, GCP, and India-specific checks (57 seeded rules)
- **Regulatory Prep** — a guided checklist across CTRI registration, CDSCO Form 44, ICMR ethics, and GCP requirements
- **Patient-Trial Matching** — free-text patient description → extracted clinical profile → matched against trial registries with confidence scoring, with PII redaction before anything reaches a third-party AI API
- **EDC (Electronic Data Capture)** — CRF form builder, patient enrollment, e-signature-backed data entry, audit trail
- **Analysis & Submission** — a cross-module dashboard with AI-generated insights and CDSCO-formatted PDF exports

Five of the six modules run on a shared **agentic AI architecture**: a query gets planned into tool calls (search literature, search trials, parse eligibility criteria, etc.), the tools execute, and the result streams back over SSE with a visible plan — not a chatbot bolted onto a form.

## Tech stack

**Frontend** — React 19, TypeScript, MUI v7, Vite, React Router v7
**Backend** — Node.js, Express, TypeScript, Prisma ORM, PostgreSQL
**AI** — Perplexity (live web search, so literature answers reflect current trial results rather than stale training data) with an automatic fallback to Claude when configured
**Infra** — Docker (Postgres, Redis, Qdrant, n8n), nginx, deployed via GitHub Actions CI/CD to a DigitalOcean droplet

## A few things worth highlighting

- **Compliance-aware by design, not as an afterthought**: patient data gets regex + generalization-based PII redaction (age bands, city tiers) before any text reaches an external AI API, backed by a 36-case adversarial test suite. Every agent action is logged to an append-only audit trail for GCP/21 CFR Part 11-style traceability.
- **Tracked, written-down engineering decisions**: the project is built in sprints, each with a short design doc under [`sprints/`](sprints/) explaining what shipped and why — including *why Perplexity over OpenAI* (live search matters for clinical currency), *why a heuristic scorer over an AI call* for patient matching (latency), and *why ICH M11* as the protocol structure (global regulatory harmonization).
- **Honest debt tracking**: [`docs/tech_debt.md`](docs/tech_debt.md) is a living register of known gaps, including the biggest open one — most API routes aren't authenticated yet, which is flagged rather than quietly left undocumented.

## Current status

| Area | State |
|---|---|
| Research, Protocol Builder, Regulatory, Patient Matching, EDC, Analysis | Functional end-to-end, backed by a real PostgreSQL schema |
| TypeScript | 0 errors, frontend and backend both strict |
| Tests | Backend: PII redaction adversarial suite. Frontend: minimal — not yet a priority |
| Auth | JWT via httpOnly cookies; most data routes aren't gated behind it yet (see tech debt doc) |
| CTRI search | Currently an AI web-search query, not a real indexed registry — a proper ingestion pipeline is designed but not built |
| PDF exports | Functional but not styled to formal CDSCO submission standards yet |
| Deployment | Live CI/CD to a small DigitalOcean droplet — this is a demo deployment, not a scaled production setup |

## Running it locally

```bash
# Frontend
npm install
npm run dev          # http://localhost:5173

# Backend (separate terminal)
cd backend
npm install
cp .env.example .env  # fill in DATABASE_URL, JWT_SECRET, PERPLEXITY_API_KEY at minimum
npx prisma migrate deploy
npm run dev           # http://localhost:3001

# Infra (Postgres, Redis, Qdrant, n8n) via Docker, from repo root
docker compose up -d
```

See [`full.md`](full.md) for a complete architecture writeup, and [`sprints/`](sprints/) for the development history, sprint by sprint.

## License

Personal portfolio project. Not licensed for reuse.
