# MCP - Model Control Protocol

MCP is a unified interface for working with various LLM providers including OpenAI, Anthropic, and Google's Vertex AI. It provides a consistent API while abstracting away the differences between these services.

## Features

- **Unified API** - Work with different LLM providers using a consistent interface
- **Automatic Model Routing** - Automatically selects the right provider based on model ID
- **Memory Enhancement** - Optional memory features for more contextual interactions
- **Emotional Context** - Tracks emotional states across conversations for more empathetic responses

## Setup

First, add your API keys to your environment:

```
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_CLOUD_PROJECT=your_gcp_project
GOOGLE_CLOUD_LOCATION=us-central1
```

## Basic Usage

```javascript
// Import the enhanced service
const mcpService = require('./services/mcp/memoryEnhancedService');

// Simple text generation
async function generateResponse() {
  const response = await mcpService.generateText({
    modelId: 'gpt-4', // Use OpenAI's GPT-4
    prompt: 'Tell me a short story about robots.',
    options: {
      temperature: 0.7,
      maxTokens: 300
    }
  });
  
  console.log(response.text);
}

// Memory-enhanced generation (requires userId)
async function generatePersonalizedResponse(userId) {
  const response = await mcpService.generateText({
    userId,
    modelId: 'claude-3-opus-20240229', // Use Anthropic's Claude
    prompt: 'How am I feeling today?',
    options: {
      temperature: 0.8
    }
  });
  
  console.log(response.text);
  console.log('Memory applied:', response.memory.emotionalContextApplied);
}

// Generate embeddings
async function generateEmbedding() {
  const embedding = await mcpService.generateEmbeddings({
    modelId: 'text-embedding-ada-002',
    text: 'This is a sample text to embed.'
  });
  
  console.log(`Generated ${embedding.embeddings[0].length}-dimensional vector`);
}
```

## Message-Based API

You can also use the OpenAI-style messages format:

```javascript
const response = await mcpService.generateText({
  userId: 'user123',
  modelId: 'gemini-pro', // Use Google's Gemini Pro
  prompt: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'What are the planets in our solar system?' }
  ]
});
```

## Advanced Usage - Direct MCP Access

If you need more control, you can use the MCP setup directly:

```javascript
const mcp = require('./services/mcp/mcpSetup');

// Create a custom server with specific settings
mcp.createCustomServer('my-openai', 'openai', {
  apiKey: process.env.ANOTHER_OPENAI_KEY
});

// Get a server directly
const server = mcp.getServer('my-openai');
await server.connect();

// Generate text directly with the server
const result = await server.generateText({
  model: 'gpt-4',
  prompt: 'Hello, world!',
  options: { temperature: 0.5 }
});
```

## License

This software is licensed under the AGPL license. See LICENSE file for details. 