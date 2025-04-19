// Vertex AI MCP Server Implementation
const MCPServerBase = require('./mcpServerBase');
const { VertexAI } = require('@google-cloud/vertexai');

class VertexAiServer extends MCPServerBase {
  constructor(config = {}) {
    const defaultConfig = {
      name: 'Vertex AI Server',
      version: '1.0.0',
      supportedModels: [
        'gemini-pro',
        'gemini-pro-vision',
        'text-embedding-gecko'
      ],
      project: process.env.GOOGLE_CLOUD_PROJECT,
      location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
    };

    super({ ...defaultConfig, ...config });
    this.vertexAi = null;
    this.generativeModel = null;
  }

  /**
   * Connect to the Vertex AI service
   * @returns {Promise<boolean>} Connection status
   */
  async connect() {
    try {
      // Initialize the VertexAI object
      this.vertexAi = new VertexAI({
        project: this.config.project,
        location: this.config.location,
      });

      this.isConnected = true;
      this.connectionDetails = {
        project: this.config.project,
        location: this.config.location,
        timestamp: new Date().toISOString()
      };
      
      return true;
    } catch (error) {
      console.error('Error connecting to Vertex AI:', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Disconnect from the Vertex AI service
   * @returns {Promise<boolean>} Disconnection status
   */
  async disconnect() {
    // There's no explicit disconnect for Vertex AI client
    // but we can reset our internal state
    this.vertexAi = null;
    this.generativeModel = null;
    this.isConnected = false;
    this.connectionDetails = null;
    
    return true;
  }

  /**
   * Generate text using Vertex AI models
   * @param {Object} params - Generation parameters
   * @param {string} params.model - Model to use (e.g., 'gemini-pro')
   * @param {string|Object} params.prompt - Text prompt or structured prompt
   * @param {Object} params.options - Generation options (temperature, etc.)
   * @returns {Promise<Object>} Generation result
   */
  async generateText({ model = 'gemini-pro', prompt, options = {} }) {
    if (!this.isConnected) {
      throw new Error('Not connected to Vertex AI. Call connect() first.');
    }

    if (!this.supportsModel(model)) {
      throw new Error(`Model ${model} is not supported by this server.`);
    }

    try {
      // Get the generative model
      const generativeModel = this.vertexAi.preview.getGenerativeModel({
        model: model,
        generationConfig: {
          temperature: options.temperature || 0.7,
          topP: options.topP || 0.8,
          topK: options.topK || 40,
          maxOutputTokens: options.maxTokens || 1024,
        },
      });

      // Generate content
      const result = await generativeModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const response = result.response;
      return {
        text: response.candidates[0].content.parts[0].text,
        model: model,
        usage: {
          promptTokens: -1, // Vertex doesn't provide token counts directly
          completionTokens: -1,
          totalTokens: -1
        },
        finishReason: response.candidates[0].finishReason,
        raw: response
      };
    } catch (error) {
      console.error('Error generating text with Vertex AI:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings using Vertex AI models
   * @param {Object} params - Embedding parameters
   * @param {string} params.model - Model to use (e.g., 'text-embedding-gecko')
   * @param {string|string[]} params.text - Text to embed
   * @param {Object} params.options - Embedding options
   * @returns {Promise<Object>} Embedding result
   */
  async generateEmbeddings({ model = 'text-embedding-gecko', text, options = {} }) {
    if (!this.isConnected) {
      throw new Error('Not connected to Vertex AI. Call connect() first.');
    }

    if (!this.supportsModel(model)) {
      throw new Error(`Model ${model} is not supported by this server.`);
    }

    try {
      // For embeddings, we use a different API
      const embeddingModel = this.vertexAi.getModel(model);
      
      // Handle both single string and array of strings
      const textInput = Array.isArray(text) ? text : [text];
      
      const embeddingRequest = {
        instances: textInput.map(t => ({ content: t })),
      };
      
      const [response] = await embeddingModel.predict(embeddingRequest);
      
      return {
        embeddings: response.predictions.map(p => p.embeddings.values),
        model: model,
        usage: {
          totalTokens: -1, // Vertex doesn't provide token counts directly
        },
        raw: response
      };
    } catch (error) {
      console.error('Error generating embeddings with Vertex AI:', error);
      throw error;
    }
  }
}

module.exports = VertexAiServer; 