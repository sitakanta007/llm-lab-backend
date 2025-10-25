import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import yaml from 'yamljs'; // or 'yaml'
import fs from 'fs';

const swaggerPath = path.resolve(process.cwd(), 'src/swagger/swagger.yaml');
const file = fs.readFileSync(swaggerPath, 'utf8');
const swaggerDocument = yaml.parse(file);

swaggerDocument.servers = [
  {
    url: process.env.APP_BACKEND || 'http://localhost:4000/api',
  },
];

export { swaggerDocument };




