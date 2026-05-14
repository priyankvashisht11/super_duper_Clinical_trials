import { Request, Response } from 'express';
import axios from 'axios';

// ── Types ─────────────────────────────────────────────────────────────────────

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

interface RawTrial {
  nctId: string;
  title: string;
  status: string;
  phase: string;
  condition: string;
  intervention: string;
  enrollment: number;
  sponsor: string;
  startDate: string | null;
  description: string;
  source: string;
}

interface MatchResult extends RawTrial {
  confidenceScore: number;
  confidenceLabel: 'excellent' | 'good' | 'possible' | 'low';
  languages: string[];
  geographicNote: string;
  url: string;
}

// ── India location → language mapping ────────────────────────────────────────

const LOCATION_LANGUAGES: Record<string, string[]> = {
  // Cities
  mumbai: ['Marathi', 'Hindi', 'English'],
  delhi: ['Hindi', 'English', 'Punjabi'],
  'new delhi': ['Hindi', 'English', 'Punjabi'],
  bengaluru: ['Kannada', 'English'],
  bangalore: ['Kannada', 'English'],
  chennai: ['Tamil', 'English'],
  hyderabad: ['Telugu', 'Urdu', 'English'],
  kolkata: ['Bengali', 'Hindi', 'English'],
  pune: ['Marathi', 'Hindi', 'English'],
  ahmedabad: ['Gujarati', 'Hindi'],
  jaipur: ['Hindi', 'Rajasthani'],
  lucknow: ['Hindi', 'Urdu'],
  kochi: ['Malayalam', 'English'],
  coimbatore: ['Tamil', 'English'],
  nagpur: ['Marathi', 'Hindi'],
  bhopal: ['Hindi'],
  patna: ['Hindi', 'Maithili'],
  chandigarh: ['Punjabi', 'Hindi'],
  surat: ['Gujarati', 'Hindi'],
  indore: ['Hindi'],
  vadodara: ['Gujarati', 'Hindi'],
  // States
  karnataka: ['Kannada', 'English'],
  'tamil nadu': ['Tamil', 'English'],
  maharashtra: ['Marathi', 'Hindi', 'English'],
  gujarat: ['Gujarati', 'Hindi'],
  kerala: ['Malayalam', 'English'],
  'west bengal': ['Bengali', 'Hindi'],
  'uttar pradesh': ['Hindi', 'Urdu'],
  rajasthan: ['Hindi'],
  'andhra pradesh': ['Telugu', 'English'],
  telangana: ['Telugu', 'Urdu', 'English'],
  punjab: ['Punjabi', 'Hindi'],
  haryana: ['Hindi'],
  bihar: ['Hindi', 'Maithili'],
  odisha: ['Odia', 'Hindi'],
  assam: ['Assamese', 'Bengali', 'English'],
  goa: ['Konkani', 'English', 'Marathi'],
};

function resolveLanguages(location: string | null): string[] {
  if (!location) return ['Hindi', 'English'];
  const lower = location.toLowerCase();
  for (const [key, langs] of Object.entries(LOCATION_LANGUAGES)) {
    if (lower.includes(key)) return langs;
  }
  return ['Hindi', 'English'];
}

// ── Scoring ───────────────────────────────────────────────────────────────────

function computeScore(trial: RawTrial, profile: PatientProfile): number {
  let score = 25;

  const conditionLower = trial.condition.toLowerCase();
  const titleLower = trial.title.toLowerCase();
  const descLower = trial.description.toLowerCase();
  const profileTerms = profile.condition
    .toLowerCase()
    .split(/[\s,]+/)
    .filter(t => t.length > 3);

  let termHits = 0;
  for (const term of profileTerms) {
    if (conditionLower.includes(term)) termHits += 2;
    else if (titleLower.includes(term)) termHits += 1;
    else if (descLower.includes(term)) termHits += 0.5;
  }
  score += Math.min(40, Math.round(termHits * 10));

  const status = trial.status.toUpperCase();
  if (status === 'RECRUITING') score += 20;
  else if (status === 'ACTIVE_NOT_RECRUITING') score += 8;

  const phase = trial.phase.toLowerCase();
  if (phase.includes('phase3') || phase.includes('phase 3') || phase.includes('iii')) score += 8;
  else if (phase.includes('phase2') || phase.includes('phase 2') || phase.includes('ii')) score += 6;
  else if (phase.includes('phase1') || phase.includes('phase 1') || phase.includes(' i')) score += 3;

  return Math.min(99, score);
}

function scoreLabel(score: number): 'excellent' | 'good' | 'possible' | 'low' {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'possible';
  return 'low';
}

// ── Profile extraction ────────────────────────────────────────────────────────

