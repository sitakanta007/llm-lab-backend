LLM Lab – Backend

A lightweight and modular backend service powering the LLM Lab application.
Built with Node.js, Express, and TypeScript, this service provides structured APIs for generating, storing, and analyzing LLM experiment outputs.

🚀 Features

⚡ RESTful API endpoints for experiment generation and retrieval

🧱 Clean layered architecture (Routes, Services, Utils)

📜 Swagger API documentation

🩺 Health check & logging for monitoring

🌐 Deployment ready (EC2 + Route 53)

🛠️ Tech Stack

Language: TypeScript

Framework: Node.js + Express

Documentation: Swagger

Data Storage: JSON-based (lightweight)

Deployment: AWS EC2, Route 53

⚙️ Setup Instructions
# 1. Clone the repository
git clone https://github.com/your-username/llm-lab-backend.git

# 2. Navigate to the project directory
cd llm-lab-backend

# 3. Install dependencies
npm install

# 4. Add environment variables
# Example:
# PORT=4000
# BASE_URL=http://localhost:4000

# 5. Build and start the server
npm run build
npm run start


📝 Recommended Node version: 18.x or above

🧭 Architecture Overview

Routes Layer: Handles API endpoint definitions and routing

Services Layer: Business logic (e.g., LLM integration, experiment handling)

Utils Layer: Helper functions and reusable logic

Swagger Layer: API documentation (OpenAPI spec)

llm-lab-backend/
├── src/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── swagger/
│   └── server.ts
└── dist/

📡 API Endpoints
Method	Endpoint	Description
GET	/api/health	Health check
POST	/api/generate	Generate experiment results
GET	/api/experiments	List saved experiments
GET	/api/experiments/:id	Get experiment details
GET	/api/summary	Aggregate statistics
🧰 Deployment

Build the project using:

npm run build


Deploy the contents of the dist/ folder to AWS EC2 or any Node hosting service.

Configure environment variables securely on the server.

Optionally set up Amazon Route 53 for subdomain routing.

📈 Logging & Monitoring

All logs are stored in server.log

/health endpoint is available for uptime checks

Swagger UI for interactive API testing