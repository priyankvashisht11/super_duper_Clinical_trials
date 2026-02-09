import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';

const router = Router();

// AI assistance endpoints
router.post('/section-assistance', aiController.getSectionAssistance.bind(aiController));
router.post('/generate-content', aiController.generateSectionContent.bind(aiController));
router.post('/validate-improve', aiController.validateAndImprove.bind(aiController));
router.post('/research-assistance', aiController.getResearchAssistance.bind(aiController));
router.post('/form-suggestions', aiController.getFormCompletionSuggestions.bind(aiController));
router.post('/analyze-protocol', aiController.analyzeProtocol.bind(aiController));

export default router;