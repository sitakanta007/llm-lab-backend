import express, { Request, Response } from 'express';
import { loadExperiments } from '../services/experimentStore.js';

const router = express.Router();

interface ExperimentResult {
  metrics?: {
    coherence?: number;
  };
  [key: string]: any;
}

interface Experiment {
  id: string;
  prompt: string;
  results: ExperimentResult[];
}

interface SummaryResponse {
  totalExperiments: number;
  totalResponses: number;
  averageCoherence: number;
}

router.get('/summary', (req: Request, res: Response<SummaryResponse>) => {
  const experiments: Experiment[] = loadExperiments();
  const totalExperiments = experiments.length;

  const totalResponses = experiments.reduce(
    (sum, e) => sum + (e.results?.length || 0),
    0
  );

  let totalCoherence = 0;
  let totalMetricsCount = 0;

  experiments.forEach((exp) => {
    exp.results.forEach((r) => {
      if (r.metrics?.coherence !== undefined) {
        totalCoherence += r.metrics.coherence;
        totalMetricsCount++;
      }
    });
  });

  const averageCoherence = totalMetricsCount
    ? totalCoherence / totalMetricsCount
    : 0;

  res.json({
    totalExperiments,
    totalResponses,
    averageCoherence,
  });
});

export default router;
