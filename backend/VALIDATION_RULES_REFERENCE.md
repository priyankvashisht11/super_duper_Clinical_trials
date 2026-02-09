# Validation Rules Reference

## Quick Reference Guide for Protocol Validation

---

## M11 CONFORMANCE RULES

### M11-001: Required Protocol Identifiers
**Category**: M11 Conformance  
**Severity**: ERROR  
**Blocking**: YES  
**Section**: 0 (Protocol Header)

**Checks**:
- Sponsor Protocol Identifier must be present
- Full Title must be present

**Suggestions**:
- Add unique protocol identifier (e.g., ABC-2024-001)
- Provide descriptive title including phase, intervention, and indication

---

### M11-002: Amendment Requirements
**Category**: M11 Conformance  
**Severity**: ERROR  
**Blocking**: YES  
**Section**: 0 (Protocol Header)

**Checks**:
- If `originalProtocolIndicator = false`, then:
  - Amendment number must be specified
  - Amendment scope must be specified (Global/Regional/National/Site-Specific)

**Suggestions**:
- Specify amendment number (e.g., Amendment 1)
- Select appropriate amendment scope

---

### M11-003: Objectives & Estimands
**Category**: M11 Conformance  
**Severity**: ERROR (missing objective), WARNING (incomplete estimand)  
**Blocking**: YES (missing objective), NO (incomplete estimand)  
**Section**: 3 (Trial Objectives and Estimands)

**Checks**:
- At least one primary objective required
- For each primary objective, estimand should include:
  - Treatment
  - Population
  - Endpoint
  - Intercurrent Events Strategy
  - Summary Measure

**Suggestions**:
- Add primary objective in Section 3
- Complete all 5 estimand components per ICH E9(R1)

**Reference**: ICH E9(R1) - Statistical Principles for Clinical Trials: Addendum on Estimands

---

### M11-004: Population Criteria
**Category**: M11 Conformance  
**Severity**: ERROR  
**Blocking**: YES  
**Section**: 5.2 (Inclusion), 5.3 (Exclusion)

**Checks**:
- At least one inclusion criterion required
- At least one exclusion criterion required

**Suggestions**:
- Add inclusion criteria defining target population
- Add exclusion criteria to ensure participant safety

---

### M11-005: Interventions
**Category**: M11 Conformance  
**Severity**: ERROR (missing product), WARNING (missing details)  
**Blocking**: YES (missing product), NO (missing details)  
**Section**: 6 (Trial Intervention)

**Checks**:
- At least one investigational product required
- For each intervention:
  - Route of administration should be specified
  - Dose and dose unit should be specified

**Suggestions**:
- Add investigational product in Section 6
- Specify route (e.g., Oral, IV, IM, SC)
- Specify dose and unit (e.g., 100 mg)

---

### M11-006: Trial Design
**Category**: M11 Conformance  
**Severity**: ERROR  
**Blocking**: YES  
**Section**: 4 (Trial Design)

**Checks**:
- Trial phase must be specified

**Suggestions**:
- Specify phase (Phase 1, 2, 3, or 4)

---

## CROSS-SECTION DEPENDENCY RULES

### DEP-001: Randomization Check
**Category**: Cross-Section Dependencies  
**Severity**: WARNING  
**Blocking**: NO  
**Section**: 4 (Trial Design)

**Checks**:
- If multiple interventions exist, randomization should be documented in Section 4

**Suggestions**:
- Add randomization details in Section 4 (design)

---

## GCP REQUIREMENT RULES

### GCP-001: Informed Consent
**Category**: GCP Requirements  
**Severity**: WARNING  
**Blocking**: NO  
**Section**: 11.1 (Trial Oversight)

**Checks**:
- Informed consent process should be documented in Section 11

**Suggestions**:
- Add informed consent procedures in Section 11

**Reference**: ICH E6(R3) - Good Clinical Practice

---

### GCP-002: Vulnerable Populations
**Category**: GCP Requirements  
**Severity**: WARNING  
**Blocking**: NO  
**Section**: 11 (Trial Oversight)

**Checks**:
- If eligibility criteria mention children/pediatric populations (keywords: "child", "pediatric", "age" + "18")
- Additional protections should be documented

**Suggestions**:
- Add vulnerable population protections (assent, parental consent) in Section 11

**Reference**: ICH E6(R3) - Good Clinical Practice, ICH E11 - Pediatric Studies

---

## VALIDATION STATUS LEVELS

### Valid ✅
- No errors
- No warnings
- Protocol meets all M11 and GCP requirements

