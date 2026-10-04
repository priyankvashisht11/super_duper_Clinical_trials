// PIIRedactor — tokenize patient-identifiable data before it leaves the server.
// Required for DPDP Act 2023 §16 compliance when sending data to US-based LLM APIs.
//
// LIFECYCLE — CRITICAL:
//   Always instantiate with `new PIIRedactor()` inside the request handler, never as a singleton.
//   The internal token map is ephemeral and must never be persisted, logged, or cached.
//   In agent.orchestrator.ts, PIIRedactor is created inside runAgent() — one instance per
//   request, discarded when runAgent() returns. This is correct and intentional.
//
// COVERAGE:
//   Layer 1 — Structured PII (regex): phone, email, DOB, MRN, patient IDs, Aadhaar, PAN
//   Layer 2 — Quasi-identifiers (generalization): age bands, city tiers
//             Age + sex + condition + city is a textbook re-identification set.
//             Sweeney (2002): ZIP + DOB + sex re-identifies 87% of Americans.
//             Indian clinical context has smaller per-condition per-city populations — higher risk.
//   NOT COVERED (Sprint 9 work): NER-based name detection, condition combination pseudonymization

// ── Layer 1: Structured PII ───────────────────────────────────────────────────

const PII_PATTERNS: Array<{ re: RegExp; label: string }> = [
  { re: /\b[6-9]\d{9}\b/g, label: 'PHONE' },
  { re: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, label: 'EMAIL' },
  // DOB dates: DD/MM/YYYY, YYYY-MM-DD, DD-MM-YY
  // First group allows up to 4 digits (not just 2) — otherwise YYYY-MM-DD never matches
  // ("1971" needs 4 digits but the old {1,2} cap meant the leading \b + \d{1,2} + separator
  // sequence could never align, so every YYYY-MM-DD date silently passed through unredacted).
  { re: /\b\d{1,4}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g, label: 'DOB' },
  // `*` not `?` on the separator class — "MRN: 004521" has TWO separator chars (":" then " "),
  // and the old `?` (zero-or-one) only ever consumed one, leaving \w+ to fail against the
  // remaining space. That silently let colon-plus-space MRNs (a common real format) through.
  { re: /\bMRN[-:\s]*\w+\b/gi, label: 'MRN' },
  // Standard clinical trial subject ID prefixes
  { re: /\b(?:P|PT|SUB|SUBJ|PAT)[-_]?\d+\b/gi, label: 'PATIENT_ID' },
  // Aadhaar: XXXX XXXX XXXX
  { re: /\b\d{4}\s\d{4}\s\d{4}\b/g, label: 'AADHAAR' },
  // Indian PAN: AAAAA9999A
  { re: /\b[A-Z]{5}\d{4}[A-Z]\b/g, label: 'PAN' },
];

// ── Layer 2: Quasi-identifier generalization ──────────────────────────────────

const CITY_TIER: Record<string, string> = {
  // Tier 1
  Mumbai: 'tier-1 Indian city', Delhi: 'tier-1 Indian city',
  Bangalore: 'tier-1 Indian city', Bengaluru: 'tier-1 Indian city',
  Chennai: 'tier-1 Indian city', Kolkata: 'tier-1 Indian city',
  Hyderabad: 'tier-1 Indian city',
  // Tier 2
  Pune: 'tier-2 Indian city', Ahmedabad: 'tier-2 Indian city',
  Jaipur: 'tier-2 Indian city', Surat: 'tier-2 Indian city',
  Lucknow: 'tier-2 Indian city', Kanpur: 'tier-2 Indian city',
  Nagpur: 'tier-2 Indian city', Visakhapatnam: 'tier-2 Indian city',
  Indore: 'tier-2 Indian city', Bhopal: 'tier-2 Indian city',
  Patna: 'tier-2 Indian city', Vadodara: 'tier-2 Indian city',
  Ludhiana: 'tier-2 Indian city', Agra: 'tier-2 Indian city',
  Nashik: 'tier-2 Indian city', Ranchi: 'tier-2 Indian city',
  Faridabad: 'tier-2 Indian city', Coimbatore: 'tier-2 Indian city',
  Meerut: 'tier-2 Indian city', Kochi: 'tier-2 Indian city',
  Ghaziabad: 'tier-2 Indian city',
  // Regions
  'Delhi NCR': 'NCR region India', NCR: 'NCR region India',
};

function generalizeAge(text: string): string {
  let out = text;
  // "52-year-old" / "52 year old"
  out = out.replace(/\b(\d{1,3})\s*[-]?\s*year[\s-]old\b/gi, (_, age) => {
    const n = parseInt(age, 10);
    if (isNaN(n) || n < 0 || n > 120) return _;
    const lo = Math.floor(n / 10) * 10;
    return `${lo}–${lo + 9} year old`;
  });
  // "aged 65" / "age 65"
  out = out.replace(/\bage[d]?\s+(\d{1,3})\b/gi, (_, age) => {
    const n = parseInt(age, 10);
    if (isNaN(n) || n < 0 || n > 120) return _;
    const lo = Math.floor(n / 10) * 10;
    return `aged ${lo}–${lo + 9}`;
  });
  // ", 65 years" / ", 65-year"
  out = out.replace(/,\s*(\d{1,3})\s*years?\b/gi, (_, age) => {
    const n = parseInt(age, 10);
    if (isNaN(n) || n < 0 || n > 120) return _;
    const lo = Math.floor(n / 10) * 10;
    return `, ${lo}–${lo + 9} years`;
  });
  return out;
}

function generalizeCities(text: string): string {
  let out = text;
  for (const [city, tier] of Object.entries(CITY_TIER)) {
    const escaped = city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`\\b${escaped}\\b`, 'gi');
    out = out.replace(re, tier);
  }
  return out;
}

// ── PIIRedactor class ─────────────────────────────────────────────────────────

export class PIIRedactor {
  private n = 0;
  // Ephemeral token map — created per-request, never persisted
  private fwd = new Map<string, string>();

  // Layer 1 only — for tabs where free-text patient profiles are not expected
  redact(text: string): string {
    let out = text;
    for (const { re, label } of PII_PATTERNS) {
      re.lastIndex = 0;
      out = out.replace(re, (match) => {
        const existing = [...this.fwd.entries()].find(([, v]) => v === match);
        if (existing) return existing[0];
        const token = `[${label}_${++this.n}]`;
        this.fwd.set(token, match);
        return token;
      });
    }
    return out;
  }

  // Layer 1 + Layer 2 — for match tab where user pastes patient descriptions.
  // Generalization is lossy by design: ages become bands, cities become tiers.
  // restore() cannot undo generalization (and should not — the point is the LLM never sees the original).
  generalizeAndRedact(text: string): string {
    let out = generalizeAge(text);
    out = generalizeCities(out);
    return this.redact(out);
  }

  // Restore structured PII tokens (Layer 1 only) for display — generalized fields stay generalized
  restore(text: string): string {
    let out = text;
    for (const [tok, orig] of this.fwd.entries()) {
      out = out.split(tok).join(orig);
    }
    return out;
  }

  hasRedactions(): boolean {
    return this.fwd.size > 0;
  }

  redactionCount(): number {
    return this.fwd.size;
  }
}

// ── EDC safety helper ─────────────────────────────────────────────────────────

// Produce a safe aggregate summary of EDC data — never send individual patient records to LLM
export function sanitizeEdcSummary(data: { patientCount: number; entryCount: number; query: string }): string {
  return `Aggregate trial EDC data: ${data.patientCount} enrolled patients, ${data.entryCount} CRF submissions total. Analysis query: ${data.query}`;
}
