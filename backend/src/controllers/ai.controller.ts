import { Request, Response } from 'express';
import { aiService } from '../services/ai.service';

export class AIController {
  // Get AI assistance for any protocol section
  async getSectionAssistance(req: Request, res: Response) {
    try {
      const { sectionName, currentContent, userQuery, context } = req.body;

      if (!sectionName || !userQuery) {
        return res.status(400).json({
          error: 'sectionName and userQuery are required'
        });
      }

      const result = await aiService.getProtocolSectionAssistance(
        sectionName,
        currentContent,
        userQuery,
        context
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('AI Section Assistance Error:', error);
      res.status(500).json({
        error: 'Failed to get AI assistance',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Generate content for protocol sections
  async generateSectionContent(req: Request, res: Response) {
    try {
      const { sectionName, parameters, templateType } = req.body;

      if (!sectionName || !parameters) {
        return res.status(400).json({
          error: 'sectionName and parameters are required'
        });
      }

      const result = await aiService.generateSectionContent(
        sectionName,
        parameters,
        templateType
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('AI Content Generation Error:', error);
      res.status(500).json({
        error: 'Failed to generate content',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Validate and get improvement suggestions
  async validateAndImprove(req: Request, res: Response) {
    try {
      const { sectionName, content, protocolContext } = req.body;

      if (!sectionName || !content) {
        return res.status(400).json({
          error: 'sectionName and content are required'
        });
      }

      const result = await aiService.validateAndImprove(
        sectionName,
        content,
        protocolContext
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('AI Validation Error:', error);
      res.status(500).json({
        error: 'Failed to validate content',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get research assistance
  async getResearchAssistance(req: Request, res: Response) {
    try {
      const { topic, context } = req.body;

      if (!topic) {
        return res.status(400).json({
          error: 'topic is required'
        });
      }

      const result = await aiService.getResearchAssistance(topic, context);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('AI Research Assistance Error:', error);
      res.status(500).json({
        error: 'Failed to get research assistance',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get form completion suggestions
  async getFormCompletionSuggestions(req: Request, res: Response) {
    try {
      const { sectionName, fieldName, currentValue, protocolContext } = req.body;

      if (!sectionName || !fieldName) {
        return res.status(400).json({
          error: 'sectionName and fieldName are required'
        });
      }

      const result = await aiService.getFormCompletionSuggestions(
        sectionName,
        fieldName,
        currentValue || '',
        protocolContext
      );

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('AI Form Completion Error:', error);
      res.status(500).json({
        error: 'Failed to get form suggestions',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Smart protocol analysis
  async analyzeProtocol(req: Request, res: Response) {
    try {
      const { protocolData } = req.body;

      if (!protocolData) {
        return res.status(400).json({
          error: 'protocolData is required'
        });
      }

      // Analyze overall protocol quality and completeness
      const sections = Object.keys(protocolData.sections || {});
      const analysisResults = [];

      for (const sectionName of sections) {
        const sectionData = protocolData.sections[sectionName];
        if (sectionData && Object.keys(sectionData).length > 0) {
          const analysis = await aiService.validateAndImprove(
            sectionName,
            sectionData,
            protocolData
          );
          analysisResults.push({
            section: sectionName,
            ...analysis
          });
        }
      }

      // Calculate overall protocol score
      const overallScore = analysisResults.length > 0 
        ? Math.round(analysisResults.reduce((sum, result) => sum + result.score, 0) / analysisResults.length)
        : 0;

      res.json({
        success: true,
        data: {
          overallScore,
          sectionAnalysis: analysisResults,
          completedSections: sections.length,
          totalSections: 14
        }
      });
    } catch (error) {
      console.error('AI Protocol Analysis Error:', error);
      res.status(500).json({
        error: 'Failed to analyze protocol',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const aiController = new AIController();