import { Router } from 'express';
import { analysisController } from '../controllers/analysis.controller';

const router = Router();

router.post('/insights', (req, res) => analysisController.getInsights(req, res));

export default router;
