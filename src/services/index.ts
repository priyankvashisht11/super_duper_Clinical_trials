// Service exports
export { searchService, SearchService } from './searchService';
export { documentService, DocumentService } from './documentService';
export { storageService, StorageService } from './storageService';
export { demoService, DemoService } from './demoService';
export { protocolService } from './protocolService';
export { aiService } from './aiService';

// Re-export types from storage service
export type {
  SearchHistoryItem,
  DocumentDraft,
  FilterPreset,
  AppSettings,
  UserDataExport,
  StorageStats
} from './storageService';

// Re-export types from protocol service
export type {
  Protocol,
  ProtocolSection,
  Objective,
  EligibilityCriterion,
  Intervention,
  CreateProtocolInput
} from './protocolService';
