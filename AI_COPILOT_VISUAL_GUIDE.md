# AI Co-Pilot Visual Guide

## See the Difference: Before & After

This guide shows exactly what changed in each section with AI Co-Pilot implementation.

---

## Section 3: Trial Objectives and Estimands

### Before (No AI)
```
┌─────────────────────────────────────────────────────────┐
│ Trial Objectives and Estimands                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [Add Objective] [AI Generate]                          │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ PRIMARY                                            │ │
│  │ To evaluate the efficacy of Drug X...             │ │
│  │ [Edit] [Delete]                                    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ SECONDARY                                          │ │
│  │ To assess the safety profile...                    │ │
│  │ [Edit] [Delete]                                    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### After (With AI Co-Pilot)
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Trial Objectives and Estimands                                               │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────────────┐  ┌──────────────────────────────┐ │
│  │ MAIN CONTENT                        │  │ 🤖 AI CO-PILOT              │ │
│  │                                     │  │                              │ │
│  │ [Add Objective] [AI Generate]       │  │ Current Field:               │ │
│  │                                     │  │ "Objective Text"             │ │
│  │ ┌─────────────────────────────────┐ │  │                              │ │
│  │ │ Objective Text                  │ │  │ ✅ Valid                    │ │
│  │ │ To evaluate the efficacy...     │ │  │ "Clear and measurable"       │ │
│  │ │ [AI analyzing...] 🔄            │ │  │                              │ │
│  │ │ ▼ AI Suggestions:               │ │  │ 💡 Guidance:                │ │
│  │ │ • To evaluate the efficacy and  │ │  │ • Be specific               │ │
│  │ │   safety of Drug X in...        │ │  │ • Include population        │ │
│  │ │ • To assess the therapeutic...  │ │  │ • Define endpoint           │ │
│  │ └─────────────────────────────────┘ │  │                              │ │
│  │ [⚡ AI Assist]                      │  │ 📋 ICH M11:                 │ │
│  │                                     │  │ • Compliant format          │ │
│  │ ┌─────────────────────────────────┐ │  │ • Formal language           │ │
│  │ │ PRIMARY                         │ │  │ • Measurable outcomes       │ │
│  │ │ To evaluate the efficacy...     │ │  │                              │ │
│  │ │ [Edit] [Delete]                 │ │  └──────────────────────────────┘ │
│  │ └─────────────────────────────────┘ │                                   │
│  │                                     │                                   │
│  └─────────────────────────────────────┘                                   │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

**Key Changes**:
- ✅ Split layout: Main content (left) + AI Sidebar (right)
- ✅ AIEnhancedInput with real-time suggestions
- ✅ AIFieldAssist button for on-demand help
- ✅ Sidebar shows current field, validation, guidance
- ✅ Color-coded borders (green/yellow/red)

---

## Section 4: Eligibility Criteria

### Before (No AI)
```
┌─────────────────────────────────────────────────────────┐
│ Eligibility Criteria                                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [Inclusion (5)] [Exclusion (3)]                        │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Enter new inclusion criterion...                   │ │
│  │                                                     │ │
│  └────────────────────────────────────────────────────┘ │
│  [Add]                                                   │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 1  Age ≥ 18 years at screening    [Edit] [Delete] │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ 2  Confirmed diagnosis of...      [Edit] [Delete] │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### After (With AI Co-Pilot)
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Eligibility Criteria                                                          │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────────────┐  ┌──────────────────────────────┐ │
│  │ MAIN CONTENT                        │  │ 🤖 AI CO-PILOT              │ │
│  │                                     │  │                              │ │
│  │ [Inclusion (5)] [Exclusion (3)]     │  │ Current Field:               │ │
│  │                                     │  │ "Inclusion Criterion"        │ │
│  │ ┌─────────────────────────────────┐ │  │                              │ │
│  │ │ New Inclusion Criterion         │ │  │ ⚠️ Suggestion               │ │
│  │ │ Age ≥ 18 years...               │ │  │ "Add 'at screening' for     │ │
│  │ │ [AI analyzing...] 🔄            │ │  │  clarity"                    │ │
│  │ │ ▼ AI Suggestions:               │ │  │                              │ │
│  │ │ • Age ≥ 18 years at screening   │ │  │ 💡 Best Practices:          │ │
│  │ │ • Age ≥ 18 years at time of...  │ │  │ • Be specific               │ │
│  │ │ • Male or female, age ≥ 18...   │ │  │ • Use measurable criteria   │ │
│  │ └─────────────────────────────────┘ │  │ • Include timepoint         │ │
│  │ [⚡ AI Assist] [Add]                │  │                              │ │
│  │                                     │  │ 📋 Regulatory:              │ │
│  │ ┌─────────────────────────────────┐ │  │ • ICH E8 compliant          │ │
│  │ │ 1  Age ≥ 18 years at screening  │ │  │ • Objective criteria        │ │
│  │ │    [Edit] [Delete]              │ │  │ • Verifiable                │ │
│  │ └─────────────────────────────────┘ │  │                              │ │
│  │                                     │  └──────────────────────────────┘ │
│  │ ┌─────────────────────────────────┐ │                                   │
│  │ │ 2  Confirmed diagnosis of...    │ │                                   │
│  │ │    [Edit] [Delete]              │ │                                   │
│  │ └─────────────────────────────────┘ │                                   │
│  │                                     │                                   │
│  └─────────────────────────────────────┘                                   │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

