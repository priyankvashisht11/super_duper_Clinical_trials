# AI Co-Pilot System Architecture

## Visual Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ObjectivesEditor Component                       │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              AICoPilotProvider (Context)                     │   │
│  │                                                               │   │
│  │  ┌──────────────────────────┐  ┌────────────────────────┐  │   │
│  │  │   Main Content (flex:1)  │  │  Sidebar (350px)       │  │   │
│  │  │                          │  │                        │  │   │
│  │  │  ┌────────────────────┐ │  │  ┌──────────────────┐ │  │   │
│  │  │  │ AIEnhancedInput    │ │  │  │ AICoPilotSidebar │ │  │   │
│  │  │  │ ┌────────────────┐ │ │  │  │                  │ │  │   │
│  │  │  │ │ Objective Text │ │ │  │  │ • Current Field  │ │  │   │
│  │  │  │ │ [AI analyzing] │ │ │  │  │ • Validation     │ │  │   │
│  │  │  │ │ ▼ Suggestions  │ │ │  │  │ • Guidance       │ │  │   │
│  │  │  │ └────────────────┘ │ │  │  │ • ICH M11 Tips   │ │  │   │
│  │  │  │  [⚡ AIFieldAssist]│ │  │  │                  │ │  │   │
│  │  │  └────────────────────┘ │  │  └──────────────────┘ │  │   │
│  │  │                          │  │         ▲             │  │   │
│  │  │  ┌────────────────────┐ │  │         │             │  │   │
│  │  │  │ AIEnhancedInput    │ │  │         │             │  │   │
│  │  │  │ ┌────────────────┐ │ │  │    Real-time         │  │   │
│  │  │  │ │ Treatment      │ │ │  │    Updates           │  │   │
│  │  │  │ │ [Typing...]    │ │ │  │         │             │  │   │
│  │  │  │ └────────────────┘ │ │  │         │             │  │   │
│  │  │  │  [⚡ AIFieldAssist]│ │  │         │             │  │   │
│  │  │  └────────────────────┘ │  │         │             │  │   │
│  │  │                          │  │         │             │  │   │
│  │  │  ┌────────────────────┐ │  │         │             │  │   │
│  │  │  │ AIEnhancedInput    │ │  │         │             │  │   │
│  │  │  │ ┌────────────────┐ │ │  │         │             │  │   │
│  │  │  │ │ Population     │─┼─┼──┼─────────┘             │  │   │
│  │  │  │ │ [Focused]      │ │ │  │                        │  │   │
│  │  │  │ └────────────────┘ │ │  │                        │  │   │
│  │  │  │  [⚡ AIFieldAssist]│ │  │                        │  │   │
│  │  │  └────────────────────┘ │  │                        │  │   │
│  │  │                          │  │                        │  │   │
│  │  └──────────────────────────┘  └────────────────────────┘  │   │
│  │                                                               │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Component Interaction Flow

```
User Types in Field
       │
       ▼
┌──────────────────┐
│ AIEnhancedInput  │
│  - Captures text │
│  - Debounces     │
└────────┬─────────┘
         │
         ▼
┌──────────────────────┐
│ AICoPilotContext     │
│  - setCurrentField() │
│  - Debounce 800ms    │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ AI Service           │
│  - POST /api/ai/...  │
│  - Perplexity API    │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ AICoPilotContext     │
│  - setSuggestions()  │
│  - setValidation()   │
│  - setGuidance()     │
└────────┬─────────────┘
         │
         ├─────────────────────┐
         │                     │
         ▼                     ▼
┌──────────────────┐  ┌──────────────────┐
│ AIEnhancedInput  │  │ AICoPilotSidebar │
│  - Show dropdown │  │  - Update status │
│  - Color border  │  │  - Show guidance │
│  - AI badge      │  │  - Validation    │
└──────────────────┘  └──────────────────┘
```

---

## State Management

```
AICoPilotContext State:
┌─────────────────────────────────────┐
│ currentField: {                     │
│   fieldName: string                 │
│   fieldValue: string                │
│   fieldType: string                 │
│   sectionNumber: string             │
│   protocolContext: any              │
│ }                                   │
│                                     │
│ suggestions: string[]               │
│ validation: {                       │
│   status: 'valid'|'warning'|'error' │
│   message: string                   │
│ }                                   │
│ guidance: string[]                  │
│ isAnalyzing: boolean                │
└─────────────────────────────────────┘
```

---

## Two Approaches Comparison

### Approach 1: Lightweight (AIFieldAssist)

