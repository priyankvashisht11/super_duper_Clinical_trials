// Service exports
export { searchService, SearchService } from './searchService';
export { documentService, DocumentService } from './documentService';
export { storageService, StorageService } from './storageService';
export { demoService, DemoService } from './demoService';

// Re-export types from storage service
export type {
  SearchHistoryItem,
  DocumentDraft,
  FilterPreset,
  AppSettings,
  UserDataExport,
  StorageStats
} from './storageService';
