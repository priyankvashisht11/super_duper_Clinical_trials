# AI Co-Pilot Implementation Guide

## Overview
This document explains the AI Co-Pilot system implementation in the Clinical Trials Protocol Builder. The AI Co-Pilot provides real-time, intelligent assistance as users fill out protocol sections.

## Architecture

### Two-Tier Approach

We've implemented **two complementary AI assistance patterns** to give users flexibility:

#### 1. **Lightweight AI Assist (AIFieldAssist)** - Button-Based
- **When to use**: Quick suggestions without real-time analysis
- **How it works**: Click button → Get AI suggestions → Select to apply
- **Best for**: Optional fields, less critical sections, users who prefer manual control

#### 2. **Advanced AI Co-Pilot (AIEnhancedInput + AICoPilotSidebar)** - Real-Time
- **When to use**: Critical fields requiring continuous guidance
- **How it works**: Type → AI analyzes in real-time → Shows suggestions + validation
- **Best for**: Complex fields, regulatory-critical content, power users

---

## Components

### 1. AICoPilotContext (`src/contexts/AICoPilotContext.tsx`)

**Purpose**: Manages global AI Co-Pilot state across all fields

**Key Features**:
- Tracks currently focused field
- Debounces AI analysis (800ms) to reduce API calls
- Provides suggestions, validation, and guidance
- Shares state between AIEnhancedInput and AICoPilotSidebar

**Usage**:
```tsx
import { AICoPilotProvider } from '../../../contexts/AICoPilotContext';

// Wrap your section editor
<AICoPilotProvider>
  <YourSectionEditor />
</AICoPilotProvider>
```

---

### 2. AIFieldAssist (`src/components/ai/AIFieldAssist.tsx`)

**Purpose**: Lightweight AI button for on-demand suggestions

**Props**:
```typescript
interface AIFieldAssistProps {
  fieldName: string;           // Field identifier
  fieldValue: string;          // Current field value
  sectionNumber: string;       // Section number (e.g., "3")
  protocolContext?: any;       // Protocol data for context
  onSuggestionSelect: (suggestion: string) => void;  // Callback when user selects
}
```

**Features**:
- Click to get 3-5 AI suggestions
- Shows 2-3 best practice tips
- Popover UI with clickable suggestions
- No real-time analysis (only on-demand)

**Example**:
```tsx
<Box sx={{ display: 'flex', gap: 1 }}>
  <TextField
    value={value}
    onChange={(e) => setValue(e.target.value)}
    label="Objective Text"
  />
  <AIFieldAssist
    fieldName="objectiveText"
    fieldValue={value}
    sectionNumber="3"
    protocolContext={protocol}
    onSuggestionSelect={(suggestion) => setValue(suggestion)}
  />
</Box>
```

---

### 3. AIEnhancedInput (`src/components/ai/AIEnhancedInput.tsx`)

**Purpose**: Advanced TextField with real-time AI suggestions

**Props**:
```typescript
interface AIEnhancedInputProps {
  fieldName: string;           // Field identifier
  fieldType: string;           // Type of field (text, number, etc.)
  sectionNumber: string;       // Section number
  protocolContext: any;        // Protocol context
  value: string;               // Current value
  onChange: (value: string) => void;  // Value change handler
  label: string;               // Field label
  multiline?: boolean;         // Multi-line support
  rows?: number;               // Number of rows if multiline
  required?: boolean;          // Required field indicator
  placeholder?: string;        // Placeholder text
  helperText?: string;         // Helper text
}
```

**Features**:
- Real-time AI analysis (debounced 800ms)
- Dropdown suggestions with keyboard navigation
- Color-coded validation borders (green/yellow/red)
- Keyboard shortcuts:
  - `Tab` or `Enter`: Accept selected suggestion
  - `↑`/`↓`: Navigate suggestions
  - `Esc`: Dismiss suggestions
- Shows AI badge with suggestion count

**Example**:
```tsx
<AIEnhancedInput
  fieldName="objectiveText"
  fieldType="text"
  sectionNumber="3"
  protocolContext={protocol}
  value={objectiveText}
  onChange={(value) => setObjectiveText(value)}
  label="Objective Text"
  multiline
  rows={3}
  placeholder="Describe the trial objective..."
/>
```

---

### 4. AICoPilotSidebar (`src/components/ai/AICoPilotSidebar.tsx`)

**Purpose**: Context-aware sidebar showing real-time guidance

**Features**:
- Shows currently focused field
- Real-time validation status with color-coded alerts
- AI guidance and tips specific to current field
- ICH M11 compliance requirements
- Sticky positioning (follows scroll)
- Pulse animation when analyzing

