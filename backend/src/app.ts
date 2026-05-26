import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { protocolRoutes } from './routes/protocol.routes';
import aiRoutes from './routes/ai.routes';
import researchRoutes from './routes/research.routes';
import matchRoutes from './routes/match.routes';
import analysisRoutes from './routes/analysis.routes';
import edcRoutes from './routes/edc.routes';
import agentRoutes from './routes/agent.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import notificationRoutes from './routes/notification.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/protocols', protocolRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/edc', edcRoutes);
app.use('/api/agent', agentRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Protocol Builder API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
