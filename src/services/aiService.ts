const API_BASE_URL = 'http://localhost:3001/api';

export interface AIAssistanceResponse {
  content: string;
  suggestions: string[];
  citations?: string[];
}

export interface AIContentGenerationResponse {
  content: string;
  recommendations: string[];
}

export interface AIValidationResponse {
  score: number;
  issues: Array<{
    severity: 'high' | 'medium' | 'low';
    message: string;
    suggestion: string;
  }>;
  improvements: string[];
}

export interface AIResearchResponse {
  summary: string;
  keyFindings: string[];
  references: string[];
  relatedTopics: string[];
}

export interface AIFormSuggestionsResponse {
  suggestions: string[];
  explanation: string;
}

export interface AIProtocolAnalysisResponse {
  overallScore: number;
  sectionAnalysis: Array<{
    section: string;
    score: number;
    issues: Array<{
      severity: 'high' | 'medium' | 'low';
      message: string;
      suggestion: string;
    }>;
    improvements: string[];
  }>;
  completedSections: number;
  totalSections: number;
}

class AIService {
  private async makeRequest<T>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error(`AI Service Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Get AI assistance for any protocol section
  async getSectionAssistance(
    sectionName: string,
    currentContent: any,
    userQuery: string,
    context?: any
  ): Promise<AIAssistanceResponse> {
    return this.makeRequest<AIAssistanceResponse>('section-assistance', {
      sectionName,
      currentContent,
      userQuery,
      context,
    });
  }

  // Generate content for protocol sections
  async generateSectionContent(
    sectionName: string,
    parameters: any,
    templateType?: string
  ): Promise<AIContentGenerationResponse> {
    return this.makeRequest<AIContentGenerationResponse>('generate-content', {
      sectionName,
      parameters,
      templateType,
    });
  }

  // Validate and get improvement suggestions
  async validateAndImprove(
    sectionName: string,
    content: any,
    protocolContext?: any
  ): Promise<AIValidationResponse> {
    return this.makeRequest<AIValidationResponse>('validate-improve', {
      sectionName,
      content,
      protocolContext,
    });
  }

  // Get research assistance
  async getResearchAssistance(
    topic: string,
    context?: string
  ): Promise<AIResearchResponse> {
    return this.makeRequest<AIResearchResponse>('research-assistance', {
      topic,
      context,
    });
  }

  // Get form completion suggestions
  async getFormCompletionSuggestions(
    sectionName: string,
    fieldName: string,
    currentValue: string,
    protocolContext: any
  ): Promise<AIFormSuggestionsResponse> {
    return this.makeRequest<AIFormSuggestionsResponse>('form-suggestions', {
      sectionName,
      fieldName,
      currentValue,
      protocolContext,
    });
  }

  // Analyze entire protocol
  async analyzeProtocol(protocolData: any): Promise<AIProtocolAnalysisResponse> {
    return this.makeRequest<AIProtocolAnalysisResponse>('analyze-protocol', {
      protocolData,
    });
  }
}

export const aiService = new AIService();