import { searchService } from './searchService';
import { documentService } from './documentService';
import { storageService } from './storageService';
import { medicalConditions } from '../data/medicalConditions';
import { allSampleTrials } from '../data/sampleTrials';

// Demo service for showcasing platform capabilities
export class DemoService {
  
  /**
   * Initialize demo data and populate local storage with sample user data
   */
  async initializeDemoData(): Promise<void> {
    // Set up sample user preferences
    storageService.setUserPreferences({
      theme: 'light',
      language: 'en',
      defaultFilters: {
        phase: ['III'],
        status: ['recruiting']
      },
      notifications: {
        email: true,
        push: false
      }
    });

    // Add sample bookmarks
    const sampleBookmarks = ['trial-001', 'trial-004', 'trial-007'];
    sampleBookmarks.forEach(trialId => {
      storageService.addBookmark(trialId);
    });

    // Add sample recent searches
    const sampleSearches = [
      'diabetes type 2',
      'breast cancer Phase III',
      'hypertension Mumbai',
      'depression digital therapy',
      'tuberculosis MDR'
    ];
    sampleSearches.forEach(search => {
      storageService.addRecentSearch(search);
    });

    // Add sample search history with filters
    await this.addSampleSearchHistory();

    // Add sample filter presets
    this.addSampleFilterPresets();

    // Add sample document drafts
    await this.addSampleDocumentDrafts();

    // Set sample user location (Mumbai)
    storageService.setUserLocation({
      lat: 19.0760,
      lng: 72.8777,
      city: 'Mumbai',
      state: 'Maharashtra'
    });

    // Configure app settings for demo
    storageService.updateAppSettings({
      autoSaveSearches: true,
      showSearchSuggestions: true,
      enableLocationServices: true,
      compactView: false,
      resultsPerPage: 10,
      defaultSortOrder: 'relevance',
      enableNotifications: true,
      autoBookmarkViewed: false
    });
  }

  /**
   * Get demo search suggestions based on popular conditions
   */
  getDemoSearchSuggestions(): string[] {
    return [
      'Type 2 Diabetes Phase III Mumbai',
      'Breast Cancer Immunotherapy',
      'Hypertension Telemedicine Rural',
      'Depression Digital Therapy',
      'Tuberculosis MDR Novel Treatment',
      'Rheumatoid Arthritis Ayurvedic',
      'Lung Cancer PD-1 Inhibitor',
      'Diabetic Foot Ulcer Stem Cell',
      'Chronic Pain Yoga Meditation',
      'Maternal Health Mobile Platform'
    ];
  }

  /**
   * Perform demo search with realistic results
   */
  async performDemoSearch(query: string = 'diabetes'): Promise<any> {
    const searchRequest = {
      query,
      filters: {},
      pagination: { page: 1, limit: 10 },
      sort: { field: 'relevance', order: 'desc' as const }
    };

    const results = await searchService.searchTrials(searchRequest);
    
    // Add to search history
    storageService.addRecentSearch(query);
    storageService.addSearchHistory(query, {}, results.totalCount);

    return results;
  }

  /**
   * Generate demo document with sample trials
   */
  async generateDemoDocument(researchQuestion: string = 'What are the latest treatment approaches for Type 2 Diabetes in India?'): Promise<any> {
    const diabetesTrials = allSampleTrials
      .filter(trial => trial.condition.toLowerCase().includes('diabetes'))
      .slice(0, 3)
      .map(trial => trial.id);

    const request = {
      trialIds: diabetesTrials,
      researchQuestion,
      templateType: 'literature_review' as const,
      citationStyle: 'ama' as const
    };

    return await documentService.generateDocument(request);
  }

  /**
   * Get demo statistics for dashboard
   */
  getDemoStatistics() {
    return {
      totalTrials: allSampleTrials.length,
      activeTrials: allSampleTrials.filter(t => t.recruitmentStatus === 'recruiting').length,
      medicalConditions: medicalConditions.length,
      institutions: [...new Set(allSampleTrials.map(t => t.primarySponsor))].length,
      cities: [...new Set(allSampleTrials.flatMap(t => t.locations.map(l => l.city)))].length,
      phases: {
        'I': allSampleTrials.filter(t => t.phase === 'I').length,
        'II': allSampleTrials.filter(t => t.phase === 'II').length,
        'III': allSampleTrials.filter(t => t.phase === 'III').length,
        'IV': allSampleTrials.filter(t => t.phase === 'IV').length
      },
      topConditions: this.getTopConditions(),
      recentUpdates: allSampleTrials
        .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
        .slice(0, 5)
        .map(t => ({
          id: t.id,
          title: t.title,
          condition: t.condition,
          lastUpdated: t.lastUpdated
        }))
    };
  }

