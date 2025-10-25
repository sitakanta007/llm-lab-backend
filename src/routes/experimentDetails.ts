import express, { Request, Response } from 'express';
import { loadExperiments, Experiment } from '../services/experimentStore.js';

const router = express.Router();

/** Request params for /experiments/:id */
interface ExperimentParams {
  id: string;
}

/** Response shape for a single experiment */
interface ExperimentResponse {
  experiment: Experiment;
}

/** Error response shape (optional but good practice) */
interface ErrorResponse {
  error: string;
}

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
