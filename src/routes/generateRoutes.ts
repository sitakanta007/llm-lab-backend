import express, { Request, Response } from 'express';
import { generateMockResults, generateRealResults, logParameterKeys } from '../services/llmService.js';
import { createExperiment, Experiment } from '../services/experimentStore.js';

const router = express.Router();

interface GenerateRequestBody {
  prompt: string;
  combinations: Record<string, any>[];
  mock?: boolean;
}

interface GenerateResponse {
  experimentId: string;
  results: any[];
}

router.post(
  '/generate',
  async (
    req: Request<{}, {}, GenerateRequestBody>,
    res: Response<GenerateResponse | { error: string }>
  ) => {
    try {
      const { prompt, combinations, mock = true } = req.body;

      console.log('[generate] Received request:', { prompt, comboCount: combinations.length, mock });

      if (!prompt || !Array.isArray(combinations)) {
        return res.status(400).json({ error: 'Invalid request body' });
      }

      logParameterKeys(combinations);

      let results;
      if (mock) {
        results = await generateMockResults(prompt, combinations);
      } else {
        console.log('[generate] Calling generateRealResults...');
        results = await generateRealResults(prompt, combinations);
        console.log('[generate] Real results received:', results);
      }

      const experiment: Experiment = createExperiment({
        prompt,
        results,
      });

      console.log('[generate] Experiment created:', experiment.id);

      return res.status(200).json({
        experimentId: experiment.id,
        results: experiment.results,
      });
    } catch (err: any) {
      console.error('[generate] ERROR:', err);
      return res.status(500).json({ error: err?.message || 'Internal Server Error' });
    }
  }
);

export default router;
