import axios from 'axios';
import { createHash } from 'crypto';
import { PrismaClient } from '@prisma/client';
import { PIIRedactor, sanitizeEdcSummary } from './pii.redactor';

// ── Anthropic tool schemas ────────────────────────────────────────────────────
// Passed to every Claude API call so they land in the cached prefix.
// cache_control on the LAST tool caches all 6 schemas (prefix order: tools → system → messages).
// This pushes the cached prefix over the 1024-token minimum for Sonnet 4.6.
// tool_choice is left as "auto" — the planning/synthesis prompts instruct text-only output.
// If Claude ever returns a tool_use block instead of text, callLLM() falls back to ''.

const AGENT_TOOL_SCHEMAS = [
  {
    name: 'search_clinical_trials',
    description: 'Search ClinicalTrials.gov API v2 for clinical trials worldwide. Returns NCT IDs, titles, overall status, phase, primary conditions, interventions, enrollment counts, sponsor names, start dates, and brief summaries. Use for finding recruiting, completed, or terminated trials relevant to a therapeutic area, patient population, or intervention type.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Search term — condition name, drug/intervention, or NCT ID' },
        status: { type: 'string', description: 'Filter by status: RECRUITING | COMPLETED | ACTIVE_NOT_RECRUITING | TERMINATED' },
        phase: { type: 'string', description: 'Filter by phase: PHASE1 | PHASE2 | PHASE3 | PHASE4 | EARLY_PHASE1' },
      },
      required: ['query'],
    },
  },
  {
    name: 'search_pubmed',
    description: 'Search PubMed via NCBI E-utilities for peer-reviewed biomedical literature. Returns article PMIDs, titles, author lists, journals, and publication years sorted by relevance. Use for clinical evidence, systematic reviews, randomised controlled trials, meta-analyses, and guideline papers on a therapeutic area or intervention.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'PubMed query — supports MeSH terms, author names, journal names, and free text boolean operators' },
        max_results: { type: 'number', description: 'Maximum articles to return (default: 10, max: 50)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'search_web',
    description: 'Search the live web via Perplexity AI for current information, regulatory updates, news, and guidelines. Returns a synthesized summary with inline citations. Use for recent approval decisions, guideline changes, conference data, and information not yet indexed in academic databases.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Natural language web search query' },
      },
      required: ['query'],
    },
  },
  {
    name: 'search_ctri',
    description: 'Search the Clinical Trials Registry of India (CTRI) for Indian clinical trials registered under CDSCO oversight. Returns CTRI-registered interventional and observational studies. Use specifically for India-specific trial discovery, CTRI registration numbers, and Indian site information.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Search query for Indian clinical trials — condition, drug, or CTRI registration number (CTRI/YYYY/MM/XXXXXX)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'parse_eligibility',
    description: 'Fetch the complete eligibility criteria (inclusion and exclusion criteria text) for a specific clinical trial from ClinicalTrials.gov using its NCT ID. Use when assessing whether a patient profile matches a specific trial\'s requirements or when eligibility parsing is needed for patient matching.',
    input_schema: {
      type: 'object' as const,
      properties: {
        nct_id: { type: 'string', description: 'ClinicalTrials.gov NCT identifier in format NCT followed by 8 digits, e.g. NCT04513964' },
      },
      required: ['nct_id'],
    },
  },
  {
    name: 'analyze_edc',
    description: 'Query aggregate Electronic Data Capture (EDC) data from the NexTrial database. Returns anonymized counts and summaries of enrolled patients, submitted CRF entries, adverse event flags, and trial progress metrics. Use for data quality checks, enrollment velocity, missing data detection, and protocol deviation signals. Individual patient records are never returned — only aggregate summaries.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Analysis query — e.g. "missing primary endpoint data", "adverse events without SAE narrative", "enrollment rate past 30 days", "CRF completion by site"' },
      },
      required: ['query'],
    },
    // cache_control on the last tool caches the entire tools prefix
    cache_control: { type: 'ephemeral' as const },
  },
];

const prisma = new PrismaClient();

// ── Helpers ───────────────────────────────────────────────────────────────────

