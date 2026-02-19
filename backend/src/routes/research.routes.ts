import { Router } from 'express';
import { researchController } from '../controllers/research.controller';

const router = Router();

// Search across multiple research sources
router.post('/search', (req, res) => researchController.search(req, res));

// Analyze trials with AI
router.post('/analyze-trials', (req, res) => researchController.analyzeTrials(req, res));

// Process natural language queries with AI knowledge enrichment
router.post('/natural-language', (req, res) => researchController.processNaturalLanguage(req, res));

// Generate objective text from estimand fields
router.post('/generate-objective', (req, res) => researchController.generateObjective(req, res));

export default router;
