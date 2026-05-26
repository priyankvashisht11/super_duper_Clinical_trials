import { Router } from 'express';
import { agentController } from '../controllers/agent.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All agent routes require auth
router.use(authenticateToken);

router.post('/sessions', agentController.createSession);
router.get('/sessions', agentController.listSessions);
router.get('/sessions/:id', agentController.getSession);
router.get('/artifacts/:id/download', agentController.downloadArtifact);

// SSE streaming run — query params: ?query=...&tab=...
router.get('/run/:sessionId/stream', agentController.streamRun);

export default router;
