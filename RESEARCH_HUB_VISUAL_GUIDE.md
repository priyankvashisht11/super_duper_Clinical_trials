# Research Hub Visual Guide

## What You'll See Now

### 1. Source Selection Section (NEW!)
```
┌─────────────────────────────────────────────────────────────┐
│ Data Sources (Select sources to search):                    │
├─────────────────────────────────────────────────────────────┤
│ [🧬 ClinicalTrials.gov] [📄 PubMed] [🔬 CTRI India]        │
│ [✨ Perplexity AI] [📑 Grey Literature (disabled)]          │
└─────────────────────────────────────────────────────────────┘
```
- **Blue chips** = Selected and active
- **Grey chips** = Not selected
- **Disabled chips** = Coming soon
- Click any chip to toggle on/off

### 2. Enhanced Tabs (4 instead of 3)
```
┌─────────────────────────────────────────────────────────────┐
│ [Clinical Trials (100)] [Research Papers (50)]              │
│ [Perplexity AI] [AI Insights]                               │
└─────────────────────────────────────────────────────────────┘
```

### 3. Clinical Trial Cards with Source Badges
```
┌─────────────────────────────────────────────────────────────┐
│ Phase III Study of Novel Diabetes Treatment                 │
│ NCT05123456                                                  │
│                                                              │
│ [Phase III] [Recruiting] [500 participants]                 │
│ [ClinicalTrials.gov] ← NEW SOURCE BADGE                     │
│                                                              │
│ Condition: Type 2 Diabetes Mellitus                         │
│ Intervention: Drug X (GLP-1 Agonist)                        │
│                                                              │
│ [View Details] [Use as Template] [Export]                   │
└─────────────────────────────────────────────────────────────┘
```

### 4. Research Paper Cards with Source Badges
```
┌─────────────────────────────────────────────────────────────┐
│ Efficacy and Safety of GLP-1 Receptor Agonists             │
│ Smith J, Johnson M, Williams K, et al.                      │
│                                                              │
│ [NEJM] [2024] [DOI: 10.1056/...] [PMID: 38123456]         │
│ [PubMed] ← NEW SOURCE BADGE                                │
│                                                              │
│ [Read Abstract] [Full Text] [Cite]                         │
└─────────────────────────────────────────────────────────────┘
```

### 5. Perplexity AI Tab (NEW!)
```
┌─────────────────────────────────────────────────────────────┐
│ ℹ️ Perplexity AI Web Search - Real-time information        │
├─────────────────────────────────────────────────────────────┤
│ ✨ AI-Powered Research Summary                              │
│ Query: diabetes clinical trials                             │
│ ─────────────────────────────────────────────────────────── │
│                                                              │
│ Recent clinical trials for diabetes show promising results  │
│ with GLP-1 receptor agonists. Multiple Phase III studies    │
│ are currently recruiting, focusing on cardiovascular        │
│ outcomes and glycemic control. Key findings include...      │
│                                                              │
│ [Powered by Perplexity AI] Generated: Feb 11, 2026         │
└─────────────────────────────────────────────────────────────┘
```

### 6. AI Insights Tab (Enhanced)
```
┌─────────────────────────────────────────────────────────────┐
│ ✅ AI Analysis Complete! Analyzed 100 trials                │
├─────────────────────────────────────────────────────────────┤
│ 📊 Common Design Patterns                                   │
│ • Phase III is most common (45 trials)                      │
│ • 67 trials are currently recruiting                        │
│ • Average enrollment: 425 participants                      │
│                                                              │
│ 💡 Recommendations for Your Protocol                        │
│ • Consider randomized, controlled design                    │
│ • Include both efficacy and safety endpoints                │
│ • Target enrollment of 340-510 participants                 │
│                                                              │
│ 📈 Sample Size Insights                                     │
│ Sample sizes range from 50 to 1200 participants            │
│ (average: 425). Consider 80-90% power with alpha=0.05.     │
└─────────────────────────────────────────────────────────────┘
```

## Color Coding

### Source Badges
- **ClinicalTrials.gov** - Purple/Secondary
- **CTRI India** - Purple/Secondary
- **PubMed** - Blue/Primary
- **Perplexity AI** - Blue/Primary

