import { describe, it, expect, beforeEach } from 'vitest';
import { searchService } from '../services/searchService';
import { documentService } from '../services/documentService';
import { storageService } from '../services/storageService';
import { demoService } from '../services/demoService';

describe('Sample Data and Mock Services', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('SearchService', () => {
    it('should return search results for diabetes query', async () => {
      const request = {
        query: 'diabetes',
        filters: {},
        pagination: { page: 1, limit: 10 },
        sort: { field: 'relevance', order: 'desc' as const }
      };

      const response = await searchService.searchTrials(request);
      
      expect(response.trials).toBeDefined();
      expect(response.totalCount).toBeGreaterThan(0);
      expect(response.facets).toBeDefined();
      expect(response.trials.some(trial => 
        trial.condition.toLowerCase().includes('diabetes')
      )).toBe(true);
    });

    it('should provide autocomplete suggestions', async () => {
      const suggestions = await searchService.getAutocompleteSuggestions('diab');
      
      expect(suggestions).toBeDefined();
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.toLowerCase().includes('diabetes'))).toBe(true);
    });

    it('should filter trials by phase', async () => {
      const request = {
        query: '',
        filters: { phase: ['III'] },
        pagination: { page: 1, limit: 10 }
      };

      const response = await searchService.searchTrials(request);
      
      expect(response.trials.every(trial => trial.phase === 'III')).toBe(true);
    });

    it('should filter trials by recruitment status', async () => {
      const request = {
        query: '',
        filters: { status: ['recruiting'] },
        pagination: { page: 1, limit: 10 }
      };

      const response = await searchService.searchTrials(request);
      
      expect(response.trials.every(trial => 
        trial.recruitmentStatus === 'recruiting'
      )).toBe(true);
    });
  });

  describe('DocumentService', () => {
    it('should generate literature review document', async () => {
      const request = {
        trialIds: ['trial-001', 'trial-002'],
        researchQuestion: 'What are the latest treatments for diabetes?',
        templateType: 'literature_review' as const,
        citationStyle: 'ama' as const
      };

      const response = await documentService.generateDocument(request);
      
      expect(response.documentId).toBeDefined();
      expect(response.content).toBeDefined();
      expect(response.content.length).toBeGreaterThan(100);
      expect(response.citations).toBeDefined();
      expect(response.citations.length).toBe(2);
      expect(response.metadata).toBeDefined();
      expect(response.metadata.wordCount).toBeGreaterThan(0);
    });

    it('should generate trial comparison document', async () => {
      const request = {
        trialIds: ['trial-001', 'trial-003'],
        researchQuestion: 'Compare diabetes and arthritis trials',
        templateType: 'trial_comparison' as const,
        citationStyle: 'apa' as const
      };

      const response = await documentService.generateDocument(request);
      
      expect(response.content).toContain('Comparative Analysis');
      expect(response.citations[0].text).toContain('(2024)'); // APA style year
    });

    it('should provide document templates', () => {
      const templates = documentService.getDocumentTemplates();
      
      expect(templates).toBeDefined();
      expect(templates.length).toBe(4);
      expect(templates.some(t => t.type === 'literature_review')).toBe(true);
      expect(templates.some(t => t.type === 'trial_comparison')).toBe(true);
    });
  });

  describe('StorageService', () => {
    it('should manage user preferences', () => {
      const preferences = {
        theme: 'dark' as const,
        language: 'hi' as const,
        defaultFilters: { phase: ['III'] },
        notifications: { email: true, push: false }
      };

      storageService.setUserPreferences(preferences);
      const retrieved = storageService.getUserPreferences();
      
      expect(retrieved.theme).toBe('dark');
      expect(retrieved.language).toBe('hi');
      expect(retrieved.defaultFilters.phase).toEqual(['III']);
    });

    it('should manage bookmarks', () => {
      const trialId = 'trial-001';
      
      expect(storageService.isBookmarked(trialId)).toBe(false);
      
      storageService.addBookmark(trialId);
      expect(storageService.isBookmarked(trialId)).toBe(true);
      expect(storageService.getBookmarkedTrials()).toContain(trialId);
      
      storageService.removeBookmark(trialId);
      expect(storageService.isBookmarked(trialId)).toBe(false);
    });

    it('should manage recent searches', () => {
      const searches = ['diabetes', 'cancer', 'hypertension'];
      
      searches.forEach(search => {
        storageService.addRecentSearch(search);
      });
      
      const recent = storageService.getRecentSearches();
      expect(recent).toEqual(['hypertension', 'cancer', 'diabetes']);
    });

    it('should manage search history', () => {
      storageService.addSearchHistory('diabetes', { phase: ['III'] }, 5);
      
      const history = storageService.getSearchHistory();
      expect(history.length).toBe(1);
      expect(history[0].query).toBe('diabetes');
      expect(history[0].resultCount).toBe(5);
    });

    it('should export and import user data', () => {
      // Set up some data
      storageService.addBookmark('trial-001');
      storageService.addRecentSearch('diabetes');
      storageService.setUserPreferences({ theme: 'dark' });
      
      // Export data
      const exported = storageService.exportUserData();
      
      expect(exported.bookmarks).toContain('trial-001');
      expect(exported.recentSearches).toContain('diabetes');
      expect(exported.preferences.theme).toBe('dark');
      
      // Clear and import
      storageService.clearAllData();
      storageService.importUserData(exported);
      
      expect(storageService.getBookmarkedTrials()).toContain('trial-001');
      expect(storageService.getRecentSearches()).toContain('diabetes');
      expect(storageService.getUserPreferences().theme).toBe('dark');
    });
  });

  describe('DemoService', () => {
    it('should initialize demo data', async () => {
      await demoService.initializeDemoData();
      
      const preferences = storageService.getUserPreferences();
      const bookmarks = storageService.getBookmarkedTrials();
      const searches = storageService.getRecentSearches();
      
      expect(preferences.theme).toBe('light');
      expect(bookmarks.length).toBeGreaterThan(0);
      expect(searches.length).toBeGreaterThan(0);
    });

    it('should provide demo statistics', () => {
      const stats = demoService.getDemoStatistics();
      
      expect(stats.totalTrials).toBeGreaterThan(0);
      expect(stats.activeTrials).toBeGreaterThan(0);
      expect(stats.medicalConditions).toBeGreaterThan(0);
      expect(stats.phases).toBeDefined();
      expect(stats.topConditions).toBeDefined();
    });

    it('should perform demo search', async () => {
      const results = await demoService.performDemoSearch('diabetes');
      
      expect(results.trials).toBeDefined();
      expect(results.totalCount).toBeGreaterThan(0);
      
      // Check that search was added to history
      const searches = storageService.getRecentSearches();
      expect(searches).toContain('diabetes');
    });

    it('should generate demo document', async () => {
      const document = await demoService.generateDemoDocument();
      
      expect(document.content).toBeDefined();
      expect(document.content.length).toBeGreaterThan(100);
      expect(document.citations).toBeDefined();
    });

    it('should provide featured trials', () => {
      const featured = demoService.getFeaturedTrials();
      
      expect(featured).toBeDefined();
      expect(featured.length).toBeGreaterThan(0);
      expect(featured.every(trial => trial !== undefined)).toBe(true);
    });
  });
});