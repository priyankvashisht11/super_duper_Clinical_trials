# Validation UI User Guide

## Quick Start

### Accessing the Validation Demo
1. **Start the application**:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm start
   
   # Terminal 2 - Frontend
   cd ..
   npm run dev
   ```

2. **Open in browser**:
   - Navigate to: http://localhost:5173/validation-demo

---

## Using the Validation Panel

### 1. Select a Test Protocol

Use the dropdown at the top to choose from three test protocols:

- **TEST-VAL-001**: Minimal protocol with 5 errors
- **TEST-VAL-002**: Partial protocol with 5 warnings
- **TEST-2026-001**: Phase 3 protocol

### 2. Run Validation

Click the **"Validate Now"** button to:
- Trigger validation on the backend
- Fetch validation results
- Display issues and section status

### 3. View Results in Three Tabs

#### Overview Tab
Shows at-a-glance metrics:
- **Completeness**: Progress bar showing % complete
- **Blocking Errors**: Must be fixed before finalization
- **Warnings**: Recommended improvements
- **Recent Issues**: Preview of first 3 issues

#### Issues Tab
Lists all validation problems:
- **Severity Badge**: ERROR (red), WARNING (yellow), INFO (blue)
- **Rule ID**: e.g., M11-003, GCP-001
- **Blocking Tag**: Shows if issue prevents finalization
- **Message**: Clear description of the problem
- **Suggestion**: Actionable guidance with 💡 icon
- **Go to Section**: Button to navigate to relevant section

#### Sections Tab
Visual grid of all 14 M11 sections:
- **Status Icon**: ✅ Complete, ❌ Invalid, ⚠️ Warning, ⏳ Incomplete
- **Section Number & Title**: e.g., "Section 3: Trial Objectives"
- **Error/Warning Counts**: Badges showing issues per section
- **Click to Navigate**: Jumps to section in protocol

---

## Understanding Validation Status

### Status Badges

| Badge | Meaning | Action Required |
|-------|---------|-----------------|
| ✅ **Valid** | No errors or warnings | None - protocol is compliant |
| ⚠️ **X Warnings** | No errors but has warnings | Recommended to address |
| ❌ **X Errors** | Has blocking errors | Must fix before finalization |

### Issue Severity

| Severity | Color | Blocking | Description |
|----------|-------|----------|-------------|
| **ERROR** | Red | Yes | Critical issues that prevent protocol finalization |
| **WARNING** | Yellow | No | Important recommendations for best practices |
| **INFO** | Blue | No | Optional improvements and suggestions |

### Section Status

| Icon | Status | Meaning |
|------|--------|---------|
| ✅ | Complete | Section is finished with no issues |
| ❌ | Invalid | Section has blocking errors |
| ⚠️ | Warning | Section has warnings |
| ⏳ | Incomplete | Section not yet completed |

---

## Common Validation Issues

### M11-001: Required Protocol Identifiers
**Error**: Missing sponsor protocol identifier or full title

**How to Fix**:
1. Go to protocol header
2. Add unique protocol identifier (e.g., ABC-2024-001)
3. Add descriptive full title

### M11-003: Objectives & Estimands
**Error**: Missing primary objective  
**Warning**: Primary objective missing estimand

**How to Fix**:
1. Go to Section 3 (Trial Objectives)
2. Add at least one primary objective
3. Complete estimand with 5 components:
   - Treatment
   - Population
   - Endpoint
   - Intercurrent Events Strategy
   - Summary Measure

### M11-004: Population Criteria
**Error**: Missing inclusion or exclusion criteria

**How to Fix**:
1. Go to Section 5 (Trial Population)
2. Add at least one inclusion criterion
3. Add at least one exclusion criterion

### M11-005: Interventions
**Error**: Missing investigational product  
**Warning**: Missing route or dose

**How to Fix**:
1. Go to Section 6 (Trial Intervention)
2. Add investigational product
3. Specify route of administration (e.g., Oral, IV)
4. Specify dose and unit (e.g., 100 mg)

### M11-006: Trial Design
**Error**: Missing trial phase

**How to Fix**:
1. Go to Section 4 (Trial Design)
2. Select trial phase (Phase 1, 2, 3, or 4)

### GCP-001: Informed Consent
**Warning**: Informed consent process not documented

**How to Fix**:
1. Go to Section 11 (Trial Oversight)
2. Add informed consent procedures
3. Document consent process

### GCP-002: Vulnerable Populations
**Warning**: Vulnerable population detected but protections not documented

**How to Fix**:
1. Go to Section 11 (Trial Oversight)
2. Add vulnerable population protections
3. Document assent and parental consent procedures

---

## Navigation Tips

### Jump to Sections
1. **From Issues Tab**: Click "Go to Section X" button on any issue
2. **From Sections Tab**: Click any section card
3. **Result**: Page scrolls to that section (or shows alert in demo)

### Refresh Validation
- Click "Validate Now" anytime to re-run validation
- Useful after making changes to protocol
- Results update immediately

### Switch Protocols
- Use dropdown to test different protocols
- Validation results update automatically
- Compare validation across protocols

---

## Best Practices

### When to Validate
- ✅ After completing a section
- ✅ Before submitting for review
- ✅ After making significant changes
- ✅ Periodically during protocol development

### Addressing Issues
1. **Start with Errors**: Fix blocking errors first
2. **Then Warnings**: Address warnings for best practices
3. **Section by Section**: Work through sections systematically
4. **Re-validate**: Check that fixes resolved issues

### Using Suggestions
- Every issue includes a 💡 suggestion
- Suggestions provide actionable guidance
- Follow suggestions for quick resolution
- Reference ICH guidelines when needed

---

## Keyboard Shortcuts (Future)

| Shortcut | Action |
|----------|--------|
| `Ctrl+V` | Validate Now |
| `Ctrl+1` | Overview Tab |
| `Ctrl+2` | Issues Tab |
| `Ctrl+3` | Sections Tab |
| `Ctrl+E` | Export Report |

---

## Troubleshooting

### Validation Not Running
**Problem**: Click "Validate Now" but nothing happens

**Solutions**:
- Check backend is running (http://localhost:3001/health)
- Check browser console for errors
- Verify protocol ID is valid
- Refresh page and try again

### No Validation Results
**Problem**: "No validation results yet" message

**Solutions**:
- Click "Validate Now" to run first validation
- Check protocol exists in database
- Verify API connection

### Loading Forever
**Problem**: Spinner shows but never completes

**Solutions**:
- Check backend logs for errors
- Verify database connection
- Check network tab in browser DevTools
- Restart backend if needed

---

## API Endpoints Used

The UI calls these backend endpoints:

1. **POST** `/api/protocols/:id/validate`
   - Runs validation on protocol
   - Returns ValidationReport

2. **GET** `/api/protocols/:id/validation/latest`
   - Fetches most recent validation
   - Returns ValidationReport or 404

3. **GET** `/api/protocols/:id/validation/history?limit=10`
   - Fetches validation history
   - Returns array of ValidationReports

---

## Component Props Reference

### ValidationPanel
```typescript
<ValidationPanel
  protocolId="protocol-id"           // Required
  onNavigateToSection={(section) => {}} // Optional