**Key Changes**:
- ✅ AIEnhancedInput for new criterion text
- ✅ Real-time suggestions as you type
- ✅ Context-aware (knows inclusion vs exclusion)
- ✅ Best practice tips in sidebar
- ✅ Regulatory compliance guidance

---

## Section 5: Trial Interventions

### Before (No AI)
```
┌─────────────────────────────────────────────────────────┐
│ Trial Interventions                                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [Add Intervention]                                      │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Drug X 50mg Tablets        INVESTIGATIONAL PRODUCT │ │
│  │                                                     │ │
│  │ Dose: 50 mg                Route: Oral             │ │
│  │ Frequency: Once daily      Duration: 12 weeks      │ │
│  │                                                     │ │
│  │ Rationale: Drug X has shown promising results...   │ │
│  │                                                     │ │
│  │ [Edit] [Delete]                                     │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### After (With AI Co-Pilot)
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Trial Interventions                                                           │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────────────┐  ┌──────────────────────────────┐ │
│  │ MAIN CONTENT                        │  │ 🤖 AI CO-PILOT              │ │
│  │                                     │  │                              │ │
│  │ [Add Intervention]                  │  │ Current Field:               │ │
│  │                                     │  │ "Product Name"               │ │
│  │ ┌─────────────────────────────────┐ │  │                              │ │
│  │ │ Drug X 50mg Tablets             │ │  │ ✅ Valid                    │ │
│  │ │ INVESTIGATIONAL PRODUCT         │ │  │ "Clear product name"         │ │
│  │ │                                 │ │  │                              │ │
│  │ │ Dose: 50 mg    Route: Oral      │ │  │ 💡 Guidance:                │ │
│  │ │ Frequency: QD  Duration: 12w    │ │  │ • Include strength          │ │
│  │ │                                 │ │  │ • Specify formulation       │ │
│  │ │ Rationale:                      │ │  │ • Use generic name          │ │
│  │ │ Drug X has shown...             │ │  │                              │ │
│  │ │                                 │ │  │ 📋 Requirements:            │ │
│  │ │ [Edit] [Delete]                 │ │  │ • INN name preferred        │ │
│  │ └─────────────────────────────────┘ │  │ • Complete dosing info      │ │
│  │                                     │  │ • Scientific rationale      │ │
│  │                                     │  │                              │ │
│  └─────────────────────────────────────┘  └──────────────────────────────┘ │
│                                                                               │
│  DIALOG: Add/Edit Intervention                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Intervention Type: [Investigational Product ▼]                        │  │
│  │                                                                        │  │
│  │ ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │ │ Product Name *                                                   │  │  │
│  │ │ Drug X 50mg tablets                                              │  │  │
│  │ │ [AI analyzing...] 🔄                                             │  │  │
│  │ │ ▼ Suggestions:                                                   │  │  │
│  │ │ • Drug X (generic name) 50 mg oral tablets                       │  │  │
│  │ │ • Drug X 50 mg film-coated tablets                               │  │  │
│  │ └──────────────────────────────────────────────────────────────────┘  │  │
│  │ [⚡ AI Assist]                                                         │  │
│  │                                                                        │  │
│  │ Dose: [50] [⚡]    Dose Unit: [mg] [⚡]                                │  │
│  │                                                                        │  │
│  │ ┌──────────────────────────────────────────────────────────────────┐  │  │
│  │ │ Rationale                                                        │  │  │
│  │ │ Drug X has shown promising results in preclinical studies...     │  │  │
│  │ │ [AI analyzing...] 🔄                                             │  │  │
│  │ └──────────────────────────────────────────────────────────────────┘  │  │
│  │ [⚡ AI Assist]                                                         │  │
│  │                                                                        │  │
│  │ [Cancel] [Save Intervention]                                           │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

**Key Changes**:
- ✅ AIEnhancedInput for Product Name (required field)
- ✅ AIEnhancedInput for Rationale (multiline)
- ✅ AIFieldAssist for Dose and Dose Unit
- ✅ Real-time validation and suggestions
- ✅ Sidebar guidance for regulatory compliance

---

## Common UI Elements Across All Sections

### AI Enhanced Input (Real-time)
```
┌─────────────────────────────────────────────────────────┐
│ Field Label                                    [AI: 3] │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ User is typing here...                              │ │
│ │ [Analyzing...] 🔄                                   │ │
│ └─────────────────────────────────────────────────────┘ │
│ ▼ AI Suggestions (Tab to accept, ↑↓ to navigate)       │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ → Suggestion 1 (selected)                           │ │
│ │   Suggestion 2                                      │ │
│ │   Suggestion 3                                      │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### AI Field Assist (On-demand)
```
┌─────────────────────────────────────────────────────────┐
│ Field Label                                             │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ User types manually here                            │ │
│ └─────────────────────────────────────────────────────┘ │
│ [⚡ AI Assist] ← Click for suggestions                  │
│                                                          │
│ POPOVER (when clicked):                                 │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🤖 AI Suggestions                                   │ │
│ │ Field Name                                          │ │
│ │                                                     │ │
│ │ Click to use:                                       │ │
│ │ • Suggestion 1                                      │ │
│ │ • Suggestion 2                                      │ │
│ │ • Suggestion 3                                      │ │
│ │ ─────────────────────────────────────               │ │
│ │ 💡 Best Practices:                                  │ │
│ │ 1. Tip one                                          │ │
│ │ 2. Tip two                                          │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### AI Co-Pilot Sidebar (Always visible)
```
┌──────────────────────────────┐
│ 🤖 AI CO-PILOT              │
│ Watching your input          │
│ [Analyzing...] 🔄            │
│                              │
│ Current Field:               │
│ "Field Name"                 │
│                              │
│ ┌──────────────────────────┐ │
│ │ ✅ Valid                 │ │
│ │ "Looking good!"          │ │
│ └──────────────────────────┘ │
│                              │
│ 💡 AI Guidance:             │
│ • Tip 1                      │
│ • Tip 2                      │
│ • Tip 3                      │
│                              │
│ 📋 Field Requirements:      │
│ ✅ ICH M11 Compliant        │
│ ✅ Formal Language          │
│ ℹ️  Be Specific             │
│                              │
└──────────────────────────────┘
```

---

## Color Coding

### Validation Border Colors

**Green Border** (Valid):
```
┌─────────────────────────────────────────────────────────┐
│ Field Label                                    [AI: 3] │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Age ≥ 18 years at screening                         │ │ ← Green border
│ └─────────────────────────────────────────────────────┘ │
│ ✅ Valid: Clear and measurable criterion                │
└─────────────────────────────────────────────────────────┘
```

**Yellow Border** (Warning):
```
┌─────────────────────────────────────────────────────────┐
│ Field Label                                    [AI: 3] │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Age over 18                                          │ │ ← Yellow border
│ └─────────────────────────────────────────────────────┘ │
│ ⚠️ Suggestion: Use "≥ 18 years" for precision           │
└─────────────────────────────────────────────────────────┘
```

**Red Border** (Error):
```
┌─────────────────────────────────────────────────────────┐
│ Field Label                                    [AI: 3] │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Adults                                               │ │ ← Red border
│ └─────────────────────────────────────────────────────┘ │
│ ❌ Error: Not specific enough. Define age range          │
└─────────────────────────────────────────────────────────┘
```

---

## Keyboard Shortcuts

### AIEnhancedInput Navigation
```
User types: "To evaluate..."
           ↓ (800ms wait)
     AI analyzes content
           ↓
   Suggestions appear
           ↓
