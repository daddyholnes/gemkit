# AI Studio Hub

A comprehensive multi-LLM chat application with agent capabilities, persistent memory, and a sandbox for AI experimentation.

## Features

- **Multi-LLM Chat**: Chat with multiple large language models (Gemini, Claude, GPT-4, etc.)
- **Agent Lab**: Create and test custom AI agents with visual programming
- **Persistent Memory**: Save conversations and context for long-term AI relationships
- **Code Sandbox**: Experiment with different models and workflows
- **Visual Workflow Builder**: Create, edit, and run workflows visually

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Google Cloud project with enabled APIs (Vertex AI)
- API keys for OpenAI, Anthropic, and Google Gemini

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/ai-studio-hub.git
cd ai-studio-hub
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp env.example .env.local
```
Edit `.env.local` with your API keys and configuration.

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
ai-studio-hub/
├── public/          # Static assets
├── src/
│   ├── app/         # Next.js app router
│   ├── components/  # React components
│   ├── services/    # Service layer (API, LLM, etc.)
│   └── utils/       # Utility functions
└── ...
```

## Technologies Used

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Node.js, Express (API routes)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **AI/ML**: Vertex AI, OpenAI, Anthropic, etc.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 