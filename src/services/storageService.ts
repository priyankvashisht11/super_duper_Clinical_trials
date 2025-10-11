import { UserPreferences, SearchFilters, UserLocation } from '../types';

// Local storage service for user preferences and bookmarks
export class StorageService {
  private readonly STORAGE_KEYS = {
    USER_PREFERENCES: 'clinical_trials_user_preferences',
    BOOKMARKED_TRIALS: 'clinical_trials_bookmarks',
    RECENT_SEARCHES: 'clinical_trials_recent_searches',
    SEARCH_HISTORY: 'clinical_trials_search_history',
    USER_LOCATION: 'clinical_trials_user_location',
    DOCUMENT_DRAFTS: 'clinical_trials_document_drafts',
    FILTER_PRESETS: 'clinical_trials_filter_presets',
    APP_SETTINGS: 'clinical_trials_app_settings'
  };

  // User Preferences Management

  /**
   * Get user preferences with defaults
   */
  getUserPreferences(): UserPreferences {
    const stored = this.getItem(this.STORAGE_KEYS.USER_PREFERENCES);
    
    const defaultPreferences: UserPreferences = {
      theme: 'light',
      language: 'en',
      defaultFilters: {},
      notifications: {
        email: false,
        push: false
      }
    };

    return stored ? { ...defaultPreferences, ...stored } : defaultPreferences;
  }

  /**
   * Save user preferences
   */
  setUserPreferences(preferences: Partial<UserPreferences>): void {
    const current = this.getUserPreferences();
    const updated = { ...current, ...preferences };
    this.setItem(this.STORAGE_KEYS.USER_PREFERENCES, updated);
  }

  // Bookmarks Management

  /**
   * Get bookmarked trial IDs
   */
  getBookmarkedTrials(): string[] {
    return this.getItem(this.STORAGE_KEYS.BOOKMARKED_TRIALS) || [];
  }

  /**
   * Add trial to bookmarks
   */
  addBookmark(trialId: string): void {
    const bookmarks = this.getBookmarkedTrials();
    if (!bookmarks.includes(trialId)) {
      bookmarks.push(trialId);
      this.setItem(this.STORAGE_KEYS.BOOKMARKED_TRIALS, bookmarks);
    }
  }

  /**
   * Remove trial from bookmarks
   */
  removeBookmark(trialId: string): void {
    const bookmarks = this.getBookmarkedTrials();
    const filtered = bookmarks.filter(id => id !== trialId);
    this.setItem(this.STORAGE_KEYS.BOOKMARKED_TRIALS, filtered);
  }

  /**
   * Check if trial is bookmarked
   */
  isBookmarked(trialId: string): boolean {
    return this.getBookmarkedTrials().includes(trialId);
  }

  /**
   * Clear all bookmarks
   */
  clearBookmarks(): void {
    this.removeItem(this.STORAGE_KEYS.BOOKMARKED_TRIALS);
  }

  // Search History Management

  /**
   * Get recent search queries
   */
  getRecentSearches(): string[] {
    return this.getItem(this.STORAGE_KEYS.RECENT_SEARCHES) || [];
  }

  /**
   * Add search query to recent searches
   */
  addRecentSearch(query: string): void {
    if (!query.trim()) return;

    const recent = this.getRecentSearches();
    const filtered = recent.filter(q => q !== query);
    filtered.unshift(query);
    
    // Keep only last 10 searches
    const limited = filtered.slice(0, 10);
    this.setItem(this.STORAGE_KEYS.RECENT_SEARCHES, limited);
  }

  /**
   * Clear recent searches
   */
  clearRecentSearches(): void {
    this.removeItem(this.STORAGE_KEYS.RECENT_SEARCHES);
  }

  /**
   * Get detailed search history with filters and timestamps
   */
  getSearchHistory(): SearchHistoryItem[] {
    return this.getItem(this.STORAGE_KEYS.SEARCH_HISTORY) || [];
  }

