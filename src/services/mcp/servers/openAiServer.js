// OpenAI MCP Server Implementation
const MCPServerBase = require('./mcpServerBase');
const { OpenAI } = require('openai');

class OpenAiServer extends MCPServerBase {
  constructor(config = {}) {
    const defaultConfig = {
      name: 'OpenAI Server',
      version: '1.0.0',
      supportedModels: [
        'gpt-3.5-turbo',
        'gpt-4',
        'gpt-4-turbo',
        'gpt-4o',
        'text-embedding-ada-002',
        'text-embedding-3-small',
        'text-embedding-3-large'
      ],
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORGANIZATION
    };

    super({ ...defaultConfig, ...config });
    this.client = null;
  }

  /**
   * Connect to the OpenAI service
   * @returns {Promise<boolean>} Connection status
   */
  async connect() {
    try {
      if (!this.config.apiKey) {
        throw new Error('OpenAI API key is not provided');
      }
      
      // Initialize the OpenAI client
      this.client = new OpenAI({
        apiKey: this.config.apiKey,
        organization: this.config.organization
      });
      
      // Validate connection with a simple models list request
      await this.client.models.list();
      
      this.isConnected = true;
      this.connectionDetails = {
        hasOrganization: !!this.config.organization,
        timestamp: new Date().toISOString()
      };
      
      return true;
    } catch (error) {
      console.error('Error connecting to OpenAI:', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Disconnect from the OpenAI service
   * @returns {Promise<boolean>} Disconnection status
   */
  async disconnect() {
    // There's no explicit disconnect for OpenAI client
    // but we can reset our internal state
    this.client = null;
    this.isConnected = false;
    this.connectionDetails = null;
    
    return true;
  }

  /**
   * Generate text using OpenAI models
   * @param {Object} params - Generation parameters
   * @param {string} params.model - Model to use (e.g., 'gpt-4')
   * @param {string|Object} params.prompt - Text prompt or messages array
   * @param {Object} params.options - Generation options (temperature, etc.)
   * @returns {Promise<Object>} Generation result
   */
  async generateText({ model = 'gpt-3.5-turbo', prompt, options = {} }) {
    if (!this.isConnected) {
      throw new Error('Not connected to OpenAI. Call connect() first.');
    }

    if (!this.supportsModel(model)) {
      throw new Error(`Model ${model} is not supported by this server.`);
    }

    try {
      // Determine if prompt is a string or messages array
      const messages = Array.isArray(prompt) 
        ? prompt 
        : [{ role: 'user', content: prompt }];
      
      const completion = await this.client.chat.completions.create({
        model: model,
        messages: messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens,
        top_p: options.topP,
        frequency_penalty: options.frequencyPenalty,
        presence_penalty: options.presencePenalty,
        stream: false
      });
      
      return {
        text: completion.choices[0].message.content,
        model: model,
        usage: {
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens
        },
        finishReason: completion.choices[0].finish_reason,
        raw: completion
      };
    } catch (error) {
      console.error('Error generating text with OpenAI:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings using OpenAI models
   * @param {Object} params - Embedding parameters
   * @param {string} params.model - Model to use (e.g., 'text-embedding-ada-002')
   * @param {string|string[]} params.text - Text to embed
   * @param {Object} params.options - Embedding options
   * @returns {Promise<Object>} Embedding result
   */
  async generateEmbeddings({ model = 'text-embedding-ada-002', text, options = {} }) {
    if (!this.isConnected) {
      throw new Error('Not connected to OpenAI. Call connect() first.');
    }

    if (!this.supportsModel(model)) {
      throw new Error(`Model ${model} is not supported by this server.`);
    }

    try {
      // Handle both single string and array of strings
      const textInput = Array.isArray(text) ? text : [text];
      
      const response = await this.client.embeddings.create({
        model: model,
        input: textInput,
        dimensions: options.dimensions
      });
      
      return {
        embeddings: response.data.map(item => item.embedding),
        model: model,
        usage: {
          totalTokens: response.usage.total_tokens
        },
        raw: response
      };
    } catch (error) {
      console.error('Error generating embeddings with OpenAI:', error);
      throw error;
    }
  }
}

module.exports = OpenAiServer; 