┌─────────────────────────────────┐
│ ▼ AI Suggestions                │
│ → Suggestion 1 (selected)       │  ← Press ↓ to move down
│   Suggestion 2                  │  ← Press ↑ to move up
│   Suggestion 3                  │
└─────────────────────────────────┘
     ↓ Press Tab or Enter
   Suggestion applied!
     ↓ Press Esc
   Suggestions dismissed
```

---

## Mobile/Responsive Behavior

### Desktop (>1200px)
```
┌────────────────────────────────────────────────────────┐
│ [Main Content: 70%]  [AI Sidebar: 350px fixed]        │
└────────────────────────────────────────────────────────┘
```

### Tablet (768px - 1200px)
```
┌────────────────────────────────────────────────────────┐
│ [Main Content: 60%]  [AI Sidebar: 300px fixed]        │
└────────────────────────────────────────────────────────┘
```

### Mobile (<768px)
```
┌────────────────────────────────────────────────────────┐
│ [Main Content: 100%]                                   │
│                                                         │
│ [AI Sidebar: Collapsed, expandable button]            │
└────────────────────────────────────────────────────────┘
```

---

## Animation & Transitions

### Suggestion Dropdown Appearance
```
Frame 1 (0ms):     [Field with text]
Frame 2 (100ms):   [Field with text]
                   ▼ [Fade in: 20% opacity]
Frame 3 (200ms):   [Field with text]
                   ▼ [Fade in: 60% opacity]
Frame 4 (300ms):   [Field with text]
                   ▼ [Fully visible: 100% opacity]
                   [Suggestions list]
```

### Sidebar Update
```
User clicks Field A → Sidebar updates (50ms fade)
User clicks Field B → Sidebar updates (50ms fade)
```

### Border Color Change
```
Typing... → Yellow border (300ms transition)
Valid     → Green border (300ms transition)
Error     → Red border (300ms transition)
```

---

## Summary

The AI Co-Pilot transforms each section from a **static form** into an **intelligent assistant** that:

1. **Watches** as you type (AIEnhancedInput)
2. **Suggests** improvements in real-time
3. **Validates** against regulatory requirements
4. **Guides** with best practices (Sidebar)
5. **Assists** on-demand (AIFieldAssist button)

All while maintaining:
- ✅ Clean, professional UI
- ✅ Smooth animations
- ✅ Keyboard accessibility
- ✅ Responsive design
- ✅ Performance optimization

**Result**: Faster, higher-quality protocol creation with built-in regulatory compliance! 🚀
