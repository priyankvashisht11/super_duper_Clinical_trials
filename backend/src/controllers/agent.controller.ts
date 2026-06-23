import { Request, Response } from 'express';
import {
  runAgent, createSession, getSessionHistory, getUserSessions, getArtifact,
  AgentTab,
} from '../services/agent.orchestrator';

export const agentController = {

  // POST /api/agent/sessions — create a new session
  async createSession(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const { tab, title } = req.body as { tab: AgentTab; title: string };
      if (!tab || !title) return res.status(400).json({ error: 'tab and title required' });

      const session = await createSession(userId, tab, title);
      res.json({ success: true, data: session });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // GET /api/agent/sessions — list user's sessions
  async listSessions(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const tab = req.query['tab'] as AgentTab | undefined;
      const sessions = await getUserSessions(userId, tab);
      res.json({ success: true, data: sessions });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // GET /api/agent/sessions/:id — get session with full history
  async getSession(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const session = await getSessionHistory(req.params['id'] as string);
      if (!session || session.userId !== userId) return res.status(404).json({ error: 'Not found' });

      res.json({ success: true, data: session });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // GET /api/agent/artifacts/:id/download
  async downloadArtifact(req: Request, res: Response) {
    try {
      const artifact = await getArtifact(req.params['id'] as string);
      if (!artifact) return res.status(404).json({ error: 'Not found' });

      const mimeTypes: Record<string, string> = {
        markdown: 'text/markdown',
        pdf: 'application/pdf',
        json: 'application/json',
        csv: 'text/csv',
      };

      res.setHeader('Content-Type', mimeTypes[artifact.type] ?? 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${artifact.name}"`);
      res.send(artifact.content);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  // GET /api/agent/run/:sessionId/stream — SSE streaming endpoint
  async streamRun(req: Request, res: Response) {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).end();
      return;
    }

    const sessionId = req.params['sessionId'] as string;
    const query = req.query['query'] as string;
    const tab = req.query['tab'] as AgentTab;

    if (!query || !tab || !sessionId) {
      res.status(400).end();
      return;
    }

    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    const emit = (event: { type: string; payload: unknown }) => {
      const data = JSON.stringify(event);
      res.write(`data: ${data}\n\n`);
      if ((res as any).flush) (res as any).flush();
    };

    // Heartbeat so browser doesn't close the connection
    const heartbeat = setInterval(() => res.write(': ping\n\n'), 15000);

    req.on('close', () => clearInterval(heartbeat));

    try {
      await runAgent({ sessionId, userId, tab, query, emit });
    } catch (err: any) {
      emit({ type: 'error', payload: { message: err.message } });
    } finally {
      clearInterval(heartbeat);
      res.end();
    }
  },
};
