import express, { Request, Response } from 'express';

const router = express.Router();

interface HealthResponse {
  status: string;
  timestamp: string;
}

router.get('/health', (req: Request, res: Response<HealthResponse>) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
