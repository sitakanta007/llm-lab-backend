# LLM Backend

## Features
- Fast Express.js server
- CORS enabled for SSR/SEO support
- /api/health endpoint for monitoring
- /api/generate calls real OPENAI LLM API Model / simulates LLM responses with metrics
- /api/experiments and /api/summary support SSR prefetch
- Proper HTTP status codes

## Run
```
npm install
npm run dev
```
Server runs on http://localhost:4000

## Endpoints
- `GET /api/health` → basic health check
- `POST /api/generate` → generate multiple responses
- `GET /api/experiments` → experiment list with pagination support
- `GET /api/experiments/:id` → Single experiment list item details
- `GET /api/summary` → quick stats (cached)