async function extractProfile(description: string): Promise<PatientProfile> {
  const apiKey = process.env.PERPLEXITY_API_KEY;

  const fallback: PatientProfile = {
    condition: description.slice(0, 80),
    age: null,
    gender: null,
    location: null,
    city: null,
    state: null,
    keyFindings: [],
    searchQuery: description.slice(0, 120),
  };

  if (!apiKey) return fallback;

  const system = `You are a clinical NLP extractor. Extract a structured patient profile from a clinical description.
Return ONLY a valid JSON object — no markdown, no code fences, no explanation. Just the raw JSON.

Schema:
{
  "condition": "string — primary diagnosis, be specific",
  "age": number or null,
  "gender": "Male" | "Female" | null,
  "location": "string — full location e.g. Bengaluru, Karnataka" or null,
  "city": "string" or null,
  "state": "string — Indian state" or null,
  "keyFindings": ["array", "of", "key clinical findings, labs, medications"],
  "searchQuery": "string — optimized ClinicalTrials.gov search query for this patient"
}`;

  try {
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'sonar',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: description },
        ],
        max_tokens: 350,
        temperature: 0.1,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    const raw: string = response.data?.choices?.[0]?.message?.content ?? '';
    const cleaned = raw
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    const parsed = JSON.parse(cleaned) as Record<string, unknown>;

    return {
      condition:    typeof parsed.condition    === 'string'  ? parsed.condition    : fallback.condition,
      age:          typeof parsed.age          === 'number'  ? parsed.age          : null,
      gender:       typeof parsed.gender       === 'string'  ? parsed.gender       : null,
      location:     typeof parsed.location     === 'string'  ? parsed.location     : null,
      city:         typeof parsed.city         === 'string'  ? parsed.city         : null,
      state:        typeof parsed.state        === 'string'  ? parsed.state        : null,
      keyFindings:  Array.isArray(parsed.keyFindings)        ? (parsed.keyFindings as unknown[]).filter((x): x is string => typeof x === 'string') : [],
      searchQuery:  typeof parsed.searchQuery  === 'string'  ? parsed.searchQuery  : fallback.searchQuery,
    };
  } catch {
    return fallback;
  }
}

// ── ClinicalTrials.gov search ─────────────────────────────────────────────────

