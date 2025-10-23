import express from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import {
  loadExperiments,
  createExperiment,
} from '../services/experimentStore.js';

const router = express.Router();
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL;
const OPENROUTER_URL = process.env.OPENROUTER_URL;

/**
 * POST /api/experiments
 * Save experiment to file
 */
router.post('/experiments', (req, res) => {
  try {
    const { prompt, results } = req.body;
    if (!prompt || !Array.isArray(results)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const newExperiment = createExperiment({ prompt, results });
    res.status(201).json({ id: newExperiment.id });
  } catch (err) {
    console.error('POST /experiments error:', err);
    res.status(500).json({ error: 'Failed to save experiment' });
  }
});

/**
 * POST /api/generate
 * Generate responses and call createExperiment() directly
 */
/*
router.post('/generate', async (req, res) => {
  try {
    const { prompt, combinations } = req.body;

    if (!prompt || !Array.isArray(combinations)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Mock generation (replace with real LLM call if needed)
    const results = combinations.map((params, index) => {
      const text = `Mock response ${index + 1} for "${prompt}" 
temp=${params.temperature}, top_p=${params.top_p}, coherence=${params.coherence}`;

      const coherence = Math.min(
        1,
        Math.max(0, params.coherence + (Math.random() - 0.5) * 0.1)
      );

      return {
        id: uuidv4(),
        text,
        params,
        metrics: {
          coherence: Number(coherence.toFixed(3)),
          length: text.length,
        },
      };
    });

    // Directly call the service function (no router tricks)
    const newExperiment = createExperiment({ prompt, results });

    res.status(201).json({
      experimentId: newExperiment.id,
      results,
    });
  } catch (err) {
    console.error('POST /generate error:', err);
    res.status(500).json({ error: 'Failed to generate responses' });
  }
});*/

// Generate endpoint
router.post('/generate', async (req, res) => {
  const { prompt, combinations } = req.body;

  if (!prompt || !Array.isArray(combinations)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  try {
    const results = [];

    for (const combo of combinations) {
      const { temperature, top_p, coherence } = combo;

      const response = await axios.post(
        process.env.OPENROUTER_URL,
        {
          model: process.env.OPENROUTER_MODEL,
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature,
          top_p
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.APP_ORIGIN,
            'X-Title': 'LLM Parameter Experiment Tool'
          }
        }
      );

      const text = response.data?.choices?.[0]?.message?.content ?? '';
      const coherenceMetric = coherenceScore(text);

      results.push({
        id: uuidv4(),
        text,
        params: { temperature, top_p, coherence },
        metrics: {
          coherence: coherenceMetric,
          length: text.length
        }
      });
    }

    res.json({ results });

  } catch (err) {
    console.error('OpenRouter error:', err?.response?.data || err.message);
    res.status(500).json({
      error: err?.response?.data?.error?.message || 'LLM API call failed'
    });
  }
});

/**
 * GET /api/experiments
 */
router.get('/experiments', (req, res) => {
  const { q = '', limit = 20, offset = 0 } = req.query;
  const experiments = loadExperiments();

  const filtered = experiments.filter((exp) =>
    exp.prompt.toLowerCase().includes(q.toLowerCase())
  );

  const start = parseInt(offset, 10);
  const end = start + parseInt(limit, 10);
  const paginated = filtered.slice(start, end);

  const minimal = paginated.map((exp) => ({
    id: exp.id,
    prompt: exp.prompt,
    createdAt: exp.createdAt,
    total: exp.results?.length ?? 0,
  }));

  res.json({
    total: filtered.length,
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
    experiments: minimal,
  });
});

/**
 * GET /api/experiments/:id
 */
router.get('/experiments/:id', (req, res) => {
  const { id } = req.params;
  const experiments = loadExperiments();
  const exp = experiments.find((e) => e.id === id);

  if (!exp) return res.status(404).json({ error: 'Experiment not found' });
  res.json(exp);
});

/**
 * GET /api/summary
 */
router.get('/summary', (req, res) => {
  const experiments = loadExperiments();
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

  const avgCoherence =
    totalMetricsCount > 0 ? totalCoherence / totalMetricsCount : 0;

  res.json({
    totalExperiments,
    totalResponses,
    avgCoherence: Number(avgCoherence.toFixed(3)),
  });
});

/**
 * GET /api/health
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Example custom metric: coherence (simple heuristic)
function coherenceScore(text) {
  if (!text) return 0;
  const sentences = text.split(/[.!?]/).filter(Boolean);
  const avgLength = sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) / sentences.length;
  // crude heuristic: mid-length, lower variance -> higher score
  const score = Math.min(1, Math.max(0, avgLength / 30));
  return Number(score.toFixed(3));
}

export default router;
