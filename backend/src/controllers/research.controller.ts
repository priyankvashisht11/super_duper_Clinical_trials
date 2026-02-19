import { Request, Response } from 'express';
import { researchService } from '../services/research.service';

export class ResearchController {
  async search(req: Request, res: Response) {
    try {
      const { query, filters, sources } = req.body;

      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }

      const results: any = {
        clinicalTrials: null,
        pubMed: null,
        ictrp: null,
        ctriIndia: null,
        perplexityAI: null,
        greyLiterature: null
      };

      // Search requested sources in parallel
      const promises = [];

      if (sources.includes('clinicaltrials')) {
        promises.push(
          researchService.searchClinicalTrials(query, filters)
            .then(data => { results.clinicalTrials = data; })
            .catch(err => {
              console.error('ClinicalTrials search failed:', err);
              results.clinicalTrials = { source: 'ClinicalTrials.gov', count: 0, trials: [], error: err.message };
            })
        );
      }

      if (sources.includes('pubmed')) {
        promises.push(
          researchService.searchPubMed(query)
            .then(data => { results.pubMed = data; })
            .catch(err => {
              console.error('PubMed search failed:', err);
              results.pubMed = { source: 'PubMed', count: 0, articles: [], error: err.message };
            })
        );
      }

      if (sources.includes('ictrp')) {
        promises.push(
          researchService.searchICTRP(query)
            .then(data => { results.ictrp = data; })
            .catch(err => {
              console.error('ICTRP search failed:', err);
              results.ictrp = { source: 'WHO ICTRP', count: 0, trials: [], error: err.message };
            })
        );
      }

      if (sources.includes('ctri')) {
        promises.push(
          researchService.searchCTRIIndia(query, filters)
            .then(data => { results.ctriIndia = data; })
            .catch(err => {
              console.error('CTRI India search failed:', err);
              results.ctriIndia = { source: 'CTRI India', count: 0, trials: [], error: err.message };
            })
        );
      }

      if (sources.includes('perplexity')) {
        promises.push(
          researchService.searchPerplexityAI(query)
            .then(data => { results.perplexityAI = data; })
            .catch(err => {
              console.error('Perplexity AI search failed:', err);
              results.perplexityAI = { source: 'Perplexity AI', count: 0, insights: null, error: err.message };
            })
        );
      }

      if (sources.includes('grey')) {
        promises.push(
          researchService.searchGreyLiterature(query)
            .then(data => { results.greyLiterature = data; })
            .catch(err => {
              console.error('Grey Literature search failed:', err);
              results.greyLiterature = { source: 'Grey Literature', count: 0, documents: [], error: err.message };
            })
        );
      }

      await Promise.all(promises);

      console.log('Search results summary:', {
        clinicalTrials: results.clinicalTrials?.trials?.length || 0,
        pubMed: results.pubMed?.articles?.length || 0,
        perplexityAI: !!results.perplexityAI?.insights,
        ctriIndia: results.ctriIndia?.trials?.length || 0
      });

      res.json({
        success: true,
        data: results
      });
    } catch (error: any) {
      console.error('Research search error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to search research'
      });
    }
  }

  async analyzeTrials(req: Request, res: Response) {
    try {
      const { trials, query } = req.body;

      if (!trials || !Array.isArray(trials)) {
        return res.status(400).json({
          success: false,
          error: 'Trials array is required'
        });
      }

      const analysis = await researchService.analyzeTrialsWithAI(trials, query);

      res.json({
        success: true,
        data: analysis
      });
    } catch (error: any) {
      console.error('Trial analysis error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to analyze trials'
      });
    }
  }

  // New endpoint for natural language query processing
  async processNaturalLanguage(req: Request, res: Response) {
    try {
      const { query } = req.body;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Query string is required'
        });
      }

      console.log('Processing natural language query:', query);

      const result = await researchService.processNaturalLanguageQuery(query);

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Natural language processing error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to process natural language query'
      });
    }
  }

  // Generate objective text from PICOT or Estimand fields
  async generateObjective(req: Request, res: Response) {
    try {
      const { picot, estimand, objectiveType, protocolContext } = req.body;

      // Check if we have either framework with sufficient data
      const picotComplete = picot?.population && picot?.intervention && picot?.outcome;
      const estimandComplete = estimand?.treatment && estimand?.population && estimand?.endpoint;

      if (!picotComplete && !estimandComplete) {
        return res.status(400).json({
          success: false,
          error: 'Either complete PICOT (Population, Intervention, Outcome) or Estimand (Treatment, Population, Endpoint) data is required'
        });
      }

      console.log('Generating objective from frameworks:', { 
        picotComplete, 
        estimandComplete, 
        objectiveType 
      });

      const result = await researchService.generateObjectiveFromEstimand({
        picot,
        estimand,
        objectiveType: objectiveType || 'primary',
        protocolContext
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Objective generation error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate objective'
      });
    }
  }
}

export const researchController = new ResearchController();
