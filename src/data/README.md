# Sample Data and Mock Services

This directory contains comprehensive sample data and mock services for the Clinical Trials Intelligence Platform. The implementation provides realistic demo functionality without requiring backend services.

## Overview

The sample data and mock services include:

- **12 comprehensive clinical trials** with realistic medical information
- **40+ medical conditions** with synonyms and categories
- **Mock search service** with filtering, sorting, and pagination
- **Mock document generation** with multiple templates and citation styles
- **Local storage service** for user preferences and bookmarks
- **Demo service** for showcasing platform capabilities

## Sample Data Structure

### Clinical Trials (`sampleTrials.ts`)

Contains 12 realistic clinical trials covering:

- **Endocrine Disorders**: Type 1 & 2 Diabetes, Thyroid conditions
- **Oncology**: Breast, Lung, Colorectal cancers with immunotherapy
- **Cardiovascular**: Hypertension, Heart failure, Telemedicine studies
- **Mental Health**: Depression, Digital therapeutics
- **Infectious Diseases**: Tuberculosis, MDR-TB treatments
- **Rheumatology**: Rheumatoid Arthritis, Ayurvedic interventions
- **Regenerative Medicine**: Stem cell therapy for diabetic foot ulcers
- **AI/Digital Health**: AI-guided cancer treatment, Mobile health platforms
- **Integrative Medicine**: Yoga and meditation for chronic pain

Each trial includes:
- Complete CTRI registration details
- Realistic inclusion/exclusion criteria
- Multiple study locations across India
- Principal investigator and sponsor information
- Proper phase classification and recruitment status

### Medical Conditions (`medicalConditions.ts`)

Comprehensive database of medical conditions organized by specialty:

- **Endocrine Disorders** (4 conditions)
- **Cardiovascular Diseases** (4 conditions)
- **Oncology** (4 conditions)
- **Neurological Disorders** (4 conditions)
- **Respiratory Diseases** (3 conditions)
- **Gastrointestinal Disorders** (3 conditions)
- **Rheumatology** (3 conditions)
- **Infectious Diseases** (4 conditions)
- **Mental Health** (4 conditions)
- **Dermatology** (2 conditions)
- **Ophthalmology** (2 conditions)
- **Nephrology** (2 conditions)
- **Hematology** (2 conditions)
- **Pediatrics** (2 conditions)

Each condition includes:
- Primary name and category
- Common synonyms and abbreviations
- Searchable aliases for autocomplete

### Indian Cities Database

Complete list of 100+ Indian cities with state information for location-based filtering.

## Mock Services

### Search Service (`searchService.ts`)

Comprehensive search functionality including:

**Core Features:**
- Full-text search across trial titles, descriptions, and metadata
- Advanced filtering by condition, phase, status, location, age, gender
- Sorting by relevance, date, title, phase, status
- Pagination with configurable page sizes
- Faceted search results with counts

**Autocomplete:**
- Medical condition suggestions
- Trial title matching
- Common search term recommendations
- Real-time suggestion generation

**Performance:**
- Simulated API delays for realistic experience
- Efficient filtering and sorting algorithms
- Facet calculation for result refinement

### Document Service (`documentService.ts`)

AI-powered document generation with:

**Document Templates:**
- **Literature Review**: Comprehensive analysis with background, methodology, findings
- **Trial Comparison**: Side-by-side comparison with tables and analysis
- **Patient Eligibility**: Detailed eligibility criteria analysis
- **Research Proposal**: Foundation for research proposals with methodology

**Features:**
- Multiple citation styles (AMA, APA, Vancouver)
- Streaming document generation for real-time display
- Word count and processing time metadata
- Export functionality (DOCX, PDF, TXT)
- Realistic medical content generation

**Content Quality:**
- Professional medical writing style
- Proper citation formatting
- Comprehensive analysis sections
- Evidence-based recommendations

### Storage Service (`storageService.ts`)

Complete local storage management:

**User Preferences:**
- Theme and language settings
- Default filter configurations
- Notification preferences
- Personalization options

**Bookmarks Management:**
- Add/remove trial bookmarks
- Bookmark status checking
- Bulk bookmark operations
- Bookmark synchronization

**Search History:**
- Recent search queries (last 10)
- Detailed search history with filters and results
- Favorite search marking
- Search history analytics

