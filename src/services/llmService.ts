import axios, { AxiosResponse } from 'axios';
import pLimit from 'p-limit';
import { v4 as uuidv4 } from 'uuid';
import { evaluateResponse, Metrics } from '../utils/metrics.js';

export interface ComboParams {
  temperature?: number;
  top_p?: number;
  [key: string]: number | string | undefined;
}

export interface LLMResult {
  id: string;
  text: string;
  params: ComboParams;
  metrics: Metrics;
}

export interface LLMAPIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    finish_reason: string;
    message?: {
      role: string;
      content: string;
    };
    text?: string;
  }>;
}

const CONCURRENCY_LIMIT = Number(process.env.CONCURRENCY_LIMIT) || 5;
const MAX_COMBINATIONS = Number(process.env.MAX_COMBINATIONS) || 13;
const MAX_RETRIES = Number(process.env.MAX_RETRIES) || 2;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockPhrases = [
  "I think you need to do a google search on {prompt} - for {params}",
  "Are you asking me {prompt}?  - for {params}",
  "Why don't you bing search about {prompt} - for {params}",
  "I don't like the topic which you are asking about {prompt} - for {params}",
  "There are enough books to explain you about {prompt} - for {params}",
  "No one can make you understand about {prompt} - for {params}",
  "You need to skip this particular topic about {prompt} - for {params}"
];

function formatParams(params: Record<string, any>): string {
  return Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join(', ');
}

function getRandomMockText(prompt: string, params: Record<string, any>) {
  const phrase = mockPhrases[Math.floor(Math.random() * mockPhrases.length)];
  return phrase
    .replace("{prompt}", prompt)
    .replace("{params}", formatParams(params));
}

async function callOpenRouterWithRetry(prompt: string, params: any, index: number): Promise<LLMResult> {
  let attempt = 0;
  let lastError: any = null;

  while (attempt <= MAX_RETRIES) {
    try {
      console.log(`[generateRealResults] Combo ${index + 1} - Attempt ${attempt + 1}`);

      const response = await axios.post(
        process.env.OPENROUTER_URL!,
        {
          model: process.env.OPENROUTER_MODEL,
          messages: [{ role: 'user', content: prompt }],
          ...params
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 20000
        }
      );

      const text = response.data?.choices?.[0]?.message?.content || '';
      const metrics = evaluateResponse(text); 

      console.log(`[generateRealResults] Combo ${index + 1} succeeded on attempt ${attempt + 1}`);
      return {
        id: uuidv4(),
        text,
        params,
        metrics
      };
    } catch (error: any) {
      lastError = error;
      console.error(`[generateRealResults] Combo ${index + 1} failed on attempt ${attempt + 1}:`, error.message);

      if (attempt < MAX_RETRIES) {
        const delay = (attempt + 1) * 1000;
        console.log(`[generateRealResults] Retrying Combo ${index + 1} after ${delay}ms`);
        await sleep(delay);
      }
    }
    attempt++;
  }

  console.error(`[generateRealResults] Combo ${index + 1} failed after ${MAX_RETRIES + 1} attempts`);
  const fallbackText = `[ERROR: Failed to fetch response after ${MAX_RETRIES + 1} attempts]`;
  return {
    id: uuidv4(),
    text: fallbackText,
    params,
    metrics: evaluateResponse(fallbackText) // still returns metrics for error too
  };
}

export function logParameterKeys(combinations: ComboParams[]): void {
  if (!Array.isArray(combinations) || combinations.length === 0) return;
  const allKeys = new Set<string>();
  combinations.forEach((combo) => {
    Object.keys(combo).forEach((k) => allKeys.add(k));
  });
  console.log(`Parameter keys for this experiment: [${Array.from(allKeys).join(', ')}]`);
}

export async function generateRealResults(
  prompt: string,
  combinations: Record<string, any>[]
): Promise<LLMResult[]> {
  console.log('[generateRealResults] Total requested combos:', combinations.length);

  const cappedCombinations = combinations.slice(0, MAX_COMBINATIONS);
  if (combinations.length > MAX_COMBINATIONS) {
    console.log(`[generateRealResults] | Cap applied: Only ${MAX_COMBINATIONS} combos will be processed`);
  }

  const limit = pLimit(CONCURRENCY_LIMIT);
  const tasks = cappedCombinations.map((params, index) =>
    limit(() => callOpenRouterWithRetry(prompt, params, index))
  );

  const results = await Promise.all(tasks);
  console.log(`[generateRealResults] | Completed ${results.length} combinations`);
  return results;
}

export async function generateMockResults(
  prompt: string,
  combinations: Record<string, any>[]
): Promise<LLMResult[]> {
  return combinations.slice(0, MAX_COMBINATIONS).map((params) => {
    const text = getRandomMockText(prompt, params);
    const metrics = evaluateResponse(text); // integrate metrics into mock api as well
    return {
      id: uuidv4(),
      text,
      params,
      metrics
    };
  });
}
