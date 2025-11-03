import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import propertiesRouter from './routes/properties';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/properties', propertiesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Rightmove Search API is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Rightmove Property Search API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      properties: 'GET /api/properties',
      scrape: 'POST /api/properties/scrape',
      scrapeNottingham: 'POST /api/properties/scrape-nottingham',
      stats: 'GET /api/properties/stats',
      clearProperties: 'DELETE /api/properties',
    },
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Rightmove Search Server running on http://localhost:${PORT}`);
  console.log(`📊 API Documentation: http://localhost:${PORT}/`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health\n`);
});

export default app;
