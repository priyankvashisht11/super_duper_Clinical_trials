import axios from 'axios';

export class ResearchService {
  // Search ClinicalTrials.gov via their API with intelligent query optimization
  async searchClinicalTrials(query: string, filters: any) {
    try {
      const baseUrl = 'https://clinicaltrials.gov/api/v2/studies';
      
      // Try multiple query strategies for maximum coverage
      const queryStrategies = [
        query, // Direct query
        await this.optimizeQueryForClinicalTrials(query), // Medical term optimization
        this.expandSearchQuery(query) // Synonym expansion
      ];

      let allTrials: any[] = [];
      let totalCount = 0;

      // Try each query strategy and merge results
      for (const searchQuery of queryStrategies) {
        try {
          const params: any = {
            'query.term': searchQuery,
            pageSize: '200',
            format: 'json',
            'fields': 'NCTId,BriefTitle,OfficialTitle,OverallStatus,Phase,Condition,InterventionName,EnrollmentCount,LeadSponsorName,StartDate,BriefSummary,StudyType,DesignAllocation,DesignInterventionModel',
          };

          // Add phase filter - handle both array and string
          if (filters.phase) {
            if (Array.isArray(filters.phase) && filters.phase.length > 0 && filters.phase[0] !== 'all') {
              params['filter.phase'] = filters.phase[0];
            } else if (typeof filters.phase === 'string' && filters.phase !== 'all') {
              params['filter.phase'] = filters.phase;
            }
          }

          // Add status filter - handle both array and string
          if (filters.status) {
            if (Array.isArray(filters.status) && filters.status.length > 0 && filters.status[0] !== 'all') {
              params['filter.overallStatus'] = filters.status[0].toUpperCase().replace(/ /g, '_');
            } else if (typeof filters.status === 'string' && filters.status !== 'all') {
              params['filter.overallStatus'] = filters.status.toUpperCase().replace(/ /g, '_');
            }
          }

          const response = await axios.get(baseUrl, { 
            params,
            timeout: 15000
          });

          if (response.data.studies && response.data.studies.length > 0) {
            const formattedTrials = response.data.studies.map((study: any) => {
              try {
                const formatted = this.formatClinicalTrial(study);
                if (formatted) {
                  // Add relevance score based on query match
                  return {
                    ...formatted,
                    relevanceScore: this.calculateRelevanceScore(formatted, query),
                    queryStrategy: searchQuery === query ? 'direct' : 'expanded',
                  };
                }
                return formatted;
              } catch (error: any) {
                console.error(`Error formatting trial:`, error.message);
                return null;
              }
            }).filter(Boolean);

            allTrials.push(...formattedTrials);
            totalCount = Math.max(totalCount, response.data.totalCount || 0);
          }
        } catch (strategyError) {
          console.warn(`Query strategy failed: ${searchQuery}`, strategyError);
        }
      }

      // Remove duplicates based on NCT ID and sort by relevance
      const uniqueTrials = this.removeDuplicateTrials(allTrials);
      const sortedTrials = uniqueTrials.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

      console.log('ClinicalTrials.gov comprehensive search:', {
        totalStrategies: queryStrategies.length,
        totalTrials: allTrials.length,
        uniqueTrials: uniqueTrials.length,
        finalCount: sortedTrials.length
      });

      // If still no results, try Perplexity AI as intelligent fallback
      if (sortedTrials.length === 0) {
        console.log('No ClinicalTrials.gov results, trying Perplexity AI...');
        const perplexityTrials = await this.searchTrialsViaPerplexity(query);
        if (perplexityTrials.length > 0) {
          return { 
            source: 'Perplexity AI (Enhanced)', 
            count: perplexityTrials.length, 
            trials: perplexityTrials,
            note: 'Real-time AI-powered trial discovery'
          };
        }
      }

      return {
        source: 'ClinicalTrials.gov (Multi-Strategy)',
        count: totalCount,
        trials: sortedTrials.slice(0, 400), // Limit to 400 best results
        strategies: queryStrategies.length,
        coverage: 'comprehensive'
      };
    } catch (error: any) {
      console.error('ClinicalTrials.gov search error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      return { source: 'ClinicalTrials.gov', count: 0, trials: [], error: error.message };
    }
  }

  // Intelligently expand and optimize search query using AI
  private async expandSearchQueryWithAI(query: string): Promise<string> {
    try {
      const apiKey = process.env.PERPLEXITY_API_KEY;
      if (!apiKey) {
        return this.expandSearchQuery(query); // Fallback to basic expansion
      }

      const response = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model: 'sonar-pro',
          messages: [
            {
              role: 'system',
              content: `You are a medical search query optimizer. Extract key medical terms, conditions, interventions, and synonyms from user queries.
              
CRITICAL RULES:
1. Identify the PRIMARY medical condition/disease
2. Extract ALL medical synonyms and related terms
3. Include ICD codes, MeSH terms if applicable
4. Add intervention types (drug names, procedures, therapies)
5. Return ONLY the optimized search terms separated by OR
6. Be COMPREHENSIVE - include scientific names, common names, abbreviations

Example Input: "brain tumor treatment"
Example Output: brain tumor OR glioblastoma OR glioma OR astrocytoma OR CNS neoplasm OR brain cancer OR intracranial tumor OR cerebral tumor OR GBM OR brain neoplasm

Example Input: "diabetes medication"
Example Output: diabetes mellitus OR type 2 diabetes OR T2DM OR type 1 diabetes OR T1DM OR hyperglycemia OR diabetic OR diabetes treatment OR antidiabetic OR insulin OR metformin

DO NOT include explanations, just return the optimized query terms.`
            },
            {
              role: 'user',
              content: query
            }
          ],
          max_tokens: 200,
          temperature: 0.3,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      const expandedQuery = response.data.choices?.[0]?.message?.content?.trim() || query;
      console.log('AI-expanded query:', { original: query, expanded: expandedQuery });
      return expandedQuery;
    } catch (error) {
      console.error('AI query expansion failed, using fallback:', error);
      return this.expandSearchQuery(query); // Fallback to basic expansion
    }
  }

  // Optimize query specifically for ClinicalTrials.gov
  private async optimizeQueryForClinicalTrials(query: string): Promise<string> {
    try {
      const apiKey = process.env.PERPLEXITY_API_KEY;
      if (!apiKey) return this.expandSearchQuery(query);

      const response = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model: 'sonar-pro',
          messages: [
            {
              role: 'system',
              content: `Optimize search queries for ClinicalTrials.gov. Focus on:
1. Medical conditions and diseases
2. Drug names and interventions
3. Treatment modalities
4. Clinical trial terminology
Return ONLY the optimized search terms, no explanations.`
            },
            {
              role: 'user',
              content: `Optimize for clinical trials: ${query}`
            }
          ],
          max_tokens: 150,
          temperature: 0.2,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 8000,
        }
      );

      return response.data.choices?.[0]?.message?.content?.trim() || query;
    } catch (error) {
      return this.expandSearchQuery(query);
    }
  }

  // Optimize query specifically for PubMed
  private async optimizeQueryForPubMed(query: string): Promise<string> {
    try {
      const apiKey = process.env.PERPLEXITY_API_KEY;
      if (!apiKey) return this.expandSearchQuery(query);

      const response = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model: 'sonar-pro',
          messages: [
            {
              role: 'system',
              content: `Optimize search queries for PubMed research papers. Focus on:
1. MeSH terms and medical subject headings
2. Scientific terminology
3. Research methodologies
4. Publication types
Return ONLY the optimized search terms, no explanations.`
            },
            {
              role: 'user',
              content: `Optimize for PubMed: ${query}`
            }
          ],
          max_tokens: 150,
          temperature: 0.2,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 8000,
        }
      );

      return response.data.choices?.[0]?.message?.content?.trim() || query;
    } catch (error) {
      return this.expandSearchQuery(query);
    }
  }

  // Calculate relevance score for clinical trials
  private calculateRelevanceScore(trial: any, query: string): number {
    let score = 0;
    const queryLower = query.toLowerCase();
    const queryTerms = queryLower.split(/\s+/);

    // Title relevance (highest weight)
    if (trial.title) {
      const titleLower = trial.title.toLowerCase();
      queryTerms.forEach(term => {
        if (titleLower.includes(term)) score += 10;
      });
      if (titleLower.includes(queryLower)) score += 20;
    }

    // Condition relevance
    if (trial.condition) {
      const conditionLower = trial.condition.toLowerCase();
      queryTerms.forEach(term => {
        if (conditionLower.includes(term)) score += 8;
      });
    }

    // Intervention relevance
    if (trial.intervention) {
      const interventionLower = trial.intervention.toLowerCase();
      queryTerms.forEach(term => {
        if (interventionLower.includes(term)) score += 6;
      });
    }

    // Description relevance
    if (trial.description) {
      const descLower = trial.description.toLowerCase();
      queryTerms.forEach(term => {
        if (descLower.includes(term)) score += 3;
      });
    }

    // Status bonus (recruiting trials are more valuable)
    if (trial.status && trial.status.toLowerCase().includes('recruiting')) {
      score += 5;
    }

    // Phase bonus (later phases are more valuable)
    if (trial.phase) {
      const phase = trial.phase.toLowerCase();
      if (phase.includes('phase 3') || phase.includes('phase iii')) score += 4;
      else if (phase.includes('phase 2') || phase.includes('phase ii')) score += 3;
      else if (phase.includes('phase 1') || phase.includes('phase i')) score += 2;
    }

    return score;
  }

  // Calculate relevance score for research articles
  private calculateArticleRelevanceScore(article: any, query: string): number {
    let score = 0;
    const queryLower = query.toLowerCase();
    const queryTerms = queryLower.split(/\s+/);

    // Title relevance (highest weight)
    if (article.title) {
      const titleLower = article.title.toLowerCase();
      queryTerms.forEach(term => {
        if (titleLower.includes(term)) score += 10;
      });
      if (titleLower.includes(queryLower)) score += 20;
    }

    // Journal relevance (high-impact journals get bonus)
    if (article.journal) {
      const journalLower = article.journal.toLowerCase();
      const highImpactJournals = ['nature', 'science', 'cell', 'lancet', 'nejm', 'jama'];
      if (highImpactJournals.some(j => journalLower.includes(j))) {
        score += 8;
      }
    }

    // Recency bonus (newer articles are more valuable)
    if (article.year) {
      const currentYear = new Date().getFullYear();
      const articleYear = parseInt(article.year);
      const yearDiff = currentYear - articleYear;
      if (yearDiff <= 1) score += 6;
      else if (yearDiff <= 3) score += 4;
      else if (yearDiff <= 5) score += 2;
    }

    // Abstract relevance
    if (article.abstract) {
      const abstractLower = article.abstract.toLowerCase();
      queryTerms.forEach(term => {
        if (abstractLower.includes(term)) score += 3;
      });
    }

    return score;
  }

  // Remove duplicate trials based on NCT ID
  private removeDuplicateTrials(trials: any[]): any[] {
    const seen = new Set();
    return trials.filter(trial => {
      if (!trial || !trial.nctId) return false;
      if (seen.has(trial.nctId)) return false;
      seen.add(trial.nctId);
      return true;
    });
  }

  // Remove duplicate articles based on PMID
  private removeDuplicateArticles(articles: any[]): any[] {
    const seen = new Set();
    return articles.filter(article => {
      if (!article || !article.pmid) return false;
      if (seen.has(article.pmid)) return false;
      seen.add(article.pmid);
      return true;
    });
  }

  // Expand search query with medical synonyms and related terms (fallback)
  private expandSearchQuery(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    // Common medical term expansions
    const expansions: { [key: string]: string[] } = {
      'diabetes': ['diabetes mellitus', 'type 2 diabetes', 'type 1 diabetes', 'diabetic', 'hyperglycemia'],
      'cancer': ['carcinoma', 'tumor', 'malignancy', 'neoplasm', 'oncology'],
      'heart': ['cardiac', 'cardiovascular', 'coronary', 'myocardial'],
      'kidney': ['renal', 'nephrology', 'nephropathy'],
      'liver': ['hepatic', 'hepatology', 'cirrhosis'],
      'lung': ['pulmonary', 'respiratory', 'pneumonia'],
      'brain': ['cerebral', 'neurological', 'cognitive'],
      'blood': ['hematology', 'hematological', 'anemia'],
      'immune': ['immunology', 'immunotherapy', 'autoimmune'],
      'covid': ['covid-19', 'coronavirus', 'sars-cov-2', 'pandemic'],
    };

    let expandedTerms = [query];
    
    for (const [key, synonyms] of Object.entries(expansions)) {
      if (lowerQuery.includes(key)) {
        expandedTerms.push(...synonyms);
      }
    }

    // Return original query with OR expansions (limited to avoid too long queries)
    if (expandedTerms.length > 1) {
      return expandedTerms.slice(0, 4).join(' OR ');
    }
    
    return query;
  }

  // Search trials via Perplexity AI for real-time discovery with enhanced parsing
  private async searchTrialsViaPerplexity(query: string): Promise<any[]> {
    try {
      const apiKey = process.env.PERPLEXITY_API_KEY;
      if (!apiKey) return [];

      const response = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model: 'sonar-pro',
          messages: [
            {
              role: 'system',
              content: `You are a clinical trials research assistant. Find and extract detailed information about clinical trials.

CRITICAL FORMATTING RULES:
For each trial, provide information in this EXACT format:

TRIAL: [NCT ID if available, or generate unique ID]
TITLE: [Full official trial title]
STATUS: [Current recruitment status]
PHASE: [Trial phase]
CONDITION: [Primary condition being studied]
INTERVENTION: [Primary intervention/treatment]
SPONSOR: [Lead sponsor organization]
ENROLLMENT: [Target enrollment number]
DESCRIPTION: [Brief description of the trial]
---

Find up to 15 recent clinical trials related to the query. Focus on:
1. Active or recently completed trials
2. Trials from major medical centers
3. Trials with clear NCT IDs when possible
4. Diverse range of interventions and phases

Be specific and accurate. If NCT ID is not available, create a unique identifier like "AI-TRIAL-001".`
            },
            {
              role: 'user',
              content: `Find clinical trials for: ${query}`
            }
          ],
          max_tokens: 2000,
          temperature: 0.3,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 20000,
        }
      );

      const content = response.data.choices?.[0]?.message?.content || '';
      return this.parseEnhancedPerplexityTrials(content, query);
    } catch (error) {
      console.error('Perplexity trials search failed:', error);
      return [];
    }
  }

  // Enhanced parsing for Perplexity trial responses
  private parseEnhancedPerplexityTrials(content: string, query: string): any[] {
    const trials: any[] = [];
    const trialBlocks = content.split('---').filter(block => block.trim());

    trialBlocks.forEach((block, index) => {
      const lines = block.split('\n').map(line => line.trim()).filter(line => line);
      const trial: any = {
        source: 'Perplexity AI',
        relevanceScore: 50, // Base score for AI-discovered trials
        queryStrategy: 'ai-discovery'
      };

      lines.forEach(line => {
        if (line.startsWith('TRIAL:')) {
          trial.nctId = line.replace('TRIAL:', '').trim() || `AI-TRIAL-${Date.now()}-${index}`;
        } else if (line.startsWith('TITLE:')) {
          trial.title = line.replace('TITLE:', '').trim();
        } else if (line.startsWith('STATUS:')) {
          trial.status = line.replace('STATUS:', '').trim();
        } else if (line.startsWith('PHASE:')) {
          trial.phase = line.replace('PHASE:', '').trim();
        } else if (line.startsWith('CONDITION:')) {
          trial.condition = line.replace('CONDITION:', '').trim();
        } else if (line.startsWith('INTERVENTION:')) {
          trial.intervention = line.replace('INTERVENTION:', '').trim();
        } else if (line.startsWith('SPONSOR:')) {
          trial.sponsor = line.replace('SPONSOR:', '').trim();
        } else if (line.startsWith('ENROLLMENT:')) {
          const enrollmentStr = line.replace('ENROLLMENT:', '').trim();
          trial.enrollment = parseInt(enrollmentStr.replace(/[^\d]/g, '')) || 0;
        } else if (line.startsWith('DESCRIPTION:')) {
          trial.description = line.replace('DESCRIPTION:', '').trim();
        }
      });

      // Set defaults for missing fields
      trial.title = trial.title || `Clinical Trial for ${query}`;
      trial.status = trial.status || 'Unknown';
      trial.phase = trial.phase || 'Not Specified';
      trial.condition = trial.condition || query;
      trial.intervention = trial.intervention || 'See details';
      trial.sponsor = trial.sponsor || 'Various';
      trial.enrollment = trial.enrollment || 0;
      trial.description = trial.description || 'Real-time data from Perplexity AI';
      trial.startDate = null;

      // Calculate relevance score
      trial.relevanceScore = this.calculateRelevanceScore(trial, query);

      if (trial.nctId && trial.title) {
        trials.push(trial);
      }
    });

    return trials.slice(0, 20);
  }

  // Parse Perplexity AI response to extract trial data (fallback method)
  private parsePerplexityTrials(content: string): any[] {
    const trials: any[] = [];
    
    // Look for NCT IDs in the content
    const nctMatches = content.match(/NCT\d{8}/g);
    if (!nctMatches) return trials;

    // Extract trial information around each NCT ID
    nctMatches.forEach(nctId => {
      const trial = {
        nctId,
        title: `Trial ${nctId} (from Perplexity AI)`,
        status: 'Unknown',
        phase: 'Not Specified',
        condition: 'See details',
        intervention: 'See details',
        enrollment: 0,
        sponsor: 'Various',
        startDate: null,
        description: 'Real-time data from Perplexity AI',
        source: 'Perplexity AI'
      };
      trials.push(trial);
    });

    return trials.slice(0, 20); // Limit to 20 trials
  }

  // Search PubMed via NCBI E-utilities API with comprehensive strategies
  async searchPubMed(query: string) {
    try {
      const searchUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
      const fetchUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi';
      
      // Try multiple search strategies for maximum coverage
      const searchStrategies = [
        { term: query, label: 'direct' },
        { term: await this.optimizeQueryForPubMed(query), label: 'optimized' },
        { term: this.expandSearchQuery(query), label: 'expanded' },
        { term: `${query}[Title/Abstract]`, label: 'title-abstract' },
        { term: `${query} AND clinical trial[Publication Type]`, label: 'clinical-trials' }
      ];

      let allArticles: any[] = [];
      let totalCount = 0;

      for (const strategy of searchStrategies) {
        try {
          const searchParams = {
            db: 'pubmed',
            term: strategy.term,
            retmax: '100', // 100 per strategy = up to 500 total
            retmode: 'json',
            sort: 'relevance',
            reldate: '1825' // Last 5 years
          };

          const searchResponse = await axios.get(searchUrl, { 
            params: searchParams,
            timeout: 15000 
          });
          
          const ids = searchResponse.data.esearchresult?.idlist || [];
          
          if (ids.length > 0) {
            const fetchParams = {
              db: 'pubmed',
              id: ids.join(','),
              retmode: 'json'
            };

            const fetchResponse = await axios.get(fetchUrl, { 
              params: fetchParams,
              timeout: 15000 
            });
            
            // Add relevance score and strategy info
            const articles = this.formatPubMedArticles(fetchResponse.data.result, ids).map(article => {
              if (!article) return article;
              return {
                ...article,
                relevanceScore: this.calculateArticleRelevanceScore(article, query),
                searchStrategy: strategy.label,
              };
            });

            allArticles.push(...articles.filter(Boolean));
            totalCount = Math.max(totalCount, searchResponse.data.esearchresult?.count || 0);
          }
        } catch (strategyError) {
          console.warn(`PubMed strategy failed: ${strategy.label}`, strategyError);
        }
      }

      // Remove duplicates and sort by relevance
      const uniqueArticles = this.removeDuplicateArticles(allArticles);
      const sortedArticles = uniqueArticles.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

      console.log('PubMed comprehensive search:', {
        totalStrategies: searchStrategies.length,
        totalArticles: allArticles.length,
        uniqueArticles: uniqueArticles.length,
        finalCount: sortedArticles.length
      });

      // If still no results, try enhanced Perplexity AI as intelligent fallback
      if (sortedArticles.length === 0) {
        console.log('No PubMed results, trying enhanced Perplexity AI...');
        const perplexityPapers = await this.searchPapersViaPerplexityEnhanced(query);
        if (perplexityPapers.length > 0) {
          return { 
            source: 'Perplexity AI (Enhanced)', 
            count: perplexityPapers.length, 
            articles: perplexityPapers,
            note: 'Real-time AI-powered research discovery'
          };
        }
      }

      return {
        source: 'PubMed (Multi-Strategy)',
        count: totalCount,
        articles: sortedArticles.slice(0, 400), // Limit to 400 best results
        strategies: searchStrategies.length,
        coverage: 'comprehensive'
      };
    } catch (error: any) {
      console.error('PubMed search error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      return { source: 'PubMed', count: 0, articles: [], error: error.message };
    }
  }

  // Search papers via Perplexity AI for real-time discovery
  private async searchPapersViaPerplexity(query: string): Promise<any[]> {
    try {
      const apiKey = process.env.PERPLEXITY_API_KEY;
      if (!apiKey) return [];

      const response = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model: 'sonar-pro',
          messages: [
            {
              role: 'system',
              content: 'You are a research paper search assistant. Extract and list recent research papers with their titles, authors, journals, and publication years.'
            },
            {
              role: 'user',
              content: `Find recent research papers about: ${query}. List up to 15 papers with title, authors, journal, year, and brief summary.`
            }
          ],
          max_tokens: 1500,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      const content = response.data.choices?.[0]?.message?.content || '';
      
      // Parse the AI response to extract paper information
      const papers = this.parsePerplexityPapers(content);
      return papers;
    } catch (error) {
      console.error('Perplexity papers search failed:', error);
      return [];
    }
  }

  // Parse Perplexity AI response to extract paper data
  private parsePerplexityPapers(content: string): any[] {
    const papers: any[] = [];
    
    // Split content into lines and look for paper entries
    const lines = content.split('\n');
    let currentPaper: any = null;

    lines.forEach(line => {
      // Look for numbered entries or titles
      if (line.match(/^\d+\.|^-|^\*/)) {
        if (currentPaper) {
          papers.push(currentPaper);
        }
        currentPaper = {
          pmid: `AI-${Date.now()}-${papers.length}`,
          title: line.replace(/^\d+\.|^-|^\*/, '').trim(),
          authors: 'Various Authors',
          journal: 'Recent Publication',
          year: new Date().getFullYear().toString(),
          doi: null,
          abstract: 'Real-time data from Perplexity AI',
          source: 'Perplexity AI'
        };
      }
    });

    if (currentPaper) {
      papers.push(currentPaper);
    }

    return papers.slice(0, 30); // Limit to 30 papers
  }

  // Search papers via Perplexity AI for real-time discovery with enhanced parsing
  private async searchPapersViaPerplexityEnhanced(query: string): Promise<any[]> {
    try {
      const apiKey = process.env.PERPLEXITY_API_KEY;
      if (!apiKey) return [];

      const response = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model: 'sonar-pro',
          messages: [
            {
              role: 'system',
              content: `You are a research paper discovery assistant. Find and extract detailed information about recent research papers.

CRITICAL FORMATTING RULES:
For each paper, provide information in this EXACT format:

PAPER: [PMID if available, or generate unique ID]
TITLE: [Full paper title]
AUTHORS: [Primary authors, comma-separated]
JOURNAL: [Journal name]
YEAR: [Publication year]
DOI: [DOI if available]
ABSTRACT: [Brief summary of key findings]
---

Find up to 20 recent research papers related to the query. Focus on:
1. High-impact journals and recent publications
2. Clinical studies and systematic reviews
3. Papers with clear methodologies
4. Diverse research approaches

Be specific and accurate. If PMID is not available, create a unique identifier like "AI-PAPER-001".`
            },
            {
              role: 'user',
              content: `Find research papers about: ${query}`
            }
          ],
          max_tokens: 2500,
          temperature: 0.3,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 20000,
        }
      );

      const content = response.data.choices?.[0]?.message?.content || '';
      return this.parseEnhancedPerplexityPapers(content, query);
    } catch (error) {
      console.error('Enhanced Perplexity papers search failed:', error);
      return this.searchPapersViaPerplexity(query); // Fallback to basic method
    }
  }

  // Enhanced parsing for Perplexity paper responses
  private parseEnhancedPerplexityPapers(content: string, query: string): any[] {
    const papers: any[] = [];
    const paperBlocks = content.split('---').filter(block => block.trim());

    paperBlocks.forEach((block, index) => {
      const lines = block.split('\n').map(line => line.trim()).filter(line => line);
      const paper: any = {
        source: 'Perplexity AI',
        relevanceScore: 50, // Base score for AI-discovered papers
        searchStrategy: 'ai-discovery'
      };

      lines.forEach(line => {
        if (line.startsWith('PAPER:')) {
          paper.pmid = line.replace('PAPER:', '').trim() || `AI-PAPER-${Date.now()}-${index}`;
        } else if (line.startsWith('TITLE:')) {
          paper.title = line.replace('TITLE:', '').trim();
        } else if (line.startsWith('AUTHORS:')) {
          paper.authors = line.replace('AUTHORS:', '').trim();
        } else if (line.startsWith('JOURNAL:')) {
          paper.journal = line.replace('JOURNAL:', '').trim();
        } else if (line.startsWith('YEAR:')) {
          paper.year = line.replace('YEAR:', '').trim();
        } else if (line.startsWith('DOI:')) {
          paper.doi = line.replace('DOI:', '').trim();
        } else if (line.startsWith('ABSTRACT:')) {
          paper.abstract = line.replace('ABSTRACT:', '').trim();
        }
      });

      // Set defaults for missing fields
      paper.title = paper.title || `Research on ${query}`;
      paper.authors = paper.authors || 'Various Authors';
      paper.journal = paper.journal || 'Recent Publication';
      paper.year = paper.year || new Date().getFullYear().toString();
      paper.doi = paper.doi || null;
      paper.abstract = paper.abstract || 'Real-time data from Perplexity AI';

      // Calculate relevance score
      paper.relevanceScore = this.calculateArticleRelevanceScore(paper, query);

      if (paper.pmid && paper.title) {
        papers.push(paper);
      }
    });

    return papers.slice(0, 30);
  }

  // Search WHO ICTRP (placeholder - requires data export or web scraping)
  async searchICTRP(query: string) {
    // WHO ICTRP doesn't have a public API
    // Would require web scraping or data export
    return {
      source: 'WHO ICTRP',
      count: 0,
      trials: [],
      note: 'ICTRP integration requires data export or web scraping'
    };
  }

  // Search CTRI India (Clinical Trials Registry - India)
  async searchCTRIIndia(query: string, filters: any) {
    try {
      // CTRI India search endpoint
      const baseUrl = 'http://ctri.nic.in/Clinicaltrials/advancesearchmain.php';
      
      // Note: CTRI doesn't have a proper REST API, this is a simplified implementation
      // In production, you'd need to implement web scraping or use their search interface
      
      // For now, return empty results with a note
      return {
        source: 'CTRI India',
        count: 0,
        trials: [],
        note: 'CTRI India integration requires web scraping implementation'
      };
    } catch (error: any) {
      console.error('CTRI India search error:', error.message);
      return { source: 'CTRI India', count: 0, trials: [] };
    }
  }

  // Search using Perplexity AI with web search
  async searchPerplexityAI(query: string) {
    try {
      const apiKey = process.env.PERPLEXITY_API_KEY;
      const apiUrl = process.env.PERPLEXITY_API_URL || 'https://api.perplexity.ai/chat/completions';

      if (!apiKey) {
        console.warn('Perplexity API key not configured');
        return { source: 'Perplexity AI', count: 0, insights: null };
      }

      const response = await axios.post(
        apiUrl,
        {
          model: 'sonar-pro', // sonar model has web search capabilities
          messages: [
            {
              role: 'system',
              content: 'You are a clinical research assistant with access to real-time web data. Provide comprehensive, up-to-date information about clinical trials and medical research using the latest available data from the web.'
            },
            {
              role: 'user',
              content: `Search the web for the most recent clinical trials and research about: ${query}. 

Include:
1. Latest ongoing trials (with NCT IDs if available)
2. Recent research publications and findings
3. Current treatment approaches and emerging therapies
4. Key statistics and success rates
5. Notable institutions and researchers in this field

Provide comprehensive, evidence-based information with specific details and numbers.`
            }
          ],
          max_tokens: 1500,
          temperature: 0.2,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 20000,
        }
      );

      const content = response.data.choices?.[0]?.message?.content || '';
      
      return {
        source: 'Perplexity AI (Web Search)',
        count: 1,
        insights: {
          summary: content,
          query: query,
          timestamp: new Date().toISOString(),
          hasWebData: true,
        }
      };
    } catch (error: any) {
      console.error('Perplexity AI search error:', error.message);
      return { source: 'Perplexity AI', count: 0, insights: null };
    }
  }

  // Natural Language Query Processing with AI
  async processNaturalLanguageQuery(query: string) {
    try {
      const apiKey = process.env.PERPLEXITY_API_KEY;
      const apiUrl = process.env.PERPLEXITY_API_URL || 'https://api.perplexity.ai/chat/completions';

      if (!apiKey) {
        console.warn('Perplexity API key not configured');
        return { 
          enrichedKnowledge: null, 
          searchSuggestions: [],
          relatedTopics: []
        };
      }

      const response = await axios.post(
        apiUrl,
        {
          model: 'sonar-pro',
          messages: [
            {
              role: 'system',
              content: `You are an expert clinical research assistant helping doctors and researchers understand complex medical topics.

Your role is to:
1. Provide clear, comprehensive, evidence-based answers
2. Break down complex medical concepts into digestible sections
3. Include relevant statistics, recent findings, and clinical guidelines
4. Suggest specific search terms for finding relevant trials
5. Recommend related topics for further exploration

CRITICAL FORMATTING RULES:
- Put important medical terms, drug names, procedures, and key concepts in "double quotes"
- Use "quotes" for technical terms that users should pay attention to
- Use "quotes" for specific trial phases, conditions, or interventions
- Examples: "Phase III trials", "CAR-T cell therapy", "randomized controlled trial"
- DO NOT use HTML tags like <highlight-term> or any other markup
- DO NOT write "highlight-term>" or similar formatting instructions
- NEVER write the word "highlight" followed by "term" in any form
- ABSOLUTELY FORBIDDEN: highlight-term, <highlight-term>, </highlight-term>
- ONLY use plain text with "double quotes" for emphasis

Format your response with clear structure:
- Start with a direct answer to the question
- Use paragraphs to organize different aspects
- Include specific examples and data when relevant
- Put key terms in "quotes" for emphasis (NOT HTML tags)
- End with actionable insights

After your main response, provide:
SEARCH SUGGESTIONS: [list 3-5 specific search terms]
RELATED TOPICS: [list 3-5 related areas to explore]

Be conversational yet professional. Focus on practical, actionable information that helps researchers make informed decisions.`
            },
            {
              role: 'user',
              content: query
            }
          ],
          max_tokens: 1500,
          temperature: 0.3,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 20000,
        }
      );

      const content = response.data.choices?.[0]?.message?.content || '';
      
      // Extract search suggestions and related topics from the response
      const searchSuggestions = this.extractSearchSuggestions(content);
      const relatedTopics = this.extractRelatedTopics(content);
      
      // Clean the main content by removing the extracted sections
      let cleanedContent = content
        .replace(/SEARCH SUGGESTIONS?:[\s\S]*?(?=RELATED TOPICS?:|$)/i, '')
        .replace(/RELATED TOPICS?:[\s\S]*$/i, '')
        .trim();
      
      // CRITICAL: Remove any HTML-like tags or formatting instructions that AI might output
      // This handles cases where AI writes "highlight-term>" or similar markup
      cleanedContent = cleanedContent
        .replace(/highlight-term>/gi, '')  // Remove "highlight-term>"
        .replace(/<highlight-term>/gi, '') // Remove "<highlight-term>"
        .replace(/<\/highlight-term>/gi, '') // Remove "</highlight-term>"
        .replace(/highlight-term\s*>/gi, '') // Remove "highlight-term >" with spaces
        .replace(/\bhighlight-term\b/gi, '') // Remove standalone "highlight-term"
        .replace(/<[^>]+>/g, '') // Remove any other HTML-like tags
        .replace(/\s+/g, ' ') // Clean up multiple spaces
        .trim();
      
      return {
        enrichedKnowledge: cleanedContent,
        searchSuggestions,
        relatedTopics,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('Natural language processing error:', error.message);
      return { 
        enrichedKnowledge: null, 
        searchSuggestions: [],
        relatedTopics: [],
        error: error.message
      };
    }
  }

  // Extract search suggestions from AI response
  private extractSearchSuggestions(content: string): string[] {
    const suggestions: string[] = [];
    
    // Look for the SEARCH SUGGESTIONS section
    const searchMatch = content.match(/SEARCH SUGGESTIONS?:\s*([\s\S]*?)(?=RELATED TOPICS?:|$)/i);
    if (searchMatch && searchMatch[1]) {
      const lines = searchMatch[1].split('\n');
      for (const line of lines) {
        const cleaned = line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim();
        if (cleaned && cleaned.length > 3 && cleaned.length < 100) {
          suggestions.push(cleaned);
        }
      }
    }

    // Fallback: extract quoted terms or key phrases
    if (suggestions.length === 0) {
      const quotedTerms = content.match(/"([^"]+)"/g);
      if (quotedTerms) {
        suggestions.push(...quotedTerms.slice(0, 5).map(t => t.replace(/"/g, '')));
      }
    }

    return [...new Set(suggestions)].slice(0, 5);
  }

  // Extract related topics from AI response
  private extractRelatedTopics(content: string): string[] {
    const topics: string[] = [];
    
    // Look for the RELATED TOPICS section
    const topicsMatch = content.match(/RELATED TOPICS?:\s*([\s\S]*?)$/i);
    if (topicsMatch && topicsMatch[1]) {
      const lines = topicsMatch[1].split('\n');
      for (const line of lines) {
        const cleaned = line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim();
        if (cleaned && cleaned.length > 3 && cleaned.length < 100) {
          topics.push(cleaned);
        }
      }
    }

    return [...new Set(topics)].slice(0, 5);
  }

  // Search Grey Literature sources
  async searchGreyLiterature(query: string) {
    try {
      // Grey literature sources: OpenGrey, CORE, BASE
      // These would require separate API implementations
      // For now, return placeholder
      
      return {
        source: 'Grey Literature',
        count: 0,
        documents: [],
        note: 'Grey literature integration (OpenGrey, CORE, BASE) requires API implementation'
      };
    } catch (error: any) {
      console.error('Grey Literature search error:', error.message);
      return { source: 'Grey Literature', count: 0, documents: [] };
    }
  }

  // Format ClinicalTrials.gov data
  private formatClinicalTrial(study: any) {
    try {
      const protocol = study.protocolSection;
      
      if (!protocol) {
        console.warn('Study missing protocolSection:', study);
        return null;
      }

      const identification = protocol?.identificationModule || {};
      const status = protocol?.statusModule || {};
      const design = protocol?.designModule || {};
      const conditions = protocol?.conditionsModule || {};
      const interventions = protocol?.armsInterventionsModule || {};
      const sponsor = protocol?.sponsorCollaboratorsModule || {};
      const description = protocol?.descriptionModule || {};

      const formatted = {
        nctId: identification.nctId || 'N/A',
        title: identification.briefTitle || identification.officialTitle || 'No title available',
        status: status.overallStatus || 'Unknown',
        phase: design.phases?.[0] || 'Not Applicable',
        condition: conditions.conditions?.[0] || 'Not specified',
        intervention: interventions.interventions?.[0]?.name || 'Not specified',
        enrollment: design.enrollmentInfo?.count || 0,
        sponsor: sponsor.leadSponsor?.name || 'Not specified',
        startDate: status.startDateStruct?.date || null,
        description: description.briefSummary || 'No description available',
        source: 'ClinicalTrials.gov'
      };

      return formatted;
    } catch (error: any) {
      console.error('Error in formatClinicalTrial:', error.message, study);
      return null;
    }
  }

  // Format PubMed articles
  private formatPubMedArticles(result: any, ids: string[]) {
    return ids.map(id => {
      const article = result[id];
      if (!article) return null;

      return {
        pmid: id,
        title: article.title || 'No title available',
        authors: article.authors?.map((a: any) => a.name).join(', ') || 'N/A',
        journal: article.fulljournalname || article.source || 'N/A',
        year: article.pubdate?.split(' ')[0] || 'N/A',
        doi: article.elocationid || null,
        abstract: 'Available via PubMed',
        source: 'PubMed'
      };
    }).filter(Boolean);
  }

  // Generate objective text from PICOT or Estimand components using AI
  async generateObjectiveFromEstimand(params: {
    picot?: {
      population?: string;
      intervention?: string;
      control?: string;
      outcome?: string;
      timePeriod?: string;
    };
    estimand?: {
      treatment?: string;
      population?: string;
      endpoint?: string;
    };
    objectiveType: string;
    protocolContext?: any;
  }) {
    try {
      const apiKey = process.env.PERPLEXITY_API_KEY;
      if (!apiKey) {
        throw new Error('Perplexity API key not configured');
      }

      const { picot, estimand, objectiveType, protocolContext } = params;

      // Determine which framework to use based on completeness
      const picotComplete = picot?.population && picot?.intervention && picot?.outcome;
      const estimandComplete = estimand?.treatment && estimand?.population && estimand?.endpoint;

      let framework = 'PICOT';
      let frameworkData = picot;

      if (!picotComplete && estimandComplete) {
        framework = 'ICH E9(R1) Estimand';
        frameworkData = estimand;
      }

      const response = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model: 'sonar-pro',
          messages: [
            {
              role: 'system',
              content: `You are a clinical trial protocol expert specializing in writing clear, precise trial objectives using both PICOT and ICH E9(R1) frameworks.

TASK: Generate a well-structured ${objectiveType} objective statement based on the provided framework components.

RULES:
1. Write in clear, professional clinical trial language
2. Follow the appropriate framework principles (PICOT or ICH E9(R1))
3. Be specific and measurable
4. Use appropriate clinical terminology
5. Keep it concise but comprehensive
6. Start with "To evaluate..." or "To assess..." or "To determine..."

STRUCTURE:
- Begin with the purpose (evaluate/assess/determine)
- Include the intervention/treatment being studied
- Reference the target population
- Mention the control/comparator (if provided)
- Specify the primary outcome/endpoint
- Include time frame (if provided)
- Ensure clinical relevance and feasibility

Return ONLY the objective text, no explanations or additional formatting.`
            },
            {
              role: 'user',
              content: `Generate a ${objectiveType} objective using ${framework} framework:

${framework === 'PICOT' ? `
Population: ${picot?.population || 'Not specified'}
Intervention: ${picot?.intervention || 'Not specified'}
Control: ${picot?.control || 'Not specified'}
Outcome: ${picot?.outcome || 'Not specified'}
Time Period: ${picot?.timePeriod || 'Not specified'}
` : `
Treatment: ${estimand?.treatment || 'Not specified'}
Population: ${estimand?.population || 'Not specified'}
Endpoint: ${estimand?.endpoint || 'Not specified'}
`}

${protocolContext?.title ? `Protocol Title: ${protocolContext.title}` : ''}
${protocolContext?.indication ? `Indication: ${protocolContext.indication}` : ''}`
            }
          ],
          max_tokens: 300,
          temperature: 0.3,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      const objectiveText = response.data.choices?.[0]?.message?.content?.trim() || '';
      
      if (!objectiveText) {
        throw new Error('Failed to generate objective text');
      }

      return {
        objectiveText,
        generatedFrom: {
          framework,
          data: frameworkData,
          objectiveType
        },
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Objective generation error:', error);
      throw new Error(`Failed to generate objective: ${error.message}`);
    }
  }

  // AI-powered analysis of search results
  async analyzeTrialsWithAI(trials: any[], userQuery: string) {
    // This would integrate with Perplexity AI or OpenAI
    // For now, return structured analysis based on trial data
    
    const analysis = {
      trialsAnalyzed: trials.length,
      commonPatterns: this.extractCommonPatterns(trials),
      recommendations: this.generateRecommendations(trials),
      sampleSizes: this.analyzeSampleSizes(trials),
      endpoints: this.analyzeEndpoints(trials)
    };

    return analysis;
  }

  private extractCommonPatterns(trials: any[]) {
    const patterns = [];
    
    // Analyze phases
    const phases = trials.map(t => t.phase).filter(Boolean);
    if (phases.length > 0) {
      const phaseCount = phases.reduce((acc: any, phase) => {
        acc[phase] = (acc[phase] || 0) + 1;
        return acc;
      }, {});
      const mostCommonPhase = Object.keys(phaseCount).sort((a, b) => phaseCount[b] - phaseCount[a])[0];
      patterns.push(`Most common phase: ${mostCommonPhase} (${phaseCount[mostCommonPhase]} trials)`);
    }

    // Analyze status
    const statuses = trials.map(t => t.status).filter(Boolean);
    if (statuses.length > 0) {
      const recruitingCount = statuses.filter(s => s.toLowerCase().includes('recruiting')).length;
      patterns.push(`${recruitingCount} trials are currently recruiting participants`);
    }

    // Analyze enrollment
    const enrollments = trials.map(t => t.enrollment).filter(e => e > 0);
    if (enrollments.length > 0) {
      const avgEnrollment = Math.round(enrollments.reduce((a, b) => a + b, 0) / enrollments.length);
      patterns.push(`Average enrollment: ${avgEnrollment} participants`);
    }

    patterns.push('Randomized controlled trial design is standard for efficacy studies');
    patterns.push('Double-blind methodology commonly used to minimize bias');

    return patterns;
  }

  private generateRecommendations(trials: any[]) {
    const recommendations = [];

    recommendations.push('Consider a randomized, controlled design for robust evidence generation');
    recommendations.push('Include both primary and secondary endpoints in your protocol');
    recommendations.push('Plan for adequate follow-up period based on your indication');
    recommendations.push('Use validated assessment tools and standardized definitions');
    recommendations.push('Consider stratification by key baseline characteristics');
    recommendations.push('Include safety monitoring and adverse event reporting procedures');

    return recommendations;
  }

  private analyzeSampleSizes(trials: any[]) {
    const enrollments = trials.map(t => t.enrollment).filter(e => e > 0);
    
    if (enrollments.length === 0) {
      return 'Sample size data not available for analyzed trials';
    }

    const min = Math.min(...enrollments);
    const max = Math.max(...enrollments);
    const median = enrollments.sort((a, b) => a - b)[Math.floor(enrollments.length / 2)];

    return `Sample sizes range from ${min} to ${max} participants (median: ${median}). Consider 80-90% power with alpha=0.05 for your calculations. Account for 10-15% dropout rate.`;
  }

  private analyzeEndpoints(trials: any[]) {
    return [
      'Primary endpoints typically measure efficacy (e.g., disease progression, symptom improvement)',
      'Secondary endpoints often include safety, quality of life, and biomarkers',
      'Time-to-event analyses common for survival and progression outcomes'
    ];
  }
}

export const researchService = new ResearchService();
