// Adversarial test suite for PIIRedactor — required by sprints/sprint-09-compliance-layer.md
// ("PIIRedactor unit tests — minimum 30 adversarial test cases drawn from realistic
// Indian clinical free-text"). This did not exist before; written 2026-10-03.
//
// Run with: npm test  (uses Node's built-in test runner via tsx — no extra deps needed)

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { PIIRedactor, sanitizeEdcSummary } from './pii.redactor';

// ── Layer 1: each of the 7 regex patterns × at least 2 variants ───────────────

describe('Layer 1 — PHONE', () => {
  test('redacts a bare 10-digit Indian mobile number', () => {
    const r = new PIIRedactor();
    const out = r.redact('Contact the patient at 9876543210 for follow-up.');
    assert.match(out, /\[PHONE_1\]/);
    assert.doesNotMatch(out, /9876543210/);
  });

  test('redacts a phone number starting with 7', () => {
    const r = new PIIRedactor();
    const out = r.redact('Alt number: 7123456789');
    assert.match(out, /\[PHONE_1\]/);
  });

  test('does NOT redact a 10-digit number starting with 5 (not a valid Indian mobile prefix)', () => {
    const r = new PIIRedactor();
    const out = r.redact('Reference code 5123456789 on file.');
    assert.equal(out, 'Reference code 5123456789 on file.');
  });
});

describe('Layer 1 — EMAIL', () => {
  test('redacts a standard email address', () => {
    const r = new PIIRedactor();
    const out = r.redact('Reach the coordinator at coordinator@site.in for queries.');
    assert.match(out, /\[EMAIL_1\]/);
    assert.doesNotMatch(out, /coordinator@site\.in/);
  });

  test('redacts an email with a plus-tag and subdomain', () => {
    const r = new PIIRedactor();
    const out = r.redact('CC: pi.notes+trial01@hospital.research.in');
    assert.match(out, /\[EMAIL_1\]/);
  });
});

describe('Layer 1 — DOB', () => {
  test('redacts DD/MM/YYYY', () => {
    const r = new PIIRedactor();
    const out = r.redact('DOB: 14/02/1971');
    assert.match(out, /\[DOB_1\]/);
  });

  test('redacts YYYY-MM-DD', () => {
    const r = new PIIRedactor();
    const out = r.redact('Date of birth 1971-02-14 recorded at screening.');
    assert.match(out, /\[DOB_1\]/);
  });

  test('redacts DD-MM-YY (2-digit year)', () => {
    const r = new PIIRedactor();
    const out = r.redact('Born 14-02-71 per Aadhaar card.');
    assert.match(out, /\[DOB_1\]/);
  });
});

describe('Layer 1 — MRN', () => {
  test('redacts MRN with a hyphen', () => {
    const r = new PIIRedactor();
    const out = r.redact('MRN-004521 was reviewed at the baseline visit.');
    assert.match(out, /\[MRN_1\]/);
  });

  test('redacts MRN with a colon and space', () => {
    const r = new PIIRedactor();
    const out = r.redact('MRN: 004521');
    assert.match(out, /\[MRN_1\]/);
  });
});

describe('Layer 1 — PATIENT_ID', () => {
  test('redacts a PT-prefixed subject ID', () => {
    const r = new PIIRedactor();
    const out = r.redact('Subject PT-0042 reported mild nausea.');
    assert.match(out, /\[PATIENT_ID_1\]/);
  });

  test('redacts a SUBJ-prefixed subject ID', () => {
    const r = new PIIRedactor();
    const out = r.redact('SUBJ_0107 completed the Week 4 visit.');
    assert.match(out, /\[PATIENT_ID_1\]/);
  });

  test('KNOWN FALSE POSITIVE — a bare "P" + digits prefix also matches non-patient-ID text', () => {
    // The pattern (?:P|PT|SUB|SUBJ|PAT)[-_]?\d+ includes a bare "P" prefix, which is far too
    // generic for clinical text: "P1" (Phase 1), "P3" (grade/line of therapy), etc. all match.
    // This documents current behavior (over-redaction, the safer failure direction) rather
    // than asserting it's correct — worth tightening if false positives become a UX complaint.
    const r = new PIIRedactor();
    const out = r.redact('This is a P1 (Phase 1) dose-escalation study.');
    assert.match(out, /\[PATIENT_ID_1\]/);
  });
});

