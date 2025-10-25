import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { LLMResult } from './llmService.js';

export interface Experiment {
  id: string;
  prompt: string;
  results: LLMResult[];
  createdAt: string;
}

const DATA_DIR: string = path.join(process.cwd(), 'data');
const EXPERIMENTS_FILE: string = path.join(DATA_DIR, 'experiments.json');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(EXPERIMENTS_FILE)) {
    fs.writeFileSync(EXPERIMENTS_FILE, '[]', 'utf-8');
  }
}

export function loadExperiments(): Experiment[] {
  ensureDataDir();
  try {
    const data: string = fs.readFileSync(EXPERIMENTS_FILE, 'utf-8');
    return JSON.parse(data) as Experiment[];
  } catch (error) {
    console.error('Error reading experiments file:', error);
    return [];
  }
}

export function saveExperiments(experiments: Experiment[]): void {
  ensureDataDir();
  fs.writeFileSync(EXPERIMENTS_FILE, JSON.stringify(experiments, null, 2), 'utf-8');
}

export function createExperiment(data: { prompt: string; results: LLMResult[] }): Experiment {
  const experiments = loadExperiments();
  const newExperiment: Experiment = {
    id: uuidv4(),
    prompt: data.prompt,
    results: data.results,
    createdAt: new Date().toISOString(),
  };
  experiments.unshift(newExperiment);
  saveExperiments(experiments);
  return newExperiment;
}

export function getExperimentById(id: string): Experiment | undefined {
  const experiments = loadExperiments();
  return experiments.find((exp) => exp.id === id);
}
