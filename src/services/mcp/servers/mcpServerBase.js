// MCP Server Base Class
// This is the foundation for all Model Control Protocol servers

class MCPServerBase {
  constructor(config = {}) {
    this.config = {
      name: 'Base MCP Server',
      version: '1.0.0',
      supportedModels: [],
      ...config
    };
    this.isConnected = false;
    this.connectionDetails = null;
  }

  /**
   * Connect to the MCP server
   * @returns {Promise<boolean>} Connection status
   */
  async connect() {
    // This should be implemented by child classes
    throw new Error('Method connect() must be implemented by child classes');
  }

  /**
   * Disconnect from the MCP server
   * @returns {Promise<boolean>} Disconnection status
   */
  async disconnect() {
    // This should be implemented by child classes
    throw new Error('Method disconnect() must be implemented by child classes');
  }

  /**
   * Check if the server supports a specific model
   * @param {string} modelId - The model identifier to check
   * @returns {boolean} Whether the model is supported
   */
  supportsModel(modelId) {
    return this.config.supportedModels.includes(modelId);
  }

  /**
   * Generate text from the model
   * @param {Object} params - Generation parameters
   * @returns {Promise<Object>} Generation result
   */
  async generateText(params) {
    // This should be implemented by child classes
    throw new Error('Method generateText() must be implemented by child classes');
  }

  /**
   * Generate embeddings from the model
   * @param {Object} params - Embedding parameters
   * @returns {Promise<Object>} Embedding result
   */
  async generateEmbeddings(params) {
    // This should be implemented by child classes
    throw new Error('Method generateEmbeddings() must be implemented by child classes');
  }

  /**
   * Get server status information
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      name: this.config.name,
      version: this.config.version,
      isConnected: this.isConnected,
      supportedModels: this.config.supportedModels,
      connectionDetails: this.connectionDetails
    };
  }
}

module.exports = MCPServerBase; 