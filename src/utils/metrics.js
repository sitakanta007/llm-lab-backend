export function evaluateResponse(text) {
  // Simple fake metrics to mimic quality analysis
  const length = text.length;
  const coherence = Math.min(1, Math.max(0, 0.4 + (length % 60) / 100));
  const lexical = Math.min(1, Math.random());
  const lengthFit = Math.min(1, Math.abs(length % 120) / 120);
  const redundancy = Math.min(1, Math.random() * 0.5);

  return {
    coherence,
    lexical,
    lengthFit,
    redundancy,
  };
}
