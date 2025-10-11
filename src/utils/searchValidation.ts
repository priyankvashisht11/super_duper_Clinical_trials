// Search validation utilities for the clinical trials platform

export interface SearchValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
}

// Common medical terms and abbreviations
const MEDICAL_TERMS = [
    'diabetes', 'hypertension', 'cancer', 'cardiovascular', 'oncology',
    'cardiology', 'neurology', 'psychiatry', 'dermatology', 'gastroenterology',
    'pulmonology', 'nephrology', 'endocrinology', 'rheumatology', 'hematology',
    'immunology', 'infectious', 'orthopedic', 'ophthalmology', 'otolaryngology',
    'urology', 'gynecology', 'pediatrics', 'geriatrics', 'anesthesiology',
    'radiology', 'pathology', 'emergency', 'family medicine', 'internal medicine'
];

// Clinical trial phases
const TRIAL_PHASES = ['phase i', 'phase ii', 'phase iii', 'phase iv', 'phase 1', 'phase 2', 'phase 3', 'phase 4'];

// Common locations in India
const INDIAN_CITIES = [
    'mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune',
    'ahmedabad', 'jaipur', 'lucknow', 'kanpur', 'nagpur', 'indore', 'thane',
    'bhopal', 'visakhapatnam', 'pimpri', 'patna', 'vadodara', 'ghaziabad',
    'ludhiana', 'agra', 'nashik', 'faridabad', 'meerut', 'rajkot', 'kalyan',
    'vasai', 'varanasi', 'srinagar', 'aurangabad', 'dhanbad', 'amritsar',
    'navi mumbai', 'allahabad', 'ranchi', 'howrah', 'coimbatore', 'jabalpur'
];

// Recruitment status terms
const RECRUITMENT_STATUS = [
    'recruiting', 'not yet recruiting', 'active', 'completed', 'terminated',
    'suspended', 'withdrawn', 'enrolling', 'closed'
];

/**
 * Validates a search query for clinical trials
 */
export function validateSearchQuery(query: string): SearchValidationResult {
    const result: SearchValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: []
    };

    if (!query || query.trim().length === 0) {
        result.isValid = false;
        result.errors.push('Search query cannot be empty');
        return result;
    }

    const normalizedQuery = query.toLowerCase().trim();

    // Check minimum length
    if (normalizedQuery.length < 2) {
        result.isValid = false;
        result.errors.push('Search query must be at least 2 characters long');
        return result;
    }

    // Check maximum length
    if (normalizedQuery.length > 200) {
        result.isValid = false;
        result.errors.push('Search query is too long (maximum 200 characters)');
        return result;
    }

    // Check for potentially harmful characters
    const dangerousChars = /[<>{}[\]\\]/;
    if (dangerousChars.test(query)) {
        result.warnings.push('Special characters may affect search results');
    }

    // Suggest medical terms if none found
    const hasMedicalTerm = MEDICAL_TERMS.some(term =>
        normalizedQuery.includes(term)
    );

    if (!hasMedicalTerm && normalizedQuery.length > 3) {
        result.suggestions.push('Consider including a medical condition or specialty');
    }

    // Suggest phase if not specified
    const hasPhase = TRIAL_PHASES.some(phase =>
        normalizedQuery.includes(phase)
    );

    if (!hasPhase) {
        result.suggestions.push('Add trial phase (e.g., "Phase III") to narrow results');
    }

    // Suggest location if not specified
    const hasLocation = INDIAN_CITIES.some(city =>
        normalizedQuery.includes(city)
    );

    if (!hasLocation) {
        result.suggestions.push('Include a city name to find local trials');
    }

    return result;
}

/**
 * Extracts structured information from a search query
 */
export interface ExtractedSearchInfo {
    medicalTerms: string[];
    phases: string[];
    locations: string[];
    recruitmentStatus: string[];
    otherTerms: string[];
}

export function extractSearchInfo(query: string): ExtractedSearchInfo {
    const normalizedQuery = query.toLowerCase();
    const words = normalizedQuery.split(/\s+/);

    const info: ExtractedSearchInfo = {
        medicalTerms: [],
        phases: [],
        locations: [],
        recruitmentStatus: [],
        otherTerms: []
    };

    // Extract medical terms
    MEDICAL_TERMS.forEach(term => {
        if (normalizedQuery.includes(term)) {
            info.medicalTerms.push(term);
        }
    });

    // Extract phases
    TRIAL_PHASES.forEach(phase => {
        if (normalizedQuery.includes(phase)) {
            info.phases.push(phase);
        }
    });

    // Extract locations
    INDIAN_CITIES.forEach(city => {
        if (normalizedQuery.includes(city)) {
            info.locations.push(city);
        }
    });

    // Extract recruitment status
    RECRUITMENT_STATUS.forEach(status => {
        if (normalizedQuery.includes(status)) {
            info.recruitmentStatus.push(status);
        }
    });

    // Extract other terms
    words.forEach(word => {
        if (word.length > 2 &&
            !info.medicalTerms.some(term => term.includes(word)) &&
            !info.phases.some(phase => phase.includes(word)) &&
            !info.locations.some(city => city.includes(word)) &&
            !info.recruitmentStatus.some(status => status.includes(word))) {
            info.otherTerms.push(word);
        }
    });

    return info;
}

/**
 * Generates search suggestions based on partial input
 */
export function generateSearchSuggestions(partialQuery: string): string[] {
    const normalizedQuery = partialQuery.toLowerCase().trim();

    if (normalizedQuery.length < 2) {
        return [];
    }

    const suggestions: string[] = [];

    // Medical term suggestions
    MEDICAL_TERMS.forEach(term => {
        if (term.startsWith(normalizedQuery) || term.includes(normalizedQuery)) {
            suggestions.push(term);
        }
    });

    // Location suggestions
    INDIAN_CITIES.forEach(city => {
        if (city.startsWith(normalizedQuery)) {
            suggestions.push(city);
        }
    });

    // Phase suggestions
    if (normalizedQuery.includes('phase') || normalizedQuery.includes('ph')) {
        TRIAL_PHASES.forEach(phase => {
            if (phase.includes(normalizedQuery)) {
                suggestions.push(phase);
            }
        });
    }

    // Limit suggestions
    return suggestions.slice(0, 10);
}

/**
 * Formats a search query for better readability
 */
export function formatSearchQuery(query: string): string {
    return query
        .trim()
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
}

/**
 * Checks if a search query is likely to return results
 */
export function isQueryLikelyToHaveResults(query: string): boolean {
    const info = extractSearchInfo(query);

    // Query is likely to have results if it contains medical terms or is reasonably specific
    return info.medicalTerms.length > 0 ||
        info.phases.length > 0 ||
        info.locations.length > 0 ||
        query.trim().length > 5;
}