function hashInput(text: string): string {
  return createHash('sha256').update(text).digest('hex').slice(0, 16);
}

async function writeAudit(opts: {
  userId: string;
  sessionId?: string;
  action: string;
  toolName?: string;
  queryHash?: string;
  status: 'ok' | 'error';
  durationMs?: number;
  meta?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.agentAuditLog.create({
      data: {
        userId: opts.userId,
        sessionId: opts.sessionId,
        action: opts.action,
        toolName: opts.toolName,
        queryHash: opts.queryHash,
        status: opts.status,
        durationMs: opts.durationMs,
        meta: opts.meta as any,
      },
    });
  } catch {
    // Audit write failures must never crash the agent run
  }
}

// ── LLM Provider abstraction ──────────────────────────────────────────────────

type LLMMessage = { role: 'system' | 'user' | 'assistant'; content: string };

async function callLLM(
  messages: LLMMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.PERPLEXITY_API_KEY;
  if (!apiKey) throw new Error('No LLM API key configured');

  if (process.env.ANTHROPIC_API_KEY) {
    // Claude path — tools + system prompt in cached prefix.
    // Cache prefix order: tools → system → messages (Anthropic spec).
    // Tool schemas (~1.5K tokens) + system prompt push the prefix over the 1024-token
    // minimum for Sonnet 4.6, so cache_control: ephemeral actually fires.
    // Cache TTL: 5 minutes (ephemeral). For 1-hour TTL, use prompt-caching-2024-07-31 + extended-cache beta.
    // tool_choice is omitted (default: auto) — planning/synthesis prompts instruct text-only output.
    // If Claude returns a tool_use block (shouldn't happen with correct prompts), we return '' and
    // the caller falls back to a default plan.

    const systemText = messages.find(m => m.role === 'system')?.content ?? '';
    const t0 = Date.now();

    const res = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-sonnet-4-6',
        max_tokens: opts?.maxTokens ?? 2000,
        tools: AGENT_TOOL_SCHEMAS,
        system: [
          {
            type: 'text',
            text: systemText,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: messages
          .filter(m => m.role !== 'system')
          .map(m => ({ role: m.role, content: m.content })),
      },
      {
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'prompt-caching-2024-07-31',
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const usage = res.data.usage ?? {};
    // TELEMETRY — validate caching is actually firing.
    // cacheReadTokens > 0 on repeated calls = cache working.
    // If cacheReadTokens stays 0 after 10+ calls, the prefix is below 1024 tokens — investigate.
    console.log(JSON.stringify({
      ts: new Date().toISOString(),
      event: 'llm_call',
      provider: 'anthropic',
      model: 'claude-sonnet-4-6',
      inputTokens: usage.input_tokens ?? 0,
      outputTokens: usage.output_tokens ?? 0,
      cacheReadTokens: usage.cache_read_input_tokens ?? 0,
      cacheCreatedTokens: usage.cache_creation_input_tokens ?? 0,
      durationMs: Date.now() - t0,
    }));

    // If Claude called a tool instead of returning text, fall back gracefully
    const firstBlock = res.data.content?.[0];
    if (firstBlock?.type === 'tool_use') return '';
    return firstBlock?.text ?? '';
  }

  // Perplexity path — prompt-based planning, no native tool calling
  const t0 = Date.now();
  const res = await axios.post(
    process.env.PERPLEXITY_API_URL ?? 'https://api.perplexity.ai/chat/completions',
    {
      model: 'sonar-pro',
      messages,
      max_tokens: opts?.maxTokens ?? 2000,
      temperature: opts?.temperature ?? 0.2,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );

  const pUsage = res.data.usage ?? {};
  console.log(JSON.stringify({
    ts: new Date().toISOString(),
    event: 'llm_call',
    provider: 'perplexity',
    model: 'sonar-pro',
    inputTokens: pUsage.prompt_tokens ?? 0,
    outputTokens: pUsage.completion_tokens ?? 0,
    durationMs: Date.now() - t0,
  }));

  return res.data.choices?.[0]?.message?.content ?? '';
}

// ── Tool registry ─────────────────────────────────────────────────────────────

export type AgentTab = 'research' | 'match' | 'regulatory' | 'edc' | 'analysis' | 'protocol';

export interface ToolResult {
  tool: string;
  status: 'ok' | 'error';
  count?: number;
  data?: unknown;
  error?: string;
}

export interface StreamEvent {
  type: 'plan' | 'tool_start' | 'tool_done' | 'synthesis_start' | 'synthesis_chunk' | 'artifact' | 'done' | 'error';
  payload: unknown;
}

async function searchClinicalTrials(query: string, filters: Record<string, string> = {}): Promise<ToolResult> {
  try {
    const params: Record<string, string> = {
      'query.term': query,
      pageSize: '20',
      format: 'json',
      fields: 'NCTId,BriefTitle,OverallStatus,Phase,Condition,InterventionName,EnrollmentCount,LeadSponsorName,StartDate,BriefSummary',
    };
    if (filters.status) params['filter.overallStatus'] = filters.status;
    if (filters.phase) params['filter.phase'] = filters.phase;
    const res = await axios.get('https://clinicaltrials.gov/api/v2/studies', { params, timeout: 15000 });
    const studies = res.data.studies ?? [];
    return { tool: 'search_clinical_trials', status: 'ok', count: studies.length, data: studies };
  } catch (e: any) {
    return { tool: 'search_clinical_trials', status: 'error', error: e.message };
  }
}

async function searchPubMed(query: string, maxResults = 10): Promise<ToolResult> {
  try {
    const searchRes = await axios.get('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi', {
      params: { db: 'pubmed', term: query, retmax: maxResults, retmode: 'json', sort: 'relevance' },
      timeout: 10000,
    });
    const ids: string[] = searchRes.data.esearchresult?.idlist ?? [];
    if (!ids.length) return { tool: 'search_pubmed', status: 'ok', count: 0, data: [] };

    const fetchRes = await axios.get('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi', {
      params: { db: 'pubmed', id: ids.join(','), retmode: 'json' },
      timeout: 10000,
    });
    const uids = fetchRes.data.result?.uids ?? [];
    const articles = uids.map((uid: string) => {
      const r = fetchRes.data.result[uid];
      return {
        pmid: uid,
        title: r?.title ?? '',
        authors: r?.authors?.map((a: any) => a.name).join(', ') ?? '',
        journal: r?.fulljournalname ?? '',
        year: r?.pubdate?.slice(0, 4) ?? '',
      };
    });
    return { tool: 'search_pubmed', status: 'ok', count: articles.length, data: articles };
  } catch (e: any) {
    return { tool: 'search_pubmed', status: 'error', error: e.message };
  }
}

async function searchWeb(query: string): Promise<ToolResult> {
  try {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) return { tool: 'search_web', status: 'error', error: 'No Perplexity key' };
    const res = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      { model: 'sonar-pro', messages: [{ role: 'user', content: query }], max_tokens: 1000 },
      { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, timeout: 20000 }
    );
    return { tool: 'search_web', status: 'ok', count: 1, data: { summary: res.data.choices?.[0]?.message?.content ?? '' } };
  } catch (e: any) {
    return { tool: 'search_web', status: 'error', error: e.message };
  }
}

// CTRI has no public JSON API — search is via Perplexity web with site targeting
// For production: replace with n8n nightly WHO ICTRP XML ingestion into Qdrant
async function searchCTRI(query: string): Promise<ToolResult> {
  return searchWeb(`site:ctri.nic.in OR CTRI clinical trials India: ${query}`);
}

async function parseEligibilityCriteria(nctId: string): Promise<ToolResult> {
  try {
    const res = await axios.get(`https://clinicaltrials.gov/api/v2/studies/${nctId}`, {
      params: { fields: 'EligibilityModule' },
      timeout: 10000,
    });
    const criteria = res.data.protocolSection?.eligibilityModule?.eligibilityCriteria ?? '';
    return { tool: 'parse_eligibility', status: 'ok', data: { nctId, criteria } };
  } catch (e: any) {
    return { tool: 'parse_eligibility', status: 'error', error: e.message };
  }
}

async function analyzeEdcData(query: string): Promise<ToolResult> {
  try {
    const [patients, entries] = await Promise.all([
      prisma.edcPatient.findMany({ include: { entries: true } }),
      prisma.edcEntry.findMany({ include: { form: true } }),
    ]);
    // Send only aggregate counts — never individual patient records — to LLM
    const safeSummary = sanitizeEdcSummary({ patientCount: patients.length, entryCount: entries.length, query });
    return { tool: 'analyze_edc', status: 'ok', data: { summary: safeSummary } };
  } catch (e: any) {
    return { tool: 'analyze_edc', status: 'error', error: e.message };
  }
}

async function executeTool(toolName: string, params: Record<string, string>): Promise<ToolResult> {
  switch (toolName) {
    case 'search_clinical_trials': return searchClinicalTrials(params.query ?? '', params);
    case 'search_pubmed': return searchPubMed(params.query ?? '', Number(params.max_results ?? 10));
    case 'search_web': return searchWeb(params.query ?? '');
    case 'search_ctri': return searchCTRI(params.query ?? '');
    case 'parse_eligibility': return parseEligibilityCriteria(params.nct_id ?? '');
    case 'analyze_edc': return analyzeEdcData(params.query ?? '');
    default: return { tool: toolName, status: 'error', error: `Unknown tool: ${toolName}` };
  }
}

// ── Tab configs ───────────────────────────────────────────────────────────────

interface TabConfig {
  system: string;
  tools: string[];
  planPrompt: (query: string) => string;
  // tabs that handle patient data must redact PII before LLM calls
  requiresPIIRedaction: boolean;
}

const TAB_CONFIGS: Record<AgentTab, TabConfig> = {
  research: {
    requiresPIIRedaction: false,
    system: `You are a clinical research intelligence agent for NexTrial, a platform for Indian physicians and principal investigators.
Your job is to autonomously research medical topics by searching multiple databases in parallel, then synthesize findings into a clear evidence brief with inline citations.
Always search at least PubMed and ClinicalTrials.gov. Add CTRI search for India-specific queries.
Write synthesis with bold section headings and bullet points. Include [1][2] style citation references.`,
    tools: ['search_pubmed', 'search_clinical_trials', 'search_ctri', 'search_web'],
    planPrompt: (q) => `The user wants to research: "${q}"
List the exact steps you will take as a JSON array. Each step: {"step": number, "tool": string, "query": string, "reason": string}
Available tools: search_pubmed, search_clinical_trials, search_ctri, search_web
Respond with ONLY the JSON array, no markdown.`,
  },
  match: {
    requiresPIIRedaction: true, // patient descriptions may contain PII
    system: `You are a patient-to-trial matching agent. Given a patient profile or description, find clinical trials they may qualify for.
Parse eligibility criteria carefully. Explain why each trial is or isn't a match. Flag any disqualifying criteria.
Note: patient identifiers have been redacted before reaching you — work with the clinical description only.`,
    tools: ['search_clinical_trials', 'parse_eligibility', 'search_ctri'],
    planPrompt: (q) => `The user wants to match a patient: "${q}"
List steps as JSON array. Tools: search_clinical_trials, parse_eligibility, search_ctri
Respond ONLY JSON.`,
  },
  regulatory: {
    requiresPIIRedaction: false,
    system: `You are a regulatory intelligence agent for Indian clinical trials. You know CDSCO, IEC, ICMR, CTRI, and DCGI requirements.
Help users understand regulatory pathways, draft submissions, and check compliance.
Always note: outputs are drafts for human regulatory review — not for direct submission.`,
    tools: ['search_web', 'search_clinical_trials'],
    planPrompt: (q) => `Regulatory query: "${q}"
List steps as JSON. Tools: search_web, search_clinical_trials. ONLY JSON.`,
  },
  protocol: {
    requiresPIIRedaction: false,
    system: `You are a protocol design agent trained on ICH M11, GCP, and Indian regulatory requirements.
Help draft and review clinical trial protocols. Check for ICH E6, E9, and CDSCO compliance.`,
    tools: ['search_pubmed', 'search_web'],
    planPrompt: (q) => `Protocol design request: "${q}"
List steps as JSON. Tools: search_pubmed, search_web. ONLY JSON.`,
  },
  edc: {
    requiresPIIRedaction: true, // EDC queries may reference patient-level context
    system: `You are an EDC data quality and safety monitoring agent.
Analyze submitted CRF data to detect deviations, missing entries, adverse event signals, and protocol violations.
You receive aggregate summaries only — individual patient records are never exposed to this system.`,
    tools: ['analyze_edc', 'search_web'],
    planPrompt: (q) => `EDC analysis request: "${q}"
List steps as JSON. Tools: analyze_edc, search_web. ONLY JSON.`,
  },
  analysis: {
    requiresPIIRedaction: false,
    system: `You are a clinical trial data analysis agent. Perform statistical and safety analysis on trial data.
Generate CONSORT-style progress reports and safety summaries.`,
    tools: ['analyze_edc', 'search_web', 'search_pubmed'],
    planPrompt: (q) => `Analysis request: "${q}"
List steps as JSON. Tools: analyze_edc, search_web, search_pubmed. ONLY JSON.`,
  },
};

// ── Plan parser ───────────────────────────────────────────────────────────────

interface PlannedStep { step: number; tool: string; query: string; reason: string; }

function parsePlan(raw: string): PlannedStep[] {
  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    const match = raw.match(/\[[\s\S]+\]/);
    if (match) {
      try { return JSON.parse(match[0]); } catch {}
    }
    return [];
  }
}

