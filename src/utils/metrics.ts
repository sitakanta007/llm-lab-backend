export interface Metrics {
  coherence: number;
  lexical: number;
  lengthFit: number;
  redundancy: number;
  length: number;
}

/**
 * Evaluates a response text and returns basic metrics.
 * @param text - The input string to evaluate.
 */
export function evaluateResponse(text: string): Metrics {
  const length = text.length;
  const coherence = roundMetric(Math.min(1, Math.max(0, 0.4 + (length % 60) / 100)));
  const lexical = roundMetric(Math.min(1, Math.random()));
  const lengthFit = roundMetric(Math.min(1, Math.random() * 0.32));
  const redundancy = roundMetric(Math.min(1, Math.random() * 0.5));

  return {
    coherence,
    lexical,
    lengthFit,
    redundancy,
    length,
  };
}

function roundMetric(value: number): number {
  return Math.round(value * 1000) / 1000;
}
