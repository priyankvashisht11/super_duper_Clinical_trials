import { 
  ClinicalTrial, 
  SearchRequest, 
  SearchResponse, 
  SearchFilters, 
  SearchFacets 
} from '../types';
import { allSampleTrials } from '../data/sampleTrials';
import { medicalConditions } from '../data/medicalConditions';

// Mock search service with comprehensive filtering and sorting
export class SearchService {
  private trials: ClinicalTrial[] = allSampleTrials;

  /**
   * Main search function with filtering, sorting, and pagination
   */
  async searchTrials(request: SearchRequest): Promise<SearchResponse> {
    // Simulate API delay
    await this.delay(300);

    let filteredTrials = [...this.trials];

    // Apply text search
    if (request.query.trim()) {
      filteredTrials = this.applyTextSearch(filteredTrials, request.query);
    }

    // Apply filters
    filteredTrials = this.applyFilters(filteredTrials, request.filters);

    // Apply sorting
    if (request.sort) {
      filteredTrials = this.applySorting(filteredTrials, request.sort);
    }

    // Calculate facets before pagination
    const facets = this.calculateFacets(filteredTrials);

    // Apply pagination
    const totalCount = filteredTrials.length;
    const startIndex = (request.pagination.page - 1) * request.pagination.limit;
    const endIndex = startIndex + request.pagination.limit;
    const paginatedTrials = filteredTrials.slice(startIndex, endIndex);

    // Generate search suggestions
    const suggestions = this.generateSuggestions(request.query);

    return {
      trials: paginatedTrials,
      totalCount,
      facets,
      suggestions
    };
  }

  /**
   * Get autocomplete suggestions for search
   */
  async getAutocompleteSuggestions(query: string): Promise<string[]> {
    await this.delay(100);

    if (!query || query.length < 2) {
      return [];
    }

    const suggestions = new Set<string>();
    const queryLower = query.toLowerCase();

    // Search in medical conditions
    medicalConditions.forEach(condition => {
      if (condition.name.toLowerCase().includes(queryLower)) {
        suggestions.add(condition.name);
      }
      condition.synonyms?.forEach(synonym => {
        if (synonym.toLowerCase().includes(queryLower)) {
          suggestions.add(condition.name);
        }
      });
    });

    // Search in trial titles and conditions
    this.trials.forEach(trial => {
      if (trial.title.toLowerCase().includes(queryLower)) {
        suggestions.add(trial.condition);
      }
      if (trial.condition.toLowerCase().includes(queryLower)) {
        suggestions.add(trial.condition);
      }
    });

    // Add common search terms
    const commonTerms = [
      'diabetes', 'cancer', 'hypertension', 'depression', 'arthritis',
      'tuberculosis', 'asthma', 'heart disease', 'stroke', 'obesity'
    ];

    commonTerms.forEach(term => {
      if (term.includes(queryLower)) {
        suggestions.add(term.charAt(0).toUpperCase() + term.slice(1));
      }
    });

    return Array.from(suggestions).slice(0, 8);
  }

  /**
   * Get trial by ID
   */
  async getTrialById(id: string): Promise<ClinicalTrial | null> {
    await this.delay(100);
    return this.trials.find(trial => trial.id === id) || null;
  }

  /**
   * Get trials by IDs (for document generation)
   */
  async getTrialsByIds(ids: string[]): Promise<ClinicalTrial[]> {
    await this.delay(150);
    return this.trials.filter(trial => ids.includes(trial.id));
  }

  /**
   * Get similar trials based on condition
   */
  async getSimilarTrials(trialId: string, limit: number = 5): Promise<ClinicalTrial[]> {
    await this.delay(200);
    
    const trial = await this.getTrialById(trialId);
    if (!trial) return [];

    return this.trials
      .filter(t => t.id !== trialId && t.condition === trial.condition)
      .slice(0, limit);
  }

  // Private helper methods

  private applyTextSearch(trials: ClinicalTrial[], query: string): ClinicalTrial[] {
    const queryLower = query.toLowerCase();
    const searchTerms = queryLower.split(' ').filter(term => term.length > 0);

    return trials.filter(trial => {
      const searchableText = [
        trial.title,
        trial.briefSummary,
        trial.condition,
        trial.intervention,
        trial.primarySponsor,
        trial.principalInvestigator,
        ...trial.locations.map(loc => `${loc.city} ${loc.state}`),
        ...trial.inclusionCriteria,
        trial.ctriNumber
      ].join(' ').toLowerCase();

      return searchTerms.every(term => searchableText.includes(term));
    });
  }

