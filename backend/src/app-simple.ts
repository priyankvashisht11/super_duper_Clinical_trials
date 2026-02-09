import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (no database needed for now)
let protocols: any[] = [];

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Backend is running!' 
  });
});

// Get all protocols
app.get('/api/protocols', (req, res) => {
  res.json({
    success: true,
    data: protocols
  });
});

// Create protocol
app.post('/api/protocols', (req, res) => {
  const newProtocol = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  protocols.push(newProtocol);
  
  res.status(201).json({
    success: true,
    data: newProtocol
  });
});

// Get protocol by ID
app.get('/api/protocols/:id', (req, res) => {
  const protocol = protocols.find(p => p.id === req.params.id);
  
  if (!protocol) {
    return res.status(404).json({
      success: false,
      error: 'Protocol not found'
    });
  }
  
  res.json({
    success: true,
    data: protocol
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📝 API ready: http://localhost:${PORT}/api/protocols`);
});

export default app;