  /**
   * Add search to detailed history
   */
  addSearchHistory(query: string, filters: SearchFilters, resultCount: number): void {
    const history = this.getSearchHistory();
    
    const historyItem: SearchHistoryItem = {
      id: Date.now().toString(),
      query,
      filters,
      resultCount,
      timestamp: new Date(),
      favorite: false
    };

    history.unshift(historyItem);
    
    // Keep only last 50 searches
    const limited = history.slice(0, 50);
    this.setItem(this.STORAGE_KEYS.SEARCH_HISTORY, limited);
  }

  /**
   * Toggle favorite status of search history item
   */
  toggleSearchHistoryFavorite(searchId: string): void {
    const history = this.getSearchHistory();
    const item = history.find(h => h.id === searchId);
    if (item) {
      item.favorite = !item.favorite;
      this.setItem(this.STORAGE_KEYS.SEARCH_HISTORY, history);
    }
  }

  /**
   * Get favorite searches
   */
  getFavoriteSearches(): SearchHistoryItem[] {
    return this.getSearchHistory().filter(item => item.favorite);
  }

  // User Location Management

  /**
   * Get user location
   */
  getUserLocation(): UserLocation | null {
    return this.getItem(this.STORAGE_KEYS.USER_LOCATION);
  }

  /**
   * Set user location
   */
  setUserLocation(location: UserLocation): void {
    this.setItem(this.STORAGE_KEYS.USER_LOCATION, location);
  }

  /**
   * Clear user location
   */
  clearUserLocation(): void {
    this.removeItem(this.STORAGE_KEYS.USER_LOCATION);
  }

  // Document Drafts Management

  /**
   * Get saved document drafts
   */
  getDocumentDrafts(): DocumentDraft[] {
    return this.getItem(this.STORAGE_KEYS.DOCUMENT_DRAFTS) || [];
  }

  /**
   * Save document draft
   */
  saveDocumentDraft(draft: Omit<DocumentDraft, 'id' | 'lastModified'>): string {
    const drafts = this.getDocumentDrafts();
    const draftId = Date.now().toString();
    
    const newDraft: DocumentDraft = {
      ...draft,
      id: draftId,
      lastModified: new Date()
    };

    drafts.unshift(newDraft);
    
    // Keep only last 20 drafts
    const limited = drafts.slice(0, 20);
    this.setItem(this.STORAGE_KEYS.DOCUMENT_DRAFTS, limited);
    
    return draftId;
  }

  /**
   * Update document draft
   */
  updateDocumentDraft(draftId: string, updates: Partial<DocumentDraft>): void {
    const drafts = this.getDocumentDrafts();
    const draftIndex = drafts.findIndex(d => d.id === draftId);
    
    if (draftIndex !== -1) {
      drafts[draftIndex] = {
        ...drafts[draftIndex],
        ...updates,
        lastModified: new Date()
      };
      this.setItem(this.STORAGE_KEYS.DOCUMENT_DRAFTS, drafts);
    }
  }

  /**
   * Delete document draft
   */
  deleteDocumentDraft(draftId: string): void {
    const drafts = this.getDocumentDrafts();
    const filtered = drafts.filter(d => d.id !== draftId);
    this.setItem(this.STORAGE_KEYS.DOCUMENT_DRAFTS, filtered);
  }

  // Filter Presets Management

  /**
   * Get saved filter presets
   */
  getFilterPresets(): FilterPreset[] {
    return this.getItem(this.STORAGE_KEYS.FILTER_PRESETS) || [];
  }

  /**
   * Save filter preset
   */
  saveFilterPreset(name: string, filters: SearchFilters): string {
    const presets = this.getFilterPresets();
    const presetId = Date.now().toString();
    
    const newPreset: FilterPreset = {
      id: presetId,
      name,
      filters,
      createdAt: new Date()
    };

    presets.push(newPreset);
    this.setItem(this.STORAGE_KEYS.FILTER_PRESETS, presets);
    
    return presetId;
  }

  /**
   * Delete filter preset
   */
  deleteFilterPreset(presetId: string): void {
    const presets = this.getFilterPresets();
    const filtered = presets.filter(p => p.id !== presetId);
    this.setItem(this.STORAGE_KEYS.FILTER_PRESETS, filtered);
  }

  // App Settings Management