**Document Drafts:**
- Auto-save document drafts
- Draft versioning and timestamps
- Draft management and cleanup
- Content recovery features

**Filter Presets:**
- Save commonly used filter combinations
- Named preset management
- Quick filter application
- Preset sharing capabilities

**Data Management:**
- Complete data export/import
- Storage usage statistics
- Data cleanup utilities
- Privacy-compliant data handling

### Demo Service (`demoService.ts`)

Comprehensive demo functionality:

**Demo Data Initialization:**
- Sample user preferences and settings
- Pre-populated bookmarks and searches
- Realistic search history
- Sample document drafts

**Demo Statistics:**
- Platform usage metrics
- Trial distribution analytics
- Popular condition tracking
- Geographic distribution data

**Featured Content:**
- Highlighted trials for landing page
- Popular search suggestions
- Trending research areas
- Recent platform updates

## Usage Examples

### Basic Search
```typescript
import { searchService } from '../services';

const results = await searchService.searchTrials({
  query: 'diabetes type 2',
  filters: { phase: ['III'], status: ['recruiting'] },
  pagination: { page: 1, limit: 10 },
  sort: { field: 'relevance', order: 'desc' }
});
```

### Document Generation
```typescript
import { documentService } from '../services';

const document = await documentService.generateDocument({
  trialIds: ['trial-001', 'trial-002'],
  researchQuestion: 'What are the latest diabetes treatments?',
  templateType: 'literature_review',
  citationStyle: 'ama'
});
```

### User Preferences
```typescript
import { storageService } from '../services';

// Save preferences
storageService.setUserPreferences({
  theme: 'dark',
  defaultFilters: { phase: ['III'] }
});

// Manage bookmarks
storageService.addBookmark('trial-001');
const isBookmarked = storageService.isBookmarked('trial-001');
```

### Demo Initialization
```typescript
import { demoService } from '../services';

// Initialize demo data
await demoService.initializeDemoData();

// Get demo statistics
const stats = demoService.getDemoStatistics();

// Perform demo search
const results = await demoService.performDemoSearch('diabetes');
```

## Data Quality and Realism

### Medical Accuracy
- All trial data based on real CTRI patterns
- Accurate medical terminology and procedures
- Realistic inclusion/exclusion criteria
- Proper regulatory compliance information

### Geographic Authenticity
- Real Indian cities and medical institutions
- Accurate state and coordinate information
- Representative geographic distribution
- Major medical center inclusion

### Temporal Consistency
- Realistic trial timelines and durations
- Proper phase progression logic
- Consistent recruitment status updates
- Accurate date relationships

## Testing

Comprehensive test suite covering:
- Search functionality with various filters
- Document generation for all templates
- Storage service operations
- Demo service initialization
- Data integrity and consistency

Run tests with:
```bash
npx vitest run src/test/services.test.ts
```

## Performance Considerations

### Search Performance
- Efficient filtering algorithms
- Optimized facet calculations
- Minimal memory footprint
- Realistic API response times

### Storage Efficiency
- Compressed data structures
- Efficient serialization
- Storage quota management
- Cleanup and maintenance utilities

### Memory Management
- Lazy loading of large datasets
- Efficient data structures
- Garbage collection friendly
- Resource cleanup

## Future Enhancements

### Data Expansion
- Additional trial categories
- More medical conditions
- Extended geographic coverage
- International trial integration

### Service Improvements
- Advanced search algorithms
- Enhanced document templates
- Improved storage compression
- Real-time collaboration features

### Integration Capabilities
- External API compatibility
- Data synchronization
- Cloud storage integration
- Multi-device synchronization

## Contributing

When adding new sample data:

1. Follow existing data structure patterns
2. Ensure medical accuracy and terminology
3. Include comprehensive metadata
4. Add appropriate test coverage
5. Update documentation

For service enhancements:
1. Maintain backward compatibility
2. Add comprehensive error handling
3. Include performance considerations
4. Update test suites
5. Document new features

## License and Disclaimers

This sample data is for demonstration purposes only and should not be used for actual medical decision-making. All trial information is fictional and created for platform demonstration. Real clinical trial participation should always involve qualified medical professionals and proper regulatory oversight.