### Valid with Warnings ⚠️
- No blocking errors
- Has non-blocking warnings
- Protocol can proceed but improvements recommended

### Invalid ❌
- Has blocking errors
- Protocol cannot be finalized until errors resolved
- Must address all ERROR-level issues

---

## ISSUE SEVERITY LEVELS

### ERROR (Red)
- Critical issues that prevent protocol finalization
- Must be resolved before submission
- Blocking = YES

### WARNING (Yellow)
- Important recommendations
- Should be addressed for best practices
- Blocking = NO

### INFO (Blue)
- Informational messages
- Optional improvements
- Blocking = NO

---

## SECTION STATUS INDICATORS

### Invalid ❌
- Section has ERROR-level issues
- Must be corrected

### Warning ⚠️
- Section has WARNING-level issues
- Recommended to address

### Complete ✅
- Section is marked complete
- No errors or warnings

### Incomplete ⏳
- Section not yet completed
- No errors or warnings

---

## API USAGE EXAMPLES

### Run Validation
```bash
POST /api/protocols/{protocolId}/validate

Response:
{
  "success": true,
  "data": {
    "protocolId": "...",
    "validationDate": "2026-02-09T...",
    "overallStatus": "invalid",
    "completenessScore": 25,
    "totalErrors": 5,
    "totalWarnings": 1,
    "totalInfo": 0,
    "issues": [...],
    "sectionStatus": {...}
  }
}
```

### Get Validation History
```bash
GET /api/protocols/{protocolId}/validation/history?limit=10

Response:
{
  "success": true,
  "data": [
    {
      "id": "...",
      "protocolId": "...",
      "validationDate": "...",
      "overallStatus": "invalid",
      "completenessScore": 25,
      "results": [...],
      "sectionStatus": {...}
    }
  ]
}
```

### Get Latest Validation
```bash
GET /api/protocols/{protocolId}/validation/latest

Response:
{
  "success": true,
  "data": {
    "id": "...",
    "protocolId": "...",
    "validationDate": "...",
    "overallStatus": "valid_with_warnings",
    "completenessScore": 75,
    "results": [...],
    "sectionStatus": {...}
  }
}
```

---

## FRONTEND INTEGRATION GUIDE

### Display Validation Badge
```typescript
// Fetch latest validation
const validation = await fetch(`/api/protocols/${id}/validation/latest`);

// Display badge based on status
if (validation.overallStatus === 'valid') {
  return <Badge color="green">✅ Valid</Badge>;
} else if (validation.overallStatus === 'valid_with_warnings') {
  return <Badge color="yellow">⚠️ {validation.totalWarnings} Warnings</Badge>;
} else {
  return <Badge color="red">❌ {validation.totalErrors} Errors</Badge>;
}
```

### Display Section Status
```typescript
// Show status per section
sections.forEach(section => {
  const status = validation.sectionStatus[section.number];
  
  if (status.status === 'invalid') {
    return <Icon color="red">❌</Icon>;
  } else if (status.status === 'warning') {
    return <Icon color="yellow">⚠️</Icon>;
  } else if (status.status === 'complete') {
    return <Icon color="green">✅</Icon>;
  } else {
    return <Icon color="gray">⏳</Icon>;
  }
});
```

### Display Issue List
```typescript
// Group issues by severity
const errors = validation.issues.filter(i => i.severity === 'error');
const warnings = validation.issues.filter(i => i.severity === 'warning');

// Display with suggestions
issues.forEach(issue => {
  return (
    <IssueCard>
      <Badge>{issue.severity}</Badge>
      <Title>{issue.ruleId}: {issue.message}</Title>
      <Suggestion>{issue.suggestion}</Suggestion>
      <Section>Section {issue.section}</Section>
    </IssueCard>
  );
});
```

---

## FUTURE RULE ADDITIONS

### Planned Rules
- India-specific CDSCO requirements
- Assessment-objective alignment
- Statistical power validation
- Dosing schedule consistency
- Timeline feasibility checks
- Blinding/unblinding procedures
- Safety monitoring requirements
- Data monitoring committee requirements

### Custom Rules
The validation engine is designed to be extensible. New rules can be added by:
1. Adding rule logic to appropriate category method
2. Following ValidationIssue interface
3. Assigning appropriate severity and blocking status
4. Providing actionable suggestions

---

**Last Updated**: February 9, 2026  
**Version**: 1.0  
**Total Rules**: 9 (6 M11, 1 Cross-Section, 2 GCP)