  /**
   * Get app settings
   */
  getAppSettings(): AppSettings {
    const stored = this.getItem(this.STORAGE_KEYS.APP_SETTINGS);
    
    const defaultSettings: AppSettings = {
      autoSaveSearches: true,
      showSearchSuggestions: true,
      enableLocationServices: false,
      compactView: false,
      resultsPerPage: 10,
      defaultSortOrder: 'relevance',
      enableNotifications: false,
      autoBookmarkViewed: false
    };

    return stored ? { ...defaultSettings, ...stored } : defaultSettings;
  }

  /**
   * Update app settings
   */
  updateAppSettings(settings: Partial<AppSettings>): void {
    const current = this.getAppSettings();
    const updated = { ...current, ...settings };
    this.setItem(this.STORAGE_KEYS.APP_SETTINGS, updated);
  }

  // Data Management

  /**
   * Export all user data
   */
  exportUserData(): UserDataExport {
    return {
      preferences: this.getUserPreferences(),
      bookmarks: this.getBookmarkedTrials(),
      recentSearches: this.getRecentSearches(),
      searchHistory: this.getSearchHistory(),
      location: this.getUserLocation(),
      documentDrafts: this.getDocumentDrafts(),
      filterPresets: this.getFilterPresets(),
      appSettings: this.getAppSettings(),
      exportDate: new Date()
    };
  }

  /**
   * Import user data
   */
  importUserData(data: UserDataExport): void {
    if (data.preferences) this.setUserPreferences(data.preferences);
    if (data.bookmarks) this.setItem(this.STORAGE_KEYS.BOOKMARKED_TRIALS, data.bookmarks);
    if (data.recentSearches) this.setItem(this.STORAGE_KEYS.RECENT_SEARCHES, data.recentSearches);
    if (data.searchHistory) this.setItem(this.STORAGE_KEYS.SEARCH_HISTORY, data.searchHistory);
    if (data.location) this.setUserLocation(data.location);
    if (data.documentDrafts) this.setItem(this.STORAGE_KEYS.DOCUMENT_DRAFTS, data.documentDrafts);
    if (data.filterPresets) this.setItem(this.STORAGE_KEYS.FILTER_PRESETS, data.filterPresets);
    if (data.appSettings) this.updateAppSettings(data.appSettings);
  }

  /**
   * Clear all user data
   */
  clearAllData(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      this.removeItem(key);
    });
  }

  /**
   * Get storage usage statistics
   */
  getStorageStats(): StorageStats {
    const stats: StorageStats = {
      totalItems: 0,
      totalSize: 0,
      itemBreakdown: {}
    };

    Object.entries(this.STORAGE_KEYS).forEach(([name, key]) => {
      const item = localStorage.getItem(key);
      if (item) {
        stats.totalItems++;
        const size = new Blob([item]).size;
        stats.totalSize += size;
        stats.itemBreakdown[name] = {
          size,
          lastModified: new Date() // Approximation
        };
      }
    });

    return stats;
  }

  // Private helper methods

  private getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return null;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  }

  private removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }
}

// Type definitions for storage service

export interface SearchHistoryItem {
  id: string;
  query: string;
  filters: SearchFilters;
  resultCount: number;
  timestamp: Date;
  favorite: boolean;
}

export interface DocumentDraft {
  id: string;
  title: string;
  content: string;
  trialIds: string[];
  researchQuestion: string;
  templateType: string;
  lastModified: Date;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: SearchFilters;
  createdAt: Date;
}

export interface AppSettings {
  autoSaveSearches: boolean;
  showSearchSuggestions: boolean;
  enableLocationServices: boolean;
  compactView: boolean;
  resultsPerPage: number;
  defaultSortOrder: string;
  enableNotifications: boolean;
  autoBookmarkViewed: boolean;
}

export interface UserDataExport {
  preferences: UserPreferences;
  bookmarks: string[];
  recentSearches: string[];
  searchHistory: SearchHistoryItem[];
  location: UserLocation | null;
  documentDrafts: DocumentDraft[];
  filterPresets: FilterPreset[];
  appSettings: AppSettings;
  exportDate: Date;
}

export interface StorageStats {
  totalItems: number;
  totalSize: number;
  itemBreakdown: Record<string, {
    size: number;
    lastModified: Date;
  }>;
}

// Export singleton instance
export const storageService = new StorageService();