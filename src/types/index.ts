// Core data types for the Clinical Trials Platform

export interface ClinicalTrial {
  id: string;
  ctriNumber: string;
  title: string;
  briefSummary: string;
  detailedDescription?: string;
  phase: 'I' | 'II' | 'III' | 'IV';
  studyType: string;
  recruitmentStatus:
    | 'recruiting'
    | 'not_yet_recruiting'
    | 'completed'
    | 'suspended';
  condition: string;
  intervention: string;
  inclusionCriteria: string[];
  exclusionCriteria: string[];
  primarySponsor: string;
  principalInvestigator: string;
  locations: TrialLocation[];
  contactInfo: ContactInfo;
  startDate: Date;
  completionDate?: Date;
  lastUpdated: Date;
}

export interface TrialLocation {
  hospital: string;
  city: string;
  state: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
}

export interface SearchFilters {
  condition?: string;
  phase?: string[];
  status?: string[];
  location?: {
    city: string;
    radius: number;
  };
  ageRange?: {
    min: number;
    max: number;
  };
  gender?: 'all' | 'male' | 'female';
}

export interface SearchRequest {
  query: string;
  filters: SearchFilters;
  pagination: {
    page: number;
    limit: number;
  };
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

export interface SearchResponse {
  trials: ClinicalTrial[];
  totalCount: number;
  facets: SearchFacets;
  suggestions?: string[];
}

export interface SearchFacets {
  phases: Array<{ value: string; count: number }>;
  statuses: Array<{ value: string; count: number }>;
  locations: Array<{ value: string; count: number }>;
  conditions: Array<{ value: string; count: number }>;
}

export interface DocumentGenerationRequest {
  trialIds: string[];
  researchQuestion: string;
  templateType:
    | 'literature_review'
    | 'trial_comparison'
    | 'patient_eligibility'
    | 'research_proposal';
  citationStyle: 'ama' | 'apa' | 'vancouver';
}

export interface DocumentGenerationResponse {
  documentId: string;
  content: string;
  citations: Citation[];
  metadata: {
    generatedAt: Date;
    wordCount: number;
    processingTime: number;
  };
}

export interface Citation {
  id: string;
  text: string;
  url?: string;
  type: 'trial' | 'publication' | 'guideline';
}

export interface UserLocation {
  lat: number;
  lng: number;
  city?: string;
  state?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: 'en' | 'hi';
  defaultFilters: SearchFilters;
  notifications: {
    email: boolean;
    push: boolean;
  };
}

export interface UIState {
  searchQuery: string;
  filters: SearchFilters;
  selectedTrials: string[];
  documentPanel: {
    isOpen: boolean;
    researchQuestion: string;
    generatedContent: string;
    isGenerating: boolean;
  };
  user: {
    location?: UserLocation;
    preferences: UserPreferences;
    recentSearches: string[];
    bookmarkedTrials: string[];
  };
}

// API Response types
export interface APIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export type SortOrder = 'asc' | 'desc';
export type TrialPhase = 'I' | 'II' | 'III' | 'IV';
export type RecruitmentStatus =
  | 'recruiting'
  | 'not_yet_recruiting'
  | 'completed'
  | 'suspended';

// Re-export styled component types
export * from './styled';