  /**
   * Get featured trials for landing page
   */
  getFeaturedTrials() {
    return [
      allSampleTrials.find(t => t.id === 'trial-001'), // Diabetes GLP-1
      allSampleTrials.find(t => t.id === 'trial-002'), // Lung Cancer Immunotherapy
      allSampleTrials.find(t => t.id === 'trial-004'), // Digital Depression Therapy
      allSampleTrials.find(t => t.id === 'trial-008'), // AI Cancer Treatment
    ].filter(Boolean);
  }

  /**
   * Get sample autocomplete suggestions for search
   */
  async getSampleAutocompleteSuggestions(query: string): Promise<string[]> {
    // Combine real autocomplete with demo-specific suggestions
    const realSuggestions = await searchService.getAutocompleteSuggestions(query);
    const demoSuggestions = this.getDemoSearchSuggestions()
      .filter(suggestion => 
        suggestion.toLowerCase().includes(query.toLowerCase())
      );

    return [...new Set([...realSuggestions, ...demoSuggestions])].slice(0, 8);
  }

  /**
   * Reset demo data to initial state
   */
  resetDemoData(): void {
    storageService.clearAllData();
    this.initializeDemoData();
  }

  /**
   * Get demo user profile data
   */
  getDemoUserProfile() {
    return {
      name: 'Dr. Priya Sharma',
      email: 'priya.sharma@example.com',
      specialty: 'Endocrinology',
      institution: 'AIIMS New Delhi',
      licenseNumber: 'MCI-12345',
      registrationDate: new Date('2024-01-15'),
      preferences: storageService.getUserPreferences(),
      bookmarks: storageService.getBookmarkedTrials(),
      recentActivity: storageService.getRecentSearches(),
      statistics: {
        searchesPerformed: storageService.getSearchHistory().length,
        documentsGenerated: storageService.getDocumentDrafts().length,
        trialsBookmarked: storageService.getBookmarkedTrials().length,
        lastLogin: new Date()
      }
    };
  }

  // Private helper methods

  private async addSampleSearchHistory(): Promise<void> {
    const sampleHistoryItems = [
      { query: 'diabetes type 2', filters: { phase: ['III'] }, resultCount: 5 },
      { query: 'breast cancer immunotherapy', filters: { status: ['recruiting'] }, resultCount: 3 },
      { query: 'hypertension telemedicine', filters: { location: { city: 'Mumbai', radius: 50 } }, resultCount: 2 },
      { query: 'depression digital therapy', filters: {}, resultCount: 4 },
      { query: 'tuberculosis MDR', filters: { phase: ['II', 'III'] }, resultCount: 2 }
    ];

    sampleHistoryItems.forEach(item => {
      storageService.addSearchHistory(item.query, item.filters, item.resultCount);
    });
  }

  private addSampleFilterPresets(): void {
    const presets = [
      {
        name: 'Diabetes Research',
        filters: {
          condition: 'diabetes',
          phase: ['II', 'III'],
          status: ['recruiting']
        }
      },
      {
        name: 'Cancer Trials Mumbai',
        filters: {
          condition: 'cancer',
          location: { city: 'Mumbai', radius: 25 },
          phase: ['III']
        }
      },
      {
        name: 'Phase III Active',
        filters: {
          phase: ['III'],
          status: ['recruiting', 'not_yet_recruiting']
        }
      }
    ];

    presets.forEach(preset => {
      storageService.saveFilterPreset(preset.name, preset.filters);
    });
  }

  private async addSampleDocumentDrafts(): Promise<void> {
    const sampleDrafts = [
      {
        title: 'Diabetes Treatment Landscape in India',
        content: 'This literature review examines current clinical trials for Type 2 diabetes treatment in India...',
        trialIds: ['trial-001', 'trial-012'],
        researchQuestion: 'What are the emerging treatments for Type 2 diabetes in Indian patients?',
        templateType: 'literature_review'
      },
      {
        title: 'Cancer Immunotherapy Comparison',
        content: 'Comparative analysis of immunotherapy approaches across different cancer types...',
        trialIds: ['trial-002', 'trial-008'],
        researchQuestion: 'How do different immunotherapy approaches compare in efficacy?',
        templateType: 'trial_comparison'
      }
    ];

    sampleDrafts.forEach(draft => {
      storageService.saveDocumentDraft(draft);
    });
  }

  private getTopConditions() {
    const conditionCounts = new Map<string, number>();
    
    allSampleTrials.forEach(trial => {
      const condition = trial.condition;
      conditionCounts.set(condition, (conditionCounts.get(condition) || 0) + 1);
    });

    return Array.from(conditionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([condition, count]) => ({ condition, count }));
  }
}

// Export singleton instance
export const demoService = new DemoService();