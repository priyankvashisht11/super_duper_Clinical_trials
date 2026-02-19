# AI Integration Summary - Clinical Trials Protocol Builder

## Quick Overview

This Clinical Trials Protocol Builder platform integrates Perplexity AI to assist users in creating ICH M11-compliant clinical trial protocols.

---

## AI Configuration

- **Provider**: Perplexity AI
- **API Key**: `[REDACTED - Stored securely in backend/.env]`
- **Models**:
  - `sonar` - Lightweight, fast responses
  - `sonar-pro` - Advanced analysis and generation
- **Location**: `backend/.env` (excluded from git via `.gitignore`)

---

## AI Capabilities (6 Core Features)

### 1. General Assistance
- **Endpoint**: `POST /api/ai/assist`
- **Model**: `sonar`
- **Purpose**: Answer questions about clinical trials, ICH M11, regulations
- **Example**: "What is required in Section 3 for trial objectives?"

### 2. Content Generation
- **Endpoint**: `POST /api/ai/generate`
- **Model**: `sonar-pro`
- **Purpose**: Generate protocol section content
- **Input**: Section type, protocol context (title, phase, indication)
- **Output**: ICH M11-compliant structured content

### 3. Content Improvement
- **Endpoint**: `POST /api/ai/improve`
- **Model**: `sonar-pro`
- **Purpose**: Enhance existing content for clarity, compliance, tone
- **Features**: Grammar, structure, regulatory alignment

### 4. Smart Suggestions
- **Endpoint**: `POST /api/ai/suggestions`
- **Model**: `sonar`
- **Purpose**: Contextual recommendations
- **Provides**: Next steps, missing elements, best practices

### 5. Validation Insights
- **Endpoint**: `POST /api/ai/validation-insights`
- **Model**: `sonar-pro`
- **Purpose**: Analyze validation errors and provide solutions
- **Output**: Prioritized issues with step-by-step fixes

### 6. Protocol Analysis
- **Endpoint**: `POST /api/ai/analyze`
- **Model**: `sonar-pro`
- **Purpose**: Comprehensive protocol review
- **Metrics**: Completeness, compliance, quality scores

---

## Backend Implementation

### Files Created
```
backend/src/
├── services/ai.service.ts       # Core AI logic with Perplexity API
├── controllers/ai.controller.ts # HTTP request handlers
└── routes/ai.routes.ts          # API route definitions
```

### Key Functions in `ai.service.ts`
1. `getAIAssistance(question, context)` - Q&A
2. `generateContent(sectionType, protocolContext, tone)` - Content generation
3. `improveContent(content, sectionType, improvementType)` - Enhancement
4. `getSmartSuggestions(protocolId, currentSection)` - Suggestions
5. `getValidationInsights(validationResults, protocolId)` - Error analysis
6. `analyzeProtocol(protocolId, analysisType)` - Full review

---

## Frontend Implementation

### Components Created
```
src/components/ai/
├── AIAssistantPanel.tsx        # Chat interface for Q&A
├── AIContentGenerator.tsx      # Content generation UI
├── AIValidationInsights.tsx    # Validation error display
├── AISmartSuggestions.tsx      # Contextual tips panel
└── AIProtocolDashboard.tsx     # Protocol health overview
```

### Frontend Service
- **File**: `src/services/aiService.ts`
- **Purpose**: TypeScript client for backend AI API
- **Features**: Type-safe calls, error handling, interfaces

---

## Integration Points

### Where AI is Available

1. **Protocol Builder Main Page**
   - AI Assistant Panel (sidebar/floating)
   - Smart Suggestions Panel
   - Protocol Dashboard link

2. **All 14 Section Editors**
   - "Generate with AI" button
   - "Improve Content" button
   - Section-specific suggestions
   - Inline assistance

3. **Validation Panel**
   - Automatic insights on validation
   - Error explanations
   - Resolution guidance

4. **Protocol Overview**
   - AI Dashboard with health metrics
   - Improvement roadmap
   - Section-by-section analysis

---

## User Workflows

### Workflow 1: Generate Section Content
1. User opens Section 3 (Objectives) editor
2. Clicks "Generate with AI"
3. AI analyzes protocol metadata (title, phase, indication)
4. Generates ICH M11-compliant objectives
5. User reviews, edits, and inserts

### Workflow 2: Get Help with Validation Errors
1. User validates protocol
2. System finds 5 errors, 12 warnings
3. AI Validation Insights panel opens
4. AI explains each error with:
   - Why it's an error
   - How to fix it
   - Estimated time to resolve
   - Priority level
5. User follows step-by-step guidance

### Workflow 3: Ask Questions
1. User opens AI Assistant
2. Types: "What should I include in the statistical section?"
3. AI provides detailed answer with:
   - Required elements
   - Best practices
   - Examples
   - Offer to generate template
4. User can continue conversation

---

## API Request/Response Examples

### Generate Content
**Request**:
```json
POST /api/ai/generate
{
  "sectionType": "objectives",
  "protocolContext": {
    "title": "Phase III Study of Drug X in Type 2 Diabetes",
    "phase": "Phase III",
    "indication": "Type 2 Diabetes Mellitus"
  },
  "tone": "formal"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "content": "3.1 Primary Objective\nThe primary objective...",
    "wordCount": 450,
    "suggestions": ["Consider adding exploratory endpoints"]
  }
}
```