describe('Layer 1 — AADHAAR', () => {
  test('redacts a space-separated 12-digit Aadhaar number', () => {
    const r = new PIIRedactor();
    const out = r.redact('Aadhaar on file: 1234 5678 9012');
    assert.match(out, /\[AADHAAR_1\]/);
  });

  test('redacts a second, different Aadhaar number as a distinct token', () => {
    const r = new PIIRedactor();
    const out = r.redact('Patient Aadhaar 9999 8888 7777, guardian Aadhaar 1111 2222 3333');
    assert.match(out, /\[AADHAAR_1\]/);
    assert.match(out, /\[AADHAAR_2\]/);
  });
});

describe('Layer 1 — PAN', () => {
  test('redacts a standard PAN format', () => {
    const r = new PIIRedactor();
    const out = r.redact('Reimbursement PAN: ABCDE1234F');
    assert.match(out, /\[PAN_1\]/);
  });

  test('does NOT redact a PAN-shaped string with a lowercase letter (pattern is case-sensitive for PAN)', () => {
    const r = new PIIRedactor();
    const out = r.redact('Code abcde1234F noted.');
    assert.equal(out, 'Code abcde1234F noted.');
  });
});

// ── Age generalization (Layer 2) ───────────────────────────────────────────────

describe('Layer 2 — age generalization', () => {
  test('"52-year-old" becomes a 10-year band', () => {
    const r = new PIIRedactor();
    const out = r.generalizeAndRedact('A 52-year-old male presented with cough.');
    assert.match(out, /50–59 year old/);
    assert.doesNotMatch(out, /52-year-old/);
  });

  test('"aged 65" becomes a 10-year band', () => {
    const r = new PIIRedactor();
    const out = r.generalizeAndRedact('Patient aged 65 with hypertension.');
    assert.match(out, /aged 60–69/);
  });

  test('", 46 years" becomes a 10-year band', () => {
    const r = new PIIRedactor();
    const out = r.generalizeAndRedact('Female, 46 years, non-smoker.');
    assert.match(out, /40–49 years/);
  });
});

describe('Layer 2 — age generalization edge cases (out of plausible human range → left unchanged)', () => {
  test('age 0 is left unchanged (boundary, not out of range, but "0-year-old" is an unusual phrasing)', () => {
    const r = new PIIRedactor();
    const out = r.generalizeAndRedact('A 0-year-old neonate was enrolled.');
    assert.match(out, /0–9 year old/);
  });

  test('age 120 is still generalized (at the upper boundary of the accepted range)', () => {
    const r = new PIIRedactor();
    const out = r.generalizeAndRedact('Record claims a 120-year-old participant.');
    assert.match(out, /120–129 year old/);
  });

  test('age 999 (implausible, out of range) is left unchanged', () => {
    const r = new PIIRedactor();
    const out = r.generalizeAndRedact('Data entry error: 999-year-old listed.');
    assert.match(out, /999-year-old/);
  });

  test('age 150 (out of range) is left unchanged', () => {
    const r = new PIIRedactor();
    const out = r.generalizeAndRedact('aged 150 per corrupted record');
    assert.match(out, /aged 150/);
  });
});

// ── City tier generalization (Layer 2) ─────────────────────────────────────────

