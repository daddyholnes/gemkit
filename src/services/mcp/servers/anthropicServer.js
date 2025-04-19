// Anthropic MCP Server Implementation
const MCPServerBase = require('./mcpServerBase');
const { Anthropic } = require('@anthropic-ai/sdk');

class AnthropicServer extends MCPServerBase {
  constructor(config = {}) {
    const defaultConfig = {
      name: 'Anthropic Server',
      version: '1.0.0',
      supportedModels: [
        'claude-3-opus-20240229',
        'claude-3-sonnet-20240229',
        'claude-3-haiku-20240307',
        'claude-2.1',
        'claude-2.0',
        'claude-instant-1.2'
      ],
      apiKey: process.env.ANTHROPIC_API_KEY
    };

    super({ ...defaultConfig, ...config });
    this.client = null;
  }

  /**
   * Connect to the Anthropic service
   * @returns {Promise<boolean>} Connection status
   */
  async connect() {
    try {
      if (!this.config.apiKey) {
        throw new Error('Anthropic API key is not provided');
      }
      
      // Initialize the Anthropic client
      this.client = new Anthropic({
        apiKey: this.config.apiKey
      });
      
      this.isConnected = true;
      this.connectionDetails = {
        timestamp: new Date().toISOString()
      };
      
      return true;
    } catch (error) {
      console.error('Error connecting to Anthropic:', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Disconnect from the Anthropic service
   * @returns {Promise<boolean>} Disconnection status
   */
  async disconnect() {
    // There's no explicit disconnect for Anthropic client
    // but we can reset our internal state
    this.client = null;
    this.isConnected = false;
    this.connectionDetails = null;
    
    return true;
  }

  /**
   * Generate text using Anthropic models
   * @param {Object} params - Generation parameters
   * @param {string} params.model - Model to use (e.g., 'claude-3-opus-20240229')
   * @param {string|Object} params.prompt - Text prompt or messages array
   * @param {Object} params.options - Generation options (temperature, etc.)
   * @returns {Promise<Object>} Generation result
   */
  async generateText({ model = 'claude-3-sonnet-20240229', prompt, options = {} }) {
    if (!this.isConnected) {
      throw new Error('Not connected to Anthropic. Call connect() first.');
    }

    if (!this.supportsModel(model)) {
      throw new Error(`Model ${model} is not supported by this server.`);
    }

    try {
      // Determine if prompt is a string or messages array
      let messages;
      if (Array.isArray(prompt)) {
        messages = this.formatMessages(prompt);
      } else {
        messages = [{ role: 'user', content: prompt }];
      }
      
      const completion = await this.client.messages.create({
        model: model,
        messages: messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1024,
        top_p: options.topP,
        top_k: options.topK,
        stream: false
      });
      
      return {
        text: completion.content[0].text,
        model: model,
        usage: {
          promptTokens: completion.usage.input_tokens,
          completionTokens: completion.usage.output_tokens,
          totalTokens: completion.usage.input_tokens + completion.usage.output_tokens
        },
        finishReason: completion.stop_reason,
        raw: completion
      };
    } catch (error) {
      console.error('Error generating text with Anthropic:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings using Anthropic models - NOT SUPPORTED
   * This is a placeholder for when Anthropic adds embedding support
   */
  async generateEmbeddings() {
    throw new Error('Embedding generation is not supported by Anthropic models');
  }
  
  /**
   * Format messages for Claude in their specific format
   * @param {Array} messages - Array of message objects
   * @returns {Array} Formatted messages for Claude API
   */
  formatMessages(messages) {
    return messages.map(msg => {
      // Map OpenAI-style roles to Anthropic roles
      let role = msg.role;
      if (role === 'system') {
        // Claude uses a special format for system messages
        return { role: 'user', content: `<system>${msg.content}</system>` };
      }
      if (role === 'assistant') {
        return { role: 'assistant', content: msg.content };
      }
      // Default to user
      return { role: 'user', content: msg.content };
    });
  }
}

module.exports = AnthropicServer; 