/>
```

### ValidationBadge
```typescript
<ValidationBadge
  status="invalid"                   // Required
  errorCount={5}                     // Optional
  warningCount={2}                   // Optional
  size="lg"                          // Optional: 'sm' | 'md' | 'lg'
/>
```

### ValidationIssueCard
```typescript
<ValidationIssueCard
  issue={validationIssue}            // Required
  onNavigate={(section) => {}}       // Optional
/>
```

### SectionStatusGrid
```typescript
<SectionStatusGrid
  sections={sectionStatusMap}        // Required
  onSectionClick={(section) => {}}   // Optional
/>
```

---

## Integration Example

### Add to Your Protocol Builder

```typescript
import { ValidationPanel } from '../components/validation';

const ProtocolBuilderPage = () => {
  const { protocolId } = useParams();
  const [currentSection, setCurrentSection] = useState('1');
  
  const handleNavigate = (sectionNumber: string) => {
    setCurrentSection(sectionNumber);
    // Scroll to section
    document.getElementById(`section-${sectionNumber}`)
      ?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <div>
      {/* Your protocol form */}
      <ProtocolForm />
      
      {/* Validation Panel */}
      <ValidationPanel
        protocolId={protocolId}
        onNavigateToSection={handleNavigate}
      />
    </div>
  );
};
```

---

## Support & Resources

### Documentation
- **Backend API**: `backend/VALIDATION_RULES_REFERENCE.md`
- **Validation Engine**: `backend/SPRINT2_VALIDATION_STATUS.md`
- **Frontend Components**: `SPRINT2_PART3_FRONTEND_STATUS.md`

### ICH Guidelines
- **ICH E9(R1)**: Estimands and Sensitivity Analysis
- **ICH E6(R3)**: Good Clinical Practice
- **ICH M11**: Clinical Electronic Structured Harmonised Protocol

### Getting Help
- Check browser console for errors
- Review backend logs
- Verify API responses in Network tab
- Test with provided demo protocols first

---

**Last Updated**: February 9, 2026  
**Version**: 1.0  
**Status**: Production Ready