**Usage**:
```tsx
<Box sx={{ display: 'flex', gap: 3 }}>
  <Box sx={{ flex: 1 }}>
    {/* Main content with AIEnhancedInput fields */}
  </Box>
  <Box sx={{ width: 350, flexShrink: 0 }}>
    <AICoPilotSidebar />
  </Box>
</Box>
```

---

## Implementation Example: ObjectivesEditor

### Step 1: Wrap with AICoPilotProvider

```tsx
export const ObjectivesEditor: React.FC = () => {
  // ... component logic ...
  
  return (
    <AICoPilotProvider>
      <Box>
        {/* Your content */}
      </Box>
    </AICoPilotProvider>
  );
};
```

### Step 2: Create Layout with Sidebar

```tsx
<Box sx={{ display: 'flex', gap: 3 }}>
  {/* Left: Main Content */}
  <Box sx={{ flex: 1 }}>
    {/* Forms and fields */}
  </Box>
  
  {/* Right: AI Co-Pilot Sidebar */}
  <Box sx={{ width: 350, flexShrink: 0 }}>
    <AICoPilotSidebar />
  </Box>
</Box>
```

### Step 3: Replace TextField with AIEnhancedInput

**Before**:
```tsx
<TextField
  fullWidth
  multiline
  rows={3}
  label="Objective Text"
  value={currentObjective.objectiveText}
  onChange={(e) => setCurrentObjective({
    ...currentObjective,
    objectiveText: e.target.value
  })}
  placeholder="Describe the trial objective..."
/>
```

**After**:
```tsx
<Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
  <AIEnhancedInput
    fieldName="objectiveText"
    fieldType="text"
    sectionNumber="3"
    protocolContext={protocol}
    value={currentObjective.objectiveText}
    onChange={(value: string) => setCurrentObjective({
      ...currentObjective,
      objectiveText: value
    })}
    label="Objective Text"
    multiline
    rows={3}
    placeholder="Describe the trial objective..."
  />
  <AIFieldAssist
    fieldName="objectiveText"
    fieldValue={currentObjective.objectiveText}
    sectionNumber="3"
    protocolContext={protocol}
    onSuggestionSelect={(value: string) => setCurrentObjective({
      ...currentObjective,
      objectiveText: value
    })}
  />
</Box>
```

---

## Decision Guide: Which Component to Use?

### Use AIFieldAssist (Lightweight) When:
- ✅ Field is optional or less critical
- ✅ User prefers manual control
- ✅ Want to minimize API calls
- ✅ Simple text fields
- ✅ Quick suggestions are sufficient

### Use AIEnhancedInput (Advanced) When:
- ✅ Field is required or critical
- ✅ Complex regulatory content
- ✅ User benefits from real-time feedback
- ✅ Validation is important
- ✅ ICH M11 compliance needed

### Use Both Together When:
- ✅ Want to give users choice
- ✅ Critical field that benefits from both approaches
- ✅ Power users + casual users in same workflow

---

## Performance Optimization

### Debouncing
- AI analysis is debounced to **800ms**
- Prevents excessive API calls while typing
- Configurable in `AICoPilotContext.tsx`

### API Call Reduction
- AIFieldAssist: Only calls API on button click
- AIEnhancedInput: Calls API only after 800ms of no typing
- Suggestions cached per field until value changes significantly

### Lazy Loading
- AICoPilotSidebar only renders when field is focused
- Suggestions dropdown only renders when suggestions exist

---

## Backend Integration

### API Endpoint Used
```
POST /api/ai/section-assistance
```

### Request Format
```json
{
  "sectionName": "Trial Objectives",
  "userQuery": "Analyze this field and provide suggestions",
  "currentContent": {
    "fieldName": "current value"
  },
  "context": {
    "protocolId": "123",
    "trialPhase": "Phase III"
  }
}
```

### Response Format
```json
{
  "content": "AI-generated suggestions and guidance",
  "model": "sonar",
  "usage": {
    "tokens": 150
  }
}
```

---

## Sections Implemented

### ✅ Section 3: Trial Objectives and Estimands
- **File**: `src/components/protocol-builder/sections/ObjectivesEditor.tsx`
- **AI Components Used**:
  - AICoPilotProvider (wrapper)
  - AIEnhancedInput (objective text, estimand fields)
  - AIFieldAssist (all fields as backup)
  - AICoPilotSidebar (right sidebar)
- **Fields Enhanced**:
  - Objective Text
  - Estimand Treatment
  - Estimand Population
  - Estimand Endpoint