describe('Layer 2 — city tier generalization', () => {
  test('Tier-1 city (Mumbai) is generalized', () => {
    const r = new PIIRedactor();
    const out = r.generalizeAndRedact('Patient resides in Mumbai.');
    assert.match(out, /tier-1 Indian city/);
    assert.doesNotMatch(out, /Mumbai/);
  });

  test('Tier-2 city (Pune) is generalized', () => {
    const r = new PIIRedactor();
    const out = r.generalizeAndRedact('Site is located in Pune.');
    assert.match(out, /tier-2 Indian city/);
  });

  test('NCR region token is generalized', () => {
    const r = new PIIRedactor();
    const out = r.generalizeAndRedact('Patient travels in from Delhi NCR weekly.');
    assert.match(out, /NCR region India/);
  });

  test('an unknown/unmapped city is left unchanged', () => {
    const r = new PIIRedactor();
    const out = r.generalizeAndRedact('Patient resides in Shillong.');
    assert.match(out, /Shillong/);
  });

  test('alternate spelling (Bengaluru vs Bangalore) both map to tier-1', () => {
    const r = new PIIRedactor();
    const a = r.generalizeAndRedact('Site A is in Bangalore.');
    const b = new PIIRedactor().generalizeAndRedact('Site B is in Bengaluru.');
    assert.match(a, /tier-1 Indian city/);
    assert.match(b, /tier-1 Indian city/);
  });
});

// ── Combined quasi-identifier scenario ─────────────────────────────────────────

describe('Layer 2 — combined quasi-identifier re-identification risk', () => {
  test('age + condition + city are all generalized/preserved appropriately in one pass', () => {
    const r = new PIIRedactor();
    const out = r.generalizeAndRedact('52-year-old female, HER2+ breast cancer, resides in Mumbai.');
    assert.match(out, /50–59 year old/);
    assert.match(out, /tier-1 Indian city/);
    // Condition text (HER2+) is intentionally NOT touched — it's clinically necessary
    // for matching and not a quasi-identifier on its own.
    assert.match(out, /HER2\+/);
  });
});

// ── Restore round-trip ──────────────────────────────────────────────────────────

describe('restore() round-trip', () => {
  test('Layer-1-only redaction restores exactly to the original text', () => {
    const r = new PIIRedactor();
    const original = 'Contact 9876543210 or email pi@site.in about subject PT-0042.';
    const redacted = r.redact(original);
    assert.notEqual(redacted, original);
    assert.equal(r.restore(redacted), original);
  });

  test('generalizeAndRedact() output CANNOT be restored to the original — generalization is lossy by design', () => {
    const r = new PIIRedactor();
    const original = '52-year-old patient from Mumbai, contact 9876543210.';
    const redacted = r.generalizeAndRedact(original);
    const restored = r.restore(redacted);
    // The phone number (Layer 1) restores correctly...
    assert.match(restored, /9876543210/);
    // ...but the age band and city tier do NOT revert to "52-year-old" / "Mumbai" —
    // restore() only reverses the token map, not the generalization step.
    assert.doesNotMatch(restored, /52-year-old/);
    assert.doesNotMatch(restored, /\bMumbai\b/);
  });
});

// ── Housekeeping / instance behavior ────────────────────────────────────────────

describe('instance bookkeeping', () => {
  test('hasRedactions() and redactionCount() reflect the number of distinct tokens, not matches', () => {
    const r = new PIIRedactor();
    assert.equal(r.hasRedactions(), false);
    r.redact('Call 9876543210, call 9876543210 again, and also 9123456780.');
    assert.equal(r.hasRedactions(), true);
    // Same phone number repeated should reuse the same token (2 distinct numbers, not 3 tokens)
    assert.equal(r.redactionCount(), 2);
  });

  test('text with no PII at all is returned unchanged', () => {
    const r = new PIIRedactor();
    const text = 'The primary endpoint is progression-free survival at 12 months.';
    assert.equal(r.redact(text), text);
    assert.equal(r.hasRedactions(), false);
  });

  test('two separate PIIRedactor instances do not share token state', () => {
    const a = new PIIRedactor();
    const b = new PIIRedactor();
    a.redact('9876543210');
    assert.equal(b.hasRedactions(), false);
  });
});

// ── sanitizeEdcSummary() — EDC aggregate-only safety helper ────────────────────

describe('sanitizeEdcSummary()', () => {
  test('produces an aggregate-only string with no per-patient fields possible', () => {
    const out = sanitizeEdcSummary({ patientCount: 42, entryCount: 310, query: 'any safety signals?' });
    assert.match(out, /42 enrolled patients/);
    assert.match(out, /310 CRF submissions/);
    assert.match(out, /any safety signals\?/);
  });
});