async function searchTrials(query: string): Promise<RawTrial[]> {
  try {
    const response = await axios.get('https://clinicaltrials.gov/api/v2/studies', {
      params: {
        'query.term': `${query} India`,
        'filter.overallStatus': 'RECRUITING',
        pageSize: '60',
        format: 'json',
        fields: 'NCTId,BriefTitle,OfficialTitle,OverallStatus,Phase,Condition,InterventionName,EnrollmentCount,LeadSponsorName,StartDate,BriefSummary',
      },
      timeout: 15000,
    });

    const studies: unknown[] = response.data?.studies ?? [];

    const results: RawTrial[] = [];
    for (const study of studies) {
      const s = study as Record<string, unknown>;
      const proto = s.protocolSection as Record<string, unknown> | undefined;
      if (!proto) continue;

      const id   = (proto.identificationModule           ?? {}) as Record<string, unknown>;
      const st   = (proto.statusModule                   ?? {}) as Record<string, unknown>;
      const des  = (proto.designModule                   ?? {}) as Record<string, unknown>;
      const cond = (proto.conditionsModule               ?? {}) as Record<string, unknown>;
      const inter= (proto.armsInterventionsModule        ?? {}) as Record<string, unknown>;
      const spon = (proto.sponsorCollaboratorsModule     ?? {}) as Record<string, unknown>;
      const desc = (proto.descriptionModule              ?? {}) as Record<string, unknown>;

      const phases     = Array.isArray(des.phases) ? des.phases : [];
      const conditions = Array.isArray(cond.conditions) ? cond.conditions : [];
      const interventions = Array.isArray(inter.interventions) ? inter.interventions : [];
      const enrollInfo = (des.enrollmentInfo ?? {}) as Record<string, unknown>;
      const startDate  = (st.startDateStruct ?? {}) as Record<string, unknown>;
      const leadSponsor= (spon.leadSponsor   ?? {}) as Record<string, unknown>;

      results.push({
        nctId:       String(id.nctId       ?? 'N/A'),
        title:       String(id.briefTitle  ?? id.officialTitle ?? 'No title'),
        status:      String(st.overallStatus ?? 'Unknown'),
        phase:       String(phases[0]      ?? 'N/A'),
        condition:   String(conditions[0]  ?? 'Not specified'),
        intervention:String((interventions[0] as Record<string,unknown>)?.name ?? 'Not specified'),
        enrollment:  typeof enrollInfo.count === 'number' ? enrollInfo.count : 0,
        sponsor:     String(leadSponsor.name ?? 'Not specified'),
        startDate:   typeof startDate.date === 'string' ? startDate.date : null,
        description: String(desc.briefSummary ?? ''),
        source:      'ClinicalTrials.gov',
      });
    }

    // Also try without India restriction if we got < 5 results
    if (results.length < 5) {
      const fallbackResp = await axios.get('https://clinicaltrials.gov/api/v2/studies', {
        params: {
          'query.term': query,
          'filter.overallStatus': 'RECRUITING',
          pageSize: '40',
          format: 'json',
          fields: 'NCTId,BriefTitle,OfficialTitle,OverallStatus,Phase,Condition,InterventionName,EnrollmentCount,LeadSponsorName,StartDate,BriefSummary',
        },
        timeout: 15000,
      });

      const fallbackStudies: unknown[] = fallbackResp.data?.studies ?? [];
      for (const study of fallbackStudies) {
        const s = study as Record<string, unknown>;
        const proto = s.protocolSection as Record<string, unknown> | undefined;
        if (!proto) continue;

        const id   = (proto.identificationModule        ?? {}) as Record<string, unknown>;
        const st   = (proto.statusModule                ?? {}) as Record<string, unknown>;
        const des  = (proto.designModule                ?? {}) as Record<string, unknown>;
        const cond = (proto.conditionsModule            ?? {}) as Record<string, unknown>;
        const inter= (proto.armsInterventionsModule     ?? {}) as Record<string, unknown>;
        const spon = (proto.sponsorCollaboratorsModule  ?? {}) as Record<string, unknown>;
        const desc = (proto.descriptionModule           ?? {}) as Record<string, unknown>;

        const phases      = Array.isArray(des.phases)            ? des.phases      : [];
        const conditions  = Array.isArray(cond.conditions)       ? cond.conditions : [];
        const interventions = Array.isArray(inter.interventions) ? inter.interventions : [];
        const enrollInfo  = (des.enrollmentInfo ?? {}) as Record<string, unknown>;
        const startDate   = (st.startDateStruct ?? {}) as Record<string, unknown>;
        const leadSponsor = (spon.leadSponsor   ?? {}) as Record<string, unknown>;

        const nctId = String(id.nctId ?? 'N/A');
        if (results.some(r => r.nctId === nctId)) continue;

        results.push({
          nctId,
          title:        String(id.briefTitle ?? id.officialTitle ?? 'No title'),
          status:       String(st.overallStatus ?? 'Unknown'),
          phase:        String(phases[0] ?? 'N/A'),
          condition:    String(conditions[0] ?? 'Not specified'),
          intervention: String((interventions[0] as Record<string,unknown>)?.name ?? 'Not specified'),
          enrollment:   typeof enrollInfo.count === 'number' ? enrollInfo.count : 0,
          sponsor:      String(leadSponsor.name ?? 'Not specified'),
          startDate:    typeof startDate.date === 'string' ? startDate.date : null,
          description:  String(desc.briefSummary ?? ''),
          source:       'ClinicalTrials.gov',
        });
      }
    }

    return results;
  } catch (error) {
    const err = error as { message?: string };
    console.error('ClinicalTrials.gov search error:', err.message);
    return [];
  }
}

// ── Controller ────────────────────────────────────────────────────────────────

export const matchController = {
  matchPatient: async (req: Request, res: Response): Promise<void> => {
    try {
      const { patientDescription } = req.body as { patientDescription?: unknown };

      if (typeof patientDescription !== 'string' || patientDescription.trim().length < 10) {
        res.status(400).json({ success: false, error: 'patientDescription must be at least 10 characters' });
        return;
      }

      const description = patientDescription.trim();

      // 1. Extract structured profile
      const profile = await extractProfile(description);

      // 2. Search ClinicalTrials.gov
      const rawTrials = await searchTrials(profile.searchQuery);

      // 3. Score, enrich, sort, cap
      const languages = resolveLanguages(profile.location ?? profile.city ?? profile.state);

      const matches: MatchResult[] = rawTrials
        .map(trial => ({
          ...trial,
          confidenceScore: computeScore(trial, profile),
          confidenceLabel: scoreLabel(computeScore(trial, profile)),
          languages,
          geographicNote: profile.city
            ? `Patient in ${profile.city} — verify site proximity`
            : 'Verify site locations for patient proximity',
          url: `https://clinicaltrials.gov/study/${trial.nctId}`,
        }))
        .sort((a, b) => b.confidenceScore - a.confidenceScore)
        .slice(0, 12);

      res.json({ success: true, data: { profile, matches } });
    } catch (error) {
      const err = error as { message?: string };
      console.error('Patient match error:', err.message);
      res.status(500).json({ success: false, error: err.message ?? 'Matching failed' });
    }
  },
};
