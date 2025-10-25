import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import compression from 'compression';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
dotenv.config();
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './swagger/swagger.js';
import apiRouterIndex from './routes/index.js';

/* for logging purpose - start */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logFile = path.join(__dirname, '../server.log');
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

const originalLog = console.log;
const originalError = console.error;

console.log = (...args) => {
  const message = `[${new Date().toISOString()}] [LOG] ${args.join(' ')}\n`;
  logStream.write(message);
  originalLog.apply(console, args);
};

console.error = (...args) => {
  const message = `[${new Date().toISOString()}] [ERROR] ${args.join(' ')}\n`;
  logStream.write(message);
  originalError.apply(console, args);
};
/* for logging purpose - end */

const app = express();
const PORT = process.env.PORT || 4000;

// Compression improves SSR speed
app.use(compression());

// CORS for SSR fetch
app.use(cors({ origin: '*' }));

// JSON parsing
app.use(bodyParser.json({ limit: '2mb' }));

// swagger doc 
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

interface HealthResponse {
  status: string;
  uptime: number;
  timestamp: number;
}
// Health check route (SEO + monitoring)
app.get('/api/health', (req: Request, res: Response<HealthResponse>) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: Date.now() });
});

// Mount API routes
app.use('/api', apiRouterIndex);

// Global error handler
app.use(
  (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[Error]', err);
    res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
);

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
