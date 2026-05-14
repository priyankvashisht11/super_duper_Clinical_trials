import { Router } from 'express';
import { matchController } from '../controllers/match.controller';

const router = Router();

router.post('/patient', matchController.matchPatient);

export default router;
