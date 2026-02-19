# Research Hub Enhancement Plan

## Current Status

### Already Implemented ✅
1. **ClinicalTrials.gov** - US clinical trials registry (400,000+ trials)
2. **PubMed** - NCBI biomedical literature database (35M+ articles)

### To Be Added ❌
3. **Google Scholar** - Academic search engine (comprehensive coverage)
4. **Embase** - Biomedical and pharmacological database (Elsevier)
5. **Web of Science** - Citation database (Clarivate)
6. **PsycINFO** - Psychology and behavioral sciences (APA)
7. **CTRI India** - Clinical Trials Registry - India (Indian trials)
8. **Grey Literature** - Unpublished research, reports, theses
9. **Perplexity AI** - Web search with AI summarization (optional)

## Implementation Strategy

### Phase 1: Free/Open Access Sources (Immediate)
1. **CTRI India** ✅ - Free API available
2. **Google Scholar** ⚠️ - No official API (use web scraping or Serpapi)
3. **Grey Literature** ✅ - Multiple free sources
4. **Perplexity AI** ✅ - API available (requires key)

### Phase 2: Subscription Sources (Future)
1. **Embase** ❌ - Requires institutional subscription
2. **Web of Science** ❌ - Requires institutional subscription
3. **PsycINFO** ❌ - Requires institutional subscription

## Recommended Approach

### Immediate Implementation (Free Sources)

#### 1. CTRI India
- **API**: http://ctri.nic.in/Clinicaltrials/advancesearchmain.php
- **Coverage**: Indian clinical trials
- **Access**: Free, no API key required
- **Implementation**: Direct HTTP requests

#### 2. Google Scholar (via Serpapi)
- **API**: https://serpapi.com/google-scholar-api
- **Coverage**: All academic literature
- **Access**: Free tier available (100 searches/month)
- **Implementation**: REST API with API key

#### 3. Grey Literature Sources
- **OpenGrey**: http://www.opengrey.eu/
- **CORE**: https://core.ac.uk/
- **BASE**: https://www.base-search.net/
- **Implementation**: Multiple APIs, aggregate results

#### 4. Perplexity AI
- **API**: https://docs.perplexity.ai/
- **Coverage**: Web search + AI summarization
- **Access**: API key required
- **Implementation**: REST API

### Future Implementation (Subscription Required)

#### 1. Embase
- Requires institutional subscription
- Contact library/institution for API access
- Implement when subscription available

#### 2. Web of Science
- Requires institutional subscription
- Contact Clarivate for API access
- Implement when subscription available

#### 3. PsycINFO
- Requires institutional subscription
- Contact APA for API access
- Implement when subscription available

## Enhanced Features

### 1. Increase Result Limits
- **Current**: 20 results per source
- **New**: 50 results per source
- **Implementation**: Update API parameters

### 2. Full Modal for Study Details
- **Current**: Small dialog
- **New**: Full-screen modal with comprehensive info
- **Sections**:
  - Study Overview
  - Design & Methodology
  - Eligibility Criteria
  - Interventions
  - Outcomes
  - Timeline
  - Locations
  - Contacts
  - Publications
  - Related Studies

### 3. Multi-Source Aggregation
- Combine results from all sources
- Remove duplicates (same NCT ID, PMID, DOI)
- Rank by relevance
- Show source badges

### 4. Advanced Filtering
- Filter by source
- Filter by publication year
- Filter by study type
- Filter by country
- Filter by impact factor (journals)

### 5. Export & Citation
- Export to BibTeX
- Export to EndNote
- Export to Zotero
- Generate citations (APA, MLA, Chicago, Vancouver)

## Implementation Priority

### High Priority (Implement Now)
1. ✅ CTRI India - Essential for Indian users
2. ✅ Increase limits to 50 results
3. ✅ Full modal for study details
4. ✅ Perplexity AI integration

### Medium Priority (Next Sprint)
1. ⚠️ Google Scholar (via Serpapi)
2. ⚠️ Grey Literature sources
3. ⚠️ Multi-source aggregation
4. ⚠️ Advanced filtering

### Low Priority (Future)
1. ❌ Embase (requires subscription)
2. ❌ Web of Science (requires subscription)
3. ❌ PsycINFO (requires subscription)

## API Keys Required

### Free Tier
- **Serpapi** (Google Scholar): Free 100 searches/month
- **Perplexity AI**: Free tier available

### Paid (Optional)
- **Serpapi Pro**: $50/month for 5,000 searches
- **Perplexity AI Pro**: $20/month for more requests

## User Experience Enhancements

### 1. Source Selection
```
┌─────────────────────────────────────┐
│ Search Sources (Select All)         │
├─────────────────────────────────────┤
│ ☑ ClinicalTrials.gov (US)           │
│ ☑ CTRI India                        │
│ ☑ PubMed                            │
│ ☑ Google Scholar                    │
│ ☑ Grey Literature                   │
│ ☑ Perplexity AI                     │
│ ☐ Embase (Subscription Required)    │
│ ☐ Web of Science (Subscription)     │
│ ☐ PsycINFO (Subscription)           │
└─────────────────────────────────────┘
```

### 2. Results Display
```
┌─────────────────────────────────────┐
│ Results (250 total)                 │
├─────────────────────────────────────┤
│ Tabs:                               │
│ [Clinical Trials (120)]             │
│ [Research Papers (100)]             │
│ [Grey Literature (20)]              │
│ [AI Insights (10)]                  │
│                                     │
│ Filters:                            │
│ Source: [All ▼]                     │
│ Year: [2020-2024 ▼]                 │
│ Type: [All ▼]                       │
└─────────────────────────────────────┘
```

### 3. Full Modal
```
┌─────────────────────────────────────────┐
│ [×] NCT05123456                         │
├─────────────────────────────────────────┤
│ Tabs:                                   │
│ [Overview] [Design] [Eligibility]       │
│ [Interventions] [Outcomes] [Timeline]   │
│ [Locations] [Publications] [Related]    │
│                                         │
│ [Content based on selected tab]         │
│                                         │
│ Actions:                                │
│ [Use as Template] [Export] [Bookmark]   │
│ [View on Source] [Copy Citation]        │
└─────────────────────────────────────────┘
```

## Technical Implementation

### Backend Changes
1. Add new service methods for each source
2. Implement result aggregation
3. Add duplicate detection
4. Increase result limits
5. Add caching for performance

### Frontend Changes
1. Add source selection checkboxes
2. Create full modal component
3. Add result filtering
4. Update result cards with source badges
5. Implement pagination for 50 results

### Database Changes
1. Add bookmarks table
2. Add search history
3. Add user preferences for sources

## Success Metrics

1. **Coverage**: 9 data sources available
2. **Results**: 50 results per source (450 total)
3. **User Experience**: Full modal with comprehensive info
4. **Performance**: Results in <5 seconds
5. **Accuracy**: Duplicate detection >95%

## Conclusion

This enhancement will transform the Research Hub into a comprehensive research tool with access to multiple databases, increased result limits, and better user experience through full modals and advanced filtering.

**Immediate Focus**: Implement CTRI India, increase limits to 50, create full modal, and add Perplexity AI integration.
