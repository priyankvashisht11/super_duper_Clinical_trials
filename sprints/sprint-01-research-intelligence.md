> **⚠ SUPERSEDED** — This page is archived for historical reference. The ResearchPage was replaced by an `AgentChatPanel` wrapper in [Sprint 8](sprint-08-agentic-ai.md). The backend research endpoints remain active and are called by the agent's tool registry.

# Sprint 1 — Research Intelligence

**Status:** ✅ COMPLETE (superseded by Sprint 8 agentic rewrite)  
**Shipped:** 2026-05-14  
**Duration:** 1 session

---

## Goal

Give the PI a research entry point: type a therapeutic area, get PubMed + CTRI + AI synthesis back. This is the first thing a PI does before writing a protocol.

---

## Deliverables

### ResearchPage (`src/pages/ResearchPage.tsx`)
- SciSpace-inspired layout: numbered paper list, blue link titles, visible abstracts, minimal chrome
- Two states: idle (hero + example chips) → results (AIBriefPanel left + paper/trial tabs right)
- `ArticleCard` — index number, blue title link, DOI, Open button, abstract collapse
- `TrialCard` — status dot, inline meta (phase, sponsor, enrollment), CTRI link

### AI Synthesis
- `AIBriefPanel` — left column in results view
- Calls `POST /api/research/search` → Perplexity synthesis
- `renderInlineTerms()` — highlights `"quoted"` emphasis terms from Perplexity response
- `renderSynthesisContent()` — paragraph chunker for unformatted Perplexity blobs

### Backend
- `GET /api/research/search` — PubMed E-utilities + Perplexity web synthesis
- Returns: `{ articles, trials, synthesis }` combined response

---

## Acceptance Criteria

- [x] Search returns PubMed articles with title, authors, abstract, DOI
- [x] AI synthesis renders as readable paragraphs (not a wall of text)
- [x] CTRI trials section shows status + phase
- [x] 0 TypeScript errors

---

## Known Limitations at Ship

- CTRI results come via Perplexity web search (no direct CTRI API)
- Synthesis quality depends on Perplexity sonar-pro context window
- No session persistence (reloading loses results)

→ **Superseded by Sprint 8**: ResearchPage rebuilt as `AgentChatPanel` wrapper with full session persistence and streaming.

---

## Technical Decisions

| Decision | Choice | Reason |
|---|---|---|
| Synthesis format | Plain paragraphs with `"quoted"` terms | Avoids `##` headers that look weird in inline context |
| Layout | Two-column results | Paper density on right, AI context on left |
| Citation numbering | Sequential `[1]`, `[2]`... | PubMed convention |
