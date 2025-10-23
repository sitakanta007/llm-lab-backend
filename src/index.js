import express from 'express';
import cors from 'cors';
import compression from 'compression';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Compression improves SSR speed
app.use(compression());

// CORS for SSR fetch
app.use(cors({ origin: '*' }));

// JSON parsing
app.use(bodyParser.json({ limit: '2mb' }));

// Health check route (SEO + monitoring)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: Date.now() });
});

// Mount API routes
app.use('/api', apiRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
