import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DATA_FILE = path.join(process.cwd(), 'data', 'experiments.json');

export function loadExperiments() {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading experiments file:', err);
    return [];
  }
}

export function saveExperiments(data) {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving experiments file:', err);
  }
}

export function createExperiment({ prompt, results }) {
  const experiments = loadExperiments();
  const newExperiment = {
    id: uuidv4(),
    prompt,
    createdAt: new Date().toISOString(),
    results,
  };
  experiments.unshift(newExperiment);
  saveExperiments(experiments);
  return newExperiment;
}