### 🔄 Section 4: Eligibility Criteria (Next)
- **File**: `src/components/protocol-builder/sections/EligibilityEditor.tsx`
- **Recommended**: AIFieldAssist for criterion text fields

### 🔄 Section 5: Interventions (Next)
- **File**: `src/components/protocol-builder/sections/InterventionsEditor.tsx`
- **Recommended**: AIEnhancedInput for product name, rationale

---

## User Experience

### Visual Indicators
1. **AI Badge**: Shows number of suggestions available
2. **Color-Coded Borders**:
   - 🟢 Green: Valid, meets requirements
   - 🟡 Yellow: Warning, could be improved
   - 🔴 Red: Error, needs attention
3. **Pulse Animation**: Sidebar pulses when analyzing
4. **Loading Spinner**: Shows in field label during analysis

### Keyboard Shortcuts
- `Tab`: Accept selected AI suggestion
- `Enter`: Accept suggestion (single-line fields)
- `↑`/`↓`: Navigate suggestions
- `Esc`: Dismiss suggestions

---

## Testing Checklist

### Functional Testing
- [ ] AIFieldAssist button opens popover
- [ ] Suggestions are clickable and apply correctly
- [ ] AIEnhancedInput shows suggestions after typing
- [ ] Keyboard navigation works (Tab, arrows, Esc)
- [ ] AICoPilotSidebar updates when field changes
- [ ] Validation colors appear correctly
- [ ] Debouncing prevents excessive API calls

### Integration Testing
- [ ] Multiple fields work independently
- [ ] Context switches correctly between fields
- [ ] API errors handled gracefully
- [ ] Works with form validation
- [ ] Saves correctly after AI suggestions applied

### Performance Testing
- [ ] No lag when typing (800ms debounce working)
- [ ] API calls limited to necessary requests
- [ ] Sidebar doesn't cause layout shifts
- [ ] Smooth animations and transitions

---

## Troubleshooting

### Issue: Suggestions not appearing
**Solution**: Check that:
1. Field value is > 3 characters
2. Field is focused
3. Backend API is running
4. Perplexity API key is configured

### Issue: Too many API calls
**Solution**: 
1. Verify debounce is set to 800ms
2. Check that `setCurrentField` isn't called excessively
3. Ensure field focus/blur events are handled correctly

### Issue: Sidebar not updating
**Solution**:
1. Verify component is wrapped in `<AICoPilotProvider>`
2. Check that `useAICoPilot()` hook is being called
3. Ensure field is calling `setCurrentField` on focus

---

## Next Steps

### Phase 1: Complete Core Sections ✅
- [x] Implement in ObjectivesEditor
- [ ] Implement in EligibilityEditor
- [ ] Implement in InterventionsEditor

### Phase 2: Expand to All Sections
- [ ] Study Design
- [ ] Endpoints
- [ ] Statistical Analysis
- [ ] Safety Monitoring
- [ ] Data Management
- [ ] Ethics & Regulatory
- [ ] Study Timeline
- [ ] Budget & Resources
- [ ] References
- [ ] Appendices

### Phase 3: Advanced Features
- [ ] Multi-field context awareness
- [ ] Section-level suggestions
- [ ] Auto-complete from previous protocols
- [ ] Regulatory compliance scoring
- [ ] Export AI suggestions report

---

## Code References

### Key Files
- `src/contexts/AICoPilotContext.tsx` - Context provider
- `src/components/ai/AIFieldAssist.tsx` - Lightweight button
- `src/components/ai/AIEnhancedInput.tsx` - Advanced input
- `src/components/ai/AICoPilotSidebar.tsx` - Sidebar component
- `src/components/protocol-builder/sections/ObjectivesEditor.tsx` - Example implementation

### Backend Files
- `backend/src/services/ai.service.ts` - AI service
- `backend/src/controllers/ai.controller.ts` - AI endpoints

---

## Summary

The AI Co-Pilot system provides **two complementary approaches**:

1. **Lightweight (AIFieldAssist)**: On-demand suggestions via button click
2. **Advanced (AIEnhancedInput + Sidebar)**: Real-time analysis and guidance

Both approaches work together to provide flexible, intelligent assistance that adapts to user preferences and field criticality. The system is designed to be:

- **Non-intrusive**: Users control when to use AI
- **Performant**: Debounced to minimize API calls
- **Helpful**: Provides actionable suggestions and validation
- **Compliant**: Follows ICH M11 guidelines
- **Scalable**: Easy to add to new sections

The ObjectivesEditor serves as the **reference implementation** for other sections to follow.