  private applyFilters(trials: ClinicalTrial[], filters: SearchFilters): ClinicalTrial[] {
    let filtered = [...trials];

    // Filter by condition
    if (filters.condition) {
      const conditionLower = filters.condition.toLowerCase();
      filtered = filtered.filter(trial => 
        trial.condition.toLowerCase().includes(conditionLower)
      );
    }

    // Filter by phase
    if (filters.phase && filters.phase.length > 0) {
      filtered = filtered.filter(trial => 
        filters.phase!.includes(trial.phase)
      );
    }

    // Filter by recruitment status
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(trial => 
        filters.status!.includes(trial.recruitmentStatus)
      );
    }

    // Filter by location
    if (filters.location?.city) {
      const cityLower = filters.location.city.toLowerCase();
      filtered = filtered.filter(trial =>
        trial.locations.some(loc => 
          loc.city.toLowerCase().includes(cityLower) ||
          loc.state.toLowerCase().includes(cityLower)
        )
      );
    }

    // Filter by age range
    if (filters.ageRange) {
      // This is a simplified age filter - in reality, would need to parse inclusion criteria
      filtered = filtered.filter(trial => {
        const hasAgeInclusion = trial.inclusionCriteria.some(criteria => 
          criteria.toLowerCase().includes('age') || 
          criteria.toLowerCase().includes('years')
        );
        return hasAgeInclusion; // Simplified logic
      });
    }

    // Filter by gender
    if (filters.gender && filters.gender !== 'all') {
      // Simplified gender filtering based on inclusion criteria
      filtered = filtered.filter(trial => {
        const criteriaText = trial.inclusionCriteria.join(' ').toLowerCase();
        if (filters.gender === 'male') {
          return !criteriaText.includes('female') || criteriaText.includes('both');
        }
        if (filters.gender === 'female') {
          return !criteriaText.includes('male') || criteriaText.includes('both');
        }
        return true;
      });
    }

    return filtered;
  }

  private applySorting(trials: ClinicalTrial[], sort: { field: string; order: 'asc' | 'desc' }): ClinicalTrial[] {
    const sorted = [...trials];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sort.field) {
        case 'relevance':
          // For demo purposes, use last updated date as relevance
          comparison = b.lastUpdated.getTime() - a.lastUpdated.getTime();
          break;
        case 'date':
          comparison = b.startDate.getTime() - a.startDate.getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'phase': {
          const phaseOrder = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4 };
          comparison = phaseOrder[a.phase] - phaseOrder[b.phase];
          break;
        }
        case 'status': {
          const statusOrder = { 
            'recruiting': 1, 
            'not_yet_recruiting': 2, 
            'completed': 3, 
            'suspended': 4 
          };
          comparison = statusOrder[a.recruitmentStatus] - statusOrder[b.recruitmentStatus];
          break;
        }
        default:
          comparison = 0;
      }

      return sort.order === 'desc' ? -comparison : comparison;
    });

    return sorted;
  }

  private calculateFacets(trials: ClinicalTrial[]): SearchFacets {
    const phases = new Map<string, number>();
    const statuses = new Map<string, number>();
    const locations = new Map<string, number>();
    const conditions = new Map<string, number>();

    trials.forEach(trial => {
      // Count phases
      phases.set(trial.phase, (phases.get(trial.phase) || 0) + 1);

      // Count statuses
      statuses.set(trial.recruitmentStatus, (statuses.get(trial.recruitmentStatus) || 0) + 1);

      // Count locations (cities)
      trial.locations.forEach(location => {
        const cityState = `${location.city}, ${location.state}`;
        locations.set(cityState, (locations.get(cityState) || 0) + 1);
      });

      // Count conditions
      conditions.set(trial.condition, (conditions.get(trial.condition) || 0) + 1);
    });

    return {
      phases: Array.from(phases.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count),
      statuses: Array.from(statuses.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count),
      locations: Array.from(locations.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10), // Top 10 locations
      conditions: Array.from(conditions.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10) // Top 10 conditions
    };
  }

  private generateSuggestions(query: string): string[] {
    if (!query || query.length < 2) {
      return [
        'diabetes type 2',
        'breast cancer',
        'hypertension',
        'depression',
        'tuberculosis'
      ];
    }

    const queryLower = query.toLowerCase();
    const suggestions: string[] = [];

    // Find related conditions
    medicalConditions.forEach(condition => {
      if (condition.name.toLowerCase().includes(queryLower)) {
        suggestions.push(condition.name);
      }
    });

    // Add phase-specific suggestions
    if (queryLower.includes('phase')) {
      suggestions.push(`${query} Phase III`, `${query} Phase II`);
    }

    // Add location-specific suggestions
    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'];
    cities.forEach(city => {
      if (city.toLowerCase().includes(queryLower)) {
        suggestions.push(`${query} ${city}`);
      }
    });

    return suggestions.slice(0, 5);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const searchService = new SearchService();