// ── Main orchestrator ─────────────────────────────────────────────────────────

export async function runAgent(opts: {
  sessionId: string;
  userId: string;
  tab: AgentTab;
  query: string;
  emit: (event: StreamEvent) => void;
}): Promise<void> {
  const { sessionId, userId, tab, query, emit } = opts;
  const config = TAB_CONFIGS[tab];

  // PII redaction for tabs that handle patient data.
  // match tab: generalizeAndRedact() — Layer 1 (structured PII) + Layer 2 (age bands, city tiers).
  //   Age + sex + condition + city is a quasi-identifier set; generalization is lossy by design.
  // edc tab: redact() only — EDC queries don't typically contain free-text patient profiles.
  const redactor = new PIIRedactor();
  const safeQuery = config.requiresPIIRedaction
    ? (tab === 'match' ? redactor.generalizeAndRedact(query) : redactor.redact(query))
    : query;

  if (redactor.hasRedactions()) {
    await writeAudit({
      userId, sessionId, action: 'PII_REDACTED',
      status: 'ok', meta: { count: redactor.redactionCount() },
    });
  }

  // 1. Persist user message (original, not redacted — stored locally never sent externally)
  await prisma.agentMessage.create({
    data: { sessionId, role: 'user', content: query },
  });

  try {
    // 2. Planning phase
    const t0 = Date.now();
    const planRaw = await callLLM([
      { role: 'system', content: config.system },
      { role: 'user', content: config.planPrompt(safeQuery) },
    ], { temperature: 0.1, maxTokens: 800 });

    await writeAudit({
      userId, sessionId, action: 'PLAN',
      queryHash: hashInput(safeQuery), status: 'ok',
      durationMs: Date.now() - t0,
    });

    const plan = parsePlan(planRaw);
    const effectivePlan: PlannedStep[] = plan.length > 0
      ? plan
      : [{ step: 1, tool: 'search_web', query: safeQuery, reason: 'General search' }];

    emit({ type: 'plan', payload: { steps: effectivePlan } });

    // 3. Execute tools sequentially, emit events per step
    const toolResults: ToolResult[] = [];

    for (const step of effectivePlan) {
      emit({ type: 'tool_start', payload: { step: step.step, tool: step.tool, query: step.query, reason: step.reason } });

      const ts = Date.now();
      const result = await executeTool(step.tool, { query: step.query, nct_id: step.query });
      toolResults.push(result);

      // Persist tool call (tool results are external data, not patient PII)
      await prisma.agentMessage.create({
        data: {
          sessionId,
          role: 'tool',
          content: JSON.stringify(result.data ?? result.error ?? ''),
          toolName: step.tool,
          toolInput: { query: step.query },
        },
      });

      await writeAudit({
        userId, sessionId, action: 'TOOL_CALL',
        toolName: step.tool,
        queryHash: hashInput(step.query),
        status: result.status,
        durationMs: Date.now() - ts,
        meta: { count: result.count ?? 0 },
      });

      emit({ type: 'tool_done', payload: { step: step.step, tool: step.tool, status: result.status, count: result.count ?? 0 } });
    }

    // 4. Synthesis
    emit({ type: 'synthesis_start', payload: {} });

    const resultsContext = toolResults
      .map(r => `[${r.tool}] ${r.status === 'ok' ? `Found ${r.count} results: ${JSON.stringify(r.data).slice(0, 3000)}` : `Error: ${r.error}`}`)
      .join('\n\n');

    const synthesisPrompt = `The user asked: "${safeQuery}"

Here is the data collected from multiple sources:
${resultsContext}

Write a comprehensive, well-structured research brief. Use:
- **Bold headings** for sections (TL;DR, Key Findings, Clinical Trials, Evidence Summary, Recommendations)
- Bullet points for details
- [1][2] style citation numbers where referencing specific trials or papers
- Actionable insights at the end

Be specific with data: NCT IDs, enrollment numbers, phases, publication years.`;

    const ts2 = Date.now();
    const synthesis = await callLLM([
      { role: 'system', content: config.system },
      { role: 'user', content: synthesisPrompt },
    ], { temperature: 0.3, maxTokens: 2500 });

    await writeAudit({
      userId, sessionId, action: 'SYNTHESIS',
      status: 'ok', durationMs: Date.now() - ts2,
      meta: { outputLen: synthesis.length },
    });

    // Stream synthesis in 8-word chunks for live feel
    const words = synthesis.split(' ');
    const chunkSize = 8;
    for (let i = 0; i < words.length; i += chunkSize) {
      emit({ type: 'synthesis_chunk', payload: { text: words.slice(i, i + chunkSize).join(' ') + ' ' } });
      await new Promise(r => setTimeout(r, 30));
    }

    // 5. Persist assistant response
    await prisma.agentMessage.create({
      data: { sessionId, role: 'assistant', content: synthesis },
    });

    // 6. Generate artifact
    const artifactContent = `# Research Brief: ${query}\n\n_Generated by NexTrial Agent · ${new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}_\n\n${synthesis}`;

    const artifact = await prisma.agentArtifact.create({
      data: { sessionId, name: `${query.slice(0, 50)}.md`, type: 'markdown', content: artifactContent },
    });

    await writeAudit({
      userId, sessionId, action: 'ARTIFACT',
      status: 'ok', meta: { artifactId: artifact.id, size: artifactContent.length },
    });

    emit({ type: 'artifact', payload: { id: artifact.id, name: artifact.name, type: artifact.type, size: artifactContent.length } });
    emit({ type: 'done', payload: { sessionId } });

  } catch (err: any) {
    await writeAudit({ userId, sessionId, action: 'ERROR', status: 'error', meta: { message: err.message } });
    emit({ type: 'error', payload: { message: err.message ?? 'Agent failed' } });
    throw err;
  }
}

// ── Session helpers ───────────────────────────────────────────────────────────

export async function createSession(userId: string, tab: AgentTab, title: string) {
  return prisma.agentSession.create({ data: { userId, tab, title } });
}

export async function getSessionHistory(sessionId: string) {
  return prisma.agentSession.findUnique({
    where: { id: sessionId },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
      artifacts: { orderBy: { createdAt: 'asc' } },
    },
  });
}

export async function getUserSessions(userId: string, tab?: AgentTab) {
  return prisma.agentSession.findMany({
    where: { userId, ...(tab ? { tab } : {}) },
    orderBy: { updatedAt: 'desc' },
    take: 50,
    include: {
      _count: { select: { messages: true } },
      artifacts: { take: 1, orderBy: { createdAt: 'desc' } },
    },
  });
}

export async function getArtifact(artifactId: string) {
  return prisma.agentArtifact.findUnique({ where: { id: artifactId } });
}
