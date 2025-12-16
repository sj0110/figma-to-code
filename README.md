# Figma AI Generator

This project converts Figma designs into production-ready code using AI and integrates with GitHub for seamless code commits.

## Project Structure

- `backend/` — Node.js Express server, MongoDB, Gemini AI, GitHub integration
- `frontend/` — UI for interacting with the backend, code preview, and commit

## Features
- Extract Figma frame data and store in MongoDB
- Generate code using Gemini AI (Next.js, React, or Vue)
- Commit generated code directly to a GitHub repository
- Project and frame management

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB
- Figma API access
- Google Gemini API key
- GitHub personal access token

### Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/your-username/figma-ai-generator.git
   cd figma-ai-generator
   ```
2. Install dependencies for both backend and frontend:
   ```sh
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. Create a `.env` file in `backend/` with the following:
   ```env
   MONGODB_URI=your_mongodb_uri
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Start MongoDB if not already running.
5. Start the backend server:
   ```sh
   cd backend
   npm run dev
   # or
   node server.js
   ```
6. Open the frontend (`frontend/ui.html`) in your browser or integrate with your Figma plugin.

## Usage
- Extract frames from Figma and generate code via the UI.
- Review and commit code to your GitHub repository.

## Environment Variables
- See `.env.example` for required variables.

## License
MIT