### Get Validation Insights
**Request**:
```json
POST /api/ai/validation-insights
{
  "validationResults": {
    "errors": 5,
    "warnings": 12,
    "issues": [
      {
        "ruleId": "M11-003",
        "severity": "error",
        "message": "Missing primary objective",
        "section": "3"
      }
    ]
  },
  "protocolId": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "insights": [
      {
        "issue": "Missing primary objective",
        "severity": "critical",
        "explanation": "ICH M11 requires at least one primary objective...",
        "resolution": "1. Navigate to Section 3\n2. Click 'Add Objective'...",
        "estimatedTime": "10 minutes",
        "priority": 1
      }
    ]
  }
}
```

---

## Technical Details

### Model Selection Logic
- **Fast responses** (< 3 sec): Use `sonar`
  - Q&A, suggestions, quick tips
- **Complex tasks** (5-10 sec): Use `sonar-pro`
  - Content generation, analysis, validation insights

### Error Handling
- Rate limit handling (429 errors)
- API key validation (401 errors)
- Graceful degradation
- User-friendly error messages

### Performance
- Average response: 2-5 seconds
- Content generation: 5-10 seconds
- Protocol analysis: 10-15 seconds

---

## Key Features Summary

✅ **6 AI-powered capabilities** across the platform  
✅ **5 React components** for different AI interactions  
✅ **6 API endpoints** for backend AI services  
✅ **Integrated in all 14 protocol sections**  
✅ **Context-aware** - uses protocol metadata for better results  
✅ **ICH M11 compliant** - trained on regulatory guidelines  
✅ **Real-time assistance** - available throughout workflow  
✅ **Validation support** - explains and helps fix errors  

---

## Project Context for Perplexity

### What This Platform Does
A web application for creating clinical trial protocols following ICH M11 guidelines. It has:
- 14 protocol sections (ICH M11 structure)
- Real-time validation engine
- Protocol metadata management
- Objectives, eligibility criteria, interventions management
- Completeness scoring

### How AI Helps Users
1. **Speeds up protocol creation** - Generate sections in seconds
2. **Ensures compliance** - Built-in ICH M11 knowledge
3. **Reduces errors** - Validation insights with fixes
4. **Improves quality** - Content enhancement suggestions
5. **Provides guidance** - 24/7 expert assistance

### AI Integration Scope
- **Backend**: Node.js/Express with TypeScript
- **Frontend**: React with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **AI Provider**: Perplexity API
- **Models**: sonar (fast), sonar-pro (advanced)

---

## Files to Reference

### Backend
- `backend/src/services/ai.service.ts` - Core AI logic
- `backend/src/controllers/ai.controller.ts` - API handlers
- `backend/src/routes/ai.routes.ts` - Route definitions
- `backend/.env` - API key configuration

### Frontend
- `src/services/aiService.ts` - Frontend API client
- `src/components/ai/AIAssistantPanel.tsx` - Chat interface
- `src/components/ai/AIContentGenerator.tsx` - Content generation
- `src/components/ai/AIValidationInsights.tsx` - Error insights
- `src/components/ai/AISmartSuggestions.tsx` - Contextual tips
- `src/components/ai/AIProtocolDashboard.tsx` - Protocol overview

---

## Current Status

✅ **Completed**:
- All 6 AI capabilities implemented
- Backend API fully functional
- Frontend components created
- Integration in protocol builder
- Error handling and validation
- Type-safe TypeScript interfaces

🔄 **In Progress**:
- User testing and feedback
- Performance optimization
- Response quality tuning

📋 **Future Enhancements**:
- Multi-language support
- Voice interface
- Learning from user feedback
- Protocol templates library
- Advanced analytics

---

## For Perplexity Prompt Maker

When creating prompts for this system, consider:

1. **Context is Key**: Always include protocol metadata (title, phase, indication)
2. **Regulatory Focus**: Emphasize ICH M11, GCP, FDA guidelines
3. **Structured Output**: Request formatted, section-based content
4. **Actionable Guidance**: Provide step-by-step instructions
5. **Professional Tone**: Clinical research requires formal language
6. **Completeness**: Cover all required elements per ICH M11

### Example Prompt Structure
```
You are an expert clinical trial protocol writer with deep knowledge of:
- ICH M11 guidelines
- GCP regulations
- FDA/EMA requirements
- Clinical trial design

Task: [Generate/Improve/Analyze] [Section Type]

Protocol Context:
- Title: [Full Protocol Title]
- Phase: [Phase I/II/III/IV]
- Indication: [Disease/Condition]
- Study Type: [Interventional/Observational]

Requirements:
- Follow ICH M11 structure
- Use professional, formal tone
- Include all required elements
- Provide specific, actionable content

Output Format:
[Structured format based on section type]
```

---

**Document Version**: 1.0  
**Created**: February 9, 2026  
**Purpose**: Quick reference for AI integration status and capabilities
