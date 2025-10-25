import { configure } from '@vendia/serverless-express';
import app  from './index.js';

export const handler = configure({ app });
