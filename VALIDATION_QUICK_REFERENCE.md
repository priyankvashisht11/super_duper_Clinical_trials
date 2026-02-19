# Validation System - Quick Reference Guide

## For Protocol Authors

### How to Validate Your Protocol

1. **Open your protocol** in the Protocol Builder
2. **Look for the white button** with blue border at the top of the page
3. **Click "Validate Now"** to run validation
4. **Review the results** that appear immediately below the button
5. **Check section indicators** in the left sidebar for issues
6. **Click on sections** with warning/error icons to fix issues
7. **Re-validate** after making changes

### Understanding Validation Results

#### Status Indicators

| Icon | Meaning | Action Required |
|------|---------|-----------------|
| ✓ | Complete, no issues | None - section is good |
| ⚠️ | Warnings | Recommended to fix, not blocking |
| ❌ | Errors | Must fix before finalization |
| ○ | Incomplete | Continue working on section |

#### Severity Levels

- **Error** (Red ❌): Blocking issue - must be fixed before protocol can be finalized
- **Warning** (Orange ⚠️): Recommended improvement - should be addressed but not blocking
- **Info** (Blue ℹ️): Informational message - nice to have

### Common Validation Issues & Fixes

#### 1. Missing Protocol Identifiers
**Error**: "Sponsor Protocol Identifier is required"
**Fix**: Add a unique protocol ID in the metadata section (e.g., ABC-2024-001)

#### 2. No Primary Objective
**Error**: "At least one primary objective is required"
**Fix**: Go to Section 3 (Objectives) and add a primary objective

#### 3. Missing Inclusion Criteria
**Error**: "At least one inclusion criterion is required"
**Fix**: Go to Section 5 (Population) and add inclusion criteria

#### 4. No Investigational Product
**Error**: "At least one investigational product required"
**Fix**: Go to Section 6 (Interventions) and add the study drug/device

#### 5. Incomplete Estimand
**Warning**: "Estimand incomplete: missing treatment, population..."
**Fix**: Complete all 5 estimand components per ICH E9(R1):
  - Treatment
  - Population
  - Endpoint
  - Intercurrent events strategy
  - Summary measure

#### 6. Missing Sample Size Justification
**Error**: "Sample size justification not provided"
**Fix**: Go to Section 10 (Statistics) and add power calculation

#### 7. No AE/SAE Definitions
**Error**: "Adverse Event (AE) definition not provided"
**Fix**: Go to Section 9 (Adverse Events) and define AE and SAE

#### 8. Missing Informed Consent Process
**Error**: "Informed consent process not documented"
**Fix**: Go to Section 11 (Trial Oversight) and describe consent procedures

### Validation Panel Features

#### Overview Tab
- Shows completeness percentage
- Displays total errors, warnings, and info messages
- Lists top 3 issues
- Click "View all issues" to see complete list

#### Issues Tab
- Full list of all validation issues
- Each issue shows:
  - Severity (error/warning/info)
  - Section number
  - Detailed message
  - Suggestion for fixing
  - "Go to Section" button for quick navigation

#### Sections Tab
- Grid view of all 14 sections
- Color-coded status for each section
- Click any section to navigate directly

### Tips for Efficient Validation

1. **Validate early and often** - Don't wait until the end
2. **Fix errors first** - They block finalization
3. **Address warnings** - They improve protocol quality
4. **Use suggestions** - They provide specific guidance
5. **Navigate quickly** - Click section numbers to jump to issues
6. **Auto-save is active** - Changes save automatically every 2 seconds
7. **Re-validate after fixes** - Confirm issues are resolved

### Validation Coverage

All 14 ICH M11 sections are validated:

1. ✅ Protocol Summary
2. ✅ Introduction
3. ✅ Objectives & Estimands
4. ✅ Trial Design
5. ✅ Population (Eligibility)
6. ✅ Interventions
7. ✅ Discontinuation
8. ✅ Assessments
9. ✅ Adverse Events
10. ✅ Statistics
11. ✅ Trial Oversight
12. ✅ Appendices
13. ✅ Glossary
14. ✅ References

### Regulatory Standards Checked