```
┌─────────────────────────────────┐
│  TextField                      │
│  ┌───────────────────────────┐  │
│  │ User types manually       │  │
│  └───────────────────────────┘  │
│                                 │
│  [⚡ AI Assist Button]          │
│         │                       │
│         │ Click                 │
│         ▼                       │
│  ┌───────────────────────────┐  │
│  │ Popover                   │  │
│  │ • Suggestion 1 (click)    │  │
│  │ • Suggestion 2 (click)    │  │
│  │ • Suggestion 3 (click)    │  │
│  │ ─────────────────────     │  │
│  │ Best Practices:           │  │
│  │ • Tip 1                   │  │
│  │ • Tip 2                   │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘

Pros:
✅ Simple, non-intrusive
✅ User controls when to use AI
✅ Minimal API calls
✅ Works with any TextField

Cons:
❌ No real-time feedback
❌ Manual interaction required
❌ No validation indicators
```

### Approach 2: Advanced (AIEnhancedInput + Sidebar)

```
┌─────────────────────────────────────────────────────────┐
│  AIEnhancedInput                    AICoPilotSidebar    │
│  ┌───────────────────────────┐      ┌────────────────┐ │
│  │ User types...             │      │ 🤖 AI Co-Pilot │ │
│  │ [AI analyzing...] 🔄      │      │                │ │
│  └───────────────────────────┘      │ Current Field: │ │
│         │                            │ "Population"   │ │
│         │ 800ms debounce             │                │ │
│         ▼                            │ ✅ Valid       │ │
│  ┌───────────────────────────┐      │ "Good start!"  │ │
│  │ ▼ AI Suggestions          │      │                │ │
│  │ • Suggestion 1 (Tab)      │      │ 💡 Guidance:   │ │
│  │ • Suggestion 2 (↓)        │      │ • Be specific  │ │
│  │ • Suggestion 3            │      │ • Include age  │ │
│  └───────────────────────────┘      │ • Define sex   │ │
│  [Green border = valid] ✅          │                │ │
│  [AI badge: 3 suggestions]          │ 📋 ICH M11:    │ │
│                                      │ • Compliant    │ │
│                                      │ • Formal tone  │ │
│                                      └────────────────┘ │
└─────────────────────────────────────────────────────────┘

Pros:
✅ Real-time feedback
✅ Validation as you type
✅ Contextual guidance
✅ Keyboard shortcuts
✅ Professional UX

Cons:
❌ More API calls (debounced)
❌ More complex setup
❌ Requires context provider
```

---

## Data Flow Diagram

```
┌──────────────┐
│   User       │
│   Types      │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│                  Frontend (React)                        │
│                                                           │
│  ┌────────────────┐         ┌──────────────────────┐    │
│  │ AIEnhancedInput│────────▶│ AICoPilotContext     │    │
│  │ - onChange     │         │ - setCurrentField()  │    │
│  │ - onFocus      │         │ - Debounce 800ms     │    │
│  └────────────────┘         └──────────┬───────────┘    │
│                                        │                 │
│  ┌────────────────┐                   │                 │
│  │ AIFieldAssist  │                   │                 │
│  │ - onClick      │───────────────────┤                 │
│  └────────────────┘                   │                 │
│                                        │                 │
└────────────────────────────────────────┼─────────────────┘
                                         │
                                         ▼
┌──────────────────────────────────────────────────────────┐
│              Frontend Service Layer                      │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │ aiService.ts                                       │  │
│  │ - getSectionAssistance(section, content, query)   │  │
│  │ - Formats request                                  │  │
│  │ - Handles errors                                   │  │
│  └────────────────────────┬───────────────────────────┘  │
└────────────────────────────┼──────────────────────────────┘
                             │
                             │ HTTP POST
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│              Backend (Express + TypeScript)              │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │ ai.controller.ts                                   │  │
│  │ POST /api/ai/section-assistance                    │  │
│  │ - Validates request                                │  │
│  │ - Calls AI service                                 │  │
│  └────────────────────────┬───────────────────────────┘  │
│                            │                              │
│  ┌────────────────────────▼───────────────────────────┐  │
│  │ ai.service.ts                                      │  │
│  │ - analyzeSectionContent()                          │  │
│  │ - Builds prompt with context                       │  │
│  │ - Calls Perplexity API                             │  │
│  └────────────────────────┬───────────────────────────┘  │
└────────────────────────────┼──────────────────────────────┘
                             │
                             │ HTTPS POST
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│              Perplexity API                              │
│                                                           │
│  Model: sonar / sonar-pro                                │
│  - Analyzes content                                      │
│  - Generates suggestions                                 │
│  - Provides validation                                   │
│  - Returns guidance                                      │
│                                                           │
└────────────────────────────┬─────────────────────────────┘
                             │
                             │ Response
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│              Backend Response                            │
│                                                           │
│  {                                                        │
│    content: "AI-generated suggestions...",               │
│    model: "sonar",                                       │
│    usage: { tokens: 150 }                                │
│  }                                                        │
│                                                           │
└────────────────────────────┬─────────────────────────────┘
                             │
                             │ JSON Response
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│              Frontend Updates                            │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │ AICoPilotContext                                   │  │
│  │ - setSuggestions([...])                            │  │
│  │ - setValidation({status, message})                 │  │
│  │ - setGuidance([...])                               │  │
│  │ - setIsAnalyzing(false)                            │  │
│  └────────────────────────┬───────────────────────────┘  │
│                            │                              │
│         ┌──────────────────┴──────────────────┐          │
│         │                                      │          │
│         ▼                                      ▼          │
│  ┌──────────────┐                    ┌─────────────────┐ │
│  │AIEnhancedInput│                   │ AICoPilotSidebar│ │
│  │- Show dropdown│                   │ - Update status │ │
│  │- Color border │                   │ - Show guidance │ │
│  │- AI badge     │                   │ - Validation    │ │
│  └───────────────┘                   └─────────────────┘ │
└──────────────────────────────────────────────────────────┘
                             │
                             ▼
                      ┌──────────────┐
                      │   User Sees  │
                      │  Suggestions │
                      └──────────────┘
```

