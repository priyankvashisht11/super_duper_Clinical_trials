import axios from 'axios';

interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PerplexityRequest {
  model: string;
  messages: PerplexityMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  return_citations?: boolean;
  search_domain_filter?: string[];
  return_images?: boolean;
  return_related_questions?: boolean;
  search_recency_filter?: string;
  top_k?: number;
  stream?: boolean;
  presence_penalty?: number;
  frequency_penalty?: number;
}

interface PerplexityResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
    delta?: {
      role?: string;
      content?: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  citations?: string[];
  related_questions?: string[];
}

export class AIService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY || '';
    this.apiUrl = process.env.PERPLEXITY_API_URL || 'https://api.perplexity.ai/chat/completions';
    
    if (!this.apiKey) {
      throw new Error('PERPLEXITY_API_KEY is required');
    }
  }

  private async makeRequest(request: PerplexityRequest): Promise<PerplexityResponse> {
    try {
      const response = await axios.post(this.apiUrl, request, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      });

      return response.data;
    } catch (error) {
      console.error('Perplexity API Error:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(`AI Service Error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw new Error('AI Service Error: Unknown error occurred');
    }
  }

  // Generic AI assistance for any protocol section
  async getProtocolSectionAssistance(
    sectionName: string,
    currentContent: any,
    userQuery: string,
    context?: any
  ): Promise<{ content: string; suggestions: string[]; citations?: string[] }> {
    const systemPrompt = `You are an expert clinical research AI assistant specializing in ICH M11 protocol development. 
    You help researchers create high-quality, regulatory-compliant clinical trial protocols for ANY disease or medical condition.
    
    Current section: ${sectionName}
    
    CRITICAL RULES:
    1. NEVER use placeholder diseases or hardcoded examples unless explicitly mentioned in the user's context
    2. ALWAYS analyze the user's protocol context to understand their specific disease/condition
    3. If the user mentions a disease anywhere in their protocol, use that disease in your suggestions
    4. Provide specific, actionable guidance that follows ICH M11 guidelines
    5. Focus on practical, implementable suggestions that improve protocol quality
    6. Always consider regulatory compliance, scientific rigor, and patient safety
    7. Be concise - provide only what was asked for, no extra explanations
    8. For indication fields: respond with ONLY the indication text, nothing else
    9. For title fields: respond with ONLY the complete title, nothing else
    
    Your suggestions must be universally applicable to ANY therapeutic area:
    - Oncology (all cancer types)
    - Cardiology (heart diseases)
    - Neurology (brain/nervous system)
    - Endocrinology (diabetes, thyroid, etc.)
    - Immunology (autoimmune diseases)
    - Infectious diseases (viral, bacterial, fungal)
    - Rare diseases
    - Genetic disorders
    - And ANY other medical condition`;

    const userPrompt = `Section: ${sectionName}
    Current content: ${JSON.stringify(currentContent, null, 2)}
    Full protocol context: ${JSON.stringify(context, null, 2)}
    
    User request: ${userQuery}
    
    ANALYZE THE CONTEXT CAREFULLY:
    - Look for any disease/condition mentions in the protocol context
    - Check the trial phase to understand study objectives
    - Consider the study type and design
    - Use the ACTUAL disease mentioned, not generic examples
    
    Provide your response following the user's specific request.
    Be concise and specific. Do not add explanations unless asked.`;

    const response = await this.makeRequest({
      model: 'sonar-pro',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.2,
      return_citations: true,
      return_related_questions: false,
      search_domain_filter: ['clinicaltrials.gov', 'fda.gov', 'ema.europa.eu', 'ich.org', 'who.int', 'nih.gov']
    });

    const content = response.choices[0]?.message?.content || '';
    const suggestions = response.related_questions || [];
    const citations = response.citations || [];

    return { content, suggestions, citations };
  }

  // Smart content generation for protocol sections
  async generateSectionContent(
    sectionName: string,
    parameters: any,
    templateType?: string
  ): Promise<{ content: string; recommendations: string[] }> {
    const systemPrompt = `You are an expert clinical research protocol writer specializing in ICH M11 compliant protocols.
    Generate high-quality, regulatory-compliant content for clinical trial protocols.
    
    Section: ${sectionName}
    Template type: ${templateType || 'Standard'}
    
    Follow ICH M11 guidelines and current regulatory standards.
    Ensure content is scientifically accurate, comprehensive, and professionally written.`;

    const userPrompt = `Generate content for ${sectionName} section with these parameters:
    ${JSON.stringify(parameters, null, 2)}
    
    Requirements:
    1. Follow ICH M11 structure and requirements
    2. Include all mandatory elements for this section
    3. Use professional medical/scientific language
    4. Ensure regulatory compliance
    5. Provide specific, actionable content (not generic placeholders)`;

    const response = await this.makeRequest({
      model: 'sonar-pro',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 3000,
      temperature: 0.4,
      return_citations: true,
      search_domain_filter: ['clinicaltrials.gov', 'fda.gov', 'ema.europa.eu', 'ich.org']
    });

    const content = response.choices[0]?.message?.content || '';
    const recommendations = response.related_questions || [];

    return { content, recommendations };
  }

  // Smart validation and improvement suggestions
  async validateAndImprove(
    sectionName: string,
    content: any,
    protocolContext?: any
  ): Promise<{ 
    score: number; 
    issues: Array<{ severity: 'high' | 'medium' | 'low'; message: string; suggestion: string }>;
    improvements: string[];
  }> {
    const systemPrompt = `You are an expert clinical research quality assurance AI specializing in protocol review.
    Analyze protocol sections for completeness, accuracy, and regulatory compliance.
    
    Provide detailed feedback on:
    1. ICH M11 compliance
    2. Scientific accuracy
    3. Regulatory requirements
    4. Best practices adherence
    5. Content quality and clarity`;

    const userPrompt = `Review this ${sectionName} section for quality and compliance:
    
    Content: ${JSON.stringify(content, null, 2)}
    Protocol context: ${JSON.stringify(protocolContext, null, 2)}
    
    Provide:
    1. Overall quality score (0-100)
    2. Specific issues with severity levels
    3. Improvement suggestions
    4. Regulatory compliance assessment`;

    const response = await this.makeRequest({
      model: 'sonar-pro',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 2000,
      temperature: 0.2,
      return_citations: true,
      search_domain_filter: ['clinicaltrials.gov', 'fda.gov', 'ema.europa.eu', 'ich.org']
    });

    const aiResponse = response.choices[0]?.message?.content || '';
    
    // Parse AI response to extract structured feedback
    // This is a simplified parser - in production, you'd want more robust parsing
    const scoreMatch = aiResponse.match(/score[:\s]*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 75;

    // Extract issues (simplified parsing)
    const issues = [
      { severity: 'medium' as const, message: 'Consider adding more specific details', suggestion: 'Include quantitative measures where possible' },
      { severity: 'low' as const, message: 'Review formatting consistency', suggestion: 'Ensure consistent terminology throughout' }
    ];

    const improvements = response.related_questions || [
      'Consider adding regulatory references',
      'Include more specific implementation details',
      'Review for consistency with other sections'
    ];

    return { score, issues, improvements };
  }

  // Research assistance - find relevant studies, guidelines, etc.
  async getResearchAssistance(
    topic: string,
    context?: string
  ): Promise<{ 
    summary: string; 
    keyFindings: string[]; 
    references: string[];
    relatedTopics: string[];
  }> {
    const systemPrompt = `You are a clinical research literature expert. 
    Provide comprehensive, evidence-based information on clinical research topics.
    Focus on recent developments, regulatory guidance, and best practices.`;

    const userPrompt = `Research topic: ${topic}
    Context: ${context || 'General clinical research'}
    
    Provide:
    1. Comprehensive summary of current knowledge
    2. Key findings and insights
    3. Relevant references and guidelines
    4. Related topics for further research`;

    const response = await this.makeRequest({
      model: 'sonar-pro',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 2500,
      temperature: 0.3,
      return_citations: true,
      return_related_questions: true,
      search_recency_filter: 'year',
      search_domain_filter: ['pubmed.ncbi.nlm.nih.gov', 'clinicaltrials.gov', 'fda.gov', 'ema.europa.eu']
    });

    const summary = response.choices[0]?.message?.content || '';
    const keyFindings = summary.split('\n').filter(line => line.trim().startsWith('•') || line.trim().startsWith('-')).slice(0, 5);
    const references = response.citations || [];
    const relatedTopics = response.related_questions || [];

    return { summary, keyFindings, references, relatedTopics };
  }

  // Smart form completion assistance
  async getFormCompletionSuggestions(
    sectionName: string,
    fieldName: string,
    currentValue: string,
    protocolContext: any
  ): Promise<{ suggestions: string[]; explanation: string }> {
    const systemPrompt = `You are an expert clinical research assistant helping with protocol form completion.
    Provide smart, contextually relevant suggestions for form fields based on best practices and regulatory requirements.`;

    const userPrompt = `Section: ${sectionName}
    Field: ${fieldName}
    Current value: "${currentValue}"
    Protocol context: ${JSON.stringify(protocolContext, null, 2)}
    
    Provide smart suggestions for completing this field, considering:
    1. ICH M11 requirements
    2. Regulatory best practices
    3. Protocol context and consistency
    4. Industry standards`;

    const response = await this.makeRequest({
      model: 'sonar-pro',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.4,
      return_related_questions: true
    });

    const content = response.choices[0]?.message?.content || '';
    const suggestions = response.related_questions || [];
    
    return { suggestions, explanation: content };
  }
}

export const aiService = new AIService();