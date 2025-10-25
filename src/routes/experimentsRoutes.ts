import express, { Request, Response } from 'express';
import { loadExperiments } from '../services/experimentStore.js';

const router = express.Router();

interface Experiment {
  id: string;
  prompt: string;
  [key: string]: any; // fallback for additional properties
}

interface ExperimentQuery {
  q?: string;
  limit?: string;
  offset?: string;
}

interface ExperimentParams {
  id: string;
}

interface ExperimentResponse {
  experiment: Experiment;
}


interface ErrorResponse {
  error: string;
}

router.get('/experiments', (req: Request<{}, {}, {}, ExperimentQuery>, res: Response) => {
  const { q = '', limit = '20', offset = '0' } = req.query;

  const experiments: Experiment[] = loadExperiments();

  const filtered = experiments.filter((exp: Experiment) =>
    exp.prompt.toLowerCase().includes(q.toLowerCase())
  );

  const start = parseInt(offset, 10);
  const end = start + parseInt(limit, 10);

  const paginated = filtered.slice(start, end);

  res.json({
    total: filtered.length,
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
    data: paginated,
  });
});

/**
 * GET /experiments/:id
 * Fetch a single experiment by ID
 */
router.get(
  '/experiments/:id',
  (req: Request<ExperimentParams>, res: Response<ExperimentResponse | ErrorResponse>) => {
    const { id } = req.params;

    const experiments: Experiment[] = loadExperiments();
    const experiment = experiments.find((exp) => exp.id === id);

    if (!experiment) {
      return res.status(404).json({ error: 'Experiment not found' });
    }

    res.json({ experiment });
  }
);

export default router;
