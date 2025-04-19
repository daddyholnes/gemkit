// MCP Setup
// Initializes and configures the MCP server manager
// This is the main public entry point for MCP services

const mcpServerManager = require('./mcpServerManager');

// Import server types
const OpenAiServer = require('./servers/openAiServer');
const AnthropicServer = require('./servers/anthropicServer');
const VertexAiServer = require('./servers/vertexAiServer');

// Register server types with unique identifiers
mcpServerManager.registerServerType('openai', OpenAiServer);
mcpServerManager.registerServerType('anthropic', AnthropicServer);
mcpServerManager.registerServerType('vertexai', VertexAiServer);

/**
 * Create default servers with environment-based configuration
 * This sets up common server configurations but doesn't expose API keys
 */
function setupDefaultServers() {
  // Only create servers if they don't already exist
  if (!mcpServerManager.hasServer('openai-default')) {
    mcpServerManager.createServer('openai-default', 'openai');
  }
  
  if (!mcpServerManager.hasServer('anthropic-default')) {
    mcpServerManager.createServer('anthropic-default', 'anthropic');
  }
  
  if (!mcpServerManager.hasServer('vertexai-default')) {
    mcpServerManager.createServer('vertexai-default', 'vertexai');
  }
}

/**
 * Get the best available server for a specific model
 * This handles routing to the appropriate server based on the model ID
 * without exposing implementation details
 * 
 * @param {string} modelId - The model to find a server for
 * @param {boolean} autoConnect - Whether to automatically connect the server
 * @returns {Promise<Object>} The server instance
 */
async function getServerForModel(modelId, autoConnect = true) {
  // Ensure default servers are set up
  setupDefaultServers();
  
  // Map of model prefixes to server IDs
  const modelServerMap = {
    'gpt-': 'openai-default',
    'claude-': 'anthropic-default',
    'gemini-': 'vertexai-default',
    'text-embedding-ada': 'openai-default',
    'text-embedding-3': 'openai-default',
    'text-embedding-gecko': 'vertexai-default'
  };
  
  // Find the appropriate server based on model prefix
  let serverId = null;
  for (const [prefix, id] of Object.entries(modelServerMap)) {
    if (modelId.startsWith(prefix)) {
      serverId = id;
      break;
    }
  }
  
  // Default to OpenAI if no match found
  if (!serverId) {
    serverId = 'openai-default';
  }
  
  const server = mcpServerManager.getServer(serverId);
  
  // Connect if not already connected and autoConnect is true
  if (autoConnect && !server.isConnected) {
    await server.connect();
  }
  
  return server;
}

// Public API - only expose what's necessary
module.exports = {
  // Get all server information
  getServersInfo: () => mcpServerManager.getServersInfo(),
  
  // Create a custom server with a specific configuration
  createCustomServer: (id, type, config) => mcpServerManager.createServer(id, type, config),
  
  // Get a server by ID
  getServer: (id) => mcpServerManager.getServer(id),
  
  // Get the appropriate server for a model
  getServerForModel,
  
  // Initialize default servers
  setupDefaultServers,
  
  // Connect all servers
  connectAll: () => mcpServerManager.connectAll(),
  
  // Disconnect all servers
  disconnectAll: () => mcpServerManager.disconnectAll()
}; 