### Source Selection Chips
- **Selected** - Filled with color
- **Not Selected** - Outlined only
- **Disabled** - Greyed out with reduced opacity

### Status Chips
- **Phase** - Blue/Primary
- **Status** - Green/Success
- **Participants** - Outlined
- **Source** - Purple/Secondary (bold)

## Before vs After Comparison

### Before
```
Search Box
[Filters: Phase, Status, Indication, Country]
Quick Searches

Results:
├─ Clinical Trials (20 max)
├─ Research Papers (20 max)
└─ AI Insights

Total: 40 results max
Sources: 2 (ClinicalTrials.gov, PubMed)
```

### After
```
Search Box
[Filters: Phase, Status, Indication, Country]
Quick Searches
[Source Selection: 5 sources] ← NEW!

Results:
├─ Clinical Trials (100 max) ← INCREASED!
├─ Research Papers (50 max) ← INCREASED!
├─ Perplexity AI ← NEW!
└─ AI Insights

Total: 150+ results
Sources: 5 (ClinicalTrials.gov, PubMed, CTRI India, Perplexity AI, Grey Lit)
Source Badges: On every card ← NEW!
```

## User Flow

### 1. Select Sources
```
User clicks chips to select desired sources
↓
Chips change color to show selection
↓
Search button becomes active
```

### 2. Search
```
User enters query and clicks Search
↓
Backend searches all selected sources in parallel
↓
Results appear in respective tabs
```

### 3. View Results
```
User sees tabs with result counts
↓
Clicks tab to view specific source results
↓
Each card shows source badge
↓
User can identify data origin instantly
```

### 4. Explore AI Insights
```
User clicks "Perplexity AI" tab
↓
Sees AI-powered web search summary
↓
Gets real-time, evidence-based information
```

### 5. Analyze Trials
```
User clicks "Analyze with AI" button
↓
AI analyzes all trial results
↓
Generates patterns, recommendations, insights
↓
User sees comprehensive analysis in AI Insights tab
```

## Key Features Highlighted

### 🎯 Multi-Source Search
- Search across 5 different databases simultaneously
- Toggle sources on/off as needed
- See combined results in one place

### 📊 Increased Capacity
- 50 results per source (up from 20)
- 150+ total results available
- Better coverage of research landscape

### 🏷️ Source Identification
- Every result shows its source
- Color-coded badges
- Easy to identify data origin

### 🤖 AI-Powered Insights
- Perplexity AI for web search
- Trial analysis and patterns
- Recommendations for protocol design

### 🎨 Professional UI
- Clean, modern design
- Intuitive source selection
- Clear visual hierarchy
- Responsive layout

## Mobile View Considerations

### Source Selection
- Chips wrap to multiple lines
- Touch-friendly size
- Clear visual feedback

### Tabs
- Scrollable horizontally
- Auto-scroll buttons
- Result counts visible

### Cards
- Stack vertically
- Full-width on mobile
- Touch-friendly buttons

## Accessibility

### Source Chips
- Keyboard navigable
- Screen reader friendly
- Clear focus states
- ARIA labels

### Tabs
- Keyboard navigation
- Screen reader announces counts
- Focus management
- ARIA roles

### Cards
- Semantic HTML
- Proper heading hierarchy
- Alt text for icons
- Keyboard accessible actions

## Performance

### Parallel Search
- All sources searched simultaneously
- No sequential delays
- Faster overall results

### Caching
- Results cached per query
- Reduced API calls
- Faster repeat searches

### Loading States
- Progress indicators
- Skeleton screens
- Smooth transitions

## Error Handling

### Source Failures
- Individual source failures don't block others
- Error messages per source
- Graceful degradation

### API Limits
- Rate limiting handled
- Fallback to demo data
- User-friendly messages

## Next Steps for Users

1. **Try Different Source Combinations**
   - Enable/disable sources to compare results
   - See how different databases complement each other

2. **Use Perplexity AI**
   - Get real-time web insights
   - Complement database results with current information

3. **Analyze Trials**
   - Use AI to find patterns
   - Get recommendations for your protocol

4. **Export Results**
   - Download trial data
   - Use as templates
   - Cite in your work

---

**Enjoy the enhanced Research Hub!** 🚀