---

## Performance Optimization Strategy

### Debouncing
```
User Types: "T" → "To" → "To " → "To e" → "To ev" → "To eva"
            │     │      │       │        │         │
            ├─────┴──────┴───────┴────────┴─────────┤
            │         800ms timer resets             │
            │         on each keystroke              │
            └────────────────────────────────────────┤
                                                     │
                                            Timer completes
                                                     │
                                                     ▼
                                            API Call Made
                                            (Only 1 call!)
```

### Caching Strategy
```
Field: "objectiveText"
Value: "To evaluate efficacy"
       │
       ▼
┌──────────────────────┐
│ Check Cache          │
│ Key: field + value   │
└──────┬───────────────┘
       │
       ├─── Cache Hit ──▶ Return cached suggestions
       │                  (No API call)
       │
       └─── Cache Miss ─▶ Call API
                          Store in cache
                          Return suggestions
```

### Lazy Loading
```
Component Mount
       │
       ▼
┌──────────────────────┐
│ AICoPilotSidebar     │
│ - Renders shell      │
└──────┬───────────────┘
       │
       │ User focuses field
       ▼
┌──────────────────────┐
│ Load field content   │
│ - Validation         │
│ - Guidance           │
│ - Requirements       │
└──────────────────────┘
```

---

## Security & Privacy

### API Key Protection
```
┌─────────────────────────────────────────┐
│ Perplexity API Key                      │
│                                         │
│ ✅ Stored in: backend/.env              │
│ ✅ Protected by: .gitignore             │
│ ✅ Never sent to: Frontend              │
│ ✅ Used only in: Backend service        │
│ ❌ Not in: Code, docs, git history      │
└─────────────────────────────────────────┘
```

### Data Flow Security
```
Frontend ──(HTTPS)──▶ Backend ──(HTTPS)──▶ Perplexity
   │                     │                      │
   │                     │                      │
   ▼                     ▼                      ▼
No API Key         Has API Key            Validates Key
User data only     Adds key to req       Returns AI data
```

---

## Scalability Plan

### Current (Phase 1)
```
Sections with AI Co-Pilot: 1
- Trial Objectives (Section 3)
```

### Phase 2
```
Sections with AI Co-Pilot: 3
- Trial Objectives (Section 3) ✅
- Eligibility Criteria (Section 4) 🔄
- Interventions (Section 5) 🔄
```

### Phase 3 (Full Rollout)
```
All 14 Sections:
1. Protocol Summary
2. Background & Rationale
3. Trial Objectives ✅
4. Eligibility Criteria
5. Interventions
6. Study Design
7. Endpoints
8. Statistical Analysis
9. Safety Monitoring
10. Data Management
11. Ethics & Regulatory
12. Study Timeline
13. Budget & Resources
14. References & Appendices
```

---

## Summary

The AI Co-Pilot system is built on a **modular, scalable architecture** that:

1. **Separates concerns**: Context, UI components, and services
2. **Optimizes performance**: Debouncing, caching, lazy loading
3. **Provides flexibility**: Two approaches (lightweight + advanced)
4. **Ensures security**: API keys protected, HTTPS communication
5. **Scales easily**: Add to new sections by following pattern

The **ObjectivesEditor** serves as the reference implementation that other sections can follow.