- ✅ **ICH M11**: Clinical Trial Protocol Structure
- ✅ **ICH E9(R1)**: Estimands and Sensitivity Analysis
- ✅ **ICH E6(R2)**: Good Clinical Practice (GCP)
- ✅ **ICH E2A**: Adverse Event Reporting
- ✅ **India NDCTR 2019**: New Drugs and Clinical Trials Rules
- ✅ **ICMR Guidelines 2017**: Ethical Guidelines for Biomedical Research

## For Administrators

### Validation Rule Management

#### View All Rules
```
GET /api/protocols/validation-rules
```

#### Get Specific Rule
```
GET /api/protocols/validation-rules/:ruleId
```

#### Toggle Rule On/Off
```
PATCH /api/protocols/validation-rules/:ruleId/toggle
Body: { enabled: true/false }
```

### Validation API Endpoints

#### Trigger Validation
```
POST /api/protocols/:id/validate
Response: ValidationReport
```

#### Get Latest Validation
```
GET /api/protocols/:id/validation/latest
Response: ValidationReport (404 if none)
```

#### Get Validation History
```
GET /api/protocols/:id/validation/history?limit=10
Response: ValidationReport[]
```

### Database Queries

#### Find Protocols with Errors
```sql
SELECT p.id, p.fullTitle, vr.totalErrors
FROM Protocol p
JOIN ValidationResult vr ON p.id = vr.protocolId
WHERE vr.totalErrors > 0
ORDER BY vr.validationDate DESC;
```

#### Find Most Common Issues
```sql
SELECT 
  json_extract(issue.value, '$.ruleId') as ruleId,
  json_extract(issue.value, '$.message') as message,
  COUNT(*) as occurrences
FROM ValidationResult vr,
  json_each(vr.results) as issue
GROUP BY ruleId
ORDER BY occurrences DESC
LIMIT 10;
```

## Troubleshooting

### Validation Button Not Visible
- Check that you're in the Protocol Builder page
- Look at the top of the content area (below header)
- Button is white with blue border - very prominent

### Validation Not Running
- Check browser console for errors
- Verify backend is running (http://localhost:3001)
- Check network tab for failed API calls
- Ensure protocol ID is valid

### Results Not Showing
- Wait for validation to complete (may take 2-3 seconds)
- Check if validation panel is toggled off (eye icon in header)
- Refresh the page to reload latest validation

### Section Status Not Updating
- Validation results are cached - click "Validate Now" to refresh
- Auto-polling runs every 2 minutes
- Manual refresh always gets latest results

## Support

### Need Help?
- Click the **Help** icon (?) in the header for keyboard shortcuts
- Click the **User Guide** icon for detailed documentation
- Use **AI Assistant** (Ctrl+Shift+A) for context-specific help

### Report Issues
- Document the specific validation rule ID (e.g., M11-003)
- Include protocol ID and section number
- Describe expected vs actual behavior
- Check if issue is reproducible

## Best Practices

1. **Validate at milestones** - After completing each major section
2. **Review all warnings** - Even if not blocking, they improve quality
3. **Use AI assistance** - Get suggestions for fixing validation issues
4. **Export validation report** - Keep records of validation status
5. **Collaborate with team** - Share validation results with co-authors
6. **Stay compliant** - Follow all regulatory requirements
7. **Document changes** - Track how you addressed validation issues

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + S | Manual save (auto-save active) |
| Ctrl/Cmd + E | Export protocol |
| Ctrl/Cmd + Shift + A | Open AI Assistant |
| ? | Show keyboard shortcuts |
| Esc | Close dialogs/panels |

## Version History

### v1.0 (Current)
- High-contrast validation button
- Comprehensive 50+ validation rules
- All 14 sections covered
- Real-time status indicators
- Actionable error messages
- Quick navigation to issues
- Auto-polling every 2 minutes
- Database persistence

## Coming Soon

- Real-time validation as you type
- Custom rule configuration
- Validation report export (PDF/Word)
- Batch validation for multiple protocols
- AI-powered fix suggestions
- Validation templates by trial type
- Compliance dashboard
- Scheduled automatic validation
